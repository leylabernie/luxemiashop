import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';
import type { ShopifyProduct } from '@/lib/shopify';

export const NewArrivals = () => {
  const { products, isLoading } = useShopifyProducts();
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  
  // Get latest 8 products sorted by creation date
  const newArrivals = useMemo(() => 
    [...products]
      .sort((a, b) => new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime())
      .slice(0, 8)
  , [products]);

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
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm tracking-luxury uppercase text-muted-foreground">Just Dropped</p>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary mb-3 rounded-sm" />
                <div className="h-3 bg-secondary rounded w-1/3 mb-2" />
                <div className="h-4 bg-secondary rounded w-2/3 mb-2" />
                <div className="h-4 bg-secondary rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm tracking-luxury uppercase text-muted-foreground">
              Just Dropped
            </p>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
            New Arrivals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our latest collection of handcrafted ethnic wear, fresh from our artisan partners.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {newArrivals.map((product, index) => (
            <motion.div
              key={product.node.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link to={`/product/${product.node.handle}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-3 rounded-sm">
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
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                  
                  {/* New Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                      <Sparkles className="h-3 w-3" />
                      New
                    </span>
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
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {product.node.productType}
                  </p>
                  <h3 className="font-serif text-sm lg:text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {product.node.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {formatPrice(product.node.priceRange.minVariantPrice.amount)}
                    </p>
                    {product.node.compareAtPriceRange?.minVariantPrice?.amount &&
                      parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount) > parseFloat(product.node.priceRange.minVariantPrice.amount) && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.node.compareAtPriceRange.minVariantPrice.amount)}
                      </span>
                    )}
                    {product.node.compareAtPriceRange?.minVariantPrice?.amount &&
                      parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount) > parseFloat(product.node.priceRange.minVariantPrice.amount) && (
                      <span className="text-xs text-primary font-medium">
                        {Math.round((1 - parseFloat(product.node.priceRange.minVariantPrice.amount) / parseFloat(product.node.compareAtPriceRange.minVariantPrice.amount)) * 100)}% off
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/collections">
              View All New Arrivals
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
