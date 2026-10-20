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
const { canPromoteCollection } = await loadSource('src/lib/collectionPromotion.ts');
const { getCategoryConfig, MEGA_MENUS } = await loadSource('src/config/categoryConfig.tsx');
const { getCommercialLandingConfig, getCommercialLandingSubcategory } =
  await loadSource('src/config/commercialLandingPages.tsx');
const { FilterSidebar } = await loadSource('src/components/collections/FilterSidebar.tsx');
const { default: SEOFooterContent } = await loadSource('src/components/seo/SEOFooterContent.tsx');

const render = component => renderToStaticMarkup(
  React.createElement(MemoryRouter, null, component),
);

test('empty collection promotion follows the existing empty-route registry', () => {
  assert.equal(canPromoteCollection('/collections/wedding-sarees'), false);
  assert.equal(canPromoteCollection('/sarees'), true);
  assert.equal(canPromoteCollection('/collections/designer-sarees'), true);
  assert.equal(canPromoteCollection(undefined), true);
});

test('saree sidebar stops promoting the empty wedding/bridal destination', () => {
  const html = render(React.createElement(FilterSidebar, {
    config: getCategoryConfig('sarees'),
    activeFilters: {}, priceRange: [0, 1500], activeFilterCount: 0,
    onToggleFilter() {}, onPriceChange() {}, onClearAll() {}, onSelectSubcategory() {},
  }));
  assert.ok(!html.includes('href="/collections/wedding-sarees"'));
  assert.ok(html.includes('href="/sarees"'));
  assert.ok(html.includes('href="/collections/designer-sarees"'));
  assert.ok(html.includes('href="/collections/wedding-guest-outfits"'));
});

test('mega menu keeps current sarees accessible without empty wedding links', () => {
  const sarees = MEGA_MENUS.find(menu => menu.href === '/sarees');
  assert.ok(sarees);
  const occasions = sarees.groups.find(group => group.label === 'By Occasion').links;
  assert.ok(!occasions.some(link => link.href === '/collections/wedding-sarees'));
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
  assert.ok(emptyRoutes.includes('/collections/wedding-sarees'));
});

test('prerender no longer advertises the empty wedding destination in primary navigation', () => {
  const source = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
  assert.ok(!source.includes('href="/collections/wedding-sarees"'));
  assert.ok(!source.includes('href="/sarees?sub=bridal"'));
  assert.ok(!source.includes('href="/sarees?sub=wedding"'));
  assert.ok(source.includes("path: '/collections/wedding-sarees'"));
  assert.ok(source.includes('href="/sarees"'));
});
