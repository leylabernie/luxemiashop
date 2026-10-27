import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  getEligibleServiceAddOns,
  hasNativeFullStitchingOptions,
  hasNativeAlterationOptions,
  selectedEligibleServiceAddOns,
  serviceAddOnTotal,
  requiresNativeStitchingTimingConfirmation,
  isUnstitchedDeliverySelection,
  NATIVE_STITCHING_TIMING_NOTICE,
} from '../src/lib/serviceAddOns.ts';
import { resolveAvailableVariantForOption } from '../src/lib/productPurchaseFlow.ts';

test('fabric-only lehenga does not sell a garment alteration as stitching', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Sky Blue Art Silk Lehenga — Unstitched', productType: 'Lehenga Choli',
    description: 'Unstitched fabric only.',
    options: [{ name: 'Stitching', values: ['Unstitched (Fabric Only)'] }],
  }), []);
});
test('unstitched tags work when a product has no construction selector', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Cotton Lehenga', productType: 'Lehenga Choli', description: '',
    tags: ['construction:Unstitched'],
  }), []);
});
test('ready-made garments retain the owner-approved alteration service', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Ready-made Lehenga', productType: 'Lehenga Choli', description: '',
    options: [{ name: 'Size', values: ['S', 'M'] }],
  }), ['garment-alteration']);
});
test('saree finishing and blouse services remain available', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Silk Saree', productType: 'Saree',
    description: 'Includes an unstitched blouse piece.',
  }), ['blouse-stitching', 'pico-fall', 'matching-petticoat']);
});

test('mixed construction choices retain the alteration option', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Lehenga', productType: 'Lehenga Choli', description: '',
    options: [{ name: 'Stitching', values: ['Unstitched', 'Ready-made'] }],
  }), ['garment-alteration']);
});

const standardSizes = ['32', '34', '36', '38', '40', '42', '44', '46'];
const nativeStitchingProduct = (fabricSize = 'Fabric Only', offeredSizes = standardSizes) => {
  const choices = [
    ['Unstitched (Fabric Only)', fabricSize, 100],
    ...offeredSizes.map(size => ['Standard Stitched', size, 129]),
    ['Custom Stitched', 'Custom Fit', 144],
  ];
  return {
    title: 'Silk Lehenga Choli', productType: 'Lehenga Choli', description: '',
    tags: ['construction:Unstitched', 'unstitched'],
    options: [
      { name: 'Stitching', values: ['Unstitched (Fabric Only)', 'Standard Stitched', 'Custom Stitched'] },
      { name: 'Size', values: [fabricSize, ...offeredSizes, 'Custom Fit'] },
    ],
    variants: { edges: choices.map(([stitching, size, amount], index) => ({ node: {
      id: String(index), availableForSale: true, price: { amount: String(amount), currencyCode: 'USD' },
      selectedOptions: [{ name: 'Stitching', value: stitching }, { name: 'Size', value: size }],
    } })) },
  };
};

test('the complete approved native stitching matrix never sells another alteration', () => {
  for (const fabricSize of ['Fabric Only', 'Not Applicable']) {
    const product = nativeStitchingProduct(fabricSize);
    assert.equal(hasNativeFullStitchingOptions(product), true);
    assert.deepEqual(getEligibleServiceAddOns(product), []);
  }
});

test('unrelated garments and saree services retain their existing behavior', () => {
  const suit = nativeStitchingProduct();
  suit.title = 'Silk Suit';
  suit.productType = 'Suit';
  assert.equal(hasNativeFullStitchingOptions(suit), false);
  assert.deepEqual(getEligibleServiceAddOns(suit), ['garment-alteration']);
  const saree = { title: 'Silk Saree', productType: 'Saree', description: 'Unstitched blouse piece' };
  assert.deepEqual(getEligibleServiceAddOns(saree), ['blouse-stitching', 'pico-fall', 'matching-petticoat']);
});

