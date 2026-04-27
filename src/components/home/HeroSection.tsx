import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroLehengaImg from '@/assets/hero-lehenga.jpg';
import heroSareeImg from '@/assets/hero-saree.jpg';
import heroSuitImg from '@/assets/hero-suit.jpg';
import heroMenswearImg from '@/assets/hero-menswear.jpg';
import heroFestiveImg from '@/assets/hero-festive.jpg';

const heroSlides = [
  {
    id: 1,
    title: 'Bridal Lehenga Collection',
    subtitle: 'Beautiful Styles for Your Special Day',
    cta: 'Shop Bridal Lehengas',
    link: '/lehengas',
    image: heroLehengaImg,
    bg: 'bg-gradient-to-br from-rose-50 via-rose-100/50 to-white',
    accentBg: 'bg-rose-800',
  },
  {
    id: 2,
    title: 'Elegant Drape Sarees',
    subtitle: 'Where Tradition Meets Modern Glamour',
    cta: 'Explore Sarees',
    link: '/sarees',
    image: heroSareeImg,
    bg: 'bg-gradient-to-br from-purple-50 via-purple-100/50 to-white',
    accentBg: 'bg-purple-800',
  },
  {
    id: 3,
    title: 'Embroidered Salwar Suits',
    subtitle: 'Graceful Silhouettes in Quality Fabrics',
    cta: 'View Suits',
    link: '/suits',
    image: heroSuitImg,
    bg: 'bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-white',
    accentBg: 'bg-emerald-800',
  },
  {
    id: 4,
    title: 'Menswear Indo-Western',
    subtitle: 'Regal Sherwanis & Modern Indo-Western',
    cta: 'Shop Menswear',
    link: '/menswear',
    image: heroMenswearImg,
    bg: 'bg-gradient-to-br from-amber-50 via-amber-100/50 to-white',
    accentBg: 'bg-amber-800',
  },
  {
    id: 5,
    title: 'Festive Collection',
    subtitle: 'Beautiful Sarees for Celebrations & Beyond',
    cta: 'Shop Festive',
    link: '/collections',
    image: heroFestiveImg,
    bg: 'bg-gradient-to-br from-pink-50 via-pink-100/50 to-white',
    accentBg: 'bg-pink-800',
  },
];

const AUTOPLAY_MS = 5000;

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
      className={`relative transition-colors duration-700 ${slide.bg}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center min-h-[70vh] sm:min-h-[80vh] lg:min-h-[85vh]">
          
          {/* Left: Text Content */}
          <div className="w-full lg:w-[42%] pt-6 pb-8 lg:py-12 flex flex-col justify-center z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                {/* Label */}
                <span className={`inline-block px-3 py-1 ${slide.accentBg} text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase mb-5 rounded-sm`}>
                  New Collection
                </span>

                {/* Subtitle */}
                <p className="text-sm sm:text-base tracking-[0.1em] uppercase text-muted-foreground mb-3 font-light">
                  {slide.subtitle}
                </p>

                {/* Title */}
                {currentSlide === 0 ? (
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] mb-6 leading-tight text-foreground">
                    LuxeMia: Your destination for affordable Indian ethnic wear
                  </h1>
                ) : (
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] mb-6 leading-tight text-foreground">
                    {slide.title}
                  </h2>
                )}

                {/* CTA */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Button
                    asChild
                    size="lg"
                    className={`${slide.accentBg} hover:opacity-90 text-white font-medium tracking-wide px-8 py-6 text-sm sm:text-base rounded-sm`}
                  >
                    <Link to={slide.link}>{slide.cta}</Link>
                  </Button>
                  <Link
                    to="/collections"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    View All Collections
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-foreground/20 hover:border-foreground/50 flex items-center justify-center transition-all duration-300 group"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-foreground/20 hover:border-foreground/50 flex items-center justify-center transition-all duration-300 group"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <span className="text-xs text-muted-foreground tracking-widest ml-2">
                {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Right: Product Image - shows full product without cropping */}
          <div className="w-full lg:w-[58%] flex items-center justify-center py-4 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full flex items-center justify-center"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full max-h-[70vh] sm:max-h-[75vh] lg:max-h-[82vh] object-contain object-center drop-shadow-2xl"
                  fetchPriority="high"
                  decoding="async"
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dot Indicators - bottom center on mobile, left side on desktop */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 items-center lg:hidden">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-foreground'
                : 'w-2 bg-foreground/25 hover:bg-foreground/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group flex items-center gap-3 transition-all duration-300"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`h-0.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-10 bg-foreground'
                : 'w-5 bg-foreground/25 group-hover:bg-foreground/40 group-hover:w-7'
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
