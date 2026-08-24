/**
 * Conservative product copy helpers.
 *
 * Product pages and feeds must use only fields present in Shopify plus the
 * published LuxeMia policy. This module deliberately avoids generated
 * craftsmanship, sizing, care, delivery-speed, or included-piece claims.
 */

export type ProductCategory =
  | 'lehenga'
  | 'saree'
  | 'suit'
  | 'salwar'
  | 'anarkali'
  | 'sharara'
  | 'sherwani'
  | 'kurta'
  | 'jewelry'
  | 'indo-western';

const SHIPPING_POLICY =
  'United States shipping only. Standard shipping is $12 below $135 and free at $135 and above; tracking is provided after dispatch.';

function cleanText(value?: string): string {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAttribute(value?: string): string {
  const cleaned = cleanText(value);
  if (!cleaned || /^(?:default title|unknown|n\/?a|none|premium fabric|fabric)$/i.test(cleaned)) {
    return '';
  }
  return cleaned;
}

function truncateAtWord(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const clipped = value.slice(0, Math.max(1, maxLength - 1));
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[\s,;:|–—-]+$/, '')}…`;
}

/**
 * Remove promotional or unverified fulfillment wording while preserving the
 * product's searchable color, fabric, garment type, and occasion terms.
 */
export function sanitizeProductTitle(value?: string): string {
  return cleanText(value)
    .replace(/^buy\s+/i, '')
    .replace(/\s*(?:[|–—-]\s*)?ready[-\s]?to[-\s]?ship\b/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?handcrafted indian bridal luxury\b/gi, '')
    .replace(/\bhandcrafted\s+/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?luxemia\s*$/gi, '')
    .replace(/\s*[|–—-]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Preserve useful, SKU-specific catalog information while stripping historic
 * fulfillment copy that is now superseded by the published LuxeMia policy.
 * Product descriptions are the only reliable source for details such as the
 * construction, care, blouse material, or can-can status of a given listing.
 */
function cleanCatalogDescription(value?: string): string {
  return cleanText(value)
    .replace(/(?:estimated\s+)?delivery\s*:\s*[^.]+\.?/gi, '')
    .replace(/U\.?S\.?\s+standard\s+shipping\s+is[^.]+\.?/gi, '')
    .replace(/Shipping\s+is\s+available\s+to\s+[^.]+\.?/gi, '')
    .replace(/Tracking\s+(?:is|details\s+are)\s+[^.]+\.?/gi, '')
    // Supplier imports sometimes claim a universal tailoring menu, unlimited
    // sizing, or a free alteration. Those promises are not valid for every
    // SKU. Product options and the custom-size handoff are the source of truth.
    .replace(/Can\s+be\s+customized\s+to\s+your\s+preferred\s+[^.]+\.?/gi, '')
    .replace(/Standard\s+customization(?:\s+at\s+no\s+extra\s+cost|\s+available)?\.?/gi, '')
    .replace(/Custom\s+Sizing\s*:\s*Available\s+in\s+all\s+sizes(?:\s+including\s+plus\s+sizes)?\.?/gi, '')
    .replace(/Available\s+in\s+all\s+sizes(?:\s+including\s+plus\s+sizes)?\.?/gi, '')
    .replace(/We\s+accommodate\s+every\s+body\s+type\s+with\s+our\s+made-to-measure\s+service\.?/gi, '')
    .replace(/Blouse\s+Customization\s*:\s*Choose\s+your\s+preferred\s+[^.]+\.?/gi, '')
    .replace(/Custom\s+sizing\s+is\s+available\s*[—-]?\s*provide\s+your\s+measurements\s+at\s+checkout\s+for\s+a\s+tailored\s+fit\.?/gi, 'If Custom is selected, LuxeMia confirms measurements before production.')
    .replace(/Provide\s+your\s+measurements\s+at\s+checkout\.?/gi, 'LuxeMia confirms measurements before production.')
    .replace(/Plus-size\s+friendly\.?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Build visible product copy from the current Shopify listing whenever it has
 * meaningful SKU-specific information. A concise, accurate fallback is used
 * only when the listing itself is thin.
 */
export function enrichProductDescription(
  description: string,
  productType: string,
  title: string,
  material?: string,
  color?: string,
): string {
  const catalogDescription = cleanCatalogDescription(description);
  if (catalogDescription.length >= 40) {
    return `${catalogDescription} ${SHIPPING_POLICY}`;
  }

  const safeTitle = sanitizeProductTitle(title) || 'Indian ethnic wear';
  const safeType = cleanAttribute(productType);
  const safeMaterial = cleanAttribute(material);
  const safeColor = cleanAttribute(color);
  const details: string[] = [`${safeTitle}.`];

  if (safeType) details.push(`Category: ${safeType}.`);
  if (safeColor) details.push(`Color: ${safeColor}.`);
  if (safeMaterial) details.push(`Material: ${safeMaterial}.`);

  details.push(
    'Review the product images and available options for the exact pieces, measurements, and current availability.',
    SHIPPING_POLICY,
  );

  return details.join(' ');
}

export function generateMetaDescription(
  _description: string,
  productType: string,
  title: string,
  _price?: string,
  color?: string,
  material?: string,
): string {
  const safeTitle = sanitizeProductTitle(title) || 'Indian ethnic wear';
  const safeType = cleanAttribute(productType);
  const safeColor = cleanAttribute(color);
  const safeMaterial = cleanAttribute(material);
  const attributes = [safeColor, safeMaterial, safeType].filter(Boolean).join(' ');
  const core = attributes ? `${safeTitle} — ${attributes}.` : `${safeTitle}.`;
  return truncateAtWord(
    `${core} Review exact options at LuxeMia. U.S. shipping is $12 below $135 and free at $135 and above.`,
    160,
  );
}

export function getProductCategoryDescription(productType: string): string {
  const safeType = cleanAttribute(productType) || 'Indian ethnic wear';
  return `Shop ${safeType} at LuxeMia. Review each listing for exact materials, included pieces, available variants, price, and availability. ${SHIPPING_POLICY}`;
}

export function runEnrichmentExamples(): {
  thinDescription: string;
  thinSaree: string;
  richDescriptionUnchanged: string;
  metaDescription: string;
  categoryDescription: string;
} {
  return {
    thinDescription: enrichProductDescription('', 'Lehenga', 'Red Embroidered Lehenga', 'Silk', 'Red'),
    thinSaree: enrichProductDescription('', 'Saree', 'Banarasi Silk Saree', 'Banarasi Silk'),
    richDescriptionUnchanged: enrichProductDescription('', 'Lehenga', 'Banarasi Silk Bridal Lehenga', 'Banarasi Silk', 'Red'),
    metaDescription: generateMetaDescription('', 'Lehenga', 'Red Embroidered Lehenga', undefined, 'Red', 'Silk'),
    categoryDescription: getProductCategoryDescription('Lehenga'),
  };
}
