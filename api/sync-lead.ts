import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Lead sync: Supabase Database Webhook → Shopify customer.
 *
 * Supabase fires a POST here on INSERTs to the lead-capture table. The handler
 * verifies the shared secret, validates the payload, then creates or updates
 * the matching Shopify customer with `accepts_marketing: true` and the
 * `FIRST10_LEAD` tag.
 *
 * ── Deployment facts that shaped this file ──────────────────────────────────
 *
 * 1. **There is no `email_captures` table in this project.** The Supabase
 *    schema (`src/integrations/supabase/types.ts`, `supabase/migrations/*`)
 *    has `newsletter_subscribers` (email, source, discount_code — written when
 *    `submit-email` receives `type: "newsletter"`) and `abandoned_carts`
 *    (email, cart_items, cart_total — written for `type: "cart"`). Neither has
 *    a `first_name` column, which is why `first_name` is optional here. The
 *    accepted table names are therefore configurable via
 *    `SUPABASE_WEBHOOK_TABLES` (comma-separated), defaulting to
 *    `email_captures` so the function matches the requested contract and works
 *    the moment that table exists.
 *
 * 2. **`/admin/api/2024-01/` is no longer served.** Shopify serves each Admin
 *    API version for about 12 months; the versions available today are
 *    2026-01, 2026-04, 2026-07 and 2026-10 (2025-10 stopped being served on
 *    16 Oct 2026). A removed version is answered by "fall forward" to the
 *    oldest still-served version, so pinning 2024-01 would not do what the URL
 *    implies. The version defaults to `2026-01` — exactly what Shopify would
 *    serve a 2024-01 request today — and is overridable with
 *    `SHOPIFY_ADMIN_API_VERSION`.
 *
 * 3. **`accepts_marketing` is reset to `false` whenever a customer write omits
 *    it**, so every update path re-sends it together with
 *    `marketing_opt_in_level` and `accepts_marketing_updated_at`. Without the
 *    opt-in level Shopify may not record the consent at all. `accepts_marketing`
 *    itself is deprecated in favour of `email_marketing_consent`; both are
 *    noted in `buildCustomerPayload` for the eventual GraphQL migration (the
 *    REST Admin API has been legacy since 1 Oct 2024, though existing custom
 *    integrations keep working).
 *
 * 4. **Marketing consent follows the published privacy policy.** `/privacy`
 *    states marketing emails are sent "only with your consent". A record that
 *    identifies itself as a transactional cart capture (`type`/`source` of
 *    `cart`, or an explicit `marketing_consent: false`) is still synced and
 *    tagged — it just is not marked as a marketing subscriber. Anything else
 *    defaults to opted in, per the requested contract. Override the default
 *    with `SYNC_LEAD_DEFAULT_MARKETING_CONSENT=false`.
 *
 * ── Security ────────────────────────────────────────────────────────────────
 * The secret is compared in constant time and never logged or echoed. Emails
 * are logged only as a SHA-256 fingerprint prefix, so Vercel logs cannot leak
 * customer PII. Fails closed: a missing `SUPABASE_WEBHOOK_SECRET` or
 * `SHOPIFY_ADMIN_API_TOKEN` rejects the request instead of accepting it.
 */

export const LEAD_TAG = 'FIRST10_LEAD';
export const WEBHOOK_SECRET_HEADER = 'x-supabase-webhook-secret';
export const SHOPIFY_ADMIN_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
/** Oldest Admin API version Shopify still serves (see note 2). */
export const DEFAULT_SHOPIFY_ADMIN_API_VERSION = '2026-01';
export const DEFAULT_WEBHOOK_TABLES = ['email_captures'];

/** Matches `submit-email`'s validateEmail and the consultation_leads CHECK. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_EMAIL_LENGTH = 255;
export const MAX_FIRST_NAME_LENGTH = 100;
/** Shopify customer tag limits. */
export const MAX_CUSTOMER_TAGS = 250;
export const MAX_TAG_LENGTH = 255;
export const SHOPIFY_FETCH_TIMEOUT_MS = 15_000;

const API_VERSION_PATTERN = /^\d{4}-\d{2}$/;

export type SyncAction = 'created' | 'updated' | 'unchanged';

