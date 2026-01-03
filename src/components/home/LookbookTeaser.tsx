import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const lookbookImages = [
  'https://kesimg.b-cdn.net/images/650/2025y/December/59744/Mint-Green-Viscose-Silk-Wedding-Wear-Weaving-Work-Wedding-Saree-Kanchipuram-Couture-3176-B(1).jpg',
  'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Burgundy-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-A(1).jpg',
  'https://kesimg.b-cdn.net/images/650/2025y/December/59570/Lavender-Pure-Net-Bridal-Wear-Heavy-Work-Readymade-Bridal-Lehenga-Choli-RIYAASAT-10242(1).jpg',
  'https://kesimg.b-cdn.net/images/650/2025y/December/59625/Green-Net-Wedding-Wear-Heavy-Work-Lehenga-Choli-Wedding-Wibe-Vol-2-3622-2945-C(1).jpg',
];

const LookbookTeaser = () => {
  return (
    <section className="py-20 lg:py-28">
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
              <div className="aspect-[3/4] overflow-hidden image-reveal bg-muted">
                <img 
                  src={lookbookImages[0]} 
                  alt="Lookbook - Mint Green Saree"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="aspect-square overflow-hidden image-reveal bg-muted">
                <img 
                  src={lookbookImages[1]} 
                  alt="Lookbook - Burgundy Lehenga"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-square overflow-hidden image-reveal bg-muted">
                <img 
                  src={lookbookImages[2]} 
                  alt="Lookbook - Lavender Bridal"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden image-reveal bg-muted">
                <img 
                  src={lookbookImages[3]} 
                  alt="Lookbook - Emerald Lehenga"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
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
              Lookbook 2024
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
