import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Headphones, Shield, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Package,
    title: 'Quality Packaging',
    description: 'Every order is carefully packed to ensure your outfit arrives in perfect condition.',
  },
  {
    icon: Headphones,
    title: 'Real Customer Support',
    description: 'Our team responds to your questions and helps with sizing, returns, and orders.',
  },
  {
    icon: Shield,
    title: 'What You See Is What You Get',
    description: 'We provide accurate descriptions and real photos so there are no surprises.',
  },
  {
    icon: Truck,
    title: 'Reliable Shipping',
    description: 'Trackable worldwide delivery with standard and express options available.',
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
              Our Promise
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl mb-6">
              Honest Service, Real Value
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              At LuxeMia, we keep it straightforward. We source beautiful Indian ethnic wear 
              from established suppliers and manufacturers, and we sell it at fair prices. No 
              inflated claims, no fake stories — just good products and honest service.
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
              <Link to="/brand-story" className="flex items-center gap-2">
                Read Our Story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-background rounded-sm p-8 lg:p-10 shadow-sm"
          >
            <h3 className="font-serif text-2xl mb-8 text-center">What We Stand For</h3>

            <div className="grid grid-cols-1 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We source from India's well-known textile regions and established manufacturers. 
                  Our focus is on offering well-made ethnic wear at prices that work for everyday customers.
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are committed to being upfront about what we sell. If something is machine-made, 
                  we say so. If it is art silk, not pure silk, we say that too.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-center text-sm text-muted-foreground italic">
                "Good clothes, honest prices, and a team that actually answers your questions."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilityBanner;