export interface SyncLeadResult {
  status: 'ok';
  action: SyncAction;
  customerId: number | string | null;
}

export interface Lead {
  email: string;
  firstName?: string;
  acceptsMarketing: boolean;
}

export type ParseFailureReason =
  | 'payload_not_object'
  | 'unsupported_event_type'
  | 'unlisted_table'
  | 'missing_record'
  | 'invalid_email';

export type ParseResult =
  | { ok: true; table: string; record: Record<string, unknown>; lead: Lead }
  | { ok: false; reason: ParseFailureReason };

export interface SyncDeps {
  token: string;
  apiVersion?: string;
  storeDomain?: string;
  marketingOptInLevel?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

/** Constant-time comparison that cannot throw on mismatched or odd inputs. */
export function safeEqualSecret(provided: unknown, expected: unknown): boolean {
  if (typeof provided !== 'string' || typeof expected !== 'string') return false;
  if (!expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  try {
    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/** Vercel normalizes headers to lowercase; values may be arrays. */
export function readSecretHeader(headers: Record<string, unknown> | undefined): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const raw = headers[WEBHOOK_SECRET_HEADER] ?? headers['X-Supabase-Webhook-Secret'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function resolveApiVersion(env: NodeJS.ProcessEnv = process.env): string {
  const configured = (env.SHOPIFY_ADMIN_API_VERSION || '').trim();
  return API_VERSION_PATTERN.test(configured) ? configured : DEFAULT_SHOPIFY_ADMIN_API_VERSION;
}

export function resolveStoreDomain(env: NodeJS.ProcessEnv = process.env): string {
  const configured = (env.SHOPIFY_ADMIN_STORE_DOMAIN || '').trim().toLowerCase();
  // Only a bare myshopify.com host may be substituted; never a full URL.
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(configured)
    ? configured
    : SHOPIFY_ADMIN_STORE_DOMAIN;
}

export function allowedWebhookTables(env: NodeJS.ProcessEnv = process.env): string[] {
  const configured = (env.SUPABASE_WEBHOOK_TABLES || '')
    .split(',')
    .map((table) => table.trim())
    .filter(Boolean);
  return configured.length ? configured : [...DEFAULT_WEBHOOK_TABLES];
}

/** `first_name` is optional and untrusted: strip control chars, cap the length. */
export function sanitizeFirstName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return undefined;
  return cleaned.length > MAX_FIRST_NAME_LENGTH ? cleaned.slice(0, MAX_FIRST_NAME_LENGTH).trim() : cleaned;
}

/** Mirrors `supabase/functions/submit-email` so both paths reject identically. */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_EMAIL_LENGTH) return null;
  if (!EMAIL_PATTERN.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

const TRANSACTIONAL_SOURCES = new Set(['cart', 'abandoned_cart', 'abandoned-cart', 'checkout_recovery']);

/**
 * Marketing consent is only claimed where the record supports it, because
 * `/privacy` publishes that marketing emails go out "only with your consent".
 */
export function resolveMarketingConsent(
  record: Record<string, unknown>,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const explicit = record.marketing_consent ?? record.accepts_marketing ?? record.consented_to_marketing;
  if (typeof explicit === 'boolean') return explicit;
  if (typeof explicit === 'string') {
    if (/^(true|yes|1)$/i.test(explicit.trim())) return true;
    if (/^(false|no|0)$/i.test(explicit.trim())) return false;
  }

  const source = record.type ?? record.source ?? record.capture_source;
  if (typeof source === 'string' && TRANSACTIONAL_SOURCES.has(source.trim().toLowerCase())) return false;

  const fallback = (env.SYNC_LEAD_DEFAULT_MARKETING_CONSENT || '').trim().toLowerCase();
  if (fallback === 'false' || fallback === '0' || fallback === 'no') return false;
  return true;
}

/** Shopify stores `tags` as one comma-separated string; dedupe and cap it. */
export function mergeCustomerTags(existing: unknown, ...added: string[]): string {
  const current = typeof existing === 'string'
    ? existing.split(',')
    : Array.isArray(existing)
      ? existing.filter((tag): tag is string => typeof tag === 'string')
      : [];
  const merged: string[] = [];
  for (const candidate of [...current, ...added]) {
    const tag = String(candidate ?? '').trim().slice(0, MAX_TAG_LENGTH);
    if (!tag) continue;
    if (!merged.some((seen) => seen.toLowerCase() === tag.toLowerCase())) merged.push(tag);
  }
  return merged.slice(0, MAX_CUSTOMER_TAGS).join(', ');
}

/**
 * The REST-native consent trio. `accepts_marketing` alone is not enough:
 * Shopify defaults it to `false` on any write that omits it, and may ignore it
 * without an opt-in level. `email_marketing_consent` is the non-deprecated
 * replacement to adopt when this moves to the GraphQL Admin API.
 */
export function buildCustomerPayload(
  lead: Lead,
  options: { marketingOptInLevel?: string; consentedAt?: Date; existingTags?: unknown; customerId?: number | string } = {},
): { customer: Record<string, unknown> } {
  const consentedAt = options.consentedAt ?? new Date();
  const customer: Record<string, unknown> = {
    email: lead.email,
    // We never verified this address, so never claim that we did.
    verified_email: false,
    accepts_marketing: lead.acceptsMarketing,
    marketing_opt_in_level: lead.acceptsMarketing ? (options.marketingOptInLevel || 'single_opt_in') : null,
    accepts_marketing_updated_at: lead.acceptsMarketing ? consentedAt.toISOString() : null,
    tags: mergeCustomerTags(options.existingTags, LEAD_TAG),
    // Creating a lead must never trigger an unexpected Shopify email.
    send_email_invite: false,
    send_email_welcome: false,
  };
  if (lead.firstName) customer.first_name = lead.firstName;
  if (options.customerId !== undefined) customer.id = options.customerId;
  return { customer };
}

/** A loggable correlation ID that cannot be reversed into an address. */
export function emailFingerprint(email: string): string {
  return createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 12);
}

export function redactEmail(email: string): string {
  const atIndex = email.lastIndexOf('@');
  if (atIndex < 0) return '***';
  const local = atIndex > 0 ? `${email.slice(0, 1)}***` : '***';
  return `${local}@${email.slice(atIndex + 1)}`;
}

class ShopifyAdminError extends Error {
  status: number;
  retryable: boolean;
  constructor(status: number, message: string, retryable: boolean) {
    super(message);
    this.name = 'ShopifyAdminError';
    this.status = status;
    this.retryable = retryable;
  }
}

async function adminFetch(
  path: string,
  deps: SyncDeps,
  init: { method: string; body?: unknown } = { method: 'GET' },
): Promise<unknown> {
  const storeDomain = deps.storeDomain || SHOPIFY_ADMIN_STORE_DOMAIN;
  const apiVersion = deps.apiVersion || DEFAULT_SHOPIFY_ADMIN_API_VERSION;
  const url = `https://${storeDomain}/admin/api/${apiVersion}${path}`;
  const fetchImpl = deps.fetchImpl || fetch;

  // One retry on throttling or an upstream fault, matching api/meta-catalog.ts.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        method: init.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Shopify-Access-Token': deps.token,
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: AbortSignal.timeout(SHOPIFY_FETCH_TIMEOUT_MS),
      });

      const text = await response.text();
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt === 0) continue;
        // Never propagate Shopify's body: it can echo customer data.
        throw new ShopifyAdminError(response.status, `Shopify ${init.method} ${path} failed (${response.status})`, retryable);
      }
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch {
        throw new ShopifyAdminError(response.status, `Shopify ${init.method} ${path} returned a non-JSON body`, false);
      }
    } catch (error) {
      if (error instanceof ShopifyAdminError) throw error;
      if (attempt === 1) {
        throw new ShopifyAdminError(0, `Shopify ${init.method} ${path} request failed`, true);
      }
    }
  }
  throw new ShopifyAdminError(0, `Shopify request failed`, true);
}

