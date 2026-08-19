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
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const FALLBACK_PRICE = '299.00';
const APPROVED_SITEMAP_PATHS = new Set(
  JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/approved-sitemap-inventory.json'), 'utf8')).paths
);
const OCCASION_SIGNALS = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'src/data/occasionSignals.json'), 'utf8')
);
const CUSTOMIZABLE_PRODUCTS = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'src/data/customizableProducts.json'), 'utf8')
);
const CUSTOMIZABLE_PRODUCTS_BY_HANDLE = new Map(
  CUSTOMIZABLE_PRODUCTS.map((product) => [product.handle, product])
);
const CUSTOM_PRODUCT_TIMING = 'The source listing carries an approximate 4–5 week total order window. LuxeMia confirms the current production time and carrier transit separately after the color, measurements, fabric availability, and delivery address are known; timing is not guaranteed until confirmed in writing.';

function getCustomProductDescription(title) {
  return `${title}. Made to order from measurements confirmed with LuxeMia, with a custom color available for this design. ${CUSTOM_PRODUCT_TIMING} Contact LuxeMia before ordering for a fixed event date. Custom orders are final sale, subject to applicable law.`;
}

function applyCustomizableProductDetails(product) {
  const matched = CUSTOMIZABLE_PRODUCTS_BY_HANDLE.get(product?.handle);
  if (!matched) return product;

  const description = getCustomProductDescription(matched.title);

  return {
    ...product,
    title: matched.title,
    description,
    tags: [
      ...(product.tags || []).filter((tag) => !/ready[- ]?to[- ]?ship|ships? within|worldwide|canada|australia|dhl|ddp/i.test(String(tag))),
      'customizable',
      'made to order',
      'custom color',
      'custom measurements',
    ],
    shipsWithinMetafield: null,
    seo: {
      title: `${matched.title} | LuxeMia`,
      description,
    },
  };
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
const FALLBACK_CURRENCY = 'USD';

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function sanitizeProductCopy(value) {
  return (value || '')
    .replace(/Ships within 1[–-]2 business days from the USA\.\s*Free shipping on orders over \$99\./gi, 'Free U.S. shipping at $150 and above. $12 flat below that. Tracking provided after dispatch.')
    .replace(/Free worldwide shipping to USA, Canada, and Australia via DHL\/USPS\/UPS \(7-10 business days\)/gi, 'Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
    .replace(/Free worldwide shipping to [^.]+?(?:arriving in |delivered in |within )?7-10 business days/gi, 'Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
    .replace(/Free worldwide shipping to [^.]+?via DHL\/USPS\/UPS/gi, 'Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
    .replace(/Shipping:\s*5-day express delivery to USA and Canada/gi, 'Shipping: tracking provided after dispatch')
    .replace(/ready[- ]to[- ]ship Indian wear USA/gi, 'Indian ethnic wear online')
    .replace(/ready[- ]to[- ]ship/gi, 'available online')
    .replace(/within two business days/gi, 'with tracked shipping')
    .replace(/within 2 business days/gi, 'with tracked shipping')
    .replace(/from the USA/gi, 'with U.S. delivery')
    .replace(/USA, Canada, and Australia/gi, 'the United States')
    .replace(/free shipping on orders over \$350/gi, 'current U.S. shipping shown at checkout');
}

function sanitizeProductTitle(value) {
  return (value || '')
    .replace(/^buy\s+/i, '')
    .replace(/\s*(?:[|–—-]\s*)?ready[-\s]?to[-\s]?ship\b/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?handcrafted indian bridal luxury\b/gi, '')
    .replace(/\bhandcrafted\s+/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?luxemia\s*$/gi, '')
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
    String(value || '')
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
  const nextFieldPattern = 'Style|Fabric|Material|Work|Embroidery|Embellishment|Color|Care|Lehenga Silhouette|Blouse\\/Choli|Dupatta|Lining|Closure|Flair';
  const plainMatch = plain.match(new RegExp(`(?:^|\\s)(?:${labelPattern})\\s*:\\s*(.{1,160}?)(?=\\s+(?:${nextFieldPattern})\\s*:|[.!?]|$)`, 'i'));
  return cleanVerifiedFact(plainMatch?.[1]);
}

function getExplicitIncludedPieces(product) {
  const fromTag = (product?.tags || []).find((tag) => /^(?:included|included pieces|pieces|set includes|package includes):/i.test(String(tag)));
  if (fromTag) {
    const parsed = String(fromTag).replace(/^[^:]+:\s*/, '');
    return cleanVerifiedFact(parsed);
  }

  const listingText = textFromListing(product?.description);
  if (/\bblouse material included\b/i.test(listingText)) return 'blouse material';
  const explicit = listingText.match(/\b(?:includes|included pieces|set includes|package includes)\s*[:\-]?\s*([^.!?]{1,120})/i);
  return cleanVerifiedFact(explicit?.[1]);
}

function getVerifiedOccasion(product) {
  const tags = new Set((product?.tags || []).map((tag) => String(tag).trim().toLowerCase()));
  const matched = OCCASION_TAG_COPY.find(([tag]) => tags.has(tag));
  return matched?.[1];
}

function getListedProductAttributes(product) {
  const jewelry = isJewelryProduct(product?.productType, product?.title);
  const listingText = `${product?.title || ''} ${product?.description || ''}`.toLowerCase();
  const optionValue = (...names) => product?.options
    ?.find(option => names.includes((option.name || '').toLowerCase()))
    ?.values?.[0];
  const rawColor = optionValue('color');
  const rawMaterial = optionValue('fabric', 'material');
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
  const listedMaterial = getLabeledListingFact(product?.description, ['Fabric', 'Material']);
  const listedWork = getLabeledListingFact(product?.description, ['Work', 'Embroidery', 'Embellishment']);
  const sizeValues = product?.options
    ?.find(option => ['size', 'bust size', 'chest size'].includes((option.name || '').toLowerCase()))
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
  const includedPieces = includedPiecesTag && includedPiecesPrefix
    ? String(includedPiecesTag).slice(includedPiecesPrefix.length).trim()
    : getExplicitIncludedPieces(product);
  const rawShipsWithin = product?.shipsWithinMetafield?.value;
  const shipsWithinDays = rawShipsWithin ? Number.parseInt(String(rawShipsWithin), 10) : null;

  return {
    jewelry,
    color: (rawColor || taggedColor) && (!jewelry || listingText.includes((rawColor || taggedColor).toLowerCase()))
      ? (rawColor || taggedColor)
      : undefined,
    material: (rawMaterial || taggedMaterial || listedMaterial) && (!jewelry || listingText.includes((rawMaterial || taggedMaterial || listedMaterial).toLowerCase()))
      ? cleanVerifiedFact(rawMaterial || taggedMaterial || listedMaterial)
      : undefined,
    work: !jewelry ? cleanVerifiedFact(taggedWork || listedWork) : undefined,
    occasion: !jewelry ? getVerifiedOccasion(product) : undefined,
    sizes: jewelry ? [] : sizeValues,
    includedPieces: cleanVerifiedFact(includedPieces),
    shipsWithinDays: Number.isFinite(shipsWithinDays) && shipsWithinDays > 0 ? shipsWithinDays : null,
  };
}

function buildVerifiedProductCopy(product) {
  if (!product) return '';

  if (CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(product.handle)) {
    const matched = CUSTOMIZABLE_PRODUCTS_BY_HANDLE.get(product.handle);
    return `${getCustomProductDescription(matched.title)} Checkout accepts United States addresses only. U.S. standard shipping is $12 below $150 and free at $150 and above.`;
  }

  const isSourceVerifiedListing = (product.tags || []).some(
    (tag) => String(tag).trim().toLowerCase() === 'facts:source-verified',
  );
  const sourceVerifiedDescription = isSourceVerifiedListing
    ? textFromListing(product.description)
    : '';
  if (sourceVerifiedDescription.length >= 80) {
    return normalizeWhitespace(
      `${sourceVerifiedDescription} Shipping is available to United States addresses only. U.S. standard shipping is $12 below $150 and free at $150 and above.`,
    );
  }

  const title = sanitizeProductTitle(product.title || product.handle || 'Indian ethnic wear');
  const attributes = getListedProductAttributes(product);
  const parts = [`${title}.`];

  if (product.productType) parts.push(`Category: ${product.productType}.`);
  if (attributes.color) parts.push(`Color: ${attributes.color}.`);
  if (attributes.material) parts.push(`Material: ${attributes.material}.`);
  if (attributes.work) parts.push(`Work: ${attributes.work}.`);
  if (attributes.includedPieces) parts.push(`Includes: ${attributes.includedPieces}.`);
  if (attributes.occasion) parts.push(`Suitable for: ${attributes.occasion}.`);
  if (attributes.sizes.length > 0) {
    parts.push(`Available options: ${attributes.sizes.join(', ')}.`);
  }
  if (attributes.shipsWithinDays) {
    parts.push(`Catalog shipping estimate: ${attributes.shipsWithinDays} business day${attributes.shipsWithinDays === 1 ? '' : 's'} before carrier transit.`);
  }

  parts.push(
    'Review the product images and available options for the exact pieces, measurements, and current availability.',
    'Shipping is available to United States addresses only. U.S. standard shipping is $12 below $150 and free at $150 and above.'
  );

  return normalizeWhitespace(parts.join(' '));
}

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

function clampTitle(raw, brand = 'LuxeMia', maxLength = 58) {
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

function clampDescription(raw, maxLength = 155) {
  return truncateAtWord(normalizeWhitespace(raw), maxLength);
}

// ─── Shopify Storefront API (build-time product fetch) ──────────────────────
// Pulls live product data so prerendered HTML emits valid Product schema with
// image, description, offers.price, etc. — required by Google Merchant
// Listings / Rich Results validation.
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-10/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
if (!SHOPIFY_STOREFRONT_TOKEN) {
  console.warn('[prerender] WARNING: SHOPIFY_STOREFRONT_TOKEN env var is not set. Product prerendering will use fallback data.');
}


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
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 20) {
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
    return `${clean}${sep}format=jpg&width=1200`;
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
  const map = new Map();
  let cursor = null;
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
        console.warn(`[prerender] Shopify fetch returned ${resp.status} — using fallbacks`);
        break;
      }
      const json = await resp.json();
      const data = json?.data?.products;
      if (!data) break;
      for (const edge of data.edges || []) {
        const p = edge.node;
        if (p?.handle) map.set(p.handle, applyCustomizableProductDetails(p));
      }
      if (!data.pageInfo?.hasNextPage) break;
      cursor = data.pageInfo.endCursor;
    }
  } catch (err) {
    console.warn(`[prerender] Shopify fetch failed: ${err.message} — using fallbacks`);
  }
  console.log(`[prerender] Loaded ${map.size} products from Shopify Storefront API`);
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
const HIDE_OLD_PRODUCTS = true;
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesOccasionProduct(product, occasion) {
  const signals = OCCASION_SIGNALS[occasion];
  if (!signals || product.availableForSale === false) return false;

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

function filterProductsForCategory(allProducts, category, newestFirst = false) {
  if (category === 'customizable') {
    return allProducts
      .filter((product) => product.availableForSale !== false)
      .filter((product) => CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(product.handle))
      .slice(0, MAX_COLLECTION_PRODUCTS);
  }

  if (category.startsWith('occasion:')) {
    const occasion = category.slice('occasion:'.length);
    return allProducts
      .filter((product) => !EXCLUDED_TITLE_KEYWORDS.test(product.title ?? ''))
      .filter((product) => matchesOccasionProduct(product, occasion))
      .slice(0, MAX_COLLECTION_PRODUCTS);
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

    return matches.slice(0, MAX_COLLECTION_PRODUCTS);
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

    return ordered.slice(0, MAX_COLLECTION_PRODUCTS);
  }

  if (category === 'all') return allowed.slice(0, MAX_COLLECTION_PRODUCTS);

  const types = CATEGORY_PRODUCT_TYPES[category];
  if (!types) return allowed.slice(0, MAX_COLLECTION_PRODUCTS);

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
    }).slice(0, MAX_COLLECTION_PRODUCTS);
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
    }).slice(0, MAX_COLLECTION_PRODUCTS);
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
    }).slice(0, MAX_COLLECTION_PRODUCTS);
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
  }).slice(0, MAX_COLLECTION_PRODUCTS);
}

