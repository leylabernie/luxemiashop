import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import cartProduct1 from '@/assets/cart-product-1.jpg';
import cartProduct2 from '@/assets/cart-product-2.jpg';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const cartItems = [
  {
    id: 1,
    name: 'Chanderi Silk Saree',
    variant: 'Blush Pink / Free Size',
    price: 12500,
    quantity: 1,
    image: cartProduct1,
  },
  {
    id: 2,
    name: 'Embroidered Lehenga Set',
    variant: 'Ivory Gold / Medium',
    price: 28000,
    quantity: 1,
    image: cartProduct2,
  },
];

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
              <h2 className="font-serif text-xl">Your Bag ({cartItems.length})</h2>
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
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-20 h-24 bg-card overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm mb-1 truncate">{item.name}</h3>
                    <p className="text-xs text-foreground/60 mb-2">{item.variant}</p>
                    <p className="text-sm font-medium">₹{item.price.toLocaleString()}</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 border border-border/50 px-2 py-1">
                        <button className="p-1 hover:bg-card transition-colors" aria-label="Decrease quantity">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button className="p-1 hover:bg-card transition-colors" aria-label="Increase quantity">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button className="p-2 text-foreground/50 hover:text-destructive transition-colors" aria-label="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 p-6 space-y-4 bg-card/50">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-foreground/50 text-center">
                Shipping & taxes calculated at checkout
              </p>
              <Button variant="luxury" size="lg" className="w-full">
                Proceed to Checkout
              </Button>
              <button
                onClick={onClose}
                className="w-full text-sm text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4"
              >
                Continue Shopping
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
