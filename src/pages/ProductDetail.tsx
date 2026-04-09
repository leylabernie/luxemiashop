import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductTabs } from '@/components/product/ProductTabs';
import { CompleteTheLook } from '@/components/product/CompleteTheLook';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import ReviewsSection from '@/components/product/ReviewsSection';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import { getLocalProductByHandle } from '@/data/localProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { trackViewItem } from '@/hooks/useAnalytics';

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { product: shopifyProduct, isLoading: shopifyLoading } = useShopifyProduct(handle);
  const addToRecentlyViewed = useRecentlyViewedStore((state) => state.addProduct);

  // Fallback chain: Shopify API -> local products
  const localProduct = handle ? getLocalProductByHandle(handle)?.node : null;
  const product = shopifyProduct || localProduct;
  const isLoading = shopifyLoading;
  const error = !product && !isLoading ? 'Product not found' : null;

  // Track recently viewed and analytics
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.priceRange.minVariantPrice.amount,
        currency: product.priceRange.minVariantPrice.currencyCode,
        imageUrl: product.images.edges[0]?.node.url || '',
      });
      
      // Track view_item event in GA4
      trackViewItem({
        id: product.id,
        name: product.title,
        price: parseFloat(product.priceRange.minVariantPrice.amount),
        currency: product.priceRange.minVariantPrice.currencyCode,
        category: product.productType,
      });
    }
  }, [product, addToRecentlyViewed]);

  // Get category URL from product type
  const getCategoryUrl = (productType?: string) => {
    if (!productType) return '/collections';
    const type = productType.toLowerCase();
    if (type.includes('lehenga')) return '/lehengas';
    if (type.includes('saree')) return '/sarees';
    if (type.includes('suit') || type.includes('salwar') || type.includes('anarkali')) return '/suits';
    if (type.includes('sherwani') || type.includes('kurta') || type.includes('menswear')) return '/menswear';
    return '/collections';
  };

  const categoryUrl = getCategoryUrl(product?.productType);
  const categoryName = product?.productType || 'Collections';

  // Product-specific FAQs for rich snippets
  const productFaqs = product ? [
    {
      question: `What sizes are available for the ${product.title}?`,
      answer: `The ${product.title} is available in sizes S, M, L, XL, XXL, and Custom sizing. We offer complimentary custom tailoring to ensure a perfect fit. Please refer to our Size Guide for detailed measurements.`
    },
    {
      question: `What is the delivery time for the ${product.title}?`,
      answer: `Standard shipping to the US takes 7-12 business days. Express shipping (3-5 business days) is available at checkout. Custom-sized orders require an additional 3-4 weeks for production.`
    },
    {
      question: `Can I return the ${product.title} if it doesn't fit?`,
      answer: `Standard-sized items can be returned within 7 days if unworn with tags attached. Custom-sized items are final sale. A mandatory unboxing video is required for all return claims.`
    },
    {
      question: `How should I care for my ${categoryName.toLowerCase()}?`,
      answer: `We recommend professional dry cleaning for all ethnic wear. Store in a cool, dry place wrapped in muslin cloth. Never iron directly on embroidery or embellishments.`
    }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {product && (
        <SEOHead
          title={`${product.title} | ${categoryName} | LuxeMia`}
          description={product.description?.slice(0, 155) + '...' || `Shop ${product.title} at LuxeMia. Premium quality Indian ethnic wear with worldwide shipping.`}
          type="product"
          image={product.images.edges[0]?.node.url}
          product={{
            name: product.title,
            price: product.priceRange.minVariantPrice.amount,
            currency: product.priceRange.minVariantPrice.currencyCode,
            image: product.images.edges[0]?.node.url || '',
            description: product.description || '',
            availability: 'InStock',
            sku: product.id,
            originalPrice: (product as any).compareAtPriceRange?.maxVariantPrice?.amount,
            category: product.productType || 'Ethnic Wear',
            brand: (product as any).vendor || 'LuxeMia',
            color: (product as any).options?.find((o: any) => o.name?.toLowerCase() === 'color')?.values?.[0],
            material: product.options?.find((o: any) => o.name?.toLowerCase() === 'fabric' || o.name?.toLowerCase() === 'material')?.values?.[0],
          }}
          breadcrumbs={[
            { name: 'Home', url: '/' },
            { name: categoryName, url: categoryUrl },
            { name: product.title, url: `/product/${product.handle}` },
          ]}
          faqs={productFaqs}
        />
      )}
      {product && (
        <Helmet>
          <title>{`${product.title} — LuxeMia`}</title>
          <meta name="description" content={product.description ? product.description.replace(/<[^>]+>/g, '').slice(0, 155) : `Shop ${product.title} at LuxeMia. Luxury Indian ethnic wear.`} />
          <link rel="canonical" href={`https://luxemia.shop/products/${product.handle}`} />
        </Helmet>
      )}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.title,
              "description": product.description
                ? product.description.replace(/<[^>]+>/g, '')
                : '',
              "image": product.images?.edges?.map((edge: any) => edge.node.url) || [],
              "sku": product.id,
              "brand": {
                "@type": "Brand",
                "name": "LuxeMia"
              },
              "offers": {
                "@type": "Offer",
                "url": `https://luxemia.shop/products/${product.handle}`,
                "priceCurrency": product.priceRange?.minVariantPrice?.currencyCode || "USD",
                "price": product.priceRange?.minVariantPrice?.amount || "0",
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "LuxeMia"
                }
              }
            })
          }}
        />
      )}
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={categoryUrl} className="hover:text-foreground transition-colors">{categoryName}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product?.title || 'Product'}</span>
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
            >
              {/* Product Grid */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
                {/* Gallery */}
                <ProductGallery 
                  images={product.images.edges} 
                  productTitle={product.title} 
                />
                
                {/* Product Info */}
                <ProductInfo key={product.id} product={product} />
              </div>

              {/* Product Tabs */}
              <div className="mb-16">
                <ProductTabs 
                  description={product.description}
                  productType={product.productType}
                />
              </div>

              {/* Customer Reviews */}
              <ReviewsSection />

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

              {/* Complete the Look */}
              <CompleteTheLook 
                currentProductId={product.id}
                productType={product.productType}
              />

              {/* Recently Viewed */}
              <RecentlyViewed currentProductId={product.id} />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
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
