import {
  PIN_TITLE_MAX_LENGTH as TITLE_MAX,
  PIN_DESCRIPTION_MAX_LENGTH as DESCRIPTION_MAX,
  buildPinTitle,
  buildPinDescription,
  occasionFromTags as occasionFromCatalogTags,
  resolvePinFulfillment as resolveFulfillment,
  withShareUtm as appendShareUtm,
  buildPinterestShareUrl as pinterestShareUrl,
  buildWhatsAppShareText as whatsAppShareText,
  buildFacebookShareText as facebookShareText,
} from './pinterestPinCopy.cjs';

/**
 * Typed storefront wrapper around `src/lib/pinterestPinCopy.cjs`.
 *
 * The CJS module holds the actual copy rules so the offline pin scheduler
 * (`scripts/generate-pinterest-scheduler.cjs`) and the PDP share buttons build
 * identical, policy-accurate pin text. Nothing here may add a claim that the
 * storefront does not publish — see the header comment in pinterestPinCopy.cjs
 * and docs/growth/ZERO-BUDGET-PLAYBOOK-VERIFIED-2026-11-25.md.
 */

export type PinFulfillment =
  | 'ready-to-ship'
  | 'custom-tailored'
  | 'unstitched'
  | 'both'
  | 'unknown';

export interface PinterestPinInput {
  /** Full Shopify product title (fallback when attributes are missing). */
  title: string;
  color?: string;
  material?: string;
  category?: string;
  occasion?: string;
  /** Canonical product URL, e.g. https://luxemia.shop/product/<handle> */
  url: string;
  image?: string;
  fulfillment?: PinFulfillment;
}

export interface PinFulfillmentContext {
  /** Shopify ships-within metafield in business days, when present. */
  shipsWithinDays?: number | null;
  isUnstitched?: boolean;
  isCustomTailored?: boolean;
  confirmAvailability?: boolean;
}

export const PIN_TITLE_MAX_LENGTH: number = TITLE_MAX;
export const PIN_DESCRIPTION_MAX_LENGTH: number = DESCRIPTION_MAX;

/** Pin title: `[Color] [Fabric] [Category] for [Occasion] | LuxeMia`. */
export function buildPinterestPinTitle(input: PinterestPinInput): string {
  return buildPinTitle(input);
}

/** Pin description: published delivery, lining, seam-allowance and support facts. */
export function buildPinterestPinDescription(input: PinterestPinInput): string {
  return buildPinDescription(input);
}

/** Read the catalog `occasion:` tag; never infer an occasion from the title. */
export function occasionFromTags(tags?: string[]): string | undefined {
  return occasionFromCatalogTags(tags);
}

/** Ready-to-Ship copy only when the storefront already shows that window. */
export function resolvePinFulfillment(context: PinFulfillmentContext = {}): PinFulfillment {
  return resolveFulfillment(context) as PinFulfillment;
}

/** Append UTM parameters without duplicating them or breaking ?variant=. */
export function withShareUtm(
  url: string,
  source: string,
  medium = 'organic_social',
  campaign = 'product_share',
): string {
  return appendShareUtm(url, source, medium, campaign);
}

export function buildPinterestShareUrl(input: PinterestPinInput): string {
  return pinterestShareUrl(input);
}

export function buildWhatsAppShareText(title: string, url: string): string {
  return whatsAppShareText(title, url);
}

export function buildFacebookShareText(title: string, url: string): string {
  return facebookShareText(title, url);
}
