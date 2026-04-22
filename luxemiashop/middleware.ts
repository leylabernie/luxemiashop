import { rewrite, next } from '@vercel/functions';

/**
 * Vercel Edge Middleware (non-Next.js / Vite)
 *
 * Detects search engine bot user agents and rewrites requests to serve
 * pre-rendered HTML files with proper SEO content. Regular users get
 * the normal SPA experience.
 */

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'slurp',
  'sogou',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'pinterestbot',
  'redditbot',
  'oai-searchbot',
  'perplexitybot',
  'claudebot',
  'gptbot',
  'ia_archiver',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
];

const PRERENDERED_ROUTES = new Set([
  // Main pages
  '/',
  '/collections',
  '/brand-story',
  '/new-arrivals',
  '/bestsellers',
  '/lookbook',
  '/style-quiz',
  '/press',
  // Shop categories
  '/lehengas',
  '/sarees',
  '/suits',
  '/menswear',
  '/indowestern',
  // About & info
  '/artisans',
  '/sustainability',
  '/style-consultation',
  // Customer service
  '/contact',
  '/faq',
  '/shipping',
  '/returns',
  '/size-guide',
  '/care-guide',
  // Legal
  '/privacy',
  '/terms',
  // Blog index + posts
  '/blog',
  '/blog/sharara-suit-guide-2026-styles-fabrics',
  '/blog/pakistani-suits-anarkali-shopping-guide',
  '/blog/style-lehenga-choli-every-wedding-event',
  '/blog/indian-wedding-season-2026-outfit-guide',
  '/blog/fabric-guide-indian-ethnic-wear-georgette-silk-chiffon',
  '/blog/indian-wedding-dress-complete-guide',
  '/blog/red-bridal-lehenga-trends-2026',
  '/blog/designer-wedding-dress-under-50000',
  '/blog/wedding-guest-outfit-ideas',
  '/blog/saree-draping-styles-every-occasion',
  '/blog/indian-wedding-trends-2026',
  '/blog/lehenga-color-for-dark-skin',
  '/blog/wedding-saree-for-mother-of-bride',
  '/blog/designer-wedding-dress-under-500',
  '/blog/nri-wedding-ethnic-wear-trends-2026',
  '/blog/buy-authentic-indian-sarees-online-usa-uk',
  '/blog/styling-indian-ethnic-wear-festive-occasions-abroad',
  // Collection redirects (prerendered for SEO equity)
  '/collections/bridal-lehengas',
  '/collections/wedding-sarees',
  '/collections/reception-outfits',
  '/collections/festive-wear',
  // NRI / geo-targeted landing pages
  '/indian-ethnic-wear-usa',
  '/indian-ethnic-wear-uk',
  '/indian-ethnic-wear-canada',
  '/nri',
  // Legacy redirects
  '/our-story',
]);

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const { pathname } = url;

  // Only rewrite for bots requesting pre-rendered routes
  if (!isBot(userAgent) || !PRERENDERED_ROUTES.has(pathname)) {
    return next();
  }

  // Map route path to pre-rendered file
  const prerenderPath =
    pathname === '/'
      ? '/_prerender/index.html'
      : `/_prerender${pathname}.html`;

  return rewrite(new URL(prerenderPath, request.url));
}

export const config = {
  matcher: [
    '/((?!_prerender|assets|favicon\\.ico|og-image\\.jpg|robots\\.txt|sitemap\\.xml|images|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)).*)',
  ],
};
