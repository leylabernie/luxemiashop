import { useState } from 'react';
import { Truck, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import ShopByCategory from '@/components/home/ShopByCategory';
import LookbookTeaser from '@/components/home/LookbookTeaser';
import NewVisitorPopup from '@/components/home/NewVisitorPopup';
import SEOHead from '@/components/seo/SEOHead';
import ServiceHighlights from '@/components/home/ServiceHighlights';
import SustainabilityBanner from '@/components/home/SustainabilityBanner';
import SEOFooterContent from '@/components/seo/SEOFooterContent';
import FlashSaleBanner from '@/components/home/FlashSaleBanner';
import ShopByOccasion from '@/components/home/ShopByOccasion';
import CustomerStories from '@/components/home/CustomerStories';
// FloatingSupport removed — WhatsAppButton renders globally in App.tsx

const homepageFaqs = [
  {
    question: "Do you offer international shipping for Indian ethnic wear?",
    answer: "Yes, LuxeMia offers free worldwide shipping, including to the USA, UK, Canada, and many other countries. You can find more details on our Shipping Policy page."
  },
  {
    question: "What is your return policy for international orders?",
    answer: "We offer a hassle-free 7-day return policy for most items. Standard-sized items can be returned within 7 days of delivery if unworn with tags attached. Custom-sized items are final sale. Please refer to our Returns Policy page for full details."
  },
  {
    question: "Are your products authentic Indian ethnic wear?",
    answer: "Absolutely. At LuxeMia, we are committed to preserving Indian textile heritage. Every piece is sourced directly from master craftsmen across India, ensuring authentic designs and high-quality materials."
  },
  {
    question: "Can I get custom sizing or alterations for my outfit?",
    answer: "We understand the importance of a perfect fit. While many of our items are ready-to-wear, we do offer custom alteration services for select products. Please contact our styling assistance team for more information."
  },
  {
    question: "How can I ensure the color of the outfit is accurate when viewing online?",
    answer: "We strive for accurate color representation in our product photography. However, slight color variations may occur due to screen settings and lighting. We recommend reviewing all available product images and descriptions."
  },
  {
    question: "Do I need to pay customs duties or taxes on international orders?",
    answer: "While LuxeMia offers free shipping, customers are responsible for any customs duties, taxes, or import fees levied by their country of residence. Please check with your local customs office for more information."
  },
  {
    question: "How can I get styling advice for a specific occasion?",
    answer: "Our dedicated styling assistance team is here to help! You can chat with us directly via WhatsApp for personalized recommendations and expert advice."
  },
];

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // LocalBusiness Schema for Local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": "LuxeMia",
    "description": "Premium Indian ethnic wear boutique specializing in handcrafted bridal lehengas, designer sarees, anarkali suits, and wedding collections. Worldwide shipping available.",
    "url": "https://luxemia.shop",
    "logo": "https://luxemia.shop/logo.png",
    "image": "https://luxemia.shop/og/og-lehengas.jpg",
    "telephone": "+1-215-341-9990",
    "email": "hello@luxemia.shop",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1234 Fashion Avenue",
      "addressLocality": "Philadelphia",
      "addressRegion": "PA",
      "postalCode": "19103",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "39.9526",
      "longitude": "-75.1652"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "11:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "$$$",
    "currenciesAccepted": "INR, USD, GBP, CAD",
    "paymentAccepted": "Credit Card, Debit Card, UPI, Net Banking, PayPal",
    "sameAs": [
      "https://www.instagram.com/luxemiashop",
      "https://www.facebook.com/luxemiashop",
      "https://www.youtube.com/@luxemiashop",
      "https://www.pinterest.com/luxemiashop"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "LuxeMia Collections",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Bridal Lehengas"
        },
        {
          "@type": "OfferCatalog",
          "name": "Silk Sarees"
        },
        {
          "@type": "OfferCatalog",
          "name": "Anarkali Suits"
        },
        {
          "@type": "OfferCatalog",
          "name": "Menswear"
        },
        {
          "@type": "OfferCatalog",
          "name": "Indo-Western"
        }
      ]
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="LuxeMia: Luxury Indian Ethnic Wear Online | Shop Bridal Lehengas & Wedding Sarees"
        description="Shop luxury Indian ethnic wear at LuxeMia. Handcrafted bridal lehengas, designer sarees, and anarkali suits with free worldwide shipping to USA, UK & Canada. Authentic craftsmanship for the modern NRI."
        canonical="https://luxemia.shop/"
        faqs={homepageFaqs}
        localBusiness={localBusinessSchema}
      />
      <Header />
      
      <main className="pt-[88px] lg:pt-[130px]">
        <FlashSaleBanner />
        <HeroSection />

        {/* Shipping Info Banner */}
        <div className="bg-foreground text-background py-3">
          <div className="container mx-auto px-4 flex items-center justify-center gap-2 sm:gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Free shipping on orders over $300</span>
            </span>
            <span className="hidden sm:inline text-background/40">·</span>
            <span className="hidden sm:inline text-background/80">$14.95 flat rate per item worldwide</span>
            <span className="hidden sm:inline text-background/40">·</span>
            <Link to="/shipping" className="hidden sm:inline underline underline-offset-2 hover:text-background/80 transition-colors">
              Delivery info
            </Link>
          </div>
        </div>

        <ServiceHighlights />
        <CategoryShowcase />
        <ShopByOccasion />

        {/* Style Quiz CTA */}
        <section className="py-16 lg:py-20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Personalised For You</p>
            <h2 className="text-3xl lg:text-4xl font-serif mb-4">
              Find Your Perfect Look
            </h2>
            <p className="text-muted-foreground font-light mb-8 max-w-xl mx-auto leading-relaxed">
              Not sure where to start? Answer 5 quick questions and we'll create your personal style profile — with outfit recommendations tailored to your occasion, personality, and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/style-quiz"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-foreground text-background hover:bg-foreground/90 transition-colors text-sm font-medium tracking-wide"
              >
                Take the Style Quiz
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
              <p className="text-xs text-muted-foreground">Takes less than 2 minutes · Free · No signup needed</p>
            </div>
          </div>
        </section>

        <ShopByCategory />
        <CustomerStories />
        <SustainabilityBanner />
        <LookbookTeaser />
        {/* FAQ Section */}
        <section className="py-16 lg:py-20 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="text-2xl lg:text-3xl font-serif text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {homepageFaqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg bg-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex items-center justify-between w-full text-left p-5"
                  >
                    <span className="font-medium text-sm pr-4">{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <SEOFooterContent />
      </main>
      
      <Footer />
      <NewVisitorPopup />

    </div>
  );
};

export default Index;
