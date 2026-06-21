import { motion } from 'framer-motion';
import {
  HandMetal,
  Truck,
  BadgeCheck,
  ShieldCheck,
  RefreshCcw,
  MessageCircle,
  ArrowRight,
  MapPin,
  Ruler,
} from 'lucide-react';

// ─── Trust Signal Data ──────────────────────────────────────────────────

interface TrustCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const trustCards: TrustCard[] = [
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Philadelphia-Based Boutique',
    description:
      'LuxeMia Boutique is a USA-based Indian ethnic wear store with support from Philadelphia.',
    highlight: 'USA Based',
  },
  {
    icon: <HandMetal className="h-6 w-6" />,
    title: 'Curated Indian Ethnic Wear',
    description:
      'We curate sarees, lehengas, suits, menswear, and occasion styles with clear product details.',
    highlight: 'Curated',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Direct Global Shipping',
    description:
      'Direct shipping from our source workshops to your doorstep in the USA, Canada, and Australia.',
    highlight: 'US, CA & AU',
  },
  {
    icon: <Ruler className="h-6 w-6" />,
    title: 'Sizing Guidance',
    description:
      'Review size guidance and custom measurement options where product selections allow.',
    highlight: 'Fit Help',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Secure Shopify Checkout',
    description:
      'Checkout is handled through Shopify secure payment infrastructure.',
    highlight: 'Secure',
  },
  {
    icon: <RefreshCcw className="h-6 w-6" />,
    title: 'Damage Claim Support',
    description:
      'All sales are final. Genuine shipping damage claims are reviewed when reported within 48 hours with an unboxing video.',
    highlight: '48-Hour Claims',
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: 'Pre-Purchase Help',
    description:
      'Ask about sizing, styling, customization, and event timing before placing your order.',
    highlight: 'Style Help',
  },
];

// ─── Stagger Animation Variants ─────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─── Main Component ─────────────────────────────────────────────────────

export const ProductTrustSignals = () => {
  return (
    <section
      className="w-full py-8"
      aria-label="Trust & Guarantee"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h3 className="text-lg font-medium flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Why Shop With LuxeMia Boutique
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Clear support for fit, shipping, secure checkout, and pre-purchase questions.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {trustCards.map((card, index) => (
          <motion.div
            key={card.title}
            variants={cardVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative flex flex-col gap-3 p-4 rounded-sm border border-border/60 bg-card/30 hover:bg-card/60 hover:border-primary/30 transition-colors duration-300"
          >
            {/* Highlight badge */}
            {card.highlight && (
              <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {card.highlight}
              </span>
            )}

            {/* Icon */}
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              {card.icon}
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-foreground">
                {card.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Hover indicator */}
            <div className="mt-auto pt-2 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Learn more</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust bar — compact row of guarantees */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-6 pt-5 border-t border-border/40"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="h-3.5 w-3.5 text-green-600" />
            Philadelphia-based support
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Secure Shopify checkout
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" />
            Direct Global Shipping
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCcw className="h-3.5 w-3.5 text-primary" />
            Damage Claim Support
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default ProductTrustSignals;
