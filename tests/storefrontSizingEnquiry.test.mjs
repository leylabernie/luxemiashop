import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  getActualProductSizeValues, getProductOptionDisplayGroups, getCustomerFacingProductOptionName,
  hasNativeProductSizeOption, shouldRenderShopifyProductOption, NO_FINISHED_GARMENT_SIZE_NOTICE,
} from '../src/lib/productOptionNames.ts';
import {
  TAILORING_ENQUIRY_PRODUCTS, requiresTailoringEnquiry, isEnquiryOnlyVariant, hasUnconfirmedTargetTailoring,
} from '../src/lib/tailoringEnquiry.ts';
import { getDirectCardVariant, requiresProductPageSelection } from '../src/lib/purchaseOptions.ts';
import { resolveAvailableVariantForOption } from '../src/lib/productPurchaseFlow.ts';
import { SERVICE_ADD_ON_PRODUCT_HANDLE, SHARED_TAILORING_VARIANT_ID } from '../src/lib/serviceAddOns.ts';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
// The live catalogue no longer routes any product through the enquiry-only path.
// Keep one synthetic fixture so the guard itself stays covered.
if (TAILORING_ENQUIRY_PRODUCTS.length === 0) {
  TAILORING_ENQUIRY_PRODUCTS.push(
    { handle: 'orange-bead-embroidered-chinon-suit-dupatta', baseVariantId: 'gid://shopify/ProductVariant/48399143141547', customVariantId: 'gid://shopify/ProductVariant/48399143174315' },
    { handle: 'black-bead-embroidered-chinon-suit-dupatta', baseVariantId: 'gid://shopify/ProductVariant/48399143338155', customVariantId: 'gid://shopify/ProductVariant/48399143370923' },
    { handle: 'teal-bead-embroidered-chinon-suit-dupatta', baseVariantId: 'gid://shopify/ProductVariant/48399143436459', customVariantId: 'gid://shopify/ProductVariant/48399143469227' },
  );
}
const price = { amount: '99.97', currencyCode: 'USD' };
const targetProduct = (target = TAILORING_ENQUIRY_PRODUCTS[0]) => ({
  id: 'gid://shopify/Product/fixture', handle: target.handle,
  title: `${target.handle.split('-')[0].replace(/^./, letter => letter.toUpperCase())} Bead-Embroidered Chinon Suit with Dupatta`,
  productType: 'Salwar Suit', description: 'Listing supplied size 32; garment measurements are not provided.',
  descriptionHtml: '<p>Listing supplied size 32; garment measurements are not provided.</p>',
  tags: [], images: { edges: [] }, priceRange: { minVariantPrice: price },
  options: [{ name: 'Size', values: ['32', 'Alteration / Custom Size'] }],
  variants: { edges: [target.baseVariantId, target.customVariantId].map((id, index) => ({ node: {
    id, title: index ? 'Alteration / Custom Size' : '32', availableForSale: true, price,
    selectedOptions: [{ name: 'Size', value: index ? 'Alteration / Custom Size' : '32' }],
  } })) },
});
const billingProduct = (amount = '17.25', currencyCode = 'USD') => ({
  id: 'gid://shopify/Product/service-fixture', handle: SERVICE_ADD_ON_PRODUCT_HANDLE,
  title: 'LuxeMia Services', productType: 'Service', description: '', images: { edges: [] }, options: [],
  priceRange: { minVariantPrice: { amount, currencyCode } },
  variants: { edges: [{ node: { id: SHARED_TAILORING_VARIANT_ID,
    title: 'Stitching / Alteration (+$10)', availableForSale: true, price: { amount, currencyCode },
    selectedOptions: [{ name: 'Service', value: 'Stitching / Alteration (+$10)' }],
  } }] },
});
const lineFrom = (product, variant = product.variants.edges[0].node, quantity = 1, customAttributes = []) => ({
  product: { node: product }, variantId: variant.id, variantTitle: variant.title,
  selectedOptions: variant.selectedOptions, price: variant.price, quantity, customAttributes,
});
const checkoutLine = line => ({ ...line, handle: line.product.node.handle, title: line.product.node.title });

async function bundle(entry, plugins = []) {
  const output = await build({ entryPoints: [`${root}/${entry}`], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    alias: { '@': `${root}/src` }, define: { 'import.meta.env': '{}' }, plugins });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output.outputFiles[0].text)(require, module, module.exports);
  return module.exports;
}

