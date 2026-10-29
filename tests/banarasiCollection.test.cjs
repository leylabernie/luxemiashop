const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { transformSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const route = '/collections/banarasi-sarees';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function loadTypeScript(file) {
  const code = transformSync(read(file), { loader: 'ts', format: 'cjs' }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require(name) {
    if (name === './reviewedLehengaCollections.json') return require('../src/config/reviewedLehengaCollections.json');
    if (name === '../config/shippingTiming.cjs') return require('../src/config/shippingTiming.cjs');
    throw new Error(`Unexpected module dependency: ${name}`);
  } });
  return module.exports;
}

function collectionFilter() {
  const source = read('scripts/prerender.js');
  const start = source.indexOf('function filterProductsForCategory(');
  const end = source.indexOf('function filterProductsForCollectionRoute(', start);
  assert.ok(start >= 0 && end > start);
  const context = vm.createContext({
    MAX_COLLECTION_PRODUCTS: 250,
    EXCLUDED_TITLE_KEYWORDS: /this-fixture-is-excluded/i,
  });
  vm.runInContext(source.slice(start, end) + '\nglobalThis.result = filterProductsForCategory;', context);
  return context.result;
}

// Exercise real sitemap logic without its API-fetching main() or any network.
function sitemap(html = '') {
  const source = read('scripts/generate-sitemap.cjs');
  const entrypoint = '\nmain().catch(err => {';
  assert.equal(source.split(entrypoint).length, 2);
  const context = vm.createContext({
    __dirname: path.join(root, 'scripts'),
    console: { log() {}, warn() {} },
    process: { env: {} },
    require(name) {
      if (name === 'path') return path;
      if (name === 'fs') return {
        existsSync(file) { return file.endsWith(`${route}.html`); },
        readFileSync(file) {
          assert.ok(file.endsWith(`${route}.html`), file);
          return html;
        },
      };
      if (name === './product-retirement-20260908.json') return { retained: [] };
      if (name === '../src/config/emptyCatalogRoutes.json') return JSON.parse(read('src/config/emptyCatalogRoutes.json'));
      if (name === './storefront-catalog.cjs') return require('../scripts/storefront-catalog.cjs');
      throw new Error(`Unexpected sitemap dependency: ${name}`);
    },
  });
  vm.runInContext(source.slice(0, source.indexOf(entrypoint)) +
    '\nglobalThis.result = { staticPages, generateSitemap, splitSitemap, validatePrerenderedRoute };', context);
  return context.result;
}

test('Banarasi collection resolves through the existing dynamic collection route', () => {
  const { getShopifyCollectionConfig } = loadTypeScript('src/config/shopifyCollectionConfig.ts');
  const config = getShopifyCollectionConfig('banarasi-sarees');
  assert.equal(config.handle, 'banarasi-sarees');
  assert.equal(config.name, 'Banarasi Sarees');
  assert.equal(config.canonical, `https://luxemia.shop${route}`);
  assert.ok(config.title.length <= 70);
  assert.ok(config.description.length <= 160);
  assert.match(config.editorial.join(' '), /unstitched blouse fabric for separate tailoring/);
  assert.match(config.faqs.map(item => item.answer).join(' '), /confirm fabric suitability/);
  assert.match(read('src/App.tsx'), /path="\/collections\/:handle"/);
  const vercel = JSON.parse(read('vercel.json'));
  assert.ok(!vercel.redirects.some(entry => entry.source === route));
  assert.ok(!JSON.parse(read('src/config/emptyCatalogRoutes.json')).includes(route));
});

