/**
 * HTML Generator Module
 *
 * Generates complete HTML pages for bot/crawler requests.
 * Used by middleware.ts for product page SSR and 404 responses.
 */

import type { ShopifyProduct } from './shopifyProxy.js';
import { forceJpegForGmc, generateOrganizationSchema, generateProductSchema, generateProductGroupSchema, generateBreadcrumbSchema, generateFaqSchema, generateWebPageSchema, getGoogleProductCategory, normalizeBrandName, SITE_URL } from '../lib/schema.js';
import { isProductSizeOptionName } from '../lib/productOptionNames.js';

function sanitizeSeoTitle(value: string): string {
  return (value || '')
    .replace(/\s*\|\s*Handcrafted Indian Bridal Luxury/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeProductTitle(value: string): string {
  return (value || '')
    .replace(/^buy\s+/i, '')
    .replace(/\s*(?:[|–—-]\s*)?ready[-\s]?to[-\s]?ship\b/gi, '')
    .replace(/\s*(?:[|–—-]\s*)?handcrafted indian bridal luxury\b/gi, '')
    .replace(/\bhandcrafted\s+/gi, '')
    .replace(/\s*[|–—-]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const JEWELRY_PRODUCT_PATTERN = /\b(jewel|jewell|necklace|choker|earring|bangle|bracelet|ring|maang\s*tikka|anklet|kundan|polki)\b/i;

function parseMetafieldList(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  } catch {
    return [];
  }
}

function isJewelryProduct(productType?: string, title?: string): boolean {
  return JEWELRY_PRODUCT_PATTERN.test(`${productType || ''} ${title || ''}`);
}

function getCategoryUrl(productType?: string, title?: string): string {
  if (!productType && !title) return '/collections';
  const type = (productType || '').toLowerCase();
  if (isJewelryProduct(productType, title)) return '/jewelry';
  if (type.includes('lehenga')) return '/lehengas';
  if (type.includes('saree')) return '/sarees';
  if (type.includes('suit') || type.includes('salwar') || type.includes('anarkali') || type.includes('palazzo') || type.includes('sharara')) return '/suits';
  if (type.includes('sherwani') || type.includes('kurta') || type.includes('menswear')) return '/menswear';
  return '/collections';
}

function getLabeledDescriptionValue(description: string | undefined, labels: string[]): string | undefined {
  const source = (description || '').replace(/\s+/g, ' ').trim();
  if (!source) return undefined;

  const escapedLabels = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const followingLabels = [
    'fabric', 'material', 'top fabric', 'bottom fabric', 'set includes', 'included',
    'included pieces', 'pieces', 'style', 'colour options', 'color options',
    'available sizes', 'sizes', 'fit guidance', 'care', 'shipping',
  ].map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const expression = new RegExp(
    `(?:^|\\s)(?:${escapedLabels})\\s*:\\s*(.+?)(?=\\s+(?:${followingLabels})\\s*:|$)`,
    'i',
  );
  const match = source.match(expression);
  return match?.[1]?.replace(/[.;,\s]+$/, '').trim() || undefined;
}

function getListedProductAttributes(product: ShopifyProduct) {
  const jewelry = isJewelryProduct(product.productType, product.title);
  const listingText = `${product.title || ''} ${product.description || ''}`.toLowerCase();
  const optionValue = (...names: string[]) => product.options
    ?.find((option: { name?: string }) => names.includes((option.name || '').toLowerCase()))
    ?.values?.[0];
  const rawColor = product.colorMetafield?.value || optionValue('color', 'colour');
  const rawMaterial = product.materialMetafield?.value
    || product.fabricMetafield?.value
    || optionValue('fabric', 'material')
    || getLabeledDescriptionValue(product.description, ['fabric', 'material', 'top fabric', 'bottom fabric']);
  const blouseFabric = product.blouseFabricMetafield?.value || undefined;
  const occasions = parseMetafieldList(product.occasionMetafield?.value);
  const components = parseMetafieldList(product.includedComponentsMetafield?.value);
  const sizeValues = product.options
    ?.find((option: { name?: string }) => isProductSizeOptionName(option.name))
    ?.values?.filter((value: string) => value && value.toLowerCase() !== 'default title') || [];
  const includedPiecePrefixes = [
    'included:',
    'included pieces:',
    'pieces:',
    'set includes:',
    'package includes:',
  ];
  const includedPiecesTag = (product.tags || []).find((tag) =>
    includedPiecePrefixes.some((prefix) => tag.toLowerCase().startsWith(prefix)),
  );
  const includedPiecesPrefix = includedPiecesTag
    ? includedPiecePrefixes.find((prefix) => includedPiecesTag.toLowerCase().startsWith(prefix))
    : null;
  const includedPieces = components.length > 0
    ? components.join(', ')
    : includedPiecesTag && includedPiecesPrefix
    ? includedPiecesTag.slice(includedPiecesPrefix.length).trim()
    : getLabeledDescriptionValue(product.description, ['set includes', 'included pieces', 'included', 'pieces', 'package includes']);
  const rawShipsWithin = product.shipsWithinMetafield?.value;
  const shipsWithinDays = rawShipsWithin ? Number.parseInt(rawShipsWithin, 10) : null;

  return {
    jewelry,
    color: rawColor && (!jewelry || listingText.includes(rawColor.toLowerCase())) ? rawColor : undefined,
    material: rawMaterial && (!jewelry || listingText.includes(rawMaterial.toLowerCase())) ? rawMaterial : undefined,
    sizes: jewelry ? [] : sizeValues,
    includedPieces: includedPieces || undefined,
    blouseFabric,
    occasions,
    careInstructions: product.careInstructionsMetafield?.value || undefined,
    productStyle: product.productStyleMetafield?.value || undefined,
    shopifyCategory: product.shopifyCategoryMetafield?.value || undefined,
    googleProductCategory: product.googleProductCategoryMetafield?.value || undefined,
    gender: product.genderMetafield?.value || undefined,
    condition: product.conditionMetafield?.value || undefined,
    shipsWithinDays: Number.isFinite(shipsWithinDays) && Number(shipsWithinDays) > 0
      ? Number(shipsWithinDays)
      : null,
  };
}

function buildVerifiedProductDescription(product: ShopifyProduct): string {
  const title = sanitizeProductTitle(product.title || 'Indian ethnic wear');
  const attributes = getListedProductAttributes(product);
  const parts = [`${title}.`];

  if (product.productType) parts.push(`Category: ${product.productType}.`);
  if (attributes.color) parts.push(`Color: ${attributes.color}.`);
  if (attributes.material) parts.push(`Material: ${attributes.material}.`);
  if (attributes.blouseFabric) parts.push(`Blouse fabric: ${attributes.blouseFabric}.`);
  if (attributes.includedPieces) parts.push(`Included: ${attributes.includedPieces}.`);
  if (attributes.occasions.length > 0) parts.push(`Suitable for: ${attributes.occasions.join(', ')}.`);
  if (attributes.careInstructions) parts.push(`Care: ${attributes.careInstructions}.`);
  if (attributes.sizes.length > 0) {
    parts.push(`Available options: ${attributes.sizes.join(', ')}.`);
  }

  parts.push(
    'Review the product images and available options for the exact pieces, measurements, and current availability.',
    'United States shipping only. Standard shipping is $12 below $135 and free at $135 and above; tracking is provided after dispatch.'
  );

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function generateProductHtml(product: ShopifyProduct, canonicalUrl: string): string {
  const displayTitle = sanitizeProductTitle(product.title);
  // Prefer Shopify admin "Search engine listing" (SEO) fields when set, fall
  // back to a template built from the plain product title/type. This matches
  // the behavior Shopify's own theme uses on the myshopify.com product page
  // and prevents the SEO Title/Description set in admin from being silently
  // ignored.
  const seoTitle = sanitizeProductTitle(sanitizeSeoTitle(product.seo?.title || ''));
  // Do not republish historic SEO or supplier descriptions containing obsolete claims.
  const cleanProductDescription = buildVerifiedProductDescription(product);
  const productAttributes = getListedProductAttributes(product);
  const title = seoTitle || `${displayTitle} | ${product.productType || 'Ethnic Wear'} | LuxeMia`;
  const fallbackDescription = productAttributes.jewelry
    ? `Shop ${displayTitle} at LuxeMia. Indian jewelry online for U.S. customers. Review the listing for exact materials, finish, stones, and included pieces.`
    : `Shop ${displayTitle} at LuxeMia. Indian ethnic wear online with tracked U.S. shipping.`;
  const description = (cleanProductDescription || fallbackDescription).slice(0, 160);
  const price = product.priceRange.minVariantPrice.amount;
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
  const imageUrl = product.images.edges[0]?.node.url || `${SITE_URL}/images/campaigns/new-indian-ethnic-wear-2026-desktop.jpg`;
  const gmcSafeImage = forceJpegForGmc(imageUrl);
  const categoryUrl = getCategoryUrl(product.productType, displayTitle);
  const categoryName = product.productType || 'Collections';
  const availability = product.availableForSale === true || product.variants.edges.some((variant) => variant.node.availableForSale)
    ? 'InStock'
    : 'OutOfStock';
  const vendor = product.vendor || 'LuxeMia';

  const {
    blouseFabric,
    careInstructions,
    color,
    condition,
    gender: metafieldGender,
    googleProductCategory: metafieldGoogleProductCategory,
    includedPieces,
    material,
    occasions,
    productStyle,
    shopifyCategory,
    shipsWithinDays,
    sizes,
  } = productAttributes;
  const schemaVariant = product.variants.edges.find((variant) => variant.node.availableForSale)?.node
    || product.variants.edges[0]?.node;
  const sku = schemaVariant?.sku || '';
  const gtin = schemaVariant?.barcode || '';
  const normalizedVendor = normalizeBrandName(vendor);
  const googleProductCategory = metafieldGoogleProductCategory || getGoogleProductCategory(product.productType, displayTitle);

  const isMenswear = (product.productType || '').toLowerCase().includes('men') || (displayTitle || '').toLowerCase().includes('sherwani') || (displayTitle || '').toLowerCase().includes('kurta pajama');
  const gender = (metafieldGender || (isMenswear ? 'Male' : 'Female')).toLowerCase();
  const conditionLabel = condition || 'New';
  const schemaCategory = shopifyCategory === 'Saris'
    ? 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas > Saris'
    : productAttributes.jewelry
      ? (/necklace|choker/i.test(`${product.productType} ${displayTitle}`)
        ? 'Apparel & Accessories > Jewelry > Necklaces'
        : 'Apparel & Accessories > Jewelry')
      : (product.productType || 'Clothing > Traditional & Ethnic Wear');
  const additionalProperties = [
    { name: 'Fabric', value: material },
    { name: 'Blouse Fabric', value: blouseFabric },
    { name: 'Color', value: color },
    { name: 'Occasion', value: occasions.join(', ') || undefined },
    { name: 'Included Components', value: includedPieces },
    { name: 'Care Instructions', value: careInstructions },
    { name: 'Product Style', value: productStyle },
    { name: 'Shopify Category', value: shopifyCategory },
    { name: 'Google Product Category', value: googleProductCategory },
    { name: 'Gender', value: gender === 'male' ? 'Male' : 'Female' },
    { name: 'Condition', value: conditionLabel },
    { name: 'Market', value: 'United States' },
  ].filter((entry): entry is { name: string; value: string } => Boolean(entry.value));

  const priceNum = parseFloat(price);
  const compareNum = compareAtPrice ? parseFloat(compareAtPrice) : 0;
  const hasDiscount = compareNum > priceNum;
  const discountPercent = hasDiscount ? Math.round((1 - priceNum / compareNum) * 100) : 0;
  // Social/meta price fields must use the current purchasable price, just like
  // Product/Offer JSON-LD. The compare-at value is displayed separately.
  const activePrice = price;
  const schemaSalePrice = hasDiscount ? price : undefined;

  // Generate schema using the same ProductGroup model that the static build
  // uses. Multi-variant products therefore expose every current Shopify offer
  // rather than only the initial color in a bot-rendered response.
  const organizationSchema = generateOrganizationSchema();
  const schemaImages = [gmcSafeImage, ...product.images.edges.slice(1, 5).map(e => forceJpegForGmc(e.node.url))];
  const groupId = product.handle.length <= 50
    ? product.handle
    : `p${product.id.split('/').pop() || product.handle}`;
  const schemaVariants = product.variants.edges.map(({ node: variant }) => {
    const variantId = variant.id.split('/').pop() || '';
    const selectedOptions = variant.selectedOptions || [];
    const colorValue = selectedOptions.find(option => ['color', 'colour'].includes(option.name.toLowerCase()))?.value || '';
    const sizeValue = selectedOptions.find(option => isProductSizeOptionName(option.name))?.value || '';
    const optionLabel = [...new Set(selectedOptions
      .filter(option => option.value && option.name.toLowerCase() !== 'title' && option.value.toLowerCase() !== 'default title')
      .map(option => option.value))].join(' / ');
    const variantUrl = variantId ? `${canonicalUrl}?variant=${encodeURIComponent(variantId)}` : canonicalUrl;
    const variantSku = variant.sku || '';
    const variantGtin = variant.barcode || '';
    return {
      id: variantId,
      name: optionLabel ? `${displayTitle} — ${optionLabel}` : displayTitle,
      description,
      url: variantUrl,
      image: variant.image?.url ? [forceJpegForGmc(variant.image.url)] : schemaImages,
      sku: variantSku,
      gtin: variantGtin,
      mpn: normalizedVendor === 'LuxeMia' && variantSku && !variantGtin ? variantSku : undefined,
      color: colorValue,
      size: sizeValue,
      price: variant.price?.amount || price,
      currency: variant.price?.currencyCode || currency,
      availability: variant.availableForSale === false ? 'OutOfStock' as const : 'InStock' as const,
    };
  });
  const productSchema = schemaVariants.length > 1
    ? generateProductGroupSchema({
        name: displayTitle,
        description,
        url: canonicalUrl,
        image: schemaImages,
        brand: normalizedVendor,
        category: schemaCategory,
        googleProductCategory,
        material,
        additionalProperties,
        productGroupId: groupId,
        shipsWithinDays,
        variesBy: [
          ...(schemaVariants.some((variant) => variant.color) ? ['https://schema.org/color'] : []),
          ...(schemaVariants.some((variant) => variant.size) ? ['https://schema.org/size'] : []),
        ],
        variants: schemaVariants,
      })
    : generateProductSchema({
        name: displayTitle,
        description,
        url: canonicalUrl,
        image: schemaImages,
        sku,
        gtin,
        mpn: normalizedVendor === 'LuxeMia' && sku && !gtin ? sku : undefined,
        brand: normalizedVendor,
        category: schemaCategory,
        googleProductCategory,
        color,
        material,
        sizes,
        additionalProperties,
        price,
        compareAtPrice,
        currency,
        availability: availability as 'InStock' | 'OutOfStock',
        shipsWithinDays,
      });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: categoryName, url: `${SITE_URL}${categoryUrl}` },
    { name: displayTitle, url: canonicalUrl },
  ]);
  const webPageSchema = generateWebPageSchema({
    url: canonicalUrl,
    title,
    description,
  });

  const sizeAnswer = sizes.length > 0
    ? `Available choices shown for this listing are ${sizes.join(', ')}. Review the Size Guide before ordering.`
    : 'Any available size or variant choices are shown on this product page. Contact LuxeMia before ordering if an option is unclear.';
  const productFaqs = [
    ...(productAttributes.jewelry ? [{
      question: `What is included with the ${displayTitle}?`,
      answer: 'The included pieces, finish, colors, and measurements are the ones stated in Product Details and shown in the product images. Contact LuxeMia before ordering if the set contents are unclear.',
    }] : [{
      question: `What sizes are available for the ${displayTitle}?`,
      answer: sizeAnswer,
    }]),
    ...(includedPieces ? [{
      question: `What is included with the ${displayTitle}?`,
      answer: `This listing includes ${includedPieces}. Review the images and Product Details before ordering.`,
    }] : []),
    ...(occasions.length > 0 ? [{
      question: `When can I wear the ${displayTitle}?`,
      answer: `This saree is listed for ${occasions.join(' and ')}.`,
    }] : []),
    {
      question: `Does LuxeMia ship the ${displayTitle} within the United States?`,
      answer: 'Yes. LuxeMia currently ships to United States addresses only. Standard shipping is $12 below $135 and free at $135 and above. Tracking details are emailed when the shipping label is created for dispatch.',
    },
    {
      question: `Can I return the ${displayTitle}?`,
      answer: 'All sales are final and exchanges are not accepted. Genuine shipping damage or defect, an incorrect item, or a missing item must be reported within 48 hours of delivery with clear photos and a continuous unboxing/opening video. See Returns & Cancellations for complete instructions.',
    },
    {
      question: `How should I care for the ${displayTitle}?`,
      answer: careInstructions || 'Follow any care instructions stated in Product Details. Contact LuxeMia before ordering if care information is not listed.',
    },
  ];

  // FAQPage schema is intentionally suppressed — see generateFaqSchema() in
  // src/lib/schema.ts for the rationale (Google Aug-2023 policy change).
  // The same questions remain visible below for customers and answer engines.
  const faqSchema = generateFaqSchema(productFaqs);
  const faqHtml = productFaqs
    .map(({ question, answer }) => `<div style="margin-bottom:16px;"><h3 style="font-size:16px;margin-bottom:4px;">${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></div>`)
    .join('');

  const allImages = product.images.edges.map((edge: { node: { url: string; altText: string | null } }, i: number) => {
    const imgSrc = forceJpegForGmc(edge.node.url);
    return `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(edge.node.altText || displayTitle)}" style="max-width:100%;height:auto;${i === 0 ? '' : 'max-width:80px;margin:4px;'}" ${i === 0 ? 'width="800" height="1067"' : ''} />`;
  });

  const variantOptions = product.variants.edges.slice(0, 5).map((v: { node: { title: string } }) => {
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
  <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <link rel="alternate" hreflang="en-US" href="${escapeHtml(canonicalUrl)}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(canonicalUrl)}">
  <meta name="author" content="LuxeMia">
  <meta name="google-site-verification" content="YkBw01UrNiQIlBg0FzSt7XjnWbNuMmbC4ux8eJGBEjY">
  <meta property="og:type" content="product">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(gmcSafeImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="LuxeMia">
  <meta property="og:locale" content="en_US">
  <meta property="product:price:amount" content="${escapeHtml(activePrice)}">
  <meta property="product:price:currency" content="${escapeHtml(currency)}">
  ${schemaSalePrice ? `<meta property="product:sale_price:amount" content="${escapeHtml(schemaSalePrice)}">` : ''}
  ${schemaSalePrice ? `<meta property="product:sale_price:currency" content="${escapeHtml(currency)}">` : ''}
  <meta property="product:original_price:amount" content="${escapeHtml(hasDiscount ? compareAtPrice! : price)}">
  <meta property="product:original_price:currency" content="${escapeHtml(currency)}">
  <meta property="product:availability" content="${availability === 'InStock' ? 'in stock' : 'out of stock'}">
  <meta property="product:brand" content="${escapeHtml(vendor)}">
  <meta property="product:category" content="${escapeHtml(schemaCategory)}">
  ${color ? `<meta property="product:color" content="${escapeHtml(color)}">` : ''}
  ${material ? `<meta property="product:material" content="${escapeHtml(material)}">` : ''}
  <meta property="product:condition" content="${escapeHtml(conditionLabel.toLowerCase())}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(gmcSafeImage)}">
  <script type="application/ld+json" data-prerender-schema>${JSON.stringify(organizationSchema)}</script>
  <script type="application/ld+json" data-prerender-schema>${JSON.stringify(productSchema)}</script>
  <script type="application/ld+json" data-prerender-schema>${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json" data-prerender-schema>${JSON.stringify(webPageSchema)}</script>
  ${faqSchema ? `<script type="application/ld+json" data-prerender-schema>${JSON.stringify(faqSchema)}</script>` : ''}
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
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap" rel="stylesheet"></noscript>
</head>
<body>
  <div class="container">
    <nav>
      <a href="${SITE_URL}">Home</a> &rsaquo;
      <a href="${SITE_URL}${categoryUrl}">${escapeHtml(categoryName)}</a> &rsaquo;
      ${escapeHtml(displayTitle)}
    </nav>
    <div class="product-grid">
      <div class="product-images">
        ${allImages[0] || ''}
        ${allImages.length > 1 ? `<div class="product-thumbs">${allImages.slice(1).join('\n')}</div>` : ''}
      </div>
      <div class="product-info">
        <h1>${escapeHtml(displayTitle)}</h1>
        <div class="price">
          ${hasDiscount
            ? `<span class="price-sale">${currency} ${price}</span><span class="price-original">${currency} ${compareAtPrice}</span><span class="discount-badge">${discountPercent}% OFF</span>`
            : `<span>${currency} ${price}</span>`
          }
        </div>
        <p class="description">${escapeHtml(cleanProductDescription.slice(0, 500) || '')}</p>
        ${variantOptions ? `<div style="margin-bottom:16px;">${variantOptions}</div>` : ''}
        <h2 style="font-size:22px;margin:24px 0 12px;">Product Specifications</h2>
        <dl class="details">
          <div><dt>Fabric Details</dt><dd>${escapeHtml(material || 'Review the product description for the fabric or material supplied with this listing.')}</dd></div>
          ${blouseFabric ? `<div><dt>Blouse Fabric</dt><dd>${escapeHtml(blouseFabric)}</dd></div>` : ''}
          ${occasions.length > 0 ? `<div><dt>Occasion</dt><dd>${escapeHtml(occasions.join(', '))}</dd></div>` : ''}
          <div><dt>Included Pieces</dt><dd>${escapeHtml(includedPieces || 'See the product description and images. Contact LuxeMia before ordering if the set contents are not stated.')}</dd></div>
          ${careInstructions ? `<div><dt>Care</dt><dd>${escapeHtml(careInstructions)}</dd></div>` : ''}
          ${shopifyCategory ? `<div><dt>Product Category</dt><dd>${escapeHtml(shopifyCategory)}</dd></div>` : ''}
          <div><dt>Sizing &amp; Chart</dt><dd>${escapeHtml(sizes.length > 0 ? `Listed options: ${sizes.join(', ')}. Review the Size Guide before ordering.` : 'Available sizing varies by product. Review the listed options and Size Guide before ordering.')}</dd></div>
          <div><dt>Shipping Estimate</dt><dd>${escapeHtml(shipsWithinDays ? `Ships within ${shipsWithinDays} business day${shipsWithinDays === 1 ? '' : 's'}. Tracking details are emailed when the shipping label is created for dispatch.` : 'Timing depends on the item and selected options. Tracking details are emailed when the shipping label is created for dispatch.')}</dd></div>
          ${vendor ? `<div><dt>Brand</dt><dd>${escapeHtml(vendor)}</dd></div>` : ''}
          ${color ? `<div><dt>Color</dt><dd>${escapeHtml(color)}</dd></div>` : ''}
          <div><dt>Gender</dt><dd>${gender === 'male' ? 'Male' : 'Female'}</dd></div>
          <div><dt>Condition</dt><dd>${escapeHtml(conditionLabel)}</dd></div>
          <div><dt>Availability</dt><dd>${availability === 'InStock' ? 'In Stock' : 'Out of Stock'}</dd></div>
        </dl>
        <div class="trust-badges">
          <div class="trust-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>SSL Secure</div>
          <div class="trust-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5M19.5 9.5L21 12h-3l1.5-2.5M6 18.5A1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 15.5 1.5 1.5 0 0 1 7.5 17 1.5 1.5 0 0 1 6 18.5M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/></svg>Free U.S. shipping at $135 and above</div>
          <div class="trust-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>Shopify Secure Pay</div>
        </div>
        <div class="shipping-info">
          <strong>Shipping:</strong> United States addresses only. Standard shipping is free at $135 and above and $12 below $135.<br>
          <strong>Tracking:</strong> Emailed when the shipping label is created for dispatch. Contact LuxeMia before ordering when an event date is time-sensitive.<br>
          <strong>Returns:</strong> All sales are final and exchanges are not accepted. Genuine shipping damage or defect, an incorrect item, or a missing item must be reported within 48 hours with clear photos and a continuous unboxing/opening video.<br>
          <strong>Contact:</strong> hello@luxemia.shop | +1-215-341-9990
        </div>
      </div>
    </div>
    <section style="margin:32px 0;">
      <h2 style="font-size:22px;margin-bottom:16px;">Product Questions</h2>
      ${faqHtml}
    </section>
    <footer>
      <p>&copy; 2026 LuxeMia. All rights reserved. | Online Indian ethnic wear | USA-based support</p>
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
      // CRITICAL: Tell Google NOT to index 404 pages.
      // Without this, Vercel's catch-all header rule (or no rule at all)
      // would default to indexing, causing 404s to appear in Google search
      // results and waste crawl budget.
      'X-Robots-Tag': 'noindex, follow',
    },
  });
}
