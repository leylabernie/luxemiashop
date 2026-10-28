import { ALTERATION_TIMING_NOTICE } from '../config/shippingTiming.cjs';

export const SERVICE_ADD_ON_PRODUCT_HANDLE = 'luxemia-tailoring-saree-finishing-add-ons';

/**
 * This record exists only to supply billable checkout lines selected on an
 * eligible garment page. It must never be treated as customer-facing catalog
 * merchandise, a search result, or a direct product page.
 */
export const isHiddenBillingProductHandle = (handle?: string | null): boolean =>
  handle === SERVICE_ADD_ON_PRODUCT_HANDLE;

export type ServiceAddOnCode =
  | 'blouse-stitching'
  | 'pico-fall'
  | 'matching-petticoat'
  | 'garment-alteration';

export interface ServiceAddOnDefinition {
  code: ServiceAddOnCode;
  label: string;
  checkoutOptionValue: string;
  price: number;
  description: string;
}

export const SERVICE_ADD_ONS: Record<ServiceAddOnCode, ServiceAddOnDefinition> = {
  'blouse-stitching': {
    code: 'blouse-stitching',
    label: 'Blouse Stitching / Alteration',
    checkoutOptionValue: 'Blouse Stitching / Alteration (+$10)',
    price: 10,
    description: 'Available only where this listing includes blouse fabric or states an unstitched blouse piece.',
  },
  'pico-fall': {
    code: 'pico-fall',
    label: 'Pico & Fall',
    checkoutOptionValue: 'Pico & Fall (+$8)',
    price: 8,
    description: 'Combined pico and fall finishing for this saree listing.',
  },
  'matching-petticoat': {
    code: 'matching-petticoat',
    label: 'Matching Petticoat',
    checkoutOptionValue: 'Matching Petticoat (+$8)',
    price: 8,
    description: 'An optional matching petticoat for this saree listing.',
  },
  'garment-alteration': {
    code: 'garment-alteration',
    label: 'Garment Alteration',
    checkoutOptionValue: 'Blouse Stitching / Alteration (+$10)',
    price: 10,
    description: 'An optional alteration request for this garment, including ready-to-wear. LuxeMia confirms the alteration scope and timing before work starts.',
  },
};

const SAREE_PATTERN = /\b(?:saree|sari)\b/i;
const BLOUSE_PATTERN = /\b(?:blouse\s+fabric|unstitched\s+blouse|blouse\s+piece|blouse)\b/i;
const STITCHED_BLOUSE_PATTERN = /\b(?:(?:fully[-\s]+)?stitched|ready[-\s]*(?:made|to[-\s]*wear))\s+blouse\b|\bblouse\s+(?:is\s+)?(?:fully[-\s]+)?stitched\b/i;
const APPAREL_PATTERN = /\b(?:lehenga|choli|suit|kurta|salwar|sharara|palazzo|anarkali|gown|sherwani|jacket|co-?ord|blouse|dress|kaftan|skirt|dhoti|pant|tunic)\b/i;

export interface ServiceEligibleProduct {
  title: string;
  productType?: string;
  description: string;
  tags?: string[];
  options?: Array<{ name: string; values: string[] }>;
  variants?: {
    edges: Array<{ node: { selectedOptions: Array<{ name: string; value: string }> } }>;
  };
  metadata?: {
    blouseFabric?: string | null;
    includedComponents?: string[] | null;
  };
}

