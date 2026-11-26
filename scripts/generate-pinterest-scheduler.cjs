#!/usr/bin/env node
'use strict';

/**
 * Regenerates the corrected Pinterest scheduler and board plan for luxemia.shop:
 *
 *   docs/growth/pinterest/luxemia-pinterest-scheduler-corrected.csv   (29 pins)
 *   docs/growth/pinterest/luxemia-pinterest-boards-corrected.csv      (5 boards)
 *
 * Why this exists
 * ---------------
 * The owner's luxemia-pinterest-scheduler.xlsx scheduled five pins at product
 * handles that exist nowhere in the catalog — four of them are not even retired
 * (410) routes, they were never real — and every destination used the
 * non-canonical /products/ path, which 301s to /product/ (vercel.json). The pin
 * and board copy also repeated claims luxemia.shop does not publish ("100%
 * breathable cotton lining", 2-inch margins on every stitched outfit, 5–7 day
 * dispatch, insured DHL Express, "handcrafted", a $20 fit "guarantee").
 * docs/growth/ZERO-BUDGET-PLAYBOOK-VERIFIED-2026-11-25.md carries the full audit
 * and the source-of-truth claim table.
 *
 * How it works
 * ------------
 * PIN_PLAN is the audited schedule: one entry per pin naming the board, the
 * catalog category, and the exact handle that replaces (or keeps) the sheet's
 * pin. Keeping the selection explicit is deliberate — a scheduler is a plan the
 * owner reviews, and a plan must not silently swap products between runs.
 *
 * No pin copy is written here. Titles and descriptions come from
 * src/lib/pinterestPinCopy.cjs, the same module the storefront's Pinterest share
 * button uses, so a scheduled pin and an on-page share can never drift apart.
 *
 * Every planned handle is re-verified against the live catalog on each run, and
 * the script exits non-zero (without writing) if any check fails:
 *
 *   1. it appears in public/merchant-feed.xml — the Google Shopping feed the
 *      storefront publishes, which is also what Pinterest's catalog import reads
 *   2. <g:availability> is in_stock
 *   3. /product/<handle> is listed in scripts/approved-sitemap-inventory.json
 *   4. the handle is not a 410 in src/lib/goneRoutes.ts
 *   5. the listing has at least two catalog images
 *   6. the catalog category still matches the plan, so a re-categorised product
 *      cannot quietly rewrite a pin title
 *   7. each board still fills its weekly pin goal
 *
 * Price, image, colour, fabric, listed size and occasion are read from the feed
 * at run time rather than copied from the CSV, so the regenerated sheet always
 * reflects the catalog as it is today. Occasion is matched from words already in
 * the listing's own title and otherwise falls back to the board's theme; it is
 * never invented. Scheduled pins state BOTH published delivery windows
 * (Ready-to-Ship and Custom Tailored) because a pin cannot know which option the
 * shopper will pick on the PDP.
 *
 * Usage:
 *   node scripts/generate-pinterest-scheduler.cjs           # verify + rewrite CSVs
 *   node scripts/generate-pinterest-scheduler.cjs --check    # verify only (CI)
 */

const fs = require('fs');
const path = require('path');
const pinCopy = require('../src/lib/pinterestPinCopy.cjs');

const ROOT = path.resolve(__dirname, '..');
const FEED_PATH = path.join(ROOT, 'public', 'merchant-feed.xml');
const INVENTORY_PATH = path.join(ROOT, 'scripts', 'approved-sitemap-inventory.json');
const GONE_ROUTES_PATH = path.join(ROOT, 'src', 'lib', 'goneRoutes.ts');
const OUT_DIR = path.join(ROOT, 'docs', 'growth', 'pinterest');
const SCHEDULER_CSV = path.join(OUT_DIR, 'luxemia-pinterest-scheduler-corrected.csv');
const BOARDS_CSV = path.join(OUT_DIR, 'luxemia-pinterest-boards-corrected.csv');

const STORE_ORIGIN = 'https://luxemia.shop';
/** First scheduled slot: the day after the 2026-11-25 catalog audit. */
const SCHEDULE_START_DATE = '2026-11-26';
const PINS_PER_DAY = 2;
/** NRI browsing peaks measured in EST, the timezone of the Philadelphia desk. */
const POST_TIMES_EST = ['8:00 AM EST', '7:30 PM EST', '8:30 AM EST', '8:00 PM EST', '12:30 PM EST'];
const STATUS = 'Draft — verify PDP before scheduling';
const CATALOG_VERIFICATION = 'merchant-feed.xml + approved-sitemap-inventory.json + not in goneRoutes';
const DELIVERY_COPY_MODE = 'both';

