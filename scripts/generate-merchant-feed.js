/**
 * Generate merchant-feed.xml with enriched product descriptions
 * for Google Merchant Center compliance.
 *
 * This script:
 * 1. Fetches ALL products from Shopify Storefront API
 * 2. Creates per-variant feed items with proper <g:size> attributes
 * 3. Uses Google's numeric taxonomy IDs for google_product_category
 * 4. Enriches descriptions with detailed product information
 * 5. Generates a Google Shopping-compatible XML feed
 *
 * Key fixes (May 2026):
 * - google_product_category: Uses numeric taxonomy IDs (e.g., 2275) instead of
 *   text paths to avoid "Invalid product category" errors
 * - size: Creates per-variant items with <g:size>, <g:size_type>, <g:item_group_id>
 *   to fix "Missing size" errors in US/UK
 * - shipping: Uses <g:min_handling_time>/<g:max_handling_time> numeric format
 *   instead of text strings like "3-5 business days"
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_TOKEN = 'c98d10d5abd95e6a8d6ddbed223ef4b4';
const STOREFRONT_URL = `https://${SHOPIFY_STORE}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title description handle vendor productType tags availableForSale
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
          variants(first: 50) {
            edges {
              node {
                id title sku
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
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

async function shopifyFetch(query, variables = {}) {
  const res = await fetch(STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });
  const data = await res.json();
  if (data.errors) throw new Error(data.errors.map(e => e.message).join(', '));
  return data.data;
}

async function fetchAllShopifyProducts() {
  const all = [];
  let cursor = null;
  let hasNext = true;
  while (hasNext) {
    const vars = { first: 250 };
    if (cursor) vars.after = cursor;
    const data = await shopifyFetch(STOREFRONT_QUERY, vars);
    const edges = data.products.edges || [];
    all.push(...edges);
    hasNext = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
    console.log(`Fetched ${all.length} products so far...`);
  }
  return all;
}

// Extract color, fabric, work, occasion from product title
function extractProductDetails(title, productType, tags) {
  const t = title.toLowerCase();

  // Fabric detection
  const fabrics = ['silk', 'georgette', 'chinon', 'chinnon', 'net', 'velvet', 'cotton', 'organza',
    'chiffon', 'shimmer', 'crepe', 'viscose', 'faux georgette', 'fendy silk', 'chinon silk',
    'shimmer silk', 'dola silk', 'chanderi', 'crepe silk', 'art silk', 'banarasi jacquard'];
  let fabric = 'Quality';
  for (const f of fabrics) {
    if (t.includes(f)) { fabric = f.charAt(0).toUpperCase() + f.slice(1); break; }
  }

  // Color detection
  const colors = ['purple', 'pink', 'rani pink', 'hot pink', 'baby pink', 'light pink', 'maroon',
    'green', 'navy blue', 'blue', 'teal blue', 'sky blue', 'black', 'wine', 'red', 'orange',
    'lime yellow', 'yellow', 'mustard', 'peach', 'cream', 'off white', 'white', 'beige', 'grey',
    'magenta', 'violet', 'lavender', 'turquoise', 'mauve', 'dusty rose', 'dusty lavender',
    'mint green', 'lime green', 'olive green', 'emerald green', 'teal green', 'cherry',
    'pastel pink', 'rust orange', 'multi color', 'mehndi', 'onion', 'firozi', 'pista'];
  let color = '';
  for (const c of colors) {
    if (t.includes(c)) { color = c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); break; }
  }

  // Work type detection
  const works = ['embroidery work', 'sequins work', 'mirror work', 'zari work', 'hand work',
    'thread work', 'beads work', 'printed work', 'embroidery', 'sequins', 'sequins embroidery',
    'neck work', 'hand embroidery'];
  let work = 'Embroidery';
  for (const w of works) {
    if (t.includes(w)) { work = w.split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' '); break; }
  }

  // Occasion detection
  const occasions = ['wedding wear', 'party wear', 'festival wear', 'festive wear', 'eid wear',
    'occasional wear', 'bridal wear', 'groom wear'];
  let occasion = 'Special Occasions';
  for (const o of occasions) {
    if (t.includes(o)) { occasion = o.split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' '); break; }
  }

  // Suit style detection
  let suitStyle = '';
  if (t.includes('plazzo') || t.includes('palazzo')) suitStyle = 'Palazzo Suit';
  else if (t.includes('sharara')) suitStyle = 'Sharara Suit';
  else if (t.includes('gharara')) suitStyle = 'Gharara Suit';
  else if (t.includes('anarkali')) suitStyle = 'Anarkali Suit';
  else if (t.includes('patiyala') || t.includes('punjabi')) suitStyle = 'Patiala Suit';
  else if (t.includes('pakistani')) suitStyle = 'Pakistani Suit';
  else if (t.includes('designer suit') || t.includes('designer')) suitStyle = 'Designer Suit';
  else if (t.includes('gown')) suitStyle = 'Ethnic Gown';
  else suitStyle = 'Salwar Kameez';

  // Is menswear?
  const pt = (productType || '').toLowerCase();
  const tagsLower = (tags || []).map(t => t.toLowerCase());
  const isMenswear = pt.includes('men') || pt.includes('menswear') ||
    tagsLower.some(tag => tag === 'menswear' || tag === 'men' || tag === 'groom') ||
    t.includes('sherwani') || t.includes('kurta pajama') || t.includes('groom wear');

  return { fabric, color, work, occasion, suitStyle, isMenswear };
}

// Enrich a short/generic description with detailed product information
function enrichDescription(title, originalDesc, productType, tags, sizeInfo) {
  const { fabric, color, work, occasion, suitStyle, isMenswear } = extractProductDetails(title, productType, tags);

  if (isMenswear) {
    const isSherwani = title.toLowerCase().includes('sherwani');
    const isKurta = title.toLowerCase().includes('kurta');
    const garmentType = isSherwani ? 'Sherwani' : isKurta ? 'Kurta Pajama Set' : 'Ethnic Ensemble';

    let desc = `Make a distinguished statement with this ${title} from LuxeMia's quality menswear collection. `;
    desc += `Crafted from ${fabric} fabric with beautiful ${work} detailing, this ${garmentType.toLowerCase()} combines traditional Indian quality workmanship with contemporary sophistication. `;
    if (color) desc += `The ${color} shade adds a refined touch that photographs beautifully for wedding ceremonies and celebrations. `;
    desc += `This readymade ensemble includes the ${isSherwani ? 'sherwani with matching churidar and dupatta' : 'kurta with matching pajama bottoms'}. `;
    desc += `Available in ${sizeInfo}. Custom tailoring available on request. `;
    desc += `Fabric Details: ${fabric} fabric with quality finish and comfortable fit for extended wear. `;
    desc += `Work & Craftsmanship: ${work} technique made with attention to detail. `;
    desc += `Care Instructions: Dry clean only. Store in a cool, dry place. `;
    desc += `Perfect for: weddings, receptions, engagement ceremonies, and festive celebrations. `;
    desc += `Shipping: Flat rate $14.95 per item worldwide. Free shipping on orders over $300. Dispatch in 3-5 business days (readymade) or 5-7 business days (custom/alterations). Standard delivery 7-10 business days via USPS/UPS. Express delivery 3-5 business days via DHL.`;
    return desc;
  }

  // Women's suits enrichment
  let desc = `Elevate your ethnic wardrobe with this beautiful ${title} from LuxeMia's curated collection. `;
  desc += `Crafted from quality ${fabric} fabric, this ${suitStyle.toLowerCase()} features beautiful ${work} that adds dimension and artistry to every silhouette. `;
  if (color) desc += `The stunning ${color} shade complements all skin tones and photographs beautifully in any lighting. `;
  desc += `This readymade ensemble includes a perfectly tailored kurta/top, matching bottom (palazzo/sharara/churidar as per style), and a complementary dupatta. `;
  desc += `Fabric Details: ${fabric} fabric with elegant drape and comfortable fit for extended celebrations. `;
  desc += `Work & Craftsmanship: ${work} technique made with attention to detail. `;
  if (color) desc += `Color: ${color}. `;
  desc += `Sizing: Available in ${sizeInfo}. Custom tailoring available on request. `;
  desc += `Fit: Flattering silhouette suitable for all body types. `;
  desc += `Care Instructions: Dry clean only. Store in a cool, dry place. Avoid direct sunlight to preserve color and embroidery. `;
  desc += `Perfect for: ${occasion.toLowerCase()}, weddings, festive celebrations, and special events. `;
  desc += `Shipping: Flat rate $14.95 per item worldwide. Free shipping on orders over $300. Dispatch in 3-5 business days (readymade) or 5-7 business days (custom/alterations). Standard delivery 7-10 business days via USPS/UPS. Express delivery 3-5 business days via DHL.`;
  return desc;
}

/**
 * Extract the size value from a variant's selectedOptions.
 * Returns "One Size" for products without a meaningful Size option.
 * This fixes the bug where color names (e.g., "Off White") were
 * incorrectly used as size values.
 */
