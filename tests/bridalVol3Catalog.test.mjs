import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

const require = createRequire(import.meta.url);
import {
  CURATED_BRIDAL_VOL3_HOMEPAGE_SLOTS,
  applyCuratedBridalVol3Slots,
  isSameDesignFamily,
  selectDistinctHomepageProducts,
} from '../src/lib/selectLatestHomepageImagery.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadTsModule(relPath) {
  const result = buildSync({
    entryPoints: [path.join(root, relPath)],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    alias: { '@': path.join(root, 'src') },
  });
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, mod, mod.exports);
  return mod.exports;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'src/data/bridalVol3Catalog.json'), 'utf8'),
);
const csvRaw = fs.readFileSync(
  path.join(root, 'catalog-imports/luxemia-royal-bridal-silk-vol3-shopify.csv'),
  'utf8',
);

const EXPECTED_PRICES = {
  '166': [19625, '436.11'],
  '167': [19625, '436.11'],
  '168': [17625, '391.67'],
  '169': [17625, '391.67'],
  '170': [16055, '356.78'],
  '171': [16055, '356.78'],
  '172': [18695, '415.44'],
  '173': [18695, '415.44'],
  '174': [19975, '443.89'],
  '175': [19975, '443.89'],
  '176': [19625, '436.11'],
  '177': [19625, '436.11'],
  '178': [19625, '436.11'],
  '179': [18695, '415.44'],
};

test('all 14 Vol-3 designs enforce exact USD = round((INR * 2) / 90, 2) pricing', () => {
  assert.equal(catalog.products.length, 14);
  assert.equal(catalog.activeDesigns, 10);
  assert.equal(catalog.draftDesigns, 4);
  assert.equal(catalog.totalImages, 23);

  for (const product of catalog.products) {
    const [expectedInr, expectedUsd] = EXPECTED_PRICES[product.editionCode];
    assert.equal(product.inrPrice, expectedInr);
    const computed = ((product.inrPrice * 2) / 90).toFixed(2);
    assert.equal(computed, expectedUsd);
    assert.equal(product.priceUsd, expectedUsd);
    for (const variant of product.variants) {
      assert.equal(variant.price, expectedUsd);
      assert.equal(Number(variant.compareAtPrice) > Number(variant.price), true);
    }
  }
});

test('all 23 debranded JPG + WebP images exist on disk and zero supplier strings leak', () => {
  const banned =
    /\b(?:tathastu|anaara|anara|amrah|kapdavilla|wholetex|kavyastyle|surattextile|am-17205|aa-1[678]\d)\b|free\s+worldwide\s+shipping|custom sizing:\s*available on request/i;

  assert.doesNotMatch(JSON.stringify(catalog), banned);
  assert.doesNotMatch(csvRaw, banned);

  let imageCount = 0;
  for (const product of catalog.products) {
    if (product.status === 'active') {
      assert.ok(product.images.length >= 2, `${product.handle} should have >=2 images`);
    } else {
      assert.equal(product.images.length, 0);
      assert.equal(product.published, false);
    }
    for (const img of product.images) {
      imageCount += 1;
      const jpg = path.join(root, 'public', img.jpgPath);
      const webp = path.join(root, 'public', img.webpPath);
      assert.equal(fs.existsSync(jpg), true, `missing ${jpg}`);
      assert.equal(fs.existsSync(webp), true, `missing ${webp}`);
      assert.ok(fs.statSync(jpg).size > 50_000, `suspiciously small jpg: ${jpg}`);
      assert.ok(fs.statSync(webp).size > 25_000, `suspiciously small webp: ${webp}`);
      assert.ok(img.alt.length >= 40, `alt text too short on ${img.jpgPath}`);
      assert.equal(img.shopifySrc, `https://luxemia.shop${img.jpgPath}`);
    }
  }
  assert.equal(imageCount, 23);
});

