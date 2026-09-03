import { motion } from 'framer-motion';
import { Gem, Leaf, Heart, Award } from 'lucide-react';

const values = [
  {
    icon: Gem,
    title: 'Listing-Specific Details',
    description: 'Review the available fabric, work, size, and included-piece information on each product page.',
  },
  {
    icon: Leaf,
    title: 'Clear Shipping Cost',
    description: 'U.S. standard shipping is $14.99 below $199 and free at $199 and above.',
  },
  {
    icon: Heart,
    title: 'Pre-Order Support',
    description: 'Contact LuxeMia before ordering with product, sizing, or policy questions.',
  },
  {
    icon: Award,
    title: 'Published Policies',
    description: 'Final-sale, cancellation, and shipping-damage terms are available before checkout.',
  },
];

const BrandValues = () => {
  return (
    <section className="py-16 lg:py-20 bg-cream/30 border-y border-border/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 border border-foreground/20 rounded-full">
                <value.icon className="w-5 h-5 text-foreground/70" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-base lg:text-lg mb-2">{value.title}</h3>
              <p className="text-xs lg:text-sm text-foreground/60 font-light leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandValues;
