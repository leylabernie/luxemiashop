#!/usr/bin/env node
/**
 * Auto-generate the prerendered routes list for LuxeMia.
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
  'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const AUTO_ROUTES_TS = path.join(PROJECT_ROOT, 'src/lib/autoRoutes.ts');
const ROUTES_JSON = path.join(PROJECT_ROOT, 'scripts/routes.json');
const BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/blogPosts.ts');
const RECOVERED_BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/recoveredBlogPosts.ts');

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
  '/jewelry',
  '/blog',
  '/collections',
  '/collections/silk-sarees',
  '/collections/kanchipuram-sarees',
  '/collections/manthrakodi-sarees',
  '/collections/bridal-party-outfits',
  '/collections/bollywood-inspired-indian-outfits',
  '/collections/customizable-indian-outfits',
  // Restored commercial collection pages — keep these in the middleware manifest
  // so the dedicated prerendered HTML is served as a direct, indexable response.
  '/collections/sharara-suits',
  '/collections/gharara-suits',
  '/collections/anarkali-suits',
  '/collections/bridal-lehengas',
  '/collections/wedding-sarees',
  '/collections/designer-sarees',
  '/collections/party-wear-lehengas',
  '/about',
  '/sitemap',
  '/new-arrivals',
  '/indowestern',
  '/nri',
  '/indian-ethnic-wear-usa',
  '/size-guide',
  '/care-guide',
  '/faq',
  '/shipping',
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
  // Occasion landing pages — high buyer-intent SEO pages
  '/collections/diwali-outfits',
  '/collections/wedding-guest-outfits',
  '/collections/mehendi-outfits',
  '/collections/eid-outfits',
  '/collections/navratri-outfits',
  '/collections/haldi-outfits',
  // Blog topic hubs — each route must contain at least one published article
  '/blog/attires',
  '/blog/motifs-embroideries',
  '/blog/weddings-festivals',
  '/blog/how-to-care',
  '/blog/designer-profiles',
  '/blog/cultural-context',
  // Factual organizational author page
  '/authors/luxemia-editorial-team',
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
 * Throws on any incomplete response so a partial source cannot be published.
 */
async function fetchAllProductHandles() {
  const handles = [];
  let cursor = null;
  let hasNextPage = true;
  const MAX_PAGES = 50; // safety limit — 250 * 50 = 12,500 products

  let page = 0;
  try {
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
        throw new Error(`Shopify API returned ${resp.status} ${resp.statusText}`);
      }

      const json = await resp.json();

      if (Array.isArray(json.errors) && json.errors.length > 0) {
        throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
      }

      const data = json?.data?.products;
      if (!data || !Array.isArray(data.edges) || typeof data.pageInfo?.hasNextPage !== 'boolean') {
        throw new Error('Shopify returned an unexpected products response shape');
      }

      for (const edge of data.edges) {
        if (edge.node?.handle) {
          handles.push(edge.node.handle);
        }
      }

      hasNextPage = data.pageInfo.hasNextPage;
      const nextCursor = data.pageInfo.endCursor ?? null;
      if (hasNextPage && (!nextCursor || nextCursor === cursor)) {
        throw new Error('Shopify pagination did not provide a new end cursor');
      }
      cursor = nextCursor;
    }
  } catch (err) {
    throw new Error(`Shopify product source failed on page ${page}: ${err.message}`);
  }

  if (hasNextPage) {
    throw new Error(
      `Shopify product source exceeded the ${MAX_PAGES}-page safety limit; refusing partial output`
    );
  }
  if (handles.length === 0) {
    throw new Error('Shopify product source returned zero handles; refusing partial output');
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
  const files = [BLOG_POSTS_TS, RECOVERED_BLOG_POSTS_TS];
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
  if (!SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error(
      'SHOPIFY_STOREFRONT_TOKEN is not set; refusing to generate a potentially incomplete route manifest'
    );
  }
  const productHandles = await fetchAllProductHandles();

  // 2. Parse blog slugs from the published blogPosts.ts source
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

  // 4. Write output files only after every required source completed successfully.
  writeOutputFiles(finalRoutes);

  const blogCount = finalRoutes.filter((r) => r.startsWith('/blog/')).length;
  console.log(
    `[generate-routes] Done: ${STATIC_ROUTES.length} configured static + ${blogCount} blog = ${finalRoutes.length} unique routes`
  );
  console.log(
    `[generate-routes] Note: ${productHandles.length} product handles fetched — prerenderManifest.ts is written by prerender.js`
  );
}

main().catch((err) => {
  console.error('[generate-routes] Fatal error:', err);
  process.exitCode = 1;
});
