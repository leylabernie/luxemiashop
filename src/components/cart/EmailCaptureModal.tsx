import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { z } from 'zod';

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

const RATE_LIMIT_KEY = 'cart_email_submit_timestamps';
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 3;

const checkRateLimit = (): boolean => {
  const now = Date.now();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const timestamps: number[] = stored ? JSON.parse(stored) : [];
  const recentAttempts = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  return recentAttempts.length < MAX_ATTEMPTS;
};

const recordAttempt = () => {
  const now = Date.now();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const timestamps: number[] = stored ? JSON.parse(stored) : [];
  const recentAttempts = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  recentAttempts.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentAttempts));
};

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

    if (!checkRateLimit()) {
      toast.error('Too many attempts. Please try again in a minute.');
      return;
    }

    recordAttempt();

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

      toast.success('Email saved! We\'ll remind you about your cart.');
      onEmailSubmitted(email);
      onClose();
    } catch (error) {
      console.error('Failed to save cart:', error);
      // Still proceed with checkout even if saving fails
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto bg-background p-8 z-[60] shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-card rounded-full transition-colors"
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
                className="w-full text-sm text-foreground/60 hover:text-foreground font-medium underline underline-offset-4 transition-colors"
              >
                Skip, go to checkout
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailCaptureModal;