test('53-column Shopify Admin CSV has 126 unique-SKU variant rows with Utsav 32-46 + Custom Fit sizes', () => {
  const rows = parseCsv(csvRaw);
  const header = rows[0];
  assert.equal(header.length, 53);
  const body = rows.slice(1);
  assert.equal(body.length, 14 * 9);

  const idx = (col) => header.indexOf(col);
  const skus = new Set();
  const sizesByHandle = new Map();

  for (const r of body) {
    assert.equal(r.length, 53);
    const handle = r[idx('Handle')];
    const sku = r[idx('Variant SKU')];
    const size = r[idx('Option1 Value')];
    const qty = Number(r[idx('Variant Inventory Qty')]);
    assert.ok(sku && !skus.has(sku), `duplicate or missing SKU: ${sku}`);
    skus.add(sku);
    if (!sizesByHandle.has(handle)) sizesByHandle.set(handle, []);
    sizesByHandle.get(handle).push({ size, qty });
  }

  assert.equal(sizesByHandle.size, 14);
  for (const product of catalog.products) {
    const entries = sizesByHandle.get(product.handle);
    assert.deepEqual(
      entries.map((e) => e.size),
      ['32', '34', '36', '38', '40', '42', '44', '46', 'Custom Fit'],
    );
    for (const entry of entries) {
      if (product.status === 'draft' || entry.size === '44' || entry.size === '46') {
        assert.equal(entry.qty, 0);
      } else {
        assert.ok(entry.qty > 0, `${product.handle} size ${entry.size} should have stock`);
      }
    }
  }
});

