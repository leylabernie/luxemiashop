import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { hasFixedStitchedLehengaOptions, isGarmentAlterationCartLine, getEligibleServiceAddOns, serviceAddOnTotal, SERVICE_ADD_ONS, SERVICE_ADD_ON_PRODUCT_HANDLE } from '../src/lib/serviceAddOns.ts';

const sizes = ['32', '34', '36', '38', '40', '42', '44', '46', 'Custom Fit'];
const garment = {
  id: 'rust405924', handle: 'rust-orange-art-silk-embroidered-lehenga-choli',
  title: 'Rust Orange Art Silk Embroidered Lehenga Choli — Stitched',
  productType: 'Lehenga Choli', description: 'Stitched lehenga, choli and dupatta.',
  tags: ['construction:Stitched', 'stitched', 'lehenga-choli'],
  priceRange: { minVariantPrice: { amount: '79.08', currencyCode: 'USD' } },
  images: { edges: [] },
  options: [{ name: 'Stitching', values: ['Stitched'] }, { name: 'Size', values: sizes }],
  variants: { edges: sizes.map(size => ({ node: {
    id: `gid://shopify/ProductVariant/${size}`, title: `Stitched / ${size}`, sku: `405924-${size}`,
    availableForSale: true, price: { amount: '79.08', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Stitching', value: 'Stitched' }, { name: 'Size', value: size }],
  } })) },
};
const service = {
  product: { node: { title: 'LuxeMia Saree Services', handle: SERVICE_ADD_ON_PRODUCT_HANDLE, description: '', variants: { edges: [] }, images: { edges: [] } } },
  variantId: 'shared-billing-10', variantTitle: SERVICE_ADD_ONS['garment-alteration'].checkoutOptionValue,
  price: { amount: '10', currencyCode: 'USD' }, quantity: 1, selectedOptions: [],
  customAttributes: [{ key: 'Applies To', value: garment.title }],
};
const garmentLine = { product: { node: garment }, ...garment.variants.edges[0].node, variantId: garment.variants.edges[0].node.id, variantTitle: garment.variants.edges[0].node.title, quantity: 1 };

const require = createRequire(import.meta.url);
const modules = {};
for (const [name, path] of Object.entries({ ProductInfo: '../src/components/product/ProductInfo.tsx', CartDrawer: '../src/components/cart/CartDrawer.tsx' })) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(path, import.meta.url))], bundle: true, write: false,
    platform: 'node', format: 'cjs', jsx: 'automatic', packages: 'external', external: ['react', 'react/jsx-runtime'],
    alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
    define: { 'import.meta.env': '{}' },
    plugins: [{ name: 'render-state', setup(builder) {
      builder.onResolve({ filter: /^(?:@\/stores\/(?:cartStore|wishlistStore)|@\/hooks\/useShopifyProduct|react-router-dom)$/ }, args => ({ path: args.path, namespace: 'render-state' }));
      builder.onLoad({ filter: /.*/, namespace: 'render-state' }, ({ path }) => ({ contents:
        path.endsWith('cartStore') ? 'export const useCartStore = select => select ? select(globalThis.__displayCart) : globalThis.__displayCart;'
        : path.endsWith('wishlistStore') ? 'export const useWishlistStore = select => select({ toggleItem() {}, isInWishlist: () => false });'
        : path.endsWith('useShopifyProduct') ? 'export const useShopifyProduct = () => ({ product: globalThis.__displayBillingProduct });'
        : 'import { createElement } from "react"; export const useSearchParams = () => [new URLSearchParams(globalThis.__displaySearch)]; export const Link = ({to, children, ...props}) => createElement("a", {...props, href: to}, children);', loader: 'js' }));
    } }],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
  modules[name] = module.exports[name] ?? module.exports.default;
}
const setState = items => {
  globalThis.__displayCart = { items, isLoading: false, checkoutError: null, addItem() {}, openCart() {}, trackCartView() {}, updateQuantity() {}, removeItem() {}, createCheckout() {} };
  globalThis.__displayBillingProduct = { ...service.product.node, variants: { edges: [{ node: { id: service.variantId, title: service.variantTitle, price: service.price, availableForSale: true, selectedOptions: [{ name: 'Service', value: service.variantTitle }] } }] } };
};
const renderProduct = product => renderToStaticMarkup(createElement(modules.ProductInfo, { product }));
const renderCart = items => { setState(items); return renderToStaticMarkup(createElement(modules.CartDrawer, { isOpen: true, onClose() {} })); };

