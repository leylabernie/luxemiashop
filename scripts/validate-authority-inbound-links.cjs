const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRE_BUILT = process.argv.includes('--require-built');

const authorityRoutes = [
  '/lehengas',
  '/sarees',
  '/suits',
  '/menswear',
  '/festive-wear',
  '/indian-wedding-guest-outfits',
  '/wedding-events',
  '/shop-by-fulfillment',
];

const countryShippingRoutes = [
  '/shipping/united-states',
  '/shipping/canada',
  '/shipping/united-kingdom',
  '/shipping/australia',
  '/shipping/new-zealand',
  '/shipping/south-africa',
  '/shipping/mauritius',
];

const failures = [];
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function fail(message) {
  failures.push(message);
}

function expectSourceRoute(source, sourceName, route) {
  const quotedRoute = new RegExp(`["']${escapeRegExp(route)}["']`);
  if (!quotedRoute.test(source)) fail(`${sourceName}: missing ${route}`);
}

function expectRenderedLink(html, sourceName, route) {
  const href = new RegExp(`<a\\b[^>]*\\bhref=["']${escapeRegExp(route)}["'][^>]*>`, 'i');
  if (!href.test(html)) fail(`${sourceName}: missing crawlable anchor to ${route}`);
}

const indexPage = read('src/pages/Index.tsx');
const homepageLinks = read('src/components/seo/SEOFooterContent.tsx');
const sharedFooter = read('src/components/layout/Footer.tsx');
const shippingPage = read('src/pages/Shipping.tsx');
const appRoutes = read('src/App.tsx');

if (!/<SEOFooterContent\s*\/>/.test(indexPage)) {
  fail('src/pages/Index.tsx: SEOFooterContent is not mounted on the homepage');
}

for (const route of authorityRoutes) {
  expectSourceRoute(homepageLinks, 'src/components/seo/SEOFooterContent.tsx', route);
  expectSourceRoute(sharedFooter, 'src/components/layout/Footer.tsx', route);
  expectSourceRoute(appRoutes, 'src/App.tsx', route);
}

for (const route of countryShippingRoutes) {
  expectSourceRoute(shippingPage, 'src/pages/Shipping.tsx', route);
  expectSourceRoute(appRoutes, 'src/App.tsx', route);
}

for (const weakAnchor of ['click here', 'read more']) {
  if (homepageLinks.toLowerCase().includes(`>${weakAnchor}<`) || shippingPage.toLowerCase().includes(`>${weakAnchor}<`)) {
    fail(`descriptive-anchor guard: found generic "${weakAnchor}" anchor`);
  }
}

if (REQUIRE_BUILT) {
  const builtHomepagePath = path.join(ROOT, 'dist/_prerender/index.html');
  const builtShippingPath = path.join(ROOT, 'dist/_prerender/shipping.html');

  if (!fs.existsSync(builtHomepagePath)) fail('dist/_prerender/index.html: missing built homepage');
  if (!fs.existsSync(builtShippingPath)) fail('dist/_prerender/shipping.html: missing built shipping page');

  if (fs.existsSync(builtHomepagePath)) {
    const builtHomepage = fs.readFileSync(builtHomepagePath, 'utf8');
    for (const route of authorityRoutes) {
      expectRenderedLink(builtHomepage, 'dist/_prerender/index.html', route);
    }
  }

  if (fs.existsSync(builtShippingPath)) {
    const builtShipping = fs.readFileSync(builtShippingPath, 'utf8');
    for (const route of countryShippingRoutes) {
      expectRenderedLink(builtShipping, 'dist/_prerender/shipping.html', route);
    }
  }
}

if (failures.length > 0) {
  console.error('[validate-authority-inbound-links] FAILED');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(
  `[validate-authority-inbound-links] OK — ${authorityRoutes.length} authority pillars have homepage and shared-footer links; all ${countryShippingRoutes.length} country shipping pages have shipping-page links${REQUIRE_BUILT ? '; prerendered anchors verified' : ''}.`,
);
