import { rewrite, next } from '@vercel/functions';

/**
 * Vercel Edge Middleware (non-Next.js / Vite)
 *
 * Detects search engine bot user agents and serves server-rendered HTML
 * with proper SEO content. Regular users get the normal SPA experience.
 *
 * CRITICAL FIX: For product pages accessed by bots/crawlers (including GMC's
 * page checker), we dynamically fetch product data from Shopify Storefront API
 * and generate complete HTML with meta tags, structured data, and visible content.
 * This fixes the "Product page unavailable" GMC error caused by SPA rendering.
 */

// ─── Bot Detection ───────────────────────────────────────────────────────────

const BOT_USER_AGENTS = [
  'googlebot',
  'google-inspectiontool',
  'google-InspectionTool',
  'mediapartners-google',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'slurp',
  'sogou',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'pinterestbot',
  'redditbot',
  'oai-searchbot',
  'perplexitybot',
  'claudebot',
  'gptbot',
  'ia_archiver',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
  // Additional crawlers that GMC / Google Shopping may use
  'googleweb-light',
  'google-sa',           // Google Search Appliance
  'storebot-google',     // Google Store bot
  'google-sitemaps',     // Google Sitemaps crawler
  'adsbot-google',       // Google Ads bot (used for landing page quality)
  'feedfetcher-google',  // Google Feedfetcher
  // GMC-specific page checker user agents
  'adsbot-google-mobile',  // Google Ads mobile bot (GMC mobile landing page checks)
  'mediapartners-google',  // Google AdSense / AdWords bot
  'google-produce',        // Google Product Search bot (legacy)
  'google-shopping',       // Google Shopping quality checker
];

// ─── Shopify Storefront API ──────────────────────────────────────────────────

const SHOPIFY_STOREFRONT_URL = 'https://lovable-project-zlh0w.myshopify.com/api/2025-07/graphql.json';
const SHOPIFY_STOREFRONT_TOKEN = 'c98d10d5abd95e6a8d6ddbed223ef4b4';

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
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
        minVariantPrice {
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
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

interface ShopifyImage { url: string; altText: string | null }
interface ShopifyProduct {
  id: string; title: string; description: string; handle: string;
  vendor?: string; productType?: string; tags?: string[];
  availableForSale?: boolean;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: { id: string; title: string; sku?: string; price: { amount: string; currencyCode: string }; compareAtPrice: { amount: string; currencyCode: string } | null; availableForSale: boolean } }> };
  options: Array<{ name: string; values: string[] }>;
}

// Simple in-memory cache for product data (Edge runtime, per-cold-start)
const productCache = new Map<string, { data: ShopifyProduct | null; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  // Check cache first
  const cached = productCache.get(handle);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: PRODUCT_BY_HANDLE_QUERY,
        variables: { handle },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const product = data?.data?.productByHandle || null;

    // Cache the result (even null to avoid re-fetching invalid handles)
    productCache.set(handle, { data: product, timestamp: Date.now() });

    return product;
  } catch (error) {
    console.error('Middleware: Shopify fetch failed for handle:', handle, error);
    return null;
  }
}

// ─── Image URL Helpers ────────────────────────────────────────────────────────

/**
 * Force JPEG format for Google Merchant Center compliance.
 * GMC only accepts JPEG, PNG, and GIF — WebP/AVIF are REJECTED.
 */
