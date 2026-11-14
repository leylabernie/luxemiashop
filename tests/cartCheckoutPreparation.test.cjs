const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');
const originalFixture = globalThis.cartCheckoutFixture;
const originalStorage = globalThis.localStorage;
let storeCode;
let drawerCode;
let fixture;
let store;
let drawer;
let api;

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = () => new Promise(resolve => setImmediate(resolve));
const checkoutUrl = suffix => `https://luxemia.shop/cart/c/SYNTHETIC-${suffix}?key=local-only`;
const line = (id = '101', quantity = 1, customAttributes) => ({
  variantId: `gid://shopify/ProductVariant/${id}`, variantTitle: 'M', quantity,
  price: { amount: '99.97', currencyCode: 'USD' },
  selectedOptions: [{ name: 'Size', value: 'M' }], customAttributes,
  product: { node: { id: `gid://shopify/Product/${id}`, handle: `synthetic-garment-${id}`,
    title: 'Synthetic garment', productType: 'Garment', images: { edges: [] },
    variants: { edges: [{ node: { id: `gid://shopify/ProductVariant/${id}`, availableForSale: true } }] } } },
});
const load = code => {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(require, module, module.exports);
  return module.exports;
};
const elements = (node, predicate, found = []) => {
  if (Array.isArray(node)) node.forEach(child => elements(child, predicate, found));
  else if (node && typeof node === 'object') {
    if (predicate(node)) found.push(node);
    elements(node.props?.children, predicate, found);
  }
  return found;
};
const checkoutControl = tree => elements(tree, node => node.props?.['data-testid'] === 'button-checkout')[0];
const render = (isOpen = true) => {
  fixture.effectIndex = 0;
  return drawer({ isOpen, onClose: () => { fixture.closes += 1; } });
};
const runEffects = () => {
  const effects = fixture.effects.splice(0);
  effects.forEach(effect => effect());
  return effects;
};
const seed = (...items) => {
  items.forEach(item => store.getState().addItem(item));
  fixture.events.length = 0;
};
const prepareReady = async (suffix = 'ready') => {
  const preparation = store.getState().prepareCheckout();
  await flush();
  fixture.calls.at(-1).resolve(checkoutUrl(suffix));
  assert.equal(await preparation, checkoutUrl(suffix));
};
const assertInvalid = () => {
  const state = store.getState();
  assert.equal(state.checkoutUrl, null);
  assert.equal(state.preparedShopifyCheckoutUrl, null);
  assert.equal(state.preparedCheckoutSignature, null);
  assert.equal(state.preparedCheckoutRevision, null);
  assert.equal(state.isLoading, false);
  assert.equal(state.checkoutPreparationStatus, 'idle');
};

