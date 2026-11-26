import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

/**
 * Server-side Meta checkout translator (`/meta-checkout` → `api/meta-checkout.ts`).
 *
 * Commerce Manager validates the configured checkout URL with a plain HTTP
 * request, which the SPA cannot answer: vercel.json's catch-all serves
 * index.html and the validator sees no products. These tests pin the 302, the
 * guards that keep the rest of the Meta catalog working, and the routing that
 * decides which requests the function owns.
 */
const compiled = await build({
  entryPoints: ['api/meta-checkout.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
});
const mod = { exports: {} };
new Function('module', 'exports', 'require', compiled.outputFiles[0].text)(mod, mod.exports, createRequire(import.meta.url));
const {
  SHOPIFY_STORE_ORIGIN,
  SHOPIFY_CHECKOUT_HOST,
  SHOPIFY_PERMANENT_DOMAIN,
  createStorefrontCart,
  MAX_QUANTITY,
  translateMetaCheckout,
  buildCartPermalink,
  readAttribution,
  readCoupon,
  spaHandoffLocation,
  default: handler,
} = mod.exports;

for (const key of ['SHOPIFY_STOREFRONT_TOKEN', 'VITE_SHOPIFY_STOREFRONT_TOKEN', 'SHOPIFY_STOREFRONT_ACCESS_TOKEN']) {
  delete process.env[key];
}

// Meta's own test cart, and the two approved pilot variants it names.
const META_TEST_QUERY = '?products=lmv-48120657903787:1,lmv-48210922504363:5&cart_origin=meta_shops';
const ANARKALI_S = '48120657903787';
const PEACH_S = '48210922504363';
const EXPECTED_CART_PATH = `/cart/${ANARKALI_S}:1,${PEACH_S}:5`;

function mockRes() {
  const headers = new Map();
  const res = {
    statusCode: null,
    headers,
    body: undefined,
    ended: false,
    setHeader(key, value) { headers.set(key.toLowerCase(), value); return res; },
    status(code) { res.statusCode = code; return res; },
    end(body) { res.ended = true; if (body !== undefined) res.body = body; return res; },
  };
  return res;
}

/** Query string → what Vercel's `req.query` would contain. */
function queryFrom(search) {
  const params = new URLSearchParams(search);
  const query = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    query[key] = all.length > 1 ? all : all[0];
  }
  return query;
}

async function call(search, method = 'GET') {
  const res = mockRes();
  await handler({ method, query: queryFrom(search), headers: { host: 'luxemia.shop' } }, res);
  return res;
}

const locationOf = (res) => res.headers.get('location');

/** Strip comments before scanning source, so a documented example URL is not
 *  mistaken for hardcoded logic (the repo's `copyOnly()` convention). */
const codeOnly = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !line.trim().startsWith('//'))
  .join('\n');

// ─── the acceptance test from the deploy request ────────────────────────────

test('Meta validator URL: GET and HEAD both 302 to the Shopify cart permalink', async () => {
  for (const method of ['GET', 'HEAD']) {
    const res = await call(META_TEST_QUERY, method);
    assert.equal(res.statusCode, 302, method);
    const location = new URL(locationOf(res));
    assert.equal(location.origin, SHOPIFY_STORE_ORIGIN, method);
    assert.equal(location.pathname, EXPECTED_CART_PATH, `${method}: exact items and quantities, in the order Meta sent them`);
    assert.equal(res.body, undefined, `${method}: a redirect carries no body`);
    assert.equal(res.ended, true, method);
  }
});

test('the redirect keeps the attribution Meta asks us to pass along, and nothing else', async () => {
  const res = await call(META_TEST_QUERY);
  const location = new URL(locationOf(res));
  // Meta's checkout-URL spec: "If you perform a redirect to a different URL, be
  // sure to pass along these parameters." middleware.ts does the same for
  // Merchant Center cart links.
  assert.equal(location.searchParams.get('cart_origin'), 'meta_shops');
  assert.equal(location.searchParams.get('discount'), null, 'no coupon was sent');

  const tracked = await call(`${META_TEST_QUERY}&utm_source=facebook&utm_medium=shops&utm_campaign=diwali&fbclid=AbC-123_x`);
  const trackedLocation = new URL(locationOf(tracked));
  for (const [key, value] of [['utm_source', 'facebook'], ['utm_medium', 'shops'], ['utm_campaign', 'diwali'], ['fbclid', 'AbC-123_x']]) {
    assert.equal(trackedLocation.searchParams.get(key), value, key);
  }

  // An allowlist, not a passthrough: nothing may steer the redirect target.
  const hostile = await call(`${META_TEST_QUERY}&redirect_to=https://evil.example/cart&next=//evil.example&checkout_url=https://evil.example&cart_origin=evil`);
  const hostileLocation = new URL(locationOf(hostile));
  assert.equal(hostileLocation.origin, SHOPIFY_STORE_ORIGIN);
  assert.equal(hostileLocation.pathname, EXPECTED_CART_PATH);
  assert.deepEqual([...hostileLocation.searchParams.keys()], [], 'no unknown parameter survives');
  assert.equal(hostileLocation.searchParams.get('cart_origin'), null, 'cart_origin is validated against facebook|instagram|meta_shops');
});

