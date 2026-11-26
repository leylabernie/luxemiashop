const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Test the actual release validator pattern, not a copy of it.
const source = fs.readFileSync('scripts/validate-built-trust.cjs', 'utf8');
const line = source.split('\n').find((item) => item.includes('below \\$199') && item.includes('shipping|'));
assert.ok(line, 'legacy $12 shipping guard must remain in the build validator');
const pattern = vm.runInNewContext(line.trim().replace(/,$/, ''));

test('built trust rejects stale exact $12 shipping claims', () => {
  for (const text of ['$12 shipping', '$12.00 standard shipping', '$12 below $199']) {
    assert.match(text, pattern);
  }
});

test('built trust does not mistake larger or fractional product prices for $12 shipping', () => {
  for (const price of ['$123.33', '$120.99', '$12.99', '$1,200.00']) {
    assert.doesNotMatch(`Shop Jewelry (${price}) at LuxeMia. Free U.S. standard shipping at $150+ after discounts.`, pattern);
  }
});
