import type { ShopifyProduct } from '@/lib/shopify';

type ProductNode = ShopifyProduct['node'];

/**
 * Returns true when a shopper needs to review or select an option on the
 * product page before adding an item to the bag. Product cards do not expose
 * complete size, color, stitching, or Custom-size controls, so they must not
 * silently choose the first Shopify variant for those listings.
 */
export const requiresProductPageSelection = (product: ProductNode): boolean =>
  product.options.some((option) => {
    const values = option.values.filter((value) =>
      value.trim() && value.trim().toLowerCase() !== 'default title',
    );

    return values.length > 1 || values.some((value) => /\bcustom(?:\s*size)?\b/i.test(value));
  });

/**
 * The only safe direct card add is a listing without shopper-selectable
 * options and with one available Shopify variant.
 */
export const getDirectCardVariant = (product: ProductNode) => {
  if (requiresProductPageSelection(product)) return null;

  const availableVariants = product.variants.edges.filter(
    (edge) => edge.node.availableForSale !== false,
  );

  return availableVariants.length === 1 ? availableVariants[0].node : null;
};