test('a coupon becomes ?discount= on the cart permalink', async () => {
  const res = await call(`${META_TEST_QUERY}&coupon=FIRST10`);
  const location = new URL(locationOf(res));
  assert.equal(location.pathname, EXPECTED_CART_PATH);
  assert.equal(location.searchParams.get('discount'), 'FIRST10');
  assert.equal(location.searchParams.get('cart_origin'), 'meta_shops');

  const encoded = translateMetaCheckout('?products=lmv-48120657903787:1&coupon=FAMILY%20%26%20FRIENDS');
  assert.equal(encoded.kind, 'cart');
  assert.match(encoded.location, /discount=FAMILY\+%26\+FRIENDS|discount=FAMILY%20%26%20FRIENDS/);
});

test('a bare or blank &coupon flag still redirects: Meta Preview sends it with no value', async () => {
  // Meta's Preview checkout tool appends `&coupon` when no promotion was entered.
  // src/lib/metaCheckout.ts already treats that as "no coupon" (and is tested for
  // it), so this function must not be stricter than the page it stands in for —
  // rejecting a blank turned Meta's own checkout test into a 400.
  for (const suffix of ['&coupon', '&coupon=', '&coupon=%20', '&coupon=%20%20', '&coupon=+']) {
    for (const method of ['GET', 'HEAD']) {
      const res = await call(`${META_TEST_QUERY}${suffix}`, method);
      assert.equal(res.statusCode, 302, `${suffix} ${method}`);
      const location = new URL(locationOf(res));
      assert.equal(location.pathname, EXPECTED_CART_PATH, suffix);
      assert.equal(location.searchParams.has('discount'), false, `${suffix}: no discount code is invented`);
      assert.equal(location.searchParams.get('cart_origin'), 'meta_shops', suffix);
    }
    assert.equal(translateMetaCheckout(`${META_TEST_QUERY}${suffix}`).coupon, null, suffix);
  }
});

test('a padded coupon code is trimmed before it reaches Shopify', async () => {
  const res = await call(`${META_TEST_QUERY}&coupon=%20FIRST10%20`);
  assert.equal(res.statusCode, 302);
  assert.equal(new URL(locationOf(res)).searchParams.get('discount'), 'FIRST10',
    'Shopify matches a discount code exactly, so the padding must not ride along');
});

test('the coupon rule stays in step with the storefront page it mirrors', () => {
  const source = readFileSync('src/lib/metaCheckout.ts', 'utf8');
  assert.match(codeOnly(source), /params\.get\('coupon'\)\s*\|\|\s*null/,
    'parseMetaCheckout() still treats an absent or empty coupon as no coupon');
  assert.match(source, /bare `&coupon`/, 'the reason is still documented there too');
});

test('every response is uncacheable, and no redirect tells a crawler not to follow it', async () => {
  // `nofollow` on a 3xx can be read as "do not follow this redirect", which is
  // one way Meta's server-side test reports "The checkout page couldn't be
  // loaded" even though the redirect itself is correct.
  for (const [search, method, robots] of [
    [META_TEST_QUERY, 'GET', 'noindex'],
    [META_TEST_QUERY, 'HEAD', 'noindex'],
    ['?products=lmv-99999999999999:1', 'GET', 'noindex'],
    ['?products=nope', 'GET', 'noindex, nofollow'],
    [META_TEST_QUERY, 'POST', 'noindex, nofollow'],
  ]) {
    const res = await call(search, method);
    assert.equal(res.headers.get('cache-control'), 'no-store', `${search} ${method}`);
    assert.equal(res.headers.get('x-robots-tag'), robots, `${search} ${method}`);
    assert.equal(res.statusCode === 302, robots === 'noindex', `${search} ${method}`);
  }
});

test('middleware does not overwrite that with nofollow on a private-route redirect', () => {
  // /meta-checkout is in PRIVATE_SPA_ROUTES, and withResponseHeader() uses
  // headers.set(), so middleware has the last word on X-Robots-Tag.
  const source = readFileSync('middleware.ts', 'utf8');
  const start = source.indexOf('PRIVATE_SPA_ROUTES.has(pathname)');
  assert.ok(start > 0, 'the private-route branch still exists');
  const block = source.slice(start, start + 900);
  assert.match(block, /status >= 300 && privateResponse\.status < 400/, 'redirects are detected');
  assert.match(block, /\?\s*'noindex'\s*:\s*'noindex, nofollow'/, 'a redirect gets noindex alone');
});

// ─── basket shaping ─────────────────────────────────────────────────────────

