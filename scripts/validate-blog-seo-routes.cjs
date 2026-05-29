#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SITE_URL = 'https://luxemia.shop';
const ROUTES_JSON_PATH = path.join(__dirname, 'routes.json');
const PRERENDER_BLOG_DIR = path.join(ROOT_DIR, 'dist', '_prerender', 'blog');
const DIST_SITEMAP_PATH = path.join(ROOT_DIR, 'dist', 'sitemap.xml');
const PUBLIC_SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');

function readCanonicalBlogRoutes() {
  const routePaths = JSON.parse(fs.readFileSync(ROUTES_JSON_PATH, 'utf8'));
  if (!Array.isArray(routePaths)) {
    throw new Error('scripts/routes.json must contain a route path array.');
  }

  return routePaths.filter((routePath) => (
    typeof routePath === 'string'
    && routePath.startsWith('/blog/')
    && routePath.split('/').length === 3
  ));
}

function readPrerenderBlogRoutes() {
  if (!fs.existsSync(PRERENDER_BLOG_DIR)) {
    return [];
  }

  return fs.readdirSync(PRERENDER_BLOG_DIR)
    .filter((fileName) => fileName.endsWith('.html'))
    .map((fileName) => `/blog/${fileName.replace(/\.html$/, '')}`);
}

function readSitemapBlogRoutes(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    return [];
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const matches = sitemap.matchAll(new RegExp(`<loc>${SITE_URL}(/blog/[^<]+)</loc>`, 'g'));
  return Array.from(matches, (match) => match[1]);
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

const sourceRoutes = readCanonicalBlogRoutes();
const prerenderRoutes = readPrerenderBlogRoutes();
const distSitemapRoutes = readSitemapBlogRoutes(DIST_SITEMAP_PATH);
const publicSitemapRoutes = readSitemapBlogRoutes(PUBLIC_SITEMAP_PATH);
const combinedSitemapRoutes = Array.from(new Set([
  ...distSitemapRoutes,
  ...publicSitemapRoutes,
]));

const sourceMissingPrerender = difference(sourceRoutes, prerenderRoutes);
const sourceMissingDistSitemap = difference(sourceRoutes, distSitemapRoutes);
const sourceMissingPublicSitemap = difference(sourceRoutes, publicSitemapRoutes);
const prerenderExtra = difference(prerenderRoutes, sourceRoutes);
const sitemapWithoutPrerender = difference(combinedSitemapRoutes, prerenderRoutes);

console.log('[validate:blog-seo] Blog route counts');
console.log(`[validate:blog-seo] source/routes: ${sourceRoutes.length}`);
console.log(`[validate:blog-seo] prerender: ${prerenderRoutes.length}`);
console.log(`[validate:blog-seo] dist sitemap: ${distSitemapRoutes.length}`);
console.log(`[validate:blog-seo] public sitemap: ${publicSitemapRoutes.length}`);

reportList('Source blog routes missing prerender output', sourceMissingPrerender);
reportList('Source blog routes missing dist sitemap output', sourceMissingDistSitemap);
reportList('Source blog routes missing public sitemap output', sourceMissingPublicSitemap);
reportList('Prerender blog routes not in source/routes', prerenderExtra);
reportList('Sitemap blog URLs without prerender output', sitemapWithoutPrerender);

const failed = [
  sourceMissingPrerender,
  sourceMissingDistSitemap,
  sourceMissingPublicSitemap,
  prerenderExtra,
  sitemapWithoutPrerender,
].some((items) => items.length > 0);

if (failed) {
  console.error('\n[validate:blog-seo] FAILED: blog route, prerender, and sitemap outputs are out of sync.');
  process.exit(1);
}

console.log('[validate:blog-seo] OK: blog route, prerender, and sitemap outputs are in sync.');
