const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const esbuild = require('esbuild');

const compiled = esbuild.buildSync({
  entryPoints: [path.join(__dirname, '../src/data/blogPosts.ts')],
  bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'silent',
});
const loaded = { exports: {} };
new Function('module', 'exports', 'require', compiled.outputFiles[0].text)(loaded, loaded.exports, require);
const { blogPosts, PUBLISHED_BLOG_SLUGS } = loaded.exports;
const getPost = slug => {
  assert.ok(PUBLISHED_BLOG_SLUGS.includes(slug), `${slug} must remain published`);
  const post = blogPosts.find(p => p.slug === slug);
  assert.ok(post);
  return post;
};
const retiredHandles = [
  'royal-purple-georgette-embroidered-gharara-set-003',
  'embroidered-silk-sharara-suit-georgette-dupatta-mt1079',
  'handcrafted-lavender-georgette-lehenga-choli-set-bridesmaid-ready-to-ship',
  'handcrafted-periwinkle-banarasi-brocade-saree-wedding-guest-ready-to-ship',
];

test('published articles and source citations never link to the four retired audit destinations', () => {
  for (const post of blogPosts.filter(p => PUBLISHED_BLOG_SLUGS.includes(p.slug))) {
    const bodyAndSources = JSON.stringify({ content: post.content, sources: post.sources });
    for (const handle of retiredHandles) assert.ok(!bodyAndSources.includes(`/product/${handle}`), `${post.slug}: ${handle}`);
  }
});

test('sharara guide offers relevant collection and all-suits destinations instead of unavailable products', () => {
  const post = getPost('sharara-vs-gharara-difference');
  const comparison = post.content.split('<h2>Compare current sharara and gharara sets</h2>')[1].split('<h2>')[0];
  assert.match(comparison, /href="\/collections\/sharara-suits"/);
  assert.match(comparison, /href="\/suits"/);
  assert.doesNotMatch(comparison, /href="\/product\//);
  assert.match(comparison, /Open an available listing/);
});

test('customization guides use live category sources without claims about retired specific garments', () => {
  const bridesmaid = getPost('custom-bridesmaid-wedding-guest-lehenga-online-usa');
  const blouse = getPost('custom-deep-neckline-elbow-sleeve-saree-blouse-online-usa');
  assert.ok(bridesmaid.sources.some(s => s.url === 'https://luxemia.shop/lehengas'));
  for (const post of [bridesmaid, blouse]) {
    assert.ok(post.sources.some(s => s.url === 'https://luxemia.shop/sarees'));
    assert.doesNotMatch(post.content, /current lavender georgette|current periwinkle|current LuxeMia periwinkle/i);
    assert.match(post.content, /individual listing|selected listing/);
  }
});

test('the existing festival guide gives the Eid collection a contextual crawlable link', () => {
  const post = getPost('styling-indian-ethnic-wear-festive-occasions-abroad');
  assert.match(post.content, /<a href="\/collections\/eid-outfits">current Eid outfit ideas<\/a>/);
});
