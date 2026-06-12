import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductTabs } from '@/components/product/ProductTabs';
import { CompleteTheLook } from '@/components/product/CompleteTheLook';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import ReviewsSection from '@/components/product/ReviewsSection';
import { ProductFAQBlock } from '@/components/product/ProductFAQBlock';
import { ContextualRecommendations } from '@/components/product/ContextualRecommendations';
import { SemanticProductMetadata } from '@/components/seo/SemanticProductMetadata';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import type { LocalProduct } from '@/data/localProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { generateProductContent } from '@/lib/productDescriptionEnrichment';
import { getCorrectedTitle, autoCorrectTitle } from '@/lib/titleCorrections';
import { Button } from '@/components/ui/button';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { trackViewItem } from '@/hooks/useAnalytics';
import StickyAddToBag from '@/components/product/StickyAddToBag';

// Determine if a product type supports stitching options
const STITCHABLE_PRODUCT_TYPES = [
  'salwar kameez', 'salwar kameez suit', 'lehenga', 'lehenga choli', 'saree', 'sarees',
  'anarkali', 'sharara suit', 'pakistani suit', 'palazzo suit', 'gharara suit',
  'wedding suit',
];

const isStitchableProductType = (productType?: string): boolean => {
  if (!productType) return false;
  const lower = productType.toLowerCase();
  return STITCHABLE_PRODUCT_TYPES.some(t => lower.includes(t));
};

/**
 * Get Google Product Category using NUMERIC TAXONOMY IDs.
 * GMC accepts both numeric IDs and text paths, but numeric IDs are
 * unambiguous and avoid "Invalid product category" errors from
 * apostrophe mismatches or path typos.
 * See: https://support.google.com/merchants/answer/6324436
 *
 * Google Product Taxonomy IDs:
 *   1604 = Apparel & Accessories > Clothing
 *   2271 = Apparel & Accessories > Clothing > Dresses
 *   5424 = Apparel & Accessories > Clothing > Sarees & Blouses
 *   2104 = Apparel & Accessories > Clothing > Men's Clothing
 *   2195 = Apparel & Accessories > Clothing > Men's Clothing > Men's Suits
 *   2197 = Apparel & Accessories > Clothing > Men's Clothing > Men's Shirts & Tops
 *   188  = Apparel & Accessories > Jewelry
 *   193  = Apparel & Accessories > Jewelry > Necklaces
 *   194  = Apparel & Accessories > Jewelry > Earrings
 *   200  = Apparel & Accessories > Jewelry > Bracelets
 */
