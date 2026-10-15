const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const qualification = '10% off eligible orders of US$75 or more';
const expiry = 'November 10, 2026 at 6:59 p.m. Eastern';
const valid = `${qualification}. One use per customer. Offer ends ${expiry}. Final eligibility is confirmed at checkout.`;

for (const file of ['src/pages/NavratriOutfits.tsx', 'scripts/prerender.js', 'src/data/blogPosts.ts']) {
  test(`${file} publishes all verified LUXE10 qualifications`, () => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert(source.includes(qualification));
    assert(source.includes('One use per customer.'));
    assert(source.includes(expiry));
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
  assert.match(result.stderr, /LUXE10 minimum/);
});
test('Eastern expiry matches the verified UTC date', () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date('2026-11-10T23:59:59Z'));
  assert.match(parts, /11\/10\/2026/);
  assert.match(parts, /6:59 PM/);
});
