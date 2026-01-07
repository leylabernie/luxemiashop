import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const NewVisitorPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('vasantam_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('vasantam_popup_seen', 'true');
  };

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'LUXE15-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const discountCode = generateDiscountCode();
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          source: 'welcome_popup',
          discount_code: discountCode,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('You\'re already subscribed! Check your email for your discount code.');
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast.success('Welcome to LuxeMia! Your discount code is ready.');
        
        // Copy discount code to clipboard
        navigator.clipboard.writeText(discountCode).catch(() => {});
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md bg-background z-50 shadow-2xl rounded-lg overflow-hidden"
          >
            <div className="relative">
              {/* Decorative header */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent h-2" />
              
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 pt-6">
                {!isSuccess ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                      <Gift className="w-7 h-7 text-primary" />
                    </div>
                    
                    <p className="text-xs tracking-[0.2em] uppercase text-foreground/60 mb-2 font-medium">
                      Welcome to LuxeMia
                    </p>
                    
                    <h3 className="font-serif text-3xl mb-2">
                      Get <span className="text-primary">15% Off</span>
                    </h3>
                    
                    <p className="text-sm text-foreground/60 font-light mb-6 leading-relaxed">
                      Join our community for exclusive access to new arrivals, styling tips, and special offers.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={isSubmitting}
                        className="w-full bg-transparent border border-border px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/40 font-light rounded-md disabled:opacity-50"
                      />
                      <Button 
                        type="submit"
                        variant="luxury" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Sparkles className="w-4 h-4" />
                            </motion.span>
                            Subscribing...
                          </span>
                        ) : (
                          'Unlock My 15% Off'
                        )}
                      </Button>
                    </form>
                    
                    <p className="text-[11px] text-foreground/40 mt-4 leading-relaxed">
                      By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                    </p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                      <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    
                    <h3 className="font-serif text-2xl mb-2">Welcome to the Family!</h3>
                    
                    <p className="text-sm text-foreground/60 mb-4">
                      Your exclusive discount code:
                    </p>
                    
                    <div className="bg-muted px-6 py-3 rounded-md inline-block mb-4">
                      <span className="font-mono text-lg font-semibold tracking-wider text-primary">
                        LUXE15-XXXXXX
                      </span>
                    </div>
                    
                    <p className="text-xs text-foreground/50 mb-6">
                      Code copied to clipboard! Use at checkout.
                    </p>
                    
                    <Button 
                      onClick={handleClose} 
                      variant="outline" 
                      className="w-full"
                    >
                      Start Shopping
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewVisitorPopup;
