import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from '@/hooks/use-toast';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import type { ShopifyProduct } from '@/lib/shopify';
import { getOptimizedImage } from '@/lib/imageUtils';
import { getDirectCardVariant } from '@/lib/purchaseOptions';
import { hasExplicitReadyToShipEvidence } from '@/lib/readyToShipEvidence';
import { isMadeToOrderProduct } from '@/lib/customizableProducts';
import { formatCurrencyAmount } from '@/lib/formatCurrency';
import { isProductExplicitlyOrderable } from '@/lib/orderability';
import CatalogLoadError from '@/components/collections/CatalogLoadError';

type TabType = 'new' | 'ready';

const ShopByCategory = () => {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const { products, isLoading, error } = useShopifyProducts();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  // Get products based on active tab
  // IMPORTANT: Only show women's products here — menswear has its own dedicated section
  const getProductsForTab = () => {
    if (!products) return [];

    // Exclude menswear from all tabs to avoid confusion
    const womensProducts = products.filter((product) => (
      product.node.productType !== 'Menswear'
      && isProductExplicitlyOrderable(product.node)
    ));

    switch (activeTab) {
      case 'new':
        // Newest women's products — sort by createdAt (most recent first) and pick 8
        return [...womensProducts]
          .sort((a, b) => new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime())
          .slice(0, 8);
      case 'ready':
        // Ready-to-ship is a positive Shopify classification. Availability or
        // the absence of a made-to-order tag is not enough evidence.
        return womensProducts
          .filter((product) => (
            product.node.availableForSale === true
            && product.node.variants.edges.some((edge) => edge.node.availableForSale === true)
            && !isMadeToOrderProduct(product.node.handle, product.node.tags)
            && hasExplicitReadyToShipEvidence(product.node)
          ))
          .slice(0, 8);
      default:
        return [...womensProducts]
          .sort((a, b) => new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime())
          .slice(0, 8);
    }
  };

  const displayProducts = getProductsForTab();

  const handleQuickAdd = (product: ShopifyProduct) => {
    const node = product.node;
    if (!isProductExplicitlyOrderable(node)) return;
    const variant = getDirectCardVariant(node);

    if (!variant) {
      navigate(`/product/${node.handle}#product-purchase`);
      return;
    }

    addToCart({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast({
      title: 'Added to bag',
      description: node.title,
    });
  };

  const isInWishlist = (productId: string) => wishlistItems.some(item => item.node.id === productId);

  const handleWishlistToggle = (product: ShopifyProduct) => {
    const node = product.node;
    if (isInWishlist(node.id)) {
      removeFromWishlist(node.id);
      toast({ title: "Removed from wishlist" });
    } else {
      addToWishlist(product);
      toast({ title: "Added to wishlist" });
    }
  };

  const tabs = [
    { id: 'new' as TabType, label: 'Recently Added' },
    { id: 'ready' as TabType, label: 'Ready to Ship' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header with Tabs */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl lg:text-4xl mb-8">Shop Our Collection</h2>
          
          {/* Tab Navigation - Like KALKI/Utsav */}
          <div className="flex justify-center gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductPlaceholder key={i} />
            ))}
          </div>
        ) : error ? (
          <CatalogLoadError retryHref="/" />
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {displayProducts.length === 0 ? (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground" role="status">
                {activeTab === 'ready'
                  ? 'No products with explicit ready-to-ship evidence are available in this view right now.'
                  : 'No current products were returned for this view.'}
              </p>
            ) : displayProducts.map((product, index) => {
              const node = product.node;
              const imageUrl = node.images.edges[0]?.node.url || '';
              const isOrderable = isProductExplicitlyOrderable(node);
              const directCardVariant = getDirectCardVariant(node);
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <Link to={`/product/${node.handle}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-3">
                      <img
                        src={getOptimizedImage(imageUrl, 'card')}
                        alt={node.title}
                        width={300} height={400}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleWishlistToggle(product);
                        }}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-background"
                      >
                        <Heart 
                          className={`w-4 h-4 transition-colors ${
                            isInWishlist(node.id) 
                              ? 'fill-primary text-primary' 
                              : 'text-foreground'
                          }`} 
                        />
                      </button>

                      {/* Quick Add Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleQuickAdd(product);
                        }}
                        className="absolute bottom-3 left-3 right-3 py-2.5 bg-background/95 backdrop-blur-sm text-foreground text-sm font-medium rounded-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                        disabled={!isOrderable}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {!isOrderable ? 'Sold Out' : directCardVariant ? 'Add to Bag' : 'Choose Options'}
                      </button>

                      {/* Badge */}
                      {activeTab === 'new' && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded-sm">
                          Recently Added
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {node.productType}
                    </p>
                    <h3 className="font-medium text-sm line-clamp-2 leading-snug">
                      {node.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {formatCurrencyAmount(
                          node.priceRange.minVariantPrice.amount,
                          node.priceRange.minVariantPrice.currencyCode,
                        )}
                      </p>
                      {node.compareAtPriceRange?.minVariantPrice?.amount &&
                        parseFloat(node.compareAtPriceRange.minVariantPrice.amount) > parseFloat(node.priceRange.minVariantPrice.amount) && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrencyAmount(
                            node.compareAtPriceRange.minVariantPrice.amount,
                            node.compareAtPriceRange.minVariantPrice.currencyCode,
                          )}
                        </span>
                      )}
                      {node.compareAtPriceRange?.minVariantPrice?.amount &&
                        parseFloat(node.compareAtPriceRange.minVariantPrice.amount) > parseFloat(node.priceRange.minVariantPrice.amount) && (
                        <span className="text-xs text-primary font-medium">
                          {Math.round((1 - parseFloat(node.priceRange.minVariantPrice.amount) / parseFloat(node.compareAtPriceRange.minVariantPrice.amount)) * 100)}% off
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="group">
            <Link to="/lehengas" className="flex items-center gap-2">
              View All Collections
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
