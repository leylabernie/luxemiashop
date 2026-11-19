import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  LATEST_HOMEPAGE_IMAGERY_QUERY,
  selectLatestHomepageImagery,
  toSizedShopifyImageUrl,
} from '../src/lib/selectLatestHomepageImagery.mjs';
import { isCacheableStorefrontOperation } from '../src/lib/checkoutCartIntegrity.ts';

const root = process.cwd();

function makeEdge({
  handle,
  title,
  productType,
  createdAt,
  url,
  width = 900,
  height = 1200,
  availableForSale = true,
  tags = [],
  price = '120.00',
}) {
  return {
    node: {
      id: `gid://shopify/Product/${handle}`,
      handle,
      title,
      productType,
      tags,
      availableForSale,
      createdAt,
      priceRange: { minVariantPrice: { amount: price } },
      images: {
        edges: [{ node: { url, altText: title, width, height } }],
      },
    },
  };
}

test('LATEST_HOMEPAGE_IMAGERY_QUERY is treated as a cacheable Storefront read', () => {
  assert.equal(isCacheableStorefrontOperation(LATEST_HOMEPAGE_IMAGERY_QUERY), true);
  assert.match(LATEST_HOMEPAGE_IMAGERY_QUERY, /sortKey:\s*CREATED_AT,\s*reverse:\s*true/);
});

