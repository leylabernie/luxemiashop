const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');
const fixtures = require('./fixtures/productCopyBoundaries20261102.json');
const root = path.resolve(__dirname, '..');
let generatorPromise;
function generator() {
  return generatorPromise ||= (async () => {
    const original = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
    const source = original.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml, getLabeledListingFact, getExplicitIncludedPieces, getListedProductAttributes, buildVerifiedProductCopy, buildInitialProductPayload };');
    assert.notEqual(source, original);
    const file = path.join(root, 'scripts', `.copy-boundaries-test-${process.pid}.mjs`);
    fs.writeFileSync(file, source);
    try { return await import(pathToFileURL(file).href); }
    finally { fs.unlinkSync(file); }
  })();
}
// Reproduce Storefront API's plain-text flattening: adjacent HTML blocks may
// have no whitespace. HTML, not fabricated body measurements, is authoritative.
const flattened = html => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const product = fixture => ({ ...fixture, description: flattened(fixture.descriptionHtml),
  productType: 'Salwar Suit', availableForSale: true, vendor: 'LuxeMia',
  priceRange: { minVariantPrice: { amount: '93.00', currencyCode: 'USD' } },
  variants: { edges: [] }, images: { edges: [] }, media: { edges: [] },
});

test('four actual November listings keep Work and Included Pieces inside their explicit HTML boundaries', async () => {
  const { generateHtml, getListedProductAttributes, buildVerifiedProductCopy, buildInitialProductPayload } = await generator();
  const pieces = [
    'Kameez (top); Salwar-style bottom; Dupatta',
    'Kameez (top); Sharara bottoms; Dupatta',
    'Tunic (top); Palazzo pants; Dupatta',
    'Unstitched lehenga and choli material; Dupatta',
  ];
  for (const [index, fixture] of fixtures.entries()) {
    const p = product(fixture);
    const before = JSON.stringify(p);
    const attrs = getListedProductAttributes(p);
    assert.equal(attrs.work, 'Embroidery');
    assert.equal(attrs.includedPieces, pieces[index]);
    assert.doesNotMatch(attrs.includedPieces, /Care|Dry clean|Construction|Size and Fit/);
    const copy = buildVerifiedProductCopy(p);
    for (const piece of pieces[index].split('; ')) assert(copy.includes(piece));
    assert.doesNotMatch(copy, /DupattaCare|CareDry|EmbroideryConstruction/);
    const initial = JSON.parse(buildInitialProductPayload(p)).product;
    assert.doesNotMatch(initial.description, /DupattaCare|CareDry|EmbroideryConstruction/);
    assert.equal(initial.descriptionHtml, fixture.descriptionHtml, 'current safe Shopify HTML is preserved without a manual approval tag');
    const template = '<html><head><title>Fixture</title><meta name="description" content="fixture" /></head><body><div id="root"></div></body></html>';
    const html = generateHtml(template, { path: `/product/${p.handle}`, title: p.title,
      h1: p.title, description: copy, content: '', product: p }, new Map([[p.handle, p]]));
    const visible = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ');
    assert(visible.includes(pieces[index]), 'generated initial HTML carries exact bounded pieces');
    assert.doesNotMatch(visible, /Dupatta Care|CareDry|EmbroideryConstruction/);

    assert.equal(JSON.stringify(p), before, 'never mutates Shopify source data');
  }
});

test('HTML headings, list items and inline labels preserve boundaries without punctuation-dependent parsing', async () => {
  const { getLabeledListingFact, getExplicitIncludedPieces } = await generator();
  assert.equal(getLabeledListingFact('<ul><li>Work: Beads &amp; embroidery</li><li>Construction: Readymade</li></ul>', ['Work']), 'Beads & embroidery');
  assert.equal(getLabeledListingFact('<h3>Work</h3><p>Embroidery</p><h3>Care</h3><p>Dry clean</p>', ['Work']), 'Embroidery');
  assert.equal(getLabeledListingFact('<p><strong>Fabric:</strong> Soft silk</p><p>Care: Dry clean</p>', ['Fabric']), 'Soft silk');
  assert.equal(getExplicitIncludedPieces({ descriptionHtml: '<h3>Included Pieces:</h3><ul><li>Kurta</li><li>Pants</li></ul><h2>Other facts</h2><p>Care: Dry clean</p>' }), 'Kurta; Pants');
  assert.equal(getExplicitIncludedPieces({ descriptionHtml: '<p>Includes: Saree and blouse fabric</p><p>Care: Dry clean</p>' }), 'Saree and blouse fabric');
});

