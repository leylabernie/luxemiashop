const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');
const measurementId = 'G-D1NN0TC3Y0';
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bootstrap = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).find(script => script.includes('googletagmanager.com/gtag/js'));

function runBootstrap(idleCallbackAvailable) {
  const callbacks = {};
  const scripts = [];
  const consent = ['consent', 'default', { analytics_storage: 'denied' }];
  const context = {
    dataLayer: [consent],
    document: {
      createElement: tag => ({ tag }),
      head: { appendChild: script => scripts.push(script) },
    },
    addEventListener: (name, callback) => { callbacks[name] = callback; },
    setTimeout: (callback, delay) => { callbacks.timer = callback; callbacks.delay = delay; },
  };
  context.window = context;
  if (idleCallbackAvailable) {
    context.requestIdleCallback = (callback, options) => {
      callbacks.idle = callback;
      callbacks.idleOptions = options;
    };
  }
  vm.runInNewContext(bootstrap, context);
  return { context, callbacks, scripts, consent };
}

for (const idleCallbackAvailable of [true, false]) {
  test(`GA4 destination is configured before early ecommerce events (${idleCallbackAvailable ? 'idle' : 'load fallback'})`, () => {
    const { context, callbacks, scripts, consent } = runBootstrap(idleCallbackAvailable);
    context.gtag('event', 'view_item', { items: [{ item_id: 'synthetic-variant' }] });
    const queue = context.dataLayer.map(command => Array.from(command));
    assert.equal(context.dataLayer[0], consent, 'Existing consent queue must not be reset');
    assert.deepEqual(queue.map(command => command[0]), ['consent', 'js', 'config', 'event']);
    assert.equal(queue[2][1], measurementId);
    assert.equal(queue[2][2].send_page_view, false, 'SPA page tracking remains authoritative');
    assert.equal(queue[2][2].allow_google_signals, true);
    assert.deepEqual(Array.from(queue[2][2].linked_domains), ['luxemia.shop']);
    assert.equal(scripts.length, 0, 'Loading the external library must remain deferred');

    if (idleCallbackAvailable) {
      assert.equal(callbacks.idleOptions.timeout, 4000);
      callbacks.idle();
    } else {
      callbacks.load();
      assert.equal(callbacks.delay, 200);
      assert.equal(scripts.length, 0);
      callbacks.timer();
    }
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].async, true);
    assert.equal(scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
    assert.equal(context.dataLayer.filter(command => command[0] === 'config').length, 1);
    assert.equal(context.dataLayer.filter(command => command[0] === 'event').length, 1);
  });
}

