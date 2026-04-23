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
  getRecentProducts: (excludeId?: string, limit?: number) => RecentlyViewedProduct[];
  clearHistory: () => void;
}

const MAX_PRODUCTS = 12;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
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

      getRecentProducts: (excludeId, limit = 6) => {
        const products = get().products;
        return products
          .filter((p) => p.id !== excludeId)
          .slice(0, limit);
      },

      clearHistory: () => set({ products: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
);