test('desktop and mobile navigation link the category', () => {
  const links = JSON.parse(read('src/config/reviewedShoppingLinks.json'));
  assert.ok(links.sarees.some(link => link.name === 'Banarasi Sarees' && link.href === '/collections/banarasi-sarees'));
  assert.match(read('src/config/categoryConfig.tsx'), /reviewedShoppingLinks\.sarees\.filter/);
  assert.match(read('src/components/layout/Header.tsx'), /const weddingSareeLinks = \[\s*\.\.\.reviewedShoppingLinks\.sarees/);
});

test('prerender selects the tagged batch and excludes unrelated products', () => {
  const selected = Array.from({ length: 25 }, (_, index) => ({
    id: String(index), title: `Banarasi Saree ${index}`, productType: 'Saree',
    tags: ['collection:banarasi-sarees'], availableForSale: true,
  }));
  const products = [
    ...selected,
    { id: 'unrelated', title: 'Banarasi Silk Saree', productType: 'Saree', tags: [] },
    { id: 'lehenga', title: 'Banarasi Silk Lehenga', productType: 'Lehenga Choli', tags: ['collection:banarasi-sarees'] },
    { ...selected[0], id: 'sold-out', availableForSale: false },
    { ...selected[0], id: 'excluded', title: 'this-fixture-is-excluded' },
  ];
  const result = collectionFilter()(products, 'collection:banarasi-sarees');
  assert.deepEqual(Array.from(result, item => item.id), selected.map(item => item.id));
  assert.equal(collectionFilter()(products, 'collection:banarasi-sarees', false, 12).length, 12);
});

test('build routes and prerender contain the collection once', () => {
  assert.equal(read('scripts/generate-routes.cjs').split(`'${route}'`).length - 1, 1);
  const prerender = read('scripts/prerender.js');
  assert.equal(prerender.split(`path: '${route}'`).length - 1, 1);
  assert.match(prerender, /category: 'collection:banarasi-sarees'/);
  assert.match(prerender, /confirm fabric suitability for your measurements and chosen design/);
});

test('sitemap emits one indexable collection URL and rejects noindex output', () => {
  const api = sitemap();
  assert.equal(api.staticPages.filter(page => page.loc === route).length, 1);
  const split = api.splitSitemap(api.generateSitemap([]));
  const loc = `<loc>https://luxemia.shop${route}</loc>`;
  assert.equal(split.collections.split(loc).length - 1, 1);
  for (const [name, xml] of Object.entries(split)) {
    if (name !== 'collections') assert.ok(!xml.includes(loc), name);
  }
  const html = `<link rel="canonical" href="https://luxemia.shop${route}"><meta name="robots" content="index, follow">`;
  assert.doesNotThrow(() => sitemap(html).validatePrerenderedRoute(route, new Set([route]), new Set()));
  assert.throws(() => sitemap(html.replace('index, follow', 'noindex, follow')).validatePrerenderedRoute(route, new Set([route]), new Set()));
});

test('Blouse option offers all three services without inventing a finished-size range', () => {
  const { getEligibleServiceAddOns } = loadTypeScript('src/lib/serviceAddOns.ts');
  const { hasNativeProductSizeOption, shouldRenderShopifyProductOption } = loadTypeScript('src/lib/productOptionNames.ts');
  const option = { name: 'Blouse', values: ['Unstitched blouse piece'] };
  const product = {
    title: 'Banarasi Saree', productType: 'Saree',
    description: 'Includes an 85 cm unstitched blouse piece.',
    options: [option], tags: ['collection:banarasi-sarees'],
  };
  assert.deepEqual(Array.from(getEligibleServiceAddOns(product)), ['blouse-stitching', 'pico-fall', 'matching-petticoat']);
  assert.equal(hasNativeProductSizeOption(product.options), false);
  assert.equal(shouldRenderShopifyProductOption(option, { isStitchable: false }), true);
});

test('blouse acknowledgment is required only for the scoped selected service', () => {
  const api = loadTypeScript('src/lib/serviceAddOns.ts');
  const product = { title: 'Banarasi Saree', productType: 'Saree', description: 'Unstitched blouse piece', tags: ['collection:banarasi-sarees'] };
  assert.equal(api.isBlouseServiceSelectionConfirmed(product, ['blouse-stitching'], false), false);
  assert.equal(api.isBlouseServiceSelectionConfirmed(product, ['blouse-stitching'], true), true);
  assert.equal(api.isBlouseServiceSelectionConfirmed(product, [], false), true);
  assert.equal(api.isBlouseServiceSelectionConfirmed(product, ['pico-fall', 'matching-petticoat'], false), true);
  assert.equal(api.isBlouseServiceSelectionConfirmed({ ...product, tags: [] }, ['blouse-stitching'], false), true);
  assert.equal(api.isBlouseServiceSelectionConfirmed({ ...product, productType: 'Lehenga' }, ['blouse-stitching'], false), true);
  assert.equal(api.blouseServiceConfirmationAttributes(product, ['blouse-stitching'], false).length, 0);
  const attributes = api.blouseServiceConfirmationAttributes(product, ['blouse-stitching'], true);
  assert.equal(attributes.length, 3);
  assert.match(attributes.map(x => x.value).join(' '), /provide measurements after ordering.*before stitching.*fit feasibility.*dispatch timing.*before stitching.*acknowledged/s);
});

test('all three add-ons are optional, deduplicated, and total the existing $26 charge', () => {
  const api = loadTypeScript('src/lib/serviceAddOns.ts');
  const product = { title: 'Banarasi Saree', productType: 'Saree', description: 'Unstitched blouse piece', tags: ['collection:banarasi-sarees'], options: [{ name: 'Blouse', values: ['Unstitched blouse piece'] }] };
  const codes = ['blouse-stitching', 'pico-fall', 'matching-petticoat'];
  const selected = api.selectedEligibleServiceAddOns(product, [...codes, ...codes], codes);
  assert.deepEqual(Array.from(selected), codes);
  assert.equal(api.serviceAddOnTotal(selected), 26);
  assert.equal(api.serviceAddOnTotal([]), 0);
  assert.deepEqual(codes.map(code => api.SERVICE_ADD_ONS[code].price), [10, 8, 8]);
  const source = read('src/components/product/ProductInfo.tsx');
  assert.match(source, /selectedServiceAddOnCodes, setSelectedServiceAddOnCodes\] = useState<ServiceAddOnCode\[\]>\(presentation\.alteration \? \['garment-alteration'\] : \[\]\)/);
  assert.match(source, /blouseServiceConfirmed, setBlouseServiceConfirmed\] = useState\(false\)/);
  const handler = source.slice(source.indexOf('const handleAddToCart = async'), source.indexOf('const formatPrice ='));
  const gate = handler.indexOf('if (!isBlouseServiceSelectionConfirmed');
  assert.ok(gate >= 0 && gate < handler.indexOf('addConfiguredItem({'));
  assert.match(handler.slice(gate, handler.indexOf('if (customizableProduct', gate)), /toast\.error[\s\S]*return;/);
  assert.match(handler, /Selected Saree Services/);
  assert.match(handler, /Selected Service/);
  assert.match(handler, /code === 'blouse-stitching' \? blouseConfirmationAttributes/);
  assert.match(source, /code === 'blouse-stitching'\) setBlouseServiceConfirmed\(false\)/);
  assert.match(source, /\) \|\| needsBlouseServiceConfirmation/);
  assert.match(source, /checked=\{blouseServiceConfirmed\}/);
  assert.match(read('src/lib/shopify.ts'), /attributes: item\.customAttributes\.map\(attr => \(\{ key: attr\.key, value: attr\.value \}\)\)/);
});

