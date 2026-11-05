const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { setProductSocialMetadata } = require('../src/lib/productSocialMetadata.cjs');
const { renderReviewedShoppingLinks, getReviewedShoppingLinks } = require('../src/lib/reviewedShoppingLinks.cjs');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('product template has one product-specific social set without guessed dimensions', () => {
  const template = read('index.html');
  const input = { name: 'Grey & Silver "Lehenga" <test>', image: 'https://example.com/image.jpg?width=1500&v=1' };
  const output = setProductSocialMetadata(template, input);
  assert.equal((output.match(/property="og:type"/g) || []).length, 1);
  assert.equal((output.match(/property="og:image"/g) || []).length, 1);
  assert.equal((output.match(/property="og:image:alt"/g) || []).length, 1);
  assert.match(output, /property="og:type" content="product"/);
  assert.match(output, /Grey &amp; Silver &quot;Lehenga&quot; &lt;test&gt;/);
  assert.match(output, /width=1500&amp;v=1/);
  assert.doesNotMatch(output, /property=["']og:image:(width|height)/);
  assert.equal(setProductSocialMetadata(output, input), output);
  // The shared brand template itself is not altered.
  assert.match(template, /property="og:type" content="website"/);
  assert.match(template, /property="og:image:width" content="1200"/);
});

test('mixed attribute order and quotes cannot leave duplicate generic tags', () => {
  const output = setProductSocialMetadata(`<head><meta content='website' property='og:type'><meta content='1200' property='og:image:width'><meta property='og:image:alt' content='Brand'></head>`, { name: 'Product', image: '/product.jpg' });
  assert.doesNotMatch(output, /website|1200|Brand/);
  assert.match(output, /og:image:alt" content="Product"/);
});

test('prerender and client both use product identity and no fixed product dimensions', () => {
  const prerender = read('scripts/prerender.js');
  assert.match(prerender, /html = setProductSocialMetadata\(html, \{\s*image: productOgImage,\s*name: sanitizeProductTitle\(live\?\.title \|\| route.h1\)/);
  const client = read('src/components/seo/SEOHead.tsx');
  assert.match(client, /property="og:image:alt" content=\{product\?\.name \|\| seoTitle\}/);
  assert.match(client, /!product && absoluteImage === 'https:\/\/luxemia.shop\/images\/social\/luxemia-brand-preview-2026.jpg'/);
  assert.match(read('src/pages/ProductDetail.tsx'), /type="product"/);
});

test('Lehenga fallback has distinct truthful collection links and no dead shopping lists', () => {
  const source = read('scripts/prerender.js');
  const section = source.slice(source.indexOf("    path: '/lehengas',"), source.indexOf("    path: '/sarees',"));
  assert.match(section, /renderReviewedShoppingLinks\('lehengas'\)/);
  assert.doesNotMatch(section, /maroon-lehenga-for-reception|lehenga-for-bridesmaid|lehenga-for-mother-of-bride|Shop Lehengas by (Style|Color|Price)|\?sub=/);
  const links = getReviewedShoppingLinks('lehengas');
  assert.ok(links.length > 0);
  assert.equal(new Set(links.map(link => link.href)).size, links.length);
  assert.match(renderReviewedShoppingLinks('lehengas'), /href="\/collections\/party-wear-lehengas">Party-Wear Lehengas/);
  assert.ok(links.every(link => link.href.startsWith('/collections/')));
  const sidebar = read('src/components/collections/FilterSidebar.tsx');
  assert.match(sidebar, /reviewedShoppingLinks\[config.slug/);
  const config = read('src/config/categoryConfig.tsx');
  assert.match(config, /const reviewed = \[.*reviewedShoppingLinks\.lehengas\].find/);
  assert.match(sidebar, /onValueChange=\{\(value\) => onPriceChange/);
  assert.match(sidebar, /onToggleFilter/);
  const listing = read('src/components/collections/CategoryListing.tsx');
  assert.match(listing, /\['suits', 'sarees', 'lehengas'\]/);
  assert.match(listing, /config.slug as keyof typeof reviewedShoppingLinks/);
});

test('final built trust pass preserves product social metadata and still updates brand fallback', () => {
  const vm = require('node:vm');
  const template = read('index.html');
  const product = setProductSocialMetadata(template, { name: 'Grey Georgette Lehenga', image: 'https://example.com/product.jpg' });
  const files = new Map([['product.html', product], ['other.html', template]]);
  const fakeFs = {
    existsSync: () => true,
    readdirSync: () => [...files.keys()].map(name => ({ name, isDirectory: () => false })),
    readFileSync: file => files.get(path.basename(file)),
    writeFileSync: (file, text) => files.set(path.basename(file), text),
  };
  vm.runInNewContext(read('scripts/postprocess-built-trust.cjs'), {
    require: id => id === 'fs' ? fakeFs : id === 'path' ? path : require('../src/lib/serializeJsonLd.cjs'),
    __dirname: path.join(root, 'scripts'), console: { log() {} },
  });
  assert.match(files.get('product.html'), /og:image:alt" content="Grey Georgette Lehenga"/);
  assert.match(files.get('product.html'), /twitter:image:alt" content="Grey Georgette Lehenga"/);
  assert.doesNotMatch(files.get('product.html'), /property="og:image:(width|height)"/);
  assert.match(files.get('other.html'), /og:image:alt" content="LuxeMia Ethnic Wear/);
});


test('product names with replacement tokens remain literal text', () => {
  const output = setProductSocialMetadata('<head></head><body>KEEP</body>', { name: 'Special $& name', image: 'https://example.com/$`/image.jpg' });
  assert.match(output, /content="Special \$&amp; name"/);
  assert.ok(output.includes('https://example.com/$`/image.jpg'));
  assert.equal((output.match(/<\/head>/g) || []).length, 1);
  assert.ok(output.endsWith('<body>KEEP</body>'));
});
