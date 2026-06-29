/**
 * Shared Shopify product type.
 *
 * Previously lived in src/data/localProducts.ts, but was moved here when
 * localProducts.ts was deleted (it contained stale hardcoded product data
 * scraped from wholesalesalwar.com that was causing product titles to appear
 * out-of-date after Shopify CSV imports).
 *
 * Now this type is the single source of truth for the Shopify product shape
 * used by hooks, components, and lib files throughout the app.
 */

export type ShopifyProductNode = {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  availableForSale?: boolean;
  createdAt?: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku?: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        } | null;
        availableForSale: boolean;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
  options: Array<{
    name: string;
    values: string[];
  }>;
};