const SCHEDULER_HEADER = [
  'Pin ID',
  'Outfit / Category',
  'Target Board',
  'Pin Title (SEO Optimized)',
  'SEO Pin Description',
  'Destination URL',
  'Scheduled Date',
  'Optimal Time (EST)',
  'Status',
  'Target Audience / Location',
  'Notes / Callouts',
  'Product Handle',
  'Price (USD)',
  'Availability',
  'Image URL',
  'Catalog Verification',
  'Delivery Copy Mode',
];

const BOARDS_HEADER = [
  'Board Name',
  'Target Event / Category',
  'Target NRI Audience & Location',
  'Core SEO Keyword Clusters',
  'Board Description Template',
  'Weekly Pin Goal',
  'Correction vs Original Sheet',
];

/**
 * Occasion is only ever read from the listing's own words. Order matters: a
 * "Haldi Wedding Outfit" is a Haldi pin, not a generic wedding-guest pin, and a
 * bridal listing outranks the wedding-guest reading of the same word.
 */
/**
 * Which proof point each board leads with, as keys into the shared sentences in
 * src/lib/pinterestPinCopy.cjs. The bridal board has to beat the "will it fit me
 * overseas?" objection, so it leads with the seam allowance and Local Alteration
 * Credit; the guest boards lead with what shipping costs; the comfort board leads
 * with the lining. Sentences that no longer fit are dropped whole — never cut
 * mid-claim — so the canonical URL always survives inside 500 characters.
 */
const DESCRIPTION_PRIORITY = {
  sarees: ['lining', 'support', 'margin'],
  sharara: ['support', 'lining', 'margin'],
  'nri-bridal': ['margin', 'support', 'lining'],
  'comfort-fit': ['lining', 'support', 'margin'],
  'pastel-reception': ['support', 'lining', 'margin'],
};

const OPTIONAL_SENTENCES = {
  lining: pinCopy.LINING_SENTENCE,
  margin: pinCopy.MARGIN_SENTENCE,
  support: pinCopy.SUPPORT_SENTENCE,
};

const OCCASION_SIGNALS = [
  ['Haldi & Mehendi', /\b(?:haldi|mehendi|mehndi)\b/i],
  ['Sangeet', /\bsangeet\b/i],
  ['Reception', /\b(?:reception|cocktail)\b/i],
  ['Bridal', /\b(?:bridal|bride|bridesmaid)\b/i],
  ['Wedding Guest', /\bwedding\b/i],
];

