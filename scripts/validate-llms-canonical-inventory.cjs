#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const failures = [];
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const llmsFiles = ['public/llms.txt', 'public/llms-full.txt'];
const appSource = read('src/App.tsx');
const sitemapSource = read('src/lib/dynamicSitemap.ts');

const appRoutes = new Set(
  [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((route) => !route.includes(':') && route !== '*'),
);
const sitemapRoutes = new Set(
  [...sitemapSource.matchAll(/\bloc:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]),
);
const redirectSources = new Set(
  [...appSource.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<Navigate\s+to=/g)]
    .map((match) => match[1]),
);
for (const redirect of JSON.parse(read('vercel.json')).redirects || []) {
  if (typeof redirect.source === 'string' && !redirect.source.includes(':')) {
    redirectSources.add(redirect.source);
  }
}

const dataFiles = fs.readdirSync(path.join(ROOT, 'src/data'));
const blogSources = dataFiles
  .filter((file) => /blogposts\.ts$/i.test(file) || file === 'semanticCommerceGuides.ts')
  .map((file) => read(`src/data/${file}`));
const publishedBlogPaths = new Set(
  blogSources.flatMap((source) =>
    [...source.matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)]
      .map((match) => `/blog/${match[1]}`),
  ),
);
const categoryPaths = new Set(
  [...read('src/data/blogCategories.ts').matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)]
    .map((match) => `/blog/${match[1]}`),
);
const authorPaths = new Set(
  [...read('src/data/blogAuthors.ts').matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)]
    .map((match) => `/authors/${match[1]}`),
);
const machinePaths = new Set([
  '/sitemap.xml',
  '/sitemap-products.xml',
  '/sitemap-collections.xml',
  '/sitemap-guides.xml',
  '/sitemap-pages.xml',
  '/sitemap-images.xml',
  '/merchant-feed.xml',
  '/openai-search-products.jsonl.gz',
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/manifest.json',
]);
const knownCanonicalPaths = new Set([
  '/',
  ...appRoutes,
  ...sitemapRoutes,
  ...publishedBlogPaths,
  ...categoryPaths,
  ...authorPaths,
  ...machinePaths,
]);

function listedUrls(relative) {
  const source = read(relative);
  return [...source.matchAll(/https?:\/\/[^\s)`]+/g)].map((match) =>
    match[0].replace(/[.,;:]$/, ''),
  );
}

for (const relative of llmsFiles) {
  for (const rawUrl of listedUrls(relative)) {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      failures.push(`${relative} contains an invalid URL: ${rawUrl}`);
      continue;
    }

    if (parsed.protocol !== 'https:' || parsed.hostname !== 'luxemia.shop') {
      failures.push(`${relative} must use exact non-www HTTPS canonical host: ${rawUrl}`);
      continue;
    }
    if (parsed.search || parsed.hash) {
      failures.push(`${relative} contains a query or fragment instead of a canonical URL: ${rawUrl}`);
    }
    const canonicalPath = parsed.pathname.replace(/\/$/, '') || '/';
    if (redirectSources.has(canonicalPath)) {
      failures.push(`${relative} lists redirect source instead of its destination: ${canonicalPath}`);
    }
    if (/^\/product\//.test(canonicalPath)) {
      failures.push(`${relative} must delegate changing product URLs to sitemaps and feeds: ${canonicalPath}`);
    }
    if (!knownCanonicalPaths.has(canonicalPath)) {
      failures.push(`${relative} lists a URL absent from the canonical route/content inventory: ${canonicalPath}`);
    }
  }
}

const fullInventory = read('public/llms-full.txt');
const requiredPaths = [
  '/festive-wear',
  '/indian-wedding-guest-outfits',
  '/wedding-events',
  '/shop-by-fulfillment',
  '/shop-by-fulfillment/ready-to-ship',
  '/shop-by-fulfillment/made-to-order',
  '/shop-by-fulfillment/customizable-outfits',
  '/shipping/united-states',
  '/shipping/canada',
  '/shipping/united-kingdom',
  '/shipping/australia',
  '/shipping/new-zealand',
  '/shipping/south-africa',
  '/shipping/mauritius',
  '/us-support',
  '/editorial-policy',
  '/review-policy',
  '/collections/reception-outfits',
  '/collections/navratri-chaniya-choli',
  '/collections/garba-outfits',
  '/collections/groomsmen-outfits',
  '/collections/sangeet-outfits',
  '/collections/wedding-guest-lehengas',
  '/collections/wedding-guest-kurta-sets',
  '/collections/diwali-womenswear',
  '/collections/diwali-menswear',
  '/collections/palazzo-suits',
  '/collections/sherwani-for-groom',
  '/collections/banarasi-sarees',
  ...publishedBlogPaths,
  ...categoryPaths,
];
for (const canonicalPath of requiredPaths) {
  if (!fullInventory.includes(`https://luxemia.shop${canonicalPath}`)) {
    failures.push(`public/llms-full.txt omits required canonical URL: ${canonicalPath}`);
  }
}

if (!read('public/llms.txt').includes('## Guides and editorial content')) {
  failures.push('public/llms.txt must label the editorial section as Guides');
}

if (failures.length > 0) {
  console.error('[llms-canonical] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[llms-canonical] OK — ${publishedBlogPaths.size} published guides and the canonical public route inventory contain no redirect or www URLs.`);
