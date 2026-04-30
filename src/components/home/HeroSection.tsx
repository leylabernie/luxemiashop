import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const heroSlides = [
  {
    id: 1,
    title: 'Bridal Lehenga Collection',
    subtitle: 'Beautiful Styles for Your Special Day',
    cta: 'Shop Bridal Lehengas',
    link: '/lehengas',
    image: '/images/banners/hero-banner.jpg',
    accentBg: 'bg-rose-800',
  },
  {
    id: 2,
    title: 'Elegant Drape Sarees',
    subtitle: 'Where Tradition Meets Modern Glamour',
    cta: 'Explore Sarees',
    link: '/sarees',
    image: '/images/banners/saree-banner.jpg',
    accentBg: 'bg-purple-800',
  },
  {
    id: 3,
    title: 'Embroidered Salwar Suits',
    subtitle: 'Graceful Silhouettes in Quality Fabrics',
    cta: 'View Suits',
    link: '/suits',
    image: '/images/banners/salwar-banner.jpg',
    accentBg: 'bg-emerald-800',
  },
  {
    id: 4,
    title: 'Menswear Indo-Western',
    subtitle: 'Regal Sherwanis & Modern Indo-Western',
    cta: 'Shop Menswear',
    link: '/menswear',
    image: '/images/banners/festival-banner.jpg',
    accentBg: 'bg-amber-800',
  },
  {
    id: 5,
    title: 'Festive Collection',
    subtitle: 'Beautiful Sarees for Celebrations & Beyond',
    cta: 'Shop Festive',
    link: '/collections',
    image: '/images/banners/new-arrivals-banner.jpg',
    accentBg: 'bg-pink-800',
  },
];

const AUTOPLAY_MS = 4000;

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Autoplay using setInterval for more reliable auto-advancing
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
      className="relative transition-colors duration-700"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner container — wide aspect ratio like theethnicworld.com (≈16:5.5) */}
      <div className="relative w-full aspect-[16/5] sm:aspect-[16/5.5] md:aspect-[16/6] overflow-hidden">
        {/* Full-width background image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            fetchPriority="high"
            decoding="async"
            loading="eager"
          />
        </AnimatePresence>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10 lg:from-black/65 lg:via-black/30 lg:to-transparent" />
        {/* Bottom gradient for extra depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Text Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8 h-full flex items-center">
          <div className="w-full lg:w-[45%] py-4 lg:py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Label */}
                <span className={`inline-block px-3 py-1 ${slide.accentBg} text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase mb-3 rounded-sm`}>
                  New Collection
                </span>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm tracking-[0.1em] uppercase text-white/70 mb-2 font-light">
                  {slide.subtitle}
                </p>

                {/* Title */}
                {currentSlide === 0 ? (
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-4 leading-tight text-white">
                    LuxeMia: Your destination for affordable Indian ethnic wear
                  </h1>
                ) : (
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-4 leading-tight text-white">
                    {slide.title}
                  </h2>
                )}

                {/* CTA */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Button
                    asChild
                    size="lg"
                    className={`${slide.accentBg} hover:opacity-90 text-white font-medium tracking-wide px-6 py-5 text-xs sm:text-sm rounded-sm`}
                  >
                    <Link to={slide.link}>{slide.cta}</Link>
                  </Button>
                  <Link
                    to="/collections"
                    className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors underline underline-offset-4"
                  >
                    View All Collections
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <div className="flex items-center gap-3 mt-4 lg:mt-5">
              <button
                onClick={prevSlide}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/30 hover:border-white/60 flex items-center justify-center transition-all duration-300 group"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={nextSlide}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/30 hover:border-white/60 flex items-center justify-center transition-all duration-300 group"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
              <span className="text-[10px] sm:text-xs text-white/60 tracking-widest ml-1">
                {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dot Indicators - bottom center on all screens */}
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
