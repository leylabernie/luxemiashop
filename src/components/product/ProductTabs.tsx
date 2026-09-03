import { CheckCircle2, Droplets, Info, Ruler, Shield, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SHIPPING_POLICY_SUMMARY, SHIPPING_TIMING_NOTICE } from '@/config/shippingPolicy';
import { COVERED_ORDER_ISSUE_ANSWER, RETURN_POLICY_SUMMARY } from '@/lib/returnPolicyCopy';

interface ProductTabsProps {
  description?: string;
  productType?: string;
  /** Shopify product tags. Only explicitly prefixed fact tags are displayed. */
  tags?: string[];
}

const FACT_PREFIXES = {
  fabric: ['fabric:', 'material:'],
  work: ['work:', 'embroidery:', 'embellishment:'],
  color: ['color:'],
  occasion: ['occasion:'],
  style: ['style:', 'silhouette:'],
  includedPieces: ['includes:', 'included:', 'included-components:'],
  care: ['care:'],
} as const;

const FACT_LABELS: Record<keyof typeof FACT_PREFIXES, string> = {
  fabric: 'Fabric or material',
  work: 'Work or embellishment',
  color: 'Color',
  occasion: 'Occasion',
  style: 'Style or silhouette',
  includedPieces: 'Included pieces',
  care: 'Care instruction',
};

function normalizeFact(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function getExplicitFacts(tags: string[] = []) {
  return (Object.entries(FACT_PREFIXES) as [keyof typeof FACT_PREFIXES, readonly string[]][])
    .map(([key, prefixes]) => {
      const values = tags.flatMap((tag) => {
        const normalizedTag = tag.trim();
        const lowerTag = normalizedTag.toLowerCase();
        const prefix = prefixes.find((candidate) => lowerTag.startsWith(candidate));
        if (!prefix) return [];
        const value = normalizeFact(normalizedTag.slice(prefix.length));
        return value ? [value] : [];
      });

      return {
        key,
        label: FACT_LABELS[key],
        values: [...new Set(values)],
      };
    })
    .filter((fact) => fact.values.length > 0);
}

const triggerClassName = 'rounded-none border-b-2 border-transparent px-5 py-4 text-sm uppercase tracking-wide whitespace-nowrap data-[state=active]:border-foreground data-[state=active]:bg-transparent';

export const ProductTabs = ({ description, productType, tags }: ProductTabsProps) => {
  const explicitFacts = getExplicitFacts(tags);
  const explicitCare = explicitFacts.find((fact) => fact.key === 'care');

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger value="details" className={triggerClassName}>Product details</TabsTrigger>
        <TabsTrigger value="sizing" className={triggerClassName}>Sizing</TabsTrigger>
        <TabsTrigger value="care" className={triggerClassName}>Care</TabsTrigger>
        <TabsTrigger value="shipping" className={triggerClassName}>Shipping &amp; returns</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-lg font-medium">Listing-supplied details</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description || 'No additional description was supplied for this listing. Use the product images and selectable options above, and contact LuxeMia before ordering if an essential detail is missing.'}
            </p>
          </div>

          {explicitFacts.length > 0 ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {explicitFacts.filter((fact) => fact.key !== 'care').map((fact) => (
                <div key={fact.key} className="rounded-sm border border-border p-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{fact.label}</dt>
                  <dd className="mt-1 text-sm text-foreground">{fact.values.join(', ')}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="flex items-start gap-3 rounded-sm border border-border bg-card p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                No prefixed specification tags are published for this item. LuxeMia does not infer fabric, fiber composition, included pieces, color, work, or occasion from its category.
              </p>
            </div>
          )}

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Only details stated in the listing, images, selected variant, or prefixed catalog facts apply to this product.</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Accessories and garment pieces are included only when the product page says so.</li>
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="sizing" className="pt-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg font-medium">Use this product&apos;s measurements</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Size labels and measurements vary by product and supplier, so LuxeMia does not apply a universal chart to this item. Choose only from the variants currently shown above and compare your body or garment measurements with the measurements stated for this exact listing.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If a required measurement is not published, review the <a className="text-primary underline underline-offset-4" href="/sizing-measurements-guide">sizing and measurements guide</a> and <a className="text-primary underline underline-offset-4" href="/contact">ask LuxeMia before ordering</a>.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="care" className="pt-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg font-medium">Care information</h3>
          </div>
          {explicitCare ? (
            <div className="rounded-sm border border-border bg-card p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{explicitCare.values.join('; ')}</p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              A product-specific care instruction was not supplied in a prefixed catalog fact. Do not assume a washing, drying, ironing, steaming, or dry-cleaning method from the garment category or apparent fabric. Contact LuxeMia before cleaning if the listing does not state a method.
            </p>
          )}
          <p className="text-sm leading-relaxed text-muted-foreground">
            The <a className="text-primary underline underline-offset-4" href="/blog/fit-sizing-and-garment-care">garment-care guide</a> provides general questions to ask; it does not replace this product&apos;s supplied instructions.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="pt-6">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-sm border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><h3 className="font-medium">Shipping</h3></div>
              <p className="text-sm leading-relaxed text-muted-foreground">{SHIPPING_POLICY_SUMMARY}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{SHIPPING_TIMING_NOTICE}</p>
            </div>
            <div className="rounded-sm border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><h3 className="font-medium">Returns and order issues</h3></div>
              <p className="text-sm leading-relaxed text-muted-foreground">{RETURN_POLICY_SUMMARY}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{COVERED_ORDER_ISSUE_ANSWER}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Review the complete <a className="text-primary underline underline-offset-4" href="/shipping">Shipping Policy</a> and <a className="text-primary underline underline-offset-4" href="/returns">Returns &amp; Cancellations Policy</a>. Contact <a className="text-primary underline underline-offset-4" href="/contact">support</a> before ordering when an event date is fixed.
          </p>
          {productType && <p className="text-xs text-muted-foreground">Product type supplied by the listing: {productType}.</p>}
        </div>
      </TabsContent>
    </Tabs>
  );
};