const BOARDS = [
  {
    key: "sarees",
    name: "Ready-to-Wear Sarees for Wedding Guests (USA/UK)",
    event: "Ready-to-Wear Sarees",
    audience: "US/UK Wedding Guests & Sangeet Attendees",
    keywords: "ready to wear saree USA, readymade saree express shipping, pre stitched saree for wedding guest, fast shipping ethnic wear",
    description: "Pre-stitched and ready-to-wear Indian sarees for wedding guests, shipped tracked from India to the USA, UK and Canada. Ready-to-Ship selections arrive in 5–7 business days; Custom Tailored blouse options in 15–18 business days total. Lined pieces use a breathable soft cotton or crepe inner lining where applicable. U.S. shipping $14.99, free at $150+. Philadelphia support: +1-215-341-9990.",
    weeklyPinGoal: 7,
    correction: "Removed \"100% breathable cotton inner linings\" (FAQ states cotton or crepe where applicable) and \"margins on every outfit\"; 5–7 days is delivery, not dispatch.",
    defaultOccasion: "Wedding Guest",
  },
  {
    key: "sharara",
    name: "Sangeet & Haldi Sharara Suits | Fast US Shipping",
    event: "Sharara, Anarkali & Palazzo Suits",
    audience: "Haldi, Mehendi & Sangeet Guests, Bridesmaids",
    keywords: "sharara suit for sangeet USA, readymade palazzo set USA, comfortable Indian festival wear, haldi mehendi outfit fast shipping",
    description: "Sharara, Anarkali and palazzo sets for Haldi, Mehendi and Sangeet celebrations, shipped tracked to the US, UK and Canada. Ready-to-Ship selections arrive in 5–7 business days (1–2 dispatch after our 3-Point QA Check plus 4–5 transit); Custom Tailored options take 15–18 business days total. Every listing states the construction actually supplied and the lining used. U.S. shipping $14.99, free at $150+.",
    weeklyPinGoal: 7,
    correction: "Removed \"5-7 day express\" ambiguity: dispatch 1–2 business days + transit 4–5 business days = 5–7 business days delivery.",
    defaultOccasion: "Sangeet",
  },
  {
    key: "nri-bridal",
    name: "NRI Bride & Bridesmaid Fashion Guide",
    event: "Bridal & Bridesmaid Lehengas",
    audience: "NRI Brides, Maid of Honor & Close Family",
    keywords: "bridal lehenga choli USA, designer lehenga express shipping, custom stitching Indian wedding dress, bridesmaid lehenga set NRI",
    description: "Bridal and bridesmaid lehenga guidance for NRI weddings: fabric, work, included pieces and the measurement handoff, with tracked DHL/FedEx delivery from India. Custom Tailored bridal outfits arrive in 15–18 business days total once measurements are confirmed; Ready-to-Ship selections in 5–7 business days to US/UK/CA. Custom-stitched cholis carry a 2-inch (5 cm) seam allowance where construction permits, with up to $20 USD Local Alteration Credit within 14 days of delivery.",
    weeklyPinGoal: 5,
    correction: "Removed \"handcrafted\" (stripped by productDescriptionEnrichment.ts) and \"fully insured\" (never published); added the measured Custom Tailored window.",
    defaultOccasion: "Bridal",
  },
  {
    key: "comfort-fit",
    name: "Indian Ethnic Wear with Cotton Lining & Custom Fitting",
    event: "Comfort, Lining & Custom Fitting",
    audience: "First-Time Online Ethnic Wear Buyers (US/UK/CA)",
    keywords: "non itchy Indian clothes online, ethnic wear seam allowance, local alteration credit ethnic wear, online saree store USA",
    description: "Comfort and fit, stated as the listings state it: lined pieces use a breathable soft cotton or crepe inner lining where applicable, and custom-stitched blouses, cholis and suit tops carry a 2-inch (5 cm) internal seam allowance where construction permits. If a local tailor makes a minor adjustment, LuxeMia issues up to $20 USD Local Alteration Credit against a receipt photo within 14 days of delivery. Ready-to-Ship 5–7 business days to US/UK/CA; Custom Tailored 15–18 business days total.",
    weeklyPinGoal: 5,
    correction: "Removed \"2-inch internal alteration margins on all stitched outfits\" and \"Fast 5-day shipping\"; margins are conditional and the credit is up to $20 within 14 days.",
    defaultOccasion: null,
  },
  {
    key: "pastel-reception",
    name: "Pastel Lehengas & Indo-Western Reception Outfits",
    event: "Reception & Indo-Western",
    audience: "Reception, Cocktail & Evening Event Guests",
    keywords: "pastel lehenga reception guest, grey georgette lehenga USA, modern indo western gown Indian wedding, reception outfit fast shipping",
    description: "Pastel lehengas and Indo-Western reception outfits for cocktail nights and evening weddings, with tracked DHL/FedEx delivery and live order tracking after dispatch. Ready-to-Ship selections arrive in 5–7 business days to the US, UK & Canada; Custom Tailored options in 15–18 business days total. U.S. shipping $14.99, free at $150+. Philadelphia support: +1-215-341-9990.",
    weeklyPinGoal: 5,
    correction: "Kept \"live order tracking\" only as tracking after dispatch, which /shipping publishes.",
    defaultOccasion: "Reception",
  },
];

