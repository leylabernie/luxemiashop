import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { fetchProducts, type ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface CompleteTheLookProps {
  currentProductId: string;
  productType?: string;
}

export const CompleteTheLook = ({ currentProductId, productType }: CompleteTheLookProps) => {
  const [recommendations, setRecommendations] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        // Fetch products to use as recommendations (excluding current product)
        const products = await fetchProducts(8);
        const filtered = products.filter((p) => p.node.id !== currentProductId);
        setRecommendations(filtered.slice(0, 4));
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [currentProductId]);

  const handleQuickAdd = (product: ShopifyProduct) => {
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  // Placeholder items when no products are available
  const placeholderItems = [
    { category: 'Jewelry', label: 'Matching Earrings' },
    { category: 'Accessories', label: 'Embroidered Clutch' },
    { category: 'Footwear', label: 'Traditional Juttis' },
    { category: 'Jewelry', label: 'Statement Necklace' },
  ];

  return (
    <section className="py-16 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif mb-2">Complete the Look</h2>
          <p className="text-muted-foreground">Curated pieces to complement your selection</p>
        </div>
        <Button variant="ghost" className="hidden md:flex items-center gap-2 luxury-link">
          View All
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {recommendations.length > 0 ? (
          recommendations.map((product, index) => (
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
                      src={product.node.images.edges[0].node.url}
                      alt={product.node.images.edges[0].node.altText || product.node.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <ProductPlaceholder aspectRatio="portrait" />
                  )}
                  
                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleQuickAdd(product);
                    }}
                    className="absolute bottom-4 right-4 p-3 bg-background/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </Link>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {product.node.productType || 'Accessory'}
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
          ))
        ) : (
          // Placeholder items when no products
          placeholderItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-sm bg-card">
                <ProductPlaceholder aspectRatio="portrait" label={item.label} />
                
                <button className="absolute bottom-4 right-4 p-3 bg-background/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.category}
                </p>
                <h3 className="font-medium text-sm">{item.label}</h3>
                <p className="text-sm text-muted-foreground">From ₹2,500</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};