const uiFixtures = { name: 'bounded-ui-fixtures', setup(builder) {
  builder.onResolve({ filter: /^react$/ }, args => args.importer.endsWith('/ProductInfo.tsx')
    ? { path: 'product-info-hooks', namespace: 'fixture-ui' } : { path: 'react', external: true });
  builder.onResolve({ filter: /^(?:@\/stores\/(?:cartStore|wishlistStore)|@\/hooks\/useShopifyProduct|react-router-dom|@\/components\/ui\/button)$/ }, args => ({ path: args.path, namespace: 'fixture-ui' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture-ui' }, ({ path }) => ({ loader: 'js', contents:
    path === 'product-info-hooks' ? `
      export const useMemo = fn => fn(), useEffect = () => {}, useRef = initial => ({current:initial});
      export const useState = initial => { const i=globalThis.__boundedCursor++;
        if (!(i in globalThis.__boundedState)) globalThis.__boundedState[i]=typeof initial==='function'?initial():initial;
        return [globalThis.__boundedState[i], value=>{globalThis.__boundedState[i]=typeof value==='function'?value(globalThis.__boundedState[i]):value;}]; };`
    : path.endsWith('cartStore') ? 'export const useCartStore = select => select(globalThis.__boundedCart);'
    : path.endsWith('wishlistStore') ? 'export const useWishlistStore = select => select ? select({toggleItem(){},isInWishlist:()=>false}) : {addItem(){},removeItem(){},isInWishlist:()=>false};'
    : path.endsWith('useShopifyProduct') ? 'export const useShopifyProduct = () => ({product:globalThis.__boundedBilling});'
    : path.endsWith('/button') ? `import {createElement} from 'react'; export const Button=({children,asChild,variant,size,...props})=>{if(!asChild)globalThis.__boundedButtons.push(props);return asChild?children:createElement('button',props,children);};`
    : `import {createElement} from 'react'; export const useSearchParams=()=>[new URLSearchParams(globalThis.__boundedSearch)];
       export const useNavigate=()=>path=>{globalThis.__boundedNavigation=path;};
       export const Link=({to,children,...props})=>createElement('a',{...props,href:to},children);`,
  }));
} };
const { ProductInfo } = await bundle('src/components/product/ProductInfo.tsx', [uiFixtures]);
const { default: QuickViewModal } = await bundle('src/components/ui/QuickViewModal.tsx', [uiFixtures]);
const storage = new Map();
const previousStorage = globalThis.localStorage;
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
const { useCartStore: cart } = await bundle('src/stores/cartStore.ts', [{ name: 'bounded-cart-fixtures', setup(builder) {
  builder.onResolve({ filter: /^@\/(?:lib\/shopify|hooks\/useAnalytics)$/ }, args => ({ path: args.path, namespace: 'fixture-cart' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture-cart' }, ({ path }) => ({ loader: 'js', resolveDir: root, contents: path.endsWith('shopify')
    ? `import {assertCheckoutCartPrices} from '${root}/src/lib/checkoutCartIntegrity.ts';
       export const createStorefrontCheckout=async (lines,discount,expected)=>{globalThis.__boundedCheckout.push({lines,discount,expected});
       const returned=lines.map(line=>({quantity:line.quantity,merchandise:{id:line.variantId,price:globalThis.__boundedReturnedPrice??expected[line.variantId]}}));
       assertCheckoutCartPrices(expected,returned);return 'https://shop.example/checkout';};`
    : `export const trackAddToCart=()=>{},trackRemoveFromCart=()=>{},trackBeginCheckout=()=>{},trackCheckoutHandoffSuccess=()=>{},trackViewCart=()=>{};`,
  }));
} }]);
const shopify = await bundle('src/lib/shopify.ts');

const renderPdp = product => {
  globalThis.__boundedCursor = 0; globalThis.__boundedButtons = [];
  const tree = ProductInfo({ product });
  return { tree, html: renderToStaticMarkup(tree), buttons: globalThis.__boundedButtons };
};
function nativeButtons(tree) {
  const found = [];
  const visit = node => {
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (!node || typeof node !== 'object') return;
    if (node.type === 'button') found.push(node.props);
    visit(node.props?.children);
  };
  visit(tree); return found;
}
const addButton = result => result.buttons.find(button => button.variant === undefined && button.className?.includes('h-14 text-base'))
  ?? result.buttons.find(button => button.className?.includes('h-14 text-base'));