/** A supplied stitched lehenga with native sizes does not offer neckline changes. */
export const hasFixedStitchedLehengaOptions = (product: ServiceEligibleProduct): boolean => {
  const type = `${product.title} ${product.productType || ''}`;
  if (!/\blehenga\b/i.test(type) || SAREE_PATTERN.test(type)) return false;
  if (!product.options?.some(option => option.name.trim().toLowerCase() === 'size'
    && option.values.length > 0)) return false;
  // Explicit tailoring services keep their existing, separate design controls.
  if (product.tags?.some(tag => /^(?:tailoring|stitching):/i.test(tag.trim()))) return false;
  const stitching = product.options?.find(option => option.name.trim().toLowerCase() === 'stitching');
  if (!stitching || stitching.values.length !== 1
    || !/^(?:fully\s+)?stitched$/i.test(stitching.values[0].trim())) return false;
  const variants = product.variants?.edges ?? [];
  return variants.length > 0 && variants.every(({ node }) => node.selectedOptions.some(option =>
    option.name === stitching.name
    && option.value.trim().toLowerCase() === stitching.values[0].trim().toLowerCase(),
  ));
};

interface ServiceCartLineLike {
  product: { node: ServiceEligibleProduct & { handle?: string } };
  variantTitle: string;
  serviceAddOnCode?: ServiceAddOnCode;
  customAttributes?: Array<{ key: string; value: string }>;
}

/** Shared billing variants need the selected service identity, not a saree assumption. */
export const isGarmentAlterationCartLine = (
  item: ServiceCartLineLike,
  cartItems: ServiceCartLineLike[],
): boolean => {
  if (!isHiddenBillingProductHandle(item.product.node.handle)) return false;
  if (item.serviceAddOnCode) return item.serviceAddOnCode === 'garment-alteration';
  // Older carts have only Applies To. Infer only when the shared alteration
  // variant is linked unambiguously to a garment eligible for alteration.
  if (item.variantTitle !== SERVICE_ADD_ONS['garment-alteration'].checkoutOptionValue) return false;
  const appliesTo = item.customAttributes?.find(attribute => attribute.key === 'Applies To')?.value;
  if (!appliesTo) return false;
  const linked = cartItems.filter(line => !isHiddenBillingProductHandle(line.product.node.handle)
    && line.product.node.title === appliesTo);
  return linked.length > 0 && linked.every(line =>
    getEligibleServiceAddOns(line.product.node).includes('garment-alteration'),
  );
};

/**
 * Recognizes the approved fabric / standard / custom lehenga contract, with
 * only its listed, supported size pairs per color (or other native option combination).
 * Availability is deliberately ignored: a sold-out size does not turn an
 * included stitching service into a separate alteration purchase.
 */
export const hasNativeFullStitchingOptions = (product: ServiceEligibleProduct): boolean => {
  if (!/\blehenga\b/i.test(`${product.title} ${product.productType || ''}`)) return false;
  const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
  const stitching = product.options?.find(option => normalize(option.name) === 'stitching');
  const size = product.options?.find(option => normalize(option.name) === 'size');
  if (!stitching || !size) return false;

  const stitchingValues = stitching.values.map(normalize);
  const sizes = size.values.map(normalize);
  const fabricSize = sizes.find(value => value === 'fabric only' || value === 'not applicable');
  const supportedStandardSizes = new Set(['32', '34', '36', '38', '40', '42', '44', '46']);
  const standardSizes = sizes.filter(value => supportedStandardSizes.has(value));
  if (stitchingValues.length !== 3 || ![
    'unstitched (fabric only)', 'standard stitched', 'custom stitched',
  ].every(value => stitchingValues.includes(value))) return false;
  // Listings may offer a smaller supported size range. Keep the exact contract:
  // one fabric size, at least one standard size, and Custom Fit, with no extras.
  if (!fabricSize || standardSizes.length === 0 || !sizes.includes('custom fit')
    || new Set(sizes).size !== sizes.length
    || sizes.length !== standardSizes.length + 2) return false;

  const expectedPairs = new Set([
    `unstitched (fabric only)::${fabricSize}`,
    ...standardSizes.map(value => `standard stitched::${value}`),
    'custom stitched::custom fit',
  ]);
  const groups = new Map<string, Set<string>>();
  for (const { node } of product.variants?.edges ?? []) {
    const selected = node.selectedOptions;
    const construction = selected.find(option => option.name === stitching.name)?.value;
    const selectedSize = selected.find(option => option.name === size.name)?.value;
    if (!construction || !selectedSize) return false;
    const pair = `${normalize(construction)}::${normalize(selectedSize)}`;
    if (!expectedPairs.has(pair)) return false;
    const groupKey = JSON.stringify(selected
      .filter(option => option.name !== stitching.name && option.name !== size.name)
      .map(option => [option.name, option.value])
      .sort(([left], [right]) => left.localeCompare(right)));
    const pairs = groups.get(groupKey) ?? new Set<string>();
    if (pairs.has(pair)) return false;
    pairs.add(pair);
    groups.set(groupKey, pairs);
  }
  return groups.size > 0 && [...groups.values()].every(pairs => pairs.size === expectedPairs.size);
};

