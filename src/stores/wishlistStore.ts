import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShopifyProduct } from '@/lib/shopify';

interface WishlistStore {
  items: ShopifyProduct[];
  addItem: (product: ShopifyProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: ShopifyProduct) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        const exists = items.some(item => item.node.id === product.node.id);
        if (!exists) {
          set({ items: [...items, product] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.node.id !== productId)
        });
      },

      toggleItem: (product) => {
        const { items, addItem, removeItem } = get();
        const exists = items.some(item => item.node.id === product.node.id);
        if (exists) {
          removeItem(product.node.id);
        } else {
          addItem(product);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some(item => item.node.id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      }
    }),
    {
      name: 'vasantam-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
