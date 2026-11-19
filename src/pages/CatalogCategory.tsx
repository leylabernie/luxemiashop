import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { sortProducts } from '@/lib/productFilters';
import type { FAQItem } from '@/lib/schema';

interface CatalogCategoryMeta {
  name: string;
  h1: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  relatedLinks: Array<{ label: string; to: string }>;
  faqs: FAQItem[];
}

const CATALOG_CATEGORY_META: Record<'blouses' | 'couple-outfits', CatalogCategoryMeta> = {
  blouses: {
    name: 'Blouses',
    h1: 'Embroidered Saree & Lehenga Blouses',
    eyebrow: 'Ready-to-Style Separates',
    title: 'Saree & Lehenga Blouses Online USA | LuxeMia',
    description:
      'Shop embroidered saree and lehenga blouses in art silk with mirror & bead work. Multiple size options & free U.S. standard shipping on orders $150+.',
    intro:
      'Pair your favorite saree or lehenga skirt with richly embroidered blouses featuring mirror work, bead detailing, and festive borders. Review each listing for its stated fabric, size range, closure details, and current availability.',
    relatedLinks: [
      { label: 'Wedding & Party Sarees', to: '/sarees' },
      { label: 'Banarasi Sarees', to: '/collections/banarasi-sarees' },
      { label: 'Lehengas', to: '/lehengas' },
      { label: 'Size Guide', to: '/size-guide' },
    ],
    faqs: [
      {
        question: 'Can these blouses be paired with both sarees and lehenga skirts?',
        answer:
          'Yes. Standalone blouses in this edit can be styled with sarees, lehenga skirts, or festive drapes. Check the individual listing for neckline, sleeve, length, and color details.',
      },
      {
        question: 'How do I select my blouse size?',
        answer:
          'Compare your bust and waist measurements against the size options on the product page and consult the LuxeMia size guide before ordering.',
      },
      {
        question: 'What are the U.S. shipping rates for blouses?',
        answer:
          'U.S. standard shipping is $14.99 for orders below $150 and free at $150 and above, with tracking emailed after dispatch.',
      },
    ],
  },
  'couple-outfits': {
    name: 'Couple Outfits',
    h1: 'Indian Couple Outfits — Saree & Kurta Pajama Sets',
    eyebrow: 'Coordinated Wedding & Reception Wear',
    title: 'Indian Couple Outfits USA | Wedding Sets | LuxeMia',
    description:
      'Shop matching Indian couple outfits with saree and kurta pajama sets for weddings, receptions & festivals. Free U.S. standard shipping at $150+.',
    intro:
      'Explore coordinated Indian couple sets pairing a woven or embroidered saree with a matching men’s kurta pajama for wedding receptions, engagements, pujas, and festive celebrations. Open each listing to confirm exact included pieces, blouse fabric, and men’s size options.',
    relatedLinks: [
      { label: 'Wedding & Party Sarees', to: '/sarees' },
      { label: 'Menswear & Sherwanis', to: '/menswear' },
      { label: 'Wedding Guest Outfits', to: '/collections/wedding-guest-outfits' },
      { label: 'Shipping & Timing', to: '/shipping' },
    ],
    faqs: [
      {
        question: 'What is included in a LuxeMia couple outfit set?',
        answer:
          'Included garments vary by design—most couple sets pair a women’s saree (check listing for blouse piece details) with a coordinating men’s kurta pajama. Always verify exact included pieces on the product page.',
      },
      {
        question: 'Do couple outfit sets qualify for free U.S. standard shipping?',
        answer:
          'Orders of $150 and above qualify for free U.S. standard shipping ($14.99 below $150). International rates for Canada, the UK, Australia, New Zealand, South Africa, and Mauritius are shown on the Shipping page and at checkout.',
      },
      {
        question: 'How do I pick sizes for a couple set?',
        answer:
          'Select your preferred size option on the product page and review the listed measurements and LuxeMia size guide before completing checkout.',
      },
    ],
  },
};

export default function CatalogCategory({ category }: { category: 'blouses' | 'couple-outfits' }) {
  const { products, isLoading } = useShopifyProducts(category);
  const [visibleCount, setVisibleCount] = useState(24);
  const meta = CATALOG_CATEGORY_META[category];

  const ordered = useMemo(() => {
    const purchasable = products.filter((product) => {
      const variants = product.node.variants?.edges || [];
      return (
        product.node.availableForSale !== false &&
        (variants.length === 0 || variants.some((variant) => variant.node.availableForSale !== false))
      );
    });
    return sortProducts(purchasable, 'newest');
  }, [products]);

  useEffect(() => setVisibleCount(24), [category]);

  const noIndexFollow = !isLoading && ordered.length === 0;
  const collectionItems = ordered.slice(0, 30).map((product) => ({
    id: product.node.id,
    name: product.node.title,
    url: product.node.handle,
    image: product.node.images.edges[0]?.node.url || '',
    price: product.node.priceRange.minVariantPrice.amount,
    currency: product.node.priceRange.minVariantPrice.currencyCode,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={meta.title}
        description={meta.description}
        canonical={`https://luxemia.shop/collections/${category}`}
        type="collection"
        noIndexFollow={noIndexFollow}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: meta.name, url: `/collections/${category}` },
        ]}
        collection={{
          name: meta.h1,
          description: meta.description,
          items: collectionItems,
        }}
        faqs={meta.faqs}
      />
      <Header />
      <main id="main-content" className="container mx-auto max-w-7xl px-4 pt-[110px] pb-16 lg:px-8 lg:pt-[140px]">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-foreground">Collections</Link>
          <span>/</span>
          <span className="text-foreground">{meta.name}</span>
        </nav>

        <header className="mb-8 max-w-3xl">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">{meta.eyebrow}</p>
          <h1 className="mb-3 font-serif text-3xl md:text-5xl">{meta.h1}</h1>
          <p className="text-sm leading-7 text-muted-foreground md:text-base">{meta.intro}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.relatedLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="border border-border px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </header>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading styles…</p>
        ) : ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No qualifying products are currently available in this collection. Browse{' '}
            <Link to="/collections" className="underline">all collections</Link>.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">{ordered.length} available styles</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {ordered.slice(0, visibleCount).map((product, index) => (
                <ProductCard key={product.node.id} product={product} index={index % 24} />
              ))}
            </div>
            {visibleCount < ordered.length && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => setVisibleCount((count) => count + 24)}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}

        <section className="mt-14 max-w-3xl border-t border-border pt-10">
          <h2 className="mb-4 font-serif text-2xl">Frequently Asked Questions — {meta.name}</h2>
          <Accordion type="single" collapsible className="w-full">
            {meta.faqs.map((faq, idx) => (
              <AccordionItem key={faq.question} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-6 text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <Footer />
    </div>
  );
}
