// Public construction/fit paragraphs reviewed on 2026-10-26 for these six IDs only.
// This is NOT supplier/stock/packing verification, publication approval, or a fee rule.
// Match the current public description before reusing copy so later edits cannot
// silently inherit this review. Never read or emit private metafields here.
export const FIT_COPY_REVIEW_DATE = '2026-10-26';
const reviewedFitCopy = {
  "gid://shopify/Product/9134761476267": [
    "Supplied stitched and ready to wear in the listed standard finished sizes. Requests outside those sizes require a fit review.",
    "Finished bust-size labels for this design are 40, 42, 44 inches. The 32, 34, 36, 38 options are alteration requests, not additional standard finished sizes. Choose Alter/Custom for a measurement review. Fit, alteration scope and any service charge must be confirmed before fulfillment."
  ],
  "gid://shopify/Product/9134762950827": [
    "Supplied stitched and ready to wear in the listed standard finished sizes. Requests outside those sizes require a fit review.",
    "Finished bust-size labels for this design are 38, 40, 42, 44 inches. The 32, 34, 36 options are alteration requests, not additional standard finished sizes. Choose Alter/Custom for a measurement review. Fit, alteration scope and any service charge must be confirmed before fulfillment."
  ],
  "gid://shopify/Product/9134763311275": [
    "Supplied stitched and ready to wear in the listed standard finished sizes. Requests outside those sizes require a fit review.",
    "Finished bust-size labels for this design are 38, 40, 42, 44 inches. The 32, 34, 36 options are alteration requests, not additional standard finished sizes. Choose Alter/Custom for a measurement review. Fit, alteration scope and any service charge must be confirmed before fulfillment."
  ],
  "gid://shopify/Product/9134765441195": [
    "Supplied stitched and ready to wear in the listed standard finished sizes. Requests outside those sizes require a fit review.",
    "Finished bust-size labels for this design are 38, 40, 42, 44 inches. The 32, 34, 36 options are alteration requests, not additional standard finished sizes. Choose Alter/Custom for a measurement review. Fit, alteration scope and any service charge must be confirmed before fulfillment."
  ],
  "gid://shopify/Product/9134765899947": [
    "Supplied stitched and ready to wear in the listed standard finished sizes. Requests outside those sizes require a fit review.",
    "Finished bust-size labels for this design are 36, 38, 40, 42, 44 inches. The 32, 34 options are alteration requests, not additional standard finished sizes. Choose Alter/Custom for a measurement review. Fit, alteration scope and any service charge must be confirmed before fulfillment."
  ],
  "gid://shopify/Product/9134766096555": [
    "Supplied stitched and ready to wear in the listed standard finished sizes. Requests outside those sizes require a fit review.",
    "Finished bust-size labels for this design are 36, 38, 40, 42, 44 inches. The 32, 34 options are alteration requests, not additional standard finished sizes. Choose Alter/Custom for a measurement review. Fit, alteration scope and any service charge must be confirmed before fulfillment."
  ]
};

const plainText = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function getReviewedFitCopy(product) {
  if (!Object.prototype.hasOwnProperty.call(reviewedFitCopy, product?.id)) return [];
  const paragraphs = reviewedFitCopy[product.id];
  const currentCopy = plainText(product.descriptionHtml || product.description);
  return paragraphs.every((paragraph) => currentCopy.includes(paragraph)) ? [...paragraphs] : [];
}

// Used only by the initial product-page payload, not collection/feed/SEO copy.
export function appendReviewedFitCopy(description, product) {
  const currentCopy = plainText(description);
  const missing = getReviewedFitCopy(product).filter((paragraph) => !currentCopy.includes(paragraph));
  return [description, ...missing].filter(Boolean).join(' ');
}

export function renderReviewedFitCopy(product) {
  const paragraphs = getReviewedFitCopy(product);
  if (!paragraphs.length) return '';
  // Render only the reviewed constants, never HTML supplied by the product.
  const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return `<section data-reviewed-fit-copy="${FIT_COPY_REVIEW_DATE}"><h3>Construction</h3><p>${escape(paragraphs[0])}</p><h3>Size and fit</h3><p>${escape(paragraphs[1])}</p></section>`;
}
