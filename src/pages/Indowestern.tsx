import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import CollectionProductBrowser from '@/components/collections/CollectionProductBrowser';
import { occasionFilterSections } from '@/lib/collectionFilterSections';

const indowesternFaqs = [
  {
    question: 'What is Indo-Western fashion?',
    answer: 'Indo-Western fashion blends traditional Indian embroidery, fabrics, and silhouettes with contemporary tailoring. Popular styles include jacket lehengas, cape kurtas, anarkali gowns, sharara co-ords, and fusion gowns.',
  },
  {
    question: 'What occasions are Indo-Western outfits suitable for?',
    answer: 'Indo-Western outfits work well for cocktail parties, sangeet nights, receptions, Diwali parties, Eid celebrations, destination weddings, and modern festive events where a full traditional look may feel too formal.',
  },
  {
    question: 'Do you ship Indo-Western outfits to the USA, Canada, and Australia?',
    answer: 'Yes, LuxeMia ships Indo-Western dresses and fusion outfits to the USA, Canada, Australia, and worldwide with tracked delivery and free shipping on qualifying orders.',
  },
  {
    question: 'What Indo-Western styles are trending right now?',
    answer: 'Jacket lehengas, cape-style anarkalis, embroidered fusion gowns, sharara co-ord sets, and palazzo suits with asymmetric kurtas are popular for modern Indian occasion dressing.',
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
        <div className="bg-secondary/40 border-b border-border/30 py-10 lg:py-14">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Fusion Fashion</span>
            <h1 className="font-serif text-3xl lg:text-5xl mb-3">Indo-Western</h1>
            <p className="text-muted-foreground font-light max-w-xl mx-auto text-sm lg:text-base">
              Where Indian embroidery meets contemporary silhouettes. Shop jacket lehengas, cape kurtas, fusion gowns, and palazzo sets for sangeet nights, cocktail parties, and festive celebrations.
            </p>
          </div>
        </div>

        <div className="bg-background border-b border-border/20 py-6">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              LuxeMia&apos;s Indo-Western collection brings Indian fabrics like georgette, organza, silk, and velvet into modern Western cuts. Browse <strong>jacket lehengas</strong>, <strong>dhoti pants with crop tops</strong>, <strong>cape-style anarkalis</strong>, <strong>sharara co-ord sets</strong>, and <strong>embroidered fusion gowns</strong>.
            </p>
          </div>
        </div>

        <CollectionProductBrowser
          products={products}
          isLoading={isLoading}
          sortOptions={sortOptions}
          filterSections={occasionFilterSections}
          priceRangeMax={1000}
          countLabel="styles"
        />
      </main>

      <section className="border-t border-border bg-card/30 py-14">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="font-serif text-2xl mb-8 text-center">Frequently Asked Questions - Indo-Western Fashion</h2>
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

