const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const { buildSync } = require('esbuild');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
function loadSchema(source = read('src/lib/schema.ts')) {
  const { outputFiles } = buildSync({
    stdin: { contents: source, loader: 'ts', resolveDir: path.join(root, 'src/lib') },
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}
function assertOfferSafe(offer) {
  const policies = loadSchema().generateUsShippingServiceSchema();
  assert.deepEqual(offer.shippingDetails, policies.map(service => ({
    '@type': 'OfferShippingDetails', hasShippingService: { '@id': service['@id'] },
  })));
  assert.doesNotMatch(JSON.stringify(offer.shippingDetails), /shippingRate|orderValue|deliveryTime|handlingTime|transitTime/);
  assert.equal('merchantReturnLink' in offer, false);
  assert.equal('hasMerchantReturnPolicy' in offer, false);
}
const product = {
  name: 'Alteration-capable outfit', description: 'Fixture', url: 'https://luxemia.shop/product/fixture',
  image: [], sku: 'FIXTURE', price: '99.97', currency: 'USD', availability: 'InStock', shipsWithinDays: 4,
};

test('Product offers reference global policies without incomplete shipping and invalid return properties regardless of handling or alterations', () => {
  const { generateProductSchema, generateUsShippingServiceSchema, generateReturnPolicySchema } = loadSchema();
  for (const price of ['80.00', '149.99', '150.00', '173.60']) {
    for (const days of [undefined, 4, 6, 0, -1, NaN]) {
      for (const omitShippingTiming of [false, true]) {
        const result = generateProductSchema({ ...product, price, shipsWithinDays: days, omitShippingTiming });
        assertOfferSafe(result.offers);
        assert.equal(result.offers.price, price);
        assert.equal(result.offers.priceCurrency, 'USD');
        assert.equal(result.offers.availability, 'https://schema.org/InStock');
      }
    }
  }
  assert.equal(generateReturnPolicySchema(), null);
  const policies = generateUsShippingServiceSchema();
  assert.equal(policies.length, 5);
  assert.deepEqual(policies[0].shippingConditions.map(x => [x.shippingRate.value, x.orderValue]), [
    [14.99, { '@type': 'MonetaryAmount', minValue: 0, maxValue: 149.99, currency: 'USD' }],
    [0, { '@type': 'MonetaryAmount', minValue: 150, currency: 'USD' }],
  ]);
  assert.deepEqual(policies.slice(1).map(x => x.shippingConditions.map(c => c.shippingRate.value)), [[24.99, 0], [29.99, 0], [49.99], [59.99]]);
});

test('ProductGroup variant offers preserve identity, price and stock without inventing universal delivery or returns', () => {
  const { generateProductGroupSchema } = loadSchema();
  const input = { ...product, productGroupId: 'fixture', variesBy: ['https://schema.org/size'],
    variants: ['32', 'Alteration / Custom Size'].map((size, index) => ({
      ...product, id: String(index + 1), name: `${product.name} / ${size}`, size,
      url: `${product.url}?variant=${index + 1}`, sku: `FIXTURE-${index + 1}`,
    })),
  };
  for (const omitShippingTiming of [false, true]) {
    const result = generateProductGroupSchema({ ...input, omitShippingTiming });
    assert.equal(result.hasVariant.length, 2);
    result.hasVariant.forEach((variant, index) => {
      assertOfferSafe(variant.offers);
      assert.equal(variant.offers.url, input.variants[index].url);
      assert.equal(variant.offers.price, '99.97');
      assert.equal(variant.offers.availability, 'https://schema.org/InStock');
    });
  }
});

test('the real schema rewriter cannot reintroduce invalid offer properties after two runs', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'luxemia-alteration-schema-'));
  try {
    fs.mkdirSync(path.join(fixture, 'src/lib'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'scripts'));
    fs.writeFileSync(path.join(fixture, 'src/lib/schema.ts'), read('src/lib/schema.ts'));
    fs.writeFileSync(path.join(fixture, 'scripts/prerender.js'), read('scripts/prerender.js'));
    const source = read('scripts/apply-route-based-shipping-growth.cjs');
    // Run the actual schema rewrite in a disposable fixture, not unrelated site mutations.
    const entrypoint = '\npatchSeoArchitecture();\n';
    assert.equal(source.split(entrypoint).length, 2, 'schema rewriter entrypoint is identified exactly');
    const schemaOnly = source.slice(0, source.indexOf(entrypoint)) + '\npatchSchema();\n';
    let first;
    for (let run = 0; run < 2; run++) {
      vm.runInNewContext(schemaOnly, { require, __dirname: path.join(fixture, 'scripts') });
      const schemaSource = fs.readFileSync(path.join(fixture, 'src/lib/schema.ts'), 'utf8');
      const prerenderSource = fs.readFileSync(path.join(fixture, 'scripts/prerender.js'), 'utf8');
      assertOfferSafe(loadSchema(schemaSource).generateProductSchema(product).offers);
      for (const source of [schemaSource, prerenderSource]) {
        assert.doesNotMatch(source, /^\s*merchantReturnLink:/m);
        assert.match(source, /shippingDetails: generateOfferShippingReferences\(\)/);
      }
      const current = { schemaSource, prerenderSource };
      if (first) assert.deepEqual(current, first, 'second schema rewrite is idempotent');
      first = current;
    }
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('shipping references resolve to unchanged template policies covering exactly seven supported countries', () => {
  const { generateOfferShippingReferences, generateUsShippingServiceSchema, SHIPPING_COUNTRIES } = loadSchema();
  const policies = generateUsShippingServiceSchema();
  const templateNodes = [...read('index.html').matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .flatMap(match => { const node = JSON.parse(match[1]); return node['@graph'] || [node]; });
  const references = generateOfferShippingReferences();
  assert.equal(new Set(references.map(ref => ref.hasShippingService['@id'])).size, 5);
  for (const policy of policies) {
    const node = templateNodes.find(node => node['@type'] === 'ShippingService' && node['@id'] === policy['@id']);
    assert(node, `template defines ${policy['@id']}`);
    assert.deepEqual(node.shippingConditions, policy.shippingConditions, 'template and runtime retain identical rates and thresholds');
  }
  const countries = new Set(policies.flatMap(policy => policy.shippingConditions.flatMap(condition => condition.shippingDestination.addressCountry)));
  assert.deepEqual([...countries].sort(), [...SHIPPING_COUNTRIES].sort());
  for (const category of ['Sarees', 'Lehengas', 'Salwar Kameez', 'Menswear', 'Jewelry']) {
    const result = loadSchema().generateProductSchema({ ...product, category });
    assert.equal(result.category, category);
    assert.deepEqual(result.offers.shippingDetails, references);
  }
});
