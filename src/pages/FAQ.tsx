import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, Package, Truck, Ruler, Sparkles, CreditCard, RotateCcw, Mail } from 'lucide-react';

const FAQ = () => {
  const faqCategories = [
    {
      icon: Package,
      title: 'Orders & Payment',
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'Simply browse our collections, select your desired items, choose your size and preferences, and add them to your cart. Proceed to checkout where you can enter your shipping details and complete payment using credit/debit card, PayPal, or other available methods.',
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All transactions are secured with SSL encryption. Please note that we do not offer installment or buy-now-pay-later payment options at this time.',
        },
        {
          question: 'Can I modify or cancel my order after placing it?',
          answer: 'Orders can only be modified or cancelled within 24 hours of placement. After this window, your order enters production and cannot be changed. To request a cancellation, email orders@luxemia.com immediately with your order number.',
        },
        {
          question: 'How do I apply a discount code?',
          answer: 'Enter your discount code in the "Promo Code" field during checkout and click "Apply". The discount will be reflected in your order total. Note that only one discount code can be applied per order, and some exclusions may apply.',
        },
        {
          question: 'Will I receive an order confirmation?',
          answer: 'Yes, you will receive an email confirmation immediately after placing your order. This includes your order number, items ordered, and estimated delivery timeline. Check your spam folder if you do not receive it.',
        },
      ],
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      faqs: [
        {
          question: 'Where do you ship to?',
          answer: 'We ship worldwide to over 100 countries. Shipping rates and delivery times vary by destination. View our complete shipping policy for detailed information on rates for your country.',
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping to the US takes 7-12 business days, Express shipping takes 3-5 business days. International orders typically take 10-21 business days depending on the destination. Custom orders require additional 3-4 weeks for production.',
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order ships, you will receive an email with your tracking number and a link to track your package. You can also track your order by logging into your account or contacting our support team.',
        },
        {
          question: 'Do I have to pay customs duties or taxes?',
          answer: 'Yes, import duties, customs fees, and local taxes are the responsibility of the customer and are NOT included in our prices. These are collected by your country\'s customs authority upon delivery. US customers should note the additional 50% tariff on goods from India.',
        },
        {
          question: 'What if my package is delayed or lost?',
          answer: 'If your package appears delayed, first check the tracking information for updates. For packages significantly delayed or showing no movement, contact us and we will work with the carrier to locate your package. Lost packages will be replaced or refunded after investigation.',
        },
        {
          question: 'Do you offer free shipping?',
          answer: 'Yes! We offer free standard shipping on orders over $500 for US customers. International free shipping thresholds vary by country—check our shipping page for details.',
        },
      ],
    },
    {
      icon: Ruler,
      title: 'Sizing & Measurements',
      faqs: [
        {
          question: 'How do I find my size?',
          answer: 'Use our comprehensive Size Guide to find your perfect fit. We recommend having a professional tailor take your measurements for the most accurate results. All measurements should be in inches.',
        },
        {
          question: 'Do you offer custom sizing?',
          answer: 'Yes! We offer custom sizing for all our garments. You can submit your measurements through our Size Guide page. Custom orders take an additional 3-4 weeks for production.',
        },
        {
          question: 'What if my measurements don\'t fit standard sizes?',
          answer: 'No problem! Simply submit your custom measurements when ordering. Our tailors will create your garment to your exact specifications. Please note that custom-sized items are final sale.',
        },
        {
          question: 'Can I return items if they don\'t fit?',
          answer: 'For standard sizes, items can be returned within 7 days if unworn and with tags attached. However, garments made to customer-provided measurements cannot be returned or exchanged due to fit issues. You are responsible for providing accurate measurements.',
        },
        {
          question: 'What measurements do I need to provide?',
          answer: 'Essential measurements include bust, waist, and hips. For blouses, you\'ll also need shoulder width, sleeve length, and armhole. For lehengas, provide length from waist to floor. Our Size Guide has detailed instructions for each measurement.',
        },
        {
          question: 'Should I add ease to my measurements?',
          answer: 'No, please provide your exact body measurements. Our tailors will add the appropriate ease based on the garment style. Adding extra inches yourself may result in a garment that\'s too loose.',
        },
      ],
    },
    {
      icon: RotateCcw,
      title: 'Returns & Exchanges',
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns for manufacturing defects or errors on our part within 7 days of delivery. Items must be unworn, unwashed, and in original condition with all tags attached. A mandatory unboxing video is required for all claims.',
        },
        {
          question: 'Why do I need an unboxing video?',
          answer: 'The unboxing video protects both you and us by providing clear evidence of the package condition upon arrival. It helps us quickly verify and process legitimate claims. Claims without video evidence cannot be processed.',
        },
        {
          question: 'What items cannot be returned?',
          answer: 'Custom/made-to-order pieces, items with incorrect customer-provided measurements, intimate wear (blouses, petticoats), items marked "Final Sale", worn/altered items, and returns requested after 7 days are not eligible.',
        },
        {
          question: 'How long does the refund process take?',
          answer: 'Once we receive and inspect your return (3-5 business days), refunds are processed to the original payment method. Credit card refunds take 5-10 business days to appear; PayPal refunds take 3-5 business days.',
        },
        {
          question: 'Who pays for return shipping?',
          answer: 'For defective items or our errors, we cover return shipping costs. For other approved returns, the customer is responsible for return shipping and the original shipping cost may be deducted from the refund.',
        },
        {
          question: 'Can I exchange for a different size or color?',
          answer: 'Exchanges are only available for manufacturing defects. If you need a different size or color, please return the original item for a refund and place a new order.',
        },
      ],
    },
    {
      icon: Sparkles,
      title: 'Product Care',
      faqs: [
        {
          question: 'How should I care for my silk garments?',
          answer: 'Silk should always be dry cleaned by a professional familiar with delicate fabrics. Store in a breathable garment bag away from direct sunlight. Never hang heavy silk garments—fold them with acid-free tissue paper.',
        },
        {
          question: 'How do I store my lehenga?',
          answer: 'Store flat in a cool, dry place wrapped in muslin or cotton cloth. Add silica gel packets to prevent moisture damage. Refold periodically to prevent permanent creases along fold lines.',
        },
        {
          question: 'Can I iron my embroidered garments?',
          answer: 'Never iron directly on embroidery or embellishments. Iron on the reverse side using low heat with a pressing cloth. For heavily embellished pieces, professional steaming is recommended.',
        },
        {
          question: 'How do I care for jewelry?',
          answer: 'Store each piece separately to prevent scratching. Avoid contact with perfumes, lotions, and water. Wipe gently with a soft, dry cloth after wearing. Store in airtight containers with anti-tarnish strips.',
        },
        {
          question: 'What if my garment has a small stain?',
          answer: 'Do not attempt to remove stains at home—you may damage the fabric or embroidery. Take the garment to a professional dry cleaner immediately. Point out the stain and provide details about what caused it.',
        },
        {
          question: 'How often should I dry clean my ethnic wear?',
          answer: 'Only dry clean when necessary. Over-cleaning can damage delicate fabrics. For occasional wear items, air them out after each use and store properly. Dry clean only when visibly soiled or before long-term storage.',
        },
      ],
    },
    {
      icon: CreditCard,
      title: 'Account & General',
      faqs: [
        {
          question: 'Do I need an account to order?',
          answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save your wishlist, store multiple addresses, and access exclusive member benefits.',
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Sign In" and then "Forgot Password". Enter your email address and we\'ll send you a link to reset your password. The link expires in 24 hours for security.',
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we use industry-standard SSL encryption to protect all data. We never store credit card information on our servers. Read our Privacy Policy for detailed information on how we protect your data.',
        },
        {
          question: 'Do you have a loyalty program?',
          answer: 'Yes! Join LuxeMia Rewards to earn points on every purchase, get early access to sales, receive birthday discounts, and enjoy exclusive member-only offers. Sign up is free!',
        },
        {
          question: 'Can I save items to buy later?',
          answer: 'Yes! Add items to your Wishlist to save them for later. Create an account to access your wishlist across devices. Note that wishlist items are not reserved and may sell out.',
        },
        {
          question: 'How can I contact customer service?',
          answer: 'Email us at hello@luxemia.com, call +1-215-341-9990 (Mon-Sat 10AM-7PM EST, Sun 11AM-5PM EST), or use the contact form on our Contact page. We aim to respond to all inquiries within 24-48 hours.',
        },
      ],
    },
  ];

  // Generate FAQ Schema for structured data
  const allFaqs = faqCategories.flatMap(category => category.faqs);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Frequently Asked Questions — LuxeMia"
        description="Find answers to common questions about LuxeMia orders, shipping, sizing, returns, and product care."
        canonical="https://luxemia.shop/faq"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'FAQ', url: '/faq' },
        ]}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Help Center</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif mb-6">Frequently Asked Questions</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about orders, shipping, sizing, returns, and more. 
                Can't find what you're looking for? Contact our support team.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {faqCategories.map((category) => (
                <a
                  key={category.title}
                  href={`#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary/50 transition-colors"
                >
                  <category.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{category.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  id={category.title.toLowerCase().replace(/\s+/g, '-')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="scroll-mt-32"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <category.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-serif">{category.title}</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${category.title}-${faqIndex}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-xl font-serif text-center mb-8">Helpful Resources</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Link 
                to="/size-guide"
                className="p-4 bg-card border border-border rounded-lg text-center hover:border-primary/50 transition-colors"
              >
                <Ruler className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Size Guide</span>
              </Link>
              <Link 
                to="/shipping"
                className="p-4 bg-card border border-border rounded-lg text-center hover:border-primary/50 transition-colors"
              >
                <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Shipping Policy</span>
              </Link>
              <Link 
                to="/returns"
                className="p-4 bg-card border border-border rounded-lg text-center hover:border-primary/50 transition-colors"
              >
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Returns Policy</span>
              </Link>
              <Link 
                to="/care-guide"
                className="p-4 bg-card border border-border rounded-lg text-center hover:border-primary/50 transition-colors"
              >
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Care Guide</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Still Need Help */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-serif mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-8">
                Our customer care team is here to help. Reach out and we'll get back to you 
                within 24-48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg">Contact Us</Button>
                </Link>
                <a href="mailto:hello@luxemia.com">
                  <Button variant="outline" size="lg">
                    <Mail className="w-4 h-4 mr-2" />
                    hello@luxemia.com
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;