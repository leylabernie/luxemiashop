import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { X, Sparkles, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';
import { WELCOME_OFFER } from '@/config/welcomeOffer';
import { leadCaptureStorage, NEWSLETTER_RATE_LIMIT_KEY } from '@/lib/leadCaptureStorage';

// CRITICAL: Do NOT import supabase at the top level.
// The supabase client chunk (~44KB / 37KB unused) was previously bundled
// into the initial payload even though it is only used inside handleSubmit.
// Dynamic-importing it here lets Vite split it into a separate chunk that
// only loads when a user actually submits the form.
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

// Centralized so the popup, header announcements, and cart nudges always show
// the same code. See src/config/welcomeOffer.ts for the Shopify discount
// prerequisite.
const DISCOUNT_CODE = WELCOME_OFFER.code;
// The qualified offer sentence required wherever FIRST10 is advertised
// (tests/activeDiscountCopy.test.cjs): the code is entered at checkout, one use
// per customer, and eligibility is confirmed there.
const QUALIFIED_OFFER_COPY =
  '10% off an eligible first order. One use per customer. Final eligibility is confirmed at checkout.';
const NEWSLETTER_FUNCTION_URL =
  'https://jcyolouvxfxovzjyyrxu.supabase.co/functions/v1/submit-email';

// ─── Trigger tuning ────────────────────────────────────────────────────
// Previous behavior: 4-second setTimeout. That fired the popup during
// LCP/hero render on mobile, and the popup's eager <img> became the LCP
// element itself (per Lighthouse 2026-07-15: 13.1s LCP, 4.8s resource
// load delay). New behavior: trigger on exit-intent (desktop) OR
// scroll-past-50% (mobile) OR a 15-second backstop. The popup image is
// also lazy + low fetchpriority so it can never become the LCP candidate.
const BACKSTOP_MS = 45000;
const MIN_ENGAGEMENT_MS = 25000;
const SCROLL_TRIGGER_FRACTION = 1.6; // 1.6 viewports after initial browsing

const NewVisitorPopup = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  // Appended last on purpose: tests/newsletterPopupResponse.test.cjs drives
  // useState by call position, so inserting state above would silently re-map it.
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Product pages and the Custom Options inquiry journey are decision
    // screens. Do not place a welcome-offer modal over their selections,
    // add-to-bag controls, or made-to-measure form.
    if (
      location.pathname.startsWith('/product/') ||
      location.pathname === '/meta-checkout' ||
      location.pathname === '/collections/customizable-indian-outfits'
    ) {
      setIsOpen(false);
      return;
    }

    // Server-side / unsupported — bail before touching any browser API.
    if (typeof window === 'undefined') return;

    // Respect a previous dismissal, but only for a bounded window: the legacy
    // `luxemia_popup_seen` key suppressed this offer forever after one
    // accidental click. lib/leadCaptureStorage expires dismissals after 30 days
    // and fails open when storage is blocked, so a browser that cannot remember
    // still gets to subscribe.
    if (leadCaptureStorage.isPopupSuppressed()) return;

    const startedAt = Date.now();
    let deferTimer: number | undefined;

    const trigger = () => {
      if (triggeredRef.current) return;
      // Do not stack the discount offer over an active privacy consent prompt.
      if (document.getElementById('marketing-privacy-choices')) {
        window.clearTimeout(deferTimer);
        deferTimer = window.setTimeout(trigger, 15000);
        return;
      }
      triggeredRef.current = true;
      cleanup();
      setIsOpen(true);
    };

    // Desktop: exit intent after a brief browse window
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && Date.now() - startedAt >= 12000) trigger();
    };

    // Mobile/desktop: only after meaningful scrolling AND initial engagement
    const onScroll = () => {
      if (Date.now() - startedAt < MIN_ENGAGEMENT_MS) return;
      const scrolled = window.scrollY;
      const viewport = window.innerHeight;
      if (scrolled > viewport * SCROLL_TRIGGER_FRACTION) trigger();
    };

    // Backstop: 45s idle, only if no exit-intent / scroll yet
    const idleTimer = window.setTimeout(trigger, BACKSTOP_MS);

    const cleanup = () => {
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(idleTimer);
      window.clearTimeout(deferTimer);
    };

    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return cleanup;
  }, [location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    // A confirmed signup is recorded when it happens; closing the success panel
    // must not downgrade it to a 30-day dismissal.
    if (!isSuccess) leadCaptureStorage.rememberPopupDismissal();
  };

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

    if (!leadCaptureStorage.checkRateLimit(NEWSLETTER_RATE_LIMIT_KEY)) {
      toast.error('Too many attempts. Please try again in a minute.');
      return;
    }

    leadCaptureStorage.recordAttempt(NEWSLETTER_RATE_LIMIT_KEY);
    setIsSubmitting(true);

    try {
      const response = await fetch(NEWSLETTER_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          type: 'newsletter',
          source: 'welcome_popup',
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const data = payload && typeof payload === 'object' ? payload as {
        success?: boolean;
        error?: string;
        retryAfter?: number;
        duplicate?: boolean;
      } : null;

      // The verified service explicitly confirms both new and existing signups.
      // An empty or malformed response is not evidence that a lead was saved.
      if (!response.ok || data?.success !== true || Boolean(data?.error)) {
        if (data?.retryAfter) {
          toast.error(`Too many attempts. Please try again in ${data.retryAfter} seconds.`);
          return;
        }

        // A service error does not confirm that the subscription was saved.
        // This function captures signups; it does not send a welcome email.
        throw new Error(data?.error || 'We could not process your request just now. Please try again.');
      }

      // submit-email answers a repeat signup with { success: true, duplicate: true }
      // (unique index on newsletter_subscribers.email, Postgres 23505). That is a
      // success, not an error: say so plainly instead of re-welcoming them.
      const duplicate = data?.duplicate === true;
      toast.success(
        duplicate
          ? `You're subscribed! Use code ${DISCOUNT_CODE} at checkout.`
          : 'Welcome to LuxeMia! Your discount code is ready.',
      );
      setAlreadySubscribed(duplicate);
      setDiscountCode(DISCOUNT_CODE);
      setIsSuccess(true);
      // They are on the list now; never re-prompt this browser for the offer.
      leadCaptureStorage.rememberPopupSignup();
      navigator.clipboard.writeText(DISCOUNT_CODE).catch(() => {});
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
          />
          {/* The wrapper owns centering. Framer Motion owns only entrance transforms,
              preventing animation styles from overriding CSS translate centering. */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-offer-heading"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-sm sm:max-w-3xl max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-lg bg-background shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
            >
            <div className="relative">
              {/* Close button — 44x44px touch target for mobile */}
              <button
                onClick={handleClose}
                className="absolute top-2.5 right-2.5 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-foreground/5 rounded-full transition-colors z-20 bg-background/80 backdrop-blur-sm"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Compact single-card on mobile; two-column editorial on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2">

                {/* ─── Image Panel (desktop/tablet only so mobile stays compact) ─── */}
                <div className="relative order-1 hidden overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent sm:block sm:h-auto sm:min-h-[400px]">
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

                  {/* Floating discount badge on the image */}
                  <div className="absolute top-6 left-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: -8 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="bg-primary text-primary-foreground rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg"
                    >
                      <span className="font-serif text-3xl font-bold leading-none">10%</span>
                      <span className="text-xs uppercase tracking-wider mt-1">OFF</span>
                    </motion.div>
                  </div>
                </div>

                {/* ─── Content Panel ──────────────────────────────────── */}
                <div className="order-2 p-5 sm:p-8 flex flex-col justify-center">

                  {!isSuccess ? (
                    <>
                      {/* Pre-header */}
                      <div className="flex items-center gap-2 mb-2 pr-10">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <p className="text-[11px] tracking-[0.14em] uppercase text-primary font-semibold">
                          Welcome Offer
                        </p>
                      </div>

                      {/* Main headline — specific and benefit-driven */}
                      <h3 id="welcome-offer-heading" className="font-serif text-xl sm:text-3xl text-left mb-2.5 leading-tight">
                        Get <span className="text-primary font-bold">10% Off</span> Your First Order
                      </h3>

                      {/* Benefit bullets — compact on mobile, full on desktop */}
                      <ul className="space-y-1.5 mb-4 sm:mb-6 text-xs sm:text-sm text-foreground/70">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Instant discount code</strong> — one use per customer at checkout</span>
                        </li>
                        <li className="hidden sm:flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Early access</strong> to new arrivals &amp; festive collections</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Free US shipping</strong> at $150 and above. $14.99 below that.</span>
                        </li>
                      </ul>

                      {/* Email form */}
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                          <input
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
                            className={`w-full bg-transparent border px-4 py-3.5 text-base sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-foreground/40 font-light rounded-md disabled:opacity-50 ${emailError ? 'border-destructive' : 'border-border'}`}
                          />
                          {emailError && (
                            <p className="text-destructive text-xs mt-1 text-center sm:text-left">{emailError}</p>
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

                      {/* Dismiss + trust signals */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-foreground/50">
                        <span>No spam · Unsubscribe anytime</span>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="min-h-8 px-1 font-medium text-foreground/70 underline underline-offset-2 hover:text-foreground"
                        >
                          No thanks
                        </button>
                      </div>
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

                      <h3 className="font-serif text-2xl mb-2">
                        {alreadySubscribed ? "You're Subscribed" : "You're In"}
                      </h3>

                      <p className="text-sm text-foreground/60 mb-4">
                        {alreadySubscribed ? (
                          <>Use code <strong className="text-foreground">{DISCOUNT_CODE}</strong> at checkout — {QUALIFIED_OFFER_COPY}</>
                        ) : (
                          <>Your <strong className="text-foreground">10% off</strong> code for an eligible first order:</>
                        )}
                      </p>

                      <div className="bg-muted px-6 py-3 rounded-md inline-block mb-4 border-2 border-dashed border-primary/30">
                        <span className="font-mono text-lg font-semibold tracking-wider text-primary">
                          {discountCode || DISCOUNT_CODE}
                        </span>
                      </div>

                      <p className="text-xs text-foreground/50 mb-6">
                        {alreadySubscribed
                          ? 'Code copied to clipboard. You were already on the list — no second signup was created.'
                          : 'Code copied to clipboard. One use per customer. Apply it at checkout, where eligibility is confirmed.'}
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
