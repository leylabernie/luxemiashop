import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const compiled = await build({
  entryPoints: ['api/sync-lead.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
});
const mod = { exports: {} };
new Function('module', 'exports', 'require', compiled.outputFiles[0].text)(mod, mod.exports, createRequire(import.meta.url));

const {
  LEAD_TAG,
  DEFAULT_SHOPIFY_ADMIN_API_VERSION,
  DEFAULT_WEBHOOK_TABLES,
  MAX_FIRST_NAME_LENGTH,
  MAX_CUSTOMER_TAGS,
  MAX_TAG_LENGTH,
  safeEqualSecret,
  readSecretHeader,
  resolveApiVersion,
  resolveStoreDomain,
  allowedWebhookTables,
  normalizeEmail,
  sanitizeFirstName,
  resolveMarketingConsent,
  mergeCustomerTags,
  buildCustomerPayload,
  parseSupabaseWebhook,
  syncLeadToShopify,
  redactEmail,
  emailFingerprint,
  default: handler,
} = mod.exports;

const SECRET = 'whsec_test_secret_value';
const TOKEN = 'shpat_test_admin_token';
const EMAIL = 'Bride.Example@Gmail.Com';
const CANONICAL_EMAIL = 'bride.example@gmail.com';

const ENV_KEYS = [
  'SUPABASE_WEBHOOK_SECRET',
  'SHOPIFY_ADMIN_API_TOKEN',
  'SHOPIFY_ADMIN_ACCESS_TOKEN',
  'SHOPIFY_ADMIN_API_VERSION',
  'SHOPIFY_ADMIN_STORE_DOMAIN',
  'SUPABASE_WEBHOOK_TABLES',
  'SYNC_LEAD_DEFAULT_MARKETING_CONSENT',
  'SYNC_LEAD_MARKETING_OPT_IN_LEVEL',
];

/** Run with an explicit environment so host variables cannot leak into a test. */
async function withEnv(vars, run) {
  const saved = {};
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  Object.assign(process.env, vars);
  const logs = [];
  const capture = (level) => (...args) => logs.push([level, args.map(String).join(' ')]);
  const original = { log: console.log, warn: console.warn, error: console.error };
  console.log = capture('log');
  console.warn = capture('warn');
  console.error = capture('error');
  try {
    return { result: await run(), logs };
  } finally {
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}

const configuredEnv = (extra = {}) => ({
  SUPABASE_WEBHOOK_SECRET: SECRET,
  SHOPIFY_ADMIN_API_TOKEN: TOKEN,
  ...extra,
});

function mockRes() {
  return {
    statusCode: null,
    body: undefined,
    headers: {},
    setHeader(name, value) { this.headers[String(name).toLowerCase()] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    send(payload) { this.body = payload; return this; },
    end(payload) { if (payload !== undefined) this.body = payload; return this; },
  };
}

function webhookBody(record = { email: EMAIL }, overrides = {}) {
  return { type: 'INSERT', table: 'email_captures', schema: 'public', record, ...overrides };
}

function mockReq({ method = 'POST', secret = SECRET, body = webhookBody(), headers = {} } = {}) {
  const all = { ...headers };
  if (secret !== null) all['x-supabase-webhook-secret'] = secret;
  return { method, headers: all, body };
}

/** A scripted Shopify double: one response per call, last one repeats. */
function shopifyDouble(script) {
  const calls = [];
  let index = 0;
  const fetchImpl = async (url, options) => {
    calls.push({
      url: String(url),
      method: options.method,
      headers: options.headers,
      body: options.body ? JSON.parse(options.body) : undefined,
    });
    const step = script.length ? script[Math.min(index, script.length - 1)] : { status: 200, body: {} };
    index += 1;
    const status = typeof step === 'number' ? step : (step.status ?? 200);
    const payload = typeof step === 'number' ? {} : (step.body ?? {});
    return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(payload) };
  };
  return { fetchImpl, calls };
}

const searchEmpty = { status: 200, body: { customers: [] } };
const fixedNow = () => new Date('2026-11-25T12:00:00.000Z');

/** Invoke the handler with a stubbed global fetch and a clean environment. */
async function invoke(req, env = configuredEnv(), script = [searchEmpty]) {
  const double = shopifyDouble(script);
  const { result: res, logs } = await withEnv(env, async () => {
    const response = mockRes();
    const original = globalThis.fetch;
    globalThis.fetch = double.fetchImpl;
    try {
      await handler(req, response);
    } finally {
      globalThis.fetch = original;
    }
    return response;
  });
  return { res, logs, calls: double.calls };
}

// ─── 1. Webhook secret authorization ────────────────────────────────────────

test('safeEqualSecret is constant-time and fails closed on odd inputs', () => {
  assert.equal(safeEqualSecret(SECRET, SECRET), true);
  assert.equal(safeEqualSecret('wrong', SECRET), false);
  assert.equal(safeEqualSecret(`${SECRET}x`, SECRET), false, 'a longer value must not throw or match');
  assert.equal(safeEqualSecret('', SECRET), false);
  assert.equal(safeEqualSecret(undefined, SECRET), false);
  assert.equal(safeEqualSecret(null, SECRET), false);
  assert.equal(safeEqualSecret(12345, SECRET), false);
  assert.equal(safeEqualSecret(['a'], SECRET), false);
  assert.equal(safeEqualSecret(SECRET, ''), false, 'an unconfigured secret must never authenticate');
  assert.equal(safeEqualSecret(SECRET, undefined), false);
});

test('readSecretHeader tolerates Vercel header shapes', () => {
  assert.equal(readSecretHeader({ 'x-supabase-webhook-secret': SECRET }), SECRET);
  assert.equal(readSecretHeader({ 'X-Supabase-Webhook-Secret': SECRET }), SECRET);
  assert.equal(readSecretHeader({ 'x-supabase-webhook-secret': [SECRET, 'other'] }), SECRET);
  assert.equal(readSecretHeader({ 'x-supabase-webhook-secret': '   ' }), null);
  assert.equal(readSecretHeader({}), null);
  assert.equal(readSecretHeader(undefined), null);
});

test('a request without the configured secret is rejected before Shopify is touched', async () => {
  const cases = [
    ['missing header', mockReq({ secret: null })],
    ['wrong secret', mockReq({ secret: 'whsec_attacker_guess' })],
    ['blank secret', mockReq({ secret: '' })],
    ['array-injected secret', mockReq({ secret: null, headers: { 'x-supabase-webhook-secret': ['x', SECRET] } })],
    ['truncated secret', mockReq({ secret: SECRET.slice(0, -1) })],
  ];
  for (const [label, req] of cases) {
    const { res, calls, logs } = await invoke(req);
    assert.equal(res.statusCode, 401, `${label} should be 401`);
    assert.equal(calls.length, 0, `${label} must not reach Shopify`);
    assert.ok(!logs.some(([, text]) => text.includes(SECRET)), `${label} leaked the secret into logs`);
  }
});

test('an unconfigured server secret fails closed with 503 instead of accepting', async () => {
  const { res, calls } = await invoke(mockReq(), { SHOPIFY_ADMIN_API_TOKEN: TOKEN });
  assert.equal(res.statusCode, 503);
  assert.equal(calls.length, 0);
});

test('the Shopify Admin token is required and sent as X-Shopify-Access-Token, never a Bearer header', async () => {
  const missing = await invoke(mockReq(), { SUPABASE_WEBHOOK_SECRET: SECRET }, [searchEmpty, { status: 201, body: { customer: { id: 7001 } } }]);
  assert.equal(missing.res.statusCode, 503, 'a missing Admin token must fail closed');
  assert.equal(missing.calls.length, 0);

  const ok = await invoke(mockReq(), configuredEnv(), [searchEmpty, { status: 201, body: { customer: { id: 7002 } } }]);
  assert.equal(ok.res.statusCode, 200);
  assert.ok(ok.calls.length >= 1);
  for (const call of ok.calls) {
    assert.equal(call.headers['X-Shopify-Access-Token'], TOKEN);
    assert.equal(call.headers.Authorization, undefined, 'the Admin API uses the token header, not Authorization');
    assert.equal(call.headers['Content-Type'], 'application/json');
    assert.equal(call.headers.Accept, 'application/json');
  }
});

test('the repository’s existing SHOPIFY_ADMIN_ACCESS_TOKEN is honoured as a fallback', async () => {
  const { res, calls } = await invoke(
    mockReq(),
    { SUPABASE_WEBHOOK_SECRET: SECRET, SHOPIFY_ADMIN_ACCESS_TOKEN: TOKEN },
    [searchEmpty, { status: 201, body: { customer: { id: 7003 } } }],
  );
  assert.equal(res.statusCode, 200);
  assert.equal(calls[0].headers['X-Shopify-Access-Token'], TOKEN);
});

// ─── 2. Method and payload validation ───────────────────────────────────────

test('non-POST methods are refused with an Allow header', async () => {
  for (const method of ['GET', 'PUT', 'DELETE', 'OPTIONS']) {
    const { res, calls } = await invoke(mockReq({ method }));
    assert.equal(res.statusCode, 405, method);
    assert.equal(res.headers.allow, 'POST');
    assert.equal(calls.length, 0);
  }
});

test('parseSupabaseWebhook accepts only INSERTs on a listed table with a usable record', () => {
  const ok = parseSupabaseWebhook(webhookBody({ email: EMAIL, first_name: 'Aisha' }));
  assert.equal(ok.ok, true);
  assert.equal(ok.table, 'email_captures');
  assert.deepEqual(ok.lead, { email: CANONICAL_EMAIL, firstName: 'Aisha', acceptsMarketing: true });

  const failures = [
    [null, 'payload_not_object'],
    ['not json', 'payload_not_object'],
    [[1, 2], 'payload_not_object'],
    [{}, 'unsupported_event_type'],
    [webhookBody({ email: EMAIL }, { type: 'UPDATE' }), 'unsupported_event_type'],
    [webhookBody({ email: EMAIL }, { type: 'DELETE' }), 'unsupported_event_type'],
    [webhookBody({ email: EMAIL }, { type: 42 }), 'unsupported_event_type'],
    [webhookBody({ email: EMAIL }, { table: 'profiles' }), 'unlisted_table'],
    [webhookBody({ email: EMAIL }, { table: 42 }), 'unlisted_table'],
    [webhookBody({ email: EMAIL }, { table: '' }), 'unlisted_table'],
    [{ type: 'INSERT', table: 'email_captures', record: undefined }, 'missing_record'],
    [{ type: 'INSERT', table: 'email_captures', record: 'x' }, 'missing_record'],
    [{ type: 'INSERT', table: 'email_captures', record: [] }, 'missing_record'],
    [webhookBody({}), 'invalid_email'],
    [webhookBody({ email: 42 }), 'invalid_email'],
    [webhookBody({ email: 'not-an-email' }), 'invalid_email'],
    [webhookBody({ email: 'missing@tld' }), 'invalid_email'],
    [webhookBody({ email: `${'a'.repeat(250)}@b.com` }), 'invalid_email'],
    [webhookBody({ email: '   ' }), 'invalid_email'],
  ];
  for (const [payload, reason] of failures) {
    const parsed = parseSupabaseWebhook(payload);
    assert.equal(parsed.ok, false, `${JSON.stringify(payload).slice(0, 60)} should fail`);
    assert.equal(parsed.reason, reason, `${JSON.stringify(payload).slice(0, 60)} → ${parsed.reason}`);
  }
});

test('the requested email_captures table is the default; other tables need an explicit opt-in', () => {
  assert.deepEqual(DEFAULT_WEBHOOK_TABLES, ['email_captures']);
  assert.deepEqual(allowedWebhookTables({}), ['email_captures']);
  // This project has no email_captures table yet: newsletter_subscribers holds
  // the FIRST10 consent and abandoned_carts is transactional, so both must be
  // reachable by configuration instead of a code change.
  assert.deepEqual(
    allowedWebhookTables({ SUPABASE_WEBHOOK_TABLES: 'newsletter_subscribers, abandoned_carts' }),
    ['newsletter_subscribers', 'abandoned_carts'],
  );
  assert.equal(parseSupabaseWebhook(webhookBody({ email: EMAIL }, { table: 'newsletter_subscribers' })).ok, false);
  const opted = parseSupabaseWebhook(
    webhookBody({ email: EMAIL }, { table: 'newsletter_subscribers' }),
    { SUPABASE_WEBHOOK_TABLES: 'newsletter_subscribers' },
  );
  assert.equal(opted.ok, true);
  assert.equal(opted.table, 'newsletter_subscribers');
});

test('table matching is case-insensitive but never loose', () => {
  const parsed = parseSupabaseWebhook(webhookBody({ email: EMAIL }, { table: 'Email_Captures' }));
  assert.equal(parsed.ok, true);
  assert.equal(parseSupabaseWebhook(webhookBody({ email: EMAIL }, { table: 'email_captures_backup' })).ok, false);
});

test('malformed payloads answer 400 and an unusable email answers 422, with no Shopify call', async () => {
  const cases = [
    [webhookBody({ email: EMAIL }, { type: 'UPDATE' }), 400],
    [webhookBody({ email: EMAIL }, { table: 'profiles' }), 400],
    [null, 400],
    [{ type: 'INSERT', table: 'email_captures' }, 400],
    [webhookBody({ email: 'broken' }), 422],
  ];
  for (const [body, expected] of cases) {
    const { res, calls } = await invoke(mockReq({ body }));
    assert.equal(res.statusCode, expected, JSON.stringify(body).slice(0, 50));
    assert.equal(calls.length, 0);
  }
});

test('a JSON string body is parsed and an oversize body is rejected without parsing', async () => {
  const asString = await invoke(
    mockReq({ body: JSON.stringify(webhookBody({ email: EMAIL })) }),
    configuredEnv(),
    [searchEmpty, { status: 201, body: { customer: { id: 7004 } } }],
  );
  assert.equal(asString.res.statusCode, 200);
  assert.equal(asString.res.body.action, 'created');

  const huge = await invoke(mockReq({ body: 'x'.repeat(64 * 1024 + 10) }));
  assert.equal(huge.res.statusCode, 400, 'an oversize body must be rejected, not parsed');
  assert.equal(huge.calls.length, 0);
});

// ─── 3. Field extraction and normalization ──────────────────────────────────

test('normalizeEmail trims, lowercases and rejects what submit-email also rejects', () => {
  assert.equal(normalizeEmail('  Mixed.Case@Example.COM '), 'mixed.case@example.com');
  assert.equal(normalizeEmail('a+b@sub.example.co.uk'), 'a+b@sub.example.co.uk');
  for (const bad of [undefined, null, 42, {}, '', '   ', 'plainaddress', 'a@b', '@no-local.com', 'a b@c.com', `${'a'.repeat(250)}@b.com`]) {
    assert.equal(normalizeEmail(bad), null, String(bad));
  }
});

test('sanitizeFirstName strips control characters and caps the length', () => {
  assert.equal(sanitizeFirstName('  Aisha   Khan '), 'Aisha Khan');
  assert.equal(sanitizeFirstName('Ai\u0000sha\u001F'), 'Ai sha');
  assert.equal(sanitizeFirstName('   '), undefined);
  assert.equal(sanitizeFirstName(''), undefined);
  assert.equal(sanitizeFirstName(undefined), undefined);
  assert.equal(sanitizeFirstName(42), undefined);
  assert.equal(sanitizeFirstName(null), undefined);
  const long = sanitizeFirstName('x'.repeat(MAX_FIRST_NAME_LENGTH + 50));
  assert.ok(long.length <= MAX_FIRST_NAME_LENGTH);
});

test('first_name is optional and its absence must not blank an existing Shopify name', async () => {
  const { res, calls } = await invoke(
    mockReq({ body: webhookBody({ email: EMAIL }) }),
    configuredEnv(),
    [searchEmpty, { status: 201, body: { customer: { id: 7005 } } }],
  );
  assert.equal(res.statusCode, 200);
  assert.equal('first_name' in calls[1].body.customer, false);
});

test('marketing consent is claimed only where the record supports it', () => {
  // A FIRST10 newsletter signup is affirmative consent.
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL, type: 'newsletter' }, {}), true);
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL }, {}), true, 'the requested contract defaults to opted in');
  // A cart reminder is transactional; /privacy publishes "only with your consent".
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL, type: 'cart' }, {}), false);
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL, source: 'abandoned_cart' }, {}), false);
  // Explicit signals always win.
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL, type: 'cart', marketing_consent: true }, {}), true);
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL, type: 'newsletter', marketing_consent: false }, {}), false);
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL, accepts_marketing: 'yes' }, {}), true);
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL, accepts_marketing: 'no' }, {}), false);
  // Owner override for a strictly transactional deployment.
  assert.equal(resolveMarketingConsent({ email: CANONICAL_EMAIL }, { SYNC_LEAD_DEFAULT_MARKETING_CONSENT: 'false' }), false);
});

