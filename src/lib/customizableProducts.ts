import customizableProductsData from '@/data/customizableProducts.json';
import type { ShopifyProduct } from '@/lib/shopify';

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

export const CUSTOM_PRODUCT_TIMING =
  'The source listing carries an approximate 4–5 week total order window. LuxeMia confirms the current production time and carrier transit separately after the color, measurements, fabric availability, and delivery address are known; timing is not guaranteed until confirmed in writing.';

export const getCustomProductDescription = (title: string): string =>
  `${title}. Made to order from measurements confirmed with LuxeMia, with a custom color available for this design. ${CUSTOM_PRODUCT_TIMING} Contact LuxeMia before ordering for a fixed event date. Custom orders are final sale, subject to applicable law.`;

export const applyCustomizableProductDetails = (
  product: ShopifyProduct['node'],
): ShopifyProduct['node'] => {
  const matched = getCustomizableProduct(product.handle);
  if (!matched) return product;

  const description = getCustomProductDescription(matched.title);

  const safeTags = (product.tags || []).filter((tag) =>
    !/ready[- ]?to[- ]?ship|ships? within|worldwide|canada|australia|dhl|ddp/i.test(tag),
  );

  return {
    ...product,
    title: matched.title,
    description,
    descriptionHtml: `<p>${description}</p>`,
    tags: [...safeTags, 'customizable', 'made to order', 'custom color', 'custom measurements'],
    shipsWithin: null,
    shipsWithinMetafield: null,
    seo: {
      title: `${matched.title} | LuxeMia`,
      description,
    },
  };
};
