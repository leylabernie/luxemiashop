import { emptyMeasurementDraft, measurementError, measurementAttributes } from '../src/lib/measurementRequest.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { buildSync } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { selectedServicesRequireProcessing, isHiddenBillingProductHandle, serviceAddOnTotal, getEligibleServiceAddOns, mayRequireAlterationProcessing } from '../src/lib/serviceAddOns.ts';
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

test('actual PDP handler keeps optional timing on removable processing-service lines', async () => {
  const source = readFileSync(new URL('../src/components/product/ProductInfo.tsx', import.meta.url), 'utf8');
  const start = source.indexOf('const handleAddToCart = async () => {');
  const end = source.indexOf('\n  const formatPrice', start);
  assert(start >= 0 && end > start);
  // Compile the actual handler, not a reimplementation of its payload conditions.
  const { outputFiles } = buildSync({stdin:{contents:source.slice(start,end)+'\nexport default handleAddToCart;',loader:'ts'},write:false,platform:'node',format:'cjs'});
  const product = {id:'gid://shopify/Product/9095363264683',handle:'green-embroidered-anarkali-suit-chinon-fabric-pink-dupatta',title:'Green Embroidered Anarkali Suit, Chinon Fabric, Pink Dupatta',productType:'Anarkali'};
  const variant = {id:'gid://shopify/ProductVariant/48210759155883',title:'S',price:{amount:'103.00',currencyCode:'USD'},selectedOptions:[{name:'Size',value:'S'}]};
  const serviceVariant={id:'gid://shopify/ProductVariant/fixture-service',title:'Garment Alteration',price:{amount:'10.00',currencyCode:'USD'},selectedOptions:[]};
  for (const [codes,days,native,madeToOrder=false] of [[['garment-alteration'],null,false],[['garment-alteration','pico-fall'],null,false],[['garment-alteration'],6,false],[[],null,false],[['matching-petticoat'],null,false],[['garment-alteration'],null,true],[['garment-alteration'],null,false,true]]) {
    const added=[];
    const scope={
      measurementEligible:false,measurementDraft:emptyMeasurementDraft(),measurementNow:false,nativeMeasurementRequest:false,measurementServiceCodes:[],measurementError,measurementAttributes,setMeasurementValidation:()=>{},
      purchasableVariant:{node:variant}, product,
      selectedAvailableServiceAddOnCodes:codes,
      isBlouseServiceSelectionConfirmed:()=>true, blouseServiceConfirmed:false,
      customizableProduct:null, requestedCustomColor:'', isCustomSizeSelected:false,customSizeConfirmed:true,
      isStitchable:false, selectedStitchingType:null, needsStitchingSize:false, productHasNativeSizes:true,
      stitchingSize:null,isMenswear:false,metaToken:null,metaRequestedLine:null,metaContentId:null,
      setIsAdding:()=>{},addItem:item=>added.push(item),blouseServiceConfirmationAttributes:()=>[],
      isBanarasiSareeServiceProduct:()=>false, requiresNativeTimingConfirmation:native,
      selectedServicesRequireProcessing, alterationShippingTimingNotice:timing.alterationShippingTimingNotice,
      shipsWithinDays:days,madeToOrderProduct:madeToOrder,showNeckline:false,showBottomStyleOption:false,
      showSleeveStyle:false,hasNativeFullStitching:false,customAlteration:'',quantity:1,
      serviceAddOnProduct:{handle:'luxemia-tailoring-saree-finishing-add-ons',title:'Services'},
      serviceVariants:new Map(codes.map(code=>[code,{...serviceVariant,id:serviceVariant.id+code}])),
      setTimeout:fn=>fn(),openCart:()=>{},toast:{error:message=>assert.fail(message)},
    };
    const mod={exports:{}};
    new Function('module','exports',...Object.keys(scope),outputFiles[0].text)(mod,mod.exports,...Object.values(scope));
    await mod.exports.default();
    assert.equal(added[0].variantId,variant.id);
    assert.deepEqual(added[0].selectedOptions,[{name:'Size',value:'S'}]);
    assert.equal(added[0].price.amount,'103.00');
    const attrs=added[0].customAttributes ?? [];
    const notices=attrs.filter(a=>/^Timing /.test(a.key));
    if (native || madeToOrder) {
      assert.equal(notices.length,1);
      assert.match(notices[0].value,/add 3 business days once/);
      assert.match(notices[0].value,days===6?/18–23 business days total/:/15–21 business days total/);
    } else assert.equal(notices.length,0);
    assert.equal(added.length,1+codes.length);
    for (const line of added.slice(1)) {
      assert.deepEqual(line.customAttributes[0],{key:'Applies To',value:product.title});
      const serviceNotices=line.customAttributes.filter(a=>a.key==='Timing Estimate');
      assert.equal(serviceNotices.length,selectedServicesRequireProcessing([line.serviceAddOnCode])?1:0);
      if(serviceNotices.length) {
        assert.match(serviceNotices[0].value,/add 3 business days once, not per service/);
        assert.match(serviceNotices[0].value,days===6?/18–23 business days total/:/15–21 business days total/);
      }
    }
    // Exercise the real store removal method against the actual handler payload.
    // No checkout, storage or network writes are needed to test the transition.
    const storeSource=readFileSync(new URL('../src/stores/cartStore.ts',import.meta.url),'utf8');
    const methodStart=storeSource.indexOf('removeItem: (variantId, customAttributes) => {');
    const methodEnd=storeSource.indexOf('\n\n      clearCart:',methodStart);
    const method=storeSource.slice(methodStart,methodEnd).trim().replace(/,$/,'');
    const dependencyHelpers=storeSource.slice(storeSource.indexOf('const appliesToProductTitle'),storeSource.indexOf('const toAnalyticsItem'));
    const compiled=buildSync({stdin:{contents:dependencyHelpers+'\nexport default ({'+method+'});',loader:'ts'},write:false,platform:'node',format:'cjs'}).outputFiles[0].text;
    let state={items:added};
    const rm={exports:{}};
    new Function('module','exports','get','set','sameAttributes','getProductShipsWithin','isHiddenBillingProductHandle','trackRemoveFromCart','toAnalyticsItem',compiled)(
      rm,rm.exports,()=>state,update=>{state={...state,...update}},
      (a,b)=>JSON.stringify(a||[])===JSON.stringify(b||[]),()=>days,
      isHiddenBillingProductHandle,
      ()=>{},item=>item,
    );
    for(const service of added.slice(1)) {
      rm.exports.default.removeItem(service.variantId,service.customAttributes);
      assert(state.items.includes(added[0]),'standalone service removal preserves garment');
      const remainingProcessing=state.items.filter(item=>item.serviceAddOnCode && selectedServicesRequireProcessing([item.serviceAddOnCode]));
      const remainingNotices=state.items.flatMap(item=>(item.customAttributes||[]).filter(a=>/^Timing /.test(a.key)));
      assert.equal(remainingNotices.length,remainingProcessing.length+(native || madeToOrder?1:0));
    }
    assert.deepEqual(state.items,[added[0]]);
    assert.equal((state.items[0].customAttributes||[]).filter(a=>/^Timing /.test(a.key)).length,native || madeToOrder?1:0);
  }
});

