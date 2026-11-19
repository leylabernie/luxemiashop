export const LATEST_HOMEPAGE_IMAGERY_QUERY: string;

export interface SelectedImageEntry {
  handle: string;
  title: string;
  price: number;
  url: string;
  webpUrl: string;
  rawUrl?: string;
  alt: string;
  width: number;
  height: number;
  createdAt: string | null;
}

export interface SelectedHomepageImagery {
  hero: {
    'wedding-edit': SelectedImageEntry | null;
    'new-arrivals': SelectedImageEntry | null;
    'sarees-edit': SelectedImageEntry | null;
    'lehengas-suits': SelectedImageEntry | null;
    'ready-to-ship': SelectedImageEntry | null;
  };
  categories: {
    sarees: SelectedImageEntry | null;
    lehengas: SelectedImageEntry | null;
    suits: SelectedImageEntry | null;
    indowestern: SelectedImageEntry | null;
    menswear: SelectedImageEntry | null;
    kids: SelectedImageEntry | null;
    jewelry: SelectedImageEntry | null;
  };
  promos: {
    'ready-to-ship': SelectedImageEntry | null;
    'bridal-party': SelectedImageEntry | null;
  };
}

export interface DesignSignature {
  handle: string;
  imageKey: string;
  category: string | null;
  price: number;
  createdMs: number;
  vendorCode: string;
  fileKey: string;
  handleTokens: string[];
  titleTokens: string[];
  handleKey: string;
  coreHandleKey: string;
  titleKey: string;
  coreTitleKey: string;
}

export function toSizedShopifyImageUrl(
  rawUrl: string,
  width?: number,
  format?: string | null,
): string;

export function buildDesignSignature(input: unknown): DesignSignature;

export function isSameDesignFamily(left: unknown, right: unknown): boolean;

export function selectDistinctHomepageProducts<T>(
  products: T[],
  options?: {
    limit?: number;
    hardAvoid?: Array<Partial<SelectedImageEntry> | null | undefined>;
    softAvoid?: Array<Partial<SelectedImageEntry> | null | undefined>;
  },
): T[];

export function selectLatestHomepageImagery(
  data: Record<string, unknown>,
  options?: { archivedHandles?: string[]; goneHandles?: string[] },
): SelectedHomepageImagery | null;
