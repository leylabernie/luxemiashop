import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';
import type { ShopifyProduct } from '@/lib/shopify';

interface QuickViewModalProps {
  product: ShopifyProduct | null;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  if (!product) return null;

  const variants = product.node.variants.edges;
  const selectedVariant = variants[selectedVariantIdx]?.node;
  const imageUrl = product.node.images.edges[0]?.node.url;
  const title = product.node.title;
  const price = parseFloat(selectedVariant?.price?.amount || product.node.priceRange.minVariantPrice.amount);
  const inWishlist = isInWishlist(product.node.id);

  const hasMultipleVariants = variants.length > 1 && !(variants.length === 1 && variants[0].node.title === 'Default Title');

  const handleAddToBag = () => {
    if (!selectedVariant) return;
    addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });
    toast.success('Added to bag', { description: title });
    onClose();
  };

  const handleWishlist = () => {
    const productData = {
      id: product.node.id,
      title: product.node.title,
      handle: product.node.handle,
      priceRange: product.node.priceRange,
      images: product.node.images,
    };
    if (inWishlist) {
      removeFromWishlist(product.node.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(productData as any);
      toast.success('Added to wishlist!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-background rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl z-10"
        >
          {/* Close */}
          <button
            onClick={onClose}
            data-testid="quick-view-close"
            className="absolute top-3 right-3 z-20 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row h-full max-h-[90vh]">
            {/* Image */}
            <div className="w-full sm:w-5/12 aspect-[3/4] sm:aspect-auto sm:h-auto flex-shrink-0 bg-muted overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 p-5 lg:p-6 overflow-y-auto">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {product.node.productType || 'Designer Wear'}
              </p>
              <h2 className="font-serif text-xl lg:text-2xl mb-2 leading-snug">{title}</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-lg font-medium">
                  ${price.toFixed(2)}
                </p>
                {product.node.compareAtPriceRange?.minVariantPrice?.amount &&
                  parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount) > price && (
                  <p className="text-sm text-muted-foreground line-through">
                    ${parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount).toFixed(2)}
                  </p>
                )}
                {product.node.compareAtPriceRange?.minVariantPrice?.amount &&
                  parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount) > price && (
                  <p className="text-xs text-primary font-medium">
                    {Math.round((1 - price / parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount)) * 100)}% off
                  </p>
                )}
              </div>

              {/* Variant selector */}
              {hasMultipleVariants && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    {variants[0]?.node.selectedOptions?.[0]?.name || 'Option'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, idx) => (
                      <button
                        key={v.node.id}
                        data-testid={`quick-view-variant-${idx}`}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${
                          selectedVariantIdx === idx
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground/50'
                        }`}
                      >
                        {v.node.selectedOptions?.[0]?.value || v.node.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Short description */}
              {product.node.description && (
                <p className="text-sm text-muted-foreground font-light leading-relaxed mb-5 line-clamp-3">
                  {product.node.description}
                </p>
              )}

              <div className="mt-auto space-y-2.5">
                <Button
                  onClick={handleAddToBag}
                  data-testid="quick-view-add-to-bag"
                  className="w-full"
                  disabled={!selectedVariant?.availableForSale}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {selectedVariant?.availableForSale !== false ? 'Add to Bag' : 'Sold Out'}
                </Button>

                <div className="flex gap-2">
                  <button
                    onClick={handleWishlist}
                    data-testid="quick-view-wishlist"
                    className="flex-1 flex items-center justify-center gap-2 border border-border py-2.5 text-sm rounded-sm hover:bg-muted transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
                    {inWishlist ? 'Saved' : 'Wishlist'}
                  </button>
                  <Link
                    to={`/product/${product.node.handle}`}
                    onClick={onClose}
                    data-testid="quick-view-full-details"
                    className="flex-1 flex items-center justify-center gap-2 border border-border py-2.5 text-sm rounded-sm hover:bg-muted transition-colors"
                  >
                    Full Details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
