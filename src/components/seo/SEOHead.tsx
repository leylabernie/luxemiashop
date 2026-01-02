import { Helmet } from 'react-helmet-async';

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
  };
  breadcrumbs?: Array<{ name: string; url: string }>;
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
  noIndex = false,
}: SEOHeadProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luxemia.com';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : siteUrl;
  const canonicalUrl = canonical || currentUrl;

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

  // Product Schema
  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image,
        description: product.description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: 'LuxeMia',
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: `https://schema.org/${product.availability || 'InStock'}`,
          seller: {
            '@type': 'Organization',
            name: 'LuxeMia',
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
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="LuxeMia" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@LuxeMia" />

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
    </Helmet>
  );
};

export default SEOHead;
