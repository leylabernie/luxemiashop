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
  imagePanelClass: string; // Tailwind class for image panel bg
  textPanelClass: string;  // Tailwind class for text panel bg + text color
  accentChip: string;
}

// Top-priced new arrivals — one per category
const slides: FeaturedSlide[] = [
  {
    id: 1,
    category: 'Lehenga',
    tag: 'New Arrival · Premium',
    title: 'Beige Net Embroidery Festive Lehenga',
    subtitle:
      'Handcrafted designer lehenga choli with intricate embroidery on luxurious net fabric.',
    price: 'From $249',
    cta: 'Shop Lehenga',
    link: '/product/beige-net-embroidery-festive-lehenga-choli-designer-indian-lehenga-5',
    image:
      'https://images.wholesalesalwar.com/2026y/May/61379/Beige-Net-Festival-Wear-Embroidery-Work-Readymade-Lehenga-Choli-TITLI-1067(1).jpg',
    imagePanelClass: 'bg-[#f5ede2]',
    textPanelClass: 'bg-[#3a1f2c] text-[#fdf6ef]',
    accentChip: 'bg-rose-100 text-rose-900 border-rose-200',
  },
  {
    id: 2,
    category: 'Saree',
    tag: 'New Arrival · Designer',
    title: 'Green Satin Silk Sequins Festive Saree',
    subtitle:
      'A regal designer saree in lush satin silk with shimmering sequin work for festive evenings.',
    price: 'From $216',
    cta: 'Shop Saree',
    link: '/product/green-satin-silk-sequins-festive-saree-designer-indian-saree-sar-36',
    image:
      'https://images.wholesalesalwar.com/2026y/April/61217/Green-Satin-Silk-Festival-Wear-Sequins-Work--Readymade-Saree-BELLE-26809(1).jpg',
    imagePanelClass: 'bg-[#eaf3ee]',
    textPanelClass: 'bg-[#0f3a2c] text-[#f5fbf7]',
    accentChip: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  {
    id: 3,
    category: 'Suit',
    tag: 'New Arrival · Anarkali',
    title: 'Sky Blue Chinon Embroidered Salwar Suit',
    subtitle:
      'A breezy chinon Anarkali suit with delicate embroidery — made for occasion-wear elegance.',
    price: 'From $119',
    cta: 'Shop Suit',
    link: '/product/sky-blue-chinon-embroidered-occasion-salwar-suit-designer-indian-sui-16',
    image:
      'https://images.wholesalesalwar.com/2026y/May/61270/Sky-Blue-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Anarkali-Suit-FLORAL-001(1).jpg',
    imagePanelClass: 'bg-[#eaf2f7]',
    textPanelClass: 'bg-[#0d2a3d] text-[#f0f7fb]',
    accentChip: 'bg-sky-100 text-sky-900 border-sky-200',
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
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`relative w-full ${slide.imagePanelClass}`}
        >
          <div className="grid w-full grid-cols-1 lg:grid-cols-2">
            {/* Text panel */}
            <div
              className={`order-2 flex items-center px-6 py-10 sm:px-10 sm:py-14 lg:order-1 lg:min-h-[560px] lg:px-16 lg:py-20 ${slide.textPanelClass}`}
            >
              <div className="mx-auto w-full max-w-xl">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] sm:text-xs ${slide.accentChip}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {slide.tag}
                </motion.span>

                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="font-serif text-3xl leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.25rem]"
                >
                  {slide.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.6 }}
                  className="mt-5 max-w-md text-sm leading-relaxed opacity-85 sm:text-base"
                >
                  {slide.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.44, duration: 0.6 }}
                  className="mt-7 flex flex-wrap items-center gap-5"
                >
                  <Link
                    to={slide.link}
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-neutral-900 shadow-md transition-all hover:bg-neutral-100 hover:shadow-lg sm:text-base"
                  >
                    {slide.cta}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <span className="text-sm font-medium uppercase tracking-wider opacity-90 sm:text-base">
                    {slide.price}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] opacity-60"
                >
                  <span>{`0${index + 1}`}</span>
                  <span className="h-px w-10 bg-current opacity-40" />
                  <span>{`0${slides.length}`}</span>
                  <span className="ml-2">{slide.category}</span>
                </motion.div>
              </div>
            </div>

            {/* Image panel — full image, no crop, no overlay */}
            <div
              className={`relative order-1 flex items-center justify-center overflow-hidden lg:order-2 lg:min-h-[560px] ${slide.imagePanelClass}`}
            >
              <motion.img
                key={`img-${slide.id}`}
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-[360px] w-auto max-w-full object-contain sm:h-[440px] lg:h-[560px]"
              />
            </div>
          </div>

          {/* Prev / Next arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-black/15 bg-white/90 p-2.5 text-neutral-800 shadow-md backdrop-blur-sm transition hover:bg-white sm:flex md:left-5 md:p-3"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-black/15 bg-white/90 p-2.5 text-neutral-800 shadow-md backdrop-blur-sm transition hover:bg-white sm:flex md:right-5 md:p-3"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 lg:left-[25%]">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}: ${s.category}`}
                aria-current={i === index ? 'true' : 'false'}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index
                    ? 'w-10 bg-white shadow'
                    : 'w-2.5 bg-white/60 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default NewArrivalsBanner;