test('repeated IDs are merged, quantities summed, order preserved', () => {
  const result = translateMetaCheckout(`?products=lmv-${PEACH_S}:2,lmv-${ANARKALI_S}:1,lmv-${PEACH_S}:3`);
  assert.equal(result.kind, 'cart');
  assert.deepEqual(result.lines, [{ variantId: PEACH_S, quantity: 5 }, { variantId: ANARKALI_S, quantity: 1 }]);
  assert.match(result.location, new RegExp(`/cart/${PEACH_S}:5,${ANARKALI_S}:1$`));
});

test('the lmv- prefix is stripped and a bare variant ID resolves the same way', () => {
  const prefixed = translateMetaCheckout(`?products=lmv-${ANARKALI_S}:1`);
  const bare = translateMetaCheckout(`?products=${ANARKALI_S}:1`);
  assert.equal(prefixed.kind, 'cart');
  assert.equal(bare.kind, 'cart');
  assert.equal(new URL(bare.location).pathname, new URL(prefixed.location).pathname);
  assert.equal(new URL(prefixed.location).pathname, `/cart/${ANARKALI_S}:1`);
});

test('RFC 3986 escaping is handled however Vercel delivers it', () => {
  for (const raw of [
    `lmv-${ANARKALI_S}:1,lmv-${PEACH_S}:5`,
    `lmv-${ANARKALI_S}%3A1%2Clmv-${PEACH_S}%3A5`,
  ]) {
    // Vercel decodes the query before the function sees it; both forms must land
    // on the same cart.
    const decoded = decodeURIComponent(raw);
    const result = translateMetaCheckout(`?products=${encodeURIComponent(decoded)}`);
    assert.equal(result.kind, 'cart', raw);
    assert.equal(new URL(result.location).pathname, EXPECTED_CART_PATH, raw);
  }
});

test('quantity 99 is allowed and anything above it fails loudly instead of trimming', () => {
  const allowed = translateMetaCheckout(`?products=lmv-${ANARKALI_S}:${MAX_QUANTITY}`);
  assert.equal(allowed.kind, 'cart');
  assert.match(allowed.location, new RegExp(`:${MAX_QUANTITY}$`));

  for (const qty of [100, 150, 999]) {
    const result = translateMetaCheckout(`?products=lmv-${ANARKALI_S}:${qty}`);
    assert.equal(result.kind, 'rejected', `qty ${qty}`);
    assert.equal(result.status, 400, `qty ${qty}`);
    assert.match(result.body, /99/, `qty ${qty}`);
  }
  // Merging past the cap is rejected too, never silently cut down.
  const merged = translateMetaCheckout(`?products=lmv-${ANARKALI_S}:60,lmv-${ANARKALI_S}:60`);
  assert.equal(merged.kind, 'rejected');
  assert.equal(merged.status, 400);
});

// ─── the guards that keep the rest of the Meta catalog working ──────────────

test('an ID outside the approved pilot map is handed to the storefront page, not rejected', async () => {
  const result = translateMetaCheckout('?products=lmv-99999999999999:1');
  assert.equal(result.kind, 'spa-handoff');
  assert.equal(result.reason, 'unapproved');
  assert.equal(result.location, '/meta-checkout?products=lmv-99999999999999%3A1&review=1');
  assert.ok(result.location.startsWith('/'), 'the handoff stays on this origin');

  const served = await call('?products=lmv-99999999999999:1');
  assert.equal(served.statusCode, 302);
  assert.ok(locationOf(served).startsWith('/meta-checkout?'), 'a relative Location, never an external host');
  assert.match(locationOf(served), /review=1/, 'review=1 keeps vercel.json from routing it back here');
});

test('a basket that is only partly resolvable never becomes a partial cart', () => {
  // Silently skipping a line is how a validator reports "the number of products
  // was incorrect": the cart would hold fewer items than the link named.
  const mixed = translateMetaCheckout(`?products=lmv-${ANARKALI_S}:1,lmv-99999999999999:2`);
  assert.equal(mixed.kind, 'spa-handoff');
  const malformed = translateMetaCheckout(`?products=lmv-${ANARKALI_S}:1,not-a-product:2`);
  assert.equal(malformed.kind, 'spa-handoff');
  assert.equal(malformed.reason, 'malformed');
  for (const result of [mixed, malformed]) {
    assert.match(result.location, new RegExp(ANARKALI_S), 'the whole basket is preserved for the page');
    assert.match(result.location, /review=1/);
    assert.doesNotMatch(result.location, /^https?:/, 'never an absolute redirect');
  }
});

test('the SPA handoff keeps coupon and attribution so the page can finish the job', () => {
  const result = translateMetaCheckout('?products=lmv-99999999999999:1&coupon=FIRST10&cart_origin=instagram&utm_source=instagram');
  assert.equal(result.kind, 'spa-handoff');
  const params = new URLSearchParams(result.location.split('?')[1]);
  assert.equal(params.get('coupon'), 'FIRST10');
  assert.equal(params.get('cart_origin'), 'instagram');
  assert.equal(params.get('utm_source'), 'instagram');
  assert.equal(params.get('review'), '1');
  assert.equal(spaHandoffLocation(result.location.split('?')[1]), result.location, 'an existing review flag is not duplicated');
});

