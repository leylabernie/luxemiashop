/**
 * HTML Generator Module
 */

import {
  forceJpegForGmc, generateProductSchema, generateBreadcrumbSchema,
  generateFaqSchema, getGoogleProductCategory, SITE_URL,
  generateWebSiteSchema, generateItemListSchema,
  generateOrganizationSchema,
} from '../lib/schema.js';
import { getCorrectedTitle } from '../lib/titleCorrections.js';
import { getCorrectedTitleFromSeo, getImageAltText, getQAPairs, getMetaDescription } from '../lib/productSeoData.js';

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateCleanDescription(title: string | undefined | null, productType: string | undefined | null, tags: string[] = []): string {
  const t = (title || '').toLowerCase();
  const pt = (productType || '').toLowerCase();
  const combined = `${t} ${pt} ${tags.join(' ').toLowerCase()}`;

  const colors = ['burgundy','wine','maroon','royal blue','navy','cobalt','fuchsia','magenta','black','cream','beige','white','ivory','gold','antique gold','teal','emerald','green','olive','charcoal','grey','coral','orange','saffron','yellow','rose','pink','plum','purple'];
  let color = '';
  for (const c of colors) { if (combined.includes(c)) { color = c.charAt(0).toUpperCase() + c.slice(1); break; } }

  const fabrics = ['silk','georgette','satin','cotton','net','velvet','organza','chiffon'];
  let fabric = '';
  for (const f of fabrics) { if (combined.includes(f)) { fabric = f.charAt(0).toUpperCase() + f.slice(1); break; } }

  const works = ['zari','zardozi','sequin','embroidery','mirror work','thread work','bead work','resham'];
  let work = '';
  for (const w of works) { if (combined.includes(w)) { work = w.charAt(0).toUpperCase() + w.slice(1); break; } }

  let label = 'ethnic wear';
  if (pt.includes('lehenga')) label = 'lehenga';
  else if (pt.includes('saree')) label = 'saree';
  else if (pt.includes('suit')) label = 'suit';

  const parts: string[] = [];
  if (color) parts.push(color);
  if (fabric) parts.push(fabric);
  parts.push(label);
  if (work) parts.push(`with ${work.toLowerCase()}`);
  const s1 = `${parts.join(' ')}.`;

  const occasions: string[] = [];
  if (combined.includes('wedding') || combined.includes('bridal')) occasions.push('wedding');
  if (combined.includes('festive') || combined.includes('festival')) occasions.push('festive');
  if (combined.includes('party')) occasions.push('party wear');
  if (combined.includes('diwali')) occasions.push('Diwali');
  if (combined.includes('mehndi')) occasions.push('Mehndi');
  if (combined.includes('sangeet')) occasions.push('Sangeet');

  let s2 = '';
  if (occasions.length > 0) s2 = ` Suited for ${occasions.join(', ')}.`;

  return (s1 + s2).trim();
}

function smartTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    slice.lastIndexOf('.'),
    slice.lastIndexOf('!'),
    slice.lastIndexOf('?')
  );
  if (lastSentenceEnd > maxLength * 0.7) {
    return slice.slice(0, lastSentenceEnd + 1);
  }
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.5) {
    return slice.slice(0, lastSpace) + '...';
  }
  return slice + '...';
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

