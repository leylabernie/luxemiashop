const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');

// src/lib/leadCaptureStorage.ts is TypeScript, so bundle it the way the other
// api/ and src/lib suites do. `.cjs` cannot use top-level await, hence `loaded`.
const loaded = build({
  entryPoints: [path.join(root, 'src/lib/leadCaptureStorage.ts')],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
}).then((result) => {
  const module = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(module, module.exports, require);
  return module.exports;
});

const DAY_MS = 86_400_000;
const NOW = Date.parse('2026-11-25T12:00:00.000Z');

/** A minimal in-memory Storage that behaves like the browser one. */
function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (key) => (map.has(String(key)) ? map.get(String(key)) : null),
    setItem: (key, value) => map.set(String(key), String(value)),
    removeItem: (key) => map.delete(String(key)),
    clear: () => map.clear(),
  };
}

/** Storage whose every accessor throws, as Safari private mode does. */
function throwingStorage() {
  const boom = () => { throw new Error('SecurityError: storage is blocked'); };
  return { getItem: boom, setItem: boom, removeItem: boom, clear: boom };
}

const daysAgo = (days, from = NOW) => new Date(from - days * DAY_MS).toISOString();

// ─── suppression: bounded, not permanent ────────────────────────────────────

test('a dismissal suppresses the prompt for 30 days and then stops', async () => {
  const { POPUP_STATE_KEY, DISMISSAL_SUPPRESSION_DAYS, createLeadCaptureStorage } = await loaded;
  const storage = fakeStorage();
  const store = createLeadCaptureStorage(() => ({ localStorage: storage }));

  assert.equal(store.isPopupSuppressed(NOW), false, 'a fresh browser is never suppressed');
  store.rememberPopupDismissal(NOW);

  const written = JSON.parse(storage.map.get(POPUP_STATE_KEY));
  assert.equal(written.reason, 'dismissed');
  assert.equal(written.at, new Date(NOW).toISOString());

  assert.equal(store.isPopupSuppressed(NOW + DAY_MS), true);
  assert.equal(store.isPopupSuppressed(NOW + (DISMISSAL_SUPPRESSION_DAYS - 1) * DAY_MS), true);
  assert.equal(
    store.isPopupSuppressed(NOW + DISMISSAL_SUPPRESSION_DAYS * DAY_MS),
    false,
    'the offer must come back — the old key blocked it forever',
  );
  assert.equal(store.readPopupState(NOW + DISMISSAL_SUPPRESSION_DAYS * DAY_MS), null);
});

test('a confirmed signup is never re-prompted', async () => {
  const { createLeadCaptureStorage } = await loaded;
  const storage = fakeStorage();
  const store = createLeadCaptureStorage(() => ({ localStorage: storage }));
  store.rememberPopupSignup(NOW);
  for (const offset of [0, 30, 400, 5000]) {
    assert.equal(store.isPopupSuppressed(NOW + offset * DAY_MS), true, `day ${offset}`);
  }
  assert.equal(store.readPopupState(NOW + 5000 * DAY_MS).reason, 'subscribed');
});

test('the legacy permanent key migrates to a bounded dismissal and is removed', async () => {
  const { POPUP_STATE_KEY, LEGACY_POPUP_SEEN_KEY, DISMISSAL_SUPPRESSION_DAYS, createLeadCaptureStorage } = await loaded;
  const storage = fakeStorage({ [LEGACY_POPUP_SEEN_KEY]: 'true' });
  const store = createLeadCaptureStorage(() => ({ localStorage: storage }));

  // First sight: honoured, but re-dated so it can expire.
  assert.equal(store.isPopupSuppressed(NOW), true);
  const migrated = JSON.parse(storage.map.get(POPUP_STATE_KEY));
  assert.equal(migrated.reason, 'legacy-dismissal');
  assert.equal(migrated.at, new Date(NOW).toISOString());
  assert.equal(storage.map.has(LEGACY_POPUP_SEEN_KEY), false, 'the permanent key must not survive');

  // And it expires, which the legacy key never did.
  assert.equal(store.isPopupSuppressed(NOW + DISMISSAL_SUPPRESSION_DAYS * DAY_MS), false);
});

