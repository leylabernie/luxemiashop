const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const root = path.resolve(__dirname, '..');
const generator = fs.readFileSync(path.join(root, 'scripts/generate-static-feed.cjs'), 'utf8');
const validator = fs.readFileSync(path.join(root, 'scripts/validate-merchant-feed.cjs'), 'utf8');
const taxonomy = stripTypeScriptTypes(fs.readFileSync(path.join(root, 'src/lib/merchantTaxonomy.ts'), 'utf8')).replace(/export /g, '');
// Exercise exact source sections without running network/build side effects.
const helpers = generator.slice(generator.indexOf('function isValidGtin('), generator.indexOf('/** Simple string hash'));
const start = generator.indexOf('  const gtin = normalizeGtin(variant.barcode);');
const expression = generator.slice(start, generator.indexOf('  const patternTag =', start));
const render = vm.runInNewContext(`${helpers}\n(variant, brand) => { const BRAND_NAME='LuxeMia'; const escapeXml = s => s; ${expression} return identifiers; }`);
const loopStart = validator.indexOf('for (const rawItem of itemBlocks) {', validator.indexOf('const identifierFailures'));
const loopEnd = validator.indexOf('if (requiredTagFailures.length > 0)', loopStart);
assert.ok(loopStart > 0 && loopEnd > loopStart, 'source extraction boundaries exist');
const validate = vm.runInNewContext(`${taxonomy}\n${helpers}\n(itemBlocks) => { const identifierFailures=[]; const requiredTagFailures=[]; const tagCount=(s,t)=>(s.match(new RegExp('<'+t+'>','g'))||[]).length; ${validator.slice(loopStart, loopEnd)} return [...requiredTagFailures,...identifierFailures]; }`);
function item(extra='', brand='LuxeMia', category='8248') {
 return `<item><g:id>test</g:id><g:title>Garment</g:title><g:description>Garment details</g:description><g:link>https://luxemia.shop/product/test</g:link><g:image_link>https://luxemia.shop/test.jpg</g:image_link><g:availability>in_stock</g:availability><g:price>10 USD</g:price><g:condition>new</g:condition><g:brand>${brand}</g:brand><g:google_product_category>${category}</g:google_product_category>${extra}</item>`;
}
test('valid GTIN retained; invalid checksum and supplier barcode never exported as GTIN', () => {
 assert.equal(render({barcode:'4006381333931',sku:null},'LuxeMia'),'<g:gtin>4006381333931</g:gtin>');
 for(const barcode of ['4006381333932','ws-leh-001-REA-BUST-42']) assert.equal(render({barcode,sku:null},'LuxeMia'),'');
 assert.equal(validate([item('<g:gtin>4006381333931</g:gtin>')]).length,0);
 assert.ok(validate([item('<g:gtin>4006381333932</g:gtin>')]).some(x=>x.includes('invalid GTIN')));
});
test('branded clothing with unknown identifiers omits unsupported no and validates', () => {
 assert.equal(render({barcode:null,sku:null},'LuxeMia'),'');
 assert.equal(validate([item()]).length,0);
 assert.ok(validate([item('<g:identifier_exists>no</g:identifier_exists>')]).some(x=>x.includes('branded clothing')));
});
test('missing brand does not manufacture identifier_exists=no and fails validation', () => {
 assert.equal(render({barcode:null,sku:null},''),'');
 assert.ok(validate([item('','')]).some(x=>x.includes('missing verified brand')));
});
test('other categories retain identifier requirements; existing MPN output stays unchanged', () => {
 assert.ok(validate([item('','LuxeMia','188')]).some(x=>x.includes('missing verified GTIN/MPN')));
 assert.equal(render({barcode:null,sku:'LM-15065-32'},'LuxeMia'),'<g:mpn>LM-15065-32</g:mpn>');
 assert.equal(validate([item('<g:mpn>LM-15065-32</g:mpn>')]).length,0);
 assert.ok(validate([item('<g:mpn>LM-15065-32</g:mpn><g:identifier_exists>no</g:identifier_exists>')]).some(x=>x.includes('conflicts')));
});
test('live response impact: only 1,427 unsupported no tags change; 3,657 offers retained', { skip: !process.env.MERCHANT_IDENTIFIER_LIVE_FIXTURE }, () => {
 const feed=fs.readFileSync(process.env.MERCHANT_IDENTIFIER_LIVE_FIXTURE,'utf8');
 const before=feed.match(/<item>[\s\S]*?<\/item>/g)||[];
 const after=before.map(s=>s.replace(/\s*<g:identifier_exists>no<\/g:identifier_exists>/g,''));
 assert.equal(before.length,3657);
 assert.equal(before.filter((s,i)=>s!==after[i]).length,1427);
 assert.equal(validate(after).length,0);
 assert.equal((after.join('').match(/<g:mpn>/g)||[]).length,2230);
 assert.equal((after.join('').match(/<g:gtin>/g)||[]).length,0);
});
