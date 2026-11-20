const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('shipping source of truth: seven countries and U.S. $14.99 below $150 / free at $150+', async () => {
  const { SHIPPING_COUNTRIES, US_STANDARD_SHIPPING_RATE, US_FREE_SHIPPING_THRESHOLD } =
    await import(path.join(root, 'src/config/shippingPolicy.ts'));

  assert.deepEqual(SHIPPING_COUNTRIES, ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU']);
  assert.equal(US_STANDARD_SHIPPING_RATE, 14.99);
  assert.equal(US_FREE_SHIPPING_THRESHOLD, 150);
});

test('U.S. delivery window notice is policy-compliant', async () => {
  const { usDeliveryWindowNotice, US_STANDARD_TRANSIT_MIN_DAYS, US_STANDARD_TRANSIT_MAX_DAYS } =
    await import(path.join(root, 'src/config/shippingPolicy.ts'));

  assert.equal(US_STANDARD_TRANSIT_MIN_DAYS, 9);
  assert.equal(US_STANDARD_TRANSIT_MAX_DAYS, 14);

  // Listing with a dispatch estimate: 3 business days dispatch + 9–14 transit.
  const notice3 = usDeliveryWindowNotice({ shipsWithinDays: 3 });
  assert.match(notice3, /Estimated dispatch in 3 business days/);
  assert.match(notice3, /9–14 business days after dispatch/);
  assert.match(notice3, /\(12–17 total/);
  assert.match(notice3, /Dates are estimates, not guaranteed/);

  // Listing with a 4-day dispatch estimate tops out at 18 total.
  const notice4 = usDeliveryWindowNotice({ shipsWithinDays: 4 });
  assert.match(notice4, /13–18 total/);

  // Alterations / stitching add 3 business days once to dispatch and total.
  const withAlterations = usDeliveryWindowNotice({ shipsWithinDays: 3, hasAlterations: true });
  assert.match(withAlterations, /Estimated dispatch in 6 business days/);
  assert.match(withAlterations, /\+3 business days once for alterations/);
  assert.match(withAlterations, /15–20 total/);

  // No listing dispatch estimate falls back to the 3–4 / 9–14 / 12–18 policy.
  const fallback = usDeliveryWindowNotice({ shipsWithinDays: null });
  assert.match(fallback, /3–4 business days/);
  assert.match(fallback, /9–14 business days after dispatch/);
  assert.match(fallback, /12–18 business days total/);

  // Made-to-order / confirm-availability listings ask the shopper to confirm first.
  assert.match(usDeliveryWindowNotice({ shipsWithinDays: 3, isMadeToOrder: true }), /Confirm size and availability before ordering/);
  assert.match(usDeliveryWindowNotice({ shipsWithinDays: 3, confirmAvailability: true }), /Confirm size and availability before ordering/);
});

test('shipBy estimated U.S. delivery range computes dispatch plus transit', async () => {
  const { getEstimatedUsDeliveryRange } = await import(path.join(root, 'src/lib/shipBy.ts'));

  assert.equal(getEstimatedUsDeliveryRange(null), null);

  const range = getEstimatedUsDeliveryRange(3);
  assert.ok(range.dispatchBy);
  assert.ok(range.deliveryFrom);
  assert.ok(range.deliveryTo);
  // Transit window is 9–14 business days after dispatch; business-day aware
  // dates differ but stay within a month.
  assert.notEqual(range.deliveryFrom, range.deliveryTo);
  assert.notEqual(range.deliveryTo, range.dispatchBy);
});
