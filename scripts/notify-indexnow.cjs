#!/usr/bin/env node
/** Notify IndexNow only after the production deployment is live and READY. */
const HOST = 'luxemia.shop';
const SITE_URL = `https://${HOST}`;
const KEY = '8e3d7c9415b24a5f9c81e62d1a0374bf';
const MANIFEST_URL = `${SITE_URL}/indexnow-manifest.json`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_BATCH_SIZE = 10000;

async function readLiveManifest() {
  const response = await fetch(MANIFEST_URL, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Live manifest returned HTTP ${response.status}`);
  const manifest = await response.json();
  if (
    manifest?.version !== 3
    || typeof manifest.releaseId !== 'string'
    || !manifest.notificationPlan
    || !Array.isArray(manifest.notificationPlan.urls)
  ) {
    throw new Error('Live manifest is missing its version-3 post-deploy notification plan');
  }
  return manifest;
}

async function verifyKey() {
  const response = await fetch(`${SITE_URL}/${KEY}.txt`, {
    headers: { Accept: 'text/plain' },
    cache: 'no-store',
  });
  const body = response.ok ? (await response.text()).trim() : '';
  if (!response.ok || body !== KEY) {
    throw new Error(`IndexNow key verification failed (HTTP ${response.status})`);
  }
}

async function submitBatch(urlList) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${SITE_URL}/${KEY}.txt`,
      urlList,
    }),
  });
  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow returned HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }
  return response.status;
}

async function main() {
  if (process.env.INDEXNOW_POST_DEPLOY !== '1') {
    throw new Error('Refusing notification outside the explicit post-deploy workflow');
  }

  const manifest = await readLiveManifest();
  const plan = manifest.notificationPlan;
  if (plan.status === 'baseline-unavailable') {
    throw new Error(`Production comparison baseline was unavailable: ${plan.reason || 'unknown reason'}`);
  }
  if (!['initial-baseline', 'ready-after-deploy'].includes(plan.status)) {
    throw new Error(`Live manifest is not eligible for notification (status ${plan.status})`);
  }

  const urls = [...new Set(plan.urls)];
  if (urls.length === 0) {
    console.log(`[indexnow-post-deploy] Release ${manifest.releaseId} has no substantive URL changes; no notification sent.`);
    return;
  }

  await verifyKey();
  const statuses = [];
  for (let offset = 0; offset < urls.length; offset += MAX_BATCH_SIZE) {
    statuses.push(await submitBatch(urls.slice(offset, offset + MAX_BATCH_SIZE)));
  }
  console.log(`[indexnow-post-deploy] Accepted ${urls.length} substantive URL changes in ${statuses.length} batch(es) for READY release ${manifest.releaseId} (HTTP ${statuses.join(', ')}). IndexNow is a discovery notification, not an indexing guarantee.`);
}

main().catch((error) => {
  console.error(`[indexnow-post-deploy] FAILED: ${error.message}`);
  process.exitCode = 1;
});
