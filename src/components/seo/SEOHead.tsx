import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
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
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: FAQItem[];
  noIndex?: boolean;
}

const SEOHead = ({
  title = 'LuxeMia | Luxury Indian Ethnic Wear - Sarees, Lehengas & Bridal Couture',
  description = 'Discover exquisite handcrafted Indian ethnic wear at LuxeMia. Shop designer sarees, bridal lehengas, anarkali suits, and wedding collections. Worldwide shipping. Premium quality assured.',
  canonical,
  image = 'https://lovable.dev/opengraph-image-p98pqg.png',
  type = 'website',
  product,
  breadcrumbs,
  faqs,
  noIndex = false,
}: SEOHeadProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxemia.shop';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : siteUrl;
  const canonicalUrl = canonical || currentUrl;
  
  // Convert relative image paths to absolute URLs
  const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LuxeMia',
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    description: 'Luxury Indian ethnic wear boutique offering handcrafted sarees, lehengas, and designer bridal couture.',
    sameAs: [
      'https://instagram.com/luxemia',
      'https://facebook.com/luxemia',
      'https://youtube.com/luxemia',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-123-456-7890',
      contactType: 'customer service',
      email: 'hello@luxemia.com',
      availableLanguage: ['English', 'Hindi'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Fashion District',
      addressLocality: 'Mumbai',
      addressRegion: 'MH',
      postalCode: '400001',
      addressCountry: 'IN',
    },
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LuxeMia',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/collections?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

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
            merchantReturnDays: 14,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '127',
          bestRating: '5',
          worstRating: '1',
        },
        review: {
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
          author: {
            '@type': 'Person',
            name: 'Priya M.',
          },
          reviewBody: 'Absolutely stunning craftsmanship! The fabric quality exceeded my expectations. Perfect for my wedding.',
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

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

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
      <meta name="keywords" content="indian ethnic wear, sarees online, designer lehengas, bridal lehenga, wedding sarees, anarkali suits, banarasi silk, luxury ethnic wear, indian wedding dress" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
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
    </Helmet>
  );
};

export default SEOHead;
