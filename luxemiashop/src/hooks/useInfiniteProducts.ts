import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ShopifyProduct } from '@/lib/shopify';
import { convertToShopifyFormat, type ScrapedProduct } from './useScrapedProducts';

const PRODUCTS_PER_PAGE = 20;

export const useInfiniteProducts = (category?: string) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchProducts = useCallback(async (page: number, append = false) => {
    if (page === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      let query = supabase
        .from('scraped_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(page * PRODUCTS_PER_PAGE, (page + 1) * PRODUCTS_PER_PAGE - 1);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError(fetchError.message);
        return;
      }

      const formattedProducts = (data || []).map(p => convertToShopifyFormat(p as ScrapedProduct));
      
      if (append) {
        setProducts(prev => [...prev, ...formattedProducts]);
      } else {
        setProducts(formattedProducts);
      }
      
      // Check if there are more products
      setHasMore(formattedProducts.length === PRODUCTS_PER_PAGE);
      pageRef.current = page;
    } catch (err) {
      console.error('Error in useInfiniteProducts:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [category]);

  // Initial fetch
  useEffect(() => {
    pageRef.current = 0;
    setProducts([]);
    setHasMore(true);
    fetchProducts(0, false);
  }, [category, fetchProducts]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchProducts(pageRef.current + 1, true);
    }
  }, [isLoadingMore, hasMore, fetchProducts]);

  // Intersection observer callback for infinite scroll trigger element
  const lastProductRef = useCallback((node: HTMLElement | null) => {
    if (isLoadingMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    }, {
      rootMargin: '200px', // Load more before reaching the bottom
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [isLoadingMore, hasMore, loadMore]);

  return { 
    products, 
    isLoading, 
    isLoadingMore, 
    hasMore, 
    error, 
    loadMore,
    lastProductRef 
  };
};
