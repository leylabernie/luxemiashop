import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { useScrapedProductByHandle } from '@/hooks/useScrapedProducts';
import { useShopifyProduct } from '@/hooks/useShopifyProduct';
import { getLocalProductByHandle } from '@/data/localProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { trackViewItem } from '@/hooks/useAnalytics';

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { product: scrapedProduct, isLoading: scrapedLoading } = useScrapedProductByHandle(handle);
  const { product: shopifyProduct, isLoading: shopifyLoading } = useShopifyProduct(handle);
  const addToRecentlyViewed = useRecentlyViewedStore((state) => state.addProduct);

  // Fallback chain: scraped products -> Shopify API -> local products
  const localProduct = handle ? getLocalProductByHandle(handle)?.node : null;
  const product = scrapedProduct || shopifyProduct || localProduct;
  const isLoading = scrapedLoading || (shopifyLoading && !scrapedProduct);
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
                <ProductInfo product={product} />
              </div>

              {/* Product Tabs */}
              <div className="mb-16">
                <ProductTabs 
                  description={product.description}
                  productType={product.productType}
                />
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
