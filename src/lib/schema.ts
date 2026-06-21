/**
 * Shared Schema.org Module — Single source of truth for structured data generation.
 *
 * Used by:
 * - SEOHead.tsx (client-side React Helmet)
 * - middleware.ts (Edge SSR for bots and all visitors)
 * - scripts/prerender.js (Static site generation at build time)
 *
 * This ensures consistency across all rendering paths.
 * Critical for AI search engines to accurately understand product, business, and content details.
 */

export const SITE_URL = 'https://luxemia.shop';
export const BUSINESS_NAME = 'LuxeMia Boutique';
export const BRAND_NAME = 'LuxeMia Boutique';
export const LEGAL_ENTITY_NAME = 'Glamour Indian Wear';
export const SHIPPING_COUNTRIES = ['US', 'CA', 'AU'];

// ─── Price Handling ─────────────────────────────────────────────────────────

interface PriceData {
  price: string;
  compareAtPrice?: string | null;
  currency: string;
}

export function getSchemaPrices(priceData: PriceData) {
  const priceNum = parseFloat(priceData.price);
  const compareNum = priceData.compareAtPrice ? parseFloat(priceData.compareAtPrice) : 0;
  const hasDiscount = compareNum > priceNum;

  return {
    schemaPrice: hasDiscount ? priceData.compareAtPrice! : priceData.price,
    schemaSalePrice: hasDiscount ? priceData.price : undefined,
    hasDiscount,
    discountPercent: hasDiscount ? Math.round((1 - priceNum / compareNum) * 100) : 0,
  };
}

// ─── Shipping Schema ───────────────────────────────────────────────────────

export function generateShippingSchema(currency: string) {
  return [
    {
      '@type': 'OfferShippingDetails',
      name: 'Free Shipping on Orders Over $350 — Readymade',
      shippingRate: { '@type': 'MonetaryAmount', value: '0', currency },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: SHIPPING_COUNTRIES },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY', description: 'Readymade dispatch' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY', description: 'USPS/UPS/DHL delivery' },
      },
    },
    {
      '@type': 'OfferShippingDetails',
      name: 'Free Shipping on Orders Over $350 — Custom/Alterations',
      shippingRate: { '@type': 'MonetaryAmount', value: '0', currency },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: SHIPPING_COUNTRIES },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 7, unitCode: 'DAY', description: 'Custom/alteration dispatch' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY', description: 'USPS/UPS/DHL delivery' },
      },
    },
    {
      '@type': 'OfferShippingDetails',
      name: 'Flat Rate Shipping $25 — Readymade',
      shippingRate: { '@type': 'MonetaryAmount', value: '25.00', currency },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: SHIPPING_COUNTRIES },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY', description: 'Readymade dispatch' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY', description: 'USPS/UPS/DHL delivery' },
      },
    },
    {
      '@type': 'OfferShippingDetails',
      name: 'Flat Rate Shipping $25 — Custom/Alterations',
      shippingRate: { '@type': 'MonetaryAmount', value: '25.00', currency },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: SHIPPING_COUNTRIES },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 7, unitCode: 'DAY', description: 'Custom/alteration dispatch' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY', description: 'USPS/UPS/DHL delivery' },
      },
    },
  ];
}

// ─── Return Policy Schema ──────────────────────────────────────────────────

export function generateReturnPolicySchema() {
  return {
    '@type': 'MerchantReturnPolicy',
    name: 'LuxeMia Return Policy',
    applicableCountry: 'US',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    description: 'All sales are final. LuxeMia does not accept returns or exchanges. Only genuine shipping damage claims are accepted within 48 hours with mandatory unboxing video.',
  };
}

// ─── Product Schema ────────────────────────────────────────────────────────

export interface ProductSchemaInput {
  name: string;
  description: string;
  url: string;
  image: string[];
  sku: string;
  brand?: string;
  category?: string;
  googleProductCategory?: string;
  color?: string;
  material?: string;
  pattern?: string;        // e.g., "Embroidered", "Zari", "Sequined"
  audience?: string;       // e.g., "Women", "Men", "Bridal", "Festive"
  sizes?: string[];
  price: string;
  compareAtPrice?: string | null;
  currency: string;
  availability: 'InStock' | 'OutOfStock';
}

