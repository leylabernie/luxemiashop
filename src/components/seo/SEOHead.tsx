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
    originalPrice?: string;
    category?: string;
    brand?: string;
    color?: string;
    material?: string;
    sizes?: string[];
    googleProductCategory?: string;
  };
  collection?: {
    name: string;
    description: string;
    items: CollectionItem[];
  };
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: FAQItem[];
  noIndex?: boolean;
  localBusiness?: Record<string, any>;
  /**
   * Additional JSON-LD schemas to inject (each rendered as its own
   * <script type="application/ld+json"> block). Use for page-specific schemas
   * that don't fit the localBusiness/product/breadcrumb/faq pattern, e.g.
   * OnlineStore, ItemList, etc.
   */
  additionalSchemas?: Record<string, any>[];
  hreflang?: HreflangAlternate[];
}

// Unified social media links — single source of truth
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/luxemiashop',
  facebook: 'https://www.facebook.com/LuxeMia',
  pinterest: 'https://www.pinterest.com/luxemiashop',
  tiktok: 'https://www.tiktok.com/@shopluxemia',
};

const SEOHead = ({
  title = 'LuxeMia | Indian Ethnic Wear — Sarees & Lehengas',
  description = 'Shop Indian ethnic wear at LuxeMia. Bridal lehengas, silk sarees, salwar suits & more. Free shipping on orders over $350 to USA, Canada & Australia. Affordable prices.',
  canonical,
  image = 'https://luxemia.shop/og-image.jpg',
  type = 'website',
  product,
  // `collection` prop is intentionally not destructured here. It remains in the
  // SEOHeadProps interface for backwards compatibility (callers still pass it),
  // but the ItemList schema is now generated server-side by scripts/prerender.js
  // to avoid a duplicate-ItemList critical error in Google Rich Results.
  breadcrumbs,
  faqs,
  noIndex = false,
  localBusiness,
  additionalSchemas,
  hreflang,
}: SEOHeadProps) => {
  const siteUrl = SITE_URL;
  const seoTitle = clampTitle(title);
  const seoDescription = clampDescription(description);
  // CRITICAL SEO FIX: Never derive canonical from window.location.pathname.
  // Doing so would let trailing slashes, query strings, and URL variants
  // produce canonicals that disagree with the prerendered HTML — which is
  // exactly what causes "Duplicate, Google chose different canonical than
  // user" errors in GSC. Always pass an explicit `canonical` prop from the
  // page component. Defaulting to the site root is a safe fallback that
  // surfaces a missing-prop bug rather than silently breaking indexing.
  const canonicalUrl = canonical || siteUrl;

  // Hreflang defaults: LuxeMia serves one URL to USA, Canada, and Australia.
  // If a page doesn't pass explicit hreflang alternates, emit the standard
  // 4-tag set (en-US, en-CA, en-AU, x-default) pointing at the canonical URL.
  // Pages with truly different regional URLs (none currently) can override
  // by passing the `hreflang` prop. Added 2026-07-09 per SEO audit Item #5.
  const hreflangAlternates = hreflang || [
    { lang: 'en-US', href: canonicalUrl },
    { lang: 'en-CA', href: canonicalUrl },
    { lang: 'en-AU', href: canonicalUrl },
    { lang: 'x-default', href: canonicalUrl },
  ];
  
  // Convert relative image paths to absolute URLs
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Use shared forceJpegForGmc from schema.ts for GMC-safe image URLs
  const gmcSafeImage = forceJpegForGmc(absoluteImage);

  // Product Schema — uses shared generateProductSchema from schema.ts
  // Fallbacks ensure required Merchant Listings fields (image, description,
  // offers.price) are always present even when Shopify data is incomplete.
  const productSchema = product
    ? generateProductSchema({
        name: product.name,
        image: [forceJpegForGmc(product.image || absoluteImage)],
        description:
          (product.description && product.description.trim().length > 0)
            ? product.description
            : `Shop the ${product.name} at LuxeMia — Indian ethnic wear with delivery to USA, Canada, and Australia.`,
        sku: product.sku || '',
        url: canonicalUrl,
        brand: product.brand,
        category: product.category,
        googleProductCategory: product.googleProductCategory,
        color: product.color,
        material: product.material,
        sizes: product.sizes,
        price: product.price,
        compareAtPrice: product.originalPrice || null,
        currency: product.currency || 'USD',
        availability: product.availability === 'OutOfStock' ? 'OutOfStock' : 'InStock',
      })
    : null;

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
    breadcrumbs: breadcrumbs || undefined,
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
      {!noIndex && <meta name="robots" content="index, follow" />}

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
      {/* og:image dimensions — declared as 1200x630 to match the brand OG
          (public/og-image.jpg) per the 2026-07-09 SEO audit Item #4. This
          fixes WhatsApp/LinkedIn/Twitter share card rendering and removes
          the "og:image dimensions missing" warning from social card
          validators. Product pages may serve a product image; the dimensions
          meta is a hint, not a constraint, so crawlers will fall back to
          the actual image if it differs. */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="LuxeMia" />
      <meta property="og:locale" content="en_US" />

      {/* Product-specific Open Graph */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.originalPrice || product.price} />
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
      <meta name="keywords" content="indian ethnic wear, sarees online, buy sarees online, indian sarees online, sarees online USA, bridal lehengas online, wedding lehenga, lehenga online, salwar kameez online, buy salwar kameez online USA, anarkali suits online, banarasi silk sarees, kanchipuram silk sarees, affordable indian ethnic wear, indian wedding outfits online, indian jewelry online, kundan jewelry online, indo western dresses, indo western outfits, indian clothing online, indian clothes USA, indian ethnic wear Australia, indian clothing Canada, sherwani online, kurta pajama online, buy indian ethnic wear online, best indian ethnic wear store, NRI indian clothing, indian wedding dress online, party wear lehenga online" />

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
export { SOCIAL_LINKS };
