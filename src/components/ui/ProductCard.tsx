import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
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

export const ProductCard = ({ 
  product, 
  index = 0, 
  showQuickAdd = true,
  className = '' 
}: ProductCardProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [pinchScale, setPinchScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchOrigin, setPinchOrigin] = useState({ x: 50, y: 50 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [highResLoaded, setHighResLoaded] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const initialDistanceRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(1);
  
  // Magnifier constants
  const MAGNIFIER_SIZE = 150;
  const ZOOM_LEVEL = 3;
  
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    setCursorPosition({ x, y });
    setMagnifierPosition({ x: percentX, y: percentY });
    setMousePosition({ x: percentX, y: percentY });
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
    setIsZoomed(true);
  };
  
  const handleMouseLeave = () => {
    setShowMagnifier(false);
    setIsZoomed(false);
    setHighResLoaded(false);
    setMousePosition({ x: 50, y: 50 });
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
  const highResUrl = imageUrl ? getOptimizedImage(imageUrl, 'gallery') : '';
  const isAvailable = product.node.variants.edges[0]?.node.availableForSale !== false;

  // Preload high-res image when magnifier is active
  useEffect(() => {
    if (showMagnifier && highResUrl && !highResLoaded) {
      const img = new Image();
      img.src = highResUrl;
      img.onload = () => setHighResLoaded(true);
    }
  }, [showMagnifier, highResUrl, highResLoaded]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className={`group ${className}`}
    >
      <Link to={`/product/${product.node.handle}`}>
        <div 
          ref={imageContainerRef}
          className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card cursor-crosshair touch-none"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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
          {isInView && imageUrl ? (
            <div className="w-full h-full overflow-hidden">
              <img
                src={getOptimizedImage(imageUrl, 'card')}
                alt={product.node.images.edges[0]?.node.altText || product.node.title}
                loading="lazy"
                draggable={false}
                onLoad={() => setIsLoaded(true)}
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
          ) : !imageUrl ? (
            <ProductPlaceholder aspectRatio="portrait" />
          ) : null}

          {/* Magnifier Lens */}
          {showMagnifier && isInView && imageUrl && isLoaded && (
            <div
              className="absolute pointer-events-none rounded-full border-4 border-white shadow-2xl overflow-hidden z-20"
              style={{
                width: MAGNIFIER_SIZE,
                height: MAGNIFIER_SIZE,
                left: cursorPosition.x - MAGNIFIER_SIZE / 2,
                top: cursorPosition.y - MAGNIFIER_SIZE / 2,
                backgroundImage: `url(${highResLoaded ? highResUrl : getOptimizedImage(imageUrl, 'card')})`,
                backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                backgroundSize: `${ZOOM_LEVEL * 100}%`,
                backgroundRepeat: 'no-repeat',
              }}
            >
              {!highResLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Zoom indicator */}
          <div className={cn(
            'absolute top-3 left-3 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-opacity duration-300 pointer-events-none',
            isZoomed || pinchScale > 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}>
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
