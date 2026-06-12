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
import { occasionFilterSections } from '@/lib/collectionFilterSections';
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const receptionOutfitsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/reception-outfits'));

const receptionOutfitFaqs = [
  {
    question: 'What should I wear to an Indian wedding reception?',
    answer: 'Reception outfits are usually polished evening looks: reception lehengas, sarees, gowns, Indo-Western sets, embellished suits, and cocktail-ready party wear. Choose by venue, dress code, comfort, and your relationship to the couple.',
  },
  {
    question: 'How is this different from wedding guest outfits?',
    answer: 'This page is focused on evening reception and cocktail styling. Wedding Guest Outfits is broader across the full wedding weekend, including ceremony, mehendi, sangeet, and reception options.',
  },
  {
    question: 'Which colors work best for reception outfits?',
    answer: 'Evening reception looks often work well in black, navy, wine, emerald, champagne, silver, gold, blush, ivory, and jewel tones. Sequins and metallic embroidery photograph well under reception lighting.',
  },
];

const ReceptionOutfits = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('reception-outfits');
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
        {...receptionOutfitsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Reception Outfits', url: '/collections/reception-outfits' },
        ]}
        collection={{
          name: 'Reception Outfits for Indian Weddings',
          description: 'Reception-focused collection of Indian reception outfits, reception lehengas, reception sarees, Indo-Western reception outfits, gowns, cocktail outfits, and party wear styles.',
          items: collectionItems,
        }}
        faqs={receptionOutfitFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Reception and Cocktail Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Reception Outfits for Indian Weddings</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Indian reception outfits selected for wedding receptions, cocktail events, engagement parties, sangeet nights, and formal evening celebrations. This edit highlights reception lehengas, reception sarees, Indo-Western reception outfits, gowns, and party wear Indian outfits.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              This page is intentionally evening-focused. For broader wedding weekend shopping, visit <Link to="/collections/wedding-guest-outfits" className="text-foreground underline underline-offset-2">Wedding Guest Outfits</Link>; for drape-first looks, compare <Link to="/collections/wedding-sarees" className="text-foreground underline underline-offset-2">Wedding Sarees</Link>.
            </p>
          </div>
        </section>

        <CollectionProductBrowser
          products={products}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={occasionFilterSections}
          priceRangeMax={1000}
          countLabel="reception-ready styles"
        />

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Reception Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Suits</Button></Link>
              <Link to="/indowestern"><Button variant="outline" size="sm">Indo-Western</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Reception Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {receptionOutfitFaqs.map((faq, i) => (
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

export default ReceptionOutfits;

