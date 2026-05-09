import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CtaChip {
  label: string;
  link: string;
}

interface FeaturedSlide {
  id: number;
  headline: string; // big bold campaign headline
  headlineLine2?: string;
  image: string;
  imagePosition: string; // CSS object-position for crop control
  textColor: 'light' | 'dark';
  ctas: CtaChip[];
}

// Editorial campaign slides — one for each top-priced new arrival
const slides: FeaturedSlide[] = [
  {
    id: 1,
    headline: 'BRIDAL EDIT',
    headlineLine2: '2026',
    image:
      'https://images.wholesalesalwar.com/2026y/May/61379/Beige-Net-Festival-Wear-Embroidery-Work-Readymade-Lehenga-Choli-TITLI-1067(1).jpg',
    imagePosition: 'center 25%',
    textColor: 'light',
    ctas: [
      { label: 'LEHENGAS', link: '/lehengas' },
      { label: 'BRIDAL', link: '/lehengas?occasion=bridal' },
      { label: 'WEDDING', link: '/wedding-sarees' },
    ],
  },
  {
    id: 2,
    headline: 'FESTIVE EDIT',
    headlineLine2: 'NEW ARRIVALS',
    image:
      'https://images.wholesalesalwar.com/2026y/April/61217/Green-Satin-Silk-Festival-Wear-Sequins-Work--Readymade-Saree-BELLE-26809(1).jpg',
    imagePosition: 'center 20%',
    textColor: 'light',
    ctas: [
      { label: 'SAREES', link: '/sarees' },
      { label: 'DESIGNER', link: '/sarees?style=designer' },
      { label: 'FESTIVE', link: '/sarees?occasion=festive' },
    ],
  },
  {
    id: 3,
    headline: 'ANARKALI',
    headlineLine2: 'COLLECTION',
    image:
      'https://images.wholesalesalwar.com/2026y/May/61270/Sky-Blue-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Anarkali-Suit-FLORAL-001(1).jpg',
    imagePosition: 'center 25%',
    textColor: 'light',
    ctas: [
      { label: 'SALWAR SUITS', link: '/suits' },
      { label: 'ANARKALI', link: '/suits?style=anarkali' },
      { label: 'OCCASION', link: '/suits?occasion=occasion' },
    ],
  },
];

const AUTO_PLAY_MS = 5500;

const NewArrivalsBanner = () => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, []);

  const goTo = useCallback((i: number) => setIndex(i), []);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(next, AUTO_PLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, isPaused, next]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  // Touch swipe
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
  const isLight = slide.textColor === 'light';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative w-full overflow-hidden bg-neutral-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative h-[420px] sm:h-[500px] md:h-[560px] lg:h-[620px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Full-bleed image */}
            <img
              src={slide.image}
              alt={slide.headline}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: slide.imagePosition }}
            />

            {/* Subtle vignette for headline legibility — light only on left side */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent"
              aria-hidden="true"
            />
            {/* Subtle bottom darken for CTA chips */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative z-10 h-full">
              <div className="container mx-auto h-full px-4 sm:px-6 lg:px-12">
                <div className="flex h-full flex-col justify-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.7 }}
                    className={`font-serif leading-[0.95] tracking-tight ${
                      isLight ? 'text-white' : 'text-neutral-900'
                    }`}
                    style={{
                      textShadow: isLight ? '0 2px 24px rgba(0,0,0,0.35)' : 'none',
                    }}
                  >
                    <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                      {slide.headline}
                    </span>
                    {slide.headlineLine2 && (
                      <span className="mt-1 block text-4xl font-light italic sm:text-5xl md:text-6xl lg:text-7xl">
                        {slide.headlineLine2}
                      </span>
                    )}
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
                  >
                    {slide.ctas.map((cta) => (
                      <Link
                        key={cta.label}
                        to={cta.link}
                        className={`inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] backdrop-blur-sm transition-all hover:scale-[1.03] sm:px-6 sm:py-3 sm:text-sm ${
                          isLight
                            ? 'border-white/40 bg-white/15 text-white hover:bg-white hover:text-neutral-900'
                            : 'border-neutral-900/30 bg-white/70 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                        }`}
                      >
                        {cta.label}
                      </Link>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex md:left-5 md:p-3"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex md:right-5 md:p-3"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? 'true' : 'false'}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-10 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsBanner;