test('real add-to-cart handler blocks unchecked blouse, permits fabric-only, and records all selected billing lines', async () => {
  const api = loadTypeScript('src/lib/serviceAddOns.ts');
  const source = read('src/components/product/ProductInfo.tsx');
  const handler = source.slice(source.indexOf('const handleAddToCart = async'), source.indexOf('const formatPrice ='));
  const code = transformSync(`${handler}\nglobalThis.addToCart = handleAddToCart;`, { loader: 'ts', format: 'cjs' }).code;
  const product = { title: 'Banarasi Saree', productType: 'Saree', description: 'Unstitched blouse piece', tags: ['collection:banarasi-sarees'] };
  const garment = { id: 'garment-variant', title: 'Unstitched blouse piece', price: { amount: '66.27', currencyCode: 'USD' }, selectedOptions: [{ name: 'Blouse', value: 'Unstitched blouse piece' }] };
  const serviceVariants = new Map(Object.entries(api.SERVICE_ADD_ONS).map(([key, value]) => [key, {
    id: `service-${key}`, title: value.checkoutOptionValue,
    price: { amount: String(value.price), currencyCode: 'USD' },
    selectedOptions: [{ name: 'Stitching', value: value.checkoutOptionValue }],
  }]));
  async function run(selected, confirmed, metaMode = false) {
    const lines = [], errors = [], configured = [], destinations = [];
    const context = vm.createContext({
      isMensSharedStockActive:()=>false,rawProduct:{},measurementEligible:false,measurementDraft:loadTypeScript('src/lib/measurementRequest.ts').emptyMeasurementDraft(),measurementNow:false,nativeMeasurementRequest:false,measurementServiceCodes:[],...loadTypeScript('src/lib/measurementRequest.ts'),setMeasurementValidation() {},
      metaToken: metaMode ? 'test-context' : null, metaContentId: metaMode ? 'test-item' : null, metaRequestedLine: metaMode ? {quantity:1} : null,
      saveMetaConfiguration(token, item, handle, values) { configured.push(...values); return '/meta-checkout?context=test-context'; },
      window: {location: {assign(path) { destinations.push(path); }}},
      ...api, ...require('../src/config/shippingTiming.cjs'), shipsWithinDays: null, product, purchasableVariant: { node: garment },
      selectedAvailableServiceAddOnCodes: selected, blouseServiceConfirmed: confirmed,
      customizableProduct: null, isCustomSizeSelected: false, isStitchable: false,
      needsStitchingSize: false, isMenswear: false, madeToOrderProduct: false,
      requiresNativeTimingConfirmation: api.requiresBlouseServiceConfirmation(product, selected),
      showNeckline: false, showBottomStyleOption: false, showSleeveStyle: false,
      hasNativeFullStitching: false, customAlteration: '', quantity: 1,
      serviceAddOnProduct: { handle: api.SERVICE_ADD_ON_PRODUCT_HANDLE }, serviceVariants,
      toast: { error(message) { errors.push(message); } },
      setIsAdding() {}, setShowSizeValidation() {}, openCart() {},
      setTimeout(callback) { callback(); }, addItem(line) { lines.push(line); },
    });
    vm.runInContext(code, context);
    await context.addToCart();
    return { lines, errors, configured, destinations };
  }
  const rejected = await run(['blouse-stitching'], false);
  assert.equal(rejected.lines.length, 0);
  assert.equal(rejected.errors.length, 1);
  const fabricOnly = await run([], false);
  assert.equal(fabricOnly.errors.length, 0);
  assert.equal(fabricOnly.lines.length, 1);
  assert.equal(fabricOnly.lines[0].price.amount, '66.27');
  assert.equal(fabricOnly.lines[0].customAttributes, undefined);
  const metaConfigured = await run(['blouse-stitching', 'pico-fall', 'matching-petticoat'], true, true);
  assert.equal(metaConfigured.lines.length, 0, 'Meta configuration must not mutate the regular bag');
  assert.equal(metaConfigured.configured.length, 4, 'All garment and paid service lines stay together');
  assert.equal(metaConfigured.destinations[0], '/meta-checkout?context=test-context');
  const metaRejected = await run(['blouse-stitching'], false, true);
  assert.equal(metaRejected.configured.length, 0, 'Meta cannot bypass measurement acknowledgment');
  const finished = await run(['blouse-stitching', 'pico-fall', 'matching-petticoat'], true);
  assert.equal(finished.errors.length, 0);
  assert.equal(finished.lines.length, 4);
  assert.equal(new Set(finished.lines.map(line => line.variantId)).size, 4);
  assert.equal(finished.lines.reduce((total, line) => total + Number(line.price.amount), 0), 92.27);
  assert.ok(finished.lines[0].customAttributes.some(x => x.key === 'Selected Saree Services'));
  const blouse = finished.lines.find(line => line.serviceAddOnCode === 'blouse-stitching');
  assert.ok(blouse.customAttributes.some(x => x.key === 'Measurement Acknowledgment'));
  for (const line of finished.lines.slice(1)) {
    assert.equal(line.quantity, 1);
    assert.ok(line.customAttributes.some(x => x.key === 'Applies To' && x.value === product.title));
    assert.ok(line.customAttributes.some(x => x.key === 'Selected Service'));
  }
});

