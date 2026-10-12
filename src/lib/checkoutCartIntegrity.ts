type Attribute = { key: string; value: string };
type RequestedLine = {
  variantId: string;
  quantity: number;
  customAttributes?: Attribute[];
};
type ReturnedLine = {
  quantity: number;
  attributes?: Attribute[];
  merchandise?: { id: string; title?: string; product?: { title?: string } };
};

export class CheckoutCartChangedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutCartChangedError';
  }
}

// Only explicit reads may share cached responses. Named mutations such as
// `mutation cartCreate(...)` must always reach Shopify.
export function isCacheableStorefrontOperation(query: string): boolean {
  return /^\s*(?:query\b|\{)/.test(query);
}

function lineKey(variantId: string, attributes: Attribute[] = []): string {
  return JSON.stringify([variantId, attributes.map(({ key, value }) => [key, value])
    .sort(([a, av], [b, bv]) => a.localeCompare(b) || av.localeCompare(bv))]);
}

export function assertCheckoutCartMatches(
  requested: RequestedLine[],
  returned: ReturnedLine[],
  hasNextPage = false,
): void {
  const wanted = new Map<string, number>();
  const actual = new Map<string, number>();
  for (const line of requested) {
    const key = lineKey(line.variantId, line.customAttributes);
    wanted.set(key, (wanted.get(key) ?? 0) + line.quantity);
  }
  for (const line of returned) {
    if (!line.merchandise?.id) continue;
    const key = lineKey(line.merchandise.id, line.attributes);
    actual.set(key, (actual.get(key) ?? 0) + line.quantity);
  }
  if (hasNextPage || wanted.size !== actual.size
    || [...wanted].some(([key, quantity]) => actual.get(key) !== quantity)) {
    throw new CheckoutCartChangedError(
      'Some selected quantities or options are no longer available. Your bag is saved. Reduce the quantity or remove the affected item, then try checkout again. Contact LuxeMia if you need help.',
    );
  }
}
