import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, CheckCircle2, Minus, Plus, ShoppingBag, Truck, Package, RefreshCcw, Lock, Info, Scissors, MessageCircle, BadgeCheck } from 'lucide-react';
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
import { getShipByLabel } from '@/lib/shipBy';
import { getCustomizableProduct } from '@/lib/customizableProducts';

// Utsav-style Stitching Type options with price modifiers
interface StitchingTypeOption {
  id: string;
  label: string;
  description: string;
  priceModifier: number;
  requiresMeasurement: boolean;
}

const STITCHING_TYPE_OPTIONS: StitchingTypeOption[] = [
  {
    id: 'semi-stitched',
    label: 'Semi Stitched',
    description: 'Pre-constructed with adjustable side seams. Select your standard size for a near-perfect fit.',
    priceModifier: 0,
    requiresMeasurement: false,
  },
  {
    id: 'ready-to-wear',
    label: 'Ready to Wear',
    description: 'Fully stitched to standard measurements matching the product image. Select your bust size.',
    priceModifier: 15,
    requiresMeasurement: true,
  },
  {
    id: 'made-to-measure',
    label: 'Made to Measure (UDesign)',
    description: 'Made-to-measure tailoring with the neckline, sleeve, and bottom-style choices shown on this page. Submit measurements after ordering.',
    priceModifier: 25,
    requiresMeasurement: true,
  },
];

const openTailoringQuote = (option: StitchingTypeOption) => {
  const message = encodeURIComponent(
    `Hi LuxeMia, I would like a tailoring quote for ${option.label}.`
  );
  window.open(`https://wa.me/12153419990?text=${message}`, '_blank', 'noopener,noreferrer');
};

interface ProductInfoProps {
  product: ShopifyProduct['node'];
}

// Helper to extract product specs from tags
const extractProductSpecs = (tags?: string[], productType?: string) => {
  const specs: Record<string, string> = {};
  const lowerProductType = productType?.toLowerCase() || '';
  const isAccessory = [
    'jewel', 'accessory', 'necklace', 'choker', 'earring', 'bangle',
    'bracelet', 'ring', 'bag', 'clutch', 'footwear', 'jutti', 'mojri',
  ].some((type) => lowerProductType.includes(type));

  if (productType) {
    specs.type = productType;
  }

  if (!tags) return specs;

  // A closure is displayed only when the catalog explicitly supplies one.
  const closureTag = tags.find((tag) => tag.toLowerCase().startsWith('closure:'));
  if (closureTag) {
    const closure = closureTag.slice(closureTag.indexOf(':') + 1).trim();
    if (closure) specs.closure = closure;
  }

  // Included pieces must come from an explicit catalog tag. Do not infer a
  // dupatta, blouse, bottom, jewelry piece, or accessory from the product type.
  const includedPiecePrefixes = [
    'included:',
    'included pieces:',
    'pieces:',
    'set includes:',
    'package includes:',
  ];
  const includedPiecesTag = tags.find((tag) =>
    includedPiecePrefixes.some((prefix) => tag.toLowerCase().startsWith(prefix)),
  );
  if (includedPiecesTag) {
    const matchedPrefix = includedPiecePrefixes.find((prefix) =>
      includedPiecesTag.toLowerCase().startsWith(prefix),
    );
    const includedPieces = matchedPrefix
      ? includedPiecesTag.slice(matchedPrefix.length).trim()
      : '';
    if (includedPieces) specs.includedPieces = includedPieces;
  }

  // Legacy accessory tags contain garment attributes on some listings. Avoid
  // surfacing those as jewelry specifications until the catalog is corrected.
  if (isAccessory) return specs;
  
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

  return specs;
};

// Product types that support blouse neckline selection (lehenga, saree)
const BLOUSE_PRODUCT_TYPES = ['lehenga choli', 'lehenga', 'saree', 'sarees'];

const NON_STITCHABLE_PRODUCT_TYPES = [
  'jewelry', 'jewellery', 'accessory', 'accessories', 'necklace', 'choker',
  'earring', 'bangle', 'bracelet', 'ring', 'bag', 'clutch', 'footwear',
  'jutti', 'mojri',
];

const isAccessoryProductType = (productType?: string): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  return NON_STITCHABLE_PRODUCT_TYPES.some((type) => lower.includes(type));
};

