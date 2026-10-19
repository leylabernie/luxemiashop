const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const esbuild = require('esbuild');
const output = esbuild.buildSync({entryPoints: [path.join(__dirname, '../src/data/blogPosts.ts')], bundle: true, format: 'cjs', platform: 'node', write: false}).outputFiles[0].text;
const loaded = {exports: {}};
new Function('module', 'exports', 'require', output)(loaded, loaded.exports, require);
const post = loaded.exports.blogPosts.find(p => p.slug === 'wedding-guest-outfit-ideas');
test('existing wedding guide retains its identity and publication history', () => {
  assert.equal(post.id, '10');
  assert.equal(post.title, 'What to Wear to an Indian Wedding: A Fact-Checked Guest Guide');
  assert.equal(post.publishedAt, '2026-01-02');
  assert.equal(post.updatedAt, '2026-10-19');
  assert.equal(post.factCheckedAt, '2026-10-19');
  assert.equal(loaded.exports.blogPosts.filter(p => p.slug === post.slug).length, 1);
});
test('guide foregrounds stitched totals and dates its price evidence', () => {
  assert.match(post.content, /October 19, 2026/);
  assert.match(post.content, /Standard stitched is \$68\.92/);
  assert.match(post.content, /custom stitched is \$83\.92/);
  assert.match(post.content, /Standard stitched is \$117\.25/);
  assert.match(post.content, /custom stitched is \$132\.25/);
  assert.match(post.content, /stitched at \$79\.08/);
  assert.match(post.content, /exclude shipping, tax and optional alterations/);
  assert.match(post.content, /\$39\.92 option is unstitched fabric/);
  assert.match(post.content, /\$88\.25 option is unstitched fabric/);
});
test('guide links verified products and existing specialist guides', () => {
  for (const slug of ['yellow-georgette-embroidered-lehenga-choli','lilac-organza-embroidered-lehenga-choli','rust-orange-art-silk-embroidered-lehenga-choli']) {
    assert.ok(post.content.includes(`href="/product/${slug}"`));
    assert.ok(post.sources.some(s => s.url === `https://luxemia.shop/product/${slug}`));
  }
  for (const url of ['/collections/wedding-guest-outfits','/blog/what-should-guests-wear-to-a-mehendi','/blog/what-should-guests-wear-to-a-sangeet','/blog/how-to-measure-for-a-lehenga-ordered-online','/shipping','/returns']) assert.ok(post.content.includes(`href="${url}"`));
  assert.match(post.content, /no universal arrival promise/);
  assert.match(post.content, /Optional garment alteration carries a separate charge/);
});
