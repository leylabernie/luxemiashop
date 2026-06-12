#!/usr/bin/env node
/**
 * Generate dynamic sitemap.xml with ALL active Shopify product URLs.
 *
 * This script fetches all products from the Shopify Storefront API and
 * generates a complete sitemap.xml including:
 * - All static pages (home, category, info, legal, blog)
 * - All product pages from Shopify (with product images)
 * - All blog post URLs
 *
 * Run: node scripts/generate-sitemap.cjs
 * Automatically run during: npm run build
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SITE_URL = 'https://luxemia.shop';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ROUTES_JSON_PATH = path.resolve(__dirname, 'routes.json');
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
const FALLBACK_STATIC_LASTMOD = '2026-06-11';
if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.warn('[sitemap] WARNING: SHOPIFY_STOREFRONT_TOKEN env var is not set. Product URLs will be missing from sitemap.');
}

// Minimal query — we only need handle, title, image, and updatedAt for sitemap
const ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          title
          updatedAt
          productType
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Static Pages ──────────────────────────────────────────────────────────

const staticPages = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/collections', changefreq: 'daily', priority: '0.9' },
  { loc: '/brand-story', changefreq: 'monthly', priority: '0.6' },
  { loc: '/lookbook', changefreq: 'monthly', priority: '0.7' },
  { loc: '/lehengas', changefreq: 'daily', priority: '0.9' },
  { loc: '/sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/menswear', changefreq: 'daily', priority: '0.9' },
  { loc: '/indowestern', changefreq: 'daily', priority: '0.8' },
  { loc: '/new-arrivals', changefreq: 'daily', priority: '0.8' },
  { loc: '/bestsellers', changefreq: 'weekly', priority: '0.7' },
  { loc: '/nri', changefreq: 'monthly', priority: '0.8' },
  { loc: '/nri/usa', changefreq: 'monthly', priority: '0.8' },
  { loc: '/nri/canada', changefreq: 'monthly', priority: '0.8' },
  { loc: '/indian-ethnic-wear-usa', changefreq: 'monthly', priority: '0.8' },
  { loc: '/indian-ethnic-wear-canada', changefreq: 'monthly', priority: '0.8' },
  { loc: '/artisans', changefreq: 'monthly', priority: '0.6' },
  { loc: '/sustainability', changefreq: 'monthly', priority: '0.6' },
  { loc: '/style-consultation', changefreq: 'monthly', priority: '0.7' },
  { loc: '/style-quiz', changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5' },
  { loc: '/shipping', changefreq: 'monthly', priority: '0.4' },
  { loc: '/returns', changefreq: 'monthly', priority: '0.4' },
  { loc: '/size-guide', changefreq: 'monthly', priority: '0.5' },
  { loc: '/care-guide', changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/press', changefreq: 'monthly', priority: '0.5' },
];

function loadCanonicalRoutePaths() {
  const routePaths = JSON.parse(fs.readFileSync(ROUTES_JSON_PATH, 'utf8'));
  if (!Array.isArray(routePaths)) {
    throw new Error('[sitemap] scripts/routes.json must contain a route path array.');
  }

  return routePaths;
}

const canonicalRoutePaths = loadCanonicalRoutePaths();

function loadCanonicalCollectionPaths() {
  return canonicalRoutePaths.filter((routePath) => (
    typeof routePath === 'string'
    && routePath.startsWith('/collections/')
    && routePath.split('/').length === 3
    && routePath !== '/collections/all'
  ));
}

function loadCanonicalBlogPaths() {
  return canonicalRoutePaths.filter((routePath) => (
    typeof routePath === 'string'
    && routePath.startsWith('/blog/')
    && routePath.split('/').length === 3
  ));
}

const collectionPages = loadCanonicalCollectionPaths();
const blogPosts = loadCanonicalBlogPaths();

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function forceJpeg(url) {
  if (!url) return url;
  if (url.includes('cdn.shopify.com') || url.includes('myshopify.com')) {
    const clean = url.replace(/[&?]format=\w+/g, '');
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}format=jpg&width=1200`;
  }
  return url;
}

function isRobotsBlockedPath(routePath) {
  return routePath === '/virtual-try-on'
    || routePath === '/products'
    || routePath.startsWith('/products/')
    || routePath.startsWith('/blog/tag/')
    || routePath.startsWith('/blog/tags/')
    || routePath.startsWith('/tag/')
    || routePath === '/admin'
    || routePath.startsWith('/admin/')
    || routePath === '/account'
    || routePath.startsWith('/account/')
    || routePath === '/auth'
    || routePath.startsWith('/auth/')
    || routePath === '/wishlist'
    || routePath.startsWith('/wishlist/')
    || routePath === '/cart'
    || routePath.startsWith('/cart/')
    || routePath === '/checkout'
    || routePath.startsWith('/checkout/')
    || routePath === '/order-confirmation'
    || routePath.startsWith('/order-confirmation/')
    || routePath.startsWith('/api/')
    || routePath === '/collections/all'
    || routePath === '/blogs'
    || routePath.startsWith('/blogs/')
    || routePath.startsWith('/pages/');
}

const routeSourceFiles = {
  '/': ['src/pages/Index.tsx', 'src/lib/seoMetadata.ts', 'index.html'],
  '/collections': ['src/pages/Collections.tsx', 'src/lib/seoMetadata.ts'],
  '/brand-story': ['src/pages/BrandStory.tsx', 'src/lib/seoMetadata.ts'],
  '/lookbook': ['src/pages/Lookbook.tsx', 'src/lib/seoMetadata.ts'],
  '/lehengas': ['src/pages/Lehengas.tsx', 'src/lib/collectionSeoConfig.ts', 'src/lib/seoMetadata.ts'],
  '/sarees': ['src/pages/Sarees.tsx', 'src/lib/collectionSeoConfig.ts', 'src/lib/seoMetadata.ts'],
  '/suits': ['src/pages/Suits.tsx', 'src/lib/collectionSeoConfig.ts', 'src/lib/seoMetadata.ts'],
  '/menswear': ['src/pages/Menswear.tsx', 'src/lib/collectionSeoConfig.ts', 'src/lib/seoMetadata.ts'],
  '/indowestern': ['src/pages/Indowestern.tsx', 'src/lib/seoMetadata.ts'],
  '/new-arrivals': ['src/pages/NewArrivals.tsx', 'src/lib/seoMetadata.ts'],
  '/bestsellers': ['src/pages/Bestsellers.tsx', 'src/lib/seoMetadata.ts'],
  '/nri': ['src/pages/nri/NRIGeneral.tsx', 'src/lib/seoMetadata.ts'],
  '/nri/usa': ['src/pages/nri/USA.tsx', 'src/lib/seoMetadata.ts'],
  '/nri/canada': ['src/pages/nri/Canada.tsx', 'src/lib/seoMetadata.ts'],
  '/indian-ethnic-wear-usa': ['src/pages/nri/USA.tsx', 'src/lib/seoMetadata.ts'],
  '/indian-ethnic-wear-canada': ['src/pages/nri/Canada.tsx', 'src/lib/seoMetadata.ts'],
  '/artisans': ['src/pages/Artisans.tsx', 'src/lib/seoMetadata.ts'],
  '/sustainability': ['src/pages/Sustainability.tsx', 'src/lib/seoMetadata.ts'],
  '/style-consultation': ['src/pages/StyleConsultation.tsx', 'src/lib/seoMetadata.ts'],
  '/style-quiz': ['src/pages/StyleQuiz.tsx', 'src/lib/seoMetadata.ts'],
  '/contact': ['src/pages/Contact.tsx', 'src/lib/seoMetadata.ts'],
  '/faq': ['src/pages/FAQ.tsx', 'src/lib/seoMetadata.ts'],
  '/shipping': ['src/pages/Shipping.tsx', 'src/lib/seoMetadata.ts'],
  '/returns': ['src/pages/Returns.tsx', 'src/lib/seoMetadata.ts'],
  '/size-guide': ['src/pages/SizeGuide.tsx', 'src/lib/seoMetadata.ts'],
  '/care-guide': ['src/pages/CareGuide.tsx', 'src/lib/seoMetadata.ts'],
  '/privacy': ['src/pages/Privacy.tsx', 'src/lib/seoMetadata.ts'],
  '/terms': ['src/pages/Terms.tsx', 'src/lib/seoMetadata.ts'],
  '/blog': ['src/pages/Blog.tsx', 'src/data/blogPosts.ts', 'src/lib/seoMetadata.ts'],
  '/press': ['src/pages/Press.tsx', 'src/lib/seoMetadata.ts'],
};

const routeLastmodCache = new Map();

function sourceFilesForRoute(routePath) {
  if (routeSourceFiles[routePath]) return routeSourceFiles[routePath];
  if (routePath.startsWith('/collections/')) {
    return ['src/lib/collectionSeoConfig.ts', 'src/pages/BuyerIntentCollectionPage.tsx', 'src/lib/seoMetadata.ts'];
  }
  if (routePath.startsWith('/blog/')) {
    return ['src/data/blogPosts.ts', 'src/pages/BlogPost.tsx', 'src/lib/seoMetadata.ts'];
  }
  return ['src/lib/seoMetadata.ts', 'src/App.tsx'];
}

function getGitLastmodForFiles(files) {
  const existingFiles = files.filter((file) => fs.existsSync(path.join(PROJECT_ROOT, file)));
  if (existingFiles.length === 0) return FALLBACK_STATIC_LASTMOD;

  const cacheKey = existingFiles.join('|');
  if (routeLastmodCache.has(cacheKey)) return routeLastmodCache.get(cacheKey);

  let lastmod = FALLBACK_STATIC_LASTMOD;
  try {
    const output = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...existingFiles], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(output)) {
      lastmod = output;
    }
  } catch {
    // Keep fixed fallback rather than pretending every URL changed today.
  }

  routeLastmodCache.set(cacheKey, lastmod);
  return lastmod;
}

function getRouteLastmod(routePath) {
  return getGitLastmodForFiles(sourceFilesForRoute(routePath));
}

function loadExistingProductUrlBlocks() {
  const existingSitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  if (!fs.existsSync(existingSitemapPath)) return [];

  const existingXml = fs.readFileSync(existingSitemapPath, 'utf8');
  const productBlocks = existingXml.match(/  <url>[\s\S]*?<loc>https:\/\/luxemia\.shop\/product\/[^<]+<\/loc>[\s\S]*?<\/url>/g) || [];
  console.log(`[sitemap] Preserving ${productBlocks.length} existing product URL blocks because Shopify token is unavailable`);
  return productBlocks;
}

// ─── Shopify API Fetch ──────────────────────────────────────────────────────

async function fetchAllProducts() {
  const allProducts = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const variables = { first: 250 };
    if (cursor) variables.after = cursor;

    console.log(`[sitemap] Fetching products page (cursor: ${cursor || 'start'})...`);

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: ALL_PRODUCTS_QUERY, variables }),
    });

    if (!response.ok) {
      console.error(`[sitemap] Shopify API error: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json();
    const edges = data?.data?.products?.edges || [];
    allProducts.push(...edges.map(e => e.node));

    const pageInfo = data?.data?.products?.pageInfo;
    hasNextPage = pageInfo?.hasNextPage ?? false;
    cursor = pageInfo?.endCursor ?? null;
  }

  console.log(`[sitemap] Fetched ${allProducts.length} total products from Shopify`);
  return allProducts;
}

// ─── Sitemap XML Generation ─────────────────────────────────────────────────

function generateSitemap(products, preservedProductUrlBlocks = []) {
  const urls = [];

  // Static pages
  for (const page of staticPages) {
    if (isRobotsBlockedPath(page.loc)) continue;
    const lastmod = getRouteLastmod(page.loc);
    urls.push(`  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // Collection pages
  for (const collectionPath of collectionPages) {
    if (isRobotsBlockedPath(collectionPath)) continue;
    const lastmod = getRouteLastmod(collectionPath);
    urls.push(`  <url>
    <loc>${SITE_URL}${collectionPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
  }

  // Blog posts
  for (const blogPath of blogPosts) {
    if (isRobotsBlockedPath(blogPath)) continue;
    const lastmod = getRouteLastmod(blogPath);
    urls.push(`  <url>
    <loc>${SITE_URL}${blogPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Product pages with images
  for (const product of products) {
    const loc = `${SITE_URL}/product/${escapeXml(product.handle)}`;
    const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : FALLBACK_STATIC_LASTMOD;
    const imageUrl = product.images?.edges?.[0]?.node?.url;
    const imageTitle = product.images?.edges?.[0]?.node?.altText || product.title;

    let imageTag = '';
    if (imageUrl) {
      imageTag = `
    <image:image>
      <image:loc>${escapeXml(forceJpeg(imageUrl))}</image:loc>
      <image:title>${escapeXml(imageTitle)}</image:title>
      <image:caption>${escapeXml(product.title)} - ${escapeXml(product.productType || 'Ethnic Wear')} | LuxeMia</image:caption>
    </image:image>`;
    }

    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageTag}
  </url>`);
  }

  if (products.length === 0 && preservedProductUrlBlocks.length > 0) {
    urls.push(...preservedProductUrlBlocks);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('[sitemap] Generating dynamic sitemap.xml...');

  let products;
  let preservedProductUrlBlocks = [];
  try {
    if (SHOPIFY_STOREFRONT_TOKEN) {
      products = await fetchAllProducts();
    } else {
      products = [];
      preservedProductUrlBlocks = loadExistingProductUrlBlocks();
    }
  } catch (error) {
    console.error('[sitemap] Failed to fetch from Shopify API:', error);
    // Fallback: use existing sitemap if API fails
    const existingSitemap = path.resolve(__dirname, '../public/sitemap.xml');
    if (fs.existsSync(existingSitemap)) {
      console.log('[sitemap] Using existing sitemap.xml from public/');
      const distDir = path.resolve(__dirname, '../dist');
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.copyFileSync(existingSitemap, path.join(distDir, 'sitemap.xml'));
      console.log('[sitemap] Copied existing sitemap to dist/sitemap.xml');
      return;
    }
    console.error('[sitemap] No fallback sitemap available. Generating minimal sitemap.');
    products = [];
  }

  const sitemap = generateSitemap(products, preservedProductUrlBlocks);

  // Write to dist/ (Vercel serves static files from dist/)
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  const distPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distPath, sitemap, 'utf8');
  console.log(`[sitemap] Written sitemap to ${distPath} (${(sitemap.length / 1024).toFixed(1)} KB, ${products.length} products, ${staticPages.length + collectionPages.length + blogPosts.length} static/collection/blog URLs)`);

  // Also write to public/ for dev and fallback
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  const publicPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicPath, sitemap, 'utf8');
  console.log(`[sitemap] Also written to ${publicPath}`);
}

main().catch(err => {
  console.error('[sitemap] Fatal error:', err);
  console.log('[sitemap] Sitemap generation failed, but build will continue.');
  process.exit(0);
});
