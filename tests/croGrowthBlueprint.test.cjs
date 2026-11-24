const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function loadTsModule(relPath, define = {}) {
  const { outputFiles } = buildSync({
    entryPoints: [path.join(root, relPath)],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    packages: 'external',
    jsx: 'automatic',
    alias: { '@': path.join(root, 'src') },
    define,
  });
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, mod, mod.exports);
  return mod.exports;
}

function loadPageWithoutChrome(relPath) {
  const source = read(relPath)
    .replace(/^import \{ (Header|Footer|SEOHead) \} from .*;$/gm, 'const $1 = () => null;')
    .replace(/^import (Header|Footer|SEOHead) from .*;$/gm, 'const $1 = () => null;');
  const { outputFiles } = buildSync({
    stdin: { contents: source, loader: 'tsx', resolveDir: root },
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    packages: 'external',
    jsx: 'automatic',
    alias: { '@': path.join(root, 'src') },
  });
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', outputFiles[0].text)(require, mod, mod.exports);
  return mod.exports.default;
}

test('Task 1: /alterations page, policy redirects, and Footer policy/contact links are wired', () => {
  const Alterations = loadPageWithoutChrome('src/pages/Alterations.tsx');
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Alterations)));

  assert.match(html, /2-inch.*internal seam allowance|2-Inch Internal Seam Allowance/i);
  assert.match(html, /\$20.*Local Alteration Credit/i);
  assert.match(html, /5–7 business days/);
  assert.match(html, /15–18 business days/);
  assert.match(html, /3-Point Quality Assurance Check/);
  assert.match(html, /hello@luxemia\.shop/);
  assert.match(html, /\+1-215-341-9990/);
  assert.doesNotMatch(html, /continuous unboxing/i);

  const vercel = JSON.parse(read('vercel.json'));
  const redirectSources = new Set((vercel.redirects || []).map((r) => r.source));
  for (const expectedSource of [
    '/policies/refund-policy',
    '/policies/return-policy',
    '/policies/shipping-policy',
    '/policies/privacy-policy',
    '/policies/terms-of-service',
    '/pages/alterations-policy',
    '/alteration-policy',
  ]) {
    assert.ok(redirectSources.has(expectedSource), `Missing redirect source ${expectedSource}`);
  }

  const rewriteSources = (vercel.rewrites || []).map((r) => r.source);
  const gmcIdx = rewriteSources.indexOf('/api/gmc-feed');
  const spaIdx = rewriteSources.indexOf('/((?!api/|assets/|.*\\..*).*)');
  assert.ok(gmcIdx >= 0, 'Missing /api/gmc-feed rewrite in vercel.json');
  assert.ok(spaIdx === -1 || gmcIdx < spaIdx, '/api/gmc-feed rewrite must precede SPA fallback');

  const FooterMod = loadTsModule('src/components/layout/Footer.tsx');
  const Footer = FooterMod.Footer || FooterMod.default;
  const footerHtml = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Footer)));
  for (const href of ['/shipping', '/returns', '/alterations', '/privacy', '/terms', '/contact']) {
    assert.ok(footerHtml.includes(`href="${href}"`), `Footer missing policy link ${href}`);
  }
  assert.match(footerHtml, /hello@luxemia\.shop/);
  assert.match(footerHtml, /215.*341.*9990/);
  assert.match(footerHtml, /Philadelphia, PA/);
});

