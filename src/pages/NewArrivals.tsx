import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import CollectionProductBrowser from '@/components/collections/CollectionProductBrowser';
import { catalogFilterSections } from '@/lib/collectionFilterSections';

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const NEW_ARRIVALS_LIMIT = 24;

const NewArrivals = () => {
  const { products, isLoading } = useShopifyProducts('new-arrivals');
  const recentProducts = useMemo(() => products.slice(0, NEW_ARRIVALS_LIMIT), [products]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="New Arrivals: Latest Indian Ethnic Wear Online | LuxeMia Boutique"
        description="Shop the latest Indian ethnic wear online at LuxeMia Boutique. New arrivals in bridal lehengas, designer sarees, salwar kameez, jewelry & more. Fresh styles added weekly. Free shipping."
        canonical="https://luxemia.shop/new-arrivals"
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        <div className="relative h-64 md:h-96 flex items-center justify-center overflow-hidden">
          <picture className="absolute inset-0 w-full h-full">
            <source srcSet="/images/banners/saree-banner.webp" type="image/webp" />
            <img
              src="/images/banners/saree-banner.jpg"
              alt="New Arrivals Collection"
              className="absolute inset-0 w-full h-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <div className="relative z-10 text-center px-4 text-white">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-xs uppercase tracking-widest text-white/70">Just Landed</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl mb-3">New Arrivals</h1>
            <p className="text-white/80 font-light max-w-md mx-auto text-sm lg:text-base">
              Discover our latest pieces - made with care, arriving fresh every week.
            </p>
          </div>
        </div>

        <CollectionProductBrowser
          products={recentProducts}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={catalogFilterSections}
          initialSort="newest"
          priceRangeMax={1000}
          countLabel="styles"
        />
      </main>

      <section className="border-t border-border/50 bg-card/20 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="font-serif text-xl mb-4">Latest Indian Ethnic Wear - Freshly Arrived at LuxeMia Boutique</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Our new arrivals are curated weekly from India&apos;s leading fabric markets and artisan workshops. Each new drop includes <strong>bridal lehengas</strong>, <strong>embroidered sarees</strong>, <strong>designer salwar kameez sets</strong>, <strong>party wear anarkalis</strong>, and <strong>men&apos;s sherwanis</strong> for upcoming wedding and festive seasons. Pieces are sourced from Surat, Varanasi, Jaipur, and Lucknow - the heart of India&apos;s textile industry.
            </p>
            <p>
              Whether you&apos;re shopping for a <strong>Diwali outfit</strong>, a <strong>wedding guest look</strong>, or the perfect <strong>bridal ensemble</strong> for a USA or Canada wedding, our new arrivals section is updated regularly with fresh styles at competitive prices. <strong>Free shipping on orders over $350</strong> to the USA, Canada, and Australia.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewArrivals;

