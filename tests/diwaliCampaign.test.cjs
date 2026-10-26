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
test('homepage starts with responsive Diwali artwork and accessible live CTA without old overlay', async()=>{
 const html=render(await component('src/components/home/NewArrivalsBanner.tsx'));
 assert.match(html,/href="\/collections\/diwali-outfits"/);assert.match(html,/aria-label="Diwali - Shop Diwali styles"/);
 assert.match(html,/<h2 class="sr-only">Diwali<\/h2>/);assert.equal((html.match(/data-hero-image/g)||[]).length,1);
 assert.match(html,/luxemia-diwali-2026-desktop.webp/);assert.match(html,/luxemia-diwali-2026-mobile.jpg/);assert.match(html,/media="\(min-width: 640px\)"/);
 assert.doesNotMatch(html,/Dussehra|navratri-lehenga|arrivals-editorial__copy|data-hero-content/);
 assert.match(html,/focus-visible:outline-offset-\[-5px\]/);assert.match(html,/Previous banner/);assert.match(html,/Next banner/);assert.match(html,/New Arrivals/);
 assert.match(read('src/components/home/NewArrivalsBanner.tsx'),/aspect-\[2\/3\].*sm:aspect-\[3\/1\]/);
});
test('New Arrivals page preserves h1, full image and in-page product CTA',async()=>{
 const C=await component('src/components/home/NewArrivalsEditorial.tsx');const html=render(C,{pageHero:true});
 assert.match(html,/<h1 class="sr-only">New Arrivals<\/h1>/);assert.match(html,/href="#new-arrivals-products"/);
 assert.match(html,/luxemia-new-arrivals-2026-desktop.webp/);assert.match(html,/luxemia-new-arrivals-2026-mobile.jpg/);
 assert.match(read('src/components/home/NewArrivalsEditorial.css'),/object-fit:contain/);
 assert.match(read('src/components/home/NewArrivalsEditorial.css'),/aspect-ratio:2\/3/);
 assert.match(render(C),/href="\/new-arrivals"/);assert.doesNotMatch(html,/arrivals-editorial__copy/);
});
test('preload finalizer and performance gate agree on the active first creative',()=>{
 for(const p of ['index.html','scripts/apply-storefront-performance-fix.cjs','scripts/validate-storefront-performance.cjs']){
 const s=read(p);assert.ok(s.includes('/images/campaigns/luxemia-diwali-2026-mobile.webp'),p);assert.ok(s.includes('/images/campaigns/luxemia-diwali-2026-desktop.webp'),p);assert.ok(!s.includes('/images/hero-carousel/navratri-lehenga'),p);
 }
});
