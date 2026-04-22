import type { ShopifyProduct } from '@/lib/shopify';

/**
 * Build a searchable string from a product's tags, title, and description.
 */
const getSearchableText = (p: ShopifyProduct): string => {
  const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
  const title = p.node.title.toLowerCase();
  const description = (p.node.description ?? '').toLowerCase();
  const productType = (p.node.productType ?? '').toLowerCase();
  return [...tags, title, description, productType].join(' ');
};

/**
 * Apply product filters based on active filter selections.
 * Filters match against Shopify tags, title, description, and productType
 * since metadata/metafields are not available via Storefront API.
 */
export const applyProductFilters = (
  products: ShopifyProduct[],
  activeFilters: Record<string, string[]>,
  priceRange: [number, number]
): ShopifyProduct[] => {
  let filtered = [...products];

  // Apply category-based filters
  Object.entries(activeFilters).forEach(([category, values]) => {
    if (values.length === 0) return;

    const normalizedCategory = category.toLowerCase();

    filtered = filtered.filter(p => {
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      const variants = p.node.variants?.edges || [];
      const searchable = getSearchableText(p);

      // Handle Size filter - check variant options and tags
      if (normalizedCategory === 'size') {
        return values.some(filterValue => {
          const filterLower = filterValue.toLowerCase();

          return variants.some(v =>
            v.node.selectedOptions?.some(opt =>
              opt.name.toLowerCase() === 'size' &&
              opt.value.toLowerCase().includes(filterLower)
            )
          ) ||
          p.node.options?.some(opt =>
            opt.name.toLowerCase() === 'size' &&
            opt.values.some(val => val.toLowerCase().includes(filterLower))
          ) ||
          tags.some(tag => tag === `size ${filterLower}` || tag === filterLower);
        });
      }

      // Handle Availability filter
      if (normalizedCategory === 'availability') {
        return values.some(filterValue => {
          const filterLower = filterValue.toLowerCase();

          if (filterLower.includes('ready')) {
            const hasAvailable = variants.some(v => v.node.availableForSale);
            const hasReadyTag = tags.some(tag =>
              tag.includes('ready') || tag.includes('in stock') || tag.includes('readymade')
            );
            return hasAvailable || hasReadyTag;
          }

          if (filterLower.includes('made to order') || filterLower.includes('custom')) {
            return tags.some(tag =>
              tag.includes('made to order') || tag.includes('custom') || tag.includes('pre-order')
            );
          }

          return true;
        });
      }

      // For all other filters, search tags + title + description
      return values.some(filterValue => {
        const filterLower = filterValue.toLowerCase();
        return searchable.includes(filterLower);
      });
    });
  });

  // Apply price filter
  filtered = filtered.filter(p => {
    const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
    return price >= priceRange[0] && price <= priceRange[1];
  });

  return filtered;
};

/**
 * Sort products by the specified sort option
 */
export const sortProducts = (
  products: ShopifyProduct[],
  sortBy: string
): ShopifyProduct[] => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) =>
        parseFloat(a.node.priceRange.minVariantPrice.amount) -
        parseFloat(b.node.priceRange.minVariantPrice.amount)
      );
      break;
    case 'price-desc':
      sorted.sort((a, b) =>
        parseFloat(b.node.priceRange.minVariantPrice.amount) -
        parseFloat(a.node.priceRange.minVariantPrice.amount)
      );
      break;
    case 'newest':
      sorted.sort((a, b) =>
        new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime()
      );
      break;
    case 'featured':
    default:
      // Featured is the default order
      break;
  }

  return sorted;
};

/**
 * Combined filter and sort function for convenience
 */
export const filterAndSortProducts = (
  products: ShopifyProduct[],
  activeFilters: Record<string, string[]>,
  priceRange: [number, number],
  sortBy: string
): ShopifyProduct[] => {
  const filtered = applyProductFilters(products, activeFilters, priceRange);
  return sortProducts(filtered, sortBy);
};
