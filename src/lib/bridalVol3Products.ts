import bridalVol3Catalog from '@/data/bridalVol3Catalog.json';
import type { ShopifyProduct } from '@/lib/shopify';

export interface BridalSizeChartRow {
  size: string;
  alpha: string;
  usRef: string;
  ukRef: string;
  bustIn: number;
  underbustIn: number;
  aboveWaistIn: number;
  lehengaWaistIn: number;
  hipIn: number;
  choliLengthIn: number;
  lehengaLengthIn: number;
  flareMeters: number;
  inventoryQty: number;
  available: boolean;
  fitType: string;
  fitNote: string;
}

export interface TailoringChoice {
  id: string;
  label: string;
  note?: string;
}

export interface UtsavBridalTailoringState {
  frontNeck: string;
  backNeck: string;
  sleeveStyle: string;
  choliLength: string;
  blousePadding: string;
  skirtCancan: string;
  fitPreference: string;
  unit: 'in' | 'cm';
  choliBust: string;
  choliUnderbust: string;
  choliAboveWaist: string;
  shoulderWidth: string;
  armhole: string;
  sleeveLength: string;
  lehengaWaist: string;
  aroundHip: string;
  lehengaLength: string;
  wearerHeight: string;
}

const PREVIEW_GID_PREFIX = 'gid://luxemia-preview/Product/';

export const BRIDAL_VOL3_SIZE_CHART: readonly BridalSizeChartRow[] =
  bridalVol3Catalog.sizeChart as BridalSizeChartRow[];

export const BRIDAL_VOL3_TAILORING_OPTIONS = bridalVol3Catalog.tailoringOptions as {
  frontNeckStyles: TailoringChoice[];
  backNeckStyles: TailoringChoice[];
  sleeveStyles: TailoringChoice[];
  choliLengths: TailoringChoice[];
  blousePadding: TailoringChoice[];
  skirtCancan: TailoringChoice[];
  fitPreferences: TailoringChoice[];
};

