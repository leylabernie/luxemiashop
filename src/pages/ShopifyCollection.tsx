import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import ProductCard from '@/components/ui/ProductCard';
import CollectionDecisionSupport, { CollectionDirectAnswer } from '@/components/collections/CollectionDecisionSupport';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getShopifyCollectionConfig } from '@/config/shopifyCollectionConfig';
import { useShopifyCollection } from '@/hooks/useShopifyCollection';

const PRODUCTS_PER_PAGE = 24;

const CatalogLoadError = ({ retryHref }: { retryHref: string }) => (
  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-14 text-center" role="alert">
    <h2 className="font-serif text-2xl">Current products could not be loaded</h2>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
      Product availability is temporarily unavailable. Try this page again, or contact LuxeMia before relying on a specific option.
    </p>
    <Button asChild className="mt-5" variant="outline">
      <a href={retryHref}>Try again</a>
    </Button>
  </div>
);

const ShopifyCollectionPage = () => {
  const { handle = '' } = useParams();
  const config = getShopifyCollectionConfig(handle);
  const { products, isLoading, error } = useShopifyCollection(handle);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const purchasableProducts = useMemo(
    () => products.filter((product) => {
      const variants = product.node.variants?.edges || [];
      return product.node.availableForSale === true &&
        variants.some((variant) => variant.node.availableForSale === true);
    }),
    [products],
  );

  if (!config) return <Navigate to="/collections" replace />;

  const visibleProducts = purchasableProducts.slice(0, visibleCount);
  const collectionPath = `/collections/${handle}`;
  const noIndexFollow = !isLoading && !error && purchasableProducts.length === 0;
  const collectionItems = purchasableProducts.slice(0, 30).map((product) => ({
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
        title={config.title}
        description={config.description}
        canonical={config.canonical}
        type="collection"
        noIndexFollow={noIndexFollow}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
          { name: config.name, url: `/collections/${config.handle}` },
        ]}
        collection={!isLoading && !error
          ? {
              name: config.name,
              description: config.description,
              items: collectionItems,
            }
          : undefined}
        faqs={config.faqs}
      />
      <Header />

      <main className="pt-[90px] lg:pt-[132px] pb-16">
        <section className="border-b border-border bg-gradient-to-br from-stone-100 via-amber-50 to-rose-50 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">{config.eyebrow}</p>
            <h1 className="mb-5 font-serif text-4xl md:text-5xl">{config.name}</h1>
            <CollectionDirectAnswer path={collectionPath} className="mx-auto max-w-3xl text-sm leading-7 text-muted-foreground md:text-base" />
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-foreground">Collections</Link>
            <span>/</span>
            <span className="text-foreground">{config.name}</span>
          </nav>
        </div>

        <section className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-6 flex items-end justify-between border-b border-border pb-5">
            <div>
              <h2 className="font-serif text-2xl">Shop {config.name}</h2>
              {!isLoading && !error && purchasableProducts.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">{purchasableProducts.length} available styles</p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="mb-3 aspect-[3/4] bg-secondary" />
                  <div className="mb-2 h-3 w-2/3 rounded bg-secondary" />
                  <div className="h-3 w-1/3 rounded bg-secondary" />
                </div>
              ))}
            </div>
          ) : error ? (
            <CatalogLoadError retryHref={collectionPath} />
          ) : visibleProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {visibleProducts.map((product, index) => (
                  <ProductCard key={product.node.id} product={product} index={index % 24} />
                ))}
              </div>
              {visibleCount < purchasableProducts.length && (
                <div className="mt-10 text-center">
                  <Button variant="outline" size="lg" onClick={() => setVisibleCount((count) => count + PRODUCTS_PER_PAGE)}>
                    Load More ({purchasableProducts.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-border bg-card/30 px-6 py-14 text-center">
              <h2 className="font-serif text-2xl">No current listings in this collection</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                We have not published a qualifying product in this collection. Tell us your event date, preferred color and budget, and we can help you compare currently published listings.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild><Link to="/contact">Ask LuxeMia for Help</Link></Button>
                <Button asChild variant="outline">
                  <a href="https://wa.me/12153419990?text=Hi%20LuxeMia%2C%20I%20am%20looking%20for%20a%20wedding%20saree." target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
                </Button>
              </div>
            </div>
          )}
        </section>

        {!error ? <CollectionDecisionSupport path={collectionPath} products={purchasableProducts} isLoading={isLoading} showFaqs={false} /> : null}

        <section className="container mx-auto max-w-5xl px-4 pt-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <div>
              <h2 className="font-serif text-2xl">How to compare {config.name.toLowerCase()}</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead><tr className="border-b border-border"><th className="p-3">Check</th><th className="p-3">Why it matters</th><th className="p-3">Source of truth</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-border"><td className="p-3">Included pieces</td><td className="p-3">Sets do not all contain the same garments</td><td className="p-3">Exact product description</td></tr>
                    <tr className="border-b border-border"><td className="p-3">Fabric and work</td><td className="p-3">A material name does not prove fiber composition</td><td className="p-3">Product specifications</td></tr>
                    <tr className="border-b border-border"><td className="p-3">Fit and fulfillment</td><td className="p-3">Sizing, processing and transit are separate</td><td className="p-3">Selected variant and timing details</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <aside className="border border-border bg-card p-6">
              <h2 className="font-serif text-xl">Choose with confidence</h2>
              <nav className="mt-4 flex flex-col gap-3 text-sm">
                <Link className="text-primary underline underline-offset-4" to="/sizing-measurements-guide">Sizing and measurement guide</Link>
                <Link className="text-primary underline underline-offset-4" to="/blog">Indian attire guides</Link>
                <Link className="text-primary underline underline-offset-4" to="/shipping">Shipping rates and timing</Link>
                <Link className="text-primary underline underline-offset-4" to="/returns">Returns and issue reporting</Link>
                <Link className="text-primary underline underline-offset-4" to="/us-support">Contact LuxeMia support</Link>
              </nav>
            </aside>
          </div>
        </section>

        <section className="mt-16 border-y border-border bg-card/30 py-14">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-6 text-center font-serif text-2xl md:text-3xl">{config.editorialTitle}</h2>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
              {config.editorial.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-8 text-center font-serif text-2xl">Frequently Asked Questions — {config.name}</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {config.faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="rounded-lg border border-border px-5">
                  <AccordionTrigger className="text-left text-sm hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShopifyCollectionPage;
