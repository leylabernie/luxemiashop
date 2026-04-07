import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { toast } from 'sonner';
import { isValidShopifyVariantId } from '@/lib/utils';

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore(state => state.addItem);

  const handleAddToCart = (product: typeof items[0]) => {
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) return;

    if (!isValidShopifyVariantId(firstVariant.id)) {
      toast.error('This product cannot be added to cart. Please visit the product page to purchase.');
      return;
    }

    const cartItem: CartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    };

    addToCart(cartItem);
    toast.success('Added to Cart', {
      description: product.node.title,
    });
  };

  const handleRemove = (productId: string, productTitle: string) => {
    removeItem(productId);
    toast.info('Removed from Wishlist', {
      description: productTitle,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="My Wishlist — LuxeMia"
        description="View and manage your LuxeMia wishlist. Save your favorite luxury Indian ethnic wear pieces for later."
        canonical="https://luxemia.shop/wishlist"
      />
      <Header />

      <main className="pt-[104px] lg:pt-[120px]">
        {/* Page Header */}
        <section className="py-12 lg:py-16 border-b border-border/50">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Heart className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h1 className="font-serif text-3xl lg:text-5xl mb-4">My Wishlist</h1>
              <p className="text-foreground/60 font-light">
                {items.length === 0 
                  ? 'Your wishlist is empty' 
                  : `${items.length} item${items.length !== 1 ? 's' : ''} saved`
                }
              </p>
            </motion.div>
          </div>
        </section>

        {/* Wishlist Content */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            {items.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-card flex items-center justify-center">
                  <Heart className="w-10 h-10 text-foreground/30" />
                </div>
                <h2 className="font-serif text-2xl mb-4">No saved items yet</h2>
                <p className="text-foreground/60 font-light max-w-md mx-auto mb-8">
                  Start exploring our collection and save your favorite pieces to your wishlist.
                </p>
                <Button asChild>
                  <Link to="/collections">
                    Explore Collections
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <>
                {/* Clear All Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end mb-8"
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      clearWishlist();
                      toast.info('Wishlist cleared');
                    }}
                    className="text-foreground/60 hover:text-foreground"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </motion.div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {items.map((product, index) => {
                    const firstImage = product.node.images.edges[0]?.node;
                    const price = product.node.priceRange.minVariantPrice;

                    return (
                      <motion.div
                        key={product.node.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group"
                      >
                        {/* Product Image */}
                        <Link 
                          to={`/product/${product.node.handle}`}
                          className="block relative aspect-[3/4] overflow-hidden mb-4 image-reveal"
                        >
                          {firstImage ? (
                            <img
                              src={firstImage.url}
                              alt={firstImage.altText || product.node.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ProductPlaceholder 
                              className="w-full h-full" 
                              label={product.node.title}
                            />
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />

                          {/* Remove Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemove(product.node.id, product.node.title);
                            }}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4 text-foreground/60" />
                          </button>

                          {/* Quick Add to Cart */}
                          <motion.button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ scale: 1.02 }}
                            className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm py-3 text-center text-sm tracking-editorial uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                          </motion.button>
                        </Link>

                        {/* Product Info */}
                        <div className="text-center">
                          <Link to={`/product/${product.node.handle}`}>
                            <h3 className="font-serif text-lg mb-1 luxury-link inline-block">
                              {product.node.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-foreground/60">
                            {price.currencyCode} {parseFloat(price.amount).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Continue Shopping */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-16"
                >
                  <Button variant="outline" asChild>
                    <Link to="/collections">
                      Continue Shopping
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
