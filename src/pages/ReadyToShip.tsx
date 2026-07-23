import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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

const readyToShipFaqs = [
  {
    question: 'How fast is ready-to-ship delivery?',
    answer: 'Ready-to-ship items dispatch from our warehouse in 3-5 business days after your order is placed. Transit time to the USA is 7-10 business days via tracked international shipping. That means your total door-to-door delivery time is approximately 10-15 business days — significantly faster than made-to-order items which require 3-4 weeks for stitching plus shipping. If you have an upcoming event and need your outfit quickly, ready-to-ship is the best option.',
  },
  {
    question: 'Do ready-to-ship items qualify for free shipping?',
    answer: 'Yes, absolutely. Ready-to-ship items qualify for free shipping on all orders over $350 USD, the same policy that applies to all LuxeMia products. For orders under $350, flat rate shipping of $25 applies. This makes ready-to-ship items even more economical — you get fast delivery AND free shipping when you order $350 or more.',
  },
  {
    question: 'What is the difference between ready-to-ship and made-to-order?',
    answer: 'Ready-to-ship items are already stitched, finished, and sitting in our warehouse ready to dispatch. They ship in 3-5 business days and are available in standard sizes (XS, S, M, L, XL, XXL). Made-to-order items are stitched to your exact measurements after you place your order, which takes 5-7 business days for stitching plus 7-10 days shipping (total 12-17 business days). Ready-to-ship offers speed and convenience; made-to-order offers a more precise custom fit.',
  },
  {
    question: 'Can I get custom sizing on ready-to-ship items?',
    answer: 'Some ready-to-ship items offer custom alterations. While the base garment is pre-stitched in standard sizing, we can often accommodate minor adjustments such as hem length, blouse fitting, or sleeve length at no extra charge. For significant sizing changes, we recommend choosing a made-to-order option instead. Contact us before ordering with your measurements and we will advise whether the ready-to-ship item can be altered to fit you, or email us at hello@luxemia.shop.',
  },
];