test('mergeCustomerTags dedupes case-insensitively and respects Shopify tag limits', () => {
  assert.equal(mergeCustomerTags('', LEAD_TAG), 'FIRST10_LEAD');
  assert.equal(mergeCustomerTags(undefined, LEAD_TAG), 'FIRST10_LEAD');
  assert.equal(mergeCustomerTags('VIP, first10_lead', LEAD_TAG), 'VIP, first10_lead');
  assert.equal(mergeCustomerTags(['VIP'], LEAD_TAG), 'VIP, FIRST10_LEAD');
  assert.equal(mergeCustomerTags('a,,b', LEAD_TAG), 'a, b, FIRST10_LEAD');
  assert.equal(mergeCustomerTags([42, null, 'VIP'], LEAD_TAG), 'VIP, FIRST10_LEAD');
  const many = Array.from({ length: MAX_CUSTOMER_TAGS + 20 }, (_, i) => `tag${i}`);
  assert.equal(mergeCustomerTags(many.join(','), LEAD_TAG).split(',').length, MAX_CUSTOMER_TAGS);
  assert.equal(mergeCustomerTags('x'.repeat(MAX_TAG_LENGTH + 50)).length, MAX_TAG_LENGTH);
});

test('buildCustomerPayload sends the consent trio Shopify needs and never claims verification', () => {
  const optedIn = buildCustomerPayload(
    { email: CANONICAL_EMAIL, firstName: 'Aisha', acceptsMarketing: true },
    { consentedAt: fixedNow(), existingTags: 'VIP' },
  ).customer;
  assert.equal(optedIn.email, CANONICAL_EMAIL);
  assert.equal(optedIn.first_name, 'Aisha');
  assert.equal(optedIn.accepts_marketing, true);
  assert.equal(optedIn.marketing_opt_in_level, 'single_opt_in');
  assert.equal(optedIn.accepts_marketing_updated_at, '2026-11-25T12:00:00.000Z');
  assert.equal(optedIn.tags, 'VIP, FIRST10_LEAD');
  assert.equal(optedIn.verified_email, false, 'the address was never verified');
  assert.equal(optedIn.send_email_invite, false, 'a lead sync must not email the shopper');
  assert.equal(optedIn.send_email_welcome, false);

  const transactional = buildCustomerPayload(
    { email: CANONICAL_EMAIL, acceptsMarketing: false },
    { consentedAt: fixedNow() },
  ).customer;
  assert.equal(transactional.accepts_marketing, false);
  assert.equal(transactional.marketing_opt_in_level, null);
  assert.equal(transactional.accepts_marketing_updated_at, null);
  assert.equal(transactional.tags, 'FIRST10_LEAD');
  assert.equal(transactional.first_name, undefined);
});

