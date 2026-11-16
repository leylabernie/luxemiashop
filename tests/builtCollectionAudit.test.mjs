import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { auditBuiltCollections } from '../tools/audit-built-collections.mjs';

test('measures both built routes without changing HTML or claiming network transfer', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'collection-audit-'));
  const html = '<html><h1>Collection</h1><a href="/product/saree">Saree</a></html>';
  try {
    await mkdir(path.join(directory, '_prerender/collections'), { recursive: true });
    const files = ['collections.html', 'collections/banarasi-sarees.html'].map(name => path.join(directory, '_prerender', name));
    await Promise.all(files.map(file => writeFile(file, html)));
    const results = await auditBuiltCollections(directory);
    assert.equal(results.length, 2);
    for (const result of results) {
      assert.equal(result.uncompressedHtmlBytes, Buffer.byteLength(html));
      assert.equal(result.actualNetworkTransferBytes, null);
      assert.ok(result.estimatedGzipBodyBytes > 0);
      assert.ok(result.estimatedBrotliBodyBytes > 0);
    }
    for (const file of files) assert.equal(await readFile(file, 'utf8'), html);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('does not inspect files or contact services outside preview', () => {
  const output = execFileSync(process.execPath, ['tools/audit-built-collections.mjs'], { env: { ...process.env, VERCEL_ENV: 'production' }, encoding: 'utf8' });
  assert.match(output, /Skipped outside Vercel preview/);
  assert.doesNotMatch(output, /uncompressedHtmlBytes/);
});

test('missing build output fails the measurement rather than returning zero', async () => {
  await assert.rejects(auditBuiltCollections('/nonexistent-collection-audit-directory'), /ENOENT/);
});