test('incomplete, duplicate, and Cartesian native matrices are not misclassified', () => {
  const incomplete = nativeStitchingProduct();
  incomplete.variants.edges.pop();
  assert.equal(hasNativeFullStitchingOptions(incomplete), false);
  const duplicate = nativeStitchingProduct();
  duplicate.variants.edges.push(duplicate.variants.edges[0]);
  assert.equal(hasNativeFullStitchingOptions(duplicate), false);
  const invalid = nativeStitchingProduct();
  invalid.variants.edges[0].node.selectedOptions[1].value = '32';
  assert.equal(hasNativeFullStitchingOptions(invalid), false);
  const noVariants = nativeStitchingProduct();
  delete noVariants.variants;
  assert.equal(hasNativeFullStitchingOptions(noVariants), false);
});

test('an unrelated ready-made choice and unspaced CustomFit do not match the contract', () => {
  const readyMade = nativeStitchingProduct();
  readyMade.options[0].values[1] = 'Ready-made';
  assert.equal(hasNativeFullStitchingOptions(readyMade), false);
  assert.deepEqual(getEligibleServiceAddOns(readyMade), ['garment-alteration']);
  const customFit = nativeStitchingProduct();
  customFit.options[1].values[9] = 'CustomFit';
  assert.equal(hasNativeFullStitchingOptions(customFit), false);
});

test('sold-out native sizes retain included-stitching protection', () => {
  const product = nativeStitchingProduct();
  product.variants.edges[3].node.availableForSale = false;
  assert.equal(hasNativeFullStitchingOptions(product), true);
  assert.deepEqual(getEligibleServiceAddOns(product), []);
});

test('every color must contain its own complete valid matrix', () => {
  const product = nativeStitchingProduct();
  const base = product.variants.edges;
  product.options.push({ name: 'Color', values: ['Blue', 'Red'] });
  product.variants.edges = ['Blue', 'Red'].flatMap(color => base.map(({ node }) => ({
    node: { ...node, selectedOptions: [...node.selectedOptions, { name: 'Color', value: color }] },
  })));
  assert.equal(hasNativeFullStitchingOptions(product), true);
  product.variants.edges.pop();
  assert.equal(hasNativeFullStitchingOptions(product), false);
});

test('stale selected alteration cannot affect native price or enter the service-line list', () => {
  const selected = ['garment-alteration'];
  const available = ['garment-alteration'];
  const readyMade = { title: 'Ready-made Lehenga', productType: 'Lehenga', description: '' };
  assert.deepEqual(selectedEligibleServiceAddOns(readyMade, selected, available), selected);
  const safeSelection = selectedEligibleServiceAddOns(nativeStitchingProduct(), selected, available);
  assert.deepEqual(safeSelection, []);
  assert.equal(serviceAddOnTotal(safeSelection), 0);
  assert.deepEqual(selectedEligibleServiceAddOns(readyMade, selected, []), []);
  assert.deepEqual(selectedEligibleServiceAddOns(readyMade, [...selected, ...selected], available), selected);
});

test('all 130 native option transitions preserve a real sparse variant and its exact price', () => {
  const product = nativeStitchingProduct();
  const variants = product.variants.edges.map(edge => edge.node);
  let checked = 0;
  for (const current of variants) {
    const selected = Object.fromEntries(current.selectedOptions.map(option => [option.name, option.value]));
    for (const option of product.options) for (const value of option.values) {
      const resolved = resolveAvailableVariantForOption(variants, selected, option.name, value);
      assert.ok(variants.includes(resolved));
      const next = Object.fromEntries(resolved.selectedOptions.map(choice => [choice.name, choice.value]));
      assert.equal(next[option.name], value);
      const price = next.Stitching === 'Standard Stitched' ? '129'
        : next.Stitching === 'Custom Stitched' ? '144' : '100';
      assert.equal(resolved.price.amount, price);
      checked++;
    }
  }
  assert.equal(checked, 130);
});

