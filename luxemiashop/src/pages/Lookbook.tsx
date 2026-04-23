import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import LookbookSection from '@/components/lookbook/LookbookSection';
import LazyImage from '@/components/ui/LazyImage';
import { useLookbookProducts, LOOKBOOK_COLLECTIONS } from '@/hooks/useLookbookProducts';

import heroMain from '@/assets/lookbook/hero-main.jpg';

const Lookbook = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(heroScroll, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.1]);

  const { products, isLoading, error } = useLookbookProducts();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Lookbook — LuxeMia"
        description="Explore the LuxeMia lookbook. Curated styling inspiration featuring real products — wedding lehengas, sherwanis, sharara suits, and festive ethnic wear."
        canonical="https://luxemia.shop/lookbook"
      />
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/30 to-foreground/50 z-10" />
          <LazyImage src={heroMain} alt="LuxeMia Lookbook 2026" className="w-full h-full" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 text-center text-background px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs tracking-luxury uppercase mb-6 text-background/80"
          >
            Spring / Summer 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-serif text-6xl lg:text-9xl mb-8 leading-tight"
          >
            The <span className="italic font-light">Art</span> of <br />
            <span className="tracking-widest uppercase text-3xl lg:text-5xl font-light">Ethereal Grace</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm lg:text-base font-light max-w-md mx-auto text-background/90"
          >
            Styled looks featuring our latest ethnic wear — shop directly from the lookbook
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-background/80"
          >
            <span className="text-xs tracking-luxury uppercase">Scroll to Explore</span>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Lookbook Sections */}
      <main>
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-32">
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {!isLoading &&
          !error &&
          LOOKBOOK_COLLECTIONS.map((collection, index) => {
            const sectionProducts = products[collection.id] || [];
            if (sectionProducts.length === 0) return null;
            return (
              <LookbookSection
                key={collection.id}
                title={collection.title}
                subtitle={collection.subtitle}
                description={collection.description}
                products={sectionProducts}
                index={index}
                layout={index % 2 === 0 ? 'left' : 'right'}
              />
            );
          })}
      </main>

      <Footer />
    </div>
  );
};

export default Lookbook;