test('mobile sticky price never renders a numeric zero for a missing or zero compare-at price', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const code = transformSync(read('src/components/product/StickyAddToBag.tsx'), {
    loader: 'tsx', format: 'cjs', jsx: 'automatic',
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require(name) {
      if (name === 'react') return { ...React, useState: () => [true, () => {}], useEffect() {} };
      if (name === 'react/jsx-runtime') return require(name);
      if (name === 'framer-motion') return { motion: { div: 'div' }, AnimatePresence: React.Fragment };
      if (name === 'lucide-react') return { ShoppingBag: () => null };
      if (name === '@/components/ui/button') return { Button: 'button' };
      if (name === '@/lib/imageUtils') return { getOptimizedImage: value => value };
      throw new Error(`Unexpected sticky price dependency: ${name}`);
    },
  });
  const product = {
    title: 'Banarasi Saree',
    variants: { edges: [{ node: { availableForSale: true } }] },
    priceRange: { minVariantPrice: { amount: '85.87' } },
    images: { edges: [] },
  };
  function renderedPrice(compareAtAmount) {
    const value = {
      ...product,
      ...(compareAtAmount !== undefined
        ? { compareAtPriceRange: { minVariantPrice: { amount: compareAtAmount } } }
        : {}),
    };
    const html = renderToStaticMarkup(React.createElement(module.exports.default, { product: value }));
    return html.match(/<p class="text-sm font-semibold">([\s\S]*?)<\/p>/)[1];
  }
  for (const amount of [undefined, '0.0', '85.87', '80.00']) {
    assert.equal(renderedPrice(amount), '$85.87');
  }
  assert.match(renderedPrice('100.00'), /^\$85\.87<span[^>]+>\$100\.00<\/span>$/);
});
