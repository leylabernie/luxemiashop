const test = require('node:test');
const assert = require('node:assert/strict');
const esbuild = require('esbuild');
const path = require('node:path');
const result = esbuild.buildSync({entryPoints: [path.join(__dirname, '../src/lib/merchantImages.ts')], bundle: true, platform: 'node', format: 'cjs', write: false});
const loaded = {exports: {}};
new Function('module', 'exports', result.outputFiles[0].text)(loaded, loaded.exports);
const {selectMerchantImage} = loaded.exports;
const selections = require('../src/data/merchantImageSelections.json');

test('uses each reviewed higher-resolution original only from the product gallery', () => {
  for (const [handle, {original, replacement}] of Object.entries(selections)) {
    assert.equal(selectMerchantImage(handle, original + '?v=1', [original, replacement + '?v=2']), replacement + '?v=2');
    assert.equal(selectMerchantImage(handle, original, [original]), original);
  }
});
test('preserves a different variant image and products without reviewed selections', () => {
  const [handle, {replacement}] = Object.entries(selections)[0];
  const variant = 'https://cdn.shopify.com/different-color.jpg';
  assert.equal(selectMerchantImage(handle, variant, [variant, replacement]), variant);
  assert.equal(selectMerchantImage('unreviewed', variant, [replacement]), variant);
});
