import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
async function loadSource(entry) {
  const result = await esbuild.build({
    entryPoints: [path.join(root, entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external',
    alias: { '@': path.join(root, 'src') }, jsx: 'automatic',
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');
const { HelmetProvider } = require('react-helmet-async');
const { canPromoteCollection } = await loadSource('src/lib/collectionPromotion.ts');
const { getCategoryConfig, MEGA_MENUS } = await loadSource('src/config/categoryConfig.tsx');
const { getCommercialLandingConfig, getCommercialLandingSubcategory } =
  await loadSource('src/config/commercialLandingPages.tsx');
const { FilterSidebar } = await loadSource('src/components/collections/FilterSidebar.tsx');
const { default: SEOFooterContent } = await loadSource('src/components/seo/SEOFooterContent.tsx');
const { default: SEOHead } = await loadSource('src/components/seo/SEOHead.tsx');
const emptyRoutes = JSON.parse(fs.readFileSync(path.join(root, 'src/config/emptyCatalogRoutes.json'), 'utf8'));
const restoredRoutes = [
  '/collections/wedding-sarees',
  '/collections/mehendi-outfits',
  '/collections/eid-outfits',
  '/collections/haldi-outfits',
  '/collections/silk-sarees',
];
const intentionallyEmptyRoutes = [
  '/collections/customizable-indian-outfits',
  '/collections/mirror-work-lehengas',
  '/collections/bollywood-inspired-indian-outfits',
  '/collections/bridal-party-outfits',
  '/collections/gharara-suits',
  '/collections/kanchipuram-sarees',
  '/jewelry',
];

const render = component => renderToStaticMarkup(
  React.createElement(MemoryRouter, null, component),
);

// Exercise the real component's canonical normalization and robots branches,
// collecting Helmet output instead of asserting against source-code strings.
function renderSeoHead(canonical, props = {}) {
  const context = {};
  renderToStaticMarkup(React.createElement(HelmetProvider, { context },
    React.createElement(SEOHead, { canonical, ...props }),
  ));
  return {
    canonicals: context.helmet.link.toComponent()
      .filter(element => element.props.rel === 'canonical').map(element => element.props.href),
    robots: context.helmet.meta.toComponent()
      .filter(element => element.props.name === 'robots').map(element => element.props.content),
  };
}

for (const route of restoredRoutes) {
  test(`active ${route} is promotable, self-canonical and indexable in SEOHead`, () => {
    for (const canonical of [`https://luxemia.shop${route}`, `https://preview.example${route}/?sort=best-selling`]) {
      const head = renderSeoHead(canonical);
      assert.deepEqual(head.canonicals, [`https://luxemia.shop${route}`]);
      assert.deepEqual(head.robots, ['index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1']);
    }
    assert.ok(!emptyRoutes.includes(route), `${route} must no longer be marked empty`);
    assert.equal(canPromoteCollection(route), true);
  });
}

test('all remaining intentionally empty routes stay nonpromotable and noindex in SEOHead', () => {
  assert.deepEqual([...emptyRoutes].sort(), [...intentionallyEmptyRoutes].sort());
  for (const route of emptyRoutes) {
    assert.equal(canPromoteCollection(route), false, route);
    const head = renderSeoHead(`https://luxemia.shop${route}`);
    assert.deepEqual(head.canonicals, [`https://luxemia.shop${route}`]);
    assert.deepEqual(head.robots, ['noindex, follow'], route);
  }
});

test('explicit noIndexFollow and noIndex retain their existing behavior and precedence', () => {
  const cases = [
    [{ noIndexFollow: true }, 'noindex, follow'],
    [{ noIndex: true }, 'noindex, nofollow'],
    [{ noIndexFollow: true, noIndex: true }, 'noindex, nofollow'],
  ];
  for (const route of [...restoredRoutes, ...intentionallyEmptyRoutes]) {
    for (const [props, expectedRobots] of cases) {
      const head = renderSeoHead(`https://luxemia.shop${route}`, props);
      assert.deepEqual(head.canonicals, [`https://luxemia.shop${route}`]);
      assert.deepEqual(head.robots, [expectedRobots], `${route}: ${JSON.stringify(props)}`);
    }
  }
});

test('empty collection promotion follows the existing empty-route registry', () => {
  assert.equal(canPromoteCollection('/collections/wedding-sarees'), true);
  assert.equal(canPromoteCollection('/sarees'), true);
  assert.equal(canPromoteCollection('/collections/designer-sarees'), true);
  assert.equal(canPromoteCollection(undefined), true);
});

test('saree sidebar promotes the restored wedding destination', () => {
  const html = render(React.createElement(FilterSidebar, {
    config: getCategoryConfig('sarees'),
    activeFilters: {}, priceRange: [0, 1500], activeFilterCount: 0,
    onToggleFilter() {}, onPriceChange() {}, onClearAll() {}, onSelectSubcategory() {},
  }));
  assert.ok(html.includes('href="/collections/wedding-sarees"'));
  assert.ok(html.includes('href="/sarees"'));
  assert.ok(html.includes('href="/collections/designer-sarees"'));
  assert.ok(html.includes('href="/collections/wedding-guest-outfits"'));
});

test('mega menu restores wedding sarees while preserving current-saree links', () => {
  const sarees = MEGA_MENUS.find(menu => menu.href === '/sarees');
  assert.ok(sarees);
  const occasions = sarees.groups.find(group => group.label === 'By Occasion').links;
  assert.ok(occasions.some(link => link.href === '/collections/wedding-sarees'));
  assert.ok(occasions.some(link => link.href === '/collections/designer-sarees'));
});

test('homepage editorial link has an accurate label and populated saree destination', () => {
  const html = render(React.createElement(SEOFooterContent));
  assert.ok(!html.includes('href="/collections/wedding-sarees"'));
  assert.match(html, /href="\/sarees"[^>]*>current saree collection<\/a>/);
});

test('the dedicated route and restrictive product selection are preserved', () => {
  const config = getCommercialLandingConfig('wedding-sarees');
  const slug = getCommercialLandingSubcategory('wedding-sarees');
  const subcategory = config.subcategories.find(sub => sub.slug === slug);
  assert.equal(config.canonical, 'https://luxemia.shop/collections/wedding-sarees');
  assert.equal(slug, 'wedding');
  assert.deepEqual(subcategory.matchTags, ['occasion:wedding', 'occasion:bridal', 'role:bride']);
  assert.deepEqual(subcategory.matchProductType, ['Wedding Saree', 'Bridal Saree']);
  const emptyRoutes = JSON.parse(fs.readFileSync(path.join(root, 'src/config/emptyCatalogRoutes.json'), 'utf8'));
  assert.ok(!emptyRoutes.includes('/collections/wedding-sarees'));
});

test('prerender preserves primary navigation and the dedicated wedding route', () => {
  const source = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
  assert.ok(!source.includes('href="/collections/wedding-sarees"'));
  assert.ok(!source.includes('href="/sarees?sub=bridal"'));
  assert.ok(!source.includes('href="/sarees?sub=wedding"'));
  assert.ok(source.includes("path: '/collections/wedding-sarees'"));
  assert.ok(source.includes('href="/sarees"'));
});

test('HTML sitemap and XML share the same already-filtered static-page export', async () => {
  const { outputFiles } = await esbuild.build({entryPoints:[path.join(root,'src/lib/dynamicSitemap.ts')],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',alias:{'@':path.join(root,'src')},define:{'import.meta.env':'{}'}});
  const module={exports:{}};new Function('require','module','exports',outputFiles[0].text)(require,module,module.exports);
  const routes=module.exports.staticPages.map(p=>p.loc);
  assert.ok(!routes.includes('/collections/customizable-indian-outfits'));
  assert.ok(!routes.includes('/collections/mirror-work-lehengas'));
  assert.ok(routes.includes('/collections'));
  assert.ok(routes.includes('/sarees'));
});

test('reviewed menu and sidebar labels match stocked destinations without changing wedding predicates', () => {
  const reviewed = JSON.parse(fs.readFileSync(path.join(root, 'src/config/reviewedShoppingLinks.json'), 'utf8'));
  const suits = MEGA_MENUS.find(menu => menu.href === '/suits');
  assert.deepEqual(suits.groups.find(group => group.label === 'By Style').links, reviewed.suits);
  const sarees = MEGA_MENUS.find(menu => menu.href === '/sarees');
  const links = sarees.groups.flatMap(group => group.links);
  assert.equal(links.filter(link => link.href === '/collections/wedding-sarees').length, 1);
  assert.equal(links.find(link => link.href === '/collections/wedding-sarees').name, 'Wedding Guest & Reception Sarees');
  assert.ok(links.every(link => canPromoteCollection(link.href)));
  const html = render(React.createElement(FilterSidebar, {
    config: getCategoryConfig('sarees'), activeFilters: {}, priceRange: [0, 1500], activeFilterCount: 0,
    onToggleFilter() {}, onPriceChange() {}, onClearAll() {}, onSelectSubcategory() {},
  }));
  assert.equal((html.match(/href="\/collections\/wedding-sarees"/g) || []).length, 1);
  assert.match(html, /Wedding Guest &amp; Reception Sarees/);
  const editorial = render(React.createElement(React.Fragment, null, getCategoryConfig('sarees').editorialContent));
  assert.ok(!editorial.includes('href="/collections/kanchipuram-sarees"'));
  assert.ok(editorial.includes('href="/collections/banarasi-sarees"'));
  const config = getCategoryConfig('sarees');
  assert.equal(config.subcategories.find(sub => sub.slug === 'bridal').label, 'Bridal');
  assert.equal(config.subcategories.find(sub => sub.slug === 'wedding').label, 'Ceremony Sarees');
});
