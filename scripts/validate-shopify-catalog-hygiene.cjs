#!/usr/bin/env node

/**
 * Release gate for the complete live Shopify catalog.
 *
 * Evidence-gated fulfillment rule:
 * - Ready to Ship requires a positive catalog tag or `custom.ships_within`
 *   value; it is never inferred from sale availability or the absence of a
 *   Made-to-Order marker;
 * - a purchasable product with neither classification is reported as unknown;
 * - a product must not carry contradictory classifications;
 * - processing and carrier transit must never be presented as the same promise.
 */

const fs = require('fs');
const path = require('path');

const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
const IS_RELEASE_BUILD = ['1', 'true'].includes((process.env.CI || '').toLowerCase())
  || process.env.VERCEL === '1'
  || Boolean(process.env.VERCEL_ENV)
  || process.env.GITHUB_ACTIONS === 'true'
  || process.env.NETLIFY === 'true'
  || process.env.CF_PAGES === '1';
const MIN_EXPECTED_ACTIVE_PRODUCTS = 800;

const REMOVED_HANDLES = new Set([
  'blue-mauve-olive-velvet-satin-shimmer-saree-handwork-blouse',
  'lavender-blush-pink-georgette-lucknowi-chikankari-front-cut-top-palazzo-set',
]);

const ALL_PRODUCTS_QUERY = `
  query CatalogHygieneProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          description
          vendor
          productType
          tags
          availableForSale
          seo { title description }
          shipsWithin: metafield(namespace: "custom", key: "ships_within") { value }
          fabric: metafield(namespace: "custom", key: "fabric") { value }
          material: metafield(namespace: "custom", key: "material") { value }
          occasion: metafield(namespace: "custom", key: "occasion") { value }
          includedComponents: metafield(namespace: "custom", key: "included_components") { value }
          images(first: 20) { edges { node { url altText } } }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                selectedOptions { name value }
              }
            }
          }
          options { name values }
        }
      }
    }
  }
`;

const STALE_COPY_PATTERNS = [
  {
    label: 'legacy $12 U.S. shipping threshold',
    pattern: /(?:standard\s+)?shipping[^.!?\n]{0,100}\$12(?:\.00)?[^.!?\n]{0,100}\$(?:135|150)(?:\.00)?/i,
  },
  {
    label: 'legacy free-shipping threshold',
    pattern: /(?:free\s+(?:u\.s\.\s+)?(?:standard\s+)?shipping|shipping\s+is\s+free)[^.!?\n]{0,80}(?:at|over|above|orders?\s+(?:over|above|of))\s*\$(?:135|150|350)(?:\.00)?/i,
  },
  {
    label: 'free shipping to USA and Canada',
    pattern: /(?:ships?\s+free|free\s+shipping)[^.!?\n]{0,100}(?:usa|u\.s\.|united states)[^.!?\n]{0,80}canada/i,
  },
  {
    label: 'free worldwide shipping',
    pattern: /free\s+worldwide\s+shipping/i,
  },
  {
    label: 'worldwide-shipping claim',
    pattern: /(?:ships?|shipping)\s+worldwide/i,
  },
  {
    label: 'USA-only product-positioning phrase',
    pattern: /indian\s+ethnic\s+wear\s+for\s+the\s+usa/i,
  },
  {
    label: 'U.S.-only shipping claim',
    pattern: /(?:we|luxe\s?mia)\s+(?:currently\s+)?(?:only\s+ship|ship\s+only)\s+to\s+(?:the\s+)?(?:u\.s\.|usa|united states)/i,
  },
  {
    label: 'U.S. addresses only',
    pattern: /(?:ships?\s+to\s+)?(?:u\.s\.|usa|united states)\s+addresses?\s+only/i,
  },
  {
    label: 'U.S. delivery only',
    pattern: /u\.s\.\s+delivery\s+only/i,
  },
  {
    label: 'unverified five-day USA/Canada express claim',
    pattern: /5[- ]day\s+express\s+delivery\s+to\s+usa\s+and\s+canada/i,
  },
  {
    label: 'unverified fixed delivery-window claim',
    pattern: /(?:standard\s+delivery|express\s+shipping|delivery\s+(?:takes|within|in))[^.!?\n]{0,80}(?:5[–-]7|7[–-]10|10[–-]15)\s+business\s+days/i,
  },
  {
    label: 'unverified one-to-two-day USA processing claim',
    pattern: /ships?\s+within\s+1[–-]2\s+business\s+days\s+from\s+the\s+usa/i,
  },
  {
    label: 'blanket all-sales-final product claim',
    pattern: /all\s+sales\s+are\s+final/i,
  },
  {
    label: 'legacy 14/15/30-day return promise',
    pattern: /(?:(?:14|15|30)[- ]day\s+(?:return|returns|refund)|returns?\s+(?:are\s+)?accepted\s+within\s+(?:14|15|30)\s+days)/i,
  },
  {
    label: 'blanket no-returns-or-exchanges product claim',
    pattern: /no\s+returns?\s+or\s+exchanges?/i,
  },
];

