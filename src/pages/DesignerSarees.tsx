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

const designerSareesSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/designer-sarees'));

const designerSareeIntentPattern = /\b(designer|boutique|party|party wear|partywear|wedding guest|wedding wear|weddingwear|festive|festival|reception|cocktail|sangeet|embroider|embroidered|embroidery|sequins?|bead|beaded|zari|silk|georgette|chiffon|organza|tissue|ready.?to.?wear|occasion)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const designerSareeFaqs = [
  {
    question: 'What makes a saree a designer saree?',
    answer: 'A designer saree usually combines a distinctive fabric, color story, border, blouse direction, or embellishment detail with event-ready styling. LuxeMia designer sarees may include embroidery, sequins, zari, silk, georgette, chiffon, organza, tissue, or boutique-inspired drapes for parties, weddings, festivals, and formal events.',
  },
  {
    question: 'Can designer sarees be worn for weddings and parties?',
    answer: 'Yes. Designer sarees are versatile for wedding guests, receptions, sangeet nights, cocktail events, festive gatherings, and family celebrations. Choose heavier embroidery or silk for formal events, and lighter georgette, chiffon, organza, or ready-to-drape styles for parties and longer wear.',
  },
  {
    question: 'Which fabrics are best for designer sarees?',
    answer: 'Silk, georgette, chiffon, organza, tissue, satin, and net are common designer saree fabrics. Silk and tissue feel more ceremonial, while georgette and chiffon are easier for movement. Embroidered and sequined sarees work well for evening parties, receptions, and festive occasions.',
  },
  {
    question: 'How do I choose designer sarees online?',
    answer: 'Start with the occasion, comfort level, blouse needs, delivery timeline, and styling preference. Review product photos, fabric, work type, border details, blouse information, and care instructions. If your event date is close, prioritize styles with clear availability and contact LuxeMia for fit or styling guidance.',
  },
  {
    question: 'Are designer sarees good for wedding guests?',
    answer: 'Designer sarees are a strong choice for Indian wedding guests because they feel polished without needing a bridal look. Wedding guest sarees in silk, georgette, chiffon, organza, and embroidered fabrics can work across ceremonies, receptions, engagement parties, and sangeet events.',
  },
  {
    question: 'Do designer sarees include blouse stitching?',
    answer: 'Blouse and stitching options depend on the individual product. Review each product page for blouse fabric, stitching, sizing, and delivery details before ordering. For event shopping, allow extra time for tailoring when a blouse or custom fit option is selected.',
  },
];

const DesignerSarees = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('sarees');
  const [sortBy, setSortBy] = useState('featured');

  const designerMatches = useMemo(
    () => products.filter(product => designerSareeIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && designerMatches.length < 8;
  const designerProducts = isUsingFallback ? products : designerMatches;
  const sortedProducts = useMemo(() => sortProducts(designerProducts, sortBy), [designerProducts, sortBy]);
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
        {...designerSareesSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Designer Sarees', url: '/collections/designer-sarees' },
        ]}
        collection={{
          name: 'Designer Sarees',
          description: 'Designer saree collection for Indian designer sarees online, party wear designer sarees, wedding guest sarees, festive designer sarees, embroidered sarees, silk sarees, georgette sarees, chiffon sarees, and boutique sarees.',
          items: collectionItems,
        }}
        faqs={designerSareeFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Designer and Boutique Saree Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Designer Sarees</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop designer sarees selected for parties, wedding guest looks, receptions, festive celebrations, sangeet nights, and polished Indian event dressing. This collection focuses on Indian designer sarees online, party wear designer sarees, boutique sarees, embroidered sarees, silk sarees, georgette sarees, and chiffon sarees for confident occasion shopping.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>designer sarees</strong>, <strong>Indian designer sarees online</strong>, <strong>party wear designer sarees</strong>, <strong>wedding guest sarees</strong>, <strong>festive designer sarees</strong>, <strong>embroidered sarees</strong>, <strong>silk sarees</strong>, <strong>georgette sarees</strong>, <strong>chiffon sarees</strong>, and <strong>boutique sarees</strong>. For broader drape styles, visit the full <Link to="/sarees" className="text-foreground underline underline-offset-2">saree collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} designer sarees`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all sarees while designer product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Designer Sarees Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The designer saree edit is being curated. Explore all sarees for silk, georgette, chiffon, festive, and wedding guest styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Designer Saree Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for designer saree intent</h3>
                <p>
                  This page is focused on designer sarees rather than every saree occasion. It highlights event-ready sarees for parties, weddings, receptions, festivals, sangeet nights, and boutique-inspired Indian dressing.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Fabric and detail focused</h3>
                <p>
                  Designer saree shoppers often compare fabric, border, blouse direction, embroidery, sequins, zari, and drape comfort. Look for silk, georgette, chiffon, organza, tissue, and embroidered sarees depending on the event.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Party, festive, and guest styling</h3>
                <p>
                  Indian designer sarees can work for wedding guests, family members, reception outfits, cocktail events, and festive celebrations. More embellished styles suit evening events, while lighter fabrics are easier for long functions.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online saree shopping support</h3>
                <p>
                  LuxeMia supports designer saree shoppers with tracked shipping, blouse and fit options where available, and styling guidance before purchase. Review each product's fabric, stitching, and delivery details before ordering.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Designer Saree Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/sarees"><Button variant="outline" size="sm">All Sarees</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/diwali-outfits"><Button variant="outline" size="sm">Diwali Outfits</Button></Link>
              <Link to="/collections/party-wear-lehengas"><Button variant="outline" size="sm">Party Wear Lehengas</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Designer Sarees</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {designerSareeFaqs.map((faq, i) => (
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

export default DesignerSarees;
