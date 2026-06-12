import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { metadataToSEOHeadProps } from '@/lib/seoHeadAdapter';
import { getStaticPageMetadata } from '@/lib/seoMetadata';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useShopifyPaginatedProducts } from '@/hooks/useShopifyProducts';
import CollectionProductBrowser from '@/components/collections/CollectionProductBrowser';
import { lehengaFilterSections } from '@/lib/collectionFilterSections';
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const weddingLehengasSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/wedding-lehengas'));

const weddingLehengaFaqs = [
  {
    question: 'Are wedding lehengas only for brides?',
    answer: 'No. Wedding lehengas include bridal lehengas as well as styles for sisters, bridesmaids, cousins, mothers, and wedding guests.',
  },
  {
    question: 'How is this different from Bridal Lehengas?',
    answer: 'Wedding Lehengas is broader across wedding events and roles. Bridal Lehengas is focused specifically on bride-first shopping.',
  },
  {
    question: 'Which filters are available?',
    answer: 'Use price, fabric, color, and occasion filters derived from product tags, titles, descriptions, and product type.',
  },
];

const WeddingLehengas = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('wedding-lehengas');
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
        {...weddingLehengasSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Wedding Lehengas', url: '/collections/wedding-lehengas' },
        ]}
        collection={{
          name: 'Wedding Lehengas',
          description: 'Wedding lehenga collection for Indian wedding lehengas, bridal-adjacent lehenga choli, reception lehengas, sangeet lehengas, and wedding guest lehenga shopping.',
          items: collectionItems,
        }}
        faqs={weddingLehengaFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Indian Wedding Lehenga Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Wedding Lehengas</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop wedding lehengas for Indian wedding ceremonies, receptions, sangeet nights, mehendi events, engagements, and wedding guest looks.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              For bride-first shopping, compare <Link to="/collections/bridal-lehengas" className="text-foreground underline underline-offset-2">Bridal Lehengas</Link>. For every lehenga style, visit <Link to="/lehengas" className="text-foreground underline underline-offset-2">All Lehengas</Link>.
            </p>
          </div>
        </section>

        <CollectionProductBrowser
          products={products}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={lehengaFilterSections}
          priceRangeMax={2000}
          priceStep={50}
          countLabel="wedding-ready lehengas"
        />

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Wedding Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Wedding Lehengas</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {weddingLehengaFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WeddingLehengas;

