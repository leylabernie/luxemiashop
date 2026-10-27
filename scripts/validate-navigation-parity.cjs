const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getReviewedShoppingLinks } = require('../src/lib/reviewedShoppingLinks.cjs');
const emptyRoutes = require('../src/config/emptyCatalogRoutes.json');
const seo = require('../src/config/seoArchitecture.json');
const dist = path.resolve(__dirname, '../dist');
const readRoute = route => fs.readFileSync(path.join(dist, `_prerender${route}.html`), 'utf8');
const escapeHtml = value => value.replace(/&/g, '&amp;');

for (const [route, categories] of [['/suits', ['suits']], ['/sarees', ['sarees']], ['/collections', ['suits', 'sarees']]]) {
  const html = readRoute(route);
  for (const category of categories) {
    for (const link of getReviewedShoppingLinks(category)) {
      assert.ok(html.includes(`href="${link.href}"`), `${route}: missing ${link.href}`);
      assert.ok(html.includes(escapeHtml(link.name)), `${route}: missing ${link.name}`);
    }
  }
  for (const empty of emptyRoutes) assert.ok(!html.includes(`href="${empty}"`), `${route}: promotes empty ${empty}`);
}
for (const route of ['/collections/kanchipuram-sarees', '/collections/gharara-suits', '/collections/mirror-work-lehengas']) {
  assert.match(readRoute(route), /<meta[^>]*name="robots"[^>]*content="noindex, follow"/, `${route}: preserve noindex`);
}
for (const route of ['/collections/wedding-sarees', '/collections/organza-lehengas']) {
  const html = readRoute(route);
  assert.ok(html.includes(`href="https://luxemia.shop${route}"`), `${route}: canonical`);
  assert.ok(!/<meta[^>]*name="robots"[^>]*content="noindex/.test(html), `${route}: stays indexable`);
}
const wedding = readRoute('/collections/wedding-sarees');
assert.ok(wedding.includes(escapeHtml(seo.routes['/collections/wedding-sarees'].h1)), 'Wedding H1 stays approved');
assert.match(wedding, /Sarees for Wedding Guests and Receptions/);
console.log('[navigation-parity] Shared suit/saree shopping anchors present; empty destinations unpromoted; wedding/organza indexation preserved.');