test('fixed stitched lehenga model preserves nine native fits and the optional $10 service', () => {
  assert.equal(hasFixedStitchedLehengaOptions(garment), true);
  assert.deepEqual(getEligibleServiceAddOns(garment), ['garment-alteration']);
  assert.equal(serviceAddOnTotal(['garment-alteration']), 10);
  assert.equal(garment.variants.edges.length, 9);
  for (const { node } of garment.variants.edges) assert.equal(node.price.amount, '79.08');
  const soldOut = structuredClone(garment); soldOut.variants.edges[0].node.availableForSale = false;
  assert.equal(hasFixedStitchedLehengaOptions(soldOut), true);
});

test('fixed stitched guard excludes sarees, explicit tailoring, mixed construction and inconsistent variants', () => {
  assert.equal(hasFixedStitchedLehengaOptions({ ...garment, title: 'Silk Saree', productType: 'Saree' }), false);
  assert.equal(hasFixedStitchedLehengaOptions({ ...garment, tags: ['tailoring:Made to measure'] }), false);
  const mixed = structuredClone(garment); mixed.options[0].values.push('Custom Stitching');
  assert.equal(hasFixedStitchedLehengaOptions(mixed), false);
  const inconsistent = structuredClone(garment); inconsistent.variants.edges[0].node.selectedOptions[0].value = 'Custom Stitching';
  assert.equal(hasFixedStitchedLehengaOptions(inconsistent), false);
  assert.equal(hasFixedStitchedLehengaOptions({ ...garment, options: [garment.options[0]] }), false);
});