test('existing explicit tags and plain-text label behavior remain supported; no service copy or guesses', async () => {
  const { getLabeledListingFact, getExplicitIncludedPieces } = await generator();
  assert.equal(getLabeledListingFact('Fabric: Silk. Work: Embroidery. Care: Dry clean.', ['Work']), 'Embroidery');
  assert.equal(getExplicitIncludedPieces({ title: 'Saree', tags: ['included:Saree and unstitched blouse fabric'], descriptionHtml: '<h3>Included Pieces</h3><p>Other prose</p>' }), 'Saree and unstitched blouse fabric');
  assert.equal(getExplicitIncludedPieces({ descriptionHtml: '<h3>Included Pieces</h3><p>Approved $10 blouse stitching tier</p>' }), undefined);
  assert.equal(getExplicitIncludedPieces({ descriptionHtml: '<h3>Included Pieces</h3><p>Unknown</p><h3>Care</h3><p>Dry clean</p>' }), undefined);
  assert.equal(getLabeledListingFact('<h3>Work</h3><p>Unknown</p><h3>Care</h3><p>Dry clean</p>', ['Work']), undefined);
});

test('established reviewed saree copy and explicit included pieces survive unchanged', async () => {
  const { buildVerifiedProductCopy, buildInitialProductPayload, getExplicitIncludedPieces } = await generator();
  const established = require('./fixtures/catalog-included-pieces-20261028.json').products
    .find(p => p.handle === 'blush-beige-tissue-silk-saree');
  assert(established, 'use a captured real established listing');
  const p = product(established);
  assert.equal(getExplicitIncludedPieces(p), 'Saree with unstitched blouse fabric.');
  const copy = buildVerifiedProductCopy(p);
  assert(copy.includes('Fabric: Tissue Silk with a smooth, lustrous drape.'));
  const initial = JSON.parse(buildInitialProductPayload(p)).product;
  assert.equal(initial.descriptionHtml, established.descriptionHtml);
});

test('multiple labeled fields inside one HTML block stay separate', async () => {
  const { getLabeledListingFact, getExplicitIncludedPieces } = await generator();
  assert.equal(getLabeledListingFact('<p>Fabric: Silk<br>Work: Embroidery</p>', ['Fabric']), 'Silk');
  assert.equal(getLabeledListingFact('<li>Work: Embroidery; Construction: Readymade</li>', ['Work']), 'Embroidery');
  assert.equal(getExplicitIncludedPieces({ descriptionHtml: '<p>Includes: Kurta; Pants<br>Care: Dry clean</p>' }), 'Kurta; Pants');
});

test('long included-piece sections retain the first explicit sentence and component labels are not mistaken for new fields', async () => {
  const { getExplicitIncludedPieces } = await generator();
  assert.equal(getExplicitIncludedPieces({ descriptionHtml: '<h3>Included Pieces</h3><p>Saree with unstitched blouse fabric. '+ 'General styling guidance. '.repeat(10) + '</p><h3>Care</h3><p>Dry clean.</p>' }), 'Saree with unstitched blouse fabric.');
  assert.equal(getExplicitIncludedPieces({ descriptionHtml: '<h3>Included Pieces</h3><ul><li>Kurta</li><li>Pants</li><li>Dupatta: Georgette</li></ul><h3>Care</h3><p>Dry clean</p>' }), 'Kurta; Pants; Dupatta: Georgette');
  assert.equal(getExplicitIncludedPieces({ descriptionHtml: '<h3>Included Pieces</h3><p>Saree and 1.20 m blouse fabric. Accessories shown for styling.</p>' }), 'Saree and 1.20 m blouse fabric.');
});
