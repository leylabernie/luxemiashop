export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'] as const;

export const US_STANDARD_SHIPPING_RATE = 14.99;
export const US_FREE_SHIPPING_THRESHOLD = 150;

// Source-of-truth U.S. standard shipping timelines (orders ship from India):
// ready stock dispatches within 3–4 business days; standard transit is
// approximately 9–14 business days after dispatch (12–18 business days
// total). Requested alterations or finishing add 3 business days once,
// after complete measurements and service details are confirmed.
export const US_READY_STOCK_DISPATCH_MIN_DAYS = 3;
export const US_READY_STOCK_DISPATCH_MAX_DAYS = 4;
export const US_STANDARD_TRANSIT_MIN_DAYS = 9;
export const US_STANDARD_TRANSIT_MAX_DAYS = 14;
export const US_STANDARD_DELIVERY_MIN_TOTAL_DAYS = 12;
export const US_STANDARD_DELIVERY_MAX_TOTAL_DAYS = 18;
export const ALTERATION_ADD_BUSINESS_DAYS = 3;

export interface UsDeliveryWindowOptions {
  shipsWithinDays: number | null | undefined;
  hasAlterations?: boolean;
  isMadeToOrder?: boolean;
  confirmAvailability?: boolean;
}

/** Concise, policy-compliant U.S. dispatch + standard delivery window copy. */
export function usDeliveryWindowNotice({
  shipsWithinDays,
  hasAlterations = false,
  isMadeToOrder = false,
  confirmAvailability = false,
}: UsDeliveryWindowOptions): string {
  if (isMadeToOrder || confirmAvailability) {
    return 'Confirm size and availability before ordering — estimated U.S. delivery 12–18 business days after dispatch.';
  }
  const dispatchExtra = hasAlterations ? ALTERATION_ADD_BUSINESS_DAYS : 0;
  const dispatchSuffix = hasAlterations ? ' (+3 business days once for alterations)' : '';
  if (shipsWithinDays) {
    const dispatchEstimate = shipsWithinDays + dispatchExtra;
    const totalMin = dispatchEstimate + US_STANDARD_TRANSIT_MIN_DAYS;
    const totalMax = dispatchEstimate + US_STANDARD_TRANSIT_MAX_DAYS;
    return `Estimated dispatch in ${dispatchEstimate} business day${dispatchEstimate === 1 ? '' : 's'}${dispatchSuffix} · U.S. standard delivery ${US_STANDARD_TRANSIT_MIN_DAYS}–${US_STANDARD_TRANSIT_MAX_DAYS} business days after dispatch (${totalMin}–${totalMax} total). Dates are estimates, not guaranteed.`;
  }
  return `Estimated dispatch within ${US_READY_STOCK_DISPATCH_MIN_DAYS}–${US_READY_STOCK_DISPATCH_MAX_DAYS} business days${dispatchSuffix} · U.S. standard delivery ${US_STANDARD_TRANSIT_MIN_DAYS}–${US_STANDARD_TRANSIT_MAX_DAYS} business days after dispatch (${US_STANDARD_DELIVERY_MIN_TOTAL_DAYS}–${US_STANDARD_DELIVERY_MAX_TOTAL_DAYS} business days total${dispatchSuffix}). Dates are estimates, not guaranteed.`;
}

export interface ShippingZonePolicy {
  id: string;
  name: string;
  countries: readonly string[];
  standardRate: number;
  freeShippingThreshold: number | null;
  duties: string;
}

// Owner-confirmed US customer-facing import policy.
export const US_IMPORT_COVERAGE_NOTICE = 'For US deliveries, no tariffs or import fees are collected at your doorstep. Applicable sales tax is calculated at checkout.';
export const NON_US_IMPORT_NOTICE = 'Outside the United States, the customer is responsible for duties, import taxes, brokerage and carrier fees unless checkout explicitly states that they are included.';
export const DESTINATION_IMPORT_NOTICE = `${US_IMPORT_COVERAGE_NOTICE} ${NON_US_IMPORT_NOTICE}`;

export const SHIPPING_ZONES: readonly ShippingZonePolicy[] = [
  {
    id: 'us',
    name: 'United States',
    countries: ['US'],
    standardRate: 14.99,
    freeShippingThreshold: 150,
    duties: US_IMPORT_COVERAGE_NOTICE,
  },
  {
    id: 'canada-uk',
    name: 'Canada & United Kingdom',
    countries: ['CA', 'GB'],
    standardRate: 24.99,
    freeShippingThreshold: 299,
    duties: 'Duties, import taxes, brokerage and carrier fees may apply unless checkout states otherwise.',
  },
  {
    id: 'australia-new-zealand',
    name: 'Australia & New Zealand',
    countries: ['AU', 'NZ'],
    standardRate: 29.99,
    freeShippingThreshold: 349,
    duties: 'Duties, import taxes, brokerage and carrier fees may apply unless checkout states otherwise.',
  },
  {
    id: 'south-africa',
    name: 'South Africa',
    countries: ['ZA'],
    standardRate: 49.99,
    freeShippingThreshold: null,
    duties: 'Duties, import taxes, brokerage and carrier fees may apply unless checkout states otherwise.',
  },
  {
    id: 'mauritius',
    name: 'Mauritius',
    countries: ['MU'],
    standardRate: 59.99,
    freeShippingThreshold: null,
    duties: 'Duties, import taxes, brokerage and carrier fees may apply unless checkout states otherwise.',
  },
] as const;

export const SHIPPING_DESTINATION_NAMES =
  'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';

export const SHIPPING_POLICY_SUMMARY =
  'Tracked shipping is available to seven countries. U.S. standard shipping is $14.99 below $150 and free at $150+. Canada and the UK are $24.99 below $299 and free at $299+. Australia and New Zealand are $29.99 below $349 and free at $349+. South Africa is $49.99 and Mauritius is $59.99 per order.';

export const SHIPPING_ORIGIN_NOTICE = 'Orders ship from India.';

export const SHIPPING_PROCESSING_NOTICE =
  'Each listing states the construction actually supplied — fully stitched, semi-stitched, or unstitched fabric, including unstitched lehenga, blouse or dupatta pieces. Where a listing is fully unstitched, garment assembly and any tailoring are not included; request a quote and allow processing time. The individual listing is the source of truth for construction and included pieces. Without alterations, estimated dispatch is within 3–4 business days. Requested alterations or finishing add 3 business days once, after complete measurements and service details are confirmed.';

export { alterationShippingTimingNotice, BASE_SHIPPING_TIMING_NOTICE, ALTERATION_TIMING_NOTICE, SHIPPING_TIMING_NOTICE, productShippingTimingNotice } from './shippingTiming.cjs';

export const SHIPPING_CONSOLIDATION_NOTICE =
  'Multi-item orders are normally consolidated into one shipment after every item is ready. Contact LuxeMia before ordering for a separately quoted split shipment or express option.';