test('designer native tailoring matrix requires handoff without inventing sizes, variants or fees', async () => {
  const {selectionRequiresSeparateMeasurements,resolveAvailableVariantForOption,selectedOptionsFromVariant}=await import('../src/lib/productPurchaseFlow.ts');
  const {hasNativeProductSizeOption,isProductSizeOptionName}=await import('../src/lib/productOptionNames.ts');
  const {requiresNativeStitchingTimingConfirmation}=await import('../src/lib/serviceAddOns.ts');
  const source=readFileSync(new URL('../src/components/product/ProductInfo.tsx',import.meta.url),'utf8');
  const handler=source.slice(source.indexOf('const handleAddToCart = async () => {'),source.indexOf('\n  const formatPrice',source.indexOf('const handleAddToCart = async () => {')));
  const compiled=buildSync({stdin:{contents:handler+'\nexport default handleAddToCart;',loader:'ts'},write:false,platform:'node',format:'cjs'}).outputFiles[0].text;
  // Exact catalog option labels; commerce IDs, price amounts and matrix availability are synthetic.
  const options=[{name:'Blouse',values:['Unstitched Blouse Fabric','Made to Measure Blouse (+$10)']},{name:'Alteration',values:['Standard Fit','Made to Fit (+$10)']}];
  const variants=options[0].values.flatMap((stitching,i)=>options[1].values.map((alteration,j)=>({id:`fixture-designer-${i}-${j}`,availableForSale:true,title:`${stitching} / ${alteration}`,price:{amount:String(100+10*i+10*j),currencyCode:'USD'},selectedOptions:[{name:'Blouse',value:stitching},{name:'Alteration',value:alteration}]})));
  const product={id:'fixture-designer',handle:'designer-embroidered-net-saree',title:'Designer Hand-Embroidered Net Saree with Bead and Pearl Work',productType:'Saree',tags:[],options,variants:{edges:variants.map(node=>({node}))}};
  assert.equal(hasNativeProductSizeOption(options),false);
  const sentinel='I will provide measurements after ordering, before tailoring begins.';
  const needsSource=source.slice(source.indexOf('const needsStitchingSize = useMemo'),source.indexOf('\n\n  // Whether blouse neckline',source.indexOf('const needsStitchingSize = useMemo')));
  const needsCompiled=buildSync({stdin:{contents:needsSource+'\nexport default needsStitchingSize;',loader:'ts'},write:false,platform:'node',format:'cjs'}).outputFiles[0].text;
  for(const variant of variants) {
    const selectedOptions=selectedOptionsFromVariant(variant);
    const needsMod={exports:{}};
    const needsScope={useMemo:fn=>fn(),productHasNativeSizes:false,hasNativeFullStitching:false,isReadyMadeOnly:false,isStitchable:false,selectedStitchingType:null,product,selectedOptions,selectionRequiresSeparateMeasurements};
    new Function('module','exports',...Object.keys(needsScope),needsCompiled)(needsMod,needsMod.exports,...Object.values(needsScope));
    const needs=needsMod.exports.default;
    assert.equal(needs,variant.id!=='fixture-designer-0-0');
    const nativeMod={exports:{}};
    const nativeScope={...needsScope,productHasNativeSizes:true};
    new Function('module','exports',...Object.keys(nativeScope),needsCompiled)(nativeMod,nativeMod.exports,...Object.values(nativeScope));
    assert.equal(nativeMod.exports.default,Object.entries(selectedOptions).some(([name,value])=>selectionRequiresSeparateMeasurements(name,value)),'native-fit path retains preexisting tailoring predicate');
    for(const confirmed of [false,true]) {
      const added=[],errors=[];
      const scope={measurementEligible:false,measurementDraft:emptyMeasurementDraft(),measurementNow:false,nativeMeasurementRequest:false,measurementServiceCodes:[],measurementError,measurementAttributes,setMeasurementValidation:()=>{},purchasableVariant:{node:variant},product,selectedAvailableServiceAddOnCodes:[],isBlouseServiceSelectionConfirmed:()=>true,blouseServiceConfirmed:false,customizableProduct:null,requestedCustomColor:'',isCustomSizeSelected:false,customSizeConfirmed:true,isStitchable:false,selectedStitchingType:null,needsStitchingSize:needs,productHasNativeSizes:false,stitchingSize:confirmed?sentinel:null,isMenswear:false,metaToken:null,metaRequestedLine:null,metaContentId:null,setShowSizeValidation:()=>{},setIsAdding:()=>{},addItem:item=>added.push(item),blouseServiceConfirmationAttributes:()=>[],isBanarasiSareeServiceProduct:()=>false,requiresNativeTimingConfirmation:requiresNativeStitchingTimingConfirmation(product,variant.selectedOptions),selectedServicesRequireProcessing,alterationShippingTimingNotice:timing.alterationShippingTimingNotice,shipsWithinDays:null,madeToOrderProduct:false,showNeckline:false,showBottomStyleOption:false,showSleeveStyle:false,hasNativeFullStitching:false,customAlteration:'',quantity:1,serviceAddOnProduct:null,setTimeout:fn=>fn(),openCart:()=>{},toast:{error:message=>errors.push(message)}};
      const mod={exports:{}};new Function('module','exports',...Object.keys(scope),compiled)(mod,mod.exports,...Object.values(scope));await mod.exports.default();
      if(needs&&!confirmed){assert.equal(added.length,0);assert.deepEqual(errors,['Please confirm the measurement handoff']);continue;}
      assert.equal(errors.length,0);assert.equal(added.length,1,'native price already includes selected options; no service line');
      assert.equal(added[0].variantId,variant.id);assert.deepEqual(added[0].price,variant.price);assert.deepEqual(added[0].selectedOptions,variant.selectedOptions);
      const attrs=added[0].customAttributes??[];assert(!attrs.some(a=>a.key==='Stitching Size'));
      assert.deepEqual(attrs.filter(a=>a.key==='Measurement Handoff'),needs?[{key:'Measurement Handoff',value:sentinel}]:[]);
      const notices=attrs.filter(a=>a.key==='Timing Confirmation');assert.equal(notices.length,needs?1:0);
      if(notices.length)assert.match(notices[0].value,/add 3 business days once.*15–21 business days total/);
    }
  }
  const selection=source.slice(source.indexOf('const handleOptionSelect ='),source.indexOf('\n  const handleStitchingTypeSelect'));
  const selectionCompiled=buildSync({stdin:{contents:selection+'\nexport default handleOptionSelect;',loader:'ts'},write:false,platform:'node',format:'cjs'}).outputFiles[0].text;
  let resets=0,errors=0;
  const scope={resolveAvailableVariantForOption,selectedOptionsFromVariant,variantNodes:variants,selectedOptions:selectedOptionsFromVariant(variants[0]),metaToken:null,setSelectedOptions:()=>{},setStitchingSize:value=>{assert.equal(value,null);resets++;},setShowSizeValidation:()=>{},setCustomSizeConfirmed:()=>{},isProductSizeOptionName,selectionRequiresSeparateMeasurements,productHasNativeSizes:false,toast:{error:()=>errors++}};
  const mod={exports:{}};new Function('module','exports',...Object.keys(scope),selectionCompiled)(mod,mod.exports,...Object.values(scope));
  mod.exports.default('Alteration','Made to Fit (+$10)');assert.equal(resets,1);
  mod.exports.default('Alteration','Unavailable option');assert.equal(resets,1);assert.equal(errors,1);
  assert.match(source,/setStitchingSize\(null\);\s*setShowSizeValidation\(false\);\s*setSelectedServiceAddOnCodes/);
});

