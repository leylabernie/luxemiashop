const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const route = '/collections/anarkali-suits';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const config = JSON.parse(read('vercel.json'));

// Execute the real sitemap definitions, but never its API-fetching main().
// Fake filesystem supports only blog discovery and one prerender fixture;
// all module dependencies are explicitly allowlisted. No network is exposed.
function sitemap(html = '') {
  const source = read('scripts/generate-sitemap.cjs');
  const entrypoint = '\nmain().catch(err => {';
  assert.equal(source.split(entrypoint).length, 2, 'Review harness if CLI entrypoint changes');
  const context = vm.createContext({
    __dirname: path.join(root, 'scripts'),
    console: { log() {}, warn() {} },
    process: { env: {} },
    require(name) {
      if (name === 'path') return path;
      if (name === 'fs') return {
        existsSync(file) { return file.endsWith('/collections/anarkali-suits.html'); },
        readFileSync(file) {
          assert.ok(file.endsWith('/collections/anarkali-suits.html'), file);
          return html;
        },
      };
      if (name === './product-retirement-20260908.json') return { retained: [] };
      if (name === '../src/config/emptyCatalogRoutes.json') return JSON.parse(read('src/config/emptyCatalogRoutes.json'));
      throw new Error(`Unexpected sitemap dependency: ${name}`);
    },
  });
  vm.runInContext(source.slice(0, source.indexOf(entrypoint)) + '\nglobalThis.result = { staticPages, generateSitemap, splitSitemap, validatePrerenderedRoute };', context);
  return context.result;
}
function finalize(vercel) {
  vm.runInNewContext(read('scripts/finalize-empty-collection-redirects.cjs'), {
    __dirname: path.join(root, 'scripts'), console: { log() {} },
    require(name) {
      if (name === 'path') return path;
      if (name === 'fs') return { readFileSync() { return JSON.stringify(vercel); } };
      throw new Error(`Unexpected finalizer dependency: ${name}`);
    },
  });
}

test('Anarkali has no edge redirect and stays outside empty catalog routes', () => {
  assert.ok(!config.redirects.some((entry) => entry.source === route));
  assert.ok(!JSON.parse(read('src/config/emptyCatalogRoutes.json')).includes(route));
});

test('finalizer preserves other redirects and rejects reintroduced Anarkali retirement', () => {
  const before = JSON.stringify(config);
  assert.doesNotThrow(() => finalize(config));
  assert.equal(JSON.stringify(config), before);
  assert.throws(() => finalize({ ...config, redirects: [...config.redirects, { source: route, destination: '/suits', statusCode: 301 }] }), /Active Anarkali landing must not redirect/);
  assert.throws(() => finalize({ ...config, redirects: config.redirects.filter((entry) => entry.source !== '/collections/earrings') }), /Expected one/);
});

test('real sitemap functions emit exactly one Anarkali URL in collections', () => {
  const api = sitemap();
  assert.equal(api.staticPages.filter((page) => page.loc === route).length, 1);
  const split = api.splitSitemap(api.generateSitemap([]));
  const loc = `<loc>https://luxemia.shop${route}</loc>`;
  assert.equal(split.collections.split(loc).length - 1, 1);
  for (const [name, xml] of Object.entries(split)) {
    if (name !== 'collections') assert.ok(!xml.includes(loc), name);
  }
});

test('real sitemap validator accepts self-canonical indexable Anarkali fixture', () => {
  const html = `<link rel="canonical" href="https://luxemia.shop${route}"><meta name="robots" content="index, follow">`;
  assert.doesNotThrow(() => sitemap(html).validatePrerenderedRoute(route, new Set([route]), new Set()));
});

test('real sitemap validator rejects redirect, missing prerender, wrong canonical and noindex', () => {
  const html = `<link rel="canonical" href="https://luxemia.shop${route}"><meta name="robots" content="index, follow">`;
  assert.throws(() => sitemap(html).validatePrerenderedRoute(route, new Set([route]), new Set([route])), /exact redirect/);
  assert.throws(() => sitemap(html).validatePrerenderedRoute(route, new Set(), new Set()), /manifest/);
  assert.throws(() => sitemap(html.replace(route, '/suits')).validatePrerenderedRoute(route, new Set([route]), new Set()), /self-canonical/);
  assert.throws(() => sitemap(html.replace('index, follow', 'noindex, follow')).validatePrerenderedRoute(route, new Set([route]), new Set()), /indexable/);
});

test('existing client route, generated routes and prerender retain dedicated landing', () => {
  assert.match(read('src/App.tsx'), /path="\/collections\/anarkali-suits"[^\n]*landing="anarkali-suits"/);
  assert.ok(read('scripts/generate-routes.cjs').includes(`'${route}'`));
  assert.match(read('scripts/prerender.js'), /path: '\/collections\/anarkali-suits',[\s\S]{0,100}commercialLanding: 'anarkali-suits'/);
  const redirects = read('middleware.ts').match(/const COLLECTION_301_REDIRECTS[^=]*=\s*\{([\s\S]*?)\n  \};/);
  assert.ok(redirects, 'middleware redirect table must remain inspectable');
  assert.ok(!redirects[1].includes(route));
});

test('Anarkali guard runs after remediation scripts and before sitemap and IndexNow', () => {
  const scripts = JSON.parse(read('package.json')).scripts;
  const steps = scripts.build.split(' && ');
  const gate = steps.indexOf('npm run test:anarkali-route');
  assert.ok(gate > steps.indexOf('node scripts/finalize-built-approved-seo.cjs'));
  assert.equal(steps[gate + 1], 'node scripts/generate-sitemap.cjs');
  assert.ok(gate < steps.indexOf('node scripts/submit-indexnow.cjs'));
  assert.equal(scripts['test:anarkali-route'], 'node --test tests/anarkaliRoute.test.cjs');
  assert.ok(scripts.test.includes('tests/anarkaliRoute.test.cjs'));
  assert.equal(steps.filter((step) => step === 'npm run test:checkout-url').length, 1);
  assert.equal(steps[steps.indexOf('npm run test:purchase-flow') + 1], 'npm run test:checkout-url');
});
