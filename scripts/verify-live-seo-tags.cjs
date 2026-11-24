#!/usr/bin/env node
/**
 * Verify that pages expose a self-referencing canonical and matching hreflang
 * alternates — the exact hreflang/canonical conflict that de-indexed the
 * catalog (see SEO_RECOVERY_REPORT.md and SEO_RECOVERY_MONITORING.md).
 *
 * Three ways to run it:
 *
 *   node scripts/verify-live-seo-tags.cjs                     # live priority URLs
 *   node scripts/verify-live-seo-tags.cjs --dir dist/_prerender  # built static HTML
 *   node scripts/verify-live-seo-tags.cjs --selftest          # offline parser checks
 *
 * Options:
 *   --base <url>        Override the base URL (default https://luxemia.shop)
 *   --urls <a,b,c>      Comma-separated explicit URLs to check instead of the
 *                       built-in priority list
 *   --dir <path>        Directory of prerendered .html files (no network needed)
 *   --limit <n>         Max failures to print in --dir mode (default 20)
 *   --help              Show this help
 *
 * Exit codes: 0 = all good, 1 = SEO mismatch or HTTP error, 2 = usage/network
 * infrastructure problem. Safe to run in CI after `npm run build`.
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://luxemia.shop';

// Highest-impression, zero-click pages from the 2026-11-24 GSC export, plus
// representative product URLs. Keep in sync with SEO_RECOVERY_MONITORING.md.
const PRIORITY_PATHS = [
  '/',
  '/sarees',
  '/lehengas',
  '/collections/sharara-suits',
  '/collections/party-wear-lehengas',
  '/collections/designer-sarees',
  '/collections/wedding-guest-outfits',
  '/collections/wedding-sarees',
  '/collections/bridal-lehengas',
  '/product/deep-purple-gold-butta-kanjivaram-silk-saree',
  '/product/black-maroon-rayon-kodi-lace-navratri-lehenga-choli-set',
  '/product/ready-to-wear-embroidered-saree-light-pink',
];

function normalizeUrl(value) {
  if (!value) return '';
  // Ignore a single trailing slash so "/" and "" compare equal, but never
  // lowercase the path (product slugs are case-sensitive on the CDN).
  return String(value).trim().replace(/([^:])\/$/, '$1');
}

/** Parse every <link> tag's attributes, independent of attribute order. */
function extractLinkTags(html) {
  const tags = [];
  for (const match of String(html).matchAll(/<link\b([^>]*)>/gi)) {
    const attrs = {};
    for (const attr of match[1].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)) {
      attrs[attr[1].toLowerCase()] = attr[2];
    }
    tags.push(attrs);
  }
  return tags;
}

function relTokens(tag) {
  return String(tag.rel || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/** Check one indexable page's <head> tags against its own canonical URL. */
function inspectHtml(html, expectedUrl) {
  const issues = [];
  const tags = extractLinkTags(html);

  const canonicals = tags.filter((tag) => relTokens(tag).includes('canonical')).map((tag) => tag.href);
  if (canonicals.length === 0) {
    issues.push('missing canonical');
  } else if (canonicals.length > 1) {
    issues.push(`multiple canonical tags (${canonicals.length})`);
  } else if (normalizeUrl(canonicals[0]) !== normalizeUrl(expectedUrl)) {
    issues.push(`canonical -> ${canonicals[0] || '(empty)'} (expected ${expectedUrl})`);
  }

  const alternates = tags.filter(
    (tag) => relTokens(tag).includes('alternate') && tag.hreflang,
  );
  if (alternates.length === 0) issues.push('missing hreflang alternates');

  const homepage = normalizeUrl(`${SITE_URL}/`);
  for (const tag of alternates) {
    const target = normalizeUrl(tag.href);
    if (target !== normalizeUrl(expectedUrl)) {
      const homepageLeak = target === homepage && normalizeUrl(expectedUrl) !== homepage;
      issues.push(
        homepageLeak
          ? `hreflang ${tag.hreflang} still points to the homepage (${tag.href})`
          : `hreflang ${tag.hreflang} -> ${tag.href || '(empty)'} (expected ${expectedUrl})`,
      );
    }
  }

  if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(String(html))) {
    issues.push('indexable page carries noindex');
  }

  return {
    ok: issues.length === 0,
    issues,
    expectedUrl,
    canonical: canonicals[0] || null,
    hreflangs: alternates.map((tag) => tag.hreflang),
  };
}

/** 404 pages must be noindex and must not emit canonical/hreflang signals. */
function inspectNoIndexHtml(html, expectedUrl) {
  const issues = [];
  const tags = extractLinkTags(html);
  const canonicals = tags.filter((tag) => relTokens(tag).includes('canonical'));
  const alternates = tags.filter((tag) => relTokens(tag).includes('alternate') && tag.hreflang);
  if (canonicals.length) issues.push('noIndex page still has a canonical tag');
  if (alternates.length) issues.push('noIndex page still has hreflang tags');
  if (!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(String(html))) {
    issues.push('noIndex page is missing the noindex robots directive');
  }
  return { ok: issues.length === 0, issues, expectedUrl, canonical: null, hreflangs: [] };
}

function parseArgs(argv) {
  const options = { base: SITE_URL, urls: null, dir: null, limit: 20, selftest: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--selftest') options.selftest = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--base') options.base = argv[++i];
    else if (arg === '--urls') options.urls = argv[++i];
    else if (arg === '--dir') options.dir = argv[++i];
    else if (arg === '--limit') options.limit = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function checkLiveUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Googlebot' },
      redirect: 'follow',
      signal: controller.signal,
    });
    const html = await response.text();
    if (!response.ok) {
      return { ok: false, issues: [`HTTP ${response.status}`], expectedUrl: url, canonical: null, hreflangs: [] };
    }
    return inspectHtml(html, url);
  } catch (error) {
    return {
      ok: false,
      issues: [`fetch failed: ${error.message}`],
      expectedUrl: url,
      canonical: null,
      hreflangs: [],
      infrastructure: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

function* walkHtmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtmlFiles(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) yield full;
  }
}