test('listed native blouse timing renders once for MTM, MTF or both and preserves dispatch overrides', async () => {
  const {requiresNativeStitchingTimingConfirmation}=await import('../src/lib/serviceAddOns.ts');
  const options=[{name:'Blouse',values:['Unstitched Blouse Fabric','Made to Measure Blouse (+$10)']},{name:'Alteration',values:['Standard Fit','Made to Fit (+$10)']}];
  const product={title:'Designer Hand-Embroidered Net Saree',productType:'Saree',options,variants:{edges:options[0].values.flatMap(blouse=>options[1].values.map(alteration=>({node:{selectedOptions:[{name:'Blouse',value:blouse},{name:'Alteration',value:alteration}]}})))}};
  const original=JSON.stringify(product);
  assert.equal(mayRequireAlterationProcessing(product),true);
  for(const [blouse,alteration] of [[0,0],[1,0],[0,1],[1,1]]) {
    const selected=options.map((option,i)=>({name:option.name,value:option.values[i===0?blouse:alteration]}));
    const processing=requiresNativeStitchingTimingConfirmation(product,selected);
    assert.equal(processing,Boolean(blouse||alteration));
    for(const days of [undefined,6]) {
      const html=renderToStaticMarkup(createElement(m.exports.DeliveryEstimate,{hasStitching:false,requiresTailoringTimingConfirmation:processing,shipsWithinDays:days}));
      if(processing) {
        assert.match(html,/add 3 business days once, not per service/);
        assert.match(html,days===6?/18–23 business days total/:/15–21 business days total/);
        assert.doesNotMatch(html,/add 6 business days|21–26 business days total/);
      } else {
        assert.match(html,days===6?/Estimated dispatch in 6 business days without alterations/:/12–18 business days total/);
        if(days===6) assert.match(html,/9–14 business days after dispatch/);
        assert.doesNotMatch(html,/15–21 business days total|18–23 business days total/);
      }
    }
    assert.equal(serviceAddOnTotal([]),0,'native options never create optional-service fees');
  }
  assert.equal(JSON.stringify(product),original,'timing predicate does not mutate native catalog options');
});

