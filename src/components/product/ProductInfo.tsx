import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, Minus, Plus, ShoppingBag, Truck, RotateCcw, Package, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
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

// Calculate estimated delivery dates
const getDeliveryDates = () => {
  const today = new Date();
  const standardStart = new Date(today);
  standardStart.setDate(today.getDate() + 7);
  const standardEnd = new Date(today);
  standardEnd.setDate(today.getDate() + 12);
  
  const expressDate = new Date(today);
  expressDate.setDate(today.getDate() + 3);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  return {
    standard: `${formatDate(standardStart)} - ${formatDate(standardEnd)}`,
    express: formatDate(expressDate),
  };
};

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
  const sku = selectedVariant?.node.sku || product.variants.edges[0]?.node.sku;
  
  const productSpecs = useMemo(() => extractProductSpecs(product.tags, product.productType), [product.tags, product.productType]);
  const deliveryDates = useMemo(() => getDeliveryDates(), []);

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
      <div className="flex items-baseline gap-3">
        <p className="text-2xl font-medium text-foreground">
          {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
        </p>
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

      {/* Options */}
      <div className="space-y-5">
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

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 pt-4">
        <div className="flex flex-col items-center text-center p-3 bg-card/50 rounded-sm border border-border/30">
          <Truck className="h-5 w-5 text-primary mb-2" />
          <p className="text-xs font-medium">Free Shipping</p>
          <p className="text-xs text-muted-foreground">On orders above $100</p>
        </div>
        <div className="flex flex-col items-center text-center p-3 bg-card/50 rounded-sm border border-border/30">
          <RotateCcw className="h-5 w-5 text-primary mb-2" />
          <p className="text-xs font-medium">Easy Returns</p>
          <p className="text-xs text-muted-foreground">Within 15 days</p>
        </div>
        <div className="flex flex-col items-center text-center p-3 bg-card/50 rounded-sm border border-border/30">
          <Package className="h-5 w-5 text-primary mb-2" />
          <p className="text-xs font-medium">Secure Package</p>
          <p className="text-xs text-muted-foreground">Gift-wrapped</p>
        </div>
      </div>
    </div>
  );
};
