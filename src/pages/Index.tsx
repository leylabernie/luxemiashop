import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import ShopByCategory from '@/components/home/ShopByCategory';
import LookbookTeaser from '@/components/home/LookbookTeaser';
import NewVisitorPopup from '@/components/home/NewVisitorPopup';
import SEOHead from '@/components/seo/SEOHead';
import ServiceHighlights from '@/components/home/ServiceHighlights';
import CustomerStories from '@/components/home/CustomerStories';
import SustainabilityBanner from '@/components/home/SustainabilityBanner';
import SEOFooterContent from '@/components/seo/SEOFooterContent';

const Index = () => {
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
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "11:00",
        "closes": "18:00"
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
          "name": "Bridal Lehengas",
          "itemListElement": {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Designer Bridal Lehengas"
            }
          }
        },
        {
          "@type": "OfferCatalog",
          "name": "Silk Sarees",
          "itemListElement": {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Handwoven Silk Sarees"
            }
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2847",
      "bestRating": "5"
    }
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
    "foundingDate": "2015",
    "founders": [
      {
        "@type": "Person",
        "name": "Priya Sharma"
      }
    ],
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
        title="LuxeMia | Luxury Indian Ethnic Wear - Sarees, Lehengas & Bridal Couture"
        description="Discover exquisite handcrafted Indian ethnic wear at LuxeMia. Shop designer sarees, bridal lehengas, anarkali suits, and wedding collections. Worldwide shipping. Premium quality assured."
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
        <ServiceHighlights />
        <CategoryShowcase />
        <ShopByCategory />
        <CustomerStories />
        <SustainabilityBanner />
        <LookbookTeaser />
        <SEOFooterContent />
      </main>
      
      <Footer />
      <NewVisitorPopup />
    </div>
  );
};

export default Index;
