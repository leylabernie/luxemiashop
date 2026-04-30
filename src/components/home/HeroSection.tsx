import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
  accentColor: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'Bridal Lehenga Collection',
    subtitle: 'Handcrafted Elegance for Your Special Day',
    cta: 'Shop Lehengas',
    link: '/lehengas',
    image: '/images/banners/hero-banner.jpg',
    accentColor: 'bg-rose-700',
  },
  {
    id: 2,
    title: 'Designer Silk Sarees',
    subtitle: 'Where Tradition Meets Modern Glamour',
    cta: 'Explore Sarees',
    link: '/sarees',
    image: '/images/banners/saree-banner.jpg',
    accentColor: 'bg-amber-700',
  },
  {
    id: 3,
    title: 'Embroidered Salwar Suits',
    subtitle: 'Graceful Silhouettes in Quality Fabrics',
    cta: 'View Suits',
    link: '/suits',
    image: '/images/banners/salwar-banner.jpg',
    accentColor: 'bg-emerald-700',
  },
  {
    id: 4,
    title: 'Menswear Indo-Western',
    subtitle: 'Regal Sherwanis & Modern Indo-Western',
    cta: 'Shop Menswear',
    link: '/menswear',
    image: '/images/banners/menswear-banner.jpg',
    accentColor: 'bg-slate-600',
  },
  {
    id: 5,
    title: 'Golden Lehenga Choli',
    subtitle: 'Opulent Designs for the Modern Bride',
    cta: 'Shop Lehengas',
    link: '/lehengas',
    image: '/images/banners/new-arrivals-banner.jpg',
    accentColor: 'bg-yellow-700',
  },
  {
    id: 6,
    title: 'Wedding Collection',
    subtitle: 'Celebrate in Style with Premium Ethnic Wear',
    cta: 'Shop Wedding',
    link: '/collections',
    image: '/images/banners/festival-banner.jpg',
    accentColor: 'bg-fuchsia-700',
  },
];

const AUTOPLAY_MS = 5000;

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

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/*
        Split layout: Dark background left (text) + Product image right
        Product images are portrait (800x1100) — displayed COMPLETELY with object-contain
        No cropping, no half-images, white text always readable on dark bg
      */}
      <div className="relative w-full bg-black min-h-[60vh] sm:min-h-[65vh] lg:min-h-[75vh]">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-stretch min-h-[60vh] sm:min-h-[65vh] lg:min-h-[75vh]">

          {/* LEFT: Text on dark background */}
          <div className="w-full md:w-1/2 flex flex-col justify-center py-10 md:py-14 lg:py-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className={`inline-block px-4 py-1.5 ${slide.accentColor} text-white text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-4 rounded-sm`}>
                  New Collection
                </span>
                <p className="text-xs sm:text-sm tracking-[0.15em] uppercase text-white/60 mb-3 font-light">
                  {slide.subtitle}
                </p>
                {currentSlide === 0 ? (
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight text-white">
                    {slide.title}
                  </h1>
                ) : (
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight text-white">
                    {slide.title}
                  </h2>
                )}
                <div className="flex items-center gap-5 flex-wrap">
                  <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90 font-medium tracking-wider px-8 py-6 text-xs sm:text-sm rounded-sm shadow-lg">
                    <Link to={slide.link}>{slide.cta}</Link>
                  </Button>
                  <Link to="/collections" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors underline underline-offset-4 tracking-wide">
                    View All Collections
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Full product image — object-contain so NO cropping */}
          <div className="w-full md:w-1/2 flex items-center justify-center py-6 md:py-8 lg:py-12">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={slide.image}
                alt={slide.title}
                className="h-full max-h-[60vh] sm:max-h-[65vh] lg:max-h-[75vh] w-auto object-contain drop-shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                fetchPriority="high"
                decoding="async"
                loading="eager"
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 lg:left-6 z-20">
        <button
          onClick={prevSlide}
          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/30 hover:border-white/60 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-3 lg:right-6 z-20">
        <button
          onClick={nextSlide}
          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/30 hover:border-white/60 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
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
