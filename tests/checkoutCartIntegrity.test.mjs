import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertCheckoutCartMatches,
  CheckoutCartChangedError,
  isCacheableStorefrontOperation,
} from '../src/lib/checkoutCartIntegrity.ts';

const requested = (id, quantity, attributes = []) => ({ variantId: id, quantity, customAttributes: attributes });
const returned = (id, quantity, attributes = []) => ({ merchandise: { id }, quantity, attributes });

test('blocks the observed two-unit bag reduced to one unit by Shopify', () => {
  assert.throws(() => assertCheckoutCartMatches([requested('size38', 2)], [returned('size38', 1)]), CheckoutCartChangedError);
});

test('allows two distinct available sizes and merged identical lines', () => {
  assert.doesNotThrow(() => assertCheckoutCartMatches(
    [requested('size38', 1), requested('size40', 1)],
    [returned('size40', 1), returned('size38', 1)],
  ));
  assert.doesNotThrow(() => assertCheckoutCartMatches(
    [requested('size38', 1), requested('size38', 1)], [returned('size38', 2)],
  ));
});

test('blocks omitted, substituted, and unexpectedly added lines', () => {
  for (const lines of [[], [returned('other', 1)], [returned('size38', 1), returned('extra', 1)]]) {
    assert.throws(() => assertCheckoutCartMatches([requested('size38', 1)], lines), CheckoutCartChangedError);
  }
});

test('preserves distinct fit requests and ignores attribute ordering', () => {
  const a = [{ key: 'Fit request', value: 'Shorten' }, { key: 'Style', value: 'A' }];
  const b = [{ key: 'Fit request', value: 'Lengthen' }];
  assert.doesNotThrow(() => assertCheckoutCartMatches(
    [requested('size38', 1, a), requested('size38', 1, b)],
    [returned('size38', 1, b), returned('size38', 1, [...a].reverse())],
  ));
  assert.throws(() => assertCheckoutCartMatches(
    [requested('size38', 1, a), requested('size38', 1, b)], [returned('size38', 2, a)],
  ), CheckoutCartChangedError);
});

test('does not hand off a partially inspected Shopify cart', () => {
  assert.throws(() => assertCheckoutCartMatches([requested('size38', 1)], [returned('size38', 1)], true), CheckoutCartChangedError);
});

test('named and anonymous mutations never use the read cache', () => {
  assert.equal(isCacheableStorefrontOperation('mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id } } }'), false);
  assert.equal(isCacheableStorefrontOperation('mutation { cartCreate(input: {}) { cart { id } } }'), false);
  assert.equal(isCacheableStorefrontOperation('query Product($id: ID!) { node(id: $id) { id } }'), true);
  assert.equal(isCacheableStorefrontOperation('  { shop { name } }'), true);
});
