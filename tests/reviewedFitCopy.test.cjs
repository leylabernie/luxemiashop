const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');
const { build } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
// Public copy only, captured from the six exact draft records on 2026-10-26.
// No private supplier notes, stock fields, fees, images or publication data.
const fixtures = require('./fixtures/reviewedSalwarFitCopy.json');
const plain = text => text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const money = { amount: '69.17', currencyCode: 'USD' }; // synthetic renderer money
const product = fixture => ({
  ...fixture, description: plain(fixture.descriptionHtml),
  availableForSale: false, vendor: 'LuxeMia', options: [],
  priceRange: { minVariantPrice: money }, compareAtPriceRange: null,
  images: { edges: [] }, media: { edges: [] },
  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/1', title: 'Fixture',
    price: money, availableForSale: false, selectedOptions: [], sku: 'fixture' } }] },
  seo: { title: 'Unchanged title', description: 'Unchanged metadata' },
  metafields: [{ namespace: 'custom', key: 'sourcing_review', value: 'PRIVATE_REVIEW_SENTINEL' }],
});
const template = '<html><head><title>Fixture</title><meta name="description" content="fixture" /><link rel="canonical" href="https://luxemia.shop/" /></head><body><div id="root"></div></body></html>';
let generatorPromise;
function generator() {
  return generatorPromise ||= (async () => {
    const original = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
    const source = original.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml, buildInitialProductPayload, buildVerifiedProductCopy };');
    assert.notEqual(source, original);
    const file = path.join(root, 'scripts', `.reviewed-fit-test-${process.pid}.mjs`);
    fs.writeFileSync(file, source);
    try { return await import(pathToFileURL(file).href); }
    finally { fs.unlinkSync(file); }
  })();
}
async function load(entry) {
  const { outputFiles } = await build({ entryPoints: [path.join(root, entry)], bundle: true,
    write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    alias: { '@': path.join(root, 'src') } });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}
const copy = () => import('../src/lib/reviewedFitCopy.mjs');
const render = async p => (await generator()).generateHtml(template, {
  path: `/product/${p.handle}`, title: p.title, h1: p.title,
  description: 'Unchanged metadata', content: '', product: p,
}, new Map([[p.handle, p]]));
const removeReviewedSection = html => html.replace(/<section data-reviewed-fit-copy="2026-10-26">[\s\S]*?<\/section>/g, '');

test('dated review is exactly six IDs, requires unchanged public fit text, and does not approve whole copy', async () => {
  const { FIT_COPY_REVIEW_DATE, getReviewedFitCopy, appendReviewedFitCopy } = await copy();
  const { hasReviewedProductCopy } = await import('../src/lib/reviewedProductCopy.mjs');
  assert.equal(FIT_COPY_REVIEW_DATE, '2026-10-26');
  assert.deepEqual(fixtures.map(p => p.id.split('/').at(-1)), [
    '9134761476267', '9134762950827', '9134763311275', '9134765441195', '9134765899947', '9134766096555',
  ]);
  for (const fixture of fixtures) {
    const p = product(fixture);
    assert.equal(getReviewedFitCopy(p).length, 2);
    assert.equal(hasReviewedProductCopy(p.tags), false);
    assert.equal(appendReviewedFitCopy(p.description, p), p.description, 'do not duplicate live fit text');
    assert.deepEqual(getReviewedFitCopy({ ...p, id: 'gid://shopify/Product/999' }), []);
    assert.deepEqual(getReviewedFitCopy({ ...p, descriptionHtml: p.descriptionHtml.replace('Available in standard sizes', 'Changed standard sizes') }), []);
    assert.deepEqual(getReviewedFitCopy({ ...p, description: '', descriptionHtml: '' }), []);
  }
  for (const id of [undefined, '', 'constructor', '__proto__', '9134761476267']) assert.deepEqual(getReviewedFitCopy({ id }), []);
});

