const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const load = (entry) => {
  const { outputFiles } = buildSync({
    entryPoints: [path.join(root, entry)], bundle: true, write: false, platform: 'node', format: 'cjs',
    packages: 'external', jsx: 'automatic', alias: { '@': path.join(root, 'src') },
  });
  const m = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, m, m.exports);
  return m.exports;
};
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');

test('sizing callouts only make claims backed by the published policies', () => {
  const copy = load('src/data/sizingCalloutCopy.ts');
  const all = [copy.SIZING_CALLOUT_TOP, copy.SIZING_CALLOUT_FIT, copy.SIZING_CALLOUT_END].map(c => c.text).join(' ');
  assert.match(copy.SIZING_CALLOUT_TOP.text, /5–7 business days.*not a guaranteed date/);
  assert.match(copy.SIZING_CALLOUT_FIT.text, /Custom-stitched blouses, cholis, and suit tops/);
  assert.match(copy.SIZING_CALLOUT_FIT.text, /up to \$20 USD in Local Alteration Credit/);
  assert.match(copy.SIZING_CALLOUT_END.text, /no tariffs or import fees are collected at your doorstep/);
  assert.doesNotMatch(all, /guaranteed fit|All LuxeMia custom and readymade/i);
  assert.deepEqual([copy.SIZING_CALLOUT_TOP.href, copy.SIZING_CALLOUT_FIT.href, copy.SIZING_CALLOUT_END.href],
    ['/ready-to-ship', '/collections/wedding-guest-outfits', '/collections']);
});

test('size-conversion article carries the fit callout after its first table and the end callout last', () => {
  const { blogPosts } = load('src/data/blogPosts.ts');
  const post = blogPosts.find(p => p.slug === 'indian-to-us-clothing-size-conversion-guide');
  const fit = post.content.indexOf('href="/collections/wedding-guest-outfits"');
  assert.ok(fit > post.content.indexOf('</table>') && fit < post.content.indexOf('<h2>What is Indian shirt size 42'));
  assert.ok(post.content.trimEnd().endsWith('</aside>'));
  assert.ok(post.content.lastIndexOf('href="/collections"') > post.content.indexOf('What LuxeMia does and does not promise'));
});

test('measurement guide renders top, fit and end callouts', () => {
  const Content = load('src/components/SizingMeasurementsContent.tsx').default;
  const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/sizing-measurements-guide' }, React.createElement(Content, { isStaticFallback: true })));
  for (const href of ['/ready-to-ship', '/collections/wedding-guest-outfits', '/collections']) {
    assert.equal(html.split(`href="${href}"`).length - 1, 1, href);
  }
  assert.ok(html.indexOf('href="/ready-to-ship"') < html.indexOf('My outfit measurements'));
  assert.ok(html.indexOf('href="/collections/wedding-guest-outfits"') > html.indexOf('My outfit measurements'));
});

test('product pages show the trust block under Add to Bag with policy-accurate wording', () => {
  const { WhyBuyFromLuxeMia } = load('src/components/pdp/WhyBuyFromLuxeMia.tsx');
  const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/' }, React.createElement(WhyBuyFromLuxeMia)));
  assert.match(html, /Why Buy From LuxeMia\?/);
  assert.match(html, /48 hours order protection|48 hours/);
  assert.match(html, /No unboxing video required/);
  assert.match(html, /\+1-215-341-9990/);
  assert.match(html, /Free U\.S\. standard shipping at \$150\+/);
  assert.doesNotMatch(html, /guaranteed fit/i);
  const info = fs.readFileSync(path.join(root, 'src/components/product/ProductInfo.tsx'), 'utf8');
  assert.ok(info.indexOf('<WhyBuyFromLuxeMia />') > info.indexOf('id="product-add-to-bag"'));
});
