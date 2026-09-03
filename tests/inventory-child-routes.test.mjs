import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const projectRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => readFile(path.join(projectRoot, relativePath), 'utf8');
const require = createRequire(import.meta.url);
const {
  parseJsonLdScripts,
  validateItemListParity,
} = require('../scripts/prerender-validation-helpers.cjs');

const [
  app,
  hook,
  inventoryPage,
  semanticPage,
  categoryListing,
  collectionDecisionSupport,
  customizablePage,
  readyToShipPage,
  shopifyCollectionPage,
  shopifyCollectionHook,
  shopifySource,
  completeTheLook,
  standards,
  prerender,
  routeGenerator,
  routeManifest,
  autoRoutes,
  sitemapGenerator,
  approvedInventorySource,
  llmsFull,
  collectionsPage,
  weddingGuestPage,
  diwaliPage,
  eligibilitySource,
  coverageValidator,
  productPrerenderValidator,
] = await Promise.all([
  read('src/App.tsx'),
  read('src/hooks/useShopifyProducts.ts'),
  read('src/pages/InventoryBackedCollection.tsx'),
  read('src/pages/SemanticCommercePage.tsx'),
  read('src/components/collections/CategoryListing.tsx'),
  read('src/components/collections/CollectionDecisionSupport.tsx'),
  read('src/pages/CustomizableOutfits.tsx'),
  read('src/pages/ReadyToShip.tsx'),
  read('src/pages/ShopifyCollection.tsx'),
  read('src/hooks/useShopifyCollection.ts'),
  read('src/lib/shopify.ts'),
  read('src/components/product/CompleteTheLook.tsx'),
  read('src/config/collectionStandards.ts'),
  read('scripts/prerender.js'),
  read('scripts/generate-routes.cjs'),
  read('scripts/routes.json'),
  read('src/lib/autoRoutes.ts'),
  read('scripts/generate-sitemap.cjs'),
  read('scripts/approved-sitemap-inventory.json'),
  read('public/llms-full.txt'),
  read('src/pages/Collections.tsx'),
  read('src/pages/WeddingGuestOutfits.tsx'),
  read('src/pages/DiwaliOutfits.tsx'),
  read('src/lib/intentCollectionEligibility.ts'),
  read('scripts/verify-prerender-coverage.cjs'),
  read('scripts/validate-product-prerender-integrity.cjs'),
]);

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-intent-routes-'));
await build({
  entryPoints: {
    eligibility: path.join(projectRoot, 'src/lib/intentCollectionEligibility.ts'),
    productDescriptionEnrichment: path.join(projectRoot, 'src/lib/productDescriptionEnrichment.ts'),
    standards: path.join(projectRoot, 'src/config/collectionStandards.ts'),
    shopify: path.join(projectRoot, 'src/lib/shopify.ts'),
    shopifyCollectionHook: path.join(projectRoot, 'src/hooks/useShopifyCollection.ts'),
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: temporaryDirectory,
  logLevel: 'silent',
  define: {
    'import.meta.env': '{}',
  },
  plugins: [{
    name: 'stub-catalog-error-toast',
    setup(buildContext) {
      buildContext.onResolve({ filter: /^sonner$/ }, () => ({
        namespace: 'catalog-error-test',
        path: 'sonner',
      }));
      buildContext.onLoad({ filter: /.*/, namespace: 'catalog-error-test' }, () => ({
        contents: 'export const toast = { error() {} };',
        loader: 'js',
      }));
    },
  }],
});
const {
  isDurableIntentCollectionSlug,
  isEligibleForDurableIntent,
  isIntentEvidenceSafeTag,
} = await import(pathToFileURL(path.join(temporaryDirectory, 'eligibility.js')).href);
const { sanitizeProductTitle } = await import(
  pathToFileURL(path.join(temporaryDirectory, 'productDescriptionEnrichment.js')).href
);
const { getCollectionStandard } = await import(pathToFileURL(path.join(temporaryDirectory, 'standards.js')).href);
const {
  fetchAllProducts,
  fetchCollectionByHandle,
  fetchProductByHandle,
  fetchProducts,
} = await import(pathToFileURL(path.join(temporaryDirectory, 'shopify.js')).href);
const { selectShopifyCollectionStateForHandle } = await import(pathToFileURL(path.join(temporaryDirectory, 'shopifyCollectionHook.js')).href);

test.after(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

const approvedInventory = JSON.parse(approvedInventorySource);
const generatedRoutePaths = new Set(JSON.parse(routeManifest));
const autoRoutePaths = new Set(
  [...autoRoutes.matchAll(/^\s*['"]([^'"]+)['"],?$/gm)].map((match) => match[1]),
);

const routes = [
  ['/collections/wedding-guest-lehengas', 'occasion:wedding-guest-lehengas'],
  ['/collections/wedding-guest-kurta-sets', 'occasion:wedding-guest-kurta-sets'],
  ['/collections/diwali-womenswear', 'occasion:diwali-womenswear'],
  ['/collections/diwali-menswear', 'occasion:diwali-menswear'],
  ['/collections/navratri-chaniya-choli', 'occasion:navratri-chaniya'],
  ['/collections/garba-outfits', 'occasion:garba'],
  ['/collections/groomsmen-outfits', 'occasion:groomsmen'],
  ['/collections/sangeet-outfits', 'occasion:sangeet'],
  ['/collections/reception-outfits', 'occasion:reception'],
];

test('inventory-backed intent collections have one canonical source-to-discovery path', () => {
  const faqSchemaPaths = prerender.match(
    /const INVENTORY_BACKED_COLLECTION_PATHS = new Set\(\[([\s\S]*?)\]\);/,
  )?.[1] || '';
  for (const [routePath, category] of routes) {
    const slug = routePath.slice('/collections/'.length);
    const inventoryStart = inventoryPage.indexOf(`  '${slug}': withCollectionStandard({`);
    const inventoryEnd = inventoryPage.indexOf('\n  }),', inventoryStart);
    const inventoryBlock = inventoryPage.slice(inventoryStart, inventoryEnd);
    const prerenderStart = prerender.indexOf(`    path: '${routePath}',`);
    const prerenderEnd = prerender.indexOf('\n  },', prerenderStart);
    const routeBlock = prerender.slice(prerenderStart, prerenderEnd);
    assert.ok(
      app.includes(`<Route path="${routePath}" element={<Suspense fallback={<PageLoader />}><InventoryBackedCollection landing="${slug}" /></Suspense>} />`),
      `${routePath} is bound to its matching inventory landing`,
    );
    assert.ok(inventoryStart >= 0 && inventoryEnd > inventoryStart, `${routePath} has a bounded shared React config`);
    assert.match(inventoryBlock, new RegExp(`slug: '${slug}'`));
    assert.match(inventoryBlock, new RegExp(`category: '${category}'`));
    assert.match(standards, new RegExp(`'${routePath}': \\{[^\\n]*category: '${category}'`));
    assert.ok(prerenderStart >= 0 && prerenderEnd > prerenderStart, `${routePath} has a bounded prerender config`);
    assert.match(routeBlock, new RegExp(`category: '${category}'`));
    for (const field of ['category', 'title', 'description', 'h1']) {
      const pattern = new RegExp(`\\n\\s+${field}: '([^'\\n]+)'`);
      assert.equal(
        inventoryBlock.match(pattern)?.[1],
        routeBlock.match(pattern)?.[1],
        `${routePath} ${field} matches across React and prerender`,
      );
    }
    assert.equal(
      isDurableIntentCollectionSlug(category.slice('occasion:'.length)),
      true,
      `${routePath} uses the shared executable eligibility helper`,
    );
    assert.ok(routeGenerator.includes(`'${routePath}'`));
    assert.ok(generatedRoutePaths.has(routePath));
    assert.ok(autoRoutePaths.has(routePath));
    assert.ok(sitemapGenerator.includes(`loc: '${routePath}'`));
    assert.ok(approvedInventory.paths.includes(routePath));
    assert.ok(llmsFull.includes(`https://luxemia.shop${routePath}`));
    assert.ok(faqSchemaPaths.includes(`'${routePath}'`), `${routePath} emits prerendered FAQ schema`);

    const standard = getCollectionStandard(routePath);
    assert.ok(standard, `${routePath} has a shared collection standard`);
    assert.ok(
      standard.faqs.some((faq) => /Which products appear in/i.test(faq.question)),
      `${routePath} has a route-specific product-eligibility FAQ`,
    );
    assert.match(routeBlock, /content: '',/, `${routePath} has no duplicate prerender copy`);
    const wordCount = standard.directAnswer.trim().split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount >= 40 && wordCount <= 70, `${routePath} has ${wordCount} direct-answer words`);
  }
  assert.match(inventoryPage, /answer: standard\.directAnswer/);
  assert.match(prerender, /data-collection-direct-answer/);
});

test('client and prerender share strict durable-intent eligibility with representative fixtures', () => {
  assert.match(hook, /isEligibleForDurableIntent\(\{[\s\S]*?title: sanitizeProductTitle\(product\.node\.title\),[\s\S]*?\}, occasion\)/);
  assert.match(prerender, /loadTsModule\('src\/lib\/intentCollectionEligibility\.ts'\)/);
  assert.match(prerender, /isEligibleForDurableIntent\(buildHydrationProductNode\(product\), occasion\)/);
  assert.match(prerender, /matchesOccasionProduct\(hydrationProduct, signalOccasion\)/);
  assert.match(eligibilitySource, /occasionMetafield/);
  assert.match(prerender, /occasionMetafield: metafield/);
  assert.match(prerender, /genderMetafield: metafield/);
  assert.match(prerender, /occasionMetafield: product\.occasionMetafield \|\| null/);
  assert.match(prerender, /genderMetafield: product\.genderMetafield \|\| null/);
  assert.match(prerender, /filter\(tag => isIntentEvidenceSafeTag\(String\(tag\)\)\)/);
  assert.match(prerender, /intent product\(s\) that would disappear after hydration/);

  const product = ({
    title,
    productType,
    tags = [],
    availableForSale = true,
    variantAvailable = true,
    variants,
    ...extra
  }) => ({
    ...extra,
    title,
    productType,
    tags,
    availableForSale,
    variants: variants || { edges: [{ node: { title: 'Default', availableForSale: variantAvailable, selectedOptions: [] } }] },
  });
  const expect = (intent, fixture, eligible) => assert.equal(
    isEligibleForDurableIntent(product(fixture), intent),
    eligible,
    `${intent}: ${fixture.title}`,
  );

  expect('wedding-guest-lehengas', { title: 'Blue Lehenga for Wedding-Guests', productType: 'Lehenga Choli' }, true);
  expect('wedding-guest-lehengas', { title: 'Sangeet Bridesmaid Lehenga', productType: 'Lehenga Choli' }, true);
  expect('wedding-guest-lehengas', { title: 'Reception Lehenga', productType: 'Lehenga Choli', tags: ['bridesmaids'] }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', occasionMetafield: { value: '["wedding guest"]' } }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['wedding guest Canada'] }, false);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['wedding_guest;shipping_over_100'] }, false);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['international_shipping', 'wedding guest'] }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['global-delivery', 'wedding guest'] }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['free:shipping', 'wedding guest'] }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['wedding guest UK shipping'] }, false);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['wedding guest 5-day delivery USA'] }, false);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['ships from USA', 'wedding guest'] }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['united:states', 'wedding guest'] }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['bridal', 'wedding guest'] }, false);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['role:bridesmaid', 'bridal'] }, true);
  expect('wedding-guest-lehengas', { title: 'Brides Lehenga for Sangeet', productType: 'Lehenga Choli', tags: ['wedding guest'] }, false);
  expect('wedding-guest-lehengas', { title: "Bride's Maid Lehenga", productType: 'Lehenga Choli', tags: ['bridal'] }, true);
  expect('wedding-guest-lehengas', { title: 'Bride’s Maid Lehenga', productType: 'Lehenga Choli', tags: ['bridal'] }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', occasionMetafield: { value: "bride's maid" } }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', metadata: { occasion: ['bride’s maid'] } }, true);
  expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', metadata: { occasion: ["brides' maid"] } }, true);
  for (const extra of [
    { tags: ['wedding guest', 'role:bridal'] },
    { tags: ['wedding guest', 'occasion:bridal'] },
    { tags: ['wedding guest', 'bridal-lehenga'] },
    { tags: ['wedding guest'], occasionMetafield: { value: 'bridal' } },
  ]) {
    expect('wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', ...extra }, false);
  }
  const importedBoilerplate = product({
    title: 'Blue Wedding Guest Lehenga | Handcrafted Indian Bridal Luxury',
    productType: 'Lehenga Choli',
  });
  assert.equal(isEligibleForDurableIntent(importedBoilerplate, 'wedding-guest-lehengas'), false);
  assert.equal(isEligibleForDurableIntent({
    ...importedBoilerplate,
    title: sanitizeProductTitle(importedBoilerplate.title),
  }, 'wedding-guest-lehengas'), true, 'client normalization matches prerender eligibility input');
  expect('wedding-guest-lehengas', { title: 'Bridesmaid Lehenga Necklace', productType: 'Jewelry Set' }, false);
  expect('wedding-guest-lehengas', { title: 'Bridal Lehenga for Sangeet', productType: 'Bridal Lehenga', tags: ['wedding guest'] }, false);
  expect('wedding-guest-lehengas', { title: 'Reception Lehenga', productType: 'Lehenga Choli', tags: ['reception'] }, false);
  expect('wedding-guest-kurta-sets', { title: 'Kurta Dhoti Set for Wedding Guests', productType: "Men's Kurta" }, true);
  expect('wedding-guest-kurta-sets', { title: 'Kurta with Nehru Jacket', productType: "Men's Kurta", tags: ['wedding_guest'] }, true);
  expect('wedding-guest-kurta-sets', { title: 'Kurta Pajama Set', productType: 'Kurta Set', occasionMetafield: { value: 'wedding guest' }, genderMetafield: { value: 'male' } }, true);
  expect('wedding-guest-kurta-sets', { title: "Men's Kurta for Reception", productType: "Men's Kurta", tags: ['wedding guest'] }, false);
  expect('wedding-guest-kurta-sets', { title: 'Wedding Guest Kurta with Waistcoat', productType: 'Kurta', genderMetafield: { value: 'men' } }, true);
  expect('wedding-guest-kurta-sets', { title: "Women's Wedding Guest Kurta Set", productType: 'Kurta Set' }, false);
  expect('wedding-guest-kurta-sets', { title: 'Wedding Guest Kurta Set', productType: 'Womenswear' }, false);
  expect('wedding-guest-kurta-sets', { title: 'Wedding Guest Blouse for Lehenga', productType: 'Fashion' }, false);
  expect('wedding-guest-kurta-sets', { title: 'Wedding Guest Waistcoat for Kurta Set', productType: 'Fashion' }, false);
  expect('wedding-guest-lehengas', { title: 'Blouse Only - Wedding Guest Lehenga', productType: 'Fashion' }, false);
  expect('wedding-guest-lehengas', { title: 'Wedding Guest Lehenga Blouse', productType: 'Fashion' }, false);
  expect('diwali-womenswear', { title: 'Mirror Work Three-Piece Set', productType: 'Three-Piece Set', tags: ['Diwali'] }, true);
  expect('diwali-womenswear', { title: 'Festive Skirt Set', productType: 'Skirt Set', tags: ['festival'] }, true);
  expect('diwali-womenswear', { title: 'Halter Blouse', productType: 'Saree Blouse', tags: ['Diwali'] }, false);
  expect('diwali-womenswear', { title: 'Kundan Necklace', productType: 'Jewelry Set', tags: ['festival'] }, false);
  expect('diwali-womenswear', { title: 'Diwali Lehenga Necklace', productType: 'Jewelry Set' }, false);
  expect('diwali-womenswear', { title: 'Diwali Chaniya Choli Set', productType: 'Chaniya Choli' }, true);
  expect('diwali-womenswear', { title: 'Mirror Work Lehenga', productType: 'Lehenga Choli', tags: ['diwali_womenswear'] }, true);
  expect('diwali-menswear', { title: "Men's Festive Kurta", productType: "Men's Kurta", tags: ['Diwali'] }, true);
  expect('diwali-menswear', { title: "Men's Festive Turban", productType: 'Turban', tags: ['Diwali', 'men'] }, false);
  expect('diwali-menswear', { title: "Men's Diwali Kurta Necklace", productType: 'Jewelry Set' }, false);
  expect('diwali-menswear', { title: 'Diwali Kurta', productType: 'Kurta', genderMetafield: { value: 'men' } }, true);
  expect('diwali-menswear', { title: 'Diwali Nehru Jacket for Men', productType: 'Nehru Jacket' }, true);
  expect('diwali-menswear', { title: 'Diwali Modi Jacket for Men', productType: 'Modi Jacket' }, true);
  expect('diwali-menswear', { title: 'Diwali Kurta', productType: 'Kurta', occasionMetafield: { value: 'male' } }, false);
  expect('diwali-menswear', { title: 'Diwali Kurta', productType: 'Kurta', occasionMetafield: { value: 'women' }, genderMetafield: { value: 'men' } }, true);
  expect('diwali-menswear', { title: "Women's Diwali Kurta Set", productType: 'Kurta Set' }, false);
  expect('diwali-menswear', { title: 'Diwali Kurta Set', productType: "Women's Wear" }, false);
  expect('diwali-menswear', { title: 'Festive Kurta', productType: 'Kurta', tags: ['diwali_menswear'] }, true);
  expect('diwali-menswear', { title: "Men's Diwali Kurta", productType: 'Kurta', tags: ['gender_female'] }, false);
  expect('navratri-chaniya', { title: 'Dola Silk Navratri Chaniya Choli Set', productType: 'Lehenga Choli' }, true);
  expect('navratri-chaniya', { title: 'Navratri Choli Necklace', productType: 'Jewelry Set' }, false);
  expect('navratri-chaniya', { title: 'Navratri Choker Set', productType: 'Lehenga Choli' }, false);
  expect('navratri-chaniya', { title: 'Navratri Lehenga Choli Blouse Only', productType: 'Fashion' }, false);
  expect('navratri-chaniya', { title: 'Chaniya Choli Set', productType: 'Lehenga Choli', tags: ['navratri_outfit'] }, true);
  expect('garba', { title: 'Mirror Work Garba Lehenga', productType: 'Lehenga Choli' }, true);
  expect('garba', { title: 'Garba Dandiya Sticks', productType: 'Accessories' }, false);
  expect('garba', { title: 'Garba Waist Belt', productType: 'Lehenga Choli' }, false);
  expect('garba', { title: 'Mirror Work Garba Lehenga', productType: 'Lehenga Choli', availableForSale: false }, false);
  expect('garba', { title: 'Mirror Work Lehenga', productType: 'Lehenga Choli', tags: ['garba_outfit'] }, true);
  expect('groomsmen', { title: 'Groomsmen Kurta Pajama Set', productType: 'Kurta Set' }, true);
  expect('groomsmen', { title: 'Groomsmen Kundan Necklace', productType: 'Jewelry Set', tags: ['groomsmen'] }, false);
  expect('groomsmen', { title: 'Groomsmen Cufflinks for Kurta', productType: 'Cufflinks', genderMetafield: { value: 'men' } }, false);
  expect('groomsmen', { title: 'Groomsmen Saree for Groom', productType: 'Saree' }, false);
  expect('groomsmen', { title: 'Groomsmen Kurta', productType: 'Kurta', genderMetafield: { value: 'men' } }, true);
  expect('groomsmen', { title: 'Groomsmen Kurta', productType: 'Kurta', tags: ['groom'] }, false);
  expect('groomsmen', { title: 'Groom Groomsmen Kurta', productType: 'Kurta' }, false);
  expect('groomsmen', { title: 'Groomsmen Groom Kurta', productType: 'Kurta' }, false);
  expect('groomsmen', { title: 'Groomsmen Kurta', productType: 'Groom Kurta' }, false);
  expect('groomsmen', { title: "Women's Groomsmen Kurta Set", productType: 'Kurta Set' }, false);
  expect('groomsmen', { title: 'Groomsmen Kurta Set', productType: 'Womenswear' }, false);
  expect('groomsmen', { title: 'Kurta Pajama Set', productType: 'Kurta Set', tags: ['groomsmen_outfit'] }, true);
  expect('sangeet', { title: 'Sangeet Embroidered Saree', productType: 'Saree' }, true);
  expect('sangeet', { title: 'Sangeet Kundan Necklace', productType: 'Jewelry Set' }, false);
  expect('sangeet', { title: 'Sangeet Choker', productType: 'Saree' }, false);
  expect('sangeet', { title: 'Sangeet Lehenga Blouse', productType: 'Designer Blouse' }, false);
  expect('sangeet', { title: 'Sangeet Saree Blouse Only', productType: 'Fashion' }, false);
  expect('sangeet', { title: 'Saree', productType: 'Saree', genderMetafield: { value: 'sangeet' } }, false);
  expect('sangeet', { title: 'Sangeet Embroidered Saree', productType: 'Saree', variantAvailable: false }, false);
  expect('sangeet', { title: 'Embroidered Saree', productType: 'Saree', tags: ['sangeet_outfit'] }, true);
  expect('reception', { title: 'Reception Indo-Western Gown', productType: 'Indo-Western' }, true);
  expect('reception', { title: 'Reception Kundan Necklace', productType: 'Jewelry Set' }, false);
  expect('reception', { title: 'Reception Brooch', productType: 'Indo-Western' }, false);
  expect('reception', { title: 'Saree', productType: 'Saree', genderMetafield: { value: 'reception' } }, false);
  expect('reception', { title: 'Indo-Western Gown', productType: 'Indo-Western', tags: ['reception_outfit'] }, true);
  expect('reception', {
    title: 'Reception Indo-Western Gown',
    productType: 'Indo-Western',
    variants: { edges: [
      { node: { title: 'Small', availableForSale: false, selectedOptions: [] } },
      { node: { title: 'Medium', availableForSale: true, selectedOptions: [] } },
    ] },
  }, true);
  for (const [intent, fixture] of [
    ['wedding-guest-lehengas', { title: 'Wedding Guest Lehenga Necklace', productType: 'Fashion' }],
    ['wedding-guest-kurta-sets', { title: 'Wedding Guest Kurta Pajama Necklace', productType: 'Fashion' }],
    ['diwali-womenswear', { title: 'Diwali Lehenga Necklace', productType: 'Fashion' }],
    ['diwali-menswear', { title: "Men's Diwali Kurta Necklace", productType: 'Fashion' }],
    ['navratri-chaniya', { title: 'Navratri Chaniya Choli Necklace', productType: 'Fashion' }],
    ['garba', { title: 'Garba Lehenga Necklace', productType: 'Fashion' }],
    ['groomsmen', { title: 'Groomsmen Kurta Pajama Necklace', productType: 'Fashion' }],
    ['sangeet', { title: 'Sangeet Saree Necklace', productType: 'Fashion' }],
    ['reception', { title: 'Reception Lehenga Necklace', productType: 'Fashion' }],
  ]) {
    expect(intent, fixture, false);
  }
  for (const [intent, fixture] of [
    ['wedding-guest-lehengas', { title: 'Wedding Guest Blouse Piece for Lehenga', productType: 'Lehenga Choli' }],
    ['garba', { title: 'Garba Waist Belt Only for Lehenga', productType: 'Lehenga Choli' }],
    ['groomsmen', { title: 'Groomsmen Brooch Only for Kurta', productType: 'Kurta Set', genderMetafield: { value: 'men' } }],
    ['sangeet', { title: 'Sangeet Kundan Necklace Only for Saree', productType: 'Saree' }],
    ['sangeet', { title: 'Sangeet Blouse Piece for Saree', productType: 'Saree' }],
    ['reception', { title: 'Reception Clutch Only for Gown', productType: 'Gown' }],
    ['reception', { title: 'Reception Handbag for Lehenga', productType: 'Handbag' }],
    ['reception', { title: 'Reception Choli Piece for Lehenga', productType: 'Lehenga Choli' }],
  ]) {
    expect(intent, fixture, false);
  }
  for (const [intent, fixture] of [
    ['wedding-guest-lehengas', { title: 'Wedding Guest Lehenga Choli with Dupatta', productType: 'Lehenga Choli with Dupatta' }],
    ['wedding-guest-kurta-sets', { title: 'Wedding Guest Kurta Set with Waistcoat for Reception', productType: "Men's Kurta Set with Stole" }],
    ['diwali-womenswear', { title: 'Diwali Saree with Blouse and Petticoat', productType: 'Saree with Blouse and Petticoat' }],
    ['diwali-menswear', { title: 'Diwali Kurta Set with Stole for Festive Wear', productType: "Men's Kurta Set with Stole" }],
    ['navratri-chaniya', { title: 'Navratri Chaniya Choli with Dupatta', productType: 'Chaniya Choli with Dupatta' }],
    ['garba', { title: 'Garba Lehenga Choli with Dupatta for Dancing', productType: 'Lehenga Choli with Dupatta' }],
    ['groomsmen', { title: 'Groomsmen Kurta Set with Stole', productType: "Men's Kurta Set with Stole" }],
    ['sangeet', { title: 'Sangeet Lehenga Choli with Dupatta for Dancing', productType: 'Lehenga Choli' }],
    ['reception', { title: 'Reception Saree with Blouse for Evening Wear', productType: 'Saree' }],
    ['wedding-guest-lehengas', { title: 'Wedding Guest Lehenga Choli Only for Women', productType: 'Lehenga Choli' }],
    ['groomsmen', { title: 'Groomsmen Kurta Waistcoat Set for Men', productType: "Men's Kurta Set" }],
    ['sangeet', { title: 'Sangeet Saree Blouse Set for Women', productType: 'Saree' }],
    ['reception', { title: 'Reception Lehenga Dupatta Set for Women', productType: 'Lehenga Choli' }],
  ]) {
    expect(intent, fixture, true);
  }
  for (const [intent, fixture] of [
    ['wedding-guest-lehengas', { title: 'Blue Lehenga', productType: 'Lehenga Choli', tags: ['wedding_guest;international'] }],
    ['garba', { title: 'Mirror Work Lehenga', productType: 'Lehenga Choli', tags: ['garba-global'] }],
    ['diwali-womenswear', { title: 'Mirror Work Lehenga', productType: 'Lehenga Choli', tags: ['diwali;freepostage'] }],
    ['navratri-chaniya', { title: 'Mirror Work Lehenga', productType: 'Lehenga Choli', tags: ['navratri;trackingincluded'] }],
    ['sangeet', { title: 'Embroidered Saree', productType: 'Saree', tags: ['sangeet;shippingover100'] }],
    ['reception', { title: 'Indo-Western Gown', productType: 'Indo-Western', tags: ['reception;dispatchwithin2days'] }],
  ]) {
    expect(intent, fixture, false);
  }
  for (const [intent, fixture] of [
    ['wedding-guest-lehengas', { title: 'Wedding Guest Kundan Set for Lehenga', productType: 'Kundan' }],
    ['wedding-guest-kurta-sets', { title: 'Wedding Guest Kundan Set for Kurta Pajama', productType: 'Kundan' }],
    ['diwali-womenswear', { title: 'Diwali Kundan Set for Lehenga', productType: 'Kundan' }],
    ['diwali-menswear', { title: "Men's Diwali Kundan Set for Kurta", productType: 'Kundan' }],
    ['navratri-chaniya', { title: 'Navratri Kundan Set for Chaniya Choli', productType: 'Kundan' }],
    ['garba', { title: 'Garba Polki Set for Lehenga', productType: 'Polki' }],
    ['groomsmen', { title: 'Groomsmen Kundan Set for Kurta', productType: 'Kundan' }],
    ['sangeet', { title: 'Sangeet Uncut Polki Set for Saree', productType: 'Uncut Polki' }],
    ['reception', { title: 'Reception Bridal Set for Lehenga', productType: 'Bridal Set' }],
  ]) {
    expect(intent, fixture, false);
  }
  assert.equal(isIntentEvidenceSafeTag('wedding guest'), true);
  assert.equal(isIntentEvidenceSafeTag('wedding guest Canada'), false);
  for (const unsafeTag of [
    'wedding_guest;shipping_over_100',
    'international_shipping',
    'global-delivery',
    'free_shipping',
    'free:shipping',
    'wedding guest UK shipping',
    'wedding guest 5-day delivery USA',
    'ships from USA',
    'united:states',
    'wedding guest US',
    'wedding_guest;ships_to:CA',
    'Ships worldwide — Sangeet',
    'Ships internationally — Diwali',
    'wedding_guest;ships_within_2_days',
    'wedding_guest;free_postage',
    'wedding_guest;dispatch_in_2_days',
    'wedding_guest;tracking_provided',
    'wedding_guest;international',
    'garba-global',
    'wedding_guest;shippingover100',
    'diwali;freepostage',
    'reception;dispatchwithin2days',
    'navratri;trackingincluded',
  ]) {
    assert.equal(isIntentEvidenceSafeTag(unsafeTag), false, `${unsafeTag} is not intent evidence`);
  }
  for (const readyToShipTag of [
    'ready-to-ship',
    'fulfillment:ready-to-ship',
    'availability:ready_to_ship',
    'status=ready to ship',
    'shipping:ready-to-ship',
  ]) {
    assert.equal(isIntentEvidenceSafeTag(readyToShipTag), true, `${readyToShipTag} remains a supported classification`);
  }

  for (const [intent, decodedOccasion, fixture] of [
    ['wedding-guest-lehengas', 'wedding guest', { title: 'Blue Lehenga', productType: 'Lehenga Choli' }],
    ['wedding-guest-kurta-sets', 'wedding guest', { title: 'Kurta Pajama Set', productType: 'Kurta Set', genderMetafield: { value: 'men' } }],
    ['diwali-womenswear', 'diwali', { title: 'Mirror Work Lehenga', productType: 'Lehenga Choli' }],
    ['diwali-menswear', 'diwali', { title: 'Festive Kurta', productType: 'Kurta', genderMetafield: { value: 'men' } }],
    ['navratri-chaniya', 'navratri', { title: 'Chaniya Choli Set', productType: 'Lehenga Choli' }],
    ['garba', 'garba', { title: 'Mirror Work Lehenga', productType: 'Lehenga Choli' }],
    ['groomsmen', 'groomsmen', { title: 'Kurta Pajama Set', productType: 'Kurta Set', genderMetafield: { value: 'men' } }],
    ['sangeet', 'sangeet', { title: 'Embroidered Saree', productType: 'Saree' }],
    ['reception', 'reception', { title: 'Indo-Western Gown', productType: 'Indo-Western' }],
  ]) {
    const escaped = decodedOccasion.replace('a', '\\u0061').replace('e', '\\u0065').replace('m', '\\u006d').replace(' ', '\\u0020');
    const rawMetafieldProduct = product({
      ...fixture,
      occasionMetafield: { value: `["${escaped}"]` },
    });
    const parsedMetadataProduct = {
      ...rawMetafieldProduct,
      metadata: { occasion: [decodedOccasion] },
    };
    assert.equal(isEligibleForDurableIntent(rawMetafieldProduct, intent), true, `${intent} decodes raw occasion metafield evidence`);
    assert.equal(
      isEligibleForDurableIntent(rawMetafieldProduct, intent),
      isEligibleForDurableIntent(parsedMetadataProduct, intent),
      `${intent} raw and parsed occasion evidence stay in parity`,
    );
  }

  const listingQueryStart = shopifySource.indexOf('const STOREFRONT_LISTING_QUERY = `');
  const listingQueryEnd = shopifySource.indexOf('const PRODUCT_BY_HANDLE_QUERY = `', listingQueryStart);
  assert.ok(listingQueryStart >= 0 && listingQueryEnd > listingQueryStart, 'listing query is bounded');
  assert.match(
    shopifySource.slice(listingQueryStart, listingQueryEnd),
    /variants\(first: 100\)/,
    'full-catalog refresh sees later orderable variants',
  );
  assert.match(hook, /const CACHE_VERSION = 'v14';/, 'the expanded-variant query invalidates old one-variant browser caches');
  assert.match(shopifySource, /import \{ GONE_PRODUCT_HANDLES \} from '\.\/goneRoutes';/);
  assert.match(shopifySource, /!GONE_PRODUCT_HANDLES\.has\(product\.node\.handle\)/);
  assert.match(prerender, /const sanitizeProductTitle = productDescriptionModule\.sanitizeProductTitle/);


  assert.match(inventoryPage, /noIndexFollow=\{!isLoading && !error && sortedProducts\.length === 0\}/);
  assert.match(prerender, /generateItemListJsonLd\(collectionProducts\.slice\(0, 30\), route\.h1, route\.path\)/);
  assert.match(hook, /function getInitialData[\s\S]*?prerenderedFeaturedRank: index \+ 1/);
  assert.match(prerender, /generateFaqPageJsonLd\(collectionStandard\.faqs\)/);
  assert.match(prerender, /route\.category\s*\? 'collection'/);
  assert.match(prerender, /<meta property="og:type" content="\$\{openGraphType\}"/);
  assert.match(coverageValidator, /parseJsonLdScripts\(html, route, schemaFailures\)/);
  assert.match(coverageValidator, /validateItemListParity\(itemList, payloadHandles\)/);
  assert.doesNotMatch(coverageValidator, /<script type="application\\\/ld\\\+json">/);
  assert.match(productPrerenderValidator, /validateItemListParity\(itemLists\[0\], payloadHandles\)/);
  assert.match(productPrerenderValidator, /parseJsonLdScripts\(html, route, schemaFailures\)/);
  assert.doesNotMatch(productPrerenderValidator, /sameSet\(sortedUnique\(itemHandles\), sortedUnique\(payloadHandles\)\)/);
});

test('prerender validation accepts attributed schemas and the intentional 30-product ItemList cap', () => {
  const payloadHandles = Array.from({ length: 50 }, (_, index) => `product-${index + 1}`);
  const itemList = {
    '@type': 'ItemList',
    numberOfItems: 30,
    itemListElement: payloadHandles.slice(0, 30).map((handle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://luxemia.shop/product/${handle}`,
    })),
  };
  const html = [
    '<script data-prerender-schema type="application/ld+json">',
    JSON.stringify(itemList),
    '</script>',
    '<script nonce="fixture" TYPE="application/ld+json" data-prerender-schema>',
    JSON.stringify({ '@type': 'CollectionPage' }),
    '</script>',
  ].join('');
  const failures = [];
  const parsed = parseJsonLdScripts(html, '/collections/fixture', failures);

  assert.deepEqual(failures, []);
  assert.equal(parsed.length, 2);
  assert.deepEqual(parsed[0].schema, itemList);
  assert.equal(validateItemListParity(parsed[0].schema, payloadHandles), null);

  const shortPayload = payloadHandles.slice(0, 25);
  const nestedUrlItemList = {
    '@type': 'ItemList',
    numberOfItems: 25,
    itemListElement: shortPayload.map((handle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: { url: `https://luxemia.shop/product/${handle}` },
    })),
  };
  assert.equal(validateItemListParity(nestedUrlItemList, shortPayload), null);

  const wrongLastProduct = structuredClone(itemList);
  wrongLastProduct.itemListElement[29].url = 'https://luxemia.shop/product/wrong-product';
  assert.match(validateItemListParity(wrongLastProduct, payloadHandles), /do not match/);

  const wrongCount = { ...itemList, numberOfItems: 50 };
  assert.match(validateItemListParity(wrongCount, payloadHandles), /do not match/);

  const wrongOrigin = structuredClone(itemList);
  wrongOrigin.itemListElement[0].url = 'https://evil.example/product/product-1';
  assert.match(validateItemListParity(wrongOrigin, payloadHandles), /do not match/);

  const wrongPosition = structuredClone(itemList);
  wrongPosition.itemListElement[0].position = 2;
  assert.match(validateItemListParity(wrongPosition, payloadHandles), /do not match/);
});