test('all six preserve exact reviewed fit in static HTML, initial React details and refreshed React details', async () => {
  const { getReviewedFitCopy } = await copy();
  const { buildInitialProductPayload, buildVerifiedProductCopy } = await generator();
  const { enrichProductDescription } = await load('src/lib/productDescriptionEnrichment.ts');
  const { ProductTabs } = await load('src/components/product/ProductTabs.tsx');
  const { generateProductHtml } = await load('src/middleware/htmlGenerator.ts');
  for (const fixture of fixtures) {
    const p = product(fixture);
    const original = JSON.stringify(p);
    const staticHtml = await render(p);
    const initial = JSON.parse(buildInitialProductPayload(p)).product;
    const dynamicHtml = generateProductHtml(p, `https://luxemia.shop/product/${p.handle}`);
    const dynamicPlainHtml = generateProductHtml({ ...p, descriptionHtml: undefined }, `https://luxemia.shop/product/${p.handle}`);
    const reactDetails = description => renderToStaticMarkup(React.createElement(ProductTabs, {
      description: enrichProductDescription(description, p.productType, p.title),
      descriptionHtml: initial.descriptionHtml, tags: p.tags, productType: p.productType,
    }));
    for (const text of getReviewedFitCopy(p)) {
      for (const html of [staticHtml, dynamicHtml, dynamicPlainHtml, reactDetails(initial.description), reactDetails(p.description)]) {
        assert(plain(html).includes(text), `${p.id}: exact reviewed fit must survive each render`);
      }
      assert(!buildVerifiedProductCopy(p).includes(text), 'global feed/SEO copy builder is unchanged');
    }
    for (const output of [staticHtml, dynamicHtml, dynamicPlainHtml, JSON.stringify(initial)]) assert(!output.includes('PRIVATE_REVIEW_SENTINEL'));
    assert.equal(initial.descriptionHtml, undefined, 'do not approve entire HTML body');
    assert.equal(JSON.stringify(p), original, 'rendering must never mutate the source record');
  }
});

test('source drift fails closed; body-only changes leave metadata/schema/other products untouched', async () => {
  const { generateProductHtml } = await load('src/middleware/htmlGenerator.ts');
  const { buildInitialProductPayload } = await generator();
  for (const fixture of fixtures) {
    const p = product(fixture);
    const changed = { ...p, descriptionHtml: p.descriptionHtml.replace('Available in standard sizes', 'Changed standard sizes'), description: p.description.replace('Available in standard sizes', 'Changed standard sizes') };
    const staticReviewed = await render(p);
    const staticChanged = await render(changed);
    assert(!staticChanged.includes('data-reviewed-fit-copy'));
    const head = html => html.split('</head>')[0].replace(/<script>window\.__INITIAL_PRODUCT_DATA__[\s\S]*?<\/script>/g, '');
    assert.equal(head(staticReviewed), head(staticChanged), 'schema, meta and canonical remain unchanged');
    assert.equal(removeReviewedSection(generateProductHtml(p, 'https://luxemia.shop/product/fixture')),
      generateProductHtml(changed, 'https://luxemia.shop/product/fixture'), 'dynamic renderer only gains reviewed visible section');
    const initial = JSON.parse(buildInitialProductPayload(changed)).product;
    assert(!initial.description.includes('Available in standard sizes'));
  }
  const unrelated = { ...product(fixtures[0]), id: 'gid://shopify/Product/999' };
  assert(!((await render(unrelated)).includes('data-reviewed-fit-copy')));
  assert(!JSON.parse(buildInitialProductPayload(unrelated)).product.description.includes('Available in standard sizes'));
});

test('long body and hostile appended content cannot truncate or inject into the reviewed fit section', async () => {
  const { renderReviewedFitCopy } = await copy();
  const p = product(fixtures[0]);
  p.descriptionHtml = `<p>${'Long text '.repeat(600)}</p>${p.descriptionHtml}<script>BAD_SCRIPT_SENTINEL</script><p>UNREVIEWED_BODY_SENTINEL</p>`;
  const html = await render(p);
  assert(html.includes('data-reviewed-fit-copy="2026-10-26"'));
  assert(html.includes('Choose Made to Fit (+$10) for a personalized fit'));
  assert(!html.includes('BAD_SCRIPT_SENTINEL'));
  assert(!html.includes('UNREVIEWED_BODY_SENTINEL'));
  assert(!renderReviewedFitCopy(p).includes('<script'));
});
