import architecture from './seoArchitecture.json';

export interface IndexableRouteSeo {
  title: string;
  description: string;
  h1: string;
}

export const INDEXABLE_ROUTE_SEO = architecture.routes as Record<string, IndexableRouteSeo>;

export function getIndexableRouteSeo(path: string): IndexableRouteSeo {
  const route = INDEXABLE_ROUTE_SEO[path];
  if (!route) throw new Error(`Missing shared SEO architecture for ${path}`);
  return route;
}

export function getDedicatedSubcategoryPath(category: string, subcategory: string): string | undefined {
  const categoryPaths = architecture.subcategoryLandingPaths as Record<string, Record<string, string>>;
  return categoryPaths[category]?.[subcategory];
}