for (const [label, search] of [
  ['no products param', '?cart_origin=meta_shops'],
  ['empty products', '?products='],
  ['nothing parseable', '?products=hello,world'],
  ['repeated products param', `?products=lmv-${ANARKALI_S}:1&products=lmv-${PEACH_S}:1`],
  ['repeated coupon param', `?products=lmv-${ANARKALI_S}:1&coupon=A&coupon=B`],
  ['control character in coupon', `?products=lmv-${ANARKALI_S}:1&coupon=%00`],
  ['over-long coupon', `?products=lmv-${ANARKALI_S}:1&coupon=${'A'.repeat(257)}`],
  ['too many entries', `?products=${Array.from({ length: 51 }, () => `lmv-${ANARKALI_S}:1`).join(',')}`],
  ['over-long products value', `?products=${'9'.repeat(6001)}`],
]) {
  test(`400 without leaking internals: ${label}`, async () => {
    const result = translateMetaCheckout(search);
    assert.equal(result.kind, 'rejected', search);
    assert.equal(result.status, 400, search);
    const res = await call(search);
    assert.equal(res.statusCode, 400, search);
    assert.equal(res.headers.get('location'), undefined, 'a rejection never redirects');
    assert.equal(typeof res.body, 'string');
    assert.doesNotMatch(res.body, /shopify|myshopify|variant|stack|Error:/i, 'no internals in the body');
  });
}

test('only GET and HEAD are served', async () => {
  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
    const res = await call(META_TEST_QUERY, method);
    assert.equal(res.statusCode, 405, method);
    assert.equal(res.headers.get('allow'), 'GET, HEAD', method);
    assert.equal(res.headers.get('location'), undefined, method);
  }
});

test('no redirect can be aimed anywhere but the Shopify store or this origin', async () => {
  const targets = new Set();
  for (const search of [
    META_TEST_QUERY,
    `${META_TEST_QUERY}&coupon=FIRST10`,
    '?products=lmv-99999999999999:1',
    `?products=${ANARKALI_S}:1`,
    '?products=lmv-48120657903787:1,lmv-48210922504363:5,lmv-48121669583019:2',
  ]) {
    const res = await call(search);
    const location = locationOf(res);
    if (!location) continue;
    targets.add(location.startsWith('/') ? 'relative' : new URL(location).origin);
  }
  assert.deepEqual([...targets].sort(), [SHOPIFY_STORE_ORIGIN, 'relative'].sort());
  assert.equal(SHOPIFY_STORE_ORIGIN, `https://${SHOPIFY_CHECKOUT_HOST}`);
  assert.equal(SHOPIFY_CHECKOUT_HOST, 'checkout.luxemia.shop');
  assert.ok(!SHOPIFY_STORE_ORIGIN.includes('myshopify.com'),
    'shoppers and crawlers are sent to the branded host; the permanent myshopify domain only 301s there');
});

// ─── routing: which requests the function owns ──────────────────────────────

test('vercel.json rewrites only pilot-shaped Meta requests, before the SPA catch-all', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const rewrites = config.rewrites;
  const index = rewrites.findIndex(rule => rule.source === '/meta-checkout');
  assert.ok(index >= 0, 'the /meta-checkout rewrite exists');
  assert.equal(rewrites[index].destination, '/api/meta-checkout');
  assert.equal(rewrites.at(-1).destination, '/index.html', 'the SPA catch-all must stay last');
  assert.ok(index < rewrites.length - 1, 'the rewrite must precede the catch-all');
  assert.ok(rewrites.some(rule => rule.source === '/api/meta-checkout' && rule.destination === '/api/meta-checkout'),
    'the function path needs its own rewrite, like /api/meta-catalog and /api/sync-lead, or the catch-all swallows it');

  // Only Meta-shaped requests: a `products` list of pilot IDs, and no
  // `context` (session restore) or `review` (back-button return) marker.
  assert.deepEqual(rewrites[index].missing, [{ type: 'query', key: 'context' }, { type: 'query', key: 'review' }]);
  const condition = rewrites[index].has[0];
  assert.equal(condition.type, 'query');
  assert.equal(condition.key, 'products');

  const pattern = new RegExp(condition.value);
  const matches = (value) => Boolean(pattern.test(value));
  assert.equal(matches(`lmv-${ANARKALI_S}:1,lmv-${PEACH_S}:5`), true, "Meta's own test cart");
  assert.equal(matches(`lmv-${ANARKALI_S}%3A1%2Clmv-${PEACH_S}%3A5`), true, 'RFC 3986 escaping, if Vercel matches the raw value');
  assert.equal(matches(`${ANARKALI_S}:1`), true, 'a bare variant ID still reaches the allowlist');
  assert.equal(matches('sage-green-chinon-embroidered-a-line-palazzo-suit-floral-dupatta-ready-to-wear:1'), false, 'handle IDs keep the SPA');
  assert.equal(matches('lm-0a1b2c3d4e5f6a7b8c9d0e1f:2'), false, 'hashed IDs keep the SPA');
  assert.equal(matches(`lmv-${ANARKALI_S}:1,sage-green-suit:1`), false, 'a mixed basket keeps the SPA');
  assert.equal(matches(`lmv-${ANARKALI_S}:0`), false, 'quantity 0 keeps the SPA');
});

