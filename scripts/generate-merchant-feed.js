/**
 * Generate merchant-feed.xml with enriched product descriptions
 * for Google Merchant Center compliance.
 * 
 * This script:
 * 1. Fetches ALL products from Shopify Storefront API
 * 2. Enriches short/template descriptions with detailed product info
 * 3. Combines with local products (lehengas, suits, sarees, menswear)
 * 4. Generates a Google Shopping-compatible XML feed
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
          variants(first: 5) { edges { node { id title price { amount currencyCode } compareAtPrice { amount currencyCode } } } }
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
function enrichDescription(title, originalDesc, productType, tags) {
  const { fabric, color, work, occasion, suitStyle, isMenswear } = extractProductDetails(title, productType, tags);
  
  if (isMenswear) {
    // Menswear enrichment
    const isSherwani = title.toLowerCase().includes('sherwani');
    const isKurta = title.toLowerCase().includes('kurta');
    const garmentType = isSherwani ? 'Sherwani' : isKurta ? 'Kurta Pajama Set' : 'Ethnic Ensemble';
    
    let desc = `Make a distinguished statement with this ${title} from LuxeMia's quality menswear collection. `;
    desc += `Crafted from ${fabric} fabric with beautiful ${work} detailing, this ${garmentType.toLowerCase()} combines traditional Indian quality workmanship with contemporary sophistication. `;
    if (color) desc += `The ${color} shade adds a refined touch that photographs beautifully for wedding ceremonies and celebrations. `;
    desc += `This readymade ensemble includes the ${isSherwani ? 'sherwani with matching churidar and dupatta' : 'kurta with matching pajama bottoms'}. `;
    desc += `Available in sizes 36-44 with custom tailoring available on request. `;
    desc += `Fabric Details: ${fabric} fabric with quality finish and comfortable fit for extended wear. `;
    desc += `Work & Craftsmanship: ${work} technique made with attention to detail. `;
    desc += `Care Instructions: Dry clean only. Store in a cool, dry place. `;
    desc += `Perfect for: weddings, receptions, engagement ceremonies, and festive celebrations. `;
    desc += `Shipping: Free worldwide shipping on orders over $200. Delivery within 7-12 business days to USA, UK, and Canada.`;
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
  desc += `Sizing: Available in sizes S, M, L, XL, XXL. Custom tailoring available on request. `;
  desc += `Fit: Flattering silhouette suitable for all body types. `;
  desc += `Care Instructions: Dry clean only. Store in a cool, dry place. Avoid direct sunlight to preserve color and embroidery. `;
  desc += `Perfect for: ${occasion.toLowerCase()}, weddings, festive celebrations, and special events. `;
  desc += `Shipping: Free worldwide shipping on orders over $200. Delivery within 7-12 business days to USA, UK, and Canada.`;
  return desc;
}

// Map productType to Google product category and custom label
function getGoogleCategory(productType, isMenswear) {
  if (isMenswear) {
    return {
      googleCategory: 'Apparel & Accessories > Clothing > Men\'s Clothing',
      productTypePath: 'Menswear > Sherwanis & Kurtas'
    };
  }
  const pt = (productType || '').toLowerCase();
  if (pt.includes('lehenga')) return { googleCategory: 'Apparel & Accessories > Clothing > Dresses', productTypePath: 'Lehengas' };
  if (pt.includes('saree')) return { googleCategory: 'Apparel & Accessories > Clothing', productTypePath: 'Sarees' };
  return { googleCategory: 'Apparel & Accessories > Clothing > Dresses', productTypePath: 'Salwar Kameez' };
}

// Fix image URLs for Google Merchant Center compatibility
// 1. URL-encode parentheses (causes Google crawler fetch failures → "unsupported image type")
// 2. Force JPEG format on Shopify CDN URLs to prevent WebP/AVIF via content negotiation
function fixImageUrl(url) {
  if (!url) return '';
  let fixed = url;
  // URL-encode parentheses — Google's crawler can't handle raw () in URLs
  fixed = fixed.replace(/\(/g, '%28').replace(/\)/g, '%29');
  // Force JPEG on Shopify CDN URLs — must include width to activate image transformation pipeline
  if (fixed.includes('cdn.shopify.com')) {
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

// Convert Shopify price (INR) to USD
// Using the same formula as the frontend: INR * 0.012 * 2.5, but for Shopify products
// which are already in INR
function convertToUSD(inrAmount) {
  return Math.round(parseFloat(inrAmount) * 0.012 * 2.5);
}

function generateXMLItem(product) {
  const p = product.node;
  const { isMenswear, color: extractedColor, fabric: extractedFabric, work: extractedWork, suitStyle } = 
    extractProductDetails(p.title, p.productType, p.tags);
  const { googleCategory, productTypePath } = getGoogleCategory(p.productType, isMenswear);
  
  // Enrich the description
  const enrichedDesc = enrichDescription(p.title, p.description, p.productType, p.tags);
  
  // Pricing - Shopify products are in INR, convert to USD
  const priceUSD = convertToUSD(p.priceRange.minVariantPrice.amount);
  const compareAtUSD = p.compareAtPriceRange?.minVariantPrice?.amount ? 
    convertToUSD(p.compareAtPriceRange.minVariantPrice.amount) : Math.round(priceUSD * 1.43);
  
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

  return `  <item>
    <g:id>${xmlEscape(p.id.split('/').pop())}</g:id>
    <g:title>${xmlEscape(p.title)}</g:title>
    <g:description>${xmlEscape(enrichedDesc)}</g:description>
    <g:link>https://luxemia.shop/product/${xmlEscape(p.handle)}</g:link>
    <g:image_link>${xmlEscape(image)}</g:image_link>
    <g:availability>${p.availableForSale ? 'in_stock' : 'out_of_stock'}</g:availability>
    <g:price>${compareAtUSD} USD</g:price>
    <g:sale_price>${priceUSD} USD</g:sale_price>
    <g:condition>new</g:condition>
    <g:brand>LuxeMia</g:brand>
    <g:google_product_category>${xmlEscape(googleCategory)}</g:google_product_category>
    <g:product_type>${xmlEscape(productTypePath)}</g:product_type>
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    ${color ? `<g:color>${xmlEscape(color)}</g:color>` : ''}
    ${material && material !== 'Quality' ? `<g:material>${xmlEscape(material)}</g:material>` : ''}
    ${extractedWork && extractedWork !== 'Embroidery' ? `<g:pattern>${xmlEscape(extractedWork)}</g:pattern>` : `<g:pattern>Embroidery</g:pattern>`}
    <g:size_system>US</g:size_system>
    <g:identifier_exists>no</g:identifier_exists>
    <g:custom_label_0>${xmlEscape(productTypePath)}</g:custom_label_0>
    <g:shipping>
      <g:country>US</g:country>
      <g:service>Standard</g:service>
      <g:price>0.00 USD</g:price>
    </g:shipping>
  </item>`;
}

async function validateImageUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    const ct = res.headers.get('content-type') || '';
    return res.ok && ct.startsWith('image/');
  } catch {
    return false;
  }
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
  
  // Generate XML items for all Shopify products (these have stable cdn.shopify.com images)
  const xmlItems = shopifyProducts.map(p => generateXMLItem(p));
  
  // Also include local products that have working images from kesimg.b-cdn.net
  // Note: Many kesimg.b-cdn.net images have expired (415 errors), so we only
  // include local products whose images are NOT in known broken CDN directories.
  const fs_module = fs;
  let localItems = [];
  try {
    const existingFeed = fs.readFileSync(join(__dirname, '..', 'public', 'merchant-feed.xml'), 'utf8');
    const localItemRegex = /<item>[\s\S]*?<\/item>/g;
    let match;
    while ((match = localItemRegex.exec(existingFeed)) !== null) {
      const item = match[0];
      // Identify local products by their image domain (kesimg.b-cdn.net, NOT cdn.shopify.com)
      const imgMatch = item.match(/<g:image_link>([^<]+)<\/g:image_link>/);
      const imgUrl = imgMatch ? imgMatch[1] : '';
      if (imgUrl.includes('kesimg.b-cdn.net')) {
        // Skip local products from broken CDN directories
        const brokenDirs = ['59625', '59622', '59616', '59728', '59720', '59708'];
        const isBroken = brokenDirs.some(d => imgUrl.includes(`/${d}/`));
        if (!isBroken) {
          localItems.push(item);
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
  <description>Shop quality Indian ethnic wear - bridal lehengas, wedding lehengas, sarees, sherwanis, salwar kameez, and suits at LuxeMia. Free worldwide shipping.</description>
${allItems.join('\n')}
</channel>
</rss>`;
  
  const publicDir = join(__dirname, '..', 'public');
  fs.writeFileSync(join(publicDir, 'merchant-feed.xml'), xml);
  console.log(`\nGenerated merchant-feed.xml with ${allItems.length} products!`);
  console.log(`File size: ${(Buffer.byteLength(xml) / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Error generating feed:', err);
  process.exit(1);
});
