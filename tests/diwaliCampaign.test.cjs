const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const sharp = require('sharp');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {MemoryRouter} = require('react-router-dom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
async function component(file) {
  const result = await esbuild.build({entryPoints:[path.join(root,file)],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')},loader:{'.css':'empty'}});
  const m={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(require,m,m.exports);return m.exports.default;
}
const render = (C, props={}) => renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(C,props)));
test('approved artwork bytes/dimensions match manifest and use active non-retired product photos', async()=>{
 const manifest=JSON.parse(read('docs/campaigns/diwali-20261026.json'));
 const archived=require('../scripts/product-age-archive-20261026.json').archived;
 for(const source of manifest.sources) assert.ok(!archived.some(p=>p.handle===source.handle || p.id.endsWith('/'+source.pid)));
 const assets=manifest.assets.filter(a=>/\.(webp|jpg)$/.test(a.filename));assert.equal(assets.length,8);
 for(const a of assets){const b=fs.readFileSync(path.join(root,'public/images/campaigns',a.filename));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);const m=await sharp(b).metadata();assert.deepEqual([m.width,m.height],a.dimensions);assert.ok(b.length<800000,a.filename);}
});
test('homepage and New Arrivals use evergreen current-product copy with working CTAs', async()=>{
 const html=render(await component('src/components/home/NewArrivalsBanner.tsx'));
 assert.match(html,/href="\/new-arrivals"/);
 assert.match(html,/<h2>New Arrivals<\/h2>/);
 assert.match(html,/grey-georgette-embroidered-wedding-lehenga-choli/);
 assert.match(html,/unstitched/);
 assert.doesNotMatch(html,/Diwali|Dussehra|luxemia-new-arrivals-2026|luxemia-diwali|Next banner|Previous banner/);
 const C=await component('src/components/home/NewArrivalsEditorial.tsx');const page=render(C,{pageHero:true});
 assert.match(page,/<h1>New Arrivals<\/h1>/);assert.match(page,/href="#new-arrivals-products"/);
 assert.match(read('src/components/home/NewArrivalsEditorial.css'),/object-fit:contain/);
 assert.match(read('src/components/home/NewArrivalsEditorial.css'),/grid-template-columns:1fr/);
});
test('preload and performance gate cannot reintroduce retired seasonal creative',()=>{
 const index=read('index.html');
 assert.match(index,/Grey-Georgette-Wedding-Wear-Embroidery-Work-Lehenga-Choli/);
 assert.doesNotMatch(index,/luxemia-diwali|luxemia-new-arrivals-2026/);
 assert.match(index,/\[data-home-hero\]\{height:auto;min-height:0/);
 assert.doesNotMatch(index,/\[data-home-hero\]\{height:(?:620px|min\(78vh)/);
 assert.doesNotMatch(read('scripts/apply-storefront-performance-fix.cjs'),/luxemia-diwali|luxemia-new-arrivals-2026/);
 for(const p of ['src/components/seo/InternalLinkBlock.tsx','src/components/seo/RelatedOccasions.tsx','src/components/seo/SEOFooterContent.tsx']) assert.doesNotMatch(read(p),/diwali/i,p);
 assert.match(read('src/App.tsx'),/diwali-outfits/);
});
