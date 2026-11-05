export type MarketingConsent = 'unknown' | 'granted' | 'denied';
export type MarketingConsentChoice = Exclude<MarketingConsent, 'unknown'>;

export const MARKETING_CONSENT_KEY = 'luxemia.marketing.consent.v1';
export const MARKETING_DENIED_PARAM = 'luxemia_marketing';

type ConsentListener = (consent: MarketingConsent) => void;

// A narrow, explicit first-party choice. Analytics enablement and newsletter
// signup are deliberately not interpreted as marketing-pixel consent.
export function createMarketingConsentStore(getWindow: () => Window | undefined = () =>
  typeof window === 'undefined' ? undefined : window) {
  let current: MarketingConsent = 'unknown';
  let initialized = false;
  const listeners = new Set<ConsentListener>();
  // Only denials persist. A stored grant can outlive a failed revocation write,
  // so each full document must obtain its own affirmative acceptance.
  const parse = (value: string | null): MarketingConsent =>
    value === 'denied' || value?.startsWith('denied:') ? 'denied' : 'unknown';

  function notify(next: MarketingConsent) {
    if (next === current) return;
    current = next;
    for (const listener of listeners) {
      // A vendor failure must not prevent other subscribers from revoking.
      try { listener(current); } catch { /* Continue notifying. */ }
    }
  }

  function initialize() {
    const browser = getWindow();
    if (initialized || !browser) return;
    initialized = true;
    const explicitlyDenied = new URLSearchParams(browser.location?.search ?? '').get(MARKETING_DENIED_PARAM) === 'denied';
    try {
      current = explicitlyDenied ? 'denied' : parse(browser.localStorage.getItem(MARKETING_CONSENT_KEY));
      // A URL marker is local fail-closed state, not a fresh cross-tab choice.
    }
    catch { current = explicitlyDenied ? 'denied' : 'unknown'; }
    browser.addEventListener('storage', (event: StorageEvent) => {
      if (event.key !== MARKETING_CONSENT_KEY && event.key !== null) return;
      // Ignore unrelated sessionStorage updates; access can itself be denied.
      try {
        if (event.storageArea && event.storageArea !== browser.localStorage) return;
      } catch { /* Treat a relevant removal as denial even if storage is blocked. */ }
      // Acceptance is document-local. Another tab cannot override this tab's
      // explicit denial or revive a stale grant after storage failures.
      if (event.newValue === 'granted') return;
      notify(event.key === null ? 'unknown' : parse(event.newValue));
    });
  }

  function get(): MarketingConsent {
    initialize();
    return current;
  }

  function set(choice: MarketingConsentChoice) {
    initialize();
    // Runtime guard for callers outside TypeScript. Invalid input never grants.
    const next = choice === 'granted' ? 'granted' : 'denied';
    if (next === 'granted') {
      const browser = getWindow();
      // An explicit new acceptance clears a previous fail-closed reload marker.
      if (browser?.location?.href) {
        const url = new URL(browser.location.href);
        if (url.searchParams.has(MARKETING_DENIED_PARAM)) {
          url.searchParams.delete(MARKETING_DENIED_PARAM);
          try { browser.history.replaceState(browser.history.state, '', url.href); }
          catch { return; } // Do not grant when the denial marker cannot be cleared.
        }
      }
    }
    if (next === 'denied') {
      try { getWindow()?.localStorage.setItem(MARKETING_CONSENT_KEY, `denied:${Date.now()}:${Math.random()}`); }
      catch { /* The in-document denial still applies, even if storage fails. */ }
    }
    notify(next);
  }

  function subscribe(listener: ConsentListener) {
    initialize();
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }

  return { get, set, subscribe };
}

const consentStore = createMarketingConsentStore();
export const getMarketingConsent = consentStore.get;
export const setMarketingConsent = consentStore.set;
export const subscribeMarketingConsent = consentStore.subscribe;
export const hasMarketingConsent = () => getMarketingConsent() === 'granted';

let reloadRequested = false;

// Script removal alone cannot unload a vendor SDK or its automatic listeners.
// A denied URL marker makes this new document safe even if storage writes fail.
export function reloadWithMarketingDenied(browser: Window | undefined = typeof window === 'undefined' ? undefined : window) {
  if (!browser || reloadRequested) return;
  const url = new URL(browser.location.href);
  url.searchParams.set(MARKETING_DENIED_PARAM, 'denied');
  reloadRequested = true;
  browser.location.replace(url.href);
}
