import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import {
  SHIPPING_DESTINATION_NAMES,
  SHIPPING_POLICY_SUMMARY,
  SHIPPING_TIMING_NOTICE,
  SHIPPING_ZONES,
} from '@/config/shippingPolicy';

const formatUsd = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const faqs = [
  {
    question: 'Where does LuxeMia ship?',
    answer: `LuxeMia ships to ${SHIPPING_DESTINATION_NAMES}.`,
  },
  {
    question: 'How are international shipping charges calculated?',
    answer: 'LuxeMia uses route-based flat rates and destination-specific free-shipping thresholds rather than one worldwide rate.',
  },
  {
    question: 'Are duties and import taxes included?',
    answer: 'Outside the United States, duties, import taxes, brokerage and carrier fees may be charged to the customer unless checkout explicitly states otherwise.',
  },
];

const ShippingCustoms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="International Shipping, Duties & Taxes | LuxeMia"
        description="Review LuxeMia shipping rates, customs, duties and tax guidance for the USA, Canada, UK, Australia, New Zealand, South Africa and Mauritius."
        canonical="https://luxemia.shop/pages/shipping-customs"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'International Shipping, Duties & Taxes', url: '/pages/shipping-customs' },
        ]}
        faqs={faqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl py-12 md:py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <span>/</span>
                <span className="text-foreground">Shipping, Duties &amp; Taxes</span>
              </nav>
              <h1 className="font-serif text-4xl md:text-5xl mb-4">International Shipping, Duties &amp; Taxes</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                LuxeMia ships to {SHIPPING_DESTINATION_NAMES}. Rates differ by route so distant destinations are not subsidized by customers on lower-cost routes.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 max-w-4xl py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-10">
            <div>
              <h2 className="font-serif text-2xl mb-4">Current route-based rates</h2>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[620px] text-sm">
                  <thead className="border-b border-border bg-secondary/40 text-left">
                    <tr><th className="px-4 py-3">Destination</th><th className="px-4 py-3">Standard</th><th className="px-4 py-3">Free shipping</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {SHIPPING_ZONES.map((zone) => (
                      <tr key={zone.id}>
                        <td className="px-4 py-3 font-medium">{zone.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatUsd(zone.standardRate)} per order</td>
                        <td className="px-4 py-3 text-muted-foreground">{zone.freeShippingThreshold ? `${formatUsd(zone.freeShippingThreshold)}+ after discounts` : 'Not automatically offered'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{SHIPPING_POLICY_SUMMARY}</p>
            </div>

            <div>
              <h2 className="font-serif text-2xl mb-4">Duties, import taxes and brokerage</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                Do not assume an international parcel is duty paid. For Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius, the recipient is responsible for duties, import taxes, brokerage and carrier fees unless checkout explicitly states that those charges are included. LuxeMia will not advertise DDP service until the selected carrier provides a verified landed-cost quote.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl mb-4">Processing is not carrier transit</h2>
              <p className="text-base text-foreground/90 leading-relaxed">{SHIPPING_TIMING_NOTICE} Multi-item orders normally ship together after the last item is ready. A separately quoted split shipment or express upgrade must be arranged before ordering.</p>
            </div>

            <div>
              <h2 className="font-serif text-2xl mb-4">Questions before ordering?</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                Send the product link, destination country and event date to{' '}
                <a href="mailto:hello@luxemia.shop" className="text-primary underline hover:text-primary/80 transition-colors">hello@luxemia.shop</a>. The product page and checkout control the final availability, processing estimate, currency conversion and shipping service.
              </p>
            </div>
          </motion.div>

          <div className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">Review the complete delivery workflow and FAQ.</p>
            <Link to="/shipping" className="inline-flex items-center gap-2 text-primary hover:underline">
              View Shipping Policy <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingCustoms;
