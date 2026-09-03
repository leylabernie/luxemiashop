const TAILORING_CATEGORIES: Record<string, string> = {
  'fully stitched': 'fully_stitched',
  'made to measure': 'made_to_measure',
  'made to measure (udesign)': 'made_to_measure',
  'made-to-measure': 'made_to_measure',
  none: 'none',
  'no stitching': 'none',
  'ready to wear': 'ready_to_wear',
  'ready-to-wear': 'ready_to_wear',
  'semi stitched': 'semi_stitched',
  'semi-stitched': 'semi_stitched',
  standard: 'standard',
  stitched: 'stitched',
  unstitched: 'unstitched',
};

const ANALYTICS_STATIC_PATHS = new Set([
  '/', '/about', '/account', '/admin', '/auth', '/bestsellers', '/blog',
  '/care-guide', '/collections', '/contact', '/customs', '/editorial-policy',
  '/festive-wear', '/faq', '/indian-ethnic-wear-canada', '/indian-ethnic-wear-uk',
  '/indian-ethnic-wear-usa', '/indian-wedding-guest-outfits', '/indowestern',
  '/jewelry', '/lehengas', '/lookbook', '/menswear', '/new-arrivals', '/nri',
  '/order-confirmation', '/our-story', '/pages/shipping-customs', '/press',
  '/privacy', '/privacy-policy', '/ready-to-ship', '/returns', '/review-policy',
  '/sarees', '/shipping', '/shipping-customs', '/shop-by-fulfillment',
  '/size-guide', '/sitemap', '/sizing-measurements-guide', '/style-consultation',
  '/style-quiz', '/suits', '/terms', '/terms-of-service', '/uk-designer-sarees',
  '/uk-indian-clothing', '/us-support', '/wedding-events', '/wedding-party-orders',
  '/wishlist',
]);

export function toAnalyticsRoutePath(pathname?: string): string {
  if (!pathname) return '/';
  const normalized = pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
  if (ANALYTICS_STATIC_PATHS.has(normalized)) return normalized;

  if (/^\/product\/[^/]+$/.test(normalized)) return '/product/:item';
  if (/^\/collections\/[^/]+$/.test(normalized)) return '/collections/:collection';
  if (/^\/blog\/[^/]+$/.test(normalized)) return '/blog/:article';
  if (/^\/authors\/[^/]+$/.test(normalized)) return '/authors/:author';
  if (/^\/shipping\/[^/]+$/.test(normalized)) return '/shipping/:destination';
  if (/^\/nri\/[^/]+$/.test(normalized)) return '/nri/:market';
  if (/^\/shop-by-fulfillment\/[^/]+$/.test(normalized)) return '/shop-by-fulfillment/:type';

  return '/other';
}

export function toAnalyticsTailoringCategory(value?: string): string | undefined {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized ? TAILORING_CATEGORIES[normalized] : undefined;
}

export function toAnalyticsCurrency(value?: string): string | undefined {
  const normalized = value?.trim().toUpperCase();
  return normalized && /^[A-Z]{3}$/.test(normalized) ? normalized : undefined;
}

export function toAnalyticsCountry(value?: string): string | undefined {
  const normalized = value?.trim().toUpperCase();
  return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}

export function toAnalyticsRegion(value?: string): string | undefined {
  const normalized = value?.trim().toUpperCase();
  return normalized && /^[A-Z0-9-]{2,6}$/.test(normalized) ? normalized : undefined;
}

export function toAnalyticsTransactionId(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized && /^[#A-Za-z0-9_-]{1,80}$/.test(normalized) ? normalized : undefined;
}

export function toAnalyticsPageUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return `${url.origin}${toAnalyticsRoutePath(url.pathname)}`;
  } catch {
    return undefined;
  }
}

export function toAnalyticsReferrerOrigin(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : undefined;
  } catch {
    return undefined;
  }
}
