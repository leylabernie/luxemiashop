import { motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import type { ShopifyProduct } from '@/lib/shopify';

interface ProductGridProps {
  products: ShopifyProduct[];
  isLoading: boolean;
}

export const ProductGrid = ({ products, isLoading }: ProductGridProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent, product: ShopifyProduct) => {
    e.preventDefault();
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) return;

    addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    });

    toast.success('Added to bag', {
      description: `${product.node.title} has been added.`,
    });
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
              
              {/* Hover Actions */}
              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-background/90 backdrop-blur-sm text-sm font-medium rounded-sm hover:bg-background transition-colors">
                    Quick View
                  </button>
                  <button className="p-2.5 bg-background/90 backdrop-blur-sm rounded-sm hover:bg-background transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.node.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="group"
        >
          <Link to={`/product/${product.node.handle}`}>
            <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card">
              {product.node.images.edges[0] ? (
                <img
                  src={product.node.images.edges[0].node.url}
                  alt={product.node.images.edges[0].node.altText || product.node.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <ProductPlaceholder aspectRatio="portrait" />
              )}

              {/* Hover Actions */}
              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="flex-1 py-2.5 bg-background/90 backdrop-blur-sm text-sm font-medium rounded-sm hover:bg-background transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Bag
                  </button>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="p-2.5 bg-background/90 backdrop-blur-sm rounded-sm hover:bg-background transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Badge */}
              {!product.node.variants.edges[0]?.node.availableForSale && (
                <span className="absolute top-3 left-3 px-2 py-1 text-xs uppercase tracking-wide bg-muted text-muted-foreground rounded-sm">
                  Sold Out
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {product.node.productType || 'Collection'}
              </p>
              <h3 className="font-medium text-sm line-clamp-1">{product.node.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formatPrice(
                  product.node.priceRange.minVariantPrice.amount,
                  product.node.priceRange.minVariantPrice.currencyCode
                )}
              </p>
            </div>
          </Link>
        </motion.div>
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
