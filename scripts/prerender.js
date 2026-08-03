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

// ─── TypeScript Data Loader ───────────────────────────────────────────────
// Bundles a .ts data module (blogPosts.ts or comboPages.ts)
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
    // Type-only imports (e.g. `@/components/combo/ComboPage`) are erased by
    // esbuild's TS transform, so they never need to resolve at bundle time.
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
    .replace(/Ships within 1[–-]2 business days from the USA\.\s*Free shipping on orders over \$99\./gi, 'Free U.S. shipping over $150. $12 flat below that. Tracking provided after dispatch.')
    .replace(/Free worldwide shipping to USA, Canada, and Australia via DHL\/USPS\/UPS \(7-10 business days\)/gi, 'Free U.S. shipping over $150. $12 flat below that. Tracking provided after dispatch')
    .replace(/Free worldwide shipping to [^.]+?(?:arriving in |delivered in |within )?7-10 business days/gi, 'Free U.S. shipping over $150. $12 flat below that. Tracking provided after dispatch')
    .replace(/Free worldwide shipping to [^.]+?via DHL\/USPS\/UPS/gi, 'Free U.S. shipping over $150. $12 flat below that. Tracking provided after dispatch')
    .replace(/Shipping:\s*5-day express delivery to USA and Canada/gi, 'Shipping: tracking provided after dispatch')
    .replace(/ready[- ]to[- ]ship Indian wear USA/gi, 'Indian ethnic wear online')
    .replace(/ready[- ]to[- ]ship/gi, 'available online')
    .replace(/within two business days/gi, 'with tracked shipping')
    .replace(/within 2 business days/gi, 'with tracked shipping')
    .replace(/from the USA/gi, 'with U.S. delivery')
    .replace(/USA, Canada, and Australia/gi, 'the United States')
    .replace(/free shipping on orders over \$350/gi, 'free U.S. shipping over $150');
}

function sanitizeProductTitle(value) {
  return (value || '')
    .replace(/^buy\s+/i, '')
    .replace(/\s*(?:[|–—-]\s*)?ready[-\s]?to[-\s]?ship\b/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?handcrafted indian bridal luxury\b/gi, '')
    .replace(/\bhandcrafted\s+/gi, '')
    .replace(/\s*[|–—-]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const JEWELRY_PRODUCT_PATTERN = /\b(jewel|jewell|necklace|choker|earring|bangle|bracelet|ring|maang\s*tikka|anklet|kundan|polki)\b/i;

function isJewelryProduct(productType = '', title = '') {
  return JEWELRY_PRODUCT_PATTERN.test(`${productType} ${title}`);
}

function getListedProductAttributes(product) {
  const jewelry = isJewelryProduct(product?.productType, product?.title);
  const listingText = `${product?.title || ''} ${product?.description || ''}`.toLowerCase();
  const optionValue = (...names) => product?.options
    ?.find(option => names.includes((option.name || '').toLowerCase()))
    ?.values?.[0];
  const rawColor = optionValue('color');
  const rawMaterial = optionValue('fabric', 'material');
  const sizeValues = product?.options
    ?.find(option => ['size', 'bust size', 'chest size'].includes((option.name || '').toLowerCase()))
    ?.values
    ?.filter(value => value && value.toLowerCase() !== 'default title') || [];

  return {
    jewelry,
    color: rawColor && (!jewelry || listingText.includes(rawColor.toLowerCase())) ? rawColor : undefined,
    material: rawMaterial && (!jewelry || listingText.includes(rawMaterial.toLowerCase())) ? rawMaterial : undefined,
    sizes: jewelry ? [] : sizeValues,
  };
}

function buildVerifiedProductCopy(product) {
  if (!product) return '';

  const title = sanitizeProductTitle(product.title || product.handle || 'Indian ethnic wear');
  const attributes = getListedProductAttributes(product);
  const parts = [`${title}.`];

  if (product.productType) parts.push(`Category: ${product.productType}.`);
  if (attributes.color) parts.push(`Color: ${attributes.color}.`);
  if (attributes.material) parts.push(`Material: ${attributes.material}.`);
  if (attributes.sizes.length > 0) {
    parts.push(`Available options: ${attributes.sizes.join(', ')}.`);
  }

  parts.push(
    'Review the product images and available options for the exact pieces, measurements, and current availability.',
    'United States shipping only. Shipping is $12 for orders under $150 and free for orders over $150. Tracking is provided after dispatch.'
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
  return { schemaCategory: productType || 'Clothing > Traditional & Ethnic Wear', link: '/products', label: 'All Products' };
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
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 5) {
          edges {
            node {
              id
              title
              sku
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
        if (p?.handle) map.set(p.handle, p);
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

// Server-side mirror of filterByCategory() from useShopifyProducts.ts.
// Returns up to MAX_COLLECTION_PRODUCTS for the prerendered HTML payload.
const MAX_COLLECTION_PRODUCTS = 50;

function filterProductsForCategory(allProducts, category, newestFirst = false) {
  if (category.startsWith('collection:')) {
    const handle = category.slice('collection:'.length);
    const tagsFor = (product) => new Set((product.tags ?? []).map((tag) => tag.toLowerCase().trim()));
    const matches = allProducts.filter((product) => {
      if (EXCLUDED_TITLE_KEYWORDS.test(product.title ?? '')) return false;
      const productType = (product.productType ?? '').toLowerCase();
      const title = (product.title ?? '').toLowerCase();
      const tags = tagsFor(product);

      if (handle === 'silk-sarees') {
        return productType.includes('saree') && title.includes('silk');
      }
      if (handle === 'kanchipuram-sarees') {
        return ['kanchipuram', 'kanjivaram', 'kanjeevaram'].some((tag) => tags.has(tag));
      }
      if (handle === 'manthrakodi-sarees') {
        return ['manthrakodi', 'manthrokodi', 'kerala-christian-bridal-saree'].some((tag) => tags.has(tag));
      }
      if (handle === 'bridal-party-outfits') {
        return [
          'bridal-party',
          'bridal party outfit lehenga',
          'bridesmaid outfit',
          'role:bridesmaid',
          'maid of honor',
          'matron of honor',
          'role:maid-of-honor',
        ].some((tag) => tags.has(tag));
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
    return allowed
      .filter(p => {
        const createdAt = new Date(p.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt > cutoff;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_COLLECTION_PRODUCTS);
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
      tags: p.tags ?? [],
      availableForSale: p.availableForSale,
      shipsWithinMetafield: p.shipsWithinMetafield || null,
      priceRange: p.priceRange,
      compareAtPriceRange: p.compareAtPriceRange,
      images: p.images,
      variants: p.variants,
      options: p.options ?? [],
    },
  }));
  return JSON.stringify({ category: category || 'all', products: slim });
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
    const availability = p.availableForSale === false
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';
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
          validFrom: new Date().toISOString(),
          priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability,
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: 'LuxeMia' },
          shippingDetails: [
            {
              '@type': 'OfferShippingDetails',
              name: Number(price) >= 150
                ? 'Free US Shipping for This Order'
                : 'Flat US Shipping Below $150',
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: Number(price) >= 150 ? '0' : '12.00',
                currency,
              },
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
            },
          ],
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'US',
            returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
            description: 'All sales are final. LuxeMia does not accept returns or exchanges. Only genuine shipping damage claims are accepted within 48 hours with mandatory unboxing video.',
          },
        },
      },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
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
        text: 'LuxeMia currently ships to United States addresses only. Free US shipping applies over $150, and a flat $12 rate applies below $150.',
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
      name: 'Does LuxeMia offer custom sizing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sizing and tailoring options vary by garment. Review the product page and size selector, and contact LuxeMia before ordering if you need measurement help.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is LuxeMia’s return policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All sales are final. LuxeMia does not accept returns or exchanges for sizing issues, color variations, or change of mind. Genuine shipping damage must be reported within 48 hours with an unboxing video.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel a LuxeMia order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Orders can be cancelled within 24 hours of placement. After that window, the order cannot be cancelled.',
      },
    },
  ],
};

const MEASUREMENT_HOW_TO_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to measure for a custom-stitched Indian outfit',
  description: 'Measure your bust, waist, hips, garment length, and sleeves for a custom-stitched lehenga choli, saree blouse, anarkali, or salwar kameez.',
  totalTime: 'PT10M',
  supply: [
    { '@type': 'HowToSupply', name: 'Soft measuring tape' },
    { '@type': 'HowToSupply', name: 'Pen and paper' },
    { '@type': 'HowToSupply', name: 'A friend to assist, if available' },
  ],
  tool: [{ '@type': 'HowToTool', name: 'Soft measuring tape' }],
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Measure your bust', text: 'Wear the bra you plan to use with the outfit. Wrap the tape around the fullest part of your bust and keep it level across your back.' },
    { '@type': 'HowToStep', position: 2, name: 'Measure your waist', text: 'Measure around your natural waist at the narrowest part of your torso without pulling the tape tight.' },
    { '@type': 'HowToStep', position: 3, name: 'Measure your hips', text: 'Stand with your feet together and measure around the fullest part of your hips, keeping the tape parallel to the floor.' },
    { '@type': 'HowToStep', position: 4, name: 'Measure the garment length', text: 'Measure from the garment starting point to the desired hem. Wear the shoes you plan to use when measuring a floor-length lehenga or anarkali.' },
    { '@type': 'HowToStep', position: 5, name: 'Measure sleeve length and circumference', text: 'Measure from the shoulder point to the desired sleeve end, then measure around the arm where the sleeve will finish.' },
  ],
};

