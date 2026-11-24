const test = require('node:test');
const assert = require('node:assert/strict');

const {
  SITE_URL,
  PRIORITY_PATHS,
  normalizeUrl,
  extractLinkTags,
  inspectHtml,
  inspectNoIndexHtml,
  routeFromPrerenderFile,
} = require('../scripts/verify-live-seo-tags.cjs');

const PRODUCT = `${SITE_URL}/product/ready-to-wear-embroidered-saree-light-pink`;

function page(head) {
  return `<!doctype html><html><head>${head}</head><body>content</body></html>`;
}

test('self-referencing canonical and hreflang alternates pass validation', () => {
  const html = page(`
    <link rel="canonical" href="${PRODUCT}" />
    <link rel="alternate" hreflang="en-US" href="${PRODUCT}" />
    <link rel="alternate" hreflang="x-default" href="${PRODUCT}" />
  `);
  const result = inspectHtml(html, PRODUCT);
  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
  assert.equal(result.canonical, PRODUCT);
  assert.deepEqual(result.hreflangs, ['en-US', 'x-default']);
});

test('the original regression: hreflang alternates pointing to the homepage fail', () => {
  const html = page(`
    <link rel="canonical" href="${PRODUCT}" />
    <link rel="alternate" hreflang="en-US" href="${SITE_URL}/" />
    <link rel="alternate" hreflang="en-CA" href="${SITE_URL}/" />
    <link rel="alternate" hreflang="en-AU" href="${SITE_URL}/" />
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  `);
  const result = inspectHtml(html, PRODUCT);
  assert.equal(result.ok, false);
  assert.equal(result.issues.length, 4);
  assert.ok(result.issues.every((issue) => issue.includes('still points to the homepage')));
});

test('a canonical that contradicts the URL fails', () => {
  const html = page(`
    <link rel="canonical" href="${SITE_URL}/" />
    <link rel="alternate" hreflang="x-default" href="${PRODUCT}" />
  `);
  const result = inspectHtml(html, PRODUCT);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes('canonical ->')));
});

test('missing or duplicated canonical tags fail', () => {
  assert.ok(inspectHtml(page('<title>x</title>'), PRODUCT).issues.includes('missing canonical'));
  const duplicated = inspectHtml(
    page(`<link rel="canonical" href="${PRODUCT}" /><link rel="canonical" href="${PRODUCT}" />`),
    PRODUCT,
  );
  assert.ok(duplicated.issues.some((issue) => issue.includes('multiple canonical tags')));
});

test('missing hreflang alternates fail', () => {
  const result = inspectHtml(page(`<link rel="canonical" href="${PRODUCT}" />`), PRODUCT);
  assert.equal(result.ok, false);
  assert.ok(result.issues.includes('missing hreflang alternates'));
});

test('noindex on an indexable page fails', () => {
  const html = page(`
    <link rel="canonical" href="${PRODUCT}" />
    <link rel="alternate" hreflang="x-default" href="${PRODUCT}" />
    <meta name="robots" content="noindex, follow" />
  `);
  assert.ok(inspectHtml(html, PRODUCT).issues.includes('indexable page carries noindex'));
});

test('noIndex prerender pages strip canonical and hreflang', () => {
  const clean = '<meta name="robots" content="noindex, nofollow" />';
  assert.equal(inspectNoIndexHtml(page(clean), `${SITE_URL}/404`).ok, true);

  const dirty = page(`${clean}<link rel="canonical" href="${SITE_URL}/404" />
    <link rel="alternate" hreflang="en-US" href="${SITE_URL}/404" />`);
  const result = inspectNoIndexHtml(dirty, `${SITE_URL}/404`);
  assert.equal(result.ok, false);
  assert.equal(result.issues.length, 2);
});

test('link attributes are parsed regardless of attribute order', () => {
  const tags = extractLinkTags('<link href="/x" rel="alternate" hreflang="en-US" />');
  assert.equal(tags.length, 1);
  assert.equal(tags[0].rel, 'alternate');
  assert.equal(tags[0].hreflang, 'en-US');
  assert.equal(tags[0].href, '/x');
});

test('trailing slashes normalize without changing case-sensitive paths', () => {
  assert.equal(normalizeUrl(`${SITE_URL}/`), normalizeUrl(SITE_URL));
  assert.notEqual(normalizeUrl(`${SITE_URL}/Sarees`), normalizeUrl(`${SITE_URL}/sarees`));
});

test('prerender file paths map back to their canonical routes', () => {
  assert.equal(routeFromPrerenderFile('dist/_prerender', 'dist/_prerender/index.html'), '/');
  assert.equal(routeFromPrerenderFile('dist/_prerender', 'dist/_prerender/sarees.html'), '/sarees');
  assert.equal(
    routeFromPrerenderFile('dist/_prerender', 'dist/_prerender/product/example.html'),
    '/product/example',
  );
});

test('priority URL list covers the highest-impression zero-click pages', () => {
  for (const route of ['/sarees', '/lehengas', '/collections/sharara-suits', '/collections/wedding-guest-outfits']) {
    assert.ok(PRIORITY_PATHS.includes(route), `missing ${route}`);
  }
  assert.ok(PRIORITY_PATHS.some((route) => route.startsWith('/product/')));
});