test('a later dismissal replaces a migrated legacy record', async () => {
  const { POPUP_STATE_KEY, LEGACY_POPUP_SEEN_KEY, DISMISSAL_SUPPRESSION_DAYS, createLeadCaptureStorage } = await loaded;
  const storage = fakeStorage({ [LEGACY_POPUP_SEEN_KEY]: 'true' });
  const store = createLeadCaptureStorage(() => ({ localStorage: storage }));
  store.readPopupState(NOW);
  store.rememberPopupDismissal(NOW + 5 * DAY_MS);
  assert.equal(JSON.parse(storage.map.get(POPUP_STATE_KEY)).reason, 'dismissed');
  assert.equal(store.isPopupSuppressed(NOW + 5 * DAY_MS + (DISMISSAL_SUPPRESSION_DAYS - 1) * DAY_MS), true);
  assert.equal(store.isPopupSuppressed(NOW + 5 * DAY_MS + DISMISSAL_SUPPRESSION_DAYS * DAY_MS), false);
});

test('clearPopupState removes both keys', async () => {
  const { POPUP_STATE_KEY, LEGACY_POPUP_SEEN_KEY, createLeadCaptureStorage } = await loaded;
  const storage = fakeStorage({
    [POPUP_STATE_KEY]: JSON.stringify({ reason: 'subscribed', at: daysAgo(1) }),
    [LEGACY_POPUP_SEEN_KEY]: 'true',
  });
  const store = createLeadCaptureStorage(() => ({ localStorage: storage }));
  assert.equal(store.isPopupSuppressed(NOW), true);
  store.clearPopupState();
  assert.equal(store.isPopupSuppressed(NOW), false);
  assert.equal(storage.map.size, 0);
});

// ─── corrupt or hostile stored values ───────────────────────────────────────

test('corrupt, unparseable or wrong-shaped state is ignored instead of blocking', async () => {
  const { POPUP_STATE_KEY, createLeadCaptureStorage } = await loaded;
  const cases = [
    ['not json', 'nonsense'],
    ['null', 'null'],
    ['array', '[]'],
    ['missing reason', JSON.stringify({ at: daysAgo(1) })],
    ['unknown reason', JSON.stringify({ reason: 'whatever', at: daysAgo(1) })],
    ['missing timestamp', JSON.stringify({ reason: 'dismissed' })],
    ['unparseable timestamp', JSON.stringify({ reason: 'dismissed', at: 'yesterday' })],
    ['number', '7'],
  ];
  for (const [label, value] of cases) {
    const store = createLeadCaptureStorage(() => ({ localStorage: fakeStorage({ [POPUP_STATE_KEY]: value }) }));
    assert.equal(store.isPopupSuppressed(NOW), false, `${label} must not suppress the offer`);
    assert.equal(store.readPopupState(NOW), null, label);
  }
});

// ─── rate limiting fails open ───────────────────────────────────────────────

test('the rate limiter throttles a burst and releases after the window', async () => {
  const { NEWSLETTER_RATE_LIMIT_KEY, RATE_LIMIT_MAX_ATTEMPTS, createLeadCaptureStorage } = await loaded;
  const storage = fakeStorage();
  const store = createLeadCaptureStorage(() => ({ localStorage: storage }));
  for (let attempt = 0; attempt < RATE_LIMIT_MAX_ATTEMPTS; attempt += 1) {
    assert.equal(store.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW }), true, `attempt ${attempt + 1}`);
    store.recordAttempt(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW + attempt });
  }
  assert.equal(store.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW + 1000 }), false, 'the fourth attempt is throttled');
  assert.equal(store.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW + 61_000 }), true, 'the window rolls over');
});

test('stored attempt history that is not a list of numbers is discarded', async () => {
  const { NEWSLETTER_RATE_LIMIT_KEY, createLeadCaptureStorage } = await loaded;
  for (const value of ['{"not":"an array"}', '[null,"x",{},1e999]', '"just a string"', '42']) {
    const store = createLeadCaptureStorage(() => ({ localStorage: fakeStorage({ [NEWSLETTER_RATE_LIMIT_KEY]: value }) }));
    assert.equal(store.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW }), true, value);
  }
});

