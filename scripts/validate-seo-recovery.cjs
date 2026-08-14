#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const fail = (message) => {
  console.error(`[seo-recovery] ${message}`);
  process.exitCode = 1;
};

const COLLECTIONS = [
  'wedding-sarees',
  'bridal-lehengas',
  'sharara-suits',
  'gharara-suits',
  'anarkali-suits',
  'designer-sarees',
];
const BLOG_SLUGS = [
  'plus-size-indian-ethnic-wear-guide',
  'manish-malhotra-bollywood-bridal-designer-profile',
  'indian-wedding-terms-glossary-50-events-rituals-roles',
];
const REQUIRED_PATHS = [
  ...COLLECTIONS.map((handle) => `/collections/${handle}`),
  ...BLOG_SLUGS.map((slug) => `/blog/${slug}`),
];

const app = read('src/App.tsx');
const middleware = read('middleware.ts');
const vercel = JSON.parse(read('vercel.json'));
const hook = read('src/hooks/useShopifyProducts.ts');
const prerender = read('scripts/prerender.js');
const routeGenerator = read('scripts/generate-routes.cjs');
const sitemapGenerator = read('scripts/generate-sitemap.cjs');
const blogPosts = read('src/data/blogPosts.ts');
const blogCategories = read('src/data/blogCategories.ts');
const approvedInventory = JSON.parse(read('scripts/approved-sitemap-inventory.json'));

for (const handle of COLLECTIONS) {
  const routePath = `/collections/${handle}`;
  if (!app.includes(`path="${routePath}"`) || !app.includes(`<RecoveryCollection handle="${handle}"`)) {
    fail(`${routePath} is not rendered by RecoveryCollection in src/App.tsx.`);
  }
  if (!hook.includes(`'${handle}':`)) fail(`${handle} is missing from the client category product-type map.`);
  if (!prerender.includes(`'${handle}':`)) fail(`${handle} is missing from the prerender category product-type map.`);
  if (!routeGenerator.includes(`'${routePath}'`)) fail(`${routePath} is missing from generated static routes.`);
  if (!sitemapGenerator.includes(`loc: '${routePath}'`)) fail(`${routePath} is missing from the sitemap static-page list.`);
  if (!prerender.includes(`path: '${routePath}'`)) fail(`${routePath} has no route-specific prerender definition.`);

  const appRedirect = new RegExp(`path=["']${routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^\n]+Navigate`);
  if (appRedirect.test(app)) fail(`${routePath} is still shadowed by a React redirect.`);
  if (middleware.includes(`'${routePath}':`)) fail(`${routePath} is still present in middleware's collection redirect map.`);
  if ((vercel.redirects || []).some((redirect) => redirect.source === routePath)) {
    fail(`${routePath} is still present in vercel.json redirects.`);
  }
}

for (const slug of BLOG_SLUGS) {
  const pathName = `/blog/${slug}`;
  if (!blogPosts.includes(`'${slug}'`)) fail(`${slug} is missing from PUBLISHED_BLOG_SLUGS.`);
  if (!blogCategories.includes(`'${slug}':`)) fail(`${slug} is missing from BLOG_POST_CATEGORY_MAP.`);
  if ((vercel.redirects || []).some((redirect) => redirect.source === pathName)) {
    fail(`${pathName} is shadowed by a Vercel redirect.`);
  }
}

if (!blogPosts.includes("import { recoveredBlogPosts } from './recoveredBlogPosts';")) {
  fail('src/data/blogPosts.ts does not import the recovered articles.');
}
if (!blogPosts.includes('...recoveredBlogPosts')) {
  fail('src/data/blogPosts.ts does not append the recovered articles.');
}
if (!routeGenerator.includes('recoveredBlogPosts.ts')) {
  fail('scripts/generate-routes.cjs does not parse recoveredBlogPosts.ts.');
}
if (!sitemapGenerator.includes('recoveredBlogPosts.ts')) {
  fail('scripts/generate-sitemap.cjs does not parse recoveredBlogPosts.ts.');
}

if (approvedInventory.urlCount !== 767 || approvedInventory.paths.length !== 767) {
  fail(`Approved sitemap inventory must contain 767 paths after recovery; found declared=${approvedInventory.urlCount}, paths=${approvedInventory.paths.length}.`);
}
const approvedSet = new Set(approvedInventory.paths);
for (const routePath of REQUIRED_PATHS) {
  if (!approvedSet.has(routePath)) fail(`${routePath} is absent from the approved sitemap inventory.`);
}

if (!sitemapGenerator.includes('const EXPECTED_SITEMAP_URL_COUNT = 767;')) {
  fail('Sitemap expected URL count is not 767.');
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`[seo-recovery] OK — ${COLLECTIONS.length} intent-specific collection URLs and ${BLOG_SLUGS.length} restored articles are protected from redirect, route, prerender, canonical-inventory, and sitemap regressions.`);