test('selectLatestHomepageImagery picks newest distinct active images and skips archived/gone items', () => {
  const fixture = {
    newest: {
      edges: [
        makeEdge({
          handle: 'archived-newest-lehenga',
          title: 'Archived Newest Lehenga',
          productType: 'Lehenga Choli',
          createdAt: '2026-11-18T12:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/archived.jpg?v=1795050000',
        }),
        makeEdge({
          handle: 'latest-bridal-lehenga-1',
          title: 'Rose Silk Embroidered Wedding Lehenga',
          productType: 'Lehenga Choli',
          createdAt: '2026-11-18T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-lehenga-1.jpg?v=1795040000',
        }),
        makeEdge({
          handle: 'latest-palazzo-suit-1',
          title: 'Emerald Chinon Palazzo Suit Set',
          productType: 'Palazzo Suit',
          createdAt: '2026-11-17T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-suit-1.jpg?v=1794950000',
        }),
        makeEdge({
          handle: 'latest-banarasi-saree-1',
          title: 'Gold Tissue Banarasi Silk Saree',
          productType: 'Banarasi Saree',
          createdAt: '2026-11-16T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-saree-1.jpg?v=1794860000',
        }),
        makeEdge({
          handle: 'latest-lehenga-2',
          title: 'Ivory Organza Reception Lehenga',
          productType: 'Lehenga Choli',
          createdAt: '2026-11-15T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-lehenga-2.jpg?v=1794770000',
        }),
        makeEdge({
          handle: 'latest-sharara-1',
          title: 'Plum Georgette Readymade Sharara Suit',
          productType: 'Sharara Suit',
          createdAt: '2026-11-14T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-sharara-1.jpg?v=1794680000',
        }),
        makeEdge({
          handle: 'latest-saree-2',
          title: 'Blush Silk Embroidered Saree',
          productType: 'Silk Saree',
          createdAt: '2026-11-13T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-saree-2.jpg?v=1794590000',
        }),
        makeEdge({
          handle: 'latest-lehenga-3',
          title: 'Lilac Floral Wedding Lehenga',
          productType: 'Lehenga Choli',
          createdAt: '2026-11-12T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-lehenga-3.jpg?v=1794500000',
        }),
        makeEdge({
          handle: 'latest-suit-2',
          title: 'Teal Chanderi Salwar Suit',
          productType: 'Salwar Suit',
          createdAt: '2026-11-11T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-suit-2.jpg?v=1794410000',
        }),
        makeEdge({
          handle: 'latest-indowestern-1',
          title: 'Champagne Embroidered Indo-Western Jacket Set',
          productType: 'Indo-Western Set',
          createdAt: '2026-11-10T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-iw-1.jpg?v=1794320000',
        }),
        makeEdge({
          handle: 'latest-mens-1',
          title: 'Ivory Silk Kurta Pajama with Nehru Jacket',
          productType: 'Kurta Pajama Set',
          createdAt: '2026-11-09T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-mens-1.jpg?v=1794230000',
        }),
        makeEdge({
          handle: 'latest-kids-1',
          title: 'Saffron Kids Boy Kurta Pajama Set',
          productType: 'Kids Kurta Set',
          createdAt: '2026-11-08T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-kids-1.jpg?v=1794140000',
        }),
        makeEdge({
          handle: 'latest-promo-rts',
          title: 'Mustard Silk Festive Anarkali Set',
          productType: 'Anarkali Suit',
          createdAt: '2026-11-07T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-rts.jpg?v=1794050000',
        }),
        makeEdge({
          handle: 'latest-promo-bridal',
          title: 'Maroon Zari Bridesmaid Lehenga Set',
          productType: 'Wedding Lehenga',
          createdAt: '2026-11-06T10:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/latest-bridal.jpg?v=1793960000',
        }),
      ],
    },
  };

  const result = selectLatestHomepageImagery(fixture, {
    archivedHandles: ['archived-newest-lehenga'],
  });

  assert.equal(result.hero['wedding-edit'].handle, 'latest-bridal-lehenga-1');
  assert.equal(result.hero['new-arrivals'].handle, 'latest-palazzo-suit-1');
  assert.equal(result.hero['sarees-edit'].handle, 'latest-banarasi-saree-1');
  assert.equal(result.hero['lehengas-suits'].handle, 'latest-lehenga-2');
  assert.equal(result.hero['ready-to-ship'].handle, 'latest-sharara-1');
  assert.equal(result.categories.sarees.handle, 'latest-saree-2');
  assert.equal(result.categories.lehengas.handle, 'latest-lehenga-3');
  assert.equal(result.categories.suits.handle, 'latest-suit-2');
  assert.equal(result.categories.indowestern.handle, 'latest-indowestern-1');
  assert.equal(result.categories.menswear.handle, 'latest-mens-1');
  assert.equal(result.categories.kids.handle, 'latest-kids-1');
  assert.equal(result.promos['ready-to-ship'].handle, 'latest-promo-rts');
  assert.equal(result.promos['bridal-party'].handle, 'latest-promo-bridal');

  const allHandles = [
    ...Object.values(result.hero),
    ...Object.values(result.categories).filter(Boolean),
    ...Object.values(result.promos),
  ].map((entry) => entry.handle);
  assert.equal(new Set(allHandles).size, allHandles.length, 'every homepage image slot should be distinct');
  assert.match(toSizedShopifyImageUrl(result.hero['new-arrivals'].url, 900, 'webp'), /width=900.*format=webp|format=webp.*width=900/);
});

test('committed latestHomepageImagery snapshot contains zero retired or archived handles', () => {
  const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'src/data/latestHomepageImagery.json'), 'utf8'));
  const archived = new Set(JSON.parse(fs.readFileSync(path.join(root, 'src/data/reversiblyArchivedProductHandles.json'), 'utf8')));
  const gone = new Set(JSON.parse(fs.readFileSync(path.join(root, 'src/data/legacyGoneProductHandles.json'), 'utf8')));

  const entries = [
    ...Object.values(snapshot.hero),
    ...Object.values(snapshot.categories).filter(Boolean),
    ...Object.values(snapshot.promos),
  ];
  assert.equal(entries.length, 13);
  const handles = entries.map((e) => e.handle);
  assert.equal(new Set(handles).size, entries.length, 'committed snapshot must have unique handles');
  for (const entry of entries) {
    assert.equal(archived.has(entry.handle), false, `archived handle in snapshot: ${entry.handle}`);
    assert.equal(gone.has(entry.handle), false, `gone handle in snapshot: ${entry.handle}`);
    assert.match(entry.url, /^https:\/\/cdn\.shopify\.com\//);
  }
});