const getGoogleProductCategory = (productType?: string, title?: string): string => {
  const t = (title || '').toLowerCase();
  const pt = (productType || '').toLowerCase();

  // Men's categories
  if (pt.includes('men') || t.includes('sherwani') || t.includes('kurta pajama') || t.includes('groom wear')) {
    if (t.includes('sherwani')) return '2195'; // Men's Suits
    if (t.includes('kurta')) return '2197'; // Men's Shirts & Tops
    return '2104'; // Men's Clothing
  }
  // Lehengas and Dresses
  if (pt.includes('lehenga') || pt.includes('dress')) return '2271';
  // Sarees
  if (pt.includes('saree')) return '5424';
  // Jewelry subcategories
  if (pt.includes('necklace')) return '193';
  if (pt.includes('earring')) return '194';
  if (pt.includes('bangle') || pt.includes('bracelet')) return '200';
  if (pt.includes('jewel')) return '188';
  // Suits, Anarkalis, Sharara, Palazzo, Salwar
  if (pt.includes('suit') || pt.includes('anarkali') || pt.includes('sharara') || pt.includes('palazzo') || pt.includes('salwar')) return '2271';
  // Default: Clothing
  return '1604';
};

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { product: shopifyProduct, isLoading: shopifyLoading, error: shopifyError } = useShopifyProduct(handle);
  const addToRecentlyViewed = useRecentlyViewedStore((state) => state.addProduct);
  const [localProduct, setLocalProduct] = useState<{ node: LocalProduct } | null | undefined>(undefined);

  // Lazy-load local product data
  useEffect(() => {
    if (handle) {
      setLocalProduct(undefined);
      import('@/data/localProducts').then(m => {
        const found = m.getLocalProductByHandle(handle);
        setLocalProduct(found ?? null);
      });
    } else {
      setLocalProduct(null);
    }
  }, [handle]);
  const product = shopifyProduct || localProduct;
  const isLoading = shopifyLoading || localProduct === undefined;
  const error = !product && !isLoading ? (shopifyError || 'Product not found') : null;

  // ── VISUAL TITLE CORRECTION ──
  // Apply image-verified title corrections to ensure the visible product title
  // accurately reflects the DOMINANT garment color (lehenga/skirt), not the
  // dupatta/choli accent color. FASHION HIERARCHY: garment > blouse > dupatta
  const correctedProductTitle = useMemo(() => {
    if (!product) return '';
    return getCorrectedTitle(product.handle) || autoCorrectTitle(product.title, product.handle, product.productType) || product.title;
  }, [product]);

  // Track recently viewed and analytics
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        handle: product.handle,
        title: correctedProductTitle,
        price: product.priceRange.minVariantPrice.amount,
        currency: product.priceRange.minVariantPrice.currencyCode,
        imageUrl: product.images.edges[0]?.node.url || '',
      });
      
      // Track view_item event in GA4
      trackViewItem({
        id: product.id,
        name: correctedProductTitle,
        price: parseFloat(product.priceRange.minVariantPrice.amount),
        currency: product.priceRange.minVariantPrice.currencyCode,
        category: product.productType,
      });
    }
  }, [product, addToRecentlyViewed]);

  // Get a safe storefront category from product type/title signals.
  const getCategory = (productType?: string, title?: string) => {
    if (!productType && !title) return { name: 'Collections', url: '/collections' };
    const source = `${productType || ''} ${title || ''}`.toLowerCase();
    if (source.includes('saree') || source.includes('sari')) return { name: 'Sarees', url: '/sarees' };
    if (source.includes('lehenga') || source.includes('choli')) return { name: 'Lehengas', url: '/lehengas' };
    if (
      source.includes('salwar') ||
      source.includes('kameez') ||
      source.includes('suit') ||
      source.includes('anarkali') ||
      source.includes('sharara') ||
      source.includes('palazzo') ||
      source.includes('gharara')
    ) return { name: 'Suits', url: '/suits' };
    if (
      source.includes('sherwani') ||
      source.includes('kurta pajama') ||
      source.includes('menswear') ||
      source.includes("men's") ||
      /\bmen\b/.test(source)
    ) return { name: 'Menswear', url: '/menswear' };
    if (source.includes('indo') || source.includes('fusion')) return { name: 'Indo-Western', url: '/indowestern' };
    return { name: 'Collections', url: '/collections' };
  };

  const productCategory = getCategory(product?.productType, correctedProductTitle || product?.title);
  const categoryUrl = productCategory.url;
  const categoryName = productCategory.name;

  // Enrich thin product descriptions with SEO-rich content
  const productColor = (product as any)?.options?.find((o: any) => o.name?.toLowerCase() === 'color')?.values?.[0];
  const productMaterial = product?.options?.find((o: any) => o.name?.toLowerCase() === 'fabric' || o.name?.toLowerCase() === 'material')?.values?.[0];

  // Infer pattern/embroidery style and audience from product title and type for richer schema
  const productPattern = useMemo(() => {
    if (!product) return undefined;
    const title = product.title.toLowerCase();
    if (title.includes('zardozi') || title.includes('zari')) return 'Zari/Zardozi Embroidered';
    if (title.includes('sequin')) return 'Sequined';
    if (title.includes('mirror') || title.includes('shisha')) return 'Mirror Work';
    if (title.includes('gota') || title.includes('gota patti')) return 'Gota Patti';
    if (title.includes('chikankari')) return 'Chikankari';
    if (title.includes('banarasi') || title.includes('kanjivaram') || title.includes('kanchipuram')) return 'Woven/Brocade';
    if (title.includes('embroid')) return 'Embroidered';
    if (title.includes('printed')) return 'Printed';
    if (title.includes('stone') || title.includes('crystal')) return 'Stone Work';
    if (title.includes('bead') || title.includes('pearl')) return 'Beaded';
    if (title.includes('patch')) return 'Patch Work';
    return undefined;
  }, [product]);

  const productAudience = useMemo(() => {
    if (!product) return undefined;
    const type = (product.productType || '').toLowerCase();
    if (type.includes('sherwani') || type.includes('kurta') || type.includes('men')) return 'Male';
    if (type.includes('jewel')) return undefined;
    return 'Female';
  }, [product]);

  // ── Generate structured content for ProductTabs & SEO ──
  const content = useMemo(() => {
    if (!product) {
      return {
        shortIntro: '',
        keyDetails: [] as Array<{ label: string; value: string }>,
        designDetails: [] as string[],
        stylingNote: '',
        customization: [] as string[],
        care: [] as string[],
        seoMetaDescription: '',
        aiSearchDescription: '',
      };
    }
    return generateProductContent({
      title: correctedProductTitle || product.title,
      productType: product.productType || '',
      tags: product.tags || [],
      description: product.description || '',
    });
  }, [product, correctedProductTitle]);

  // Product-specific FAQs for rich snippets
  const productFaqs = product ? [
    {
      question: `What sizes are available for the ${correctedProductTitle}?`,
      answer: `The ${correctedProductTitle} is available in sizes S, M, L, XL, XXL, and Custom sizing. We offer complimentary custom tailoring to ensure a perfect fit. Please refer to our Size Guide for detailed measurements.`
    },
    {
      question: `What is the delivery time for the ${correctedProductTitle}?`,
      answer: `Readymade items are dispatched within 3-5 business days. Custom/alteration orders are dispatched within 5-7 business days. Delivery takes 3-5 business days via DHL Express, or 7-10 business days via USPS/UPS standard shipping.`
    },
    {
      question: `Can I return the ${correctedProductTitle} if it doesn't fit?`,
      answer: `All sales are final. LuxeMia does not accept returns or exchanges for any reason, including sizing issues. We recommend using our Size Guide and contacting us before ordering if you have any fit questions. The only exception is genuine shipping damage, which requires a mandatory unboxing video.`
    },
    {
      question: `How should I care for my ${categoryName.toLowerCase()}?`,
      answer: `We recommend professional dry cleaning for all ethnic wear. Store in a cool, dry place wrapped in muslin cloth. Never iron directly on embroidery or embellishments.`
    }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {product ? (
        <SEOHead
          title={`${correctedProductTitle.replace(/\s*[-–—]\s*LuxeMia\s*$/i, '')} | ${categoryName} | LuxeMia`}
          description={content.seoMetaDescription || (() => {
            const d = (product.description || '').trim();
            if (d.length >= 70) {
              return d.length > 155 ? `${d.slice(0, 152).trimEnd()}…` : d;
            }
            const productTypeLower = (product.productType || 'Indian ethnic wear').toLowerCase();
            return `Shop the ${product.title} at LuxeMia — handcrafted ${productTypeLower}. Shipping ($25 flat, free over $350) to USA, Canada and Australia.`;
          })()}
          type="product"
          image={product.images.edges[0]?.node.url}
          product={{
            name: correctedProductTitle.replace(/\s*[-–—]\s*LuxeMia\s*$/i, ''),
            price: product.priceRange.minVariantPrice.amount,
            currency: product.priceRange.minVariantPrice.currencyCode,
            image: product.images.edges[0]?.node.url || '',
            description: content.aiSearchDescription || content.shortIntro || product.description || '',
            availability: 'InStock',
            sku: product.id,
            originalPrice: (product as any).compareAtPriceRange?.maxVariantPrice?.amount,
            category: product.productType || 'Ethnic Wear',
            brand: (() => {
              const v = ((product as any).vendor || '').trim();
              return !v || v.toLowerCase() === 'luxemia' ? 'LuxeMia' : v;
            })(),
            color: productColor,
            material: productMaterial,
            pattern: productPattern,
            audience: productAudience,
            sizes: product.options?.find((o: any) => o.name?.toLowerCase() === 'size' || o.name?.toLowerCase() === 'bust size')?.values || [],
            googleProductCategory: getGoogleProductCategory(product.productType, product.title),
          }}
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: categoryName, url: categoryUrl },
            { name: correctedProductTitle || product.title, url: `/product/${product.handle}` },
          ]}
          faqs={productFaqs}
        />
      ) : (
        <SEOHead
          title="Product Not Found | LuxeMia"
          description="This product could not be found."
          noIndex={true}
        />
      )}

      <Header />
      
      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={categoryUrl} className="hover:text-foreground transition-colors">{categoryName}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{correctedProductTitle || product?.title || 'Product'}</span>
          </nav>

          {isLoading ? (
            <ProductSkeleton />
          ) : error || !product ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This product may have been removed or the link is incorrect.
              </p>
              <Button asChild>
                <Link to="/lehengas">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse Lehengas
                </Link>
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              data-ai-optimized="true"
            >
              {/* AI-Search Semantic Metadata (invisible to users, consumed by LLMs) */}
              <SemanticProductMetadata
                productName={correctedProductTitle || product.title}
                fabric={productMaterial}
                color={productColor}
                embroidery={productPattern}
                occasion={product?.tags?.filter((t: string) => /wedding|bridal|festive|party|mehndi|sangeet|reception|diwali|eid|haldi/i.test(t))}
                silhouette={product?.productType}
                regionOfOrigin="India"
              />
              <Helmet>
                <meta name="ai-optimized" content="true" />
                <meta name="ai-content-type" content="product-detail" />
                <meta name="ai-product-category" content={product.productType || 'Indian Ethnic Wear'} />
                <meta name="ai-product-color" content={productColor || ''} />
                <meta name="ai-product-material" content={productMaterial || ''} />
                <meta name="ai-product-pattern" content={productPattern || ''} />
                <meta name="ai-product-audience" content={productAudience || 'Female'} />
                <meta name="ai-search-ready" content="true" />
                {content.aiSearchDescription && (
                  <meta name="ai-search-description" content={content.aiSearchDescription} />
                )}
              </Helmet>
              {/* Product Grid */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
                {/* Gallery */}
                <ProductGallery 
                  images={product.images.edges} 
                  productTitle={correctedProductTitle} 
                />
                
                {/* Product Info */}
                <ProductInfo key={product.id} product={product} correctedTitle={correctedProductTitle} />
              </div>

              {/* Product Tabs */}
              <div className="mb-16">
                <ProductTabs
                  shortIntro={content.shortIntro}
                  keyDetails={content.keyDetails}
                  designDetails={content.designDetails}
                  stylingNote={content.stylingNote}
                  customization={content.customization}
                  care={content.care}
                  productType={product.productType}
                  isStitchable={isStitchableProductType(product.productType)}
                />
              </div>

              {/* Customer Reviews */}
              <ReviewsSection
                productName={correctedProductTitle}
                productUrl={`https://luxemia.shop/product/${product.handle}`}
              />

              {/* WhatsApp Stylist CTA */}
              <div className="mb-16 p-6 bg-secondary/30 border border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-3">Need help styling this piece?</p>
                <a
                  href="https://wa.me/12153419990?text=Hi%20LuxeMia%2C%20I%20need%20help%20styling%20a%20piece"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat with a Stylist
                </a>
              </div>

              {/* Contextual Recommendations — Complete the Look */}
              <ContextualRecommendations
                productType={product.productType}
                productColor={productColor}
                embroidery={productPattern}
              />

              {/* Complete the Look — Related Products */}
              <CompleteTheLook 
                currentProductId={product.id}
                productType={product.productType}
              />

              {/* Product FAQ Block — Category-specific FAQs with schema */}
              <ProductFAQBlock
                productName={correctedProductTitle || product.title}
                productType={product.productType}
                fabric={productMaterial}
              />

              {/* Recently Viewed */}
              <RecentlyViewed currentProductId={product.id} />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      {product && <StickyAddToBag product={product} />}
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] w-full rounded-sm" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-20 h-24 rounded-sm" />
        ))}
      </div>
    </div>
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-20 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-16" />
          ))}
        </div>
      </div>
      <Skeleton className="h-14 w-full" />
    </div>
  </div>
);

export default ProductDetail;
