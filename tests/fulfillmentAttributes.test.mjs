import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
async function load(entry, plugins = []) {
  const result = await build({ entryPoints: [resolve(entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', external: ['react', 'react/jsx-runtime'],
    alias: { '@': resolve('src') }, plugins });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}
const { normalizeFulfillmentAttributes } = await load('src/lib/fulfillmentAttributes.ts');
const { ALTERATION_TIMING_NOTICE } = await load('src/config/shippingPolicy.ts');
const oldAttributes = [
  { key: 'Tailoring', value: 'Tailored to order' },
  { key: 'Made to Order', value: 'Yes — confirmation required' },
  { key: 'Custom Size', value: 'Measurements must be confirmed before production' },
  { key: 'Timing Confirmation', value: 'Tailoring required; dispatch timing confirmed after measurements.' },
  { key: 'Timing Estimate', value: 'Approximately 4–5 weeks total; production and transit confirmed separately' },
  { key: 'Timing Estimate', value: 'Approximately 4–5 weeks total for the custom selection; production and transit confirmed separately' },
];
const newAttributes = [
  { key: 'Tailoring', value: 'Alterations / finishing requested' },
  { key: 'Fit Request', value: 'Confirmation required' },
  { key: 'Custom Size', value: 'Measurements must be confirmed before alterations' },
  { key: 'Timing Confirmation', value: ALTERATION_TIMING_NOTICE },
  { key: 'Timing Estimate', value: ALTERATION_TIMING_NOTICE },
  { key: 'Timing Estimate', value: ALTERATION_TIMING_NOTICE },
];

test('only six exact automatic pairs migrate, preserving order, duplicates and free-text attributes', () => {
  assert.equal(normalizeFulfillmentAttributes(undefined), undefined);
  assert.deepEqual(normalizeFulfillmentAttributes([]), []);
  const before = structuredClone(oldAttributes);
  assert.deepEqual(normalizeFulfillmentAttributes(oldAttributes), newAttributes);
  assert.deepEqual(oldAttributes, before, 'caller data is not mutated');
  assert.deepEqual(normalizeFulfillmentAttributes(newAttributes), newAttributes);
  const untouched = [
    { key: 'Requested Custom Color', value: 'Approximately 4–5 weeks total; production and transit confirmed separately' },
    { key: 'Measurements', value: 'SYNTHETIC waist 34; retain exactly' },
    { key: 'Fit Request', value: 'Please shorten 2 inches' },
    { key: 'Applies To', value: 'Tailored to order' },
    { key: 'Tailoring', value: ' Tailored to order' },
    { key: 'tailoring', value: 'Tailored to order' },
    { key: 'Timing Estimate', value: 'Approximately 4–5 weeks, as requested by customer' },
  ];
  assert.deepEqual(normalizeFulfillmentAttributes(untouched), untouched);
});

const originalStorage = globalThis.localStorage;
const originalCalls = globalThis.fulfillmentCheckoutCalls;
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
globalThis.fulfillmentCheckoutCalls = [];
const { useCartStore: store } = await load('src/stores/cartStore.ts', [{ name: 'no-external-effects', setup(builder) {
  builder.onResolve({ filter: /^@\/(?:lib\/shopify|hooks\/useAnalytics)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path.endsWith('shopify')
    ? 'export const createStorefrontCheckout = async (lines) => { globalThis.fulfillmentCheckoutCalls.push(lines); return "https://shop.example/checkout"; };'
    : 'export const trackAddToCart=()=>{}, trackBeginCheckout=()=>{}, trackCheckoutHandoffSuccess=()=>{}, trackRemoveFromCart=()=>{}, trackViewCart=()=>{};', loader: 'js' }));
} }]);
const line = (customAttributes, quantity = 1) => ({
  variantId: 'gid://shopify/ProductVariant/7', variantTitle: 'Custom Fit', quantity,
  price: { amount: '99.97', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: 'Custom Fit' }], customAttributes,
  product: { node: { id: 'gid://shopify/Product/7', handle: 'fixture-suit', title: 'Synthetic suit', variants: { edges: [] }, images: { edges: [] } } },
});

test('legacy and current insertion in either direction produces one canonical line with summed quantity', () => {
  for (const [first, second] of [[oldAttributes, newAttributes], [newAttributes, oldAttributes]]) {
    store.setState({ items: [] });
    store.getState().addItem(line(first, 2));
    store.getState().addItem(line(second));
    assert.equal(store.getState().items.length, 1);
    assert.deepEqual(store.getState().items[0], line(newAttributes, 3));
    store.getState().updateQuantity(line(first).variantId, 4, first);
    assert.equal(store.getState().items[0].quantity, 4);
    store.getState().removeItem(line(first).variantId, second);
    assert.deepEqual(store.getState().items, []);
  }
  // Also cover a persisted/preexisting line that bypassed addItem normalization.
  store.setState({ items: [line(oldAttributes, 2)] });
  store.getState().addItem(line(newAttributes));
  assert.deepEqual(store.getState().items, [line(newAttributes, 3)]);
});

