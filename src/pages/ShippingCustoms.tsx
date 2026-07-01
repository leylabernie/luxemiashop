import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const faqs = [
  {
    question: 'Do I have to pay customs duties or import taxes?',
    answer: 'Depending on your country\'s import regulations, your order may be subject to customs duties, import taxes, or clearance fees when it arrives. These charges are set by your local customs authority — not by LuxeMia — and are separate from the price you pay at checkout. Whether you\'re charged, and how much, depends on factors like your country\'s current duty threshold, the declared value of your order, and local trade rules, which can change over time.',
  },
  {
    question: 'When would I need to pay?',
    answer: 'If applicable, these charges are usually collected by the shipping carrier at the time of delivery, not at checkout. Your carrier will typically contact you directly if any payment is required before your package can be delivered.',
  },
  {
    question: 'Want to check in advance?',
    answer: 'Import rules vary by country and can change, so if you\'d like to know what to expect before ordering, we recommend checking directly with your local customs office or postal service.',
  },
  {
    question: 'Questions?',
    answer: 'If you have any questions about your order or shipping, feel free to reach out to us at hello@luxemia.shop — we\'re happy to help.',
  },
];

const ShippingCustoms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping & Customs | Import Duties & Local Taxes | LuxeMia"
        description="Learn how international shipping and customs work at LuxeMia. Information on import duties, local taxes, and customs clearance for orders shipped from India to USA, Canada, Australia, and beyond."
        canonical="https://luxemia.shop/pages/shipping-customs"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Shipping & Customs', url: '/pages/shipping-customs' },
        ]}
        faqs={faqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero */}
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
                <span className="text-foreground">Shipping & Customs</span>
              </nav>
              <h1 className="font-serif text-4xl md:text-5xl mb-4">Shipping & Customs</h1>
              <p className="text-lg text-muted-foreground">
                We ship internationally to the USA, Canada, Australia, and beyond, with each order
                sent directly from our workshop in India.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content — calm, FAQ-style narrative */}
        <section className="container mx-auto px-4 lg:px-8 max-w-3xl py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-10"
          >
            {/* Do I have to pay customs duties or import taxes? */}
            <div>
              <h2 className="font-serif text-2xl mb-4">
                Do I have to pay customs duties or import taxes?
              </h2>
              <div className="space-y-4 text-base text-foreground/90 leading-relaxed">
                <p>
                  Depending on your country's import regulations, your order may be subject to
                  customs duties, import taxes, or clearance fees when it arrives. These charges
                  are set by your local customs authority — not by LuxeMia — and are separate from
                  the price you pay at checkout.
                </p>
                <p className="text-muted-foreground">
                  Whether you're charged, and how much, depends on factors like your country's
                  current duty threshold, the declared value of your order, and local trade rules,
                  which can change over time.
                </p>
              </div>
            </div>

            {/* When would I need to pay? */}
            <div>
              <h2 className="font-serif text-2xl mb-4">When would I need to pay?</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                If applicable, these charges are usually collected by the shipping carrier at the
                time of delivery, not at checkout. Your carrier will typically contact you directly
                if any payment is required before your package can be delivered.
              </p>
            </div>

            {/* Want to check in advance? */}
            <div>
              <h2 className="font-serif text-2xl mb-4">Want to check in advance?</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                Import rules vary by country and can change, so if you'd like to know what to
                expect before ordering, we recommend checking directly with your local customs
                office or postal service.
              </p>
            </div>

            {/* Questions? */}
            <div className="pt-6 border-t border-border">
              <h2 className="font-serif text-2xl mb-4">Questions?</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                If you have any questions about your order or shipping, feel free to reach out to
                us at{' '}
                <a
                  href="mailto:hello@luxemia.shop"
                  className="text-primary underline hover:text-primary/80 transition-colors"
                >
                  hello@luxemia.shop
                </a>{' '}
                — we're happy to help.
              </p>
            </div>
          </motion.div>

          {/* Subtle cross-link to full Shipping Policy */}
          <div className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Looking for shipping rates, delivery times, or tracking?
            </p>
            <Link
              to="/shipping"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              View Full Shipping Policy
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
