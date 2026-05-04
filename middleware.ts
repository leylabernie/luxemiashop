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
  // New products added to merchant feed (previously returned 404 for bots)
  '/product/art-silk-grey-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/art-silk-light-pink-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/art-silk-navy-blue-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/art-silk-off-white-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/art-silk-onion-groom-wear-thread-work-readymade-sherwani-25',
  '/product/art-silk-purple-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/art-silk-white-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/art-silk-white-wedding-wear-hand-embroidery-readymade-groom-sherwani-6',
  '/product/art-silk-wine-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/banarasi-jacquard-black-wedding-wear-neck-work-readymade-groom-sherwani',
  '/product/banarasi-jacquard-blue-wedding-wear-neck-work-readymade-groom-sherwani',
  '/product/banarasi-jacquard-maroon-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/banarasi-jacquard-mustard-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/banarasi-jacquard-peach-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/banarasi-jacquard-pink-wedding-wear-hand-embroidery-readymade-groom-sherwani',
  '/product/cambric-cotton-dusty-mauve-eid-wear-embroidery-work-pakistani-suit',
  '/product/cambric-cotton-mehndi-eid-wear-embroidery-work-pakistani-suit',
  '/product/cambric-cotton-olive-green-eid-wear-embroidery-work-pakistani-suit',
  '/product/cambric-cotton-rust-orange-eid-wear-embroidery-work-pakistani-suit',
  '/product/chanderi-light-pink-festival-wear-sequins-work-readymade-sharara-suit',
  '/product/chanderi-maroon-festival-wear-sequins-work-readymade-sharara-suit',
  '/product/chinon-baby-pink-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-cream-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-dusty-rose-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-dusty-rose-wedding-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-green-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-hot-pink-eid-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-hot-pink-party-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-lime-green-eid-wear-embroidery-work-readymade-plazzo-suit',
  '/product/chinon-lime-yellow-wedding-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-maroon-party-wear-sequins-embroidery-work-readymade-sharara-suit',
  '/product/chinon-maroon-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-navy-blue-party-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-navy-blue-party-wear-sequins-embroidery-work-readymade-sharara-suit',
  '/product/chinon-olive-green-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-peach-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-red-occasional-wear-sequins-work-readymade-sharara-suit',
  '/product/chinon-silk-baby-pink-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-silk-dark-green-festival-wear-sequin-work-readymade-pakistani-suit',
  '/product/chinon-silk-light-green-festival-wear-sequin-work-readymade-pakistani-suit',
  '/product/chinon-silk-magenta-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-silk-magenta-wedding-wear-sequins-work-readymade-plazzo-suit',
  '/product/chinon-silk-mustard-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-silk-olive-green-wedding-wear-sequins-work-readymade-plazzo-suit',
  '/product/chinon-silk-orange-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-silk-orange-wedding-wear-sequins-work-readymade-plazzo-suit',
  '/product/chinon-silk-purple-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-silk-purple-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-silk-sky-blue-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-silk-violet-wedding-wear-sequins-work-readymade-plazzo-suit',
  '/product/chinon-silk-yellow-festival-wear-sequin-work-readymade-pakistani-suit',
  '/product/chinon-teal-blue-wedding-wear-sequins-work-readymade-plazzo-suit',
  '/product/chinon-teal-green-wedding-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-wine-party-wear-embroidery-work-readymade-anarkali-suit',
  '/product/chinon-yellow-occasional-wear-sequins-work-readymade-sharara-suit',
  '/product/chinon-yellow-wedding-wear-sequins-work-readymade-plazzo-suit',
  '/product/cotton-black-eid-wear-embroidery-work-pakistani-suit',
  '/product/cotton-dusty-pink-eid-wear-embroidery-work-pakistani-suit',
  '/product/cotton-grey-eid-wear-embroidery-work-pakistani-suit',
  '/product/cotton-sage-green-eid-wear-embroidery-work-pakistani-suit',
  '/product/deep-maroon-color-sequence-embroidery-work-designer-lehenga-choli-bl1714',
  '/product/dola-silk-multi-color-party-wear-printed-work-readymade-gown',
  '/product/dusty-sky-blue-color-bids-embroidery-work-designer-lehenga-choli-bl1716',
  '/product/embosed-velvet-black-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/embosed-velvet-magenta-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/embosed-velvet-navy-blue-wedding-wear-embroidery-work-readymade-sherwani',
  '/product/faux-georgette-aqua-blue-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-baby-pink-party-wear-embroidery-work-gharara-suit',
  '/product/faux-georgette-black-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-black-eid-wear-embroidery-work-readymade-pakistani-suit',
  '/product/faux-georgette-black-festival-wear-sequins-work-sharara-suit',
  '/product/faux-georgette-burgundy-eid-wear-embroidery-work-readymade-pakistani-suit',
  '/product/faux-georgette-cream-eid-wear-embroidery-work-readymade-pakistani-suit',
  '/product/faux-georgette-dusty-lavender-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-dusty-rose-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-dusty-rose-eid-wear-zari-embroidery-work-pakistani-suit',
  '/product/faux-georgette-dusty-rose-occasional-wear-embroidery-work-anarkali-suit',
  '/product/faux-georgette-green-occasional-wear-embroidery-work-anarkali-suit',
  '/product/faux-georgette-grey-occasional-wear-sequins-work-readymade-sharara-suit',
  '/product/faux-georgette-lavender-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-lavender-eid-wear-sequins-embroidery-work-pakistani-suit',
  '/product/faux-georgette-lilac-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-maroon-eid-wear-embroidery-work-readymade-pakistani-suit',
  '/product/faux-georgette-mauve-eid-wear-sequins-embroidery-work-pakistani-suit',
  '/product/faux-georgette-mauve-pink-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-mint-green-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-navy-blue-eid-wear-embroidery-work-readymade-pakistani-suit',
  '/product/faux-georgette-olive-green-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-olive-green-eid-wear-zari-embroidery-work-pakistani-suit',
  '/product/faux-georgette-peach-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-peach-occasional-wear-embroidery-work-anarkali-suit',
  '/product/faux-georgette-pink-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-pink-occasional-wear-sequins-work-readymade-sharara-suit',
  '/product/faux-georgette-plum-purple-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-purple-occasional-wear-embroidery-work-anarkali-suit',
  '/product/faux-georgette-sage-green-eid-wear-zari-embroidery-work-pakistani-suit',
  '/product/faux-georgette-sky-blue-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-taupe-beige-eid-wear-zari-embroidery-work-pakistani-suit',
  '/product/faux-georgette-teal-blue-eid-wear-sequins-embroidery-work-readymade-pakistani-suit',
  '/product/faux-georgette-teal-eid-wear-embroidery-work-pakistani-suit',
  '/product/faux-georgette-white-festival-wear-sequins-work-sharara-suit',
  '/product/faux-georgette-wine-occasional-wear-sequins-work-readymade-sharara-suit',
  '/product/fendy-silk-cream-eid-wear-sequins-work-readymade-sharara-suit',
  '/product/fendy-silk-grey-party-wear-embroidery-work-readymade-plazzo-suit',
  '/product/fendy-silk-peach-eid-wear-embroidery-work-readymade-sharara-suit',
  '/product/fendy-silk-sky-blue-eid-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-beige-wedding-wear-hand-work-readymade-plazzo-suit',
  '/product/georgette-black-festival-wear-sequins-work-readymade-sharara-suit',
  '/product/georgette-black-occasional-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-black-occasional-wear-sequins-work-readymade-sharara-suit',
  '/product/georgette-blue-wedding-wear-embroidery-work-readymade-plazzo-suit',
  '/product/georgette-cream-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/georgette-dusty-lavender-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-hot-pink-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/georgette-hot-pink-wedding-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-lavender-wedding-wear-embroidery-work-readymade-plazzo-suit',
  '/product/georgette-lime-green-wedding-wear-beads-work-readymade-plazzo-suit',
  '/product/georgette-mint-green-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-mint-green-wedding-wear-hand-work-readymade-plazzo-suit',
  '/product/georgette-navy-blue-festival-wear-embroidery-work-readymade-anarkali-suit',
  '/product/georgette-navy-blue-party-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-navy-blue-wedding-wear-embroidery-work42-44-readymade-designer-suit',
  '/product/georgette-off-white-wedding-wear-beads-work-readymade-plazzo-suit',
  '/product/georgette-pastle-pink-wedding-wear-zari-work-anarkali-suit',
  '/product/georgette-pastle-purple-wedding-wear-zari-work-anarkali-suit',
  '/product/georgette-pastle-teal-wedding-wear-zari-work-anarkali-suit',
  '/product/georgette-peach-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-peach-wedding-wear-hand-work-readymade-plazzo-suit',
  '/product/georgette-pink-occasional-wear-thread-work-readymade-sharara-suit',
  '/product/georgette-pink-wedding-wear-embroidery-work42-44-readymade-designer-suit',
  '/product/georgette-purple-festival-wear-embroidery-work-readymade-anarkali-suit',
  '/product/georgette-purple-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-rani-pink-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-rust-orange-wedding-wear-zari-work-anarkali-suit',
  '/product/georgette-sky-blue-party-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-teal-blue-party-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-teal-green-wedding-wear-embroidery-work42-44-readymade-designer-suit',
  '/product/georgette-violet-wedding-wear-embroidery-work-readymade-anarkali-suit',
  '/product/georgette-white-party-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-wine-occasional-wear-embroidery-work-readymade-sharara-suit',
  '/product/georgette-wine-occasional-wear-sequins-work-readymade-sharara-suit',
  '/product/georgette-wine-wedding-wear-embroidery-work42-44-readymade-designer-suit',
  '/product/georgette-yellow-occasional-wear-thread-work-readymade-sharara-suit',
  '/product/gmy-silk-mehndi-eid-wear-sequins-embroidery-work-readymade-pakistani-suit',
  '/product/jimmy-choo-black-eid-wear-embroidery-work-pakistani-suit',
  '/product/jimmy-choo-maroon-eid-wear-embroidery-work-pakistani-suit',
  '/product/jimmy-choo-mehndi-eid-wear-embroidery-work-pakistani-suit',
  '/product/jimmy-choo-pink-eid-wear-embroidery-work-pakistani-suit',
  '/product/jimmy-choo-powder-blue-eid-wear-embroidery-work-pakistani-suit',
  '/product/jimmy-choo-teal-blue-eid-wear-embroidery-work-pakistani-suit',
  '/product/lycra-blue-festival-wear-sequins-work-readymade-saree',
  '/product/lycra-brown-festival-wear-sequins-work-readymade-saree',
  '/product/lycra-mauve-festival-wear-sequins-work-readymade-saree',
  '/product/net-black-eid-wear-sequins-work-sharara-suit',
  '/product/net-cream-eid-wear-embroidery-work-readymade-plazzo-suit',
  '/product/net-lilac-wedding-wear-thread-work-lehenga-choli',
  '/product/net-navy-blue-eid-wear-sequins-work-sharara-suit',
  '/product/net-off-white-wedding-wear-embroidery-work-lehenga-choli',
  '/product/net-purple-eid-wear-sequins-work-sharara-suit',
  '/product/net-red-eid-wear-sequins-work-sharara-suit',
  '/product/off-white-color-designer-sequence-embroidery-work-lehenga-choli-bl1712',
  '/product/pista-green-color-designer-sequence-embroidery-work-lehenga-choli-bl1713',
  '/product/pure-gmy-silk-off-white-festival-wear-embroidery-work-readymade-salwar-suit',
  '/product/pure-gmy-silk-red-eid-wear-embroidery-work-readymade-pakistani-suit',
  '/product/pure-silk-multi-color-occasional-wear-embroidery-work-saree',
  '/product/rani-pink-color-bids-embroidery-work-designer-lehenga-choli-bl1717',
  '/product/shimmer-silk-beige-occasional-wear-mirror-work-readymade-plazzo-suit',
  '/product/shimmer-silk-black-occasional-wear-mirror-work-readymade-plazzo-suit',
  '/product/shimmer-silk-mehendi-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/shimmer-silk-pink-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/shimmer-silk-purple-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/shimmer-silk-sky-blue-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/shimmer-silk-sky-blue-occasional-wear-mirror-work-readymade-plazzo-suit',
  '/product/silk-beige-party-wear-mirror-work-readymade-gharara-suit',
  '/product/silk-beige-wedding-wear-embroidery-work-saree',
  '/product/silk-beige-wedding-wear-embroidery-work-saree-9',
  '/product/silk-blend-green-casual-wear-jari-work-saree',
  '/product/silk-blend-green-casual-wear-jari-work-saree-18',
  '/product/silk-blend-navy-blue-casual-wear-jari-work-saree',
  '/product/silk-blend-orange-casual-wear-jari-work-saree',
  '/product/silk-blend-rani-pink-casual-wear-jari-work-saree',
  '/product/silk-blend-red-casual-wear-jari-work-saree',
  '/product/silk-blue-party-wear-mirror-work-readymade-gharara-suit',
  '/product/silk-blue-wedding-wear-embroidery-work-saree',
  '/product/silk-green-occasional-wear-embroidery-work-readymade-sharara-suit',
  '/product/silk-grey-wedding-wear-embroidery-work-saree',
  '/product/silk-light-green-wedding-wear-embroidery-work-saree',
  '/product/silk-light-pink-wedding-wear-embroidery-work-saree',
  '/product/silk-maroon-party-wear-sequins-work-readymade-sharara-suit',
  '/product/silk-multi-color-wedding-wear-embroidery-work-saree',
  '/product/silk-multi-color-wedding-wear-embroidery-work-saree-12',
  '/product/silk-multi-color-wedding-wear-embroidery-work-saree-20',
  '/product/silk-multi-color-wedding-wear-embroidery-work-saree-26',
  '/product/silk-mustard-eid-wear-embroidery-work-readymade-sharara-suit',
  '/product/silk-mustard-party-wear-sequins-work-readymade-sharara-suit',
  '/product/silk-navy-blue-wedding-wear-embroidery-work-saree',
  '/product/silk-off-white-eid-wear-embroidery-work-readymade-sharara-suit',
  '/product/silk-orange-wedding-wear-embroidery-work-saree',
  '/product/silk-orange-wedding-wear-sequins-work-lehenga-choli',
  '/product/silk-pink-wedding-wear-embroidery-work-lehenga-choli',
  '/product/silk-pink-wedding-wear-embroidery-work-saree',
  '/product/silk-powder-pink-wedding-wear-sequins-work-lehenga-choli',
  '/product/silk-purple-party-wear-mirror-work-readymade-gharara-suit',
  '/product/silk-purple-wedding-wear-embroidery-work-saree',
  '/product/silk-rama-wedding-wear-embroidery-work-saree',
  '/product/silk-rani-pink-occasional-wear-embroidery-work-readymade-sharara-suit',
  '/product/silk-rani-pink-wedding-wear-embroidery-work-lehenga-choli',
  '/product/silk-rani-pink-wedding-wear-embroidery-work-saree',
  '/product/silk-rani-pink-wedding-wear-sequins-work-lehenga-choli',
  '/product/silk-red-wedding-wear-embroidery-work-lehenga-choli',
  '/product/silk-red-wedding-wear-sequins-work-lehenga-choli',
  '/product/silk-silver-grey-wedding-wear-embroidery-work-saree',
  '/product/silk-white-wedding-wear-sequins-work-lehenga-choli',
  '/product/silk-yellow-wedding-wear-embroidery-work-saree',
  '/product/silk-yellow-wedding-wear-embroidery-work-saree-19',
  '/product/silk-yellow-wedding-wear-embroidery-work-saree-21',
  '/product/velvet-black-eid-wear-sequins-embroidery-work-readymade-pakistani-suit',
  '/product/velvet-dark-blue-eid-wear-sequins-embroidery-work-readymade-pakistani-suit',
  '/product/velvet-maroon-eid-wear-sequins-embroidery-work-readymade-pakistani-suit',
  '/product/velvet-wine-eid-wear-sequins-embroidery-work-readymade-pakistani-suit',
  '/product/vichitra-silk-green-festival-wear-embroidery-work-readymade-lehenga-choli',
  '/product/vichitra-silk-maroon-festival-wear-embroidery-work-readymade-lehenga-choli',
  '/product/viscose-jacquard-silk-mehndi-party-wear-embroidery-work-readymade-sharara-suit',
  '/product/viscose-jacquard-silk-pink-party-wear-embroidery-work-readymade-sharara-suit',
  '/product/viscose-maroon-party-wear-embroidery-work-readymade-designer-suit',
  '/product/viscose-mustard-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/viscose-navy-blue-party-wear-embroidery-work-readymade-designer-suit',
  '/product/viscose-peach-festival-wear-embroidery-work-readymade-sharara-suit',
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

    // Product URLs — let through to SPA for all product handles
    // The SPA itself handles "product not found" with noIndex meta tag
    // Previously, unknown handles returned 404 which caused Google Merchant Center
    // "product page unavailable" errors for products in the feed
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
