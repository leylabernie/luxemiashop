import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOptimizedImage } from '@/lib/imageUtils';

interface CtaChip {
  label: string;
  link: string;
}

interface FeaturedSlide {
  id: number;
  eyebrow: string;
  headline: string;
  headlineLine2?: string;
  supportingText: string;
  image: string;
  panelGradient: string;
  panelText: string;
  imageBg: string;
  ctaBorder: string;
  ctas: CtaChip[];
}

const slides: FeaturedSlide[] = [
  {
    id: 1,
    eyebrow: 'Fresh Styles Just Added',
    headline: 'Fresh Styles',
    headlineLine2: 'Just Added',
    supportingText: 'Explore newly added sarees, designer salwar suits, ready-to-wear sarees, lehengas, and men\'s kurta sets.',
    image: '/images/banners/lehenga-banner.jpg',
    panelGradient: 'linear-gradient(135deg, #2f1519 0%, #6b273f 54%, #b4824a 100%)',
    panelText: '#f7ebd9',
    imageBg: '#f8efe4',
    ctaBorder: 'rgba(247,235,217,0.45)',
    ctas: [
      { label: 'View New Arrivals', link: '/new-arrivals' },
      { label: 'Lehenga Choli', link: '/collections/lehenga-choli' },
      { label: 'Men\'s Styles', link: '/menswear' },
    ],
  },
  {
    id: 2,
    eyebrow: 'Ready-to-Wear Saree Edit',
    headline: 'Ready-to-Wear Sarees',
    headlineLine2: 'For Easy Celebrations',
    supportingText: 'Pre-stitched saree styles designed for weddings, parties, festive gatherings, and South Asian celebrations.',
    image: '/images/banners/saree-banner.jpg',
    panelGradient: 'linear-gradient(135deg, #0e2c24 0%, #285947 52%, #bd9557 100%)',
    panelText: '#f1f5ec',
    imageBg: '#f4efe4',
    ctaBorder: 'rgba(241,245,236,0.45)',
    ctas: [
      { label: 'Shop Sarees', link: '/sarees' },
      { label: 'Designer Sarees', link: '/collections/designer-sarees' },
      { label: 'View New Arrivals', link: '/new-arrivals' },
    ],
  },
  {
    id: 3,
    eyebrow: 'Men\'s Ethnic Wear',
    headline: 'Men\'s Kurta Pajama',
    headlineLine2: '& Festive Ethnic Sets',
    supportingText: 'Shop kurta pajama sets, jacket styles, and sherwani-inspired looks for weddings, Eid, Diwali, and family celebrations.',
    image: '/images/banners/menswear-banner.jpg',
    panelGradient: 'linear-gradient(135deg, #1c2430 0%, #34475a 52%, #9f7a4e 100%)',
    panelText: '#f3efe7',
    imageBg: '#eee8df',
    ctaBorder: 'rgba(243,239,231,0.45)',
    ctas: [
      { label: 'Shop Men\'s Styles', link: '/menswear' },
      { label: 'Kurta Sets', link: '/collections/kurta-sets' },
      { label: 'Wedding Styles', link: '/collections/wedding-lehengas' },
    ],
  },
];

const AUTO_PLAY_MS = 5500;

const NewArrivalsBanner = () => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, []);

  const goTo = useCallback((i: number) => setIndex(i), []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(next, AUTO_PLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, isPaused, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const touchStartX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) prev();
    if (dx < -50) next();
  };

  const slide = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="New arrivals and wedding season edits"
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2"
          >
            <div
              className="relative order-2 flex items-center overflow-hidden px-6 py-12 sm:px-10 sm:py-16 lg:order-1 lg:px-16 lg:py-20"
              style={{ background: slide.panelGradient, color: slide.panelText }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.1),transparent_28%)]" />
              <div className="relative w-full max-w-xl">
                <span className="inline-flex rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.24em] backdrop-blur-sm">
                  New Arrivals
                </span>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="mt-5 text-[11px] font-medium uppercase tracking-[0.32em] opacity-75"
                >
                  {slide.eyebrow}
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.7 }}
                  className="mt-5 font-serif leading-[0.98]"
                >
                  <span className="block text-4xl sm:text-5xl md:text-6xl">
                    {slide.headline}
                  </span>
                  {slide.headlineLine2 && (
                    <span className="mt-2 block text-2xl font-light italic opacity-90 sm:text-3xl md:text-4xl">
                      {slide.headlineLine2}
                    </span>
                  )}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.7 }}
                  className="mt-5 max-w-lg text-sm leading-relaxed opacity-80 sm:text-base"
                >
                  {slide.supportingText}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.7 }}
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  {slide.ctas.map((cta) => (
                    <Link
                      key={cta.label}
                      to={cta.link}
                      className="inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-all hover:scale-[1.03] sm:text-xs"
                      style={{
                        borderColor: slide.ctaBorder,
                        color: slide.panelText,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = slide.panelText;
                        e.currentTarget.style.color = '#1a1412';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = slide.panelText;
                      }}
                    >
                      {cta.label}
                    </Link>
                  ))}
                </motion.div>
              </div>
            </div>

            <div
              className="order-1 flex items-center justify-center lg:order-2"
              style={{ backgroundColor: slide.imageBg }}
            >
              <div className="relative flex h-[330px] w-full items-center justify-center overflow-hidden px-4 py-5 sm:h-[460px] sm:px-6 lg:h-[620px] lg:px-8">
                <div className="absolute inset-x-10 bottom-8 h-14 rounded-full bg-neutral-900/10 blur-2xl" />
                <picture className="relative">
                  <source
                    srcSet={getOptimizedImage(slide.image, 'hero').replace(/\.jpe?g(\?|$)/i, '.webp$1')}
                    type="image/webp"
                  />
                  <motion.img
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    src={getOptimizedImage(slide.image, 'hero')}
                    alt={slide.headline}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="max-h-[300px] max-w-full object-contain sm:max-h-[430px] lg:max-h-[590px]"
                  />
                </picture>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-neutral-900/15 bg-white/85 p-2.5 text-neutral-900 backdrop-blur-sm transition hover:bg-white sm:flex md:left-5 md:p-3"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-neutral-900/15 bg-white/85 p-2.5 text-neutral-900 backdrop-blur-sm transition hover:bg-white sm:flex md:right-5 md:p-3"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 lg:bottom-6">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? 'true' : 'false'}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index
                  ? 'w-10 bg-neutral-900'
                  : 'w-2.5 bg-neutral-900/30 hover:bg-neutral-900/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsBanner;
