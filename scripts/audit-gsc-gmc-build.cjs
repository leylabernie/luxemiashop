#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const feedPath = path.join(root, 'public', 'merchant-feed.xml');
const sitemapPath = path.join(root, 'public', 'sitemap.xml');
const robotsPath = path.join(root, 'public', 'robots.txt');

const decode = (value) => (value || '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");
const tag = (xml, name) => decode((xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, 'i')) || [])[1] || '').trim();
const unique = (values) => [...new Set(values)];

for (const filePath of [feedPath, sitemapPath, robotsPath]) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing required audit input: ${filePath}`);
}

const feed = fs.readFileSync(feedPath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const robots = fs.readFileSync(robotsPath, 'utf8');
const blocks = feed.match(/<item>[\s\S]*?<\/item>/gi) || [];
const items = blocks.map((xml) => ({
  id: tag(xml, 'g:id'),
  groupId: tag(xml, 'g:item_group_id'),
  title: tag(xml, 'g:title'),
  description: tag(xml, 'g:description'),
  link: tag(xml, 'g:link'),
  image: tag(xml, 'g:image_link'),
  availability: tag(xml, 'g:availability'),
  price: tag(xml, 'g:price'),
  salePrice: tag(xml, 'g:sale_price'),
  condition: tag(xml, 'g:condition'),
  brand: tag(xml, 'g:brand'),
  category: tag(xml, 'g:google_product_category'),
  identifierExists: tag(xml, 'g:identifier_exists'),
  gtin: tag(xml, 'g:gtin'),
  mpn: tag(xml, 'g:mpn'),
}));

const required = ['id','title','description','link','image','availability','price','condition','brand','category'];
const missingRequired = items
  .map((item) => ({ id: item.id, missing: required.filter((field) => !item[field]) }))
  .filter((row) => row.missing.length);
const ids = items.map((item) => item.id).filter(Boolean);
const duplicateIds = unique(ids.filter((id, index) => ids.indexOf(id) !== index));
const malformedPrices = items.filter((item) => !/^\d+(?:\.\d{2})? [A-Z]{3}$/.test(item.price));
const invalidSalePrices = items.filter((item) => item.salePrice && Number.parseFloat(item.salePrice) >= Number.parseFloat(item.price));
const invalidAvailability = items.filter((item) => !['in_stock','out_of_stock','preorder','backorder'].includes(item.availability));
const identifierConflicts = items.filter((item) => item.identifierExists === 'no' && (item.gtin || item.mpn));

const knownDraftHandles = [
  'pure-cotton-gamthi-work-navratri-lehenga-choli-set',
  'pink-pure-rayon-gamthi-gota-patti-navratri-lehenga-choli-set',
  'red-pure-cotton-gamthi-mirror-work-navratri-lehenga-choli-set',
  'blue-white-muslin-kutchi-mirror-digital-print-lehenga-choli-set',
  'maroon-pure-cotton-gamthi-mirror-navratri-lehenga-choli-set',
  'blue-cora-cotton-bandhej-gamthi-navratri-lehenga-top-set',
  'lime-white-pure-cotton-mirror-gota-patti-lehenga-choli-set',
  'red-pure-cotton-mirror-work-navratri-lehenga-set-with-purse',
  'muslin-cotton-real-mirror-work-navratri-lehenga-choli-set',
  'butter-silk-digital-print-mirror-work-navratri-lehenga-choli-set',
  'butter-silk-real-mirror-work-navratri-lehenga-choli-set',
  'black-butter-silk-real-mirror-gota-patti-navratri-lehenga-choli',
  'dola-silk-bandhani-ajrakh-navratri-chaniya-choli-set',
  'soft-gaji-silk-zari-border-navratri-lehenga-choli-set',
  'black-jam-cotton-8-meter-flare-navratri-lehenga-set',
  'black-maroon-rayon-kodi-lace-navratri-lehenga-choli-set',
  '__connector_schema_probe_do_not_save__',
];
const draftLeakage = items.filter((item) => knownDraftHandles.some((handle) => item.link.includes(handle)));

const sitemapUrls = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decode(match[1].trim()));
const duplicateSitemapUrls = unique(sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index));
const sitemapQueryUrls = sitemapUrls.filter((url) => url.includes('?'));
const sitemapNonCanonicalOrigins = sitemapUrls.filter((url) => !url.startsWith('https://luxemia.shop/'));
const sitemapProductUrls = sitemapUrls.filter((url) => url.includes('/product/'));
const feedBaseProductLinks = unique(items.map((item) => item.link.split('?')[0]).filter((url) => url.includes('/product/')));
const feedProductsMissingFromSitemap = feedBaseProductLinks.filter((url) => !sitemapUrls.includes(url));
const sitemapProductsMissingFromFeed = sitemapProductUrls.filter((url) => !feedBaseProductLinks.includes(url));

const robotsChecks = {
  sitemapDeclared: /Sitemap:\s*https:\/\/luxemia\.shop\/sitemap\.xml/i.test(robots),
  allowsVariant: /Allow:\s*\/\*\?variant=\*/i.test(robots),
  blocksSearch: /Disallow:\s*\/search/i.test(robots),
  blocksCheckout: /Disallow:\s*\/checkout/i.test(robots),
  hasCleanParam: /Clean-param:/i.test(robots),
};

const summary = {
  generatedAt: new Date().toISOString(),
  feed: {
    bytes: Buffer.byteLength(feed),
    itemCount: items.length,
    productGroupCount: unique(items.map((item) => item.groupId)).length,
    baseProductLinkCount: feedBaseProductLinks.length,
    missingRequiredCount: missingRequired.length,
    missingRequired: missingRequired.slice(0, 20),
    duplicateIdCount: duplicateIds.length,
    duplicateIds: duplicateIds.slice(0, 20),
    malformedPriceCount: malformedPrices.length,
    invalidSalePriceCount: invalidSalePrices.length,
    invalidAvailabilityCount: invalidAvailability.length,
    identifierConflictCount: identifierConflicts.length,
    draftLeakageCount: draftLeakage.length,
    draftLeakage: draftLeakage.map((item) => ({ id: item.id, title: item.title, link: item.link })),
  },
  sitemap: {
    bytes: Buffer.byteLength(sitemap),
    urlCount: sitemapUrls.length,
    productUrlCount: sitemapProductUrls.length,
    duplicateUrlCount: duplicateSitemapUrls.length,
    queryUrlCount: sitemapQueryUrls.length,
    nonCanonicalOriginCount: sitemapNonCanonicalOrigins.length,
    feedProductsMissingFromSitemapCount: feedProductsMissingFromSitemap.length,
    feedProductsMissingFromSitemap: feedProductsMissingFromSitemap.slice(0, 30),
    sitemapProductsMissingFromFeedCount: sitemapProductsMissingFromFeed.length,
    sitemapProductsMissingFromFeed: sitemapProductsMissingFromFeed.slice(0, 30),
  },
  robots: robotsChecks,
};
summary.passed =
  items.length > 0 &&
  missingRequired.length === 0 &&
  duplicateIds.length === 0 &&
  malformedPrices.length === 0 &&
  invalidSalePrices.length === 0 &&
  invalidAvailability.length === 0 &&
  identifierConflicts.length === 0 &&
  draftLeakage.length === 0 &&
  duplicateSitemapUrls.length === 0 &&
  sitemapQueryUrls.length === 0 &&
  sitemapNonCanonicalOrigins.length === 0 &&
  feedProductsMissingFromSitemap.length === 0 &&
  Object.values(robotsChecks).every(Boolean);

fs.writeFileSync(path.join(root, 'public', 'gsc-gmc-build-audit.json'), JSON.stringify(summary, null, 2));
console.log('GSC_GMC_BUILD_AUDIT_START');
console.log(JSON.stringify(summary));
console.log('GSC_GMC_BUILD_AUDIT_END');
if (!summary.passed) process.exitCode = 2;
