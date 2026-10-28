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
  assert.match(html, /Alteration and store credits are not offered/);
  assert.match(html, /Full refund or replacement, your choice/);
  assert.match(html, /consumer rights or remedies/);
  assert.doesNotMatch(html, /30[-– ]day returns|no-questions-asked|fake returns policy/i);
  assert.match(html, /Change-of-mind returns are not accepted, except where applicable law provides otherwise/);
  assert.match(html, /Items that arrive damaged, defective, wrong, not as described, or with missing pieces remain covered under the reporting process below/);
  assert.match(html, /Not returnable for change of mind once stitching starts/);
  assert.match(html, /24 hours/);
  assert.match(html, /This reporting process does not limit any consumer rights or remedies that cannot legally be excluded/);
});

test('DeliveryEstimate preserves custom/tailoring exceptions while disclosing India in every branch', () => {
  const { DeliveryEstimate } = loadTs('src/components/product/DeliveryEstimate.tsx');
  const render = props => renderToStaticMarkup(React.createElement(DeliveryEstimate, { hasStitching: false, ...props }));
  requireStandardTiming(render({}));
  for (const props of [{ isMadeToOrder:true },{ requiresTailoringTimingConfirmation:true },{ shipsWithinDays:6 }]) {
    const html = render(props);
    assert.match(html,/Orders ship from India/);
    assert.doesNotMatch(html,/12–18 business days total/);
  }
  assert.match(render({hasStitching:true}),/add 3 business days once/);
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
    if (overrides.shipsWithinMetafield) assert.doesNotMatch(html,/12–18 business days total/);
    if (overrides.shipsWithinMetafield) assert.match(html,/Ships within 6 business days/);
    if (overrides.tags) { assert.match(html,/15–21 business days total/); assert.doesNotMatch(html,/Made to order. Confirm production/); }
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
        assert.match(text,/add 3 business days once/);
        if (shipsWithinMetafield) assert.match(text,/Ships within 6 business days/);
        if (tag==='availability:Confirm before ordering') assert.match(text,/Confirm .*availability/);
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
  assert.doesNotMatch(mapped,/4–5 week total order window/);
  assert.match(mapped,/15–21 business days total/);requireReturnPolicy(mapped);
  assert.match(render(product({shipsWithinMetafield:{value:'6'}})),/Ships within 6 business days/);
  for (const p of [native,product({tags:['made to order']}), ...['availability:Confirm before ordering','construction:Unstitched'].flatMap(tag=>[product({tags:[tag]}),product({tags:[tag],shipsWithinMetafield:{value:'6'}})])]) {
    const html = render(p);
    assert.match(html,/add 3 business days once/);
    assert.doesNotMatch(html,/Made to order\. Confirm production/);
    assert.match(html,/<dt>Ships from<\/dt><dd>India/);
    assert.match(html,/79.08/);requireReturnPolicy(html);
  }
});

