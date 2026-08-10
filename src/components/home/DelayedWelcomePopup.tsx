import { lazy, Suspense, useEffect, useState } from 'react';

const NewVisitorPopup = lazy(() => import('./NewVisitorPopup'));

const DISPLAY_DELAY_MS = 15_000;
const DISMISSED_STORAGE_KEY = 'luxemia_welcome_offer_dismissed_v2';
const EXCLUDED_PATH_PREFIXES = ['/account', '/admin', '/auth', '/order-confirmation'];

const DelayedWelcomePopup = () => {
  const [shouldDisplay, setShouldDisplay] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(DISMISSED_STORAGE_KEY) === 'true') return;

    const timer = window.setTimeout(() => {
      const isExcludedPath = EXCLUDED_PATH_PREFIXES.some((path) =>
        window.location.pathname.startsWith(path),
      );

      if (!isExcludedPath) setShouldDisplay(true);
    }, DISPLAY_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
    setShouldDisplay(false);
  };

  return shouldDisplay ? (
    <Suspense fallback={null}>
      <NewVisitorPopup onDismiss={handleDismiss} />
    </Suspense>
  ) : null;
};

export default DelayedWelcomePopup;