export function generateProductSchema(input: ProductSchemaInput) {
  const { schemaPrice, schemaSalePrice } = getSchemaPrices({
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    currency: input.currency,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    image: input.image,
    description: input.description,
    sku: input.sku,
    mpn: input.sku,
    url: input.url,
    brand: { '@type': 'Brand', name: input.brand || BRAND_NAME },
    category: input.category || 'Clothing > Traditional & Ethnic Wear',
    ...(input.googleProductCategory && { googleProductCategory: input.googleProductCategory }),
    ...(input.color && { color: input.color }),
    ...(input.material && { material: input.material }),
    ...(input.pattern && { pattern: input.pattern }),
    ...(input.audience && {
      audience: {
        '@type': 'PeopleAudience',
        suggestedGender: input.audience,
      },
    }),
    ...(input.sizes && input.sizes.length > 0 && { size: input.sizes.length === 1 ? input.sizes[0] : input.sizes.join('/') }),
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      url: input.url,
      price: schemaPrice,
      priceCurrency: input.currency,
      ...(schemaSalePrice && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          priceType: 'https://schema.org/SalePrice',
          price: schemaSalePrice,
          priceCurrency: input.currency,
          validFrom: new Date().toISOString().split('T')[0],
          priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      }),
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: `https://schema.org/${input.availability}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: BRAND_NAME, alternateName: LEGAL_ENTITY_NAME },
      shippingDetails: generateShippingSchema(input.currency),
      hasMerchantReturnPolicy: generateReturnPolicySchema(),
    },
  };
}

// ─── Breadcrumb Schema ─────────────────────────────────────────────────────

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// ─── FAQ Schema ────────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFaqSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ─── Organization Schema ───────────────────────────────────────────────────

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    alternateName: LEGAL_ENTITY_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description: 'Shop Indian ethnic wear at LuxeMia Boutique. Bridal lehengas, silk sarees, salwar suits & more. Free shipping on orders over $350 to USA, Canada & Australia.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2208 Michener St',
      addressLocality: 'Philadelphia',
      addressRegion: 'PA',
      postalCode: '19115',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-215-341-9990',
      contactType: 'customer service',
      email: 'hello@luxemia.shop',
    },
    sameAs: [
      'https://www.instagram.com/luxemiashop',
      'https://www.facebook.com/luxemiashop',
      'https://www.pinterest.com/luxemiashop',
      'https://www.youtube.com/@luxemiashop',
    ],
  };
}

// ─── Google Product Category Helper ────────────────────────────────────────

export function getGoogleProductCategory(productType?: string, title?: string): string {
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
}

// ─── ItemList Schema (Collection Pages) ────────────────────────────────────
// Enables product carousel rich snippets in SERPs
// KalkiFashion.com uses this on all collection pages

export interface ItemListProduct {
  name: string;
  url: string;
  image: string;
  price: string;
  currency: string;
  availability: 'InStock' | 'OutOfStock';
  position: number;
}

export function generateItemListSchema(
  collectionName: string,
  collectionUrl: string,
  products: ItemListProduct[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collectionName,
    url: collectionUrl,
    itemListElement: products.map(p => ({
      '@type': 'ListItem',
      position: p.position,
      item: {
        '@type': 'Product',
        name: p.name,
        url: p.url,
        image: p.image,
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: p.currency,
          availability: `https://schema.org/${p.availability}`,
        },
      },
    })),
  };
}

// ─── WebSite Schema with SearchAction ──────────────────────────────────────
// Enables Google Sitelinks Search Box
// Used on homepage and all pages

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ─── Speakable Schema (Voice Search) ───────────────────────────────────────
// Marks content sections for voice assistants
// UtsavFashion.com uses this for voice search optimization

export function generateSpeakableSchema(speakableSelectors: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableSelectors,
    },
  };
}

// ─── AggregateRating Schema (for when reviews exist) ───────────────────────

export function generateAggregateRatingSchema(
  ratingValue: number,
  reviewCount: number,
  bestRating: number = 5
) {
  return {
    '@type': 'AggregateRating',
    ratingValue: String(ratingValue),
    reviewCount: String(reviewCount),
    bestRating: String(bestRating),
  };
}

// ─── Image URL Helper ──────────────────────────────────────────────────────

export function forceJpegForGmc(url: string): string {
  if (!url) return url;
  if (url.includes('cdn.shopify.com') || url.includes('myshopify.com')) {
    const clean = url.replace(/[&?]format=\w+/g, '');
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}format=jpg&width=1200`;
  }
  if (url.includes('kesimg.b-cdn.net')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}format=jpg`;
  }
  if (!url.match(/\.(jpg|jpeg|png|gif)(\?|$)/i) && !url.includes('format=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}format=jpg`;
  }
  return url;
}
