const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { transformSync, buildSync } = require('esbuild');
const { reviewedLehengaCollections: configs, filterReviewedLehengaProducts: filter } = require('../src/lib/reviewedLehengaCollections.cjs');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const product = (member, overrides = {}) => ({
  ...member, title: 'Reviewed collection fixture', productType: 'Lehenga Choli',
  description: 'Fixture lehenga, choli and dupatta.', descriptionHtml: '<p>Fixture lehenga, choli and dupatta.</p>',
  vendor: 'LuxeMia', tags: [], availableForSale: true,
  images: { edges: [{ node: { url: member.image, altText: 'Fixture model photograph' } }] },
  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/1', title: 'Fixture', availableForSale: true, price: { amount: '100.00', currencyCode: 'USD' }, selectedOptions: [] } }] },
  priceRange: { minVariantPrice: { amount: '100.00', currencyCode: 'USD' } },
  options: [], ...overrides,
});
let generatorPromise;
function generator() {
  return generatorPromise ||= (async () => {
    const original = read('scripts/prerender.js');
    const source = original.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml, routes };');
    assert.notEqual(source, original);
    const file = path.join(root, 'scripts', `.reviewed-collections-test-${process.pid}.mjs`);
    fs.writeFileSync(file, source);
    try { return await import(pathToFileURL(file).href); }
    finally { fs.unlinkSync(file); }
  })();
}
const template = '<html><head><title>Fixture</title><meta name="description" content="fixture" /><meta name="robots" content="index, follow" /><meta name="googlebot" content="index, follow" /><link rel="canonical" href="https://luxemia.shop/" /></head><body><div id="root"></div></body></html>';
const payload = html => JSON.parse(html.match(/window\.__INITIAL_DATA__ = (\{[\s\S]*?\});<\/script>/)[1]);
const schemas = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));

test('new collection navigation preserves the existing desktop shopping shortcuts', () => {
  const header = read('src/components/layout/Header.tsx');
  const literal = header.match(/const secondaryLinks = (\[[\s\S]*?\]);/);
  assert.ok(literal);
  const links = vm.runInNewContext(literal[1]);
  assert.match(header, /secondaryLinks\.slice\(0, 2\)/);
  assert.deepEqual(Array.from(links.slice(0, 2), link => link.href), ['/new-arrivals', '/ready-to-ship']);
  for (const handle of Object.keys(configs)) {
    assert.ok(links.some(link => link.href === `/collections/${handle}`));
    assert.ok(read('src/config/categoryConfig.tsx').includes(`/collections/${handle}`));
  }
});

for (const [handle, config] of Object.entries(configs)) {
  test(`${handle}: exact reviewed assortment, exclusions, availability and images`, () => {
    assert.equal(config.products.length, handle === 'organza-lehengas' ? 9 : 8);
    assert.equal(new Set(config.products.map(p => p.id)).size, config.products.length);
    const expected = config.products.map(p => product(p));
    if (handle === 'mirror-work-lehengas') {
      assert.deepEqual(filter(handle, expected), [], 'Explicit archives must not revive from stale availableForSale records');
      return;
    }
    assert.deepEqual(filter(handle, [...expected, expected[0]]).map(p => p.id), config.products.map(p => p.id));
    assert.equal(filter(handle, expected.map(node => ({ node }))).length, expected.length);
    for (const change of [
      { id: 'gid://shopify/Product/unreviewed', tags: ['organza', 'mirror work'] },
      { handle: 'wrong-handle' }, { productType: 'Saree' }, { status: 'DRAFT' },
      { availableForSale: false }, { variants: { edges: [] } },
      { variants: { edges: [{ node: { availableForSale: false } }] } },
      { images: { edges: [{ node: { url: 'https://cdn.shopify.com/flatlay-unreviewed.jpg' } }] } },
    ]) assert.equal(filter(handle, [product(config.products[0], change)]).length, 0, JSON.stringify(change));
    assert.equal(filter(handle, [product(config.products[0], { images: { edges: [{ node: { url: config.products[0].image + '&width=400' } }] } })]).length, 1);
    assert.equal(filter('unreviewed-route', expected).length, 0);
  });

  test(`${handle}: real prerender is populated, self-canonical, indexable and schema-consistent`, async () => {
    const { generateHtml, routes } = await generator();
    const selected = routes.filter(route => route.path === `/collections/${handle}`);
    assert.equal(selected.length, 1);
    assert.equal(selected[0].title, config.title);
    assert.equal(selected[0].description, config.description);
    const products = config.products.map(p => product(p));
    const html = generateHtml(template, selected[0], new Map(products.map(p => [p.handle, p])));
    if (handle === 'mirror-work-lehengas') {
      assert.match(html, /name="robots" content="noindex, follow"/);
      assert.deepEqual(payload(html).products, []);
      assert.ok(!schemas(html).some(s => ['ItemList', 'Product', 'ProductGroup', 'CollectionPage'].includes(s['@type'])));
      return;
    }
    assert.match(html, /name="robots" content="index, follow"/);
    assert.ok(html.includes(`rel="canonical" href="${config.canonical}"`));
    assert.deepEqual(payload(html).products.map(p => p.node.id), config.products.map(p => p.id));
    assert.equal(payload(html).category, `collection:${handle}`);
    const graph = schemas(html);
    assert.equal(graph.filter(s => s['@type'] === 'CollectionPage').length, 1);
    assert.equal(graph.find(s => s['@type'] === 'ItemList').numberOfItems, config.products.length);
    for (const p of config.products) assert.ok(html.includes(`/product/${p.handle}`));
    assert.ok(html.includes('href="/lehengas"'));
    assert.ok(config.title.length <= 60);
    assert.ok(config.description.length <= 155);
  });

  test(`${handle}: real empty and sold-out renders never fall back to unrelated merchandise`, async () => {
    const { generateHtml, routes } = await generator();
    const route = routes.find(route => route.path === `/collections/${handle}`);
    for (const records of [[], config.products.map(p => product(p, { availableForSale: false })), [product({ ...config.products[0], id: 'unrelated', handle: 'unrelated' })]]) {
      const html = generateHtml(template, route, new Map(records.map(p => [p.handle, p])));
      assert.match(html, /name="robots" content="noindex, follow"/);
      assert.ok(html.includes(`rel="canonical" href="${config.canonical}"`));
      assert.deepEqual(payload(html).products, []);
      assert.ok(!schemas(html).some(s => ['ItemList', 'Product', 'ProductGroup', 'CollectionPage'].includes(s['@type'])));
      assert.match(html, /No qualifying products are currently available/);
      assert.match(html, /href="\/lehengas"/);
      assert.ok(!html.includes('/product/unrelated'));
    }
  });
}

