import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImage } from '@/lib/imageUtils';
import type { ShopifyProduct } from '@/lib/shopify';

export interface StickyPurchaseState {
  priceAmount: string;
  compareAtAmount: string | null;
  selectedLabel: string;
  imageUrl: string | null;
  isAvailable: boolean;
  canDirectAdd: boolean;
  isAdding: boolean;
  onDirectAdd: () => void;
}

interface StickyAddToBagProps {
  product: ShopifyProduct['node'];
  purchaseState?: StickyPurchaseState | null;
}

const StickyAddToBag = ({ product, purchaseState }: StickyAddToBagProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const inlineCta = document.getElementById('product-add-to-bag');
      if (!inlineCta) {
        setIsVisible(window.scrollY > 300);
        return;
      }
      const rect = inlineCta.getBoundingClientRect();
      const ctaInView = rect.top < window.innerHeight - 64 && rect.bottom > 72;
      setIsVisible(!ctaInView && window.scrollY > 140);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [product.id]);

  const isAvailable = purchaseState
    ? purchaseState.isAvailable
    : product.variants.edges.some((edge) => edge.node.availableForSale !== false);
  const price = parseFloat(purchaseState?.priceAmount ?? product.priceRange.minVariantPrice.amount);
  const rawCompareAt = purchaseState !== undefined
    ? purchaseState?.compareAtAmount
    : product.compareAtPriceRange?.minVariantPrice?.amount ?? null;
  const compareAtPrice = rawCompareAt ? parseFloat(rawCompareAt) : null;
  const imageUrl = purchaseState?.imageUrl || product.images.edges[0]?.node.url;
  const canDirectAdd = Boolean(purchaseState?.canDirectAdd && isAvailable);
  const isAdding = Boolean(purchaseState?.isAdding);

  const handleAction = () => {
    if (canDirectAdd && purchaseState) {
      purchaseState.onDirectAdd();
      return;
    }
    const target = document.getElementById('product-options') || document.getElementById('product-purchase');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 md:pb-[env(safe-area-inset-bottom,0px)] left-0 right-0 z-40 lg:hidden bg-background/98 backdrop-blur-sm border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-3 px-3 py-2.5 max-w-screen-sm mx-auto">
            {imageUrl && (
              <img
                src={getOptimizedImage(imageUrl, 'thumbnail')}
                alt={product.title}
                loading="lazy"
                decoding="async"
                className="w-10 h-12 object-contain rounded-sm flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-1">
                {purchaseState?.selectedLabel ? `${product.title}` : product.title}
              </p>
              <p className="text-sm font-semibold">
                ${price.toFixed(2)}
                {compareAtPrice !== null && compareAtPrice > price && (
                  <span className="text-xs text-muted-foreground line-through ml-1 font-normal">
                    ${compareAtPrice.toFixed(2)}
                  </span>
                )}
              </p>
              {purchaseState?.selectedLabel && (
                <p className="text-[11px] text-muted-foreground line-clamp-1">{purchaseState.selectedLabel}</p>
              )}
            </div>
            <Button
              onClick={handleAction}
              disabled={!isAvailable || isAdding}
              data-testid="sticky-add-to-bag"
              className="flex-shrink-0 gap-1.5 text-xs sm:text-sm px-4 min-h-11"
            >
              <ShoppingBag className="w-4 h-4" />
              {!isAvailable ? 'Sold Out' : isAdding ? 'Adding...' : canDirectAdd ? 'Add to Bag' : 'Choose Options'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyAddToBag;