// ─── 4. Shopify Admin API interaction ───────────────────────────────────────

test('the Admin API version defaults to one Shopify still serves, not the removed 2024-01', () => {
  // Shopify serves each version about 12 months and answers a removed version by
  // falling forward to the oldest still-served one. 2024-01 and 2025-10 are both
  // gone, so pinning either would not do what the URL implies.
  assert.equal(DEFAULT_SHOPIFY_ADMIN_API_VERSION, '2026-01');
  assert.equal(resolveApiVersion({}), '2026-01');
  assert.notEqual(resolveApiVersion({}), '2024-01');
  assert.notEqual(resolveApiVersion({}), '2025-10');
  assert.equal(resolveApiVersion({ SHOPIFY_ADMIN_API_VERSION: 'garbage' }), '2026-01');
  assert.equal(resolveApiVersion({ SHOPIFY_ADMIN_API_VERSION: '2026-10' }), '2026-10');
  assert.equal(resolveApiVersion({ SHOPIFY_ADMIN_API_VERSION: '../../evil' }), '2026-01');
  // Still reachable if an operator deliberately wants the literal spec'd path.
  assert.equal(resolveApiVersion({ SHOPIFY_ADMIN_API_VERSION: '2024-01' }), '2024-01');
  assert.equal(resolveStoreDomain({}), 'lovable-project-zlh0w.myshopify.com');
  assert.equal(resolveStoreDomain({ SHOPIFY_ADMIN_STORE_DOMAIN: 'https://evil.example.com' }), 'lovable-project-zlh0w.myshopify.com');
  assert.equal(resolveStoreDomain({ SHOPIFY_ADMIN_STORE_DOMAIN: 'other-store.myshopify.com' }), 'other-store.myshopify.com');
});

