import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Use local assets for reliability
import lookbook1 from '@/assets/lookbook-1.jpg';
import lookbook2 from '@/assets/lookbook-2.jpg';
import lookbook3 from '@/assets/lookbook-3.jpg';
import lookbook4 from '@/assets/lookbook-4.jpg';

const lookbookImages = [
  { src: lookbook1, alt: 'Elegant Designer Saree' },
  { src: lookbook2, alt: 'Bridal Lehenga Collection' },
  { src: lookbook3, alt: 'Wedding Couture' },
  { src: lookbook4, alt: 'Festive Ensemble' },
];

const LookbookTeaser = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-lg">
                <img 
                  src={lookbookImages[0].src} 
                  alt={lookbookImages[0].alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm shadow-lg">
                <img 
                  src={lookbookImages[1].src} 
                  alt={lookbookImages[1].alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-square overflow-hidden rounded-sm shadow-lg">
                <img 
                  src={lookbookImages[2].src} 
                  alt={lookbookImages[2].alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-lg">
                <img 
                  src={lookbookImages[3].src} 
                  alt={lookbookImages[3].alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:pl-8"
          >
            <p className="text-xs tracking-luxury uppercase text-foreground/60 mb-4">
              Lookbook 2026
            </p>
            <h2 className="font-serif text-3xl lg:text-5xl mb-6 leading-tight">
              The Art of 
              <br />
              <span className="italic">Ethereal Grace</span>
            </h2>
            <p className="text-foreground/60 font-light leading-relaxed mb-8 max-w-md">
              Discover our latest editorial featuring exquisite pieces that blend traditional 
              craftsmanship with contemporary silhouettes. Each garment tells a story of 
              heritage and artistry.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/lookbook" className="group">
                Explore Lookbook
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LookbookTeaser;
