import assert from 'node:assert/strict';
import test from 'node:test';
import { getEligibleServiceAddOns } from '../src/lib/serviceAddOns.ts';

test('fabric-only lehenga does not sell a garment alteration as stitching', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Sky Blue Art Silk Lehenga — Unstitched', productType: 'Lehenga Choli',
    description: 'Unstitched fabric only.',
    options: [{ name: 'Stitching', values: ['Unstitched (Fabric Only)'] }],
  }), []);
});
test('unstitched tags work when a product has no construction selector', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Cotton Lehenga', productType: 'Lehenga Choli', description: '',
    tags: ['construction:Unstitched'],
  }), []);
});
test('ready-made garments retain the owner-approved alteration service', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Ready-made Lehenga', productType: 'Lehenga Choli', description: '',
    options: [{ name: 'Size', values: ['S', 'M'] }],
  }), ['garment-alteration']);
});
test('saree finishing and blouse services remain available', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Silk Saree', productType: 'Saree',
    description: 'Includes an unstitched blouse piece.',
  }), ['blouse-stitching', 'pico-fall', 'matching-petticoat']);
});
