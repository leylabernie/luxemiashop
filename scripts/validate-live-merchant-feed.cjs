#!/usr/bin/env node
/**
 * Verify that a deployed /merchant-feed.xml response is the exact validated
 * static artifact produced by the build.
 *
 * Usage:
 *   node scripts/validate-live-merchant-feed.cjs https://preview.example.com
 *   MERCHANT_FEED_BASE_URL=https://preview.example.com npm run validate:merchant-feed:live
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
// The validated feed is generated during the release into dist/. A committed
// public/ snapshot was deliberately retired because it could outlive Shopify
// catalog changes and silently override the current artifact.
const STATIC_FEED_PATH = path.join(PROJECT_ROOT, 'dist', 'merchant-feed.xml');
const baseUrl = (process.argv[2] || process.env.MERCHANT_FEED_BASE_URL || '').trim();

function fail(message) {
  console.error(`\n[merchant-feed-live] FAILED: ${message}`);
  process.exit(1);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function extractIds(xml) {
  return Array.from(xml.matchAll(/<g:id>([\s\S]*?)<\/g:id>/g), (match) => match[1].trim());
}

function itemCount(xml) {
  return (xml.match(/<item>/g) || []).length;
}

async function main() {
  if (!baseUrl) {
    fail('Provide a preview or production base URL as the first argument or MERCHANT_FEED_BASE_URL.');
  }
  if (!/^https:\/\//i.test(baseUrl)) {
    fail(`Base URL must use HTTPS: ${baseUrl}`);
  }
  if (!fs.existsSync(STATIC_FEED_PATH)) {
    fail(`Static feed artifact not found: ${STATIC_FEED_PATH}`);
  }

  const staticXml = fs.readFileSync(STATIC_FEED_PATH, 'utf8');
  const feedUrl = new URL('/merchant-feed.xml', baseUrl).toString();
  const response = await fetch(feedUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'LuxeMia-Merchant-Feed-Parity-Validator/1.0',
      Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1',
    },
  });

  if (!response.ok) {
    fail(`${feedUrl} returned HTTP ${response.status}.`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!/xml/i.test(contentType)) {
    fail(`${feedUrl} returned unexpected Content-Type: ${contentType || '(missing)'}.`);
  }

  const liveXml = await response.text();
  const staticIds = extractIds(staticXml);
  const liveIds = extractIds(liveXml);
  const staticItems = itemCount(staticXml);
  const liveItems = itemCount(liveXml);

  if (staticItems === 0 || staticIds.length !== staticItems) {
    fail(`Static artifact is internally inconsistent (${staticItems} items, ${staticIds.length} IDs).`);
  }
  if (liveItems !== staticItems || liveIds.length !== staticIds.length) {
    fail(
      `Offer-count mismatch: static ${staticItems} items/${staticIds.length} IDs; ` +
      `deployed ${liveItems} items/${liveIds.length} IDs.`
    );
  }

  const duplicateLiveIds = liveIds.filter((id, index) => liveIds.indexOf(id) !== index);
  if (duplicateLiveIds.length > 0) {
    fail(`Deployed feed contains duplicate IDs; first duplicate: ${duplicateLiveIds[0]}.`);
  }

  const missingIds = staticIds.filter((id) => !liveIds.includes(id));
  const unexpectedIds = liveIds.filter((id) => !staticIds.includes(id));
  if (missingIds.length > 0 || unexpectedIds.length > 0) {
    fail(
      `Offer identity mismatch: ${missingIds.length} static IDs missing and ` +
      `${unexpectedIds.length} unexpected deployed IDs. ` +
      `First missing: ${missingIds[0] || 'none'}; first unexpected: ${unexpectedIds[0] || 'none'}.`
    );
  }

  const staticHash = sha256(staticXml);
  const liveHash = sha256(liveXml);
  if (staticHash !== liveHash) {
    fail(
      `Feed bytes differ despite matching IDs/counts. ` +
      `Static SHA-256 ${staticHash}; deployed SHA-256 ${liveHash}.`
    );
  }

  console.log(`[merchant-feed-live] URL: ${feedUrl}`);
  console.log(`[merchant-feed-live] Final URL: ${response.url}`);
  console.log(`[merchant-feed-live] Offers: ${liveItems}`);
  console.log(`[merchant-feed-live] SHA-256: ${liveHash}`);
  console.log('[merchant-feed-live] PASS: deployed response exactly matches the validated static artifact.');
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
