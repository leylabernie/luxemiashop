#!/usr/bin/env node
/**
 * Apply a small, deterministic middleware patch before Vercel compiles the
 * root Edge Middleware. The mappings below are limited to live 4xx evidence
 * and exact/semantically equivalent final destinations verified on 24 Aug 2026.
 *
 * Why this file exists: middleware.ts is also a generated release artifact in
 * this Vite/Vercel project. Keeping the remediation as an idempotent build step
 * prevents the aliases from being lost when generated route files refresh.
 */
const fs = require('fs');
const path = require('path');

const middlewarePath = path.resolve(__dirname, '..', 'middleware.ts');
let source = fs.readFileSync(middlewarePath, 'utf8');

function insertOnce(marker, anchor, insertion) {
  if (source.includes(marker)) return;
  if (!source.includes(anchor)) {
    throw new Error(`[gsc-runtime-remediation] Required anchor not found for ${marker}`);
  }
  source = source.replace(anchor, insertion);
}

insertOnce(
  "'/product/mustard-georgette-embroidered-anarkali-suit-with-dupatta'",
  "  '/product/wine-silk-embroidery-festive-lehenga-choli': '/product/wine-silk-embroidery-lehenga-choli-with-dupatta',\n};",
  "  '/product/wine-silk-embroidery-festive-lehenga-choli': '/product/wine-silk-embroidery-lehenga-choli-with-dupatta',\n" +
  "  // Live 4xx recovery verified against the current Shopify catalog on 24 Aug 2026.\n" +
  "  '/product/mustard-georgette-embroidered-anarkali-suit-with-dupatta': '/product/mustard-georgette-embroidered-anarkali-suit-with-dupatta-396043',\n" +
  "  // Same RANGHAT-1071 blue-net garment: archived legacy handles now resolve\n" +
  "  // to the current purchasable partywear listing instead of returning 404.\n" +
  "  '/product/blue-net-embroidery-lehenga-choli-with-dupatta': '/product/blue-net-embroidery-partywear-lehenga-with-dupatta',\n" +
  "  '/product/blue-net-embroidery-festive-lehenga-choli': '/product/blue-net-embroidery-partywear-lehenga-with-dupatta',\n" +
  "};"
);

insertOnce(
  "pathname === '/pages/contact'",
  "  if (pathname === '/terms-of-service') {\n    return Response.redirect(new URL('/terms', request.url).toString(), 301);\n  }",
  "  if (pathname === '/terms-of-service') {\n    return Response.redirect(new URL('/terms', request.url).toString(), 301);\n  }\n" +
  "  // Shopify-style page alias still appears in crawl logs; preserve the\n" +
  "  // established contact destination with a single permanent hop.\n" +
  "  if (pathname === '/pages/contact') {\n    return Response.redirect(new URL('/contact', request.url).toString(), 301);\n  }"
);

insertOnce(
  "'/collections/jewelry': '/jewelry'",
  "    '/collections/lehenga-choli': '/lehengas',\n  };",
  "    '/collections/lehenga-choli': '/lehengas',\n" +
  "    // Canonical category aliases observed in production 4xx logs. Each\n" +
  "    // destination is the existing final 200, self-canonical route.\n" +
  "    '/collections/jewelry': '/jewelry',\n" +
  "    '/collections/new-arrivals': '/new-arrivals',\n" +
  "    '/collections/indowestern': '/indowestern',\n" +
  "    '/collections/nri': '/nri',\n" +
  "  };"
);

insertOnce(
  "'/blog/how-to-measure-yourself-for-a-saree-or-lehenga'",
  "    '/blog/indian-bridal-jewelry-sets-complete-guide': '/jewelry',\n  };",
  "    '/blog/indian-bridal-jewelry-sets-complete-guide': '/jewelry',\n" +
  "    // Retired guides observed in live 4xx logs. These destinations preserve\n" +
  "    // the same sizing, wedding-guest, menswear, or Mehendi intent.\n" +
  "    '/blog/how-to-measure-yourself-for-a-saree-or-lehenga': '/sizing-measurements-guide',\n" +
  "    '/blog/saree-vs-lehenga-wedding-guest-guide-2026': '/blog/wedding-guest-outfit-ideas',\n" +
  "    '/blog/indian-wedding-guest-outfits-men-usa-guide': '/menswear',\n" +
  "    '/blog/mehendi-outfit-by-role': '/collections/mehendi-outfits',\n" +
  "  };"
);

const requiredFragments = [
  "'/collections/jewelry': '/jewelry'",
  "'/collections/new-arrivals': '/new-arrivals'",
  "'/collections/indowestern': '/indowestern'",
  "'/collections/nri': '/nri'",
  "pathname === '/pages/contact'",
  "'/product/mustard-georgette-embroidered-anarkali-suit-with-dupatta'",
  "'/product/blue-net-embroidery-lehenga-choli-with-dupatta'",
  "'/blog/how-to-measure-yourself-for-a-saree-or-lehenga'",
];
for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`[gsc-runtime-remediation] Patch validation failed: ${fragment}`);
  }
}

fs.writeFileSync(middlewarePath, source, 'utf8');
console.log('[gsc-runtime-remediation] Applied and validated 12 evidence-backed permanent redirects.');
