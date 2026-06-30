import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Truck, Clock, Globe, Package, AlertTriangle, FileText, DollarSign, RotateCcw, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FLAT_SHIPPING_RATE = 25;
const FREE_SHIPPING_THRESHOLD = 350;

const regionRates = [
  {
    region: 'United States',
    standard: '7–10 business days (USPS/UPS/DHL)',
    freeNote: 'Free on orders over $350',
  },
  {
    region: 'Canada',
    standard: '7–10 business days (USPS/UPS/DHL)',
    freeNote: 'Free on orders over $350',
  },
  {
    region: 'Australia',
    standard: '7–10 business days (USPS/UPS/DHL)',
    freeNote: 'Free on orders over $350',
  },
];

const importDutyRates = [
  { country: 'United States', dutyRate: '0–32%', additionalTariff: '50%*', notes: '*Additional 50% tariff on goods from India (effective Aug 2025)' },
  { country: 'Canada', dutyRate: '0–18%', additionalTariff: 'None', notes: 'GST/HST applies (5–15%)' },
  { country: 'Australia', dutyRate: '0–10%', additionalTariff: 'None', notes: 'GST 10% on goods over AUD 1000' },
];

const ShippingCalculator = () => {
  const [orderValue, setOrderValue] = useState(0);

  const isFreeShipping = orderValue >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : FLAT_SHIPPING_RATE;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - orderValue;

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Shipping Cost Estimator</h3>
      </div>

      <div className="mb-6">
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

      {/* Result */}
      <div className={`rounded-lg p-5 ${isFreeShipping ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-secondary/30 border border-border'}`}>
        {isFreeShipping ? (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-1">Your order qualifies for FREE shipping!</p>
            <p className="text-sm text-muted-foreground">Orders over ${FREE_SHIPPING_THRESHOLD} ship free to USA, Canada, and Australia.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Flat shipping rate</p>
              <p className="text-3xl font-serif font-semibold text-primary">${shippingCost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Flat rate per order</p>
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
        Flat rate ${FLAT_SHIPPING_RATE} per order — no weight calculation, no surprises. Shipped via DHL Express or FedEx International from India.
      </p>
    </div>
  );
};

const Shipping = () => {
  // MerchantReturnPolicy + OfferShippingDetails schemas for GMC compliance
  const shippingSchemas = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MerchantReturnPolicy',
        '@id': 'https://luxemia.shop/#returnPolicy',
        name: 'LuxeMia Return & Refund Policy',
        applicableCountry: ['US', 'CA', 'AU'],
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 2,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
        restockingFee: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: 'USD',
        },
        returnShippingFeesAmount: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: 'USD',
        },
        refundType: 'https://schema.org/FullRefund',
        description: 'All sales are final. Returns and exchanges are not accepted. Damage claims are accepted within 48 hours of delivery with mandatory unboxing video. Cancellations are accepted within 24 hours of order placement for a full refund. Damage resolutions may include replacement part, store credit, or partial refund at LuxeMia discretion.',
        url: 'https://luxemia.shop/returns',
      },
      {
        '@type': 'OfferShippingDetails',
        '@id': 'https://luxemia.shop/#shippingDetailsFreeReadymade',
        name: 'Free Shipping on Orders Over $350 (Readymade)',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['US', 'CA', 'AU'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 5,
            unitCode: 'DAY',
            description: 'Readymade/standard size dispatch time',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 7,
            maxValue: 10,
            unitCode: 'DAY',
            description: 'USPS/UPS/DHL delivery',
          },
        },
      },
      {
        '@type': 'OfferShippingDetails',
        '@id': 'https://luxemia.shop/#shippingDetailsFreeCustom',
        name: 'Free Shipping on Orders Over $350 (Custom/Alterations)',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['US', 'CA', 'AU'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 7,
            unitCode: 'DAY',
            description: 'Custom/alteration dispatch time',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 7,
            maxValue: 10,
            unitCode: 'DAY',
            description: 'USPS/UPS/DHL delivery',
          },
        },
      },
      {
        '@type': 'OfferShippingDetails',
        '@id': 'https://luxemia.shop/#shippingDetailsFlatReadymade',
        name: 'Flat Rate Shipping $25 (Readymade)',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '25.00',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['US', 'CA', 'AU'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 5,
            unitCode: 'DAY',
            description: 'Readymade/standard size dispatch time',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 7,
            maxValue: 10,
            unitCode: 'DAY',
            description: 'USPS/UPS/DHL delivery',
          },
        },
      },
      {
        '@type': 'OfferShippingDetails',
        '@id': 'https://luxemia.shop/#shippingDetailsFlatCustom',
        name: 'Flat Rate Shipping $25 (Custom/Alterations)',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '25.00',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['US', 'CA', 'AU'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 7,
            unitCode: 'DAY',
            description: 'Custom/alteration dispatch time',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 7,
            maxValue: 10,
            unitCode: 'DAY',
            description: 'USPS/UPS/DHL delivery',
          },
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping Information — LuxeMia"
        description="LuxeMia ships to USA, Canada, and Australia at a flat rate of $25 per order. Free shipping on orders over $350. USPS/UPS/DHL delivery."
        canonical="https://luxemia.shop/shipping"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(shippingSchemas)}
        </script>
      </Helmet>
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
                Delivery to USA, Canada & Australia
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Shipping Policy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We ship our Indian ethnic wear to the USA, Canada, and Australia at a simple flat rate of $25 per order —
                no weight calculations, no hidden fees. Orders over $350 qualify for free shipping. Every piece is carefully packaged to arrive in perfect condition.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Rates Banner */}
        <section className="py-10 border-y border-border bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-3xl mx-auto">
              <div>
                <p className="text-3xl font-serif font-semibold text-primary">${FLAT_SHIPPING_RATE}</p>
                <p className="text-sm text-muted-foreground mt-1">per order (US, CA, AU)</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-semibold text-green-600 dark:text-green-400">FREE</p>
                <p className="text-sm text-muted-foreground mt-1">on orders over ${FREE_SHIPPING_THRESHOLD}</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-semibold text-primary">7–10</p>
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
                { icon: Globe, title: 'Ships to US, CA & AU', desc: 'USA, Canada, Australia' },
                { icon: Package, title: 'Quality Packaging', desc: 'Gift-ready presentation' },
                { icon: Truck, title: 'Full Tracking', desc: 'USPS/UPS/DHL with tracking' },
                { icon: Clock, title: 'Dispatch Time', desc: 'Readymade 3–5 days, Custom 5–7 days' },
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
                  <li>• To cancel, email <span className="text-primary">hello@luxemia.shop</span> with your order number immediately</li>
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
                Simple flat-rate pricing — the same $25 rate applies whether you're in New York, Toronto, or Sydney.
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
              <h2 className="text-2xl font-serif mb-2 text-center">Delivery Times by Country</h2>
              <p className="text-muted-foreground text-center mb-8 text-sm">
                Flat rate ${FLAT_SHIPPING_RATE} per order applies to all countries. Free shipping on orders over $350.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="text-left py-4 px-4 font-medium">Destination</th>
                      <th className="text-left py-4 px-4 font-medium">Delivery Time</th>
                      <th className="text-left py-4 px-4 font-medium">Shipping Rate</th>
                      <th className="text-left py-4 px-4 font-medium">Free Shipping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionRates.map((row, index) => (
                      <tr key={row.region} className={`border-b border-border/50 ${index % 2 === 0 ? 'bg-card/50' : ''}`}>
                        <td className="py-4 px-4 font-medium">{row.region}</td>
                        <td className="py-4 px-4">
                          <span className="block text-muted-foreground">{row.standard}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-primary">${FLAT_SHIPPING_RATE}/order</span>
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
                Delivery times are from date of dispatch. Readymade items are dispatched within 3–5 business days.
                Custom/alteration orders are dispatched within 5–7 business days.
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
                      <th className="text-left py-4 px-4 font-medium">Country</th>
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
              <h2 className="text-2xl font-serif mb-8 text-center">Order Processing &amp; Dispatch</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Readymade / Standard Size</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Dispatch: 3–5 business days</li>
                    <li>• Quality inspection before dispatch</li>
                    <li>• Professional pressing and folding</li>
                    <li>• Tracking number sent via email</li>
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Custom / Alterations</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Dispatch: 5–7 business days</li>
                    <li>• Custom sizing and modifications</li>
                    <li>• Progress updates provided</li>
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
                  <span className="px-3 py-1 bg-secondary rounded-full">USPS</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">UPS</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">FedEx International</span>
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
                Please read our returns policy carefully before placing your order.
              </p>

              <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-foreground text-lg mb-2">All Sales Are Final</h3>
                <p className="text-muted-foreground text-sm">
                  Due to the international nature of our shipments, LuxeMia does not accept returns or exchanges for any reason, 
                  including sizing issues, colour variations, or change of mind. The only exception is genuine shipping damage, 
                  which must be supported by a mandatory unboxing video. Please use our Size Guide and contact us before ordering 
                  if you have any questions. See our <a href="/returns" className="text-primary underline">full Returns Policy</a> for details.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Before You Order</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Use our detailed Size Guide for accurate measurements</li>
                    <li>• Contact us with sizing or fabric questions before ordering</li>
                    <li>• Read the full product description carefully</li>
                    <li>• Record an unboxing video for every delivery</li>
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Damage Claims</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Only exception to our no-returns policy</li>
                    <li>• Mandatory unboxing video required</li>
                    <li>• Report within 48 hours of delivery</li>
                    <li>• Email <span className="text-primary">hello@luxemia.shop</span> with video and photos</li>
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
                    We use a simple flat rate of ${FLAT_SHIPPING_RATE} per order — no weight calculations, no size surcharges.
                    The same rate applies whether you're ordering to the USA, Canada, or Australia.
                    Orders over ${FREE_SHIPPING_THRESHOLD} automatically qualify for free shipping. Delivery is 7-10 business days via USPS/UPS/DHL.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How can I get free shipping?</AccordionTrigger>
                  <AccordionContent>
                    Your order qualifies for free shipping when the order total exceeds ${FREE_SHIPPING_THRESHOLD} USD.
                    This is applied automatically at checkout — no coupon code needed. The threshold is based on
                    the subtotal before taxes and shipping. Orders under ${FREE_SHIPPING_THRESHOLD} are charged a flat rate of ${FLAT_SHIPPING_RATE}.
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
                    processing. Contact us immediately at hello@luxemia.shop if you need to update your address.
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
                    Unfortunately, no. All sales are final and we do not accept returns or exchanges for sizing issues. We strongly recommend using our Size Guide and contacting us before ordering to ensure the right fit. For minor fit adjustments, a local tailor can often help.
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
