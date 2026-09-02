import { isConventionalProductSizeValue } from './productOptionNames.ts';

export interface VariantOptionLike {
  name: string;
  value: string;
}

export interface ProductVariantLike {
  availableForSale?: boolean;
  selectedOptions: VariantOptionLike[];
}

const INCLUDED_PIECE_PREFIXES = [
  'included:',
  'included pieces:',
  'pieces:',
  'set includes:',
  'package includes:',
];

export function selectedOptionsFromVariant(
  variant: ProductVariantLike,
): Record<string, string> {
  return Object.fromEntries(
    variant.selectedOptions.map((option) => [option.name, option.value]),
  );
}

/**
 * Resolves an option click to a real, available Shopify variant. If the
 * shopper's current combination does not exist, the closest variant that
 * contains the clicked value wins. This keeps linked options such as
 * `Custom / Custom Stitching` together instead of producing an impossible
 * selection.
 */
export function resolveAvailableVariantForOption<T extends ProductVariantLike>(
  variants: T[],
  currentSelections: Record<string, string>,
  optionName: string,
  optionValue: string,
): T | null {
  const candidates = variants.filter((variant) =>
    variant.availableForSale !== false
    && variant.selectedOptions.some(
      (option) => option.name === optionName && option.value === optionValue,
    ),
  );

  let bestCandidate: T | null = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    const score = candidate.selectedOptions.reduce((matches, option) => {
      if (option.name === optionName) return matches;
      return matches + (currentSelections[option.name] === option.value ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestCandidate = candidate;
      bestScore = score;
    }
  }

  return bestCandidate;
}

export function isVariantOptionValueAvailable(
  variants: ProductVariantLike[],
  optionName: string,
  optionValue: string,
): boolean {
  return variants.some((variant) =>
    variant.availableForSale !== false
    && variant.selectedOptions.some(
      (option) => option.name === optionName && option.value === optionValue,
    ),
  );
}

/** Standard and semi-stitched selections are fixed catalog choices, not a
 * request for a second measurement. Custom or explicitly stitched choices
 * may still require a measurement when no native Shopify size supplies it. */
export function selectionRequiresSeparateMeasurements(
  optionName: string,
  optionValue: string,
): boolean {
  const normalizedName = optionName.trim().toLowerCase();
  const normalizedValue = optionValue.trim().toLowerCase();

  // Imported products sometimes put native S–6XL or numeric sizes under an
  // option named "Stitching". The value is still a complete Shopify size,
  // not a request for another measurement or tailoring workflow.
  if (isConventionalProductSizeValue(normalizedValue)) return false;

  const isTailoringSelection = normalizedName.includes('stitch')
    || normalizedName.includes('tailor')
    || normalizedValue.includes('stitch')
    || normalizedValue.includes('made to measure')
    || normalizedValue.includes('made-to-measure');

  if (!isTailoringSelection) return false;

  // Custom intent always wins even when a supplier label also contains a
  // fixed-choice word such as "Standard".
  if (/\b(?:custom|bespoke|made[-\s]+to[-\s]+measure)\b/.test(normalizedValue)) {
    return true;
  }

  if (/\b(?:semi[-\s]?stitched|unstitched)\b/.test(normalizedValue)) return false;

  return ![
    /^standard(?:\s+(?:size|stitching))?$/,
    /^none$/,
    /^no\s+stitching$/,
    /^not\s+required$/,
  ].some((pattern) => pattern.test(normalizedValue));
}

export function inferIncludedPiecesFromTitle(
  productTitle = '',
  tags: string[] = [],
): string | undefined {
  const title = productTitle.replace(/\s+/g, ' ').trim();
  if (!title) return undefined;

  const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());
  const hasThreePieceEvidence = /\b(?:three|3)[-\s]?piece\b/i.test(title)
    || normalizedTags.some((tag) => /^(?:three|3)[-\s]?piece(?:\s+suit|\s+set)?$/.test(tag));
  const hasDupatta = /\bwith\b[^|,;]{0,48}\bdupatta\b/i.test(title);

  // Only infer components when the title, or an explicit three-piece tag for
  // an imported suit set, names the garments. Product type alone is never
  // enough evidence.
  if (hasThreePieceEvidence && hasDupatta && /\bpalazzo\b/i.test(title)) {
    return 'Tunic, palazzo pants, and dupatta';
  }
  if (hasThreePieceEvidence && hasDupatta && /\bsharara\b/i.test(title)) {
    return 'Tunic, sharara pants, and dupatta';
  }
  if (hasThreePieceEvidence && hasDupatta && /\bgharara\b/i.test(title)) {
    return 'Tunic, gharara pants, and dupatta';
  }
  if (hasDupatta && /\bsalwar\s+kameez\b/i.test(title)) {
    return 'Kameez, salwar pants, and dupatta';
  }
  if (hasThreePieceEvidence && hasDupatta && /\b(?:salwar\s+)?suit\b/i.test(title)) {
    return 'Tunic, pants, and dupatta';
  }
  if (hasDupatta && /\blehenga\s+choli\b/i.test(title)) {
    return 'Lehenga, choli, and dupatta';
  }
  if (hasDupatta && /\blehenga\b/i.test(title)) {
    return 'Lehenga and dupatta';
  }
  if (/\bsaree\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bblouse\s+(?:piece|fabric|material)\b/i.test(title)) {
    return 'Saree and blouse fabric';
  }
  if (/\bsherwani\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bstole\b/i.test(title)) {
    return 'Sherwani and stole';
  }
  if (/\bkurta\s+(?:pajama|pyjama)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bvest\b/i.test(title)) {
    return 'Kurta, pajama pants, and vest';
  }
  if (/\bkurta\s+(?:pajama|pyjama)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bjacket\b/i.test(title)) {
    return 'Kurta, pajama pants, and jacket';
  }

  return undefined;
}

/**
 * Uses only listing-backed set contents: normalized metadata first, then one
 * exact included-pieces tag, and finally conservative title/tag evidence.
 * Product type alone is never used to invent set contents.
 */
export function resolveIncludedPieces(
  metadataIncludedComponents: string[] | null | undefined,
  tags: string[] = [],
  productTitle = '',
): string | undefined {
  const metadataComponents = (metadataIncludedComponents ?? [])
    .map((component) => component.trim())
    .filter(Boolean);
  if (metadataComponents.length > 0) {
    return [...new Set(metadataComponents)].join(', ');
  }

  const includedPiecesTag = tags.find((tag) =>
    INCLUDED_PIECE_PREFIXES.some((prefix) =>
      tag.trim().toLowerCase().startsWith(prefix),
    ),
  );
  if (includedPiecesTag) {
    const trimmedTag = includedPiecesTag.trim();
    const matchedPrefix = INCLUDED_PIECE_PREFIXES.find((prefix) =>
      trimmedTag.toLowerCase().startsWith(prefix),
    );
    const includedPieces = matchedPrefix
      ? trimmedTag.slice(matchedPrefix.length).trim()
      : '';
    if (includedPieces) return includedPieces;
  }

  return inferIncludedPiecesFromTitle(productTitle, tags);
}
