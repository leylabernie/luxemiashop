#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const REQUIRE_BUILT = process.argv.includes('--require-built');
const IDS = {
  organization: 'https://luxemia.shop/#organization',
  website: 'https://luxemia.shop/#website',
  brand: 'https://luxemia.shop/#brand',
  support: 'https://luxemia.shop/#customer-support',
  editorial: 'https://luxemia.shop/authors/luxemia-editorial-team#editorial-team',
};
const failures = [];

function read(relative) {
  const file = path.join(ROOT, relative);
  if (!fs.existsSync(file)) {
    failures.push(`${relative} is missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function requireAll(relative, snippets) {
  const source = read(relative);
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${relative} missing stable-entity guard: ${snippet}`);
  }
}

requireAll('index.html', Object.values(IDS).filter((id) => id !== IDS.editorial));
requireAll('public/manifest.json', ['"lang": "en"']);
requireAll('src/lib/schema.ts', [
  'function generateBrandReference',
  "? { '@id': `${SITE_URL}/#brand` }",
  "'@id': `${SITE_URL}/#organization`",
  "'@id': `${SITE_URL}/#customer-support`",
  "currenciesAccepted: 'USD'",
  'if (!raw) return undefined',
  "'@id': `${options.url}#webpage`",
  "inLanguage: 'en'",
]);
requireAll('src/pages/Blog.tsx', [
  `"publisher": { "@id": "${IDS.organization}" }`,
  `"@id": "${IDS.editorial}"`,
]);
requireAll('src/pages/BlogPost.tsx', [
  `"publisher": { "@id": "${IDS.organization}" }`,
  `"@id": "${IDS.editorial}"`,
]);
requireAll('src/pages/BlogCategory.tsx', [`"@id": "${IDS.website}"`]);
requireAll('src/components/seo/SEOHead.tsx', [
  "'@type': 'CollectionPage'",
  "'@type': 'ItemList'",
  "'@id': `${canonicalUrl}#collection`",
  "'@id': `${canonicalUrl}#itemlist`",
  "'@id': `${canonicalUrl}#breadcrumb`",
  "isPartOf: { '@id': `${siteUrl}/#website` }",
  "{ lang: 'en', href: canonicalUrl }",
  "{ lang: 'x-default', href: canonicalUrl }",
]);
requireAll('scripts/prerender.js', [
  "'@id': `${canonical}#webpage`",
  "'@id': `${canonical}#collection`",
  "'@id': `${canonical}#itemlist`",
  "mainEntity: { '@id': `${canonical}#itemlist` }",
  "inLanguage: 'en'",
  "publisher: { '@id': `${SITE_URL}/#organization` }",
]);

const indexHtml = read('index.html');
for (const [relative, source] of [
  ['index.html', indexHtml],
  ['src/components/seo/SEOHead.tsx', read('src/components/seo/SEOHead.tsx')],
  ['scripts/prerender.js', read('scripts/prerender.js')],
  ['src/pages/Blog.tsx', read('src/pages/Blog.tsx')],
  ['src/pages/BlogPost.tsx', read('src/pages/BlogPost.tsx')],
  ['public/manifest.json', read('public/manifest.json')],
]) {
  if (/hreflang=["']en-US["']|lang:\s*["']en-US["']|inLanguage["']?\s*:\s*["']en-US["']/.test(source)) {
    failures.push(`${relative} still region-targets the shared seven-country English storefront as en-US`);
  }
}

const graphBlocks = [...indexHtml.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
let indexGraph;
for (const block of graphBlocks) {
  try {
    const parsed = JSON.parse(block[1]);
    if (Array.isArray(parsed?.['@graph'])) indexGraph = parsed['@graph'];
  } catch (error) {
    failures.push(`index.html contains invalid JSON-LD: ${error.message}`);
  }
}
if (!indexGraph) {
  failures.push('index.html has no canonical @graph');
} else {
  const collectIds = (value, id) => {
    if (Array.isArray(value)) return value.reduce((count, item) => count + collectIds(item, id), 0);
    if (!value || typeof value !== 'object') return 0;
    return (value['@id'] === id ? 1 : 0)
      + Object.values(value).reduce((count, child) => count + collectIds(child, id), 0);
  };
  for (const [label, id] of Object.entries(IDS).filter(([key]) => key !== 'editorial')) {
    const count = collectIds(indexGraph, id);
    if (count < 1) failures.push(`index.html does not reference the stable ${label} ID (${id})`);
  }
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(file) : (entry.name.endsWith('.html') ? [file] : []);
  });
}

function typeList(node) {
  return Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']].filter(Boolean);
}