/** Catalog cards fetch one variant only. This identifies choices for neutral
 * copy, never for billing eligibility or full-matrix validation. */
export const hasNativeStitchingChoices = (product: ServiceEligibleProduct): boolean => {
  if (!/\blehenga\b/i.test(`${product.title} ${product.productType || ''}`)) return false;
  const values = product.options?.find(option => option.name.trim().toLowerCase() === 'stitching')
    ?.values.map(value => value.trim().replace(/\s+/g, ' ').toLowerCase());
  return values?.length === 3 && [
    'unstitched (fabric only)', 'standard stitched', 'custom stitched',
  ].every(value => values.includes(value));
};

/** Native alteration variants already bill measurement-based fitting. Keep this
 * contract narrow: construction/size choices alone are not an alteration service.
 * Sold-out variants remain evidence so availability cannot create a second charge.
 */
export const hasNativeAlterationOptions = (product: ServiceEligibleProduct): boolean => {
  const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
  const alteration = product.options?.find(option => normalize(option.name) === 'alteration');
  if (!alteration || alteration.values.length !== 2) return false;
  const values = alteration.values.map(normalize);
  const madeToFit = values.find(value => /^made to fit(?: \(\+\$\d+(?:\.\d{1,2})?\))?$/.test(value));
  if (!values.includes('standard fit') || !madeToFit) return false;
  const groups = new Map<string, Set<string>>();
  for (const { node } of product.variants?.edges ?? []) {
    const value = node.selectedOptions.find(option => option.name === alteration.name)?.value;
    if (!value || !values.includes(normalize(value))) return false;
    const key = JSON.stringify(node.selectedOptions.filter(option => option.name !== alteration.name)
      .map(option => [option.name, option.value]).sort(([a], [b]) => a.localeCompare(b)));
    const seen = groups.get(key) ?? new Set<string>();
    if (seen.has(normalize(value))) return false;
    seen.add(normalize(value));
    groups.set(key, seen);
  }
  return groups.size > 0 && [...groups.values()].every(values => values.size === 2);
};

export const NATIVE_STITCHING_TIMING_NOTICE =
  ALTERATION_TIMING_NOTICE;

/** One processing allowance for any alteration/finishing selection, never per fee. */
export const selectedServicesRequireProcessing = (codes: ServiceAddOnCode[]): boolean =>
  codes.some(code => code === 'garment-alteration' || code === 'blouse-stitching' || code === 'pico-fall');

/** A listed made-to-measure blouse requires the same one-time processing
 * allowance as other selected tailoring. This never infers a charge or size. */
const isNativeMadeToMeasureBlouse = (option: { name: string; value: string }): boolean =>
  option.name.trim().toLowerCase() === 'blouse'
  && /^made[-\s]+to[-\s]+measure blouse(?: \(\+\$\d+(?:\.\d{1,2})?\))?$/i.test(option.value.trim());

const hasNativeMadeToMeasureBlouse = (product: ServiceEligibleProduct): boolean =>
  (product.options ?? []).some(option => option.values.some(value =>
    isNativeMadeToMeasureBlouse({ name: option.name, value }),
  ));

