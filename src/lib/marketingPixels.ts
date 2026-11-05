import { hasMarketingConsent, subscribeMarketingConsent, reloadWithMarketingDenied } from './marketingConsent.ts';

// Bootstrap contract from TikTok Events Manager's standard base code. Keep the
// https://business-api.tiktok.com/gateway/docs/index?doc_id=1795929012554754
// metadata and instance queues: events.js consumes these, not just track/page.
const TIKTOK_METHODS = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off',
  'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
  'holdConsent', 'revokeConsent', 'grantConsent'] as const;
type TikTokMethod = typeof TIKTOK_METHODS[number];
type TikTokQueue = unknown[][] & Record<TikTokMethod, (...args: unknown[]) => void>;
type TikTokPixelQueue = TikTokQueue & { _u?: string };
type TikTokSdk = TikTokQueue & {
  methods: readonly TikTokMethod[];
  setAndDefer: (queue: TikTokQueue, method: TikTokMethod) => void;
  instance: (id: string) => TikTokPixelQueue;
  load: (id: string, options?: Record<string, unknown>) => void;
  _i: Record<string, TikTokPixelQueue>;
  _t: Record<string, number>;
  _o: Record<string, Record<string, unknown>>;
};
type MetaPixel = ((...args: unknown[]) => void) & {
  queue: unknown[][]; callMethod?: (...args: unknown[]) => void;
  push?: MetaPixel; loaded?: boolean; version?: string;
};
type PinterestTag = ((...args: unknown[]) => void) & { queue: unknown[][]; version: string };

declare global {
  interface Window {
    luxemiaAnalyticsEnabled?: boolean;
    fbq?: MetaPixel;
    _fbq?: MetaPixel;
    pintrk?: PinterestTag;
    TiktokAnalyticsObject?: string;
    ttq?: TikTokSdk;
  }
}

export interface MarketingPixelIds { meta?: string; pinterest?: string; tiktok?: string }
const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
export const MARKETING_PIXEL_IDS: MarketingPixelIds = {
  meta: viteEnv.VITE_META_PIXEL_ID, pinterest: viteEnv.VITE_PINTEREST_TAG_ID,
  tiktok: viteEnv.VITE_TIKTOK_PIXEL_ID,
};
export interface MarketingTracker {
  init: () => void;
  pageView: () => void;
  viewContent: (contentId: string, value?: number, currency?: string) => void;
  revoke: () => void;
}

