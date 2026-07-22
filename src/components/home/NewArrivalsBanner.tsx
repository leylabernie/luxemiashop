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
  id: number;
  eyebrow: string;
  headline: string;
  subline: string;
  cta: string;
  link: string;
  image: string;
  alt: string;
  width: number;
  height: number;
}

const slides: FeaturedSlide[] = [
  {
    id: 1,
    eyebrow: 'The Bridal Edit',
    headline: 'Lehengas Made for the Aisle',
    subline: 'Hand-embroidered silk, dupattas that photograph like a dream.',
    cta: 'Shop Bridal Lehengas',
    link: '/lehengas',
    image: '/images/hero-carousel/bridal-lehenga',
    alt: 'Bride wearing an off-white hand-embroidered lehenga and bridal jewelry',
    width: 509,
    height: 700,
  },
  {
    id: 2,
    eyebrow: 'Ready to Drape',
    headline: 'Pre-Stitched Sarees, Zero Fuss',
    subline: 'Nine yards of grace, pleated and pinned before it reaches you.',
    cta: 'Shop Sarees',
    link: '/sarees',
    image: '/images/hero-carousel/saree-teal',
    alt: 'Woman wearing a teal pre-stitched saree with traditional jewelry',
    width: 493,
    height: 700,
  },
  {
    id: 3,
    eyebrow: 'Festive 2026',
    headline: 'Navratri, in Full Twirl',
    subline: 'Tiered ghagras and mirror-work jackets built for nine nights of garba.',
    cta: 'Shop Festive Lehengas',
    link: '/collections',
    image: '/images/hero-carousel/navratri-lehenga',
    alt: 'Woman twirling in a bright pink Navratri lehenga and mirror-work jacket',
    width: 462,
    height: 700,
  },
  {
    id: 4,
    eyebrow: 'For Him',
    headline: 'Kurtas, Sherwanis, Statement Sets',
    subline: 'The groom, the brother, the best man — sorted.',
    cta: 'Shop Menswear',
    link: '/menswear',
    image: '/images/hero-carousel/menswear-kurta',
    alt: 'Man wearing a cream embroidered kurta and dhoti set',
    width: 367,
    height: 579,
  },
  {
    id: 5,
    eyebrow: 'Finish the Look',
    headline: 'Bridal Jewellery Sets',
    subline: 'Kundan, polki and pearl — because the outfit is only half the story.',
    cta: 'Shop Collections',
    link: '/collections',
    image: '/images/hero-carousel/bridal-jewellery',
    alt: 'Bride wearing a kundan necklace, earrings, maang tikka, and maroon lehenga',
    width: 524,
    height: 700,
  },
];

const AUTO_PLAY_MS = 6000;
const padSlideNumber = (value: number) => String(value).padStart(2, '0');

const NewArrivalsBanner = () => {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartX = useRef(0);
  const isPaused = isHovered || isFocusWithin;
  const autoplayRunning = !isPaused && !prefersReducedMotion;

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((current) => (current - 1 + slides.length) % slides.length);
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
              <picture className="absolute inset-0 block overflow-hidden">
                <source srcSet={`${slide.image}.webp`} type="image/webp" />
                <img
                  data-hero-image
                  src={`${slide.image}.jpg`}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  decoding="async"
                  loading={slideIndex === 0 ? 'eager' : 'lazy'}
                  className="absolute inset-0 h-full w-full object-cover object-[center_15%] transition-transform ease-out sm:object-[center_20%]"
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

              <div className="relative z-10 flex h-full items-end px-6 pb-[130px] sm:items-center sm:px-[6vw] sm:pb-0">
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
