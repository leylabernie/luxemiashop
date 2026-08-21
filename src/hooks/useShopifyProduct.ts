import { useState, useEffect } from 'react';
import { fetchProductByHandle, type ShopifyProduct } from '@/lib/shopify';

/**
 * Build-time product pages inject the exact product record as a small, route-
 * scoped payload. It gives direct product visits a usable purchase interface
 * immediately while a live Shopify request refreshes the record in the
 * background. The payload is never reused for a different product route.
 */
declare global {
  interface Window {
    __INITIAL_PRODUCT_DATA__?: {
      handle?: string;
      product?: ShopifyProduct['node'];
    };
  }
}

function getInitialProduct(handle: string | undefined): ShopifyProduct['node'] | null {
  if (!handle || typeof window === 'undefined') return null;
  const initial = window.__INITIAL_PRODUCT_DATA__;
  if (!initial?.product || initial.handle !== handle) return null;
  return initial.product;
}

/**
 * useShopifyProduct — renders a route-scoped build-time record immediately
 * when it exists, then refreshes from Shopify. On client-only product visits
 * it retains the normal live-fetch behavior. This avoids a shopper-facing
 * skeleton while a slow Storefront API request is in flight.
 */
export const useShopifyProduct = (
  handle: string | undefined,
  options: { allowHiddenBillingProduct?: boolean } = {},
) => {
  const preloadedProduct = getInitialProduct(handle);
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(preloadedProduct);
  const [isLoading, setIsLoading] = useState(!preloadedProduct);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    const MAX_RETRIES = 2;
    const RETRY_DELAYS = [500, 1500];
    const initial = getInitialProduct(handle);

    const fetchProduct = async () => {
      if (!handle) {
        setProduct(null);
        setError('Product not found');
        setIsLoading(false);
        return;
      }

      // Keep an already-rendered product interactive while the live record
      // refreshes. Direct client-only routes still show the loading UI.
      if (initial) {
        setProduct(initial);
        setError(null);
        setIsLoading(false);
        if (typeof window !== 'undefined') {
          window.__INITIAL_PRODUCT_DATA__ = undefined;
        }
      } else {
        setProduct(null);
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await fetchProductByHandle(handle, options);
        if (cancelled) return;

        if (data) {
          setProduct(data);
          setError(null);
        } else if (!initial) {
          setProduct(null);
          setError('Product not found');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching Shopify product:', err);

        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCount];
          retryCount++;
          window.setTimeout(fetchProduct, delay);
          return;
        }

        // A valid build-time record remains usable if a transient refresh
        // fails. Only show a blocking error when no product is available.
        if (!initial) {
          setProduct(null);
          setError('Failed to load product. Please refresh the page.');
        }
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
  }, [handle, options.allowHiddenBillingProduct]);

  return { product, isLoading, error };
};
