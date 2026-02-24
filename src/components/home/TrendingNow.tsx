import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { ShopifyProduct } from '@/lib/shopify';

const TrendingNow = () => {
  const { products, isLoading } = useShopifyProducts('lehengas');
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  
  // Get 4 featured lehengas as trending
  const trendingProducts = products.slice(0, 4);

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const handleQuickAdd = (e: React.MouseEvent, product: ShopifyProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.node.variants.edges[0]?.node;
    addItem({
      product: product,
      variantId: variant?.id || product.node.id,
      variantTitle: variant?.title || 'Default',
      price: product.node.priceRange.minVariantPrice,
      quantity: 1,
      selectedOptions: variant?.selectedOptions || [],
    });
    toast.success('Added to bag!', { position: 'top-center' });
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: ShopifyProduct) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.node.id)) {
      removeFromWishlist(product.node.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10 lg:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs tracking-luxury uppercase text-muted-foreground">Trending Now</span>
              </div>
              <h2 className="font-serif text-3xl lg:text-4xl">Bestsellers This Season</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary/30 mb-4" />
                <div className="h-4 bg-secondary/30 rounded w-2/3 mb-2" />
                <div className="h-3 bg-secondary/30 rounded w-1/3 mb-2" />
                <div className="h-4 bg-secondary/30 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10 lg:mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-3"
            >
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs tracking-luxury uppercase text-muted-foreground">
                Trending Now
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="font-serif text-3xl lg:text-4xl"
            >
              Bestsellers This Season
            </motion.h2>
          </div>
          <Link to="/lehengas" className="hidden md:block">
            <Button variant="outline" className="group">
              View All
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {trendingProducts.map((product, index) => (
            <motion.div
              key={product.node.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/product/${product.node.handle}`}
                className="group block"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30 mb-4">
                  <img
                    src={product.node.images.edges[0]?.node.url}
                    alt={product.node.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  
                  {/* Trending Badge */}
                  <div className="absolute top-3 left-3 bg-foreground text-background px-2.5 py-1 text-xs tracking-editorial uppercase">
                    Bestseller
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Button
                      size="sm"
                      className="w-full bg-background/95 hover:bg-background text-foreground backdrop-blur-sm"
                      onClick={(e) => handleQuickAdd(e, product)}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Quick Add
                    </Button>
                  </div>
                  
                  {/* Wishlist */}
                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isInWishlist(product.node.id)
                          ? 'fill-primary text-primary'
                          : 'text-foreground'
                      }`}
                    />
                  </button>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-sm lg:text-base font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {product.node.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    {product.node.productType}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatPrice(product.node.priceRange.minVariantPrice.amount)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link to="/lehengas">
            <Button variant="outline" className="w-full">
              View All Trending
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingNow;
