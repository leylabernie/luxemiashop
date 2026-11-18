const assert = require('node:assert/strict');
const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { build } = require('esbuild');

let checkout;
let useCartStore;
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

  const storeResult = await build({
    absWorkingDir: path.resolve(__dirname, '..'),
    entryPoints: ['src/stores/cartStore.ts'], bundle: true,
    define: { 'import.meta.env': '{}' }, format: 'cjs', platform: 'node',
    plugins: [{
      name: 'stub-store-browser-deps',
      setup(esbuild) {
        esbuild.onResolve({ filter: /^(sonner|@\/hooks\/useAnalytics)$/ }, args => ({ namespace: 'store-stub', path: args.path }));
        esbuild.onLoad({ filter: /.*/, namespace: 'store-stub' }, args => ({
          contents: args.path === 'sonner' ? 'export const toast = { error() {}, success() {} };'
            : 'export const trackAddToCart = () => {}; export const trackBeginCheckout = () => {}; export const trackCheckoutHandoffSuccess = () => {}; export const trackRemoveFromCart = () => {}; export const trackViewCart = () => {};',
          loader: 'js',
        }));
      },
    }], write: false,
  });
  const storage = new Map();
  globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
  };

  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-checkout-test-'));
  const bundledModulePath = path.join(temporaryDirectory, 'shopify.cjs');
  await writeFile(bundledModulePath, result.outputFiles[0].contents);
  checkout = require(bundledModulePath);
  const storePath = path.join(temporaryDirectory, 'store.cjs');
  await writeFile(storePath, storeResult.outputFiles[0].contents);
  ({ useCartStore } = require(storePath));
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

test('preserves verified branded host, paths and query values, including localized Shopify routes', () => {
  for (const route of ['/cart/c/token', '/en-ca/cart/c/token', '/checkouts/cn/token/en-us', '/123456/checkouts/token']) {
    const result = new URL(checkout.normalizeShopifyCheckoutUrl(`https://CHECKOUT.LUXEMIA.SHOP${route}?key=synthetic&_s=session&_y=visitor`));
    assert.equal(result.hostname, 'checkout.luxemia.shop');
    assert.equal(result.pathname, route);
    assert.equal(result.searchParams.get('key'), 'synthetic');
    assert.equal(result.searchParams.get('_s'), 'session');
    assert.equal(result.searchParams.get('_y'), 'visitor');
    assert.equal(result.searchParams.get('channel'), 'online_store');
    assert.equal(result.searchParams.get('return_url'), 'https://luxemia.shop/order-confirmation');
  }
});

test('rejects hostile URL authorities and paths before URL normalization', () => {
  for (const value of [
    '', 'http://checkout.luxemia.shop/cart/c/token', 'javascript:alert(1)',
    'https://user:pass@checkout.luxemia.shop/cart/c/token',
    'https://checkout.luxemia.shop:443/cart/c/token', 'https://checkout.luxemia.shop:8443/cart/c/token',
    'https://checkout.luxemia.shop.evil.example/cart/c/token', 'https://sub.checkout.luxemia.shop/cart/c/token',
    'https://checkout.luxemia.shop./cart/c/token', 'https://other.myshopify.com/cart/c/token',
    'https://checkout.luxemia.shop/checkout', 'https://checkout.luxemia.shop/cart',
    'https://checkout.luxemia.shop/cart/c/..', 'https://checkout.luxemia.shop/cart/c/%2e%2e',
    'https://checkout.luxemia.shop/cart/c/../c/token', 'https://checkout.luxemia.shop/cart/c/token%2fadmin',
    'https://checkout.luxemia.shop/cart/c/token%252fadmin',
    '//checkout.luxemia.shop/cart/c/token', '/\\checkout.luxemia.shop/cart/c/token',
    '/cart/c/token/../token',
  ]) assert.equal(checkout.normalizeShopifyCheckoutUrl(value), null, value);
});

