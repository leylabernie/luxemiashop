import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeHtml, measureUrl } from '../tools/collection-html-audit.mjs';

test('attributes UTF-8 bytes without executing scripts or discarding variants', () => {
  const product = { node: { title: 'Saree — लाल', variants: { edges: [{ node: { id: '1', price: { amount: '0', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: 'M' }] } }] }, images: { edges: [] } } };
  const html = `<html><script>window.__INITIAL_DATA__ = ${JSON.stringify({ products: [product] })};</script><script type="application/ld+json">{"@type":"ItemList"}</script><script>throw new Error('must not run')</script><a href="/product/saree">Saree</a></html>`;
  const result = analyzeHtml(html);
  assert.equal(result.uncompressedHtmlBytes, Buffer.byteLength(html));
  assert.equal(result.allScriptElementBytes + result.nonScriptHtmlBytes, result.uncompressedHtmlBytes);
  assert.equal(result.hydrationProductCount, 1);
  assert.equal(result.hydrationParseError, null);
  assert.equal(result.hydrationFieldReserializedBytes.variants, Buffer.byteLength(JSON.stringify(product.node.variants)));
  assert.deepEqual(result.schemaTypes, { ItemList: 1 });
  assert.deepEqual(result.schemaParseErrors, []);
  assert.equal(result.productLinkOccurrences, 1);
});

test('reports absent and malformed data rather than claiming valid empty payloads', () => {
  assert.equal(analyzeHtml('<html></html>').hydrationProductCount, null);
  const result = analyzeHtml('<script>window.__INITIAL_DATA__ = unsafe();</script><script type="application/ld+json">bad</script>');
  assert.ok(result.hydrationParseError);
  assert.equal(result.schemaParseErrors.length, 1);
});

test('refuses checkout, status, non-TLS and arbitrary hosts before making a request', () => {
  for (const url of ['https://luxemia.shop/checkouts/123', 'https://example.com/collections', 'http://luxemia.shop/collections', 'https://luxemia.shop/collections?test=1']) {
    assert.throws(() => measureUrl(url), /Only the two approved/);
  }
});
