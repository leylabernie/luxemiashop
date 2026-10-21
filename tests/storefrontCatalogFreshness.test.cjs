const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fetchCompleteStorefrontCatalog, retainLiveProductRoutes } = require('../scripts/storefront-catalog.cjs');

const archivedHandles = [
  'bead-embroidered-sharara-suit-mauve-maroon-divya',
  'embroidered-silk-sharara-suit-georgette-dupatta-mt1079',
  'net-beige-festival-wear-beads-work-readymade-lehenga-choli-400564',
  'premium-wedding-bridal-lehenga-collection-silk-zardozi-cutdana-pearl-embroidery-with-4-50m-flair',
  'embroidered-bridal-lehenga-olive-green',
  'patola-silk-saree-red-orange',
];
const response = (products, hasNextPage = false, endCursor = null) => ({
  ok: true,
  json: async () => ({ data: { products: { edges: products.map(node => ({ node })), pageInfo: { hasNextPage, endCursor } } } }),
});
const live = { handle: 'live-product', availableForSale: true };
const soldOut = { handle: 'active-sold-out-product', availableForSale: false };
function fetchPages(pages, extra = {}) {
  const requests = [];
  return {
    requests,
    promise: fetchCompleteStorefrontCatalog({
      url: 'https://fixture.invalid/graphql', token: 'fixture-token', query: 'fixture-query',
      fetchImpl: async (_url, request) => { requests.push(JSON.parse(request.body)); return pages[requests.length - 1]; },
      ...extra,
    }),
  };
}

test('only the complete current catalog authorizes product routes, retaining active sold-out products', async () => {
  const fixture = fetchPages([response([live], true, 'page-2'), response([soldOut])]);
  const products = await fixture.promise;
  assert.deepEqual(products, [live, soldOut]);
  assert.equal(fixture.requests[1].variables.after, 'page-2');
  const routes = ['/', '/sitemap', ...archivedHandles.map(handle => `/product/${handle}`), `/product/${live.handle}`, `/product/${soldOut.handle}`].map(path => ({ path }));
  assert.deepEqual(retainLiveProductRoutes(routes, new Map(products.map(p => [p.handle, p]))).map(r => r.path),
    ['/', '/sitemap', `/product/${live.handle}`, `/product/${soldOut.handle}`]);
});

test('page failure, GraphQL errors, and malformed responses never return a partial catalog', async () => {
  for (const badPage of [
    { ok: false, status: 503 },
    { ok: true, json: async () => ({ errors: [{ message: 'throttled' }], data: { products: { edges: [], pageInfo: { hasNextPage: false } } } }) },
    { ok: true, json: async () => ({ data: {} }) },
    { ok: true, json: async () => ({ data: { products: { edges: [], pageInfo: {} } } }) },
  ]) {
    await assert.rejects(fetchPages([response([live], true, 'next'), badPage]).promise, /failed|errors|incomplete/);
  }
});

test('non-advancing pagination, page limit, empty catalog, and duplicate handles fail closed', async () => {
  await assert.rejects(fetchPages([response([live], true, null)]).promise, /did not advance/);
  await assert.rejects(fetchPages([response([live], true, 'same'), response([soldOut], true, 'same')]).promise, /did not advance/);
  await assert.rejects(fetchPages([response([live], true, 'next')], { maxPages: 1 }).promise, /refusing partial/);
  await assert.rejects(fetchPages([response([])]).promise, /empty catalog/);
  await assert.rejects(fetchPages([response([live, live])]).promise, /duplicate/);
  await assert.rejects(fetchPages([response([{ title: 'missing handle' }])]).promise, /missing/);
  await assert.rejects(fetchPages([], { token: '' }).promise, /required/);
});

