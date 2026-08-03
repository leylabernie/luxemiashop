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
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
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
  // NOTE: '/products' removed — it 301-redirects to /collections.
  // Including redirected URLs in the sitemap is a GSC error ("Page with redirect").
  { loc: '/about', changefreq: 'monthly', priority: '0.6' },
  { loc: '/lookbook', changefreq: 'monthly', priority: '0.7' },
  { loc: '/lehengas', changefreq: 'daily', priority: '0.9' },
  { loc: '/sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/jewelry', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/silk-sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/kanchipuram-sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/bridal-party-outfits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/bollywood-inspired-indian-outfits', changefreq: 'daily', priority: '0.9' },
  { loc: '/suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/menswear', changefreq: 'daily', priority: '0.9' },
  { loc: '/indowestern', changefreq: 'daily', priority: '0.8' },
  { loc: '/new-arrivals', changefreq: 'daily', priority: '0.8' },
  { loc: '/bestsellers', changefreq: 'weekly', priority: '0.7' },
  { loc: '/nri', changefreq: 'monthly', priority: '0.8' },
  { loc: '/indian-ethnic-wear-usa', changefreq: 'monthly', priority: '0.8' },
  // '/indian-ethnic-wear-canada' is intentionally omitted because it 301s to
  // /nri. Sitemaps must contain final, canonical 200 URLs only.
  { loc: '/wedding-party-orders', changefreq: 'monthly', priority: '0.8' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5' },
  { loc: '/shipping', changefreq: 'monthly', priority: '0.4' },
  { loc: '/returns', changefreq: 'monthly', priority: '0.4' },
  { loc: '/size-guide', changefreq: 'monthly', priority: '0.5' },
  { loc: '/sizing-measurements-guide', changefreq: 'monthly', priority: '0.8' },
  { loc: '/care-guide', changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/authors/luxemia-editorial-team', changefreq: 'monthly', priority: '0.4' },
  { loc: '/press', changefreq: 'monthly', priority: '0.5' },
  // Occasion landing pages
  { loc: '/collections/diwali-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/wedding-guest-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/mehendi-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/eid-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/navratri-outfits', changefreq: 'weekly', priority: '0.9' },
  // Programmatic SEO combo pages — 25 long-tail landing pages
  { loc: '/maroon-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/emerald-green-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/royal-blue-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/pink-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/purple-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/wine-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/navy-blue-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/maroon-lehenga-for-reception', changefreq: 'weekly', priority: '0.8' },
  { loc: '/black-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/pastel-lehenga-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/anarkali-suit-for-mother-of-bride', changefreq: 'weekly', priority: '0.8' },
  { loc: '/lehenga-for-bridesmaid', changefreq: 'weekly', priority: '0.8' },
  { loc: '/anarkali-suit-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/saree-for-mother-of-bride', changefreq: 'weekly', priority: '0.8' },
  { loc: '/lehenga-for-mother-of-bride', changefreq: 'weekly', priority: '0.8' },
  { loc: '/sherwani-for-groom', changefreq: 'weekly', priority: '0.8' },
  { loc: '/kurta-for-groom-brother', changefreq: 'weekly', priority: '0.8' },
  { loc: '/sharara-for-bride-sister', changefreq: 'weekly', priority: '0.8' },
  { loc: '/georgette-saree-for-reception', changefreq: 'weekly', priority: '0.8' },
  { loc: '/banarasi-silk-saree-for-wedding', changefreq: 'weekly', priority: '0.8' },
  { loc: '/kanjivaram-saree-for-wedding', changefreq: 'weekly', priority: '0.8' },
  { loc: '/chiffon-saree-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/silk-saree-for-festival', changefreq: 'weekly', priority: '0.8' },
  { loc: '/organza-saree-for-engagement', changefreq: 'weekly', priority: '0.8' },
  { loc: '/georgette-saree-for-wedding-guest', changefreq: 'weekly', priority: '0.8' },
];


// Parse the compact published blogPosts.ts source for sitemap inclusion.
function parseBlogSlugs() {
  const blogPostsPath = path.join(__dirname, '..', 'src', 'data', 'blogPosts.ts');
  const files = [blogPostsPath];
  const slugs = [];
  const excludedSlugs = new Set();
  const publishedSlugs = new Set();

  if (fs.existsSync(blogPostsPath)) {
    const blogSource = fs.readFileSync(blogPostsPath, 'utf8');
    const excludedBlock = blogSource.match(/UNPUBLISHED_BLOG_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/);
    if (excludedBlock) {
      const valueRegex = /['"]([^'"]+)['"]/g;
      let excludedMatch;
      while ((excludedMatch = valueRegex.exec(excludedBlock[1])) !== null) {
        excludedSlugs.add(excludedMatch[1]);
      }
    }
    const publishedBlock = blogSource.match(/PUBLISHED_BLOG_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/);
    if (publishedBlock) {
      const valueRegex = /['"]([^'"]+)['"]/g;
      let publishedMatch;
      while ((publishedMatch = valueRegex.exec(publishedBlock[1])) !== null) {
        publishedSlugs.add(publishedMatch[1]);
      }
    }
  }
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) { continue; }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const slugRegex = /["']?slug["']?\s*:\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = slugRegex.exec(fileContent)) !== null) {
      if (publishedSlugs.has(match[1]) && !excludedSlugs.has(match[1])) {
        slugs.push(match[1]);
      }
    }
  }
  console.log(`[sitemap] Parsed ${slugs.length} allowlisted blog slugs`);
  return slugs.map(slug => `/blog/${slug}`);
}