async function hookResult(handle, { initial, collection, catalog }) {
  const states = [], effects = []; let index = 0;
  const module = { exports: {} };
  const code = transformSync(read('src/hooks/useShopifyCollection.ts'), { loader: 'ts', format: 'cjs' }).code;
  vm.runInNewContext(code, { module, exports: module.exports, window: { __INITIAL_DATA__: initial }, AbortController,
    require(name) {
      if (name === 'react') return {
        useState(value) { const i = index++; states[i] = value; return [value, v => { states[i] = v; }]; },
        useEffect(effect) { effects.push(effect); },
      };
      if (name === '@/lib/reviewedLehengaCollections.cjs') return require('../src/lib/reviewedLehengaCollections.cjs');
      if (name === '@/lib/shopify') return { fetchCollectionByHandle: async () => collection, fetchAllProducts: async () => catalog };
      throw new Error(`Unexpected dependency ${name}`);
    },
  });
  module.exports.useShopifyCollection(handle);
  const cleanup = effects[0]();
  await new Promise(resolve => setTimeout(resolve, 0));
  cleanup();
  return states;
}

test('client navigation uses the exact manual membership and replaces stale prerender with empty live data', async () => {
  for (const [handle, config] of Object.entries(configs)) {
    const products = config.products.map(p => ({ node: product(p) }));
    const stale = { category: `collection:${handle}`, products };
    const [empty] = await hookResult(handle, { initial: stale, collection: { products: [] }, catalog: [] });
    assert.equal(empty.length, 0, 'Live unavailable members must not reappear from stale HTML');
    const [fallback] = await hookResult(handle, { initial: null, collection: null, catalog: [...products, { node: product({ ...config.products[0], id: 'unrelated', handle: 'unrelated' }) }] });
    assert.deepEqual(fallback.map(p => p.node.id), (handle === 'mirror-work-lehengas' ? [] : config.products.map(p => p.id)));
    const [otherRoute] = await hookResult(handle, { initial: { category: 'collection:other', products }, collection: { products }, catalog: [] });
    assert.equal(otherRoute.length, handle === 'mirror-work-lehengas' ? 0 : products.length);
  }
});

test('route manifests and desktop/mobile/hub links include only the two approved additions', () => {
  const emptyBefore = JSON.parse(read('src/config/emptyCatalogRoutes.json'));
  for (const handle of Object.keys(configs)) {
    const route = `/collections/${handle}`;
    for (const file of ['scripts/generate-routes.cjs', 'scripts/routes.json', 'src/lib/autoRoutes.ts', 'src/config/categoryConfig.tsx', 'src/components/layout/Header.tsx', 'src/pages/Collections.tsx']) {
      assert.ok(read(file).includes(route), file);
    }
    assert.equal(emptyBefore.includes(route), handle === 'mirror-work-lehengas');
    assert.ok(!JSON.parse(read('vercel.json')).redirects.some(r => r.source === route));
  }
  assert.match(read('src/App.tsx'), /path="\/collections\/:handle"/);
  assert.match(read('src/pages/ShopifyCollection.tsx'), /noIndexFollow = !isLoading && purchasableProducts.length === 0/);
});
