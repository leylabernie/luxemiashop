import { useEffect, useRef, useState } from 'react';
import { MARKETING_PIXEL_IDS } from '@/lib/marketingPixels';
import {
  getMarketingConsent,
  reloadWithMarketingDenied,
  setMarketingConsent,
  subscribeMarketingConsent,
  type MarketingConsentChoice,
} from '@/lib/marketingConsent';

/** Marketing-only controls; this does not change analytics or checkout consent. */
export default function MarketingConsent() {
  const [consent, setConsent] = useState(getMarketingConsent);
  const [open, setOpen] = useState(false);
  const [isProductRoute, setIsProductRoute] = useState(false);
  const choicesButton = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  // No pixels configured → nothing to consent to. Suppress the initial
  // unknown-state banner so first-time mobile shoppers keep the page
  // unblocked; the shopper can still open Privacy choices manually.
  const hasPixels = Boolean(
    MARKETING_PIXEL_IDS.meta || MARKETING_PIXEL_IDS.pinterest || MARKETING_PIXEL_IDS.tiktok,
  );
  const visible = (consent === 'unknown' && hasPixels) || open;

  useEffect(() => {
    setIsProductRoute(
      typeof window !== 'undefined' && window.location.pathname.startsWith('/product/'),
    );
  }, []);
  useEffect(() => subscribeMarketingConsent(setConsent), []);
  useEffect(() => { if (open) title.current?.focus(); }, [open]);

  const choose = (choice: MarketingConsentChoice) => {
    setMarketingConsent(choice);
    if (choice === 'denied' && consent === 'granted') reloadWithMarketingDenied();
    setOpen(false);
    choicesButton.current?.focus();
  };

  return (
    <>
      <button
        ref={choicesButton}
        type="button"
        aria-expanded={visible}
        aria-controls="marketing-privacy-choices"
        onClick={() => setOpen(true)}
        className={
          visible
            ? 'sr-only focus:not-sr-only focus:fixed focus:bottom-20 focus:left-3 focus:z-50 focus:rounded-md focus:border focus:border-foreground/30 focus:bg-background focus:px-3 focus:py-2 focus:text-xs focus:text-foreground focus:shadow-md'
            : `fixed ${isProductRoute ? 'bottom-[calc(8rem+env(safe-area-inset-bottom,0px))]' : 'bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]'} left-3 z-40 rounded-full border border-foreground/30 bg-background px-3 py-1.5 text-[11px] text-foreground shadow-md transition-colors hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:bottom-4`
        }
      >
        Privacy choices
      </button>
      {visible && (
        <section
          id="marketing-privacy-choices"
          aria-labelledby="marketing-privacy-title"
          className={`fixed ${isProductRoute ? 'bottom-[calc(8.5rem+env(safe-area-inset-bottom,0px))]' : 'bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]'} left-2.5 right-2.5 z-50 isolate max-h-[45dvh] overflow-y-auto rounded-lg border border-foreground/30 bg-background p-3.5 text-foreground shadow-2xl sm:left-4 sm:right-auto sm:max-w-md sm:p-4 lg:bottom-4`}
        >
          <div className="flex items-start justify-between gap-2">
            <h2 ref={title} tabIndex={-1} id="marketing-privacy-title" className="text-sm font-medium leading-snug">
              Marketing privacy choices
            </h2>
            {consent !== 'unknown' && (
              <button
                type="button"
                onClick={() => { setOpen(false); choicesButton.current?.focus(); }}
                className="-mt-1 -mr-1 min-h-9 px-2 text-xs underline"
              >
                Close
              </button>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-foreground/85">
            Optional Meta, Pinterest, and TikTok ad pixels stay off unless you accept for this visit; reject anytime.{' '}
            <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>
          </p>
          <details className="mt-1 text-xs text-foreground/75">
            <summary className="cursor-pointer select-none font-medium text-foreground/80 underline underline-offset-2">
              More details
            </summary>
            <p className="mt-1.5 leading-relaxed">
              When accepted, partners may receive page/product browsing info and cookie IDs to measure and personalize ads.
              Acceptance lasts until reload; rejection is saved when browser storage is available. Shopping, analytics, and
              checkout settings are unaffected.
            </p>
            <p className="mt-1 text-[11px]" role="status">
              {consent === 'granted' ? 'Marketing pixels: allowed.' : 'Marketing pixels: off.'}
            </p>
          </details>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => choose('denied')}
              className="min-h-11 rounded-md border border-foreground px-3 py-2 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {consent === 'granted' ? 'Withdraw permission' : 'Reject marketing'}
            </button>
            <button
              type="button"
              onClick={() => choose('granted')}
              className="min-h-11 rounded-md border border-foreground bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Accept marketing
            </button>
          </div>
        </section>
      )}
    </>
  );
}
