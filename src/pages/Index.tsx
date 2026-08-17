import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import ShopByCategory from '@/components/home/ShopByCategory';
import LookbookTeaser from '@/components/home/LookbookTeaser';
import SEOHead from '@/components/seo/SEOHead';
import ServiceHighlights from '@/components/home/ServiceHighlights';
import SustainabilityBanner from '@/components/home/SustainabilityBanner';
import SEOFooterContent from '@/components/seo/SEOFooterContent';
import NewArrivalsBanner from '@/components/home/NewArrivalsBanner';
import { NewArrivals } from '@/components/home/NewArrivals';
import ShopByOccasion from '@/components/home/ShopByOccasion';
import CustomerStories from '@/components/home/CustomerStories';
import LazySection from '@/components/ui/LazySection';
import CeremonyVerseLinkBlock from '@/components/CeremonyVerseLinkBlock';
import { RETURN_POLICY_FAQ_ANSWER } from '@/lib/returnPolicyCopy';
// FloatingSupport removed — WhatsAppButton renders globally in App.tsx
// HeroSection removed — was duplicating NewArrivalsBanner (two hero carousels stacked)
// FlashSaleBanner removed — redundant "New Arrivals" bar directly below NewArrivalsBanner

const homepageFaqs = [
  {
    question: "Where does LuxeMia ship Indian ethnic wear?",
    answer: "LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. U.S. standard shipping is $12 below $150 and free at $150 and above; international rates are shown at checkout."
  },
  {
    question: "What is your return policy?",
    answer: RETURN_POLICY_FAQ_ANSWER
  },
  {
    question: "Where can I confirm a product's materials and details?",
    answer: "Product pages state the available fabric, embroidery or embellishment work, stitching status, sizes, and package contents when those details are supplied. Contact LuxeMia before ordering if an important detail is not listed."
  },
  {
    question: "Can I get custom sizing or alterations for my outfit?",
    answer: "Sizing, stitching, and made-to-measure options vary by product. Use only the options shown on the selected product page, and contact LuxeMia before ordering if a size or stitching detail is unclear."
  },
  {
    question: "How can I ensure the color of the outfit is accurate when viewing online?",
    answer: "We strive for accurate color representation in our product photography. However, slight color variations may occur due to screen settings and lighting. We recommend reviewing all available product images and descriptions."
  },
  {
    question: "How much is US shipping?",
    answer: "US shipping is free at $150 and above. Orders below $150 ship for a flat $12. Taxes, if applicable, are calculated at checkout."
  },
  {
    question: "How can I get styling advice for a specific occasion?",
    answer: "Contact LuxeMia by WhatsApp with your occasion, date, preferred color, size, and budget. We can help you compare current listings, but the exact product page controls availability, included pieces, sizing, and stitching options."
  },
];

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Indian Ethnic Wear Online USA | Tracked Shipping | LuxeMia"
        description="Shop premium Indian ethnic wear online in the USA: bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry with tracked U.S. shipping."
        canonical="https://luxemia.shop/"
        faqs={homepageFaqs}
      />
      <Header />
      
      <main id="main-content" className="pt-[88px] lg:pt-[124px]">
        <section
          aria-labelledby="homepage-heading"
          className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-background to-primary/5"
        >
          <div className="container mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-9">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Premium Indian occasionwear for the United States
              </p>
              <h1 id="homepage-heading" className="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
                Premium Indian Ethnic Wear with Tracked U.S. Shipping
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Shop bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry for U.S. delivery.
                Browse Indian wedding guest outfits with tracked shipping across the United States.
              </p>
            </div>
            <aside aria-label="United States shipping summary" className="shrink-0 border-l-2 border-primary pl-4">
              <p className="font-medium">Free U.S. shipping at $150+</p>
              <p className="mt-1 text-sm text-muted-foreground">$12 flat below $150 · Tracking emailed after dispatch</p>
              <p className="mt-1 text-sm text-muted-foreground">International shipping to six additional countries</p>
              <Link
                to="/shipping"
                className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                View delivery details
              </Link>
            </aside>
          </div>
        </section>

        <section className="border-b border-border/30 bg-background" aria-labelledby="customizable-home-heading">
          <div className="container mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Verified made-to-order selection</p>
              <h2 id="customizable-home-heading" className="mt-2 font-serif text-2xl sm:text-3xl">Customizable Indian Outfits</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Browse selected designs verified for a custom color and tailoring from confirmed measurements. Use approximately 4–5 weeks as a total planning window; production time and carrier transit are confirmed separately before ordering.
              </p>
            </div>
            <Link
              to="/collections/customizable-indian-outfits"
              className="inline-flex shrink-0 items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Shop customizable outfits
            </Link>
          </div>
        </section>

        <NewArrivalsBanner />

        {/* PSI 2026-07-22: Sections wrapped in LazySection (IntersectionObserver)
            to defer JS execution for below-fold content. These components import
            framer-motion + lucide-react. Deferring removes their animation setup
            from the critical render path. */}
        <LazySection rootMargin="200px" placeholderHeight={500}>
          <NewArrivals />
        </LazySection>
        <LazySection rootMargin="200px" placeholderHeight={300}>
          <ServiceHighlights />
        </LazySection>
        <LazySection rootMargin="200px" placeholderHeight={500}>
          <CategoryShowcase />
        </LazySection>

        {/* PSI 2026-07-22: Below-fold sections wrapped in LazySection (IntersectionObserver).
            These components import framer-motion + lucide-react (~60KB gzip combined).
            Deferring them until they enter the viewport removes this JS from the
            initial render path, improving bootup-time by ~1s and unused-javascript. */}
        <LazySection rootMargin="300px" placeholderHeight={400}>
          <ShopByOccasion />
        </LazySection>

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

        <LazySection rootMargin="300px" placeholderHeight={600}>
          <ShopByCategory />
        </LazySection>
        <LazySection rootMargin="300px" placeholderHeight={350}>
          <CustomerStories />
        </LazySection>
        <LazySection rootMargin="300px" placeholderHeight={400}>
          <SustainabilityBanner />
        </LazySection>
        <LazySection rootMargin="300px" placeholderHeight={400}>
          <LookbookTeaser />
        </LazySection>
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

        <CeremonyVerseLinkBlock />
        <SEOFooterContent />
      </main>

      <Footer />
      {/* NewVisitorPopup moved to App.tsx so it shows on ALL pages, not just homepage */}

    </div>
  );
};

export default Index;
