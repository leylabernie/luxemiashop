import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { sortProducts } from '@/lib/productFilters';
import { getCollectionStandard } from '@/config/collectionStandards';

type InventoryCollectionSlug =
  | 'wedding-guest-lehengas'
  | 'wedding-guest-kurta-sets'
  | 'diwali-womenswear'
  | 'diwali-menswear'
  | 'navratri-chaniya-choli'
  | 'garba-outfits'
  | 'groomsmen-outfits'
  | 'sangeet-outfits'
  | 'reception-outfits';

interface InventoryCollectionConfig {
  slug: InventoryCollectionSlug;
  category: string;
  title: string;
  description: string;
  h1: string;
  answer: string;
  chooseBy: Array<{ label: string; href: string }>;
  decisionRows: Array<[string, string, string]>;
  selectionGuidance: string;
  guideLinks: Array<{ label: string; href: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

type StandardBackedInventoryConfig = Pick<
  InventoryCollectionConfig,
  'slug' | 'category' | 'title' | 'description' | 'h1'
>;

const withCollectionStandard = (metadata: StandardBackedInventoryConfig): InventoryCollectionConfig => {
  const standard = getCollectionStandard(`/collections/${metadata.slug}`);
  if (!standard) throw new Error(`Missing collection standard for ${metadata.slug}`);
  return {
    ...metadata,
    answer: standard.directAnswer,
    chooseBy: standard.chooseBy,
    decisionRows: standard.decisionRows,
    selectionGuidance: standard.selectionGuidance,
    guideLinks: standard.guideLinks,
    faqs: standard.faqs,
  };
};

const inventoryCollectionConfigs: Record<InventoryCollectionSlug, InventoryCollectionConfig> = {
  'wedding-guest-lehengas': withCollectionStandard({
    slug: 'wedding-guest-lehengas',
    category: 'occasion:wedding-guest-lehengas',
    title: 'Wedding Guest Lehengas | Current Styles | LuxeMia',
    description: 'Browse orderable lehengas with wedding-guest, bridesmaid or maid-of-honor evidence. Bride-specific listings are excluded; generic bridal tags need explicit bridal-party role evidence.',
    h1: 'Wedding Guest Lehengas',
  }),
  'wedding-guest-kurta-sets': withCollectionStandard({
    slug: 'wedding-guest-kurta-sets',
    category: 'occasion:wedding-guest-kurta-sets',
    title: 'Wedding Guest Kurta Sets | Indian Menswear | LuxeMia',
    description: 'Browse orderable menswear with kurta-set and wedding-guest, bridesmaid or maid-of-honor evidence. Verify included garments, measurements, variants and fulfillment.',
    h1: 'Wedding Guest Kurta Sets',
  }),
  'diwali-womenswear': withCollectionStandard({
    slug: 'diwali-womenswear',
    category: 'occasion:diwali-womenswear',
    title: 'Diwali Womenswear | Sarees, Lehengas & Suits | LuxeMia',
    description: 'Browse orderable Diwali outfit listings with a supported garment signal and no menswear evidence. Compare sizes, contents and fulfillment.',
    h1: 'Diwali Outfits for Women',
  }),
  'diwali-menswear': withCollectionStandard({
    slug: 'diwali-menswear',
    category: 'occasion:diwali-menswear',
    title: 'Diwali Menswear | Kurta & Indian Festive Styles | LuxeMia',
    description: 'Browse orderable menswear with explicit Diwali or festival evidence and a supported garment signal. Verify garments, measurements and fulfillment.',
    h1: 'Diwali Outfits for Men',
  }),
  'navratri-chaniya-choli': withCollectionStandard({
    slug: 'navratri-chaniya-choli',
    category: 'occasion:navratri-chaniya',
    title: 'Navratri Chaniya Choli | Current Styles | LuxeMia',
    description: 'Shop current Navratri chaniya choli and lehenga sets. Compare included pieces, fabric, work, measurements, stitching, price and availability.',
    h1: 'Navratri Chaniya Choli Online',
  }),
  'garba-outfits': withCollectionStandard({
    slug: 'garba-outfits',
    category: 'occasion:garba',
    title: 'Garba Outfits | Dandiya Clothing | LuxeMia',
    description: 'Browse orderable Garba and Dandiya outfits. Compare movement, included pieces, fabric, work, measurements, stitching and availability.',
    h1: 'Garba and Dandiya Outfits Online',
  }),
  'groomsmen-outfits': withCollectionStandard({
    slug: 'groomsmen-outfits',
    category: 'occasion:groomsmen',
    title: 'Indian Groomsmen Outfits | Kurta & Sherwani | LuxeMia',
    description: 'Browse orderable groomsmen outfits with independent menswear evidence. Compare kurta, jacket and sherwani pieces, measurements and availability.',
    h1: 'Indian Groomsmen Outfits Online',
  }),
  'sangeet-outfits': withCollectionStandard({
    slug: 'sangeet-outfits',
    category: 'occasion:sangeet',
    title: 'Sangeet Outfits | Indian Dance-Event Styles | LuxeMia',
    description: 'Browse orderable outfits explicitly identified for Sangeet. Compare movement, fabric, included pieces, measurements, fulfillment and availability.',
    h1: 'Sangeet Outfits Online',
  }),
  'reception-outfits': withCollectionStandard({
    slug: 'reception-outfits',
    category: 'occasion:reception',
    title: 'Indian Reception Outfits | Guest & Party Wear | LuxeMia',
    description: 'Browse orderable outfits explicitly identified for receptions. Compare formality, fabric, work, included pieces, measurements, price and availability.',
    h1: 'Indian Reception Outfits Online',
  }),
};

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const PRODUCTS_PER_PAGE = 24;
const SCHEMA_PRODUCT_LIMIT = 30;

const CatalogLoadError = ({ retryHref }: { retryHref: string }) => (
  <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-8 text-center" role="alert">
    <h2 className="font-serif text-xl">Current inventory could not be loaded</h2>
    <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
      Product availability is temporarily unavailable. Try this page again, or contact LuxeMia before relying on a specific option.
    </p>
    <Button asChild className="mt-5" variant="outline">
      <a href={retryHref}>Try again</a>
    </Button>
  </div>
);

const InventoryBackedCollectionContent = ({ landing }: { landing: InventoryCollectionSlug }) => {
  const config = inventoryCollectionConfigs[landing];
  const { products, isLoading, error } = useShopifyProducts(config.category);
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);
  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleProducts.length < sortedProducts.length;
  const collectionItems = sortedProducts.slice(0, SCHEMA_PRODUCT_LIMIT).map(({ node }) => ({
    id: node.id,
    name: node.title,
    url: node.handle,
    image: node.images.edges[0]?.node.url || '',
    price: node.priceRange.minVariantPrice.amount,
    currency: node.priceRange.minVariantPrice.currencyCode,
  }));

  const handleSortChange = (nextSort: string) => {
    setSortBy(nextSort);
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount((currentCount) => Math.min(
      currentCount + PRODUCTS_PER_PAGE,
      sortedProducts.length,
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={config.title}
        description={config.description}
        canonical={`https://luxemia.shop/collections/${config.slug}`}
        type="collection"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: config.h1, url: `/collections/${config.slug}` },
        ]}
        collection={!isLoading && !error
          ? { name: config.h1, description: config.description, items: collectionItems }
          : undefined}
        faqs={config.faqs}
        noIndexFollow={!isLoading && !error && sortedProducts.length === 0}
      />
      <Header />
      <main className="pt-[88px] lg:pt-[130px]">
        <section className="border-b border-border/30 bg-secondary/30 py-12">
          <div className="container mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Current inventory-backed collection</p>
            <h1 className="font-serif text-3xl lg:text-5xl">{config.h1}</h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-muted-foreground lg:text-base">{config.answer}</p>
          </div>
        </section>

        <nav aria-label="Choose by" className="border-b border-border/30 bg-background py-5">
          <div className="container mx-auto flex max-w-5xl flex-wrap justify-center gap-3 px-4 lg:px-8">
            {config.chooseBy.map((item) => (
              <Button key={item.href} asChild variant="outline" size="sm">
                <Link to={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </nav>

        <section className="container mx-auto max-w-7xl px-4 py-10 lg:px-8" aria-labelledby={`${landing}-products`}>
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Verified catalog matches</p>
              <h2 id={`${landing}-products`} className="mt-2 font-serif text-2xl">Current products</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoading
                  ? 'Loading current inventory…'
                  : error
                    ? 'Current inventory is temporarily unavailable'
                    : `${visibleProducts.length} of ${sortedProducts.length} active matches shown`}
              </p>
            </div>
            {!error ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Sort <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((option) => <DropdownMenuItem key={option.value} onClick={() => handleSortChange(option.value)}>{option.label}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-muted" />)}</div>
          ) : error ? (
            <CatalogLoadError retryHref={`/collections/${config.slug}`} />
          ) : sortedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {visibleProducts.map((product, index) => <ProductCard key={product.node.id} product={product} index={index} />)}
              </div>
              {hasMore ? (
                <div className="mt-10 flex justify-center">
                  <Button type="button" variant="outline" onClick={handleLoadMore}>
                    Load more ({sortedProducts.length - visibleProducts.length} remaining)
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-sm border border-border p-8 text-center"><h2 className="font-serif text-xl">No verified products currently available</h2><p className="mt-2 text-sm text-muted-foreground">This page is excluded from discovery when durable inventory is unavailable.</p></div>
          )}
        </section>

        <section className="border-y border-border/30 bg-secondary/20 py-12">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8">
            <h2 className="text-center font-serif text-2xl">Compare before choosing</h2>
            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse bg-background text-left text-sm">
                <thead><tr>{['Option', 'May suit', 'Verify on the listing'].map((heading) => <th key={heading} className="border border-border px-4 py-3 font-medium">{heading}</th>)}</tr></thead>
                <tbody>{config.decisionRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell} className="border border-border px-4 py-3 align-top text-muted-foreground">{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <h2 className="mt-10 font-serif text-2xl">Product selection guidance</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{config.selectionGuidance}</p>
            <h2 className="mt-10 font-serif text-2xl">Relevant guides</h2>
            <ul className="mt-3 grid gap-2 text-sm md:grid-cols-3">{config.guideLinks.map((item) => <li key={item.href}><Link className="text-primary underline underline-offset-4" to={item.href}>{item.label}</Link></li>)}</ul>
            <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-6 text-sm">
              <Link className="text-primary underline" to="/shipping">Shipping rates and planning</Link>
              <Link className="text-primary underline" to="/returns#merchant-return-policy">Returns and order issues</Link>
              <Link className="text-primary underline" to="/sizing-measurements-guide">Sizing and measurements</Link>
              <Link className="text-primary underline" to="/contact">Contact online support</Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 py-14 lg:px-8">
          <h2 className="mb-7 text-center font-serif text-2xl">Frequently asked questions</h2>
          <Accordion type="single" collapsible>{config.faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger className="text-left">{faq.question}</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const InventoryBackedCollection = ({ landing }: { landing: InventoryCollectionSlug }) => (
  <InventoryBackedCollectionContent key={landing} landing={landing} />
);

export default InventoryBackedCollection;
