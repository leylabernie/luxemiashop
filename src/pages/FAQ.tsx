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
          answer: 'Cancellation requests must be made within 24 hours of order placement. After that window, cancellation requests are not accepted. Email hello@luxemia.shop immediately with your order number.',
        },
        {
          question: 'How do I apply a discount code?',
          answer: 'Enter your discount code in the "Promo Code" field during checkout and click "Apply". The discount will be reflected in your order total. Note that only one discount code can be applied per order, and some exclusions may apply.',
        },
        {
          question: 'Will I receive an order confirmation?',
          answer: 'Yes, you will receive an email confirmation immediately after placing your order. This includes your order number and items ordered. Check your spam folder if you do not receive it.',
        },
      ],
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      faqs: [
        {
          question: 'Where do you ship to?',
          answer: 'LuxeMia currently ships to United States addresses only. Free US shipping applies at $150 and above, and a flat $12 rate applies below $150. Online orders ship with tracking after dispatch.',
        },
        {
          question: 'How long does shipping take?',
          answer: 'In-stock online items receive tracking after dispatch. Carrier transit time begins after dispatch and depends on the service shown at checkout.',
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order ships, you will receive an email with your tracking number and a link to track your package. You can also track your order by logging into your account or contacting our support team.',
        },
        {
          question: 'Do I have to pay taxes?',
          answer: 'Taxes, if applicable, are calculated at checkout. LuxeMia currently ships to United States addresses only.',
        },
        {
          question: 'What if my package is delayed or lost?',
          answer: 'If your package appears delayed, first check the tracking information for updates. For packages significantly delayed or showing no movement, contact us and we will work with the carrier to locate your package. Lost packages will be replaced or refunded after investigation.',
        },
        {
          question: 'Do you offer free US shipping?',
          answer: 'Yes. We offer free US shipping at $150 and above. A flat $12 shipping rate applies below $150.',
        },
      ],
    },
    {
      icon: Ruler,
      title: 'Sizing & Measurements',
      faqs: [
        {
          question: 'How do I find my size?',
          answer: 'Take your current body measurements and compare them with the size details on the exact product page. Use our printable measurement worksheet and contact LuxeMia before ordering if the listing is unclear.',
        },
        {
          question: 'Do you offer custom sizing?',
          answer: 'Sizing and tailoring options vary by garment. Review the product page and size selector, use the Size Guide for measurements, and contact LuxeMia before ordering if you need fit help.',
        },
        {
          question: 'What if my measurements don\'t fit standard sizes?',
          answer: 'Choose only from the size or stitching options shown on the selected product page. If your measurements do not match a listed option, contact LuxeMia before ordering to ask what is available.',
        },
        {
          question: 'Can I return items if they don\'t fit?',
          answer: 'No. All sales are final and we do not accept returns or exchanges for sizing issues. Use the measurement worksheet, compare the exact listing and contact us before ordering when sizing information is unclear.',
        },
        {
          question: 'Which measurements should I compare?',
          answer: 'Relevant measurements depend on the garment. Common examples include bust or chest, waist, hips, shoulder, sleeve and garment length. Use the worksheet, then compare only with the exact product listing.',
        },
        {
          question: 'Should I add ease to my measurements?',
          answer: 'Record your actual body measurements without adding or subtracting inches unless the selected product instructions specifically tell you to do so. Body and garment measurements are not the same.',
        },
      ],
    },
    {
      icon: RotateCcw,
      title: 'Returns & Exchanges',
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'All sales are final. For genuine shipping damage, an incorrect item, or a missing item, contact LuxeMia within 48 hours of delivery with clear photos and a continuous unboxing/opening video showing the unopened package, shipping label, and item condition.',
        },
        {
          question: 'Why do I need an unboxing video?',
          answer: 'The continuous unboxing/opening video is required to verify genuine shipping damage, an incorrect item, or a missing item. It must show the unopened package, shipping label, opening process, contents, and item condition.',
        },
        {
          question: 'What items cannot be returned?',
          answer: 'All items are final sale. Covered claims are limited to genuine shipping damage, an incorrect item, or a missing item reported within 48 hours with the required photos and continuous video.',
        },
        {
          question: 'What if my order arrives damaged, incorrect, or incomplete?',
          answer: 'Email hello@luxemia.shop within 48 hours of delivery with your order number, clear photos, and a continuous unboxing/opening video showing the unopened package, shipping label, opening process, contents, and item condition.',
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
          answer: 'Follow the exact care label or supplied instructions because silk names can cover different fibers, dyes, weaves, linings and embellishments. If instructions are missing, ask a qualified cleaner before treatment.',
        },
        {
          question: 'How do I store my lehenga?',
          answer: 'Follow the product label and store the garment clean, completely dry and away from direct light, heat and damp. Support heavy work so the fabric does not stretch, and use clean, colorfast storage materials.',
        },
        {
          question: 'Can I iron my embroidered garments?',
          answer: 'Avoid direct heat on embroidery or embellishment. Follow the care label and test any permitted heat on a hidden area. Ask a qualified cleaner when materials or adhesives are uncertain.',
        },
        {
          question: 'How do I care for jewelry?',
          answer: 'Follow any supplied jewelry care instructions. Keep pieces separated and dry, avoid untested cleaners, and ask a qualified jeweler when the finish, stones or materials are uncertain.',
        },
        {
          question: 'What if my garment has a small stain?',
          answer: 'Follow the care label. Do not rub, heat or apply an untested chemical to a stain. Tell a qualified cleaner what caused it and what treatments have already been attempted.',
        },
        {
          question: 'How often should I dry clean my ethnic wear?',
          answer: 'Clean only as directed by the care label or a qualified cleaner who has inspected the garment. Allow the item to dry fully before storage and keep the instructions with it.',
        },
      ],
    },
    {
      icon: CreditCard,
      title: 'Account & General',
      faqs: [
        {
          question: 'Do I need an account to order?',
          answer: 'No, you can check out as a guest. An account can be used for the account and wishlist features currently shown on the site.',
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Sign In" and then "Forgot Password," enter your email address, and follow the instructions in the reset email.',
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we use industry-standard SSL encryption to protect all data. We never store credit card information on our servers. Read our Privacy Policy for detailed information on how we protect your data.',
        },
        {
          question: 'Do you have a loyalty program?',
          answer: 'LuxeMia does not currently operate a points-based loyalty program. Subscribe to our email list for new-arrival and promotion updates.',
        },
        {
          question: 'Can I save items to buy later?',
          answer: 'Yes! Add items to your Wishlist to save them for later. Create an account to access your wishlist across devices. Note that wishlist items are not reserved and may sell out.',
        },
        {
          question: 'How can I contact customer service?',
          answer: 'Email us at hello@luxemia.shop, call +1-215-341-9990 (Mon-Sat 10AM-7PM EST, Sun 11AM-5PM EST), or use the contact form on our Contact page. Contact details and current support hours are listed below.',
        },
      ],
    },
    {
      icon: Sparkles,
      title: 'Indian Ethnic Wear & Fabric',
      faqs: [
        {
          question: 'What is the difference between Banarasi silk and Kanchipuram silk sarees?',
          answer: 'Banarasi silk sarees originate from Varanasi and are known for their intricate Mughal-inspired motifs, heavy zari work, and brocade weaving. Kanchipuram (Kanjivaram) silk sarees come from Tamil Nadu and feature bold, temple-inspired designs with thick silk and contrast borders. Both are associated with wedding traditions, but the exact fiber, weave and origin claims must be checked on the selected product listing.',
        },
        {
          question: 'What does semi-stitched mean for lehengas and suits?',
          answer: 'Semi-stitched means part of the garment is assembled while final fitting may still be required. Check the exact listing for stitching status and available options; a local tailor may be needed.',
        },
        {
          question: 'How do I choose the right fabric for my Indian wedding outfit?',
          answer: 'Compare the stated fiber, weight, lining, structure and embellishment on the exact listing. Climate, venue and personal comfort matter; our fabric guide explains tradeoffs without assuming every garment has the same composition.',
        },
        {
          question: 'Where can I confirm a product\'s materials and details?',
          answer: 'Product pages state the supplied fabric, embroidery or embellishment work, stitching status, size information and package contents when those details are available. Contact LuxeMia if an important detail is not listed.',
        },
        {
          question: 'What is zardozi embroidery?',
          answer: 'Zardozi refers to raised decorative embroidery often associated with metallic-looking thread and additional embellishment. Materials and technique vary, so use only the work and composition stated on the exact product listing.',
        },
        {
          question: 'Do you sell unstitched fabric or only ready-made outfits?',
          answer: 'The catalog can include readymade, semi-stitched or unstitched items. Check the exact product page for stitching status, included pieces and any tailoring option available for that style.',
        },
      ],
    },
    {
      icon: Truck,
      title: 'Shopping from the United States',
      faqs: [
        {
          question: 'Can I buy Indian ethnic wear online from the USA?',
          answer: 'Yes. LuxeMia specializes in Indian ethnic wear online for customers in the United States. Free US shipping applies at $150 and above, a flat $12 rate applies below $150, and online orders ship with tracking after dispatch.',
        },
        {
          question: 'Will I have to pay taxes on my order in the USA?',
          answer: 'Taxes, if applicable, are calculated at checkout. LuxeMia currently ships from supplier fulfillment to United States addresses only.',
        },
        {
          question: 'Do you ship outside the United States?',
          answer: 'No. LuxeMia currently ships to United States addresses only.',
        },
        {
          question: 'How do Indian clothing sizes compare to US sizes?',
          answer: 'Indian ethnic-wear sizing can differ by product. Measure yourself, compare with the listing and Size Guide, and contact LuxeMia before ordering if you are unsure. Available sizes and tailoring options vary by style.',
        },
        {
          question: 'What if the color looks different in person than on screen?',
          answer: 'Colors can vary with screen settings, lighting and photography. Review all available images and the product description, and contact LuxeMia before ordering if a specific shade is essential.',
        },
        {
          question: 'How long does US delivery take?',
          answer: 'Online orders ship with tracking after dispatch. Carrier transit time begins after dispatch, and tracking is sent by email once the label is created.',
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
                  and include your order number when asking about an existing order.
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
                  <p className="text-xs text-muted-foreground text-center">Include your order number for order support</p>
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