test('Task 2: EstimatedDeliveryBadge computes US business-day ranges and SizingAlterationCallout guards jewelry', () => {
  const {
    EstimatedDeliveryBadge,
    buildEstimatedDeliveryBadgeModel,
  } = loadTsModule('src/components/pdp/EstimatedDeliveryBadge.tsx');
  const { SizingAlterationCallout } = loadTsModule('src/components/pdp/SizingAlterationCallout.tsx');

  // Fixed Friday reference date (2026-10-16T15:00:00Z):
  // +5 US business days -> Fri Oct 23; +7 US business days -> Tue Oct 27
  // +15 US business days -> Fri Nov 6; +18 US business days -> Wed Nov 11
  const refDate = new Date('2026-10-16T15:00:00Z');
  const readyModel = buildEstimatedDeliveryBadgeModel({
    shipsWithinDays: null,
    isCustomTailored: false,
    referenceDate: refDate,
  });
  assert.equal(readyModel.minDays, 5);
  assert.equal(readyModel.maxDays, 7);
  assert.equal(readyModel.dateRangeLabel, 'Oct 23 – Oct 27');
  assert.match(readyModel.headline, /Order today for delivery to US by Oct 23 – Oct 27/);
  assert.match(readyModel.subline, /Ready-to-Ship \(5–7 business days to US\/UK\/CA via DHL\/FedEx\)/);

  const customModel = buildEstimatedDeliveryBadgeModel({
    shipsWithinDays: null,
    isCustomTailored: true,
    referenceDate: refDate,
  });
  assert.equal(customModel.minDays, 15);
  assert.equal(customModel.maxDays, 18);
  // Nov 11 is Veterans Day (skipped by addUsBusinessDays), so +18 US business days lands on Nov 12.
  assert.equal(customModel.dateRangeLabel, 'Nov 6 – Nov 12');
  assert.match(customModel.headline, /Order today for custom-tailored delivery to US by Nov 6 – Nov 12/);
  assert.match(customModel.subline, /Custom Tailored \(15–18 business days total via DHL\/FedEx\)/);

  const badgeHtml = renderToStaticMarkup(
    React.createElement(EstimatedDeliveryBadge, { referenceDate: refDate, isCustomTailored: false }),
  );
  assert.match(badgeHtml, /data-testid="estimated-delivery-badge"/);
  assert.match(badgeHtml, /Oct 23 – Oct 27/);

  // Verify EstimatedDeliveryBadge sits directly inside #product-add-to-bag in ProductInfo.tsx
  const productInfoSource = read('src/components/product/ProductInfo.tsx');
  const addToBagIdx = productInfoSource.indexOf('id="product-add-to-bag"');
  const badgeIdx = productInfoSource.indexOf('<EstimatedDeliveryBadge', addToBagIdx);
  assert.ok(addToBagIdx > 0 && badgeIdx > addToBagIdx, 'EstimatedDeliveryBadge must render under Add to Bag');

  // SizingAlterationCallout renders apparel details and omits jewelry
  const apparelHtml = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(SizingAlterationCallout, {
        productTitle: 'Teal Georgette Embroidered Lehenga Choli',
        productType: 'Lehenga Choli',
        includedPieces: 'Lehenga skirt, choli blouse, and embroidered dupatta.',
        fabricSummary: 'Faux Georgette with soft micro-crepe lining',
      }),
    ),
  );
  assert.match(apparelHtml, /data-testid="sizing-alteration-callout"/);
  assert.match(apparelHtml, /Inner Lining Fabric/);
  assert.match(apparelHtml, /2-Inch Seam Margin/);
  assert.match(apparelHtml, /\$20 USD in Local Alteration Credit/);

  const jewelryHtml = renderToStaticMarkup(
    React.createElement(SizingAlterationCallout, {
      productTitle: 'Kundan Choker Necklace Set',
      isJewelry: true,
    }),
  );
  assert.equal(jewelryHtml, '');
});