// Route definitions with SEO metadata
const routes = [
  {
    path: '/',
    title: 'LuxeMia — Indian Ethnic Wear Online',
    description: "Indian sarees, lehengas, suits and menswear available online with tracked U.S. shipping. For weddings and festivals that are sooner than you'd like.",
    h1: 'Indian Ethnic Wear Online',
    content: `
      <p>Available online with tracked U.S. shipping. For the wedding that's sooner than you'd like.</p>
      <h2>What can I shop at LuxeMia?</h2>
      <p>LuxeMia offers lehengas, sarees, salwar kameez, and menswear for weddings, festivals, and special occasions.</p>
      <nav>
        <ul>
          <li><a href="/lehengas">Lehengas</a> — Bridal & wedding lehenga choli collections</li>
          <li><a href="/sarees">Sarees</a> — Banarasi, Kanjeevaram & designer sarees</li>
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
      <p>Free U.S. shipping over $150. $12 flat below that. Tracking provided after dispatch.</p>
    `,
  },
  {
       path: '/suits',
    category: 'suits',
    title: 'Buy Salwar Suits Online — Anarkali, Palazzo & Sharara | LuxeMia',
    description: 'Shop salwar kameez, anarkali, sharara and palazzo suits online. Compare exact fabric, included pieces, sizing and availability. Free U.S. shipping over $150.',
    h1: 'Salwar Kameez & Designer Suits Collection',
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
        <li><a href="/suits?sub=anarkali">Anarkali Suits</a> — Flowing Mughal-inspired silhouette</li>
        <li><a href="/suits?sub=sharara">Sharara Sets</a> — Wide-legged flared pants with short kurti</li>
        <li><a href="/suits?sub=palazzo">Palazzo Suits</a> — Modern wide-leg pants with kurta</li>
        <li><a href="/suits?sub=pakistani">Pakistani Suits</a> — Elegant straight-cut designer suits</li>
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
        <li><a href="/suits?sub=premium-300-plus">Premium Suits $300+</a> — Designer & heavily embellished</li>
      </ul>
    `,
  },
  {
    path: '/lehengas',
    category: 'lehengas',
    title: 'Buy Bridal Lehengas Online | Wedding & Festive Lehenga Choli — LuxeMia',
    description: 'Shop bridal, wedding guest, reception and festive lehengas online. Compare exact fabric, work, included pieces, sizing and availability. Free U.S. shipping over $150.',
    h1: 'Designer Lehengas & Bridal Lehenga Collection',
    content: `
      <p>Discover bridal, wedding guest, reception and festive lehengas. Review each product page for the exact fabric, work, included pieces, stitching status, sizing and availability.</p>
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
      <h2>Shop Lehengas by Style</h2>
      <ul>
        <li><a href="/lehengas?sub=floral">Floral Lehengas</a> — Romantic floral embroidery</li>
        <li><a href="/lehengas?sub=embroidered">Embroidered Lehengas</a> — Review each listing for its stated embroidery and work details</li>
        <li><a href="/lehengas?sub=designer">Designer Lehengas</a> — Couture-inspired pieces</li>
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
        <li><a href="/lehengas?sub=premium-300-plus">Premium Lehengas $300+</a> — Designer & heavily embellished</li>
      </ul>
    `,
  },
  {
    path: '/sarees',
    category: 'sarees',
    title: 'Buy Sarees Online — Silk, Banarasi & Wedding Sarees | LuxeMia',
    description: 'Shop silk, wedding, festive and designer sarees online. Compare exact fabric, weave or work, blouse details and availability. Free U.S. shipping over $150.',
    h1: 'Designer Sarees — Silk, Banarasi & Wedding Collection',
    content: `
      <p>Explore sarees for weddings, festivals and special occasions. Review each product page for the exact fabric, weave or work, blouse details, dimensions and availability.</p>
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
        <li><a href="/sarees?sub=silk">Silk Sarees</a> — Premium silk sarees</li>
        <li><a href="/sarees?sub=banarasi">Banarasi Sarees</a> — Check each listing for exact weave and origin details</li>
        <li><a href="/sarees?sub=kanjeevaram">Kanjeevaram Sarees</a> — Premium South Indian silk</li>
        <li><a href="/sarees?sub=georgette">Georgette Sarees</a> — Lightweight & elegant</li>
        <li><a href="/sarees?sub=chiffon">Chiffon Sarees</a> — Flowy & comfortable</li>
        <li><a href="/sarees?sub=organza">Organza Sarees</a> — Modern sheer fabric</li>
      </ul>
      <h2>Shop Sarees by Style</h2>
      <ul>
        <li><a href="/sarees?sub=embroidered">Embroidered Sarees</a> — Review each listing for its stated work details</li>
        <li><a href="/sarees?sub=printed">Printed Sarees</a> — In-stock and easy to wear</li>
        <li><a href="/sarees?sub=designer">Designer Sarees</a> — Couture-inspired pieces</li>
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
        <li><a href="/sarees?sub=premium-300-plus">Premium Sarees $300+</a> — Designer & heavily embellished</li>
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
      <p>Discover silk sarees selected for weddings, receptions, pujas and festive celebrations. Each product page states the supplied fabric details so you can compare drape, finish, work and blouse options before ordering.</p>
      <h2>How should I choose a silk saree online?</h2>
      <p>Compare the exact fabric composition, weight, border, embellishment and blouse details on each listing. Silk sarees can use pure silk, blended silk or art-silk fabrics, so LuxeMia states the information supplied for each product.</p>
      <p><a href="/sarees">Browse all sarees</a> or <a href="/contact">ask our styling team</a> for help choosing a wedding saree.</p>
    `,
  },
  {
    path: '/collections/kanchipuram-sarees',
    category: 'collection:kanchipuram-sarees',
    title: 'Kanchipuram Sarees Online | Wedding Sarees | LuxeMia',
    description: 'Explore Kanchipuram and Kanjivaram sarees for South Indian weddings. Product listings clearly state fabric, weave and zari details available from the maker.',
    h1: 'Kanchipuram Sarees',
    content: `
      <p>This collection is reserved for sarees identified by the supplier as Kanchipuram, Kanjivaram or Kanjeevaram. New pieces are being reviewed before they are added.</p>
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
      <p>This collection is being prepared for Manthrakodi sarees suited to Kerala Christian wedding traditions. New styles will be added only after their product details have been reviewed.</p>
      <h2>What is a Manthrakodi?</h2>
      <p>In many Kerala Christian wedding traditions, the Manthrakodi is the saree presented to the bride by the groom or his family and blessed as part of the ceremony. Customs differ, so shoppers should follow their own family and church requirements.</p>
      <p><a href="/sarees">Browse all sarees</a> or <a href="/contact">ask for sourcing help</a>.</p>
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
      <p><a href="/wedding-party-orders">Plan a wedding party order</a> or <a href="/contact">ask our styling team</a> for help.</p>
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
      <p><a href="/sarees">Browse sarees</a>, <a href="/lehengas">browse lehengas</a> or <a href="/contact">ask our styling team</a>.</p>
    `,
  },
  {
    path: '/menswear',
    category: 'menswear',
    title: 'Buy Sherwanis Online — Wedding & Groom Sherwani for Men | LuxeMia',
    description: 'Shop sherwanis, kurta pajama sets and Indo-Western menswear online. Compare exact fabric, included pieces, sizes and availability. Free U.S. shipping over $150.',
    h1: 'Indian Menswear — Sherwanis & Kurta Collection',
    content: `
      <p>Discover sherwanis, kurta sets and Indo-Western menswear. Review each product page for the exact fabric, work, included pieces, sizes, tailoring options and current availability.</p>
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
    description: 'Shop Kundan-style, polki-style and bridal necklace sets online. Compare exact materials, finish, included pieces and measurements. Free U.S. shipping over $150.',
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
    title: 'Blog | Indian Fashion Tips & Ethnic Wear Guides | LuxeMia',
    description: 'Expert guides on Indian wedding dresses, bridal lehengas, saree styles & ethnic fashion. Get insider tips from top stylists. Read now!',
    h1: 'LuxeMia Blog — Indian Wedding & Ethnic Fashion Guide',
    content: `
      <p>Expert guides on Indian wedding dresses, bridal lehengas, saree styling, and ethnic fashion trends for 2026.</p>
      <h2>Latest Articles</h2>
      <ul>
        <li><a href="/blog/how-to-wear-a-saree-step-by-step">How to Wear a Saree Step-by-Step: Complete Beginner Guide</a></li>
        <li><a href="/blog/best-lehenga-styles-indian-wedding-guests-usa-2026">Best Lehenga Styles for Indian Wedding Guests in USA (2026 Guide)</a></li>
        <li><a href="/blog/what-to-wear-south-asian-wedding-non-indian-guest">What to Wear to a South Asian Wedding as a Non-Indian Guest</a></li>
        <li><a href="/blog/what-to-wear-indian-wedding-non-indian-guest">What to Wear to an Indian Wedding as a Non-Indian Guest — Complete 2026 Guide</a></li>
        <li><a href="/blog/navratri-9-day-color-guide-2026">Navratri 9 Day Color Guide 2026: What to Wear Each Night of Garba</a></li>
        <li><a href="/blog/diwali-outfit-ideas-by-setting">Diwali Outfit Ideas by Setting: Puja, Party, Office & Community</a></li>
        <li><a href="/blog/mehendi-outfit-by-role">Mehendi Outfit Ideas by Role: Bride, Sister, Bridesmaid, Guest</a></li>
        <li><a href="/blog/plus-size-indian-ethnic-wear-guide">Plus Size Indian Ethnic Wear: What Actually Flatters Curves</a></li>
        <li><a href="/blog/indian-to-us-clothing-size-conversion-guide">Indian to US Clothing Size Conversion Guide (With How to Measure)</a></li>
        <li><a href="/blog/diwali-outfit-ideas-nri-women-usa-canada-australia">Diwali Outfit Ideas for NRI Women in the United States (2026)</a></li>
        <li><a href="/blog/kanjivaram-vs-banarasi-silk-sarees">Kanjivaram vs Banarasi Silk Sarees: Which Should You Buy?</a></li>
        <li><a href="/blog/indian-wedding-guest-outfits-men-usa-guide">Indian Wedding Guest Outfits for Men: Complete USA Guide (2026)</a></li>
        <li><a href="/blog/how-to-choose-salwar-kameez-body-type">How to Choose the Right Salwar Kameez for Your Body Type</a></li>
        <li><a href="/blog/custom-tailoring-indian-ethnic-wear-usa">Custom Tailoring Indian Ethnic Wear in USA: What You Need to Know</a></li>
        <li><a href="/blog/haldi-vs-mehendi-outfits-complete-guide">Haldi vs Mehendi Outfits: Complete Guide to Pre-Wedding Ceremony Fashion</a></li>
        <li><a href="/blog/how-to-care-for-silk-sarees-and-lehengas">How to Care for Silk Sarees & Lehengas: Complete Guide</a></li>
        <li><a href="/blog/sharara-suit-guide-2026-styles-fabrics">Sharara Suit Guide 2026: Styles & Fabrics</a></li>
        <li><a href="/blog/pakistani-suits-anarkali-shopping-guide">Pakistani Suits & Anarkali Shopping Guide</a></li>
        <li><a href="/blog/style-lehenga-choli-every-wedding-event">How to Style Lehenga Choli for Every Wedding Event</a></li>
        <li><a href="/blog/indian-wedding-season-2026-outfit-guide">Indian Wedding Season 2026 Outfit Guide</a></li>
        <li><a href="/blog/fabric-guide-indian-ethnic-wear-georgette-silk-chiffon">Fabric Guide: Indian Ethnic Wear — Georgette, Silk & Chiffon</a></li>
        <li><a href="/blog/indian-wedding-dress-complete-guide">Indian Wedding Dress Complete Guide</a></li>
        <li><a href="/blog/red-bridal-lehenga-trends-2026">Red Bridal Lehenga Trends 2026</a></li>
        <li><a href="/blog/how-to-choose-perfect-lehenga-wedding-2026">How to Choose the Perfect Lehenga for Your 2026 Wedding</a></li>
        <li><a href="/blog/lehenga-vs-sharara-vs-anarkali-comparison">Lehenga vs Sharara vs Anarkali: Complete Comparison</a></li>
        <li><a href="/blog/best-lehenga-colors-for-indian-skin-tone">Best Lehenga Colors for Every Indian Skin Tone</a></li>
        <li><a href="/blog/shipping-indian-clothes-usa-uk-canada-nri-guide">Shipping Indian Clothes in the USA: NRI Guide</a></li>
        <li><a href="/blog/unstitched-vs-ready-to-wear-vs-made-to-measure">Unstitched vs Ready to Wear vs Made to Measure</a></li>
      </ul>
      <h2>Browse by Category</h2>
      <ul>
        <li><a href="/blog/attires">Attires — Lehengas, Sarees, Suits & Sherwanis</a></li>
        <li><a href="/blog/cultural-connections">Cultural Connections — Symbolism & Traditions</a></li>
        <li><a href="/blog/ethnicalley">Ethnicalley — Wedding Ceremonies & Festivals</a></li>
        <li><a href="/blog/fashion-cults">Fashion Cults — Designer Profiles</a></li>
        <li><a href="/blog/motifs-embroideries">Motifs & Embroideries — Textile Techniques</a></li>
        <li><a href="/blog/weddings-festivals">Weddings & Festivals — Guest Outfits & Regional Traditions</a></li>
        <li><a href="/blog/how-to-care">How-To & Care — Draping, Care & Tailoring</a></li>
        <li><a href="/blog/nri-shopping">NRI Shopping — Buying from the United States</a></li>
      </ul>
    `,
  },
  // ─── Utsavpedia-style blog category hub pages ─────────────────────────────
  // 8 top-level categories covering the full topical map of Indian ethnic fashion.
  // Each category page lists all posts in that category with proper CollectionPage schema.
  {
    path: '/blog/attires',
    title: 'Indian Ethnic Attires — Lehengas, Sarees, Suits & Sherwanis Guide | LuxeMia',
    description: 'Encyclopedia of Indian ethnic clothing — bridal lehengas, silk sarees, anarkali suits, sharara sets, sherwanis & jewelry. Fabric, fit, color, and styling guides for every attire.',
    h1: 'Attires — Encyclopedia of Indian Ethnic Clothing',
    content: '<p>Explore the complete encyclopedia of Indian ethnic attires. From the regal bridal lehenga to the timeless Banarasi saree, from sharara suits to designer sherwanis — each garment has a history, a regional tradition, and a specific ceremony it belongs to. Our attires guides cover fabric choices, silhouette comparisons, color theory for skin tones, budget allocation, and styling for every body type.</p><h2>What You\'ll Find in This Category</h2><ul><li>Bridal lehenga guides — color trends, fabric choices, budget planning, and online buying tips</li><li>Saree encyclopedias — Banarasi, Kanchipuram, georgette, and designer wedding sarees</li><li>Suit comparisons — anarkali vs palazzo vs sharara vs Pakistani suits</li><li>Sherwani and menswear guides for grooms and wedding guests</li><li>Jewelry guides — bridal necklace sets, Kundan, polki, and temple jewelry</li><li>Color theory for Indian skin tones — lehenga colors for every complexion</li></ul><p>Browse all 19 articles below, or jump to a specific attire guide using the category navigation.</p>',
  },
  {
    path: '/blog/cultural-connections',
    title: 'Cultural Significance of Indian Ethnic Wear — Symbolism & Traditions | LuxeMia',
    description: 'Explore the cultural meaning behind Indian ethnic wear — bindi, sindoor, mangalsutra, bridal colors, regional wedding rituals, and the symbolism of embroidery motifs.',
    h1: 'Cultural Connections — Symbolism & Traditions of Indian Ethnic Wear',
    content: '<p>Discover the deep cultural significance behind Indian ethnic wear. Every garment, color, and accessory carries meaning — the red of a bridal lehenga symbolizes prosperity, the bindi marks the ajna chakra, sindoor signals married status, and the mangalsutra is a sacred bond. Our Cultural Connections guides explore the symbolism, rituals, and regional traditions that give Indian ethnic fashion its soul.</p><h2>What You\'ll Find in This Category</h2><ul><li>The symbolism of bridal colors — why red, maroon, and yellow are auspicious</li><li>Regional wedding rituals — Punjabi, Bengali, Tamil, Marwari, Malayali traditions</li><li>The meaning behind the bindi, sindoor, mangalsutra, and kalire</li><li>Mehendi ceremony traditions and the significance of henna patterns</li><li>The cultural importance of specific embroidery motifs — paisley, peacock, lotus</li><li>How NRI families preserve cultural traditions through ethnic fashion</li></ul><p>This category is currently being developed. Check back soon for our first articles, or explore our other categories below.</p>',
  },
  {
    path: '/blog/ethnicalley',
    title: 'Indian Wedding Ceremonies & Festival Dress Codes — Mehendi to Reception | LuxeMia',
    description: 'Complete dress code guides for every Indian wedding ceremony — mehendi, haldi, sangeet, pheras, reception. Plus festival outfits for Diwali, Navratri, and Eid.',
    h1: 'Ethnicalley — Indian Wedding Ceremonies & Festival Dress Codes',
    content: '<p>Step into the ethnicalley of Indian celebrations. Every Indian wedding is a multi-day affair with distinct ceremonies — mehendi, haldi, sangeet, pheras, vidaai, reception — each with its own dress code, color palette, and styling conventions. Our ethnicalley guides walk you through what to wear to each ceremony, the difference between Haldi and Mehendi outfits, how to dress for a South Indian muhurtham vs a Punjabi sangeet, and how NRI women can celebrate Diwali, Navratri, and Eid with authentic ethnic style.</p><h2>What You\'ll Find in This Category</h2><ul><li>Complete Indian wedding ceremony outfit guides — mehendi, haldi, sangeet, pheras, reception</li><li>The difference between Haldi and Mehendi dress codes</li><li>Indian wedding season 2026 outfit planning</li><li>Diwali, Navratri, and Eid outfit ideas for NRI women</li><li>Regional wedding ceremony differences — North vs South India</li><li>What to wear to each ceremony as a guest, bridesmaid, or family member</li></ul><p>Browse all articles below to plan your wedding wardrobe ceremony by ceremony.</p>',
  },
  {
    path: '/blog/fashion-cults',
    title: 'Indian Ethnic Fashion Designers — Sabyasachi, Manish Malhotra & More | LuxeMia',
    description: 'Profiles of India\'s top ethnic fashion designers — Sabyasachi, Manish Malhotra, JJ Valaya, Anita Dongre. Their signature styles, iconic collections, and how to shop their looks.',
    h1: 'Fashion Cults — Designer Profiles of Indian Ethnic Fashion',
    content: '<p>Meet the designers who shaped modern Indian ethnic fashion. From Sabyasachi Mukherjee\'s revival of handloom textiles to Manish Malhotra\'s Bollywood bridal aesthetic, from JJ Valaya\'s royal couture to Anita Dongre\'s sustainable luxury — each designer has defined a movement. Our Fashion Cults profiles trace their journeys, signature styles, iconic bridal collections, and the cultural moments that made them.</p><h2>What You\'ll Find in This Category</h2><ul><li>Sabyasachi Mukherjee — the revival of handloom and the royal bridal aesthetic</li><li>Manish Malhotra — Bollywood\'s favorite designer and his bridal signature</li><li>JJ Valaya — royal couture and the house of Valaya</li><li>Anita Dongre — sustainable luxury and grassroots empowerment</li><li>Ritu Kumar — the pioneer of Indian fashion revival</li><li>How to shop designer-inspired looks on a budget</li></ul><p>This category is currently being developed. Check back soon for our first designer profiles.</p>',
  },
  {
    path: '/blog/motifs-embroideries',
    title: 'Indian Embroidery & Textile Guide — Zari, Chikankari, Banarasi & Kanchipuram | LuxeMia',
    description: 'Complete guide to Indian textile techniques — zari work, chikankari, zardozi, Banarasi silk, Kanchipuram silk, georgette, chiffon. Authentication, pricing, and care.',
    h1: 'Motifs & Embroideries — Indian Textile Techniques Encyclopedia',
    content: '<p>Decode the artistry of Indian textiles. The motifs and embroideries on Indian ethnic wear are centuries-old techniques, each with a regional origin and a specific method. Zari is real gold-wrapped thread from Varanasi, chikankari is white shadow-work from Lucknow, zardozi is metallic embroidery once reserved for Mughal royalty, Kanchipuram silk is handwoven on jacquard looms in Tamil Nadu, and Banarasi brocade carries a GI tag protecting its authenticity.</p><h2>What You\'ll Find in This Category</h2><ul><li>Zari work guide — gold and silver thread embroidery techniques</li><li>Chikankari embroidery of Lucknow — shadow work, stitch types, authentication</li><li>Banarasi silk sarees — history, GI tag verification, how to spot a fake</li><li>Kanchipuram (Kanjivaram) silk — South Indian bridal saree encyclopedia</li><li>Fabric comparison guides — silk vs georgette vs chiffon vs net vs velvet</li><li>Indian fabric types reference — pricing, durability, and care for each</li></ul><p>Browse all articles below to understand what you are buying and how to verify authenticity.</p>',
  },
  {
    path: '/blog/weddings-festivals',
    title: 'Indian Wedding Guest Outfits & Festival Styling Guide | LuxeMia',
    description: 'What to wear to an Indian wedding — guest dress codes, bridesmaid outfits, mother of bride sarees, men\'s wedding attire, and festival styling for Diwali, Navratri & Eid.',
    h1: 'Weddings & Festivals — Guest Outfits & Regional Wedding Traditions',
    content: '<p>Your complete guide to dressing for Indian weddings and festivals. Whether you are a guest at a multi-day Indian wedding, a bridesmaid choosing a cohesive look, a mother of the bride selecting an elegant saree, or an NRI family celebrating Diwali abroad — our Weddings & Festivals guides cover every scenario. Learn the difference between a Punjabi wedding and a Tamil wedding, what men should wear to each ceremony, how to dress for a South Asian wedding as a non-Indian guest, and the latest 2026 wedding fashion trends.</p><h2>What You\'ll Find in This Category</h2><ul><li>What to wear to an Indian wedding as a guest — complete dress code guide</li><li>Wedding guest outfit ideas for every ceremony</li><li>How to style lehenga choli for every wedding event</li><li>Indian wedding trends for 2026</li><li>What non-Indian guests should wear to a South Asian wedding</li><li>Diwali outfit ideas for NRI women in the United States</li><li>Indian wedding guest outfits for men — complete USA guide</li><li>Styling Indian ethnic wear for festive occasions abroad</li></ul><p>Browse all articles below to plan your wedding and festival wardrobe.</p>',
  },
  {
    path: '/blog/how-to-care',
    title: 'How to Drape Saree, Care for Silk & Measure for Indian Ethnic Wear | LuxeMia',
    description: 'Practical guides to saree draping, garment care, measurements, stitching terms and shopping Indian ethnic wear online.',
    h1: 'How-To & Care — Draping, Measuring, Tailoring & Fabric Care',
    content: '<p>Browse practical guides to saree draping, garment care, measurements, stitching terms and shopping Indian ethnic wear online. Product-specific care and sizing details should always be confirmed on the exact listing.</p><h2>What You\'ll Find in This Category</h2><ul><li>Saree draping terminology and methods</li><li>How to take garment measurements</li><li>Unstitched, semi-stitched and ready-to-wear definitions</li><li>Fabric-care considerations</li><li>Questions to ask before ordering online</li></ul>',
  },
  {
    path: '/blog/nri-shopping',
    title: 'NRI Guide: Buy Indian Ethnic Wear Online from the United States | LuxeMia',
    description: 'Complete NRI shopping guide for Indian ethnic wear — sizing conversion, customs duties, shipping times, authenticity checks, and trusted online stores for the United States.',
    h1: 'Shopping — Buy Indian Ethnic Wear in the United States',
    content: '<p>The definitive guide for the NRI diaspora shopping for Indian ethnic wear from abroad. Buying a bridal lehenga from Philadelphia, a wedding saree from Toronto, or a sherwani from Sydney comes with specific challenges — sizing conversion, customs duties, shipping times, authenticity verification, and return policies. Our NRI Shopping guides answer every practical question: how to convert Indian bust sizes to US sizes, what the duty-free limits are for US, how to verify a Banarasi saree is handwoven vs. machine-made, and which online stores ship reliably to your country.</p><h2>What You\'ll Find in This Category</h2><ul><li>NRI guide to buying Indian ethnic wear online from USA, the USA</li><li>How to buy authentic Indian sarees online internationally</li><li>Shipping Indian clothes to USA, the USA — customs and duty guide</li><li>Complete guide to buying Indian ethnic wear online from USA</li><li>NRI wedding ethnic wear trends for 2026</li></ul><p>Browse all articles below to shop with confidence from abroad.</p>',
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
      </ul>
    `,
  },
  {
    path: '/products',
    title: 'All Products | Shop Indian Ethnic Wear Online | LuxeMia',
    description: 'Browse all products at LuxeMia. Designer lehengas, silk sarees, salwar suits, sherwanis & more. Free U.S. shipping over $150.',
    h1: 'All Products',
    content: `
      <p>Explore our complete collection of Indian ethnic wear. Designer lehengas, silk sarees, salwar suits, sherwanis and more — all with free US shipping on orders over $150.</p>
      <h2>Shop by Category</h2>
      <p>Browse our full catalog organized by type: <a href="/lehengas">Lehengas</a>, <a href="/sarees">Sarees</a>, <a href="/suits">Salwar Kameez</a>, and <a href="/menswear">Menswear</a>. Use filters to sort by price, color, fabric, and occasion.</p>
      <p>Pieces ship with tracking to the United States. Free US shipping applies to orders over $150.</p>
    `,
  },
  {
    path: '/collections/bridal-lehengas',
    title: 'Bridal Lehenga Collection | Designer Wedding Lehengas | LuxeMia',
    description: 'Shop bridal lehengas online. Compare exact fabric, work, included pieces, stitching status, sizing and availability. Free U.S. shipping over $150.',
    h1: 'Bridal Lehenga Collection',
    content: '<p>Discover bridal lehengas and compare each listing\'s exact fabric, work, included pieces, stitching status, sizing and current availability.</p>',
  },
  {
    path: '/collections/wedding-sarees',
    title: 'Wedding Saree Collection | Silk & Designer Sarees | LuxeMia',
    description: 'Shop wedding sarees at LuxeMia. Banarasi silk, Kanjeevaram & designer wedding sarees. Traditional craftsmanship, modern elegance. Free US shipping.',
    h1: 'Wedding Saree Collection',
    content: '<p>Explore our curated wedding saree collection. From Banarasi silk to Kanjeevaram, each saree combines traditional craftsmanship with modern elegance for your special day.</p>',
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
    title: 'Size Guide — Indian Ethnic Wear Measurements | LuxeMia',
    description: 'LuxeMia size guide for Indian ethnic wear. Find your perfect fit with measurement charts for sarees, lehengas & suits. US & international conversions.',
    h1: 'Size Guide',
    content: '<p>Find your perfect fit with our detailed measurement charts. Includes bust, waist, and hip measurements with US and international size conversions for all garments including lehengas, sarees, and salwar suits.</p>',
  },
  {
    path: '/sizing-measurements-guide',
    title: 'How to Measure Blouse Size for Saree | LuxeMia',
    description: 'Complete guide on how to measure blouse size for saree, lehenga choli & custom ethnic wear. Step-by-step instructions, size charts & tips for the perfect fit.',
    h1: 'How to Measure Blouse Size for Saree',
    schemas: [MEASUREMENT_HOW_TO_SCHEMA],
    content: `<p>Learn how to measure yourself accurately for saree blouses, lehenga cholis, and custom-stitched Indian ethnic wear. Use a soft measuring tape, record every measurement in inches, and ask a friend to help when possible.</p>
      <h2>How do I measure for a custom-stitched Indian outfit?</h2>
      <p>Take five core measurements while wearing light, close-fitting clothing and the undergarments and shoes you plan to use with the outfit.</p>
      <ol>
        <li><strong>Measure your bust:</strong> Wrap the tape around the fullest part of your bust and keep it level across your back.</li>
        <li><strong>Measure your waist:</strong> Measure around your natural waist without pulling the tape tight.</li>
        <li><strong>Measure your hips:</strong> Stand with your feet together and measure around the fullest part of your hips.</li>
        <li><strong>Measure the garment length:</strong> Measure to the desired hem while wearing the shoes planned for a floor-length outfit.</li>
        <li><strong>Measure sleeves:</strong> Record sleeve length from the shoulder and the arm circumference where the sleeve will end.</li>
      </ol>`,
  },
  {
    path: '/care-guide',
    title: 'Care Guide — How to Care for Indian Ethnic Wear | LuxeMia',
    description: 'Expert tips on caring for Indian ethnic wear. Learn how to wash, store & maintain silk sarees, lehengas, and embroidered garments.',
    h1: 'Care Guide',
    content: '<p>Learn how to properly care for your precious Indian ethnic wear. Expert tips on washing, storing, and maintaining silk sarees, embroidered lehengas, and delicate fabrics.</p>',
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions | LuxeMia',
    description: 'Find answers to common questions about LuxeMia — shipping, returns, sizing, custom orders, fabrics & more.',
    h1: 'Frequently Asked Questions',
    schemas: [FAQ_PAGE_SCHEMA],
    content: `<p>Find answers to common questions about LuxeMia orders, shipping, returns, sizing, custom stitching, fabrics, and more.</p>
      <h2>Where does LuxeMia ship?</h2>
      <p>LuxeMia currently ships to United States addresses only. Free US shipping applies over $150, and a flat $12 rate applies below $150.</p>
      <h2>How long does LuxeMia shipping take?</h2>
      <p>In-stock online items receive tracking after dispatch. Carrier transit time begins after dispatch.</p>
      <h2>Does LuxeMia offer custom sizing?</h2>
      <p>Sizing and tailoring options vary by garment. Review the product page and size selector, and contact LuxeMia before ordering if you need measurement help.</p>
      <h2>What is LuxeMia’s return policy?</h2>
      <p>All sales are final. LuxeMia does not accept returns or exchanges for sizing issues, color variations, or change of mind. Genuine shipping damage must be reported within 48 hours with an unboxing video.</p>
      <h2>Can I cancel a LuxeMia order?</h2>
      <p>Orders can be cancelled within 24 hours of placement. After that window, the order cannot be cancelled.</p>`,
  },
  {
    path: '/shipping',
    title: 'Shipping Information — the United States | LuxeMia',
    description: 'Free U.S. shipping over $150. $12 flat below that. In-stock Indian ethnic wear tracking provided after dispatch.',
    h1: 'Shipping Information',
    content: '<p>LuxeMia ships to United States addresses with tracking provided after dispatch. Shipping costs $12 below $150 and is free over $150. Contact LuxeMia before ordering if your event date is time-sensitive.</p>',
  },
  {
    path: '/pages/shipping-customs',
    title: 'Shipping & Customs | Import Duties & Local Taxes | LuxeMia',
    description: 'Learn how LuxeMia US shipping and checkout taxes work for Indian ethnic wear online.',
    h1: 'Shipping & Customs',
    content: `
      <p>LuxeMia currently ships orders from supplier fulfillment in India to addresses in the United States.</p>
      <h2>Do I have to pay customs duties or import taxes?</h2>
      <p>Depending on your country's import regulations, your order may be subject to customs duties, import taxes, or clearance fees when it arrives. These charges are set by your local customs authority — not by LuxeMia — and are separate from the price you pay at checkout.</p>
      <p>Whether you're charged, and how much, depends on factors like your country's current duty threshold, the declared value of your order, and local trade rules, which can change over time.</p>
      <h2>When would I need to pay?</h2>
      <p>If applicable, these charges are usually collected by the shipping carrier at the time of delivery, not at checkout. Your carrier will typically contact you directly if any payment is required before your package can be delivered.</p>
      <h2>Want to check in advance?</h2>
      <p>Import rules vary by country and can change, so if you'd like to know what to expect before ordering, we recommend checking directly with your local customs office or postal service.</p>
      <h2>Questions?</h2>
      <p>If you have any questions about your order or shipping, feel free to reach out to us at <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> — we're happy to help.</p>
      <p>Looking for shipping rates, delivery times, or tracking? See our <a href="/shipping">Shipping Policy</a>.</p>
    `,
  },
  {
    path: '/returns',
    title: 'Returns, Refunds & Cancellations | LuxeMia',
    description: 'LuxeMia returns policy. All sales are final. No returns or exchanges except for genuine shipping damage with mandatory unboxing video.',
    h1: 'Returns, Refunds & Cancellations',
    content: '<p>All sales are final. LuxeMia does not accept returns or exchanges for any reason, including sizing issues or colour variations. The only exception is genuine shipping damage, which must be supported by a mandatory unboxing video reported within 48 hours. Orders can be cancelled within 24 hours of placement.</p>',
  },
  {
    path: '/contact',
    title: 'Contact Us | LuxeMia',
    description: 'Get in touch with LuxeMia. Contact us for questions about orders, custom stitching, sizing, or anything else. We\'re here to help.',
    h1: 'Contact Us',
    content: '<p>Have questions about your order, sizing, or custom stitching? We\'re here to help. Reach us via email, WhatsApp, or the contact form below.</p>',
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
    description: 'Learn about LuxeMia, an online Indian ethnic wear store serving U.S. shoppers with clear product details, sizing guidance, and tracked delivery.',
    h1: 'About LuxeMia',
    content: '<p>LuxeMia is an online Indian ethnic wear store serving U.S. shoppers planning weddings, festivals, receptions, and other special occasions. Our catalog is curated from supplier partners in India, and product pages explain available fabric, work, stitching status, sizing, and package contents.</p><p>USA-based customer support: hello@luxemia.shop or +1 215-341-9990.</p>',
  },

  {
    path: '/new-arrivals',
    category: 'all',
    title: 'New Arrivals — Latest Indian Ethnic Wear Collection | LuxeMia',
    description: 'Shop the latest arrivals at LuxeMia. New designer lehengas, sarees & suits added weekly. Free U.S. shipping over $150.',
    h1: 'New Arrivals',
    content: `
      <p>Browse recently added Indian ethnic wear, including lehengas, sarees, sharara sets, salwar suits, menswear, and jewelry available online for delivery across the United States.</p>
      <h2>What is new at LuxeMia?</h2>
      <p>This collection brings together LuxeMia's latest wedding, reception, festival, and special-occasion styles so shoppers can find newly added pieces in one place.</p>
      <p>Free U.S. shipping is available on orders over $150, with $12 flat-rate shipping below $150. Tracking is provided after dispatch.</p>
    `,
  },
  {
    path: '/bestsellers',
    category: 'all',
    title: 'Featured Indian Ethnic Wear | LuxeMia',
    description: 'Explore featured lehengas, sarees, suits, menswear and jewelry selected by the LuxeMia team for weddings and celebrations.',
    h1: 'Featured Styles',
    content: `
      <p>Browse an editorial selection of lehengas, sarees, suits, menswear and jewelry chosen for their design and occasion-ready details.</p>
      <h2>How Featured Styles Are Selected</h2>
      <p>The LuxeMia team highlights pieces based on design, fabric information, occasion suitability and current availability. This page does not claim a sales ranking.</p>
      <p>Shipping is free on orders over $150 to the United States. A $12 flat rate below $150 applies otherwise. Review each product and policy page before ordering.</p>
    `,
  },

  {
    path: '/indowestern',
    category: 'indowestern',
    title: 'Indo-Western Collection — Fusion Ethnic Wear | LuxeMia',
    description: 'Shop Indo-Western fusion wear at LuxeMia. Modern ethnic suits, fusion lehengas & contemporary Indian outfits. Free U.S. shipping over $150.',
    h1: 'Indo-Western Collection',
    content: `
      <p>Where tradition meets modernity. Explore our Indo-Western collection featuring fusion silhouettes, contemporary cuts, and ethnic embellishments for the modern woman.</p>
      <h2>Fusion Style</h2>
      <p>Our Indo-Western collection blends the elegance of Indian craftsmanship with contemporary global fashion. Think asymmetrical hemlines, cape-style dupattas, dhoti pants paired with crop tops, and jacket-style anarkalis.</p>
      <p>Perfect for sangeet nights, cocktail parties, and modern wedding celebrations where you want to stand out with a unique fusion look. Free US shipping on orders over $150 to the United States.</p>
    `,
  },
  {
    path: '/nri',
    title: 'Indian Ethnic Wear Online for U.S. Shoppers | LuxeMia',
    description: 'Shop Indian ethnic wear online for delivery to United States addresses. Compare exact product details, sizing and availability. Free U.S. shipping over $150.',
    h1: 'Indian Ethnic Wear Online for U.S. Shoppers',
    content: `
      <p>Browse lehengas, sarees, salwar kameez, menswear and jewelry available online for delivery to United States addresses.</p>
      <h2>Shipping to the United States</h2>
      <p>Shipping is free over $150 and costs $12 below that. Tracking is provided after dispatch. Review each product page for exact sizing, tailoring options and availability.</p>
    `,
  },
  {
    path: '/indian-ethnic-wear-usa',
    title: 'Indian Ethnic Wear Online in the USA | LuxeMia',
    description: 'Shop lehengas, sarees, salwar kameez, menswear and jewelry online for U.S. delivery. Free shipping over $150; $12 below. Tracking after dispatch.',
    h1: 'Indian Ethnic Wear Online in the USA',
    content: `
      <p>LuxeMia is an online Indian ethnic wear store serving shoppers with United States delivery addresses.</p>
      <h2>United States Shipping</h2>
      <p>Shipping is free over $150 and costs $12 below that. Tracking is provided after dispatch. Duties, taxes or carrier processing fees may apply unless checkout explicitly states otherwise.</p>
      <h2>Shop by Category</h2>
      <p>Browse <a href="/lehengas">lehengas</a>, <a href="/sarees">sarees</a>, <a href="/suits">salwar kameez</a>, <a href="/menswear">menswear</a> and <a href="/jewelry">jewelry</a>. Review each listing for exact product details, sizing and availability.</p>
    `,
  },


  {
    path: '/collections/diwali-outfits',
    title: 'Diwali Outfits for Women 2026 — Indian Ethnic Wear for Diwali | LuxeMia',
    description: 'Shop Diwali outfits for women at LuxeMia. Lehengas, anarkali suits & sarees in gold, red & festive colors. Free U.S. shipping over $150.',
    h1: 'Diwali Outfits 2026',
    content: `
      <p>Celebrate the festival of lights in style with LuxeMia's festive Indian ethnic wear. From gold-embroidered lehengas and embellished anarkali suits to silk sarees and festive salwar kameez, our Diwali collection captures the warmth, colour, and tradition of this cherished celebration.</p>
      <h2>What to Wear for Diwali</h2>
      <p>Diwali calls for your most festive, vibrant ethnic wear. For the main Diwali day and Lakshmi Puja, traditional silk sarees in red, gold, or green are considered auspicious. For Diwali parties and evening celebrations, a heavily embellished lehenga with mirror work, zari embroidery, or sequin detailing photographs beautifully against the backdrop of diyas and fairy lights.</p>
      <h2>Diwali Outfit Colors</h2>
      <p>Gold is the quintessential Diwali color — representing prosperity and the blessing of Goddess Lakshmi. Red, deep green, royal purple, burnt orange, and navy blue are also widely worn. Fabrics with gold zari work, sequin embellishments, or mirror details catch the Diwali diyas beautifully.</p>
      <h2>Shop Diwali Outfits</h2>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a> — Embellished lehengas perfect for Diwali</li>
        <li><a href="/sarees">Silk Sarees</a> — Banarasi and silk sarees for Diwali puja</li>
        <li><a href="/suits">Anarkali Suits</a> — Festive anarkali suits for Diwali celebrations</li>
        <li><a href="/indowestern">Indo-Western</a> — Modern Diwali party outfits</li>
      </ul>
      <p>U.S. shipping is $12 under $150 and free over $150. Tracking is emailed after dispatch.</p>
    `,
  },
  {
    path: '/collections/wedding-guest-outfits',
    title: 'Indian Wedding Guest Outfits — What to Wear to an Indian Wedding | LuxeMia',
    description: 'Shop Indian wedding guest outfits at LuxeMia. Sarees, anarkali suits, lehengas & salwar kameez. Free U.S. shipping over $150.',
    h1: 'Indian Wedding Guest Outfits',
    content: `
      <p>Dress to impress at every Indian wedding ceremony — from the colourful mehendi and vibrant sangeet to the elegant wedding day and glamorous reception. LuxeMia's wedding guest collection features silk sarees, embroidered anarkali suits, festive lehengas, and salwar kameez sets in celebration-worthy fabrics and colours.</p>
      <h2>What to Wear to Each Indian Wedding Ceremony</h2>
      <p>The mehendi is a daytime ceremony calling for bright, cheerful outfits in yellow, lime green, orange, or floral prints. The sangeet is the most festive ceremony — wear your most glamorous embellished lehengas or sequin anarkalis. The main wedding ceremony is the most formal — avoid red (the bridal colour) and white. The reception is the most flexible — semi-formal to formal ethnic or indo-western outfits are appropriate.</p>
      <h2>Shop by Ceremony</h2>
      <ul>
        <li><a href="/lehengas">Bridal Lehengas</a> — Wedding guest lehengas for the main ceremony</li>
        <li><a href="/sarees">Silk Sarees</a> — Wedding guest sarees for formal ceremonies</li>
        <li><a href="/suits">Anarkali Suits</a> — Versatile suits for multiple wedding ceremonies</li>
        <li><a href="/collections/mehendi-outfits">Mehendi Outfits</a> — Bright and festive mehendi ceremony wear</li>
      </ul>
      <p>U.S. shipping is $12 under $150 and free over $150. Tracking is emailed after dispatch.</p>
    `,
  },
  {
    path: '/collections/mehendi-outfits',
    title: 'Mehendi Ceremony Outfits — Yellow, Green & Festive Indian Ethnic Wear | LuxeMia',
    description: 'Shop mehendi ceremony outfits at LuxeMia. Yellow & green lehengas, anarkali suits & salwar kameez. Free U.S. shipping over $150.',
    h1: 'Mehendi Ceremony Outfits',
    content: `
      <p>Celebrate the joyful mehendi ceremony in vibrant, festive Indian ethnic wear. Our mehendi collection features bright yellow and green lehengas, floral salwar kameez sets, embroidered anarkali suits, and light georgette sarees — all in the cheerful colours traditionally associated with henna celebrations.</p>
      <h2>Mehendi Ceremony Colours</h2>
      <p>Yellow and green are the signature colours of mehendi ceremonies in most Indian cultures — yellow representing turmeric (haldi) and new beginnings, green representing the mehendi plant itself. Mustard, saffron orange, lime green, coral, and floral prints are all popular choices for mehendi guests.</p>
      <h2>Fabric Guide for Mehendi</h2>
      <p>Since mehendi ceremonies are often held outdoors, light breathable fabrics like georgette, chiffon, cotton, crepe, and rayon are ideal. Look for light embroidery, gota patti work, mirror detailing, and block print rather than heavy zari for a mehendi-appropriate outfit.</p>
      <ul>
        <li><a href="/lehengas">Yellow Lehengas</a> — Traditional bridal mehendi lehengas</li>
        <li><a href="/suits">Floral Anarkali Suits</a> — Light anarkali suits for mehendi</li>
        <li><a href="/collections/wedding-guest-outfits">Wedding Guest Outfits</a> — All wedding ceremony outfits</li>
      </ul>
      <p>U.S. shipping is $12 under $150 and free over $150. Tracking is emailed after dispatch.</p>
    `,
  },
  {
    path: '/collections/haldi-outfits',
    title: 'Haldi Ceremony Outfits — Yellow Lehengas & Suits | LuxeMia',
    description: 'Shop haldi ceremony outfits at LuxeMia. Yellow, gold & mustard lehengas, anarkali suits & salwar kameez. Free U.S. shipping over $150.',
    h1: 'Haldi Ceremony Outfits',
    content: `
      <p>Celebrate the haldi ceremony in bright, cheerful Indian ethnic wear. LuxeMia's haldi collection features yellow and gold lehengas, mustard salwar kameez sets, floral anarkali suits, and lightweight georgette and chiffon sarees — all in the auspicious colours traditionally worn for this joyful pre-wedding ritual.</p>
      <h2>What Color to Wear for Haldi</h2>
      <p>Yellow is the traditional and most popular color for haldi ceremonies, symbolising turmeric, auspiciousness, and new beginnings. The bride typically wears yellow, and guests are encouraged to wear yellow, gold, mustard, or pastel tones. Modern haldi ceremonies also welcome peach, coral, mint green, and pastel pink. Avoid white, black, and red — those are reserved for mourning, and the wedding day itself.</p>
      <h2>Fabric Guide for Haldi</h2>
      <p>Since the haldi paste can stain fabric, lighter, more affordable materials like georgette, chiffon, cotton, and crepe are popular choices, along with lighter embroidery rather than heavy zardozi or stonework. Comfortable footwear like mojari flats or kolhapuri sandals complete a practical haldi look.</p>
      <ul>
        <li><a href="/lehengas">Yellow Lehengas</a> — Bridal and guest haldi lehengas</li>
        <li><a href="/suits">Anarkali Suits</a> — Yellow and mustard anarkali suits for haldi</li>
        <li><a href="/collections/mehendi-outfits">Mehendi Outfits</a> — Coordinating outfits for the next ceremony</li>
      </ul>
      <p>U.S. shipping is $12 under $150 and free over $150. Tracking is emailed after dispatch.</p>
    `,
  },
  {
    path: '/collections/eid-outfits',
    title: 'Eid Outfits 2026 — Indian Ethnic Wear for Eid | LuxeMia',
    description: 'Shop Eid outfits 2026 at LuxeMia. Chikankari suits, sharara sets, anarkali & lehengas in pastel & white. Free U.S. shipping over $150.',
    h1: 'Eid Outfits 2026',
    content: `
      <p>Celebrate Eid in elegance with LuxeMia's curated collection of Indian ethnic wear for Eid festivities. From delicate chikankari salwar kameez and embroidered sharara sets to pastel lehengas and georgette anarkali suits, our Eid collection brings together the finest South Asian fashion traditions.</p>
      <h2>What to Wear for Eid</h2>
      <p>Eid is celebrated twice a year — Eid Ul-Fitr (marking the end of Ramadan) and Eid Ul-Adha. For Eid morning prayers, a modest and elegant salwar kameez or anarkali suit in white, cream, or pastel shades is most appropriate. For afternoon and evening celebrations, more embellished outfits are worn. Chikankari embroidery — the intricate shadow-work embroidery from Lucknow — is considered the quintessential Eid fabric.</p>
      <h2>Eid Outfit Colors</h2>
      <p>White, pastels, and light shades are traditionally associated with Eid as symbols of purity and new beginnings. Ivory, cream, baby pink, mint green, sky blue, lilac, and peach are classic Eid outfit colours. Gold and silver embellishments on any colour are considered festive and celebratory.</p>
      <ul>
        <li><a href="/suits">Chikankari Salwar Kameez</a> — Traditional Eid salwar kameez</li>
        <li><a href="/lehengas">Pastel Lehengas</a> — Embroidered lehengas for Eid</li>
        <li><a href="/collections/wedding-guest-outfits">Wedding Guest Outfits</a> — More festive occasion wear</li>
      </ul>
      <p>Free U.S. shipping over $150. Order 3-4 weeks before Eid for timely delivery.</p>
    `,
  },
  {
    path: '/collections/navratri-outfits',
    title: 'Navratri Outfits 2026 — Chaniya Choli & Garba Dress Collection | LuxeMia',
    description: 'Shop Navratri outfits 2026 at LuxeMia. Chaniya choli, garba lehengas & festive ethnic wear in all nine Navratri colours. Free U.S. shipping over $150.',
    h1: 'Navratri Outfits — Chaniya Choli & Garba Dress Collection',
    content: `
      <p>Celebrate nine nights of Garba and Dandiya Raas in the most vibrant Indian ethnic wear. LuxeMia's Navratri collection features traditional chaniya cholis in mirror work and bandhani prints, festive lehengas in all nine Navratri colours, embroidered salwar kameez, and anarkali suits that move beautifully on the dance floor.</p>
      <h2>What is a Chaniya Choli?</h2>
      <p>The chaniya choli is the quintessential Navratri outfit — a three-piece set comprising a circular flared skirt (chaniya), a fitted blouse (choli), and a dupatta. The chaniya is traditionally cut in a full circle to allow maximum flare during spinning, and is adorned with mirror work (shisha embroidery), bandhani tie-dye prints, gota patti, or heavy embroidery. Lightweight fabrics like georgette, rayon, cotton, and net are preferred for the dance floor.</p>
      <h2>Nine Colors of Navratri 2026</h2>
      <p>Each of the nine nights of Navratri 2026 is associated with a specific colour linked to the nine forms of Goddess Durga. The sequence typically follows: Royal Blue, Green, Grey, Orange, White, Red, Royal Blue, Pink, and Purple. Many participants plan nine separate Navratri outfits in each day's colour.</p>
      <ul>
        <li><a href="/lehengas">Navratri Lehengas</a> — Festive lehengas for Garba</li>
        <li><a href="/suits">Anarkali Suits</a> — Flowing anarkalis for Navratri</li>
        <li><a href="/collections/diwali-outfits">Diwali Outfits</a> — More festive occasion wear</li>
      </ul>
      <p>U.S. shipping is $12 under $150 and free over $150. Tracking is emailed after dispatch.</p>
    `,
  },
  // Programmatic SEO combo pages are generated from src/data/comboPages.ts below.
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
    content: '<p>Read our terms of service for information about orders, shipping, returns, and use of the LuxeMia website.</p>',
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
    description: 'Meet the LuxeMia Editorial Team behind our product, sizing, care, shipping and occasion-shopping guides for U.S. customers.',
    h1: 'LuxeMia Editorial Team',
    content: '<p>The LuxeMia Editorial Team creates practical guides for shopping Indian ethnic wear online. Articles cover garment terminology, sizing, care, shipping and occasion planning for customers in the United States.</p><p>Product and policy details are reviewed by the LuxeMia team. Time-sensitive customs and delivery guidance should be confirmed with the relevant carrier or government authority.</p>',
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
    // Extract the compareAtPrice (regular/original price) for sale-price JSON-LD.
    // The merchant feed (generate-static-feed.cjs) emits this as g:price when a
    // discount exists, with g:sale_price carrying the lower (current) price.
    // Without priceSpecification in the JSON-LD, Google Merchant Center sees a
    // mismatch between the feed (g:price=$193.70) and the landing page
    // (offers.price=$149.00) and disapproves the product.
    const productComparePrice = live?.compareAtPriceRange?.maxVariantPrice?.amount || null;
    const hasSale =
      productComparePrice &&
      parseFloat(productComparePrice) > parseFloat(productPrice);
    const qualifiesForFreeShipping = parseFloat(productPrice) >= 150;
    const productSku = live?.variants?.edges?.[0]?.node?.sku || (live?.id || '').split('/').pop() || handle;
    const productAvailability = live?.availableForSale === false ? 'OutOfStock' : 'InStock';
    const productBrand = (() => {
      const v = (live?.vendor || '').trim();
      return !v || v.toLowerCase() === 'luxemia' ? 'LuxeMia' : v;
    })();
    const productAttributes = getListedProductAttributes(live);
    const productCategory = getProductCategoryInfo(live?.productType || '', live?.title || route.h1);

    // Product schema — must include image, description, offers.price/priceCurrency
    // for Google Merchant Listings validation.
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: route.h1,
      image: productImages,
      description: productDescription,
      sku: productSku,
      mpn: productSku,
      url: canonical,
      brand: { '@type': 'Brand', name: productBrand },
      category: productCategory.schemaCategory,
      ...(productAttributes.color ? { color: productAttributes.color } : {}),
      ...(productAttributes.material ? { material: productAttributes.material } : {}),
      ...(productAttributes.sizes.length > 0 ? { size: productAttributes.sizes } : {}),
      itemCondition: 'https://schema.org/NewCondition',
      offers: {
        '@type': 'Offer',
        url: canonical,
        price: productPrice,
        priceCurrency: productCurrency,
        validFrom: new Date().toISOString(),
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        // When the product is on sale (compareAtPrice > price), emit a
        // priceSpecification with maxPrice = the regular price. This matches
        // the merchant feed's g:price (regular) / g:sale_price (sale) pair,
        // resolving the GMC "Price mismatch" disapproval.
        // See: https://developers.google.com/search/docs/appearance/structured-data/product
        ...(hasSale ? {
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: productPrice,
            priceCurrency: productCurrency,
            maxPrice: productComparePrice,
            validFrom: new Date().toISOString(),
            validThrough: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        } : {}),
        availability: `https://schema.org/${productAvailability}`,
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'LuxeMia', legalName: 'Glamour Indian Wear' },
        shippingDetails: [
          {
            '@type': 'OfferShippingDetails',
            name: qualifiesForFreeShipping ? 'Free US Shipping for This Order' : 'Flat US Shipping Below $150',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: qualifiesForFreeShipping ? '0' : '12.00',
              currency: productCurrency,
            },
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          },
        ],
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'US',
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
          description: 'All sales are final. LuxeMia does not accept returns or exchanges. Only genuine shipping damage claims are accepted within 48 hours with mandatory unboxing video.',
        },
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

    const structuredDataScripts = `
    <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;

    // Inject before </head>
    html = html.replace('</head>', `${structuredDataScripts}\n</head>`);
  }

  // Blog routes need article-specific schema in the initial HTML. The author
  // is the real editorial team; individual credentials are not implied.
  if (route.path.startsWith('/blog/') && route.path.split('/').length === 3) {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: route.h1,
      description: route.description,
      url: SITE_URL + route.path,
      mainEntityOfPage: SITE_URL + route.path,
      author: { '@type': 'Organization', name: 'LuxeMia Editorial Team', url: SITE_URL + '/authors/luxemia-editorial-team' },
      publisher: { '@type': 'Organization', name: 'LuxeMia', url: SITE_URL },
    };
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>\n</head>`);
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
    const price = p.priceRange?.minVariantPrice?.amount || FALLBACK_PRICE;
    const currency = p.priceRange?.minVariantPrice?.currencyCode || FALLBACK_CURRENCY;
    const comparePrice = p.compareAtPriceRange?.maxVariantPrice?.amount;
    const isAvailable = p.availableForSale !== false;
    const images = p.images?.edges?.map(e => e.node) || [];
    const description = buildVerifiedProductCopy(p);
    const productType = (p.productType || '').trim();
    const vendor = (p.vendor || '').trim();
    const brandName = (!vendor || vendor.toLowerCase() === 'luxemia') ? 'LuxeMia' : vendor;
    const productAttributes = getListedProductAttributes(p);
    const productCategory = getProductCategoryInfo(productType, p.title || route.h1);

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

    const detailRows = [
      productType ? `<li><strong>Type:</strong> ${escapeHtml(productType)}</li>` : '',
      `<li><strong>Brand:</strong> ${escapeHtml(brandName)}</li>`,
      productAttributes.color ? `<li><strong>Color:</strong> ${escapeHtml(productAttributes.color)}</li>` : '',
      productAttributes.material ? `<li><strong>${productAttributes.jewelry ? 'Material' : 'Fabric'}:</strong> ${escapeHtml(productAttributes.material)}</li>` : '',
      productAttributes.sizes.length > 0 ? `<li><strong>Available sizes:</strong> ${escapeHtml(productAttributes.sizes.join(', '))}</li>` : '',
      `<li><strong>Availability:</strong> ${isAvailable ? 'In Stock' : 'Currently Unavailable'}</li>`,
      `<li><strong>Ships to:</strong> United States</li>`,
      `<li><strong>Shipping:</strong> Tracking provided after dispatch</li>`,
      !productAttributes.jewelry && productAttributes.sizes.length === 0
        ? `<li><strong>Sizing:</strong> Review the options shown for this product before ordering</li>`
        : '',
    ].filter(Boolean).join('\n        ');

    const sizeAnswer = productAttributes.sizes.length > 0
      ? `Available choices shown for this listing are ${escapeHtml(productAttributes.sizes.join(', '))}. Review the Size Guide before ordering.`
      : 'Any available size or tailoring choices are shown on this product page. Contact LuxeMia before ordering if an option is unclear.';
    const firstQuestion = productAttributes.jewelry
      ? `<h3>What is included with the ${escapeHtml(p.title || route.h1)}?</h3><p>The included pieces, finish, colors, and measurements are the ones stated in Product Details and shown in the product images. Contact LuxeMia before ordering if the set contents are unclear.</p>`
      : `<h3>What sizes are available?</h3><p>${sizeAnswer}</p>`;
    const careAnswer = productAttributes.jewelry
      ? 'Keep jewelry away from water, perfume, lotion, and household chemicals. Wipe gently after wear and store pieces separately in a soft pouch.'
      : 'Follow any product-specific care instructions. Dry cleaning is recommended for embroidered or embellished ethnic wear.';
    const deliveryAnswer = productAttributes.jewelry
      ? 'Delivery timing depends on the item. Tracking is provided after dispatch. Free U.S. shipping applies over $150; a flat $12 rate applies below $150.'
      : 'Delivery timing depends on the item and any selected tailoring. Tracking is provided after dispatch. Free U.S. shipping applies over $150; a flat $12 rate applies below $150.';
    const productQuestionsHtml = `
      <h2>Product Questions</h2>
      ${firstQuestion}
      <h3>How is this product shipped?</h3>
      <p>${deliveryAnswer}</p>
      <h3>What is the return policy?</h3>
      <p>All sales are final. Genuine shipping damage must be reported within 48 hours and requires an unboxing video.</p>
      <h3>How should I care for this product?</h3>
      <p>${careAnswer}</p>`;

    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      <p>Price: ${priceHtml} | ${isAvailable ? 'In Stock' : 'Out of Stock'}</p>
      ${imgHtml}
      ${descHtml}
      <h2>Product Details</h2>
      <ul>
        ${detailRows}
      </ul>
      ${productQuestionsHtml}
      <h2>Shipping &amp; Delivery</h2>
      <p>Free U.S. shipping over $150. $12 flat below that. Tracking is provided after dispatch.</p>
      <p><a href="${escapeHtml(categoryLink)}">${escapeHtml(categoryLabel)}</a> | <a href="/products">All Products</a> | <a href="/collections">Collections</a></p>`;
  } else if (route.category && allShopifyProducts && allShopifyProducts.size > 0) {
    // Collection route (sarees/lehengas/suits/menswear/indowestern/collections/new-arrivals/bestsellers)
    // Inject REAL Shopify products so Googlebot sees a fully populated category page on
    // first byte instead of an empty marketing shell. This is the SEO fix for the
    // 100 -> 7 impression drop on collection pages.
    const allProducts = Array.from(allShopifyProducts.values());
    const collectionProducts = filterProductsForCategory(allProducts, route.category, route.path === '/new-arrivals');
    console.log(`[prerender] ${route.path}: matched ${collectionProducts.length} products for category '${route.category}'`);

    if (route.category.startsWith('collection:') && collectionProducts.length === 0) {
      html = html.replace(
        /<meta name="(robots|googlebot|bingbot)" content="[^"]*" \/>/g,
        '<meta name="$1" content="noindex, follow" />'
      );
    }

    // ItemList JSON-LD — Google Merchant Center reads this for collection rich results.
    const itemListJsonLd = generateItemListJsonLd(collectionProducts, route.category, route.path);
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(itemListJsonLd)}</script>\n</head>`);

    // Compact JSON payload for React hydration — useShopifyProducts reads this on mount
    // and skips the client-side Shopify fetch entirely on first paint.
    const initialDataPayload = buildInitialDataPayload(collectionProducts, route.category);
    html = html.replace('</head>', `    <script>window.__INITIAL_DATA__ = ${initialDataPayload};</script>\n</head>`);

    // Visible product cards for crawlers (removed by MutationObserver once React hydrates)
    const productCardsHtml = generateCollectionProductHtml(collectionProducts);
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}
      <h2>Products in this Collection</h2>
      ${productCardsHtml}`;
  } else if (route.path === '/') {
    mainBodyContent = `
      <h1>${escapeHtml(route.h1)}</h1>
      ${route.content}`;
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
        <a href="/suits">Suits</a> |
        <a href="/menswear">Menswear</a> |
        <a href="/blog">Blog</a> |
        <a href="/collections">Collections</a> |
        <a href="/contact">Contact</a>
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

  // ─── Auto-cover every blog post + combo page from source data ───────────
  // CRITICAL SEO FIX (2026-07-29): This script previously only prerendered
  // whichever /blog/* and combo-page routes had a manually-written entry in
  // the `routes` array above. Every time an article/combo page was added to
  // src/data/blogPosts.ts or src/data/comboPages.ts
  // WITHOUT a matching manual entry here, the route still got registered in
  // src/lib/autoRoutes.ts (by generate-routes.cjs) — so middleware.ts believed
  // a prerendered file existed and rewrote bot requests to it. No file existed,
  // so Googlebot/Bingbot got a 404 while regular browsers (who don't take that
  // code path) got a normal 200 SPA page. This silently 404'd 27 blog posts and
  // (before the routing fix) all 25 combo pages for search engines — a soft
  // cloaking bug that is the most likely cause of the Search Console traffic
  // drop. Fix: dynamically generate a fallback route entry for ANY blog post
  // or combo page in the source data that doesn't already have a hardcoded
  // entry, so prerendered HTML coverage can never drift behind the data files
  // again. See scripts/verify-prerender-coverage.cjs for the build-time guard
  // that now also catches any future drift and fails the build loudly.
  const hardcodedBlogSlugs = new Set(
    routes
      .filter(r => r.path.startsWith('/blog/') && r.path.split('/').length === 3)
      .map(r => r.path.slice('/blog/'.length))
  );
  const hardcodedComboSlugs = new Set(
    routes
      .filter(r => !r.path.startsWith('/blog/') && !r.path.startsWith('/product/') && !r.path.startsWith('/collections/') && !r.path.startsWith('/authors/'))
      .map(r => r.path.slice(1))
  );

  try {
    const blogModule = await loadTsModule('src/data/blogPosts.ts');
    const allBlogPosts = blogModule.blogPosts || [];
    let autoBlogCount = 0;
    for (const post of allBlogPosts) {
      if (!post.slug || hardcodedBlogSlugs.has(post.slug)) continue;
      routes.push({
        path: `/blog/${post.slug}`,
        title: `${post.title} | LuxeMia`,
        description: post.excerpt || `${post.title} — read the full guide on the LuxeMia blog.`,
        h1: post.title,
        content: post.content || `<p>${escapeHtml(post.excerpt || post.title)}</p>`,
      });
      autoBlogCount++;
    }
    console.log(`[prerender] Auto-generated ${autoBlogCount} blog routes from blogPosts.ts (no manual entry existed)`);
  } catch (err) {
    console.error(`[prerender] WARNING: Failed to load src/data/blogPosts.ts for auto-coverage: ${err.message}`);
    console.error('[prerender] Any blog post without a manual route entry above will NOT be prerendered.');
  }

  try {
    const comboModule = await loadTsModule('src/data/comboPages.ts');
    const allComboPages = comboModule.comboPages || [];
    let autoComboCount = 0;
    for (const combo of allComboPages) {
      if (!combo.slug || hardcodedComboSlugs.has(combo.slug)) continue;
      const guideHtml = (combo.guideSections || [])
        .map(section => `<h2>${escapeHtml(section.heading)}</h2>${(section.paragraphs || []).map(p => `<p>${p}</p>`).join('')}`)
        .join('');
      const relatedLinksHtml = (combo.relatedLinks || [])
        .map(link => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`)
        .join(', ');
      routes.push({
        path: `/${combo.slug}`,
        title: combo.title,
        description: combo.metaDescription,
        h1: combo.h1,
        content: `<p>${escapeHtml(combo.heroSubtitle || '')}</p>${guideHtml}${relatedLinksHtml ? `<p>Related: ${relatedLinksHtml}</p>` : ''}`,
      });
      autoComboCount++;
    }
    console.log(`[prerender] Auto-generated ${autoComboCount} combo page routes from comboPages.ts (no manual entry existed)`);
  } catch (err) {
    console.error(`[prerender] WARNING: Failed to load src/data/comboPages.ts for auto-coverage: ${err.message}`);
    console.error('[prerender] Any combo page without a manual route entry above will NOT be prerendered.');
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
      if (live) route.product = live;
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
      ? `Shop ${baseTitle} at LuxeMia. Indian jewelry online for U.S. customers. Review the listing for exact materials, finish, stones, and included pieces.`
      : `Shop the${colorPhrase}${fabricPhrase} ${baseTitle} at LuxeMia. Indian ethnic wear with delivery to the United States; free U.S. shipping over $150.`;
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
}

main().catch(err => {
  console.error('[prerender] Fatal error:', err);
  process.exit(1);
});
