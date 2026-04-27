import { motion } from 'framer-motion';
import { Shield, Truck, RefreshCcw, Headphones } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'Quality Checked',
    description: 'Every item is inspected before it ships to you. We catch issues so you don\'t have to.',
  },
  {
    icon: Truck,
    title: 'Worldwide Delivery',
    description: 'Trackable shipping to the US, UK, Canada, and more with standard and express options.',
  },
  {
    icon: RefreshCcw,
    title: 'Easy Returns',
    description: '7-day return policy on eligible items. We want you to be happy with your purchase.',
  },
  {
    icon: Headphones,
    title: 'Real Support',
    description: 'Have a question about sizing, fabric, or your order? Our team actually responds.',
  },
  {
    title: 'Accurate Descriptions',
    description: 'We tell you exactly what you\'re getting — real fabric info, real measurements, real photos.',
  },
  {
    title: 'Fair Prices',
    description: 'No inflated "original" prices or fake sales. What you see is what things actually cost.',
  },
];

const CustomerStories = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xs tracking-luxury uppercase text-muted-foreground mb-3 block"
          >
            Why Shop With Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-serif text-3xl lg:text-4xl"
          >
            Built on Honesty
          </motion.h2>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card p-6 lg:p-8 border border-border/50"
            >
              {'icon' in reason && reason.icon ? (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <reason.icon className="w-5 h-5 text-primary" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-serif text-lg">✓</span>
                </div>
              )}
              <h3 className="font-medium text-foreground mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerStories;