const MADE_TO_ORDER_TAGS = new Set([
  'made to order',
  'availability:made to order',
  'custom-made',
]);
const READY_TO_SHIP_TAG = /^(?:(?:availability|fulfillment|shipping|status)\s*[:=]\s*)?ready[\s_-]*to[\s_-]*ship$/i;

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function lowerTags(product) {
  return (product.tags || []).map((tag) => String(tag).trim().toLowerCase());
}

function sourceText(product) {
  return normalize([
    product.title,
    product.description,
    product.seo?.title,
    product.seo?.description,
    ...(product.tags || []),
  ].filter(Boolean).join(' '));
}

function isMadeToOrder(product) {
  return lowerTags(product).some((tag) => MADE_TO_ORDER_TAGS.has(tag));
}

function hasReadyToShipTag(product) {
  return (product.tags || []).some((tag) => READY_TO_SHIP_TAG.test(String(tag).trim()));
}

function hasReadyToShipEvidence(product) {
  if (hasReadyToShipTag(product)) return true;
  const match = String(product.shipsWithin?.value || '').match(/\d+/);
  return Boolean(match && Number.parseInt(match[0], 10) > 0);
}

function isPurchasable(product) {
  return product.availableForSale === true
    && (product.variants?.edges || []).some((edge) => edge.node.availableForSale === true);
}

function hasOnlyCustomSizeChoices(product) {
  const sizeOption = (product.options || []).find((option) =>
    /^(?:size|sizes|apparel size|garment size|blouse size|waist size|chest size|stitching size)$/i.test(option.name || ''),
  );
  if (!sizeOption || !Array.isArray(sizeOption.values) || sizeOption.values.length === 0) return false;
  return sizeOption.values.every((value) =>
    /^(?:custom|custom size|custom stitching|made to measure|made-to-measure)$/i.test(normalize(value)),
  );
}

function hasTagPrefix(product, prefixes) {
  const tags = lowerTags(product);
  return tags.some((tag) => prefixes.some((prefix) => tag.startsWith(`${prefix}:`)));
}

function hasSizeChoice(product) {
  const sizeNames = /^(?:size|sizes|apparel size|garment size|blouse size|waist size|chest size|stitching size)$/i;
  if ((product.options || []).some((option) => sizeNames.test(option.name || '') && (option.values || []).length > 0)) {
    return true;
  }
  return (product.variants?.edges || []).some((edge) =>
    (edge.node.selectedOptions || []).some((option) => sizeNames.test(option.name || '') && option.value),
  );
}

function hasStructuredMaterial(product) {
  return Boolean(product.fabric?.value || product.material?.value)
    || hasTagPrefix(product, ['fabric', 'material']);
}

function hasStructuredIncludedComponents(product) {
  return Boolean(product.includedComponents?.value)
    || hasTagPrefix(product, ['included']);
}

function hasStructuredOccasion(product) {
  return Boolean(product.occasion?.value)
    || hasTagPrefix(product, ['occasion']);
}

function hasStructuredConstruction(product) {
  return hasTagPrefix(product, ['construction', 'stitching', 'tailoring', 'availability']);
}

function hasStructuredWork(product) {
  return hasTagPrefix(product, ['work']);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function shopifyRequest(variables, attempt = 1) {
  try {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: ALL_PRODUCTS_QUERY, variables }),
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const payload = await response.json();
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((error) => error.message).join('; '));
    }
    return payload.data.products;
  } catch (error) {
    if (attempt >= 3) throw error;
    await delay(500 * attempt);
    return shopifyRequest(variables, attempt + 1);
  }
}

