#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://luxemia.shop';
const BAD_PRODUCT_HANDLES = [
  'bhamini-lenovo',
  'bhamini-lenovo-black-satin-ready-to-wear-saree-sequins',
  'c-users-bhamini-lenovo',
];

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function jsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1].trim())
    .map(body => {
      try {
        return JSON.parse(body);
      } catch (error) {
        return { parseError: error.message };
      }
    });
}

function schemaTypes(schema) {
  const type = schema?.['@type'];
  return Array.isArray(type) ? type : [type];
}

function collectSchemas(schema, type) {
  const found = [];
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (schemaTypes(value).includes(type)) found.push(value);
    if (Array.isArray(value)) {
      value.forEach(visit);
    } else {
      Object.values(value).forEach(visit);
    }
  };
  visit(schema);
  return found;
}

function fail(message) {
  console.error(`[validate:seo-regressions] ERROR: ${message}`);
  process.exitCode = 1;
}

function countHomepageFaqMatches(html) {
  return (html.match(/Do you offer international shipping for Indian ethnic wear\?/g) || []).length;
}

const prerenderRoot = path.join(ROOT, 'dist', '_prerender');
const productDir = path.join(prerenderRoot, 'product');
const sitemap = read(path.join(ROOT, 'dist', 'sitemap.xml'));
const middleware = read(path.join(ROOT, 'middleware.ts'));
const hasInvalidProductMiddlewareGuard =
  /pathname\.startsWith\('\/product\/'\)[\s\S]{0,400}PRERENDERED_PRODUCT_HANDLES\.has\(handle\)[\s\S]{0,120}return404\(request\)/.test(middleware);
const hasHomepageFaqMiddlewareSchema =
  /pathname === '\/'[\s\S]{0,120}generateHomepageFaqSchema\(\)/.test(middleware);

console.log(`[validate:seo-regressions] middleware invalid product guard: ${hasInvalidProductMiddlewareGuard}`);
console.log(`[validate:seo-regressions] middleware homepage FAQ schema: ${hasHomepageFaqMiddlewareSchema}`);

if (!hasInvalidProductMiddlewareGuard) fail('middleware is missing the manifest-backed invalid product 404 guard');
if (!hasHomepageFaqMiddlewareSchema) fail('middleware is missing homepage-only FAQPage schema injection');

const homepageHtml = read(path.join(prerenderRoot, 'index.html'));
const homepageFaqs = jsonLd(homepageHtml).flatMap(schema => collectSchemas(schema, 'FAQPage'));
const homepageQuestions = Array.isArray(homepageFaqs[0]?.mainEntity) ? homepageFaqs[0].mainEntity : [];
const missingAcceptedAnswers = homepageQuestions.filter(question => !question.acceptedAnswer);

console.log(`[validate:seo-regressions] homepage FAQPage schemas: ${homepageFaqs.length}`);
console.log(`[validate:seo-regressions] homepage FAQ questions: ${homepageQuestions.length}`);
console.log(`[validate:seo-regressions] homepage FAQ missing acceptedAnswer: ${missingAcceptedAnswers.length}`);

if (homepageFaqs.length !== 1) fail(`homepage should have exactly 1 FAQPage schema, found ${homepageFaqs.length}`);
if (homepageQuestions.length !== 7) fail(`homepage FAQPage should have 7 questions, found ${homepageQuestions.length}`);
if (missingAcceptedAnswers.length !== 0) fail(`homepage FAQPage has ${missingAcceptedAnswers.length} questions missing acceptedAnswer`);

const shippingHtml = read(path.join(prerenderRoot, 'shipping.html'));
const collectionsHtml = read(path.join(prerenderRoot, 'collections.html'));
const productSample = fs.existsSync(productDir)
  ? fs.readdirSync(productDir).find(file => file.endsWith('.html'))
  : null;
const productHtml = productSample ? read(path.join(productDir, productSample)) : '';

const shippingHomepageFaqMatches = countHomepageFaqMatches(shippingHtml);
const collectionsHomepageFaqMatches = countHomepageFaqMatches(collectionsHtml);
const productHomepageFaqMatches = countHomepageFaqMatches(productHtml);

console.log(`[validate:seo-regressions] /shipping homepage FAQ matches: ${shippingHomepageFaqMatches}`);
console.log(`[validate:seo-regressions] /collections homepage FAQ matches: ${collectionsHomepageFaqMatches}`);
console.log(`[validate:seo-regressions] product homepage FAQ matches: ${productHomepageFaqMatches}`);

if (shippingHomepageFaqMatches > 0) fail('/shipping contains homepage FAQ schema');
if (collectionsHomepageFaqMatches > 0) fail('/collections contains homepage FAQ schema');
if (productHomepageFaqMatches > 0) fail(`product sample ${productSample} contains homepage FAQ schema`);

for (const handle of BAD_PRODUCT_HANDLES) {
  const productFile = path.join(productDir, `${handle}.html`);
  const sitemapUrl = `${SITE_URL}/product/${handle}`;
  const inPrerender = fs.existsSync(productFile);
  const inSitemap = sitemap.includes(`<loc>${sitemapUrl}</loc>`);

  console.log(`[validate:seo-regressions] invalid product ${handle}: prerender=${inPrerender} sitemap=${inSitemap}`);
  if (inPrerender) fail(`invalid product handle has prerendered HTML: ${handle}`);
  if (inSitemap) fail(`invalid product handle is present in sitemap: ${handle}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log('[validate:seo-regressions] OK: homepage FAQ and invalid product regressions are covered.');
