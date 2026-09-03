/**
 * Conservative product copy helpers.
 *
 * Product pages and feeds must use only fields present in Shopify plus the
 * published LuxeMia policy. This module deliberately avoids generated
 * craftsmanship, sizing, care, delivery-speed, or included-piece claims.
 */

import type { ShopifyProduct } from '@/lib/shopify';
import { parseIncludedComponentsMetafield } from '@/lib/includedComponents';
import { resolveIncludedPieces } from '@/lib/productPurchaseFlow';

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
  'Shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above; other destination rates are listed in the current shipping policy. When tracking is issued, carrier scans can appear after label creation.';

const DESTINATION_POLICY =
  'Shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review destination-specific rates on the shipping page; checkout is the final source of truth.';

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

function removeSupersededIncludedPiecesClaims(value: string): string {
  return cleanText(value
    .replace(/\b(?:blouse|choli)\s+(?:piece|fabric|material)\s+included\b[^.!?]*[.!?]?/gi, ' ')
    .replace(/\b(?:included pieces|set includes|package includes|includes)\s*[:-]?\s*[^.!?]{1,180}[.!?]?/gi, ' '));
}

function explicitTagValues(tags: string[] | undefined, prefixes: string[]): string[] {
  const normalizedPrefixes = prefixes.map((prefix) => `${prefix.toLowerCase()}:`);
  return [...new Set((tags || [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => normalizedPrefixes.some((prefix) => tag.toLowerCase().startsWith(prefix)))
    .map((tag) => cleanAttribute(tag.slice(tag.indexOf(':') + 1)))
    .filter(Boolean))];
}

function parseExplicitStringList(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed
      .filter((item): item is string => typeof item === 'string')
      .map(cleanAttribute)
      .filter(Boolean))];
  } catch {
    return [];
  }
}

function listedOptionValues(product: ShopifyProduct['node'], names: string[]): string[] {
  const normalizedNames = new Set(names.map((name) => name.toLowerCase()));
  const option = product.options?.find((candidate) =>
    normalizedNames.has((candidate.name || '').trim().toLowerCase()),
  );
  return [...new Set((option?.values || [])
    .map(cleanAttribute)
    .filter((value) => value && value.toLowerCase() !== 'default title'))];
}

function verifiedPrimaryStyleReference(product: ShopifyProduct['node']): string {
  const skus = [...new Set((product.variants?.edges || [])
    .map((edge) => cleanAttribute(edge.node?.sku))
    .filter(Boolean))];
  if (skus.length === 0) return '';
  if (skus.length === 1) return skus[0].slice(0, 80);

  let commonPrefix = skus[0];
  for (const sku of skus.slice(1)) {
    let index = 0;
    const limit = Math.min(commonPrefix.length, sku.length);
    while (index < limit && commonPrefix[index] === sku[index]) index += 1;
    commonPrefix = commonPrefix.slice(0, index);
    if (!commonPrefix) break;
  }

  const sharedReference = commonPrefix.replace(/[\s._/-]+$/g, '').trim();
  const reference = sharedReference.length >= 6 || /\d/.test(sharedReference)
    ? sharedReference
    : skus[0];
  return reference.slice(0, 80);
}

function processingEstimate(product: ShopifyProduct['node']): string {
  const raw = product.shipsWithinMetafield?.value?.trim();
  if (!raw) return '';
  const numericDays = Number(raw);
  const suppliedEstimate = Number.isFinite(numericDays) && numericDays > 0
    ? `within ${numericDays} ${numericDays === 1 ? 'day' : 'days'}`
    : raw;
  return `Listing processing estimate: ${suppliedEstimate}. Carrier transit and delivery timing are separate.`;
}

/**
 * Build the only description that may replace a live Shopify product record.
 * Unstructured supplier prose is omitted unless the exact listing carries the
 * reviewed `facts:source-verified` marker. All other facts come from explicit
 * metafields, prefixed fact tags, real options, identifiers, and policy copy.
 */
