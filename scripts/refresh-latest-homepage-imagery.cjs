#!/usr/bin/env node

/**
 * Refreshes src/data/latestHomepageImagery.json from the live Shopify catalog
 * (sorted by CREATED_AT desc) before `vite build`, so homepage hero slides,
 * category cards, and promo banners render the newest active product images on
 * the very first paint without flicker. Falls back gracefully to the committed
 * snapshot when the Storefront token or network is unavailable.
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'src/data/latestHomepageImagery.json');
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';

async function main() {
  if (!SHOPIFY_STOREFRONT_TOKEN) {
    console.log('[homepage-imagery] No Shopify token set; keeping committed latest-imagery snapshot.');
    return;
  }

  try {
    const selectorUrl = pathToFileURL(
      path.join(ROOT, 'src/lib/selectLatestHomepageImagery.mjs'),
    ).href;
    const {
      LATEST_HOMEPAGE_IMAGERY_QUERY,
      isSameDesignFamily,
      selectLatestHomepageImagery,
    } = await import(selectorUrl);

    const archivedHandles = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'src/data/reversiblyArchivedProductHandles.json'), 'utf8'),
    );
    const goneHandles = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'src/data/legacyGoneProductHandles.json'), 'utf8'),
    );

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: LATEST_HOMEPAGE_IMAGERY_QUERY }),
    });

    if (!response.ok) {
      console.warn(`[homepage-imagery] Shopify responded ${response.status}; keeping committed snapshot.`);
      return;
    }

    const payload = await response.json();
    if (payload.errors?.length || !payload.data) {
      console.warn('[homepage-imagery] GraphQL error; keeping committed snapshot.');
      return;
    }

    const selected = selectLatestHomepageImagery(payload.data, {
      archivedHandles,
      goneHandles,
    });
    if (!selected) {
      console.warn('[homepage-imagery] No eligible products returned; keeping committed snapshot.');
      return;
    }

    const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    const usedEntries = [];
    const takeSlot = (liveEntry, fallbackEntry) => {
      if (liveEntry) {
        usedEntries.push(liveEntry);
        return liveEntry;
      }
      if (
        fallbackEntry &&
        !usedEntries.some((prev) => isSameDesignFamily(prev, fallbackEntry))
      ) {
        usedEntries.push(fallbackEntry);
        return fallbackEntry;
      }
      return null;
    };

    const merged = {
      generatedAt: new Date().toISOString(),
      hero: {
        'wedding-edit': takeSlot(selected.hero['wedding-edit'], existing.hero['wedding-edit']),
        'new-arrivals': takeSlot(selected.hero['new-arrivals'], existing.hero['new-arrivals']),
        'sarees-edit': takeSlot(selected.hero['sarees-edit'], existing.hero['sarees-edit']),
        'lehengas-suits': takeSlot(selected.hero['lehengas-suits'], existing.hero['lehengas-suits']),
        'ready-to-ship': takeSlot(selected.hero['ready-to-ship'], existing.hero['ready-to-ship']),
      },
      categories: {
        sarees: takeSlot(selected.categories.sarees, existing.categories.sarees),
        lehengas: takeSlot(selected.categories.lehengas, existing.categories.lehengas),
        suits: takeSlot(selected.categories.suits, existing.categories.suits),
        indowestern: takeSlot(selected.categories.indowestern, existing.categories.indowestern),
        menswear: takeSlot(selected.categories.menswear, existing.categories.menswear),
        kids: takeSlot(selected.categories.kids, existing.categories.kids),
        jewelry: takeSlot(selected.categories.jewelry, existing.categories.jewelry),
      },
      promos: {
        'ready-to-ship': takeSlot(selected.promos['ready-to-ship'], existing.promos['ready-to-ship']),
        'bridal-party': takeSlot(selected.promos['bridal-party'], existing.promos['bridal-party']),
      },
    };

    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

    const summary = [
      ...Object.entries(merged.hero).map(
        ([slot, item]) => `hero.${slot}=${item?.handle || 'none'} (${(item?.createdAt || '').slice(0, 10)})`,
      ),
      ...Object.entries(merged.categories)
        .filter(([, item]) => Boolean(item))
        .map(([slot, item]) => `cat.${slot}=${item.handle} (${(item.createdAt || '').slice(0, 10)})`),
      ...Object.entries(merged.promos).map(
        ([slot, item]) => `promo.${slot}=${item?.handle || 'none'} (${(item?.createdAt || '').slice(0, 10)})`,
      ),
    ];
    console.log(`[homepage-imagery] Refreshed latest Shopify product photos:\n  ${summary.join('\n  ')}`);
  } catch (error) {
    console.warn(`[homepage-imagery] Skipped live refresh (${error?.message || error}); keeping committed snapshot.`);
  }
}

main();
