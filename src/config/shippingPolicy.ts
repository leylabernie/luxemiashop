export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'] as const;

export const US_STANDARD_SHIPPING_RATE = 14.99;
export const US_FREE_SHIPPING_THRESHOLD = 199;

export interface ShippingZonePolicy {
  id: string;
  name: string;
  countries: readonly string[];
  standardRate: number;
  freeShippingThreshold: number | null;
  duties: string;
}

export const SHIPPING_ZONES: readonly ShippingZonePolicy[] = [
  {
    id: 'us',
    name: 'United States',
    countries: ['US'],
    standardRate: 14.99,
    freeShippingThreshold: 199,
    duties: 'Taxes, if applicable, are calculated at checkout.',
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
  'Tracked shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199+. Canada and the UK are $24.99 below $299 and free at $299+. Australia and New Zealand are $29.99 below $349 and free at $349+. South Africa is $49.99 and Mauritius is $59.99 per order.';

export const SHIPPING_TIMING_NOTICE =
  'Processing time and carrier transit are separate. Review the product page for its published processing or ship-by estimate. Transit begins only after dispatch.';

export const SHIPPING_CONSOLIDATION_NOTICE =
  'Multi-item orders are normally consolidated into one shipment after every item is ready. Contact LuxeMia before ordering for a separately quoted split shipment or express option.';
