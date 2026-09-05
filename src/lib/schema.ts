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
export const LEGAL_BUSINESS_NAME = 'LuxeMia';
export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];
export const INTERNATIONAL_SHIPPING_COUNTRIES = ['CA', 'GB', 'AU', 'NZ', 'ZA', 'MU'];
export const BRAND_LOGO_URL = `${SITE_URL}/og-image.jpg`;

/**
 * Owner-verified social profiles used for schema.org `sameAs`.
 *
 * Source of truth: these must match the profile links rendered in
 * `src/components/layout/Footer.tsx`. A `sameAs` entry pointing at a dead or
 * unowned profile weakens the entity signal instead of strengthening it, so
 * only confirmed-live, owner-controlled URLs belong here.
 */
export const BRAND_SOCIAL_PROFILES = [
  'https://www.instagram.com/luxemiausa',
  'https://www.facebook.com/LuxeMia',
  'https://www.pinterest.com/luxemiashop',
  'https://www.tiktok.com/@shopluxemia',
] as const;

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

function normalizeShipsWithinDays(value?: number | null): number | null {
  if (!Number.isFinite(value) || !value || value < 1) return null;
  return Math.trunc(value);
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
  // Country-specific statutory rights and voluntary return rules cannot be
  // represented accurately by one global MerchantReturnPolicy object.
  // Merchant Center remains the source of truth for country-level settings.
  return null;
}

// Standard U.S. shipping terms are defined once at the Organization level.
// Product-level shippingDetails should be added only for documented SKU-specific
// exceptions, rather than copying policy data into every offer.
export function generateUsShippingServiceSchema() {
  const createService = (id: string, name: string, countries: string | string[], rate: number, freeThreshold?: number) => ({
    '@type': 'ShippingService',
    '@id': `${SITE_URL}/#${id}`,
    name,
    shippingConditions: [
      {
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
        ...(freeThreshold ? { orderValue: { '@type': 'MonetaryAmount', minValue: 0, maxValue: freeThreshold - 0.01, currency: 'USD' } } : {}),
        shippingRate: { '@type': 'MonetaryAmount', value: rate, currency: 'USD' },
      },
      ...(freeThreshold ? [{
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
        orderValue: { '@type': 'MonetaryAmount', minValue: freeThreshold, currency: 'USD' },
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
      }] : []),
    ],
  });

  return [
    createService('us-standard-shipping', 'LuxeMia U.S. Standard Shipping', 'US', 14.99, 199),
    createService('canada-uk-standard-shipping', 'LuxeMia Canada and UK Standard Shipping', ['CA', 'GB'], 24.99, 299),
    createService('australia-nz-standard-shipping', 'LuxeMia Australia and New Zealand Standard Shipping', ['AU', 'NZ'], 29.99, 349),
    createService('south-africa-standard-shipping', 'LuxeMia South Africa Standard Shipping', 'ZA', 49.99),
    createService('mauritius-standard-shipping', 'LuxeMia Mauritius Standard Shipping', 'MU', 59.99),
  ];
}

// Product-level shipping details mirror the public U.S. shipping terms:
// $14.99 below $199 and free at $199+. A handling-time window is emitted only
// when the product carries a valid custom.ships_within value. Carrier transit
// remains omitted because it depends on the destination and selected service.
export function generateUsProductShippingDetails(shipsWithinDays?: number | null) {
  const handlingDays = normalizeShipsWithinDays(shipsWithinDays);
  const deliveryTime = handlingDays ? {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: handlingDays, unitCode: 'DAY' },
  } : null;
  const withTime = (details: Record<string, unknown>) => ({ ...details, ...(deliveryTime && { deliveryTime }) });
  const create = (countries: string | string[], rate: number, freeThreshold?: number) => [
    withTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
      ...(freeThreshold ? { orderValue: { '@type': 'MonetaryAmount', maxValue: freeThreshold - 0.01, currency: 'USD' } } : {}),
      shippingRate: { '@type': 'MonetaryAmount', value: rate, currency: 'USD' },
    }),
    ...(freeThreshold ? [withTime({
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: countries },
      orderValue: { '@type': 'MonetaryAmount', minValue: freeThreshold, currency: 'USD' },
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'USD' },
    })] : []),
  ];
  return [
    ...create('US', 14.99, 199),
    ...create(['CA', 'GB'], 24.99, 299),
    ...create(['AU', 'NZ'], 29.99, 349),
    ...create('ZA', 49.99),
    ...create('MU', 59.99),
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
  /** Source-backed custom.ships_within handling window; carrier transit is intentionally not inferred. */
  shipsWithinDays?: number | null;
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

function generateOfferSchema(
  input: Pick<ProductVariantSchemaInput, 'url' | 'price' | 'currency' | 'availability'> & {
    shipsWithinDays?: number | null;
  },
) {
  return {
    '@type': 'Offer',
    '@id': `${input.url}#offer`,
    url: input.url,
    price: input.price,
    priceCurrency: input.currency,
    availability: `https://schema.org/${input.availability}`,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': `${SITE_URL}/#organization` },
    merchantReturnLink: `${SITE_URL}/returns#merchant-return-policy`,
    shippingDetails: generateUsProductShippingDetails(input.shipsWithinDays),
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
  /** Source-backed custom.ships_within handling window; carrier transit is intentionally not inferred. */
  shipsWithinDays?: number | null;
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
      offers: generateOfferSchema({ ...variant, shipsWithinDays: input.shipsWithinDays }),
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
      shipsWithinDays: input.shipsWithinDays,
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
    '@id': `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    url: SITE_URL,
    logo: BRAND_LOGO_URL,
    description: 'LuxeMia is an online Indian ethnic wear store serving shoppers in seven countries with product details, sizing guidance and tracking after dispatch.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressRegion: 'Pennsylvania',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      '@id': `${SITE_URL}/#customer-support`,
      telephone: '+1-215-341-9990',
      contactType: 'customer service',
      email: 'hello@luxemia.shop',
      areaServed: SHIPPING_COUNTRIES,
      availableLanguage: ['English'],
    },
    brand: { '@id': `${SITE_URL}/#brand` },
    // Verified owner-operated profiles. `sameAs` is an entity-identity signal,
    // not a marketing claim: it lets Google and AI engines resolve LuxeMia to a
    // single real business and disambiguates the brand from similarly named
    // entities (e.g. the unrelated "LUXEMIA INC" storefront in Miami, FL).
    // Only add URLs confirmed to resolve to a live, owner-controlled profile.
    sameAs: BRAND_SOCIAL_PROFILES,
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
    hasShippingService: generateUsShippingServiceSchema(),
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
    { name: 'Our Story', url: '/about' },
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
