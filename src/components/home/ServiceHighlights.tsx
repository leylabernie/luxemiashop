import { Truck, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Truck,
    title: 'Worldwide Shipping',
    description: 'Free shipping on orders over $500',
  },
  {
    icon: ShieldCheck,
    title: 'Premium Quality',
    description: 'Handcrafted with finest materials',
  },
  {
    icon: Sparkles,
    title: 'Custom Styling',
    description: 'Personalized styling assistance',
  },
  {
    icon: Lock,
    title: 'Secure Checkout',
    description: '100% secure payment gateway',
  },
];

const ServiceHighlights = () => {
  return (
    <section className="border-b border-border/50 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 lg:gap-4"
            >
              <div className="flex-shrink-0 p-2.5 lg:p-3 rounded-full bg-secondary/50">
                <service.icon className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm lg:text-base font-medium text-foreground">
                  {service.title}
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground font-light">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;