test('the eight pre-existing rewrites are untouched and in order', () => {
  const { rewrites } = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.deepEqual(rewrites.slice(0, 7).map(rule => rule.source), [
    '/_prerender/(.*)',
    '/google4e3f332d00afc8ba.html',
    '/google-shopping-feed.xml',
    '/gmc-images/:file.jpg',
    '/api/meta-catalog',
    '/api/gmc-feed',
    '/api/sync-lead',
  ]);
  assert.equal(rewrites.length, 10, 'two added: the function path and the conditional route');
});

test('the storefront flow that already works is left alone', () => {
  const page = readFileSync('src/pages/MetaCheckout.tsx', 'utf8');
  assert.match(page, /createStorefrontCheckout\(lines, request\.coupon, expectedPrices\)/);
  const context = readFileSync('src/lib/metaCheckoutContext.ts', 'utf8');
  assert.match(context, /review=1|reviewOnly: true/, 'the review marker this function reuses is the page\'s own');
  // The function must not become a second source of truth for the pilot IDs.
  // Comments are stripped first: the header quotes Meta's own example URL.
  const source = readFileSync('api/meta-checkout.ts', 'utf8');
  assert.match(source, /from '\.\.\/src\/lib\/metaPilot\.js'/);
  assert.match(source, /getMetaPilotVariant/);
  assert.doesNotMatch(codeOnly(source), /\d{11,}/, 'no variant ID is hardcoded in the logic');
  assert.doesNotMatch(codeOnly(source), /myshopify\.com\/cart\/\d/, 'no literal cart line is hardcoded');
});

// ─── the numbers Meta will check ────────────────────────────────────────────

test('the test cart resolves to the approved pilot variants and totals $496.44', () => {
  // Prices come from the catalog we publish to Meta, not from this test.
  const feed = readFileSync('catalog-imports/luxemia-gmc-feed-optimized.csv', 'utf8').split('\n');
  const priceOf = (variantId) => {
    const row = feed.find(line => line.includes(`-v${variantId},`) || line.includes(`anarkali-green-chinon-${variantId},`));
    assert(row, `variant ${variantId} is published in the GMC feed`);
    const match = /,in_stock,(\d+\.\d{2}) USD,/.exec(row);
    assert(match, `price found for ${variantId}`);
    return Number(match[1]);
  };
  const anarkali = priceOf(ANARKALI_S);
  const peach = priceOf(PEACH_S);
  assert.equal(anarkali, 108.99, 'anarkali-green-chinon S');
  assert.equal(peach, 77.49, 'dusty peach palazzo suit S');

  const result = translateMetaCheckout(META_TEST_QUERY);
  assert.equal(result.kind, 'cart');
  const subtotal = result.lines.reduce((sum, line) => sum + (line.variantId === ANARKALI_S ? anarkali : peach) * line.quantity, 0);
  assert.equal(subtotal.toFixed(2), '496.44', 'the subtotal Meta computes from its own catalog');

  // The compare-at price stays published: 154.97 with a 77.49 sale price.
  const merchantFeed = readFileSync('public/merchant-feed.xml', 'utf8');
  const peachBlock = merchantFeed.slice(merchantFeed.indexOf(`p9095376994475-v${PEACH_S}`));
  assert.match(peachBlock.slice(0, 2000), /<g:price>154\.97 USD<\/g:price>/);
  assert.match(peachBlock.slice(0, 2000), /<g:sale_price>77\.49 USD<\/g:sale_price>/);
});

test('pure helpers stay pure', () => {
  assert.deepEqual(readAttribution(new URLSearchParams('?cart_origin=meta_shops&junk=x')), { cart_origin: 'meta_shops' });
  assert.deepEqual(readAttribution(new URLSearchParams('?cart_origin=a&cart_origin=b')), {}, 'an ambiguous token is dropped');
  assert.equal(readCoupon(new URLSearchParams('?coupon=A')), 'A');
  assert.equal(readCoupon(new URLSearchParams('')), null, 'no coupon param at all');
  assert.equal(readCoupon(new URLSearchParams('?coupon=')), null, 'a bare &coupon= is no coupon');
  assert.equal(readCoupon(new URLSearchParams('?coupon=%20')), null, 'blank is no coupon, not an error');
  assert.equal(readCoupon(new URLSearchParams('?coupon=%20A%20')), 'A', 'padded codes are trimmed');
  assert.equal(readCoupon(new URLSearchParams('?coupon=%00')), 'invalid');
  assert.equal(readCoupon(new URLSearchParams(`?coupon=${'A'.repeat(257)}`)), 'invalid');
  assert.equal(
    buildCartPermalink([{ variantId: ANARKALI_S, quantity: 1 }], 'FIRST10', { cart_origin: 'meta_shops' }),
    `${SHOPIFY_STORE_ORIGIN}/cart/${ANARKALI_S}:1?discount=FIRST10&cart_origin=meta_shops`,
  );
});

