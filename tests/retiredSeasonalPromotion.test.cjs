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
