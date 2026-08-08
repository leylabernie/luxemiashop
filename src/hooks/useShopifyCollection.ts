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

export function useShopifyCollection(handle: string) {
  const rawInitialProducts = getPrerenderedProducts(handle);
  const initialProducts = rawInitialProducts
    ? filterCollectionProducts(handle, rawInitialProducts)
    : null;
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts || []);
  const [collection, setCollection] = useState<ShopifyCollection | null>(null);
  const [isLoading, setIsLoading] = useState(initialProducts === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const rawPrerendered = getPrerenderedProducts(handle);
    const prerendered = rawPrerendered
      ? filterCollectionProducts(handle, rawPrerendered)
      : null;

    setProducts(prerendered || []);
    setIsLoading(prerendered === null);
    setError(false);

    const loadCollection = async () => {
      const result = await fetchCollectionByHandle(handle, controller.signal);
      if (controller.signal.aborted) return;

      setCollection(result);
      let liveProducts = filterCollectionProducts(handle, result?.products || []);

      // The Bridesmaid page is a curated storefront view. On client-side
      // navigation there is no route-specific prerender payload, and Shopify's
      // collection handle can temporarily return no products. Resolve that case
      // from the live catalog, then apply the same strict attendant-title filter;
      // never substitute the unfiltered catalog.
      if (handle === 'bridal-party-outfits' && liveProducts.length === 0) {
        const catalogProducts = await fetchAllProducts();
        if (controller.signal.aborted) return;
        liveProducts = filterCollectionProducts(handle, catalogProducts);
      }

      // The build-time collection payload is already scoped to this collection.
      // Do not erase it when Shopify temporarily returns an empty collection
      // response after hydration (the visible Bridesmaid page regression).
      const resolvedProducts = liveProducts.length > 0 ? liveProducts : (prerendered || []);
      setProducts(resolvedProducts);
      setError(!result && resolvedProducts.length === 0);
      setIsLoading(false);
    };

    void loadCollection();

    return () => controller.abort();
  }, [handle]);

  return { collection, products, isLoading, error };
}
