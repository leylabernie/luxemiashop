import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertTriangle, FileText, Scale } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Scale className="w-4 h-4" />
                <span className="text-sm font-medium">Legal Agreement</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif mb-6">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 2, 2026</p>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Please read these terms carefully before making a purchase. By using our services, 
                you agree to be legally bound by these terms.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-8 bg-destructive/10 border-y border-destructive/20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-start gap-4 max-w-4xl mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Important Notice</h3>
                <p className="text-muted-foreground text-sm">
                  Custom-made and made-to-measure garments are final sale and cannot be returned or exchanged 
                  due to measurement discrepancies. You are solely responsible for providing accurate measurements. 
                  Please read our measurement policy carefully before placing an order.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              {/* Table of Contents */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Table of Contents</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <a href="#acceptance" className="text-muted-foreground hover:text-primary transition-colors">1. Acceptance of Terms</a>
                  <a href="#eligibility" className="text-muted-foreground hover:text-primary transition-colors">2. Eligibility</a>
                  <a href="#products" className="text-muted-foreground hover:text-primary transition-colors">3. Products & Pricing</a>
                  <a href="#orders" className="text-muted-foreground hover:text-primary transition-colors">4. Orders & Payment</a>
                  <a href="#custom" className="text-muted-foreground hover:text-primary transition-colors">5. Custom Orders & Measurements</a>
                  <a href="#cancellation" className="text-muted-foreground hover:text-primary transition-colors">6. Order Cancellation</a>
                  <a href="#shipping" className="text-muted-foreground hover:text-primary transition-colors">7. Shipping & Delivery</a>
                  <a href="#returns" className="text-muted-foreground hover:text-primary transition-colors">8. Returns & Exchanges</a>
                  <a href="#warranty" className="text-muted-foreground hover:text-primary transition-colors">9. Warranty & Quality</a>
                  <a href="#ip" className="text-muted-foreground hover:text-primary transition-colors">10. Intellectual Property</a>
                  <a href="#accounts" className="text-muted-foreground hover:text-primary transition-colors">11. User Accounts</a>
                  <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">12. Privacy & Data</a>
                  <a href="#liability" className="text-muted-foreground hover:text-primary transition-colors">13. Limitation of Liability</a>
                  <a href="#indemnification" className="text-muted-foreground hover:text-primary transition-colors">14. Indemnification</a>
                  <a href="#disputes" className="text-muted-foreground hover:text-primary transition-colors">15. Dispute Resolution</a>
                  <a href="#governing" className="text-muted-foreground hover:text-primary transition-colors">16. Governing Law</a>
                  <a href="#changes" className="text-muted-foreground hover:text-primary transition-colors">17. Changes to Terms</a>
                  <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">18. Contact Information</a>
                </div>
              </div>

              <div className="space-y-8 text-muted-foreground">
                <section id="acceptance">
                  <h2 className="text-xl font-serif text-foreground mb-4">1. Acceptance of Terms</h2>
                  <p className="mb-4">
                    By accessing, browsing, or using LuxeMia's website (www.luxemia.com), mobile applications, 
                    or any of our services, you acknowledge that you have read, understood, and agree to be 
                    bound by these Terms of Service ("Terms") and our Privacy Policy.
                  </p>
                  <p>
                    If you do not agree to these Terms, you must immediately discontinue use of our services. 
                    Your continued use of our services following the posting of changes to these Terms will 
                    constitute your acceptance of those changes.
                  </p>
                </section>

                <section id="eligibility">
                  <h2 className="text-xl font-serif text-foreground mb-4">2. Eligibility</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must be at least 18 years of age to make purchases on our website.</li>
                    <li>By placing an order, you represent that you have the legal capacity to enter into a binding contract.</li>
                    <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
                    <li>You may not use our products for any illegal or unauthorized purpose.</li>
                  </ul>
                </section>

                <section id="products">
                  <h2 className="text-xl font-serif text-foreground mb-4">3. Products and Pricing</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">3.1 Pricing</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>All prices are listed in US Dollars (USD) unless otherwise specified.</li>
                        <li>Prices do not include shipping, customs duties, taxes, or import fees which are the customer's responsibility.</li>
                        <li>We reserve the right to modify prices at any time without prior notice.</li>
                        <li>Promotional discounts cannot be combined unless explicitly stated.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">3.2 Product Accuracy</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Product images are for illustration purposes only. Actual colors, textures, and embroidery patterns may vary slightly due to photography, monitor settings, and the handcrafted nature of our products.</li>
                        <li>Minor variations in handwork are characteristic of artisanal products and are not considered defects.</li>
                        <li>We make every effort to display accurate product descriptions but do not warrant that descriptions are error-free.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="orders">
                  <h2 className="text-xl font-serif text-foreground mb-4">4. Orders and Payment</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">4.1 Order Acceptance</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>All orders are subject to acceptance and availability.</li>
                        <li>We reserve the right to refuse or cancel any order for any reason, including suspected fraud, pricing errors, or product unavailability.</li>
                        <li>Order confirmation emails do not guarantee acceptance; acceptance occurs only upon shipment.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">4.2 Payment Terms</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Full payment is required at the time of order placement.</li>
                        <li>We accept major credit cards (Visa, MasterCard, American Express), PayPal, and other payment methods displayed at checkout.</li>
                        <li>All payment information is processed securely through encrypted payment gateways.</li>
                        <li>Orders will not be processed until payment is successfully completed.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="custom" className="bg-amber-50 dark:bg-amber-950/30 -mx-4 px-4 py-6 rounded-lg border border-amber-200 dark:border-amber-900">
                  <h2 className="text-xl font-serif text-foreground mb-4">5. Custom Orders & Measurements</h2>
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-destructive">
                      ⚠️ CRITICAL: Please read this section carefully. Measurement errors are NOT covered 
                      under our return or exchange policy.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">5.1 Customer Responsibility</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>You are solely and fully responsible</strong> for providing accurate measurements when placing a custom order.</li>
                        <li>We strongly recommend having measurements taken by a professional tailor.</li>
                        <li>All measurements must be submitted in inches unless otherwise specified.</li>
                        <li>Once measurements are submitted and production begins, they cannot be modified.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">5.2 Measurement Disclaimer</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Any fitting issues arising from incorrect measurements submitted by the customer are NOT eligible for return, exchange, or refund.</strong></li>
                        <li>We are not responsible for garments that do not fit due to customer-provided measurements.</li>
                        <li>Alterations required due to measurement errors are the customer's responsibility and expense.</li>
                        <li>By submitting your measurements, you acknowledge and accept full responsibility for their accuracy.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">5.3 Custom Order Terms</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Custom and made-to-measure orders are final sale.</li>
                        <li>Production time for custom orders is typically 4-6 weeks plus shipping time.</li>
                        <li>Custom orders require full payment upfront before production begins.</li>
                        <li>Customization requests (color changes, design modifications) must be specified at order placement and may incur additional charges.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="cancellation" className="bg-card -mx-4 px-4 py-6 rounded-lg border border-border">
                  <h2 className="text-xl font-serif text-foreground mb-4">6. Order Cancellation Policy</h2>
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-primary">
                      🕐 24-Hour Cancellation Window
                    </p>
                  </div>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Orders may only be cancelled within 24 hours of placement.</strong></li>
                    <li>To cancel, you must contact our customer service team immediately at orders@luxemia.com with your order number.</li>
                    <li>After the 24-hour window, cancellation requests will not be accepted as production may have already begun.</li>
                    <li>If cancellation is approved within the window, a full refund will be processed within 5-7 business days.</li>
                    <li>Custom orders that have entered production cannot be cancelled under any circumstances.</li>
                    <li>We reserve the right to charge a 10% processing fee for approved cancellations.</li>
                  </ul>
                </section>

                <section id="shipping">
                  <h2 className="text-xl font-serif text-foreground mb-4">7. Shipping and Delivery</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Shipping times and costs vary by destination. Please refer to our <a href="/shipping" className="text-primary hover:underline">Shipping Policy</a> for detailed information.</li>
                    <li>Delivery estimates are not guaranteed and may be affected by customs processing, weather, or carrier delays.</li>
                    <li>LuxeMia is not responsible for delays caused by customs, weather, or carrier issues.</li>
                    <li>Risk of loss passes to you upon delivery to the carrier.</li>
                    <li>Import duties, taxes, and fees are the customer's responsibility and are not included in the product price.</li>
                    <li>Customers are responsible for providing accurate shipping addresses. Reshipment due to incorrect addresses will incur additional charges.</li>
                  </ul>
                </section>

                <section id="returns" className="bg-card -mx-4 px-4 py-6 rounded-lg border border-border">
                  <h2 className="text-xl font-serif text-foreground mb-4">8. Returns and Exchanges</h2>
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-destructive">
                      📹 MANDATORY: Package Opening Video Required
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">8.1 Video Requirement</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>An unedited video recording of the package opening is MANDATORY for all return/exchange claims.</strong></li>
                        <li>The video must show the unopened package, the opening process, and clearly display the contents.</li>
                        <li>Claims without video evidence will be automatically denied without exception.</li>
                        <li>The video must be submitted within 48 hours of delivery.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">8.2 Eligible Returns</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Returns are accepted only for manufacturing defects or errors on our part.</li>
                        <li>Items must be unworn, unwashed, and in original condition with all tags attached.</li>
                        <li>Return requests must be initiated within 15 days of delivery.</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">8.3 Non-Returnable Items</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Custom or made-to-measure orders (regardless of fit)</li>
                        <li>Items with incorrect customer-provided measurements</li>
                        <li>Intimate wear, lingerie, or undergarments</li>
                        <li>Items marked as "Final Sale"</li>
                        <li>Items that have been worn, washed, altered, or damaged by the customer</li>
                        <li>Items without original packaging and tags</li>
                      </ul>
                    </div>
                    <p className="text-sm">
                      For complete details, please refer to our <a href="/returns" className="text-primary hover:underline">Returns & Exchanges Policy</a>.
                    </p>
                  </div>
                </section>

                <section id="warranty">
                  <h2 className="text-xl font-serif text-foreground mb-4">9. Warranty and Quality Guarantee</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All products are inspected for quality before shipment.</li>
                    <li>We guarantee against manufacturing defects for 30 days from delivery date.</li>
                    <li>Normal wear and tear, damage from misuse, or improper care are not covered.</li>
                    <li>Handcrafted items may have minor variations which are characteristic of artisan work and not defects.</li>
                    <li>Please follow care instructions to maintain product quality.</li>
                  </ul>
                </section>

                <section id="ip">
                  <h2 className="text-xl font-serif text-foreground mb-4">10. Intellectual Property</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All content on this website, including but not limited to images, text, logos, designs, graphics, and software, is the exclusive property of LuxeMia and protected by copyright, trademark, and other intellectual property laws.</li>
                    <li>You may not reproduce, distribute, modify, create derivative works, publicly display, or use our content without prior written permission.</li>
                    <li>Unauthorized use may result in legal action.</li>
                    <li>Product designs are proprietary and may not be copied or replicated.</li>
                  </ul>
                </section>

                <section id="accounts">
                  <h2 className="text-xl font-serif text-foreground mb-4">11. User Accounts</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You are responsible for maintaining the confidentiality and security of your account credentials.</li>
                    <li>You must provide accurate, current, and complete information during registration.</li>
                    <li>You are responsible for all activities that occur under your account.</li>
                    <li>Notify us immediately of any unauthorized use of your account.</li>
                    <li>We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our discretion.</li>
                  </ul>
                </section>

                <section id="privacy">
                  <h2 className="text-xl font-serif text-foreground mb-4">12. Privacy and Data Protection</h2>
                  <p className="mb-4">
                    Your privacy is important to us. Our collection, use, and protection of your personal information 
                    is governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, 
                    which is incorporated into these Terms by reference.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>By using our services, you consent to the collection and use of your information as described in our Privacy Policy.</li>
                    <li>We implement industry-standard security measures to protect your data.</li>
                    <li>We do not sell your personal information to third parties.</li>
                  </ul>
                </section>

                <section id="liability">
                  <h2 className="text-xl font-serif text-foreground mb-4">13. Limitation of Liability</h2>
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                    <p className="text-sm uppercase font-semibold text-foreground">
                      PLEASE READ THIS SECTION CAREFULLY AS IT LIMITS OUR LIABILITY
                    </p>
                  </div>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUXEMIA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR SERVICES OR PRODUCTS.</li>
                    <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT ACTUALLY PAID BY YOU FOR THE SPECIFIC PRODUCT OR SERVICE GIVING RISE TO THE CLAIM.</li>
                    <li>WE ARE NOT LIABLE FOR ANY DAMAGES ARISING FROM CUSTOMER-PROVIDED MEASUREMENTS OR SPECIFICATIONS.</li>
                    <li>We are not responsible for any loss, damage, or delay caused by events beyond our reasonable control (force majeure).</li>
                  </ul>
                </section>

                <section id="indemnification">
                  <h2 className="text-xl font-serif text-foreground mb-4">14. Indemnification</h2>
                  <p>
                    You agree to indemnify, defend, and hold harmless LuxeMia, its officers, directors, employees, 
                    agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, 
                    and expenses (including reasonable attorneys' fees) arising out of or related to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Your use of our services or products</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Any content or information you submit through our services</li>
                    <li>Inaccurate measurements or specifications you provide</li>
                  </ul>
                </section>

                <section id="disputes">
                  <h2 className="text-xl font-serif text-foreground mb-4">15. Dispute Resolution</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">15.1 Informal Resolution</h3>
                      <p>Before initiating any legal action, you agree to first contact us and attempt to resolve any dispute informally within 30 days.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">15.2 Arbitration</h3>
                      <p>Any disputes that cannot be resolved informally shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in Los Angeles County, California.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">15.3 Class Action Waiver</h3>
                      <p>You agree to resolve disputes on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.</p>
                    </div>
                  </div>
                </section>

                <section id="governing">
                  <h2 className="text-xl font-serif text-foreground mb-4">16. Governing Law</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the State of California, 
                    United States, without regard to its conflict of law provisions. Any legal action or proceeding 
                    shall be brought exclusively in the state or federal courts located in Los Angeles County, California, 
                    and you hereby consent to the personal jurisdiction of such courts.
                  </p>
                </section>

                <section id="changes">
                  <h2 className="text-xl font-serif text-foreground mb-4">17. Changes to Terms</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We reserve the right to modify these Terms at any time at our sole discretion.</li>
                    <li>Changes will be effective immediately upon posting on our website.</li>
                    <li>Your continued use of our services after changes constitutes acceptance of the modified Terms.</li>
                    <li>We encourage you to review these Terms periodically for updates.</li>
                  </ul>
                </section>

                <section id="contact" className="bg-card -mx-4 px-4 py-6 rounded-lg border border-border">
                  <h2 className="text-xl font-serif text-foreground mb-4">18. Contact Information</h2>
                  <p className="mb-4">For questions about these Terms of Service, please contact us:</p>
                  <div className="space-y-2">
                    <p><strong>LuxeMia Fashion Inc.</strong></p>
                    <p>Legal Department</p>
                    <p>123 Fashion District, Suite 500</p>
                    <p>Los Angeles, CA 90001, USA</p>
                    <p className="mt-4">
                      Email: <a href="mailto:legal@luxemia.com" className="text-primary hover:underline">legal@luxemia.com</a>
                    </p>
                    <p>
                      Phone: <a href="tel:+12135551234" className="text-primary hover:underline">+1 (213) 555-1234</a>
                    </p>
                  </div>
                </section>

                <section className="text-center pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    By using LuxeMia's services, you acknowledge that you have read, understood, and agree 
                    to be bound by these Terms of Service.
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;