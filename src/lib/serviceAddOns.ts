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

/**
 * Recognizes the approved fabric / standard / custom lehenga contract, with
 * only its ten valid pairs per color (or other native option combination).
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
  const standardSizes = ['32', '34', '36', '38', '40', '42', '44', '46'];
  if (stitchingValues.length !== 3 || ![
    'unstitched (fabric only)', 'standard stitched', 'custom stitched',
  ].every(value => stitchingValues.includes(value))) return false;
  if (!fabricSize || sizes.length !== 10 || ![
    ...standardSizes, 'custom fit',
  ].every(value => sizes.includes(value))) return false;

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

const productEvidence = (product: ServiceEligibleProduct) => [
  product.title,
  product.productType,
  product.description,
  ...(product.tags ?? []),
  ...(product.options ?? []).flatMap((option) => [option.name, ...option.values]),
  product.metadata?.blouseFabric,
  ...(product.metadata?.includedComponents ?? []),
].filter(Boolean).join(' ');

/**
 * Returns direct purchase options for sarees and an alteration option for
 * other garments — including ready-to-wear, per the owner's services
 * directive (2026-09-22). Every saree receives the combined Pico & Fall and
 * matching petticoat selections; blouse stitching remains conditional on
 * stated blouse-fabric or blouse-piece evidence. Garments that already expose
 * a stitching/alteration option skip the duplicate alteration line.
 */
export const getEligibleServiceAddOns = (product: ServiceEligibleProduct): ServiceAddOnCode[] => {
  const evidence = productEvidence(product);
  const isSaree = SAREE_PATTERN.test(`${product.title} ${product.productType}`);
  const hasListingStitchingOption = (product.options ?? []).some((option) =>
    /stitch|alter/i.test(option.name),
  );

  if (isSaree) {
    const services: ServiceAddOnCode[] = ['pico-fall', 'matching-petticoat'];
    if (BLOUSE_PATTERN.test(evidence) && !hasListingStitchingOption) {
      services.unshift('blouse-stitching');
    }
    return services;
  }

  // These native variant prices already include the selected full-stitching
  // service. Neither their fabric-only nor finished choices sell alterations.
  if (hasNativeFullStitchingOptions(product)) return [];

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
