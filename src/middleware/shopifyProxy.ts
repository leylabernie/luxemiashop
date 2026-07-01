/**
 * Shopify Proxy Module
 *
 * Handles fetching product data from Shopify Storefront API.
 * Includes in-memory caching for edge runtime performance.
 */

const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';

export interface ShopifyImage { url: string; altText: string | null }
export interface ShopifyProduct {
  id: string; title: string; description: string; handle: string;
  vendor?: string; productType?: string; tags?: string[];
  availableForSale?: boolean;
  seo?: { title?: string | null; description?: string | null };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: { id: string; title: string; sku?: string; price: { amount: string; currencyCode: string }; compareAtPrice: { amount: string; currencyCode: string } | null; availableForSale: boolean } }> };
  options: Array<{ name: string; values: string[] }>;
}

// productByHandle was deprecated in Shopify Storefront API 2022-04 and removed in 2024+.
// Use product(handle:) instead.
const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id title description handle vendor productType tags availableForSale
      seo { title description }
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      images(first: 5) { edges { node { url altText } } }
      variants(first: 5) { edges { node { id title sku price { amount currencyCode } compareAtPrice { amount currencyCode } availableForSale } } }
      options { name values }
    }
  }
`;

// Simple in-memory cache for product data (Edge runtime, per-cold-start).
// TTL of 2 minutes balances freshness against Shopify API call volume.
// When products are updated via Shopify CSV import, bot SSR HTML picks up
// the new title within at most 2 minutes of the next bot request.
const productCache = new Map<string, { data: ShopifyProduct | null; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (was 10 — too stale after CSV imports)

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const cached = productCache.get(handle);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
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

    if (!response.ok) return null;

    const data = await response.json();
    const product = data?.data?.product || null;

    productCache.set(handle, { data: product, timestamp: Date.now() });
    return product;
  } catch (error) {
    console.error('Middleware: Shopify fetch failed for handle:', handle, error);
    return null;
  }
}
