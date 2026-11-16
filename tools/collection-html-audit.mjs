import hydration from '../src/lib/collectionHydration.cjs';
import https from 'node:https';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib';

const bytes = text => Buffer.byteLength(text, 'utf8');

// Attribute bytes without evaluating inline JavaScript or loading any assets.
// Script/body slices are disjoint; field totals are diagnostic JSON reserialization
// sizes (not additive portions of the HTML, and not network transfer sizes).
export function analyzeHtml(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  const structured = scripts.filter(match => /\btype\s*=\s*["']application\/ld\+json["']/i.test(match[1]));
  const initial = scripts.find(match => /window\.__INITIAL_DATA__\s*=/.test(match[2]));
  const json = initial?.[2].match(/^\s*window\.__INITIAL_DATA__\s*=\s*([\s\S]*?);?\s*$/)?.[1];
  let payload;
  let hydrationParseError = null;
  if (json) {
    try { payload = hydration.restoreCollectionImages(JSON.parse(json.replace(/;\s*$/, ''))); }
    catch (error) { hydrationParseError = error.message; }
  }
  const products = payload?.products;
  const fields = {};
  if (Array.isArray(products)) {
    for (const product of products) {
      for (const [key, value] of Object.entries(product.node || {})) {
        fields[key] = (fields[key] || 0) + bytes(JSON.stringify(value));
      }
    }
  }
  const schemaTypes = {};
  const schemaParseErrors = [];
  for (const match of structured) {
    try {
      const parsed = JSON.parse(match[2]);
      for (const node of (Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed])) {
        const type = String(node['@type'] || 'unknown');
        schemaTypes[type] = (schemaTypes[type] || 0) + 1;
      }
    } catch (error) { schemaParseErrors.push(error.message); }
  }
  const scriptBytes = scripts.reduce((sum, match) => sum + bytes(match[0]), 0);
  return {
    uncompressedHtmlBytes: bytes(html),
    allScriptElementBytes: scriptBytes,
    nonScriptHtmlBytes: bytes(html) - scriptBytes,
    structuredDataElementBytes: structured.reduce((sum, match) => sum + bytes(match[0]), 0),
    hydrationElementBytes: initial ? bytes(initial[0]) : 0,
    hydrationProductCount: Array.isArray(products) ? products.length : null,
    hydrationFieldReserializedBytes: Object.fromEntries(Object.entries(fields).sort((a, b) => b[1] - a[1])),
    hydrationParseError, schemaTypes, schemaParseErrors,
    productLinkOccurrences: [...html.matchAll(/\bhref=["'](?:https:\/\/luxemia\.shop)?\/product\/[^"']+["']/g)].length,
  };
}

export function measureUrl(input) {
  const url = new URL(input);
  // Intentionally cannot request checkout, product status, or arbitrary hosts.
  if (url.protocol !== 'https:' || url.hostname !== 'luxemia.shop' ||
      !['/collections', '/collections/banarasi-sarees'].includes(url.pathname) ||
      url.search || url.hash || url.port || url.username || url.password) {
    throw new Error('Only the two approved production collection URLs are supported; use --file for saved preview HTML.');
  }
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'Accept-Encoding': 'br, gzip', 'User-Agent': 'LuxeMia-ReadOnly-HTML-Audit/1.0' } }, response => {
      const chunks = [];
      response.on('error', reject);
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        try {
          if (response.statusCode !== 200) throw new Error(`HTTP ${response.statusCode}; redirects are not followed`);
          const raw = Buffer.concat(chunks);
          const encoding = response.headers['content-encoding'] || 'identity';
          const decoders = { br: brotliDecompressSync, gzip: gunzipSync, deflate: inflateSync, identity: value => value };
          if (!decoders[encoding]) throw new Error(`Unsupported encoding: ${encoding}`);
          const decoded = decoders[encoding](raw);
          resolve({ url: url.href, measuredAt: new Date().toISOString(), status: response.statusCode,
            contentEncoding: encoding, responseBodyTransferBytes: raw.length,
            decodedResponseBodyBytes: decoded.length,
            transferScope: 'Encoded response body only; excludes HTTP headers, TLS, and subresources',
            ...analyzeHtml(decoded.toString('utf8')) });
        } catch (error) { reject(error); }
      });
    });
    request.setTimeout(20000, () => request.destroy(new Error('Request timed out; no retry performed')));
    request.on('error', reject);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [input, file] = process.argv.slice(2);
    if (!input) throw new Error('Usage: node tools/collection-html-audit.mjs URL | --file saved.html');
    const result = input === '--file'
      ? { source: file, responseBodyTransferBytes: null, ...analyzeHtml(await readFile(file, 'utf8')) }
      : await measureUrl(input);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
