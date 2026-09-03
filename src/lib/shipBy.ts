import type { ShopifyProduct } from '@/lib/shopify';

type ShopifyProductNode = ShopifyProduct['node'];

function getRawProcessingEstimate(product?: ShopifyProductNode | null): string | number | null {
  if (!product) return null;

  const metafieldValue = product.shipsWithinMetafield?.value?.trim();
  if (metafieldValue) return metafieldValue;

  if (product.shipsWithinDays !== null && product.shipsWithinDays !== undefined) {
    return product.shipsWithinDays;
  }

  return product.shipsWithin ?? null;
}

/**
 * Return a numeric handling-time value only when the catalog supplies one
 * unambiguously. Ranges and prose are not collapsed into a guessed number.
 */
export function getProductShipsWithin(product?: ShopifyProductNode | null): number | null {
  const raw = getRawProcessingEstimate(product);
  if (raw === null || raw === undefined || raw === '') return null;

  const days = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(days) || days <= 0) return null;
  return days;
}

/**
 * Preserve the listing's processing estimate without calculating a calendar
 * dispatch date or assuming a locale, calendar rules, or carrier.
 */
export function getProcessingEstimateLabel(product?: ShopifyProductNode | null): string | null {
  const raw = getRawProcessingEstimate(product);
  if (raw === null || raw === undefined || raw === '') return null;

  const suppliedValue = String(raw).trim();
  if (!suppliedValue) return null;

  const numericDays = Number(suppliedValue);
  const estimate = Number.isFinite(numericDays) && numericDays > 0
    ? `within ${numericDays} ${numericDays === 1 ? 'day' : 'days'}`
    : suppliedValue;

  return `Listing processing estimate: ${estimate}. Carrier transit and delivery timing are separate.`;
}