/** A family may offer fitting even when its first/default variant does not. */
export const mayRequireAlterationProcessing = (product: ServiceEligibleProduct): boolean =>
  hasNativeFullStitchingOptions(product) || hasNativeAlterationOptions(product)
  || hasNativeMadeToMeasureBlouse(product)
  || selectedServicesRequireProcessing(getEligibleServiceAddOns(product))
  || (product.options ?? []).some(option => /size/i.test(option.name)
    && option.values.some(value => /\bcustom\b/i.test(value)))
  || (product.tags ?? []).some(tag => /^(?:availability:)?made to order$|^custom-made$/i.test(tag.trim()));

export const requiresNativeStitchingTimingConfirmation = (
  product: ServiceEligibleProduct,
  selectedOptions: Array<{ name: string; value: string }>,
): boolean => selectedOptions.some(selected => isNativeMadeToMeasureBlouse(selected)
  && (product.options ?? []).some(option => option.name === selected.name && option.values.includes(selected.value)))
  || (hasNativeAlterationOptions(product) && selectedOptions.some(option =>
  option.name.trim().toLowerCase() === 'alteration'
  && /^made to fit(?: \(\+\$\d+(?:\.\d{1,2})?\))?$/i.test(option.value.trim().replace(/\s+/g, ' ')),
)) || (hasNativeFullStitchingOptions(product) && selectedOptions.some(option =>
  option.name.trim().toLowerCase() === 'stitching'
  && /^(?:standard|custom) stitched$/i.test(option.value.trim()),
));

export const isUnstitchedDeliverySelection = (
  product: ServiceEligibleProduct,
  selectedOptions: Array<{ name: string; value: string }>,
): boolean => hasNativeFullStitchingOptions(product)
  ? selectedOptions.some(option => option.name.trim().toLowerCase() === 'stitching'
    && option.value.trim().toLowerCase() === 'unstitched (fabric only)')
  : product.tags?.includes('construction:Unstitched') ?? false;

const productEvidence = (product: ServiceEligibleProduct) => [
  product.title,
  product.productType,
  product.description,
  ...(product.tags ?? []),
  ...(product.options ?? []).flatMap((option) => [option.name, ...option.values]),
  product.metadata?.blouseFabric,
  ...(product.metadata?.includedComponents ?? []),
].filter((value): value is string => Boolean(value));

/** Supplied construction outranks blouse styling shown in an otherwise fabric-only listing. */
export const hasIncludedStitchedBlouse = (product: ServiceEligibleProduct): boolean => {
  const evidence = productEvidence(product);
  if (evidence.some(value => /\bunstitched\s+blouse\b/i.test(value))) return false;
  return evidence.some(value => STITCHED_BLOUSE_PATTERN.test(value)
    && !/\b(?:no|without)\s+(?:(?:fully[-\s]+)?stitched|ready[-\s]*made)\s+blouse\b|\bblouse\s+(?:is\s+)?(?:not\s+included|sold\s+separately)\b|\bstitched\s+blouse\s+shown\b/i.test(value));
};

/**
 * Returns direct purchase options for sarees and an alteration option for
 * other garments — including ready-to-wear, per the owner's services
 * directive (2026-09-22). Every saree receives the combined Pico & Fall and
 * matching petticoat selections; blouse stitching remains conditional on
 * stated blouse-fabric or blouse-piece evidence. Garments that already expose
 * a stitching/alteration option skip the duplicate alteration line.
 */
