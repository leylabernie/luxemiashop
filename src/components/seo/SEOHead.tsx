import { Helmet } from 'react-helmet-async';
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateWebPageSchema,
  generateSiteNavigationSchema,
  forceJpegForGmc,
  normalizeProductCondition,
  SITE_URL,
} from '@/lib/schema';
import type { FAQItem as SchemaFAQItem } from '@/lib/schema';
import { clampDescription, clampTitle } from '@/lib/meta/clamp';

// Re-export FAQItem for consumers that import it from this module
export type FAQItem = SchemaFAQItem;

interface CollectionItem {
  id: string;
  name: string;
  url: string;
  image: string;
  price: string;
  currency: string;
}

interface HreflangAlternate {
  lang: string;
  href: string;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article' | 'collection';
  product?: {
    name: string;
    offerUrl?: string;
    price: string;
    currency: string;
    image: string;
    description: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    condition?: string;
    sku?: string;
    gtin?: string;
    mpn?: string;
    originalPrice?: string;
    category?: string;
    brand?: string;
    color?: string;
    material?: string;
    sizes?: string[];
    additionalProperties?: Array<{ name: string; value: string }>;
    googleProductCategory?: string;
    shipsWithinDays?: number | null;
  };
  /** A ProductGroup schema for multi-variant listings, replacing the single Product schema. */
  structuredProduct?: Record<string, unknown>;
  collection?: {
    name: string;
    description: string;
    items: CollectionItem[];
  };
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: FAQItem[];
  noIndex?: boolean;
  noIndexFollow?: boolean;
  localBusiness?: Record<string, unknown>;
  /**
   * Additional JSON-LD schemas to inject (each rendered as its own
   * <script type="application/ld+json"> block). Use for page-specific schemas
   * that don't fit the localBusiness/product/breadcrumb/faq pattern, e.g.
   * OnlineStore, ItemList, etc.
   */
  additionalSchemas?: Record<string, unknown>[];
  hreflang?: HreflangAlternate[];
}

