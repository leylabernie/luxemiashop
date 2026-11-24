export const CROSS_DOMAIN_LINKER_DOMAINS = [
  'luxemia.shop',
  'www.luxemia.shop',
  'checkout.luxemia.shop',
  'lovable-project-zlh0w.myshopify.com',
  'luxemiashop.myshopify.com',
  'luxemia.myshopify.com',
] as const;

const ALLOWED_CHECKOUT_LINKER_HOSTS = new Set<string>([
  'checkout.luxemia.shop',
  'lovable-project-zlh0w.myshopify.com',
  'luxemiashop.myshopify.com',
  'luxemia.myshopify.com',
]);

export function isCheckoutRedirectHost(hostname: string): boolean {
  return ALLOWED_CHECKOUT_LINKER_HOSTS.has(String(hostname || '').trim().toLowerCase());
}

const SAFE_GA_VALUE = /^[A-Za-z0-9._*-]{4,128}$/;
const SAFE_GL_VALUE = /^[A-Za-z0-9._*~-]{4,256}$/;

export interface GaLinkerContext {
  cookie?: string;
  search?: string;
}

export function extractGaClientParams(context?: GaLinkerContext): {
  ga?: string;
  gl?: string;
} {
  const cookieSource =
    context?.cookie !== undefined
      ? context.cookie
      : typeof document !== 'undefined'
        ? document.cookie || ''
        : '';
  const searchSource =
    context?.search !== undefined
      ? context.search
      : typeof window !== 'undefined' && window.location
        ? window.location.search || ''
        : '';

  let ga: string | undefined;
  let gl: string | undefined;

  if (searchSource) {
    try {
      const params = new URLSearchParams(searchSource);
      const urlGa = params.get('_ga')?.trim();
      const urlGl = params.get('_gl')?.trim();
      if (urlGa && SAFE_GA_VALUE.test(urlGa)) {
        ga = urlGa;
      }
      if (urlGl && SAFE_GL_VALUE.test(urlGl)) {
        gl = urlGl;
      }
    } catch {
      // Ignore malformed query strings.
    }
  }

  if (!ga && cookieSource) {
    const match = cookieSource.match(/(?:^|;\s*)_ga=([^;]+)/);
    if (match && match[1]) {
      let decoded = match[1].trim();
      try {
        decoded = decodeURIComponent(decoded);
      } catch {
        // Keep raw cookie value if not URI-encoded.
      }
      if (SAFE_GA_VALUE.test(decoded)) {
        ga = decoded;
      }
    }
  }

  return { ga, gl };
}

/**
 * Appends cross-domain GA4 (`_ga` / `_gl`) linker parameters onto verified
 * Shopify checkout URLs so session attribution survives the handoff from
 * luxemia.shop (Vercel) to Shopify Checkout.
 */
export function appendGaLinkerParams(
  checkoutUrl: string,
  context?: GaLinkerContext,
): string {
  if (!checkoutUrl || typeof checkoutUrl !== 'string') return checkoutUrl;

  let parsed: URL;
  try {
    parsed = new URL(checkoutUrl);
  } catch {
    return checkoutUrl;
  }

  if (
    parsed.protocol !== 'https:' ||
    !ALLOWED_CHECKOUT_LINKER_HOSTS.has(parsed.hostname.toLowerCase())
  ) {
    return checkoutUrl;
  }

  const { ga, gl } = extractGaClientParams(context);
  if (ga && !parsed.searchParams.has('_ga')) {
    parsed.searchParams.set('_ga', ga);
  }
  if (gl && !parsed.searchParams.has('_gl')) {
    parsed.searchParams.set('_gl', gl);
  }

  return parsed.toString();
}
