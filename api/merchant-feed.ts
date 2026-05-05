import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Dynamic Google Merchant Center XML Product Feed
 *
 * This serverless function fetches ALL products from the Shopify Storefront API
 * and generates a compliant GMC XML feed with:
 *   - Valid google_product_category (numeric taxonomy IDs)
 *   - Required size attribute for apparel
 *   - JPEG/PNG image links (no WebP)
 *   - Proper shipping details
 *   - Tax information
 *
 * URL: https://luxemia.shop/api/merchant-feed
 * Also served at: https://luxemia.shop/merchant-feed.xml (via Vercel rewrite)
 */

const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = 'c98d10d5abd95e6a8d6ddbed223ef4b4';
const SITE_URL = 'https://luxemia.shop';

// ─── Shopify GraphQL Queries ─────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopifyImage { url: string; altText: string | null }
interface ShopifyVariant {
  id: string; title: string; sku?: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}
interface ShopifyProductNode {
  id: string; title: string; description: string; handle: string;
  vendor?: string; productType?: string; tags?: string[];
  availableForSale?: boolean;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { maxVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  options: Array<{ name: string; values: string[] }>;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Force JPEG format for Google Merchant Center compliance.
 * GMC only accepts JPEG, PNG, and GIF — WebP/AVIF are REJECTED.
 */
function forceJpeg(url: string): string {
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

/**
 * Get Google Product Category using NUMERIC TAXONOMY IDs.
 * These are unambiguous and avoid "Invalid product category" errors.
 */
function getGoogleProductCategory(productType?: string, title?: string): string {
  const t = (title || '').toLowerCase();
  const pt = (productType || '').toLowerCase();

  // Men's categories
  if (pt.includes('men') || t.includes('sherwani') || t.includes('kurta pajama') || t.includes('groom wear')) {
    if (t.includes('sherwani')) return '2195'; // Men's Suits
    if (t.includes('kurta')) return '2197'; // Men's Shirts & Tops
    return '2104'; // Men's Clothing
  }
  // Lehengas and Dresses
  if (pt.includes('lehenga') || t.includes('lehenga')) return '2271'; // Dresses
  // Sarees
  if (pt.includes('saree') || t.includes('saree')) return '5424'; // Sarees & Blouses
  // Jewelry subcategories
  if (pt.includes('necklace') || t.includes('necklace')) return '193';
  if (pt.includes('earring') || t.includes('earring')) return '194';
  if (pt.includes('bangle') || pt.includes('bracelet') || t.includes('bangle')) return '200';
  if (pt.includes('jewel') || t.includes('jewel')) return '188';
  // Suits, Anarkalis, Sharara, Palazzo, Salwar
  if (pt.includes('suit') || pt.includes('anarkali') || pt.includes('sharara') || pt.includes('palazzo') || pt.includes('salwar') || t.includes('anarkali') || t.includes('sharara') || t.includes('salwar')) return '2271'; // Dresses
  // Indo Western
  if (pt.includes('indo western') || pt.includes('indo-western')) return '2271';
  // Default: Apparel & Accessories > Clothing
  return '1604';
}

/**
 * Extract sizes from product options.
 * Returns array of size values, or defaults to ['S', 'M', 'L', 'XL', 'XXL'] for apparel.
 */
function getSizes(product: ShopifyProductNode): string[] {
  const sizeOption = product.options?.find(
    o => o.name?.toLowerCase() === 'size' ||
         o.name?.toLowerCase() === 'bust size' ||
         o.name?.toLowerCase() === 'chest size'
  );
  if (sizeOption && sizeOption.values.length > 0) {
    return sizeOption.values;
  }
  // For apparel products without explicit sizes, provide defaults
  const pt = (product.productType || '').toLowerCase();
  const isApparel = pt.includes('lehenga') || pt.includes('saree') || pt.includes('suit') ||
    pt.includes('salwar') || pt.includes('anarkali') || pt.includes('men') ||
    pt.includes('sherwani') || pt.includes('kurta') || pt.includes('dress') ||
    pt.includes('indo western') || pt.includes('sharara') || pt.includes('palazzo');
  return isApparel ? ['S', 'M', 'L', 'XL', 'XXL'] : [];
}

/**
 * Determine gender from product type/title.
 */
function getGender(productType?: string, title?: string): string {
  const pt = (productType || '').toLowerCase();
  const t = (title || '').toLowerCase();
  if (pt.includes('men') || t.includes('sherwani') || t.includes('kurta pajama') || t.includes('groom')) {
    return 'male';
  }
  return 'female';
}

// ─── Shopify API Fetch ────────────────────────────────────────────────────────

async function fetchAllProducts(): Promise<ShopifyProductNode[]> {
  const allProducts: ShopifyProductNode[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const variables: Record<string, unknown> = { first: 250 };
    if (cursor) variables.after = cursor;

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: ALL_PRODUCTS_QUERY, variables }),
    });

