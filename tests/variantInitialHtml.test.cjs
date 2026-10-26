const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');
const handle = 'variant-initial-fixture';
const canonical = `https://luxemia.shop/product/${handle}`;
const money = amount => ({ amount, currencyCode: 'USD' });
const image = name => ({ url: `https://cdn.shopify.com/s/files/1/fixture/${name}.jpg?v=123`, altText: name });
const variant = (id, price, stitching, size, extra = {}) => ({
  id: `gid://shopify/ProductVariant/${id}`,
  title: `${stitching} / ${size}`,
  sku: `fixture-${id}`,
  price: money(price),
  compareAtPrice: null,
  availableForSale: true,
  selectedOptions: [{ name: 'Stitching', value: stitching }, { name: 'Size', value: size }],
  ...extra,
});
const productFixture = () => ({
  id: 'gid://shopify/Product/9014200336555', handle,
  title: 'Cotton Mirror Lehenga Choli', productType: 'Lehenga Choli', vendor: 'LuxeMia',
  description: 'Cotton mirror-work lehenga and choli with dupatta.',
  descriptionHtml: '<p>Cotton mirror-work lehenga and choli with dupatta.</p>',
  tags: ['facts:source-verified'], availableForSale: true,
  images: { edges: [{ node: image('fabric') }, { node: image('stitched') }] },
  priceRange: { minVariantPrice: money('59.99') },
  compareAtPriceRange: { minVariantPrice: money('79.99'), maxVariantPrice: money('120.00') },
  options: [
    { name: 'Stitching', values: ['Unstitched', 'Standard Size', 'Custom Measurements'] },
    { name: 'Size', values: ['Standard', 'S', 'M'] },
  ],
  variants: { edges: [
    variant('100', '59.99', 'Unstitched', 'Standard', { compareAtPrice: money('79.99') }),
    variant('200', '88.99', 'Standard Size', 'S', { image: image('stitched') }),
    variant('300', '103.99', 'Custom Measurements', 'Standard', { compareAtPrice: money('120.00') }),
    variant('400', '89.99', 'Standard Size', 'M', { availableForSale: false }),
  ].map(node => ({ node })) },
});

