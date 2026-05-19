/**
 * AISearchSchema.tsx — AI-Optimized Semantic Metadata Component
 *
 * Injects LLM-optimized structured data and meta tags for:
 * - AI search engines (Google SGE, Bing Copilot, Perplexity, etc.)
 * - Voice assistants (Alexa, Google Assistant, Siri)
 * - Visual search (Google Lens, Pinterest Lens)
 * - Shopping assistants (Google Shopping, Amazon Rufus, etc.)
 *
 * Usage: Place this component inside <Helmet> or alongside SEOHead
 * on product pages, collection pages, and the homepage.
 *
 * @example
 * ```tsx
 * <AISearchSchema
 *   type="product"
 *   title="Red Bridal Lehenga"
 *   description="Handcrafted red bridal lehenga with zardozi embroidery"
 *   productData={{ name, price, currency, category, highlights }}
 * />
 * ```
 */

import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  generateAIShoppingAssistantSchema,
  generateProductSpeakableSchema,
  generateSpeakableSchema,
  generateHowToSection,
  forceJpegForGmc,
  SITE_URL,
  BRAND_NAME,
} from '@/lib/schema';
import type { ProductVariant, RelatedProduct } from '@/lib/schema';

// ─── Types ────────────────────────────────────────────────────────────────

export interface AIProductData {
  name: string;
  description: string;
  shortDescription?: string;
  price: string;
  originalPrice?: string;
  currency: string;
  category: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  color?: string;
  material?: string;
  pattern?: string;
  size?: string[];
  image?: string;
  url?: string;
  sku?: string;
  brand?: string;
  highlights?: string[];
  variants?: ProductVariant[];
  relatedProducts?: RelatedProduct[];
  suggestedQuestions?: string[];
  occasions?: string[];
  careInstructions?: string[];
  /** Rating value (1-5) */
  ratingValue?: number;
  /** Number of reviews */
  reviewCount?: number;
}

export interface AICollectionData {
  name: string;
  description: string;
  url: string;
  itemCount: number;
  image?: string;
  filters?: string[];
  priceRange?: { min: string; max: string; currency: string };
}

export interface AIHomepageData {
  title: string;
  tagline: string;
  categories: string[];
  featuredCollections: Array<{ name: string; url: string; description: string }>;
}

export interface AISearchSchemaProps {
  /** The type of page being described */
  type: 'product' | 'collection' | 'homepage' | 'content';
  /** The page title (SEO-optimized) */
  title: string;
  /** The primary meta description */
  description: string;
  /** Canonical URL of the page */
  url?: string;
  /** Product-specific data (required when type='product') */
  productData?: AIProductData;
  /** Collection-specific data (required when type='collection') */
  collectionData?: AICollectionData;
  /** Homepage-specific data (required when type='homepage') */
  homepageData?: AIHomepageData;
  /** AI-optimized description for LLM consumption (defaults to description) */
  aiDescription?: string;
  /** Pinterest-optimized description (defaults to description) */
  pinterestDescription?: string;
  /** Google Lens optimized description (defaults to description) */
  googleLensDescription?: string;
  /** Additional keywords for AI context */
  semanticKeywords?: string[];
  /** CSS selectors for speakable/voice assistant content */
  speakableSelectors?: string[];
  /** Whether to enable voice search optimization */
  enableVoiceSearch?: boolean;
}

// ─── Helper: Generate AI-optimized description ────────────────────────────

function generateAIDescription(productData?: AIProductData): string {
  if (!productData) return '';

  const parts: string[] = [
    `${productData.name} — ${productData.description}`,
  ];

  if (productData.material) {
    parts.push(`Crafted from premium ${productData.material}.`);
  }

  if (productData.color) {
    parts.push(`Available in ${productData.color}.`);
  }

  if (productData.highlights && productData.highlights.length > 0) {
    parts.push(`Key features: ${productData.highlights.join('. ')}.`);
  }

  parts.push(
    `Priced at ${productData.currency} ${productData.price}. Ships to USA, Canada, and Australia. Free shipping on orders over $350.`
  );

  return parts.join(' ');
}

