import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout } from '@/lib/shopify';
import { trackAddToCart, trackBeginCheckout } from '@/hooks/useAnalytics';

export interface CartItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  customAttributes?: Array<{
    key: string;
    value: string;
  }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  setCartId: (cartId: string) => void;
  setCheckoutUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  createCheckout: () => Promise<string | null>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        
        // Track add_to_cart event in GA4
        trackAddToCart({
          id: item.product.node.id,
          name: item.product.node.title,
          price: parseFloat(item.price.amount),
          quantity: item.quantity,
          currency: item.price.currencyCode,
          category: item.product.node.productType,
        });
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
        });
      },

      removeItem: (variantId) => {
        set({
          items: get().items.filter(item => item.variantId !== variantId)
        });
      },

      clearCart: () => {
        set({ items: [], cartId: null, checkoutUrl: null });
      },

      setCartId: (cartId) => set({ cartId }),
      setCheckoutUrl: (checkoutUrl) => set({ checkoutUrl }),
      setLoading: (isLoading) => set({ isLoading }),

      createCheckout: async () => {
        const { items, setLoading, setCheckoutUrl } = get();
        if (items.length === 0) return null;

        // Track begin_checkout event in GA4
        const totalValue = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
        trackBeginCheckout(
          items.map(item => ({
            id: item.product.node.id,
            name: item.product.node.title,
            price: parseFloat(item.price.amount),
            quantity: item.quantity,
          })),
          totalValue,
          items[0]?.price.currencyCode
        );

        setLoading(true);
        try {
          const checkoutUrl = await createStorefrontCheckout(
            items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              handle: item.product.node.handle,
              customAttributes: item.customAttributes,
            }))
          );
          setCheckoutUrl(checkoutUrl);
          return checkoutUrl;
        } catch (error) {
          console.error('Failed to create checkout:', error);
          return null;
        } finally {
          setLoading(false);
        }
      }
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // One-time cleanup: clear cart data that references the old Lovable domain.
        // After migration to Vercel, cached cart items may contain stale URLs
        // pointing to luxemiashop.lovable.app which break checkout.
        if (state) {
          const serialized = JSON.stringify(state.items) + (state.checkoutUrl || '');
          if (serialized.includes('lovable.app')) {
            state.items = [];
            state.cartId = null;
            state.checkoutUrl = null;
          }
        }
      },
    }
  )
);
