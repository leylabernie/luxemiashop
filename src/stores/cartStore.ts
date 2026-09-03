import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout } from '@/lib/shopify';
import {
  AnalyticsItem,
  trackAddToCart,
  trackBeginCheckout,
  trackCheckoutHandoffSuccess,
  trackRemoveFromCart,
  trackViewCart,
} from '@/hooks/useAnalytics';
import { toast } from 'sonner';
import { isHiddenBillingProductHandle } from '@/lib/serviceAddOns';
import { isVariantExplicitlyOrderable } from '@/lib/orderability';

export interface CartAttribute {
  key: string;
  value: string;
}

// This shopper-visible reference is sent on both a garment line and each of
// its service lines. Shopify therefore keeps otherwise identical service
// variants distinct, while the persisted cart can restore the relationship.
export const GARMENT_LINE_ID_ATTRIBUTE = 'Garment Reference';

export const createGarmentLineId = (): string => {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `LM-${uuid}`;

  // randomUUID is available in supported browsers. Keep a collision-resistant
  // fallback for embedded browsers instead of making a service selection fail.
  return `LM-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

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
  trackCartView: () => void;
  createCheckout: () => Promise<string | null>;
}

const sameAttributes = (left?: CartAttribute[], right?: CartAttribute[]) => (
  JSON.stringify(left || []) === JSON.stringify(right || [])
);

export const getGarmentLineId = (
  item: Pick<CartItem, 'customAttributes'>,
): string | undefined => item.customAttributes
  ?.find((attribute) => attribute.key === GARMENT_LINE_ID_ATTRIBUTE)
  ?.value
  .trim() || undefined;

const getTailoringOption = (item: CartItem) => item.customAttributes
  ?.find((attribute) => /stitch|tailor|custom|measurement/i.test(attribute.key))
  ?.value;

const appliesToProductTitle = (item: CartItem) => item.customAttributes
  ?.find((attribute) => attribute.key === 'Applies To')
  ?.value;

const isServiceLine = (item: CartItem) => isHiddenBillingProductHandle(item.product.node.handle);

const isDependentServiceLine = (
  candidate: CartItem,
  garment: CartItem,
  items: CartItem[],
): boolean => {
  if (!isServiceLine(candidate)) return false;

  const garmentLineId = getGarmentLineId(garment);
  if (garmentLineId) {
    return getGarmentLineId(candidate) === garmentLineId;
  }

  // Preserve unambiguous carts saved before line references were introduced.
  // If multiple legacy garment lines have the same title, declining to infer a
  // parent is safer than changing or removing another garment's service.
  if (getGarmentLineId(candidate)) return false;
  const legacyParentsWithSameTitle = items.filter((item) => (
    !isServiceLine(item)
    && !getGarmentLineId(item)
    && item.product.node.title === garment.product.node.title
  ));

  return legacyParentsWithSameTitle.length === 1
    && appliesToProductTitle(candidate) === garment.product.node.title;
};

const toAnalyticsItem = (item: CartItem, quantity = item.quantity): AnalyticsItem => {
  const serviceLine = isServiceLine(item);
  const serviceVariant = item.variantTitle.replace(/\s*\(\+\$[\d.]+\)\s*$/, '');

  return {
    // A Shopify variant is the purchasable inventory unit. Use it as the GA4 item
    // key, with the product ID retained for parent-product rollups. Service names
    // stay customer-facing even when an older local cart retains a legacy product title.
    id: item.variantId || item.product.node.id,
    name: serviceLine ? 'LuxeMia Saree Services' : item.product.node.title,
    price: Number(item.price.amount),
    quantity,
    currency: item.price.currencyCode,
    category: item.product.node.productType,
    variant: serviceLine
      ? serviceVariant
      : (item.variantTitle !== 'Default Title' ? item.variantTitle : undefined),
    productGroupId: item.product.node.id,
    tailoringOption: getTailoringOption(item),
    occasion: item.product.node.metadata?.occasion?.join(', ') || undefined,
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isCartOpen: false,

      addItem: (item) => {
        if (!isVariantExplicitlyOrderable(item.product.node, item.variantId)) {
          console.warn('Blocked cart addition without explicit Shopify availability', item.variantId);
          toast.error('This selection is currently unavailable. Please choose another option.');
          return;
        }

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

        if (
          quantity > current.quantity
          && !isVariantExplicitlyOrderable(current.product.node, current.variantId)
        ) {
          toast.error('This selection is currently unavailable. Its quantity cannot be increased.');
          return;
        }

        const quantityDelta = quantity - current.quantity;
        if (quantityDelta > 0) {
          trackAddToCart(toAnalyticsItem(current, quantityDelta));
        } else if (quantityDelta < 0) {
          trackRemoveFromCart(toAnalyticsItem(current, Math.abs(quantityDelta)));
        }

        const shouldSyncServiceQuantities = !isServiceLine(current);
        const currentItems = get().items;

        set({
          items: currentItems.map((item) => {
            const isCurrentLine = item.variantId === variantId
              && sameAttributes(item.customAttributes, customAttributes);
            const isDependentService = shouldSyncServiceQuantities
              && isDependentServiceLine(item, current, currentItems);

            return isCurrentLine || isDependentService ? { ...item, quantity } : item;
          }),
        });
      },

      removeItem: (variantId, customAttributes) => {
        const itemToRemove = get().items.find((item) => (
          item.variantId === variantId
          && sameAttributes(item.customAttributes, customAttributes)
        ));
        if (!itemToRemove) return;

        const currentItems = get().items;
        const removeDependentServices = !isServiceLine(itemToRemove);
        const linesToRemove = currentItems.filter((item) => {
          const isCurrentLine = item.variantId === variantId
            && sameAttributes(item.customAttributes, customAttributes);
          const isDependentService = removeDependentServices
            && isDependentServiceLine(item, itemToRemove, currentItems);
          return isCurrentLine || isDependentService;
        });

        linesToRemove.forEach((item) => trackRemoveFromCart(toAnalyticsItem(item)));
        set({
          items: currentItems.filter((item) => !linesToRemove.includes(item)),
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
      trackCartView: () => {
        const { items } = get();
        if (items.length === 0) return;
        trackViewCart(
          items.map((item) => toAnalyticsItem(item)),
          items[0]?.price.currencyCode,
        );
      },

      createCheckout: async () => {
        const { items, setLoading, setCheckoutUrl } = get();
        if (items.length === 0) return null;
        if (items.some((item) => !isVariantExplicitlyOrderable(item.product.node, item.variantId))) {
          toast.error('One or more bag items is no longer available. Remove it to continue.');
          return null;
        }

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
            trackCheckoutHandoffSuccess(
              items.map((item) => toAnalyticsItem(item)),
              totalValue,
              items[0]?.price.currencyCode,
            );
            setCheckoutUrl(checkoutUrl);
            return checkoutUrl;
          }

          console.error('Shopify returned no checkout URL; preserving the cart');
          toast.error('Checkout could not be created. Your bag remains in this browser — please try again.');
          return null;
        } catch (error) {
          console.error('Failed to create checkout:', error);
          toast.error('Checkout is temporarily unavailable. Your bag remains in this browser — please try again.');
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
            return;
          }

          // Remove legacy implementation details from carts created before the
          // customer-facing service experience was refined. Shopify displays
          // cart attributes in checkout, so only shopper-friendly context may
          // be persisted on service lines.
          state.items = state.items.map((item) => ({
            ...item,
            customAttributes: item.customAttributes?.filter((attribute) => {
              if (attribute.key === 'Related Product Handle') return false;
              if (!isServiceLine(item) && attribute.key === 'Selected Paid Services') return false;
              return true;
            }),
          }));
        }
      },
    },
  ),
);
