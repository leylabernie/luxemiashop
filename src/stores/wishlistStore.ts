import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { ShopifyProduct } from '@/lib/shopify';
import { trackAddToWishlist } from '@/hooks/useAnalytics';

interface WishlistStore {
  items: ShopifyProduct[];
  isLoading: boolean;
  addItem: (product: ShopifyProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: ShopifyProduct) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWithDatabase: (userId: string) => Promise<void>;
  loadFromDatabase: (userId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: async (product) => {
        const { items } = get();
        const exists = items.some(item => item.node.id === product.node.id);
        if (!exists) {
          set({ items: [...items, product] });
          
          // Track add_to_wishlist event in GA4
          trackAddToWishlist({
            id: product.node.id,
            name: product.node.title,
            price: parseFloat(product.node.priceRange.minVariantPrice.amount),
            currency: product.node.priceRange.minVariantPrice.currencyCode,
            category: product.node.productType,
          });
          
          // Sync to database if user is logged in
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('wishlists').upsert({
              user_id: user.id,
              product_id: product.node.id,
              product_data: product as unknown as object,
            } as never, { onConflict: 'user_id,product_id' });
          }
        }
      },

      removeItem: async (productId) => {
        set({
          items: get().items.filter(item => item.node.id !== productId)
        });
        
        // Sync to database if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
        }
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

      clearWishlist: async () => {
        set({ items: [] });
        
        // Sync to database if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('wishlists')
            .delete()
            .eq('user_id', user.id);
        }
      },

      syncWithDatabase: async (userId: string) => {
        const { items } = get();
        
        // Upload local items to database
        for (const product of items) {
          await supabase.from('wishlists').upsert({
            user_id: userId,
            product_id: product.node.id,
            product_data: product as unknown as object,
          } as never, { onConflict: 'user_id,product_id' });
        }
      },

      loadFromDatabase: async (userId: string) => {
        set({ isLoading: true });
        
        const { data, error } = await supabase
          .from('wishlists')
          .select('*')
          .eq('user_id', userId);
        
        if (!error && data) {
          const dbItems = data.map(row => row.product_data as unknown as ShopifyProduct);
          const localItems = get().items;
          
          // Merge local and database items (database takes precedence)
          const mergedMap = new Map<string, ShopifyProduct>();
          
          localItems.forEach(item => {
            mergedMap.set(item.node.id, item);
          });
          
          dbItems.forEach(item => {
            mergedMap.set(item.node.id, item);
          });
          
          const mergedItems = Array.from(mergedMap.values());
          set({ items: mergedItems, isLoading: false });
          
          // Sync merged items back to database
          for (const product of mergedItems) {
            await supabase.from('wishlists').upsert({
              user_id: userId,
              product_id: product.node.id,
              product_data: product as unknown as object,
            } as never, { onConflict: 'user_id,product_id' });
          }
        } else {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'vasantam-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
