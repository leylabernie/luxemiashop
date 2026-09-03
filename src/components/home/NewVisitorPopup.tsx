import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { X, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  ANALYTICS_SETTINGS_VISIBILITY_EVENT,
  getAnalyticsConsent,
  type AnalyticsConsentChoice,
} from '@/lib/analyticsConsent';

// CRITICAL: Do NOT import supabase at the top level.
// The supabase client chunk (~44KB / 37KB unused) was previously bundled
// into the initial payload even though it is only used inside handleSubmit.
// Calling the configured Edge Function URL directly avoids loading that client
// chunk and, unlike a hardcoded project hostname, follows the deployed app's
// VITE_SUPABASE_URL source of truth.
// See PSI diagnosis 2026-07-15: "Reduce unused JavaScript — vendor-supabase 44KB".

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .email('Please enter a valid email address')
    .refine(
      (email) => !/<|>|script|javascript|on\w+=/i.test(email),
      'Invalid characters in email'
    ),
});

const RATE_LIMIT_KEY = 'newsletter_submit_timestamps';
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 3;
const DISCOUNT_CODE = 'LUXE10';
const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');

type PopupStorage = Pick<Storage, 'getItem' | 'setItem'>;

const getPopupStorage = (): PopupStorage | null => {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    // Some privacy modes throw while accessing the localStorage property.
    return null;
  }
};

const readPopupStorageItem = (
  key: string,
  storage: PopupStorage | null = getPopupStorage(),
): string | null => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writePopupStorageItem = (
  key: string,
  value: string,
  storage: PopupStorage | null = getPopupStorage(),
): boolean => {
  try {
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const parseRateLimitTimestamps = (stored: string | null): number[] => {
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (timestamp): timestamp is number => typeof timestamp === 'number' && Number.isFinite(timestamp),
    );
  } catch {
    return [];
  }
};

const getRateLimitTimestamps = (): number[] => (
  parseRateLimitTimestamps(readPopupStorageItem(RATE_LIMIT_KEY))
);

const checkRateLimit = (): boolean => {
  const now = Date.now();
  const timestamps = getRateLimitTimestamps();
  const recentAttempts = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  return recentAttempts.length < MAX_ATTEMPTS;
};

const recordAttempt = () => {
  const now = Date.now();
  const timestamps = getRateLimitTimestamps();
  const recentAttempts = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  recentAttempts.push(now);
  writePopupStorageItem(RATE_LIMIT_KEY, JSON.stringify(recentAttempts));
};

// ─── Trigger tuning ────────────────────────────────────────────────────
// Previous behavior: 4-second setTimeout. That fired the popup during
// LCP/hero render on mobile, and the popup's eager <img> became the LCP
// element itself (per Lighthouse 2026-07-15: 13.1s LCP, 4.8s resource
// load delay). New behavior: trigger on exit-intent (desktop) OR
// scroll-past-50% (mobile) OR a 15-second backstop. The popup image is
// also lazy + low fetchpriority so it can never become the LCP candidate.
const BACKSTOP_MS = 15000;
const SCROLL_TRIGGER_FRACTION = 0.5; // 50% of viewport

