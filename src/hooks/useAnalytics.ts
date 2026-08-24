import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-D1NN0TC3Y0';

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event',
      targetIdOrEventName: string,
      params?: Record<string, unknown>,
    ) => void;
    dataLayer: unknown[];
  }
}

export interface AnalyticsItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
  category?: string;
  variant?: string;
  productGroupId?: string;
  itemListId?: string;
  itemListName?: string;
  index?: number;
  tailoringOption?: string;
  occasion?: string;
}

interface AnalyticsPurchase {
  transactionId: string;
  value: number;
  currency?: string;
  items: AnalyticsItem[];
  tax?: number;
  shipping?: number;
  coupon?: string;
  shippingCountry?: string;
  shippingState?: string;
  customerType?: 'new' | 'returning' | 'unknown';
}

const cleanString = (value?: string) => value?.trim() || undefined;
const resolveCurrency = (currency?: string) => cleanString(currency)?.toUpperCase() || 'USD';

const toGaItem = (item: AnalyticsItem) => ({
  item_id: item.id,
  item_name: item.name,
  price: item.price,
  quantity: item.quantity ?? 1,
  ...(cleanString(item.category) && { item_category: cleanString(item.category) }),
  ...(cleanString(item.variant) && { item_variant: cleanString(item.variant) }),
  ...(cleanString(item.productGroupId) && { item_product_group_id: cleanString(item.productGroupId) }),
  ...(cleanString(item.itemListId) && { item_list_id: cleanString(item.itemListId) }),
  ...(cleanString(item.itemListName) && { item_list_name: cleanString(item.itemListName) }),
  ...(typeof item.index === 'number' && { index: item.index }),
  ...(cleanString(item.tailoringOption) && { item_tailoring_option: cleanString(item.tailoringOption) }),
  ...(cleanString(item.occasion) && { item_occasion: cleanString(item.occasion) }),
});

const sendEcommerceEvent = (
  eventName: string,
  items: AnalyticsItem[],
  value: number,
  currency?: string,
  additionalParams: Record<string, unknown> = {},
) => {
  if (typeof window.gtag !== 'function' || !Number.isFinite(value)) return;

  window.gtag('event', eventName, {
    currency: resolveCurrency(currency),
    value,
    ...additionalParams,
    items: items.map(toGaItem),
  });
};

const cartValue = (items: AnalyticsItem[]) => items.reduce(
  (total, item) => total + item.price * (item.quantity ?? 1),
  0,
);

// Track page views for SPA navigation.
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        send_to: GA_MEASUREMENT_ID,
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);
};

export const trackViewItemList = (
  items: AnalyticsItem[],
  itemListId: string,
  itemListName: string,
  currency?: string,
) => {
  sendEcommerceEvent('view_item_list', items.map((item, index) => ({
    ...item,
    itemListId,
    itemListName,
    index,
  })), cartValue(items), currency);
};

export const trackSelectItem = (
  item: AnalyticsItem,
  itemListId: string,
  itemListName: string,
  currency?: string,
) => {
  sendEcommerceEvent('select_item', [{
    ...item,
    itemListId,
    itemListName,
  }], item.price * (item.quantity ?? 1), currency || item.currency);
};

export const trackViewItem = (item: AnalyticsItem) => {
  sendEcommerceEvent('view_item', [item], item.price * (item.quantity ?? 1), item.currency);
};

export const trackAddToCart = (item: AnalyticsItem) => {
  sendEcommerceEvent('add_to_cart', [item], item.price * (item.quantity ?? 1), item.currency);
};

export const trackRemoveFromCart = (item: AnalyticsItem) => {
  sendEcommerceEvent('remove_from_cart', [item], item.price * (item.quantity ?? 1), item.currency);
};

export const trackViewCart = (items: AnalyticsItem[], currency?: string) => {
  sendEcommerceEvent('view_cart', items, cartValue(items), currency);
};

export const trackAddToWishlist = (item: AnalyticsItem) => {
  sendEcommerceEvent('add_to_wishlist', [item], item.price * (item.quantity ?? 1), item.currency);
};

export const trackBeginCheckout = (items: AnalyticsItem[], totalValue?: number, currency?: string) => {
  sendEcommerceEvent('begin_checkout', items, totalValue ?? cartValue(items), currency);
};

// `begin_checkout` captures shopper intent. This companion event confirms that
// Shopify returned a usable checkout URL, separating checkout-interest from a
// failed or interrupted hosted-checkout handoff without sending customer data.
export const trackCheckoutHandoffSuccess = (
  items: AnalyticsItem[],
  totalValue?: number,
  currency?: string,
) => {
  sendEcommerceEvent(
    'checkout_handoff_success',
    items,
    totalValue ?? cartValue(items),
    currency,
    { checkout_flow: 'direct_cart' },
  );
};

export const trackAddShippingInfo = (
  items: AnalyticsItem[],
  value: number,
  shippingTier: string,
  shippingCountry?: string,
  currency?: string,
) => {
  sendEcommerceEvent('add_shipping_info', items, value, currency, {
    shipping_tier: shippingTier,
    ...(cleanString(shippingCountry) && { shipping_country: cleanString(shippingCountry)?.toUpperCase() }),
  });
};

export const trackAddPaymentInfo = (
  items: AnalyticsItem[],
  value: number,
  paymentType?: string,
  currency?: string,
) => {
  sendEcommerceEvent('add_payment_info', items, value, currency, {
    ...(cleanString(paymentType) && { payment_type: cleanString(paymentType) }),
  });
};

// The purchase event is sent only from OrderConfirmation after an order ID is
// available. This prevents the generic app shell from creating empty or duplicate
// purchases when a shopper returns from Shopify checkout.
export const trackPurchase = (data: AnalyticsPurchase) => {
  if (typeof window.gtag !== 'function' || !data.transactionId || !Number.isFinite(data.value)) return;

  window.gtag('event', 'purchase', {
    transaction_id: data.transactionId,
    currency: resolveCurrency(data.currency),
    value: data.value,
    ...(typeof data.tax === 'number' && { tax: data.tax }),
    ...(typeof data.shipping === 'number' && { shipping: data.shipping }),
    ...(cleanString(data.coupon) && { coupon: cleanString(data.coupon) }),
    ...(cleanString(data.shippingCountry) && { shipping_country: cleanString(data.shippingCountry)?.toUpperCase() }),
    ...(cleanString(data.shippingState) && { shipping_state: cleanString(data.shippingState)?.toUpperCase() }),
    ...(data.customerType && { customer_type: data.customerType }),
    items: data.items.map(toGaItem),
  });
};

export const trackRefund = (data: AnalyticsPurchase) => {
  if (typeof window.gtag !== 'function' || !data.transactionId || !Number.isFinite(data.value)) return;

  window.gtag('event', 'refund', {
    transaction_id: data.transactionId,
    currency: resolveCurrency(data.currency),
    value: data.value,
    items: data.items.map(toGaItem),
  });
};

// Lead events deliberately exclude names, email addresses, phone numbers, and
// postal addresses. Those fields belong in the form/CRM, not GA4 event payloads.
export const trackConsultationSubmission = (data: {
  country?: string;
  occasion?: string;
}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      currency: 'USD',
      value: 0,
      lead_category: 'styling_consultation',
      event_label: data.occasion || 'styling_consultation',
      market_focus: cleanString(data.country)?.toUpperCase() === 'US' ? 'US' : 'international',
    });
  }
};

export const trackConsultationBookingAttempt = (method: 'whatsapp' | 'email') => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'consultation_booking_attempt', {
      contact_method: method,
      market_focus: 'US',
    });
  }
};
