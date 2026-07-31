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

export function useShopifyCollection(handle: string) {
  const initialProducts = getPrerenderedProducts(handle);
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts || []);
  const [collection, setCollection] = useState<ShopifyCollection | null>(null);
  const [isLoading, setIsLoading] = useState(initialProducts === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const prerendered = getPrerenderedProducts(handle);

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
      setProducts(result.products);
      setIsLoading(false);
    });

    return () => controller.abort();
  }, [handle]);

  return { collection, products, isLoading, error };
}
