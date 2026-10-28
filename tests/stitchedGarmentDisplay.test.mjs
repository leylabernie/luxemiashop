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

test('supplied stitched-blouse saree renders alteration not fabric-only stitching and keeps native sizes/prices', () => {
  const sage = {
    ...garment, title: 'Sage Green Ready to Wear Jacquard Silk Saree', productType: 'Saree',
    handle: 'sage-green-ready-to-wear-jacquard-silk-saree',
    description: 'Ready-to-wear saree with stitched blouse with built-in cups.', tags: [],
    options: [{ name: 'Size', values: ['34', '36', '38', '40', '42', '44'] }],
    variants: { edges: ['34', '36', '38', '40', '42', '44'].map(size => ({ node: {
      ...garment.variants.edges[0].node, id: 'sage-' + size, title: size,
      price: { amount: '55.99', currencyCode: 'USD' },
      selectedOptions: [{ name: 'Size', value: size }],
    } })) },
  };
  setState([]); globalThis.__displaySearch = '';
  const html = renderProduct(sage);
  assert.match(html, /Garment Alteration/);
  assert.match(html, /confirms the alteration scope and timing/);
  assert.doesNotMatch(html, /Available only where this listing includes blouse fabric/);
  assert.match(html, /55\.99/);
  assert.match(html, /\+\$10\.00/);
  const line = { ...garmentLine, product: { node: sage } };
  const alteration = { ...service, serviceAddOnCode: 'garment-alteration', customAttributes: [{ key: 'Applies To', value: sage.title }] };
  const cartHtml = renderCart([line, alteration]);
  assert.match(cartHtml, /Garment Alteration/);
  assert.equal(isGarmentAlterationCartLine(alteration, [line, alteration]), true);
  assert.equal(alteration.variantId, 'shared-billing-10');
  assert.equal(SERVICE_ADD_ONS['garment-alteration'].checkoutOptionValue, SERVICE_ADD_ONS['blouse-stitching'].checkoutOptionValue);
});

