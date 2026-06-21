/**
 * Unified Product SEO Data Module
 */

import sareeData from '../data/sareeSeoData';
import suitData from '../data/suitSeoData';
import menswearData from '../data/menswearSeoData';

export interface QAItem {
  question: string;
  answer: string;
}

export interface ProductSeoRecord {
  original_name: string;
  seo_title: string;
  seo_description: string;
  corrected_title: string;
  meta_description: string;
  keywords: string[];
  long_tail_keywords: string[];
  category: string;
  fabric: string;
  work: string;
  occasion: string;
  color: string;
  price_usd: number;
  image_alt_text: string;
  qa_pairs: QAItem[];
}

export const SAREE_PRODUCTS_SEO: ProductSeoRecord[] = (sareeData as any).products ?? [];
export const SUIT_PRODUCTS_SEO: ProductSeoRecord[] = (suitData as any).products ?? [];
export const MENSWEAR_PRODUCTS_SEO: ProductSeoRecord[] = (menswearData as any).products ?? [];

export const ALL_PRODUCTS_SEO: ProductSeoRecord[] = [
  ...SAREE_PRODUCTS_SEO,
  ...SUIT_PRODUCTS_SEO,
  ...MENSWEAR_PRODUCTS_SEO,
];

function normalizeProductName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function buildLookupMap(records: ProductSeoRecord[]): Map<string, ProductSeoRecord> {
  const map = new Map<string, ProductSeoRecord>();
  for (const record of records) {
    const key = normalizeProductName(record.original_name);
    map.set(key, record);
  }
  return map;
}

const SEO_LOOKUP = buildLookupMap(ALL_PRODUCTS_SEO);

export function getProductSeoData(productName: string): ProductSeoRecord | undefined {
  if (!productName) return undefined;
  return SEO_LOOKUP.get(normalizeProductName(productName));
}

export function getKeywords(productName: string): string[] {
  return getProductSeoData(productName)?.keywords ?? [];
}

export function getLongTailKeywords(productName: string): string[] {
  return getProductSeoData(productName)?.long_tail_keywords ?? [];
}

export function getQAPairs(productName: string): QAItem[] {
  return getProductSeoData(productName)?.qa_pairs ?? [];
}

export function getImageAltText(productName: string): string {
  return getProductSeoData(productName)?.image_alt_text ?? '';
}

export function getMetaDescription(productName: string): string {
  return getProductSeoData(productName)?.meta_description ?? '';
}

export function getCorrectedTitleFromSeo(productName: string): string {
  return getProductSeoData(productName)?.corrected_title ?? '';
}

export function getSeoTitle(productName: string): string {
  return getProductSeoData(productName)?.seo_title ?? '';
}

export function hasProductSeoData(productName: string): boolean {
  return !!productName && SEO_LOOKUP.has(normalizeProductName(productName));
}