test('Task 3: Cross-domain GA4 linker decoration, item_category inference, and Google Ads conversion dispatch', () => {
  const { appendGaLinkerParams, isCheckoutRedirectHost, CROSS_DOMAIN_LINKER_DOMAINS } = loadTsModule('src/lib/gaLinker.ts');

  for (const expectedDomain of [
    'luxemia.shop',
    'www.luxemia.shop',
    'checkout.luxemia.shop',
    'lovable-project-zlh0w.myshopify.com',
  ]) {
    assert.ok(CROSS_DOMAIN_LINKER_DOMAINS.includes(expectedDomain), `Missing ${expectedDomain}`);
  }
  assert.equal(isCheckoutRedirectHost('lovable-project-zlh0w.myshopify.com'), true);
  assert.equal(isCheckoutRedirectHost('checkout.luxemia.shop'), true);
  assert.equal(isCheckoutRedirectHost('evil.example.com'), false);

  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  try {
    globalThis.document = { cookie: '_ga=GA1.1.123456789.1700000000; other=1' };
    globalThis.window = { location: { search: '?_gl=1*abc123*_ga*MTIz' } };

    const decorated = appendGaLinkerParams(
      'https://lovable-project-zlh0w.myshopify.com/cart/c/token123?key=abc',
    );
    const parsed = new URL(decorated);
    assert.equal(parsed.searchParams.get('key'), 'abc');
    assert.equal(parsed.searchParams.get('_ga'), 'GA1.1.123456789.1700000000');
    assert.equal(parsed.searchParams.get('_gl'), '1*abc123*_ga*MTIz');

    const checkoutSubdomain = appendGaLinkerParams('https://checkout.luxemia.shop/checkouts/cn/xyz');
    assert.equal(new URL(checkoutSubdomain).searchParams.get('_ga'), 'GA1.1.123456789.1700000000');

    // Never leak GA cookies to unrelated external domains
    const externalUrl = 'https://instagram.com/luxemiashop';
    assert.equal(appendGaLinkerParams(externalUrl), externalUrl);

    // Verify GA4 add_to_cart & begin_checkout items include item_category, item_brand, price, and optional Google Ads conversion
    const events = [];
    globalThis.window = {
      location: { search: '' },
      addEventListener() {},
      removeEventListener() {},
      luxemiaGoogleAdsConfig: {
        conversionId: 'AW-999888777',
        addToCartLabel: 'atcLabel123',
        beginCheckoutLabel: 'chkLabel456',
      },
      gtag: (...args) => events.push(args),
    };
    const analytics = loadTsModule('src/hooks/useAnalytics.ts');

    analytics.trackAddToCart({
      id: 'gid://shopify/ProductVariant/42',
      name: 'Emerald Silk Bridal Lehenga Choli',
      price: 289.0,
      quantity: 1,
      variant: 'M',
    });
    analytics.trackBeginCheckout(
      [
        {
          id: 'gid://shopify/ProductVariant/42',
          name: 'Emerald Silk Bridal Lehenga Choli',
          price: 289.0,
          quantity: 1,
        },
      ],
      289.0,
    );

    const atcGa4 = events.find((e) => e[0] === 'event' && e[1] === 'add_to_cart');
    assert.ok(atcGa4);
    assert.equal(atcGa4[2].currency, 'USD');
    assert.equal(atcGa4[2].value, 289);
    assert.equal(atcGa4[2].items[0].item_id, 'gid://shopify/ProductVariant/42');
    assert.equal(atcGa4[2].items[0].item_brand, 'LuxeMia');
    assert.equal(atcGa4[2].items[0].item_category, 'Lehengas');

    const adsEvents = events.filter((e) => e[0] === 'event' && e[1] === 'conversion');
    assert.equal(adsEvents.length, 2);
    assert.equal(adsEvents[0][2].send_to, 'AW-999888777/atcLabel123');
    assert.equal(adsEvents[1][2].send_to, 'AW-999888777/chkLabel456');
  } finally {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  }
});

