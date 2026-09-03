import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const projectRoot = path.resolve(import.meta.dirname, '..');
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-lehenga-ranking-'));
const bundledHookPath = path.join(temporaryDirectory, 'commercialProductRanking.mjs');
const bundledProductFiltersPath = path.join(temporaryDirectory, 'productFilters.mjs');

await Promise.all([
  build({
    entryPoints: [path.join(projectRoot, 'src/lib/commercialProductRanking.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    define: { 'import.meta.env': '{}' },
    outfile: bundledHookPath,
    logLevel: 'silent',
  }),
  build({
    entryPoints: [path.join(projectRoot, 'src/lib/productFilters.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    define: { 'import.meta.env': '{}' },
    outfile: bundledProductFiltersPath,
    logLevel: 'silent',
  }),
]);

const { rankCommercialProducts, rankGenericLehengasByIntent } = await import(pathToFileURL(bundledHookPath).href);
const { matchSubcategory, sortProducts } = await import(pathToFileURL(bundledProductFiltersPath).href);

test.after(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

function product(handle, title, productType = 'Lehenga', tags = []) {
  return {
    node: {
      handle,
      title,
      productType,
      tags,
    },
  };
}

function withAvailability(entry, productAvailability, variantAvailability) {
  return {
    node: {
      ...entry.node,
      availableForSale: productAvailability,
      variants: {
        edges: [{
          node: {
            id: `${entry.node.handle}-variant`,
            availableForSale: variantAvailability,
          },
        }],
      },
    },
  };
}

test('generic lehenga intent ranking is stable, lossless, and wedding-led', () => {
  const source = [
    product('garba', 'Mirror Work Garba Lehenga'),
    product('neutral-one', 'Embroidered Silk Lehenga'),
    product('tagged-festive', 'Pink Lehenga Set', 'Lehenga', ['occasion:navratri']),
    product('bridal', 'Red Bridal Lehenga'),
    product('mixed', 'Wedding Navratri Chaniya Choli'),
    product('type-festive', 'Blue Lehenga', 'Dandiya Lehenga'),
    product('neutral-two', 'Velvet Lehenga Choli'),
    product('wedding-tag', 'Gold Lehenga', 'Lehenga', ['occasion:reception']),
  ];
  const originalOrder = source.map(({ node }) => node.handle);

  const ranked = rankGenericLehengasByIntent(source);

  assert.deepEqual(
    ranked.map(({ node }) => node.handle),
    [
      'bridal',
      'wedding-tag',
      'neutral-one',
      'neutral-two',
      'garba',
      'tagged-festive',
      'mixed',
      'type-festive',
    ],
  );
  assert.deepEqual(source.map(({ node }) => node.handle), originalOrder);
  assert.equal(ranked.length, source.length);
  assert.deepEqual(new Set(ranked), new Set(source));
});

test('generic intent ranking puts explicitly orderable products before unknown inventory', () => {
  const unavailableWedding = withAvailability(
    product('unknown-bridal', 'Red Bridal Lehenga'),
    undefined,
    true,
  );
  const availableNeutral = withAvailability(
    product('available-neutral', 'Silk Lehenga'),
    true,
    true,
  );

  assert.deepEqual(
    rankGenericLehengasByIntent([unavailableWedding, availableNeutral])
      .map(({ node }) => node.handle),
    ['available-neutral', 'unknown-bridal'],
  );
});

test('server-resolved featured ranks survive hydration without overriding shopper sorts or live refreshes', () => {
  const rankedProduct = (handle, rank, price, createdAt, quality = 'low') => ({
    node: {
      handle,
      title: `${handle} lehenga`,
      productType: 'Lehenga',
      tags: quality === 'high'
        ? ['source-verified:catalog', 'fabric:silk', 'work:zari', 'included:lehenga']
        : [],
      description: quality === 'high' ? 'Verified product detail. '.repeat(40) : 'Short detail.',
      createdAt,
      prerenderedFeaturedRank: rank,
      availableForSale: true,
      priceRange: { minVariantPrice: { amount: String(price), currencyCode: 'USD' } },
      images: {
        edges: Array.from({ length: quality === 'high' ? 7 : 1 }, (_, index) => ({
          node: { url: `https://cdn.example/${handle}-${index}.jpg`, altText: handle },
        })),
      },
      variants: {
        edges: [{
          node: {
            id: `${handle}-variant`,
            availableForSale: true,
            sku: `${handle}-sku`,
            selectedOptions: [{ name: 'Size', value: 'M' }],
          },
        }],
      },
      options: [{ name: 'Size', values: ['M'] }],
    },
  });

  const first = rankedProduct('server-first', 1, 300, '2026-01-01T00:00:00Z', 'low');
  const second = rankedProduct('server-second', 2, 100, '2026-03-01T00:00:00Z', 'high');
  const third = rankedProduct('server-third', 3, 200, '2026-02-01T00:00:00Z', 'low');
  const shuffled = [third, second, first];

  assert.deepEqual(
    rankCommercialProducts(shuffled).map(({ node }) => node.handle),
    ['server-first', 'server-second', 'server-third'],
  );
  assert.deepEqual(
    sortProducts(shuffled, 'featured').map(({ node }) => node.handle),
    ['server-first', 'server-second', 'server-third'],
  );
  assert.deepEqual(
    rankCommercialProducts([third, first]).map(({ node }) => node.handle),
    ['server-first', 'server-third'],
  );
  assert.deepEqual(
    sortProducts(shuffled, 'price-asc').map(({ node }) => node.handle),
    ['server-second', 'server-third', 'server-first'],
  );
  assert.deepEqual(
    sortProducts(shuffled, 'newest').map(({ node }) => node.handle),
    ['server-second', 'server-third', 'server-first'],
  );

  const refreshed = [first, second].map(({ node }) => ({
    node: { ...node, prerenderedFeaturedRank: undefined },
  }));
  assert.deepEqual(
    rankCommercialProducts(refreshed).map(({ node }) => node.handle),
    ['server-second', 'server-first'],
  );

  const duplicateRank = [first, { ...second, node: { ...second.node, prerenderedFeaturedRank: 1 } }];
  assert.deepEqual(
    rankCommercialProducts(duplicateRank).map(({ node }) => node.handle),
    ['server-second', 'server-first'],
  );

  const unsafeRank = [first, {
    ...second,
    node: { ...second.node, prerenderedFeaturedRank: Number.MAX_SAFE_INTEGER + 1 },
  }];
  assert.deepEqual(
    rankCommercialProducts(unsafeRank).map(({ node }) => node.handle),
    ['server-second', 'server-first'],
  );
});

test('groom-sherwani intent requires both role and garment evidence', () => {
  const groomSherwani = product('groom-sherwani', 'Ivory Sherwani for Groom', 'Sherwani', ['role:groom']).node;
  const guestSherwani = product('guest-sherwani', 'Embroidered Wedding Sherwani', 'Sherwani', ['role:wedding-guest']).node;
  const groomKurta = product('groom-kurta', 'Groom Kurta Pajama Set', 'Kurta Set', ['role:groom']).node;
  const taggedGroomSherwani = product('tagged-groom-sherwani', 'Ivory Wedding Coat', 'Sherwani', ['role:groom']).node;
  const subcategory = {
    slug: 'groom-sherwani',
    label: 'Groom Sherwani',
    group: 'style',
    matchTags: ['role:groom', 'occasion:groom', 'groom sherwani'],
  };

  assert.equal(matchSubcategory(groomSherwani, subcategory), true);
  assert.equal(matchSubcategory(taggedGroomSherwani, subcategory), true);
  assert.equal(matchSubcategory(guestSherwani, subcategory), false);
  assert.equal(matchSubcategory(groomKurta, subcategory), false);
});

test('Banarasi intent requires an explicit Banarasi catalog signal', () => {
  const banarasiTitle = product('banarasi-title', 'Black Banarasi Silk Zari Saree', 'Saree').node;
  const banarasiTag = product('banarasi-tag', 'Black Zari Saree', 'Saree', ['fabric:Banarasi']).node;
  const genericSilk = product('generic-silk', 'Black Silk Zari Saree', 'Saree', ['fabric:silk']).node;
  const subcategory = {
    slug: 'banarasi',
    label: 'Banarasi',
    group: 'style',
    matchTags: ['fabric:banarasi', 'banarasi', 'banarasi silk', 'banarasi saree', 'banarasi brocade'],
  };

  assert.equal(matchSubcategory(banarasiTitle, subcategory), true);
  assert.equal(matchSubcategory(banarasiTag, subcategory), true);
  assert.equal(matchSubcategory(genericSilk, subcategory), false);
});
