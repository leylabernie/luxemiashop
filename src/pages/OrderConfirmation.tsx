import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { trackPurchase } from '@/hooks/useAnalytics';

declare global {
  interface Window {
    gapi?: {
      surveyoptin?: {
        render: (params: Record<string, unknown>) => void;
      };
      load: (feature: string, callback: () => void) => void;
    };
    renderOptIn?: () => void;
  }
}

interface PersistedCartItem {
  variantId?: string;
  variantTitle?: string;
  price?: { amount?: string; currencyCode?: string };
  quantity?: number;
  customAttributes?: Array<{ key?: string; value?: string }>;
  product?: {
    node?: {
      id?: string;
      handle?: string;
      title?: string;
      productType?: string;
      metadata?: { occasion?: string[] | null };
    };
  };
}

/**
 * Order Confirmation Page
 *
 * After completing a Shopify checkout, customers are redirected here
 * with order details in URL parameters. This page:
 * 1. Displays the order confirmation message
 * 2. Triggers the Google Customer Reviews opt-in survey
 * 3. Tracks the purchase event in GA4
 *
 * Shopify redirect URL format:
 * https://luxemia.shop/order-confirmation?order_id=xxx&email=xxx&country=US&delivery_date=2026-06-01
 */
const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [optInTriggered, setOptInTriggered] = useState(false);

  const orderId = searchParams.get('order_id') || searchParams.get('checkout_id') || '';
  const customerEmail = searchParams.get('email') || '';
  const deliveryCountry = searchParams.get('country') || 'US';
  const deliveryDate = searchParams.get('delivery_date') || '';
  const deliveryState = searchParams.get('state') || '';
  const orderTotal = searchParams.get('total_price') || '';
  const orderCurrency = searchParams.get('currency') || '';

  // Trigger Google Customer Reviews opt-in
  useEffect(() => {
    // Google requires a real order email and estimated delivery date. If
    // Shopify does not provide them, skip the survey instead of inventing data.
    if (optInTriggered || !orderId || !customerEmail || !deliveryDate) return;

    // Load the Google platform.js script ONLY on this page (not globally)
    const existingScript = document.querySelector('script[src*="apis.google.com/js/platform.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const tryRenderOptIn = () => {
      if (window.gapi && window.gapi.surveyoptin) {
        window.gapi.surveyoptin.render({
          merchant_id: 5773333098,
          order_id: orderId,
          email: customerEmail,
          delivery_country: deliveryCountry,
          estimated_delivery_date: deliveryDate,
        });
        setOptInTriggered(true);
      } else if (window.renderOptIn) {
        // Fallback: if the global renderOptIn was loaded but gapi.surveyoptin
        // isn't directly available, re-define it with the real values
        const originalRenderOptIn = window.renderOptIn;
        window.renderOptIn = function () {
          window.gapi?.load('surveyoptin', function () {
            window.gapi?.surveyoptin?.render({
              merchant_id: 5773333098,
              order_id: orderId,
              email: customerEmail,
              delivery_country: deliveryCountry,
              estimated_delivery_date: deliveryDate,
            });
          });
        };
        // Try calling it
        try {
          originalRenderOptIn();
        } catch {
          // Silently fail — opt-in is optional
        }
        setOptInTriggered(true);
      }
    };

    // Retry a few times as the script may still be loading
    const retryDelays = [1000, 3000, 5000];
    const timers = retryDelays.map(delay => setTimeout(tryRenderOptIn, delay));

    // Also try immediately
    tryRenderOptIn();

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [orderId, customerEmail, deliveryCountry, deliveryDate, optInTriggered]);

  // Track purchase in GA4 with the cart items that preceded checkout.
  // Shopify's return URL does not reliably include line items, so recover the
  // persisted Zustand cart. Deduplicate refreshes using sessionStorage.
  useEffect(() => {
    if (!orderId || !orderTotal || typeof window.gtag !== 'function') return;

    const dedupeKey = `luxemia-purchase-tracked:${orderId}`;
    if (sessionStorage.getItem(dedupeKey)) return;

    let items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      variant?: string;
      productGroupId?: string;
      tailoringOption?: string;
      occasion?: string;
    }> = [];
    let cartCurrency = '';
    try {
      const persisted = JSON.parse(localStorage.getItem('shopify-cart') || '{}') as {
        state?: { items?: PersistedCartItem[] };
      };
      const cartItems = persisted.state?.items ?? [];
      cartCurrency = cartItems[0]?.price?.currencyCode || '';
      items = cartItems.map((item) => ({
        id: item.variantId || item.product?.node?.id || item.product?.node?.handle || 'unknown',
        name: item.product?.node?.title || item.variantTitle || 'LuxeMia product',
        price: Number(item.price?.amount || 0),
        quantity: Number(item.quantity || 1),
        category: item.product?.node?.productType,
        variant: item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : undefined,
        productGroupId: item.product?.node?.id,
        tailoringOption: item.customAttributes
          ?.find((attribute) => /stitch|tailor|custom|measurement/i.test(attribute.key || ''))
          ?.value,
        occasion: item.product?.node?.metadata?.occasion?.join(', ') || undefined,
      }));
    } catch {
      // Purchase tracking should never block the confirmation page.
    }

    trackPurchase({
      transactionId: orderId,
      value: parseFloat(orderTotal),
      currency: orderCurrency || cartCurrency || 'USD',
      shippingCountry: deliveryCountry,
      shippingState: deliveryState || undefined,
      items,
    });
    sessionStorage.setItem(dedupeKey, '1');
  }, [deliveryCountry, deliveryState, orderCurrency, orderId, orderTotal]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Order Confirmed — Thank You | LuxeMia"
        description="Your order has been confirmed. Thank you for shopping at LuxeMia."
        noIndex={true}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px]">
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>

          <p className="text-gray-600 text-lg mb-2">
            Thank you for shopping with LuxeMia!
          </p>

          {orderId && (
            <p className="text-gray-500 text-sm mb-8">
              Order ID: <span className="font-mono font-medium text-gray-700">{orderId}</span>
            </p>
          )}

          {/* Order details card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <p>You'll receive an order confirmation email at {customerEmail ? <strong>{customerEmail}</strong> : 'your email address'}.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <p>We’ll prepare your order and email you when its status changes.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <p>Tracking details will be emailed after your order dispatches.</p>
              </div>
            </div>
          </div>

          {/* Only promise the Google survey when the required order data exists. */}
          {customerEmail && deliveryDate && (
            <div className="bg-blue-50 rounded-lg p-4 mb-8 text-sm text-blue-800">
              <p className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                You may see a Google Customer Reviews survey after delivery.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#d4a574] hover:bg-[#c4956a] text-white font-medium rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
