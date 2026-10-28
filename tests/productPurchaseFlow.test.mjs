import './fabricOnlyServices.test.mjs';
import './shoppingApp.test.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import './checkoutCartIntegrity.test.mjs';

import {
  inferIncludedPiecesFromTitle,
  isVariantOptionValueAvailable,
  resolveAvailableVariantForOption,
  resolveIncludedPieces,
  selectedOptionsFromVariant,
  selectionRequiresSeparateMeasurements,
} from '../src/lib/productPurchaseFlow.ts';
import {
  getCustomerFacingProductOptionName,
  hasNativeProductSizeOption,
} from '../src/lib/productOptionNames.ts';

const variants = [
  {
    id: 's-standard',
    availableForSale: true,
    selectedOptions: [
      { name: 'Size', value: 'S' },
      { name: 'Stitching', value: 'Standard' },
    ],
  },
  {
    id: 'm-standard',
    availableForSale: true,
    selectedOptions: [
      { name: 'Size', value: 'M' },
      { name: 'Stitching', value: 'Standard' },
    ],
  },
  {
    id: 'custom-stitching',
    availableForSale: true,
    selectedOptions: [
      { name: 'Size', value: 'Custom' },
      { name: 'Stitching', value: 'Custom Stitching' },
    ],
  },
  {
    id: 'sold-out-xl',
    availableForSale: false,
    selectedOptions: [
      { name: 'Size', value: 'XL' },
      { name: 'Stitching', value: 'Standard' },
    ],
  },
];

test('selecting Custom resolves the linked Custom Stitching variant', () => {
  const resolved = resolveAvailableVariantForOption(
    variants,
    { Size: 'S', Stitching: 'Standard' },
    'Size',
    'Custom',
  );

  assert.equal(resolved?.id, 'custom-stitching');
  assert.deepEqual(selectedOptionsFromVariant(resolved), {
    Size: 'Custom',
    Stitching: 'Custom Stitching',
  });
});

test('selecting a standard size from Custom restores its valid Standard pair', () => {
  const resolved = resolveAvailableVariantForOption(
    variants,
    { Size: 'Custom', Stitching: 'Custom Stitching' },
    'Size',
    'M',
  );

  assert.equal(resolved?.id, 'm-standard');
  assert.deepEqual(selectedOptionsFromVariant(resolved), {
    Size: 'M',
    Stitching: 'Standard',
  });
});

test('sold-out option values cannot create an unavailable combination', () => {
  assert.equal(isVariantOptionValueAvailable(variants, 'Size', 'XL'), false);
  assert.equal(
    resolveAvailableVariantForOption(
      variants,
      { Size: 'M', Stitching: 'Standard' },
      'Size',
      'XL',
    ),
    null,
  );
});

test('Standard does not imply a separate tailoring measurement', () => {
  assert.equal(selectionRequiresSeparateMeasurements('Stitching', 'Standard'), false);
  assert.equal(selectionRequiresSeparateMeasurements('Stitching', 'Standard Size'), false);
  assert.equal(selectionRequiresSeparateMeasurements('Stitching', 'S'), false);
  assert.equal(selectionRequiresSeparateMeasurements('Stitching', 'XXL'), false);
  assert.equal(selectionRequiresSeparateMeasurements('Stitching', '42'), false);
  assert.equal(selectionRequiresSeparateMeasurements('Stitching', 'Semi-Stitched'), false);
  assert.equal(
    selectionRequiresSeparateMeasurements('Sizing & Stitching', 'Unstitched / Semi-Stitched Fabric'),
    false,
  );
  assert.equal(selectionRequiresSeparateMeasurements('Stitching', 'Custom Stitching'), true);
  assert.equal(
    selectionRequiresSeparateMeasurements(
      'Sizing & Stitching',
      'Custom Stitched - Standard (Up to Size 42)',
    ),
    true,
  );
});

