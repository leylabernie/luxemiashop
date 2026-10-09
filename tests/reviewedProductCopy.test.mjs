import test from 'node:test';
import assert from 'node:assert/strict';
import { hasReviewedProductCopy, renderReviewedProductHtml, REVIEWED_PRODUCT_COPY_TAG } from '../src/lib/reviewedProductCopy.mjs';

test('copy approval remains separate from supplier verification and leaves legacy imports gated', () => {
  assert.equal(hasReviewedProductCopy([REVIEWED_PRODUCT_COPY_TAG]), true);
  assert.equal(hasReviewedProductCopy(['facts:source-verified']), true);
  assert.equal(hasReviewedProductCopy(['in stock', 'silk']), false);
  assert.equal(hasReviewedProductCopy(), false);
});

test('preserves the listing sections instead of flattening garment and size details', () => {
  const html = '<p>Yellow sharara suit.</p><h3>Included Pieces</h3><ul><li>Kurta</li><li>Sharara</li><li>Dupatta</li></ul><h3>Size and Fit</h3><p>S, M, L, XL, XXL.</p>';
  assert.equal(renderReviewedProductHtml(html), html);
});

test('does not publish scripts, event handlers, images, or unsafe link protocols', () => {
  const output = renderReviewedProductHtml('<script>alert(1)</script><h3 onclick="alert(1)">Care</h3><img src=x onerror=alert(1)><a href="javascript:alert(1)">Bad link</a><a href="/contact">Contact</a>');
  assert.equal(output, '<h3>Care</h3><a>Bad link</a><a href="/contact">Contact</a>');
});
