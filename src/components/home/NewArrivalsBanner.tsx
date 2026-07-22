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
  category: string; // small overline label, e.g. "01 — LEHENGA"
  headline: string; // big bold campaign headline
  headlineLine2?: string;
  image: string; // base path (without _mobile/_tablet/_desktop suffix)
  // Hex colors tuned to each product so the panel feels editorial, not generic
  panelBg: string;
  panelText: string;
  imageBg: string; // soft cream/neutral that complements the product
  ctaBorder: string; // border color for CTA chips on the colored panel
  ctas: CtaChip[];
}

// Editorial campaign slides — split-panel layout, uncropped product imagery
// Colors picked to match each product so the design reads couture, not stock.
const slides: FeaturedSlide[] = [
  {
    id: 1,
    category: '01 — SILK LEHENGA',
    headline: 'BRIDAL EDIT',
    headlineLine2: '2026',
    image: '/images/hero/Hero_image',
    // Deep burgundy to match the maroon silk lehenga
    panelBg: '#6b1026',
    panelText: '#f7ebd9',
    imageBg: '#f5ead8',
    ctaBorder: 'rgba(247,235,217,0.45)',
    ctas: [
      { label: 'LEHENGAS', link: '/lehengas' },
      { label: 'BRIDAL', link: '/lehengas?occasion=bridal' },
      { label: 'WEDDING', link: '/wedding-sarees' },
    ],
  },
  {
    id: 2,
    category: '02 — SATIN SAREE',
    headline: 'FESTIVE EDIT',
    headlineLine2: 'NEW ARRIVALS',
    image: '/images/hero/Teal-Blue-Satin-Silk-Occasional-Wear-Embroidery-Work-Readymade-Saree-A411-B',
    // Deep teal to echo the blue saree
    panelBg: '#0d3b4a',
    panelText: '#f1f5ec',
    imageBg: '#f4efe4',
    ctaBorder: 'rgba(241,245,236,0.45)',
    ctas: [
      { label: 'SAREES', link: '/sarees' },
      { label: 'DESIGNER', link: '/sarees?style=designer' },
      { label: 'FESTIVE', link: '/sarees?occasion=festive' },
    ],
  },
  {
    id: 3,
    category: '03 — DESIGNER SUIT',
    headline: 'DESIGNER',
    headlineLine2: 'SUITS',
    image: '/images/hero/Black-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Designer-Suit-Isha-10002',
    // True black to match the black georgette suit — warm off-white text for contrast
    panelBg: '#0d0d0d',
    panelText: '#f5f5f5',
    imageBg: '#f5f5f5',
    ctaBorder: 'rgba(245,245,245,0.45)',
    ctas: [
      { label: 'SUITS', link: '/suits' },
      { label: 'BLACK', link: '/suits?color=black' },
      { label: 'OCCASION', link: '/suits?occasion=occasion' },
    ],
  },
  {
    id: 4,
    category: '04 — GROOM SHERWANI',
    headline: 'MENSWEAR',
    headlineLine2: 'COLLECTION',
    image:
      '/images/banners/menswear-banner.webp',
    // Deep burgundy-brown for the maroon sherwani
    panelBg: '#3d1020',
    panelText: '#f7ebd9',
    imageBg: '#f5ead8',
    ctaBorder: 'rgba(247,235,217,0.45)',
    ctas: [
      { label: 'SHERWANI', link: '/menswear' },
      { label: 'MENSWEAR', link: '/menswear' },
      { label: 'WEDDING', link: '/menswear?occasion=wedding' },
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

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
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
            {/* TEXT PANEL — editorial campaign copy */}
            <div
              className="order-2 flex items-center px-6 py-12 sm:px-10 sm:py-16 lg:order-1 lg:px-16 lg:py-20"
              style={{ backgroundColor: slide.panelBg, color: slide.panelText }}
            >
              <div className="w-full max-w-xl">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="text-[11px] font-medium uppercase tracking-[0.32em] opacity-70"
                >
                  {slide.category}
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.7 }}
                  className="mt-5 font-serif leading-[0.95] tracking-tight"
                >
                  <span className="block text-5xl sm:text-6xl md:text-7xl">
                    {slide.headline}
                  </span>
                  {slide.headlineLine2 && (
                    <span className="mt-2 block text-3xl font-light italic opacity-90 sm:text-4xl md:text-5xl">
                      {slide.headlineLine2}
                    </span>
                  )}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.7 }}
                  className="mt-8 h-px w-16"
                  style={{ backgroundColor: slide.panelText, opacity: 0.4 }}
                />

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
                      className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-all hover:scale-[1.03] sm:text-xs"
                      style={{
                        borderColor: slide.ctaBorder,
                        color: slide.panelText,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = slide.panelText;
                        e.currentTarget.style.color = slide.panelBg;
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

            {/* IMAGE PANEL — object-contain, no cropping ever */}
            <div
              className="order-1 flex items-center justify-center lg:order-2"
              style={{ backgroundColor: slide.imageBg }}
            >
              <div className="flex h-[360px] w-full items-center justify-center px-4 py-6 sm:h-[460px] sm:px-6 lg:h-[620px] lg:px-8">
                <img
                  src={slide.image.includes('/images/hero/') ? `${slide.image}_desktop.webp` : slide.image}
                  srcSet={slide.image.includes('/images/hero/')
                    ? `${slide.image}_mobile.webp 480w, ${slide.image}_tablet.webp 768w, ${slide.image}_desktop.webp 1000w`
                    : undefined}
                  // sizes attribute tuned to ACTUAL display width (PSI 2026-07-15):
                  //   - mobile (<=640px): image fills ~100vw minus padding = ~92vw, cap at 480px
                  //   - tablet (<=1024px): image is in 1-col layout, fills ~90vw, cap at 768px
                  //   - desktop (>1024px): image is in 2-col grid, takes ~50vw, cap at 600px
                  // Previous sizes=1200px caused DPR-2 mobile to pick the 1200w variant
                  // even though display was only ~400px — wasting ~375KB per hero.
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 90vw, 50vw"
                  alt={slide.headline}
                  width={600}
                  height={800}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
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

        {/* Dots */}
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