test('cart analytics exclude free-text notes and body measurements but checkout retains them', async () => {
  const result = await build({
    entryPoints: [path.join(root, 'src/stores/cartStore.ts')],
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
    alias: { '@': path.join(root, 'src') },
    plugins: [{ name: 'no-network-checkout', setup(builder) {
      builder.onResolve({ filter: /^@\/lib\/shopify$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
        contents: 'export const createStorefrontCheckout = async (...args) => { globalThis.analyticsCheckoutCalls.push(args); return "https://shop.example/checkout"; };',
        loader: 'js',
      }));
    } }],
  });
  const originalWindow = globalThis.window;
  const originalStorage = globalThis.localStorage;
  const originalCalls = globalThis.analyticsCheckoutCalls;
  const events = [];
  const storage = new Map();
  globalThis.window = { gtag: (...args) => events.push(args) };
  globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  globalThis.analyticsCheckoutCalls = [];
  try {
    const module = { exports: {} };
    new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
    const store = module.exports.useCartStore;
    const privateNote = 'SYNTHETIC ONLY: email test@example.invalid; fit note';
    const cases = [
      undefined,
      [],
      [{ key: 'Custom Alteration Instructions', value: privateNote }],
      [{ key: 'Requested Custom Color', value: privateNote }],
      [{ key: 'Stitching Size', value: 'SYNTHETIC-MEASUREMENT-36' }],
      [{ key: 'Measurements', value: privateNote }],
      [{ key: 'Stitching Type', value: privateNote }],
    ];
    for (const customAttributes of cases) {
      events.length = 0;
      store.setState({ items: [] });
      const line = {
        variantId: 'gid://shopify/ProductVariant/1', variantTitle: 'M', quantity: 1,
        price: { amount: '100', currencyCode: 'USD' }, selectedOptions: [], customAttributes,
        product: { node: { id: 'gid://shopify/Product/1', handle: 'synthetic-menswear', title: 'Synthetic garment' } },
      };
      store.getState().addItem(line);
      store.getState().trackCartView();
      store.getState().updateQuantity(line.variantId, 2, customAttributes);
      store.getState().updateQuantity(line.variantId, 1, customAttributes);
      await store.getState().createCheckout();
      assert.deepEqual(store.getState().items[0].customAttributes, customAttributes);
      assert.deepEqual(globalThis.analyticsCheckoutCalls.at(-1)[0][0].customAttributes, customAttributes);
      store.getState().removeItem(line.variantId, customAttributes);
      assert.deepEqual(events.map(event => event[1]), [
        'add_to_cart', 'view_cart', 'add_to_cart', 'remove_from_cart',
        'begin_checkout', 'checkout_handoff_success', 'remove_from_cart',
      ]);
      for (const [, , payload] of events) {
        assert.equal(payload.items[0].item_tailoring_option, undefined, customAttributes?.[0]?.key);
        assert.equal(payload.items[0].item_id, line.variantId);
        assert.equal(payload.currency, 'USD');
        assert.doesNotMatch(JSON.stringify(payload), /test@example|SYNTHETIC-MEASUREMENT|fit note/);
      }
    }

    // Old carts are not exempt: the persisted fulfillment notes survive
    // rehydration but cannot become event dimensions when the bag is reopened.
    const persistedAttributes = [
      { key: 'Custom Alteration Instructions', value: privateNote },
      { key: 'Requested Custom Color', value: privateNote },
    ];
    storage.set('shopify-cart', JSON.stringify({ version: 0, state: {
      items: [{
        variantId: 'gid://shopify/ProductVariant/1', variantTitle: 'M', quantity: 1,
        price: { amount: '100', currencyCode: 'USD' }, selectedOptions: [],
        customAttributes: persistedAttributes,
        product: { node: { id: 'gid://shopify/Product/1', handle: 'synthetic-menswear', title: 'Synthetic garment' } },
      }], cartId: null, checkoutUrl: null,
    } }));
    await store.persist.rehydrate();
    store.getState().trackCartView();
    assert.deepEqual(store.getState().items[0].customAttributes, persistedAttributes);
    assert.equal(events.at(-1)[2].items[0].item_tailoring_option, undefined);
    assert.doesNotMatch(JSON.stringify(events.at(-1)), /test@example/);

    for (const [key, value, expected] of [
      ['Stitching Type', 'Semi Stitched', 'Semi Stitched'],
      ['Stitching Type', 'Ready to Wear', 'Ready to Wear'],
      ['Stitching Type', 'Made to Measure (UDesign)', 'Made to Measure (UDesign)'],
      ['Tailoring', 'Tailored to order', 'Tailored to order'],
      ['Custom Size', 'Measurements must be confirmed before production', 'Custom Size'],
      ['Made to Order', 'Yes — confirmation required', 'Made to Order'],
    ]) {
      store.setState({ items: [] });
      store.getState().addItem({
        variantId: 'gid://shopify/ProductVariant/1', variantTitle: 'M', quantity: 1,
        price: { amount: '100', currencyCode: 'USD' }, selectedOptions: [],
        customAttributes: [{ key: 'Custom Alteration Instructions', value: privateNote }, { key, value }],
        product: { node: { id: 'gid://shopify/Product/1', handle: 'synthetic-menswear', title: 'Synthetic garment' } },
      });
      assert.equal(events.at(-1)[2].items[0].item_tailoring_option, expected);
      assert.doesNotMatch(JSON.stringify(events.at(-1)), /test@example/);
    }
    assert.equal(events.some(event => event[1] === 'purchase'), false, 'No purchase without verified order proof');
  } finally {
    globalThis.window = originalWindow;
    globalThis.localStorage = originalStorage;
    globalThis.analyticsCheckoutCalls = originalCalls;
  }
});
