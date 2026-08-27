#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const architecture = JSON.parse(read('src/config/seoArchitecture.json'));
const failures = [];
const APPROVED_HOME_TITLE = 'LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA';

const runtimeArchitectureSource = read('src/config/seoArchitecture.ts');
const runtimeArchitectureMatch = runtimeArchitectureSource.match(
  /\/\* seo-architecture-json:start \*\/\s*([\s\S]*?)\s*\/\* seo-architecture-json:end \*\//,
);
if (!runtimeArchitectureMatch) {
  failures.push('Runtime SEO architecture JSON block was not found.');
} else {
  try {
    const runtimeArchitecture = JSON.parse(runtimeArchitectureMatch[1]);
    if (JSON.stringify(runtimeArchitecture) !== JSON.stringify(architecture)) {
      failures.push('Runtime and prerender SEO architecture maps have drifted.');
    }
  } catch (error) {
    failures.push(`Runtime SEO architecture block is not strict JSON: ${error.message}`);
  }
}

const requireText = (source, needle, label) => {
  if (!source.includes(needle)) failures.push(`Missing ${label}: ${needle}`);
};

const forbidText = (source, needle, label) => {
  if (source.includes(needle)) failures.push(`Unexpected ${label}: ${needle}`);
};

const homepage = architecture.routes['/'];
if (homepage?.title !== APPROVED_HOME_TITLE && !homepage?.title?.endsWith('| LuxeMia')) {
  failures.push('Homepage title must use the approved LuxeMia title or retain the normalized brand suffix.');
}
if (!homepage?.h1?.startsWith('LuxeMia')) {
  failures.push('Homepage H1 must lead with the LuxeMia brand.');
}

const requiredSharedRoutes = [
  '/',
  '/lehengas',
  '/sarees',
  '/suits',
  '/menswear',
  '/jewelry',
  '/collections/bridal-lehengas',
  '/collections/party-wear-lehengas',
  '/collections/wedding-sarees',
  '/collections/designer-sarees',
  '/collections/sharara-suits',
  '/collections/gharara-suits',
  '/collections/anarkali-suits',
];

for (const route of requiredSharedRoutes) {
  const seo = architecture.routes[route];
  if (!seo?.title || !seo?.description || !seo?.h1) {
    failures.push(`Shared SEO route is incomplete: ${route}`);
  }
  const approvedHomeTitleException = route === '/' && seo?.title === APPROVED_HOME_TITLE;
  if (seo?.title?.length > 58 && !approvedHomeTitleException) {
    failures.push(`Shared SEO title exceeds the emitted 58-character limit: ${route}`);
  }
  if (seo?.description?.length > 155) {
    failures.push(`Shared SEO description exceeds the emitted 155-character limit: ${route}`);
  }
}

const navigationFiles = [
  'src/components/home/ShopByOccasion.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/MegaMenuNavItem.tsx',
  'src/components/collections/FilterSidebar.tsx',
];
for (const relativePath of navigationFiles) {
  forbidText(read(relativePath), '?sub=', `crawlable facet link in ${relativePath}`);
}

const categoryConfig = read('src/config/categoryConfig.tsx');
requireText(categoryConfig, 'getDedicatedSubcategoryPath(catSlug, subcategory.slug)', 'dedicated-only mega-menu route resolver');
requireText(categoryConfig, 'getDedicatedSubcategoryPath(config.slug, subcategory.slug)', 'dedicated filter landing resolver');

const filterSidebar = read('src/components/collections/FilterSidebar.tsx');
requireText(filterSidebar, 'sub.landingPath', 'clean collection link for stocked facets');
requireText(filterSidebar, 'onSelectSubcategory(sub.slug)', 'non-crawlable interactive fallback for unsupported facets');

const categoryListing = read('src/components/collections/CategoryListing.tsx');
requireText(categoryListing, 'noIndexFollow={hasListingQueryState}', 'hydrated noindex for filter query states');
requireText(categoryListing, 'activeSubcategory?.landingPath', 'clean hydrated facet canonical');

const middleware = read('middleware.ts');
requireText(middleware, 'getLegacyFacetRedirectPath(url)', 'legacy mapped facet redirect');
requireText(middleware, 'getCleanFacetCanonicalPath(url)', 'shared HTTP clean facet canonical');

