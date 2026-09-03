import { toAnalyticsPageUrl, toAnalyticsReferrerOrigin } from './analyticsPrivacy';

export const GA_MEASUREMENT_ID = 'G-D1NN0TC3Y0';
export const ANALYTICS_CONSENT_STORAGE_KEY = 'luxemia.analytics-consent.v1';
export const ANALYTICS_CONSENT_CHANGED_EVENT = 'luxemia:analytics-consent-changed';
export const OPEN_ANALYTICS_SETTINGS_EVENT = 'luxemia:open-analytics-settings';
export const ANALYTICS_SETTINGS_VISIBILITY_EVENT = 'luxemia:analytics-settings-visibility';

export type AnalyticsConsentChoice = 'accepted' | 'declined';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GOOGLE_TAG_SCRIPT_ID = 'luxemia-ga4-script';
const GA_DISABLE_KEY = `ga-disable-${GA_MEASUREMENT_ID}`;

let sessionChoice: AnalyticsConsentChoice | null = null;
let sessionOverrideActive = false;
let analyticsConfigured = false;

const isConsentChoice = (value: string | null): value is AnalyticsConsentChoice => (
  value === 'accepted' || value === 'declined'
);

export function getAnalyticsConsent(): AnalyticsConsentChoice | null {
  if (typeof window === 'undefined') return sessionChoice;
  if (sessionOverrideActive) return sessionChoice;

  try {
    const storedChoice = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    if (isConsentChoice(storedChoice)) {
      sessionChoice = storedChoice;
      return storedChoice;
    }
    sessionChoice = null;
    return null;
  } catch {
    // Storage can be unavailable in hardened browser modes. The in-memory
    // choice still applies for the current page without enabling by default.
  }

  return sessionChoice;
}

function dispatchConsentChange(choice: AnalyticsConsentChoice | null) {
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_CHANGED_EVENT, {
    detail: { choice },
  }));
}

let storageListenerAttached = false;

function ensureStorageListener() {
  if (storageListenerAttached || typeof window === 'undefined') return;

  window.addEventListener('storage', (event) => {
    if (event.key !== ANALYTICS_CONSENT_STORAGE_KEY && event.key !== null) return;

    const nextChoice = event.key === null
      ? null
      : (isConsentChoice(event.newValue) ? event.newValue : null);
    sessionChoice = nextChoice;
    sessionOverrideActive = false;
    if (nextChoice === 'accepted') enableAnalytics();
    else disableAnalytics();
    dispatchConsentChange(nextChoice);
  });
  storageListenerAttached = true;
}

export function isAnalyticsConsentGranted(): boolean {
  return getAnalyticsConsent() === 'accepted';
}

function setGaDisabled(disabled: boolean) {
  (window as unknown as Record<string, unknown>)[GA_DISABLE_KEY] = disabled;
}

function ensureGtagQueue() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => {
    if (args[0] === 'event' && !isAnalyticsConsentGranted()) return;
    window.dataLayer?.push(args);
  });
}

function clearGoogleAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0]?.trim())
    .filter((name): name is string => Boolean(name) && (
      name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat') || name === '_gcl_au'
    ));

  const domainCandidates = new Set([
    window.location.hostname,
    `.${window.location.hostname}`,
    'luxemia.shop',
    '.luxemia.shop',
  ]);

  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    for (const domain of domainCandidates) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
    }
  }
}

export function enableAnalytics(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (!isAnalyticsConsentGranted()) return false;

  setGaDisabled(false);
  ensureGtagQueue();

  if (!analyticsConfigured) {
    const tagAlreadyLoaded = Boolean(document.getElementById(GOOGLE_TAG_SCRIPT_ID));
    window.gtag?.('consent', tagAlreadyLoaded ? 'update' : 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    if (!tagAlreadyLoaded) {
      const pageLocation = toAnalyticsPageUrl(window.location.href);
      const pageReferrer = toAnalyticsReferrerOrigin(document.referrer);
      window.gtag?.('js', new Date());
      window.gtag?.('config', GA_MEASUREMENT_ID, {
        send_page_view: false,
        ...(pageLocation && { page_location: pageLocation }),
        ...(pageReferrer && { page_referrer: pageReferrer }),
        allow_google_signals: false,
        linked_domains: ['luxemia.shop'],
      });
    }
    analyticsConfigured = true;
  }

  if (!document.getElementById(GOOGLE_TAG_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = GOOGLE_TAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  return true;
}

export function setAnalyticsPageContext(pageLocation: string, pageReferrer?: string): boolean {
  if (!isAnalyticsConsentGranted() || typeof window.gtag !== 'function') return false;

  const safeLocation = toAnalyticsPageUrl(pageLocation);
  const safeReferrer = toAnalyticsPageUrl(pageReferrer);
  if (!safeLocation) return false;

  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    page_location: safeLocation,
    ...(safeReferrer && { page_referrer: safeReferrer }),
    allow_google_signals: false,
  });
  return true;
}

export function disableAnalytics() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window.gtag?.('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  setGaDisabled(true);
  clearGoogleAnalyticsCookies();
  delete window.gtag;
  analyticsConfigured = false;
}

export function initializeAnalyticsFromStoredConsent(): boolean {
  ensureStorageListener();
  if (isAnalyticsConsentGranted()) return enableAnalytics();
  disableAnalytics();
  return false;
}

export function setAnalyticsConsent(choice: AnalyticsConsentChoice) {
  ensureStorageListener();
  sessionChoice = choice;
  sessionOverrideActive = false;

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice);
  } catch {
    // Keep the latest explicit choice authoritative for this page when storage
    // is blocked, including a decline over an older persisted acceptance.
    sessionOverrideActive = true;
  }

  if (choice === 'accepted') enableAnalytics();
  else disableAnalytics();

  dispatchConsentChange(choice);
}

export function openAnalyticsConsentSettings() {
  announceAnalyticsSettingsVisibility(true);
  window.dispatchEvent(new Event(OPEN_ANALYTICS_SETTINGS_EVENT));
}

export function announceAnalyticsSettingsVisibility(open: boolean) {
  window.dispatchEvent(new CustomEvent(ANALYTICS_SETTINGS_VISIBILITY_EVENT, {
    detail: { open },
  }));
}
