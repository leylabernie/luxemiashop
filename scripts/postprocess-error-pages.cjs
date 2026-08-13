#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CANDIDATES = [
  path.join(PROJECT_ROOT, 'dist', '_prerender', '404.html'),
  path.join(PROJECT_ROOT, 'dist', '404.html'),
];
const ERROR_DIRECTIVE = 'noindex, follow';
const HOMEPAGE_FALLBACK = /Premium Indian Ethnic Wear with Tracked U\.S\. Shipping/i;

function upsertCrawlerDirective(html, crawler) {
  const pattern = new RegExp(`<meta\\s+name=["']${crawler}["'][^>]*>`, 'gi');
  const replacement = `<meta name="${crawler}" content="${ERROR_DIRECTIVE}">`;
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', `  ${replacement}\n</head>`);
}

function sanitizeErrorDocument(input) {
  let html = input;

  html = html.replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, '\n');
  html = html.replace(/\s*<link\s+rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>\s*/gi, '\n');
  html = html.replace(/\s*<meta\s+property=["']og:url["'][^>]*>\s*/gi, '\n');
  html = html.replace(/\s*<meta\s+name=["']twitter:url["'][^>]*>\s*/gi, '\n');
  html = html.replace(
    /\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    '\n'
  );

  // Match each noscript block independently so the font fallback and visible
  // 404 document between separate blocks cannot be consumed.
  html = html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, (block) =>
    HOMEPAGE_FALLBACK.test(block) ? '' : block
  );

  html = upsertCrawlerDirective(html, 'robots');
  html = upsertCrawlerDirective(html, 'googlebot');
  html = upsertCrawlerDirective(html, 'bingbot');

  if (!html.includes('error-document-metadata-sanitized')) {
    html = html.replace('<head>', '<head>\n  <!-- error-document-metadata-sanitized -->');
  }

  return html;
}

function assertSanitized(filePath, html) {
  const checks = [
    [!/<link\s+rel=["']canonical["']/i.test(html), 'canonical link remains'],
    [!/<script\s+type=["']application\/ld\+json["']/i.test(html), 'JSON-LD remains'],
    [!/<meta\s+(?:property=["']og:url["']|name=["']twitter:url["'])/i.test(html), 'page URL social metadata remains'],
    [!HOMEPAGE_FALLBACK.test(html), 'homepage fallback remains'],
    [/<meta\s+name=["']robots["']\s+content=["']noindex, follow["']>/i.test(html), 'robots directive is missing or inconsistent'],
    [/<meta\s+name=["']googlebot["']\s+content=["']noindex, follow["']>/i.test(html), 'googlebot directive is missing or inconsistent'],
    [/<meta\s+name=["']bingbot["']\s+content=["']noindex, follow["']>/i.test(html), 'bingbot directive is missing or inconsistent'],
    [/<body\b[^>]*>/i.test(html), 'document body was removed'],
    [/<main\b[^>]*id=["']seo-prerender["']/i.test(html), 'visible 404 main was removed'],
    [/<h1\b[^>]*>\s*Page Not Found\s*<\/h1>/i.test(html), 'visible 404 heading was removed'],
    [/<nav\b[^>]*aria-label=["']Site navigation["']/i.test(html), '404 navigation was removed'],
    [/<a\b[^>]*href=["']\/["'][^>]*>\s*Home\s*<\/a>/i.test(html), '404 homepage link was removed'],
  ];

  const failures = checks.filter(([ok]) => !ok).map(([, message]) => message);
  if (failures.length > 0) throw new Error(`${filePath}: ${failures.join('; ')}`);
}

function main() {
  const existing = CANDIDATES.filter((candidate) => fs.existsSync(candidate));
  if (existing.length === 0) throw new Error('No prerendered 404 document was found to sanitize.');

  for (const filePath of existing) {
    const sanitized = sanitizeErrorDocument(fs.readFileSync(filePath, 'utf8'));
    assertSanitized(filePath, sanitized);
    fs.writeFileSync(filePath, sanitized, 'utf8');
    console.log(`[error-pages] Sanitized ${path.relative(PROJECT_ROOT, filePath)} and preserved visible 404 content.`);
  }
}

main();
