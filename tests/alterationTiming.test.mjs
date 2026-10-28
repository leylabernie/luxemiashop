import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { selectedServicesRequireProcessing, serviceAddOnTotal, getEligibleServiceAddOns, mayRequireAlterationProcessing } from '../src/lib/serviceAddOns.ts';
import timing from '../src/config/shippingTiming.cjs';
const require = createRequire(import.meta.url);
const {outputFiles} = buildSync({entryPoints:[fileURLToPath(new URL('../src/components/product/DeliveryEstimate.tsx',import.meta.url))],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':fileURLToPath(new URL('../src',import.meta.url))}});
const m={exports:{}};new Function('require','module','exports',outputFiles[0].text)(require,m,m.exports);
const render = codes => renderToStaticMarkup(createElement(m.exports.DeliveryEstimate,{hasStitching:false,hasSelectedAlterations:selectedServicesRequireProcessing(codes)}));
for(const codes of [[],['matching-petticoat']]) test(`base delivery for ${codes.join('+') || 'no service'}`,()=>{
 assert.equal(selectedServicesRequireProcessing(codes),false);
 assert.match(render(codes),/12–18 business days total/);
 assert.doesNotMatch(render(codes),/15–21 business days total/);
});
for(const codes of [['garment-alteration'],['blouse-stitching'],['pico-fall'],['blouse-stitching','pico-fall','matching-petticoat']]) test(`one processing allowance for ${codes.join('+')}`,()=>{
 assert.equal(selectedServicesRequireProcessing(codes),true);
 const html=render(codes);assert.match(html,/add 3 business days once, not per service/);assert.match(html,/15–21 business days total/);
 assert.doesNotMatch(html,/12–18 business days total|Tailored to order|Made to Order|4–5 weeks/);
 assert.match(html,/after complete measurements and service details are confirmed/);
});
test('three optional saree fees remain $26; fabricated construction is not introduced',()=>{
 assert.equal(serviceAddOnTotal(['blouse-stitching','pico-fall','matching-petticoat']),26);
 const woven={title:'Woven Saree with Embroidered Blouse Fabric',productType:'Saree',description:'Includes unstitched blouse fabric; stitched blouse shown for styling only.'};
 assert.deepEqual(getEligibleServiceAddOns(woven),['blouse-stitching','pico-fall','matching-petticoat']);
 const sage={title:'Sage Ready to Wear Saree',productType:'Saree',description:'Includes a stitched blouse.'};
 assert.deepEqual(getEligibleServiceAddOns(sage),['garment-alteration','pico-fall','matching-petticoat']);
 assert.equal(mayRequireAlterationProcessing(woven),true);assert.equal(mayRequireAlterationProcessing(sage),true);
});
test('public processing terms retain carrier window, exclude unverified speed and avoid stacking',()=>{
 assert.match(timing.SHIPPING_TIMING_NOTICE,/3–4 business days/);assert.match(timing.SHIPPING_TIMING_NOTICE,/9–14 business days after dispatch/);
 assert.doesNotMatch(timing.SHIPPING_TIMING_NOTICE,/4–6 business days|made.to.order|production/i);
 assert.match(timing.productShippingTimingNotice(6),/Ships within 6 business days/);
});
test('PDP service and native fitting state drive both shipping panel and spec; no selected price changes',()=>{
 const source=readFileSync(new URL('../src/components/product/ProductInfo.tsx',import.meta.url),'utf8');
 assert.match(source,/selectedServicesRequireProcessing\(selectedAvailableServiceAddOnCodes\)/);
 assert.match(source,/hasSelectedAlterations=\{hasSelectedAlterations\}/);
 assert.match(source,/hasSelectedAlterations\s*\? alterationShippingTimingNotice\(shipsWithinDays\)/);
 assert.match(source,/baseAmount \+ selectedServiceAddOnCharge/);
});

test('hydrated product-specific dispatch survives confirmation and fabric-only branches',()=>{
 for(const extra of [{isUnstitched:true},{confirmAvailability:true},{}]) {
  const html=renderToStaticMarkup(createElement(m.exports.DeliveryEstimate,{hasStitching:false,shipsWithinDays:6,...extra}));
  assert.match(html,/6 business days/);assert.doesNotMatch(html,/12–18 business days total|3–4 business days/);
 }
 const info=readFileSync(new URL('../src/components/product/ProductInfo.tsx',import.meta.url),'utf8');
 const detail=readFileSync(new URL('../src/pages/ProductDetail.tsx',import.meta.url),'utf8');
 assert.match(info,/productShippingTimingNotice\(shipsWithinDays\)/);
 assert.match(detail,/productShippingTimingNotice\(productShipsWithinDays\)/);
});

for (const flag of ['hasSelectedAlterations', 'requiresTailoringTimingConfirmation', 'isMadeToOrder']) test(`explicit dispatch survives ${flag}`, () => {
 const html=renderToStaticMarkup(createElement(m.exports.DeliveryEstimate,{hasStitching:false,shipsWithinDays:6,[flag]:true}));
 assert.match(html,/9 business days before dispatch/); assert.match(html,/18–23 business days total/);
 assert.doesNotMatch(html,/15–21 business days total|6–7 business days/);
});
