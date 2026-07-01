import { motion } from 'framer-motion';
import { Globe, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Will I be charged customs duties on my order?',
    answer: 'It depends on your country\'s import thresholds and the declared value of your order. Many smaller orders enter duty-free, but larger orders may be subject to customs duties, import taxes, or clearance fees charged by your local customs authority upon delivery. These charges are separate from your order total and are not collected by us at checkout.'
  },
  {
    question: 'Why aren\'t duties and taxes included at checkout?',
    answer: 'Because duty rates and tax thresholds vary by country and change frequently, we cannot accurately calculate them at checkout. Your local customs authority assesses and collects these charges directly when your package arrives in your country. This is standard practice for international shipping from India.'
  },
  {
    question: 'How much will I have to pay in duties?',
    answer: 'The amount, if any, depends on your country\'s current thresholds and rules. We recommend checking with your local customs office before placing your order if you want to estimate potential charges. For reference, the US has a de minimis threshold of $800 (orders under this amount typically enter duty-free), while Canada and Australia have lower thresholds and may apply GST/HST/VAT.'
  },
  {
    question: 'Do you declare accurate values on shipments?',
    answer: 'Yes. We always declare the accurate order value on all international shipments. Under-declaring values to avoid duties is customs fraud and can result in your shipment being seized, fines, or prosecution by your local customs authority. We do not accommodate requests to under-declare.'
  },
  {
    question: 'What happens if my package is held by customs?',
    answer: 'If your local customs authority requires additional documentation or payment, they will contact you directly using the contact information on your shipment. In rare cases, this can delay delivery by a few days. Once any required duties are paid, customs releases the package for final delivery.'
  },
  {
    question: 'Can I refuse a package with duties owed?',
    answer: 'You can refuse a package at delivery, but refused packages are returned to us at your expense (return shipping + any duties assessed). We do not refund original shipping charges for refused packages. If you have concerns about potential duties, we recommend checking with your local customs office before ordering.'
  },
];

const ShippingCustoms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping & Customs | Import Duties & Local Taxes | LuxeMia"
        description="Learn how international shipping and customs work at LuxeMia. Information on import duties, local taxes, and customs clearance for orders shipped from India to USA, Canada & Australia."
        canonical="https://luxemia.shop/shipping-customs"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Shipping & Customs', url: '/shipping-customs' },
        ]}
        faqs={faqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Hero */}
        <section className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <span>/</span>
                <span className="text-foreground">Shipping & Customs</span>
              </nav>
              <h1 className="font-serif text-4xl md:text-5xl mb-4">Shipping & Customs</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Everything you need to know about international shipping, customs duties, and local taxes
                when ordering from LuxeMia.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 lg:px-8 max-w-4xl py-12 md:py-16">
          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="prose prose-lg max-w-none mb-12"
          >
            <p className="text-base text-foreground leading-relaxed mb-6">
              We ship internationally from India. Depending on your country's import regulations, your
              order may be subject to customs duties, import taxes, or clearance fees charged by your
              local customs authority upon delivery. These charges are separate from your order total
              and are not collected by us at checkout. The amount, if any, depends on your country's
              current thresholds and rules.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              If you have questions about potential charges before ordering, we recommend checking
              with your local customs office.
            </p>
          </motion.div>

          {/* Quick Facts */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="p-5 bg-card border border-border rounded-lg">
              <Globe className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-medium mb-1">Shipped from India</h3>
              <p className="text-sm text-muted-foreground">
                All orders ship from our workshop in India via DHL Express, USPS, or UPS.
              </p>
            </div>
            <div className="p-5 bg-card border border-border rounded-lg">
              <FileText className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-medium mb-1">Accurate Declarations</h3>
              <p className="text-sm text-muted-foreground">
                We declare the true order value on every shipment. No under-declarations.
              </p>
            </div>
            <div className="p-5 bg-card border border-border rounded-lg">
              <HelpCircle className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-medium mb-1">Check Before Ordering</h3>
              <p className="text-sm text-muted-foreground">
                Contact your local customs office for current duty rates and thresholds.
              </p>
            </div>
          </div>

          {/* Country-specific quick reference */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-12">
            <h2 className="font-serif text-2xl mb-4">Quick Reference by Country</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Below are general guidelines. Always confirm with your local customs authority — rates
              and thresholds change frequently.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 pb-4 border-b border-border">
                <div className="font-medium md:w-40 flex-shrink-0">United States</div>
                <div className="text-sm text-muted-foreground">
                  De minimis threshold of $800 — most orders under this amount enter duty-free.
                  Orders over $800 may be subject to duties. Note: an additional tariff on goods
                  from India may apply (currently 50% on certain textile categories).
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 pb-4 border-b border-border">
                <div className="font-medium md:w-40 flex-shrink-0">Canada</div>
                <div className="text-sm text-muted-foreground">
                  GST/HST (5–15% depending on province) plus potential import duties (0–18% on
                  textile imports). Collected by the carrier at delivery.
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <div className="font-medium md:w-40 flex-shrink-0">Australia</div>
                <div className="text-sm text-muted-foreground">
                  GST (10%) applies on goods over AUD 1,000. Import duties vary (0–10%). Collected
                  by customs at delivery.
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-background border border-border rounded-lg px-5"
                >
                  <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Cross-link to full Shipping Policy */}
          <div className="bg-secondary/30 border border-border rounded-lg p-6 md:p-8 text-center">
            <h2 className="font-serif text-xl mb-2">Need more shipping details?</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
              For shipping rates, delivery times, tracking, and our full shipping policy, visit our
              Shipping page.
            </p>
            <Link
              to="/shipping"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              View Full Shipping Policy
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingCustoms;
