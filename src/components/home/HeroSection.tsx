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
  accentBg: string;
  accentFrom: string;
  accentTo: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'Bridal Lehenga Collection',
    subtitle: 'Handcrafted Elegance for Your Special Day',
    cta: 'Shop Bridal Lehengas',
    link: '/lehengas',
    image: '/images/banners/hero-banner.jpg',
    accentBg: 'bg-rose-900',
    accentFrom: 'from-rose-950',
    accentTo: 'to-rose-800',
  },
  {
    id: 2,
    title: 'Designer Silk Sarees',
    subtitle: 'Where Tradition Meets Modern Glamour',
    cta: 'Explore Sarees',
    link: '/sarees',
    image: '/images/banners/saree-banner.jpg',
    accentBg: 'bg-amber-900',
    accentFrom: 'from-amber-950',
    accentTo: 'to-amber-800',
  },
  {
    id: 3,
    title: 'Embroidered Salwar Suits',
    subtitle: 'Graceful Silhouettes in Quality Fabrics',
    cta: 'View Suits',
    link: '/suits',
    image: '/images/banners/salwar-banner.jpg',
    accentBg: 'bg-pink-900',
    accentFrom: 'from-pink-950',
    accentTo: 'to-pink-800',
  },
  {
    id: 4,
    title: 'Wedding Lehenga Choli',
    subtitle: 'Regal Designs for the Modern Bride',
    cta: 'Shop Lehengas',
    link: '/lehengas',
    image: '/images/banners/festival-banner.jpg',
    accentBg: 'bg-fuchsia-900',
    accentFrom: 'from-fuchsia-950',
    accentTo: 'to-fuchsia-800',
  },
  {
    id: 5,
    title: 'Festive Ready-to-Wear',
    subtitle: 'Stunning Outfits for Celebrations',
    cta: 'Shop Festive',
    link: '/collections',
    image: '/images/banners/new-arrivals-banner.jpg',
    accentBg: 'bg-emerald-900',
    accentFrom: 'from-emerald-950',
    accentTo: 'to-emerald-800',
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
      {/* ====== SPLIT LAYOUT — product showcase with gradient background ====== */}
      <div className={`relative w-full overflow-hidden bg-gradient-to-br ${slide.accentFrom} ${slide.accentTo}`}>
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center min-h-[55vh] sm:min-h-[60vh] lg:min-h-[70vh]">
          {/* Text Side */}
          <div className="w-full md:w-[50%] py-10 md:py-14 lg:py-20 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-sm text-white text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-4 rounded-sm border border-white/10">
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

          {/* Image Side — product image displayed fully without any cropping */}
          <div className="w-full md:w-[50%] flex items-center justify-center py-6 md:py-10 lg:py-16">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={slide.image}
                alt={slide.title}
                className="max-h-[55vh] md:max-h-[60vh] lg:max-h-[70vh] w-auto max-w-full object-contain drop-shadow-2xl rounded-sm"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
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
          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/25 hover:border-white/60 bg-black/25 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-3 lg:right-6 z-20">
        <button
          onClick={nextSlide}
          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/25 hover:border-white/60 bg-black/25 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
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
