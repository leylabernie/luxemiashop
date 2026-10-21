const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { build } = require('esbuild');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('all public offer surfaces use FIRST10 and the newsletter backend matches', () => {
  assert.match(read('src/config/welcomeOffer.ts'), /code: 'FIRST10'/);
  assert.match(read('src/config/welcomeOffer.ts'), /discountPercent: 10/);
  for (const file of ['src/components/layout/Header.tsx', 'src/components/layout/Footer.tsx', 'src/components/home/NewVisitorPopup.tsx']) {
    assert.match(read(file), /WELCOME_OFFER/);
  }
  assert.match(read('supabase/functions/submit-email/index.ts'), /ACTIVE_WELCOME_DISCOUNT_CODE = "FIRST10"/);
  for (const file of ['src/components/layout/Header.tsx', 'src/components/layout/Footer.tsx', 'src/components/cart/CartDrawer.tsx', 'src/components/product/ProductInfo.tsx', 'src/stores/cartStore.ts', 'src/lib/shopify.ts', 'supabase/functions/submit-email/index.ts']) {
    assert.doesNotMatch(read(file), /LUXE(?:10|15|20)|auto-applied|festiveCampaign|rakshaBandhanCampaign/);
  }
});

test('real cart checkout never injects an assumed discount, including repeated checkout and services', async () => {
  const built = await build({
    entryPoints: [path.join(root, 'src/stores/cartStore.ts')],
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
    alias: { '@': path.join(root, 'src') },
    plugins: [{ name: 'no-network-checkout', setup(b) {
      b.onResolve({filter: /^@\/(?:lib\/shopify|hooks\/useAnalytics)$/}, a => ({path:a.path, namespace:'fixture'}));
      b.onLoad({filter:/.*/,namespace:'fixture'}, a => ({contents: a.path.endsWith('shopify')
        ? 'export const createStorefrontCheckout = async (...args) => { globalThis.checkoutCalls.push(args); return "https://shop.example/checkout"; };'
        : 'export const trackAddToCart = () => {}; export const trackBeginCheckout = () => {}; export const trackCheckoutHandoffSuccess = () => {}; export const trackRemoveFromCart = () => {}; export const trackViewCart = () => {};', loader:'js'}));
    }}],
  });
  const originalStorage = globalThis.localStorage;
  const savedCalls = globalThis.checkoutCalls;
  const storage = new Map();
  globalThis.localStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
  globalThis.checkoutCalls = [];
  try {
    const m = {exports:{}};
    new Function('require','module','exports',built.outputFiles[0].text)(require,m,m.exports);
    const store = m.exports.useCartStore;
    for (const amount of [74.99,75,159.98,200,400,1000]) {
      const garment = {variantId:'gid://shopify/ProductVariant/1',quantity:2,variantTitle:'M',price:{amount:String(amount),currencyCode:'USD'},selectedOptions:[],customAttributes:[{key:'Fit',value:'M'}],product:{node:{handle:'test-suit',title:'Test suit'}}};
      const service = {...garment,variantId:'gid://shopify/ProductVariant/2',quantity:1,price:{amount:'20',currencyCode:'USD'},product:{node:{handle:'luxemia-tailoring-saree-finishing-add-ons',title:'Tailoring'}},customAttributes:[{key:'Applies To',value:'Test suit'}]};
      store.setState({items:[garment,service]});
      for (let attempt=0;attempt<2;attempt++) {
        assert.equal(await store.getState().createCheckout(),'https://shop.example/checkout');
        const args = globalThis.checkoutCalls.at(-1);
        assert.equal(args.length,1,'Checkout receives lines only, without guessed code');
        assert.deepEqual(args[0], [garment,service].map(item=>({variantId:item.variantId,quantity:item.quantity,handle:item.product.node.handle,customAttributes:item.customAttributes})));
        assert.equal(store.getState().isLoading,false);
        assert.equal(store.getState().items.length,2);
      }
    }
  } finally {
    globalThis.localStorage = originalStorage;
    globalThis.checkoutCalls = savedCalls;
  }
});
