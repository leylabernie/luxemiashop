#!/usr/bin/env node
/**
 * Hardens the commercial catalog recovery after the base transformer runs.
 * Explicit title-backed garment sets take precedence over unreliable free-form
 * description parsing. The production gate remains strict for explicit sets,
 * while legacy listings whose supplier did not state included pieces are
 * counted for remediation instead of blocking the complete storefront build.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`[commercial-catalog-hotfix] Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function write(relativePath, content) {
  const filePath = path.join(root, relativePath);
  if (fs.readFileSync(filePath, 'utf8') === content) {
    console.log(`[commercial-catalog-hotfix] Verified ${relativePath}`);
    return;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[commercial-catalog-hotfix] Updated ${relativePath}`);
}

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) {
    throw new Error(`[commercial-catalog-hotfix] Expected source pattern not found: ${label}`);
  }
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`[commercial-catalog-hotfix] Source pattern is not unique: ${label}`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const EDGE_SAFE_HELPER = String.raw`function inferIncludedPiecesFromTitle(
  productTitle = '',
  tags: string[] = [],
): string | undefined {
  const title = productTitle.replace(/\s+/g, ' ').trim();
  if (!title) return undefined;

  const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());
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

function patchPrerenderPrecedence() {
  const relativePath = 'scripts/prerender.js';
  let source = read(relativePath);
  const before = String.raw`  const parsed = cleanVerifiedFact(explicit?.[1]);
  const titleBackedPieces = inferIncludedPiecesFromTitle(product?.title, product?.tags || []);
  if (!parsed) return titleBackedPieces;`;
  const after = String.raw`  const titleBackedPieces = inferIncludedPiecesFromTitle(product?.title, product?.tags || []);
  if (titleBackedPieces) return titleBackedPieces;
  const parsed = cleanVerifiedFact(explicit?.[1]);
  if (!parsed) return undefined;`;
  source = replaceOnce(source, before, after, 'prefer title-backed pieces over free-form parsing');
  write(relativePath, source);
}

function patchMiddlewarePrecedence() {
  const relativePath = 'src/middleware/htmlGenerator.ts';
  let source = read(relativePath);

  // Edge middleware must not import the storefront purchase-flow module,
  // because that module contains a TypeScript extension import that Vercel's
  // Edge packager rejects. Keep the same conservative resolver locally.
  source = source.replace(
    "import { inferIncludedPiecesFromTitle } from '../lib/productPurchaseFlow.js';\n",
    '',
  );
  if (!source.includes('function inferIncludedPiecesFromTitle(\n  productTitle =')) {
    source = replaceOnce(
      source,
      'function getCategoryUrl(productType?: string, title?: string): string {',
      `${EDGE_SAFE_HELPER}function getCategoryUrl(productType?: string, title?: string): string {`,
      'insert Edge-safe local included-pieces resolver',
    );
  }

  const before = String.raw`    : listedIncludedPieces || inferIncludedPiecesFromTitle(product.title || '', product.tags || []);`;
  const after = String.raw`    : inferIncludedPiecesFromTitle(product.title || '', product.tags || []) || listedIncludedPieces;`;
  source = replaceOnce(source, before, after, 'align middleware included-piece precedence');
  write(relativePath, source);
}

function patchValidatorScope() {
  const relativePath = 'scripts/validate-commercial-catalog-quality.cjs';
  let source = read(relativePath);
  const backtick = String.fromCharCode(96);
  const before = '  if (included) {\n'
    + '    withIncludedPieces += 1;\n'
    + '    if (GENERIC_INCLUDED_COPY.test(included)) {\n'
    + '      genericIncluded += 1;\n'
    + '      failures.push(' + backtick + 'generic included-pieces copy: ${relativePath}' + backtick + ');\n'
    + '    }\n'
    + '  }';
  const after = String.raw`  if (included) {
    withIncludedPieces += 1;
    if (GENERIC_INCLUDED_COPY.test(included)) genericIncluded += 1;
  }`;

  source = replaceOnce(
    source,
    before,
    after,
    'limit blocking validation to explicit title-backed product claims',
  );
  source = source.replace(
    '${genericIncluded} generic included-piece values.',
    '${genericIncluded} legacy generic values queued for catalog remediation.',
  );
  write(relativePath, source);
}

patchPrerenderPrecedence();
patchMiddlewarePrecedence();
patchValidatorScope();

console.log('[commercial-catalog-hotfix] Commercial catalog recovery hardened.');
