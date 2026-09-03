import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, Check, CheckCircle2, Minus, Plus, ShoppingBag, Truck, Package, Lock, Info, MessageCircle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  createGarmentLineId,
  GARMENT_LINE_ID_ATTRIBUTE,
  useCartStore,
} from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';
import { SizeGuideModal } from './SizeGuideModal';
import { DeliveryEstimate } from './DeliveryEstimate';
import type { ShopifyProduct } from '@/lib/shopify';
import { getProcessingEstimateLabel } from '@/lib/shipBy';
import { isMadeToOrderProduct } from '@/lib/customizableProducts';
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
} from '@/lib/productPurchaseFlow';
import {
  hasExplicitCustomColorEvidence,
  hasExplicitCustomizationEvidence,
  hasExplicitCustomMeasurementEvidence,
  hasExplicitMenswearEvidence,
} from '@/lib/productEvidence';
import { hasExplicitReadyToShipEvidence } from '@/lib/readyToShipEvidence';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import {
  getEligibleServiceAddOns,
  normalizeServiceOptionLabel,
  SERVICE_ADD_ON_PRODUCT_HANDLE,
  SERVICE_ADD_ONS,
  type ServiceAddOnCode,
} from '@/lib/serviceAddOns';
import { formatCurrencyAmount } from '@/lib/formatCurrency';
import { normalizeBrandName } from '@/lib/schema';

type ShopifyVariant = ShopifyProduct['node']['variants']['edges'][number]['node'];

const hasValidPositiveMoney = (money?: ShopifyVariant['price'] | null): boolean => (
  Boolean(money)
  && Number.isFinite(Number(money?.amount))
  && Number(money?.amount) > 0
  && /^[A-Z]{3}$/.test(money?.currencyCode || '')
);

interface ProductInfoProps {
  product: ShopifyProduct['node'];
  onSelectedVariantChange?: (variant: ShopifyVariant | null) => void;
}

// Helper to extract product specs from tags
const extractProductSpecs = (
  tags?: string[],
  productType?: string,
  metadataIncludedComponents?: string[] | null,
) => {
  const specs: Record<string, string> = {};
  const lowerProductType = productType?.toLowerCase() || '';
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
  );
  if (includedPieces) specs.includedPieces = includedPieces;

  // Legacy accessory tags contain garment attributes on some listings. Avoid
  // surfacing those as jewelry specifications until the catalog is corrected.
  if (isAccessory) return specs;

  // Only explicitly prefixed catalog fact tags are specifications. Free-form
  // title and tag keywords remain discovery text and are never promoted here.
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
  if (explicitFabrics.length > 0) {
    specs.fabric = explicitFabrics.join('; ');
  }

  const explicitWorkValues = getExplicitTagValues(['work:', 'embroidery:', 'embellishment:']);
  if (explicitWorkValues.length > 0) {
    specs.work = explicitWorkValues.join('; ');
  }

  const explicitColors = getExplicitTagValues(['color:']);
  if (explicitColors.length > 0) {
    specs.color = explicitColors.join('; ');
  }

  return specs;
};

