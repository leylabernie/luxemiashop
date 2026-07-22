import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Package, Truck, Ruler, Sparkles, CreditCard, RotateCcw, Mail, Search, Phone, MessageCircle, ChevronRight, Home } from 'lucide-react';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = useMemo(() => ([
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
          answer: 'Orders can only be modified or cancelled within 24 hours of placement. After this window, your order enters production and cannot be changed. To request a cancellation, email hello@luxemia.shop immediately with your order number.',
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
          answer: 'We currently ship to the USA, Canada, and Australia. Free shipping on orders over $350 USD. A flat rate of $25 USD applies to orders under $350. Delivery times vary by destination — see our Shipping Policy for details.',
        },
        {
          question: 'How long does shipping take?',
          answer: 'Readymade items are dispatched within 3-5 business days, and custom/alteration orders within 5-7 business days. Delivery takes 3-5 business days via DHL Express, or 7-10 business days via USPS/UPS standard shipping. Delivery times vary by destination.',
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
          answer: 'Yes! We offer free shipping on orders over $350 USD to the USA, Canada, and Australia. A flat rate of $25 USD applies to orders under $350.',
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
          answer: 'No. All sales are final and we do not accept returns or exchanges for sizing issues. We strongly recommend using our Size Guide and contacting us before ordering to ensure the correct size. For minor fit adjustments, a local tailor can often help.',
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
          answer: 'All sales are final. LuxeMia does not accept returns or exchanges for any reason, including sizing issues, color variations, or change of mind. The only exception is genuine shipping damage, which must be supported by a mandatory unboxing video recorded before and during package opening.',
        },
        {
          question: 'Why do I need an unboxing video?',
          answer: 'The unboxing video is the only way we can process a damage or missing-item claim. Without video evidence of the package condition on arrival and the moment of opening, we have no way to verify transit damage. Claims without a valid unboxing video cannot be processed.',
        },
        {
          question: 'What items cannot be returned?',
          answer: 'All items are final sale with no exceptions other than genuine shipping damage supported by an unboxing video. This includes sizing issues, color variations, change of mind, and event cancellations.',
        },
        {
          question: 'What if my item arrives damaged?',
          answer: 'Email us at hello@luxemia.shop within 48 hours of delivery with your order number, unboxing video, and photos of the damage. Claims without video evidence or submitted after 48 hours cannot be processed. Our team will review and respond within 2-3 business days.',
        },
        {
          question: 'Can I cancel my order?',
          answer: 'Orders can be cancelled within 24 hours of placement only. After 24 hours, production begins and the order cannot be cancelled. Contact us immediately at hello@luxemia.shop or WhatsApp +1-215-341-9990.',
        },
        {
          question: 'Can I exchange for a different size or color?',
          answer: 'No. All sales are final and we do not accept exchanges. We recommend using our detailed Size Guide and contacting us before ordering with any questions about sizing, fit, or color.',
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
          answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save your wishlist, store multiple addresses, and access member benefits.',
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
          answer: 'Yes! Join LuxeMia Rewards to earn points on every purchase, get early access to sales, receive birthday discounts, and enjoy member-only offers. Sign up is free!',
        },
        {
          question: 'Can I save items to buy later?',
          answer: 'Yes! Add items to your Wishlist to save them for later. Create an account to access your wishlist across devices. Note that wishlist items are not reserved and may sell out.',
        },
        {
          question: 'How can I contact customer service?',
          answer: 'Email us at hello@luxemia.shop, call +1-215-341-9990 (Mon-Sat 10AM-7PM EST, Sun 11AM-5PM EST), or use the contact form on our Contact page. We aim to respond to all inquiries within 24-48 hours.',
        },
      ],
    },
    {
      icon: Sparkles,
      title: 'Indian Ethnic Wear & Fabric',
      faqs: [
        {
          question: 'What is the difference between Banarasi silk and Kanchipuram silk sarees?',
          answer: 'Banarasi silk sarees originate from Varanasi and are known for their intricate Mughal-inspired motifs, heavy zari work, and brocade weaving. Kanchipuram (Kanjivaram) silk sarees come from Tamil Nadu and feature bold, temple-inspired designs with thick silk and contrast borders. Both are premium choices for weddings — Banarasi for North Indian ceremonies and Kanchipuram for South Indian traditions. Both are available in our saree collection.',
        },
        {
          question: 'What does semi-stitched mean for lehengas and suits?',
          answer: 'Semi-stitched means the garment is partially stitched with standard sizing (usually at the waist or bust) but allows room for further customization. You can have it tailored to your exact measurements by a local tailor or use our custom stitching service. This offers a balance between the convenience of readymade and the fit of fully custom.',
        },
        {
          question: 'How do I choose the right fabric for my Indian wedding outfit?',
          answer: 'For winter weddings, choose velvet, raw silk, or Banarasi silk for warmth and richness. For summer weddings, opt for georgette, chiffon, organza, or lightweight cotton silk for comfort. For versatile year-round options, crepe and satin work beautifully. Our fabric guide blog post covers this in detail.',
        },
        {
          question: 'Are your products authentic Indian ethnic wear?',
          answer: 'Yes. All our products are sourced directly from India\'s renowned textile hubs including Surat, Varanasi, Jaipur, and Lucknow. We work with established manufacturers and artisan communities. Every piece undergoes a quality inspection at our India facility before shipping to verify authenticity, stitching quality, and embellishment security.',
        },
        {
          question: 'What is zardozi embroidery?',
          answer: 'Zardozi is a traditional Indian embroidery technique that uses metallic threads (usually gold or silver), beads, pearls, and precious stones to create elaborate, raised designs on fabric. It originated in Persia and was popularized during the Mughal era. Zardozi work is commonly found on bridal lehengas, wedding sarees, and sherwanis. It adds significant value and grandeur to any garment.',
        },
        {
          question: 'Do you sell unstitched fabric or only ready-made outfits?',
          answer: 'We offer both. Many of our suits and lehengas come as semi-stitched or unstitched fabric sets, allowing you to have them custom-tailored to your exact measurements. Product listings clearly state whether an item is readymade, semi-stitched, or unstitched. You can also opt for our custom tailoring service during checkout for select styles.',
        },
      ],
    },
    {
      icon: Truck,
      title: 'Shopping from USA, Canada & Australia',
      faqs: [
        {
          question: 'Can I buy Indian ethnic wear online from the USA?',
          answer: 'Yes! LuxeMia specializes in shipping authentic Indian ethnic wear directly to customers in the USA. We offer free shipping on orders over $350 and a flat $25 shipping fee on orders under $350. All shipments are sent via DHL Express, USPS, or UPS with full tracking and insurance. Typical delivery is 6-15 business days for readymade items.',
        },
        {
          question: 'Will I have to pay customs duties on my order in the USA?',
          answer: 'Yes, import duties and local taxes are the responsibility of the customer and are not included in our prices. For US customers, please note that goods from India may be subject to additional tariffs (currently 50% on certain textile categories). Customs fees are collected by your country\'s customs authority upon delivery. Check with your local customs office for current rates.',
        },
        {
          question: 'Do you ship to Canada and Australia?',
          answer: 'Yes! We ship to Canada and Australia with the same shipping rates: free on orders over $350 USD, flat $25 USD on orders under $350. Canadian and Australian customers may also be responsible for import duties and local taxes (GST/HST/PST in Canada, GST in Australia). Delivery times are similar: 6-15 business days for readymade items.',
        },
        {
          question: 'How do Indian clothing sizes compare to US sizes?',
          answer: 'Indian ethnic wear sizing differs from Western sizing. Our Size Guide page provides detailed measurement charts in inches that map to our S, M, L, XL, and XXL sizes. We strongly recommend measuring yourself and comparing to our charts rather than guessing. When in doubt, size up — it\'s easier to take in a garment than to let it out. Custom tailoring is also available for a perfect fit.',
        },
        {
          question: 'What if the color looks different in person than on screen?',
          answer: 'We strive for accurate color representation in our product photography, but slight variations can occur due to screen settings, lighting conditions, and the nature of handcrafted textiles. Many Indian fabrics also appear different in natural vs. artificial light. We recommend reviewing all available product images and reading the fabric description carefully before purchasing.',
        },
        {
          question: 'How long does delivery take to the USA, Canada, or Australia?',
          answer: 'Readymade items are dispatched within 3-5 business days, and custom/alteration orders within 5-7 business days. Delivery takes 3-5 business days via DHL Express, or 7-10 business days via USPS/UPS standard shipping. Total estimated delivery: 6-15 business days (readymade) or 8-17 business days (custom). All shipments include full tracking and insurance.',
        },
      ],
    },
  ]), []);

  const allFaqs = useMemo(
    () => faqCategories.flatMap(category => category.faqs),
    [faqCategories],
  );

  // Search/filter logic
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories;

    const query = searchQuery.toLowerCase().trim();

    return faqCategories
      .map(category => ({
        ...category,
        faqs: category.faqs.filter(
          faq =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        ),
      }))
      .filter(category => category.faqs.length > 0);
  }, [searchQuery, faqCategories]);

  const totalFaqCount = allFaqs.length;
  const hasResults = filteredCategories.length > 0;

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
        faqs={allFaqs}
      />
      <Header />
      
      <main className="pt-[90px] lg:pt-[132px] pb-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3" />
            </li>
            <li>
              <span className="text-foreground font-medium">FAQ</span>
            </li>
          </ol>
        </nav>

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
              <h1 className="text-4xl md:text-5xl font-serif mb-4">Frequently Asked Questions</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
                Find answers to common questions about orders, shipping, sizing, returns, and more. 
                Can't find what you're looking for? Contact our support team.
              </p>
              <p className="text-sm text-primary font-medium">
                {totalFaqCount} questions answered
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="py-6 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions and answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                aria-label="Search frequently asked questions"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
            {searchQuery.trim() && (
              <p className="text-sm text-muted-foreground mt-2">
                {hasResults
                  ? `Showing results for "${searchQuery.trim()}"`
                  : `No results for "${searchQuery.trim()}"`
                }
              </p>
            )}
          </div>
        </section>

        {/* Quick Links */}
        {!searchQuery.trim() && (
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
        )}

        {/* FAQ Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            {!hasResults ? (
              <div className="text-center py-16">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-serif mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {filteredCategories.map((category, categoryIndex) => (
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
            )}
          </div>
        </section>

        {/* Related Links */}
        {!searchQuery.trim() && (
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
        )}

        {/* Still Need Help — Prominent Contact CTA */}
        <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-serif mb-4">Still Have Questions?</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Our customer care team is here to help. Reach out through any of the channels below 
                  and we'll get back to you within 24-48 hours.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/12153419990"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-green-500/50 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">+1-215-341-9990</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Quick responses during business hours</p>
                </a>

                {/* Email */}
                <a
                  href="mailto:hello@luxemia.shop"
                  className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">Email</p>
                    <p className="text-xs text-muted-foreground">hello@luxemia.shop</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Response within 24-48 hours</p>
                </a>

                {/* Phone */}
                <a
                  href="tel:+12153419990"
                  className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">Phone</p>
                    <p className="text-xs text-muted-foreground">+1-215-341-9990</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Mon-Sat 10AM-7PM EST</p>
                </a>
              </div>

              <div className="text-center mt-8">
                <Link to="/contact">
                  <Button size="lg" className="px-8">
                    Contact Us Page
                  </Button>
                </Link>
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
