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
    accent: 'from-rose-900/60 via-rose-900/30 to-transparent',
  },
  {
    id: 2,
    title: 'Designer Drape Sarees',
    subtitle: 'Where Tradition Meets Modern Glamour',
    cta: 'Explore Sarees',
    link: '/sarees',
    image: heroSareeImg,
    accent: 'from-purple-900/60 via-purple-900/30 to-transparent',
  },
  {
    id: 3,
    title: 'Embroidered Salwar Suits',
    subtitle: 'Graceful Silhouettes in Premium Organza Silk',
    cta: 'View Suits',
    link: '/suits',
    image: heroSuitImg,
    accent: 'from-emerald-900/60 via-emerald-900/30 to-transparent',
  },
  {
    id: 4,
    title: 'Menswear Indo-Western',
    subtitle: 'Regal Sherwanis & Modern Indo-Western',
    cta: 'Shop Menswear',
    link: '/menswear',
    image: heroMenswearImg,
    accent: 'from-amber-900/60 via-amber-900/30 to-transparent',
  },
  {
    id: 5,
    title: 'Festive Designer Edit',
    subtitle: 'Premium Sarees for Celebrations & Beyond',
    cta: 'Shop Festive',
    link: '/collections',
    image: heroFestiveImg,
    accent: 'from-pink-900/60 via-pink-900/30 to-transparent',
  },
];

const AUTOPLAY_INTERVAL = 5000;

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Autoplay with progress tracking
  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      setProgress(pct);
    }, 50);

    const timer = setTimeout(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setProgress(0);
    }, AUTOPLAY_INTERVAL);

    return () => {
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, [currentSlide, isPaused]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setProgress(0);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setProgress(0);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <section
      className="relative h-[70vh] sm:h-[75vh] lg:h-screen overflow-hidden bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image - Full bleed */}
          <div className="w-full h-full">
            <img
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title}
              className="w-full h-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
              loading="eager"
              sizes="100vw"
            />
          </div>

          {/* Gradient Overlay - category-colored */}
          <div className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].accent}`} />
          {/* Dark bottom gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay - positioned at bottom-left like wholesalesalwar */}
      <div className="absolute inset-0 flex items-end pointer-events-none">
        <div className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-28 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl"
            >
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xs sm:text-sm tracking-[0.2em] uppercase mb-3 text-white/80 font-light"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>
              {currentSlide === 0 ? (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight text-white drop-shadow-lg"
                >
                  LuxeMia: Your Destination for Luxury Indian Ethnic Wear & Bridal Attire
                </motion.h1>
              ) : (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-6 leading-tight text-white drop-shadow-lg"
                >
                  {heroSlides[currentSlide].title}
                </motion.h2>
              )}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-foreground hover:bg-white/90 font-medium tracking-wide px-8 py-6 text-sm sm:text-base rounded-sm"
                >
                  <Link to={heroSlides[currentSlide].link}>
                    {heroSlides[currentSlide].cta}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 lg:left-6 right-3 lg:right-6 flex justify-between pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Slide Indicators with Progress Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 items-center">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative h-1 rounded-full transition-all duration-300 overflow-hidden"
            style={{
              width: index === currentSlide ? '48px' : '24px',
              backgroundColor: index === currentSlide ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.25)',
            }}
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Progress fill inside active indicator */}
            {index === currentSlide && (
              <div
                className="absolute inset-0 bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-6 right-4 lg:right-8 text-white/60 text-xs tracking-widest font-light">
        {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
      </div>
    </section>
  );
};

export default HeroSection;