interface ShopifyCustomer {
  id?: number | string;
  email?: string;
  first_name?: string | null;
  tags?: string;
  accepts_marketing?: boolean;
  email_marketing_consent?: { state?: string } | null;
}

function findCustomerByEmail(payload: unknown, email: string): ShopifyCustomer | null {
  const customers = (payload as { customers?: ShopifyCustomer[] } | null)?.customers;
  if (!Array.isArray(customers)) return null;
  return customers.find((customer) => (customer?.email || '').trim().toLowerCase() === email) ?? null;
}

/** `email_marketing_consent` supersedes the deprecated `accepts_marketing`. */
function resolveStoredMarketingConsent(customer: ShopifyCustomer): boolean {
  const state = customer.email_marketing_consent?.state;
  if (typeof state === 'string' && state.trim()) return state.trim().toLowerCase() === 'subscribed';
  return customer.accepts_marketing === true;
}

function isAlreadySynced(customer: ShopifyCustomer, lead: Lead): boolean {
  const tags = (customer.tags || '').split(',').map((tag) => tag.trim().toLowerCase());
  const nameMatches = !lead.firstName || (customer.first_name || '').trim() === lead.firstName.trim();
  return tags.includes(LEAD_TAG.toLowerCase())
    && resolveStoredMarketingConsent(customer) === lead.acceptsMarketing
    && nameMatches;
}

