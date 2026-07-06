import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedProduct {
  id: string;
  handle: string;
  title: string;
  price: string;
  currency: string;
  imageUrl: string;
  viewedAt: number;
}

interface RecentlyViewedStore {
  products: RecentlyViewedProduct[];
  addProduct: (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => void;
  removeProduct: (id: string) => void;
  getRecentProducts: (excludeId?: string, limit?: number) => RecentlyViewedProduct[];
  clearHistory: () => void;
}

const MAX_PRODUCTS = 12;
// Auto-expire entries after 30 days — prevents stale products from
// accumulating in localStorage when products are deleted from Shopify.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        // Don't add products with empty/invalid image URLs — they'll show
        // broken image placeholders in the Recently Viewed section.
        if (!product.imageUrl || product.imageUrl.trim().length === 0) {
          return;
        }

        set((state) => {
          // Remove if already exists
          const filtered = state.products.filter((p) => p.id !== product.id);

          // Add to beginning with timestamp
          const newProduct: RecentlyViewedProduct = {
            ...product,
            viewedAt: Date.now(),
          };

          // Keep only the most recent products
          const updated = [newProduct, ...filtered].slice(0, MAX_PRODUCTS);

          return { products: updated };
        });
      },

      removeProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      getRecentProducts: (excludeId, limit = 6) => {
        const now = Date.now();
        const products = get().products;

        // Filter out:
        // 1. The current product (excludeId)
        // 2. Entries older than MAX_AGE_MS (30 days) — auto-expire stale products
        // 3. Entries with empty image URLs (shouldn't happen due to addProduct
        //    validation, but clean up any that slipped through from old data)
        const valid = products.filter((p) => {
          if (p.id === excludeId) return false;
          if (now - p.viewedAt > MAX_AGE_MS) return false;
          if (!p.imageUrl || p.imageUrl.trim().length === 0) return false;
          return true;
        });

        // If we filtered out expired entries, persist the cleaned list
        // so they don't come back on next page load.
        if (valid.length !== products.length) {
          set({ products: valid });
        }

        return valid.slice(0, limit);
      },

      clearHistory: () => set({ products: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
);
