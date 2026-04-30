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
    accentColor: 'bg-slate-700',
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
      {/* Full-width banner with dark overlay on left, product image on right */}
      <div className="relative w-full overflow-hidden bg-black min-h-[60vh] sm:min-h-[65vh] lg:min-h-[75vh]">
        {/* Background: product image positioned on the right side */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-center md:object-right lg:object-center"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            fetchPriority="high"
            decoding="async"
            loading="eager"
          />
        </AnimatePresence>

        {/* Dark gradient overlay — ensures white text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20 lg:from-black/80 lg:via-black/50 lg:to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* Text Content — left aligned */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8 h-full flex items-center min-h-[60vh] sm:min-h-[65vh] lg:min-h-[75vh]">
          <div className="w-full lg:w-[55%] py-8 md:py-12 lg:py-16">
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
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight text-white drop-shadow-lg">
                    {slide.title}
                  </h1>
                ) : (
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight text-white drop-shadow-lg">
                    {slide.title}
                  </h2>
                )}
                <div className="flex items-center gap-5 flex-wrap">
                  <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90 font-medium tracking-wider px-8 py-6 text-xs sm:text-sm rounded-sm shadow-lg">
                    <Link to={slide.link}>{slide.cta}</Link>
                  </Button>
                  <Link to="/collections" className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors underline underline-offset-4 tracking-wide drop-shadow">
                    View All Collections
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 lg:left-6 z-20">
        <button
          onClick={prevSlide}
          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/30 hover:border-white/60 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-3 lg:right-6 z-20">
        <button
          onClick={nextSlide}
          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/30 hover:border-white/60 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
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
