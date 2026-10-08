import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
async function loadSource(entry) {
  const result = await esbuild.build({
    entryPoints: [path.join(root, entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', define: { 'import.meta.env': '{}' },
    alias: { '@': path.join(root, 'src') }, jsx: 'automatic',
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}
const { matchSubcategory, applySubcategory } = await loadSource('src/lib/productFilters.ts');
const { getCommercialLandingConfig, getCommercialLandingSubcategory } = await loadSource('src/config/commercialLandingPages.tsx');
const { getCategoryConfig } = await loadSource('src/config/categoryConfig.tsx');
const product = (title, productType, tags = [], description = '') => ({
  title, productType, tags, description,
  priceRange: { minVariantPrice: { amount: '89.97', currencyCode: 'USD' } },
});

for (const [landing, title, type, tags] of [
  ['sharara-suits', 'Embroidered Silk Sharara Suit with Georgette Dupatta', 'Sharara Suit', ['sharara suit']],
  ['gharara-suits', 'Fuchsia Gharara Set in Georgette with Bead Embroidery', 'Readymade Gharara Set', ['gharara set']],
  ['anarkali-suits', 'Teal Premium Silk Embroidered Anarkali Palazzo Suit', 'Palazzo Suit', ['party wear']],
]) {
  test(`${landing}: a descriptive page label preserves the base category's real products`, () => {
    const config = getCommercialLandingConfig(landing);
    const slug = getCommercialLandingSubcategory(landing);
    const dedicated = config.subcategories.find(sub => sub.slug === slug);
    const original = getCategoryConfig(config.slug).subcategories.find(sub => sub.slug === slug);
    const node = product(title, type, tags);
    assert.equal(matchSubcategory(node, original), true);
    assert.equal(matchSubcategory(node, dedicated), true);
    assert.equal(applySubcategory([{ node }], dedicated).length, 1);
  });
}

test('style matching uses product type when a shortened title omits the silhouette', () => {
  const sub = getCommercialLandingConfig('gharara-suits').subcategories.find(sub => sub.slug === 'gharara');
  assert.equal(matchSubcategory(product('Fuchsia Embroidered Three-Piece Set', 'Readymade Gharara Set'), sub), true);
});

test('a gharara does not leak into sharara, including descriptive comparisons', () => {
  const sub = getCommercialLandingConfig('sharara-suits').subcategories.find(sub => sub.slug === 'sharara');
  assert.equal(matchSubcategory(product('Fuchsia Gharara Set', 'Gharara Set', ['gharara set'], 'Compare the cut with a sharara.'), sub), false);
  assert.equal(matchSubcategory(product('Shararalike Embroidered Set', 'Suit'), sub), false);
});


const { generateMetaDescription } = await loadSource('src/lib/productDescriptionEnrichment.ts');
const { clampDescription } = await loadSource('src/lib/meta/clamp.ts');
test('product search descriptions preserve identity and end with complete copy', () => {
  for (const [title, type] of [
    ['Royal Purple Gharara Set in Georgette with Bead Embroidery', 'Readymade Gharara Set'],
    ['Embroidered Silk Sharara Suit with Georgette Dupatta – MT-1079', 'Sharara Suit'],
    ['Slate Grey Chiffon Sequin Border Saree with Stitched Blouse', 'Saree'],
  ]) {
    const description = clampDescription(generateMetaDescription('', type, title));
    assert.ok(description.includes(title));
    assert.ok(description.length <= 155);
    assert.ok(description.endsWith('.'));
    assert.ok(!description.includes('…'));
  }
});

const { getPrimaryCategory, getCatalogDisplayCategory, selectLatestArrivals } = await import('../src/lib/catalogCategories.mjs');
const { filterByCategory } = await loadSource('src/hooks/useShopifyProducts.ts');
test('all current merchandise types have an accessible primary category', () => {
  const expected = {
    'Sherwani': 'menswear', 'Mens Kurta Pajama Set': 'menswear',
    'Lehenga Choli': 'lehengas', 'Bridal Lehenga': 'lehengas', 'Lehenga': 'lehengas', 'Navratri Lehenga': 'lehengas',
    'Saree': 'sarees', 'Saree with Stitched Blouse': 'sarees',
    'Sharara Suit': 'suits', 'Palazzo Suit': 'suits', 'Suit': 'suits', 'Salwar Suit': 'suits',
    'Kurti Set': 'suits', 'Palazzo Set': 'suits', 'Gown': 'suits', 'Suit Set': 'suits', 'Anarkali': 'suits',
    'Indo-Western Dress': 'indowestern', 'Indo-Western': 'indowestern', 'Jacket Set': 'indowestern', 'Skirt Set': 'indowestern',
    'Girls Ethnic Set': 'kids', 'Kids Boy Set': 'kids', 'Blouse': 'blouses', 'Couple Set': 'couple-outfits',
  };
  const products = Object.keys(expected).map((productType, index) => ({node: {
    ...product('Imported style', productType), id: String(index), createdAt: '2026-10-01T00:00:00Z',
  }}));
  for (const p of products) {
    const category = expected[p.node.productType];
    assert.equal(getPrimaryCategory(p.node), category);
    assert.equal(filterByCategory(products, category).includes(p), true, p.node.productType);
  }
});
test('boys and couple sets retain their category despite adult menswear words', () => {
  const boy = {node: product('Kurta Pajama Set for Boys', 'Kids Boy Set', ['boys', 'male'])};
  const couple = {node: product('Saree and Kurta Pajama Couple Set', 'Couple Set', ['men'])};
  assert.deepEqual(filterByCategory([boy, couple], 'kids'), [boy]);
  assert.deepEqual(filterByCategory([boy, couple], 'couple-outfits'), [couple]);
  assert.deepEqual(filterByCategory([boy, couple], 'menswear'), []);
  assert.equal(getCatalogDisplayCategory('Suit'), 'Salwar Kameez');
  assert.equal(getCatalogDisplayCategory('Suit Set'), 'Salwar Kameez');
});
test('New Arrivals selects the global latest 12 without limiting the full category', () => {
  const now = Date.parse('2026-10-08T12:00:00Z');
  const products = Array.from({length: 30}, (_, index) => ({node: {
    ...product('Suit', 'Suit'), id: String(index),
    createdAt: new Date(now - index * 3600000).toISOString(),
  }})).reverse();
  const latest = selectLatestArrivals(products, now);
  assert.deepEqual(latest.map(p => p.node.id), Array.from({length: 12}, (_, index) => String(index)));
  assert.equal(filterByCategory(products, 'suits').length, 30);
  assert.equal(selectLatestArrivals([{node: {...products[0].node, createdAt: '2026-01-01T00:00:00Z'}}], now).length, 0);
});
test('active sold-out products stay categorized and native types survive display enrichment', () => {
  const node = {...product('Three-Piece Set', 'Salwar Kameez'), _originalProductType: 'Sharara Suit', availableForSale: false};
  assert.equal(filterByCategory([{node}], 'suits').length, 1);
  assert.equal(matchSubcategory(node, {slug: 'sharara', label: 'Sharara', group: 'style', matchTags: [], matchProductType: ['Sharara Suit']}), true);
});
