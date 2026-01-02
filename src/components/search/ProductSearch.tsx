import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllLocalProducts } from '@/data/localProducts';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchResult {
  id: string;
  handle: string;
  title: string;
  category: string;
  price: string;
  image: string;
  occasion: string;
  fabric: string;
}

interface ProductSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickFilterOptions = {
  size: ['S', 'M', 'L', 'XL', '36', '38', '40', '42', '44'],
  occasion: ['Wedding', 'Party', 'Festival', 'Casual', 'Bridal'],
  fabric: ['Silk', 'Velvet', 'Georgette', 'Cotton', 'Chiffon'],
};

const ProductSearch = ({ isOpen, onClose }: ProductSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Get all products and memoize with extracted metadata
  const allProducts = useMemo(() => {
    return getAllLocalProducts().map(product => {
      const desc = product.node.description.toLowerCase();
      const title = product.node.title.toLowerCase();
      
      // Determine category
      let category = 'Suits';
      if (desc.includes('saree') || title.includes('saree')) category = 'Sarees';
      else if (desc.includes('lehenga') || title.includes('lehenga')) category = 'Lehengas';
      else if (desc.includes('sherwani') || desc.includes('kurta') || title.includes('sherwani') || title.includes('kurta pajama')) category = 'Menswear';
      
      // Extract occasion
      let occasion = 'Casual';
      if (desc.includes('wedding') || desc.includes('bridal')) occasion = 'Wedding';
      else if (desc.includes('party')) occasion = 'Party';
      else if (desc.includes('festival') || desc.includes('festive')) occasion = 'Festival';
      else if (desc.includes('bridal')) occasion = 'Bridal';
      
      // Extract fabric
      let fabric = 'Silk';
      if (desc.includes('velvet')) fabric = 'Velvet';
      else if (desc.includes('georgette')) fabric = 'Georgette';
      else if (desc.includes('cotton')) fabric = 'Cotton';
      else if (desc.includes('chiffon')) fabric = 'Chiffon';
      
      return {
        id: product.node.id,
        handle: product.node.handle,
        title: product.node.title,
        category,
        price: product.node.priceRange.minVariantPrice.amount,
        image: product.node.images.edges[0]?.node.url || '',
        occasion,
        fabric,
      };
    });
  }, []);

  // Filter products based on query and filters
  useEffect(() => {
    let filtered = [...allProducts];
    
    // Text search
    if (query.length >= 2) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.occasion.toLowerCase().includes(searchTerm) ||
        product.fabric.toLowerCase().includes(searchTerm)
      );
    }
    
    // Price filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Size filter - note: we can't filter by size in search since we don't have variant data in the simplified search results
    // This would require fetching full product data
    
    // Occasion filter
    if (selectedOccasions.length > 0) {
      filtered = filtered.filter(product =>
        selectedOccasions.some(o => product.occasion.toLowerCase() === o.toLowerCase())
      );
    }
    
    // Fabric filter
    if (selectedFabrics.length > 0) {
      filtered = filtered.filter(product =>
        selectedFabrics.some(f => product.fabric.toLowerCase() === f.toLowerCase())
      );
    }
    
    // Show results if query or filters are active
    if (query.length >= 2 || selectedOccasions.length > 0 || selectedFabrics.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000) {
      setResults(filtered.slice(0, 12));
    } else {
      setResults([]);
    }
  }, [query, allProducts, priceRange, selectedOccasions, selectedFabrics]);

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
    clearFilters();
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedSizes([]);
    setSelectedOccasions([]);
    setSelectedFabrics([]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions(prev =>
      prev.includes(occasion)
        ? prev.filter(o => o !== occasion)
        : [...prev, occasion]
    );
  };

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics(prev =>
      prev.includes(fabric)
        ? prev.filter(f => f !== fabric)
        : [...prev, fabric]
    );
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedOccasions.length > 0 || selectedFabrics.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000;

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
            className="fixed top-0 left-0 right-0 bg-background z-50 shadow-2xl border-b border-border max-h-[90vh] overflow-y-auto"
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
                  className="w-full bg-card border border-border rounded-full py-4 pl-12 pr-24 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-full transition-colors ${showFilters || hasActiveFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    aria-label="Toggle filters"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-3xl mx-auto mt-4 overflow-hidden"
                  >
                    <div className="p-4 bg-card rounded-lg border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Quick Filters</h3>
                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                            Clear All
                          </Button>
                        )}
                      </div>
                      
                      {/* Price Range */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Price Range</p>
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          min={0}
                          max={1000}
                          step={50}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>

                      {/* Size */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Size</p>
                        <div className="flex flex-wrap gap-2">
                          {quickFilterOptions.size.map((size) => (
                            <button
                              key={size}
                              onClick={() => toggleSize(size)}
                              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                selectedSizes.includes(size)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:bg-muted'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Occasion */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Occasion</p>
                        <div className="flex flex-wrap gap-2">
                          {quickFilterOptions.occasion.map((occasion) => (
                            <button
                              key={occasion}
                              onClick={() => toggleOccasion(occasion)}
                              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                selectedOccasions.includes(occasion)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:bg-muted'
                              }`}
                            >
                              {occasion}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fabric */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Fabric</p>
                        <div className="flex flex-wrap gap-2">
                          {quickFilterOptions.fabric.map((fabric) => (
                            <button
                              key={fabric}
                              onClick={() => toggleFabric(fabric)}
                              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                selectedFabrics.includes(fabric)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-border hover:bg-muted'
                              }`}
                            >
                              {fabric}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results or Suggestions */}
              <div className="max-w-3xl mx-auto mt-6">
                {results.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {results.length} result{results.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {results.map((product) => (
                        <motion.button
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleProductClick(product.handle)}
                          className="flex flex-col p-3 bg-card hover:bg-muted rounded-lg transition-colors text-left group"
                        >
                          <div className="aspect-[3/4] w-full overflow-hidden rounded-md mb-2">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {product.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                          <p className="text-sm font-medium text-primary mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : query.length >= 2 || hasActiveFilters ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No products found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search or filters
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
