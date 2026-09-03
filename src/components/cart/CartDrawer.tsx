import { motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { X, Minus, Plus, Trash2, Loader2, ArrowRight, ShieldCheck, Award, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { getOptimizedImage } from '@/lib/imageUtils';
import { isHiddenBillingProductHandle } from '@/lib/serviceAddOns';
import { SHIPPING_POLICY_SUMMARY, US_FREE_SHIPPING_THRESHOLD } from '@/config/shippingPolicy';
import { formatCurrencyAmount } from '@/lib/formatCurrency';
import { isVariantExplicitlyOrderable } from '@/lib/orderability';

const FREE_SHIPPING_THRESHOLD = US_FREE_SHIPPING_THRESHOLD;
const SHIPPING_PROMISE = SHIPPING_POLICY_SUMMARY;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type CartModalKeyboardEvent = Pick<
  KeyboardEvent,
  'key' | 'shiftKey' | 'preventDefault' | 'stopPropagation'
>;

const CART_MODAL_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const getCartModalFocusableElements = (drawer: HTMLElement): HTMLElement[] => (
  Array.from(drawer.querySelectorAll<HTMLElement>(CART_MODAL_FOCUSABLE_SELECTOR))
    .filter((element) => (
      element.getAttribute('aria-hidden') !== 'true' && !element.hasAttribute('hidden')
    ))
);

const handleCartModalKeyDown = (
  event: CartModalKeyboardEvent,
  drawer: HTMLElement,
  close: () => void,
  activeElement: Element | null = document.activeElement,
) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusableElements = getCartModalFocusableElements(drawer);
  if (focusableElements.length === 0) {
    event.preventDefault();
    drawer.focus({ preventScroll: true });
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!drawer.contains(activeElement)) {
    event.preventDefault();
    (event.shiftKey ? lastElement : firstElement).focus();
  } else if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

interface IsolatedElementState {
  element: Element;
  hadInert: boolean;
  ariaHidden: string | null;
}

const isolateCartModalEnvironment = (
  drawer: HTMLElement,
  backdrop: HTMLElement | null,
  body: HTMLElement = document.body,
): (() => void) => {
  const previousOverflow = body.style.getPropertyValue('overflow');
  const previousOverflowPriority = body.style.getPropertyPriority('overflow');
  const isolatedElements: IsolatedElementState[] = [];

  body.style.setProperty('overflow', 'hidden');

  // The drawer is rendered inside the application tree instead of a portal.
  // Walk to <body> and isolate each sibling branch that does not contain the
  // drawer. Keep the visual backdrop interactive for pointer dismissal.
  let modalBranch: Element = drawer;
  while (modalBranch.parentElement) {
    const parent = modalBranch.parentElement;
    for (const sibling of Array.from(parent.children)) {
      if (sibling === modalBranch || sibling === backdrop || sibling.contains(backdrop)) continue;

      isolatedElements.push({
        element: sibling,
        hadInert: sibling.hasAttribute('inert'),
        ariaHidden: sibling.getAttribute('aria-hidden'),
      });
      sibling.setAttribute('inert', '');
      sibling.setAttribute('aria-hidden', 'true');
    }

    if (parent === body) break;
    modalBranch = parent;
  }

  let restored = false;
  return () => {
    if (restored) return;
    restored = true;

    for (const { element, hadInert, ariaHidden } of isolatedElements.reverse()) {
      if (!hadInert) element.removeAttribute('inert');
      if (ariaHidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', ariaHidden);
    }

    if (previousOverflow) {
      body.style.setProperty('overflow', previousOverflow, previousOverflowPriority);
    } else {
      body.style.removeProperty('overflow');
    }
  };
};

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const drawerRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
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

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    // This control exists for empty, loading, and populated bags, making it a
    // stable initial target without unexpectedly activating a cart action.
    (closeButtonRef.current ?? drawer).focus({ preventScroll: true });
    const restoreModalEnvironment = isolateCartModalEnvironment(
      drawer,
      backdropRef.current,
    );

    const onKeyDown = (event: KeyboardEvent) => {
      handleCartModalKeyDown(event, drawer, () => onCloseRef.current());
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreModalEnvironment();
      const previouslyFocused = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const cartCurrencies = new Set(
    items.map((item) => item.price.currencyCode.trim().toUpperCase()).filter(Boolean),
  );
  const hasSingleCurrency = cartCurrencies.size === 1;
  const currencyCode = hasSingleCurrency ? [...cartCurrencies][0] : null;
  const isUsdCart = currencyCode === 'USD';
  // Persisted carts can outlive Shopify inventory changes. Missing or negative
  // availability is not permission to submit a stale line to Shopify.
  const unavailableItems = items.filter((item) =>
    !isVariantExplicitlyOrderable(item.product.node, item.variantId),
  );

  const handleCheckoutClick = () => {
    // Preserve checkout intent: the bag moves directly to Shopify checkout
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

  // No exit-presence delay: when isOpen becomes false, the modal DOM is
  // removed in the same commit that the layout-effect cleanup releases its
  // focus trap and background isolation, then restores focus to the opener.
  if (!isOpen) return null;

  return (
    <>
          {/* Backdrop */}
          <motion.div
            ref={backdropRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-foreground/30 z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l border-border/60 bg-background shadow-2xl sm:w-[440px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/70 bg-card/30 px-5 py-5 sm:px-6">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Your selection</p>
                <h2 id="cart-title" className="mt-1 font-serif text-2xl leading-none">Your Bag <span className="text-base text-muted-foreground">({items.length})</span></h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
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
                            {formatCurrencyAmount(item.price.amount, item.price.currencyCode)}
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
                {isUsdCart ? (
                  <div className="px-5 pb-3 pt-4 sm:px-6">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium mb-2">
                      <Truck className="w-3.5 h-3.5" />
                      Your current subtotal qualifies for free U.S. standard shipping
                    </div>
                  ) : (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {formatCurrencyAmount(FREE_SHIPPING_THRESHOLD - subtotal, 'USD')} away from free U.S. standard shipping
                        </span>
                        <span className="font-medium">{formatCurrencyAmount(FREE_SHIPPING_THRESHOLD, 'USD')}</span>
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
                ) : (
                  <div className="px-5 pb-3 pt-4 text-xs leading-relaxed text-muted-foreground sm:px-6">
                    Destination, shipping rate, and any checkout currency conversion are confirmed at checkout.{' '}
                    <Link to="/shipping" onClick={onClose} className="font-medium text-foreground underline underline-offset-4">
                      View shipping rates
                    </Link>
                  </div>
                )}

                <div className="space-y-3 px-5 pb-4 sm:px-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Subtotal</span>
                    <span className="font-medium">
                      {currencyCode
                        ? formatCurrencyAmount(subtotal, currencyCode)
                        : 'Confirmed at checkout'}
                    </span>
                  </div>
                  <div className="rounded-sm border border-border/60 bg-background/80 px-3 py-2.5 text-center text-xs leading-relaxed text-muted-foreground">
                    <p>{SHIPPING_PROMISE}</p>
                    <p className="mt-1">Discounts are applied before shipping eligibility. Destination, local-currency conversion, duties and final delivery options are confirmed at checkout.</p>
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
                        Proceed to Shopify Checkout
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[11px] leading-relaxed text-muted-foreground">Payment is completed on Shopify checkout.</p>
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
                    Shopify checkout
                  </span>
                  <span className="flex flex-col items-center gap-1 px-2 py-3 text-center text-[10px] leading-tight text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
                    Contact support
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
  );
};

export default CartDrawer;