function inspectNode(node, relative, trail = '$') {
  if (Array.isArray(node)) {
    node.forEach((item, index) => inspectNode(item, relative, `${trail}[${index}]`));
    return;
  }
  if (!node || typeof node !== 'object') return;

  const types = typeList(node);
  const isStoreEntity = types.some((type) => ['Organization', 'OnlineStore', 'ClothingStore'].includes(type));
  if (isStoreEntity && node.address?.['@type'] === 'PostalAddress') {
    failures.push(`${relative} ${trail} publishes an unverified store PostalAddress`);
  }
  if (isStoreEntity && node.currenciesAccepted !== undefined && node.currenciesAccepted !== 'USD') {
    failures.push(`${relative} ${trail} currenciesAccepted must be exactly USD`);
  }
  if (types.includes('MerchantReturnPolicy')) failures.push(`${relative} ${trail} contains prohibited MerchantReturnPolicy`);
  if (types.includes('Brand') && node.name === 'LuxeMia' && node['@id'] !== IDS.brand) {
    failures.push(`${relative} ${trail} defines an inline LuxeMia Brand instead of ${IDS.brand}`);
  }
  if (types.includes('WebSite') && /^LuxeMia/i.test(node.name || '') && node['@id'] !== IDS.website) {
    failures.push(`${relative} ${trail} defines a duplicate LuxeMia WebSite without the stable ID`);
  }
  if (types.includes('Organization') && node.name === 'LuxeMia' && node['@id'] !== IDS.organization) {
    failures.push(`${relative} ${trail} defines a duplicate LuxeMia Organization without the stable ID`);
  }
  if (types.includes('ContactPoint') && (node.email || node.telephone) && node['@id'] !== IDS.support) {
    failures.push(`${relative} ${trail} defines a support ContactPoint without the stable ID`);
  }
  if (types.includes('BlogPosting')) {
    if (node.publisher?.['@id'] !== IDS.organization) failures.push(`${relative} ${trail} BlogPosting publisher does not reference ${IDS.organization}`);
    if (node.author?.name === 'LuxeMia Editorial Team' && node.author?.['@id'] !== IDS.editorial) {
      failures.push(`${relative} ${trail} editorial author lacks its stable ID`);
    }
  }
  if (types.includes('Product') || types.includes('ProductGroup')) {
    if (node.brand?.name === 'LuxeMia' && node.brand?.['@id'] !== IDS.brand) {
      failures.push(`${relative} ${trail} product embeds LuxeMia Brand instead of referencing ${IDS.brand}`);
    }
  }

  for (const [key, child] of Object.entries(node)) inspectNode(child, relative, `${trail}.${key}`);
}

if (indexGraph) inspectNode(indexGraph, 'index.html', '$graph');

if (REQUIRE_BUILT) {
  const files = walkFiles(DIST);
  if (files.length === 0) failures.push('No built HTML found for --require-built schema validation');
  for (const file of files) {
    const relative = path.relative(ROOT, file).replace(/\\/g, '/');
    const html = fs.readFileSync(file, 'utf8');
    const parsedSchemas = [];
    for (const [index, match] of [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].entries()) {
      try {
        const schema = JSON.parse(match[1]);
        parsedSchemas.push(schema);
        inspectNode(schema, relative, `$schema[${index}]`);
      } catch (error) {
        failures.push(`${relative} JSON-LD ${index + 1} is invalid: ${error.message}`);
      }
    }

    // Only _prerender files are public route responses; dist/index.html is the
    // internal SPA shell. Assert that initial route HTML uses the same stable
    // IDs and language signals that Helmet recreates after hydration.
    if (!relative.startsWith('dist/_prerender/')) continue;
    const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    if (/noindex/i.test(robots)) continue;
    const canonicals = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi)]
      .map((match) => match[1]);
    if (canonicals.length !== 1) {
      failures.push(`${relative} must contain exactly one canonical before route-schema IDs can be validated`);
      continue;
    }
    const canonical = canonicals[0];
    const topLevelNodes = parsedSchemas.flatMap((schema) => (
      Array.isArray(schema?.['@graph']) ? schema['@graph'] : [schema]
    ));
    const nodesOfType = (type) => topLevelNodes.filter((node) => typeList(node).includes(type));
    const webPages = nodesOfType('WebPage');
    if (
      webPages.length !== 1
      || webPages[0]['@id'] !== `${canonical}#webpage`
      || webPages[0].url !== canonical
      || webPages[0].inLanguage !== 'en'
    ) {
      failures.push(`${relative} must expose one generic-English WebPage at ${canonical}#webpage`);
    }

    const hreflang = [...html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["'][^>]*>/gi)]
      .map((match) => ({ lang: match[1], href: match[2] }));
    const expectedHreflang = new Map([['en', canonical], ['x-default', canonical]]);
    if (
      hreflang.length !== expectedHreflang.size
      || hreflang.some(({ lang, href }) => expectedHreflang.get(lang) !== href)
    ) {
      failures.push(`${relative} must use only self-referential en and x-default alternates for the shared English storefront`);
    }

    for (const collection of nodesOfType('CollectionPage')) {
      if (
        collection['@id'] !== `${canonical}#collection`
        || collection.url !== canonical
        || collection.inLanguage !== 'en'
        || collection.mainEntity?.['@id'] !== `${canonical}#itemlist`
        || !nodesOfType('ItemList').some((node) => node['@id'] === `${canonical}#itemlist`)
      ) {
        failures.push(`${relative} has a CollectionPage/ItemList graph whose route IDs drift from ${canonical}`);
      }
    }
    for (const breadcrumb of nodesOfType('BreadcrumbList')) {
      if (breadcrumb['@id'] !== `${canonical}#breadcrumb`) {
        failures.push(`${relative} has a BreadcrumbList without stable route ID ${canonical}#breadcrumb`);
      }
    }
    for (const article of nodesOfType('BlogPosting')) {
      if (
        article['@id'] !== `${canonical}#article`
        || article.mainEntityOfPage?.['@id'] !== `${canonical}#webpage`
      ) {
        failures.push(`${relative} has a BlogPosting whose route IDs drift from ${canonical}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error('[schema-entities] Validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`[schema-entities] OK — stable IDs, USD currency, and omission of unverified store addresses are consistent${REQUIRE_BUILT ? ' in built HTML' : ' in source'}.`);
