import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, Minus, Plus, ShoppingBag, Truck, Package, Tag, Shield, Award, RefreshCcw, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { SizeGuideModal } from './SizeGuideModal';
import { StitchingSizeSelector } from '@/components/StitchingSizeSelector';
import type { ShopifyProduct } from '@/lib/shopify';

interface ProductInfoProps {
  product: ShopifyProduct['node'];
}

// Helper to extract product specs from tags
const extractProductSpecs = (tags?: string[], productType?: string) => {
  const specs: Record<string, string> = {};
  
  if (!tags) return specs;
  
  // Common fabric patterns
  const fabricKeywords = ['silk', 'cotton', 'georgette', 'chiffon', 'velvet', 'net', 'crepe', 'satin', 'brocade', 'jacquard', 'organza', 'chinnon', 'roman silk'];
  // Common work patterns
  const workKeywords = ['embroidery', 'embroidered', 'sequins', 'mirror', 'zari', 'thread work', 'stone work', 'beadwork', 'digital print', 'printed', 'woven', 'handcrafted'];
  // Color patterns
  const colorKeywords = ['pink', 'red', 'blue', 'green', 'yellow', 'purple', 'violet', 'cream', 'white', 'black', 'gold', 'silver', 'orange', 'maroon', 'teal', 'wine', 'ivory', 'emerald', 'mustard', 'rust', 'peach', 'coral', 'sea green', 'hot pink', 'royal'];

  const lowerTags = tags.map(t => t.toLowerCase());
  
  // Extract fabric
  const foundFabric = fabricKeywords.find(f => lowerTags.some(t => t.includes(f)));
  if (foundFabric) {
    specs.fabric = foundFabric.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  // Extract work type
  const foundWork = workKeywords.filter(w => lowerTags.some(t => t.includes(w)));
  if (foundWork.length > 0) {
    specs.work = foundWork.map(w => w.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ');
  }
  
  // Extract colors
  const foundColors = colorKeywords.filter(c => lowerTags.some(t => t.includes(c)));
  if (foundColors.length > 0) {
    specs.color = foundColors.slice(0, 2).map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ');
  }

  // Product type as occasion
  if (productType) {
    specs.type = productType;
  }

  return specs;
};

// Calculate estimated delivery dates (international shipping - 3-5 weeks)
const getDeliveryDates = () => {
  const today = new Date();
  
  // Standard delivery: 3-4 weeks (21-28 days)
  const standardStart = new Date(today);
  standardStart.setDate(today.getDate() + 21);
  const standardEnd = new Date(today);
  standardEnd.setDate(today.getDate() + 28);
  
  // Express delivery: 2-3 weeks (14-21 days)
  const expressStart = new Date(today);
  expressStart.setDate(today.getDate() + 14);
  const expressEnd = new Date(today);
  expressEnd.setDate(today.getDate() + 21);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };
  
  return {
    standard: `${formatDate(standardStart)} - ${formatDate(standardEnd)}`,
    express: `${formatDate(expressStart)} - ${formatDate(expressEnd)}`,
  };
};

// Force rebuild 2026-04-06
export const ProductInfo = ({ product }: ProductInfoProps) => {
  // Auto-select options when there's only one value per option (e.g. "Default Title")
  const defaultOptions = useMemo(() => {
    const defaults: Record<string, string> = {};
    const hasRealOptions = product.options.some(
      (opt) => opt.values.length > 1 || (opt.values.length === 1 && opt.values[0] !== 'Default Title')
    );
    if (!hasRealOptions || product.variants.edges.length === 1) {
      product.options.forEach((opt) => {
        if (opt.values.length === 1) {
          defaults[opt.name] = opt.values[0];
        }
      });
    }
    return defaults;
  }, [product.options, product.variants.edges.length]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(defaultOptions);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [stitchingSize, setStitchingSize] = useState<string | null>(null);
  const [showSizeValidation, setShowSizeValidation] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Find the matching variant based on selected options
  const selectedVariant = product.variants.edges.find((variant) => {
    return variant.node.selectedOptions.every(
      (option) => selectedOptions[option.name] === option.value
    );
  });

  // Find the best-matching variant for price display even when not all options are selected.
  // This ensures the price updates as soon as a stitching type is picked.
  const bestMatchVariant = useMemo(() => {
    if (selectedVariant) return selectedVariant;

    const selectedKeys = Object.keys(selectedOptions);
    if (selectedKeys.length === 0) return null;

    let bestVar: typeof product.variants.edges[0] | null = null;
    let bestCount = 0;

    for (const variant of product.variants.edges) {
      let count = 0;
      for (const opt of variant.node.selectedOptions) {
        if (selectedOptions[opt.name] === opt.value) {
          count++;
        }
      }
      if (count > bestCount) {
        bestCount = count;
        bestVar = variant;
      }
    }

    return bestVar;
  }, [selectedVariant, selectedOptions, product.variants.edges]);

  const currentPrice = bestMatchVariant?.node.price || product.priceRange.minVariantPrice;
  const isAvailable = selectedVariant?.node.availableForSale ?? true;
  const sku = selectedVariant?.node.sku || product.variants.edges[0]?.node.sku;
  
  const productSpecs = useMemo(() => extractProductSpecs(product.tags, product.productType), [product.tags, product.productType]);
  const deliveryDates = useMemo(() => getDeliveryDates(), []);

  // Determine if the currently selected variant requires stitching size
  const needsStitchingSize = useMemo(() => {
    // Check both option names and values for stitching-related selections
    return Object.entries(selectedOptions).some(([key, val]) => {
      const lowerKey = key.toLowerCase();
      const lowerVal = val.toLowerCase();
      // Match option name "Stitching" or values containing "stitch" (e.g. "Semi-Stitched", "Blouse Stitching")
      const isStitchingOption = lowerKey.includes('stitch') || lowerVal.includes('stitch');
      const isUnstitched = lowerVal.startsWith('unstitched') || lowerVal === 'unstitched';
      return isStitchingOption && !isUnstitched;
    });
  }, [selectedOptions]);

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
    // Reset stitching size when switching to Unstitched or a non-stitch option
    if (
      value.toLowerCase().startsWith('unstitched') ||
      (!value.toLowerCase().includes('stitch'))
    ) {
      setStitchingSize(null);
      setShowSizeValidation(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select all options');
      return;
    }

    if (needsStitchingSize && !stitchingSize) {
      setShowSizeValidation(true);
      toast.error('Please select a stitching size');
      return;
    }

    setIsAdding(true);

    const customAttributes =
      needsStitchingSize && stitchingSize
        ? [{ key: 'Stitching Size', value: stitchingSize }]
        : undefined;

    addItem({
      product: { node: product },
      variantId: selectedVariant.node.id,
      variantTitle: selectedVariant.node.title,
      price: selectedVariant.node.price,
      quantity,
      selectedOptions: selectedVariant.node.selectedOptions,
      customAttributes,
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsAdding(false);

    toast.success('Added to bag', {
      description: `${product.title} has been added to your shopping bag.`,
    });
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-6">
      {/* Style No / SKU */}
      {sku && (
        <p className="text-xs tracking-wider text-muted-foreground font-mono">
          Style No: {sku}
        </p>
      )}

      {/* Vendor */}
      {product.vendor && (
        <p className="text-sm tracking-luxury uppercase text-primary font-medium">
          {product.vendor}
        </p>
      )}

      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-serif leading-tight">{product.title}</h1>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <p className="text-2xl font-medium text-foreground">
            {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
            <Tag className="h-3 w-3" />
            Save 30% with code LUXE2026
          </span>
        </div>
        <span className="text-sm text-muted-foreground">Inclusive of all taxes</span>
      </div>

      {/* Estimated Delivery */}
      <div className="bg-card/50 border border-border/50 rounded-sm p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4 text-primary" />
          <span className="font-medium">Estimated Delivery</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Standard</p>
            <p className="text-foreground">{deliveryDates.standard}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Express</p>
            <p className="text-foreground">{deliveryDates.express}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Product Specifications */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide">Product Details</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {productSpecs.color && (
            <>
              <span className="text-muted-foreground">Color</span>
              <span className="text-foreground">{productSpecs.color}</span>
            </>
          )}
          {productSpecs.fabric && (
            <>
              <span className="text-muted-foreground">Fabric</span>
              <span className="text-foreground">{productSpecs.fabric}</span>
            </>
          )}
          {productSpecs.work && (
            <>
              <span className="text-muted-foreground">Work</span>
              <span className="text-foreground">{productSpecs.work}</span>
            </>
          )}
          {productSpecs.type && (
            <>
              <span className="text-muted-foreground">Type</span>
              <span className="text-foreground">{productSpecs.type}</span>
            </>
          )}
          <span className="text-muted-foreground">Closure</span>
          <span className="text-foreground">Back Hook-Eye / Zip</span>
          <span className="text-muted-foreground">Manufacturer</span>
          <span className="text-foreground">LuxeMia Fashion Pvt Ltd</span>
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium uppercase tracking-wide">Product Speciality</h3>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {product.description || 'Exquisitely crafted with attention to every detail, this piece embodies the essence of traditional Indian artistry. Perfect for ceremonies, weddings, and special occasions.'}
        </p>
      </div>

      <Separator />

      {/* Options — hide sections with only a "Default Title" value */}
      <div className="space-y-5">
        {product.options
          .filter((option) => !(option.values.length === 1 && option.values[0] === 'Default Title'))
          .map((option) => (
          <div key={option.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium uppercase tracking-wide">
                {option.name}
                {selectedOptions[option.name] && (
                  <span className="font-normal text-muted-foreground ml-2">
                    — {selectedOptions[option.name]}
                  </span>
                )}
              </label>
              {option.name.toLowerCase() === 'size' && (
                <SizeGuideModal category={product.productType} />
              )}
            </div>
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

      {/* Stitching Size Selector */}
      {needsStitchingSize && (
        <StitchingSizeSelector
          selectedSize={stitchingSize}
          onSizeChange={setStitchingSize}
          showValidation={showSizeValidation}
        />
      )}

      {/* Quantity */}
      <div className="space-y-3">
        <label className="text-sm font-medium uppercase tracking-wide">Quantity</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-secondary transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
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
      <div className="flex gap-3 pt-2">
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


      <Separator />

      {/* Trust Badges - Enhanced */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">100% Authentic</p>
            <p className="text-xs text-muted-foreground">Certified handcrafted</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <RefreshCcw className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Easy Returns</p>
            <p className="text-xs text-muted-foreground">7-day return policy</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Secure Checkout</p>
            <p className="text-xs text-muted-foreground">SSL encrypted</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Global Shipping</p>
            <p className="text-xs text-muted-foreground">Trackable delivery</p>
          </div>
        </div>
      </div>

      {/* Additional Trust Elements */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>Order within <span className="text-foreground font-medium">2 hrs 34 mins</span> for fastest delivery</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>Quality checked by <span className="text-foreground font-medium">LuxeMia artisans</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4 text-primary" />
          <span>Premium packaging with <span className="text-foreground font-medium">gift box included</span></span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="pt-4 border-t border-border/30 mt-4">
        <p className="text-xs text-muted-foreground mb-2">We Accept</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-2 py-1 bg-muted rounded text-xs font-medium">Visa</div>
          <div className="px-2 py-1 bg-muted rounded text-xs font-medium">Mastercard</div>
          <div className="px-2 py-1 bg-muted rounded text-xs font-medium">Amex</div>
          <div className="px-2 py-1 bg-muted rounded text-xs font-medium">PayPal</div>
          <div className="px-2 py-1 bg-muted rounded text-xs font-medium">UPI</div>
        </div>
      </div>
    </div>
  );
};
