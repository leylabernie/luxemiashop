/**
 * Free retargeting infrastructure (Meta / Pinterest / TikTok).
 *
 * LuxeMia had NO marketing pixel anywhere, so every visitor was lost the
 * moment they left — retargeting (the only advertising a ~$2/day budget
 * can afford) was impossible. This loader fixes that permanently:
 *
 * - IDs come from environment variables. Creating the accounts and getting
 *   an ID costs $0 (Meta Events Manager, Pinterest Tag, TikTok Events
 *   Manager). With no ID set, this module is a complete no-op and loads
 *   nothing — no placeholder IDs are ever invented.
 * - Loading is gated by the same production-host switch as GA4
 *   (`window.luxemiaAnalyticsEnabled`, set in index.html), so QA/preview
 *   traffic never pollutes the audiences.
 * - Set in Vercel → Settings → Environment Variables, then redeploy:
 *     VITE_META_PIXEL_ID, VITE_PINTEREST_TAG_ID, VITE_TIKTOK_PIXEL_ID
 *
 * Once a pool of ~500+ product viewers exists, a $1–3/day retargeting
 * campaign becomes viable. Until then, spend nothing.
 */

declare global {
  interface Window {
    luxemiaAnalyticsEnabled?: boolean;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    pintrk?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void; page: () => void; load: (id: string) => void };
  }
}

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const PINTEREST_TAG_ID = import.meta.env.VITE_PINTEREST_TAG_ID as string | undefined;
const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined;

let initialized = false;

function analyticsAllowed(): boolean {
  return typeof window !== 'undefined' && window.luxemiaAnalyticsEnabled === true;
}

function loadScript(src: string) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

function initMeta() {
  if (!META_PIXEL_ID || window.fbq) return;
  // Standard Meta Pixel bootstrap (queue stub + async library load).
  const fbq = function (...args: unknown[]) {
    const fn = window.fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
    if (fn.callMethod) fn.callMethod(...args);
    else fn.queue.push(args);
  } as unknown as Window['fbq'] & { queue: unknown[]; loaded: boolean; version: string };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;
  loadScript('https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
}

function initPinterest() {
  if (!PINTEREST_TAG_ID || window.pintrk) return;
  const pintrk = function (...args: unknown[]) {
    const fn = window.pintrk as unknown as { queue: unknown[] };
    fn.queue.push(args);
  } as unknown as Window['pintrk'] & { queue: unknown[]; version: string };
  pintrk.queue = [];
  pintrk.version = '3.0';
  window.pintrk = pintrk;
  loadScript('https://s.pinimg.com/ct/core.js');
  window.pintrk('load', PINTEREST_TAG_ID);
}

function initTikTok() {
  if (!TIKTOK_PIXEL_ID || window.ttq) return;
  loadScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(TIKTOK_PIXEL_ID)}&lib=ttq`);
}

/** Load every configured pixel exactly once. No IDs configured → no-op. */
export function initMarketingPixels() {
  if (initialized || !analyticsAllowed()) return;
  if (!META_PIXEL_ID && !PINTEREST_TAG_ID && !TIKTOK_PIXEL_ID) return;
  initialized = true;
  initMeta();
  initPinterest();
  initTikTok();
}

/** Fire a PageView on SPA route changes (called from usePageTracking). */
export function trackMarketingPageView() {
  if (!initialized || !analyticsAllowed()) return;
  try {
    window.fbq?.('track', 'PageView');
    window.pintrk?.('pagevisit');
    window.ttq?.page();
  } catch {
    // A blocked third-party script must never break navigation.
  }
}

/**
 * Fire a product ViewContent event. `contentId` must be the same product
 * identifier used in the catalogue feed (public/feeds/meta-catalog.csv),
 * otherwise retargeting cannot match the viewed product to the catalogue.
 */
export function trackMarketingViewContent(contentId: string, value?: number, currency = 'USD') {
  if (!initialized || !analyticsAllowed() || !contentId) return;
  try {
    window.fbq?.('track', 'ViewContent', {
      content_ids: [contentId],
      content_type: 'product',
      ...(typeof value === 'number' && Number.isFinite(value) && { value, currency }),
    });
    window.pintrk?.('track', 'pagevisit');
    window.ttq?.track('ViewContent', {
      content_id: contentId,
      content_type: 'product',
      ...(typeof value === 'number' && Number.isFinite(value) && { value, currency }),
    });
  } catch {
    // Never break the shopping experience for a tracking call.
  }
}
