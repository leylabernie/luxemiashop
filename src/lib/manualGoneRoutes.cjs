// Explicit 410 Gone routes — URLs that have been permanently retired and have
// NO semantic replacement. Only manually confirmed deletions belong here.
//
// Format: full pathname starting with '/'.
// Example: '/collections/some-old-collection', '/some-old-landing-page'
const GONE_ROUTES = new Set([
  // ── Manually maintained entries (add retired URLs from GSC export here) ──
  // Product was deleted from Shopify but still gets GSC impressions (8 imp, 1 click
  // at pos 6.38 as of 2026-07-11). 410 tells Google to drop it from the index
  // immediately, vs. 404 which Google retries for weeks.
  '/product/art-silk-pista-green-groom-wear-thread-work-readymade-sherwani',
  // Search Console redirect examples checked on 22 Aug 2026. Shopify searches
  // found no exact active replacement, so these retired product URLs must not
  // redirect shoppers or crawlers to unrelated catalog items.
  '/product/luxemia-off-white-sequin-work-net-lehenga-choli-for-sangeet-and-wedding-guests',
  '/product/black-cotton-embroidered-men-s-kurta-pajama-set',
  // Current 404s from the 22 Aug 2026 Search Console crawled-not-indexed
  // examples. The three blog slugs have no published source route; the product
  // handles are absent from Shopify, except one explicitly archived product.
  // No exact live replacement was source-verified for any of them.
  '/blog/designer-wedding-dress-under-50000',
  '/blog/red-bridal-lehenga-trends-2026',
  '/blog/unstitched-vs-ready-to-wear-vs-made-to-measure',
  '/product/chinon-lime-yellow-wedding-wear-embroidery-work-readymade-sharara-suit',
  '/product/chinon-silk-orange-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/classic-bridal-red-silk-lehenga',
  '/product/faux-georgette-wine-occasional-wear-sequins-work-readymade-sharara-suit',
  '/product/georgette-green-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/georgette-rani-pink-festival-wear-embroidery-work-readymade-sharara-suit',
  '/product/lilac-linen-cotton-embroidered-men-s-kurta-pajama-set',
  '/product/luxemia-black-chinon-silk-embroidery-work-occasional-wear-sharara-suit',
  '/product/luxemia-brown-embroidered-art-silk-indo-western-for-south-asian-weddings',
  '/product/luxemia-front-cut-western-top-set',
  '/product/luxemia-olive-green-embroidered-satin-lehenga-choli-for-sangeet-and-wedding-guests',
  '/product/luxemia-tissue-brocade-pre-draped-saree',
  '/product/net-black-eid-wear-sequins-work-sharara-suit',
  '/product/pure-gmy-silk-red-eid-wear-embroidery-work-readymade-pakistani-suit',
  '/product/royal-rani-pink-silk-bridal-lehenga',
  '/product/shimmer-silk-sky-blue-occasional-wear-mirror-work-readymade-plazzo-suit',
  '/product/silk-green-occasional-wear-mirror-work-readymade-patiyala-suit',
  '/product/wine-net-embroidery-festive-lehenga-choli',
  // Google-selected-canonical examples checked on 22 Aug 2026. All seven
  // handles are absent from Shopify and have no source-verified replacement.
  '/product/art-silk-cream-groom-wear-thread-work-readymade-sherwani',
  '/product/chinon-navy-blue-occasional-wear-embroidery-work-readymade-plazzo-suit',
  '/product/georgette-purple-wedding-wear-embroidery-work-readywar-plazzo-suit',
  '/product/luxemia-multicolor-mirror-work-cotton-lehenga-choli-for-sangeet-and-wedding-guests',
  '/product/luxemia-navy-blue-hand-worked-imported-lachka-indo-western-for-south-asian-weddings',
  '/product/teal-blue-art-silk-patterned-sherwani-style-kurta-pajama-set',
  '/product/wine-art-banarasi-silk-patterned-men-s-kurta-pajama-with-jacket',
]);

module.exports = { GONE_ROUTES };
