import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { attachShoppingApp } from '../src/middleware/shoppingApp.ts';

const productHtml = '<html><head><title>New lehenga</title><link rel="canonical" href="https://luxemia.shop/product/new"><style>body{margin:0}</style></head><body><h1>New lehenga</h1><p>USD 91.34</p></body></html>';
const shell = '<html><head><title>Home</title><script type="module" crossorigin src="/assets/index-123.js"></script><link rel="stylesheet" crossorigin href="/assets/index-123.css"><link rel="modulepreload" href="/assets/vendor-123.js"><script src="https://unrelated.example/script.js"></script></head><body><div id="root"></div></body></html>';

test('new product keeps product metadata and content while loading the shopping app', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url.toString(), 'https://luxemia.shop/index.html');
    return new Response(shell);
  });
  const html = await attachShoppingApp(productHtml, new Request('https://luxemia.shop/product/new?variant=123'));
  assert.match(html, /<title>New lehenga<\/title>/);
  assert.match(html, /href="https:\/\/luxemia.shop\/product\/new"/);
  assert.match(html, /<div id="root"><div data-product-fallback><h1>New lehenga/);
  assert.match(html, /type="module" crossorigin src="\/assets\/index-123.js"/);
  assert.match(html, /href="\/assets\/index-123.css"/);
  assert.match(html, /href="\/assets\/vendor-123.js"/);
  assert.doesNotMatch(html, /<title>Home|unrelated.example/);

  let callback, disconnected = false, removed = false, fallbackPresent = true;
  const root = { querySelector: () => fallbackPresent ? {} : null };
  const document = {
    getElementById: id => { assert.equal(id, 'root'); return root; },
    querySelectorAll: () => [{ remove() { removed = true; } }],
  };
  class MutationObserver {
    constructor(fn) { callback = fn; }
    observe(target) { assert.equal(target, root); }
    disconnect() { disconnected = true; }
  }
  const cleanup = html.match(/<script>\(function\(\)\{([\s\S]*?)<\/script>/)[0].replace(/^<script>|<\/script>$/g, '');
  vm.runInNewContext(cleanup, { document, MutationObserver });
  callback();
  assert.equal(removed, false);
  fallbackPresent = false; // React has replaced the static product.
  callback();
  assert.equal(removed, true);
  assert.equal(disconnected, true);
});

test('an unavailable app shell cannot produce a successful non-purchasable page', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Unavailable', { status: 503 }));
  await assert.rejects(attachShoppingApp(productHtml, new Request('https://luxemia.shop/product/new')), /shell unavailable/);
});

test('a login page or malformed shell without the app is rejected', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html><head><title>Log in</title></head></html>'));
  await assert.rejects(attachShoppingApp(productHtml, new Request('https://luxemia.shop/product/new')), /entry missing/);
});
