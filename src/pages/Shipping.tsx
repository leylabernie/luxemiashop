import { motion } from 'framer-motion';
import { Truck, Clock, Globe, Package, AlertTriangle, FileText, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const shippingRates = [
  {
    region: 'United States (Contiguous 48)',
    standard: '7-12 business days',
    express: '3-5 business days',
    standardCost: '$24.95',
    expressCost: '$49.95',
    freeThreshold: '$500',
  },
  {
    region: 'United States (Alaska & Hawaii)',
    standard: '10-15 business days',
    express: '5-7 business days',
    standardCost: '$34.95',
    expressCost: '$64.95',
    freeThreshold: '$750',
  },
  {
    region: 'Canada',
    standard: '10-14 business days',
    express: '5-7 business days',
    standardCost: '$34.95',
    expressCost: '$69.95',
    freeThreshold: '$600',
  },
  {
    region: 'United Kingdom',
    standard: '12-18 business days',
    express: '6-9 business days',
    standardCost: '$44.95',
    expressCost: '$89.95',
    freeThreshold: '$750',
  },
  {
    region: 'Europe (EU Countries)',
    standard: '12-18 business days',
    express: '6-9 business days',
    standardCost: '$44.95',
    expressCost: '$89.95',
    freeThreshold: '$750',
  },
  {
    region: 'Australia & New Zealand',
    standard: '14-21 business days',
    express: '7-10 business days',
    standardCost: '$54.95',
    expressCost: '$99.95',
    freeThreshold: '$800',
  },
  {
    region: 'Middle East (UAE, Saudi Arabia, etc.)',
    standard: '10-16 business days',
    express: '5-8 business days',
    standardCost: '$44.95',
    expressCost: '$84.95',
    freeThreshold: '$700',
  },
  {
    region: 'Rest of World',
    standard: '21-30 business days',
    express: '10-14 business days',
    standardCost: '$64.95',
    expressCost: '$119.95',
    freeThreshold: '$1000',
  },
];

const importDutyRates = [
  { country: 'United States', dutyRate: '0-32%', additionalTariff: '50%*', notes: '*Additional 50% tariff on goods from India (effective Aug 2025)' },
  { country: 'Canada', dutyRate: '0-18%', additionalTariff: 'None', notes: 'GST/HST applies (5-15%)' },
  { country: 'United Kingdom', dutyRate: '0-12%', additionalTariff: 'None', notes: 'VAT 20% applies on goods over £135' },
  { country: 'European Union', dutyRate: '0-12%', additionalTariff: 'None', notes: 'VAT 19-27% varies by country' },
  { country: 'Australia', dutyRate: '0-10%', additionalTariff: 'None', notes: 'GST 10% on goods over AUD 1000' },
  { country: 'UAE', dutyRate: '5%', additionalTariff: 'None', notes: 'VAT 5% applies' },
];

const Shipping = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping Information — LuxeMia"
        description="LuxeMia shipping rates, delivery times, and international shipping details. Free shipping on qualifying orders to USA, UK, and worldwide."
        canonical="https://luxemia.shop/shipping"
      />
      <Header />
      
      <main className="pt-24 pb-16">
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
                We ship our handcrafted ethnic wear worldwide from India. Every piece is carefully packaged 
                to ensure your treasured garments arrive in perfect condition.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Globe, title: 'International Shipping', desc: 'Delivering to 100+ countries' },
                { icon: Package, title: 'Premium Packaging', desc: 'Luxury gift-ready presentation' },
                { icon: Truck, title: 'Full Tracking', desc: 'Real-time shipment updates' },
                { icon: Clock, title: 'Processing Time', desc: '3-5 business days' },
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
                  <li>• Refunds for cancelled orders are processed within 5-7 business days</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Shipping Rates Table */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-serif mb-2 text-center">Shipping Rates & Delivery Times</h2>
              <p className="text-muted-foreground text-center mb-8 text-sm">
                All prices in USD. Delivery times are estimates from date of shipment.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left py-4 px-4 font-medium">Destination</th>
                      <th className="text-left py-4 px-4 font-medium">Standard Shipping</th>
                      <th className="text-left py-4 px-4 font-medium">Express Shipping</th>
                      <th className="text-left py-4 px-4 font-medium">Free Shipping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingRates.map((row, index) => (
                      <tr key={row.region} className={`border-b border-border/50 ${index % 2 === 0 ? 'bg-card/50' : ''}`}>
                        <td className="py-4 px-4 font-medium">{row.region}</td>
                        <td className="py-4 px-4">
                          <span className="block text-muted-foreground">{row.standard}</span>
                          <span className="font-semibold text-primary">{row.standardCost}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="block text-muted-foreground">{row.express}</span>
                          <span className="font-semibold text-primary">{row.expressCost}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-green-600 dark:text-green-400 font-medium">Orders over {row.freeThreshold}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Import Duties & Tariffs */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-serif">Import Duties, Taxes & Tariffs</h2>
              </div>
              <p className="text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
                <strong className="text-foreground">Important:</strong> Import duties, customs fees, and local taxes are the 
                responsibility of the customer and are NOT included in our prices. These charges are collected by your 
                country's customs authority upon delivery.
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
                      <li>• <strong>Standard textile/apparel duty:</strong> 12-32% depending on fiber content</li>
                      <li>• <strong>Silk garments:</strong> Generally 0-7% base duty</li>
                      <li>• <strong>Cotton/synthetic blends:</strong> 15-32% base duty</li>
                      <li>• <strong>Embroidered/embellished items:</strong> May have higher classification rates</li>
                    </ul>
                    <p className="text-muted-foreground text-sm">
                      <strong className="text-foreground">Example:</strong> A $500 silk lehenga may incur approximately 
                      $25-35 (5-7% base duty) + $250 (50% tariff) = <strong>$275-285 in total duties</strong>, plus any 
                      state sales tax. Actual amounts are determined by US Customs and Border Protection.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Processing & Handling */}
        <section className="py-16">
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
                    <li>• Processing time: 3-5 business days</li>
                    <li>• Quality inspection before dispatch</li>
                    <li>• Professional pressing and folding</li>
                    <li>• Tracking number sent via email</li>
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Custom & Made-to-Order</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Production time: 3-4 weeks</li>
                    <li>• Progress updates provided</li>
                    <li>• Custom sizing and modifications</li>
                    <li>• Cannot be cancelled once started</li>
                  </ul>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Shipping Partners & Carriers</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  We partner with trusted international carriers to ensure safe and timely delivery:
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="px-3 py-1 bg-secondary rounded-full">DHL Express</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">FedEx International</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">UPS Worldwide</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">India Post (EMS)</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">BlueDart</span>
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
                  <AccordionTrigger>How can I track my order?</AccordionTrigger>
                  <AccordionContent>
                    Once your order ships, you'll receive an email with your tracking number and a link to track your package. 
                    You can also track your order by logging into your account or contacting our support team.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What if my package is delayed at customs?</AccordionTrigger>
                  <AccordionContent>
                    Customs clearance times vary by country and can add 3-10 days to delivery. You may be contacted by 
                    customs to provide additional documentation or pay import duties. We are not responsible for 
                    customs-related delays but can provide commercial invoices upon request.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Do you ship to PO Boxes?</AccordionTrigger>
                  <AccordionContent>
                    Due to the high value of our products and insurance requirements, we cannot ship to PO Boxes. 
                    Please provide a physical street address for delivery.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What happens if my package is lost or damaged?</AccordionTrigger>
                  <AccordionContent>
                    All shipments are fully insured. If your package is lost or arrives damaged, contact us immediately 
                    with photos of the damage. We will file a claim with the carrier and either send a replacement or 
                    issue a full refund once the claim is processed.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Can I change my shipping address after ordering?</AccordionTrigger>
                  <AccordionContent>
                    Address changes can only be made within the first 24 hours of placing your order, before it enters 
                    processing. After this window, we cannot guarantee address changes. Contact us immediately if you 
                    need to update your address.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>How is my order packaged?</AccordionTrigger>
                  <AccordionContent>
                    Each piece is carefully wrapped in acid-free tissue paper, placed in a signature LuxeMia garment 
                    bag, and packed in a sturdy branded box. We ensure your purchase arrives ready to wear or gift.
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
              {" "}or call <span className="text-primary font-medium">+91 98765 43210</span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shipping;