/**
 * Search → create, or search → update. Idempotent, so a Supabase retry cannot
 * duplicate customers or churn tags. A create/update race ("email has already
 * been taken") falls back to a single search-and-update pass.
 */
export async function syncLeadToShopify(lead: Lead, deps: SyncDeps): Promise<SyncLeadResult> {
  if (!deps.token) throw new ShopifyAdminError(0, 'Shopify Admin API token is not configured', false);

  const searched = await adminFetch(
    `/customers/search.json?query=${encodeURIComponent(`email:${lead.email}`)}&limit=5`,
    deps,
  );
  const existing = findCustomerByEmail(searched, lead.email);

  if (existing?.id !== undefined && existing.id !== null) {
    if (isAlreadySynced(existing, lead)) {
      return { status: 'ok', action: 'unchanged', customerId: existing.id };
    }
    await adminFetch(`/customers/${encodeURIComponent(String(existing.id))}.json`, deps, {
      method: 'PUT',
      body: buildCustomerPayload(lead, {
        marketingOptInLevel: deps.marketingOptInLevel,
        consentedAt: deps.now?.(),
        existingTags: existing.tags,
        customerId: existing.id,
      }),
    });
    return { status: 'ok', action: 'updated', customerId: existing.id };
  }

  try {
    const created = await adminFetch('/customers.json', deps, {
      method: 'POST',
      body: buildCustomerPayload(lead, {
        marketingOptInLevel: deps.marketingOptInLevel,
        consentedAt: deps.now?.(),
      }),
    }) as { customer?: ShopifyCustomer };
    return { status: 'ok', action: 'created', customerId: created?.customer?.id ?? null };
  } catch (error) {
    // Another worker created the same lead between our search and POST.
    const conflict = error instanceof ShopifyAdminError && error.status === 422;
    if (!conflict) throw error;
    const retry = await adminFetch(
      `/customers/search.json?query=${encodeURIComponent(`email:${lead.email}`)}&limit=5`,
      deps,
    );
    const raced = findCustomerByEmail(retry, lead.email);
    if (!raced?.id) throw error;
    await adminFetch(`/customers/${encodeURIComponent(String(raced.id))}.json`, deps, {
      method: 'PUT',
      body: buildCustomerPayload(lead, {
        marketingOptInLevel: deps.marketingOptInLevel,
        consentedAt: deps.now?.(),
        existingTags: raced.tags,
        customerId: raced.id,
      }),
    });
    return { status: 'ok', action: 'updated', customerId: raced.id };
  }
}

/** Supabase Database Webhook payload: `{ type, table, schema, record, old_record }`. */
export function parseSupabaseWebhook(
  body: unknown,
  env: NodeJS.ProcessEnv = process.env,
): ParseResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, reason: 'payload_not_object' };
  }
  const payload = body as Record<string, unknown>;

  const eventType = typeof payload.type === 'string' ? payload.type.toUpperCase() : '';
  if (eventType !== 'INSERT') return { ok: false, reason: 'unsupported_event_type' };

  const table = typeof payload.table === 'string' ? payload.table.trim() : '';
  const allowed = allowedWebhookTables(env);
  if (!table || !allowed.some((name) => name.toLowerCase() === table.toLowerCase())) {
    return { ok: false, reason: 'unlisted_table' };
  }

  const record = payload.record;
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return { ok: false, reason: 'missing_record' };
  }

  const email = normalizeEmail((record as Record<string, unknown>).email);
  if (!email) return { ok: false, reason: 'invalid_email' };

  const lead: Lead = {
    email,
    firstName: sanitizeFirstName((record as Record<string, unknown>).first_name),
    acceptsMarketing: resolveMarketingConsent(record as Record<string, unknown>, env),
  };
  return { ok: true, table, record: record as Record<string, unknown>, lead };
}

