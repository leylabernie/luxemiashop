import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Headphones, Shield, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Package,
    title: 'Boutique Ethnic Styles',
    description: 'Shop sarees, lehengas, salwar suits, and men\'s ethnic wear selected for celebration dressing.',
  },
  {
    icon: Headphones,
    title: 'Pre-Purchase Support',
    description: 'Our team can help with sizing questions, product details, and occasion styling before you order.',
  },
  {
    icon: Shield,
    title: 'Clear Product Details',
    description: 'We keep product descriptions practical so fabrics, styles, and fit options are easier to understand.',
  },
  {
    icon: Truck,
    title: 'Wedding & Festival Ready',
    description: 'Find Indian ethnic wear for weddings, Eid, Diwali, parties, and South Asian celebrations.',
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
              At LuxeMia Boutique, we keep shopping straightforward. Browse Indian ethnic wear for
              weddings, festivals, parties, and family celebrations with clear product details,
              practical fit guidance, and secure checkout.
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
                  We focus on polished Indian and South Asian fashion for weddings, festivals,
                  parties, and family celebrations, with category pages that make browsing easier.
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are committed to being upfront about what we sell. If an item has standard sizing,
                  custom measurement options, art silk, or other key details, we aim to make that clear.
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
