import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy — LuxeMia"
        description="Read the LuxeMia privacy policy. Learn how we collect, use, and protect your personal information when you shop with us."
        canonical="https://luxemia.shop/privacy"
      />
      <Header />
      
      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif mb-6">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: May 5, 2026</p>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-sm">
                Your privacy is important to us. This policy describes how LuxeMia Fashion Inc. collects, uses, and protects your personal information.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="prose prose-neutral dark:prose-invert max-w-none"
            >
              <div className="space-y-8 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">1. Information We Collect</h2>
                  <p className="mb-4">We collect information you provide directly to us, information collected automatically when you use our services, and information from third-party sources.</p>
                  
                  <h3 className="font-semibold text-foreground mb-2 text-sm">Information You Provide</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                    <li><strong>Account Information:</strong> Name, email address, password, and phone number when you create an account</li>
                    <li><strong>Order Information:</strong> Shipping and billing addresses, payment details (processed by our payment providers — we never store full card numbers), order history, and product preferences</li>
                    <li><strong>Communications:</strong> Messages, reviews, and inquiries you send to us, including through our contact form, WhatsApp, or email</li>
                    <li><strong>Custom Measurements:</strong> Body measurements you submit for custom-sized garments</li>
                    <li><strong>Newsletter Sign-ups:</strong> Email address when you subscribe to our mailing list</li>
                  </ul>

                  <h3 className="font-semibold text-foreground mb-2 text-sm">Information Collected Automatically</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                    <li><strong>Device & Usage Data:</strong> IP address, browser type, operating system, device identifiers, pages visited, time spent on pages, click patterns, and referring URLs</li>
                    <li><strong>Cookies & Tracking:</strong> Session cookies, analytics cookies, and advertising cookies as described in our Cookie section below</li>
                    <li><strong>Location Data:</strong> Approximate location based on IP address (not precise GPS)</li>
                  </ul>

                  <h3 className="font-semibold text-foreground mb-2 text-sm">Information from Third Parties</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Shopify:</strong> Order and customer data from our Shopify storefront</li>
                    <li><strong>Google:</strong> Demographic and interest data from Google Analytics</li>
                    <li><strong>Social Media:</strong> Information from social media sign-in or sharing features</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">2. How We Use Your Information</h2>
                  <p className="mb-4">We use your personal information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Order Processing:</strong> To process, fulfill, and deliver your orders, including custom tailoring</li>
                    <li><strong>Communication:</strong> To send order confirmations, shipping updates, and respond to your inquiries</li>
                    <li><strong>Account Management:</strong> To create and manage your account, process returns/damage claims, and provide customer support</li>
                    <li><strong>Marketing:</strong> To send promotional emails and newsletters (with your consent). You may opt out at any time</li>
                    <li><strong>Improvement:</strong> To analyze usage patterns, improve our website and services, and personalize your shopping experience</li>
                    <li><strong>Security & Fraud Prevention:</strong> To detect, prevent, and address fraud, unauthorized transactions, and other illegal activities</li>
                    <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">3. Information Sharing & Third-Party Services</h2>
                  <p className="mb-4">We do not sell your personal information. We share information only with the following categories of service providers who help us operate our business:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                    <li><strong>Shopify Inc.</strong> — E-commerce platform for product catalog, checkout, and payment processing. Shopify processes payment card data under PCI-DSS compliance. <a href="https://www.shopify.com/legal/privacy" className="text-primary hover:underline">Shopify Privacy Policy</a></li>
                    <li><strong>Supabase Inc.</strong> — Database and backend services for account management and email capture. <a href="https://supabase.com/privacy" className="text-primary hover:underline">Supabase Privacy Policy</a></li>
                    <li><strong>Google LLC</strong> — Google Analytics for website traffic analysis and Google Ads for remarketing. <a href="https://policies.google.com/privacy" className="text-primary hover:underline">Google Privacy Policy</a></li>
                    <li><strong>DHL Express / FedEx International</strong> — Shipping carriers for order delivery. Tracking numbers and shipping addresses are shared to fulfill your orders</li>
                    <li><strong>Vercel Inc.</strong> — Web hosting and content delivery. <a href="https://vercel.com/legal/privacy-policy" className="text-primary hover:underline">Vercel Privacy Policy</a></li>
                  </ul>
                  <p className="mb-4">We may also disclose your information when required by law, to protect our rights, or to respond to legal processes.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">4. Your Rights</h2>
                  <p className="mb-4">Depending on your location, you may have the following rights regarding your personal data:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                    <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal data</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
                    <li><strong>Portability:</strong> Receive your data in a structured, commonly used format</li>
                    <li><strong>Opt-Out:</strong> Opt out of marketing communications at any time by clicking the unsubscribe link in any email or contacting us directly</li>
                    <li><strong>Restriction:</strong> Request restriction of processing of your personal data in certain circumstances</li>
                    <li><strong>Objection:</strong> Object to processing of your personal data for direct marketing purposes</li>
                  </ul>

                  <h3 className="font-semibold text-foreground mb-2 text-sm">California Residents (CCPA)</h3>
                  <p className="mb-4">Under the California Consumer Privacy Act, you have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                    <li>Know what personal information is collected about you</li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt out of the sale of your personal information (we do not sell your data)</li>
                    <li>Not be discriminated against for exercising your rights</li>
                  </ul>

                  <h3 className="font-semibold text-foreground mb-2 text-sm">EU/EEA Residents (GDPR)</h3>
                  <p className="mb-4">Under the General Data Protection Regulation, you have additional rights including:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>The right to lodge a complaint with a supervisory authority</li>
                    <li>The right to withdraw consent at any time (where processing is based on consent)</li>
                    <li>The right to object to processing based on legitimate interests</li>
                  </ul>
                  <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:privacy@luxemia.com" className="text-primary hover:underline">privacy@luxemia.com</a>. We will respond to your request within 30 days.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">5. Cookies & Tracking Technologies</h2>
                  <p className="mb-4">We use cookies and similar tracking technologies to operate and improve our services. Cookies are small data files stored on your device.</p>
                  
                  <h3 className="font-semibold text-foreground mb-2 text-sm">Types of Cookies We Use</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                    <li><strong>Essential Cookies:</strong> Required for website functionality (shopping cart, session management, security). These cannot be disabled.</li>
                    <li><strong>Analytics Cookies:</strong> Google Analytics cookies to understand how visitors use our site. These are anonymized where possible.</li>
                    <li><strong>Marketing Cookies:</strong> Used for remarketing and advertising personalization through Google Ads and social media platforms.</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences (currency, language, etc.).</li>
                  </ul>
                  <p className="mb-4">You can manage your cookie preferences through your browser settings. Note that disabling certain cookies may affect your experience on our website.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">6. Data Security</h2>
                  <p className="mb-4">We implement industry-standard security measures to protect your information, including:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>SSL/TLS encryption for all data in transit (HTTPS)</li>
                    <li>Secure payment processing through Shopify's PCI-DSS compliant systems</li>
                    <li>Access controls and authentication for our internal systems</li>
                    <li>Regular security reviews and updates</li>
                  </ul>
                  <p className="mt-4">However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security. We encourage you to use strong passwords and protect your account credentials.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">7. Data Retention</h2>
                  <p className="mb-4">We retain your personal data only for as long as necessary to fulfill the purposes described in this policy:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Account Data:</strong> Retained while your account is active and for up to 3 years after deletion for legal and dispute resolution purposes</li>
                    <li><strong>Order Data:</strong> Retained for 7 years for tax, accounting, and legal compliance</li>
                    <li><strong>Marketing Data:</strong> Retained until you opt out or request deletion</li>
                    <li><strong>Analytics Data:</strong> Anonymized after 26 months (Google Analytics retention period)</li>
                    <li><strong>Contact Form Submissions:</strong> Retained for 2 years for customer service purposes</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">8. International Data Transfers</h2>
                  <p className="mb-4">Your information may be transferred to and processed in countries other than your country of residence. Our servers are located in the United States and our service providers may process data in various jurisdictions. When we transfer data internationally, we ensure appropriate safeguards are in place, including standard contractual clauses and adherence to applicable data protection frameworks.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">9. Children's Privacy</h2>
                  <p>Our services are not directed to children under 16. We do not knowingly collect personal information from children under 16. If we learn that we have collected personal information from a child under 16, we will take steps to delete that information. If you believe we have inadvertently collected information from a child, please contact us at <a href="mailto:privacy@luxemia.com" className="text-primary hover:underline">privacy@luxemia.com</a>.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">10. Changes to This Policy</h2>
                  <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our website with a new "Last updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">11. Contact Us</h2>
                  <p className="mb-4">If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us:</p>
                  <p className="mt-4">
                    Email: <a href="mailto:privacy@luxemia.com" className="text-primary hover:underline">privacy@luxemia.com</a><br />
                    Phone: <a href="tel:+1-215-341-9990" className="text-primary hover:underline">+1-215-341-9990</a><br />
                    Address: LuxeMia Fashion Inc., 2208 Michener St, Philadelphia, PA 19115, United States
                  </p>
                  <p className="mt-4">
                    For GDPR-related inquiries, you may also contact our Data Protection Officer at <a href="mailto:privacy@luxemia.com" className="text-primary hover:underline">privacy@luxemia.com</a>.
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

export default Privacy;
