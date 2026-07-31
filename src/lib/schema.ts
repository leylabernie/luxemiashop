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
export const BRAND_NAME = 'LuxeMia';
export const LEGAL_BUSINESS_NAME = 'Glamour Indian Wear';
export const SHIPPING_COUNTRIES = ['US'];

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

export function generateShippingSchema(currency: string, orderAmount: string | number) {
  const qualifiesForFreeShipping = Number(orderAmount) >= 150;

  return [
    {
      '@type': 'OfferShippingDetails',
      name: qualifiesForFreeShipping
        ? 'Free US Shipping for This Order'
        : 'Flat US Shipping Below $150',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: qualifiesForFreeShipping ? '0' : '12.00',
        currency,
      },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: SHIPPING_COUNTRIES },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY', description: 'Dispatch time varies by stitching status' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 10, unitCode: 'DAY', description: 'Carrier transit begins after dispatch' },
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
    applicableCountry: 'US',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    description: 'All sales are final. Genuine shipping damage claims must be reported within 48 hours of delivery with photos and a mandatory unboxing video.',
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
      seller: { '@type': 'Organization', name: BRAND_NAME, legalName: LEGAL_BUSINESS_NAME },
      shippingDetails: generateShippingSchema(input.currency, input.price),
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
// Re-enabled per SEO audit Phase 4 (Fix 4.x): FAQPage JSON-LD provides structured
// data for AI engines (Perplexity, ChatGPT) and potential Google rich results.
// Blog posts already emit FAQPage via inline logic — this restores consistency.

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFaqSchema(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;
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
    legalName: LEGAL_BUSINESS_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description: 'Ready-to-ship Indian ethnic wear at LuxeMia. Sarees, lehengas, suits and menswear available online with tracked U.S. delivery.',
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
      areaServed: ['US'],
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
    { name: 'Featured Styles', url: '/bestsellers' },
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
