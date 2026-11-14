import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout } from '@/lib/shopify';
import { CheckoutCartChangedError } from '@/lib/checkoutCartIntegrity';
import { getProductShipsWithin } from '@/lib/shipBy';
import { hasUnconfirmedTargetTailoring, isEnquiryOnlyVariant, requiresTailoringEnquiry, TAILORING_ENQUIRY_NOTICE } from '@/lib/tailoringEnquiry';
import { getCartCheckoutSignature, normalizeCartItems, sameCartAttributes as sameAttributes } from '@/lib/cartCheckoutSnapshot';
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
  cartRevision: number;
  preparedShopifyCheckoutUrl: string | null;
  preparedCheckoutSignature: string | null;
  preparedCheckoutRevision: number | null;
  checkoutPreparationStatus: 'idle' | 'preparing' | 'ready' | 'error';

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
  createCheckout: (options?: { trackIntent?: boolean; retry?: boolean }) => Promise<string | null>;
  prepareCheckout: (retry?: boolean) => Promise<string | null>;
  trackPreparedCheckoutIntent: () => void;
}

export { getCartCheckoutSignature } from '@/lib/cartCheckoutSnapshot';

const hasLocallyUnavailableItems = (items: CartItem[]): boolean => items.some(item => (
  item.product.node.variants?.edges?.find(edge => edge.node.id === item.variantId)?.node.availableForSale === false
));

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

