import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Clock, Globe2, Mail, MessageSquare, Package, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DELIVERY_WINDOW_TIERS,
  DESTINATION_IMPORT_NOTICE,
  SHIPPING_PROCESSING_NOTICE,
  SHIPPING_TIMING_NOTICE,
  SHIPPING_ZONES,
  SUPPORTED_DESTINATION_LIST,
  US_IMPORT_COVERAGE_NOTICE,
  formatShippingThreshold,
} from '@/config/shippingPolicy';

const Shipping = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Shipping Rates, DHL/FedEx Delivery Windows & Policy | LuxeMia"
        description="Ready-to-Ship delivery in 5–7 business days to US/UK/CA via DHL/FedEx, Custom Tailored delivery in 15–18 business days total, and route-based rates."
        canonical="https://luxemia.shop/shipping"
      />
      <Header />

      <main className="flex-1">
        <section className="py-12 lg:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-2 block">
              Policies &amp; Express Transit
            </span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">
              Shipping Rates, Delivery Windows &amp; Policy
            </h1>
            <p className="text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
              LuxeMia ships tracked orders from India via <strong className="text-foreground font-medium">DHL / FedEx</strong> and partner international couriers to {SUPPORTED_DESTINATION_LIST}. <strong className="text-foreground font-medium">Ready-to-Ship</strong> selections arrive in <strong className="text-foreground font-medium">5–7 business days</strong> to the US, UK &amp; Canada, while <strong className="text-foreground font-medium">Custom Tailored</strong> outfits arrive in <strong className="text-foreground font-medium">15–18 business days total</strong>.
            </p>
          </div>
        </section>

        {/* Explicit Delivery Windows Matrix */}
        <section className="py-10 lg:py-12 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-serif text-2xl mb-2">Explicit Delivery Windows (US, UK &amp; Canada via DHL / FedEx)</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Processing and carrier transit are stated separately so you can plan confidently around wedding, sangeet, reception, and festival dates.
            </p>
            <div className="overflow-x-auto border border-border rounded-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/40 text-foreground">
                  <tr>
                    <th className="p-4 font-medium">Outfit Selection</th>
                    <th className="p-4 font-medium">Dispatch / Tailoring</th>
                    <th className="p-4 font-medium">Courier Transit</th>
                    <th className="p-4 font-medium">Total Delivery Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DELIVERY_WINDOW_TIERS.map((tier) => (
                    <tr key={tier.id}>
                      <td className="p-4 font-medium text-foreground">
                        <div>{tier.category}</div>
                        <div className="text-xs font-normal text-muted-foreground mt-0.5">{tier.notes}</div>
                      </td>
                      <td className="p-4 text-muted-foreground">{tier.processingWindow}</td>
                      <td className="p-4 text-muted-foreground">{tier.transitWindow}</td>
                      <td className="p-4 font-semibold text-foreground">{tier.totalWindow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Route-Based Shipping Rates */}
        <section className="py-10 lg:py-12 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-serif text-2xl mb-4">Standard Shipping Rates</h2>
            <div className="overflow-x-auto border border-border rounded-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/40 text-foreground">
                  <tr>
                    <th className="p-4 font-medium">Destination</th>
                    <th className="p-4 font-medium">Standard Rate (USD)</th>
                    <th className="p-4 font-medium">Free Standard Shipping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {SHIPPING_ZONES.map((zone) => (
                    <tr key={zone.id}>
                      <td className="p-4 font-medium text-foreground">{zone.name}</td>
                      <td className="p-4 text-muted-foreground">${zone.standardRate.toFixed(2)} USD</td>
                      <td className="p-4 text-muted-foreground">{formatShippingThreshold(zone)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Free-shipping thresholds apply to order merchandise subtotal after discounts and before applicable tax. Local currency display may appear during checkout; billing and threshold rules follow Shopify checkout settings.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 max-w-4xl space-y-10 text-sm text-muted-foreground leading-relaxed">
            <div>
              <div className="flex items-center gap-2.5 mb-2 text-foreground">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Processing and Transit Timing</h2>
              </div>
              <p>{SHIPPING_PROCESSING_NOTICE}</p>
              <p className="mt-3">{SHIPPING_TIMING_NOTICE}</p>
              <p className="mt-3">
                Processing and carrier transit are stated separately: Ready-to-Ship items complete our 3-Point Quality Assurance Check and dispatch in 1–2 business days (delivering in 5–7 business days to the US, UK &amp; Canada via DHL/FedEx), whereas Custom Tailored outfits and alteration requests deliver in 15–18 business days total once measurements are confirmed. Browse{' '}
                <a href="/ready-to-ship" className="text-primary underline underline-offset-4">
                  Ready-to-Ship styles
                </a>{' '}
                or review our{' '}
                <a href="/alterations" className="text-primary underline underline-offset-4">
                  Alterations &amp; $20 Fit Credit Policy
                </a>.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-2 text-foreground">
                <Truck className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Carriers and Tracking</h2>
              </div>
              <p>
                Parcels to the United States, United Kingdom, and Canada ship with tracked air courier service via DHL Express, FedEx, and qualified international logistics partners based on destination, parcel dimensions, and customs clearance routing. Express service is never assumed unless shown on the checkout shipping method. Tracking details are emailed automatically once the airway bill is generated.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-2 text-foreground">
                <Globe2 className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Customs, Duties, VAT, and Import Taxes</h2>
              </div>
              <p>{US_IMPORT_COVERAGE_NOTICE}</p>
              <p className="mt-3">{DESTINATION_IMPORT_NOTICE}</p>
              <p className="mt-3">
                Read destination guidance on{' '}
                <a href="/pages/shipping-customs" className="text-primary underline underline-offset-4">
                  International Shipping, Duties &amp; Taxes
                </a>.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-2 text-foreground">
                <Package className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Pre-Dispatch 3-Point Quality Assurance &amp; Support</h2>
              </div>
              <p>
                Every order undergoes our 3-Point Quality Assurance Check (fabric &amp; embroidery audit, tape-measurement verification, and moisture-barrier packaging) before courier handoff. Verify your delivery address at checkout and see{' '}
                <a href="/returns" className="text-primary underline underline-offset-4">
                  Returns, Quality Guarantee &amp; Cancellations
                </a>{' '}
                for our 48-hour photo-verified order protection.
              </p>
            </div>

            <div className="bg-secondary/30 rounded-sm p-6 lg:p-8">
              <div className="flex items-center gap-2.5 mb-2 text-foreground">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-xl">Planning for a wedding or event deadline?</h2>
              </div>
              <p className="mb-4">
                Reach our Philadelphia, PA support desk with your style link, size, and event date before checkout so we can verify dispatch timing for you.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="luxury" size="sm">
                  <a href="mailto:hello@luxemia.shop">
                    <Mail className="h-4 w-4 mr-2" />
                    hello@luxemia.shop
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="tel:+12153419990">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    +1-215-341-9990
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shipping;
