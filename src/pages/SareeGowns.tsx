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

const sareeGownsSeo = metadataToSEOHeadProps(getStaticPageMetadata('/collections/saree-gowns'));

const sareeGownIntentPattern = /\b(saree\s?gown|sari\s?gown|gown\s?saree|drape.?gown|draped\s?saree|pre.?draped|ready.?to.?wear|readymade|ready.?made|pre.?stitched|stitched\s?saree|lehenga\s?saree|saree\s?lehenga|cocktail|reception|sangeet|party|party wear|partywear|wedding guest|festive|festival|designer|sequins?|bead|beaded|embroider|embroidered|embroidery|zari|satin|georgette|chiffon|net|organza)\b/i;

const getSearchText = (product: ShopifyProduct): string => {
  const tags = product.node.tags ?? [];
  return [
    product.node.title,
    product.node.productType,
    product.node.description,
    ...tags,
  ].filter(Boolean).join(' ');
};

const sareeGownFaqs = [
  {
    question: 'What are saree gowns?',
    answer: 'Saree gowns blend the elegance of a saree with the structure and ease of a gown. They may include pre-draped sarees, ready-to-wear sarees, stitched saree gowns, lehenga sarees, or draped gown silhouettes for receptions, parties, sangeet nights, and wedding guest occasions.',
  },
  {
    question: 'Are saree gowns good for Indian wedding guests?',
    answer: 'Yes. Saree gowns are a strong option for Indian wedding guests because they look polished while being easier to manage than a traditional drape. They work especially well for receptions, cocktail events, engagement parties, sangeet nights, and formal family celebrations.',
  },
  {
    question: 'What is the difference between a saree gown and a regular saree?',
    answer: 'A regular saree is usually draped from an unstitched length of fabric, while a saree gown or ready-to-wear saree is structured to be worn more like a dress. Saree gowns can reduce pleating, pinning, and draping time while keeping the visual effect of a saree.',
  },
  {
    question: 'Can saree gowns be worn for parties and receptions?',
    answer: 'Yes. Party wear saree gowns, cocktail saree gowns, and reception saree gowns are designed for evening events where movement, comfort, and a dressier silhouette matter. Embroidery, sequins, bead work, satin, georgette, chiffon, net, and organza can make the look more formal.',
  },
  {
    question: 'Which fabrics are common in saree gowns?',
    answer: 'Saree gowns often use satin, georgette, chiffon, net, organza, silk blends, and embellished fabrics. Flowing fabrics help create the draped saree effect, while sequins, zari, embroidery, bead work, and structured blouse details can make the outfit feel event-ready.',
  },
  {
    question: 'How do I choose saree gowns online?',
    answer: 'Start with the occasion, drape style, sleeve and blouse comfort, fabric, embellishment level, size, stitching needs, and delivery timeline. Review product photos, measurements, lining, blouse details, care notes, and shipping estimates before ordering saree gowns online.',
  },
];

const SareeGowns = () => {
  const { products, isLoading } = useShopifyPaginatedProducts('sarees');
  const [sortBy, setSortBy] = useState('featured');

  const sareeGownMatches = useMemo(
    () => products.filter(product => sareeGownIntentPattern.test(getSearchText(product))),
    [products]
  );
  const isUsingFallback = !isLoading && products.length > 0 && sareeGownMatches.length < 8;
  const sareeGownProducts = isUsingFallback ? products : sareeGownMatches;
  const sortedProducts = useMemo(() => sortProducts(sareeGownProducts, sortBy), [sareeGownProducts, sortBy]);
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
        {...sareeGownsSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: 'Saree Gowns', url: '/collections/saree-gowns' },
        ]}
        collection={{
          name: 'Saree Gowns',
          description: 'Saree gowns collection for ready-to-wear saree gowns, pre-draped saree gowns, designer saree gowns, wedding guest saree gowns, party wear saree gowns, reception saree gowns, and Indian fusion saree dresses.',
          items: collectionItems,
        }}
        faqs={sareeGownFaqs}
      />
      <Header />

      <main className="pt-[88px] lg:pt-[130px]">
        <section className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Ready-to-Wear Saree Gown Collection</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Saree Gowns</h1>
            <p className="text-muted-foreground font-light max-w-3xl mx-auto text-sm lg:text-base leading-relaxed">
              Shop saree gowns and ready-to-wear saree gowns for receptions, cocktail parties, sangeet nights, festive dinners, and Indian wedding guest occasions. This edit focuses on pre-draped saree gowns, designer saree gowns, party wear saree gowns, reception saree gowns, and Indian fusion saree dresses for shoppers in the USA, Canada, Australia, and worldwide.
            </p>
          </div>
        </section>

        <section className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Explore <strong>saree gowns</strong>, <strong>ready-to-wear saree gowns</strong>, <strong>pre-draped saree gowns</strong>, <strong>designer saree gowns</strong>, <strong>wedding guest saree gowns</strong>, <strong>party wear saree gowns</strong>, <strong>reception saree gowns</strong>, and <strong>Indian fusion saree dresses</strong>. For broader drape styles, visit the full <Link to="/sarees" className="text-foreground underline underline-offset-2">saree collection</Link>.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedProducts.length} saree gowns`}
              </p>
              {isUsingFallback && (
                <p className="text-xs text-muted-foreground mt-1">
                  Showing all sarees while saree gown product signals are limited.
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
                <h3 className="font-serif text-2xl mb-4">Saree Gowns Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  The saree gown edit is being curated. Explore all sarees for ready-to-wear, designer, festive, reception, and wedding guest drape styles.
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
            <h2 className="font-serif text-2xl mb-6 text-center">How This Saree Gown Collection Is Different</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-medium text-foreground mb-2">Built for saree gown intent</h3>
                <p>
                  This page is focused on saree gowns rather than every saree style. It highlights ready-to-wear saree gowns, pre-draped sarees, designer saree gowns, lehenga sarees, and Indian fusion saree dresses.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Reception and party focused</h3>
                <p>
                  Saree gown shoppers often compare drape ease, blouse structure, sleeve coverage, embellishment, fabric movement, and delivery timing. This collection keeps reception, cocktail, sangeet, party, and wedding guest decisions close to the product grid.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Drape and fabric aware</h3>
                <p>
                  Pre-draped saree gowns can feel easier for long events, while satin, georgette, chiffon, net, organza, sequins, zari, and embroidered fabrics can shift the look from festive to formal eveningwear.
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
            <h2 className="font-serif text-xl mb-6">Continue Saree and Occasion Shopping</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/sarees"><Button variant="outline" size="sm">All Sarees</Button></Link>
              <Link to="/collections/designer-sarees"><Button variant="outline" size="sm">Designer Sarees</Button></Link>
              <Link to="/collections/wedding-sarees"><Button variant="outline" size="sm">Wedding Sarees</Button></Link>
              <Link to="/collections/silk-sarees"><Button variant="outline" size="sm">Silk Sarees</Button></Link>
              <Link to="/collections/reception-outfits"><Button variant="outline" size="sm">Reception Outfits</Button></Link>
              <Link to="/collections/wedding-guest-outfits"><Button variant="outline" size="sm">Wedding Guest Outfits</Button></Link>
              <Link to="/collections/indo-western-dresses"><Button variant="outline" size="sm">Indo Western Dresses</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Saree Gowns</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {sareeGownFaqs.map((faq, i) => (
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

export default SareeGowns;
