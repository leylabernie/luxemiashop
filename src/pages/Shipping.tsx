import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, Globe, Package, AlertTriangle, FileText, DollarSign, RotateCcw, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const RATE_PER_ITEM = 14.95;
const FREE_SHIPPING_THRESHOLD = 300;

const regionRates = [
  {
    region: 'United States',
    standard: '7–12 business days',
    express: '3–5 business days',
    expressFee: '+$25.00 per order',
    freeNote: 'Free on orders over $300',
  },
  {
    region: 'Canada',
    standard: '10–14 business days',
    express: '5–7 business days',
    expressFee: '+$25.00 per order',
    freeNote: 'Free on orders over $300',
  },
  {
    region: 'United Kingdom',
    standard: '10–16 business days',
    express: '5–7 business days',
    expressFee: '+$30.00 per order',
    freeNote: 'Free on orders over $300',
  },
  {
    region: 'Europe (EU)',
    standard: '12–18 business days',
    express: '6–8 business days',
    expressFee: '+$30.00 per order',
    freeNote: 'Free on orders over $300',
  },
  {
    region: 'Australia & New Zealand',
    standard: '14–20 business days',
    express: '7–10 business days',
    expressFee: '+$35.00 per order',
    freeNote: 'Free on orders over $300',
  },
  {
    region: 'UAE & Gulf Countries',
    standard: '8–14 business days',
    express: '4–6 business days',
    expressFee: '+$25.00 per order',
    freeNote: 'Free on orders over $300',
  },
  {
    region: 'Rest of World',
    standard: '18–28 business days',
    express: '10–14 business days',
    expressFee: '+$40.00 per order',
    freeNote: 'Free on orders over $300',
  },
];

const importDutyRates = [
  { country: 'United States', dutyRate: '0–32%', additionalTariff: '50%*', notes: '*Additional 50% tariff on goods from India (effective Aug 2025)' },
  { country: 'Canada', dutyRate: '0–18%', additionalTariff: 'None', notes: 'GST/HST applies (5–15%)' },
  { country: 'United Kingdom', dutyRate: '0–12%', additionalTariff: 'None', notes: 'VAT 20% applies on goods over £135' },
  { country: 'European Union', dutyRate: '0–12%', additionalTariff: 'None', notes: 'VAT 19–27% varies by country' },
  { country: 'Australia', dutyRate: '0–10%', additionalTariff: 'None', notes: 'GST 10% on goods over AUD 1000' },
  { country: 'UAE', dutyRate: '5%', additionalTariff: 'None', notes: 'VAT 5% applies' },
];

