import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { X, Minus, Plus, Trash2, Loader2, ArrowRight, ShieldCheck, Award, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { getOptimizedImage } from '@/lib/imageUtils';
import { isHiddenBillingProductHandle } from '@/lib/serviceAddOns';
import {
  isRakshaBandhanCampaignActive,
  RAKSHA_BANDHAN_CAMPAIGN,
} from '@/config/rakshaBandhanCampaign';

const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_PROMISE = 'Complimentary U.S. shipping is available when the checkout subtotal after discounts is $150 or more; standard shipping is $12 below that.';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const {
    items,
    isLoading,
    updateQuantity,
    removeItem,
    createCheckout,
    trackCartView,
  } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      trackCartView();
    }
  }, [isOpen, trackCartView]);
  
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const currencyCode = items[0]?.price.currencyCode || 'USD';
  const isRakhiSaleActive = isRakshaBandhanCampaignActive();
  const amountUntilRakhiDiscount = Math.max(
    0,
    RAKSHA_BANDHAN_CAMPAIGN.minimumSubtotal - subtotal,
  );
  // Persisted carts can outlive Shopify inventory changes. Block checkout when
  // the locally stored variant is explicitly unavailable instead of sending a
  // stale line to Shopify and giving the customer a confusing API error.
  const unavailableItems = items.filter((item) => {
    const variant = item.product.node.variants?.edges?.find((edge) => edge.node.id === item.variantId);
    return variant?.node.availableForSale === false;
  });

  const formatPrice = (amount: number, _currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleCheckoutClick = () => {
    // Preserve checkout intent: the bag moves directly to secure checkout
    // without inserting a promotional or email-capture interruption.
    proceedToCheckout();
  };

  const proceedToCheckout = async () => {
    if (unavailableItems.length > 0) {
      return;
    }
    const checkoutUrl = await createCheckout();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      onClose();
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
            className="fixed inset-0 bg-foreground/30 z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l border-border/60 bg-background shadow-2xl sm:w-[440px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/70 bg-card/30 px-5 py-5 sm:px-6">
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
            <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:space-y-6 sm:p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-foreground/60 mb-2">Your cart is empty</p>
                  <p className="text-sm text-foreground/40">Add some beautiful pieces to get started.</p>
                </div>
              ) : (
                items.map((item, index) => {
                  const isSareeService = isHiddenBillingProductHandle(item.product.node.handle);
                  const image = isSareeService ? undefined : item.product.node.images?.edges?.[0]?.node;
                  const serviceLabel = item.variantTitle.replace(/\s*\(\+\$[\d.]+\)\s*$/, '');
                  const visibleAttributes = item.customAttributes;
                  
                  return (
                    <motion.div
                      key={`${item.variantId}-${JSON.stringify(item.customAttributes)}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-3 sm:gap-4 ${isSareeService ? 'rounded-sm bg-card/60 p-3' : 'border-b border-border/50 pb-5'}`}
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
                          isSareeService ? (
                            <div className="flex h-full w-full items-center justify-center bg-primary/5 px-2 text-center text-[10px] font-medium leading-tight text-primary">
                              Saree service
                            </div>
                          ) : (
                            <ProductPlaceholder className="w-full h-full" />
                          )
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                          <h3 className="mb-1 pr-1 font-serif text-base leading-snug">
                            {isSareeService ? serviceLabel : item.product.node.title}
                          </h3>
                        <p className="text-xs text-foreground/60 mb-1">
                          {isSareeService
                            ? 'Finishing service for your selected saree'
                            : (item.selectedOptions.map(o => o.value).join(' / ') || item.variantTitle)}
                        </p>
                        {visibleAttributes && visibleAttributes.length > 0 && (
                          <div className="mb-2 space-y-0.5">
                            {visibleAttributes.map((attr, i) => (
                              <p key={i} className="text-[10px] text-primary/80 italic leading-tight">
                                <span className="font-medium">{attr.key}:</span> {attr.value}
                              </p>
                            ))}
                          </div>
                        )}
                          <p className="text-sm font-semibold text-foreground">
                            {formatPrice(parseFloat(item.price.amount), item.price.currencyCode)}
                          </p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          {isSareeService ? (
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              Applied to {item.quantity} saree{item.quantity === 1 ? '' : 's'}
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
                            aria-label={isSareeService ? `Remove ${serviceLabel}` : 'Remove item'}
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/60 bg-card/70 backdrop-blur-sm">
                {/* Free Shipping Progress */}
                <div className="px-5 pb-3 pt-4 sm:px-6">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium mb-2">
                      <Truck className="w-3.5 h-3.5" />
                      Your current subtotal qualifies for free U.S. shipping
                    </div>
                  ) : (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal, currencyCode)} away from complimentary U.S. shipping
                        </span>
                        <span className="font-medium">${FREE_SHIPPING_THRESHOLD}</span>
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

                <div className="space-y-3 px-5 pb-4 sm:px-6">
                  {isRakhiSaleActive && (
                    <div className="border border-primary/25 bg-primary/5 px-4 py-3 text-center">
                      {amountUntilRakhiDiscount === 0 ? (
                        <p className="text-xs leading-relaxed text-foreground">
                          Your offer is unlocked. Enter{' '}
                          <strong className="font-semibold tracking-wide">
                            {RAKSHA_BANDHAN_CAMPAIGN.code}
                          </strong>{' '}
                          at checkout for {RAKSHA_BANDHAN_CAMPAIGN.discountPercent}% off.
                        </p>
                      ) : (
                        <p className="text-xs leading-relaxed text-foreground">
                          Add {formatPrice(amountUntilRakhiDiscount, currencyCode)} more, then enter{' '}
                          <strong className="font-semibold tracking-wide">
                            {RAKSHA_BANDHAN_CAMPAIGN.code}
                          </strong>{' '}
                          at checkout for {RAKSHA_BANDHAN_CAMPAIGN.discountPercent}% off.
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Ends {RAKSHA_BANDHAN_CAMPAIGN.displayEndDate}. Cannot be combined with other discounts.
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal, currencyCode)}</span>
                  </div>
                  <div className="rounded-sm border border-border/60 bg-background/80 px-3 py-2.5 text-center text-xs leading-relaxed text-muted-foreground">
                    <p>{SHIPPING_PROMISE}</p>
                    <p className="mt-1">Discounts are applied before shipping eligibility. U.S. delivery only; taxes and final delivery options are calculated at checkout.</p>
                  </div>
                  {unavailableItems.length > 0 && (
                    <p className="text-xs text-destructive text-center" role="alert">
                      One or more items is no longer available. Remove it from your bag to continue.
                    </p>
                  )}
                  <Button
                    variant="luxury"
                    size="lg"
                    className="w-full"
                    onClick={handleCheckoutClick}
                    disabled={isLoading || unavailableItems.length > 0}
                    data-testid="button-checkout"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Checkout...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Proceed to Secure Checkout
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[11px] leading-relaxed text-muted-foreground">Payment is completed securely on LuxeMia’s checkout page.</p>
                  <button
                    onClick={onClose}
                    className="w-full text-sm text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary underline underline-offset-4"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 divide-x divide-border/50 border-t border-border/50">
                  <span className="flex flex-col items-center gap-1 px-2 py-3 text-center text-[10px] leading-tight text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
                    Secure checkout
                  </span>
                  <span className="flex flex-col items-center gap-1 px-2 py-3 text-center text-[10px] leading-tight text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
                    U.S.-based support
                  </span>
                  <span className="flex flex-col items-center gap-1 px-2 py-3 text-center text-[10px] leading-tight text-muted-foreground">
                    <Award className="h-3.5 w-3.5 text-foreground" />
                    Tracked shipping
                  </span>
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