test.before(async () => {
  const result = await build({
    entryPoints: [path.join(root, 'src/stores/cartStore.ts')], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', alias: { '@': path.join(root, 'src') },
    plugins: [{ name: 'isolated-cart-preparation', setup(builder) {
      builder.onResolve({ filter: /^@\/(?:lib\/shopify|hooks\/useAnalytics)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path: entry }) => ({ loader: 'js', resolveDir: root, contents: entry.endsWith('shopify')
        ? `import { CheckoutCartChangedError } from '${root}/src/lib/checkoutCartIntegrity.ts';
           globalThis.cartCheckoutFixture.cartChangedError=message=>new CheckoutCartChangedError(message);
           export const createStorefrontCheckout=(...args)=>globalThis.cartCheckoutFixture.checkout(...args);`
        : `const record=(type,args)=>globalThis.cartCheckoutFixture.events.push({type,args});
           export const trackAddToCart=(...args)=>record('add',args), trackRemoveFromCart=(...args)=>record('remove',args),
             trackBeginCheckout=(...args)=>record('begin',args), trackCheckoutHandoffSuccess=(...args)=>record('handoff',args),
             trackViewCart=(...args)=>record('view',args);` }));
    } }],
  });
  storeCode = result.outputFiles[0].text;
  const drawerResult = await build({
    entryPoints: [path.join(root, 'src/components/cart/CartDrawer.tsx')], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', alias: { '@': path.join(root, 'src') },
    jsx: 'automatic',
    plugins: [{ name: 'headless-drawer', setup(builder) {
      const sources = {
        '@/stores/cartStore': 'export const useCartStore=()=>globalThis.cartCheckoutFixture.store.getState(); export const getCartCheckoutSignature=items=>globalThis.cartCheckoutFixture.signature(items);',
        react: 'export const useEffect=(callback,deps)=>globalThis.cartCheckoutFixture.useEffect(callback,deps);',
        'react/jsx-runtime': 'export const Fragment="fragment"; export const jsx=(type,props)=>typeof type==="function"?type(props):({type,props}); export const jsxs=jsx;',
        'framer-motion': 'export const motion=new Proxy({}, {get:(_target,key)=>key}); export const AnimatePresence=({children})=>children;',
        'lucide-react': 'export const X="svg",Minus="svg",Plus="svg",Trash2="svg",Loader2="svg",ArrowRight="svg",ShieldCheck="svg",Award="svg",Truck="svg";',
        '@/components/ui/button': 'export const Button=props=>props.asChild?props.children:({type:"button",props});',
        '@/components/ui/ProductPlaceholder': 'export default ()=>null;',
        '@/lib/imageUtils': 'export const getOptimizedImage=url=>url;',
      };
      builder.onResolve({ filter: /.*/ }, args => Object.hasOwn(sources, args.path) ? { path: args.path, namespace: 'fixture' } : undefined);
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'js', contents: sources[args.path] }));
    } }],
  });
  drawerCode = drawerResult.outputFiles[0].text;
});

test.beforeEach(() => {
  fixture = { calls: [], events: [], storage: new Map(), effects: [], dependencies: [], effectIndex: 0, closes: 0 };
  fixture.checkout = (...args) => {
    const request = { ...deferred(), args };
    fixture.calls.push(request);
    return request.promise;
  };
  fixture.useEffect = (callback, dependencies) => {
    const index = fixture.effectIndex++;
    const previous = fixture.dependencies[index];
    if (!previous || dependencies.some((value, offset) => !Object.is(value, previous[offset]))) {
      fixture.dependencies[index] = dependencies;
      fixture.effects.push(callback);
    }
  };
  globalThis.cartCheckoutFixture = fixture;
  globalThis.localStorage = {
    getItem: key => fixture.storage.get(key) ?? null,
    setItem: (key, value) => fixture.storage.set(key, value),
    removeItem: key => fixture.storage.delete(key),
  };
  api = load(storeCode);
  store = api.useCartStore;
  fixture.store = store;
  fixture.signature = api.getCartCheckoutSignature;
  drawer = load(drawerCode).default;
});
test.after(() => {
  globalThis.cartCheckoutFixture = originalFixture;
  globalThis.localStorage = originalStorage;
});

test('drawer prepares only on open, then exposes a real uncancelled checkout anchor', async () => {
  seed(line());
  render(false);
  runEffects();
  await flush();
  assert.equal(fixture.calls.length, 0);
  const initial = checkoutControl(render());
  assert.equal(initial.type, 'button');
  assert.equal(initial.props.disabled, true);
  assert.equal(initial.props.href, undefined);
  const effects = runEffects();
  effects.forEach(effect => effect()); // StrictMode's repeated effect setup must deduplicate.
  await flush();
  assert.equal(fixture.calls.length, 1);
  assert.equal(store.getState().isLoading, true);
  assert.deepEqual(fixture.events.map(event => event.type), ['view', 'view']);
  fixture.calls[0].resolve(checkoutUrl('native'));
  await flush();
  const link = checkoutControl(render());
  runEffects();
  assert.equal(link.type, 'a');
  assert.equal(link.props.href, checkoutUrl('native'));
  assert.equal(link.props.disabled, undefined);
  assert.equal(link.props.target, undefined);
  assert.equal(fixture.calls.length, 1);
  assert.equal(fixture.events.some(event => ['begin', 'handoff'].includes(event.type)), false);
  const event = { button: 0, preventDefault() { assert.fail('Navigation must not be cancelled'); },
    stopPropagation() { assert.fail('Native linker event propagation must remain intact'); } };
  link.props.onClick(event);
  assert.equal(fixture.closes, 0, 'The drawer cannot remove the anchor before default navigation');
  assert.equal(fixture.calls.length, 1, 'Activation must not create another Shopify cart');
  assert.deepEqual(fixture.events.slice(-2).map(entry => entry.type), ['begin', 'handoff']);
  assert.equal(link.props.href, checkoutUrl('native'), 'The pre-existing href remains the browser navigation target');
  const count = fixture.events.length;
  link.props.onAuxClick({ ...event, button: 2 });
  assert.equal(fixture.events.length, count, 'A context-menu click is not checkout intent');
  link.props.onAuxClick({ ...event, button: 1 });
  assert.deepEqual(fixture.events.slice(-2).map(entry => entry.type), ['begin', 'handoff']);
});