test('existing blouse-stitching cart lines merge with corrected alteration without duplicate billing', () => {
  const parent = { ...garmentLine, product: { node: {
    ...garment, title: 'Sage Green Ready to Wear Jacquard Silk Saree', productType: 'Saree',
    description: 'Ready-to-wear saree with stitched blouse with built-in cups.',
  } } };
  const legacy = { ...service, serviceAddOnCode: 'blouse-stitching', customAttributes: [{ key: 'Applies To', value: parent.product.node.title }] };
  const corrected = { ...legacy, serviceAddOnCode: 'garment-alteration' };
  for (const lines of [[legacy, corrected], [corrected, legacy]]) {
    cartStore.setState({ items: [] });
    for (const line of lines) {
      cartStore.getState().addItem(parent);
      cartStore.getState().addItem(line);
    }
    assert.equal(cartStore.getState().items.length, 2);
    cartStore.getState().updateQuantity(parent.variantId, 3, parent.customAttributes);
    const billable = cartStore.getState().items.filter(item => item.variantId === service.variantId);
    assert.equal(billable.length, 1);
    assert.equal(billable[0].quantity, 3);
    assert.equal(Number(billable[0].price.amount) * billable[0].quantity, 30);
  }
  const source = readFileSync(new URL('../src/components/product/ProductInfo.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /isBanarasiSareeServiceProduct\(product\)\s*\|\|\s*code === 'garment-alteration'/);
});

test('catalog kids Age variants remain the only fit selector, without invented adult S–XXL choices', () => {
  setState([]);
  // Exact public option/category/tag evidence from kids-onam-set-maroon; commerce IDs/prices below are synthetic.
  const ages = ['1Y', '2-3Y', '4-5Y', '6-12M', '6-7Y'];
  const kids = {
    ...garment, id:'fixture-kids',handle:'kids-onam-set-maroon',
    title:'Maroon Onam Kids Shirt Mundu Set with Maggam Work, Festive Kids Outfit',
    productType:'Kids Boy Set', description:'Shirt + Mundu',
    tags:['kids boy set','maroon toddler kurta'], options:[{name:'Age',values:ages}],
    variants:{edges:ages.map(age=>({node:{id:'fixture-age-'+age,title:age,availableForSale:true,price:{amount:'50',currencyCode:'USD'},selectedOptions:[{name:'Age',value:age}]}}))},
  };
  const html=renderProduct(kids);
  assert.match(html,/Age/);
  for(const age of ages) assert(html.includes(age),age);
  assert.doesNotMatch(html,/>Select Size<|>S<|>M<|>L<|>XL<|>XXL<|>Size Chart<|>Stitching Size</);
});

test('catalog designer net saree uses after-order handoff, not invented sizes, for measurement-based variants', () => {
  setState([]);
  // Exact catalog options; fixture IDs and prices test billing preservation, not live availability.
  const blouses = ['Unstitched Blouse Fabric', 'Made to Measure Blouse (+$10)'];
  const alterations = ['Standard Fit', 'Made to Fit (+$10)'];
  const saree = {
    ...garment, id:'fixture-designer',handle:'designer-embroidered-net-saree',
    title:'Designer Hand-Embroidered Net Saree with Bead and Pearl Work', productType:'Saree',tags:[],
    description:'Embroidered net saree with matching blouse pieces. Choose the Made to Fit option for measurement-based tailoring. Submit your measurements after placing your order.',
    options:[{name:'Blouse',values:blouses},{name:'Alteration',values:alterations}],
    variants:{edges:blouses.flatMap((blouse,b)=>alterations.map((alteration,a)=>({node:{id:`fixture-designer-${b}-${a}`,title:`${blouse} / ${alteration}`,availableForSale:true,price:{amount:String(100+b*10+a*10),currencyCode:'USD'},selectedOptions:[{name:'Blouse',value:blouse},{name:'Alteration',value:alteration}]}})))},
  };
  for (const {node} of saree.variants.edges) {
    globalThis.__displaySearch = `variant=${node.id}`;
    const html=renderProduct(saree);
    const needsHandoff=node.selectedOptions.some(o=>/Made to/.test(o.value));
    assert.equal(html.includes('Measurement handoff'),needsHandoff,node.title);
    if(needsHandoff) {
      assert.match(html,/type="checkbox"/);
      assert.match(html,/provide measurements after ordering, before tailoring begins/);
    }
    assert.doesNotMatch(html,/>28&quot;<|>30&quot;<|>S<|>M<|>L<|Bust size in inches|Stitching Size|Select Neckline|Round Neck|Sleeve Style/);
  }
  globalThis.__displaySearch='';
});

 test('native Made to Fit choices do not newly offer handoff, neckline or bottom redesign', () => {
  // Exact public catalog options and classification; synthetic commerce matrix.
  const rows = [{"handle": "art-silk-embroidered-suit-set", "title": "Rust Orange Art Silk Embroidered 3-Piece Suit Set", "productType": "Salwar Suit", "tags": ["3 Piece Suit Set", "Art Silk Salwar Suit", "Art Silk Suit", "copy:reviewed-2026-10-09", "Embroidered Art Silk Suit", "festive celebrations", "Indian Festive Wear", "Party Wear Suit", "rust orange art silk embroidered 3-piece suit set", "salwar suit", "Wedding Guest Suit"], "options": [{"name": "Size", "values": ["32", "34", "36", "38", "40"]}, {"name": "Alteration", "values": ["Standard Fit", "Made to Fit (+$10)"]}]}, {"handle": "floral-printed-organza-lehenga-choli-white-peach", "title": "White and Peach Floral Printed Organza Lehenga Choli", "productType": "Lehenga Choli", "tags": ["copy:reviewed-2026-10-09", "festive celebrations", "floral lehenga", "lehenga choli", "organza lehenga", "sequin lehenga", "white and peach floral printed organza lehenga choli", "white and peach lehenga", "zari work"], "options": [{"name": "Size", "values": ["32", "34", "36", "38", "40"]}, {"name": "Alteration", "values": ["Standard Fit", "Made to Fit (+$10)"]}]}];
  setState([]);
  for(const row of rows) {
    const nativeOptions=row.options.map(o=>({name:o.name,value:o.name==='Alteration'?'Made to Fit (+$10)':o.values[0]}));
    const standardOptions=nativeOptions.map(o=>o.name==='Alteration'?{...o,value:'Standard Fit'}:o);
    const product={...garment,...row,id:'fixture-native-'+row.handle,description:'Listed garment.',variants:{edges:[nativeOptions,standardOptions].map((selectedOptions,i)=>({node:{id:'fixture-native-'+row.handle+'-'+i,title:String(i),price:{amount:String(100-i*10),currencyCode:'USD'},availableForSale:true,selectedOptions}}))}};
    globalThis.__displaySearch='variant='+product.variants.edges[0].node.id;
    const html=renderProduct(product);
    assert.doesNotMatch(html,/Measurement handoff|Blouse Neckline|Bottom Style|Round Neck|Stitching Size/);
  }
  globalThis.__displaySearch='';
});
