import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeaturedSlide {
  id: number;
  category: string;
  tag: string;
  title: string;
  subtitle: string;
  price: string;
  cta: string;
  link: string;
  image: string;
  accent: string; // gradient accent color
}

// Top-priced new arrivals — one per category
const slides: FeaturedSlide[] = [
  {
    id: 1,
    category: 'Lehenga',
    tag: 'New Arrival · Premium',
    title: 'Beige Net Embroidery Festive Lehenga',
    subtitle: 'Handcrafted designer lehenga choli with intricate embroidery on luxurious net fabric.',
    price: 'From $249',
    cta: 'Shop Lehenga',
    link: '/product/beige-net-embroidery-festive-lehenga-choli-designer-indian-lehenga-5',
    image:
      'https://images.wholesalesalwar.com/2026y/May/61379/Beige-Net-Festival-Wear-Embroidery-Work-Readymade-Lehenga-Choli-TITLI-1067(1).jpg',
    accent: 'from-rose-900/85 via-rose-800/70 to-transparent',
  },
  {
    id: 2,
    category: 'Saree',
    tag: 'New Arrival · Designer',
    title: 'Green Satin Silk Sequins Festive Saree',
    subtitle: 'A regal designer saree in lush satin silk with shimmering sequin work for festive evenings.',
    price: 'From $216',
    cta: 'Shop Saree',
    link: '/product/green-satin-silk-sequins-festive-saree-designer-indian-saree-sar-36',
    image:
      'https://images.wholesalesalwar.com/2026y/April/61217/Green-Satin-Silk-Festival-Wear-Sequins-Work--Readymade-Saree-BELLE-26809(1).jpg',
    accent: 'from-emerald-900/85 via-emerald-800/70 to-transparent',
  },
  {
    id: 3,
    category: 'Suit',
    tag: 'New Arrival · Anarkali',
    title: 'Sky Blue Chinon Embroidered Salwar Suit',
    subtitle: 'A breezy chinon Anarkali suit with delicate embroidery — made for occasion-wear elegance.',
    price: 'From $119',
    cta: 'Shop Suit',
    link: '/product/sky-blue-chinon-embroidered-occasion-salwar-suit-designer-indian-sui-16',
    image:
      'https://images.wholesalesalwar.com/2026y/May/61270/Sky-Blue-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Anarkali-Suit-FLORAL-001(1).jpg',
    accent: 'from-sky-900/85 via-sky-800/70 to-transparent',
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
      aria-label="Featured new arrivals"
      className="relative w-full overflow-hidden bg-neutral-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative h-[420px] sm:h-[480px] md:h-[540px] lg:h-[600px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Image */}
            <img
              src={slide.image}
              alt={slide.title}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            {/* Gradient overlay (left → right for legibility) */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`}
              aria-hidden="true"
            />
            {/* Subtle bottom darken */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative z-10 h-full">
              <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8">
                <div className="flex h-full max-w-2xl flex-col justify-center">
                  <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                    className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm sm:text-xs"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    {slide.tag}
                  </motion.span>

                  <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.7 }}
                    className="font-serif text-3xl leading-[1.05] text-white sm:text-4xl md:text-5xl lg:text-6xl"
                  >
                    {slide.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className="mt-4 max-w-xl text-sm text-white/90 sm:text-base md:text-lg"
                  >
                    {slide.subtitle}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.7 }}
                    className="mt-6 flex flex-wrap items-center gap-4"
                  >
                    <Link
                      to={slide.link}
                      className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-neutral-900 shadow-lg transition-all hover:bg-neutral-100 hover:shadow-xl sm:text-base"
                    >
                      {slide.cta}
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <span className="text-sm font-medium uppercase tracking-wider text-white/85 sm:text-base">
                      {slide.price}
                    </span>
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
          className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex md:left-4 md:p-3"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex md:right-4 md:p-3"
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
              aria-label={`Go to slide ${i + 1}: ${s.category}`}
              aria-current={i === index ? 'true' : 'false'}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-10 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Category label (top-right) */}
        <div className="absolute right-3 top-3 z-20 hidden rounded-full bg-black/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:right-6 sm:top-6 sm:block">
          {slide.category}
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsBanner;
