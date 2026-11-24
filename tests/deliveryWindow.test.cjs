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
  const {
    usDeliveryWindowNotice,
    US_STANDARD_TRANSIT_MIN_DAYS,
    US_STANDARD_TRANSIT_MAX_DAYS,
    READY_TO_SHIP_TOTAL_MIN_DAYS,
    READY_TO_SHIP_TOTAL_MAX_DAYS,
    CUSTOM_TAILORED_TOTAL_MIN_DAYS,
    CUSTOM_TAILORED_TOTAL_MAX_DAYS,
  } = await import(path.join(root, 'src/config/shippingPolicy.ts'));

  assert.equal(US_STANDARD_TRANSIT_MIN_DAYS, 4);
  assert.equal(US_STANDARD_TRANSIT_MAX_DAYS, 5);
  assert.equal(READY_TO_SHIP_TOTAL_MIN_DAYS, 5);
  assert.equal(READY_TO_SHIP_TOTAL_MAX_DAYS, 7);
  assert.equal(CUSTOM_TAILORED_TOTAL_MIN_DAYS, 15);
  assert.equal(CUSTOM_TAILORED_TOTAL_MAX_DAYS, 18);

  // Listing with a dispatch estimate: 3 business days dispatch + 4–5 transit via DHL/FedEx.
  const notice3 = usDeliveryWindowNotice({ shipsWithinDays: 3 });
  assert.match(notice3, /Estimated dispatch in 3 business days/);
  assert.match(notice3, /DHL\/FedEx/);
  assert.match(notice3, /7–8 business days total/);
  assert.match(notice3, /Dates are estimates, not guaranteed/);

  // Listing with a 4-day dispatch estimate yields 8–9 business days total.
  const notice4 = usDeliveryWindowNotice({ shipsWithinDays: 4 });
  assert.match(notice4, /8–9 business days total/);

  // Custom Tailored / alterations use the 15–18 business day window (or explicit override).
  const withAlterations = usDeliveryWindowNotice({ shipsWithinDays: null, hasAlterations: true });
  assert.match(withAlterations, /Custom Tailored \/ Alterations/);
  assert.match(withAlterations, /15–18 business days total/);

  // No listing dispatch estimate falls back to the 5–7 business day Ready-to-Ship policy.
  const fallback = usDeliveryWindowNotice({ shipsWithinDays: null });
  assert.match(fallback, /1–2 business days/);
  assert.match(fallback, /5–7 business days/);

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
