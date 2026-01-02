import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, ShoppingBag, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import WishlistButton from '@/components/ui/WishlistButton';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';
import type { ShopifyProduct } from '@/lib/shopify';
import { getOptimizedImage } from '@/lib/imageUtils';

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
  showQuickAdd?: boolean;
  className?: string;
}

export const ProductCard = ({ 
  product, 
  index = 0, 
  showQuickAdd = true,
  className = '' 
}: ProductCardProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productData = {
      id: product.node.id,
      title: product.node.title,
      handle: product.node.handle,
      priceRange: product.node.priceRange,
      images: product.node.images,
    };
    if (isInWishlist(product.node.id)) {
      removeFromWishlist(product.node.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(productData as any);
      toast.success('Added to wishlist!');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => {
    setIsZoomed(false);
    setMousePosition({ x: 50, y: 50 });
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const imageUrl = product.node.images.edges[0]?.node.url;
  const isAvailable = product.node.variants.edges[0]?.node.availableForSale !== false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`group ${className}`}
    >
      <Link to={`/product/${product.node.handle}`}>
        <div 
          className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {imageUrl ? (
            <div className="w-full h-full overflow-hidden">
              <img
                src={getOptimizedImage(imageUrl, 'card')}
                alt={product.node.images.edges[0]?.node.altText || product.node.title}
                className="w-full h-full object-cover transition-all duration-500"
                style={{
                  transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }}
              />
            </div>
          ) : (
            <ProductPlaceholder aspectRatio="portrait" />
          )}

          {/* Zoom indicator */}
          <div className={`absolute top-3 left-3 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${isZoomed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <ZoomIn className="h-3.5 w-3.5 text-foreground" />
          </div>

          {/* Hover Actions */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="flex gap-2">
              {showQuickAdd && (
                <Button
                  onClick={handleQuickAdd}
                  size="sm"
                  className="flex-1 py-2.5 bg-background/95 hover:bg-background text-foreground backdrop-blur-sm text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Bag
                </Button>
              )}
              <button
                onClick={handleWishlistToggle}
                className="p-2.5 bg-background/95 hover:bg-background backdrop-blur-sm rounded-md transition-colors"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isInWishlist(product.node.id)
                      ? 'fill-primary text-primary'
                      : 'text-foreground'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Badge */}
          {!isAvailable && (
            <span className="absolute top-3 right-3 px-2 py-1 text-xs uppercase tracking-wide bg-muted text-muted-foreground rounded-sm">
              Sold Out
            </span>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.node.productType || 'Collection'}
          </p>
          <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {product.node.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatPrice(
              product.node.priceRange.minVariantPrice.amount,
              product.node.priceRange.minVariantPrice.currencyCode
            )}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
