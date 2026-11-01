const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildSync } = require('esbuild');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const output = buildSync({entryPoints:[path.join(root,'src/components/product/ProductDeliverySummary.tsx')],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')}}).outputFiles[0].text;
const m = {exports:{}};
new Function('require','module','exports',output)(require,m,m.exports);
const render = props => renderToStaticMarkup(createElement(m.exports.ProductDeliverySummary, {hasAlterations:false,...props}, createElement('p',null,'Original detailed terms')));
test('compact initial view retains costs, origin and expandable complete terms',()=>{
 const html=render({});
 assert.match(html,/12–18 business days/);
 assert.match(html,/\$14.99 below \$150; free at \$150\+/);
 assert.match(html,/Ships from India/); assert.match(html,/No U.S. doorstep import fees; sales tax at checkout/);
 assert.match(html,/Other-country shipping rates and import charges vary/);
 assert.match(html,/<details class="group"><summary/); assert.doesNotMatch(html,/<details[^>]* open/);
 assert.match(html,/Original detailed terms/); assert.match(html,/Dates are not guaranteed/);
});
test('selected processing adds three days once and preserves long-dispatch exceptions',()=>{
 assert.match(render({hasAlterations:true}),/15–21 business days after complete measurements/);
 assert.match(render({shipsWithinDays:6}),/15–20 business days/);
 assert.match(render({shipsWithinDays:6,hasAlterations:true}),/18–23 business days/);
 assert.match(render({shipsWithinDays:1}),/10–15 business days/);
 assert.match(render({shipsWithinDays:0}),/12–18 business days/);
 assert.match(render({hasAlterations:true}),/once for alterations \/ finishing, not per service/);
});
test('availability and construction warnings remain visible outside collapsed details',()=>{
 const html=render({confirmAvailability:true,isUnstitched:true});
 const before=html.split('<details')[0];
 assert.match(before,/Confirm the selected size/); assert.match(before,/not finished garments/);
});
test('purchase selectors and handlers remain separate from shipping details',()=>{
 const source=fs.readFileSync(path.join(root,'src/components/product/ProductInfo.tsx'),'utf8');
 const end=source.indexOf('</ProductDeliverySummary>');
 assert(end>source.indexOf('<DeliveryEstimate'));
 assert(end<source.indexOf('{/* ─── Utsav-style'));
 assert(source.includes('onClick={handleAddToCart}'));
});
