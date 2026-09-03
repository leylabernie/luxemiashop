#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function loadTsModule(relativePath) {
  const result = esbuild.buildSync({
    entryPoints: [path.join(PROJECT_ROOT, relativePath)],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  const execute = new Function('module', 'exports', 'require', result.outputFiles[0].text);
  execute(module, module.exports, require);
  return module.exports;
}

function fail(message) {
  console.error(`[blog-content] ${message}`);
  process.exitCode = 1;
}

const { blogPosts, PUBLISHED_BLOG_SLUGS } = loadTsModule('src/data/blogPosts.ts');
const { BLOG_CATEGORY_GROUPS, BLOG_POST_CATEGORY_MAP } = loadTsModule('src/data/blogCategories.ts');
const { semanticCommerceGuides, SEMANTIC_COMMERCE_GUIDE_SLUGS } = loadTsModule('src/data/semanticCommerceGuides.ts');

const REQUIRED_SEMANTIC_GUIDES = new Map([
  ['what-should-a-male-guest-wear-to-a-three-day-indian-wedding', 'What should a male guest wear to a three-day Indian wedding?'],
  ['what-should-a-non-indian-guest-wear-to-an-indian-wedding', 'What should a non-Indian guest wear to an Indian wedding?'],
  ['what-saree-fabrics-work-for-an-outdoor-summer-wedding', 'What saree fabrics work for an outdoor summer wedding?'],
  ['saree-versus-lehenga-for-a-wedding-guest', 'Saree versus lehenga for a wedding guest'],
  ['sherwani-versus-kurta-set', 'Sherwani versus kurta set'],
  ['what-should-guests-wear-to-a-mehendi', 'What should guests wear to a Mehendi?'],
  ['what-should-guests-wear-to-a-sangeet', 'What should guests wear to a Sangeet?'],
  ['ready-to-ship-versus-made-to-order', 'Ready-to-ship versus made-to-order'],
  ['what-does-semi-stitched-lehenga-mean', 'What does semi-stitched lehenga mean?'],
  ['how-to-measure-for-a-lehenga-ordered-online', 'How to measure for a lehenga ordered online'],
  ['chaniya-choli-versus-lehenga', 'Chaniya choli versus lehenga'],
  ['how-early-to-order-for-a-fixed-wedding-date', 'How early to order for a fixed wedding date'],
]);

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ');
}

function plainText(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function extractJsonLd(html, label) {
  const schemas = [];
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      schemas.push(JSON.parse(match[1]));
    } catch (error) {
      fail(`${label} contains invalid JSON-LD: ${error.message}`);
    }
  }
  return schemas.flatMap((schema) => Array.isArray(schema?.['@graph']) ? [schema, ...schema['@graph']] : [schema]);
}

const GROWTH_GUIDE_SLUGS = new Set([
  'sharara-vs-gharara-difference',
  'ready-to-ship-vs-made-to-order-indian-outfits',
  'does-a-saree-come-with-a-blouse',
  'how-should-a-sherwani-fit-measurement-checklist',
  'how-to-buy-a-bridal-lehenga-online-checklist',
]);

if (!Array.isArray(blogPosts) || blogPosts.length === 0) {
  fail('No published articles were loaded.');
  process.exit(1);
}

const postSlugs = blogPosts.map(post => post.slug);
const publishedSlugs = [...PUBLISHED_BLOG_SLUGS];
const categorySlugs = new Set(BLOG_CATEGORY_GROUPS.map(group => group.slug));
const duplicateSlugs = postSlugs.filter((slug, index) => postSlugs.indexOf(slug) !== index);
const duplicateIds = blogPosts.map(post => post.id).filter((id, index, ids) => ids.indexOf(id) !== index);

if (duplicateSlugs.length > 0) fail(`Duplicate article slugs: ${[...new Set(duplicateSlugs)].join(', ')}`);
if (duplicateIds.length > 0) fail(`Duplicate article IDs: ${[...new Set(duplicateIds)].join(', ')}`);

const missingFromData = publishedSlugs.filter(slug => !postSlugs.includes(slug));
const missingFromAllowlist = postSlugs.filter(slug => !publishedSlugs.includes(slug));
if (missingFromData.length > 0) fail(`Allowlisted slugs missing from blogPosts: ${missingFromData.join(', ')}`);
if (missingFromAllowlist.length > 0) fail(`Published posts missing from the allowlist: ${missingFromAllowlist.join(', ')}`);

