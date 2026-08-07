import { useEffect, useState } from 'react';
import {
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

    fetchCollectionByHandle(handle, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result) {
        setError(true);
        setIsLoading(false);
        return;
      }
      setCollection(result);
      const liveProducts = filterCollectionProducts(handle, result.products);

      // The build-time collection payload is already scoped to this collection.
      // Do not erase it when Shopify temporarily returns an empty collection
      // response after hydration (the visible Bridesmaid page regression).
      setProducts(liveProducts.length > 0 ? liveProducts : (prerendered || []));
      setIsLoading(false);
    });

    return () => controller.abort();
  }, [handle]);

  return { collection, products, isLoading, error };
}