const getCheckoutInvalidation = (state: CartStore) => ({
  cartRevision: (state.cartRevision ?? 0) + 1,
  cartId: null,
  checkoutUrl: null,
  preparedShopifyCheckoutUrl: null,
  preparedCheckoutSignature: null,
  preparedCheckoutRevision: null,
  checkoutPreparationStatus: 'idle' as const,
  checkoutError: null,
  isLoading: false,
});

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
    (set, get) => {
      let requestRevision = 0;
      let activeCheckout: Promise<string | null> | null = null;
      let pendingPreparation: { cartRevision: number; signature: string; promise: Promise<string | null> } | null = null;
      const invalidateCheckout = () => {
        // Advance even for A -> B -> A edits; a matching signature alone cannot
        // authorize a response from an earlier version of the bag.
        requestRevision += 1;
        pendingPreparation = null;
        return getCheckoutInvalidation(get());
      };
      return {
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isCartOpen: false,
      checkoutError: null,
      cartRevision: 0,
      preparedShopifyCheckoutUrl: null,
      preparedCheckoutSignature: null,
      preparedCheckoutRevision: null,
      checkoutPreparationStatus: 'idle',

      addItem: (item) => {
        if (isEnquiryOnlyVariant(item.product.node.handle, item.variantId, item.selectedOptions)) {
          set({ ...invalidateCheckout(), checkoutError: TAILORING_ENQUIRY_NOTICE });
          toast.error(TAILORING_ENQUIRY_NOTICE);
          return;
        }
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
            ...invalidateCheckout(),
            items: items.map((current) => (
              current.variantId === item.variantId
              && sameAttributes(current.customAttributes, item.customAttributes, getProductShipsWithin(item.product.node))
                ? { ...current, quantity: current.quantity + item.quantity, customAttributes: normalizeFulfillmentAttributes(current.customAttributes, getProductShipsWithin(current.product.node)) }
                : current
            )),
          });
        } else {
          set({ ...invalidateCheckout(), items: [...items, normalizedItem] });
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
        if (quantityDelta === 0) return;
        if (quantityDelta > 0) {
          trackAddToCart(toAnalyticsItem(current, quantityDelta));
        } else if (quantityDelta < 0) {
          trackRemoveFromCart(toAnalyticsItem(current, Math.abs(quantityDelta)));
        }

        const shouldSyncServiceQuantities = !isServiceLine(current);

        set({
          ...invalidateCheckout(),
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
          ...getCheckoutInvalidation(get()),
          items: get().items.filter((item) => !linesToRemove.includes(item)),
        });
      },

      clearCart: () => {
        set({ ...invalidateCheckout(), items: [] });
      },

      setCartId: (cartId) => set({ cartId }),
      // Legacy setters remain available, but cannot enable the prepared link.
      setCheckoutUrl: (checkoutUrl) => set({ ...invalidateCheckout(), cartId: get().cartId, checkoutUrl }),
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

      prepareCheckout: (retry = false) => get().createCheckout({ trackIntent: false, retry }),

      trackPreparedCheckoutIntent: () => {
        const state = get();
        if (state.checkoutPreparationStatus !== 'ready' || !state.preparedShopifyCheckoutUrl
          || state.preparedCheckoutRevision !== state.cartRevision
          || state.preparedCheckoutSignature !== getCartCheckoutSignature(state.items)
          || hasLocallyUnavailableItems(state.items)) return;
        const totalValue = state.items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);
        // Called by a real anchor activation only. No navigation, cancellation,
        // synthetic clicks or drawer closing is performed here.
        trackBeginCheckout(state.items.map(item => toAnalyticsItem(item)), totalValue, state.items[0]?.price.currencyCode);
        trackCheckoutHandoffSuccess(state.items.map(item => toAnalyticsItem(item)), totalValue, state.items[0]?.price.currencyCode);
      },

      createCheckout: async ({ trackIntent = true, retry = false } = {}) => {
        const items = normalizeCartItems(get().items);
        const signature = getCartCheckoutSignature(items);
        const cartRevision = get().cartRevision;
        const preparation = !trackIntent;
        if (preparation && get().preparedCheckoutRevision === cartRevision && get().preparedCheckoutSignature === signature) {
          if (get().checkoutPreparationStatus === 'ready') return get().preparedShopifyCheckoutUrl;
          if (pendingPreparation?.cartRevision === cartRevision && pendingPreparation.signature === signature) return pendingPreparation.promise;
          if (get().checkoutPreparationStatus === 'error' && !retry) return null;
        }
        if (items.length === 0) {
          set(invalidateCheckout());
          return null;
        }
        const revision = ++requestRevision;
        const isCurrent = () => revision === requestRevision && cartRevision === get().cartRevision
          && signature === getCartCheckoutSignature(get().items);
        const fail = (message: string) => {
          if (!isCurrent()) return;
          set({ checkoutError: message, checkoutUrl: null, preparedShopifyCheckoutUrl: null,
            cartId: null, isLoading: false, checkoutPreparationStatus: 'error' });
          if (trackIntent) toast.error(message);
        };
        set({ items, isLoading: true, checkoutError: null, checkoutUrl: null, cartId: null,
          preparedShopifyCheckoutUrl: null, preparedCheckoutSignature: signature,
          preparedCheckoutRevision: cartRevision, checkoutPreparationStatus: 'preparing' });
        if (hasLocallyUnavailableItems(items)) {
          fail('One or more items is no longer available. Remove it from your bag to continue.');
          return null;
        }
        if (hasUnconfirmedTargetTailoring(items.map(item => ({ ...item, handle: item.product.node.handle, title: item.product.node.title })))) {
          fail(TAILORING_ENQUIRY_NOTICE);
          return null;
        }
        if (items.some(item => hasPendingMeasurementAttributes(item.customAttributes))) {
          const message = 'Re-enter your measurement details on the product page before checkout. They are not saved on this device.';
          fail(message);
          return null;
        }

        const totalValue = items.reduce(
          (sum, item) => sum + Number(item.price.amount) * item.quantity,
          0,
        );
        if (trackIntent) {
          trackBeginCheckout(items.map((item) => toAnalyticsItem(item)), totalValue, items[0]?.price.currencyCode);
        }

        // Serialize Shopify creation, coalescing edits while an older request is
        // pending. Re-renders/reopens reuse one request per stable bag; superseded
        // queued snapshots never create their own abandoned Shopify carts.
        const previousCheckout = activeCheckout;
        const promise = (async () => {
          try {
            await previousCheckout;
            if (!isCurrent()) return null;
            const expectedPrices: Record<string, CartItem['price']> = {};
            for (const item of items) {
              const previous = expectedPrices[item.variantId];
              if (previous && (Number(previous.amount) !== Number(item.price.amount) || previous.currencyCode !== item.price.currencyCode)) {
                throw new CheckoutCartChangedError('A selected product price changed. Reload the product page to review its current price before checkout.');
              }
              expectedPrices[item.variantId] = item.price;
            }
            const checkoutUrl = await createStorefrontCheckout(
              items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                handle: item.product.node.handle,
                customAttributes: normalizeFulfillmentAttributes(item.customAttributes, getProductShipsWithin(item.product.node)),
              })),
              undefined,
              expectedPrices,
            );

            if (!isCurrent()) return null;
            if (checkoutUrl) {
              if (trackIntent) {
                trackCheckoutHandoffSuccess(items.map((item) => toAnalyticsItem(item)), totalValue, items[0]?.price.currencyCode);
              }
              set({ checkoutUrl, preparedShopifyCheckoutUrl: checkoutUrl, checkoutPreparationStatus: 'ready' });
              return checkoutUrl;
            }

            console.error('Shopify returned no checkout URL; preserving the cart');
            const message = 'Checkout could not be created. Your bag is saved — please try again.';
            fail(message);
            return null;
          } catch (error) {
            if (!isCurrent()) return null;
            console.error('Failed to create checkout:', error);
            const message = error instanceof CheckoutCartChangedError
              ? error.message
              : 'Checkout is temporarily unavailable. Your bag is saved — please try again.';
            fail(message);
            return null;
          } finally {
            if (isCurrent()) set({ isLoading: false });
          }
        })();
        activeCheckout = promise;
        if (preparation) pendingPreparation = { cartRevision, signature, promise };
        const checkoutUrl = await promise;
        if (activeCheckout === promise) activeCheckout = null;
        if (pendingPreparation?.promise === promise) pendingPreparation = null;
        return checkoutUrl;
      },
      };
    },
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
        // Prepared URLs/signatures are ephemeral. Preserve legacy setter
        // serialization for API compatibility, but discard it on every reload.
        const hasPreparedCheckout = state.preparedCheckoutSignature !== null;
        return {
          items,
          cartId: requiresMeasurementReentry || hasPreparedCheckout ? null : state.cartId,
          checkoutUrl: requiresMeasurementReentry || hasPreparedCheckout ? null : state.checkoutUrl,
        };
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        items: (persistedState as Partial<CartStore>)?.items ?? currentState.items,
        cartRevision: currentState.cartRevision + 1,
        cartId: null,
        checkoutUrl: null,
        preparedShopifyCheckoutUrl: null,
        preparedCheckoutSignature: null,
        preparedCheckoutRevision: null,
        checkoutPreparationStatus: 'idle',
        isLoading: false,
        checkoutError: null,
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

          if (state.items.some(item => hasPendingMeasurementAttributes(item.customAttributes))
            || hasUnconfirmedTargetTailoring(state.items.map(item => ({ ...item, handle: item.product.node.handle, title: item.product.node.title })))) {
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
              // Retain exact-target legacy linkage until the unconfirmed service is removed.
              if (attribute.key === 'Related Product Handle') return requiresTailoringEnquiry(attribute.value);
              if (!isServiceLine(item) && attribute.key === 'Selected Paid Services') return false;
              return true;
            }), getProductShipsWithin(item.product.node)),
          })));
        }
      },
    },
  ),
);
