import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { metadataToSEOHeadProps } from '@/lib/seoHeadAdapter';
import { getStaticPageMetadata } from '@/lib/seoMetadata';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyPaginatedProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';
import type { ShopifyProduct } from '@/lib/shopify';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const lehengaCholiSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/lehenga-choli'));

const lehengaCholiIntentPattern = /\b(lehenga\s?choli|lehenga|choli|ghagra|ghagra\s?choli|designer|bridal|bride|wedding|wedding guest|party|party wear|partywear|festive|festival|diwali|navratri|garba|sangeet|mehendi|reception|embroider|embroidered|embroidery|sequins?|zari|zardozi|mirror.?work|silk|banarasi|georgette|net|organza|velvet|dupatta)\b/i;
const menswearIntentPattern = /\b(sherwani|kurta\s?pajama|pyjama|men'?s|menswear|groom|groomsmen|jodhpuri|modi\s?jacket|nehru\s?jacket|bandi|pathani|achkan|boys|for\s?men)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const lehengaCholiFaqs = [
  {
    question: 'What is a lehenga choli?',
    answer: 'A lehenga choli is a traditional Indian outfit made of a flared skirt called a lehenga, a fitted blouse called a choli, and often a matching dupatta. It is popular for weddings, receptions, sangeet nights, mehendi events, Diwali, Navratri, and festive celebrations.',
  },
  {
    question: 'Are lehenga choli outfits good for Indian weddings?',
    answer: 'Yes. Bridal lehenga choli, wedding lehenga choli, and designer lehenga choli styles are central to Indian wedding dressing. Brides often choose heavier embroidery, silk, zardozi, zari, sequins, or Banarasi fabrics, while guests may prefer lighter embroidered lehenga choli sets for sangeet, reception, mehendi, and ceremony looks.',
  },
  {
    question: 'What is included in a lehenga choli set?',
    answer: 'A lehenga choli set usually includes the lehenga skirt, choli blouse, and dupatta. Product details may vary by style, so review the listing for blouse fabric, lining, dupatta, cancan, stitching options, and any included accessories before ordering.',
  },
  {
    question: 'Can lehenga choli be worn for parties and festivals?',
    answer: 'Yes. Party wear lehenga choli and festive lehenga choli styles work well for receptions, cocktail events, engagement parties, Diwali, Navratri, Garba, Eid gatherings, and family celebrations. Lighter georgette or net styles can feel easy to move in, while silk, velvet, zari, and embroidered lehenga choli sets feel more formal.',
  },
  {
    question: 'Which fabrics are common in Indian lehenga choli?',
    answer: 'Indian lehenga choli styles commonly use silk, Banarasi, georgette, net, organza, velvet, satin, cotton silk, and blended fabrics. Silk lehenga choli and embroidered lehenga choli designs are often chosen for weddings, while lighter net, georgette, and organza styles suit parties and festive events.',
  },
  {
    question: 'How do I choose lehenga choli online?',
    answer: 'Start with the occasion, skirt volume, fabric, embroidery level, blouse comfort, dupatta style, size, stitching needs, and delivery timeline. Review product photos, measurements, choli details, lining, care notes, and shipping estimates before ordering lehenga choli for women online.',
  },
];

const LehengaCholi = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('lehengas');
  const [sortBy, setSortBy] = useState('featured');

  const lehengaCholiMatches = useMemo(
    () => products.filter(product => {
      const searchText = getSearchText(product);
      return lehengaCholiIntentPattern.test(searchText) && !menswearIntentPattern.test(searchText);
    }),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && lehengaCholiMatches.length < 8;
  const lehengaCholiProducts = isUsingFallback ? products : lehengaCholiMatches;
  const sortedProducts = useMemo(() => sortProducts(lehengaCholiProducts, sortBy), [lehengaCholiProducts, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

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
        {...lehengaCholiSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Lehenga Choli', url: '/collections/lehenga-choli' },
        ]}
        collection={{
          name: 'Lehenga Choli',
          description: 'Lehenga choli collection for designer lehenga choli, bridal lehenga choli, wedding lehenga choli, party wear lehenga choli, embroidered lehenga choli, silk lehenga choli, Indian lehenga choli, lehenga choli for women, and festive lehenga choli.',
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
              Shop lehenga choli and Indian lehenga choli styles for weddings, receptions, sangeet nights, mehendi events, parties, Diwali, Navratri, and festive celebrations. This collection focuses on designer lehenga choli, bridal lehenga choli, wedding lehenga choli, party wear lehenga choli, embroidered lehenga choli, silk lehenga choli, festive lehenga choli, and lehenga choli for women.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>lehenga choli</strong>, <strong>designer lehenga choli</strong>, <strong>bridal lehenga choli</strong>, <strong>wedding lehenga choli</strong>, <strong>party wear lehenga choli</strong>, <strong>embroidered lehenga choli</strong>, <strong>silk lehenga choli</strong>, <strong>Indian lehenga choli</strong>, <strong>lehenga choli for women</strong>, and <strong>festive lehenga choli</strong>. For broader skirt and dupatta styles, visit the full <Link to="/lehengas" className="text-foreground underline underline-offset-2">lehenga collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} lehenga choli styles`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all lehengas while lehenga choli product signals are limited.
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {currentSort} <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map(opt => (
                  <DropdownMenuItem key={opt.value} onClick={() => setSortBy(opt.value)} className={sortBy === opt.value ? 'font-medium' : ''}>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-sm mb-4" />
                  <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-2xl mb-4">Lehenga Choli Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The lehenga choli edit is being curated. Explore all lehengas for bridal lehengas, wedding lehengas, party wear lehengas, festive outfits, and reception styles.
                </p>
                <Button asChild variant="outline">
                  <Link to="/lehengas">Explore All Lehengas</Link>
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </section>

        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-2xl mb-6 text-center">How This Lehenga Choli Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for lehenga choli intent</h3>
                <p>
                  This page is focused on lehenga choli rather than every lehenga style. It highlights designer lehenga choli, bridal lehenga choli, wedding lehenga choli, party wear lehenga choli, and Indian lehenga choli for women.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding, bridal, and festive focused</h3>
                <p>
                  Lehenga choli shoppers often compare skirt volume, choli coverage, dupatta styling, fabric, embroidery, stitching needs, and delivery timing. This collection keeps those bridal, wedding guest, sangeet, reception, and festive decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Fabric and embroidery aware</h3>
                <p>
                  Silk lehenga choli and embroidered lehenga choli designs can feel richer for weddings, while georgette, net, organza, and lighter embellished styles work well for party wear, festive events, and dancing through long celebrations.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online shopping support for NRIs</h3>
                <p>
                  LuxeMia supports shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, stitching options where available, and styling guidance before purchase. Review each product's sizing, stitching, and delivery details before ordering.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Lehenga and Occasion Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">All Lehengas</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/party-wear-lehengas"><Button variant="outline" size="sm">Party Wear Lehengas</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/mehendi-outfits"><Button variant="outline" size="sm">Mehendi Outfits</Button></Link>
              <Link to="/collections/navratri-outfits"><Button variant="outline" size="sm">Navratri Outfits</Button></Link>
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
