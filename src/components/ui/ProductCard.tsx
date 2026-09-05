import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo, memo } from 'react';
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
import { getOptimizedImage, getResponsiveImage } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';
import { getShipByLabel } from '@/lib/shipBy';
import { isMadeToOrderProduct } from '@/lib/customizableProducts';

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
  showQuickAdd?: boolean;
  className?: string;
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatPrice = (amount: string, _currency: string) => {
  return priceFormatter.format(parseFloat(amount));
};

/**
 * Build a rich, SEO-optimized alt text from product tags.
 * Tags follow the pattern "color:red", "fabric:silk", "occasion:wedding", "work:zardozi".
 * Formula: [Color] [Fabric] [Garment Type] with [Work Type] for [Occasion] - LuxeMia
 * Missing fields are omitted gracefully.
 */
function buildSeoAltText(
  title: string,
  productType: string | undefined,
  tags: string[] | undefined | null,
): string {
  const tagMap = new Map<string, string>();
  (tags ?? []).forEach((tag) => {
    const idx = tag.indexOf(':');
    if (idx > 0) {
      const key = tag.slice(0, idx).toLowerCase().trim();
      const val = tag.slice(idx + 1).trim();
      if (val) tagMap.set(key, val);
    }
  });

  const parts: string[] = [];

  // Color (title-case)
  const color = tagMap.get('color');
  if (color) parts.push(titleCase(color));

  // Fabric (title-case)
  const fabric = tagMap.get('fabric');
  if (fabric) parts.push(titleCase(fabric));

  // Garment type (from productType or first two words of title)
  const garmentType = productType || title.split(/\s+/).slice(0, 2).join(' ');
  if (garmentType) parts.push(titleCase(garmentType));

  // Work type
  const work = tagMap.get('work');
  if (work) parts.push(`with ${titleCase(work)} Work`);

  // Occasion
  const occasion = tagMap.get('occasion');
  if (occasion) parts.push(`for ${titleCase(occasion)}`);

  // Fallback: if nothing was built, use title
  if (parts.length === 0) return `${title} - LuxeMia`;

  return `${parts.join(' ')} - LuxeMia`;
}

