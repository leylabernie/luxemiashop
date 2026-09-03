#!/usr/bin/env node

/**
 * Postprocess the built homepage only. Source fixes are authored and reviewed
 * before commit. The command refuses to run without --built-only so its
 * historical source-patch helpers cannot rewrite the checkout.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://luxemia.shop';

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function write(relativePath, value) {
  fs.writeFileSync(path.join(ROOT, relativePath), value, 'utf8');
}

function replaceOnce(relativePath, before, after, label) {
  const source = read(relativePath);
  if (source.includes(after)) return false;
  if (!source.includes(before)) {
    throw new Error(`[storefront-performance] ${label} source pattern was not found in ${relativePath}.`);
  }
  write(relativePath, source.replace(before, after));
  return true;
}

function patchSource() {
  let changes = 0;

  changes += Number(replaceOnce(
    'index.html',
    '<link rel="preload" as="image" href="/images/campaigns/new-indian-ethnic-wear-2026-mobile.webp" type="image/webp" media="(max-width: 639px)" fetchpriority="high">\n    <link rel="preload" as="image" href="/images/campaigns/new-indian-ethnic-wear-2026-desktop.webp" type="image/webp" media="(min-width: 640px)" fetchpriority="high">',
    '<link rel="preload" as="image" href="/images/hero-carousel/navratri-lehenga.webp" type="image/webp" media="(max-width: 639px)" fetchpriority="high">\n    <link rel="preload" as="image" href="/images/hero-carousel/navratri-lehenga-desktop.webp" type="image/webp" media="(min-width: 640px)" fetchpriority="high">',
    'homepage LCP preload',
  ));

  changes += Number(replaceOnce(
    'src/components/home/NewArrivalsBanner.tsx',
    `  useEffect(() => {\n    const nextSlide = featuredSlides[(index + 1) % featuredSlides.length];\n    const source =\n      window.matchMedia('(min-width: 640px)').matches && nextSlide.desktopImage\n        ? nextSlide.desktopImage\n        : nextSlide.image;\n    const preloadedImage = new Image();\n    preloadedImage.src = \`\${source}.webp\`;\n  }, [index]);\n\n`,
    '',
    'eager next-slide preload removal',
  ));

  changes += Number(replaceOnce(
    'src/components/home/NewArrivalsBanner.tsx',
    '            fetchPriority="high"',
    "            fetchPriority={index === 0 ? 'high' : 'low'}",
    'active hero fetch priority',
  ));

  changes += Number(replaceOnce(
    'src/pages/Index.tsx',
    `                  loading="eager"\n                  decoding="async"\n                  className="h-full w-full object-cover object-top"`,
    `                  loading="lazy"\n                  fetchPriority="low"\n                  decoding="async"\n                  className="h-full w-full object-cover object-top"`,
    'below-fold homepage image priority',
  ));

  changes += Number(replaceOnce(
    'src/hooks/useShopifyProducts.ts',
    'export const useShopifyProducts = (category?: string, revalidate = false) => {',
    'export const useShopifyProducts = (category?: string, revalidate = false, storefrontQuery?: string) => {',
    'query-aware product hook signature',
  ));

  changes += Number(replaceOnce(
    'src/hooks/useShopifyProducts.ts',
    '        const initial = getInitialData(category);',
    '        const initial = storefrontQuery ? null : getInitialData(category);',
    'query-scoped prerender handling',
  ));

  changes += Number(replaceOnce(
    'src/hooks/useShopifyProducts.ts',
    '        let allProducts = revalidate ? await fetchAllProducts() : await getAllProducts();',
    `        let allProducts = storefrontQuery\n          ? await fetchAllProducts(storefrontQuery)\n          : revalidate\n            ? await fetchAllProducts()\n            : await getAllProducts();`,
    'query-scoped Storefront fetch',
  ));

  changes += Number(replaceOnce(
    'src/hooks/useShopifyProducts.ts',
    '  }, [category, revalidate]);',
    '  }, [category, revalidate, storefrontQuery]);',
    'query-aware hook dependency list',
  ));

  for (const relativePath of [
    'src/components/home/NewArrivals.tsx',
    'src/pages/NewArrivals.tsx',
  ]) {
    changes += Number(replaceOnce(
      relativePath,
      'const MAX_PER_CATEGORY = 5;',
      `const MAX_PER_CATEGORY = 5;\nconst RECENT_PRODUCT_QUERY = \`created_at:>='\${new Date(\n  Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 86400000,\n).toISOString().slice(0, 10)}'\`;`,
      'recent-product Storefront query',
    ));

    changes += Number(replaceOnce(
      relativePath,
      'useShopifyProducts(undefined, true)',
      'useShopifyProducts(undefined, false, RECENT_PRODUCT_QUERY)',
      'full-catalog revalidation removal',
    ));
  }

  return changes;
}

function compactHomepageProductSchema(html) {
  let compacted = 0;
  const scriptPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  const output = html.replace(scriptPattern, (full, body) => {
    let parsed;
    try {
      parsed = JSON.parse(String(body).trim());
    } catch {
      return full;
    }

    if (parsed?.['@id'] !== `${SITE_URL}/#itemlist` || parsed?.['@type'] !== 'ItemList') {
      return full;
    }

    const compactItems = (Array.isArray(parsed.itemListElement) ? parsed.itemListElement : [])
      .slice(0, 6)
      .map((entry, index) => {
        const product = entry?.item || {};
        const url = product.url || entry?.url;
        const name = product.name || entry?.name;
        if (!url || !name) return null;

        const item = {
          '@type': 'ListItem',
          position: index + 1,
          url,
          name,
        };
        const image = product.image || entry?.image;
        if (typeof image === 'string' && image.startsWith('https://')) {
          item.image = image;
        }
        return item;
      })
      .filter(Boolean);

    const compactSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#itemlist`,
      name: parsed.name || 'LuxeMia Collection',
      url: parsed.url || `${SITE_URL}/`,
      numberOfItems: compactItems.length,
      itemListElement: compactItems,
    };

    compacted += 1;
    return `<script type="application/ld+json" data-performance-compact>${JSON.stringify(compactSchema)}</script>`;
  });

  return { output, compacted };
}

function patchBuiltHomepage() {
  const candidates = ['dist/index.html', 'dist/_prerender/index.html'];
  const results = [];

  for (const relativePath of candidates) {
    const absolutePath = path.join(ROOT, relativePath);
    if (!fs.existsSync(absolutePath)) continue;

    const before = fs.readFileSync(absolutePath, 'utf8');
    let after = before
      .replaceAll('/images/campaigns/new-indian-ethnic-wear-2026-mobile.webp', '/images/hero-carousel/navratri-lehenga.webp')
      .replaceAll('/images/campaigns/new-indian-ethnic-wear-2026-desktop.webp', '/images/hero-carousel/navratri-lehenga-desktop.webp');

    const compacted = compactHomepageProductSchema(after);
    after = compacted.output;

    if (after !== before) fs.writeFileSync(absolutePath, after, 'utf8');
    results.push({
      relativePath,
      beforeBytes: Buffer.byteLength(before),
      afterBytes: Buffer.byteLength(after),
      compacted: compacted.compacted,
    });
  }

  return results;
}

const builtOnly = process.argv.includes('--built-only');
if (!builtOnly) {
  throw new Error('[storefront-performance] Refusing to run without --built-only; tracked source is never rewritten during release processing.');
}
const builtResults = patchBuiltHomepage();

for (const result of builtResults) {
  console.log(
    `[storefront-performance] ${result.relativePath}: ${result.beforeBytes} -> ${result.afterBytes} bytes; compact schemas ${result.compacted}.`,
  );
}

console.log(
  `[storefront-performance] OK — source left untouched; ${builtResults.length} built homepage file(s) inspected.`,
);
