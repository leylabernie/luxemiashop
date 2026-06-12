import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { metadataToSEOHeadProps } from '@/lib/seoHeadAdapter';
import { getStaticPageMetadata } from '@/lib/seoMetadata';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import CollectionProductBrowser from '@/components/collections/CollectionProductBrowser';
import { occasionFilterSections } from '@/lib/collectionFilterSections';
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const weddingGuestSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/wedding-guest-outfits'));

const weddingGuestFaqs = [
  {
    question: 'What should I wear as a guest to an Indian wedding?',
    answer: 'Sarees, salwar kameez, anarkali suits, lehengas, and Indo-Western fusion outfits can all work for Indian wedding guests. Choose by ceremony: mehendi and haldi can be brighter and lighter, while the wedding ceremony and reception usually call for more polished outfits.',
  },
  {
    question: 'How is this different from Guest Wedding Dresses?',
    answer: 'Wedding Guest Outfits is a guide-style shopping page for the full wedding weekend. Guest Wedding Dresses is broader silhouette shopping across dresses, gowns, sarees, lehengas, and suits.',
  },
  {
    question: 'What colors should wedding guests avoid?',
    answer: 'Many guests avoid white and very bridal red unless the dress code says otherwise. Jewel tones, pastels, greens, blues, pinks, purples, teal, and gold are strong wedding guest choices.',
  },
];

const WeddingGuestOutfits = () => {
  const { products, isLoading } = useShopifyProducts('wedding-guest-outfits');
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
        {...weddingGuestSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Wedding Guest Outfits', url: '/collections/wedding-guest-outfits' },
        ]}
        collection={{
          name: 'Indian Wedding Guest Outfits',
          description: 'Wedding guest outfit collection featuring sarees, anarkali suits, lehengas, salwar kameez, and Indo-Western reception outfits for Indian wedding ceremonies.',
          items: collectionItems,
        }}
        faqs={weddingGuestFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Wedding Season</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Indian Wedding Guest Outfits</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Dress for every Indian wedding ceremony, from colorful mehendi and sangeet events to formal wedding ceremonies and evening receptions. This guide-style collection helps guests compare sarees, suits, lehengas, and Indo-Western outfits by occasion.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Use this page for full wedding-weekend outfit planning. For dress-and-gown discovery, browse <Link to="/collections/wedding-guest-dresses" className="text-foreground underline underline-offset-2">Guest Wedding Dresses</Link>; for evening styling, compare <Link to="/collections/reception-outfits" className="text-foreground underline underline-offset-2">Reception Outfits</Link>.
            </p>
          </div>
        </section>

        <CollectionProductBrowser
          products={products}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={occasionFilterSections}
          priceRangeMax={1000}
          countLabel="styles"
        />

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Shop by Wedding Need</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-guest-dresses"><Button variant="outline" size="sm">Guest Wedding Dresses</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Suits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Indian Wedding Guest Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {weddingGuestFaqs.map((faq, i) => (
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

export default WeddingGuestOutfits;

