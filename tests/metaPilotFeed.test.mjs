import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
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
test('pilot feed title is the Shopify product title; selected size stays in the size field',()=>{
 const family=META_PILOT_PRODUCTS[0];
 const rows=metaCatalogRows({...product(family.handle),title:'Canonical Shopify parent title',availableForSale:true},pilot(family));
 assert(rows.length>1);
 for(const row of rows){
  assert.equal(row[1],'Canonical Shopify parent title','do not append a variant suffix to the feed title');
  assert.equal(row[10],getMetaPilotVariant(row[0]).size,'variant size is a separate catalog field');
 }
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
 try{let r=await invoke('complete');assert.equal(r.code,200);assert.equal(r.headers['X-Catalog-Products'],'387');assert.equal(r.headers['Cache-Control'],'no-store, max-age=0, must-revalidate');assert.equal(r.body.trim().split('\r\n').length,388);r=await invoke('missing');assert.equal(r.code,503);assert(!r.body.includes('"id"'));let transient=0;globalThis.fetch=async(_url,options)=>{transient++;if(transient===1)return{ok:false,status:503,json:async()=>({})};const request=JSON.parse(options.body);if(request.variables.handle){const f=META_PILOT_PRODUCTS.find(f=>f.handle===request.variables.handle);return{ok:true,status:200,json:async()=>({data:{product:pilot(f)}})};}return{ok:true,status:200,json:async()=>({data:{products:{nodes:[...ordinary,...families],pageInfo:{hasNextPage:false,endCursor:null}}}})};};let code=0,headers={};await mod.exports.default({method:'GET'},{status(n){code=n;return this;},setHeader(k,v){headers[k]=v;return this;},send(){return this;},end(){return this;}});assert.equal(code,200);assert.equal(headers['X-Catalog-Products'],'387');assert(transient>=2);}finally{globalThis.fetch=originalFetch;if(originalToken===undefined)delete process.env.SHOPIFY_STOREFRONT_TOKEN;else process.env.SHOPIFY_STOREFRONT_TOKEN=originalToken;}
});

// ── Parity with the store's captured live Shopify snapshot ──────────────────
// `public/merchant-feed.xml` is generated from the live Storefront API
// (scripts/generate-static-feed.cjs -> fetchCompleteStorefrontCatalog), and its
// per-variant title is composed by joining EVERY native selectedOption value:
//   composeMerchantVariantTitle(): `${baseTitle} — ${optionValues.join(' / ')}`
// Its description also prints the non-size options verbatim as
// `Selected options: Alteration: Standard.` So the snapshot records each pilot
// variant's real Shopify option shape, its parent title (g:item_group_title) and
// its selling price (g:sale_price when on sale, else g:price).
//
// The pilot declaration in src/lib/metaPilot.ts must agree with that shape.
// If it does not, verifyMetaPilotVariant throws inside metaCatalogRows and
// api/meta-catalog.ts fails the ENTIRE feed closed with a 503 — every product's
// row, not just the pilot's. Meta then cannot re-fetch and keeps serving the
// item records from its last successful import, which is how its checkout
// validator ends up comparing a stale saved product name against the live
// checkout summary and reporting "A product name was incorrect."
const snapshot = readFileSync('public/merchant-feed.xml', 'utf8');
const snapshotItems = [...snapshot.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => match[1]);
const snapshotField = (item, tag) => item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1];
function snapshotItemFor(variantId) {
  const id = String(variantId).split('/').pop();
  const item = snapshotItems.find(candidate => /(\d{10,20})$/.exec(snapshotField(candidate, 'g:id') || '')?.[1] === id);
  if (!item) throw new Error(`captured Shopify snapshot has no item for pilot variant ${id}`);
  return item;
}
/** The native selectedOptions Shopify reported for one captured variant. */
function snapshotOptions(item) {
  const size = snapshotField(item, 'g:size');
  const options = size ? [{ name: 'Size', value: size }] : [];
  const selected = snapshotField(item, 'g:description')?.match(/Selected options:\s*([\s\S]+?)\.\s/)?.[1];
  for (const pair of selected ? selected.split('; ') : []) {
    const at = pair.indexOf(': ');
    if (at > 0) options.push({ name: pair.slice(0, at), value: pair.slice(at + 2) });
  }
  return options;
}
const snapshotPrice = item => (snapshotField(item, 'g:sale_price') || snapshotField(item, 'g:price')).split(' ')[0];
/** Every captured variant of a pilot family, approved and unapproved alike. */
function snapshotFamily(family) {
  const group = snapshotField(snapshotItemFor(family.variants[0].variantId), 'g:item_group_id');
  return snapshotItems
    .filter(item => snapshotField(item, 'g:item_group_id') === group)
    .map(item => ({
      item,
      variantId: `gid://shopify/ProductVariant/${/(\d{10,20})$/.exec(snapshotField(item, 'g:id'))[1]}`,
      selectedOptions: snapshotOptions(item),
      price: snapshotPrice(item),
    }));
}
const nativeFamily = (family, members) => ({
  handle: family.handle,
  variants: {
    nodes: members.map(member => ({ id: member.variantId, availableForSale: true, requiresComponents: false,
      price: { amount: member.price, currencyCode: 'USD' }, selectedOptions: member.selectedOptions, image: null })),
    pageInfo: { hasNextPage: false },
  },
});

