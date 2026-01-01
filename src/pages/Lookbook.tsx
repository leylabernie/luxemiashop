import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LookbookSection from '@/components/lookbook/LookbookSection';
import { ArrowDown } from 'lucide-react';

const lookbookData = [
  {
    title: 'Whispers of Dawn',
    subtitle: 'Chapter I',
    description: 'As morning light cascades through ancient jharokhas, silk unfurls like petals awakening to the sun. Each thread carries stories of master artisans who have perfected their craft across generations.',
    imagePosition: 'left' as const,
    hotspots: [
      { x: 35, y: 40, productName: 'Chanderi Silk Saree', productPrice: '₹24,500', productHandle: 'chanderi-silk-saree' },
      { x: 60, y: 65, productName: 'Pearl Kamarbandh', productPrice: '₹8,900', productHandle: 'pearl-kamarbandh' },
    ]
  },
  {
    title: 'The Golden Hour',
    subtitle: 'Chapter II',
    description: 'When evening paints the sky in hues of amber and rose, our lehengas catch the light like liquid gold. Zardozi work that has adorned royalty for centuries now graces the modern bride.',
    imagePosition: 'full' as const,
    hotspots: [
      { x: 45, y: 35, productName: 'Zardozi Lehenga Set', productPrice: '₹1,85,000', productHandle: 'zardozi-lehenga' },
      { x: 70, y: 55, productName: 'Heritage Maang Tikka', productPrice: '₹12,500', productHandle: 'heritage-maang-tikka' },
    ]
  },
  {
    title: 'Monsoon Reverie',
    subtitle: 'Chapter III',
    description: 'The rhythm of rain against marble courtyards. Indigo and emerald dance together in our handwoven collection, each piece a meditation on nature\'s infinite palette.',
    imagePosition: 'right' as const,
    hotspots: [
      { x: 40, y: 50, productName: 'Indigo Block Print Suit', productPrice: '₹32,000', productHandle: 'indigo-block-suit' },
      { x: 25, y: 70, productName: 'Jadau Chandbali', productPrice: '₹45,000', productHandle: 'jadau-chandbali' },
    ]
  },
  {
    title: 'Midnight Bloom',
    subtitle: 'Chapter IV',
    description: 'Under starlit canopies, velvet meets vintage. Our evening collection speaks of quiet opulence—pieces that command attention through whispers, not shouts.',
    imagePosition: 'left' as const,
    hotspots: [
      { x: 50, y: 45, productName: 'Velvet Anarkali', productPrice: '₹58,000', productHandle: 'velvet-anarkali' },
      { x: 30, y: 75, productName: 'Polki Choker Set', productPrice: '₹95,000', productHandle: 'polki-choker' },
    ]
  },
  {
    title: 'Eternal Grace',
    subtitle: 'Chapter V',
    description: 'The finale—where tradition embraces tomorrow. Our bridal collection represents the culmination of a journey through India\'s textile heritage, reimagined for the contemporary woman.',
    imagePosition: 'full' as const,
    hotspots: [
      { x: 50, y: 40, productName: 'Heritage Bridal Lehenga', productPrice: '₹3,25,000', productHandle: 'heritage-bridal' },
      { x: 65, y: 60, productName: 'Kundan Rani Haar', productPrice: '₹1,45,000', productHandle: 'kundan-rani-haar' },
      { x: 35, y: 70, productName: 'Bridal Haath Phool', productPrice: '₹28,000', productHandle: 'bridal-haath-phool' },
    ]
  }
];

const Lookbook = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroY = useTransform(heroScroll, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.1]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/30 to-foreground/50 z-10" />
          <div className="w-full h-full bg-card flex items-center justify-center">
            <span className="text-6xl text-foreground/20 font-serif">Lookbook 2024</span>
          </div>
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
            Spring / Summer 2024
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-serif text-5xl lg:text-8xl mb-6"
          >
            Ethereal <br />
            <span className="italic">Narratives</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm lg:text-base font-light max-w-md mx-auto text-background/90"
          >
            A visual journey through India's textile heritage, 
            reimagined for the modern woman
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
        {lookbookData.map((section, index) => (
          <LookbookSection
            key={index}
            {...section}
            index={index}
          />
        ))}
      </main>

      {/* Credits Section */}
      <section className="py-24 lg:py-32 bg-card">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs tracking-luxury uppercase text-foreground/60 mb-6"
          >
            Credits
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl lg:text-4xl mb-12"
          >
            Behind the Scenes
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-sm"
          >
            <div>
              <p className="text-foreground/40 uppercase tracking-editorial text-xs mb-2">Creative Direction</p>
              <p className="font-light">Vasantam Studio</p>
            </div>
            <div>
              <p className="text-foreground/40 uppercase tracking-editorial text-xs mb-2">Photography</p>
              <p className="font-light">Aarav Sharma</p>
            </div>
            <div>
              <p className="text-foreground/40 uppercase tracking-editorial text-xs mb-2">Styling</p>
              <p className="font-light">Priya Mehta</p>
            </div>
            <div>
              <p className="text-foreground/40 uppercase tracking-editorial text-xs mb-2">Location</p>
              <p className="font-light">Jaipur, India</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Lookbook;
