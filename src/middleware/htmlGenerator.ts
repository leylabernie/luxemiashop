/**
 * HTML Generator Module
 *
 * Generates complete HTML pages for bot/crawler requests.
 * Used by middleware.ts for product page SSR and 404 responses.
 */

import { fetchProductByHandle, ShopifyProduct } from './shopifyProxy';
import { forceJpegForGmc, generateProductSchema, generateBreadcrumbSchema, generateFaqSchema, getGoogleProductCategory, SITE_URL } from '../lib/schema';

export function escapeHtml(str: string): string {
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

export function generateProductHtml(product: ShopifyProduct, canonicalUrl: string): string {
  const title = `${product.title} | ${product.productType || 'Ethnic Wear'} | LuxeMia`;
  const description = (product.description || `Shop ${product.title} at LuxeMia. Premium quality Indian ethnic wear with worldwide shipping.`).slice(0, 160);
  const price = product.priceRange.minVariantPrice.amount;
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
  const imageUrl = product.images.edges[0]?.node.url || `${SITE_URL}/og-image.jpg`;
  const gmcSafeImage = forceJpegForGmc(imageUrl);
  const categoryUrl = getCategoryUrl(product.productType);
  const categoryName = product.productType || 'Collections';
  const availability = product.availableForSale !== false ? 'InStock' : 'OutOfStock';
  const vendor = product.vendor || 'LuxeMia';

  const colorOption = product.options?.find(o => o.name?.toLowerCase() === 'color');
  const materialOption = product.options?.find(o => o.name?.toLowerCase() === 'fabric' || o.name?.toLowerCase() === 'material');
  const sizeOption = product.options?.find(o => o.name?.toLowerCase() === 'size' || o.name?.toLowerCase() === 'bust size' || o.name?.toLowerCase() === 'chest size');
  const color = colorOption?.values?.[0];
  const material = materialOption?.values?.[0];
  const sizes = sizeOption?.values || [];
  const sku = product.variants.edges[0]?.node?.sku || product.id.split('/').pop() || '';
  const googleProductCategory = getGoogleProductCategory(product.productType, product.title);

  const isMenswear = (product.productType || '').toLowerCase().includes('men') || (product.title || '').toLowerCase().includes('sherwani') || (product.title || '').toLowerCase().includes('kurta pajama');
  const gender = isMenswear ? 'male' : 'female';

  const priceNum = parseFloat(price);
  const compareNum = compareAtPrice ? parseFloat(compareAtPrice) : 0;
  const hasDiscount = compareNum > priceNum;
  const discountPercent = hasDiscount ? Math.round((1 - priceNum / compareNum) * 100) : 0;
  const schemaPrice = hasDiscount ? compareAtPrice! : price;
  const schemaSalePrice = hasDiscount ? price : undefined;

  // Generate schema using shared module
  const productSchema = generateProductSchema({
    name: product.title,
    description: description,
    url: canonicalUrl,
    image: [gmcSafeImage, ...product.images.edges.slice(1, 5).map(e => forceJpegForGmc(e.node.url))],
    sku,
    brand: vendor,
    category: product.productType || 'Clothing > Traditional & Ethnic Wear',
    googleProductCategory,
    color,
    material,
    sizes,
    price,
    compareAtPrice,
    currency,
    availability: availability as 'InStock' | 'OutOfStock',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: categoryName, url: `${SITE_URL}${categoryUrl}` },
    { name: product.title, url: canonicalUrl },
  ]);

  const faqSchema = generateFaqSchema([
    {
      question: `What sizes are available for the ${product.title}?`,
      answer: `The ${product.title} is available in sizes S, M, L, XL, XXL, and Custom sizing. We offer complimentary custom tailoring to ensure a perfect fit.`,
    },
    {
      question: `What is the delivery time for the ${product.title}?`,
      answer: `Readymade items are dispatched within 3-5 business days. Custom/alteration orders are dispatched within 5-7 business days. Delivery takes 3-5 business days via DHL Express, or 7-10 business days via USPS/UPS standard shipping.`,
    },
    {
      question: `Can I return the ${product.title} if it doesn't fit?`,
      answer: `All sales are final. LuxeMia does not accept returns or exchanges. The only exception is genuine shipping damage, which requires a mandatory unboxing video. Please use our Size Guide before ordering.`,
    },
  ]);

  const allImages = product.images.edges.map((edge, i) => {
    const imgSrc = forceJpegForGmc(edge.node.url);
    return `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(edge.node.altText || product.title)}" style="max-width:100%;height:auto;${i === 0 ? '' : 'max-width:80px;margin:4px;'}" ${i === 0 ? 'width="800" height="1067"' : ''} />`;
  });

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
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(gmcSafeImage)}">
  <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-D1NN0TC3Y0"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-D1NN0TC3Y0', { send_page_view: true, allow_google_signals: true, linked_domains: ['luxemia.shop'] });
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
      <a href="${SITE_URL}">Home</a> &rsaquo;
      <a href="${SITE_URL}${categoryUrl}">${escapeHtml(categoryName)}</a> &rsaquo;
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
          <div class="trust-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>SSL Secure</div>
          <div class="trust-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5M19.5 9.5L21 12h-3l1.5-2.5M6 18.5A1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 15.5 1.5 1.5 0 0 1 7.5 17 1.5 1.5 0 0 1 6 18.5M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/></svg>Free Shipping over $350</div>
          <div class="trust-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>Quality Inspected</div>
          <div class="trust-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>Shopify Secure Pay</div>
        </div>
        <div class="shipping-info">
          <strong>Shipping:</strong> Free shipping on orders over $350. Flat rate $25/order for orders under $350. Delivery 7-10 business days via USPS/UPS/DHL to USA, Canada, and Australia.<br>
          <strong>Dispatch:</strong> Readymade 3-5 business days | Custom/Alterations 5-7 business days<br>
          <strong>Returns:</strong> All sales final. Damage claims within 48h with unboxing video.<br>
          <strong>Contact:</strong> hello@luxemia.shop | +1-215-341-9990
        </div>
      </div>
    </div>
    <footer>
      <p>&copy; 2026 LuxeMia. All rights reserved. | luxemia.shop is owned and operated by Glamour Indian Wear | 2208 Michener St, Philadelphia, PA 19115, USA</p>
      <p><a href="${SITE_URL}/shipping">Shipping Policy</a> | <a href="${SITE_URL}/returns">Returns</a> | <a href="${SITE_URL}/privacy">Privacy</a> | <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/contact">Contact</a></p>
    </footer>
  </div>
</body>
</html>`;
}

// ─── 404 Response ──────────────────────────────────────────────────────────

let cached404Html: string | null = null;

export async function return404(request: Request): Promise<Response> {
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
