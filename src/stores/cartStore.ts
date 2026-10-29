import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout } from '@/lib/shopify';
import { CheckoutCartChangedError } from '@/lib/checkoutCartIntegrity';
import { getProductShipsWithin } from '@/lib/shipBy';
import { normalizeFulfillmentAttributes } from '@/lib/fulfillmentAttributes';
import { redactMeasurementAttributes, hasPendingMeasurementAttributes } from '@/lib/measurementRequest';
import {
  AnalyticsItem,
  trackAddToCart,
  trackBeginCheckout,
  trackCheckoutHandoffSuccess,
  trackRemoveFromCart,
  trackViewCart,
} from '@/hooks/useAnalytics';
import { toast } from 'sonner';
import { isHiddenBillingProductHandle, type ServiceAddOnCode } from '@/lib/serviceAddOns';

export interface CartAttribute {
  key: string;
  value: string;
}

export interface CartItem {
  product: ShopifyProduct;
  // Display identity only: do not change Shopify attributes or cart-line equality.
  serviceAddOnCode?: ServiceAddOnCode;
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
  checkoutError: string | null;

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

const sameAttributes = (left?: CartAttribute[], right?: CartAttribute[], days?: number | null) => (
  JSON.stringify(normalizeFulfillmentAttributes(left, days) || []) === JSON.stringify(normalizeFulfillmentAttributes(right, days) || [])
);

// Multiple tabs can leave old and current automatic-copy versions in storage.
// Collapse only lines with the existing variant/attribute identity, summing all
// quantities once and retaining the first line's product, options and price.
const normalizeCartItems = (items: CartItem[]): CartItem[] => {
  const normalized: CartItem[] = [];
  for (const item of items) {
    const candidate = { ...item, customAttributes: normalizeFulfillmentAttributes(item.customAttributes, getProductShipsWithin(item.product.node)) };
    const existing = normalized.find(current => current.variantId === candidate.variantId
      && sameAttributes(current.customAttributes, candidate.customAttributes, getProductShipsWithin(candidate.product.node)));
    if (existing) existing.quantity += candidate.quantity;
    else normalized.push(candidate);
  }
  return normalized;
};

// Cart attributes also contain free-text fit/color requests and measurements.
// Keep those for fulfillment only; never infer an analytics value from a key
// substring. Both key and value must match a fixed storefront choice, and only
// its fixed label is emitted (including for older locally persisted carts).
const ANALYTICS_TAILORING_CHOICES = [
  { key: 'Stitching Type', value: 'Semi Stitched', label: 'Semi Stitched' },
  { key: 'Stitching Type', value: 'Ready to Wear', label: 'Ready to Wear' },
  { key: 'Stitching Type', value: 'Made to Measure (UDesign)', label: 'Made to Measure (UDesign)' },
  { key: 'Tailoring', value: 'Tailored to order', label: 'Tailored to order' },
  { key: 'Custom Size', value: 'Measurements must be confirmed before production', label: 'Custom Size' },
  { key: 'Made to Order', value: 'Yes — confirmation required', label: 'Made to Order' },
  // Preserve fixed analytics dimensions across automatic-copy migrations.
  { key: 'Tailoring', value: 'Alterations / finishing requested', label: 'Tailored to order' },
  { key: 'Custom Size', value: 'Measurements must be confirmed before alterations', label: 'Custom Size' },
  { key: 'Fit Request', value: 'Confirmation required', label: 'Made to Order' },
] as const;

const getTailoringOption = (item: CartItem) => ANALYTICS_TAILORING_CHOICES
  .find((choice) => item.customAttributes?.some((attribute) => (
    attribute.key === choice.key && attribute.value === choice.value
  )))?.label;

const appliesToProductTitle = (item: CartItem) => item.customAttributes
  ?.find((attribute) => attribute.key === 'Applies To')
  ?.value;

const isServiceLine = (item: CartItem) => isHiddenBillingProductHandle(item.product.node.handle);

// New measurement submissions carry a per-add reference on the garment and
// each paid service. A title alone must not associate two configurations of
// the same garment. Only legacy pairs without a reference retain title linkage.
const isDependentServiceFor = (service: CartItem, garment: CartItem): boolean => {
  if (!isServiceLine(service) || appliesToProductTitle(service) !== garment.product.node.title) return false;
  const serviceReference = service.customAttributes?.find(attribute => attribute.key === 'Configuration reference');
  const garmentReference = garment.customAttributes?.find(attribute => attribute.key === 'Configuration reference');
  if (serviceReference || garmentReference) {
    return Boolean(serviceReference?.value.trim())
      && Boolean(garmentReference?.value.trim())
      && serviceReference?.value === garmentReference?.value;
  }
  return true;
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
      checkoutError: null,

      addItem: (item) => {
        const items = normalizeCartItems(get().items);
        const normalizedItem = { ...item, customAttributes: normalizeFulfillmentAttributes(item.customAttributes, getProductShipsWithin(item.product.node)) };
        const existingItem = items.find((current) => (
          current.variantId === item.variantId
          && sameAttributes(current.customAttributes, item.customAttributes, getProductShipsWithin(item.product.node))
        ));

        // Fire only after a valid cart action. Variant ID, selected variant, and
        // tailoring option are preserved for item-level GA4 analysis.
        trackAddToCart(toAnalyticsItem(item));

        if (existingItem) {
          set({
            checkoutError: null,
            items: items.map((current) => (
              current.variantId === item.variantId
              && sameAttributes(current.customAttributes, item.customAttributes, getProductShipsWithin(item.product.node))
                ? { ...current, quantity: current.quantity + item.quantity, customAttributes: normalizeFulfillmentAttributes(current.customAttributes, getProductShipsWithin(current.product.node)) }
                : current
            )),
          });
        } else {
          set({ items: [...items, normalizedItem], checkoutError: null });
        }
      },

      updateQuantity: (variantId, quantity, customAttributes) => {
        const current = get().items.find((item) => (
          item.variantId === variantId
          && sameAttributes(item.customAttributes, customAttributes, getProductShipsWithin(item.product.node))
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

        const shouldSyncServiceQuantities = !isServiceLine(current);

        set({
          checkoutError: null,
          items: get().items.map((item) => {
            const isCurrentLine = item.variantId === variantId
              && sameAttributes(item.customAttributes, customAttributes, getProductShipsWithin(item.product.node));
            const isDependentService = shouldSyncServiceQuantities
              && isDependentServiceFor(item, current);

            return isCurrentLine || isDependentService
              ? { ...item, quantity, customAttributes: normalizeFulfillmentAttributes(item.customAttributes, getProductShipsWithin(item.product.node)) }
              : item;
          }),
        });
      },

      removeItem: (variantId, customAttributes) => {
        const itemToRemove = get().items.find((item) => (
          item.variantId === variantId
          && sameAttributes(item.customAttributes, customAttributes, getProductShipsWithin(item.product.node))
        ));
        if (!itemToRemove) return;

        const removeDependentServices = !isServiceLine(itemToRemove);
        const linesToRemove = get().items.filter((item) => {
          const isCurrentLine = item.variantId === variantId
            && sameAttributes(item.customAttributes, customAttributes, getProductShipsWithin(item.product.node));
          const isDependentService = removeDependentServices
            && isDependentServiceFor(item, itemToRemove);
          return isCurrentLine || isDependentService;
        });

        linesToRemove.forEach((item) => trackRemoveFromCart(toAnalyticsItem(item)));
        set({
          checkoutError: null,
          items: get().items.filter((item) => !linesToRemove.includes(item)),
        });
      },

      clearCart: () => {
        set({ items: [], cartId: null, checkoutUrl: null, checkoutError: null });
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
        const { setLoading, setCheckoutUrl } = get();
        const items = normalizeCartItems(get().items);
        if (items.length === 0) return null;
        if (items.some(item => hasPendingMeasurementAttributes(item.customAttributes))) {
          const message = 'Re-enter your measurement details on the product page before checkout. They are not saved on this device.';
          set({ items, checkoutError: message, checkoutUrl: null, cartId: null, isLoading: false });
          toast.error(message);
          return null;
        }
        set({ items });

        const totalValue = items.reduce(
          (sum, item) => sum + Number(item.price.amount) * item.quantity,
          0,
        );
        trackBeginCheckout(
          items.map((item) => toAnalyticsItem(item)),
          totalValue,
          items[0]?.price.currencyCode,
        );

        set({ isLoading: true, checkoutError: null });
        try {
          const checkoutUrl = await createStorefrontCheckout(
            items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              handle: item.product.node.handle,
              customAttributes: normalizeFulfillmentAttributes(item.customAttributes, getProductShipsWithin(item.product.node)),
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
          const message = 'Checkout could not be created. Your bag is saved — please try again.';
          set({ checkoutError: message });
          toast.error(message);
          return null;
        } catch (error) {
          console.error('Failed to create checkout:', error);
          const message = error instanceof CheckoutCartChangedError
            ? error.message
            : 'Checkout is temporarily unavailable. Your bag is saved — please try again.';
          set({ checkoutError: message });
          toast.error(message);
          return null;
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Keep submitted measurements in memory for this checkout only. A
        // reloaded cart retains product/configuration identity, never raw details.
        const items = state.items.map(item => ({
          ...item,
          customAttributes: redactMeasurementAttributes(item.customAttributes),
        }));
        const requiresMeasurementReentry = items.some(item => hasPendingMeasurementAttributes(item.customAttributes));
        return {
          items,
          cartId: requiresMeasurementReentry ? null : state.cartId,
          checkoutUrl: requiresMeasurementReentry ? null : state.checkoutUrl,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          const serialized = JSON.stringify(state.items) + (state.checkoutUrl || '');
          if (serialized.includes('lovable.app')) {
            state.items = [];
            state.cartId = null;
            state.checkoutUrl = null;
            return;
          }

          if (state.items.some(item => hasPendingMeasurementAttributes(item.customAttributes))) {
            state.cartId = null;
            state.checkoutUrl = null;
          }

          // Remove legacy implementation details from carts created before the
          // customer-facing service experience was refined. Shopify displays
          // cart attributes in checkout, so only shopper-friendly context may
          // be persisted on service lines.
          state.items = normalizeCartItems(state.items.map((item) => ({
            ...item,
            customAttributes: normalizeFulfillmentAttributes(item.customAttributes?.filter((attribute) => {
              if (attribute.key === 'Related Product Handle') return false;
              if (!isServiceLine(item) && attribute.key === 'Selected Paid Services') return false;
              return true;
            }), getProductShipsWithin(item.product.node)),
          })));
        }
      },
    },
  ),
);
