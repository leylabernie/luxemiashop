const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const generatorPath = path.resolve(__dirname, '../scripts/generate-sitemap.cjs');
const source = fs.readFileSync(generatorPath, 'utf8');
const fixtureRoot = path.resolve('/fixture-sitemap-project');
const scriptsDir = path.join(fixtureRoot, 'scripts');
const inventoryPath = path.join(scriptsDir, 'approved-sitemap-inventory.json');
const prerenderDir = path.join(fixtureRoot, 'dist/_prerender');
const staticSource = source.slice(source.indexOf('const staticPages = ['), source.indexOf('].filter(page =>'));
const staticPaths = [...staticSource.matchAll(/^\s*\{ loc: '([^']+)'/gm)].map(match => match[1]);
assert.ok(staticPaths.length > 40, 'Review fixtures if static-page syntax changes');
const baselineHandles = Array.from({ length: 150 }, (_, index) => `approved-product-${index}`);
const productPath = handle => `/product/${handle}`;
const htmlPath = route => route === '/' ? path.join(prerenderDir, 'index.html') : path.join(prerenderDir, `${route.slice(1)}.html`);
const validHtml = route => `<link rel="canonical" href="https://luxemia.shop${route}"><meta name="robots" content="index,follow">`;

// Run the unchanged CLI entrypoint and all its real validation/generation logic.
// Only dependencies are fixtures. Neither real fetch nor writable real fs is
// exposed inside the VM; every output is captured in memory.
async function runGenerator(options = {}) {
  const approvedHandles = options.approvedHandles || baselineHandles;
  const responseHandles = options.responseHandles || approvedHandles;
  const approvedPaths = [...staticPaths, ...approvedHandles.map(productPath)];
  const inventory = { source: 'reviewed fixture', capturedOn: '2026-10-01', urlCount: approvedPaths.length, paths: approvedPaths };
  const inventoryBytes = `${JSON.stringify(inventory, null, 2)}\n`;
  const manifestPaths = [...new Set([...staticPaths, ...responseHandles.map(productPath)])]
    .filter(route => !(options.missingPrerenders || []).includes(route));
  const files = new Map([
    [inventoryPath, inventoryBytes],
    [path.join(fixtureRoot, 'vercel.json'), JSON.stringify({ redirects: options.redirects || [] })],
    [path.join(prerenderDir, 'manifest.json'), JSON.stringify({ routes: manifestPaths })],
  ]);
  for (const route of manifestPaths) files.set(htmlPath(route), validHtml(route));
  for (const [route, html] of Object.entries(options.htmlOverrides || {})) files.set(htmlPath(route), html);
  const directories = new Set([path.join(fixtureRoot, 'dist'), path.join(fixtureRoot, 'public'), prerenderDir]);
  const writes = [];
  const logs = { log: [], warn: [], error: [] };
  let exitCode = 0;
  let fetchCalls = 0;
  const fixtureFs = {
    existsSync(file) { return files.has(file) || directories.has(file); },
    readFileSync(file, encoding) {
      assert.equal(encoding, 'utf8');
      assert.ok(files.has(file), `Unexpected fixture read: ${file}`);
      return files.get(file);
    },
    mkdirSync(directory) { directories.add(directory); },
    writeFileSync(file, contents) {
      writes.push({ file, contents });
      files.set(file, contents);
    },
  };
  const context = vm.createContext({
    __dirname: scriptsDir,
    console: Object.fromEntries(Object.keys(logs).map(level => [level, (...args) => logs[level].push(args.map(String).join(' '))])),
    process: { env: { SHOPIFY_STOREFRONT_TOKEN: 'fixture-token-not-a-credential' }, exit(code) { exitCode = code; } },
    require(name) {
      if (name === 'fs') return fixtureFs;
      if (name === 'path') return path;
      if (name === './product-retirement-20260908.json') {
        return { retained: baselineHandles.slice(0, 149).map(handle => ({ handle })), retired: (options.retiredHandles || []).map(handle => ({ handle })) };
      }
      if (name === '../src/config/emptyCatalogRoutes.json') return options.emptyCatalogRoutes || [];
      throw new Error(`Unexpected module dependency: ${name}`);
    },
    async fetch(url, request) {
      fetchCalls += 1;
      assert.equal(url, 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json');
      assert.equal(request.method, 'POST');
      return {
        ok: true,
        async json() {
          return { data: { products: {
            pageInfo: { hasNextPage: false, endCursor: null },
            edges: responseHandles.map(handle => ({ node: { handle, title: handle, updatedAt: '2026-10-01T00:00:00Z', productType: 'Fixture', images: { edges: [] } } })),
          } } };
        },
      };
    },
  });
  await vm.runInContext(source, context, { filename: generatorPath, timeout: 2000 });
  return {
    exitCode, fetchCalls, logs, writes, inventoryBytes,
    inventoryAfter: files.get(inventoryPath),
    productSitemap: files.get(path.join(fixtureRoot, 'dist/sitemap-products.xml')),
    inventoryWrites: writes.filter(write => write.file === inventoryPath),
  };
}

test('missing approved products plus enough growth preserve baseline bytes without restoring products', async () => {
  const missing = baselineHandles[0];
  const result = await runGenerator({ responseHandles: [...baselineHandles.slice(1), 'new-product-a', 'new-product-b'] });
  assert.equal(result.exitCode, 0);
  assert.equal(result.fetchCalls, 1);
  assert.equal(result.inventoryWrites.length, 0, 'Missing approved products must prevent automatic baseline refresh');
  assert.equal(result.inventoryAfter, result.inventoryBytes);
  assert.ok(!result.productSitemap.includes(`/${missing}</loc>`));
  assert.ok(result.productSitemap.includes('/new-product-a</loc>'));
  assert.ok(result.logs.warn.some(message => message.includes('approved inventory refresh deferred')));
  assert.ok(result.logs.warn.every(message => !message.includes('likely Storefront')));
});

test('healthy validated growth refreshes the complete approved inventory', async () => {
  const result = await runGenerator({ responseHandles: [...baselineHandles, 'new-product-a'] });
  assert.equal(result.exitCode, 0);
  assert.equal(result.inventoryWrites.length, 1);
  const refreshed = JSON.parse(result.inventoryAfter);
  assert.equal(refreshed.urlCount, staticPaths.length + baselineHandles.length + 1);
  for (const route of JSON.parse(result.inventoryBytes).paths) assert.ok(refreshed.paths.includes(route));
  assert.ok(refreshed.paths.includes('/product/new-product-a'));
});

test('no-growth generation leaves the approved inventory unchanged', async () => {
  const result = await runGenerator();
  assert.equal(result.exitCode, 0);
  assert.equal(result.inventoryWrites.length, 0);
  assert.equal(result.inventoryAfter, result.inventoryBytes);
  assert.ok(result.productSitemap.includes('/approved-product-0</loc>'));
});

test('an approved-route validation failure performs no writes', async () => {
  const route = productPath(baselineHandles[0]);
  const result = await runGenerator({
    responseHandles: [...baselineHandles, 'new-product-a'],
    htmlOverrides: { [route]: `<link rel="canonical" href="https://luxemia.shop${route}"><meta name="robots" content="noindex,follow">` },
  });
  assert.equal(result.exitCode, 1);
  assert.deepEqual(result.writes, []);
  assert.equal(result.inventoryAfter, result.inventoryBytes);
  assert.ok(result.logs.error.some(message => message.includes('indexable robots directive')));
});

test('intentional retirement already reconciled out of the baseline does not block healthy growth', async () => {
  const retired = baselineHandles[0];
  const active = baselineHandles.slice(1);
  const result = await runGenerator({ approvedHandles: active, responseHandles: [...active, 'new-product-a'], retiredHandles: [retired] });
  assert.equal(result.exitCode, 0);
  assert.equal(result.inventoryWrites.length, 1);
  assert.ok(!JSON.parse(result.inventoryAfter).paths.includes(productPath(retired)));
  assert.ok(!result.productSitemap.includes(`/${retired}</loc>`));
  assert.equal(result.logs.warn.length, 0);
});

test('new product without a prerender is safely deferred without blocking the build', async () => {
  const result = await runGenerator({ responseHandles: [...baselineHandles, 'pending-new-product'], missingPrerenders: ['/product/pending-new-product'] });
  assert.equal(result.exitCode, 0);
  assert.equal(result.inventoryAfter, result.inventoryBytes);
  assert.equal(result.inventoryWrites.length, 0);
  assert.ok(!result.productSitemap.includes('/pending-new-product</loc>'));
  assert.ok(result.logs.log.some(message => message.includes('not yet safe to index')));
});

test('missing non-product path also preserves baseline during product growth', async () => {
  const result = await runGenerator({ responseHandles: [...baselineHandles, 'new-product-a'], emptyCatalogRoutes: ['/about'] });
  assert.equal(result.exitCode, 0);
  assert.equal(result.inventoryWrites.length, 0, 'Missing approved non-product paths must prevent automatic baseline refresh');
  assert.equal(result.inventoryAfter, result.inventoryBytes);
  assert.ok(result.logs.warn.some(message => message.includes('/about') && message.includes('cause requires review')));
});

test('existing total-count floor still rejects uncompensated shrinkage before any writes', async () => {
  const result = await runGenerator({ responseHandles: baselineHandles.slice(1) });
  assert.equal(result.exitCode, 1);
  assert.deepEqual(result.writes, []);
  assert.equal(result.inventoryAfter, result.inventoryBytes);
  assert.ok(result.logs.error.some(message => message.includes('shrank below the approved inventory floor')));
});
