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

interface FeaturedSlide {
  id: string;
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
  imagePosition?: string;
  mobileContentPosition?: 'top' | 'bottom';
}

const featuredSlides: FeaturedSlide[] = [
  {
    id: 'navratri-2026',
    eyebrow: 'Navratri 2026',
    headline: 'Browse current Navratri and Garba listings.',
    subline:
      'Open each listing to verify its garment type, work, included pieces, sizes, and current availability.',
    cta: 'Shop Navratri',
    link: '/collections/navratri-outfits',
    image: '/images/hero-carousel/navratri-lehenga',
    desktopImage: '/images/hero-carousel/navratri-lehenga-desktop',
    alt: 'Woman wearing a bright pink Indian outfit',
    width: 1672,
    height: 941,
    imageFit: 'cover',
    imagePosition: 'center center',
  },
  {
    id: 'new-arrivals',
    eyebrow: 'New Arrivals',
    headline: 'Recently added Indian occasionwear listings.',
    subline:
      'Explore products ordered by their Shopify catalog creation date and verify current details on each listing.',
    cta: 'Shop New Arrivals',
    link: '/new-arrivals',
    image: '/images/campaigns/new-indian-ethnic-wear-2026-mobile',
    desktopImage: '/images/campaigns/new-indian-ethnic-wear-2026-desktop',
    alt: 'Woman in a blush pink embroidered Indian occasionwear set in a garden setting',
    width: 1600,
    height: 900,
    imageFit: 'contain',
  },
  {
    id: 'ready-to-ship',
    eyebrow: 'Ready to Ship',
    headline: 'Products with explicit ready-to-ship catalog evidence.',
    subline:
      'This view requires a ready-to-ship tag or a positive ships-within field plus current product and variant availability. Review the selected size and options before ordering.',
    cta: 'Shop Ready to Ship',
    link: '/ready-to-ship',
    image: '/images/campaigns/sharara-palazzo-sets-2026-mobile',
    desktopImage: '/images/campaigns/sharara-palazzo-sets-2026-desktop',
    alt: 'Woman wearing an embroidered Indian occasion set with a coordinated dupatta',
    width: 735,
    height: 936,
  },
  {
    id: 'wedding-lehengas',
    eyebrow: 'Wedding Lehengas',
    headline: 'Browse current wedding-related lehenga listings.',
    subline:
      'Confirm the exact garment, work, included pieces, sizing, color, and availability on the selected product page.',
    cta: 'Shop Lehengas',
    link: '/lehengas',
    image: '/images/campaigns/wedding-lehengas-usa-2026-mobile',
    desktopImage: '/images/campaigns/wedding-lehengas-usa-2026-desktop',
    alt: 'Bride wearing a red embroidered lehenga choli with a matching dupatta',
    width: 900,
    height: 1206,
  },
];

const AUTO_PLAY_MS = 6500;
const padSlideNumber = (value: number) => String(value).padStart(2, '0');

