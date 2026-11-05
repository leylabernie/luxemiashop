const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function load(file) {
  const { outputFiles } = buildSync({ entryPoints: [path.join(root, file)], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', alias: { '@': path.join(root, 'src') } });
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, loaded, loaded.exports);
  return loaded.exports;
}
const categories = load('src/config/categoryConfig.tsx');
const config = categories.getCategoryConfig('kids');
const { matchSubcategory } = load('src/lib/productFilters.ts');

test('kids metadata and client copy cover boys and girls without universal inventory or sizing claims', () => {
  const seo = JSON.parse(read('src/config/seoArchitecture.json')).routes['/kids'];
  assert.equal(config.heroTitle, 'Kids Indian Ethnic Wear for Boys & Girls');
  assert.equal(config.heroTitle, seo.h1);
  assert.equal(config.seoDescription, seo.description);
  assert.ok(seo.description.length <= 160);
  for (const text of [config.heroSubtitle, config.faqs[0].answer]) {
    assert.match(text, /boys and girls/);
    assert.match(text, /kurta pajama and salwar sets/);
    assert.match(text, /current availability/);
    assert.doesNotMatch(text, /lehenga|stocks|Every .*listing states/);
  }
  assert.match(config.faqs[1].question, /kids'/);
  assert.match(config.faqs[1].answer, /any measurements/);
  assert.equal(config.canonical, 'https://luxemia.shop/kids');
});

test('kurta and salwar shortcuts match their real titles without crossing styles; legacy lehenga facet remains', () => {
  const kurta = config.subcategories.find(s => s.slug === 'kurta-pajama');
  const salwar = config.subcategories.find(s => s.slug === 'salwar-set');
  const boy = { title: 'Yellow Malai Satin Kids Boy Kurta Pajama with Koti Jacket', tags: [], productType: 'Kids Ethnic Wear' };
  const girl = { title: 'Orange Yellow Pink Embroidered Chinon Kids Salwar Set', tags: [], productType: 'Kids Ethnic Wear' };
  assert.equal(matchSubcategory(boy, kurta), true);
  assert.equal(matchSubcategory(girl, kurta), false);
  assert.equal(matchSubcategory(girl, salwar), true);
  assert.equal(matchSubcategory(boy, salwar), false);
  assert.ok(config.subcategories.some(s => s.slug === 'lehenga-set'));
  const source = read('src/config/categoryConfig.tsx');
  assert.ok(source.includes("{ name: 'Kurta Pajama Sets', href: '/kids?sub=kurta-pajama' }"));
  assert.ok(!source.includes("{ name: 'Lehenga Sets', href: '/kids?sub=lehenga-set' }"));
});

test('generated kids initial HTML uses the same copy and working style destinations', async () => {
  const original = read('scripts/prerender.js');
  const source = original.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml, routes };');
  assert.notEqual(source, original);
  const file = path.join(root, 'scripts', `.kids-test-${process.pid}.mjs`);
  fs.writeFileSync(file, source);
  try {
    const { generateHtml, routes } = await import(pathToFileURL(file).href);
    const route = routes.find(r => r.path === '/kids');
    const html = generateHtml('<html><head><title>Fixture</title><meta name="description" content="fixture" /><link rel="canonical" href="https://luxemia.shop/" /></head><body><div id="root"></div></body></html>', route, new Map());
    assert.match(html, /<h1[^>]*>Kids Indian Ethnic Wear for Boys &amp; Girls<\/h1>/);
    assert.ok(html.includes(config.heroSubtitle));
    assert.ok(html.includes(config.faqs[1].answer));
    for (const slug of ['kurta-pajama', 'salwar-set']) assert.ok(html.includes(`href="/kids?sub=${slug}"`));
    assert.doesNotMatch(html, /Girls Festive Sets|Festive Indian ethnic sets for girls|Occasion lehenga styles for girls|Every kids' listing states/);
  } finally { fs.unlinkSync(file); }
});