export function generateProductHtml(product: any, canonicalUrl: string): string {
  const rawCleanTitle = (product.title || '').replace(/\s*[-–—|]\s*LuxeMia\s*$/i, '').trim();
  const handleCorrected = getCorrectedTitle(product.handle);
  const seoCorrected = getCorrectedTitleFromSeo(product.title || '');
  const cleanTitle = handleCorrected || seoCorrected || rawCleanTitle;
  const title = `Buy ${cleanTitle} Online | ${product.productType || 'Ethnic Wear'} | LuxeMia Boutique`;
  const seoMetaDesc = getMetaDescription(product.title || '');
  const rawDescFallback = `Buy ${cleanTitle} online at LuxeMia Boutique. Handcrafted Indian ethnic wear. Free shipping over 50 to USA, Canada & Australia. Shop now!`;
  const description = smartTruncate(seoMetaDesc || rawDescFallback, 160);

  const price = product.priceRange?.minVariantPrice?.amount || '0.00';
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'USD';
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
  const imageUrl = product.images?.edges?.[0]?.node?.url || `${SITE_URL}/og-image.jpg`;
  const gmcSafeImage = forceJpegForGmc(imageUrl);
  const categoryUrl = getCategoryUrl(product.productType);
  const categoryName = product.productType || 'Collections';
  const availability = product.availableForSale !== false ? 'InStock' : 'OutOfStock';
  const vendor = product.vendor || 'LuxeMia Boutique';

  const options = product.options || [];
  const colorOption = options.find((o: any) => o.name?.toLowerCase() === 'color');
  const materialOption = options.find((o: any) => o.name?.toLowerCase() === 'fabric' || o.name?.toLowerCase() === 'material');
  const sizeOption = options.find((o: any) => o.name?.toLowerCase() === 'size' || o.name?.toLowerCase() === 'bust size' || o.name?.toLowerCase() === 'chest size');
  const color = colorOption?.values?.[0];
  const material = materialOption?.values?.[0];
  const sizes = sizeOption?.values || [];
  const sku = product.variants?.edges?.[0]?.node?.sku || product.id?.split('/').pop() || '';
  const googleProductCategory = getGoogleProductCategory(product.productType, product.title);

  const isMenswear = (product.productType || '').toLowerCase().includes('men') || (product.title || '').toLowerCase().includes('sherwani') || (product.title || '').toLowerCase().includes('kurta pajama');
  const gender = isMenswear ? 'male' : 'female';

  const productSchema = generateProductSchema({
    name: cleanTitle,
    description: description,
    url: canonicalUrl,
    image: [gmcSafeImage, ...(product.images?.edges?.slice(1, 5).map((e: any) => forceJpegForGmc(e.node.url)) || [])],
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
    { name: cleanTitle, url: canonicalUrl },
  ]);

  const seoFaqs = getQAPairs(product.title || '');
  const fallbackFaqs = [
    {
      question: `What sizes are available for the ${cleanTitle}?`,
      answer: `The ${cleanTitle} is available in sizes S, M, L, XL, XXL, and Custom sizing. We offer complimentary custom tailoring to ensure a perfect fit.`,
    },
    {
      question: `What is the delivery time for the ${cleanTitle}?`,
      answer: `Readymade items are dispatched within 3-5 business days. Custom/alteration orders are dispatched within 5-7 business days. Delivery takes 3-5 business days via DHL Express, or 7-10 business days via USPS/UPS standard shipping.`,
    },
    {
      question: `Can I return the ${cleanTitle} if it doesn't fit?`,
      answer: `All sales are final. LuxeMia Boutique does not accept returns or exchanges. Only genuine shipping damage claims are accepted within 48 hours with mandatory unboxing video.`,
    },
  ];
  const faqSchema = generateFaqSchema(seoFaqs.length > 0 ? seoFaqs : fallbackFaqs);

  const allImages = (product.images?.edges || []).map((edge: any, i: number) => {
    const imgSrc = forceJpegForGmc(edge.node.url);
    const altText = cleanTitle;
    return `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(altText)}" style="max-width:100%;height:auto;${i === 0 ? '' : 'max-width:80px;margin:4px;'}" ${i === 0 ? 'width="800" height="1067"' : ''} loading="${i === 0 ? 'eager' : 'lazy'}" />`;
  });

  const variantOptions = (product.variants?.edges || []).slice(0, 5).map((v: any) => {
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
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta name="author" content="LuxeMia Boutique">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(gmcSafeImage)}">
  <meta property="og:site_name" content="LuxeMia Boutique">
  <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <style>
    body { font-family: 'Playfair Display', serif; color: #1a1a1a; background: #fafaf9; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="product-grid">
      <div class="product-images">${allImages.join('')}</div>
      <div class="product-info">
        <h1>${escapeHtml(product.title)}</h1>
        <div class="price">${currency} ${price}</div>
        <p class="description">${escapeHtml(generateCleanDescription(product.title, product.productType, product.tags || []))}</p>
        <div class="variants">${variantOptions}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function generateCollectionHtml(
  collectionName: string,
  collectionUrl: string,
  collectionDescription: string,
  products: Array<any>,
  breadcrumbItems: Array<{ name: string; url: string }>
): string {
  const itemListSchema = generateItemListSchema(collectionName, collectionUrl, products);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shop ${escapeHtml(collectionName)} Online | LuxeMia Boutique</title>
  <meta name="description" content="${escapeHtml(collectionDescription.slice(0, 160))}">
  <link rel="canonical" href="${collectionUrl}">
  <script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
</head>
<body>
  <h1>Shop ${escapeHtml(collectionName)} Online</h1>
  <p>${escapeHtml(collectionDescription)}</p>
</body>
</html>`;
}

let cached404Html: string | null = null;
export async function return404(request: Request): Promise<Response> {
  if (!cached404Html) {
    try {
      const resp = await fetch(new URL('/_prerender/404.html', request.url).toString());
      cached404Html = await resp.text();
    } catch {
      cached404Html = `<!DOCTYPE html><html lang="en"><body><h1>Page Not Found</h1><p>The page you are looking for could not be found.</p></body></html>`;
    }
  }
  return new Response(cached404Html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
