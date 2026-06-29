import { useState, useEffect } from 'react';
import { fetchProductByHandle, type ShopifyProduct } from '@/lib/shopify';

/**
 * useShopifyProduct — fetches a single product from Shopify Storefront API.
 *
 * CRITICAL: This hook ALWAYS fetches live data from Shopify on every mount.
 * It does NOT fall back to localProducts.ts hardcoded data. If Shopify returns
 * null (rate limit, network blip, deleted product), the calling component
 * should show "Product not found" — never stale hardcoded data.
 *
 * The hook retries up to 2 times on transient errors (network failures,
 * 5xx responses) with exponential backoff (500ms → 1500ms). This handles
 * the common case where Shopify rate-limits a single request but a retry
 * succeeds.
 */
export const useShopifyProduct = (handle: string | undefined) => {
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    const MAX_RETRIES = 2;
    const RETRY_DELAYS = [500, 1500]; // ms — exponential-ish backoff

    const fetchProduct = async () => {
      if (!handle) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchProductByHandle(handle);
        if (cancelled) return;

        if (data) {
          setProduct(data);
        } else {
          // Shopify returned null — product genuinely doesn't exist (or was deleted).
          // No retry will help. Show "Product not found" — DO NOT fall back to
          // hardcoded localProducts.ts data.
          setError('Product not found');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching Shopify product:', err);

        // Retry on transient errors (network failures, etc.)
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCount];
          retryCount++;
          console.log(`[useShopifyProduct] Retrying in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})`);
          setTimeout(fetchProduct, delay);
          return;
        }

        setError('Failed to load product after multiple attempts. Please refresh the page.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [handle]);

  return { product, isLoading, error };
};
