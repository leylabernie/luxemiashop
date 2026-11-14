const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { encodeCollectionImages, restoreCollectionImages } = require('../src/lib/collectionHydration.cjs');

function fixture(route = '/collections/banarasi-sarees') {
  const image = { url: `https://cdn.shopify.com/${'long-image-path-'.repeat(12)}.jpg`, altText: 'Red saree' };
  return { path: route, category: 'collection:banarasi-sarees', products: [{ node: {
    id: 'gid://shopify/Product/1', title: 'Saree', handle: 'saree',
    images: { edges: [{ node: image }] }, options: [{ name: 'Size', values: ['S', 'M'] }],
    variants: { edges: Array.from({ length: 54 }, (_, i) => ({ node: {
      id: `gid://shopify/ProductVariant/${i}`, sku: `SKU-${i}`, barcode: null,
      title: `Option ${i}`, price: { amount: i ? '19.99' : '0.00', currencyCode: 'USD' },
      compareAtPrice: null, availableForSale: i !== 2,
      image: { ...image }, selectedOptions: [{ name: 'Size', value: i ? 'M' : 'S' }],
    } })) },
  } }] };
}
function execute(encoded) {
  const context = vm.createContext({ window: {} });
  vm.runInContext(`window.__INITIAL_DATA__ = ${encoded.json};`, context);
  if (encoded.script) vm.runInContext(encoded.script, context);
  return JSON.parse(JSON.stringify(context.window.__INITIAL_DATA__));
}

test('collection encoding round trips every variant/option/price/image without mutating input', () => {
  const payload = fixture();
  const before = JSON.stringify(payload);
  const encoded = encodeCollectionImages(payload);
  assert.ok(encoded.script);
  assert.ok(encoded.json.length + encoded.script.length < before.length);
  assert.equal(JSON.stringify(payload), before);
  assert.deepEqual(execute(encoded), payload);
  const restored = restoreCollectionImages(JSON.parse(encoded.json));
  const edges = restored.products[0].node.variants.edges;
  assert.notEqual(edges[0].node.image, edges[1].node.image);
  edges[0].node.image.altText = 'changed';
  assert.equal(edges[1].node.image.altText, 'Red saree');
});

test('preserves distinct images, null, missing fields and hostile strings safely', () => {
  const payload = fixture();
  const edges = payload.products[0].node.variants.edges;
  edges[0].node.image = null;
  delete edges[1].node.image;
  edges[2].node.image = { url: 'https://cdn.shopify.com/other.jpg', altText: '</script><script>bad()</script> $& 雪' };
  payload.products[0].node.title = '$` $\' $$ </script>';
  const encoded = encodeCollectionImages(payload);
  assert.ok(encoded.script);
  assert.doesNotMatch(encoded.json, /</);
  assert.deepEqual(execute(encoded), payload);
});

test('homepage, product routes, small collections and old payloads keep existing representation', () => {
  for (const route of ['/', '/product/saree', '/sarees']) {
    const payload = fixture(route);
    assert.equal(encodeCollectionImages(payload).script, '');
    assert.deepEqual(execute(encodeCollectionImages(payload)), payload);
  }
  const small = { path: '/collections', products: [] };
  assert.equal(encodeCollectionImages(small).script, '');
  assert.equal(restoreCollectionImages(small), small);
});

test('bad references fail closed before modifying the payload', () => {
  for (const ref of [-1, 1000, 0.5]) {
    const compact = JSON.parse(encodeCollectionImages(fixture()).json);
    compact.products[0].node.variants.edges[1].node.image = ref;
    const before = JSON.stringify(compact);
    assert.equal(restoreCollectionImages(compact), null);
    assert.equal(JSON.stringify(compact), before);
  }
});

test('real collection renderer restores data before the application runs; product cards and schema retain images', async () => {
  const root = path.resolve(__dirname, '..');
  const original = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
  const source = original.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml };');
  assert.notEqual(source, original);
  const file = path.join(root, 'scripts', `.collection-image-test-${process.pid}.mjs`);
  fs.writeFileSync(file, source);
  try {
    const { generateHtml } = await import(pathToFileURL(file).href);
    const product = fixture().products[0].node;
    product.productType = 'Saree'; product.tags = ['collection:banarasi-sarees']; product.availableForSale = true;
    product.priceRange = { minVariantPrice: { amount: '19.99', currencyCode: 'USD' } };
    const html = generateHtml('<html><head><title>Test</title></head><body><div id="root"></div></body></html>', {
      path: '/collections/banarasi-sarees', category: 'collection:banarasi-sarees', title: 'Sarees', h1: 'Sarees', description: 'Sarees', content: '',
    }, new Map([[product.handle, product]]));
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    const initialIndex = scripts.findIndex(match => match[2].includes('window.__INITIAL_DATA__ ='));
    assert.ok(initialIndex >= 0);
    const context = vm.createContext({ window: {} });
    vm.runInContext(scripts[initialIndex][2], context);
    assert.equal(context.window.__INITIAL_DATA__.__variantImageEncoding, 1);
    vm.runInContext(scripts[initialIndex + 1][2], context);
    const restored = JSON.parse(JSON.stringify(context.window.__INITIAL_DATA__));
    assert.deepEqual(restored.products[0].node.variants, product.variants);
    assert.equal(restored.__variantImageEncoding, undefined);
    assert.match(html, /href="\/product\/saree"/);
    for (const match of scripts.filter(match => match[1].includes('application/ld+json'))) JSON.parse(match[2]);
  } finally { fs.unlinkSync(file); }
});
