import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';

interface ProductGalleryProps {
  images: Array<{
    node: {
      url: string;
      altText: string | null;
    };
  }>;
  productTitle: string;
}

export const ProductGallery = ({ images, productTitle }: ProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[selectedIndex]?.node : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
    setZoomPosition({ x: 50, y: 50 });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnail Strip */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pb-2 lg:pb-0 lg:pr-2">
        {hasImages ? (
          images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-24 lg:w-24 lg:h-28 rounded-sm overflow-hidden border-2 transition-all duration-300 ${
                selectedIndex === index 
                  ? 'border-primary shadow-md' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <img
                src={image.node.url}
                alt={image.node.altText || `${productTitle} - View ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-20 h-24 lg:w-24 lg:h-28 rounded-sm overflow-hidden border-2 ${
                selectedIndex === index 
                  ? 'border-primary' 
                  : 'border-border'
              }`}
            >
              <ProductPlaceholder aspectRatio="portrait" size="sm" />
            </div>
          ))
        )}
      </div>

      {/* Main Image with Zoom */}
      <div className="flex-1 relative">
        <div
          ref={imageRef}
          className={`relative aspect-[3/4] rounded-sm overflow-hidden bg-card cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
          onMouseMove={handleMouseMove}
          onClick={handleZoomToggle}
        >
          {currentImage ? (
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={currentImage.url}
              alt={currentImage.altText || productTitle}
              className="w-full h-full object-cover transition-transform duration-200"
              style={isZoomed ? {
                transform: 'scale(2)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              } : undefined}
            />
          ) : (
            <ProductPlaceholder aspectRatio="portrait" size="lg" />
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomToggle();
              }}
            >
              {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </Button>
          </div>

          {/* Image Counter */}
          {hasImages && (
            <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-sm text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Fullscreen Zoom Modal */}
        <AnimatePresence>
          {isZoomed && currentImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-8"
              onClick={() => setIsZoomed(false)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6"
                onClick={() => setIsZoomed(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              <img
                src={currentImage.url}
                alt={currentImage.altText || productTitle}
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
