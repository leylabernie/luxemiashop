// Temporary, explicitly time-limited diagnostics. Never record cookies,
// authorization, checkout tokens, discount codes, attribution or customer data.
export function metaDiagnosticsEnabled(env: Record<string, string | undefined>, now = Date.now()): boolean {
  const until = Date.parse(env.META_CHECKOUT_DIAGNOSTICS_UNTIL || '');
  return env.META_CHECKOUT_DIAGNOSTICS === '1' && Number.isFinite(until)
    && until > now && until - now <= 24 * 60 * 60 * 1000;
}

const clean = (value: string | null | undefined, max = 400) =>
  Array.from(value || '', char => {
    const code = char.charCodeAt(0);
    return code < 32 || code === 127 ? ' ' : char;
  }).join('').slice(0, max);

export function metaDiagnosticRequest(method: string, params: URLSearchParams, headers: Headers) {
  const products = params.getAll('products');
  // Log only an unambiguous numeric variant basket, never arbitrary query text.
  const numericBasket = /^(?:lmv-)?\d{1,20}:\d{1,3}(?:,(?:lmv-)?\d{1,20}:\d{1,3})*$/;
  const value = products.length === 1 && products[0].length <= 6000 && numericBasket.test(products[0]) ? products[0] : null;
  const allowlistedHeaders = ['user-agent', 'accept', 'accept-language', 'content-type', 'x-vercel-id'];
  return {
    method: clean(method, 16), path: '/meta-checkout', products: value,
    productParameterCount: products.length, hasCoupon: params.has('coupon'),
    hasContext: params.has('context'), hasReview: params.has('review'),
    headers: Object.fromEntries(allowlistedHeaders.flatMap(name => headers.has(name) ? [[name, clean(headers.get(name))]] : [])),
  };
}
