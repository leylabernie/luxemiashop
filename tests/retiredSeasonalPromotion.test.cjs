const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('homepage and shared navigation do not promote retired Navratri campaign', () => {
  for (const file of [
    'src/pages/Index.tsx',
    'src/components/home/ShopByOccasion.tsx',
    'src/components/seo/InternalLinkBlock.tsx',
    'src/components/seo/RelatedOccasions.tsx',
    'src/components/seo/SEOFooterContent.tsx',
  ]) assert.doesNotMatch(read(file), /navratri|garba/i, file);
  const source = read('scripts/prerender.js');
  const homeStart = source.indexOf("path: '/',");
  assert.ok(homeStart >= 0, 'homepage route exists');
  const homeEnd = source.indexOf('\n  },', homeStart);
  assert.ok(homeEnd > homeStart, 'homepage route has a closing boundary');
  const home = source.slice(homeStart, homeEnd);
  assert.doesNotMatch(home, /navratri|garba/i);
  const featured = source.match(/<nav aria-label="Featured shopping guides">([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(featured, 'featured navigation still exists');
  assert.doesNotMatch(featured, /navratri|garba/i);
});

test('evergreen collection and guide destinations remain available', () => {
  assert.match(read('src/App.tsx'), /path="\/collections\/navratri-outfits"/);
  assert.match(read('scripts/prerender.js'), /path: '\/collections\/navratri-outfits'/);
  assert.ok(fs.existsSync(path.join(root, 'src/pages/NavratriOutfits.tsx')));
  assert.match(read('scripts/approved-sitemap-inventory.json'), /\/blog\/navratri-9-day-color-guide-2026/);
});

test('built seasonal validator checks retired homepage promotion before inventory skip', () => {
  const source = read('scripts/validate-navratri-traffic.cjs');
  assert.ok(source.indexOf('Retired Navratri promotion remains on the homepage') < source.indexOf('if (!seasonalInFeed)'));
  assert.doesNotMatch(source, /requireText\(homepageHtml,.*navratri/);
});


test('homepage leads with accurate value rather than restrictive return copy', () => {
  const home = read('src/pages/Index.tsx');
  const prerender = read('scripts/prerender.js');
  const start = prerender.indexOf("    path: '/',");
  const end = prerender.indexOf("    path: '/sitemap',", start);
  const route = prerender.slice(start, end);
  for (const source of [home, route]) {
    assert.match(source, /HOMEPAGE_VALUE_PROPOSITION/);
    assert.match(source, /Why shop wedding guest outfits at LuxeMia/);
    assert.doesNotMatch(source, /RETURN_POLICY_FAQ_ANSWER|continuous unboxing|change-of-mind returns|no returns/i);
  }
  const copy = read('src/lib/homepageValueProposition.ts');
  for (const text of ['tracked international delivery from India', 'U.S.-based support', 'where offered on the product page']) assert.ok(copy.includes(text));
  assert.match(read('src/lib/returnPolicyCopy.ts'), /continuous unboxing/);
  assert.match(prerender.slice(end), /RETURN_POLICY_FAQ_ANSWER/);
});

test('rendered homepage preserves value copy and removes the unboxing paragraph', async () => {
  const source = read('scripts/prerender.js').replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml, routes };');
  const file = path.join(root, 'scripts', `.homepage-copy-test-${process.pid}.mjs`);
  fs.writeFileSync(file, source);
  try {
    const { generateHtml, routes } = await import(require('node:url').pathToFileURL(file).href);
    const template = '<html><head><title>Fixture</title><meta name="description" content="fixture" /><meta name="robots" content="index, follow" /><meta name="googlebot" content="index, follow" /><link rel="canonical" href="https://luxemia.shop/" /></head><body><div id="root"></div></body></html>';
    const html = generateHtml(template, routes.find(route => route.path === '/'), new Map());
    assert.match(html, /Curated Indian Wedding &amp; Festive Wear, Delivered to Your Door/);
    assert.match(html, /where offered on the product page/);
    assert.doesNotMatch(html, /continuous unboxing|change-of-mind returns|no returns/i);
    assert.match(html, /href="\/returns"/);
  } finally { fs.unlinkSync(file); }
});

test('homepage hero renders both CTAs, three trust columns and the verified sourcing link', async () => {
  const esbuild = require('esbuild');
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { MemoryRouter } = require('react-router-dom');
  const built = await esbuild.build({ entryPoints: [path.join(root, 'src/components/home/HomepageIntro.tsx')], bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', jsx: 'automatic', alias: { '@': path.join(root, 'src') } });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', built.outputFiles[0].text)(require, module, module.exports);
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(module.exports.default)));
  assert.equal((html.match(/<h1/g) || []).length, 1);
  for (const route of ['/collections/wedding-guest-outfits', '/wedding-party-orders', 'https://www.ceremonyverse.com/']) assert.ok(html.includes(`href="${route}"`));
  for (const heading of ['Custom-Stitched to Your Fit', 'Tracked Doorstep Delivery', 'U.S.-Based Sizing &amp; Order Support']) assert.ok(html.includes(heading));
  assert.doesNotMatch(html, /pre-dispatch quality checks|partner workshops|continuous unboxing/i);
  assert.ok(read('src/pages/Index.tsx').indexOf('<HomepageIntro />') < read('src/pages/Index.tsx').indexOf('<NewArrivalsBanner />'));
});
