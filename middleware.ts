import { rewrite, next } from '@vercel/functions';

/**
 * Vercel Edge Middleware (non-Next.js / Vite)
 *
 * Detects search engine bot user agents and rewrites requests to serve
 * pre-rendered HTML files with proper SEO content. Regular users get
 * the normal SPA experience.
 *
 * For unknown routes (not in PRERENDERED_ROUTES), bots get a 404 page
 * to prevent soft-404 errors in Google Search Console.
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
  // All product pages (106 products)
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
]);

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

export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const { pathname } = url;

  // Skip non-page requests (static files, etc.)
  if (
    pathname.startsWith('/_prerender') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
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

    // Product URLs that aren't prerendered (e.g. new Shopify products)
    // Let them through to the SPA — Google will see the client-rendered content
    // The ProductDetail component adds noIndex for missing products
    if (pathname.startsWith('/product/')) {
      return next();
    }

    // Collection/category pages that aren't prerendered — let through to SPA
    if (pathname.startsWith('/collections/') || pathname.startsWith('/nri/')) {
      return next();
    }

    // Unknown route that's not a redirect → serve 404 page to prevent soft-404
    if (!REDIRECT_ROUTES.has(pathname)) {
      return rewrite(new URL('/_prerender/404.html', request.url));
    }
  }

  // Regular users or redirect routes → normal SPA experience
  return next();
}

export const config = {
  matcher: [
    '/((?!_prerender|assets|favicon\\.ico|og-image\\.jpg|robots\\.txt|sitemap\\.xml|images|catalogs|3c4a52b9-542f-4bfe-a61b-9afb42f4312c\\.txt|google4e3f332d00afc8ba\\.html|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|csv|txt|xml)).*)',
  ],
};
