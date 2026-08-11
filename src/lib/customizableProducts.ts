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

export const isCustomizableProduct = (handle?: string | null): boolean =>
  Boolean(handle && customizableProductsByHandle.has(handle));

export const CUSTOM_PRODUCT_DESCRIPTION =
  'Made to order from your confirmed measurements, with a custom color available for this design. Production normally takes approximately 3–5 weeks after LuxeMia confirms your requested color, measurements, and fabric availability; carrier transit starts after dispatch. Contact LuxeMia before ordering for a fixed event date. Custom orders are final sale, subject to applicable law.';

export const applyCustomizableProductDetails = (
  product: ShopifyProduct['node'],
): ShopifyProduct['node'] => {
  const matched = getCustomizableProduct(product.handle);
  if (!matched) return product;

  const safeTags = (product.tags || []).filter((tag) =>
    !/ready[- ]?to[- ]?ship|ships? within|worldwide|canada|australia|dhl|ddp/i.test(tag),
  );

  return {
    ...product,
    title: matched.title,
    description: CUSTOM_PRODUCT_DESCRIPTION,
    descriptionHtml: `<p>${CUSTOM_PRODUCT_DESCRIPTION}</p>`,
    tags: [...safeTags, 'customizable', 'made to order', 'custom color', 'custom measurements'],
    shipsWithin: null,
    shipsWithinMetafield: null,
    seo: {
      title: `${matched.title} | LuxeMia`,
      description: CUSTOM_PRODUCT_DESCRIPTION,
    },
  };
};
