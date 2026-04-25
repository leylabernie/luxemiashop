import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import type { ShopifyProduct } from '@/lib/shopify';

interface StickyAddToBagProps {
  product: ShopifyProduct['node'];
}

const StickyAddToBag = ({ product }: StickyAddToBagProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const firstVariant = product.variants.edges[0]?.node;
  const isAvailable = firstVariant?.availableForSale !== false;
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAtPrice = (product as any).compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat((product as any).compareAtPriceRange.minVariantPrice.amount)
    : null;
  const imageUrl = product.images.edges[0]?.node.url;

  const handleAdd = () => {
    if (!firstVariant) return;
    addItem({
      product: { node: product } as any,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    });
    toast.success('Added to bag', { description: product.title });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center gap-3 p-3 max-w-screen-sm mx-auto">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={product.title}
                className="w-12 h-14 object-cover rounded-sm flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-1">{product.title}</p>
              <p className="text-sm font-semibold">
                ${price.toFixed(2)}
                {compareAtPrice && compareAtPrice > price && (
                  <span className="text-xs text-muted-foreground line-through ml-1 font-normal">
                    ${compareAtPrice.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={handleAdd}
              disabled={!isAvailable}
              data-testid="sticky-add-to-bag"
              className="flex-shrink-0 gap-2 text-sm px-5"
            >
              <ShoppingBag className="w-4 h-4" />
              {isAvailable ? 'Add to Bag' : 'Sold Out'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyAddToBag;
