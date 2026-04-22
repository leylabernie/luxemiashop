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
  keywords?: string;
}

const SEOHead = ({
  title = 'LuxeMia | Luxury Indian Ethnic Wear — Sarees, Lehengas & Bridal Couture',
  description = 'Discover exquisite handcrafted Indian ethnic wear at LuxeMia. Shop designer sarees, bridal lehengas, anarkali suits, and wedding collections. Free worldwide shipping to USA, UK & Canada. Premium quality assured.',
  canonical,
  image = 'https://luxemia.shop/og-image.jpg',
  type = 'website',
  product,
  collection,
  breadcrumbs,
  faqs,
  noIndex = false,
  keywords = 'indian ethnic wear, luxury indian fashion, designer lehengas, bridal lehenga online, wedding sarees, anarkali suits, banarasi silk, buy sarees online, indian wedding dress, salwar kameez, luxury ethnic wear USA, free worldwide shipping',
}: SEOHeadProps) => {
  const siteUrl = 'https://luxemia.shop';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : siteUrl;
  const canonicalUrl = canonical || currentUrl;

  // Convert relative image paths to absolute URLs
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Product Schema for Google Rich Results
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
            merchantReturnDays: 14,
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
      {/* Primary Meta Tags — single source of truth via React Helmet */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="LuxeMia" />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <meta name="bingbot" content="index, follow" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang Tags for International Targeting */}
      <link rel="alternate" hrefLang="en-US" href={`${siteUrl}/indian-ethnic-wear-usa`} />
      <link rel="alternate" hrefLang="en-GB" href={`${siteUrl}/indian-ethnic-wear-uk`} />
      <link rel="alternate" hrefLang="en-CA" href={`${siteUrl}/indian-ethnic-wear-canada`} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
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

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@LuxeMia" />
      {product && <meta name="twitter:label1" content="Price" />}
      {product && <meta name="twitter:data1" content={`${product.currency} ${product.price}`} />}

      {/* Structured Data — only page-specific schemas; Organization + WebSite are in index.html */}
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
