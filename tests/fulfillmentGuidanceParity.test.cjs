const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const esbuild = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');
const { getFulfillmentGuidanceRoutes } = require('../src/lib/fulfillmentGuidance.cjs');
const definitions = require('../src/config/fulfillmentGuidance.json');
const emptyRoutes = require('../src/config/emptyCatalogRoutes.json');
const root = path.resolve(__dirname, '..');
const escape = value => value.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function loadPage() {
  const output = await esbuild.build({
    entryPoints: [path.join(root, 'src/pages/SemanticCommercePage.tsx')],
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
    alias: { '@': path.join(root, 'src') }, jsx: 'automatic',
    plugins: [{ name: 'isolate-page-chrome', setup(build) {
      build.onResolve({ filter: /^@\/components\/(layout\/(Header|Footer)|seo\/SEOHead)$/ }, args => ({ path: args.path, namespace: 'chrome' }));
      build.onLoad({ filter: /.*/, namespace: 'chrome' }, () => ({ contents: 'export default function Chrome() { return null; }' }));
    } }],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output.outputFiles[0].text)(require, module, module.exports);
  return module.exports.default;
}

for (const route of getFulfillmentGuidanceRoutes()) {
  test(`${route.path}: prerender and actual React page expose the same approved guidance and navigation`, async () => {
    const Page = await loadPage();
    const rendered = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [route.path] }, React.createElement(Page)));
    const page = definitions[route.path];
    for (const text of [page.answer, ...page.sections.flatMap(section => [section.heading, section.body])]) {
      assert.ok(route.content.includes(escape(text)), `Prerender missing ${text}`);
      assert.ok(rendered.includes(escape(text)), `React missing ${text}`);
    }
    const links = html => [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]).sort();
    assert.deepEqual(links(route.content), links(rendered));
    assert.deepEqual(links(route.content), page.links.filter(link => !emptyRoutes.includes(link.href)).map(link => link.href).sort());
    assert.equal(route.title, page.title);
    assert.equal(route.description, page.description);
  });
}

test('empty collection invitation is removed completely, and restored automatically with inventory', () => {
  const route = '/shop-by-fulfillment/customizable-outfits';
  const current = getFulfillmentGuidanceRoutes().find(page => page.path === route).content;
  assert.doesNotMatch(current, /Browse customizable outfits|\/collections\/customizable-indian-outfits/);
  assert.match(current, /href="\/contact"/);
  assert.match(current, /href="\/sizing-measurements-guide"/);
  const restocked = getFulfillmentGuidanceRoutes([]).find(page => page.path === route).content;
  assert.match(restocked, /href="\/collections\/customizable-indian-outfits">Browse customizable outfits<\/a>/);
});

test('prerender uses the shared route producer without duplicate literal routes', () => {
  const source = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
  assert.match(source, /\.\.\.getFulfillmentGuidanceRoutes\(\)/);
  for (const route of Object.keys(definitions)) assert.ok(!source.includes(`path: '${route}'`));
});

test('legacy fit guidance preserves approved timing and does not promise garment manufacture', () => {
  const page = definitions['/shop-by-fulfillment/made-to-order'];
  assert.match(page.answer, /not new garment production/);
  assert.match(page.answer, /add 3 business days once/);
  assert.match(page.answer, /15–21 business days, not guaranteed/);
});

test('real HTML generator retains full guidance, indexability and self-canonicals', async () => {
  const { pathToFileURL } = require('node:url');
  const original = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
  const source = original.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml, routes };');
  assert.notEqual(source, original);
  const file = path.join(root, 'scripts', `.hub-parity-test-${process.pid}.mjs`);
  fs.writeFileSync(file, source);
  try {
    const { generateHtml, routes } = await import(pathToFileURL(file).href);
    const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    for (const route of getFulfillmentGuidanceRoutes()) {
      assert.equal(routes.filter(candidate => candidate.path === route.path).length, 1);
      const html = generateHtml(template, route, new Map());
      assert.match(html, /name="robots" content="index, follow/);
      assert.ok(html.includes(`rel="canonical" href="https://luxemia.shop${route.path}"`));
      for (const section of definitions[route.path].sections) {
        assert.ok(html.includes(escape(section.heading)));
        assert.ok(html.includes(escape(section.body)));
      }
      if (route.path.endsWith('customizable-outfits')) {
        assert.doesNotMatch(html, /Browse customizable outfits/);
        assert.match(html, /href="\/contact"/);
      }
    }
  } finally { fs.unlinkSync(file); }
});
