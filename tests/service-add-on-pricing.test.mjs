import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const projectRoot = path.resolve(import.meta.dirname, '..');
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-service-addons-'));
const bundledModulePath = path.join(temporaryDirectory, 'serviceAddOns.mjs');

await build({
  entryPoints: [path.join(projectRoot, 'src/lib/serviceAddOns.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: bundledModulePath,
  logLevel: 'silent',
});

const { getEligibleServiceAddOns, normalizeServiceOptionLabel } = await import(pathToFileURL(bundledModulePath).href);
const [definitionSource, productInfoSource] = await Promise.all([
  readFile(path.join(projectRoot, 'src/lib/serviceAddOns.ts'), 'utf8'),
  readFile(path.join(projectRoot, 'src/components/product/ProductInfo.tsx'), 'utf8'),
]);

test.after(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

test('service option identity ignores historical display-price suffixes', () => {
  assert.equal(
    normalizeServiceOptionLabel('Blouse Stitching / Alteration (+$10)'),
    'blouse stitching / alteration',
  );
  assert.equal(normalizeServiceOptionLabel('Pico & Fall (+EUR 9.50)'), 'pico & fall');
  assert.equal(normalizeServiceOptionLabel('Matching Petticoat'), 'matching petticoat');
});

test('service prices and selected total come only from resolved Shopify variants', () => {
  assert.doesNotMatch(definitionSource, /\bprice:\s*\d/);
  assert.doesNotMatch(definitionSource, /checkoutOptionValue/);
  assert.doesNotMatch(definitionSource, /\(\+\$\d/);
  assert.doesNotMatch(productInfoSource, /service\.price|serviceAddOnTotal/);
  assert.match(productInfoSource, /serviceVariant\.price\.amount/);
  assert.match(productInfoSource, /selectedServicePrices\.reduce/);
  assert.match(productInfoSource, /different currency; the combined total is confirmed at Shopify checkout/);
});

test('only product-specific service tags can create an add-on offer', () => {
  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Evening Gown',
    productType: 'Gown',
    description: 'Unverified supplier copy says unstitched and blouse fabric included.',
    tags: [],
    options: [],
    metadata: {},
  }), []);

  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Evening Gown',
    productType: 'Gown',
    description: '',
    tags: ['construction:unstitched'],
    options: [],
    metadata: {},
  }), []);

  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Silk Saree',
    productType: 'Saree',
    description: 'Includes an unstitched blouse piece.',
    tags: [],
    options: [],
    metadata: { blouseFabric: 'Silk' },
  }), []);

  assert.deepEqual(getEligibleServiceAddOns({
    title: 'Silk Saree',
    productType: 'Saree',
    description: '',
    tags: ['service:pico-fall', 'service-add-on: matching_petticoat', 'service:unknown'],
    options: [],
    metadata: {},
  }), ['pico-fall', 'matching-petticoat']);
});