const ShippingCalculator = () => {
  const [items, setItems] = useState(1);
  const [orderValue, setOrderValue] = useState(0);

  const isFreeShipping = orderValue >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : items * RATE_PER_ITEM;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - orderValue;

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Shipping Cost Estimator</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="item-count">
            Number of Items
          </label>
          <div className="flex items-center gap-3">
            <button
              data-testid="button-decrease-items"
              onClick={() => setItems(Math.max(1, items - 1))}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-secondary transition-colors"
            >–</button>
            <span data-testid="text-item-count" className="text-2xl font-serif w-8 text-center">{items}</span>
            <button
              data-testid="button-increase-items"
              onClick={() => setItems(items + 1)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-secondary transition-colors"
            >+</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="order-value">
            Estimated Order Value (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              id="order-value"
              data-testid="input-order-value"
              type="number"
              min="0"
              step="10"
              value={orderValue || ''}
              placeholder="0"
              onChange={e => setOrderValue(parseFloat(e.target.value) || 0)}
              className="w-full border border-border rounded-md pl-7 pr-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Result */}
      <div className={`rounded-lg p-5 ${isFreeShipping ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-secondary/30 border border-border'}`}>
        {isFreeShipping ? (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-1">Your order qualifies for FREE shipping!</p>
            <p className="text-sm text-muted-foreground">Orders over ${FREE_SHIPPING_THRESHOLD} ship free to anywhere in the world.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated shipping for {items} item{items > 1 ? 's' : ''}</p>
              <p className="text-3xl font-serif font-semibold text-primary">${shippingCost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">${RATE_PER_ITEM} × {items} item{items > 1 ? 's' : ''}</p>
            </div>
            {amountToFreeShipping > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Add</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">${amountToFreeShipping.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">more for free shipping</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Flat rate ${RATE_PER_ITEM} per item — no weight calculation, no surprises. Shipped via DHL Express or FedEx International from India.
        Express upgrade available at checkout for faster delivery.
      </p>
    </div>
  );
};

const Shipping = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping Information — LuxeMia"
        description="LuxeMia ships worldwide from India at a flat rate of $14.95 per item. Free shipping on orders over $300. DHL Express and FedEx International."
        canonical="https://luxemia.shop/shipping"
      />
      <Header />
      
      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
                Worldwide Delivery
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Shipping Policy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We ship our Indian ethnic wear worldwide from India at a simple flat rate —
                no weight calculations, no hidden fees. Every piece is carefully packaged to arrive in perfect condition.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Rates Banner */}
        <section className="py-10 border-y border-border bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-3xl mx-auto">
              <div>
                <p className="text-3xl font-serif font-semibold text-primary">${RATE_PER_ITEM}</p>
                <p className="text-sm text-muted-foreground mt-1">per item, worldwide</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-semibold text-green-600 dark:text-green-400">FREE</p>
                <p className="text-sm text-muted-foreground mt-1">on orders over ${FREE_SHIPPING_THRESHOLD}</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-semibold text-primary">3–12</p>
                <p className="text-sm text-muted-foreground mt-1">business days delivery</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Globe, title: 'Ships Worldwide', desc: '100+ countries from India' },
                { icon: Package, title: 'Quality Packaging', desc: 'Gift-ready presentation' },
                { icon: Truck, title: 'Full Tracking', desc: 'DHL Express & FedEx International' },
                { icon: Clock, title: 'Processing Time', desc: '3–5 business days' },
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

        {/* Order Cancellation Policy */}
        <section className="py-12 bg-destructive/5 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 p-6 bg-card border border-destructive/20 rounded-lg"
            >
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Order Cancellation Policy</h3>
                <p className="text-muted-foreground mb-3">
                  <strong className="text-foreground">Orders can only be cancelled within 24 hours of placement.</strong> After 24 hours,
                  your order enters our production and fulfillment process and cannot be cancelled or modified.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• To cancel, email <span className="text-primary">orders@luxemia.com</span> with your order number immediately</li>
                  <li>• Cancellations received after 24 hours will not be processed</li>
                  <li>• Custom/made-to-order pieces cannot be cancelled once production begins</li>
                  <li>• Refunds for cancelled orders are processed within 5–7 business days</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Shipping Cost Estimator */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-serif mb-2 text-center">Estimate Your Shipping</h2>
              <p className="text-muted-foreground text-center mb-8 text-sm">
                Simple flat-rate pricing — the same rate applies whether you're in New York, Toronto, Sydney, or Dubai.
              </p>
              <ShippingCalculator />
            </motion.div>
          </div>
        </section>

        {/* Delivery Times by Region */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-serif mb-2 text-center">Delivery Times by Region</h2>
              <p className="text-muted-foreground text-center mb-8 text-sm">
                Flat rate ${RATE_PER_ITEM} per item applies to all regions. Express upgrade available at checkout.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="text-left py-4 px-4 font-medium">Destination</th>
                      <th className="text-left py-4 px-4 font-medium">Standard Delivery</th>
                      <th className="text-left py-4 px-4 font-medium">Express Delivery</th>
                      <th className="text-left py-4 px-4 font-medium">Free Shipping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionRates.map((row, index) => (
                      <tr key={row.region} className={`border-b border-border/50 ${index % 2 === 0 ? 'bg-card/50' : ''}`}>
                        <td className="py-4 px-4 font-medium">{row.region}</td>
                        <td className="py-4 px-4">
                          <span className="block text-muted-foreground">{row.standard}</span>
                          <span className="font-semibold text-primary">${RATE_PER_ITEM}/item</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="block text-muted-foreground">{row.express}</span>
                          <span className="text-sm text-muted-foreground">{row.expressFee}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-green-600 dark:text-green-400 font-medium">{row.freeNote}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Delivery times are from date of dispatch. Add 3–5 business days for order processing before shipment.
                Ready-to-ship items are dispatched within 1 business day.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Import Duties & Tariffs */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-serif">Import Duties, Taxes &amp; Tariffs</h2>
              </div>
              <p className="text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
                <strong className="text-foreground">Important:</strong> Import duties, customs fees, and local taxes are the
                responsibility of the customer and are NOT included in our prices or shipping fees.
                These charges are collected by your country's customs authority upon delivery.
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="text-left py-4 px-4 font-medium">Country/Region</th>
                      <th className="text-left py-4 px-4 font-medium">Base Duty Rate</th>
                      <th className="text-left py-4 px-4 font-medium">Additional Tariffs</th>
                      <th className="text-left py-4 px-4 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importDutyRates.map((row, index) => (
                      <tr key={row.country} className={`border-b border-border/50 ${index % 2 === 0 ? 'bg-card/50' : ''}`}>
                        <td className="py-4 px-4 font-medium">{row.country}</td>
                        <td className="py-4 px-4">{row.dutyRate}</td>
                        <td className="py-4 px-4">
                          <span className={row.additionalTariff !== 'None' ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                            {row.additionalTariff}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-xs">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">US Customers: Important Tariff Notice</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      As of August 2025, goods imported from India to the United States are subject to an additional
                      <strong className="text-foreground"> 50% tariff</strong> on top of standard duty rates. This is in addition to:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                      <li>• <strong>Standard textile/apparel duty:</strong> 12–32% depending on fiber content</li>
                      <li>• <strong>Silk garments:</strong> Generally 0–7% base duty</li>
                      <li>• <strong>Cotton/synthetic blends:</strong> 15–32% base duty</li>
                      <li>• <strong>Embroidered/embellished items:</strong> May have higher classification rates</li>
                    </ul>
                    <p className="text-muted-foreground text-sm">
                      <strong className="text-foreground">Example:</strong> A $500 silk lehenga may incur approximately
                      $25–35 (5–7% base duty) + $250 (50% tariff) = <strong>$275–285 in total duties</strong>, plus any
                      state sales tax. Actual amounts are determined by US Customs and Border Protection.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Processing & Handling */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-serif mb-8 text-center">Order Processing</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Ready-to-Ship Items</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Processing time: 1–3 business days</li>
                    <li>• Quality inspection before dispatch</li>
                    <li>• Professional pressing and folding</li>
                    <li>• Tracking number sent via email</li>
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Custom &amp; Made-to-Order</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Production time: 3–4 weeks</li>
                    <li>• Progress updates provided</li>
                    <li>• Custom sizing and modifications</li>
                    <li>• Cannot be cancelled once started</li>
                  </ul>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Shipping Partners &amp; Carriers</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  We partner with trusted international carriers for safe, trackable, insured delivery:
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="px-3 py-1 bg-secondary rounded-full">DHL Express</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">FedEx International</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">UPS Worldwide</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">Aramex</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">India Post EMS</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Returns Policy */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <RotateCcw className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-serif">Returns &amp; Exchanges</h2>
              </div>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto text-sm">
                We want you to love your purchase. If something isn't right, here's how returns work.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Return Eligibility</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• 14-day return window from delivery date</li>
                    <li>• Items must be unworn, unwashed, tags intact</li>
                    <li>• Original packaging must be included</li>
                    <li>• Custom/stitched items are non-returnable</li>
                    <li>• Jewelry and accessories are final sale</li>
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">How to Return</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• WhatsApp us at <span className="text-primary">+1-215-341-9990</span></li>
                    <li>• Or email <span className="text-primary">returns@luxemia.com</span></li>
                    <li>• Include order number and reason for return</li>
                    <li>• We'll send a prepaid return label</li>
                    <li>• Refund processed within 5–7 business days after receipt</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-serif mb-8 text-center">Shipping FAQ</h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How is shipping calculated?</AccordionTrigger>
                  <AccordionContent>
                    We use a simple flat rate of ${RATE_PER_ITEM} per item — no weight calculations, no size surcharges.
                    The same rate applies whether you're ordering to the USA, Canada, UK, Australia, or anywhere else in the world.
                    Orders over ${FREE_SHIPPING_THRESHOLD} automatically qualify for free shipping.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How can I get free shipping?</AccordionTrigger>
                  <AccordionContent>
                    Your order qualifies for free shipping when the order total exceeds ${FREE_SHIPPING_THRESHOLD} USD.
                    This is applied automatically at checkout — no coupon code needed. The threshold is based on
                    the subtotal before taxes and shipping.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How can I track my order?</AccordionTrigger>
                  <AccordionContent>
                    Once your order ships, you'll receive an email with your tracking number and a link to track your package
                    on the DHL or FedEx website. You can also reach us via WhatsApp or email for a status update at any time.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What if my package is delayed at customs?</AccordionTrigger>
                  <AccordionContent>
                    Customs clearance times vary by country and can add 3–10 days to delivery. You may be contacted by
                    customs to provide additional documentation or pay import duties. We are not responsible for
                    customs-related delays but can provide commercial invoices upon request.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Do you ship to PO Boxes?</AccordionTrigger>
                  <AccordionContent>
                    DHL and FedEx do not deliver to PO Boxes. Please provide a full physical street address at checkout.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>What happens if my package is lost or damaged?</AccordionTrigger>
                  <AccordionContent>
                    All shipments are fully insured. If your package is lost or arrives damaged, contact us immediately
                    with photos of the damage. We will file a claim with the carrier and either send a replacement or
                    issue a full refund once the claim is processed.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger>Can I change my shipping address after ordering?</AccordionTrigger>
                  <AccordionContent>
                    Address changes can only be made within the first 24 hours of placing your order, before it enters
                    processing. Contact us immediately at orders@luxemia.com if you need to update your address.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-8">
                  <AccordionTrigger>How is my order packaged?</AccordionTrigger>
                  <AccordionContent>
                    Each piece is carefully wrapped in acid-free tissue paper, placed in a signature LuxeMia garment
                    bag, and packed in a sturdy branded box. We ensure your purchase arrives ready to wear or gift.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-9">
                  <AccordionTrigger>Can I exchange for a different size?</AccordionTrigger>
                  <AccordionContent>
                    Yes, size exchanges are available within 14 days of delivery for ready-to-ship items.
                    Contact us via WhatsApp or email with your order number and the preferred size.
                    We'll arrange a seamless exchange once the original item is returned.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-muted-foreground">
              Questions about shipping? Contact us at{" "}
              <span className="text-primary font-medium">hello@luxemia.shop</span>
              {" "}or WhatsApp <span className="text-primary font-medium">+1-215-341-9990</span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shipping;
