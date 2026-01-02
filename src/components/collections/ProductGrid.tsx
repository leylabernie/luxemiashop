import { motion } from 'framer-motion';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import ProductCard from '@/components/ui/ProductCard';
import type { ShopifyProduct } from '@/lib/shopify';

interface ProductGridProps {
  products: ShopifyProduct[];
  isLoading: boolean;
  columns?: 3 | 4;
}

export const ProductGrid = ({ products, isLoading, columns = 4 }: ProductGridProps) => {
  const gridCols = columns === 3 
    ? 'grid-cols-2 lg:grid-cols-3' 
    : 'grid-cols-2 lg:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`grid ${gridCols} gap-4 lg:gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-card rounded-sm mb-4" />
            <div className="h-4 bg-card rounded w-3/4 mb-2" />
            <div className="h-4 bg-card rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`grid ${gridCols} gap-4 lg:gap-6`}>
        {placeholderProducts.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group"
          >
            <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card">
              <ProductPlaceholder aspectRatio="portrait" label={item.label} />
              
              {/* Badge */}
              {item.badge && (
                <span className="absolute top-3 left-3 px-2 py-1 text-xs uppercase tracking-wide bg-primary text-primary-foreground rounded-sm">
                  {item.badge}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.category}
              </p>
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4 lg:gap-6`}>
      {products.map((product, index) => (
        <ProductCard 
          key={product.node.id} 
          product={product} 
          index={index}
          showQuickAdd={true}
        />
      ))}
    </div>
  );
};

const placeholderProducts = [
  { name: 'Banarasi Silk Saree', category: 'Sarees', price: '₹24,999', label: 'Product Image', badge: 'New' },
  { name: 'Bridal Lehenga Set', category: 'Lehengas', price: '₹89,999', label: 'Product Image', badge: 'Bestseller' },
  { name: 'Chanderi Cotton Suit', category: 'Suits', price: '₹12,499', label: 'Product Image' },
  { name: 'Organza Dupatta', category: 'Accessories', price: '₹4,999', label: 'Product Image' },
  { name: 'Embroidered Anarkali', category: 'Anarkalis', price: '₹18,999', label: 'Product Image' },
  { name: 'Kanjivaram Silk Saree', category: 'Sarees', price: '₹45,999', label: 'Product Image', badge: 'Limited' },
  { name: 'Designer Blouse', category: 'Blouses', price: '₹6,499', label: 'Product Image' },
  { name: 'Festive Palazzo Set', category: 'Suits', price: '₹15,999', label: 'Product Image' },
];
