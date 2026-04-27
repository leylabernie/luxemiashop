import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-D1NN0TC3Y0';
// REPLACE WITH YOUR ACTUAL GOOGLE ADS CONVERSION ID
// const GOOGLE_ADS_CONVERSION_ID = 'AW-XXXXXXXXX';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views for SPA navigation
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};

// E-commerce event helpers
export const trackViewItem = (item: {
  id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: item.currency || 'USD',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
      }],
    });
  }
};

export const trackAddToCart = (item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
  category?: string;
}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: item.currency || 'USD',
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_category: item.category,
      }],
    });
  }
};

export const trackAddToWishlist = (item: {
  id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_wishlist', {
      currency: item.currency || 'USD',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
      }],
    });
  }
};

export const trackBeginCheckout = (items: Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
}>, totalValue: number, currency?: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: currency || 'USD',
      value: totalValue,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
};

// Track purchase event — called after checkout redirect back or on thank-you page
// This is crucial for Google Ads conversion tracking and Merchant Center performance data
export const trackPurchase = (data: {
  transactionId: string;
  value: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: data.transactionId,
      currency: data.currency || 'USD',
      value: data.value,
      items: data.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_category: item.category,
      })),
    });

    // Google Ads conversion event
    // UNCOMMENT WHEN YOU HAVE YOUR GOOGLE ADS CONVERSION ID:
    // window.gtag('event', 'conversion', {
    //   send_to: `${GOOGLE_ADS_CONVERSION_ID}/PURCHASE_CONVERSION_LABEL`,
    //   value: data.value,
    //   currency: data.currency || 'USD',
    //   transaction_id: data.transactionId,
    // });
  }
};

// Track Shopify checkout completion via URL parameters
// When Shopify redirects back to luxemia.shop after checkout, check for order confirmation
export const trackShopifyOrderFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id') || urlParams.get('checkout_id');
  const orderValue = urlParams.get('total_price');

  if (orderId && orderValue) {
    trackPurchase({
      transactionId: orderId,
      value: parseFloat(orderValue),
      currency: 'USD',
      items: [], // Items not available from URL params
    });
  }
};

// Consultation lead tracking
export const trackConsultationSubmission = (data: {
  name: string;
  email: string;
  phone: string;
  country: string;
  occasion?: string;
  budget?: string;
}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      currency: 'USD',
      value: 0, // Lead value can be set based on budget
      lead_category: 'styling_consultation',
      event_category: 'engagement',
      event_label: data.occasion || 'styling_consultation',
      user_data: {
        phone_number: data.phone,
        address: {
          country: data.country,
        },
      },
    });
  }
};

export const trackConsultationBookingAttempt = (method: 'whatsapp' | 'email') => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'consultation_booking_attempt', {
      event_category: 'engagement',
      event_label: `consultation_${method}`,
      currency: 'USD',
    });
  }
};
