import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewVisitorPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('vasantam_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('vasantam_popup_seen', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-background z-50 shadow-2xl"
          >
            <div className="grid md:grid-cols-2">
              <div className="hidden md:block aspect-square overflow-hidden bg-card border-2 border-dashed border-border/50 flex flex-col items-center justify-center">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-foreground/20 mb-2" />
                  <span className="text-xs text-foreground/30 tracking-wide uppercase">Promo Image</span>
                </div>
              </div>
              <div className="p-8 lg:p-10 relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-card rounded-full transition-colors"
                  aria-label="Close popup"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="text-center md:text-left">
                  <p className="text-xs tracking-luxury uppercase text-foreground/60 mb-2">Welcome Gift</p>
                  <h3 className="font-serif text-2xl lg:text-3xl mb-3">Enjoy 15% Off</h3>
                  <p className="text-sm text-foreground/60 font-light mb-6">
                    Sign up for exclusive access to new arrivals, special offers, and styling tips.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="w-full bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/40 font-light"
                    />
                    <Button variant="luxury" size="lg" className="w-full">Get My Discount</Button>
                  </form>
                  <p className="text-[10px] text-foreground/40 mt-4">
                    By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewVisitorPopup;
