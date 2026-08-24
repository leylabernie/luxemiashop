import { getMerchantGoogleProductCategory } from './merchantTaxonomy.js';

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

export function normalizeBrandName(value?: string | null): string {
  const raw = (value || '').trim();
  if (!raw) return BRAND_NAME;
  return /^luxemi(?:a|ashop)$/i.test(raw.replace(/[^a-z0-9]/gi, '')) ? BRAND_NAME : raw;
}

// ─── Price Handling ─────────────────────────────────────────────────────────

interface PriceData {
  price: string;
  compareAtPrice?: string | null;
  currency: string;
}

export function getSchemaPrices(priceData: PriceData) {
  const priceNum = parseFloat(priceData.price);
  const compareNum = priceData.compareAtPrice ? parseFloat(priceData.compareAtPrice) : 0;
  const hasDiscount = Number.isFinite(priceNum) && compareNum > priceNum;

  return {
    // Merchant listings require the active price. A compare-at price is an
    // internal merchandising reference, not the current purchasable price.
    schemaPrice: priceData.price,
    compareAtPrice: hasDiscount ? priceData.compareAtPrice! : undefined,
    hasDiscount,
    discountPercent: hasDiscount ? Math.round((1 - priceNum / compareNum) * 100) : 0,
  };
}

// ─── Return Policy Schema ──────────────────────────────────────────────────

export function generateReturnPolicySchema() {
  return {
    '@type': 'MerchantReturnPolicy',
    '@id': `${SITE_URL}/#returnPolicy`,
    name: 'LuxeMia Final-Sale & Covered Order Issue Policy',
    applicableCountry: 'US',
    returnPolicyCountry: 'US',
    merchantReturnLink: `${SITE_URL}/returns`,
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    description: 'All sales are final and exchanges are not accepted. Genuine shipping damage or defect, an incorrect item, or a missing item must be reported within 48 hours of delivery with clear photos and a continuous unboxing/opening video, subject to rights that cannot legally be excluded.',
    url: `${SITE_URL}/returns`,
  };
}

// Standard U.S. shipping terms are defined once at the Organization level.
// Product-level shippingDetails should be added only for documented SKU-specific
// exceptions, rather than copying policy data into every offer.
export function generateUsShippingServiceSchema() {
  return {
    '@type': 'ShippingService',
    '@id': `${SITE_URL}/#us-standard-shipping`,
    name: 'LuxeMia U.S. Standard Shipping',
    shippingConditions: [
      {
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
        orderValue: {
          '@type': 'MonetaryAmount',
          minValue: 0,
          maxValue: 134.99,
          currency: 'USD',
        },
        shippingRate: { '@type': 'MonetaryAmount', value: 12, currency: 'USD' },
      },
      {
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
        orderValue: {
          '@type': 'MonetaryAmount',
          minValue: 135,
          currency: 'USD',
        },
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
      },
    ],
  };
}

// Product-level shipping details mirror the public U.S. shipping terms:
// $12 below $135 and free at $135+. No delivery-time promise is emitted because
// the storefront correctly states that timing depends on the item and options.
export function generateUsProductShippingDetails() {
  const shippingDestination = {
    '@type': 'DefinedRegion',
    addressCountry: 'US',
  };

  return [
    {
      '@type': 'OfferShippingDetails',
      shippingDestination,
      orderValue: {
        '@type': 'MonetaryAmount',
        maxValue: 134.99,
        currency: 'USD',
      },
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: 12,
        currency: 'USD',
      },
    },
    {
      '@type': 'OfferShippingDetails',
      shippingDestination,
      orderValue: {
        '@type': 'MonetaryAmount',
        minValue: 135,
        currency: 'USD',
      },
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: 0,
        currency: 'USD',
      },
    },
  ];
}

// ─── Product Schema ────────────────────────────────────────────────────────

export interface ProductSchemaInput {
  name: string;
  description: string;
  url: string;
  image: string[];
  sku: string;
  gtin?: string | null;
  mpn?: string | null;
  brand?: string;
  category?: string;
  googleProductCategory?: string;
  color?: string;
  material?: string;
  sizes?: string[];
  additionalProperties?: Array<{ name: string; value: string }>;
  price: string;
  compareAtPrice?: string | null;
  currency: string;
  availability: 'InStock' | 'OutOfStock';
}

export interface ProductVariantSchemaInput {
  id: string;
  name: string;
  description: string;
  url: string;
  image: string[];
  sku?: string;
  gtin?: string | null;
  mpn?: string | null;
  color?: string;
  size?: string;
  additionalProperties?: Array<{ name: string; value: string }>;
  price: string;
  currency: string;
  availability: 'InStock' | 'OutOfStock';
}

function getGtinSchemaProperty(value?: string | null): Record<string, string> {
  const digits = (value || '').replace(/[\s-]/g, '');
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits)) return {};

  const body = digits.slice(0, -1);
  let sum = 0;
  let weight = 3;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  if ((10 - (sum % 10)) % 10 !== Number(digits.at(-1))) return {};

  return { [`gtin${digits.length}`]: digits };
}

