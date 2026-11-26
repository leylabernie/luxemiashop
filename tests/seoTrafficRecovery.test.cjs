const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');

async function loadBundledMiddleware(fetchImpl) {
  const output = await build({
    entryPoints: [path.join(root, 'middleware.ts')],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    packages: 'external',
    plugins: [
      {
        name: 'vercel-edge-stubs',
        setup(builder) {
          builder.onResolve({ filter: /^@vercel\/functions$/ }, () => ({
            path: 'vercel-functions',
            namespace: 'stub',
          }));
          builder.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
            contents: `
              module.exports = {
                rewrite: (url) => new Response('<html><head><meta name="robots" content="index, follow"></head><body>rewritten</body></html>', {
                  status: 200,
                  headers: { 'content-type': 'text/html; charset=utf-8', 'x-rewrite': String(url) },
                }),
                next: () => new Response('', { status: 200, headers: { 'x-next': '1' } }),
              };
            `,
          }));
        },
      },
    ],
  });

  const mod = { exports: {} };
  const prevFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    new Function('require', 'module', 'exports', output.outputFiles[0].text)(require, mod, mod.exports);
  } finally {
    globalThis.fetch = prevFetch;
  }

  return async (url) => {
    const savedFetch = globalThis.fetch;
    globalThis.fetch = fetchImpl;
    try {
      return await mod.exports.default(new Request(url));
    } finally {
      globalThis.fetch = savedFetch;
    }
  };
}

async function loadTsModule(relativePath) {
  const output = await build({
    entryPoints: [path.join(root, relativePath)],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    packages: 'external',
  });
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', output.outputFiles[0].text)(require, mod, mod.exports);
  return mod.exports;
}

function loadFeedHelpers() {
  const feedPath = path.join(root, 'scripts/generate-static-feed.cjs');
  const source = fs.readFileSync(feedPath, 'utf8');
  const slice = source.slice(0, source.indexOf('main().catch'));
  const ctx = {
    require: createRequire(feedPath),
    console: { log() {}, warn() {}, error() {} },
    process,
    URL,
    __dirname: path.dirname(feedPath),
    __filename: feedPath,
    Buffer,
    Set,
    Map,
    Math,
    Date,
    Number,
    String,
    Array,
    RegExp,
    Object,
    Error,
  };
  vm.runInNewContext(
    `${slice}\nglobalThis.__exports = { forceJpeg, buildMerchantBaseTitle, selectWeddingPriorityHandles, getSeasonalCustomLabel, buildDescription };`,
    ctx,
  );
  return ctx.__exports;
}

