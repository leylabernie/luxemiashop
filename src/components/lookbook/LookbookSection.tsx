import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ShoppableHotspot from './ShoppableHotspot';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';

interface Hotspot {
  x: number;
  y: number;
  productName: string;
  productPrice: string;
  productHandle: string;
  productImage?: string;
}

interface LookbookSectionProps {
  title: string;
  subtitle: string;
  description: string;
  imagePosition: 'left' | 'right' | 'full';
  hotspots: Hotspot[];
  index: number;
}

const LookbookSection = ({
  title,
  subtitle,
  description,
  imagePosition,
  hotspots,
  index
}: LookbookSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  if (imagePosition === 'full') {
    return (
      <section
        ref={sectionRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Full-screen Background */}
        <motion.div
          style={{ y }}
          className="absolute inset-0 scale-110"
        >
          <ProductPlaceholder 
            className="w-full h-full" 
            label={`Lookbook ${index + 1}`}
            aspectRatio="auto"
          />
          <div className="absolute inset-0 bg-foreground/30" />
        </motion.div>

        {/* Content Overlay */}
        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center text-background max-w-2xl px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-luxury uppercase mb-4 text-background/80"
          >
            {subtitle}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl lg:text-6xl mb-6"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm lg:text-base font-light leading-relaxed text-background/90"
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Hotspots */}
        {hotspots.map((hotspot, i) => (
          <ShoppableHotspot key={i} {...hotspot} />
        ))}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="min-h-screen grid lg:grid-cols-2"
    >
      {/* Image Side */}
      <motion.div
        className={`relative h-[60vh] lg:h-screen overflow-hidden ${imagePosition === 'right' ? 'lg:order-2' : ''}`}
      >
        <motion.div
          style={{ y }}
          className="absolute inset-0 scale-110"
        >
          <ProductPlaceholder 
            className="w-full h-full" 
            label={`Lookbook ${index + 1}`}
            aspectRatio="auto"
          />
        </motion.div>

        {/* Hotspots */}
        {hotspots.map((hotspot, i) => (
          <ShoppableHotspot key={i} {...hotspot} />
        ))}
      </motion.div>

      {/* Content Side */}
      <motion.div
        style={{ opacity }}
        className={`flex items-center ${imagePosition === 'right' ? 'lg:order-1 lg:justify-end' : 'lg:justify-start'}`}
      >
        <div className="max-w-md px-8 lg:px-16 py-16 lg:py-0">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-luxury uppercase mb-4 text-foreground/60"
          >
            {subtitle}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl lg:text-5xl mb-6"
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-12 h-px bg-primary mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-foreground/60 font-light leading-relaxed"
          >
            {description}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
};

export default LookbookSection;
