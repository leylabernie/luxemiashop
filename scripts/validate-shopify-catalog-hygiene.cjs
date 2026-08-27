#!/usr/bin/env node

/**
 * Release gate for the live Shopify catalog.
 *
 * This validator reads every product exposed by the Storefront API during each
 * release build. It fails the build when customer-facing product copy contains
 * obsolete shipping/return claims or when a controlled deletion reappears.
 * Attribute-completeness gaps are reported as warnings so missing supplier facts
 * are never invented merely to satisfy a build.
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
      pageInfo {
        hasNextPage
        endCursor
      }
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
          seo {
            title
            description
          }
          shipsWithin: metafield(namespace: "custom", key: "ships_within") { value }
          fabric: metafield(namespace: "custom", key: "fabric") { value }
          material: metafield(namespace: "custom", key: "material") { value }
          occasion: metafield(namespace: "custom", key: "occasion") { value }
          includedComponents: metafield(namespace: "custom", key: "included_components") { value }
          images(first: 20) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
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
    pattern: /(?:free\s+(?:u\.s\.\s+)?(?:standard\s+)?shipping|shipping\s+is\s+free)[^.!?\n]{0,80}(?:at|over|above|orders?\s+(?:over|above|of))\s*\$(?:135|150)(?:\.00)?/i,
  },
  {
    label: 'free shipping to USA and Canada',
    pattern: /(?:ships?\s+free|free\s+shipping)[^.!?\n]{0,80}(?:usa|u\.s\.|united states)[^.!?\n]{0,60}canada/i,
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
    label: 'free worldwide shipping',
    pattern: /free\s+worldwide\s+shipping/i,
  },
  {
    label: 'unverified five-day USA/Canada express claim',
    pattern: /5[- ]day\s+express\s+delivery\s+to\s+usa\s+and\s+canada/i,
  },
  {
    label: 'blanket all-sales-final product claim',
    pattern: /all\s+sales\s+are\s+final/i,
  },
  {
    label: 'legacy 30-day return promise',
    pattern: /(?:30[- ]day\s+(?:return|returns|refund)|returns?\s+(?:are\s+)?accepted\s+within\s+30\s+days)/i,
  },
  {
    label: 'blanket no-returns-or-exchanges product claim',
    pattern: /no\s+returns?\s+or\s+exchanges?/i,
  },
  {
    label: 'unverified one-to-two-day USA processing claim',
    pattern: /ships?\s+within\s+1[–-]2\s+business\s+days\s+from\s+the\s+usa/i,
  },
];

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function sourceText(product) {
  return normalize([
    product.description,
    product.seo?.title,
    product.seo?.description,
  ].filter(Boolean).join(' '));
}

function lowerTags(product) {
  return (product.tags || []).map((tag) => String(tag).trim().toLowerCase());
}

function hasTagPrefix(product, prefixes) {
  const tags = lowerTags(product);
  return tags.some((tag) => prefixes.some((prefix) => tag.startsWith(`${prefix}:`)));
}

function hasSizeChoice(product) {
  const sizeNames = /^(?:size|sizes|apparel size|garment size|blouse size|waist size|chest size)$/i;
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

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

  for (const product of products) {
    handleCounts.set(product.handle, (handleCounts.get(product.handle) || 0) + 1);
    if (REMOVED_HANDLES.has(product.handle)) removedProducts.push(product);

    const text = sourceText(product);
    const matches = STALE_COPY_PATTERNS
      .filter(({ pattern }) => pattern.test(text))
      .map(({ label }) => label);

    if (matches.length > 0) {
      staleProducts.push({
        id: product.id,
        title: product.title,
        handle: product.handle,
        matches,
      });
    }
  }

  const duplicateHandles = [...handleCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([handle, count]) => ({ handle, count }));

  if (removedProducts.length > 0 || duplicateHandles.length > 0 || staleProducts.length > 0) {
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
    process.exit(1);
  }

  const completeness = buildCompletenessReport(products);
  const report = {
    generatedAt: new Date().toISOString(),
    activeProductsChecked: products.length,
    staleCopyProducts: staleProducts.length,
    removedProductsPresent: removedProducts.length,
    duplicateHandles: duplicateHandles.length,
    completeness,
  };

  fs.writeFileSync(
    path.resolve(__dirname, '..', 'catalog-hygiene-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `[shopify-catalog] OK — checked ${products.length} active products; 0 stale-copy products, 0 removed-product regressions, and 0 duplicate handles.`,
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
