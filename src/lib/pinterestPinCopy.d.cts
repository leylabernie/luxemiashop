/**
 * Type declarations for `src/lib/pinterestPinCopy.cjs`.
 *
 * The copy rules live in the CJS module so the offline scheduler
 * (`scripts/generate-pinterest-scheduler.cjs`) and the storefront wrapper
 * (`src/lib/pinterestPin.ts`) build identical text from one source. This file
 * only describes them; it must never widen a claim the module does not make.
 * Same convention as `src/config/shippingTiming.d.cts`.
 */

export type PinCopyFulfillment =
  | 'ready-to-ship'
  | 'custom-tailored'
  | 'unstitched'
  | 'both'
  | 'unknown';

export interface PinCopyInput {
  /** Full product title; the fallback when catalog attributes are missing. */
  title?: string;
  color?: string;
  material?: string;
  category?: string;
  /** Only ever a catalog `occasion:` tag, never an inference from the title. */
  occasion?: string;
  /** Canonical product URL: https://luxemia.shop/product/<handle> */
  url?: string;
  image?: string;
  fulfillment?: PinCopyFulfillment;
}

export interface PinFulfillmentContext {
  shipsWithinDays?: number | null;
  isUnstitched?: boolean;
  isCustomTailored?: boolean;
  confirmAvailability?: boolean;
}

export declare const PIN_TITLE_MAX_LENGTH = 100;
export declare const PIN_DESCRIPTION_MAX_LENGTH = 500;
export declare const US_STANDARD_SHIPPING_RATE = 14.99;
export declare const US_FREE_SHIPPING_THRESHOLD = 150;
export declare const SUPPORT_PHONE: string;
export declare const LOCAL_ALTERATION_CREDIT_USD = 20;
export declare const ALTERATION_CLAIM_DAYS = 14;
export declare const SEAM_ALLOWANCE_INCHES = 2;
export declare const SEAM_ALLOWANCE_CM = 5;

export declare const READY_TO_SHIP_WINDOW: string;
export declare const CUSTOM_TAILORED_WINDOW: string;
export declare const DISPATCH_WINDOW: string;
export declare const TRANSIT_WINDOW: string;

export declare const DELIVERY_SENTENCES: Record<PinCopyFulfillment, string>;
export declare const LINING_SENTENCE: string;
export declare const MARGIN_SENTENCE: string;
export declare const SUPPORT_SENTENCE: string;

export declare function buildPinTitle(input?: PinCopyInput): string;
export declare function buildPinDescription(input?: PinCopyInput): string;
export declare function occasionFromTags(tags?: string[] | null): string | undefined;
export declare function resolvePinFulfillment(context?: PinFulfillmentContext): PinCopyFulfillment;
export declare function withShareUtm(
  url: string | undefined,
  source: string,
  medium?: string,
  campaign?: string,
): string;
export declare function buildPinterestShareUrl(input?: PinCopyInput): string;
export declare function buildWhatsAppShareText(title: string | undefined, url: string): string;
export declare function buildFacebookShareText(title: string | undefined, url: string): string;