test('collection & category routes keep indexability on attribution params while noindexing facet noise', async () => {
  const runMiddleware = await loadBundledMiddleware(async (input) => {
    const u = input instanceof URL ? input : new URL(typeof input === 'string' ? input : input.url);
    if (u.pathname.startsWith('/_prerender/')) {
      return new Response('<html><head><title>Collection</title></head><body>ok</body></html>', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
    return new Response(JSON.stringify({ data: { product: null } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const cleanAttributionUrls = [
    ['https://luxemia.shop/lehengas?srsltid=AfmBOoq12345', '/lehengas'],
    ['https://luxemia.shop/sarees?gclid=CjwKCAjw999&gad_source=1', '/sarees'],
    ['https://luxemia.shop/suits?utm_source=pinterest&utm_medium=social&epik=dj0yJnU9', '/suits'],
    ['https://luxemia.shop/collections/bridal-lehengas?fbclid=IwAR0abc&utm_campaign=bridal_vol3', '/collections/bridal-lehengas'],
    ['https://luxemia.shop/collections/banarasi-sarees?srsltid=AfmBOop98765', '/collections/banarasi-sarees'],
    ['https://luxemia.shop/collections/couple-outfits?gbraid=0AAAA&wbraid=0BBBB&_gl=1*abc', '/collections/couple-outfits'],
    ['https://luxemia.shop/collections/blouses?ttclid=E.C.P.123&msclkid=xyz', '/collections/blouses'],
  ];

  for (const [url, expectedCanonical] of cleanAttributionUrls) {
    const res = await runMiddleware(url);
    assert.equal(res.status, 200, `${url} should return 200`);
    const robots = res.headers.get('X-Robots-Tag') || '';
    assert.ok(!robots.toLowerCase().includes('noindex'), `${url} must NOT emit X-Robots-Tag noindex (got: ${robots})`);
    assert.equal(
      res.headers.get('Link'),
      `<https://luxemia.shop${expectedCanonical}>; rel="canonical"`,
      `${url} must expose clean canonical Link header`,
    );
  }

  const noisyFacetUrls = [
    ['https://luxemia.shop/lehengas?color=red', '/lehengas'],
    ['https://luxemia.shop/sarees?sort=price-asc&srsltid=abc', '/sarees'],
    ['https://luxemia.shop/lehengas?sub=bridal&color=red', '/collections/bridal-lehengas'],
    ['https://luxemia.shop/collections?q=banarasi', '/collections'],
  ];

  for (const [url, expectedCanonical] of noisyFacetUrls) {
    const res = await runMiddleware(url);
    assert.equal(res.status, 200, `${url} should return 200`);
    assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, follow', `${url} must noindex facet duplicate`);
    assert.equal(
      res.headers.get('Link'),
      `<https://luxemia.shop${expectedCanonical}>; rel="canonical"`,
    );
  }
});

test('legacy collection aliases and ?sub= facets 301 cleanly with attribution preserved instead of 404', async () => {
  const runMiddleware = await loadBundledMiddleware(async () => new Response('', { status: 404 }));

  const redirectCases = [
    ['https://luxemia.shop/collections/sarees?srsltid=Afm123', 'https://luxemia.shop/sarees?srsltid=Afm123'],
    ['https://luxemia.shop/collections/wedding-lehengas?gclid=GCL999&color=red', 'https://luxemia.shop/lehengas?gclid=GCL999'],
    ['https://luxemia.shop/collections/lehengas?utm_source=instagram&fbclid=FB1', 'https://luxemia.shop/lehengas?utm_source=instagram&fbclid=FB1'],
    ['https://luxemia.shop/lehengas?sub=bridal&srsltid=Afm777', 'https://luxemia.shop/collections/bridal-lehengas?srsltid=Afm777'],
    ['https://luxemia.shop/suits?sub=sharara', 'https://luxemia.shop/collections/sharara-suits'],
  ];

  for (const [input, expectedLocation] of redirectCases) {
    const res = await runMiddleware(input);
    assert.equal(res.status, 301, `${input} must 301 instead of 404`);
    assert.equal(res.headers.get('Location'), expectedLocation);
  }
});

test('Royal Bridal Vol. 3 homepage handles serve indexable 200 SSR HTML before Shopify import and retired 410s suggest matching categories', async () => {
  const runMiddleware = await loadBundledMiddleware(async (input) => {
    const u = input instanceof URL ? input : new URL(typeof input === 'string' ? input : input.url);
    if (u.pathname === '/index.html') {
      return new Response(
        '<!doctype html><html><head><link rel="stylesheet" href="/assets/app.css"><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
        { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } },
      );
    }
    return new Response(JSON.stringify({ data: { product: null } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const vol3Res = await runMiddleware(
    'https://luxemia.shop/product/sindoori-red-silk-heritage-jharokha-bridal-lehenga-double-dupatta',
  );
  assert.equal(vol3Res.status, 200);
  assert.equal(vol3Res.headers.get('X-Robots-Tag'), 'index, follow');
  const vol3Html = await vol3Res.text();
  assert.match(vol3Html, /Sindoori Red Silk Heritage Jharokha/);
  assert.match(vol3Html, /luxemia-bv3-175-sindoori-jharokha-1\.jpg/);
  const schemas = [...vol3Html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  assert.ok(schemas.some(schema => schema['@type'] === 'Product' || schema['@type'] === 'ProductGroup'));
  assert.match(vol3Html, /<h1\b[^>]*>[^<]*Sindoori/i);

  const goneRes = await runMiddleware(
    'https://luxemia.shop/product/chinon-lime-yellow-wedding-wear-embroidery-work-readymade-sharara-suit',
  );
  assert.equal(goneRes.status, 410);
  assert.equal(goneRes.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  const goneHtml = await goneRes.text();
  assert.match(goneHtml, /href="\/collections\/sharara-suits"/);
});

test('GMC JPEG helper and endpoint convert store .webp assets to .jpg and reject unsafe inputs', async () => {
  const { buildUpstreamShopifyJpegUrl } = await loadTsModule('api/gmc-image.ts');
  const { forceJpegForGmc } = await loadTsModule('src/lib/schema.ts');
  const { forceJpeg } = loadFeedHelpers();

  const sampleWebp =
    'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/lnb1747-georgette-lehenga-choli-1793857495-5577.webp?v=1794254805';
  const expectedJpg =
    'https://luxemia.shop/gmc-images/lnb1747-georgette-lehenga-choli-1793857495-5577.jpg?v=1794254805';

  assert.equal(forceJpeg(sampleWebp), expectedJpg);
  assert.equal(forceJpegForGmc(sampleWebp), expectedJpg);
  assert.equal(
    buildUpstreamShopifyJpegUrl('lnb1747-georgette-lehenga-choli-1793857495-5577', '1794254805'),
    'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/lnb1747-georgette-lehenga-choli-1793857495-5577.webp?v=1794254805&format=jpg&width=1500',
  );
  assert.equal(buildUpstreamShopifyJpegUrl('../secret', '1'), null);
  assert.equal(buildUpstreamShopifyJpegUrl('https://evil.example/a', '1'), null);
  assert.equal(buildUpstreamShopifyJpegUrl('a/b', '1'), null);
});

test('Merchant feed prioritizes wedding inventory without injecting synthetic Navratri title suffixes', () => {
  const {
    buildMerchantBaseTitle,
    selectWeddingPriorityHandles,
    getSeasonalCustomLabel,
    buildDescription,
  } = loadFeedHelpers();

  const bridal = {
    handle: 'crimson-red-silk-bridal-lehenga',
    title: 'Crimson Red Silk Bridal Lehenga Choli',
    productType: 'Bridal Lehenga',
    tags: ['bridal', 'wedding'],
  };
  const navratri = {
    handle: 'navratri-blouse-red-4',
    title: 'Red Peacock Embroidery Art Silk Navratri Blouse, Garba Outfit',
    productType: 'Blouse',
    tags: ['navratri', 'garba'],
  };
  const priorities = selectWeddingPriorityHandles([bridal, navratri]);
  assert.ok(priorities.has(bridal.handle));
  assert.ok(!priorities.has(navratri.handle));
  assert.equal(getSeasonalCustomLabel(bridal, priorities), 'wedding_season_2026_priority');
  assert.equal(getSeasonalCustomLabel(navratri, priorities), 'navratri_2026_classic');
  assert.equal(
    buildMerchantBaseTitle('Bronze Silk Embroidered Lehenga Choli — Navratri Garba Outfit', 'bronze-silk-embroidered-lehenga-choli'),
    'Bronze Silk Embroidered Lehenga Choli',
  );
  assert.doesNotMatch(buildMerchantBaseTitle(bridal.title, bridal.handle), /Navratri|Garba/i);

  const desc = buildDescription(
    bridal,
    'Red',
    'Silk',
    'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Lehengas',
    'Crimson Red Silk Bridal Lehenga Choli — 38',
    [{ name: 'Size', value: '38' }],
  );
  assert.match(desc, /Indian bridal lehenga choli/);
  assert.match(desc, /Style: Bridal Lehenga/);
  assert.match(desc, /Color: Red/);
  assert.match(desc, /Material: Silk/);
  assert.match(desc, /Size: 38/);
});

test('stocked blouses & couple-outfits collections are indexable and enrolled in sitemap', () => {
  const prerenderSource = fs.readFileSync(path.join(root, 'scripts/prerender.js'), 'utf8');
  const sitemapSource = fs.readFileSync(path.join(root, 'scripts/generate-sitemap.cjs'), 'utf8');
  assert.doesNotMatch(prerenderSource, /path:\s*'\/collections\/blouses'[^\n]*noIndexFollow:\s*true/);
  assert.doesNotMatch(prerenderSource, /path:\s*'\/collections\/couple-outfits'[^\n]*noIndexFollow:\s*true/);
  assert.match(sitemapSource, /loc:\s*'\/collections\/blouses'/);
  assert.match(sitemapSource, /loc:\s*'\/collections\/couple-outfits'/);
});

test('dangling product hyphens redirect permanently while preserving variants and attribution', async () => {
  const middleware = await loadBundledMiddleware(() => { throw new Error('redirect must not fetch'); });
  for (const suffix of ['-', '---']) {
    const response = await middleware(`https://luxemia.shop/product/crimson-red-silk-royal-arch-zardosi-bridal-lehenga-double-dupatta${suffix}?variant=123&utm_source=test`);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), 'https://luxemia.shop/product/crimson-red-silk-royal-arch-zardosi-bridal-lehenga-double-dupatta?variant=123&utm_source=test');
  }
});

test('removed named blog slugs redirect to the blog, while unknown slugs stay 404', async () => {
  const run = await loadBundledMiddleware(async () => { throw new Error('redirects and unknown slugs must not fetch'); });
  for (const slug of ['indian-wedding-dress-complete-guide', 'how-to-choose-perfect-lehenga-wedding-2026']) {
    const response = await run(`https://luxemia.shop/blog/${slug}`);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), 'https://luxemia.shop/blog');
  }
  assert.equal((await run('https://luxemia.shop/blog/no-such-unpublished-article')).status, 404);
});

test('published blog posts and hubs recover full source text and schema when prerender is missing', async () => {
  const fetched = [];
  const run = await loadBundledMiddleware(async input => {
    const url = new URL(String(input));
    fetched.push(url.pathname + url.search);
    if (url.pathname.startsWith('/_prerender/')) return new Response('not found', { status: 404 });
    assert.equal(url.pathname, '/index.html');
    return new Response('<html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>');
  });
  for (const slug of ['wedding-guest-outfit-ideas', 'indian-wedding-guest-attire']) {
    const response = await run(`https://luxemia.shop/blog/${slug}?utm_source=test`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<h1>/);
    assert.match(html, /<script type="application\/ld\+json">/);
    assert.match(html, /src="\/assets\/app.js"/);
    assert.ok(html.length > 1000, 'source-backed text and links are rendered');
    assert.ok(html.includes(`https://luxemia.shop/blog/${slug}`));
    assert.ok(fetched.includes(`/_prerender/blog/${slug}.html`));
  }
  assert.ok(fetched.every(path => !path.includes('?')), 'query parameters never enter asset lookups');
});
