import { Link } from 'react-router-dom';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import type { ShopifyProduct } from '@/lib/shopify';
import { getCollectionStandard } from '@/config/collectionStandards';
import ProductCard from '@/components/ui/ProductCard';

interface CollectionDecisionSupportProps {
  path: string;
  products?: ShopifyProduct[];
  isLoading?: boolean;
  showFaqs?: boolean;
}

interface CollectionDirectAnswerProps {
  path: string;
  className?: string;
}

const CurrentProductLinks = ({
  products,
  isLoading,
  error = null,
  retryHref,
}: {
  products: ShopifyProduct[];
  isLoading: boolean;
  error?: string | null;
  retryHref?: string;
}) => {
  const currentProducts = products
    .filter(({ node }) => (
      node.availableForSale === true
      && node.variants.edges.some((edge) => edge.node.availableForSale === true)
    ))
    .slice(0, 8);

  return (
    <section data-collection-products aria-labelledby="collection-standard-products">
      <h2 id="collection-standard-products" className="font-serif text-2xl">Current products to compare</h2>
      {error ? (
        <div className="mt-3 text-sm text-muted-foreground" role="alert">
          <p>Current product availability could not be loaded. No inventory total is shown while catalog data is unavailable.</p>
          {retryHref ? <a className="mt-3 inline-block text-primary underline underline-offset-4" href={retryHref}>Try again</a> : null}
        </div>
      ) : isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          Current qualifying products are loading.
        </p>
      ) : currentProducts.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {currentProducts.map((product, index) => (
            <ProductCard
              key={product.node.id}
              product={product}
              index={index}
              showQuickAdd={false}
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No current qualifying products are available. Use the collection grid above or contact LuxeMia if a specific option is important.
        </p>
      )}
    </section>
  );
};

const FetchedProductLinks = ({ category, retryHref }: { category: string; retryHref: string }) => {
  const { products, isLoading, error } = useShopifyProducts(category);
  return <CurrentProductLinks products={products} isLoading={isLoading} error={error} retryHref={retryHref} />;
};

export const CollectionDirectAnswer = ({ path, className }: CollectionDirectAnswerProps) => {
  const standard = getCollectionStandard(path);
  if (!standard) return null;

  return (
    <p data-collection-direct-answer className={className}>
      {standard.directAnswer}
    </p>
  );
};

const CollectionDecisionSupport = ({
  path,
  products,
  isLoading = false,
  showFaqs = true,
}: CollectionDecisionSupportProps) => {
  const standard = getCollectionStandard(path);
  if (!standard) return null;

  return (
    <section
      data-collection-standard
      className="border-y border-border/40 bg-secondary/20 py-14"
      aria-labelledby="collection-standard-heading"
    >
      <div className="container mx-auto grid max-w-5xl gap-10 px-4 lg:px-8">
        <div>
          <h2 id="collection-standard-heading" className="text-center font-serif text-2xl">Choose by shopping need</h2>
          <nav aria-label="Choose by shopping need" className="mt-5 flex flex-wrap justify-center gap-3">
            {standard.chooseBy.map((item) => (
              <Link
                key={item.href}
                className="border border-border bg-background px-4 py-2 text-sm text-primary underline-offset-4 hover:underline"
                to={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {products ? (
          <CurrentProductLinks products={products} isLoading={isLoading} />
        ) : (
          <FetchedProductLinks category={standard.category} retryHref={path} />
        )}

        <div>
          <h2 className="text-center font-serif text-2xl">Compare before choosing</h2>
          <div className="mt-6 overflow-x-auto">
            <table data-collection-decision-table className="w-full min-w-[680px] border-collapse bg-background text-left text-sm">
              <thead>
                <tr>
                  {['Option', 'May suit', 'Verify on the listing'].map((heading) => (
                    <th key={heading} className="border border-border px-4 py-3 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standard.decisionRows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell} className="border border-border px-4 py-3 align-top text-muted-foreground">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div data-collection-selection-guidance>
          <h2 className="font-serif text-2xl">Product selection guidance</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{standard.selectionGuidance}</p>
        </div>

        <div>
          <h2 className="font-serif text-2xl">Relevant guides</h2>
          <ul className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            {standard.guideLinks.map((item) => (
              <li key={item.href}>
                <Link className="text-primary underline underline-offset-4" to={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <nav aria-label="Shipping, returns and support" className="mt-7 flex flex-wrap gap-4 border-t border-border pt-6 text-sm">
            <Link className="text-primary underline" to="/shipping">Shipping rates and planning</Link>
            <Link className="text-primary underline" to="/returns#merchant-return-policy">Returns and covered order issues</Link>
            <Link className="text-primary underline" to="/sizing-measurements-guide">Sizing and measurements</Link>
            <Link className="text-primary underline" to="/contact">Contact LuxeMia support</Link>
          </nav>
        </div>

        {showFaqs ? (
          <div data-collection-faqs>
            <h2 className="text-center font-serif text-2xl">Frequently asked questions</h2>
            <div className="mt-5 grid gap-3">
              {standard.faqs.map((faq) => (
                <details key={faq.question} className="border border-border bg-background p-5">
                  <summary className="cursor-pointer text-sm font-medium">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CollectionDecisionSupport;
