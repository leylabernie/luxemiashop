import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import type { ShopifyProduct } from '@/lib/shopify';

interface LookbookSectionProps {
  title: string;
  subtitle: string;
  description: string;
  products: ShopifyProduct[];
  index: number;
  layout: 'left' | 'right';
}

const LookbookSection = ({
  title,
  subtitle,
  description,
  products,
  index,
  layout,
}: LookbookSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  // Split products: feature the first one large, rest in grid
  const featuredProduct = products[0];
  const gridProducts = products.slice(1);

  const isRight = layout === 'right';

  return (
    <section ref={sectionRef} className="py-16 lg:py-24">
      <motion.div style={{ opacity }} className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className={`flex flex-col lg:flex-row items-start gap-6 mb-12 ${isRight ? 'lg:flex-row-reverse lg:text-right' : ''}`}>
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-xs tracking-luxury uppercase mb-3 text-muted-foreground"
            >
              {subtitle}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl lg:text-5xl mb-4"
            >
              {title}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className={`w-12 h-px bg-primary mb-4 ${isRight ? 'lg:ml-auto' : ''}`}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground font-light leading-relaxed max-w-lg"
            >
              {description}
            </motion.p>
          </div>
        </div>

        {/* Product Layout: Featured + Grid */}
        {products.length > 0 && (
          <div className={`grid lg:grid-cols-2 gap-4 lg:gap-6 ${isRight ? 'direction-rtl' : ''}`}>
            {/* Featured Product - Large */}
            {featuredProduct && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`${isRight ? 'lg:order-2' : ''}`}
              >
                <ProductCard
                  product={featuredProduct}
                  index={0}
                  showQuickAdd={true}
                  className="[&_.aspect-\\[3\\/4\\]]:aspect-[3/5]"
                />
              </motion.div>
            )}

            {/* Grid of remaining products */}
            {gridProducts.length > 0 && (
              <div className={`grid grid-cols-2 gap-2 sm:gap-4 ${isRight ? 'lg:order-1' : ''}`}>
                {gridProducts.map((product, i) => (
                  <motion.div
                    key={product.node.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      index={i + 1}
                      showQuickAdd={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default LookbookSection;
