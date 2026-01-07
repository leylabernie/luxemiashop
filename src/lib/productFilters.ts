import type { ShopifyProduct } from '@/lib/shopify';

/**
 * Apply product filters based on active filter selections
 * Filters work with AND logic across categories (e.g., Bridal + Silk = bridal silk products)
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
      const metadata = p.node.metadata;
      if (!metadata) return false;

      // Map filter category to metadata field
      let productValue: string | null | undefined;
      let productTags: string[] | null | undefined;

      switch (normalizedCategory) {
        case 'occasion':
          productValue = metadata.occasion;
          break;
        case 'fabric':
          productValue = metadata.fabric;
          break;
        case 'color':
          productValue = metadata.color;
          break;
        case 'work':
          productValue = metadata.work;
          break;
        case 'category':
          // For category filter, check tags and title
          productTags = metadata.tags;
          productValue = p.node.title;
          break;
        default:
          return true; // Unknown filter category, don't filter
      }

      // Check if any selected filter value matches
      return values.some(filterValue => {
        const filterLower = filterValue.toLowerCase();
        
        // Check main product value
        if (productValue && productValue.toLowerCase().includes(filterLower)) {
          return true;
        }
        
        // Check tags
        if (productTags && productTags.some(tag => tag.toLowerCase().includes(filterLower))) {
          return true;
        }
        
        // For category, also check product title
        if (normalizedCategory === 'category' && p.node.title.toLowerCase().includes(filterLower)) {
          return true;
        }

        return false;
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
      // Products are already sorted by created_at desc from the hook
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
