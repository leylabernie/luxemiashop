import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, Heart, Users, Recycle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    description: 'We use eco-friendly fabrics and natural dyes to minimize environmental impact.',
  },
  {
    icon: Users,
    title: 'Artisan Communities',
    description: 'Supporting artisan families across India with fair wages and safe working conditions.',
  },
  {
    icon: Heart,
    title: 'Ethical Sourcing',
    description: 'Every material is traced to ensure ethical sourcing and transparent supply chains.',
  },
  {
    icon: Recycle,
    title: 'Plastic-Free Packaging',
    description: 'All orders ship in biodegradable packaging made from recycled materials.',
  },
];

const SustainabilityBanner = () => {
  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs tracking-luxury uppercase text-muted-foreground mb-3">
              Our Commitment
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl mb-6">
              Crafted with Care for People & Planet
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              At LuxeMia, sustainability isn't just a buzzword—it's woven into every thread of our story. 
              We partner directly with artisan communities across India, ensuring fair wages and preserving 
              traditional craftsmanship for generations to come.
            </p>

            {/* Values Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <value.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">{value.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button asChild variant="outline" className="group">
              <Link to="/sustainability" className="flex items-center gap-2">
                Learn About Our Impact
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-background rounded-sm p-8 lg:p-10 shadow-sm"
          >
            <h3 className="font-serif text-2xl mb-8 text-center">Our Commitment</h3>

            <div className="grid grid-cols-1 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our growing network of artisan families across multiple Indian states preserves diverse craft traditions through fair-trade partnerships.
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are working toward using sustainable materials across our collections and have committed to plastic-free packaging for all orders.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-center text-sm text-muted-foreground italic">
                "Every purchase directly supports the livelihoods of skilled artisans and their families."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilityBanner;
