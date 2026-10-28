import { ALTERATION_TIMING_NOTICE, alterationShippingTimingNotice } from '../config/shippingPolicy';

interface FulfillmentAttribute {
  key: string;
  value: string;
}

// Only migrate exact automatic storefront copy. Do not trim, reorder, or infer
// from free-text requests: color, measurements and service linkage are identity.
const LEGACY_FULFILLMENT_COPY = [
  { key: 'Tailoring', value: 'Tailored to order', replacement: { key: 'Tailoring', value: 'Alterations / finishing requested' } },
  { key: 'Made to Order', value: 'Yes — confirmation required', replacement: { key: 'Fit Request', value: 'Confirmation required' } },
  { key: 'Custom Size', value: 'Measurements must be confirmed before production', replacement: { key: 'Custom Size', value: 'Measurements must be confirmed before alterations' } },
  { key: 'Timing Confirmation', value: 'Tailoring required; dispatch timing confirmed after measurements.', replacement: { key: 'Timing Confirmation', value: ALTERATION_TIMING_NOTICE } },
  { key: 'Timing Estimate', value: 'Approximately 4–5 weeks total; production and transit confirmed separately', replacement: { key: 'Timing Estimate', value: ALTERATION_TIMING_NOTICE } },
  { key: 'Timing Estimate', value: 'Approximately 4–5 weeks total for the custom selection; production and transit confirmed separately', replacement: { key: 'Timing Estimate', value: ALTERATION_TIMING_NOTICE } },
] as const;

export function normalizeFulfillmentAttributes<T extends FulfillmentAttribute>(attributes?: readonly T[], shipsWithinDays?: number | null): T[] | undefined {
  return attributes?.map(attribute => {
    const legacy = LEGACY_FULFILLMENT_COPY.find(candidate => (
      candidate.key === attribute.key && candidate.value === attribute.value
    ));
    if (!legacy) return attribute;
    const replacement = legacy.replacement;
    return { ...attribute, ...replacement, ...(replacement.value === ALTERATION_TIMING_NOTICE
      ? { value: alterationShippingTimingNotice(shipsWithinDays) } : {}) };
  });
}
