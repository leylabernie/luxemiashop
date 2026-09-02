#!/usr/bin/env node
/**
 * Applies the commercial-catalog recovery immediately before production builds.
 *
 * LuxeMia intentionally has several defensive build-time source normalizers.
 * This script runs after those normalizers so the storefront, prerenderer, and
 * bot HTML generator all use the same conservative included-pieces logic.
 * It is idempotent and refuses to write when an expected source anchor drifts.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`[commercial-catalog-recovery] Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, 'utf8');
  console.log(`[commercial-catalog-recovery] Updated ${relativePath}`);
}

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) {
    throw new Error(`[commercial-catalog-recovery] Expected source pattern not found: ${label}`);
  }
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`[commercial-catalog-recovery] Source pattern is not unique: ${label}`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const TS_HELPER = String.raw`export function inferIncludedPiecesFromTitle(
  productTitle = '',
  tags: string[] = [],
): string | undefined {
  const title = productTitle.replace(/\s+/g, ' ').trim();
  if (!title) return undefined;

  const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());
  const hasThreePieceEvidence = /\b(?:three|3)[-\s]?piece\b/i.test(title)
    || normalizedTags.some((tag) => /^(?:three|3)[-\s]?piece(?:\s+suit|\s+set)?$/.test(tag));
  const hasDupatta = /\bwith\b[^|,;]{0,48}\bdupatta\b/i.test(title);

  // Only infer components when the title, or an explicit three-piece tag for
  // an imported suit set, names the garments. Product type alone is never
  // enough evidence.
  if (hasThreePieceEvidence && hasDupatta && /\bpalazzo\b/i.test(title)) {
    return 'Tunic, palazzo pants, and dupatta';
  }
  if (hasThreePieceEvidence && hasDupatta && /\bsharara\b/i.test(title)) {
    return 'Tunic, sharara pants, and dupatta';
  }
  if (hasThreePieceEvidence && hasDupatta && /\bgharara\b/i.test(title)) {
    return 'Tunic, gharara pants, and dupatta';
  }
  if (hasDupatta && /\bsalwar\s+kameez\b/i.test(title)) {
    return 'Kameez, salwar pants, and dupatta';
  }
  if (hasThreePieceEvidence && hasDupatta && /\b(?:salwar\s+)?suit\b/i.test(title)) {
    return 'Tunic, pants, and dupatta';
  }
  if (hasDupatta && /\blehenga\s+choli\b/i.test(title)) {
    return 'Lehenga, choli, and dupatta';
  }
  if (hasDupatta && /\blehenga\b/i.test(title)) {
    return 'Lehenga and dupatta';
  }
  if (/\bsaree\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bblouse\s+(?:piece|fabric|material)\b/i.test(title)) {
    return 'Saree and blouse fabric';
  }
  if (/\bsherwani\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bstole\b/i.test(title)) {
    return 'Sherwani and stole';
  }
  if (/\bkurta\s+(?:pajama|pyjama)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bvest\b/i.test(title)) {
    return 'Kurta, pajama pants, and vest';
  }
  if (/\bkurta\s+(?:pajama|pyjama)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bjacket\b/i.test(title)) {
    return 'Kurta, pajama pants, and jacket';
  }

  return undefined;
}

`;

const JS_HELPER = String.raw`function inferIncludedPiecesFromTitle(productTitle = '', tags = []) {
  const title = String(productTitle || '').replace(/\s+/g, ' ').trim();
  if (!title) return undefined;

  const normalizedTags = (tags || []).map((tag) => String(tag).trim().toLowerCase());
  const hasThreePieceEvidence = /\b(?:three|3)[-\s]?piece\b/i.test(title)
    || normalizedTags.some((tag) => /^(?:three|3)[-\s]?piece(?:\s+suit|\s+set)?$/.test(tag));
  const hasDupatta = /\bwith\b[^|,;]{0,48}\bdupatta\b/i.test(title);

  if (hasThreePieceEvidence && hasDupatta && /\bpalazzo\b/i.test(title)) return 'Tunic, palazzo pants, and dupatta';
  if (hasThreePieceEvidence && hasDupatta && /\bsharara\b/i.test(title)) return 'Tunic, sharara pants, and dupatta';
  if (hasThreePieceEvidence && hasDupatta && /\bgharara\b/i.test(title)) return 'Tunic, gharara pants, and dupatta';
  if (hasDupatta && /\bsalwar\s+kameez\b/i.test(title)) return 'Kameez, salwar pants, and dupatta';
  if (hasThreePieceEvidence && hasDupatta && /\b(?:salwar\s+)?suit\b/i.test(title)) return 'Tunic, pants, and dupatta';
  if (hasDupatta && /\blehenga\s+choli\b/i.test(title)) return 'Lehenga, choli, and dupatta';
  if (hasDupatta && /\blehenga\b/i.test(title)) return 'Lehenga and dupatta';
  if (/\bsaree\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bblouse\s+(?:piece|fabric|material)\b/i.test(title)) return 'Saree and blouse fabric';
  if (/\bsherwani\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bstole\b/i.test(title)) return 'Sherwani and stole';
  if (/\bkurta\s+(?:pajama|pyjama)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bvest\b/i.test(title)) return 'Kurta, pajama pants, and vest';
  if (/\bkurta\s+(?:pajama|pyjama)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bjacket\b/i.test(title)) return 'Kurta, pajama pants, and jacket';
  return undefined;
}

`;

function patchProductPurchaseFlow() {
  const relativePath = 'src/lib/productPurchaseFlow.ts';
  let source = read(relativePath);

  if (!source.includes('export function inferIncludedPiecesFromTitle(')) {
    source = replaceOnce(
      source,
      '/**\n * Uses only listing-backed set contents: normalized metadata first, then one\n * exact included-pieces tag, and finally an explicit "with dupatta" title.\n * Product type alone is never used to invent set contents.\n */\nexport function resolveIncludedPieces(',
      `${TS_HELPER}/**\n * Uses only listing-backed set contents: normalized metadata first, then one\n * exact included-pieces tag, and finally conservative title/tag evidence.\n * Product type alone is never used to invent set contents.\n */\nexport function resolveIncludedPieces(`,
      'insert title-backed included-pieces helper',
    );
  }

  const oldTail = String.raw`  if (!/\bwith\s+dupatta\b/i.test(productTitle)) return undefined;
  if (/\blehenga\s+choli\b/i.test(productTitle)) return 'Lehenga choli and dupatta';
  if (/\blehenga\b/i.test(productTitle)) return 'Lehenga and dupatta';
  if (/\bsaree\b/i.test(productTitle)) return 'Saree and dupatta';
  if (/\bsuit\b/i.test(productTitle)) return 'Suit and dupatta';

  return undefined;`;
  source = replaceOnce(
    source,
    oldTail,
    '  return inferIncludedPiecesFromTitle(productTitle, tags);',
    'replace ambiguous title fallback',
  );
  write(relativePath, source);
}

