import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isProductExplicitlyOrderable,
  isVariantExplicitlyOrderable,
} from '../src/lib/orderability.ts';

const product = (productAvailability, variants) => ({
  availableForSale: productAvailability,
  variants: {
    edges: variants.map(([id, availableForSale]) => ({
      node: { id, availableForSale },
    })),
  },
});

test('product orderability requires positive product and variant evidence', () => {
  assert.equal(isProductExplicitlyOrderable(product(true, [['available', true]])), true);
  assert.equal(isProductExplicitlyOrderable(product(false, [['available', true]])), false);
  assert.equal(isProductExplicitlyOrderable(product(undefined, [['available', true]])), false);
  assert.equal(isProductExplicitlyOrderable(product(true, [['sold-out', false]])), false);
  assert.equal(isProductExplicitlyOrderable(product(true, [['unknown', undefined]])), false);
  assert.equal(isProductExplicitlyOrderable(product(true, [])), false);
  assert.equal(isProductExplicitlyOrderable(undefined), false);
});

test('selected-variant orderability requires the exact variant to be explicitly available', () => {
  const currentProduct = product(true, [
    ['available', true],
    ['sold-out', false],
    ['unknown', undefined],
  ]);

  assert.equal(isVariantExplicitlyOrderable(currentProduct, 'available'), true);
  assert.equal(isVariantExplicitlyOrderable(currentProduct, 'sold-out'), false);
  assert.equal(isVariantExplicitlyOrderable(currentProduct, 'unknown'), false);
  assert.equal(isVariantExplicitlyOrderable(currentProduct, 'missing'), false);
  assert.equal(isVariantExplicitlyOrderable(currentProduct, undefined), false);
  assert.equal(
    isVariantExplicitlyOrderable(product(undefined, [['available', true]]), 'available'),
    false,
  );
});
