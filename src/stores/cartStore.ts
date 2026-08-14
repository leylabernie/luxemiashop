import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout } from '@/lib/shopify';
import {
  AnalyticsItem,
  trackAddToCart,
  trackBeginCheckout,
  trackRemoveFromCart,
} from '@/hooks/useAnalytics';
import { toast } from 'sonner';

export interface CartAttribute {
  key: string;
  value: string;
}

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
  customAttributes?: CartAttribute[];
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isCartOpen: boolean;

  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number, customAttributes?: CartAttribute[]) => void;
  removeItem: (variantId: string, customAttributes?: CartAttribute[]) => void;
  clearCart: () => void;
  setCartId: (cartId: string) => void;
  setCheckoutUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  createCheckout: () => Promise<string | null>;
}

const sameAttributes = (left?: CartAttribute[], right?: CartAttribute[]) => (
  JSON.stringify(left || []) === JSON.stringify(right || [])
);

const getTailoringOption = (item: CartItem) => item.customAttributes
  ?.find((attribute) => /stitch|tailor|custom|measurement/i.test(attribute.key))
  ?.value;

const toAnalyticsItem = (item: CartItem, quantity = item.quantity): AnalyticsItem => ({
  // A Shopify variant is the purchasable inventory unit. Use it as the GA4 item
  // key, with the product ID retained for parent-product rollups.
  id: item.variantId || item.product.node.id,
  name: item.product.node.title,
  price: Number(item.price.amount),
  quantity,
  currency: item.price.currencyCode,
  category: item.product.node.productType,
  variant: item.variantTitle !== 'Default Title' ? item.variantTitle : undefined,
  productGroupId: item.product.node.id,
  tailoringOption: getTailoringOption(item),
  occasion: item.product.node.metadata?.occasion || undefined,
});

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isCartOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((current) => (
          current.variantId === item.variantId
          && sameAttributes(current.customAttributes, item.customAttributes)
        ));

        // Fire only after a valid cart action. Variant ID, selected variant, and
        // tailoring option are preserved for item-level GA4 analysis.
        trackAddToCart(toAnalyticsItem(item));

        if (existingItem) {
          set({
            items: items.map((current) => (
              current.variantId === item.variantId
              && sameAttributes(current.customAttributes, item.customAttributes)
                ? { ...current, quantity: current.quantity + item.quantity }
                : current
            )),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      updateQuantity: (variantId, quantity, customAttributes) => {
        const current = get().items.find((item) => (
          item.variantId === variantId
          && sameAttributes(item.customAttributes, customAttributes)
        ));
        if (!current) return;

        if (quantity <= 0) {
          get().removeItem(variantId, customAttributes);
          return;
        }

        const quantityDelta = quantity - current.quantity;
        if (quantityDelta > 0) {
          trackAddToCart(toAnalyticsItem(current, quantityDelta));
        } else if (quantityDelta < 0) {
          trackRemoveFromCart(toAnalyticsItem(current, Math.abs(quantityDelta)));
        }

        set({
          items: get().items.map((item) => (
            item.variantId === variantId && sameAttributes(item.customAttributes, customAttributes)
              ? { ...item, quantity }
              : item
          )),
        });
      },

      removeItem: (variantId, customAttributes) => {
        const itemToRemove = get().items.find((item) => (
          item.variantId === variantId
          && sameAttributes(item.customAttributes, customAttributes)
        ));
        if (itemToRemove) trackRemoveFromCart(toAnalyticsItem(itemToRemove));

        set({
          items: get().items.filter((item) => !(
            item.variantId === variantId
            && sameAttributes(item.customAttributes, customAttributes)
          )),
        });
      },

      clearCart: () => {
        set({ items: [], cartId: null, checkoutUrl: null });
      },

      setCartId: (cartId) => set({ cartId }),
      setCheckoutUrl: (checkoutUrl) => set({ checkoutUrl }),
      setLoading: (isLoading) => set({ isLoading }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      createCheckout: async () => {
        const { items, setLoading, setCheckoutUrl } = get();
        if (items.length === 0) return null;

        const totalValue = items.reduce(
          (sum, item) => sum + Number(item.price.amount) * item.quantity,
          0,
        );
        trackBeginCheckout(
          items.map((item) => toAnalyticsItem(item)),
          totalValue,
          items[0]?.price.currencyCode,
        );

        setLoading(true);
        try {
          const checkoutUrl = await createStorefrontCheckout(
            items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              handle: item.product.node.handle,
              customAttributes: item.customAttributes,
            })),
          );

          if (checkoutUrl) {
            setCheckoutUrl(checkoutUrl);
            return checkoutUrl;
          }

          console.error('Shopify returned no checkout URL; preserving the cart');
          toast.error('Checkout could not be created. Your bag is saved — please try again.');
          return null;
        } catch (error) {
          console.error('Failed to create checkout:', error);
          toast.error('Checkout is temporarily unavailable. Your bag is saved — please try again.');
          return null;
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const serialized = JSON.stringify(state.items) + (state.checkoutUrl || '');
          if (serialized.includes('lovable.app')) {
            state.items = [];
            state.cartId = null;
            state.checkoutUrl = null;
          }
        }
      },
    },
  ),
);
