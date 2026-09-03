#!/usr/bin/env node
/** Build a semantic change manifest; notification happens only after production is READY. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const HOST = 'luxemia.shop';
const SITE_URL = `https://${HOST}`;
const DIST = path.resolve(__dirname, '../dist');
const PRERENDER = path.join(DIST, '_prerender');
const MANIFEST_PATH = path.join(DIST, 'indexnow-manifest.json');
const PRODUCTION_MANIFEST_URL = `${SITE_URL}/indexnow-manifest.json`;
const SITEMAPS = ['products', 'collections', 'guides', 'pages'];
const IS_PRODUCTION_DEPLOYMENT = process.env.VERCEL_ENV === 'production';
const MIDDLEWARE_PATH = path.resolve(__dirname, '../middleware.ts');
const VERCEL_CONFIG_PATH = path.resolve(__dirname, '../vercel.json');

function urlsFromSitemap(name) {
  const file = path.join(DIST, `sitemap-${name}.xml`);
  if (!fs.existsSync(file)) return [];
  return [...fs.readFileSync(file, 'utf8').matchAll(/<loc>(https:\/\/luxemia\.shop\/[^<]*)<\/loc>/g)]
    .map((match) => match[1]);
}

function htmlPathForUrl(url) {
  const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
  return pathname ? path.join(PRERENDER, `${pathname}.html`) : path.join(PRERENDER, 'index.html');
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableJson(value[key])]));
}

function addRedirect(inventory, sourcePath, destination, statusCode, origin) {
  if (!sourcePath.startsWith('/') || sourcePath.includes(':') || /[()*]/.test(sourcePath)) return;
  const source = new URL(sourcePath, SITE_URL).toString();
  const target = new URL(destination, SITE_URL).toString();
  const payload = `${statusCode} ${target}`;
  const entry = {
    destination: target,
    statusCode,
    hash: crypto.createHash('sha256').update(payload).digest('hex'),
  };
  const existing = inventory[source];
  if (existing && existing.hash !== entry.hash) {
    throw new Error(`Conflicting redirect inventory for ${source} (${origin})`);
  }
  inventory[source] = entry;
}

function parseMiddlewareRedirectMap(source, mapName) {
  const escapedName = mapName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = source.match(new RegExp(`const\\s+${escapedName}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\s*\\};`))?.[1];
  if (!block) throw new Error(`Could not parse middleware redirect map ${mapName}`);
  return [...block.matchAll(/^\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]\s*,?/gm)]
    .map((match) => ({ source: match[1], destination: match[2] }));
}

function collectRedirectInventory() {
  const inventory = {};
  const middleware = fs.readFileSync(MIDDLEWARE_PATH, 'utf8');
  const vercelConfig = JSON.parse(fs.readFileSync(VERCEL_CONFIG_PATH, 'utf8'));

  for (const mapName of [
    'PRODUCT_301_REDIRECTS',
    'COLLECTION_301_REDIRECTS',
    'LEGACY_BLOG_REDIRECTS',
  ]) {
    for (const redirect of parseMiddlewareRedirectMap(middleware, mapName)) {
      addRedirect(inventory, redirect.source, redirect.destination, 301, `middleware ${mapName}`);
    }
  }

  const regionalBlock = middleware.match(
    /const\s+LEGACY_REGIONAL_REDIRECT_ROUTES[^=]*=\s*new Set\(\[([\s\S]*?)\]\);/,
  )?.[1];
  if (!regionalBlock) throw new Error('Could not parse LEGACY_REGIONAL_REDIRECT_ROUTES');
  for (const match of regionalBlock.matchAll(/['"]([^'"]+)['"]/g)) {
    addRedirect(inventory, match[1], '/nri', 301, 'middleware legacy regional routes');
  }

  const literalRedirectPattern = /if\s*\(\s*pathname\s*===\s*['"]([^'"]+)['"]\s*\)\s*\{\s*return\s+Response\.redirect\(\s*new URL\(\s*['"]([^'"]+)['"]/g;
  for (const match of middleware.matchAll(literalRedirectPattern)) {
    addRedirect(inventory, match[1], match[2], 301, 'middleware literal redirect');
  }

  for (const redirect of vercelConfig.redirects || []) {
    const statusCode = redirect.statusCode || (redirect.permanent === true ? 308 : 307);
    addRedirect(inventory, redirect.source, redirect.destination, statusCode, 'vercel.json');
  }

  return Object.fromEntries(Object.entries(inventory).sort(([left], [right]) => left.localeCompare(right)));
}

function buildNotificationPlan(entries, redirects, previousManifest, baselineStatus) {
  const previousEntries = previousManifest?.entries || {};
  const previousRedirects = previousManifest?.redirects || {};
  const changed = Object.keys(entries).filter((url) => previousEntries[url] !== entries[url]);
  const retired = Object.keys(previousEntries).filter((url) => !(url in entries));
  const redirectChanged = Object.keys(redirects).filter(
    (url) => previousRedirects[url]?.hash !== redirects[url]?.hash,
  );
  const redirectRemoved = Object.keys(previousRedirects).filter((url) => !(url in redirects));

  return {
    status: baselineStatus === 'initial-baseline' ? 'initial-baseline' : 'ready-after-deploy',
    changedCount: changed.length,
    retiredCount: retired.length,
    redirectChangedCount: redirectChanged.length,
    redirectRemovedCount: redirectRemoved.length,
    urls: [...new Set([...changed, ...retired, ...redirectChanged, ...redirectRemoved])].sort(),
  };
}

function semanticPayload(html, url) {
  const structuredData = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => {
      try {
        return JSON.stringify(stableJson(JSON.parse(match[1])));
      } catch (error) {
        throw new Error(`Invalid JSON-LD while hashing ${url}: ${error.message}`);
      }
    })
    .sort()
    .join('\n');

  const documentContent = html
    // Build scripts, CSS, preload tags and inline styles are deployment artifacts,
    // not substantive page changes. JSON-LD is retained separately above.
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<link\b[^>]*\brel=["'](?:stylesheet|modulepreload|preload)["'][^>]*>/gi, '')
    .replace(/\s(?:integrity|nonce)=["'][^"']*["']/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();

  return `${documentContent}\n${structuredData}`;
}

function substantiveHash(url) {
  const htmlPath = htmlPathForUrl(url);
  if (!fs.existsSync(htmlPath)) throw new Error(`Missing prerendered HTML for IndexNow manifest: ${url}`);
  const payload = semanticPayload(fs.readFileSync(htmlPath, 'utf8'), url);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

async function loadPreviousManifest() {
  const response = await fetch(PRODUCTION_MANIFEST_URL, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (response.status === 404) {
    return { status: 'initial-baseline', entries: {}, redirects: {} };
  }
  if (!response.ok) {
    throw new Error(`production manifest returned HTTP ${response.status}`);
  }
  const manifest = await response.json();
  if (!manifest || typeof manifest.entries !== 'object' || Array.isArray(manifest.entries)) {
    throw new Error('production manifest has no valid entries object');
  }
  return {
    status: 'compared',
    entries: manifest.entries,
    redirects: manifest.redirects && typeof manifest.redirects === 'object' && !Array.isArray(manifest.redirects)
      ? manifest.redirects
      : {},
  };
}

async function main() {
  const urls = [...new Set(SITEMAPS.flatMap(urlsFromSitemap))].sort();
  if (urls.length === 0) throw new Error('No canonical URLs were found in the generated scoped sitemaps');

  const entries = Object.fromEntries(urls.map((url) => [url, substantiveHash(url)]));
  const redirects = collectRedirectInventory();
  if (Object.keys(redirects).length === 0) throw new Error('No exact redirect sources were found for the IndexNow manifest');
  const releaseId = crypto.createHash('sha256')
    .update(JSON.stringify({ entries, redirects }))
    .digest('hex');
  const currentManifest = {
    version: 3,
    generatedAt: new Date().toISOString(),
    releaseId,
    entries,
    redirects,
    notificationPlan: {
      status: 'preview-manifest-only',
      changedCount: 0,
      retiredCount: 0,
      redirectChangedCount: 0,
      redirectRemovedCount: 0,
      urls: [],
    },
  };

  if (!IS_PRODUCTION_DEPLOYMENT) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(currentManifest, null, 2));
    console.log(`[indexnow] Built a ${urls.length}-URL semantic manifest; notification planning is restricted to VERCEL_ENV=production and submission occurs only after a READY production deployment.`);
    return;
  }

  try {
    const previousManifest = await loadPreviousManifest();
    currentManifest.notificationPlan = buildNotificationPlan(
      entries,
      redirects,
      previousManifest,
      previousManifest.status,
    );
  } catch (error) {
    currentManifest.notificationPlan = {
      status: 'baseline-unavailable',
      changedCount: 0,
      retiredCount: 0,
      redirectChangedCount: 0,
      redirectRemovedCount: 0,
      urls: [],
      reason: error.message,
    };
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(currentManifest, null, 2));
  console.log(`[indexnow] Prepared ${currentManifest.notificationPlan.urls.length} post-deploy notifications (${currentManifest.notificationPlan.changedCount} added/updated, ${currentManifest.notificationPlan.retiredCount} retired, ${currentManifest.notificationPlan.redirectChangedCount} redirect changes, ${currentManifest.notificationPlan.redirectRemovedCount} removed redirects; status ${currentManifest.notificationPlan.status}). No build-time network submission was made.`);
}

module.exports = {
  buildNotificationPlan,
  collectRedirectInventory,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`[indexnow] Manifest generation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