const PIN_PLAN = [
  { board: "sarees", category: "Saree", handle: "onion-pink-floral-embroidered-silk-saree-with-cutwork-border", sheetNote: "Replaces sheet PIN-001 (ready-to-wear-embroidered-saree-light-pink — handle does not exist in the catalog)" },
  { board: "sharara", category: "Sharara Suit", handle: "sharara-winepink-pauncho", sheetNote: "Replaces sheet PIN-002 (dusty-pink-silk-beaded-sharara-suit — handle does not exist in the catalog)" },
  { board: "sharara", category: "Palazzo Suit", handle: "dusty-pink-simar-silk-embroidered-palazzo-suit-indian-wedding-outfit-3-piece-set", sheetNote: "Replaces sheet PIN-003 (embroidered-net-palazzo-suit-coral — handle does not exist in the catalog)" },
  { board: "pastel-reception", category: "Lehenga Choli", handle: "grey-georgette-embroidered-wedding-lehenga-choli", sheetNote: "Keeps the sheet PIN-004 product; path corrected from /products/ to canonical /product/" },
  { board: "nri-bridal", category: "Lehenga Choli", handle: "red-bridal-lehenga-with-heavy-embroidery", sheetNote: "Replaces sheet PIN-005 (sindoori-red-silk-bridal-lehenga — handle does not exist in the catalog)" },
  { board: "sarees", category: "Saree", handle: "red-mashru-silk-blend-jaal-banarasi-saree-106001" },
  { board: "sharara", category: "Anarkali", handle: "anarkali-mintgreen-lucknowi" },
  { board: "nri-bridal", category: "Palazzo Suit", handle: "palazzo-taupebeige-net" },
  { board: "comfort-fit", category: "Lehenga Choli", handle: "yellow-georgette-embroidered-lehenga-choli" },
  { board: "pastel-reception", category: "Lehenga Choli", handle: "ivory-white-net-floral-embroidered-lehenga-choli" },
  { board: "sarees", category: "Saree", handle: "magenta-mashru-silk-blend-jaal-banarasi-saree-106002" },
  { board: "sharara", category: "Palazzo Suit", handle: "palazzo-olivegreen-printed" },
  { board: "nri-bridal", category: "Palazzo Suit", handle: "palazzo-mauve-net" },
  { board: "comfort-fit", category: "Lehenga Choli", handle: "teal-green-georgette-embroidered-lehenga-choli" },
  { board: "pastel-reception", category: "Lehenga Choli", handle: "sky-blue-net-floral-embroidered-lehenga-choli" },
  { board: "sarees", category: "Saree", handle: "emerald-green-mashru-silk-blend-designer-border-banarasi-saree-106005" },
  { board: "sharara", category: "Sharara Suit", handle: "sharara-tealblue-pauncho" },
  { board: "nri-bridal", category: "Palazzo Suit", handle: "palazzo-blue-net" },
  { board: "comfort-fit", category: "Lehenga Choli", handle: "grey-georgette-embroidered-lehenga-choli" },
  { board: "pastel-reception", category: "Lehenga Choli", handle: "lilac-organza-embroidered-lehenga-choli-with-scalloped-hem" },
  { board: "sarees", category: "Saree", handle: "dark-violet-mashru-silk-blend-alfi-jaal-banarasi-saree-106004" },
  { board: "sharara", category: "Anarkali", handle: "anarkali-pink-chinon" },
  { board: "nri-bridal", category: "Anarkali", handle: "anarkali-rust" },
  { board: "comfort-fit", category: "Lehenga Choli", handle: "lavender-digital-print-chinon-lehenga-choli" },
  { board: "pastel-reception", category: "Lehenga Choli", handle: "lilac-organza-embroidered-lehenga-choli" },
  { board: "sarees", category: "Saree", handle: "black-mashru-silk-blend-alfi-buta-banarasi-saree-106003" },
  { board: "sharara", category: "Anarkali", handle: "anarkali-orange-chinon" },
  { board: "comfort-fit", category: "Men’s Kurta Pajama", handle: "botanical-border-salsa-silk-kurta-pajama-set" },
  { board: "sarees", category: "Saree", handle: "pista-green-banarasi-silk-saree-with-botanical-motifs" },
];

// ─── catalog readers ────────────────────────────────────────────────────────

const decodeEntities = (value) => value
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&amp;/g, '&');

const feedField = (item, tag) => {
  const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? decodeEntities(match[1].trim()) : '';
};

/** One entry per product handle, taken from the first variant in feed order. */
function readCatalog() {
  if (!fs.existsSync(FEED_PATH)) {
    throw new Error(`missing ${path.relative(ROOT, FEED_PATH)} — run the feed build first (npm run build)`);
  }
  const xml = fs.readFileSync(FEED_PATH, 'utf8');
  const catalog = new Map();
  const itemPattern = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemPattern.exec(xml)) !== null) {
    const item = match[1];
    const handle = (feedField(item, 'g:link').match(/\/product\/([a-z0-9-]+)/) || [])[1];
    if (!handle || catalog.has(handle)) continue;
    catalog.set(handle, {
      handle,
      title: feedField(item, 'g:item_group_title') || feedField(item, 'g:title'),
      color: feedField(item, 'g:color'),
      material: feedField(item, 'g:material'),
      size: feedField(item, 'g:size'),
      category: feedField(item, 'g:custom_label_0'),
      availability: feedField(item, 'g:availability'),
      price: feedField(item, 'g:price').replace(/\s*USD$/i, ''),
      image: feedField(item, 'g:image_link'),
      imageCount: 1 + (item.match(/<g:additional_image_link>/g) || []).length,
    });
  }
  if (!catalog.size) throw new Error(`${path.relative(ROOT, FEED_PATH)} contained no products`);
  return catalog;
}