export function createMarketingTracker(ids: MarketingPixelIds, consentAllowed = hasMarketingConsent): MarketingTracker {
  let initialized = false;
  const allowed = () => typeof window !== 'undefined' && window.luxemiaAnalyticsEnabled === true && consentAllowed();
  const safely = (call: () => void) => { try { call(); } catch { /* Never break shopping. */ } };
  function loadScript(src: string) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  }
  function initMeta() {
    if (!ids.meta || window.fbq) return;
    const fbq: MetaPixel = Object.assign(function (...args: unknown[]) {
      if (!allowed()) {
        if (args[0] === 'consent' && args[1] === 'revoke') fbq.callMethod?.(...args);
        return;
      }
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }, { queue: [] as unknown[][], loaded: true, version: '2.0' });
    fbq.push = fbq;
    window.fbq = fbq;
    window._fbq = fbq;
    fbq('init', ids.meta);
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
  }
  function initPinterest() {
    if (!ids.pinterest || window.pintrk) return;
    const pintrk: PinterestTag = Object.assign(function (...args: unknown[]) {
      if (allowed()) pintrk.queue.push(args);
    }, { queue: [] as unknown[][], version: '3.0' });
    window.pintrk = pintrk;
    pintrk('load', ids.pinterest);
    loadScript('https://s.pinimg.com/ct/core.js');
  }
  function initTikTok() {
    if (!ids.tiktok || window.ttq) return;
    window.TiktokAnalyticsObject = 'ttq';
    const setAndDefer = (queue: TikTokQueue, method: TikTokMethod) => {
      queue[method] = (...args: unknown[]) => {
        if (allowed()) queue.push([method, ...args]);
      };
    };
    const makeQueue = (): TikTokQueue => {
      // Methods are installed immediately below before the queue is exposed.
      const queue = [] as unknown as TikTokQueue;
      for (const method of TIKTOK_METHODS) setAndDefer(queue, method);
      return queue;
    };
    const sdkUrl = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    const ttq: TikTokSdk = Object.assign(makeQueue(), {
      methods: TIKTOK_METHODS, setAndDefer,
      _i: {} as Record<string, TikTokPixelQueue>,
      _t: {} as Record<string, number>,
      _o: {} as Record<string, Record<string, unknown>>,
      instance(id: string) {
        const queue = ttq._i[id] ?? makeQueue();
        for (const method of TIKTOK_METHODS) setAndDefer(queue, method);
        return queue;
      },
      load(id: string, options: Record<string, unknown> = {}) {
        ttq._i[id] = Object.assign(makeQueue(), { _u: sdkUrl });
        ttq._t[id] = +new Date();
        ttq._o[id] = options;
        loadScript(`${sdkUrl}?sdkid=${encodeURIComponent(id)}&lib=ttq`);
      },
    });
    window.ttq = ttq;
    ttq.load(ids.tiktok);
  }
  function init() {
    if (initialized || !allowed() || (!ids.meta && !ids.pinterest && !ids.tiktok)) return;
    initialized = true;
    safely(initMeta); safely(initPinterest); safely(initTikTok);
  }
  function pageView() {
    init();
    if (!initialized || !allowed()) return;
    if (ids.meta) safely(() => window.fbq?.('track', 'PageView'));
    if (ids.pinterest) safely(() => window.pintrk?.('track', 'pagevisit'));
    if (ids.tiktok) safely(() => window.ttq?.page());
  }
  function viewContent(contentId: string, value?: number, currency = 'USD') {
    if (!contentId) return;
    init();
    if (!initialized || !allowed()) return;
    const price = typeof value === 'number' && Number.isFinite(value) ? { value, currency } : {};
    if (ids.meta) safely(() => window.fbq?.('track', 'ViewContent', { content_ids: [contentId], content_type: 'product', ...price }));
    // Pinterest pagevisit belongs exclusively to the route tracker, not the PDP.
    if (ids.tiktok) safely(() => window.ttq?.track('ViewContent', { content_id: contentId, content_type: 'product', ...price }));
  }
  function revoke() {
    // Clear not-yet-delivered work before the consent controller reloads denied.
    // Already-started requests cannot be undone by JavaScript.
    if (ids.meta) safely(() => { if (window.fbq?.queue) window.fbq.queue.length = 0; window.fbq?.('consent', 'revoke'); });
    if (ids.pinterest) safely(() => { if (window.pintrk?.queue) window.pintrk.queue.length = 0; });
    if (ids.tiktok) safely(() => {
      const ttq = window.ttq;
      if (!ttq) return;
      if (Array.isArray(ttq)) ttq.length = 0;
      for (const queue of Object.values(ttq._i ?? {})) if (Array.isArray(queue)) queue.length = 0;
      ttq.revokeConsent?.();
      ttq.disableCookie?.();
    });
  }
  return { init, pageView, viewContent, revoke };
}
const defaultTracker = createMarketingTracker(MARKETING_PIXEL_IDS);
subscribeMarketingConsent(consent => {
  if (consent === 'granted') defaultTracker.pageView();
  else {
    defaultTracker.revoke();
    if (typeof window !== 'undefined' && (window.fbq || window.pintrk || window.ttq)) reloadWithMarketingDenied();
  }
});
export const initMarketingPixels = defaultTracker.init;
export const trackMarketingPageView = defaultTracker.pageView;
export const trackMarketingViewContent = defaultTracker.viewContent;
