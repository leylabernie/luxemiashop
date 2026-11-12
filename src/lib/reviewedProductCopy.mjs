// Copy review is separate from supplier verification. Only explicitly reviewed
// listings may publish their full structured catalog description.
export const REVIEWED_PRODUCT_COPY_TAG = 'copy:reviewed-2026-10-09';

// These are the six product records whose updated Shopify descriptions were
// confirmed saved on 2026-11-11. Keep this allowlist product-specific: supplier
// verification and copy approval remain separate for every other listing.
export const STOREFRONT_DESCRIPTION_FIX_PRODUCT_IDS = new Set([
  'gid://shopify/Product/9174664151211', // Olive Gold Crush Tissue Suit
  'gid://shopify/Product/9174664741035', // Pink Pure Mulmul Anarkali
  'gid://shopify/Product/9174664675499', // Grey Shimmer Silk Suit
  'gid://shopify/Product/9150324605099', // Olive Green Chinon Palazzo Suit
  'gid://shopify/Product/9150324572331', // Off-White Crepe Sharara Suit
  'gid://shopify/Product/9150324375723', // Teal Blue Chanderi Salwar Suit
]);

export function hasReviewedProductCopy(tags = [], productId = '') {
  return STOREFRONT_DESCRIPTION_FIX_PRODUCT_IDS.has(String(productId).trim())
    || tags.some((tag) => ['facts:source-verified', REVIEWED_PRODUCT_COPY_TAG]
    .includes(String(tag).trim().toLowerCase()));
}

// The crawler renderer has no browser DOM. Preserve a small formatting
// vocabulary while dropping executable elements and all unneeded attributes.
export function renderReviewedProductHtml(value = '') {
  const allowed = new Set(['p', 'h2', 'h3', 'strong', 'em', 'b', 'ul', 'ol', 'li', 'br', 'table', 'tbody', 'tr', 'th', 'td', 'a']);
  const clean = String(value)
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<(script|style|iframe|object|template)\b[^>]*>[^]*?<\/\1\s*>/gi, '');
  return clean.split(/(<[^>]*>)/g).map((token) => {
    if (!token.startsWith('<')) return token.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const match = token.match(/^<(\/?)\s*([a-z][a-z0-9]*)\b[^>]*>$/i);
    if (!match || !allowed.has(match[2].toLowerCase())) return '';
    const tag = match[2].toLowerCase();
    if (match[1]) return tag === 'br' ? '' : `</${tag}>`;
    if (tag === 'a') {
      const href = token.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
      if (href && /^(?:https?:\/\/|\/(?!\/))/i.test(href)) {
        const escaped = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<a href="${escaped}">`;
      }
    }
    return `<${tag}>`;
  }).join('');
}
