import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  LATEST_HOMEPAGE_IMAGERY_QUERY,
  isSameDesignFamily,
  selectDistinctHomepageProducts,
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
  description = '',
  occasion = null,
  price = '120.00',
}) {
  return {
    node: {
      id: `gid://shopify/Product/${handle}`,
      handle,
      title,
      description,
      productType,
      tags,
      occasionMetafield: occasion ? { value: occasion } : null,
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

test('isSameDesignFamily catches colorway suffixes, prefixes, series motifs, and vendor codes', () => {
  // Exact screenshot case: teal vs lavender vs coral Embroidered Net Palazzo Suit
  assert.equal(
    isSameDesignFamily(
      {
        handle: 'embroidered-net-palazzo-suit-teal',
        title: 'Embroidered Net Palazzo Suit - Teal',
        url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/net-suit-teal.jpg?v=1',
      },
      {
        handle: 'embroidered-net-palazzo-suit-lavender',
        title: 'Embroidered Net Palazzo Suit - Lavender',
        url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/net-suit-lavender.jpg?v=2',
      },
    ),
    true,
  );
  assert.equal(
    isSameDesignFamily(
      {
        handle: 'embroidered-net-palazzo-suit-coral',
        title: 'Embroidered Net Palazzo Suit - Coral',
      },
      {
        handle: 'embroidered-net-palazzo-suit-teal',
        title: 'Embroidered Net Palazzo Suit - Teal',
      },
    ),
    true,
  );

  // Ready-to-wear saree colorways & printed crepe palazzo suit colorways
  assert.equal(
    isSameDesignFamily(
      { handle: 'ready-to-wear-embroidered-saree-light-pink', title: 'Ready to Wear Embroidered Saree Light Pink' },
      { handle: 'ready-to-wear-embroidered-saree-rose-pink', title: 'Ready to Wear Embroidered Saree Rose Pink' },
    ),
    true,
  );
  assert.equal(
    isSameDesignFamily(
      { handle: 'printed-crape-palazzo-suit-yellow-green', title: 'Printed Crape Palazzo Suit Yellow Green' },
      { handle: 'printed-crape-palazzo-suit-pink-purple', title: 'Printed Crepe Palazzo Suit Pink Purple' },
    ),
    true,
  );

  // Leading color + border/motif variations from the same saree line
  assert.equal(
    isSameDesignFamily(
      { handle: 'dusty-rose-floral-embroidered-silk-saree-with-scalloped-border', title: 'Dusty Rose Floral Embroidered Silk Saree with Scalloped Border' },
      { handle: 'olive-gold-floral-embroidered-silk-saree-with-scalloped-border', title: 'Olive Gold Floral Embroidered Silk Saree with Scalloped Border' },
    ),
    true,
  );
  assert.equal(
    isSameDesignFamily(
      { handle: 'maroon-banarasi-silk-saree-with-ornate-pallu', title: 'Maroon Banarasi Silk Handwork Saree with Ornate Pallu – Wedding' },
      { handle: 'lilac-banarasi-silk-saree-with-medallion-motifs', title: 'Lilac Banarasi Silk Handwork Saree – Wedding' },
    ),
    true,
  );

  // Vendor code colorways
  assert.equal(
    isSameDesignFamily(
      {
        handle: 'midnight-blue-lehenga-a',
        title: 'Midnight Blue Velvet Lehenga',
        url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-6032-blue-1.jpg?v=1',
      },
      {
        handle: 'wine-lehenga-b',
        title: 'Wine Organza Skirt',
        url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-6032-wine-1.jpg?v=2',
      },
    ),
    true,
  );

  // Truly distinct designs remain distinct
  assert.equal(
    isSameDesignFamily(
      { handle: 'embroidered-net-palazzo-suit-teal', title: 'Embroidered Net Palazzo Suit Teal', price: 110, createdAt: '2026-11-15T10:00:00Z' },
      { handle: 'printed-crape-palazzo-suit-yellow-green', title: 'Printed Crape Palazzo Suit Yellow Green', price: 88, createdAt: '2026-11-15T10:00:00Z' },
    ),
    false,
  );
  assert.equal(
    isSameDesignFamily(
      { handle: 'olive-green-chinon-embroidered-readymade-palazzo-suit', title: 'Olive Green Chinon Embroidered Palazzo Suit', price: 96, createdAt: '2026-11-01T10:00:00Z' },
      { handle: 'off-white-crepe-embroidered-readymade-sharara-suit', title: 'Off-White Crepe Embroidered Sharara Suit', price: 96, createdAt: '2026-11-01T10:00:00Z' },
    ),
    false,
  );
});

test('selectLatestHomepageImagery never repeats colorway variants across hero, categories, or side-by-side promos', () => {
  const fixture = {
    newest: {
      edges: [
        // Archived item must be skipped
        makeEdge({
          handle: 'archived-newest-lehenga',
          title: 'Archived Velvet Lehenga',
          productType: 'Lehenga Choli',
          createdAt: '2026-11-18T12:00:00Z',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/archived.jpg?v=1795050000',
        }),
        // 3 colorways of the same Ready-to-Wear Saree — at most ONE may appear
        makeEdge({
          handle: 'ready-to-wear-embroidered-saree-light-pink',
          title: 'Ready to Wear Embroidered Saree - Light Pink',
          productType: 'Ready-to-Wear Saree',
          createdAt: '2026-11-15T12:00:00Z',
          price: '119.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/rtw-saree-light-pink.jpg?v=1794800010',
        }),
        makeEdge({
          handle: 'ready-to-wear-embroidered-saree-rose-pink',
          title: 'Ready to Wear Embroidered Saree - Rose Pink',
          productType: 'Ready-to-Wear Saree',
          createdAt: '2026-11-15T11:59:00Z',
          price: '119.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/rtw-saree-rose-pink.jpg?v=1794800009',
        }),
        // 3 colorways of the same Embroidered Net Palazzo Suit — at most ONE may appear
        makeEdge({
          handle: 'embroidered-net-palazzo-suit-coral',
          title: 'Embroidered Net Palazzo Suit - Coral',
          productType: 'Palazzo Suit',
          createdAt: '2026-11-15T11:00:00Z',
          price: '129.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/net-palazzo-coral.jpg?v=1794800008',
        }),
        makeEdge({
          handle: 'embroidered-net-palazzo-suit-teal',
          title: 'Embroidered Net Palazzo Suit - Teal',
          productType: 'Palazzo Suit',
          createdAt: '2026-11-15T10:59:00Z',
          price: '129.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/net-palazzo-teal.jpg?v=1794800007',
        }),
        makeEdge({
          handle: 'embroidered-net-palazzo-suit-lavender',
          title: 'Embroidered Net Palazzo Suit - Lavender',
          productType: 'Palazzo Suit',
          createdAt: '2026-11-15T10:58:00Z',
          price: '129.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/net-palazzo-lavender.jpg?v=1794800006',
        }),
        // 2 colorways of Printed Crape Palazzo Suit — at most ONE may appear
        makeEdge({
          handle: 'printed-crape-palazzo-suit-yellow-green',
          title: 'Printed Crape Palazzo Suit - Yellow Green',
          productType: 'Palazzo Suit',
          createdAt: '2026-11-15T10:30:00Z',
          price: '89.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/printed-crape-yg.jpg?v=1794800005',
        }),
        makeEdge({
          handle: 'printed-crape-palazzo-suit-pink-purple',
          title: 'Printed Crape Palazzo Suit - Pink Purple',
          productType: 'Palazzo Suit',
          createdAt: '2026-11-15T10:29:00Z',
          price: '89.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/printed-crape-pp.jpg?v=1794800004',
        }),
        // Navratri/chaniya choli lehengas (tagged, described, or multicolor lace) must NEVER be selected
        makeEdge({
          handle: 'multicolor-georgette-lehenga-choli-with-lace',
          title: 'Multicolor Georgette Lehenga Choli with Lace',
          productType: 'Lehenga Choli',
          tags: ['occasion:navratri'],
          createdAt: '2026-11-16T10:00:00Z',
          price: '142.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/georgette-lace-lehenga.jpg?v=1794900000',
        }),
        makeEdge({
          handle: 'pink-georgette-flared-lehenga-choli',
          title: 'Pink Georgette Flared Lehenga Choli',
          description: 'Lightweight chaniya choli styled with oxidized jewelry for Garba and Dandiya nights.',
          productType: 'Lehenga Choli',
          createdAt: '2026-11-16T09:00:00Z',
          price: '78.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/garba-pink.jpg?v=1794890000',
        }),
        makeEdge({
          handle: 'beige-heritage-print-chinon-silk-lehenga-choli',
          title: 'Beige Heritage Print Chinon Silk Lehenga Choli',
          productType: 'Lehenga Choli',
          createdAt: '2026-11-12T10:00:00Z',
          price: '95.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/heritage-print-lehenga.jpg?v=1794500000',
        }),
        // Genuine wedding/bridal/reception lehengas, sarees, suits, indowestern, menswear, kids, jewelry
        makeEdge({
          handle: 'ruby-pink-sequin-embroidered-georgette-lehenga-choli',
          title: 'Ruby Pink Sequin Embroidered Georgette Wedding Lehenga Choli',
          productType: 'Wedding Lehenga',
          tags: ['occasion:wedding', 'occasion:reception'],
          createdAt: '2026-11-09T10:00:00Z',
          price: '198.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/ruby-pink-wedding-lehenga.jpg?v=1794200000',
        }),
        makeEdge({
          handle: 'grey-georgette-embroidered-wedding-lehenga-choli',
          title: 'Grey Georgette Embroidered Unstitched Lehenga Choli – Wedding',
          productType: 'Lehenga Choli',
          tags: ['occasion:wedding'],
          createdAt: '2026-11-01T12:00:00Z',
          price: '79.50',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/grey-wedding-lehenga-4797-321-B_1.jpg?v=1793569611',
        }),
        makeEdge({
          handle: 'off-white-crepe-embroidered-readymade-sharara-suit',
          title: 'Off-White Crepe Embroidered Sharara Suit – Festive Wear',
          productType: 'Sharara Suit',
          createdAt: '2026-11-01T11:00:00Z',
          price: '96.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/sharara-LG-2160_1.jpg?v=1793569593',
        }),
        makeEdge({
          handle: 'teal-blue-chanderi-embroidered-readymade-salwar-suit',
          title: 'Teal Blue Chanderi Embroidered Salwar Suit – Festive Wear',
          productType: 'Salwar Suit',
          createdAt: '2026-11-01T10:00:00Z',
          price: '93.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/chanderi-LG-2158-A_1.jpg?v=1793569590',
        }),
        makeEdge({
          handle: 'dusty-rose-floral-embroidered-silk-saree-with-scalloped-border',
          title: 'Dusty Rose Floral Embroidered Silk Saree with Scalloped Border',
          productType: 'Silk Saree',
          createdAt: '2026-10-30T10:00:00Z',
          price: '58.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/dusty-rose-scalloped.jpg?v=1793381700',
        }),
        makeEdge({
          handle: 'olive-gold-floral-embroidered-silk-saree-with-scalloped-border',
          title: 'Olive Gold Floral Embroidered Silk Saree with Scalloped Border',
          productType: 'Silk Saree',
          createdAt: '2026-10-30T09:59:00Z',
          price: '58.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/olive-gold-scalloped.jpg?v=1793381690',
        }),
        makeEdge({
          handle: 'clear-ornate-teardrop-statement-jewelry',
          title: 'Clear Ornate Teardrop Statement Jewelry Set',
          productType: 'Jewelry Set',
          createdAt: '2026-10-30T08:00:00Z',
          price: '45.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/teardrop-jewelry.jpg?v=1793380000',
        }),
        makeEdge({
          handle: 'pista-green-banarasi-silk-saree-with-botanical-motifs',
          title: 'Pista Green Banarasi Silk Handwork Saree – Wedding',
          productType: 'Banarasi Saree',
          createdAt: '2026-10-26T12:00:00Z',
          price: '102.08',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/pista-banarasi.jpg?v=1793034576',
        }),
        makeEdge({
          handle: 'allover-floral-embroidered-linen-kurta-pajama-set',
          title: 'Allover Floral Embroidered Linen Kurta Pajama Set',
          productType: 'Kurta Pajama Set',
          createdAt: '2026-10-26T09:00:00Z',
          price: '72.19',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/linen-kurta.jpg?v=1793034341',
        }),
        makeEdge({
          handle: 'midnight-blue-net-floral-embroidered-lehenga-choli',
          title: 'Midnight Blue Net Floral Embroidered Lehenga Choli',
          productType: 'Lehenga Choli',
          tags: ['occasion:reception'],
          createdAt: '2026-10-19T10:00:00Z',
          price: '130.00',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-6032-blue-1.jpg?v=1792438550',
        }),
        makeEdge({
          handle: 'lilac-organza-embroidered-lehenga-choli',
          title: 'Lilac Organza Embroidered Wedding Lehenga Choli',
          productType: 'Wedding Lehenga',
          tags: ['occasion:wedding-guest', 'role:bridesmaid'],
          createdAt: '2026-10-15T10:00:00Z',
          price: '113.13',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-405938-1.jpg?v=1792095979',
        }),
        makeEdge({
          handle: 'fuchsia-pink-embroidered-chinon-three-piece-jacket-set-indian-wedding-outfit',
          title: 'Fuchsia Pink Embroidered Chinon Three-Piece Jacket Set',
          productType: 'Indo-Western Set',
          createdAt: '2026-10-09T10:00:00Z',
          price: '154.99',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/luxemia-4584835784-1.jpg?v=1791589636',
        }),
        makeEdge({
          handle: 'kids-kurta-set-yellow',
          title: 'Yellow Malai Satin Kids Boy Kurta Pajama with Koti Jacket',
          productType: 'Kids Kurta Set',
          createdAt: '2026-10-05T10:00:00Z',
          price: '66.99',
          url: 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/kids-yellow.jpg?v=1791220369',
        }),
      ],
    },
  };

  const result = selectLatestHomepageImagery(fixture, {
    archivedHandles: ['archived-newest-lehenga'],
  });

  const allEntries = [
    ...Object.entries(result.hero).map(([k, v]) => [`hero.${k}`, v]),
    ...Object.entries(result.categories).map(([k, v]) => [`categories.${k}`, v]),
    ...Object.entries(result.promos).map(([k, v]) => [`promos.${k}`, v]),
  ];

  assert.equal(allEntries.length, 14);
  for (const [slot, entry] of allEntries) {
    assert.ok(entry, `expected slot ${slot} to be populated`);
    assert.notEqual(
      entry.handle,
      'multicolor-georgette-lehenga-choli-with-lace',
      `Navratri multicolor lehenga must never appear in ${slot}`,
    );
    assert.notEqual(
      entry.handle,
      'pink-georgette-flared-lehenga-choli',
      `Garba/chaniya choli lehenga must never appear in ${slot}`,
    );
    assert.notEqual(
      entry.handle,
      'beige-heritage-print-chinon-silk-lehenga-choli',
      `print-only lehenga must not overtake embroidered wedding lehengas in ${slot}`,
    );
  }

  // Wedding hero slide picks the newest genuine wedding lehenga
  assert.equal(
    result.hero['wedding-edit'].handle,
    'ruby-pink-sequin-embroidered-georgette-lehenga-choli',
  );
  // Lehengas & Festive Suits hero slide picks the newest embroidered suit (not printed)
  assert.equal(
    result.hero['lehengas-suits'].handle,
    'embroidered-net-palazzo-suit-coral',
  );
  // Category lehenga and bridal-party promo pick distinct genuine embroidered wedding lehengas
  assert.equal(
    result.categories.lehengas.handle,
    'midnight-blue-net-floral-embroidered-lehenga-choli',
  );
  assert.equal(
    result.promos['bridal-party'].handle,
    'lilac-organza-embroidered-lehenga-choli',
  );

  // Pairwise verify NO two slots anywhere share the same handle, image, OR design family
  for (let i = 0; i < allEntries.length; i += 1) {
    for (let j = i + 1; j < allEntries.length; j += 1) {
      const [slotA, a] = allEntries[i];
      const [slotB, b] = allEntries[j];
      assert.equal(
        isSameDesignFamily(a, b),
        false,
        `slots ${slotA} (${a.handle}) and ${slotB} (${b.handle}) must not be the same item or colorway family`,
      );
    }
  }

  // Homepage New Arrivals grid also deduplicates colorways and avoids promo banner overlap
  const grid = selectDistinctHomepageProducts(fixture.newest.edges.slice(1), {
    limit: 6,
    hardAvoid: Object.values(result.promos),
    softAvoid: [...Object.values(result.hero), ...Object.values(result.categories)],
  });
  for (let i = 0; i < grid.length; i += 1) {
    for (let j = i + 1; j < grid.length; j += 1) {
      assert.equal(
        isSameDesignFamily(grid[i], grid[j]),
        false,
        `New Arrivals cards ${grid[i].node.handle} and ${grid[j].node.handle} must not be colorway clones`,
      );
    }
    for (const promo of Object.values(result.promos)) {
      assert.equal(
        isSameDesignFamily(grid[i], promo),
        false,
        `New Arrivals card ${grid[i].node.handle} must not repeat promo banner ${promo.handle}`,
      );
    }
  }

  assert.match(
    toSizedShopifyImageUrl(result.hero['new-arrivals'].url, 900, 'webp'),
    /width=900.*format=webp|format=webp.*width=900/,
  );
});

test('committed latestHomepageImagery snapshot contains zero archived handles and zero duplicate design families', () => {
  const snapshot = JSON.parse(
    fs.readFileSync(path.join(root, 'src/data/latestHomepageImagery.json'), 'utf8'),
  );
  const archived = new Set(
    JSON.parse(
      fs.readFileSync(path.join(root, 'src/data/reversiblyArchivedProductHandles.json'), 'utf8'),
    ),
  );
  const gone = new Set(
    JSON.parse(
      fs.readFileSync(path.join(root, 'src/data/legacyGoneProductHandles.json'), 'utf8'),
    ),
  );

  const entries = [
    ...Object.entries(snapshot.hero).map(([k, v]) => [`hero.${k}`, v]),
    ...Object.entries(snapshot.categories)
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => [`categories.${k}`, v]),
    ...Object.entries(snapshot.promos).map(([k, v]) => [`promos.${k}`, v]),
  ];
  assert.equal(entries.length, 13);

  for (const [, entry] of entries) {
    assert.equal(archived.has(entry.handle), false, `archived handle in snapshot: ${entry.handle}`);
    assert.equal(gone.has(entry.handle), false, `gone handle in snapshot: ${entry.handle}`);
    if (entry.url.startsWith('/images/bridal-vol3/')) {
      assert.equal(
        fs.existsSync(path.join(root, 'public', entry.url)),
        true,
        `missing local bridal image: ${entry.url}`,
      );
      assert.equal(
        fs.existsSync(path.join(root, 'public', entry.webpUrl)),
        true,
        `missing local bridal webp image: ${entry.webpUrl}`,
      );
    } else {
      assert.match(entry.url, /^https:\/\/cdn\.shopify\.com\//);
    }
  }

  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const [slotA, a] = entries[i];
      const [slotB, b] = entries[j];
      assert.equal(
        isSameDesignFamily(a, b),
        false,
        `committed snapshot slots ${slotA} (${a.handle}) and ${slotB} (${b.handle}) share a design family`,
      );
    }
  }
});
