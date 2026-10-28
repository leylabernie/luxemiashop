import { ALTERATION_TIMING_NOTICE } from '../config/shippingPolicy.js';
import type { ShopifyProduct } from '@/lib/shopify';
import { getCustomizableProduct } from './customizableProductStatus.js';
export {
  CUSTOMIZABLE_PRODUCTS, CUSTOMIZABLE_PRODUCT_HANDLES, getCustomizableProduct,
  isCustomizableProduct, isMadeToOrderProduct,
} from './customizableProductStatus.js';
export type { CustomizableProductRecord } from './customizableProductStatus.js';

export const CUSTOM_PRODUCT_TIMING = ALTERATION_TIMING_NOTICE;

export const getCustomProductDescription = (title: string): string =>
  `${title}. Fit or color changes are requests requiring LuxeMia confirmation; no custom color or new construction is promised. ${CUSTOM_PRODUCT_TIMING} Contact LuxeMia before ordering for a fixed event date. Custom orders are final sale, subject to applicable law.`;

export const applyCustomizableProductDetails = (
  product: ShopifyProduct['node'],
): ShopifyProduct['node'] => {
  const matched = getCustomizableProduct(product.handle);
  if (!matched) return product;

  const description = [product.description, getCustomProductDescription(matched.title)].filter(Boolean).join(' ');

  const safeTags = (product.tags || []).filter((tag) =>
    !/ready[- ]?to[- ]?ship|ships? within|worldwide|canada|australia|dhl|ddp/i.test(tag),
  );

  return {
    ...product,
    title: matched.title,
    description,
    descriptionHtml: `<p>${description}</p>`,
    tags: [...safeTags, 'customizable', 'custom requests require confirmation'],
    shipsWithin: null,
    shipsWithinMetafield: null,
    seo: {
      title: `${matched.title} | LuxeMia`,
      description,
    },
  };
};