    if (!response.ok) break;

    const data = await response.json();
    const edges = data?.data?.products?.edges || [];
    allProducts.push(...edges.map((e: { node: ShopifyProductNode }) => e.node));

    const pageInfo = data?.data?.products?.pageInfo;
    hasNextPage = pageInfo?.hasNextPage ?? false;
    cursor = pageInfo?.endCursor ?? null;
  }

  // Only include products that are available for sale
  return allProducts.filter(p => p.availableForSale !== false);
}

// ─── XML Generation ───────────────────────────────────────────────────────────

function generateShippingXml(currency: string): string {
  const countries = ['US', 'CA', 'GB', 'AE', 'AU'];
  const shippingLines: string[] = [];

  for (const country of countries) {
    // Standard shipping
    const standardPrice = country === 'GB' ? '14.95' : '14.95';
    const expressPrice = country === 'GB' ? '44.95' :
                         country === 'AU' ? '49.95' :
                         country === 'AE' ? '39.95' : '39.95';

    shippingLines.push(`
    <g:shipping>
      <g:country>${country}</g:country>
      <g:service>Standard</g:service>
      <g:price>${standardPrice} ${currency}</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>7</g:min_transit_time>
      <g:max_transit_time>10</g:max_transit_time>
    </g:shipping>
    <g:shipping>
      <g:country>${country}</g:country>
      <g:service>Express</g:service>
      <g:price>${expressPrice} ${currency}</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>`);
  }

  return shippingLines.join('');
}

