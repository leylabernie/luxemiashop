import { Link } from 'react-router-dom';
import { Truck, Ruler, ShieldCheck, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: MapPin,
    title: 'Philadelphia-Based Boutique',
    description: 'USA-based support for Indian ethnic wear shoppers',
    href: '/contact',
  },
  {
    icon: Truck,
    title: 'Ships to USA, Canada & Australia',
    description: 'Free over $350; $25 flat rate under $350',
    href: '/shipping',
  },
  {
    icon: Ruler,
    title: 'Custom Sizing Guidance',
    description: 'Measurement support where product options allow',
    href: '/size-guide',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Shopify Checkout',
    description: 'Protected payment through Shopify',
  },
  {
    icon: MessageCircle,
    title: 'Style Help Before Purchase',
    description: 'Ask us about fit, color, occasion, or timing',
    href: '/style-consultation',
  },
  {
    icon: Sparkles,
    title: 'Curated Occasion Wear',
    description: 'Wedding, festive, and family celebration styles',
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
                className="group"
              >
                <TrustStripItem service={service} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="lg:hidden py-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 min-w-max">
            {services.map((service) => (
              <TrustStripItem key={service.title} service={service} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

type TrustStripService = {
  icon: typeof Truck;
  title: string;
  description: string;
  href?: string;
};

const TrustStripItem = ({
  service,
  compact = false,
}: {
  service: TrustStripService;
  compact?: boolean;
}) => {
  const content = (
    <div className={`flex items-center ${compact ? 'gap-2.5' : 'gap-3'}`}>
      <div className="flex-shrink-0 p-2 rounded-full bg-background/80 group-hover:bg-background transition-colors">
        <service.icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className={`text-sm font-medium text-foreground leading-tight ${compact ? 'whitespace-nowrap' : ''}`}>
          {service.title}
        </h3>
        <p className={`text-xs text-muted-foreground font-light ${compact ? 'whitespace-nowrap' : ''}`}>
          {service.description}
        </p>
      </div>
    </div>
  );

  if (!service.href) {
    return <div className="cursor-default">{content}</div>;
  }

  return (
    <Link to={service.href} className="block hover:text-foreground transition-colors">
      {content}
    </Link>
  );
};

export default ServiceHighlights;