function getSizeFromVariant(variant, productOptions) {
  // Check if the product has a "Size" or "Bust Size" option
  const hasSizeOption = (productOptions || []).some(opt => {
    const name = (opt.name || '').toLowerCase();
    return name === 'size' || name === 'bust size' || name === 'chest size';
  });

  if (variant.selectedOptions && hasSizeOption) {
    // Find the Size option in the variant's selectedOptions
    const sizeOption = variant.selectedOptions.find(opt => {
      const name = (opt.name || '').toLowerCase();
      return name === 'size' || name === 'bust size' || name === 'chest size';
    });
    if (sizeOption && sizeOption.value) {
      const val = sizeOption.value.trim();
      if (val && val !== 'Default Title' && val !== 'Title' && !/^free\s*size$/i.test(val)) {
        return val;
      }
      if (/^free\s*size$/i.test(val)) return 'One Size';
    }
  }

  // Fallback: check variant title only if product has a Size option
  const title = (variant.title || '').trim();
  if (hasSizeOption && title && !/^(default title|title|free size)$/i.test(title)) {
    return title;
  }

  // No size option on the product → One Size
  return 'One Size';
}

/**
 * Get a human-readable list of available sizes for the description.
 * Only uses actual SIZE values, not color names or "Default Title".
 */
