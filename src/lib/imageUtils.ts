// Image resolution utilities for the boutique

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Check if URL is an external image that needs proxying
 */
const isExternalImage = (url: string): boolean => {
  if (!url) return false;
  // Proxy images from these domains that have hotlink protection
  return url.includes('kesimg.b-cdn.net') || url.includes('fashidwholesale.in');
};

/**
 * Get proxied URL for external images
 */
export const getProxiedImageUrl = (url: string): string => {
  if (!url) return url;
  if (!isExternalImage(url)) return url;
  
  return `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(url)}`;
};

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
/**
 * Fix malformed image URLs from the database
 * Handles patterns like:
 * - "(1" -> "(1).jpg" (missing extension)
 * - "(1(2).jpg" -> "(2).jpg" (malformed multi-image URL)
 */
const fixMalformedUrl = (url: string): string => {
  if (!url) return url;
  
  // Strip query string for extension checks, preserve it for the final URL
  const [basePath, queryString] = url.split('?');
  
  // Fix malformed multi-image URLs like "(1(2).jpg" -> "(2).jpg"
  const malformedPattern = /\(1\((\d+)\)\.jpg$/i;
  if (malformedPattern.test(basePath)) {
    const fixed = basePath.replace(malformedPattern, '($1).jpg');
    return queryString ? `${fixed}?${queryString}` : fixed;
  }
  
  // Ensure URL has proper extension (check base path without query string)
  if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(basePath)) {
    // URLs often end with (1 and need ).jpg
    if (/\(\d+$/.test(basePath)) {
      const fixed = basePath + ').jpg';
      return queryString ? `${fixed}?${queryString}` : fixed;
    } else {
      const fixed = basePath + '.jpg';
      return queryString ? `${fixed}?${queryString}` : fixed;
    }
  }
  
  return url;
};

export const getOptimizedImage = (url: string, context: 'thumbnail' | 'card' | 'gallery' | 'hero' = 'card'): string => {
  if (!url) return url;
  
  // First fix any malformed URLs
  let optimizedUrl = fixMalformedUrl(url);
  
  const sizeMap = {
    thumbnail: 650,  // Small thumbnails, lists
    card: 650,       // Product cards - use 650 for faster loading
    gallery: 1200,   // Product gallery, detail pages
    hero: 1920,      // Hero banners, full-width images
  };
  
  const size = sizeMap[context];
  optimizedUrl = optimizedUrl.replace('/images/650/', `/images/${size}/`);
  
  // For external images, proxy them to bypass hotlink protection
  if (isExternalImage(optimizedUrl)) {
    return getProxiedImageUrl(optimizedUrl);
  }
  
  return optimizedUrl;
};

/**
 * Get placeholder blur data URL
 */
export const getPlaceholderUrl = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY0Ii8+PC9zdmc+';
};
