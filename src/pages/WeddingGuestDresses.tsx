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
import type { ShopifyProduct } from '@/lib/shopify';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const weddingGuestDressesSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/wedding-guest-dresses'));

const weddingGuestDressIntentPattern = /\b(guest\s?wedding\s?dress|wedding\s?guest|indian\s?wedding|occasion\s?wear|festive\s?wear|lehenga|saree|sari|gown|anarkali|salwar|kameez|sharara|gharara|palazzo|indo.?western|fusion|reception|sangeet|mehendi|haldi|cocktail|engagement|party|embroider|sequins?|zari|mirror|silk|georgette|chiffon|organza|net|velvet)\b/i;
const menswearIntentPattern = /\b(sherwani|kurta\s?pajama|pyjama|men'?s|menswear|groom|groomsmen|jodhpuri|modi\s?jacket|nehru\s?jacket|bandi|pathani|achkan|boys|for\s?men)\b/i;

const getSearchText = (product: ShopifyProduct): string => [
  product.node.title,
  product.node.productType,
  product.node.description,
  ...(product.node.tags ?? []),
].filter(Boolean).join(' ');

const weddingGuestDressFaqs = [
  {
    question: 'What are guest wedding dresses for Indian weddings?',
    answer: 'Guest wedding dresses for Indian weddings include celebration-ready sarees, lehengas, Anarkali suits, saree gowns, salwar kameez, sharara sets, palazzo suits, and Indo-Western outfits.',
  },
  {
    question: 'How is this page different from Wedding Guest Outfits?',
    answer: 'Guest Wedding Dresses is a broad shopping page for dressy guest silhouettes. Wedding Guest Outfits is more of an occasion guide for choosing outfits across each wedding ceremony.',
  },
  {
    question: 'Can wedding guests wear lehengas, sarees, or gowns?',
    answer: 'Yes. Wedding guest lehengas, sarees, saree gowns, Anarkali gowns, and Indo-Western dresses can all be appropriate depending on ceremony formality, color, comfort, and styling.',
  },
];

const WeddingGuestDresses = () => {
  const { products, isLoading } = useShopifyProducts();

  const nonMenswearProducts = useMemo(
    () => products.filter(product => !menswearIntentPattern.test(getSearchText(product))),
    [products]
  );
  const weddingGuestDressMatches = useMemo(
    () => nonMenswearProducts.filter(product => weddingGuestDressIntentPattern.test(getSearchText(product))),
    [nonMenswearProducts]
  );
  const isUsingFallback = !isLoading && nonMenswearProducts.length > 0 && weddingGuestDressMatches.length < 8;
  const weddingGuestDressProducts = isUsingFallback ? nonMenswearProducts : weddingGuestDressMatches;
  const schemaProducts = useMemo(() => sortProducts(weddingGuestDressProducts, 'featured'), [weddingGuestDressProducts]);

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
        {...weddingGuestDressesSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Guest Wedding Dresses', url: '/collections/wedding-guest-dresses' },
        ]}
        collection={{
          name: 'Guest Wedding Dresses',
          description: 'Guest wedding dresses collection for Indian wedding guest outfits, wedding guest lehengas, sarees, gowns, Anarkali suits, Indo-Western outfits, and festive occasion wear.',
          items: collectionItems,
        }}
        faqs={weddingGuestDressFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Indian Wedding Guest Edit</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Guest Wedding Dresses</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop guest wedding dresses for Indian wedding ceremonies, sangeet nights, receptions, mehendi events, engagement parties, and festive family celebrations. This broad shopping page gathers guest-ready sarees, lehengas, gowns, suits, and Indo-Western looks in one place.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              For ceremony-by-ceremony advice, visit <Link to="/collections/wedding-guest-outfits" className="text-foreground underline underline-offset-2">Wedding Guest Outfits</Link>. For evening cocktail styling, compare <Link to="/collections/reception-outfits" className="text-foreground underline underline-offset-2">Reception Outfits</Link>.
            </p>
            {isUsingFallback && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Showing broader occasion wear while guest wedding dress product signals are limited.
              </p>
            )}
          </div>
        </section>

        <CollectionProductBrowser
          products={weddingGuestDressProducts}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={occasionFilterSections}
          priceRangeMax={1000}
          countLabel="guest wedding dresses"
        />

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Wedding Guest Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Suits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Guest Wedding Dresses</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {weddingGuestDressFaqs.map((faq, i) => (
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

export default WeddingGuestDresses;

