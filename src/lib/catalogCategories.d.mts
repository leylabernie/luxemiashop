export const CATEGORY_PRODUCT_TYPES: Record<string, string[]>;
export const CATEGORY_LABELS: Record<string, string>;
export function getPrimaryCategory(product: {productType?: string; _originalProductType?: string}): string | null;
export function getCatalogDisplayCategory(productType: string | undefined): string;
export const NEW_ARRIVALS_LIMIT: number;
export function selectLatestArrivals<T extends {node: {createdAt: string; productType?: string}}>(products: T[], now?: number, limit?: number): T[];
