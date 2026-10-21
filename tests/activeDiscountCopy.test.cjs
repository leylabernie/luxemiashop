const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const qualification = '10% off an eligible first order';
const valid = `Use FIRST10 for ${qualification}. One use per customer. Final eligibility is confirmed at checkout.`;

for (const file of ['src/pages/NavratriOutfits.tsx', 'scripts/prerender.js', 'src/data/blogPosts.ts']) {
  test(`${file} publishes qualified FIRST10 copy without retired discounts`, () => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert(source.includes(qualification));
    assert(source.includes('One use per customer.'));
    assert(source.includes('FIRST10'));
    assert(!/LUXE(?:10|15|20)/i.test(source));
    assert(source.includes('Final eligibility is confirmed at checkout.'));
    assert(!/no minimum purchase requirement/i.test(source));
  });
}

function validate(collectionHtml, articleHtml) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'luxemia-promotion-test-'));
  try {
    const files = {
      'scripts/validate-navratri-traffic.cjs': fs.readFileSync(path.join(root, 'scripts/validate-navratri-traffic.cjs')),
      'dist/_prerender/collections/navratri-outfits.html': collectionHtml,
      'dist/_prerender/blog/navratri-9-day-color-guide-2026.html': articleHtml,
      'dist/_prerender/index.html': '<html></html>',
      'dist/merchant-feed.xml': '<rss></rss>',
      'dist/sitemap.xml': '<sitemapindex></sitemapindex>',
    };
    for (const [name, content] of Object.entries(files)) {
      const dest = path.join(temp, name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, content);
    }
    return spawnSync(process.execPath, [path.join(temp, 'scripts/validate-navratri-traffic.cjs')], { encoding: 'utf8' });
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

test('correct built copy passes even with no legacy seasonal products', () => {
  const result = validate(valid, valid);
  assert.equal(result.status, 0, result.stderr);
});
for (const location of ['collection', 'article']) {
  test(`stale ${location} copy fails before the seasonal skip`, () => {
    const stale = valid + ' The code has no minimum purchase requirement.';
    const result = validate(location === 'collection' ? stale : valid, location === 'article' ? stale : valid);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /obsolete no-minimum promotion copy/);
  });
}
test('missing minimum qualification cannot pass through seasonal skip', () => {
  const result = validate(valid.replace(qualification, '10% off'), valid);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /first-order eligibility/);
});
for (const code of ['LUXE10', 'LUXE15', 'LUXE20']) {
  test(`retired ${code} cannot return in generated collection or article copy`, () => {
    for (const location of ['collection', 'article']) {
      const result = validate(location === 'collection' ? `${valid} ${code}` : valid, location === 'article' ? `${valid} ${code}` : valid);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /retired discount code/);
    }
  });
}
