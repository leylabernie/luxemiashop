#!/usr/bin/env node
/**
 * Auto-generate the prerendered routes list for LuxemiaShop.
 *
 * This script:
 *   1. Fetches all product handles from the Shopify Storefront API (with pagination)
 *   2. Reads blog post slugs from src/data/blogPosts.ts (via regex parsing)
 *   3. Combines these with a static list of page routes
 *   4. Writes TWO output files:
 *      a. src/lib/autoRoutes.ts  — TypeScript module exporting PRERENDERED_ROUTES as a Set
 *      b. scripts/routes.json    — JSON array of routes for use by prerender.js
 *
 * Run: node scripts/generate-routes.cjs
 * Automatically run during: npm run build  (after vite build, before prerender)
 */

const fs = require('fs');
const path = require('path');

// ─── Config ─────────────────────────────────────────────────────────────────

const SHOPIFY_STOREFRONT_URL =
  'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const AUTO_ROUTES_TS = path.join(PROJECT_ROOT, 'src/lib/autoRoutes.ts');
const ROUTES_JSON = path.join(PROJECT_ROOT, 'scripts/routes.json');
const BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/blogPosts.ts');

if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.warn(
    '[generate-routes] WARNING: SHOPIFY_STOREFRONT_TOKEN env var is not set. ' +
      'Product handles will not be fetched from Shopify. Only static + blog routes will be included.'
  );
}

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
  '/blog',
  '/collections',
  '/brand-story',
  '/new-arrivals',
  '/bestsellers',
  '/indowestern',
  '/nri',
  '/nri/usa',
  '/nri/canada',
  '/indian-ethnic-wear-usa',
  '/indian-ethnic-wear-canada',
  '/size-guide',
  '/care-guide',
  '/faq',
  '/shipping',
  '/returns',
  '/contact',
  '/artisans',
  '/sustainability',
  '/privacy',
  '/terms',
  '/press',
  // Occasion landing pages — high buyer-intent SEO pages
  '/collections/bridal-lehengas',
  '/collections/wedding-lehengas',
  '/collections/lehenga-choli',
  '/collections/designer-lehengas',
  '/collections/wedding-sarees',
  '/collections/reception-outfits',
  '/collections/party-wear-lehengas',
  '/collections/designer-sarees',
  '/collections/silk-sarees',
  '/collections/saree-gowns',
  '/collections/wedding-guest-dresses',
  '/collections/indian-wedding-dresses',
  '/collections/pakistani-suits',
  '/collections/anarkali-suits',
  '/collections/anarkali-gowns',
  '/collections/salwar-kameez',
  '/collections/palazzo-suits',
  '/collections/sharara-suits',
  '/collections/gharara-suits',
  '/collections/indo-western-dresses',
  '/collections/kurta-sets',
  '/collections/diwali-outfits',
  '/collections/wedding-guest-outfits',
  '/collections/mehendi-outfits',
  '/collections/eid-outfits',
  '/collections/navratri-outfits',
];

// ─── Shopify GraphQL ────────────────────────────────────────────────────────

const GET_ALL_PRODUCT_HANDLES_QUERY = `
  query GetAllProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node { handle }
      }
    }
  }
`;

/**
 * Fetch all product handles from Shopify Storefront API with pagination.
 * Returns an array of handle strings (e.g. ["velvet-bridal-lehenga", "silk-saree-1"]).
 * On failure, returns an empty array.
 */
async function fetchAllProductHandles() {
  const handles = [];
  let cursor = null;
  let hasNextPage = true;
  const MAX_PAGES = 50; // safety limit — 250 * 50 = 12,500 products

  try {
    let page = 0;
    while (hasNextPage && page < MAX_PAGES) {
      page++;
      console.log(
        `[generate-routes] Fetching product handles page ${page} (cursor: ${cursor || 'start'})...`
      );

      const resp = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: GET_ALL_PRODUCT_HANDLES_QUERY,
          variables: { first: 250, after: cursor },
        }),
      });

      if (!resp.ok) {
        console.warn(
          `[generate-routes] Shopify API returned ${resp.status} ${resp.statusText} — stopping pagination`
        );
        break;
      }

      const json = await resp.json();

      if (json.errors) {
        console.warn(
          `[generate-routes] Shopify GraphQL errors: ${JSON.stringify(json.errors)} — stopping pagination`
        );
        break;
      }

      const data = json?.data?.products;
      if (!data) {
        console.warn('[generate-routes] Unexpected response shape — stopping pagination');
        break;
      }

      for (const edge of data.edges || []) {
        if (edge.node?.handle) {
          handles.push(edge.node.handle);
        }
      }

      hasNextPage = data.pageInfo?.hasNextPage ?? false;
      cursor = data.pageInfo?.endCursor ?? null;
    }
  } catch (err) {
    console.warn(`[generate-routes] Shopify fetch failed: ${err.message}`);
  }

  console.log(`[generate-routes] Fetched ${handles.length} product handles from Shopify`);
  return handles;
}

