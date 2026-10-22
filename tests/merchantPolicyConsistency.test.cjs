const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const test = require('node:test');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const loadTs = (entry, customProductFixture) => {
  const { outputFiles } = buildSync({ entryPoints: [path.join(root, entry)], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', external: customProductFixture ? ['*customizableProducts.json'] : [], jsx: 'automatic', alias: { '@': path.join(root, 'src') } });
  const m = { exports: {} };
  const fixtureRequire = name => customProductFixture && name.endsWith('customizableProducts.json') ? customProductFixture : require(name);
  new Function('require', 'module', 'exports', outputFiles[0].text)(fixtureRequire, m, m.exports);
  return m.exports;
};
const shipping = loadTs('src/config/shippingPolicy.ts');
const returns = loadTs('src/lib/returnPolicyCopy.ts');
let prerenderPromise;
function prerender() {
  return prerenderPromise ||= (async () => {
    const file = path.join(root, 'scripts', `.policy-test-${process.pid}.mjs`);
    // Run the real generator, but not its network/build entrypoint.
    const source = read('scripts/prerender.js').replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { routes, generateHtml };');
    assert.notEqual(source, read('scripts/prerender.js'));
    fs.writeFileSync(file, source);
    try { return await import(pathToFileURL(file).href); }
    finally { fs.unlinkSync(file); }
  })();
}
const template = '<html><head><title>Fixture</title><meta name="description" content="fixture" /></head><body><div id="root"></div></body></html>';
const product = overrides => ({
  id: 'gid://shopify/Product/100', handle: 'policy-fixture', title: 'Blue Silk Saree', productType: 'Saree', vendor: 'LuxeMia',
  description: 'Blue silk saree.', descriptionHtml: '<p>Blue silk saree.</p>', tags: ['facts:source-verified'], availableForSale: true,
  images: { edges: [] }, options: [{ name: 'Size', values: ['Standard'] }],
  priceRange: { minVariantPrice: { amount: '79.08', currencyCode: 'USD' } },
  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/100', title: 'Standard', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'Standard' }], price: { amount: '79.08', currencyCode: 'USD' } } }] },
  ...overrides,
});
function requireStandardTiming(text) {
  assert.match(text, /Orders ship from India/);
  assert.match(text, /3–4 business days/);
  assert.match(text, /9–14 business days after dispatch/);
  assert.match(text, /12–18 business days total/);
  assert.match(text, /separately quoted and confirmed before ordering/);
  assert.match(text, /estimates/);
}
function requireReturnPolicy(text) {
  assert.match(text, /48 hours/);
  assert.match(text, /continuous unboxing\/opening video/);
  assert.doesNotMatch(text, /7 days|7-day|video helps|not<\/em> required/);
}

test('shared shipping estimates and every rate/threshold remain unchanged except confirmed India origin', () => {
  requireStandardTiming(shipping.SHIPPING_TIMING_NOTICE);
  assert.equal(shipping.US_STANDARD_SHIPPING_RATE, 14.99);
  assert.equal(shipping.US_FREE_SHIPPING_THRESHOLD, 150);
  assert.deepEqual(shipping.SHIPPING_ZONES.map(z => [z.standardRate, z.freeShippingThreshold]), [[14.99,150],[24.99,299],[29.99,349],[49.99,null],[59.99,null]]);
});

test('shared claim copy retains the original complete evidence definition', () => {
  assert.equal(returns.RETURN_CLAIM_WINDOW, '48 hours');
  assert.equal(returns.RETURN_EVIDENCE_REQUIREMENT, 'clear photos and a continuous unboxing/opening video showing the unopened package, shipping label, opening process, contents, and item condition');
  for (const text of [returns.RETURN_POLICY_SUMMARY, returns.RETURN_POLICY_FAQ_ANSWER, returns.COVERED_ORDER_ISSUE_ANSWER]) requireReturnPolicy(text);
});

test('Returns page renders the chosen window, required evidence, and preserves unrelated existing remedies', () => {
  const source = read('src/pages/Returns.tsx')
    .replace(/^import (Header|Footer|SEOHead) from .*;$/gm, 'const $1 = () => null;');
  const { outputFiles } = buildSync({ stdin: { contents: source, loader: 'tsx', resolveDir: root }, bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', jsx: 'automatic', alias: { '@': path.join(root, 'src') } });
  const m = { exports: {} }; new Function('require','module','exports', outputFiles[0].text)(require,m,m.exports);
  const html = renderToStaticMarkup(React.createElement(m.exports.default));
  requireReturnPolicy(html);
  assert.match(html, /video is required/);
  assert.match(html, /unopened package, shipping label, opening process, contents, and item condition/);
  assert.match(html, /\$30 alteration credit/);
  assert.match(html, /Full refund or replacement, your choice/);
  assert.match(html, /consumer rights or remedies/);
});

test('DeliveryEstimate preserves custom/tailoring exceptions while disclosing India in every branch', () => {
  const { DeliveryEstimate } = loadTs('src/components/product/DeliveryEstimate.tsx');
  const render = props => renderToStaticMarkup(React.createElement(DeliveryEstimate, { hasStitching: false, ...props }));
  requireStandardTiming(render({}));
  for (const props of [{ isMadeToOrder:true },{ isUnstitched:true },{ confirmAvailability:true },{ requiresTailoringTimingConfirmation:true },{ shipsWithinDays:6 }]) {
    const html = render(props);
    assert.match(html,/Orders ship from India/);
    assert.doesNotMatch(html,/12–18 business days total/);
  }
  assert.match(render({hasStitching:true}),/add processing time/);
});

test('real crawler shipping, customs, FAQ and return pages agree with shared shopper policy', async () => {
  const { routes, generateHtml } = await prerender();
  for (const url of ['/shipping','/pages/shipping-customs','/faq']) {
    const route = routes.find(r => r.path === url); assert(route);
    requireStandardTiming(generateHtml(template,route,new Map()));
  }
  for (const url of ['/returns','/faq']) {
    const route = routes.find(r=>r.path===url);
    const html = generateHtml(template,route,new Map());
    requireReturnPolicy(html);
    assert.match(html,/orders ship from India/i);
    if (url === '/returns') assert(html.includes(returns.RETURN_EVIDENCE_REQUIREMENT), 'canonical return page contains the full evidence definition, not a self-referencing FAQ');
  }
});

test('real crawler product HTML and FAQ schema use the same timing and return terms without touching prices', async () => {
  const { generateHtml } = await prerender();
  const p = product();
  const html = generateHtml(template,{path:'/product/policy-fixture',title:p.title,h1:p.title,description:p.description,product:p},new Map());
  requireStandardTiming(html); requireReturnPolicy(html);
  assert.match(html,/Ships from/); assert.match(html,/India/);
  assert.match(html,/79\.08/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
  const faq = schemas.find(s=>s['@type']==='FAQPage'); assert(faq);
  requireStandardTiming(faq.mainEntity.find(q=>q.name==='How is this product shipped?').acceptedAnswer.text);
  requireReturnPolicy(faq.mainEntity.find(q=>q.name==='What is the return policy?').acceptedAnswer.text);
});

test('product-specific dispatch and made-to-order branches do not inherit the standard total promise', async () => {
  const { generateHtml } = await prerender();
  for (const overrides of [{ shipsWithinMetafield:{value:'6'} }, { tags:['made to order'] }]) {
    const p=product(overrides);
    const html=generateHtml(template,{path:'/product/policy-fixture',title:p.title,h1:p.title,description:p.description,product:p},new Map());
    assert.doesNotMatch(html,/12–18 business days total/);
    if (overrides.shipsWithinMetafield) assert.match(html,/Ships within 6 business days/);
    if (overrides.tags) assert.match(html,/Made to order. Confirm production/);
    assert.match(html,/Ships from/);requireReturnPolicy(html);
  }
});

test('crawler confirmation and unstitched guards override default and explicit product dispatch windows', async () => {
  const { generateHtml } = await prerender();
  for (const tag of ['availability:Confirm before ordering', 'construction:Unstitched']) {
    for (const shipsWithinMetafield of [undefined, {value:'6'}]) {
      const p = product({tags:[tag], shipsWithinMetafield});
      const html = generateHtml(template,{path:'/product/policy-fixture',title:p.title,h1:p.title,description:p.description,product:p},new Map());
      const schemas = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
      const faq = schemas.find(s=>s['@type']==='FAQPage');
      const answer = faq.mainEntity.find(q=>q.name==='How is this product shipped?').acceptedAnswer.text;
      for (const text of [html,answer]) {
        assert.doesNotMatch(text,/3–4 business days|12–18 business days total|Ships within 6 business days/);
        assert.match(text,/Confirm .*availability/);
        if(tag==='construction:Unstitched') assert.match(text,/supplied unstitched/);
      }
      assert.match(html,/Ships from/);requireReturnPolicy(html);
    }
  }
});

test('runtime crawler HTML uses shared timing and return terms with product-specific exceptions', () => {
  const { generateProductHtml } = loadTs('src/middleware/htmlGenerator.ts');
  const native = product({
    title: 'Blue Silk Lehenga',
    options: [{name:'Stitching',values:['Unstitched (Fabric Only)','Standard Stitched','Custom Stitched']},{name:'Size',values:['Fabric Only','32','Custom Fit']}],
    variants: {edges: [['Unstitched (Fabric Only)','Fabric Only'],['Standard Stitched','32'],['Custom Stitched','Custom Fit']].map(([stitching,size],i)=>({node:{...product().variants.edges[0].node,id:`gid://shopify/ProductVariant/${i+1}`,selectedOptions:[{name:'Stitching',value:stitching},{name:'Size',value:size}]}}))},
  });
  const render = p => generateProductHtml(p,'https://luxemia.shop/product/policy-fixture');
  requireStandardTiming(render(product()));
  requireStandardTiming(render(product({variants:{edges:[{node:{...product().variants.edges[0].node,selectedOptions:undefined}}]}})));
  const mapped = loadTs('src/middleware/htmlGenerator.ts', [{handle:'policy-fixture',sku:'fixture',title:'Custom fixture',etsyUrl:'',imageId:''}]).generateProductHtml(product(),'https://luxemia.shop/product/policy-fixture');
  assert.match(mapped,/4–5 week total order window/);
  assert.doesNotMatch(mapped,/12–18 business days total/);requireReturnPolicy(mapped);
  assert.match(render(product({shipsWithinMetafield:{value:'6'}})),/Ships within 6 business days/);
  for (const p of [native,product({tags:['made to order']}), ...['availability:Confirm before ordering','construction:Unstitched'].flatMap(tag=>[product({tags:[tag]}),product({tags:[tag],shipsWithinMetafield:{value:'6'}})])]) {
    const html = render(p);
    assert.doesNotMatch(html,/3–4 business days|12–18 business days total|Ships within 6 business days/);
    assert.match(html,/Confirm /);
    assert.match(html,/<dt>Ships from<\/dt><dd>India/);
    assert.match(html,/79.08/);requireReturnPolicy(html);
  }
});

test('actual middleware entry typechecks with NodeNext resolution and no Vite alias support', () => {
  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--noEmit', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--esModuleInterop', '--resolveJsonModule', '--strict', '--skipLibCheck', 'middleware.ts'], {cwd:root,stdio:'pipe'});
});

test('build-time route rewriting retains shared timing expressions on repeated runs', () => {
  const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'luxemia-policy-codemod-'));
  try {
    fs.mkdirSync(path.join(fixture,'scripts'));
    for(const file of ['scripts/finalize-prerender-routes.cjs','scripts/generate-routes.cjs','scripts/prerender.js']) fs.copyFileSync(path.join(root,file),path.join(fixture,file));
    execFileSync(process.execPath,[path.join(fixture,'scripts/finalize-prerender-routes.cjs')]);
    const once=fs.readFileSync(path.join(fixture,'scripts/prerender.js'),'utf8');
    execFileSync(process.execPath,[path.join(fixture,'scripts/finalize-prerender-routes.cjs')]);
    assert.equal(fs.readFileSync(path.join(fixture,'scripts/prerender.js'),'utf8'),once);
    assert.equal((once.match(/<p>\$\{escapeHtml\(SHIPPING_TIMING_NOTICE\)\}/g)||[]).length,3);
  } finally { fs.rmSync(fixture,{recursive:true,force:true}); }
});
