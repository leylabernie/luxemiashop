import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getAllLocalProducts } from '@/data/localProducts';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { getOptimizedImage } from '@/lib/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import { convertToShopifyFormat, type ScrapedProduct } from '@/hooks/useScrapedProducts';
import type { ShopifyProduct } from '@/lib/shopify';

interface CompleteTheLookProps {
  currentProductId: string;
  productType?: string;
}

// Determine the complementary category for cross-selling
const getComplementaryCategory = (productType: string): string | null => {
  const type = productType.toLowerCase();
  if (type.includes('lehenga') || type.includes('saree')) return 'menswear';
  if (type.includes('sherwani') || type.includes('kurta') || type.includes('menswear')) return 'lehengas';
  if (type.includes('suit')) return 'sarees';
  return null;
};

export const CompleteTheLook = ({ currentProductId, productType }: CompleteTheLookProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const [scrapedRecs, setScrapedRecs] = useState<ShopifyProduct[]>([]);

  // Fetch recommendations from Supabase
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const complementary = productType ? getComplementaryCategory(productType) : null;

        // Fetch products from a different category for variety
        let query = supabase
          .from('scraped_products')
          .select('*')
          .eq('is_active', true)
          .limit(12);

        if (complementary) {
          query = query.eq('category', complementary);
        }

        const { data } = await query;

        if (data && data.length > 0) {
          const formatted = (data as ScrapedProduct[])
            .filter(p => (p.shopify_product_id || p.id) !== currentProductId)
            .map(convertToShopifyFormat);
          setScrapedRecs(formatted);
        }
      } catch {
        // Silently fall back to local products
      }
    };

    fetchRecs();
  }, [currentProductId, productType]);

  // Use scraped products if available, otherwise fall back to local products
  const recommendations = useMemo(() => {
    let pool: ShopifyProduct[] = scrapedRecs;

    if (pool.length === 0) {
      // Fallback to local products
      const allProducts = getAllLocalProducts();
      const currentCategory = productType?.toLowerCase() || '';

      pool = allProducts.filter(p => {
        if (p.node.id === currentProductId) return false;
        const prodType = p.node.productType?.toLowerCase() || '';

        if (currentCategory.includes('lehenga') || currentCategory.includes('saree')) {
          return prodType.includes('sherwani') || prodType.includes('kurta') || prodType.includes('suit');
        }
        if (currentCategory.includes('sherwani') || currentCategory.includes('kurta')) {
          return prodType.includes('lehenga') || prodType.includes('saree');
        }
        return prodType !== currentCategory;
      });
    }

    // Shuffle and take first 4
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [currentProductId, productType, scrapedRecs]);

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) return;

    addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    });

    toast.success('Added to bag', {
      description: `${product.node.title} has been added.`,
    });
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(amount));
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif mb-2">Complete the Look</h2>
          <p className="text-muted-foreground">Curated pieces to complement your selection</p>
        </div>
        <Button variant="ghost" asChild className="hidden md:flex items-center gap-2 luxury-link">
          <Link to="/collections">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {recommendations.map((product, index) => (
          <motion.div
            key={product.node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/product/${product.node.handle}`}>
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card">
                {product.node.images.edges[0] ? (
                  <img
                    src={getOptimizedImage(product.node.images.edges[0].node.url, 'card')}
                    alt={product.node.images.edges[0].node.altText || product.node.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                
                {/* Quick Add Button */}
                <button
                  onClick={(e) => handleQuickAdd(product, e)}
                  className="absolute bottom-4 right-4 p-3 bg-background/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </Link>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {product.node.productType || 'Collection'}
              </p>
              <h3 className="font-medium text-sm line-clamp-1">{product.node.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formatPrice(
                  product.node.priceRange.minVariantPrice.amount,
                  product.node.priceRange.minVariantPrice.currencyCode
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
