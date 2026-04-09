import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
import FloatingSupport from '@/components/support/FloatingSupport';

const homepageFaqs = [
  {
    question: "Do you ship to the USA?",
    answer: "Yes, we offer free shipping to the USA on orders over $99. Standard delivery takes 7-12 business days. Express shipping (3-5 business days) is also available at checkout."
  },
  {
    question: "Can I get custom sizing?",
    answer: "Yes, we offer custom sizing on all outfits. Simply provide your bust, waist, hip, and height measurements during checkout, and our expert tailors will create a perfect fit."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and with tags intact. Custom/stitched items are non-returnable. Contact us via WhatsApp or email to initiate a return."
  },
  {
    question: "How long does delivery take?",
    answer: "International orders typically take 7-14 business days depending on the destination. USA and UK orders arrive in 7-12 business days. Express shipping is available for faster delivery."
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
    "url": "https://luxemia.com",
    "logo": "https://luxemia.com/logo.png",
    "image": "https://luxemia.com/og/og-lehengas.jpg",
    "telephone": "+91-9876543210",
    "email": "hello@luxemia.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Fashion Street, Chandni Chowk",
      "addressLocality": "New Delhi",
      "addressRegion": "Delhi",
      "postalCode": "110006",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "28.6559",
      "longitude": "77.2303"
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
    "priceRange": "₹₹₹",
    "currenciesAccepted": "INR, USD",
    "paymentAccepted": "Credit Card, Debit Card, UPI, Net Banking",
    "sameAs": [
      "https://www.instagram.com/luxemia",
      "https://www.facebook.com/luxemia",
      "https://www.youtube.com/@luxemia",
      "https://www.pinterest.com/luxemia"
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
        }
      ]
    },
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LuxeMia",
    "alternateName": "LuxeMia Fashion",
    "url": "https://luxemia.com",
    "logo": "https://luxemia.com/logo.png",
    "description": "India's premier destination for luxury ethnic wear, featuring handcrafted bridal lehengas, designer sarees, and wedding collections.",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-9876543210",
        "contactType": "customer service",
        "areaServed": "Worldwide",
        "availableLanguage": ["English", "Hindi"]
      },
      {
        "@type": "ContactPoint",
        "telephone": "+91-9876543211",
        "contactType": "sales",
        "areaServed": "Worldwide"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/luxemia",
      "https://www.facebook.com/luxemia",
      "https://www.youtube.com/@luxemia"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="LuxeMia — Luxury Indian Ethnic Wear | Designer Sarees, Lehengas & Suits"
        description="Shop luxury Indian ethnic wear at LuxeMia. Designer lehengas, silk sarees, salwar suits. Free shipping to USA & UK on orders over $99."
        canonical="https://luxemia.shop/"
        faqs={homepageFaqs}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>
      <Header />
      
      <main className="pt-[104px] lg:pt-[120px]">
        <HeroSection />

        {/* Shipping Info Banner */}
        <div className="bg-foreground text-background py-3">
          <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-sm">
            <Truck className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">FREE SHIPPING to USA & UK on orders over $99</span>
            <span className="hidden sm:inline text-background/70">|</span>
            <Link to="/shipping" className="hidden sm:inline underline underline-offset-2 hover:text-background/80 transition-colors">
              7-12 day delivery
            </Link>
          </div>
        </div>

        <ServiceHighlights />
        <CategoryShowcase />
        <ShopByCategory />
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
      <FloatingSupport />
    </div>
  );
};

export default Index;
