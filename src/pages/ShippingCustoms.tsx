import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const faqs = [
  {
    question: 'Does LuxeMia ship outside the United States?',
    answer: 'Not currently. LuxeMia checkout accepts United States addresses only. Additional countries are under review but are not active.',
  },
  {
    question: 'How much is US shipping?',
    answer: 'Free US shipping applies at $150 and above. Orders below $150 ship for a flat $12 rate.',
  },
  {
    question: 'How fast will my order ship?',
    answer: 'In-stock online items receive tracking after dispatch. Carrier transit time begins after dispatch.',
  },
];

const ShippingCustoms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="US Shipping & Taxes | LuxeMia"
        description="LuxeMia currently ships to United States addresses only. Free U.S. shipping at $150 and above, $12 flat below that, and online orders ship with tracking after dispatch."
        canonical="https://luxemia.shop/pages/shipping-customs"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'US Shipping & Taxes', url: '/pages/shipping-customs' },
        ]}
        faqs={faqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <span>/</span>
                <span className="text-foreground">US Shipping &amp; Taxes</span>
              </nav>
              <h1 className="font-serif text-4xl md:text-5xl mb-4">US Shipping &amp; Taxes</h1>
              <p className="text-lg text-muted-foreground">
                LuxeMia currently ships to United States addresses only. Free U.S. shipping at $150 and above.
                $12 flat below that. Tracking provided after dispatch.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-10"
          >
            <div>
              <h2 className="font-serif text-2xl mb-4">Shipping promise</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                In-stock online items receive tracking after dispatch. Tracking is emailed after dispatch,
                and carrier transit time starts once the package is handed over.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl mb-4">Taxes</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                Taxes, if applicable, are calculated at checkout. LuxeMia does not currently accept orders for delivery
                addresses outside the United States. Additional country-specific shipping is under review and is not active;
                do not assume international duties, taxes, delivery times, or returns terms until they are published for that country.
              </p>
              <p className="mt-3 text-base text-foreground/90 leading-relaxed">
                If LuxeMia confirms that an item will be fulfilled cross-border, any applicable import-charge treatment must be
                confirmed in writing before the order is accepted; do not assume duty-free delivery from the shipping rate alone.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl mb-4">Questions?</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                If you have any questions about your order or shipping, reach us at{' '}
                <a
                  href="mailto:hello@luxemia.shop"
                  className="text-primary underline hover:text-primary/80 transition-colors"
                >
                  hello@luxemia.shop
                </a>.
              </p>
            </div>
          </motion.div>

          <div className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Looking for the full shipping promise?
            </p>
            <Link
              to="/shipping"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              View Shipping Policy
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingCustoms;
