import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ShopifyProduct } from '@/lib/shopify';
import { convertToShopifyFormat, type ScrapedProduct } from './useScrapedProducts';

const PRODUCTS_PER_PAGE = 24;

export const usePaginatedProducts = (category?: string) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  const fetchProducts = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get total count first
      let countQuery = supabase
        .from('scraped_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (category) {
        countQuery = countQuery.eq('category', category);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch products for current page
      const offset = (page - 1) * PRODUCTS_PER_PAGE;
      let query = supabase
        .from('scraped_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + PRODUCTS_PER_PAGE - 1);

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
      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error in usePaginatedProducts:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  // Fetch when page or category changes
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  return { 
    products, 
    isLoading, 
    error, 
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    productsPerPage: PRODUCTS_PER_PAGE
  };
};