export const getEligibleServiceAddOns = (product: ServiceEligibleProduct): ServiceAddOnCode[] => {
  const isSaree = SAREE_PATTERN.test(`${product.title} ${product.productType}`);
  const hasListingStitchingOption = (product.options ?? []).some((option) =>
    /stitch|alter/i.test(option.name),
  );

  if (isSaree) {
    const services: ServiceAddOnCode[] = ['pico-fall', 'matching-petticoat'];
    if (!hasListingStitchingOption) {
      // A supplied stitched blouse may still be altered; it does not need to
      // be sold again as an unstitched fabric-stitching service.
      if (hasIncludedStitchedBlouse(product)) services.unshift('garment-alteration');
      else if (BLOUSE_PATTERN.test(productEvidence(product).join(' '))) services.unshift('blouse-stitching');
    }
    return services;
  }

  // These native variant prices already include the selected full-stitching
  // service. Neither their fabric-only nor finished choices sell alterations.
  if (hasNativeFullStitchingOptions(product) || hasNativeAlterationOptions(product)) return [];

  // Fabric-only selections cannot be altered as finished garments. Keep
  // alteration available for ready-made products and mixed construction ranges.
  const constructionValues = (product.options ?? [])
    .filter(option => /stitch|construction/i.test(option.name))
    .flatMap(option => option.values);
  const isUnstitchedOnly = constructionValues.length > 0
    ? constructionValues.every(value => /\bunstitched\b/i.test(value))
    : /\bunstitched\b/i.test(product.title)
      || (product.tags ?? []).some(tag => /^(?:construction:\s*)?unstitched$/i.test(tag.trim()));
  if (isUnstitchedOnly) return [];

  const isApparel = APPAREL_PATTERN.test(`${product.title} ${product.productType}`);
  // Ready-to-wear garments keep the alteration offer even when the listing has
  // a construction/stitching selector: altering a purchased garment is a
  // distinct service from stitching an unstitched one.
  return isApparel ? ['garment-alteration'] : [];
};

/** Revalidate saved UI selections before pricing or adding any service line. */
export const selectedEligibleServiceAddOns = (
  product: ServiceEligibleProduct,
  selected: ServiceAddOnCode[],
  available: ServiceAddOnCode[],
): ServiceAddOnCode[] => {
  const eligible = new Set(getEligibleServiceAddOns(product));
  return [...new Set(selected)].filter(code => eligible.has(code) && available.includes(code));
};

export const serviceAddOnTotal = (codes: ServiceAddOnCode[]) => codes.reduce(
  (total, code) => total + SERVICE_ADD_ONS[code].price,
  0,
);

/** The sourced Banarasi batch has blouse fabric, but no verified finished-size range. */
export const isBanarasiSareeServiceProduct = (product: ServiceEligibleProduct): boolean =>
  product.productType?.trim().toLowerCase() === 'saree'
  && (product.tags?.includes('collection:banarasi-sarees') ?? false);

export const requiresBlouseServiceConfirmation = (
  product: ServiceEligibleProduct,
  selected: ServiceAddOnCode[],
): boolean => isBanarasiSareeServiceProduct(product) && selected.includes('blouse-stitching');

export const isBlouseServiceSelectionConfirmed = (
  product: ServiceEligibleProduct,
  selected: ServiceAddOnCode[],
  confirmed: boolean,
): boolean => !requiresBlouseServiceConfirmation(product, selected) || confirmed;

export const BLOUSE_SERVICE_CONFIRMATION_NOTICE =
  'I will provide my blouse measurements after ordering. LuxeMia must confirm fabric suitability, design and fit feasibility, and dispatch timing with me before stitching begins.';

export const blouseServiceConfirmationAttributes = (
  product: ServiceEligibleProduct,
  selected: ServiceAddOnCode[],
  confirmed: boolean,
): Array<{ key: string; value: string }> =>
  requiresBlouseServiceConfirmation(product, selected) && confirmed ? [
    { key: 'Blouse Measurements', value: 'Customer will provide measurements after ordering; confirm before stitching' },
    { key: 'Blouse Confirmation', value: 'Fabric suitability, design and fit feasibility, and dispatch timing must be confirmed before stitching' },
    { key: 'Measurement Acknowledgment', value: 'Customer acknowledged before adding to bag' },
  ] : [];
