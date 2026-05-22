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

const silkSareesSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/silk-sarees'));

const silkSareeIntentPattern = /\b(silk|banarasi|kanjivaram|kanchipuram|kanjeevaram|pattu|tissue|woven|weave|brocade|zari|soft silk|art silk|wedding|bridal|ceremony|festive)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const silkSareeFaqs = [
  {
    question: 'What types of silk sarees does LuxeMia carry?',
    answer: 'LuxeMia silk sarees may include Banarasi silk sarees, Kanjivaram and Kanchipuram silk sarees, tissue silk sarees, art silk sarees, soft silk sarees, zari sarees, and woven ceremonial drapes. Availability depends on the current collection and live Shopify inventory.',
  },
  {
    question: 'Are silk sarees good for weddings?',
    answer: 'Yes. Silk sarees are one of the strongest choices for Indian weddings because they hold structure, photograph beautifully, and feel ceremonial. Banarasi silk, Kanjivaram, Kanchipuram, pattu, tissue silk, and zari work sarees are especially common for brides, family members, and formal wedding guests.',
  },
  {
    question: 'What is the difference between Banarasi and Kanjivaram silk sarees?',
    answer: 'Banarasi silk sarees are known for brocade, zari motifs, and a North Indian wedding feel. Kanjivaram and Kanchipuram silk sarees are South Indian silk sarees known for rich color, heavier silk, and distinctive borders. Both can work for weddings, festivals, receptions, and heirloom dressing.',
  },
  {
    question: 'How do I choose silk sarees online?',
    answer: 'Start with the occasion, color preference, weight, border style, blouse needs, and delivery timeline. Review product photos, fabric details, work type, blouse information, and care instructions. If the saree is for a wedding date, allow extra time for blouse stitching and shipping.',
  },
  {
    question: 'Can silk sarees be worn for festivals and parties?',
    answer: 'Silk sarees work beautifully for Diwali, Navratri, Eid gatherings, pujas, family celebrations, receptions, and formal parties. Heavier woven silk and zari styles feel more ceremonial, while lighter soft silk, tissue, or art silk sarees can be easier for long events.',
  },
  {
    question: 'How should I care for a silk saree?',
    answer: 'Professional dry cleaning is recommended for most silk sarees. Store silk sarees in a cool, dry place, ideally wrapped in muslin or breathable fabric. Avoid direct sunlight, heavy perfume contact, and long-term plastic storage, and refold occasionally to reduce permanent crease marks.',
  },
];

const SilkSarees = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('sarees');
  const [sortBy, setSortBy] = useState('featured');

  const silkMatches = useMemo(
    () => products.filter(product => silkSareeIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && silkMatches.length < 8;
  const silkProducts = isUsingFallback ? products : silkMatches;
  const sortedProducts = useMemo(() => sortProducts(silkProducts, sortBy), [silkProducts, sortBy]);
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
        {...silkSareesSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Silk Sarees', url: '/collections/silk-sarees' },
        ]}
        collection={{
          name: 'Silk Sarees',
          description: 'Silk saree collection for Banarasi silk sarees, Kanjivaram silk sarees, Kanchipuram silk sarees, tissue silk sarees, pattu sarees, zari sarees, and wedding silk sarees.',
          items: collectionItems,
        }}
        faqs={silkSareeFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Silk and Woven Saree Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Silk Sarees</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop silk sarees selected for weddings, festivals, receptions, pujas, and heirloom-inspired Indian dressing. This collection focuses on Banarasi silk sarees, Kanjivaram and Kanchipuram silk sarees, tissue silk sarees, pattu sarees, zari sarees, soft silk sarees, and woven silk sarees for confident occasion shopping online.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>silk sarees online</strong>, <strong>Banarasi silk sarees</strong>, <strong>Kanjivaram silk sarees</strong>, <strong>Kanchipuram silk sarees</strong>, <strong>tissue silk sarees</strong>, <strong>pattu sarees</strong>, <strong>zari silk sarees</strong>, and <strong>wedding silk sarees</strong>. For broader drape styles, visit the full <Link to="/sarees" className="text-foreground underline underline-offset-2">saree collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} silk sarees`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all sarees while silk product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Silk Sarees Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The silk saree edit is being curated. Explore all sarees for Banarasi, Kanchipuram, wedding, festive, and designer drape styles.
                </p>
                <Button asChild variant="outline">
                  <Link to="/sarees">Explore All Sarees</Link>
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Silk Saree Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for silk saree intent</h3>
                <p>
                  This page is focused on silk sarees rather than every saree occasion. It highlights woven, zari, Banarasi, Kanjivaram, Kanchipuram, tissue, pattu, and ceremony-ready silk saree signals.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding and festival focused</h3>
                <p>
                  Silk saree shoppers often compare drape weight, zari work, border richness, blouse direction, color, and event formality. This collection keeps those wedding and festive decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Traditional and modern styling</h3>
                <p>
                  Rich silk sarees can suit brides, mothers of the bride or groom, family members, and formal wedding guests, while lighter silk and tissue styles can work for receptions, pujas, festivals, and parties.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online silk saree support</h3>
                <p>
                  LuxeMia supports silk saree shoppers with tracked shipping, blouse and fit options where available, and styling guidance before purchase. Review each product's fabric, stitching, and delivery details before ordering.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Silk Saree Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/sarees"><Button variant="outline" size="sm">All Sarees</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/designer-sarees"><Button variant="outline" size="sm">Designer Sarees</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Silk Sarees</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {silkSareeFaqs.map((faq, i) => (
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

export default SilkSarees;
