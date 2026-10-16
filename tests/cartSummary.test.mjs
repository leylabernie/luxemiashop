import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(import.meta.url);
const result = await build({
  entryPoints: [resolve('src/components/cart/CartDrawer.tsx')], bundle: true, write: false,
  platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime'],
  plugins: [{ name: 'isolated-ui-fixtures', setup(b) {
    b.onResolve({filter: /^@\/config\/(festiveCampaign|shippingPolicy)$/}, a => ({path: resolve('src/config', a.path.split('/').at(-1)+'.ts')}));
    b.onResolve({filter: /^(framer-motion|lucide-react|@\/)/}, a => ({path:a.path, namespace:'fixture'}));
    b.onLoad({filter:/.*/,namespace:'fixture'}, a => {
      let contents;
      if(a.path === 'framer-motion') contents=`import React from 'react'; export const AnimatePresence=React.Fragment; export const motion=new Proxy({}, { get:(_,tag)=>({children,className,role,...rest})=>React.createElement(tag,{className,role},children) });`;
      else if(a.path === 'lucide-react') contents=`export const X=()=>null,Minus=X,Plus=X,Trash2=X,Loader2=X,ArrowRight=X,ShieldCheck=X,Award=X,Truck=X;`;
      else if(a.path.includes('cartStore')) contents=`export const useCartStore=()=>globalThis.fixtureStore;`;
      else if(a.path.includes('rakshaBandhanCampaign')) contents=`export const isRakshaBandhanCampaignActive=()=>false; export const RAKSHA_BANDHAN_CAMPAIGN={minimumSubtotal:150};`;
      else if(a.path.includes('serviceAddOns')) contents=`export const isGarmentAlterationCartLine=()=>false; export const isHiddenBillingProductHandle=()=>false;`;
      else if(a.path.includes('imageUtils')) contents=`export const getOptimizedImage=x=>x;`;
      else if(a.path.includes('/button')) contents=`import React from 'react'; export const Button=({children})=>React.createElement('button',null,children);`;
      else contents=`export default ()=>null;`;
      return {contents, loader:'js'};
    });
  }}]
});
const m = {exports:{}};
new Function('require','module','exports',result.outputFiles[0].text)(require,m,m.exports);
const CartDrawer=m.exports.default;
function render(amount, quantity=1, date='2026-10-16T12:00:00Z') {
 const original=Date.now; Date.now=()=>Date.parse(date);
 globalThis.fixtureStore={items:[{variantId:'v',variantTitle:'M',selectedOptions:[],quantity,price:{amount:String(amount),currencyCode:'USD'},product:{node:{handle:'test-suit',title:'Test suit',images:{edges:[]},variants:{edges:[]}}}}],isLoading:false,checkoutError:null};
 try{return renderToStaticMarkup(React.createElement(CartDrawer,{isOpen:true,onClose:()=>{}}));}finally{Date.now=original;}
}
test('two $79.99 suits itemize current cents estimate, not a shipping-inclusive total',()=>{
 const html=render(79.99,2);
 for(const value of ['Subtotal','$159.98','Estimated festive discount (10%)','−$15.99','Estimated subtotal after discounts','$143.99','$6.01 below','Calculated at checkout','Estimates exclude shipping, taxes and duties.']) assert.ok(html.includes(value),value);
 assert.ok(!html.includes('$158.98'));
 assert.ok(!html.includes('qualifies for free U.S. standard shipping'));
});
test('below minimum and expired campaign do not show a festive discount',()=>{
 for(const html of [render(74.99),render(159.98,1,'2026-11-11T00:00:00Z')]) assert.ok(!html.includes('Estimated festive discount'));
 assert.ok(render(74.99).includes('$75.01 below'));
 assert.ok(render(159.98,1,'2026-11-11T00:00:00Z').includes('qualifies for free U.S. standard shipping'));
});
test('campaign tiers retain 10%, 15%, 20% and estimates',()=>{
 for(const [amount,percent,discount,net] of [[75,10,'7.50','67.50'],[200,15,'30.00','170.00'],[400,20,'80.00','320.00']]) {
 const html=render(amount); for(const value of [`Estimated festive discount (${percent}%)`,`−$${discount}`,`$${net}`])assert.ok(html.includes(value),value);
 }
});
test('quantity changes update amount and free-shipping progress',()=>{
 assert.ok(render(79.99,1).includes('$72.00'));
 assert.ok(render(79.99,2).includes('$143.99'));
 const three=render(79.99,3); assert.ok(three.includes('$203.98')); assert.ok(three.includes('qualifies for free U.S. standard shipping'));
});
test('current cents estimate crosses free-shipping boundary at 166.66',()=>{
 assert.ok(render(166.65).includes('$0.01 below'));
 assert.ok(render(166.66).includes('qualifies for free U.S. standard shipping'));
});
