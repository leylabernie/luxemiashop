import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import ProductPlaceholder from '@/components/ui/ProductPlaceholder';
import { toast } from 'sonner';
import { getOptimizedImage } from '@/lib/imageUtils';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchProducts(8);
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: ShopifyProduct) => {
    e.preventDefault();
    e.stopPropagation();
    
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || []
    });

    toast.success('Added to cart', {
      description: product.node.title,
      position: 'top-center'
    });
  };

  const formatPrice = (amount: string, currencyCode: string) => {
    const num = parseFloat(amount);
    if (currencyCode === 'INR') {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(num);
  };

  return (
    <section className="py-20 lg:py-28 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-14"
        >
          <div>
            <p className="text-xs tracking-luxury uppercase text-foreground/60 mb-3">
              Hand-Picked For You
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl">Featured Pieces</h2>
          </div>
          <Link
            to="/shop"
            className="luxury-link text-sm tracking-editorial uppercase text-foreground/70 hover:text-foreground transition-colors"
          >
            View All
          </Link>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-card mb-4" />
                <div className="h-3 bg-card rounded w-1/3 mb-2" />
                <div className="h-4 bg-card rounded w-2/3 mb-2" />
                <div className="h-4 bg-card rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-foreground/60 mb-2">No products found</p>
            <p className="text-sm text-foreground/40">
              Add products to your Shopify store to display them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, index) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;

              return (
                <motion.article
                  key={product.node.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={`/product/${product.node.handle}`} className="block">
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-card">
                      {image ? (
                        <img
                          src={getOptimizedImage(image.url, 'card')}
                          alt={image.altText || product.node.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <ProductPlaceholder className="absolute inset-0 w-full h-full" />
                      )}

                      {/* Wishlist Button */}
                      <button
                        className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                        aria-label="Add to wishlist"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Heart className="w-4 h-4" />
                      </button>

                      {/* Quick Add Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <button 
                          className="w-full bg-background/95 backdrop-blur-sm py-3 text-xs tracking-editorial uppercase hover:bg-background transition-colors"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-sm lg:text-base group-hover:underline underline-offset-4 transition-all line-clamp-1">
                        {product.node.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatPrice(price.amount, price.currencyCode)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
