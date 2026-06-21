import { TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import CollectionProductBrowser from '@/components/collections/CollectionProductBrowser';
import { catalogFilterSections } from '@/lib/collectionFilterSections';

const sortOptions = [
  { label: 'Best Selling', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const Bestsellers = () => {
  const { products, isLoading } = useShopifyProducts('bestsellers');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bestsellers: Most-Loved Indian Ethnic Wear Online | LuxeMia Boutique"
        description="Shop LuxeMia Boutique's bestselling Indian ethnic wear online. Most-loved bridal lehengas, sarees, salwar kameez & jewelry - trusted by customers worldwide. Free shipping."
        canonical="https://luxemia.shop/bestsellers"
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Customer Favourites</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl mb-3">Bestsellers</h1>
            <p className="text-muted-foreground font-light max-w-md mx-auto text-sm lg:text-base">
              The styles our customers love most - tried, trusted and adored worldwide.
            </p>
          </div>
        </div>

        <CollectionProductBrowser
          products={products}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={catalogFilterSections}
          initialSort="featured"
          priceRangeMax={1000}
          countLabel="styles"
        />
      </main>

      <section className="border-t border-border/50 bg-card/20 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="font-serif text-xl mb-4">Most Popular Indian Ethnic Wear - Trusted by Customers in USA, Canada & Australia</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              These are the styles our customers return to again and again. LuxeMia Boutique&apos;s bestselling <strong>Indian ethnic wear</strong> includes our most-loved <strong>bridal lehenga choli sets</strong>, <strong>Banarasi and silk sarees</strong>, <strong>heavy embroidered anarkali suits</strong>, and <strong>groom sherwanis</strong> for weddings. These pieces consistently receive the highest customer satisfaction scores across our NRI customer base in the USA, Canada, and Australia.
            </p>
            <p>
              Our bestsellers are curated based on repeat orders, customer reviews, and styling team picks. Every piece in this collection has been worn to <strong>Indian weddings</strong>, <strong>Diwali celebrations</strong>, <strong>Eid festivities</strong>, <strong>sangeet nights</strong>, and <strong>reception dinners</strong>. Shop with confidence - these are the pieces that actually deliver on quality, colour accuracy, and fit.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Bestsellers;

