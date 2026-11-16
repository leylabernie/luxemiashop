import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { analyzeHtml } from './collection-html-audit.mjs';

export async function auditBuiltCollections(directory = 'dist') {
  const results = [];
  for (const route of ['/collections', '/collections/banarasi-sarees']) {
    const file = path.join(directory, '_prerender', `${route.slice(1)}.html`);
    const html = await readFile(file, 'utf8');
    results.push({ route, ...analyzeHtml(html),
      actualNetworkTransferBytes: null,
      estimatedGzipBodyBytes: gzipSync(html).length,
      estimatedBrotliBodyBytes: brotliCompressSync(html).length,
      compressionScope: 'Local Node defaults on built HTML, NOT measured HTTP transfer or production HTML',
    });
  }
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // This is diagnostic output only: never edit HTML or emit catalog artifacts.
  if (process.env.VERCEL_ENV !== 'preview') {
    console.log('[collection-html-audit] Skipped outside Vercel preview');
  } else {
    try {
      for (const result of await auditBuiltCollections()) {
        console.log(`[collection-html-audit] ${JSON.stringify(result)}`);
      }
    } catch (error) {
      // Report missing files; do not misrepresent failed measurements as zero bytes.
      console.warn(`[collection-html-audit] Unavailable: ${error.message}`);
    }
  }
}
