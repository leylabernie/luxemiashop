import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductTabs } from '@/components/product/ProductTabs';
import { CompleteTheLook } from '@/components/product/CompleteTheLook';
import { fetchProductByHandle, type ShopifyProduct } from '@/lib/shopify';
import { getLocalProductByHandle } from '@/data/localProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Using local products for preview - switch to Shopify when ready to publish
const USE_LOCAL_PRODUCTS = true;

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (USE_LOCAL_PRODUCTS) {
          const localProduct = getLocalProductByHandle(handle);
          if (localProduct) {
            setProduct(localProduct.node);
          } else {
            // Fallback to Shopify if not found locally
            const productData = await fetchProductByHandle(handle);
            if (productData) {
              setProduct(productData);
            } else {
              setError('Product not found');
            }
          }
        } else {
          const productData = await fetchProductByHandle(handle);
          if (productData) {
            setProduct(productData);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        setError('Failed to load product');
        console.error('Error loading product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [handle]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
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