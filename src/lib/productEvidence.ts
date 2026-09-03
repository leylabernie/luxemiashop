/**
 * Returns true only when the supplied catalog text contains an explicit
 * menswear term. Word boundaries are intentional: a broad `includes('men')`
 * check misclassifies "women", "womenswear", and "women's" products.
 */
export function hasExplicitMenswearEvidence(
  productType?: string | null,
  tags?: string[] | null,
): boolean {
  const candidates = [productType || '', ...(tags || [])];

  return candidates.some((candidate) =>
    /\b(?:sherwani|kurta|menswear|men(?:'s)?)\b/i.test(candidate),
  );
}

interface ProductCustomizationEvidence {
  tags?: string[] | null;
  options?: Array<{ name: string; values: string[] }> | null;
}

function normalizedOptionValues(values?: string[] | null): string[] {
  return (values || [])
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value && value !== 'default title');
}

function hasPrefixedCustomizationTag(
  tags: string[] | null | undefined,
  factPattern: RegExp,
): boolean {
  return (tags || []).some((tag) => {
    const normalized = tag.trim().toLowerCase();
    const separator = normalized.indexOf(':');
    if (separator < 1) return false;
    const prefix = normalized.slice(0, separator).trim();
    const value = normalized.slice(separator + 1).trim();
    if (!['customization', 'customisation', 'custom option', 'custom-option'].includes(prefix)) return false;
    return factPattern.test(value);
  });
}

/** A color request is supported only by an explicit custom-color option or fact tag. */
export function hasExplicitCustomColorEvidence(product?: ProductCustomizationEvidence | null): boolean {
  if (!product) return false;
  const hasOption = (product.options || []).some((option) => {
    const name = option.name.trim().toLowerCase();
    const values = normalizedOptionValues(option.values);
    return /^(?:custom(?:izable)?\s+colou?r|colou?r\s+request)$/.test(name)
      && values.length > 0;
  });
  return hasOption || hasPrefixedCustomizationTag(
    product.tags,
    /^(?:custom\s+colou?r|colou?r\s+(?:choice|request|available)|colou?r)$/,
  );
}

/** Measurements are supported only by a Custom size/value, measurement option, or fact tag. */
export function hasExplicitCustomMeasurementEvidence(product?: ProductCustomizationEvidence | null): boolean {
  if (!product) return false;
  const hasOption = (product.options || []).some((option) => {
    const name = option.name.trim().toLowerCase();
    const values = normalizedOptionValues(option.values);
    if (/^(?:custom\s+measurements?|measurements?|made[-\s]+to[-\s]+measure)$/.test(name)) {
      return values.length > 0;
    }
    return /^(?:size|standard size|blouse size|bust size|chest size|stitching size)$/.test(name)
      && values.some((value) => /^(?:custom|custom size|made[-\s]+to[-\s]+measure)$/.test(value));
  });
  return hasOption || hasPrefixedCustomizationTag(
    product.tags,
    /^(?:custom\s+(?:size|measurements?)|measurements?|made[-\s]+to[-\s]+measure)$/,
  );
}

export function hasExplicitCustomizationEvidence(product?: ProductCustomizationEvidence | null): boolean {
  return hasExplicitCustomColorEvidence(product)
    || hasExplicitCustomMeasurementEvidence(product);
}
