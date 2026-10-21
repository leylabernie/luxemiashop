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
    b.onResolve({filter: /^@\/config\/(shippingPolicy)$/}, a => ({path: resolve('src/config', a.path.split('/').at(-1)+'.ts')}));
    b.onResolve({filter: /^(framer-motion|lucide-react|@\/)/}, a => ({path:a.path, namespace:'fixture'}));
    b.onLoad({filter:/.*/,namespace:'fixture'}, a => {
      let contents;
      if(a.path === 'framer-motion') contents=`import React from 'react'; export const AnimatePresence=React.Fragment; export const motion=new Proxy({}, { get:(_,tag)=>({children,className,role,...rest})=>React.createElement(tag,{className,role},children) });`;
      else if(a.path === 'lucide-react') contents=`export const X=()=>null,Minus=X,Plus=X,Trash2=X,Loader2=X,ArrowRight=X,ShieldCheck=X,Award=X,Truck=X;`;
      else if(a.path.includes('cartStore')) contents=`export const useCartStore=()=>globalThis.fixtureStore;`;
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
test('two $79.99 suits show the real $159.98 subtotal without fictitious discounts',()=>{
 const html=render(79.99,2);
 for(const value of ['Subtotal','$159.98','Calculated at checkout','Subtotal excludes shipping, taxes and duties.','Enter any eligible discount codes at checkout']) assert.ok(html.includes(value),value);
 assert.ok(!html.includes('$143.99'));
 assert.ok(html.includes('before checkout discounts'));
});
test('no subtotal or date resurrects the retired campaign',()=>{
 for(const amount of [0,74.99,75,159.98,200,400,1000]) {
  for(const date of ['2026-10-21T12:00:00Z','2026-11-11T00:00:00Z']) {
   const html=render(amount,1,date);
   assert.doesNotMatch(html,/festive|auto-applied|LUXE(?:10|15|20)|Estimated subtotal after discounts/i);
  }
 }
});
test('quantity changes update the actual subtotal and shipping progress',()=>{
 assert.ok(render(79.99,1).includes('$70.01 below the free U.S. shipping threshold before checkout discounts'));
 assert.ok(render(79.99,2).includes('$159.98'));
 assert.ok(render(79.99,3).includes('$239.97'));
});
test('free-shipping progress uses the $150 undiscounted boundary and qualifies the estimate',()=>{
 assert.ok(render(149.99).includes('$0.01 below'));
 assert.ok(render(150).includes('before checkout discounts'));
 assert.ok(render(150).includes('Discounts are applied before shipping eligibility.'));
});
