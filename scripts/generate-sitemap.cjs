#!/usr/bin/env node
/**
 * Generate sitemap.xml within the approved live URL inventory.
 *
 * This script fetches all products from the Shopify Storefront API and
 * generates a complete sitemap.xml including:
 * - All static pages (home, category, info, legal, blog)
 * - Approved product pages that are still present in Shopify and this build
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
const PRERENDER_DIR = path.resolve(__dirname, '../dist/_prerender');
const PRERENDER_MANIFEST_PATH = path.join(PRERENDER_DIR, 'manifest.json');
const APPROVED_INVENTORY_PATH = path.resolve(__dirname, 'approved-sitemap-inventory.json');
const MIN_APPROVED_SITEMAP_URL_COUNT = 786;
const HIDDEN_BILLING_PRODUCT_HANDLES = new Set([
  'luxemia-tailoring-saree-finishing-add-ons',
]);
if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.warn('[sitemap] WARNING: SHOPIFY_STOREFRONT_TOKEN is not set; safe sitemap generation will fail.');
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
  { loc: '/sitemap', changefreq: 'weekly', priority: '0.4' },
  { loc: '/lookbook', changefreq: 'monthly', priority: '0.7' },
  { loc: '/lehengas', changefreq: 'daily', priority: '0.9' },
  { loc: '/sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/jewelry', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/silk-sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/kanchipuram-sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/bridal-party-outfits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/bollywood-inspired-indian-outfits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/customizable-indian-outfits', changefreq: 'weekly', priority: '0.9' },
  // Restored high-intent commercial collection pages
  { loc: '/collections/sharara-suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/gharara-suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/anarkali-suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/bridal-lehengas', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/wedding-sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/designer-sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/party-wear-lehengas', changefreq: 'daily', priority: '0.9' },
  { loc: '/suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/menswear', changefreq: 'daily', priority: '0.9' },
  { loc: '/indowestern', changefreq: 'daily', priority: '0.8' },
  { loc: '/new-arrivals', changefreq: 'daily', priority: '0.8' },
  { loc: '/ready-to-ship', changefreq: 'daily', priority: '0.9' },
  { loc: '/nri', changefreq: 'monthly', priority: '0.8' },
  { loc: '/indian-ethnic-wear-usa', changefreq: 'monthly', priority: '0.8' },
  // '/indian-ethnic-wear-canada' is intentionally omitted because it 301s to
  // /nri. Sitemaps must contain final, canonical 200 URLs only.
  { loc: '/wedding-party-orders', changefreq: 'monthly', priority: '0.8' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5' },
  { loc: '/shipping', changefreq: 'monthly', priority: '0.4' },
  { loc: '/shipping/united-states', changefreq: 'monthly', priority: '0.6' },
  { loc: '/shipping/canada', changefreq: 'monthly', priority: '0.6' },
  { loc: '/shipping/united-kingdom', changefreq: 'monthly', priority: '0.6' },
  { loc: '/shipping/australia', changefreq: 'monthly', priority: '0.6' },
  { loc: '/pages/shipping-customs', changefreq: 'monthly', priority: '0.4' },
  { loc: '/returns', changefreq: 'monthly', priority: '0.4' },
  { loc: '/size-guide', changefreq: 'monthly', priority: '0.5' },
  { loc: '/sizing-measurements-guide', changefreq: 'monthly', priority: '0.8' },
  { loc: '/care-guide', changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/us-support', changefreq: 'monthly', priority: '0.5' },
  { loc: '/editorial-policy', changefreq: 'yearly', priority: '0.4' },
  { loc: '/review-policy', changefreq: 'yearly', priority: '0.4' },
  { loc: '/festive-wear', changefreq: 'weekly', priority: '0.8' },
  { loc: '/indian-wedding-guest-outfits', changefreq: 'weekly', priority: '0.8' },
  { loc: '/wedding-events', changefreq: 'weekly', priority: '0.8' },
  { loc: '/shop-by-fulfillment', changefreq: 'weekly', priority: '0.7' },
  { loc: '/shop-by-fulfillment/ready-to-ship', changefreq: 'daily', priority: '0.8' },
  { loc: '/shop-by-fulfillment/made-to-order', changefreq: 'weekly', priority: '0.7' },
  { loc: '/shop-by-fulfillment/customizable-outfits', changefreq: 'weekly', priority: '0.8' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/blog/indian-wedding-guest-attire', changefreq: 'monthly', priority: '0.7' },
  { loc: '/blog/indian-textiles-and-embroidery', changefreq: 'monthly', priority: '0.7' },
  { loc: '/blog/weddings-festivals', changefreq: 'monthly', priority: '0.7' },
  { loc: '/blog/fit-sizing-and-garment-care', changefreq: 'monthly', priority: '0.7' },
  { loc: '/blog/designer-profiles', changefreq: 'monthly', priority: '0.7' },
  { loc: '/blog/cultural-context', changefreq: 'monthly', priority: '0.7' },
  { loc: '/authors/luxemia-editorial-team', changefreq: 'monthly', priority: '0.4' },
  { loc: '/press', changefreq: 'monthly', priority: '0.5' },
  // Occasion landing pages
  { loc: '/collections/diwali-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/wedding-guest-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/mehendi-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/eid-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/navratri-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/haldi-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/navratri-chaniya-choli', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/garba-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/groomsmen-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/sangeet-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/reception-outfits', changefreq: 'weekly', priority: '0.9' },
];


// Parse the compact published blogPosts.ts source for sitemap inclusion.
function parseBlogSlugs() {
  const blogPostsPath = path.join(__dirname, '..', 'src', 'data', 'blogPosts.ts');
  const recoveredBlogPostsPath = path.join(__dirname, '..', 'src', 'data', 'recoveredBlogPosts.ts');
  const seoGrowthBlogPostsPath = path.join(__dirname, '..', 'src', 'data', 'seoGrowthBlogPosts.ts');
  const semanticCommerceGuidesPath = path.join(__dirname, '..', 'src', 'data', 'semanticCommerceGuides.ts');
  const files = [blogPostsPath, recoveredBlogPostsPath, seoGrowthBlogPostsPath, semanticCommerceGuidesPath];
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

function sanitizeProductTitle(value) {
  return (value || '')
    .replace(/^buy\s+/i, '')
    .replace(/\s*(?:[|–—-]\s*)?ready[-\s]?to[-\s]?ship\b/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?handcrafted indian bridal luxury\b/gi, '')
    .replace(/\bhandcrafted\s+/gi, '')
    .replace(/\s*[|–—-]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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

// ─── Built-output validation ────────────────────────────────────────────────

function prerenderFileForPath(routePath) {
  if (routePath === '/') return path.join(PRERENDER_DIR, 'index.html');
  return path.join(PRERENDER_DIR, `${routePath.slice(1)}.html`);
}

function expectedCanonical(routePath) {
  return routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
}

function validatePrerenderedRoute(routePath, manifestRoutes, exactRedirectSources) {
  if (exactRedirectSources.has(routePath)) {
    throw new Error(`Sitemap route is an exact redirect source: ${routePath}`);
  }
  if (!manifestRoutes.has(routePath)) {
    throw new Error(`Sitemap route is missing from the newly built prerender manifest: ${routePath}`);
  }

  const htmlPath = prerenderFileForPath(routePath);
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Sitemap route has no newly built prerender file: ${routePath}`);
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const canonicals = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1]);
  const robots = [...html.matchAll(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1]);

  if (canonicals.length !== 1 || canonicals[0] !== expectedCanonical(routePath)) {
    throw new Error(
      `Sitemap route must have one self-canonical (${expectedCanonical(routePath)}): ${routePath} ` +
      `(found ${canonicals.join(', ') || 'none'})`
    );
  }
  if (robots.length !== 1 || /noindex/i.test(robots[0])) {
    throw new Error(
      `Sitemap route must have one indexable robots directive: ${routePath} ` +
      `(found ${robots.join(', ') || 'none'})`
    );
  }
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
      throw new Error(`[sitemap] Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data?.errors?.length) {
      throw new Error(`[sitemap] Shopify GraphQL error: ${JSON.stringify(data.errors)}`);
    }
    const edges = data?.data?.products?.edges || [];
    allProducts.push(...edges.map(e => e.node));

    const pageInfo = data?.data?.products?.pageInfo;
    hasNextPage = pageInfo?.hasNextPage ?? false;
    cursor = pageInfo?.endCursor ?? null;
  }

  console.log(`[sitemap] Fetched ${allProducts.length} total products from Shopify`);
  return allProducts.filter((product) => !HIDDEN_BILLING_PRODUCT_HANDLES.has(product.handle));
}

// ─── Sitemap XML Generation ─────────────────────────────────────────────────

function generateSitemap(products) {
  const urls = [];

  // Static pages
  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }
  // Blog posts — uses the compact published blogPosts source
  for (const blogPath of blogPosts) {
    urls.push(`  <url>
    <loc>${SITE_URL}${blogPath}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Product pages with images
  for (const product of products) {
    const loc = `${SITE_URL}/product/${escapeXml(product.handle)}`;
    const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : null;
    const imageUrl = product.images?.edges?.[0]?.node?.url;
    const imageTitle = sanitizeProductTitle(product.images?.edges?.[0]?.node?.altText || product.title);

    let imageTag = '';
    if (imageUrl) {
      imageTag = `
    <image:image>
      <image:loc>${escapeXml(forceJpeg(imageUrl))}</image:loc>
      <image:title>${escapeXml(imageTitle)}</image:title>
      <image:caption>${escapeXml(sanitizeProductTitle(product.title))} - ${escapeXml(product.productType || 'Ethnic Wear')} | LuxeMia</image:caption>
    </image:image>`;
    }

    urls.push(`  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
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

function splitSitemap(combinedXml) {
  const blocks = combinedXml.match(/  <url>[\s\S]*?  <\/url>/g) || [];
  const groups = { products: [], collections: [], guides: [], pages: [], images: [] };
  const commercialRoots = new Set([
    '/lehengas', '/sarees', '/suits', '/menswear', '/jewelry', '/indowestern',
    '/new-arrivals', '/ready-to-ship', '/festive-wear',
    '/indian-wedding-guest-outfits', '/wedding-events', '/shop-by-fulfillment',
  ]);
  for (const block of blocks) {
    const loc = block.match(/<loc>https:\/\/luxemia\.shop([^<]*)<\/loc>/)?.[1] || '/';
    if (loc.startsWith('/product/')) {
      groups.products.push(block);
      if (block.includes('<image:image>')) groups.images.push(block);
    } else if (loc.startsWith('/blog') || loc.startsWith('/authors/')) {
      groups.guides.push(block);
    } else if (loc.startsWith('/collections') || commercialRoots.has(loc) || loc.startsWith('/shop-by-fulfillment/')) {
      groups.collections.push(block);
    } else {
      groups.pages.push(block);
    }
  }
  const urlset = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join('\n')}
</urlset>`;
  return Object.fromEntries(Object.entries(groups).map(([name, entries]) => [name, urlset(entries)]));
}

function generateSitemapIndex() {
  const generatedAt = new Date().toISOString().split('T')[0];
  const names = ['products', 'collections', 'guides', 'pages', 'images'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${names.map((name) => `  <sitemap><loc>${SITE_URL}/sitemap-${name}.xml</loc><lastmod>${generatedAt}</lastmod></sitemap>`).join('\n')}
</sitemapindex>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('[sitemap] Generating dynamic sitemap.xml...');

  if (!fs.existsSync(APPROVED_INVENTORY_PATH)) {
    throw new Error(`Approved sitemap inventory is missing: ${APPROVED_INVENTORY_PATH}`);
  }
  const approvedInventory = JSON.parse(fs.readFileSync(APPROVED_INVENTORY_PATH, 'utf8'));
  const approvedPaths = Array.isArray(approvedInventory.paths) ? approvedInventory.paths : [];
  const approvedPathSet = new Set(approvedPaths);
  const expectedSitemapUrlCount = approvedInventory.urlCount;
  if (
    !Number.isInteger(expectedSitemapUrlCount) ||
    expectedSitemapUrlCount < MIN_APPROVED_SITEMAP_URL_COUNT ||
    approvedPaths.length !== expectedSitemapUrlCount ||
    approvedPathSet.size !== expectedSitemapUrlCount
  ) {
    throw new Error(
      `Approved sitemap inventory must declare at least ${MIN_APPROVED_SITEMAP_URL_COUNT} URLs and contain exactly that many unique paths ` +
      `(found declared=${approvedInventory.urlCount}, paths=${approvedPaths.length}, unique=${approvedPathSet.size}).`
    );
  }

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

  if (!fs.existsSync(PRERENDER_MANIFEST_PATH)) {
    throw new Error(
      `Newly built prerender manifest is missing: ${PRERENDER_MANIFEST_PATH}. ` +
      'Run scripts/prerender.js before sitemap generation.'
    );
  }
  const prerenderManifest = JSON.parse(fs.readFileSync(PRERENDER_MANIFEST_PATH, 'utf8'));
  const manifestRoutes = new Set(prerenderManifest.routes || []);
  if (manifestRoutes.size === 0) {
    throw new Error('Newly built prerender manifest contains no routes.');
  }

  const products = await fetchAllProducts();

  // Validate sitemap candidates against this build's own output. Checking the
  // prior production deployment here can approve stale routes or reject newly
  // fixed ones, so production HTTP responses are intentionally not consulted.
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const productByPath = new Map(
    products.map((product) => [`/product/${product.handle}`, product])
  );
  const approvedProductPaths = approvedPaths.filter((routePath) => routePath.startsWith('/product/'));
  const missingApprovedProducts = approvedProductPaths.filter((routePath) => !productByPath.has(routePath));
  if (missingApprovedProducts.length > 0) {
    throw new Error(
      `Approved sitemap product(s) are missing from the current Shopify response: ` +
      `${missingApprovedProducts.slice(0, 20).join(', ')}` +
      (missingApprovedProducts.length > 20 ? ` (+${missingApprovedProducts.length - 20} more)` : '')
    );
  }
  const liveProducts = approvedProductPaths.map((routePath) => productByPath.get(routePath));
  const excludedCandidateCount = products.length - liveProducts.length;
  console.log(
    `[sitemap] Approved inventory retained ${liveProducts.length} products; ` +
    `excluded ${excludedCandidateCount} Shopify candidate product(s) outside the approved/live sitemap scope.`
  );
  const sitemapPaths = [
    ...staticPages.map((page) => page.loc),
    ...blogPosts,
    ...liveProducts.map((product) => `/product/${product.handle}`),
  ];
  const sitemapPathSet = new Set(sitemapPaths);
  const missingApprovedPaths = approvedPaths.filter((routePath) => !sitemapPathSet.has(routePath));
  const unexpectedPaths = sitemapPaths.filter((routePath) => !approvedPathSet.has(routePath));
  if (
    sitemapPaths.length !== expectedSitemapUrlCount ||
    sitemapPathSet.size !== expectedSitemapUrlCount ||
    missingApprovedPaths.length > 0 ||
    unexpectedPaths.length > 0
  ) {
    throw new Error(
      `Generated sitemap scope must exactly match the ${expectedSitemapUrlCount}-URL approved/live inventory. ` +
      `Generated=${sitemapPaths.length}, unique=${sitemapPathSet.size}, ` +
      `missing=${missingApprovedPaths.join(', ') || 'none'}, ` +
      `unexpected=${unexpectedPaths.join(', ') || 'none'}.`
    );
  }
  for (const routePath of sitemapPaths) {
    validatePrerenderedRoute(routePath, manifestRoutes, exactRedirectSources);
  }
  console.log(
    `[sitemap] Validated ${sitemapPaths.length} URLs against the newly built prerender manifest: ` +
    'all have a prerendered response, one indexable robots directive, one self-canonical, and no exact redirect conflict.'
  );

  // Active Storefront API products are never automatically converted to 410.
  const deadListPath = path.join(distDir, 'dead-product-handles.json');
  fs.writeFileSync(deadListPath, JSON.stringify([], null, 2));

  const combinedSitemap = generateSitemap(liveProducts);
  const splitSitemaps = splitSitemap(combinedSitemap);
  const sitemap = generateSitemapIndex();

  // Write to dist/ (Vercel serves static files from dist/)
  const distPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distPath, sitemap, 'utf8');
  for (const [name, xml] of Object.entries(splitSitemaps)) {
    fs.writeFileSync(path.join(distDir, `sitemap-${name}.xml`), xml, 'utf8');
  }
  console.log(`[sitemap] Written sitemap index plus five scoped sitemaps to ${distDir} (${liveProducts.length} live products, ${staticPages.length + blogPosts.length} static/blog URLs)`);

  // Also write to public/ for dev and fallback
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  const publicPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicPath, sitemap, 'utf8');
  for (const [name, xml] of Object.entries(splitSitemaps)) {
    fs.writeFileSync(path.join(publicDir, `sitemap-${name}.xml`), xml, 'utf8');
  }
  console.log(`[sitemap] Also written to ${publicPath}`);
}

main().catch(err => {
  console.error('[sitemap] Fatal error:', err);
  console.error('[sitemap] Build stopped to prevent publishing an invalid sitemap.');
  process.exit(1);
});