async function fetchAllProducts() {
  const products = [];
  let cursor = null;
  let hasNextPage = true;
  let page = 0;

  while (hasNextPage) {
    page += 1;
    const connection = await shopifyRequest({
      first: 250,
      ...(cursor ? { after: cursor } : {}),
    });
    products.push(...(connection.edges || []).map((edge) => edge.node));
    hasNextPage = Boolean(connection.pageInfo?.hasNextPage);
    cursor = connection.pageInfo?.endCursor || null;
    console.log(`[shopify-catalog] Fetched page ${page}: ${products.length} active product(s) accumulated.`);
  }

  return products;
}

function buildCompletenessReport(products) {
  const counters = {
    missingDescription: 0,
    thinDescription: 0,
    missingProductType: 0,
    missingImage: 0,
    missingImageAltText: 0,
    missingVariant: 0,
    missingSku: 0,
    missingSeoTitle: 0,
    missingSeoDescription: 0,
    missingMaterial: 0,
    missingIncludedComponents: 0,
    missingOccasion: 0,
    missingConstruction: 0,
    missingWork: 0,
    missingSizeChoice: 0,
    verifiedProcessingEstimate: 0,
  };

  for (const product of products) {
    const description = normalize(product.description);
    const images = product.images?.edges || [];
    const variants = product.variants?.edges || [];

    if (!description) counters.missingDescription += 1;
    else if (description.length < 120) counters.thinDescription += 1;
    if (!normalize(product.productType)) counters.missingProductType += 1;
    if (images.length === 0) counters.missingImage += 1;
    if (images.length > 0 && images.some((edge) => !normalize(edge.node.altText))) counters.missingImageAltText += 1;
    if (variants.length === 0) counters.missingVariant += 1;
    if (variants.some((edge) => !normalize(edge.node.sku))) counters.missingSku += 1;
    if (!normalize(product.seo?.title)) counters.missingSeoTitle += 1;
    if (!normalize(product.seo?.description)) counters.missingSeoDescription += 1;
    if (!hasStructuredMaterial(product)) counters.missingMaterial += 1;
    if (!hasStructuredIncludedComponents(product)) counters.missingIncludedComponents += 1;
    if (!hasStructuredOccasion(product)) counters.missingOccasion += 1;
    if (!hasStructuredConstruction(product)) counters.missingConstruction += 1;
    if (!hasStructuredWork(product)) counters.missingWork += 1;
    if (!hasSizeChoice(product)) counters.missingSizeChoice += 1;
    if (Number.parseInt(product.shipsWithin?.value || '', 10) > 0) counters.verifiedProcessingEstimate += 1;
  }

  return counters;
}