const template = '<html><head><title>Fixture</title><meta name="description" content="fixture" /><link rel="canonical" href="https://luxemia.shop/" /><link rel="stylesheet" href="/assets/app.css"><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>';
let generatorPromise;
function generator() {
  return generatorPromise ||= (async () => {
    const original = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
    const source = original.replace(/main\(\)\.catch\(err => \{[\s\S]*$/, 'export { generateHtml };');
    assert.notEqual(source, original, 'Load the real renderer without running its network/build entrypoint');
    const file = path.join(root, 'scripts', `.variant-initial-test-${process.pid}.mjs`);
    fs.writeFileSync(file, source);
    try { return await import(pathToFileURL(file).href); }
    finally { fs.unlinkSync(file); }
  })();
}

async function render(product = productFixture()) {
  const { generateHtml } = await generator();
  return generateHtml(template, {
    path: `/product/${product.handle}`, title: product.title, h1: product.title,
    description: product.description, content: '', product,
  }, new Map([[product.handle, product]]));
}

const lookupState = { calls: 0, result: { status: 'unavailable' } };
async function loadModule(entry, plugins = []) {
  const { outputFiles } = await build({
    entryPoints: [path.join(root, entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external',
    alias: { '@': path.join(root, 'src') }, plugins,
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', '__variantTestLookup', outputFiles[0].text)(require, module, module.exports, lookupState);
  return module.exports;
}

let personalizerPromise;
const personalizer = () => personalizerPromise ||= loadModule('src/middleware/variantPrerender.ts');

test('static and live product JSON-LD preserve hostile option text without creating script tags', async () => {
  const product = productFixture();
  const option = 'S "quoted" \\ </script><script data-schema-injection>bad</script>';
  product.variants.edges[0].node.selectedOptions[1].value = option;
  const { generateProductHtml } = await loadModule('src/middleware/htmlGenerator.ts');
  for (const html of [await render(product), generateProductHtml(product, canonical)]) {
    assert.doesNotMatch(html, /<script data-schema-injection>/);
    const nodes = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map(match => JSON.parse(match[1]));
    const groups = nodes.filter(node => node['@type'] === 'ProductGroup');
    assert.equal(groups.length, 1);
    assert.equal(nodes.filter(node => node['@type'] === 'Product').length, 0);
    assert(groups[0].hasVariant.some(variant => variant.name.includes(option)));
    assert.equal(groups[0].hasVariant.length, product.variants.edges.length);
  }
});

test('prerender treats every dollar replacement token as literal product data in JSON-LD, metadata, body and hydration', async () => {
  const { generateHtml } = await generator();
  const actualTemplate = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const originalEntryScripts = (actualTemplate.match(/<script\b[^>]*src="\/src\/main\.tsx"/g) || []).length;
  assert.equal(originalEntryScripts, 1, 'use the real application template with its body entry script');
  for (const token of ["$'", '$`', '$&', '$$', '$1', '$<name>']) {
    const product = productFixture();
    const value = `Fixture ${token} literal`;
    product.title = value;
    product.description = value;
    product.descriptionHtml = `<p>${value}</p>`;
    product.variants.edges[0].node.selectedOptions[1].value = value;
    const html = generateHtml(actualTemplate, {
      path: `/product/${product.handle}`, title: value, h1: value,
      description: value, content: '', product,
    }, new Map([[product.handle, product]]));
    const nodes = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map(match => JSON.parse(match[1]));
    const group = nodes.find(node => node['@type'] === 'ProductGroup');
    assert.equal(group.name, value, `${token}: product name survives`);
    assert(group.hasVariant[0].name.includes(value), `${token}: variant option survives`);
    assert.equal(nodes.filter(node => node['@type'] === 'ProductGroup').length, 1);
    assert.equal((html.match(/<script\b[^>]*src="\/src\/main\.tsx"/g) || []).length, originalEntryScripts,
      `${token}: never duplicate original app entry scripts`);
    const escapedValue = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    assert(html.match(/<title>([\s\S]*?)<\/title>/)[1].includes(escapedValue), `${token}: title stays literal`);
    assert(html.includes(`<h1>${escapedValue}</h1>`), `${token}: visible heading stays literal`);
    const payload = JSON.parse(html.match(/<script>window\.__INITIAL_PRODUCT_DATA__ = (\{[\s\S]*?\});<\/script>/)[1]);
    assert.equal(payload.product.title, value, `${token}: hydration title stays literal`);
  }
});
let middlewarePromise;
const middleware = () => middlewarePromise ||= loadModule('middleware.ts', [{
  name: 'variant-middleware-fixture',
  setup(builder) {
    builder.onResolve({ filter: /^(?:@vercel\/functions|\.\/src\/lib\/(?:prerenderManifest|autoRoutes|goneRoutes)\.js|\.\/src\/middleware\/shopifyProxy\.js)$/ }, args => ({ path: args.path, namespace: 'variant-test' }));
    builder.onLoad({ filter: /.*/, namespace: 'variant-test' }, ({ path: name }) => ({
      contents: name === '@vercel/functions'
        ? 'export const rewrite = url => new Response(null, { headers: { "x-middleware-rewrite": url.toString() } }); export const next = () => new Response(null, { headers: { "x-middleware-next": "1" } });'
        : name.endsWith('prerenderManifest.js')
          ? `export const PRERENDERED_PRODUCT_HANDLES = new Set([${JSON.stringify(handle)}]);`
          : name.endsWith('autoRoutes.js')
            ? 'export const PRERENDERED_ROUTES = new Set();'
            : name.endsWith('goneRoutes.js')
              ? 'export const GONE_PRODUCT_HANDLES = new Set();'
              : 'export const fetchProductByHandle = async () => { __variantTestLookup.calls++; return __variantTestLookup.result; };',
      loader: 'js',
    }));
  },
}]).then(module => module.default);

const markerPattern = name => new RegExp(`<!--variant-${name}-start-->([\\s\\S]*?)<!--variant-${name}-end-->`);
function region(html, name) {
  const match = html.match(markerPattern(name));
  assert(match, `Missing ${name} transform boundary`);
  return match[1];
}
function outsideRegions(html) {
  for (const name of ['price', 'image', 'availability', 'color']) html = html.replace(markerPattern(name), `<!-- unchanged ${name} boundary -->`);
  return html;
}
function scripts(html) { return html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || []; }
function groupSchema(html) {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1])).find(schema => schema['@type'] === 'ProductGroup');
}

test('numeric and GID selections change only marked visible regions, not schema, canonical or hydration data', async () => {
  const source = await render();
  const { personalizeProductPrerender } = await personalizer();
  const schema = groupSchema(source);
  assert(schema && schema.hasVariant.length === 4);
  const offer = schema.hasVariant.find(item => item.url === `${canonical}?variant=200`).offers;
  assert.equal(offer.price, '88.99');
  for (const id of ['200', 'gid://shopify/ProductVariant/200']) {
    const html = personalizeProductPrerender(source, handle, id);
    assert.equal(typeof html, 'string');
    assert.match(region(html, 'price'), /88\.99/);
    assert.match(region(html, 'price'), /Standard Size/);
    assert.match(region(html, 'price'), /\bS\b/);
    assert.doesNotMatch(region(html, 'price'), /59\.99|79\.99|120\.00|<s\b|<del\b|line-through|%\s*(?:OFF|off)/);
    assert.match(region(html, 'image'), /stitched\.jpg/);
    assert.doesNotMatch(region(html, 'image'), /fabric\.jpg/);
    assert.match(region(html, 'availability'), /In Stock/);
    assert.equal(outsideRegions(html), outsideRegions(source), 'Unrelated HTML, styling, policies and canonical stay byte-for-byte unchanged');
    assert.deepEqual(scripts(html), scripts(source), 'All scripts and hydration payload remain unchanged');
    assert.deepEqual(groupSchema(html), schema, 'All variant offers remain present and unchanged');
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`));
  }
});

test('genuine variant discount and fallback image survive A-B-A repeated transformations', async () => {
  const source = await render();
  const { personalizeProductPrerender } = await personalizer();
  const a = personalizeProductPrerender(source, handle, '100');
  assert.match(region(a, 'price'), /59\.99/);
  assert.match(region(a, 'price'), /79\.99/);
  assert.match(region(a, 'price'), /<s\b|<del\b|line-through/);
  assert.doesNotMatch(region(a, 'price'), /120\.00/);
  assert.match(region(a, 'image'), /fabric\.jpg/);
  const b = personalizeProductPrerender(a, handle, '200');
  assert.match(region(b, 'price'), /88\.99/);
  const again = personalizeProductPrerender(b, handle, '100');
  assert.equal(again, a, 'Selection is derived from unchanged source snapshot, not prior transformed output');
  assert.equal(personalizeProductPrerender(source, handle, '200'), b);
});

test('empty, invalid and sold-out variant selections match the current first-purchasable default without mutating data', async () => {
  const product = productFixture();
  const before = JSON.stringify(product);
  const { selectInitialVariant, personalizeProductPrerender } = await personalizer();
  const source = await render(product);
  for (const id of [undefined, null, '', 'not-a-variant', '400', 'gid://shopify/ProductVariant/400']) {
    assert.equal(selectInitialVariant(product, id)?.id, 'gid://shopify/ProductVariant/100');
    const html = personalizeProductPrerender(source, handle, id);
    assert.equal(typeof html, 'string');
    assert.match(region(html, 'price'), /59\.99/);
    assert.match(region(html, 'price'), /Unstitched/);
    assert.doesNotMatch(region(html, 'price'), /89\.99/);
  }
  assert.equal(JSON.stringify(product), before);
  product.variants.edges[0].node.availableForSale = false;
  assert.equal(selectInitialVariant(product, 'invalid')?.id, 'gid://shopify/ProductVariant/200');
  for (const edge of product.variants.edges) edge.node.availableForSale = false;
  assert.equal(selectInitialVariant(product, 'invalid')?.id, 'gid://shopify/ProductVariant/100');
  const soldOut = personalizeProductPrerender(await render(product), handle, 'invalid');
  assert.match(region(soldOut, 'price'), /Out of Stock/);
  assert.match(region(soldOut, 'availability'), /Out of Stock/);
});

test('missing/corrupt payloads, mismatched handles and missing transform boundaries are rejected', async () => {
  const source = await render();
  const { personalizeProductPrerender } = await personalizer();
  assert.equal(personalizeProductPrerender(source, 'another-product', '200'), null);
  assert.equal(personalizeProductPrerender('<html><head><title>Log in</title></head><body></body></html>', handle, '200'), null);
  assert.equal(personalizeProductPrerender(source.replace(/window\.__INITIAL_PRODUCT_DATA__\s*=\s*[\s\S]*?;<\/script>/, 'window.__INITIAL_PRODUCT_DATA__ = {broken};</script>'), handle, '200'), null);
  for (const name of ['price', 'image', 'availability']) {
    assert.equal(personalizeProductPrerender(source.replace(`<!--variant-${name}-start-->`, ''), handle, '200'), null, `${name} start boundary is required`);
    assert.equal(personalizeProductPrerender(source.replace(`<!--variant-${name}-end-->`, ''), handle, '200'), null, `${name} end boundary is required`);
  }
});

test('selected option text is escaped and injected query values never become HTML', async () => {
  const product = productFixture();
  const payload = '<img src=x onerror="alert(1)"> & "special"';
  product.variants.edges[1].node.title = payload;
  product.variants.edges[1].node.selectedOptions[0].value = payload;
  const source = await render(product);
  const { personalizeProductPrerender } = await personalizer();
  const html = personalizeProductPrerender(source, handle, '200');
  assert.doesNotMatch(region(html, 'price'), /<img\b|<script\b/);
  assert.match(region(html, 'price'), /&lt;img/);
  assert.match(region(html, 'price'), /&amp;/);
  assert.equal(outsideRegions(html), outsideRegions(source));
  const invalid = personalizeProductPrerender(source, handle, '<script>alert(1)</script>');
  assert.doesNotMatch(region(invalid, 'price'), /<script>/);
});

test('variant color selection updates the visible color row without rewriting common description or group schema', async () => {
  const product = productFixture();
  product.tags.push('color:Blue');
  product.options.push({ name: 'Color', values: ['Blue', 'Red'] });
  for (const [index, { node }] of product.variants.edges.entries()) {
    node.selectedOptions.push({ name: 'Color', value: index === 1 ? 'Red' : 'Blue' });
  }
  const source = await render(product);
  const { personalizeProductPrerender } = await personalizer();
  const html = personalizeProductPrerender(source, handle, '200');
  assert.match(region(source, 'color'), /Blue/);
  assert.equal(region(html, 'color'), 'Red');
  assert.match(region(html, 'price'), /Color: Red/);
  assert.equal(outsideRegions(html), outsideRegions(source));
  assert.deepEqual(scripts(html), scripts(source));
});

test('middleware preserves bare static routing and isolates sequential variant responses from asset cache headers', async t => {
  const source = await render();
  const run = await middleware();
  const previousLookups = lookupState.calls;
  let fetchCount = 0;
  t.mock.method(globalThis, 'fetch', async url => {
    fetchCount++;
    assert.equal(url.toString(), `https://luxemia.shop/_prerender/product/${handle}.html`);
    return new Response(source, { headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      'ETag': '"shared-product-snapshot"',
      'Content-Length': String(Buffer.byteLength(source)),
    } });
  });
  const bare = await run(new Request(canonical));
  assert.equal(bare.headers.get('x-middleware-rewrite'), `https://luxemia.shop/_prerender/product/${handle}.html`);
  assert.equal(fetchCount, 0, 'No additional work for bare product URLs');
  const responses = [];
  for (const id of ['100', '200', '100']) {
    const response = await run(new Request(`${canonical}?variant=${id}`));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type') || '', /text\/html/);
    for (const header of ['Cache-Control', 'CDN-Cache-Control', 'Vercel-CDN-Cache-Control']) {
      assert.match(response.headers.get(header) || '', /no-store/, `${header} must not reuse the product-wide cached representation`);
    }
    assert.equal(response.headers.get('ETag'), null);
    assert.equal(response.headers.get('Content-Length'), null);
    assert.equal(response.headers.get('x-middleware-rewrite'), null);
    assert.match(response.headers.get('Link') || '', new RegExp(canonical));
    responses.push(await response.text());
  }
  assert.equal(fetchCount, 3);
  assert.equal(responses[0], responses[2]);
  assert.match(region(responses[0], 'price'), /59\.99/);
  assert.match(region(responses[1], 'price'), /88\.99/);
  assert.doesNotMatch(region(responses[1], 'price'), /59\.99|79\.99|<s\b/);
  assert.deepEqual(scripts(responses[1]), scripts(source));
  assert.equal(lookupState.calls, previousLookups, 'Valid prerenders never require live Shopify');
});

test('preview static fetch forwards only the established protection credentials to the same origin', async t => {
  const source = await render();
  const run = await middleware();
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    assert.equal(url.toString(), `https://fixture-preview.vercel.app/_prerender/product/${handle}.html`);
    const headers = new Headers(init.headers);
    assert.equal(headers.get('cookie'), 'preview-session=fixture');
    assert.equal(headers.get('x-vercel-protection-bypass'), 'fixture-bypass');
    assert.equal(headers.get('authorization'), null);
    return new Response(source, { headers: { 'Content-Type': 'text/html' } });
  });
  const response = await run(new Request(`https://fixture-preview.vercel.app/product/${handle}?variant=200`, { headers: {
    cookie: 'preview-session=fixture', 'x-vercel-protection-bypass': 'fixture-bypass', authorization: 'Bearer must-not-forward',
  } }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.match(region(await response.text(), 'price'), /88\.99/);
});

test('middleware treats empty, unknown and sold-out query variants as selected default responses, not bare rewrites', async t => {
  const source = await render();
  const run = await middleware();
  t.mock.method(globalThis, 'fetch', async () => new Response(source));
  for (const value of ['', 'unknown', '400']) {
    const response = await run(new Request(`${canonical}?variant=${value}`));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-middleware-rewrite'), null);
    assert.match(response.headers.get('Cache-Control') || '', /no-store/);
    const html = await response.text();
    assert.match(region(html, 'price'), /59\.99/);
    assert.match(region(html, 'price'), /Selected options: Stitching: Unstitched/);
  }
});

test('middleware returns a transient no-store failure instead of a successful wrong-price page when the source cannot be transformed', async t => {
  const run = await middleware();
  for (const upstream of [new Response('Unavailable', { status: 503 }), new Response('<html><body>Log in</body></html>', { headers: { 'Content-Type': 'text/html' } })]) {
    t.mock.method(globalThis, 'fetch', async () => upstream);
    const response = await run(new Request(`${canonical}?variant=200`));
    assert.equal(response.status, 503);
    assert.match(response.headers.get('Cache-Control') || '', /no-store/);
    assert.equal(response.headers.get('x-middleware-rewrite'), null);
    t.mock.restoreAll();
  }
});

test('live HTML fallback selects the requested price, options, reference and hero without changing the ProductGroup', async () => {
  const { generateProductHtml } = await loadModule('src/middleware/htmlGenerator.ts');
  const product = productFixture();
  const before = JSON.stringify(product);
  const defaultHtml = generateProductHtml(product, canonical);
  const schema = groupSchema(defaultHtml);
  for (const id of ['200', 'gid://shopify/ProductVariant/200']) {
    const html = generateProductHtml(product, canonical, id);
    const priceBlock = html.match(/<div class="price">([\s\S]*?)<\/div>/)?.[1];
    assert(priceBlock);
    assert.match(priceBlock, /88\.99/);
    assert.doesNotMatch(priceBlock, /59\.99|79\.99|120\.00|price-original|discount-badge/);
    assert.match(html, /data-selected-variant="gid:\/\/shopify\/ProductVariant\/200"/);
    assert.match(html, /Selected options: Stitching: Standard Size; Size: S/);
    assert.match(html, /<meta property="product:price:amount" content="88\.99">/);
    assert.match(html, /<meta property="product:original_price:amount" content="88\.99">/);
    assert.doesNotMatch(html, /<meta property="product:sale_price:/);
    const firstVisibleImage = html.match(/<div class="product-images">\s*<img[^>]+>/)?.[0];
    assert.match(firstVisibleImage || '', /stitched\.jpg/);
    assert.deepEqual(groupSchema(html), schema);
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`));
  }
  for (const id of ['', null, 'invalid', '400']) {
    const html = generateProductHtml(product, canonical, id);
    assert.match(html, /<meta property="product:price:amount" content="59\.99">/);
    assert.match(html, /<meta property="product:original_price:amount" content="79\.99">/);
    assert.match(html, /data-selected-variant="gid:\/\/shopify\/ProductVariant\/100"/);
  }
  assert.equal(JSON.stringify(product), before);
});

test('missing static source falls through to correct live variant HTML with the app and no-store headers', async t => {
  const run = await middleware();
  lookupState.result = { status: 'found', product: productFixture() };
  t.after(() => { lookupState.result = { status: 'unavailable' }; });
  const fetched = [];
  t.mock.method(globalThis, 'fetch', async url => {
    fetched.push(url.toString());
    if (url.pathname.startsWith('/_prerender/')) return new Response('Missing', { status: 404 });
    assert.equal(url.toString(), 'https://luxemia.shop/index.html');
    return new Response(template);
  });
  const response = await run(new Request(`${canonical}?variant=200`));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Cache-Control') || '', /no-store/);
  assert.match(response.headers.get('Vercel-CDN-Cache-Control') || '', /no-store/);
  const html = await response.text();
  assert.match(html, /<meta property="product:price:amount" content="88\.99">/);
  assert.match(html, /data-selected-variant="gid:\/\/shopify\/ProductVariant\/200"/);
  assert.match(html, /<div id="root"><div data-product-fallback>/);
  assert.match(html, /src="\/assets\/app.js"/);
  assert.deepEqual(fetched, [
    `https://luxemia.shop/_prerender/product/${handle}.html`,
    'https://luxemia.shop/index.html',
  ]);
});
