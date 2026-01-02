import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllLocalProducts } from '@/data/localProducts';

interface SearchResult {
  id: string;
  handle: string;
  title: string;
  category: string;
  price: string;
  image: string;
}

interface ProductSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductSearch = ({ isOpen, onClose }: ProductSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Get all products and memoize
  const allProducts = useMemo(() => {
    return getAllLocalProducts().map(product => ({
      id: product.node.id,
      handle: product.node.handle,
      title: product.node.title,
      category: product.node.description.toLowerCase().includes('saree') ? 'Sarees' :
                product.node.description.toLowerCase().includes('lehenga') ? 'Lehengas' :
                product.node.description.toLowerCase().includes('sherwani') || 
                product.node.description.toLowerCase().includes('kurta') ? 'Menswear' : 'Suits',
      price: product.node.priceRange.minVariantPrice.amount,
      image: product.node.images.edges[0]?.node.url || '',
    }));
  }, []);

  // Search products when query changes
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = allProducts.filter(product =>
      product.title.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    ).slice(0, 8); // Limit to 8 results

    setResults(filtered);
  }, [query, allProducts]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleProductClick = (handle: string) => {
    navigate(`/product/${handle}`);
    onClose();
    setQuery('');
  };

  const getCategoryLink = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sarees': return '/sarees';
      case 'lehengas': return '/lehengas';
      case 'menswear': return '/menswear';
      case 'suits': return '/suits';
      default: return '/collections';
    }
  };

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  // Get popular categories
  const popularCategories = [
    { name: 'Lehengas', href: '/lehengas', count: allProducts.filter(p => p.category === 'Lehengas').length },
    { name: 'Sarees', href: '/sarees', count: allProducts.filter(p => p.category === 'Sarees').length },
    { name: 'Menswear', href: '/menswear', count: allProducts.filter(p => p.category === 'Menswear').length },
    { name: 'Suits', href: '/suits', count: allProducts.filter(p => p.category === 'Suits').length },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 bg-background z-50 shadow-2xl border-b border-border"
          >
            <div className="container mx-auto px-4 py-6">
              {/* Search Input */}
              <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for lehengas, sarees, menswear, suits..."
                  className="w-full bg-card border border-border rounded-full py-4 pl-12 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Results or Suggestions */}
              <div className="max-w-3xl mx-auto mt-6">
                {query.length >= 2 && results.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {results.length} result{results.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {results.map((product) => (
                        <motion.button
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleProductClick(product.handle)}
                          className="flex items-center gap-3 p-3 bg-card hover:bg-muted rounded-lg transition-colors text-left group"
                        >
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {product.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                            <p className="text-sm font-medium text-primary mt-1">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : query.length >= 2 && results.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No products found for "{query}"</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try searching for lehengas, sarees, menswear, or suits
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                        Browse Categories
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {popularCategories.map((category) => (
                          <Link
                            key={category.name}
                            to={category.href}
                            onClick={onClose}
                            className="flex items-center justify-between p-4 bg-card hover:bg-muted rounded-lg transition-colors group"
                          >
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">
                                {category.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {category.count} products
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                        Popular Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['Bridal Lehenga', 'Silk Saree', 'Sherwani', 'Anarkali', 'Velvet', 'Party Wear'].map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-4 py-2 bg-card hover:bg-muted rounded-full text-sm transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductSearch;
