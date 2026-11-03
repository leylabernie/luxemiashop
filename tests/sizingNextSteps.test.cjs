const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
let modulePromise;
const renderer = () => modulePromise ||= (async () => {
  const original = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
  const source = original.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml, routes, measurementHtml, sizingNextStepsHtml, measurementTitle };');
  assert.notEqual(source, original);
  const file = path.join(root, 'scripts', `.sizing-test-${process.pid}.mjs`);
  fs.writeFileSync(file, source);
  try { return await import(pathToFileURL(file).href); }
  finally { fs.unlinkSync(file); }
})();
const template = '<html><head><title>Fixture</title><meta name="description" content="fixture" /><link rel="canonical" href="https://luxemia.shop/" /></head><body><div id="root"></div></body></html>';

test('actual initial HTML contains one existing worksheet, all inputs, caveats and useful destinations', async () => {
  const { generateHtml, routes, measurementHtml, measurementTitle } = await renderer();
  const route = routes.find(r => r.path === '/sizing-measurements-guide');
  const html = generateHtml(template, route, new Map());
  assert.ok(html.includes(measurementHtml), 'prerender uses the shared content with safe fallback controls');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.equal((html.match(/My outfit measurements/g) || []).length, 1);
  assert.equal((measurementHtml.match(/<input /g) || []).length, 20);
  assert.equal((measurementHtml.match(/<textarea /g) || []).length, 2);
  for (const name of ['Bust', 'Underbust', 'Shoulder', 'Blouse length', 'Armhole', 'Sleeve length', 'Upper-arm circumference', 'Natural waist', 'Low waist', 'Hips', 'Waist to floor', 'Inseam', 'Chest', 'Neck', 'Kurta or sherwani length', 'Outseam']) {
    assert.ok(measurementHtml.includes(`aria-label="${name} in in"`), name);
  }
  assert.match(html, /Print worksheet/);
  assert.match(html, /Do not rely on a universal conversion/);
  assert.match(html, /does not confirm sizing, tailoring availability or fit/);
  for (const href of ['/contact', '/size-guide', '/lehengas', '/sarees', '/suits']) assert.ok(measurementHtml.includes(`href="${href}"`));
  assert.equal(measurementTitle.length, 60);
  assert.ok(html.includes('<title>Indian Clothing Measurements &amp; Printable Worksheet | LuxeMia</title>'));
  assert.doesNotMatch(html.match(/<title>.*?<\/title>/)[0], /…/);
});

test('shared article next steps prioritize worksheet, then enquiry, retaining shopping without duplicate CTA links', async () => {
  const { sizingNextStepsHtml } = await renderer();
  const expected = [['/sizing-measurements-guide', 'Use the measurement worksheet'], ['/contact', 'Ask a sizing question'], ['/ready-to-ship', 'Shop Ready-to-Ship Outfits']];
  let previous = -1;
  for (const [href, label] of expected) {
    assert.equal(sizingNextStepsHtml.split(`href="${href}"`).length - 1, 1);
    const index = sizingNextStepsHtml.indexOf(label);
    assert.ok(index > previous);
    previous = index;
  }
  const client = fs.readFileSync(path.join(root, 'src/pages/BlogPost.tsx'), 'utf8');
  assert.match(client, /post.slug === 'indian-to-us-clothing-size-conversion-guide' \? <SizingNextSteps \/> : <aside/);
  const prerender = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
  assert.match(prerender, /post.slug === 'indian-to-us-clothing-size-conversion-guide' \? sizingNextStepsHtml : ''/);
});


test('fallback cannot collect values that createRoot would discard; mounted client controls remain enabled', async () => {
  const { measurementHtml } = await renderer();
  const { buildSync } = require('esbuild');
  const { outputFiles } = buildSync({
    entryPoints: [path.join(root, 'src/components/SizingMeasurementsContent.tsx')],
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    alias: { '@': path.join(root, 'src') },
  });
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, loaded, loaded.exports);
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { StaticRouter } = require('react-router-dom');
  const clientHtml = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/sizing-measurements-guide' }, React.createElement(loaded.exports.default)));
  const controls = html => html.match(/<(?:input|textarea|button)\b[^>]*>/g) || [];
  assert.equal(controls(measurementHtml).length, 25);
  assert.equal(controls(clientHtml).length, 25);
  for (const control of controls(measurementHtml)) assert.match(control, / disabled=""/);
  for (const control of controls(clientHtml)) assert.doesNotMatch(control, / disabled[=> ]/);
  assert.match(measurementHtml, /become available when this page finishes loading/);
  assert.match(measurementHtml, /Enable JavaScript/);
  assert.doesNotMatch(clientHtml, /become available when this page finishes loading/);
  for (const label of ['My outfit measurements', 'Inches', 'Centimeters', 'Print worksheet']) {
    assert.ok(clientHtml.includes(label));
    assert.ok(measurementHtml.includes(label));
  }
});
