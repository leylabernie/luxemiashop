/**
 * Pre-checkout email capture.
 *
 * STATUS (audited 2026-11-25): **not mounted anywhere.** Nothing in `src/`
 * renders this component; the exit-intent/session-timer prompt shoppers actually
 * see is `src/components/home/NewVisitorPopup.tsx`. Mounting this modal is a
 * conversion decision for the owner, because it gates checkout behind an email
 * field — see the note below before wiring it into `CartDrawer` or the checkout
 * route.
 *
 * WHAT IT WRITES: `submit-email` with `type: 'cart'` → `public.abandoned_carts`
 * (email, cart_items, cart_total, currency, status). It does **not** write
 * `public.newsletter_subscribers`, so it never creates a marketing subscriber and
 * never reaches the FIRST10_LEAD sync in `api/sync-lead.ts` — which is correct:
 * `/privacy` publishes that marketing emails go out "only with your consent", and
 * a cart reminder is transactional. If this is ever mounted, its copy must keep
 * saying "save your cart", never "subscribe" or "get 10% off".
 *
 * Duplicates: `abandoned_carts` is append-only by design (each abandonment is an
 * event with its own cart snapshot and timestamp), so a repeat submit is a
 * success, not an error — unlike `newsletter_subscribers`, whose unique email
 * index makes `submit-email` answer `{ success: true, duplicate: true }`.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { z } from 'zod';
import { leadCaptureStorage, CART_RATE_LIMIT_KEY } from '@/lib/leadCaptureStorage';

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .email('Please enter a valid email address')
    .refine(
      (email) => !/<|>|script|javascript|on\w+=/i.test(email),
      'Invalid characters in email'
    ),
});

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmitted: (email: string) => void;
  onSkip?: () => void;
}

const EmailCaptureModal = ({ isOpen, onClose, onEmailSubmitted, onSkip }: EmailCaptureModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const { items } = useCartStore();

  const validateEmail = (value: string): boolean => {
    const result = emailSchema.safeParse({ email: value });
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    // Fails open when storage is blocked: a shopper must always be able to save
    // their cart. Previously an unguarded localStorage/JSON.parse read threw here,
    // before the try block, so the button silently did nothing at all.
    if (!leadCaptureStorage.checkRateLimit(CART_RATE_LIMIT_KEY)) {
      toast.error('Too many attempts. Please try again in a minute.');
      return;
    }

    leadCaptureStorage.recordAttempt(CART_RATE_LIMIT_KEY);

    setIsLoading(true);
    try {
      // Calculate cart total
      const cartTotal = items.reduce(
        (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
        0
      );

      // Serialize cart items for storage
      const cartItems = items.map(item => ({
        productId: item.product.node.id,
        productTitle: item.product.node.title,
        variantId: item.variantId,
        variantTitle: item.variantTitle,
        price: item.price.amount,
        currency: item.price.currencyCode,
        quantity: item.quantity,
        image: item.product.node.images?.edges?.[0]?.node?.url || null,
      }));

      // Use rate-limited edge function
      const { data, error } = await supabase.functions.invoke('submit-email', {
        body: {
          email: email.trim(),
          type: 'cart',
          cartItems,
          cartTotal,
          currency: 'USD',
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.retryAfter) {
          toast.error(`Too many attempts. Please try again in ${data.retryAfter} seconds.`);
          return;
        }
        throw new Error(data.error);
      }

      // Promise only what happened. Nothing in this repo sends a cart reminder
      // email yet (playbook §6.7), so the old "We'll remind you about your cart"
      // copy claimed a message no system sends.
      toast.success('Email saved. Continue to checkout whenever you\'re ready.');
      onEmailSubmitted(email);
      onClose();
    } catch (error) {
      console.error('Failed to save cart:', error);
      // Say the save failed instead of proceeding in silence, then let the
      // shopper continue: a lost reminder must never block a checkout.
      toast.error('We could not save your email', {
        description: 'You can still continue to checkout — your bag is unchanged.',
      });
      onEmailSubmitted(email);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-[env(safe-area-inset-bottom,0.5rem)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto bg-background p-6 sm:p-8 z-[60] shadow-2xl rounded-sm"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-card rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl mb-2">Almost There!</h3>
              <p className="text-sm text-foreground/60">
                Enter your email to proceed to checkout. We'll save your cart in case you need to come back.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  required
                  className={`text-center ${emailError ? 'border-destructive' : ''}`}
                  maxLength={255}
                />
                {emailError && (
                  <p className="text-destructive text-xs mt-1 text-center">{emailError}</p>
                )}
              </div>
              <Button
                type="submit"
                variant="luxury"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue to Checkout'
                )}
              </Button>
              <button
                type="button"
                onClick={onSkip || onClose}
                className="w-full text-sm text-foreground/70 hover:text-foreground font-medium py-2 transition-colors"
              >
                Skip, continue to checkout as guest
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailCaptureModal;
