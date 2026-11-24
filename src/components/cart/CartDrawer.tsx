import { hasPendingMeasurementAttributes } from '@/lib/measurementRequest';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { X, Minus, Plus, Trash2, Loader2, ArrowRight, ShieldCheck, Award, Truck, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { getProductShipsWithin } from '@/lib/shipBy';
import { normalizeFulfillmentAttributes } from '../../lib/fulfillmentAttributes';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { getOptimizedImage } from '@/lib/imageUtils';
import { isGarmentAlterationCartLine, isHiddenBillingProductHandle } from '@/lib/serviceAddOns';
import { DESTINATION_IMPORT_NOTICE, SHIPPING_POLICY_SUMMARY, US_FREE_SHIPPING_THRESHOLD } from '@/config/shippingPolicy';
import { WELCOME_OFFER } from '@/config/welcomeOffer';
import { appendGaLinkerParams } from '../../lib/gaLinker';
const FREE_SHIPPING_THRESHOLD = US_FREE_SHIPPING_THRESHOLD;
const SHIPPING_PROMISE = SHIPPING_POLICY_SUMMARY;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const {
    items,
    isLoading,
    checkoutUrl: rawCheckoutUrl,
    checkoutError,
    updateQuantity,
    removeItem,
    createCheckout,
    trackCheckoutClick,
    trackCartView,
  } = useCartStore();
  const checkoutUrl = rawCheckoutUrl ? appendGaLinkerParams(rawCheckoutUrl) : null;

  useEffect(() => {
    if (isOpen) {
      trackCartView();
    }
  }, [isOpen, trackCartView]);
  
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const currencyCode = items[0]?.price.currencyCode || 'USD';
  // Persisted carts can outlive Shopify inventory changes. Block checkout when
  // the locally stored variant is explicitly unavailable instead of sending a
  // stale line to Shopify and giving the customer a confusing API error.
  const unavailableItems = items.filter((item) => {
    const variant = item.product.node.variants?.edges?.find((edge) => edge.node.id === item.variantId);
    return variant?.node.availableForSale === false;
  });
  // The checkout URL is only valid for the exact cart snapshot Shopify
  // approved. Keep a stable key in the component so failed preparation is not
  // retried on every render, while a cart edit immediately requests a rebuild.
  const checkoutRequestKey = JSON.stringify(items.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
    handle: item.product.node.handle,
    price: item.price,
    customAttributes: item.customAttributes || [],
  })));
  const attemptedCheckoutKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      attemptedCheckoutKey.current = null;
      return;
    }
    if (!items.length || unavailableItems.length > 0 || isLoading || checkoutUrl
      || attemptedCheckoutKey.current === checkoutRequestKey) return;

    attemptedCheckoutKey.current = checkoutRequestKey;
    // Prepare the destination before the shopper clicks so the CTA can be a
    // native anchor for Google's automatic cross-domain linker.
    void createCheckout({ trackEvents: false });
  }, [
    isOpen,
    items.length,
    unavailableItems.length,
    isLoading,
    checkoutUrl,
    checkoutRequestKey,
    createCheckout,
  ]);

  const formatPrice = (amount: number, _currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleCheckoutRetry = () => {
    if (unavailableItems.length > 0 || isLoading) return;
    attemptedCheckoutKey.current = checkoutRequestKey;
    void createCheckout({ trackEvents: false });
  };

  const copyWelcomeCode = async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_OFFER.code);
      toast.success(`Copied ${WELCOME_OFFER.code}`, {
        description: 'Enter it at checkout for 10% off your first order.',
      });
    } catch {
      toast.success(`${WELCOME_OFFER.code} — enter at checkout`, {
        description: 'One use per customer. U.S. free shipping $150+ applies after discounts.',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed top-0 right-0 bottom-0 z-[60] flex w-full flex-col border-l border-border/60 bg-background shadow-2xl sm:w-[440px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/70 bg-card/30 px-5 py-5 sm:px-6">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Your selection</p>
                <h2 id="cart-title" className="mt-1 font-serif text-2xl leading-none">Your Bag <span className="text-base text-muted-foreground">({items.length})</span></h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:space-y-6 sm:p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-foreground/60 mb-2">Your cart is empty</p>
                  <p className="text-sm text-foreground/40">Add some beautiful pieces to get started.</p>
                </div>
              ) : (
                items.map((item, index) => {
                  const isService = isHiddenBillingProductHandle(item.product.node.handle);
                  const isGarmentAlteration = isGarmentAlterationCartLine(item, items);
                  const variantImage = item.product.node.variants.edges.find(
                    ({ node }) => node.id === item.variantId,
                  )?.node.image;
                  const image = isService ? undefined : variantImage ?? item.product.node.images?.edges?.[0]?.node;
                  const serviceLabel = isGarmentAlteration ? 'Garment Alteration' : item.variantTitle.replace(/\s*\(\+\$[\d.]+\)\s*$/, '');
                  const pendingMeasurements = hasPendingMeasurementAttributes(item.customAttributes);
                  const reference = item.customAttributes?.find(attribute => attribute.key === 'Configuration reference')?.value;
                  const measurementGarment = isService ? items.find(candidate => !isHiddenBillingProductHandle(candidate.product.node.handle)
                    && Boolean(reference) && candidate.customAttributes?.some(attribute => attribute.key === 'Configuration reference' && attribute.value === reference)) : item;
                  const visibleAttributes = normalizeFulfillmentAttributes(item.customAttributes, getProductShipsWithin(item.product.node));
                  
                  return (
                    <motion.div
                      key={`${item.variantId}-${JSON.stringify(visibleAttributes)}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-3 sm:gap-4 ${isService ? 'rounded-sm bg-card/60 p-3' : 'border-b border-border/50 pb-5'}`}
                    >
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-sm border border-border/50 bg-card">
                        {image ? (
                          <img
                            src={getOptimizedImage(image.url, 'thumbnail')}
                            alt={image.altText || item.product.node.title}
                            width={80}
                            height={96}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          isService ? (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 px-2 text-center text-[10px] font-medium leading-tight text-link">
                              {isGarmentAlteration ? 'Garment alteration' : 'Saree service'}
                            </div>
                          ) : (
                            <ProductPlaceholder className="w-full h-full" />
                          )
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                          <h3 className="mb-1 pr-1 font-serif text-base leading-snug">
                            {isService ? serviceLabel : item.product.node.title}
                          </h3>
                        <p className="text-xs text-foreground/60 mb-1">
                          {isService
                            ? (isGarmentAlteration ? 'Alteration service for your selected garment' : 'Finishing service for your selected saree')
                            : (item.selectedOptions.map(o => o.value).join(' / ') || item.variantTitle)}
                        </p>
                        {pendingMeasurements && <div role="alert" className="mb-2 rounded border border-amber-400 p-2 text-xs">
                          <p>Measurement details were cleared when this page reloaded. Checkout is blocked for this configuration.</p>
                          {measurementGarment ? <a className="underline" href={`/product/${measurementGarment.product.node.handle}`}
                            onClick={() => { removeItem(measurementGarment.variantId, measurementGarment.customAttributes); onClose(); }}>
                            Remove this configuration and reopen the product to enter details again or choose after-order submission
                          </a> : <button type="button" className="underline" onClick={() => removeItem(item.variantId, item.customAttributes)}>Remove this incomplete measurement item</button>}
                        </div>}
                        {visibleAttributes && visibleAttributes.length > 0 && (
                          <div className="mb-2 space-y-0.5">
                            {visibleAttributes.filter(attr => attr.key !== 'Configuration reference').map((attr, i) => (
                              <p key={i} className="text-[11px] text-link italic leading-tight">
                                <span className="font-medium">{attr.key}:</span> {attr.value}
                              </p>
                            ))}
                          </div>
                        )}
                          <p className="text-sm font-semibold text-foreground">
                            {formatPrice(parseFloat(item.price.amount), item.price.currencyCode)}
                          </p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          {isService ? (
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              Applied to {item.quantity} {isGarmentAlteration ? 'garment' : 'saree'}{item.quantity === 1 ? '' : 's'}
                            </p>
                          ) : (
                            <div className="flex items-center gap-3 rounded-sm border border-border/60 bg-background px-2 py-1">
                              <button
                                className="rounded-full p-1 transition-colors hover:bg-card"
                                aria-label="Decrease quantity"
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1, item.customAttributes)}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center text-sm">{item.quantity}</span>
                              <button
                                className="rounded-full p-1 transition-colors hover:bg-card"
                                aria-label="Increase quantity"
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1, item.customAttributes)}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <button
                            className="rounded-full p-2 text-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={isService ? `Remove ${serviceLabel}` : 'Remove item'}
                            onClick={() => removeItem(item.variantId, item.customAttributes)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer — keeps Subtotal & Checkout immediately visible; detailed policies collapse */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-border bg-card safe-area-bottom">
                {/* Free Shipping Progress */}
                <div className="px-4 pt-3 pb-2 sm:px-6 sm:pt-3.5">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-medium">
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span>Your current subtotal meets the free U.S. shipping threshold before checkout discounts</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-foreground/75 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span>{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal, currencyCode)} below the free U.S. shipping threshold before checkout discounts</span>
                        </span>
                        <span className="shrink-0 font-medium">${FREE_SHIPPING_THRESHOLD}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                        <motion.div
                          className="h-full bg-foreground rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 px-4 pb-3 sm:px-6 sm:pb-4">
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between text-sm sm:text-base">
                      <span className="font-medium text-foreground">Subtotal</span>
                      <span className="font-semibold text-foreground">{formatPrice(subtotal, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                      <span>Shipping &amp; tax</span>
                      <span className="text-right">Calculated at checkout</span>
                    </div>
                  </div>
                  {unavailableItems.length > 0 && (
                    <p className="text-xs text-destructive text-center" role="alert">
                      One or more items is no longer available. Remove it from your bag to continue.
                    </p>
                  )}
                  {checkoutError && (
                    <p id="cart-checkout-error" className="text-xs text-destructive text-center" role="alert">
                      {checkoutError}
                    </p>
                  )}
                  {WELCOME_OFFER.enabled && checkoutUrl && unavailableItems.length === 0 && (
                    <>
                      <button
                        type="button"
                        onClick={copyWelcomeCode}
                        className="w-full flex items-center justify-center gap-2 border border-background bg-background rounded-sm py-2.5 text-xs sm:text-sm font-medium transition-colors hover:bg-muted text-foreground"
                      >
                        <Copy className="h-4 w-4 shrink-0" />
                        First order? Copy {WELCOME_OFFER.code} → {WELCOME_OFFER.discountPercent} percent off at checkout
                      </button>
                      <p className="text-[10px] text-center text-muted-foreground">
                        One use per customer · entered at checkout · U.S. free shipping $150+ applies after discounts
                      </p>
                    </>
                  )}
                  {checkoutUrl && unavailableItems.length === 0 ? (
                    <Button
                      asChild
                      variant="luxury"
                      size="lg"
                      className="w-full"
                    >
                      <a
                        href={checkoutUrl}
                        onClick={trackCheckoutClick}
                        data-testid="button-checkout"
                        aria-describedby={checkoutError ? 'cart-checkout-error' : undefined}
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Proceed to Secure Checkout
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="luxury"
                      size="lg"
                      className="w-full"
                      onClick={handleCheckoutRetry}
                      disabled={isLoading || unavailableItems.length > 0 || (!checkoutError && !checkoutUrl)}
                      data-testid="button-checkout"
                      aria-describedby={checkoutError ? 'cart-checkout-error' : undefined}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Checkout...
                        </>
                      ) : checkoutError ? (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Retry Secure Checkout
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Preparing Secure Checkout...
                        </>
                      )}
                    </Button>
                  )}
                  <details className="group rounded-sm border border-border/70 bg-background px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-foreground/85 [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                      <span>Shipping, duties &amp; discount policies</span>
                      <span className="shrink-0 text-xs font-medium text-link underline underline-offset-4 group-open:hidden">Details</span>
                      <span className="hidden shrink-0 text-xs font-medium text-link underline underline-offset-4 group-open:inline">Hide</span>
                    </summary>
                    <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto overscroll-contain border-t border-border/50 pt-2 text-left">
                      <p>Subtotal excludes shipping and applicable sales tax. Enter any eligible discount codes at checkout; eligibility and final amounts are confirmed there.</p>
                      <p>{SHIPPING_PROMISE}</p>
                      <p>{DESTINATION_IMPORT_NOTICE}</p>
                      <p>Discounts are applied before shipping eligibility. Destination, local-currency conversion and final delivery options are confirmed at checkout.</p>
                      <p>Payment is completed securely on LuxeMia’s checkout page.</p>
                    </div>
                  </details>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-foreground" />
                        Secure
                      </span>
                      <span className="hidden xs:inline-flex sm:inline-flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 shrink-0 text-foreground" />
                        Tracked shipping
                      </span>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-xs font-medium text-link transition-colors hover:text-link/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring underline underline-offset-4"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>

        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
