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

interface ShopifyProductLoadState {
  handle: string | undefined;
  product: ShopifyProduct['node'] | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Never expose data that was resolved for a previous route parameter. Effects
 * run after render, so relying on an effect reset alone can briefly publish
 * product A's content and schema under product B's URL during SPA navigation.
 */
export function resolveProductLoadStateForHandle(
  state: ShopifyProductLoadState,
  handle: string | undefined,
): ShopifyProductLoadState {
  if (state.handle === handle) return state;

  return {
    handle,
    product: null,
    isLoading: true,
    error: null,
  };
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
  const allowHiddenBillingProduct = options.allowHiddenBillingProduct === true;
  const [loadState, setLoadState] = useState<ShopifyProductLoadState>(() => {
    const preloadedProduct = getInitialProduct(handle);
    return {
      handle,
      product: preloadedProduct,
      isLoading: !preloadedProduct,
      error: null,
    };
  });

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    let retryTimer: number | undefined;
    const MAX_RETRIES = 2;
    const RETRY_DELAYS = [500, 1500];
    const initial = getInitialProduct(handle);

    const fetchProduct = async () => {
      let retryScheduled = false;

      if (!handle) {
        setLoadState({
          handle,
          product: null,
          error: 'Product not found',
          isLoading: false,
        });
        return;
      }

      // Keep an already-rendered product interactive while the live record
      // refreshes. Direct client-only routes still show the loading UI.
      if (initial) {
        setLoadState({ handle, product: initial, error: null, isLoading: false });
        if (typeof window !== 'undefined') {
          window.__INITIAL_PRODUCT_DATA__ = undefined;
        }
      } else {
        setLoadState({ handle, product: null, error: null, isLoading: true });
      }

      try {
        const data = await fetchProductByHandle(handle, { allowHiddenBillingProduct });
        if (cancelled) return;

        if (data) {
          setLoadState({ handle, product: data, error: null, isLoading: false });
        } else {
          setLoadState({
            handle,
            product: null,
            error: 'Product not found',
            isLoading: false,
          });
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching Shopify product:', err);

        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCount];
          retryCount++;
          retryScheduled = true;
          retryTimer = window.setTimeout(fetchProduct, delay);
          return;
        }

        // A valid build-time record remains usable if a transient refresh
        // fails. Only show a blocking error when no product is available.
        if (!initial) {
          setLoadState({
            handle,
            product: null,
            error: 'Failed to load product. Please refresh the page.',
            isLoading: false,
          });
        }
      } finally {
        if (!cancelled && !retryScheduled) {
          setLoadState((current) => current.handle === handle
            ? { ...current, isLoading: false }
            : current);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [allowHiddenBillingProduct, handle]);

  const visibleState = resolveProductLoadStateForHandle(loadState, handle);
  return {
    product: visibleState.product,
    isLoading: visibleState.isLoading,
    error: visibleState.error,
  };
};