/** A lead webhook payload is tiny; cap the body so it cannot be abused. */
export const MAX_BODY_BYTES = 64 * 1024;

async function readBody(req: VercelRequest): Promise<unknown> {
  const parsed = (req as { body?: unknown }).body;
  if (typeof parsed === 'string') {
    if (parsed.length > MAX_BODY_BYTES) return null;
    try {
      return JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (parsed && typeof parsed === 'object') return parsed;

  // Vercel parses JSON request bodies automatically, so this path only runs
  // when the webhook omitted a JSON content type. Read the stream defensively.
  if (typeof (req as { on?: unknown }).on !== 'function') return null;
  return await new Promise<unknown>((resolve) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      size += buffer.length;
      if (size > MAX_BODY_BYTES) {
        resolve(null);
        req.destroy?.();
        return;
      }
      chunks.push(buffer);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Fail closed: without a configured secret nobody may be authenticated.
  const expectedSecret = (process.env.SUPABASE_WEBHOOK_SECRET || '').trim();
  if (!expectedSecret) {
    console.error('[sync-lead] SUPABASE_WEBHOOK_SECRET is not configured; rejecting request');
    return res.status(503).json({ error: 'Lead sync is not configured' });
  }

  const providedSecret = readSecretHeader(req.headers as Record<string, unknown>);
  if (!providedSecret || !safeEqualSecret(providedSecret, expectedSecret)) {
    console.warn('[sync-lead] rejected a request with an invalid webhook secret');
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  const token = (process.env.SHOPIFY_ADMIN_API_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '').trim();
  if (!token) {
    console.error('[sync-lead] no Shopify Admin API token configured; rejecting authenticated webhook');
    return res.status(503).json({ error: 'Lead sync is not configured' });
  }

  const parsed = parseSupabaseWebhook(await readBody(req));
  if (!parsed.ok) {
    // A malformed or unlisted payload will not improve on retry.
    console.warn(`[sync-lead] rejected payload: ${parsed.reason}`);
    const status = parsed.reason === 'invalid_email' ? 422 : 400;
    return res.status(status).json({ error: `Rejected: ${parsed.reason}` });
  }

  const fingerprint = emailFingerprint(parsed.lead.email);
  try {
    const result = await syncLeadToShopify(parsed.lead, {
      token,
      apiVersion: resolveApiVersion(),
      storeDomain: resolveStoreDomain(),
      marketingOptInLevel: (process.env.SYNC_LEAD_MARKETING_OPT_IN_LEVEL || '').trim() || undefined,
      now: () => new Date(),
    });
    console.log(`[sync-lead] ${result.action} lead ${fingerprint} from ${parsed.table} (marketing=${parsed.lead.acceptsMarketing})`);
    return res.status(200).json({
      ok: true,
      action: result.action,
      customerId: result.customerId,
      email: redactEmail(parsed.lead.email),
      tag: LEAD_TAG,
    });
  } catch (error) {
    const status = error instanceof ShopifyAdminError ? error.status : 0;
    // Trust the error's own retryability: 429 is a 4xx that MUST be retried,
    // while a 4xx like 401/422 will fail identically forever. A 5xx response
    // lets Supabase retry the webhook; a 422 tells it the lead is unusable.
    const retryable = error instanceof ShopifyAdminError ? error.retryable : true;
    console.error(`[sync-lead] lead ${fingerprint} failed${status ? ` (Shopify ${status})` : ''}: ${error instanceof Error ? error.message : 'unknown error'}`);
    if (!retryable) {
      // The webhook itself was well-formed; Shopify could not process it, and a
      // retry would fail identically. 400 stays reserved for malformed payloads.
      return res.status(422).json({ error: 'Shopify rejected the lead' });
    }
    return res.status(502).json({ error: 'Lead sync failed; retry later' });
  }
}
