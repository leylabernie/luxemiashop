#!/usr/bin/env node
/**
 * Generate the prerendered routes list for middleware.ts dynamically.
 *
 * This script reads the existing routes from:
 * 1. Static routes from App.tsx
 * 2. Blog slugs from src/data/blogPosts.ts
 * 3. Product handles from Shopify (if API is available)
 *
 * Output: Writes a routes manifest file at scripts/prerender-routes.json
 * that can be imported by middleware.ts or the prerender script.
 *
 * Run: node scripts/generate-routes-manifest.cjs
 */

const fs = require('fs');
const path = require('path');

const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';

// Static routes that are always prerendered
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
  '/privacy-policy',
  '/terms',
  '/terms-of-service',
  '/press',
  '/order-confirmation',
];

// Blog slugs — keep in sync with src/data/blogPosts.ts
const BLOG_SLUGS = [
  'sharara-suit-guide-2026-styles-fabrics',
  'pakistani-suits-anarkali-shopping-guide',
  'style-lehenga-choli-every-wedding-event',
  'indian-wedding-season-2026-outfit-guide',
  'fabric-guide-indian-ethnic-wear-georgette-silk-chiffon',
  'indian-wedding-dress-complete-guide',
  'red-bridal-lehenga-trends-2026',
  'designer-wedding-dress-under-50000',
  'wedding-guest-outfit-ideas',
  'saree-draping-styles-every-occasion',
  'indian-wedding-trends-2026',
  'lehenga-color-for-dark-skin',
  'wedding-saree-for-mother-of-bride',
  'designer-wedding-dress-under-500',
  'nri-wedding-ethnic-wear-trends-2026',
  'buy-authentic-indian-sarees-online-usa-uk',
  'styling-indian-ethnic-wear-festive-occasions-abroad',
];

async function fetchProductHandles() {
  if (!SHOPIFY_STOREFRONT_TOKEN) {
    console.log('[routes-manifest] No SHOPIFY_STOREFRONT_TOKEN, skipping product handles');
    return [];
  }

  const handles = [];
  let cursor = null;
  let hasNextPage = true;

  const query = `
    query GetProductHandles($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node { handle } }
      }
    }
  `;

  while (hasNextPage) {
    try {
      const variables = { first: 250 };
      if (cursor) variables.after = cursor;

      const response = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) break;

      const data = await response.json();
      const edges = data?.data?.products?.edges || [];
      handles.push(...edges.map(e => e.node.handle));

      hasNextPage = data?.data?.products?.pageInfo?.hasNextPage ?? false;
      cursor = data?.data?.products?.pageInfo?.endCursor ?? null;
    } catch (error) {
      console.error('[routes-manifest] Error fetching product handles:', error);
      break;
    }
  }

  console.log(`[routes-manifest] Fetched ${handles.length} product handles from Shopify`);
  return handles;
}

async function main() {
  console.log('[routes-manifest] Generating prerender routes manifest...');

  const blogRoutes = BLOG_SLUGS.map(slug => `/blog/${slug}`);
  const productHandles = await fetchProductHandles();
  const productRoutes = productHandles.map(handle => `/product/${handle}`);

  const allRoutes = [
    ...STATIC_ROUTES,
    ...blogRoutes,
    // NOTE: product routes are handled by dynamic SSR in middleware,
    // but we include them in the manifest for sitemap generation
  ];

  const manifest = {
    staticRoutes: STATIC_ROUTES,
    blogRoutes,
    productRoutes,
    allRoutes,
    generatedAt: new Date().toISOString(),
  };

  const outputPath = path.resolve(__dirname, 'prerender-routes.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`[routes-manifest] Written ${allRoutes.length} routes to ${outputPath}`);
  console.log(`[routes-manifest] Static: ${STATIC_ROUTES.length}, Blog: ${blogRoutes.length}, Products: ${productRoutes.length}`);
}

main().catch(err => {
  console.error('[routes-manifest] Error:', err);
  process.exit(0); // Don't fail the build
});
