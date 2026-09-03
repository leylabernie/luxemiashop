import { useEffect, useState } from 'react';
import {
  fetchAllProducts,
  fetchCollectionByHandle,
  type ShopifyCollection,
  type ShopifyProduct,
} from '@/lib/shopify';

function getPrerenderedProducts(handle: string): ShopifyProduct[] | null {
  if (typeof window === 'undefined') return null;
  const data = window.__INITIAL_DATA__;
  if (!data || data.category !== `collection:${handle}` || !Array.isArray(data.products)) {
    return null;
  }
  return data.products;
}

function isBridalPartyProduct(product: ShopifyProduct): boolean {
  const title = product.node.title ?? '';
  return /\b(bridesmaids?|maid of hono(?:u)?r|matron of hono(?:u)?r)\b/i.test(title);
}

function filterCollectionProducts(handle: string, products: ShopifyProduct[]): ShopifyProduct[] {
  if (handle !== 'bridal-party-outfits') return products;
  return products.filter(isBridalPartyProduct);
}

interface ShopifyCollectionLoadState {
  requestedHandle: string;
  collection: ShopifyCollection | null;
  products: ShopifyProduct[];
  isLoading: boolean;
  error: boolean;
}

type VisibleShopifyCollectionState = Omit<ShopifyCollectionLoadState, 'requestedHandle'>;

export function selectShopifyCollectionStateForHandle(
  handle: string,
  state: ShopifyCollectionLoadState,
  initialProducts: ShopifyProduct[] | null,
): VisibleShopifyCollectionState {
  if (state.requestedHandle === handle) {
    const { collection, products, isLoading, error } = state;
    return { collection, products, isLoading, error };
  }

  // Effects reset state after a route-param change. Until that commit, expose
  // only a prerender payload explicitly tagged for the new handle; never let
  // the previous collection become B's grid or structured data.
  return {
    collection: null,
    products: initialProducts || [],
    isLoading: initialProducts === null,
    error: false,
  };
}

export function useShopifyCollection(handle: string) {
  const rawInitialProducts = getPrerenderedProducts(handle);
  const initialProducts = rawInitialProducts
    ? filterCollectionProducts(handle, rawInitialProducts)
    : null;
  const [state, setState] = useState<ShopifyCollectionLoadState>(() => ({
    requestedHandle: handle,
    collection: null,
    products: initialProducts || [],
    isLoading: initialProducts === null,
    error: false,
  }));

  useEffect(() => {
    const controller = new AbortController();
    const rawPrerendered = getPrerenderedProducts(handle);
    const prerendered = rawPrerendered
      ? filterCollectionProducts(handle, rawPrerendered)
      : null;

    setState({
      requestedHandle: handle,
      collection: null,
      products: prerendered || [],
      isLoading: prerendered === null,
      error: false,
    });

    const loadCollection = async () => {
      try {
        const result = await fetchCollectionByHandle(handle, controller.signal);
        if (controller.signal.aborted) return;

        let liveProducts = filterCollectionProducts(handle, result?.products || []);

        // The Bridesmaid page is a curated storefront view. On client-side
        // navigation there is no route-specific prerender payload, and Shopify's
        // collection handle can return no products. Resolve that confirmed empty
        // response from the live catalog, then apply the same strict attendant-
        // title filter; never substitute the unfiltered catalog.
        if (handle === 'bridal-party-outfits' && liveProducts.length === 0) {
          const catalogProducts = await fetchAllProducts();
          if (controller.signal.aborted) return;
          liveProducts = filterCollectionProducts(handle, catalogProducts);
        }

        // The build-time collection payload is already scoped to this collection.
        // Keep it when a successful live response is empty; a transport or API
        // failure is handled separately below and is never treated as absence.
        const resolvedProducts = liveProducts.length > 0 ? liveProducts : (prerendered || []);
        setState((current) => current.requestedHandle === handle
          ? {
              requestedHandle: handle,
              collection: result,
              products: resolvedProducts,
              isLoading: current.isLoading,
              error: false,
            }
          : current);
      } catch (loadError) {
        if (controller.signal.aborted || (loadError as Error).name === 'AbortError') return;
        console.error(`Error loading Shopify collection ${handle}:`, loadError);
        setState((current) => current.requestedHandle === handle
          ? { ...current, error: true }
          : current);
      } finally {
        if (!controller.signal.aborted) {
          setState((current) => current.requestedHandle === handle
            ? { ...current, isLoading: false }
            : current);
        }
      }
    };

    void loadCollection();

    return () => controller.abort();
  }, [handle]);

  return selectShopifyCollectionStateForHandle(handle, state, initialProducts);
}
