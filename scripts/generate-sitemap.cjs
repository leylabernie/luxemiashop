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

const SITE_URL = 'https://luxemia.shop';
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
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
  { loc: '/products', changefreq: 'daily', priority: '0.9' },
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
  { loc: '/virtual-try-on', changefreq: 'monthly', priority: '0.7' },
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
  { loc: '/collections/bridal-lehengas', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/wedding-sarees', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/reception-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/party-wear-lehengas', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/designer-sarees', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/silk-sarees', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/pakistani-suits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/anarkali-suits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/salwar-kameez', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/sharara-suits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/gharara-suits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/indo-western-dresses', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/kurta-sets', changefreq: 'weekly', priority: '0.9' },
];

// Blog posts
const blogPosts = [
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
  '/blog/how-to-choose-perfect-lehenga-wedding-2026',
  '/blog/lehenga-vs-sharara-vs-anarkali-comparison',
  '/blog/best-lehenga-colors-for-indian-skin-tone',
  '/blog/shipping-indian-clothes-usa-uk-canada-nri-guide',
  '/blog/unstitched-vs-ready-to-wear-vs-made-to-measure',
];

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

function generateSitemap(products) {
  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  // Static pages
  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // Blog posts
  for (const blogPath of blogPosts) {
    urls.push(`  <url>
    <loc>${SITE_URL}${blogPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Product pages with images
  for (const product of products) {
    const loc = `${SITE_URL}/product/${escapeXml(product.handle)}`;
    const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : today;
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
  try {
    products = await fetchAllProducts();
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

  const sitemap = generateSitemap(products);

  // Write to dist/ (Vercel serves static files from dist/)
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  const distPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distPath, sitemap, 'utf8');
  console.log(`[sitemap] Written sitemap to ${distPath} (${(sitemap.length / 1024).toFixed(1)} KB, ${products.length} products, ${staticPages.length + blogPosts.length} static/blog URLs)`);

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
