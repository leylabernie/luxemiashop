// Offline investigation only: no browser, Shopify requests, or orders.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { build } = require('esbuild');
const root = path.resolve(__dirname, '..');
let code;
let memory;
let calls;
let response;
const previous = { window: global.window, localStorage: global.localStorage, checkout: global.__previewCartCheckout };

test.before(async () => {
  const result = await build({ entryPoints: [path.join(root, 'src/stores/cartStore.ts')], bundle: true,
    write: false, platform: 'node', format: 'cjs', packages: 'external',
    alias: { '@': path.join(root, 'src') }, plugins: [{ name: 'no-network-cart-investigation', setup(b) {
      // Preserve the real cart store and real analytics send path. Only replace
      // hosted-checkout creation and unrelated page-view marketing integration.
      b.onResolve({ filter: /^@\/lib\/shopify$/ }, a => ({ path: a.path, namespace: 'checkout-fixture' }));
      b.onLoad({ filter: /.*/, namespace: 'checkout-fixture' }, () => ({ loader: 'js',
        contents: 'export const createStorefrontCheckout=(...args)=>globalThis.__previewCartCheckout(...args);' }));
      b.onResolve({ filter: /\/marketingPixels$|^\.\.\/lib\/marketingPixels$/ }, a => ({ path: a.path, namespace: 'marketing-fixture' }));
      b.onLoad({ filter: /.*/, namespace: 'marketing-fixture' }, () => ({ loader: 'js', contents: 'export const trackMarketingPageView=()=>{};' }));
    } }] });
  code = result.outputFiles[0].text;
});
test.beforeEach(() => {
  memory = new Map(); calls = []; response = async () => 'https://lovable-project-zlh0w.myshopify.com/cart/c/OFFLINE-FIXTURE';
  global.window = { luxemiaAnalyticsEnabled: false };
  global.localStorage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) };
  global.__previewCartCheckout = (...args) => { calls.push(args); return response(...args); };
});
test.after(() => {
  global.window = previous.window; global.localStorage = previous.localStorage; global.__previewCartCheckout = previous.checkout;
});
function loadStore() {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(require, module, module.exports);
  return module.exports.useCartStore;
}
// Identity/options/price from the owner's saved production Collections.html.
// Historical listing facts, NOT a current availability/inventory verification.
const line = () => ({ variantId: 'gid://shopify/ProductVariant/48414633296043', variantTitle: '32',
  quantity: 2, price: { amount: '23.3', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: '32' }],
  product: { node: { id: 'gid://shopify/Product/9135411593387', handle: 'black-georgette-sequin-floral-sharara-suit',
    title: 'Black Georgette Sequin Floral Sharara Suit – Festive Wear', productType: 'Salwar Suit',
    availableForSale: true, tags: ['construction:Fully Stitched'], images: { edges: [] }, variants: { edges: [] } } } });
const savedItems = () => JSON.parse(memory.get('shopify-cart')).state.items;

test('exact reported size-32 line adds locally and persists without any Shopify request', () => {
  const store = loadStore(); store.getState().addItem(line());
  assert.equal(calls.length, 0);
  assert.equal(store.getState().items.length, 1);
  assert.equal(store.getState().items[0].quantity, 2);
  assert.deepEqual(savedItems(), JSON.parse(JSON.stringify(store.getState().items)));
  assert.deepEqual(store.getState().items[0].selectedOptions, [{ name: 'Size', value: '32' }]);
  assert.deepEqual(store.getState().items[0].price, line().price);
});

test('new store initialization reloads the saved line; quantity edit persists and checkout receives latest snapshot', async () => {
  loadStore().getState().addItem(line());
  const reloaded = loadStore();
  assert.equal(reloaded.getState().items[0].quantity, 2);
  reloaded.getState().updateQuantity(line().variantId, 3);
  assert.equal(savedItems()[0].quantity, 3);
  assert.ok(await reloaded.getState().createCheckout({ trackEvents: false }));
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0][0].variantId, line().variantId);
  assert.equal(calls[0][0][0].quantity, 3);
  assert.deepEqual(calls[0][2][line().variantId], line().price);
  assert.equal(JSON.parse(memory.get('shopify-cart')).state.checkoutUrl, null);
  assert.equal(reloaded.getState().items[0].quantity, 3);
});