const ReadyToShip = () => {
  const { products, isLoading } = useShopifyProducts();
  const [sortBy, setSortBy] = useState('featured');

  // Filter products by "ready-to-ship" tag
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const tags = (p.node.tags ?? []).map((t: string) => t.toLowerCase());
      return tags.some((t: string) => t.includes('ready-to-ship') || t.includes('ready to ship'));
    });
  }, [products]);

  const sortedProducts = useMemo(() => sortProducts(filteredProducts, sortBy), [filteredProducts, sortBy]);
  const currentSort = sortOptions.find(o => o.value === sortBy)?.label || 'Featured';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Ready to Ship Indian Wear | Fast USA Delivery | LuxeMia"
        description="Shop ready-to-ship Indian ethnic wear with fast USA delivery. Lehengas, sarees, suits & menswear. Free shipping over $350. Dispatch in 3-5 days."
        canonical="https://luxemia.shop/ready-to-ship"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Ready to Ship', url: '/ready-to-ship' },
        ]}
        faqs={readyToShipFaqs}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">

        {/* Hero */}
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Fast Delivery — In Stock Now</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-4">Ready to Ship Indian Ethnic Wear — Fast USA Delivery</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
              Need an outfit in a hurry? Shop our <strong>ready-to-ship Indian wear</strong> collection — pre-stitched lehengas, sarees, salwar kameez suits, and menswear that dispatch in 3-5 business days. Every piece is quality-checked, beautifully packaged, and shipped with full tracking to the USA, Canada, and Australia. Perfect for last-minute events, wedding functions, and festival celebrations when you need <strong>fast delivery Indian clothes in the USA</strong>.
            </p>
          </div>
        </div>

        {/* H2 + keyword intro */}
        <div className="bg-background border-b border-border/20 py-5">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <h2 className="font-serif text-xl lg:text-2xl mb-3 text-center">Shop In-Stock Lehengas, Sarees, Suits & Menswear with 3-5 Day Shipping</h2>
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              Browse <strong>in stock lehengas in the USA</strong>, ready-to-wear sarees, <strong>ready to ship Indian wear</strong>, <strong>fast delivery Indian clothes USA</strong>, and pre-stitched salwar kameez sets. All items ship from our warehouse in 3-5 business days with tracked international delivery. Free shipping on orders over $350.
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
          ) : sortedProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm mb-4">No ready-to-ship items available right now. Check back soon or browse our full collection.</p>
              <Link to="/collections"><Button variant="outline" size="sm">View All Collections</Button></Link>
            </div>
          )}
        </section>

        {/* About section — editorial content targeting keywords */}
        <section className="border-t border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl mb-6 text-center">Why Shop Ready to Ship Indian Wear?</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>Shopping for <strong>ready to ship Indian wear</strong> is the smartest choice when you have an event coming up and need your outfit fast. Unlike made-to-order items that require 3-4 weeks for stitching, our ready-to-ship collection features pre-stitched garments that dispatch from our warehouse in just 3-5 business days. Combined with 7-10 day tracked shipping to the USA, you can have your outfit delivered to your door in as little as 10-15 business days.</p>
              <p><strong>Fast delivery Indian clothes in the USA</strong> don't mean compromising on quality. Every ready-to-ship item at LuxeMia undergoes the same rigorous quality checks as our custom-stitched pieces. From hand-embroidered bridal lehengas to lightweight georgette sarees, our in-stock inventory includes the same designer styles, premium fabrics, and intricate craftsmanship that LuxeMia is known for — just ready to go immediately.</p>
              <p>Our <strong>in stock lehengas in the USA</strong> are particularly popular for last-minute wedding guests, bridesmaids, and anyone who needs a beautiful ethnic outfit without the wait. Available in standard sizes from XS to XXL, these lehengas feature popular designs including mirror work, gota patti, zardozi embroidery, and modern pastel palettes that are trending for 2026 Indian weddings.</p>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">What's in Our Ready-to-Ship Collection?</h3>
                <p>Our ready-to-ship inventory rotates regularly and includes a curated selection across all categories:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Lehengas</strong> — Bridal, reception, mehendi, and party-wear lehengas in sizes XS-XXL</li>
                  <li><strong>Sarees</strong> — Silk, georgette, organza, and ready-to-wear pre-draped sarees</li>
                  <li><strong>Salwar Kameez & Suits</strong> — Anarkali suits, sharara sets, palazzo suits, and straight-cut suits</li>
                  <li><strong>Menswear</strong> — Sherwanis, kurta pajama sets, and Nehru jackets in ready sizes</li>
                  <li><strong>Jewelry</strong> — Kundan necklace sets, jhumka earrings, and bridal jewelry sets</li>
                </ul>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Ready-to-Ship vs Made-to-Order: Which Should You Choose?</h3>
                <p>Choose <strong>ready-to-ship</strong> if your event is less than 4 weeks away, you wear a standard size (XS-XXL), or you want the fastest possible delivery. Choose <strong>made-to-order</strong> if you want a precise custom fit to your measurements, your event is 5+ weeks away, or you need specific customizations like color changes or neckline alterations. Both options come with LuxeMia's quality guarantee and the same $350 free shipping threshold.</p>
              </div>

              <div className="border-t border-border/30 pt-5 mt-6">
                <h3 className="font-medium text-foreground mb-2">Related Pages</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><Link to="/lehengas" className="text-primary underline">Shop All Lehengas</Link> | <Link to="/sarees" className="text-primary underline">Shop All Sarees</Link> | <Link to="/suits" className="text-primary underline">Shop All Suits</Link></li>
                  <li><Link to="/menswear" className="text-primary underline">Shop Menswear</Link> | <Link to="/jewelry" className="text-primary underline">Shop Jewelry</Link></li>
                  <li><Link to="/new-arrivals" className="text-primary underline">New Arrivals</Link> | <Link to="/bestsellers" className="text-primary underline">Featured Styles</Link></li>
                  <li><Link to="/shipping" className="text-primary underline">Shipping Policy — Delivery Times & Costs</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="border-t border-border/20 py-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="font-serif text-xl mb-6">Browse by Category</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/lehengas"><Button variant="outline" size="sm">Lehengas</Button></Link>
              <Link to="/sarees"><Button variant="outline" size="sm">Sarees</Button></Link>
              <Link to="/suits"><Button variant="outline" size="sm">Salwar Kameez & Suits</Button></Link>
              <Link to="/menswear"><Button variant="outline" size="sm">Menswear</Button></Link>
              <Link to="/jewelry"><Button variant="outline" size="sm">Jewelry</Button></Link>
              <Link to="/new-arrivals"><Button variant="outline" size="sm">New Arrivals</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions — Ready to Ship</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {readyToShipFaqs.map((faq, i) => (
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

export default ReadyToShip;
