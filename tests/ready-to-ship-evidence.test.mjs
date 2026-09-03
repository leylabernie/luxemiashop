import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const projectRoot = path.resolve(import.meta.dirname, '..');
const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-ready-evidence-'));
const bundledModulePath = path.join(temporaryDirectory, 'readyToShipEvidence.mjs');

await build({
  entryPoints: [path.join(projectRoot, 'src/lib/readyToShipEvidence.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: bundledModulePath,
  logLevel: 'silent',
});
const { hasExplicitReadyToShipEvidence } = await import(pathToFileURL(bundledModulePath).href);

test.after(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

test('ready-to-ship requires positive catalog evidence', () => {
  assert.equal(hasExplicitReadyToShipEvidence({}), false);
  assert.equal(hasExplicitReadyToShipEvidence({ tags: ['available', 'in stock'] }), false);
  assert.equal(hasExplicitReadyToShipEvidence({ tags: ['not made to order'] }), false);
  assert.equal(hasExplicitReadyToShipEvidence({ tags: ['Ready to Ship'] }), true);
  assert.equal(hasExplicitReadyToShipEvidence({ tags: ['fulfillment:ready-to-ship'] }), true);
  assert.equal(hasExplicitReadyToShipEvidence({ shipsWithinMetafield: { value: '3–5 business days' } }), true);
  assert.equal(hasExplicitReadyToShipEvidence({ shipsWithinDays: 0 }), false);
});