const NewVisitorPopup = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [subscriptionSaved, setSubscriptionSaved] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [consentResolved, setConsentResolved] = useState(() => getAnalyticsConsent() !== null);
  const [analyticsSettingsOpen, setAnalyticsSettingsOpen] = useState(() => (
    getAnalyticsConsent() === null || window.location.hash === '#cookie-settings'
  ));
  const triggeredRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const syncConsent = (event: Event) => {
      const choice = (event as CustomEvent<{ choice?: AnalyticsConsentChoice | null }>).detail?.choice;
      const resolved = choice === 'accepted' || choice === 'declined';
      setConsentResolved(resolved);
      if (!resolved) setIsOpen(false);
    };
    const syncSettingsVisibility = (event: Event) => {
      const open = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
      setAnalyticsSettingsOpen(open);
      if (open) setIsOpen(false);
    };

    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, syncConsent);
    window.addEventListener(ANALYTICS_SETTINGS_VISIBILITY_EVENT, syncSettingsVisibility);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, syncConsent);
      window.removeEventListener(ANALYTICS_SETTINGS_VISIBILITY_EVENT, syncSettingsVisibility);
    };
  }, []);

  useEffect(() => {
    // Avoid competing dialog and focus contexts while the shopper is deciding
    // whether to enable optional analytics.
    if (!consentResolved || analyticsSettingsOpen) {
      setIsOpen(false);
      return;
    }

    // Product pages and the Custom Options inquiry journey are decision
    // screens. Do not place a welcome-offer modal over their selections,
    // add-to-bag controls, or made-to-measure form.
    if (
      location.pathname.startsWith('/product/') ||
      location.pathname === '/collections/customizable-indian-outfits'
    ) {
      setIsOpen(false);
      return;
    }

    // Server-side / unsupported — bail without listeners
    if (typeof window === 'undefined') return;

    // Respect previous dismissal. If storage is blocked, keep the popup usable
    // for this page instead of crashing the storefront.
    if (readPopupStorageItem('luxemia_popup_seen')) return;

    const trigger = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      cleanup();
      setIsOpen(true);
    };

    // Desktop: exit intent (mouse leaves top of viewport)
    const onMouseLeave = (e: MouseEvent) => {
      // Only trigger when cursor exits through the TOP of the window
      // (real exit-intent signal, not just moving to the address bar)
      if (e.clientY <= 0) trigger();
    };

    // Mobile: scroll past 50% of viewport
    const onScroll = () => {
      const scrolled = window.scrollY;
      const viewport = window.innerHeight;
      if (scrolled > viewport * SCROLL_TRIGGER_FRACTION) trigger();
    };

    // Backstop: 15s idle, only if no exit-intent / scroll yet
    const idleTimer = window.setTimeout(trigger, BACKSTOP_MS);

    const cleanup = () => {
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(idleTimer);
    };

    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return cleanup;
  }, [analyticsSettingsOpen, consentResolved, location.pathname]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    writePopupStorageItem('luxemia_popup_seen', 'true');
  }, []);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const getFocusableElements = () => Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => (
      element.getAttribute('aria-hidden') !== 'true' && !element.hasAttribute('hidden')
    ));

    // The close control is stable across both form and success states and does
    // not summon a mobile keyboard when this automatically opened dialog appears.
    (closeButtonRef.current ?? dialog).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        handleClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const previouslyFocused = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [handleClose, isOpen]);

  const validateEmail = (value: string): boolean => {
    const result = emailSchema.safeParse({ email: value });
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    if (!checkRateLimit()) {
      toast.error('Too many attempts. Please try again in a minute.');
      return;
    }

    recordAttempt();
    setIsSubmitting(true);

    try {
      if (!SUPABASE_URL) {
        throw new Error('Newsletter service is not configured.');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          type: 'newsletter',
          source: 'welcome_popup',
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        retryAfter?: number;
      };

      // Treat a 2xx result with no error payload as success; only reject an
      // explicit error payload or unsuccessful HTTP response.
      if (!response.ok || data.success === false || Boolean(data.error)) {
        if (data.retryAfter) {
          toast.error(`Too many attempts. Please try again in ${data.retryAfter} seconds.`);
          return;
        }

        // The verified Shopify code can still be shown when the newsletter
        // service is unavailable, but do not imply that the email was stored.
        if (response.status === 503) {
          setDiscountCode(DISCOUNT_CODE);
          setSubscriptionSaved(false);
          setIsSuccess(true);
          toast.info('The newsletter service is unavailable. The welcome code is shown below.');
          return;
        }

        throw new Error(data.error || 'We could not process your request just now. Please try again.');
      }

      toast.success('Welcome to LuxeMia! Your discount code is ready.');
      setDiscountCode(DISCOUNT_CODE);
      setSubscriptionSaved(true);
      setIsSuccess(true);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
            onClick={handleClose}
            aria-hidden="true"
          />
          {/* The wrapper owns centering. Framer Motion owns only entrance transforms,
              preventing animation styles from overriding CSS translate centering. */}
          <div
            ref={dialogRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-offer-heading"
            tabIndex={-1}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain rounded-lg bg-background shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
            >
            <div className="relative">
              {/* Close button — 44x44px touch target for mobile */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                className="absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-foreground/5 rounded-full transition-colors z-20 bg-background/80 backdrop-blur-sm"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Two-column layout on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2">

                {/* ─── Image Panel ─────────────────────────────────────── */}
                <div className="relative order-1 h-52 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent sm:h-auto sm:min-h-[420px]">
                  <img
                    src="/images/popup-image.webp"
                    alt="LuxeMia Indian ethnic wear — bridal lehenga collection"
                    className="absolute inset-0 w-full h-full object-cover"
                    // CRITICAL (PSI 2026-07-15): the popup image was the LCP
                    // element because it was loading="eager" and the popup
                    // was triggered at T+4s — after the real hero LCP. Lazy
                    // + low fetchpriority ensures it can never beat the
                    // actual hero image for LCP.
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    width={768}
                    height={768}
                  />
                  {/* Overlay gradient for text readability if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent sm:hidden" />

                  {/* Floating discount badge on the image */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: -8 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="bg-primary text-primary-foreground rounded-full w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center shadow-lg"
                    >
                      <span className="font-serif text-2xl sm:text-3xl font-bold leading-none">10%</span>
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider mt-1">OFF</span>
                    </motion.div>
                  </div>
                </div>

                {/* ─── Content Panel ──────────────────────────────────── */}
                <div className="order-2 sm:order-2 p-6 sm:p-8 flex flex-col justify-center">

                  {!isSuccess ? (
                    <>
                      {/* Verified welcome offer; Shopify currently has no end date. */}
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <p className="text-xs tracking-[0.15em] uppercase text-primary font-semibold">
                          First-Order Welcome Offer
                        </p>
                      </div>

                      {/* Main headline — specific and benefit-driven */}
                      <h3 id="welcome-offer-heading" className="font-serif text-2xl sm:text-3xl text-center sm:text-left mb-3 leading-tight">
                        Get <span className="text-primary font-bold">10% Off</span> Your First Indian Ethnic Wear Order
                      </h3>

                      {/* Benefit bullets — what they get, specifically */}
                      <ul className="space-y-2 mb-6 text-sm text-foreground/70">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Instant discount code</strong> — one use per customer at checkout</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Email updates</strong> about new arrivals and offers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Free US shipping</strong> at $199 and above. $14.99 below that.</span>
                        </li>
                      </ul>

                      {/* Email form */}
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                          <label htmlFor="welcome-offer-email" className="sr-only">
                            Email address
                          </label>
                          <input
                            id="welcome-offer-email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (emailError) setEmailError(null);
                            }}
                            placeholder="your@email.com"
                            required
                            disabled={isSubmitting}
                            maxLength={255}
                            autoComplete="email"
                            inputMode="email"
                            aria-invalid={emailError ? 'true' : undefined}
                            aria-describedby={emailError ? 'welcome-offer-email-error' : undefined}
                            className={`w-full bg-transparent border px-4 py-3.5 text-base sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/40 font-light rounded-md disabled:opacity-50 ${emailError ? 'border-destructive' : 'border-border'}`}
                          />
                          {emailError && (
                            <p
                              id="welcome-offer-email-error"
                              role="alert"
                              className="text-destructive text-xs mt-1 text-center sm:text-left"
                            >
                              {emailError}
                            </p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          variant="luxury"
                          size="lg"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <Sparkles className="w-4 h-4" />
                              </motion.span>
                              Unlocking...
                            </span>
                          ) : (
                            'Claim My 10% Off Code →'
                          )}
                        </Button>
                      </form>

                      <p className="mt-4 text-center text-[11px] leading-relaxed text-foreground/50 sm:text-left">
                        By submitting, you ask LuxeMia to show the welcome code on this screen and subscribe this address to future product or offer updates. You can unsubscribe from marketing emails. See the{' '}
                        <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
                          Privacy Policy
                        </Link>.
                      </p>
                    </>
                  ) : (
                    /* ─── Success State ─── */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4"
                      >
                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </motion.div>

                      <h3 id="welcome-offer-heading" className="font-serif text-2xl mb-2">
                        {subscriptionSaved ? "You're subscribed" : 'Welcome code available'}
                      </h3>

                      <p className="text-sm text-foreground/60 mb-4">
                        {subscriptionSaved
                          ? 'Your subscription was saved and your 10% off welcome code is ready:'
                          : 'Your subscription was not saved, but the verified 10% off welcome code is available:'}
                      </p>

                      <div className="bg-muted px-6 py-3 rounded-md inline-block mb-4 border-2 border-dashed border-primary/30">
                        <span className="font-mono text-lg font-semibold tracking-wider text-primary">
                          {discountCode || DISCOUNT_CODE}
                        </span>
                      </div>

                      <p className="text-xs text-foreground/50 mb-6">
                        Copy this code and apply it at checkout. Shopify confirms final eligibility.
                      </p>

                      <Button
                        onClick={handleClose}
                        variant="luxury"
                        className="w-full"
                      >
                        Start Shopping →
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewVisitorPopup;
