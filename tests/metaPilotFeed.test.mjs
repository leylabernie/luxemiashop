import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const compiled = await build({entryPoints:['api/meta-catalog.ts'],bundle:true,write:false,platform:'node',format:'cjs'});
const mod={exports:{}};new Function('module','exports','require',compiled.outputFiles[0].text)(mod,mod.exports,createRequire(import.meta.url));
const mappingCompiled = await build({entryPoints:['src/lib/metaPilot.ts'],bundle:true,write:false,platform:'node',format:'cjs'});
const mapMod={exports:{}};new Function('module','exports','require',mappingCompiled.outputFiles[0].text)(mapMod,mapMod.exports,createRequire(import.meta.url));
const {META_PILOT_PRODUCTS,getMetaPilotVariant,verifyMetaPilotVariant}=mapMod.exports;
const {metaCatalogRows,META_CATALOG_FIELDS}=mod.exports;
const product=(handle,index=0)=>({handle,title:`Title ${index}`,description:`Description ${index}`,availableForSale:index%7!==0,images:{nodes:[{url:`https://example.com/${index}.jpg`}]},priceRange:{minVariantPrice:{amount:`${50+index}.00`,currencyCode:'USD'}}});
const pilot=family=>({handle:family.handle,variants:{nodes:family.variants.map(v=>({id:v.variantId,selectedOptions:v.selectedOptions.map(x=>({...x})),requiresComponents:false,price:{amount:family.color==='Green'?'108.99':'77.49',currencyCode:'USD'},availableForSale:true,image:null})),pageInfo:{hasNextPage:false}}});
const oldRow=p=>[p.handle.length<=100?p.handle:`lm-${createHash('sha256').update(p.handle).digest('hex').slice(0,24)}`,p.title.slice(0,150),(p.description||p.title).slice(0,5000),p.availableForSale?'in stock':'out of stock','new',`${Number(p.priceRange.minVariantPrice.amount).toFixed(2)} ${p.priceRange.minVariantPrice.currencyCode}`,`https://luxemia.shop/product/${p.handle}`,p.images.nodes[0].url,'LuxeMia'];
test('approved pilot is exactly two families eleven unique exact variant IDs',()=>{
 assert.equal(META_PILOT_PRODUCTS.length,2);const variants=META_PILOT_PRODUCTS.flatMap(p=>p.variants);assert.equal(variants.length,11);assert.equal(new Set(variants.map(v=>v.contentId)).size,11);
 for(const v of variants){assert.equal(getMetaPilotVariant(v.contentId).variantId,v.variantId);assert.match(v.contentId,/^lmv-\d+$/);assert(!v.selectedOptions.some(o=>/custom|made to fit/i.test(o.value)));}
 assert.equal(getMetaPilotVariant('lmv-1'),undefined);assert.equal(getMetaPilotVariant('anarkali-green-chinon'),undefined);
});
test('378 parent fixture becomes387 rows with all376 unrelated rows unchanged',()=>{
 const ordinary=Array.from({length:376},(_,i)=>product(i===375?'a'.repeat(101):`ordinary-${i}`,i));
 const rows=ordinary.flatMap(p=>metaCatalogRows(p));for(let i=0;i<ordinary.length;i++){assert.deepEqual(rows[i].slice(0,9),oldRow(ordinary[i]));assert.deepEqual(rows[i].slice(9),['','','']);}
 for(const family of META_PILOT_PRODUCTS)rows.push(...metaCatalogRows({...product(family.handle),availableForSale:true},pilot(family)));
 assert.equal(rows.length,387);assert.equal(new Set(rows.map(r=>r[0])).size,387);assert.deepEqual(META_CATALOG_FIELDS.slice(9),['item_group_id','size','color']);
 for(const family of META_PILOT_PRODUCTS){assert(!rows.some(r=>r[0]===family.handle));const group=rows.filter(r=>r[9]===family.handle);assert.equal(group.length,family.variants.length);for(const r of group){const v=getMetaPilotVariant(r[0]);assert.equal(r[10],v.size);assert.equal(r[11],v.color);assert.match(r[6],new RegExp(`\\?variant=${v.variantId.split('/').pop()}$`));}}
});
test('pilot prices stock and images come from exact current native variant, never parent minimum',()=>{
 const family=META_PILOT_PRODUCTS[0],p={...product(family.handle),availableForSale:true},native=pilot(family);native.variants.nodes[0].price.amount='201.23';native.variants.nodes[0].availableForSale=false;native.variants.nodes[0].image={url:'https://example.com/variant.jpg'};
 const row=metaCatalogRows(p,native)[0];assert.equal(row[3],'out of stock');assert.equal(row[5],'201.23 USD');assert.equal(row[7],'https://example.com/variant.jpg');
 assert(metaCatalogRows({...p,availableForSale:false},native).every(r=>r[3]==='out of stock'));
});
test('missing duplicate changed configuration component or currency fails closed; future custom rows do not expand pilot',()=>{
 const family=META_PILOT_PRODUCTS[0],p=product(family.handle);
 for(const alter of [x=>x.variants.nodes.pop(),x=>x.variants.nodes.push(x.variants.nodes[0]),x=>x.variants.nodes[0].selectedOptions[0].value='Wrong size',x=>x.variants.nodes[0].selectedOptions.push({name:'Extra',value:'Unchosen'}),x=>x.variants.nodes[0].requiresComponents=true,x=>x.variants.nodes[0].price.currencyCode='INR',x=>x.variants.nodes[0].price.amount='0',x=>x.variants.pageInfo.hasNextPage=true,x=>x.handle='other']){const native=pilot(family);alter(native);assert.throws(()=>metaCatalogRows(p,native));}
 assert.throws(()=>metaCatalogRows(p));const native=pilot(family);native.variants.nodes.push({...native.variants.nodes[0],id:'gid://shopify/ProductVariant/999',selectedOptions:[{name:'Size',value:'Custom'}]});assert.equal(metaCatalogRows(p,native).length,5);
 assert.throws(()=>verifyMetaPilotVariant('other',native.variants.nodes[0]));
});
test('each exact supported size combination preserves496.44 testbasket and hidden service remains absent',()=>{
 const a=metaCatalogRows({...product(META_PILOT_PRODUCTS[0].handle),availableForSale:true},pilot(META_PILOT_PRODUCTS[0]));const b=metaCatalogRows({...product(META_PILOT_PRODUCTS[1].handle),availableForSale:true},pilot(META_PILOT_PRODUCTS[1]));for(const x of a)for(const y of b)assert.equal(Math.round(Number(x[5].split(' ')[0])*100)+5*Math.round(Number(y[5].split(' ')[0])*100),49644);
 assert.deepEqual(metaCatalogRows(product('luxemia-tailoring-saree-finishing-add-ons')),[]);
});

