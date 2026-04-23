import { motion } from 'framer-motion';
import { XCircle, AlertTriangle, Video, Ruler, Clock, Shield, CheckCircle, Ban, PackageX, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Returns, Refunds & Cancellation Policy — LuxeMia"
        description="LuxeMia return, refund, and cancellation policy. All sales final. Damage claims require mandatory unboxing video. Cancellations accepted within 24 hours only."
        canonical="https://luxemia.shop/returns"
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">

        {/* Hero */}
        <section className="py-14 lg:py-20 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Policy & Customer Care</p>
              <h1 className="text-4xl md:text-5xl font-serif mb-5">Returns, Refunds & Cancellations</h1>
              <p className="text-muted-foreground leading-relaxed">
                Please read this policy carefully before placing your order. Our products are handcrafted and
                shipped internationally, which means our policies are different from typical retail stores.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CRITICAL NOTICE — ALL SALES FINAL */}
        <section className="py-6 bg-destructive/5 border-y border-destructive/20">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-4 p-6 bg-card border border-destructive/40 rounded-lg"
            >
              <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-foreground text-lg mb-2 uppercase tracking-wide">⚠ All Sales Are Final — No Returns</h2>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  Due to the handcrafted, made-to-order nature of our garments and the complexities of international
                  shipping, <strong className="text-foreground">LuxeMia does not accept returns or issue refunds</strong> for
                  any reason — including sizing issues, colour variations, change of mind, or delayed events.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">The only exception</strong> is genuine shipping damage, which must be
                  supported by a mandatory unboxing video recorded before and during opening the package (see below).
                  Please measure carefully, use our Size Guide, and reach out with questions <em>before</em> you order.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Three Key Facts */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Ban,
                  title: 'No Returns',
                  desc: 'All sales are final. We do not accept returns for any reason except verified shipping damage.',
                  color: 'text-destructive',
                  bg: 'border-destructive/30',
                },
                {
                  icon: Video,
                  title: 'Damage Claims Require Video',
                  desc: 'Any damage claim MUST be supported by an unboxing video recorded before you open the package.',
                  color: 'text-amber-600',
                  bg: 'border-amber-500/30',
                },
                {
                  icon: Clock,
                  title: '24-Hour Cancellation Window',
                  desc: 'Orders may be cancelled within 24 hours of purchase — but not after production has begun.',
                  color: 'text-primary',
                  bg: 'border-primary/30',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 bg-card border rounded-lg text-center ${item.bg}`}
                >
                  <item.icon className={`h-8 w-8 mx-auto mb-3 ${item.color}`} />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-4 pb-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-14">

            {/* 1. CANCELLATION POLICY */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                Cancellation Policy
              </h2>
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                  <p className="text-sm font-semibold text-foreground mb-1">Cancellations are accepted within 24 hours of placing your order only.</p>
                  <p className="text-sm text-muted-foreground">After 24 hours, production begins and the order cannot be cancelled under any circumstances.</p>
                </div>
                <ul className="text-sm text-muted-foreground space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Email <strong className="text-foreground">hello@luxemia.com</strong> with your order number immediately to request cancellation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>WhatsApp us at <strong className="text-foreground">+1-215-341-9990</strong> for the fastest response during business hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Cancellations requested after 24 hours will not be accepted, even if the item has not yet shipped</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Custom-sized orders entered into production within hours — please contact us immediately if you need to cancel</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
                  Approved cancellations within 24 hours will receive a full refund to the original payment method within 5–7 business days.
                </p>
              </div>
            </motion.div>

            {/* 2. MANDATORY UNBOXING VIDEO */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
                <Video className="h-6 w-6 text-amber-600" />
                Mandatory Unboxing Video Requirement
              </h2>
              <div className="bg-card border border-amber-500/30 rounded-lg p-6 space-y-5">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md">
                  <p className="text-sm font-bold text-foreground mb-2">⚠ We strongly recommend recording an unboxing video for EVERY order.</p>
                  <p className="text-sm text-muted-foreground">No unboxing video = no damage claim. Without video evidence of the package condition on arrival and the item condition when first opened, we are unable to process any complaint related to shipping damage or missing items.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">How to Record a Valid Unboxing Video</h3>
                  <ol className="text-sm text-muted-foreground space-y-3">
                    {[
                      'Begin recording BEFORE you touch or open the package — show the sealed outer box, including all sides and the shipping label clearly',
                      'Continue recording without pause as you cut the tape and open the outer box',
                      'Show the inner packaging and any tissue/wrapping intact before removing',
                      'Reveal the garment on camera and show any damage in the same continuous recording',
                      'Do NOT stop and restart the video — it must be one continuous recording from sealed package to damaged item',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h3 className="font-semibold mb-3 text-sm">What Qualifies as Shipping Damage</h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 dark:text-green-400 font-medium mb-2">✓ Valid damage claims</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Torn or cut fabric caused by transit</li>
                        <li>• Package visibly crushed or destroyed</li>
                        <li>• Item soaked or water-damaged from transit</li>
                        <li>• Completely wrong item shipped (different product)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-destructive font-medium mb-2">✗ Not eligible for claims</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Size does not fit or wrong size ordered</li>
                        <li>• Colour looks different from screen</li>
                        <li>• Minor variations in handwork (expected)</li>
                        <li>• Change of mind or event cancelled</li>
                        <li>• Customs delays or fees</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 text-sm text-muted-foreground">
                  <strong className="text-foreground">Reporting window:</strong> Valid damage claims with unboxing video must be reported within <strong className="text-foreground">48 hours of delivery</strong>. Claims submitted after 48 hours will not be accepted.
                </div>
              </div>
            </motion.div>

            {/* 3. WHY NO RETURNS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <h2 className="text-2xl font-serif mb-6">Why We Have a No-Returns Policy</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="p-6 bg-card border border-border rounded-lg">
                  <h3 className="font-semibold mb-4">Handcrafted & Made-to-Order</h3>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Each piece is handcrafted by skilled artisans specifically for your order — it cannot be resold</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Custom sizing means the garment is unique to your measurements</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Production begins within hours of order — materials are cut and work begins immediately</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Traditional handwork techniques require significant artisan time and skill</span></li>
                  </ul>
                </div>
                <div className="p-6 bg-card border border-border rounded-lg">
                  <h3 className="font-semibold mb-4">International Shipping Realities</h3>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Products ship from India — return shipping costs often exceed the product value</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>International customs and re-importation duties make returns impractical</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>Delicate embroidered fabrics risk damage during multiple transits</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>This policy allows us to keep prices competitive and support artisan livelihoods</span></li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* 4. WHAT WE GUARANTEE */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
                <Shield className="h-6 w-6 text-green-600" />
                What We Guarantee
              </h2>
              <div className="p-6 bg-card border border-green-500/30 rounded-lg">
                <ul className="text-sm text-muted-foreground space-y-4">
                  {[
                    { label: 'Rigorous Quality Checks', text: 'Every piece is inspected before packaging — stitching, embellishments, and finish are reviewed.' },
                    { label: 'Accurate Product Representation', text: 'Our photos and descriptions accurately show what you will receive. We note colour variations where relevant.' },
                    { label: 'Premium Secure Packaging', text: 'Garments are packed in tissue, garment bags, and sturdy outer boxes designed for international transit.' },
                    { label: 'Pre-Purchase Support', text: 'Our team answers sizing, fabric, and styling questions before you order — WhatsApp +1-215-341-9990 or email hello@luxemia.com.' },
                    { label: 'Damage Resolution', text: 'Genuine shipping damage supported by an unboxing video will be reviewed and resolved at our discretion — replacement part, store credit, or partial refund depending on the case.' },
                  ].map((item) => (
                    <li key={item.label} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-foreground">{item.label}:</strong> {item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* 5. TIPS FOR A SUCCESSFUL ORDER */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <h2 className="text-2xl font-serif mb-6">Tips for a Successful Order</h2>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Measure Carefully Before Ordering', desc: 'Use our detailed Size Guide. Have someone else measure you — self-measurements are often inaccurate. When between sizes, go up and plan for a local tailor to take in.' },
                  { step: '2', title: 'Ask Us Before You Buy', desc: 'Not sure about sizing, fabric weight, or colour? WhatsApp or email us first. We reply within a few hours during business hours.' },
                  { step: '3', title: 'Check All Product Details', desc: 'Read the full product description including fabric, what\'s included (dupatta, stitched/unstitched blouse), and embroidery notes before placing your order.' },
                  { step: '4', title: 'Order Well in Advance of Your Event', desc: 'Standard items take 7–12 business days to deliver. Custom-sized pieces require an additional 3–4 weeks for production. Order 6–8 weeks ahead for major events.' },
                  { step: '5', title: 'Record Your Unboxing', desc: 'Make it a habit to record the unboxing of every order as a continuous video from sealed package to opened item. This is your protection if anything goes wrong in transit.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-5 bg-card border border-border/50 rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0 text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 6. FAQ */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <h2 className="text-2xl font-serif mb-8 text-center">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger>Can I cancel my order?</AccordionTrigger>
                  <AccordionContent>
                    Yes — but only within <strong>24 hours</strong> of placing your order. Contact us immediately at
                    hello@luxemia.com or WhatsApp +1-215-341-9990. Once production begins (which can be within hours),
                    cancellations are not possible. Approved cancellations receive a full refund within 5–7 business days.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>My item arrived damaged — what do I do?</AccordionTrigger>
                  <AccordionContent>
                    Email us at hello@luxemia.com within <strong>48 hours of delivery</strong> with: (1) your order number,
                    (2) your unboxing video showing the sealed package and the damage visible when opened, and (3) photos of
                    the damage. Claims without a valid unboxing video cannot be processed. Our team will review and respond
                    within 2–3 business days.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>The item doesn't fit — can I exchange it?</AccordionTrigger>
                  <AccordionContent>
                    Unfortunately, no. Sizing issues are not covered under our returns policy. We encourage you to use our
                    detailed <Link to="/size-guide" className="text-primary underline">Size Guide</Link> and contact us
                    before ordering if you have any doubts. For minor fit adjustments, we recommend visiting a local
                    tailor — alterations to Indian ethnic wear are common and straightforward.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q4">
                  <AccordionTrigger>The colour looks different from the website photo — is that a defect?</AccordionTrigger>
                  <AccordionContent>
                    No. Colour variations between screen display and physical fabric are expected and do not qualify as
                    defects. All screens display colours differently and the tone of your lighting affects perception.
                    Our photos are taken under professional lighting to represent the garment as accurately as possible,
                    but a slight variation is inherent to screen-to-fabric comparison.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q5">
                  <AccordionTrigger>I ordered for a wedding that got cancelled — can I return it?</AccordionTrigger>
                  <AccordionContent>
                    We're sorry to hear that, but unfortunately we cannot accept returns for this reason. All sales are
                    final. We recommend gifting the outfit, saving it for another occasion, or selling it locally. Beautiful
                    handcrafted ethnic wear holds its value well.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q6">
                  <AccordionTrigger>What counts as a manufacturing defect?</AccordionTrigger>
                  <AccordionContent>
                    Manufacturing defects include: significant stitching failures, fabric tears present before wearing,
                    incorrect item shipped (entirely different product), or missing components of a set (e.g. dupatta
                    missing from a 3-piece lehenga set). This does <strong>not</strong> include: minor handwork variations
                    (natural in artisanal pieces), colour variations from screen, fit issues, or any issue not supported
                    by an unboxing video.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q7">
                  <AccordionTrigger>Do I really need to record an unboxing video?</AccordionTrigger>
                  <AccordionContent>
                    Yes — it is the <strong>only</strong> way we can process a damage or missing-item claim. Without
                    video evidence of the package condition on arrival and the moment of opening, we have no way to
                    distinguish transit damage from post-delivery damage. We strongly recommend making this a habit for
                    every package you receive from any international retailer.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="text-2xl font-serif mb-3">Have a Question Before You Order?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              We're happy to answer sizing, fabric, or styling questions before you buy.
              Reach us during business hours — we typically reply within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://wa.me/12153419990?text=Hi%20LuxeMia%2C%20I%20have%20a%20question%20about%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-sm transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
              <a
                href="mailto:hello@luxemia.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email hello@luxemia.com
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-foreground/20 rounded-sm hover:bg-secondary transition-colors text-sm"
              >
                Contact Page
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              Mon–Sat 10am–7pm EST · Sun 11am–5pm EST · We respond to WhatsApp fastest
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Returns;
