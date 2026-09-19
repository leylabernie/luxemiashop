#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function loadTsModule(relativePath) {
  const result = esbuild.buildSync({
    entryPoints: [path.join(PROJECT_ROOT, relativePath)],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  const execute = new Function('module', 'exports', 'require', result.outputFiles[0].text);
  execute(module, module.exports, require);
  return module.exports;
}

function isParameterized(route) {
  return /[:*()]/.test(route);
}

function fail(message) {
  console.error(`[legacy-redirects] ${message}`);
  process.exitCode = 1;
}

const vercelConfig = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'vercel.json'), 'utf8'));
const redirects = vercelConfig.redirects || [];
const approvedInventory = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/approved-sitemap-inventory.json'), 'utf8'),
);
const approvedPaths = new Set(approvedInventory.paths || []);
const { PUBLISHED_BLOG_SLUGS } = loadTsModule('src/data/blogPosts.ts');
const { BLOG_CATEGORY_GROUPS } = loadTsModule('src/data/blogCategories.ts');
const publishedBlogPaths = new Set(PUBLISHED_BLOG_SLUGS.map(slug => `/blog/${slug}`));
const activeHubPaths = new Set(BLOG_CATEGORY_GROUPS.map(group => `/blog/${group.slug}`));
const legacyHubRedirects = new Map([
  ['/blog/attires', '/blog/indian-wedding-guest-attire'],
  ['/blog/motifs-embroideries', '/blog/indian-textiles-and-embroidery'],
  ['/blog/how-to-care', '/blog/fit-sizing-and-garment-care'],
]);
const exactRedirects = redirects.filter(redirect => !isParameterized(redirect.source));
const exactSources = new Set(exactRedirects.map(redirect => redirect.source));

if (exactSources.has('/ready-to-ship')) {
  fail('/ready-to-ship is a published landing page and must not be shadowed by a redirect.');
}
const readyToShipAlias = exactRedirects.find(
  redirect => redirect.source === '/collections/ready-to-ship',
);
if (readyToShipAlias?.destination !== '/ready-to-ship') {
  fail('/collections/ready-to-ship must redirect directly to /ready-to-ship.');
}
for (const requiredPath of ['/ready-to-ship', '/pages/shipping-customs']) {
  if (!approvedPaths.has(requiredPath)) {
    fail(`${requiredPath} is a published canonical route and must remain in the approved sitemap inventory.`);
  }
}

const requiredCollectionAliases = new Map([
  ['/collections/jewelry', '/jewelry'],
  ['/collections/new-arrivals', '/new-arrivals'],
  ['/collections/indowestern', '/indowestern'],
  ['/collections/nri', '/nri'],
]);

for (const [source, destination] of requiredCollectionAliases) {
  const redirect = exactRedirects.find(candidate => candidate.source === source);
  if (!redirect) {
    fail(`${source} is missing from vercel.json redirects.`);
    continue;
  }
  if (redirect.destination !== destination) {
    fail(`${source} must redirect to ${destination}, not ${redirect.destination}.`);
  }
  if (redirect.statusCode !== 301 && redirect.statusCode !== 308 && redirect.permanent !== true) {
    fail(`${source} is not explicitly permanent.`);
  }
}

const duplicates = redirects
  .map(redirect => redirect.source)
  .filter((source, index, sources) => sources.indexOf(source) !== index);
if (duplicates.length > 0) fail(`Duplicate redirect sources: ${[...new Set(duplicates)].join(', ')}`);

for (const redirect of redirects) {
  const { source, destination, permanent } = redirect;
  if (!source || !destination) {
    fail(`Redirect is missing a source or destination: ${JSON.stringify(redirect)}`);
    continue;
  }
  const isContentRedirect = source.startsWith('/blog/') || source.startsWith('/product/');
  if (isContentRedirect && permanent !== true && redirect.statusCode !== 301 && redirect.statusCode !== 308) {
    fail(`${source} is not explicitly permanent.`);
  }
  if (source === destination) fail(`${source} redirects to itself.`);
  if (publishedBlogPaths.has(source)) fail(`${source} is published and must not be shadowed by a redirect.`);

  if (source.startsWith('/product/') && !isParameterized(source) && !destination.startsWith('/product/')) {
    fail(`${source} redirects a product URL to a non-product destination (${destination}).`);
  }
  if (
    source.startsWith('/product/')
    && !isParameterized(source)
    && destination.startsWith('/product/')
    && !isParameterized(destination)
    && !approvedPaths.has(destination)
  ) {
    fail(`${source} points to a product destination outside the approved sitemap inventory (${destination}).`);
  }

  if (source.startsWith('/blog/') && !isParameterized(source)) {
    const isApprovedHubRename = legacyHubRedirects.get(source) === destination && activeHubPaths.has(destination);
    if (!isApprovedHubRename && (destination === '/blog' || activeHubPaths.has(destination))) {
      fail(`${source} redirects a specific article URL to a generic blog destination (${destination}).`);
    }
    if (!isApprovedHubRename && destination.startsWith('/blog/') && !publishedBlogPaths.has(destination)) {
      fail(`${source} points to an unpublished blog article (${destination}).`);
    }
  }

  if (!isParameterized(source) && !isParameterized(destination) && exactSources.has(destination)) {
    fail(`${source} starts a redirect chain through ${destination}.`);
  }
}

const middleware = fs.readFileSync(path.join(PROJECT_ROOT, 'middleware.ts'), 'utf8');
for (const legacySizePath of [
  '/blog/indian-size-to-us-clothing-size-conversion-guide',
  '/blog/indian-size-to-us-size-conversion-chart',
]) {
  const expected = `'${legacySizePath}': '/blog/indian-to-us-clothing-size-conversion-guide'`;
  if (!middleware.includes(expected)) fail(`${legacySizePath} is not mapped to the restored size article in middleware.`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`[legacy-redirects] OK — ${redirects.length} redirects contain no published-article shadows, generic article/product fallbacks, or exact redirect chains.`);
