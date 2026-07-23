import { Truck, RefreshCw, Ruler, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Truck,
    title: 'Free Shipping over $350',
    description: 'Tracked delivery to USA, Canada & Australia',
  },
  {
    icon: ShieldCheck,
    title: 'SSL Secure Checkout',
    description: '256-bit encryption & Shopify Pay',
  },
  {
    icon: Ruler,
    title: 'Custom Fitting',
    description: 'Tailored to your measurements — dispatch 5-7 days',
  },
  {
    icon: Clock,
    title: 'Fast Dispatch',
    description: 'Readymade orders dispatched in 3-5 business days',
  },
  {
    icon: RefreshCw,
    title: 'Pre-Purchase Support',
    description: 'WhatsApp & email support before you buy',
  },
  {
    icon: Sparkles,
    title: 'Quality Inspected',
    description: 'Every piece checked before shipping',
  },
];

const ServiceHighlights = () => {
  return (
    <section className="bg-secondary/50 border-y border-border/30">
      <div className="container mx-auto px-4">
        {/* Scrolling banner on mobile, grid on desktop */}
        <div className="hidden lg:block py-5">
          <div className="grid grid-cols-6 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 group cursor-default"
              >
                <div className="flex-shrink-0 p-2 rounded-full bg-background/80 group-hover:bg-background transition-colors">
                  <service.icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-light">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="lg:hidden py-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 min-w-max">
            {services.slice(0, 4).map((service) => (
              <div
                key={service.title}
                className="flex items-center gap-2.5"
              >
                <div className="flex-shrink-0 p-2 rounded-full bg-background/80">
                  <service.icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground whitespace-nowrap">
                    {service.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-light whitespace-nowrap">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;
