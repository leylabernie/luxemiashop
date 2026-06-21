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

const designerLehengasSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/designer-lehengas'));

const designerLehengaIntentPattern = /\b(designer|couture|boutique|luxury|premium|bridal|bride|wedding|wedding guest|wedding wear|weddingwear|reception|sangeet|engagement|cocktail|party|party wear|partywear|embroider|embroidered|embroidery|sequins?|bead|beaded|zari|zardozi|mirror.?work|silk|banarasi|georgette|net|organza|velvet|dupatta|lehenga\s?choli)\b/i;
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

const designerLehengaFaqs = [
  {
    question: 'What makes a lehenga a designer lehenga?',
    answer: 'A designer lehenga usually has a more considered fabric, silhouette, color story, blouse direction, dupatta styling, or embellishment detail than a basic festive lehenga. LuxeMia Boutique designer lehengas may include embroidery, zari, sequins, mirror work, silk, georgette, net, organza, velvet, or couture-inspired styling for weddings, receptions, and special events.',
  },
  {
    question: 'Are designer lehengas only for brides?',
    answer: 'No. Designer lehengas include bridal-adjacent designer lehengas, reception lehengas, sangeet lehengas, and wedding guest lehengas. Brides may choose heavier ceremonial styles, while sisters, cousins, bridesmaids, and guests often choose polished embroidered lehengas that feel special without looking fully bridal.',
  },
  {
    question: 'Can I wear a designer lehenga to a reception or wedding guest event?',
    answer: 'Yes. Designer lehenga choli styles are popular for receptions, sangeet nights, cocktail events, engagement parties, and wedding guest looks. For long events or dancing, many shoppers prefer georgette, net, organza, silk blends, lighter embroidery, sequins, or mirror work with comfortable blouse and dupatta styling.',
  },
  {
    question: 'Which fabrics and work are common in Indian designer lehengas?',
    answer: 'Indian designer lehengas commonly use silk, Banarasi, georgette, net, organza, velvet, satin, and blended fabrics. Embroidered lehengas may include zari, zardozi, sequins, beads, mirror work, thread work, or metallic details depending on how formal the event is.',
  },
  {
    question: 'How do I choose designer lehengas online?',
    answer: 'Start with the occasion, role, comfort level, fabric, embroidery weight, blouse coverage, dupatta styling, size, stitching options, and delivery timeline. Review product photos, measurements, work details, lining, and care notes before ordering, especially for a wedding or reception date.',
  },
  {
    question: 'Does LuxeMia Boutique ship designer lehengas internationally?',
    answer: 'Yes. LuxeMia Boutique supports shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, fit options where available, and styling guidance before purchase. Check each product listing for sizing, stitching, and delivery details before ordering.',
  },
];

const DesignerLehengas = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('lehengas');
  const [sortBy, setSortBy] = useState('featured');

  const designerMatches = useMemo(
    () => products.filter(product => {
      const searchText = getSearchText(product);
      return designerLehengaIntentPattern.test(searchText) && !menswearIntentPattern.test(searchText);
    }),
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
        {...designerLehengasSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Designer Lehengas', url: '/collections/designer-lehengas' },
        ]}
        collection={{
          name: 'Designer Lehengas',
          description: 'Designer lehenga collection for designer lehengas, designer lehenga choli, Indian designer lehengas, embroidered lehengas, luxury lehenga styles, bridal-adjacent designer lehengas, reception lehengas, wedding guest lehengas, and couture-inspired lehengas.',
          items: collectionItems,
        }}
        faqs={designerLehengaFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Designer Lehenga Choli Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Designer Lehengas</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop designer lehengas selected for Indian weddings, receptions, sangeet nights, engagement events, bridal-adjacent styling, and polished wedding guest looks. This collection focuses on designer lehenga choli, Indian designer lehengas, embroidered lehengas, luxury lehenga styles, reception lehengas, wedding guest lehengas, and couture-inspired lehengas for confident occasion shopping.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>designer lehengas</strong>, <strong>designer lehenga choli</strong>, <strong>Indian designer lehengas</strong>, <strong>embroidered lehengas</strong>, <strong>luxury lehenga styles</strong>, <strong>bridal-adjacent designer lehengas</strong>, <strong>reception lehengas</strong>, <strong>wedding guest lehengas</strong>, and <strong>couture-inspired lehengas</strong>. For the full category, visit the <Link to="/lehengas" className="text-foreground underline underline-offset-2">lehenga collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} designer lehengas`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all lehengas while designer product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Designer Lehengas Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The designer lehenga edit is being curated. Explore all lehengas for bridal, reception, sangeet, party wear, and wedding guest styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Designer Lehenga Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for designer lehenga intent</h3>
                <p>
                  This page is focused on designer lehengas rather than every lehenga style. It highlights designer lehenga choli, Indian designer lehengas, embroidered lehengas, luxury lehenga styles, and couture-inspired lehengas for elevated occasion shopping.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Wedding, reception, and guest ready</h3>
                <p>
                  Designer lehenga shoppers often compare embroidery, skirt volume, blouse coverage, dupatta styling, comfort, and delivery timing. This collection keeps bridal-adjacent, reception, sangeet, and wedding guest decisions close to the shopping path.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Fabric and detail focused</h3>
                <p>
                  Silk, velvet, net, georgette, Banarasi, organza, zari, zardozi, sequins, mirror work, beadwork, and thread embroidery can all shape how formal a designer lehenga feels. Choose heavier details for ceremonies and lighter movement-friendly styles for receptions or sangeet nights.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Online designer shopping support</h3>
                <p>
                  LuxeMia Boutique supports designer lehenga shoppers in the USA, Canada, Australia, and worldwide with tracked shipping, fit options where available, and styling guidance before purchase. Review sizing, stitching, and delivery details before ordering for a specific event date.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Continue Designer Lehenga Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">All Lehengas</Button></Link>
              <Link to="/collections/lehenga-choli"><Button variant="outline" size="sm">Lehenga Choli</Button></Link>
              <Link to="/collections/bridal-lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/collections/wedding-lehengas"><Button variant="outline" size="sm">Wedding Lehengas</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/party-wear-lehengas"><Button variant="outline" size="sm">Party Wear Lehengas</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Designer Lehengas</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {designerLehengaFaqs.map((faq, i) => (
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

export default DesignerLehengas;
