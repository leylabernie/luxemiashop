import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

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
  title = 'LuxeMia | Indian Ethnic Wear Online - Sarees, Lehengas & Suits',
  description = 'Shop Indian ethnic wear at LuxeMia. Beautiful sarees, bridal lehengas, anarkali suits, and wedding collections at affordable prices. Worldwide shipping. Quality assured.',
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
  const siteUrl = 'https://luxemia.shop';
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? `${siteUrl}${window.location.pathname}` : siteUrl);
  
  // Convert relative image paths to absolute URLs
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Enhanced Product Schema for Google Rich Results
  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: [product.image],
        description: product.description,
        sku: product.sku,
        mpn: product.sku,
        url: canonicalUrl,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'LuxeMia',
        },
        category: product.category || 'Clothing > Traditional & Ethnic Wear',
        ...(product.color && { color: product.color }),
        ...(product.material && { material: product.material }),
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          price: product.price,
          priceCurrency: product.currency,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availability: `https://schema.org/${product.availability || 'InStock'}`,
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'LuxeMia',
          },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0',
              currency: product.currency,
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: ['IN', 'US', 'GB', 'AE', 'CA', 'AU'],
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 1,
                maxValue: 3,
                unitCode: 'DAY',
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 5,
                maxValue: 14,
                unitCode: 'DAY',
              },
            },
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'IN',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 7,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn',
          },
        },
      }
    : null;

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${siteUrl}${crumb.url}`,
        })),
      }
    : null;

  // FAQ Schema for rich snippets
  const faqSchema = faqs && faqs.length > 0
    ? {
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
      }
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
            image: item.image,
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
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content="LuxeMia" />
      <meta property="og:locale" content="en_US" />

      {/* Product-specific Open Graph */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content={product.currency} />
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
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:site" content="@LuxeMia" />
      {product && <meta name="twitter:label1" content="Price" />}
      {product && <meta name="twitter:data1" content={`${product.currency} ${product.price}`} />}

      {/* Additional Meta */}
      <meta name="author" content="LuxeMia" />
      <meta name="keywords" content="indian ethnic wear, sarees online, buy sarees online, indian sarees online, sarees online USA, bridal lehengas online, wedding lehenga, lehenga online, salwar kameez online, buy salwar kameez online USA, anarkali suits online, banarasi silk sarees, kanchipuram silk sarees, affordable indian ethnic wear, indian wedding outfits online, indian jewelry online, kundan jewelry online, indo western dresses, indo western outfits, indian clothing online, indian clothes USA, indian ethnic wear UK, indian clothing Canada, sherwani online, kurta pajama online, buy indian ethnic wear online, best indian ethnic wear store, NRI indian clothing, indian wedding dress online, party wear lehenga online" />

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