test('named and value-inferred Shopify sizes count as native size controls', () => {
  assert.equal(hasNativeProductSizeOption([{ name: 'Size', values: ['S', 'M', 'L'] }]), true);
  assert.equal(hasNativeProductSizeOption([{ name: 'Bust Size', values: ['34', '36', '38'] }]), true);
  assert.equal(hasNativeProductSizeOption([{ name: 'Stitching', values: ['S', 'M', 'L', 'XL', 'XXL'] }]), true);
  assert.equal(hasNativeProductSizeOption([{ name: 'Option', values: ['34', '36', '38'] }]), true);
  assert.equal(hasNativeProductSizeOption([{ name: 'Color', values: ['Pink'] }]), false);
  assert.equal(hasNativeProductSizeOption([{ name: 'Color', values: ['Sage', 'Maroon'] }]), false);
  assert.equal(hasNativeProductSizeOption([{ name: 'Color', values: ['S', 'M'] }]), false);
});

test('misnamed imported size and color options receive truthful customer labels', () => {
  assert.equal(getCustomerFacingProductOptionName({
    name: 'Stitching',
    values: ['S', 'M', 'L', 'XL', 'XXL'],
  }), 'Size');
  assert.equal(getCustomerFacingProductOptionName({
    name: 'Size',
    values: ['Navy Blue'],
  }), 'Color');
  assert.equal(getCustomerFacingProductOptionName({
    name: 'Fabric',
    values: ['Silk'],
  }), 'Fabric');
});

test('included pieces prefer normalized metadata and retain exact included tags', () => {
  assert.equal(
    resolveIncludedPieces(
      ['Lehenga skirt', 'Blouse', 'Dupatta'],
      ['Included: generic set'],
      'Pink Bridal Lehenga',
    ),
    'Lehenga skirt, Blouse, Dupatta',
  );
  assert.equal(
    resolveIncludedPieces(
      null,
      ['Included: Blouse / lehenga skirt / matching dupatta'],
      'Pink Bridal Lehenga',
    ),
    'Blouse / lehenga skirt / matching dupatta',
  );
  assert.equal(resolveIncludedPieces(null, [], 'Pink Bridal Lehenga'), undefined);
});


test('title-backed included pieces require explicit garment evidence', () => {
  assert.equal(
    inferIncludedPiecesFromTitle(
      'Cream Chinnon Beaded Palazzo Suit with Butti Dupatta',
      ['three piece suit'],
    ),
    'Tunic, palazzo pants, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Embroidered Three-Piece Sharara Suit with Dupatta'),
    'Tunic, sharara pants, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Silk Three Piece Gharara Suit with Matching Dupatta'),
    'Tunic, gharara pants, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Cotton Salwar Kameez with Printed Dupatta'),
    'Kameez, salwar pants, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Pink Net Lehenga Choli with Dupatta'),
    'Lehenga, choli, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Banarasi Saree with Unstitched Blouse Piece'),
    'Saree and blouse fabric',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Ivory Groom Sherwani with Embroidered Stole'),
    'Sherwani and stole',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Kurta Pajama with Nehru Vest'),
    'Kurta, pajama pants, and vest',
  );
});

test('title inference remains conservative for ambiguous listings', () => {
  assert.equal(inferIncludedPiecesFromTitle('Pink Bridal Lehenga'), undefined);
  assert.equal(inferIncludedPiecesFromTitle('Blue Palazzo Suit with Dupatta'), undefined);
  assert.equal(inferIncludedPiecesFromTitle('Silk Saree with Dupatta'), undefined);
  assert.equal(inferIncludedPiecesFromTitle('Groom Sherwani'), undefined);
});

test('normalized metadata and exact included tags still outrank title inference', () => {
  assert.equal(
    resolveIncludedPieces(
      ['Custom top', 'Custom trousers', 'Custom dupatta'],
      ['three piece suit'],
      'Cream Palazzo Suit with Dupatta',
    ),
    'Custom top, Custom trousers, Custom dupatta',
  );
  assert.equal(
    resolveIncludedPieces(
      null,
      ['Included: Kurta, churidar, and stole', 'three piece suit'],
      'Groom Sherwani with Stole',
    ),
    'Kurta, churidar, and stole',
  );
});


