#!/usr/bin/env node
/**
 * Sanitize prerendered 404 documents after the SPA prerender step.
 *
 * The base Vite document carries indexable crawler-specific directives,
 * homepage identity metadata, and sitewide JSON-LD. A real 404 response must
 * not inherit those signals. This postprocessor keeps the helpful rendered
 * error-page navigation while making the document agree with the HTTP status
 * and X-Robots-Tag emitted by middleware.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CANDIDATES = [
  path.join(PROJECT_ROOT, 'dist', '_prerender', '404.html'),
  path.join(PROJECT_ROOT, 'dist', '404.html'),
];
const ERROR_DIRECTIVE = 'noindex, follow';

function upsertCrawlerDirective(html, crawler) {
  const pattern = new RegExp(
    `<meta\\s+name=["']${crawler}["'][^>]*>`,
    'gi'
  );
  const replacement = `<meta name="${crawler}" content="${ERROR_DIRECTIVE}">`;

  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function sanitizeErrorDocument(input) {
  let html = input;

  // Error URLs must not consolidate to themselves, the homepage, or another URL.
  html = html.replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, '\n');
  html = html.replace(/\s*<link\s+rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>\s*/gi, '\n');

  // Homepage/social URL identity is misleading on a missing document.
  html = html.replace(/\s*<meta\s+property=["']og:url["'][^>]*>\s*/gi, '\n');
  html = html.replace(/\s*<meta\s+name=["']twitter:url["'][^>]*>\s*/gi, '\n');

  // Sitewide Organization/WebSite/Product schema is not appropriate for a
  // missing resource response and can increase soft-404 ambiguity.
  html = html.replace(
    /\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    '\n'
  );

  // Remove the homepage-only no-JavaScript commercial fallback. The dedicated
  // prerendered 404 main remains visible and contains useful navigation.
  html = html.replace(
    /\s*<noscript>[\s\S]*?Premium Indian Ethnic Wear with Tracked U\.S\. Shipping[\s\S]*?<\/noscript>\s*/gi,
    '\n'
  );

  html = upsertCrawlerDirective(html, 'robots');
  html = upsertCrawlerDirective(html, 'googlebot');
  html = upsertCrawlerDirective(html, 'bingbot');

  if (!html.includes('error-document-metadata-sanitized')) {
    html = html.replace(
      '<head>',
      '<head>\n  <!-- error-document-metadata-sanitized -->'
    );
  }

  return html;
}

function assertSanitized(filePath, html) {
  const checks = [
    [!/<link\s+rel=["']canonical["']/i.test(html), 'canonical link remains'],
    [!/<script\s+type=["']application\/ld\+json["']/i.test(html), 'JSON-LD remains'],
    [!/<meta\s+(?:property=["']og:url["']|name=["']twitter:url["'])/i.test(html), 'page URL social metadata remains'],
    [/<meta\s+name=["']robots["']\s+content=["']noindex, follow["']>/i.test(html), 'robots directive is missing or inconsistent'],
    [/<meta\s+name=["']googlebot["']\s+content=["']noindex, follow["']>/i.test(html), 'googlebot directive is missing or inconsistent'],
    [/<meta\s+name=["']bingbot["']\s+content=["']noindex, follow["']>/i.test(html), 'bingbot directive is missing or inconsistent'],
  ];

  const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
  if (failures.length > 0) {
    throw new Error(`${filePath}: ${failures.join('; ')}`);
  }
}

function main() {
  const existing = CANDIDATES.filter((candidate) => fs.existsSync(candidate));
  if (existing.length === 0) {
    throw new Error('No prerendered 404 document was found to sanitize.');
  }

  for (const filePath of existing) {
    const original = fs.readFileSync(filePath, 'utf8');
    const sanitized = sanitizeErrorDocument(original);
    assertSanitized(filePath, sanitized);
    fs.writeFileSync(filePath, sanitized, 'utf8');
    console.log(`[error-pages] Sanitized ${path.relative(PROJECT_ROOT, filePath)}`);
  }
}

main();