function generateOfferSchema(input: Pick<ProductVariantSchemaInput, 'url' | 'price' | 'currency' | 'availability'>) {
  return {
    '@type': 'Offer',
    '@id': `${input.url}#offer`,
    url: input.url,
    price: input.price,
    priceCurrency: input.currency,
    availability: `https://schema.org/${input.availability}`,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': `${SITE_URL}/#org` },
    hasMerchantReturnPolicy: { '@id': `${SITE_URL}/#returnPolicy` },
    shippingDetails: generateUsProductShippingDetails(),
  };
}

export function generateProductGroupSchema(input: {
  name: string;
  description: string;
  url: string;
  image: string[];
  brand?: string;
  category?: string;
  googleProductCategory?: string;
  material?: string;
  additionalProperties?: Array<{ name: string; value: string }>;
  productGroupId: string;
  variesBy: string[];
  variants: ProductVariantSchemaInput[];
}) {
  const groupId = `${input.url}#productgroup`;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': groupId,
    name: input.name,
    image: input.image,
    description: input.description,
    url: input.url,
    brand: { '@type': 'Brand', name: normalizeBrandName(input.brand) },
    category: input.category || 'Clothing > Traditional & Ethnic Wear',
    ...(input.googleProductCategory && { googleProductCategory: input.googleProductCategory }),
    ...(input.material && { material: input.material }),
    ...(input.additionalProperties && input.additionalProperties.length > 0 && {
      additionalProperty: input.additionalProperties.map(({ name, value }) => ({
        '@type': 'PropertyValue',
        name,
        value,
      })),
    }),
    productGroupID: input.productGroupId,
    variesBy: input.variesBy,
    hasVariant: input.variants.map((variant) => ({
      '@type': 'Product',
      '@id': `${variant.url}#product`,
      isVariantOf: { '@id': groupId },
      name: variant.name,
      image: variant.image,
      description: variant.description,
      ...(variant.sku && { sku: variant.sku }),
      ...(variant.mpn && { mpn: variant.mpn }),
      ...getGtinSchemaProperty(variant.gtin),
      url: variant.url,
      brand: { '@type': 'Brand', name: normalizeBrandName(input.brand) },
      category: input.category || 'Clothing > Traditional & Ethnic Wear',
      ...(variant.color && { color: variant.color }),
      ...(input.material && { material: input.material }),
      ...(input.additionalProperties && input.additionalProperties.length > 0 && {
        additionalProperty: input.additionalProperties.map(({ name, value }) => ({
          '@type': 'PropertyValue',
          name,
          value,
        })),
      }),
      ...(variant.size && { size: variant.size }),
      offers: generateOfferSchema(variant),
    })),
  };
}

export function generateProductSchema(input: ProductSchemaInput) {
  const { schemaPrice } = getSchemaPrices({
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    currency: input.currency,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${input.url}#product`,
    name: input.name,
    image: input.image,
    description: input.description,
    ...(input.sku && { sku: input.sku }),
    ...(input.mpn && { mpn: input.mpn }),
    ...getGtinSchemaProperty(input.gtin),
    url: input.url,
    brand: { '@type': 'Brand', name: normalizeBrandName(input.brand) },
    category: input.category || 'Clothing > Traditional & Ethnic Wear',
    ...(input.googleProductCategory && { googleProductCategory: input.googleProductCategory }),
    ...(input.color && { color: input.color }),
    ...(input.material && { material: input.material }),
    ...(input.additionalProperties && input.additionalProperties.length > 0 && {
      additionalProperty: input.additionalProperties.map(({ name, value }) => ({
        '@type': 'PropertyValue',
        name,
        value,
      })),
    }),
    ...(input.sizes && input.sizes.length > 0 && { size: input.sizes.length === 1 ? input.sizes[0] : input.sizes.join('/') }),
    // Always expose the current purchasable price. Do not manufacture sale
    // windows: terms are only valid when backed by a real promotion schedule.
    offers: generateOfferSchema({
      url: input.url,
      price: schemaPrice,
      currency: input.currency,
      availability: input.availability,
    }),
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
    '@id': `${SITE_URL}/#org`,
    name: BRAND_NAME,
    legalName: LEGAL_BUSINESS_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description: 'LuxeMia is an online Indian ethnic wear store serving United States addresses with product details, sizing guidance and tracking after dispatch.',
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
      areaServed: SHIPPING_COUNTRIES,
      availableLanguage: ['English'],
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
    hasMerchantReturnPolicy: generateReturnPolicySchema(),
    hasShippingService: generateUsShippingServiceSchema(),
    sameAs: [
      'https://www.instagram.com/luxemiausa',
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
  return getMerchantGoogleProductCategory(productType, title);
}

// ─── Image URL Helper ──────────────────────────────────────────────────────

export function forceJpegForGmc(url: string): string {
  if (!url) return url;
  if (url.includes('cdn.shopify.com') || url.includes('myshopify.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('format', 'jpg');
      parsed.searchParams.set('width', '1500');
      return parsed.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}format=jpg&width=1500`;
    }
  }
  if (url.includes('kesimg.b-cdn.net')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('format', 'jpg');
      return parsed.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}format=jpg`;
    }
  }
  if (!url.match(/\.(jpg|jpeg|png|gif)(\?|$)/i) && !url.includes('format=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}format=jpg`;
  }
  return url;
}
