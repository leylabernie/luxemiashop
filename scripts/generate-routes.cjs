#!/usr/bin/env node
/**
 * Validate or explicitly regenerate the committed prerender route manifests.
 *
 * This script:
 *   1. Reads published blog post slugs from the authored source files
 *   2. Combines these with the reviewed static page routes
 *   3. Checks or explicitly writes TWO committed source files:
 *      a. src/lib/autoRoutes.ts  — TypeScript module exporting PRERENDERED_ROUTES as a Set
 *      b. scripts/routes.json    — JSON array used by the built-coverage guard
 *
 * Release check: node scripts/generate-routes.cjs --check
 * Maintainer update: node scripts/generate-routes.cjs --write
 */

const fs = require('fs');
const path = require('path');

// ─── Config ─────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..');
const AUTO_ROUTES_TS = path.join(PROJECT_ROOT, 'src/lib/autoRoutes.ts');
const ROUTES_JSON = path.join(PROJECT_ROOT, 'scripts/routes.json');
const BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/blogPosts.ts');
const RECOVERED_BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/recoveredBlogPosts.ts');
const SEO_GROWTH_BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/seoGrowthBlogPosts.ts');
const SEMANTIC_COMMERCE_GUIDES_TS = path.join(PROJECT_ROOT, 'src/data/semanticCommerceGuides.ts');

// ─── Static Routes ──────────────────────────────────────────────────────────
// These are the non-dynamic, non-blog page routes currently in middleware.ts's
// PRERENDERED_ROUTES Set. Product routes (/product/*) are deliberately excluded
// because they are handled dynamically by middleware.

const STATIC_ROUTES = [
  '/',
  '/suits',
  '/lehengas',
  '/sarees',
  '/menswear',
  '/jewelry',
  '/blog',
  '/collections',
  '/collections/silk-sarees',
  '/collections/kanchipuram-sarees',
  '/collections/bridal-party-outfits',
  '/collections/bollywood-inspired-indian-outfits',
  '/collections/customizable-indian-outfits',
  // Restored commercial collection pages — keep these in the middleware manifest
  // so the dedicated prerendered HTML is served as a direct, indexable response.
  '/collections/sharara-suits',
  '/collections/gharara-suits',
  '/collections/anarkali-suits',
  '/collections/palazzo-suits',
  '/collections/sherwani-for-groom',
  '/collections/bridal-lehengas',
  '/collections/wedding-sarees',
  '/collections/banarasi-sarees',
  '/collections/wedding-guest-lehengas',
  '/collections/wedding-guest-kurta-sets',
  '/collections/diwali-womenswear',
  '/collections/diwali-menswear',
  '/collections/designer-sarees',
  '/collections/party-wear-lehengas',
  '/about',
  '/us-support',
  '/editorial-policy',
  '/review-policy',
  '/sitemap',
  '/new-arrivals',
  '/indowestern',
  '/nri',
  '/indian-ethnic-wear-usa',
  '/size-guide',
  '/care-guide',
  '/faq',
  '/shipping',
  '/shipping/united-states',
  '/shipping/canada',
  '/shipping/united-kingdom',
  '/shipping/australia',
  '/ready-to-ship',
  '/pages/shipping-customs',
  '/returns',
  '/contact',
  '/privacy',
  '/terms',
  '/press',
  '/sizing-measurements-guide',
  '/lookbook',
  '/wedding-party-orders',
  '/style-quiz',
  '/festive-wear',
  '/indian-wedding-guest-outfits',
  '/wedding-events',
  '/shop-by-fulfillment',
  '/shop-by-fulfillment/ready-to-ship',
  '/shop-by-fulfillment/made-to-order',
  '/shop-by-fulfillment/customizable-outfits',
  // Occasion landing pages — high buyer-intent SEO pages
  '/collections/diwali-outfits',
  '/collections/wedding-guest-outfits',
  '/collections/mehendi-outfits',
  '/collections/eid-outfits',
  '/collections/navratri-outfits',
  '/collections/haldi-outfits',
  '/collections/navratri-chaniya-choli',
  '/collections/garba-outfits',
  '/collections/groomsmen-outfits',
  '/collections/sangeet-outfits',
  '/collections/reception-outfits',
  // Blog topic hubs — each route must contain at least one published article
  '/blog/indian-wedding-guest-attire',
  '/blog/indian-textiles-and-embroidery',
  '/blog/weddings-festivals',
  '/blog/fit-sizing-and-garment-care',
  '/blog/designer-profiles',
  '/blog/cultural-context',
  // Factual organizational author page
  '/authors/luxemia-editorial-team',
];

