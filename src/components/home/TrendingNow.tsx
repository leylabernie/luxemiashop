import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { localProducts } from '@/data/localProducts';
import { Button } from '@/components/ui/button';
import { getOptimizedImage } from '@/lib/imageUtils';

const TrendingNow = () => {
  // Get first 4 products as trending items
  const trendingProducts = localProducts.slice(0, 4);

  return (
    <section className="py-16 lg:py-24 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10 lg:mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-3"
            >
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs tracking-luxury uppercase text-muted-foreground">
                Trending Now
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="font-serif text-3xl lg:text-4xl"
            >
              Bestsellers This Season
            </motion.h2>
          </div>
          <Link to="/collections" className="hidden md:block">
            <Button variant="outline" className="group">
              View All
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {trendingProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/product/${product.handle}`}
                className="group block"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30 mb-4">
                  <img
                    src={getOptimizedImage(product.images[0], 'card')}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Trending Badge */}
                  <div className="absolute top-3 left-3 bg-foreground text-background px-2.5 py-1 text-xs tracking-editorial uppercase">
                    Bestseller
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-sm lg:text-base font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    {product.category}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      ${product.price}
                    </span>
                    {product.originalPrice && product.originalPrice !== product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link to="/collections">
            <Button variant="outline" className="w-full">
              View All Trending
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingNow;