test('a new email POSTs /customers.json with accepts_marketing true and the FIRST10_LEAD tag', async () => {
  const double = shopifyDouble([searchEmpty, { status: 201, body: { customer: { id: 8001, email: CANONICAL_EMAIL } } }]);
  const result = await syncLeadToShopify(
    { email: CANONICAL_EMAIL, firstName: 'Aisha', acceptsMarketing: true },
    { token: TOKEN, fetchImpl: double.fetchImpl, now: fixedNow },
  );
  assert.deepEqual(result, { status: 'ok', action: 'created', customerId: 8001 });
  assert.equal(double.calls.length, 2);

  assert.equal(double.calls[0].method, 'GET');
  assert.match(double.calls[0].url, /\/admin\/api\/2026-01\/customers\/search\.json\?query=email%3Abride\.example%40gmail\.com&limit=5$/);

  const create = double.calls[1];
  assert.equal(create.method, 'POST');
  assert.equal(create.url, 'https://lovable-project-zlh0w.myshopify.com/admin/api/2026-01/customers.json');
  assert.deepEqual(create.body.customer, {
    email: CANONICAL_EMAIL,
    first_name: 'Aisha',
    verified_email: false,
    accepts_marketing: true,
    marketing_opt_in_level: 'single_opt_in',
    accepts_marketing_updated_at: '2026-11-25T12:00:00.000Z',
    tags: 'FIRST10_LEAD',
    send_email_invite: false,
    send_email_welcome: false,
  });
});

