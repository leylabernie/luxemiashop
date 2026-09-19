const assert = require('node:assert/strict');
const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { build } = require('esbuild');

let checkout;
let temporaryDirectory;

test.before(async () => {
  const result = await build({
    absWorkingDir: path.resolve(__dirname, '..'),
    entryPoints: ['src/lib/shopify.ts'],
    bundle: true,
    define: {
      'import.meta.env': '{}',
    },
    format: 'cjs',
    platform: 'node',
    plugins: [{
      name: 'stub-browser-toast',
      setup(esbuild) {
        esbuild.onResolve({ filter: /^sonner$/ }, () => ({
          namespace: 'checkout-test',
          path: 'sonner',
        }));
        esbuild.onLoad({ filter: /.*/, namespace: 'checkout-test' }, () => ({
          contents: 'export const toast = { error() {} };',
          loader: 'js',
        }));
      },
    }],
    write: false,
  });

  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-checkout-test-'));
  const bundledModulePath = path.join(temporaryDirectory, 'shopify.cjs');
  await writeFile(bundledModulePath, result.outputFiles[0].contents);
  checkout = require(bundledModulePath);
});

test.after(async () => {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('rejects a malicious hostname suffix instead of trusting a substring', () => {
  const result = checkout.normalizeShopifyCheckoutUrl(
    'https://lovable-project-zlh0w.myshopify.com.evil.example/cart/c/token?key=secret',
  );

  assert.equal(result, null);
});

test('moves a returned headless storefront URL to the permanent Shopify host', () => {
  const result = new URL(checkout.normalizeShopifyCheckoutUrl(
    'https://luxemia.shop/cart/c/token?key=secret',
  ));

  assert.equal(result.hostname, 'lovable-project-zlh0w.myshopify.com');
  assert.equal(result.searchParams.get('key'), 'secret');
});

test('keeps the current permanent Shopify checkout host', () => {
  const result = new URL(checkout.normalizeShopifyCheckoutUrl(
    'https://lovable-project-zlh0w.myshopify.com/cart/c/token?key=secret',
  ));

  assert.equal(result.hostname, 'lovable-project-zlh0w.myshopify.com');
});

test('normalizes the store legacy myshopify alias by exact hostname', () => {
  const result = new URL(checkout.normalizeShopifyCheckoutUrl(
    'https://luxemiashop.myshopify.com/cart/c/token?key=secret',
  ));

  assert.equal(result.hostname, 'lovable-project-zlh0w.myshopify.com');
  assert.equal(result.searchParams.get('key'), 'secret');
});

test('rejects protocol-relative and backslash-relative host confusion', () => {
  assert.equal(
    checkout.normalizeShopifyCheckoutUrl('//evil.example/cart/c/token?key=secret'),
    null,
  );
  assert.equal(
    checkout.normalizeShopifyCheckoutUrl('/\\evil.example/cart/c/token?key=secret'),
    null,
  );
});

test('uses the optional branded hostname only when explicitly configured', () => {
  const configured = new URL(checkout.normalizeShopifyCheckoutUrl(
    'https://lovable-project-zlh0w.myshopify.com/cart/c/token?key=secret',
    'checkout.luxemia.shop',
  ));
  const unapproved = new URL(checkout.normalizeShopifyCheckoutUrl(
    'https://lovable-project-zlh0w.myshopify.com/cart/c/token?key=secret',
    'checkout.luxemia.shop.evil.example',
  ));

  assert.equal(configured.hostname, 'checkout.luxemia.shop');
  assert.equal(unapproved.hostname, 'lovable-project-zlh0w.myshopify.com');
});

test('fallback reconstruction retains the cart key and required handoff params', () => {
  const result = new URL(checkout.normalizeShopifyCheckoutUrl(
    '/cart/c/token?key=secret&campaign=navratri&channel=buy_button&return_url=https%3A%2F%2Fexample.com',
  ));

  assert.equal(result.hostname, 'lovable-project-zlh0w.myshopify.com');
  assert.equal(result.searchParams.get('key'), 'secret');
  assert.equal(result.searchParams.get('campaign'), 'navratri');
  assert.equal(result.searchParams.get('channel'), 'online_store');
  assert.equal(result.searchParams.get('return_url'), 'https://luxemia.shop/order-confirmation');
});
