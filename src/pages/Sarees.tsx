import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { metadataToSEOHeadProps } from '@/lib/seoHeadAdapter';
import { getStaticPageMetadata } from '@/lib/seoMetadata';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import CollectionProductBrowser from '@/components/collections/CollectionProductBrowser';
import { sareeFilterSections } from '@/lib/collectionFilterSections';
import { sortProducts } from '@/lib/productFilters';
import { getOptimizedImage } from '@/lib/imageUtils';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const sareesSeo = metadataToSEOHeadProps(getStaticPageMetadata('/sarees'));

const sareeFaqs = [
  {
    question: 'What types of sarees are available at LuxeMia?',
    answer: 'LuxeMia offers Indian sarees including silk, Banarasi, Kanchipuram, georgette, chiffon, tissue, designer, wedding, festive, and ready-to-wear saree styles where available in the live catalog.',
  },
  {
    question: 'How do I choose the right saree fabric?',
    answer: 'Choose Kanchipuram, Banarasi, or silk for weddings and formal ceremonies. Georgette, chiffon, organza, and tissue can work well for receptions, parties, and lighter festive events.',
  },
  {
    question: 'Can I filter sarees by color or occasion?',
    answer: 'Yes. The saree filters use product title, tags, description, and product type signals, so fabric, color, and occasion filters only match information available in product data.',
  },
];

const Sarees = () => {
  const { products, isLoading } = useShopifyProducts('sarees');
  const schemaProducts = useMemo(() => sortProducts(products, 'featured'), [products]);

  const collectionItems = schemaProducts.slice(0, 30).map(p => ({
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
        {...sareesSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Sarees', url: '/sarees' },
        ]}
        collection={{
          name: 'Sarees Collection',
          description: 'Silk sarees, designer sarees, wedding sarees, and elegant drapes for Indian celebrations.',
          items: collectionItems,
        }}
        faqs={sareeFaqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="relative h-64 md:h-96 flex items-center justify-center overflow-hidden">
          <picture className="absolute inset-0 w-full h-full">
            <source srcSet="/images/banners/saree-banner.webp" type="image/webp" />
            <img
              src={getOptimizedImage('/images/banners/saree-banner.jpg', 'hero')}
              alt="Saree Collection"
              className="absolute inset-0 w-full h-full object-cover object-top"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="relative z-10 text-center px-4 text-white">
            <p className="text-sm tracking-luxury uppercase text-white/70 mb-4">Timeless Elegance</p>
            <h1 className="text-3xl md:text-4xl font-serif mb-4">Sarees</h1>
            <p className="text-white/80 max-w-lg mx-auto">
              Beautiful sarees featuring silk, Banarasi, tissue, georgette, and contemporary drape styles.
            </p>
          </div>
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

        <CollectionProductBrowser
          products={products}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={sareeFilterSections}
          priceRangeMax={1000}
          countLabel="sarees"
          emptyState={
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-2xl mb-4">Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  Our saree collection is being curated. Check back soon for beautiful new additions.
                </p>
                <Button asChild variant="outline">
                  <Link to="/lehengas">Explore Lehengas</Link>
                </Button>
              </div>
            </div>
          }
        />
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Sarees</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {sareeFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sarees;

