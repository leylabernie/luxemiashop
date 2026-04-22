/**
 * ============================================================
 * FIX: SEO Component (React Helmet)
 * ============================================================
 *
 * This file replaces your existing SEO/React Helmet component.
 *
 * KEY CHANGES:
 * 1. Removed duplicate Organization + WebSite schema
 *    (now only in static index.html)
 * 2. Unified social media handles to @luxemiashop
 * 3. Added page-specific FAQPage only where relevant (homepage)
 * 4. Added BreadcrumbList schema for all inner pages
 * 5. Added ClothingStore schema only on homepage
 * 6. Added Article schema only on blog posts
 * 7. Added Product schema only on product pages
 *
 * Place this file at: src/components/SEO.tsx
 * ============================================================
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// ============================================================
// FIX: Unified social media handles
// BEFORE: Static HTML used @luxemiashop, React Helmet used @luxemia
// NOW: Single consistent set across ALL pages
// ============================================================
const SITE_CONFIG = {
  name: 'LuxeMia',
  url: 'https://luxemia.shop',
  description: 'Shop luxury Indian ethnic wear at LuxeMia. Handcrafted bridal lehengas, designer sarees, and anarkali suits with free worldwide shipping to USA, UK & Canada. Authentic craftsmanship for the modern NRI.',
  twitterHandle: '@LuxeMiaShop',
  socialLinks: {
    instagram: 'https://www.instagram.com/luxemiashop',
    facebook: 'https://www.facebook.com/luxemiashop',
    pinterest: 'https://www.pinterest.com/luxemiashop',
    youtube: 'https://www.youtube.com/@luxemiashop'
  }
};

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  articleData?: {
    publishedTime: string;
    modifiedTime: string;
    author: string;
    section: string;
    tags: string[];
  };
  productData?: {
    name: string;
    description: string;
    image: string;
    price: string;
    currency: string;
    availability: string;
    sku: string;
  };
  faqData?: Array<{
    question: string;
    answer: string;
  }>;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  noindex?: boolean;
}

export default function SEO({
  title = 'LuxeMia: Luxury Indian Ethnic Wear Online | Shop Bridal Lehengas & Wedding Sarees',
  description = SITE_CONFIG.description,
  canonical,
  ogImage = 'https://luxemia.shop/og-image.jpg',
  ogType = 'website',
  keywords = 'indian ethnic wear, sarees online, designer lehengas, bridal lehenga, wedding sarees, anarkali suits, banarasi silk, luxury ethnic wear, indian wedding dress, buy sarees online, designer salwar kameez',
  articleData,
  productData,
  faqData,
  breadcrumbs,
  noindex = false
}: SEOProps) {
  const location = useLocation();
  const pageUrl = canonical || `${SITE_CONFIG.url}${location.pathname}`;
  const fullTitle = title.includes('LuxeMia') ? title : `${title} | LuxeMia`;

  // Build page-specific structured data (NO Organization/WebSite - those are in index.html)
  const structuredData: object[] = [];

  // Add BreadcrumbList for all inner pages
  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    });
  }

  // Add Article schema for blog posts
  if (articleData) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title.replace(' | LuxeMia Blog', '').replace(' | LuxeMia', ''),
      description: description,
      image: ogImage,
      datePublished: articleData.publishedTime,
      dateModified: articleData.modifiedTime,
      author: {
        '@type': 'Person',
        name: articleData.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'LuxeMia',
        logo: {
          '@type': 'ImageObject',
          url: 'https://luxemia.shop/logo.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl
      },
      keywords: articleData.tags.join(', ')
    });
  }

  // Add Product schema for product pages
  if (productData) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.name,
      description: productData.description,
      image: productData.image,
      sku: productData.sku,
      brand: {
        '@type': 'Brand',
        name: 'LuxeMia'
      },
      offers: {
        '@type': 'Offer',
        url: pageUrl,
        priceCurrency: productData.currency,
        price: productData.price,
        availability: `https://schema.org/${productData.availability}`,
        seller: {
          '@type': 'Organization',
          name: 'LuxeMia'
        }
      }
    });
  }

  // Add FAQPage schema only where relevant
  if (faqData && faqData.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqData.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }

  // Add ClothingStore schema only on homepage
  if (location.pathname === '/') {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: 'LuxeMia',
      description: 'Premium Indian ethnic wear boutique specializing in handcrafted bridal lehengas, designer sarees, anarkali suits, and wedding collections. Worldwide shipping available.',
      url: 'https://luxemia.shop',
      logo: 'https://luxemia.shop/logo.png',
      image: ogImage,
      telephone: '+1-215-341-9990',
      email: 'hello@luxemia.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1234 Fashion Avenue',
        addressLocality: 'Philadelphia',
        addressRegion: 'PA',
        postalCode: '19103',
        addressCountry: 'US'
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '19:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '11:00',
          closes: '17:00'
        }
      ],
      priceRange: '$$$',
      currenciesAccepted: 'USD',
      paymentAccepted: 'Credit Card, Debit Card, PayPal',
      sameAs: Object.values(SITE_CONFIG.socialLinks),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'LuxeMia Collections',
        itemListElement: [
          { '@type': 'OfferCatalog', name: 'Bridal Lehengas' },
          { '@type': 'OfferCatalog', name: 'Silk Sarees' },
          { '@type': 'OfferCatalog', name: 'Anarkali Suits' },
          { '@type': 'OfferCatalog', name: 'Menswear' },
          { '@type': 'OfferCatalog', name: 'Indo-Western' }
        ]
      }
    });
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="LuxeMia" />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'} />
      <meta name="bingbot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="LuxeMia" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific OG tags */}
      {articleData && (
        <>
          <meta property="article:published_time" content={articleData.publishedTime} />
          <meta property="article:modified_time" content={articleData.modifiedTime} />
          <meta property="article:author" content={articleData.author} />
          <meta property="article:section" content={articleData.section} />
          {articleData.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />

      {/* Structured Data - one script per schema type */}
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