// Blog posts — auto-parsed from src/data/blogPosts.ts
const blogPosts = parseBlogSlugs();

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

// ─── URL Liveness Check ───────────────────────────────────────────────────────
// HEAD-checks a URL against the live site to ensure it returns 200 OK. Confirmed
// redirects and 404/410 responses are excluded. Timeouts, rate limits, and 5xx
// responses are treated as inconclusive and kept in the sitemap so a transient
// build-network problem cannot erase hundreds of valid products.
//
// Skip the check entirely by setting SKIP_SITEMAP_LIVENESS_CHECK=1 (useful for
// local dev or first-time builds where the site isn't live yet).
async function isUrlLive(url) {
  if (process.env.SKIP_SITEMAP_LIVENESS_CHECK === '1') return true;

  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const resp = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'LuxeMia-Sitemap-Build/1.0' },
      });

      if (resp.status === 200) return true;
      if ((resp.status >= 300 && resp.status < 400) || resp.status === 404 || resp.status === 410) {
        return false;
      }

      console.warn(
        `[sitemap] Inconclusive liveness response ${resp.status} for ${url} ` +
        `(attempt ${attempt}/${MAX_ATTEMPTS})`
      );
    } catch (error) {
      console.warn(
        `[sitemap] Inconclusive liveness check for ${url} ` +
        `(attempt ${attempt}/${MAX_ATTEMPTS}): ${error.message}`
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  console.warn(`[sitemap] Keeping ${url} after inconclusive liveness checks.`);
  return true;
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
  // Blog posts — uses the compact published blogPosts source
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

  // Fail before publishing a sitemap that lists an exact Vercel redirect
  // source. This catches config drift such as the former
  // /indian-ethnic-wear-canada entry, which returned 301 from the sitemap.
  const vercelConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../vercel.json'), 'utf8')
  );
  const exactRedirectSources = new Set(
    (vercelConfig.redirects || [])
      .map((redirect) => redirect.source)
      .filter((source) => !source.includes(':') && !source.includes('('))
  );
  const redirectConflicts = staticPages
    .map((page) => page.loc)
    .filter((loc) => exactRedirectSources.has(loc));
  if (redirectConflicts.length > 0) {
    throw new Error(
      `Sitemap contains redirected URL(s): ${redirectConflicts.join(', ')}`
    );
  }

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

  // ── Liveness filter ────────────────────────────────────────────────────────
  // HEAD-check every product URL to ensure it returns 200 OK. Confirmed
  // redirects/404s are excluded from the sitemap. Because every product in
  // this loop came from Shopify's active Storefront API, an HTTP failure does
  // not prove deletion and must never auto-create a 410 Gone rule.
  //
  // Skip with SKIP_SITEMAP_LIVENESS_CHECK=1 for local dev / first-time builds.
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const liveProducts = [];
  const excludedHandles = [];

  if (process.env.SKIP_SITEMAP_LIVENESS_CHECK === '1') {
    console.log('[sitemap] SKIP_SITEMAP_LIVENESS_CHECK=1 — skipping HEAD checks.');
    liveProducts.push(...products);
  } else {
    console.log(`[sitemap] HEAD-checking ${products.length} product URLs (this may take a few minutes)...`);
    const BATCH_SIZE = 10;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (p) => {
          const url = `${SITE_URL}/product/${p.handle}`;
          const live = await isUrlLive(url);
          return { product: p, live };
        })
      );
      for (const r of results) {
        if (r.live) liveProducts.push(r.product);
        else excludedHandles.push(r.product.handle);
      }
      const done = Math.min(i + BATCH_SIZE, products.length);
      if (done % 50 === 0 || done === products.length) {
        console.log(
          `[sitemap] Validated ${done}/${products.length} ` +
          `(${excludedHandles.length} confirmed non-200 so far)`
        );
      }
    }
  }

  if (excludedHandles.length > 0) {
    console.warn(
      `[sitemap] Excluded ${excludedHandles.length} confirmed redirect/404 product URLs from sitemap.`
    );
    if (excludedHandles.length <= 30) {
      console.warn(`[sitemap] Excluded handles: ${excludedHandles.join(', ')}`);
    } else {
      console.warn(
        `[sitemap] First 20 excluded handles: ${excludedHandles.slice(0, 20).join(', ')}... ` +
        `(+${excludedHandles.length - 20} more)`
      );
    }
  }

  // Active Storefront API products are never automatically converted to 410.
  const deadListPath = path.join(distDir, 'dead-product-handles.json');
  fs.writeFileSync(deadListPath, JSON.stringify([], null, 2));

  const sitemap = generateSitemap(liveProducts);

  // Write to dist/ (Vercel serves static files from dist/)
  const distPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distPath, sitemap, 'utf8');
  console.log(`[sitemap] Written sitemap to ${distPath} (${(sitemap.length / 1024).toFixed(1)} KB, ${liveProducts.length} live products, ${staticPages.length + blogPosts.length} static/blog URLs)`);

  // Also write to public/ for dev and fallback
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  const publicPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicPath, sitemap, 'utf8');
  console.log(`[sitemap] Also written to ${publicPath}`);
}

main().catch(err => {
  console.error('[sitemap] Fatal error:', err);
  console.error('[sitemap] Build stopped to prevent publishing an invalid sitemap.');
  process.exit(1);
});
