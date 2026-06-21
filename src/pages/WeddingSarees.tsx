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
import { sareeFilterSections } from '@/lib/collectionFilterSections';
import { sortProducts } from '@/lib/productFilters';
import type { ShopifyProduct } from '@/lib/shopify';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const weddingSareesSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/wedding-sarees'));
const weddingSareeIntentPattern = /\b(wedding|bridal|bride|reception|engagement|sangeet|banarasi|kanjivaram|kanchipuram|silk|zari|woven|pattu|tissue|festive|designer)\b/i;

const getSearchText = (product: ShopifyProduct): string => [
  product.node.title,
  product.node.productType,
  product.node.description,
  ...(product.node.tags ?? []),
].filter(Boolean).join(' ');

const weddingSareeFaqs = [
  {
    question: 'Which sarees are best for Indian weddings?',
    answer: 'Banarasi silk, Kanjivaram, Kanchipuram silk, tissue silk, and embellished designer sarees are strong choices for Indian weddings. Brides often choose richer woven silks or zari work, while family members and guests may prefer lighter silk, georgette, organza, or ready-to-drape styles depending on the ceremony and time of day.',
  },
  {
    question: 'What is the difference between Banarasi and Kanjivaram wedding sarees?',
    answer: 'Banarasi wedding sarees are known for ornate brocade, zari motifs, and a North Indian bridal feel. Kanjivaram and Kanchipuram sarees are South Indian silk sarees known for rich color, heavier silk, and contrast borders. Both can work beautifully for wedding ceremonies, receptions, and family events.',
  },
  {
    question: 'Can brides and wedding guests both wear wedding sarees?',
    answer: 'Yes. Brides usually choose more formal sarees with heavier silk, zari, or statement borders, while wedding guests can choose elegant silk, georgette, chiffon, organza, or festive designer sarees. The right choice depends on the ceremony, dress code, color preference, and how formal the event is.',
  },
  {
    question: 'Which saree fabrics work best for wedding ceremonies?',
    answer: 'Silk, Banarasi silk, Kanjivaram silk, Kanchipuram silk, tissue, organza, georgette, and chiffon are common wedding saree fabrics. Heavier silks feel more ceremonial, while georgette, chiffon, and organza can feel lighter for reception, sangeet, engagement, or destination wedding events.',
  },
  {
    question: 'Do wedding sarees include blouse stitching or delivery support?',
    answer: 'Many LuxeMia Boutique sarees support blouse stitching or fit options where available on the product. Review each product page for stitching, sizing, and fulfillment details before ordering. If you are shopping for a wedding date, allow extra time for blouse stitching and tracked delivery.',
  },
  {
    question: 'How is this different from the main Sarees page?',
    answer: 'Wedding Sarees is focused on ceremony, bridal, family, and guest wedding intent. The Sarees page is broader across everyday, festive, designer, and occasion drape styles.',
  },
  {
    question: 'How should I choose wedding sarees online?',
    answer: 'Start with the ceremony, role, color direction, fabric comfort, blouse needs, and delivery timeline. Compare product photos, fabric details, work type, sizing options, and care instructions. If your event is close, prioritize clearly available products and contact LuxeMia Boutique for sizing or styling guidance before purchase.',
  },
];

const WeddingSarees = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('sarees');

  const weddingMatches = useMemo(
    () => products.filter(product => weddingSareeIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && weddingMatches.length < 8;
  const weddingProducts = isUsingFallback ? products : weddingMatches;
  const schemaProducts = useMemo(() => sortProducts(weddingProducts, 'featured'), [weddingProducts]);

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
        {...weddingSareesSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Wedding Sarees', url: '/collections/wedding-sarees' },
        ]}
        collection={{
          name: 'Wedding Sarees for Indian Ceremonies',
          description: 'Wedding-focused collection of Indian wedding sarees, Banarasi wedding sarees, Kanjivaram and Kanchipuram silk sarees, and bridal-ready sarees for ceremony, reception, engagement, and sangeet shopping.',
          items: collectionItems,
        }}
        faqs={weddingSareeFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Wedding-Focused Saree Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Wedding Sarees for Indian Ceremonies</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop Indian wedding sarees selected for brides, family members, and wedding guests planning ceremony, engagement, reception, and sangeet looks. This collection focuses on Banarasi wedding sarees, Kanjivaram and Kanchipuram silk sarees, tissue sarees, zari work, and designer sarees for Indian wedding shopping online.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>wedding sarees online</strong>, <strong>Banarasi wedding sarees</strong>, <strong>Kanjivaram wedding sarees</strong>, <strong>Kanchipuram silk wedding sarees</strong>, and <strong>bridal wedding sarees</strong>. For everyday, festive, and broader drape styles, visit the full <Link to="/sarees" className="text-foreground underline underline-offset-2">Sarees</Link> page; for guest styling across silhouettes, visit <Link to="/collections/wedding-guest-outfits" className="text-foreground underline underline-offset-2">Wedding Guest Outfits</Link>.
            </p>
            {isUsingFallback && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Showing all sarees while wedding product signals are limited.
              </p>
            )}
          </div>
        </section>

        <CollectionProductBrowser
          products={weddingProducts}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={sareeFilterSections}
          priceRangeMax={1000}
          countLabel="wedding-ready sarees"
        />

        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-2xl mb-6 text-center">How This Wedding Saree Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for wedding shopping</h3>
                <p>
                  This page is focused on wedding saree intent, not every saree occasion. It highlights sarees for brides, close family, and guests shopping for ceremonies, receptions, engagements, and sangeet events.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Ceremony-ready textiles</h3>
                <p>
                  Wedding shoppers often compare Banarasi silk, Kanjivaram, Kanchipuram silk, tissue, zari work, woven borders, blouse fit, and delivery timing. This collection gathers those wedding considerations into one focused shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Bride and guest styling</h3>
                <p>
                  Heavier silk and zari sarees can feel more bridal or ceremonial, while lighter designer, organza, georgette, and chiffon sarees can suit reception, engagement, sangeet, and wedding guest looks.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online wedding confidence</h3>
                <p>
                  LuxeMia Boutique supports wedding shoppers with tracked shipping, blouse and fit options where available, and styling guidance before purchase. Review each product&apos;s sizing, stitching, and fulfillment details before ordering.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Wedding Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/sarees"><Button variant="outline" size="sm">All Sarees</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/wedding-lehengas"><Button variant="outline" size="sm">Wedding Lehengas</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/wedding-guest-dresses"><Button variant="outline" size="sm">Guest Wedding Dresses</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Lehengas</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Suits</Button></Link>
              <Link to="/menswear"><Button variant="outline" size="sm">Menswear</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Wedding Sarees</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {weddingSareeFaqs.map((faq, i) => (
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

export default WeddingSarees;