function readInventoryPaths() {
  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
  return new Set(inventory.paths || []);
}

/** Same reading tests/pinterestScheduler.test.cjs uses: every quoted handle. */
function readGoneHandles() {
  const source = fs.readFileSync(GONE_ROUTES_PATH, 'utf8');
  return new Set((source.match(/"([a-z0-9-]+)"/g) || []).map((value) => value.replace(/"/g, '')));
}

// ─── copy helpers ───────────────────────────────────────────────────────────

function occasionFor(product, board) {
  const haystack = `${product.title} ${product.handle.replace(/-/g, ' ')}`;
  const matched = OCCASION_SIGNALS.find(([, pattern]) => pattern.test(haystack));
  return matched ? matched[0] : board.defaultOccasion || undefined;
}

function notesFor(product, plan, occasion) {
  const parts = [];
  if (plan.sheetNote) parts.push(plan.sheetNote);
  parts.push(`${product.imageCount} catalog images`);
  if (product.size) parts.push(`listed size: ${product.size}`);
  if (product.material) parts.push(product.material);
  if (occasion) parts.push(`occasion: ${occasion}`);
  return parts.join(' · ');
}

const addDays = (isoDate, days) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/**
 * Pin description in the board's proof-point order. Mirrors
 * pinCopy.buildPinDescription (same lead, same greedy whole-sentence fit, same
 * closing shop line) but lets each board lead with its own proof point.
 */
function buildBoardPinDescription({ title, url, priority }) {
  const brandless = String(title).replace(/\s*\|\s*LuxeMia\s*$/i, '').trim();
  const lead = `${brandless}. ${pinCopy.DELIVERY_SENTENCES[DELIVERY_COPY_MODE]}`;
  const shopLine = `Shop at LuxeMia: ${url}`;
  const included = [];
  let description = `${lead} ${shopLine}`;
  for (const key of priority) {
    const sentence = OPTIONAL_SENTENCES[key];
    if (!sentence) continue;
    const candidate = [lead, ...included, sentence, shopLine].join(' ');
    if (candidate.length <= pinCopy.PIN_DESCRIPTION_MAX_LENGTH) {
      included.push(sentence);
      description = candidate;
    }
  }
  return description;
}

const canonicalUrl = (handle) => `${STORE_ORIGIN}/product/${handle}`;

const csvCell = (value) => {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toCsv = (rows) => `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;

// ─── verification ───────────────────────────────────────────────────────────

/** The next in-stock, indexable listings in the same category, for a re-pin. */
function suggestReplacements(catalog, category, usedHandles, limit = 3) {
  const eligible = [...catalog.values()]
    .filter((product) => product.category === category
      && product.availability === 'in_stock'
      && product.imageCount >= 2
      && !usedHandles.has(product.handle))
    .slice(0, limit)
    .map((product) => `${product.handle} ($${product.price}, ${product.imageCount} images)`);
  return eligible.length ? ` Candidates in ${category}: ${eligible.join('; ')}.` : '';
}

function buildSchedule() {
  const catalog = readCatalog();
  const inventory = readInventoryPaths();
  const gone = readGoneHandles();
  const boardByKey = new Map(BOARDS.map((board) => [board.key, board]));
  const usedHandles = new Set();
  const pins = [];
  const problems = [];

  PIN_PLAN.forEach((plan, index) => {
    const board = boardByKey.get(plan.board);
    const pinId = `PIN-${String(index + 1).padStart(3, '0')}`;
    if (!board) {
      problems.push(`${pinId}: unknown board "${plan.board}"`);
      return;
    }
    const product = catalog.get(plan.handle);
    if (!product) {
      problems.push(`${pinId}: ${plan.handle} is not in the merchant feed.${suggestReplacements(catalog, plan.category, usedHandles)}`);
      return;
    }
    if (product.availability !== 'in_stock') {
      problems.push(`${pinId}: ${plan.handle} is ${product.availability || 'unavailable'}, not in_stock.`);
      return;
    }
    if (!inventory.has(`/product/${plan.handle}`)) {
      problems.push(`${pinId}: /product/${plan.handle} is not in approved-sitemap-inventory.json.`);
      return;
    }
    if (gone.has(plan.handle)) {
      problems.push(`${pinId}: ${plan.handle} is a 410 gone route in goneRoutes.ts.`);
      return;
    }
    // A single photo cannot carry a pin; Pinterest's own guidance is 2+ images.
    if (product.imageCount < 2) {
      problems.push(`${pinId}: ${plan.handle} has only ${product.imageCount} catalog image.${suggestReplacements(catalog, plan.category, usedHandles)}`);
      return;
    }
    if (product.category && product.category !== plan.category) {
      problems.push(`${pinId}: the catalog now files ${plan.handle} under "${product.category}", the plan says "${plan.category}".`);
      return;
    }
    if (usedHandles.has(plan.handle)) {
      problems.push(`${pinId}: ${plan.handle} is already scheduled.`);
      return;
    }
    if (!/^https:\/\/cdn\.shopify\.com\//.test(product.image)) {
      problems.push(`${pinId}: ${plan.handle} has no Shopify CDN image.`);
      return;
    }
    usedHandles.add(plan.handle);

    const occasion = occasionFor(product, board);
    const url = canonicalUrl(plan.handle);
    const title = pinCopy.buildPinTitle({
      color: product.color,
      material: product.material,
      category: product.category || plan.category,
      occasion,
      title: product.title,
    });

    pins.push([
      pinId,
      product.category || plan.category,
      board.name,
      title,
      buildBoardPinDescription({ title, url, priority: DESCRIPTION_PRIORITY[board.key] }),
      url,
      addDays(SCHEDULE_START_DATE, Math.floor(index / PINS_PER_DAY)),
      POST_TIMES_EST[index % POST_TIMES_EST.length],
      STATUS,
      board.audience,
      notesFor(product, plan, occasion),
      plan.handle,
      product.price,
      product.availability,
      product.image,
      CATALOG_VERIFICATION,
      DELIVERY_COPY_MODE,
    ]);
  });

  // The sheet is only useful if it fills every board's weekly goal.
  const scheduled = new Map();
  pins.forEach((row) => scheduled.set(row[2], (scheduled.get(row[2]) || 0) + 1));
  BOARDS.forEach((board) => {
    const count = scheduled.get(board.name) || 0;
    if (count !== board.weeklyPinGoal) {
      problems.push(`board "${board.name}": ${count} pins scheduled, weekly goal is ${board.weeklyPinGoal}.`);
    }
  });

  if (problems.length) {
    throw new Error(`Pinterest schedule verification failed:\n  - ${problems.join('\n  - ')}`);
  }

  const boards = BOARDS.map((board) => [
    board.name,
    board.event,
    board.audience,
    board.keywords,
    board.description,
    board.weeklyPinGoal,
    board.correction,
  ]);

  return {
    schedulerCsv: toCsv([SCHEDULER_HEADER, ...pins]),
    boardsCsv: toCsv([BOARDS_HEADER, ...boards]),
    pins,
    boards,
  };
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const { schedulerCsv, boardsCsv, pins } = buildSchedule();

  if (!checkOnly) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(SCHEDULER_CSV, schedulerCsv, 'utf8');
    fs.writeFileSync(BOARDS_CSV, boardsCsv, 'utf8');
  }

  const lastDate = pins[pins.length - 1][6];
  const priceValues = pins.map((row) => Number(row[12])).filter((value) => Number.isFinite(value));
  const median = priceValues.slice().sort((a, b) => a - b)[Math.floor(priceValues.length / 2)];
  console.log(
    `${checkOnly ? 'verified' : 'wrote'} ${pins.length} pins across ${BOARDS.length} boards `
    + `(${SCHEDULE_START_DATE} → ${lastDate}), price range `
    + `$${Math.min(...priceValues).toFixed(2)}–$${Math.max(...priceValues).toFixed(2)} (median $${median.toFixed(2)})`,
  );
  if (!checkOnly) {
    console.log(`  ${path.relative(ROOT, SCHEDULER_CSV)}`);
    console.log(`  ${path.relative(ROOT, BOARDS_CSV)}`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message || String(error));
    process.exitCode = 1;
  }
}

module.exports = {
  BOARDS,
  PIN_PLAN,
  DESCRIPTION_PRIORITY,
  buildBoardPinDescription,
  OCCASION_SIGNALS,
  SCHEDULE_START_DATE,
  POST_TIMES_EST,
  buildSchedule,
  occasionFor,
  notesFor,
  toCsv,
  canonicalUrl,
};
