import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

/**
 * Shopify owns the authoritative order confirmation and Reviews opt-in.
 * This public return route has no authenticated order-data handoff. URL
 * parameters must never confirm a purchase or enroll an alleged order.
 */
const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Order Details & Next Steps | LuxeMia"
        description="Find your LuxeMia order details in your Shopify confirmation email, or contact us for help."
        noIndex={true}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px]">
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Order information icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Order Details
          </h1>

          <p className="text-gray-600 text-lg mb-2">
            If you completed checkout, your confirmation email contains your order number and order details.
          </p>

          {/* Order details card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">After Your Purchase</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <p>Check the email address you used at checkout for your order confirmation and order-status link.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <p>If you have not received a confirmation, contact LuxeMia before placing the order again.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#d4a574] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <p>For completed orders, tracking details will be emailed after dispatch.</p>
              </div>
            </div>
          </div>

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
