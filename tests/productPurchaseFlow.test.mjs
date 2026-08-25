import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isVariantOptionValueAvailable,
  resolveAvailableVariantForOption,
  resolveIncludedPieces,
  selectedOptionsFromVariant,
  selectionRequiresSeparateMeasurements,
} from '../src/lib/productPurchaseFlow.ts';
import { hasNativeProductSizeOption } from '../src/lib/productOptionNames.ts';

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
