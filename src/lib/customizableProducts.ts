import type { ShopifyProduct } from '@/lib/shopify';
import { getCustomizableProduct } from './customizableProductStatus.js';
export {
  CUSTOMIZABLE_PRODUCTS, CUSTOMIZABLE_PRODUCT_HANDLES, getCustomizableProduct,
  isCustomizableProduct, isMadeToOrderProduct,
} from './customizableProductStatus.js';
export type { CustomizableProductRecord } from './customizableProductStatus.js';

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