function forceJpegForGmc(url: string): string {
  if (!url) return url;
  // Shopify CDN — add format=jpg
  if (url.includes('cdn.shopify.com') || url.includes('myshopify.com')) {
    // Remove existing format param and re-add as jpg
    const clean = url.replace(/[&?]format=\w+/g, '');
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}format=jpg&width=1200`;
  }
  // kesimg CDN — add format=jpg
  if (url.includes('kesimg.b-cdn.net')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}format=jpg`;
  }
  // Other URLs — add .jpg extension hint if no extension
  if (!url.match(/\.(jpg|jpeg|png|gif)(\?|$)/i)) {
    // URL has no image extension — might be a dynamic image server
    // Try appending format=jpg as a best effort
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}format=jpg`;
  }
  return url;
}

// ─── HTML Generation ─────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCategoryUrl(productType?: string): string {
  if (!productType) return '/collections';
  const type = productType.toLowerCase();
  if (type.includes('lehenga')) return '/lehengas';
  if (type.includes('saree')) return '/sarees';
  if (type.includes('suit') || type.includes('salwar') || type.includes('anarkali') || type.includes('palazzo') || type.includes('sharara')) return '/suits';
  if (type.includes('sherwani') || type.includes('kurta') || type.includes('menswear')) return '/menswear';
  return '/collections';
}

function generateProductHtml(product: ShopifyProduct, canonicalUrl: string): string {
  const siteUrl = 'https://luxemia.shop';
  const title = `${product.title} | ${product.productType || 'Ethnic Wear'} | LuxeMia`;
  const description = (product.description || `Shop ${product.title} at LuxeMia. Premium quality Indian ethnic wear with worldwide shipping.`).slice(0, 160);
  const price = product.priceRange.minVariantPrice.amount;
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
  const imageUrl = product.images.edges[0]?.node.url || `${siteUrl}/og-image.jpg`;
  const gmcSafeImage = forceJpegForGmc(imageUrl);
  const categoryUrl = getCategoryUrl(product.productType);
  const categoryName = product.productType || 'Collections';
  const availability = product.availableForSale !== false ? 'InStock' : 'OutOfStock';
  const vendor = product.vendor || 'LuxeMia';

  // Get color and material from options
  const colorOption = product.options?.find(o => o.name?.toLowerCase() === 'color');
  const materialOption = product.options?.find(o => o.name?.toLowerCase() === 'fabric' || o.name?.toLowerCase() === 'material');
  const sizeOption = product.options?.find(o => o.name?.toLowerCase() === 'size' || o.name?.toLowerCase() === 'bust size' || o.name?.toLowerCase() === 'chest size');
  const color = colorOption?.values?.[0];
  const material = materialOption?.values?.[0];
  const sizes = sizeOption?.values || [];

  // Get SKU from first variant
  const sku = product.variants.edges[0]?.node?.sku || product.id.split('/').pop() || '';

  // Determine Google Product Category using numeric taxonomy IDs
  const getGoogleProductCategory = (productType?: string, title?: string): string => {
    const t = (title || '').toLowerCase();
    const pt = (productType || '').toLowerCase();
    if (pt.includes('men') || t.includes('sherwani') || t.includes('kurta pajama') || t.includes('groom wear')) {
      if (t.includes('sherwani')) return '2195';
      if (t.includes('kurta')) return '2197';
      return '2104';
    }
    if (pt.includes('lehenga')) return '2271';
    if (pt.includes('saree')) return '5424';
    if (pt.includes('necklace')) return '193';
    if (pt.includes('earring')) return '194';
    if (pt.includes('bangle') || pt.includes('bracelet')) return '200';
    if (pt.includes('jewel')) return '188';
    if (pt.includes('suit') || pt.includes('anarkali') || pt.includes('sharara') || pt.includes('palazzo') || pt.includes('salwar')) return '2271';
    return '1604';
  };

  const googleProductCategory = getGoogleProductCategory(product.productType, product.title);

  // Determine gender
  const isMenswear = (product.productType || '').toLowerCase().includes('men') || (product.title || '').toLowerCase().includes('sherwani') || (product.title || '').toLowerCase().includes('kurta pajama');
  const gender = isMenswear ? 'male' : 'female';

  // Price display
  const priceNum = parseFloat(price);
  const compareNum = compareAtPrice ? parseFloat(compareAtPrice) : 0;
  const hasDiscount = compareNum > priceNum;
  const discountPercent = hasDiscount ? Math.round((1 - priceNum / compareNum) * 100) : 0;

  // GMC CRITICAL: Price handling for schema.org
  // When a product has a sale, the schema offers.price must be the ORIGINAL (higher) price
  // and we add a sale price via priceSpecification. This matches GMC's expectation that
  // g:price = original, g:sale_price = discounted, and the landing page must be consistent.
  const schemaPrice = hasDiscount ? compareAtPrice! : price; // Original/higher price
  const schemaSalePrice = hasDiscount ? price : undefined;   // Discounted/lower price

  // Product schema with shipping details and return policy
  // All shipping countries match the merchant feed (US, CA, GB, AE, AU)
  const allShippingCountries = ['US', 'CA', 'GB', 'AE', 'AU'];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [gmcSafeImage, ...product.images.edges.slice(1, 5).map(e => forceJpegForGmc(e.node.url))],
    description: description,
    sku: sku,
    mpn: sku,
    url: canonicalUrl,
    brand: { '@type': 'Brand', name: vendor },
    category: product.productType || 'Clothing > Traditional & Ethnic Wear',
    googleProductCategory: googleProductCategory,
    ...(color && { color }),
    ...(material && { material }),
    ...(sizes.length > 0 && { size: sizes.join('/') }),
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      price: schemaPrice,
      priceCurrency: currency,
      ...(schemaSalePrice && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          priceType: 'https://schema.org/SalePrice',
          price: schemaSalePrice,
          priceCurrency: currency,
          validFrom: new Date().toISOString().split('T')[0],
          priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      }),
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: `https://schema.org/${availability}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'LuxeMia' },
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          name: 'DHL Express Free (orders over $300)',
          shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: currency },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: allShippingCountries },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
          },
        },
        {
          '@type': 'OfferShippingDetails',
          name: 'USPS/UPS Standard',
          shippingRate: { '@type': 'MonetaryAmount', value: '14.95', currency: currency },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: allShippingCountries },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY' },
          },
        },
        {
          '@type': 'OfferShippingDetails',
          name: 'DHL Express (paid)',
          shippingRate: { '@type': 'MonetaryAmount', value: '39.95', currency: currency },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: allShippingCountries },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
          },
        },
      ],
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        name: 'LuxeMia Return Policy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        returnFees: 'https://schema.org/FreeReturn',
        description: 'All sales are final. LuxeMia does not accept returns or exchanges. Only genuine shipping damage claims are accepted within 48 hours with mandatory unboxing video.',
      },
    },
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: categoryName, item: `${siteUrl}${categoryUrl}` },
      { '@type': 'ListItem', position: 3, name: product.title, item: canonicalUrl },
    ],
  };

  // FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What sizes are available for the ${product.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The ${product.title} is available in sizes S, M, L, XL, XXL, and Custom sizing. We offer complimentary custom tailoring to ensure a perfect fit.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the delivery time for the ${product.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Readymade items are dispatched within 3-5 business days. Custom/alteration orders are dispatched within 5-7 business days. Delivery takes 3-5 business days via DHL Express, or 7-10 business days via USPS/UPS standard shipping.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I return the ${product.title} if it doesn't fit?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `All sales are final. LuxeMia does not accept returns or exchanges. The only exception is genuine shipping damage, which requires a mandatory unboxing video. Please use our Size Guide before ordering.`,
        },
      },
    ],
  };

  // Generate all product images HTML
  const allImages = product.images.edges.map((edge, i) => {
    const imgSrc = forceJpegForGmc(edge.node.url);
    return `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(edge.node.altText || product.title)}" style="max-width:100%;height:auto;${i === 0 ? '' : 'max-width:80px;margin:4px;'}" ${i === 0 ? 'width="800" height="1067"' : ''} />`;
  });

  // Variant options HTML
  const variantOptions = product.variants.edges.slice(0, 5).map(v => {
    const vTitle = v.node.title !== 'Default Title' ? v.node.title : '';
    return vTitle ? `<span style="display:inline-block;padding:4px 12px;margin:2px;border:1px solid #ccc;border-radius:4px;font-size:13px;">${escapeHtml(vTitle)}</span>` : '';
  }).filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta name="author" content="LuxeMia">
  <meta name="google-site-verification" content="YkBw01UrNiQIlBg0FzSt7XjnWbNuMmbC4ux8eJGBEjY">

  <!-- Open Graph -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(gmcSafeImage)}">
  <meta property="og:site_name" content="LuxeMia">
  <meta property="og:locale" content="en_US">
  <meta property="product:price:amount" content="${escapeHtml(schemaPrice)}">
  <meta property="product:price:currency" content="${escapeHtml(currency)}">
  ${schemaSalePrice ? `<meta property="product:sale_price:amount" content="${escapeHtml(schemaSalePrice)}">` : ''}
  ${schemaSalePrice ? `<meta property="product:sale_price:currency" content="${escapeHtml(currency)}">` : ''}
  <meta property="product:original_price:amount" content="${escapeHtml(hasDiscount ? compareAtPrice! : price)}">
  <meta property="product:original_price:currency" content="${escapeHtml(currency)}">
  <meta property="product:availability" content="${availability === 'InStock' ? 'in stock' : 'out of stock'}">
  <meta property="product:brand" content="${escapeHtml(vendor)}">
  <meta property="product:condition" content="new">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(gmcSafeImage)}">

  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-D1NN0TC3Y0"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-D1NN0TC3Y0', { send_page_view: true, allow_google_signals: true, linked_domains: ['luxemia.shop', 'lovable-project-zlh0w.myshopify.com'] });
  </script>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Playfair Display', 'Lora', Georgia, serif; color: #1a1a1a; background: #fafaf9; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    nav { padding: 12px 0; font-size: 13px; color: #888; }
    nav a { color: #888; text-decoration: none; }
    nav a:hover { color: #1a1a1a; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin: 32px 0; }
    .product-images img { width: 100%; height: auto; border-radius: 2px; }
    .product-thumbs { display: flex; gap: 4px; margin-top: 8px; }
    .product-info h1 { font-size: 28px; font-weight: 500; margin-bottom: 12px; line-height: 1.3; }
    .price { font-size: 24px; margin-bottom: 16px; }
    .price-sale { color: #c41e3a; font-weight: 600; }
    .price-original { text-decoration: line-through; color: #999; font-size: 16px; margin-left: 8px; }
    .discount-badge { display: inline-block; background: #c41e3a; color: white; font-size: 12px; padding: 2px 8px; border-radius: 2px; margin-left: 8px; }
    .description { font-size: 14px; color: #555; margin-bottom: 24px; line-height: 1.7; }
    .details { font-size: 13px; color: #666; margin-bottom: 24px; }
    .details dt { font-weight: 600; display: inline; }
    .details dd { display: inline; margin-left: 4px; margin-bottom: 4px; }
    .trust-badges { display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; }
    .trust-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #2e7d32; }
    .trust-badge svg { width: 18px; height: 18px; }
    .shipping-info { font-size: 12px; color: #666; margin-top: 16px; padding: 12px; background: #f5f5f4; border-radius: 4px; }
    footer { margin-top: 64px; padding: 24px 0; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; text-align: center; }
    @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr; gap: 24px; } }
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <nav>
      <a href="${siteUrl}">Home</a> &rsaquo;
      <a href="${siteUrl}${categoryUrl}">${escapeHtml(categoryName)}</a> &rsaquo;
      ${escapeHtml(product.title)}
    </nav>

    <div class="product-grid">
      <div class="product-images">
        ${allImages[0] || ''}
        ${allImages.length > 1 ? `<div class="product-thumbs">${allImages.slice(1).join('\n')}</div>` : ''}
      </div>

      <div class="product-info">
        <h1>${escapeHtml(product.title)}</h1>
        <div class="price">
          ${hasDiscount
            ? `<span class="price-sale">${currency} ${price}</span><span class="price-original">${currency} ${compareAtPrice}</span><span class="discount-badge">${discountPercent}% OFF</span>`
            : `<span>${currency} ${price}</span>`
          }
        </div>
        <p class="description">${escapeHtml(product.description?.slice(0, 500) || '')}</p>

        ${variantOptions ? `<div style="margin-bottom:16px;">${variantOptions}</div>` : ''}

        <dl class="details">
          ${vendor ? `<div><dt>Brand:</dt><dd>${escapeHtml(vendor)}</dd></div>` : ''}
          ${color ? `<div><dt>Color:</dt><dd>${escapeHtml(color)}</dd></div>` : ''}
          ${material ? `<div><dt>Fabric:</dt><dd>${escapeHtml(material)}</dd></div>` : ''}
          ${sizes.length > 0 ? `<div><dt>Available Sizes:</dt><dd>${escapeHtml(sizes.join(', '))}</dd></div>` : ''}
          <div><dt>Gender:</dt><dd>${gender === 'male' ? 'Male' : 'Female'}</dd></div>
          <div><dt>Condition:</dt><dd>New</dd></div>
          <div><dt>Availability:</dt><dd>${availability === 'InStock' ? 'In Stock' : 'Out of Stock'}</dd></div>
        </dl>

        <div class="trust-badges">
          <div class="trust-badge">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            SSL Secure
          </div>
          <div class="trust-badge">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5M19.5 9.5L21 12h-3l1.5-2.5M6 18.5A1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 15.5 1.5 1.5 0 0 1 7.5 17 1.5 1.5 0 0 1 6 18.5M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/></svg>
            Free Shipping over $300
          </div>
          <div class="trust-badge">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Quality Inspected
          </div>
          <div class="trust-badge">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            Shopify Secure Pay
          </div>
        </div>

        <div class="shipping-info">
          <strong>Shipping:</strong> Free DHL Express (3-5 days) on orders over $300. Standard USPS/UPS (7-10 days) at $14.95/item.<br>
          <strong>Dispatch:</strong> Readymade 3-5 business days | Custom/Alterations 5-7 business days<br>
          <strong>Returns:</strong> All sales final. Damage claims within 48h with unboxing video.<br>
          <strong>Contact:</strong> hello@luxemia.shop | +1-215-341-9990
        </div>
      </div>
    </div>

    <footer>
      <p>&copy; 2026 LuxeMia. All rights reserved. | 2208 Michener St, Philadelphia, PA 19115, USA</p>
      <p>
        <a href="${siteUrl}/shipping">Shipping Policy</a> |
        <a href="${siteUrl}/returns">Returns &amp; Cancellations</a> |
        <a href="${siteUrl}/privacy">Privacy Policy</a> |
        <a href="${siteUrl}/terms">Terms of Service</a> |
        <a href="${siteUrl}/contact">Contact Us</a>
      </p>
    </footer>
  </div>
</body>
</html>`;
}

// ─── Pre-rendered Routes ─────────────────────────────────────────────────────

const PRERENDERED_ROUTES = new Set([
  '/',
  '/suits',
  '/lehengas',
  '/sarees',
  '/menswear',
  '/blog',
  '/blog/sharara-suit-guide-2026-styles-fabrics',
  '/blog/pakistani-suits-anarkali-shopping-guide',
  '/blog/style-lehenga-choli-every-wedding-event',
  '/blog/indian-wedding-season-2026-outfit-guide',
  '/blog/fabric-guide-indian-ethnic-wear-georgette-silk-chiffon',
  '/blog/indian-wedding-dress-complete-guide',
  '/blog/red-bridal-lehenga-trends-2026',
  '/blog/designer-wedding-dress-under-50000',
  '/blog/wedding-guest-outfit-ideas',
  '/blog/saree-draping-styles-every-occasion',
  '/blog/indian-wedding-trends-2026',
  '/blog/lehenga-color-for-dark-skin',
  '/blog/wedding-saree-for-mother-of-bride',
  '/blog/designer-wedding-dress-under-500',
  '/blog/nri-wedding-ethnic-wear-trends-2026',
  '/blog/buy-authentic-indian-sarees-online-usa-uk',
  '/blog/styling-indian-ethnic-wear-festive-occasions-abroad',
  '/collections',
  '/brand-story',
  '/new-arrivals',
  '/bestsellers',
  '/indowestern',
  '/nri',
  '/nri/usa',
  '/nri/uk',
  '/nri/canada',
  '/indian-ethnic-wear-usa',
  '/indian-ethnic-wear-uk',
  '/indian-ethnic-wear-canada',
  '/style-consultation',
  '/style-quiz',
  '/size-guide',
  '/care-guide',
  '/faq',
  '/shipping',
  '/returns',
  '/contact',
  '/artisans',
  '/sustainability',
  '/virtual-try-on',
  '/products',
  '/privacy',
  '/terms',
  '/press',
  // NOTE: /product/* routes are NOT listed here on purpose.
  // ALL product pages are handled by the dynamic SSR path below
  // (which fetches live data from Shopify Storefront API).
  // Previously, listing product routes here caused the middleware to
  // try serving non-existent prerendered HTML files, falling through
  // to the empty SPA shell — the root cause of GMC "page unavailable"
  // errors. Dynamic SSR generates richer HTML with real prices, images,
  // and structured data anyway.
]);

// Routes that redirect elsewhere (should not be treated as 404)
const REDIRECT_ROUTES = new Set([
  '/our-story',
  '/lookbook',
  '/jewelry',
  '/collections/wedding-sarees',
  '/collections/bridal-lehengas',
  '/collections/reception-outfits',
  '/collections/festive-wear',
  '/collections/sarees',
  '/collections/salwar-kameez',
  '/collections/suits',
  '/collections/menswear',
  '/collections/lehengas',
  '/collections/indo-western',
  '/collections/bridesmaid-dresses',
  '/collections/groomsman-outfits',
]);

// ─── Bot Detection ───────────────────────────────────────────────────────────

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}

// ─── 404 Response ────────────────────────────────────────────────────────────

let cached404Html: string | null = null;

async function return404(request: Request): Promise<Response> {
  if (!cached404Html) {
    try {
      const resp = await fetch(new URL('/_prerender/404.html', request.url).toString());
      cached404Html = await resp.text();
    } catch {
      cached404Html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page Not Found | LuxeMia</title><meta name="robots" content="noindex,nofollow"></head><body><h1>Page Not Found</h1><p>The page you are looking for could not be found.</p></body></html>`;
    }
  }
  return new Response(cached404Html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

// ─── Main Middleware ─────────────────────────────────────────────────────────

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const { pathname } = url;

  // Skip non-page requests (static files, API, etc.)
  if (
    pathname.startsWith('/_prerender') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/catalogs') ||
    pathname.includes('.')
  ) {
    return next();
  }

  // For bots: serve prerendered or dynamically-rendered content
  if (isBot(userAgent)) {
    // 1. Prerendered static routes → serve prerendered HTML
    if (PRERENDERED_ROUTES.has(pathname)) {
      const prerenderPath =
        pathname === '/'
          ? '/_prerender/index.html'
          : `/_prerender${pathname}.html`;

      return rewrite(new URL(prerenderPath, request.url));
    }

    // 2. Product pages → DYNAMIC SSR from Shopify API
    //    This is the CRITICAL FIX for GMC "Product page unavailable" errors.
    //    Instead of letting bots through to the SPA (which renders empty HTML
    //    that GMC can't crawl), we fetch product data from Shopify and generate
    //    complete HTML with meta tags, structured data, and visible content.
    if (pathname.startsWith('/product/')) {
      const handle = pathname.replace('/product/', '');

      // Try fetching from Shopify Storefront API
      const product = await fetchProductByHandle(handle);

      if (product) {
        const canonicalUrl = `https://luxemia.shop/product/${handle}`;
        const html = generateProductHtml(product, canonicalUrl);

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
            'X-Robots-Tag': 'index, follow',
          },
        });
      }

      // Product not found in Shopify → return 404 with noindex
      return return404(request);
    }

    // 3. Collection/category pages that aren't prerendered — let through to SPA
    if (pathname.startsWith('/collections/')) {
      return next();
    }

    // 4. /admin → noindex
    if (pathname.startsWith('/admin')) {
      return new Response(
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Admin | LuxeMia</title></head><body><p>Admin panel — not indexed.</p></body></html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    // 5. Unknown route → proper HTTP 404
    if (!REDIRECT_ROUTES.has(pathname)) {
      return return404(request);
    }
  }

  // Regular users or redirect routes → normal SPA experience
  return next();
}

export const config = {
  matcher: [
    '/((?!_prerender|assets|api|favicon\\.ico|og-image\\.jpg|robots\\.txt|sitemap\\.xml|images|catalogs|3c4a52b9-542f-4bfe-a61b-9afb42f4312c\\.txt|google4e3f332d00afc8ba\\.html|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|csv|txt|xml|tsv)).*)',
  ],
};
