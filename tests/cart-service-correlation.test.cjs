const assert = require('node:assert/strict');
const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { build } = require('esbuild');

let cartModule;
let temporaryDirectory;
const storage = new Map();

const localStorageStub = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

test.before(async () => {
  global.localStorage = localStorageStub;

  const result = await build({
    absWorkingDir: path.resolve(__dirname, '..'),
    entryPoints: ['src/stores/cartStore.ts'],
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
          namespace: 'cart-test',
          path: 'sonner',
        }));
        esbuild.onLoad({ filter: /.*/, namespace: 'cart-test' }, () => ({
          contents: 'export const toast = { error() {} };',
          loader: 'js',
        }));
      },
    }],
    write: false,
  });

  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'luxemia-cart-test-'));
  const bundledModulePath = path.join(temporaryDirectory, 'cart-store.cjs');
  await writeFile(bundledModulePath, result.outputFiles[0].contents);
  cartModule = require(bundledModulePath);
});

test.after(async () => {
  delete global.localStorage;
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

const garmentProduct = {
  node: {
    id: 'gid://shopify/Product/garment',
    title: 'Midnight Saree',
    handle: 'midnight-saree',
    description: '',
    createdAt: '2026-01-01T00:00:00Z',
    productType: 'Saree',
    availableForSale: true,
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/size-s', availableForSale: true } },
        { node: { id: 'gid://shopify/ProductVariant/size-m', availableForSale: true } },
      ],
    },
  },
};

const serviceProduct = {
  node: {
    id: 'gid://shopify/Product/service',
    title: 'LuxeMia Saree Services',
    handle: 'luxemia-tailoring-saree-finishing-add-ons',
    description: '',
    createdAt: '2026-01-01T00:00:00Z',
    productType: 'Service',
    availableForSale: true,
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/pico', availableForSale: true } },
      ],
    },
  },
};

const garmentLine = (size, lineId) => ({
  product: garmentProduct,
  variantId: `gid://shopify/ProductVariant/size-${size.toLowerCase()}`,
  variantTitle: size,
  price: { amount: '120.00', currencyCode: 'USD' },
  quantity: 1,
  selectedOptions: [{ name: 'Size', value: size }],
  customAttributes: [{ key: cartModule.GARMENT_LINE_ID_ATTRIBUTE, value: lineId }],
});

const picoLine = (lineId) => ({
  product: serviceProduct,
  variantId: 'gid://shopify/ProductVariant/pico',
  variantTitle: 'Pico & Fall',
  price: { amount: '10.00', currencyCode: 'USD' },
  quantity: 1,
  selectedOptions: [{ name: 'Service', value: 'Pico & Fall' }],
  customAttributes: [
    { key: 'Applies To', value: 'Midnight Saree' },
    { key: cartModule.GARMENT_LINE_ID_ATTRIBUTE, value: lineId },
  ],
});

test('same-title size S and M garments retain independent Pico & Fall lines across reload', async () => {
  storage.clear();
  const store = cartModule.useCartStore;
  store.setState({
    items: [],
    cartId: null,
    checkoutUrl: null,
    isLoading: false,
    isCartOpen: false,
  });

  const sizeSLineId = cartModule.createGarmentLineId();
  const sizeMLineId = cartModule.createGarmentLineId();
  assert.notEqual(sizeSLineId, sizeMLineId);

  store.getState().addItem(garmentLine('S', sizeSLineId));
  store.getState().addItem(picoLine(sizeSLineId));
  store.getState().addItem(garmentLine('M', sizeMLineId));
  store.getState().addItem(picoLine(sizeMLineId));

  assert.equal(store.getState().items.length, 4, 'service lines must not merge by title');
  const persistedCart = storage.get('shopify-cart');
  assert.ok(persistedCart?.includes(sizeSLineId));
  assert.ok(persistedCart?.includes(sizeMLineId));

  store.setState({ items: [] });
  storage.set('shopify-cart', persistedCart);
  await store.persist.rehydrate();

  const rehydratedSizeS = store.getState().items.find((item) => item.variantTitle === 'S');
  const rehydratedSizeM = store.getState().items.find((item) => item.variantTitle === 'M');
  assert.ok(rehydratedSizeS);
  assert.ok(rehydratedSizeM);

  store.getState().updateQuantity(
    rehydratedSizeS.variantId,
    2,
    rehydratedSizeS.customAttributes,
  );

  const quantitiesByLine = (lineId) => store.getState().items
    .filter((item) => cartModule.getGarmentLineId(item) === lineId)
    .map((item) => item.quantity);

  assert.deepEqual(quantitiesByLine(sizeSLineId), [2, 2]);
  assert.deepEqual(quantitiesByLine(sizeMLineId), [1, 1]);

  store.getState().removeItem(
    rehydratedSizeS.variantId,
    rehydratedSizeS.customAttributes,
  );

  assert.equal(store.getState().items.some((item) => (
    cartModule.getGarmentLineId(item) === sizeSLineId
  )), false);
  assert.deepEqual(quantitiesByLine(sizeMLineId), [1, 1]);
});
