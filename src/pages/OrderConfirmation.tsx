import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

/**
 * Public confirmation landing page.
 *
 * Do not read order identifiers, customer email, totals, delivery dates, or
 * other purchase data from query parameters here. This public route has no
 * signed Shopify context, so URL values are not verified order evidence and
 * must not be rendered, sent to Google Customer Reviews, or recorded as a
 * purchase. Verified post-purchase integrations belong in Shopify's protected
 * order-status context.
 */
const OrderConfirmation = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Order Status — LuxeMia"
      description="Return to LuxeMia after checkout and use Shopify's protected order status for verified order details."
      noIndex={true}
    />
    <Header />

    <main className="pt-[90px] lg:pt-[132px]">
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl">
            Check your Shopify order status
          </h1>
          <p className="mb-8 text-gray-600">
            This public page cannot verify an order. Use Shopify's protected order-status page or, if Shopify sends one, its confirmation message for verified order details.
          </p>

          <div className="mb-8 rounded-lg bg-gray-50 p-6 text-left">
            <h2 className="mb-4 font-serif text-lg font-semibold text-gray-900">What happens next?</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#d4a574] text-xs font-bold text-white">1</span>
                <p>If Shopify provides a confirmation message, compare it with the protected order-status page for the details accepted at checkout.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#d4a574] text-xs font-bold text-white">2</span>
                <p>Processing and carrier transit depend on the exact product and destination; use only the timing confirmed for your order.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#d4a574] text-xs font-bold text-white">3</span>
                <p>When tracking is issued, carrier scans can take time to appear after the label is created.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-[#d4a574] px-6 py-3 font-medium text-white transition-colors hover:bg-[#c4956a]"
            >
              Continue Shopping
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
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

export default OrderConfirmation;
