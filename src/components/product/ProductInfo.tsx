import { DESTINATION_IMPORT_NOTICE, BASE_SHIPPING_TIMING_NOTICE, alterationShippingTimingNotice, productShippingTimingNotice } from '@/config/shippingPolicy';
import { getCatalogMaterial } from '@/lib/catalogMaterial';
import { getVariantReferencePrice } from '@/lib/variantReferencePrice';
import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, CheckCircle2, Minus, Plus, ShoppingBag, Truck, Package, Lock, Info, Scissors, MessageCircle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getColorwaysForHandle } from '@/config/colorwayLinks';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import { readMetaContext, saveMetaConfiguration, metaReturnPath } from '@/lib/metaCheckoutContext';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';
import { SizeGuideModal } from './SizeGuideModal';
import { StitchingSizeSelector } from '@/components/StitchingSizeSelector';
import { DeliveryEstimate } from './DeliveryEstimate';
import { NecklineSelector, type NecklineOption } from './NecklineSelector';
import { BottomStyleSelector, type BottomStyleOption } from './BottomStyleSelector';
import { SleeveStyleSelector, type SleeveStyleOption } from './SleeveStyleSelector';
import type { ShopifyProduct } from '@/lib/shopify';
import { getShipByLabel, getProductShipsWithin } from '@/lib/shipBy';
import { getCustomizableProduct, isMadeToOrderProduct } from '@/lib/customizableProducts';
import {
  getCustomerFacingProductOptionName,
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
  selectedServicesRequireProcessing,
  hasFixedStitchedLehengaOptions,
  hasNativeFullStitchingOptions,
  requiresNativeStitchingTimingConfirmation,
  isUnstitchedDeliverySelection,
  selectedEligibleServiceAddOns,
  SERVICE_ADD_ON_PRODUCT_HANDLE,
  SERVICE_ADD_ONS,
  serviceAddOnTotal,
  isBanarasiSareeServiceProduct,
  requiresBlouseServiceConfirmation,
  isBlouseServiceSelectionConfirmed,
  BLOUSE_SERVICE_CONFIRMATION_NOTICE,
  blouseServiceConfirmationAttributes,
  type ServiceAddOnCode,
} from '@/lib/serviceAddOns';

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
  productDescription = '',
  catalogMaterial = '',
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
    productDescription,
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
  if (catalogMaterial) {
    specs.fabric = catalogMaterial;
  } else if (explicitFabrics.length > 0) {
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
  const metaToken = searchParams.get('meta_context');
  const metaContentId = searchParams.get('meta_item');
  const metaContext = readMetaContext(metaToken);
  const metaRequestedLine = metaContext?.request.lines.find(line => line.contentId === metaContentId);
  const customizableProduct = getCustomizableProduct(product.handle);
  const madeToOrderProduct = isMadeToOrderProduct(product.handle, product.tags);
  const hasNativeFullStitching = hasNativeFullStitchingOptions(product);
  const hasFixedStitchedLehenga = hasFixedStitchedLehengaOptions(product);
  const colorways = getColorwaysForHandle(product.handle);
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
  const isStitchable = !hasNativeFullStitching && !madeToOrderProduct && !isReadyMadeOnly && hasExplicitTailoringStatus && isStitchableProduct(product.productType, product.tags);
  const isMenswear = !hasNativeFullStitching && !madeToOrderProduct && isMenswearProduct(product.productType, product.tags);
  const showBottomStyleOption = !hasNativeFullStitching && !madeToOrderProduct && shouldShowBottomStyle(product.productType, product.tags);
  const productHasNativeSizes = hasNativeProductSizeOption(product.options);
  const isSareeListing = /\b(?:saree|sari)\b/i.test(`${product.title} ${product.productType || ''}`);
  const hasStitchedBlouse = product.tags?.includes('construction:Saree with stitched blouse') ?? false;

  // Honor Merchant Center variant links while preserving the first available
  // variant as the normal default when no variant query parameter is present.
  const defaultOptions = useMemo(() => {
    const defaults: Record<string, string> = {};
    // Meta product-level IDs cannot choose a shopper's size or fit implicitly.
    if (metaToken && product.variants.edges.length > 1) {
      const explicit = product.variants.edges.find(edge => edge.node.id === requestedVariantId && edge.node.availableForSale);
      if (explicit) { explicit.node.selectedOptions.forEach(option => { defaults[option.name] = option.value; }); return defaults; }
      product.options.filter(option => option.values.length === 1).forEach(option => { defaults[option.name] = option.values[0]; });
      return defaults;
    }
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
  }, [product.variants.edges, product.options, requestedVariantId, metaToken]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(defaultOptions);
  const [quantity, setQuantity] = useState(metaRequestedLine?.quantity || 1);
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
  const [blouseServiceConfirmed, setBlouseServiceConfirmed] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(product.id));
  const variantNodes = useMemo(
    () => product.variants.edges.map((edge) => edge.node),
    [product.variants.edges],
  );

  // Price deltas shown on option buttons are derived from real Shopify variant
  // prices so the label always matches the amount charged at checkout.
  const optionValuePriceDeltas = useMemo(() => {
    const deltas = new Map<string, number>();
    const purchasablePrices = variantNodes
      .filter((variant) => variant.availableForSale !== false)
      .map((variant) => parseFloat(variant.price.amount));
    if (purchasablePrices.length === 0) return deltas;
    const minPrice = Math.min(...purchasablePrices);
    for (const variant of variantNodes) {
      const delta = Math.round((parseFloat(variant.price.amount) - minPrice) * 100) / 100;
      if (delta < 0) continue;
      for (const opt of variant.selectedOptions) {
        const key = `${opt.name}::${opt.value}`;
        if (!deltas.has(key) || delta < (deltas.get(key) ?? Infinity)) {
          deltas.set(key, delta);
        }
      }
    }
    return deltas;
  }, [variantNodes]);

  const eligibleServiceAddOnCodes = useMemo(
    () => getEligibleServiceAddOns(product),
    [product],
  );
  const serviceVariants = useMemo(() => {
    const variants = new Map<ServiceAddOnCode, ShopifyVariant>();
    if (!serviceAddOnProduct) return variants;

    for (const code of eligibleServiceAddOnCodes) {
      const definition = SERVICE_ADD_ONS[code];
      // Match on the option VALUE, not its name: the live service product's
      // option is named "Stitching", and a name requirement silently hid
      // every add-on from every listing. Values are the stable contract.
      const variant = serviceAddOnProduct.variants.edges.find(({ node }) =>
        node.availableForSale && node.selectedOptions.some((option) =>
          option.value === definition.checkoutOptionValue,
        ),
      )?.node;
      if (variant) variants.set(code, variant);
    }
    return variants;
  }, [eligibleServiceAddOnCodes, serviceAddOnProduct]);
  const availableServiceAddOnCodes = eligibleServiceAddOnCodes.filter((code) => serviceVariants.has(code));
  const selectedAvailableServiceAddOnCodes = selectedEligibleServiceAddOns(
    product, selectedServiceAddOnCodes, availableServiceAddOnCodes,
  );
  const needsBlouseServiceConfirmation = requiresBlouseServiceConfirmation(
    product, selectedAvailableServiceAddOnCodes,
  );

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
  const currentReferencePrice = getVariantReferencePrice(activeVariantForGallery, currentPrice);
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
      // Specs must use catalog facts, not the SEO-enriched display introduction.
      product.descriptionHtml || product.description,
      getCatalogMaterial(product),
    ),
    [product.tags, product.productType, product.title, product.metadata, product.fabricMetafield, product.materialMetafield, product.descriptionHtml, product.description],
  );

  // Utsav-style short lead: first two sentences of the listing description.
  // The full description stays available in the Details tab below.
  const shortDescription = useMemo(() => {
    const raw = (product.description || '').trim();
    if (!raw) {
      return 'Review the product images and listed options for the exact color, materials, included pieces, and sizing. Contact LuxeMia before ordering if any detail is unclear.';
    }
    const sentences = raw.match(/[^.!?]+[.!?]+(\s|$)/g) || [raw];
    let lead = sentences.slice(0, 2).join(' ').trim();
    if (lead.length > 280) {
      lead = sentences[0].trim();
    }
    if (lead.length > 280) {
      lead = lead.slice(0, 277).replace(/[,;:\s]+\S*$/, '') + '.';
    }
    return lead;
  }, [product.description]);
  const requiresNativeTimingConfirmation = requiresNativeStitchingTimingConfirmation(
    product, purchasableVariant?.node.selectedOptions ?? [],
  ) || needsBlouseServiceConfirmation;
  const isUnstitchedDelivery = isUnstitchedDeliverySelection(
    product, purchasableVariant?.node.selectedOptions ?? [],
  );
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
  const currentSelectionIsMadeToOrder = madeToOrderProduct || isCustomSizeSelected;
  const hasSelectedAlterations = requiresNativeTimingConfirmation
    || selectedServicesRequireProcessing(selectedAvailableServiceAddOnCodes)
    || currentSelectionIsMadeToOrder || selectedStitchingType === 'made-to-measure';
  const shipsWithinDays = getProductShipsWithin(product);
  const shipByLabel = hasSelectedAlterations ? null : getShipByLabel(product);

  // Determine if the currently selected variant requires stitching size
  const needsStitchingSize = useMemo(() => {
    // The native matrix supplies standard sizes and the existing Custom Fit
    // acknowledgment. It does not promise neckline or other design changes.
    if (hasNativeFullStitching) return false;
    // Supplied readymade construction is not a request for custom tailoring,
    // even when color and size create several Shopify variants.
    if (isReadyMadeOnly) return false;
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
      selectionRequiresSeparateMeasurements(key, val)
      || (!productHasNativeSizes && /\bmade[-\s]+to[-\s]+fit\b/i.test(val)),
    );
  }, [hasNativeFullStitching, productHasNativeSizes, selectedOptions, selectedStitchingType, isStitchable, isReadyMadeOnly, product.variants.edges.length]);

  // Whether blouse neckline selector should show
  const showNeckline = useMemo(() => {
    // Native fit choices on a supplied stitched lehenga do not promise a redesign.
    if (hasFixedStitchedLehenga) return false;
    // Preserve existing native-fit and explicit tailoring design controls.
    // A native measurement-based variant alone does not promise a neckline redesign.
    if ((productHasNativeSizes || isStitchable) && isBlouseProductType(product.productType, product.tags) && needsStitchingSize) {
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
  }, [hasFixedStitchedLehenga, productHasNativeSizes, isStitchable, product.productType, product.tags, needsStitchingSize, selectedStitchingType, showBottomStyleOption]);

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

    const nextSelectedOptions = metaToken
      ? { ...selectedOptions, [optionName]: value }
      : { ...selectedOptions, ...selectedOptionsFromVariant(resolvedVariant) };
    setSelectedOptions(nextSelectedOptions);
    setStitchingSize(null);
    setShowSizeValidation(false);

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
      // No separate measurement handoff is required for this choice.
      setShowSizeValidation(false);
    }
    // A changed tailoring choice needs a fresh measurement acknowledgment.
    setStitchingSize(null);
  };

  const handleAddToCart = async () => {
    if (!purchasableVariant) {
      toast.error('Please select all options');
      return;
    }

    if (!isBlouseServiceSelectionConfirmed(product, selectedAvailableServiceAddOnCodes, blouseServiceConfirmed)) {
      toast.error('Confirm the blouse measurement and fit requirements before adding to bag');
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

    // Confirm the after-order handoff only when no native fit choice exists.
    if (needsStitchingSize && !productHasNativeSizes && !stitchingSize) {
      setShowSizeValidation(true);
      toast.error('Please confirm the measurement handoff');
      return;
    }

    // Never replace a missing native menswear size with an invented size grid.
    if (isMenswear && !stitchingSize && !productHasNativeSizes) {
      setShowSizeValidation(true);
      toast.error('Please confirm the measurement handoff');
      return;
    }

    if (metaToken && (!metaRequestedLine || !metaContentId)) { toast.error('Your shopping session expired. Return to your Meta shopping link before continuing.'); return; }
    setIsAdding(true);
    const metaItems: CartItem[] = [];
    const addConfiguredItem = (item: CartItem) => { if (metaToken) metaItems.push(item); else addItem(item); };

    const blouseConfirmationAttributes = blouseServiceConfirmationAttributes(
      product, selectedAvailableServiceAddOnCodes, blouseServiceConfirmed,
    );
    const customAttributes: Array<{ key: string; value: string }> = [...blouseConfirmationAttributes];
    if (isBanarasiSareeServiceProduct(product) && selectedAvailableServiceAddOnCodes.length > 0) {
      customAttributes.push({
        key: 'Selected Saree Services',
        value: selectedAvailableServiceAddOnCodes.map(code => SERVICE_ADD_ONS[code].label).join('; '),
      });
    }
    if (requiresNativeTimingConfirmation) {
      customAttributes.push(
        { key: 'Tailoring', value: 'Alterations / finishing requested' },
        { key: 'Timing Confirmation', value: alterationShippingTimingNotice(shipsWithinDays) },
      );
    }
    if (customizableProduct) {
      customAttributes.push(
        { key: 'Fit Request', value: 'Confirmation required' },
        { key: 'Requested Custom Color', value: `${requestedCustomColor.trim()} — pending LuxeMia confirmation` },
        { key: 'Measurements', value: 'Required after order' },
        ...(requiresNativeTimingConfirmation ? [] : [{ key: 'Timing Estimate', value: alterationShippingTimingNotice(shipsWithinDays) }]),
      );
    }
    if (madeToOrderProduct && !customizableProduct) {
      customAttributes.push(
        { key: 'Fit Request', value: 'Confirmation required' },
        { key: 'Measurements', value: 'Required after order' },
        ...(requiresNativeTimingConfirmation ? [] : [{ key: 'Timing Estimate', value: alterationShippingTimingNotice(shipsWithinDays) }]),
      );
    }
    if (isCustomSizeSelected) {
      customAttributes.push(
        { key: 'Custom Size', value: 'Measurements must be confirmed before alterations' },
        { key: 'Measurement Confirmation', value: 'Customer acknowledged before checkout' },
      );
    }
    if (isCustomSizeSelected && !madeToOrderProduct && !requiresNativeTimingConfirmation) {
      customAttributes.push({
        key: 'Timing Estimate',
        value: alterationShippingTimingNotice(shipsWithinDays),
      });
    }
    if (isStitchable && selectedStitchingType) {
      const stitchingOption = STITCHING_TYPE_OPTIONS.find(o => o.id === selectedStitchingType);
      customAttributes.push({ key: 'Stitching Type', value: stitchingOption?.label || selectedStitchingType });
      if (stitchingOption?.requiresQuote) {
        customAttributes.push({ key: 'Tailoring Confirmation', value: 'Listing-specific availability, measurements, timing, and charge require LuxeMia confirmation' });
      }
    }
    if ((needsStitchingSize || isMenswear) && !productHasNativeSizes && stitchingSize) {
      customAttributes.push({ key: 'Measurement Handoff', value: stitchingSize });
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
    if (!hasNativeFullStitching && customAlteration.trim()) {
      customAttributes.push({ key: 'Custom Alteration Instructions', value: customAlteration.trim() });
    }

    addConfiguredItem({
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
        addConfiguredItem({
          product: { node: serviceAddOnProduct },
          serviceAddOnCode: code,
          variantId: serviceVariant.id,
          variantTitle: serviceVariant.title,
          price: serviceVariant.price,
          quantity,
          selectedOptions: serviceVariant.selectedOptions,
          customAttributes: [
            { key: 'Applies To', value: product.title },
            ...(selectedServicesRequireProcessing([code])
              ? [{ key: 'Timing Estimate', value: alterationShippingTimingNotice(shipsWithinDays) }]
              : []),
            ...(isBanarasiSareeServiceProduct(product)
              ? [{ key: 'Selected Service', value: SERVICE_ADD_ONS[code].label }]
              : []),
            ...(code === 'blouse-stitching' ? blouseConfirmationAttributes : []),
          ],
        });
      }
    }

    if (metaToken && metaContentId) {
      try { window.location.assign(saveMetaConfiguration(metaToken, metaContentId, product.handle, metaItems)); }
      catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save your product options.'); }
      setIsAdding(false);
      return;
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
    <div id="product-purchase" className="scroll-mt-28 lg:scroll-mt-36 space-y-6">
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
      {metaToken && metaContext && <div className="border rounded p-3 text-sm"><p>Review or re-enter all options for this item; saving replaces its previous configuration. Then use Add to Bag to return to your complete Meta selection. Your other products and discount code stay saved; your regular bag is unchanged.</p><Link className="underline" to={metaReturnPath(metaToken)}>Return to my Meta selection without changing this item</Link></div>}
      <h1 className="text-3xl lg:text-4xl font-serif leading-tight">{product.title}</h1>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <p className="text-2xl font-medium text-foreground">
            {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
          </p>
          {currentReferencePrice && (
            <p className="text-lg text-muted-foreground line-through">
              {formatPrice(
                currentReferencePrice.amount,
                currentReferencePrice.currencyCode
              )}
            </p>
          )}
        </div>
        {currentReferencePrice && (
          <p className="text-sm text-primary font-medium">
            {Math.round((1 - parseFloat(currentPrice.amount) /
              parseFloat(currentReferencePrice.amount)) * 100)}% off — You save {formatPrice(
              (parseFloat(currentReferencePrice.amount) - parseFloat(currentPrice.amount)).toFixed(2),
              currentPrice.currencyCode
            )}
          </p>
        )}
      </div>

      {(productSpecs.fabric || productSpecs.includedPieces || productSpecs.work) && (
        <dl className="space-y-2 rounded-sm bg-secondary/30 p-4 text-sm">
          {productSpecs.fabric && <div><dt className="font-medium">Fabric</dt><dd className="text-muted-foreground">{productSpecs.fabric}</dd></div>}
          {productSpecs.includedPieces && <div><dt className="font-medium">Included pieces</dt><dd className="text-muted-foreground">{productSpecs.includedPieces}</dd></div>}
          {productSpecs.work && <div><dt className="font-medium">Work &amp; embellishment</dt><dd className="text-muted-foreground">{productSpecs.work}</dd></div>}
        </dl>
      )}

      <p className="text-xs text-muted-foreground">{DESTINATION_IMPORT_NOTICE}</p>

      {/* Shipping terms — timing is confirmed from the selected product and service */}
      <DeliveryEstimate shipsWithinDays={shipsWithinDays} hasStitching={needsStitchingSize} isMadeToOrder={currentSelectionIsMadeToOrder} isUnstitched={isUnstitchedDelivery} hasStitchedBlouse={hasStitchedBlouse} confirmAvailability={product.tags?.includes('availability:Confirm before ordering')} requiresTailoringTimingConfirmation={requiresNativeTimingConfirmation} hasSelectedAlterations={hasSelectedAlterations} />
      {shipByLabel && !currentSelectionIsMadeToOrder && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground" role="status">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{shipByLabel}. This is the estimated dispatch date; carrier transit time is separate.</span>
        </p>
      )}

      <Separator />

      {customizableProduct && (
        <section className="space-y-4 rounded-sm border border-primary/30 bg-primary/5 p-4" aria-labelledby="made-to-order-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Fit and color requests require confirmation</p>
            <h2 id="made-to-order-heading" className="mt-1 font-serif text-2xl">Custom color and measurements</h2>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Request a color only if LuxeMia confirms availability in writing; a custom color is not guaranteed.</li>
            <li>The listed semi-stitched or ready-stitched item may be altered to confirmed measurements; the supplied construction remains as described.</li>
            <li>{alterationShippingTimingNotice(shipsWithinDays)}</li>
            <li>Other design changes are not included unless LuxeMia confirms them in writing.</li>
            <li>For deliveries outside the United States, import-charge treatment must be confirmed in writing before the order is accepted; do not assume duty-free delivery.</li>
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
              <p><strong className="text-foreground">Made to Measure (UDesign):</strong> The design choices, measurements, timing, and charge require LuxeMia confirmation before alterations.</p>
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
                After checkout, LuxeMia will use the order contact details to confirm whether tailoring is available, the exact measurements, timing, and any charge before alterations. Contact LuxeMia before ordering for a fixed event date.
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
        />
      )}

      {/* ─── More Colors (same design, other color listings) ─── */}
      {colorways.swatches.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            More Colors
          </span>
          <div className="flex items-center gap-2">
            {colorways.swatches.map((swatch) => {
              const isCurrent = colorways.current?.handle === swatch.handle;
              const circle = (
                <span
                  aria-hidden="true"
                  className={`block h-7 w-7 rounded-full border border-black/10 shadow-sm transition-transform duration-200 ${
                    isCurrent ? 'ring-2 ring-foreground ring-offset-2' : 'group-hover/link:scale-110'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              );
              return isCurrent ? (
                <span key={swatch.handle} title={`${swatch.color} — current selection`}>
                  {circle}
                </span>
              ) : (
                <Link
                  key={swatch.handle}
                  to={`/product/${swatch.handle}`}
                  className="group/link"
                  title={`View ${swatch.color}`}
                  aria-label={`View ${swatch.color} colorway`}
                >
                  {circle}
                </Link>
              );
            })}
          </div>
        </div>
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
                {getCustomerFacingProductOptionName(option)}
                {selectedOptions[option.name] && (
                  <span className="font-normal text-muted-foreground ml-2">
                    — {selectedOptions[option.name]}
                  </span>
                )}
              </label>
              {getCustomerFacingProductOptionName(option) === 'Size' && (
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
                const priceDelta = optionValuePriceDeltas.get(`${option.name}::${value}`);
                const deltaLabel = priceDelta
                  ? ` +$${priceDelta % 1 === 0 ? priceDelta : priceDelta.toFixed(2)}`
                  : '';
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleOptionSelect(option.name, value)}
                    disabled={!optionValueAvailable}
                    aria-label={`${value}${deltaLabel}${optionValueAvailable ? '' : ' — unavailable'}`}
                    className={`px-4 py-2.5 text-sm border rounded-sm transition-all duration-300 ${
                      selectedOptions[option.name] === value
                        ? 'border-foreground bg-foreground text-background'
                        : optionValueAvailable
                        ? 'border-border hover:border-foreground/50'
                        : 'cursor-not-allowed border-border text-muted-foreground opacity-45'
                    }`}
                  >
                    {value}
                    {deltaLabel && (
                      <span className="ml-1.5 text-xs opacity-75">{deltaLabel}</span>
                    )}
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
                ? 'Choose from the finishing and accessory options shown for this saree before adding it to bag. The selected options are included with this saree order.'
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
                  onClick={() => {
                    if (code === 'blouse-stitching') setBlouseServiceConfirmed(false);
                    setStitchingSize(null);
                    setShowSizeValidation(false);
                    setSelectedServiceAddOnCodes((current) =>
                      current.includes(code)
                        ? current.filter((currentCode) => currentCode !== code)
                        : [...current, code],
                    );
                  }}
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
          {needsBlouseServiceConfirmation && (
            <div className="space-y-2 rounded-sm border border-primary/30 bg-background p-3">
              <p className="text-sm font-medium">Blouse measurements and design confirmation</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The included blouse piece is unstitched. No finished blouse size is guaranteed by this listing.
                LuxeMia will confirm what can be made from the supplied fabric before stitching starts.
                Contact us before ordering if you need to confirm a particular fit, design or event date.
              </p>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={blouseServiceConfirmed}
                  onChange={(event) => setBlouseServiceConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span>{BLOUSE_SERVICE_CONFIRMATION_NOTICE}</span>
              </label>
            </div>
          )}
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
            <h3 id="custom-size-confirmation-heading" className="mt-1 font-serif text-xl">Measurements must be confirmed before alterations</h3>
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
            <span>I understand that LuxeMia must confirm my measurements before alterations begin.</span>
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
              disabled={!!metaToken && quantity >= 99}
              onClick={() => setQuantity(metaToken ? Math.min(99, quantity + 1) : quantity + 1)}
              className="p-3 hover:bg-secondary transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {shipByLabel && !currentSelectionIsMadeToOrder && (
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
            {currentSelectionIsMadeToOrder
              ? 'Alteration measurements must be confirmed with LuxeMia. '
              : listedSizeOptions ? `Listed options: ${listedSizeOptions}. ` : 'Available sizing varies by product. '}
            {hasStitchedBlouse ? (
              <span>The size applies to the stitched blouse. Contact LuxeMia with full-bust and underbust measurements if you need fit guidance; these labels do not specify bra cup sizes.</span>
            ) : (
              <Link to="/size-guide" className="font-medium text-primary underline underline-offset-4">
                View the sizing chart
              </Link>
            )}
          </dd>

          <dt className="font-medium text-foreground">Shipping Estimate</dt>
          <dd className="text-muted-foreground">
            {hasSelectedAlterations
              ? alterationShippingTimingNotice(shipsWithinDays)
              : shipByLabel
              ? `${shipByLabel} without alterations. ${productShippingTimingNotice(shipsWithinDays)}`
              : BASE_SHIPPING_TIMING_NOTICE}
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
          {shortDescription}
        </p>
        <p className="text-xs text-muted-foreground">
          Full specifications, set contents, shipping and care details are in the Product Details tabs below.
        </p>
        <p className="text-xs text-muted-foreground">
          On-screen colors can vary slightly between devices and finished fabric. Decorative items shown for styling are not part of this listing unless listed in Product Details.
        </p>
      </section>

      <Separator />

      {/* Fit guidance — no unsupported refund or credit promise. */}
      <div className="flex items-center gap-3 p-3 bg-card/50 rounded-sm border border-border/30">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BadgeCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Order with sizing confidence</p>
          <p className="text-xs text-muted-foreground">
            Message Mini on WhatsApp for personal sizing help before you order — garments ship from India, so change-of-mind returns aren't possible. If anything arrives damaged, incorrect, or incomplete, the covered-order-issue process has you covered.{' '}
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
            <p className="text-xs text-muted-foreground">the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius</p>
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