test('feed endpoint emits only complete approved migration; failures never emit partial REPLACE CSV',async()=>{
 const originalFetch=globalThis.fetch;const originalToken=process.env.SHOPIFY_STOREFRONT_TOKEN;process.env.SHOPIFY_STOREFRONT_TOKEN='test-only';
 const families=META_PILOT_PRODUCTS.map(f=>({...product(f.handle),availableForSale:true}));const ordinary=Array.from({length:376},(_,i)=>product(`ordinary-${i}`,i));
 const invoke=async(mode)=>{let code=200,body='',headers={};globalThis.fetch=async(_url,options)=>{const request=JSON.parse(options.body);if(request.variables.handle){const f=META_PILOT_PRODUCTS.find(f=>f.handle===request.variables.handle);return {ok:true,json:async()=>({data:{product:pilot(f)}})};}return{ok:true,json:async()=>({data:{products:{nodes:mode==='missing'?ordinary:[...ordinary,...families],pageInfo:{hasNextPage:false,endCursor:null}}}})};};const response={status(n){code=n;return this;},setHeader(k,v){headers[k]=v;return this;},send(value){body=value;return this;},end(){return this;}};await mod.exports.default({method:'GET'},response);return{code,body,headers};};
 try{let r=await invoke('complete');assert.equal(r.code,200);assert.equal(r.headers['X-Catalog-Products'],'387');assert.equal(r.body.trim().split('\r\n').length,388);r=await invoke('missing');assert.equal(r.code,503);assert(!r.body.includes('"id"'));}finally{globalThis.fetch=originalFetch;if(originalToken===undefined)delete process.env.SHOPIFY_STOREFRONT_TOKEN;else process.env.SHOPIFY_STOREFRONT_TOKEN=originalToken;}
});
