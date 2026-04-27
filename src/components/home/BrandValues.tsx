import { motion } from 'framer-motion';
import { Gem, Leaf, Heart, Award } from 'lucide-react';

const values = [
  {
    icon: Gem,
    title: 'Curated Selection',
    description: 'Each piece is carefully selected from India\'s textile hubs for quality and style.',
  },
  {
    icon: Leaf,
    title: 'Honest Value',
    description: 'Quality Indian ethnic wear at fair prices, with no misleading claims.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Real support, real photos, and accurate descriptions so you know what you get.',
  },
  {
    icon: Award,
    title: 'Quality Checked',
    description: 'Every item is inspected before shipping to ensure it meets our standards.',
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