test('rendered stitched product has no neckline for any size, while Custom Fit still needs acknowledgment', () => {
  setState([]);
  for (const { node } of garment.variants.edges) {
    globalThis.__displaySearch = `variant=${encodeURIComponent(node.id)}`;
    const html = renderProduct(garment);
    assert.doesNotMatch(html, /Blouse Neckline|Round Neck|Sweetheart/);
    assert.match(html, /Garment Alteration/);
    assert.match(html, /79\.08/);
    assert.match(html, /Custom Fit/);
    if (node.title.endsWith('Custom Fit')) assert.match(html, /acknowledge|confirm.*measurements|measurements.*confirm/i);
  }
  const source = readFileSync(new URL('../src/components/product/ProductInfo.tsx', import.meta.url), 'utf8');
  assert.match(source, /if \(hasFixedStitchedLehenga\) return false;/);
  assert.match(source, /if \(showNeckline\) \{\s*customAttributes.push\(\{ key: 'Blouse Neckline', value: selectedNeckline \}\)/);
  assert.match(source, /if \(isCustomSizeSelected && !customSizeConfirmed\)/);
});

test('genuine saree and custom-stitching neckline controls remain rendered', () => {
  setState([]); globalThis.__displaySearch = '';
  assert.match(renderProduct({ ...garment, title: 'Silk Saree', productType: 'Saree', tags: [] }), /Blouse Neckline/);
  const custom = structuredClone(garment);
  custom.options[0].values = ['Custom Stitching'];
  custom.variants.edges.forEach(({ node }) => { node.selectedOptions[0].value = 'Custom Stitching'; });
  assert.match(renderProduct(custom), /Blouse Neckline/);
});

test('new and persisted garment service lines render accurate labels without changing $10 billing', () => {
  for (const line of [service, { ...service, serviceAddOnCode: 'garment-alteration' }]) {
    assert.equal(isGarmentAlterationCartLine(line, [garmentLine, line]), true);
    const html = renderCart([garmentLine, line]);
    assert.match(html, /Garment Alteration/);
    assert.match(html, /Alteration service for your selected garment/);
    assert.match(html, /Applied to 1 garment/);
    assert.match(html, /\$10\.00/);
    assert.match(html, /\$89\.08/);
    assert.doesNotMatch(html, /Saree service|Finishing service for your selected saree|Applied to 1 saree/);
    assert.equal(line.variantId, 'shared-billing-10');
  }
});

test('saree, orphan, conflicting and other billing service lines keep their original classification', () => {
  const saree = { ...garmentLine, product: { node: { ...garment, title: 'Silk Saree', productType: 'Saree' } } };
  const sareeService = { ...service, customAttributes: [{ key: 'Applies To', value: 'Silk Saree' }] };
  assert.equal(isGarmentAlterationCartLine(sareeService, [saree, sareeService]), false);
  const html = renderCart([saree, sareeService]);
  assert.match(html, /Saree service/); assert.match(html, /Applied to 1 saree/);
  assert.match(html, /Blouse Stitching \/ Alteration/);
  assert.equal(isGarmentAlterationCartLine(service, [service]), false);
  assert.equal(isGarmentAlterationCartLine({ ...service, serviceAddOnCode: 'blouse-stitching' }, [garmentLine]), false);
  for (const code of ['pico-fall', 'matching-petticoat']) assert.equal(isGarmentAlterationCartLine({ ...service, variantTitle: SERVICE_ADD_ONS[code].checkoutOptionValue }, [garmentLine]), false);
  assert.equal(isGarmentAlterationCartLine(garmentLine, [garmentLine]), false);
});

test('service display identity preserves Applies To and billing variant', () => {
  const source = readFileSync(new URL('../src/components/product/ProductInfo.tsx', import.meta.url), 'utf8');
  assert.match(source, /\{ key: 'Applies To', value: product.title \}/);
  assert.match(source, /serviceAddOnCode: code/);
  assert.match(source, /variantId: serviceVariant.id/);
});

const storeBuild = await build({
  entryPoints: [fileURLToPath(new URL('../src/stores/cartStore.ts', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
  plugins: [{ name: 'no-external-effects', setup(builder) {
    builder.onResolve({ filter: /^@\/(?:lib\/shopify|hooks\/useAnalytics)$/ }, args => ({ path: args.path, namespace: 'no-effects' }));
    builder.onLoad({ filter: /.*/, namespace: 'no-effects' }, ({ path }) => ({ contents: path.endsWith('shopify')
      ? 'export const createStorefrontCheckout = async () => null;'
      : 'export const trackAddToCart = () => {}; export const trackBeginCheckout = () => {}; export const trackCheckoutHandoffSuccess = () => {}; export const trackRemoveFromCart = () => {}; export const trackViewCart = () => {};', loader: 'js' }));
  } }],
});
const storeModule = { exports: {} };
// Persist uses browser storage in production; use an in-memory store for this test.
const savedStorage = globalThis.localStorage;
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
new Function('require', 'module', 'exports', storeBuild.outputFiles[0].text)(require, storeModule, storeModule.exports);
const cartStore = storeModule.exports.useCartStore;

test('new and legacy service metadata keep cart quantity and removal linkage', () => {
  for (const line of [service, { ...service, serviceAddOnCode: 'garment-alteration' }]) {
    cartStore.setState({ items: [] });
    cartStore.getState().addItem(garmentLine);
    cartStore.getState().addItem(line);
    cartStore.getState().updateQuantity(garmentLine.variantId, 2, garmentLine.customAttributes);
    assert.deepEqual(cartStore.getState().items.map(item => item.quantity), [2, 2]);
    assert.equal(isGarmentAlterationCartLine(cartStore.getState().items[1], cartStore.getState().items), true);
    cartStore.getState().removeItem(line.variantId, line.customAttributes);
    assert.equal(cartStore.getState().items.length, 1);
    assert.equal(cartStore.getState().items[0].variantId, garmentLine.variantId);
    cartStore.getState().addItem(line);
    cartStore.getState().removeItem(garmentLine.variantId, garmentLine.customAttributes);
    assert.deepEqual(cartStore.getState().items, []);
  }
});
test('mixed legacy and typed repeated additions merge and never duplicate the alteration charge', () => {
  for (const typedFirst of [false, true]) {
    const typed = { ...service, serviceAddOnCode: 'garment-alteration' };
    cartStore.setState({ items: [] });
    for (const line of typedFirst ? [typed, service] : [service, typed]) {
      cartStore.getState().addItem(garmentLine);
      cartStore.getState().addItem(line);
    }
    assert.equal(cartStore.getState().items.length, 2);
    assert.deepEqual(cartStore.getState().items.map(item => item.quantity), [2, 2]);
    cartStore.getState().updateQuantity(garmentLine.variantId, 3, garmentLine.customAttributes);
    const items = cartStore.getState().items;
    assert.equal(items.filter(item => item.variantId === service.variantId).length, 1);
    assert.equal(items[1].quantity * Number(items[1].price.amount), 30);
    assert.equal(isGarmentAlterationCartLine(items[1], items), true);
    assert.deepEqual(items[1].customAttributes, service.customAttributes);
    cartStore.getState().removeItem(garmentLine.variantId, garmentLine.customAttributes);
    assert.deepEqual(cartStore.getState().items, []);
  }
});
test.after(() => { globalThis.localStorage = savedStorage; delete globalThis.__displayCart; delete globalThis.__displayBillingProduct; delete globalThis.__displaySearch; });
