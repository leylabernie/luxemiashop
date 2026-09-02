import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RelatedOccasions from '@/components/seo/RelatedOccasions';
import SEOHead from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import ProductCard from '@/components/ui/ProductCard';
import { sortProducts } from '@/lib/productFilters';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const diwaliOutfitFaqs = [
  {
    question: 'Which products appear in this Diwali collection?',
    answer: 'This page shows currently available products whose catalog title, product type, or tags explicitly mention Diwali, festive, or festival. Open a product page for its exact fabric, work, included pieces, sizes, price, and availability.',
  },
  {
    question: 'How should I choose a color?',
    answer: 'Follow the guidance for your specific gathering, host, family, or community because customs and dress expectations vary. Product images and listed color options are the source of truth for each item.',
  },
  {
    question: 'How do I compare a saree, lehenga, and suit?',
    answer: 'Compare the exact listing for included pieces, fabric, embellishment, available sizes, and current price. Choose the silhouette you can wear comfortably for the activities and venue described by your host.',
  },
  {
    question: 'Do you ship Diwali outfits to the United States?',
    answer: 'LuxeMia ships Diwali outfits to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Standard shipping is free at $199 and above and $14.99 below $199. Confirm timing before ordering for a fixed celebration date.',
  },
  {
    question: 'How do I check what is included?',
    answer: 'Use the included-pieces details and images on the exact product page. Jewelry and accessories are not included unless the listing states that they are.',
  },
];

const DiwaliOutfits = () => {
  const { products, isLoading } = useShopifyProducts('occasion:diwali');
  const [sortBy, setSortBy] = useState('featured');
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Diwali Outfits — Current Festive Listings | LuxeMia"
        description="Browse currently available LuxeMia products explicitly marked for Diwali or festive occasions. Review exact product details and U.S. shipping terms."
        canonical="https://luxemia.shop/collections/diwali-outfits"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Occasions', url: '/collections' },
          { name: 'Diwali Outfits', url: '/collections/diwali-outfits' },
        ]}
        faqs={diwaliOutfitFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Festival of Lights</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Diwali Outfits</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Browse currently available products explicitly marked in the catalog for Diwali or festive occasions. Each product page is the source of truth for fabric, work, included pieces, sizes, price, and availability. LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius.
            </p>
          </div>
        </div>

        {/* Keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Products appear here only when their current catalog title, product type, or tags explicitly mention Diwali, festive, or festival. Open the exact listing to confirm every product detail before ordering.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border/30 bg-background sticky top-[90px] lg:top-[132px] z-30">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading…' : `${sortedProducts.length} festive styles`}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-sm font-light">
                  Sort: {currentSort} <ChevronDown className="w-4 h-4" />
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
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </section>

        {/* About section */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-6 text-center">How to Choose a Diwali Outfit</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Start with the dress guidance for your specific gathering. Practices differ among families, communities, venues, and event formats, so the host or organizer is the best source for color and formality expectations.</p>
              <p>Compare the current listings above by silhouette, fabric, included pieces, available sizes, price, and availability. Product images and options on the exact listing are authoritative; collection text does not add tailoring, accessories, or pieces that the listing does not state.</p>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Check the Exact Listing</h3>
                <p>Review fabric or material, work, included pieces, size options, measurements, and current availability. If any detail is absent or unclear, contact LuxeMia before ordering.</p>
                <p className="mt-2">For more practical ideas for celebrating abroad, read our <Link to="/blog/styling-indian-ethnic-wear-festive-occasions-abroad" className="text-primary underline font-medium">festive Indian outfit styling guide</Link>.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Color and Dress Guidance</h3>
                <p>Do not rely on a universal color rule. Follow the invitation and ask the host or family when the expected dress or color palette is unclear.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">When to Order Your Diwali Outfit</h3>
                <p>For a fixed event or festival date, review the selected product and options, then contact LuxeMia before ordering to confirm timing. LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius, with tracking after dispatch.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Related Guides</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><Link to="/blog/styling-indian-ethnic-wear-festive-occasions-abroad" className="text-primary underline">Festive Indian Outfit Styling Guide</Link></li>
                  <li><Link to="/collections/navratri-outfits" className="text-primary underline">Navratri Outfits</Link></li>
                  <li><Link to="/blog/wedding-guest-outfit-ideas" className="text-primary underline">Indian Wedding Guest Outfit Guide 2026</Link></li>
                  <li><Link to="/lehengas" className="text-primary underline">Shop Lehengas</Link> | <Link to="/sarees" className="text-primary underline">Shop Sarees</Link> | <Link to="/suits" className="text-primary underline">Shop Anarkali Suits</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related collections */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">More Festive Collections</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">Bridal Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Silk Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Anarkali Suits</Button></Link>
              <Link to="/indowestern"><Button variant="outline" size="sm">Indo-Western</Button></Link>
              <Link to="/collections/eid-outfits"><Button variant="outline" size="sm">Eid Outfits</Button></Link>
              <Link to="/collections/navratri-outfits"><Button variant="outline" size="sm">Navratri Outfits</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Diwali Outfits</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {diwaliOutfitFaqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-background border border-border rounded-lg px-5">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <RelatedOccasions currentOccasion="diwali" />

      <Footer />
    </div>
  );
};

export default DiwaliOutfits;