test('Task 4: /api/gmc-feed builds optimized titles, canonical luxemia.shop links, JPEG images, XML, and 19-col CSV', async () => {
  const gmc = loadTsModule('api/gmc-feed.ts');

  const sampleProduct = {
    id: 'gid://shopify/Product/8801',
    handle: 'teal-georgette-sequin-sangeet-lehenga-choli',
    title: 'Handcrafted Teal Georgette Sequin Sangeet Lehenga Choli',
    description: '<p>100% authentic artisan-made teal georgette lehenga choli with zari and sequin embroidery for sangeet nights. Ships worldwide with free returns.</p>',
    vendor: 'LuxeMia',
    productType: 'Lehenga Choli',
    availableForSale: true,
    tags: ['sangeet', 'georgette', 'sequin'],
    featuredImage: { url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/lehenga-hero.webp?v=123&format=webp' },
    images: {
      edges: [
        { node: { url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/lehenga-hero.webp?v=123&format=webp' } },
        { node: { url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/lehenga-back.png?v=124' } },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductVariant/99001',
            title: 'M / Teal',
            sku: 'LM-99001',
            availableForSale: true,
            price: { amount: '219.00', currencyCode: 'USD' },
            compareAtPrice: { amount: '259.00', currencyCode: 'USD' },
            image: null,
            selectedOptions: [
              { name: 'Size', value: 'M' },
              { name: 'Color', value: 'Teal' },
            ],
          },
        },
        {
          node: {
            id: 'gid://shopify/ProductVariant/99002',
            title: 'L / Teal',
            sku: 'LM-99002',
            availableForSale: true,
            price: { amount: '219.00', currencyCode: 'USD' },
            compareAtPrice: { amount: '259.00', currencyCode: 'USD' },
            image: null,
            selectedOptions: [
              { name: 'Size', value: 'L' },
              { name: 'Color', value: 'Teal' },
            ],
          },
        },
      ],
    },
  };

  const rows = gmc.buildGmcFeedRows([sampleProduct]);
  assert.equal(rows.length, 2);
  const row = rows[0];

  assert.equal(row.id, 'LM-99001');
  assert.equal(row.itemGroupId, 'teal-georgette-sequin-sangeet-lehenga-choli');
  assert.match(row.title, /^LuxeMia Women's /);
  assert.match(row.title, /Georgette/);
  assert.match(row.title, /Teal/);
  assert.match(row.title, /\bM$/);
  assert.ok(row.title.length <= 150);
  assert.doesNotMatch(row.title, /handcrafted|artisan|100%|worldwide/i);
  assert.doesNotMatch(row.description, /handcrafted|artisan|100%\s*authentic|worldwide|free returns|<p>/i);
  assert.equal(row.link, 'https://luxemia.shop/product/teal-georgette-sequin-sangeet-lehenga-choli?variant=99001');
  assert.match(row.imageLink, /\.jpg\?v=123$/);
  assert.doesNotMatch(row.imageLink, /webp|avif/i);
  assert.equal(row.price, '259.00 USD');
  assert.equal(row.salePrice, '219.00 USD');
  assert.equal(row.availability, 'in_stock');
  assert.equal(row.condition, 'new');
  assert.equal(row.brand, 'LuxeMia');

  const xml = gmc.serializeGmcXml(rows);
  assert.match(xml, /xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0"/);
  assert.match(xml, /<g:id>LM-99001<\/g:id>/);
  assert.match(xml, /<g:link>https:\/\/luxemia\.shop\/product\/teal-georgette-sequin-sangeet-lehenga-choli\?variant=99001<\/g:link>/);
  assert.match(xml, /<g:price>259\.00 USD<\/g:price>/);
  assert.match(xml, /<g:sale_price>219\.00 USD<\/g:sale_price>/);

  const csv = gmc.serializeGmcCsv(rows);
  const lines = csv.trim().split('\n');
  assert.equal(lines.length, 3);
  assert.equal(lines[0].split(',').length, 19);
  assert.equal(
    lines[0],
    'id,title,description,link,image_link,availability,price,google_product_category,brand,condition,gender,age_group,color,material,size,identifier_exists,custom_label_0,custom_label_1,shipping',
  );
});
