import {
  DEFAULT_READY_DISPATCH_MIN_DAYS,
  DEFAULT_READY_DISPATCH_MAX_DAYS,
  ALTERATION_EXTRA_BUSINESS_DAYS,
  STANDARD_TRANSIT_MIN_DAYS,
  STANDARD_TRANSIT_MAX_DAYS,
  READY_TO_SHIP_TOTAL_MIN_DAYS,
  READY_TO_SHIP_TOTAL_MAX_DAYS,
  CUSTOM_TAILORED_TOTAL_MIN_DAYS,
  CUSTOM_TAILORED_TOTAL_MAX_DAYS,
  BASE_SHIPPING_TIMING_NOTICE,
  ALTERATION_TIMING_NOTICE,
  SHIPPING_TIMING_NOTICE,
  SHIPPING_PROCESSING_NOTICE,
  getDispatchBusinessDayRange,
  getEstimatedTotalDeliveryBusinessDayRange,
  formatBusinessDayRange,
  addBusinessDays,
  formatCalendarBusinessDayRange,
  productShippingTimingNotice,
  alterationShippingTimingNotice,
} from './shippingTiming.cjs';

export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'] as const;

export const US_STANDARD_SHIPPING_RATE = 14.99;
export const US_FREE_SHIPPING_THRESHOLD = 150;

// Updated source-of-truth delivery timelines:
// - Ready-to-Ship: 5–7 business days to US/UK/CA via DHL/FedEx (1–2 business days dispatch + 4–5 business days transit)
// - Custom Tailored / Alterations: 15–18 business days total
export const US_READY_STOCK_DISPATCH_MIN_DAYS = DEFAULT_READY_DISPATCH_MIN_DAYS;
export const US_READY_STOCK_DISPATCH_MAX_DAYS = DEFAULT_READY_DISPATCH_MAX_DAYS;
export const US_STANDARD_TRANSIT_MIN_DAYS = STANDARD_TRANSIT_MIN_DAYS;
export const US_STANDARD_TRANSIT_MAX_DAYS = STANDARD_TRANSIT_MAX_DAYS;
export const US_STANDARD_DELIVERY_MIN_TOTAL_DAYS = READY_TO_SHIP_TOTAL_MIN_DAYS;
export const US_STANDARD_DELIVERY_MAX_TOTAL_DAYS = READY_TO_SHIP_TOTAL_MAX_DAYS;
export const ALTERATION_ADD_BUSINESS_DAYS = 3;

export {
  DEFAULT_READY_DISPATCH_MIN_DAYS,
  DEFAULT_READY_DISPATCH_MAX_DAYS,
  ALTERATION_EXTRA_BUSINESS_DAYS,
  STANDARD_TRANSIT_MIN_DAYS,
  STANDARD_TRANSIT_MAX_DAYS,
  READY_TO_SHIP_TOTAL_MIN_DAYS,
  READY_TO_SHIP_TOTAL_MAX_DAYS,
  CUSTOM_TAILORED_TOTAL_MIN_DAYS,
  CUSTOM_TAILORED_TOTAL_MAX_DAYS,
  BASE_SHIPPING_TIMING_NOTICE,
  ALTERATION_TIMING_NOTICE,
  SHIPPING_TIMING_NOTICE,
  SHIPPING_PROCESSING_NOTICE,
  getDispatchBusinessDayRange,
  getEstimatedTotalDeliveryBusinessDayRange,
  formatBusinessDayRange,
  addBusinessDays,
  formatCalendarBusinessDayRange,
  productShippingTimingNotice,
  alterationShippingTimingNotice,
};

export interface DeliveryWindowTier {
  id: string;
  category: string;
  processingWindow: string;
  transitWindow: string;
  totalWindow: string;
  notes: string;
}

export const DELIVERY_WINDOW_TIERS: DeliveryWindowTier[] = [
  {
    id: 'ready-to-ship',
    category: 'Ready-to-Ship (Stocked standard sizes & unstitched sets)',
    processingWindow: '1–2 business days (3-Point QA & dispatch)',
    transitWindow: '4–5 business days via DHL / FedEx (US, UK & CA)',
    totalWindow: '5–7 business days',
    notes: 'Applies to stocked Ready-to-Ship selections without custom stitching or alterations.',
  },
  {
    id: 'custom-tailored',
    category: 'Custom Tailored (Custom blouse/suit stitching & alterations)',
    processingWindow: '10–12 business days (tailoring + 3-Point QA)',
    transitWindow: '4–6 business days via DHL / FedEx',
    totalWindow: '15–18 business days total',
    notes: 'Counted once per outfit after complete measurements and service details are confirmed.',
  },
];

export interface UsDeliveryWindowOptions {
  shipsWithinDays?: number | null;
  hasAlterations?: boolean;
  isMadeToOrder?: boolean;
  confirmAvailability?: boolean;
}

/** Concise, policy-compliant U.S. dispatch + delivery window copy. */
export function usDeliveryWindowNotice({
  shipsWithinDays,
  hasAlterations = false,
  isMadeToOrder = false,
  confirmAvailability = false,
}: UsDeliveryWindowOptions = {}): string {
  const isTailored = Boolean(hasAlterations || isMadeToOrder);
  const total = getEstimatedTotalDeliveryBusinessDayRange({
    shipsWithinDays,
    hasAlterations: isTailored,
  });
  const totalLabel = formatBusinessDayRange(total.min, total.max);

  if (confirmAvailability || isMadeToOrder) {
    return `Confirm size and availability before ordering — estimated US/UK/CA delivery ${totalLabel} total via DHL/FedEx. Dates are estimates, not guaranteed.`;
  }
  if (hasAlterations) {
    return `Custom Tailored / Alterations: ${totalLabel} total via DHL/FedEx after measurements are confirmed. Dates are estimates, not guaranteed.`;
  }
  if (Number.isFinite(shipsWithinDays) && Number(shipsWithinDays) > 0) {
    return `Estimated dispatch in ${Number(shipsWithinDays)} business days; tracked DHL/FedEx delivery (${totalLabel} total). Dates are estimates, not guaranteed.`;
  }
  return `Ready-to-Ship: dispatch in 1–2 business days and delivery in ${totalLabel} to US/UK/CA via DHL/FedEx · Free U.S. shipping $${US_FREE_SHIPPING_THRESHOLD}+. Dates are estimates, not guaranteed.`;
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

export const SUPPORTED_DESTINATION_LIST = SHIPPING_DESTINATION_NAMES;

export const SHIPPING_POLICY_SUMMARY =
  'Tracked shipping is available to seven countries via DHL/FedEx. Ready-to-Ship items arrive in 5–7 business days to US/UK/CA, and Custom Tailored outfits arrive in 15–18 business days total. U.S. standard shipping is $14.99 below $150 and free at $150+. Canada and the UK are $24.99 below $299 and free at $299+. Australia and New Zealand are $29.99 below $349 and free at $349+. South Africa is $49.99 and Mauritius is $59.99 per order.';

export const SHIPPING_ORIGIN_NOTICE = 'Orders ship from India.';

export const SHIPPING_CONSOLIDATION_NOTICE =
  'Multi-item orders are normally consolidated into one shipment after every item is ready. Contact LuxeMia before ordering for a separately quoted split shipment or express option.';

export function formatShippingThreshold(zone: ShippingZonePolicy): string {
  if (!zone.freeShippingThreshold) return 'Flat standard rate per order';
  return `Free at $${zone.freeShippingThreshold}+ USD`;
}
