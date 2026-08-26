import { motion } from 'framer-motion';
import { Clock, FileText, Package, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  SHIPPING_CONSOLIDATION_NOTICE,
  SHIPPING_DESTINATION_NAMES,
  SHIPPING_POLICY_SUMMARY,
  SHIPPING_TIMING_NOTICE,
  SHIPPING_ZONES,
} from '@/config/shippingPolicy';

const formatUsd = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const Shipping = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="International Shipping Rates & Delivery | LuxeMia"
        description="See LuxeMia tracked shipping rates for the USA, Canada, UK, Australia, New Zealand, South Africa and Mauritius, including free-shipping thresholds and customs guidance."
        canonical="https://luxemia.shop/shipping"
      />
      <Header />

      <main id="main-content" className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">Clear rates before checkout</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Shipping &amp; Delivery</h1>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                LuxeMia ships to {SHIPPING_DESTINATION_NAMES}. {SHIPPING_TIMING_NOTICE} Contact us before ordering when an event date is fixed.
              </p>
            </motion.div>
          </div>
        </section>

        <aside aria-labelledby="shipping-at-a-glance" className="py-10 border-y border-border bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 id="shipping-at-a-glance" className="sr-only">Shipping at a glance</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-5xl mx-auto">
              <div>
                <dt className="text-sm text-muted-foreground">Supported destinations</dt>
                <dd className="mt-1 text-3xl font-serif font-semibold text-primary">7 countries</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Every dispatched order</dt>
                <dd className="mt-1 text-3xl font-serif font-semibold text-primary">Tracked</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Express or split shipment</dt>
                <dd className="mt-1 text-3xl font-serif font-semibold text-primary">Quoted</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: 'Route-Based Rates', desc: 'Pricing reflects each destination group rather than one worldwide rate' },
                { icon: Package, title: 'Consolidated Orders', desc: 'Multi-item orders normally ship together after all pieces are ready' },
                { icon: Clock, title: 'Timing Shown', desc: 'Processing and carrier transit are stated separately' },
                { icon: ShieldCheck, title: 'Tracked Dispatch', desc: 'Tracking is provided after the parcel is dispatched' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-serif">Standard Shipping Rates</h2>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>
                    <th className="px-5 py-4 font-medium">Destination</th>
                    <th className="px-5 py-4 font-medium">Standard rate</th>
                    <th className="px-5 py-4 font-medium">Free shipping</th>
                    <th className="px-5 py-4 font-medium">Duties and taxes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {SHIPPING_ZONES.map((zone) => (
                    <tr key={zone.id}>
                      <td className="px-5 py-4 font-medium text-foreground">{zone.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{formatUsd(zone.standardRate)} per order</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {zone.freeShippingThreshold ? `At ${formatUsd(zone.freeShippingThreshold)}+ after discounts` : 'Not automatically offered'}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{zone.duties}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Rates are stated in USD. Shopify may display an available local presentment currency. Checkout controls the final converted amount and available service.
            </p>
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-serif">How Your Order Moves</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                ['1', 'Processing', 'The product page shows the current processing or ship-by estimate when available. Tailoring, sourcing or made-to-order work occurs before dispatch.'],
                ['2', 'Consolidation', 'When an order contains multiple items, the item with the longest processing time normally determines the dispatch date.'],
                ['3', 'Tracked Transit', 'Carrier transit starts after dispatch. Tracking is sent when the parcel enters the shipping workflow.'],
              ].map(([step, title, copy]) => (
                <div key={step} className="rounded-lg border border-border bg-card p-6">
                  <p className="font-serif text-3xl text-primary">{step}</p>
                  <h3 className="mt-4 font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-6 text-sm leading-6 text-muted-foreground">
              <p>{SHIPPING_CONSOLIDATION_NOTICE}</p>
              <p className="mt-3">Express service is never assumed. Contact <a className="text-primary underline" href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> before ordering with the product, destination and event date so the incremental carrier cost can be checked.</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="text-2xl font-serif mb-8 text-center">Shipping FAQ</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="destinations">
                <AccordionTrigger>Where does LuxeMia ship?</AccordionTrigger>
                <AccordionContent>LuxeMia ships to {SHIPPING_DESTINATION_NAMES}. Checkout accepts addresses only in currently enabled shipping countries.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="rates">
                <AccordionTrigger>How much is shipping?</AccordionTrigger>
                <AccordionContent>{SHIPPING_POLICY_SUMMARY} Discounts are applied before free-shipping eligibility.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="timing">
                <AccordionTrigger>How quickly will my order arrive?</AccordionTrigger>
                <AccordionContent>{SHIPPING_TIMING_NOTICE} Carrier and customs delays can occur, so contact LuxeMia before ordering for a fixed event date.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="duties">
                <AccordionTrigger>Are duties and import taxes included?</AccordionTrigger>
                <AccordionContent>Do not assume duties are prepaid. Outside the United States, the customer is responsible for duties, import taxes, brokerage and carrier fees unless checkout explicitly states that they are included.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="address">
                <AccordionTrigger>Can I change my address after ordering?</AccordionTrigger>
                <AccordionContent>Email hello@luxemia.shop immediately with the order number. Once processing or label creation begins, an address change may not be possible.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shipping;
