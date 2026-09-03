#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const failures = [];

function read(relative) {
  const absolute = path.join(ROOT, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`${relative} is missing`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function requireText(relative, values) {
  const source = read(relative);
  for (const value of values) {
    if (!source.includes(value)) failures.push(`${relative} is missing required evidence guard: ${value}`);
  }
}

function forbid(relative, patterns) {
  const source = read(relative);
  for (const pattern of patterns) {
    if (pattern.test(source)) failures.push(`${relative} contains prohibited inferred or fallback content matching ${pattern}`);
  }
}

function parseCsv(source, relative) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const character = source[i];

    if (quoted) {
      if (character === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      if (field.endsWith('\r')) field = field.slice(0, -1);
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) {
    failures.push(`${relative} contains an unterminated quoted CSV field`);
    return [];
  }

  if (field || row.length > 0) {
    if (field.endsWith('\r')) field = field.slice(0, -1);
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function normalizeEvidence(value) {
  return value.toLowerCase().match(/[a-z0-9]+/g) || [];
}

function hasPhrase(values, phrase) {
  const phraseWords = normalizeEvidence(phrase);
  if (phraseWords.length === 0) return false;

  return values.some((value) => {
    const valueWords = normalizeEvidence(value);
    return valueWords.some((_, start) =>
      phraseWords.every((word, offset) => valueWords[start + offset] === word),
    );
  });
}

function documentedCatalogSizes(bodyHtml) {
  const documented = new Set();
  const sizeField = /<strong\b[^>]*>\s*Size\s*:\s*<\/strong>\s*([^<]+)/gi;

  for (const match of bodyHtml.matchAll(sizeField)) {
    for (const value of match[1].split(/[,/|]/)) {
      const normalized = normalizeEvidence(value).join(' ');
      if (normalized) documented.add(normalized);
    }
  }

  return documented;
}

function validateTrackedCatalogTags(relative) {
  const source = read(relative);
  if (!source) return;

  const rows = parseCsv(source, relative);
  if (rows.length === 0) return;

  const header = rows[0];
  const column = Object.fromEntries(header.map((name, index) => [name, index]));
  const requiredColumns = [
    'Handle',
    'Title',
    'Body (HTML)',
    'Type',
    'Tags',
    'Published',
    'Status',
    'Option1 Name',
    'Option1 Value',
    'Option2 Name',
    'Option2 Value',
    'Variant Inventory Qty',
  ];

  for (const name of requiredColumns) {
    if (!(name in column)) failures.push(`${relative} is missing the ${name} column`);
  }
  if (requiredColumns.some((name) => !(name in column))) return;

  rows.slice(1).forEach((row, rowIndex) => {
    if (row.length !== header.length) {
      failures.push(`${relative} row ${rowIndex + 2} has ${row.length} columns; expected ${header.length}`);
    }
  });
  if (rows.slice(1).some((row) => row.length !== header.length)) return;

  const groups = new Map();
  for (const row of rows.slice(1)) {
    const handle = row[column.Handle];
    if (!groups.has(handle)) groups.set(handle, []);
    groups.get(handle).push(row);
  }

  const processingClaims = [
    'ready to ship',
    'ready to wear',
    'made to measure',
    'made to order',
    'custom tailoring',
    'custom made',
    'bespoke tailoring',
    'semi stitched',
    'pre stitched',
    'unstitched',
    'in stock',
    'same day dispatch',
    'express dispatch',
  ];

  for (const [handle, productRows] of groups) {
    const productRow = productRows.find((row) => row[column.Title].trim());
    if (!productRow) {
      failures.push(`${relative} product ${handle || '(blank handle)'} has no titled product row`);
      continue;
    }

    const independentEvidenceFields = [
      productRow[column.Title],
      productRow[column['Body (HTML)']],
      productRow[column.Type],
    ].filter(Boolean);
    const evidenceWords = new Set(independentEvidenceFields.flatMap(normalizeEvidence));
    const optionValues = productRows.flatMap((row) => [
      row[column['Option1 Value']],
      row[column['Option2 Value']],
    ]).filter(Boolean);
    const tags = productRow[column.Tags]
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const documentedSizes = documentedCatalogSizes(productRow[column['Body (HTML)']]);
    const sizeValueColumns = [1, 2]
      .filter((optionNumber) =>
        productRow[column[`Option${optionNumber} Name`]].trim().toLowerCase() === 'size',
      )
      .map((optionNumber) => column[`Option${optionNumber} Value`]);

    if (sizeValueColumns.length === 0) {
      failures.push(`${relative} product ${handle} has no explicit Size option column`);
    }

    for (const tag of tags) {
      const unsupportedWords = normalizeEvidence(tag).filter((word) => !evidenceWords.has(word));
      if (unsupportedWords.length > 0) {
        failures.push(
          `${relative} product ${handle} has unsupported tag "${tag}"; missing field evidence for ${[...new Set(unsupportedWords)].join(', ')}`,
        );
      }
    }

    const taggedProcessingClaims = processingClaims.filter((claim) =>
      tags.some((tag) => hasPhrase([tag], claim)),
    );
    for (const claim of taggedProcessingClaims) {
      if (!hasPhrase(independentEvidenceFields, claim)) {
        failures.push(`${relative} product ${handle} has processing tag "${claim}" without independent title/body/type evidence`);
      }
    }

    const variantProcessingClaims = processingClaims.filter((claim) => hasPhrase(optionValues, claim));
    for (const claim of variantProcessingClaims) {
      if (!hasPhrase(independentEvidenceFields, claim)) {
        failures.push(`${relative} product ${handle} has variant mode "${claim}" without independent title/body/type evidence`);
      }
    }

    if (taggedProcessingClaims.length > 1) {
      const unscopedClaims = taggedProcessingClaims.filter((claim) => !hasPhrase(optionValues, claim));
      if (unscopedClaims.length > 0) {
        failures.push(
          `${relative} product ${handle} mixes processing/customization tags without separate option evidence: ${unscopedClaims.join(', ')}`,
        );
      }
    }

    if (productRow[column.Published].trim().toLowerCase() !== 'false') {
      failures.push(`${relative} product ${handle} must remain unpublished while this import artifact is quarantined`);
    }
    if (productRow[column.Status].trim().toLowerCase() !== 'draft') {
      failures.push(`${relative} product ${handle} must remain a draft while this import artifact is quarantined`);
    }

    for (const row of productRows) {
      const published = row[column.Published].trim().toLowerCase();
      const status = row[column.Status].trim().toLowerCase();
      const inventoryQuantity = row[column['Variant Inventory Qty']].trim();
      if (published && published !== 'false') {
        failures.push(`${relative} product ${handle} contains a non-false Published value`);
      }
      if (status && status !== 'draft') {
        failures.push(`${relative} product ${handle} contains a non-draft Status value`);
      }
      if (inventoryQuantity && Number.isFinite(Number(inventoryQuantity)) && Number(inventoryQuantity) > 0) {
        failures.push(`${relative} product ${handle} contains an unevidenced positive inventory quantity`);
      }

      for (const sizeColumn of sizeValueColumns) {
        const size = row[sizeColumn].trim();
        const normalizedSize = normalizeEvidence(size).join(' ');
        if (normalizedSize && !documentedSizes.has(normalizedSize)) {
          failures.push(`${relative} product ${handle} has undocumented retained size "${size}"`);
        }
      }
    }
  }
}

const middleware = read('middleware.ts');
if (fs.existsSync(path.join(ROOT, 'src/middleware/jewelryFallback.ts'))) {
  failures.push('src/middleware/jewelryFallback.ts must not fabricate indexable products outside the Shopify catalog');
}
for (const prohibited of ['jewelryFallback', 'getJewelryProductByHandle', 'generateJewelryProductHtml']) {
  if (middleware.includes(prohibited)) failures.push(`middleware.ts still references ${prohibited}`);
}

requireText('src/components/product/ProductTabs.tsx', [
  'Only explicitly prefixed fact tags are displayed',
  'does not infer fabric, fiber composition, included pieces, color, work, or occasion',
  'does not apply a universal chart to this item',
  'A product-specific care instruction was not supplied',
]);
forbid('src/components/product/ProductTabs.tsx', [
  /OCCASION_INFO/,
  /MATERIAL_INFO/,
  /FABRIC_CARE/,
  /<td[^>]*>XS<\/td>/,
  /<td[^>]*>32<\/td>/,
  /perfect for/i,
  /flattering/i,
  /dry clean only/i,
  /isStitchable/,
  /A tailoring option is available for this listing/i,
  /its displayed price/i,
]);
requireText('src/lib/serviceAddOns.ts', [
  'product-specific `service:` or',
  'generic blouse evidence cannot imply that a paid service is compatible',
  'SERVICE_ADD_ON_CODES.has(code)',
]);
forbid('src/lib/serviceAddOns.ts', [
  /Every saree receives/i,
  /if \(isSaree\)/,
  /supportsAlteration/,
]);

const middlewareHtml = read('src/middleware/htmlGenerator.ts');
if (/generateProductHtml|ProductGroup|InStock|OutOfStock/.test(middlewareHtml)) {
  failures.push('src/middleware/htmlGenerator.ts must not restore the retired non-purchasable product renderer');
}
for (const evidence of ['return404', "'X-Robots-Tag': 'noindex, follow'"]) {
  if (!middlewareHtml.includes(evidence)) failures.push(`src/middleware/htmlGenerator.ts is missing its shared 404 helper evidence: ${evidence}`);
}
forbid('src/middleware/htmlGenerator.ts', [
  /metafieldGender\s*\|\|/,
  /name:\s*['"]Market['"]/,
  /gender\s*===\s*['"]male['"]\s*\?\s*['"]Male['"]\s*:\s*['"]Female['"]/,
]);

requireText('src/lib/shipBy.ts', [
  'getProcessingEstimateLabel',
  'Carrier transit and delivery timing are separate.',
]);
forbid('src/lib/shipBy.ts', [
  /date-fns/,
  /new Date/,
  /holiday/i,
  /addUsBusinessDays/,
  /Ships by/i,
]);
forbid('src/components/product/DeliveryEstimate.tsx', [
  /estimated dispatch date/i,
]);

requireText('src/lib/shopify.ts', [
  "import { buildVerifiedProductCopy, sanitizeProductTitle } from './productDescriptionEnrichment';",
  'const verifiedDescription = buildVerifiedProductCopy(node);',
  'description: verifiedDescription,',
]);
forbid('src/lib/shopify.ts', [
  /sanitizeShopifyProductCopy/,
]);
requireText('scripts/prerender.js', [
  "loadTsModule('src/lib/productDescriptionEnrichment.ts')",
  'const buildVerifiedProductCopy = productDescriptionModule.buildVerifiedProductCopy;',
]);
requireText('src/lib/productDescriptionEnrichment.ts', [
  "tag.trim().toLowerCase() === 'facts:source-verified'",
  'No additional material, construction, care, fit, or included-piece claim is supplied',
]);

requireText('src/pages/CustomizableOutfits.tsx', [
  "country: inquiry.country",
  'Delivery country',
  'Postal code',
  'Select a supported country',
  'Do not include payment information or identity documents.',
  'to="/privacy"',
]);
forbid('src/pages/CustomizableOutfits.tsx', [
  /country:\s*['"]United States['"]/,
  /U\.S\. ZIP code/i,
]);

requireText('src/pages/WeddingPartyOrders.tsx', [
  'Do not include payment information or identity documents.',
  'to="/privacy"',
]);

for (const catalogCsv of [
  'shopify-vol34-FINAL.csv',
  'shopify-vol34-georgette-lehengas.csv',
]) {
  validateTrackedCatalogTags(catalogCsv);
}

if (failures.length > 0) {
  console.error('[product-facts] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[product-facts] OK — product UI, middleware and tracked catalog tags publish only listing-backed facts; inquiry forms disclose privacy handling.');
