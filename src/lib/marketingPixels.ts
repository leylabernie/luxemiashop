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
 * Event-delivery guarantees (regression-tested in
 * tests/marketingPixels.test.mjs):
 * - Every track* call lazily initialises the pixels first, so the very
 *   first PageView of a single-page visit is not dropped when the page
 *   tracker fires before the app-level init effect.
 * - All three networks get a queue stub installed BEFORE their library
 *   script is requested, so events fired while a library is still
 *   loading are queued and replayed by the library — never lost.
 * - Pinterest events use the `track` command (`pintrk('track',
 *   'pagevisit')`); a bare `pintrk('pagevisit')` is not a valid command.
 *
 * Once a pool of ~500+ product viewers exists, a $1–3/day retargeting
 * campaign becomes viable. Until then, spend nothing.
 */

declare global {
  interface Window {
    luxemiaAnalyticsEnabled?: boolean;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
    _fbq?: unknown;
    pintrk?: ((...args: unknown[]) => void) & { queue?: unknown[] };
    ttq?: {
      track: (...args: unknown[]) => void;
      page: () => void;
      load: (id: string) => void;
    };
  }
}

export interface MarketingPixelIds {
  meta?: string;
  pinterest?: string;
  tiktok?: string;
}

// `import.meta.env` only exists under Vite; guard so Node tests can import.
const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const MARKETING_PIXEL_IDS: MarketingPixelIds = {
  meta: viteEnv.VITE_META_PIXEL_ID,
  pinterest: viteEnv.VITE_PINTEREST_TAG_ID,
  tiktok: viteEnv.VITE_TIKTOK_PIXEL_ID,
};

export interface MarketingTracker {
  init: () => void;
  pageView: () => void;
  viewContent: (contentId: string, value?: number, currency?: string) => void;
}

export function createMarketingTracker(ids: MarketingPixelIds): MarketingTracker {
  let initialized = false;

  function analyticsAllowed(): boolean {
    return typeof window !== 'undefined' && window.luxemiaAnalyticsEnabled === true;
  }

  function loadScript(src: string) {
    const script = document.createElement('script') as HTMLScriptElement;
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  }

  function initMeta() {
    if (!ids.meta || window.fbq) return;
    // Standard Meta Pixel bootstrap: the stub queues every call made
    // before fbevents.js arrives, and the library drains the queue.
    const fbq = function (...args: unknown[]) {
      const fn = window.fbq as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
      if (fn.callMethod) fn.callMethod(...args);
      else fn.queue.push(args);
    } as Window['fbq'] & { queue: unknown[]; loaded: boolean; version: string };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    window._fbq = fbq;
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', ids.meta);
  }

  function initPinterest() {
    if (!ids.pinterest || window.pintrk) return;
    const pintrk = function (...args: unknown[]) {
      const fn = window.pintrk as { queue: unknown[] };
      fn.queue.push(args);
    } as Window['pintrk'] & { queue: unknown[]; version: string };
    pintrk.queue = [];
    pintrk.version = '3.0';
    window.pintrk = pintrk;
    loadScript('https://s.pinimg.com/ct/core.js');
    window.pintrk('load', ids.pinterest);
  }

  function initTikTok() {
    if (!ids.tiktok || window.ttq) return;
    // Official TikTok queue stub: `ttq` is an array; every method call
    // made before events.js arrives is pushed as [method, ...args] and
    // replayed by the library when it loads. Without this stub,
    // window.ttq is undefined until the script lands and early product
    // events are silently dropped.
    const ttq = [] as unknown[] & Record<string, unknown>;
    const methods = [
      'track', 'page', 'identify', 'instances', 'debug', 'on', 'off',
      'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
    ];
    for (const method of methods) {
      ttq[method] = (...args: unknown[]) => {
        ttq.push([method, ...args]);
      };
    }
    ttq.load = (id: string) => {
      loadScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`);
    };
    window.ttq = ttq as unknown as Window['ttq'];
    (ttq.load as (id: string) => void)(ids.tiktok);
  }

  /** Load every configured pixel exactly once. No IDs configured → no-op. */
  function init() {
    if (initialized || !analyticsAllowed()) return;
    if (!ids.meta && !ids.pinterest && !ids.tiktok) return;
    initialized = true;
    initMeta();
    initPinterest();
    initTikTok();
  }

  /** Fire a PageView on SPA route changes (called from usePageTracking). */
  function pageView() {
    // Lazy init: the page tracker can fire before the app-level init
    // effect (and always fires on the first route). Initialising here
    // guarantees the first PageView of a single-page visit is delivered
    // (queued on the stubs if a library is still loading).
    init();
    if (!initialized || !analyticsAllowed()) return;
    try {
      window.fbq?.('track', 'PageView');
      window.pintrk?.('track', 'pagevisit');
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
  function viewContent(contentId: string, value?: number, currency = 'USD') {
    init();
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

  return { init, pageView, viewContent };
}

const defaultTracker = createMarketingTracker(MARKETING_PIXEL_IDS);

/** Load every configured pixel exactly once. No IDs configured → no-op. */
export function initMarketingPixels() {
  defaultTracker.init();
}

/** Fire a PageView on SPA route changes (called from usePageTracking). */
export function trackMarketingPageView() {
  defaultTracker.pageView();
}

/** Fire a product ViewContent event keyed by catalogue-feed product id. */
export function trackMarketingViewContent(contentId: string, value?: number, currency = 'USD') {
  defaultTracker.viewContent(contentId, value, currency);
}
