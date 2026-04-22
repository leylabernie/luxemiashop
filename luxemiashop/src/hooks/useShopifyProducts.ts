import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllProducts, type ShopifyProduct } from '@/lib/shopify';

// Shopify productType values mapped to category page routes
const CATEGORY_PRODUCT_TYPES: Record<string, string[]> = {
  suits: ['Pakistani Suit', 'Salwar Suit', 'Sharara', 'Anarkali', 'Plazzo Suit', 'Wedding Suit', 'Sharara Suit', 'Pakistani Readymade Suit', 'Indian Ethnic Set', 'Co-Ords', 'Dresses'],
  sarees: ['Saree', 'Ready-to-Wear Saree', 'Wedding Saree'],
  lehengas: ['Lehenga', 'Lehenga Choli', 'Bridal Lehenga Choli'],
  menswear: ["Men's Ethnic Wear", 'Kurta Pajama', 'Sherwani', "Men's Indian Wear", 'Modi Jacket Kurta Pajama'],
  indowestern: ['Indo Western', 'Indo-Western', 'Fusion Wear', 'Fusion', 'Indo Western Dress', 'Dhoti Pants', 'Indo-Western Set', 'Jumpsuit', 'Cape Set', 'Coord Set'],
};

// Map Shopify productType to display category names
export const getDisplayCategory = (productType: string | undefined): string => {
  if (!productType) return 'Designer Wear';
  const pt = productType.toLowerCase();

  if (/pakistani|salwar|sharara|anarkali|plazzo|palazzo|wedding suit|indian ethnic set|co-ords|dresses/.test(pt)) return 'Salwar Kameez';
  if (/lehenga/.test(pt)) return 'Lehengas';
  if (/saree/.test(pt)) return 'Sarees';
  if (/kurta|sherwani|jodhpuri|indo.?western|men.*ethnic|men.*indian|modi jacket/.test(pt)) return "Menswear";

  return productType;
};

// Simple in-memory cache for all products
let cachedProducts: ShopifyProduct[] | null = null;
let cachePromise: Promise<ShopifyProduct[]> | null = null;

const getAllProducts = async (): Promise<ShopifyProduct[]> => {
  if (cachedProducts) return cachedProducts;
  if (cachePromise) return cachePromise;

  cachePromise = fetchAllProducts().then(products => {
    cachedProducts = products;
    cachePromise = null;
    return products;
  });

  return cachePromise;
};

// Filter products by category client-side
const filterByCategory = (products: ShopifyProduct[], category: string): ShopifyProduct[] => {
  if (category === 'all') return products;

  const types = CATEGORY_PRODUCT_TYPES[category];
  if (!types) return products;

  // For indowestern, show women's fusion styles and exclude menswear product types
  if (category === 'indowestern') {
    const menswearTypesLower = CATEGORY_PRODUCT_TYPES['menswear'].map(t => t.toLowerCase());
    // Women's fusion-adjacent types that belong on the Indo-Western page
    const womensFusionTypes = [
      ...types.map(t => t.toLowerCase()),
      'sharara', 'anarkali', 'co-ords', 'coord set', 'jumpsuit', 'cape set', 'plazzo suit',
    ];
    return products.filter(p => {
      const pt = (p.node.productType ?? '').toLowerCase();
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      // Exclude menswear product types first
      if (menswearTypesLower.some(t => pt === t || pt.includes(t))) return false;
      // Exclude if tagged as menswear
      const MENS_TAGS = ['mens', "men's", 'groom', 'groomsmen', 'groomsman', 'boys', 'male'];
      if (MENS_TAGS.some(ind => tags.some(tag => tag === ind || tag === `${ind}wear`))) return false;
      // Match against indo-western + women's fusion types
      return womensFusionTypes.some(t => pt.includes(t)) ||
        tags.some(t => t.includes('indo') || t.includes('fusion') || t === 'contemporary' || t === 'western');
    });
  }

  return products.filter(p => {
    const pt = (p.node.productType ?? '').toLowerCase();
    return types.some(t => t.toLowerCase() === pt);
  });
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
        // Always fetch all products (cached after first call), then filter client-side
        const allProducts = await getAllProducts();
        const filtered = category ? filterByCategory(allProducts, category) : allProducts;
        setProducts(enrichProducts(filtered));
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
