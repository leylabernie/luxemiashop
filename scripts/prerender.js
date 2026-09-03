/**
 * Build-time prerender script
 *
 * Generates static HTML files for key routes with proper meta tags,
 * structured data, and semantic content so search engine bots see
 * real HTML instead of a blank SPA shell.
 *
 * These files are placed in dist/ alongside the SPA build.
 * Vercel Edge Middleware serves them to bot user agents.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://luxemia.shop';
const DURABLE_INTENT_COLLECTION_PATHS = new Set([
  '/collections/wedding-guest-lehengas',
  '/collections/wedding-guest-kurta-sets',
  '/collections/diwali-womenswear',
  '/collections/diwali-menswear',
]);
const SEO_ARCHITECTURE = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'src/config/seoArchitecture.json'), 'utf8')
);
const INDEXABLE_ROUTE_SEO = SEO_ARCHITECTURE.routes;
const SUBCATEGORY_LANDING_PATHS = SEO_ARCHITECTURE.subcategoryLandingPaths;

function getIndexableRouteSeo(routePath) {
  const route = INDEXABLE_ROUTE_SEO[routePath];
  if (!route) throw new Error(`Missing shared SEO architecture for ${routePath}`);
  return route;
}

function normalizeInternalNavigationHtml(content) {
  return String(content || '').replace(
    /<a(\s+[^>]*?)href=(['"])(\/(lehengas|sarees|suits|menswear|jewelry)\?sub=([^'"&]+))\2([^>]*)>([\s\S]*?)<\/a>/g,
    (_match, beforeHref, quote, _href, category, subcategory, afterHref, label) => {
      const cleanPath = SUBCATEGORY_LANDING_PATHS[category]?.[subcategory];
      return cleanPath
        ? `<a${beforeHref}href=${quote}${cleanPath}${quote}${afterHref}>${label}</a>`
        : `<span>${label}</span>`;
    },
  );
}
const APPROVED_SITEMAP_PATHS = new Set(
  JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/approved-sitemap-inventory.json'), 'utf8')).paths
);
const OCCASION_SIGNALS = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'src/data/occasionSignals.json'), 'utf8')
);
const PRERENDER_MADE_TO_ORDER_TAGS = new Set([
  'made to order',
  'availability:made to order',
  'custom-made',
]);

function isMadeToOrderProduct(product) {
  if (!product) return false;
  return hasExplicitMadeToOrderEvidence(product);
}

function hasExplicitMadeToOrderEvidence(product) {
  return (product.tags || []).some((tag) =>
    PRERENDER_MADE_TO_ORDER_TAGS.has(String(tag).trim().toLowerCase())
  );
}

// Assigned from src/lib/productEvidence.ts before any catalog filtering or
// product rendering. Keeping one implementation prevents initial HTML from
// claiming customization that the hydrated purchase controls do not support.
let hasExplicitCustomColorEvidence = () => false;
let hasExplicitCustomMeasurementEvidence = () => false;
let hasExplicitCustomizationEvidence = () => false;
const RETIRED_PRODUCT_HANDLES = new Set(
  JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'src/data/legacyGoneProductHandles.json'), 'utf8'))
);
const HIDDEN_BILLING_PRODUCT_HANDLES = new Set([
  'luxemia-tailoring-saree-finishing-add-ons',
]);
const SIZE_OPTION_NAMES = new Set([
  'size',
  'standard size',
  'blouse size',
  'bust size',
  'chest size',
  'stitching size',
]);
function normalizeOptionName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function isSizeOptionName(value) {
  return SIZE_OPTION_NAMES.has(normalizeOptionName(value));
}

function isExplicitlyOrderable(product) {
  const variants = product?.variants?.edges || [];
  return product?.availableForSale === true
    && variants.length > 0
    && variants.some((variant) => variant?.node?.availableForSale === true);
}

// ─── TypeScript Data Loader ───────────────────────────────────────────────
// Bundles a TypeScript data module
// to a temporary ESM file with esbuild and imports it, so this build script
// (which itself is loaded as JS) can read the SAME source-of-truth arrays
// that the React app renders from, instead of a hand-maintained duplicate
// list that can silently drift out of sync (root cause of the 2026-07-29
// Search Console traffic-drop bug: 27 blog posts + 25 combo pages existed in
// the app/sitemap but had no prerendered HTML, so Googlebot/Bingbot got a
// 404 while regular browsers got 200 — a soft-cloaking regression).
async function loadTsModule(relativeSrcPath) {
  const entry = path.join(PROJECT_ROOT, relativeSrcPath);
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    write: false,
    logLevel: 'silent',
    // Type-only imports are erased by esbuild's TS transform.
  });
  const code = result.outputFiles[0].text;
  const tmpFile = path.join(
    PROJECT_ROOT,
    `.prerender-tmp-${path.basename(relativeSrcPath, '.ts')}-${Date.now()}.mjs`
  );
  fs.writeFileSync(tmpFile, code, 'utf-8');
  try {
    return await import(`file://${tmpFile}`);
  } finally {
    fs.unlinkSync(tmpFile);
  }
}
const includedComponentsModule = await loadTsModule('src/lib/includedComponents.ts');
if (
  typeof includedComponentsModule.parseIncludedComponentsMetafield !== 'function'
  || typeof includedComponentsModule.normalizeIncludedPiecesText !== 'function'
) {
  throw new Error('[included-components] Shared evidence normalizer is missing.');
}
const parseIncludedComponentsMetafield = includedComponentsModule.parseIncludedComponentsMetafield;
const normalizeIncludedPiecesText = includedComponentsModule.normalizeIncludedPiecesText;
let rankCommercialProducts = (products) => [...products];
let rankGenericLehengasByIntent = (products) => [...products];
let getCollectionStandard = () => undefined;
let indexableCollectionPaths = [];
let hasExplicitReadyToShipEvidence = () => false;
let isDurableIntentCollectionSlug = () => false;
let isEligibleForDurableIntent = () => false;

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function sanitizeProductCopy(value) {
  return (value || '')
    // Remove obsolete supplier boilerplate before it can leak into product
    // facts, structured data, or customer-facing copy.
    .replace(/\s*Shipping:\s*5-day express delivery to USA and Canada[\s\S]*$/gi, '')
    .replace(/\s*FAQQ\s*:[\s\S]*$/gi, '')
    .replace(/(?:U\.S\.\s+)?standard shipping is \$12 below \$150 and free at \$150(?: and above|\+)?/gi, 'Review destination-specific shipping rates on the shipping page; checkout is the final source of truth')
    .replace(/standard shipping is free at \$150(?: and above|\+)? and \$12 below \$150/gi, 'Review destination-specific shipping rates on the shipping page; checkout is the final source of truth')
    .replace(/free (?:U\.S\.\s+)?(?:standard )?shipping (?:at|over) \$150(?: and above|\+)?/gi, 'Review destination-specific shipping rates on the shipping page')
    .replace(/shipping is free at \$150(?: and above|\+)?/gi, 'shipping is free at $199 and above')
    .replace(/Ships within 1[–-]2 business days from the USA\.\s*Free shipping on orders over \$99\./gi, 'Review destination-specific shipping rates on the shipping page. When tracking is issued, carrier scans can appear after label creation.')
    .replace(/Free worldwide shipping to the seven supported destination countries via DHL\/USPS\/UPS \(7-10 business days\)/gi, 'Shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review destination-specific rates on the shipping page; checkout is the final source of truth')
    .replace(/Free worldwide shipping to [^.]+?(?:arriving in |delivered in |within )?7-10 business days/gi, 'Shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review destination-specific rates on the shipping page; checkout is the final source of truth')
    .replace(/Free worldwide shipping to [^.]+?via DHL\/USPS\/UPS/gi, 'Shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review destination-specific rates on the shipping page; checkout is the final source of truth')
    .replace(/Shipping:\s*5-day express delivery to USA and Canada/gi, 'Shipping: when tracking is issued, carrier scans can appear after label creation')
    .replace(/ready[- ]to[- ]ship Indian wear USA/gi, 'Indian ethnic wear online')
    .replace(/ready[- ]to[- ]ship/gi, 'Ready to Ship')
    .replace(/within two business days/gi, 'with tracked shipping')
    .replace(/within 2 business days/gi, 'with tracked shipping')
    .replace(/from the USA/gi, 'for supported destinations')
    .replace(/the seven supported destination countries/gi, 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius')
    .replace(/free shipping on orders over \$350/gi, 'destination-specific shipping shown at checkout');
}

function sanitizeProductTitle(value) {
  return (value || '')
    .replace(/^buy\s+/i, '')
    .replace(/\s*(?:[|–—-]\s*)?ready[-\s]?to[-\s]?ship\b/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?handcrafted indian bridal luxury\b/gi, '')
    .replace(/\bhandcrafted\s+/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?luxemia(?:\.shop)?\s*$/gi, '')
    .replace(/\s*[|–—-]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const JEWELRY_PRODUCT_PATTERN = /\b(jewel|jewell|necklace|choker|earring|bangle|bracelet|ring|maang\s*tikka|anklet|kundan|polki)\b/i;

function isJewelryProduct(productType = '', title = '') {
  return JEWELRY_PRODUCT_PATTERN.test(`${productType} ${title}`);
}

const OCCASION_TAG_COPY = [
  ['wedding-lehenga', 'wedding celebrations'],
  ['bridal-lehenga', 'bridal celebrations'],
  ['wedding-guest-outfit', 'wedding-guest occasions'],
  ['reception-wear', 'wedding receptions'],
  ['festival-wear', 'festival celebrations'],
  ['festive-wear', 'festive celebrations'],
  ['diwali-outfit', 'Diwali celebrations'],
  ['eid-outfit', 'Eid celebrations'],
  ['party-wear', 'party wear'],
];

function textFromListing(value) {
  return normalizeWhitespace(
    sanitizeProductCopy(String(value || ''))
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
  );
}

function cleanVerifiedFact(value, maxLength = 120) {
  const cleaned = textFromListing(value)
    .replace(/^(?:premium|beautiful|elegant)\s+/i, '')
    .trim();
  if (!cleaned || /^(?:n\/?a|none|unknown|fabric|material|work)$/i.test(cleaned)) return undefined;
  return cleaned.length > maxLength ? undefined : cleaned;
}

function getLabeledListingFact(description, labels) {
  const source = String(description || '');
  const labelPattern = labels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  // The Storefront API returns `description` as plain text and can flatten
  // Shopify list items. Prefer exact label boundaries rather than guessing
  // from a title or an image.
  const htmlMatch = source.match(new RegExp(`<strong>\\s*(?:${labelPattern})\\s*:\\s*<\\/strong>\\s*([^<.]{1,160})`, 'i'));
  const htmlFact = cleanVerifiedFact(htmlMatch?.[1]);
  if (htmlFact) return htmlFact;

  const plain = textFromListing(source);
  const nextFieldPattern = 'Style|Fabric|Material|Work|Embroidery|Embellishment|Color|Care|Lehenga Silhouette|Blouse\\/Choli|Dupatta|Lining|Closure|Flair|Shipping|Returns?|FAQQ?';
  const plainMatch = plain.match(new RegExp(`(?:^|\\s)(?:${labelPattern})\\s*:\\s*(.{1,160}?)(?=\\s+(?:${nextFieldPattern})\\s*:|[.!?]|$)`, 'i'));
  return cleanVerifiedFact(plainMatch?.[1]);
}

function getIncludedComponentsMetafieldList(product) {
  return parseIncludedComponentsMetafield(product?.includedComponentsMetafield?.value) || [];
}

function getIncludedComponentsMetafield(product) {
  const components = getIncludedComponentsMetafieldList(product);
  return components.length > 0
    ? normalizeIncludedPiecesText(components.join(', '))
    : undefined;
}

function getVerifiedOccasion(product) {
  const tags = new Set((product?.tags || []).map((tag) => String(tag).trim().toLowerCase()));
  const matched = OCCASION_TAG_COPY.find(([tag]) => tags.has(tag));
  return matched?.[1];
}

function getListedProductAttributes(product) {
  const jewelry = isJewelryProduct(product?.productType, product?.title);
  const sourceVerified = (product?.tags || []).some(
    (tag) => String(tag).trim().toLowerCase() === 'facts:source-verified',
  );
  const optionValue = (...names) => product?.options
    ?.find(option => names.includes((option.name || '').toLowerCase()))
    ?.values?.[0];
  const rawColor = optionValue('color');
  const rawMaterial = product?.fabricMetafield?.value
    || product?.materialMetafield?.value
    || optionValue('fabric', 'material');
  const prefixedTagValue = (...prefixes) => {
    const matchedTag = (product?.tags || []).find((tag) => {
      const normalizedTag = String(tag).toLowerCase();
      return prefixes.some((prefix) => normalizedTag.startsWith(`${prefix}:`));
    });
    return matchedTag ? String(matchedTag).slice(String(matchedTag).indexOf(':') + 1).trim() : undefined;
  };
  const taggedColor = prefixedTagValue('color');
  const taggedMaterial = prefixedTagValue('fabric', 'material');
  const taggedWork = prefixedTagValue('work', 'embroidery', 'embellishment');
  const taggedCare = prefixedTagValue('care', 'care instructions');
  const listedMaterial = sourceVerified
    ? getLabeledListingFact(product?.description, ['Fabric', 'Material'])
    : undefined;
  const listedWork = sourceVerified
    ? getLabeledListingFact(product?.description, ['Work', 'Embroidery', 'Embellishment'])
    : undefined;
  const listedCare = sourceVerified
    ? getLabeledListingFact(product?.description, ['Care', 'Care Instructions'])
    : undefined;
  const sizeValues = product?.options
    ?.find(option => isSizeOptionName(option?.name))
    ?.values
    ?.filter(value => value && value.toLowerCase() !== 'default title') || [];
  const includedPiecePrefixes = [
    'included:',
    'included pieces:',
    'pieces:',
    'set includes:',
    'package includes:',
  ];
  const includedPiecesTag = (product?.tags || []).find(tag =>
    includedPiecePrefixes.some(prefix => String(tag).toLowerCase().startsWith(prefix))
  );
  const includedPiecesPrefix = includedPiecesTag
    ? includedPiecePrefixes.find(prefix => String(includedPiecesTag).toLowerCase().startsWith(prefix))
    : null;
  const includedPieces = getIncludedComponentsMetafield(product)
    || (includedPiecesTag && includedPiecesPrefix
      ? String(includedPiecesTag).slice(includedPiecesPrefix.length).trim()
      : undefined);
  const rawShipsWithin = product?.shipsWithinMetafield?.value;
  const shipsWithinDays = rawShipsWithin ? Number.parseInt(String(rawShipsWithin), 10) : null;

  return {
    jewelry,
    color: cleanVerifiedFact(rawColor || taggedColor),
    material: cleanVerifiedFact(rawMaterial || taggedMaterial || listedMaterial),
    work: !jewelry ? cleanVerifiedFact(taggedWork || listedWork) : undefined,
    care: cleanVerifiedFact(taggedCare || listedCare),
    occasion: !jewelry ? getVerifiedOccasion(product) : undefined,
    sizes: jewelry ? [] : sizeValues,
    includedPieces: normalizeIncludedPiecesText(includedPieces),
    shipsWithinDays: Number.isFinite(shipsWithinDays) && shipsWithinDays > 0 ? shipsWithinDays : null,
  };
}

function getVerifiedPrimaryStyleReference(product) {
  const skus = [...new Set(
    (product?.variants?.edges || [])
      .map((edge) => String(edge?.node?.sku || '').trim())
      .filter(Boolean),
  )];
  if (skus.length === 0) return '';
  if (skus.length === 1) return skus[0].slice(0, 80);

  let commonPrefix = skus[0];
  for (const sku of skus.slice(1)) {
    let index = 0;
    const max = Math.min(commonPrefix.length, sku.length);
    while (index < max && commonPrefix[index] === sku[index]) index += 1;
    commonPrefix = commonPrefix.slice(0, index);
    if (!commonPrefix) break;
  }

  const styleReference = commonPrefix.replace(/[\s._/-]+$/g, '').trim();
  const referenceIsProductSpecific = styleReference.length >= 6 || /\d/.test(styleReference);
  return (referenceIsProductSpecific ? styleReference : skus[0]).slice(0, 80);
}

let buildVerifiedProductCopy = () => '';

function getProductCategoryInfo(productType = '', title = '') {
  const type = productType.toLowerCase();
  if (isJewelryProduct(productType, title)) {
    return {
      schemaCategory: /necklace|choker/i.test(`${productType} ${title}`)
        ? 'Apparel & Accessories > Jewelry > Necklaces'
        : 'Apparel & Accessories > Jewelry',
      link: '/jewelry',
      label: 'All Jewelry',
    };
  }
  if (type.includes('lehenga')) return { schemaCategory: productType || 'Lehenga', link: '/lehengas', label: 'All Lehengas' };
  if (type.includes('saree') || type.includes('sari')) return { schemaCategory: productType || 'Saree', link: '/sarees', label: 'All Sarees' };
  if (type.includes('suit') || type.includes('kameez') || type.includes('palazzo') || type.includes('sharara') || type.includes('anarkali') || type.includes('patiala')) {
    return { schemaCategory: productType || 'Indian Suit', link: '/suits', label: 'All Suits' };
  }
  if (type.includes('sherwani') || type.includes('kurta') || type.includes('menswear')) {
    return { schemaCategory: productType || 'Menswear', link: '/menswear', label: 'All Menswear' };
  }
  return { schemaCategory: productType || 'Clothing > Traditional & Ethnic Wear', link: '/collections', label: 'All Collections' };
}

function truncateAtWord(value, maxLength) {
  if (value.length <= maxLength) return value;

  const available = Math.max(1, maxLength - 1);
  const candidate = value.slice(0, available + 1);
  const lastSpace = candidate.lastIndexOf(' ');
  const truncated = (lastSpace > 0
    ? candidate.slice(0, lastSpace)
    : value.slice(0, available))
    .replace(/\s+(?:&|and|or|of|for|the|with|in|on|at|to)$/i, '')
    .replace(/[|,:;\-/]+$/, '');

  return `${truncated.trimEnd()}…`;
}

function clampTitle(raw, brand = 'LuxeMia', maxLength = 80) {
  const cleaned = normalizeWhitespace(raw);
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const brandAtStart = new RegExp(`^${escapedBrand}\\s*(?:[|—–:\\-]\\s*)?`, 'i');
  const brandAtEnd = new RegExp(`\\s*(?:[|—–:\\-]\\s*)?${escapedBrand}$`, 'i');
  const withoutBrand = cleaned
    .replace(brandAtStart, '')
    .replace(brandAtEnd, '')
    .trim();

  if (!withoutBrand) return brand.slice(0, maxLength);

  const suffix = ` | ${brand}`;
  const title = `${withoutBrand}${suffix}`;
  if (title.length <= maxLength) return title;

  return `${truncateAtWord(withoutBrand, Math.max(1, maxLength - suffix.length))}${suffix}`;
}

function disambiguateDuplicateProductRouteTitles(routes) {
  const productRoutes = routes.filter((route) => route.path.startsWith('/product/') && route.product);
  const groups = new Map();

  for (const route of productRoutes) {
    const finalTitle = clampTitle(route.title).toLowerCase();
    const group = groups.get(finalTitle) || [];
    group.push(route);
    groups.set(finalTitle, group);
  }

  let disambiguatedCount = 0;
  for (const [finalTitle, group] of groups) {
    if (group.length < 2) continue;

    const referenceCounts = new Map();
    for (const route of group) {
      const reference = getVerifiedPrimaryStyleReference(route.product);
      const referenceKey = reference.toLowerCase();
      if (reference) referenceCounts.set(referenceKey, (referenceCounts.get(referenceKey) || 0) + 1);
    }

    for (const route of group) {
      const reference = getVerifiedPrimaryStyleReference(route.product);
      if (!reference || referenceCounts.get(reference.toLowerCase()) !== 1) continue;

      const unbrandedTitle = normalizeWhitespace(route.title)
        .replace(/^LuxeMia\s*(?:[|—–:\-]\s*)?/i, '')
        .replace(/\s*(?:[|—–:\-]\s*)?LuxeMia$/i, '')
        .trim();
      route.title = `Style ${reference}: ${unbrandedTitle} | LuxeMia`;
      disambiguatedCount += 1;
    }

    const unresolved = group.filter((route) => {
      const reference = getVerifiedPrimaryStyleReference(route.product);
      return !reference || referenceCounts.get(reference.toLowerCase()) !== 1;
    });
    if (unresolved.length > 1) {
      console.warn(
        `[prerender] Unresolved duplicate product title '${finalTitle}' shares a missing or repeated style reference: ${unresolved.map((route) => route.path).join(', ')}`,
      );
    }
  }

  if (disambiguatedCount > 0) {
    console.log(`[prerender] Disambiguated ${disambiguatedCount} duplicate product title(s) with verified SKU/style references`);
  }
}

function clampDescription(raw, maxLength = 155) {
  return truncateAtWord(normalizeWhitespace(raw), maxLength);
}

// ─── Shopify Storefront API (build-time product fetch) ──────────────────────
// Pulls live product data so prerendered HTML emits valid Product schema with
// image, description, offers.price, etc. — required by Google Merchant
// Listings / Rich Results validation.
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';


const ALL_PRODUCTS_QUERY = `
query GetAllProducts($first: Int!, $after: String) {
  products(
    first: $first
    after: $after
    sortKey: CREATED_AT
    reverse: true
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        title
        createdAt
        description
        handle
        vendor
        productType
        tags
        availableForSale
        shipsWithinMetafield: metafield(
          namespace: "custom"
          key: "ships_within"
        ) {
          value
        }
        fabricMetafield: metafield(namespace: "custom", key: "fabric") {
          value
        }
        materialMetafield: metafield(namespace: "custom", key: "material") {
          value
        }
        includedComponentsMetafield: metafield(namespace: "custom", key: "included_components") {
          value
        }
        occasionMetafield: metafield(namespace: "custom", key: "occasion") {
          value
        }
        genderMetafield: metafield(namespace: "custom", key: "gender") {
          value
        }
        conditionMetafield: metafield(namespace: "custom", key: "condition") {
          value
        }
        seo {
          title
          description
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 20) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 100) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
              title
              sku
              barcode
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              availableForSale
              image {
                url
                altText
              }
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

function forceJpegForGmc(url) {
  if (!url) return url;
  if (url.includes('cdn.shopify.com') || url.includes('myshopify.com')) {
    const clean = url.replace(/[&?]format=\w+/g, '');
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}format=jpg&width=1500`;
  }
  if (url.includes('kesimg.b-cdn.net')) {
    const clean = url.replace(/[&?]format=\w+/g, '');
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}format=jpg`;
  }
  if (!url.match(/\.(jpg|jpeg|png|gif)(\?|$)/i) && !url.includes('format=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}format=jpg`;
  }
  return url;
}

async function fetchAllShopifyProducts() {
  if (!SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error('[catalog-integrity] SHOPIFY_STOREFRONT_TOKEN is required; product prerendering cannot use cached or hardcoded fallbacks.');
  }

  const map = new Map();
  let cursor = null;
  let reachedCatalogEnd = false;
  try {
    for (let i = 0; i < 20; i++) {
      const resp = await fetch(SHOPIFY_STOREFRONT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: ALL_PRODUCTS_QUERY,
          variables: { first: 100, after: cursor },
        }),
      });
      if (!resp.ok) {
        throw new Error(`Shopify Storefront API returned HTTP ${resp.status}`);
      }
      const json = await resp.json();
      if (Array.isArray(json?.errors) && json.errors.length > 0) {
        throw new Error(`Shopify Storefront API returned GraphQL errors: ${json.errors.map((error) => error.message).join('; ')}`);
      }
      const data = json?.data?.products;
      if (!data || !Array.isArray(data.edges)) {
        throw new Error('Shopify Storefront API response did not contain a products connection');
      }
      for (const edge of data.edges || []) {
        const p = edge.node;
        if (
          p?.handle
          && !HIDDEN_BILLING_PRODUCT_HANDLES.has(p.handle)
          && !RETIRED_PRODUCT_HANDLES.has(p.handle)
        ) {
          map.set(p.handle, p);
        }
      }
      if (!data.pageInfo?.hasNextPage) {
        reachedCatalogEnd = true;
        break;
      }
      if (!data.pageInfo.endCursor || data.pageInfo.endCursor === cursor) {
        throw new Error('Shopify pagination reported another page without a new cursor');
      }
      cursor = data.pageInfo.endCursor;
    }
  } catch (err) {
    throw new Error(`[catalog-integrity] Live Shopify product fetch failed: ${err.message}`);
  }
  if (!reachedCatalogEnd) {
    throw new Error('[catalog-integrity] Live Shopify product fetch exceeded the 2,000-product pagination guard before reaching the catalog end.');
  }
  if (map.size === 0) {
    throw new Error('[catalog-integrity] Live Shopify product fetch returned no eligible products; refusing to generate product prerenders.');
  }
  console.log(`[prerender] Loaded ${map.size} eligible products from the complete Shopify Storefront API catalog`);
  return map;
}

// ─── Collection page product injection ───────────────────────────────────────
// Mirrors the client-side filtering logic in src/hooks/useShopifyProducts.ts.
// Kept in sync manually — the prerender script runs in Node and cannot import
// the browser hook. If you add a productType to CATEGORY_PRODUCT_TYPES here,
// also add it to src/hooks/useShopifyProducts.ts (and vice versa).
const CATEGORY_PRODUCT_TYPES = {
  suits: ['Pakistani Suit', 'Salwar Suit', 'Sharara', 'Anarkali', 'Plazzo Suit', 'Palazzo Suit', 'Pakistani Readymade Suit', 'Salwar Kameez', 'Sharara Suit', 'Wedding Suit', 'Designer Suit', 'Gharara Suit', 'Anarkali Suit', 'Gown', 'Salwar', 'Kurti', 'Kurti Set', 'Palazzo', 'Readymade Suit', 'Churidar Suit', 'Patiala Suit', 'Straight Suit', 'Suit'],
  sarees: ['Saree', 'Ready-to-Wear Saree', 'Wedding Saree', 'Sarees', 'Silk Saree', 'Banarasi Saree', 'Cotton Saree', 'Georgette Saree', 'Bridal Saree', 'Designer Saree', 'Fancy Saree', 'Party Wear Saree', 'Kanjivaram Saree', 'Kanchipuram Saree', 'Tissue Saree', 'Net Saree', 'Sari'],
  lehengas: ['Lehenga', 'Lehenga Choli', 'Bridal Lehenga Choli', 'Lehnga', 'Lehnga Choli', 'Bridal Lehnga', 'Bridal Lehnga Choli', 'Lehenga Set', 'Lehenga Choli Set', 'Bridal Lehenga', 'Party Wear Lehenga', 'Wedding Lehenga', 'Designer Lehenga', 'Fancy Lehenga'],
  menswear: ["Men's Ethnic Wear", 'Kurta Pajama', 'Sherwani', "Men's Indian Wear", 'Modi Jacket Kurta Pajama', 'Menswear', "Men's Suit", 'Kurta Set', 'Kurta', 'Dhoti Kurta', 'Nehru Jacket Set'],
  indowestern: ['Indo Western', 'Indo-Western', 'Fusion Wear', 'Fusion', 'Indo Western Dress', 'Indo-Western Set', 'Jumpsuit', 'Cape Set', 'Coord Set', 'Co-Ords', 'Co-ord Set', 'Indo-Western Dress', 'Sharara Set'],
  jewelry: ['Kundan Necklace Set', 'Kundan Jewelry', 'Bridal Jewelry', 'Necklace Set', 'Kundan', 'Polki', 'Uncut Polki', 'Jewelry', 'Jewelry Set', 'Jewellery Set', 'Kundan Set', 'Polki Set', 'Bridal Set', 'Full Bridal Set', 'Kundan Bridal Set', 'Kundan Necklace', 'Choker Necklace', 'Necklace', 'Earrings', 'Bangles', 'Maang Tikka', 'Bridal Jewelry Set', 'Kundan Earrings', 'Kundan Bangles'],
};

const MENSWEAR_KEYWORDS_REGEX = /\b(sherwani|kurta\s?pajama|kurta\s?set|jodhpuri|modi\s?jacket|nehru\s?jacket|groom|menswear|men's|dhoti|bandi|pathani|achkan|angarakha|men\s?suit|men\s?kurta|men\s?shirt|men\s?trouser|men\s?jacket|\bmale\b|for\s?men|\bboys\b)\b/i;
const MENSWEAR_TAGS_EXACT = new Set(['mens', "men's", 'groom', 'groomsmen', 'groomsman', 'boys', 'male', 'menswear', 'indian-menswear', 'men', 'man', 'gender:male', 'gender:men']);
const EXCLUDED_TITLE_KEYWORDS = /\b(turban|sunglasses?)\b/i;
const SAREE_TITLE_KEYWORDS = /\b(saree|sari)\b/i;
const STANDALONE_BLOUSE_TITLE_KEYWORDS = /\b(blouse|choli)\b/i;
const OBSOLETE_POLICY_TAG_PATTERN = /\b(canada|australia)\b|\b(worldwide|international|global)\s+(shipping|delivery)\b|\bfree\s+(worldwide\s+)?shipping\b|\bshipping\b.{0,30}(\$|usd|over|above|below|under)/i;
// Keep crawler and shopper collection inventories aligned. The storefront
// disabled the April-batch cutoff on 2026-07-10, so the prerender must not
// silently discard products that the hydrated commercial landing displays.
const HIDE_OLD_PRODUCTS = false;
const HIDE_PRODUCTS_BEFORE_DATE = new Date('2026-04-09T00:00:00Z');

function isOldBatchProduct(p) {
  if (!HIDE_OLD_PRODUCTS) return false;
  const createdAt = p.createdAt;
  if (!createdAt) return false;
  return new Date(createdAt) < HIDE_PRODUCTS_BEFORE_DATE;
}

function isMenswearProduct(p) {
  const pt = (p.productType ?? '').toLowerCase();
  const title = (p.title ?? '').toLowerCase();
  const tags = (p.tags ?? []).map(t => t.toLowerCase());
  const menswearTypes = CATEGORY_PRODUCT_TYPES.menswear.map(t => t.toLowerCase());
  if (menswearTypes.some(t => pt === t || pt.includes(t))) return true;
  if (/\bmen\b/.test(pt) || /\bmen's\b/.test(pt) || /\bmenswear\b/.test(pt) || /\bmale\b/.test(pt)) return true;
  if (MENSWEAR_KEYWORDS_REGEX.test(title)) return true;
  if (tags.some(t => MENSWEAR_TAGS_EXACT.has(t) || MENSWEAR_TAGS_EXACT.has(t.replace(/wear$/, '')))) return true;
  return false;
}

function isStandaloneBlouseProduct(product) {
  const title = product?.title ?? '';
  return STANDALONE_BLOUSE_TITLE_KEYWORDS.test(title) && !SAREE_TITLE_KEYWORDS.test(title);
}

function getCrawlerSafeTags(tags) {
  return (tags ?? []).filter(tag => !OBSOLETE_POLICY_TAG_PATTERN.test(String(tag)));
}

function getDisplayCategory(productType) {
  if (!productType) return 'Designer Wear';
  const value = productType.toLowerCase();

  if (/kurta pajama|sherwani|jodhpuri|men.*ethnic|men.*indian|men.*suit|modi jacket|menswear|bandi|pathani|achkan/.test(value)) return 'Menswear';
  if (/\bmen\b/.test(value)) return 'Menswear';
  if (/lehenga|lehnga|lehena/.test(value)) return 'Lehengas';
  if (/saree|sari/.test(value)) return 'Sarees';
  if (/pakistani|salwar|kameez|sharara|anarkali|plazzo|palazzo|gharara|gown|kurti|churidar|patiala/.test(value)) return 'Salwar Kameez';
  if (/indo.?western|fusion|jumpsuit|cape set|coord set|co.?ord/.test(value)) return 'Indo Western';
  if (/kundan|polki|jewelry|jewellery|necklace set|bridal set|choker necklace|maang tikka/.test(value)) return 'Jewelry';

  return productType;
}

// Server-side mirror of filterByCategory() from useShopifyProducts.ts.
// Returns up to MAX_COLLECTION_PRODUCTS for the prerendered HTML payload.
const MAX_COLLECTION_PRODUCTS = 50;
let applyCommercialLandingSubcategory = null;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesOccasionProduct(product, occasion) {
  const signals = OCCASION_SIGNALS[occasion];
  if (!signals || !isExplicitlyOrderable(product)) return false;

  const searchableValues = [
    product.title || '',
    product.productType || '',
    ...(product.tags || []),
  ].map((value) => String(value).toLowerCase());

  return signals.some((signal) => {
    const pattern = new RegExp(`\\b${escapeRegex(String(signal).toLowerCase())}\\b`, 'i');
    return searchableValues.some((value) => pattern.test(value));
  });
}

function filterProductsForCategory(allProducts, category, newestFirst = false, maxProducts = MAX_COLLECTION_PRODUCTS) {
  if (category === 'ready-to-ship') {
    return allProducts
      .filter(isExplicitlyOrderable)
      .filter((product) => !isMadeToOrderProduct(product))
      .filter((product) => hasExplicitReadyToShipEvidence(product))
      .slice(0, maxProducts);
  }
  if (category === 'made-to-order') {
    return allProducts
      .filter((product) => hasExplicitMadeToOrderEvidence(product))
      .filter(isExplicitlyOrderable)
      .slice(0, maxProducts);
  }
  if (category === 'customizable') {
    return allProducts
      .filter(isExplicitlyOrderable)
      .filter((product) => hasExplicitCustomizationEvidence(product))
      .slice(0, maxProducts);
  }

  if (category.startsWith('occasion:')) {
    const occasion = category.slice('occasion:'.length);
    if (isDurableIntentCollectionSlug(occasion)) {
      return allProducts
        .filter((product) => !EXCLUDED_TITLE_KEYWORDS.test(product.title ?? ''))
        .filter((product) => isEligibleForDurableIntent(product, occasion))
        .slice(0, maxProducts);
    }
    const signalOccasion = occasion.startsWith('wedding-guest-')
      ? 'wedding-guest'
      : occasion.startsWith('diwali-')
        ? 'diwali'
        : occasion;
    return allProducts
      .filter((product) => !EXCLUDED_TITLE_KEYWORDS.test(product.title ?? ''))
      .filter((product) => matchesOccasionProduct(product, signalOccasion))
      .filter((product) => occasion !== 'groomsmen' || isMenswearProduct(product))
      .filter((product) => {
        if (occasion !== 'navratri-chaniya') return true;
        const typeAndTitle = `${product.productType ?? ''} ${product.title ?? ''}`;
        return /lehenga|lehnga|chaniya|choli/i.test(typeAndTitle) && !isMenswearProduct(product);
      })
      .slice(0, maxProducts);
  }

  if (category.startsWith('collection:')) {
    const handle = category.slice('collection:'.length);
    const tagsFor = (product) => new Set((product.tags ?? []).map((tag) => tag.toLowerCase().trim()));
    const matches = allProducts.filter((product) => {
      if (EXCLUDED_TITLE_KEYWORDS.test(product.title ?? '')) return false;
      const productType = (product.productType ?? '').toLowerCase();
      const title = (product.title ?? '').toLowerCase();
      const tags = tagsFor(product);

      if (handle === 'silk-sarees') {
        return productType.includes('saree') && title.includes('silk') && !isStandaloneBlouseProduct(product);
      }
      if (handle === 'kanchipuram-sarees') {
        return ['kanchipuram', 'kanjivaram', 'kanjeevaram'].some((tag) => tags.has(tag));
      }
      if (handle === 'manthrakodi-sarees') {
        return ['manthrakodi', 'manthrokodi', 'kerala-christian-bridal-saree'].some((tag) => tags.has(tag));
      }
      if (handle === 'bridal-party-outfits') {
        // Catalog role tags are shared by many bridal, guest, and jewelry
        // products, so require an explicit attendant role in the title.
        return /\b(bridesmaids?|maid of hono(?:u)?r|matron of hono(?:u)?r)\b/i.test(product.title ?? '');
      }
      if (handle === 'bollywood-inspired-indian-outfits') {
        return tags.has('bollywood inspired');
      }
      return false;
    });

    return matches.slice(0, maxProducts);
  }

  // Global exclusions: old batch + banned titles
  const allowed = allProducts.filter(p => {
    if (isOldBatchProduct(p)) return false;
    if (EXCLUDED_TITLE_KEYWORDS.test(p.title ?? '')) return false;
    return true;
  });

  if (newestFirst) {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentProducts = allowed
      .filter(p => {
        const createdAt = new Date(p.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt > cutoff;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Match src/pages/NewArrivals.tsx so the first-byte product grid is not an
    // unfiltered duplicate of All Collections before React hydrates.
    const mainCategories = ['Lehengas', 'Sarees', 'Salwar Kameez', 'Menswear', 'Jewelry'];
    const groups = new Map();
    for (const product of recentProducts) {
      const displayCategory = getDisplayCategory(product.productType);
      const group = groups.get(displayCategory) ?? [];
      group.push(product);
      groups.set(displayCategory, group);
    }

    const cappedGroups = new Map();
    for (const [displayCategory, products] of groups) {
      cappedGroups.set(displayCategory, products.slice(0, mainCategories.includes(displayCategory) ? 5 : 3));
    }

    const ordered = [];
    for (const displayCategory of mainCategories) {
      ordered.push(...(cappedGroups.get(displayCategory) ?? []));
    }
    for (const [displayCategory, products] of cappedGroups) {
      if (!mainCategories.includes(displayCategory)) ordered.push(...products);
    }

    return ordered.slice(0, maxProducts);
  }

  if (category === 'all') return allowed.slice(0, maxProducts);

  const types = CATEGORY_PRODUCT_TYPES[category];
  if (!types) return allowed.slice(0, maxProducts);

  // Menswear: include only men's products, exclude women's wear
  if (category === 'menswear') {
    const womensKeywords = /\b(saree|sari|lehenga|lehenga|anarkali|salwar|palazzo|plazzo|sharara|gharara|gown|dupatta|blouse|petticoat|choli|women|women's|female|ladies|bridal|pakistani suit)\b/i;
    return allowed.filter(p => {
      if (!isMenswearProduct(p)) return false;
      if (EXCLUDED_TITLE_KEYWORDS.test(p.title ?? '')) return false;
      const title = (p.title ?? '').toLowerCase();
      const tags = (p.tags ?? []).map(t => t.toLowerCase());
      if (womensKeywords.test(title)) return false;
      if (tags.some(t => t === 'women' || t === 'womens' || t === 'female' || t === 'ladies' || t === 'gender:female' || t === 'gender:women')) return false;
      return true;
    }).slice(0, maxProducts);
  }

  // Women's categories: exclude menswear first
  const filtered = allowed.filter(p => !isMenswearProduct(p));

  if (category === 'indowestern') {
    const womensFusionTypes = [
      ...types.map(t => t.toLowerCase()),
      'sharara', 'anarkali', 'co-ords', 'coord set', 'jumpsuit', 'cape set', 'plazzo suit',
    ];
    return filtered.filter(p => {
      const pt = (p.productType ?? '').toLowerCase();
      const tags = (p.tags ?? []).map(t => t.toLowerCase());
      return womensFusionTypes.some(t => pt.includes(t)) ||
        tags.some(t => t.includes('indo') || t.includes('fusion') || t === 'contemporary' || t === 'western');
    }).slice(0, maxProducts);
  }

  if (category === 'suits') {
    const suitTags = ['salwar kameez', 'salwar-kameez', 'sharara suit', 'plazzo suit', 'pakistani suit',
      'anarkali suit', 'gharara suit', 'designer suit', 'wedding suit', 'boutique salwar suit'];
    const womensIndicators = /salwar|kameez|anarkali|sharara|palazzo|plazzo|gharara|pakistani|lehenga|dupatta|churidar|women|ladies|female/i;
    return filtered.filter(p => {
      const pt = (p.productType ?? '').toLowerCase();
      const tags = (p.tags ?? []).map(t => t.toLowerCase());
      const title = (p.title ?? '').toLowerCase();
      if (tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear' || t === 'groom')) return false;
      if (title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men')) return false;
      if (types.some(t => t.toLowerCase() === pt)) {
        if (pt === 'wedding suit' || pt === 'designer suit' || pt === 'suit') {
          if (!womensIndicators.test(title) && !womensIndicators.test(pt)) return false;
        }
        return true;
      }
      if (suitTags.some(st => tags.some(t => t === st || t.includes(st)))) {
        const hasMensSignals = tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear' || t === 'groom' || t === 'gender:male');
        const titleLooksMens = title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men');
        if (!hasMensSignals && !titleLooksMens) return true;
      }
      if (/salwar|kameez|anarkali|sharara|palazzo|plazzo|gharara|pakistani\s+suit|kurti|churidar|patiala/.test(pt)) return true;
      return false;
    }).slice(0, maxProducts);
  }

  // Lehengas + Sarees + Jewelry: match by productType with keyword fallback
  return filtered.filter(p => {
    const pt = (p.productType ?? '').toLowerCase();
    const tags = (p.tags ?? []).map(t => t.toLowerCase());
    const title = (p.title ?? '').toLowerCase();
    if (tags.some(t => t === 'men' || t === 'mens' || t === 'male' || t === 'boys' || t === 'menswear')) return false;
    if (title.includes('sherwani') || title.includes('kurta pajama') || title.includes('for men')) return false;
    if (category === 'sarees' && isStandaloneBlouseProduct(p)) return false;
    if (types.some(t => t.toLowerCase() === pt)) return true;
    if (category === 'lehengas') return /lehenga|lehnga|lehena/.test(pt);
    if (category === 'sarees') return /saree|sari/.test(pt);
    // Jewelry fallback — Shopify products often have productType "Jewelry Set",
    // "Bridal Jewelry Set", etc. Also tag-match for products whose productType
    // is generic but whose tags identify them as jewelry. Mirrors the same fix
    // in src/hooks/useShopifyProducts.ts filterByCategory().
    if (category === 'jewelry') {
      if (/\bjewel|jewell|kundan|polki|necklace|choker|bangle|earring|maang\s?tikka|bridal\s?set/.test(pt)) {
        return true;
      }
      const jewelryTagPattern = /\bjewel|jewell|kundan|polki|necklace|choker|bangle|earring|maang|bridal\s?set|bridal\s?jewelry/;
      if (tags.some(t => jewelryTagPattern.test(t))) {
        return true;
      }
      return false;
    }
    return false;
  }).slice(0, maxProducts);
}

function filterProductsForCollectionRoute(allProducts, route, maxProducts = MAX_COLLECTION_PRODUCTS) {
  let candidates = allProducts;

  if (route.prerenderSubcategory) {
    if (typeof applyCommercialLandingSubcategory !== 'function') {
      throw new Error(`Commercial landing matcher was not initialized for ${route.path}`);
    }
    // Match the exact normalized product representation that React receives
    // from window.__INITIAL_DATA__. Matching raw supplier copy here can admit
    // cards that disappear immediately after hydration when verified copy or
    // crawler-safe tags differ. Keep the original records for HTML/schema once
    // the stable set of matching handles has been resolved.
    const matchingHandles = new Set(
      applyCommercialLandingSubcategory(
        allProducts.map((node) => ({ node: buildHydrationProductNode(node) })),
        route.prerenderSubcategory,
      ).map((product) => product.node.handle),
    );
    candidates = allProducts.filter((product) => matchingHandles.has(product.handle));
  }

  const selectedProducts = filterProductsForCategory(
    candidates,
    route.category,
    route.path === '/new-arrivals',
    maxProducts,
  );

  if (route.prerenderSubcategory) {
    const hydrationMatchedHandles = new Set(
      applyCommercialLandingSubcategory(
        selectedProducts.map((node) => ({ node: buildHydrationProductNode(node) })),
        route.prerenderSubcategory,
      ).map((product) => product.node.handle),
    );
    const unstableHandles = selectedProducts
      .map((product) => product.handle)
      .filter((handle) => !hydrationMatchedHandles.has(handle));
    if (unstableHandles.length > 0) {
      throw new Error(
        `${route.path} contains ${unstableHandles.length} product(s) that would disappear after hydration: ${unstableHandles.join(', ')}`,
      );
    }
  }

  return selectedProducts;
}

// Build the compact JSON payload that gets injected as window.__INITIAL_DATA__.
// React's useShopifyProducts hook reads this on hydration to skip the client-side
// Shopify fetch entirely on first paint.
function toSafeInlineJson(value) {
  // Prevent a product title or description from closing the inline script tag.
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function buildHydrationProductNode(product) {
  const listedIncludedPieces = getListedProductAttributes(product).includedPieces;
  // Hydration must consume the exact final representation accepted by the raw
  // HTML renderer. In particular, an overlength metafield must not reappear in
  // React after the server deliberately selected a shorter verified fallback.
  const includedComponents = listedIncludedPieces ? [listedIncludedPieces] : null;

  return {
    id: product.id,
    title: sanitizeProductTitle(product.title),
    createdAt: product.createdAt,
    description: buildVerifiedProductCopy(product),
    handle: product.handle,
    vendor: product.vendor,
    productType: product.productType,
    // Keep merchandising attributes needed by client-side filters, while
    // preventing obsolete shipping regions and thresholds from being
    // republished inside the crawlable hydration payload.
    tags: getCrawlerSafeTags(product.tags),
    availableForSale: product.availableForSale,
    shipsWithinMetafield: product.shipsWithinMetafield || null,
    conditionMetafield: product.conditionMetafield || null,
    metadata: { includedComponents },
    priceRange: product.priceRange,
    compareAtPriceRange: product.compareAtPriceRange,
    images: product.images,
    variants: product.variants,
    options: product.options ?? [],
  };
}

function buildInitialDataPayload(products, category) {
  // Slim each product down to the fields the hook actually consumes.
  const slim = products.map((product) => ({
    node: buildHydrationProductNode(product),
  }));
  return toSafeInlineJson({ category: category || 'all', products: slim });
}

// Product pages have materially higher purchase intent than category pages. Give
// each prerendered route its own initial product record so a direct shopper
// visit can render and add to bag before a slow Storefront API refresh finishes.
function buildInitialProductPayload(product) {
  const slim = {
    ...buildHydrationProductNode(product),
    seo: product.seo || { title: null, description: null },
  };
  return toSafeInlineJson({ handle: product.handle, product: slim });
}

// Visible HTML product cards for crawlers. Removed by the existing MutationObserver
// once React hydrates. Mirrors the inline-styling pattern used for /product/* pages.
function generateCollectionProductHtml(products) {
  if (!products || products.length === 0) {
    return '<p>New arrivals are being added to this collection. Please check back shortly.</p>';
  }
  const cards = products.map(p => {
    const priceMoney = p.priceRange?.minVariantPrice;
    if (!isValidShopifyMoney(priceMoney)) {
      throw new Error(`[catalog-integrity] /product/${p.handle || '(missing-handle)'} cannot appear in collection HTML without an explicit valid Shopify price and currency.`);
    }
    const price = priceMoney.amount;
    const currency = priceMoney.currencyCode;
    const compareMoney = p.compareAtPriceRange?.maxVariantPrice;
    const isAvailable = isExplicitlyOrderable(p);
    const firstImage = p.images?.edges?.[0]?.node;
    const imgHtml = firstImage
      ? `<img src="${escapeHtml(forceJpegForGmc(firstImage.url))}" alt="${escapeHtml(firstImage.altText || sanitizeProductTitle(p.title) || '')}" width="400" height="500" loading="lazy" style="max-width:100%;height:auto;display:block;margin:0 0 8px 0">`
      : '';

    let priceHtml = `<strong>${currency} ${Number(price).toFixed(2)}</strong>`;
    if (isValidShopifyMoney(compareMoney)
      && compareMoney.currencyCode === currency
      && Number(compareMoney.amount) > Number(price)) {
      priceHtml += ` <s style="color:#888">${currency} ${Number(compareMoney.amount).toFixed(2)}</s>`;
    }

    const availability = isAvailable ? 'In Stock' : 'Currently Unavailable';
    const title = escapeHtml(sanitizeProductTitle(p.title || p.handle));
    const handle = escapeHtml(p.handle);

    return `<div style="display:inline-block;vertical-align:top;width:30%;margin:0 1.5% 24px;min-width:240px">
      <a href="/product/${handle}" style="text-decoration:none;color:inherit">
        ${imgHtml}
        <h3 style="font-size:14px;margin:0 0 4px 0;font-weight:600">${title}</h3>
      </a>
      <p style="margin:0 0 2px 0;font-size:13px">${priceHtml}</p>
      <p style="margin:0;font-size:12px;color:#666">${availability}</p>
    </div>`;
  }).join('\n        ');

  return `<div style="margin:24px 0">${cards}</div>`;
}

function generateCollectionStandardHtml(standard) {
  if (!standard) return '';
  const chooseBy = standard.chooseBy
    .map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
    .join('');
  const rows = standard.decisionRows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');
  const guides = standard.guideLinks
    .map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
    .join('');
  const faqs = standard.faqs
    .map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`)
    .join('');

  return `<section data-collection-standard>
      <h2>Choose by shopping need</h2>
      <nav aria-label="Choose by shopping need"><ul>${chooseBy}</ul></nav>
      <h2>Compare before choosing</h2>
      <table data-collection-decision-table>
        <thead><tr><th>Option</th><th>May suit</th><th>Verify on the listing</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div data-collection-selection-guidance>
        <h2>Product selection guidance</h2>
        <p>${escapeHtml(standard.selectionGuidance)}</p>
      </div>
      <h2>Relevant guides</h2>
      <ul data-collection-guides>${guides}</ul>
      <h2>Shipping, returns and support</h2>
      <nav aria-label="Shipping, returns and support">
        <a href="/shipping">Shipping rates and planning</a> |
        <a href="/returns#merchant-return-policy">Returns and covered order issues</a> |
        <a href="/sizing-measurements-guide">Sizing and measurements</a> |
        <a href="/contact">Contact LuxeMia support</a>
      </nav>
      <div data-collection-faqs>
        <h2>Frequently asked questions</h2>
        ${faqs}
      </div>
    </section>`;
}

function generateApprovedOverflowProductLinks(allProducts, displayedProducts) {
  const displayedHandles = new Set((displayedProducts || []).map((product) => product.handle));
  const overflowProducts = (allProducts || [])
    .filter((product) => APPROVED_SITEMAP_PATHS.has(`/product/${product.handle}`))
    .filter((product) => !displayedHandles.has(product.handle));
  if (overflowProducts.length === 0) return '';

  const links = overflowProducts
    .map((product) => `<li><a href="/product/${escapeHtml(product.handle)}">${escapeHtml(sanitizeProductTitle(product.title || product.handle))}</a></li>`)
    .join('');
  return `<nav aria-label="More products in this category"><h2>More Products in This Category</h2><ul>${links}</ul></nav>`;
}

function isAvailableForSiblingLinks(product) {
  return isExplicitlyOrderable(product);
}

function generateApprovedSiblingProductLinks(product, allShopifyProducts, limit = 4) {
  if (!product || !allShopifyProducts || allShopifyProducts.size === 0) return '';

  const categoryLink = getProductCategoryInfo(product.productType || '', product.title || '').link;
  const siblings = Array.from(allShopifyProducts.values())
    .filter((candidate) => candidate.handle !== product.handle)
    .filter((candidate) => APPROVED_SITEMAP_PATHS.has(`/product/${candidate.handle}`))
    .filter(isAvailableForSiblingLinks)
    .filter((candidate) => getProductCategoryInfo(candidate.productType || '', candidate.title || '').link === categoryLink)
    .sort((left, right) => left.handle.localeCompare(right.handle, 'en', { sensitivity: 'base' }));
  if (siblings.length === 0) return '';

  const insertionIndex = siblings.findIndex((candidate) => candidate.handle.localeCompare(product.handle, 'en', { sensitivity: 'base' }) > 0);
  const ringStart = insertionIndex === -1 ? 0 : insertionIndex;
  const selected = [];
  const seenHandles = new Set();
  for (let step = 0; step < siblings.length && selected.length < limit; step += 1) {
    const offsets = step === 0 ? [0] : [step, -step];
    for (const offset of offsets) {
      const index = (ringStart + offset + siblings.length) % siblings.length;
      const candidate = siblings[index];
      if (!candidate || seenHandles.has(candidate.handle)) continue;
      seenHandles.add(candidate.handle);
      selected.push(candidate);
      if (selected.length >= limit) break;
    }
  }

  const links = selected
    .map((candidate) => `<li><a href="/product/${escapeHtml(candidate.handle)}">${escapeHtml(sanitizeProductTitle(candidate.title || candidate.handle))}</a></li>`)
    .join('');
  return `<nav aria-label="Related products"><h2>Related Products</h2><ul>${links}</ul></nav>`;
}

// Build-time HTML directory for every approved, live sitemap product. This is
// intentionally simple text navigation: it creates a durable crawl path without
// showing a 700-card merchandising grid or linking to products outside the
// approved sitemap inventory.
function formatDirectoryPathLabel(routePath) {
  const labels = {
    '/': 'Home',
    '/collections': 'All Collections',
    '/about': 'About LuxeMia',
    '/sitemap': 'Product Directory',
    '/nri': 'Indian Ethnic Wear for U.S. Shoppers',
    '/indian-ethnic-wear-usa': 'Indian Ethnic Wear in the USA',
    '/pages/shipping-customs': 'Shipping and Customs',
  };
  if (labels[routePath]) return labels[routePath];
  return routePath
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
    .join(' — ');
}

function generateApprovedStaticDirectoryHtml() {
  const nonProductPaths = [...APPROVED_SITEMAP_PATHS]
    .filter((routePath) => routePath !== '/' && routePath !== '/sitemap' && !routePath.startsWith('/product/'))
    .sort((left, right) => formatDirectoryPathLabel(left).localeCompare(formatDirectoryPathLabel(right), 'en', { sensitivity: 'base' }));
  const links = nonProductPaths
    .map((routePath) => `<li><a href="${escapeHtml(routePath)}">${escapeHtml(formatDirectoryPathLabel(routePath))}</a></li>`)
    .join('');
  return `<section><h2>Collections, Guides and Store Information</h2><ul>${links}</ul></section>`;
}

function generateApprovedProductDirectoryHtml(products) {
  const grouped = new Map();
  const approvedProducts = products
    .filter((product) => APPROVED_SITEMAP_PATHS.has(`/product/${product.handle}`))
    .sort((left, right) => sanitizeProductTitle(left.title || left.handle).localeCompare(
      sanitizeProductTitle(right.title || right.handle),
      'en',
      { sensitivity: 'base' },
    ));

  for (const product of approvedProducts) {
    const category = getDisplayCategory(product.productType || 'Designer Wear');
    const entries = grouped.get(category) || [];
    entries.push(product);
    grouped.set(category, entries);
  }

  const categoryOrder = ['Lehengas', 'Sarees', 'Salwar Kameez', 'Menswear', 'Indo Western', 'Jewelry'];
  const categories = [...grouped.keys()].sort((left, right) => {
    const leftIndex = categoryOrder.indexOf(left);
    const rightIndex = categoryOrder.indexOf(right);
    return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
      (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex) ||
      left.localeCompare(right);
  });

  const sections = categories.map((category) => {
    const links = grouped.get(category)
      .map((product) => `<li><a href="/product/${escapeHtml(product.handle)}">${escapeHtml(sanitizeProductTitle(product.title || product.handle))}</a></li>`)
      .join('');
    return `<section><h2>${escapeHtml(category)}</h2><ul>${links}</ul></section>`;
  }).join('\n');

  return `<p>Browse all ${approvedProducts.length} current product listings by category. Open an individual listing for its exact fabric, included pieces, sizing, price and availability.</p>${sections}`;
}

// Product-level shipping details mirror the public U.S. standard-shipping terms.
// Add a handling window only when custom.ships_within supplies a positive day
// count. Carrier transit remains omitted because it varies by destination.
function generateUsProductShippingDetails(shipsWithinDays) {
  const handlingDays = Number.isFinite(shipsWithinDays) && shipsWithinDays > 0 ? Math.trunc(shipsWithinDays) : null;
  const deliveryTime = handlingDays ? {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: handlingDays, unitCode: 'DAY' },
  } : null;
  const withTime = (details) => ({ ...details, ...(deliveryTime ? { deliveryTime } : {}) });
  const create = (countries, rate, freeThreshold) => [
    withTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
      ...(freeThreshold ? { orderValue: { '@type': 'MonetaryAmount', maxValue: freeThreshold - 0.01, currency: 'USD' } } : {}),
      shippingRate: { '@type': 'MonetaryAmount', value: rate, currency: 'USD' },
    }),
    ...(freeThreshold ? [withTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
      orderValue: { '@type': 'MonetaryAmount', minValue: freeThreshold, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
    })] : []),
  ];
  return [
    ...create('US', 14.99, 199),
    ...create(['CA', 'GB'], 24.99, 299),
    ...create(['AU', 'NZ'], 29.99, 349),
    ...create('ZA', 49.99),
    ...create('MU', 59.99),
  ];
}

function normalizeBrand(vendor) {
  const raw = (vendor || '').trim();
  if (!raw) return '';
  // `vendor` can contain an internal supplier label. Only the catalog's
  // explicitly recognized LuxeMia aliases are valid consumer-brand evidence.
  return /^luxemi(?:a|ashop)$/i.test(raw.replace(/[^a-z0-9]/gi, '')) ? 'LuxeMia' : '';
}

function generateProductBrandSchema(vendor) {
  const name = normalizeBrand(vendor);
  if (!name) return undefined;
  return name === 'LuxeMia'
    ? { '@id': `${SITE_URL}/#brand` }
    : { '@type': 'Brand', name };
}

function getVerifiedItemCondition(product) {
  const conditionTag = (product?.tags || []).find((tag) => /^condition\s*[:=]\s*\S/i.test(String(tag).trim()));
  const raw = String(
    product?.conditionMetafield?.value
    || (conditionTag ? conditionTag.replace(/^condition\s*[:=]\s*/i, '') : ''),
  ).trim().toLowerCase();
  const normalized = raw.replace(/[\s_-]+/g, '');
  const conditions = {
    new: 'NewCondition',
    newcondition: 'NewCondition',
    used: 'UsedCondition',
    usedcondition: 'UsedCondition',
    preowned: 'UsedCondition',
    refurbished: 'RefurbishedCondition',
    refurbishedcondition: 'RefurbishedCondition',
    damaged: 'DamagedCondition',
    damagedcondition: 'DamagedCondition',
  };
  return conditions[normalized] ? `https://schema.org/${conditions[normalized]}` : undefined;
}

