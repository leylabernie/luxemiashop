// Publish the small first page before waiting for the rest of a catalog.
// Only the resolved return value is complete enough to persist in a cache.
export async function loadCatalogPages<T>(
  requestPage: (first: number, after?: string) => Promise<{
    products: T[];
    hasNextPage: boolean;
    endCursor?: string | null;
  }>,
  onPage?: (products: T[]) => void,
): Promise<T[]> {
  const products: T[] = [];
  let cursor: string | undefined;
  let hasNextPage = true;
  while (hasNextPage) {
    const page = await requestPage(onPage && !cursor ? 24 : 250, cursor);
    products.push(...page.products);
    onPage?.([...products]);
    hasNextPage = page.hasNextPage;
    if (!hasNextPage) return products;
    if (!page.endCursor || page.endCursor === cursor) throw new Error('Shopify pagination did not advance');
    cursor = page.endCursor;
  }
  return products;
}
