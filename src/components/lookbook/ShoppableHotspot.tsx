import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ShoppableHotspotProps {
  x: number; // percentage from left
  y: number; // percentage from top
  productName: string;
  productPrice: string;
  productHandle: string;
  productImage?: string;
}

const ShoppableHotspot = ({
  x,
  y,
  productName,
  productPrice,
  productHandle,
  productImage
}: ShoppableHotspotProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Determine if popup should flip to stay in view
  const flipX = x > 70;
  const flipY = y > 70;

  return (
    <div
      className="absolute z-10"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Pulsing Hotspot Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative -translate-x-1/2 -translate-y-1/2 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer pulse ring */}
        <span className="absolute inset-0 w-10 h-10 -m-2 rounded-full bg-background/30 animate-ping" />
        
        {/* Inner button */}
        <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-lg transition-all duration-300 group-hover:bg-background">
          <Plus className={`w-3 h-3 text-foreground transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
        </span>
      </motion.button>

      {/* Product Popup Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-20 w-56 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl rounded-sm overflow-hidden
              ${flipX ? 'right-4' : 'left-4'}
              ${flipY ? 'bottom-4' : 'top-4'}
            `}
          >
            {/* Product Image */}
            <div className="aspect-[4/3] bg-card overflow-hidden">
              {productImage ? (
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground/30">
                  <ShoppingBag className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h4 className="font-serif text-sm mb-1 line-clamp-1">{productName}</h4>
              <p className="text-xs text-foreground/60 mb-3">{productPrice}</p>
              
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link to={`/product/${productHandle}`}>
                  View Product
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShoppableHotspot;