// Build the compact JSON payload that gets injected as window.__INITIAL_DATA__.
// React's useShopifyProducts hook reads this on hydration to skip the client-side
// Shopify fetch entirely on first paint.
function toSafeInlineJson(value) {
  // Prevent a product title or description from closing the inline script tag.
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function buildInitialDataPayload(products, category) {
  // Slim each product down to the fields the hook actually consumes.
  const slim = products.map(p => ({
    node: {
      id: p.id,
      title: sanitizeProductTitle(p.title),
      createdAt: p.createdAt,
      description: buildVerifiedProductCopy(p),
      handle: p.handle,
      vendor: p.vendor,
      productType: p.productType,
      // Keep merchandising attributes needed by client-side filters, while
      // preventing obsolete shipping regions and thresholds from being
      // republished inside the crawlable hydration payload.
      tags: getCrawlerSafeTags(p.tags),
      availableForSale: p.availableForSale,
      shipsWithinMetafield: p.shipsWithinMetafield || null,
      priceRange: p.priceRange,
      compareAtPriceRange: p.compareAtPriceRange,
      images: p.images,
      variants: p.variants,
      options: p.options ?? [],
    },
  }));
  return toSafeInlineJson({ category: category || 'all', products: slim });
}

// Product pages have materially higher purchase intent than category pages. Give
// each prerendered route its own initial product record so a direct shopper
// visit can render and add to bag before a slow Storefront API refresh finishes.
function buildInitialProductPayload(product) {
  const slim = {
    id: product.id,
    title: sanitizeProductTitle(product.title),
    createdAt: product.createdAt,
    description: buildVerifiedProductCopy(product),
    handle: product.handle,
    vendor: product.vendor,
    productType: product.productType,
    tags: getCrawlerSafeTags(product.tags),
    availableForSale: product.availableForSale,
    shipsWithinMetafield: product.shipsWithinMetafield || null,
    seo: product.seo || { title: null, description: null },
    priceRange: product.priceRange,
    compareAtPriceRange: product.compareAtPriceRange,
    images: product.images,
    variants: product.variants,
    options: product.options || [],
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
    const price = p.priceRange?.minVariantPrice?.amount;
    const currency = p.priceRange?.minVariantPrice?.currencyCode || 'USD';
    const comparePrice = p.compareAtPriceRange?.maxVariantPrice?.amount;
    const isAvailable = p.availableForSale !== false;
    const firstImage = p.images?.edges?.[0]?.node;
    const imgHtml = firstImage
      ? `<img src="${escapeHtml(forceJpegForGmc(firstImage.url))}" alt="${escapeHtml(firstImage.altText || sanitizeProductTitle(p.title) || '')}" width="400" height="500" loading="lazy" style="max-width:100%;height:auto;display:block;margin:0 0 8px 0">`
      : '';

    let priceHtml = '';
    if (price) {
      priceHtml = `<strong>${currency} ${parseFloat(price).toFixed(2)}</strong>`;
      if (comparePrice && parseFloat(comparePrice) > parseFloat(price)) {
        priceHtml += ` <s style="color:#888">${currency} ${parseFloat(comparePrice).toFixed(2)}</s>`;
      }
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

// Product-level shipping details mirror the public U.S. standard-shipping terms:
// $12 below $150 and free at $150+. Delivery time is intentionally omitted
// because it depends on the item and selected options.
const US_PRODUCT_SHIPPING_DETAILS = [
  {
    '@type': 'OfferShippingDetails',
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
    orderValue: { '@type': 'MonetaryAmount', maxValue: 149.99, currency: 'USD' },
    shippingRate: { '@type': 'MonetaryAmount', value: 12, currency: 'USD' },
  },
  {
    '@type': 'OfferShippingDetails',
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
    orderValue: { '@type': 'MonetaryAmount', minValue: 150, currency: 'USD' },
    shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
  },
];

function normalizeBrand(vendor) {
  const raw = (vendor || '').trim();
  if (!raw) return 'LuxeMia';
  return /^luxemi(?:a|ashop)$/i.test(raw.replace(/[^a-z0-9]/gi, '')) ? 'LuxeMia' : raw;
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
function generateItemListJsonLd(products, category, routePath) {
  const canonical = SITE_URL + routePath;
  const items = products.map((p, i) => {
    const price = p.priceRange?.minVariantPrice?.amount || FALLBACK_PRICE;
    const currency = p.priceRange?.minVariantPrice?.currencyCode || FALLBACK_CURRENCY;
    const image = p.images?.edges?.[0]?.node?.url
      ? forceJpegForGmc(p.images.edges[0].node.url)
      : FALLBACK_OG_IMAGE;
    const availability = p.availableForSale === true || p.variants?.edges?.some((variant) => variant.node.availableForSale)
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';
    const productUrl = `${SITE_URL}/product/${p.handle}`;
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: sanitizeProductTitle(p.title),
        image,
        url: productUrl,
        description: buildVerifiedProductCopy(p).slice(0, 5000),
        sku: (p.id || '').split('/').pop() || p.handle,
        brand: { '@type': 'Brand', name: 'LuxeMia' },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          price,
          priceCurrency: currency,
          availability,
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE_URL}/#org` },
          hasMerchantReturnPolicy: { '@id': `${SITE_URL}/#returnPolicy` },
          shippingDetails: US_PRODUCT_SHIPPING_DETAILS,
        },
      },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${canonical}#products`,
    name: category === 'all' ? 'LuxeMia Collection' : `LuxeMia ${category.charAt(0).toUpperCase() + category.slice(1)}`,
    url: canonical,
    numberOfItems: items.length,
    itemListElement: items,
  };
}

const FAQ_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where does LuxeMia ship?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LuxeMia ships to United States addresses only. U.S. standard shipping is $12 below $150 and free at $150 and above.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does LuxeMia shipping take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In-stock online items receive tracking after dispatch. Carrier transit time begins after dispatch.',
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
        text: 'All sales are final and exchanges are not accepted, subject to applicable law. Report shipping damage, a defective or incorrect item, or a missing item within 48 hours of delivery with clear photos and a continuous unboxing video.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel a LuxeMia order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cancellation requests must be made within 24 hours of order placement. After that window, cancellation requests are not accepted. Email hello@luxemia.shop immediately with your order number.',
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

// Route definitions with SEO metadata
const routes = [
  {
    path: '/',
    title: 'Indian Ethnic Wear Online USA | Tracked Shipping | LuxeMia',
    description: 'Shop premium Indian ethnic wear online in the USA: bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry with tracked U.S. shipping.',
    h1: 'Premium Indian Ethnic Wear with Tracked U.S. Shipping',
    content: `
      <p>Shop bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry with tracked shipping to United States addresses only. Browse Indian wedding guest outfits with U.S.-based support.</p>
      <h2>What can I shop at LuxeMia?</h2>
      <p>LuxeMia offers lehengas, sarees, salwar kameez, and menswear for weddings, festivals, and special occasions.</p>
      <nav>
        <ul>
          <li><a href="/collections/navratri-outfits">Navratri &amp; Garba Outfits 2026</a> — Current chaniya choli, lehenga and festive styles for U.S. celebrations</li>
          <li><a href="/collections/customizable-indian-outfits">Customizable Indian Outfits</a> — Verified custom-color and made-to-measure designs</li>
          <li><a href="/lehengas">Lehengas</a> — Bridal & wedding lehenga choli collections</li>
          <li><a href="/sarees">Sarees</a> — Browse by fabric and occasion</li>
          <li><a href="/suits">Salwar Kameez</a> — Anarkali, sharara & palazzo suits</li>
          <li><a href="/menswear">Menswear</a> — Sherwanis, kurta sets & Indo-western</li>
        </ul>
      </nav>
      <h2>Which LuxeMia collections are best for weddings?</h2>
      <p>Wedding shoppers can browse bridal lehengas, wedding sarees, reception outfits, and festive wear for every ceremony.</p>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a></li>
        <li><a href="/sarees">Wedding Sarees</a></li>
        <li><a href="/collections">Reception Outfits</a></li>
        <li><a href="/collections">Festive Wear</a></li>
      </ul>
      <h2>How much is LuxeMia shipping?</h2>
      <p>Free U.S. shipping at $150 and above. $12 flat below that. Tracking details are emailed when the shipping label is created for dispatch.</p>
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
    title: 'Buy Salwar Suits Online — Anarkali, Palazzo & Sharara | LuxeMia',
    description: 'Shop salwar kameez, anarkali, sharara and palazzo suits online. Compare exact fabric, included pieces, sizing and availability. Free U.S. shipping at $150 and above.',
    h1: 'Salwar Kameez & Suits Collection',
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
        <li><a href="/suits?sub=palazzo">Palazzo Suits</a> — Modern wide-leg pants with kurta</li>
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
    title: 'Bridal & Ready-to-Ship Lehengas USA | LuxeMia',
    description: 'Shop bridal and wedding guest lehengas online in the USA. Use the Ready to Ship filter for eligible listings; compare fabric, included pieces, sizing and tracked U.S. shipping.',
    h1: 'Bridal, Wedding Guest & Ready-to-Ship Lehengas in the USA',
    content: `
      <p>Discover bridal, wedding guest, reception and festive lehengas for U.S. delivery. Use the Ready to Ship filter only for listings explicitly tagged that way, then review the exact fabric, included pieces, sizing and product-specific shipping estimate.</p>
      <h2>Ready-to-Ship Bridal Lehengas in the USA</h2>
      <p>The Ready to Ship availability filter requires an explicit catalog tag and an available variant. Confirm the selected size, included pieces and shipping estimate before ordering for a fixed wedding date.</p>
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
    title: 'Buy Indian Wedding Sarees Online in the U.S. | LuxeMia',
    description: 'Buy Indian wedding, silk and festive sarees online in the U.S. Compare each listing’s exact fabric, weave or work, blouse details, availability and tracked shipping.',
    h1: 'Buy Indian Wedding Sarees Online in the U.S.',
    content: `
      <p>Explore wedding, silk and festive sarees for U.S. delivery. Review each product page for the exact fabric, weave or work, blouse details, dimensions and availability; a style name is not treated as proof of fiber, weaving method or origin.</p>
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
    description: 'Shop Manthrakodi sarees for Kerala Christian weddings. Browse bridal sarees with clearly stated fabric, border, blouse and product details for U.S. delivery.',
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
    title: 'Buy Sherwanis Online — Wedding & Groom Sherwani for Men | LuxeMia',
    description: 'Shop sherwanis, kurta pajama sets and Indo-Western menswear online. Compare exact fabric, included pieces, sizes and availability. Free U.S. shipping at $150 and above.',
    h1: 'Indian Menswear — Sherwanis & Kurta Collection',
    content: `
      <p>Discover sherwanis, kurta sets and Indo-Western menswear. Review each product page for the exact fabric, work, included pieces, sizes, tailoring options and current availability.</p>
      <h2>Custom Plus-Size Kurta Pajama and Nehru-Jacket Sets</h2>
      <p>Select active listings state plus-size custom stitching and include a kurta, pajama and Nehru jacket. When comparing a men's plus-size kurta pajama with matching jacket for a wedding guest or cocktail night, or a big-and-tall Nehru-jacket look, confirm the exact fabric, measurement process, set contents and event timing on the product page before ordering.</p>
      <h2>Shop Menswear by Style</h2>
      <ul>
        <li><a href="/menswear?sub=sherwani">Sherwanis</a> — Regal wedding sherwanis for the groom</li>
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
    title: 'Indian Bridal Jewelry Sets | Traditional Wedding Necklaces | LuxeMia',
    description: 'Shop Kundan-style, polki-style and bridal necklace sets online. Compare exact materials, finish, included pieces and measurements. Free U.S. shipping at $150 and above.',
    h1: 'Indian Bridal Jewelry & Necklace Sets',
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
    h1: 'All Collections',
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
        <li><a href="/collections/bridal-lehengas">Bridal Lehengas</a> — Indian wedding lehenga styles</li>
        <li><a href="/collections/party-wear-lehengas">Party-Wear Lehengas</a> — Festive lehenga choli styles</li>
      </ul>
    `,
  },
  {
    path: '/collections/customizable-indian-outfits',
    category: 'customizable',
    title: 'Customizable Indian Outfits | Custom Color & Measurements | LuxeMia',
    description: 'Shop verified made-to-order Indian outfits with custom color and confirmed measurements. Review the approximate 4–5 week total planning window before ordering.',
    h1: 'Customizable Indian Outfits',
    content: `
      <p>These selected lehengas, sarees, kurta sets, and wedding outfits are verified for a custom color and made-to-order construction from measurements confirmed with LuxeMia.</p>
      <h2>How does a LuxeMia custom order work?</h2>
      <ol>
        <li>Send the exact product link, requested color, event date, and delivery country.</li>
        <li>LuxeMia confirms fabric availability, timing, and the measurements required for that design.</li>
        <li>Use approximately 4–5 weeks as a total planning window. LuxeMia confirms production time and carrier transit separately in writing after all required details and the delivery address are known.</li>
      </ol>
      <p>Other design changes are not included unless LuxeMia confirms them in writing. Rush delivery is not guaranteed. Custom orders are final sale, subject to applicable law.</p>
      <h2>Current shipping availability</h2>
      <p>Checkout accepts United States addresses only. U.S. standard shipping is $12 below $150 and free at $150 and above. Applicable taxes are calculated at checkout.</p>
      <p><a href="/contact">Contact LuxeMia</a> | <a href="/sizing-measurements-guide">Measurement guide</a> | <a href="/returns">Returns policy</a></p>
    `,
  },
  {
    path: '/products',
    title: 'All Products | Shop Indian Ethnic Wear Online | LuxeMia',
    description: 'Browse all products at LuxeMia. Designer lehengas, silk sarees, salwar suits, sherwanis & more. Free U.S. shipping at $150 and above.',
    h1: 'All Products',
    content: `
      <p>Explore our complete collection of Indian ethnic wear. Designer lehengas, silk sarees, salwar suits, sherwanis and more — all with free US shipping at $150 and above.</p>
      <h2>Shop by Category</h2>
      <p>Browse our full catalog organized by type: <a href="/lehengas">Lehengas</a>, <a href="/sarees">Sarees</a>, <a href="/suits">Salwar Kameez</a>, and <a href="/menswear">Menswear</a>. Use filters to sort by price, color, fabric, and occasion.</p>
      <p>Pieces ship with tracking to United States addresses only. U.S. standard shipping is free at $150 and above and $12 below $150.</p>
    `,
  },
  {
    path: '/collections/bridal-lehengas',
    title: 'Bridal Lehengas Online USA | Indian Wedding Lehengas | LuxeMia',
    description: 'Shop bridal lehengas online in the USA. Compare current colors, stated fabric, embroidery, included choli and dupatta pieces, sizing and availability.',
    h1: 'Bridal Lehengas',
    content: '<p>Browse bridal lehengas for Indian wedding celebrations. Compare the exact product listing for fabric, work, included pieces, size and availability before ordering.</p><p><a href="/size-guide">Size guide</a> | <a href="/shipping">U.S. shipping information</a></p>',
  },
  {
    path: '/collections/sharara-suits',
    title: 'Sharara Suits Online USA | Wedding & Festive Sets | LuxeMia',
    description: 'Shop sharara suits online in the USA. Compare current colors, stated fabric, embroidery, included kurti, sharara and dupatta pieces, sizing and availability.',
    h1: 'Sharara Suits',
    content: '<p>Browse current sharara suits for wedding events and celebrations. Review the exact listing for fabric, embroidery, included pieces, size and availability before ordering.</p><p><a href="/suits">Shop all suits</a> | <a href="/size-guide">Size guide</a></p>',
  },
  {
    path: '/collections/gharara-suits',
    title: 'Gharara Suits Online USA | Wedding & Festive Sets | LuxeMia',
    description: 'Shop gharara suits online in the USA. Compare current colors, stated fabric, embroidery, included pieces, sizes and product availability for weddings and celebrations.',
    h1: 'Gharara Suits',
    content: '<p>Browse current gharara suit listings for wedding celebrations and festive occasions. Check the exact product details for construction, included pieces, size and availability.</p><p><a href="/suits">Shop all suits</a> | <a href="/shipping">U.S. shipping information</a></p>',
  },
  {
    path: '/collections/anarkali-suits',
    title: 'Anarkali Suits Online USA | Wedding & Party Wear | LuxeMia',
    description: 'Shop Anarkali suits online in the USA. Compare current colors, stated fabric, embroidery, included dupatta and bottoms, size options and availability.',
    h1: 'Anarkali Suits',
    content: '<p>Browse Anarkali suits for wedding events, festive gatherings and party wear. Review each product listing for the exact fabric, work, included pieces, size and availability.</p><p><a href="/suits">Shop all suits</a> | <a href="/size-guide">Size guide</a></p>',
  },
  {
    path: '/collections/party-wear-lehengas',
    title: 'Party-Wear Lehengas Online USA | Festive Lehenga Choli | LuxeMia',
    description: 'Shop party-wear lehengas online in the USA. Compare current colors, stated fabric, embroidery, included pieces, sizing and availability for festive events.',
    h1: 'Party-Wear Lehengas',
    content: '<p>Browse party-wear lehengas for receptions, festive events and celebrations. Review each exact listing for fabric, work, included pieces, size and current availability.</p><p><a href="/lehengas">Shop all lehengas</a> | <a href="/shipping">U.S. shipping information</a></p>',
  },
  {
    path: '/collections/wedding-sarees',
    title: 'Wedding Sarees Online USA | Indian Wedding Sarees | LuxeMia',
    description: 'Shop wedding sarees online in the USA. Compare current bridal and wedding saree listings by stated fabric, work, blouse details, price and availability before ordering.',
    h1: 'Wedding Sarees',
    content: '<p>Browse current wedding sarees for ceremonies, receptions and family celebrations. Review each exact listing for stated fabric, work, blouse details, price and availability before an event-critical order.</p><p><a href="/sarees">Shop all sarees</a> | <a href="/size-guide">Size guide</a> | <a href="/shipping">Shipping information</a></p>',
  },
  {
    path: '/collections/designer-sarees',
    title: 'Designer Sarees Online USA | Embroidered & Party-Wear Styles | LuxeMia',
    description: 'Shop designer sarees online in the USA. Compare current colors, stated fabric, embroidery or work, blouse details, price and availability before ordering.',
    h1: 'Designer Sarees',
    content: '<p>Browse current designer saree listings for receptions, parties and celebrations. Review each exact listing for stated fabric, work, blouse details, price and availability before ordering.</p><p><a href="/sarees">Shop all sarees</a> | <a href="/size-guide">Size guide</a> | <a href="/shipping">Shipping information</a></p>',
  },
  {
    path: '/collections/reception-outfits',
    title: 'Reception Outfits | Glamorous Party Wear | LuxeMia',
    description: 'Shop reception outfits at LuxeMia. Glamorous gowns, designer lehengas & contemporary ethnic wear for wedding receptions. Stand out at every event.',
    h1: 'Reception Outfits Collection',
    content: '<p>Make a statement at wedding receptions with our glamorous collection. Designer lehengas, contemporary gowns, and elegant ethnic wear for the modern woman.</p>',
  },
  {
    path: '/collections/festive-wear',
    title: 'Festive Wear | Diwali, Eid & Celebration Outfits | LuxeMia',
    description: 'Shop festive wear at LuxeMia. Beautiful Indian outfits for Diwali, Eid, Navratri & celebrations. Sarees, lehengas, suits & more.',
    h1: 'Festive Wear Collection',
    content: '<p>Celebrate every occasion in style with our festive wear collection. Beautiful sarees, lehengas, and suits perfect for Diwali, Eid, Navratri, and all your special celebrations.</p>',
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
      <p>LuxeMia ships to United States addresses only. U.S. standard shipping is $12 below $150 and free at $150 and above.</p>
      <h2>How long does LuxeMia shipping take?</h2>
      <p>In-stock online items receive tracking after dispatch. Carrier transit time begins after dispatch.</p>
      <h2>How should I choose a LuxeMia size?</h2>
      <p>Take current body measurements and compare them with the size options and details on the exact product page. Contact LuxeMia before ordering if the listing is unclear.</p>
      <h2>What is LuxeMia’s return policy?</h2>
      <p>All sales are final and exchanges are not accepted, subject to applicable law. Report shipping damage, a defective or incorrect item, or a missing item within 48 hours of delivery with clear photos and a continuous unboxing video.</p>
      <h2>Can I cancel a LuxeMia order?</h2>
      <p>Cancellation requests must be made within 24 hours of order placement. After that window, cancellation requests are not accepted. Email hello@luxemia.shop immediately with your order number.</p>
`,
  },
  {
    path: '/shipping',
    title: 'U.S. Shipping Policy | Rates & Tracking | LuxeMia',
    description: 'LuxeMia ships to United States addresses only. Review current rates, timing, tracking and checkout guidance.',
    h1: 'Shipping Policy',
    content: '<h2>Shipping destination</h2><p>LuxeMia ships to United States addresses only.</p><h2>Rates</h2><p>U.S. standard shipping is $12 below $150 and free at $150 and above. Checkout shows the final available service and charge.</p><h2>Timing</h2><p>Standard delivery is generally estimated at 4–30 business days, including handling and transit. Product, tailoring, destination, and carrier conditions can change the estimate.</p>',
  },
  {
    path: '/pages/shipping-customs',
    title: 'U.S. Shipping & Taxes | LuxeMia',
    description: 'Shipping and tax guidance for LuxeMia customers in the United States.',
    h1: 'U.S. Shipping & Taxes',
    content: `
      <p>LuxeMia ships to United States addresses only.</p>
      <h2>How much is shipping?</h2>
      <p>U.S. standard shipping is free at $150 and above and costs $12 below that. Checkout controls the final available service and charge.</p>
      <h2>How are taxes handled?</h2>
      <p>Taxes collected by LuxeMia, if applicable, are calculated during checkout.</p>
      <h2>Questions?</h2>
      <p>Contact <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> before ordering if a shipping or checkout detail is unclear, or read the <a href="/shipping">Shipping Policy</a>.</p>
    `,
  },
  {
    path: '/returns',
    title: 'Returns, Refunds & Cancellations | LuxeMia',
    description: 'LuxeMia’s final-sale policy, 48-hour damage and order-issue claim requirements, and cancellation terms.',
    h1: 'Returns, Refunds & Cancellations',
    content: '<p>All sales are final and exchanges are not accepted, subject to applicable law. Report shipping damage, a defective or incorrect item, or a missing item within 48 hours of delivery with clear photos and a continuous unboxing video showing the unopened package, shipping label, and item condition.</p><h2>Order cancellations</h2><p>Cancellation requests must be made within 24 hours of order placement. After that window, cancellation requests are not accepted where applicable law permits. Email hello@luxemia.shop immediately with your order number.</p>',
  },
  {
    path: '/contact',
    title: 'Contact Us | LuxeMia',
    description: 'Contact LuxeMia with questions about orders, sizing or a product listing. Reach U.S.-based support by email, phone, WhatsApp or the contact form.',
    h1: 'Contact Us',
    content: '<p>Have questions about an order, sizing or a product listing? Reach U.S.-based support by email, phone, WhatsApp or the contact form.</p>',
  },
  // --- Additional routes previously missing from prerender ---
  {
    path: '/lookbook',
    title: 'Lookbook 2026 — LuxeMia | Editorial Indian Ethnic Wear',
    description: 'Explore the LuxeMia 2026 Lookbook — curated styling stories with wedding lehengas & festive ethnic wear. Editorial inspiration for the modern Indian wardrobe.',
    h1: 'Lookbook 2026',
    content: `
      <p>The LuxeMia 2026 Lookbook is a series of styling chapters that celebrate the modern Indian wardrobe — from intimate haldi mornings to grand reception nights.</p>
      <h2>Wedding Season</h2>
      <p>From the bride's grand lehenga to the groom's regal sherwani — curated ensembles for every wedding ceremony, from mehendi to reception.</p>
      <h2>Eid Collection</h2>
      <p>Celebrate in style with flowing shararas and elegant palazzo suits — graceful silhouettes in luxurious georgette, chinon, and net fabrics.</p>
      <h2>Festive Favorites</h2>
      <p>A curated mix of featured pieces across categories — versatile outfits for festive gatherings and celebrations.</p>
      <h2>His & Hers</h2>
      <p>Perfectly paired looks for couples — elegant kurta pajamas and jodhpuri suits alongside complementing lehengas and sharara sets.</p>
    `,
  },
  {
    path: '/about',
    title: 'About LuxeMia — Indian Ethnic Wear Online',
    description: 'Learn about LuxeMia, an online Indian ethnic wear store with clear product details, U.S.-based support, and tracked U.S. shipping.',
    h1: 'About LuxeMia',
    content: '<p>LuxeMia is an online Indian ethnic wear store shipping to United States addresses only. Product pages explain the available fabric, work, stitching status, sizing, and package contents for each listing.</p><p>USA-based customer support: hello@luxemia.shop or +1 215-341-9990.</p>',
  },

  {
    path: '/new-arrivals',
    category: 'all',
    title: 'New Arrivals — Latest Indian Ethnic Wear Collection | LuxeMia',
    description: "Browse products added to LuxeMia's online catalog during the past 30 days. Review each listing for exact details and availability. Free U.S. shipping at $150 and above.",
    h1: 'New Arrivals',
    content: `
      <p>Browse recently added Indian ethnic wear, including lehengas, sarees, sharara sets, salwar suits, menswear, and jewelry with shipping to United States addresses only.</p>
      <h2>What is new at LuxeMia?</h2>
      <p>This collection brings together LuxeMia's latest wedding, reception, festival, and special-occasion styles so shoppers can find newly added pieces in one place.</p>
      <p>Free U.S. shipping is available at $150 and above, with $12 flat-rate shipping below $150. Tracking is provided after dispatch.</p>
    `,
  },
  {
    path: '/indowestern',
    category: 'indowestern',
    title: 'Indo-Western Collection — Fusion Ethnic Wear | LuxeMia',
    description: 'Shop Indo-Western fusion wear at LuxeMia. Modern ethnic suits, fusion lehengas & contemporary Indian outfits. Free U.S. shipping at $150 and above.',
    h1: 'Indo-Western Collection',
    content: `
      <p>Where tradition meets modernity. Explore our Indo-Western collection featuring fusion silhouettes, contemporary cuts, and ethnic embellishments for the modern woman.</p>
      <h2>Fusion Style</h2>
      <p>Our Indo-Western collection blends the elegance of Indian craftsmanship with contemporary global fashion. Think asymmetrical hemlines, cape-style dupattas, dhoti pants paired with crop tops, and jacket-style anarkalis.</p>
      <p>Compare Indo-Western dresses and fusion wedding-guest outfits for receptions, sangeet, mehendi, and office Diwali parties. If you are shopping for an Indo-Western dress for an office Diwali party or an American wedding guest, open the exact listing for its fabric, embellishment, included pieces, sizes, and availability. Free U.S. shipping applies at $150 and above.</p>
    `,
  },
  {
    path: '/nri',
    title: 'Indian Ethnic Wear Online for U.S. Shoppers | LuxeMia',
    description: 'Shop Indian ethnic wear online for delivery to United States addresses. Compare exact product details, sizing and availability. Free U.S. shipping at $150 and above.',
    h1: 'Indian Ethnic Wear Online for U.S. Shoppers',
    content: `
      <p>Browse lehengas, sarees, salwar kameez, menswear and jewelry available online for delivery to United States addresses.</p>
      <h2>Shipping to the United States</h2>
      <p>Shipping is free at $150 and above and costs $12 below that. Tracking is provided after dispatch. Review each product page for exact sizing, tailoring options and availability.</p>
    `,
  },
  {
    path: '/indian-ethnic-wear-usa',
    title: 'Indian Ethnic Wear Online in the USA | LuxeMia',
    description: 'Shop lehengas, sarees, salwar kameez, menswear and jewelry online for U.S. delivery. Free shipping at $150 and above; $12 below. Tracking after dispatch.',
    h1: 'Indian Ethnic Wear Online in the USA',
    content: `
      <p>LuxeMia is an online Indian ethnic wear store serving shoppers with United States delivery addresses.</p>
      <h2>United States Shipping</h2>
      <p>Shipping is free at $150 and above and costs $12 below that. Tracking is provided after dispatch. Duties, taxes or carrier processing fees may apply unless checkout explicitly states otherwise.</p>
      <h2>Shop by Category</h2>
      <p>Browse <a href="/lehengas">lehengas</a>, <a href="/sarees">sarees</a>, <a href="/suits">salwar kameez</a>, <a href="/menswear">menswear</a> and <a href="/jewelry">jewelry</a>. Review each listing for exact product details, sizing and availability.</p>
    `,
  },


  {
    path: '/collections/diwali-outfits',
    category: 'occasion:diwali',
    title: 'Diwali Outfits — Current Festive Listings | LuxeMia',
    description: 'Browse currently available LuxeMia products explicitly marked for Diwali or festive occasions. Review exact product details and U.S. shipping terms.',
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
      <p>U.S. shipping is $12 below $150 and free at $150 and above. Tracking is emailed after dispatch.</p>
    `,
  },
  {
    path: '/collections/wedding-guest-outfits',
    category: 'occasion:wedding-guest',
    title: 'Indian Wedding Guest Outfits — What to Wear to an Indian Wedding | LuxeMia',
    description: 'Browse currently available products explicitly marked for wedding guests, bridesmaids, sangeet, or receptions. Review exact listing details and U.S. shipping terms.',
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
      <p>U.S. shipping is $12 below $150 and free at $150 and above. Tracking is emailed after dispatch.</p>
    `,
  },
  {
    path: '/collections/mehendi-outfits',
    category: 'occasion:mehendi',
    title: 'Mehendi Ceremony Outfits — Current Listings | LuxeMia',
    description: 'Browse currently available LuxeMia products explicitly marked for mehendi or mehndi. Review exact product details and U.S. shipping terms.',
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
      <p>U.S. shipping is $12 below $150 and free at $150 and above. Tracking is emailed after dispatch.</p>
    `,
  },
  {
    path: '/collections/haldi-outfits',
    category: 'occasion:haldi',
    title: 'Haldi Ceremony Outfits — Current Listings | LuxeMia',
    description: 'Browse currently available LuxeMia products explicitly marked for haldi or turmeric. Review exact product details and U.S. shipping terms.',
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
      <p>U.S. shipping is $12 below $150 and free at $150 and above. Tracking is emailed after dispatch.</p>
    `,
  },
  {
    path: '/collections/eid-outfits',
    category: 'occasion:eid',
    title: 'Eid Outfits — Current Listings | LuxeMia',
    description: 'Browse currently available LuxeMia products explicitly marked for Eid, Ramadan, or chikankari. Review exact product details and U.S. shipping terms.',
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
      <p>U.S. shipping is $12 below $150 and free at $150 and above. Confirm timing before ordering for a fixed date.</p>
    `,
  },
  {
    path: '/collections/navratri-outfits',
    category: 'occasion:navratri',
    title: 'Navratri Outfits USA 2026 | Garba Styles | LuxeMia',
    description: 'Shop Navratri outfits in the USA for Garba and Dandiya, including chaniya choli and festive styles. Tracked U.S. shipping; WELCOME10 for first orders.',
    h1: 'Navratri Outfits for Garba in the USA',
    content: `
      <p>Shop current Navratri lehenga, chaniya choli and festive styles for Garba and Dandiya events in the United States. This collection includes available products whose catalog details explicitly mention Navratri, Garba, chaniya, or dandiya.</p>
      <p>United States calendars list Navratri beginning Sunday, October 11, 2026. Confirm religious dates and event schedules with your temple or organizer because practices can vary by location and community.</p>
      <h2>Choose a Navratri Outfit</h2>
      <p>For Garba and Dandiya, compare skirt or garment length, closures, measurements, stitching status, included pieces, and embellishment placement. Open the exact listing to confirm fabric, work, size options, price, and availability.</p>
      <ul>
        <li><a href="/blog/navratri-9-day-color-guide-2026">Navratri Outfits USA 2026 Buying Guide</a></li>
        <li><a href="/lehengas">Shop Lehengas and Chaniya Choli</a></li>
        <li><a href="/suits">Shop Anarkali and Salwar Suits</a></li>
        <li><a href="/sizing-measurements-guide">Sizing and Measurement Guide</a></li>
      </ul>
      <p>LuxeMia ships to United States addresses only. U.S. standard shipping is $12 below $150 and free at $150 and above. Tracking is provided after dispatch. First-time shoppers can use WELCOME10 for 10% off with no minimum purchase requirement.</p>
      <p>Contact LuxeMia before ordering when your celebration date is fixed. Delivery by a particular event is not guaranteed.</p>
    `,
  },
  {
    path: '/wedding-party-orders',
    title: 'Indian Wedding Party & Group Outfit Orders | LuxeMia',
    description: 'Coordinate Indian wedding outfits for bridesmaids, groomsmen and family groups. Tell LuxeMia your event date, palette, sizes and budget.',
    h1: 'Wedding Party & Group Orders',
    content: '<p>Coordinate Indian wedding outfits for bridesmaids, groomsmen and family groups across multiple sizes, colors and events. Send LuxeMia your wedding date, group size, palette and budget for personalized help.</p>',
  },
  {
    path: '/style-quiz',
    title: 'Style Quiz — Find Your Perfect Indian Outfit | LuxeMia',
    description: 'Take the LuxeMia style quiz to discover your perfect Indian outfit. Personalized recommendations based on your taste, occasion & budget.',
    h1: 'Style Quiz',
    content: '<p>Discover your signature ethnic style. Answer a few questions and we\'ll recommend the perfect lehenga, saree, or suit for you.</p>',
    noIndex: true,
  },


  {
    path: '/privacy',
    title: 'Privacy Policy | LuxeMia',
    description: 'LuxeMia privacy policy. How we collect, use, and protect your personal information when you shop with us.',
    h1: 'Privacy Policy',
    content: '<p>Your privacy matters to us. Read our full privacy policy to understand how we collect, use, and protect your personal information.</p>',
  },
  {
    path: '/terms',
    title: 'Terms of Service | LuxeMia',
    description: 'LuxeMia terms of service. Our policies for orders, shipping, returns, and use of the LuxeMia website.',
    h1: 'Terms of Service',
    content: '<p>Read our terms of service for information about orders, shipping, returns, and use of the LuxeMia website.</p><h2>Order cancellations</h2><p>Cancellation requests must be made within 24 hours of order placement. After that window, cancellation requests are not accepted. Email hello@luxemia.shop immediately with your order number.</p>',
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
    h1: 'Thank You for Your Order',
    content: '<p>If your order was completed successfully, confirmation details will be sent to the email used at checkout. Tracking is provided after dispatch.</p>',
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
      /<link rel="alternate" hreflang="en-US" href="[^"]*"\s*\/?>/,
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
      /<link rel="alternate" hreflang="en-US" href="[^"]*"\s*\/?>/,
      `<link rel="alternate" hreflang="en-US" href="${canonical}" />`
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
      inLanguage: 'en-US',
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

  // Inject structured data (JSON-LD) for product pages
  if (route.path.startsWith('/product/')) {
    const canonical = SITE_URL + route.path;
    const handle = route.path.slice('/product/'.length);

    // Look up live product data (image, price, description) from Shopify map.
    // Fall back to the route's own metadata when Shopify lookup misses, so the
    // emitted Product schema is ALWAYS valid (Google Merchant Listings rejects
    // products missing image / offers.price / description).
    const live = route.product || null;
    const liveImages = live?.images?.edges?.map(e => forceJpegForGmc(e.node.url)).filter(Boolean) || [];
    const productImages = liveImages.length > 0 ? liveImages : [FALLBACK_OG_IMAGE];
    const productDescription = (live ? buildVerifiedProductCopy(live) : route.description || '').slice(0, 5000);
    const productPrice = live?.priceRange?.minVariantPrice?.amount || FALLBACK_PRICE;
    const productCurrency = live?.priceRange?.minVariantPrice?.currencyCode || FALLBACK_CURRENCY;
    const productVariant = live?.variants?.edges?.find((variant) => variant.node.availableForSale)?.node
      || live?.variants?.edges?.[0]?.node;
    const productSku = productVariant?.sku || '';
    const productGtin = productVariant?.barcode || '';
    const productAvailability = live?.availableForSale === true || live?.variants?.edges?.some((variant) => variant.node.availableForSale)
      ? 'InStock'
      : 'OutOfStock';
    const productBrand = normalizeBrand(live?.vendor);
    const productGtinSchema = getGtinSchemaProperty(productGtin);
    const productMpn = productBrand === 'LuxeMia' && productSku && !Object.keys(productGtinSchema).length
      ? productSku
      : '';
    const productAttributes = getListedProductAttributes(live);
    const productCategory = CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(handle)
      ? { label: 'Customizable Indian Outfits', link: '/collections/customizable-indian-outfits', schemaCategory: 'Apparel & Accessories > Clothing' }
      : getProductCategoryInfo(live?.productType || '', live?.title || route.h1);

    // Product schema — must include image, description, offers.price/priceCurrency
    // for Google Merchant Listings validation.
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonical}#product`,
      name: route.h1,
      image: productImages,
      description: productDescription,
      ...(productSku ? { sku: productSku } : {}),
      ...(productMpn ? { mpn: productMpn } : {}),
      ...productGtinSchema,
      url: canonical,
      brand: { '@type': 'Brand', name: productBrand },
      category: productCategory.schemaCategory,
      ...(productAttributes.color ? { color: productAttributes.color } : {}),
      ...(productAttributes.material ? { material: productAttributes.material } : {}),
      ...(productAttributes.sizes.length > 0 ? { size: productAttributes.sizes } : {}),
      itemCondition: 'https://schema.org/NewCondition',
      offers: {
        '@type': 'Offer',
        '@id': `${canonical}#offer`,
        url: canonical,
        // Product markup must expose the active price. The compare-at price is
        // handled by the merchant feed and visible merchandising, not an
        // invented ninety-day schema promotion window.
        price: productPrice,
        priceCurrency: productCurrency,
        availability: `https://schema.org/${productAvailability}`,
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': `${SITE_URL}/#org` },
        hasMerchantReturnPolicy: { '@id': `${SITE_URL}/#returnPolicy` },
        shippingDetails: US_PRODUCT_SHIPPING_DETAILS,
      },
    };

    // Breadcrumb schema for product pages
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
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
    const { publishedAt, updatedAt, factCheckedAt, sources = [] } = route.blogPost;
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: route.h1,
      description: route.description,
      url: SITE_URL + route.path,
      mainEntityOfPage: SITE_URL + route.path,
      datePublished: publishedAt,
      dateModified: updatedAt,
      author: { '@type': 'Organization', name: 'LuxeMia Editorial Team', url: SITE_URL + '/authors/luxemia-editorial-team' },
      publisher: { '@type': 'Organization', name: 'LuxeMia', url: SITE_URL },
      citation: sources.map(source => source.url),
      isBasedOn: sources.map(source => ({
        '@type': 'CreativeWork',
        name: source.title,
        publisher: source.publisher,
        url: source.url,
      })),
    };
    const reviewMeta = `
    <meta property="article:published_time" content="${escapeHtml(publishedAt)}" />
    <meta property="article:modified_time" content="${escapeHtml(updatedAt)}" />
    <meta name="last-reviewed" content="${escapeHtml(factCheckedAt)}" />`;
    html = html.replace('</head>', `${reviewMeta}\n    <script type="application/ld+json" data-prerender-schema>${JSON.stringify(articleSchema)}</script>\n</head>`);
  }

  // Inject SEO content into the body. This content is visible to search engine crawlers
  // and accessible to screen readers. JavaScript removes it once React has mounted
  // so regular users see only the React-rendered UI (no duplicate content).

  // For product pages with live Shopify data, generate rich visible content:
  // price, image, full description, product details, shipping info.
  // This is the key fix for Google's "thin content" / "crawled but not indexed" signal.
  let mainBodyContent;
  if (route.path.startsWith('/product/') && route.product) {
    const p = route.product;
    const initialProductPayload = buildInitialProductPayload(p);
    html = html.replace('</head>', `    <script>window.__INITIAL_PRODUCT_DATA__ = ${initialProductPayload};</script>\n</head>`);
    const isCustomizable = CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(p.handle);
    const price = p.priceRange?.minVariantPrice?.amount || FALLBACK_PRICE;
    const currency = p.priceRange?.minVariantPrice?.currencyCode || FALLBACK_CURRENCY;
    const comparePrice = p.compareAtPriceRange?.maxVariantPrice?.amount;
    const isAvailable = p.availableForSale === true || p.variants?.edges?.some((variant) => variant.node.availableForSale);
    const images = p.images?.edges?.map(e => e.node) || [];
    const description = buildVerifiedProductCopy(p);
    const productType = (p.productType || '').trim();
    const vendor = (p.vendor || '').trim();
    const brandName = (!vendor || vendor.toLowerCase() === 'luxemia') ? 'LuxeMia' : vendor;
    const productAttributes = getListedProductAttributes(p);
    const productCategory = CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(p.handle)
      ? { label: 'Customizable Indian Outfits', link: '/collections/customizable-indian-outfits', schemaCategory: 'Apparel & Accessories > Clothing' }
      : getProductCategoryInfo(productType, p.title || route.h1);

    let priceHtml = `<strong>${currency} ${parseFloat(price).toFixed(2)}</strong>`;
    if (comparePrice && parseFloat(comparePrice) > parseFloat(price)) {
      priceHtml += ` <s style="color:#888">${currency} ${parseFloat(comparePrice).toFixed(2)}</s>`;
    }

    // Category link and schema category use the same product classification.
    const categoryLink = productCategory.link;
    const categoryLabel = productCategory.label;

    const firstImage = images[0];
    const imgHtml = firstImage
      ? `<img src="${escapeHtml(forceJpegForGmc(firstImage.url))}" alt="${escapeHtml(firstImage.altText || route.h1)}" width="600" loading="lazy" style="max-width:100%;height:auto;display:block;margin:12px 0">`
      : '';

    const descHtml = description
      ? `<h2>Product Description</h2><p>${escapeHtml(description).slice(0, 2000)}</p>`
      : '';

    const fabricDetails = productAttributes.material
      || 'Review the product description for the fabric or material supplied with this listing.';
    const includedPieces = productAttributes.includedPieces
      || 'See the product description and images. Contact LuxeMia before ordering if the set contents are not stated.';
    const sizingDetails = isCustomizable
      ? 'Made to order from measurements confirmed with LuxeMia. Contact LuxeMia before ordering if you need help taking or submitting them.'
      : productAttributes.sizes.length > 0
      ? `Listed options: ${productAttributes.sizes.join(', ')}. Review the Size Guide before ordering.`
      : 'Available sizing varies by product. Review the options shown for this listing and the Size Guide before ordering.';
    const shippingEstimate = isCustomizable
      ? 'The source listing carries an approximate 4–5 week total order window. LuxeMia confirms production time and carrier transit separately after the requested color, measurements, fabric availability, and delivery address are known.'
      : productAttributes.shipsWithinDays
      ? `Ships within ${productAttributes.shipsWithinDays} business day${productAttributes.shipsWithinDays === 1 ? '' : 's'}. Tracking details are emailed when the shipping label is created for dispatch.`
      : 'Timing depends on the item and selected options. Tracking details are emailed when the shipping label is created for dispatch.';
    const detailRows = [
      `<div><dt>Fabric Details</dt><dd>${escapeHtml(fabricDetails)}</dd></div>`,
      `<div><dt>Included Pieces</dt><dd>${escapeHtml(includedPieces)}</dd></div>`,
      `<div><dt>Sizing &amp; Chart</dt><dd>${escapeHtml(sizingDetails)}</dd></div>`,
      `<div><dt>Shipping Estimate</dt><dd>${escapeHtml(shippingEstimate)}</dd></div>`,
      productType ? `<div><dt>Type</dt><dd>${escapeHtml(productType)}</dd></div>` : '',
      `<div><dt>Brand</dt><dd>${escapeHtml(brandName)}</dd></div>`,
      productAttributes.color ? `<div><dt>Color</dt><dd>${escapeHtml(productAttributes.color)}</dd></div>` : '',
      `<div><dt>Availability</dt><dd>${isAvailable ? 'In Stock' : 'Currently Unavailable'}</dd></div>`,
      `<div><dt>Ships to</dt><dd>United States</dd></div>`,
    ].filter(Boolean).join('\n        ');

    const sizeAnswer = isCustomizable
      ? 'This design is made to order from measurements confirmed with LuxeMia. Contact LuxeMia before ordering if you need help taking or submitting them.'
      : productAttributes.sizes.length > 0
      ? `Available choices shown for this listing are ${escapeHtml(productAttributes.sizes.join(', '))}. Review the Size Guide before ordering.`
      : 'Any available size or tailoring choices are shown on this product page. Contact LuxeMia before ordering if an option is unclear.';
    const firstQuestion = productAttributes.jewelry
      ? `<h3>What is included with the ${escapeHtml(p.title || route.h1)}?</h3><p>The included pieces, finish, colors, and measurements are the ones stated in Product Details and shown in the product images. Contact LuxeMia before ordering if the set contents are unclear.</p>`
      : `<h3>What sizes are available?</h3><p>${sizeAnswer}</p>`;
    const careAnswer = productAttributes.jewelry
      ? 'Keep jewelry away from water, perfume, lotion, and household chemicals. Wipe gently after wear and store pieces separately in a soft pouch.'
      : 'Follow any product-specific care instructions. Dry cleaning is recommended for embroidered or embellished ethnic wear.';
    const deliveryAnswer = isCustomizable
      ? 'The source listing carries an approximate 4–5 week total order window. LuxeMia confirms production time and carrier transit separately after the requested color, measurements, fabric availability, and delivery address are known. Contact LuxeMia before ordering for a fixed event date.'
      : productAttributes.jewelry
      ? 'Delivery timing depends on the item. Tracking details are emailed when the shipping label is created for dispatch. Shipping is available to United States addresses only.'
      : 'Delivery timing depends on the item and any selected tailoring. Tracking details are emailed when the shipping label is created for dispatch. Shipping is available to United States addresses only.';
    const productQuestionsHtml = `
      <h2>Product Questions</h2>
      ${firstQuestion}
      ${isCustomizable ? `<h3>Can I request another color?</h3><p>Yes. A custom color is available for this verified design, subject to fabric availability. Contact LuxeMia with the product link and requested color before ordering. Other design changes are not promised unless confirmed in writing.</p>` : ''}
      <h3>How is this product shipped?</h3>
      <p>${deliveryAnswer}</p>
      <h3>What is the return policy?</h3>
      <p>All sales are final and exchanges are not accepted, subject to applicable law. Report shipping damage, a defective or incorrect item, or a missing item within 48 hours of delivery with clear photos and a continuous unboxing video.</p>
      <h3>How should I care for this product?</h3>
      <p>${careAnswer}</p>`;

    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      <p>Price: ${priceHtml} | ${isAvailable ? 'In Stock' : 'Out of Stock'}</p>
      ${imgHtml}
      ${descHtml}
      <h2>Product Specifications</h2>
      <dl>
        ${detailRows}
      </dl>
      ${productQuestionsHtml}
      <h2>Shipping &amp; Delivery</h2>
      <p>Shipping is available to United States addresses only. U.S. standard shipping is free at $150 and above and $12 below $150. Tracking details are emailed when the shipping label is created for dispatch.</p>
      <p><a href="${escapeHtml(categoryLink)}">${escapeHtml(categoryLabel)}</a> | <a href="/collections">All Collections</a></p>`;
  } else if (route.htmlSitemap && allShopifyProducts && allShopifyProducts.size > 0) {
    const approvedProducts = Array.from(allShopifyProducts.values())
      .filter((product) => APPROVED_SITEMAP_PATHS.has(`/product/${product.handle}`));
    console.log(`[prerender] ${route.path}: linked ${approvedProducts.length} approved products in HTML directory`);
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}
      ${generateApprovedStaticDirectoryHtml()}
      <h2>All Current Products</h2>
      ${generateApprovedProductDirectoryHtml(approvedProducts)}`;
  } else if (route.category && allShopifyProducts && allShopifyProducts.size > 0) {
    // Collection route (sarees/lehengas/suits/menswear/indowestern/collections/new-arrivals)
    // Inject REAL Shopify products so Googlebot sees a fully populated category page on
    // first byte instead of an empty marketing shell. This is the SEO fix for the
    // 100 -> 7 impression drop on collection pages.
    const allProducts = Array.from(allShopifyProducts.values());
    const collectionProducts = filterProductsForCategory(allProducts, route.category, route.path === '/new-arrivals');
    console.log(`[prerender] ${route.path}: matched ${collectionProducts.length} products for category '${route.category}'`);

    if (collectionProducts.length === 0) {
      html = html.replace(
        /<meta name="(robots|googlebot|bingbot)" content="[^"]*" \/>/g,
        '<meta name="$1" content="noindex, follow" />'
      );
    }

    if (collectionProducts.length > 0) {
      // ItemList JSON-LD — Google Merchant Center reads this for collection rich results.
      const itemListJsonLd = generateItemListJsonLd(collectionProducts, route.category, route.path);
      html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(itemListJsonLd)}</script>\n</head>`);

      if (route.path === '/collections/navratri-outfits') {
        const canonical = `${SITE_URL}${route.path}`;
        const collectionPageJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': canonical,
          url: canonical,
          name: route.h1,
          description: route.description,
          inLanguage: 'en-US',
          mainEntity: { '@id': `${canonical}#products` },
          isPartOf: { '@id': `${SITE_URL}/#website` },
        };
        html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(collectionPageJsonLd)}</script>\n</head>`);
      }

      // Compact JSON payload for React hydration — useShopifyProducts reads this on mount
      // and skips the client-side Shopify fetch entirely on first paint.
      const initialDataPayload = buildInitialDataPayload(collectionProducts, route.category);
      html = html.replace('</head>', `    <script>window.__INITIAL_DATA__ = ${initialDataPayload};</script>\n</head>`);
    }

    // Visible product cards for crawlers (removed by MutationObserver once React hydrates)
    const productCardsHtml = generateCollectionProductHtml(collectionProducts);
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}
      <h2>Products in this Collection</h2>
      ${productCardsHtml}`;
  } else if (route.path === '/' && allShopifyProducts && allShopifyProducts.size > 0) {
    const homepageProducts = filterProductsForCategory(
      Array.from(allShopifyProducts.values()),
      'all',
      true,
    ).slice(0, 12);
    const itemListJsonLd = generateItemListJsonLd(homepageProducts, 'all', route.path);
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(itemListJsonLd)}</script>\n</head>`);
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}
      <h2>Recently Added Indian Ethnic Wear</h2>
      ${generateCollectionProductHtml(homepageProducts)}`;
  } else {
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}`;
  }

  const seoContent = `
    <main id="seo-prerender">
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
        <a href="/blog">Blog</a> |
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
    </main>
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
  const indexPath = path.join(DIST_DIR, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('Error: dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const template = fs.readFileSync(indexPath, 'utf-8');
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
        content: `${post.content || `<p>${escapeHtml(post.excerpt || post.title)}</p>`}${sourceReview}`,
        blogPost: {
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          factCheckedAt: post.factCheckedAt,
          sources: post.sources || [],
        },
      });
      autoBlogCount++;
    }
    console.log(`[prerender] Published ${allBlogPosts.length} blog articles, ${allCategoryGroups.length} active hubs, and auto-generated ${autoBlogCount} missing article routes`);
  } catch (err) {
    console.error(`[prerender] WARNING: Failed to load published blog data: ${err.message}`);
    console.error('[prerender] Blog output may be incomplete; coverage verification will fail if a registered route is missing.');
  }

  // Pre-fetch live Shopify product data so /product/* prerendered HTML
  // emits valid Product JSON-LD with image, description, and offers.price.
  const productMap = await fetchAllShopifyProducts();
  const hardcodedProductHandles = new Set();
  for (const route of routes) {
    if (route.path.startsWith('/product/')) {
      const handle = route.path.slice('/product/'.length);
      hardcodedProductHandles.add(handle);
      const live = productMap.get(handle);
      if (live) {
        route.product = live;
        // The hardcoded route inventory predates some Shopify title cleanups.
        // Keep static H1, schema, breadcrumb, and hydrated title parity by
        // normalizing the current live title before HTML is rendered.
        route.h1 = sanitizeProductTitle(live.title || route.h1) || route.h1;
      }
    }
  }

  // Auto-generate a route entry for every Shopify product NOT already in the
  // hardcoded list. This guarantees a prerendered HTML file with valid Product
  // JSON-LD exists for every /product/<handle> on the live site (was previously
  // only ~73 of 360 products — the rest fell through to the empty SPA shell
  // with no Product schema, breaking GMC validation).
  for (const [handle, p] of productMap.entries()) {
    if (hardcodedProductHandles.has(handle)) continue;
    // Prefer Shopify admin "Search engine listing" (SEO) fields when set.
    // Falls back to plain product title + " | LuxeMia" suffix.
    // IMPORTANT: when seoTitle is set, use it VERBATIM. Shopify's SEO title
    // field is the complete title the user wants shown in search results —
    // Shopify itself often auto-populates it as "{productTitle} | {shopName}",
    // so appending " | LuxeMia" here would produce "... | LuxeMia | LuxeMia".
    const seoTitle = sanitizeProductTitle((p.seo?.title || '').trim());
    const seoDescription = ''; // Ignore obsolete Shopify SEO copy; use field-backed copy below.

    // ─── USP-enhanced title generation ──────────────────────────────────────
    // When no Shopify SEO title is set, inject fabric/color USP into the title
    // to carve out high-converting long-tail niches (e.g., "Maroon Raw Silk
    // Bridal Lehenga | Hand Embroidery | LuxeMia") that corporate catalogs lack.
    const desc = buildVerifiedProductCopy(p);
    const baseTitle = sanitizeProductTitle(p.title || handle);
    const productIsJewelry = isJewelryProduct(p.productType, baseTitle);
    const titleDescLower = `${baseTitle} ${desc}`.toLowerCase();

    // Fabric + color detection arrays (shared by title + description generation)
    const fabrics = ['raw silk', 'banarasi silk', 'kanchipuram silk', 'kanjivaram', 'georgette', 'chiffon', 'velvet', 'organza', 'chinnon', 'chinon', 'crepe', 'net', 'cotton', 'satin', 'taffeta', 'jacquard', 'tussar', 'brocade', 'silk', 'art silk'];
    const colors = ['maroon', 'wine', 'burgundy', 'red', 'pink', 'rani pink', 'baby pink', 'dusty rose', 'blue', 'navy', 'royal blue', 'sky blue', 'teal', 'green', 'emerald', 'olive', 'mint', 'sage', 'yellow', 'gold', 'mustard', 'orange', 'peach', 'coral', 'rust', 'purple', 'lavender', 'plum', 'mauve', 'lilac', 'white', 'ivory', 'cream', 'beige', 'black', 'grey', 'gray', 'champagne', 'copper', 'bronze'];
    const foundFabric = productIsJewelry ? undefined : fabrics.find(f => titleDescLower.includes(f));
    const foundColor = colors.find(c => titleDescLower.includes(c));

    let title;
    if (seoTitle) {
      title = seoTitle;
    } else {
      // Build USP suffix: "in Maroon Raw Silk" or "in Raw Silk" or ""
      let uspSuffix = '';
      if (foundFabric && foundColor) {
        uspSuffix = ` in ${foundColor.charAt(0).toUpperCase() + foundColor.slice(1)} ${foundFabric.charAt(0).toUpperCase() + foundFabric.slice(1)}`;
      } else if (foundFabric) {
        uspSuffix = ` in ${foundFabric.charAt(0).toUpperCase() + foundFabric.slice(1)}`;
      }

      // Keep title under 70 chars for SERP display
      const candidateTitle = `${baseTitle}${uspSuffix} | LuxeMia`;
      title = candidateTitle.length > 70
        ? `${baseTitle} | LuxeMia`
        : candidateTitle;
    }

    // ─── USP-enhanced fallback description ──────────────────────────────────
    // Injects fabric, color, and shipping turnaround into the fallback so even
    // products with thin Shopify descriptions get unique, keyword-rich meta.
    const fabricPhrase = foundFabric ? ` ${foundFabric.charAt(0).toUpperCase() + foundFabric.slice(1)}` : '';
    const colorPhrase = foundColor ? ` ${foundColor.charAt(0).toUpperCase() + foundColor.slice(1)}` : '';
    const fallbackDesc = productIsJewelry
      ? `Shop ${baseTitle} at LuxeMia. Indian jewelry with shipping to United States addresses only. Review the listing for exact materials, finish, stones, and included pieces.`
      : `Shop the${colorPhrase}${fabricPhrase} ${baseTitle} at LuxeMia. Indian ethnic wear with shipping to United States addresses only; current rates are shown at checkout.`;
    const description = (seoDescription || (desc.length >= 60 ? desc : fallbackDesc)).slice(0, 320);
    routes.push({
      path: `/product/${handle}`,
      title,
      description,
      h1: sanitizeProductTitle(p.title) || handle,
      content: `<p>${escapeHtml(desc || fallbackDesc).slice(0, 1200)}</p>`,
      product: p,
    });
  }
  console.log(`[prerender] Total /product/* routes after Shopify merge: ${routes.filter(r => r.path.startsWith('/product/')).length}`);

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

  // Fail the build loudly if Shopify fetch returned no products.
  // This prevents deploying a site where every product page returns an empty SPA shell.
  if (SHOPIFY_STOREFRONT_TOKEN && productCount < 10) {
    console.error(`\n[prerender] CRITICAL BUILD FAILURE`);
    console.error(`[prerender] Only ${productCount} product HTML files generated but SHOPIFY_STOREFRONT_TOKEN is set.`);
    console.error(`[prerender] This means the Shopify Storefront API returned 0 products.`);
    console.error(`[prerender] Possible causes:`);
    console.error(`[prerender]   - SHOPIFY_STOREFRONT_TOKEN is set but invalid or expired`);
    console.error(`[prerender]   - Shopify store has no published products`);
    console.error(`[prerender]   - Shopify API rate limit hit`);
    console.error(`[prerender]   - Network error connecting to Shopify`);
    console.error(`[prerender] Fix: verify the token at Vercel → Project → Settings → Environment Variables`);
    process.exit(1);
  }

  if (!SHOPIFY_STOREFRONT_TOKEN) {
    console.warn(`\n[prerender] WARNING: SHOPIFY_STOREFRONT_TOKEN is not set.`);
    console.warn(`[prerender] Only ${productCount} hardcoded product pages were generated.`);
    console.warn(`[prerender] Set SHOPIFY_STOREFRONT_TOKEN in Vercel environment variables to prerender all products.`);
  }

  // Write prerenderManifest.ts with the EXACT set of product handles that have
  // prerendered HTML files. Middleware imports this so it knows which handles to
  // rewrite without self-HTTP requests or mismatches with generate-routes output.
  const prerenderedHandles = routes
    .filter(r => r.path.startsWith('/product/'))
    .map(r => r.path.slice('/product/'.length));

  const manifestContent = `// AUTO-GENERATED by scripts/prerender.js — do not edit manually.
// Contains the exact set of product handles with a prerendered HTML file in dist/_prerender/product/.
// Regenerated on each build. Imported by middleware.ts to avoid self-HTTP HEAD requests.

export const PRERENDERED_PRODUCT_HANDLES: Set<string> = new Set([
${prerenderedHandles.map(h => `  '${h}',`).join('\n')}
]);
`;

  const manifestPath = path.resolve(__dirname, '../src/lib/prerenderManifest.ts');
  fs.writeFileSync(manifestPath, manifestContent, 'utf-8');
  console.log(`[prerender] Written src/lib/prerenderManifest.ts with ${prerenderedHandles.length} product handles`);

  const buildManifestPath = path.join(prerenderDir, 'manifest.json');
  fs.writeFileSync(
    buildManifestPath,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      routes: routes.map((route) => route.path),
      productHandles: prerenderedHandles,
    }, null, 2),
    'utf-8'
  );
  console.log(`[prerender] Written ${buildManifestPath} with ${routes.length} routes`);
}

main().catch(err => {
  console.error('[prerender] Fatal error:', err);
  process.exit(1);
});