test('an existing customer is updated in place, keeping its tags and re-sending consent', async () => {
  const existing = {
    status: 200,
    body: {
      customers: [{ id: 9001, email: CANONICAL_EMAIL, first_name: null, tags: 'VIP, Repeat Buyer', accepts_marketing: false }],
    },
  };
  const double = shopifyDouble([existing, { status: 200, body: { customer: { id: 9001 } } }]);
  const result = await syncLeadToShopify(
    { email: CANONICAL_EMAIL, firstName: 'Aisha', acceptsMarketing: true },
    { token: TOKEN, fetchImpl: double.fetchImpl, now: fixedNow },
  );
  assert.deepEqual(result, { status: 'ok', action: 'updated', customerId: 9001 });

  const update = double.calls[1];
  assert.equal(update.method, 'PUT');
  assert.equal(update.url, 'https://lovable-project-zlh0w.myshopify.com/admin/api/2026-01/customers/9001.json');
  // Regression guard: Shopify resets accepts_marketing to false on any write
  // that omits it, so the update must carry the full consent trio again.
  assert.equal(update.body.customer.accepts_marketing, true);
  assert.equal(update.body.customer.marketing_opt_in_level, 'single_opt_in');
  assert.equal(update.body.customer.accepts_marketing_updated_at, '2026-11-25T12:00:00.000Z');
  assert.equal(update.body.customer.tags, 'VIP, Repeat Buyer, FIRST10_LEAD');
  assert.equal(update.body.customer.id, 9001);
});