function isValidShopifyMoney(money) {
  return typeof money?.amount === 'string'
    && money.amount.trim() !== ''
    && Number.isFinite(Number(money.amount))
    && Number(money.amount) > 0
    && /^[A-Z]{3}$/.test(String(money.currencyCode || ''));
}

function getLiveProductPrerenderEvidence(product) {
  const handle = String(product?.handle || '').trim();
  const errors = [];
  if (!handle) errors.push('missing handle');
  if (!String(product?.title || '').trim()) errors.push('missing title');
  if (typeof product?.availableForSale !== 'boolean') errors.push('missing product availability');

  const rawImages = product?.images?.edges
    ?.map((edge) => edge?.node?.url)
    .filter((url) => typeof url === 'string' && url.trim()) || [];
  if (rawImages.length === 0) errors.push('missing Shopify product image');

  const variants = product?.variants?.edges?.map((edge) => edge?.node).filter(Boolean) || [];
  if (product?.variants?.pageInfo?.hasNextPage) errors.push('more than 100 variants; fetched variant set is incomplete');
  if (variants.length === 0) errors.push('missing Shopify variant');

  const minimumPrice = product?.priceRange?.minVariantPrice;
  if (!isValidShopifyMoney(minimumPrice)) errors.push('missing or invalid Shopify minimum price');

  variants.forEach((variant, index) => {
    const numericVariantId = String(variant?.id || '').trim().split('/').pop() || '';
    if (!/^\d+$/.test(numericVariantId)) errors.push(`variant ${index + 1} is missing its numeric Shopify ID`);
    if (typeof variant?.availableForSale !== 'boolean') errors.push(`variant ${index + 1} is missing availability`);
    if (!isValidShopifyMoney(variant?.price)) errors.push(`variant ${index + 1} is missing a valid Shopify price`);
  });

  const description = buildVerifiedProductCopy(product);
  if (!description) errors.push('missing source-backed product description');
  if (errors.length > 0) {
    throw new Error(`[catalog-integrity] /product/${handle || '(missing-handle)'} cannot be prerendered from current Shopify evidence: ${errors.join('; ')}`);
  }

  return {
    images: rawImages.map(forceJpegForGmc),
    variants,
    minimumPrice,
    description,
    availableForSale: product.availableForSale === true && variants.some((variant) => variant.availableForSale === true),
  };
}

