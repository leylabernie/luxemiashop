const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');
const serviceHandle = 'luxemia-tailoring-saree-finishing-add-ons';
const previousStorage = globalThis.localStorage;
const previousEvents = globalThis.measurementAssociationEvents;
const previousCheckout = globalThis.measurementAssociationCheckout;
const storage = new Map();
const storageWrites = [];
let store;

test.before(async () => {
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => { storageWrites.push({ key, value }); storage.set(key, value); }, removeItem: key => storage.delete(key) };
  const result = await build({ entryPoints: [path.join(root, 'src/stores/cartStore.ts')], bundle: true,
    write: false, platform: 'node', format: 'cjs', packages: 'external',
    alias: { '@': path.join(root, 'src') }, plugins: [{ name: 'isolated-cart-effects', setup(builder) {
      builder.onResolve({ filter: /^@\/(?:lib\/shopify|hooks\/useAnalytics)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path: entry }) => ({ loader: 'js', contents: entry.endsWith('shopify')
        ? 'export const createStorefrontCheckout=async lines=>{globalThis.measurementAssociationCheckout.push(lines);return "https://shop.example/checkout";};'
        : `const record=(type,args)=>globalThis.measurementAssociationEvents.push({type,args});
           export const trackAddToCart=(...args)=>record('add',args), trackRemoveFromCart=(...args)=>record('remove',args),
             trackBeginCheckout=(...args)=>record('begin',args), trackCheckoutHandoffSuccess=(...args)=>record('handoff',args),
             trackViewCart=(...args)=>record('view',args);` }));
    } }] });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
  store = module.exports.useCartStore;
});
test.beforeEach(() => {
  store.setState({ items: [], checkoutError: null, isLoading: false, checkoutUrl: null });
  storageWrites.length = 0;
  globalThis.measurementAssociationEvents = [];
  globalThis.measurementAssociationCheckout = [];
});
test.after(() => {
  globalThis.localStorage = previousStorage;
  globalThis.measurementAssociationEvents = previousEvents;
  globalThis.measurementAssociationCheckout = previousCheckout;
});

const reference = value => value === undefined ? [] : [{ key: 'Configuration reference', value }];
const garment = (ref, measurement = 'SYNTHETIC waist 31', quantity = 1, title = 'Synthetic garment') => ({
  variantId: 'gid://shopify/ProductVariant/101', variantTitle: '32', quantity,
  price: { amount: '99.97', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: '32' }],
  customAttributes: [...reference(ref), { key: 'Measurements', value: measurement }],
  product: { node: { id: 'gid://shopify/Product/1', handle: 'synthetic-garment', title,
    productType: 'Saree', images: { edges: [] }, variants: { edges: [] } } },
});
const service = (ref, variant = '201', quantity = 1, title = 'Synthetic garment') => ({
  variantId: `gid://shopify/ProductVariant/${variant}`, variantTitle: variant === '201' ? 'Blouse Stitching' : 'Fall & Pico', quantity,
  price: { amount: variant === '201' ? '10.00' : '8.00', currencyCode: 'USD' }, selectedOptions: [{ name: 'Service', value: variant }],
  customAttributes: [{ key: 'Applies To', value: title }, ...reference(ref)],
  product: { node: { id: 'gid://shopify/Product/2', handle: serviceHandle, title: 'LuxeMia Services',
    productType: 'Service', images: { edges: [] }, variants: { edges: [] } } },
});
const add = (...lines) => lines.forEach(line => store.getState().addItem(line));
const items = () => store.getState().items;
const quantities = () => items().map(line => line.quantity);
const twoConfigurations = () => {
  const a = garment('SYNTHETIC-reference-A', 'SYNTHETIC waist 31');
  const b = garment('SYNTHETIC-reference-B', 'SYNTHETIC waist 35', 2);
  add(a, service('SYNTHETIC-reference-A'), service('SYNTHETIC-reference-A', '202'),
    b, service('SYNTHETIC-reference-B', '201', 2), service('SYNTHETIC-reference-B', '202', 2));
  return { a, b };
};

test('quantity updates only the selected measurement configuration and its paid services', () => {
  const { a } = twoConfigurations();
  const before = structuredClone(items());
  assert.equal(before.length, 6, 'same garment and service variants remain separate by configuration');
  store.getState().updateQuantity(a.variantId, 3, a.customAttributes);
  assert.deepEqual(quantities(), [3, 3, 3, 2, 2, 2]);
  assert.deepEqual(items().map(({ quantity, ...rest }) => rest), before.map(({ quantity, ...rest }) => rest),
    'prices, variants, measurements, reference and selected options remain unchanged');
});

