const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');
const plan = require('../scripts/product-age-archive-20261026.json');
const ownerArchive = require('../scripts/product-owner-archive-20261028.json');
const ownerIds = new Set(ownerArchive.archived.map(p => p.id));
const archived = require('../src/data/reversiblyArchivedProductHandles.json');
const { isReversiblyArchivedProduct } = require('../src/lib/reversibleProductArchive.cjs');
const baseline = require('../scripts/product-retirement-20260908.json');
const root = path.resolve(__dirname, '..');
test('fixed authorized age batch is exact, reversible, and preserves current merchandise and service', () => {
  assert.equal(plan.archived.length, 147);
  assert.equal(new Set(plan.archived.map(p => p.id)).size, 147);
  assert.equal(plan.retainedProductIds.length, 332);
  const inventory=require('../scripts/approved-sitemap-inventory.json');
  assert.ok(inventory.urlCount >= baseline.retained.length);
  for(const p of baseline.retained) assert.ok(inventory.paths.includes(`/product/${p.handle}`));
  assert.deepEqual(new Set(baseline.retained.map(p => p.id)), new Set(plan.retainedProductIds.filter(id => !ownerIds.has(id))));
  assert.equal(plan.ageRule.strictlyBefore, '2026-09-21T14:34:56Z');
  for (const p of plan.archived) {
    assert.ok(p.createdAt < plan.ageRule.strictlyBefore);
    assert.notEqual(p.id, plan.preservedServiceId);
    assert.ok(isReversiblyArchivedProduct(p.handle));
  }
  assert.deepEqual(new Set(archived), new Set([...plan.archived.map(p => p.handle), ...plan.archivedAliases.map(p => p.handle), ...ownerArchive.archived.map(p => p.handle)]));
  assert.equal(isReversiblyArchivedProduct('luxemia-tailoring-saree-finishing-add-ons'), false);
  assert.equal(isReversiblyArchivedProduct('unrelated-new-product'), false);
  assert.equal(baseline.retired.length, 1300);
  assert.equal(baseline.reversiblyArchived.length, 162);
});
test('real middleware rejects archives before stale prerender/live lookup and retains unrelated response paths', async () => {
  let lookups = 0;
  const output = await build({entryPoints:[path.join(root,'middleware.ts')],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',plugins:[{
    name:'archive-fixtures', setup(b) {
      b.onResolve({filter:/^(?:@vercel\/functions|\.\/src\/lib\/(?:prerenderManifest|autoRoutes|goneRoutes)\.js|\.\/src\/middleware\/(?:shopifyProxy|htmlGenerator)\.js)$/}, a => ({path:a.path,namespace:'fixture'}));
      b.onLoad({filter:/.*/,namespace:'fixture'}, ({path:p}) => ({loader:'js',contents:
        p==='@vercel/functions' ? 'export const rewrite = u => new Response(null,{headers:{"x-rewrite":u.toString()}});export const next=()=>new Response(null);' :
        p.endsWith('prerenderManifest.js') ? `export const PRERENDERED_PRODUCT_HANDLES=new Set(${JSON.stringify([...archived,'retained-fixture'])});` :
        p.endsWith('autoRoutes.js') ? 'export const PRERENDERED_ROUTES=new Set();' :
        p.endsWith('goneRoutes.js') ? 'export const GONE_PRODUCT_HANDLES=new Set(["permanently-retired-fixture"]);' :
        p.endsWith('htmlGenerator.js') ? 'export const return404=()=>new Response("Not found",{status:404,headers:{"X-Robots-Tag":"noindex, follow"}});export const generateProductHtml=()=>"unexpected";' :
        'export const fetchProductByHandle=async()=>{archiveLookup();return {status:"not_found"};};'
      }));
    }
  }]});
  const m={exports:{}};new Function('require','module','exports','archiveLookup',output.outputFiles[0].text)(require,m,m.exports,()=>lookups++);
  for(const handle of archived) for(const suffix of ['', '?variant=123&utm_source=dot_qa']) {
    const r=await m.exports.default(new Request(`https://luxemia.shop/product/${handle}${suffix}`));
    assert.equal(r.status,404,handle);assert.match(r.headers.get('x-robots-tag'),/noindex/);assert.doesNotMatch(await r.text(),/ProductGroup|InStock|Add to cart/);
  }
  assert.equal(lookups,0);
  const retained=await m.exports.default(new Request('https://luxemia.shop/product/retained-fixture'));
  assert.match(retained.headers.get('x-rewrite'),/retained-fixture.html/);
  const permanent=await m.exports.default(new Request('https://luxemia.shop/product/permanently-retired-fixture'));
  assert.equal(permanent.status,410);
});
test('checked-in shopping links and public exports contain no exact archived paths', () => {
  for (const file of ['src/data/blogPosts.ts','src/data/seoGrowthBlogPosts.ts','public/feeds/meta-catalog.csv','public/LUXEMIA-115-PRODUCTS-COLOR-VARIANTS-SEP19.txt','public/LUXEMIA-CATALOG-FIXED.txt','public/LUXEMIA-CATALOG-v2-FIXED.csv']) {
    const text=fs.readFileSync(path.join(root,file),'utf8');
    for (const p of plan.archived) assert.ok(!text.includes(p.handle),`${file}: ${p.handle}`);
  }
});