const NewArrivalsBanner = () => {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartX = useRef(0);
  const isPaused = isHovered || isFocusWithin;
  const activeSlide = featuredSlides[index];

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % featuredSlides.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((current) => (current - 1 + featuredSlides.length) % featuredSlides.length);
  }, []);

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

  const preservesFullImage = activeSlide.imageFit === 'contain';

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
      <div
        key={activeSlide.id}
        data-hero-slide
        aria-label={`${index + 1} of ${featuredSlides.length}`}
        aria-roledescription="slide"
        className="absolute inset-0 animate-in fade-in duration-700"
        role="group"
      >
        {preservesFullImage && (
          <picture aria-hidden="true" className="absolute inset-0 block overflow-hidden">
            {activeSlide.desktopImage && (
              <source
                media="(min-width: 640px)"
                srcSet={`${activeSlide.desktopImage}.webp`}
                type="image/webp"
              />
            )}
            {activeSlide.desktopImage && (
              <source
                media="(min-width: 640px)"
                srcSet={`${activeSlide.desktopImage}.jpg`}
                type="image/jpeg"
              />
            )}
            <source srcSet={`${activeSlide.image}.webp`} type="image/webp" />
            <img
              src={`${activeSlide.image}.jpg`}
              alt=""
              width={activeSlide.width}
              height={activeSlide.height}
              decoding="async"
              loading="eager"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
            />
          </picture>
        )}

        <picture className="absolute inset-0 block overflow-hidden">
          {activeSlide.desktopImage && (
            <source
              media="(min-width: 640px)"
              srcSet={`${activeSlide.desktopImage}.webp`}
              type="image/webp"
            />
          )}
          {activeSlide.desktopImage && (
            <source
              media="(min-width: 640px)"
              srcSet={`${activeSlide.desktopImage}.jpg`}
              type="image/jpeg"
            />
          )}
          <source srcSet={`${activeSlide.image}.webp`} type="image/webp" />
          <img
            data-hero-image
            src={`${activeSlide.image}.jpg`}
            alt={activeSlide.alt}
            width={activeSlide.width}
            height={activeSlide.height}
            decoding="async"
            loading="eager"
            fetchPriority={index === 0 ? 'high' : 'low'}
            className={`absolute inset-0 h-full w-full animate-in zoom-in-105 duration-[7000ms] ease-out ${
              activeSlide.imageFit === 'cover'
                ? 'object-cover'
                : preservesFullImage
                  ? 'object-contain object-top sm:object-center'
                  : 'object-cover object-[center_15%] sm:object-[center_20%]'
            }`}
            style={{ objectPosition: activeSlide.imagePosition }}
          />
        </picture>

        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,16,14,0.28) 0%, rgba(20,16,14,0.46) 43%, rgba(20,16,14,0.94) 100%)',
          }}
        />
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,16,14,0.88) 0%, rgba(20,16,14,0.58) 44%, rgba(20,16,14,0.12) 74%, rgba(20,16,14,0.32) 100%), linear-gradient(180deg, rgba(20,16,14,0.2) 0%, rgba(20,16,14,0) 32%, rgba(20,16,14,0) 66%, rgba(20,16,14,0.62) 100%)',
          }}
        />

        <div
          className={`relative z-10 flex h-full px-6 sm:items-center sm:px-[6vw] sm:pb-0 sm:pt-0 ${
            activeSlide.mobileContentPosition === 'top'
              ? 'items-start pb-0 pt-[112px]'
              : 'items-end pb-[132px] pt-0'
          }`}
        >
          <div
            data-hero-content
            className="max-w-[590px] animate-in fade-in slide-in-from-bottom-5 duration-700"
          >
            <p
              className="mb-[22px] inline-flex items-center gap-2.5 text-[15px] font-medium italic uppercase tracking-[0.14em] text-[#d4b078]"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
            >
              <span
                aria-hidden="true"
                className="h-px w-8 bg-gradient-to-r from-transparent to-[#d4b078]"
              />
              {activeSlide.eyebrow}
            </p>

            <h2
              className="mb-[18px] text-[34px] font-normal leading-[1.02] tracking-[-0.01em] text-[#faf7f0] sm:text-[clamp(38px,5.5vw,68px)]"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
            >
              {activeSlide.headline}
            </h2>

            <p className="mb-[34px] max-w-[500px] text-[15px] font-light leading-[1.55] text-[#f5f0e6]/82 sm:text-[clamp(15px,1.15vw,17px)]">
              {activeSlide.subline}
            </p>

            <Link
              to={activeSlide.link}
              className="group inline-flex min-h-11 items-center gap-3 border border-transparent bg-[#faf7f0] px-7 py-[15px] text-sm font-semibold uppercase tracking-[0.06em] text-[#1a1a1a] transition-colors duration-300 hover:bg-[#b8935a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4b078]"
            >
              <span>{activeSlide.cta}</span>
              <ArrowRight
                aria-hidden="true"
                className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 justify-between px-[clamp(12px,2vw,28px)] sm:flex">
        <button
          type="button"
          aria-label="Previous banner"
          onClick={prev}
          className="pointer-events-auto grid h-[52px] w-[52px] place-items-center rounded-full border border-[#f5f0e6]/25 bg-[#14100e]/35 text-[#faf7f0] backdrop-blur-xl transition-colors duration-300 hover:border-[#faf7f0]/70 hover:bg-[#14100e]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d4b078]"
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Next banner"
          onClick={next}
          className="pointer-events-auto grid h-[52px] w-[52px] place-items-center rounded-full border border-[#f5f0e6]/25 bg-[#14100e]/35 text-[#faf7f0] backdrop-blur-xl transition-colors duration-300 hover:border-[#faf7f0]/70 hover:bg-[#14100e]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d4b078]"
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[#f5f0e6]/12 bg-[#14100e]/35 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-5 sm:px-[6vw]">
          <div className="flex items-center gap-3" aria-label="Choose a featured banner">
            {featuredSlides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show banner ${slideIndex + 1}: ${slide.eyebrow}`}
                aria-current={slideIndex === index ? 'true' : undefined}
                onClick={() => setIndex(slideIndex)}
                className={`relative h-1 overflow-hidden rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4b078] ${
                  slideIndex === index
                    ? 'w-14 bg-[#f5f0e6]/30'
                    : 'w-7 bg-[#f5f0e6]/28 hover:bg-[#f5f0e6]/55'
                }`}
              >
                {slideIndex === index && (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 bg-[#d4b078] ${
                      prefersReducedMotion || isPaused ? 'w-full' : 'animate-[hero-progress_6.5s_linear_forwards]'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>

          <p className="text-xs font-medium tracking-[0.2em] text-[#f5f0e6]/75" aria-hidden="true">
            {padSlideNumber(index + 1)} / {padSlideNumber(featuredSlides.length)}
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {activeSlide.eyebrow}: {activeSlide.headline}
      </p>
    </section>
  );
};

export default NewArrivalsBanner;
