import { rewrite, next } from '@vercel/functions';

/**
 * Vercel Edge Middleware (non-Next.js / Vite)
 *
 * Detects search engine bot user agents and rewrites requests to serve
 * pre-rendered HTML files with proper SEO content. Regular users get
 * the normal SPA experience.
 *
 * For unknown routes (not in PRERENDERED_ROUTES), bots get a proper
 * HTTP 404 response to prevent soft-404 errors in Google Search Console.
 */

const BOT_USER_AGENTS = [
  'googlebot',
  'google-InspectionTool',
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
  '/',
  '/suits',
  '/lehengas',
  '/sarees',
  '/menswear',
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
  '/collections',
  '/brand-story',
  '/new-arrivals',
  '/bestsellers',
  '/indowestern',
  '/nri',
  '/nri/usa',
  '/nri/uk',
  '/nri/canada',
  '/indian-ethnic-wear-usa',
  '/indian-ethnic-wear-uk',
  '/indian-ethnic-wear-canada',
  '/style-consultation',
  '/style-quiz',
  '/size-guide',
  '/care-guide',
  '/faq',
  '/shipping',
  '/returns',
  '/contact',
  '/artisans',
  '/sustainability',
  '/virtual-try-on',
  '/products',
  '/privacy',
  '/terms',
  '/press',
  // All product pages (161 products)
  '/product/ethereal-pastel-pink-bridal-lehenga',
  '/product/royal-rani-pink-silk-bridal-lehenga',
  '/product/classic-bridal-red-silk-lehenga',
  '/product/ivory-dreamscape-net-bridal-lehenga',
  '/product/lavender-mist-bridal-lehenga',
  '/product/metallic-silver-celebration-lehenga',
  '/product/burgundy-velvet-wedding-lehenga',
  '/product/wine-romance-net-lehenga',
  '/product/emerald-forest-wedding-lehenga',
  '/product/royal-blue-celebration-lehenga',
  '/product/coral-sunset-net-lehenga',
  '/product/powder-pink-wedding-lehenga',
  '/product/blush-georgette-party-lehenga',
  '/product/mint-sequin-party-lehenga',
  '/product/champagne-gold-party-lehenga',
  '/product/navy-blue-party-lehenga',
  '/product/marigold-yellow-festive-lehenga',
  '/product/saffron-orange-festive-lehenga',
  '/product/peacock-green-festive-lehenga',
  '/product/ruby-red-festive-lehenga',
  '/product/dusty-rose-festive-lehenga',
  '/product/royal-purple-festive-lehenga',
  '/product/heavy-silk-yellow-mirror-work-lehenga',
  '/product/heavy-silk-beige-mirror-work-lehenga',
  '/product/heavy-silk-sky-blue-mirror-work-lehenga',
  '/product/heavy-silk-dusty-pink-mirror-work-lehenga',
  '/product/organza-lavender-bridal-heavy-work-lehenga',
  '/product/organza-red-bridal-heavy-work-lehenga',
  '/product/mint-green-kanchipuram-silk-wedding-saree',
  '/product/royal-pink-kanchipuram-silk-wedding-saree',
  '/product/ivory-beige-kanchipuram-silk-wedding-saree',
  '/product/multicolor-kanchipuram-silk-wedding-saree',
  '/product/antique-gold-kanchipuram-silk-wedding-saree',
  '/product/beige-gold-tissue-silk-wedding-saree',
  '/product/pink-tissue-silk-wedding-saree',
  '/product/sea-green-tissue-silk-wedding-saree',
  '/product/sunset-orange-tissue-silk-wedding-saree',
  '/product/lavender-tissue-silk-wedding-saree',
  '/product/royal-blue-georgette-party-saree',
  '/product/wine-georgette-party-saree',
  '/product/emerald-green-georgette-party-saree',
  '/product/dusty-rose-georgette-party-saree',
  '/product/black-georgette-party-saree',
  '/product/magenta-art-silk-festive-saree',
  '/product/teal-green-art-silk-festive-saree',
  '/product/maroon-art-silk-festive-saree',
  '/product/mustard-yellow-art-silk-festive-saree',
  '/product/royal-purple-art-silk-festive-saree',
  '/product/silk-yellow-occasional-embroidery-saree',
  '/product/silk-light-pink-occasional-embroidery-saree',
  '/product/silk-green-occasional-embroidery-saree',
  '/product/silk-sea-green-occasional-embroidery-saree',
  '/product/silk-rani-pink-casual-sequins-saree',
  '/product/silk-rust-orange-casual-sequins-saree',
  '/product/silk-blue-casual-sequins-saree',
  '/product/banarasi-silk-mustard-festival-weaving-saree',
  '/product/banarasi-silk-mint-green-festival-weaving-saree',
  '/product/fendy-satin-teal-green-occasional-embroidery-saree',
  '/product/grey-art-silk-groom-sherwani',
  '/product/purple-art-silk-groom-sherwani',
  '/product/off-white-art-silk-groom-sherwani',
  '/product/light-pink-art-silk-groom-sherwani',
  '/product/white-art-silk-groom-sherwani',
  '/product/black-banarasi-jacquard-sherwani',
  '/product/blue-banarasi-jacquard-sherwani',
  '/product/maroon-banarasi-jacquard-sherwani',
  '/product/mustard-banarasi-jacquard-sherwani',
  '/product/peach-banarasi-jacquard-sherwani',
  '/product/pink-banarasi-jacquard-sherwani',
  '/product/navy-blue-velvet-sherwani',
  '/product/magenta-velvet-sherwani',
  '/product/black-velvet-sherwani',
  '/product/wine-art-silk-sherwani',
  '/product/black-art-silk-sherwani',
  '/product/navy-silk-sherwani',
  '/product/baby-pink-cotton-kurta-pajama',
  '/product/blue-cotton-kurta-pajama',
  '/product/white-viscose-kurta-pajama',
  '/product/beige-cotton-kurta-pajama',
  '/product/black-cotton-kurta-pajama',
  '/product/yellow-cotton-kurta-pajama',
  '/product/teal-blue-cotton-kurta-pajama',
  '/product/brown-silk-kurta-pajama',
  '/product/red-silk-eid-anarkali-suit',
  '/product/green-silk-eid-anarkali-suit',
  '/product/dusty-rose-silk-party-anarkali',
  '/product/baby-pink-roman-silk-festival-anarkali',
  '/product/red-chanderi-cotton-casual-anarkali',
  '/product/champagne-beige-chanderi-anarkali',
  '/product/peach-fendy-silk-casual-anarkali',
  '/product/grey-fendy-silk-casual-anarkali',
  '/product/green-fendy-silk-casual-anarkali',
  '/product/dusty-pink-fendy-silk-casual-anarkali',
  '/product/purple-chanderi-silk-casual-anarkali',
  '/product/pista-viscose-casual-anarkali',
  '/product/lavender-viscose-casual-anarkali',
  '/product/sky-blue-georgette-anarkali-gown',
  '/product/yellow-georgette-anarkali-gown',
  '/product/black-roman-silk-anarkali',
  '/product/maroon-roman-silk-anarkali',
  '/product/multicolor-chinon-party-anarkali',
  '/product/teal-green-chinnon-silk-sharara-set',
  '/product/rust-orange-chinnon-silk-sharara-set',
  '/product/black-chinnon-silk-sharara-set',
  '/product/wine-georgette-sharara-suit',
  '/product/teal-georgette-palazzo-suit',
  // Shopify Palazzo Suits (previously in SHOPIFY_PRODUCT_HANDLES)
  '/product/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit',
  '/product/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-2',
  '/product/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-3',
  '/product/chinon-silk-wine-party-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-silk-lime-yellow-party-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-silk-rani-pink-party-wear-embroidery-work-readymade-plazzo-suit',
  '/product/shimmer-silk-light-green-festival-wear-embroidery-work-readymade-plazzo-suit',
  '/product/shimmer-silk-pink-festival-wear-embroidery-work-readymade-plazzo-suit',
  '/product/shimmer-silk-turquoise-festival-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-silk-orange-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-silk-navy-blue-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/fendy-silk-maroon-festival-wear-embroidery-work-readymade-plazzo-suit',
  '/product/fendy-silk-black-festival-wear-embroidery-work-readymade-plazzo-suit',
  '/product/fendy-silk-navy-blue-festival-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-navy-blue-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-hot-pink-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-green-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-violet-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/georgette-pink-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/georgette-wine-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/georgette-green-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/georgette-purple-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/fendy-silk-teal-blue-festival-wear-embroidery-work-readymade-plazzo-suit',
  '/product/fendy-silk-rani-pink-festival-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-silk-orange-party-wear-embroidery-work-readymade-plazzo-suit',
  '/product/hot-pink-chinon-party-wear-embroidery-work-readymade-plazzo-suit',
  // Shopify Patiala Suits
  '/product/silk-black-occasional-wear-mirror-work-readymade-patiyala-suit',
  '/product/silk-light-pink-occasional-wear-mirror-work-readymade-patiyala-suit',
  '/product/silk-green-occasional-wear-mirror-work-readymade-patiyala-suit',
  '/product/silk-maroon-occasional-wear-mirror-work-readymade-patiyala-suit',
  '/product/silk-rani-pink-occasional-wear-mirror-work-readymade-patiyala-suit',
  '/product/silk-purple-occasional-wear-mirror-work-readymade-patiyala-suit',
  // Shopify Cotton Salwar Suits
  '/product/teal-green-cotton-party-wear-salwar-suit',
  '/product/dusty-pink-cotton-eid-wear-salwar-suit',
  '/product/cream-cotton-eid-wear-salwar-suit',
  '/product/olive-green-cotton-party-wear-salwar-suit',
  '/product/warm-beige-cotton-festival-salwar-suit',
  '/product/olive-green-cotton-festive-salwar-suit',
  // Shopify Wedding Palazzo Suits
  '/product/georgette-purple-wedding-wear-embroidery-work-readywar-plazzo-suit',
  '/product/georgette-black-wedding-wear-embroidery-work-readywar-plazzo-suit',
  '/product/georgette-cherry-wedding-wear-beads-work-readymade-plazzo-suit',
  // Shopify Sherwanis
  '/product/art-silk-off-white-groom-wear-thread-work-readymade-sherwani',
  '/product/art-silk-pista-green-groom-wear-thread-work-readymade-sherwani',
  '/product/art-silk-light-pink-groom-wear-thread-work-readymade-sherwani',
  '/product/art-silk-cream-groom-wear-thread-work-readymade-sherwani',
  '/product/art-silk-beige-groom-wear-thread-work-readymade-sherwani',
  '/product/art-silk-onion-groom-wear-thread-work-readymade-sherwani',
  '/product/art-silk-firozi-green-groom-wear-thread-work-readymade-sherwani',
  '/product/art-silk-light-pink-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/art-silk-beige-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/art-silk-pista-green-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/art-silk-teal-blue-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/art-silk-black-wedding-wear-embroidery-work-readymade-sherwani',
]);

