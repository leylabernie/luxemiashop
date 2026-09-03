import type { ShopifyProduct } from '@/lib/shopify';

export function toCollectionSchemaItems(products: ShopifyProduct[], limit = 30) {
  return products.slice(0, limit).map(({ node }) => ({
    id: node.id,
    name: node.title,
    url: `/product/${node.handle}`,
    image: node.images.edges[0]?.node.url || '',
    price: node.priceRange.minVariantPrice.amount,
    currency: node.priceRange.minVariantPrice.currencyCode,
  }));
}
