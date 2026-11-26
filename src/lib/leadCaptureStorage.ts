/**
 * Shared, failure-tolerant browser storage for the lead-capture surfaces:
 * the exit-intent welcome popup (`NewVisitorPopup`), the footer signup
 * (`Footer` + `lib/newsletter`) and the cart email capture
 * (`cart/EmailCaptureModal`).
 *
 * Why this exists — two defects that were costing leads:
 *
 * 1. **A suppression key with no expiry.** The popup wrote
 *    `luxemia_popup_seen = 'true'` on *any* close — backdrop click, the X,
 *    "No thanks", or the success button — and honoured it forever. One
 *    accidental click removed the welcome offer from that browser permanently,
 *    and every visitor who arrived before FIRST10 existed was already blocked.
 *    Dismissals now expire after `DISMISSAL_SUPPRESSION_DAYS`; only a confirmed
 *    signup suppresses the prompt for good (they already have the code).
 *
 * 2. **Unguarded storage access.** `localStorage.getItem` / `JSON.parse` throw
 *    when storage is blocked (Safari private mode, "block all cookies", quota
 *    exceeded) or when a stored value is corrupt. In the popup the read sat in
 *    the trigger effect, so the offer never appeared at all; in both submit
 *    paths the rate-limit read threw *before* the `try`, so clicking
 *    "Claim My 10% Off Code" did nothing, silently, forever.
 *
 * Rules every function here follows:
 * - **Never throw.** A storage failure degrades to "allow this attempt and
 *   remember nothing": losing a suppression record costs one repeat popup,
 *   while losing a submission costs the lead.
 * - **Never block a signup.** Suppression and rate limiting gate the *prompt*
 *   and retry flooding; both fail open.
 * - **Versioned keys**, mirroring `lib/marketingConsent.ts`
 *   (`luxemia.marketing.consent.v1`), so a shape change cannot be read as a
 *   stale truth.
 */

export const POPUP_STATE_KEY = 'luxemia.welcomePopup.v2';
/** Pre-2026-11 key: a bare `'true'` with no timestamp and no expiry. */
export const LEGACY_POPUP_SEEN_KEY = 'luxemia_popup_seen';
export const NEWSLETTER_RATE_LIMIT_KEY = 'newsletter_submit_timestamps';
export const CART_RATE_LIMIT_KEY = 'cart_email_submit_timestamps';

/** A dismissed offer returns after 30 days; a subscriber is never re-prompted. */
export const DISMISSAL_SUPPRESSION_DAYS = 30;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_ATTEMPTS = 3;

export type PopupSuppressionReason = 'dismissed' | 'subscribed' | 'legacy-dismissal';

export interface PopupState {
  reason: PopupSuppressionReason;
  /** ISO-8601. Written by this module, validated on read. */
  at: string;
}

export interface RateLimitOptions {
  windowMs?: number;
  maxAttempts?: number;
  now?: number;
}

const REASONS: ReadonlySet<string> = new Set<PopupSuppressionReason>([
  'dismissed',
  'subscribed',
  'legacy-dismissal',
]);

const DAY_MS = 86_400_000;

const defaultGetWindow = (): Window | undefined =>
  typeof window === 'undefined' ? undefined : window;

/**
 * Injectable `getWindow` keeps this testable and mirrors
 * `createMarketingConsentStore` in `lib/marketingConsent.ts`.
 */
