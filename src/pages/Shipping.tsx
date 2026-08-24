import { motion } from 'framer-motion';
import { Truck, Clock, Package, FileText, ShoppingBag, ShieldCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FLAT_SHIPPING_RATE = 12;
const FREE_SHIPPING_THRESHOLD = 135;
const SHIPPING_PROMISE = 'LuxeMia currently ships to United States addresses only. Standard shipping is free when the checkout subtotal after discounts is $135 or more and costs $12 below $135.';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="U.S. Shipping Policy | LuxeMia"
        description="LuxeMia ships to United States addresses. Standard shipping is $12 below $135 and free at $135 and above; tracking is emailed after dispatch."
        canonical="https://luxemia.shop/shipping"
      />
      <Header />

      <main id="main-content" className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
                Current shipping availability
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Shipping Policy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {SHIPPING_PROMISE} Review the exact product page for current availability and any tailoring option.
                Contact LuxeMia before ordering if your event date is time-sensitive.
              </p>
            </motion.div>
          </div>
        </section>

        <aside aria-labelledby="shipping-at-a-glance" className="py-10 border-y border-border bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 id="shipping-at-a-glance" className="sr-only">Shipping at a glance</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
              <div>
                <dt className="text-sm text-muted-foreground">Checkout subtotal below ${FREE_SHIPPING_THRESHOLD}</dt>
                <dd className="mt-1 text-3xl font-serif font-semibold text-primary">${FLAT_SHIPPING_RATE}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Checkout subtotal at ${FREE_SHIPPING_THRESHOLD}+</dt>
                <dd className="mt-1 text-3xl font-serif font-semibold text-green-600 dark:text-green-400">Free</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Every dispatched order</dt>
                <dd className="mt-1 text-3xl font-serif font-semibold text-primary">Tracked</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: 'U.S. Only', desc: 'United States shipping addresses' },
                { icon: Package, title: 'In Stock', desc: 'Browse current online styles' },
                { icon: Clock, title: 'Timing Varies', desc: 'Contact us before a time-sensitive event' },
                { icon: ShieldCheck, title: 'Tracked', desc: 'Tracking emailed when the label is created for dispatch' },
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
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-serif">How Shipping Works</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">United States</h3>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Free standard shipping at ${FREE_SHIPPING_THRESHOLD} and above after discounts</li>
                    <li>${FLAT_SHIPPING_RATE} standard shipping below ${FREE_SHIPPING_THRESHOLD}</li>
                    <li>Taxes, if applicable, are calculated at checkout</li>
                    <li>Tracking is emailed when the shipping label is created for dispatch</li>
                  </ul>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Before Ordering</h3>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Review the exact product page and selected options</li>
                    <li>Contact LuxeMia before ordering for a fixed event date</li>
                    <li>Confirm the complete and correct U.S. delivery address</li>
                    <li>Checkout shows the final available shipping service</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-serif">Important Notes</h2>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 mt-8 text-sm text-muted-foreground space-y-3">
                <p>LuxeMia currently accepts United States shipping addresses only.</p>
                <p>
                  Standard delivery is generally estimated at 4–30 business days, including handling and carrier transit. Product,
                  tailoring and carrier conditions can change the estimate. The product page and checkout are
                  authoritative, and delivery dates are not guaranteed.
                </p>
                <p>
                  If an address needs to be corrected, email <span className="text-primary">hello@luxemia.shop</span> within 24 hours.
                  Once a label is created, address changes may not be possible.
                </p>
                <p>
                  Please review the product measurements, availability and any tailoring option before ordering.
                  Contact LuxeMia before ordering if delivery timing is important for your event.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-serif mb-8 text-center">Shipping FAQ</h2>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Where does LuxeMia ship?</AccordionTrigger>
                  <AccordionContent>
                    LuxeMia currently ships to United States addresses only.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How much is shipping?</AccordionTrigger>
                  <AccordionContent>
                    U.S. standard shipping is free when the checkout subtotal after discounts is ${FREE_SHIPPING_THRESHOLD} or more
                    and costs ${FLAT_SHIPPING_RATE} below it. Checkout shows the final available service.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How fast will my order ship?</AccordionTrigger>
                  <AccordionContent>
                    Standard delivery is generally estimated at 4–30 business days, including handling and transit. Timing depends
                    on the product, selected options, and carrier. Contact LuxeMia before ordering for a fixed event date.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I change my shipping address after ordering?</AccordionTrigger>
                  <AccordionContent>
                    Address changes can only be requested within the first 24 hours after ordering. Email hello@luxemia.shop
                    immediately with your order number.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shipping;
