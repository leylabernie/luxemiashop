import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const result = await build({ entryPoints:['src/lib/metaCheckout.ts'],bundle:true,write:false,platform:'node',format:'cjs' });
const mod = { exports: {} }; new Function('module','exports','require',result.outputFiles[0].text)(mod,mod.exports,createRequire(import.meta.url));
const {parseMetaCheckout,metaContentId,resolveMetaProducts,metaCheckoutLines}=mod.exports;
const variant=(id,title='Default Title',availableForSale=true)=>({node:{id:`gid://shopify/ProductVariant/${id}`,title,availableForSale,price:{amount:'49.00',currencyCode:'USD'},selectedOptions:[{name:'Title',value:title}]}});
const product=(handle='gold-saree')=>({id:'p-'+handle,handle,title:handle,productType:'Saree',tags:[],options:[],availableForSale:true,variants:{edges:[variant(1),variant(2,'Size 36')]},images:{edges:[]}});
test('parse multi-product, quantities, duplicate lines, encoded coupon',()=>assert.deepEqual(parseMetaCheckout('?products=gold-saree:2,blue-saree:1,gold-saree:3&coupon=FAMILY%20%26%20FRIENDS'),{lines:[{contentId:'gold-saree',quantity:5},{contentId:'blue-saree',quantity:1}],coupon:'FAMILY & FRIENDS'}));
test('reject malformed, missing, duplicate params and excessive quantities',()=>{for(const query of ['', '?products=', '?products=a:0','?products=a:-1','?products=a:1.5','?products=a:100','?products=a:99,a:1','?products=a:1&products=b:1','?products=https://evil:1','?products=a:1&coupon=%00','?products=a:1&coupon=a&coupon=b','?products=a:01'])assert.throws(()=>parseMetaCheckout(query),query);});
test('catalog ID exactly matches feed SHA256 truncation',async()=>{const h='a'.repeat(101);assert.equal(await metaContentId(h),`lm-${createHash('sha256').update(h).digest('hex').slice(0,24)}`);assert.equal(await metaContentId('gold-saree'),'gold-saree');assert.match(readFileSync('api/meta-catalog.ts','utf8'),/createHash\('sha256'\).*slice\(0,24\)/);});
test('resolve hashed and ordinary IDs together then load full product',async()=>{const long=product('a'.repeat(101)),short=product();const id=await metaContentId(long.handle);const req=parseMetaCheckout(`?products=${id}:2,gold-saree:1`);const calls=[];const result=await resolveMetaProducts(req,async h=>{calls.push(h);return h===long.handle?long:short;},async()=>[{node:long},{node:short}]);assert.equal(result.length,2);assert.deepEqual(calls,[long.handle,'gold-saree']);});
test('unknown, missing, sold-out and hidden items fail entire basket',async()=>{for(const p of [null,{...product(),availableForSale:false},{...product(),variants:{edges:[variant(1,'Default',false)]}}])await assert.rejects(resolveMetaProducts(parseMetaCheckout('?products=gold-saree:1'),async()=>p,async()=>[]));await assert.rejects(resolveMetaProducts(parseMetaCheckout('?products=luxemia-tailoring-saree-finishing-add-ons:1'),async()=>product(),async()=>[]));});
test('explicit variant required; quantities and exact variants retained',()=>{const p=product();assert.throws(()=>metaCheckoutLines([{product:p,quantity:1,variantId:''}]));assert.deepEqual(metaCheckoutLines([{product:p,quantity:2,variantId:'gid://shopify/ProductVariant/2'}]),[{variantId:'gid://shopify/ProductVariant/2',quantity:2,handle:'gold-saree'}]);});
test('custom-fit and absent size requirements cannot bypass configurator',()=>{const p=product();p.variants.edges=[variant(1,'Custom Fit')];assert.throws(()=>metaCheckoutLines([{product:p,quantity:1,variantId:p.variants.edges[0].node.id}]));p.variants.edges=[variant(1)];p.productType='Menswear';assert.throws(()=>metaCheckoutLines([{product:p,quantity:1,variantId:p.variants.edges[0].node.id}]));});
test('unavailable variant and invalid price fail safely',()=>{const p=product();p.variants.edges[0].node.availableForSale=false;assert.throws(()=>metaCheckoutLines([{product:p,quantity:1,variantId:p.variants.edges[0].node.id}]));p.variants.edges[0].node.availableForSale=true;p.variants.edges[0].node.price.amount='NaN';assert.throws(()=>metaCheckoutLines([{product:p,quantity:1,variantId:p.variants.edges[0].node.id}]));});
test('truncated variant list cannot be accepted',()=>{const p=product();p.variants.edges=Array.from({length:100},(_,i)=>variant(i+1));assert.throws(()=>metaCheckoutLines([{product:p,quantity:1,variantId:p.variants.edges[0].node.id}]));});
test('route uses verified helper and does not modify existing shopping bag',()=>{const s=readFileSync('src/pages/MetaCheckout.tsx','utf8');assert.match(s,/createStorefrontCheckout\(lines, request.coupon, expectedPrices\)/);assert.doesNotMatch(s,/useCartStore|localStorage\.setItem|clearCart/);assert.match(s,/generation.current !== current/);assert.match(s,/busy.current \|\| !request/);assert.match(readFileSync('src/App.tsx','utf8'),/path="\/meta-checkout"/);});
test('native standard stitching requires timing acknowledgment and transfers attributes',()=>{
 const p=product();p.productType='Lehenga Choli';p.options=[{name:'Stitching',values:['Unstitched (Fabric Only)','Standard Stitched','Custom Stitched']},{name:'Size',values:['Fabric Only','34','Custom Fit']}];
 p.variants.edges=[variant(1,'Standard Stitched / 34'),variant(2,'Unstitched (Fabric Only) / Fabric Only'),variant(3,'Custom Stitched / Custom Fit')];[['Standard Stitched','34'],['Unstitched (Fabric Only)','Fabric Only'],['Custom Stitched','Custom Fit']].forEach(([stitching,size],i)=>{p.variants.edges[i].node.selectedOptions=[{name:'Stitching',value:stitching},{name:'Size',value:size}];});
 const selection={product:p,quantity:1,variantId:'gid://shopify/ProductVariant/1'};
 assert.throws(()=>metaCheckoutLines([selection]),/acknowledge/);
 const lines=metaCheckoutLines([{...selection,timingConfirmed:true}]);assert.equal(lines[0].customAttributes[0].key,'Tailoring');assert.equal(lines[0].customAttributes[0].value,'Alterations / finishing requested');
});
test('made to order cannot bypass full configurator',()=>{const p=product();p.tags=['made to order'];assert.throws(()=>metaCheckoutLines([{product:p,quantity:1,variantId:'gid://shopify/ProductVariant/1'}]),/configurator/);});
test('Meta route is private in Edge middleware and absent from prerender manifest',()=>{
 const middleware=readFileSync('middleware.ts','utf8');assert.match(middleware,/const PRIVATE_SPA_ROUTES[\s\S]*?'\/meta-checkout'/);assert.match(middleware,/const nonPublicPrefixes[\s\S]*?'\/meta-checkout'/);
 assert.doesNotMatch(readFileSync('scripts/generate-routes.cjs','utf8'),/'\/meta-checkout'/);
});
test('real checkout helper sends exact variants, quantities and coupon without a real network call',async()=>{
 const built=await build({entryPoints:['src/lib/shopify.ts'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',define:{'import.meta.env':'{}'}});
 const m={exports:{}};new Function('module','exports','require',built.outputFiles[0].text)(m,m.exports,createRequire(import.meta.url));
 const original=globalThis.fetch;let sent;
 globalThis.fetch=async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({data:{cartCreate:{cart:{checkoutUrl:'https://lovable-project-zlh0w.myshopify.com/cart/c/test',lines:{edges:sent.variables.input.lines.map(line=>({node:{quantity:line.quantity,attributes:line.attributes||[],merchandise:{id:line.merchandiseId}}})),pageInfo:{hasNextPage:false}}},userErrors:[]}}})}};
 try{const url=await m.exports.createStorefrontCheckout([{variantId:'gid://shopify/ProductVariant/2',quantity:2},{variantId:'gid://shopify/ProductVariant/3',quantity:1}],'FAMILY & FRIENDS');assert.deepEqual(sent.variables.input,{lines:[{quantity:2,merchandiseId:'gid://shopify/ProductVariant/2'},{quantity:1,merchandiseId:'gid://shopify/ProductVariant/3'}],discountCodes:['FAMILY & FRIENDS']});assert.match(url,/^https:\/\/lovable-project-zlh0w.myshopify.com\/cart\/c\/test\?/);}finally{globalThis.fetch=original;}
});

test('welcome popup cannot interrupt Meta option selection',()=>assert.match(readFileSync('src/components/home/NewVisitorPopup.tsx','utf8'),/location.pathname === '\/meta-checkout'/));
const contextBuild=await build({entryPoints:['src/lib/metaCheckoutContext.ts'],bundle:true,write:false,platform:'node',format:'cjs'});
const cm={exports:{}};new Function('module','exports','require',contextBuild.outputFiles[0].text)(cm,cm.exports,createRequire(import.meta.url));
const {saveMetaContext,readMetaContext,saveMetaConfiguration,metaReturnPath}=cm.exports;
const contextFixture=()=>{const storage=new Map();globalThis.sessionStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};const request=parseMetaCheckout('?products=gold-saree:2,custom-lehenga:1&coupon=NEIGHBOR%20%26%20FRIENDS');const token=saveMetaContext(null,request,[{contentId:'gold-saree',handle:'gold-saree',variantId:'gid://shopify/ProductVariant/2'},{contentId:'custom-lehenga',handle:'custom-lehenga',variantId:''}]);return {token,request,storage};};
const configuredItem=(handle,id,quantity=1)=>({product:{node:{handle}},variantId:`gid://shopify/ProductVariant/${id}`,variantTitle:'Custom Fit',quantity,price:{amount:'99.00',currencyCode:'USD'},customAttributes:[{key:'Measurement Confirmation',value:'Customer acknowledged before checkout'}]});
test('mixed custom and standard basket, coupon and choices survive configuration and reload',()=>{const original=globalThis.sessionStorage;try{const {token,request}=contextFixture();const route=saveMetaConfiguration(token,'custom-lehenga','custom-lehenga',[configuredItem('custom-lehenga',9)]);assert.equal(route,metaReturnPath(token));const restored=readMetaContext(token);assert.deepEqual(restored.request,request);assert.equal(restored.selections[0].variantId,'gid://shopify/ProductVariant/2');assert.equal(restored.selections[1].configured[0].customAttributes[0].key,'Measurement Confirmation');assert.equal(restored.request.coupon,'NEIGHBOR & FRIENDS');assert.deepEqual(readMetaContext(token),restored);}finally{globalThis.sessionStorage=original;}});
test('cancel/back without configuration preserves all items and coupon',()=>{const original=globalThis.sessionStorage;try{const {token,request}=contextFixture();metaReturnPath(token);assert.deepEqual(readMetaContext(token).request,request);assert.equal(readMetaContext(token).selections[1].configured,undefined);}finally{globalThis.sessionStorage=original;}});
test('PDP quantity and paid services transfer without touching regular bag',()=>{const original=globalThis.sessionStorage;try{const {token}=contextFixture();saveMetaConfiguration(token,'custom-lehenga','custom-lehenga',[configuredItem('custom-lehenga',9,2),configuredItem('luxemia-tailoring-saree-finishing-add-ons',10,2)]);const restored=readMetaContext(token);assert.equal(restored.request.lines[1].quantity,2);assert.equal(restored.selections[1].configured.length,2);assert.equal(restored.request.lines[0].quantity,2);assert.doesNotMatch(readFileSync('src/lib/metaCheckoutContext.ts','utf8'),/localStorage|useCartStore\(/);}finally{globalThis.sessionStorage=original;}});
test('wrong product and expired context cannot accept configuration',()=>{const original=globalThis.sessionStorage;try{const {token,storage}=contextFixture();assert.throws(()=>saveMetaConfiguration(token,'custom-lehenga','other',[configuredItem('other',9)]));const key=[...storage.keys()][0],context=JSON.parse(storage.get(key));context.expires=0;storage.set(key,JSON.stringify(context));assert.equal(readMetaContext(token),null);assert.throws(()=>saveMetaConfiguration(token,'custom-lehenga','custom-lehenga',[configuredItem('custom-lehenga',9)]));}finally{globalThis.sessionStorage=original;}});
test('configured main and paid service variants are freshly checked; no silent omissions',async()=>{const p=product('custom-lehenga');const service=product('luxemia-tailoring-saree-finishing-add-ons');const selection={product:p,quantity:1,variantId:'gid://shopify/ProductVariant/1',configured:[{...configuredItem('custom-lehenga',1),handle:p.handle},{...configuredItem(service.handle,2),handle:service.handle}]};const lines=await mod.exports.configuredMetaCheckoutLines(selection,async handle=>handle===p.handle?p:service);assert.equal(lines.length,2);assert.equal(lines[0].customAttributes[0].key,'Measurement Confirmation');service.variants.edges[1].node.availableForSale=false;await assert.rejects(mod.exports.configuredMetaCheckoutLines(selection,async handle=>handle===p.handle?p:service));});
test('Meta PDP mode does not silently choose first size or fill other ambiguous options',()=>{const source=readFileSync('src/components/product/ProductInfo.tsx','utf8');assert.match(source,/if \(metaToken && product.variants.edges.length > 1\)/);assert.match(source,/product.options.filter\(option => option.values.length === 1\)/);assert.match(source,/nextSelectedOptions = metaToken\s*\? \{ \.\.\.selectedOptions, \[optionName\]: value \}/);});

test('quantity above 99 preserves the previous valid mixed basket instead of expiring it',()=>{const original=globalThis.sessionStorage;try{const {token,request}=contextFixture();assert.throws(()=>saveMetaConfiguration(token,'custom-lehenga','custom-lehenga',[configuredItem('custom-lehenga',9,100)]),/between 1 and 99/);assert.deepEqual(readMetaContext(token).request,request);}finally{globalThis.sessionStorage=original;}});
test('context expiry is fixed, not extended by selection edits',()=>{const original=globalThis.sessionStorage;try{const {token,request}=contextFixture();const before=readMetaContext(token);saveMetaContext(token,request,before.selections);assert.equal(readMetaContext(token).expires,before.expires);}finally{globalThis.sessionStorage=original;}});
test('confirmed handoff clears custom data but restores encoded products and coupon for Back',()=>{const original=globalThis.sessionStorage,win=globalThis.window;try{const {token,request}=contextFixture();let historyPath='',destination='';globalThis.window={history:{replaceState:(a,b,path)=>{historyPath=path;}},location:{assign:url=>{destination=url;}}};cm.exports.completeMetaHandoff(token,request,'https://lovable-project-zlh0w.myshopify.com/cart/c/test');assert.equal(readMetaContext(token),null);assert.equal(destination,'https://lovable-project-zlh0w.myshopify.com/cart/c/test');assert.deepEqual(parseMetaCheckout(historyPath.split('?')[1]),request);assert.doesNotMatch(historyPath,/Measurement|customAttributes/);}finally{globalThis.sessionStorage=original;globalThis.window=win;}});
test('failed handoff preserves configuration and explicit cancellation clears it',()=>{const original=globalThis.sessionStorage,win=globalThis.window;try{const {token,request}=contextFixture();globalThis.window={history:{replaceState(){}},location:{assign(){throw Error('navigation failed');}}};assert.throws(()=>cm.exports.completeMetaHandoff(token,request,'https://lovable-project-zlh0w.myshopify.com/cart/c/test'));assert.ok(readMetaContext(token));cm.exports.clearMetaContext(token);assert.equal(readMetaContext(token),null);}finally{globalThis.sessionStorage=original;globalThis.window=win;}});

test('BFCache restoration reloads the sanitized intent rather than stale personal configuration',()=>{const source=readFileSync('src/pages/MetaCheckout.tsx','utf8');assert.match(source,/if \(event.persisted\) window.location.reload\(\)/);assert.match(source,/removeEventListener\('pageshow', restore\)/);});

test('Meta absent, bare and empty optional coupon are equivalent',()=>{
 for(const suffix of ['', '&coupon', '&coupon=']) assert.deepEqual(parseMetaCheckout('?products=anarkali-green-chinon:1,dusty-peach-embroidered-a-line-palazzo-suit-chinon-indian-wedding-outfit-ready-to-wear:5'+suffix+'&cart_origin=meta_shops'),{lines:[{contentId:'anarkali-green-chinon',quantity:1},{contentId:'dusty-peach-embroidered-a-line-palazzo-suit-chinon-indian-wedding-outfit-ready-to-wear',quantity:5}],coupon:null,attribution:{cart_origin:'meta_shops'}});
});
test('blank normalization preserves discount validation and duplicate guards',()=>{
 for(const value of ['%20','+','%09','%00','%7F','x'.repeat(257)]) assert.throws(()=>parseMetaCheckout('?products=a:1&coupon='+value));
 for(const suffix of ['&coupon&coupon','&coupon=&coupon=SAVE','&coupon=SAVE&coupon=']) assert.throws(()=>parseMetaCheckout('?products=a:1'+suffix));
 assert.equal(parseMetaCheckout('?products=a:1&coupon=SAVE%2B10%20%26%20MORE&cart_origin=meta_shops').coupon,'SAVE+10 & MORE');
 assert.equal(parseMetaCheckout('?products=a:1&coupon=%20SAVE%20').coupon,' SAVE ');
});

test('saved Meta configuration normalizes only legacy automatic fulfillment copy',async()=>{
 const p=product('custom-lehenga');const attrs=[{key:'Tailoring',value:'Tailored to order'},{key:'Requested Custom Color',value:'SYNTHETIC blue'},{key:'Applies To',value:'Tailored to order'}];
 const line={...configuredItem(p.handle,1),handle:p.handle,customAttributes:attrs};
 const lines=await mod.exports.configuredMetaCheckoutLines({product:p,quantity:1,variantId:line.variantId,configured:[line]},async()=>p);
 assert.deepEqual(lines[0].customAttributes,[{key:'Tailoring',value:'Alterations / finishing requested'},...attrs.slice(1)]);
 assert.equal(lines[0].quantity,1);assert.equal(lines[0].variantId,line.variantId);assert.equal(attrs[0].value,'Tailored to order');
});

test('Meta storage redacts NOW details and pending configuration cannot reach checkout',async()=>{
 const original=globalThis.sessionStorage;
 try{
  const {token,storage}=contextFixture();
  const line=configuredItem('custom-lehenga',1);
  line.customAttributes=[{key:'Measurement submission',value:'Customer supplied — review required'},{key:'Provided measurement 1',value:'PRIVATE_LABEL: 36.123 inches'},{key:'Measurement notes',value:'PRIVATE_NOTES'},{key:'Measurement basis',value:'Body'},{key:'Configuration reference',value:'safe-reference'}];
  saveMetaConfiguration(token,'custom-lehenga','custom-lehenga',[line]);
  const serialized=[...storage.values()].join('');
  assert.doesNotMatch(serialized,/PRIVATE_LABEL|36\.123|PRIVATE_NOTES|"Body"/);
  const configured=readMetaContext(token).selections[1].configured;
  assert(configured[0].customAttributes.some(a=>a.value==='Re-enter measurement details after reload'));
  assert(configured[0].customAttributes.some(a=>a.value==='safe-reference'));
  let reads=0;
  await assert.rejects(mod.exports.configuredMetaCheckoutLines({product:product('custom-lehenga'),quantity:1,variantId:line.variantId,configured},async()=>{reads++;return product('custom-lehenga')}),/re-entered/);
  assert.equal(reads,0,'pending details fail closed before product/checkout network');
 }finally{globalThis.sessionStorage=original;}
});

const basketSubtotal = mod.exports.metaBasketSubtotal;
const subtotalItem = (price='108.99', quantity=1, currency='USD') => {
 const p=product();p.variants.edges=[variant(1)];p.variants.edges[0].node.price={amount:price,currencyCode:currency};
 return {product:p,quantity,variantId:p.variants.edges[0].node.id};
};
test('Meta exact 1 + 5 basket has combined merchandise subtotal 496.44',()=>{
 assert.deepEqual(basketSubtotal([subtotalItem(),subtotalItem('77.49',5)]),{currency:'USD',merchandise:'496.44',services:'0.00',total:'496.44'});
});
test('Meta subtotal requires all available explicit selections and valid quantities',()=>{
 assert.equal(basketSubtotal([]),null);
 for(const quantity of [0,-1,1.5,100,NaN])assert.equal(basketSubtotal([subtotalItem('1',quantity)]),null);
 const item=subtotalItem();item.variantId='';assert.equal(basketSubtotal([subtotalItem(),item]),null);
 item.variantId='gid://shopify/ProductVariant/1';item.product.variants.edges[0].node.availableForSale=false;assert.equal(basketSubtotal([item]),null);
 item.product.variants.edges[0].node.availableForSale=true;item.product.availableForSale=false;assert.equal(basketSubtotal([item]),null);
});
test('Meta decimal minor units avoid floating-point errors and reject invalid mixed money',()=>{
 assert.equal(basketSubtotal([subtotalItem('0.10',3),subtotalItem('0.20')]).merchandise,'0.50');
 assert.equal(basketSubtotal([subtotalItem('1.2300',3)]).merchandise,'3.69');
 for(const price of ['NaN','Infinity','-1','0','1.005','1e2','','9007199254740991'])assert.equal(basketSubtotal([subtotalItem(price)]),null);
 assert.equal(basketSubtotal([subtotalItem('1',1,'USD'),subtotalItem('1',1,'CAD')]),null);
 assert.equal(basketSubtotal([subtotalItem('100',2,'JPY')]).merchandise,'200');
 assert.equal(basketSubtotal([subtotalItem('1.234',2,'KWD')]).merchandise,'2.468');
});
test('Meta subtotal reflects current selection and quantity without trusting saved main price',()=>{
 const item=subtotalItem('10',2);item.configured=[{handle:item.product.handle,variantId:item.variantId,variantTitle:'Default',quantity:2,price:{amount:'999',currencyCode:'USD'}}];
 assert.equal(basketSubtotal([item]).total,'20.00');item.product.variants.edges[0].node.price.amount='12.34';assert.equal(basketSubtotal([item]).total,'24.68');
 item.quantity=3;assert.equal(basketSubtotal([item]),null);item.configured[0].quantity=3;assert.equal(basketSubtotal([item]).total,'37.02');
});
test('Meta optional services are separate and counted once; inconsistent configurations fail closed',()=>{
 const item=subtotalItem('10',2);item.configured=[{handle:item.product.handle,variantId:item.variantId,variantTitle:'Default',quantity:2,price:{amount:'10',currencyCode:'USD'}},{handle:'luxemia-tailoring-saree-finishing-add-ons',variantId:'gid://shopify/ProductVariant/99',variantTitle:'Finishing',quantity:2,price:{amount:'3.25',currencyCode:'USD'}}];
 assert.deepEqual(basketSubtotal([item]),{currency:'USD',merchandise:'20.00',services:'6.50',total:'26.50'});
 item.configured.push(item.configured[1]);assert.equal(basketSubtotal([item]),null);item.configured.pop();
 item.configured[1].quantity=1;assert.equal(basketSubtotal([item]),null);item.configured[1].quantity=2;
 item.configured[1].handle='unrelated';assert.equal(basketSubtotal([item]),null);item.configured[1].handle='luxemia-tailoring-saree-finishing-add-ons';
 item.configured[0].variantId='wrong';assert.equal(basketSubtotal([item]),null);
});
test('Meta review exposes accessible combined subtotal without changing checkout or auto-selecting',()=>{
 const source=readFileSync('src/pages/MetaCheckout.tsx','utf8');assert.match(source,/aria-label="Selection subtotal" aria-live="polite"/);assert.match(source,/Merchandise subtotal:/);assert.match(source,/Before shipping, taxes and discounts/);assert.match(source,/metaBasketSubtotal\(selections\)/);assert.match(source,/disabled=\{submitting \|\| selections.some\(item => !item.variantId\)\}/);assert.match(source,/createStorefrontCheckout\(lines, request.coupon, expectedPrices\)/);
});

const pilotFixture = (peach = false) => {
 const handle = peach ? 'dusty-peach-embroidered-a-line-palazzo-suit-chinon-indian-wedding-outfit-ready-to-wear' : 'anarkali-green-chinon';
 const id = peach ? '48210922504363' : '48120657903787';
 const p = product(handle); p.productType = peach ? 'Palazzo Suit' : 'Anarkali';
 p.options=[{name:'Size',values:['S','M']},...(!peach?[{name:'Alteration',values:['Standard','Custom']}]:[])];
 p.variants.edges=[{node:{id:`gid://shopify/ProductVariant/${id}`,title:peach?'S':'S / Standard',availableForSale:true,requiresComponents:false,price:{amount:peach?'77.49':'108.99',currencyCode:'USD'},selectedOptions:[{name:'Size',value:'S'},...(!peach?[{name:'Alteration',value:'Standard'}]:[])]}}];
 return p;
};
test('exact pilot IDs resolve actual Meta-selected sizes and496.44 basket without choosing defaults',async()=>{
 const a=pilotFixture(),p=pilotFixture(true),request=parseMetaCheckout('?products=lmv-48120657903787:1,lmv-48210922504363:5');
 const resolved=await resolveMetaProducts(request,async h=>h===a.handle?a:p,async()=>[]);
 assert.deepEqual(metaCheckoutLines(resolved).map(x=>[x.variantId,x.quantity]),[['gid://shopify/ProductVariant/48120657903787',1],['gid://shopify/ProductVariant/48210922504363',5]]);
 assert.equal(mod.exports.metaBasketSubtotal(resolved).merchandise,'496.44');assert(mod.exports.canAutoMetaCheckout(request,resolved));
 assert(!mod.exports.canAutoMetaCheckout({...request,reviewOnly:true},resolved));
 assert(!mod.exports.canAutoMetaCheckout(request,[{...resolved[0],variantId:'gid://shopify/ProductVariant/48121669583019'},resolved[1]]));
 assert(!mod.exports.canAutoMetaCheckout(request,[{...resolved[0],configured:[{}]},resolved[1]]));
});
test('unknown pilot IDs and changed option/price/currency/availability fail closed',async()=>{
 await assert.rejects(resolveMetaProducts(parseMetaCheckout('?products=lmv-1:1'),async()=>pilotFixture(),async()=>[]),/not supported/);
 for(const alter of [v=>v.availableForSale=false,v=>v.selectedOptions[0].value='M',v=>v.price.currencyCode='INR',v=>v.price.amount='0',v=>v.requiresComponents=true]){
  const p=pilotFixture();alter(p.variants.edges[0].node);await assert.rejects(resolveMetaProducts(parseMetaCheckout('?products=lmv-48120657903787:1'),async()=>p,async()=>[]));
 }
});
test('legacy handles and mixed legacy/exact baskets preserve manual review and explicit choices',async()=>{
 const a=pilotFixture(),p=pilotFixture(true),request=parseMetaCheckout('?products=anarkali-green-chinon:1,lmv-48210922504363:5');
 const resolved=await resolveMetaProducts(request,async h=>h===a.handle?a:p,async()=>[]);
 assert.equal(resolved[0].variantId,undefined);assert.equal(resolved[1].variantId,p.variants.edges[0].node.id);assert(!mod.exports.canAutoMetaCheckout(request,resolved));
});
test('attribution is bounded allowlisted and survives context while PII/unknown/duplicates are discarded',()=>{
 const query='?products=lmv-48120657903787:1&coupon=SAVE&cart_origin=instagram&fbclid=Ab_12-34&utm_source=IGShopping&utm_medium=Social&utm_campaign=spring-2026&utm_content=carousel&email=customer%40example.com&token=secret&address=private';
 const req=parseMetaCheckout(query);assert.deepEqual(req.attribution,{fbclid:'Ab_12-34',cart_origin:'instagram',utm_source:'IGShopping',utm_medium:'Social',utm_campaign:'spring-2026',utm_content:'carousel'});
 assert.deepEqual(parseMetaCheckout(mod.exports.metaRequestSearch(req)),req);
 const url=new URL(mod.exports.metaAttributedCheckoutUrl('https://lovable-project-zlh0w.myshopify.com/cart/c/test?key=private-cart-key',req));assert.equal(url.searchParams.get('key'),'private-cart-key');assert.equal(url.searchParams.get('cart_origin'),'instagram');assert(!url.searchParams.has('email'));assert(!url.searchParams.has('coupon'));
 for(const bad of ['&fbclid=a&fbclid=b','&utm_campaign=hello%40example.com','&utm_source=%0Asecret','&cart_origin=evil','&utm_content='+ 'x'.repeat(257)])assert.equal(parseMetaCheckout('?products=x:1'+bad).attribution,undefined);
});
test('exact pilot handoff marks Back as review-only and retains attribution without navigation loop',()=>{
 const oldStorage=globalThis.sessionStorage,oldWindow=globalThis.window;
 try{const {storage}=contextFixture();const request=parseMetaCheckout('?products=lmv-48120657903787:1&cart_origin=meta_shops&fbclid=test123');const token=saveMetaContext(null,request,[{contentId:request.lines[0].contentId,handle:pilotFixture().handle,variantId:'gid://shopify/ProductVariant/48120657903787'}]);assert.deepEqual(readMetaContext(token).request.attribution,request.attribution);
 let back='',destination='';globalThis.window={history:{replaceState:(_a,_b,url)=>{back=url}},location:{assign:url=>{destination=url}}};cm.exports.completeMetaHandoff(token,request,'https://lovable-project-zlh0w.myshopify.com/cart/c/test');assert.match(destination,/myshopify/);assert.equal(new URL(back,'https://luxemia.shop').searchParams.get('review'),'1');assert.equal(readMetaContext(token),null);assert.equal(parseMetaCheckout(new URL(back,'https://luxemia.shop').search).reviewOnly,true);
 }finally{globalThis.sessionStorage=oldStorage;globalThis.window=oldWindow;}
});

test('actual auto effect cannot hand off previous selections under a new or loading context; once per loaded token',()=>{
 const source=readFileSync('src/pages/MetaCheckout.tsx','utf8');const effect=source.match(/useEffect\(\(\) => \{\n    if \(loading[\s\S]*?\n  \}\);/)[0];let calls=0;
 const state={loading:false,request:{},contextToken:'B',loadedContext:{current:'A'},autoAttempted:{current:new Set()},selections:[],canAutoMetaCheckout:()=>true,checkout:()=>{calls++;}};
 const run=()=>new Function(...Object.keys(state),'let callback; const useEffect=fn=>callback=fn;'+effect+';callback();')(...Object.values(state));
 run();assert.equal(calls,0);state.loadedContext.current=null;run();assert.equal(calls,0);state.loadedContext.current='B';run();run();assert.equal(calls,1);
 state.contextToken='C';run();assert.equal(calls,1);state.loadedContext.current='C';state.loading=true;run();assert.equal(calls,1);state.loading=false;state.request={reviewOnly:true};run();assert.equal(calls,1);
 assert.match(source,/loadedContext.current = null;\n    setLoading/);assert.match(source,/if \(generation.current !== current\) return;[\s\S]*loadedContext.current = contextToken/);
});
test('actual checkout handler rejects stale context before work and cancels before cartCreate after async configuration',async()=>{
 const source=readFileSync('src/pages/MetaCheckout.tsx','utf8');const handler=source.slice(source.indexOf('  async function checkout()'),source.indexOf('  // A fresh exact-variant'));
 let carts=0,handoffs=0,release;const scope={busy:{current:false},request:{coupon:null},loadedContext:{current:'A'},contextToken:'B',readMetaContext:()=>({}),setError:()=>{},generation:{current:1},setSubmitting:()=>{},selections:[{configured:[{}]}],configuredMetaCheckoutLines:()=>new Promise(resolve=>{release=resolve;}),fetchProductByHandle:()=>{},metaCheckoutLines:()=>[],isExactMetaPilotRequest:()=>false,createStorefrontCheckout:async()=>{carts++;return 'https://lovable-project-zlh0w.myshopify.com/cart/c/test';},completeMetaHandoff:()=>{handoffs++;},metaAttributedCheckoutUrl:x=>x};
 const checkout=new Function(...Object.keys(scope),handler+';return checkout;')(...Object.values(scope));await checkout();assert.equal(carts,0);assert.equal(scope.busy.current,false);
 scope.loadedContext.current='B';const pending=checkout();scope.generation.current=2;scope.loadedContext.current='C';release([]);await pending;assert.equal(carts,0);assert.equal(handoffs,0);
});

test('actual persistence and configure handlers never overwrite a new context with old render selections',()=>{
 const source=readFileSync('src/pages/MetaCheckout.tsx','utf8');
 const effect=source.match(/useEffect\(\(\) => \{\n    if \(!request[\s\S]*?\n  \}, \[request, selections, contextToken\]\);/)[0];
 let saves=0,navigations=0;const scope={request:{lines:[{contentId:'old-a'}]},contextToken:'B',loadedContext:{current:'A'},selections:[{product:{handle:'old-product'},variantId:'old-variant'}],saveMetaContext:()=>{saves++;},setError:()=>{},navigate:()=>{navigations++;}};
 const persist=()=>new Function(...Object.keys(scope),'let callback;const useEffect=fn=>callback=fn;'+effect+';callback();')(...Object.values(scope));
 const handler=source.slice(source.indexOf('  function configure(index: number)'),source.indexOf('  async function checkout()')).replace('index: number','index');
 const configure=new Function(...Object.keys(scope),handler+';return configure;')(...Object.values(scope));
 persist();configure(0);assert.equal(saves,0);assert.equal(navigations,0);scope.loadedContext.current=null;persist();configure(0);assert.equal(saves,0);
 scope.loadedContext.current='B';persist();configure(0);assert.equal(saves,2);assert.equal(navigations,1);
});
