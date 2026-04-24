import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { toast } from 'sonner';

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore(state => state.addItem);

  const handleAddToCart = (product: typeof items[0]) => {
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) return;

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

  const handleShareWhatsApp = () => {
    if (items.length === 0) return;
    const lines = items.map(item => {
      const price = parseFloat(item.node.priceRange.minVariantPrice.amount);
      return `• ${item.node.title} — $${price.toFixed(2)}\n  https://luxemia.shop/product/${item.node.handle}`;
    });
    const msg = `Hi! Here's my LuxeMia wishlist 💖\n\n${lines.join('\n\n')}\n\nBrowse all: https://luxemia.shop/collections`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCopyLink = () => {
    if (items.length === 0) return;
    const lines = items.map(item => `${item.node.title}: https://luxemia.shop/product/${item.node.handle}`);
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      toast.success('Wishlist copied!', { description: 'Share it with friends and family.' });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="My Wishlist — LuxeMia"
        description="View and manage your LuxeMia wishlist. Save your favorite luxury Indian ethnic wear pieces for later."
        canonical="https://luxemia.shop/wishlist"
        noIndex={true}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
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
              <p className="text-foreground/60 font-light mb-5">
                {items.length === 0
                  ? 'Your wishlist is empty'
                  : `${items.length} item${items.length !== 1 ? 's' : ''} saved`
                }
              </p>
              {items.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-sm transition-colors"
                    data-testid="button-share-whatsapp"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary text-foreground text-sm rounded-sm transition-colors"
                    data-testid="button-copy-wishlist"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy Links
                  </button>
                </div>
              )}
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
