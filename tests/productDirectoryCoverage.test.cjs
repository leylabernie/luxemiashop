const { test } = require('node:test');
const assert = require('node:assert/strict');
const { reconcileDirectory } = require('../scripts/reconcile-product-directory.cjs');
const xml = '<urlset><url><loc>https://luxemia.shop/product/old</loc></url><url><loc>https://luxemia.shop/product/new</loc></url></urlset>';
const html = '<main><p>Browse all 1 current product listings</p><a href="/product/old">Old</a></main>';
const read = () => '<link rel="canonical" href="https://luxemia.shop/product/new" /><meta name="robots" content="index, follow" /><h1>New &amp; Fine</h1>';
test('adds a newly enrolled product and updates count without changing existing links', () => {
  const out = reconcileDirectory(html, xml, read);
  assert.match(out, /Browse all 2 current product listings/);
  assert.match(out, /href="\/product\/new">New &amp; Fine/);
  assert.match(out, /href="\/product\/old">Old/);
  assert.equal(reconcileDirectory(out, xml, () => { throw Error('should not read'); }), out);
});
test('does not silently retain a non-sitemap product', () => assert.throws(() => reconcileDirectory(html.replace('/old','/retired'), xml, read), /non-sitemap/));
test('rejects noindex additions', () => assert.throws(() => reconcileDirectory(html, xml, () => read().replace('index, follow','noindex, follow')), /failed directory checks/));
test('rejects canonical mismatch', () => assert.throws(() => reconcileDirectory(html, xml, () => read().replace('https://luxemia.shop/product/new','https://luxemia.shop/product/other')), /failed directory checks/));
test('rejects empty sitemap and missing markers', () => {
  assert.throws(() => reconcileDirectory(html, '<urlset/>', read), /Empty/);
  assert.throws(() => reconcileDirectory(html.replace('Browse all 1 current product listings','missing'), xml, read), /marker/);
});