test('Utsav tailoring helpers, colorway swatches, live-Shopify-first merge, and homepage deduplication work cleanly', () => {
  const bridal = loadTsModule('src/lib/bridalVol3Products.ts');
  const colorways = loadTsModule('src/config/colorwayLinks.ts');

  const active = bridal.getActiveBridalVol3Products();
  assert.equal(active.length, 10);
  assert.equal(bridal.inchesToCm(38), 96.5);

  // Colorway swatches link sibling shades cleanly
  const palaceSwatches = colorways.getColorwaysForHandle(
    'rani-magenta-silk-rajputana-palace-bridal-lehenga-double-dupatta',
  );
  assert.equal(palaceSwatches.swatches.length, 3);
  for (const swatch of palaceSwatches.swatches) {
    assert.ok(bridal.getBridalVol3ProductByHandle(swatch.handle));
  }

  // Custom tailoring attributes serialize styling + measurement profile
  const state = {
    ...bridal.createDefaultUtsavTailoringState(),
    frontNeck: 'deep-u-neck',
    sleeveStyle: 'half-sleeve',
    skirtCancan: 'medium-cancan',
    choliBust: '36.5',
    lehengaWaist: '30',
    lehengaLength: '41.5',
  };
  const customAttrs = bridal.buildUtsavTailoringAttributes(state, true);
  assert.ok(customAttrs.some((a) => a.key === 'Front Neck Preference' && /U-Neck/.test(a.value)));
  assert.ok(customAttrs.some((a) => a.key === 'Choli Profile' && a.value.includes('Bust 36.5 in')));
  assert.ok(
    customAttrs.some(
      (a) => a.key === 'Lehenga Profile' && a.value.includes('Waist 30 in') && a.value.includes('Length 41.5 in'),
    ),
  );

  // Live Shopify record replaces preview record with zero duplication
  const targetHandle = 'sindoori-red-silk-heritage-jharokha-bridal-lehenga-double-dupatta';
  const fakeLive = {
    node: {
      ...bridal.getBridalVol3ProductByHandle(targetHandle),
      id: 'gid://shopify/Product/9999999999',
    },
  };
  const merged = bridal.mergeBridalVol3Catalog([fakeLive]);
  assert.equal(merged.length, 10);
  const resolved = merged.find((p) => p.node.handle === targetHandle);
  assert.equal(resolved.node.id, 'gid://shopify/Product/9999999999');
  assert.equal(bridal.isPreviewOnlyBridalProduct(resolved.node), false);

  // Four curated homepage slots are 4 distinct design families, and sibling colorways deduplicate
  const curatedList = Object.values(CURATED_BRIDAL_VOL3_HOMEPAGE_SLOTS);
  assert.equal(curatedList.length, 4);
  for (let i = 0; i < curatedList.length; i += 1) {
    for (let j = i + 1; j < curatedList.length; j += 1) {
      assert.equal(isSameDesignFamily(curatedList[i], curatedList[j]), false);
    }
  }
  const distinctGrid = selectDistinctHomepageProducts(active, {
    limit: 5,
    hardAvoid: curatedList,
  });
  assert.equal(distinctGrid.length, 1);
  assert.equal(
    distinctGrid[0].node.handle,
    'vermilion-red-silk-peacock-scallop-bridal-lehenga-double-dupatta',
  );

  // applyCuratedBridalVol3Slots upgrades to live Shopify CDN URL automatically when imported
  const upgraded = applyCuratedBridalVol3Slots(
    { hero: {}, categories: {}, promos: {} },
    {
      products: {
        edges: [
          {
            node: {
              handle: targetHandle,
              title: fakeLive.node.title,
              availableForSale: true,
              priceRange: { minVariantPrice: { amount: '443.89' } },
              images: {
                edges: [
                  {
                    node: {
                      url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-bv3-175-sindoori-jharokha-1.jpg?v=1',
                      altText: 'Sindoori Red Bridal Lehenga',
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
  );
  assert.match(upgraded.hero['wedding-edit'].url, /^https:\/\/cdn\.shopify\.com\//);
  assert.equal(upgraded.categories.lehengas.url, '/images/bridal-vol3/luxemia-bv3-171-fuchsia-paisley-1.jpg');
});

test('ProductInfo renders full Utsav standard (32-46) + Custom Fit tailoring studio and colorway swatches on Vol-3 bridal lehengas', () => {
  const result = buildSync({
    stdin: {
      contents: `
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { MemoryRouter } from 'react-router-dom';
        import { ProductInfo } from '@/components/product/ProductInfo';
        import { getBridalVol3ProductByHandle } from '@/lib/bridalVol3Products';
        const product = getBridalVol3ProductByHandle('sindoori-red-silk-heritage-jharokha-bridal-lehenga-double-dupatta')!;
        export const html = renderToStaticMarkup(
          <MemoryRouter initialEntries={['/product/' + product.handle]}>
            <ProductInfo product={product} />
          </MemoryRouter>
        );
        export const customHtml = renderToStaticMarkup(
          <MemoryRouter initialEntries={['/product/' + product.handle + '?variant=LM-BV3-175-CUSTOM']}>
            <ProductInfo product={product} />
          </MemoryRouter>
        );
      `,
      resolveDir: root,
      loader: 'tsx',
    },
    bundle: true,
    jsx: 'automatic',
    write: false,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    alias: { '@': path.join(root, 'src') },
    define: {
      'import.meta.env': JSON.stringify({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'test-key',
      }),
    },
  });
  globalThis.localStorage ??= {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, mod, mod.exports);
  const { html, customHtml } = mod.exports;

  assert.match(html, /Sindoori Red Silk Heritage Jharokha Zardosi Bridal Lehenga Choli with Double Dupatta/);
  assert.match(html, /\$443\.89/);
  assert.match(html, /\$577\.06/);
  assert.match(html, /data-testid="utsav-bridal-tailoring-panel"/);
  assert.match(html, /Standard Size \(32–42\)/);
  assert.match(html, /Custom Tailored \(MTM\)/);
  assert.match(html, /Selected: Size 38/);
  assert.match(html, /Full Size Chart \(32–46\)/);
  assert.match(html, /Custom Fit/);
  assert.match(html, /Rani Pink/);
  assert.doesNotMatch(html, /\b(?:tathastu|anaara|amrah|wholetex|kapdavilla)\b/i);

  // When Custom Fit is selected, full Utsav neckline, sleeve, choli length,
  // guided 10-field measurement grid, AND measurement confirmation render cleanly
  assert.match(customHtml, /data-testid="utsav-custom-design-controls"/);
  assert.match(customHtml, /Front Neck Style/);
  assert.match(customHtml, /Back Neck Style/);
  assert.match(customHtml, /Sleeve Style/);
  assert.match(customHtml, /Choli Length/);
  assert.match(customHtml, /Around Bust/);
  assert.match(customHtml, /Skirt Waist/);
  assert.match(customHtml, /Skirt Len \(w\/ Heels\)/);
  assert.match(customHtml, /Measurements must be confirmed before alterations/);
});

