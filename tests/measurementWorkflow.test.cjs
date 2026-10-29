const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { buildSync } = require('esbuild');
const { webcrypto } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function load(file) {
  const code = buildSync({ entryPoints: [path.join(root, file)], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', alias: { '@': path.join(root, 'src') } }).outputFiles[0].text;
  const m = { exports: {} };
  new Function('require', 'module', 'exports', code)(require, m, m.exports);
  return m.exports;
}
const measurements = load('src/lib/measurementRequest.ts');
const services = load('src/lib/serviceAddOns.ts');
const mens = load('src/lib/mensSharedStock.ts');
const timing = require('../src/config/shippingTiming.cjs');
const source = read('src/components/product/ProductInfo.tsx');
const start = source.indexOf('const handleAddToCart = async () => {');
const end = source.indexOf('\n  const formatPrice', start);
assert(start >= 0 && end > start);
const handler = buildSync({ stdin: { contents: source.slice(start, end) + '\nexport default handleAddToCart;', loader: 'ts' }, write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text;
const eligibilitySource = source.slice(source.indexOf('const nativeMeasurementRequest ='), source.indexOf('  const measurementContext ='));
const eligibilityCode = buildSync({ stdin: { contents: eligibilitySource + '\nexport default {nativeMeasurementRequest, measurementServiceCodes, measurementEligible};', loader: 'ts' }, write: false, format: 'cjs' }).outputFiles[0].text;
function eligibility(scope) {
  const m = { exports: {} };
  new Function('module', 'exports', ...Object.keys(scope), eligibilityCode)(m, m.exports, ...Object.values(scope));
  return m.exports.default;
}
const now = () => ({ choice: 'now', units: 'inches', basis: 'garment', rows: [{ label: 'Customer dimension', value: '32.5' }], notes: 'Please review scope', acknowledged: true });
async function run({ draft = now(), native = false, codes = [], overrides = {} } = {}) {
  const added = [], errors = [], validation = [], configured = [];
  const product = codes.includes('blouse-stitching') ? { id: 'fixture-garment', handle: 'fixture-saree', title: 'Fixture Anarkali', productType: 'Saree', description: 'Unstitched blouse piece', tags: ['collection:banarasi-sarees'] } : { id: 'fixture-garment', handle: 'fixture-anarkali', title: 'Fixture Anarkali', productType: 'Anarkali', tags: [] };
  const variant = { id: 'fixture-size-s', title: 'S', price: { amount: '103.00', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: 'S' }] };

  const scope = {
    ...measurements, ...services, ...timing, ...mens, rawProduct: product, selectedServiceAddOnCodes: codes, basePrice: variant.price, crypto: webcrypto,
    measurementDraft: draft,
    setMeasurementValidation: error => validation.push(error),
    purchasableVariant: { node: variant }, product, selectedAvailableServiceAddOnCodes: codes,
    blouseServiceConfirmed: true, customizableProduct: null, requestedCustomColor: '', isCustomSizeSelected: native, customSizeConfirmed: true,
    isStitchable: false, selectedStitchingType: null, needsStitchingSize: false, productHasNativeSizes: true, stitchingSize: null, isMenswear: false,
    metaToken: null, metaRequestedLine: null, metaContentId: null, setIsAdding() {}, setShowSizeValidation() {}, addItem: item => added.push(item),
    requiresNativeTimingConfirmation: native, shipsWithinDays: null, madeToOrderProduct: false, showNeckline: false, showBottomStyleOption: false, showSleeveStyle: false,
    hasNativeFullStitching: false, customAlteration: '', quantity: 1,
    serviceAddOnProduct: { id: 'fixture-services', handle: services.SERVICE_ADD_ON_PRODUCT_HANDLE, title: 'Services' },
    serviceVariants: new Map(codes.map(code => [code, { id: `fixture-service-${code}`, title: services.SERVICE_ADD_ONS[code].checkoutOptionValue, price: { amount: String(services.SERVICE_ADD_ONS[code].price), currencyCode: 'USD' }, selectedOptions: [] }])),
    setTimeout: fn => fn(), openCart() {}, toast: { error: message => errors.push(message) },
    saveMetaConfiguration: (token, id, handle, items) => { configured.push(...items); return '/fixture-meta'; }, window: { location: { assign() {} } },
    ...overrides,
  };
  Object.assign(scope, eligibility({ ...scope, selectedOptions: Object.fromEntries(scope.purchasableVariant.node.selectedOptions.map(option => [option.name, option.value])), needsBlouseServiceConfirmation: services.requiresBlouseServiceConfirmation(scope.product, codes), isProductSizeOptionName: name => /^(?:size|sizes)$/i.test(name) }));
  scope.measurementNow = scope.measurementEligible && draft.choice === 'now';
  const m = { exports: {} };
  new Function('module', 'exports', ...Object.keys(scope), handler)(m, m.exports, ...Object.values(scope));
  await m.exports.default();
  return { added, errors, validation, configured, variant };
}
const attrs = item => item.customAttributes || [];
const measurementRows = item => attrs(item).filter(a => a.key.startsWith('Provided measurement'));

test('actual handler NOW native request preserves variant price and one timing allowance', async () => {
  const result = await run({ native: true, overrides: { needsStitchingSize: true, productHasNativeSizes: false, madeToOrderProduct: true } });
  assert.deepEqual(result.errors, []);
  assert.equal(result.added.length, 1);
  const line = result.added[0];
  assert.equal(line.variantId, result.variant.id);
  assert.deepEqual(line.price, result.variant.price);
  assert.deepEqual(line.selectedOptions, result.variant.selectedOptions);
  assert.equal(measurementRows(line).length, 1);
  assert(!attrs(line).some(a => ['Measurements', 'Measurement Handoff'].includes(a.key)));
  const notices = attrs(line).filter(a => /^Timing /.test(a.key));
  assert.equal(notices.length, 1);
  assert.match(notices[0].value, /add 3 business days once.*15–21 business days total/);
});

test('actual handler LATER retains explicit after-order handoff and never hidden personal rows', async () => {
  const draft = { ...now(), choice: 'later' };
  const blocked = await run({ draft, native: true, overrides: { needsStitchingSize: true, productHasNativeSizes: false } });
  assert.equal(blocked.added.length, 0);
  assert.match(blocked.errors[0], /measurement handoff/);
  const accepted = await run({ draft, native: true, overrides: { needsStitchingSize: true, productHasNativeSizes: false, stitchingSize: 'Provide after order' } });
  assert.equal(accepted.added.length, 1);
  assert.equal(measurementRows(accepted.added[0]).length, 0);
  assert.match(attrs(accepted.added[0]).find(a => a.key === 'Measurement submission').value, /after order/);
});

test('optional-service measurements stay on the applicable service, not garment or petticoat', async () => {
  const result = await run({ codes: ['blouse-stitching', 'pico-fall', 'matching-petticoat'] });
  assert.deepEqual(result.errors, []);
  assert.equal(result.added.length, 4);
  assert.equal(measurementRows(result.added[0]).length, 0);
  for (const line of result.added.slice(1)) {
    assert.equal(measurementRows(line).length, line.serviceAddOnCode === 'blouse-stitching' ? 1 : 0);
    assert.equal(attrs(line).find(a => a.key === 'Applies To').value, 'Fixture Anarkali');
    assert.equal(Number(line.price.amount), services.SERVICE_ADD_ONS[line.serviceAddOnCode].price);
    const notices = attrs(line).filter(a => /^Timing /.test(a.key));
    assert.equal(notices.length, line.serviceAddOnCode === 'matching-petticoat' ? 0 : 1);
    if (notices.length) assert.match(notices[0].value, /add 3 business days once.*15–21 business days total/);
  }
});

test('invalid NOW blocks all mutations; custom and blouse confirmations remain substantive', async () => {
  const invalid = await run({ codes: ['blouse-stitching'], draft: { ...now(), acknowledged: false } });
  assert.equal(invalid.added.length, 0); assert.equal(invalid.errors.length, 1); assert.equal(invalid.validation.length, 1);
  const custom = await run({ native: true, overrides: { isCustomSizeSelected: true, customSizeConfirmed: false } });
  assert.equal(custom.added.length, 0); assert.match(custom.errors[0], /custom-size/);
  const blouse = await run({ codes: ['blouse-stitching'], overrides: { isBlouseServiceSelectionConfirmed: () => false } });
  assert.equal(blouse.added.length, 0); assert.match(blouse.errors[0], /blouse measurement/);
});

test('blouse NOW metadata requests review rather than falsely promising after-order submission', async () => {
  const product = { id: 'fixture-saree', handle: 'fixture-saree', title: 'Banarasi Saree', productType: 'Saree', description: 'Unstitched blouse piece', tags: ['collection:banarasi-sarees'] };
  const result = await run({ codes: ['blouse-stitching'], overrides: { product } });
  assert.deepEqual(result.errors, []);
  assert.equal(measurementRows(result.added[1]).length, 1);
  for (const line of result.added) {
    const blouse = attrs(line).find(a => a.key === 'Blouse Measurements');
    if (blouse) assert.match(blouse.value, /Customer supplied.*review/);
  }
});

test('Meta keeps existing LATER configuration and blocks NOW rather than losing details on navigation', async () => {
  const overrides={ metaToken: 'fixture', metaRequestedLine: { quantity: 1 }, metaContentId: 'fixture-id' };
  const blocked=await run({ codes:['blouse-stitching'], overrides });
  assert.match(blocked.errors[0],/Provide measurements after ordering/);
  assert.equal(blocked.added.length,0);assert.equal(blocked.configured.length,0);
  const later=await run({ draft:measurements.emptyMeasurementDraft(),codes:['blouse-stitching'],overrides });
  assert.deepEqual(later.errors,[]);assert.equal(later.added.length,0);assert.equal(later.configured.length,2);
  assert(later.configured.every(line=>measurementRows(line).length===0));
});

test('different customer requests remain distinct cart identity and checkout preserves attributes', async () => {
  const first = await run({ native: true });
  const second = await run({ native: true, draft: { ...now(), rows: [{ label: 'Customer dimension', value: '34' }] } });
  assert.notDeepEqual(attrs(first.added[0]), attrs(second.added[0]));
  const { normalizeFulfillmentAttributes } = load('src/lib/fulfillmentAttributes.ts');
  assert.deepEqual(normalizeFulfillmentAttributes(attrs(first.added[0])), attrs(first.added[0]));
  const cart = read('src/stores/cartStore.ts');
  assert.match(cart, /customAttributes: normalizeFulfillmentAttributes\(item.customAttributes, getProductShipsWithin\(item.product.node\)\)/);
  const analytics = cart.slice(cart.indexOf('const toAnalyticsItem'), cart.indexOf('export const useCartStore'));
  assert.doesNotMatch(analytics, /Provided measurement|Measurement notes|\.customAttributes/);
});

function testCart() {
  const events = [], requests = [];
  const code = buildSync({ stdin: { contents: read('src/stores/cartStore.ts').replace("'@/lib/shopify'", "'fixture-shopify'").replace("'@/hooks/useAnalytics'", "'fixture-analytics'"), loader: 'ts', resolveDir: path.join(root, 'src/stores') }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', external: ['fixture-shopify', 'fixture-analytics'], alias: { '@': path.join(root, 'src') } }).outputFiles[0].text;
  const m = { exports: {} };
  const mockRequire = name => {
    if (name === 'zustand') return { create: () => initializer => {
      let state;
      const set = update => { state = { ...state, ...(typeof update === 'function' ? update(state) : update) }; };
      const get = () => state;
      state = initializer(set, get);
      return { getState: get };
    } };
    if (name === 'zustand/middleware') return { persist: initializer => initializer, createJSONStorage: () => ({}) };
    if (name === 'fixture-shopify') return { createStorefrontCheckout: async lines => { requests.push(lines); return 'https://example.invalid/fixture-checkout'; } };
    if (name === 'fixture-analytics') return new Proxy({}, { get: (_, event) => (...values) => events.push({ event, values }) });
    if (name === 'sonner') return { toast: { error: message => assert.fail(message) } };
    return require(name);
  };
  new Function('require', 'module', 'exports', code)(mockRequire, m, m.exports);
  return { store: m.exports.useCartStore, events, requests };
}

test('actual store keeps repeated NOW configurations separate and removes/updates only linked services', async () => {
  const a = await run({ codes: ['blouse-stitching', 'matching-petticoat'] });
  const b = await run({ codes: ['blouse-stitching', 'matching-petticoat'] });
  const reference = line => attrs(line).find(attr => attr.key === 'Configuration reference')?.value;
  assert(reference(a.added[0]));
  assert.notEqual(reference(a.added[0]), reference(b.added[0]));
  for (const line of a.added) assert.equal(reference(line), reference(a.added[0]));
  const { store } = testCart();
  for (const line of [...a.added, ...b.added]) store.getState().addItem(line);
  assert.equal(store.getState().items.length, 6);
  store.getState().updateQuantity(a.added[0].variantId, 2, a.added[0].customAttributes);
  for (const line of store.getState().items) assert.equal(line.quantity, reference(line) === reference(a.added[0]) ? 2 : 1);
  store.getState().removeItem(a.added[0].variantId, a.added[0].customAttributes);
  assert.equal(store.getState().items.length, 3);
  assert(store.getState().items.every(line => reference(line) === reference(b.added[0])));
  store.getState().removeItem(b.added[1].variantId, b.added[1].customAttributes);
  assert.equal(store.getState().items.length, 2);
  assert(store.getState().items.every(line => measurementRows(line).length === 0));
});

test('actual checkout passes exact customer attributes but analytics never receives values, notes or reference', async () => {
  const result = await run({ codes: ['blouse-stitching'] });
  const { store, events, requests } = testCart();
  for (const line of result.added) store.getState().addItem(line);
  assert.equal(await store.getState().createCheckout(), 'https://example.invalid/fixture-checkout');
  assert.equal(requests.length, 1);
  for (let i = 0; i < result.added.length; i++) assert.deepEqual(requests[0][i].customAttributes, result.added[i].customAttributes);
  const analytics = JSON.stringify(events);
  for (const privateValue of ['Customer dimension', '32.5', 'Please review scope', 'Configuration reference', attrs(result.added[0]).find(a => a.key === 'Configuration reference').value]) assert(!analytics.includes(privateValue));
});

test('actual eligibility excludes ordinary sizes and generic alteration/pico/petticoat services', async () => {
  for (const codes of [[], ['garment-alteration'], ['pico-fall'], ['matching-petticoat'], ['garment-alteration', 'pico-fall', 'matching-petticoat']]) {
    const result = await run({ codes });
    assert.deepEqual(result.errors, []);
    assert(result.added.every(line => !attrs(line).some(a => /^(?:Measurement submission|Provided measurement|Configuration reference)/.test(a.key))));
  }
  const unscoped = await run({ codes: ['blouse-stitching'], overrides: { product: { id: 'plain', title: 'Plain outfit', productType: 'Dress', handle: 'plain', tags: [] } } });
  assert(unscoped.added.every(line => measurementRows(line).length === 0));
});

test('actual context/state expressions clear NOW details on variant, service, styling and product changes', () => {
  const block = source.slice(source.indexOf('const measurementContext ='), source.indexOf('\n  // Whether to show the Customize header'));
  const code = buildSync({ stdin: { contents: block + '\nexport default {measurementContext,measurementDraft,measurementNow,setMeasurementState};', loader: 'ts' }, write: false, format: 'cjs' }).outputFiles[0].text;
  let state = [], cursor = 0, priorDeps, effect;
  const initial = { metaToken:null, product: { id: 'p1' }, purchasableVariant: { node: { id: 'v1' } }, selectedOptions: { Size: 'Custom' }, selectedStitchingType: null, selectedAvailableServiceAddOnCodes: [], selectedNeckline: '', selectedBottomStyle: '', selectedSleeveStyle: '', requestedCustomColor: '', measurementEligible: true };
  function render(patch = {}) {
    cursor = 0; effect = undefined;
    const scope = { ...initial, ...patch, setStitchingSize(){}, setBlouseServiceConfirmed(){}, setCustomSizeConfirmed(){}, emptyMeasurementDraft: measurements.emptyMeasurementDraft,
      useState: init => { const index = cursor++; if (!(index in state)) state[index] = typeof init === 'function' ? init() : init; return [state[index], next => { state[index] = next; }]; },
      useEffect: (callback, deps) => { if (JSON.stringify(deps) !== JSON.stringify(priorDeps)) { effect = callback; priorDeps = deps; } },
    };
    const m = { exports: {} };
    new Function('module', 'exports', ...Object.keys(scope), code)(m, m.exports, ...Object.values(scope));
    return m.exports.default;
  }
  let view = render(); effect();
  view.setMeasurementState({ context: view.measurementContext, draft: now() });
  assert.equal(render().measurementNow, true);
  for (const patch of [{ metaToken:'new-shopping-context' }, { product: { id: 'p2' } }, { purchasableVariant: { node: { id: 'v2' } } }, { selectedAvailableServiceAddOnCodes: ['blouse-stitching'] }, { selectedOptions: { Size: 'S' } }, { selectedNeckline: 'Round' }, { selectedBottomStyle: 'Straight' }, { selectedSleeveStyle: 'Short' }, { requestedCustomColor: 'Blue' }]) {
    view = render(patch);
    assert.deepEqual(view.measurementDraft, measurements.emptyMeasurementDraft(), 'synchronous mismatch guard prevents stale submission before effect');
    assert.equal(view.measurementNow, false);
    effect();
    view = render();
    assert.deepEqual(view.measurementDraft, measurements.emptyMeasurementDraft(), 'switch back cannot recover prior private rows');
    effect();
    view.setMeasurementState({ context: view.measurementContext, draft: now() });
    assert.equal(render().measurementNow, true);
  }
  view = render();
  view.setMeasurementState({ context: view.measurementContext, draft: measurements.emptyMeasurementDraft() });
  view = render();
  assert.equal(view.measurementNow, false);
  view.setMeasurementState({ context: view.measurementContext, draft: { ...measurements.emptyMeasurementDraft(), choice: 'now' } });
  assert.equal(render().measurementDraft.rows.length, 0, 'later→now never restores old rows');
});

// Real migration identifiers; prices and measurement values below are local test fixtures.
function migratedMensFixture() {
  const plan = require('../src/config/mensSharedStock.json')[0];
  const raw = { id: plan.id, handle: plan.handle, title: 'Synthetic migrated kurta', productType: 'Kurta', tags: [mens.MENS_SHARED_STOCK_TAG],
    options: [{ name: 'Size', values: plan.pairs.map((_, i) => String(32 + i * 2)) }, { name: 'Alteration', values: ['Standard Fit', 'Made to Fit (+$10)'] }],
    variants: { edges: plan.pairs.flatMap((pair, i) => [false, true].map(legacy => ({ node: { id: legacy ? pair.legacy : pair.standard,
      title: `${32 + i * 2} / ${legacy ? 'Made to Fit (+$10)' : 'Standard Fit'}`, availableForSale: !legacy, requiresComponents: false, quantityAvailable: legacy ? 0 : 10,
      price: { amount: legacy ? '72.99' : '62.99', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: String(32 + i * 2) }, { name: 'Alteration', value: legacy ? 'Made to Fit (+$10)' : 'Standard Fit' }] } }))) } };
  const product = mens.mensPurchasePresentation(raw).product;
  const serviceVariant = { id: mens.ALTERATION_SERVICE_ID, title: services.SERVICE_ADD_ONS['garment-alteration'].checkoutOptionValue,
    requiresComponents: false, availableForSale: true, price: { amount: '10.00', currencyCode: 'USD' }, selectedOptions: [] };
  return { raw, product, serviceVariant };
}
async function migratedRun(index, draft = measurements.emptyMeasurementDraft(), extra = {}) {
  const { raw, product, serviceVariant } = migratedMensFixture();
  return run({ draft, codes: ['garment-alteration'], overrides: { rawProduct: raw, product, isMenswear: true,
    purchasableVariant: product.variants.edges[index], basePrice: product.variants.edges[index].node.price,
    serviceVariants: new Map([['garment-alteration', serviceVariant]]), ...extra } });
}
test('migrated mens LATER two sizes keep separate service associations through quantity and removal', async () => {
  const a = await migratedRun(0), b = await migratedRun(1);
  for (const result of [a,b]) {
    assert.deepEqual(result.errors, []); assert.equal(result.added.length, 2);
    assert.equal(result.added[0].price.amount, '62.99'); assert.equal(result.added[1].price.amount, '10.00');
    assert.equal(measurementRows(result.added[0]).length, 0);
    assert(attrs(result.added[1]).some(x => x.key === 'Measurement submission' && /after order/i.test(x.value)));
    const ref = attrs(result.added[0]).find(x => x.key === 'Configuration reference').value;
    assert.equal(attrs(result.added[1]).find(x => x.key === 'Configuration reference').value, ref);
  }
  assert.notEqual(attrs(a.added[0]).find(x=>x.key==='Configuration reference').value, attrs(b.added[0]).find(x=>x.key==='Configuration reference').value);
  const { store } = testCart(); for (const line of [...a.added,...b.added]) store.getState().addItem(line);
  assert.equal(store.getState().items.length,4);
  store.getState().updateQuantity(a.added[0].variantId,3,a.added[0].customAttributes);
  assert.deepEqual(store.getState().items.map(x=>x.quantity),[3,3,1,1]);
  store.getState().removeItem(a.added[0].variantId,a.added[0].customAttributes);
  assert.deepEqual(store.getState().items.map(x=>x.variantId),b.added.map(x=>x.variantId));
});
test('migrated mens NOW remains service-owned and missing paid service fails before cart mutation', async () => {
  const result=await migratedRun(0,now()); assert.deepEqual(result.errors,[]);
  assert.equal(measurementRows(result.added[0]).length,0); assert.equal(measurementRows(result.added[1]).length,1);
  const missing=await migratedRun(0,measurements.emptyMeasurementDraft(),{serviceVariants:new Map(),selectedAvailableServiceAddOnCodes:[]});
  assert.equal(missing.added.length,0); assert.match(missing.errors[0],/alteration service could not be verified/);
});
