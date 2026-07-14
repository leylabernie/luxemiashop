import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';

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

const RATE_LIMIT_KEY = 'newsletter_submit_timestamps';
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 3;

const checkRateLimit = (): boolean => {
  const now = Date.now();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const timestamps: number[] = stored ? JSON.parse(stored) : [];
  const recentAttempts = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  return recentAttempts.length < MAX_ATTEMPTS;
};

const recordAttempt = () => {
  const now = Date.now();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const timestamps: number[] = stored ? JSON.parse(stored) : [];
  const recentAttempts = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  recentAttempts.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentAttempts));
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
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Respect previous dismissal
    if (localStorage.getItem('luxemia_popup_seen')) return;

    // Server-side / unsupported — bail without listeners
    if (typeof window === 'undefined') return;

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
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('luxemia_popup_seen', 'true');
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

    if (!checkRateLimit()) {
      toast.error('Too many attempts. Please try again in a minute.');
      return;
    }

    recordAttempt();
    setIsSubmitting(true);

    try {
      // Dynamic-import supabase — keeps ~44KB out of initial bundle.
      // The chunk is fetched only when a visitor actually submits the form.
      const { supabase } = await import('@/integrations/supabase/client');

      const { data, error } = await supabase.functions.invoke('submit-email', {
        body: {
          email: email.toLowerCase().trim(),
          type: 'newsletter',
          source: 'welcome_popup',
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.retryAfter) {
          toast.error(`Too many attempts. Please try again in ${data.retryAfter} seconds.`);
          return;
        }
        throw new Error(data.error);
      }

      if (data?.duplicate) {
        toast.info('You\'re already subscribed! Check your email for your discount code.');
      } else {
        setIsSuccess(true);
        toast.success('Welcome to LuxeMia! Your discount code is ready.');

        if (data?.discountCode) {
          navigator.clipboard.writeText(data.discountCode).catch(() => {});
        }
      }
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            // Mobile: bottom-aligned so keyboard doesn't cover the email input
            // Desktop: centered, two-column layout (image + content)
            className="fixed left-1/2 -translate-x-1/2 bottom-[env(safe-area-inset-bottom,0.5rem)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 w-[94vw] max-w-2xl max-h-[92dvh] overflow-y-auto bg-background z-50 shadow-2xl rounded-lg"
          >
            <div className="relative">
              {/* Close button — 44x44px touch target for mobile */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-foreground/5 rounded-full transition-colors z-20 bg-background/80 backdrop-blur-sm"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Two-column layout on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2">

                {/* ─── Image Panel ─────────────────────────────────────── */}
                <div className="relative order-1 sm:order-1 aspect-square sm:aspect-auto sm:min-h-[420px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
                  <img
                    src="/images/popup-image.webp"
                    alt="Luxemia Indian ethnic wear — bridal lehenga collection"
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
                      <span className="font-serif text-2xl sm:text-3xl font-bold leading-none">15%</span>
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider mt-1">OFF</span>
                    </motion.div>
                  </div>
                </div>

                {/* ─── Content Panel ──────────────────────────────────── */}
                <div className="order-2 sm:order-2 p-6 sm:p-8 flex flex-col justify-center">

                  {!isSuccess ? (
                    <>
                      {/* Pre-header with urgency cue */}
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <p className="text-xs tracking-[0.15em] uppercase text-primary font-semibold">
                          Limited Time Welcome Offer
                        </p>
                      </div>

                      {/* Main headline — specific and benefit-driven */}
                      <h3 className="font-serif text-2xl sm:text-3xl text-center sm:text-left mb-3 leading-tight">
                        Get <span className="text-primary font-bold">15% Off</span> Your First Indian Ethnic Wear Order
                      </h3>

                      {/* Benefit bullets — what they get, specifically */}
                      <ul className="space-y-2 mb-6 text-sm text-foreground/70">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Instant discount code</strong> — works on lehengas, sarees, suits & menswear</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Early access</strong> to new arrivals & festive collections</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Free shipping</strong> on orders over $350 to USA, Canada & Australia</span>
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
                            'Claim My 15% Off Code →'
                          )}
                        </Button>
                      </form>

                      {/* Trust signals */}
                      <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-[11px] text-foreground/40">
                        <span>No spam, ever</span>
                        <span>·</span>
                        <span>Unsubscribe anytime</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">10,000+ happy customers</span>
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

                      <h3 className="font-serif text-2xl mb-2">You're In! 🎉</h3>

                      <p className="text-sm text-foreground/60 mb-4">
                        Your exclusive <strong className="text-foreground">15% off</strong> code is ready:
                      </p>

                      <div className="bg-muted px-6 py-3 rounded-md inline-block mb-4 border-2 border-dashed border-primary/30">
                        <span className="font-mono text-lg font-semibold tracking-wider text-primary">
                          LUXE15-XXXXXX
                        </span>
                      </div>

                      <p className="text-xs text-foreground/50 mb-6">
                        Code copied to clipboard! Apply at checkout.
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
        </>
      )}
    </AnimatePresence>
  );
};

export default NewVisitorPopup;
