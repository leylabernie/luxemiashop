import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { getOptimizedImage } from '@/lib/imageUtils';

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [highResLoaded, setHighResLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const MAGNIFIER_SIZE = 180;
  const ZOOM_LEVEL = 3;

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[selectedIndex]?.node : null;
  const highResUrl = currentImage ? getOptimizedImage(currentImage.url, 'hero') : '';

  // Preload high-res image when hovering
  useEffect(() => {
    if (showMagnifier && highResUrl && !highResLoaded) {
      const img = new Image();
      img.src = highResUrl;
      img.onload = () => setHighResLoaded(true);
    }
  }, [showMagnifier, highResUrl, highResLoaded]);

  // Reset high-res loaded state when image changes
  useEffect(() => {
    setHighResLoaded(false);
  }, [selectedIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentage position for background
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    setCursorPosition({ x, y });
    setMagnifierPosition({ x: percentX, y: percentY });
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleImageClick = () => {
    setIsLightboxOpen(true);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  const showThumbnails = hasImages && images.length > 1;

  return (
    <div className={`flex flex-col-reverse lg:flex-row gap-4 ${!showThumbnails ? 'lg:block' : ''}`}>
      {/* Thumbnail Strip - only show if multiple images */}
      {showThumbnails && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pb-2 lg:pb-0 lg:pr-2">
          {images.map((image, index) => (
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
                src={getOptimizedImage(image.node.url, 'thumbnail')}
                alt={image.node.altText || `${productTitle} - View ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image with Magnifier Lens */}
      <div className="flex-1 relative">
        <div
          ref={imageRef}
          className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleImageClick}
        >
          {currentImage ? (
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={getOptimizedImage(currentImage.url, 'gallery')}
              alt={currentImage.altText || productTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <ProductPlaceholder aspectRatio="portrait" size="lg" />
          )}

          {/* Magnifier Lens */}
          {showMagnifier && currentImage && (
            <div
              className="absolute pointer-events-none rounded-full border-4 border-white shadow-2xl overflow-hidden"
              style={{
                width: MAGNIFIER_SIZE,
                height: MAGNIFIER_SIZE,
                left: cursorPosition.x - MAGNIFIER_SIZE / 2,
                top: cursorPosition.y - MAGNIFIER_SIZE / 2,
                backgroundImage: `url(${highResLoaded ? highResUrl : getOptimizedImage(currentImage.url, 'gallery')})`,
                backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                backgroundSize: `${ZOOM_LEVEL * 100}%`,
                backgroundRepeat: 'no-repeat',
                zIndex: 10,
              }}
            >
              {/* Loading indicator inside magnifier */}
              {!highResLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-sm text-sm flex items-center gap-2">
            <ZoomIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hover to zoom • Click to expand</span>
            <span className="sm:hidden">Tap to expand</span>
          </div>

          {/* Image Counter */}
          {hasImages && images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-sm text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Fullscreen Lightbox Gallery */}
        <AnimatePresence>
          {isLightboxOpen && currentImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
              onClick={() => setIsLightboxOpen(false)}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
                onClick={() => setIsLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-12 w-12"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-12 w-12"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Main Lightbox Image */}
              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                src={getOptimizedImage(currentImage.url, 'hero')}
                alt={currentImage.altText || productTitle}
                className="max-w-[90vw] max-h-[85vh] object-contain cursor-zoom-in"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Thumbnail Strip in Lightbox */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(index);
                      }}
                      className={`w-12 h-14 rounded overflow-hidden border-2 transition-all duration-200 ${
                        selectedIndex === index 
                          ? 'border-white shadow-lg scale-110' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getOptimizedImage(image.node.url, 'thumbnail')}
                        alt={image.node.altText || `${productTitle} - View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image Counter in Lightbox */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