function patchPurchaseFlowTests() {
  const relativePath = 'tests/productPurchaseFlow.test.mjs';
  let source = read(relativePath);

  source = replaceOnce(
    source,
    String.raw`  isVariantOptionValueAvailable,
  resolveAvailableVariantForOption,
  resolveIncludedPieces,`,
    String.raw`  inferIncludedPiecesFromTitle,
  isVariantOptionValueAvailable,
  resolveAvailableVariantForOption,
  resolveIncludedPieces,`,
    'add helper test import',
  );

  const testBlock = String.raw`

test('title-backed included pieces require explicit garment evidence', () => {
  assert.equal(
    inferIncludedPiecesFromTitle(
      'Cream Chinnon Beaded Palazzo Suit with Butti Dupatta',
      ['three piece suit'],
    ),
    'Tunic, palazzo pants, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Embroidered Three-Piece Sharara Suit with Dupatta'),
    'Tunic, sharara pants, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Silk Three Piece Gharara Suit with Matching Dupatta'),
    'Tunic, gharara pants, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Cotton Salwar Kameez with Printed Dupatta'),
    'Kameez, salwar pants, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Pink Net Lehenga Choli with Dupatta'),
    'Lehenga, choli, and dupatta',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Banarasi Saree with Unstitched Blouse Piece'),
    'Saree and blouse fabric',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Ivory Groom Sherwani with Embroidered Stole'),
    'Sherwani and stole',
  );
  assert.equal(
    inferIncludedPiecesFromTitle('Kurta Pajama with Nehru Vest'),
    'Kurta, pajama pants, and vest',
  );
});

test('title inference remains conservative for ambiguous listings', () => {
  assert.equal(inferIncludedPiecesFromTitle('Pink Bridal Lehenga'), undefined);
  assert.equal(inferIncludedPiecesFromTitle('Blue Palazzo Suit with Dupatta'), undefined);
  assert.equal(inferIncludedPiecesFromTitle('Silk Saree with Dupatta'), undefined);
  assert.equal(inferIncludedPiecesFromTitle('Groom Sherwani'), undefined);
});

test('normalized metadata and exact included tags still outrank title inference', () => {
  assert.equal(
    resolveIncludedPieces(
      ['Custom top', 'Custom trousers', 'Custom dupatta'],
      ['three piece suit'],
      'Cream Palazzo Suit with Dupatta',
    ),
    'Custom top, Custom trousers, Custom dupatta',
  );
  assert.equal(
    resolveIncludedPieces(
      null,
      ['Included: Kurta, churidar, and stole', 'three piece suit'],
      'Groom Sherwani with Stole',
    ),
    'Kurta, churidar, and stole',
  );
});
`;

  if (!source.includes("test('title-backed included pieces require explicit garment evidence'")) {
    source += testBlock;
  }
  write(relativePath, source);
}

