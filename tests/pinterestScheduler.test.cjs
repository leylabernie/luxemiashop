const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pinCopy = require('../src/lib/pinterestPinCopy.cjs');

const SCHEDULER_CSV = 'docs/growth/pinterest/luxemia-pinterest-scheduler-corrected.csv';
const BOARDS_CSV = 'docs/growth/pinterest/luxemia-pinterest-boards-corrected.csv';

/** Minimal RFC4180 parser — the generated cells contain commas and quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') { cell += '"'; index += 1; } else { quoted = false; }
      } else {
        cell += character;
      }
      continue;
    }
    if (character === '"') { quoted = true; continue; }
    if (character === ',') { row.push(cell); cell = ''; continue; }
    if (character === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    if (character === '\r') continue;
    cell += character;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [header, ...body] = rows;
  return body.filter((line) => line.some((value) => value.trim() !== ''))
    .map((line) => Object.fromEntries(header.map((name, position) => [name, line[position] ?? ''])));
}

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const pins = parseCsv(read(SCHEDULER_CSV));
const boards = parseCsv(read(BOARDS_CSV));

const CLAIM_COLUMNS = [
  'Pin Title (SEO Optimized)',
  'SEO Pin Description',
  'Destination URL',
  'Notes / Callouts',
];

const FORBIDDEN = [
  [/100%\s*(?:breathable\s*)?cotton/i, '100% cotton lining'],
  [/insur/i, 'shipment insurance'],
  [/handcraft/i, 'handcrafted'],
  [/guarantee/i, 'fit guarantee'],
  [/on all stitched outfits/i, 'margins on every outfit'],
  [/dispatch(?:es|ing)?[^.]{0,40}5[–-]7\s*(?:business\s*)?days/i, 'dispatch in 5-7 days'],
  [/luxemia\.shop\/products\//i, 'non-canonical /products/ path'],
];

// The four handles from the owner's original sheet that do not exist anywhere
// in the catalog. They must never be scheduled again.
const INVENTED_HANDLES = [
  'ready-to-wear-embroidered-saree-light-pink',
  'dusty-pink-silk-beaded-sharara-suit',
  'embroidered-net-palazzo-suit-coral',
  'sindoori-red-silk-bridal-lehenga',
];

test('the corrected scheduler exists and fills every board’s weekly pin goal', () => {
  assert.ok(pins.length > 0, 'scheduler CSV is empty');
  const goals = Object.fromEntries(boards.map((board) => [board['Board Name'], Number(board['Weekly Pin Goal'])]));
  const scheduled = {};
  pins.forEach((pin) => { scheduled[pin['Target Board']] = (scheduled[pin['Target Board']] || 0) + 1; });
  Object.entries(goals).forEach(([board, goal]) => {
    assert.equal(scheduled[board], goal, `${board}: scheduled ${scheduled[board]} of ${goal}`);
  });
});

test('every scheduled destination is a canonical, live, indexable product URL', () => {
  const inventory = new Set(JSON.parse(read('scripts/approved-sitemap-inventory.json')).paths);
  const gone = new Set((read('src/lib/goneRoutes.ts').match(/"([a-z0-9-]+)"/g) || []).map((value) => value.replace(/"/g, '')));
  const feed = read('public/merchant-feed.xml');

  pins.forEach((pin) => {
    const url = pin['Destination URL'];
    const handle = pin['Product Handle'];
    assert.match(url, /^https:\/\/luxemia\.shop\/product\/[a-z0-9-]+$/, `${pin['Pin ID']}: non-canonical URL ${url}`);
    assert.equal(url, `https://luxemia.shop/product/${handle}`, `${pin['Pin ID']}: URL and handle disagree`);
    assert.ok(!gone.has(handle), `${pin['Pin ID']}: ${handle} is a 410 gone route`);
    assert.ok(inventory.has(`/product/${handle}`), `${pin['Pin ID']}: ${handle} is not in the approved sitemap inventory`);
    assert.ok(feed.includes(`<g:link>${url}`) || feed.includes(handle), `${pin['Pin ID']}: ${handle} is not in the live merchant feed`);
    assert.equal(pin['Availability'], 'in_stock', `${pin['Pin ID']}: ${handle} is not in stock`);
    assert.ok(!INVENTED_HANDLES.includes(handle), `${pin['Pin ID']}: resurrected an invented handle`);
    assert.ok(/^https:\/\/cdn\.shopify\.com\//.test(pin['Image URL']), `${pin['Pin ID']}: missing pin image`);
  });

  const handles = pins.map((pin) => pin['Product Handle']);
  assert.equal(new Set(handles).size, handles.length, 'the same product is scheduled twice');
});

test('pin copy stays inside Pinterest limits and keeps the delivery truth', () => {
  pins.forEach((pin) => {
    const title = pin['Pin Title (SEO Optimized)'];
    const description = pin['SEO Pin Description'];
    assert.ok(title.length > 0 && title.length <= pinCopy.PIN_TITLE_MAX_LENGTH, `${pin['Pin ID']}: title ${title.length} chars`);
    assert.ok(description.length <= pinCopy.PIN_DESCRIPTION_MAX_LENGTH, `${pin['Pin ID']}: description ${description.length} chars`);
    assert.ok(description.includes(pin['Destination URL']), `${pin['Pin ID']}: description lost the destination URL`);
    // The scheduled pin cannot know the shopper's PDP selection, so it must
    // state both published windows instead of promising the fast one.
    assert.match(description, /5–7 business days/, `${pin['Pin ID']}: missing Ready-to-Ship window`);
    assert.match(description, /15–18 business days total/, `${pin['Pin ID']}: missing Custom Tailored window`);
    assert.match(title, /\|\s*LuxeMia$/, `${pin['Pin ID']}: title is not branded`);
  });
});

test('no scheduled pin repeats a claim the storefront does not publish', () => {
  pins.forEach((pin) => {
    CLAIM_COLUMNS.forEach((column) => {
      FORBIDDEN.forEach(([pattern, label]) => {
        assert.doesNotMatch(pin[column], pattern, `${pin['Pin ID']} ${column} contains "${label}"`);
      });
    });
  });
});

test('board descriptions are inside Pinterest’s 500-character limit and truthful', () => {
  assert.equal(boards.length, 5);
  boards.forEach((board) => {
    const description = board['Board Description Template'];
    assert.ok(description.length <= pinCopy.PIN_DESCRIPTION_MAX_LENGTH, `${board['Board Name']}: ${description.length} chars`);
    FORBIDDEN.forEach(([pattern, label]) => {
      assert.doesNotMatch(description, pattern, `${board['Board Name']} description contains "${label}"`);
    });
    assert.ok(board['Correction vs Original Sheet'].length > 20, `${board['Board Name']} is missing its correction note`);
  });
});

test('the generator is repeatable and stays wired to the shared copy module', () => {
  const source = read('scripts/generate-pinterest-scheduler.cjs');
  assert.match(source, /require\('\.\.\/src\/lib\/pinterestPinCopy\.cjs'\)/);
  assert.match(source, /approved-sitemap-inventory\.json/);
  assert.match(source, /goneRoutes\.ts/);
  assert.match(source, /imageCount < 2/);
});
