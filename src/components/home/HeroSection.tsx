import { useState, useEffect, useCallback } from 'react';
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
    subtitle: 'Handcrafted Elegance for Your Special Day',
    cta: 'Shop Bridal Lehengas',
    link: '/lehengas',
    image: heroLehengaImg,
    bg: 'bg-gradient-to-br from-rose-50 via-rose-100/50 to-white',
    accent: 'text-rose-800',
    accentBg: 'bg-rose-800',
  },
  {
    id: 2,
    title: 'Designer Drape Sarees',
    subtitle: 'Where Tradition Meets Modern Glamour',
    cta: 'Explore Sarees',
    link: '/sarees',
    image: heroSareeImg,
    bg: 'bg-gradient-to-br from-purple-50 via-purple-100/50 to-white',
    accent: 'text-purple-800',
    accentBg: 'bg-purple-800',
  },
  {
    id: 3,
    title: 'Embroidered Salwar Suits',
    subtitle: 'Graceful Silhouettes in Premium Organza Silk',
    cta: 'View Suits',
    link: '/suits',
    image: heroSuitImg,
    bg: 'bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-white',
    accent: 'text-emerald-800',
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
    accent: 'text-amber-800',
    accentBg: 'bg-amber-800',
  },
  {
    id: 5,
    title: 'Festive Designer Edit',
    subtitle: 'Premium Sarees for Celebrations & Beyond',
    cta: 'Shop Festive',
    link: '/collections',
    image: heroFestiveImg,
    bg: 'bg-gradient-to-br from-pink-50 via-pink-100/50 to-white',
    accent: 'text-pink-800',
    accentBg: 'bg-pink-800',
  },
];

const AUTOPLAY_INTERVAL = 6000;

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearTimeout(timer);
  }, [currentSlide, isPaused]);

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
      className={`relative overflow-hidden transition-colors duration-700 ${slide.bg}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Split Layout: Text Left | Image Right */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center min-h-[70vh] sm:min-h-[75vh] lg:min-h-screen max-h-[900px]">
          
          {/* Left: Text Content */}
          <div className="w-full lg:w-1/2 pt-16 pb-8 lg:py-0 flex flex-col justify-center z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Small label */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className={`inline-block px-3 py-1 ${slide.accentBg} text-white text-xs tracking-[0.15em] uppercase mb-5 rounded-sm`}
                >
                  New Collection
                </motion.div>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-sm sm:text-base tracking-[0.1em] uppercase text-muted-foreground mb-3 font-light"
                >
                  {slide.subtitle}
                </motion.p>

                {/* Title */}
                {currentSlide === 0 ? (
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] mb-6 leading-tight text-foreground"
                  >
                    LuxeMia: Your Destination for Luxury Indian Ethnic Wear
                  </motion.h1>
                ) : (
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] mb-6 leading-tight text-foreground"
                  >
                    {slide.title}
                  </motion.h2>
                )}

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <Button
                    asChild
                    size="lg"
                    className={`${slide.accentBg} hover:opacity-90 text-white font-medium tracking-wide px-8 py-6 text-sm sm:text-base rounded-sm`}
                  >
                    <Link to={slide.link}>
                      {slide.cta}
                    </Link>
                  </Button>
                  <Link
                    to="/collections"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    View All Collections
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation - Below text */}
            <div className="flex items-center gap-4 mt-10">
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

          {/* Right: Product Image - Full height, no cropping */}
          <div className="w-full lg:w-1/2 h-[50vh] sm:h-[55vh] lg:h-screen max-h-[900px] flex items-end justify-center lg:justify-start relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full w-full flex items-end justify-center"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-auto max-w-full object-contain object-bottom"
                  fetchPriority="high"
                  decoding="async"
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dot Indicators at bottom */}
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

      {/* Desktop Dot Indicators - left side */}
      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-3">
        {heroSlides.map((s, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`group flex items-center gap-3 transition-all duration-300`}
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