test('a lead that is already synced is left untouched so webhook retries are idempotent', async () => {
  const already = {
    status: 200,
    body: {
      customers: [{ id: 9002, email: CANONICAL_EMAIL, first_name: 'Aisha', tags: 'FIRST10_LEAD, VIP', accepts_marketing: true }],
    },
  };
  const double = shopifyDouble([already]);
  const result = await syncLeadToShopify(
    { email: CANONICAL_EMAIL, firstName: 'Aisha', acceptsMarketing: true },
    { token: TOKEN, fetchImpl: double.fetchImpl, now: fixedNow },
  );
  assert.deepEqual(result, { status: 'ok', action: 'unchanged', customerId: 9002 });
  assert.equal(double.calls.length, 1, 'no write should be issued');
});

test('the newer email_marketing_consent shape is read as the consent source of truth', async () => {
  const double = shopifyDouble([{
    status: 200,
    body: {
      customers: [{
        id: 9003,
        email: CANONICAL_EMAIL,
        tags: 'FIRST10_LEAD',
        accepts_marketing: true,
        email_marketing_consent: { state: 'not_subscribed' },
      }],
    },
  }, { status: 200, body: { customer: { id: 9003 } } }]);
  const result = await syncLeadToShopify(
    { email: CANONICAL_EMAIL, acceptsMarketing: true },
    { token: TOKEN, fetchImpl: double.fetchImpl, now: fixedNow },
  );
  assert.equal(result.action, 'updated', 'a withdrawn consent state must be re-synced, not skipped');
});

test('email matching ignores case and picks the exact address from search results', async () => {
  const double = shopifyDouble([{
    status: 200,
    body: {
      customers: [
        { id: 1, email: 'other@example.com', tags: '' },
        { id: 2, email: ' Bride.Example@Gmail.COM ', tags: 'FIRST10_LEAD', accepts_marketing: true },
      ],
    },
  }]);
  const result = await syncLeadToShopify(
    { email: CANONICAL_EMAIL, acceptsMarketing: true },
    { token: TOKEN, fetchImpl: double.fetchImpl, now: fixedNow },
  );
  assert.deepEqual(result, { status: 'ok', action: 'unchanged', customerId: 2 });
});

test('a create/update race falls back to updating the customer another worker made', async () => {
  const double = shopifyDouble([
    searchEmpty,
    { status: 422, body: { errors: { email: ['has already been taken'] } } },
    { status: 200, body: { customers: [{ id: 9100, email: CANONICAL_EMAIL, tags: '' }] } },
    { status: 200, body: { customer: { id: 9100 } } },
  ]);
  const result = await syncLeadToShopify(
    { email: CANONICAL_EMAIL, acceptsMarketing: true },
    { token: TOKEN, fetchImpl: double.fetchImpl, now: fixedNow },
  );
  assert.deepEqual(result, { status: 'ok', action: 'updated', customerId: 9100 });
  assert.equal(double.calls[2].method, 'GET');
  assert.equal(double.calls[3].method, 'PUT');
});

