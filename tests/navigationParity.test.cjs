const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const reviewedLinks = require('../src/config/reviewedShoppingLinks.json');
const emptyRoutes = require('../src/config/emptyCatalogRoutes.json');
const { getReviewedShoppingLinks, renderReviewedShoppingLinks } = require('../src/lib/reviewedShoppingLinks.cjs');
const { stripPausedCustomizationLinks } = require('../src/lib/pausedCollectionLinks.cjs');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function initialContent(route) {
  const source = read('scripts/prerender.js');
  const start = source.indexOf(`path: '${route}',`);
  assert.ok(start >= 0, route);
  const tail = source.slice(start);
  const content = tail.match(/content: `([\s\S]*?)`,/);
  assert.ok(content, route);
  return stripPausedCustomizationLinks(new Function('renderReviewedShoppingLinks', `return \`${content[1]}\`;`)(renderReviewedShoppingLinks));
}

test('shared shopping links preserve exact reviewed destinations and distinct Palazzo facet', () => {
  assert.deepEqual(reviewedLinks.suits.map(link => link.href), ['/collections/anarkali-suits', '/collections/sharara-suits', '/collections/ready-to-wear-palazzo-suits']);
  assert.deepEqual(reviewedLinks.sarees.map(link => link.href), ['/collections/wedding-sarees', '/collections/banarasi-sarees']);
  assert.equal(reviewedLinks.sarees[0].name, 'Wedding Guest & Reception Sarees');
  for (const category of Object.keys(reviewedLinks)) {
    assert.deepEqual(getReviewedShoppingLinks(category), reviewedLinks[category]);
    assert.ok(reviewedLinks[category].every(link => !emptyRoutes.includes(link.href)));
  }
  const seo = require('../src/config/seoArchitecture.json');
  assert.notEqual(seo.subcategoryLandingPaths.suits.palazzo, '/collections/ready-to-wear-palazzo-suits');
});

test('initial suits, sarees and hub HTML use identical reviewed shopping anchors', () => {
  for (const [route, categories] of [['/suits', ['suits']], ['/sarees', ['sarees']], ['/collections', ['suits', 'sarees']]]) {
    const html = initialContent(route);
    for (const category of categories) {
      for (const link of getReviewedShoppingLinks(category)) {
        assert.ok(html.includes(`href="${link.href}"`), `${route}: ${link.href}`);
        assert.ok(html.includes(link.name.replace(/&/g, '&amp;')), `${route}: ${link.name}`);
      }
    }
    for (const emptyRoute of emptyRoutes) assert.ok(!html.includes(`href="${emptyRoute}"`), `${route}: ${emptyRoute}`);
  }
});

test('all known-empty relative shopping anchors are suppressed without touching stocked links or citations', () => {
  for (const route of emptyRoutes) {
    for (const suffix of ['', '/', '?sort=popular', '#details']) {
      assert.equal(stripPausedCustomizationLinks(`<a class="shop" href="${route}${suffix}">Browse</a>`), '<span>Browse</span>');
    }
  }
  for (const href of ['/collections/organza-lehengas', '/collections/wedding-sarees', 'https://example.com/collections/kanchipuram-sarees']) {
    const html = `<a href="${href}">Details</a>`;
    assert.equal(stripPausedCustomizationLinks(html), html);
  }
});

test('wedding editorial matches guest intent while approved route SEO and selection remain external', () => {
  const html = initialContent('/collections/wedding-sarees');
  assert.match(html, /Sarees for Wedding Guests and Receptions/);
  assert.doesNotMatch(html, /compare wedding and bridal sarees/);
  const source = read('scripts/prerender.js');
  assert.ok(source.includes("h1: getIndexableRouteSeo('/collections/wedding-sarees').h1"));
  assert.ok(source.includes("commercialLanding: 'wedding-sarees'"));
  assert.ok(source.includes('html = stripPausedCustomizationLinks(html)'));
});