test('rejected checkout preserves bag and persistence and does not expose a successful URL', async () => {
  const store = loadStore(); store.getState().addItem(line());
  response = async () => { throw new Error('OFFLINE_INJECTED_REJECTION'); };
  const original = console.error; console.error = () => {};
  try { assert.equal(await store.getState().createCheckout({ trackEvents: false }), null); }
  finally { console.error = original; }
  assert.equal(store.getState().checkoutUrl, null);
  assert.ok(store.getState().checkoutError);
  assert.equal(store.getState().isLoading, false);
  assert.equal(store.getState().items[0].quantity, 2);
  assert.equal(savedItems()[0].quantity, 2);
});

test('late checkout result cannot overwrite edited quantity or install a stale checkout URL', async () => {
  const store = loadStore(); store.getState().addItem(line());
  let finish; response = () => new Promise(resolve => { finish = resolve; });
  const pending = store.getState().createCheckout({ trackEvents: false });
  store.getState().updateQuantity(line().variantId, 4);
  finish('https://lovable-project-zlh0w.myshopify.com/cart/c/STALE-OFFLINE');
  assert.equal(await pending, null);
  assert.equal(store.getState().checkoutUrl, null);
  assert.equal(store.getState().items[0].quantity, 4);
  assert.equal(savedItems()[0].quantity, 4);
});

test('injected throwing gtag reproduces empty bag before mutation; NOT proof of browser root cause', () => {
  const store = loadStore();
  global.window = { luxemiaAnalyticsEnabled: true, gtag() { throw new Error('OFFLINE_INJECTED_TAG_EXCEPTION'); } };
  assert.throws(() => store.getState().addItem(line()), /OFFLINE_INJECTED_TAG_EXCEPTION/);
  assert.equal(store.getState().items.length, 0);
  assert.equal(memory.has('shopify-cart'), false);
  assert.equal(calls.length, 0);
});

test('injected persistence failure leaves memory updated but storage empty: a different failure signature', () => {
  const store = loadStore();
  global.localStorage.setItem = () => { throw new Error('OFFLINE_INJECTED_STORAGE_EXCEPTION'); };
  assert.throws(() => store.getState().addItem(line()), /OFFLINE_INJECTED_STORAGE_EXCEPTION/);
  assert.equal(store.getState().items[0].quantity, 2);
  assert.equal(memory.has('shopify-cart'), false);
});

test('source trace: product and drawer share cart module; label counts lines, not total units', () => {
  const info = fs.readFileSync(path.join(root, 'src/components/product/ProductInfo.tsx'), 'utf8');
  const drawer = fs.readFileSync(path.join(root, 'src/components/cart/CartDrawer.tsx'), 'utf8');
  for (const source of [info, drawer]) assert.match(source, /from ['"]@\/stores\/cartStore['"]/);
  assert.match(drawer, /\(\{items\.length\}\)/);
  assert.match(info, /onClick=\{handleAddToCart\}/);
  assert.match(info, /onClick=\{\(\) => setQuantity\(/);
});

test('in-flight checkout preparation rejects a duplicate call without a second request', async () => {
  const store = loadStore(); store.getState().addItem(line());
  let finish; response = () => new Promise(resolve => { finish = resolve; });
  const first = store.getState().createCheckout({ trackEvents: false });
  assert.equal(await store.getState().createCheckout({ trackEvents: false }), null);
  assert.equal(calls.length, 1);
  finish('https://lovable-project-zlh0w.myshopify.com/cart/c/OFFLINE-ONE');
  assert.ok(await first);
  assert.equal(store.getState().items[0].quantity, 2);
});

test('local add API deliberately merges repeat calls: product handler needs its own submission guard', () => {
  const store = loadStore();
  store.getState().addItem(line()); store.getState().addItem(line());
  assert.equal(store.getState().items.length, 1);
  assert.equal(store.getState().items[0].quantity, 4);
  assert.equal(savedItems()[0].quantity, 4);
  // This characterizes current behavior; it does NOT claim duplicate UI clicks
  // are prevented. Intentional separate additions must remain possible.
});
