#!/usr/bin/env node
/**
 * Apply the commercial-quality ranking to both the hydrated storefront and
 * build-time collection prerenders. The shared TypeScript scorer is loaded by
 * prerender.js through its existing esbuild-backed TypeScript loader so the
 * crawler HTML and shopper UI use one ordering model.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PRODUCT_FILTERS_PATH = path.join(ROOT, 'src/lib/productFilters.ts');
const PRERENDER_PATH = path.join(ROOT, 'scripts/prerender.js');

function read(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[commercial-ranking] Missing required file: ${path.relative(ROOT, filePath)}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function writeIfChanged(filePath, before, after) {
  if (before !== after) fs.writeFileSync(filePath, after, 'utf8');
}

function count(source, needle) {
  return source.split(needle).length - 1;
}

let productFilters = read(PRODUCT_FILTERS_PATH);
const productFiltersBefore = productFilters;
const rankingImport = "import { rankCommercialProducts } from '@/lib/commercialProductRanking';";
const importAnchor = "import { isProductSizeOptionName } from '@/lib/productOptionNames';";

if (!productFilters.includes(rankingImport)) {
  if (!productFilters.includes(importAnchor)) {
    throw new Error('[commercial-ranking] productFilters import anchor is missing.');
  }
  productFilters = productFilters.replace(importAnchor, `${importAnchor}\n${rankingImport}`);
}

const legacyFeaturedBranch = `    case 'featured':\n    default:\n      break;`;
const rankedFeaturedBranch = `    case 'featured':\n    default:\n      return rankCommercialProducts(sorted);`;

if (productFilters.includes(legacyFeaturedBranch)) {
  productFilters = productFilters.replace(legacyFeaturedBranch, rankedFeaturedBranch);
}

if (!productFilters.includes(rankedFeaturedBranch)) {
  throw new Error('[commercial-ranking] Failed to wire the Featured storefront sort.');
}
if (count(productFilters, rankingImport) !== 1) {
  throw new Error('[commercial-ranking] Storefront ranking import must appear exactly once.');
}
writeIfChanged(PRODUCT_FILTERS_PATH, productFiltersBefore, productFilters);

let prerender = read(PRERENDER_PATH);
const prerenderBefore = prerender;
const globalAnchor = "const FALLBACK_CURRENCY = 'USD';";
const globalRanking = `${globalAnchor}\nlet rankCommercialProducts = (products) => [...products];`;

if (!prerender.includes('let rankCommercialProducts = (products) => [...products];')) {
  if (!prerender.includes(globalAnchor)) {
    throw new Error('[commercial-ranking] prerender global anchor is missing.');
  }
  prerender = prerender.replace(globalAnchor, globalRanking);
}

const mainAnchor = `async function main() {\n  const indexPath = path.join(DIST_DIR, 'index.html');`;
const mainWithRanking = `async function main() {\n  const rankingModule = await loadTsModule('src/lib/commercialProductRanking.ts');\n  if (typeof rankingModule.rankCommercialProducts !== 'function') {\n    throw new Error('[commercial-ranking] Shared ranking module did not export rankCommercialProducts.');\n  }\n  rankCommercialProducts = rankingModule.rankCommercialProducts;\n  console.log('[commercial-ranking] Shared commercial-quality ranking loaded for collection prerenders.');\n\n  const indexPath = path.join(DIST_DIR, 'index.html');`;

if (!prerender.includes("Shared commercial-quality ranking loaded for collection prerenders.")) {
  if (!prerender.includes(mainAnchor)) {
    throw new Error('[commercial-ranking] prerender main() anchor is missing.');
  }
  prerender = prerender.replace(mainAnchor, mainWithRanking);
}

const legacyCollectionOrdering = `    const allCollectionProducts = filterProductsForCollectionRoute(\n      allProducts,\n      route,\n      Number.POSITIVE_INFINITY,\n    );`;
const rankedCollectionOrdering = `    const allCollectionProducts = rankCommercialProducts(filterProductsForCollectionRoute(\n      allProducts,\n      route,\n      Number.POSITIVE_INFINITY,\n    ));`;

if (prerender.includes(legacyCollectionOrdering)) {
  prerender = prerender.replace(legacyCollectionOrdering, rankedCollectionOrdering);
}

if (!prerender.includes(rankedCollectionOrdering)) {
  throw new Error('[commercial-ranking] Failed to wire ranking into collection prerenders.');
}
if (count(prerender, "loadTsModule('src/lib/commercialProductRanking.ts')") !== 1) {
  throw new Error('[commercial-ranking] Shared prerender ranking module must load exactly once.');
}
if (count(prerender, rankedCollectionOrdering) !== 1) {
  throw new Error('[commercial-ranking] Ranked collection ordering must appear exactly once.');
}
writeIfChanged(PRERENDER_PATH, prerenderBefore, prerender);

console.log(
  `[commercial-ranking] Applied shopper + crawler ranking (${productFiltersBefore === productFilters ? 0 : 1} storefront source, ${prerenderBefore === prerender ? 0 : 1} prerender source updated).`,
);
