import { useState } from 'react';
import { ArrowRight, ChevronDown, Heart, Sparkles, Truck } from 'lucide-react';
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
import { FEATURED_CATEGORY_PRODUCTS } from '@/config/featuredCategoryProducts';
// FloatingSupport removed — WhatsAppButton renders globally in App.tsx
// HeroSection removed — was duplicating NewArrivalsBanner (two hero carousels stacked)
// FlashSaleBanner removed — redundant "New Arrivals" bar directly below NewArrivalsBanner

const homepageFaqs = [
  {
    question: "Where does LuxeMia ship Indian ethnic wear?",
    answer: "LuxeMia currently ships to United States addresses only. Standard shipping is $12 below $150 and free at $150 and above."
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
        description="Shop Indian outfits for U.S. celebrations: bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry with tracked shipping."
        canonical="https://luxemia.shop/"
        faqs={homepageFaqs}
      />
      <Header />
      
      <main id="main-content" className="pt-[88px] lg:pt-[124px]">
        <NewArrivalsBanner />

        <section aria-label="LuxeMia shopping promises" className="relative z-10 bg-[#21191a] text-[#fff9f4]">
          <div className="container mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/15 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
            <div className="flex items-center justify-center gap-3 py-4 text-center sm:py-5">
              <Truck className="h-4 w-4 shrink-0 text-[#e7afad]" strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-[0.13em] text-white/85">Tracked U.S. delivery</span>
            </div>
            <div className="flex items-center justify-center gap-3 py-4 text-center sm:py-5">
              <Sparkles className="h-4 w-4 shrink-0 text-[#e7afad]" strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-[0.13em] text-white/85">Pieces for every celebration</span>
            </div>
            <div className="flex items-center justify-center gap-3 py-4 text-center sm:py-5">
              <Heart className="h-4 w-4 shrink-0 text-[#e7afad]" strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-[0.13em] text-white/85">Personal styling support</span>
            </div>
          </div>
        </section>

        <section aria-labelledby="homepage-heading" className="overflow-hidden bg-[#f6f0eb] py-16 sm:py-20 lg:py-28">
          <div className="container mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b37979]">
                <span className="h-px w-9 bg-[#b37979]" />
                The LuxeMia collection
              </p>
              <h1 id="homepage-heading" className="font-serif text-[clamp(2.8rem,6vw,5.7rem)] leading-[0.9] tracking-[-0.035em] text-[#291f20]">
                Indian occasionwear, <em className="font-normal text-[#b37979]">made for the moment.</em>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#665a59] sm:text-lg">
                Discover expressive silhouettes for weddings, festivals, evening celebrations and every entrance worth remembering.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  to="/sarees"
                  className="group inline-flex items-center gap-3 bg-[#291f20] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#fff9f4] transition-colors duration-300 hover:bg-[#b37979]"
                >
                  Shop sarees <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link to="/lehengas" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4a3738] underline decoration-[#c89b9b] decoration-1 underline-offset-8 transition-colors hover:text-[#b37979]">
                  Explore lehengas
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto lg:max-w-none">
              <div className="absolute -left-5 -top-5 h-full w-full border border-[#d8b1ae] sm:-left-7 sm:-top-7" aria-hidden="true" />
              <picture className="relative block aspect-[4/5] overflow-hidden bg-[#dfd3cb] shadow-[18px_24px_0_rgba(41,31,32,0.07)]">
                <source srcSet={FEATURED_CATEGORY_PRODUCTS.sarees.imageWebp} type="image/webp" />
                <img
                  src={FEATURED_CATEGORY_PRODUCTS.sarees.image}
                  alt={FEATURED_CATEGORY_PRODUCTS.sarees.alt}
                  width={680}
                  height={850}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              </picture>
              <div className="absolute -bottom-4 -left-3 bg-[#fff9f4] px-5 py-4 shadow-lg sm:-bottom-6 sm:-left-8 sm:px-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b37979]">The saree edit</p>
                <p className="mt-1 font-serif text-xl text-[#291f20]">Drapes with a story</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="customizable-home-heading" className="bg-[#291f20] text-[#fff9f4]">
          <div className="container mx-auto grid max-w-7xl overflow-hidden lg:grid-cols-2">
            <div className="relative min-h-[360px] overflow-hidden lg:order-2 lg:min-h-[480px]">
              <picture>
                <source srcSet={FEATURED_CATEGORY_PRODUCTS.lehengas.imageWebp} type="image/webp" />
                <img
                  src={FEATURED_CATEGORY_PRODUCTS.lehengas.image}
                  alt={FEATURED_CATEGORY_PRODUCTS.lehengas.alt}
                  width={760}
                  height={960}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-90"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-[#21191a]/65 via-transparent to-transparent" />
            </div>
            <div className="flex items-center px-6 py-14 sm:px-12 lg:order-1 lg:px-16 lg:py-20">
              <div className="max-w-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e7afad]">Made to your moment</p>
                <h2 id="customizable-home-heading" className="mt-5 font-serif text-4xl leading-[0.95] sm:text-5xl">A look that feels entirely yours.</h2>
                <p className="mt-6 text-sm leading-7 text-white/70 sm:text-base">
                  Explore selected designs available for custom color and made-to-measure tailoring. We confirm the details with you before production begins.
                </p>
                <Link
                  to="/collections/customizable-indian-outfits"
                  className="group mt-8 inline-flex items-center gap-3 border border-[#e7afad] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#fff9f4] transition-colors duration-300 hover:bg-[#e7afad] hover:text-[#291f20]"
                >
                  Discover custom options <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

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
