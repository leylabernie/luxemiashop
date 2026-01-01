import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import type { ShopifyProduct } from '@/lib/shopify';

interface ProductInfoProps {
  product: ShopifyProduct['node'];
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Find the matching variant based on selected options
  const selectedVariant = product.variants.edges.find((variant) => {
    return variant.node.selectedOptions.every(
      (option) => selectedOptions[option.name] === option.value
    );
  });

  const currentPrice = selectedVariant?.node.price || product.priceRange.minVariantPrice;
  const isAvailable = selectedVariant?.node.availableForSale ?? true;

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select all options');
      return;
    }

    setIsAdding(true);
    
    addItem({
      product: { node: product },
      variantId: selectedVariant.node.id,
      variantTitle: selectedVariant.node.title,
      price: selectedVariant.node.price,
      quantity,
      selectedOptions: selectedVariant.node.selectedOptions,
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsAdding(false);

    toast.success('Added to bag', {
      description: `${product.title} has been added to your shopping bag.`,
    });
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-6">
      {/* Vendor & Type */}
      {product.vendor && (
        <p className="text-sm tracking-luxury uppercase text-muted-foreground">
          {product.vendor}
        </p>
      )}

      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-serif">{product.title}</h1>

      {/* Price */}
      <p className="text-2xl font-light">
        {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
      </p>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">
        {product.description || 'Exquisitely crafted with attention to every detail, this piece embodies the essence of traditional Indian artistry.'}
      </p>

      {/* Options */}
      <div className="space-y-5 pt-2">
        {product.options.map((option) => (
          <div key={option.name} className="space-y-3">
            <label className="text-sm font-medium uppercase tracking-wide">
              {option.name}
              {selectedOptions[option.name] && (
                <span className="font-normal text-muted-foreground ml-2">
                  — {selectedOptions[option.name]}
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => (
                <button
                  key={value}
                  onClick={() => handleOptionSelect(option.name, value)}
                  className={`px-4 py-2.5 text-sm border rounded-sm transition-all duration-300 ${
                    selectedOptions[option.name] === value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground/50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quantity */}
      <div className="space-y-3 pt-2">
        <label className="text-sm font-medium uppercase tracking-wide">Quantity</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-secondary transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-secondary transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add to Cart */}
      <div className="flex gap-3 pt-4">
        <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleAddToCart}
            disabled={!isAvailable || isAdding}
            className="w-full h-14 text-base relative overflow-hidden group"
            variant="luxury"
          >
            <motion.span
              initial={false}
              animate={{ y: isAdding ? -30 : 0, opacity: isAdding ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              {isAvailable ? 'Add to Bag' : 'Out of Stock'}
            </motion.span>
            <motion.span
              initial={false}
              animate={{ y: isAdding ? 0 : 30, opacity: isAdding ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Added!
            </motion.span>
          </Button>
        </motion.div>

        <Button variant="outline" size="icon" className="h-14 w-14">
          <Heart className="h-5 w-5" />
        </Button>

        <Button variant="outline" size="icon" className="h-14 w-14">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
        <div className="text-center py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Free Shipping</p>
          <p className="text-sm">On orders above ₹5,000</p>
        </div>
        <div className="text-center py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Easy Returns</p>
          <p className="text-sm">Within 15 days</p>
        </div>
      </div>
    </div>
  );
};
