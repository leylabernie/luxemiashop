import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import QuickViewModal from '@/components/ui/QuickViewModal';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';
import type { ShopifyProduct } from '@/lib/shopify';
import { getOptimizedImage } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
  showQuickAdd?: boolean;
  className?: string;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ 
  product, 
  index = 0, 
  showQuickAdd = true,
  className = '' 
}, ref) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [pinchScale, setPinchScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchOrigin, setPinchOrigin] = useState({ x: 50, y: 50 });
  const [imageError, setImageError] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const initialDistanceRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);
  
  
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Calculate distance between two touch points
  const getDistance = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate center point between two touches
  const getCenter = useCallback((touches: React.TouchList, rect: DOMRect) => {
    if (touches.length < 2) return { x: 50, y: 50 };
    const touch1 = touches[0];
    const touch2 = touches[1];
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    return {
      x: ((centerX - rect.left) / rect.width) * 100,
      y: ((centerY - rect.top) / rect.height) * 100,
    };
  }, []);

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsPinching(true);
      initialDistanceRef.current = getDistance(e.touches);
      initialScaleRef.current = pinchScale;
      
      const rect = e.currentTarget.getBoundingClientRect();
      setPinchOrigin(getCenter(e.touches, rect));
    }
  }, [getDistance, getCenter, pinchScale]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const scaleChange = currentDistance / initialDistanceRef.current;
      const newScale = Math.min(Math.max(initialScaleRef.current * scaleChange, 1), 3);
      setPinchScale(newScale);
      
      const rect = e.currentTarget.getBoundingClientRect();
      setPinchOrigin(getCenter(e.touches, rect));
    }
  }, [getDistance, getCenter, isPinching]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      setIsPinching(false);
      // Reset scale with a smooth transition
      if (pinchScale <= 1.1) {
        setPinchScale(1);
        setPinchOrigin({ x: 50, y: 50 });
      }
    }
  }, [pinchScale]);

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


  // Double-tap to zoom on mobile
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      
      if (pinchScale > 1) {
        setPinchScale(1);
        setPinchOrigin({ x: 50, y: 50 });
      } else {
        setPinchScale(2);
        setPinchOrigin({ x, y });
      }
    }
    
    lastTapRef.current = now;
  }, [pinchScale]);

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const imageUrl = product.node.images.edges[0]?.node.url;
  const isAvailable = product.node.variants.edges[0]?.node.availableForSale !== false;

  // "New" badge — products added within the last 45 days
  const isNew = (() => {
    if (!product.node.createdAt) return false;
    const daysSince = (Date.now() - new Date(product.node.createdAt).getTime()) / 86400000;
    return daysSince <= 45;
  })();

  // Deterministic social proof signals based on product ID hash
  const _hash = (() => {
    let h = 0;
    const s = product.node.id;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  })();
  const isTrending = isAvailable && !isNew && (_hash % 7 === 0 || _hash % 7 === 1); // ~28%
  const savedCount = isAvailable ? ((_hash % 47) + 8) : 0; // 8–54

  // Reduce animation delay on mobile for faster perceived loading
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const animationDelay = isMobile ? Math.min(index * 0.02, 0.1) : Math.min(index * 0.05, 0.3);

  return (
    <motion.div
      ref={(node) => {
        // Merge external ref with internal cardRef
        cardRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
      className={`group ${className}`}
    >
      <Link to={`/product/${product.node.handle}`}>
        <div 
          ref={imageContainerRef}
          className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card touch-none"
          onTouchStart={(e) => {
            handleDoubleTap(e);
            handleTouchStart(e);
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Shimmer Placeholder */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-card via-muted to-card transition-opacity duration-500',
              isLoaded ? 'opacity-0' : 'opacity-100'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>

          {/* Actual Image - only render when in view */}
          {isInView && imageUrl && !imageError ? (
            <div className="w-full h-full overflow-hidden">
              <img
                src={getOptimizedImage(imageUrl, 'card')}
                alt={product.node.images.edges[0]?.node.altText || `${product.node.title} - Buy ${product.node.productType || 'Ethnic Wear'} Online | LuxeMia`}
                loading="lazy"
                draggable={false}
                onLoad={() => setIsLoaded(true)}
                onError={() => setImageError(true)}
                className={cn(
                  'w-full h-full object-cover select-none',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                  isPinching ? '' : 'transition-all duration-300'
                )}
                style={{
                  transform: isPinching || pinchScale > 1 
                    ? `scale(${pinchScale})` 
                    : 'scale(1)',
                  transformOrigin: isPinching || pinchScale > 1 
                    ? `${pinchOrigin.x}% ${pinchOrigin.y}%` 
                    : 'center',
                }}
              />
            </div>
          ) : (
            <ProductPlaceholder aspectRatio="portrait" />
          )}


          {/* Mobile Wishlist Button - Always visible on mobile */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-full transition-all z-10 lg:opacity-0 lg:group-hover:opacity-100"
            aria-label={isInWishlist(product.node.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4 w-4 ${
                isInWishlist(product.node.id)
                  ? 'fill-primary text-primary'
                  : 'text-foreground'
              }`}
            />
          </button>

          {/* Hover Actions - Desktop only */}
          <div className="hidden lg:flex absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="flex gap-2 w-full">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsQuickViewOpen(true); }}
                data-testid={`quick-view-${product.node.handle}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-background/95 hover:bg-background text-foreground backdrop-blur-sm text-xs font-medium rounded-sm transition-colors border border-border/20"
                aria-label="Quick view"
              >
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </button>
              {showQuickAdd && (
                <Button
                  onClick={handleQuickAdd}
                  size="sm"
                  className="flex-1 py-2 bg-foreground hover:bg-foreground/90 text-background text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add to Bag
                </Button>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {isNew && isAvailable && (
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest bg-foreground text-background rounded-sm font-medium">
                New
              </span>
            )}
            {isTrending && (
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest bg-primary/90 text-primary-foreground rounded-sm font-medium">
                Trending
              </span>
            )}
          </div>
          {!isAvailable && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] uppercase tracking-widest bg-muted text-muted-foreground rounded-sm z-10">
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {formatPrice(
                product.node.priceRange.minVariantPrice.amount,
                product.node.priceRange.minVariantPrice.currencyCode
              )}
            </p>
            {isAvailable && savedCount > 15 && (
              <p className="text-[10px] text-muted-foreground/70 flex-shrink-0">
                ♥ {savedCount} saved
              </p>
            )}
          </div>
        </div>
      </Link>
      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal product={product} onClose={() => setIsQuickViewOpen(false)} />
      )}
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
