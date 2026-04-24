import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import type { ShopifyProduct } from '@/lib/shopify';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  // Split products: feature the first one large, rest in grid
  const featuredProduct = products[0];
  const gridProducts = products.slice(1, 4); // Show only 3 more for a cleaner layout

  const isRight = layout === 'right';

  return (
    <section ref={sectionRef} className="py-24 lg:py-40 overflow-hidden">
      <motion.div 
        style={{ opacity, scale, y }} 
        className="container mx-auto px-4 lg:px-8 max-w-7xl"
      >
        <div className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-center ${isRight ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Editorial Content Side */}
          <div className="w-full lg:w-5/12 space-y-8">
            <div className={isRight ? 'lg:text-right' : ''}>
              <motion.span 
                initial={{ opacity: 0, x: isRight ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-[10px] tracking-[0.3em] uppercase text-primary font-semibold mb-4 block"
              >
                {subtitle}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-serif text-5xl lg:text-7xl leading-[1.1] mb-6"
              >
                {title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? 'italic font-light block lg:inline' : 'block lg:inline'}>
                    {word}{' '}
                  </span>
                ))}
              </motion.h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '80px' }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className={`h-px bg-primary/40 mb-8 ${isRight ? 'lg:ml-auto' : ''}`}
              />
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground font-light leading-relaxed text-lg max-w-md"
              >
                {description}
              </motion.p>
            </div>

            {/* Small grid of secondary products */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {gridProducts.map((product, i) => (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="aspect-[3/4] group relative overflow-hidden rounded-sm"
                >
                  <Link to={`/product/${product.node.handle}`}>
                    <img 
                      src={product.node.images.edges[0]?.node.url} 
                      alt={product.node.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white uppercase tracking-widest font-medium">View</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Featured Product Side */}
          <div className="w-full lg:w-7/12">
            <motion.div
              initial={{ opacity: 0, x: isRight ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Decorative Elements */}
              <div className={`absolute -inset-4 border border-primary/10 -z-10 translate-x-8 translate-y-8 hidden lg:block`} />
              
              <div className="relative z-10 group">
                <ProductCard
                  product={featuredProduct}
                  index={0}
                  showQuickAdd={true}
                  className="[&_.aspect-\\[3\\/4\\]]:aspect-[4/5] shadow-2xl"
                />
                
                {/* Editorial Overlay */}
                <div className="absolute top-8 right-8 pointer-events-none">
                  <div className="bg-background/90 backdrop-blur-md p-4 shadow-lg border border-border/50 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Featured Look</p>
                    <p className="font-serif text-sm italic">The {featuredProduct.node.productType || 'Ensemble'}</p>
                  </div>
                </div>
              </div>

              {/* Shop the Look CTA */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className={`absolute -bottom-12 ${isRight ? '-left-12' : '-right-12'} hidden lg:block`}
              >
                <Link 
                  to={`/product/${featuredProduct.node.handle}`}
                  className="flex items-center gap-4 bg-foreground text-background px-8 py-6 rounded-full hover:bg-primary transition-colors group shadow-xl"
                >
                  <span className="text-sm uppercase tracking-[0.2em] font-medium">Shop This Look</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LookbookSection;
