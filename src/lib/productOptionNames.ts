const SIZE_OPTION_NAMES = new Set([
  'size', 'age', 'standard size', 'blouse size', 'bust size', 'chest size', 'stitching size',
  'petticoat size', "men's size", "women's size",
]);
const MERCHANDISING_OPTION_NAMES = /^(?:colou?r|fabric|material|style|design|pattern)$/;
const COLOR_VALUE_PATTERN = /\b(?:beige|black|blue|brown|coral|cream|fuchsia|gold|gray|green|grey|ivory|lavender|magenta|maroon|mint|multicolou?r|mustard|navy|olive|orange|peach|pink|purple|red|silver|teal|turquoise|white|wine|yellow)\b/i;

export function normalizeProductOptionName(value?: string | null): string {
  return (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isProductSizeOptionName(value?: string | null): boolean {
  return SIZE_OPTION_NAMES.has(normalizeProductOptionName(value));
}

interface ShopifyProductOptionLike {
  name: string;
  values: string[];
}

export function isConventionalProductSizeValue(value?: string | null): boolean {
  return /^(?:xxs|xs|s|m|l|xl|xxl|xxxl|[2-6]xl|\d{2,3}|one[-\s]?size|free[-\s]?size)$/i.test((value || '').trim());
}

/** A fit request is not evidence of a supplied garment size. */
export function isTailoringRequestValue(value?: string | null): boolean {
  return /\b(?:custom|bespoke|alteration|made[-\s]+to[-\s]+(?:measure|fit))\b/i.test(value || '');
}

export function isConstructionOptionValue(value?: string | null): boolean {
  return /\b(?:unstitched|semi[-\s]?stitched|stitched|ready[-\s]*(?:made|to[-\s]*wear)|fabric only)\b|^(?:not applicable|no stitching|standard stitching)$/i.test((value || '').trim());
}

function meaningfulValues(option: ShopifyProductOptionLike): string[] {
  // Return Shopify values verbatim: display classification must never change resolution.
  return option.values.filter(value => value.trim() && normalizeProductOptionName(value) !== 'default title');
}

function hasOnlyColorValues(values: string[]): boolean {
  return values.length > 0 && values.every(value => COLOR_VALUE_PATTERN.test(value));
}

/** Limited allowance labels remain one literal size choice, never expanded to sizes/dimensions. */
function isListedGarmentSizeValue(name: string, value: string): boolean {
  if (isTailoringRequestValue(value) || isConstructionOptionValue(value) || COLOR_VALUE_PATTERN.test(value)) return false;
  if (isConventionalProductSizeValue(value)) return true;
  if (normalizeProductOptionName(name) === 'age') return /^\d+(?:\s*-\s*\d+)?\s*(?:y|m|years?|months?)$/i.test(value.trim());
  return /^(?:xxs|xs|s|m|l|xl|xxl|xxxl|[2-6]xl|\d{2,3})\s+(?:up to|with)\s+.+\b(?:margin|allowance)\b.*$/i.test(value.trim());
}

function isSizeLikeOption(option: ShopifyProductOptionLike): boolean {
  const name = normalizeProductOptionName(option.name);
  if (MERCHANDISING_OPTION_NAMES.test(name)) return false;
  if (isProductSizeOptionName(name)) return true;
  const values = meaningfulValues(option);
  return values.length >= 2 && values.every(isConventionalProductSizeValue);
}

export function getActualProductSizeValues(options: ShopifyProductOptionLike[] = []): string[] {
  return [...new Set(options.filter(isSizeLikeOption).flatMap(option =>
    meaningfulValues(option).filter(value => isListedGarmentSizeValue(option.name, value)),
  ))];
}

/** Correct labels by name AND value while retaining the native Shopify identity. */
export function getCustomerFacingProductOptionName(option: ShopifyProductOptionLike): string {
  const values = meaningfulValues(option);
  if (MERCHANDISING_OPTION_NAMES.test(normalizeProductOptionName(option.name))) return option.name;
  if (isProductSizeOptionName(option.name) && hasOnlyColorValues(values)) return 'Color';
  if (isSizeLikeOption(option)) {
    if (values.some(value => isListedGarmentSizeValue(option.name, value))) {
      return isProductSizeOptionName(option.name) ? option.name : 'Size';
    }
    if (values.length && values.every(value => isConstructionOptionValue(value) || isTailoringRequestValue(value))) return 'Construction / tailoring';
  }
  return option.name;
}

export interface ProductOptionDisplayGroup {
  name: string;
  label: string;
  values: string[];
  kind: 'size' | 'tailoring-request' | 'construction' | 'other';
}

/** Separate mixed fit, construction and request controls; every button resolves its original option. */
export function getProductOptionDisplayGroups(option: ShopifyProductOptionLike): ProductOptionDisplayGroup[] {
  const values = meaningfulValues(option);
  const label = getCustomerFacingProductOptionName(option);
  if (!isSizeLikeOption(option) || label === 'Color') return [{ name: option.name, label, values, kind: 'other' }];
  const sizes = values.filter(value => isListedGarmentSizeValue(option.name, value));
  const requests = values.filter(isTailoringRequestValue);
  const remaining = values.filter(value => !sizes.includes(value) && !requests.includes(value));
  return [
    ...(sizes.length ? [{ name: option.name, label: isProductSizeOptionName(option.name) ? option.name : 'Size', values: sizes, kind: 'size' as const }] : []),
    ...(remaining.length ? [{ name: option.name, label: remaining.every(isConstructionOptionValue) ? 'Construction / tailoring' : label, values: remaining, kind: 'construction' as const }] : []),
    ...(requests.length ? [{ name: option.name, label: 'Tailoring request', values: requests, kind: 'tailoring-request' as const }] : []),
  ];
}

export const NO_FINISHED_GARMENT_SIZE_NOTICE =
  'No finished-garment size is specified in this listing. Use only dimensions stated in the listing; contact LuxeMia before ordering if measurements or construction are unclear.';
export const SIZING_GUIDANCE_LABEL = 'Sizing / measurement guidance';

export function hasNativeProductSizeOption(options: ShopifyProductOptionLike[]): boolean {
  return getActualProductSizeValues(options).length > 0;
}

interface ProductOptionDisplayContext {
  isCustomizable?: boolean;
  isStitchable?: boolean;
}

export function shouldRenderShopifyProductOption(
  option: ShopifyProductOptionLike,
  context: ProductOptionDisplayContext = {},
): boolean {
  const values = meaningfulValues(option);
  if (!values.length) return false;
  if (context.isCustomizable && isProductSizeOptionName(option.name)
    && values.length === 1 && normalizeProductOptionName(values[0]) === 'custom') return false;
  // Never suppress native sizes mislabeled as Stitching, including when generic tailoring is active.
  if (context.isStitchable && normalizeProductOptionName(option.name).includes('stitch')
    && !isProductSizeOptionName(option.name) && !hasNativeProductSizeOption([option])) return false;
  return true;
}
