const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '..');
const generatorPath = path.join(root, 'scripts/generate-static-feed.cjs');
const originalSource = fs.readFileSync(generatorPath, 'utf8');
// Exercise the real item renderer without invoking catalog/network/build work.
const source = originalSource.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'module.exports = { generateProductItemXml };');
assert.notEqual(source, originalSource);
const context = { require: createRequire(generatorPath), module: { exports: {} }, __dirname: path.dirname(generatorPath), process, console };
vm.runInNewContext(source, context, { filename: generatorPath });
const { generateProductItemXml } = context.module.exports;

const expectedInternational = [
  ['CA', '24.99 USD'], ['GB', '24.99 USD'], ['AU', '29.99 USD'],
  ['NZ', '29.99 USD'], ['ZA', '49.99 USD'], ['MU', '59.99 USD'],
];
const shippingEntries = xml => [...xml.matchAll(/<g:shipping><g:country>([^<]+)<\/g:country><g:service>([^<]+)<\/g:service><g:price>([^<]+)<\/g:price><\/g:shipping>/g)]
  .map(([, country, service, price]) => [country, service, price]);
const render = (amount, compareAt) => {
  const variant = {
    id: 'gid://shopify/ProductVariant/123', sku: 'LM-SHIPPING-FIXTURE',
    selectedOptions: [{ name: 'Size', value: 'Standard' }], availableForSale: true,
    price: { amount: amount.toFixed(2), currencyCode: 'USD' },
    compareAtPrice: compareAt ? { amount: compareAt.toFixed(2), currencyCode: 'USD' } : null,
  };
  const product = {
    id: 'gid://shopify/Product/123', handle: 'blue-silk-shipping-fixture',
    title: 'Blue Silk Saree', vendor: 'LuxeMia', productType: 'Saree',
    description: 'Blue silk saree.', tags: [],
    images: { edges: [{ node: { url: 'https://cdn.shopify.com/s/files/1/fixture.jpg' } }] },
    variants: { edges: [{ node: variant }] },
    priceRange: { minVariantPrice: variant.price },
  };
  return generateProductItemXml(product, variant, new Map(), new Set());
};

test('every U.S. offer inherits the account order-total threshold and delivery settings', () => {
  for (const amount of [84.99, 149.99, 150, 150.01, 173.6]) {
    const xml = render(amount);
    assert.deepEqual(shippingEntries(xml), expectedInternational.map(([country, price]) => [country, 'Standard', price]));
    assert.doesNotMatch(xml, /<g:country>US<\/g:country>/);
    assert.match(xml, new RegExp(`<g:price>${amount.toFixed(2).replace('.', '\\.')} USD</g:price>`));
  }
});

test('a sale crossing below $150 preserves both prices without an incorrect free-shipping override', () => {
  const xml = render(139.08, 178.32);
  assert.match(xml, /<g:price>178\.32 USD<\/g:price>/);
  assert.match(xml, /<g:sale_price>139\.08 USD<\/g:sale_price>/);
  assert.doesNotMatch(xml, /<g:country>US<\/g:country>|<g:free_shipping_threshold>/);
});

test('multiple below-threshold offers do not override the account cart-total rule', () => {
  // $80 + $70 meets the account's $150 threshold; neither item forces $14.99.
  for (const xml of [render(80), render(70)]) {
    assert.doesNotMatch(xml, /<g:country>US<\/g:country>/);
    assert.equal(shippingEntries(xml).length, 6);
  }
});

test('feed validation rejects reintroduced U.S. overrides and changed international rates', () => {
  const validator = fs.readFileSync(path.join(root, 'scripts/validate-merchant-feed.cjs'), 'utf8');
  const start = validator.indexOf('const FEED_SHIPPING_RATES =');
  const end = validator.indexOf('if (/<g:returns>/', start);
  assert(start > 0 && end > start);
  const shippingValidation = validator.slice(start, end);
  const validate = xml => vm.runInNewContext(shippingValidation, { itemBlocks: [xml] });
  const valid = render(173.6);
  assert.doesNotThrow(() => validate(valid));
  assert.throws(() => validate(valid.replace('</item>', '<g:shipping><g:country>US</g:country><g:service>Standard</g:service><g:price>14.99 USD</g:price></g:shipping></item>')), /inherit U.S. account shipping/);
  assert.throws(() => validate(valid.replace('</item>', '<g:shipping>\n<g:country>US</g:country>\n<g:price>14.99 USD</g:price></g:shipping></item>')), /unrecognized shipping override format/);
  assert.throws(() => validate(valid.replace('24.99 USD', '0.00 USD')), /preserve the six international overrides/);
  assert.throws(() => validate(valid.replace('<g:country>CA</g:country>', '<g:country>US</g:country>')), /inherit U.S. account shipping/);
});