function getProductVariantUrl(canonical, variant) {
  const numericVariantId = String(variant?.id || '').trim().split('/').pop() || '';
  if (!/^\d+$/.test(numericVariantId)) {
    throw new Error(`[catalog-integrity] Cannot publish an exact-variant URL without a numeric Shopify variant ID.`);
  }
  return `${canonical}?variant=${encodeURIComponent(numericVariantId)}`;
}

function getVisibleVariantLabel(variant, index) {
  const optionValues = (variant?.selectedOptions || [])
    .filter((option) => (
      option?.value
      && String(option.name || '').trim().toLowerCase() !== 'title'
      && String(option.value).trim().toLowerCase() !== 'default title'
    ))
    .map((option) => String(option.value).trim())
    .filter(Boolean);
  return [...new Set(optionValues)].join(' / ') || `available variant ${index + 1}`;
}

function assertExactLiveProductRouteSet(routeInventory, productMap) {
  const productRoutes = routeInventory.filter((route) => route.path.startsWith('/product/'));
  const routeHandles = productRoutes.map((route) => route.path.slice('/product/'.length));
  const routeHandleSet = new Set(routeHandles);
  const eligibleHandles = [...productMap.keys()].sort();
  const missing = eligibleHandles.filter((handle) => !routeHandleSet.has(handle));
  const extra = [...routeHandleSet].filter((handle) => !productMap.has(handle)).sort();
  const duplicates = [...routeHandleSet].filter(
    (handle) => routeHandles.filter((candidate) => candidate === handle).length > 1,
  );
  const detached = productRoutes
    .filter((route) => productMap.get(route.path.slice('/product/'.length)) !== route.product)
    .map((route) => route.path);

  if (missing.length > 0 || extra.length > 0 || duplicates.length > 0 || detached.length > 0) {
    throw new Error(
      '[catalog-integrity] Generated product routes do not exactly match the eligible live Shopify catalog. '
      + `Missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}; `
      + `duplicates: ${duplicates.join(', ') || 'none'}; detached records: ${detached.join(', ') || 'none'}.`,
    );
  }

  for (const product of productMap.values()) getLiveProductPrerenderEvidence(product);
  return eligibleHandles;
}

function getGtinSchemaProperty(value) {
  const digits = (value || '').replace(/[\s-]/g, '');
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits)) return {};

  const body = digits.slice(0, -1);
  let sum = 0;
  let weight = 3;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  if ((10 - (sum % 10)) % 10 !== Number(digits.at(-1))) return {};
  return { [`gtin${digits.length}`]: digits };
}

// schema.org ItemList JSON-LD for collection pages. Each ListItem wraps a Product
// with url/image/name/offers — what Google Merchant Center reads for rich results.
function generateItemListJsonLd(products, collectionName, routePath) {
  const canonical = SITE_URL + routePath;
  const items = products.map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: sanitizeProductTitle(product.title),
    url: `${SITE_URL}/product/${product.handle}`,
    ...(product.images?.edges?.[0]?.node?.url
      ? { image: forceJpegForGmc(product.images.edges[0].node.url) }
      : {}),
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${canonical}#itemlist`,
    name: collectionName,
    url: canonical,
    numberOfItems: items.length,
    itemListElement: items,
  };
}

function generateFaqPageJsonLd(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

const CANCELLATION_POLICY_ANSWER = 'Contact LuxeMia immediately to request cancellation. Requests received within 24 hours are more likely to be reviewed before fulfillment begins, but cancellation is not guaranteed and may become unavailable sooner. A request is not confirmed until LuxeMia accepts it. Nothing in this process limits rights that cannot legally be excluded.';

const FAQ_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where does LuxeMia ship?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Rates vary by destination; the shipping page lists current destination-specific rates and checkout is the final source of truth.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does LuxeMia shipping take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'When tracking is issued, carrier scans can appear after label creation. Carrier transit time begins after dispatch.',
      },
    },
    {
      '@type': 'Question',
      name: 'How should I choose a LuxeMia size?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Take current body measurements and compare them with the size options and details on the exact product page. Contact LuxeMia before ordering if the listing is unclear.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is LuxeMia’s return policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Change-of-mind purchases are final sale. Damage, defects, material misdescription, an incorrect item, or missing pieces should be reported promptly—preferably within 48 hours—with available photos and, when available, unboxing evidence. A missing video does not by itself remove rights that cannot legally be excluded.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel a LuxeMia order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${CANCELLATION_POLICY_ANSWER} Email hello@luxemia.shop immediately with your order number.`,
      },
    },
  ],
};

const MEASUREMENT_HOW_TO_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to take body measurements for Indian clothing',
  description: 'Record the body measurements commonly used when comparing the fit of saree blouses, lehengas, suits, kurtas and sherwanis.',
  totalTime: 'PT10M',
  supply: [
    { '@type': 'HowToSupply', name: 'Measurement worksheet' },
    { '@type': 'HowToSupply', name: 'Pen or pencil' },
    { '@type': 'HowToSupply', name: 'A helper, if available' },
  ],
  tool: [{ '@type': 'HowToTool', name: 'Soft measuring tape' }],
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Prepare to measure', text: 'Wear the undergarments and shoes planned for the outfit. Stand naturally and ask someone to help with back and length measurements when possible.' },
    { '@type': 'HowToStep', position: 2, name: 'Measure the upper body', text: 'Measure the bust or chest, underbust, shoulder, armhole, upper arm and sleeve length. Keep the tape level without compressing the body.' },
    { '@type': 'HowToStep', position: 3, name: 'Measure the waist and hips', text: 'Measure the natural waist, the position where the garment waistband will sit, and the fullest part of the hips.' },
    { '@type': 'HowToStep', position: 4, name: 'Measure garment lengths', text: 'Measure from the intended starting point to the preferred hem. Wear the planned shoes for floor-length garments.' },
    { '@type': 'HowToStep', position: 5, name: 'Check the selected product', text: 'Record every measurement twice, then compare the results with the size and construction details on the exact product listing.' },
  ],
};

const semanticCommerceRoutes = [
  {
    path: '/us-support',
    title: 'Online Support for U.S. Customers | LuxeMia',
    description: 'Contact LuxeMia for online product, sizing, order and issue-reporting support for customers shopping from the United States.',
    h1: 'Online Support for U.S. Customers',
    content: '<p>LuxeMia is an online-only retailer. Customers can use the <a href="/contact">contact form</a>, email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a>, call <a href="tel:+12153419990">+1 215-341-9990</a> or use the listed <a href="https://wa.me/12153419990">WhatsApp contact</a> for product, sizing and order questions. Requests are reviewed through the online queue; response times vary and same-day replies or event-date delivery are not guaranteed.</p><h2>Before ordering</h2><p>Share the product link, destination, selected size or stitching option, measurements and event date. Support can help locate the relevant published details and identify anything that must be confirmed before purchase.</p><h2>After ordering</h2><p>Include the order number when asking about processing, tracking, address corrections or a delivery issue. Address changes may not be possible after fulfillment begins.</p><h2>Issue escalation</h2><p>For damage, defects, a materially misdescribed item, an incorrect item or missing pieces, contact LuxeMia promptly. Keep all packaging and provide clear photos and a continuous unboxing video when available. The 48-hour request supports faster evidence review; it does not remove rights that cannot legally be excluded.</p><h2>Policies and standards</h2><p><a href="/privacy">Privacy choices</a>, <a href="/terms">terms</a>, <a href="/editorial-policy">editorial policy</a> and <a href="/review-policy">review safeguards</a>.</p>',
  },
  {
    path: '/editorial-policy',
    title: 'Editorial Policy and Product-Fact Standards | LuxeMia',
    description: 'How LuxeMia sources, reviews, dates and corrects product information and Indian attire guides.',
    h1: 'Editorial Policy and Product-Fact Standards',
    content: '<p>LuxeMia separates supplier-provided product facts from general educational guidance. Product claims are limited to the current listing, selected variant, tags, metafields or other traceable catalog evidence; missing optional facts are omitted rather than guessed.</p><h2>Product-fact verification</h2><p>Included pieces require explicit evidence. Material names are not converted into fiber percentages. Availability, price and selected options come from current commerce data. Fulfillment labels describe processing classification and are not inferred from sale availability alone.</p><h2>Guide methodology</h2><p>Guides use identified primary or established sources where factual background is needed. Cultural practices are described with regional, religious and family variation in mind. Commercial links are selected by verified attributes rather than unsupported assumptions.</p><h2>Corrections</h2><p>Articles display publication and last-reviewed dates. Send a material correction request with the page URL and supporting source to <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a>; warranted corrections are reflected on the page.</p><p><a href="/blog">Indian attire guides</a> · <a href="/review-policy">Review safeguards</a> · <a href="/contact">Contact the editorial team</a></p>',
  },
  {
    path: '/review-policy',
    title: 'Customer Review Program Conditions | LuxeMia',
    description: 'How LuxeMia handles review claims and the safeguards required before any third-party post-purchase survey can be enabled.',
    h1: 'Customer Review Program Conditions',
    content: '<p>LuxeMia does not operate or seed a separate on-site customer-review feed. This page does not claim that Google Customer Reviews enrollment, survey eligibility or a seller rating is currently active. Any future Google survey may run only inside Shopify’s protected post-purchase context, using verified order fields and an evidence-based delivery estimate, with the shopper deciding whether to opt in.</p><h2>Public return page</h2><p>The public LuxeMia return page has no signed Shopify order context. It does not trust order identifiers, email addresses, totals, countries or delivery dates supplied in a URL, and it does not pass those values to Google or record a purchase from them.</p><h2>Conditions for any survey</h2><p>A survey integration may be enabled only in Shopify’s protected post-purchase context after the required order identifier, customer email, delivery country and delivery estimate are verified. The estimate must come from evidence for that order rather than a universal number of days. If a required field is unavailable or cannot be verified, the survey must not render. The shopper must retain the optional opt-in choice described by the provider.</p><h2>Review integrity and control</h2><p>LuxeMia does not create, seed, rewrite or selectively suppress customer reviews. If a third-party review program is later verified and enabled, that provider controls its survey, content rules, privacy handling and any aggregate rating. A badge-script request by itself is not evidence that enrollment, survey eligibility or a seller rating is active.</p><p><a href="/privacy">Privacy policy</a> · <a href="/editorial-policy">Editorial policy</a> · <a href="/contact">Contact support</a></p>',
  },
  ...[
    ['/shipping/united-states', 'Shipping Indian Clothing to the United States', '$14.99 USD below $199 USD and free standard shipping at $199 USD or more'],
    ['/shipping/canada', 'Shipping Indian Clothing to Canada', '$24.99 USD below $299 USD and free standard shipping at $299 USD or more'],
    ['/shipping/united-kingdom', 'Shipping Indian Clothing to the United Kingdom', '$24.99 USD below $299 USD and free standard shipping at $299 USD or more'],
    ['/shipping/australia', 'Shipping Indian Clothing to Australia', '$29.99 USD below $349 USD and free standard shipping at $349 USD or more'],
  ].map(([path, h1, rate]) => ({
    path,
    title: `${h1} | LuxeMia`,
    description: `Current LuxeMia rate, processing, tracking, duties, returns and event-date guidance for ${h1.replace('Shipping Indian Clothing to ', '')}.`,
    h1,
    content: `<p>LuxeMia currently offers tracked standard shipping: ${rate}. The final checkout amount is the source of truth.</p><h2>Processing and carrier transit</h2><p>Processing occurs before dispatch. Carrier transit begins after dispatch, and estimates do not guarantee event-date delivery.</p><h2>Duties, taxes and fees</h2><p>Destination-country duties, taxes, brokerage or carrier fees may apply unless checkout expressly states otherwise.</p><h2>Returns and support</h2><p>Review the <a href="/returns">returns policy</a> before ordering and <a href="/us-support">contact LuxeMia support</a> when a timing or destination detail is important.</p>`,
  })),
  {
    path: '/festive-wear', title: 'Indian Festive Wear | LuxeMia', h1: 'Indian Festive Wear',
    description: 'Shop Indian festive outfits for Navratri, Garba, Diwali and other celebrations.',
    content: '<p>Browse celebration-focused outfits separately from bridal shopping, then confirm each item’s included pieces, stitching, size, processing and availability.</p><h2>Shop by celebration</h2><p><a href="/collections/navratri-chaniya-choli">Navratri chaniya choli</a>, <a href="/collections/garba-outfits">Garba outfits</a>, <a href="/collections/diwali-outfits">Diwali outfits</a>, and <a href="/menswear">festive menswear</a>.</p><h2>Related guide</h2><p><a href="/blog/chaniya-choli-versus-lehenga">Compare chaniya choli and lehenga shopping terms</a>.</p>',
  },
  {
    path: '/indian-wedding-guest-outfits', title: 'Indian Wedding Guest Outfits | LuxeMia', h1: 'Indian Wedding Guest Outfits',
    description: 'Compare sarees, lehengas, suits and menswear for Indian wedding guests.',
    content: '<p>Choose by event, venue, dress guidance and comfort rather than one universal rule. Confirm expectations with the hosts when possible.</p><h2>Shop wedding guest styles</h2><p><a href="/collections/wedding-guest-outfits">Browse the wedding guest collection</a>.</p><h2>Guest guides</h2><p><a href="/blog/what-should-a-male-guest-wear-to-a-three-day-indian-wedding">Three-day menswear planning</a> · <a href="/blog/what-should-a-non-indian-guest-wear-to-an-indian-wedding">non-Indian guest guidance</a>.</p>',
  },
  {
    path: '/wedding-events', title: 'Shop Outfits by Indian Wedding Event | LuxeMia', h1: 'Shop Outfits by Indian Wedding Event',
    description: 'Find outfit guidance and collections for Mehendi, Haldi, Sangeet and reception events.',
    content: '<p>Event pages organize current products by shopping intent, not universal dress rules. Hosts, region, religion, venue and family preferences can change what is appropriate.</p><h2>Browse events</h2><p><a href="/collections/mehendi-outfits">Mehendi</a>, <a href="/collections/haldi-outfits">Haldi</a>, <a href="/collections/sangeet-outfits">Sangeet</a>, and <a href="/collections/reception-outfits">reception</a>.</p><h2>Event guides</h2><p><a href="/blog/what-should-guests-wear-to-a-mehendi">Mehendi guest guide</a> · <a href="/blog/what-should-guests-wear-to-a-sangeet">Sangeet guest guide</a>.</p>',
  },
  {
    path: '/shop-by-fulfillment', title: 'Shop Indian Outfits by Fulfillment | LuxeMia', h1: 'Shop Indian Outfits by Fulfillment',
    description: 'Separate ready-to-ship, made-to-order and customizable Indian outfits before ordering.',
    content: '<p>Fulfillment describes what happens before dispatch. Availability for sale alone does not prove immediate stock.</p><h2>Choose a fulfillment path</h2><p><a href="/shop-by-fulfillment/ready-to-ship">Ready to ship</a>, <a href="/shop-by-fulfillment/made-to-order">made to order</a>, or <a href="/shop-by-fulfillment/customizable-outfits">customizable outfits</a>.</p><h2>Planning guides</h2><p><a href="/blog/ready-to-ship-versus-made-to-order">Ready-to-ship versus made-to-order</a> · <a href="/blog/how-early-to-order-for-a-fixed-wedding-date">fixed wedding-date planning</a>.</p>',
  },
  {
    path: '/shop-by-fulfillment/ready-to-ship', title: 'Ready-to-Ship Indian Outfits | LuxeMia', h1: 'Ready-to-Ship Indian Outfits',
    description: 'Browse products with explicit positive ready-to-ship catalog evidence while confirming selected-variant availability and processing.',
    content: '<p>Ready-to-ship applies only when the current catalog record has a supported ready-to-ship tag or positive ships-within value, the product has an available variant, and it is not marked Made to Order. Sale availability alone does not prove this fulfillment status.</p><h2>Confirm the selected variant</h2><p>Review product-level processing and destination details before ordering for an event. Carrier transit begins after dispatch.</p>',
  },
  {
    path: '/shop-by-fulfillment/made-to-order', title: 'Made-to-Order Indian Outfits | LuxeMia', h1: 'Made-to-Order Indian Outfits',
    category: 'made-to-order',
    description: 'Understand production, measurements and timing for made-to-order Indian clothing.',
    content: '<p>This page includes current, orderable products whose catalog record explicitly identifies Made to Order. Production begins after an order is confirmed; review measurements, supported options and processing separately from carrier transit.</p><h2>Made to order is not the same as customizable</h2><p>A made-to-order classification does not imply every design detail can be changed. Use the <a href="/collections/customizable-indian-outfits">customizable collection</a> only for products with an expressly supported color, measurement or other customization option.</p>',
  },
  {
    path: '/shop-by-fulfillment/customizable-outfits', title: 'Customizable Indian Outfits | LuxeMia', h1: 'Customizable Indian Outfits',
    description: 'Shop Indian outfits with only the customization options expressly supported by each listing.',
    content: '<p>Customization is product-specific. Select only listed options and obtain confirmation for material fit or design requests before checkout.</p><h2>Shop verified options</h2><p><a href="/collections/customizable-indian-outfits">Browse customizable outfits</a> or use the <a href="/sizing-measurements-guide">measurement guide</a>.</p>',
  },
];