test.beforeEach(() => {
  globalThis.__boundedState = []; globalThis.__boundedCursor = 0; globalThis.__boundedSearch = '';
  globalThis.__boundedBilling = billingProduct(); globalThis.__boundedButtons = [];
  globalThis.__boundedCart = { addItem: line => globalThis.__boundedAdded.push(line), openCart() {} };
  globalThis.__boundedAdded = []; globalThis.__boundedCheckout = []; globalThis.__boundedReturnedPrice = undefined;
  cart.setState({ items: [], checkoutUrl: null, cartId: null, checkoutError: null, isLoading: false });
});
test.after(() => { globalThis.localStorage = previousStorage; });

test('mixed native Size splits actual garment sizes from request values, preserving native identity', () => {
  const option = targetProduct().options[0];
  assert.deepEqual(getProductOptionDisplayGroups(option), [
    { name: 'Size', label: 'Size', values: ['32'], kind: 'size' },
    { name: 'Size', label: 'Tailoring request', values: ['Alteration / Custom Size'], kind: 'tailoring-request' },
  ]);
  assert.deepEqual(getActualProductSizeValues([option]), ['32']);
  const resolved = resolveAvailableVariantForOption(targetProduct().variants.edges.map(edge => edge.node), { Size: '32' }, 'Size', option.values[1]);
  assert.equal(resolved.id, TAILORING_ENQUIRY_PRODUCTS[0].customVariantId);
  assert.deepEqual(resolved.price, price);
});

test('pure construction is not native fit and is labeled construction/tailoring', () => {
  for (const values of [['Unstitched'], ['Semi-Stitched', 'Fully Stitched'], ['Fabric Only', 'Not Applicable']]) {
    const option = { name: 'Size', values };
    assert.equal(getCustomerFacingProductOptionName(option), 'Construction / tailoring');
    assert.equal(hasNativeProductSizeOption([option]), false);
    assert.deepEqual(getActualProductSizeValues([option]), []);
    assert.equal(getProductOptionDisplayGroups(option)[0].kind, 'construction');
  }
});

test('name/value classification preserves Color abbreviations and imported Stitching sizes', () => {
  assert.equal(getCustomerFacingProductOptionName({ name: 'Color', values: ['S', 'M'] }), 'Color');
  assert.equal(hasNativeProductSizeOption([{ name: 'Color', values: ['S', 'M'] }]), false);
  assert.equal(getCustomerFacingProductOptionName({ name: 'Size', values: ['Navy Blue', 'Teal'] }), 'Color');
  assert.equal(hasNativeProductSizeOption([{ name: 'Size', values: ['Navy Blue', 'Teal'] }]), false);
  const stitching = { name: 'Stitching', values: ['S', 'M'] };
  assert.equal(getCustomerFacingProductOptionName(stitching), 'Size');
  assert.equal(shouldRenderShopifyProductOption(stitching, { isStitchable: true }), true);
  assert.deepEqual(getActualProductSizeValues([stitching]), ['S', 'M']);
  assert.deepEqual(getActualProductSizeValues([{ name: 'Size', values: ['M up to L margin', 'Custom Fit'] }]), ['M up to L margin']);
});

test('exact target enquiry gate blocks custom only; original base variants and unrelated approved custom remain available', () => {
  for (const target of TAILORING_ENQUIRY_PRODUCTS) {
    assert.equal(requiresTailoringEnquiry(target.handle), true);
    assert.equal(isEnquiryOnlyVariant(target.handle, target.baseVariantId, [{ name: 'Size', value: '32' }]), false);
    assert.equal(isEnquiryOnlyVariant(undefined, target.customVariantId), true);
    assert.equal(isEnquiryOnlyVariant(target.handle, 'future-request', [{ name: 'Size', value: 'Alteration / Custom Size' }]), true);
  }
  assert.equal(isEnquiryOnlyVariant('already-approved-custom', 'other', [{ name: 'Size', value: 'Custom Fit' }]), false);
});

