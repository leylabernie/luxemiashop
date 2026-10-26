const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { build } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { HelmetProvider } = require('react-helmet-async');
const { MemoryRouter } = require('react-router-dom');
const { serializeJsonLd } = require('../src/lib/serializeJsonLd.cjs');
const root = path.resolve(__dirname, '..');

async function load(entry) {
  const { outputFiles } = await build({
    entryPoints: [path.join(root, entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    alias: { '@': path.join(root, 'src') },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}

const poison = 'Quoted "value" \\ newline\n</ScRiPt><script data-schema-injection>alert(1)</script> < & \u2028\u2029';
const parseScripts = (html) => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => JSON.parse(match[1]));

test('JSON-LD serialization round-trips text and cannot terminate its HTML script', () => {
  const input = { '@type': 'Product', name: poison, price: '0.00', available: false, optional: null };
  const serialized = serializeJsonLd(input);
  assert.deepEqual(JSON.parse(serialized), input);
  assert.doesNotMatch(serialized, /</);
  assert.throws(() => serializeJsonLd(undefined), /JSON-serializable/);
});

test('the existing React emitter outputs one Product, preserving API money, stock and image', async () => {
  const SEOHead = (await load('src/components/seo/SEOHead.tsx')).default;
  const helmet = {};
  renderToStaticMarkup(React.createElement(HelmetProvider, { context: helmet },
    React.createElement(SEOHead, {
      title: 'Fixture', canonical: 'https://luxemia.shop/product/fixture', type: 'product',
      product: { name: poison, description: poison, price: '1299.99', currency: 'EUR',
        image: 'https://cdn.shopify.com/variant.jpg', availability: 'OutOfStock', sku: 'fixture' },
    })));
  const scripts = helmet.helmet.script.toString();
  assert.doesNotMatch(scripts, /<script data-schema-injection>/);
  const products = parseScripts(scripts).filter(node => node['@type'] === 'Product');
  assert.equal(products.length, 1);
  assert.equal(products[0].name, poison);
  assert.equal(products[0].offers.price, '1299.99');
  assert.equal(products[0].offers.priceCurrency, 'EUR');
  assert.equal(products[0].offers.availability, 'https://schema.org/OutOfStock');
  assert.match(products[0].image[0], /cdn\.shopify\.com\/variant\.jpg/);
});

test('a ProductGroup replaces, rather than duplicates, the React Product node', async () => {
  const SEOHead = (await load('src/components/seo/SEOHead.tsx')).default;
  const helmet = {};
  const group = { '@context': 'https://schema.org', '@type': 'ProductGroup', name: poison,
    hasVariant: [{ '@type': 'Product', name: 'A', offers: { '@type': 'Offer', price: '12.34', priceCurrency: 'USD' } }] };
  renderToStaticMarkup(React.createElement(HelmetProvider, { context: helmet },
    React.createElement(SEOHead, { title: 'Fixture', canonical: 'https://luxemia.shop/product/fixture',
      structuredProduct: group, product: { name: 'Unused fallback', price: '99.00', currency: 'USD', image: '' } })));
  const nodes = parseScripts(helmet.helmet.script.toString());
  assert.equal(nodes.filter(node => node['@type'] === 'Product').length, 0);
  assert.deepEqual(nodes.find(node => node['@type'] === 'ProductGroup'), group);
});

test('existing footer retains privacy and policy destinations without unverified identity claims', async () => {
  const Footer = (await load('src/components/layout/Footer.tsx')).default;
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Footer)));
  assert.doesNotMatch(html, /Glamour Indian Wear|owned and operated by|<address/);
  for (const route of ['/privacy', '/terms', '/shipping', '/returns']) assert(html.includes(`href="${route}"`));
  assert.match(html, /Philadelphia, PA/);
});

test('build policy rewriters use the safe serializer and keep legal/return guards', () => {
  for (const file of ['scripts/apply-trust-source-of-truth.cjs', 'scripts/postprocess-built-trust.cjs']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(source, /serializeJsonLd\(cleaned, 2\)/);
    assert.doesNotMatch(source, /JSON\.stringify\(cleaned/);
    assert.match(source, /Glamour Indian Wear/);
    assert.match(source, /hasMerchantReturnPolicy/);
  }
});

test('verified India dispatch enriches existing shipping entries without inventing policy timing or returns', async () => {
  const { generateUsProductShippingDetails, generateReturnPolicySchema } = await load('src/lib/schema.ts');
  const entries = generateUsProductShippingDetails();
  assert.equal(entries.length, 8);
  for (const entry of entries) {
    assert.deepEqual(entry.shippingOrigin, { '@type': 'DefinedRegion', addressCountry: 'IN' });
    assert(entry.shippingDestination);
    assert(entry.shippingRate);
    assert.equal('deliveryTime' in entry, false);
    assert.notEqual(entry.shippingDestination.addressCountry, 'IN');
  }
  assert.equal(entries[0].shippingRate.value, 14.99);
  assert.equal(entries[1].shippingRate.value, 0);
  assert.equal(generateReturnPolicySchema(), null);
});
