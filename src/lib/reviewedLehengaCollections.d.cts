export const reviewedLehengaCollections: Record<string, import('../config/shopifyCollectionConfig').ShopifyCollectionPageConfig & {
  products: Array<{ id: string; handle: string; image: string }>;
}>;
export function isReviewedLehengaCollection(handle: string): boolean;
export function filterReviewedLehengaProducts<T>(handle: string, products: T[]): T[];
