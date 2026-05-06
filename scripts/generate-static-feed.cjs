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
const SHOPIFY_STOREFRONT_TOKEN = 'c98d10d5abd95e6a8d6ddbed223ef4b4';

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

function generateShippingXml(currency) {
  const countries = ['US', 'CA', 'GB', 'AE', 'AU'];
  const lines = [];
  for (const country of countries) {
    const standardPrice = '14.95';
    const expressPrice = country === 'AU' ? '49.95' : country === 'AE' ? '39.95' : '39.95';
    // Free DHL Express on orders over $300 (matches site's shipping policy)
    lines.push(`
    <g:shipping>
      <g:country>${country}</g:country>
      <g:service>DHL Express Free over $300</g:service>
      <g:price>0.00 ${currency}</g:price>
      <g:min_handling_time>3</g:min_handling_time>
      <g:max_handling_time>5</g:max_handling_time>
      <g:min_transit_time>3</g:min_transit_time>
      <g:max_transit_time>5</g:max_transit_time>
    </g:shipping>
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
  return lines.join('');
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

function generateProductItemXml(product) {
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
  const color = colorOption?.values?.[0] || '';
  const material = materialOption?.values?.[0] || '';

  const rawSku = product.variants.edges[0]?.node?.sku || product.id.split('/').pop() || '';
  const sku = rawSku.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');

  const patternTag = product.tags?.find(t =>
    t.toLowerCase().includes('embroider') ||
    t.toLowerCase().includes('work') ||
    t.toLowerCase().includes('print') ||
    t.toLowerCase().includes('woven')
  ) || '';

  const description = (product.description || `Shop ${product.title} at LuxeMia. Premium Indian ethnic wear with worldwide shipping.`).slice(0, 5000);
  const productType = product.productType || 'Ethnic Wear';

  const variantEntries = [];

  if (sizes.length > 0) {
    for (const size of sizes) {
      const sizeSlug = size.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const itemId = sku ? `${sku}-${sizeSlug}` : `${handle}-${sizeSlug}`;
      const itemGroupId = handle;

      const matchingVariant = product.variants.edges.find(v =>
        v.node.selectedOptions?.some(o =>
          (o.name?.toLowerCase() === 'size' || o.name?.toLowerCase() === 'bust size') && o.value === size
        )
      );
      const variantPrice = matchingVariant?.node?.price?.amount || price;
      const variantCompare = matchingVariant?.node?.compareAtPrice?.amount || compareAtPrice;
      const variantHasDiscount = variantCompare ? parseFloat(variantCompare) > parseFloat(variantPrice) : false;

      // GMC CRITICAL: When discount exists, g:price MUST be the ORIGINAL (higher) price
      // and g:sale_price MUST be the DISCOUNTED (lower) price.
      // Having both set to the same value causes GMC policy violations.
      const displayPrice = variantHasDiscount ? variantCompare : variantPrice;
      const displaySalePrice = variantHasDiscount ? variantPrice : '';

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
    <g:price>${displayPrice} ${currency}</g:price>
    ${displaySalePrice ? `<g:sale_price>${displaySalePrice} ${currency}</g:sale_price>` : ''}
    ${variantHasDiscount && variantCompare ? `<g:sale_price_effective_date>${new Date().toISOString().split('T')[0]}T00:00:00+00:00/${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T23:59:59+00:00</g:sale_price_effective_date>` : ''}
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
    const itemId = sku || handle;
    // GMC CRITICAL: When discount exists, g:price MUST be the ORIGINAL (higher) price
    // and g:sale_price MUST be the DISCOUNTED (lower) price.
    const noSizeDisplayPrice = hasDiscount ? compareAtPrice : price;
    const noSizeSalePrice = hasDiscount ? price : '';

    variantEntries.push(`
  <item>
    <g:id>${escapeXml(itemId)}</g:id>
    <g:title>${escapeXml(product.title)}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${escapeXml(link)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    ${additionalImages.map(img => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n    ')}
    <g:availability>in_stock</g:availability>
    <g:price>${noSizeDisplayPrice} ${currency}</g:price>
    ${noSizeSalePrice ? `<g:sale_price>${noSizeSalePrice} ${currency}</g:sale_price>` : ''}
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
