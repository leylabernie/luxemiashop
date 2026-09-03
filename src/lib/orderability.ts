interface AvailabilityVariant {
  id?: string;
  availableForSale?: boolean;
}

interface AvailabilityProduct {
  availableForSale?: boolean;
  variants?: {
    edges?: Array<{ node: AvailabilityVariant }>;
  };
}

/**
 * Shopify inventory is orderable only when both the parent product and at
 * least one concrete variant are explicitly available. Missing availability
 * is treated as unknown, never as permission to sell.
 */
export const isProductExplicitlyOrderable = (
  product: AvailabilityProduct | null | undefined,
): boolean => (
  product?.availableForSale === true
  && product.variants?.edges?.some(({ node }) => node.availableForSale === true) === true
);

/**
 * Verifies the exact Shopify variant that will be submitted to checkout.
 */
export const isVariantExplicitlyOrderable = (
  product: AvailabilityProduct | null | undefined,
  variantId: string | null | undefined,
): boolean => (
  product?.availableForSale === true
  && Boolean(variantId)
  && product.variants?.edges?.some(({ node }) => (
    node.id === variantId && node.availableForSale === true
  )) === true
);
