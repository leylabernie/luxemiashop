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
    answer: 'Indian weddings are vibrant, celebratory occasions and guests are expected to dress in elegant ethnic or semi-ethnic attire. Sarees, salwar kameez, anarkali suits, lehengas, and Indo-Western fusion outfits are all appropriate for Indian wedding guests. The outfit choice also depends on the specific ceremony: a sangeet calls for fun and colorful outfits, while the main wedding ceremony warrants more formal and traditional looks. For non-Indian guests attending for the first time, a salwar kameez or anarkali suit is an easy, elegant, and culturally respectful choice.',
  },
  {
    question: 'How is this different from Guest Wedding Dresses?',
    answer: 'Wedding Guest Outfits is a guide-style shopping page for the full wedding weekend. Guest Wedding Dresses is broader silhouette shopping across dresses, gowns, sarees, lehengas, and suits.',
  },
  {
    question: 'What colors should a wedding guest avoid at an Indian wedding?',
    answer: 'At Indian weddings, guests traditionally avoid wearing white and very bridal red unless the couple or dress code says otherwise. Black was once considered inauspicious but is now widely worn at modern Indian wedding receptions and evening events. As a general rule, avoid outfits that could be mistaken for the bridal ensemble. Pink, teal, gold, purple, green, and blue are all excellent choices for wedding guests.',
  },
  {
    question: 'Should I wear a saree or salwar kameez to an Indian wedding as a guest?',
    answer: 'Both are excellent choices for an Indian wedding guest. A saree is considered the most elegant and traditional option, and wearing one as a non-Indian guest is often appreciated as a sign of cultural respect. A salwar kameez or anarkali suit is easier to wear, more comfortable for all-day celebrations, and just as appropriate.',
  },
  {
    question: 'Do you ship Indian wedding guest outfits to the USA, Canada, and Australia?',
    answer: 'Yes, LuxeMia Boutique ships Indian wedding guest outfits to the USA, Canada, Australia, and worldwide. Free shipping on orders over $350 USD. For orders under $350, a flat shipping rate of $25 applies. All orders are fully tracked and insured. We recommend ordering 3-4 weeks before the wedding to ensure timely delivery.',
  },
  {
    question: 'Can I wear the same outfit to multiple events at an Indian wedding?',
    answer: 'Indian weddings typically span multiple ceremonies including mehendi, sangeet, haldi, the wedding ceremony, and the reception. Many guests wear a lighter, more colorful outfit for daytime ceremonies and reserve a more formal, heavily embroidered outfit for the main wedding or reception. If you can only buy one outfit, choose a semi-formal anarkali or salwar kameez that works across multiple ceremonies.',
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
              Dress for every Indian wedding ceremony, from the colorful mehendi and vibrant sangeet to the elegant wedding day and glamorous reception. LuxeMia Boutique&apos;s wedding guest collection features silk sarees, embroidered anarkali suits, festive lehengas, and salwar kameez sets in celebration-worthy fabrics and colors. Whether you are a close family member, a colleague, or attending an Indian wedding for the first time, this guide-style collection helps you compare outfits by occasion.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Shop <strong>wedding guest sarees</strong>, <strong>anarkali suits for Indian weddings</strong>, <strong>lehengas for wedding guests</strong>, <strong>salwar kameez for weddings</strong>, and <strong>Indo-Western outfits for receptions</strong>. Use this page for full wedding-weekend outfit planning. For dress-and-gown discovery, browse <Link to="/collections/wedding-guest-dresses" className="text-foreground underline underline-offset-2">Guest Wedding Dresses</Link>; for evening styling, compare <Link to="/collections/reception-outfits" className="text-foreground underline underline-offset-2">Reception Outfits</Link>.
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

        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-6 text-center">What to Wear to Each Indian Wedding Ceremony</h2>
            <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-1">Mehendi Ceremony</h3>
                <p>The mehendi is a daytime ceremony traditionally associated with yellow and green. Guests often wear bright salwar kameez, anarkali suits, or simple lehengas in yellow, lime green, orange, or floral prints. Avoid overly heavy outfits because the mehendi ceremony is casual and interactive.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Sangeet Night</h3>
                <p>The sangeet is an evening of music and dance, usually the most festive event of the wedding weekend. Embellished lehengas, sequin anarkalis, embroidered salwar suits, and Indo-Western fusion outfits work well. Bold colors, mirror work, and sequin details photograph beautifully at sangeet events.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Wedding Ceremony</h3>
                <p>The main wedding ceremony is the most formal event. Guests often choose silk sarees, embroidered anarkali gowns, formal lehengas, or sophisticated salwar kameez. Rich jewel tones, gold, and pastel shades are strong choices, while guests generally avoid looks that feel too bridal.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Reception</h3>
                <p>The reception is an evening cocktail-style event and the most flexible dress code. Semi-formal to formal ethnic or Indo-Western outfits are appropriate, including silk sarees, fusion gowns, formal anarkalis, reception lehengas, and polished suits.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Shop by Wedding Ceremony</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-guest-dresses"><Button variant="outline" size="sm">Guest Wedding Dresses</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/wedding-lehengas"><Button variant="outline" size="sm">Wedding Lehengas</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/wedding-guest-outfits-under-250"><Button variant="outline" size="sm">Under $250</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Suits</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Lehengas</Button></Link>
              <Link to="/menswear"><Button variant="outline" size="sm">Menswear</Button></Link>
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

