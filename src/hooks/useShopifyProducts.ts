import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, type ShopifyProduct } from '@/lib/shopify';

// Map internal categories to Shopify tag-based queries
const CATEGORY_QUERY_MAP: Record<string, string> = {
  lehengas: 'tag:"Lehenga" OR tag:"Lehengas" OR tag:"Wedding Lehenga"',
  sarees: 'tag:"Saree" OR tag:"Wedding Saree" OR tag:"Draped Saree"',
  suits: 'tag:"Salwar Suit" OR tag:"Anarkali Suit" OR tag:"Sharara Set" OR tag:"Palazzo Set"',
  menswear: 'tag:"Mens Ethnic Wear"',
  jewelry: 'tag:"Jewellery" OR tag:"Kundan Jewellery" OR tag:"Necklace Set"',
};

export const useShopifyProducts = (category?: string) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = category ? CATEGORY_QUERY_MAP[category] : undefined;
        const data = await fetchProducts(50, query);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching Shopify products:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [category]);

  return { products, isLoading, error };
};

export const useShopifyPaginatedProducts = (category?: string) => {
  const { products, isLoading, error } = useShopifyProducts(category);

  // Client-side pagination since Storefront API cursor pagination is complex
  const totalCount = products.length;
  const totalPages = 1; // All products loaded at once
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