test('a session restore or a back-button review return never becomes a cart redirect', async () => {
  // completeMetaHandoff leaves ?products=...&review=1 in the history so Back from
  // Shopify checkout shows the review step; ?context=<uuid> restores a session.
  const review = await call(`${META_TEST_QUERY}&review=1`);
  assert.equal(review.statusCode, 400, 'handing it back would 302 to the same URL and loop');
  assert.equal(review.headers.get('location'), undefined);
  assert.doesNotMatch(review.body, /shopify|myshopify/i);

  const token = '0b6f0a1e-6f5b-4b3d-9c2a-1d2e3f4a5b6c';
  const context = translateMetaCheckout(`?context=${token}`);
  assert.equal(context.kind, 'spa-handoff');
  assert.equal(context.reason, 'page-owned');
  assert.match(context.location, /^\/meta-checkout\?/);
  assert.match(context.location, /review=1/, 'the marker that keeps vercel.json from routing it back here');
  assert.notEqual(context.location, `/meta-checkout?context=${token}`, 'never a 302 to the same URL');

  const served = await call(`?context=${token}`);
  assert.equal(served.statusCode, 302);
  assert.ok(locationOf(served).startsWith('/meta-checkout?'));
});

// ─── Storefront API: the self-contained checkout URL ────────────────────────
//
// A `/cart/<variant>:<qty>` permalink only becomes a basket if the client keeps
// the cookies Shopify sets along the way. A server-side crawler keeps none, so
// the function prefers a checkout URL that carries its own cart token — the same
// `cartCreate` call the storefront page makes in the browser, moved server-side.

const STOREFRONT_URL = `https://${SHOPIFY_PERMANENT_DOMAIN}/api/2025-10/graphql.json`;

function summaryLocation(res) {
  const href = res.body.match(/class="button" href="([^"]+)"/)[1];
  return new URL(href.replaceAll('&amp;', '&'));
}

const cartPayload = () => ({
  data: {
    cartCreate: {
      userErrors: [],
      cart: {
        id: 'gid://shopify/Cart/c1',
        checkoutUrl: 'https://checkout.luxemia.shop/cart/c/TOKEN123?key=secret&_s=s1',
        totalQuantity: 6,
        cost: { totalAmount: { amount: '496.44', currencyCode: 'USD' } },
        lines: {
          pageInfo: { hasNextPage: false },
          edges: [
            { node: { quantity: 1, merchandise: { id: `gid://shopify/ProductVariant/${ANARKALI_S}`, price: { amount: '108.99', currencyCode: 'USD' }, product: { title: 'Anarkali green chinon S' } } } },
            { node: { quantity: 5, merchandise: { id: `gid://shopify/ProductVariant/${PEACH_S}`, price: { amount: '77.49', currencyCode: 'USD' }, product: { title: 'Dusty peach palazzo suit S' } } } },
          ],
        },
      },
    },
  },
});

/** Mutate a copy of the happy payload, so each case breaks exactly one thing. */
const brokenPayload = (mutate) => {
  const payload = cartPayload();
  mutate(payload.data.cartCreate.cart);
  return payload;
};

const jsonStub = (payload, ok = true) => async () => ({
  ok,
  status: ok ? 200 : 500,
  json: async () => payload,
});

async function withStorefront(fetchStub, body) {
  const original = globalThis.fetch;
  const calls = [];
  process.env.SHOPIFY_STOREFRONT_TOKEN = 'test-storefront-token';
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return fetchStub(calls.length);
  };
  try {
    return { result: await body(), calls };
  } finally {
    globalThis.fetch = original;
    delete process.env.SHOPIFY_STOREFRONT_TOKEN;
  }
}

test('a summary page shows the basket and links to the self-contained checkout', async () => {
  const { result: res, calls } = await withStorefront(jsonStub(cartPayload()), () => call(META_TEST_QUERY));
  assert.equal(res.statusCode, 200);
  assert.equal(locationOf(res), undefined);
  assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.match(res.body, /Subtotal: \$496\.44/);
  assert.match(res.body, /Anarkali green chinon S/);
  assert.match(res.body, /Dusty peach palazzo suit S/);
  const location = summaryLocation(res);
  assert.equal(location.hostname, SHOPIFY_CHECKOUT_HOST);
  assert.match(location.pathname, /^\/cart\/c\/[^/]+$/, 'the token path safeCheckoutPath() blesses');
  assert.equal(location.searchParams.get('key'), 'secret', "Shopify's own cart key survives");
  assert.equal(location.searchParams.get('cart_origin'), 'meta_shops', 'attribution is still passed along');
  assert.equal(location.searchParams.has('discount'), false);

  assert.equal(calls.length, 1, 'exactly one Storefront call');
  assert.equal(calls[0].url, STOREFRONT_URL);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['X-Shopify-Storefront-Access-Token'], 'test-storefront-token');
  assert.equal(calls[0].init.cache, 'no-store');
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.variables.input.lines, [
    { quantity: 1, merchandiseId: `gid://shopify/ProductVariant/${ANARKALI_S}` },
    { quantity: 5, merchandiseId: `gid://shopify/ProductVariant/${PEACH_S}` },
  ], 'the exact basket Meta named, in its order');
  assert.equal(body.variables.input.discountCodes, undefined, 'no coupon was sent');
});

