/**
 * Royal Bridal Silk Edit — Vol. 3 Middleware Fallback
 *
 * Ensures published Vol. 3 bridal lehenga handles linked from the homepage and
 * bridal collections resolve with a complete 200 SSR + hydrated PDP response
 * even before the Shopify catalog import finishes propagating. Live Shopify
 * lookups in middleware.ts always run first and take precedence automatically.
 */

import bridalVol3Catalog from '../data/bridalVol3Catalog.json' with { type: 'json' };
import type { ShopifyProduct } from './shopifyProxy.js';

const BRIDAL_VOL3_MAP = new Map<string, ShopifyProduct>();

for (const entry of bridalVol3Catalog.products) {
  if (!entry.published || entry.status !== 'active' || entry.images.length === 0) {
    continue;
  }

  const images = entry.images.map((img) => ({
    node: {
      url: img.shopifySrc,
      altText: img.alt || entry.title,
    },
  }));

  const primaryImage = images[0]?.node || null;

  const variants = entry.variants.map((variant) => ({
    node: {
      id: `gid://luxemia-preview/ProductVariant/${variant.sku}`,
      title: variant.size,
      sku: variant.sku,
      barcode: null,
      price: { amount: variant.price, currencyCode: 'USD' },
      compareAtPrice: variant.compareAtPrice
        ? { amount: variant.compareAtPrice, currencyCode: 'USD' }
        : null,
      availableForSale: Boolean(variant.availableForSale),
      image: primaryImage,
      selectedOptions: [{ name: 'Size', value: variant.size }],
    },
  }));

  BRIDAL_VOL3_MAP.set(entry.handle, {
    id: `gid://luxemia-preview/Product/${entry.skuBase}`,
    title: entry.title,
    description: entry.description,
    handle: entry.handle,
    vendor: entry.vendor || 'LuxeMia',
    productType: entry.productType || 'Bridal Lehenga',
    tags: entry.tags || [],
    availableForSale: variants.some((v) => v.node.availableForSale),
    shipsWithinMetafield: { value: entry.specs?.shipsWithin || '3-4 business days' },
    fabricMetafield: { value: entry.specs?.lehengaFabric || 'Bridal Silk' },
    materialMetafield: { value: 'Silk' },
    blouseFabricMetafield: { value: entry.specs?.blouseFabric || 'Bridal Silk' },
    colorMetafield: { value: entry.color },
    occasionMetafield: { value: 'Bridal, Wedding, Reception' },
    includedComponentsMetafield: { value: entry.specs?.includedPieces || null },
    careInstructionsMetafield: { value: entry.specs?.care || 'Professional dry clean only' },
    seo: {
      title: entry.seoTitle || null,
      description: entry.seoDescription || null,
    },
    priceRange: {
      minVariantPrice: { amount: entry.priceUsd, currencyCode: 'USD' },
    },
    compareAtPriceRange: {
      minVariantPrice: {
        amount: entry.compareAtPriceUsd || entry.priceUsd,
        currencyCode: 'USD',
      },
    },
    images: { edges: images },
    variants: { edges: variants },
    options: [
      {
        name: 'Size',
        values: entry.variants.map((variant) => variant.size),
      },
    ],
  });
}

export function getBridalVol3ProductByHandle(handle: string): ShopifyProduct | null {
  return BRIDAL_VOL3_MAP.get(handle) || null;
}
