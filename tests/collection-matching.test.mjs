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
    platform: 'node', format: 'cjs', packages: 'external',
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