test('the coupon is sent to Shopify as a discount code, and stays out of the URL', async () => {
  const { result: res, calls } = await withStorefront(jsonStub(cartPayload()), () => call(`${META_TEST_QUERY}&coupon=FIRST10`));
  assert.deepEqual(JSON.parse(calls[0].init.body).variables.input.discountCodes, ['FIRST10']);
  const location = summaryLocation(res);
  assert.equal(location.searchParams.get('discount'), null,
    'the token URL carries the discount already; a second ?discount= would be redundant');
});

test('a localized checkout path is accepted and a myshopify URL is re-hosted', async () => {
  const localized = brokenPayload(cart => { cart.checkoutUrl = 'https://checkout.luxemia.shop/en-ca/cart/c/TOKEN123?key=secret'; });
  const first = await withStorefront(jsonStub(localized), () => call(META_TEST_QUERY));
  assert.equal(summaryLocation(first.result).pathname, '/en-ca/cart/c/TOKEN123');

  const permanent = brokenPayload(cart => { cart.checkoutUrl = `https://${SHOPIFY_PERMANENT_DOMAIN}/cart/c/TOKEN123?key=secret`; });
  const second = await withStorefront(jsonStub(permanent), () => call(META_TEST_QUERY));
  assert.equal(summaryLocation(second.result).hostname, SHOPIFY_CHECKOUT_HOST,
    'whichever verified host Shopify names, the handoff is on the branded one');
});

test('without a token Shopify is never called and the permalink is used', async () => {
  const original = globalThis.fetch;
  let called = 0;
  globalThis.fetch = async () => { called += 1; return jsonStub(cartPayload())(); };
  try {
    const res = await call(META_TEST_QUERY);
    assert.equal(called, 0, 'no token, no API call');
    assert.equal(res.statusCode, 302);
    assert.equal(new URL(locationOf(res)).pathname, EXPECTED_CART_PATH);
  } finally {
    globalThis.fetch = original;
  }
});

test('anything but the exact basket Meta named falls back to the permalink', async () => {
  const extraLine = { node: { quantity: 1, merchandise: { id: 'gid://shopify/ProductVariant/999', price: { amount: '1.00', currencyCode: 'USD' } } } };
  const cases = [
    ['userErrors', () => ({ data: { cartCreate: { userErrors: [{ field: ['lines'], message: 'unavailable' }], cart: null } } })],
    ['HTTP 500', () => cartPayload(), false],
    ['no cart returned', () => ({ data: { cartCreate: { userErrors: [], cart: null } } })],
    ['empty checkoutUrl', () => brokenPayload(cart => { cart.checkoutUrl = ''; })],
    ['short totalQuantity', () => brokenPayload(cart => { cart.totalQuantity = 5; })],
    ['a dropped line', () => brokenPayload(cart => { cart.lines.edges = cart.lines.edges.slice(0, 1); cart.totalQuantity = 1; })],
    ['an extra line', () => brokenPayload(cart => { cart.lines.edges = [...cart.lines.edges, extraLine]; cart.totalQuantity = 7; })],
    ['a reduced quantity', () => brokenPayload(cart => { cart.lines.edges[1].node.quantity = 4; cart.totalQuantity = 5; })],
    ['a swapped variant', () => brokenPayload(cart => { cart.lines.edges[0].node.merchandise.id = 'gid://shopify/ProductVariant/123'; })],
    ['non-USD total', () => brokenPayload(cart => { cart.cost.totalAmount.currencyCode = 'EUR'; })],
    ['non-USD line price', () => brokenPayload(cart => { cart.lines.edges[0].node.merchandise.price.currencyCode = 'INR'; })],
    ['a second page of lines', () => brokenPayload(cart => { cart.lines.pageInfo.hasNextPage = true; })],
    ['an unverified host', () => brokenPayload(cart => { cart.checkoutUrl = 'https://checkout.luxemia.shop.evil.example/cart/c/TOKEN'; })],
    ['a lookalike subdomain', () => brokenPayload(cart => { cart.checkoutUrl = 'https://sub.checkout.luxemia.shop/cart/c/TOKEN'; })],
    ['a foreign myshopify store', () => brokenPayload(cart => { cart.checkoutUrl = 'https://other-store.myshopify.com/cart/c/TOKEN'; })],
    ['non-https', () => brokenPayload(cart => { cart.checkoutUrl = 'http://checkout.luxemia.shop/cart/c/TOKEN'; })],
    ['a permalink-shaped path', () => brokenPayload(cart => { cart.checkoutUrl = `https://checkout.luxemia.shop/cart/${ANARKALI_S}:1`; })],
    ['a bare /cart path', () => brokenPayload(cart => { cart.checkoutUrl = 'https://checkout.luxemia.shop/cart'; })],
    ['a traversal path', () => brokenPayload(cart => { cart.checkoutUrl = 'https://checkout.luxemia.shop/cart/c/TOKEN/../../admin'; })],
  ];
  for (const [label, payload, ok = true] of cases) {
    const { result: res } = await withStorefront(jsonStub(payload(), ok), () => call(META_TEST_QUERY));
    assert.equal(res.statusCode, 302, `${label}: still a redirect, never an error`);
    const location = new URL(locationOf(res));
    assert.equal(location.origin, SHOPIFY_STORE_ORIGIN, label);
    assert.equal(location.pathname, EXPECTED_CART_PATH, `${label}: the fallback still names every item`);
    assert.equal(location.searchParams.get('cart_origin'), 'meta_shops', label);
  }
});