test('actual middleware entry typechecks with NodeNext resolution and no Vite alias support', () => {
  assert.doesNotMatch(read('src/lib/customizableProductStatus.ts'), /from .*\.json' with \{/); // Vercel's final Edge parser predates import attributes.
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

test('shipping processing clarification is identical in rendered shopper and initial HTML', async () => {
  const expected = shipping.SHIPPING_PROCESSING_NOTICE;
  assert.match(expected, /semi-stitched or ready stitched/);
  assert.match(expected, /add 3 business days once/);
  assert.doesNotMatch(expected, /made-to-order/);
  assert.equal(shipping.SHIPPING_PROCESSING_NOTICE, expected);
  const source = read('src/pages/Shipping.tsx')
    .replace(/^import (Header|Footer|SEOHead) from .*;$/gm, 'const $1 = () => null;');
  const { outputFiles } = buildSync({ stdin: { contents: source, loader: 'tsx', resolveDir: root }, bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', jsx: 'automatic', alias: { '@': path.join(root, 'src') } });
  const m = { exports: {} }; new Function('require','module','exports', outputFiles[0].text)(require,m,m.exports);
  const shopperHtml = renderToStaticMarkup(React.createElement(m.exports.default));
  const { routes, generateHtml } = await prerender();
  const initialHtml = generateHtml(template, routes.find(r=>r.path==='/shipping'), new Map());
  for (const html of [shopperHtml, initialHtml]) {
    assert.equal(html.split(expected).length - 1, 1);
    assert.doesNotMatch(html, /All items are ready to ship/);
    requireStandardTiming(html);
    assert.match(html, /14\.99/);
    assert.match(html, /150/);
  }
});

test('build-time route finalization preserves the shipping processing qualifier', () => {
  const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'luxemia-processing-codemod-'));
  try {
    fs.mkdirSync(path.join(fixture,'scripts'));
    for (const file of ['scripts/finalize-prerender-routes.cjs','scripts/generate-routes.cjs','scripts/prerender.js']) fs.copyFileSync(path.join(root,file),path.join(fixture,file));
    for(let i=0;i<2;i++) {
      execFileSync(process.execPath,[path.join(fixture,'scripts/finalize-prerender-routes.cjs')]);
      const source=fs.readFileSync(path.join(fixture,'scripts/prerender.js'),'utf8');
      assert.equal((source.match(/<p>\$\{escapeHtml\(SHIPPING_PROCESSING_NOTICE\)\}<\/p>/g)||[]).length,1);
    }
  } finally { fs.rmSync(fixture,{recursive:true,force:true}); }
});

test('returns initial HTML and rendered shopper page contain no unsupported resale or credit promises', async () => {
  const source = read('src/pages/Returns.tsx')
    .replace(/^import (Header|Footer|SEOHead) from .*;$/gm, 'const $1 = () => null;');
  const { outputFiles } = buildSync({ stdin: { contents: source, loader: 'tsx', resolveDir: root }, bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', jsx: 'automatic', alias: { '@': path.join(root, 'src') } });
  const m = { exports: {} }; new Function('require','module','exports', outputFiles[0].text)(require,m,m.exports);
  const shopperHtml = renderToStaticMarkup(React.createElement(m.exports.default));
  const { routes, generateHtml } = await prerender();
  const initialHtml = generateHtml(template, routes.find(r=>r.path==='/returns'), new Map());
  for (const html of [shopperHtml, initialHtml]) {
    assert.doesNotMatch(html, /resell|resale|pre-loved|100%|30(?:–|&ndash;|-)60/i);
    assert.doesNotMatch(html, /\$30 alteration credit|refund up to \$30|store credit refund/i);
    requireReturnPolicy(html);
  }
  // Owner rejects credit offers; preserve genuine remedies and pending cancellation terms.
  assert.match(shopperHtml, /Alteration and store credits are not offered/);
  assert.match(shopperHtml, /24 hours of ordering/);
  assert.match(shopperHtml, /10–20%/);
  assert.match(shopperHtml, /Full refund or replacement, your choice/);
});

test('US import coverage is destination-qualified and leaves non-US fees and all rates unchanged', () => {
  assert.equal(shipping.US_IMPORT_COVERAGE_NOTICE, 'For US deliveries, no tariffs or import fees are collected at your doorstep. Applicable sales tax is calculated at checkout.');
  assert.equal(shipping.SHIPPING_ZONES[0].duties, shipping.US_IMPORT_COVERAGE_NOTICE);
  for (const zone of shipping.SHIPPING_ZONES.slice(1)) {
    assert.equal(zone.duties, 'Duties, import taxes, brokerage and carrier fees may apply unless checkout states otherwise.');
    assert.doesNotMatch(zone.duties, /no tariffs or import fees|collected at your doorstep/);
  }
  assert.match(shipping.DESTINATION_IMPORT_NOTICE, /Outside the United States, the customer is responsible/);
  assert(read('src/config/usaLandingPage.json').includes(shipping.US_IMPORT_COVERAGE_NOTICE));
  for (const file of ['src/components/cart/CartDrawer.tsx', 'src/components/product/ProductInfo.tsx', 'src/pages/Shipping.tsx', 'src/pages/ShippingCustoms.tsx']) {
    assert.match(read(file), /\{DESTINATION_IMPORT_NOTICE\}/);
  }
  assert.doesNotMatch(read('src/components/cart/CartDrawer.tsx'), /Subtotal excludes shipping, taxes and duties/);
  assert.match(read('src/components/product/ProductInfo.tsx'), /For deliveries outside the United States, import-charge treatment must be confirmed/);
  assert.doesNotMatch(read('src/components/product/ProductInfo.tsx'), /fulfilled cross-border, import-charge/);
});

test('rendered customs and country pages distinguish US import coverage from other destinations', () => {
  const { MemoryRouter } = require('react-router-dom');
  function renderPage(file, route) {
    const source = read(file).replace(/^import (Header|Footer|SEOHead) from .*;$/gm, 'const $1 = () => null;');
    const { outputFiles } = buildSync({ stdin: {contents:source,loader:'tsx',resolveDir:root},bundle:true,write:false,format:'cjs',platform:'node',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')} });
    const m={exports:{}};new Function('require','module','exports',outputFiles[0].text)(require,m,m.exports);
    return renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[route]},React.createElement(m.exports.default)));
  }
  const customs = renderPage('src/pages/ShippingCustoms.tsx','/pages/shipping-customs');
  assert(customs.includes(shipping.US_IMPORT_COVERAGE_NOTICE));
  assert(customs.includes(shipping.NON_US_IMPORT_NOTICE));
  const us = renderPage('src/pages/SemanticCommercePage.tsx','/shipping/united-states');
  assert(us.includes(shipping.US_IMPORT_COVERAGE_NOTICE));
  assert.doesNotMatch(us,/does not promise that a shipment will be free/);
  const canada = renderPage('src/pages/SemanticCommercePage.tsx','/shipping/canada');
  assert.doesNotMatch(canada,/no tariffs or import fees|collected at your doorstep/);
  assert.match(canada,/Duties, import taxes, brokerage and carrier fees may apply/);
});

test('crawler shipping and customs pages preserve US/non-US import distinction', async () => {
  const { routes, generateHtml } = await prerender();
  for (const url of ['/shipping','/pages/shipping-customs','/shipping/united-states']) {
    const route=routes.find(r=>r.path===url);assert(route);
    const html=generateHtml(template,route,new Map());
    assert(html.includes(shipping.US_IMPORT_COVERAGE_NOTICE),url);
    if (url !== '/shipping/united-states') assert(html.includes(shipping.NON_US_IMPORT_NOTICE));
  }
  const canada = generateHtml(template,routes.find(r=>r.path==='/shipping/canada'),new Map());
  assert.doesNotMatch(canada,/no tariffs or import fees|collected at your doorstep/);
});

test('repeated route rewriting retains import coverage expressions', () => {
  const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'luxemia-import-codemod-'));
  try {
    fs.mkdirSync(path.join(fixture,'scripts'));
    for(const file of ['scripts/finalize-prerender-routes.cjs','scripts/generate-routes.cjs','scripts/prerender.js']) fs.copyFileSync(path.join(root,file),path.join(fixture,file));
    for(let i=0;i<2;i++) {
      execFileSync(process.execPath,[path.join(fixture,'scripts/finalize-prerender-routes.cjs')]);
      const source=fs.readFileSync(path.join(fixture,'scripts/prerender.js'),'utf8');
      assert.equal((source.match(/escapeHtml\(DESTINATION_IMPORT_NOTICE\)/g)||[]).length,2);
      assert.match(source,/path === '\/shipping\/united-states' \? US_IMPORT_COVERAGE_NOTICE/);
      assert.doesNotMatch(source,/These charges are the customer’s responsibility unless checkout/);
    }
  } finally { fs.rmSync(fixture,{recursive:true,force:true}); }
});

test('hydrated ProductInfo derives included pieces from raw catalog HTML despite SEO display enrichment', () => {
  const source = read('src/components/product/ProductInfo.tsx');
  const helper = source.slice(source.indexOf('const extractProductSpecs ='), source.indexOf('// Product types that support blouse neckline selection'));
  const invocation = source.match(/const productSpecs = useMemo\(\s*\(\) => (extractProductSpecs\([\s\S]*?\n    \)),/)[1];
  const { outputFiles } = buildSync({ stdin: {contents: `import { inferProductSpecColors } from './src/lib/productSpecColor'; import { resolveIncludedPieces } from './src/lib/productPurchaseFlow.ts'; import { getCatalogMaterial } from './src/lib/catalogMaterial.ts'; ${helper}\nexport const specs = (product: any) => ${invocation};`, loader:'ts',resolveDir:root},bundle:true,write:false,format:'cjs',platform:'node' });
  const m={exports:{}};new Function('require','module','exports',outputFiles[0].text)(require,m,m.exports);
  const { enrichProductDescription } = loadTs('src/lib/productDescriptionEnrichment.ts');
  const fixtures = [
    {title:'Green Embroidered Anarkali Suit, Chinon Fabric, Pink Dupatta',html:'<p>Green Anarkali suit set: green Chinon embroidered Anarkali top, matching palazzo, pink Chinon dupatta with green border. 3 pieces. Stitched. </p><h3>Size and Fit</h3><p>Available sizes: S, M, L, XL, XXL, XS. Select your size from the product options.</p><h3>Occasions</h3><p>Indian wedding celebrations, festive gatherings and special occasions.</p><h3>Care</h3><p>Dry clean to care for the embroidery and fabric.</p><p>Accessories shown are for styling unless included in the outfit details. Colors may appear slightly different across screens.</p>',expected:'green Chinon embroidered Anarkali top, matching palazzo, pink Chinon dupatta with green border'},
    {title:'Teal Green Chinon Anarkali Gown Set, Embroidered Wedding Dress with Palazzo & Dupatta for Women',html:'<p>Teal green Chinon embroidered Anarkali gown set with palazzo and dupatta. 3 pieces. Ready-to-wear. Dry clean only.</p><h3>Size and Fit</h3><p>Available sizes: S, M, L, XL, XXL, XXXL. Select your preferred size from the options.</p><h3>Occasions</h3><p>An Indian ethnic outfit for wedding celebrations, festive gatherings and special occasions.</p><p>Accessories shown are for styling unless included in the outfit details. Screen settings may affect how colors appear.</p>',expected:'Anarkali gown, palazzo, and dupatta'},
  ];
  const catalog = JSON.parse(read('tests/fixtures/catalog-included-pieces-20261028.json')).products;
  fixtures.push(...catalog.filter(p => p.expected !== p.before).map(p => ({title:p.title,html:p.descriptionHtml,expected:p.expected})));
  for (const fixture of fixtures) {
    const description = enrichProductDescription(fixture.html,'Anarkali',fixture.title);
    assert.match(description,/is available from LuxeMia/);
    const p={title:fixture.title,productType:'Anarkali',tags:['anarkali'],descriptionHtml:fixture.html,description};
    assert.equal(m.exports.specs(p).includedPieces,fixture.expected);
    assert.equal(m.exports.specs({...p,metadata:{includedComponents:['Verified catalog components']}}).includedPieces,'Verified catalog components');
  }
  const ambiguous='<p>Dusty pink Chinon embroidered Anarkali suit set with green dupatta. 3 pieces. Stitched.</p>';
  assert.equal(m.exports.specs({title:'Dusty Pink Embroidered Anarkali Suit, Chinon, Green Dupatta',productType:'Anarkali',descriptionHtml:ambiguous,description:enrichProductDescription(ambiguous,'Anarkali','Dusty Pink Anarkali')}).includedPieces,undefined);
  assert.equal(m.exports.specs({title:'Green Anarkali',productType:'Anarkali',description:fixtures[0].html}).includedPieces,fixtures[0].expected);
});

test('generic size modal gives product-specific guidance for every category without universal measurements', () => {
  // Only bypass the portal for server snapshots; real Radix tabs/title/trigger remain.
  const source = read('src/components/product/SizeGuideModal.tsx')
    .replace(/<DialogContent className=/g, '<div className=')
    .replace(/<\/DialogContent>/g, '</div>');
  const { outputFiles } = buildSync({stdin:{contents:source,loader:'tsx',resolveDir:root},bundle:true,write:false,format:'cjs',platform:'node',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')}});
  const m={exports:{}};new Function('require','module','exports',outputFiles[0].text)(require,m,m.exports);
  for (const [category, heading] of [['lehenga','Lehenga &amp; Choli Fit Guide'],['saree','Saree Sizing Information'],['sharara suit','Salwar Suits, Sharara &amp; Palazzo Fit Guide'],['sherwani','Men’s Ethnic Wear Fit Guide'], ...['Kids Boy Set','Blouse','Palazzo Set','Couple Set',''].map(category => [category,'Product-specific Fit Guidance'])]) {
    const html=renderToStaticMarkup(React.createElement(m.exports.SizeGuideModal,{category}));
    assert(html.includes(heading),category);
    if (heading === 'Product-specific Fit Guidance') assert.doesNotMatch(html, /Lehenga &amp; Choli Fit Guide|Men’s Ethnic Wear Fit Guide/);
    assert.match(html,/Fit varies by design/);
    assert.match(html,/role="tablist"/);
    assert.match(html,/role="tab"[^>]*aria-selected="true"/);
    assert.match(html,/role="tabpanel"/);
    assert.match(html,/aria-haspopup="dialog"/);
    assert.doesNotMatch(html,/<table|one-size-fits-all|5\.5 meters|0\.8 meter|0\.8m|run true to size|pants are stretchable|4-6 weeks|32-34|36-38/);
    assert.match(html,/hello@luxemia.shop/);
  }
  const original=read('src/components/product/SizeGuideModal.tsx');
  assert.match(original,/<Dialog open=\{open\} onOpenChange=\{setOpen\}>/);
  assert.match(original,/<DialogTitle/);
  assert.match(original,/<DialogDescription/);
  assert.match(read('src/components/ui/dialog.tsx'),/DialogPrimitive.Close/);
});

test('product sizing tab removes invented universal dimensions but preserves verified blouse labels and product facts', () => {
  // Select the real sizing panel for SSR; all actual tab primitives are retained.
  const source=read('src/components/product/ProductTabs.tsx').replace('defaultValue="details"','defaultValue="sizing"');
  const {outputFiles}=buildSync({stdin:{contents:source,loader:'tsx',resolveDir:root},bundle:true,write:false,format:'cjs',platform:'node',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')}});
  const m={exports:{}};new Function('require','module','exports',outputFiles[0].text)(require,m,m.exports);
  const render=props=>renderToStaticMarkup(React.createElement(m.exports.ProductTabs,props));
  for(const productType of ['Lehenga','Saree','Anarkali','Sherwani','Kids Wear']) {
    const html=render({productType});
    assert.match(html,/Product-specific fit guidance/);
    assert.match(html,/role="tabpanel"/);
    assert.match(html,/body measurements or finished-garment measurements/);
    assert.doesNotMatch(html,/<table|All measurements are in inches/);
  }
  const blouse=render({productType:'Saree',blouseSizeValues:['34','36','38','44']});
  assert.match(blouse,/Available blouse sizes: 34, 36, 38, 44/);
  assert.match(blouse,/size labels, not complete bra sizes/);
  assert.match(blouse,/No cup size, blouse length or garment measurement is implied/);
  assert.doesNotMatch(blouse,/Product-specific fit guidance|<table/);
  assert.doesNotMatch(render({productType:'Jewelry'}),/Product-specific fit guidance|Choose the stitched blouse size/);
  // Product-supplied descriptions/charts still use the existing sanitizer, including table tags.
  assert.match(source,/DOMPurify.sanitize\(descriptionHtml/);
  assert.match(source,/'table', 'tbody', 'tr', 'th', 'td'/);
});

test('alternate stitching chart and how-to-measure dialogs contain no universal body conversion or guaranteed fit', () => {
  for (const [file,component] of [['src/components/SizeChartModal.tsx','SizeChartModal'],['src/components/HowToMeasureModal.tsx','HowToMeasureModal']]) {
    const source=read(file).replace(/<DialogContent className=/g,'<div className=').replace(/<\/DialogContent>/g,'</div>');
    const {outputFiles}=buildSync({stdin:{contents:source,loader:'tsx',resolveDir:root},bundle:true,write:false,format:'cjs',platform:'node',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')}});
    const m={exports:{}};new Function('require','module','exports',outputFiles[0].text)(require,m,m.exports);
    const html=renderToStaticMarkup(React.createElement(m.exports[component],{open:true,onOpenChange(){}}));
    assert.doesNotMatch(html,/<table|±0\.5|always be made|perfect fit|choosing the larger size/);
    assert.match(html,/selected (?:item|garment)|selected product/);
    assert.match(source,/<Dialog open=\{open\} onOpenChange=\{onOpenChange\}>/);
    assert.match(source,/<DialogTitle/);
    assert.match(source,/<DialogDescription/);
  }
  assert.doesNotMatch(read('src/components/SizeChartModal.tsx'),/sizeChart|row\.bust|row\.waist|row\.hip/);
  assert.match(read('src/components/HowToMeasureModal.tsx'),/Measure around the fullest part/);
});