test('captured Shopify snapshot records Size plus Alteration Standard for the anarkali pilot and Size alone for the palazzo pilot', () => {
  const anarkali = META_PILOT_PRODUCTS[0], palazzo = META_PILOT_PRODUCTS[1];
  assert.deepEqual(snapshotOptions(snapshotItemFor(anarkali.variants[0].variantId)), [{ name: 'Size', value: 'S' }, { name: 'Alteration', value: 'Standard' }],
    'the anarkali pilot variants carry a native Alteration option in Shopify');
  assert.deepEqual(snapshotOptions(snapshotItemFor(palazzo.variants[0].variantId)), [{ name: 'Size', value: 'S' }]);
  // The parent title is what both the feed and the checkout summary publish; the
  // variant-level title carries the option suffix and must never be used.
  assert.equal(snapshotField(snapshotItemFor(anarkali.variants[0].variantId), 'g:title'),
    `${snapshotField(snapshotItemFor(anarkali.variants[0].variantId), 'g:item_group_title')} — S / Standard`);
  assert.equal(snapshotPrice(snapshotItemFor(palazzo.variants[0].variantId)), '77.49', 'the 496.44 test basket price');
});

test('all eleven approved pilot variants verify against their captured live Shopify option shape', () => {
  for (const family of META_PILOT_PRODUCTS) {
    for (const member of snapshotFamily(family).filter(entry => family.variants.some(approved => approved.variantId === entry.variantId))) {
      // Before Alteration:Standard was approved as an optional native option this
      // threw for every anarkali variant and 503'd the whole catalog feed.
      assert.equal(verifyMetaPilotVariant(family.handle, { id: member.variantId, requiresComponents: false,
        price: { amount: member.price, currencyCode: 'USD' }, selectedOptions: member.selectedOptions }).variantId, member.variantId,
        `${family.handle} ${member.variantId}`);
    }
  }
});

test('feed built from captured Shopify data publishes the parent title untruncated with size in its own field', () => {
  for (const family of META_PILOT_PRODUCTS) {
    const members = snapshotFamily(family);
    const parentTitle = snapshotField(members[0].item, 'g:item_group_title');
    const rows = metaCatalogRows({ handle: family.handle, title: parentTitle, description: 'captured', availableForSale: true,
      images: { nodes: [{ url: 'https://example.com/pilot.jpg' }] }, priceRange: { minVariantPrice: { amount: members[0].price, currencyCode: 'USD' } } },
    nativeFamily(family, members));
    assert.equal(rows.length, family.variants.length, 'only the approved variants are published');
    rows.forEach((row, index) => {
      const approved = family.variants[index];
      assert.equal(row[0], approved.contentId);
      assert.equal(row[1], parentTitle, 'the Meta title is the Shopify parent title, never the variant-level title');
      assert.notEqual(row[1], snapshotField(members.find(m => m.variantId === approved.variantId).item, 'g:title'));
      assert.equal(row[1], row[1].slice(0, 150), 'a 150-character feed truncation would not match the untruncated checkout summary title');
      assert.equal(row[10], approved.size);
      assert.equal(row[11], approved.color);
      assert.equal(row[5], `${members.find(member => member.variantId === approved.variantId).price} USD`, 'the captured selling price, not a compare-at price');
      assert.match(row[6], new RegExp(`\\?variant=${approved.variantId.split('/').pop()}$`));
    });
    // The made-to-fit siblings share the parent title but are not approved IDs.
    const unapproved = members.filter(member => !family.variants.some(approved => approved.variantId === member.variantId));
    for (const member of unapproved) assert(!rows.some(row => row[6].endsWith(member.variantId.split('/').pop())), 'custom-fit variant must not be published');
  }
});

