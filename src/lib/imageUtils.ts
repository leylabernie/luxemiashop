// Image resolution utilities for the boutique

/**
 * Upgrades CDN image URL to higher resolution
 * The CDN supports various sizes: 650, 800, 1000, 1200, 1500, 1920
 */
export const getHighResImage = (url: string, size: 1200 | 1500 | 1920 = 1200): string => {
  if (!url) return url;
  return url.replace('/images/650/', `/images/${size}/`);
};

/**
 * Get optimized image URL based on usage context
 */
export const getOptimizedImage = (url: string, context: 'thumbnail' | 'card' | 'gallery' | 'hero' = 'card'): string => {
  if (!url) return url;
  
  const sizeMap = {
    thumbnail: 650,  // Small thumbnails, lists
    card: 1000,      // Product cards
    gallery: 1200,   // Product gallery, detail pages
    hero: 1920,      // Hero banners, full-width images
  };
  
  const size = sizeMap[context];
  return url.replace('/images/650/', `/images/${size}/`);
};
