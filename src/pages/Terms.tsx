import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
              <h1 className="text-4xl md:text-5xl font-serif mb-6">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
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
                  <h2 className="text-xl font-serif text-foreground mb-4">1. Acceptance of Terms</h2>
                  <p>By accessing or using LuxeMia's website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">2. Products and Pricing</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All prices are listed in US Dollars (USD) unless otherwise specified.</li>
                    <li>Prices are subject to change without notice.</li>
                    <li>We reserve the right to limit quantities on any order.</li>
                    <li>Product images are for illustration purposes; actual colors may vary slightly.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">3. Orders and Payment</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All orders are subject to acceptance and availability.</li>
                    <li>Payment must be received before order processing.</li>
                    <li>We accept major credit cards and other payment methods as displayed at checkout.</li>
                    <li>We reserve the right to cancel orders if fraud is suspected.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">4. Shipping and Delivery</h2>
                  <p>Shipping times and costs vary by destination. Please refer to our Shipping page for detailed information. LuxeMia is not responsible for delays caused by customs, weather, or carrier issues.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">5. Returns and Refunds</h2>
                  <p>Please refer to our Returns & Exchanges page for our complete return policy. Returns are accepted within 15 days of delivery for eligible items in original condition.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">6. Intellectual Property</h2>
                  <p>All content on this website, including images, text, logos, and designs, is the property of LuxeMia and protected by intellectual property laws. You may not reproduce, distribute, or use our content without permission.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">7. User Accounts</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You are responsible for maintaining the security of your account.</li>
                    <li>You must provide accurate and complete information.</li>
                    <li>We reserve the right to terminate accounts that violate these terms.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">8. Limitation of Liability</h2>
                  <p>LuxeMia shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or products. Our total liability shall not exceed the amount paid for the product in question.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">9. Governing Law</h2>
                  <p>These Terms shall be governed by the laws of the State of California, USA. Any disputes shall be resolved in the courts of Los Angeles County, California.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">10. Contact</h2>
                  <p>For questions about these Terms, please contact us at:</p>
                  <p className="mt-4">
                    Email: <a href="mailto:legal@luxemia.com" className="text-primary hover:underline">legal@luxemia.com</a><br />
                    Address: LuxeMia Fashion Inc., Los Angeles, CA 90001
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
