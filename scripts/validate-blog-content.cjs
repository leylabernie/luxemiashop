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
}

const orphanMappings = Object.keys(BLOG_POST_CATEGORY_MAP).filter(slug => !postSlugs.includes(slug));
if (orphanMappings.length > 0) fail(`Category map contains unpublished articles: ${orphanMappings.join(', ')}`);

if (process.exitCode) process.exit(process.exitCode);
console.log(`[blog-content] OK — ${blogPosts.length} articles have unique URLs, dated source reviews, transparent bylines, and active topic hubs.`);
