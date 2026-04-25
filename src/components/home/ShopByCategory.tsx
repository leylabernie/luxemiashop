import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from '@/hooks/use-toast';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import type { ShopifyProduct } from '@/lib/shopify';

type TabType = 'new' | 'bestsellers' | 'ready';

const ShopByCategory = () => {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const { products, isLoading } = useShopifyProducts();
  const addToCart = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  // Build a balanced mix of products prioritizing women's categories
  const getBalancedMix = (source: ShopifyProduct[], count: number): ShopifyProduct[] => {
    const suits = source.filter(p => p.node.productType === 'Salwar Kameez');
    const lehengas = source.filter(p => p.node.productType === 'Lehengas');
    const sarees = source.filter(p => p.node.productType === 'Sarees');
    const menswear = source.filter(p => p.node.productType === 'Menswear');

    // Target mix: 3 suits, 2 lehengas, 2 sarees, 1 menswear (total 8)
    const picks: ShopifyProduct[] = [
      ...suits.slice(0, 3),
      ...lehengas.slice(0, 2),
      ...sarees.slice(0, 2),
      ...menswear.slice(0, 1),
    ];

    // If we don't have enough from a category, fill from others
    if (picks.length < count) {
      const usedIds = new Set(picks.map(p => p.node.id));
      const remaining = source.filter(p => !usedIds.has(p.node.id));
      picks.push(...remaining.slice(0, count - picks.length));
    }

    return picks.slice(0, count);
  };

  // Get products based on active tab
  const getProductsForTab = () => {
    if (!products) return [];

    switch (activeTab) {
      case 'new':
        // Newest products — sort by createdAt (most recent first) and pick 8
        return [...products]
          .sort((a, b) => new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime())
          .slice(0, 8);
      case 'bestsellers':
        // Bestsellers — balanced mix across categories, offset from "new" to show different products
        return getBalancedMix(products, 8);
      case 'ready':
        // Ready to Ship — products that are in stock and can ship quickly (sarees & suits)
        return products
          .filter(p => p.node.productType === 'Sarees' || p.node.productType === 'Salwar Kameez')
          .slice(0, 8);
      default:
        return getBalancedMix(products, 8);
    }
  };

  const displayProducts = getProductsForTab();

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(0)}`;
  };

  const handleQuickAdd = (product: ShopifyProduct) => {
    const node = product.node;
    const defaultVariant = node.variants?.edges[0]?.node;
    
    addToCart({
      product,
      variantId: defaultVariant?.id || node.id,
      variantTitle: defaultVariant?.title || 'Standard',
      price: {
        amount: node.priceRange.minVariantPrice.amount,
        currencyCode: node.priceRange.minVariantPrice.currencyCode
      },
      quantity: 1,
      selectedOptions: defaultVariant?.selectedOptions || [{ name: 'Size', value: 'M' }]
    });
    toast({
      title: "Added to bag",
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
    { id: 'new' as TabType, label: 'New Arrivals' },
    { id: 'bestsellers' as TabType, label: 'Bestsellers' },
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
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {displayProducts.map((product, index) => {
              const node = product.node;
              const imageUrl = node.images.edges[0]?.node.url || '';
              
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
                        src={imageUrl}
                        alt={node.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Quick Add
                      </button>

                      {/* Badge */}
                      {activeTab === 'new' && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded-sm">
                          New
                        </span>
                      )}
                      {activeTab === 'bestsellers' && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-sm">
                          Bestseller
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
                        {formatPrice(node.priceRange.minVariantPrice.amount)}
                      </p>
                      {node.compareAtPriceRange?.minVariantPrice?.amount &&
                        parseFloat(node.compareAtPriceRange.minVariantPrice.amount) > parseFloat(node.priceRange.minVariantPrice.amount) && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(node.compareAtPriceRange.minVariantPrice.amount)}
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
