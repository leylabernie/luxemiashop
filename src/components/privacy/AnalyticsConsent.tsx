import { useEffect, useRef, useState } from 'react';
import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  announceAnalyticsSettingsVisibility,
  type AnalyticsConsentChoice,
  getAnalyticsConsent,
  initializeAnalyticsFromStoredConsent,
  OPEN_ANALYTICS_SETTINGS_EVENT,
  setAnalyticsConsent,
} from '@/lib/analyticsConsent';

const AnalyticsConsent = () => {
  const [choice, setChoice] = useState<AnalyticsConsentChoice | null>(() => getAnalyticsConsent());
  const [isOpen, setIsOpen] = useState(() => (
    choice === null || (typeof window !== 'undefined' && window.location.hash === '#cookie-settings')
  ));
  const panelRef = useRef<HTMLElement>(null);
  const declineButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    initializeAnalyticsFromStoredConsent();

    const openSettings = () => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      setChoice(getAnalyticsConsent());
      setIsOpen(true);
    };
    const syncChoice = (event: Event) => {
      const nextChoice = (event as CustomEvent<{ choice?: AnalyticsConsentChoice | null }>).detail?.choice;
      if (nextChoice === 'accepted' || nextChoice === 'declined') {
        setChoice(nextChoice);
      } else {
        setChoice(null);
        announceAnalyticsSettingsVisibility(true);
        setIsOpen(true);
      }
    };

    window.addEventListener(OPEN_ANALYTICS_SETTINGS_EVENT, openSettings);
    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, syncChoice);
    return () => {
      window.removeEventListener(OPEN_ANALYTICS_SETTINGS_EVENT, openSettings);
      window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, syncChoice);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const animationFrame = window.requestAnimationFrame(() => declineButtonRef.current?.focus());
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isOpen]);

  useEffect(() => {
    announceAnalyticsSettingsVisibility(isOpen);
  }, [isOpen]);

  const closeAndRestoreFocus = () => {
    announceAnalyticsSettingsVisibility(false);
    setIsOpen(false);
    if (window.location.hash === '#cookie-settings') {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  const saveChoice = (nextChoice: AnalyticsConsentChoice) => {
    if (nextChoice === choice) {
      initializeAnalyticsFromStoredConsent();
      closeAndRestoreFocus();
      return;
    }

    setAnalyticsConsent(nextChoice);
    setChoice(nextChoice);
    closeAndRestoreFocus();
  };

  if (!isOpen) return null;

  return (
    <section
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="analytics-consent-title"
      aria-describedby="analytics-consent-description"
      tabIndex={-1}
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-md border border-border bg-background p-5 shadow-2xl focus:outline-none sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <div className="pr-8">
        <h2 id="analytics-consent-title" className="font-serif text-xl text-foreground">
          Analytics preferences
        </h2>
        <p id="analytics-consent-description" className="mt-2 text-sm leading-relaxed text-foreground/70">
          Optional Google Analytics helps us understand how the storefront is used. It stays off unless you accept analytics. Essential site functions and their storage continue either way.
        </p>
        {choice ? (
          <p className="mt-2 text-xs text-foreground/80" aria-live="polite">
            Current choice: analytics {choice === 'accepted' ? 'accepted' : 'declined'}.
          </p>
        ) : null}
      </div>

      {choice ? (
        <button
          type="button"
          onClick={closeAndRestoreFocus}
          className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-md text-2xl leading-none text-foreground/70 hover:bg-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          aria-label="Close analytics settings"
        >
          ×
        </button>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          ref={declineButtonRef}
          type="button"
          onClick={() => saveChoice('declined')}
          className="min-h-11 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Decline analytics
        </button>
        <button
          type="button"
          onClick={() => saveChoice('accepted')}
          className="min-h-11 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Accept analytics
        </button>
      </div>
    </section>
  );
};

export default AnalyticsConsent;
