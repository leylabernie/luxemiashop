import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout } from '@/lib/shopify';
import { trackAddToCart, trackBeginCheckout } from '@/hooks/useAnalytics';
import { toast } from 'sonner';

const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';

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
  updateQuantity: (variantId: string, quantity: number, customAttributes?: any[]) => void;
  removeItem: (variantId: string, customAttributes?: any[]) => void;
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
        // Check if an item with the same variant AND same custom attributes already exists
        const existingItem = items.find(i => {
          const sameVariant = i.variantId === item.variantId;
          const sameAttributes = JSON.stringify(i.customAttributes) === JSON.stringify(item.customAttributes);
          return sameVariant && sameAttributes;
        });
        
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
            items: items.map(i => {
              const sameVariant = i.variantId === item.variantId;
              const sameAttributes = JSON.stringify(i.customAttributes) === JSON.stringify(item.customAttributes);
              return sameVariant && sameAttributes
                ? { ...i, quantity: i.quantity + item.quantity }
                : i;
            })
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      updateQuantity: (variantId, quantity, customAttributes) => {
        if (quantity <= 0) {
          get().removeItem(variantId, customAttributes);
          return;
        }
        
        set({
          items: get().items.map(item => {
            const sameVariant = item.variantId === variantId;
            const sameAttributes = JSON.stringify(item.customAttributes) === JSON.stringify(customAttributes);
            return sameVariant && sameAttributes ? { ...item, quantity } : item;
          })
        });
      },

      removeItem: (variantId, customAttributes) => {
        set({
          items: get().items.filter(item => {
            const sameVariant = item.variantId === variantId;
            const sameAttributes = JSON.stringify(item.customAttributes) === JSON.stringify(customAttributes);
            return !(sameVariant && sameAttributes);
          })
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
          
          if (checkoutUrl) {
            setCheckoutUrl(checkoutUrl);
            return checkoutUrl;
          }
          
          // If checkoutUrl is null, it means we have fake IDs or Shopify failed
          console.warn('No checkout URL returned, falling back to product page');
          const firstItem = items[0];
          if (firstItem && firstItem.product.node.handle) {
            toast.info('Redirecting to product page for checkout...');
            return `https://${SHOPIFY_STORE_DOMAIN}/products/${firstItem.product.node.handle}`;
          }
          
          return `https://${SHOPIFY_STORE_DOMAIN}`;
        } catch (error) {
          console.error('Failed to create checkout:', error);
          toast.error('Checkout is temporarily unavailable. Redirecting to our store...');
          // Always redirect to Shopify store so the customer can still purchase
          const fallbackUrl = `https://${SHOPIFY_STORE_DOMAIN}`;
          return fallbackUrl;
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
