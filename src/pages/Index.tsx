import { canPromoteCollection } from '@/lib/collectionPromotion';
import { lazy, Suspense, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import SEOFooterContent from '@/components/seo/SEOFooterContent';
import HomepageIntro from '@/components/home/HomepageIntro';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import LazySection from '@/components/ui/LazySection';
import {
  useLatestHomepageImagery,
  type PromoSlotId,
} from '@/hooks/useLatestHomepageImagery';
import { HOMEPAGE_VALUE_PROPOSITION } from '@/lib/homepageValueProposition';
import { getIndexableRouteSeo } from '@/config/seoArchitecture';

const NewArrivals = lazy(() =>
  import('@/components/home/NewArrivals').then(({ NewArrivals }) => ({ default: NewArrivals })),
);
const ShopByOccasion = lazy(() => import('@/components/home/ShopByOccasion'));
const CustomerStories = lazy(() => import('@/components/home/CustomerStories'));

const homepageFaqs = [
  {
    question: 'Where does LuxeMia ship Indian ethnic wear?',
    answer:
      'LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. U.S. standard shipping is $14.99 below $150 and free at $150+. Canada and the UK are $24.99 below $299 and free at $299+. Australia and New Zealand are $29.99 below $349 and free at $349+. South Africa is $49.99 and Mauritius is $59.99 per order.',
  },
  {
    question: 'Why shop wedding guest outfits at LuxeMia?',
    answer: HOMEPAGE_VALUE_PROPOSITION,
  },
  {
    question: "Where can I confirm a product's materials and details?",
    answer:
      'Product pages state the available fabric, embroidery or embellishment work, stitching status, sizes, and package contents when those details are supplied. Contact LuxeMia before ordering if an important detail is not listed.',
  },
  {
    question: 'Can I get custom sizing or alterations for my outfit?',
    answer:
      'Sizing, stitching, and made-to-measure options vary by product. Use only the options shown on the selected product page, and contact LuxeMia before ordering if a size or stitching detail is unclear.',
  },
  {
    question: 'How can I ensure the color of the outfit is accurate when viewing online?',
    answer:
      'We strive for accurate color representation in our product photography. However, slight color variations may occur due to screen settings and lighting. We recommend reviewing all available product images and descriptions.',
  },
  {
    question: 'How much is U.S. shipping?',
    answer:
      'U.S. standard shipping is $14.99 below $150 and free at $150 and above after discounts. Other countries use route-based rates shown on the Shipping page.',
  },
  {
    question: 'How can I get styling advice for a specific occasion?',
    answer:
      'Contact LuxeMia by WhatsApp with your occasion, date, preferred color, size, and budget. We can help you compare current listings, but the exact product page controls availability, included pieces, sizing, and stitching options.',
  },
];

const PROMO_BANNERS: readonly {
  slot: PromoSlotId;
  eyebrow: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
  fallbackImage: string;
  fallbackAlt: string;
}[] = [
  {
    slot: 'ready-to-ship',
    eyebrow: 'Fast Tracked Dispatch',
    title: 'Ready to Ship',
    copy: 'Ready-stock orders dispatch within 3–4 business days. Optional stitching and made-to-measure selections take additional processing time.',
    href: '/ready-to-ship',
    cta: 'Shop Ready to Ship',
    fallbackImage:
      'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/multicolor-crepe-saree-with-geometric-and-medallion-motifs-original-1.jpg?v=1793034479&width=960',
    fallbackAlt: 'Multicolor Crepe Saree with Geometric and Medallion Motifs',
  },
  {
    slot: 'bridal-party',
    eyebrow: 'Tailoring & Coordinated Sets',
    title: 'Bridal Party & Custom Fit',
    copy: 'Coordinate bridesmaids, family, and wedding party outfits, or review size and stitching guidance before ordering.',
    href: '/wedding-party-orders',
    cta: 'Plan Group & Fit Orders',
    fallbackImage: '/images/bridal-vol3/luxemia-bv3-172-magenta-palace-1.webp',
    fallbackAlt:
      'Rani Magenta Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta',
  },
];

const SHOPPING_GUIDES = [
  {
    label: 'Shopping in the USA?',
    detail: 'Free U.S. standard shipping at $150+ and no doorstep tariff collection.',
    href: '/indian-ethnic-wear-usa',
    cta: 'Explore USA Shopping',
  },
  {
    label: 'Sizing & Fit Guidance',
    detail: 'Check garment-specific sizes, blouse stitching, and measurement handoff steps.',
    href: '/sizing-measurements-guide',
    cta: 'Open Sizing Guide',
  },
] as const;

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const latestImagery = useLatestHomepageImagery();
  const homepageSeo = getIndexableRouteSeo('/');

  return (
    <div className="min-h-screen bg-[#fcf8f4]">
      <SEOHead
        title={homepageSeo.title}
        description={homepageSeo.description}
        canonical="https://luxemia.shop/"
        faqs={homepageFaqs}
      />
      <Header />

      <main id="main-content" className="pt-[88px] lg:pt-[124px]">
        {/* 1. Sliding Hero Banners + Single Promise Bar */}
        <HomepageIntro />

        {/* 2. Shop by Category — shown once */}
        <CategoryShowcase />

        {/* 3. New Arrivals — shown once (no duplicate category bar) */}
        <LazySection rootMargin="250px" placeholderHeight={460}>
          <Suspense fallback={null}>
            <NewArrivals />
          </Suspense>
        </LazySection>

        {/* 4. Utsav-style 2-up Editorial Promo Banners + Shopping Guides */}
        <section aria-labelledby="shop-by-need-heading" className="border-b border-[#eaded6] bg-[#fcf8f4] py-12 lg:py-16">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-7 sm:mb-9">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-link">
                Featured Edits
              </p>
              <h2 id="shop-by-need-heading" className="mt-1 font-serif text-2xl text-[#291f20] sm:text-3xl lg:text-4xl">
                Shop by Timeline &amp; Fit
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
              {PROMO_BANNERS.filter((banner) => canPromoteCollection(banner.href)).map((banner) => {
                const livePromo = latestImagery.promos[banner.slot];
                const promoSrc = livePromo?.webpUrl || livePromo?.url || banner.fallbackImage;
                const promoAlt = livePromo?.alt || banner.fallbackAlt;
                return (
                <Link
                  key={banner.href}
                  to={banner.href}
                  className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-sm border border-[#e3d2c8] bg-[#2f1f23] shadow-sm sm:min-h-[390px]"
                >
                  <img
                    src={promoSrc}
                    alt={promoAlt}
                    width={720}
                    height={900}
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                    style={{ position: 'absolute', inset: 0 }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#1c1013]/92 via-[#1c1013]/50 to-transparent transition-opacity duration-300 group-hover:opacity-95"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 p-6 text-[#fff9f4] [text-shadow:0_1px_10px_rgba(20,10,12,0.5)] sm:p-8">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f2c6b6] sm:text-[11px]">
                      {banner.eyebrow}
                    </p>
                    <h3 className="mt-1.5 font-serif text-2xl sm:text-3xl">{banner.title}</h3>
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-[#fff9f4]/85 sm:text-sm">
                      {banner.copy}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff9f4] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#2f1f23] transition-colors group-hover:bg-[#f2dbd4]">
                      {banner.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
                );
              })}
            </div>

            {canPromoteCollection('/collections/customizable-indian-outfits') && (
              <div className="mt-5 rounded-sm border border-[#e3d2c8] bg-white px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <p className="text-sm text-[#4a3738]">
                  Looking for designs with stated alteration options? Confirm measurements and timing with LuxeMia before ordering.
                </p>
                <Link
                  to="/collections/customizable-indian-outfits"
                  className="mt-2 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-link underline underline-offset-4 sm:mt-0"
                >
                  View Custom Options <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:gap-6">
              {SHOPPING_GUIDES.filter((guide) => canPromoteCollection(guide.href)).map((guide) => (
                <Link
                  key={guide.href}
                  to={guide.href}
                  className="group flex flex-col justify-between gap-3 rounded-sm border border-[#e6d7cf] bg-white p-5 transition-colors hover:border-[#3b2a2d] sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-serif text-lg text-[#291f20]">{guide.label}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#6e605e] sm:text-sm">{guide.detail}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-link underline underline-offset-4">
                    {guide.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Shop by Occasion */}
        <LazySection rootMargin="250px" placeholderHeight={280}>
          <Suspense fallback={null}>
            <ShopByOccasion />
          </Suspense>
        </LazySection>

        {/* 6. Personal Styling Quiz Banner */}
        <section className="border-b border-[#dfc1bb] bg-[radial-gradient(circle_at_10%_75%,rgba(220,170,159,0.32),transparent_25%),radial-gradient(circle_at_90%_20%,rgba(232,206,171,0.42),transparent_26%),#f7e9e3] py-12 lg:py-16">
          <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 text-center lg:flex-row lg:px-8 lg:text-left">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-link">
                Personal Styling Finder
              </p>
              <h2 className="mt-1.5 font-serif text-2xl text-[#291f20] sm:text-3xl">
                Find the look that feels like you
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#665a59]">
                Answer five quick questions to narrow down outfits for your celebration, style preference, and budget.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 lg:items-end">
              <Link
                to="/style-quiz"
                className="group inline-flex items-center gap-2 rounded-full bg-[#3b2a2d] px-7 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#fff9f4] transition-colors hover:bg-[#7a2837]"
              >
                Take the Style Quiz
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <p className="text-xs text-[#6e605e]">Under 2 minutes · Free · No signup needed</p>
            </div>
          </div>
        </section>

        {/* 7. Why Shop With LuxeMia */}
        <LazySection rootMargin="300px" placeholderHeight={320}>
          <Suspense fallback={null}>
            <CustomerStories />
          </Suspense>
        </LazySection>

        {/* 8. FAQ Section — answers remain mounted (hidden) for FAQPage schema parity */}
        <section className="bg-secondary/30 py-14 lg:py-18">
          <div className="container mx-auto max-w-3xl px-4 lg:px-8">
            <h2 className="mb-8 text-center font-serif text-2xl lg:text-3xl">Frequently Asked Questions</h2>
            <div className="space-y-3.5">
              {homepageFaqs.map((faq, index) => (
                <div key={index} className="overflow-hidden rounded-lg border border-border bg-card">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="pr-4 text-sm font-medium">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div hidden={openFaq !== index} className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SEOFooterContent />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