const SEOHead = ({
  title = 'Indian Wedding Sarees, Lehengas & Ethnic Wear | LuxeMia',
  description = 'Shop South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to seven supported countries.',
  canonical,
  image = 'https://luxemia.shop/images/campaigns/new-indian-ethnic-wear-2026-desktop.jpg',
  type = 'website',
  product,
  structuredProduct,
  collection,
  breadcrumbs,
  faqs,
  noIndex = false,
  noIndexFollow = false,
  localBusiness,
  additionalSchemas,
  hreflang,
}: SEOHeadProps) => {
  const siteUrl = SITE_URL;
  const seoTitle = clampTitle(title);
  const seoDescription = clampDescription(description);
  // Canonicals must always resolve to the production apex domain. Using only
  // the pathname prevents Vercel/Lovable preview hosts, query parameters, and
  // legacy domains from becoming canonical. Explicit page canonicals remain
  // preferred; the normalized browser path is a safe fallback for any future
  // route whose component accidentally omits the prop.
  const canonicalSource = canonical
    || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalPath = new URL(canonicalSource, `${siteUrl}/`).pathname
    .replace(/\/+$/, '') || '/';
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  // This is one English storefront serving seven countries, not separate
  // regional URL variants. Advertise the page as generic English and keep the
  // same canonical URL as x-default; do not imply U.S.-only targeting.
  const hreflangAlternates = hreflang || [
    { lang: 'en', href: canonicalUrl },
    { lang: 'x-default', href: canonicalUrl },
  ];
  
  // Convert relative image paths to absolute URLs
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  const hasVerifiedProductEvidence = Boolean(
    product
    && product.name.trim()
    && product.description.trim()
    && product.image.trim()
    && Number.isFinite(Number(product.price))
    && Number(product.price) > 0
    && /^[A-Z]{3}$/i.test(product.currency.trim())
    && ['InStock', 'OutOfStock', 'PreOrder'].includes(product.availability || ''),
  );
  const verifiedProduct = hasVerifiedProductEvidence ? product : undefined;
  const productImage = verifiedProduct
    ? forceJpegForGmc(verifiedProduct.image.startsWith('http') ? verifiedProduct.image : `${siteUrl}${verifiedProduct.image}`)
    : undefined;
  const socialImage = type === 'product' ? productImage : absoluteImage;

  // Product markup is emitted only for a complete current commerce record.
  // Missing required facts suppress markup instead of manufacturing fallbacks.
  const productSchema = verifiedProduct
    ? structuredProduct || generateProductSchema({
        name: verifiedProduct.name,
        image: [productImage!],
        description: verifiedProduct.description,
        offerUrl: verifiedProduct.offerUrl,
        sku: verifiedProduct.sku || '',
        gtin: verifiedProduct.gtin,
        mpn: verifiedProduct.mpn,
        url: canonicalUrl,
        brand: verifiedProduct.brand,
        category: verifiedProduct.category,
        googleProductCategory: verifiedProduct.googleProductCategory,
        color: verifiedProduct.color,
        material: verifiedProduct.material,
        sizes: verifiedProduct.sizes,
        additionalProperties: verifiedProduct.additionalProperties,
        price: verifiedProduct.price,
        compareAtPrice: verifiedProduct.originalPrice || null,
        currency: verifiedProduct.currency,
        availability: verifiedProduct.availability!,
        condition: verifiedProduct.condition,
        shipsWithinDays: verifiedProduct.shipsWithinDays,
      })
    : null;

  // Breadcrumb Schema — uses shared generateBreadcrumbSchema from schema.ts
  const breadcrumbSchema = breadcrumbs
    ? {
        ...generateBreadcrumbSchema(breadcrumbs),
        '@id': `${canonicalUrl}#breadcrumb`,
      }
    : null;

  // FAQ Schema — uses shared generateFaqSchema from schema.ts
  const faqSchema = faqs && faqs.length > 0
    ? generateFaqSchema(faqs)
    : null;

  // WebPage Schema — helps search engines understand page context
  const webPageSchema = generateWebPageSchema({
    url: canonicalUrl,
    title: seoTitle,
    description: seoDescription,
  });

  // SiteNavigationElement Schema — helps Google understand site structure for sitelinks
  const siteNavSchema = generateSiteNavigationSchema();

  // main.tsx removes the server-rendered route schemas before Helmet mounts.
  // Recreate the collection graph here so hydrated pages retain exactly one
  // CollectionPage and one broad ItemList without page-level Product markup.
  const collectionItemListSchema = collection
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        name: collection.name,
        numberOfItems: collection.items.length,
        itemListElement: collection.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url.startsWith('http')
            ? item.url
            : new URL(item.url.startsWith('/') ? item.url : `/product/${item.url}`, `${siteUrl}/`).toString(),
          ...(item.image && { image: forceJpegForGmc(item.image.startsWith('http') ? item.image : `${siteUrl}${item.image}`) }),
        })),
      }
    : null;
  const collectionPageSchema = collection
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: collection.name,
        description: collection.description,
        url: canonicalUrl,
        inLanguage: 'en',
        isPartOf: { '@id': `${siteUrl}/#website` },
        mainEntity: { '@id': `${canonicalUrl}#itemlist` },
        ...(breadcrumbSchema && { breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` } }),
      }
    : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && noIndexFollow && <meta name="robots" content="noindex, follow" />}
      {!noIndex && !noIndexFollow && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang tags for international pages */}
      {hreflangAlternates.map((alt) => (
        <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.href} />
      ))}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      {socialImage && <meta property="og:image" content={socialImage} />}
      {/* og:image dimensions — declared as 1600x900 to match the evergreen
          campaign image used as the non-product social fallback. This
          fixes WhatsApp/LinkedIn/Twitter share card rendering and removes
          the "og:image dimensions missing" warning from social card
          validators. Product pages may serve a product image; the dimensions
          meta is a hint, not a constraint, so crawlers will fall back to
          the actual image if it differs. */}
      {type !== 'product' && <meta property="og:image:width" content="1600" />}
      {type !== 'product' && <meta property="og:image:height" content="900" />}
      <meta property="og:site_name" content="LuxeMia" />
      <meta property="og:locale" content="en_US" />

      {/* Product-specific Open Graph */}
      {verifiedProduct && (
        <>
          <meta property="product:price:amount" content={verifiedProduct.price} />
          <meta property="product:price:currency" content={verifiedProduct.currency} />
          {verifiedProduct.originalPrice && verifiedProduct.originalPrice !== verifiedProduct.price && (
            <meta property="product:sale_price:amount" content={verifiedProduct.price} />
          )}
          {verifiedProduct.originalPrice && verifiedProduct.originalPrice !== verifiedProduct.price && (
            <meta property="product:sale_price:currency" content={verifiedProduct.currency} />
          )}
          <meta property="product:original_price:amount" content={verifiedProduct.originalPrice || verifiedProduct.price} />
          <meta property="product:original_price:currency" content={verifiedProduct.currency} />
          <meta property="product:availability" content={verifiedProduct.availability === 'InStock' ? 'in stock' : verifiedProduct.availability === 'PreOrder' ? 'preorder' : 'out of stock'} />
          {verifiedProduct.brand && <meta property="product:brand" content={verifiedProduct.brand} />}
          {normalizeProductCondition(verifiedProduct.condition) && <meta property="product:condition" content={normalizeProductCondition(verifiedProduct.condition)} />}
          {verifiedProduct.category && <meta property="product:category" content={verifiedProduct.category} />}
          {verifiedProduct.color && <meta property="product:color" content={verifiedProduct.color} />}
          {verifiedProduct.material && <meta property="product:material" content={verifiedProduct.material} />}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      {socialImage && <meta name="twitter:image" content={socialImage} />}
      <meta name="twitter:site" content="@LuxeMia" />
      {verifiedProduct && <meta name="twitter:label1" content="Price" />}
      {verifiedProduct && <meta name="twitter:data1" content={`${verifiedProduct.currency} ${verifiedProduct.price}`} />}

      {/* Additional Meta */}
      <meta name="author" content="LuxeMia" />

      {/* Structured Data — only page-specific schemas (Organization & WebSite are in index.html) */}
      {localBusiness && (
        <script type="application/ld+json">
          {JSON.stringify(localBusiness)}
        </script>
      )}
      {additionalSchemas && additionalSchemas.map((schema, i) => (
        <script key={`additional-schema-${i}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {collectionPageSchema && (
        <script type="application/ld+json">
          {JSON.stringify(collectionPageSchema)}
        </script>
      )}
      {collectionItemListSchema && (
        <script type="application/ld+json">
          {JSON.stringify(collectionItemListSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
      {/* WebPage + SiteNavigation schemas — emitted on every page for sitelinks & rich results */}
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(siteNavSchema)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