test('a network failure, a timeout or a malformed body also falls back', async () => {
  const stubs = [
    ['fetch throws', async () => { throw new Error('ECONNRESET'); }],
    ['abort/timeout', async () => { throw new DOMException('The operation was aborted due to timeout', 'TimeoutError'); }],
    ['unparseable JSON', async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token'); } })],
    ['null body', async () => ({ ok: true, status: 200, json: async () => null })],
    ['GraphQL errors only', async () => ({ ok: true, status: 200, json: async () => ({ errors: [{ message: 'Throttled' }] }) })],
  ];
  for (const [label, stub] of stubs) {
    const { result: res } = await withStorefront(stub, () => call(META_TEST_QUERY));
    assert.equal(res.statusCode, 302, label);
    assert.equal(new URL(locationOf(res)).pathname, EXPECTED_CART_PATH, label);
  }
});

test('createStorefrontCart is null for an empty basket and never throws', async () => {
  process.env.SHOPIFY_STOREFRONT_TOKEN = 'test-storefront-token';
  const original = globalThis.fetch;
  let called = 0;
  globalThis.fetch = async () => { called += 1; return jsonStub(cartPayload())(); };
  try {
    assert.equal(await createStorefrontCart([], null, {}), null);
    assert.equal(called, 0, 'an empty basket never reaches Shopify');
    const url = await createStorefrontCart(
      [{ variantId: ANARKALI_S, quantity: 1 }, { variantId: PEACH_S, quantity: 5 }],
      null,
      { cart_origin: 'meta_shops', utm_source: 'instagram' },
    );
    assert.equal(new URL(url.url).searchParams.get('utm_source'), 'instagram');
  } finally {
    globalThis.fetch = original;
    delete process.env.SHOPIFY_STOREFRONT_TOKEN;
  }
});

test('the SPA handoff never calls Shopify: the page owns that basket', async () => {
  const { result: res, calls } = await withStorefront(jsonStub(cartPayload()),
    () => call('?products=lmv-99999999999999:1&cart_origin=meta_shops'));
  assert.equal(calls.length, 0, 'nothing is created for a basket this function cannot resolve');
  assert.equal(locationOf(res), '/meta-checkout?products=lmv-99999999999999%3A1&cart_origin=meta_shops&review=1');
});


test('summary HEAD has the same status and headers without a body', async () => {
  const { result: get } = await withStorefront(jsonStub(cartPayload()), () => call(META_TEST_QUERY));
  const { result: head } = await withStorefront(jsonStub(cartPayload()), () => call(META_TEST_QUERY, 'HEAD'));
  assert.equal(head.statusCode, 200);
  assert.deepEqual(head.headers, get.headers);
  assert.equal(head.body, undefined);
});

test('summary escapes titles and script delimiters in checkout attribution', async () => {
  const payload = brokenPayload(cart => {
    cart.lines.edges[0].node.merchandise.product.title = '<img src=x onerror=alert(1)> & "test"';
  });
  const { result: res } = await withStorefront(jsonStub(payload), () => call(META_TEST_QUERY));
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /&lt;img/);
  assert.doesNotMatch(res.body, /<img/);
});

test('invalid summary amounts and absent titles fall back rather than inventing prices', async () => {
  for (const mutate of [
    cart => { cart.cost.totalAmount.amount = 'NaN'; },
    cart => { cart.lines.edges[0].node.merchandise.price.amount = '-1'; },
    cart => { delete cart.lines.edges[0].node.merchandise.product; },
  ]) {
    const { result: res } = await withStorefront(jsonStub(brokenPayload(mutate)), () => call(META_TEST_QUERY));
    assert.equal(res.statusCode, 302);
  }
});
