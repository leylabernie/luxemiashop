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
function withoutTiming(entries) {
  return entries.map(({ deliveryTime, ...entry }) => entry);
}
function assertGuard(helper) {
  const regular = helper(4);
  assert.equal(regular.length, 8);
  assert.deepEqual(helper(4, false), regular);
  for (const entry of regular) {
    assert.deepEqual(entry.deliveryTime.handlingTime, {
      '@type': 'QuantitativeValue', minValue: 0, maxValue: 4, unitCode: 'DAY',
    });
    assert.equal('transitTime' in entry.deliveryTime, false);
  }
  for (const days of [4, 6, undefined, null, 0, -1, NaN]) {
    const guarded = helper(days, true);
    assert.deepEqual(guarded, withoutTiming(regular));
    for (const entry of guarded) {
      assert.equal('deliveryTime' in entry, false);
      assert.deepEqual(entry.shippingOrigin, { '@type': 'DefinedRegion', addressCountry: 'IN' });
      assert(entry.shippingDestination);
      assert(entry.shippingRate);
    }
  }
  for (const days of [undefined, null, 0, -1, NaN]) {
    assert.deepEqual(helper(days), withoutTiming(regular));
  }
}
const product = {
  name: 'Alteration-capable outfit', description: 'Fixture', url: 'https://luxemia.shop/product/fixture',
  image: [], sku: 'FIXTURE', price: '99.97', currency: 'USD', availability: 'InStock', shipsWithinDays: 4,
};

test('optional timing guard preserves every rate, destination and India origin without adding transit promises', () => {
  assertGuard(loadSchema().generateUsProductShippingDetails);
});

test('Product schema propagates the optional family timing guard without changing the offer', () => {
  const { generateProductSchema } = loadSchema();
  const normal = generateProductSchema(product);
  const guarded = generateProductSchema({ ...product, omitShippingTiming: true });
  assert.deepEqual(guarded, {
    ...normal, offers: { ...normal.offers, shippingDetails: withoutTiming(normal.offers.shippingDetails) },
  });
  assert.deepEqual(generateProductSchema({ ...product, omitShippingTiming: false }), normal);
});

test('ProductGroup suppresses base-only handling for every variant when the family allows fitting or services', () => {
  const { generateProductGroupSchema } = loadSchema();
  const input = {
    ...product, productGroupId: 'fixture', variesBy: ['https://schema.org/size'],
    variants: ['32', 'Alteration / Custom Size'].map((size, index) => ({
      ...product, id: String(index + 1), name: `${product.name} / ${size}`, size,
      url: `${product.url}?variant=${index + 1}`, sku: `FIXTURE-${index + 1}`,
    })),
  };
  const normal = generateProductGroupSchema(input);
  const guarded = generateProductGroupSchema({ ...input, omitShippingTiming: true });
  assert.equal(guarded.hasVariant.length, 2);
  assert.deepEqual(guarded, {
    ...normal,
    hasVariant: normal.hasVariant.map(variant => ({
      ...variant, offers: { ...variant.offers, shippingDetails: withoutTiming(variant.offers.shippingDetails) },
    })),
  });
  assert.deepEqual(generateProductGroupSchema({ ...input, omitShippingTiming: false }), normal);
});

test('the real schema rewriter retains the optional guard in TypeScript and prerender helpers after two runs', () => {
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
      assertGuard(loadSchema(schemaSource).generateUsProductShippingDetails);
      const helper = prerenderSource.match(/function generateUsProductShippingDetails\([^]*?\n\}/)?.[0];
      assert(helper, 'prerender helper is present');
      const generateShipping = new Function(`${helper}; return generateUsProductShippingDetails;`)();
      assertGuard(generateShipping);
      const current = { schemaSource, prerenderSource };
      if (first) assert.deepEqual(current, first, 'second schema rewrite is idempotent');
      first = current;
    }
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
