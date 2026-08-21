import {
  type FocusEvent,
  type KeyboardEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  isRakshaBandhanCampaignActive,
  RAKSHA_BANDHAN_CAMPAIGN,
} from '@/config/rakshaBandhanCampaign';

interface FeaturedSlide {
  id: number;
  eyebrow: string;
  headline: string;
  subline: string;
  cta: string;
  link: string;
  image: string;
  desktopImage?: string;
  alt: string;
  width: number;
  height: number;
  imageFit?: 'cover' | 'contain';
  mobileContentPosition?: 'top' | 'bottom';
}

const evergreenSlides: FeaturedSlide[] = [
  {
    id: 1,
    eyebrow: 'The LuxeMia Boutique Edit',
    headline: 'Graceful moments, beautifully dressed.',
    subline:
      'Discover lovingly curated Indian occasionwear for the celebrations, traditions, and entrances that become part of your story.',
    cta: 'Explore New Arrivals',
    link: '/new-arrivals',
    image: '/images/campaigns/new-indian-ethnic-wear-2026-mobile',
    desktopImage: '/images/campaigns/new-indian-ethnic-wear-2026-desktop',
    alt: 'Woman in a blush pink embroidered Indian occasionwear set in a garden setting',
    width: 1600,
    height: 900,
    imageFit: 'cover',
  },
  {
    id: 2,
    eyebrow: 'Navratri 2026',
    headline: 'Navratri & Garba Outfits for U.S. Celebrations',
    subline:
      'Shop current chaniya choli, lehenga and festive styles for Garba and Dandiya. Use LUXE10 for 10% off your first order.',
    cta: 'Shop Navratri Outfits',
    link: '/collections/navratri-outfits',
    image: '/images/hero-carousel/navratri-lehenga',
    desktopImage: '/images/hero-carousel/navratri-lehenga-desktop',
    alt: 'Woman wearing a bright pink lehenga suitable for a Navratri celebration',
    width: 1672,
    height: 941,
    imageFit: 'cover',
  },
  {
    id: 3,
    eyebrow: 'Wedding Lehengas',
    headline: 'Bridal Lehengas for U.S. Celebrations',
    subline: 'Embroidered lehenga choli sets for weddings, receptions and milestone events.',
    cta: 'Shop Wedding Lehengas',
    link: '/lehengas',
    image: '/images/campaigns/wedding-lehengas-usa-2026-mobile',
    desktopImage: '/images/campaigns/wedding-lehengas-usa-2026-desktop',
    alt: 'Bride wearing a red embroidered lehenga choli with matching dupatta and traditional jewelry',
    width: 900,
    height: 1206,
  },
  {
    id: 4,
    eyebrow: 'Sharara & Palazzo Sets',
    headline: 'Indian Occasion Sets, Ready to Style',
    subline:
      'Sharara and palazzo sets with coordinated dupattas for weddings, parties and festive events.',
    cta: 'Shop Salwar Kameez',
    link: '/suits',
    image: '/images/campaigns/sharara-palazzo-sets-2026-mobile',
    desktopImage: '/images/campaigns/sharara-palazzo-sets-2026-desktop',
    alt: 'Woman wearing a sage and navy embroidered Indian occasion-wear set with matching dupatta',
    width: 735,
    height: 936,
  },
];

const launchOfferSlide: FeaturedSlide = {
  ...evergreenSlides[2],
  eyebrow: '72-Hour Offer',
  headline: `${RAKSHA_BANDHAN_CAMPAIGN.discountPercent}% Off $${RAKSHA_BANDHAN_CAMPAIGN.minimumSubtotal}+`,
  subline: `Use code ${RAKSHA_BANDHAN_CAMPAIGN.code} through ${RAKSHA_BANDHAN_CAMPAIGN.displayEndDate}. Explore wedding-guest and celebration styles, then review each listing for timing and available options.`,
  cta: 'Shop Wedding-Guest Styles',
  link: '/collections/wedding-guest-outfits',
  image: '/images/campaigns/wedding-lehengas-usa-2026-mobile',
  desktopImage: '/images/campaigns/wedding-lehengas-usa-2026-desktop',
  alt: 'Woman wearing a red embroidered lehenga choli with matching dupatta and traditional jewelry',
  width: 900,
  height: 1206,
};

const AUTO_PLAY_MS = 6000;
const padSlideNumber = (value: number) => String(value).padStart(2, '0');

