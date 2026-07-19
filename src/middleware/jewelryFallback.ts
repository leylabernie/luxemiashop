/**
 * Jewelry Product Fallback for Bot SSR
 *
 * Jewelry products are hardcoded in src/data/jewelryProducts.ts and NOT synced
 * to Shopify. When the middleware's Shopify API call returns null for a
 * /product/{handle} URL, this module provides a fallback lookup to generate
 * proper SSR HTML instead of returning a soft-404.
 */

export interface JewelryProductMinimal {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  material: string;
  category: string;
}

function toHandle(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Import and build handle map at module load time
import { jewelryProducts } from '../data/jewelryProducts.js';

const JEWELRY_MAP = new Map<string, JewelryProductMinimal>();
for (const p of jewelryProducts) {
  JEWELRY_MAP.set(toHandle(p.name), {
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image,
    description: p.description,
    material: p.material,
    category: p.category,
  });
}

export function getJewelryProductByHandle(handle: string): JewelryProductMinimal | null {
  return JEWELRY_MAP.get(handle) || null;
}

const SITE_URL = 'https://luxemia.shop';

export function generateJewelryProductHtml(product: JewelryProductMinimal, canonicalUrl: string): string {
  const title = `${product.name} | ${product.category} | LuxeMia`;
  const description = product.description.slice(0, 160);
  const price = product.price;
  const originalPrice = product.originalPrice;
  const hasDiscount = originalPrice ? originalPrice > price : false;
  const discountPercent = hasDiscount ? Math.round((1 - price / originalPrice!) * 100) : 0;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What material is the ${product.name} made of?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The ${product.name} is crafted with ${product.material}. Each piece undergoes quality inspection before shipping.`
        }
      },
      {
        "@type": "Question",
        "name": `Does LuxeMia ship ${product.category.toLowerCase()} internationally?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, LuxeMia ships ${product.category.toLowerCase()} worldwide including USA, Canada, UK, Australia, and UAE. Free shipping on orders over $350.`
        }
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": description,
    "url": canonicalUrl,
    "image": product.image,
    "brand": { "@type": "Brand", "name": "LuxeMia" },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "LuxeMia" }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Jewelry", "item": `${SITE_URL}/jewelry` },
      { "@type": "ListItem", "position": 3, "name": product.name, "item": canonicalUrl }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description.replace(/"/g, '&quot;')}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="product">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}">
  <meta property="og:image" content="${product.image}">
  <meta property="og:site_name" content="LuxeMia">
  <meta property="product:price:amount" content="${hasDiscount ? originalPrice : price}">
  <meta property="product:price:currency" content="USD">
  ${hasDiscount ? `<meta property="product:sale_price:amount" content="${price}">` : ''}
  <meta property="product:availability" content="in stock">
  <meta property="product:brand" content="LuxeMia">
  <meta property="product:condition" content="new">
  <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Playfair Display', Georgia, serif; color: #1a1a1a; background: #fafaf9; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    nav { padding: 12px 0; font-size: 13px; color: #888; }
    nav a { color: #888; text-decoration: none; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin: 32px 0; }
    .product-info h1 { font-size: 28px; font-weight: 500; margin-bottom: 12px; }
    .price { font-size: 24px; margin-bottom: 16px; }
    .price-sale { color: #c41e3a; font-weight: 600; }
    .price-original { text-decoration: line-through; color: #999; font-size: 16px; margin-left: 8px; }
    .description { font-size: 14px; color: #555; margin-bottom: 24px; line-height: 1.7; }
    .details { font-size: 13px; color: #666; margin-bottom: 24px; }
    .details dt { font-weight: 600; display: inline; }
    .details dd { display: inline; margin-left: 4px; margin-bottom: 4px; }
    .shipping-info { font-size: 12px; color: #666; margin-top: 16px; padding: 12px; background: #f5f5f4; border-radius: 4px; }
    footer { margin-top: 64px; padding: 24px 0; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; text-align: center; }
    @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr; gap: 24px; } }
  </style>
</head>
<body>
  <div class="container">
    <nav><a href="${SITE_URL}">Home</a> &rsaquo; <a href="${SITE_URL}/jewelry">Jewelry</a> &rsaquo; ${product.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</nav>
    <div class="product-grid">
      <div><img src="${product.image}" alt="${product.name.replace(/"/g, '&quot;')}" style="max-width:100%;height:auto;border-radius:2px;" width="800" height="1067" /></div>
      <div class="product-info">
        <h1>${product.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
        <div class="price">
          ${hasDiscount
            ? `<span class="price-sale">$${price}</span><span class="price-original">$${originalPrice}</span>`
            : `<span>$${price}</span>`
          }
        </div>
        <p class="description">${product.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        <dl class="details">
          <div><dt>Brand:</dt><dd>LuxeMia</dd></div>
          <div><dt>Material:</dt><dd>${product.material.replace(/</g, '&lt;')}</dd></div>
          <div><dt>Category:</dt><dd>${product.category}</dd></div>
          <div><dt>Availability:</dt><dd>In Stock</dd></div>
        </dl>
        <div class="shipping-info">
          <strong>Shipping:</strong> Free shipping on orders over $350. Delivery 7-10 business days via DHL/USPS to USA, Canada, and Australia.<br>
          <strong>Returns:</strong> All sales final. Damage claims within 48h with unboxing video.<br>
          <strong>Contact:</strong> hello@luxemia.shop | +1-215-341-9990
        </div>
      </div>
    </div>
    <footer><p>&copy; 2026 LuxeMia. All rights reserved.</p></footer>
  </div>
</body>
</html>`;
}