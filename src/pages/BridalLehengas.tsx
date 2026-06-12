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

const bridalLehengasSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/bridal-lehengas'));

const bridalLehengaFaqs = [
  {
    question: 'What type of bridal lehenga should I choose for an Indian wedding?',
    answer: 'Choose by ceremony, venue, season, fabric, embroidery weight, color, and delivery timing. Silk, velvet, net, georgette, zari, mirror work, and embroidered styles can all work depending on the event.',
  },
  {
    question: 'How is Bridal Lehengas different from Wedding Lehengas?',
    answer: 'Bridal Lehengas is focused on bride-first shopping. Wedding Lehengas is broader and can include bridal-adjacent, family, reception, sangeet, and guest-ready lehenga styles.',
  },
  {
    question: 'Can I filter bridal lehengas by fabric, color, and occasion?',
    answer: 'Yes. Filters use product data signals from tags, titles, descriptions, and product type instead of invented values.',
  },
];

const BridalLehengas = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('bridal-lehengas');
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
        {...bridalLehengasSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Bridal Lehengas', url: '/collections/bridal-lehengas' },
        ]}
        collection={{
          name: 'Bridal Lehengas for Indian Weddings',
          description: 'Bride-focused collection of Indian bridal lehengas, wedding lehenga choli sets, and embroidered designer lehengas.',
          items: collectionItems,
        }}
        faqs={bridalLehengaFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Bride-Focused Wedding Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Bridal Lehengas for Indian Weddings</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Indian bridal lehengas selected for brides planning wedding, engagement, reception, sangeet, and ceremony looks.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              This page is bride-first. For broader lehenga shopping, visit <Link to="/collections/wedding-lehengas" className="text-foreground underline underline-offset-2">Wedding Lehengas</Link> or <Link to="/lehengas" className="text-foreground underline underline-offset-2">All Lehengas</Link>.
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
          countLabel="bridal-ready styles"
        />

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Wedding Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-lehengas"><Button variant="outline" size="sm">Wedding Lehengas</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Suits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Bridal Lehengas</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {bridalLehengaFaqs.map((faq, i) => (
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

export default BridalLehengas;