function generatePinterestDescription(productData?: AIProductData): string {
  if (!productData) return '';

  const parts: string[] = [
    `${productData.name} — Shop at LuxeMia. ${productData.description.slice(0, 120)}`,
  ];

  if (productData.occasions && productData.occasions.length > 0) {
    parts.push(`Perfect for ${productData.occasions.slice(0, 3).join(', ')}.`);
  }

  if (productData.material) {
    parts.push(`${productData.material} craftsmanship.`);
  }

  return parts.join(' ').slice(0, 500);
}

function generateGoogleLensDescription(productData?: AIProductData): string {
  if (!productData) return '';

  // Google Lens focuses on visual attributes for matching
  const visualAttributes: string[] = [];

  if (productData.color) visualAttributes.push(productData.color);
  if (productData.pattern) visualAttributes.push(productData.pattern);
  if (productData.material) visualAttributes.push(productData.material);
  if (productData.category) visualAttributes.push(productData.category);

  return `${productData.name}. ${visualAttributes.join(', ')}. ${productData.description.slice(0, 200)}`;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function AISearchSchema({
  type,
  title,
  description,
  url,
  productData,
  collectionData,
  homepageData,
  aiDescription,
  pinterestDescription,
  googleLensDescription,
  semanticKeywords,
  speakableSelectors,
  enableVoiceSearch = true,
}: AISearchSchemaProps) {
  // Compute AI-optimized descriptions
  const computedAiDescription = useMemo(
    () => aiDescription || generateAIDescription(productData) || description,
    [aiDescription, productData, description]
  );

  const computedPinterestDesc = useMemo(
    () => pinterestDescription || generatePinterestDescription(productData) || description,
    [pinterestDescription, productData, description]
  );

  const computedGoogleLensDesc = useMemo(
    () => googleLensDescription || generateGoogleLensDescription(productData) || description,
    [googleLensDescription, productData, description]
  );

  // Generate structured data for AI shopping assistants
  const aiShoppingSchema = useMemo(() => {
    if (type === 'product' && productData) {
      return generateAIShoppingAssistantSchema(
        productData.name,
        productData.description,
        productData.category,
        productData.price,
        productData.currency,
        productData.highlights || [],
        productData.suggestedQuestions
      );
    }
    return null;
  }, [type, productData]);

  // Generate speakable schema for voice assistants
  const speakableSchema = useMemo(() => {
    if (!enableVoiceSearch) return null;

    if (type === 'product' && productData) {
      return generateProductSpeakableSchema(
        productData.name,
        speakableSelectors
      );
    }

    return generateSpeakableSchema(
      speakableSelectors || [],
      type === 'homepage' ? 'homepage' : type === 'collection' ? 'collection' : 'content',
      title
    );
  }, [enableVoiceSearch, type, productData, title, speakableSelectors]);

  // Generate Pinterest rich pins data
  const pinterestSchema = useMemo(() => {
    if (type === 'product' && productData) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productData.name,
        description: computedPinterestDesc,
        image: productData.image ? forceJpegForGmc(productData.image) : undefined,
        offers: {
          '@type': 'Offer',
          price: productData.price,
          priceCurrency: productData.currency,
          availability:
            productData.availability === 'OutOfStock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
        },
        ...(productData.color && { color: productData.color }),
        ...(productData.material && { material: productData.material }),
        // Pinterest-specific: Rich product category
        pinterestCategory: mapToPinterestCategory(productData.category),
      };
    }

    if (type === 'collection' && collectionData) {
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collectionData.name,
        description: computedPinterestDesc,
        url: collectionData.url,
        image: collectionData.image ? forceJpegForGmc(collectionData.image) : undefined,
        ...(collectionData.priceRange && {
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: collectionData.priceRange.min,
            highPrice: collectionData.priceRange.max,
            priceCurrency: collectionData.priceRange.currency,
          },
        }),
      };
    }

    return null;
  }, [type, productData, collectionData, computedPinterestDesc]);

  // Generate Google Lens visual search data
  const googleLensSchema = useMemo(() => {
    if (type === 'product' && productData) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productData.name,
        description: computedGoogleLensDesc,
        image: productData.image ? forceJpegForGmc(productData.image) : undefined,
        url: productData.url || url,
        // Visual attributes for Google Lens matching
        color: productData.color,
        material: productData.material,
        pattern: productData.pattern,
        category: productData.category,
        // Google Lens-specific visual descriptors
        'visual-attribute': [
          productData.color,
          productData.pattern,
          productData.material,
          productData.category,
        ].filter(Boolean),
      };
    }
    return null;
  }, [type, productData, computedGoogleLensDesc, url]);

  // Generate semantic keywords meta
  const semanticKeywordsContent = useMemo(() => {
    const keywords = semanticKeywords || [];

    if (productData) {
      keywords.push(
        productData.category,
        productData.material,
        productData.color,
        productData.pattern,
        'Indian ethnic wear',
        'LuxeMia'
      );
    }

    return [...new Set(keywords.filter(Boolean))].join(', ');
  }, [semanticKeywords, productData]);

  // Generate HowTo section for "How to style" content on product pages
  const styleHowToSchema = useMemo(() => {
    if (type !== 'product' || !productData) return null;

    const productName = productData.name;
    const category = productData.category;

    const styleSteps = [
      {
        name: `Choose the Right Occasion for Your ${productName}`,
        text: `The ${productName} is designed for ${productData.occasions?.slice(0, 3).join(', ') || 'special occasions'}. Consider the dress code and formality level of your event when planning your look.`,
        url: `${productData.url || url}#style-step-1`,
      },
      {
        name: 'Select Complementary Accessories',
        text: `Accessorize your ${productName} with jewelry that complements the ${productData.pattern || 'design work'}. Choose pieces that enhance rather than overwhelm the outfit\'s details.`,
        url: `${productData.url || url}#style-step-2`,
      },
      {
        name: 'Complete the Look with Footwear',
        text: 'Pair with traditional footwear like embellished juttis or mojaris for an authentic finish. Ensure your shoes are comfortable for the event duration.',
        url: `${productData.url || url}#style-step-3`,
      },
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to Style Your ${productName}`,
      description: `A complete styling guide for your ${productName}. Learn how to accessorize and complete your look for any occasion.`,
      totalTime: 'PT10M',
      step: generateHowToSection('Styling Steps', styleSteps, 1),
    };
  }, [type, productData, url]);

  return (
    <Helmet>
      {/* ─── AI Search Optimized Meta Tags ────────────────────────── */}

      {/* AI-optimized description for LLM consumption */}
      <meta name="ai-search-description" content={computedAiDescription} />

      {/* Pinterest-optimized description for Rich Pins */}
      <meta name="pinterest-description" content={computedPinterestDesc} />

      {/* Google Lens optimized description for visual search */}
      <meta name="google-lens-description" content={computedGoogleLensDesc} />

      {/* Semantic keywords for AI search context */}
      {semanticKeywordsContent && (
        <meta name="semantic-keywords" content={semanticKeywordsContent} />
      )}

      {/* AI search engine directives */}
      <meta name="ai-search-index" content="allow" />
      <meta name="ai-search-context" content={type} />

      {/* ─── Pinterest-Specific Meta Tags ─────────────────────────── */}

      <meta name="pinterest-rich-pin" content="true" />
      <meta property="pinterest:description" content={computedPinterestDesc} />
      {productData?.image && (
        <meta
          property="pinterest:image"
          content={forceJpegForGmc(productData.image)}
        />
      )}
      {productData?.category && (
        <meta
          property="pinterest:category"
          content={mapToPinterestCategory(productData.category)}
        />
      )}

      {/* ─── Google Lens / Visual Search Meta Tags ───────────────── */}

      {productData?.color && (
        <meta name="visual-search:color" content={productData.color} />
      )}
      {productData?.material && (
        <meta name="visual-search:material" content={productData.material} />
      )}
      {productData?.pattern && (
        <meta name="visual-search:pattern" content={productData.pattern} />
      )}
      {productData?.category && (
        <meta name="visual-search:category" content={productData.category} />
      )}

      {/* ─── Voice Assistant Meta Tags ────────────────────────────── */}

      {enableVoiceSearch && (
        <>
          <meta name="voice-search:enabled" content="true" />
          <meta name="voice-search:speakable" content="true" />
          <meta name="voice-search:language" content="en-US" />
          {productData?.name && (
            <meta name="voice-search:product-name" content={productData.name} />
          )}
          {productData?.price && (
            <meta name="voice-search:price" content={`${productData.currency} ${productData.price}`} />
          )}
        </>
      )}

      {/* ─── Structured Data: AI Shopping Assistant ──────────────── */}

      {aiShoppingSchema && (
        <script type="application/ld+json" data-purpose="ai-shopping">
          {JSON.stringify(aiShoppingSchema)}
        </script>
      )}

      {/* ─── Structured Data: Pinterest Rich Pins ────────────────── */}

      {pinterestSchema && (
        <script type="application/ld+json" data-purpose="pinterest-rich-pin">
          {JSON.stringify(pinterestSchema)}
        </script>
      )}

      {/* ─── Structured Data: Google Lens ────────────────────────── */}

      {googleLensSchema && (
        <script type="application/ld+json" data-purpose="google-lens">
          {JSON.stringify(googleLensSchema)}
        </script>
      )}

      {/* ─── Structured Data: Speakable (Voice Search) ───────────── */}

      {speakableSchema && (
        <script type="application/ld+json" data-purpose="speakable">
          {JSON.stringify(speakableSchema)}
        </script>
      )}

      {/* ─── Structured Data: HowTo (Styling Guide) ──────────────── */}

      {styleHowToSchema && (
        <script type="application/ld+json" data-purpose="howto-styling">
          {JSON.stringify(styleHowToSchema)}
        </script>
      )}

      {/* ─── Semantic / AI Assistant Link Relations ──────────────── */}

      {/* AI assistant discovery link */}
      <link rel="assistant" href={url || SITE_URL} />

      {/* Product data link for AI consumption */}
      {productData?.url && (
        <link rel="product" href={productData.url} />
      )}

      {/* Collection data link for AI consumption */}
      {collectionData?.url && (
        <link rel="collection" href={collectionData.url} />
      )}
    </Helmet>
  );
}

// ─── Helper: Map internal category to Pinterest category ──────────────────

function mapToPinterestCategory(internalCategory: string): string {
  const cat = internalCategory.toLowerCase();

  if (cat.includes('bridal') || cat.includes('wedding')) return 'Weddings';
  if (cat.includes('lehenga')) return 'Women\'s Fashion';
  if (cat.includes('saree')) return 'Women\'s Fashion';
  if (cat.includes('suit') || cat.includes('salwar') || cat.includes('anarkali')) return 'Women\'s Fashion';
  if (cat.includes('jewel') || cat.includes('necklace') || cat.includes('earring')) return 'Jewelry';
  if (cat.includes('men') || cat.includes('sherwani') || cat.includes('kurta')) return 'Men\'s Fashion';
  if (cat.includes('home') || cat.includes('decor')) return 'Home Decor';

  return 'Women\'s Fashion';
}

// ─── Named Exports for Direct Schema Generation ───────────────────────────

/**
 * Standalone function to generate only the AI shopping assistant schema.
 * Use this when you don't need the full React component.
 */
export { generateAIShoppingAssistantSchema };

/**
 * Standalone function to generate speakable schema for voice search.
 * Use this when you don't need the full React component.
 */
export { generateProductSpeakableSchema, generateSpeakableSchema };