function generateProductItemXml(product: ShopifyProductNode): string {
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

  // Get color and material from options
  const colorOption = product.options?.find(o => o.name?.toLowerCase() === 'color');
  const materialOption = product.options?.find(o => o.name?.toLowerCase() === 'fabric' || o.name?.toLowerCase() === 'material');
  const color = colorOption?.values?.[0] || '';
  const material = materialOption?.values?.[0] || '';

  // Get SKU from first variant — sanitize for GMC (no spaces/special chars)
  const rawSku = product.variants.edges[0]?.node?.sku || product.id.split('/').pop() || '';
  const sku = rawSku.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');

  // Get pattern from tags
  const patternTag = product.tags?.find(t =>
    t.toLowerCase().includes('embroider') ||
    t.toLowerCase().includes('work') ||
    t.toLowerCase().includes('print') ||
    t.toLowerCase().includes('woven')
  ) || '';

  const description = (product.description || `Shop ${product.title} at LuxeMia. Premium Indian ethnic wear with worldwide shipping.`).slice(0, 5000);
  const productType = product.productType || 'Ethnic Wear';

  // If product has multiple variants (sizes), create one item per size variant
  // OR if there are no explicit size variants, create items for default sizes
  const variantEntries: string[] = [];

  if (sizes.length > 0) {
    // Create one feed item per size
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const sizeSlug = size.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const itemId = sku ? `${sku}-${sizeSlug}` : `${handle}-${sizeSlug}`;
      const itemGroupId = handle;

      // Try to find matching variant for this size
      const matchingVariant = product.variants.edges.find(v =>
        v.node.selectedOptions?.some(o =>
          (o.name?.toLowerCase() === 'size' || o.name?.toLowerCase() === 'bust size') && o.value === size
        )
      );
      const variantPrice = matchingVariant?.node?.price?.amount || price;
      const variantCompare = matchingVariant?.node?.compareAtPrice?.amount || compareAtPrice;
      const variantHasDiscount = variantCompare ? parseFloat(variantCompare) > parseFloat(variantPrice) : false;

      variantEntries.push(`
  <item>
    <g:id>${escapeXml(itemId)}</g:id>
    <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>
    <g:title>${escapeXml(product.title)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${escapeXml(link)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    ${additionalImages.map(img => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n    ')}
    <g:availability>in_stock</g:availability>
    <g:price>${variantPrice} ${currency}</g:price>
    ${variantHasDiscount ? `<g:sale_price>${variantPrice} ${currency}</g:sale_price>` : ''}
    ${variantHasDiscount && variantCompare ? `<g:sale_price_effective_date>2026-01-01T00:00:00+00:00/2027-01-01T00:00:00+00:00</g:sale_price_effective_date>` : ''}
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(product.vendor || 'LuxeMia')}</g:brand>
    <g:google_product_category>${googleProductCategory}</g:google_product_category>
    <g:product_type>${escapeXml(productType)}</g:product_type>
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    ${color ? `<g:color>${escapeXml(color)}</g:color>` : ''}
    ${material ? `<g:material>${escapeXml(material)}</g:material>` : ''}
    ${patternTag ? `<g:pattern>${escapeXml(patternTag)}</g:pattern>` : ''}
    <g:size>${escapeXml(size)}</g:size>
    <g:size_type>regular</g:size_type>
    <g:size_system>US</g:size_system>
    <g:identifier_exists>no</g:identifier_exists>
    <g:custom_label_0>${escapeXml(productType)}</g:custom_label_0>
    ${generateShippingXml(currency)}
    <g:tax>
      <g:country>US</g:country>
      <g:rate>0</g:rate>
      <g:tax_ship>no</g:tax_ship>
    </g:tax>
  </item>`);
    }
  } else {
    // Non-apparel or single-size product — one feed item
    const itemId = sku || handle;

    variantEntries.push(`
  <item>
    <g:id>${escapeXml(itemId)}</g:id>
    <g:title>${escapeXml(product.title)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${escapeXml(link)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    ${additionalImages.map(img => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n    ')}
    <g:availability>in_stock</g:availability>
    <g:price>${price} ${currency}</g:price>
    ${hasDiscount ? `<g:sale_price>${price} ${currency}</g:sale_price>` : ''}
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(product.vendor || 'LuxeMia')}</g:brand>
    <g:google_product_category>${googleProductCategory}</g:google_product_category>
    <g:product_type>${escapeXml(productType)}</g:product_type>
    <g:gender>${gender}</g:gender>
    <g:age_group>adult</g:age_group>
    ${color ? `<g:color>${escapeXml(color)}</g:color>` : ''}
    ${material ? `<g:material>${escapeXml(material)}</g:material>` : ''}
    ${patternTag ? `<g:pattern>${escapeXml(patternTag)}</g:pattern>` : ''}
    <g:identifier_exists>no</g:identifier_exists>
    <g:custom_label_0>${escapeXml(productType)}</g:custom_label_0>
    ${generateShippingXml(currency)}
    <g:tax>
      <g:country>US</g:country>
      <g:rate>0</g:rate>
      <g:tax_ship>no</g:tax_ship>
    </g:tax>
  </item>`);
  }

  return variantEntries.join('\n');
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const products = await fetchAllProducts();

    const itemsXml = products.map(p => generateProductItemXml(p)).join('\n');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>LuxeMia - Indian Ethnic Wear</title>
  <link>${SITE_URL}</link>
  <description>Shop quality Indian ethnic wear - bridal lehengas, wedding sarees, sherwanis, anarkali suits, and jewelry at LuxeMia. Flat rate shipping $14.95 per item, free on orders over $300.</description>
  <last_build_date>${new Date().toISOString()}</last_build_date>
${itemsXml}
</channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(feed);
  } catch (error) {
    console.error('Merchant feed generation failed:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>');
  }
}
