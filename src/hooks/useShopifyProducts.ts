import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllProducts, type ShopifyProduct } from '@/lib/shopify';

// Shopify productType values mapped to category page routes
// NOTE: Removed overly broad types like 'Dresses', 'Indian Ethnic Set', 'Co-Ords'
// from suits — these were matching men's products on Shopify
const CATEGORY_PRODUCT_TYPES: Record<string, string[]> = {
  suits: ['Pakistani Suit', 'Salwar Suit', 'Sharara', 'Anarkali', 'Plazzo Suit', 'Pakistani Readymade Suit', 'Salwar Kameez', 'Sharara Suit'],
  sarees: ['Saree', 'Ready-to-Wear Saree', 'Wedding Saree', 'Sarees'],
  lehengas: ['Lehenga', 'Lehenga Choli', 'Bridal Lehenga Choli'],
  menswear: ["Men's Ethnic Wear", 'Kurta Pajama', 'Sherwani', "Men's Indian Wear", 'Modi Jacket Kurta Pajama', 'Menswear', "Men's Suit"],
  indowestern: ['Indo Western', 'Indo-Western', 'Fusion Wear', 'Fusion', 'Indo Western Dress', 'Indo-Western Set', 'Jumpsuit', 'Cape Set', 'Coord Set'],
};

// Map Shopify productType to display category names
export const getDisplayCategory = (productType: string | undefined): string => {
  if (!productType) return 'Designer Wear';
  const pt = productType.toLowerCase();

  // Menswear check MUST come first to prevent men's items appearing in women's categories
  if (/kurta|sherwani|jodhpuri|men.*ethnic|men.*indian|men.*suit|modi jacket|menswear|bandi|pathani|achkan/.test(pt)) return 'Menswear';
  if (/\bmen\b/.test(pt)) return 'Menswear';

  // Women's categories
  if (/pakistani|salwar|sharara|anarkali|plazzo|palazzo/.test(pt)) return 'Salwar Kameez';
  if (/lehenga/.test(pt)) return 'Lehengas';
  if (/saree/.test(pt)) return 'Sarees';
  if (/indo.?western|fusion|jumpsuit|cape set|coord set/.test(pt)) return 'Indo Western';

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

// Keywords that identify menswear products — used to exclude from women's pages
const MENSWEAR_KEYWORDS = [
  'sherwani', 'kurta pajama', 'kurta set', 'jodhpuri', 'modi jacket',
  'nehru jacket', 'groom', 'menswear', "men's", ' indo western', 'dhoti',
  ' bandi', 'pathani', 'achkan', 'angarakha', 'men suit', 'men kurta',
  'men shirt', 'men trouser', 'men jacket', 'male', 'for men', 'boys',
];
const MENSWEAR_TAGS = ['mens', "men's", 'groom', 'groomsmen', 'groomsman', 'boys', 'male', 'menswear', 'men', 'man'];

function isMenswear(product: ShopifyProduct): boolean {
  const pt = (product.node.productType ?? '').toLowerCase();
  const title = (product.node.title ?? '').toLowerCase();
  const tags = (product.node.tags ?? []).map(t => t.toLowerCase());

  // Check product type against menswear types
  const menswearTypes = CATEGORY_PRODUCT_TYPES['menswear'].map(t => t.toLowerCase());
  if (menswearTypes.some(t => pt === t || pt.includes(t))) return true;

  // Check if product type explicitly contains "men" — catch-all for men's categories
  if (/\bmen\b/.test(pt) || pt.includes("men's") || pt.includes('menswear') || pt.includes('male')) return true;

  // Check title for menswear keywords
  if (MENSWEAR_KEYWORDS.some(kw => title.includes(kw))) return true;

  // Check tags
  if (MENSWEAR_TAGS.some(tag => tags.some(t => t === tag || t === `${tag}wear` || t.includes(tag)))) return true;

  // If the product has a gender tag that says male/men, exclude it
  const genderTag = tags.find(t => t === 'gender:male' || t === 'gender:men' || t === 'male' || t === 'men');
  if (genderTag) return true;

  return false;
}

// Filter products by category client-side
const filterByCategory = (products: ShopifyProduct[], category: string): ShopifyProduct[] => {
  if (category === 'all') return products;

  const types = CATEGORY_PRODUCT_TYPES[category];
  if (!types) return products;

  // For menswear: include only men's products
  if (category === 'menswear') {
    return products.filter(p => isMenswear(p));
  }

  // For all women's categories: exclude menswear first
  const filtered = products.filter(p => !isMenswear(p));

  // For indowestern, show women's fusion styles
  if (category === 'indowestern') {
    const womensFusionTypes = [
      ...types.map(t => t.toLowerCase()),
      'sharara', 'anarkali', 'co-ords', 'coord set', 'jumpsuit', 'cape set', 'plazzo suit',
    ];
    return filtered.filter(p => {
      const pt = (p.node.productType ?? '').toLowerCase();
      const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
      return womensFusionTypes.some(t => pt.includes(t)) ||
        tags.some(t => t.includes('indo') || t.includes('fusion') || t === 'contemporary' || t === 'western');
    });
  }

  // For suits, lehengas, sarees: match by product type (already menswear-excluded)
  return filtered.filter(p => {
    const pt = (p.node.productType ?? '').toLowerCase();
    const tags = (p.node.tags ?? []).map(t => t.toLowerCase());
    const title = (p.node.title ?? '').toLowerCase();

    // Extra safety: skip any product with men's-related tags even after isMenswear filter
    if (tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear')) return false;
    if (title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men')) return false;

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