test('removing one measurement configuration removes only its associated services', () => {
  const { a } = twoConfigurations();
  const expected = structuredClone(items().slice(3));
  store.getState().removeItem(a.variantId, a.customAttributes);
  assert.deepEqual(items(), expected);
});

test('zero garment quantity uses the same isolated removal path', () => {
  const { b } = twoConfigurations();
  const expected = structuredClone(items().slice(0, 3));
  store.getState().updateQuantity(b.variantId, 0, b.customAttributes);
  assert.deepEqual(items(), expected);
});

test('service-only quantity and removal preserve garments and other services', () => {
  twoConfigurations();
  const target = items()[1];
  const before = structuredClone(items());
  store.getState().updateQuantity(target.variantId, 4, target.customAttributes);
  assert.deepEqual(quantities(), [1, 4, 1, 2, 2, 2]);
  store.getState().removeItem(target.variantId, target.customAttributes);
  assert.deepEqual(items(), before.filter((_, i) => i !== 1));
});

test('legacy lines without any configuration reference retain title-based synchronization and removal', () => {
  const legacy = garment(undefined);
  const unrelated = service(undefined, '201', 7, 'Different garment');
  add(legacy, service(undefined), service(undefined, '202'), unrelated);
  store.getState().updateQuantity(legacy.variantId, 3, legacy.customAttributes);
  assert.deepEqual(quantities(), [3, 3, 3, 7]);
  store.getState().removeItem(legacy.variantId, legacy.customAttributes);
  assert.deepEqual(items(), [unrelated]);
});

for (const [garmentRef, serviceRef] of [['SYNTHETIC-reference-A', undefined], [undefined, 'SYNTHETIC-reference-A']]) {
  test(`referenced and legacy lines never cross-associate (${garmentRef ? 'garment' : 'service'} has reference)`, () => {
    const current = garment(garmentRef);
    const other = service(serviceRef, '201', 2);
    add(current, other);
    store.getState().updateQuantity(current.variantId, 5, current.customAttributes);
    assert.deepEqual(quantities(), [5, 2]);
    store.getState().removeItem(current.variantId, current.customAttributes);
    assert.deepEqual(items(), [other]);
  });
}

test('matching references still require matching garment titles', () => {
  const current = garment('SYNTHETIC-reference-A');
  const other = service('SYNTHETIC-reference-A', '201', 2, 'Different garment');
  add(current, other);
  store.getState().updateQuantity(current.variantId, 5, current.customAttributes);
  assert.deepEqual(quantities(), [5, 2]);
  store.getState().removeItem(current.variantId, current.customAttributes);
  assert.deepEqual(items(), [other]);
});

test('empty reference attributes fail closed rather than fall back to title matching', () => {
  for (const ref of ['', '   ']) {
    store.setState({ items: [] });
    const current = garment(ref);
    const other = service(ref, '201', 2);
    add(current, other);
    store.getState().updateQuantity(current.variantId, 5, current.customAttributes);
    assert.deepEqual(quantities(), [5, 2]);
    store.getState().removeItem(current.variantId, current.customAttributes);
    assert.deepEqual(items(), [other]);
  }
});

test('configuration references and measurements reach fulfillment but never cart analytics', async () => {
  const { a } = twoConfigurations();
  store.getState().updateQuantity(a.variantId, 3, a.customAttributes);
  store.getState().trackCartView();
  assert.equal(await store.getState().createCheckout(), 'https://shop.example/checkout');
  const checkout = globalThis.measurementAssociationCheckout.at(-1);
  assert.equal(checkout.length, 6);
  assert.deepEqual(checkout[0].customAttributes, a.customAttributes);
  assert.deepEqual(checkout[1].customAttributes, service('SYNTHETIC-reference-A').customAttributes);
  store.getState().removeItem(a.variantId, a.customAttributes);
  const analytics = JSON.stringify(globalThis.measurementAssociationEvents);
  assert.doesNotMatch(analytics, /Configuration reference|Measurements|SYNTHETIC-reference|SYNTHETIC waist/);
  assert.match(analytics, /gid:\/\/shopify\/ProductVariant\/101/);
});

const suppliedMeasurements = [
  { key: 'Measurement submission', value: 'Customer supplied — review required' },
  { key: 'Measurement units', value: 'inches' },
  { key: 'Measurement basis', value: 'Body' },
  { key: 'Provided measurement 1', value: 'PRIVATE-label-7K: 31.375 inches' },
  { key: 'Provided measurement 2', value: 'PRIVATE-label-9Q: 29.625 inches' },
  { key: 'Measurement notes', value: 'PRIVATE-note-4M' },
];
const suppliedGarment = () => ({ ...garment('SYNTHETIC-private-config'), customAttributes: [
  ...reference('SYNTHETIC-private-config'), ...suppliedMeasurements,
] });
const pendingStatus = { key: 'Measurement submission', value: 'Re-enter measurement details after reload' };
const savedCart = () => JSON.parse(storage.get('shopify-cart')).state;
const assertNoRawMeasurements = text => assert.doesNotMatch(text,
  /PRIVATE-label|PRIVATE-note|31\.375|29\.625|Provided measurement|Measurement units|Measurement basis|Measurement notes/);

