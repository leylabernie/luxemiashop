import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Loader2, ExternalLink, ShieldCheck, RefreshCw, Award, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import EmailCaptureModal from './EmailCaptureModal';

const FREE_SHIPPING_THRESHOLD = 300;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, isLoading, updateQuantity, removeItem, createCheckout } = useCartStore();
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);
  
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const currencyCode = items[0]?.price.currencyCode || 'USD';

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleCheckoutClick = () => {
    // If we haven't captured email yet, show the modal
    if (!capturedEmail) {
      setShowEmailCapture(true);
    } else {
      proceedToCheckout();
    }
  };

  const handleEmailSubmitted = (email: string) => {
    setCapturedEmail(email);
    setShowEmailCapture(false);
    proceedToCheckout();
  };

  const handleEmailSkipped = () => {
    setShowEmailCapture(false);
    proceedToCheckout();
  };

  const proceedToCheckout = async () => {
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
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-background z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="font-serif text-xl">Your Bag ({items.length})</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-card rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-foreground/60 mb-2">Your cart is empty</p>
                  <p className="text-sm text-foreground/40">Add some beautiful pieces to get started.</p>
                </div>
              ) : (
                items.map((item, index) => {
                  const image = item.product.node.images?.edges?.[0]?.node;
                  
                  return (
                    <motion.div
                      key={`${item.variantId}-${JSON.stringify(item.customAttributes)}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-24 bg-card overflow-hidden flex-shrink-0">
                        {image ? (
                          <img
                            src={image.url}
                            alt={image.altText || item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ProductPlaceholder className="w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-sm mb-1 truncate">{item.product.node.title}</h3>
                        <p className="text-xs text-foreground/60 mb-1">
                          {item.selectedOptions.map(o => o.value).join(' / ') || item.variantTitle}
                        </p>
                        {item.customAttributes && item.customAttributes.length > 0 && (
                          <div className="mb-2 space-y-0.5">
                            {item.customAttributes.map((attr, i) => (
                              <p key={i} className="text-[10px] text-primary/80 italic leading-tight">
                                <span className="font-medium">{attr.key}:</span> {attr.value}
                              </p>
                            ))}
                          </div>
                        )}
                        <p className="text-sm font-medium">
                          {formatPrice(parseFloat(item.price.amount), item.price.currencyCode)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 border border-border/50 px-2 py-1">
                            <button 
                              className="p-1 hover:bg-card transition-colors" 
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1, item.customAttributes)}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                              className="p-1 hover:bg-card transition-colors" 
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1, item.customAttributes)}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            className="p-2 text-foreground/50 hover:text-destructive transition-colors" 
                            aria-label="Remove item"
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
              <div className="border-t border-border/50 bg-card/50">
                {/* Free Shipping Progress */}
                <div className="px-6 pt-4 pb-2">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium mb-2">
                      <Truck className="w-3.5 h-3.5" />
                      You've unlocked free worldwide shipping!
                    </div>
                  ) : (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal, currencyCode)} away from free shipping
                        </span>
                        <span className="font-medium">${FREE_SHIPPING_THRESHOLD}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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

                <div className="px-6 pb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/70">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal, currencyCode)}</span>
                  </div>
                  <p className="text-xs text-foreground/50 text-center">
                    Taxes calculated at checkout
                  </p>
                  <Button
                    variant="luxury"
                    size="lg"
                    className="w-full"
                    onClick={handleCheckoutClick}
                    disabled={isLoading}
                    data-testid="button-checkout"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Checkout...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </>
                    )}
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-full text-sm text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="border-t border-border/30 px-6 py-3 flex items-center justify-center gap-5">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure Checkout
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Easy Returns
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Award className="w-3.5 h-3.5" />
                    Authentic
                  </span>
                </div>
              </div>
            )}
          </motion.aside>

          {/* Email Capture Modal */}
          <EmailCaptureModal
            isOpen={showEmailCapture}
            onClose={() => {
              setShowEmailCapture(false);
              // Ensure we don't proceed to checkout when just closing
            }}
            onEmailSubmitted={handleEmailSubmitted}
            onSkip={handleEmailSkipped}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