test('different requested colors, measurements, or service Applies To never merge', () => {
  for (const key of ['Requested Custom Color', 'Measurements', 'Fit Request', 'Applies To']) {
    store.setState({ items: [] });
    const first = [...oldAttributes, { key, value: 'SYNTHETIC A' }];
    const second = [...newAttributes, { key, value: 'SYNTHETIC B' }];
    store.getState().addItem(line(first));
    store.getState().addItem(line(second, 2));
    assert.equal(store.getState().items.length, 2, key);
    assert.deepEqual(store.getState().items.map(item => item.quantity), [1, 2]);
    assert.equal(store.getState().items[0].customAttributes.at(-1).value, 'SYNTHETIC A');
    assert.equal(store.getState().items[1].customAttributes.at(-1).value, 'SYNTHETIC B');
  }
});

test('rehydration and checkout canonicalize only automatic copy while retaining exact fulfillment requests', async () => {
  const free = [{ key: 'Requested Custom Color', value: 'SYNTHETIC blue — pending confirmation' },
    { key: 'Measurements', value: 'SYNTHETIC 34 / 28' }];
  storage.set('shopify-cart', JSON.stringify({ version: 0, state: {
    items: [line([...oldAttributes, ...free], 1), line([...newAttributes, ...free], 1)], cartId: null, checkoutUrl: null,
  } }));
  await store.persist.rehydrate();
  assert.deepEqual(store.getState().items, [line([...newAttributes, ...free], 2)]);
  // A legacy line injected after hydration must still send corrected copy.
  store.setState({ items: [line([...oldAttributes, ...free], 2)] });
  assert.equal(await store.getState().createCheckout(), 'https://shop.example/checkout');
  assert.deepEqual(globalThis.fulfillmentCheckoutCalls.at(-1), [{ variantId: line().variantId, quantity: 2,
    handle: 'fixture-suit', customAttributes: [...newAttributes, ...free] }]);
});

const { default: CartDrawer } = await load('src/components/cart/CartDrawer.tsx', [{ name: 'render-fixture', setup(builder) {
  builder.onResolve({ filter: /^(framer-motion|lucide-react|@\/(?:stores\/cartStore|components\/ui\/|lib\/(?:imageUtils|serviceAddOns)))/ }, args => ({ path: args.path, namespace: 'render-fixture' }));
  builder.onLoad({ filter: /.*/, namespace: 'render-fixture' }, ({ path }) => {
    let contents;
    if (path === 'framer-motion') contents = 'import React from "react"; export const AnimatePresence=React.Fragment; export const motion=new Proxy({}, {get:(_,tag)=>({children,className,role})=>React.createElement(tag,{className,role},children)});';
    else if (path === 'lucide-react') contents = 'export const X=()=>null,Minus=X,Plus=X,Trash2=X,Loader2=X,ArrowRight=X,ShieldCheck=X,Award=X,Truck=X;';
    else if (path.endsWith('cartStore')) contents = 'export const useCartStore=()=>globalThis.fulfillmentRenderStore;';
    else if (path.endsWith('serviceAddOns')) contents = 'export const isGarmentAlterationCartLine=()=>false, isHiddenBillingProductHandle=()=>false;';
    else if (path.endsWith('imageUtils')) contents = 'export const getOptimizedImage=x=>x;';
    else if (path.endsWith('/button')) contents = 'import React from "react"; export const Button=({children})=>React.createElement("button",null,children);';
    else contents = 'export default ()=>null;';
    return { contents, loader: 'js' };
  });
} }]);

test('drawer renders canonical automatic metadata even for an old unhydrated line', () => {
  const previous = globalThis.fulfillmentRenderStore;
  globalThis.fulfillmentRenderStore = { items: [line(oldAttributes)], isLoading: false, checkoutError: null };
  try {
    const html = renderToStaticMarkup(React.createElement(CartDrawer, { isOpen: true, onClose() {} }));
    assert.match(html, /Alterations \/ finishing requested/);
    assert.match(html, /15–21 business days total/);
    assert.match(html, /Fit Request/);
    assert.doesNotMatch(html, /Tailored to order|Made to Order|before production|4–5 weeks/);
    assert.match(html, /\$99.97/);
    assert.match(html, /Custom Fit/);
  } finally { globalThis.fulfillmentRenderStore = previous; }
});

after(() => { globalThis.localStorage = originalStorage; globalThis.fulfillmentCheckoutCalls = originalCalls; });

test('legacy automatic timing preserves explicit dispatch without changing free text', () => {
 const result = normalizeFulfillmentAttributes(oldAttributes, 6);
 for (const item of result.filter(a => /^Timing /.test(a.key))) assert.match(item.value, /18–23 business days total/);
 const custom = [{key:'Timing Estimate', value:'Customer requested October delivery'}];
 assert.deepEqual(normalizeFulfillmentAttributes(custom, 6), custom);
});
