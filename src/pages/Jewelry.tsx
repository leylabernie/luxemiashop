import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Sparkles, Crown, Gem, CircleDot } from 'lucide-react';
import { PaginationWithInput } from '@/components/ui/pagination-with-input';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { jewelryProducts, jewelryCategories, type JewelryProduct } from '@/data/jewelryProducts';

const PRODUCTS_PER_PAGE = 24;

const Jewelry = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const addItem = useCartStore((state) => state.addItem);

  const filteredProducts = useMemo(() => 
    selectedCategory === 'All' 
      ? jewelryProducts 
      : jewelryProducts.filter(item => item.category === selectedCategory),
    [selectedCategory]
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Note: Page reset is handled in setSelectedCategory function

  const setSelectedCategory = (category: string) => {
    setSearchParams(params => {
      if (category === 'All') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      params.delete('page');
      return params;
    }, { replace: true });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams(params => {
        if (page === 1) {
          params.delete('page');
        } else {
          params.set('page', String(page));
        }
        return params;
      }, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  const handleAddToCart = (product: JewelryProduct) => {
    addItem({
      product: {
        node: {
          id: product.id,
          title: product.name,
          handle: product.id,
          description: product.description,
          images: { edges: [{ node: { url: product.image, altText: product.name } }] },
          priceRange: { 
            minVariantPrice: { amount: String(product.price), currencyCode: 'USD' } 
          },
          variants: { 
            edges: [{ 
              node: { 
                id: product.id, 
                title: 'Default',
                price: { amount: String(product.price), currencyCode: 'USD' },
                availableForSale: true,
                selectedOptions: []
              } 
            }] 
          },
          options: [],
        }
      },
      variantId: product.id,
      variantTitle: 'Default',
      price: { amount: String(product.price), currencyCode: 'USD' },
      quantity: 1,
      selectedOptions: [],
    });
    toast.success('Added to cart!', {
      description: product.name,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Complete Your Look</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6"
            >
              Jewelry Collection
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              From statement necklaces to elegant earrings, discover exquisite handcrafted jewelry 
              to complement your ethnic ensemble.
            </motion.p>
          </div>
        </section>

        {/* Category Highlights */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { icon: Crown, title: 'Necklaces', count: '30+ designs' },
                { icon: Gem, title: 'Earrings', count: '15+ styles' },
                { icon: CircleDot, title: 'Bangles', count: '10+ sets' },
                { icon: Sparkles, title: 'Bridal Sets', count: '12+ pieces' },
                { icon: Crown, title: 'Maang Tikka', count: '8+ designs' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCategory(item.title)}
                >
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.count}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 sticky top-20 bg-background/95 backdrop-blur-sm z-30 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {jewelryCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                Showing {paginatedProducts.length} of {filteredProducts.length} {selectedCategory === 'All' ? 'jewelry items' : selectedCategory.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg bg-secondary/30 aspect-[3/4] mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isNew && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          New
                        </span>
                      )}
                      {product.isBestseller && (
                        <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded">
                          Bestseller
                        </span>
                      )}
                      {product.originalPrice && (
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                          Sale
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3">
                      <button className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to Cart Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-primary uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.material}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-semibold text-foreground">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <PaginationWithInput
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={filteredProducts.length}
              onPageChange={goToPage}
              getPageNumbers={getPageNumbers}
            />
          </div>
        </section>

        {/* Styling Tips */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl text-foreground text-center mb-12">
              Styling Tips
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Match Your Metals</h3>
                <p className="text-muted-foreground text-sm">
                  Coordinate your jewelry with the zari and embellishments on your outfit for a cohesive look.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Size Your Bag Right</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a clutch or potli that complements your outfit's volume—smaller bags for heavy lehengas.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Balance is Key</h3>
                <p className="text-muted-foreground text-sm">
                  If your outfit is heavily embellished, opt for minimalist accessories and vice versa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Need Help Styling?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our styling experts can help you find the perfect accessories to complete your look. 
              Book a free virtual consultation today.
            </p>
            <Link to="/contact">
              <Button size="lg">Contact Our Stylists</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Jewelry;