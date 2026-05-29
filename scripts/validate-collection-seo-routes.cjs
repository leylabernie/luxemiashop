#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SITE_URL = 'https://luxemia.shop';
const ROUTES_JSON_PATH = path.join(__dirname, 'routes.json');
const PRERENDER_COLLECTIONS_DIR = path.join(ROOT_DIR, 'dist', '_prerender', 'collections');
const DIST_SITEMAP_PATH = path.join(ROOT_DIR, 'dist', 'sitemap.xml');
const PUBLIC_SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');

function readCanonicalCollectionRoutes() {
  const routePaths = JSON.parse(fs.readFileSync(ROUTES_JSON_PATH, 'utf8'));
  if (!Array.isArray(routePaths)) {
    throw new Error('scripts/routes.json must contain a route path array.');
  }

  return routePaths.filter((routePath) => (
    typeof routePath === 'string'
    && routePath.startsWith('/collections/')
    && routePath.split('/').length === 3
    && routePath !== '/collections/all'
  ));
}

function readPrerenderCollectionRoutes() {
  if (!fs.existsSync(PRERENDER_COLLECTIONS_DIR)) {
    return [];
  }

  return fs.readdirSync(PRERENDER_COLLECTIONS_DIR)
    .filter((fileName) => fileName.endsWith('.html'))
    .map((fileName) => `/collections/${fileName.replace(/\.html$/, '')}`)
    .filter((routePath) => routePath !== '/collections/all');
}

function readSitemapCollectionRoutes(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    return [];
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const matches = sitemap.matchAll(new RegExp(`<loc>${SITE_URL}(/collections/[^<]+)</loc>`, 'g'));
  return Array.from(matches, (match) => match[1])
    .filter((routePath) => routePath !== '/collections/all');
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

function reportList(label, items) {
  if (items.length === 0) return;
  console.error(`\n${label} (${items.length}):`);
  for (const item of items) {
    console.error(`  - ${item}`);
  }
}

const sourceRoutes = readCanonicalCollectionRoutes();
const prerenderRoutes = readPrerenderCollectionRoutes();
const distSitemapRoutes = readSitemapCollectionRoutes(DIST_SITEMAP_PATH);
const publicSitemapRoutes = readSitemapCollectionRoutes(PUBLIC_SITEMAP_PATH);
const combinedSitemapRoutes = Array.from(new Set([
  ...distSitemapRoutes,
  ...publicSitemapRoutes,
]));

const sourceMissingPrerender = fs.existsSync(PRERENDER_COLLECTIONS_DIR)
  ? difference(sourceRoutes, prerenderRoutes)
  : [];
const sourceMissingDistSitemap = fs.existsSync(DIST_SITEMAP_PATH)
  ? difference(sourceRoutes, distSitemapRoutes)
  : [];
const sourceMissingPublicSitemap = difference(sourceRoutes, publicSitemapRoutes);
const publicSitemapExtra = difference(publicSitemapRoutes, sourceRoutes);
const distSitemapExtra = difference(distSitemapRoutes, sourceRoutes);
const sitemapWithoutPrerender = fs.existsSync(PRERENDER_COLLECTIONS_DIR)
  ? difference(combinedSitemapRoutes, prerenderRoutes)
  : [];

console.log('[validate:collection-seo] Collection route counts');
console.log(`[validate:collection-seo] source/routes: ${sourceRoutes.length}`);
console.log(`[validate:collection-seo] prerender: ${prerenderRoutes.length}`);
console.log(`[validate:collection-seo] dist sitemap: ${distSitemapRoutes.length}`);
console.log(`[validate:collection-seo] public sitemap: ${publicSitemapRoutes.length}`);

reportList('Source collection routes missing prerender output', sourceMissingPrerender);
reportList('Source collection routes missing dist sitemap output', sourceMissingDistSitemap);
reportList('Source collection routes missing public sitemap output', sourceMissingPublicSitemap);
reportList('Public sitemap collection URLs not in source/routes', publicSitemapExtra);
reportList('Dist sitemap collection URLs not in source/routes', distSitemapExtra);
reportList('Sitemap collection URLs without prerender output', sitemapWithoutPrerender);

const failed = [
  sourceMissingPrerender,
  sourceMissingDistSitemap,
  sourceMissingPublicSitemap,
  publicSitemapExtra,
  distSitemapExtra,
  sitemapWithoutPrerender,
].some((items) => items.length > 0);

if (failed) {
  console.error('\n[validate:collection-seo] FAILED: collection route, prerender, and sitemap outputs are out of sync.');
  process.exit(1);
}

console.log('[validate:collection-seo] OK: collection route, prerender, and sitemap outputs are in sync.');
