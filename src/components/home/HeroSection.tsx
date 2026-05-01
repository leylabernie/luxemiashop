import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getOptimizedImage } from '@/lib/imageUtils';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
  tag: string;
  bgColor: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'Bridal Lehenga',
    subtitle: 'Gadhwal Silk Wedding Collection',
    cta: 'Shop Lehengas',
    link: '/lehengas',
    image: '/images/banners/lehenga-banner.jpg',
    tag: 'Wedding',
    bgColor: '#4a0e2e',
  },
  {
    id: 2,
    title: 'Saree Collection',
    subtitle: 'Satin Silk Festival Wear',
    cta: 'Explore Sarees',
    link: '/sarees',
    image: '/images/banners/saree-banner.jpg',
    tag: 'Festival',
    bgColor: '#0d3b2e',
  },
  {
    id: 3,
    title: 'Designer Suits',
    subtitle: 'Embroidered Party Wear',
    cta: 'View Suits',
    link: '/suits',
    image: '/images/banners/suit-banner.jpg',
    tag: 'New Arrival',
    bgColor: '#1a1a4e',
  },
  {
    id: 4,
    title: 'Groom Sherwani',
    subtitle: 'Hand Embroidery Wedding Wear',
    cta: 'Shop Menswear',
    link: '/menswear',
    image: '/images/banners/menswear-banner.jpg',
    tag: 'Wedding',
    bgColor: '#1e293b',
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

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Inspired by wholesalesalwar.com — clean, wide, product-focused */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="relative w-full overflow-hidden"
          style={{ backgroundColor: slide.bgColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-center min-h-[55vh] sm:min-h-[60vh] lg:min-h-[70vh]">

              {/* LEFT: Category text */}
              <div className="w-full md:w-[48%] py-10 md:py-14 lg:py-20 z-10">
                <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm text-white/90 text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-5 rounded border border-white/10">
                  {slide.tag}
                </span>
                {currentSlide === 0 ? (
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-4 leading-[1.1] text-white">
                    {slide.title}
                  </h1>
                ) : (
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-4 leading-[1.1] text-white">
                    {slide.title}
                  </h2>
                )}
                <p className="text-sm sm:text-base tracking-[0.08em] text-white/60 mb-8 font-light max-w-md">
                  {slide.subtitle}
                </p>
                <div className="flex items-center gap-5 flex-wrap">
                  <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90 font-medium tracking-widest px-10 py-6 text-xs sm:text-sm rounded-none">
                    <Link to={slide.link}>{slide.cta}</Link>
                  </Button>
                </div>
              </div>

              {/* RIGHT: Full product image — no cropping */}
              <div className="w-full md:w-[52%] flex items-center justify-center py-6 md:py-8 lg:py-10">
                <motion.img
                  src={getOptimizedImage(slide.image, 'hero')}
                  alt={slide.title}
                  className="max-h-[55vh] sm:max-h-[60vh] lg:max-h-[70vh] w-auto object-contain rounded-lg drop-shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  fetchPriority="high"
                  decoding="async"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 lg:left-8 z-20">
        <button
          onClick={prevSlide}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-3 lg:right-8 z-20">
        <button
          onClick={nextSlide}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 items-center z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
