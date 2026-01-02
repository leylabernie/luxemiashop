import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Privacy = () => {
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
              <h1 className="text-4xl md:text-5xl font-serif mb-6">Privacy Policy</h1>
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
                  <h2 className="text-xl font-serif text-foreground mb-4">1. Information We Collect</h2>
                  <p>We collect information you provide directly, including:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Name, email address, and contact information</li>
                    <li>Shipping and billing addresses</li>
                    <li>Payment information (processed securely by our payment providers)</li>
                    <li>Order history and preferences</li>
                    <li>Communications you send to us</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">2. How We Use Your Information</h2>
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Process and fulfill your orders</li>
                    <li>Communicate about your orders and account</li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Improve our products and services</li>
                    <li>Prevent fraud and ensure security</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">3. Information Sharing</h2>
                  <p>We do not sell your personal information. We may share information with:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Service providers who assist with order fulfillment and shipping</li>
                    <li>Payment processors for secure transactions</li>
                    <li>Analytics providers to improve our services</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">4. Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Data portability</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">5. Cookies</h2>
                  <p>We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage cookie preferences through your browser settings.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">6. Security</h2>
                  <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
                </section>

                <section>
                  <h2 className="text-xl font-serif text-foreground mb-4">7. Contact Us</h2>
                  <p>If you have questions about this Privacy Policy, please contact us at:</p>
                  <p className="mt-4">
                    Email: <a href="mailto:privacy@luxemia.com" className="text-primary hover:underline">privacy@luxemia.com</a><br />
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

export default Privacy;
