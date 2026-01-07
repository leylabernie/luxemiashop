import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmitted: (email: string) => void;
}

const EmailCaptureModal = ({ isOpen, onClose, onEmailSubmitted }: EmailCaptureModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { items } = useCartStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

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

      // Save abandoned cart to database
      const { error } = await supabase.from('abandoned_carts').insert({
        email: email.trim(),
        cart_items: cartItems,
        cart_total: cartTotal,
        currency: 'USD',
        status: 'pending',
      });

      if (error) throw error;

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background p-8 z-[60] shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-card rounded-full transition-colors"
              aria-label="Close"
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
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center"
              />
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
                onClick={onClose}
                className="w-full text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailCaptureModal;