test('native UI guard preserves Custom Fit confirmation and blocks unsupported style attributes', () => {
  const source = readFileSync(new URL('../src/components/product/ProductInfo.tsx', import.meta.url), 'utf8');
  assert.match(source, /const isStitchable = !hasNativeFullStitching &&/);
  assert.match(source, /const isMenswear = !hasNativeFullStitching &&/);
  assert.match(source, /const showBottomStyleOption = !hasNativeFullStitching &&/);
  assert.match(source, /const needsStitchingSize = useMemo\(\(\) => \{[\s\S]*?if \(hasNativeFullStitching\) return false;/);
  assert.match(source, /if \(!hasNativeFullStitching && customAlteration\.trim\(\)\)/);
  assert.match(source, /if \(isCustomSizeSelected && !customSizeConfirmed\)/);
  assert.match(source, /Measurement Confirmation.*Customer acknowledged before checkout/);
  assert.match(source, /const selectedAvailableServiceAddOnCodes = selectedEligibleServiceAddOns\(/);
  assert.match(source, /serviceAddOnTotal\(selectedAvailableServiceAddOnCodes\)/);
  assert.match(source, /for \(const code of selectedAvailableServiceAddOnCodes\)/);
  assert.match('Custom Fit', /\bcustom(?:\s*size)?\b/i);
});

test('only native standard/custom stitched selections require confirmed timing', () => {
  const product = nativeStitchingProduct();
  for (const { node } of product.variants.edges) {
    assert.equal(requiresNativeStitchingTimingConfirmation(product, node.selectedOptions), node.id !== '0');
  }
  assert.equal(requiresNativeStitchingTimingConfirmation(product, []), false);
  const unrelated = { title: 'Ready-made Lehenga', productType: 'Lehenga', description: '' };
  assert.equal(requiresNativeStitchingTimingConfirmation(unrelated, [
    { name: 'Stitching', value: 'Standard Stitched' },
  ]), false);
});

const require = createRequire(import.meta.url);
const deliveryModule = { exports: {} };
const deliveryBuild = buildSync({
  entryPoints: [fileURLToPath(new URL('../src/components/product/DeliveryEstimate.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
  external: ['react', 'react/jsx-runtime'],
});
new Function('require', 'module', 'exports', deliveryBuild.outputFiles[0].text)(
  require, deliveryModule, deliveryModule.exports,
);
const renderDelivery = props => renderToStaticMarkup(createElement(deliveryModule.exports.DeliveryEstimate, props));

test('rendered native tailoring notice overrides inherited stock and custom ETAs', () => {
  for (const inherited of [
    { shipsWithinDays: 4 },
    { isMadeToOrder: true },
    { isUnstitched: true, shipsWithinDays: 4 },
  ]) {
    const html = renderDelivery({ hasStitching: false, ...inherited, requiresTailoringTimingConfirmation: true });
    assert.match(html, /Tailored to order/);
    assert.ok(html.includes(NATIVE_STITCHING_TIMING_NOTICE));
    assert.doesNotMatch(html, /Ready to ship|Estimated dispatch|3–4|4–5|Unstitched fabric set/);
  }
});

test('rendered fabric-only and unrelated ready-stock shipping behavior is unchanged', () => {
  const fabric = renderDelivery({ hasStitching: false, isUnstitched: true });
  assert.match(fabric, /Unstitched fabric set/);
  assert.doesNotMatch(fabric, /Tailored to order/);
  const readyStock = renderDelivery({ hasStitching: false });
  assert.match(readyStock, /Ready to ship/);
  assert.match(readyStock, /3–4 business days/);
  const madeToOrder = renderDelivery({ hasStitching: false, isMadeToOrder: true });
  assert.match(madeToOrder, /4–5 weeks/);
});

test('mixed-offer catalog tags use the actual selected Fabric Only variant in delivery', () => {
  const product = nativeStitchingProduct();
  product.tags = ['construction:Fabric Only or Stitched'];
  for (const { node } of product.variants.edges) {
    const isUnstitched = isUnstitchedDeliverySelection(product, node.selectedOptions);
    assert.equal(isUnstitched, node.id === '0');
    const html = renderDelivery({
      hasStitching: false,
      isUnstitched,
      requiresTailoringTimingConfirmation: requiresNativeStitchingTimingConfirmation(product, node.selectedOptions),
    });
    if (node.id === '0') {
      assert.match(html, /Unstitched fabric set/);
      assert.match(html, /Supplied unstitched; tailoring is required before wearing/);
      assert.doesNotMatch(html, /Ready to ship|3–4 business days|Tailored to order/);
    } else {
      assert.match(html, /Tailored to order/);
      assert.doesNotMatch(html, /Unstitched fabric set/);
    }
  }
  const unrelated = { title: 'Fabric suit', description: '', tags: ['construction:Unstitched'] };
  assert.equal(isUnstitchedDeliverySelection(unrelated, []), true);
  assert.equal(isUnstitchedDeliverySelection({ ...unrelated, tags: [] }, []), false);
  const source = readFileSync(new URL('../src/components/product/ProductInfo.tsx', import.meta.url), 'utf8');
  assert.match(source, /const isUnstitchedDelivery = isUnstitchedDeliverySelection\(\s*product, purchasableVariant\?\.node\.selectedOptions \?\? \[\]/);
  assert.match(source, /isUnstitched=\{isUnstitchedDelivery\}/);
});

test('native timing guard also covers ship-by badges, specifications and cart attributes', () => {
  const source = readFileSync(new URL('../src/components/product/ProductInfo.tsx', import.meta.url), 'utf8');
  assert.match(source, /const shipByLabel = requiresNativeTimingConfirmation \? null : getShipByLabel\(product\)/);
  assert.match(source, /const shipsWithinDays = requiresNativeTimingConfirmation \? null : getProductShipsWithin\(product\)/);
  assert.match(source, /requiresTailoringTimingConfirmation=\{requiresNativeTimingConfirmation\}/);
  assert.match(source, /requiresNativeTimingConfirmation\s*\? NATIVE_STITCHING_TIMING_NOTICE\s*: currentSelectionIsMadeToOrder/);
  assert.match(source, /key: 'Timing Confirmation', value: NATIVE_STITCHING_TIMING_NOTICE/);
  assert.match(source, /isCustomSizeSelected && !madeToOrderProduct && !requiresNativeTimingConfirmation/);
  assert.match(source, /if \(isCustomSizeSelected && !customSizeConfirmed\)/);
});

test('all nonempty supported size subsets preserve native billing and delivery guards', () => {
  for (let mask = 1; mask < 1 << standardSizes.length; mask++) {
    const sizes = standardSizes.filter((_, index) => mask & (1 << index));
    for (const fabricSize of ['Fabric Only', 'Not Applicable']) {
      const product = nativeStitchingProduct(fabricSize, sizes);
      assert.equal(hasNativeFullStitchingOptions(product), true, sizes.join(','));
      assert.deepEqual(getEligibleServiceAddOns(product), []);
      const safe = selectedEligibleServiceAddOns(product, ['garment-alteration'], ['garment-alteration']);
      assert.deepEqual(safe, []);
      assert.equal(serviceAddOnTotal(safe), 0);
      for (const { node } of product.variants.edges) {
        assert.equal(requiresNativeStitchingTimingConfirmation(product, node.selectedOptions), node.id !== '0');
        assert.equal(isUnstitchedDeliverySelection(product, node.selectedOptions), node.id === '0');
      }
    }
  }
});

test('32–42 offers resolve every sparse transition at its unchanged native price', () => {
  const product = nativeStitchingProduct('Fabric Only', standardSizes.slice(0, 6));
  const variants = product.variants.edges.map(({ node }) => node);
  let checked = 0;
  for (const current of variants) {
    const selected = Object.fromEntries(current.selectedOptions.map(option => [option.name, option.value]));
    for (const option of product.options) for (const value of option.values) {
      const resolved = resolveAvailableVariantForOption(variants, selected, option.name, value);
      assert.ok(variants.includes(resolved));
      const next = Object.fromEntries(resolved.selectedOptions.map(choice => [choice.name, choice.value]));
      assert.equal(next[option.name], value);
      assert.equal(resolved.price.amount, next.Stitching === 'Standard Stitched' ? '129'
        : next.Stitching === 'Custom Stitched' ? '144' : '100');
      checked++;
    }
    const html = renderDelivery({ hasStitching: false,
      isUnstitched: isUnstitchedDeliverySelection(product, current.selectedOptions),
      requiresTailoringTimingConfirmation: requiresNativeStitchingTimingConfirmation(product, current.selectedOptions),
      shipsWithinDays: 4,
    });
    assert.match(html, current.id === '0' ? /Unstitched fabric set/ : /Tailored to order/);
    assert.doesNotMatch(html, /Ready to ship|Estimated dispatch/);
  }
  assert.equal(checked, 88);
});

test('subset support rejects unsupported, duplicate and ambiguous size declarations', () => {
  for (const sizes of [[], ['30'], ['48'], ['M'], ['32', '32'], ['32', 'Custom Fit'], ['32', 'Not Applicable']]) {
    assert.equal(hasNativeFullStitchingOptions(nativeStitchingProduct('Fabric Only', sizes)), false, sizes.join(','));
  }
  for (const edit of [
    product => product.options[1].values.push('48'),
    product => product.options[1].values.pop(),
    product => product.options[0].values.push('Ready-made'),
    product => product.variants.edges.pop(),
    product => product.variants.edges.push(product.variants.edges[1]),
    product => { product.variants.edges[0].node.selectedOptions[1].value = '32'; },
    product => { product.variants.edges[1].node.selectedOptions[1].value = '44'; },
  ]) {
    const product = nativeStitchingProduct('Fabric Only', standardSizes.slice(0, 6));
    edit(product);
    assert.equal(hasNativeFullStitchingOptions(product), false);
  }
});

test('32–42 color matrices remain complete even when a size is sold out', () => {
  const product = nativeStitchingProduct('Fabric Only', standardSizes.slice(0, 6));
  const base = product.variants.edges;
  product.options.push({ name: 'Color', values: ['Blue', 'Red'] });
  product.variants.edges = ['Blue', 'Red'].flatMap(color => base.map(({ node }) => ({
    node: { ...node, availableForSale: false,
      selectedOptions: [...node.selectedOptions, { name: 'Color', value: color }] },
  })));
  assert.equal(hasNativeFullStitchingOptions(product), true);
  product.variants.edges.pop();
  assert.equal(hasNativeFullStitchingOptions(product), false);
});

const nativeAlterationProduct = () => ({
  title: 'Art Silk Embroidered Suit Set', productType: 'Suit Set',
  description: 'Choose Made to Fit for measurement-based tailoring.',
  options: [{ name: 'Size', values: ['32', '38'] },
    { name: 'Alteration', values: ['Standard Fit', 'Made to Fit (+$10)'] }],
  variants: { edges: ['32', '38'].flatMap(size => ['Standard Fit', 'Made to Fit (+$10)'].map(fit => ({
    node: { availableForSale: true, selectedOptions: [
      { name: 'Size', value: size }, { name: 'Alteration', value: fit },
    ] },
  }))) },
});

test('native alteration replaces duplicate generic billing for both fit selections', () => {
  const product = nativeAlterationProduct();
  assert.equal(hasNativeAlterationOptions(product), true);
  assert.deepEqual(getEligibleServiceAddOns(product), []);
  assert.deepEqual(selectedEligibleServiceAddOns(product, ['garment-alteration'], ['garment-alteration']), []);
  for (const { node } of product.variants.edges) {
    assert.equal(requiresNativeStitchingTimingConfirmation(product, node.selectedOptions),
      node.selectedOptions[1].value.startsWith('Made to Fit'));
  }
  assert.equal(requiresNativeStitchingTimingConfirmation(product, []), false);
  product.variants.edges.forEach(({ node }) => { node.availableForSale = false; });
  assert.equal(hasNativeAlterationOptions(product), true);
});

test('native alteration detection preserves unrelated and incomplete service contracts', () => {
  const product = nativeAlterationProduct();
  product.variants.edges.pop();
  assert.equal(hasNativeAlterationOptions(product), false);
  assert.deepEqual(getEligibleServiceAddOns(product), ['garment-alteration']);
  const unrelated = nativeAlterationProduct();
  unrelated.options[1].name = 'Fit';
  assert.equal(hasNativeAlterationOptions(unrelated), false);
  const noVariants = nativeAlterationProduct();
  noVariants.variants.edges = [];
  assert.equal(hasNativeAlterationOptions(noVariants), false);
  const otherScope = nativeAlterationProduct();
  otherScope.options[1].values = ['Standard Fit', 'Sleeve shortening'];
  assert.equal(hasNativeAlterationOptions(otherScope), false);
});

test('Made to Fit delivery renders tailoring timing while Standard Fit stays ready-stock', () => {
  const product = nativeAlterationProduct();
  for (const { node } of product.variants.edges) {
    const tailored = node.selectedOptions[1].value.startsWith('Made to Fit');
    const html = renderDelivery({ hasStitching: false,
      requiresTailoringTimingConfirmation: requiresNativeStitchingTimingConfirmation(product, node.selectedOptions),
    });
    if (tailored) {
      assert.match(html, /Tailored to order/);
      assert.ok(html.includes(NATIVE_STITCHING_TIMING_NOTICE));
      assert.doesNotMatch(html, /Ready to ship|3–4 business days/);
    } else {
      assert.match(html, /Ready to ship/);
      assert.match(html, /3–4 business days/);
    }
  }
});

test('stitched-blouse saree retains alteration instead of fabric stitching at the same $10', () => {
  const sage = {
    title: 'Sage Green Ready to Wear Jacquard Silk Saree', productType: 'Saree',
    description: 'Ready-to-wear saree with stitched blouse with built-in cups.',
    options: [{ name: 'Size', values: ['34', '36', '38', '40', '42', '44'] }],
  };
  assert.deepEqual(getEligibleServiceAddOns(sage), ['garment-alteration', 'pico-fall', 'matching-petticoat']);
  assert.equal(serviceAddOnTotal(['garment-alteration']), 10);
  assert.deepEqual(selectedEligibleServiceAddOns(sage, ['blouse-stitching', 'garment-alteration', 'garment-alteration'], ['blouse-stitching', 'garment-alteration']), ['garment-alteration']);
});

test('unspecified blouse construction retains existing services rather than assuming an alteration', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Silk Saree', productType: 'Saree', description: 'Saree with blouse.',
  }), ['blouse-stitching', 'pico-fall', 'matching-petticoat']);
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Silk Saree', productType: 'Saree', description: 'One saree.',
  }), ['pico-fall', 'matching-petticoat']);
});

