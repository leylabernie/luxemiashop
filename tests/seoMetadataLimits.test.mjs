import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clampTitle, clampDescription } from '../src/lib/meta/clamp.ts';
import { generateMetaDescription } from '../src/lib/productDescriptionEnrichment.ts';

test('long product titles retain one brand and fit the search limit', () => {
  const title = clampTitle('Mint Green Silk Lehenga Choli with Sequin Work and Net Dupatta | LuxeMia');
  assert.ok(title.length < 60);
  assert.equal((title.match(/LuxeMia/g) || []).length, 1);
  assert.ok(title.startsWith('Mint Green Silk Lehenga'));
  assert.equal(clampTitle(title), title);
});

test('titles already suffixed with LuxeMia USA do not get a second brand', () => {
  assert.equal(clampTitle('Purple Palazzo Set | LuxeMia USA'), 'Purple Palazzo Set | LuxeMia');
  assert.equal(clampTitle('Black Georgette Sequin Floral Sharara Suit | LuxeMia USA'), 'Black Georgette Sequin Floral Sharara Suit | LuxeMia');
  assert.equal((clampTitle('Purple Palazzo Set | LuxeMia USA').match(/LuxeMia/g) || []).length, 1);
  assert.equal((clampTitle('Designer Hand-Embroidered Net Saree with Bead and Pearl Work | LuxeMia USA').match(/LuxeMia/g) || []).length, 1);
});

test('short descriptive titles remain intact', () => {
  assert.equal(clampTitle('Yellow Chinon Palazzo Set | LuxeMia'), 'Yellow Chinon Palazzo Set | LuxeMia');
});

test('descriptions prefer complete sentences and stay below 155', () => {
  const first = 'Shop a yellow Chinon palazzo set with sequin embroidery and a dupatta.';
  assert.equal(clampDescription(first + ' Confirm the listed size before ordering for a wedding celebration with your family and friends at a destination venue.'), first);
  assert.ok(clampDescription('Silk sarees for wedding guests '.repeat(15)).length < 155);
  assert.ok(clampDescription('x'.repeat(154)).length < 155);
});

test('all rendering paths use the shared metadata helpers', () => {
  const prerender = readFileSync(new URL('../scripts/prerender.js', import.meta.url), 'utf8');
  const middleware = readFileSync(new URL('../src/middleware/htmlGenerator.ts', import.meta.url), 'utf8');
  assert.ok(prerender.includes("loadTsModule('src/lib/meta/clamp.ts')"));
  assert.ok(!prerender.includes('function clampTitle('));
  assert.ok(!prerender.includes('function clampDescription('));
  assert.ok(middleware.includes("from '../lib/meta/clamp.js'"));
  assert.ok(middleware.includes('const title = clampTitle('));
  assert.ok(middleware.includes('const description = clampDescription('));
});

test('product titles preserve distinguishing catalog words without hard truncation', () => {
  const source = readFileSync(new URL('../scripts/prerender.js', import.meta.url), 'utf8');
  const truncate = source.slice(source.indexOf('function truncateAtWord('), source.indexOf('// Use the same limits'));
  const disambiguate = source.slice(source.indexOf('function disambiguateDuplicateProductRouteTitles('), source.indexOf('// ─── Shopify Storefront API'));
  const run = new Function('clampTitle', 'getVerifiedPrimaryStyleReference', 'normalizeWhitespace', `${truncate}\n${disambiguate}\nreturn disambiguateDuplicateProductRouteTitles;`)(clampTitle, () => '', value => value.replace(/\s+/g, ' ').trim());
  const routes = ['Tissue', 'Chinon'].map(fabric => ({
    path: `/product/pink-saree-${fabric.toLowerCase()}`,
    title: `Pink Embroidered Wedding Guest Reception Saree ${fabric} | LuxeMia`,
    h1: `Pink Embroidered Wedding Guest Reception Saree ${fabric}`,
    product: {},
  }));
  run(routes);
  const titles = routes.map(route => clampTitle(route.title, undefined, Infinity));
  assert.equal(new Set(titles).size, 2);
  assert.ok(titles.every(title => !title.includes('…')));
  assert.ok(titles[0].toLowerCase().includes('tissue'));
  assert.ok(titles[1].toLowerCase().includes('chinon'));
});

test('product titles remain complete while normal page title clamping remains available', () => {
  const long = 'Crimson Red Silk Royal Arch Zardosi Bridal Lehenga Double Dupatta | LuxeMia';
  assert.equal(clampTitle(long, undefined, Infinity), long);
  assert.ok(clampTitle(long).includes('…'));
});

test('product snippets use supplied facts without inventing missing pieces or amounts', () => {
  const rich = generateMetaDescription('', 'Suit', 'Silk Suit', '99.00', '', 'Silk', 'Kurta, pants');
  assert.match(rich, /Shop Silk Suit \(\$99\.00\) at LuxeMia/);
  assert.match(rich, /Silk · Includes Kurta, pants/);
  assert.ok(clampDescription(rich).length <= 155);
  const sparse = generateMetaDescription('', 'Suit', 'Silk Suit');
  assert.doesNotMatch(sparse, /Includes|\$99/);
  assert.match(sparse, /shipping at \$150\+ after discounts/);
  const long = generateMetaDescription('', '', 'Wedding outfit '.repeat(30));
  assert.ok(clampDescription(long).length <= 155);
  assert.doesNotMatch(long, /…/);
});
