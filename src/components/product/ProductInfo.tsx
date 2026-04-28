import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, Minus, Plus, ShoppingBag, Truck, Package, Tag, Shield, Award, RefreshCcw, Lock, Info, Scissors, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { SizeGuideModal } from './SizeGuideModal';
import { StitchingSizeSelector } from '@/components/StitchingSizeSelector';
import type { SizeMode } from '@/components/StitchingSizeSelector';
import { DeliveryEstimate } from './DeliveryEstimate';
import { NecklineSelector, type NecklineOption } from './NecklineSelector';
import { BottomStyleSelector, type BottomStyleOption } from './BottomStyleSelector';
import { SleeveStyleSelector, type SleeveStyleOption } from './SleeveStyleSelector';
import type { ShopifyProduct } from '@/lib/shopify';

// Utsav-style Stitching Type options with price modifiers
interface StitchingTypeOption {
  id: string;
  label: string;
  description: string;
  priceModifier: number;
  requiresMeasurement: boolean;
  deliveryExtraDays: number;
}

const STITCHING_TYPE_OPTIONS: StitchingTypeOption[] = [
  {
    id: 'semi-stitched',
    label: 'Semi Stitched',
    description: 'Pre-constructed with adjustable side seams. Select your standard size for a near-perfect fit.',
    priceModifier: 0,
    requiresMeasurement: false,
    deliveryExtraDays: 0,
  },
  {
    id: 'ready-to-wear',
    label: 'Ready to Wear',
    description: 'Fully stitched to standard measurements matching the product image. Select your bust size.',
    priceModifier: 15,
    requiresMeasurement: true,
    deliveryExtraDays: 3,
  },
  {
    id: 'made-to-measure',
    label: 'Made to Measure (UDesign)',
    description: 'Bespoke tailoring with 200+ style combinations. Customize neckline, sleeves, and bottom style. Submit measurements after ordering.',
    priceModifier: 25,
    requiresMeasurement: true,
    deliveryExtraDays: 5,
  },
];

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

// Product types that support blouse neckline selection (lehenga, saree)
const BLOUSE_PRODUCT_TYPES = ['lehenga choli', 'lehenga', 'saree', 'sarees'];

const isBlouseProductType = (productType?: string, tags?: string[]): boolean => {
  if (productType && BLOUSE_PRODUCT_TYPES.some((t) => productType.toLowerCase().includes(t)))
    return true;
  if (tags) {
    const lower = tags.map((t) => t.toLowerCase());
    return lower.some(
      (t) => t.includes('lehenga') || t.includes('saree') || t.includes('choli')
    );
  }
  return false;
};

// Determine if a product type supports stitching options (salwar, lehenga, saree, etc.)
const STITCHABLE_PRODUCT_TYPES = [
  'salwar kameez', 'salwar kameez suit', 'lehenga', 'lehenga choli', 'saree', 'sarees',
  'anarkali', 'sharara suit', 'pakistani suit', 'palazzo suit', 'gharara suit',
  'wedding suit',
];

const isStitchableProduct = (productType?: string, tags?: string[]): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  if (STITCHABLE_PRODUCT_TYPES.some(t => lower.includes(t))) return true;
  // Also check tags for suit/salwar indicators
  if (tags) {
    const lowerTags = tags.map(t => t.toLowerCase());
    return lowerTags.some(t =>
      t.includes('salwar') || t.includes('suit') || t.includes('lehenga') || t.includes('saree') || t.includes('anarkali')
    );
  }
  return false;
};

// Product types that should show a bottom/lower style selector
const BOTTOM_STYLE_PRODUCT_TYPES = [
  'salwar', 'suit', 'anarkali', 'pakistani', 'sharara',
];

const shouldShowBottomStyle = (productType?: string, tags?: string[]): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  if (BOTTOM_STYLE_PRODUCT_TYPES.some(t => lower.includes(t))) return true;
  if (tags) {
    const lowerTags = tags.map(t => t.toLowerCase());
    return lowerTags.some(t =>
      t.includes('salwar') || t.includes('suit') || t.includes('anarkali') || t.includes('pakistani') || t.includes('sharara')
    );
  }
  return false;
};

// Menswear check
const MENSWEAR_PRODUCT_TYPES = ['sherwani', 'kurta', 'menswear', 'men'];