test('checkout failures retain cart, distinguish missing from invalid and never log sensitive data', async () => {
  const item = {
    variantId: 'gid://shopify/ProductVariant/123456', variantTitle: 'Size 36',
    selectedOptions: [{ name: 'Size', value: '36' }], quantity: 1,
    price: { amount: '129.00', currencyCode: 'USD' },
    customAttributes: [{ key: 'Customer Note', value: 'SYNTHETIC_PRIVATE_DETAIL' }],
    product: { node: {
      id: 'gid://shopify/Product/999', title: 'Synthetic Lehenga', handle: 'synthetic-lehenga',
      createdAt: '2026-01-01T00:00:00Z', description: '',
      priceRange: { minVariantPrice: { amount: '129.00', currencyCode: 'USD' } },
      compareAtPriceRange: { minVariantPrice: { amount: '129.00', currencyCode: 'USD' }, maxVariantPrice: { amount: '129.00', currencyCode: 'USD' } },
      images: { edges: [] }, options: [{ name: 'Size', values: ['36'] }],
      variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/123456', title: 'Size 36', price: { amount: '129.00', currencyCode: 'USD' }, compareAtPrice: null, availableForSale: true, selectedOptions: [{ name: 'Size', value: '36' }] } }] },
    } },
  };
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' '));
  const response = (url, mode) => async (_input, options) => {
    const { lines } = JSON.parse(options.body).variables.input;
    const cart = { id: 'SYNTHETIC_CART_TOKEN?key=SYNTHETIC_CART_KEY', checkoutUrl: url,
      lines: { pageInfo: { hasNextPage: false }, edges: lines.map(line => ({ node: {
        quantity: line.quantity, attributes: line.attributes || [], merchandise: { id: line.merchandiseId, price: { amount: '129.00', currencyCode: 'USD' } },
      } })) } };
    return { ok: true, status: 200, json: async () => mode === 'empty' ? { data: null, private: 'SYNTHETIC_PRIVATE_DETAIL' } : ({
      data: { cartCreate: { cart: mode === 'no-cart' ? null : cart, userErrors: mode === 'user-errors' ? [{ message: 'SYNTHETIC_PRIVATE_DETAIL https://secret.example' }] : [] } },
    }) };
  };
  try {
    const lines = [{ variantId: item.variantId, quantity: 1, customAttributes: item.customAttributes }];
    globalThis.fetch = response('', 'no-cart');
    await assert.rejects(checkout.createStorefrontCheckout(lines), error => error.name === 'CheckoutUrlError' && error.reason === 'missing_checkout_url');
    globalThis.fetch = response('https://untrusted.example/cart/c/SYNTHETIC_TOKEN?key=SYNTHETIC_KEY');
    await assert.rejects(checkout.createStorefrontCheckout(lines), error => error.name === 'CheckoutUrlError' && error.reason === 'invalid_checkout_url');
    useCartStore.setState({ items: [item], cartId: null, checkoutUrl: null, checkoutError: null, isLoading: false });
    for (const mode of ['no-cart', 'missing', 'invalid', 'empty', 'user-errors']) {
      const url = mode === 'invalid' ? 'https://untrusted.example/cart/c/SYNTHETIC_TOKEN?key=SYNTHETIC_KEY' : '';
      globalThis.fetch = response(url, mode);
      assert.equal(await useCartStore.getState().createCheckout({ trackEvents: false }), null);
      const state = useCartStore.getState();
      assert.equal(state.items.length, 1);
      assert.equal(state.items[0].quantity, 1);
      if (mode === 'missing' || mode === 'no-cart') assert.match(state.checkoutError, /not returned/i);
      if (mode === 'invalid') assert.match(state.checkoutError, /could not be verified/i);
      assert.equal(state.checkoutUrl, null);
    }
    for (const entry of logged) assert.doesNotMatch(entry, /SYNTHETIC_|untrusted\.example|https?:\/\//);
    logged.length = 0;
    globalThis.fetch = response('https://checkout.luxemia.shop/cart/c/SYNTHETIC_LIVE?key=SYNTHETIC_KEY&_s=s1&_y=y1');
    const result = await useCartStore.getState().createCheckout({ trackEvents: false });
    assert.ok(result);
    assert.equal(useCartStore.getState().checkoutUrl, result);
    assert.equal(useCartStore.getState().checkoutError, null);
    assert.equal(new URL(result).searchParams.get('_y'), 'y1');
    assert.equal(logged.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});