async function main() {
  if (!SHOPIFY_STOREFRONT_TOKEN) {
    const message = '[shopify-catalog] SHOPIFY_STOREFRONT_TOKEN is missing; the full active-catalog release gate cannot run.';
    if (IS_RELEASE_BUILD) throw new Error(message);
    console.warn(`${message} Skipping outside a release build.`);
    return;
  }

  const products = await fetchAllProducts();
  if (products.length < MIN_EXPECTED_ACTIVE_PRODUCTS) {
    throw new Error(
      `[shopify-catalog] Only ${products.length} active products were returned; expected at least ${MIN_EXPECTED_ACTIVE_PRODUCTS}. Refusing to validate a partial catalog.`,
    );
  }

  const handleCounts = new Map();
  const staleProducts = [];
  const removedProducts = [];
  const classificationErrors = [];
  let purchasableProducts = 0;
  let readyToShipProducts = 0;
  let madeToOrderProducts = 0;
  let unknownFulfillmentProducts = 0;
  let mixedCustomOptionProducts = 0;

  for (const product of products) {
    handleCounts.set(product.handle, (handleCounts.get(product.handle) || 0) + 1);
    if (REMOVED_HANDLES.has(product.handle)) removedProducts.push(product);

    const text = sourceText(product);
    const matches = STALE_COPY_PATTERNS
      .filter(({ pattern }) => pattern.test(text))
      .map(({ label }) => label);
    if (matches.length > 0) {
      staleProducts.push({ id: product.id, title: product.title, handle: product.handle, matches });
    }

    const purchasable = isPurchasable(product);
    const madeToOrder = isMadeToOrder(product);
    const readyToShip = hasReadyToShipEvidence(product);
    const onlyCustomSize = hasOnlyCustomSizeChoices(product);
    const hasCustomOption = (product.options || []).some((option) =>
      (option.values || []).some((value) => /custom|made[- ]to[- ]measure/i.test(String(value))),
    );

    if (purchasable) purchasableProducts += 1;
    if (purchasable && madeToOrder) madeToOrderProducts += 1;
    else if (purchasable && readyToShip) readyToShipProducts += 1;
    else if (purchasable) unknownFulfillmentProducts += 1;
    if (purchasable && !madeToOrder && hasCustomOption) mixedCustomOptionProducts += 1;

    if (onlyCustomSize && !madeToOrder) {
      classificationErrors.push(`${product.handle}: only custom-size choices are offered but the product is not tagged Made to Order`);
    }
    if (madeToOrder && readyToShip) {
      classificationErrors.push(`${product.handle}: Made-to-Order product also carries positive Ready-to-Ship evidence`);
    }
    if (madeToOrder && /\bready[- ]to[- ]ship\b/i.test(`${product.title} ${product.description}`)) {
      classificationErrors.push(`${product.handle}: Made-to-Order product still makes a Ready-to-Ship customer claim`);
    }
  }

  const duplicateHandles = [...handleCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([handle, count]) => ({ handle, count }));

  if (readyToShipProducts + madeToOrderProducts + unknownFulfillmentProducts !== purchasableProducts) {
    classificationErrors.push('Ready-to-Ship, Made-to-Order and unknown-fulfillment counts do not equal the purchasable catalog count');
  }

  if (
    removedProducts.length > 0
    || duplicateHandles.length > 0
    || staleProducts.length > 0
    || classificationErrors.length > 0
  ) {
    console.error('[shopify-catalog] Validation failed:');
    for (const product of removedProducts) {
      console.error(`- Removed product reappeared: ${product.handle} (${product.id})`);
    }
    for (const duplicate of duplicateHandles) {
      console.error(`- Duplicate handle ${duplicate.handle}: ${duplicate.count} products`);
    }
    for (const product of staleProducts) {
      console.error(`- ${product.handle} — ${product.title}: ${product.matches.join('; ')}`);
    }
    for (const error of classificationErrors) console.error(`- ${error}`);
    process.exit(1);
  }

  const completeness = buildCompletenessReport(products);
  const report = {
    generatedAt: new Date().toISOString(),
    activeProductsChecked: products.length,
    purchasableProducts,
    readyToShipProducts,
    madeToOrderProducts,
    unknownFulfillmentProducts,
    mixedCustomOptionProducts,
    staleCopyProducts: staleProducts.length,
    removedProductsPresent: removedProducts.length,
    duplicateHandles: duplicateHandles.length,
    classificationErrors: classificationErrors.length,
    completeness,
  };

  const reportDirectory = path.resolve(__dirname, '..', 'dist');
  fs.mkdirSync(reportDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(reportDirectory, 'catalog-hygiene-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `[shopify-catalog] OK — checked ${products.length} active products; ${readyToShipProducts} Ready to Ship with positive evidence, ${madeToOrderProducts} Made to Order, ${unknownFulfillmentProducts} purchasable with unknown fulfillment, ${mixedCustomOptionProducts} purchasable products with an optional custom selection, 0 fulfillment contradictions, 0 stale-copy products, 0 removed-product regressions, and 0 duplicate handles.`,
  );
  console.log(
    `[shopify-catalog] Completeness warnings — missing description ${completeness.missingDescription}; thin description ${completeness.thinDescription}; missing product type ${completeness.missingProductType}; missing image ${completeness.missingImage}; image-alt gaps ${completeness.missingImageAltText}; missing variant ${completeness.missingVariant}; SKU gaps ${completeness.missingSku}; SEO-title gaps ${completeness.missingSeoTitle}; SEO-description gaps ${completeness.missingSeoDescription}.`,
  );
  console.log(
    `[shopify-catalog] Structured merchandising coverage — material gaps ${completeness.missingMaterial}; included-piece gaps ${completeness.missingIncludedComponents}; occasion gaps ${completeness.missingOccasion}; construction gaps ${completeness.missingConstruction}; work gaps ${completeness.missingWork}; size-choice gaps ${completeness.missingSizeChoice}; verified processing estimates ${completeness.verifiedProcessingEstimate}.`,
  );
}

main().catch((error) => {
  console.error(`[shopify-catalog] ${error.stack || error.message}`);
  process.exit(1);
});