const isMenswearProduct = (productType?: string, tags?: string[]): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  if (MENSWEAR_PRODUCT_TYPES.some(t => lower.includes(t))) return true;
  if (tags) {
    const lowerTags = tags.map(t => t.toLowerCase());
    return lowerTags.some(t => t.includes('sherwani') || t.includes('kurta') || t.includes('menswear'));
  }
  return false;
};

// Check if a product already has numeric size variants from Shopify (28-62)
const hasNumericSizeVariants = (product: ShopifyProduct['node']): boolean => {
  const sizeOption = product.options.find(
    (opt) => opt.name.toLowerCase() === 'size'
  );
  if (!sizeOption) return false;
  // Check if any size values look like numeric bust sizes (e.g. "28", "30", "32")
  const numericValues = sizeOption.values.filter(v => /^\d{2}$/.test(v.trim()));
  return numericValues.length >= 3;
};

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const isStitchable = isStitchableProduct(product.productType, product.tags);
  const isMenswear = isMenswearProduct(product.productType, product.tags);
  const showBottomStyleOption = shouldShowBottomStyle(product.productType, product.tags);
  const productHasNumericSizes = hasNumericSizeVariants(product);

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
  const [selectedNeckline, setSelectedNeckline] = useState<NecklineOption>('Round Neck');
  const [selectedBottomStyle, setSelectedBottomStyle] = useState<BottomStyleOption | null>(null);
  const [selectedSleeveStyle, setSelectedSleeveStyle] = useState<SleeveStyleOption | null>(null);
  const [customAlteration, setCustomAlteration] = useState('');
  const [selectedStitchingType, setSelectedStitchingType] = useState<string | null>(
    isStitchable ? 'semi-stitched' : null
  );
  const [showStitchingInfo, setShowStitchingInfo] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Find the matching variant based on selected options
  const selectedVariant = product.variants.edges.find((variant) => {
    return variant.node.selectedOptions.every(
      (option) => selectedOptions[option.name] === option.value
    );
  });

  // Find the best-matching variant for price display even when not all options are selected.
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

  // Calculate current price, including stitching option premium if applicable
  const basePrice = bestMatchVariant?.node.price || product.priceRange.minVariantPrice;
  const stitchingPremium = useMemo(() => {
    // Use the Utsav-style stitching type selector for stitchable products
    if (isStitchable && selectedStitchingType) {
      const option = STITCHING_TYPE_OPTIONS.find(o => o.id === selectedStitchingType);
      return option?.priceModifier || 0;
    }
    // Fallback for non-stitchable products that still have stitching in variant names
    for (const [key, value] of Object.entries(selectedOptions)) {
      if (key.toLowerCase().includes('stitch') && value) {
        const lowerValue = value.toLowerCase();
        if (lowerValue.includes('blouse')) return 15;
        if (lowerValue.includes('full')) return 25;
        if (lowerValue.includes('semi')) return 0;
      }
    }
    return 0;
  }, [selectedOptions, selectedStitchingType, isStitchable]);

  const currentPrice = useMemo(() => {
    const baseAmount = parseFloat(basePrice.amount);
    return {
      amount: (baseAmount + stitchingPremium).toString(),
      currencyCode: basePrice.currencyCode,
    };
  }, [basePrice, stitchingPremium]);
  const isAvailable = selectedVariant?.node.availableForSale ?? true;
  const sku = selectedVariant?.node.sku || product.variants.edges[0]?.node.sku;
  
  const productSpecs = useMemo(() => extractProductSpecs(product.tags, product.productType), [product.tags, product.productType]);

  // Determine if the currently selected variant requires stitching size
  const needsStitchingSize = useMemo(() => {
    // For stitchable products, check the Utsav-style selector
    if (isStitchable) {
      const selectedOption = STITCHING_TYPE_OPTIONS.find(o => o.id === selectedStitchingType);
      return selectedOption?.requiresMeasurement || false;
    }
    // Fallback for products with stitching in variant names
    return Object.entries(selectedOptions).some(([key, val]) => {
      const lowerKey = key.toLowerCase();
      const lowerVal = val.toLowerCase();
      const isStitchingOption = lowerKey.includes('stitch') || lowerVal.includes('stitch');
      const isUnstitched = lowerVal.startsWith('unstitched') || lowerVal === 'unstitched';
      return isStitchingOption && !isUnstitched;
    });
  }, [selectedOptions, selectedStitchingType, isStitchable]);

  // Determine the size mode based on stitching type
  const sizeMode: SizeMode = useMemo(() => {
    if (isMenswear) return 'menswear';
    if (selectedStitchingType === 'semi-stitched') return 'letter';
    return 'numeric'; // ready-to-wear or made-to-measure
  }, [selectedStitchingType, isMenswear]);

  // Size label and hint based on stitching type
  const sizeLabel = useMemo(() => {
    if (isMenswear) return 'Select Size';
    if (selectedStitchingType === 'semi-stitched') return 'Standard Size';
    if (selectedStitchingType === 'ready-to-wear') return 'Bust Size';
    if (selectedStitchingType === 'made-to-measure') return 'Bust Size';
    return 'Stitching Size';
  }, [selectedStitchingType, isMenswear]);

  const sizeHint = useMemo(() => {
    if (isMenswear) return undefined;
    if (selectedStitchingType === 'semi-stitched') return 'Standard sizes';
    if (selectedStitchingType === 'ready-to-wear' || selectedStitchingType === 'made-to-measure') return 'Bust size in inches';
    return undefined;
  }, [selectedStitchingType, isMenswear]);

  // Whether blouse neckline selector should show
  const showNeckline = useMemo(() => {
    // Always show for blouse products (lehenga/saree) when stitching is selected
    if (isBlouseProductType(product.productType, product.tags) && needsStitchingSize) {
      return true;
    }
    // Show for salwar/suit products when Made to Measure is selected
    if (
      !isBlouseProductType(product.productType, product.tags) &&
      selectedStitchingType === 'made-to-measure' &&
      showBottomStyleOption
    ) {
      return true;
    }
    return false;
  }, [product.productType, product.tags, needsStitchingSize, selectedStitchingType, showBottomStyleOption]);

  // Whether sleeve style selector should show (only for Made to Measure)
  const showSleeveStyle = useMemo(() => {
    return isStitchable && selectedStitchingType === 'made-to-measure';
  }, [isStitchable, selectedStitchingType]);

  // Whether to show the StitchingSizeSelector (only when the product doesn't have numeric sizes from Shopify)
  const showStitchingSizeSelector = useMemo(() => {
    if (isMenswear) return true; // Menswear always needs a size selector
    if (productHasNumericSizes) return false; // Product already has size variants in Shopify
    return needsStitchingSize;
  }, [needsStitchingSize, productHasNumericSizes, isMenswear]);

  // Whether to show the Customize header (all stitchable products + menswear)
  const showCustomizeHeader = isStitchable || isMenswear;

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
    
    // If this is a stitching option, show the size selector and trigger validation
    if (optionName.toLowerCase().includes('stitch') && value.toLowerCase().includes('stitch')) {
      setShowSizeValidation(true);
    }
    
    // Reset stitching size when switching to Unstitched or a non-stitch option
    if (
      value.toLowerCase().startsWith('unstitched') ||
      (!value.toLowerCase().includes('stitch'))
    ) {
      setStitchingSize(null);
      setShowSizeValidation(false);
    }
  };

  const handleStitchingTypeSelect = (typeId: string) => {
    setSelectedStitchingType(typeId);
    const option = STITCHING_TYPE_OPTIONS.find(o => o.id === typeId);
    if (option?.requiresMeasurement) {
      setShowSizeValidation(true);
    } else {
      // Semi Stitched doesn't require a numeric size but we still show letter sizes
      setShowSizeValidation(false);
    }
    // Reset size when changing stitching type since size mode changes
    setStitchingSize(null);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select all options');
      return;
    }

    // For stitchable products, require stitching type
    if (isStitchable && !selectedStitchingType) {
      toast.error('Please select a stitching type');
      return;
    }

    // Require stitching size when needed and not already provided by Shopify variants
    if (needsStitchingSize && !productHasNumericSizes && !stitchingSize) {
      setShowSizeValidation(true);
      toast.error('Please select a size for stitching');
      return;
    }

    // For menswear, require size
    if (isMenswear && !stitchingSize && !productHasNumericSizes) {
      setShowSizeValidation(true);
      toast.error('Please select a size');
      return;
    }

    setIsAdding(true);

    const customAttributes: Array<{ key: string; value: string }> = [];
    if (isStitchable && selectedStitchingType) {
      const stitchingOption = STITCHING_TYPE_OPTIONS.find(o => o.id === selectedStitchingType);
      customAttributes.push({ key: 'Stitching Type', value: stitchingOption?.label || selectedStitchingType });
      if (stitchingOption?.priceModifier && stitchingOption.priceModifier > 0) {
        customAttributes.push({ key: 'Stitching Charge', value: `+$${stitchingOption.priceModifier}.00` });
      }
    }
    if (needsStitchingSize && stitchingSize) {
      customAttributes.push({ key: 'Stitching Size', value: stitchingSize });
    }
    if (showNeckline) {
      customAttributes.push({ key: 'Blouse Neckline', value: selectedNeckline });
    }
    if (showBottomStyleOption && selectedBottomStyle) {
      customAttributes.push({ key: 'Bottom Style', value: selectedBottomStyle });
    }
    if (showSleeveStyle && selectedSleeveStyle) {
      customAttributes.push({ key: 'Sleeve Style', value: selectedSleeveStyle });
    }
    if (customAlteration.trim()) {
      customAttributes.push({ key: 'Custom Alteration Instructions', value: customAlteration.trim() });
    }

    addItem({
      product: { node: product },
      variantId: selectedVariant.node.id,
      variantTitle: selectedVariant.node.title,
      price: selectedVariant.node.price,
      quantity,
      selectedOptions: selectedVariant.node.selectedOptions,
      customAttributes: customAttributes.length > 0 ? customAttributes : undefined,
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
          {product.compareAtPriceRange?.maxVariantPrice?.amount &&
            parseFloat(product.compareAtPriceRange.maxVariantPrice.amount) > parseFloat(currentPrice.amount) && (
            <p className="text-lg text-muted-foreground line-through">
              {formatPrice(
                product.compareAtPriceRange.maxVariantPrice.amount,
                product.compareAtPriceRange.maxVariantPrice.currencyCode
              )}
            </p>
          )}
        </div>
        {product.compareAtPriceRange?.maxVariantPrice?.amount &&
          parseFloat(product.compareAtPriceRange.maxVariantPrice.amount) > parseFloat(currentPrice.amount) && (
          <p className="text-sm text-primary font-medium">
            {Math.round((1 - parseFloat(currentPrice.amount) /
              parseFloat(product.compareAtPriceRange.maxVariantPrice.amount)) * 100)}% off — You save {formatPrice(
              (parseFloat(product.compareAtPriceRange.maxVariantPrice.amount) - parseFloat(currentPrice.amount)).toFixed(2),
              currentPrice.currencyCode
            )}
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
            <Tag className="h-3 w-3" />
            Save 30% with code LUXE2026
          </span>
        </div>
        <span className="text-sm text-muted-foreground">Inclusive of all taxes</span>
      </div>

      {/* Estimated Delivery — dynamic based on stitching selection */}
      <DeliveryEstimate
        hasStitching={needsStitchingSize}
        extraTailoringDays={selectedStitchingType
          ? (STITCHING_TYPE_OPTIONS.find(o => o.id === selectedStitchingType)?.deliveryExtraDays || 0)
          : 0
        }
      />

      <Separator />

      {/* ─── Utsav-style "Customize" Section ─── */}
      {showCustomizeHeader && (
        <div className="space-y-4">
          {/* Customize Header */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Customize: {product.title}
            </h3>
            <div className="border-b border-border" />
            {/* Base product line item */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="text-primary text-sm">☑</span>
                <span className="text-sm text-foreground font-medium">{product.title}</span>
              </div>
              <span className="text-sm text-foreground font-medium">
                {formatPrice(basePrice.amount, basePrice.currencyCode)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Stitching Type Selector (for stitchable products) ─── */}
      {isStitchable && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium uppercase tracking-wide">
                Stitching Type
              </label>
            </div>
            <button
              onClick={() => setShowStitchingInfo(showStitchingInfo ? null : 'main')}
              className="text-xs text-primary hover:text-primary/80 underline underline-offset-4"
            >
              What's this?
            </button>
          </div>

          {/* Stitching Info Popover */}
          {showStitchingInfo && (
            <div className="bg-secondary/50 border border-border rounded-sm p-4 text-sm text-muted-foreground space-y-3">
              <p><strong className="text-foreground">Semi Stitched:</strong> Pre-constructed outfit with adjustable side seams. Select your standard size for a near-perfect fit. Alterations can be done locally if needed.</p>
              <p><strong className="text-foreground">Ready to Wear:</strong> Fully stitched to your selected size. Choose your bust size and we'll tailor it completely — ready to wear right out of the box.</p>
              <p><strong className="text-foreground">Made to Measure (UDesign):</strong> Our bespoke tailoring service with 200+ style combinations. Submit your exact measurements after placing the order for a perfect custom fit. You can customize the neckline, sleeves, and bottom style.</p>
            </div>
          )}

          <div className="space-y-3">
            {STITCHING_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleStitchingTypeSelect(option.id)}
                className={`w-full text-left p-4 border rounded-sm transition-all duration-300 ${
                  selectedStitchingType === option.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-foreground/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      selectedStitchingType === option.id ? 'text-primary' : 'text-foreground'
                    }`}>
                      {option.label}
                    </span>
                    {option.id === 'semi-stitched' && (
                      <span className="text-[10px] font-medium uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded">Popular</span>
                    )}
                    {option.id === 'made-to-measure' && (
                      <span className="text-[10px] font-medium uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded">UDesign</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    option.priceModifier === 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-foreground'
                  }`}>
                    {option.priceModifier === 0
                      ? 'Included'
                      : `+$${option.priceModifier}.00`
                    }
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}
                  {option.deliveryExtraDays > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 ml-1">
                      (+{option.deliveryExtraDays} days for tailoring)
                    </span>
                  )}
                </p>
              </button>
            ))}
          </div>

          {/* Made to Measure — post-order measurement info box */}
          {selectedStitchingType === 'made-to-measure' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-sm">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                You can submit your measurements after placing the order. Select Made to Measure, add to bag, complete your order, then go to <strong>My Account → My Orders</strong> to submit your measurements at your convenience.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Menswear Size Selector ─── */}
      {isMenswear && !productHasNumericSizes && (
        <StitchingSizeSelector
          selectedSize={stitchingSize}
          onSizeChange={setStitchingSize}
          showValidation={showSizeValidation}
          sizeMode="menswear"
          label="Select Size"
        />
      )}

      {/* ─── Product Options (Color, Size from Shopify) ─── */}
      <div className="space-y-5">
        {product.options
          .filter((option) => {
            // Hide "Default Title" single-value options
            if (option.values.length === 1 && option.values[0] === 'Default Title') return false;
            // For stitchable products, hide the "Stitching" option from Shopify variants
            // since we use our custom Utsav-style selector above instead
            if (isStitchable && option.name.toLowerCase().includes('stitch')) return false;
            // If product already has numeric sizes and we're showing stitching, 
            // don't duplicate the size selector — the StitchingSizeSelector handles it
            if (productHasNumericSizes && option.name.toLowerCase() === 'size') return false;
            return true;
          })
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

      {/* ─── Stitching Size Selector (when product doesn't have Shopify size variants) ─── */}
      {showStitchingSizeSelector && !isMenswear && (
        <StitchingSizeSelector
          selectedSize={stitchingSize}
          onSizeChange={setStitchingSize}
          showValidation={showSizeValidation}
          sizeMode={sizeMode}
          label={sizeLabel}
          hint={sizeHint}
        />
      )}

      {/* ─── Bottom / Lower Style Selector ─── */}
      {showBottomStyleOption && needsStitchingSize && (
        <BottomStyleSelector
          selected={selectedBottomStyle}
          onChange={setSelectedBottomStyle}
        />
      )}

      {/* ─── Blouse Neckline Selector ─── */}
      {showNeckline && (
        <NecklineSelector selected={selectedNeckline} onChange={setSelectedNeckline} />
      )}

      {/* ─── Sleeve Style Selector (Made to Measure only) ─── */}
      {showSleeveStyle && (
        <SleeveStyleSelector
          selected={selectedSleeveStyle}
          onChange={setSelectedSleeveStyle}
        />
      )}

      {/* ─── Custom Alteration Option ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium uppercase tracking-wide">Custom Alterations</label>
          <span className="text-[10px] text-primary font-medium uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">Optional</span>
        </div>
        <textarea
          value={customAlteration}
          onChange={(e) => setCustomAlteration(e.target.value)}
          placeholder="e.g., Add sleeves, change length, or specific fit requests..."
          className="w-full min-h-[80px] p-3 text-sm bg-background border border-border rounded-sm focus:border-primary outline-none transition-colors resize-none"
        />
        <p className="text-[11px] text-muted-foreground italic">
          * Our tailors will review your requests. Some complex alterations may incur additional charges.
        </p>
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
          {product.description || 'Beautifully made with attention to every detail, this piece features traditional Indian design elements. Perfect for ceremonies, weddings, and special occasions.'}
        </p>
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
            <p className="text-xs text-muted-foreground">Quality assured</p>
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
        {/* Urgency info now shown in DeliveryEstimate component */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>Quality checked by <span className="text-foreground font-medium">LuxeMia team</span></span>
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
