/**
 * Shopify Proxy Module
 *
 * Handles fetching product data from Shopify Storefront API.
 * Includes in-memory caching for edge runtime performance.
 */

import { isHiddenBillingProductHandle } from '../lib/serviceAddOns';

const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';

export interface ShopifyImage { url: string; altText: string | null }
export interface ShopifyProduct {
  id: string; title: string; description: string; handle: string;
  vendor?: string; productType?: string; tags?: string[];
  availableForSale?: boolean;
  shipsWithinMetafield?: { value: string | null } | null;
  fabricMetafield?: { value: string | null } | null;
  materialMetafield?: { value: string | null } | null;
  blouseFabricMetafield?: { value: string | null } | null;
  colorMetafield?: { value: string | null } | null;
  occasionMetafield?: { value: string | null } | null;
  includedComponentsMetafield?: { value: string | null } | null;
  careInstructionsMetafield?: { value: string | null } | null;
  productStyleMetafield?: { value: string | null } | null;
  shopifyCategoryMetafield?: { value: string | null } | null;
  googleProductCategoryMetafield?: { value: string | null } | null;
  genderMetafield?: { value: string | null } | null;
  conditionMetafield?: { value: string | null } | null;
  seo?: { title?: string | null; description?: string | null };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: { id: string; title: string; sku?: string; barcode?: string | null; price: { amount: string; currencyCode: string }; compareAtPrice: { amount: string; currencyCode: string } | null; availableForSale: boolean; image?: ShopifyImage | null; selectedOptions?: Array<{ name: string; value: string }> } }> };
  options: Array<{ name: string; values: string[] }>;
}

export type ShopifyProductLookupResult =
  | { status: 'found'; product: ShopifyProduct }
  | { status: 'not_found' }
  | { status: 'unavailable' };

type CacheableShopifyProductLookupResult = Exclude<
  ShopifyProductLookupResult,
  { status: 'unavailable' }
>;

function isShopifyProduct(value: unknown): value is ShopifyProduct {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;

  const product = value as Partial<ShopifyProduct>;
  return (
    typeof product.handle === 'string'
    && typeof product.title === 'string'
    && typeof product.priceRange?.minVariantPrice?.amount === 'string'
    && typeof product.priceRange?.minVariantPrice?.currencyCode === 'string'
    && Array.isArray(product.images?.edges)
    && Array.isArray(product.variants?.edges)
    && Array.isArray(product.options)
  );
}

// productByHandle was deprecated in Shopify Storefront API 2022-04 and removed in 2024+.
// Use product(handle:) instead.
const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id title description handle vendor productType tags availableForSale
      shipsWithinMetafield: metafield(namespace: "custom", key: "ships_within") { value }
      fabricMetafield: metafield(namespace: "custom", key: "fabric") { value }
      materialMetafield: metafield(namespace: "custom", key: "material") { value }
      blouseFabricMetafield: metafield(namespace: "custom", key: "blouse_fabric") { value }
      colorMetafield: metafield(namespace: "custom", key: "color") { value }
      occasionMetafield: metafield(namespace: "custom", key: "occasion") { value }
      includedComponentsMetafield: metafield(namespace: "custom", key: "included_components") { value }
      careInstructionsMetafield: metafield(namespace: "custom", key: "care_instructions") { value }
      productStyleMetafield: metafield(namespace: "custom", key: "product_style") { value }
      shopifyCategoryMetafield: metafield(namespace: "custom", key: "shopify_category") { value }
      googleProductCategoryMetafield: metafield(namespace: "custom", key: "google_product_category") { value }
      genderMetafield: metafield(namespace: "custom", key: "gender") { value }
      conditionMetafield: metafield(namespace: "custom", key: "condition") { value }
      seo { title description }
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      images(first: 20) { edges { node { url altText } } }
      variants(first: 100) { edges { node { id title sku barcode price { amount currencyCode } compareAtPrice { amount currencyCode } availableForSale image { url altText } selectedOptions { name value } } } }
      options { name values }
    }
  }
`;

// Simple in-memory cache for product data (Edge runtime, per-cold-start).
// TTL of 2 minutes balances freshness against Shopify API call volume.
// When products are updated via Shopify CSV import, bot SSR HTML picks up
// the new title within at most 2 minutes of the next bot request.
const productCache = new Map<string, {
  result: CacheableShopifyProductLookupResult;
  timestamp: number;
}>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (was 10 — too stale after CSV imports)

export async function fetchProductByHandle(handle: string): Promise<ShopifyProductLookupResult> {
  if (isHiddenBillingProductHandle(handle)) return { status: 'not_found' };

  const cached = productCache.get(handle);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.result;
  }

  try {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: PRODUCT_BY_HANDLE_QUERY,
        variables: { handle },
      }),
    });

    if (!response.ok) {
      console.error('Middleware: Shopify returned an error for handle:', handle, response.status);
      return { status: 'unavailable' };
    }

    const payload = await response.json() as {
      data?: { product?: ShopifyProduct | null } | null;
      errors?: unknown;
    };

    if (
      payload?.errors !== undefined
      && (!Array.isArray(payload.errors) || payload.errors.length > 0)
    ) {
      console.error('Middleware: Shopify returned GraphQL errors for handle:', handle);
      return { status: 'unavailable' };
    }

    const product = payload?.data?.product;
    if (product === undefined || (product !== null && !isShopifyProduct(product))) {
      console.error('Middleware: Shopify returned a malformed product response for handle:', handle);
      return { status: 'unavailable' };
    }

    const result: CacheableShopifyProductLookupResult = product === null
      ? { status: 'not_found' }
      : { status: 'found', product };
    productCache.set(handle, { result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('Middleware: Shopify fetch failed for handle:', handle, error);
    return { status: 'unavailable' };
  }
}