test('rendered target requests are separate from Size, with contact CTA and no paid service/checkbox path', { skip: 'Retired: the live catalogue no longer uses the enquiry-only path' }, () => {
  for (const target of TAILORING_ENQUIRY_PRODUCTS) {
    globalThis.__boundedState = [];
    globalThis.__boundedSearch = `variant=${encodeURIComponent(target.customVariantId)}`;
    const result = renderPdp(targetProduct(target));
    assert.match(result.html, /Tailoring request/);
    assert.match(result.html, /href="\/contact"[^>]*>Request written tailoring confirmation/);
    assert.match(result.html, /Quote required|Quote Required/);
    assert.doesNotMatch(result.html, /type="checkbox"|MeasurementRequestForm|Selected services:|\+\$17\.25/);
    assert.match(result.html, /Listed catalog size label: 32/);
    assert.doesNotMatch(result.html, /Listed catalog size label: 32, Alteration/);
    assert.equal(addButton(result).disabled, true);
  }
});

test('custom request click blocks add handler itself, even if customer measurements/acknowledgment are supplied', { skip: 'Retired: the live catalogue no longer uses the enquiry-only path' }, async () => {
  const product = targetProduct();
  let result = renderPdp(product);
  const request = nativeButtons(result.tree).find(button => button['aria-label'] === 'Alteration / Custom Size');
  request.onClick();
  result = renderPdp(product);
  assert.equal(addButton(result).disabled, true);
  await addButton(result).onClick();
  assert.deepEqual(globalThis.__boundedAdded, []);
});

test('base Size 32 hands off original garment variant, selected option, quantity and $99.97 price', async () => {
  const product = targetProduct();
  let result = renderPdp(product);
  const plus = nativeButtons(result.tree).find(button => button.disabled === false && button.className?.includes('p-3 hover:bg-secondary'));
  plus.onClick();
  result = renderPdp(product);
  assert.equal(addButton(result).disabled, false);
  await addButton(result).onClick();
  assert.equal(globalThis.__boundedAdded.length, 1);
  const line = globalThis.__boundedAdded[0];
  assert.equal(line.variantId, TAILORING_ENQUIRY_PRODUCTS[0].baseVariantId);
  assert.equal(line.quantity, 2);
  assert.deepEqual(line.selectedOptions, [{ name: 'Size', value: '32' }]);
  assert.deepEqual(line.price, price);
  assert.equal(line.customAttributes, undefined);
});

test('no-size/fabric fallback states missing finished size and invents neither dimensions nor construction', () => {
  const product = { ...targetProduct(), handle: 'yellow-art-silk-unstitched-lehenga', title: 'Yellow Art Silk Unstitched Lehenga',
    description: 'Fabric lengths not specified.', options: [{ name: 'Title', values: ['Default Title'] }] };
  product.variants = { edges: [{ node: { ...product.variants.edges[0].node, id: 'gid://shopify/ProductVariant/fixture-standard',
    title: 'Default Title', selectedOptions: [{ name: 'Title', value: 'Default Title' }] } }] };
  const { html } = renderPdp(product);
  assert.match(html, /No finished-garment size is specified/);
  assert.match(html, /Use only dimensions stated in the listing/);
  assert.match(html, /Sizing \/ measurement guidance/);
  assert.doesNotMatch(html, /View the sizing chart|Available sizing varies|>S<|>M<|>32<|Stitching Size/);
  const unknown = { ...product, title: 'Chinon Gown', handle: 'unknown-construction-gown', tags: [] };
  globalThis.__boundedState = [];
  assert.doesNotMatch(renderPdp(unknown).html, /supplied unstitched|supplied semi-stitched/);
  assert.match(NO_FINISHED_GARMENT_SIZE_NOTICE, /construction.*unclear/);
});