test('catalog fetch failures stay indexable and show a retry state without claiming zero inventory', () => {
  assert.match(inventoryPage, /const \{ products, isLoading, error \} = useShopifyProducts\(config\.category\)/);
  assert.match(inventoryPage, /collection=\{!isLoading && !error/);
  assert.match(inventoryPage, /: error\s*\? 'Current inventory is temporarily unavailable'/);
  assert.match(inventoryPage, /\) : error \? \(\s*<CatalogLoadError/);
  assert.match(inventoryPage, /<a href=\{retryHref\}>Try again<\/a>/);
  assert.match(inventoryPage, /No verified products currently available/);

  for (const [label, source, category, retryHref] of [
    ['wedding-guest parent', weddingGuestPage, 'occasion:wedding-guest', '/collections/wedding-guest-outfits'],
    ['Diwali parent', diwaliPage, 'occasion:diwali', '/collections/diwali-outfits'],
  ]) {
    assert.match(source, new RegExp(`const \\{ products, isLoading, error \\} = useShopifyProducts\\('${category}'\\)`));
    assert.match(source, /collection=\{!isLoading && !error/, `${label} omits catalog schema unless the fetch succeeds`);
    assert.match(source, /noIndexFollow=\{!isLoading && !error && sortedProducts\.length === 0\}/);
    assert.match(source, /: error\s*\? 'Current inventory is temporarily unavailable'/, `${label} does not report a zero count on error`);
    assert.match(source, /\{!error \? \(\s*<DropdownMenu>/, `${label} suppresses sorting on error`);
    assert.match(source, new RegExp(`\\) : error \\? \\(\\s*<CatalogLoadError retryHref="${retryHref}" \\/>`));
    assert.match(source, /\{hasMore && !isLoading && !error \? \(/, `${label} suppresses pagination on error`);
    assert.match(source, /\{!error \? <CollectionDecisionSupport/, `${label} suppresses product decision support on error`);
  }

  assert.match(semanticPage, /const \{ products, isLoading, error \} = useShopifyProducts\(standard\.category\)/);
  assert.match(semanticPage, /evidenceBoundFulfillmentPage && !isLoading && !error && products\.length === 0/);
  assert.match(semanticPage, /collection=\{collectionStandard && !isLoading && !error/);
  assert.match(semanticPage, /\? error\s*\? <CatalogLoadError retryHref=\{pathname\} \/>/);
  assert.match(semanticPage, /href=\{retryHref\}[\s\S]{0,80}>\s*Try again/);

  assert.match(categoryListing, /const \{ products, isLoading, error \} = useShopifyPaginatedProducts\(config\.slug\)/);
  assert.match(categoryListing, /collection=\{!isLoading && !error/);
  assert.match(categoryListing, /: error \? \(\s*<CatalogLoadError retryHref=/);
  assert.match(categoryListing, /Current products are temporarily unavailable/);
  assert.match(categoryListing, /\{!error \? <CollectionDecisionSupport/);

  assert.match(shopifyCollectionPage, /const noIndexFollow = !isLoading && !error && purchasableProducts\.length === 0/);
  assert.match(shopifyCollectionPage, /collection=\{!isLoading && !error/);
  assert.match(shopifyCollectionPage, /!isLoading && !error && purchasableProducts\.length > 0/);
  assert.match(shopifyCollectionPage, /: error \? \(\s*<CatalogLoadError retryHref=\{collectionPath\}/);
  assert.match(shopifyCollectionPage, /\{!error \? <CollectionDecisionSupport/);

  assert.match(readyToShipPage, /const \{ products, isLoading, error \} = useShopifyProducts\(\)/);
  assert.match(readyToShipPage, /noIndex=\{!isLoading && !error && sortedProducts\.length === 0\}/);
  assert.match(readyToShipPage, /collection=\{!isLoading && !error && sortedProducts\.length > 0/);
  assert.match(readyToShipPage, /: error \? \(\s*<CatalogLoadError \/>/);
  assert.match(readyToShipPage, /\{!error \? <CollectionDecisionSupport/);

  assert.match(customizablePage, /collection=\{!isLoading && !error/);
  assert.match(customizablePage, /: error\s*\? 'Current customizable inventory is temporarily unavailable'/);
  assert.match(customizablePage, /\{error \? \(\s*<CatalogLoadError \/>/);
  assert.match(customizablePage, /\{!error \? <CollectionDecisionSupport/);

  assert.match(collectionDecisionSupport, /const \{ products, isLoading, error \} = useShopifyProducts\(category\)/);
  assert.match(collectionDecisionSupport, /\{error \? \(\s*<div[^>]+role="alert"/);
  assert.match(collectionDecisionSupport, /retryHref=\{retryHref\}/);

  assert.match(shopifySource, /throw new Error\('Shopify Storefront API request failed with HTTP 402/);
  assert.match(shopifySource, /Shopify product catalog returned an invalid response/);
  assert.match(shopifySource, /if \(collection === null\) return null/);
  assert.match(shopifyCollectionHook, /requestedHandle: handle/);
  assert.match(shopifyCollectionHook, /catch \(loadError\)[\s\S]*?error: true/);
  assert.match(shopifyCollectionHook, /finally \{[\s\S]*?isLoading: false/);
  assert.match(shopifyCollectionHook, /return selectShopifyCollectionStateForHandle\(handle, state, initialProducts\)/);
  assert.match(completeTheLook, /catch \(error\)[\s\S]*?Unable to load optional related products/);
});

test('collection route-param changes never expose the previous handle on the first render', () => {
  const collectionAProduct = { node: { id: 'product-a' } };
  const collectionBProduct = { node: { id: 'product-b' } };
  const collectionAState = {
    requestedHandle: 'collection-a',
    collection: { handle: 'collection-a' },
    products: [collectionAProduct],
    isLoading: false,
    error: true,
  };

  const firstCollectionBRender = selectShopifyCollectionStateForHandle(
    'collection-b',
    collectionAState,
    null,
  );
  assert.deepEqual(firstCollectionBRender, {
    collection: null,
    products: [],
    isLoading: true,
    error: false,
  });

  const firstPrerenderedCollectionBRender = selectShopifyCollectionStateForHandle(
    'collection-b',
    collectionAState,
    [collectionBProduct],
  );
  assert.equal(firstPrerenderedCollectionBRender.collection, null);
  assert.deepEqual(firstPrerenderedCollectionBRender.products, [collectionBProduct]);
  assert.equal(firstPrerenderedCollectionBRender.isLoading, false);
  assert.equal(firstPrerenderedCollectionBRender.error, false);
  assert.doesNotMatch(JSON.stringify(firstPrerenderedCollectionBRender), /product-a|collection-a/);
});

test('successful Shopify list and collection empties remain confirmed data states', async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          products: {
            edges: [],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      }),
    });
    assert.deepEqual(await fetchAllProducts(), []);
    assert.deepEqual(await fetchProducts(12), []);

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: { collection: null } }),
    });
    assert.equal(await fetchCollectionByHandle('confirmed-missing-collection'), null);

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          collection: {
            id: 'gid://shopify/Collection/1',
            title: 'Empty collection',
            handle: 'empty-collection',
            description: '',
            descriptionHtml: '',
            image: null,
            products: { edges: [] },
          },
        },
      }),
    });
    const emptyCollection = await fetchCollectionByHandle('empty-collection');
    assert.deepEqual(emptyCollection?.products, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('client catalog consumers never resurrect committed 410 product handles', async () => {
  const originalFetch = globalThis.fetch;
  const retiredHandle = 'antique-gold-net-lehenga-zari-sequins';
  const productNode = (handle) => ({
    id: `gid://shopify/Product/${handle}`,
    title: 'Current Test Lehenga',
    createdAt: '2026-09-01T00:00:00Z',
    description: '',
    handle,
    vendor: 'LuxeMia',
    productType: 'Lehenga Choli',
    tags: [],
    availableForSale: true,
    priceRange: { minVariantPrice: { amount: '50.00', currencyCode: 'USD' } },
    compareAtPriceRange: { minVariantPrice: { amount: '50.00', currencyCode: 'USD' }, maxVariantPrice: { amount: '50.00', currencyCode: 'USD' } },
    images: { edges: [] },
    variants: { edges: [{ node: { id: `gid://shopify/ProductVariant/${handle}`, title: 'Default', availableForSale: true, selectedOptions: [] } }] },
    options: [],
  });

  try {
    let requestCount = 0;
    globalThis.fetch = async () => {
      requestCount += 1;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            products: {
              edges: [
                { node: productNode(retiredHandle) },
                { node: productNode('current-test-lehenga') },
              ],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
      };
    };

    assert.deepEqual((await fetchAllProducts()).map(({ node }) => node.handle), ['current-test-lehenga']);
    assert.deepEqual((await fetchProducts(12)).map(({ node }) => node.handle), ['current-test-lehenga']);
    assert.equal(await fetchProductByHandle(retiredHandle), null);
    assert.equal(requestCount, 2, 'known-gone detail lookup is rejected before a Shopify request');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Shopify list and collection fetches propagate transient, billing, and abort failures', async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => {
      throw new TypeError('catalog network unavailable');
    };
    await assert.rejects(fetchAllProducts(), /catalog network unavailable/);
    await assert.rejects(fetchProducts(12), /catalog network unavailable/);
    await assert.rejects(fetchCollectionByHandle('network-failure'), /catalog network unavailable/);

    globalThis.fetch = async () => ({
      ok: false,
      status: 402,
      json: async () => ({}),
    });
    await assert.rejects(fetchAllProducts(), /HTTP 402 \(payment required\)/);

    let pageRequestCount = 0;
    globalThis.fetch = async () => {
      pageRequestCount += 1;
      if (pageRequestCount === 1) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              products: {
                edges: [],
                pageInfo: { hasNextPage: true, endCursor: 'next-page' },
              },
            },
          }),
        };
      }
      throw new Error('second catalog page unavailable');
    };
    await assert.rejects(fetchAllProducts(), /second catalog page unavailable/);
    assert.equal(pageRequestCount, 2);

    const abortError = new Error('catalog request aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = async () => {
      throw abortError;
    };
    await assert.rejects(
      fetchCollectionByHandle('aborted-collection', new AbortController().signal),
      (error) => error?.name === 'AbortError',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('large collection grids page rendered cards without truncating totals or schema inputs', () => {
  for (const [label, source] of [
    ['inventory-backed collections', inventoryPage],
    ['wedding-guest parent', weddingGuestPage],
    ['Diwali parent', diwaliPage],
  ]) {
    assert.match(source, /const PRODUCTS_PER_PAGE = 24;/, `${label} has a bounded initial render`);
    assert.match(source, /const SCHEMA_PRODUCT_LIMIT = 30;/, `${label} keeps an independent schema cap`);
    assert.match(source, /const \[visibleCount, setVisibleCount\] = useState\(PRODUCTS_PER_PAGE\);/);
    assert.match(source, /const visibleProducts = sortedProducts\.slice\(0, visibleCount\);/);
    assert.match(source, /visibleProducts\.map\(\(product, index\) =>/);
    assert.doesNotMatch(source, /\{sortedProducts\.map\(\(product, index\) =>/);
    assert.match(source, /setVisibleCount\(\(currentCount\) => Math\.min\(/, `${label} loads another bounded batch`);
    assert.match(source, /Load more \(\{sortedProducts\.length - visibleProducts\.length\} remaining\)/);
    assert.match(source, /\$\{visibleProducts\.length\} of \$\{sortedProducts\.length\}/, `${label} reports the full result total`);
    assert.match(source, /handleSortChange[\s\S]{0,180}setVisibleCount\(PRODUCTS_PER_PAGE\);/, `${label} resets pagination after sorting`);
    assert.doesNotMatch(source, /<Link\b[^>]*>\s*<Button\b/, `${label} has no nested link and button controls`);
  }

  assert.match(inventoryPage, /sortedProducts\.slice\(0, SCHEMA_PRODUCT_LIMIT\)\.map/);
  assert.match(inventoryPage, /<InventoryBackedCollectionContent key=\{landing\} landing=\{landing\} \/>/, 'inventory routes reset pagination when the route changes');
  assert.match(weddingGuestPage, /toCollectionSchemaItems\(sortedProducts, SCHEMA_PRODUCT_LIMIT\)/);
  assert.match(diwaliPage, /toCollectionSchemaItems\(sortedProducts, SCHEMA_PRODUCT_LIMIT\)/);
});

test('parent pages link to supported children while thin unsupported children stay unpublished', () => {
  for (const routePath of ['/collections/wedding-guest-lehengas', '/collections/wedding-guest-kurta-sets']) {
    assert.ok(collectionsPage.includes(routePath));
    assert.ok(weddingGuestPage.includes(routePath));
  }
  for (const routePath of ['/collections/diwali-womenswear', '/collections/diwali-menswear']) {
    assert.ok(collectionsPage.includes(routePath));
    assert.ok(diwaliPage.includes(routePath));
  }
  for (const thinRoute of ['/collections/navratri-menswear', '/collections/indo-western-menswear']) {
    for (const source of [app, prerender, routeGenerator, sitemapGenerator, llmsFull]) {
      assert.ok(!source.includes(thinRoute), `${thinRoute} must not be published without durable inventory`);
    }
  }
});