test('throttling is retried once and then succeeds', async () => {
  const double = shopifyDouble([searchEmpty, { status: 429 }, { status: 201, body: { customer: { id: 9200 } } }]);
  const result = await syncLeadToShopify(
    { email: CANONICAL_EMAIL, acceptsMarketing: true },
    { token: TOKEN, fetchImpl: double.fetchImpl, now: fixedNow },
  );
  assert.deepEqual(result, { status: 'ok', action: 'created', customerId: 9200 });
  assert.equal(double.calls.length, 3);
});

test('Shopify failures surface as typed errors with retryable flags', async () => {
  const exhausted = shopifyDouble([{ status: 429 }, { status: 429 }]);
  await assert.rejects(
    syncLeadToShopify({ email: CANONICAL_EMAIL, acceptsMarketing: true }, { token: TOKEN, fetchImpl: exhausted.fetchImpl }),
    (error) => error.status === 429 && error.retryable === true,
  );

  const serverFault = shopifyDouble([{ status: 503 }, { status: 503 }]);
  await assert.rejects(
    syncLeadToShopify({ email: CANONICAL_EMAIL, acceptsMarketing: true }, { token: TOKEN, fetchImpl: serverFault.fetchImpl }),
    (error) => error.status === 503 && error.retryable === true,
  );

  const unauthorized = shopifyDouble([{ status: 401 }]);
  await assert.rejects(
    syncLeadToShopify({ email: CANONICAL_EMAIL, acceptsMarketing: true }, { token: TOKEN, fetchImpl: unauthorized.fetchImpl }),
    (error) => error.status === 401 && error.retryable === false,
  );

  const broken = shopifyDouble([]);
  broken.fetchImpl = async () => { throw new Error('socket hang up'); };
  await assert.rejects(
    syncLeadToShopify({ email: CANONICAL_EMAIL, acceptsMarketing: true }, { token: TOKEN, fetchImpl: broken.fetchImpl }),
    (error) => error.retryable === true && error.status === 0,
  );

  const nonJson = shopifyDouble([{ status: 200 }]);
  nonJson.fetchImpl = async () => ({ ok: true, status: 200, text: async () => '<html>not json</html>' });
  await assert.rejects(
    syncLeadToShopify({ email: CANONICAL_EMAIL, acceptsMarketing: true }, { token: TOKEN, fetchImpl: nonJson.fetchImpl }),
    (error) => error.retryable === false,
  );

  await assert.rejects(
    syncLeadToShopify({ email: CANONICAL_EMAIL, acceptsMarketing: true }, { token: '' }),
    /token is not configured/,
  );
});

test('upstream error bodies are never propagated to the caller', async () => {
  const double = shopifyDouble([{ status: 422, body: { errors: { email: [`leaked detail ${CANONICAL_EMAIL}`] } } }]);
  await assert.rejects(
    syncLeadToShopify({ email: CANONICAL_EMAIL, acceptsMarketing: true }, { token: TOKEN, fetchImpl: double.fetchImpl }),
    (error) => {
      assert.ok(!error.message.includes(CANONICAL_EMAIL), 'a Shopify body leaked into the error message');
      assert.ok(!error.message.includes('leaked detail'));
      return true;
    },
  );
});

// ─── 5. Handler end-to-end ──────────────────────────────────────────────────

test('the handler answers 200 with a redacted email, no-store headers and no PII in logs', async () => {
  const { res, calls, logs } = await invoke(
    mockReq({ body: webhookBody({ email: EMAIL, first_name: 'Aisha' }) }),
    configuredEnv(),
    [searchEmpty, { status: 201, body: { customer: { id: 9300 } } }],
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    ok: true,
    action: 'created',
    customerId: 9300,
    // Redaction reflects the canonical address that was stored, not the raw input.
    email: 'b***@gmail.com',
    tag: 'FIRST10_LEAD',
  });
  assert.equal(res.headers['cache-control'], 'no-store');
  assert.equal(res.headers['x-robots-tag'], 'noindex, nofollow');

  const create = calls[1];
  assert.equal(create.body.customer.email, CANONICAL_EMAIL);
  assert.equal(create.body.customer.first_name, 'Aisha');
  assert.equal(create.body.customer.accepts_marketing, true);
  assert.equal(create.body.customer.tags, 'FIRST10_LEAD');

  const logged = logs.map(([, text]) => text).join('\n');
  assert.ok(!logged.includes(CANONICAL_EMAIL) && !logged.includes(EMAIL), 'a raw email reached the logs');
  assert.ok(!logged.includes(SECRET), 'the webhook secret reached the logs');
  assert.ok(!logged.includes(TOKEN), 'the admin token reached the logs');
  assert.ok(logged.includes(emailFingerprint(CANONICAL_EMAIL)), 'expected a correlation fingerprint in the logs');
  assert.ok(!res.body.error);
});