export const ProductInfo = ({ product, onSelectedVariantChange }: ProductInfoProps) => {
  const [searchParams] = useSearchParams();
  const requestedVariantId = searchParams.get('variant');
  const hasCustomColorEvidence = hasExplicitCustomColorEvidence(product);
  const hasCustomMeasurementEvidence = hasExplicitCustomMeasurementEvidence(product);
  const hasCustomizationEvidence = hasExplicitCustomizationEvidence(product);
  const madeToOrderProduct = isMadeToOrderProduct(product.handle, product.tags);
  const { product: serviceAddOnProduct } = useShopifyProduct(
    SERVICE_ADD_ON_PRODUCT_HANDLE,
    { allowHiddenBillingProduct: true },
  );
  // Product type and explicit catalog terms may identify the audience, but do
  // not create unlisted size choices. Shopify options remain the size source.
  const isMenswear = hasExplicitMenswearEvidence(product.productType, product.tags);
  const productHasNativeSizes = hasNativeProductSizeOption(product.options);
  const isSareeListing = /\b(?:saree|sari)\b/i.test(`${product.title} ${product.productType || ''}`);
  const verifiedBrandName = normalizeBrandName(product.vendor);

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
    const requestedPurchasable = requestedVariant?.node.availableForSale === true
      ? requestedVariant
      : undefined;
    const firstPurchasable = requestedPurchasable ?? product.variants.edges.find(
      (edge) => edge.node.availableForSale === true
    );

    firstPurchasable?.node.selectedOptions.forEach((option) => {
      defaults[option.name] = option.value;
    });

    return defaults;
  }, [product.variants.edges, requestedVariantId]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(defaultOptions);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [customSizeConfirmed, setCustomSizeConfirmed] = useState(false);
  const [requestedCustomColor, setRequestedCustomColor] = useState('');
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
    if (!serviceAddOnProduct || serviceAddOnProduct.availableForSale !== true) return variants;

    for (const code of eligibleServiceAddOnCodes) {
      const definition = SERVICE_ADD_ONS[code];
      const variant = serviceAddOnProduct.variants.edges.find(({ node }) =>
        node.availableForSale === true && hasValidPositiveMoney(node.price) && node.selectedOptions.some((option) =>
          option.name === 'Service'
          && normalizeServiceOptionLabel(option.value)
            === normalizeServiceOptionLabel(definition.checkoutOptionLabel),
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
    selectedVariant?.node.availableForSale === true
      ? selectedVariant
      : product.variants.edges.find((edge) =>
          edge.node.availableForSale === true && edge.node.selectedOptions.every(
            (option) => selectedOptions[option.name] === option.value
          )
        )
  ) ?? (
    product.variants.edges.length === 1
      && product.variants.edges[0].node.availableForSale === true
      ? product.variants.edges[0]
      : undefined
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
  const selectedServicePrices = useMemo(
    () => selectedAvailableServiceAddOnCodes
      .map((code) => serviceVariants.get(code)?.price)
      .filter((price): price is ShopifyVariant['price'] => Boolean(price)),
    [selectedAvailableServiceAddOnCodes, serviceVariants],
  );
  const selectedServicesShareBaseCurrency = selectedServicePrices.every(
    (price) => price.currencyCode === basePrice.currencyCode,
  );
  const selectedServiceAddOnCharge = selectedServicesShareBaseCurrency
    ? selectedServicePrices.reduce((total, price) => total + Number.parseFloat(price.amount), 0)
    : null;
  const currentPrice = useMemo(() => {
    const baseAmount = parseFloat(basePrice.amount);
    return {
      amount: (baseAmount + (selectedServiceAddOnCharge ?? 0)).toString(),
      currencyCode: basePrice.currencyCode,
    };
  }, [basePrice, selectedServiceAddOnCharge]);
  const compareAtPrice = selectedServicePrices.length === 0
    && product.compareAtPriceRange?.maxVariantPrice
    && product.compareAtPriceRange.maxVariantPrice.currencyCode === currentPrice.currencyCode
    && Number.isFinite(Number(product.compareAtPriceRange.maxVariantPrice.amount))
    && Number(product.compareAtPriceRange.maxVariantPrice.amount) > Number(currentPrice.amount)
      ? product.compareAtPriceRange.maxVariantPrice
      : null;
  const hasAvailableVariant = product.availableForSale === true
    && product.variants.edges.some((edge) => edge.node.availableForSale === true);
  const isAvailable = product.availableForSale === true
    && purchasableVariant?.node.availableForSale === true;
  const sku = purchasableVariant?.node.sku || product.variants.edges[0]?.node.sku;
  
  const productSpecs = useMemo(
    () => extractProductSpecs(
      product.tags,
      product.productType,
      product.metadata?.includedComponents,
    ),
    [product.tags, product.productType, product.metadata?.includedComponents],
  );
  const processingEstimateLabel = getProcessingEstimateLabel(product);
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
  const requiresProductionPlanning = madeToOrderProduct || isCustomSizeSelected;
  const hasSelectedVerifiedService = selectedAvailableServiceAddOnCodes.length > 0;

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

  };

  const handleAddToCart = async () => {
    if (
      product.availableForSale !== true
      || purchasableVariant?.node.availableForSale !== true
    ) {
      if (!hasAvailableVariant) {
        toast.error('This product is currently out of stock');
        return;
      }
      toast.error('Please select all options');
      return;
    }

    if (hasCustomColorEvidence && !requestedCustomColor.trim()) {
      toast.error('Enter your requested custom color');
      return;
    }

    if (isCustomSizeSelected && !customSizeConfirmed) {
      toast.error('Confirm that the listing-specific Custom option needs follow-up');
      return;
    }

    setIsAdding(true);

    const customAttributes: Array<{ key: string; value: string }> = [];
    const garmentLineId = hasSelectedVerifiedService ? createGarmentLineId() : null;
    if (hasCustomColorEvidence) {
      customAttributes.push(
        { key: 'Requested Custom Color', value: `${requestedCustomColor.trim()} — pending LuxeMia confirmation` },
      );
    }
    if (madeToOrderProduct) {
      customAttributes.push({ key: 'Made to Order', value: 'Catalog classification; product-specific timing requires confirmation' });
    }
    if (isCustomSizeSelected) {
      customAttributes.push(
        { key: 'Custom Size', value: 'Selected from this listing; included details require confirmation' },
        { key: 'Custom Option Confirmation', value: 'Customer acknowledged before checkout' },
      );
    }
    if (garmentLineId) {
      customAttributes.push({ key: GARMENT_LINE_ID_ATTRIBUTE, value: garmentLineId });
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

    if (serviceAddOnProduct && garmentLineId) {
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
            { key: GARMENT_LINE_ID_ATTRIBUTE, value: garmentLineId },
          ],
        });
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsAdding(false);
    openCart();
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
      {verifiedBrandName && (
        <p className="text-sm tracking-luxury uppercase text-primary font-medium">
          {verifiedBrandName}
        </p>
      )}

      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-serif leading-tight">{product.title}</h1>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <p className="text-2xl font-medium text-foreground">
            {formatCurrencyAmount(currentPrice.amount, currentPrice.currencyCode)}
          </p>
          {compareAtPrice && (
            <p className="text-lg text-muted-foreground line-through">
              {formatCurrencyAmount(
                compareAtPrice.amount,
                compareAtPrice.currencyCode
              )}
            </p>
          )}
        </div>
        {compareAtPrice && (
          <p className="text-sm text-primary font-medium">
            {Math.round((1 - parseFloat(currentPrice.amount) /
              parseFloat(compareAtPrice.amount)) * 100)}% off — You save {formatCurrencyAmount(
              (parseFloat(compareAtPrice.amount) - parseFloat(currentPrice.amount)).toFixed(2),
              currentPrice.currencyCode
            )}
          </p>
        )}
      </div>

      {/* Shipping terms — timing is confirmed from the selected product and service */}
      <DeliveryEstimate
        hasStitching={hasSelectedVerifiedService}
        isMadeToOrder={requiresProductionPlanning}
        isReadyToShip={hasExplicitReadyToShipEvidence(product) && !requiresProductionPlanning}
        processingEstimateLabel={processingEstimateLabel}
      />
      {processingEstimateLabel && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground" role="status">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{processingEstimateLabel}</span>
        </p>
      )}

      <Separator />

      {hasCustomizationEvidence && (
        <section className="space-y-4 rounded-sm border border-primary/30 bg-primary/5 p-4" aria-labelledby="made-to-order-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Listing-backed custom option</p>
            <h2 id="made-to-order-heading" className="mt-1 font-serif text-2xl">
              {hasCustomColorEvidence && hasCustomMeasurementEvidence
                ? 'Custom color and size options'
                : hasCustomColorEvidence ? 'Custom color option' : 'Custom size option'}
            </h2>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {hasCustomColorEvidence && <li>The current listing exposes a custom-color option. The requested value still requires LuxeMia confirmation.</li>}
            {hasCustomMeasurementEvidence && <li>The current listing exposes a Custom size or measurement option. LuxeMia confirms the required handoff for the selected option.</li>}
            <li>{processingEstimateLabel || 'No production, dispatch, transit, or delivery duration is supplied for this custom option. Confirm timing before ordering for a fixed event date.'}</li>
            <li>Other design changes are not included unless LuxeMia confirms them in writing.</li>
            <li>If LuxeMia confirms that this item will be fulfilled cross-border, import-charge treatment must also be confirmed in writing before the order is accepted; do not assume duty-free delivery.</li>
            <li>A confirmed custom order is final sale for change of mind, subject to applicable law; covered order issues and non-excludable rights remain separate.</li>
          </ul>
          <p className="text-sm text-foreground">
            Before ordering for a fixed event date, send the product link, selected custom option, event date, and country to LuxeMia for confirmation.
          </p>
          {hasCustomColorEvidence && (
            <div className="space-y-2">
              <label htmlFor="requested-custom-color" className="text-sm font-medium">Requested color</label>
              <input
                id="requested-custom-color"
                value={requestedCustomColor}
                onChange={(event) => setRequestedCustomColor(event.target.value)}
                placeholder="Enter the color requested through this listing option"
                className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">The request is not final until LuxeMia confirms it.</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const message = encodeURIComponent(`Hi LuxeMia, I would like to confirm the custom option currently listed for ${product.title} (${window.location.href}).`);
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

      {hasCustomizationEvidence && <Separator />}

      {/* Menswear without a catalog size option receives guidance, not a
          manufactured S–XXL selector. */}
      {isMenswear && !productHasNativeSizes && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200" role="note">
          This listing does not supply selectable size values. Contact LuxeMia before ordering to confirm fit; an unlisted size cannot be selected at checkout.
        </div>
      )}

      {/* ─── Product Options (Color, Size from Shopify) ─── */}
      <div className="space-y-5">
        {product.options
          .filter((option) => shouldRenderShopifyProductOption(option))
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
                ? 'Choose only the currently available saree services shown below. Each selected service is added as a separate Shopify checkout line for this garment.'
                : 'Only services supported by this product’s stated construction are shown and included with this garment order.'}
            </p>
          </div>
          <div className="space-y-2">
            {availableServiceAddOnCodes.map((code) => {
              const service = SERVICE_ADD_ONS[code];
              const serviceVariant = serviceVariants.get(code)!;
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
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    +{formatCurrencyAmount(serviceVariant.price.amount, serviceVariant.price.currencyCode)}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedAvailableServiceAddOnCodes.length > 0 && (
            <p className="text-sm font-medium text-foreground">
              {selectedServiceAddOnCharge === null
                ? 'Selected service prices use a different currency; the combined total is confirmed at Shopify checkout.'
                : `Selected services: +${formatCurrencyAmount(selectedServiceAddOnCharge, basePrice.currencyCode)}`}
            </p>
          )}
        </section>
      )}

      {isCustomSizeSelected && (
        <section className="space-y-3 rounded-sm border border-primary/30 bg-primary/5 p-4" aria-labelledby="custom-size-confirmation-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Custom size selected</p>
            <h3 id="custom-size-confirmation-heading" className="mt-1 font-serif text-xl">Confirm what this listing-specific option includes</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your selected Custom size is recorded with this order. The listing does not establish a universal measurement process, design-change entitlement, or production window; LuxeMia must confirm the applicable details.
          </p>
          <label className="flex items-start gap-3 rounded-sm border border-border bg-background p-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={customSizeConfirmed}
              onChange={(event) => setCustomSizeConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>I understand that LuxeMia must confirm what the selected Custom option includes before production begins.</span>
          </label>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/size-guide" className="font-medium text-primary underline underline-offset-4">View the sizing guide</Link>
            <button
              type="button"
              onClick={() => {
                const message = encodeURIComponent(`Hi LuxeMia, I selected Custom size for ${product.title} (${window.location.href}) and would like to confirm exactly what this option includes before ordering.`);
                window.open(`https://wa.me/12153419990?text=${message}`, '_blank', 'noopener,noreferrer');
              }}
              className="font-medium text-primary underline underline-offset-4"
            >
              Confirm Custom option by WhatsApp
            </button>
          </div>
        </section>
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

      {processingEstimateLabel && (
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground">
          {processingEstimateLabel}
        </div>
      )}

      {/* Trust micro-strip — shown directly above CTA so buyers see it before clicking */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground py-1">
        <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" />Shipping to 7 countries</span>
        <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />Tracking shown when issued</span>
        <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" />Secure checkout</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />Pre-order help available</span>
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
            {productSpecs.fabric || 'Product-specific fabric details were not supplied as a verified listing field. Contact LuxeMia before ordering if this detail affects your decision.'}
          </dd>

          <dt className="font-medium text-foreground">Included Pieces</dt>
          <dd className="text-muted-foreground">
            {productSpecs.includedPieces || 'Included-piece details were not supplied as a verified listing field. Contact LuxeMia before ordering to confirm set contents.'}
          </dd>

          <dt className="font-medium text-foreground">Sizing & Chart</dt>
          <dd className="text-muted-foreground">
            {isCustomSizeSelected
              ? 'The listing-specific Custom option is selected; confirm its included fit details with LuxeMia. '
              : hasCustomMeasurementEvidence
              ? 'This listing exposes a Custom size or measurement option; select only the exact option shown. '
              : listedSizeOptions ? `Listed options: ${listedSizeOptions}. ` : 'Available sizing varies by product. '}
            <Link to="/size-guide" className="font-medium text-primary underline underline-offset-4">
              View the sizing chart
            </Link>
          </dd>

          <dt className="font-medium text-foreground">Shipping Estimate</dt>
          <dd className="text-muted-foreground">
            {requiresProductionPlanning
              ? processingEstimateLabel
                ? `${processingEstimateLabel} Confirm production and carrier timing in writing before ordering for a fixed event date.`
                : 'Production and dispatch timing are product-specific and must be confirmed before ordering for a fixed event date. Carrier transit begins after dispatch.'
              : processingEstimateLabel
              ? `${processingEstimateLabel} When tracking is issued, label creation may precede the carrier’s first scan.`
              : 'Timing depends on the item and selected options. When tracking is issued, label creation may precede the carrier’s first scan.'}
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
            Change-of-mind purchases are final sale. Damage, defects, material misdescription, incorrect-item, or missing-piece reports follow the covered-order-issue process, and non-excludable rights remain separate. Contact LuxeMia before purchase if you need sizing help.{' '}
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
            <p className="text-sm font-medium">Online Support</p>
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
          <span>Packaging varies by product and transit needs</span>
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
