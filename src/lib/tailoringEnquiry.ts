// Local copy: this module is bundled into the edge middleware, where a
// cross-file TypeScript import is not resolvable at runtime. Keep in sync
// with isTailoringRequestValue in productOptionNames.ts.
function isTailoringRequestValue(value?: string | null): boolean {
  return /\b(?:custom|bespoke|alteration|made[-\s]+to[-\s]+(?:measure|fit))\b/i.test(value || '');
}

/** Catalogue facts supplied for this bounded correction; no supplier quote exists. */
export const TAILORING_ENQUIRY_PRODUCTS = [
  { handle: 'orange-bead-embroidered-chinon-suit-dupatta', baseVariantId: 'gid://shopify/ProductVariant/48399143141547', customVariantId: 'gid://shopify/ProductVariant/48399143174315' },
  { handle: 'black-bead-embroidered-chinon-suit-dupatta', baseVariantId: 'gid://shopify/ProductVariant/48399143338155', customVariantId: 'gid://shopify/ProductVariant/48399143370923' },
  { handle: 'teal-bead-embroidered-chinon-suit-dupatta', baseVariantId: 'gid://shopify/ProductVariant/48399143436459', customVariantId: 'gid://shopify/ProductVariant/48399143469227' },
] as const;
export const TAILORING_ENQUIRY_NOTICE =
  'Enquiry only: written confirmation of measurements, alteration feasibility, cost and timing is required before ordering tailoring for this style. A generic service price or customer acknowledgment is not approval.';
export const TAILORING_CATALOG_SIZE_NOTICE =
  'Listed catalog size label: 32. This is not supplier-verified measurements, inches or a US size; no additional garment sizes or alteration allowance are confirmed.';
export const TAILORING_ENQUIRY_CONTACT_PATH = '/contact';

export function requiresTailoringEnquiry(handle?: string | null): boolean {
  return TAILORING_ENQUIRY_PRODUCTS.some(product => product.handle === handle);
}

export function isEnquiryOnlyVariant(handle?: string | null, variantId?: string | null,
  selectedOptions: Array<{ name: string; value: string }> = []): boolean {
  return TAILORING_ENQUIRY_PRODUCTS.some(product => product.customVariantId === variantId)
    || (requiresTailoringEnquiry(handle) && selectedOptions.some(option =>
      /^(?:size|stitching|tailoring|alteration)$/i.test(option.name.trim()) && isTailoringRequestValue(option.value)));
}

interface EnquiryCheckoutLine {
  variantId: string;
  handle?: string;
  title?: string;
  selectedOptions?: Array<{ name: string; value: string }>;
  serviceAddOnCode?: string;
  customAttributes?: Array<{ key: string; value: string }>;
}

function isTargetGarment(line: EnquiryCheckoutLine): boolean {
  return requiresTailoringEnquiry(line.handle) || TAILORING_ENQUIRY_PRODUCTS.some(product =>
    product.baseVariantId === line.variantId || product.customVariantId === line.variantId);
}

/** Frontend safety boundary only: these attributes cannot authenticate a supplier-approved quote. */
export function hasUnconfirmedTargetTailoring(lines: EnquiryCheckoutLine[]): boolean {
  if (lines.some(line => isEnquiryOnlyVariant(line.handle, line.variantId, line.selectedOptions))) return true;
  return lines.some(line => {
    if (line.handle !== 'luxemia-tailoring-saree-finishing-add-ons') return false;
    const attributes = line.customAttributes ?? [];
    const isAlteration = line.serviceAddOnCode === 'garment-alteration'
      || line.variantId === 'gid://shopify/ProductVariant/47669368455339'
      || attributes.some(attribute => attribute.key === 'Selected Service' && /alteration/i.test(attribute.value));
    if (!isAlteration) return false;
    if (attributes.some(attribute => ['Applies To Handle', 'Related Product Handle'].includes(attribute.key)
      && requiresTailoringEnquiry(attribute.value))) return true;
    const appliesTo = attributes.find(attribute => attribute.key === 'Applies To')?.value;
    const reference = attributes.find(attribute => attribute.key === 'Configuration reference')?.value;
    return lines.some(garment => isTargetGarment(garment) && (
      (Boolean(appliesTo) && appliesTo === garment.title)
      || (Boolean(reference) && garment.customAttributes?.some(attribute =>
        attribute.key === 'Configuration reference' && attribute.value === reference))
    )) || Boolean(appliesTo && /^(?:orange|black|teal) bead[- ]embroidered chinon suits?(?:(?: with| and| &)? dupatta)?$/i.test(appliesTo.trim()));
  });
}