export function createDefaultUtsavTailoringState(): UtsavBridalTailoringState {
  return {
    frontNeck: BRIDAL_VOL3_TAILORING_OPTIONS.frontNeckStyles[0].id,
    backNeck: BRIDAL_VOL3_TAILORING_OPTIONS.backNeckStyles[0].id,
    sleeveStyle: BRIDAL_VOL3_TAILORING_OPTIONS.sleeveStyles[0].id,
    choliLength: BRIDAL_VOL3_TAILORING_OPTIONS.choliLengths[0].id,
    blousePadding: BRIDAL_VOL3_TAILORING_OPTIONS.blousePadding[0].id,
    skirtCancan: BRIDAL_VOL3_TAILORING_OPTIONS.skirtCancan[0].id,
    fitPreference: BRIDAL_VOL3_TAILORING_OPTIONS.fitPreferences[0].id,
    unit: 'in',
    choliBust: '',
    choliUnderbust: '',
    choliAboveWaist: '',
    shoulderWidth: '',
    armhole: '',
    sleeveLength: '',
    lehengaWaist: '',
    aroundHip: '',
    lehengaLength: '',
    wearerHeight: '',
  };
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

export function formatDimension(inches: number, unit: 'in' | 'cm'): string {
  return unit === 'in' ? `${inches}"` : `${inchesToCm(inches)} cm`;
}

export function getBridalSizeChartRow(size?: string | null): BridalSizeChartRow | null {
  if (!size) return null;
  const trimmed = size.trim().toLowerCase();
  return BRIDAL_VOL3_SIZE_CHART.find((row) => row.size.toLowerCase() === trimmed) ?? null;
}

const BRIDAL_VOL3_HANDLES = new Set(
  bridalVol3Catalog.products.map((item) => item.handle),
);

export function isUtsavTailoringBridalProduct(product: {
  handle?: string;
  tags?: string[];
}): boolean {
  if (product.handle && BRIDAL_VOL3_HANDLES.has(product.handle)) return true;
  return (product.tags || []).some(
    (tag) => tag.trim().toLowerCase() === 'utsav-tailoring'
      || tag.trim().toLowerCase() === 'royal-bridal-vol-3',
  );
}

export function isPreviewOnlyBridalProduct(product: { id?: string }): boolean {
  return Boolean(product.id && product.id.startsWith(PREVIEW_GID_PREFIX));
}

function resolveLabel(choices: TailoringChoice[], id: string): string {
  return choices.find((choice) => choice.id === id)?.label || id;
}

/**
 * Serializes selected Utsav-style bridal finishing and optional quick body/garment
 * measurements into clean Shopify order line-item attributes.
 */
export function buildUtsavTailoringAttributes(
  state: UtsavBridalTailoringState,
  includeStyleOptions: boolean,
): Array<{ key: string; value: string }> {
  const attrs: Array<{ key: string; value: string }> = [];

  if (includeStyleOptions) {
    attrs.push(
      { key: 'Front Neck Preference', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.frontNeckStyles, state.frontNeck) },
      { key: 'Back Neck Preference', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.backNeckStyles, state.backNeck) },
      { key: 'Sleeve Preference', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.sleeveStyles, state.sleeveStyle) },
      { key: 'Choli Length Preference', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.choliLengths, state.choliLength) },
      { key: 'Blouse Padding', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.blousePadding, state.blousePadding) },
      { key: 'Skirt Cancan Volume', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.skirtCancan, state.skirtCancan) },
      { key: 'Fit Ease Preference', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.fitPreferences, state.fitPreference) },
    );
  } else {
    // Even on standard sizes, preserve non-default padding or cancan requests.
    if (state.blousePadding !== BRIDAL_VOL3_TAILORING_OPTIONS.blousePadding[0].id) {
      attrs.push({ key: 'Blouse Padding', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.blousePadding, state.blousePadding) });
    }
    if (state.skirtCancan !== BRIDAL_VOL3_TAILORING_OPTIONS.skirtCancan[0].id) {
      attrs.push({ key: 'Skirt Cancan Volume', value: resolveLabel(BRIDAL_VOL3_TAILORING_OPTIONS.skirtCancan, state.skirtCancan) });
    }
  }

  const unitLabel = state.unit === 'cm' ? 'cm' : 'in';
  const choliParts: string[] = [];
  if (state.choliBust.trim()) choliParts.push(`Bust ${state.choliBust.trim()} ${unitLabel}`);
  if (state.choliUnderbust.trim()) choliParts.push(`Underbust ${state.choliUnderbust.trim()} ${unitLabel}`);
  if (state.choliAboveWaist.trim()) choliParts.push(`Above Waist ${state.choliAboveWaist.trim()} ${unitLabel}`);
  if (state.shoulderWidth.trim()) choliParts.push(`Shoulder ${state.shoulderWidth.trim()} ${unitLabel}`);
  if (state.armhole.trim()) choliParts.push(`Armhole ${state.armhole.trim()} ${unitLabel}`);
  if (state.sleeveLength.trim()) choliParts.push(`Sleeve ${state.sleeveLength.trim()} ${unitLabel}`);
  if (choliParts.length > 0) {
    attrs.push({ key: 'Choli Profile', value: choliParts.join(', ') });
  }

  const lehengaParts: string[] = [];
  if (state.lehengaWaist.trim()) lehengaParts.push(`Waist ${state.lehengaWaist.trim()} ${unitLabel}`);
  if (state.aroundHip.trim()) lehengaParts.push(`Hip ${state.aroundHip.trim()} ${unitLabel}`);
  if (state.lehengaLength.trim()) lehengaParts.push(`Length ${state.lehengaLength.trim()} ${unitLabel}`);
  if (state.wearerHeight.trim()) lehengaParts.push(`Height ${state.wearerHeight.trim()}`);
  if (lehengaParts.length > 0) {
    attrs.push({ key: 'Lehenga Profile', value: lehengaParts.join(', ') });
  }

  return attrs;
}

type CatalogEntry = (typeof bridalVol3Catalog.products)[number];