export function createLeadCaptureStorage(
  getWindow: () => Window | undefined = defaultGetWindow,
) {
  /** Storage can be absent (SSR/prerender) or present but throwing (blocked). */
  function getStorage(): Storage | undefined {
    try {
      const storage = getWindow()?.localStorage;
      if (!storage) return undefined;
      // Some browsers hand back an object whose every accessor throws.
      const probe = '__luxemia_storage_probe__';
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      return storage;
    } catch {
      return undefined;
    }
  }

  function isAvailable(): boolean {
    return getStorage() !== undefined;
  }

  function readJson(key: string): unknown {
    try {
      const raw = getStorage()?.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      // Corrupt or unreadable state is treated as "no state", never as a block.
      return null;
    }
  }

  function writeJson(key: string, value: unknown): boolean {
    try {
      getStorage()?.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function removeKey(key: string): void {
    try {
      getStorage()?.removeItem(key);
    } catch {
      /* Nothing to clean up if the write never worked. */
    }
  }

  function parsePopupState(value: unknown): PopupState | null {
    if (!value || typeof value !== 'object') return null;
    const candidate = value as { reason?: unknown; at?: unknown };
    if (typeof candidate.reason !== 'string' || !REASONS.has(candidate.reason)) return null;
    if (typeof candidate.at !== 'string') return null;
    const timestamp = Date.parse(candidate.at);
    if (Number.isNaN(timestamp)) return null;
    return { reason: candidate.reason as PopupSuppressionReason, at: candidate.at };
  }

  const isExpired = (state: PopupState, now: number): boolean => {
    // A confirmed signup needs no re-prompt: the shopper already has the code,
    // and the footer/popup success state tells them so.
    if (state.reason === 'subscribed') return false;
    return now - Date.parse(state.at) >= DISMISSAL_SUPPRESSION_DAYS * DAY_MS;
  };

  /**
   * Reads the popup state, migrating the legacy permanent key on first sight.
   * The legacy value carries no timestamp, so it is re-recorded as a dismissal
   * dated now: the longest suppression we can justify, and it expires.
   */
  function readPopupState(now: number = Date.now()): PopupState | null {
    const current = parsePopupState(readJson(POPUP_STATE_KEY));
    if (current) return isExpired(current, now) ? null : current;

    let legacy = false;
    try {
      legacy = Boolean(getStorage()?.getItem(LEGACY_POPUP_SEEN_KEY));
    } catch {
      legacy = false;
    }
    if (!legacy) return null;

    const migrated: PopupState = {
      reason: 'legacy-dismissal',
      at: new Date(now).toISOString(),
    };
    if (writeJson(POPUP_STATE_KEY, migrated)) removeKey(LEGACY_POPUP_SEEN_KEY);
    return migrated;
  }

  function isPopupSuppressed(now: number = Date.now()): boolean {
    return readPopupState(now) !== null;
  }

  /** Records why the prompt went away. Never throws; failures are ignored. */
  function rememberPopupState(reason: PopupSuppressionReason, now: number = Date.now()): void {
    writeJson(POPUP_STATE_KEY, { reason, at: new Date(now).toISOString() });
    removeKey(LEGACY_POPUP_SEEN_KEY);
  }

  function rememberPopupDismissal(now: number = Date.now()): void {
    rememberPopupState('dismissed', now);
  }

  function rememberPopupSignup(now: number = Date.now()): void {
    rememberPopupState('subscribed', now);
  }

  function clearPopupState(): void {
    removeKey(POPUP_STATE_KEY);
    removeKey(LEGACY_POPUP_SEEN_KEY);
  }

  function readTimestamps(key: string, now: number, windowMs: number): number[] {
    const stored = readJson(key);
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
      .filter((timestamp) => now - timestamp < windowMs);
  }

  /**
   * Fails open: with storage blocked or corrupt this returns `true`, because a
   * shopper must always be able to submit. Only a genuine burst of recorded
   * attempts is throttled.
   */
  function checkRateLimit(key: string, options: RateLimitOptions = {}): boolean {
    const now = options.now ?? Date.now();
    const windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;
    const maxAttempts = options.maxAttempts ?? RATE_LIMIT_MAX_ATTEMPTS;
    return readTimestamps(key, now, windowMs).length < maxAttempts;
  }

  function recordAttempt(key: string, options: RateLimitOptions = {}): void {
    const now = options.now ?? Date.now();
    const windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;
    const recent = readTimestamps(key, now, windowMs);
    recent.push(now);
    writeJson(key, recent);
  }

  return {
    isAvailable,
    readPopupState,
    isPopupSuppressed,
    rememberPopupDismissal,
    rememberPopupSignup,
    rememberPopupState,
    clearPopupState,
    checkRateLimit,
    recordAttempt,
  };
}

export type LeadCaptureStorage = ReturnType<typeof createLeadCaptureStorage>;

/** Default singleton used by the components. */
export const leadCaptureStorage: LeadCaptureStorage = createLeadCaptureStorage();