function routeFromPrerenderFile(dir, file) {
  const rel = path.relative(dir, file).split(path.sep).join('/').replace(/\.html$/, '');
  if (rel === 'index' || rel === '') return '/';
  if (rel.endsWith('/index')) return `/${rel.slice(0, -'/index'.length)}`;
  return `/${rel}`;
}

function printResult(result) {
  const status = result.ok ? 'PASS' : 'FAIL';
  console.log(`${status}  ${result.expectedUrl}`);
  if (!result.ok) {
    for (const issue of result.issues) console.log(`      - ${issue}`);
  }
}

function runSelftest() {
  const product = `${SITE_URL}/product/ready-to-wear-embroidered-saree-light-pink`;
  const good = `<html><head>
    <link rel="canonical" href="${product}" />
    <link rel="alternate" hreflang="en-US" href="${product}" />
    <link rel="alternate" hreflang="x-default" href="${product}" />
  </head><body>ok</body></html>`;
  const broken = `<html><head>
    <link rel="canonical" href="${product}" />
    <link rel="alternate" hreflang="en-US" href="${SITE_URL}/" />
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  </head></html>`;
  const missing = `<html><head><title>x</title></head></html>`;
  const wrongCanonical = `<html><head>
    <link rel="canonical" href="${SITE_URL}/" />
    <link rel="alternate" hreflang="en-US" href="${product}" />
  </head></html>`;
  const noIndex = `<html><head>
    <meta name="robots" content="noindex, nofollow" />
  </head><body>404</body></html>`;

  const cases = [
    ['correct self-referencing tags pass', inspectHtml(good, product), true],
    ['homepage hreflang leak is caught', inspectHtml(broken, product), false],
    ['missing canonical is caught', inspectHtml(missing, product), false],
    ['canonical pointing to homepage is caught', inspectHtml(wrongCanonical, product), false],
    ['noIndex page with no canonical/hreflang passes', inspectNoIndexHtml(noIndex, '/404'), true],
    ['noindex on an indexable page is caught', inspectHtml(`${good}<meta name="robots" content="noindex">`, product), false],
  ];

  let failed = 0;
  for (const [name, result, expected] of cases) {
    const pass = result.ok === expected;
    if (!pass) failed += 1;
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${pass ? '' : ` -> ${result.issues.join('; ')}`}`);
  }
  console.log(`\n[selftest] ${cases.length - failed}/${cases.length} checks passed.`);
  return failed === 0;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`[verify-seo] ${error.message}`);
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^#!.*\n/, '').replace(/^\/\*\*?/, '').trim());
    return;
  }

  if (options.selftest) {
    if (!runSelftest()) process.exitCode = 1;
    return;
  }

  const results = [];

  if (options.dir) {
    if (!fs.existsSync(options.dir)) {
      console.error(`[verify-seo] Directory not found: ${options.dir}`);
      process.exitCode = 2;
      return;
    }
    const files = [...walkHtmlFiles(options.dir)];
    console.log(`[verify-seo] Checking ${files.length} prerendered HTML files in ${options.dir}`);
    for (const file of files) {
      const route = routeFromPrerenderFile(options.dir, file);
      const expectedUrl = route === '/' ? `${options.base}/` : options.base + route;
      const html = fs.readFileSync(file, 'utf8');
      const result = route === '/404' || path.basename(file) === '404.html'
        ? inspectNoIndexHtml(html, expectedUrl)
        : inspectHtml(html, expectedUrl);
      results.push(result);
    }
  } else {
    const urls = options.urls
      ? options.urls.split(',').map((value) => value.trim()).filter(Boolean)
      : PRIORITY_PATHS.map((route) => (route === '/' ? `${options.base}/` : options.base + route));
    console.log(`[verify-seo] Checking ${urls.length} live URLs as Googlebot (base ${options.base})`);
    for (const url of urls) results.push(await checkLiveUrl(url));
  }

  const failures = results.filter((result) => !result.ok);
  const infrastructureFailures = failures.filter((result) => result.infrastructure).length;

  if (!options.dir) {
    for (const result of results) printResult(result);
  } else {
    for (const result of failures.slice(0, options.limit)) printResult(result);
    if (failures.length > options.limit) {
      console.log(`      ... and ${failures.length - options.limit} more failures`);
    }
  }

  console.log(
    `\n[verify-seo] ${results.length - failures.length}/${results.length} pages OK; ` +
    `${failures.length} failing.`,
  );

  if (infrastructureFailures === failures.length && failures.length > 0 && !options.dir) {
    console.error('[verify-seo] All fetches failed — run this from an environment with outbound HTTPS access.');
    process.exitCode = 2;
    return;
  }
  if (failures.length) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[verify-seo] Unexpected error: ${error.stack || error.message}`);
    process.exitCode = 2;
  });
}

module.exports = {
  SITE_URL,
  PRIORITY_PATHS,
  normalizeUrl,
  extractLinkTags,
  inspectHtml,
  inspectNoIndexHtml,
  routeFromPrerenderFile,
};
