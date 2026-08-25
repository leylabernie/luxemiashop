import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, CheckCircle2, Minus, Plus, ShoppingBag, Truck, Package, Lock, Info, Scissors, MessageCircle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
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
import {
  hasNativeProductSizeOption,
  isProductSizeOptionName,
  shouldRenderShopifyProductOption,
} from '@/lib/productOptionNames';
import {
  isVariantOptionValueAvailable,
  resolveAvailableVariantForOption,
  resolveIncludedPieces,
  selectedOptionsFromVariant,
  selectionRequiresSeparateMeasurements,
} from '@/lib/productPurchaseFlow';
import { inferProductSpecColors } from '@/lib/productSpecColor';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import {
  getEligibleServiceAddOns,
  SERVICE_ADD_ON_PRODUCT_HANDLE,
  SERVICE_ADD_ONS,
  serviceAddOnTotal,
  type ServiceAddOnCode,
} from '@/lib/serviceAddOns';
import {
  isRakshaBandhanCampaignActive,
  RAKSHA_BANDHAN_CAMPAIGN,
} from '@/config/rakshaBandhanCampaign';

// Listing-specific stitching choices. Any billable amount must come from an
// actual Shopify variant or service add-on, never from this display config.
interface StitchingTypeOption {
  id: string;
  label: string;
  description: string;
  requiresMeasurement: boolean;
  requiresQuote?: boolean;
}

const STITCHING_TYPE_OPTIONS: StitchingTypeOption[] = [
  {
    id: 'semi-stitched',
    label: 'Semi Stitched',
    description: 'Pre-constructed with adjustable side seams. Select only a size offered on this listing and plan local alterations if needed.',
    requiresMeasurement: false,
  },
  {
    id: 'ready-to-wear',
    label: 'Ready to Wear',
    description: 'A listing-specific ready-to-wear request. Select the stated size and confirm availability before ordering when the product requires it.',
    requiresMeasurement: true,
    requiresQuote: true,
  },
  {
    id: 'made-to-measure',
    label: 'Made to Measure (UDesign)',
    description: 'Made-to-measure tailoring is available only when LuxeMia confirms the listing-specific design choices, measurements, timing, and charge.',
    requiresMeasurement: true,
    requiresQuote: true,
  },
];

type ShopifyVariant = ShopifyProduct['node']['variants']['edges'][number]['node'];

interface ProductInfoProps {
  product: ShopifyProduct['node'];
  onSelectedVariantChange?: (variant: ShopifyVariant | null) => void;
}

