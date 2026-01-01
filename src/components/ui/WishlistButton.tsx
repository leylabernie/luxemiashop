import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@/stores/wishlistStore';
import type { ShopifyProduct } from '@/lib/shopify';
import { toast } from 'sonner';

interface WishlistButtonProps {
  product: ShopifyProduct;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay';
}

const WishlistButton = ({ 
  product, 
  className = '', 
  size = 'md',
  variant = 'default' 
}: WishlistButtonProps) => {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.node.id);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variantClasses = {
    default: 'bg-background/80 hover:bg-background border border-border/50',
    overlay: 'bg-background/90 backdrop-blur-sm hover:bg-background',
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    
    if (!isWishlisted) {
      toast.success('Added to Wishlist', {
        description: product.node.title,
      });
    } else {
      toast.info('Removed from Wishlist', {
        description: product.node.title,
      });
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.9 }}
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center transition-all duration-300 ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <motion.div
        animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`${iconSizes[size]} transition-colors duration-300 ${
            isWishlisted 
              ? 'fill-primary text-primary' 
              : 'text-foreground/60 hover:text-foreground'
          }`} 
        />
      </motion.div>
    </motion.button>
  );
};

export default WishlistButton;