const redirectFreeSources = [
  'src/pages/Index.tsx',
  'src/components/home/SustainabilityBanner.tsx',
  'src/components/seo/InternalLinkBlock.tsx',
  'src/components/seo/SEOFooterContent.tsx',
  'src/lib/schema.ts',
];
for (const relativePath of redirectFreeSources) {
  const source = read(relativePath);
  forbidText(source, '"/brand-story"', `redirecting brand-story link in ${relativePath}`);
  forbidText(source, "'/brand-story'", `redirecting brand-story link in ${relativePath}`);
}
forbidText(read('src/components/seo/InternalLinkBlock.tsx'), '"/nri/usa"', 'redirecting NRI USA link');

const indexHtml = read('index.html');
forbidText(indexHtml, 'SearchAction', 'broken WebSite SearchAction');
forbidText(indexHtml, 'urlTemplate', 'search URL template without an indexable search route');
const escapedHomepageTitle = homepage.title.replace(/&/g, '&amp;');
const rawHomepageTitle = homepage.title;
if (
  !indexHtml.includes(`<title>${escapedHomepageTitle}</title>`)
  && !indexHtml.includes(`<title>${rawHomepageTitle}</title>`)
) {
  failures.push(`Missing shared approved homepage title in index.html: ${rawHomepageTitle}`);
}
const brandedLogoCount = (indexHtml.match(/"logo": "https:\/\/luxemia\.shop\/og-image\.jpg"/g) || []).length;
if (brandedLogoCount !== 2) {
  failures.push(`Expected Organization and OnlineStore to use the existing branded og-image.jpg asset; found ${brandedLogoCount} logo references.`);
}

const schema = read('src/lib/schema.ts');
requireText(schema, "BRAND_LOGO_URL = `${SITE_URL}/og-image.jpg`", 'shared existing brand logo URL');
forbidText(schema, "logo: `${SITE_URL}/favicon.ico`", 'Lovable favicon as Organization logo');
requireText(schema, 'generateUsProductShippingDetails(input.shipsWithinDays)', 'source-backed offer handling time');
requireText(schema, "unitCode: 'DAY'", 'schema handling-time unit');
forbidText(schema, 'transitTime:', 'invented carrier transit time');

const prerender = read('scripts/prerender.js');
requireText(prerender, "src/config/seoArchitecture.json", 'shared prerender SEO architecture');
requireText(prerender, 'normalizeInternalNavigationHtml(route.content)', 'prerender internal-link normalization');
requireText(prerender, 'would disappear after hydration', 'commercial collection hydration-stability guard');
requireText(prerender, 'generateUsProductShippingDetails(productAttributes.shipsWithinDays)', 'source-backed prerender handling time');
forbidText(prerender, 'transitTime:', 'invented prerender carrier transit time');

const schemaBundle = esbuild.buildSync({
  entryPoints: [path.join(root, 'src/lib/schema.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  write: false,
  logLevel: 'silent',
}).outputFiles[0].text;
const schemaModule = { exports: {} };
new Function('module', 'exports', 'require', schemaBundle)(schemaModule, schemaModule.exports, require);
const { generateUsProductShippingDetails } = schemaModule.exports;

const unspecifiedShipping = generateUsProductShippingDetails();
if (unspecifiedShipping.some((detail) => detail.deliveryTime)) {
  failures.push('Shipping schema must omit deliveryTime when custom.ships_within is absent.');
}

const sourceBackedShipping = generateUsProductShippingDetails(4);
for (const detail of sourceBackedShipping) {
  const handlingTime = detail.deliveryTime?.handlingTime;
  if (handlingTime?.maxValue !== 4 || handlingTime?.unitCode !== 'DAY') {
    failures.push('Shipping schema did not preserve the source-backed four-day handling window.');
  }
  if (detail.deliveryTime?.transitTime) {
    failures.push('Shipping schema invented a carrier transit time.');
  }
}

if (failures.length > 0) {
  console.error('SEO architecture validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `SEO architecture validation passed: ${requiredSharedRoutes.length} indexable routes share titles/H1s, navigation avoids crawlable noindex facets and redirects, brand schema uses the existing LuxeMia asset, SearchAction is absent, and handlingTime remains source-backed.`,
);