test('all product generators use the complete source and prerender prunes fixed routes before rendering', () => {
  for (const script of ['prerender.js', 'generate-static-feed.cjs', 'generate-sitemap.cjs']) {
    const source = fs.readFileSync(path.join(__dirname, '../scripts', script), 'utf8');
    assert.match(source, /await fetchCompleteStorefrontCatalog\(/);
  }
  const source = fs.readFileSync(path.join(__dirname, '../scripts/prerender.js'), 'utf8');
  assert.ok(source.indexOf('retainLiveProductRoutes(routes, productMap)') < source.indexOf('const html = generateHtml(template, route, productMap)'));
  assert.match(source, /fs\.rmSync\(prerenderDir, \{ recursive: true \}\)/, 'Old product HTML must be removed before fresh output');
});

test('explicit snapshot normalization cannot re-date stale catalog data as fresh', () => {
  const source = fs.readFileSync(path.join(__dirname, '../scripts/generate-static-feed.cjs'), 'utf8');
  const functions = source.slice(source.indexOf('function getFeedSnapshotStats('), source.indexOf('function getStructuredTagValues('));
  let normalized = false;
  let writes = 0;
  const oldDate = new Date(Date.now() - 30 * 86400000).toISOString();
  const oldXml = `<last_build_date>${oldDate}</last_build_date>` + '<item><g:size>M</g:size><g:material>silk</g:material></item>'.repeat(1200);
  const context = vm.createContext({
    MAX_LOCAL_SNAPSHOT_AGE_DAYS: 7, MIN_EXPECTED_OFFER_COUNT: 1200, MIN_SIZED_OFFER_COUNT: 1000, MIN_MATERIAL_COVERAGE_RATIO: 0.82,
    IS_RELEASE_BUILD: false, __dirname, path,
    fs: { existsSync: () => true, readFileSync: () => oldXml, writeFileSync: () => { writes++; } },
    console: { log() {} },
    sanitizeExistingFeedXml() { normalized = true; return oldXml; },
  });
  vm.runInContext(functions, context);
  assert.throws(() => vm.runInContext("refreshFeedFromExplicitSnapshot('/fixture/old.xml')", context), /outside the 7-day/);
  assert.equal(normalized, false, 'Source freshness must be checked before normalization');
  assert.equal(writes, 0);
  const sanitizer = source.slice(source.indexOf('function sanitizeExistingFeedXml('), source.indexOf('function getFeedSnapshotStats('));
  assert.doesNotMatch(sanitizer, /last_build_date.*new Date/, 'Copy cleanup must preserve the original catalog date');
});

for (const handle of archivedHandles) {
  test(`confirmed archive is absent from checked-in catalog artifacts: ${handle}`, () => {
    for (const filename of ['public/feeds/meta-catalog.csv', 'src/lib/prerenderManifest.ts', 'scripts/approved-sitemap-inventory.json']) {
      assert.ok(!fs.readFileSync(path.join(__dirname, '..', filename), 'utf8').includes(handle), filename);
    }
  });
}

test('approved sitemap inventory count matches the reconciled paths', () => {
  const inventory = JSON.parse(fs.readFileSync(path.join(__dirname, '../scripts/approved-sitemap-inventory.json'), 'utf8'));
  assert.equal(inventory.urlCount, inventory.paths.length);
  assert.equal(new Set(inventory.paths).size, inventory.paths.length);
});

test('authorized archives supersede old retained-product and offer baselines without becoming permanent retirements', () => {
  const retirement = require('../scripts/product-retirement-20260908.json');
  const archives = retirement.reversiblyArchived;
  assert.deepEqual(new Set(archives.map(product => product.handle)), new Set(archivedHandles));
  assert.equal(archives.length, archivedHandles.length);
  const archivedIds = new Set(archives.map(product => product.id.split('/').pop()));
  for (const product of [...retirement.retained, ...retirement.retired]) {
    assert.ok(!archivedIds.has(product.id.split('/').pop()), product.handle);
  }
  for (const [field, offerIds] of Object.entries(retirement.feedBaseline)) {
    for (const offerId of offerIds) {
      assert.ok(!archivedIds.has(offerId.match(/^p(\d+)(?:-v|$)/)?.[1]), `${field}: ${offerId}`);
    }
  }
  assert.equal(retirement.retained.length, 147, 'Only the two archived retained products are removed');
  assert.equal(retirement.feedBaseline.offerIds.length, 1379, 'All other historical offers remain required');
  assert.equal(retirement.feedBaseline.sizeOfferIds.length, 1371);
  assert.equal(retirement.feedBaseline.materialOfferIds.length, 48);
  const goneHandles = new Set(require('../src/data/legacyGoneProductHandles.json'));
  for (const handle of archivedHandles) assert.ok(!goneHandles.has(handle), handle);
});