export function buildVerifiedProductCopy(product?: ShopifyProduct['node'] | null): string {
  if (!product) return '';

  const styleReference = verifiedPrimaryStyleReference(product);
  const styleReferenceCopy = styleReference ? `Style reference: ${styleReference}.` : '';

  const sourceVerified = (product.tags || []).some((tag) =>
    tag.trim().toLowerCase() === 'facts:source-verified',
  );
  const metadata = product.metadata;
  const includedPieces = resolveIncludedPieces(
    parseIncludedComponentsMetafield(product.includedComponentsMetafield?.value)
      || metadata?.includedComponents,
    product.tags,
  );
  const rawVerifiedDescription = sourceVerified
    ? cleanCatalogDescription(product.description || '')
    : '';
  const verifiedDescription = includedPieces
    ? removeSupersededIncludedPiecesClaims(rawVerifiedDescription)
    : rawVerifiedDescription;
  if (verifiedDescription.length >= 80) {
    const authoritativeComponents = includedPieces ? `Listed components: ${includedPieces}.` : '';
    return cleanText(`${styleReferenceCopy} ${verifiedDescription} ${authoritativeComponents} ${DESTINATION_POLICY}`);
  }

  const isJewelry = /\b(?:jewel|jewell|necklace|choker|earring|bangle|bracelet|ring|maang\s*tikka|anklet|kundan|polki)\b/i
    .test(`${product.productType || ''} ${product.title || ''}`);
  const title = sanitizeProductTitle(product.title || product.handle || 'Product');
  const colors = [
    cleanAttribute(product.colorMetafield?.value || metadata?.color || ''),
    ...explicitTagValues(product.tags, ['color']),
    ...(!isJewelry ? listedOptionValues(product, ['color', 'colour']) : []),
  ].filter(Boolean);
  const materials = [
    cleanAttribute(product.fabricMetafield?.value || metadata?.fabric || ''),
    cleanAttribute(product.materialMetafield?.value || metadata?.material || ''),
    ...explicitTagValues(product.tags, ['fabric', 'material']),
    ...(!isJewelry ? listedOptionValues(product, ['fabric', 'material']) : []),
  ].filter(Boolean);
  const work = [
    cleanAttribute(metadata?.work || ''),
    ...explicitTagValues(product.tags, ['work', 'embroidery', 'embellishment']),
  ].filter(Boolean);
  const care = [
    cleanAttribute(product.careInstructionsMetafield?.value || metadata?.careInstructions || ''),
    ...explicitTagValues(product.tags, ['care', 'care instructions']),
  ].filter(Boolean);
  const occasions = [
    ...parseExplicitStringList(product.occasionMetafield?.value),
    ...(metadata?.occasion || []).map(cleanAttribute).filter(Boolean),
    ...explicitTagValues(product.tags, ['occasion']),
  ];
  const sizes = isJewelry
    ? []
    : listedOptionValues(product, ['size', 'standard size', 'blouse size', 'bust size', 'chest size', 'waist size', 'men size', 'mens size', "men's size"]);
  const parts = [`${title}.`];

  if (styleReferenceCopy) parts.push(styleReferenceCopy);
  if (cleanAttribute(product.productType)) parts.push(`Category: ${cleanAttribute(product.productType)}.`);
  if (colors.length > 0) parts.push(`Listed color${colors.length === 1 ? '' : 's'}: ${[...new Set(colors)].join(', ')}.`);
  if (materials.length > 0) parts.push(`Listed material${materials.length === 1 ? '' : 's'}: ${[...new Set(materials)].join(', ')}.`);
  if (work.length > 0) parts.push(`Listed work: ${[...new Set(work)].join(', ')}.`);
  if (care.length > 0) parts.push(`Listed care: ${[...new Set(care)].join(', ')}.`);
  if (includedPieces) parts.push(`Listed components: ${includedPieces}.`);
  if (occasions.length > 0) parts.push(`Listed occasion${occasions.length === 1 ? '' : 's'}: ${[...new Set(occasions)].join(', ')}.`);
  if (sizes.length > 0) parts.push(`Available options: ${sizes.join(', ')}.`);

  const suppliedProcessingEstimate = processingEstimate(product);
  if (suppliedProcessingEstimate) parts.push(suppliedProcessingEstimate);
  parts.push(
    'No additional material, construction, care, fit, or included-piece claim is supplied unless it appears above as a listing-backed attribute.',
    DESTINATION_POLICY,
  );

  return cleanText(parts.join(' '));
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
    `${core} Review exact options at LuxeMia. U.S. shipping is $14.99 below $199 and free at $199 and above.`,
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