function getSizesDescription(variants, productOptions) {
  if (!variants || variants.length === 0) return 'standard sizing';

  const sizes = variants.map(v => getSizeFromVariant(v.node || v, productOptions));
  const uniqueSizes = [...new Set(sizes)];

  if (uniqueSizes.length === 1 && uniqueSizes[0] === 'One Size') {
    return 'One Size (free size with custom tailoring available)';
  }
  if (uniqueSizes.length === 1) {
    return `size ${uniqueSizes[0]}`;
  }
  return `sizes ${uniqueSizes.join(', ')}`;
}

/**
 * Map productType + title to Google product category using NUMERIC TAXONOMY IDS.
 *
 * Using numeric IDs instead of text paths (e.g., "2275" instead of
 * "Apparel & Accessories > Clothing > Dresses") avoids "Invalid product category"
 * errors caused by text path encoding/matching issues in Google Merchant Center.
 *
 * Google Product Category Taxonomy Reference:
 * - 166  = Apparel & Accessories
 * - 2271 = Apparel & Accessories > Clothing
 * - 2275 = Apparel & Accessories > Clothing > Dresses
 * - 5006 = Apparel & Accessories > Clothing > Men's Clothing
 * - 5598 = Apparel & Accessories > Clothing > Men's Clothing > Suits
 * - 5600 = Apparel & Accessories > Clothing > Men's Clothing > Shirts & Tops
 */
