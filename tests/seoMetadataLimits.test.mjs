import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clampTitle, clampDescription } from '../src/lib/meta/clamp.ts';

test('long product titles retain one brand and fit the search limit', () => {
  const title = clampTitle('Mint Green Silk Lehenga Choli with Sequin Work and Net Dupatta | LuxeMia');
  assert.ok(title.length < 60);
  assert.equal((title.match(/LuxeMia/g) || []).length, 1);
  assert.ok(title.startsWith('Mint Green Silk Lehenga'));
  assert.equal(clampTitle(title), title);
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

test('duplicate titles retain distinguishing catalog words within 58 characters', () => {
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
  const titles = routes.map(route => clampTitle(route.title));
  assert.equal(new Set(titles).size, 2);
  assert.ok(titles.every(title => title.length < 60));
  assert.ok(titles[0].toLowerCase().includes('tissue'));
  assert.ok(titles[1].toLowerCase().includes('chinon'));
});
