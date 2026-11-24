import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Scissors,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RETURN_CLAIM_WINDOW, RETURN_EVIDENCE_REQUIREMENT, RETURN_POLICY_SEO_DESCRIPTION } from '@/lib/returnPolicyCopy';

const Returns = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Returns, Quality Guarantee & Cancellations | LuxeMia"
        description={RETURN_POLICY_SEO_DESCRIPTION}
        canonical="https://luxemia.shop/returns"
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
                Policies &amp; Buyer Protection
              </span>
              <h1 className="font-serif text-3xl lg:text-5xl mb-4">
                Returns, Quality Guarantee &amp; Cancellations
              </h1>
              <p className="text-muted-foreground font-light">
                Every LuxeMia outfit undergoes our <strong className="text-foreground font-medium">3-Point Quality Assurance Check</strong> before international dispatch. All sales are final except where applicable law provides otherwise — with fast 48-hour photo-verified protection (no unboxing video required) for any damaged, defective, materially misdescribed, or incomplete order, plus our <strong className="text-foreground font-medium">$20 Local Alteration Credit</strong> for custom-stitched fit adjustments.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Summary table — scannable in 10 seconds */}
        <section className="py-10 lg:py-12 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-serif text-xl lg:text-2xl mb-4">At a glance</h2>
            <div className="border border-border rounded-sm divide-y divide-border text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Pre-dispatch inspection</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  <strong className="text-foreground font-medium">3-Point Quality Assurance Check</strong> — fabric &amp; embroidery audit, tape-measurement fit check, and moisture-barrier packaging seal before dispatch.
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Standard orders</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  <strong className="text-foreground font-medium">Final sale</strong> — change-of-mind and buyer’s-remorse returns are not accepted, except where applicable law provides otherwise.
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Minor fit adjustments</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  Custom-stitched blouses, cholis, and suit tops include a <strong className="text-foreground font-medium">2-inch internal seam allowance</strong> plus up to <strong className="text-foreground font-medium">$20 USD Local Alteration Credit</strong> (<a href="/alterations" className="text-primary underline underline-offset-4">view Alterations Policy</a>).
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Damaged, defective, materially misdescribed, wrong, or incomplete item</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  <strong className="text-foreground font-medium">Full refund or replacement, your choice</strong> — report within {RETURN_CLAIM_WINDOW} of delivery with {RETURN_EVIDENCE_REQUIREMENT}. Prepaid return shipping label provided when a return is needed.
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Cancellation within 24 hours</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  <strong className="text-foreground font-medium">Full refund</strong> — email your order number to{' '}
                  <a href="mailto:hello@luxemia.shop" className="text-primary underline underline-offset-4">hello@luxemia.shop</a>.
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 p-4">
                <div className="font-medium">Cancellation after 24 hours</div>
                <div className="sm:col-span-2 text-muted-foreground">
                  Case by case; may not be possible once dispatched or in tailoring. If possible, refund is reduced only by non-recoverable supplier costs (typically 10–20%, disclosed first).
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed sections */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 max-w-3xl space-y-12">

            {/* 1. 3-Point Quality Assurance Check */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Our 3-Point Quality Assurance Check</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Because wedding, reception, sangeet, and festival timelines leave no room for guesswork, every LuxeMia garment is inspected across three checkpoints before international courier pickup:
                </p>
                <ol className="list-decimal pl-5 space-y-2.5">
                  <li>
                    <strong className="text-foreground font-medium">Fabric &amp; Embroidery Audit:</strong>{' '}
                    Close inspection of zari, sequin, mirror, resham, or print alignment, weave integrity, and seam strength.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Measurement &amp; Fit Check:</strong>{' '}
                    Tape-measurement verification against our published garment chart or your confirmed custom stitching measurements, including confirmation of internal seam margins where applicable.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Packaging &amp; Seal Assurance:</strong>{' '}
                    Finishing check and moisture-barrier inner wrapping inside transit-ready outer courier packaging.
                  </li>
                </ol>
              </div>
            </div>

            {/* 2. Why all sales are final */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Why standard orders are final sale</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  LuxeMia garments are sourced and dispatched directly from India, and many pieces are finished or tailored to your selected option. Two-way international air return shipping and re-import customs fees make routine change-of-mind returns impractical without inflating prices across the catalog.
                </p>
                <p>
                  Before ordering, please check the <a href="/size-guide" className="text-primary underline underline-offset-4">Size Guide</a> and product description carefully. Change-of-mind returns are not accepted, except where applicable law provides otherwise. If you are between sizes or ordering for a fixed event date, reach our Philadelphia support desk at{' '}
                  <a href="mailto:hello@luxemia.shop" className="text-primary underline underline-offset-4">hello@luxemia.shop</a>{' '}
                  or <a href="tel:+12153419990" className="text-primary underline underline-offset-4">+1-215-341-9990</a> before placing your order.
                </p>
              </div>
            </div>

            {/* 3. Covered Order Issues — Simple 2-Step Photo Verification */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Camera className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">48-Hour Photo-Verified Order Protection (No Video Required)</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  If an item arrives <strong className="text-foreground font-medium">damaged in transit, has a manufacturing defect, is materially misdescribed or not the item or variant you ordered, or is missing listed pieces</strong>, we make it right with a <strong className="text-foreground font-medium">full refund to your original payment method or an expedited replacement</strong> — your choice — at zero return shipping cost to you.
                </p>
                <p className="text-foreground font-medium pt-1">Simple 2-step claim process (no unboxing video required):</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground font-medium">Contact us within {RETURN_CLAIM_WINDOW} of carrier delivery</strong> at{' '}
                    <a href="mailto:hello@luxemia.shop" className="text-primary underline underline-offset-4">hello@luxemia.shop</a>{' '}
                    or WhatsApp <a href="https://wa.me/12153419990" className="text-primary underline underline-offset-4" rel="noopener noreferrer">+1-215-341-9990</a> with your order number and a brief note describing the issue.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">Attach 2–3 clear photos</strong> showing the outer courier packaging/shipping label, the garment with original tags attached, and a close-up of the damaged, defective, or incorrect area.
                  </li>
                </ol>
                <p>
                  Our Philadelphia support team reviews claims within 1 business day. If a physical return is needed for a verified issue, LuxeMia emails a <strong className="text-foreground font-medium">prepaid return shipping label</strong>. Keep the garment unworn with tags attached until your claim is resolved.
                </p>
                <p className="text-xs border-l-2 border-border pl-3">
                  Minor shade differences caused by screen calibration or studio lighting and slight weave variations inherent to woven or embroidered Indian textiles are normal characteristics and are not defects, unless the item differs materially from the listing description. Nothing in this policy limits any consumer rights or remedies that cannot legally be excluded under applicable law.
                </p>
              </div>
            </div>

            {/* 4. Fit, 2-Inch Seam Allowance & $20 Alteration Credit */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Scissors className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Fit Adjustments &amp; $20 Local Alteration Credit</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Because Indian occasionwear fits best when contoured to your posture, custom-stitched blouses, cholis, and suit tops include a <strong className="text-foreground font-medium">2-inch (5 cm) internal seam allowance on both side seams</strong> where garment construction permits so any local tailor can easily let out or take in the fit.
                </p>
                <p>
                  If your custom-stitched blouse or suit needs a minor local tweak after arrival, LuxeMia provides up to <strong className="text-foreground font-medium">$20 USD in Local Alteration Credit</strong> (issued as store credit) when you email a photo of your local tailor’s receipt within 14 days of delivery to{' '}
                  <a href="mailto:hello@luxemia.shop" className="text-primary underline underline-offset-4">hello@luxemia.shop</a>. Read full eligibility details in our{' '}
                  <a href="/alterations" className="text-primary underline underline-offset-4">Alterations &amp; Fit Guarantee</a>.
                </p>
              </div>
            </div>

            {/* 5. Cancellations */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-2xl">Order cancellations</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Email <a href="mailto:hello@luxemia.shop" className="text-primary underline underline-offset-4">hello@luxemia.shop</a> with your order number as soon as possible.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground font-medium">Within 24 hours of ordering:</strong>{' '}
                    Full refund to your original payment method.
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">After 24 hours:</strong>{' '}
                    Considered case by case. Once an order has been dispatched from India or tailoring/cutting has begun, cancellation is generally not possible. Where a supplier order can still be stopped, your refund is reduced only by any non-recoverable supplier or payment fees already incurred — typically 10–20% of the item price — and we confirm the exact amount with you before proceeding.
                  </li>
                </ul>
                <p>
                  Approved refunds are submitted immediately; banks and card issuers typically post the credit within 5–10 business days.
                </p>
              </div>
            </div>

            {/* 6. Contact CTA */}
            <div className="bg-secondary/30 rounded-sm p-6 lg:p-8">
              <div className="flex items-center gap-2.5 mb-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-serif text-xl">Questions before you order?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Ask our Philadelphia, PA support team about sizing, fabric drape, included pieces, or delivery timing before you check out — we reply within 1 business day.
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
                  <a href="/alterations">Alterations Policy</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/size-guide">Size Guide</a>
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

export default Returns;
