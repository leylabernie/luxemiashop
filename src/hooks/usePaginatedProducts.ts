import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import type { ShopifyProduct } from '@/lib/shopify';
import { convertToShopifyFormat, type ScrapedProduct } from './useScrapedProducts';

const PRODUCTS_PER_PAGE = 24;

export const usePaginatedProducts = (category?: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Get current page from URL, default to 1
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
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

  // Note: Category is typically static per page, so no reset needed

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams(params => {
        if (page === 1) {
          params.delete('page');
        } else {
          params.set('page', String(page));
        }
        return params;
      }, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, setSearchParams]);

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
