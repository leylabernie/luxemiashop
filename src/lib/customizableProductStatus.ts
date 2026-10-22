// Pure registry/classification shared with Edge middleware; keep app-only types out.
import customizableProductsData from '../data/customizableProducts.json' with { type: 'json' };

export interface CustomizableProductRecord {
  handle: string;
  sku: string;
  title: string;
  etsyUrl: string;
  imageId: string;
}

export const CUSTOMIZABLE_PRODUCTS = customizableProductsData as CustomizableProductRecord[];

const customizableProductsByHandle = new Map(
  CUSTOMIZABLE_PRODUCTS.map((product) => [product.handle, product]),
);

export const CUSTOMIZABLE_PRODUCT_HANDLES = new Set(customizableProductsByHandle.keys());

export const getCustomizableProduct = (handle?: string | null): CustomizableProductRecord | undefined =>
  handle ? customizableProductsByHandle.get(handle) : undefined;

/**
 * The original customizable-product mapping identifies the verified designs
 * that also offer a confirmed custom color. Shopify now carries additional
 * made-to-order products whose catalog tags truthfully identify their status
 * but which do not offer the same custom-color promise.
 */
export const isCustomizableProduct = (handle?: string | null): boolean =>
  Boolean(handle && customizableProductsByHandle.has(handle));

const MADE_TO_ORDER_TAGS = new Set([
  'made to order',
  'availability:made to order',
  'custom-made',
]);

export const isMadeToOrderProduct = (
  handle?: string | null,
  tags?: string[] | null,
): boolean => {
  if (isCustomizableProduct(handle)) return true;
  return (tags || []).some((tag) => MADE_TO_ORDER_TAGS.has(tag.trim().toLowerCase()));
};
