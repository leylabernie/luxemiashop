import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEATURED_CATEGORY_PRODUCTS } from '@/config/featuredCategoryProducts';

const featuredLooks = [
  FEATURED_CATEGORY_PRODUCTS.sarees,
  FEATURED_CATEGORY_PRODUCTS.lehengas,
  FEATURED_CATEGORY_PRODUCTS.suits,
  FEATURED_CATEGORY_PRODUCTS.jewelry,
];

const LookbookTeaser = () => {
  return (
    <section className="bg-[#f5ebe5] py-20 lg:py-28">
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
                  src={featuredLooks[0].image}
                  alt={featuredLooks[0].alt}
                  width={300} height={400}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm shadow-lg">
                <img 
                  src={featuredLooks[1].image}
                  alt={featuredLooks[1].alt}
                  width={300} height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-square overflow-hidden rounded-sm shadow-lg">
                <img 
                  src={featuredLooks[2].image}
                  alt={featuredLooks[2].alt}
                  width={300} height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-lg">
                <img 
                  src={featuredLooks[3].image}
                  alt={featuredLooks[3].alt}
                  width={300} height={400}
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
            <p className="mb-4 text-xs uppercase tracking-luxury text-[#a96f72]">
              The LuxeMia edit
            </p>
            <h2 className="mb-6 font-serif text-3xl leading-tight text-[#352629] lg:text-5xl">
              A closer look at the pieces made for your next celebration.
            </h2>
            <p className="mb-8 max-w-md font-light leading-relaxed text-[#765f5b]">
              Explore real LuxeMia pieces across sarees, lehengas, occasion sets, and jewelry. Let colour, texture, and craft guide you toward a look that feels unmistakably yours.
            </p>
            <Button variant="outline" size="lg" asChild className="border-[#c99a94] bg-[#fffaf6] text-[#493235] hover:bg-[#f1dbd5]">
              <Link to="/collections" className="group">
                Explore the collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LookbookTeaser;