test('every actual persistence write redacts supplied details without changing the in-memory checkout', async () => {
  const submitted = suppliedGarment();
  const associated = service('SYNTHETIC-private-config');
  add(submitted, associated);
  store.getState().setCartId('memory-cart-id');
  store.getState().setCheckoutUrl('https://shop.example/private-checkout');
  assert.deepEqual(items(), [submitted, associated], 'partialize must not mutate the live checkout attributes');
  assert.equal(store.getState().checkoutUrl, 'https://shop.example/private-checkout');
  const persisted = savedCart();
  assert.deepEqual(persisted.items[0], { ...submitted, customAttributes: [...reference('SYNTHETIC-private-config'), pendingStatus] });
  assert.deepEqual(persisted.items[1], associated);
  assert.equal(persisted.cartId, null);
  assert.equal(persisted.checkoutUrl, null);
  for (const write of storageWrites) assertNoRawMeasurements(write.value);
  assert.equal(await store.getState().createCheckout(), 'https://shop.example/checkout');
  assert.deepEqual(globalThis.measurementAssociationCheckout.at(-1)[0].customAttributes, submitted.customAttributes);
  assertNoRawMeasurements(storage.get('shopify-cart'));
  assert.equal(savedCart().checkoutUrl, null, 'successful in-memory handoff must not create a persisted bypass URL');
});

test('reload retains pending status and checkout fails closed before any network or analytics', async () => {
  const submitted = suppliedGarment();
  add(submitted, service('SYNTHETIC-private-config'));
  const persistedBeforeReload = savedCart();
  await store.persist.rehydrate();
  assert.deepEqual(items(), persistedBeforeReload.items);
  assert(items()[0].customAttributes.some(attribute => attribute.key === pendingStatus.key && attribute.value === pendingStatus.value));
  // Even a stale in-memory URL cannot bypass the explicit pending guard.
  store.setState({ checkoutUrl: 'https://shop.example/stale-checkout', cartId: 'stale-cart-id', isLoading: true });
  globalThis.measurementAssociationEvents = [];
  assert.equal(await store.getState().createCheckout(), null);
  assert.deepEqual(globalThis.measurementAssociationCheckout, []);
  assert.deepEqual(globalThis.measurementAssociationEvents, []);
  assert.match(store.getState().checkoutError, /Re-enter your measurement details/);
  assert.equal(store.getState().checkoutUrl, null);
  assert.equal(store.getState().cartId, null);
  assert.equal(store.getState().isLoading, false);
  assertNoRawMeasurements(storage.get('shopify-cart'));
});

test('rehydration clears a stale persisted URL and cart ID when a pending line exists', async () => {
  const pendingLine = { ...suppliedGarment(), customAttributes: [...reference('SYNTHETIC-private-config'), pendingStatus] };
  storage.set('shopify-cart', JSON.stringify({ version: 0, state: {
    items: [pendingLine], cartId: 'stale-persisted-id', checkoutUrl: 'https://shop.example/stale-persisted-checkout',
  } }));
  await store.persist.rehydrate();
  assert.deepEqual(items(), [pendingLine]);
  assert.equal(store.getState().checkoutUrl, null);
  assert.equal(store.getState().cartId, null);
  assert.equal(await store.getState().createCheckout(), null);
  assert.deepEqual(globalThis.measurementAssociationCheckout, []);
});

for (const customAttributes of [[], [{ key: 'Measurement submission', value: 'Provide after order — review required before alterations' }]]) {
  test(`ordinary ${customAttributes.length ? 'LATER' : 'non-measurement'} carts preserve persistence and checkout behavior`, async () => {
    const ordinary = { ...garment(undefined), customAttributes };
    add(ordinary);
    store.getState().setCartId('ordinary-cart-id');
    store.getState().setCheckoutUrl('https://shop.example/ordinary-checkout');
    assert.deepEqual(savedCart(), { items: [ordinary], cartId: 'ordinary-cart-id', checkoutUrl: 'https://shop.example/ordinary-checkout' });
    await store.persist.rehydrate();
    assert.deepEqual(items(), [ordinary]);
    assert.equal(await store.getState().createCheckout(), 'https://shop.example/checkout');
    assert.deepEqual(globalThis.measurementAssociationCheckout.at(-1)[0].customAttributes, customAttributes);
    assert.equal(store.getState().checkoutError, null);
  });
}
