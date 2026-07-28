import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Truck, Clock, Package, FileText, ShoppingBag, ShieldCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FLAT_SHIPPING_RATE = 12;
const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_PROMISE = 'Free U.S. shipping over $150. $12 flat below that. Tracking provided after dispatch.';

const Shipping = () => {
  const shippingSchemas = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OfferShippingDetails',
        '@id': 'https://luxemia.shop/#shippingDetailsFreeUS',
        name: 'Free US Shipping Over $150',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 2,
            unitCode: 'DAY',
            description: 'Tracking provided after dispatch',
          },
        },
      },
      {
        '@type': 'OfferShippingDetails',
        '@id': 'https://luxemia.shop/#shippingDetailsFlatUS',
        name: 'Flat US Shipping Below $150',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '12.00',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 2,
            unitCode: 'DAY',
            description: 'Tracking provided after dispatch',
          },
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping Policy — Online US Delivery | LuxeMia"
        description="Free U.S. shipping over $150. $12 flat below that. In-stock Indian ethnic wear tracking provided after dispatch from LuxeMia."
        canonical="https://luxemia.shop/shipping"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(shippingSchemas)}
        </script>
      </Helmet>
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
                United States shipping only
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Shipping Policy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {SHIPPING_PROMISE} LuxeMia is positioned for customers who need an in-stock outfit quickly,
                not a made-to-order garment with a long production window.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-10 border-y border-border bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-3xl mx-auto">
              <div>
                <p className="text-3xl font-serif font-semibold text-primary">${FLAT_SHIPPING_RATE}</p>
                <p className="text-sm text-muted-foreground mt-1">flat below ${FREE_SHIPPING_THRESHOLD}</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-semibold text-green-600 dark:text-green-400">FREE</p>
                <p className="text-sm text-muted-foreground mt-1">US shipping over ${FREE_SHIPPING_THRESHOLD}</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-semibold text-primary">2</p>
                <p className="text-sm text-muted-foreground mt-1">business days to ship</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: 'US Only', desc: 'Ships to United States addresses' },
                { icon: Package, title: 'In Stock', desc: 'Browse current online styles' },
                { icon: Clock, title: '2 Business Days', desc: 'Packed and handed to the carrier quickly' },
                { icon: ShieldCheck, title: 'Tracked', desc: 'Tracking sent by email after dispatch' },
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
                  <h3 className="font-semibold mb-3">Rates</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Free US shipping on orders over ${FREE_SHIPPING_THRESHOLD}</li>
                    <li>• ${FLAT_SHIPPING_RATE} flat rate below ${FREE_SHIPPING_THRESHOLD}</li>
                    <li>• No weight calculation or per-item surcharge</li>
                    <li>• Taxes, if applicable, are calculated at checkout</li>
                  </ul>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Timing</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Online orders ship with tracking after dispatch</li>
                    <li>• Tracking is emailed when the label is created</li>
                    <li>• Carrier transit time starts after dispatch</li>
                    <li>• Delivery speed depends on the service shown at checkout</li>
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
                <p>
                  LuxeMia currently accepts orders for United States shipping addresses only. If you need a specific colour,
                  measurements for a group, or full wedding-party coordination, use our sister site CeremonyVerse instead.
                </p>
                <p>
                  If an address needs to be corrected, email <span className="text-primary">hello@luxemia.shop</span> within 24 hours.
                  Once a label is created, address changes may not be possible.
                </p>
                <p>
                  Please review the product measurements before ordering. Ready-to-ship speed depends on the item being in stock
                  and does not mean a custom piece can be produced immediately.
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
                    Free US shipping applies on orders over ${FREE_SHIPPING_THRESHOLD}. Orders below ${FREE_SHIPPING_THRESHOLD}
                    ship for a ${FLAT_SHIPPING_RATE} flat rate.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How fast will my order ship?</AccordionTrigger>
                  <AccordionContent>
                    In-stock online items receive tracking after dispatch. Carrier transit time begins after dispatch.
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