// ─── Blog Slug Parsing ──────────────────────────────────────────────────────

/**
 * Parse blogPosts.ts to extract slug strings.
 * Since this is a CJS script, we can't import TypeScript directly.
 * Instead, we regex-match slug patterns like:  slug: 'some-slug-here'
 * Returns an array of slug strings.
 */
function parseBlogSlugs() {
  if (!fs.existsSync(BLOG_POSTS_TS)) {
    console.warn(
      `[generate-routes] Blog posts file not found at ${BLOG_POSTS_TS} — no blog routes will be included`
    );
    return [];
  }

  const content = fs.readFileSync(BLOG_POSTS_TS, 'utf8');

  // Match: slug: 'some-slug' or slug: "some-slug"
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  const slugs = [];
  let match;

  while ((match = slugRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }

  console.log(`[generate-routes] Parsed ${slugs.length} blog slugs from blogPosts.ts`);
  return slugs;
}

// ─── Output Generation ──────────────────────────────────────────────────────

/**
 * Generate the TypeScript module content for src/lib/autoRoutes.ts
 */
function generateAutoRoutesTs(routes) {
  const routeLines = routes.map((r) => `  '${r}',`).join('\n');

  return `// AUTO-GENERATED by scripts/generate-routes.cjs — do not edit manually.
// Regenerated on each build via: node scripts/generate-routes.cjs

export const PRERENDERED_ROUTES: Set<string> = new Set([
${routeLines}
]);
`;
}

/**
 * Write both output files.
 */
function writeOutputFiles(routes) {
  // Ensure parent directories exist
  const autoRoutesDir = path.dirname(AUTO_ROUTES_TS);
  const routesJsonDir = path.dirname(ROUTES_JSON);

  if (!fs.existsSync(autoRoutesDir)) {
    fs.mkdirSync(autoRoutesDir, { recursive: true });
  }
  if (!fs.existsSync(routesJsonDir)) {
    fs.mkdirSync(routesJsonDir, { recursive: true });
  }

  // Write src/lib/autoRoutes.ts
  const tsContent = generateAutoRoutesTs(routes);
  fs.writeFileSync(AUTO_ROUTES_TS, tsContent, 'utf8');
  console.log(
    `[generate-routes] Written ${AUTO_ROUTES_TS} (${routes.length} routes)`
  );

  // Write scripts/routes.json
  const jsonContent = JSON.stringify(routes, null, 2) + '\n';
  fs.writeFileSync(ROUTES_JSON, jsonContent, 'utf8');
  console.log(
    `[generate-routes] Written ${ROUTES_JSON} (${routes.length} routes)`
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('[generate-routes] Generating prerendered routes list...');

  // 1. Fetch product handles from Shopify
  let productHandles = [];
  if (SHOPIFY_STOREFRONT_TOKEN) {
    productHandles = await fetchAllProductHandles();
  } else {
    console.warn(
      '[generate-routes] No Shopify token — skipping product handle fetch'
    );
  }

  // 2. Parse blog slugs from blogPosts.ts
  const blogSlugs = parseBlogSlugs();

  // 3. Build combined routes list
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
  // Static routes first (preserving order), then blog index, then blog posts sorted
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

  // 4. Write output files (even if Shopify fetch failed, we write with what we have)
  writeOutputFiles(finalRoutes);

  const blogCount = finalRoutes.filter((r) => r.startsWith('/blog/')).length;
  console.log(
    `[generate-routes] Done: ${STATIC_ROUTES.length} static + ${blogCount} blog = ${finalRoutes.length} total routes`
  );
  console.log(
    `[generate-routes] Note: ${productHandles.length} product handles fetched — prerenderManifest.ts is written by prerender.js`
  );
}

main().catch((err) => {
  console.error('[generate-routes] Fatal error:', err);
  // Still attempt to write files with just static routes as ultimate fallback
  try {
    console.warn(
      '[generate-routes] Attempting fallback write with static routes only...'
    );
    writeOutputFiles(STATIC_ROUTES);
  } catch (writeErr) {
    console.error('[generate-routes] Fallback write also failed:', writeErr);
  }
  // Don't fail the build — prerender.js will fail loudly if products are missing
  process.exit(0);
});
