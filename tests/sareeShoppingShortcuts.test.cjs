const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/components/collections/CategoryListing.tsx'), 'utf8');

test('saree shopping shortcuts use existing price filters without changing prices', () => {
  const href = source.match(/to="(\/sarees\?price=[^"]+)"/)[1];
  const url = new URL(href, 'https://luxemia.shop');
  assert.equal(url.pathname, '/sarees');
  assert.equal(url.searchParams.get('price'), '0-99.99');
  assert.equal(url.searchParams.get('sort'), 'price-asc');
  assert.match(source, /config\.slug === 'sarees' && \([\s\S]*Sarees under \$100/);
});

test('designer shortcut uses the existing indexable collection, not a new page', () => {
  assert.match(source, /to="\/collections\/designer-sarees"/);
  assert.ok(source.includes("canPromoteCollection('/collections/designer-sarees') && ("));
  const paused = require('../src/config/emptyCatalogRoutes.json');
  assert.ok(!paused.includes('/collections/designer-sarees'));
});

test('existing filter pages remain noindex with clean canonical and normal selection logic', () => {
  assert.match(source, /noIndexFollow=\{hasListingQueryState\}/);
  assert.match(source, /canonical=\{canonical\}/);
  assert.match(source, /filterSortAndSubcategorize\(/);
  assert.match(source, /reviewedShoppingLinks\[config\.slug/);
});