function patchPrerender() {
  const relativePath = 'scripts/prerender.js';
  let source = read(relativePath);

  if (!source.includes('function inferIncludedPiecesFromTitle(productTitle =')) {
    source = replaceOnce(
      source,
      'function getExplicitIncludedPieces(product) {',
      `${JS_HELPER}function getExplicitIncludedPieces(product) {`,
      'insert prerender included-pieces helper',
    );
  }

  source = replaceOnce(
    source,
    String.raw`  const parsed = cleanVerifiedFact(explicit?.[1]);
  if (!parsed) return undefined;`,
    String.raw`  const parsed = cleanVerifiedFact(explicit?.[1]);
  const titleBackedPieces = inferIncludedPiecesFromTitle(product?.title, product?.tags || []);
  if (!parsed) return titleBackedPieces;`,
    'add title-backed prerender fallback',
  );

  source = replaceOnce(
    source,
    String.raw`    return undefined;
  }
  if (!/\b(?:blouse|choli|lehenga|skirt|dupatta|saree|fabric|top|kurta|kameez|pants?|palazzo|sharara|gharara|jacket|vest|tunic|necklace|earrings?|bangles?|bracelet|ring|tikka|purse|potli)\b/i.test(parsed)) {
    return undefined;
  }`,
    String.raw`    return titleBackedPieces;
  }
  if (!/\b(?:blouse|choli|lehenga|skirt|dupatta|saree|fabric|top|kurta|kameez|pants?|palazzo|sharara|gharara|jacket|vest|tunic|necklace|earrings?|bangles?|bracelet|ring|tikka|purse|potli)\b/i.test(parsed)) {
    return titleBackedPieces;
  }`,
    'preserve title fallback after invalid description parse',
  );

  write(relativePath, source);
}

function patchHtmlGenerator() {
  const relativePath = 'src/middleware/htmlGenerator.ts';
  let source = read(relativePath);

  const optionImport = "import { isProductSizeOptionName } from '../lib/productOptionNames.js';";
  source = replaceOnce(
    source,
    optionImport,
    `${optionImport}\nimport { inferIncludedPiecesFromTitle } from '../lib/productPurchaseFlow.js';`,
    'import title-backed included-pieces helper',
  );

  source = replaceOnce(
    source,
    String.raw`  const includedPieces = components.length > 0
    ? components.join(', ')
    : includedPiecesTag && includedPiecesPrefix
    ? includedPiecesTag.slice(includedPiecesPrefix.length).trim()
    : getLabeledDescriptionValue(product.description, ['set includes', 'included pieces', 'included', 'pieces', 'package includes']);`,
    String.raw`  const listedIncludedPieces = getLabeledDescriptionValue(
    product.description,
    ['set includes', 'included pieces', 'included', 'pieces', 'package includes'],
  );
  const includedPieces = components.length > 0
    ? components.join(', ')
    : includedPiecesTag && includedPiecesPrefix
    ? includedPiecesTag.slice(includedPiecesPrefix.length).trim()
    : listedIncludedPieces || inferIncludedPiecesFromTitle(product.title || '', product.tags || []);`,
    'align middleware included-pieces extraction',
  );

  write(relativePath, source);
}

patchProductPurchaseFlow();
patchPurchaseFlowTests();
patchPrerender();
patchHtmlGenerator();

console.log('[commercial-catalog-recovery] Recovery applied; storefront, prerender, and bot HTML now share conservative product-component logic.');
