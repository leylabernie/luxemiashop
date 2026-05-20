import { motion } from 'framer-motion';
import {
  HandMetal,
  Truck,
  BadgeCheck,
  ShieldCheck,
  RefreshCcw,
  MessageCircle,
  ArrowRight,
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
    icon: <HandMetal className="h-6 w-6" />,
    title: 'Handcrafted in India',
    description:
      'Each garment is crafted in India using traditional techniques.',
    highlight: 'Artisan Made',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Free Shipping Over $350',
    description:
      'Complimentary express delivery to USA, Canada & Australia on all orders above $350. Flat $25 rate otherwise.',
    highlight: 'Free Delivery',
  },
  {
    icon: <BadgeCheck className="h-6 w-6" />,
    title: 'Quality Inspected',
    description:
      'Every piece undergoes a 12-point quality check by our in-house team before it leaves our facility.',
    highlight: '12-Point Check',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Secure Payment',
    description:
      'Shopify PCI-DSS Level 1 compliant encryption. Your payment data is never stored on our servers.',
    highlight: 'Bank-Grade Secure',
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
    title: 'WhatsApp Support',
    description:
      'Real-time assistance for sizing, customization, and order tracking. Average response under 10 minutes.',
    highlight: '24/7 Chat',
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
          Why Shop With Luxemia
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          The trusted choice for authentic Indian ethnic wear since 2018
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
            100% Authentic
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Secure Payment
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" />
            Insured Shipping
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
