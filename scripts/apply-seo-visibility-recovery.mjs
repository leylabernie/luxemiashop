#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const write = (relativePath, content) => fs.writeFileSync(path.join(ROOT, relativePath), content, 'utf8');

function countOccurrences(text, needle) {
  if (!needle) return 0;
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(needle, index)) !== -1) {
    count += 1;
    index += needle.length;
  }
  return count;
}

function replaceOnce(text, needle, replacement, label) {
  const count = countOccurrences(text, needle);
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one occurrence, found ${count}`);
  }
  return text.replace(needle, replacement);
}

function removeUniqueLine(text, needle, label) {
  const lines = text.split('\n');
  const matches = lines.filter((line) => line.includes(needle));
  if (matches.length !== 1) {
    throw new Error(`${label}: expected one matching line for ${needle}, found ${matches.length}`);
  }
  return lines.filter((line) => !line.includes(needle)).join('\n');
}

const recoveryCollections = [
  'wedding-sarees',
  'bridal-lehengas',
  'sharara-suits',
  'gharara-suits',
  'anarkali-suits',
  'designer-sarees',
];
const recoveredBlogSlugs = [
  'plus-size-indian-ethnic-wear-guide',
  'manish-malhotra-bollywood-bridal-designer-profile',
  'indian-wedding-terms-glossary-50-events-rituals-roles',
];
const recoveredPaths = [
  ...recoveryCollections.map((handle) => `/collections/${handle}`),
  ...recoveredBlogSlugs.map((slug) => `/blog/${slug}`),
];

// ─── React routes ───────────────────────────────────────────────────────────
let app = read('src/App.tsx');
app = replaceOnce(
  app,
  'const ShopifyCollection = lazy(() => import("./pages/ShopifyCollection"));',
  'const ShopifyCollection = lazy(() => import("./pages/ShopifyCollection"));\nconst RecoveryCollection = lazy(() => import("./pages/RecoveryCollection"));',
  'App recovery import',
);

const routeReplacements = new Map([
  ['<Route path="/collections/wedding-sarees" element={<Navigate to="/sarees" replace />} />', '<Route path="/collections/wedding-sarees" element={<Suspense fallback={<PageLoader />}><RecoveryCollection handle="wedding-sarees" /></Suspense>} />'],
  ['<Route path="/collections/bridal-lehengas" element={<Navigate to="/lehengas" replace />} />', '<Route path="/collections/bridal-lehengas" element={<Suspense fallback={<PageLoader />}><RecoveryCollection handle="bridal-lehengas" /></Suspense>} />'],
  ['<Route path="/collections/sharara-suits" element={<Navigate to="/suits" replace />} />', '<Route path="/collections/sharara-suits" element={<Suspense fallback={<PageLoader />}><RecoveryCollection handle="sharara-suits" /></Suspense>} />'],
  ['<Route path="/collections/gharara-suits" element={<Navigate to="/suits" replace />} />', '<Route path="/collections/gharara-suits" element={<Suspense fallback={<PageLoader />}><RecoveryCollection handle="gharara-suits" /></Suspense>} />'],
  ['<Route path="/collections/anarkali-suits" element={<Navigate to="/suits" replace />} />', '<Route path="/collections/anarkali-suits" element={<Suspense fallback={<PageLoader />}><RecoveryCollection handle="anarkali-suits" /></Suspense>} />'],
  ['<Route path="/collections/designer-sarees" element={<Navigate to="/sarees" replace />} />', '<Route path="/collections/designer-sarees" element={<Suspense fallback={<PageLoader />}><RecoveryCollection handle="designer-sarees" /></Suspense>} />'],
]);
for (const [legacyRoute, recoveredRoute] of routeReplacements) {
  app = replaceOnce(app, legacyRoute, recoveredRoute, `App route ${legacyRoute}`);
}
write('src/App.tsx', app);

// ─── Client-side product classification ─────────────────────────────────────
let hook = read('src/hooks/useShopifyProducts.ts');
const clientCategoryTypes = `
  'wedding-sarees': ['Wedding Saree', 'Bridal Saree'],
  'bridal-lehengas': ['Bridal Lehenga', 'Bridal Lehenga Choli', 'Bridal Lehengas', 'Bridal Lehnga', 'Bridal Lehnga Choli'],
  'sharara-suits': ['Sharara Suit', 'Sharara', 'Sharara Set'],
  'gharara-suits': ['Gharara Suit', 'Gharara Set', 'Readymade Gharara Set'],
  'anarkali-suits': ['Anarkali Suit', 'Anarkali'],
  'designer-sarees': ['Designer Saree'],`;
hook = replaceOnce(
  hook,
  '\n};\n\nconst escapeRegex',
  `${clientCategoryTypes}\n};\n\nconst escapeRegex`,
  'Client recovery category map',
);
if (!hook.includes("const HIDE_OLD_PRODUCTS = false;")) {
  throw new Error('Client catalog visibility must remain HIDE_OLD_PRODUCTS = false');
}
write('src/hooks/useShopifyProducts.ts', hook);

// ─── Remove broad migration redirects ───────────────────────────────────────
let middleware = read('middleware.ts');
for (const handle of recoveryCollections) {
  middleware = removeUniqueLine(
    middleware,
    `'\/collections\/${handle}'`.replaceAll('\\/', '/'),
    `Middleware redirect /collections/${handle}`,
  );
}
write('middleware.ts', middleware);

const vercelPath = 'vercel.json';
const vercel = JSON.parse(read(vercelPath));
const originalRedirectCount = Array.isArray(vercel.redirects) ? vercel.redirects.length : 0;
const recoveredCollectionPaths = new Set(recoveryCollections.map((handle) => `/collections/${handle}`));
vercel.redirects = (vercel.redirects || []).filter((redirect) => !recoveredCollectionPaths.has(redirect.source));
if (originalRedirectCount - vercel.redirects.length !== recoveryCollections.length) {
  throw new Error(`Vercel redirects: expected to remove ${recoveryCollections.length}, removed ${originalRedirectCount - vercel.redirects.length}`);
}
write(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);

// ─── Route generation ───────────────────────────────────────────────────────
let routeGenerator = read('scripts/generate-routes.cjs');
routeGenerator = replaceOnce(
  routeGenerator,
  "const BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/blogPosts.ts');",
  "const BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/blogPosts.ts');\nconst RECOVERED_BLOG_POSTS_TS = path.join(PROJECT_ROOT, 'src/data/recoveredBlogPosts.ts');",
  'Route generator recovered blog source',
);
routeGenerator = replaceOnce(
  routeGenerator,
  '  const files = [BLOG_POSTS_TS];',
  '  const files = [BLOG_POSTS_TS, RECOVERED_BLOG_POSTS_TS];',
  'Route generator blog file list',
);
const routeListInsertion = `  '/collections/customizable-indian-outfits',
  '/collections/wedding-sarees',
  '/collections/bridal-lehengas',
  '/collections/sharara-suits',
  '/collections/gharara-suits',
  '/collections/anarkali-suits',
  '/collections/designer-sarees',`;
routeGenerator = replaceOnce(
  routeGenerator,
  "  '/collections/customizable-indian-outfits',",
  routeListInsertion,
  'Route generator recovery routes',
);
write('scripts/generate-routes.cjs', routeGenerator);

// ─── Sitemap generation and approved inventory ──────────────────────────────
let sitemap = read('scripts/generate-sitemap.cjs');
sitemap = replaceOnce(
  sitemap,
  'const EXPECTED_SITEMAP_URL_COUNT = 758;',
  'const EXPECTED_SITEMAP_URL_COUNT = 767;',
  'Sitemap expected URL count',
);
const sitemapStaticInsertion = `  { loc: '/collections/customizable-indian-outfits', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/wedding-sarees', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/bridal-lehengas', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/sharara-suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/gharara-suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/anarkali-suits', changefreq: 'daily', priority: '0.9' },
  { loc: '/collections/designer-sarees', changefreq: 'daily', priority: '0.9' },`;
sitemap = replaceOnce(
  sitemap,
  "  { loc: '/collections/customizable-indian-outfits', changefreq: 'weekly', priority: '0.9' },",
  sitemapStaticInsertion,
  'Sitemap recovery static pages',
);
sitemap = replaceOnce(
  sitemap,
  "  const blogPostsPath = path.join(__dirname, '..', 'src', 'data', 'blogPosts.ts');",
  "  const blogPostsPath = path.join(__dirname, '..', 'src', 'data', 'blogPosts.ts');\n  const recoveredBlogPostsPath = path.join(__dirname, '..', 'src', 'data', 'recoveredBlogPosts.ts');",
  'Sitemap recovered blog source',
);
sitemap = replaceOnce(
  sitemap,
  '  const files = [blogPostsPath];',
  '  const files = [blogPostsPath, recoveredBlogPostsPath];',
  'Sitemap recovered blog file list',
);
write('scripts/generate-sitemap.cjs', sitemap);

const inventoryPath = 'scripts/approved-sitemap-inventory.json';
const inventory = JSON.parse(read(inventoryPath));
if (inventory.urlCount !== 758 || !Array.isArray(inventory.paths) || inventory.paths.length !== 758) {
  throw new Error(`Expected a 758-path approved inventory before recovery; found declared=${inventory.urlCount}, paths=${inventory.paths?.length}`);
}
const inventorySet = new Set(inventory.paths);
for (const routePath of recoveredPaths) {
  if (inventorySet.has(routePath)) throw new Error(`Recovery path already existed in approved inventory: ${routePath}`);
  inventory.paths.push(routePath);
  inventorySet.add(routePath);
}
inventory.urlCount = inventory.paths.length;
if (inventory.urlCount !== 767 || inventorySet.size !== 767) {
  throw new Error(`Recovery inventory must contain 767 unique paths; found declared=${inventory.urlCount}, unique=${inventorySet.size}`);
}
write(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);

// ─── Crawler prerendering ───────────────────────────────────────────────────
let prerender = read('scripts/prerender.js');
const prerenderCategoryTypes = `
  'wedding-sarees': ['Wedding Saree', 'Bridal Saree'],
  'bridal-lehengas': ['Bridal Lehenga', 'Bridal Lehenga Choli', 'Bridal Lehengas', 'Bridal Lehnga', 'Bridal Lehnga Choli'],
  'sharara-suits': ['Sharara Suit', 'Sharara', 'Sharara Set'],
  'gharara-suits': ['Gharara Suit', 'Gharara Set', 'Readymade Gharara Set'],
  'anarkali-suits': ['Anarkali Suit', 'Anarkali'],
  'designer-sarees': ['Designer Saree'],`;
prerender = replaceOnce(
  prerender,
  '\n};\n\nconst MENSWEAR_KEYWORDS_REGEX',
  `${prerenderCategoryTypes}\n};\n\nconst MENSWEAR_KEYWORDS_REGEX`,
  'Prerender recovery category map',
);
prerender = replaceOnce(
  prerender,
  'const HIDE_OLD_PRODUCTS = true;',
  'const HIDE_OLD_PRODUCTS = false;',
  'Crawler/human catalog parity',
);

const recoveryRouteDefinitions = `// Restored high-intent collection URLs lost during the July 2026 migration.
// Each route has a distinct query intent, self-canonical HTML, relevant live
// inventory and internal links. These are 200 destinations, never redirect aliases.
const RECOVERY_COLLECTION_ROUTES = [
  {
    path: '/collections/wedding-sarees',
    category: 'wedding-sarees',
    title: 'Wedding Sarees Online USA — Bridal & Ceremony Sarees | LuxeMia',
    description: 'Shop wedding sarees online for ceremonies, receptions and family celebrations. Compare exact fabric, blouse details, sizing and tracked U.S. shipping.',
    h1: 'Wedding Sarees for Ceremonies & Receptions',
    content: \`
      <p>Browse current wedding and bridal sarees. Use each product page to verify the exact fabric, blouse or blouse-piece details, measurements, included pieces and availability.</p>
      <h2>Compare Wedding Sarees Before Ordering</h2>
      <p>Construction varies by item. Confirm the selected variant, any stitching or customization, and current shipping timing before ordering for a fixed event date.</p>
      <p><a href="/sarees">Browse all sarees</a> · <a href="/blog/wedding-saree-for-mother-of-bride">Wedding saree guide for the mother of the bride</a> · <a href="/sizing-measurements-guide">Sizing and measurements</a></p>
    \`,
  },
  {
    path: '/collections/bridal-lehengas',
    category: 'bridal-lehengas',
    title: 'Bridal Lehengas Online USA — Wedding Lehenga Choli | LuxeMia',
    description: 'Shop bridal lehengas and wedding lehenga choli online. Verify fabric, included pieces, measurements, availability and tracked U.S. shipping.',
    h1: 'Bridal Lehengas for Wedding Ceremonies',
    content: \`
      <p>Compare current bridal lehenga and lehenga-choli listings by fabric, included pieces, measurements, embellishment and availability.</p>
      <h2>Check Every Supplied Piece</h2>
      <p>Do not assume that every listing includes the same skirt, choli, dupatta, lining or stitching. The exact product page is the source of truth.</p>
      <p><a href="/lehengas">Browse all lehengas</a> · <a href="/collections/customizable-indian-outfits">Customizable Indian outfits</a> · <a href="/sizing-measurements-guide">Sizing and measurements</a></p>
    \`,
  },
  {
    path: '/collections/sharara-suits',
    category: 'sharara-suits',
    title: 'Sharara Suits Online USA — Wedding & Party Sharara Sets | LuxeMia',
    description: 'Shop sharara suits and coordinated sharara sets online. Compare included pieces, fabric, sizing, availability and tracked U.S. shipping.',
    h1: 'Sharara Suits & Coordinated Sets',
    content: \`
      <p>Browse current sharara suits and sets, then verify the kurta, bottoms, dupatta, fabric, measurements and availability on each listing.</p>
      <h2>What Is Included in the Set?</h2>
      <p>Product construction varies. Confirm the waistband, rise, bottom length, kurta and dupatta details for the selected item.</p>
      <p><a href="/suits">Browse all salwar kameez</a> · <a href="/collections/gharara-suits">Compare gharara suits</a> · <a href="/collections/anarkali-suits">Browse anarkali suits</a></p>
    \`,
  },
  {
    path: '/collections/gharara-suits',
    category: 'gharara-suits',
    title: 'Gharara Suits Online USA — Readymade Gharara Sets | LuxeMia',
    description: 'Shop gharara suits and readymade gharara sets online. Compare included pieces, fabric, sizing, availability and tracked U.S. shipping.',
    h1: 'Gharara Suits & Readymade Gharara Sets',
    content: \`
      <p>Shop current gharara styles while checking the exact bottom construction, included pieces, fabric, measurements and availability.</p>
      <h2>Verify the Gharara Silhouette</h2>
      <p>Catalog terminology can vary. Use the product photographs and description to confirm the fitted upper section, flare, waistband, kurta and dupatta supplied.</p>
      <p><a href="/suits">Browse all salwar kameez</a> · <a href="/collections/sharara-suits">Compare sharara suits</a> · <a href="/sizing-measurements-guide">Sizing and measurements</a></p>
    \`,
  },
  {
    path: '/collections/anarkali-suits',
    category: 'anarkali-suits',
    title: 'Anarkali Suits Online USA — Wedding & Party Anarkalis | LuxeMia',
    description: 'Shop anarkali suits online for weddings and celebrations. Compare fabric, included pieces, measurements, availability and tracked U.S. shipping.',
    h1: 'Anarkali Suits for Weddings & Celebrations',
    content: \`
      <p>Browse current flared anarkali suits and verify the exact fabric, lining, included pieces, measurements and availability.</p>
      <h2>Compare Cut, Flare and Length</h2>
      <p>Check where the bodice ends, how the flare begins, the supplied bottoms and dupatta, and the full garment length for the selected product.</p>
      <p><a href="/suits">Browse all salwar kameez</a> · <a href="/collections/sharara-suits">Browse sharara suits</a> · <a href="/blog/how-to-choose-salwar-kameez-body-type">Salwar kameez fit guide</a></p>
    \`,
  },
  {
    path: '/collections/designer-sarees',
    category: 'designer-sarees',
    title: 'Designer Sarees Online USA — Wedding & Party Sarees | LuxeMia',
    description: 'Shop designer sarees online for weddings and special occasions. Compare exact fabric, work, blouse details, availability and tracked U.S. shipping.',
    h1: 'Designer Sarees for Weddings & Special Occasions',
    content: \`
      <p>Browse current designer-saree listings and verify the exact fabric, surface work, blouse details, measurements and availability.</p>
      <h2>Category Name Is Not an Affiliation Claim</h2>
      <p>A designer-saree product type does not establish affiliation with an unrelated luxury fashion house. Use the exact listing for the stated brand or vendor and product details.</p>
      <p><a href="/sarees">Browse all sarees</a> · <a href="/collections/wedding-sarees">Browse wedding sarees</a> · <a href="/blog/designer-profiles">Read source-based designer profiles</a></p>
    \`,
  },
];

// Route definitions with SEO metadata
const routes = [
  ...RECOVERY_COLLECTION_ROUTES,`;
prerender = replaceOnce(
  prerender,
  '// Route definitions with SEO metadata\nconst routes = [',
  recoveryRouteDefinitions,
  'Prerender recovery route definitions',
);

// Link parent crawler pages directly to the restored destinations.
prerender = replaceOnce(
  prerender,
  '<li><a href="/lehengas">Bridal Lehengas</a></li>',
  '<li><a href="/collections/bridal-lehengas">Bridal Lehengas</a></li>',
  'Homepage bridal collection link',
);
prerender = replaceOnce(
  prerender,
  '<li><a href="/sarees">Wedding Sarees</a></li>',
  '<li><a href="/collections/wedding-sarees">Wedding Sarees</a></li>',
  'Homepage wedding saree link',
);
prerender = replaceOnce(
  prerender,
  '<li><a href="/anarkali-suit-for-wedding-guest">Anarkali Suits for Wedding Guests</a> — Compare current flared-kurta styles</li>',
  '<li><a href="/collections/anarkali-suits">Anarkali Suits</a> — Compare current flared-kurta styles</li>',
  'Suits page anarkali internal link',
);
prerender = replaceOnce(
  prerender,
  '<li><a href="/sharara-for-bride-sister">Sharara Sets for the Bride\'s Sister</a> — Compare current wide-leg styles</li>',
  '<li><a href="/collections/sharara-suits">Sharara Suits</a> — Compare current wide-leg styles</li>',
  'Suits page sharara internal link',
);
prerender = replaceOnce(
  prerender,
  '<li><strong>Gharara Suits</strong> — Review the style filters and exact listing for the supplied bottom silhouette</li>',
  '<li><a href="/collections/gharara-suits">Gharara Suits</a> — Verify the exact bottom silhouette and supplied pieces</li>',
  'Suits page gharara internal link',
);
write('scripts/prerender.js', prerender);

// ─── Restore source-reviewed articles ───────────────────────────────────────
let blogPosts = read('src/data/blogPosts.ts');
blogPosts = replaceOnce(
  blogPosts,
  'export interface BlogSource {',
  "import { recoveredBlogPosts } from './recoveredBlogPosts';\n\nexport interface BlogSource {",
  'Recovered article import',
);
blogPosts = replaceOnce(
  blogPosts,
  "  'custom-deep-neckline-elbow-sleeve-saree-blouse-online-usa',\n] as const;",
  "  'custom-deep-neckline-elbow-sleeve-saree-blouse-online-usa',\n  'plus-size-indian-ethnic-wear-guide',\n  'manish-malhotra-bollywood-bridal-designer-profile',\n  'indian-wedding-terms-glossary-50-events-rituals-roles',\n] as const;",
  'Published recovered article allowlist',
);
blogPosts = replaceOnce(
  blogPosts,
  '\n];\n\nexport const getPostBySlug',
  '\n  ...recoveredBlogPosts,\n];\n\nexport const getPostBySlug',
  'Recovered article data spread',
);
write('src/data/blogPosts.ts', blogPosts);

let blogCategories = read('src/data/blogCategories.ts');
blogCategories = replaceOnce(
  blogCategories,
  "  'custom-deep-neckline-elbow-sleeve-saree-blouse-online-usa': 'how-to-care',\n};",
  "  'custom-deep-neckline-elbow-sleeve-saree-blouse-online-usa': 'how-to-care',\n  'plus-size-indian-ethnic-wear-guide': 'how-to-care',\n  'manish-malhotra-bollywood-bridal-designer-profile': 'designer-profiles',\n  'indian-wedding-terms-glossary-50-events-rituals-roles': 'cultural-context',\n};",
  'Recovered article category mapping',
);
write('src/data/blogCategories.ts', blogCategories);

// ─── Human-facing navigation links ─────────────────────────────────────────
let categoryConfig = read('src/config/categoryConfig.tsx');
categoryConfig = replaceOnce(
  categoryConfig,
  "      { label: 'By Style', links: subcatLinks('suits', SUITS.subcategories, 'style').filter(l => ['Anarkali', 'Sharara', 'Palazzo'].includes(l.name)) },",
  `      {
        label: 'By Style',
        links: [
          { name: 'Anarkali', href: '/collections/anarkali-suits' },
          { name: 'Sharara', href: '/collections/sharara-suits' },
          { name: 'Gharara', href: '/collections/gharara-suits' },
          { name: 'Palazzo', href: '/suits?sub=palazzo' },
        ],
      },`,
  'Suits mega-menu recovery links',
);
categoryConfig = replaceOnce(
  categoryConfig,
  "          { name: 'Silk Sarees', href: '/collections/silk-sarees' },",
  "          { name: 'Wedding Sarees', href: '/collections/wedding-sarees' },\n          { name: 'Designer Sarees', href: '/collections/designer-sarees' },\n          { name: 'Silk Sarees', href: '/collections/silk-sarees' },",
  'Saree mega-menu recovery links',
);
categoryConfig = replaceOnce(
  categoryConfig,
  "      { label: 'By Occasion', links: subcatLinks('lehengas', LEHENGAS.subcategories, 'occasion') },",
  "      { label: 'By Occasion', links: [{ name: 'Bridal Lehengas', href: '/collections/bridal-lehengas' }, ...subcatLinks('lehengas', LEHENGAS.subcategories, 'occasion').filter(link => link.name !== 'Bridal')] },",
  'Lehenga mega-menu recovery link',
);
write('src/config/categoryConfig.tsx', categoryConfig);

// ─── Validation wiring ──────────────────────────────────────────────────────
let seoRecoveryValidator = read('scripts/validate-seo-recovery.cjs');
seoRecoveryValidator = replaceOnce(
  seoRecoveryValidator,
  "if (!sitemapGenerator.includes('const EXPECTED_SITEMAP_URL_COUNT = 767;')) {",
  "if (!hook.includes('const HIDE_OLD_PRODUCTS = false;') || !prerender.includes('const HIDE_OLD_PRODUCTS = false;')) {\n  fail('Client and crawler collection visibility flags are not aligned at false.');\n}\n\nif (!sitemapGenerator.includes('const EXPECTED_SITEMAP_URL_COUNT = 767;')) {",
  'SEO recovery crawler parity guard',
);
write('scripts/validate-seo-recovery.cjs', seoRecoveryValidator);

const packagePath = 'package.json';
const packageJson = JSON.parse(read(packagePath));
packageJson.scripts['validate:seo-recovery'] = 'node scripts/validate-seo-recovery.cjs';
if (!packageJson.scripts.build.includes('npm run validate:seo-recovery')) {
  packageJson.scripts.build = packageJson.scripts.build.replace(
    'npm run validate:blog &&',
    'npm run validate:seo-recovery && npm run validate:blog &&',
  );
}
write(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log('[apply-seo-recovery] Applied routing, prerender, sitemap, article, internal-link and validation recovery patches.');
