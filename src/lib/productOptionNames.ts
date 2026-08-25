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

export function isConventionalProductSizeValue(value?: string | null): boolean {
  return /^(?:xxs|xs|s|m|l|xl|xxl|xxxl|[2-6]xl|\d{2,3}|one[-\s]?size|free[-\s]?size)$/i.test(
    (value || '').trim(),
  );
}

export function hasNativeProductSizeOption(
  options: ShopifyProductOptionLike[],
): boolean {
  return options.some((option) => {
    const values = option.values
      .map((value) => value.trim())
      .filter((value) => value && value.toLowerCase() !== 'default title');
    if (values.length === 0) return false;
    if (isProductSizeOptionName(option.name)) return true;

    // Do not reinterpret an explicitly named merchandising attribute as a
    // size control even if its values happen to be short abbreviations.
    if (/^(?:colou?r|fabric|material|style|design|pattern)$/.test(normalizeProductOptionName(option.name))) {
      return false;
    }

    // Some imported Shopify products mislabeled their native S–XXL or
    // numeric-size option as "Stitching". Recognize the values themselves so
    // shoppers do not receive a second, contradictory size selector. Require
    // multiple values to avoid treating an incidental one-letter option as a
    // size control.
    return values.length >= 2 && values.every(isConventionalProductSizeValue);
  });
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
