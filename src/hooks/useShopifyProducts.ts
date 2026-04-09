import { useState, useEffect, useCallback } from 'react';
import { fetchAllProducts, type ShopifyProduct } from '@/lib/shopify';

// Shopify productType values mapped to category page routes
const CATEGORY_PRODUCT_TYPES: Record<string, string[]> = {
  suits: ['Pakistani Suit', 'Salwar Suit', 'Sharara', 'Anarkali', 'Plazzo Suit'],
  sarees: ['Saree'],
  lehengas: ['Lehenga'],
  menswear: ['Kurta Pajama', 'Sherwani'],
  jewelry: ['Necklace Set', 'Kundan Jewellery', 'Jewellery'],
};

// Map Shopify productType to display category names
export const getDisplayCategory = (productType: string | undefined): string => {
  if (!productType) return 'Designer Wear';
  const pt = productType.toLowerCase();

  if (/pakistani|salwar|sharara|anarkali|plazzo|palazzo/.test(pt)) return 'Designer Suits';
  if (/lehenga/.test(pt)) return 'Bridal Lehengas';
  if (/saree/.test(pt)) return 'Designer Sarees';
  if (/kurta|sherwani|jodhpuri|indo.?western/.test(pt)) return "Men's Ethnic Wear";
  if (/necklace|jewellery|jewelry|kundan/.test(pt)) return 'Jewelry';

  return productType;
};

// Build Shopify query string for a category's product types
const buildProductTypeQuery = (category: string): string | undefined => {
  const types = CATEGORY_PRODUCT_TYPES[category];
  if (!types) return undefined;
  return types.map(t => `product_type:"${t}"`).join(' OR ');
};

// Enrich products with display category
const enrichProducts = (products: ShopifyProduct[]): ShopifyProduct[] =>
  products.map(p => ({
    node: {
      ...p.node,
      productType: getDisplayCategory(p.node.productType),
    },
  }));

export const useShopifyProducts = (category?: string) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = category ? buildProductTypeQuery(category) : undefined;
        const data = await fetchAllProducts(query);
        setProducts(enrichProducts(data));
      } catch (err) {
        console.error('Error fetching Shopify products:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [category]);

  // no-op loadMore since we fetch all at once
  const loadMore = useCallback(() => {}, []);

  return { products, isLoading, isLoadingMore: false, error, hasMore, loadMore };
};

export const useShopifyPaginatedProducts = (category?: string) => {
  const { products, isLoading, error } = useShopifyProducts(category);

  const totalCount = products.length;
  const totalPages = 1;
  const currentPage = 1;
  const goToPage = useCallback(() => {}, []);

  return {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    productsPerPage: 50,
  };
};
