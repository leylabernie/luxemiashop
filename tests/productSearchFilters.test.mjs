import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { filterSearchResults, getSearchFabric, getSearchSizes } from '../src/lib/productSearchFilters.ts';

const defaults = { query: '', priceRange: [0, 1000], selectedSizes: [], selectedFabrics: [] };
const products = [
  { title: 'Blue Saree', category: 'Sarees', price: '150', fabric: 'Pure Silk', sizes: ['M', '38'] },
  { title: 'Red Suit', category: 'Suits', price: '200', fabric: 'Cotton', sizes: ['L'] },
  { title: 'Black Lehenga', category: 'Lehengas', price: '300', fabric: '', sizes: ['XL'] },
];
const variant = (size, availableForSale = true, name = 'Size') => ({ node: { availableForSale, selectedOptions: [{ name, value: size }] } });

test('size-only search activates results and matches actual variant choices', () => {
  const sizes = getSearchSizes({ variants: { edges: [variant(' m '), variant('38'), variant('XL', false), variant('S', true, 'Color')] } });
  assert.deepEqual(sizes, ['M', '38']);
  assert.deepEqual(filterSearchResults(products, { ...defaults, selectedSizes: ['M'] }), [products[0]]);
  assert.deepEqual(filterSearchResults(products, { ...defaults, selectedSizes: ['38', 'L'] }), products.slice(0, 2));
  assert.deepEqual(filterSearchResults(products, { ...defaults, selectedSizes: ['S'] }), []);
});

test('size aliases and native imported size options are supported without inventing sizes', () => {
  assert.deepEqual(getSearchSizes({ options: [{ name: 'Stitching', values: ['S', 'M'] }], variants: { edges: [variant('S', true, 'Stitching')] } }), ['S', 'M']);
  assert.deepEqual(getSearchSizes({ variants: { edges: [variant('40', true, 'Blouse Size')] } }), ['40']);
  assert.deepEqual(getSearchSizes({ options: [{ name: 'Color', values: ['S', 'M'] }] }), []);
  assert.deepEqual(getSearchSizes({ options: [{ name: 'Size', values: ['S', 'M'] }] }), ['S', 'M']);
  assert.deepEqual(getSearchSizes({}), []);
});

test('unknown fabric never defaults to Silk; real structured fabric wins', () => {
  assert.equal(getSearchFabric({}), '');
  assert.equal(getSearchFabric({ metadata: { fabric: ' Cotton ' }, tags: ['fabric:silk'] }), 'Cotton');
  assert.equal(getSearchFabric({ fabricMetafield: { value: 'Pure Silk' } }), 'Pure Silk');
  assert.equal(getSearchFabric({ metadata: { material: 'Georgette' } }), 'Georgette');
  assert.equal(getSearchFabric({ tags: ['fabric:Velvet', 'occasion:Bridal'] }), 'Velvet');
  assert.deepEqual(filterSearchResults(products, { ...defaults, selectedFabrics: ['Silk'] }), [products[0]]);
  assert.deepEqual(filterSearchResults(products, { ...defaults, selectedFabrics: ['Cotton'], selectedSizes: ['M'] }), []);
});

test('ordinary title, category, fabric text and price searches remain intact', () => {
  assert.deepEqual(filterSearchResults(products, { ...defaults, query: 'blue' }), [products[0]]);
  assert.deepEqual(filterSearchResults(products, { ...defaults, query: 'SUITS' }), [products[1]]);
  assert.deepEqual(filterSearchResults(products, { ...defaults, query: 'silk' }), [products[0]]);
  assert.deepEqual(filterSearchResults(products, { ...defaults, priceRange: [180, 250] }), [products[1]]);
  assert.deepEqual(filterSearchResults(products, { ...defaults, query: 'saree', selectedSizes: ['L'] }), []);
});

test('Clear All resets size, fabric, and price while preserving ordinary search text', () => {
  assert.deepEqual(filterSearchResults(products, defaults), []);
  assert.deepEqual(filterSearchResults(products, { ...defaults, query: 'saree' }), [products[0]]);
  const source = readFileSync(new URL('../src/components/search/ProductSearch.tsx', import.meta.url), 'utf8');
  const clear = source.match(/const clearFilters = \(\) => \{([\s\S]*?)\n  \};/)[1];
  assert.match(clear, /setPriceRange\(\[0, 1000\]\)/);
  assert.match(clear, /setSelectedSizes\(\[\]\)/);
  assert.match(clear, /setSelectedFabrics\(\[\]\)/);
  assert.doesNotMatch(clear, /setQuery/);
  assert.match(source, /\[query, allProducts, priceRange, selectedSizes, selectedFabrics\]/);
});

test('catalog preview variant does not hide other offered sizes', () => {
  assert.deepEqual(getSearchSizes({ options: [{ name: 'Size', values: ['32', '34', '36', '38', '40', '42', '44'] }], variants: { edges: [variant('32')] } }), ['32', '34', '36', '38', '40', '42', '44']);
});

test('lining-only material is not a garment fabric filter match', () => {
  for (const source of [
    { tags: ['fabric:Cotton lining only; outer composition unspecified'] },
    { materialMetafield: { value: 'Cotton top lining; outer fiber composition not specified' } },
  ]) {
    const fabric = getSearchFabric(source);
    assert.equal(fabric, '');
    assert.deepEqual(filterSearchResults([{ ...products[1], fabric }], { ...defaults, selectedFabrics: ['Cotton'] }), []);
  }
  assert.equal(getSearchFabric({ metadata: { fabric: 'Silk outer with cotton lining' } }), 'Silk outer');
  const fabric = getSearchFabric({ metadata: { fabric: 'Silk outer with cotton lining' } });
  assert.equal(filterSearchResults([{ ...products[1], fabric }], { ...defaults, selectedFabrics: ['Silk'] }).length, 1);
  assert.equal(filterSearchResults([{ ...products[1], fabric }], { ...defaults, selectedFabrics: ['Cotton'] }).length, 0);
});