test('inventory-dependent MTO floor follows the exact archive without changing classification', () => {
  assert.equal(plan.fulfillmentBaseline.minimumProductLevelMadeToOrderProducts, 0);
  assert.deepEqual(plan.fulfillmentBaseline.archivedProductLevelMadeToOrderIds, ['gid://shopify/Product/8959758434475']);
  assert.ok(plan.archived.some(p => p.id === plan.fulfillmentBaseline.archivedProductLevelMadeToOrderIds[0]));
  const source=fs.readFileSync(path.join(root,'scripts/validate-shopify-catalog-hygiene.cjs'),'utf8');
  const vm=require('node:vm');
  const declarations=source.slice(source.indexOf('const MADE_TO_ORDER_TAGS'),source.indexOf('function hasReadyToShipTag'));
  const context=vm.createContext({});vm.runInContext(declarations,context);
  assert.equal(vm.runInContext("isMadeToOrder({tags:['availability:Made to Order']})",context),true);
  assert.equal(vm.runInContext("isMadeToOrder({tags:['custom-made']})",context),true);
  assert.equal(vm.runInContext("isMadeToOrder({tags:['ready to ship'],options:[{name:'Size',values:['Custom']}]})",context),false);
  assert.ok(source.includes('onlyCustomSize && !madeToOrder'));
  assert.ok(source.includes('madeToOrder && hasReadyToShipTag(product)'));
  assert.ok(source.includes('readyToShipProducts + madeToOrderProducts !== purchasableProducts'));
});

test('owner removal batch is exactly nine reversible archives and keeps a 379-product active floor', () => {
  assert.deepEqual(ownerArchive.archived.map(p=>p.handle), [
    'kids-onam-set-maroon','kids-onam-set-orange','kids-onam-set-purple',
    'magenta-velvet-floral-embroidered-suit','pink-silk-botanical-embroidered-palazzo-suit',
    'crepe-paisley-embroidered-suit','maroon-crepe-embroidered-suit-with-floral-trousers',
    'wine-silk-floral-embroidered-sharara-suit','purple-silk-bird-embroidered-sharara-suit',
  ]);
  assert.equal(ownerIds.size,9);
  assert.equal(ownerArchive.minimumExpectedActiveProducts,379);
  assert.equal(baseline.retained.length,329);
  for(const p of ownerArchive.archived) {
    assert.ok(baseline.reversiblyArchived.some(a=>a.id===p.id&&a.handle===p.handle));
    assert.ok(!baseline.retained.some(a=>a.id===p.id));
    assert.ok(!baseline.retired.some(a=>a.id===p.id));
    assert.ok(isReversiblyArchivedProduct(p.handle));
  }
  const source=fs.readFileSync(path.join(root,'scripts/validate-shopify-catalog-hygiene.cjs'),'utf8');
  assert.match(source,/Math\.max\(retirement\.retained\.length,[\s\S]*?minimumExpectedActiveProducts\)/);
  assert.match(source,/if \(missing\.length \|\| resurfaced\.length\) throw new Error/);
});
