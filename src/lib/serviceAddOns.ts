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
  checkoutOptionLabel: string;
  description: string;
}

export const SERVICE_ADD_ONS: Record<ServiceAddOnCode, ServiceAddOnDefinition> = {
  'blouse-stitching': {
    code: 'blouse-stitching',
    label: 'Blouse Stitching / Alteration',
    checkoutOptionLabel: 'Blouse Stitching / Alteration',
    description: 'Available only where this listing includes blouse fabric or states an unstitched blouse piece.',
  },
  'pico-fall': {
    code: 'pico-fall',
    label: 'Pico & Fall',
    checkoutOptionLabel: 'Pico & Fall',
    description: 'Combined pico and fall finishing for this saree listing.',
  },
  'matching-petticoat': {
    code: 'matching-petticoat',
    label: 'Matching Petticoat',
    checkoutOptionLabel: 'Matching Petticoat',
    description: 'An optional matching petticoat for this saree listing.',
  },
  'garment-alteration': {
    code: 'garment-alteration',
    label: 'Garment Alteration',
    checkoutOptionLabel: 'Blouse Stitching / Alteration',
    description: 'An optional alteration request for eligible unstitched or semi-stitched garments.',
  },
};

/**
 * Shopify's historical service option labels contain a display-price suffix.
 * Strip that suffix only for identity matching; the live variant Money value
 * remains the sole price shown and charged by the storefront.
 */
export const normalizeServiceOptionLabel = (value: string): string => value
  .replace(/\s*\(\s*\+[^)]*\)\s*$/, '')
  .trim()
  .toLowerCase();

export interface ServiceEligibleProduct {
  title: string;
  productType?: string;
  description: string;
  tags?: string[];
  options?: Array<{ name: string; values: string[] }>;
  metadata?: {
    blouseFabric?: string | null;
    includedComponents?: string[] | null;
  };
}

const SERVICE_ADD_ON_CODES = new Set<ServiceAddOnCode>(Object.keys(SERVICE_ADD_ONS) as ServiceAddOnCode[]);

const serviceCodeFromExplicitTag = (tag: string): ServiceAddOnCode | null => {
  const match = tag.trim().match(/^(?:service|service-add-on):\s*(.+)$/i);
  if (!match) return null;
  const code = match[1].trim().toLowerCase().replace(/[\s_]+/g, '-') as ServiceAddOnCode;
  return SERVICE_ADD_ON_CODES.has(code) ? code : null;
};

/**
 * Returns only service add-ons declared by a product-specific `service:` or
 * `service-add-on:` tag. Product type, construction language, description prose,
 * and generic blouse evidence cannot imply that a paid service is compatible.
 * ProductInfo separately requires a live, available, positive-price billing
 * variant before any tagged service can be shown or selected.
 */
export const getEligibleServiceAddOns = (product: ServiceEligibleProduct): ServiceAddOnCode[] => {
  const declaredCodes = (product.tags ?? [])
    .map(serviceCodeFromExplicitTag)
    .filter((code): code is ServiceAddOnCode => code !== null);
  return [...new Set(declaredCodes)];
};
