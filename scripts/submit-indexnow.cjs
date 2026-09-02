#!/usr/bin/env node
/** Submit substantive canonical URLs to IndexNow after a successful build. */
const fs = require('fs');
const path = require('path');

const HOST = 'luxemia.shop';
const SITE_URL = `https://${HOST}`;
const KEY = '8e3d7c9415b24a5f9c81e62d1a0374bf';
const DIST = path.resolve(__dirname, '../dist');
const SITEMAPS = ['products', 'collections', 'guides', 'pages'];

function urlsFromSitemap(name) {
  const file = path.join(DIST, `sitemap-${name}.xml`);
  if (!fs.existsSync(file)) return [];
  return [...fs.readFileSync(file, 'utf8').matchAll(/<loc>(https:\/\/luxemia\.shop\/[^<]*)<\/loc>/g)]
    .map((match) => match[1]);
}

async function main() {
  const urls = [...new Set(SITEMAPS.flatMap(urlsFromSitemap))].slice(0, 10000);
  if (urls.length === 0) throw new Error('No canonical URLs were found in the generated scoped sitemaps');
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${SITE_URL}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow returned HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }
  console.log(`[indexnow] Accepted ${urls.length} canonical URLs (HTTP ${response.status}). IndexNow is a discovery notification, not an indexing guarantee.`);
}

main().catch((error) => {
  // Search discovery must never replace or invalidate a successful storefront build.
  console.warn(`[indexnow] Submission deferred: ${error.message}`);
});
