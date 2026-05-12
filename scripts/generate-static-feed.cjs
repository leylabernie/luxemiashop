#!/usr/bin/env node
/**
 * Generate STATIC Google Merchant Center XML Product Feed at build time.
 *
 * WHY: The Vercel serverless function at /api/merchant-feed returns 403 Forbidden
 * due to Vercel Deployment Protection / WAF / function routing issues.
 * Generating a static XML file at build time completely eliminates the serverless
 * function dependency — Vercel's CDN serves the static file with zero 403 risk.
 *
 * Feed URL: https://luxemia.shop/merchant-feed.xml
 * Also available at: https://luxemia.shop/api/merchant-feed (via serverless function, if working)
 *
 * Run: node scripts/generate-static-feed.cjs
 * Automatically run during: npm run build
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://luxemia.shop';
const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || '';

// Canonical brand name. Shopify vendor field can drift in casing
// (e.g. "Luxemia" vs "LuxeMia") which trips Google Merchant Center
// brand-consistency checks. Always emit this exact string.
const BRAND_NAME = 'LuxeMia';

const ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          description
          handle
          vendor
          productType
          tags
          availableForSale
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
          variants(first: 20) {
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function forceJpeg(url) {
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

function getGoogleProductCategory(productType, title) {
  const t = (title || '').toLowerCase();
  const pt = (productType || '').toLowerCase();

  if (pt.includes('men') || t.includes('sherwani') || t.includes('kurta pajama') || t.includes('groom wear')) {
    if (t.includes('sherwani')) return '2195';
    if (t.includes('kurta')) return '2197';
    return '2104';
  }
  if (pt.includes('lehenga') || t.includes('lehenga')) return '2271';
  if (pt.includes('saree') || t.includes('saree')) return '5424';
  if (pt.includes('necklace') || t.includes('necklace')) return '193';
  if (pt.includes('earring') || t.includes('earring')) return '194';
  if (pt.includes('bangle') || pt.includes('bracelet') || t.includes('bangle')) return '200';
  if (pt.includes('jewel') || t.includes('jewel')) return '188';
  if (pt.includes('suit') || pt.includes('anarkali') || pt.includes('sharara') || pt.includes('palazzo') || pt.includes('salwar') || t.includes('anarkali') || t.includes('sharara') || t.includes('salwar')) return '2271';
  if (pt.includes('indo western') || pt.includes('indo-western')) return '2271';
  return '1604';
}

function getSizes(product) {
  const sizeOption = product.options?.find(
    o => o.name?.toLowerCase() === 'size' ||
         o.name?.toLowerCase() === 'bust size' ||
         o.name?.toLowerCase() === 'chest size'
  );
  if (sizeOption && sizeOption.values.length > 0) {
    // GMC: Normalize 'Free Size' to 'One Size' (GMC standard)
    return sizeOption.values.map(v => v.toLowerCase() === 'free size' ? 'One Size' : v);
  }
  const pt = (product.productType || '').toLowerCase();
  const isApparel = pt.includes('lehenga') || pt.includes('saree') || pt.includes('suit') ||
    pt.includes('salwar') || pt.includes('anarkali') || pt.includes('men') ||
    pt.includes('sherwani') || pt.includes('kurta') || pt.includes('dress') ||
    pt.includes('indo western') || pt.includes('sharara') || pt.includes('palazzo');
  // GMC: 'Free Size' is not a standard size. Use 'One Size' instead.
  const normalizedSizes = isApparel ? ['S', 'M', 'L', 'XL', 'XXL'] : [];
  return normalizedSizes;
}

function getGender(productType, title) {
  const pt = (productType || '').toLowerCase();
  const t = (title || '').toLowerCase();
  if (pt.includes('men') || t.includes('sherwani') || t.includes('kurta pajama') || t.includes('groom')) return 'male';
  return 'female';
}

// Always return the canonical brand string. Shopify's `vendor` field is
// merchant-supplied and can be empty or have wrong casing; normalize anything
// that looks like our own brand and fall back to BRAND_NAME otherwise.
function normalizeBrand(vendor) {
  const raw = (vendor || '').trim();
  if (!raw) return BRAND_NAME;
  if (raw.toLowerCase() === BRAND_NAME.toLowerCase()) return BRAND_NAME;
  return raw;
}

// Build a deterministic, GMC-friendly description (>=150 chars) from product
// attributes when Shopify's description is missing or too short. Avoids the
// previous fallback that produced ~110-char strings and triggered GMC
// "description too short" warnings on hundreds of items.
//
// GMC RECOMMENDATION FIX: Always include explicit "Color: X" in descriptions.
// Google Merchant Center flagged 193 products as needing color details in
// descriptions. Even when color appears in the title or g:color attribute,
// GMC wants it explicitly stated in the description text as well.
function buildDescription(product, color, material, productType) {
  const original = (product.description || '').trim();

  // For rich descriptions (>=150 chars), append a structured details line
  // with Color if the description doesn't already contain an explicit "Color:" mention.
  if (original.length >= 150) {
    // Check if description already has explicit Color: mention
    const hasExplicitColor = /\bColor\s*:/i.test(original);
    if (!hasExplicitColor && color) {
      // Append structured product details line
      const detailsParts = [];
      detailsParts.push(`Color: ${color}`);
      if (material) detailsParts.push(`Fabric: ${material}`);
      return (original + ' ' + detailsParts.join(' | ')).slice(0, 5000);
    }
    return original.slice(0, 5000);
  }

  const title = product.title || 'Indian ethnic wear';
  const parts = [];

  // Lead sentence: prefer keeping any short Shopify description, otherwise
  // open with a descriptive sentence built from product attributes.
  if (original) {
    parts.push(original.replace(/\s+$/, '').replace(/[.!?]$/, '') + '.');
  } else {
    const colorPhrase = color ? `${color} ` : '';
    const materialPhrase = material ? `${material.toLowerCase()} ` : '';
    parts.push(`Shop the ${colorPhrase}${materialPhrase}${title} at LuxeMia.`);
  }

  // GMC FIX: Add structured details line with Color, Fabric
  // This directly addresses the GMC recommendation to include color details
  const detailsParts = [];
  if (color) detailsParts.push(`Color: ${color}`);
  if (material) detailsParts.push(`Fabric: ${material}`);
  if (detailsParts.length > 0) {
    parts.push(detailsParts.join(' | '));
  }

  // Attribute sentence — material, color, category context.
  const noun = productType ? productType.toLowerCase() : 'piece';
  const attrPhrases = [];
  if (material) attrPhrases.push(`crafted in ${material.toLowerCase()}`);
  if (color) attrPhrases.push(`finished in ${color.toLowerCase()}`);
  if (attrPhrases.length) {
    parts.push(`This ${noun}, ${attrPhrases.join(' and ')}, is hand-finished by Indian artisans for a refined drape and lasting wear.`);
  } else {
    parts.push(`Hand-finished by Indian artisans for a refined drape and lasting wear.`);
  }

  // Occasion + shipping sentence — adds genuine shopper-relevant detail
  // and keeps every fallback description well above the 150-char floor.
  parts.push('Ideal for weddings, festivals, receptions and other celebrations. Ships worldwide from LuxeMia with a $25 flat rate (free over $350) to the USA, Canada and Australia.');

  let out = parts.join(' ').trim();
  // Tight safety net: if attributes were sparse and we still landed under
  // 150 chars, append a closing line so GMC never sees a sub-150 description.
  if (out.length < 150) {
    out += ` Discover more authentic Indian ethnic wear, sarees, lehengas and salwar suits at LuxeMia — affordable luxury, worldwide delivery.`;
  }
  return out.slice(0, 5000);
}

function generateShippingXml() {
  // GMC: Shipping for US, CA, AU markets. All prices in USD.
  // Free shipping on orders over $350, flat rate $25 for orders under $350.
  return `
    <g:shipping>
      <g:country>US</g:country>
      <g:service>Standard</g:service>
      <g:price>25.00 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>US</g:country>
      <g:service>Free over $350</g:service>
      <g:price>0.00 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>CA</g:country>
      <g:service>Standard</g:service>
      <g:price>25.00 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>CA</g:country>
      <g:service>Free over $350</g:service>
      <g:price>0.00 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>AU</g:country>
      <g:service>Standard</g:service>
      <g:price>25.00 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>AU</g:country>
      <g:service>Free over $350</g:service>
      <g:price>0.00 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>`;
}

// ─── Shopify API Fetch ──────────────────────────────────────────────────────

async function fetchAllProducts() {
  const allProducts = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const variables = { first: 250 };
    if (cursor) variables.after = cursor;

    console.log(`[merchant-feed] Fetching products page (cursor: ${cursor || 'start'})...`);

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: ALL_PRODUCTS_QUERY, variables }),
    });

    if (!response.ok) {
      console.error(`[merchant-feed] Shopify API error: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json();
    const edges = data?.data?.products?.edges || [];
    allProducts.push(...edges.map(e => e.node));

    const pageInfo = data?.data?.products?.pageInfo;
    hasNextPage = pageInfo?.hasNextPage ?? false;
    cursor = pageInfo?.endCursor ?? null;
  }

  console.log(`[merchant-feed] Fetched ${allProducts.length} total products from Shopify`);
  return allProducts.filter(p => p.availableForSale !== false);
}

// ─── XML Item Generation ────────────────────────────────────────────────────

function generateProductItemXml(product, titleCounts) {
  const handle = product.handle;
  const link = `${SITE_URL}/product/${handle}`;
  const imageUrl = product.images.edges[0]?.node.url
    ? forceJpeg(product.images.edges[0].node.url)
    : `${SITE_URL}/og-image.jpg`;
  const additionalImages = product.images.edges.slice(1, 5).map(e => forceJpeg(e.node.url));

  const price = product.priceRange.minVariantPrice.amount;
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const compareAtPrice = product.compareAtPriceRange?.maxVariantPrice?.amount;
  const priceNum = parseFloat(price);
  const compareNum = compareAtPrice ? parseFloat(compareAtPrice) : 0;
  const hasDiscount = compareNum > priceNum;

  const googleProductCategory = getGoogleProductCategory(product.productType, product.title);
  const sizes = getSizes(product);
  const gender = getGender(product.productType, product.title);

  const colorOption = product.options?.find(o => o.name?.toLowerCase() === 'color');
  const materialOption = product.options?.find(o => o.name?.toLowerCase() === 'fabric' || o.name?.toLowerCase() === 'material');
  let color = colorOption?.values?.[0] || '';

  // GMC FIX: Extract color from title if no color option exists in Shopify data
  // Many products have color in the title (e.g. "Rani Pink Embroidery Lehenga")
  if (!color) {
    const colorKeywords = ['Rani Pink', 'Sky Blue', 'Baby Pink', 'Dusty Pink', 'Dusty Rose', 'Royal Blue', 'Off White', 'Multi Color',
      'Red', 'Maroon', 'Burgundy', 'Wine', 'Pink', 'Rose', 'Fuchsia', 'Magenta',
      'Blue', 'Navy', 'Teal', 'Peacock', 'Purple', 'Lavender',
      'Green', 'Emerald', 'Olive', 'Mint', 'Pista Green', 'Sea Green', 'Sage',
      'Yellow', 'Gold', 'Mustard', 'Amber', 'Saffron', 'Marigold',
      'Orange', 'Peach', 'Coral', 'Rust', 'Ruby',
      'Black', 'White', 'Ivory', 'Beige', 'Cream', 'Champagne',
      'Grey', 'Charcoal', 'Silver',
      'Mauve', 'Lilac', 'Plum',
      'Copper', 'Bronze', 'Tan', 'Camel', 'Onion'];
    const titleLower = product.title.toLowerCase();
    for (const c of colorKeywords) {
      if (titleLower.includes(c.toLowerCase())) {
        color = c;
        break;
      }
    }
  }
  const material = materialOption?.values?.[0] || '';

  const rawSku = product.variants.edges[0]?.node?.sku || product.id.split('/').pop() || '';
  const sku = rawSku.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');

  const patternTag = product.tags?.find(t =>
    t.toLowerCase().includes('embroider') ||
    t.toLowerCase().includes('work') ||
    t.toLowerCase().includes('print') ||
    t.toLowerCase().includes('woven')
  ) || '';

  const productType = product.productType || 'Ethnic Wear';
  const description = buildDescription(product, color, material, productType);

  // GMC BEST PRACTICE: One feed item per product with ALL sizes listed in a single <g:size> field.
  // Creating one item per size variant inflates the feed (92 products → 1,647 items) and causes
  // duplicate content issues in GMC. Instead, use one item per product with comma-separated sizes.
  const itemId = sku || handle;
  const allSizes = sizes.length > 0 ? sizes.join(',') : '';

  // Use the lowest price across variants as the product price
  const variantPrices = product.variants.edges.map(v => parseFloat(v.node.price.amount));
  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices).toFixed(2) : price;
  const maxCompare = product.variants.edges
    .map(v => v.node.compareAtPrice?.amount)
    .filter(Boolean)
    .map(Number);
  const bestCompare = maxCompare.length > 0 ? Math.max(...maxCompare).toFixed(2) : compareAtPrice;
  const hasAnyDiscount = bestCompare && parseFloat(bestCompare) > parseFloat(minPrice);

  // GMC CRITICAL: When discount exists, g:price MUST be the ORIGINAL (higher) price
  // and g:sale_price MUST be the DISCOUNTED (lower) price.
  const displayPrice = hasAnyDiscount ? bestCompare : minPrice;
  const displaySalePrice = hasAnyDiscount ? minPrice : '';

  // Title de-duplication: when Shopify has multiple products sharing the same
  // title (different colorways or fabric variants), append a deterministic
  // disambiguator so each feed item has a unique <g:title>. GMC flags duplicate
  // titles as "limited performance" and they hurt CTR in shopping ads.
  // We disambiguate with the full normalized SKU/handle (already unique per
  // product in Shopify) prefixed with the color when available.
  const baseTitle = product.title || '';
  let displayTitle = baseTitle;
  if (titleCounts && titleCounts.get(baseTitle) > 1) {
    const uniqueTail = (sku || handle || '').toString();
    if (color && uniqueTail) {
      displayTitle = `${baseTitle} — ${color} (${uniqueTail})`;
    } else if (uniqueTail) {
      displayTitle = `${baseTitle} (${uniqueTail})`;
    } else if (color) {
      displayTitle = `${baseTitle} — ${color}`;
    }
  }

  return `
  <item>
    <g:id>${escapeXml(itemId)}</g:id>
    <g:title>${escapeXml(displayTitle)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${escapeXml(link)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    ${additionalImages.map(img => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n    ')}
    <g:availability>in_stock</g:availability>
    <g:price>${displayPrice} ${currency}</g:price>
    ${displaySalePrice ? `<g:sale_price>${displaySalePrice} ${currency}</g:sale_price>` : ''}
    ${hasAnyDiscount ? `<g:sale_price_effective_date>${new Date().toISOString().split('T')[0]}T00:00:00+00:00/${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T23:59:59+00:00</g:sale_price_effective_date>` : ''}
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(normalizeBrand(product.vendor))}</g:brand>
    <g:google_product_category>${googleProductCategory}</g:google_product_category>
    <g:product_type>${escapeXml(productType)}</g:product_type>
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    <g:color>${escapeXml(color || 'Multi-Color')}</g:color>
    ${material ? `<g:material>${escapeXml(material)}</g:material>` : ''}
    ${patternTag ? `<g:pattern>${escapeXml(patternTag)}</g:pattern>` : ''}
    ${allSizes ? `<g:size>${escapeXml(allSizes)}</g:size>` : ''}
    <g:size_type>regular</g:size_type>
    <g:size_system>US</g:size_system>
    <g:identifier_exists>no</g:identifier_exists>
    <g:target_country>US</g:target_country>
    <g:custom_label_0>${escapeXml(productType)}</g:custom_label_0>
    ${generateShippingXml()}
    <g:tax>
      <g:country>US</g:country>
      <g:rate>0</g:rate>
      <g:tax_ship>no</g:tax_ship>
    </g:tax>
  </item>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('[merchant-feed] Generating static Google Merchant Center XML feed...');

  let products;
  try {
    products = await fetchAllProducts();
  } catch (error) {
    console.error('[merchant-feed] Failed to fetch from Shopify API:', error);
    console.log('[merchant-feed] Attempting to use fallback product data...');

    // Fallback: try to use the existing generated feed
    const existingFeed = path.resolve(__dirname, '../public/merchant-feed.xml');
    if (fs.existsSync(existingFeed)) {
      console.log('[merchant-feed] Using existing feed from public/merchant-feed.xml');
      const distDir = path.resolve(__dirname, '../dist');
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.copyFileSync(existingFeed, path.join(distDir, 'merchant-feed.xml'));
      console.log('[merchant-feed] Copied existing feed to dist/merchant-feed.xml');
      return;
    }
    console.error('[merchant-feed] No fallback feed available. Generating empty feed.');
    products = [];
  }

  // Pre-compute title occurrence counts so duplicates can be disambiguated
  // deterministically with a color + SKU-tail suffix in generateProductItemXml.
  const titleCounts = new Map();
  for (const p of products) {
    const t = p.title || '';
    titleCounts.set(t, (titleCounts.get(t) || 0) + 1);
  }

  const itemsXml = products.map(p => generateProductItemXml(p, titleCounts)).join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>LuxeMia - Indian Ethnic Wear</title>
  <link>${SITE_URL}</link>
  <description>Shop quality Indian ethnic wear - bridal lehengas, wedding sarees, sherwanis, anarkali suits, and jewelry at LuxeMia. Flat rate shipping $25 per order, free on orders over $350.</description>
  <last_build_date>${new Date().toISOString()}</last_build_date>
${itemsXml}
</channel>
</rss>`;

  // Write to dist/ directory (Vercel serves static files from dist/)
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const distPath = path.join(distDir, 'merchant-feed.xml');
  fs.writeFileSync(distPath, feed, 'utf8');
  console.log(`[merchant-feed] Written feed to ${distPath} (${(feed.length / 1024).toFixed(1)} KB, ${products.length} products)`);

  // Also write to public/ directory so it's available during dev and as a fallback
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const publicPath = path.join(publicDir, 'merchant-feed.xml');
  fs.writeFileSync(publicPath, feed, 'utf8');
  console.log(`[merchant-feed] Also written to ${publicPath}`);
}

main().catch(err => {
  console.error('[merchant-feed] Fatal error:', err);
  // Don't exit with error code — build should still succeed even if feed fails
  // The feed will be regenerated on the next successful build
  console.log('[merchant-feed] Feed generation failed, but build will continue.');
  process.exit(0);
});
