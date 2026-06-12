import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead, { type FAQItem } from '@/components/seo/SEOHead';
import { metadataToSEOHeadProps } from '@/lib/seoHeadAdapter';
import { getStaticPageMetadata } from '@/lib/seoMetadata';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { sortProducts } from '@/lib/productFilters';
import CollectionProductBrowser from '@/components/collections/CollectionProductBrowser';
import { catalogFilterSections } from '@/lib/collectionFilterSections';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

interface RelatedLink {
  label: string;
  href: string;
}

export interface BuyerIntentCollectionConfig {
  route: string;
  collectionKey: string;
  eyebrow: string;
  h1: string;
  intro: string;
  keywordIntro: string;
  collectionName: string;
  collectionDescription: string;
  faqHeading: string;
  faqs: FAQItem[];
  relatedHeading: string;
  relatedLinks: RelatedLink[];
  emptyTitle: string;
  emptyDescription: string;
  emptyLink: RelatedLink;
}

interface BuyerIntentCollectionPageProps {
  config: BuyerIntentCollectionConfig;
}

const BuyerIntentCollectionPage = ({ config }: BuyerIntentCollectionPageProps) => {
  const { products, isLoading } = useShopifyProducts(config.collectionKey);
  const sortedProducts = useMemo(() => sortProducts(products, 'featured'), [products]);
  const seo = metadataToSEOHeadProps(getStaticPageMetadata(config.route));

  const collectionItems = sortedProducts.slice(0, 30).map(p => ({
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
        {...seo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: config.h1, url: config.route },
        ]}
        collection={{
          name: config.collectionName,
          description: config.collectionDescription,
          items: collectionItems,
        }}
        faqs={config.faqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">{config.eyebrow}</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">{config.h1}</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              {config.intro}
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">{config.keywordIntro}</p>
          </div>
        </section>

        <CollectionProductBrowser
          products={products}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={catalogFilterSections}
          priceRangeMax={1000}
          countLabel="styles"
          emptyState={
            <div className="text-center py-16">
              <h2 className="font-serif text-2xl mb-4">{config.emptyTitle}</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{config.emptyDescription}</p>
              <Button asChild variant="outline">
                <Link to={config.emptyLink.href}>{config.emptyLink.label}</Link>
              </Button>
            </div>
          }
        />

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">{config.relatedHeading}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {config.relatedLinks.map(link => (
                <Link key={link.href} to={link.href}>
                  <Button variant="outline" size="sm">{link.label}</Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">{config.faqHeading}</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {config.faqs.map((faq, i) => (
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

export default BuyerIntentCollectionPage;
