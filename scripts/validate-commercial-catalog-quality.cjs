#!/usr/bin/env node
/**
 * Fails production builds when prerendered product pages lose purchase-intent
 * navigation or publish vague/incomplete set contents.
 */
const fs = require('fs');
const path = require('path');

const PRODUCT_ROOT = path.resolve(__dirname, '../dist/_prerender/product');
const COMMERCIAL_LINK_MARKER = 'aria-label="Shop purchase-intent collections"';
const GENERIC_INCLUDED_COPY = /see the product description and images|review the product images|review the listing images|exact set contents/i;

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

function decode(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function requirement(label, ...groups) {
  return { label, groups };
}

function inferRequiredComponents(title) {
  const hasThreePieceEvidence = /\b(?:three|3)[-\s]?piece\b/i.test(title);
  const hasDupatta = /\bwith\b[^|,;]{0,48}\bdupatta\b/i.test(title);

  if (hasThreePieceEvidence && hasDupatta && /\bpalazzo\b/i.test(title)) {
    return requirement('palazzo three-piece set', /\b(?:tunic|top|kameez|kurta)\b/i, /\bpalazzo\b/i, /\bdupatta\b/i);
  }
  if (hasThreePieceEvidence && hasDupatta && /\bsharara\b/i.test(title)) {
    return requirement('sharara three-piece set', /\b(?:tunic|top|kameez|kurta)\b/i, /\bsharara\b/i, /\bdupatta\b/i);
  }
  if (hasThreePieceEvidence && hasDupatta && /\bgharara\b/i.test(title)) {
    return requirement('gharara three-piece set', /\b(?:tunic|top|kameez|kurta)\b/i, /\bgharara\b/i, /\bdupatta\b/i);
  }
  if (hasDupatta && /\bsalwar\s+kameez\b/i.test(title)) {
    return requirement('salwar kameez set', /\b(?:kameez|tunic|top|kurta)\b/i, /\bsalwar\b/i, /\bdupatta\b/i);
  }
  if (hasThreePieceEvidence && hasDupatta && /\b(?:salwar\s+)?suit\b/i.test(title)) {
    return requirement(
      'three-piece suit',
      /\b(?:tunic|top|kameez|kurta)\b/i,
      /\b(?:pants?|palazzo|sharara|gharara|salwar|bottom|trousers?)\b/i,
      /\bdupatta\b/i,
    );
  }
  if (hasDupatta && /\blehenga\s+choli\b/i.test(title)) {
    return requirement('lehenga choli set', /\blehenga\b/i, /\b(?:choli|blouse)\b/i, /\bdupatta\b/i);
  }
  if (hasDupatta && /\blehenga\b/i.test(title)) {
    return requirement('lehenga set', /\blehenga\b/i, /\bdupatta\b/i);
  }
  if (/\b(?:saree|sari)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bblouse\s+(?:piece|fabric|material)\b/i.test(title)) {
    return requirement('saree with blouse fabric', /\b(?:saree|sari)\b/i, /\bblouse\b/i);
  }
  if (/\bsherwani\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bstole\b/i.test(title)) {
    return requirement('sherwani with stole', /\bsherwani\b/i, /\bstole\b/i);
  }
  if (/\bkurta\s+(?:pajama|pyjama)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bvest\b/i.test(title)) {
    return requirement('kurta pajama with vest', /\bkurta\b/i, /\b(?:pajama|pyjama|pants?)\b/i, /\bvest\b/i);
  }
  if (/\bkurta\s+(?:pajama|pyjama)\b/i.test(title) && /\bwith\b[^|,;]{0,48}\bjacket\b/i.test(title)) {
    return requirement('kurta pajama with jacket', /\bkurta\b/i, /\b(?:pajama|pyjama|pants?)\b/i, /\bjacket\b/i);
  }
  return undefined;
}

function satisfiesRequirement(included, expected) {
  return expected.groups.every((pattern) => pattern.test(included));
}

const files = walk(PRODUCT_ROOT);
if (files.length === 0) {
  throw new Error('[commercial-quality] No prerendered product HTML files found.');
}

const failures = [];
let withCommercialLinks = 0;
let withIncludedPieces = 0;
let titleBackedChecked = 0;
let genericIncluded = 0;

for (const filePath of files) {
  const relativePath = path.relative(PRODUCT_ROOT, filePath);
  const html = fs.readFileSync(filePath, 'utf8');
  const title = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const included = decode(html.match(/<dt>Included Pieces<\/dt>\s*<dd>([\s\S]*?)<\/dd>/i)?.[1]);

  if (html.includes(COMMERCIAL_LINK_MARKER)) withCommercialLinks += 1;
  else failures.push(`missing purchase-intent navigation: ${relativePath}`);

  if (included) {
    withIncludedPieces += 1;
    if (GENERIC_INCLUDED_COPY.test(included)) genericIncluded += 1;
  }

  const expected = inferRequiredComponents(title);
  if (expected) {
    titleBackedChecked += 1;
    if (!included || !satisfiesRequirement(included, expected)) {
      failures.push(
        `title-backed component mismatch: ${relativePath}; expected ${expected.label}, found "${included || 'missing'}"`,
      );
    }
  }
}

console.log(
  `[commercial-quality] Checked ${files.length} product pages; ${withCommercialLinks} have purchase-intent navigation; ${withIncludedPieces} expose included pieces; ${titleBackedChecked} explicit title-backed sets verified; ${genericIncluded} legacy generic values queued for catalog remediation.`,
);

if (failures.length > 0) {
  throw new Error(
    '[commercial-quality] Failed:\n' + failures.slice(0, 100).map((item) => `- ${item}`).join('\n'),
  );
}

if (genericIncluded > 0) {
  throw new Error(
    `[commercial-quality] ${genericIncluded} product page(s) still expose generic included-piece copy; ` +
    'catalog normalization must finish before release.',
  );
}