test('fabric and unstitched blouse evidence retain stitching while construction wins over material', () => {
  for (const description of ['Includes blouse fabric.', 'Unstitched blouse piece included.', 'Saree with blouse material.']) {
    assert.deepEqual(getEligibleServiceAddOns({ title: 'Silk Saree', productType: 'Saree', description }), ['blouse-stitching', 'pico-fall', 'matching-petticoat'], description);
  }
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Silk Saree', productType: 'Saree', description: 'Stitched blouse included. Blouse fabric: silk.',
    metadata: { blouseFabric: 'Silk' },
  }), ['garment-alteration', 'pico-fall', 'matching-petticoat']);
});

test('stitched blouse tags and reverse wording work without duplicating native paid service options', () => {
  for (const evidence of [
    { tags: ['construction:Saree with stitched blouse'] },
    { description: 'Blouse is fully stitched.' },
    { description: 'Ready-made blouse included.' },
  ]) {
    const product = { title: 'Silk Saree', productType: 'Saree', description: '', ...evidence };
    assert.deepEqual(getEligibleServiceAddOns(product), ['garment-alteration', 'pico-fall', 'matching-petticoat']);
    assert.deepEqual(getEligibleServiceAddOns({ ...product, options: [{ name: 'Alteration', values: ['Standard', 'Made to Fit'] }] }), ['pico-fall', 'matching-petticoat']);
  }
});

test('unstitched fabric listing does not become alteration because a model shows a stitched blouse', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Woven Saree with Embroidered Blouse Fabric', productType: 'Saree',
    description: 'One saree and one unstitched blouse fabric piece. The stitched blouse shown on the model demonstrates styling and is not included as a finished garment.',
  }), ['blouse-stitching', 'pico-fall', 'matching-petticoat']);
});