const isBlouseProductType = (productType?: string, tags?: string[]): boolean => {
  if (isAccessoryProductType(productType)) return false;
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
  if (isAccessoryProductType(productType)) return false;
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
  if (isAccessoryProductType(productType)) return false;
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
  const [searchParams] = useSearchParams();
  const requestedVariantId = searchParams.get('variant');
  const customizableProduct = getCustomizableProduct(product.handle);
  const isStitchable = !customizableProduct && isStitchableProduct(product.productType, product.tags);
  const isMenswear = !customizableProduct && isMenswearProduct(product.productType, product.tags);
  const showBottomStyleOption = !customizableProduct && shouldShowBottomStyle(product.productType, product.tags);
  const productHasNumericSizes = hasNumericSizeVariants(product);

  // Honor Merchant Center variant links while preserving the first available
  // variant as the normal default when no variant query parameter is present.
  const defaultOptions = useMemo(() => {
    const defaults: Record<string, string> = {};
    const requestedVariant = requestedVariantId
      ? product.variants.edges.find((edge) =>
          edge.node.id === requestedVariantId ||
          edge.node.id.endsWith(`/${requestedVariantId}`)
        )
      : undefined;
    const requestedPurchasable = requestedVariant?.node.availableForSale !== false
      ? requestedVariant
      : undefined;
    const firstPurchasable = requestedPurchasable ?? product.variants.edges.find(
      (edge) => edge.node.availableForSale !== false
    ) ?? product.variants.edges[0];

    firstPurchasable?.node.selectedOptions.forEach((option) => {
      defaults[option.name] = option.value;
    });

    return defaults;
  }, [product.variants.edges, requestedVariantId]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(defaultOptions);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [stitchingSize, setStitchingSize] = useState<string | null>(null);
  const [showSizeValidation, setShowSizeValidation] = useState(false);
  const [selectedNeckline, setSelectedNeckline] = useState<NecklineOption>('Round Neck');
  const [selectedBottomStyle, setSelectedBottomStyle] = useState<BottomStyleOption | null>(null);
  const [selectedSleeveStyle, setSelectedSleeveStyle] = useState<SleeveStyleOption | null>(null);
  const [customAlteration, setCustomAlteration] = useState('');
  const [requestedCustomColor, setRequestedCustomColor] = useState('');
  const [selectedStitchingType, setSelectedStitchingType] = useState<string | null>(
    isStitchable ? 'semi-stitched' : null
  );
  const [showStitchingInfo, setShowStitchingInfo] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Find the matching variant based on selected options
  const selectedVariant = product.variants.edges.find((variant) => {
    return variant.node.selectedOptions.every(
      (option) => selectedOptions[option.name] === option.value
    );
  });

  // Products with a single Shopify variant do not need an option selection.
  // Keep that variant available even when Shopify returns an option name that
  // is not represented by the tailoring controls shown on this page.
  const purchasableVariant = (
    selectedVariant?.node.availableForSale
      ? selectedVariant
      : product.variants.edges.find((edge) =>
          edge.node.availableForSale && edge.node.selectedOptions.every(
            (option) => selectedOptions[option.name] === option.value
          )
        )
  ) ?? (
    product.variants.edges.length === 1 ? product.variants.edges[0] : undefined
  );

  // Find the best-matching variant for price display even when not all options are selected.
  const bestMatchVariant = useMemo(() => {
    if (purchasableVariant) return purchasableVariant;

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
  }, [purchasableVariant, selectedOptions, product]);

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
  const hasAvailableVariant = product.variants.edges.some(
    (edge) => edge.node.availableForSale !== false
  );
  const isAvailable = purchasableVariant?.node.availableForSale ?? false;
  const sku = purchasableVariant?.node.sku || product.variants.edges[0]?.node.sku;
  
  const productSpecs = useMemo(() => extractProductSpecs(product.tags, product.productType), [product.tags, product.productType]);
  const shipByLabel = getShipByLabel(product);
  const listedSizeOptions = useMemo(() => {
    const sizeOption = product.options.find((option) =>
      ['size', 'bust size', 'stitching size'].includes(option.name.toLowerCase()),
    );
    if (!sizeOption) return null;

    const values = sizeOption.values.filter((value) =>
      value.trim() && value.toLowerCase() !== 'default title',
    );
    return values.length > 0 ? values.join(', ') : null;
  }, [product.options]);

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
    if (!purchasableVariant) {
      toast.error('Please select all options');
      return;
    }

    if (customizableProduct && !requestedCustomColor.trim()) {
      toast.error('Enter your requested custom color');
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
    if (customizableProduct) {
      customAttributes.push(
        { key: 'Made to Order', value: 'Yes — confirmation required' },
        { key: 'Requested Custom Color', value: `${requestedCustomColor.trim()} — pending LuxeMia confirmation` },
        { key: 'Measurements', value: 'Required after order' },
        { key: 'Production Estimate', value: 'Approximately 3–5 weeks after details are confirmed' },
      );
    }
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
      variantId: purchasableVariant.node.id,
      variantTitle: purchasableVariant.node.title,
      price: purchasableVariant.node.price,
      quantity,
      selectedOptions: purchasableVariant.node.selectedOptions,
      customAttributes: customAttributes.length > 0 ? customAttributes : undefined,
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsAdding(false);
    openCart();
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  return (
    <div id="product-purchase" className="space-y-6">
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
      </div>

      {/* Shipping terms — timing is confirmed from the selected product and service */}
      <DeliveryEstimate hasStitching={needsStitchingSize} isMadeToOrder={Boolean(customizableProduct)} />

      <Separator />

      {customizableProduct && (
        <section className="space-y-4 rounded-sm border border-primary/30 bg-primary/5 p-4" aria-labelledby="made-to-order-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Verified made-to-order design</p>
            <h2 id="made-to-order-heading" className="mt-1 font-serif text-2xl">Custom color and measurements</h2>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>This design can be made in a custom color, subject to fabric availability.</li>
            <li>The outfit is made from measurements confirmed with LuxeMia after ordering.</li>
            <li>Production normally takes approximately 3–5 weeks after color, measurements, and fabric availability are confirmed. Carrier transit begins after dispatch.</li>
            <li>Other design changes are not included unless LuxeMia confirms them in writing.</li>
            <li>If LuxeMia confirms that this item will be fulfilled cross-border, import-charge treatment must also be confirmed in writing before the order is accepted; do not assume duty-free delivery.</li>
            <li>Custom orders are final sale, subject to applicable law.</li>
          </ul>
          <p className="text-sm text-foreground">
            Before ordering for a fixed event date, send the product link, requested color, event date, and country to LuxeMia for confirmation.
          </p>
          <div className="space-y-2">
            <label htmlFor="requested-custom-color" className="text-sm font-medium">Requested color</label>
            <input
              id="requested-custom-color"
              value={requestedCustomColor}
              onChange={(event) => setRequestedCustomColor(event.target.value)}
              placeholder="For example: emerald green"
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">Your request is subject to fabric availability and is not final until LuxeMia confirms it.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const message = encodeURIComponent(`Hi LuxeMia, I would like to confirm a custom color and measurements for ${product.title} (${window.location.href}). My requested color is: `);
                window.open(`https://wa.me/12153419990?text=${message}`, '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" /> Confirm custom details
            </button>
            <Link to="/contact" className="inline-flex items-center rounded-sm border border-border px-4 py-2.5 text-sm font-medium hover:border-primary">
              Contact options
            </Link>
          </div>
        </section>
      )}

      {customizableProduct && <Separator />}

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
              <p><strong className="text-foreground">Made to Measure (UDesign):</strong> Choose from the neckline, sleeve, and bottom-style options shown on this page. Submit measurements after placing the order.</p>
            </div>
          )}

          <div className="space-y-3">
            {STITCHING_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  // Paid tailoring cannot be represented as a Shopify line-item
                  // price yet. Request a confirmed quote instead of displaying
                  // a surcharge that checkout would silently omit.
                  if (option.priceModifier > 0) {
                    openTailoringQuote(option);
                    return;
                  }
                  handleStitchingTypeSelect(option.id);
                }}
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
                    {option.priceModifier === 0 ? 'Included' : 'Contact for quote'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}

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
            if (customizableProduct && option.name.toLowerCase() === 'size' && option.values.length === 1 && option.values[0].toLowerCase() === 'custom') return false;
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

      {/* ─── Optional Fit Request ─── */}
      {(isStitchable || isMenswear) && (
        <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium uppercase tracking-wide">Optional Fit Request</label>
          <span className="text-[10px] text-primary font-medium uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">Optional</span>
        </div>
        <textarea
          value={customAlteration}
          onChange={(e) => setCustomAlteration(e.target.value)}
          placeholder="Describe a fit request you would like LuxeMia to review..."
          className="w-full min-h-[80px] p-3 text-sm bg-background border border-border rounded-sm focus:border-primary outline-none transition-colors resize-none"
        />
        <p className="text-[11px] text-muted-foreground italic">
          * Requests are not guaranteed. Contact LuxeMia before ordering to confirm feasibility, timing, and any additional charge.
        </p>
        </div>
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

      {shipByLabel && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
          {shipByLabel}
        </div>
      )}

      {/* Trust micro-strip — shown directly above CTA so buyers see it before clicking */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground py-1">
        <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" />Free U.S. shipping at $150 and above</span>
        <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" />Secure checkout</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />U.S.-based support</span>
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
              {isAvailable ? 'Add to Bag' : hasAvailableVariant ? 'Select Options' : 'Out of Stock'}
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

      <button
        type="button"
        onClick={() => {
          const message = encodeURIComponent(`Hi LuxeMia, can you share more photos or a product video for ${product.title}?`);
          window.open(`https://wa.me/12153419990?text=${message}`, '_blank', 'noopener,noreferrer');
        }}
        className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline underline-offset-4"
      >
        <MessageCircle className="h-4 w-4" /> Ask for more photos or a product video
      </button>

      <Separator />

      {/* Standard product specification template. Each field is either sourced
          from the current listing or uses a clear, non-invented fallback. */}
      <section aria-labelledby="product-specifications-heading" className="space-y-4">
        <h2 id="product-specifications-heading" className="font-serif text-2xl">Product Specifications</h2>
        <dl className="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] gap-x-6 gap-y-3 text-sm">
          <dt className="font-medium text-foreground">Fabric Details</dt>
          <dd className="text-muted-foreground">
            {productSpecs.fabric || 'Review the product description for the fabric supplied with this listing.'}
          </dd>

          <dt className="font-medium text-foreground">Included Pieces</dt>
          <dd className="text-muted-foreground">
            {productSpecs.includedPieces || 'See the product description and images. Contact LuxeMia before ordering if the set contents are not stated.'}
          </dd>

          <dt className="font-medium text-foreground">Sizing & Chart</dt>
          <dd className="text-muted-foreground">
            {customizableProduct
              ? 'Made to order from measurements confirmed with LuxeMia. '
              : listedSizeOptions ? `Listed options: ${listedSizeOptions}. ` : 'Available sizing varies by product. '}
            <Link to="/size-guide" className="font-medium text-primary underline underline-offset-4">
              View the sizing chart
            </Link>
          </dd>

          <dt className="font-medium text-foreground">Shipping Estimate</dt>
          <dd className="text-muted-foreground">
            {customizableProduct
              ? 'Production normally takes approximately 3–5 weeks after required details are confirmed. Carrier transit begins after dispatch.'
              : shipByLabel
              ? `${shipByLabel}. Tracking details are emailed when the shipping label is created for dispatch.`
              : 'Timing depends on the item and selected options. Tracking details are emailed when the shipping label is created for dispatch.'}
          </dd>

          {productSpecs.color && (
            <>
              <dt className="font-medium text-foreground">Color</dt>
              <dd className="text-muted-foreground">{productSpecs.color}</dd>
            </>
          )}
          {productSpecs.work && (
            <>
              <dt className="font-medium text-foreground">Work</dt>
              <dd className="text-muted-foreground">{productSpecs.work}</dd>
            </>
          )}
          {productSpecs.type && (
            <>
              <dt className="font-medium text-foreground">Type</dt>
              <dd className="text-muted-foreground">{productSpecs.type}</dd>
            </>
          )}
          {productSpecs.closure && (
            <>
              <dt className="font-medium text-foreground">Closure</dt>
              <dd className="text-muted-foreground">{productSpecs.closure}</dd>
            </>
          )}
          <dt className="font-medium text-foreground">Seller</dt>
          <dd className="text-muted-foreground">LuxeMia</dd>
        </dl>
      </section>

      <Separator />

      {/* Description */}
      <section aria-labelledby="product-description-heading" className="space-y-2">
        <h2 id="product-description-heading" className="font-serif text-2xl">Product Description</h2>
        <p className="text-muted-foreground leading-relaxed text-sm">
          {product.description || 'Review the product images and listed options for the exact color, materials, included pieces, and sizing. Contact LuxeMia before ordering if any detail is unclear.'}
        </p>
      </section>

      <Separator />

      {/* Fit guidance — no unsupported refund or credit promise. */}
      <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BadgeCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Check your measurements before ordering</p>
          <p className="text-xs text-muted-foreground">All sales are final. Contact LuxeMia before purchase if you need sizing help.</p>
        </div>
      </div>

      {/* Trust Badges - Enhanced */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">U.S.-Based Support</p>
            <p className="text-xs text-muted-foreground">Product and sizing help before purchase</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Tracked U.S. shipping</p>
            <p className="text-xs text-muted-foreground">Tracked carrier delivery</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Secure Checkout</p>
            <p className="text-xs text-muted-foreground">Shopify PCI-DSS encrypted</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <RefreshCcw className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Damage Protection</p>
            <p className="text-xs text-muted-foreground">Report genuine shipping damage, an incorrect item, or a missing item within 48 hours with clear photos and the required continuous unboxing/opening video.</p>
          </div>
        </div>
      </div>

      {/* Additional Trust Elements */}
      <div className="space-y-3 pt-4">
        {/* Urgency info now shown in DeliveryEstimate component */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span>Contact LuxeMia before ordering for product or sizing help</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4 text-primary" />
          <span>Carefully packaged for transit</span>
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
          <div className="px-2 py-1 bg-muted rounded text-xs font-medium">Apple Pay</div>
        </div>
      </div>
    </div>
  );
};