function toShopifyProduct(item: CatalogEntry): ShopifyProduct {
  return {
    node: {
      id: `${PREVIEW_GID_PREFIX}${item.skuBase}`,
      title: item.title,
      createdAt: item.publishedAt,
      description: item.description,
      descriptionHtml: item.bodyHtml,
      handle: item.handle,
      vendor: item.vendor,
      productType: item.productType,
      _originalProductType: item.productType,
      tags: [...item.tags],
      availableForSale: item.status === 'active',
      shipsWithin: 4,
      shipsWithinDays: 4,
      shipsWithinMetafield: { value: item.specs.shipsWithin },
      fabricMetafield: { value: item.specs.lehengaFabric },
      materialMetafield: { value: 'Bridal Silk, Soft Net, Viscose' },
      blouseFabricMetafield: { value: item.specs.blouseFabric },
      colorMetafield: { value: item.color },
      occasionMetafield: { value: 'Bridal, Wedding, Reception' },
      includedComponentsMetafield: { value: item.specs.includedPieces },
      careInstructionsMetafield: { value: item.specs.care },
      productStyleMetafield: { value: item.designFamilyTitle },
      genderMetafield: { value: 'female' },
      conditionMetafield: { value: 'new' },
      seo: {
        title: item.seoTitle,
        description: item.seoDescription,
      },
      priceRange: {
        minVariantPrice: {
          amount: item.priceUsd,
          currencyCode: 'USD',
        },
      },
      compareAtPriceRange: {
        minVariantPrice: {
          amount: item.compareAtPriceUsd,
          currencyCode: 'USD',
        },
        maxVariantPrice: {
          amount: item.compareAtPriceUsd,
          currencyCode: 'USD',
        },
      },
      images: {
        edges: item.images.map((img) => ({
          node: {
            url: img.webpPath,
            altText: img.alt,
          },
        })),
      },
      variants: {
        edges: item.variants.map((variant) => ({
          node: {
            id: `gid://luxemia-preview/ProductVariant/${variant.sku}`,
            title: variant.size,
            sku: variant.sku,
            price: {
              amount: variant.price,
              currencyCode: 'USD',
            },
            compareAtPrice: {
              amount: variant.compareAtPrice,
              currencyCode: 'USD',
            },
            availableForSale: variant.availableForSale,
            selectedOptions: [
              {
                name: 'Size',
                value: variant.size,
              },
            ],
          },
        })),
      },
      options: [
        {
          name: 'Size',
          values: item.variants.map((variant) => variant.size),
        },
      ],
    },
  };
}

const ACTIVE_BRIDAL_VOL3_PRODUCTS: ShopifyProduct[] = bridalVol3Catalog.products
  .filter((item) => item.status === 'active' && item.images.length > 0)
  .map(toShopifyProduct);

const ACTIVE_BY_HANDLE = new Map<string, ShopifyProduct>(
  ACTIVE_BRIDAL_VOL3_PRODUCTS.map((product) => [product.node.handle, product]),
);

export function getActiveBridalVol3Products(): ShopifyProduct[] {
  return ACTIVE_BRIDAL_VOL3_PRODUCTS;
}

export function getBridalVol3ProductByHandle(handle: string): ShopifyProduct['node'] | null {
  return ACTIVE_BY_HANDLE.get(handle)?.node ?? null;
}

/**
 * Merges active Royal Bridal Silk Vol-3 products with live Shopify catalog items.
 * Live Shopify products ALWAYS take priority by handle, so the instant the CSV
 * or Admin API import runs in Shopify, real checkout variants replace preview entries.
 */
export function mergeBridalVol3Catalog(shopifyProducts: ShopifyProduct[]): ShopifyProduct[] {
  const liveHandles = new Set(shopifyProducts.map((product) => product.node.handle));
  const pendingPreview = ACTIVE_BRIDAL_VOL3_PRODUCTS.filter(
    (product) => !liveHandles.has(product.node.handle),
  );
  if (pendingPreview.length === 0) return shopifyProducts;
  return [...pendingPreview, ...shopifyProducts];
}
