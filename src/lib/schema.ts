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
export const BUSINESS_NAME = 'Glamour Indian Wear';
export const BRAND_NAME = 'LuxeMia';
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
    '@id': 'https://luxemia.shop/#returnPolicy',
    name: 'LuxeMia Return & Refund Policy',
    applicableCountry: ['US', 'CA', 'AU'],
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 2,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
    restockingFee: {
      '@type': 'MonetaryAmount',
      value: '0.00',
      currency: 'USD',
    },
    returnShippingFeesAmount: {
      '@type': 'MonetaryAmount',
      value: '0.00',
      currency: 'USD',
    },
    refundType: 'https://schema.org/FullRefund',
    description: 'All sales are final. Returns and exchanges are not accepted. Damage claims are accepted within 48 hours of delivery with mandatory unboxing video. Cancellations are accepted within 24 hours of order placement for a full refund. Damage resolutions may include replacement part, store credit, or partial refund at LuxeMia discretion.',
    url: 'https://luxemia.shop/returns',
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
      seller: { '@type': 'Organization', name: BUSINESS_NAME, alternateName: BRAND_NAME },
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
//
// IMPORTANT: FAQPage rich results were restricted by Google in August 2023 to
// "well-known authoritative government and health websites." For a commercial
// e-commerce site like LuxeMia, emitting FAQPage JSON-LD:
//   • produces ZERO rich-result benefit (Google suppresses it), and
//   • risks a manual quality action if the content is deemed low-quality.
//
// Per the 2026-07-09 SEO audit (Item #1, URGENT), generateFaqSchema() now
// returns `null`. All callers (SEOHead.tsx, htmlGenerator.ts, FAQ.tsx) already
// guard against null, so no FAQPage JSON-LD is emitted anywhere on the site.
// The visible FAQ HTML remains in place — it still helps with AI Engines
// (Perplexity, ChatGPT) and People-Also-Ask since those read the DOM, not
// the JSON-LD.
//
// To re-enable FAQPage schema in the future (e.g. if Google lifts the
// restriction), restore the function body below.

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFaqSchema(_faqs: FAQItem[]): null {
  return null;
}

// ─── Organization Schema ───────────────────────────────────────────────────

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_NAME,
    alternateName: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description: 'Shop Indian ethnic wear at LuxeMia. Bridal lehengas, silk sarees, salwar suits & more. Free shipping on orders over $350 to USA, Canada & Australia.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressRegion: 'Pennsylvania',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-215-341-9990',
      contactType: 'customer service',
      email: 'hello@luxemia.shop',
      areaServed: ['US', 'CA', 'AU'],
      availableLanguage: ['English', 'Hindi'],
    },
    knowsAbout: [
      'Indian Ethnic Wear',
      'Bridal Lehengas',
      'Sarees',
      'Salwar Kameez',
      'Sherwanis',
      'Anarkali Suits',
      'Bridal Wear',
      'Indian Wedding Fashion',
      'NRI Ethnic Wear Shopping',
      'Traditional Indian Textiles',
      'Banarasi Silk',
      'Kanjivaram Sarees',
      'Chikankari Embroidery',
      'Block Printing',
      'Zardozi Work',
      'Indian Wedding Guest Attire',
      'Diwali Outfits',
      'Mehendi Outfits',
      'Custom Tailoring Indian Wear',
    ],
    sameAs: [
      'https://www.instagram.com/luxemiashop',
      'https://www.facebook.com/LuxeMia',
      'https://www.pinterest.com/luxemiashop',
      'https://www.tiktok.com/@shopluxemia',
    ],
  };
}

// ─── WebPage Schema ────────────────────────────────────────────────────────

/**
 * Generate a WebPage schema for any page.
 * Helps search engines understand the page type, its relationship to the site,
 * and enables rich result features like "Breadcrumbs" in SERP.
 */
export function generateWebPageSchema(options: {
  url: string;
  title: string;
  description: string;
  type?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const pageType = options.type || 'WebPage';
  const breadcrumbSchema = options.breadcrumbs && options.breadcrumbs.length > 0
    ? generateBreadcrumbSchema(options.breadcrumbs)
    : null;

  return {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': options.url,
    url: options.url,
    name: options.title,
    description: options.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    ...(breadcrumbSchema && { breadcrumb: breadcrumbSchema }),
  };
}

// ─── SiteNavigationElement Schema ──────────────────────────────────────────

/**
 * Generate a SiteNavigationElement schema for the main site navigation.
 * Helps Google understand site structure for sitelinks and rich results.
 * Emitted once per page (in SEOHead) so crawlers always see the full nav.
 */
export function generateSiteNavigationSchema() {
  const navItems = [
    { name: 'Lehengas', url: '/lehengas' },
    { name: 'Sarees', url: '/sarees' },
    { name: 'Suits', url: '/suits' },
    { name: 'Menswear', url: '/menswear' },
    { name: 'Indo-Western', url: '/indowestern' },
    { name: 'New Arrivals', url: '/new-arrivals' },
    { name: 'Bestsellers', url: '/bestsellers' },
    { name: 'Collections', url: '/collections' },
    { name: 'Blog', url: '/blog' },
    { name: 'Brand Story', url: '/brand-story' },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    url: SITE_URL,
    hasPart: navItems.map(item => ({
      '@type': 'SiteNavigationElement',
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
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
