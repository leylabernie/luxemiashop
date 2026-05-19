/**
 * Unified Product SEO Data Module
 * =================================================================
 *
 * Imports SEO-optimized data from saree, suit, and menswear catalog agents.
 * Provides a single source of truth for product-level SEO metadata:
 * - Corrected titles, meta descriptions, image alt text
 * - Keywords and long-tail keywords
 * - FAQ Q&A pairs for structured data
 *
 * Data sources:
 * - Saree SEO: 30 products (src/data/sareeSeoData.json)
 * - Suit SEO: 29 products (src/data/suitSeoData.json)
 * - Menswear SEO: 29 products (src/data/menswearSeoData.json)
 * - Lehenga SEO: 130 corrections (titleCorrections.ts — separate module)
 *
 * Total: 88 products + 130 lehenga handle corrections = 218 SEO-enriched items
 *
 * @module productSeoData
 */

// JSON data loaded as modules — Vite handles these natively
import sareeData from '../data/sareeSeoData.json';
import suitData from '../data/suitSeoData.json';
import menswearData from '../data/menswearSeoData.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single FAQ question/answer pair for structured data injection. */
export interface QAItem {
  question: string;
  answer: string;
}

/** Complete SEO record for a single product. */
export interface ProductSeoRecord {
  /** Original Shopify product name (matching key). */
  original_name: string;
  /** SEO-optimized HTML <title> tag content. */
  seo_title: string;
  /** SEO-optimized meta description (160 chars). */
  seo_description: string;
  /** Human-readable corrected product title. */
  corrected_title: string;
  /** Meta description for search results. */
  meta_description: string;
  /** Primary keywords for the product. */
  keywords: string[];
  /** Long-tail keyword phrases for content optimization. */
  long_tail_keywords: string[];
  /** Product category: saree | suit | menswear. */
  category: string;
  /** Fabric material. */
  fabric: string;
  /** Work/embroidery type. */
  work: string;
  /** Occasion the product is designed for. */
  occasion: string;
  /** Dominant color. */
  color: string;
  /** USD retail price. */
  price_usd: number;
  /** SEO-optimized image alt text. */
  image_alt_text: string;
  /** FAQ Q&A pairs for schema injection. */
  qa_pairs: QAItem[];
}

/** Raw JSON wrapper shape — each file wraps products in a "products" array. */
interface SeoDataFile {
  products: ProductSeoRecord[];
}

// ---------------------------------------------------------------------------
// Data Loading
// ---------------------------------------------------------------------------

/** All saree product SEO records (30 items). */
export const SAREE_PRODUCTS_SEO: ProductSeoRecord[] = (sareeData as SeoDataFile).products ?? [];

/** All suit product SEO records (29 items). */
export const SUIT_PRODUCTS_SEO: ProductSeoRecord[] = (suitData as SeoDataFile).products ?? [];

/** All menswear product SEO records (29 items). */
export const MENSWEAR_PRODUCTS_SEO: ProductSeoRecord[] = (menswearData as SeoDataFile).products ?? [];

/** Combined array of all 88 product SEO records. */
export const ALL_PRODUCTS_SEO: ProductSeoRecord[] = [
  ...SAREE_PRODUCTS_SEO,
  ...SUIT_PRODUCTS_SEO,
  ...MENSWEAR_PRODUCTS_SEO,
];

// ---------------------------------------------------------------------------
// Lookup Map (normalized name → record)
// ---------------------------------------------------------------------------

/** Build a case-insensitive, whitespace-normalized lookup map. */
function buildLookupMap(records: ProductSeoRecord[]): Map<string, ProductSeoRecord> {
  const map = new Map<string, ProductSeoRecord>();
  for (const record of records) {
    const key = normalizeProductName(record.original_name);
    map.set(key, record);
  }
  return map;
}

/** Normalize a product name for fuzzy matching. */
function normalizeProductName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

const SEO_LOOKUP = buildLookupMap(ALL_PRODUCTS_SEO);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve the full SEO record for a product by its original name.
 *
 * Performs case-insensitive, whitespace-normalized matching on `original_name`.
 * Returns `undefined` if the product is not found in the SEO dataset.
 *
 * @param productName - The original Shopify product title.
 * @returns The ProductSeoRecord or undefined.
 */
export function getProductSeoData(productName: string): ProductSeoRecord | undefined {
  if (!productName) return undefined;
  return SEO_LOOKUP.get(normalizeProductName(productName));
}

/**
 * Get primary keywords for a product.
 *
 * @param productName - The original Shopify product title.
 * @returns Array of keyword strings, or empty array if not found.
 */
export function getKeywords(productName: string): string[] {
  return getProductSeoData(productName)?.keywords ?? [];
}

/**
 * Get long-tail keywords for a product.
 *
 * @param productName - The original Shopify product title.
 * @returns Array of long-tail keyword strings, or empty array if not found.
 */
export function getLongTailKeywords(productName: string): string[] {
  return getProductSeoData(productName)?.long_tail_keywords ?? [];
}

/**
 * Get FAQ Q&A pairs for structured data / schema injection.
 *
 * @param productName - The original Shopify product title.
 * @returns Array of QAItem objects, or empty array if not found.
 */
export function getQAPairs(productName: string): QAItem[] {
  return getProductSeoData(productName)?.qa_pairs ?? [];
}

/**
 * Get SEO-optimized image alt text for a product.
 *
 * @param productName - The original Shopify product title.
 * @returns SEO-optimized alt text string, or empty string if not found.
 */
export function getImageAltText(productName: string): string {
  return getProductSeoData(productName)?.image_alt_text ?? '';
}

/**
 * Get SEO-optimized meta description for a product.
 *
 * @param productName - The original Shopify product title.
 * @returns Meta description string, or empty string if not found.
 */
export function getMetaDescription(productName: string): string {
  return getProductSeoData(productName)?.meta_description ?? '';
}

/**
 * Get the corrected title for a product.
 *
 * @param productName - The original Shopify product title.
 * @returns Corrected human-readable title, or empty string if not found.
 */
export function getCorrectedTitleFromSeo(productName: string): string {
  return getProductSeoData(productName)?.corrected_title ?? '';
}

/**
 * Get the SEO title (for <title> tag) for a product.
 *
 * @param productName - The original Shopify product title.
 * @returns SEO title string including LuxeMia branding, or empty string if not found.
 */
export function getSeoTitle(productName: string): string {
  return getProductSeoData(productName)?.seo_title ?? '';
}

/**
 * Check whether a product has SEO data available.
 *
 * @param productName - The original Shopify product title.
 * @returns True if SEO data exists for this product.
 */
export function hasProductSeoData(productName: string): boolean {
  return !!productName && SEO_LOOKUP.has(normalizeProductName(productName));
}
