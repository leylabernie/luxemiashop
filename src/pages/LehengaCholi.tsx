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
import type { ShopifyProduct } from '@/lib/shopify';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const lehengaCholiSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/lehenga-choli'));
const lehengaCholiIntentPattern = /\b(lehenga\s?choli|lehenga|choli|ghagra|designer|bridal|bride|wedding|party|festive|diwali|navratri|sangeet|mehendi|reception|embroider|sequins?|zari|zardozi|mirror.?work|silk|banarasi|georgette|net|organza|velvet|dupatta)\b/i;
const menswearIntentPattern = /\b(sherwani|kurta\s?pajama|pyjama|men'?s|menswear|groom|groomsmen|jodhpuri|modi\s?jacket|nehru\s?jacket|bandi|pathani|achkan|boys|for\s?men)\b/i;

const getSearchText = (product: ShopifyProduct): string => [
  product.node.title,
  product.node.productType,
  product.node.description,
  ...(product.node.tags ?? []),
].filter(Boolean).join(' ');

const lehengaCholiFaqs = [
  {
    question: 'What is a lehenga choli?',
    answer: 'A lehenga choli is a traditional Indian outfit made of a flared skirt, a blouse, and often a matching dupatta. It is popular for weddings, receptions, sangeet, mehendi, Diwali, Navratri, and festive celebrations.',
  },
  {
    question: 'How is this different from All Lehengas?',
    answer: 'This page is focused on lehenga choli intent and set-style shopping. All Lehengas is the broader parent category.',
  },
  {
    question: 'Which filters are available?',
    answer: 'Use price, fabric, color, and occasion filters derived from product tags, titles, descriptions, and product type.',
  },
];

const LehengaCholi = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('lehengas');

  const lehengaCholiMatches = useMemo(
    () => products.filter(product => {
      const searchText = getSearchText(product);
      return lehengaCholiIntentPattern.test(searchText) && !menswearIntentPattern.test(searchText);
    }),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && lehengaCholiMatches.length < 8;
  const lehengaCholiProducts = isUsingFallback ? products : lehengaCholiMatches;
  const schemaProducts = useMemo(() => sortProducts(lehengaCholiProducts, 'featured'), [lehengaCholiProducts]);

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
        {...lehengaCholiSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Lehenga Choli', url: '/collections/lehenga-choli' },
        ]}
        collection={{
          name: 'Lehenga Choli',
          description: 'Lehenga choli collection for designer lehenga choli, bridal lehenga choli, wedding lehenga choli, party wear lehenga choli, embroidered lehenga choli, and festive lehenga choli.',
          items: collectionItems,
        }}
        faqs={lehengaCholiFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Designer Lehenga Choli Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Lehenga Choli</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop lehenga choli and Indian lehenga choli styles for weddings, receptions, sangeet nights, mehendi events, parties, Diwali, Navratri, and festive celebrations.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              This page focuses on lehenga choli sets. For broader skirt-and-dupatta browsing, visit <Link to="/lehengas" className="text-foreground underline underline-offset-2">All Lehengas</Link>.
            </p>
            {isUsingFallback && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Showing all lehengas while lehenga choli product signals are limited.
              </p>
            )}
          </div>
        </section>

        <CollectionProductBrowser
          products={lehengaCholiProducts}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={lehengaFilterSections}
          priceRangeMax={2000}
          priceStep={50}
          countLabel="lehenga choli styles"
        />

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Lehenga Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">All Lehengas</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/wedding-lehengas"><Button variant="outline" size="sm">Wedding Lehengas</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Lehenga Choli</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {lehengaCholiFaqs.map((faq, i) => (
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

export default LehengaCholi;

