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
    answer: 'Guest wedding dresses for Indian weddings include celebration-ready sarees, lehengas, Anarkali suits, saree gowns, salwar kameez, sharara sets, palazzo suits, and Indo-Western outfits. The best choice depends on the ceremony, dress code, comfort, fabric, and how formal the event feels.',
  },
  {
    question: 'How is this page different from Wedding Guest Outfits?',
    answer: 'Guest Wedding Dresses is a broad shopping page for dressy guest silhouettes. Wedding Guest Outfits is more of an occasion guide for choosing outfits across each wedding ceremony.',
  },
  {
    question: 'Can wedding guests wear lehengas, sarees, or gowns?',
    answer: 'Yes. Wedding guest lehengas, sarees, saree gowns, Anarkali gowns, and Indo-Western dresses are all appropriate for many Indian wedding events. Lighter styles often suit mehendi, haldi, and daytime functions, while embellished sarees, gowns, and lehengas can work well for sangeet nights, receptions, and formal ceremonies.',
  },
  {
    question: 'What colors work well for Indian wedding guest dresses?',
    answer: 'Jewel tones, pastels, metallic accents, greens, blues, pinks, purples, teal, gold, and festive prints are popular for Indian wedding guest outfits. Many guests avoid looks that feel too bridal for the specific wedding, especially heavily bridal red outfits, unless the couple or dress code suggests otherwise.',
  },
  {
    question: 'Which guest wedding dress is easiest to wear for a first Indian wedding?',
    answer: 'For a first Indian wedding, an Anarkali suit, salwar kameez, palazzo suit, pre-draped saree, or saree gown can feel easier to manage than a traditional saree drape. These options still look polished while offering comfort for long ceremonies, dancing, and reception events.',
  },
  {
    question: 'How should I choose an Indian wedding guest outfit online?',
    answer: 'Start with the ceremony, venue, time of day, expected formality, size, stitching needs, sleeve and neckline comfort, fabric weight, and delivery timing. Review product photos, measurements, fabric notes, blouse or dupatta details, and care instructions before ordering.',
  },
  {
    question: 'Can the same wedding guest dress work for multiple events?',
    answer: 'Often, yes. A polished Anarkali, saree gown, lehenga, or festive suit can be styled differently across events with jewelry, shoes, dupatta draping, and hair. For multi-day weddings, many guests still prefer lighter outfits for daytime events and dressier looks for sangeet or reception nights.',
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
              Shop guest wedding dresses for Indian wedding ceremonies, sangeet nights, receptions, mehendi events, engagement parties, and festive family celebrations. This edit brings together Indian wedding guest outfits, wedding guest lehengas, sarees, gowns, Anarkali suits, Indo-Western outfits, and polished festive occasion wear.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>guest wedding dresses</strong>, <strong>Indian wedding guest outfits</strong>, <strong>wedding guest lehengas</strong>, <strong>wedding guest sarees</strong>, <strong>saree gowns</strong>, <strong>Anarkali gowns</strong>, <strong>Indo-Western dresses</strong>, and <strong>festive occasion wear</strong>. For ceremony-by-ceremony advice, visit <Link to="/collections/wedding-guest-outfits" className="text-foreground underline underline-offset-2">Wedding Guest Outfits</Link>. For evening cocktail styling, compare <Link to="/collections/reception-outfits" className="text-foreground underline underline-offset-2">Reception Outfits</Link>.
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

        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-2xl mb-6 text-center">How This Guest Wedding Dress Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for wedding guest intent</h3>
                <p>
                  This page is focused on guest wedding dresses rather than one silhouette. It highlights Indian wedding guest outfits across lehengas, sarees, gowns, Anarkali suits, festive suits, and Indo-Western dresses.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Ceremony and reception aware</h3>
                <p>
                  Wedding guests often compare formality, movement, fabric weight, sleeve comfort, dupatta styling, and jewelry plans across mehendi, sangeet, ceremony, and reception events.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Dressy without feeling bridal</h3>
                <p>
                  The goal is polished occasion wear that photographs beautifully without overwhelming the couple&apos;s dress code. Sarees, gowns, and lehengas can all work when color, embellishment, and styling feel guest-appropriate.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online shopping support for event planning</h3>
                <p>
                  Compare product photos, measurements, fabric notes, blouse or dupatta details, stitching options where available, and delivery timing before selecting an outfit for a wedding weekend.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Wedding Guest Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-lehengas"><Button variant="outline" size="sm">Wedding Lehengas</Button></Link>
              <Link to="/collections/party-wear-lehengas"><Button variant="outline" size="sm">Party Wear Lehengas</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/saree-gowns"><Button variant="outline" size="sm">Saree Gowns</Button></Link>
              <Link to="/collections/anarkali-gowns"><Button variant="outline" size="sm">Anarkali Gowns</Button></Link>
              <Link to="/lehengas"><Button variant="outline" size="sm">Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Suits</Button></Link>
              <Link to="/menswear"><Button variant="outline" size="sm">Menswear</Button></Link>
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

