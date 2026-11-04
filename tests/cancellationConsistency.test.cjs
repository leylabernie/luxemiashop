const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const expected = "Email hello@luxemia.shop with your order number as soon as possible. Cancellations within 24 hours of ordering receive a full refund. After 24 hours, requests are considered case by case and cancellation may not be possible. If cancellation is possible, the refund is reduced only by non-recoverable supplier costs, which will be disclosed before proceeding. This policy does not limit rights or remedies that cannot legally be excluded.";
for (const [file, count] of [['src/pages/FAQ.tsx',1],['src/pages/Terms.tsx',1],['scripts/prerender.js',4]]) {
  test(file + ' has consistent case-by-case policy', () => {
    const text = fs.readFileSync(file, 'utf8');
    assert.equal(text.split(expected).length - 1, count);
    assert.ok(!text.includes('cancellation requests are not accepted'));
  });
}
test('existing React Returns policy remains unchanged in substance', () => {
 const text=fs.readFileSync('src/pages/Returns.tsx','utf8');
 assert.ok(text.includes('non-recoverable supplier costs'));
 assert.ok(text.includes('24 hours of ordering'));
 assert.ok(!expected.includes('store credit'));
 assert.ok(!expected.includes('10%'));
});
