const test = require('node:test');
const assert = require('node:assert/strict');
const esbuild = require('esbuild');
const path = require('node:path');
const bundle = esbuild.buildSync({ entryPoints: [path.join(__dirname, '../src/lib/catalogMaterial.ts')], bundle: true, platform: 'node', format: 'cjs', write: false });
const loaded = { exports: {} };
new Function('module', 'exports', bundle.outputFiles[0].text)(loaded, loaded.exports);
const { getCatalogMaterial } = loaded.exports;

test('a fabric-only metafield reaches merchant and storefront specifications', () => {
  assert.equal(getCatalogMaterial({ fabricMetafield: { value: 'Chinon' } }), 'Chinon');
  assert.equal(getCatalogMaterial({ metadata: { fabric: 'Pure Crepe' } }), 'Pure Crepe');
});

test('a variant material overrides a product-level value without choosing another variant', () => {
  const product = { fabricMetafield: { value: 'Cotton' }, options: [{ name: 'Fabric', values: ['Cotton', 'Silk'] }] };
  assert.equal(getCatalogMaterial(product, [{ name: 'Fabric', value: 'Silk' }]), 'Silk');
  assert.equal(getCatalogMaterial({ options: product.options }), '');
});

test('missing data stays missing and exact legacy fabric tags remain supported', () => {
  assert.equal(getCatalogMaterial({ tags: ['wedding', 'silk-inspired'] }), '');
  assert.equal(getCatalogMaterial({ tags: ['Fabric: Art Silk'] }), 'Art Silk');
  assert.equal(getCatalogMaterial({ materialMetafield: { value: '  ' }, tags: ['material:Viscose'] }), 'Viscose');
});
