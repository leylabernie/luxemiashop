import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';

const indowesternFaqs = [
  {
    question: 'What is Indo-Western fashion?',
    answer: 'Indo-Western fashion is a fusion style that blends traditional Indian elements — such as hand embroidery, zari work, mirror detailing, and Indian silhouettes — with Western cuts and contemporary tailoring. Popular Indo-Western styles include jacket lehengas, cape-style kurtas, dhoti pants with crop tops, anarkali gowns with western necklines, and fusion co-ord sets. The style bridges the gap between traditional Indian ethnic wear and modern Western aesthetics, making it ideal for women who want a contemporary look without giving up cultural roots.',
  },
  {
    question: 'What occasions are Indo-Western outfits suitable for?',
    answer: 'Indo-Western outfits are incredibly versatile. They are a top choice for cocktail parties, sangeet nights, reception dinners, Diwali parties, Eid celebrations, birthday parties, and festive gatherings. Many women also wear Indo-Western styles to corporate events, destination weddings, and even casual get-togethers where traditional Indian ethnic wear may feel too formal. The fusion design makes them appropriate for a wide range of social occasions across USA, Canada, and Australia.',
  },
  {
    question: 'Do you ship Indo-Western outfits to the USA, Canada, and Australia?',
    answer: 'Yes, LuxeMia ships Indo-Western dresses and fusion outfits to the USA, Canada, and Australia. We offer free shipping on orders over $350 USD. For orders under $350, a flat shipping rate of $25 applies. All orders are carefully packaged and include full tracking and insurance. Standard delivery takes 7–10 business days after dispatch from India.',
  },
  {
    question: 'What Indo-Western styles are trending right now?',
    answer: 'The most popular Indo-Western styles at LuxeMia include jacket lehengas (a traditional lehenga paired with a structured Western-style jacket), sharara sets with embroidered crop tops, cape-style anarkalis, palazzo suits with asymmetric kurtas, and fusion gowns with Indian embroidery. Dhoti-style pants paired with embellished blouses are also trending, as are co-ord sets that mix Indian fabrics like georgette and organza with modern silhouettes.',
  },
  {
    question: 'How are Indo-Western outfits priced compared to traditional ethnic wear?',
    answer: 'Indo-Western outfits at LuxeMia are competitively priced and typically fall in a similar range to our traditional ethnic wear collections. Prices vary based on fabric quality, embroidery detail, and embellishment work. You can find entry-level fusion pieces starting from $80–$120, and premium heavily-embroidered Indo-Western gowns and jacket lehengas from $200 upwards — significantly more affordable than Indian boutiques in the USA or Canada.',
  },
];

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const Indowestern = () => {
  const { products, isLoading } = useShopifyProducts('indowestern');
  const [sortBy, setSortBy] = useState('featured');

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Buy Indo-Western Dresses Online | Fusion Indian Outfits USA & Canada - LuxeMia"
        description="Buy indo-western dresses online at LuxeMia. Shop jacket lehengas, cape kurtas, fusion gowns & palazzo suits with Indian embroidery. Perfect for parties, sangeet & receptions. Free shipping to USA & Canada."
        canonical="https://luxemia.shop/indowestern"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Indo-Western', url: '/indowestern' },
        ]}
        faqs={indowesternFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        {/* Hero Banner */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Fusion Fashion</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-3">Indo-Western</h1>
            <p className="text-muted-foreground font-light max-w-xl mx-auto text-sm lg:text-base">
              Where Indian embroidery meets contemporary silhouettes. Shop jacket lehengas, cape kurtas, fusion gowns, and palazzo sets — perfect for sangeet nights, cocktail parties, and festive celebrations.
            </p>
          </div>
        </div>

        {/* Keyword-rich intro — helps Google understand page topic */}
        <div className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              LuxeMia's Indo-Western collection brings you the best of both worlds — authentic Indian fabrics like georgette, organza, silk, and velvet, tailored into modern Western cuts. Browse <strong>jacket lehengas</strong>, <strong>dhoti pants with crop tops</strong>, <strong>cape-style anarkalis</strong>, <strong>sharara co-ord sets</strong>, and <strong>embroidered fusion gowns</strong> sourced directly from artisan clusters in Surat, Jaipur, and Mumbai. Free shipping to <strong>USA</strong>, <strong>Canada</strong>, and <strong>Australia</strong> on orders over $350.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${sortedProducts.length} styles`}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-light">
                  Sort: {currentSort}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map(opt => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={sortBy === opt.value ? 'font-medium' : ''}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
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
            <div className="text-center py-20">
              <p className="text-muted-foreground font-light mb-4">No Indo-Western styles available right now.</p>
              <p className="text-sm text-muted-foreground">Check back soon — new fusion pieces arrive regularly.</p>
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
      </main>

      {/* FAQ Section */}
      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Indo-Western Fashion</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {indowesternFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Indowestern;
