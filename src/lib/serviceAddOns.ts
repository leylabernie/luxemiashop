import type { ShopifyProduct } from '@/lib/shopify';

export const SERVICE_ADD_ON_PRODUCT_HANDLE = 'luxemia-tailoring-saree-finishing-add-ons';

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
    description: 'Combined pico and fall finishing for eligible standard sarees.',
  },
  'matching-petticoat': {
    code: 'matching-petticoat',
    label: 'Matching Petticoat',
    checkoutOptionValue: 'Matching Petticoat (+$8)',
    price: 8,
    description: 'An optional matching petticoat for eligible standard sarees.',
  },
  'garment-alteration': {
    code: 'garment-alteration',
    label: 'Garment Alteration',
    checkoutOptionValue: 'Blouse Stitching / Alteration (+$10)',
    price: 10,
    description: 'An optional alteration request for eligible unstitched or semi-stitched garments.',
  },
};

const SAREE_PATTERN = /\b(?:saree|sari)\b/i;
const READY_PATTERN = /\b(?:ready[-\s]?to[-\s]?wear|ready[-\s]?made|readymade|pre[-\s]?stitched|prestitched|pre[-\s]?draped)\b/i;
const UNSTITCHED_PATTERN = /\b(?:unstitched|semi[-\s]?stitched)\b/i;
const BLOUSE_PATTERN = /\b(?:blouse\s+fabric|unstitched\s+blouse|blouse\s+piece|blouse)\b/i;
const APPAREL_PATTERN = /\b(?:lehenga|choli|suit|kurta|salwar|sharara|palazzo|anarkali|gown|sherwani|jacket|co-?ord|blouse|dress|kaftan|skirt|dhoti|pant|tunic)\b/i;

export type ServiceEligibleProduct = Pick<
  ShopifyProduct['node'],
  'title' | 'productType' | 'description' | 'tags' | 'options' | 'metadata'
>;

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
 * Returns only services supported by a listing’s facts. It deliberately excludes
 * ready-to-wear, pre-stitched, and pre-draped garments from generic finishing
 * or alteration offers rather than making an unsupported tailoring promise.
 */
export const getEligibleServiceAddOns = (product: ServiceEligibleProduct): ServiceAddOnCode[] => {
  const evidence = productEvidence(product);
  const isSaree = SAREE_PATTERN.test(`${product.title} ${product.productType}`);
  const isReady = READY_PATTERN.test(evidence);
  const hasListingStitchingOption = (product.options ?? []).some((option) =>
    /stitch|alter/i.test(option.name),
  );

  if (isSaree) {
    if (isReady) return [];
    const services: ServiceAddOnCode[] = ['pico-fall', 'matching-petticoat'];
    if (BLOUSE_PATTERN.test(evidence) && !hasListingStitchingOption) {
      services.unshift('blouse-stitching');
    }
    return services;
  }

  const isApparel = APPAREL_PATTERN.test(`${product.title} ${product.productType}`);
  const supportsAlteration = isApparel && !isReady && UNSTITCHED_PATTERN.test(evidence) && !hasListingStitchingOption;
  return supportsAlteration ? ['garment-alteration'] : [];
};

export const serviceAddOnTotal = (codes: ServiceAddOnCode[]) => codes.reduce(
  (total, code) => total + SERVICE_ADD_ONS[code].price,
  0,
);
