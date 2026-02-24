import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, type ShopifyProduct } from '@/lib/shopify';

// Map internal categories to Shopify product_type queries
const CATEGORY_QUERY_MAP: Record<string, string> = {
  lehengas: 'product_type:"Bridal Lehengas" OR product_type:"Bridal Lehenga"',
  sarees: 'product_type:"Designer Sarees" OR product_type:"Designer Saree"',
  suits: 'product_type:"Designer Suits" OR product_type:"Designer Suit"',
  menswear: 'product_type:"Menswear"',
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
