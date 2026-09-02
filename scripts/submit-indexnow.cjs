#!/usr/bin/env node
/** Submit only substantive canonical URL changes to IndexNow after a successful build. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const HOST = 'luxemia.shop';
const SITE_URL = `https://${HOST}`;
const KEY = '8e3d7c9415b24a5f9c81e62d1a0374bf';
const DIST = path.resolve(__dirname, '../dist');
const PRERENDER = path.join(DIST, '_prerender');
const MANIFEST_PATH = path.join(DIST, 'indexnow-manifest.json');
const PRODUCTION_MANIFEST_URL = `${SITE_URL}/indexnow-manifest.json`;
const SITEMAPS = ['products', 'collections', 'guides', 'pages'];

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

function substantiveHash(url) {
  const htmlPath = htmlPathForUrl(url);
  if (!fs.existsSync(htmlPath)) throw new Error(`Missing prerendered HTML for IndexNow manifest: ${url}`);
  const normalized = fs.readFileSync(htmlPath, 'utf8')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

async function loadPreviousManifest() {
  try {
    const response = await fetch(PRODUCTION_MANIFEST_URL, { headers: { Accept: 'application/json' } });
    if (!response.ok) return { entries: {} };
    const manifest = await response.json();
    return manifest && typeof manifest.entries === 'object' ? manifest : { entries: {} };
  } catch {
    return { entries: {} };
  }
}

async function verifyKey() {
  const response = await fetch(`${SITE_URL}/${KEY}.txt`, { headers: { Accept: 'text/plain' } });
  const body = response.ok ? (await response.text()).trim() : '';
  if (!response.ok || body !== KEY) {
    throw new Error(`IndexNow key verification failed at ${SITE_URL}/${KEY}.txt (HTTP ${response.status})`);
  }
}

async function main() {
  const urls = [...new Set(SITEMAPS.flatMap(urlsFromSitemap))].sort();
  if (urls.length === 0) throw new Error('No canonical URLs were found in the generated scoped sitemaps');

  const entries = Object.fromEntries(urls.map((url) => [url, substantiveHash(url)]));
  const currentManifest = { version: 1, generatedAt: new Date().toISOString(), entries };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(currentManifest, null, 2));

  const previousManifest = await loadPreviousManifest();
  const changed = urls.filter((url) => previousManifest.entries[url] !== entries[url]);
  const retired = Object.keys(previousManifest.entries).filter((url) => !(url in entries));
  const notifications = [...new Set([...changed, ...retired])].slice(0, 10000);

  if (notifications.length === 0) {
    console.log(`[indexnow] No substantive canonical changes detected across ${urls.length} URLs; no notification sent.`);
    return;
  }

  await verifyKey();
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${SITE_URL}/${KEY}.txt`,
      urlList: notifications,
    }),
  });
  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow returned HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }
  console.log(`[indexnow] Accepted ${notifications.length} substantive changes (${changed.length} added/updated, ${retired.length} retired; HTTP ${response.status}). IndexNow is a discovery notification, not an indexing guarantee.`);
}

main().catch((error) => {
  // Search discovery must never replace or invalidate a successful storefront build.
  console.warn(`[indexnow] Submission deferred: ${error.message}`);
});