test('unrelated services display resolved variant price/currency and each new garment/service shares a configuration reference', async () => {
  const product = { ...targetProduct(), handle: 'approved-ready-made-suit', title: 'Approved ready-made suit' };
  product.options = [{ name: 'Size', values: ['32', '34'] }];
  product.variants = { edges: product.variants.edges.map((edge, index) => ({ node: { ...edge.node,
    id: `gid://shopify/ProductVariant/fixture-${index}`, title: index ? '34' : '32', selectedOptions: [{ name: 'Size', value: index ? '34' : '32' }],
  } })) };
  let result = renderPdp(product);
  assert.match(result.html, /\+\$17\.25/);
  const service = nativeButtons(result.tree).find(button => typeof button['aria-pressed'] === 'boolean');
  service.onClick(); result = renderPdp(product);
  assert.match(result.html, /117\.22/);
  await addButton(result).onClick();
  assert.equal(globalThis.__boundedAdded.length, 2);
  const [garment, addon] = globalThis.__boundedAdded;
  assert.deepEqual(garment.price, price); assert.deepEqual(addon.price, { amount: '17.25', currencyCode: 'USD' });
  const ref = line => line.customAttributes.find(attribute => attribute.key === 'Configuration reference').value;
  assert.ok(ref(garment)); assert.equal(ref(garment), ref(addon));
  assert.equal(addon.variantId, SHARED_TAILORING_VARIANT_ID);
  assert.equal(addon.customAttributes.find(attribute => attribute.key === 'Applies To Handle').value, product.handle);
  assert.equal(addon.quantity, garment.quantity);
  nativeButtons(renderPdp(product).tree).find(button => button['aria-label'] === '34').onClick();
  const second = renderPdp(product); await addButton(second).onClick();
  assert.notEqual(ref(globalThis.__boundedAdded[2]), ref(garment));
  assert.equal(globalThis.__boundedAdded[2].selectedOptions[0].value, '34');
  globalThis.__boundedAdded.forEach(line => cart.getState().addItem(line));
  cart.getState().updateQuantity(garment.variantId, 3, garment.customAttributes);
  assert.deepEqual(cart.getState().items.map(line => line.quantity), [3, 3, 1, 1]);
  globalThis.__boundedState = []; globalThis.__boundedBilling = billingProduct('17.25', 'INR');
  assert.doesNotMatch(renderPdp(product).html, /Optional finishing &amp; tailoring/);
});

