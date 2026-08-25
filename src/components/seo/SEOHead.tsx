import { Helmet } from 'react-helmet-async';
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateWebPageSchema,
  generateSiteNavigationSchema,
  forceJpegForGmc,
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
    price: string;
    currency: string;
    image: string;
    description: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
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
  title = 'Indian Ethnic Wear Online USA | Tracked Shipping | LuxeMia',
  description = 'Shop Indian outfits for U.S. celebrations: bridal lehengas, wedding sarees, salwar kameez, menswear and jewelry with tracked shipping.',
  canonical,
  image = 'https://luxemia.shop/images/campaigns/new-indian-ethnic-wear-2026-desktop.jpg',
  type = 'website',
  product,
  structuredProduct,
  // `collection` prop is intentionally not destructured here. It remains in the
  // SEOHeadProps interface for backwards compatibility (callers still pass it),
  // but the ItemList schema is now generated server-side by scripts/prerender.js
  // to avoid a duplicate-ItemList critical error in Google Rich Results.
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

  // The current default locale and shipping market remain en-US.
  const hreflangAlternates = hreflang || [
    { lang: 'en-US', href: canonicalUrl },
    { lang: 'x-default', href: canonicalUrl },
  ];
  
  // Convert relative image paths to absolute URLs
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Use shared forceJpegForGmc from schema.ts for GMC-safe image URLs
  const gmcSafeImage = forceJpegForGmc(absoluteImage);

  // Product Schema — uses shared generateProductSchema from schema.ts
  // Fallbacks ensure required Merchant Listings fields (image, description,
  // offers.price) are always present even when Shopify data is incomplete.
  const productSchema = structuredProduct || (product
    ? generateProductSchema({
        name: product.name,
        image: [forceJpegForGmc(product.image || absoluteImage)],
        description:
          (product.description && product.description.trim().length > 0)
            ? product.description
            : `Shop the ${product.name} at LuxeMia — Indian ethnic wear online with tracked United States shipping.`,
        sku: product.sku || '',
        gtin: product.gtin,
        mpn: product.mpn,
        url: canonicalUrl,
        brand: product.brand,
        category: product.category,
        googleProductCategory: product.googleProductCategory,
        color: product.color,
        material: product.material,
        sizes: product.sizes,
        additionalProperties: product.additionalProperties,
        price: product.price,
        compareAtPrice: product.originalPrice || null,
        currency: product.currency || 'USD',
        availability: product.availability === 'InStock' ? 'InStock' : 'OutOfStock',
        shipsWithinDays: product.shipsWithinDays,
      })
    : null);

  // Breadcrumb Schema — uses shared generateBreadcrumbSchema from schema.ts
  const breadcrumbSchema = breadcrumbs
    ? generateBreadcrumbSchema(breadcrumbs)
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

  // NOTE: ItemList schema for collection pages is now generated server-side
  // by scripts/prerender.js and injected into the prerendered HTML at build
  // time. This client-side injection was removed because it produced a
  // DUPLICATE ItemList on every collection page (one server-rendered, one
  // client-injected via react-helmet-async), which Google Rich Results flags
  // as a critical error: "Multiple ListItem elements defined on page".

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
      <meta property="og:image" content={product ? gmcSafeImage : absoluteImage} />
      {/* og:image dimensions — declared as 1600x900 to match the evergreen
          campaign image used as the non-product social fallback. This
          fixes WhatsApp/LinkedIn/Twitter share card rendering and removes
          the "og:image dimensions missing" warning from social card
          validators. Product pages may serve a product image; the dimensions
          meta is a hint, not a constraint, so crawlers will fall back to
          the actual image if it differs. */}
      <meta property="og:image:width" content="1600" />
      <meta property="og:image:height" content="900" />
      <meta property="og:site_name" content="LuxeMia" />
      <meta property="og:locale" content="en_US" />

      {/* Product-specific Open Graph */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content={product.currency} />
          {product.originalPrice && product.originalPrice !== product.price && (
            <meta property="product:sale_price:amount" content={product.price} />
          )}
          {product.originalPrice && product.originalPrice !== product.price && (
            <meta property="product:sale_price:currency" content={product.currency} />
          )}
          <meta property="product:original_price:amount" content={product.originalPrice || product.price} />
          <meta property="product:original_price:currency" content={product.currency} />
          <meta property="product:availability" content={product.availability === 'InStock' ? 'in stock' : 'out of stock'} />
          <meta property="product:brand" content={product.brand || 'LuxeMia'} />
          <meta property="product:condition" content="new" />
          {product.category && <meta property="product:category" content={product.category} />}
          {product.color && <meta property="product:color" content={product.color} />}
          {product.material && <meta property="product:material" content={product.material} />}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={product ? gmcSafeImage : absoluteImage} />
      <meta name="twitter:site" content="@LuxeMia" />
      {product && <meta name="twitter:label1" content="Price" />}
      {product && <meta name="twitter:data1" content={`${product.currency} ${product.price}`} />}

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
