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
  secondaryCta?: string;
  secondaryLink?: string;
  image: string;
  alt: string;
  tag: string;
  bgGradient: string;
  accent: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    tag: 'Indian Ethnic Wear',
    title: 'Affordable Indian Ethnic Wear for Every Celebration',
    subtitle: 'Shop beautiful sarees, lehengas, and salwar suits at fair prices. Accessible elegance with standard sizing and custom options.',},{find:
    cta: 'Shop New Arrivals',
    link: '/new-arrivals',
    secondaryCta: 'Shop Wedding Styles',
    secondaryLink: '/collections/wedding-lehengas',
    image: '/images/banners/luxemia_banner_01_premium_occasionwear_real_products.png',
    alt: 'LuxeMia premium occasionwear real product banner',
    bgGradient: 'linear-gradient(135deg, #2a0919 0%, #5a1f37 48%, #9d6f42 100%)',
    accent: '#f6dfb7',
  },
  {
    id: 2,
    tag: 'Saree Edit',
    title: 'Ready-to-Wear Sarees Made for Easy Celebration Dressing',
    subtitle: 'Pre-stitched saree styles designed for weddings, parties, festive gatherings, and South Asian celebrations.',
    cta: 'Shop Saree Styles',
    link: '/sarees',
    image: '/images/banners/luxemia_banner_02_wedding_suit_edit_real_products.png',
    alt: 'LuxeMia wedding suit edit real product banner',
    bgGradient: 'linear-gradient(135deg, #06241d 0%, #174738 52%, #b99052 100%)',
    accent: '#f4e7c7',
  },
  {
    id: 3,
    tag: 'Suit Edit',
    title: 'Elegant Salwar Suits for Weddings & Festivals',
    subtitle: 'Explore beautiful salwar kameez, anarkali suits, and sharara sets at accessible prices for every occasion.',}],path:
    cta: 'Shop Salwar Suits',
    link: '/collections/salwar-kameez',
    image: '/images/banners/luxemia_banner_03_designer_saree_real_product.png',
    alt: 'LuxeMia designer saree real product banner',
    bgGradient: 'linear-gradient(135deg, #10172e 0%, #29405f 50%, #8fb5c8 100%)',
    accent: '#e5f2f8',
  },
  {
    id: 4,
    tag: 'Men\'s Ethnic Wear',
    title: 'Men\'s Kurta Pajama & Festive Ethnic Sets',
    subtitle: 'Shop kurta pajama sets, jacket styles, and sherwani-inspired looks for weddings, Eid, Diwali, and family celebrations.',
    cta: 'Shop Men\'s Styles',
    link: '/menswear',
    secondaryCta: 'Shop Kurta Sets',
    secondaryLink: '/collections/kurta-sets',
    image: '/images/banners/luxemia_banner_04_high_value_festive_picks_real_products.png',
    alt: 'LuxeMia high-value festive picks real product banner',
    bgGradient: 'linear-gradient(135deg, #17121f 0%, #42324c 48%, #b0875b 100%)',
    accent: '#f5dfbd',
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
  const optimizedSlideImage = getOptimizedImage(slide.image, 'hero');
  const webpSlideImage = /\.jpe?g(\?|$)/i.test(optimizedSlideImage)
    ? optimizedSlideImage.replace(/\.jpe?g(\?|$)/i, '.webp$1')
    : null;

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="relative w-full overflow-hidden"
          style={{ background: slide.bgGradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/25 to-transparent" />

          <div className="container mx-auto px-4 lg:px-8">
            <div className="relative flex min-h-[58vh] flex-col items-center gap-4 md:min-h-[62vh] md:flex-row md:gap-8 lg:min-h-[72vh]">
              <div className="z-10 w-full py-10 md:w-[48%] md:py-14 lg:py-20">
                <span
                  className="inline-block rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/90 backdrop-blur-sm sm:text-xs"
                  style={{ boxShadow: `0 0 0 1px ${slide.accent}22` }}
                >
                  {slide.tag}
                </span>
                <h2 className="mt-5 font-serif text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  {slide.title}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg lg:text-xl">
                  {slide.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="rounded-sm bg-white px-8 py-6 text-xs font-medium uppercase tracking-[0.18em] text-foreground shadow-[0_18px_40px_rgba(0,0,0,0.22)] hover:bg-white/90 sm:text-sm">
                    <Link to={slide.link}>{slide.cta}</Link>
                  </Button>
                  {slide.secondaryCta && slide.secondaryLink && (
                    <Button asChild size="lg" variant="outline" className="rounded-sm border-white/55 bg-white/10 px-8 py-6 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:text-sm">
                      <Link to={slide.secondaryLink}>{slide.secondaryCta}</Link>
                    </Button>
                  )}
                </div>
                <p className="mt-4 max-w-xl text-xs uppercase tracking-[0.18em] text-white/65">
                  Standard sizes and custom measurement options available on select styles
                </p>
              </div>

              <motion.div
                className="flex w-full items-center justify-center py-6 md:w-[52%] md:py-8 lg:py-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative flex w-full items-center justify-center">
                  <div className="absolute inset-x-8 bottom-2 h-16 rounded-full bg-black/25 blur-2xl" />
                  <picture className="relative">
                    {webpSlideImage && (
                      <source
                        srcSet={webpSlideImage}
                        type="image/webp"
                      />
                    )}
                    <img
                      src={optimizedSlideImage}
                      alt={slide.alt}
                      className="max-h-[48vh] w-auto object-contain drop-shadow-2xl sm:max-h-[58vh] lg:max-h-[70vh]"
                      fetchPriority="high"
                      decoding="async"
                      loading="eager"
                    />
                  </picture>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute left-3 top-1/2 z-20 -translate-y-1/2 lg:left-8">
        <button
          onClick={prevSlide}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/25 lg:h-12 lg:w-12"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
      </div>
      <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2 lg:right-8">
        <button
          onClick={nextSlide}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/25 lg:h-12 lg:w-12"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'h-2 w-6 bg-white'
                : 'h-2 w-2 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
