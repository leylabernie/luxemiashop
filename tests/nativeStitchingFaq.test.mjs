import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { hasNativeFullStitchingOptions, hasNativeStitchingChoices } from '../src/lib/serviceAddOns.ts';

const source = readFileSync(new URL('../src/pages/ProductDetail.tsx', import.meta.url), 'utf8');
// Exercise the actual FAQ expressions shared by visible answers and JSON-LD.
const deliveryExpression = source.match(/question: `What is the delivery time[^\n]+\n\s*answer: ([\s\S]+?)\n    \},/)[1];
const careExpression = source.match(/question: `How should I care[^\n]+\n\s*answer: ([\s\S]+?)\n    \}/)[1];
const delivery = new Function('product', 'madeToOrderProduct', 'hasNativeFullStitchingOptions', `return ${deliveryExpression};`);
const care = new Function('product', 'productCare', 'hasNativeFullStitchingOptions', 'isJewelryProduct', `return ${careExpression};`);
const productFor = sizes => ({
  title: 'Net Lehenga Choli', productType: 'Lehenga Choli', description: '', tags: [],
  options: [
    { name: 'Stitching', values: ['Unstitched (Fabric Only)', 'Standard Stitched', 'Custom Stitched'] },
    { name: 'Size', values: ['Fabric Only', ...sizes, 'Custom Fit'] },
  ],
  variants: { edges: [
    ['Unstitched (Fabric Only)', 'Fabric Only'],
    ...sizes.map(size => ['Standard Stitched', size]),
    ['Custom Stitched', 'Custom Fit'],
  ].map(([stitching, size]) => ({ node: { selectedOptions: [
    { name: 'Stitching', value: stitching }, { name: 'Size', value: size },
  ] } })) },
});

test('native FAQs explain fabric and stitched timing for 32–42, 32–44 and 32–46', () => {
  for (const count of [6, 7, 8]) {
    const product = productFor(['32', '34', '36', '38', '40', '42', '44', '46'].slice(0, count));
    for (const tags of [[], ['construction:Unstitched'], ['availability:Confirm before ordering']]) {
      product.tags = tags;
      const answer = delivery(product, false, hasNativeFullStitchingOptions);
      assert.match(answer, /Unstitched \(Fabric Only\).*requires tailoring before wearing/);
      assert.match(answer, /Standard Stitched and Custom Stitched.*dispatch timing is confirmed after measurements/);
      assert.match(answer, /Confirm current availability/);
      assert.doesNotMatch(answer, /Ready to Ship|3–4|4–5/);
    }
    assert.doesNotMatch(care(product, null, hasNativeFullStitchingOptions, false), /dry clean|hand wash|iron/i);
    assert.match(care(product, null, hasNativeFullStitchingOptions, false), /not specified.*care label.*contact LuxeMia/);
    assert.equal(care(product, 'Supplier-confirmed care instruction.', hasNativeFullStitchingOptions, false), 'Supplier-confirmed care instruction.');
  }
});

test('non-native delivery and care FAQ behavior is unchanged', () => {
  const product = { title: 'Ready-made suit', description: '', tags: [] };
  assert.match(delivery(product, false, hasNativeFullStitchingOptions), /Ready to Ship/);
  assert.match(delivery(product, true, hasNativeFullStitchingOptions), /4–5 week/);
  product.tags = ['construction:Unstitched'];
  assert.match(delivery(product, false, hasNativeFullStitchingOptions), /This set is supplied unstitched/);
  assert.match(care(product, null, hasNativeFullStitchingOptions, false), /Dry cleaning is recommended/);
  assert.match(care(product, null, hasNativeFullStitchingOptions, true), /Keep jewelry away/);
  assert.match(source, /faqs=\{productFaqs\}/);
  assert.match(source, /productFaqs\.map/);
});

test('catalog-only variant data gets neutral stitching copy without weakening billing validation', () => {
  const product = productFor(['32', '34', '36', '38', '40', '42']);
  product.variants.edges = product.variants.edges.slice(0, 1);
  assert.equal(hasNativeStitchingChoices(product), true);
  assert.equal(hasNativeFullStitchingOptions(product), false);
  for (const values of [['Stitched'], ['Unstitched'], ['Unstitched', 'Ready-made'],
    ['Unstitched (Fabric Only)', 'Standard Stitched', 'Standard Stitched']]) {
    product.options[0].values = values;
    assert.equal(hasNativeStitchingChoices(product), false);
  }
  assert.equal(hasNativeStitchingChoices({ title: 'Saree', description: '' }), false);
  const card = readFileSync(new URL('../src/components/ui/ProductCard.tsx', import.meta.url), 'utf8');
  assert.match(card, /const hasStitchingChoices = hasNativeStitchingChoices\(product.node\)/);
  assert.match(card, /hasStitchingChoices \? 'Stitching options available'/);
  assert.match(card, /const shipByLabel = hasStitchingChoices \? null : getShipByLabel\(product.node\)/);
  for (const path of ['../src/components/home/NewArrivals.tsx', '../src/components/collections/CategoryListing.tsx', '../src/components/collections/ProductGrid.tsx']) {
    assert.match(readFileSync(new URL(path, import.meta.url), 'utf8'), /<ProductCard/);
  }
});

test('crawler HTML and FAQ JSON-LD use the same native timing and source-only care', () => {
  const prerender = readFileSync(new URL('../scripts/prerender.js', import.meta.url), 'utf8');
  assert.match(prerender, /hasNativeFullStitchingOptions.*loadTsModule\('src\/lib\/serviceAddOns.ts'\)/);
  assert.match(prerender, /const nativeStitching = hasNativeFullStitchingOptions\(p\)/);
  const evalStatic = (name, p, nativeStitching) => {
    const expression = prerender.match(new RegExp(`const ${name} = ([\\s\\S]+?);\\n`))[1];
    return new Function('p', 'nativeStitching', 'isCustomizable', 'productAttributes', `return ${expression};`)(p, nativeStitching, false, { jewelry: false, shipsWithinDays: 4 });
  };
  const product = productFor(['32', '34', '36', '38', '40', '42']);
  assert.equal(evalStatic('deliveryAnswer', product, true), delivery(product, false, hasNativeFullStitchingOptions));
  assert.equal(evalStatic('careAnswer', product, true), care(product, null, hasNativeFullStitchingOptions, false));
  product.careInstructionsMetafield = { value: 'Verified care.' };
  assert.equal(evalStatic('careAnswer', product, true), 'Verified care.');
  assert.match(evalStatic('shippingEstimate', product, true), /confirmed after measurements/);
  assert.doesNotMatch(evalStatic('shippingEstimate', product, true), /Ships within 4/);
  assert.match(prerender, /careInstructionsMetafield: metafield\(namespace: "custom", key: "care_instructions"\)/);
  assert.match(prerender, /answer: deliveryAnswer/);
  assert.match(prerender, /answer: careAnswer/);
});