test('explicit set contents are shown without leaking the next listing field', () => {
  const description = 'Fabric: Georgette Set Includes: Embroidered top, gharara bottom and coordinating dupatta Occasion: Weddings, festive evenings.';
  assert.equal(resolveIncludedPieces(undefined, [], 'Royal Purple Gharara Set', description),
    'Embroidered top, gharara bottom and coordinating dupatta');
  assert.equal(resolveIncludedPieces(undefined, [], 'Silk Saree', 'Package Includes: blouse stitching service for $10.'), undefined);
});

// Live listing excerpts verified 2026-10-28; no dimensions or components inferred.
const greenAnarkaliContents = '<p>Green Anarkali suit set: green Chinon embroidered Anarkali top, matching palazzo, pink Chinon dupatta with green border. 3 pieces. Stitched. </p><h3>Size and Fit</h3><p>Available sizes: S, M, L, XL, XXL, XS. Select your size from the product options.</p>';
const tealAnarkaliContents = '<p>Teal green Chinon embroidered Anarkali gown set with palazzo and dupatta. 3 pieces. Ready-to-wear. Dry clean only.</p><h3>Size and Fit</h3><p>Available sizes: S, M, L, XL, XXL, XXXL. Select your preferred size from the options.</p>';

test('explicit three-piece Anarkali description enumerations expose only named garments', () => {
  assert.equal(resolveIncludedPieces(null, [], 'Green Embroidered Anarkali Suit, Chinon Fabric, Pink Dupatta', greenAnarkaliContents),
    'green Chinon embroidered Anarkali top, matching palazzo, pink Chinon dupatta with green border');
  assert.equal(resolveIncludedPieces(null, [], 'Teal Green Chinon Anarkali Gown Set', tealAnarkaliContents),
    'Anarkali gown, palazzo, and dupatta');
});

test('normalized metadata and included tags outrank explicit Anarkali prose', () => {
  assert.equal(resolveIncludedPieces(['Verified top', 'Verified dupatta'], ['Included: tagged components'], '', greenAnarkaliContents), 'Verified top, Verified dupatta');
  assert.equal(resolveIncludedPieces(null, ['Included: verified components'], '', tealAnarkaliContents), 'verified components');
});

test('ambiguous counts and available-with styling never invent set contents', () => {
  const descriptions = [
    '<p>Dusty pink Chinon embroidered Anarkali suit set with green dupatta. 3 pieces. Stitched. </p>',
    '<p>Green Digital Printed Chinon Anarkali Suit Set. Wear it for Mehendi and Festive Celebrations.</p><h3>Design and Outfit Details</h3><ul><li>Round neckline and full sleeves; palazzo pants in matching green</li></ul><h3>Set Components</h3><ul><li>Available with a matching green chinon dupatta with printed border</li></ul>',
    '<p>Mint Green Chikankari Embroidered Georgette Anarkali. Wear it for Mehendi and Festive Celebrations.</p><h3>Set Components</h3><ul><li>Available with a matching mint green net dupatta</li></ul>',
    'Teal Anarkali gown set available with palazzo and dupatta. 3 pieces.',
    'Teal Anarkali gown set with palazzo and dupatta.',
    'Teal Anarkali gown set with palazzo and dupatta. 3 pieces. Palazzo sold separately.',
    'Teal Anarkali gown set with palazzo and dupatta. 3 pieces. Palazzo pants sold separately.',
    'Teal Anarkali gown set with palazzo and dupatta. 3 pieces. Dupatta is available separately.',
    'Teal Anarkali gown set with palazzo and dupatta. 3 pieces. This set excludes the dupatta.',
    'Green Anarkali suit set: embroidered Anarkali top, optional palazzo, pink dupatta. 3 pieces.',
  ];
  for (const description of descriptions) {
    assert.equal(resolveIncludedPieces(null, [], 'Embroidered Anarkali', description), undefined, description);
  }
});
