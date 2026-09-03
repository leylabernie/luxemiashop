import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  GA_MEASUREMENT_ID,
  initializeAnalyticsFromStoredConsent,
  isAnalyticsConsentGranted,
  setAnalyticsPageContext,
} from '@/lib/analyticsConsent';
import {
  toAnalyticsCountry,
  toAnalyticsCurrency,
  toAnalyticsRegion,
  toAnalyticsPageUrl,
  toAnalyticsReferrerOrigin,
  toAnalyticsRoutePath,
  toAnalyticsTailoringCategory,
  toAnalyticsTransactionId,
} from '@/lib/analyticsPrivacy';

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
const resolveCurrency = (currency?: string) => toAnalyticsCurrency(currency);

const sendConsentGatedEvent = (
  eventName: string,
  params: Record<string, unknown>,
  beforeDispatch?: () => void,
): boolean => {
  if (
    typeof window === 'undefined'
    || !isAnalyticsConsentGranted()
    || !initializeAnalyticsFromStoredConsent()
    || typeof window.gtag !== 'function'
  ) return false;

  beforeDispatch?.();
  window.gtag('event', eventName, params);
  return true;
};

const toGaItem = (item: AnalyticsItem) => {
  const tailoringCategory = toAnalyticsTailoringCategory(item.tailoringOption);

  return {
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
    ...(tailoringCategory && { item_tailoring_option: tailoringCategory }),
    ...(cleanString(item.occasion) && { item_occasion: cleanString(item.occasion) }),
  };
};

const sendEcommerceEvent = (
  eventName: string,
  items: AnalyticsItem[],
  value: number,
  currency?: string,
  additionalParams: Record<string, unknown> = {},
) => {
  const resolvedCurrency = resolveCurrency(currency);
  if (
    !Number.isFinite(value)
    || !resolvedCurrency
  ) return;

  sendConsentGatedEvent(eventName, {
    currency: resolvedCurrency,
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
  const previousPageLocation = useRef<string | undefined>(
    typeof document === 'undefined' ? undefined : toAnalyticsReferrerOrigin(document.referrer),
  );

  useEffect(() => {
    const sendPageView = () => {
      if (typeof window === 'undefined') return;

      const pageLocation = toAnalyticsPageUrl(`${window.location.origin}${location.pathname}`);
      if (!pageLocation) return;
      const pagePath = toAnalyticsRoutePath(location.pathname);
      if (!sendConsentGatedEvent('page_view', {
        send_to: GA_MEASUREMENT_ID,
        // Query strings can contain checkout or contact identifiers. Analytics
        // receives only the route, never a search string or fragment.
        page_path: pagePath,
        page_location: pageLocation,
        page_title: document.title,
      }, () => {
        setAnalyticsPageContext(pageLocation, previousPageLocation.current);
      })) return;
      previousPageLocation.current = pageLocation;
    };

    sendPageView();
    const handleConsentChange = (event: Event) => {
      const choice = (event as CustomEvent<{ choice?: string }>).detail?.choice;
      if (choice === 'accepted') sendPageView();
    };

    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsentChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsentChange);
  }, [location.pathname]);
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
  const normalizedCountry = toAnalyticsCountry(shippingCountry);
  sendEcommerceEvent('add_shipping_info', items, value, currency, {
    shipping_tier: shippingTier,
    ...(normalizedCountry && { shipping_country: normalizedCountry }),
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

// Guarded utility only: the public OrderConfirmation route does not call this
// function or trust order data from its URL. A future authenticated integration
// must supply verified order facts and preserve the consent checks below.
export const trackPurchase = (data: AnalyticsPurchase) => {
  const transactionId = toAnalyticsTransactionId(data.transactionId);
  const currency = resolveCurrency(data.currency);
  const shippingCountry = toAnalyticsCountry(data.shippingCountry);
  const shippingState = toAnalyticsRegion(data.shippingState);
  if (
    !transactionId
    || !currency
    || !Number.isFinite(data.value)
  ) return;

  sendConsentGatedEvent('purchase', {
    transaction_id: transactionId,
    currency,
    value: data.value,
    ...(typeof data.tax === 'number' && { tax: data.tax }),
    ...(typeof data.shipping === 'number' && { shipping: data.shipping }),
    ...(cleanString(data.coupon) && { coupon: cleanString(data.coupon) }),
    ...(shippingCountry && { shipping_country: shippingCountry }),
    ...(shippingState && { shipping_state: shippingState }),
    ...(data.customerType && { customer_type: data.customerType }),
    items: data.items.map(toGaItem),
  });
};

export const trackRefund = (data: AnalyticsPurchase) => {
  const transactionId = toAnalyticsTransactionId(data.transactionId);
  const currency = resolveCurrency(data.currency);
  if (
    !transactionId
    || !currency
    || !Number.isFinite(data.value)
  ) return;

  sendConsentGatedEvent('refund', {
    transaction_id: transactionId,
    currency,
    value: data.value,
    items: data.items.map(toGaItem),
  });
};

// Lead events deliberately exclude names, email addresses, phone numbers, and
// postal addresses. Those fields belong in the form/CRM, not GA4 event payloads.
export const trackConsultationSubmission = (data: {
  country?: string;
  occasion?: 'styling_consultation' | 'wedding_party_group_order';
}) => {
  sendConsentGatedEvent('generate_lead', {
    value: 0,
    lead_category: 'styling_consultation',
    event_label: data.occasion || 'styling_consultation',
    market_focus: cleanString(data.country)?.toUpperCase() === 'US' ? 'US' : 'international',
  });
};

export const trackConsultationBookingAttempt = (method: 'whatsapp' | 'email') => {
  sendConsentGatedEvent('consultation_booking_attempt', {
    contact_method: method,
    support_scope: 'pre_order',
  });
};

const LEAD_EVENT_DETAILS = {
  contact_form: 'customer_inquiry',
  custom_order_form: 'made_to_measure_inquiry',
} as const;

export const trackLeadSubmission = (source: keyof typeof LEAD_EVENT_DETAILS) => (
  sendConsentGatedEvent('generate_lead', {
    lead_source: source,
    lead_type: LEAD_EVENT_DETAILS[source],
  })
);

// Search queries can contain names, email addresses, order numbers, or other
// free-form text. Track only a bounded result count and a fixed storefront scope.
export const trackSearchResults = (resultCount: number): boolean => {
  if (!Number.isFinite(resultCount) || resultCount < 0) return false;

  return sendConsentGatedEvent('view_search_results', {
    search_scope: 'catalog',
    result_count: Math.min(Math.trunc(resultCount), 1_000),
  });
};

export const trackPageNotFound = (): boolean => {
  const pageReferrer = typeof document === 'undefined'
    ? undefined
    : toAnalyticsReferrerOrigin(document.referrer);

  return sendConsentGatedEvent('page_404', {
    // Never send the attempted path: malformed URLs can contain customer data.
    page_path: '/404',
    ...(pageReferrer && { page_referrer: pageReferrer }),
    page_title: '404 — Page Not Found',
  });
};