test('attempt history does not grow without bound', async () => {
  const { NEWSLETTER_RATE_LIMIT_KEY, createLeadCaptureStorage } = await loaded;
  const storage = fakeStorage();
  const store = createLeadCaptureStorage(() => ({ localStorage: storage }));
  for (let minute = 0; minute < 40; minute += 1) {
    store.recordAttempt(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW + minute * 60_000 });
  }
  const stored = JSON.parse(storage.map.get(NEWSLETTER_RATE_LIMIT_KEY));
  assert.ok(stored.length <= 2, `kept ${stored.length} timestamps`);
});

test('the newsletter and cart keys are separate, so one cannot throttle the other', async () => {
  const { NEWSLETTER_RATE_LIMIT_KEY, CART_RATE_LIMIT_KEY, createLeadCaptureStorage } = await loaded;
  assert.notEqual(NEWSLETTER_RATE_LIMIT_KEY, CART_RATE_LIMIT_KEY);
  const storage = fakeStorage();
  const store = createLeadCaptureStorage(() => ({ localStorage: storage }));
  for (let attempt = 0; attempt < 3; attempt += 1) store.recordAttempt(CART_RATE_LIMIT_KEY, { now: NOW });
  assert.equal(store.checkRateLimit(CART_RATE_LIMIT_KEY, { now: NOW }), false);
  assert.equal(store.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW }), true);
});

// ─── blocked or missing storage must never block a lead ─────────────────────

test('blocked storage fails open on every call and never throws', async () => {
  const { NEWSLETTER_RATE_LIMIT_KEY, createLeadCaptureStorage } = await loaded;
  const store = createLeadCaptureStorage(() => ({ localStorage: throwingStorage() }));
  assert.equal(store.isAvailable(), false);
  assert.equal(store.isPopupSuppressed(NOW), false, 'a browser that cannot remember still gets the offer');
  assert.equal(store.readPopupState(NOW), null);
  assert.doesNotThrow(() => store.rememberPopupDismissal(NOW));
  assert.doesNotThrow(() => store.rememberPopupSignup(NOW));
  assert.doesNotThrow(() => store.rememberPopupState('dismissed', NOW));
  assert.doesNotThrow(() => store.clearPopupState());
  assert.equal(store.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW }), true, 'submission is never blocked');
  assert.doesNotThrow(() => store.recordAttempt(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW }));
});

test('storage that accepts writes but throws on reads still cannot block a submit', async () => {
  const { NEWSLETTER_RATE_LIMIT_KEY, createLeadCaptureStorage } = await loaded;
  const halfBroken = {
    getItem: () => { throw new Error('QuotaExceededError'); },
    setItem: () => {},
    removeItem: () => {},
  };
  const store = createLeadCaptureStorage(() => ({ localStorage: halfBroken }));
  assert.equal(store.isAvailable(), true, 'the probe itself succeeds');
  assert.equal(store.isPopupSuppressed(NOW), false);
  assert.equal(store.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW }), true);
});

test('no window at all (SSR, prerender, worker) is treated as no storage', async () => {
  const { NEWSLETTER_RATE_LIMIT_KEY, createLeadCaptureStorage } = await loaded;
  const store = createLeadCaptureStorage(() => undefined);
  assert.equal(store.isAvailable(), false);
  assert.equal(store.isPopupSuppressed(NOW), false);
  assert.equal(store.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY, { now: NOW }), true);
  assert.doesNotThrow(() => store.rememberPopupDismissal(NOW));
});

test('the module reads window lazily and never at import time', () => {
  const source = fs.readFileSync(path.join(root, 'src/lib/leadCaptureStorage.ts'), 'utf8');
  assert.match(source, /typeof window === 'undefined' \? undefined : window/);
  const topLevelCalls = source.split('\n').filter((line) => /^leadCaptureStorage\./.test(line));
  assert.deepEqual(topLevelCalls, []);
  assert.match(source, /export const leadCaptureStorage/);
});

test('the components no longer talk to localStorage directly', () => {
  for (const file of [
    'src/components/home/NewVisitorPopup.tsx',
    'src/components/cart/EmailCaptureModal.tsx',
  ]) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const codeOnly = source
      .split('\n')
      .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
      .join('\n');
    assert.doesNotMatch(codeOnly, /localStorage\.(getItem|setItem|removeItem)/, `${file} bypasses the safe helper`);
    assert.match(codeOnly, /leadCaptureStorage/, `${file} must use the shared helper`);
  }
});
