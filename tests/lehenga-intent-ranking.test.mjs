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

const { rankGenericLehengasByIntent } = await import(pathToFileURL(bundledHookPath).href);
const { matchSubcategory } = await import(pathToFileURL(bundledProductFiltersPath).href);

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