function getGoogleCategory(productType, isMenswear, title) {
  const t = (title || '').toLowerCase();

  if (isMenswear) {
    // Sherwanis → Men's Suits (5598)
    if (t.includes('sherwani')) {
      return { googleCategory: '5598', productTypePath: 'Menswear > Sherwanis' };
    }
    // Kurtas → Men's Shirts & Tops (5600)
    if (t.includes('kurta')) {
      return { googleCategory: '5600', productTypePath: 'Menswear > Kurtas' };
    }
    // Other menswear → Men's Clothing (5006)
    return { googleCategory: '5006', productTypePath: 'Menswear' };
  }

  const pt = (productType || '').toLowerCase();
  // Lehengas → Dresses (2275) — lehengas are dress-like garments
  if (pt.includes('lehenga')) {
    return { googleCategory: '2275', productTypePath: 'Lehengas' };
  }
  // Sarees → Clothing (2271) — no specific saree subcategory in Google taxonomy
  if (pt.includes('saree')) {
    return { googleCategory: '2271', productTypePath: 'Sarees' };
  }
  // Salwar Kameez / Anarkali / Suits → Dresses (2275) — closest match
  return { googleCategory: '2275', productTypePath: 'Salwar Kameez' };
}

// Fix image URLs for Google Merchant Center compatibility
function fixImageUrl(url) {
  if (!url) return '';
  let fixed = url;
  // URL-encode parentheses — Google's crawler can't handle raw () in URLs
  fixed = fixed.replace(/\(/g, '%28').replace(/\)/g, '%29');

  // Upgrade kesimg.b-cdn.net images from /images/650/ to /images/1200/
  fixed = fixed.replace('/images/650/', '/images/1200/');

  // Force JPEG format on kesimg.b-cdn.net URLs
  if (fixed.includes('kesimg.b-cdn.net')) {
    const separator = fixed.includes('?') ? '&' : '?';
    fixed = `${fixed}${separator}format=jpg`;
  }

  // Force JPEG on Shopify CDN URLs
  if (fixed.includes('cdn.shopify.com') || fixed.includes('myshopify.com')) {
    if (!fixed.includes('width=')) {
      fixed += (fixed.includes('?') ? '&' : '?') + 'width=1200';
    }
    if (!fixed.includes('format=')) {
      fixed += '&format=jpg';
    } else {
      fixed = fixed.replace(/format=\w+/, 'format=jpg');
    }
  }
  return fixed;
}

