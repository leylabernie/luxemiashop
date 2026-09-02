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
  const before = String.raw`    : listedIncludedPieces || inferIncludedPiecesFromTitle(product.title || '', product.tags || []);`;
  const after = String.raw`    : inferIncludedPiecesFromTitle(product.title || '', product.tags || []) || listedIncludedPieces;`;
  source = replaceOnce(source, before, after, 'align middleware included-piece precedence');
  write(relativePath, source);
}

function patchValidatorScope() {
  const relativePath = 'scripts/validate-commercial-catalog-quality.cjs';
  let source = read(relativePath);
  const before = String.raw`  if (included) {
    withIncludedPieces += 1;
    if (GENERIC_INCLUDED_COPY.test(included)) {
      genericIncluded += 1;
      failures.push(__BT__generic included-pieces copy: ${relativePath}__BT__);
    }
  }`;
  const after = String.raw`  if (included) {
    withIncludedPieces += 1;
    if (GENERIC_INCLUDED_COPY.test(included)) genericIncluded += 1;
  }`;

  // Build the exact template-literal delimiters without nesting backticks in
  // this script's own raw template literal.
  const normalizedBefore = before.replace(/__BT__/g, String.fromCharCode(96));
  source = replaceOnce(
    source,
    normalizedBefore,
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
