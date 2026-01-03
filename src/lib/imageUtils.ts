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
    card: 650,       // Product cards - use 650 for faster loading
    gallery: 1200,   // Product gallery, detail pages
    hero: 1920,      // Hero banners, full-width images
  };
  
  const size = sizeMap[context];
  let optimizedUrl = url.replace('/images/650/', `/images/${size}/`);
  
  // Ensure URL has proper extension
  if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(optimizedUrl)) {
    // URLs often end with (1 and need ).jpg
    optimizedUrl = optimizedUrl + ').jpg';
  }
  
  return optimizedUrl;
};

/**
 * Get placeholder blur data URL
 */
export const getPlaceholderUrl = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY0Ii8+PC9zdmc+';
};