// Route definitions with SEO metadata
const routes = [
  ...semanticCommerceRoutes,
  {
    path: '/',
    title: getIndexableRouteSeo('/').title,
    description: getIndexableRouteSeo('/').description,
    h1: getIndexableRouteSeo('/').h1,
    content: `
      <p>Shop bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry with tracked shipping to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Browse Indian wedding guest outfits with online support.</p>
      <h2>What can I shop at LuxeMia?</h2>
      <p>LuxeMia offers lehengas, sarees, salwar kameez, and menswear for weddings, festivals, and special occasions.</p>
      <nav>
        <ul>
          <li><a href="/collections/navratri-outfits">Navratri &amp; Garba Outfits 2026</a> — Current chaniya choli, lehenga and festive styles for U.S. celebrations</li>
          <li><a href="/collections/customizable-indian-outfits">Customizable Indian Outfits</a> — Current products with explicit catalog customization options</li>
          <li><a href="/lehengas">Lehengas</a> — Bridal & wedding lehenga choli collections</li>
          <li><a href="/sarees">Sarees</a> — Browse by fabric and occasion</li>
          <li><a href="/suits">Salwar Kameez</a> — Anarkali, sharara & palazzo suits</li>
          <li><a href="/menswear">Menswear</a> — Sherwanis, kurta sets & Indo-western</li>
          <li><a href="/festive-wear">Indian Festive Wear</a> — Celebration-focused collections by current catalog signals</li>
          <li><a href="/indian-wedding-guest-outfits">Indian Wedding Guest Outfits</a> — Compare venue, dress guidance and comfort</li>
          <li><a href="/wedding-events">Shop by Indian Wedding Event</a> — Mehendi, Haldi, Sangeet and reception destinations</li>
          <li><a href="/shop-by-fulfillment">Shop by Fulfillment</a> — Separate ready-to-ship, made-to-order and customizable items</li>
        </ul>
      </nav>
      <h2>Which LuxeMia collections are best for weddings?</h2>
      <p>Wedding shoppers can browse bridal lehengas, wedding sarees, reception outfits, and festive wear for every ceremony.</p>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a></li>
        <li><a href="/sarees">Wedding Sarees</a></li>
        <li><a href="/collections/reception-outfits">Reception Outfits</a></li>
        <li><a href="/festive-wear">Festive Wear</a></li>
      </ul>
      <h2>How much is LuxeMia shipping?</h2>
      <p>Rates vary across the seven supported destination countries. Review the <a href="/shipping">destination-specific shipping rates</a>; checkout is the final source of truth. When tracking is issued, carrier scans can appear after label creation.</p>
    `,
  },
  {
    path: '/sitemap',
    htmlSitemap: true,
    title: 'LuxeMia Product Directory | All Current Indian Ethnic Wear',
    description: 'Browse LuxeMia’s current Indian ethnic wear product directory, including lehengas, sarees, salwar suits, menswear and jewelry.',
    h1: 'LuxeMia Product Directory',
    content: '<p>Use this product directory to browse all current LuxeMia listings by category.</p>',
  },
  {
    path: '/suits',
    category: 'suits',
    title: getIndexableRouteSeo('/suits').title,
    description: getIndexableRouteSeo('/suits').description,
    h1: getIndexableRouteSeo('/suits').h1,
    content: `
      <p>Explore salwar kameez, anarkali, sharara and palazzo sets. Review each product page for the exact fabric, work, included pieces, stitching status, sizing and current availability.</p>
      <h2>Shop Suits by Occasion</h2>
      <ul>
        <li><a href="/suits?sub=wedding">Wedding Suits</a> — Elegant salwar kameez for wedding celebrations</li>
        <li><a href="/suits?sub=party-wear">Party Wear Suits</a> — Stunning suits for festive occasions</li>
        <li><a href="/suits?sub=festive">Festive Suits</a> — Vibrant suits for Diwali, Eid & Navratri</li>
        <li><a href="/suits?sub=casual">Casual Suits</a> — Everyday ethnic wear for women</li>
      </ul>
      <h2>Shop Suits by Style</h2>
      <ul>
        <li><a href="/anarkali-suit-for-wedding-guest">Anarkali Suits for Wedding Guests</a> — Compare current flared-kurta styles</li>
        <li><a href="/anarkali-suit-for-mother-of-bride">Anarkali Suits for the Mother of the Bride</a> — Occasion and fit considerations</li>
        <li><a href="/sharara-for-bride-sister">Sharara Sets for the Bride's Sister</a> — Compare current wide-leg styles</li>
        <li><strong>Gharara Suits</strong> — Review the style filters and exact listing for the supplied bottom silhouette</li>
        <li><a href="/collections/palazzo-suits">Palazzo Suits</a> — Compare current wide-leg suit listings</li>
        <li><a href="/suits?sub=pakistani">Pakistani-Style Suits</a> — Straight-cut options</li>
        <li><a href="/suits?sub=straight-cut">Straight Cut Suits</a> — Classic everyday salwar kameez</li>
      </ul>
      <h2>Shop Suits by Fabric</h2>
      <ul>
        <li><a href="/suits?sub=georgette-suit">Georgette Suits</a> — Lightweight & flowy</li>
        <li><a href="/suits?sub=chinon-suit">Chinon Suits</a> — Premium crepe-like fabric</li>
        <li><a href="/suits?sub=silk-suit">Silk Suits</a> — Luxurious & traditional</li>
        <li><a href="/suits?sub=cotton-suit">Cotton Suits</a> — Breathable & comfortable</li>
        <li><a href="/suits?sub=velvet-suit">Velvet Suits</a> — Rich & regal for winter weddings</li>
      </ul>
      <h2>Shop Suits by Color</h2>
      <ul>
        <li><a href="/suits?sub=pink">Pink Suits</a></li>
        <li><a href="/suits?sub=red">Red Suits</a></li>
        <li><a href="/suits?sub=green">Green Suits</a></li>
        <li><a href="/suits?sub=blue">Blue Suits</a></li>
        <li><a href="/suits?sub=maroon">Maroon Suits</a></li>
        <li><a href="/suits?sub=purple">Purple Suits</a></li>
      </ul>
      <h2>Wedding Party & NRI Suits</h2>
      <ul>
        <li><a href="/suits?sub=bridesmaid">Bridesmaid Suits</a> — Coordinated looks for the bridal party</li>
        <li><a href="/suits?sub=mother-of-bride">Mother of Bride Suits</a> — Elegant suits for mothers</li>
        <li><a href="/suits?sub=nri-wedding">NRI Wedding Suits</a> — Destination wedding appropriate</li>
      </ul>
      <h2>Shop Suits by Price</h2>
      <ul>
        <li><a href="/suits?sub=under-200">Suits Under $200</a> — Indian ethnic wear</li>
        <li><a href="/suits?sub=premium-300-plus">Premium Suits $300+</a> — Higher-priced and embellished options</li>
      </ul>
    `,
  },
  {
    path: '/lehengas',
    category: 'lehengas',
    title: getIndexableRouteSeo('/lehengas').title,
    description: getIndexableRouteSeo('/lehengas').description,
    h1: getIndexableRouteSeo('/lehengas').h1,
    content: `
      <p>Discover bridal, wedding guest, reception and festive lehengas with shipping to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Use the Ready to Ship filter only for products with positive catalog evidence, then review the exact fabric, included pieces, sizing and product-specific shipping estimate.</p>
      <h2>How the Ready-to-Ship Lehenga Filter Works</h2>
      <p>The Ready to Ship filter includes only purchasable products with positive ready-to-ship catalog evidence and an available variant, excluding products marked Made to Order or Made to Measure. Confirm the selected size, included pieces and shipping estimate before ordering for a fixed wedding date.</p>
      <h2>Adjustable-Waist and Cape-Dupatta Sangeet Lehengas</h2>
      <p>Select active listings state an adjustable waist or a cape-style pre-draped dupatta. If you are comparing an adjustable-waist lehenga choli for sangeet dancing or a cape-dupatta lehenga for a sangeet or reception, open the exact product page to confirm the waist allowance, stitching status, included pieces and dispatch timing.</p>
      <h2>Shop Lehengas by Occasion</h2>
      <ul>
        <li><a href="/lehengas?sub=bridal">Bridal Lehengas</a> — Heavily embroidered lehenga choli for your wedding day</li>
        <li><a href="/lehengas?sub=wedding">Wedding Lehengas</a> — Elegant designs for wedding celebrations</li>
        <li><a href="/lehengas?sub=engagement">Engagement Lehengas</a> — Statement pieces for the engagement ceremony</li>
        <li><a href="/lehengas?sub=reception">Reception Lehengas</a> — Glamorous lehengas for the reception</li>
        <li><a href="/lehengas?sub=mehendi">Mehendi Lehengas</a> — Vibrant lehengas for the henna ceremony</li>
        <li><a href="/lehengas?sub=haldi">Haldi Lehengas</a> — Bright yellow & festive lehengas</li>
        <li><a href="/lehengas?sub=sangeet">Sangeet Lehengas</a> — Dance-ready lehengas for the sangeet</li>
        <li><a href="/lehengas?sub=party-wear">Party Wear Lehengas</a> — Stunning lehengas for festive occasions</li>
      </ul>
      <h2>Compare Reception and Wedding-Party Lehengas</h2>
      <ul>
        <li><a href="/maroon-lehenga-for-reception">Reception Lehengas</a> — Compare fabric, work, included pieces and stitching status</li>
        <li><a href="/lehenga-for-bridesmaid">Bridesmaid Lehengas</a> — Current coordination and sizing considerations</li>
        <li><a href="/lehenga-for-mother-of-bride">Mother-of-the-Bride Lehengas</a> — Compare current occasion styles</li>
      </ul>
      <h2>Shop Lehengas by Style</h2>
      <ul>
        <li><a href="/lehengas?sub=floral">Floral Lehengas</a> — Romantic floral embroidery</li>
        <li><a href="/lehengas?sub=embroidered">Embroidered Lehengas</a> — Review each listing for its stated embroidery and work details</li>
        <li><a href="/lehengas?sub=designer">Lehenga Styles</a> — Browse current listed designs</li>
        <li><a href="/lehengas?sub=mirror-work">Mirror Work Lehengas</a> — Traditional Rajasthani mirror work</li>
        <li><a href="/lehengas?sub=jacket-lehenga">Jacket Lehengas</a> — Layered lehenga with jacket</li>
        <li><a href="/lehengas?sub=crop-top">Crop Top & Skirt Lehengas</a> — Modern indo-western silhouette</li>
      </ul>
      <h2>Shop Lehengas by Color</h2>
      <ul>
        <li><a href="/lehengas?sub=red">Red Lehengas</a> — Classic bridal red</li>
        <li><a href="/lehengas?sub=pink">Pink Lehengas</a> — Soft & romantic</li>
        <li><a href="/lehengas?sub=maroon">Maroon Lehengas</a> — Deep & rich</li>
        <li><a href="/lehengas?sub=pastel">Pastel Lehengas</a> — Modern pastel shades</li>
        <li><a href="/lehengas?sub=ivory">Ivory Lehengas</a> — Timeless & elegant</li>
        <li><a href="/lehengas?sub=wine">Wine Lehengas</a> — Sophisticated & deep</li>
      </ul>
      <h2>Wedding Party & NRI Lehengas</h2>
      <ul>
        <li><a href="/lehengas?sub=bridesmaid">Bridesmaid Lehengas</a> — Coordinated looks for the bridal party</li>
        <li><a href="/lehengas?sub=mother-of-bride">Mother of Bride Lehengas</a> — Elegant lehengas for mothers</li>
        <li><a href="/lehengas?sub=nri-wedding">NRI Wedding Lehengas</a> — Destination wedding appropriate</li>
      </ul>
      <h2>Shop Lehengas by Price</h2>
      <ul>
        <li><a href="/lehengas?sub=under-200">Lehengas Under $200</a> — Current styles priced below $200</li>
        <li><a href="/lehengas?sub=premium-300-plus">Premium Lehengas $300+</a> — Higher-priced and embellished options</li>
      </ul>
    `,
  },
  {
    path: '/sarees',
    category: 'sarees',
    title: getIndexableRouteSeo('/sarees').title,
    description: getIndexableRouteSeo('/sarees').description,
    h1: getIndexableRouteSeo('/sarees').h1,
    content: `
      <p>Explore wedding, silk and festive sarees with shipping to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review each product page for the exact fabric, weave or work, blouse details, dimensions and availability; a style name is not treated as proof of fiber, weaving method or origin.</p>
      <h2>Shop Sarees by Occasion</h2>
      <ul>
        <li><a href="/sarees?sub=bridal">Bridal Sarees</a> — Heavily embellished sarees for the bride</li>
        <li><a href="/sarees?sub=wedding">Wedding Sarees</a> — Elegant sarees for wedding ceremonies</li>
        <li><a href="/sarees?sub=reception">Reception Sarees</a> — Glamorous sarees for the reception</li>
        <li><a href="/sarees?sub=party-wear">Party Wear Sarees</a> — Statement sarees for parties</li>
        <li><a href="/sarees?sub=festive">Festive Sarees</a> — Vibrant sarees for Diwali, Eid & Navratri</li>
      </ul>
      <h2>Shop Sarees by Fabric</h2>
      <ul>
        <li><a href="/collections/silk-sarees">Silk Sarees</a> — Check each listing for exact fiber and weave details</li>
        <li><a href="/sarees?sub=banarasi">Banarasi Sarees</a> — Check each listing for exact weave and origin details</li>
        <li><a href="/collections/kanchipuram-sarees">Kanchipuram &amp; Kanjivaram Sarees</a> — Review current listed fabric, weave and zari details</li>
        <li><a href="/kanjivaram-saree-for-wedding">Kanjivaram Wedding Saree Guide</a> — Compare wedding-shopping considerations</li>
        <li><a href="/sarees?sub=georgette">Georgette Sarees</a> — Lightweight & elegant</li>
        <li><a href="/sarees?sub=chiffon">Chiffon Sarees</a> — Flowy & comfortable</li>
        <li><a href="/sarees?sub=organza">Organza Sarees</a> — Modern sheer fabric</li>
      </ul>
      <h2>Shop Sarees by Style</h2>
      <ul>
        <li><a href="/sarees?sub=embroidered">Embroidered Sarees</a> — Review each listing for its stated work details</li>
        <li><a href="/sarees?sub=printed">Printed Sarees</a> — In-stock and easy to wear</li>
        <li><a href="/sarees?sub=designer">Saree Styles</a> — Browse current listed designs</li>
        <li><a href="/sarees?sub=traditional">Traditional Sarees</a> — Heritage weaves</li>
      </ul>
      <h2>Shop Sarees by Color</h2>
      <ul>
        <li><a href="/sarees?sub=red">Red Sarees</a></li>
        <li><a href="/sarees?sub=maroon">Maroon Sarees</a></li>
        <li><a href="/sarees?sub=pink">Pink Sarees</a></li>
        <li><a href="/sarees?sub=blue">Blue Sarees</a></li>
        <li><a href="/sarees?sub=green">Green Sarees</a></li>
        <li><a href="/sarees?sub=pastel">Pastel Sarees</a></li>
      </ul>
      <h2>Wedding Party & NRI Sarees</h2>
      <ul>
        <li><a href="/sarees?sub=bridesmaid">Bridesmaid Sarees</a> — Coordinated looks for the bridal party</li>
        <li><a href="/sarees?sub=mother-of-bride">Mother of Bride Sarees</a> — Elegant sarees for mothers</li>
        <li><a href="/sarees?sub=nri-wedding">NRI Wedding Sarees</a> — Destination wedding appropriate</li>
      </ul>
      <h2>Shop Sarees by Price</h2>
      <ul>
        <li><a href="/sarees?sub=under-200">Sarees Under $200</a> — Current styles priced below $200</li>
        <li><a href="/sarees?sub=premium-300-plus">Premium Sarees $300+</a> — Higher-priced and embellished options</li>
      </ul>
    `,
  },
  {
    path: '/collections/silk-sarees',
    category: 'collection:silk-sarees',
    title: 'Silk Sarees Online for Weddings & Festivals | LuxeMia',
    description: 'Shop silk sarees online for Indian weddings, receptions and festivals. Review each listing for its stated weave, fabric composition, blouse details and care instructions.',
    h1: 'Silk Sarees',
    content: `
      <p>Browse silk sarees listed for weddings, receptions, pujas and festive celebrations. Each product page states the supplied fabric details so you can compare drape, finish, work and blouse options before ordering.</p>
      <h2>How should I choose a silk saree online?</h2>
      <p>Compare the exact fabric composition, weight, border, embellishment and blouse details on each listing. Silk sarees can use pure silk, blended silk or art-silk fabrics, so LuxeMia states the information supplied for each product.</p>
      <p><a href="/sarees">Browse all sarees</a> or <a href="/contact">contact LuxeMia</a> for help choosing a wedding saree.</p>
    `,
  },
  {
    path: '/collections/kanchipuram-sarees',
    category: 'collection:kanchipuram-sarees',
    title: 'Kanchipuram Sarees Online | Wedding Sarees | LuxeMia',
    description: 'Explore Kanchipuram and Kanjivaram sarees for South Indian weddings. Review each product listing for its stated fabric, weave, zari, blouse and availability details.',
    h1: 'Kanchipuram Sarees',
    content: `
      <p>This collection shows sarees whose current product information identifies them as Kanchipuram, Kanjivaram or Kanjeevaram. Review the exact listing before ordering.</p>
      <h2>How does LuxeMia describe Kanchipuram sarees?</h2>
      <p>We do not label a product as pure silk, handwoven or genuine zari unless the supplied product information supports that statement. Each listing will state the known fabric, blouse inclusion and work details.</p>
      <p><a href="/sarees">Browse all sarees</a> or <a href="/contact">tell us what you need</a>.</p>
    `,
  },
  {
    path: '/collections/manthrakodi-sarees',
    category: 'collection:manthrakodi-sarees',
    title: 'Manthrakodi Sarees for Kerala Christian Weddings | LuxeMia',
    description: 'Shop Manthrakodi sarees for Kerala Christian weddings. Browse bridal sarees with clearly stated fabric, border, blouse and product details, with shipping to supported destinations.',
    h1: 'Manthrakodi Sarees',
    content: `
      <p>This collection shows current listings identified for Manthrakodi sarees associated with Kerala Christian wedding traditions. Review each product page for the exact fabric, border, blouse and availability details.</p>
      <h2>What is a Manthrakodi?</h2>
      <p>In many Kerala Christian wedding traditions, the Manthrakodi is the saree presented to the bride by the groom or his family and blessed as part of the ceremony. Customs differ, so shoppers should follow their own family and church requirements.</p>
      <p><a href="/sarees">Browse all sarees</a> or <a href="/contact">ask for help comparing current listings</a>.</p>
    `,
  },
  {
    path: '/collections/bridal-party-outfits',
    category: 'collection:bridal-party-outfits',
    title: 'Indian Bridesmaid & Maid of Honor Outfits | LuxeMia',
    description: 'Shop Indian bridesmaid and maid of honor outfits. Explore coordinated lehengas, sarees and suits for the bride’s attendants, with styling support.',
    h1: 'Bridesmaid & Maid of Honor Outfits',
    content: `
      <p>Coordinate the women standing with the bride without requiring everyone to wear the identical outfit. Browse lehengas, sarees and suits selected for bridesmaids and the maid or matron of honor.</p>
      <h2>How should Indian bridesmaid outfits coordinate?</h2>
      <p>Start with a shared color family, fabric weight or embroidery detail, then choose silhouettes suited to each bridesmaid. The maid or matron of honor can wear a deeper shade or more detailed border within the same palette.</p>
      <p><a href="/wedding-party-orders">Plan a wedding party order</a> or <a href="/contact">contact LuxeMia</a> for help.</p>
    `,
  },
  {
    path: '/collections/bollywood-inspired-indian-outfits',
    category: 'collection:bollywood-inspired-indian-outfits',
    title: 'Bollywood-Inspired Indian Outfits & Sarees | LuxeMia',
    description: 'Shop Bollywood-inspired Indian outfits, sarees and lehengas influenced by memorable celebrity style moments for weddings, receptions and parties.',
    h1: 'Bollywood-Inspired Indian Outfits',
    content: `
      <p>Discover sarees, lehengas and festive Indian outfits selected for cinematic glamour and contemporary occasion style.</p>
      <h2>Are these outfits endorsed by Bollywood celebrities?</h2>
      <p>No. LuxeMia offers independent fashion interpretations inspired by broader Bollywood and red-carpet style directions. Celebrity names describe style inspiration only; no affiliation or endorsement is implied.</p>
      <p><a href="/sarees">Browse sarees</a>, <a href="/lehengas">browse lehengas</a> or <a href="/contact">contact LuxeMia</a>.</p>
    `,
  },
  {
    path: '/menswear',
    category: 'menswear',
    title: getIndexableRouteSeo('/menswear').title,
    description: getIndexableRouteSeo('/menswear').description,
    h1: getIndexableRouteSeo('/menswear').h1,
    content: `
      <p>Discover sherwanis, kurta sets and Indo-Western menswear. Review each product page for the exact fabric, work, included pieces, sizes, tailoring options and current availability.</p>
      <h2>Custom Plus-Size Kurta Pajama and Nehru-Jacket Sets</h2>
      <p>Select active listings state plus-size custom stitching and include a kurta, pajama and Nehru jacket. When comparing a men's plus-size kurta pajama with matching jacket for a wedding guest or cocktail night, or a big-and-tall Nehru-jacket look, confirm the exact fabric, measurement process, set contents and event timing on the product page before ordering.</p>
      <h2>Shop Menswear by Style</h2>
      <ul>
        <li><a href="/collections/sherwani-for-groom">Groom Sherwanis</a> — Compare current role-verified groom listings</li>
        <li><a href="/menswear?sub=kurta-pajama">Kurta Pajama Sets</a> — Classic & comfortable ethnic wear</li>
        <li><a href="/menswear?sub=modi-jacket">Modi Jackets</a> — Tailored Nehru-style jackets</li>
        <li><a href="/menswear?sub=indo-western">Indo Western</a> — Modern fusion silhouettes</li>
        <li><a href="/menswear?sub=bandhgala">Bandhgala Suits</a> — Tailored formal jackets</li>
      </ul>
      <h2>Shop Menswear by Fabric</h2>
      <ul>
        <li><a href="/menswear?sub=silk-menswear">Silk Sherwanis</a> — Luxurious & traditional</li>
        <li><a href="/menswear?sub=raw-silk">Raw Silk Sherwanis</a> — Premium & textured</li>
        <li><a href="/menswear?sub=jacquard">Jacquard Sherwanis</a> — Woven patterns</li>
        <li><a href="/menswear?sub=velvet-menswear">Velvet Sherwanis</a> — Rich & regal for winter weddings</li>
        <li><a href="/menswear?sub=cotton-menswear">Cotton Kurtas</a> — Breathable & comfortable</li>
        <li><a href="/menswear?sub=brocade">Brocade Sherwanis</a> — Ornate & traditional</li>
      </ul>
      <h2>Shop Menswear by Occasion</h2>
      <ul>
        <li><a href="/menswear?sub=wedding">Wedding Sherwanis</a> — Groom & groomsmen</li>
        <li><a href="/menswear?sub=engagement">Engagement Sherwanis</a> — Statement pieces</li>
        <li><a href="/menswear?sub=reception">Reception Sherwanis</a> — Glamorous evening looks</li>
        <li><a href="/menswear?sub=festive">Festive Menswear</a> — Diwali, Eid & celebrations</li>
      </ul>
      <h2>Shop Menswear by Color</h2>
      <ul>
        <li><a href="/menswear?sub=cream">Cream Sherwanis</a></li>
        <li><a href="/menswear?sub=beige">Beige Sherwanis</a></li>
        <li><a href="/menswear?sub=gold">Gold Sherwanis</a></li>
        <li><a href="/menswear?sub=black">Black Sherwanis</a></li>
        <li><a href="/menswear?sub=navy">Navy Sherwanis</a></li>
        <li><a href="/menswear?sub=maroon">Maroon Sherwanis</a></li>
        <li><a href="/menswear?sub=wine">Wine Sherwanis</a></li>
      </ul>
      <h2>Wedding Party & NRI Menswear</h2>
      <ul>
        <li><a href="/menswear?sub=groom">Groom Sherwanis</a> — The main character of the day</li>
        <li><a href="/menswear?sub=groomsmen">Groomsmen Sherwanis</a> — Coordinated looks for the wedding party</li>
        <li><a href="/menswear?sub=nri-wedding">NRI Wedding Menswear</a> — Destination wedding appropriate</li>
      </ul>
      <h2>Shop Menswear by Price</h2>
      <ul>
        <li><a href="/menswear?sub=under-200">Menswear Under $200</a> — Indian ethnic wear</li>
        <li><a href="/menswear?sub=premium-300-plus">Premium Menswear $300+</a> — Designer & heavily embellished</li>
      </ul>
      <h2>Sherwanis for Grooms</h2>
      <p>Browse sherwanis for grooms and wedding guests. Fabric, embroidery, set contents and sizing vary by product, so review the exact listing before ordering.</p>
      <h2>Kurta Sets & Indo-Western</h2>
      <p>Explore kurta pajama sets and Indo-Western styles for festive gatherings and wedding events. Check the exact material, set contents, measurements and availability on each product page.</p>
    `,
  },
  {
    path: '/jewelry',
    category: 'jewelry',
    title: getIndexableRouteSeo('/jewelry').title,
    description: getIndexableRouteSeo('/jewelry').description,
    h1: getIndexableRouteSeo('/jewelry').h1,
    content: `
      <p>Discover Kundan-style, polki-style and bridal necklace sets. Review each product page for the exact materials, finish, stones or accents, included pieces, closure and measurements.</p>
      <h2>Shop Jewelry by Type</h2>
      <ul>
        <li><a href="/jewelry?sub=necklace-set">Necklace Sets</a> — Review each listing for exact set contents</li>
        <li><a href="/jewelry?sub=choker">Chokers</a> — Close-fitting statement necklaces</li>
        <li><a href="/jewelry?sub=bridal-set">Bridal Sets</a> — Included pieces vary by product</li>
      </ul>
      <h2>Shop Jewelry by Price</h2>
      <ul>
        <li><a href="/jewelry?sub=under-100">Jewelry Under $100</a></li>
        <li><a href="/jewelry?sub=premium-100-plus">Jewelry $100+</a></li>
      </ul>
      <h2>Why Choose Kundan Jewelry for Your Wedding?</h2>
      <p>Kundan and polki are design terms that may be used for different materials and finishes. Do not assume a listing contains diamonds, precious metal, hand-set stones or a particular technique unless the product page states it.</p>
    `,
  },
  {
    path: '/blog',
    title: 'Fact-Checked Indian Ethnic Wear Guides | LuxeMia',
    description: 'Source-based guides to Indian clothing terms, sizing, textiles, cultural context and occasionwear for shoppers in LuxeMia’s supported countries.',
    h1: 'Fact-Checked Indian Ethnic Wear Guides',
    content: `
      <p>Source-reviewed guides to Indian clothing terms, measurements, textiles, cultural context and occasionwear for shoppers in LuxeMia’s supported countries.</p>
      <p>The current article and topic lists are generated from the same published data used by the site.</p>
    `,
  },







  {
    path: '/collections',
    category: 'all',
    title: 'All Collections | Indian Ethnic Wear | LuxeMia',
    description: 'Browse all LuxeMia collections. Bridal lehengas, wedding sarees, reception outfits, festive wear & more. Curated for every occasion.',
    h1: 'All Indian Ethnic Wear Collections',
    content: `
      <p>Browse our curated collections of Indian ethnic wear, thoughtfully organized for every occasion.</p>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a> — Bridal wear for your special day</li>
        <li><a href="/sarees">Wedding Sarees</a> — Elegant sarees for wedding celebrations</li>
        <li><a href="/suits">Salwar Kameez</a> — Anarkali, sharara & palazzo suits</li>
        <li><a href="/menswear">Menswear</a> — Sherwanis, kurta sets & Indo-western</li>
        <li><a href="/collections/sharara-suits">Sharara Suits</a> — Wedding and festive sharara sets</li>
        <li><a href="/collections/gharara-suits">Gharara Suits</a> — Gharara sets for weddings and celebrations</li>
        <li><a href="/collections/anarkali-suits">Anarkali Suits</a> — Anarkali styles for weddings and party wear</li>
        <li><a href="/collections/palazzo-suits">Palazzo Suits</a> — Current wide-leg suit listings</li>
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Indian wedding lehenga styles</li>
        <li><a href="/collections/party-wear-lehengas">Party-Wear Lehengas</a> — Festive lehenga choli styles</li>
        <li><a href="/collections/banarasi-sarees">Banarasi Sarees</a> — Current listings with explicit Banarasi catalog evidence</li>
        <li><a href="/collections/sherwani-for-groom">Groom Sherwanis</a> — Current listings with both groom and sherwani evidence</li>
        <li><a href="/collections/wedding-guest-lehengas">Wedding Guest Lehengas</a> — Current role- and garment-matched listings</li>
        <li><a href="/collections/wedding-guest-kurta-sets">Wedding Guest Kurta Sets</a> — Current kurta menswear matched to guest events</li>
        <li><a href="/collections/diwali-womenswear">Diwali Womenswear</a> — Current festive womenswear</li>
        <li><a href="/collections/diwali-menswear">Diwali Menswear</a> — Current festive menswear</li>
        <li><a href="/collections/groomsmen-outfits">Groomsmen Outfits</a> — Current menswear explicitly identified for groomsmen</li>
      </ul>
    `,
  },
  {
    path: '/collections/customizable-indian-outfits',
    category: 'customizable',
    title: 'Customizable Indian Outfits | Product-Specific Options | LuxeMia',
    description: 'Browse currently orderable Indian outfits whose Shopify records explicitly identify a customization option. Confirm the exact option and timing on the product page.',
    h1: 'Customizable Indian Outfits',
    content: `
      <p>This collection is generated from current Shopify products that have an available variant and explicitly identify at least one customization option. The exact supported option varies by product; the collection label does not promise custom color, measurements, or another change unless the listing states it.</p>
      <h2>How does a LuxeMia custom order work?</h2>
      <ol>
        <li>Open the exact current product page and identify the customization option it expressly offers.</li>
        <li>Send the product link, requested option, event date, and delivery country so LuxeMia can confirm what is supported.</li>
        <li>There is no universal production window. Obtain product-specific written confirmation of production time and carrier transit before ordering for a fixed date.</li>
      </ol>
      <p>Other design changes are not included unless LuxeMia confirms them in writing. Rush delivery is not guaranteed. Custom orders are final sale, subject to applicable law.</p>
      <h2>Current shipping availability</h2>
      <p>Checkout accepts addresses in the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review the <a href="/shipping">destination-specific rates</a>; checkout is the final source of truth. Applicable taxes are calculated at checkout.</p>
      <p><a href="/contact">Contact LuxeMia</a> | <a href="/sizing-measurements-guide">Measurement guide</a> | <a href="/returns">Returns policy</a></p>
    `,
  },
  {
    path: '/products',
    title: 'All Products | Shop Indian Ethnic Wear Online | LuxeMia',
    description: 'Browse all LuxeMia products, including lehengas, sarees, salwar suits, sherwanis and more, with shipping to seven supported destination countries.',
    h1: 'All Products',
    content: `
      <p>Explore our complete collection of Indian ethnic wear, including lehengas, sarees, salwar suits, sherwanis and more.</p>
      <h2>Shop by Category</h2>
      <p>Browse our full catalog organized by type: <a href="/lehengas">Lehengas</a>, <a href="/sarees">Sarees</a>, <a href="/suits">Salwar Kameez</a>, and <a href="/menswear">Menswear</a>. Use filters to sort by price, color, fabric, and occasion.</p>
      <p>Pieces ship with tracking to addresses in the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review the <a href="/shipping">destination-specific rates</a>; checkout is the final source of truth.</p>
    `,
  },
  {
    path: '/collections/bridal-lehengas',
    commercialLanding: 'bridal-lehengas',
    title: getIndexableRouteSeo('/collections/bridal-lehengas').title,
    description: getIndexableRouteSeo('/collections/bridal-lehengas').description,
    h1: getIndexableRouteSeo('/collections/bridal-lehengas').h1,
    content: `<p>Browse current bridal lehengas for Indian wedding celebrations. Each listed design can differ in color, fabric, embroidery, included choli or dupatta pieces, size options and availability.</p>
      <h2>Compare Bridal Lehenga Details Before Ordering</h2>
      <p>Use the product grid to compare current styles, then open the exact listing to confirm the supplied fabric, work, included pieces, measurements and selected option. A category label does not confirm the construction or contents of every design.</p>
      <h3>Plan for a Wedding Date</h3>
      <p>For an event with a fixed date, review the selected product details and current policy information before ordering. Use the <a href="/size-guide">size guide</a> to compare measurements and the <a href="/shipping">shipping information for supported destinations</a> for planning details.</p>
      <p>Rates vary by destination; checkout is the final source of truth.</p>`,
  },
  {
    path: '/collections/sharara-suits',
    commercialLanding: 'sharara-suits',
    title: getIndexableRouteSeo('/collections/sharara-suits').title,
    description: getIndexableRouteSeo('/collections/sharara-suits').description,
    h1: getIndexableRouteSeo('/collections/sharara-suits').h1,
    content: `<p>Browse current sharara suits for wedding events, festive celebrations and party wear. A sharara set can combine a kurti, flared bottoms and a dupatta, but the exact silhouette and included pieces vary by listing.</p>
      <h2>Compare Sharara Suit Fabric, Work and Included Pieces</h2>
      <p>Use the current product grid to compare color, stated fabric, embroidery or work, price and available options. Open the exact listing to confirm the supplied kurti, bottoms, dupatta, lining, size and current availability rather than assuming every set includes the same pieces.</p>
      <h3>Size and Event Planning</h3>
      <p>For a time-sensitive celebration, compare your measurements with the selected listing before ordering. See the <a href="/size-guide">size guide</a>, <a href="/shipping">shipping information for supported destinations</a> and <a href="/suits">all current suits</a> for planning and comparison.</p>
      <p>Rates vary by destination; checkout is the final source of truth.</p>`,
  },
  {
    path: '/collections/gharara-suits',
    commercialLanding: 'gharara-suits',
    title: getIndexableRouteSeo('/collections/gharara-suits').title,
    description: getIndexableRouteSeo('/collections/gharara-suits').description,
    h1: getIndexableRouteSeo('/collections/gharara-suits').h1,
    content: `<p>Browse current gharara suit listings for wedding celebrations and festive occasions. Gharara styling can vary by design, so use the product photography and supplied description to compare the exact kurti, flared bottoms, dupatta and embellishment details.</p>
      <h2>Choose a Gharara Set by Color, Work and Included Pieces</h2>
      <p>Compare currently listed colors, fabrics, work and price, then confirm the supplied included pieces, size options and availability on the individual product page. Product details—not a style name alone—are the reliable specification for every outfit.</p>
      <h3>Size and Delivery Planning</h3>
      <p>For a fixed event date, compare your measurements with the selected listing before ordering. Review the <a href="/size-guide">size guide</a>, <a href="/shipping">shipping information for supported destinations</a> and <a href="/suits">all current suits</a> for planning and comparison.</p>
      <p>Rates vary by destination; checkout is the final source of truth.</p>`,
  },
  {
    path: '/collections/anarkali-suits',
    commercialLanding: 'anarkali-suits',
    title: getIndexableRouteSeo('/collections/anarkali-suits').title,
    description: getIndexableRouteSeo('/collections/anarkali-suits').description,
    h1: getIndexableRouteSeo('/collections/anarkali-suits').h1,
    content: `<p>Browse current Anarkali suits for wedding events, festive gatherings and party wear. The available sets can differ in fabric, embroidery, length and included pieces, so use the exact product page to compare the supplied specifications before ordering.</p>
      <h2>Compare Anarkali Suit Fabric, Work and Fit</h2>
      <p>Compare current colors, stated fabric, embroidery or work, price and available options in the product grid. Confirm whether the selected set includes a dupatta, bottoms or lining, plus the listed size and current availability.</p>
      <h3>Plan for a Wedding or Celebration</h3>
      <p>For an event with a fixed date, review the selected listing and <a href="/shipping">shipping information for supported destinations</a> before ordering. Use the <a href="/size-guide">size guide</a> to compare measurements and browse <a href="/suits">all current suits</a> for additional styles.</p>
      <p>Rates vary by destination; checkout is the final source of truth.</p>`,
  },
  {
    path: '/collections/palazzo-suits',
    commercialLanding: 'palazzo-suits',
    title: getIndexableRouteSeo('/collections/palazzo-suits').title,
    description: getIndexableRouteSeo('/collections/palazzo-suits').description,
    h1: getIndexableRouteSeo('/collections/palazzo-suits').h1,
    content: `<p>Browse current palazzo suit listings and compare the exact top or kurta, wide-leg bottoms, dupatta, lining, fabric wording, work, measurements, selected option and current availability. The collection name does not establish a universal set of included pieces.</p>
      <h2>Compare Palazzo Suit Silhouettes and Contents</h2>
      <p>Use the current product grid to identify a suitable silhouette, then open the exact listing to verify every supplied garment, closure, measurement and care instruction. Do not assume a dupatta, jacket or accessory is included unless the product record states it.</p>
      <h3>Plan Sizing and Event Timing</h3>
      <p>Compare current measurements with the <a href="/sizing-measurements-guide">measurement guide</a>, then review <a href="/shipping">shipping rates and planning for supported destinations</a>. Product processing occurs before carrier transit, and delivery by a fixed event date is not guaranteed.</p>`,
  },
  {
    path: '/collections/sherwani-for-groom',
    commercialLanding: 'sherwani-for-groom',
    title: getIndexableRouteSeo('/collections/sherwani-for-groom').title,
    description: getIndexableRouteSeo('/collections/sherwani-for-groom').description,
    h1: getIndexableRouteSeo('/collections/sherwani-for-groom').h1,
    content: `<p>This collection requires current catalog evidence for both a sherwani garment and a groom role. Compare the selected product's fabric wording, work, closures, included garments, measurements, selected size, fulfillment classification and current availability.</p>
      <h2>Confirm Every Included Garment and Accessory</h2>
      <p>A groom sherwani does not automatically include a kurta, churidar, pajama, stole, turban or footwear. Treat only the pieces expressly stated on the exact listing as included with the order.</p>
      <h3>Plan Measurements and Wedding Timing</h3>
      <p>Use the <a href="/sizing-measurements-guide">measurement guide</a>, confirm product-level processing and then review <a href="/shipping">shipping and event-date planning</a>. Processing and carrier transit are separate, and delivery by a fixed date is not guaranteed.</p>`,
  },
  {
    path: '/collections/party-wear-lehengas',
    commercialLanding: 'party-wear-lehengas',
    title: getIndexableRouteSeo('/collections/party-wear-lehengas').title,
    description: getIndexableRouteSeo('/collections/party-wear-lehengas').description,
    h1: getIndexableRouteSeo('/collections/party-wear-lehengas').h1,
    content: `<p>Browse current party-wear lehengas for receptions, festive events and celebrations. Available designs can differ in silhouette, color, fabric, work, included choli or dupatta pieces, size options and availability.</p>
      <h2>Compare Party-Wear Lehenga Details Before Ordering</h2>
      <p>Use the product grid to compare currently listed styles, then open the selected product page to confirm its supplied fabric, embroidery or work, included pieces, measurements and available option. Do not assume construction or package contents from the category alone.</p>
      <h3>Plan for a Reception or Festive Event</h3>
      <p>For a time-sensitive event, review the selected listing and <a href="/shipping">shipping information for supported destinations</a> before ordering. Use the <a href="/size-guide">size guide</a> and browse <a href="/lehengas">all current lehengas</a> to compare styles.</p>
      <p>Rates vary by destination; checkout is the final source of truth.</p>`,
  },
  {
    path: '/collections/wedding-sarees',
    commercialLanding: 'wedding-sarees',
    title: getIndexableRouteSeo('/collections/wedding-sarees').title,
    description: getIndexableRouteSeo('/collections/wedding-sarees').description,
    h1: getIndexableRouteSeo('/collections/wedding-sarees').h1,
    content: `<p>Browse current wedding sarees for ceremonies, receptions and family celebrations. Each listing has its own supplied fabric, weave or work, blouse details, dimensions, price and availability, so compare the exact product page before placing an event-critical order.</p>
      <h2>Compare Wedding Saree Details Before Ordering</h2>
      <p>Use the current product grid to compare wedding and bridal sarees, then verify the selected listing’s fabric wording, blouse material or blouse details, available option and current availability. A category label does not confirm that every saree has the same construction or included pieces.</p>
      <h3>Plan Size and Delivery for a Wedding Event</h3>
      <p>Read the <a href="/size-guide">size guide</a> and the selected product details before ordering for a fixed date. Review <a href="/shipping">shipping information for supported destinations</a> and browse <a href="/sarees">all current sarees</a> for additional comparison.</p>
      <p>Rates vary by destination; checkout is the final source of truth.</p>`,
  },
  {
    path: '/collections/banarasi-sarees',
    commercialLanding: 'banarasi-sarees',
    title: getIndexableRouteSeo('/collections/banarasi-sarees').title,
    description: getIndexableRouteSeo('/collections/banarasi-sarees').description,
    h1: getIndexableRouteSeo('/collections/banarasi-sarees').h1,
    content: `<p>This collection is limited to current saree listings whose title, product type or tags explicitly identify Banarasi fabric or styling. The collection label does not independently certify fiber composition, weaving method or geographic origin; use the exact product record for those facts.</p>
      <h2>Verify Fabric, Weave and Blouse Details</h2>
      <p>Compare the stated fabric wording, zari or other work, saree dimensions, border, pallu and blouse information. Do not assume pure silk, hand weaving, a stitched blouse or any other construction detail unless the selected listing expressly states it.</p>
      <h3>Plan Draping, Processing and Transit</h3>
      <p>Review the selected option and <a href="/sizing-measurements-guide">measurement guide</a>, then check <a href="/shipping">shipping rates and planning for supported destinations</a>. Processing occurs before carrier transit, and delivery by a fixed event date is not guaranteed.</p>`,
  },
  {
    path: '/collections/designer-sarees',
    commercialLanding: 'designer-sarees',
    title: getIndexableRouteSeo('/collections/designer-sarees').title,
    description: getIndexableRouteSeo('/collections/designer-sarees').description,
    h1: getIndexableRouteSeo('/collections/designer-sarees').h1,
    content: `<p>Browse current designer saree listings for receptions, parties and celebrations. The word “designer” describes a category or style label; it does not by itself confirm a particular maker, fabric, handwork method or included piece. Use the exact product page as the source of truth.</p>
      <h2>Compare Designer Saree Fabric, Work and Blouse Details</h2>
      <p>Use the product grid to compare currently listed colors, stated fabric, embroidery or work, price and available options. Open the selected listing to verify its blouse details, dimensions, included pieces and current availability before ordering.</p>
      <h3>Plan for a Reception or Celebration</h3>
      <p>For a fixed event date, review the selected listing and <a href="/shipping">shipping information for supported destinations</a> before ordering. Use the <a href="/size-guide">size guide</a> and browse <a href="/sarees">all current sarees</a> to compare styles.</p>
      <p>Rates vary by destination; checkout is the final source of truth.</p>`,
  },
  {
    path: '/size-guide',
    title: 'Indian Clothing Size Guide — Compare Product Measurements | LuxeMia',
    description: 'Choose Indian clothing sizes online by comparing your current body measurements with the exact LuxeMia product listing. Free printable measurement worksheet included.',
    h1: 'Indian Clothing Size Guide',
    content: '<p>Indian clothing does not follow one reliable universal conversion. Take current body measurements, then compare every relevant number with the size, stitching and construction details on the exact product page.</p><p><a href="/sizing-measurements-guide">Use the printable measurement worksheet</a> and contact LuxeMia before ordering if the listing is unclear.</p>',
  },
  {
    path: '/sizing-measurements-guide',
    title: 'Indian Clothing Measurement Guide & Printable Worksheet | LuxeMia',
    description: 'Measure for a saree blouse, lehenga, salwar suit, kurta or sherwani with a free printable worksheet. Compare your measurements with the exact product listing before ordering.',
    h1: 'Indian Clothing Measurement Guide',
    schemas: [MEASUREMENT_HOW_TO_SCHEMA],
    content: `<p>Record the measurements commonly requested for saree blouses, lehengas, suits, kurtas and sherwanis, then compare them with the exact product listing.</p>
      <h2>How do I take body measurements for Indian clothing?</h2>
      <p>Use a soft tape, wear the undergarments and shoes planned for the outfit, and record each measurement twice.</p>
      <ol>
        <li><strong>Measure your bust:</strong> Wrap the tape around the fullest part of your bust and keep it level across your back.</li>
        <li><strong>Measure your waist:</strong> Measure around your natural waist without pulling the tape tight.</li>
        <li><strong>Measure your hips:</strong> Stand with your feet together and measure around the fullest part of your hips.</li>
        <li><strong>Measure the garment length:</strong> Measure to the desired hem while wearing the shoes planned for a floor-length outfit.</li>
        <li><strong>Measure sleeves:</strong> Record sleeve length from the shoulder and the arm circumference where the sleeve will end.</li>
      </ol>
      <h2>How to measure for an Indian saree blouse</h2>
      <p>Wear the undergarment you plan to use with the blouse, keep the tape level, and record your actual body measurements without adding ease. Compare the results with the exact product listing; this guide does not mean stitching or tailoring is included.</p>
      <ol>
        <li><strong>Bust:</strong> Measure around the fullest part of the bust with the tape level across the back.</li>
        <li><strong>Underbust:</strong> Measure directly below the bust where the blouse band will sit.</li>
        <li><strong>Shoulder:</strong> Measure across the back from one shoulder edge to the other.</li>
        <li><strong>Blouse length:</strong> Measure from the top of the shoulder to the preferred blouse hem.</li>
        <li><strong>Armhole:</strong> Wrap the tape around the shoulder and underarm while the arm rests naturally.</li>
        <li><strong>Sleeve length:</strong> Measure from the shoulder point to the preferred sleeve end.</li>
        <li><strong>Upper-arm circumference:</strong> Measure around the fullest part of the relaxed upper arm without pulling the tape tight.</li>
      </ol>`,
  },
  {
    path: '/care-guide',
    title: 'Indian Clothing Care Guide — Read the Garment Label First | LuxeMia',
    description: 'Care for sarees, lehengas, suits and embellished Indian clothing without one-size-fits-all washing claims. Start with the exact label and product instructions.',
    h1: 'Indian Clothing Care Guide',
    content: '<p>Fabric names alone do not reveal every fiber, dye, lining, adhesive or embellishment. Begin with the care label and exact product instructions.</p><p>If instructions are missing or conflict, ask a qualified cleaner to inspect the garment before treatment. Store items clean and completely dry, away from direct light, heat and damp.</p>',
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions | LuxeMia',
    description: 'Find answers to common questions about LuxeMia shipping, final-sale terms, covered order issues, cancellations, sizing, product details and payment.',
    h1: 'Frequently Asked Questions',
    schemas: [FAQ_PAGE_SCHEMA],
    content: `<p>Find answers to common questions about LuxeMia orders, shipping, final-sale terms, covered order issues, sizing, product details and payment.</p>
      <h2>Where does LuxeMia ship?</h2>
      <p>LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Rates vary by destination; review the <a href="/shipping">destination-specific rates</a> and confirm the final amount at checkout.</p>
      <h2>How long does LuxeMia shipping take?</h2>
      <p>When tracking is issued, carrier scans can appear after label creation. Carrier transit time begins after dispatch.</p>
      <h2>How should I choose a LuxeMia size?</h2>
      <p>Take current body measurements and compare them with the size options and details on the exact product page. Contact LuxeMia before ordering if the listing is unclear.</p>
      <h2>What is LuxeMia’s return policy?</h2>
      <p>Change-of-mind purchases are final sale. Damage, defects, material misdescription, an incorrect item, or missing pieces should be reported promptly—preferably within 48 hours—with available photos and, when available, unboxing evidence. A missing video does not by itself remove rights that cannot legally be excluded.</p>
      <h2>Can I cancel a LuxeMia order?</h2>
      <p>${CANCELLATION_POLICY_ANSWER} Email hello@luxemia.shop immediately with your order number.</p>
`,
  },
  {
    path: '/shipping',
    title: 'Shipping Policy & International Rates | LuxeMia',
    description: 'Review tracked shipping rates for seven countries, plus processing, carrier transit, customs, duties, tracking and event-date guidance.',
    h1: 'Shipping Policy & International Rates',
    content: `
      <p>LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius. Processing time happens before carrier transit, and checkout shows the final available service and converted amount where supported.</p>
      <h2>Standard shipping rates</h2>
      <h3><a href="/shipping/united-states">United States shipping</a></h3>
      <ul><li>$14.99 below $199</li><li>Free standard shipping at $199 and above</li></ul>
      <h3>Canada and the United Kingdom</h3>
      <p><a href="/shipping/canada">Canada shipping details</a> · <a href="/shipping/united-kingdom">United Kingdom shipping details</a></p>
      <ul><li>$24.99 below $299</li><li>Free standard shipping at $299 and above</li></ul>
      <h3>Australia and New Zealand</h3>
      <p><a href="/shipping/australia">Australia shipping details</a></p>
      <ul><li>$29.99 below $349</li><li>Free standard shipping at $349 and above</li></ul>
      <h3>South Africa</h3><p>$49.99 per order.</p>
      <h3>Mauritius</h3><p>$59.99 per order.</p>
      <h2>Processing and carrier transit</h2>
      <p>Processing is the time before dispatch. Carrier transit begins after the parcel is accepted by the carrier. Review the exact product page for published processing information and contact LuxeMia before ordering for a fixed event date.</p>
      <h2>Carriers, consolidation and express service</h2>
      <p>LuxeMia may route a parcel through DHL, FedEx, UPS, Aramex or another qualified service based on destination, weight, dimensions, customs requirements and cost. Multi-item orders may be consolidated. Express and split-shipment service require a confirmed quote before ordering.</p>
      <h2>Customs and duties</h2>
      <p>Orders outside the United States may incur duties, taxes, brokerage or carrier fees unless checkout or a written quote explicitly states that they are included.</p>
      <h2>Before ordering</h2>
      <p><a href="/shop-by-fulfillment">Compare fulfillment types</a>, read the <a href="/returns">returns and covered-order-issue policy</a>, or <a href="/us-support">contact LuxeMia support</a> when a timing, sizing or destination detail is important.</p>
    `,
  },
  {
    path: '/ready-to-ship',
    category: 'ready-to-ship',
    title: 'Ready-to-Ship Indian Ethnic Wear | LuxeMia',
    description: 'Browse products whose current catalog record explicitly identifies ready-to-ship status. Confirm the selected variant, processing information and destination before ordering.',
    h1: 'Ready-to-Ship Indian Ethnic Wear',
    content: `
      <p>This page includes only currently purchasable products whose catalog record explicitly identifies ready-to-ship status through a supported tag or positive ships-within value. Ready to ship describes the product's fulfillment classification; it does not promise same-day dispatch or event-date delivery.</p>
      <h2>Positive catalog evidence</h2>
      <p>A product must carry an explicit ready-to-ship tag or a positive product-level ships-within value, have an available variant, and not be classified as Made to Order. Sale availability by itself is not evidence of stocked fulfillment.</p>
      <h2>Processing and carrier transit are separate</h2>
      <p>Order processing happens before dispatch. Carrier transit begins after the parcel is accepted by the carrier. Confirm the selected size, included pieces and any custom option before ordering for a fixed event date.</p>
      <h2>Shipping rates and timing</h2>
      <p><a href="/shipping">View route-based rates</a> for the United States, Canada, United Kingdom, Australia, New Zealand, South Africa and Mauritius.</p>
    `,
  },
  {
    path: '/pages/shipping-customs',
    title: 'International Shipping, Duties & Customs | LuxeMia',
    description: 'Review international shipping, duties, customs, brokerage and tracking guidance for all seven LuxeMia destination countries.',
    h1: 'International Shipping, Duties & Customs',
    content: `
      <p>Tracked shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius.</p>
      <h2>Duties, taxes and brokerage</h2>
      <p>International orders may be assessed customs duties, import taxes, value-added tax, brokerage or carrier processing fees. These charges are the customer’s responsibility unless checkout or a written LuxeMia quote explicitly states that they are included.</p>
      <h2>Carrier routing</h2>
      <p>LuxeMia may compare qualified carriers and consolidation services by destination, parcel weight, dimensions, customs requirements and cost. A standard rate does not guarantee a particular carrier.</p>
      <h2>Processing and delivery</h2>
      <p>Processing time occurs before dispatch. Carrier transit begins after acceptance by the carrier. Delivery estimates are not guarantees unless LuxeMia confirms a guaranteed date in writing.</p>
      <h2>Questions?</h2>
      <p>Contact <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> before ordering if a customs, timing or checkout detail is unclear, or review the <a href="/shipping">Shipping Policy</a>.</p>
    `,
  },
  {
    path: '/returns',
    title: 'Returns, Refunds & Cancellations | LuxeMia',
    description: 'Review LuxeMia’s change-of-mind final-sale terms, covered order-issue evidence guidance, mandatory consumer rights and cancellation terms.',
    h1: 'Returns, Refunds & Cancellations',
    content: `<p>Change-of-mind purchases are final sale. Damage, defects, material misdescription, an incorrect item, or missing pieces should be reported promptly—preferably within 48 hours—with available photos and, when available, unboxing evidence. A missing video does not by itself remove rights that cannot legally be excluded.</p><h2>Order cancellations</h2><p>${CANCELLATION_POLICY_ANSWER} Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with the order number.</p>`,
  },
  {
    path: '/contact',
    title: 'Contact Us | LuxeMia',
    description: 'Contact LuxeMia with questions about orders, sizing or a product listing. Reach online support by email, phone, WhatsApp or the contact form.',
    h1: 'Contact Us',
    content: `
      <p>Have questions about an order, sizing or a product listing? Contact LuxeMia before ordering when an important detail is unclear. Support requests are reviewed through the online queue; response times vary and same-day replies are not guaranteed.</p>
      <h2>Support channels</h2>
      <p>Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a>, call <a href="tel:+12153419990">+1 215-341-9990</a>, send a <a href="https://wa.me/12153419990">WhatsApp message</a>, or use the contact form. Do not send payment-card details through these channels.</p>
      <h2>What to include</h2>
      <p>For product help, include the product link, selected option, destination and the exact fact you need confirmed. For an order issue, include the order number and a concise description. Available photos or unboxing evidence can help with damage, defect, incorrect-item or missing-piece review, but a missing video does not by itself remove rights that cannot legally be excluded.</p>
      <h2>Before a fixed event date</h2>
      <p>Support can clarify published processing and shipping information but cannot guarantee an event-date delivery unless that guarantee is expressly confirmed for the order.</p>
      <p><a href="/us-support">Support guidance</a> · <a href="/sizing-measurements-guide">Sizing and measurements</a> · <a href="/shipping">Shipping</a> · <a href="/returns">Returns and covered issues</a> · <a href="/privacy">Privacy choices</a></p>
    `,
  },
  // --- Additional routes previously missing from prerender ---
  {
    path: '/lookbook',
    title: 'Lookbook — Current LuxeMia Product Groupings',
    description: 'Browse current LuxeMia products grouped by configured wedding, festive and occasion-wear listing tags, then verify each item on its product page.',
    h1: 'LuxeMia Lookbook',
    content: `
      <p>The lookbook groups current LuxeMia listings by configured product tags. Sections appear only when the Storefront API returns matching products; a section label is a browsing theme, not proof that every item is suitable for every event.</p>
      <h2>How products appear here</h2>
      <p>Wedding Season uses current lehenga and sherwani tag matches. Eid Collection uses current sharara and palazzo tag matches. Festive Favorites uses current salwar, anarkali and lehenga tag matches. His &amp; Hers uses current kurta-pajama, jodhpuri and menswear tag matches.</p>
      <h2>Verify before choosing</h2>
      <p>Open the individual product page to confirm the exact material wording, included pieces, sizes, price, selected-variant availability and processing information. Confirm event expectations with the host when relevant.</p>
    `,
  },
  {
    path: '/about',
    title: 'About LuxeMia — Indian Ethnic Wear Online',
    description: 'About LuxeMia, an online-only Indian ethnic wear store serving shoppers in seven countries with product-specific information and online support.',
    h1: 'About LuxeMia',
    content: `
      <p>LuxeMia is an online-only Indian ethnic wear store serving the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius. There is no public walk-in showroom; current products, options, availability and prices are shown online.</p>
      <h2>How product facts are handled</h2>
      <p>The exact product page is the source of truth for stated materials, included pieces, stitching status, measurements, selectable variants, customization, price, availability and processing. A general fabric name is not presented as an exact fiber composition unless the product record supports it, and missing details are not guessed from photographs or category labels.</p>
      <h2>Fulfillment and event planning</h2>
      <p>Ready-to-ship, made-to-order and customizable products follow different pre-dispatch paths. Processing occurs before carrier transit, and availability to buy does not itself prove immediate dispatch. Support can help locate published details but cannot promise delivery for an event date when checkout or the carrier does not provide that guarantee.</p>
      <h2>Support and standards</h2>
      <p>Online support is available at <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a>, <a href="tel:+12153419990">+1 215-341-9990</a>, WhatsApp and the contact form. Requests use an online queue, so response times vary.</p>
      <p><a href="/editorial-policy">Editorial and product-fact policy</a> · <a href="/review-policy">Review safeguards</a> · <a href="/privacy">Privacy choices</a> · <a href="/terms">Terms</a> · <a href="/us-support">Customer support</a></p>
    `,
  },

  {
    path: '/new-arrivals',
    category: 'all',
    title: 'New Arrivals — Latest Indian Ethnic Wear Collection | LuxeMia',
    description: "Browse products added to LuxeMia's online catalog during the past 30 days. Review each listing for exact details, availability and destination-specific shipping.",
    h1: 'New Arrivals',
    content: `
      <p>Browse recently added Indian ethnic wear, including lehengas, sarees, sharara sets, salwar suits, menswear, and jewelry with shipping to addresses in the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius.</p>
      <h2>What is new at LuxeMia?</h2>
      <p>This collection brings together LuxeMia's latest wedding, reception, festival, and special-occasion styles so shoppers can find newly added pieces in one place.</p>
      <p>Review the <a href="/shipping">destination-specific shipping rates</a>; checkout is the final source of truth. When tracking is issued, carrier scans can appear after label creation.</p>
    `,
  },
  {
    path: '/indowestern',
    category: 'indowestern',
    title: 'Indo-Western Collection — Fusion Ethnic Wear | LuxeMia',
    description: 'Shop Indo-Western fusion wear at LuxeMia, including modern ethnic suits, fusion lehengas and contemporary Indian outfits, with shipping to supported destinations.',
    h1: 'Indo-Western Collection',
    content: `
      <p>Where tradition meets modernity. Explore our Indo-Western collection featuring fusion silhouettes, contemporary cuts, and ethnic embellishments for the modern woman.</p>
      <h2>Fusion Style</h2>
      <p>Our Indo-Western collection blends the elegance of Indian craftsmanship with contemporary global fashion. Think asymmetrical hemlines, cape-style dupattas, dhoti pants paired with crop tops, and jacket-style anarkalis.</p>
      <p>Compare Indo-Western dresses and fusion wedding-guest outfits for receptions, sangeet, mehendi, and office Diwali parties. Open the exact listing for its fabric, embellishment, included pieces, sizes and availability, then review shipping for the destination country.</p>
    `,
  },
  {
    path: '/nri',
    title: 'Indian Ethnic Wear Online for U.S. Shoppers | LuxeMia',
    description: 'Shop Indian ethnic wear online for delivery to United States addresses. Compare exact product details, sizing and availability. Free U.S. standard shipping at $199 and above.',
    h1: 'Indian Ethnic Wear Online for U.S. Shoppers',
    content: `
      <p>Browse lehengas, sarees, salwar kameez, menswear and jewelry available online for delivery to United States addresses.</p>
      <h2>Shipping to the United States</h2>
      <p>Shipping is free at $199 and above and costs $14.99 below $199. When tracking is issued, carrier scans can appear after label creation. Review each product page for exact sizing, tailoring options and availability.</p>
    `,
  },
  {
    path: '/indian-ethnic-wear-usa',
    title: 'Indian Ethnic Wear Online in the USA | LuxeMia',
    description: 'Shop lehengas, sarees, salwar kameez, menswear and jewelry online for U.S. delivery. U.S. standard shipping is free at $199 and above and $14.99 below $199. Tracking follows dispatch.',
    h1: 'Indian Ethnic Wear Online in the USA',
    content: `
      <p>LuxeMia is an online Indian ethnic wear store serving shoppers with United States delivery addresses.</p>
      <h2>United States Shipping</h2>
      <p>Shipping is free at $199 and above and costs $14.99 below $199. When tracking is issued, carrier scans can appear after label creation. Duties, taxes or carrier processing fees may apply unless checkout explicitly states otherwise.</p>
      <h2>Shop by Category</h2>
      <p>Browse <a href="/lehengas">lehengas</a>, <a href="/sarees">sarees</a>, <a href="/suits">salwar kameez</a>, <a href="/menswear">menswear</a> and <a href="/jewelry">jewelry</a>. Review each listing for exact product details, sizing and availability.</p>
    `,
  },


  {
    path: '/collections/diwali-outfits',
    category: 'occasion:diwali',
    title: 'Diwali Outfits — Current Festive Listings | LuxeMia',
    description: 'Browse currently available LuxeMia products explicitly marked for Diwali or festive occasions. Review exact product details and destination-specific shipping.',
    h1: 'Diwali Outfits',
    content: `
      <p>This collection shows currently available products whose catalog title, product type, or tags explicitly mention Diwali, festive, or festival.</p>
      <h2>How to Choose</h2>
      <p>Use the guidance for your specific gathering, family, or community because customs and dress expectations vary. Open the exact listing to confirm fabric, work, included pieces, size options, price, and availability.</p>
      <h2>Browse Related Categories</h2>
      <ul>
        <li><a href="/lehengas">Lehengas</a></li>
        <li><a href="/sarees">Sarees</a></li>
        <li><a href="/suits">Suits</a></li>
        <li><a href="/indowestern">Indo-Western</a></li>
      </ul>
      <p>Shipping is available to seven supported destination countries. Review the <a href="/shipping">destination-specific rates</a>. When tracking is issued, carrier scans can appear after label creation.</p>
    `,
  },
  {
    path: '/collections/wedding-guest-outfits',
    category: 'occasion:wedding-guest',
    title: 'Indian Wedding Guest Outfits — What to Wear to an Indian Wedding | LuxeMia',
    description: 'Browse currently available products explicitly marked for wedding guests, bridesmaids, sangeet, or receptions. Review exact listing details and destination-specific shipping.',
    h1: 'Indian Wedding Guest Outfits',
    content: `
      <p>This collection shows currently available products whose catalog title, product type, or tags explicitly mention a wedding-guest role, bridesmaid role, sangeet, or reception.</p>
      <h2>How to Choose</h2>
      <p>Use the invitation and host guidance for dress code, color, and formality because wedding customs vary. Open the exact listing to confirm fabric, work, included pieces, size options, price, and availability.</p>
      <h2>Browse Related Categories</h2>
      <ul>
        <li><a href="/lehengas">Lehengas</a></li>
        <li><a href="/sarees">Sarees</a></li>
        <li><a href="/suits">Suits</a></li>
        <li><a href="/collections/mehendi-outfits">Mehendi Outfits</a></li>
      </ul>
      <p>Shipping is available to seven supported destination countries. Review the <a href="/shipping">destination-specific rates</a>. When tracking is issued, carrier scans can appear after label creation.</p>
    `,
  },
  {
    path: '/collections/mehendi-outfits',
    category: 'occasion:mehendi',
    title: 'Mehendi Ceremony Outfits — Current Listings | LuxeMia',
    description: 'Browse currently available LuxeMia products explicitly marked for mehendi or mehndi. Review exact product details and destination-specific shipping.',
    h1: 'Mehendi Ceremony Outfits',
    content: `
      <p>This collection shows currently available products whose catalog title, product type, or tags explicitly mention mehendi or mehndi.</p>
      <h2>How to Choose</h2>
      <p>Use the invitation and host guidance for dress code, color, and formality because event formats vary. Open the exact listing to confirm fabric, work, included pieces, size options, price, and availability.</p>
      <ul>
        <li><a href="/lehengas">Lehengas</a></li>
        <li><a href="/suits">Suits</a></li>
        <li><a href="/collections/wedding-guest-outfits">Wedding Guest Outfits</a></li>
      </ul>
      <p>Shipping is available to seven supported destination countries. Review the <a href="/shipping">destination-specific rates</a>. When tracking is issued, carrier scans can appear after label creation.</p>
    `,
  },
  {
    path: '/collections/haldi-outfits',
    category: 'occasion:haldi',
    title: 'Haldi Ceremony Outfits — Current Listings | LuxeMia',
    description: 'Browse currently available LuxeMia products explicitly marked for haldi or turmeric. Review exact product details and destination-specific shipping.',
    h1: 'Haldi Ceremony Outfits',
    content: `
      <p>This collection shows currently available products whose catalog title, product type, or tags explicitly mention haldi or turmeric.</p>
      <h2>How to Choose</h2>
      <p>Use the invitation and host guidance for dress code, color, and formality because event formats vary. Open the exact listing to confirm fabric, work, included pieces, size options, price, and availability.</p>
      <ul>
        <li><a href="/lehengas">Lehengas</a></li>
        <li><a href="/suits">Suits</a></li>
        <li><a href="/collections/mehendi-outfits">Mehendi Outfits</a></li>
      </ul>
      <p>Shipping is available to seven supported destination countries. Review the <a href="/shipping">destination-specific rates</a>. When tracking is issued, carrier scans can appear after label creation.</p>
    `,
  },
  {
    path: '/collections/eid-outfits',
    category: 'occasion:eid',
    title: 'Eid Outfits — Current Listings | LuxeMia',
    description: 'Browse currently available LuxeMia products explicitly marked for Eid, Ramadan, or chikankari. Review exact product details and destination-specific shipping.',
    h1: 'Eid Outfits',
    content: `
      <p>This collection shows currently available products whose catalog title, product type, or tags explicitly mention Eid, Ramadan, or chikankari.</p>
      <h2>How to Choose</h2>
      <p>Use the guidance for your specific gathering, mosque, family, or community because dress expectations vary. Open the exact listing to confirm fabric, work, included pieces, size options, price, and availability.</p>
      <ul>
        <li><a href="/suits">Suits</a></li>
        <li><a href="/lehengas">Lehengas</a></li>
        <li><a href="/collections/wedding-guest-outfits">Wedding Guest Outfits</a></li>
      </ul>
      <p>Shipping is available to seven supported destination countries. Review the <a href="/shipping">destination-specific rates</a> and confirm timing before ordering for a fixed date.</p>
    `,
  },
  {
    path: '/collections/navratri-outfits',
    category: 'occasion:navratri',
    title: 'Navratri Outfits 2026 | Garba Styles | LuxeMia',
    description: 'Shop current Navratri outfits for Garba and Dandiya, including chaniya choli and festive styles. Compare exact listing details and shipping to seven supported countries.',
    h1: 'Navratri Outfits for Garba',
    content: `
      <p>Shop current Navratri lehenga, chaniya choli and festive styles for Garba and Dandiya events. This collection includes available products whose catalog details explicitly mention Navratri, Garba, chaniya, or dandiya.</p>
      <p>Referenced calendars list Navratri beginning Sunday, October 11, 2026. Confirm religious dates and event schedules with your temple or organizer because practices can vary by location and community.</p>
      <h2>Choose a Navratri Outfit</h2>
      <p>For Garba and Dandiya, compare skirt or garment length, closures, measurements, stitching status, included pieces, and embellishment placement. Open the exact listing to confirm fabric, work, size options, price, and availability.</p>
      <ul>
        <li><a href="/blog/navratri-9-day-color-guide-2026">Navratri 2026 Buying Guide</a></li>
        <li><a href="/lehengas">Shop Lehengas and Chaniya Choli</a></li>
        <li><a href="/suits">Shop Anarkali and Salwar Suits</a></li>
        <li><a href="/sizing-measurements-guide">Sizing and Measurement Guide</a></li>
      </ul>
      <p>LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. U.S. standard shipping is $14.99 below $199 and free at $199 and above. When tracking is issued, carrier scans can appear after label creation. First-time shoppers can use LUXE10 for 10% off with no minimum purchase requirement.</p>
      <p>Contact LuxeMia before ordering when your celebration date is fixed. Delivery by a particular event is not guaranteed.</p>
    `,
  },
  {
    path: '/collections/wedding-guest-lehengas',
    category: 'occasion:wedding-guest-lehengas',
    title: 'Wedding Guest Lehengas | Current Styles | LuxeMia',
    description: 'Browse orderable lehengas with explicit wedding-guest or bridesmaid evidence; expressly bridal listings are excluded. Verify every product detail.',
    h1: 'Wedding Guest Lehengas',
    content: '',
  },
  {
    path: '/collections/wedding-guest-kurta-sets',
    category: 'occasion:wedding-guest-kurta-sets',
    title: 'Wedding Guest Kurta Sets | Indian Menswear | LuxeMia',
    description: 'Browse orderable menswear with explicit kurta-set and wedding-guest catalog evidence. Verify included garments, measurements, variants and fulfillment.',
    h1: 'Wedding Guest Kurta Sets',
    content: '',
  },
  {
    path: '/collections/diwali-womenswear',
    category: 'occasion:diwali-womenswear',
    title: 'Diwali Womenswear | Sarees, Lehengas & Suits | LuxeMia',
    description: 'Browse orderable women’s outfits with explicit Diwali or festival evidence and a supported garment signal. Compare sizes, contents and fulfillment.',
    h1: 'Diwali Outfits for Women',
    content: '',
  },
  {
    path: '/collections/diwali-menswear',
    category: 'occasion:diwali-menswear',
    title: 'Diwali Menswear | Kurta & Indian Festive Styles | LuxeMia',
    description: 'Browse orderable menswear with explicit Diwali or festival evidence and a supported garment signal. Verify garments, measurements and fulfillment.',
    h1: 'Diwali Outfits for Men',
    content: '',
  },
  {
    path: '/collections/navratri-chaniya-choli',
    category: 'occasion:navratri-chaniya',
    title: 'Navratri Chaniya Choli | Current Styles | LuxeMia',
    description: 'Shop current Navratri chaniya choli and lehenga sets. Compare included pieces, fabric, work, measurements, stitching, price and availability.',
    h1: 'Navratri Chaniya Choli Online',
    content: `<p>This collection contains active lehenga, chaniya and choli listings whose current catalog information explicitly mentions Navratri or chaniya. Compare the selected product’s exact skirt, blouse or choli, dupatta, fabric, work, measurements, stitching status, price and availability before ordering for Garba or Dandiya.</p>
      <h2>Choose by shopping need</h2><p><a href="/collections/navratri-outfits">All Navratri outfits</a> · <a href="/collections/garba-outfits">Garba outfits</a> · <a href="/festive-wear">Festive wear</a></p>
      <h2>Compare before choosing</h2><p>Compare waist, bust, skirt length, closures, garment weight when supplied, dupatta security, embellishment placement and exact included pieces.</p>
      <h2>Guides and support</h2><p><a href="/blog/chaniya-choli-versus-lehenga">Chaniya choli versus lehenga</a> · <a href="/sizing-measurements-guide">Measurement guide</a> · <a href="/shipping">Shipping</a> · <a href="/returns">Returns</a> · <a href="/contact">Support</a></p>
      <h2>Frequently asked questions</h2><h3>Is every product a complete three-piece set?</h3><p>No. Verify the exact stated pieces on the product page.</p><h3>Is delivery by my event guaranteed?</h3><p>No. Confirm processing and transit separately before ordering.</p>`,
  },
  {
    path: '/collections/garba-outfits',
    category: 'occasion:garba',
    title: 'Garba Outfits | Dandiya Clothing | LuxeMia',
    description: 'Shop active Garba and Dandiya outfit listings. Compare movement, included pieces, fabric, work, measurements, stitching and availability.',
    h1: 'Garba and Dandiya Outfits Online',
    content: `<p>This collection contains active products whose current title, product type, or tags explicitly mention Garba or Dandiya. Choose for movement and venue conditions, then verify every included piece, measurement, closure, fabric, embellishment, stitching option, price and selected-variant availability on the exact product page.</p>
      <h2>Choose by shopping need</h2><p><a href="/collections/navratri-chaniya-choli">Navratri chaniya choli</a> · <a href="/collections/navratri-outfits">All Navratri outfits</a> · <a href="/collections/party-wear-lehengas">Festive lehengas</a></p>
      <h2>Compare before choosing</h2><p>For movement, compare hem length, waist security, sleeves, neckline, dupatta handling, embellishment placement and footwear.</p>
      <h2>Guides and support</h2><p><a href="/blog/navratri-9-day-color-guide-2026">Navratri buying guide</a> · <a href="/blog/ready-to-ship-versus-made-to-order">Fulfillment guide</a> · <a href="/shipping">Shipping</a> · <a href="/returns">Returns</a> · <a href="/contact">Support</a></p>
      <h2>Frequently asked questions</h2><h3>How are Garba products selected?</h3><p>The current catalog must explicitly mention Garba or Dandiya.</p><h3>Is delivery by my event guaranteed?</h3><p>No. Confirm processing and transit separately.</p>`,
  },
  {
    path: '/collections/groomsmen-outfits',
    category: 'occasion:groomsmen',
    title: 'Indian Groomsmen Outfits | Kurta & Sherwani | LuxeMia',
    description: 'Shop active menswear listings explicitly identified for groomsmen. Compare kurta, jacket and sherwani pieces, measurements and availability.',
    h1: 'Indian Groomsmen Outfits Online',
    content: `<p>This collection is limited to active menswear whose current catalog information explicitly identifies a groomsman or groomsmen use. Compare kurta sets, Nehru-style jacket sets, sherwanis, stated colors, included garments, chest and length measurements, fulfillment, price and availability before planning a coordinated group order.</p>
      <h2>Choose by shopping need</h2><p><a href="/menswear">All menswear</a> · <a href="/wedding-party-orders">Group-order support</a> · <a href="/shop-by-fulfillment/made-to-order">Made-to-order outfits</a></p>
      <h2>Compare before choosing</h2><p>Compare kurta sets, Nehru-style jacket sets and sherwanis by their exact garments, fabric wording, measurements and current selected-size availability.</p>
      <h2>Guides and support</h2><p><a href="/blog/sherwani-versus-kurta-set">Sherwani versus kurta set</a> · <a href="/sizing-measurements-guide">Measurement guide</a> · <a href="/shipping">Shipping</a> · <a href="/returns">Returns</a> · <a href="/contact">Support</a></p>
      <h2>Frequently asked questions</h2><h3>Are bridesmaid products included?</h3><p>No. Products need both a groomsmen signal and a menswear signal.</p><h3>Are matching group sizes guaranteed?</h3><p>No. Request a current quantity and size check before ordering.</p>`,
  },
  {
    path: '/collections/sangeet-outfits',
    category: 'occasion:sangeet',
    title: 'Sangeet Outfits | Indian Dance-Event Styles | LuxeMia',
    description: 'Shop active products explicitly identified for Sangeet. Compare movement, fabric, included pieces, measurements, fulfillment and availability.',
    h1: 'Sangeet Outfits Online',
    content: `<p>This collection contains active products whose current catalog information explicitly mentions Sangeet. Lehengas, shararas, sarees, kurta sets and Indo-Western outfits can suit different events; compare movement, secure draping, included pieces, measurements, fabric, work, fulfillment, price and selected-variant availability before ordering.</p>
      <h2>Choose by shopping need</h2><p><a href="/wedding-events">All wedding events</a> · <a href="/collections/party-wear-lehengas">Party-wear lehengas</a> · <a href="/collections/sharara-suits">Sharara suits</a> · <a href="/menswear">Menswear</a></p>
      <h2>Compare before choosing</h2><p>Compare lehengas, shararas, sarees and menswear by manageable hems, secure draping, exact set contents, measurements and current availability.</p>
      <h2>Guides and support</h2><p><a href="/blog/what-should-guests-wear-to-a-sangeet">Sangeet guide</a> · <a href="/blog/how-early-to-order-for-a-fixed-wedding-date">Ordering timeline</a> · <a href="/shipping">Shipping</a> · <a href="/returns">Returns</a> · <a href="/contact">Support</a></p>
      <h2>Frequently asked questions</h2><h3>How are Sangeet products selected?</h3><p>The current catalog must explicitly mention Sangeet.</p><h3>Is one silhouette required?</h3><p>No. Follow the host’s dress guidance and event format.</p>`,
  },
  {
    path: '/collections/reception-outfits',
    category: 'occasion:reception',
    title: 'Indian Reception Outfits | Guest & Party Wear | LuxeMia',
    description: 'Shop active products explicitly identified for receptions. Compare formality, fabric, work, included pieces, measurements, price and availability.',
    h1: 'Indian Reception Outfits Online',
    content: `<p>This collection contains active products whose current catalog information explicitly mentions a reception. Compare the host’s dress code with each listing’s silhouette, fabric wording, work, included pieces, measurements, fulfillment, price and selected-variant availability. Reception formality varies, so no single garment type is universally required.</p>
      <h2>Choose by shopping need</h2><p><a href="/wedding-events">All wedding events</a> · <a href="/collections/designer-sarees">Designer sarees</a> · <a href="/collections/party-wear-lehengas">Party-wear lehengas</a> · <a href="/collections/wedding-guest-outfits">Wedding guest outfits</a></p>
      <h2>Compare before choosing</h2><p>Compare sarees, lehengas, shararas and menswear by the invitation, venue, movement needs, exact product construction and current selected-size availability.</p>
      <h2>Guides and support</h2><p><a href="/blog/saree-versus-lehenga-for-a-wedding-guest">Saree versus lehenga</a> · <a href="/blog/how-early-to-order-for-a-fixed-wedding-date">Ordering timeline</a> · <a href="/shipping">Shipping</a> · <a href="/returns">Returns</a> · <a href="/contact">Support</a></p>
      <h2>Frequently asked questions</h2><h3>How are reception products selected?</h3><p>The current catalog must explicitly mention reception.</p><h3>Are reception outfits always black-tie?</h3><p>No. Follow the invitation and host guidance.</p>`,
  },
  {
    path: '/wedding-party-orders',
    title: 'Indian Wedding Party & Group Outfit Orders | LuxeMia',
    description: 'Coordinate Indian wedding outfits for bridesmaids, groomsmen and family groups. Tell LuxeMia your event date, palette, sizes and budget.',
    h1: 'Wedding Party & Group Orders',
    content: '<p>Coordinate Indian wedding outfits for bridesmaids, groomsmen and family groups across multiple sizes, colors and events. Send LuxeMia your wedding date, group size, palette and budget for personalized help.</p><h2>Current groomsmen inventory</h2><p><a href="/collections/groomsmen-outfits">Browse products explicitly identified for groomsmen</a>, then request a current size-and-quantity check for the group.</p>',
  },
  {
    path: '/style-quiz',
    title: 'Style Quiz — Filter Current Indian Outfits',
    description: 'Answer five preference questions to filter current LuxeMia products by silhouette and, when enough matches exist, budget.',
    h1: 'Style Quiz',
    content: '<p>This five-question shopping tool applies automated rules to current LuxeMia products. Product results use the selected silhouette and, when at least four products remain, the selected budget; otherwise the broader silhouette results are shown.</p><h2>What the result means</h2><p>The result is a browsing suggestion, not individualized styling, fit, cultural-suitability or event-date advice. Verify the exact product listing, measurements, included pieces, price, availability and processing before ordering.</p>',
    noIndex: true,
  },


  {
    path: '/privacy',
    title: 'Privacy Policy | LuxeMia',
    description: 'How LuxeMia handles storefront, checkout, support, consultation, email, review-program and optional analytics information, including analytics choices.',
    h1: 'Privacy Policy',
    content: `
      <p>Last reviewed September 2, 2026. This notice describes the information flows used at luxemia.shop. Merely using the site is not consent to optional analytics; Google Analytics remains off unless the visitor accepts it.</p>
      <h2>Information and purpose</h2>
      <p>Storefront, account and order interactions can involve contact, delivery, cart, transaction and support information. A consultation or support request can include measurements, budget, event date, free-text requirements and any photos or unboxing evidence a customer chooses to provide. LuxeMia uses the information to operate checkout, fulfill orders, answer requests, prevent abuse, meet legal obligations and honor communication choices.</p>
      <h2>Providers and disclosure</h2>
      <p>Relevant providers can include Shopify and checkout/payment services, Supabase for support or consultation processing, Resend for email, Vercel for hosting and logs, delivery carriers and customs participants, WhatsApp when that channel is chosen, and Google for optional Analytics after consent plus any future Customer Reviews badge or survey processing only under the verified conditions described below. Each provider processes information for its role and under its own terms.</p>
      <h2>Analytics and browser choices</h2>
      <p>Google Analytics is not loaded from the initial HTML and stays disabled when no choice exists or analytics is declined. Accept and decline are both available. The footer’s Cookie Settings control can withdraw analytics later; withdrawal disables future collection from the storefront and attempts to remove LuxeMia-domain analytics cookies.</p>
      <h2>Google Customer Reviews</h2>
      <p>LuxeMia does not operate or seed a separate on-site customer-review feed. The storefront does not currently request Google’s Customer Reviews rating-badge script. A badge-script request is not a claim that program enrollment, survey eligibility or a seller rating is currently active. A badge must not be enabled until program status is verified and its third-party data flow is covered by a specific, informed choice.</p>
      <p>The public LuxeMia return page does not trust order identifiers, email addresses, totals, countries or delivery dates supplied in its URL and does not send those values to Google or record a purchase from them. A Customer Reviews survey may be enabled only within Shopify’s protected post-purchase context when every required order field and an evidence-based delivery estimate are verified. If a required value is unavailable or cannot be verified, the survey must not render.</p>
      <p>If a survey is later verified and enabled, Google controls its optional survey, content rules, privacy handling and any aggregate rating. LuxeMia does not create, seed or rewrite those reviews. See the <a href="/review-policy">customer review safeguards page</a> for the storefront explanation.</p>
      <h2>Retention, international processing and requests</h2>
      <p>Records are retained only as reasonably needed for their purpose, provider operation, disputes, fraud prevention and applicable legal, tax, accounting or customs duties; there is no single promised period for every record. Providers and order participants can process information in other countries. Depending on location, rights can include access, correction, deletion, portability, restriction, objection, consent withdrawal and direct-marketing opt-out, subject to legal conditions and exceptions.</p>
      <h2>Security and contact</h2>
      <p>The storefront uses HTTPS, and payment-card entry occurs through Shopify-hosted checkout rather than LuxeMia support forms. No internet service can guarantee complete security. Email <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> with “Privacy request,” or use <a href="/contact">LuxeMia support</a>. See the <a href="/review-policy">review-program explanation</a>.</p>
    `,
  },
  {
    path: '/terms',
    title: 'Terms of Service | LuxeMia',
    description: 'LuxeMia terms for online orders, product information, fulfillment, shipping, cancellations, covered order issues and website use.',
    h1: 'Terms of Service',
    content: `
      <p>Last updated September 2, 2026. These terms apply to the LuxeMia online store. Review the exact product listing, checkout total, shipping policy and returns policy before ordering.</p>
      <h2>Product information</h2>
      <p>The exact product page is the source of truth for stated materials, included pieces, stitching status, measurements, selectable variants, customization, price and current availability. Photography and displays can affect apparent colour or texture, and facts not shown should not be assumed.</p>
      <h2>Orders, price and payment</h2>
      <p>Prices and shipping thresholds are in USD unless checkout expressly displays another currency. Shopify-hosted checkout shows the submitted cart, destination charges and available payment methods. An automated receipt does not override availability, payment review or a genuine catalog error.</p>
      <h2>Fulfillment and delivery</h2>
      <p>Ready-to-ship means the selected item is classified as stocked, while made-to-order production starts after confirmation and customizable applies only to options expressly offered. Processing occurs before carrier transit. No event-date delivery is guaranteed unless that guarantee is expressly confirmed for the order.</p>
      <h2>Cancellations, returns and covered issues</h2>
      <p>Change-of-mind purchases are final sale. Damage, defects, material misdescription, incorrect items and missing pieces use the covered-issue process. Report an issue promptly—preferably within 48 hours—with available evidence. A missing video does not by itself remove rights that cannot legally be excluded. Cancellation requests are not confirmed until LuxeMia accepts them, and fulfillment may begin before a request is reviewed.</p>
      <h2>Website content and privacy</h2>
      <p>LuxeMia owns or licenses its original site copy, branding and software, but product photographs, marks, descriptions and designs may belong to suppliers, brands or other rights holders. The <a href="/privacy">Privacy Policy</a> describes checkout, support, consultation, email, review and optional-analytics information.</p>
      <p><a href="/shipping">Shipping policy</a> · <a href="/returns">Returns and cancellations</a> · <a href="/editorial-policy">Editorial policy</a> · <a href="/review-policy">Review safeguards</a> · <a href="/contact">Contact LuxeMia</a></p>
    `,
  },
  {
    path: '/press',
    title: 'Press — LuxeMia in the Media | Indian Ethnic Wear Online',
    description: 'Contact LuxeMia for press, media, brand asset and partnership inquiries.',
    h1: 'Press',
    content: '<p>For press, media, brand asset or partnership inquiries, contact LuxeMia through the details on this page.</p>',
  },
  // --- Missing blog posts ---


















  {
    path: '/authors/luxemia-editorial-team',
    title: 'LuxeMia Editorial Team | Product & Shopping Guides',
    description: 'Meet the LuxeMia Editorial Team behind our product, sizing, care, shipping and occasion-shopping guides for shoppers in supported countries.',
    h1: 'LuxeMia Editorial Team',
    content: '<p>The LuxeMia Editorial Team creates practical guides for shopping Indian ethnic wear online. Articles cover garment terminology, sizing, care, shipping and occasion planning for shoppers in LuxeMia’s supported countries.</p><p>Product and policy details are reviewed by the LuxeMia team. Time-sensitive customs and delivery guidance should be confirmed with the relevant carrier or government authority.</p>',
  },












  {
    path: '/404',
    title: 'Page Not Found | LuxeMia',
    description: 'The page you are looking for could not be found.',
    h1: 'Page Not Found',
    content: '<p>The page you are looking for may have been removed, had its name changed, or is temporarily unavailable. Please visit our <a href="/">homepage</a> to browse our collection.</p>',
    noIndex: true,
  },
  {
    path: '/order-confirmation',
    title: 'Order Confirmation | LuxeMia',
    description: 'LuxeMia order confirmation.',
    h1: 'Check Your Shopify Order Status',
    content: '<p>This public page cannot verify an order. Use Shopify\'s protected order-status page or, if Shopify sends one, its confirmation message for verified details. When tracking is issued, carrier scans can appear after label creation.</p>',
    noIndex: true,
  },

























];

