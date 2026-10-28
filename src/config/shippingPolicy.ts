export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'] as const;

export const US_STANDARD_SHIPPING_RATE = 14.99;
export const US_FREE_SHIPPING_THRESHOLD = 150;

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
  'Items are supplied semi-stitched or ready stitched as described on each listing; any explicitly listed fabric-only or unstitched blouse pieces remain as described. Without alterations, estimated dispatch is within 3–4 business days. Requested alterations or finishing add 3 business days once, after complete measurements and service details are confirmed.';

export { alterationShippingTimingNotice, BASE_SHIPPING_TIMING_NOTICE, ALTERATION_TIMING_NOTICE, SHIPPING_TIMING_NOTICE, productShippingTimingNotice } from './shippingTiming.cjs';

export const SHIPPING_CONSOLIDATION_NOTICE =
  'Multi-item orders are normally consolidated into one shipment after every item is ready. Contact LuxeMia before ordering for a separately quoted split shipment or express option.';
