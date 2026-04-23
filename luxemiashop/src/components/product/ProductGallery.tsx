import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ZoomIn, X, ChevronLeft, ChevronRight, Maximize2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { getOptimizedImage } from '@/lib/imageUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductGalleryProps {
  images: Array<{
    node: {
      url: string;
      altText: string | null;
    };
  }>;
  productTitle: string;
}

// Hook to validate images and filter out broken ones
const useValidatedImages = (images: ProductGalleryProps['images']) => {
  const [validatedImages, setValidatedImages] = useState<ProductGalleryProps['images']>([]);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!images || images.length === 0) {
      setValidatedImages([]);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    const validated: ProductGalleryProps['images'] = [];
    let loadedCount = 0;

    images.forEach((image, index) => {
      const img = new Image();
      const optimizedUrl = getOptimizedImage(image.node.url, 'thumbnail');
      
      img.onload = () => {
        validated[index] = image;
        loadedCount++;
        if (loadedCount === images.length) {
          // Filter out undefined entries (failed images)
          setValidatedImages(validated.filter(Boolean));
          setIsValidating(false);
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setValidatedImages(validated.filter(Boolean));
          setIsValidating(false);
        }
      };
      
      img.src = optimizedUrl;
    });

    // Timeout fallback - don't wait forever
    const timeout = setTimeout(() => {
      if (isValidating) {
        setValidatedImages(validated.filter(Boolean));
        setIsValidating(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [images]);

  return { validatedImages, isValidating };
};

export const ProductGallery = ({ images, productTitle }: ProductGalleryProps) => {
  const { validatedImages, isValidating } = useValidatedImages(images);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const MAGNIFIER_SIZE = 200;
  const ZOOM_LEVEL = 2.5; // 2.5x magnification
  const MAX_LIGHTBOX_ZOOM = 4;

  // Use validated images - only show ones that actually loaded
  const displayImages = validatedImages.length > 0 ? validatedImages : images;
  const hasImages = displayImages && displayImages.length > 0;
  const currentImage = hasImages ? displayImages[selectedIndex]?.node : null;
  
  // Reset selected index if it's out of bounds after validation
  useEffect(() => {
    if (selectedIndex >= displayImages.length && displayImages.length > 0) {
      setSelectedIndex(0);
    }
  }, [displayImages.length, selectedIndex]);
  const highResUrl = currentImage ? getOptimizedImage(currentImage.url, 'hero') : ''; // 1920px for crisp zoom

  // Swipe gesture support
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-100, 0, 100], [0.5, 1, 0.5]);

  // Preload high-res image immediately when component mounts for better zoom quality
  useEffect(() => {
    if (highResUrl && !highResLoaded) {
      const img = new Image();
      img.src = highResUrl;
      img.onload = () => setHighResLoaded(true);
    }
  }, [highResUrl, highResLoaded]);

  // Reset high-res loaded state when image changes
  useEffect(() => {
    setHighResLoaded(false);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  }, [selectedIndex]);

  // Preload adjacent images
  useEffect(() => {
    if (hasImages && displayImages.length > 1) {
      const preloadIndexes = [
        (selectedIndex - 1 + displayImages.length) % displayImages.length,
        (selectedIndex + 1) % displayImages.length,
      ];
      preloadIndexes.forEach((index) => {
        const img = new Image();
        img.src = getOptimizedImage(displayImages[index].node.url, 'gallery');
      });
    }
  }, [selectedIndex, displayImages, hasImages]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || isMobile) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Store container size for zoom calculation
    setContainerSize({ width: rect.width, height: rect.height });
    
    // Calculate background position in pixels for proper magnification
    // The magnifier shows a zoomed portion centered on cursor
    const zoomedWidth = rect.width * ZOOM_LEVEL;
    const zoomedHeight = rect.height * ZOOM_LEVEL;
    
    // Position: cursor position * zoom level - half magnifier size (to center)
    const bgX = (x / rect.width) * zoomedWidth - MAGNIFIER_SIZE / 2;
    const bgY = (y / rect.height) * zoomedHeight - MAGNIFIER_SIZE / 2;
    
    setCursorPosition({ x, y });
    setMagnifierPosition({ x: bgX, y: bgY });
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowMagnifier(true);
    }
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleImageClick = () => {
    setIsLightboxOpen(true);
  };

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  }, [displayImages.length]);

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  }, [displayImages.length]);

  // Handle swipe gestures
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      handleNextImage();
    } else if (info.offset.x > threshold) {
      handlePrevImage();
    }
  };

  // Lightbox zoom controls
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxZoom((prev) => Math.min(prev + 0.5, MAX_LIGHTBOX_ZOOM));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setLightboxPan({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleLightboxPan = (_: any, info: PanInfo) => {
    if (lightboxZoom > 1) {
      setLightboxPan((prev) => ({
        x: prev.x + info.delta.x,
        y: prev.y + info.delta.y,
      }));
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === '+' || e.key === '=') setLightboxZoom((prev) => Math.min(prev + 0.5, MAX_LIGHTBOX_ZOOM));
      if (e.key === '-') {
        setLightboxZoom((prev) => {
          const newZoom = Math.max(prev - 0.5, 1);
          if (newZoom === 1) setLightboxPan({ x: 0, y: 0 });
          return newZoom;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrevImage, handleNextImage]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Only show thumbnails if we have multiple validated images
  const showThumbnails = hasImages && displayImages.length > 1;

  // Show loading skeleton while validating
  if (isValidating && images.length > 0) {
    return (
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="aspect-[3/4] rounded-sm overflow-hidden bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col-reverse lg:flex-row gap-4 ${!showThumbnails ? 'lg:block' : ''}`}>
      {/* Thumbnail Strip - only show if multiple validated images */}
      {showThumbnails && (
        <div className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pb-2 lg:pb-0 lg:pr-2 scrollbar-hide">
          {displayImages.map((image, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedIndex(index);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 lg:w-24 lg:h-28 rounded-sm overflow-hidden border-2 transition-all duration-300 ${
                selectedIndex === index
                  ? 'border-primary shadow-md ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <img
                src={getOptimizedImage(image.node.url, 'thumbnail')}
                alt={image.node.altText || `${productTitle} - View ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Main Image with Magnifier Lens */}
      <div className="flex-1 relative">
        <motion.div
          ref={imageRef}
          className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card cursor-crosshair touch-pan-y"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleImageClick}
          style={{ opacity: isMobile ? 1 : dragOpacity }}
        >
          {currentImage ? (
            <motion.div
              className="w-full h-full"
              drag={isMobile && hasImages && displayImages.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ x: dragX }}
            >
              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={getOptimizedImage(currentImage.url, 'gallery')}
                alt={currentImage.altText || productTitle}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </motion.div>
          ) : (
            <ProductPlaceholder aspectRatio="portrait" size="lg" />
          )}

          {/* Magnifier Lens - Desktop only, uses high-res image for crisp zoom */}
          {showMagnifier && currentImage && !isMobile && highResLoaded && containerSize.width > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute pointer-events-none rounded-full border-4 border-white shadow-2xl overflow-hidden"
              style={{
                width: MAGNIFIER_SIZE,
                height: MAGNIFIER_SIZE,
                left: cursorPosition.x - MAGNIFIER_SIZE / 2,
                top: cursorPosition.y - MAGNIFIER_SIZE / 2,
                backgroundImage: `url(${highResUrl})`,
                // Position in pixels - negative to show the correct zoomed area
                backgroundPosition: `-${magnifierPosition.x}px -${magnifierPosition.y}px`,
                // Background size = container * zoom level
                backgroundSize: `${containerSize.width * ZOOM_LEVEL}px ${containerSize.height * ZOOM_LEVEL}px`,
                backgroundRepeat: 'no-repeat',
                zIndex: 10,
              }}
            />
          )}
          
          {/* Loading indicator while high-res loads */}
          {showMagnifier && currentImage && !isMobile && !highResLoaded && (
            <div 
              className="absolute pointer-events-none rounded-full border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center bg-background/80"
              style={{
                width: MAGNIFIER_SIZE,
                height: MAGNIFIER_SIZE,
                left: cursorPosition.x - MAGNIFIER_SIZE / 2,
                top: cursorPosition.y - MAGNIFIER_SIZE / 2,
                zIndex: 10,
              }}
            >
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Controls */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/80 backdrop-blur-sm hover:bg-background h-9 w-9 sm:h-10 sm:w-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Swipe Indicators */}
          {isMobile && hasImages && displayImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedIndex === index
                      ? 'bg-primary w-4'
                      : 'bg-primary/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-background/80 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm text-xs sm:text-sm flex items-center gap-2">
            <ZoomIn className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Hover to zoom • Click to expand</span>
            <span className="sm:hidden">Tap to expand</span>
          </div>

          {/* Image Counter - Desktop */}
          {!isMobile && hasImages && displayImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-sm text-sm">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </motion.div>

        {/* Desktop Navigation Arrows */}
        {!isMobile && hasImages && displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Fullscreen Lightbox Gallery */}
        <AnimatePresence>
          {isLightboxOpen && currentImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
              onClick={() => {
                if (lightboxZoom === 1) setIsLightboxOpen(false);
              }}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-white hover:bg-white/10"
                onClick={() => setIsLightboxOpen(false)}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              {/* Zoom Controls */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:top-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10"
                  onClick={handleZoomOut}
                  disabled={lightboxZoom <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-white text-sm min-w-[3rem] text-center">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10"
                  onClick={handleZoomIn}
                  disabled={lightboxZoom >= MAX_LIGHTBOX_ZOOM}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                  </Button>
                </>
              )}

              {/* Main Lightbox Image with Pan & Zoom */}
              <motion.div
                className="relative max-w-[90vw] max-h-[75vh] sm:max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={selectedIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    scale: lightboxZoom,
                    x: lightboxPan.x,
                    y: lightboxPan.y,
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    scale: { type: "spring", stiffness: 300, damping: 30 },
                  }}
                  drag={lightboxZoom > 1}
                  dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
                  onPan={handleLightboxPan}
                  src={highResLoaded ? highResUrl : getOptimizedImage(currentImage.url, 'hero')}
                  alt={currentImage.altText || productTitle}
                  className={`max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain ${
                    lightboxZoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                  }`}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (lightboxZoom === 1) {
                      setLightboxZoom(2);
                    } else {
                      setLightboxZoom(1);
                      setLightboxPan({ x: 0, y: 0 });
                    }
                  }}
                  draggable={false}
                />
                {/* Loading indicator */}
                {!highResLoaded && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-white text-xs">Loading HD...</span>
                  </div>
                )}
              </motion.div>

              {/* Thumbnail Strip in Lightbox */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg max-w-[90vw] overflow-x-auto scrollbar-hide">
                  {displayImages.map((image, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedIndex(index);
                      }}
                      className={`flex-shrink-0 w-10 h-12 sm:w-12 sm:h-14 rounded overflow-hidden border-2 transition-all duration-200 ${
                        selectedIndex === index
                          ? 'border-white shadow-lg scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getOptimizedImage(image.node.url, 'thumbnail')}
                        alt={image.node.altText || `${productTitle} - View ${index + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Keyboard Hints */}
              <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs hidden sm:flex items-center gap-4">
                <span>←→ Navigate</span>
                <span>+/- Zoom</span>
                <span>ESC Close</span>
                <span>Double-click to zoom</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
