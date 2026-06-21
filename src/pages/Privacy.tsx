import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy — LuxeMia Boutique"
        description="LuxeMia Boutique Privacy Policy. Learn how we collect, use, share, and protect your personal information when you shop Indian ethnic wear at luxemia.shop."
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
              <p className="text-muted-foreground">Last updated: May 6, 2026 | Effective: January 1, 2026</p>
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
                <p className="text-foreground font-medium">
                  LuxeMia Boutique ("LuxeMia Boutique," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website luxemia.shop (the "Site"), make a purchase, or interact with us in any way. luxemia.shop is owned and operated by Glamour Indian Wear. Please read this policy carefully. By using our Site, you consent to the practices described herein.
                </p>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">1. Information We Collect</h2>
                  <p>We collect several types of information in order to provide and improve our services, process your orders, and communicate with you effectively.</p>

                  <h3 className="text-lg font-medium text-foreground mt-6 mb-2">a) Personal Information You Provide</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Identity Data:</strong> First name, last name, username, and date of birth (where applicable for age verification).</li>
                    <li><strong>Contact Data:</strong> Email address, billing address, shipping address, and telephone number.</li>
                    <li><strong>Financial Data:</strong> Payment card details. Please note that we do not store your full credit card number on our servers. All payment information is processed securely through Shopify Payments, Stripe, or other PCI-compliant payment processors. We only retain a tokenized reference and the last four digits of your card for receipt purposes.</li>
                    <li><strong>Transaction Data:</strong> Details of products you have purchased, order history, order value, payment method, and delivery information.</li>
                    <li><strong>Profile Data:</strong> Your preferences, wishlists, product reviews, feedback, survey responses, and any personal data you choose to provide through style consultations or size guides.</li>
                    <li><strong>Communications Data:</strong> Records of correspondence between you and LuxeMia Boutique, including emails, WhatsApp messages, and customer support interactions.</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-6 mb-2">b) Information Collected Automatically</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Device Data:</strong> Hardware model, operating system and version, browser type and version, screen resolution, device identifiers, and mobile network information.</li>
                    <li><strong>Usage Data:</strong> IP address, pages visited, time spent on pages, referring URLs, click patterns, search queries, and navigation paths through the Site.</li>
                    <li><strong>Location Data:</strong> General location derived from your IP address (country and city level). We do not collect precise GPS coordinates unless you explicitly grant permission.</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-6 mb-2">c) Information from Third Parties</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Social Media:</strong> If you log in or interact with our Site through social media integrations (Instagram, Facebook, Pinterest), we may receive your public profile information, friend lists, and email address as permitted by the social media platform and your privacy settings.</li>
                    <li><strong>Analytics Partners:</strong> Aggregated and anonymized data from Google Analytics and similar tools.</li>
                    <li><strong>Payment Processors:</strong> Confirmation of payment status and fraud screening results from Shopify Payments and other processors.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">2. How We Use Your Information</h2>
                  <p>We use the information we collect for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Order Processing & Fulfillment:</strong> To process your payments, confirm orders, arrange shipping via DHL Express, USPS, UPS, or FedEx, provide tracking information, and handle returns or damage claims.</li>
                    <li><strong>Account Management:</strong> To create and manage your LuxeMia Boutique account, maintain your order history, and save your preferences and wishlist items.</li>
                    <li><strong>Customer Support:</strong> To respond to your inquiries, resolve issues, process damage claims (with mandatory unboxing video), and provide styling consultations via WhatsApp or email.</li>
                    <li><strong>Personalization:</strong> To recommend products based on your browsing and purchase history, display relevant content, and tailor your shopping experience.</li>
                    <li><strong>Marketing Communications:</strong> To send promotional emails, newsletters, and product updates — only with your consent. You may opt out at any time using the unsubscribe link in any email or by contacting us directly.</li>
                    <li><strong>Fraud Prevention & Security:</strong> To detect and prevent fraudulent transactions, unauthorized access, and other illegal activities, including verifying your identity when necessary.</li>
                    <li><strong>Analytics & Improvement:</strong> To analyze how visitors use our Site, identify trends, measure the effectiveness of our marketing campaigns, and improve our website design, product offerings, and customer experience.</li>
                    <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or governmental requests, including tax and customs documentation for international shipments.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">3. Legal Basis for Processing (EU/UK Users)</h2>
                  <p>If you are a resident of the European Economic Area (EEA) or the United Kingdom, we process your personal data only when we have a legal basis to do so:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Contractual Necessity:</strong> Processing is necessary to fulfill our contract with you — for example, processing your order, delivering your purchase, and providing customer support.</li>
                    <li><strong>Consent:</strong> We have obtained your clear, affirmative consent — for example, when you opt in to receive marketing emails or enable location services.</li>
                    <li><strong>Legitimate Interest:</strong> Processing is necessary for our legitimate business interests — for example, fraud prevention, website analytics, and improving our services — provided such interests are not overridden by your rights and freedoms.</li>
                    <li><strong>Legal Obligation:</strong> Processing is necessary to comply with a legal obligation — for example, retaining transaction records for tax purposes or responding to lawful government requests.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">4. Information Sharing & Disclosure</h2>
                  <p>We do not sell, rent, or trade your personal information to third parties for their marketing purposes. We may share your information in the following circumstances:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Shipping & Logistics Partners:</strong> DHL Express, USPS, UPS, FedEx, and Aramex receive your name, shipping address, and phone number for delivery purposes only.</li>
                    <li><strong>Payment Processors:</strong> Shopify Payments, Stripe, PayPal, and Google Pay process your payment transactions securely in compliance with PCI-DSS standards.</li>
                    <li><strong>Platform Provider:</strong> Shopify Inc. hosts our online store and processes transactions on our behalf. Shopify's data practices are governed by their own Privacy Policy at shopify.com/legal/privacy.</li>
                    <li><strong>Analytics Providers:</strong> Google Analytics (GA4) helps us understand how visitors interact with our Site. Data is collected pseudonymously and aggregated.</li>
                    <li><strong>Marketing Tools:</strong> Email service providers and social media advertising platforms (Meta Custom Audiences, Google Ads) receive hashed email addresses or cookie-based identifiers for ad targeting — only when you have consented to marketing.</li>
                    <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of LuxeMia Boutique, our customers, or others.</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, reorganization, or sale of all or a portion of our assets, your personal data may be transferred as part of that transaction.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">5. International Data Transfers</h2>
                  <p>
                    LuxeMia Boutique is based in the United States and our primary data processing occurs in the US. Your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate. These countries may have data protection laws that differ from your country of residence. By using our Site, you consent to the transfer of your information to these countries. We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by the European Commission, to protect your data during international transfers.
                  </p>
                  <p className="mt-4">
                    Additionally, since our products are shipped internationally from India, order and shipping information may be shared with logistics providers operating in India, the United States, the United Kingdom, Canada, the United Arab Emirates, Australia, and other transit countries.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">6. Cookies & Tracking Technologies</h2>
                  <p>We use cookies and similar tracking technologies to track activity on our Site and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.</p>

                  <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Types of Cookies We Use</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Essential Cookies:</strong> Required for the Site to function properly — session management, shopping cart contents, and security features. These cannot be disabled.</li>
                    <li><strong>Analytics Cookies:</strong> Google Analytics cookies (_ga, _ga_*), which help us understand how visitors interact with our Site by collecting and reporting information anonymously. These cookies aggregate data and do not identify individual users.</li>
                    <li><strong>Marketing Cookies:</strong> Used by advertising platforms (Google Ads, Meta Pixel) to deliver relevant advertisements and measure campaign effectiveness. These are set only with your consent.</li>
                    <li><strong>Functionality Cookies:</strong> Remember your preferences such as currency selection, language, and recently viewed products to enhance your shopping experience.</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Managing Cookies</h3>
                  <p>
                    You can manage your cookie preferences through your browser settings. Most browsers allow you to refuse cookies, delete existing cookies, or alert you when a cookie is being set. Please note that disabling certain cookies may affect the functionality of our Site. For more information about cookies, visit allaboutcookies.org.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">7. Data Retention</h2>
                  <p>We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Transaction Records:</strong> Order and payment records are retained for 7 years as required by US tax and accounting regulations.</li>
                    <li><strong>Account Data:</strong> Your account information is retained for the lifetime of your account. You may request account deletion at any time.</li>
                    <li><strong>Marketing Consent Records:</strong> Records of your consent to receive marketing communications are retained for 3 years from the date of consent.</li>
                    <li><strong>Customer Support Records:</strong> Communication logs are retained for 2 years after the last interaction.</li>
                    <li><strong>Analytics Data:</strong> Aggregated, anonymized analytics data may be retained indefinitely.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">8. Your Rights</h2>
                  <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal data.</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
                    <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data in certain circumstances.</li>
                    <li><strong>Right to Data Portability:</strong> Request a copy of your data in a structured, commonly used, machine-readable format.</li>
                    <li><strong>Right to Object:</strong> Object to our processing of your personal data based on legitimate interests or for direct marketing purposes.</li>
                    <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where we rely on consent to process your data, including marketing emails.</li>
                    <li><strong>Right to Non-Discrimination:</strong> Under the California Consumer Privacy Act (CCPA), you have the right not to be discriminated against for exercising your privacy rights.</li>
                  </ul>
                  <p className="mt-4">
                    To exercise any of these rights, please contact us at <a href="mailto:hello@luxemia.shop" className="text-primary hover:underline">hello@luxemia.shop</a> or write to us at the address below. We will respond to your request within 30 days (or 45 days for CCPA requests). We may ask for verification of your identity before fulfilling your request.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">9. California Privacy Rights (CCPA/CPRA)</h2>
                  <p>If you are a California resident, the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA) grant you additional rights:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Right to Know:</strong> You have the right to know what personal information we collect, use, and disclose about you in the preceding 12 months.</li>
                    <li><strong>Right to Delete:</strong> You have the right to request deletion of your personal information, with certain exceptions.</li>
                    <li><strong>Right to Opt Out of Sale/Sharing:</strong> We do not sell your personal information. We do not share your personal information for cross-context behavioral advertising beyond what is described in this policy.</li>
                    <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> We do not collect or use sensitive personal information beyond what is necessary to provide our services.</li>
                    <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights.</li>
                  </ul>
                  <p className="mt-4">
                    In the preceding 12 months, we have collected the following categories of personal information: identifiers (name, email, phone), customer records (order history, shipping address), commercial information (purchase history), internet activity (browsing data, cookies), and inferences (shopping preferences). We have not sold any personal information.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">10. Children's Privacy</h2>
                  <p>
                    Our Site is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately at <a href="mailto:hello@luxemia.shop" className="text-primary hover:underline">hello@luxemia.shop</a>. If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to remove that information from our servers as promptly as possible.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">11. Data Security</h2>
                  <p>
                    We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>SSL/TLS encryption for all data transmitted between your browser and our servers</li>
                    <li>PCI-DSS compliant payment processing through Shopify Payments and authorized payment processors</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls limiting employee access to personal data on a need-to-know basis</li>
                    <li>Secure data storage with encryption at rest for sensitive information</li>
                  </ul>
                  <p className="mt-4">
                    While we strive to use commercially acceptable means to protect your personal data, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">12. Third-Party Links</h2>
                  <p>
                    Our Site may contain links to third-party websites, including social media platforms, payment providers, and partner sites. This Privacy Policy does not apply to those external sites. We encourage you to review the privacy policies of any third-party sites you visit. LuxeMia Boutique is not responsible for the privacy practices or content of external websites.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">13. Email Communications</h2>
                  <p>We may send you emails for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Transactional Emails:</strong> Order confirmations, shipping notifications, delivery updates, and return/damage claim correspondence. These are necessary for order fulfillment and cannot be opted out of.</li>
                    <li><strong>Marketing Emails:</strong> Promotional offers, new arrivals, sale announcements, and style guides. These are sent only with your consent, and you may opt out at any time via the unsubscribe link in any marketing email or by contacting us.</li>
                    <li><strong>Service Emails:</strong> Account updates, policy changes, and security alerts.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">14. Changes to This Privacy Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. For significant changes, we may also send you a notification via email or a prominent notice on our Site. We encourage you to review this Privacy Policy periodically.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">15. Contact Us</h2>
                  <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
                  <div className="mt-4 p-6 bg-card border border-border rounded-lg space-y-2">
                    <p><strong className="text-foreground">Glamour Indian Wear</strong></p>
                    <p>2208 Michener St, Philadelphia, PA 19115, USA</p>
                    <p>Email: <a href="mailto:hello@luxemia.shop" className="text-primary hover:underline">hello@luxemia.shop</a></p>
                    <p>Phone: <a href="tel:+12153419990" className="text-primary hover:underline">+1-215-341-9990</a></p>
                    <p>WhatsApp: <a href="https://wa.me/12153419990" className="text-primary hover:underline">+1-215-341-9990</a></p>
                  </div>
                  <p className="mt-4">
                    For EU/UK data protection inquiries, you also have the right to lodge a complaint with your local supervisory authority.
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