// Escape XML special characters
function xmlEscape(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// Fix common typos in Shopify product titles
function fixTitleTypos(title) {
  return title
    .replace(/\bPlazzo\b/g, 'Palazzo')
    .replace(/\bPatiyala\b/g, 'Patiala')
    .replace(/\bReadywar\b/g, 'Readymade')
    .replace(/\bReadywar\b/g, 'Readymade');
}

// Convert Shopify price to USD
function convertToUSD(amount, currencyCode) {
  const num = parseFloat(amount);
  if (currencyCode && currencyCode.toUpperCase() === 'INR') {
    return Math.round(num * 0.012);
  }
  return Math.round(num);
}

/**
 * Generate shipping XML using Google's required numeric format:
 * <g:min_handling_time>, <g:max_handling_time>, <g:min_transit_time>, <g:max_transit_time>
 * NOT text strings like "3-5 business days"
 */
function generateShippingXML() {
  return `
    <g:shipping>
      <g:country>US</g:country>
      <g:service>Standard</g:service>
      <g:price>14.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>US</g:country>
      <g:service>Express</g:service>
      <g:price>39.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>CA</g:country>
      <g:service>Standard</g:service>
      <g:price>14.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>CA</g:country>
      <g:service>Express</g:service>
      <g:price>39.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>GB</g:country>
      <g:service>Standard</g:service>
      <g:price>14.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>GB</g:country>
      <g:service>Express</g:service>
      <g:price>44.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>AE</g:country>
      <g:service>Standard</g:service>
      <g:price>14.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>AE</g:country>
      <g:service>Express</g:service>
      <g:price>39.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>AU</g:country>
      <g:service>Standard</g:service>
      <g:price>14.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>AU</g:country>
      <g:service>Express</g:service>
      <g:price>49.95 USD</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>`;
}

/**
 * Generate a single XML <item> element with all required GMC attributes.
 * Now includes <g:size>, <g:size_type>, and <g:item_group_id> for
 * per-variant product listings.
 */
function generateSingleItem({ id, itemGroupId, title, description, link, image, availability,
  price, salePrice, googleCategory, productTypePath, gender, color, material, work, size }) {

  return `  <item>
    <g:id>${xmlEscape(id)}</g:id>
    <g:item_group_id>${xmlEscape(itemGroupId)}</g:item_group_id>
    <g:title>${xmlEscape(title)}</g:title>
    <g:description>${xmlEscape(description)}</g:description>
    <g:link>https://luxemia.shop/product/${xmlEscape(link)}</g:link>
    <g:image_link>${xmlEscape(image)}</g:image_link>
    <g:availability>${availability ? 'in_stock' : 'out_of_stock'}</g:availability>
    <g:price>${price} USD</g:price>
    <g:sale_price>${salePrice} USD</g:sale_price>
    <g:condition>new</g:condition>
    <g:brand>LuxeMia</g:brand>
    <g:google_product_category>${xmlEscape(googleCategory)}</g:google_product_category>
    <g:product_type>${xmlEscape(productTypePath)}</g:product_type>
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    ${color ? `<g:color>${xmlEscape(color)}</g:color>` : ''}
    ${material && material !== 'Quality' ? `<g:material>${xmlEscape(material)}</g:material>` : ''}
    ${work && work !== 'Embroidery' ? `<g:pattern>${xmlEscape(work)}</g:pattern>` : `<g:pattern>Embroidery</g:pattern>`}
    <g:size>${xmlEscape(size)}</g:size>
    <g:size_type>regular</g:size_type>
    <g:size_system>US</g:size_system>
    <g:identifier_exists>no</g:identifier_exists>
    <g:custom_label_0>${xmlEscape(productTypePath)}</g:custom_label_0>
    ${generateShippingXML()}
    <g:tax>
      <g:country>US</g:country>
      <g:rate>0</g:rate>
      <g:tax_ship>no</g:tax_ship>
    </g:tax>
  </item>`;
}

/**
 * Generate XML items for a product.
 *
 * If the product has size variants (S, M, L, XL, or numeric bust sizes),
 * creates one <item> per size variant so each has a specific <g:size>.
 * If the product is "One Size" / "Free Size", creates a single item.
 *
 * Uses <g:item_group_id> to link variant items together so Google
 * knows they're the same product in different sizes.
 */
function generateXMLItems(product) {
  const p = product.node;
  const fixedTitle = fixTitleTypos(p.title);
  const { isMenswear, color: extractedColor, fabric: extractedFabric, work: extractedWork, suitStyle } =
    extractProductDetails(fixedTitle, p.productType, p.tags);
  const { googleCategory, productTypePath } = getGoogleCategory(p.productType, isMenswear, fixedTitle);

  const variants = p.variants?.edges || [];
  const productOptions = p.options || [];
  const productId = p.id.split('/').pop();

  // Get size description for the enriched description text
  const sizeDesc = getSizesDescription(variants, productOptions);
  const enrichedDesc = enrichDescription(fixedTitle, p.description, p.productType, p.tags, sizeDesc);

  const image = fixImageUrl(p.images?.edges?.[0]?.node?.url || '');
  const gender = isMenswear ? 'male' : 'female';

  // Extract color from tags if not found in title
  let color = extractedColor;
  if (!color) {
    const colorTags = (p.tags || []).filter(t =>
      ['pink', 'red', 'green', 'blue', 'purple', 'maroon', 'black', 'white', 'navy', 'wine', 'gold', 'orange', 'yellow', 'peach', 'cream', 'beige', 'grey', 'mustard', 'teal', 'magenta', 'violet', 'lavender', 'mauve', 'turquoise'].some(c => t.toLowerCase().includes(c))
    );
    if (colorTags.length > 0) color = colorTags[0].charAt(0).toUpperCase() + colorTags[0].slice(1);
  }

  // Extract material/fabric from tags
  let material = extractedFabric;
  const fabricTags = (p.tags || []).filter(t =>
    ['silk', 'georgette', 'net', 'velvet', 'cotton', 'chinon', 'chinnon', 'organza', 'chiffon', 'shimmer', 'crepe'].some(f => t.toLowerCase().includes(f))
  );
  if (fabricTags.length > 0 && material === 'Quality') {
    material = fabricTags[0].charAt(0).toUpperCase() + fabricTags[0].slice(1);
  }

  // Determine if we need per-variant items
  // Check if the product has a "Size" option and variants with meaningful size values
  const hasSizeOption = productOptions.some(opt => {
    const name = (opt.name || '').toLowerCase();
    return name === 'size' || name === 'bust size' || name === 'chest size';
  });

  const hasMeaningfulVariants = hasSizeOption && variants.length > 1;

  if (!hasMeaningfulVariants) {
    // Single item — product has no size option, or only one variant
    const size = variants.length > 0 ? getSizeFromVariant(variants[0].node, productOptions) : 'One Size';
    const currencyCode = p.priceRange?.minVariantPrice?.currencyCode || 'USD';
    const priceUSD = convertToUSD(p.priceRange.minVariantPrice.amount, currencyCode);
    const compareAtAmount = p.compareAtPriceRange?.minVariantPrice?.amount;
    const compareAtUSD = compareAtAmount && parseFloat(compareAtAmount) > 0 ?
      convertToUSD(compareAtAmount, currencyCode) : Math.round(priceUSD * 1.43);

    return [generateSingleItem({
      id: productId,
      itemGroupId: productId,
      title: fixedTitle,
      description: enrichedDesc,
      link: p.handle,
      image,
      availability: p.availableForSale,
      price: compareAtUSD,
      salePrice: priceUSD,
      googleCategory,
      productTypePath,
      gender,
      color,
      material,
      work: extractedWork,
      size
    })];
  }

  // Per-variant items — product has multiple size variants
  // Each variant becomes its own <item> with a unique ID and specific <g:size>
  const items = [];
  for (const variantEdge of variants) {
    const variant = variantEdge.node;
    const variantSize = getSizeFromVariant(variant, productOptions);
    const currencyCode = variant.price?.currencyCode || 'USD';
    const variantPrice = convertToUSD(variant.price.amount, currencyCode);
    const variantCompareAt = variant.compareAtPrice?.amount;
    const variantCompareAtUSD = variantCompareAt && parseFloat(variantCompareAt) > 0 ?
      convertToUSD(variantCompareAt, currencyCode) : Math.round(variantPrice * 1.43);
    const variantId = variant.id.split('/').pop();

    items.push(generateSingleItem({
      id: variantId,
      itemGroupId: productId,
      title: fixedTitle,
      description: enrichedDesc,
      link: p.handle,
      image,
      availability: variant.availableForSale !== false && p.availableForSale,
      price: variantCompareAtUSD,
      salePrice: variantPrice,
      googleCategory,
      productTypePath,
      gender,
      color,
      material,
      work: extractedWork,
      size: variantSize
    }));
  }

  return items;
}

async function main() {
  console.log('Fetching all Shopify products...');
  const shopifyProducts = await fetchAllShopifyProducts();
  console.log(`Total Shopify products: ${shopifyProducts.length}`);

  // Count by type
  const typeCount = {};
  for (const p of shopifyProducts) {
    const pt = p.node.productType || 'Unknown';
    typeCount[pt] = (typeCount[pt] || 0) + 1;
  }
  console.log('Product types:', typeCount);

  // Generate XML items — now returns an array of items per product
  const xmlItemsArrays = shopifyProducts.map(p => generateXMLItems(p));
  const xmlItems = xmlItemsArrays.flat();
  console.log(`Generated ${xmlItems.length} feed items from ${shopifyProducts.length} products`);

  // Also include local products that have working images from kesimg.b-cdn.net
  let localItems = [];
  try {
    const existingFeed = fs.readFileSync(join(__dirname, '..', 'public', 'merchant-feed.xml'), 'utf8');
    const localItemRegex = /<item>[\s\S]*?<\/item>/g;
    let match;
    while ((match = localItemRegex.exec(existingFeed)) !== null) {
      const item = match[0];
      const imgMatch = item.match(/<g:image_link>([^<]+)<\/g:image_link>/);
      const imgUrl = imgMatch ? imgMatch[1] : '';
      if (imgUrl.includes('kesimg.b-cdn.net')) {
        const brokenDirs = ['59625', '59622', '59616', '59728', '59720', '59708'];
        const isBroken = brokenDirs.some(d => imgUrl.includes(`/${d}/`));
        if (!isBroken) {
          // Fix local items: add <g:size>One Size</g:size> and <g:size_type>regular</g:size_type>
          // if they're missing, and ensure google_product_category uses numeric IDs
          let fixedItem = item;

          // Add size if missing
          if (!fixedItem.includes('<g:size>')) {
            fixedItem = fixedItem.replace(
              '<g:size_system>',
              '<g:size>One Size</g:size>\n    <g:size_type>regular</g:size_type>\n    <g:size_system>'
            );
          }

          // Add item_group_id if missing (use existing id)
          if (!fixedItem.includes('<g:item_group_id>')) {
            const idMatch = fixedItem.match(/<g:id>([^<]+)<\/g:id>/);
            if (idMatch) {
              fixedItem = fixedItem.replace(
                `<g:id>${idMatch[1]}</g:id>`,
                `<g:id>${idMatch[1]}</g:id>\n    <g:item_group_id>${idMatch[1]}</g:item_group_id>`
              );
            }
          }

          // Fix google_product_category to use numeric IDs for local items
          fixedItem = fixedItem.replace(
            /<g:google_product_category>[^<]*Apparel[^<]*<\/g:google_product_category>/g,
            (match) => {
              const content = match.replace(/<\/?g:google_product_category>/g, '');
              // Decode XML entities
              const decoded = content.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&apos;/g, "'");
              if (decoded.includes("Men's Clothing > Suits") || decoded.includes('Sherwani')) return '<g:google_product_category>5598</g:google_product_category>';
              if (decoded.includes("Men's Clothing > Shirts") || decoded.includes('Kurta')) return '<g:google_product_category>5600</g:google_product_category>';
              if (decoded.includes("Men's Clothing")) return '<g:google_product_category>5006</g:google_product_category>';
              if (decoded.includes('Dresses')) return '<g:google_product_category>2275</g:google_product_category>';
              if (decoded.includes('Clothing')) return '<g:google_product_category>2271</g:google_product_category>';
              return '<g:google_product_category>2271</g:google_product_category>';
            }
          );

          // Fix shipping format for local items: replace text handling_time/transit_time with numeric format
          fixedItem = fixedItem.replace(
            /<g:handling_time>[^<]*<\/g:handling_time>/g, ''
          ).replace(
            /<g:transit_time>[^<]*<\/g:transit_time>/g, ''
          );

          // If shipping blocks don't have min_handling_time, add them
          if (!fixedItem.includes('min_handling_time')) {
            // Replace entire shipping blocks with properly formatted ones
            fixedItem = fixedItem.replace(
              /<g:shipping>[\s\S]*?<\/g:shipping>/g,
              generateShippingXML().trim()
            );
          }

          localItems.push(fixedItem);
        }
      }
    }
  } catch (e) {
    console.log('No existing feed to preserve local products from');
  }
  console.log(`Preserved ${localItems.length} local product items with working images`);

  // Combine: local products first, then Shopify products
  const allItems = [...localItems, ...xmlItems];
  console.log(`Total items in feed: ${allItems.length}`);

  // Generate the full XML feed
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>LuxeMia - Indian Ethnic Wear</title>
  <link>https://luxemia.shop</link>
  <description>Shop quality Indian ethnic wear - bridal lehengas, wedding lehengas, sarees, sherwanis, salwar kameez, and suits at LuxeMia. Flat rate shipping $14.95 per item, free on orders over $300.</description>
${allItems.join('\n')}
</channel>
</rss>`;

  const publicDir = join(__dirname, '..', 'public');
  fs.writeFileSync(join(publicDir, 'merchant-feed.xml'), xml);
  console.log(`\nGenerated merchant-feed.xml with ${allItems.length} items!`);
  console.log(`File size: ${(Buffer.byteLength(xml) / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Error generating feed:', err);
  process.exit(1);
});