const unsupportedClaimPatterns = [
  /guaranteed fit/i,
  /free worldwide shipping/i,
  /ships? from (?:the )?(?:USA|United States)/i,
  /(?:delivered|delivery) in 7[–-]10 business days/i,
  /free shipping on orders over \$99/i,
  /made[- ]to[- ]measure (?:on|for) every/i,
  /customi[sz](?:e|ation|ed)[\s\S]{0,40}no extra cost/i,
  /LuxeMia (?:is|are) (?:an )?(?:authorized|official) (?:dealer|retailer|partner)/i,
  /LuxeMia currently ships to United States\s+addresses only/i,
  /Shipping is available to United States\s+addresses only/i,
  /United States\s+shipping only/i,
  /International shipping:\s+not currently available/i,
  /eligible U\.S\. standard-stock items may be returned/i,
  /30 calendar days of delivery/i,
  /previous LuxeMia article incorrectly/i,
  /luxemias\.shop/i,
  /Sabyasachi[- ]inspired/i,
];

for (const post of blogPosts) {
  const label = `/blog/${post.slug}`;
  if (!post.title || !post.excerpt || !post.content) fail(`${label} is missing required editorial copy.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.factCheckedAt)) fail(`${label} has an invalid factCheckedAt date.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.updatedAt)) fail(`${label} has an invalid updatedAt date.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)) fail(`${label} has an invalid publishedAt date.`);
  if (post.updatedAt < post.publishedAt) fail(`${label} was updated before its publication date.`);
  if (post.factCheckedAt !== post.updatedAt) fail(`${label} must be updated whenever its sources are rechecked.`);
  if (post.author !== 'LuxeMia Editorial Team') fail(`${label} uses an unverified individual byline.`);
  if (!Array.isArray(post.sources) || post.sources.length === 0) fail(`${label} has no review sources.`);

  for (const source of post.sources || []) {
    if (!source.title || !source.publisher) fail(`${label} has an incomplete source attribution.`);
    try {
      const url = new URL(source.url);
      if (url.protocol !== 'https:') fail(`${label} has a non-HTTPS source: ${source.url}`);
    } catch {
      fail(`${label} has an invalid source URL: ${source.url}`);
    }
  }

  const category = BLOG_POST_CATEGORY_MAP[post.slug];
  if (!category || !categorySlugs.has(category)) fail(`${label} is not assigned to an active topic hub.`);

  const articleText = `${post.title}\n${post.excerpt}\n${post.content}`;
  for (const pattern of unsupportedClaimPatterns) {
    if (pattern.test(articleText)) fail(`${label} contains blocked legacy copy matching ${pattern}.`);
  }

  if (GROWTH_GUIDE_SLUGS.has(post.slug)) {
    const excerptWordCount = post.excerpt.trim().split(/\s+/).filter(Boolean).length;
    const contentWordCount = post.content
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z0-9#]+;/gi, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const questionH2Count = [...post.content.matchAll(/<h2[^>]*>[^<]*\?<\/h2>/gi)].length;
    const internalLinkCount = [...post.content.matchAll(/href=["']\/(?!\/)[^"']+["']/gi)].length;
    const crossGuideLinkCount = [...post.content.matchAll(/href=["']\/blog\/(?:sharara-vs-gharara-difference|ready-to-ship-vs-made-to-order-indian-outfits|does-a-saree-come-with-a-blouse|how-should-a-sherwani-fit-measurement-checklist|how-to-buy-a-bridal-lehenga-online-checklist)["']/gi)].length;
    const externalCitationCount = [...post.content.matchAll(/href=["']https:\/\/[^"']+["']/gi)].length;

    if (excerptWordCount < 45 || excerptWordCount > 75) fail(`${label} excerpt must be 45–75 words (found ${excerptWordCount}).`);
    if (contentWordCount < 700) fail(`${label} must contain at least 700 editorial words (found ${contentWordCount}).`);
    if (!/<table[\s>]/i.test(post.content)) fail(`${label} must contain a decision table.`);
    if (questionH2Count < 5) fail(`${label} must contain at least five direct-answer H2 questions (found ${questionH2Count}).`);
    if (internalLinkCount < 6) fail(`${label} must contain at least six useful internal links (found ${internalLinkCount}).`);
    if (crossGuideLinkCount < 4) fail(`${label} must cross-link the four companion growth guides (found ${crossGuideLinkCount}).`);
    if (externalCitationCount < 1) fail(`${label} must contain at least one visible inline external citation.`);
  }
}

if (!Array.isArray(semanticCommerceGuides) || semanticCommerceGuides.length !== REQUIRED_SEMANTIC_GUIDES.size) {
  fail(`Expected exactly ${REQUIRED_SEMANTIC_GUIDES.size} semantic commerce guides (found ${semanticCommerceGuides?.length || 0}).`);
}

const exportedSemanticSlugs = new Set(SEMANTIC_COMMERCE_GUIDE_SLUGS || []);
const semanticSlugs = new Set(semanticCommerceGuides.map(post => post.slug));
const expectedSemanticSlugs = new Set(REQUIRED_SEMANTIC_GUIDES.keys());
for (const slug of expectedSemanticSlugs) {
  if (!semanticSlugs.has(slug)) fail(`/blog/${slug} is missing from semanticCommerceGuides.`);
  if (!exportedSemanticSlugs.has(slug)) fail(`/blog/${slug} is missing from SEMANTIC_COMMERCE_GUIDE_SLUGS.`);
}
for (const slug of semanticSlugs) {
  if (!expectedSemanticSlugs.has(slug)) fail(`/blog/${slug} is an unexpected semantic commerce guide.`);
}

const componentSource = fs.readFileSync(path.join(PROJECT_ROOT, 'src/pages/BlogPost.tsx'), 'utf8');
const prerenderSource = fs.readFileSync(path.join(PROJECT_ROOT, 'scripts/prerender.js'), 'utf8');
for (const required of [
  'post.guideStandard?.faqs',
  'post.guideStandard.directAnswer',
  'data-guide-direct-answer',
  '"name": "Guides"',
  'Last reviewed:',
]) {
  if (!componentSource.includes(required)) fail(`Hydrated guide renderer is missing source-driven marker: ${required}`);
}
for (const required of [
  'post.guideStandard?.directAnswer',
  'post.guideStandard?.faqs',
  "name: 'Guides'",
  "'@type': 'BlogPosting'",
  "'@type': 'BreadcrumbList'",
  "'@type': 'FAQPage'",
  'data-guide-direct-answer',
  'data-guide-editorial-meta',
]) {
  if (!prerenderSource.includes(required)) fail(`Prerender guide renderer is missing source-driven marker: ${required}`);
}

const tableSignatures = new Set();
const decisionSignatures = new Set();
const faqQuestionOwners = new Map();

for (const post of semanticCommerceGuides) {
  const label = `/blog/${post.slug}`;
  const expectedTitle = REQUIRED_SEMANTIC_GUIDES.get(post.slug);
  if (post.title !== expectedTitle) fail(`${label} H1 must exactly equal “${expectedTitle}” (found “${post.title}”).`);
  if (post.author !== 'LuxeMia Editorial Team') fail(`${label} must use the factual LuxeMia Editorial Team byline.`);
  if (Object.hasOwn(post, 'reviewer') || Object.hasOwn(post, 'reviewedBy')) fail(`${label} must not invent an individual reviewer.`);
  if (!post.guideStandard || typeof post.guideStandard.directAnswer !== 'string') fail(`${label} has no source-driven guide standard.`);

  const answer = post.guideStandard?.directAnswer || '';
  const answerWords = wordCount(answer);
  if (answerWords < 40 || answerWords > 70) fail(`${label} direct answer must be 40–70 words (found ${answerWords}).`);
  if (post.excerpt !== answer) fail(`${label} excerpt and direct answer must have one source of truth.`);
  if (post.content.includes(answer)) fail(`${label} duplicates its direct answer inside article HTML instead of using guideStandard.`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)) fail(`${label} needs a publication date.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.factCheckedAt)) fail(`${label} needs a last-reviewed date.`);
  if (!post.content.includes(`Sources were last reviewed on ${post.factCheckedAt}`)) fail(`${label} methodology must state its source-review date.`);
  if (!post.content.includes('mailto:hello@luxemia.shop')) fail(`${label} must provide the corrections contact.`);
  if (!post.content.includes('href="/editorial-policy"')) fail(`${label} must link the editorial methodology.`);

  const atAGlance = post.content.match(/<table data-guide-table="at-a-glance">[\s\S]*?<\/table>/i)?.[0] || '';
  const decisionMatrix = post.content.match(/<table data-guide-table="decision-matrix">[\s\S]*?<\/table>/i)?.[0] || '';
  const commercialSelections = post.content.match(/<table data-guide-table="commercial-selections">[\s\S]*?<\/table>/i)?.[0] || '';
  if (!atAGlance) fail(`${label} is missing its at-a-glance table.`);
  if (!decisionMatrix) fail(`${label} is missing its decision matrix.`);
  if (!commercialSelections) fail(`${label} is missing its verified-attribute commercial selections.`);
  if ((atAGlance.match(/<tr>/g) || []).length < 4) fail(`${label} at-a-glance table needs at least three guide-specific choices.`);
  if ((decisionMatrix.match(/<tr>/g) || []).length < 4) fail(`${label} decision matrix needs at least three guide-specific decisions.`);
  if ((commercialSelections.match(/<tr>/g) || []).length < 3) fail(`${label} needs at least two relevant collection or resource selections.`);
  if (!/data-guide-selection-rule>[\s\S]*No material,[\s\S]*selected variant/i.test(post.content)) fail(`${label} must state the verified-attribute-only selection rule.`);
  if (/href=["']\/product\//i.test(commercialSelections)) fail(`${label} cannot select individual products without source-bound product evidence.`);
  if ([...commercialSelections.matchAll(/href="([^"]+)"/g)].some(([, href]) => !href.startsWith('/'))) fail(`${label} commercial selections must use verified internal routes.`);

  const atAGlanceSignature = plainText(atAGlance);
  const decisionSignature = plainText(decisionMatrix);
  if (tableSignatures.has(atAGlanceSignature)) fail(`${label} reuses another guide’s at-a-glance table.`);
  if (decisionSignatures.has(decisionSignature)) fail(`${label} reuses another guide’s decision matrix.`);
  tableSignatures.add(atAGlanceSignature);
  decisionSignatures.add(decisionSignature);

  const nuanceSection = post.content.match(/<h2>Nuance and exceptions<\/h2>\s*<ul>([\s\S]*?)<\/ul>/i)?.[1] || '';
  if ((nuanceSection.match(/<li>/g) || []).length < 3) fail(`${label} needs at least three guide-specific nuances or exceptions.`);

  const relatedSection = post.content.match(/<h2>Related Guides<\/h2>\s*<ul>([\s\S]*?)<\/ul>/i)?.[1] || '';
  const relatedLinks = [...relatedSection.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);
  if (relatedLinks.length < 2 || relatedLinks.some(href => !href.startsWith('/'))) fail(`${label} needs at least two relevant internal guide or support links.`);

  const faqs = post.guideStandard?.faqs || [];
  if (faqs.length < 4 || faqs.length > 8) fail(`${label} must have 4–8 visible guide-specific FAQs (found ${faqs.length}).`);
  const visibleFaqBlock = post.content.match(/<div data-guide-visible-faqs>([\s\S]*?)<\/div>/i)?.[1] || '';
  const visibleFaqs = [...visibleFaqBlock.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi)]
    .map(([, question, faqAnswer]) => ({ question: plainText(question), answer: plainText(faqAnswer) }));
  if (JSON.stringify(visibleFaqs) !== JSON.stringify(faqs)) fail(`${label} visible FAQs drift from guideStandard and would make schema inaccurate.`);
  for (const faq of faqs) {
    if (!faq.question.endsWith('?') || faq.question.length < 12) fail(`${label} has an invalid FAQ question: ${faq.question}`);
    if (faq.answer.length < 40) fail(`${label} has an underspecified FAQ answer: ${faq.question}`);
    const owner = faqQuestionOwners.get(faq.question);
    if (owner && owner !== post.slug) fail(`${label} reuses FAQ “${faq.question}” from /blog/${owner}.`);
    faqQuestionOwners.set(faq.question, post.slug);
  }

  if (!Array.isArray(post.sources) || post.sources.length < 3) fail(`${label} needs identified methodology sources.`);
  if (!post.sources.some(source => new URL(source.url).hostname !== 'luxemia.shop')) fail(`${label} needs an independent established source.`);

  // Answers and FAQs live only in the guide data. Renderers consume those
  // values so hydrated and initial HTML cannot silently drift apart.
  for (const value of [answer, ...faqs.flatMap(faq => [faq.question, faq.answer])]) {
    if (componentSource.includes(value) || prerenderSource.includes(value)) fail(`${label} duplicates source-driven guide copy in a renderer.`);
  }
}

if (process.argv.includes('--require-built')) {
  for (const post of semanticCommerceGuides) {
    const label = `/blog/${post.slug}`;
    const builtPath = path.join(PROJECT_ROOT, 'dist', '_prerender', 'blog', `${post.slug}.html`);
    if (!fs.existsSync(builtPath)) {
      fail(`${label} has no built prerender file at ${path.relative(PROJECT_ROOT, builtPath)}.`);
      continue;
    }
    const html = fs.readFileSync(builtPath, 'utf8');
    const expectedH1 = post.title;
    const answer = post.guideStandard.directAnswer;
    const h1Answer = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>\s*<p data-guide-direct-answer>([\s\S]*?)<\/p>/i);
    if (!h1Answer) {
      fail(`${label} initial HTML must place its direct answer immediately after H1.`);
    } else {
      if (plainText(h1Answer[1]) !== expectedH1) fail(`${label} built H1 is not the exact audit title.`);
      if (plainText(h1Answer[2]) !== answer) fail(`${label} built direct answer drifted from guideStandard.`);
    }
    if (!html.includes('data-guide-editorial-meta')) fail(`${label} initial HTML lacks its visible author/publication/review line.`);
    if (!/<nav aria-label="Breadcrumb">[\s\S]*?<a href="\/blog">Guides<\/a>/i.test(html)) fail(`${label} initial HTML breadcrumb must label /blog as Guides.`);
    if (!html.includes(`Published <time datetime="${post.publishedAt}">`)) fail(`${label} initial HTML lacks its visible publication date.`);
    if (!html.includes(`Last reviewed <time datetime="${post.factCheckedAt}">`)) fail(`${label} initial HTML lacks its visible last-reviewed date.`);
    for (const marker of ['at-a-glance', 'decision-matrix', 'commercial-selections']) {
      if (!html.includes(`data-guide-table="${marker}"`)) fail(`${label} initial HTML lacks the ${marker} table.`);
    }
    if (!html.includes('data-guide-visible-faqs')) fail(`${label} initial HTML lacks visible FAQs.`);
    if (!html.includes('mailto:hello@luxemia.shop')) fail(`${label} initial HTML lacks the corrections contact.`);

    const schemas = extractJsonLd(html, label);
    const article = schemas.find(schema => schema?.['@type'] === 'BlogPosting');
    const breadcrumb = schemas.find(schema => schema?.['@type'] === 'BreadcrumbList');
    const faqPage = schemas.find(schema => schema?.['@type'] === 'FAQPage');
    if (!article || article.headline !== post.title || article.datePublished !== post.publishedAt || article.dateModified !== post.updatedAt) fail(`${label} built BlogPosting schema is missing or inaccurate.`);
    if (!breadcrumb || breadcrumb.itemListElement?.[1]?.name !== 'Guides' || breadcrumb.itemListElement?.[2]?.name !== post.title) fail(`${label} built BreadcrumbList must label the hub Guides and preserve the exact H1.`);
    const schemaFaqs = (faqPage?.mainEntity || []).map(entity => ({
      question: entity.name,
      answer: entity.acceptedAnswer?.text,
    }));
    if (JSON.stringify(schemaFaqs) !== JSON.stringify(post.guideStandard.faqs)) fail(`${label} built FAQPage does not exactly match the visible source FAQs.`);
  }
}

const orphanMappings = Object.keys(BLOG_POST_CATEGORY_MAP).filter(slug => !postSlugs.includes(slug));
if (orphanMappings.length > 0) fail(`Category map contains unpublished articles: ${orphanMappings.join(', ')}`);

if (process.exitCode) process.exit(process.exitCode);
console.log(`[blog-content] OK — ${blogPosts.length} articles passed publishing checks; all ${semanticCommerceGuides.length} audit-priority guides passed exact-H1, direct-answer, decision-support, FAQ, source, commercial-link and schema-source validation${process.argv.includes('--require-built') ? ' in source and built HTML' : ''}.`);