function titleCase(str: string): string {
  return str.replace(/\b\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export const ProductCard = memo(forwardRef<HTMLDivElement, ProductCardProps>(({ 
  product, 
  index = 0, 
  showQuickAdd = true,
  className = '' 
}, ref) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
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

  useImperativeHandle(ref, () => cardRef.current!);
  
  
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
    if (product.node.variants.edges.length > 1) {
      setIsQuickViewOpen(true);
      return;
    }
    const firstVariant = product.node.variants.edges.find((edge) => edge.node.availableForSale)?.node || product.node.variants.edges[0]?.node;
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
    if (isInWishlist(product.node.id)) {
      removeFromWishlist(product.node.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
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



  const imageUrl = product.node.images.edges[0]?.node.url;
  const isMadeToOrder = isMadeToOrderProduct(product.node.handle, product.node.tags);
  const isAvailable = product.node.variants.edges.some((edge) => edge.node.availableForSale !== false);
  const requiresOptionSelection = product.node.variants.edges.length > 1;
  const shipByLabel = getShipByLabel(product.node);

  // "New" badge — products added within the last 30 days
  const NEW_ARRIVAL_WINDOW_DAYS = 30;
  const isNew = (() => {
    if (!product.node.createdAt) return false;
    const daysSince = (Date.now() - new Date(product.node.createdAt).getTime()) / 86400000;
    return daysSince <= NEW_ARRIVAL_WINDOW_DAYS;
  })();

  // NOTE: Fake social proof badges ("Trending", "X saved") were removed
  // per SEO audit Fix 1.3. These were generated via deterministic hash
  // on product IDs — NOT real data — creating FTC compliance risk.

  // Reduce animation delay on mobile for faster perceived loading
  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, []);
  const animationDelay = isMobile ? Math.min(index * 0.02, 0.1) : Math.min(index * 0.05, 0.3);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
      className={`group rounded-[2px] ${className}`}
    >
      <Link to={`/product/${product.node.handle}`}>
        <div 
          ref={imageContainerRef}
          className="relative mb-3 aspect-[3/4] overflow-hidden rounded-[2px] bg-[#efe5df] shadow-[0_8px_20px_rgba(78,49,50,0.06)] touch-none sm:mb-4"
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
                src={getResponsiveImage(imageUrl)?.src ?? getOptimizedImage(imageUrl, 'card')}
                srcSet={getResponsiveImage(imageUrl)?.srcSet}
                sizes={getResponsiveImage(imageUrl)?.sizes}
                alt={product.node.images.edges[0]?.node.altText || buildSeoAltText(product.node.title, product.node.productType, product.node.tags)}
                loading={index < 4 ? 'eager' : 'lazy'}
                fetchPriority={index < 4 ? 'high' : 'auto'}
                decoding="async"
                width={300}
                height={400}
                draggable={false}
                onLoad={() => setIsLoaded(true)}
                onError={() => setImageError(true)}
                className={cn(
                  'w-full h-full object-cover object-top select-none',
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
            className="absolute right-2 top-2 z-10 flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-[#fffaf6]/92 p-2.5 text-[#493235] shadow-sm backdrop-blur-sm transition-all lg:opacity-0 lg:group-hover:opacity-100"
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
              {isMadeToOrder ? (
                <span className="flex w-full items-center justify-center bg-background/95 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
                  View made-to-order details
                </span>
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsQuickViewOpen(true); }}
                  data-testid={`quick-view-${product.node.handle}`}
                  className="flex items-center justify-center gap-1.5 rounded-[2px] border border-[#dfc8c2] bg-[#fffaf6]/95 px-3 py-2 text-xs font-medium text-[#3b292c] backdrop-blur-sm transition-colors hover:bg-[#f4e3df]"
                  aria-label="Quick view"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Quick View
                </button>
              )}
              {showQuickAdd && !isMadeToOrder && (
                <Button
                  onClick={handleQuickAdd}
                  size="sm"
                  className="flex-1 rounded-[2px] bg-[#3b292c] py-2 text-xs font-medium text-[#fff9f4] hover:bg-[#a96f72]"
                >
                  {requiresOptionSelection ? <Eye className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                  {requiresOptionSelection ? 'Choose Options' : 'Add to Bag'}
                </Button>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {isNew && isAvailable && (
              <span className="rounded-[2px] bg-[#3b292c] px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[#fff9f4]">
                New
              </span>
            )}
            {isMadeToOrder && isAvailable && (
              <span className="rounded-[2px] bg-[#a96f72] px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[#fff9f4]">
                Made to Order
              </span>
            )}

          </div>
          {!isAvailable && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] uppercase tracking-widest bg-muted text-muted-foreground rounded-sm z-10">
              Sold Out
            </span>
          )}
        </div>

        <div className="space-y-1.5 px-0.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-[#9a807b]">
            {product.node.productType || 'Collection'}
          </p>
          <h3 className="min-h-[2.5rem] font-serif text-[15px] leading-[1.25] text-[#3b292c] line-clamp-2 transition-colors group-hover:text-[#a96f72]">
            {product.node.title}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#493235]">
                {formatPrice(
                  product.node.priceRange.minVariantPrice.amount,
                  product.node.priceRange.minVariantPrice.currencyCode
                )}
              </p>
              {product.node.compareAtPriceRange?.minVariantPrice?.amount &&
                parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount) >
                parseFloat(product.node.priceRange.minVariantPrice.amount) && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(
                    product.node.compareAtPriceRange.minVariantPrice.amount,
                    product.node.compareAtPriceRange.minVariantPrice.currencyCode
                  )}
                </p>
              )}
            </div>

          </div>
          <p className={`text-xs font-medium ${isMadeToOrder ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
            {isMadeToOrder ? 'Made to Order' : 'Ready to Ship'}
          </p>
          {shipByLabel && !isMadeToOrder && (
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              {shipByLabel}
            </p>
          )}
          {product.node.compareAtPriceRange?.minVariantPrice?.amount &&
            parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount) >
            parseFloat(product.node.priceRange.minVariantPrice.amount) && (
            <p className="text-xs font-medium text-[#a96f72]">
              {Math.round((1 - parseFloat(product.node.priceRange.minVariantPrice.amount) /
                parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount)) * 100)}% off
            </p>
          )}
        </div>
      </Link>
      {/* Quick View Modal */}
      {isQuickViewOpen && !isMadeToOrder && (
        <QuickViewModal product={product} onClose={() => setIsQuickViewOpen(false)} />
      )}
    </motion.div>
  );
}));

ProductCard.displayName = 'ProductCard';

export default ProductCard;
