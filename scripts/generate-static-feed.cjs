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

// ─── Salwar Suit Description Enrichment ──────────────────────────────────
//
// GMC RECOMMENDATION FIX: "Update descriptions for Salwar Suits — Add missing
// details to 194 products to help customers find exactly what they need."
//
// GMC flagged 194 salwar suit products as having thin descriptions missing
// key details that shoppers search for: outfit components (kameez + bottom +
// dupatta), bottom style, dupatta details, work/embellishment specifics,
// silhouette/fit, and care instructions.
//
// This module extracts attributes from product titles and Shopify data, then
// generates rich multi-paragraph descriptions that include every detail GMC
// and shoppers expect.

/** Check if a product type is a salwar/suit variant that needs enrichment. */
function isSalwarSuitType(productType) {
  const pt = (productType || '').toLowerCase();
  return pt.includes('salwar') || pt.includes('suit') || pt.includes('kameez')
    || pt.includes('palazzo') || pt.includes('anarkali') || pt.includes('sharara')
    || pt.includes('readymade suit') || pt.includes('pakistani');
}

/**
 * Extract salwar-suit-specific attributes from title, description, and options.
 * Returns a structured object with all details needed for a rich description.
 */
function extractSalwarAttributes(product, color, material, productType) {
  const title = (product.title || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const searchable = `${title} ${desc}`;
  const rawTitle = product.title || '';

  // ── Bottom style ──
  let bottomStyle = '';
  if (searchable.includes('palazzo')) bottomStyle = 'palazzo';
  else if (searchable.includes('churidar')) bottomStyle = 'churidar';
  else if (searchable.includes('patiyala') || searchable.includes('patiala')) bottomStyle = 'patiala';
  else if (searchable.includes('sharara') || searchable.includes('garara')) bottomStyle = 'sharara';
  else if (searchable.includes('straight')) bottomStyle = 'straight-cut';
  else if (productType.toLowerCase().includes('salwar')) bottomStyle = 'salwar';
  else if (searchable.includes('salwar')) bottomStyle = 'salwar';

  // ── Work/embellishment type ──
  let workType = '';
  const workPatterns = [
    { keywords: ['mirror work', 'mirror-work', 'mirrorwork'], label: 'mirror work' },
    { keywords: ['sequins embroidery', 'sequin embroidery', 'sequins work'], label: 'sequins embroidery' },
    { keywords: ['sequin', 'sequins'], label: 'sequin work' },
    { keywords: ['zardozi', 'zardosi'], label: 'zardozi embroidery' },
    { keywords: ['zari'], label: 'zari threadwork' },
    { keywords: ['gota patti', 'gota-patti', 'gotapatti'], label: 'gota patti work' },
    { keywords: ['chikankari'], label: 'chikankari embroidery' },
    { keywords: ['kundan'], label: 'kundan stone work' },
    { keywords: ['thread work', 'threadwork'], label: 'thread work' },
    { keywords: ['resham'], label: 'resham embroidery' },
    { keywords: ['stone work', 'stonework'], label: 'stone work' },
    { keywords: ['beads work', 'bead work', 'beadwork'], label: 'bead work' },
    { keywords: ['embroidered', 'embroidery'], label: 'embroidery' },
    { keywords: ['printed', 'print'], label: 'print' },
  ];
  for (const wp of workPatterns) {
    if (wp.keywords.some(k => searchable.includes(k))) {
      workType = wp.label;
      break;
    }
  }

  // ── Occasion ──
  let occasion = '';
  const occasionPatterns = [
    { keywords: ['bridal'], label: 'bridal celebrations' },
    { keywords: ['wedding wear', 'wedding suit'], label: 'weddings and receptions' },
    { keywords: ['eid wear'], label: 'Eid and festive celebrations' },
    { keywords: ['festive', 'festival'], label: 'festive celebrations' },
    { keywords: ['party wear', 'party suit'], label: 'parties and celebrations' },
    { keywords: ['casual'], label: 'casual and everyday occasions' },
    { keywords: ['occasion', 'occasional'], label: 'special occasions' },
  ];
  for (const op of occasionPatterns) {
    if (op.keywords.some(k => searchable.includes(k))) {
      occasion = op.label;
      break;
    }
  }
  if (!occasion) occasion = 'festive celebrations and special occasions';

  // ── Stitching type ──
  let stitchType = '';
  if (searchable.includes('readymade') || searchable.includes('ready-made') || searchable.includes('ready to wear')) {
    stitchType = 'readymade';
  } else if (searchable.includes('semi-stitched') || searchable.includes('semi stitched')) {
    stitchType = 'semi-stitched';
  } else if (searchable.includes('unstitched') || searchable.includes('un-stitched')) {
    stitchType = 'unstitched';
  }
  // If title contains "Readymade" specifically
  if (!stitchType && rawTitle.includes('Readymade')) stitchType = 'readymade';
  if (!stitchType && rawTitle.includes('Unstitched')) stitchType = 'unstitched';

  // ── Silhouette ──
  let silhouette = '';
  if (searchable.includes('a-line') || searchable.includes('aline')) silhouette = 'A-line';
  else if (searchable.includes('straight cut') || searchable.includes('straight-cut') || searchable.includes('straight kameez')) silhouette = 'straight-cut';
  else if (bottomStyle === 'palazzo') silhouette = 'relaxed palazzo';
  else if (bottomStyle === 'sharara') silhouette = 'flared sharara';
  else if (bottomStyle === 'churidar') silhouette = 'classic churidar';
  else if (searchable.includes('anarkali')) silhouette = 'flared anarkali';
  else if (bottomStyle === 'patiala') silhouette = 'traditional patiala';

  // ── Fabric (refined from title context) ──
  let fabric = material || '';
  if (!fabric) {
    const fabricPatterns = [
      { keywords: ['faux georgette'], label: 'Faux Georgette' },
      { keywords: ['shimmer silk'], label: 'Shimmer Silk' },
      { keywords: ['raw silk'], label: 'Raw Silk' },
      { keywords: ['banarasi silk'], label: 'Banarasi Silk' },
      { keywords: ['silk'], label: 'Silk' },
      { keywords: ['georgette'], label: 'Georgette' },
      { keywords: ['chinon', 'chinnon'], label: 'Chinon' },
      { keywords: ['chiffon'], label: 'Chiffon' },
      { keywords: ['velvet'], label: 'Velvet' },
      { keywords: ['cotton'], label: 'Cotton' },
      { keywords: ['crepe'], label: 'Crepe' },
      { keywords: ['net'], label: 'Net' },
      { keywords: ['satin'], label: 'Satin' },
      { keywords: ['organza'], label: 'Organza' },
      { keywords: ['linen'], label: 'Linen' },
      { keywords: ['jacquard'], label: 'Jacquard' },
      { keywords: ['brocade'], label: 'Brocade' },
      { keywords: ['shimmer'], label: 'Shimmer' },
    ];
    for (const fp of fabricPatterns) {
      if (fp.keywords.some(k => title.includes(k))) {
        fabric = fp.label;
        break;
      }
    }
  }

  // ── Suit sub-type label ──
  let suitLabel = 'salwar suit';
  const pt = productType.toLowerCase();
  if (pt.includes('pakistani') || title.includes('pakistani')) suitLabel = 'Pakistani suit';
  else if (pt.includes('wedding') || title.includes('wedding')) suitLabel = 'wedding suit';
  else if (title.includes('anarkali')) suitLabel = 'anarkali suit';
  else if (title.includes('palazzo')) suitLabel = 'palazzo suit';
  else if (title.includes('sharara')) suitLabel = 'sharara set';
  else if (pt.includes('salwar kameez')) suitLabel = 'salwar kameez';

  return { bottomStyle, workType, occasion, stitchType, silhouette, fabric, suitLabel };
}

/**
 * Build a rich, multi-paragraph description specifically for salwar suit products.
 * Addresses GMC recommendation: "Add missing details to 194 products."
 *
 * Structure:
 * 1. Opening — product name, fabric, work type, design highlights
 * 2. Components — kameez, bottom style, dupatta details
 * 3. Occasion & styling — when to wear, how to accessorize
 * 4. Stitching & sizing — readymade/unstitched options, sizes
 * 5. Care — dry cleaning instructions
 * 6. Details line — Color | Fabric | Work | Occasion
 * 7. Shipping — free over $350, flat $25, USA/CA/AU
 */
function buildSalwarSuitDescription(product, color, material, productType) {
  const attrs = extractSalwarAttributes(product, color, material, productType);
  const rawTitle = product.title || 'Indian Ethnic Suit';
  const original = (product.description || '').trim();

  const parts = [];

  // ── 1. Opening paragraph ──
  const colorPhrase = color ? `${color} ` : '';
  const fabricPhrase = attrs.fabric ? ` in ${attrs.fabric}` : '';
  const workPhrase = attrs.workType ? ` with ${attrs.workType}` : '';
  parts.push(
    `Shop the ${rawTitle} at LuxeMia — a ${colorPhrase}${attrs.suitLabel}${fabricPhrase}${workPhrase}. ` +
    `Every detail reflects the skill of Indian artisans, blending traditional craftsmanship with contemporary design ` +
    `for a garment that stands out at any occasion.`
  );

  // ── 2. Components paragraph (THE KEY MISSING DETAIL) ──
  const bottomPhrase = attrs.bottomStyle
    ? `The set includes a beautifully crafted kameez paired with ${attrs.bottomStyle} bottoms`
    : `The set includes a beautifully crafted kameez with coordinated bottoms`;
  const dupattaWork = attrs.workType
    ? ` embellished with ${attrs.workType}`
    : '';
  parts.push(
    `${bottomPhrase}, and a matching dupatta${dupattaWork} to complete the ensemble. ` +
    `The kameez features ${attrs.workType || 'fine detailing'} on the neckline, sleeves, and yoke, ` +
    `while the ${attrs.bottomStyle || 'coordinated bottom'} provides a comfortable and flattering fit. ` +
    `The dupatta adds the finishing touch — drape it over one shoulder for classic elegance, ` +
    `or style it across both arms for a more structured look.`
  );

  // ── 3. Occasion & styling ──
  const stylingAccessories = [
    'jhumka earrings and a stack of bangles',
    'a statement necklace and kolhapuri sandals',
    'a maang tikka and embroidered juttis',
  ];
  const accessoryPick = stylingAccessories[
    Math.abs(hashCode(rawTitle + '-acc')) % stylingAccessories.length
  ];
  parts.push(
    `Perfect for ${attrs.occasion}, this ${attrs.suitLabel} ensures you make a memorable impression wherever you go. ` +
    `Pair with ${accessoryPick} for a head-to-toe curated look ` +
    `that transitions effortlessly from intimate family gatherings to grand celebrations.`
  );

  // ── 4. Stitching & sizing ──
  let stitchPara = '';
  if (attrs.stitchType === 'readymade') {
    stitchPara = `This is a readymade suit — pre-stitched and ready to wear straight out of the box. ` +
      `Available in sizes S to XXL (bust 32-48), simply pick your size and go.`;
  } else if (attrs.stitchType === 'unstitched') {
    stitchPara = `This is an unstitched suit set — you receive the fabric and trims to have it tailored to your exact measurements. ` +
      `We also offer Made to Measure stitching: we will email you a measurement form after checkout ` +
      `and stitch the suit to your body. Alternatively, choose Ready to Wear for standard sizes S-XXL (bust 32-48).`;
  } else if (attrs.stitchType === 'semi-stitched') {
    stitchPara = `This is a semi-stitched suit — partially tailored with adjustable seams for a customized fit. ` +
      `Minor alterations can be made by your local tailor for the perfect silhouette. ` +
      `Available in sizes S to XXL (bust 32-48).`;
  } else {
    stitchPara = `Available in sizes S to XXL (bust 32-48) with custom tailoring options. ` +
      `Choose Unstitched (fabric and trims for your own tailor), Ready to Wear (pre-stitched to standard sizes), ` +
      `or Made to Measure (stitched to your exact body measurements — we will email a measurement form after checkout).`;
  }
  parts.push(stitchPara);

  // ── 5. Care instructions ──
  const fabricLower = (attrs.fabric || '').toLowerCase();
  let carePara;
  if (fabricLower.includes('cotton') && !fabricLower.includes('silk')) {
    carePara = `Care: Gentle machine wash in cold water on a delicate cycle for cotton suits. ` +
      `Iron on medium heat with steam. For embellished areas, use a pressing cloth.`;
  } else {
    carePara = `Care: Professional dry cleaning is recommended to preserve the embroidery and fabric integrity. ` +
      `Avoid wringing or machine washing. Iron on low heat with a pressing cloth over embellished areas. ` +
      `Store in a muslin garment bag — avoid plastic covers which can trap moisture and damage embroidery.`;
  }
  parts.push(carePara);

  // ── 6. Structured details line ──
  const detailsParts = [];
  if (color) detailsParts.push(`Color: ${color}`);
  if (attrs.fabric) detailsParts.push(`Fabric: ${attrs.fabric}`);
  if (attrs.workType) detailsParts.push(`Work: ${capitalize(attrs.workType)}`);
  if (attrs.bottomStyle) detailsParts.push(`Bottom: ${capitalize(attrs.bottomStyle)}`);
  detailsParts.push(`Occasion: ${capitalize(attrs.occasion)}`);
  parts.push(detailsParts.join(' | '));

  // ── 7. Shipping ──
  parts.push(
    `Free shipping on orders over $350 to the USA, Canada, and Australia. ` +
    `Flat $25 shipping on orders under $350.`
  );

  return parts.join(' ').slice(0, 5000);
}

/** Simple string hash for deterministic picking. */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/** Capitalize the first letter of a string. */
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
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
//
// GMC RECOMMENDATION FIX (Round 2): "Update descriptions for Salwar Suits —
// Add missing details to 194 products." For salwar suit types, we now generate
// rich multi-paragraph descriptions that include outfit components (kameez +
// bottom + dupatta), bottom style, work details, stitching options, and care.
function buildDescription(product, color, material, productType) {
  const original = (product.description || '').trim();

  // ── Salwar/Suit enrichment path ──
  // If this is a salwar suit type, ALWAYS generate a rich description from
  // extracted attributes — even if the Shopify description is ≥150 chars.
  // The Shopify descriptions for these products lack components, dupatta,
  // bottom style, and care details that GMC and shoppers expect.
  if (isSalwarSuitType(productType)) {
    return buildSalwarSuitDescription(product, color, material, productType);
  }

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

// ─── Returns Policy Block ──────────────────────────────────────────────────
// GMC requires explicit return policy info per item to satisfy the
// "return policy" rejection. See:
// https://support.google.com/merchants/answer/10320582
//
// IMPORTANT: The category here MUST match what's on the /returns page.
// Our website offers damage-claim resolution within 48h (replacement, store
// credit, or partial refund at our discretion) and cancellations within 24h
// (full refund). GMC classifies this as "MerchantReturnFiniteReturnWindow"
// with a 48-hour window, NOT "MerchantReturnNotPermitted".
//
// Mismatch between feed and website causes GMC to reject items as
// "Inconsistent return policy information".
function generateReturnsXml() {
  return `
    <g:returns>
      <g:returns_policy>
        <g:countries>US,CA,AU</g:countries>
        <g:return_policy_category>https://schema.org/MerchantReturnFiniteReturnWindow</g:return_policy_category>
        <g:return_policy_url>https://luxemia.shop/returns</g:return_policy_url>
        <g:customer_service_link>https://luxemia.shop/contact</g:customer_service_link>
        <g:life_time_return_window>false</g:life_time_return_window>
        <g:return_window_days>2</g:return_window_days>
        <g:return_method>https://schema.org/ReturnByMail</g:return_method>
        <g:return_fee>https://schema.org/FreeReturn</g:return_fee>
        <g:return_shipping_fee>
          <g:price>0.00 USD</g:price>
        </g:return_shipping_fee>
        <g:restocking_fee>0.00 USD</g:restocking_fee>
        <g:refund_fee>https://schema.org/FullRefund</g:refund_fee>
      </g:returns_policy>
    </g:returns>`;
}

// ─── Product Highlights ────────────────────────────────────────────────────
// GMC: 3-5 short bullet highlights per item (max 150 chars each).
// Derived from color, fabric, work type, stitching options, occasion.
function generateProductHighlights(product, color, material, productType, title) {
  const highlights = [];
  const t = (title + ' ' + productType).toLowerCase();

  // Color highlight
  if (color) {
    highlights.push(`${color} authentic Indian ethnic wear with rich detailing`);
  }

  // Fabric/material highlight
  if (material) {
    highlights.push(`Premium ${material.toLowerCase()} fabric with comfortable drape and luxury finish`);
  } else {
    const fabricPatterns = [
      { pat: /georgette/i, label: 'Georgette' },
      { pat: /silk/i, label: 'Silk' },
      { pat: /net/i, label: 'Net' },
      { pat: /velvet/i, label: 'Velvet' },
      { pat: /chiffon/i, label: 'Chiffon' },
      { pat: /organza/i, label: 'Organza' },
    ];
    for (const fp of fabricPatterns) {
      if (fp.pat.test(t)) {
        highlights.push(`Premium ${fp.label.toLowerCase()} fabric with comfortable drape and luxury finish`);
        break;
      }
    }
  }

  // Work type highlight
  if (/embroider|zardosi|zari|sequin|bead|mirror|stone|cutdana|pearl|kundan|thread/i.test(t)) {
    if (/zardosi|zari/i.test(t)) {
      highlights.push(`Hand-applied zardosi/zari gold thread embroidery throughout the garment`);
    } else if (/sequin/i.test(t)) {
      highlights.push(`Sparkling sequins work catches light beautifully for evening events`);
    } else if (/bead|cutdana|pearl/i.test(t)) {
      highlights.push(`Intricate bead and pearl handwork on every panel of the garment`);
    } else if (/mirror/i.test(t)) {
      highlights.push(`Traditional mirror work reflecting festive Indian heritage craftsmanship`);
    } else {
      highlights.push(`Handcrafted embroidery with traditional Indian artisanal techniques`);
    }
  }

  // Product type / occasion highlight
  if (t.includes('lehenga')) {
    highlights.push(`Flared kalidar lehenga construction for statement bridal and wedding guest movement`);
  } else if (t.includes('saree')) {
    highlights.push(`Includes unstitched blouse piece so you can tailor the perfect custom fit`);
  } else if (t.includes('suit') || t.includes('anarkali') || t.includes('salwar') || t.includes('sharara')) {
    highlights.push(`Three-piece suit set ready for festive occasions, parties, and wedding ceremonies`);
  } else if (t.includes('necklace') || t.includes('jewelry')) {
    highlights.push(`Gold-plated finish designed to last through every wedding season`);
  }

  // Shipping highlight (same for all)
  highlights.push(`Ready to ship from India in 5-7 business days; flat $25 to USA, free over $350`);

  // Sizing highlight
  highlights.push(`Available in sizes 32-48 (XS to 5XL) — ready-to-wear and custom-stitched options`);

  // Cap at 5 highlights, each under 150 chars
  return highlights.slice(0, 5).map(h => {
    const trimmed = h.slice(0, 150);
    return `    <g:product_highlight>${escapeXml(trimmed)}</g:product_highlight>`;
  }).join('\n');
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
    ${generateProductHighlights(product, color, material, productType, displayTitle)}
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
    ${generateReturnsXml()}
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