test('the feed endpoint serves the full catalog for the captured Shopify pilot shape instead of 503-ing every row', async () => {
  const originalFetch = globalThis.fetch, originalToken = process.env.SHOPIFY_STOREFRONT_TOKEN;
  process.env.SHOPIFY_STOREFRONT_TOKEN = 'test-only';
  const families = META_PILOT_PRODUCTS.map(family => {
    const members = snapshotFamily(family);
    return { family, members, product: { handle: family.handle, title: snapshotField(members[0].item, 'g:item_group_title'),
      description: 'captured', availableForSale: true, images: { nodes: [{ url: 'https://example.com/pilot.jpg' }] },
      priceRange: { minVariantPrice: { amount: members[0].price, currencyCode: 'USD' } } } };
  });
  const ordinary = Array.from({ length: 376 }, (_, i) => ({ handle: `ordinary-${i}`, title: `Title ${i}`, description: `Description ${i}`,
    availableForSale: true, images: { nodes: [{ url: `https://example.com/${i}.jpg` }] }, priceRange: { minVariantPrice: { amount: '50.00', currencyCode: 'USD' } } }));
  globalThis.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    if (request.variables.handle) {
      const entry = families.find(candidate => candidate.family.handle === request.variables.handle);
      return { ok: true, status: 200, json: async () => ({ data: { product: nativeFamily(entry.family, entry.members) } }) };
    }
    return { ok: true, status: 200, json: async () => ({ data: { products: { nodes: [...ordinary, ...families.map(entry => entry.product)],
      pageInfo: { hasNextPage: false, endCursor: null } } } }) };
  };
  let code = 0, body = '', headers = {};
  try {
    await mod.exports.default({ method: 'GET' }, { status(n) { code = n; return this; }, setHeader(k, v) { headers[k] = v; return this; },
      send(value) { body = value; return this; }, end() { return this; } });
    assert.equal(code, 200, 'a drifted pilot option used to fail the whole feed closed with 503');
    assert.equal(headers['X-Catalog-Products'], '387');
    assert.equal(headers['Cache-Control'], 'no-store, max-age=0, must-revalidate');
    for (const entry of families) for (const approved of entry.family.variants) {
      const row = body.split('\r\n').find(line => line.startsWith(`"${approved.contentId}"`));
      assert.ok(row, `${approved.contentId} is missing from the served CSV`);
      assert.ok(row.includes(`"${entry.product.title}"`), `${approved.contentId} does not carry the parent title`);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.SHOPIFY_STOREFRONT_TOKEN; else process.env.SHOPIFY_STOREFRONT_TOKEN = originalToken;
  }
});

test('only Alteration Standard is tolerated; every other native option change still fails closed', () => {
  const family = META_PILOT_PRODUCTS[0];
  const base = { id: family.variants[0].variantId, requiresComponents: false, price: { amount: '108.99', currencyCode: 'USD' } };
  const size = [{ name: 'Size', value: 'S' }], standard = [...size, { name: 'Alteration', value: 'Standard' }];
  assert.equal(verifyMetaPilotVariant(family.handle, { ...base, selectedOptions: size }).contentId, family.variants[0].contentId);
  assert.equal(verifyMetaPilotVariant(family.handle, { ...base, selectedOptions: standard }).contentId, family.variants[0].contentId);
  for (const selectedOptions of [
    [...size, { name: 'Alteration', value: 'Custom' }],
    [...size, { name: 'Alteration', value: 'Made to fit (+$20.00)' }],
    [...size, { name: 'Alteration', value: 'standard' }],
    [...size, { name: 'Extra', value: 'Unchosen' }],
    [...standard, { name: 'Extra', value: 'Unchosen' }],
    [...standard, { name: 'Alteration', value: 'Standard' }],
    [{ name: 'Size', value: 'M' }],
    [{ name: 'Size', value: 'S' }, { name: 'Size', value: 'S' }],
    [],
  ]) assert.throws(() => verifyMetaPilotVariant(family.handle, { ...base, selectedOptions }), /approved configuration/, JSON.stringify(selectedOptions));
  // A family that declares an option with family(..., true) still requires Shopify
  // to carry it: the declared-options check above is exact in both directions.
  assert.throws(() => verifyMetaPilotVariant(family.handle, { ...base, selectedOptions: size, requiresComponents: true }), /approved configuration/);
  assert.throws(() => verifyMetaPilotVariant(family.handle, { ...base, selectedOptions: standard, price: { amount: '108.99', currencyCode: 'INR' } }), /approved configuration/);
});