// Helper to extract product specs from tags
const extractProductSpecs = (
  tags?: string[],
  productType?: string,
  productTitle?: string,
  metadataIncludedComponents?: string[] | null,
) => {
  const specs: Record<string, string> = {};
  const lowerProductType = productType?.toLowerCase() || '';
  const lowerTitle = productTitle?.toLowerCase() || '';
  const isAccessory = [
    'jewel', 'accessory', 'necklace', 'choker', 'earring', 'bangle',
    'bracelet', 'ring', 'bag', 'clutch', 'footwear', 'jutti', 'mojri',
  ].some((type) => lowerProductType.includes(type));

  if (productType) {
    specs.type = productType;
  }

  const catalogTags = tags ?? [];

  // A closure is displayed only when the catalog explicitly supplies one.
  const closureTag = catalogTags.find((tag) => tag.toLowerCase().startsWith('closure:'));
  if (closureTag) {
    const closure = closureTag.slice(closureTag.indexOf(':') + 1).trim();
    if (closure) specs.closure = closure;
  }

  const includedPieces = resolveIncludedPieces(
    metadataIncludedComponents,
    catalogTags,
    productTitle,
  );
  if (includedPieces) specs.includedPieces = includedPieces;

  // Legacy accessory tags contain garment attributes on some listings. Avoid
  // surfacing those as jewelry specifications until the catalog is corrected.
  if (isAccessory) return specs;

  const titleFabricLabels: Array<[RegExp, string]> = [
    [/\bgeorgette\s+silk\b/i, 'Georgette Silk'],
    [/\btissue\s+silk\b/i, 'Tissue Silk'],
    [/\bvichitra\s+silk\b/i, 'Vichitra Silk'],
    [/\brangoli\s+silk\b/i, 'Rangoli Silk'],
    [/\bdola\s+silk\b/i, 'Dola Silk'],
    [/\bfendi\s+silk\b/i, 'Fendi Silk'],
    [/\bbanarasi\b/i, 'Banarasi'],
    [/\bgeorgette\b/i, 'Georgette'],
    [/\bchiffon\b/i, 'Chiffon'],
    [/\bvelvet\b/i, 'Velvet'],
    [/\bnet\b/i, 'Net'],
    [/\bcrepe\b/i, 'Crepe'],
    [/\bsatin\b/i, 'Satin'],
    [/\bviscose\b/i, 'Viscose'],
    [/\bsilk\b/i, 'Silk'],
    [/\bcotton\b/i, 'Cotton'],
  ];
  const fabricKeywords = ['georgette silk', 'tissue silk', 'vichitra silk', 'rangoli silk', 'dola silk', 'fendi silk', 'banarasi', 'silk', 'cotton', 'georgette', 'chiffon', 'velvet', 'net', 'crepe', 'satin', 'brocade', 'jacquard', 'organza', 'chinnon', 'roman silk'];
  const workKeywords = ['embroidery', 'embroidered', 'sequins', 'mirror', 'zari', 'thread work', 'stone work', 'beadwork', 'digital print', 'printed', 'woven', 'handcrafted'];
  const titleWorkLabels: Array<[RegExp, string]> = [
    [/\bsequins?\b/i, 'Sequins'],
    [/\bthread\b/i, 'Thread Work'],
    [/\bbeads?\b/i, 'Beads'],
    [/\bembroidery\b|\bembroidered\b/i, 'Embroidery'],
  ];
  const lowerTags = catalogTags.map(t => t.toLowerCase());

  // Normalized catalog tags are the authoritative product specification.
  // Read their supplied value verbatim before using legacy keyword/title fallbacks;
  // this preserves precise facts such as `fabric:Viscose` and `work:Beads Work`.
  const getExplicitTagValues = (prefixes: string[]): string[] => {
    const values = catalogTags
      .filter((candidate) => {
        const normalized = candidate.trim().toLowerCase();
        return prefixes.some((prefix) => normalized.startsWith(prefix));
      })
      .map((tag) => tag.slice(tag.indexOf(':') + 1).trim())
      .filter(Boolean);
    return [...new Set(values)];
  };

  const explicitFabrics = getExplicitTagValues(['fabric:', 'material:']);
  const foundFabric = fabricKeywords.find(f => lowerTags.some(t => t.includes(f)));
  const titleFabric = titleFabricLabels.find(([pattern]) => pattern.test(lowerTitle))?.[1];
  if (explicitFabrics.length > 0) {
    specs.fabric = explicitFabrics.join('; ');
  } else if (foundFabric || titleFabric) {
    specs.fabric = foundFabric
      ? foundFabric.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : titleFabric!;
  }

  const explicitWorkValues = getExplicitTagValues(['work:', 'embroidery:', 'embellishment:']);
  const foundWork = workKeywords.filter(w => lowerTags.some(t => t.includes(w)));
  const titleWork = titleWorkLabels.find(([pattern]) => pattern.test(lowerTitle))?.[1];
  if (explicitWorkValues.length > 0) {
    specs.work = explicitWorkValues.join('; ');
  } else if (foundWork.length > 0) {
    specs.work = foundWork.map(w => w.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ');
  } else if (titleWork) {
    specs.work = titleWork;
  }

  const explicitColors = getExplicitTagValues(['color:']);
  const foundColors = inferProductSpecColors(catalogTags);
  if (explicitColors.length > 0) {
    specs.color = explicitColors.join('; ');
  } else if (foundColors.length > 0) {
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

export const ProductInfo = ({ product, onSelectedVariantChange }: ProductInfoProps) => {
  const [searchParams] = useSearchParams();
  const requestedVariantId = searchParams.get('variant');
  const customizableProduct = getCustomizableProduct(product.handle);
  const { product: serviceAddOnProduct } = useShopifyProduct(
    SERVICE_ADD_ON_PRODUCT_HANDLE,
    { allowHiddenBillingProduct: true },
  );
  const hasExplicitTailoringStatus = product.tags?.some((tag) =>
    /^(tailoring|stitching|availability):/i.test(tag.trim()),
  ) ?? false;
  // A catalog tag that explicitly limits the garment to a ready-made fit must
  // not activate generic semi-stitched, made-to-measure, or alteration paths.
  // The exact ready-made option remains visible through Shopify variants.
  const isReadyMadeOnly = product.tags?.some((tag) =>
    /^(?:tailoring|stitching):\s*ready[-\s]?made(?:\s*(?:only|blouse))?\b/i.test(tag.trim()),
  ) ?? false;
  const isStitchable = !customizableProduct && !isReadyMadeOnly && hasExplicitTailoringStatus && isStitchableProduct(product.productType, product.tags);
  const isMenswear = !customizableProduct && isMenswearProduct(product.productType, product.tags);
  const showBottomStyleOption = !customizableProduct && shouldShowBottomStyle(product.productType, product.tags);
  const productHasNativeSizes = hasNativeProductSizeOption(product.options);
  const isSareeListing = /\b(?:saree|sari)\b/i.test(`${product.title} ${product.productType || ''}`);
  const isLaunchOfferActive = isRakshaBandhanCampaignActive();

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
  const [customSizeConfirmed, setCustomSizeConfirmed] = useState(false);
  const [requestedCustomColor, setRequestedCustomColor] = useState('');
  const [selectedStitchingType, setSelectedStitchingType] = useState<string | null>(
    isStitchable ? 'semi-stitched' : null
  );
  const [showStitchingInfo, setShowStitchingInfo] = useState<string | null>(null);
  const [selectedServiceAddOnCodes, setSelectedServiceAddOnCodes] = useState<ServiceAddOnCode[]>([]);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));
  const variantNodes = useMemo(
    () => product.variants.edges.map((edge) => edge.node),
    [product.variants.edges],
  );

  const eligibleServiceAddOnCodes = useMemo(
    () => getEligibleServiceAddOns(product),
    [product],
  );
  const serviceVariants = useMemo(() => {
    const variants = new Map<ServiceAddOnCode, ShopifyVariant>();
    if (!serviceAddOnProduct) return variants;

    for (const code of eligibleServiceAddOnCodes) {
      const definition = SERVICE_ADD_ONS[code];
      const variant = serviceAddOnProduct.variants.edges.find(({ node }) =>
        node.availableForSale && node.selectedOptions.some((option) =>
          option.name === 'Service' && option.value === definition.checkoutOptionValue,
        ),
      )?.node;
      if (variant) variants.set(code, variant);
    }
    return variants;
  }, [eligibleServiceAddOnCodes, serviceAddOnProduct]);
  const availableServiceAddOnCodes = eligibleServiceAddOnCodes.filter((code) => serviceVariants.has(code));
  const selectedAvailableServiceAddOnCodes = selectedServiceAddOnCodes.filter((code) => serviceVariants.has(code));

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

  // Shopify's selected variant is the only source of truth for the garment
  // price. Never infer a surcharge from option labels: that would make the
  // product page disagree with the amount Shopify actually charges.
  const activeVariantForGallery = purchasableVariant?.node ?? bestMatchVariant?.node ?? null;

  // Keep the product gallery synchronized with the exact Shopify variant that
  // is active in the purchase controls. This applies to color-only variants
  // and to products whose matching image is shared across multiple sizes.
  useEffect(() => {
    onSelectedVariantChange?.(activeVariantForGallery);
  }, [activeVariantForGallery, onSelectedVariantChange]);

  const basePrice = bestMatchVariant?.node.price || product.priceRange.minVariantPrice;
  const selectedServiceAddOnCharge = useMemo(
    () => serviceAddOnTotal(selectedAvailableServiceAddOnCodes),
    [selectedAvailableServiceAddOnCodes],
  );
  const currentPrice = useMemo(() => {
    const baseAmount = parseFloat(basePrice.amount);
    return {
      amount: (baseAmount + selectedServiceAddOnCharge).toString(),
      currencyCode: basePrice.currencyCode,
    };
  }, [basePrice, selectedServiceAddOnCharge]);
  const hasAvailableVariant = product.variants.edges.some(
    (edge) => edge.node.availableForSale !== false
  );
  const isAvailable = purchasableVariant?.node.availableForSale ?? false;
  const sku = purchasableVariant?.node.sku || product.variants.edges[0]?.node.sku;
  
  const productSpecs = useMemo(
    () => extractProductSpecs(
      product.tags,
      product.productType,
      product.title,
      product.metadata?.includedComponents,
    ),
    [product.tags, product.productType, product.title, product.metadata?.includedComponents],
  );
  const shipByLabel = getShipByLabel(product);
  const listedSizeOptions = useMemo(() => {
    const sizeOption = product.options.find((option) => isProductSizeOptionName(option.name));
    if (!sizeOption) return null;

    const values = sizeOption.values.filter((value) =>
      value.trim() && value.toLowerCase() !== 'default title',
    );
    return values.length > 0 ? values.join(', ') : null;
  }, [product.options]);

  // A purchasable Custom size must be explicitly acknowledged before it is
  // carried into Shopify checkout. This preserves the shopper's selected
  // variant while making the measurement handoff visible to the customer and
  // fulfillment team; it does not claim that arbitrary design changes apply.
  const isCustomSizeSelected = useMemo(() =>
    Object.entries(selectedOptions).some(([optionName, value]) =>
      isProductSizeOptionName(optionName)
      && /\bcustom(?:\s*size)?\b/i.test(value.trim()),
    ),
  [selectedOptions]);

  // Determine if the currently selected variant requires stitching size
  const needsStitchingSize = useMemo(() => {
    // For stitchable products, check the Utsav-style selector
    if (isStitchable) {
      const selectedOption = STITCHING_TYPE_OPTIONS.find(o => o.id === selectedStitchingType);
      return selectedOption?.requiresMeasurement || false;
    }
    // A single fixed Shopify variant can describe its supplied construction
    // with values such as "Stitched" or "Fully Stitched". That wording is not
    // an offer of separate tailoring, size, or neckline choices. Explicit
    // tailoring tags are handled by the branch above; the fallback below is
    // only for catalogs that expose multiple selectable stitching variants.
    if (product.variants.edges.length <= 1) return false;
    // Standard and semi-stitched variant labels are complete catalog choices;
    // they must not trigger a second measurement selector. Only an explicit
    // tailoring choice (for example Custom Stitching) reaches this fallback.
    return Object.entries(selectedOptions).some(([key, val]) =>
      selectionRequiresSeparateMeasurements(key, val),
    );
  }, [selectedOptions, selectedStitchingType, isStitchable, product.variants.edges.length]);

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

  // Shopify's native letter and numeric size variants are the purchase source
  // of truth. Never ask for a second "Stitching Size" when either is present.
  const showStitchingSizeSelector = useMemo(() => {
    if (productHasNativeSizes) return false;
    if (isMenswear) return true;
    return needsStitchingSize;
  }, [needsStitchingSize, productHasNativeSizes, isMenswear]);

  // Whether to show the Customize header (all stitchable products + menswear)
  const showCustomizeHeader = isStitchable || isMenswear;

  const handleOptionSelect = (optionName: string, value: string) => {
    const resolvedVariant = resolveAvailableVariantForOption(
      variantNodes,
      selectedOptions,
      optionName,
      value,
    );
    if (!resolvedVariant) {
      toast.error(`${value} is currently unavailable`);
      return;
    }

    const nextSelectedOptions = {
      ...selectedOptions,
      ...selectedOptionsFromVariant(resolvedVariant),
    };
    setSelectedOptions(nextSelectedOptions);

    const currentCustomSize = Object.entries(selectedOptions).some(([name, selectedValue]) =>
      isProductSizeOptionName(name)
      && /\bcustom(?:\s*size)?\b/i.test(selectedValue.trim()),
    );
    const nextCustomSize = Object.entries(nextSelectedOptions).some(([name, selectedValue]) =>
      isProductSizeOptionName(name)
      && /\bcustom(?:\s*size)?\b/i.test(selectedValue.trim()),
    );
    if (!nextCustomSize) {
      setCustomSizeConfirmed(true);
    } else if (!currentCustomSize) {
      setCustomSizeConfirmed(false);
    }

    const isTailoringOption = !isProductSizeOptionName(optionName)
      && (optionName.toLowerCase().includes('stitch') || optionName.toLowerCase().includes('tailor'));
    if (isTailoringOption) {
      const requiresSeparateMeasurements = selectionRequiresSeparateMeasurements(optionName, value)
        && !productHasNativeSizes;
      setShowSizeValidation(requiresSeparateMeasurements);
      if (!requiresSeparateMeasurements) setStitchingSize(null);
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

    if (isCustomSizeSelected && !customSizeConfirmed) {
      toast.error('Confirm the custom-size measurement requirement');
      return;
    }

    // For stitchable products, require stitching type
    if (isStitchable && !selectedStitchingType) {
      toast.error('Please select a stitching type');
      return;
    }

    // Require stitching size when needed and not already provided by Shopify variants
    if (needsStitchingSize && !productHasNativeSizes && !stitchingSize) {
      setShowSizeValidation(true);
      toast.error('Please select a size for stitching');
      return;
    }

    // For menswear, require size
    if (isMenswear && !stitchingSize && !productHasNativeSizes) {
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
        { key: 'Timing Estimate', value: 'Approximately 4–5 weeks total; production and transit confirmed separately' },
      );
    }
    if (isCustomSizeSelected) {
      customAttributes.push(
        { key: 'Custom Size', value: 'Measurements must be confirmed before production' },
        { key: 'Measurement Confirmation', value: 'Customer acknowledged before checkout' },
      );
    }
    if (isStitchable && selectedStitchingType) {
      const stitchingOption = STITCHING_TYPE_OPTIONS.find(o => o.id === selectedStitchingType);
      customAttributes.push({ key: 'Stitching Type', value: stitchingOption?.label || selectedStitchingType });
      if (stitchingOption?.requiresQuote) {
        customAttributes.push({ key: 'Tailoring Confirmation', value: 'Listing-specific availability, measurements, timing, and charge require LuxeMia confirmation' });
      }
    }
    if (needsStitchingSize && !productHasNativeSizes && stitchingSize) {
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

    if (serviceAddOnProduct) {
      for (const code of selectedAvailableServiceAddOnCodes) {
        const serviceVariant = serviceVariants.get(code);
        if (!serviceVariant) continue;
        addItem({
          product: { node: serviceAddOnProduct },
          variantId: serviceVariant.id,
          variantTitle: serviceVariant.title,
          price: serviceVariant.price,
          quantity,
          selectedOptions: serviceVariant.selectedOptions,
          customAttributes: [
            { key: 'Applies To', value: product.title },
          ],
        });
      }
    }

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

  const handleWishlistToggle = () => {
    toggleWishlistItem({ node: product });
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      description: product.title,
    });
  };

  const handleShare = async () => {
    const productUrl = `https://luxemia.shop/product/${product.handle}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `View ${product.title} at LuxeMia`,
          url: productUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(productUrl);
      toast.success('Product link copied');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('Unable to share this product', {
        description: productUrl,
      });
    }
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
      {shipByLabel && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground" role="status">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{shipByLabel}. This is the estimated dispatch date; carrier transit time is separate.</span>
        </p>
      )}

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
            <li>Use approximately 4–5 weeks as a total planning window. Production time and carrier transit are confirmed separately after the color, measurements, fabric availability, and delivery address are known.</li>
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
              <p><strong className="text-foreground">Semi Stitched:</strong> Pre-constructed with adjustable side seams. Select only a size offered on this listing and plan local alterations if needed.</p>
              <p><strong className="text-foreground">Ready to Wear:</strong> A listing-specific request that requires LuxeMia to confirm the stated size, availability, timing, and any charge.</p>
              <p><strong className="text-foreground">Made to Measure (UDesign):</strong> The design choices, measurements, timing, and charge require LuxeMia confirmation before production.</p>
            </div>
          )}

          <div className="space-y-3">
            {STITCHING_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
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
                    option.requiresQuote
                      ? 'text-foreground'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {option.requiresQuote ? 'Confirmation required' : 'Included'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}

                </p>
              </button>
            ))}
          </div>

          {/* Made to Measure — source-backed confirmation process */}
          {selectedStitchingType === 'made-to-measure' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-sm">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                After checkout, LuxeMia will use the order contact details to confirm whether tailoring is available, the exact measurements, timing, and any charge before production. Contact LuxeMia before ordering for a fixed event date.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Menswear Size Selector ─── */}
      {isMenswear && !productHasNativeSizes && (
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
          .filter((option) => shouldRenderShopifyProductOption(option, {
            isCustomizable: Boolean(customizableProduct),
            isStitchable,
          }))
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
              {isProductSizeOptionName(option.name) && (
                <SizeGuideModal category={product.productType} />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const optionValueAvailable = isVariantOptionValueAvailable(
                  variantNodes,
                  option.name,
                  value,
                );
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleOptionSelect(option.name, value)}
                    disabled={!optionValueAvailable}
                    aria-label={`${value}${optionValueAvailable ? '' : ' — unavailable'}`}
                    className={`px-4 py-2.5 text-sm border rounded-sm transition-all duration-300 ${
                      selectedOptions[option.name] === value
                        ? 'border-foreground bg-foreground text-background'
                        : optionValueAvailable
                        ? 'border-border hover:border-foreground/50'
                        : 'cursor-not-allowed border-border text-muted-foreground opacity-45'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {availableServiceAddOnCodes.length > 0 && (
        <section className="space-y-3 rounded-sm border border-primary/25 bg-primary/5 p-4" aria-labelledby="listing-service-add-ons-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {isSareeListing ? 'Saree options' : 'Listing-appropriate services'}
            </p>
            <h3 id="listing-service-add-ons-heading" className="mt-1 font-serif text-xl">
              {isSareeListing ? 'Finish your saree' : 'Optional finishing & tailoring'}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {isSareeListing
                ? 'Choose finishing, petticoat, and blouse-stitching options for this saree before adding it to bag. Selected options are included with this saree order.'
                : 'Only services supported by this product’s stated construction are shown and included with this garment order.'}
            </p>
          </div>
          <div className="space-y-2">
            {availableServiceAddOnCodes.map((code) => {
              const service = SERVICE_ADD_ONS[code];
              const selected = selectedAvailableServiceAddOnCodes.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedServiceAddOnCodes((current) =>
                    current.includes(code)
                      ? current.filter((currentCode) => currentCode !== code)
                      : [...current, code],
                  )}
                  className={`flex w-full items-start justify-between gap-4 rounded-sm border p-3 text-left transition-colors ${
                    selected ? 'border-primary bg-background ring-1 ring-primary' : 'border-border bg-background hover:border-primary/60'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50'
                    }`}>
                      {selected && <Check className="h-3 w-3" aria-hidden="true" />}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">{service.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{service.description}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-foreground">+${service.price.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
          {selectedAvailableServiceAddOnCodes.length > 0 && (
            <p className="text-sm font-medium text-foreground">
              Selected services: +{formatPrice(selectedServiceAddOnCharge.toFixed(2), basePrice.currencyCode)}
            </p>
          )}
        </section>
      )}

      {isCustomSizeSelected && !customizableProduct && (
        <section className="space-y-3 rounded-sm border border-primary/30 bg-primary/5 p-4" aria-labelledby="custom-size-confirmation-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Custom size selected</p>
            <h3 id="custom-size-confirmation-heading" className="mt-1 font-serif text-xl">Measurements must be confirmed before production</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your selected Custom size is recorded with this order. LuxeMia will confirm measurements before tailoring begins; do not assume other design changes are included unless confirmed in writing.
          </p>
          <label className="flex items-start gap-3 rounded-sm border border-border bg-background p-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={customSizeConfirmed}
              onChange={(event) => setCustomSizeConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>I understand that LuxeMia must confirm my measurements before production begins.</span>
          </label>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/size-guide" className="font-medium text-primary underline underline-offset-4">View the sizing guide</Link>
            <button
              type="button"
              onClick={() => {
                const message = encodeURIComponent(`Hi LuxeMia, I selected Custom size for ${product.title} (${window.location.href}) and would like to confirm measurements before ordering.`);
                window.open(`https://wa.me/12153419990?text=${message}`, '_blank', 'noopener,noreferrer');
              }}
              className="font-medium text-primary underline underline-offset-4"
            >
              Confirm measurements by WhatsApp
            </button>
          </div>
        </section>
      )}

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
        <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" />Tracked U.S. shipping</span>
        <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" />Secure checkout</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />U.S.-based support</span>
      </div>

      {isLaunchOfferActive && (
        <div
          className="rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm"
          role="note"
        >
          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="leading-5">
              <span className="font-semibold">72-hour offer:</span>{' '}
              Use <strong>{RAKSHA_BANDHAN_CAMPAIGN.code}</strong> at checkout for{' '}
              {RAKSHA_BANDHAN_CAMPAIGN.discountPercent}% off orders of ${RAKSHA_BANDHAN_CAMPAIGN.minimumSubtotal}+ through{' '}
              {RAKSHA_BANDHAN_CAMPAIGN.displayEndDate}.
            </p>
          </div>
          <p className="mt-1 pl-6 text-[11px] leading-4 text-muted-foreground">
            One use per customer. Cannot be combined with other discounts.
          </p>
        </div>
      )}

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

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-14 w-14"
          aria-label={isWishlisted ? 'Remove product from wishlist' : 'Save product to wishlist'}
          aria-pressed={isWishlisted}
          onClick={handleWishlistToggle}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-14 w-14"
          aria-label="Share this product"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <nav aria-label="Purchase help" className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        <Link to="/size-guide" className="font-medium text-primary underline underline-offset-4">
          Size guide
        </Link>
        <Link to="/shipping" className="font-medium text-primary underline underline-offset-4">
          Shipping details
        </Link>
        <Link to="/returns" className="font-medium text-primary underline underline-offset-4">
          Returns &amp; cancellations
        </Link>
      </nav>

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
              ? 'Use approximately 4–5 weeks as a total planning window. Production time and carrier transit are confirmed separately after the required details and delivery address are known.'
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
          <p className="text-xs text-muted-foreground">
            All sales are final. Damaged, incorrect, or missing-item reports follow the covered-order-issue process. Contact LuxeMia before purchase if you need sizing help.{' '}
            <Link to="/returns" className="font-medium text-primary underline underline-offset-4">
              Review the return policy and reporting steps
            </Link>
          </p>
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
            <p className="text-sm font-medium">Tracked shipping</p>
            <p className="text-xs text-muted-foreground">United States addresses only</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Secure Checkout</p>
            <p className="text-xs text-muted-foreground">Secure Shopify checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Order Issue Support</p>
            <p className="text-xs text-muted-foreground">Guidance for reporting a damaged, incorrect, or missing item</p>
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

      {/* Payment methods vary by order, device, and Shopify eligibility. */}
      <div className="pt-4 border-t border-border/30 mt-4">
        <p className="text-xs text-muted-foreground">
          Payment methods available for this order are shown at secure Shopify checkout.
        </p>
      </div>
    </div>
  );
};
