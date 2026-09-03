import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { resolveIncludedPieces } from '../src/lib/productPurchaseFlow.ts';

const execFile = promisify(execFileCallback);

const projectRoot = path.resolve(import.meta.dirname, '..');
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-product-evidence-'));
const bundledEvidencePath = path.join(temporaryDirectory, 'productEvidence.mjs');
const bundledSchemaPath = path.join(temporaryDirectory, 'schema.mjs');
const bundledShipByPath = path.join(temporaryDirectory, 'shipBy.mjs');
const bundledProductCopyPath = path.join(temporaryDirectory, 'productDescriptionEnrichment.mjs');
const bundledCustomizableProductsPath = path.join(temporaryDirectory, 'customizableProducts.mjs');
const bundledShopifyPath = path.join(temporaryDirectory, 'shopify.mjs');
const bundledProductHookPath = path.join(temporaryDirectory, 'useShopifyProduct.mjs');

await Promise.all([
  build({
    entryPoints: [path.join(projectRoot, 'src/lib/productEvidence.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundledEvidencePath,
    logLevel: 'silent',
  }),
  build({
    entryPoints: [path.join(projectRoot, 'src/lib/schema.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundledSchemaPath,
    logLevel: 'silent',
  }),
  build({
    entryPoints: [path.join(projectRoot, 'src/lib/shipBy.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundledShipByPath,
    logLevel: 'silent',
  }),
  build({
    entryPoints: [path.join(projectRoot, 'src/lib/productDescriptionEnrichment.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundledProductCopyPath,
    logLevel: 'silent',
  }),
  build({
    entryPoints: [path.join(projectRoot, 'src/lib/customizableProducts.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundledCustomizableProductsPath,
    logLevel: 'silent',
  }),
  build({
    entryPoints: [path.join(projectRoot, 'src/lib/shopify.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundledShopifyPath,
    logLevel: 'silent',
    define: {
      'import.meta.env': '{}',
    },
    plugins: [{
      name: 'stub-product-evidence-toast',
      setup(buildContext) {
        buildContext.onResolve({ filter: /^sonner$/ }, () => ({
          namespace: 'product-evidence-test',
          path: 'sonner',
        }));
        buildContext.onLoad({ filter: /.*/, namespace: 'product-evidence-test' }, () => ({
          contents: 'export const toast = { error() {} };',
          loader: 'js',
        }));
      },
    }],
  }),
  build({
    entryPoints: [path.join(projectRoot, 'src/hooks/useShopifyProduct.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: bundledProductHookPath,
    logLevel: 'silent',
    plugins: [{
      name: 'stub-product-hook-shopify',
      setup(buildContext) {
        buildContext.onResolve({ filter: /^@\/lib\/shopify$/ }, () => ({
          namespace: 'product-hook-test',
          path: 'shopify',
        }));
        buildContext.onLoad({ filter: /.*/, namespace: 'product-hook-test' }, () => ({
          contents: 'export async function fetchProductByHandle() { return null; }',
          loader: 'js',
        }));
      },
    }],
  }),
]);

const {
  hasExplicitCustomColorEvidence,
  hasExplicitCustomizationEvidence,
  hasExplicitCustomMeasurementEvidence,
  hasExplicitMenswearEvidence,
} = await import(pathToFileURL(bundledEvidencePath).href);
const { generateProductSchema, normalizeBrandName } = await import(pathToFileURL(bundledSchemaPath).href);
const { getProcessingEstimateLabel, getProductShipsWithin } = await import(pathToFileURL(bundledShipByPath).href);
const { buildVerifiedProductCopy } = await import(pathToFileURL(bundledProductCopyPath).href);
const { isMadeToOrderProduct } = await import(pathToFileURL(bundledCustomizableProductsPath).href);
const { fetchProductByHandle } = await import(pathToFileURL(bundledShopifyPath).href);
const { resolveProductLoadStateForHandle } = await import(pathToFileURL(bundledProductHookPath).href);
const {
  buildHydrationProductNode,
  getIncludedComponentsMetafield,
  getIncludedComponentsMetafieldList,
  getListedProductAttributes,
} = await import(pathToFileURL(path.join(projectRoot, 'scripts/prerender.js')).href);

const [
  productInfoSource,
  sizeGuideModalSource,
  deliverySource,
  productDetailSource,
  productCardSource,
  blogAuthorsSource,
  authorBioSource,
  blogSource,
  blogCategorySource,
  seoHeadSource,
  schemaSource,
  shipBySource,
  shopifySource,
  productHookSource,
  prerenderSource,
  customizableProductsSource,
] = await Promise.all([
  readFile(path.join(projectRoot, 'src/components/product/ProductInfo.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/components/product/SizeGuideModal.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/components/product/DeliveryEstimate.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/pages/ProductDetail.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/components/ui/ProductCard.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/data/blogAuthors.ts'), 'utf8'),
  readFile(path.join(projectRoot, 'src/pages/AuthorBio.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/pages/Blog.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/pages/BlogCategory.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/components/seo/SEOHead.tsx'), 'utf8'),
  readFile(path.join(projectRoot, 'src/lib/schema.ts'), 'utf8'),
  readFile(path.join(projectRoot, 'src/lib/shipBy.ts'), 'utf8'),
  readFile(path.join(projectRoot, 'src/lib/shopify.ts'), 'utf8'),
  readFile(path.join(projectRoot, 'src/hooks/useShopifyProduct.ts'), 'utf8'),
  readFile(path.join(projectRoot, 'scripts/prerender.js'), 'utf8'),
  readFile(path.join(projectRoot, 'src/lib/customizableProducts.ts'), 'utf8'),
]);

test.after(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

test('menswear evidence uses whole terms and never classifies women by substring', () => {
  assert.equal(hasExplicitMenswearEvidence("Women's Suit", []), false);
  assert.equal(hasExplicitMenswearEvidence('Womenswear', ['occasion:wedding']), false);
  assert.equal(hasExplicitMenswearEvidence('Lehenga', ["audience:women's"]), false);
  assert.equal(hasExplicitMenswearEvidence("Men's Sherwani", []), true);
  assert.equal(hasExplicitMenswearEvidence(undefined, ['category:menswear']), true);
  assert.equal(hasExplicitMenswearEvidence(undefined, ['style:kurta']), true);
});

test('product purchase UI has no synthetic tailoring or fallback size catalog', () => {
  assert.doesNotMatch(productInfoSource, /STITCHING_TYPE_OPTIONS/);
  assert.doesNotMatch(productInfoSource, /StitchingSizeSelector/);
  assert.doesNotMatch(productInfoSource, /\^\(tailoring\|stitching\|availability\)/);
  assert.doesNotMatch(productInfoSource, /inferProductSpecColors|titleFabricLabels|fabricKeywords|titleWorkLabels|workKeywords/);
  assert.match(productInfoSource, /Only explicitly prefixed catalog fact tags are specifications/);
  assert.doesNotMatch(productInfoSource, /sizeMode=["{]menswear/);
  assert.equal(existsSync(path.join(projectRoot, 'src/components/StitchingSizeSelector.tsx')), false);
  assert.doesNotMatch(sizeGuideModalSource, /const (?:lehenga|suit|menswear)Sizes|4-6 weeks|0\.8 meter|one-size-fits-all|run true to size|typically have elastic|Most suits come semi-stitched/);
  assert.match(sizeGuideModalSource, /does not apply one universal chart/);
  assert.equal(existsSync(path.join(projectRoot, 'src/components/HowToMeasureModal.tsx')), false);
});

test('commercial quality never invents missing pieces and rejects incomplete supplied sets', async () => {
  const fixtureRoot = path.join(temporaryDirectory, 'commercial-quality-fixture');
  const fixturePath = path.join(fixtureRoot, 'sherwani.html');
  const supportLinks = [
    '/sizing-measurements-guide',
    '/shipping',
    '/returns',
    '/contact',
  ].map((href) => `<a href="${href}">Support</a>`).join('');
  const page = (included = '', title = 'Beige Art Silk Groom Sherwani with Stole') => `
    <h1>${title}</h1>
    <nav aria-label="Shop purchase-intent collections"></nav>
    ${supportLinks}
    ${included ? `<dl><dt>Included Pieces</dt><dd>${included}</dd></dl>` : ''}
  `;

  await mkdir(fixtureRoot, { recursive: true });
  await writeFile(fixturePath, page());
  const titleOnlyResult = await execFile(process.execPath, [
    path.join(projectRoot, 'scripts/validate-commercial-catalog-quality.cjs'),
  ], { env: { ...process.env, COMMERCIAL_PRODUCT_ROOT: fixtureRoot } });
  assert.match(titleOnlyResult.stdout, /1 title-only component descriptions left without an inferred Included Pieces row/);

  await writeFile(fixturePath, page('Sherwani only'));
  await assert.rejects(
    execFile(process.execPath, [
      path.join(projectRoot, 'scripts/validate-commercial-catalog-quality.cjs'),
    ], { env: { ...process.env, COMMERCIAL_PRODUCT_ROOT: fixtureRoot } }),
    (error) => {
      assert.match(error.stderr, /evidence-backed component mismatch/);
      assert.match(error.stderr, /expected sherwani with stole, found "Sherwani only"/);
      return true;
    },
  );

  const threePieceTitle = 'Embroidered Three-Piece Palazzo Suit with Dupatta';
  await writeFile(fixturePath, page('Palazzo, Dupatta', threePieceTitle));
  await assert.rejects(
    execFile(process.execPath, [
      path.join(projectRoot, 'scripts/validate-commercial-catalog-quality.cjs'),
    ], { env: { ...process.env, COMMERCIAL_PRODUCT_ROOT: fixtureRoot } }),
    /three named components including palazzo and dupatta/,
  );

  await writeFile(fixturePath, page('Kurta, Dupatta; Palazzo not included', threePieceTitle));
  await assert.rejects(
    execFile(process.execPath, [
      path.join(projectRoot, 'scripts/validate-commercial-catalog-quality.cjs'),
    ], { env: { ...process.env, COMMERCIAL_PRODUCT_ROOT: fixtureRoot } }),
    /negated component copy cannot be an Included Pieces value/,
  );

  await writeFile(fixturePath, page('Kurta, Palazzo, No Dupatta', threePieceTitle));
  await assert.rejects(
    execFile(process.execPath, [
      path.join(projectRoot, 'scripts/validate-commercial-catalog-quality.cjs'),
    ], { env: { ...process.env, COMMERCIAL_PRODUCT_ROOT: fixtureRoot } }),
    /negated component copy cannot be an Included Pieces value/,
  );

  await writeFile(fixturePath, page('Kurta, Palazzo, Dupatta', threePieceTitle));
  await execFile(process.execPath, [
    path.join(projectRoot, 'scripts/validate-commercial-catalog-quality.cjs'),
  ], { env: { ...process.env, COMMERCIAL_PRODUCT_ROOT: fixtureRoot } });
});

test('product prerender and live refresh share structured included-components evidence', async () => {
  const product = {
    title: 'Beige Art Silk Groom Sherwani with Stole',
    description: '',
    tags: ['included:Wrong fallback'],
    includedComponentsMetafield: { value: '[" Sherwani ","Stole","stole"]' },
    options: [],
    variants: { edges: [] },
  };

  assert.deepEqual(getIncludedComponentsMetafieldList(product), ['Sherwani', 'Stole']);
  assert.equal(getIncludedComponentsMetafield(product), 'Sherwani, Stole');
  assert.equal(getListedProductAttributes(product).includedPieces, 'Sherwani, Stole');
  assert.match(buildVerifiedProductCopy(product), /Listed components: Sherwani, Stole\./);
  assert.doesNotMatch(buildVerifiedProductCopy(product), /Wrong fallback/);
  assert.deepEqual(
    buildHydrationProductNode(product).metadata.includedComponents,
    ['Sherwani, Stole'],
  );
  const longButAccepted = {
    ...product,
    includedComponentsMetafield: {
      value: JSON.stringify(['A'.repeat(70), 'B'.repeat(40)]),
    },
  };
  const longButAcceptedText = `${'A'.repeat(70)}, ${'B'.repeat(40)}`;
  assert.equal(getIncludedComponentsMetafield(longButAccepted), longButAcceptedText);
  assert.equal(
    resolveIncludedPieces(
      buildHydrationProductNode(longButAccepted).metadata.includedComponents,
      longButAccepted.tags,
    ),
    longButAcceptedText,
  );
  assert.deepEqual(getIncludedComponentsMetafieldList({
    includedComponentsMetafield: { value: '{"not":"a list"}' },
  }), []);
  assert.deepEqual(getIncludedComponentsMetafieldList({
    includedComponentsMetafield: { value: 'not json' },
  }), []);
  assert.deepEqual(getIncludedComponentsMetafieldList({
    includedComponentsMetafield: { value: '[]' },
  }), []);
  assert.deepEqual(getIncludedComponentsMetafieldList({
    includedComponentsMetafield: { value: '["Sherwani",7]' },
  }), []);
  assert.deepEqual(getIncludedComponentsMetafieldList({
    includedComponentsMetafield: { value: '["Kurta","Dupatta; palazzo not included"]' },
  }), []);
  assert.deepEqual(getIncludedComponentsMetafieldList({
    includedComponentsMetafield: { value: '["Kurta","Palazzo","No Dupatta"]' },
  }), []);

  const overlengthMetafield = {
    ...product,
    title: 'Example Three-Piece Set',
    tags: ['included:Kurta, Pants, Dupatta'],
    includedComponentsMetafield: {
      value: JSON.stringify(['A'.repeat(70), 'B'.repeat(70)]),
    },
  };
  assert.equal(getIncludedComponentsMetafield(overlengthMetafield), undefined);
  assert.equal(
    getListedProductAttributes(overlengthMetafield).includedPieces,
    'Kurta, Pants, Dupatta',
  );
  assert.deepEqual(
    buildHydrationProductNode(overlengthMetafield).metadata.includedComponents,
    ['Kurta, Pants, Dupatta'],
  );
  assert.equal(
    Object.hasOwn(buildHydrationProductNode(overlengthMetafield), 'includedComponentsMetafield'),
    false,
  );

  const descriptionOnly = {
    ...product,
    tags: ['facts:source-verified'],
    includedComponentsMetafield: null,
    description: 'Set includes: Kurta, Palazzo, Dupatta. This source-reviewed listing description is deliberately long enough to remain the published descriptive copy for the product.',
  };
  assert.equal(getListedProductAttributes(descriptionOnly).includedPieces, undefined);
  assert.equal(buildHydrationProductNode(descriptionOnly).metadata.includedComponents, null);

  const conflictingVerifiedDescription = {
    ...product,
    tags: ['facts:source-verified', 'included:Wrong fallback'],
    description: 'Set includes: Wrong Tunic, Wrong Pants, Wrong Dupatta. This source-reviewed listing description is deliberately long enough to exercise the authoritative structured-component precedence path.',
  };
  const authoritativeCopy = buildVerifiedProductCopy(conflictingVerifiedDescription);
  assert.match(authoritativeCopy, /Listed components: Sherwani, Stole\./);
  assert.doesNotMatch(authoritativeCopy, /Wrong Tunic|Wrong Pants|Wrong Dupatta|Wrong fallback/);

  assert.match(
    prerenderSource,
    /includedComponentsMetafield:\s*metafield\(namespace:\s*"custom",\s*key:\s*"included_components"\)/,
  );
  assert.equal(
    (shopifySource.match(/includedComponentsMetafield:\s*metafield\(namespace:\s*"custom",\s*key:\s*"included_components"\)/g) || []).length,
    3,
    'all-products, product-detail, and collection refresh queries must request included components',
  );
  assert.match(prerenderSource, /function getIncludedComponentsMetafield\(product\)/);
  assert.doesNotMatch(prerenderSource, /getExplicitIncludedPieces/);
  assert.match(
    prerenderSource,
    /const includedPieces = getIncludedComponentsMetafield\(product\)[\s\S]*?includedPiecesTag/,
  );

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          product: {
            ...product,
            id: 'gid://shopify/Product/structured-components',
            handle: 'structured-components-refresh',
            availableForSale: true,
            priceRange: {
              minVariantPrice: { amount: '100.00', currencyCode: 'USD' },
              maxVariantPrice: { amount: '100.00', currencyCode: 'USD' },
            },
            compareAtPriceRange: {
              minVariantPrice: { amount: '100.00', currencyCode: 'USD' },
              maxVariantPrice: { amount: '100.00', currencyCode: 'USD' },
            },
            images: { edges: [] },
          },
        },
      }),
    });
    const refreshed = await fetchProductByHandle('structured-components-refresh');
    assert.equal(
      resolveIncludedPieces(refreshed?.metadata?.includedComponents, refreshed?.tags),
      'Sherwani, Stole',
    );

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          product: {
            ...overlengthMetafield,
            id: 'gid://shopify/Product/overlength-components',
            handle: 'overlength-components-refresh',
            availableForSale: true,
            priceRange: {
              minVariantPrice: { amount: '100.00', currencyCode: 'USD' },
              maxVariantPrice: { amount: '100.00', currencyCode: 'USD' },
            },
            compareAtPriceRange: {
              minVariantPrice: { amount: '100.00', currencyCode: 'USD' },
              maxVariantPrice: { amount: '100.00', currencyCode: 'USD' },
            },
            images: { edges: [] },
          },
        },
      }),
    });
    const refreshedOverlength = await fetchProductByHandle('overlength-components-refresh');
    assert.equal(
      resolveIncludedPieces(refreshedOverlength?.metadata?.includedComponents, refreshedOverlength?.tags),
      'Kurta, Pants, Dupatta',
    );

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          product: {
            ...descriptionOnly,
            id: 'gid://shopify/Product/description-only-components',
            handle: 'description-only-components-refresh',
            availableForSale: true,
            priceRange: {
              minVariantPrice: { amount: '100.00', currencyCode: 'USD' },
              maxVariantPrice: { amount: '100.00', currencyCode: 'USD' },
            },
            compareAtPriceRange: {
              minVariantPrice: { amount: '100.00', currencyCode: 'USD' },
              maxVariantPrice: { amount: '100.00', currencyCode: 'USD' },
            },
            images: { edges: [] },
          },
        },
      }),
    });
    const refreshedDescriptionOnly = await fetchProductByHandle('description-only-components-refresh');
    assert.equal(
      resolveIncludedPieces(
        refreshedDescriptionOnly?.metadata?.includedComponents,
        refreshedDescriptionOnly?.tags,
      ),
      undefined,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('custom color and measurement claims require current explicit Shopify evidence', () => {
  assert.equal(hasExplicitCustomizationEvidence({ tags: [], options: [] }), false);
  assert.equal(hasExplicitCustomColorEvidence({ options: [{ name: 'Color', values: ['Blue'] }] }), false);
  assert.equal(hasExplicitCustomColorEvidence({ options: [{ name: 'Custom Color', values: ['Requested color'] }] }), true);
  assert.equal(hasExplicitCustomMeasurementEvidence({ options: [{ name: 'Size', values: ['S', 'Custom'] }] }), true);
  assert.equal(hasExplicitCustomizationEvidence({ tags: ['customization:measurements'] }), true);

  assert.match(productInfoSource, /hasCustomColorEvidence = hasExplicitCustomColorEvidence\(product\)/);
  assert.match(productInfoSource, /hasCustomMeasurementEvidence = hasExplicitCustomMeasurementEvidence\(product\)/);
  assert.match(productDetailSource, /const sizeAnswer = hasCustomMeasurementEvidence/);
  assert.doesNotMatch(productInfoSource, /getCustomizableProduct|hasVerifiedCustomProductionEvidence|4[–-]5 weeks|made from measurements/);
  assert.doesNotMatch(productDetailSource, /getCustomizableProduct|applyCustomizableProductDetails|4[–-]5 week/);
  assert.doesNotMatch(deliverySource, /4[–-]5 week|hasVerifiedCustomTiming/);
  assert.doesNotMatch(customizableProductsSource, /CUSTOM_PRODUCT_TIMING|getCustomProductDescription|applyCustomizableProductDetails/);
  assert.doesNotMatch(customizableProductsSource, /customizableProductsData|getCustomizableProduct|isCustomizableProduct|CUSTOMIZABLE_PRODUCT_HANDLES/);
  assert.doesNotMatch(prerenderSource, /CUSTOMIZABLE_PRODUCTS_BY_HANDLE|customizableProducts\.json/);
});

test('made-to-order classification requires an exact positive catalog tag', () => {
  assert.equal(isMadeToOrderProduct('unrelated-handle', []), false);
  assert.equal(isMadeToOrderProduct('made-to-order-looking-handle', ['customizable']), false);
  assert.equal(isMadeToOrderProduct('unrelated-handle', ['not made to order']), false);
  assert.equal(isMadeToOrderProduct('unrelated-handle', ['Made to Order']), true);
  assert.equal(isMadeToOrderProduct('unrelated-handle', ['availability:Made to Order']), true);
  assert.equal(isMadeToOrderProduct('unrelated-handle', ['custom-made']), true);
});

test('unknown care and hydrated guide links use neutral, durable fallbacks', () => {
  assert.match(productDetailSource, /Product-specific care instructions were not supplied with this listing/);
  assert.doesNotMatch(productDetailSource, /Dry cleaning is recommended/);
  assert.match(productInfoSource, /Product-specific fabric details were not supplied as a verified listing field/);
  assert.match(productInfoSource, /Included-piece details were not supplied as a verified listing field/);
  assert.doesNotMatch(productInfoSource, /Review the product description for the fabric|See the product description and images/);
  assert.match(productDetailSource, /data-hydrated-product-guide-link/);
  assert.match(productDetailSource, /href: '\/sizing-measurements-guide'/);
});

test('product detail noindexes only a confirmed catalog miss and keeps load failures retryable', () => {
  assert.match(productDetailSource, /shopifyError === 'Product not found'/);
  assert.match(
    productDetailSource,
    /isProductNotFound \? \([\s\S]*?Product Not Found \| LuxeMia[\s\S]*?noIndex=\{true\}[\s\S]*?\) : !isLoading \? \([\s\S]*?Product page temporarily unavailable \| LuxeMia/,
  );
  assert.match(productDetailSource, /The product has not been confirmed as removed/);
  assert.match(productDetailSource, /onClick=\{\(\) => window\.location\.reload\(\)\}/);
  assert.doesNotMatch(
    productDetailSource,
    /!shopifyLoading && !shopifyProduct \? 'Product not found'/,
  );
  assert.match(productHookSource, /error: 'Product not found'/);
  assert.match(productHookSource, /error: 'Failed to load product\. Please refresh the page\.'/);
  assert.match(productHookSource, /!cancelled && !retryScheduled/);
  assert.doesNotMatch(
    shopifySource,
    /catch \(error\) \{\s*console\.error\('Error fetching product:'[\s\S]*?return null;/,
  );
});

test('product hook hides the previous handle before the route-change effect runs', () => {
  const productA = { id: 'gid://shopify/Product/1', handle: 'product-a' };
  const settledProductA = {
    handle: 'product-a',
    product: productA,
    isLoading: false,
    error: null,
  };

  assert.equal(
    resolveProductLoadStateForHandle(settledProductA, 'product-a'),
    settledProductA,
  );
  assert.deepEqual(
    resolveProductLoadStateForHandle(settledProductA, 'product-b'),
    {
      handle: 'product-b',
      product: null,
      isLoading: true,
      error: null,
    },
  );
  assert.match(productHookSource, /resolveProductLoadStateForHandle\(loadState, handle\)/);
});

test('Shopify product lookup returns null for an explicit missing product', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ data: { product: null } }),
  });

  try {
    assert.equal(await fetchProductByHandle('confirmed-missing-product'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Shopify product lookup propagates network, HTTP, and GraphQL failures', async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => {
      throw new TypeError('network unavailable');
    };
    await assert.rejects(
      fetchProductByHandle('network-failure-product'),
      /network unavailable/,
    );

    globalThis.fetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    });
    await assert.rejects(
      fetchProductByHandle('http-failure-product'),
      /HTTP error! status: 503/,
    );

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ errors: [{ message: 'Storefront unavailable' }] }),
    });
    await assert.rejects(
      fetchProductByHandle('graphql-failure-product'),
      /Error calling Shopify: Storefront unavailable/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('processing estimates preserve source evidence and never invent a calendar date', () => {
  const exactDays = { shipsWithinMetafield: { value: '3' } };
  const suppliedRange = { shipsWithinMetafield: { value: '3–5 business days' } };

  assert.equal(getProductShipsWithin(exactDays), 3);
  assert.equal(getProductShipsWithin(suppliedRange), null);
  assert.equal(
    getProcessingEstimateLabel(exactDays),
    'Listing processing estimate: within 3 days. Carrier transit and delivery timing are separate.',
  );
  assert.equal(
    getProcessingEstimateLabel(suppliedRange),
    'Listing processing estimate: 3–5 business days. Carrier transit and delivery timing are separate.',
  );
  assert.doesNotMatch(shipBySource, /date-fns|new Date|holiday|businessDays|Ships by/i);
  assert.doesNotMatch(deliverySource, /estimated dispatch date/i);
  assert.match(deliverySource, /processing estimate is separate from carrier transit and delivery timing/);
});

test('live refresh and prerender share the evidence-safe product-copy builder', () => {
  const unsafeSupplierCopy = [
    'Premium handcrafted masterpiece with a universally flattering fit.',
    'Dry clean only. Includes blouse, skirt, and dupatta.',
    'Free worldwide delivery in five days.',
  ].join(' ');
  const product = {
    id: 'gid://shopify/Product/1',
    handle: 'source-test-product',
    title: 'Test Lehenga',
    description: unsafeSupplierCopy,
    productType: 'Lehenga',
    tags: ['color:Blue', 'fabric:Georgette'],
    colorMetafield: null,
    fabricMetafield: null,
    materialMetafield: null,
    includedComponentsMetafield: null,
    occasionMetafield: null,
    careInstructionsMetafield: null,
    shipsWithinMetafield: null,
    metadata: {},
    variants: { edges: [{ node: { sku: 'TEST-001' } }] },
    options: [{ name: 'Size', values: ['S', 'M'] }],
  };

  const safeCopy = buildVerifiedProductCopy(product);
  assert.doesNotMatch(safeCopy, /premium|handcrafted|flattering|dry clean|free worldwide|includes blouse/i);
  assert.match(safeCopy, /Listed color: Blue/);
  assert.match(safeCopy, /Listed material: Georgette/);
  assert.match(safeCopy, /Available options: S, M/);

  const explicitlyVerifiedCopy = buildVerifiedProductCopy({
    ...product,
    tags: ['facts:source-verified'],
    description: `${unsafeSupplierCopy} This complete description was separately reviewed against the source listing.`,
  });
  assert.match(explicitlyVerifiedCopy, /universally flattering fit/);

  assert.match(shopifySource, /const verifiedDescription = buildVerifiedProductCopy\(node\)/);
  assert.doesNotMatch(shopifySource, /sanitizeShopifyProductCopy/);
  assert.match(prerenderSource, /loadTsModule\('src\/lib\/productDescriptionEnrichment\.ts'\)/);
  assert.match(prerenderSource, /buildVerifiedProductCopy = productCopyModule\.buildVerifiedProductCopy/);
  assert.match(prerenderSource, /loadTsModule\('src\/lib\/productEvidence\.ts'\)/);
  assert.match(prerenderSource, /hasExplicitCustomizationEvidence = productEvidenceModule\.hasExplicitCustomizationEvidence/);
});

test('product identity and fulfillment labels require positive catalog evidence', () => {
  assert.doesNotMatch(productDetailSource, /isJewelryProduct \? undefined : 'Female'/);
  assert.doesNotMatch(productDetailSource, /name: 'Market'/);
  assert.doesNotMatch(productDetailSource, /condition \|\| 'New'/);
  assert.doesNotMatch(productDetailSource, /This saree is listed for/);
  assert.match(productCardSource, /hasExplicitReadyToShipEvidence\(product\.node\)/);
  assert.match(productCardSource, /isReadyToShip \? 'Ready to Ship' : 'Processing details on listing'/);
  assert.doesNotMatch(productCardSource, /isMadeToOrder \? 'Made to Order' : 'Ready to Ship'/);
  assert.match(productInfoSource, /verifiedBrandName = normalizeBrandName\(product\.vendor\)/);
  assert.doesNotMatch(productInfoSource, />\s*\{product\.vendor\}\s*</);
});

test('product metadata and schema suppress missing required or optional facts', () => {
  assert.match(seoHeadSource, /const hasVerifiedProductEvidence = Boolean/);
  assert.match(seoHeadSource, /const productSchema = verifiedProduct/);
  assert.doesNotMatch(seoHeadSource, /product\.image \|\| absoluteImage|product\.currency \|\| 'USD'|product\.brand \|\| 'LuxeMia'|product:condition" content="new"/);
  assert.doesNotMatch(schemaSource, /LEGAL_BUSINESS_NAME|if \(!raw\) return BRAND_NAME|itemCondition: 'https:\/\/schema\.org\/NewCondition'/);
  assert.match(schemaSource, /if \(!raw\) return undefined/);
  assert.match(schemaSource, /\.\.\.\(itemCondition && \{ itemCondition \}\)/);

  const requiredOnly = generateProductSchema({
    name: 'Source-backed product',
    description: 'Source-backed description',
    url: 'https://luxemia.shop/product/source-backed-product',
    image: ['https://cdn.shopify.com/source-backed.jpg'],
    sku: '',
    price: '10.00',
    currency: 'USD',
    availability: 'InStock',
  });
  assert.equal(normalizeBrandName(undefined), undefined);
  assert.equal(normalizeBrandName('Internal Supplier Label'), undefined);
  assert.equal('brand' in requiredOnly, false);
  assert.equal('category' in requiredOnly, false);
  assert.equal('itemCondition' in requiredOnly.offers, false);

  const variantOfferUrl = 'https://luxemia.shop/product/source-backed-product?variant=456';
  const variantLinked = generateProductSchema({
    name: 'Source-backed product',
    description: 'Source-backed description',
    url: 'https://luxemia.shop/product/source-backed-product',
    offerUrl: variantOfferUrl,
    image: ['https://cdn.shopify.com/source-backed.jpg'],
    sku: '',
    price: '10.00',
    currency: 'USD',
    availability: 'InStock',
  });
  assert.equal(variantLinked.url, 'https://luxemia.shop/product/source-backed-product');
  assert.equal(variantLinked['@id'], 'https://luxemia.shop/product/source-backed-product#product');
  assert.equal(variantLinked.offers.url, variantOfferUrl);
  assert.equal(variantLinked.offers['@id'], `${variantOfferUrl}#offer`);
  assert.match(productDetailSource, /offerUrl: schemaOfferUrl/);
  assert.match(prerenderSource, /route\.path\.startsWith\('\/product\/'\)\s*\? 'product'/);

  const explicitlyConditioned = generateProductSchema({
    ...requiredOnly,
    name: 'Source-backed product',
    description: 'Source-backed description',
    url: 'https://luxemia.shop/product/source-backed-product',
    image: ['https://cdn.shopify.com/source-backed.jpg'],
    sku: '',
    price: '10.00',
    currency: 'USD',
    availability: 'InStock',
    brand: 'LuxemiaShop',
    condition: 'new',
  });
  assert.deepEqual(explicitlyConditioned.brand, { '@id': 'https://luxemia.shop/#brand' });
  assert.equal(explicitlyConditioned.offers.itemCondition, 'https://schema.org/NewCondition');

  const skuWithoutVerifiedIdentifiers = generateProductSchema({
    name: 'SKU-only product',
    description: 'Source-backed description',
    url: 'https://luxemia.shop/product/sku-only-product',
    image: ['https://cdn.shopify.com/sku-only.jpg'],
    sku: 'INTERNAL-SKU-123',
    gtin: '012345678904',
    price: '10.00',
    currency: 'USD',
    availability: 'InStock',
  });
  assert.equal(skuWithoutVerifiedIdentifiers.sku, 'INTERNAL-SKU-123');
  assert.equal('mpn' in skuWithoutVerifiedIdentifiers, false);
  assert.equal(Object.keys(skuWithoutVerifiedIdentifiers).some((key) => key.startsWith('gtin')), false);

  const validGtin = generateProductSchema({
    name: 'GTIN-backed product',
    description: 'Source-backed description',
    url: 'https://luxemia.shop/product/gtin-backed-product',
    image: ['https://cdn.shopify.com/gtin-backed.jpg'],
    sku: 'INTERNAL-SKU-456',
    gtin: '012345678905',
    price: '10.00',
    currency: 'USD',
    availability: 'InStock',
  });
  assert.equal(validGtin.gtin12, '012345678905');
  assert.equal('mpn' in validGtin, false);
  assert.doesNotMatch(productDetailSource, /\bmpn\s*:/);
  assert.doesNotMatch(prerenderSource, /\bmpn\s*:/);
});

test('editorial-team profile is online-only and guide labels stay consistent', () => {
  assert.match(blogAuthorsSource, /location: 'Online'/);
  assert.doesNotMatch(authorBioSource, /PostalAddress|addressCountry|>Blog<|LuxeMia Blog/);
  assert.match(authorBioSource, /"name": "Guides"/);
  assert.match(blogSource, /\{ name: 'Guides', url: '\/blog' \}/);
  assert.doesNotMatch(blogSource, />Blog<|name: 'Blog'/);
  assert.doesNotMatch(blogCategorySource, />Blog</);
});