const NewArrivalsBanner = () => {
  const slides = isRakshaBandhanCampaignActive()
    ? [launchOfferSlide, ...evergreenSlides.slice(1)]
    : evergreenSlides;
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartX = useRef(0);
  const isPaused = isHovered || isFocusWithin;
  const autoplayRunning = !isPaused && !prefersReducedMotion;

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const timer = window.setTimeout(next, AUTO_PLAY_MS);
    return () => window.clearTimeout(timer);
  }, [index, isPaused, next, prefersReducedMotion]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) <= 40) return;
    if (distance < 0) next();
    else prev();
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusWithin(false);
    }
  };

  return (
    <section
      data-home-hero
      aria-label="LuxeMia featured collections"
      aria-roledescription="carousel"
      className="relative h-[620px] min-h-[620px] w-full overflow-hidden bg-[#0f0d0b] text-[#faf7f0] outline-none sm:h-[min(78vh,720px)] sm:min-h-[520px]"
      style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
      tabIndex={0}
      onBlur={handleBlur}
      onFocus={() => setIsFocusWithin(true)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      <div className="absolute inset-0">
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === index;
          const preservesFullImage = Boolean(slide.desktopImage && slide.imageFit !== 'cover');

          return (
            <div
              key={slide.id}
              data-hero-slide
              aria-hidden={!isActive}
              aria-label={`${slideIndex + 1} of ${slides.length}`}
              aria-roledescription="slide"
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
              }`}
              role="group"
              style={{ zIndex: isActive ? 1 : 0 }}
            >
              {preservesFullImage && (
                <picture aria-hidden="true" className="absolute inset-0 block overflow-hidden">
                  <source
                    media="(min-width: 640px)"
                    srcSet={`${slide.desktopImage}.webp`}
                    type="image/webp"
                  />
                  <source
                    media="(min-width: 640px)"
                    srcSet={`${slide.desktopImage}.jpg`}
                    type="image/jpeg"
                  />
                  <source srcSet={`${slide.image}.webp`} type="image/webp" />
                  <img
                    src={`${slide.image}.jpg`}
                    alt=""
                    width={slide.width}
                    height={slide.height}
                    decoding="async"
                    loading={slideIndex === 0 ? 'eager' : 'lazy'}
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
                  />
                </picture>
              )}

              <picture className="absolute inset-0 block overflow-hidden">
                {slide.desktopImage && (
                  <source
                    media="(min-width: 640px)"
                    srcSet={`${slide.desktopImage}.webp`}
                    type="image/webp"
                  />
                )}
                {slide.desktopImage && (
                  <source
                    media="(min-width: 640px)"
                    srcSet={`${slide.desktopImage}.jpg`}
                    type="image/jpeg"
                  />
                )}
                <source srcSet={`${slide.image}.webp`} type="image/webp" />
                <img
                  data-hero-image
                  src={`${slide.image}.jpg`}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  decoding="async"
                  loading={slideIndex === 0 ? 'eager' : 'lazy'}
                  fetchPriority={slideIndex === 0 ? 'high' : 'auto'}
                  className={`absolute inset-0 h-full w-full transition-transform ease-out ${
                    slide.imageFit === 'cover'
                      ? 'object-cover object-center'
                      : preservesFullImage
                        ? 'object-contain object-top sm:object-center'
                        : 'object-cover object-[center_15%] sm:object-[center_20%]'
                  }`}
                  style={{
                    transform: isActive ? 'scale(1)' : 'scale(1.08)',
                    transitionDuration: '8000ms',
                  }}
                />
              </picture>

              <div
                className="absolute inset-0 sm:hidden"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(20,16,14,0.35) 0%, rgba(20,16,14,0.5) 45%, rgba(20,16,14,0.92) 100%)',
                }}
              />
              <div
                className="absolute inset-0 hidden sm:block"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(20,16,14,0.85) 0%, rgba(20,16,14,0.55) 45%, rgba(20,16,14,0.15) 75%, rgba(20,16,14,0.35) 100%), linear-gradient(180deg, rgba(20,16,14,0.25) 0%, rgba(20,16,14,0) 30%, rgba(20,16,14,0) 65%, rgba(20,16,14,0.6) 100%)',
                }}
              />

              <div
                className={`relative z-10 flex h-full px-6 sm:items-center sm:px-[6vw] sm:pb-0 sm:pt-0 ${
                  slide.mobileContentPosition === 'top'
                    ? 'items-start pb-0 pt-[112px]'
                    : 'items-end pb-[130px] pt-0'
                }`}
              >
                <div
                  data-hero-content
                  className={`max-w-[560px] transition-all delay-300 duration-700 ease-out ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                  }`}
                >
                  <p
                    className="mb-[22px] inline-flex items-center gap-2.5 text-[15px] font-medium italic uppercase tracking-[0.14em] text-[#d4b078]"
                    style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-8 bg-gradient-to-r from-transparent to-[#d4b078]"
                    />
                    {slide.eyebrow}
                  </p>

                  <h2
                    className="mb-[18px] text-[34px] font-normal leading-[1.02] tracking-[-0.01em] text-[#faf7f0] sm:text-[clamp(38px,5.5vw,68px)]"
                    style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
                  >
                    {slide.headline}
                  </h2>

                  <p className="mb-[34px] max-w-[460px] text-[15px] font-light leading-[1.55] text-[#f5f0e6]/80 sm:text-[clamp(15px,1.15vw,17px)]">
                    {slide.subline}
                  </p>

                  <Link
                    to={slide.link}
                    tabIndex={isActive ? 0 : -1}
                    className="group inline-flex min-h-11 items-center gap-3 border border-transparent bg-[#faf7f0] px-7 py-[15px] text-sm font-semibold uppercase tracking-[0.06em] text-[#1a1a1a] transition-colors duration-300 hover:bg-[#b8935a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4b078]"
                  >
                    <span>{slide.cta}</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 justify-between px-[clamp(12px,2vw,28px)] sm:flex">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={prev}
          className="pointer-events-auto grid h-[52px] w-[52px] place-items-center rounded-full border border-[#f5f0e6]/25 bg-[#14100e]/35 text-[#faf7f0] backdrop-blur-xl transition-colors duration-300 hover:border-[#faf7f0] hover:bg-[#faf7f0] hover:text-[#1a1a1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4b078]"
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={next}
          className="pointer-events-auto grid h-[52px] w-[52px] place-items-center rounded-full border border-[#f5f0e6]/25 bg-[#14100e]/35 text-[#faf7f0] backdrop-blur-xl transition-colors duration-300 hover:border-[#faf7f0] hover:bg-[#faf7f0] hover:text-[#1a1a1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4b078]"
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col-reverse items-center gap-6 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-[6vw] sm:pb-8">
        <div
          aria-hidden="true"
          className="pointer-events-auto hidden items-center gap-3.5 sm:flex"
          style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
        >
          <span className="min-w-8 text-[28px] tracking-[0.06em] text-[#d4b078]">
            {padSlideNumber(index + 1)}
          </span>
          <div className="relative h-px w-[140px] overflow-hidden bg-[#f5f0e6]/20">
            <div
              key={`${index}-${autoplayRunning}`}
              data-hero-progress
              className="absolute inset-0 bg-[#d4b078]"
              style={{
                animation: autoplayRunning
                  ? `heroCarouselProgress ${AUTO_PLAY_MS}ms linear forwards`
                  : 'none',
                transform: autoplayRunning ? undefined : 'translateX(-100%)',
              }}
            />
          </div>
          <span className="text-[15px] text-[#f5f0e6]/55">/ {padSlideNumber(slides.length)}</span>
        </div>

        <div
          className="pointer-events-auto flex items-center gap-0 sm:gap-2"
          aria-label="Choose a featured collection"
          role="group"
        >
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${slideIndex + 1}`}
              aria-current={slideIndex === index ? 'true' : undefined}
              onClick={() => setIndex(slideIndex)}
              className="group grid h-11 w-11 place-items-center p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4b078] sm:h-6 sm:w-auto"
            >
              <span
                className={`block h-0.5 transition-all duration-300 ${
                  slideIndex === index
                    ? 'w-11 bg-[#d4b078]'
                    : 'w-7 bg-[#f5f0e6]/30 group-hover:bg-[#f5f0e6]/60'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heroCarouselProgress {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-home-hero] [data-hero-slide],
          [data-home-hero] [data-hero-content],
          [data-home-hero] [data-hero-image] {
            transition: none !important;
          }

          [data-home-hero] [data-hero-image] {
            transform: scale(1) !important;
          }

          [data-home-hero] [data-hero-progress] {
            animation: none !important;
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default NewArrivalsBanner;
