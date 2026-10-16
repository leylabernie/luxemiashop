import test from 'node:test';
import assert from 'node:assert/strict';
import { isDussehraBannerActive } from '../src/config/dussehraBanner.mjs';

test('Dussehra artwork remains through October 20 Eastern', () => {
  assert.equal(isDussehraBannerActive(Date.parse('2026-10-20T23:59:59.999-04:00')), true);
});
test('Dussehra artwork expires at midnight October 21 Eastern', () => {
  assert.equal(isDussehraBannerActive(Date.parse('2026-10-21T00:00:00-04:00')), false);
  assert.equal(isDussehraBannerActive(Date.parse('2026-11-10T00:00:00-05:00')), false);
});