/**
 * Generate pre-rendered HTML for a route by injecting SEO content
 * into the index.html template.
 *
 * allShopifyProducts is a Map<handle, productNode> fetched once at the start
 * of main(). It is only consumed by collection routes (route.category set) —
 * product detail routes already receive their product via route.product.
 */
function generateHtml(template, route, allShopifyProducts) {
  let html = template;
  const seoTitle = clampTitle(route.title);
  const seoDescription = clampDescription(route.description);
  const routeContent = normalizeInternalNavigationHtml(route.content);
  const collectionStandard = route.collectionStandard;

  // Replace title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(seoTitle)}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(seoDescription)}" />`
  );

  // Handle noIndex for 404 pages
  if (route.noIndex) {
    html = html.replace(
      /<meta name="robots" content="[^"]*" \/>/,
      `<meta name="robots" content="noindex, nofollow" />`
    );
    // Also remove canonical for noIndex pages
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      ''
    );
    // Also remove hreflang tags for noIndex pages
    html = html.replace(
      /<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/,
      ''
    );
    html = html.replace(
      /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/,
      ''
    );
  } else {
    // Replace canonical URL
    const canonical = route.path === '/' ? SITE_URL + '/' : SITE_URL + route.path;
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${canonical}" />`
    );

    // Replace OG tags
    html = html.replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${canonical}" />`
    );

    // Replace hreflang alternate tags to point to the route's canonical URL
    html = html.replace(
      /<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/,
      `<link rel="alternate" hreflang="en" href="${canonical}" />`
    );
    html = html.replace(
      /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/,
      `<link rel="alternate" hreflang="x-default" href="${canonical}" />`
    );
  }

  // Replace OG title and description
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(seoTitle)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(seoDescription)}" />`
  );
  const openGraphType = route.path.startsWith('/product/')
    ? 'product'
    : route.category
      ? 'collection'
      : null;
  if (openGraphType) {
    html = html.replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      `<meta property="og:type" content="${openGraphType}" />`
    );
  }

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(seoTitle)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeHtml(seoDescription)}" />`
  );

  // Every prerendered route gets one route-specific WebPage schema. The global
  // Organization/OnlineStore/WebSite graph remains in index.html; React removes
  // this route-scoped copy before Helmet mounts the hydrated equivalent.
  if (!route.noIndex) {
    const canonical = route.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: seoTitle,
      description: seoDescription,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'en',
    };
    html = html.replace(
      '</head>',
      `    <script type="application/ld+json" data-prerender-schema>${JSON.stringify(webPageSchema)}</script>\n</head>`
    );
  }

  if (Array.isArray(route.schemas) && route.schemas.length > 0) {
    const routeSchemas = route.schemas
      .map((schema) => `<script type="application/ld+json" data-prerender-schema>${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`)
      .join('\n    ');
    html = html.replace('</head>', `    ${routeSchemas}\n</head>`);
  }

  // Every indexable collection route needs a BreadcrumbList in the initial
  // HTML, including root categories and semantic fulfillment/occasion hubs.
  if (!route.noIndex && collectionStandard) {
    const collectionCanonical = `${SITE_URL}${route.path}`;
    const parentName = route.path.startsWith('/shop-by-fulfillment/')
      ? 'Shop by Fulfillment'
      : 'Collections';
    const parentUrl = route.path.startsWith('/shop-by-fulfillment/')
      ? `${SITE_URL}/shop-by-fulfillment`
      : `${SITE_URL}/collections`;
    const isParentRoute = route.path === '/collections' || route.path === '/shop-by-fulfillment';
    const collectionBreadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${collectionCanonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        ...(!isParentRoute ? [{ '@type': 'ListItem', position: 2, name: parentName, item: parentUrl }] : []),
        { '@type': 'ListItem', position: isParentRoute ? 2 : 3, name: route.h1, item: collectionCanonical },
      ],
    };
    html = html.replace(
      '</head>',
      `    <script type="application/ld+json" data-prerender-schema>${JSON.stringify(collectionBreadcrumbSchema)}</script>\n</head>`
    );
  }

  // Inject structured data (JSON-LD) for product pages
  if (route.path.startsWith('/product/')) {
    const canonical = SITE_URL + route.path;
    const handle = route.path.slice('/product/'.length);

    // Product pages are generated only from the complete, current Shopify map.
    // A missing route product or an incomplete commerce record is a release
    // failure, never a signal to manufacture placeholder schema or visible facts.
    const live = route.product;
    if (!live || live.handle !== handle) {
      throw new Error(`[catalog-integrity] ${route.path} has no matching live Shopify product record.`);
    }
    const liveEvidence = getLiveProductPrerenderEvidence(live);
    const productImages = liveEvidence.images;
    const productDescription = liveEvidence.description.slice(0, 5000);
    const productVariant = (live.availableForSale === true
      ? liveEvidence.variants.find((variant) => variant.availableForSale === true)
      : undefined)
      || liveEvidence.variants[0];
    const productSku = productVariant?.sku || '';
    const productGtin = productVariant?.barcode || '';
    const productBrandSchema = generateProductBrandSchema(live?.vendor);
    const productItemCondition = getVerifiedItemCondition(live);
    const productGtinSchema = getGtinSchemaProperty(productGtin);
    const productAttributes = getListedProductAttributes(live);
    const productCategory = hasExplicitMadeToOrderEvidence(live)
      ? { label: 'Made-to-Order Indian Outfits', link: '/collections/customizable-indian-outfits', schemaCategory: 'Apparel & Accessories > Clothing' }
      : getProductCategoryInfo(live?.productType || '', live?.title || route.h1);

    // Product schema must mirror Merchant Center's product grouping. Google
    // recommends ProductGroup + hasVariant for a single page where customers
    // switch variants with query parameters. This preserves a direct, current
    // offer for every source-backed Shopify variant rather than exposing only
    // the initially selected option in static HTML.
    const schemaVariants = liveEvidence.variants;
    const productId = live?.id?.split('/').pop() || '';
    const productGroupId = (live?.handle || '').length <= 50
      ? (live?.handle || '')
      : (productId ? `p${productId}` : (live?.handle || ''));
    const offerForVariant = (variant, variantUrl) => ({
      '@type': 'Offer',
      '@id': `${variantUrl}#offer`,
      url: variantUrl,
      // Active price only; compare-at values never create unsupported sale windows.
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: `https://schema.org/${live.availableForSale === true && variant.availableForSale === true ? 'InStock' : 'OutOfStock'}`,
      ...(productItemCondition ? { itemCondition: productItemCondition } : {}),
      seller: { '@id': `${SITE_URL}/#organization` },
      merchantReturnLink: `${SITE_URL}/returns#merchant-return-policy`,
      shippingDetails: generateUsProductShippingDetails(productAttributes.shipsWithinDays),
    });
    const schemaVariantProduct = (variant) => {
      const variantId = variant?.id?.split('/').pop() || '';
      const selectedOptions = variant?.selectedOptions || [];
      const color = selectedOptions.find((option) => ['color', 'colour'].includes((option?.name || '').toLowerCase()))?.value || '';
      const size = selectedOptions.find((option) => isSizeOptionName(option?.name))?.value || '';
      const visibleOptions = selectedOptions
        .filter((option) => option?.value && (option?.name || '').toLowerCase() !== 'title' && option.value.toLowerCase() !== 'default title')
        .map((option) => option.value);
      const variantLabel = [...new Set(visibleOptions)].join(' / ');
      const variantUrl = getProductVariantUrl(canonical, variant);
      const variantImages = variant?.image?.url ? [forceJpegForGmc(variant.image.url)] : productImages;
      const variantSku = variant?.sku || '';
      const variantGtin = variant?.barcode || '';
      const variantGtinSchema = getGtinSchemaProperty(variantGtin);
      return {
        '@type': 'Product',
        '@id': `${variantUrl}#product`,
        isVariantOf: { '@id': `${canonical}#productgroup` },
        name: variantLabel ? `${route.h1} — ${variantLabel}` : route.h1,
        image: variantImages,
        description: productDescription,
        ...(variantSku ? { sku: variantSku } : {}),
        ...variantGtinSchema,
        url: variantUrl,
        ...(productBrandSchema ? { brand: productBrandSchema } : {}),
        ...(productCategory.schemaCategory ? { category: productCategory.schemaCategory } : {}),
        ...(color ? { color } : {}),
        ...(productAttributes.material ? { material: productAttributes.material } : {}),
        ...(size ? { size } : {}),
        offers: offerForVariant(variant, variantUrl),
      };
    };
    const emittedSchemaVariants = schemaVariants.map(schemaVariantProduct);
    const productVariantUrl = getProductVariantUrl(canonical, productVariant);
    const schemaVariesBy = [
      ...(emittedSchemaVariants.some((variant) => Boolean(variant.color)) ? ['https://schema.org/color'] : []),
      ...(emittedSchemaVariants.some((variant) => Boolean(variant.size)) ? ['https://schema.org/size'] : []),
    ];
    const productSchema = schemaVariants.length > 1
      ? {
          '@context': 'https://schema.org',
          '@type': 'ProductGroup',
          '@id': `${canonical}#productgroup`,
          name: route.h1,
          image: productImages,
          description: productDescription,
          url: canonical,
          ...(productBrandSchema ? { brand: productBrandSchema } : {}),
          ...(productCategory.schemaCategory ? { category: productCategory.schemaCategory } : {}),
          ...(productAttributes.material ? { material: productAttributes.material } : {}),
          ...(productGroupId ? { productGroupID: productGroupId } : {}),
          ...(schemaVariesBy.length > 0 ? { variesBy: schemaVariesBy } : {}),
          hasVariant: emittedSchemaVariants,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `${canonical}#product`,
          name: route.h1,
          image: productImages,
          description: productDescription,
          ...(productSku ? { sku: productSku } : {}),
          ...productGtinSchema,
          url: canonical,
          ...(productBrandSchema ? { brand: productBrandSchema } : {}),
          ...(productCategory.schemaCategory ? { category: productCategory.schemaCategory } : {}),
          ...(productAttributes.color ? { color: productAttributes.color } : {}),
          ...(productAttributes.material ? { material: productAttributes.material } : {}),
          ...(productAttributes.sizes.length > 0 ? { size: productAttributes.sizes } : {}),
          ...(productItemCondition ? { itemCondition: productItemCondition } : {}),
          offers: offerForVariant(productVariant, productVariantUrl),
        };

    // Breadcrumb schema for product pages
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: productCategory.label, item: SITE_URL + productCategory.link },
        { '@type': 'ListItem', position: 3, name: sanitizeProductTitle(live?.title || route.h1), item: canonical },
      ],
    };

    const productOgImage = productImages[0];
    html = html.replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${escapeHtml(productOgImage)}" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${escapeHtml(productOgImage)}" />`
    );

    const structuredDataScripts = `
    <script type="application/ld+json" data-prerender-schema>${JSON.stringify(productSchema)}</script>
    <script type="application/ld+json" data-prerender-schema>${JSON.stringify(breadcrumbSchema)}</script>`;

    // Inject before </head>
    html = html.replace('</head>', `${structuredDataScripts}\n</head>`);
  }

  // Blog routes need article-specific schema in the initial HTML. The author
  // is the real editorial team; individual credentials are not implied.
  if (route.blogPost) {
    const { publishedAt, updatedAt, factCheckedAt, sources = [], faqs = [] } = route.blogPost;
    const canonical = SITE_URL + route.path;
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${canonical}#article`,
      headline: route.h1,
      description: route.description,
      url: canonical,
      mainEntityOfPage: { '@id': `${canonical}#webpage` },
      datePublished: publishedAt,
      dateModified: updatedAt,
      author: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/authors/luxemia-editorial-team#editorial-team`,
        name: 'LuxeMia Editorial Team',
        url: `${SITE_URL}/authors/luxemia-editorial-team`,
      },
      publisher: { '@id': `${SITE_URL}/#organization` },
      citation: sources.map(source => source.url),
      isBasedOn: sources.map(source => ({
        '@type': 'CreativeWork',
        name: source.title,
        publisher: source.publisher,
        url: source.url,
      })),
    };
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: route.h1, item: canonical },
      ],
    };
    const faqSchema = faqs.length >= 4
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null;
    const reviewMeta = `
    <meta property="article:published_time" content="${escapeHtml(publishedAt)}" />
    <meta property="article:modified_time" content="${escapeHtml(updatedAt)}" />
    <meta name="last-reviewed" content="${escapeHtml(factCheckedAt)}" />`;
    const structuredData = [articleSchema, breadcrumbSchema, faqSchema]
      .filter(Boolean)
      .map((schema) => `<script type="application/ld+json" data-prerender-schema>${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`)
      .join('\n    ');
    html = html.replace('</head>', `${reviewMeta}\n    ${structuredData}\n</head>`);
  }

  // Inject SEO content into the body. This content is visible to search engine crawlers
  // and accessible to screen readers. JavaScript removes it once React has mounted
  // so regular users see only the React-rendered UI (no duplicate content).

  // For product pages with live Shopify data, generate rich visible content:
  // price, image, full description, product details, shipping info.
  // This is the key fix for Google's "thin content" / "crawled but not indexed" signal.
  let mainBodyContent;
  if (route.path.startsWith('/product/')) {
    const p = route.product;
    if (!p || p.handle !== route.path.slice('/product/'.length)) {
      throw new Error(`[catalog-integrity] ${route.path} cannot emit visible product HTML without its matching live Shopify record.`);
    }
    const liveEvidence = getLiveProductPrerenderEvidence(p);
    const initialProductPayload = buildInitialProductPayload(p);
    html = html.replace('</head>', `    <script>window.__INITIAL_PRODUCT_DATA__ = ${initialProductPayload};</script>\n</head>`);
    const hasMadeToOrderEvidence = hasExplicitMadeToOrderEvidence(p);
    const hasCustomColorEvidence = hasExplicitCustomColorEvidence(p);
    const hasCustomMeasurementEvidence = hasExplicitCustomMeasurementEvidence(p);
    const defaultVariant = (p.availableForSale === true
      ? liveEvidence.variants.find((variant) => variant.availableForSale === true)
      : undefined) || liveEvidence.variants[0];
    const price = defaultVariant.price.amount;
    const currency = defaultVariant.price.currencyCode;
    const comparePriceMoney = p.compareAtPriceRange?.maxVariantPrice;
    const isAvailable = liveEvidence.availableForSale;
    const images = p.images?.edges?.map(e => e.node) || [];
    const description = liveEvidence.description;
    const productType = (p.productType || '').trim();
    const brandName = normalizeBrand(p.vendor);
    const productAttributes = getListedProductAttributes(p);
    const styleReference = getVerifiedPrimaryStyleReference(p);
    const productCategory = hasMadeToOrderEvidence
      ? { label: 'Made-to-Order Indian Outfits', link: '/collections/customizable-indian-outfits', schemaCategory: 'Apparel & Accessories > Clothing' }
      : getProductCategoryInfo(productType, p.title || route.h1);

    let priceHtml = `<strong>${currency} ${parseFloat(price).toFixed(2)}</strong>`;
    if (isValidShopifyMoney(comparePriceMoney)
      && comparePriceMoney.currencyCode === currency
      && Number(comparePriceMoney.amount) > Number(price)) {
      priceHtml += ` <s style="color:#888">${currency} ${Number(comparePriceMoney.amount).toFixed(2)}</s>`;
    }

    // Category link and schema category use the same product classification.
    const categoryLink = productCategory.link;
    const categoryLabel = productCategory.label;
    const productGuide = categoryLink === '/lehengas'
      ? { href: '/blog/how-to-measure-for-a-lehenga-ordered-online', label: 'How to measure for a lehenga' }
      : categoryLink === '/sarees'
      ? { href: '/blog/saree-versus-lehenga-for-a-wedding-guest', label: 'Saree versus lehenga guide' }
      : categoryLink === '/menswear'
      ? { href: '/blog/sherwani-versus-kurta-set', label: 'Sherwani versus kurta guide' }
      : categoryLink === '/collections/customizable-indian-outfits'
      ? { href: '/blog/ready-to-ship-versus-made-to-order', label: 'Ready-to-ship versus made-to-order guide' }
      : { href: '/sizing-measurements-guide', label: 'Sizing and measurement guide' };

    const firstImage = images[0];
    const imgHtml = firstImage
      ? `<img src="${escapeHtml(forceJpegForGmc(firstImage.url))}" alt="${escapeHtml(firstImage.altText || route.h1)}" width="600" loading="lazy" style="max-width:100%;height:auto;display:block;margin:12px 0">`
      : '';

    const descHtml = description
      ? `<h2>Product Description</h2><p>${escapeHtml(description).slice(0, 2000)}</p>`
      : '';

    const fabricDetails = productAttributes.material
      || 'Review the product description for the fabric or material supplied with this listing.';
    const includedPieces = productAttributes.includedPieces;
    const sizingDetails = hasCustomMeasurementEvidence
      ? 'The current Shopify listing explicitly includes a custom-size or custom-measurement option. Contact LuxeMia before ordering to confirm the measurements required for this product.'
      : productAttributes.sizes.length > 0
      ? `Listed options: ${productAttributes.sizes.join(', ')}. Review the Size Guide before ordering.`
      : 'Available sizing varies by product. Review the options shown for this listing and the Size Guide before ordering.';
    const shippingEstimate = productAttributes.shipsWithinDays
      ? `Listing processing estimate: within ${productAttributes.shipsWithinDays} day${productAttributes.shipsWithinDays === 1 ? '' : 's'}. Carrier transit and delivery timing are separate.`
      : hasMadeToOrderEvidence
      ? 'The current Shopify listing identifies this product as made to order but does not supply a positive processing-day value. Confirm production time and carrier transit before ordering for a fixed date.'
      : 'Timing depends on the item and selected options. When tracking is issued, carrier scans can appear after label creation.';
    const detailRows = [
      `<div><dt>Fabric Details</dt><dd>${escapeHtml(fabricDetails)}</dd></div>`,
      includedPieces ? `<div><dt>Included Pieces</dt><dd>${escapeHtml(includedPieces)}</dd></div>` : '',
      `<div><dt>Sizing &amp; Chart</dt><dd>${escapeHtml(sizingDetails)}</dd></div>`,
      `<div><dt>Shipping Estimate</dt><dd>${escapeHtml(shippingEstimate)}</dd></div>`,
      productType ? `<div><dt>Type</dt><dd>${escapeHtml(productType)}</dd></div>` : '',
      styleReference ? `<div><dt>Style Reference</dt><dd>${escapeHtml(styleReference)}</dd></div>` : '',
      brandName ? `<div><dt>Brand</dt><dd>${escapeHtml(brandName)}</dd></div>` : '',
      productAttributes.color ? `<div><dt>Color</dt><dd>${escapeHtml(productAttributes.color)}</dd></div>` : '',
      `<div><dt>Availability</dt><dd>${isAvailable ? 'In Stock' : 'Currently Unavailable'}</dd></div>`,
      `<div><dt>Ships to</dt><dd>United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius</dd></div>`,
    ].filter(Boolean).join('\n        ');

    const sizeAnswer = hasCustomMeasurementEvidence
      ? 'The current Shopify listing explicitly includes a custom-size or custom-measurement option. Contact LuxeMia before ordering to confirm the measurements required for this product.'
      : productAttributes.sizes.length > 0
      ? `Available choices shown for this listing are ${escapeHtml(productAttributes.sizes.join(', '))}. Review the Size Guide before ordering.`
      : 'Any available size or tailoring choices are shown on this product page. Contact LuxeMia before ordering if an option is unclear.';
    const firstQuestion = productAttributes.jewelry
      ? `<h3>What is included with the ${escapeHtml(p.title || route.h1)}?</h3><p>The included pieces, finish, colors, and measurements are the ones stated in Product Details and shown in the product images. Contact LuxeMia before ordering if the set contents are unclear.</p>`
      : `<h3>What sizes are available?</h3><p>${sizeAnswer}</p>`;
    const careAnswer = productAttributes.care
      ? escapeHtml(productAttributes.care)
      : 'Product-specific care instructions were not supplied in the current listing. Ask LuxeMia before cleaning or treating this item.';
    const deliveryAnswer = hasMadeToOrderEvidence
      ? 'The current Shopify listing identifies this product as made to order. Confirm product-specific production time and carrier transit before ordering for a fixed date; no timing is promised unless the listing or LuxeMia supplies it for this product.'
      : productAttributes.jewelry
      ? 'Delivery timing depends on the item. When tracking is issued, carrier scans can appear after label creation. Shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius.'
      : 'Delivery timing depends on the item and any selected tailoring. When tracking is issued, carrier scans can appear after label creation. Shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius.';
    const productQuestionsHtml = `
      <h2>Product Questions</h2>
      ${firstQuestion}
      ${hasCustomColorEvidence ? `<h3>Does this product have a custom-color option?</h3><p>The current Shopify listing explicitly identifies a custom-color option. Contact LuxeMia with the product link and requested color before ordering so availability and the exact request can be confirmed. Other design changes are not promised unless confirmed in writing.</p>` : ''}
      <h3>How is this product shipped?</h3>
      <p>${deliveryAnswer}</p>
      <h3>What is the return policy?</h3>
      <p>Change-of-mind purchases are final sale. Damage, defects, material misdescription, an incorrect item, or missing pieces should be reported promptly—preferably within 48 hours—with available photos and, when available, unboxing evidence. A missing video does not by itself remove rights that cannot legally be excluded.</p>
      <h3>How should I care for this product?</h3>
      <p>${careAnswer}</p>`;
    const availableVariants = p.availableForSale === true
      ? liveEvidence.variants.filter((variant) => variant.availableForSale === true)
      : [];
    const purchaseOptionsHtml = availableVariants.length > 0
      ? `
      <h2>Choose an Available Variant</h2>
      <p>Each link opens that exact Shopify variant in the live product purchase controls.</p>
      <ul data-product-variant-purchase-links>
        ${availableVariants.map((variant, index) => {
          const numericVariantId = String(variant.id).split('/').pop();
          const variantUrl = getProductVariantUrl(`${SITE_URL}${route.path}`, variant);
          const variantLabel = getVisibleVariantLabel(variant, index);
          return `<li><a data-product-variant-cta="true" data-variant-id="${numericVariantId}" data-price="${escapeHtml(variant.price.amount)}" data-currency="${escapeHtml(variant.price.currencyCode)}" href="${escapeHtml(`${variantUrl}#product-purchase`)}">Choose ${escapeHtml(variantLabel)} to purchase — ${escapeHtml(variant.price.currencyCode)} ${Number(variant.price.amount).toFixed(2)}</a></li>`;
        }).join('\n        ')}
      </ul>`
      : `
      <h2>Purchase Availability</h2>
      <p>No Shopify variant for this product was available for purchase when this page was generated.</p>`;
    const siblingProductLinksHtml = generateApprovedSiblingProductLinks(p, allShopifyProducts);

    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      <p data-product-primary-offer data-variant-id="${escapeHtml(String(defaultVariant.id).split('/').pop())}" data-price="${escapeHtml(defaultVariant.price.amount)}" data-currency="${escapeHtml(defaultVariant.price.currencyCode)}" data-availability="${isAvailable ? 'In Stock' : 'Out of Stock'}">Price: ${priceHtml} | ${isAvailable ? 'In Stock' : 'Out of Stock'}</p>
      ${purchaseOptionsHtml}
      ${imgHtml}
      ${descHtml}
      <h2>Product Specifications</h2>
      <dl>
        ${detailRows}
      </dl>
      ${productQuestionsHtml}
      ${siblingProductLinksHtml}
      <h2>Shipping &amp; Delivery</h2>
      <p>Shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Review the destination-specific rates in the shipping policy; checkout is the final source of truth. When tracking is issued, carrier scans can appear after label creation.</p>
      <h2>Plan fit, shipping and support</h2>
      <p><a href="/sizing-measurements-guide">Sizing and measurement help</a> | <a href="${escapeHtml(productGuide.href)}">${escapeHtml(productGuide.label)}</a> | <a href="/shipping">Shipping policy</a> | <a href="/returns">Returns and covered order issues</a> | <a href="/contact">Contact support</a></p>
      <p><a href="${escapeHtml(categoryLink)}">${escapeHtml(categoryLabel)}</a> | <a href="/collections">All Collections</a></p>`;
  } else if (route.htmlSitemap && allShopifyProducts && allShopifyProducts.size > 0) {
    const approvedProducts = Array.from(allShopifyProducts.values())
      .filter((product) => APPROVED_SITEMAP_PATHS.has(`/product/${product.handle}`));
    console.log(`[prerender] ${route.path}: linked ${approvedProducts.length} approved products in HTML directory`);
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${routeContent}
      ${generateApprovedStaticDirectoryHtml()}
      <h2>All Current Products</h2>
      ${generateApprovedProductDirectoryHtml(approvedProducts)}`;
  } else if (route.category && allShopifyProducts && allShopifyProducts.size > 0) {
    // Collection route (sarees/lehengas/suits/menswear/indowestern/collections/new-arrivals)
    // Inject REAL Shopify products so Googlebot sees a fully populated category page on
    // first byte instead of an empty marketing shell. This is the SEO fix for the
    // 100 -> 7 impression drop on collection pages.
    const allProducts = Array.from(allShopifyProducts.values());
    const commerciallyRankedProducts = rankCommercialProducts(filterProductsForCollectionRoute(
      allProducts,
      route,
      Number.POSITIVE_INFINITY,
    ));
    const allCollectionProducts = route.path === '/lehengas'
      ? rankGenericLehengasByIntent(commerciallyRankedProducts)
      : commerciallyRankedProducts;
    const collectionProducts = allCollectionProducts.slice(0, MAX_COLLECTION_PRODUCTS);
    const matchLabel = route.prerenderSubcategory
      ? `${route.category}:${route.prerenderSubcategory.slug}`
      : route.category;
    console.log(`[prerender] ${route.path}: matched ${collectionProducts.length} products for '${matchLabel}'`);

    if (collectionProducts.length === 0) {
      html = html.replace(
        /<meta name="(robots|googlebot|bingbot)" content="[^"]*" \/>/g,
        '<meta name="$1" content="noindex, follow" />'
      );
    }

    if (DURABLE_INTENT_COLLECTION_PATHS.has(route.path) && collectionStandard) {
      const faqPageJsonLd = generateFaqPageJsonLd(collectionStandard.faqs);
      if (faqPageJsonLd) {
        html = html.replace('</head>', `    <script type="application/ld+json" data-prerender-schema>${JSON.stringify(faqPageJsonLd)}</script>\n</head>`);
      }
    }

    if (collectionProducts.length > 0) {
      // ItemList JSON-LD — Google Merchant Center reads this for collection rich results.
      const itemListJsonLd = generateItemListJsonLd(collectionProducts.slice(0, 30), route.h1, route.path);
      html = html.replace('</head>', `    <script type="application/ld+json" data-prerender-schema>${JSON.stringify(itemListJsonLd)}</script>\n</head>`);

      const canonical = `${SITE_URL}${route.path}`;
      const collectionPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonical}#collection`,
        url: canonical,
        name: route.h1,
        description: route.description,
        inLanguage: 'en',
        mainEntity: { '@id': `${canonical}#itemlist` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
      };
      html = html.replace('</head>', `    <script type="application/ld+json" data-prerender-schema>${JSON.stringify(collectionPageJsonLd)}</script>\n</head>`);

      // Compact JSON payload for React hydration — useShopifyProducts reads this on mount
      // and skips the client-side Shopify fetch entirely on first paint.
      const initialDataPayload = buildInitialDataPayload(collectionProducts, route.category);
      html = html.replace('</head>', `    <script>window.__INITIAL_DATA__ = ${initialDataPayload};</script>\n</head>`);
    }

    if (route.category === 'ready-to-ship' && collectionProducts.length === 0) {
      // An empty positive-evidence result is a noindex status response, not a
      // substantive Ready-to-Ship collection or an invitation to infer stock.
      mainBodyContent = `
        <h1>${escapeHtml(route.h1)}</h1>
        <p>No current products met the explicit ready-to-ship evidence and available-variant requirements when this page was generated.</p>
        <p><a href="/collections">Browse current collections</a> or <a href="/contact">contact LuxeMia</a> to confirm a product's fulfillment information.</p>`;
    } else {
      // Visible product cards for crawlers (removed by MutationObserver once React hydrates)
      const productCardsHtml = generateCollectionProductHtml(collectionProducts);
      const overflowProductLinksHtml = generateApprovedOverflowProductLinks(
        allCollectionProducts,
        collectionProducts,
      );
      const collectionDirectAnswer = collectionStandard
        ? `<p data-collection-direct-answer>${escapeHtml(collectionStandard.directAnswer)}</p>`
        : '';
      const collectionDecisionSupport = generateCollectionStandardHtml(collectionStandard);
      mainBodyContent = `
        <h1>${escapeHtml(route.h1)}</h1>
        ${collectionDirectAnswer}
        ${routeContent}
        <section data-collection-products>
          <h2>Products in this Collection</h2>
          ${productCardsHtml}
          ${overflowProductLinksHtml}
        </section>
        ${collectionDecisionSupport}`;
    }
  } else if (route.path === '/' && allShopifyProducts && allShopifyProducts.size > 0) {
    const homepageProducts = filterProductsForCategory(
      Array.from(allShopifyProducts.values()),
      'all',
      true,
    ).slice(0, 12);
    const itemListJsonLd = generateItemListJsonLd(homepageProducts, 'LuxeMia Collection', route.path);
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(itemListJsonLd)}</script>\n</head>`);
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${routeContent}
      <h2>Recently Added Indian Ethnic Wear</h2>
      ${generateCollectionProductHtml(homepageProducts)}`;
  } else {
    const blogDirectAnswer = route.blogPost?.directAnswer
      ? `<p data-guide-direct-answer>${escapeHtml(route.blogPost.directAnswer)}</p>`
      : '';
    const blogEditorialMeta = route.blogPost
      ? `<p data-guide-editorial-meta>By LuxeMia Editorial Team · Published <time datetime="${escapeHtml(route.blogPost.publishedAt)}">${escapeHtml(route.blogPost.publishedAt)}</time> · Last reviewed <time datetime="${escapeHtml(route.blogPost.factCheckedAt)}">${escapeHtml(route.blogPost.factCheckedAt)}</time></p>`
      : '';
    const blogBreadcrumb = route.blogPost
      ? `<nav aria-label="Breadcrumb"><a href="/">Home</a> · <a href="/blog">Guides</a> · <span aria-current="page">${escapeHtml(route.h1)}</span></nav>`
      : '';
    mainBodyContent = `
      ${blogBreadcrumb}
      <h1>${escapeHtml(route.h1)}</h1>
      ${blogDirectAnswer}
      ${blogEditorialMeta}
      ${routeContent}`;
  }

  // The Product Directory is the permanent HTML link hub for the approved catalog.
  // It must remain in the rendered DOM after hydration so that both users and
  // JavaScript-capable crawlers can traverse the same complete product graph.
  // Other route-specific prerender blocks are replaced after React mounts to
  // avoid duplicating the application UI.
  const hydrationCleanupScript = route.htmlSitemap ? '' : `
    <script>
      (function(){
        var root = document.getElementById('root');
        var seo = document.getElementById('seo-prerender');
        if (!root || !seo) return;
        // Remove once React has populated #root (MutationObserver fires on first child added)
        var obs = new MutationObserver(function() {
          obs.disconnect();
          var p = document.getElementById('seo-prerender');
          if (p) p.remove();
        });
        obs.observe(root, { childList: true });
        // Safety fallback in case observer misses the mutation
        setTimeout(function() {
          obs.disconnect();
          var p = document.getElementById('seo-prerender');
          if (p) p.remove();
        }, 5000);
      })();
    </script>`;

  const seoContent = `
    <main id="${route.path === '/returns' ? 'merchant-return-policy' : 'seo-prerender'}"${route.htmlSitemap ? ' aria-label="Complete product directory"' : ''}>
      ${mainBodyContent}
      <nav aria-label="Site navigation">
        <a href="/">Home</a> |
        <a href="/lehengas">Lehengas</a> |
        <a href="/sarees">Sarees</a> |
        <a href="/collections/wedding-sarees">Wedding Sarees</a> |
        <a href="/collections/designer-sarees">Designer Sarees</a> |
        <a href="/suits">Suits</a> |
        <a href="/menswear">Menswear</a> |
        <a href="/collections/customizable-indian-outfits">Customizable Outfits</a> |
        <a href="/blog">Guides</a> |
        <a href="/collections">Collections</a> |
        <a href="/sitemap">Product Directory</a> |
        <a href="/contact">Contact</a>
      </nav>
      <nav aria-label="Featured shopping guides">
        <a href="/collections/navratri-outfits">Navratri &amp; Garba Outfits 2026</a> |
        <a href="/blog/navratri-9-day-color-guide-2026">Navratri 2026 Buying Guide</a> |
        <a href="/blog/plus-size-indian-ethnic-wear-guide">Plus-Size Indian Ethnic Wear Guide</a> |
        <a href="/blog/manish-malhotra-bollywood-bridal-designer-profile">Manish Malhotra Designer Profile</a> |
        <a href="/blog/indian-wedding-terms-glossary-50-events-rituals-roles">Indian Wedding Terms Glossary</a>
      </nav>
    </main>${hydrationCleanupScript}`;

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>${seoContent}`
  );

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function main() {
  const [
    rankingModule,
    collectionStandardsModule,
    readyToShipEvidenceModule,
    productCopyModule,
    productEvidenceModule,
    intentCollectionEligibilityModule,
  ] = await Promise.all([
    loadTsModule('src/lib/commercialProductRanking.ts'),
    loadTsModule('src/config/collectionStandards.ts'),
    loadTsModule('src/lib/readyToShipEvidence.ts'),
    loadTsModule('src/lib/productDescriptionEnrichment.ts'),
    loadTsModule('src/lib/productEvidence.ts'),
    loadTsModule('src/lib/intentCollectionEligibility.ts'),
  ]);
  if (
    typeof rankingModule.rankCommercialProducts !== 'function'
    || typeof rankingModule.rankGenericLehengasByIntent !== 'function'
  ) {
    throw new Error('[commercial-ranking] Shared ranking module did not export both required ranking functions.');
  }
  rankCommercialProducts = rankingModule.rankCommercialProducts;
  rankGenericLehengasByIntent = rankingModule.rankGenericLehengasByIntent;
  console.log('[commercial-ranking] Shared commercial-quality and lehenga-intent ranking loaded for collection prerenders.');

  if (typeof readyToShipEvidenceModule.hasExplicitReadyToShipEvidence !== 'function') {
    throw new Error('[ready-to-ship] Shared positive-evidence helper is missing.');
  }
  hasExplicitReadyToShipEvidence = readyToShipEvidenceModule.hasExplicitReadyToShipEvidence;

  if (
    typeof productEvidenceModule.hasExplicitCustomColorEvidence !== 'function'
    || typeof productEvidenceModule.hasExplicitCustomMeasurementEvidence !== 'function'
    || typeof productEvidenceModule.hasExplicitCustomizationEvidence !== 'function'
  ) {
    throw new Error('[product-evidence] Shared customization-evidence helpers are missing.');
  }
  hasExplicitCustomColorEvidence = productEvidenceModule.hasExplicitCustomColorEvidence;
  hasExplicitCustomMeasurementEvidence = productEvidenceModule.hasExplicitCustomMeasurementEvidence;
  hasExplicitCustomizationEvidence = productEvidenceModule.hasExplicitCustomizationEvidence;

  if (typeof productCopyModule.buildVerifiedProductCopy !== 'function') {
    throw new Error('[product-copy] Shared evidence-safe product-copy builder is missing.');
  }
  buildVerifiedProductCopy = productCopyModule.buildVerifiedProductCopy;

  if (
    typeof intentCollectionEligibilityModule.isDurableIntentCollectionSlug !== 'function'
    || typeof intentCollectionEligibilityModule.isEligibleForDurableIntent !== 'function'
  ) {
    throw new Error('[intent-collections] Shared durable-intent eligibility helpers are missing.');
  }
  isDurableIntentCollectionSlug = intentCollectionEligibilityModule.isDurableIntentCollectionSlug;
  isEligibleForDurableIntent = intentCollectionEligibilityModule.isEligibleForDurableIntent;

  if (
    typeof collectionStandardsModule.getCollectionStandard !== 'function'
    || !Array.isArray(collectionStandardsModule.INDEXABLE_COLLECTION_PATHS)
  ) {
    throw new Error('[collection-standard] Shared collection-standard module is missing required exports.');
  }
  getCollectionStandard = collectionStandardsModule.getCollectionStandard;
  indexableCollectionPaths = collectionStandardsModule.INDEXABLE_COLLECTION_PATHS;
  for (const routePath of indexableCollectionPaths) {
    const route = routes.find((candidate) => candidate.path === routePath);
    if (!route) throw new Error(`[collection-standard] Missing prerender route for ${routePath}`);
    const standard = getCollectionStandard(routePath);
    if (!standard) throw new Error(`[collection-standard] Missing standard configuration for ${routePath}`);
    route.collectionStandard = standard;
    route.category ||= standard.category;
  }
  console.log(`[collection-standard] Loaded decision support for ${indexableCollectionPaths.length} indexable collection routes.`);

  const indexPath = path.join(DIST_DIR, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('Error: dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const template = fs.readFileSync(indexPath, 'utf-8');
  // Resolve the complete live catalog before deleting or rewriting any prior
  // build output. A credentials/network/catalog failure therefore leaves the
  // last generated artifacts intact and exits without a partial prerender.
  const productMap = await fetchAllShopifyProducts();
  for (const product of productMap.values()) getLiveProductPrerenderEvidence(product);
  const prerenderDir = path.join(DIST_DIR, '_prerender');

  // Clean previous prerender output
  if (fs.existsSync(prerenderDir)) {
    fs.rmSync(prerenderDir, { recursive: true });
  }
  fs.mkdirSync(prerenderDir, { recursive: true });

  // Auto-cover every published blog post and topic hub from source data.
  // This keeps bot-facing HTML synchronized with the routes registered by the
  // build and prevents missing prerender files from becoming bot-only 404s.
  const hardcodedBlogSlugs = new Set(
    routes
      .filter(r => r.path.startsWith('/blog/') && r.path.split('/').length === 3)
      .map(r => r.path.slice('/blog/'.length))
  );
  try {
    const [blogModule, categoryModule] = await Promise.all([
      loadTsModule('src/data/blogPosts.ts'),
      loadTsModule('src/data/blogCategories.ts'),
    ]);
    const allBlogPosts = blogModule.blogPosts || [];
    const allCategoryGroups = categoryModule.BLOG_CATEGORY_GROUPS || [];
    const categoryMap = categoryModule.BLOG_POST_CATEGORY_MAP || {};
    const publishedPaths = new Set(allBlogPosts.map(post => `/blog/${post.slug}`));
    const knownHubPaths = new Set(
      allCategoryGroups.map(group => `/blog/${group.slug}`)
    );

    // Remove manually maintained article and hub routes that are no longer
    // present in the published data. This prevents bot-only HTML from linking
    // to pruned articles or serving empty category hubs.
    for (let index = routes.length - 1; index >= 0; index--) {
      const routePath = routes[index].path;
      if (
        routePath.startsWith('/blog/') &&
        (knownHubPaths.has(routePath) || !publishedPaths.has(routePath))
      ) {
        routes.splice(index, 1);
      }
    }

    const blogIndex = routes.find(route => route.path === '/blog');
    if (blogIndex) {
      const guideLinks = allBlogPosts
        .map(post => `<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></li>`)
        .join('');
      const hubLinks = allCategoryGroups
        .map(group => `<li><a href="/blog/${escapeHtml(group.slug)}">${escapeHtml(group.name)}</a></li>`)
        .join('');
      blogIndex.content =
        '<p>Source-reviewed guides to Indian clothing terms, measurements, textiles, cultural context and occasionwear for shoppers in LuxeMia’s supported countries.</p>' +
        `<h2>Published Guides</h2><ul>${guideLinks}</ul>` +
        `<h2>Browse by Topic</h2><ul>${hubLinks}</ul>` +
        '<p>For exact fabric or materials, included pieces, stitching status, sizes, price and availability, use the individual product listing as the source of truth.</p>';
    }

    for (const group of allCategoryGroups) {
      const posts = allBlogPosts.filter(post => categoryMap[post.slug] === group.slug);
      if (posts.length === 0) continue;
      const postLinks = posts
        .map(post => `<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></li>`)
        .join('');
      routes.push({
        path: `/blog/${group.slug}`,
        title: group.metaTitle,
        description: group.metaDescription,
        h1: group.name,
        content:
          `<p>${escapeHtml(group.longDescription)}</p>` +
          `<h2>Published Guides</h2><ul>${postLinks}</ul>` +
          '<p><a href="/collections">Browse current collections</a> or use the category links inside each guide.</p>',
      });
    }

    let autoBlogCount = 0;
    for (const post of allBlogPosts) {
      if (!post.slug || routes.some(route => route.path === `/blog/${post.slug}`)) continue;
      const relatedGuideItems = allBlogPosts
        .filter(candidate => candidate.slug !== post.slug && categoryMap[candidate.slug] === categoryMap[post.slug])
        .slice(0, 4)
        .map(candidate => `<li><a href="/blog/${escapeHtml(candidate.slug)}">${escapeHtml(candidate.title)}</a></li>`)
        .join('');
      const relatedGuides = relatedGuideItems
        ? `<nav aria-labelledby="prerender-related-guides"><h2 id="prerender-related-guides">Related guides</h2><ul>${relatedGuideItems}</ul></nav>`
        : '';
      const sourceItems = (post.sources || [])
        .map(source =>
          `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a> — ${escapeHtml(source.publisher)}</li>`
        )
        .join('');
      const sourceReview = sourceItems
        ? `<section aria-labelledby="prerender-sources"><h2 id="prerender-sources">Sources and review basis</h2><p>Sources were checked on ${escapeHtml(post.factCheckedAt)}. Brand-owned sources are identified by publisher and attributed in the article.</p><ul>${sourceItems}</ul></section>`
        : '';
      routes.push({
        path: `/blog/${post.slug}`,
        title: `${post.title} | LuxeMia`,
        description: post.excerpt || `${post.title} — read the full guide on the LuxeMia blog.`,
        h1: post.title,
        content: `${post.content || `<p>${escapeHtml(post.excerpt || post.title)}</p>`}${relatedGuides}${sourceReview}`,
        blogPost: {
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          factCheckedAt: post.factCheckedAt,
          sources: post.sources || [],
          directAnswer: post.guideStandard?.directAnswer || '',
          faqs: post.guideStandard?.faqs || [],
        },
      });
      autoBlogCount++;
    }
    console.log(`[prerender] Published ${allBlogPosts.length} blog articles, ${allCategoryGroups.length} active hubs, and auto-generated ${autoBlogCount} missing article routes`);
  } catch (err) {
    console.error(`[prerender] WARNING: Failed to load published blog data: ${err.message}`);
    console.error('[prerender] Blog output may be incomplete; coverage verification will fail if a registered route is missing.');
  }

  // Resolve dedicated commercial collection routes from the same category
  // configuration and subcategory matcher used by the hydrated storefront.
  // Filtering the complete catalog by subcategory before the 50-product
  // prerender cap keeps these high-intent pages from inheriting an unrelated
  // first page of their broader category.
  const [commercialLandingModule, productFiltersModule] = await Promise.all([
    loadTsModule('src/config/commercialLandingPages.tsx'),
    loadTsModule('src/lib/productFilters.ts'),
  ]);
  applyCommercialLandingSubcategory = productFiltersModule.applySubcategory;

  for (const route of routes.filter((candidate) => candidate.commercialLanding)) {
    const config = commercialLandingModule.getCommercialLandingConfig(route.commercialLanding);
    const subcategorySlug = commercialLandingModule.getCommercialLandingSubcategory(route.commercialLanding);
    const subcategory = config.subcategories.find((candidate) => candidate.slug === subcategorySlug);
    if (!subcategory) {
      throw new Error(`Missing subcategory '${subcategorySlug}' for ${route.path}`);
    }
    route.category = config.slug;
    route.prerenderSubcategory = subcategory;
  }

  // Fixed route metadata is allowed only while the handle still exists in the
  // current eligible Shopify map. Prune every stale, retired, or hidden product
  // route before attaching commerce facts; no hardcoded route may survive a
  // live lookup miss.
  const productRouteCountBeforePruning = routes.filter((route) => route.path.startsWith('/product/')).length;
  for (let index = routes.length - 1; index >= 0; index--) {
    const routePath = routes[index].path;
    if (
      routePath.startsWith('/product/')
      && !productMap.has(routePath.slice('/product/'.length))
    ) {
      routes.splice(index, 1);
    }
  }
  const staleProductRoutesRemoved = productRouteCountBeforePruning
    - routes.filter((route) => route.path.startsWith('/product/')).length;
  if (staleProductRoutesRemoved > 0) {
    console.log(`[catalog-integrity] Pruned ${staleProductRoutesRemoved} product route(s) absent from the eligible live Shopify catalog.`);
  }

  const hardcodedProductHandles = new Set();
  for (const route of routes) {
    if (route.path.startsWith('/product/')) {
      const handle = route.path.slice('/product/'.length);
      if (hardcodedProductHandles.has(handle)) {
        throw new Error(`[catalog-integrity] Duplicate fixed product route: /product/${handle}`);
      }
      hardcodedProductHandles.add(handle);
      const live = productMap.get(handle);
      route.product = live;
      // The hardcoded route inventory predates some Shopify title cleanups.
      // Keep static H1, schema, breadcrumb, and hydrated title parity by
      // normalizing the current live title before HTML is rendered.
      route.h1 = sanitizeProductTitle(live.title);
    }
  }

  // Auto-generate a route entry for every Shopify product NOT already in the
  // hardcoded list. This guarantees a prerendered HTML file with valid Product
  // JSON-LD exists for every /product/<handle> on the live site (was previously
  // only ~73 of 360 products — the rest fell through to the empty SPA shell
  // with no Product schema, breaking GMC validation).
  for (const [handle, p] of productMap.entries()) {
    if (RETIRED_PRODUCT_HANDLES.has(handle) || HIDDEN_BILLING_PRODUCT_HANDLES.has(handle) || hardcodedProductHandles.has(handle)) continue;
    // Prefer Shopify admin "Search engine listing" (SEO) fields when set.
    // Falls back to plain product title + " | LuxeMia" suffix.
    // IMPORTANT: when seoTitle is set, use it VERBATIM. Shopify's SEO title
    // field is the complete title the user wants shown in search results —
    // Shopify itself often auto-populates it as "{productTitle} | {shopName}",
    // so appending " | LuxeMia" here would produce "... | LuxeMia | LuxeMia".
    const seoTitle = sanitizeProductTitle((p.seo?.title || '').trim());
    const desc = buildVerifiedProductCopy(p);
    const baseTitle = sanitizeProductTitle(p.title || handle);
    const title = seoTitle || `${baseTitle} | LuxeMia`;
    const description = desc.slice(0, 320);
    routes.push({
      path: `/product/${handle}`,
      title,
      description,
      h1: sanitizeProductTitle(p.title) || handle,
      content: `<p>${escapeHtml(desc).slice(0, 1200)}</p>`,
      product: p,
    });
  }
  const eligibleLiveProductHandles = assertExactLiveProductRouteSet(routes, productMap);
  console.log(`[prerender] Total /product/* routes after Shopify merge: ${routes.filter(r => r.path.startsWith('/product/')).length}`);
  disambiguateDuplicateProductRouteTitles(routes);

  let count = 0;
  let productCount = 0;
  for (const route of routes) {
    const html = generateHtml(template, route, productMap);

    // Create directory structure: / -> _prerender/index.html, /suits -> _prerender/suits.html
    let outFile;
    if (route.path === '/') {
      outFile = path.join(prerenderDir, 'index.html');
    } else {
      // /blog/some-slug -> _prerender/blog/some-slug.html
      const parts = route.path.slice(1); // remove leading /
      const dir = path.dirname(parts);
      if (dir !== '.') {
        fs.mkdirSync(path.join(prerenderDir, dir), { recursive: true });
      }
      outFile = path.join(prerenderDir, `${parts}.html`);
    }

    fs.writeFileSync(outFile, html);
    count++;
    if (route.path.startsWith('/product/')) productCount++;
  }

  console.log(`[prerender] Pre-rendered ${count} total routes to ${prerenderDir}/`);
  console.log(`[prerender] Product pages: ${productCount}`);
  console.log(`[prerender] Static/blog pages: ${count - productCount}`);

  if (productCount !== eligibleLiveProductHandles.length) {
    throw new Error(
      `[catalog-integrity] Wrote ${productCount} product pages for ${eligibleLiveProductHandles.length} eligible live Shopify products.`,
    );
  }

  // Validate the committed middleware manifest against the EXACT set of
  // product handles written in this release. Production builds must never
  // rewrite source after checkout: catalog drift fails closed and the manifest
  // is regenerated and reviewed before the next commit.
  const prerenderedHandles = routes
    .filter(r => r.path.startsWith('/product/'))
    .map(r => r.path.slice('/product/'.length))
    .sort();

  const manifestPath = path.resolve(__dirname, '../src/lib/prerenderManifest.ts');
  if (process.argv.includes('--write-source-manifest')) {
    const sourceManifest = `// AUTO-GENERATED by scripts/prerender.js — do not edit manually.
// Contains the exact set of product handles with a prerendered HTML file in dist/_prerender/product/.
// Regenerate and commit deliberately when the live catalog changes. Release builds validate this set.
// Imported by middleware.ts to avoid self-HTTP HEAD requests.

export const PRERENDERED_PRODUCT_HANDLES: Set<string> = new Set([
${prerenderedHandles.map((handle) => `  '${handle}',`).join('\n')}
]);
`;
    fs.writeFileSync(manifestPath, sourceManifest, 'utf8');
    console.log(`[prerender] Explicitly wrote src/lib/prerenderManifest.ts with ${prerenderedHandles.length} current product handles`);
  } else {
    if (!fs.existsSync(manifestPath)) {
    throw new Error('[catalog-integrity] src/lib/prerenderManifest.ts is missing; generate and commit it before releasing.');
    }
    const committedManifestSource = fs.readFileSync(manifestPath, 'utf8');
    const committedManifestBlock = committedManifestSource.match(
      /PRERENDERED_PRODUCT_HANDLES:\s*Set<string>\s*=\s*new Set\(\[([\s\S]*?)\]\);/,
    )?.[1];
    if (committedManifestBlock === undefined) {
      throw new Error('[catalog-integrity] PRERENDERED_PRODUCT_HANDLES could not be parsed from src/lib/prerenderManifest.ts.');
    }
    const committedHandles = [...committedManifestBlock.matchAll(/['"]([^'"]+)['"]/g)]
      .map((match) => match[1]);
    const committedHandleSet = new Set(committedHandles);
    const liveHandleSet = new Set(prerenderedHandles);
    const missingFromSource = prerenderedHandles.filter((handle) => !committedHandleSet.has(handle));
    const absentFromShopify = committedHandles.filter((handle) => !liveHandleSet.has(handle));
    const hasDuplicates = committedHandleSet.size !== committedHandles.length;
    if (missingFromSource.length > 0 || absentFromShopify.length > 0 || hasDuplicates) {
      throw new Error(
        '[catalog-integrity] Committed src/lib/prerenderManifest.ts does not exactly match this release catalog. '
        + `Missing current handles: ${missingFromSource.slice(0, 10).join(', ') || 'none'}; `
        + `absent from current Shopify catalog: ${absentFromShopify.slice(0, 10).join(', ') || 'none'}; `
        + `duplicates: ${hasDuplicates ? 'yes' : 'no'}. `
        + 'Run prerender.js with --write-source-manifest and commit the result before releasing.',
      );
    }
    console.log(`[prerender] Verified committed src/lib/prerenderManifest.ts against ${prerenderedHandles.length} current product handles`);
  }

  const buildManifestPath = path.join(prerenderDir, 'manifest.json');
  fs.writeFileSync(
    buildManifestPath,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      routes: routes.map((route) => route.path),
      productHandles: prerenderedHandles,
      eligibleLiveProductHandles,
      catalogIntegrity: {
        source: 'Shopify Storefront API complete pagination',
        exactProductSet: true,
        eligibleProductCount: eligibleLiveProductHandles.length,
      },
    }, null, 2),
    'utf-8'
  );
  console.log(`[prerender] Written ${buildManifestPath} with ${routes.length} routes`);
}

export {
  buildHydrationProductNode,
  getIncludedComponentsMetafield,
  getIncludedComponentsMetafieldList,
  getListedProductAttributes,
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('[prerender] Fatal error:', err);
    process.exit(1);
  });
}
