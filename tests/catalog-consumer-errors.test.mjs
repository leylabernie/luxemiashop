import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => readFile(path.join(projectRoot, relativePath), 'utf8');

const [
  catalogLoadError,
  collections,
  mehendi,
  eid,
  haldi,
  indowestern,
  navratri,
  newArrivalsPage,
  styleQuiz,
  shopByCategory,
  featuredProducts,
  trendingNow,
  homeNewArrivals,
  nriLanding,
] = await Promise.all([
  read('src/components/collections/CatalogLoadError.tsx'),
  read('src/pages/Collections.tsx'),
  read('src/pages/MehendiOutfits.tsx'),
  read('src/pages/EidOutfits.tsx'),
  read('src/pages/HaldiOutfits.tsx'),
  read('src/pages/Indowestern.tsx'),
  read('src/pages/NavratriOutfits.tsx'),
  read('src/pages/NewArrivals.tsx'),
  read('src/pages/StyleQuiz.tsx'),
  read('src/components/home/ShopByCategory.tsx'),
  read('src/components/home/FeaturedProducts.tsx'),
  read('src/components/home/TrendingNow.tsx'),
  read('src/components/home/NewArrivals.tsx'),
  read('src/pages/nri/NRILandingPage.tsx'),
]);

test('catalog retry state identifies unavailable inventory without claiming an empty catalog', () => {
  assert.match(catalogLoadError, /role="alert"/);
  assert.match(catalogLoadError, /Current inventory could not be loaded/);
  assert.match(catalogLoadError, /<a href=\{retryHref\}>Try again<\/a>/);
  assert.doesNotMatch(catalogLoadError, /No products|0 (?:products|styles)/i);
});

test('catalog and occasion pages suppress ItemList data and decision support on fetch errors', () => {
  const pages = [
    ['all collections', collections, '/collections'],
    ['mehendi', mehendi, '/collections/mehendi-outfits'],
    ['Eid', eid, '/collections/eid-outfits'],
    ['haldi', haldi, '/collections/haldi-outfits'],
    ['Indo-Western', indowestern, '/indowestern'],
    ['Navratri', navratri, '/collections/navratri-outfits'],
    ['new arrivals', newArrivalsPage, '/new-arrivals'],
  ];

  for (const [label, source, retryHref] of pages) {
    assert.match(source, /useShopifyProducts\([\s\S]*?\);/, `${label} reads catalog state`);
    assert.match(source, /\berror\b/, `${label} reads the hook error`);
    assert.match(
      source,
      /collection=\{!isLoading && !error && collectionItems\.length > 0/,
      `${label} does not emit an empty or failed ItemList`,
    );
    assert.ok(
      source.includes(`<CatalogLoadError retryHref="${retryHref}" />`),
      `${label} renders a retry state`,
    );
    assert.match(source, /\{!error \? <CollectionDecisionSupport/, `${label} suppresses inventory-derived support copy on error`);
  }
});

test('successful empty occasion responses keep explicit true-empty states', () => {
  assert.match(mehendi, /No current mehendi-specific products/);
  assert.match(eid, /No current Eid-specific products/);
  assert.match(haldi, /No haldi-specific items available right now/);
  assert.match(indowestern, /No Indo-Western styles available right now/);
  assert.match(navratri, /No current Navratri styles were returned/);
  assert.match(newArrivalsPage, /No new arrivals in this category yet/);
  assert.match(collections, /No products found matching your criteria/);
});

test('interactive and homepage consumers do not turn catalog failures into false empty claims', () => {
  assert.match(styleQuiz, /error: productsError/);
  assert.match(styleQuiz, /productsError \? \(\s*<CatalogLoadError retryHref="\/style-quiz"/);

  assert.match(shopByCategory, /const \{ products, isLoading, error \} = useShopifyProducts\(\)/);
  assert.match(shopByCategory, /error \? \(\s*<CatalogLoadError retryHref="\/"/);
  assert.match(featuredProducts, /const \{ products, isLoading, error \} = useShopifyProducts\(\)/);
  assert.match(featuredProducts, /error \? \(\s*<CatalogLoadError retryHref="\/"/);

  assert.match(trendingNow, /if \(error\) return null;/);
  assert.match(homeNewArrivals, /if \(error \|\| totalNew === 0\) return null;/);
  assert.match(nriLanding, /!error && featuredProducts\.length > 0/);
});