// ─── Shopify GraphQL ────────────────────────────────────────────────────────

// ─── Blog Slug Parsing ──────────────────────────────────────────────────────

/**
 * Parse blogPosts.ts to extract slug strings.
 * Since this is a CJS script, we can't import TypeScript directly.
 * Instead, we regex-match slug patterns like:  slug: 'some-slug-here'
 * Returns an array of slug strings.
 */
function parseBlogSlugs() {
  const files = [BLOG_POSTS_TS, RECOVERED_BLOG_POSTS_TS, SEO_GROWTH_BLOG_POSTS_TS, SEMANTIC_COMMERCE_GUIDES_TS];
  const slugs = new Set();
  const excludedSlugs = new Set();
  const publishedSlugs = new Set();

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required blog source file not found: ${filePath}`);
    }
  }

  const blogSource = fs.readFileSync(BLOG_POSTS_TS, 'utf8');
  const excludedBlock = blogSource.match(/UNPUBLISHED_BLOG_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (excludedBlock) {
    const valueRegex = /['"]([^'"]+)['"]/g;
    let excludedMatch;
    while ((excludedMatch = valueRegex.exec(excludedBlock[1])) !== null) {
      excludedSlugs.add(excludedMatch[1]);
    }
  }

  const publishedBlock = blogSource.match(/PUBLISHED_BLOG_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!publishedBlock) {
    throw new Error(`PUBLISHED_BLOG_SLUGS was not found in ${BLOG_POSTS_TS}`);
  }
  const valueRegex = /['"]([^'"]+)['"]/g;
  let publishedMatch;
  while ((publishedMatch = valueRegex.exec(publishedBlock[1])) !== null) {
    if (publishedSlugs.has(publishedMatch[1])) {
      throw new Error(`PUBLISHED_BLOG_SLUGS contains duplicate slug: ${publishedMatch[1]}`);
    }
    publishedSlugs.add(publishedMatch[1]);
  }
  if (publishedSlugs.size === 0) {
    throw new Error(`PUBLISHED_BLOG_SLUGS is empty in ${BLOG_POSTS_TS}`);
  }

  for (const slug of excludedSlugs) {
    if (publishedSlugs.has(slug)) {
      throw new Error(`Blog slug is both published and unpublished: ${slug}`);
    }
  }

  for (const filePath of files) {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Match: slug: 'some-slug' or slug: "some-slug"
    const slugRegex = /["']?slug["']?\s*:\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = slugRegex.exec(fileContent)) !== null) {
      if (publishedSlugs.has(match[1]) && !excludedSlugs.has(match[1])) {
        if (slugs.has(match[1])) {
          throw new Error(`Published blog slug is defined more than once: ${match[1]}`);
        }
        slugs.add(match[1]);
      }
    }
  }

  const missingPublishedSlugs = [...publishedSlugs].filter((slug) => !slugs.has(slug));
  if (missingPublishedSlugs.length > 0) {
    throw new Error(
      `Published blog slug(s) missing from source records: ${missingPublishedSlugs.join(', ')}`
    );
  }

  console.log(`[generate-routes] Parsed ${slugs.size} allowlisted blog slugs`);
  return [...slugs];
}

// ─── Output Generation ──────────────────────────────────────────────────────

/**
 * Generate the TypeScript module content for src/lib/autoRoutes.ts
 */
function generateAutoRoutesTs(routes) {
  const routeLines = routes.map((r) => `  '${r}',`).join('\n');

  return `// AUTO-GENERATED by scripts/generate-routes.cjs — do not edit manually.
// Regenerate before commit with: node scripts/generate-routes.cjs --write
// Release builds verify this committed source with: node scripts/generate-routes.cjs --check

export const PRERENDERED_ROUTES: Set<string> = new Set([
${routeLines}
]);
`;
}

/**
 * Check both committed files during release, or rewrite them only when a
 * maintainer explicitly requests --write before commit.
 */
function syncOutputFiles(routes, write) {
  // Ensure parent directories exist
  const autoRoutesDir = path.dirname(AUTO_ROUTES_TS);
  const routesJsonDir = path.dirname(ROUTES_JSON);

  if (!fs.existsSync(autoRoutesDir)) {
    fs.mkdirSync(autoRoutesDir, { recursive: true });
  }
  if (!fs.existsSync(routesJsonDir)) {
    fs.mkdirSync(routesJsonDir, { recursive: true });
  }

  const tsContent = generateAutoRoutesTs(routes);
  const jsonContent = JSON.stringify(routes, null, 2) + '\n';

  if (write) {
    fs.writeFileSync(AUTO_ROUTES_TS, tsContent, 'utf8');
    fs.writeFileSync(ROUTES_JSON, jsonContent, 'utf8');
    console.log(`[generate-routes] Wrote both committed route manifests (${routes.length} routes)`);
    return;
  }

  const mismatches = [];
  if (!fs.existsSync(AUTO_ROUTES_TS) || fs.readFileSync(AUTO_ROUTES_TS, 'utf8') !== tsContent) {
    mismatches.push('src/lib/autoRoutes.ts');
  }
  if (!fs.existsSync(ROUTES_JSON) || fs.readFileSync(ROUTES_JSON, 'utf8') !== jsonContent) {
    mismatches.push('scripts/routes.json');
  }
  if (mismatches.length > 0) {
    throw new Error(
      `${mismatches.join(' and ')} ${mismatches.length === 1 ? 'is' : 'are'} stale; `
      + 'run this script with --write and commit the result before releasing',
    );
  }
  console.log(`[generate-routes] OK — both committed route manifests match ${routes.length} reviewed routes.`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const write = process.argv.includes('--write');
  const check = process.argv.includes('--check');
  if (write === check) {
    throw new Error('Choose exactly one mode: --check for releases or --write before commit.');
  }
  console.log(`[generate-routes] ${write ? 'Regenerating' : 'Checking'} the committed prerender route manifests...`);

  // 1. Parse blog slugs from the published source files.
  const blogSlugs = parseBlogSlugs();

  // 2. Build combined routes list
  //    - Static routes first
  //    - Then blog routes (/blog/<slug>)
  //    - NOTE: /product/* routes are NOT included — they are handled
  //      dynamically by the middleware (which does live Shopify SSR).
  const allRoutes = [...STATIC_ROUTES];

  // Add blog routes
  for (const slug of blogSlugs) {
    const blogRoute = `/blog/${slug}`;
    if (!allRoutes.includes(blogRoute)) {
      allRoutes.push(blogRoute);
    }
  }

  // Deduplicate and sort blog routes alphabetically for consistent output
  const seen = new Set();
  const finalRoutes = [];
  // Static routes first (preserving order), then blog posts sorted
  const blogRoutes = allRoutes
    .filter((r) => r.startsWith('/blog/') && r !== '/blog')
    .sort();
  const orderedRoutes = [
    ...allRoutes.filter((r) => !r.startsWith('/blog/')),
    ...blogRoutes,
  ];
  for (const route of orderedRoutes) {
    if (!seen.has(route)) {
      seen.add(route);
      finalRoutes.push(route);
    }
  }

  // 3. Check or explicitly write only after every source completed successfully.
  syncOutputFiles(finalRoutes, write);

  const blogCount = finalRoutes.filter((r) => r.startsWith('/blog/')).length;
  console.log(
    `[generate-routes] Done: ${STATIC_ROUTES.length} configured static + ${blogCount} blog = ${finalRoutes.length} unique routes`
  );
}

main().catch((err) => {
  console.error('[generate-routes] Fatal error:', err);
  process.exitCode = 1;
});
