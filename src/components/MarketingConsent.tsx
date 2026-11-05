import { useEffect, useRef, useState } from 'react';
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
  const choicesButton = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const visible = consent === 'unknown' || open;

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
        className="fixed bottom-24 left-3 z-50 rounded-md border border-foreground/30 bg-background px-3 py-2 text-xs text-foreground shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Privacy choices
      </button>
      {visible && (
        <section
          id="marketing-privacy-choices"
          aria-labelledby="marketing-privacy-title"
          className="fixed bottom-36 left-3 right-3 z-50 max-h-[65vh] overflow-y-auto rounded-lg border border-foreground/30 bg-background p-5 text-foreground shadow-xl sm:left-auto sm:max-w-md"
        >
          <h2 ref={title} tabIndex={-1} id="marketing-privacy-title" className="text-lg font-medium">
            Marketing privacy choices
          </h2>
          <p className="mt-2 text-sm">
            With your permission, we use Meta, Pinterest and TikTok marketing pixels
            to measure ads and show relevant ads based on pages and products you view.
            These partners may receive browsing information and cookie identifiers.
            Marketing pixels stay off unless you accept for this visit.
          </p>
          <p className="mt-2 text-sm">
            You can reject or withdraw permission here at any time. Acceptance applies until the page reloads; rejection is remembered when browser storage is available. This choice does
            not affect shopping or change separate analytics and checkout settings.
            {' '}<a href="/privacy" className="underline">Privacy Policy</a>
          </p>
          <p className="mt-2 text-xs" role="status">
            {consent === 'granted' ? 'Marketing pixels: allowed.' : 'Marketing pixels: off.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => choose('denied')} className="min-h-11 flex-1 rounded-md border border-foreground px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              {consent === 'granted' ? 'Withdraw permission' : 'Reject marketing'}
            </button>
            <button type="button" onClick={() => choose('granted')} className="min-h-11 flex-1 rounded-md border border-foreground px-4 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              Accept marketing
            </button>
          </div>
          {consent !== 'unknown' && (
            <button type="button" onClick={() => { setOpen(false); choicesButton.current?.focus(); }} className="mt-3 min-h-11 text-sm underline">
              Close
            </button>
          )}
        </section>
      )}
    </>
  );
}
