const SIZE_OPTION_NAMES = new Set([
  'size',
  'standard size',
  'blouse size',
  'bust size',
  'chest size',
  'stitching size',
]);

export function normalizeProductOptionName(value?: string | null): string {
  return (value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function isProductSizeOptionName(value?: string | null): boolean {
  return SIZE_OPTION_NAMES.has(normalizeProductOptionName(value));
}

interface ShopifyProductOptionLike {
  name: string;
  values: string[];
}

interface ProductOptionDisplayContext {
  isCustomizable?: boolean;
  isStitchable?: boolean;
}

/**
 * Determines whether ProductInfo should render Shopify's native option picker.
 * Numeric size variants must remain native variant choices: hiding them while
 * also suppressing the separate measurement selector leaves shoppers unable to
 * select a purchasable variant.
 */
export function shouldRenderShopifyProductOption(
  option: ShopifyProductOptionLike,
  context: ProductOptionDisplayContext = {},
): boolean {
  const normalizedValues = option.values.map((value) => value.trim().toLowerCase());
  if (normalizedValues.length === 1 && normalizedValues[0] === 'default title') return false;

  if (
    context.isCustomizable
    && isProductSizeOptionName(option.name)
    && normalizedValues.length === 1
    && normalizedValues[0] === 'custom'
  ) {
    return false;
  }

  // Hide a separate tailoring-service option when the custom stitching UI is
  // active, but never hide a recognized size alias such as "Stitching Size".
  if (
    context.isStitchable
    && normalizeProductOptionName(option.name).includes('stitch')
    && !isProductSizeOptionName(option.name)
  ) {
    return false;
  }

  return true;
}
