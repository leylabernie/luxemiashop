import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';

interface RecentlyViewedProps {
  currentProductId?: string;
}

export const RecentlyViewed = ({ currentProductId }: RecentlyViewedProps) => {
  const getRecentProducts = useRecentlyViewedStore((state) => state.getRecentProducts);
  const recentProducts = getRecentProducts(currentProductId, 6);

  if (recentProducts.length === 0) {
    return null;
  }

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  return (
    <section className="py-12 border-t border-border">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-2xl font-serif">Recently Viewed</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recentProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Link
              to={`/product/${product.handle}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-2 rounded-sm">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