test('drawer has no synthetic click, location redirect, cancellation, or close in enabled anchor', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/cart/CartDrawer.tsx'), 'utf8');
  assert.doesNotMatch(source, /(?:window\.)?location\s*(?:\.|\[)|dispatchEvent|MouseEvent|\.click\(|preventDefault|stopPropagation/);
  const anchor = source.match(/<a\s+href=\{preparedShopifyCheckoutUrl\}[\s\S]*?<\/a>/)?.[0];
  assert.ok(anchor);
  assert.doesNotMatch(anchor, /onClose|createCheckout|prepareCheckout|await/);
});

test('stable normalization, rerenders and drawer reopen reuse one preparation', async () => {
  seed(line('101', 1, [{ key: 'Custom Alteration Instructions', value: 'SYNTHETIC-private-fit-note' }]));
  const before = api.getCartCheckoutSignature(store.getState().items);
  const a = store.getState().prepareCheckout();
  const b = store.getState().prepareCheckout();
  await flush();
  assert.equal(fixture.calls.length, 1);
  fixture.calls[0].resolve(checkoutUrl('stable'));
  assert.deepEqual(await Promise.all([a, b]), [checkoutUrl('stable'), checkoutUrl('stable')]);
  assert.equal(api.getCartCheckoutSignature(store.getState().items), before);
  render(); runEffects(); await flush();
  render(); runEffects(); await flush();
  render(false); runEffects(); render(); runEffects(); await flush();
  assert.equal(await store.getState().prepareCheckout(), checkoutUrl('stable'));
  assert.equal(fixture.calls.length, 1);
  assert.equal(fixture.events.some(event => ['begin', 'handoff'].includes(event.type)), false);
});

for (const mutation of ['add', 'quantity', 'remove', 'clear']) {
  test(`${mutation} synchronously removes the ready href before any effect or next request`, async () => {
    seed(line(), line('102'));
    await prepareReady(mutation);
    render(); runEffects();
    const revision = store.getState().cartRevision;
    if (mutation === 'add') store.getState().addItem(line('103'));
    if (mutation === 'quantity') store.getState().updateQuantity(line().variantId, 2);
    if (mutation === 'remove') store.getState().removeItem(line().variantId);
    if (mutation === 'clear') store.getState().clearCart();
    assertInvalid();
    assert.ok(store.getState().cartRevision > revision);
    const control = checkoutControl(render());
    if (mutation === 'clear') assert.equal(control, undefined);
    else {
      assert.equal(control.type, 'button');
      assert.equal(control.props.disabled, true);
      assert.equal(control.props.href, undefined);
      runEffects();
      await flush();
      assert.equal(fixture.calls.length, 2, 'Open drawer rebuilds automatically after an edit');
      fixture.calls[1].resolve(checkoutUrl(`${mutation}-updated`));
      await flush();
      assert.equal(checkoutControl(render()).props.href, checkoutUrl(`${mutation}-updated`));
    }
  });
}

test('no-op quantity updates do not abandon a valid prepared cart', async () => {
  seed(line());
  await prepareReady('same-quantity');
  const revision = store.getState().cartRevision;
  store.getState().updateQuantity(line().variantId, 1);
  assert.equal(store.getState().cartRevision, revision);
  assert.equal(await store.getState().prepareCheckout(), checkoutUrl('same-quantity'));
  assert.equal(fixture.calls.length, 1);
});

for (const outcome of ['success', 'error']) {
  test(`A -> B -> A rejects a late ${outcome}, even with the original signature`, async () => {
    seed(line());
    const originalSignature = api.getCartCheckoutSignature(store.getState().items);
    const first = store.getState().prepareCheckout();
    await flush();
    store.getState().updateQuantity(line().variantId, 2);
    store.getState().updateQuantity(line().variantId, 1);
    assert.equal(api.getCartCheckoutSignature(store.getState().items), originalSignature);
    assertInvalid();
    const latest = store.getState().prepareCheckout();
    await flush();
    assert.equal(fixture.calls.length, 1, 'Only one Shopify request may run at a time');
    if (outcome === 'success') fixture.calls[0].resolve(checkoutUrl('obsolete'));
    else fixture.calls[0].reject(Error('SYNTHETIC obsolete failure'));
    assert.equal(await first, null);
    await flush();
    assert.equal(fixture.calls.length, 2);
    assert.equal(store.getState().isLoading, true, 'Old finally cannot stop the current spinner');
    assert.equal(store.getState().checkoutError, null);
    assert.equal(store.getState().preparedShopifyCheckoutUrl, null);
    fixture.calls[1].resolve(checkoutUrl('current'));
    assert.equal(await latest, checkoutUrl('current'));
    assert.equal(store.getState().preparedShopifyCheckoutUrl, checkoutUrl('current'));
    assert.equal(store.getState().isLoading, false);
    assert.equal(fixture.events.some(event => ['begin', 'handoff'].includes(event.type)), false);
  });
}

test('late success after clear cannot repopulate state or leave a spinner running', async () => {
  seed(line());
  const preparation = store.getState().prepareCheckout();
  await flush();
  store.getState().clearCart();
  fixture.calls[0].resolve(checkoutUrl('cleared'));
  assert.equal(await preparation, null);
  assertInvalid();
  assert.equal(store.getState().checkoutError, null);
  assert.deepEqual(store.getState().items, []);
});

test('rapid edits coalesce pending snapshots rather than creating unbounded abandoned carts', async () => {
  seed(line());
  const preparations = [store.getState().prepareCheckout()];
  await flush();
  for (let quantity = 2; quantity <= 26; quantity += 1) {
    store.getState().updateQuantity(line().variantId, quantity);
    preparations.push(store.getState().prepareCheckout());
  }
  await flush();
  assert.equal(fixture.calls.length, 1);
  fixture.calls[0].resolve(checkoutUrl('first-obsolete'));
  await flush();
  assert.equal(fixture.calls.length, 2);
  assert.equal(fixture.calls[1].args[0][0].quantity, 26);
  fixture.calls[1].resolve(checkoutUrl('last-stable'));
  const results = await Promise.all(preparations);
  assert.deepEqual(results.slice(0, -1), Array(25).fill(null));
  assert.equal(results.at(-1), checkoutUrl('last-stable'));
});

for (const outcome of ['empty', 'error']) {
  test(`preparation ${outcome} has no href and retries only on explicit customer action`, async () => {
    seed(line());
    render(); runEffects();
    await flush();
    const originalError = console.error;
    console.error = () => {};
    try {
      if (outcome === 'empty') fixture.calls[0].resolve(null);
      else fixture.calls[0].reject(Error('SYNTHETIC fixture outage'));
      await flush();
    } finally { console.error = originalError; }
    const retry = checkoutControl(render());
    runEffects();
    assert.equal(retry.type, 'button');
    assert.equal(retry.props.href, undefined);
    assert.equal(retry.props.disabled, false);
    assert.match(store.getState().checkoutError, /Your bag is saved/);
    await store.getState().prepareCheckout();
    render(false); runEffects(); render(); runEffects(); await flush();
    assert.equal(fixture.calls.length, 1, 'Reopen/effect reruns cannot create a retry loop');
    retry.props.onClick();
    await flush();
    assert.equal(fixture.calls.length, 2);
    fixture.calls[1].resolve(checkoutUrl('retried'));
    await flush();
    assert.equal(checkoutControl(render()).props.href, checkoutUrl('retried'));
    assert.equal(store.getState().checkoutError, null);
    assert.equal(fixture.events.some(event => ['begin', 'handoff'].includes(event.type)), false);
  });
}

test('locally unavailable variants fail closed before Shopify or checkout analytics', async () => {
  const unavailable = line();
  unavailable.product.node.variants.edges[0].node.availableForSale = false;
  seed(unavailable);
  assert.equal(await store.getState().prepareCheckout(), null);
  const control = checkoutControl(render());
  assert.equal(control.type, 'button');
  assert.equal(control.props.disabled, true);
  assert.equal(control.props.href, undefined);
  assert.match(store.getState().checkoutError, /no longer available/);
  assert.equal(fixture.calls.length, 0);
  assert.deepEqual(fixture.events, []);
});

test('pending measurements preserve existing pre-network checkout validation', async () => {
  seed(line('101', 1, [{ key: 'Measurement submission', value: 'Re-enter measurement details after reload' }]));
  assert.equal(await store.getState().prepareCheckout(), null);
  assert.match(store.getState().checkoutError, /Re-enter your measurement details/);
  assert.equal(store.getState().isLoading, false);
  assert.equal(fixture.calls.length, 0);
  assert.deepEqual(fixture.events, []);
});

test('conflicting expected prices fail before Shopify and preserve the entire bag', async () => {
  const second = line('101', 1, [{ key: 'Configuration reference', value: 'SYNTHETIC-second' }]);
  second.price.amount = '120.00';
  seed(line(), second);
  const originalError = console.error;
  console.error = () => {};
  try { assert.equal(await store.getState().prepareCheckout(), null); }
  finally { console.error = originalError; }
  assert.match(store.getState().checkoutError, /product price changed/);
  assert.equal(fixture.calls.length, 0);
  assert.equal(store.getState().items.length, 2);
  assert.deepEqual(fixture.events, []);
});

test('preparation passes original fulfillment lines and expected prices to the existing Shopify validator', async () => {
  const attributes = [{ key: 'Configuration reference', value: 'SYNTHETIC-reference' },
    { key: 'Custom Alteration Instructions', value: 'SYNTHETIC-private-note' }];
  seed(line('101', 2, attributes));
  await prepareReady('fulfillment');
  assert.deepEqual(fixture.calls[0].args, [[{ variantId: line().variantId, quantity: 2,
    handle: line().product.node.handle, customAttributes: attributes }], undefined,
  { [line().variantId]: { amount: '99.97', currencyCode: 'USD' } }]);
  assert.deepEqual(store.getState().items[0].customAttributes, attributes);
  store.getState().trackPreparedCheckoutIntent();
  assert.doesNotMatch(JSON.stringify(fixture.events), /SYNTHETIC-reference|SYNTHETIC-private-note/);
});

test('snapshot signature includes price, currency, inventory, options and private fulfillment changes', () => {
  const original = line('101', 1, [{ key: 'Measurements', value: 'SYNTHETIC-31' }]);
  const signature = api.getCartCheckoutSignature([original]);
  const changes = [
    item => { item.price.amount = '100'; }, item => { item.price.currencyCode = 'CAD'; },
    item => { item.quantity = 2; }, item => { item.selectedOptions[0].value = 'L'; },
    item => { item.customAttributes[0].value = 'SYNTHETIC-35'; },
    item => { item.product.node.variants.edges[0].node.availableForSale = false; },
  ];
  for (const change of changes) {
    const changed = structuredClone(original);
    change(changed);
    assert.notEqual(api.getCartCheckoutSignature([changed]), signature);
  }
});

test('prepared URL and private snapshot are never persisted, and legacy/forged URLs are ignored on reload', async () => {
  seed(line());
  await prepareReady('ephemeral');
  const persisted = JSON.parse(fixture.storage.get('shopify-cart')).state;
  assert.equal(persisted.checkoutUrl, null);
  assert.equal(persisted.cartId, null);
  assert.equal(persisted.preparedShopifyCheckoutUrl, undefined);
  assert.equal(persisted.preparedCheckoutSignature, undefined);
  assert.equal(persisted.preparedCheckoutRevision, undefined);
  assert.doesNotMatch(fixture.storage.get('shopify-cart'), /SYNTHETIC-ephemeral/);
  fixture.storage.set('shopify-cart', JSON.stringify({ version: 0, state: { ...persisted,
    checkoutUrl: checkoutUrl('legacy-stale'), cartId: 'SYNTHETIC-old-cart',
    preparedShopifyCheckoutUrl: checkoutUrl('forged-stale'), preparedCheckoutSignature: api.getCartCheckoutSignature(store.getState().items),
    preparedCheckoutRevision: store.getState().cartRevision, checkoutPreparationStatus: 'ready', isLoading: true } }));
  await store.persist.rehydrate();
  assertInvalid();
  assert.equal(store.getState().items.length, 1);
  assert.equal(checkoutControl(render()).type, 'button');
  const fresh = store.getState().prepareCheckout();
  await flush();
  assert.equal(fixture.calls.length, 2);
  fixture.calls[1].resolve(checkoutUrl('fresh-after-reload'));
  assert.equal(await fresh, checkoutUrl('fresh-after-reload'));
});

test('rehydration invalidates an in-flight request and safely resets loading', async () => {
  seed(line());
  const preparation = store.getState().prepareCheckout();
  await flush();
  await store.persist.rehydrate();
  assertInvalid();
  fixture.calls[0].resolve(checkoutUrl('pre-reload'));
  assert.equal(await preparation, null);
  assertInvalid();
  assert.equal(store.getState().checkoutError, null);
});

test('legacy URL setters cannot authorize the drawer link', () => {
  seed(line());
  store.getState().setCheckoutUrl(checkoutUrl('unverified-setter'));
  const control = checkoutControl(render());
  assert.equal(control.type, 'button');
  assert.equal(control.props.disabled, true);
  assert.equal(control.props.href, undefined);
  store.getState().trackPreparedCheckoutIntent();
  assert.deepEqual(fixture.events, []);
});

test('createCheckout defaults retain existing analytics API semantics', async () => {
  seed(line());
  const checkout = store.getState().createCheckout();
  assert.deepEqual(fixture.events.map(event => event.type), ['begin']);
  await flush();
  fixture.calls[0].resolve(checkoutUrl('legacy-default'));
  assert.equal(await checkout, checkoutUrl('legacy-default'));
  assert.deepEqual(fixture.events.map(event => event.type), ['begin', 'handoff']);
  assert.equal(store.getState().checkoutUrl, checkoutUrl('legacy-default'));
  assert.equal(store.getState().isLoading, false);
});

test('Shopify inventory/cart-integrity failures keep their actionable message and cannot expose a checkout URL', async () => {
  seed(line());
  const preparation = store.getState().prepareCheckout();
  await flush();
  const message = 'A selected item is no longer available in the requested quantity. Review your bag before checkout.';
  const originalError = console.error;
  console.error = () => {};
  try {
    fixture.calls[0].reject(fixture.cartChangedError(message));
    assert.equal(await preparation, null);
  } finally { console.error = originalError; }
  assert.equal(store.getState().checkoutError, message);
  assert.equal(store.getState().isLoading, false);
  assert.equal(store.getState().preparedShopifyCheckoutUrl, null);
  assert.equal(checkoutControl(render()).type, 'button');
  assert.equal(store.getState().items.length, 1);
  assert.deepEqual(fixture.events, []);
});

test('a cart edit clears an earlier failure and automatically prepares the new open bag', async () => {
  seed(line());
  render(); runEffects();
  await flush();
  const originalError = console.error;
  console.error = () => {};
  try { fixture.calls[0].resolve(null); await flush(); }
  finally { console.error = originalError; }
  assert.equal(store.getState().checkoutPreparationStatus, 'error');
  store.getState().updateQuantity(line().variantId, 2);
  assertInvalid();
  assert.equal(store.getState().checkoutError, null);
  render(); runEffects();
  await flush();
  assert.equal(fixture.calls.length, 2);
  assert.equal(fixture.calls[1].args[0][0].quantity, 2);
  fixture.calls[1].resolve(checkoutUrl('edited-after-failure'));
  await flush();
  assert.equal(checkoutControl(render()).props.href, checkoutUrl('edited-after-failure'));
});