test('a transactional cart capture is synced and tagged but never marked as marketing consent', async () => {
  const { res, calls } = await invoke(
    mockReq({ body: webhookBody({ email: EMAIL, type: 'cart', cart_total: 249 }) }),
    configuredEnv(),
    [searchEmpty, { status: 201, body: { customer: { id: 9400 } } }],
  );
  assert.equal(res.statusCode, 200);
  const create = calls[1];
  assert.equal(create.body.customer.accepts_marketing, false);
  assert.equal(create.body.customer.marketing_opt_in_level, null);
  assert.equal(create.body.customer.tags, 'FIRST10_LEAD');
});

test('retryable Shopify failures answer 502 and permanent ones answer 422', async () => {
  const throttled = await invoke(mockReq(), configuredEnv(), [{ status: 429 }, { status: 429 }]);
  assert.equal(throttled.res.statusCode, 502);
  assert.equal(throttled.res.body.error, 'Lead sync failed; retry later');

  // 429 is a 4xx that must still be retried; a naive status-range check here
  // would answer 422 and silently drop the lead.
  const upstream = await invoke(mockReq(), configuredEnv(), [{ status: 503 }, { status: 503 }]);
  assert.equal(upstream.res.statusCode, 502);

  const badToken = await invoke(mockReq(), configuredEnv(), [{ status: 401 }]);
  assert.equal(badToken.res.statusCode, 422, 'a misconfigured token must not retry forever');

  const rejected = await invoke(
    mockReq(),
    configuredEnv(),
    [{ status: 422, body: { errors: { email: ['is invalid'] } } }],
  );
  assert.equal(rejected.res.statusCode, 422);
  assert.equal(rejected.res.body.error, 'Shopify rejected the lead');
  assert.ok(!JSON.stringify(rejected.res.body).includes('is invalid'), 'a Shopify error body leaked to the client');
});

test('the opt-in level is configurable for a double-opt-in deployment', async () => {
  const { calls } = await invoke(
    mockReq(),
    configuredEnv({ SYNC_LEAD_MARKETING_OPT_IN_LEVEL: 'confirmed_opt_in' }),
    [searchEmpty, { status: 201, body: { customer: { id: 9500 } } }],
  );
  assert.equal(calls[1].body.customer.marketing_opt_in_level, 'confirmed_opt_in');
});

test('the API version and store domain are configurable end to end', async () => {
  const { res, calls } = await invoke(
    mockReq(),
    configuredEnv({ SHOPIFY_ADMIN_API_VERSION: '2026-10', SHOPIFY_ADMIN_STORE_DOMAIN: 'luxemia-flagship.myshopify.com' }),
    [searchEmpty, { status: 201, body: { customer: { id: 9600 } } }],
  );
  assert.equal(res.statusCode, 200);
  assert.equal(calls[1].url, 'https://luxemia-flagship.myshopify.com/admin/api/2026-10/customers.json');
});

test('redaction and fingerprinting cannot be reversed into an address', () => {
  assert.equal(redactEmail(CANONICAL_EMAIL), 'b***@gmail.com');
  assert.equal(redactEmail('no-at-sign'), '***');
  assert.equal(redactEmail('@domain.com'), '***@domain.com');
  const fingerprint = emailFingerprint(CANONICAL_EMAIL);
  assert.equal(fingerprint.length, 12);
  assert.equal(fingerprint, emailFingerprint(EMAIL), 'fingerprinting must be case-insensitive');
  assert.ok(!fingerprint.includes('bride'));
});

// ─── 6. Repository wiring ───────────────────────────────────────────────────

test('the endpoint is registered for tests and documented for operators', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.match(pkg.scripts.test, /tests\/syncLead\.test\.mjs/);
  assert.equal(pkg.scripts['test:lead-sync'], 'node --test tests/syncLead.test.mjs');

  const env = readFileSync('.env.example', 'utf8');
  assert.match(env, /SUPABASE_WEBHOOK_SECRET/);
  assert.match(env, /SHOPIFY_ADMIN_API_TOKEN/);
  assert.match(env, /SUPABASE_WEBHOOK_TABLES/);

  const source = readFileSync('api/sync-lead.ts', 'utf8');
  // The requested contract stays discoverable even though Shopify no longer
  // serves 2024-01 and this project has no email_captures table yet.
  assert.match(source, /email_captures/);
  assert.match(source, /2024-01/);
  assert.match(source, /FIRST10_LEAD/);
  assert.match(source, /accepts_marketing/);
});
