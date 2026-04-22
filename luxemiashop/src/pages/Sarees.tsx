import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShopifyPaginatedProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';
import { PaginationWithInput } from '@/components/ui/pagination-with-input';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const Sarees = () => {
  const { products, isLoading, currentPage, totalPages, totalCount, goToPage } = useShopifyPaginatedProducts('sarees');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    return sortProducts(products, sortBy);
  }, [products, sortBy]);

  // Generate pagination numbers
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };


  // Collection-specific FAQs for rich snippets
  const sareeFaqs = [
    {
      question: "What types of sarees are available at LuxeMia?",
      answer: "LuxeMia offers a curated collection of premium sarees including Kanchipuram silk, Banarasi silk, Tissue silk, Georgette, and handwoven sarees. Our collection spans wedding sarees, festive wear, casual sarees, and occasion wear suitable for every celebration."
    },
    {
      question: "How do I choose the right saree fabric?",
      answer: "Choose Kanchipuram or Banarasi silk for weddings and grand occasions. Georgette and Chiffon work well for parties and receptions. Cotton and Tissue silk are ideal for festive wear and day events. Our expert stylists can help you select the perfect fabric for your occasion."
    },
    {
      question: "Do you offer custom blouse stitching with sarees?",
      answer: "Yes, we offer complimentary blouse stitching with every saree purchase. You can provide your measurements and preferred style (padded, princess cut, etc.), and our master tailors will create a perfectly fitted blouse."
    },
    {
      question: "What is the delivery time for sarees?",
      answer: "Standard shipping to the US takes 7-12 business days. Express shipping (3-5 days) is available at checkout. For custom blouse stitching orders, please allow an additional 5-7 days for tailoring."
    },
    {
      question: "How should I care for my silk saree?",
      answer: "We recommend professional dry cleaning for all silk sarees. Store in a cool, dry place wrapped in soft muslin cloth. Avoid direct sunlight and refold every few months to prevent permanent creases."
    }
  ];

  // Generate collection schema items from products
  const collectionItems = filteredProducts.slice(0, 30).map(p => ({
    id: p.node.id,
    name: p.node.title,
    url: p.node.handle,
    image: p.node.images.edges[0]?.node.url || '',
    price: p.node.priceRange.minVariantPrice.amount,
    currency: p.node.priceRange.minVariantPrice.currencyCode,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Indian Wedding & Silk Sarees Online | Designer Saree Collection — LuxeMia"
        description="Buy authentic Indian sarees online at LuxeMia. Handwoven Banarasi silk, Kanchipuram, and designer wedding sarees. Free worldwide shipping to USA, UK & Canada. Custom blouse stitching included."
        canonical="https://luxemia.shop/sarees"
        keywords="indian sarees online, buy sarees online, wedding sarees, banarasi silk saree, kanchipuram saree, designer saree, silk saree online shopping, indian wedding saree USA"
        type="collection"
        image="/og/og-sarees.jpg"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Sarees', url: '/sarees' },
        ]}
        collection={{
          name: 'Sarees Collection',
          description: 'Handwoven silk sarees and designer drapes for weddings and celebrations.',
          items: collectionItems,
        }}
        faqs={sareeFaqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="relative h-64 md:h-80 flex items-center justify-center bg-gradient-to-b from-secondary to-background overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center px-4"
          >
            <p className="text-sm tracking-luxury uppercase text-muted-foreground mb-4">
              Timeless Elegance
            </p>
            <h1 className="text-3xl md:text-4xl font-serif mb-4">Indian Wedding & Designer Sarees</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Exquisite handwoven sarees featuring Kanchipuram silks, tissue weaves, and contemporary designs.
            </p>
          </motion.div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-foreground">Sarees</span>
          </nav>
        </div>

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex-1">
            {/* Toolbar - only show sort when there are products */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sort by: {sortOptions.find((o) => o.value === sortBy)?.label}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover">
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={sortBy === option.value ? 'bg-secondary' : ''}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-secondary mb-2 sm:mb-3" />
                    <div className="h-2 sm:h-3 bg-secondary rounded w-1/3 mb-1 sm:mb-2" />
                    <div className="h-3 sm:h-4 bg-secondary rounded w-2/3 mb-1 sm:mb-2" />
                    <div className="h-3 sm:h-4 bg-secondary rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <h3 className="font-serif text-2xl mb-4">Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Our saree collection featuring Kanchipuram silks, Banarasi weaves, and contemporary
                    designs is being curated. Check back soon for exquisite handwoven drapes.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/lehengas">Explore Lehengas</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.node.id}
                      product={product}
                      index={index % 24}
                      showQuickAdd={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <PaginationWithInput
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={goToPage}
                  getPageNumbers={getPageNumbers}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sarees;
