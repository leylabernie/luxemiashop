import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type SlideLayout = 'fullwidth' | 'split';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
  accentBg: string;
  layout: SlideLayout;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'LuxeMia: Your destination for affordable Indian ethnic wear',
    subtitle: 'Beautiful Styles for Your Special Day',
    cta: 'Shop Bridal Lehengas',
    link: '/lehengas',
    image: '/images/banners/hero-banner.jpg',
    accentBg: 'bg-rose-800',
    layout: 'fullwidth',
  },
  {
    id: 2,
    title: 'Elegant Drape Sarees',
    subtitle: 'Where Tradition Meets Modern Glamour',
    cta: 'Explore Sarees',
    link: '/sarees',
    image: '/images/banners/saree-banner.jpg',
    accentBg: 'bg-purple-900',
    layout: 'split',
  },
  {
    id: 3,
    title: 'Embroidered Salwar Suits',
    subtitle: 'Graceful Silhouettes in Quality Fabrics',
    cta: 'View Suits',
    link: '/suits',
    image: '/images/banners/salwar-banner.jpg',
    accentBg: 'bg-emerald-900',
    layout: 'fullwidth',
  },
  {
    id: 4,
    title: 'Menswear Indo-Western',
    subtitle: 'Regal Sherwanis & Modern Indo-Western',
    cta: 'Shop Menswear',
    link: '/menswear',
    image: '/images/banners/festival-banner.jpg',
    accentBg: 'bg-amber-900',
    layout: 'split',
  },
  {
    id: 5,
    title: 'Festive Collection',
    subtitle: 'Beautiful Outfits for Celebrations & Beyond',
    cta: 'Shop Festive',
    link: '/collections',
    image: '/images/banners/new-arrivals-banner.jpg',
    accentBg: 'bg-pink-900',
    layout: 'split',
  },
];

const AUTOPLAY_MS = 4000;

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, AUTOPLAY_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const slide = heroSlides[currentSlide];
  const isFullWidth = slide.layout === 'fullwidth';

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {isFullWidth ? (
        /* ====== FULLWIDTH LAYOUT — 1600×600 wide banner images ====== */
        <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '8/3' }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-contain object-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              fetchPriority="high"
              decoding="async"
              loading="eager"
            />
          </AnimatePresence>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent lg:from-black/60 lg:via-black/25 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Text Content */}
          <div className="relative z-10 container mx-auto px-4 lg:px-8 h-full flex items-center">
            <div className="w-full lg:w-[50%] py-4 lg:py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className={`inline-block px-3 py-1 ${slide.accentBg} text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase mb-3 rounded-sm`}>
                    New Collection
                  </span>
                  <p className="text-xs sm:text-sm tracking-[0.1em] uppercase text-white/70 mb-2 font-light">
                    {slide.subtitle}
                  </p>
                  {currentSlide === 0 ? (
                    <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-4 leading-tight text-white">
                      {slide.title}
                    </h1>
                  ) : (
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-4 leading-tight text-white">
                      {slide.title}
                    </h2>
                  )}
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button asChild size="lg" className={`${slide.accentBg} hover:opacity-90 text-white font-medium tracking-wide px-6 py-5 text-xs sm:text-sm rounded-sm`}>
                      <Link to={slide.link}>{slide.cta}</Link>
                    </Button>
                    <Link to="/collections" className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors underline underline-offset-4">
                      View All Collections
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        /* ====== SPLIT LAYOUT — portrait/square product images ====== */
        /* Text on left, product image on right — no cropping, no blur */
        <div className={`relative w-full overflow-hidden bg-gradient-to-br ${slide.accentBg}`}>
          <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center min-h-[50vh] sm:min-h-[55vh] lg:min-h-[60vh]">
            {/* Text Side */}
            <div className="w-full md:w-[55%] py-8 md:py-12 lg:py-16 z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase mb-3 rounded-sm">
                    New Collection
                  </span>
                  <p className="text-xs sm:text-sm tracking-[0.1em] uppercase text-white/70 mb-2 font-light">
                    {slide.subtitle}
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-4 leading-tight text-white">
                    {slide.title}
                  </h2>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90 font-medium tracking-wide px-6 py-5 text-xs sm:text-sm rounded-sm">
                      <Link to={slide.link}>{slide.cta}</Link>
                    </Button>
                    <Link to="/collections" className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors underline underline-offset-4">
                      View All Collections
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Image Side — object-contain so portrait images show COMPLETELY without cropping */}
            <div className="w-full md:w-[45%] flex items-center justify-center py-4 md:py-8 lg:py-12">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={slide.image}
                  alt={slide.title}
                  className="max-h-[50vh] md:max-h-[55vh] lg:max-h-[60vh] w-auto max-w-full object-contain drop-shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  fetchPriority="high"
                  decoding="async"
                  loading="eager"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Navigation — arrows + counter */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 lg:left-6 z-20">
        <button
          onClick={prevSlide}
          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/30 hover:border-white/60 bg-black/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-3 lg:right-6 z-20">
        <button
          onClick={nextSlide}
          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/30 hover:border-white/60 bg-black/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 items-center z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