test('native blouse timing requires the exact supported listed selection, not descriptions or unsupported choices', async () => {
  const {requiresNativeStitchingTimingConfirmation}=await import('../src/lib/serviceAddOns.ts');
  const selected={name:'Blouse',value:'Made to Measure Blouse (+$10)'};
  for(const product of [
    {title:'Made to Measure Blouse',description:'Made to Measure Blouse (+$10)',options:[]},
    {options:[{name:'Blouse',values:['Unstitched Blouse Fabric']}]},
    {options:[{name:'Blouse',values:['Made to Measure Blouse (+$20)']}]},
    {options:[{name:'Color',values:[selected.value]}]},
  ]) assert.equal(requiresNativeStitchingTimingConfirmation(product,[selected]),false);
  for(const value of ['Unstitched Blouse Fabric','Standard Fit','Optional Made to Measure Blouse','Made to Measure Blouse sold separately']) {
    const option={name:'Blouse',value};
    assert.equal(requiresNativeStitchingTimingConfirmation({options:[{name:'Blouse',values:[value]}]},[option]),false,value);
  }
  assert.equal(mayRequireAlterationProcessing({title:'Plain fabric',productType:'Fabric',options:[{name:'Blouse',values:['Unstitched Blouse Fabric']}]}),false);
});
