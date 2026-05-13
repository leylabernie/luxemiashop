import { Helmet } from 'react-helmet-async';
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  forceJpegForGmc,
  SITE_URL,
} from '@/lib/schema';
import type { FAQItem as SchemaFAQItem } from '@/lib/schema';

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
  hreflang?: HreflangAlternate[];
}

// Unified social media links — single source of truth
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/luxemiashop',
  facebook: 'https://www.facebook.com/luxemiashop',
  pinterest: 'https://www.pinterest.com/luxemiashop',
  youtube: 'https://www.youtube.com/@luxemiashop',
};

const SEOHead = ({
  title = 'LuxeMia | Indian Ethnic Wear — Sarees & Lehengas',
  description = 'Shop Indian ethnic wear at LuxeMia. Bridal lehengas, silk sarees, salwar suits & more. Free shipping on orders over $350 to USA, Canada & Australia. Affordable prices.',
  canonical,
  image = 'https://luxemia.shop/og-image.jpg',
  type = 'website',
  product,
  collection,
  breadcrumbs,
  faqs,
  noIndex = false,
  localBusiness,
  hreflang,
}: SEOHeadProps) => {
  const siteUrl = SITE_URL;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? `${siteUrl}${window.location.pathname}` : siteUrl);
  
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
            : `Shop the ${product.name} at LuxeMia — handcrafted Indian ethnic wear with worldwide shipping to USA, Canada, and Australia.`,
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

  // ItemList Schema for collection/category pages (Google Rich Results)
  const collectionSchema = collection && collection.items.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: collection.name,
        description: collection.description,
        numberOfItems: collection.items.length,
        itemListElement: collection.items.slice(0, 30).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            '@id': `${siteUrl}/product/${item.url}`,
            name: item.name,
            image: forceJpegForGmc(item.image),
            url: `${siteUrl}/product/${item.url}`,
            offers: {
              '@type': 'Offer',
              price: item.price,
              priceCurrency: item.currency,
              availability: 'https://schema.org/InStock',
            },
          },
        })),
      }
    : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang tags for international pages */}
      {hreflang && hreflang.map((alt) => (
        <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.href} />
      ))}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={product ? gmcSafeImage : absoluteImage} />
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
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
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
      {collectionSchema && (
        <script type="application/ld+json">
          {JSON.stringify(collectionSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
export { SOCIAL_LINKS };