test('cards and QuickView route target configuration to PDP, even when catalog cards contain only one base variant', () => {
  const product = targetProduct(); product.variants.edges = product.variants.edges.slice(0, 1);
  assert.equal(requiresProductPageSelection(product), true);
  assert.equal(getDirectCardVariant(product), null);
  const html = renderToStaticMarkup(createElement(QuickViewModal, { product: { node: product }, onClose() {} }));
  assert.match(html, /quick-view-choose-options/);
  assert.match(html, /href="\/product\/orange-bead-embroidered-chinon-suit-dupatta"/);
  assert.doesNotMatch(html, /quick-view-add-to-bag|quick-view-variant-/);
  const source = readFileSync(`${root}/src/components/ui/ProductCard.tsx`, 'utf8');
  assert.match(source, /requiresProductPageSelection\(product.node\)[\s\S]*?navigate\(`/);
  const plain = { ...product, handle: 'ordinary-fixed-garment', options: [{ name: 'Size', values: ['32'] }],
    variants: { edges: [{ node: { ...product.variants.edges[0].node, id: 'gid://shopify/ProductVariant/ordinary' } }] } };
  assert.equal(getDirectCardVariant(plain).id, 'gid://shopify/ProductVariant/ordinary');
});

test('stale cart custom and linked/orphan alteration services are blocked regardless of acknowledgment attributes', { skip: 'Retired: the live catalogue no longer uses the enquiry-only path' }, async () => {
  const product = targetProduct();
  const custom = lineFrom(product, product.variants.edges[1].node, 2, [
    { key: 'Measurement Confirmation', value: 'Customer acknowledged before checkout' },
    { key: 'Measurement submission', value: 'Provide after order — review required before alterations' },
  ]);
  cart.getState().addItem(custom); assert.equal(cart.getState().items.length, 0);
  cart.setState({ items: [custom], checkoutUrl: 'https://stale.example', cartId: 'stale' });
  assert.equal(await cart.getState().createCheckout(), null);
  assert.equal(globalThis.__boundedCheckout.length, 0);
  assert.equal(cart.getState().checkoutUrl, null);
  assert.match(cart.getState().checkoutError, /Enquiry only/);
  const base = lineFrom(product);
  const service = lineFrom(billingProduct(), undefined, 1, [{ key: 'Applies To', value: product.title }]);
  for (const lines of [[base, service], [service], [{ ...service, customAttributes: [{ key: 'Applies To Handle', value: product.handle }] }]]) {
    assert.equal(hasUnconfirmedTargetTailoring(lines.map(checkoutLine)), true);
    cart.setState({ items: lines, checkoutError: null });
    assert.equal(await cart.getState().createCheckout(), null);
    assert.equal(globalThis.__boundedCheckout.length, 0);
  }
  const other = { ...product, handle: 'already-approved', title: 'Already approved custom suit' };
  other.variants = { edges: [{ node: { ...product.variants.edges[1].node, id: 'gid://shopify/ProductVariant/approved' } }] };
  assert.equal(hasUnconfirmedTargetTailoring([checkoutLine(lineFrom(other))]), false);
});

test('persisted custom carts lose cached checkout URLs on rehydrate and remain blocked', { skip: 'Retired: the live catalogue no longer uses the enquiry-only path' }, async () => {
  const product = targetProduct();
  const legacyService = lineFrom(billingProduct(), undefined, 1,
    [{ key: 'Related Product Handle', value: product.handle }]);
  for (const items of [[lineFrom(product, product.variants.edges[1].node)], [legacyService]]) {
    storage.set('shopify-cart', JSON.stringify({ state: { items,
      checkoutUrl: 'https://stale.example', cartId: 'stale' }, version: 0 }));
    await cart.persist.rehydrate();
    assert.equal(cart.getState().checkoutUrl, null); assert.equal(cart.getState().cartId, null);
    assert.equal(await cart.getState().createCheckout(), null);
    assert.equal(globalThis.__boundedCheckout.length, 0);
  }
});

test('ordinary cart checkout supplies actual expected unit prices and preserves variant, quantity and options', async () => {
  const base = lineFrom(targetProduct(), undefined, 3);
  cart.getState().addItem(base);
  assert.equal(await cart.getState().createCheckout(), 'https://shop.example/checkout');
  const call = globalThis.__boundedCheckout[0];
  assert.equal(call.lines[0].variantId, base.variantId); assert.equal(call.lines[0].quantity, 3);
  assert.deepEqual(call.expected, { [base.variantId]: price });
  globalThis.__boundedReturnedPrice = { amount: '100.00', currencyCode: 'USD' };
  assert.equal(await cart.getState().createCheckout(), null);
  assert.match(cart.getState().checkoutError, /price changed/);
  assert.equal(cart.getState().items[0].quantity, 3);
  globalThis.__boundedReturnedPrice = undefined;
  const service = lineFrom(billingProduct(), undefined, 2,
    [{ key: 'Applies To Handle', value: 'approved-garment' }, { key: 'Applies To', value: 'Approved garment' }]);
  cart.setState({ items: [service] });
  assert.equal(await cart.getState().createCheckout(), 'https://shop.example/checkout');
  assert.deepEqual(globalThis.__boundedCheckout.at(-1).expected[SHARED_TAILORING_VARIANT_ID], service.price);
});

test('shared Shopify checkout API guard rejects stale target custom IDs before any network call', { skip: 'Retired: the live catalogue no longer uses the enquiry-only path' }, async () => {
  const originalFetch = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('Fixture: unexpected network call'); };
  try {
    for (const target of TAILORING_ENQUIRY_PRODUCTS) {
      await assert.rejects(shopify.createStorefrontCheckout([{ variantId: target.customVariantId, quantity: 1 }]), /Enquiry only/);
    }
    await assert.rejects(shopify.createStorefrontCheckout([{ variantId: SHARED_TAILORING_VARIANT_ID, quantity: 1,
      handle: SERVICE_ADD_ON_PRODUCT_HANDLE, customAttributes: [{ key: 'Applies To Handle', value: TAILORING_ENQUIRY_PRODUCTS[0].handle }] }]), /Enquiry only/);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('PDP, prerender and edge HTML all use the same actual-size helper and missing-size notice', () => {
  for (const file of ['src/components/product/ProductInfo.tsx', 'src/pages/ProductDetail.tsx', 'scripts/prerender.js', 'src/middleware/htmlGenerator.ts']) {
    const source = readFileSync(`${root}/${file}`, 'utf8');
    assert.match(source, /getActualProductSizeValues\(/, file);
    assert.match(source, /NO_FINISHED_GARMENT_SIZE_NOTICE/, file);
    assert.doesNotMatch(source, /View the sizing chart|Available sizing varies by product/, file);
  }
});