// All Shopify product handles have been moved to PRERENDERED_ROUTES above.
// This set is kept empty for backwards compatibility.
const SHOPIFY_PRODUCT_HANDLES = new Set<string>();

// Routes that redirect elsewhere (should not be treated as 404)
const REDIRECT_ROUTES = new Set([
  '/our-story',
  '/lookbook',
  '/jewelry',
  '/collections/wedding-sarees',
  '/collections/bridal-lehengas',
  '/collections/reception-outfits',
  '/collections/festive-wear',
  '/collections/sarees',
  '/collections/salwar-kameez',
  '/collections/suits',
  '/collections/menswear',
  '/collections/lehengas',
  '/collections/indo-western',
  '/collections/bridesmaid-dresses',
  '/collections/groomsman-outfits',
]);

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

// Cached 404 HTML - will be populated on first request
let cached404Html: string | null = null;

/**
 * Return a proper HTTP 404 response with the 404 page content.
 * This is critical: Google requires HTTP 404 status code, not 200 with
 * "not found" content (which causes "soft 404" errors).
 */
async function return404(request: Request): Promise<Response> {
  if (!cached404Html) {
    try {
      const resp = await fetch(new URL('/_prerender/404.html', request.url).toString());
      cached404Html = await resp.text();
    } catch {
      cached404Html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page Not Found | LuxeMia</title><meta name="robots" content="noindex,nofollow"></head><body><h1>Page Not Found</h1><p>The page you are looking for could not be found.</p></body></html>`;
    }
  }
  return new Response(cached404Html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const { pathname } = url;

  // Skip non-page requests (static files, API, etc.)
  if (
    pathname.startsWith('/_prerender') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/catalogs') ||
    pathname.includes('.')
  ) {
    return next();
  }

  // For bots: serve prerendered content for known routes
  if (isBot(userAgent)) {
    if (PRERENDERED_ROUTES.has(pathname)) {
      // Known route → serve prerendered HTML
      const prerenderPath =
        pathname === '/'
          ? '/_prerender/index.html'
          : `/_prerender${pathname}.html`;

      return rewrite(new URL(prerenderPath, request.url));
    }

    // Product URLs — let ALL through to SPA so Googlebot can crawl them
    // Previously we returned 404 for unknown handles, which caused GMC
    // "Product page unavailable" errors for 228+ products in the feed.
    // Googlebot can render JS, so even non-prerendered products will render.
    if (pathname.startsWith('/product/')) {
      return next();
    }

    // Collection/category pages that aren't prerendered — let through to SPA
    // Note: /nri/usa, /nri/uk, /nri/canada are in PRERENDERED_ROUTES so handled above
    // Any other /nri/* paths should 404 for bots to prevent soft-404
    if (pathname.startsWith('/collections/')) {
      return next();
    }

    // /admin should return noindex to bots even though it's disallowed in robots.txt
    if (pathname.startsWith('/admin')) {
      return new Response(
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Admin | LuxeMia</title></head><body><p>Admin panel — not indexed.</p></body></html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    // Unknown route that's not a redirect → return proper HTTP 404
    // This is the KEY FIX: return 404 status code instead of 200 with 404 content
    if (!REDIRECT_ROUTES.has(pathname)) {
      return return404(request);
    }
  }

  // Regular users or redirect routes → normal SPA experience
  return next();
}

export const config = {
  matcher: [
    '/((?!_prerender|assets|favicon\\.ico|og-image\\.jpg|robots\\.txt|sitemap\\.xml|images|catalogs|3c4a52b9-542f-4bfe-a61b-9afb42f4312c\\.txt|google4e3f332d00afc8ba\\.html|merchant-feed\\.xml|merchant-feed\\.tsv|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|csv|txt|xml|tsv)).*)',
  ],
};
