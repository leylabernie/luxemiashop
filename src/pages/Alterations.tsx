import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Mail,
  MessageSquare,
  Ruler,
  Scissors,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Alterations = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Alterations, Fit Guarantee & $20 Credit | LuxeMia"
        description="LuxeMia’s 2-inch internal seam allowance guarantee, $20 USD Local Alteration Credit for custom-stitched blouses and suits, and 15–18 business day tailoring timeline."
        canonical="https://luxemia.shop/alterations"
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 lg:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-primary mb-2 block">
                Fit &amp; Tailoring Policy
              </span>
              <h1 className="font-serif text-3xl lg:text-5xl mb-4">
                Alterations, Seam Allowance &amp; $20 Fit Credit
              </h1>
              <p className="text-muted-foreground font-light">
                Shopping for Indian wedding and festive wear online should feel confident. Every custom-stitched LuxeMia blouse, choli, and suit top is finished with a <strong className="text-foreground font-medium">2-inch internal seam allowance</strong> where garment construction permits and backed by our <strong className="text-foreground font-medium">$20 Local Alteration Credit</strong>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Reference Summary */}
        <section className="py-10 lg:py-12 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-serif text-xl lg:text-2xl mb-4">At a glance</h2>
            <div className="border border-border rounded-sm divide-y divide-border text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Internal seam margin</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  <strong className="text-foreground font-medium">2 inches (5 cm) on both side seams</strong> of custom-stitched blouses, cholis, and suit tops where construction permits so any local tailor can let out or take in the fit.
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Local Alteration Credit</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  Up to <strong className="text-foreground font-medium">$20 USD in store credit</strong> for minor local tailor adjustments on custom-stitched blouses and suits — email your receipt within 14 days of delivery.
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Custom Tailored timeline</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  <strong className="text-foreground font-medium">15–18 business days total</strong> (tailoring + tracked DHL/FedEx transit), compared with <strong className="text-foreground font-medium">5–7 business days</strong> for Ready-to-Ship selections to the US, UK &amp; Canada.
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Pre-dispatch inspection</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  Every garment passes our <strong className="text-foreground font-medium">3-Point Quality Assurance Check</strong> (fabric &amp; embroidery audit, tape-measurement verification, and moisture-barrier packaging).
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 max-w-3xl space-y-12">

            {/* 1. 2-Inch Seam Allowance */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Scissors className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">2-Inch Internal Seam Allowance Guarantee</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Indian blouses, cholis, and kameez bodices sit closer to the frame than casual western separates. When you order custom blouse stitching or a custom-stitched suit through LuxeMia, our tailoring team leaves <strong className="text-foreground font-medium">2 inches (5 cm) of hidden internal fabric margin along both side seams</strong> (up to 4 inches of total let-out room where the garment panel and embroidery placement allow).
                </p>
                <p>
                  This built-in tailor margin allows a neighborhood dry cleaner or bridal seamstress in the US, UK, Canada, or Australia to loosen or cinch the bust and waist cleanly in minutes — without disturbing outer embroidery or side zippers.
                </p>
                <p className="text-xs border-l-2 border-border pl-3">
                  Note: Unstitched fabric sets, pre-draped/unstitched sarees ordered without blouse stitching, and jewelry/accessories are supplied in their stated catalog construction without custom bodice seams. Check each product page’s <em>Sizing &amp; Alteration</em> details before checkout.
                </p>
              </div>
            </div>

            {/* 2. $20 Local Alteration Credit */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <DollarSign className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">$20 Local Alteration Credit</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  If your custom-stitched blouse, choli, or suit requires a minor local posture or fit adjustment after delivery, you never need to mail the garment overseas. LuxeMia reimburses <strong className="text-foreground font-medium">up to $20 USD in LuxeMia store credit</strong> toward your local tailor’s fee.
                </p>
                <p className="text-foreground font-medium pt-1">How to claim your $20 Local Alteration Credit:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Have your local tailor perform the minor side-seam, strap, or hem adjustment using the built-in internal seam margin.</li>
                  <li>
                    Within <strong className="text-foreground font-medium">14 calendar days of carrier delivery</strong>, email{' '}
                    <a href="mailto:hello@luxemia.shop" className="text-primary underline underline-offset-4">hello@luxemia.shop</a>{' '}
                    with your LuxeMia order number and a clear photo or PDF of your local tailor’s itemized receipt.
                  </li>
                  <li>Our Philadelphia support desk verifies eligibility within 1–2 business days and issues your store credit code (up to $20 USD, one credit per custom-stitched outfit).</li>
                </ol>
                <p>
                  If a garment ever arrives stitched materially off from the measurements confirmed on your order, that is covered separately under our{' '}
                  <Link to="/returns" className="text-primary underline underline-offset-4">48-hour Photo-Verified Order Protection</Link>{' '}
                  for a full refund or replacement at no cost to you.
                </p>
              </div>
            </div>

            {/* 3. Custom Tailored vs Ready-to-Ship Delivery Windows */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Tailoring &amp; Delivery Windows</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground font-medium">Ready-to-Ship (5–7 business days to US/UK/CA via DHL/FedEx):</strong>{' '}
                    Stocked standard sizes and unstitched sets without custom stitching or alterations dispatch in 1–2 business days and arrive in 5–7 business days total to the United States, United Kingdom, and Canada.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Custom Tailored &amp; Alterations (15–18 business days total):</strong>{' '}
                    Orders with custom blouse stitching, custom suit stitching, fall/edging + blouse tailoring, or made-to-measure fit requests take 15–18 business days total including quality inspection and express courier transit after complete measurements are confirmed.
                  </li>
                </ul>
                <p>
                  Review route-based shipping rates and free-shipping thresholds on our{' '}
                  <Link to="/shipping" className="text-primary underline underline-offset-4">Shipping Policy</Link>, and check measurement tips in our{' '}
                  <Link to="/sizing-measurements-guide" className="text-primary underline underline-offset-4">Sizing &amp; Measurements Guide</Link>.
                </p>
              </div>
            </div>

            {/* 4. 3-Point QA Check */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Verified Before Dispatch: 3-Point Quality Assurance Check</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Before your parcel is handed to DHL or FedEx, our team completes a <strong className="text-foreground font-medium">3-Point Quality Assurance Check</strong>: (1) fabric and embroidery alignment audit, (2) tape-measurement verification against your selected chart size or custom body measurements (confirming the 2-inch internal seam allowance where applicable), and (3) moisture-barrier protective packaging.
                </p>
              </div>
            </div>

            {/* 5. Support CTA */}
            <div className="bg-secondary/30 rounded-sm p-6 lg:p-8">
              <div className="flex items-center gap-2.5 mb-2">
                <Ruler className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-xl">Need sizing or measurement advice before ordering?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Message our Philadelphia, PA customer support team with your bust, waist, hip, and height — or your event date — and we will confirm the right fit option within 1 business day.
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
                <Button asChild variant="outline" size="sm">
                  <Link to="/size-guide">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Size Guide
                  </Link>
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

export default Alterations;
