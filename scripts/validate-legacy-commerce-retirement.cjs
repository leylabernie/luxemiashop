#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const failures = [];
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const buildCommand = packageJson.scripts?.build || '';
const testCommand = packageJson.scripts?.test || '';

// Keep every repository unit/regression test in the default release suite.
// This is intentionally derived from tests/ so a newly added test cannot sit
// green in isolation while being silently omitted from `npm run build`.
const releaseTests = fs.readdirSync(path.join(ROOT, 'tests'))
  .filter((name) => /\.test\.(?:cjs|mjs|js)$/.test(name))
  .sort();
for (const test of releaseTests) {
  if (!testCommand.includes(`tests/${test}`)) failures.push(`npm test omits tests/${test}`);
}

// The order is material: source/catalog checks run before compilation,
// Shopify-backed prerendering runs before built-output checks, and feeds plus
// discovery files are generated only from the validated release artifact.
const requiredReleaseStages = [
  'npm run lint',
  'npm run typecheck',
  'npm test',
  'npm run validate:shopify-catalog',
  'npm run validate:product-retirement-lifecycle',
  'npm run validate:legacy-commerce-retirement',
  'vite build',
  'node scripts/prerender.js',
  'npm run validate:product-prerender-integrity',
  'node scripts/generate-static-feed.cjs',
  'node scripts/validate-commerce-parity.cjs',
  'node scripts/generate-sitemap.cjs',
  'node scripts/submit-indexnow.cjs',
];
let previousStageIndex = -1;
for (const stage of requiredReleaseStages) {
  const stageIndex = buildCommand.indexOf(stage);
  if (stageIndex < 0) {
    failures.push(`production build omits required release stage: ${stage}`);
  } else if (stageIndex <= previousStageIndex) {
    failures.push(`production build stage is out of order: ${stage}`);
  } else {
    previousStageIndex = stageIndex;
  }
}
if (/(?:^|\s)--write(?:\s|$)/.test(buildCommand) || buildCommand.includes('--write-source-manifest')) {
  failures.push('production build contains an explicit tracked-source write mode');
}

// Direct Node steps are frozen to reviewed validators and dist-only
// generators/postprocessors. Adding another executable to the production
// chain requires an explicit review here instead of silently gaining write
// authority during deployment.
const approvedDirectBuildScripts = new Set([
  'scripts/apply-storefront-performance-fix.cjs',
  'scripts/finalize-built-approved-seo.cjs',
  'scripts/finalize-commercial-internal-links.cjs',
  'scripts/finalize-competitor-merchandising.cjs',
  'scripts/finalize-empty-collection-redirects.cjs',
  'scripts/generate-openai-search-feed.cjs',
  'scripts/generate-sitemap.cjs',
  'scripts/generate-static-feed.cjs',
  'scripts/postprocess-built-trust.cjs',
  'scripts/prerender.js',
  'scripts/submit-indexnow.cjs',
  'scripts/validate-analytics-consent.cjs',
  'scripts/validate-authority-inbound-links.cjs',
  'scripts/validate-blog-content.cjs',
  'scripts/validate-built-trust.cjs',
  'scripts/validate-collection-page-standard.cjs',
  'scripts/validate-commerce-parity.cjs',
  'scripts/validate-commercial-catalog-quality.cjs',
  'scripts/validate-merchant-feed.cjs',
  'scripts/validate-navratri-traffic.cjs',
  'scripts/validate-openai-search-feed.cjs',
  'scripts/validate-semantic-completion.cjs',
  'scripts/validate-storefront-performance.cjs',
  'scripts/verify-prerender-coverage.cjs',
]);
for (const step of buildCommand.split(/\s*&&\s*/)) {
  const directScript = step.trim().match(/^node\s+(scripts\/\S+)/)?.[1];
  if (directScript && !approvedDirectBuildScripts.has(directScript)) {
    failures.push(`production build invokes an unreviewed direct Node step: ${directScript}`);
  }
}

const forbiddenBuildMutators = [
  'apply-gsc-runtime-remediation.cjs',
  'apply-international-shipping-remediation.cjs',
  'apply-legacy-shipping-copy-cleanup.cjs',
  'apply-route-based-shipping-growth.cjs',
  'apply-route-shipping-seo-fix.cjs',
  'apply-route-shipping-final-cleanup.cjs',
  'normalize-trust-inputs.cjs',
  'apply-trust-source-of-truth.cjs',
  'finalize-approved-seo.cjs',
  'finalize-prerender-routes.cjs',
  'finalize-owner-retired-products.cjs',
  'apply-approved-sherwani-sitemap-additions.cjs',
  'apply-commercial-product-ranking.cjs',
  'remove-eager-hero-preload.cjs',
  'apply-commercial-catalog-recovery.cjs',
  'apply-commercial-catalog-recovery-hotfix.cjs',
  'apply-shipping-page-remediation.cjs',
  'finalize-supplier-image-quarantine.cjs',
  'normalize-legacy-catalog-copy.cjs',
];
for (const mutator of forbiddenBuildMutators) {
  if (buildCommand.includes(mutator)) failures.push(`production build invokes source mutator ${mutator}`);
}
if (packageJson.scripts?.['validate:route-manifests'] !== 'node scripts/generate-routes.cjs --check && node scripts/generate-gone-routes.cjs --check') {
  failures.push('route manifest generators must run in explicit --check mode during releases');
}
const storefrontPerformanceInvocations = [...buildCommand.matchAll(/node scripts\/apply-storefront-performance-fix\.cjs(?:\s+[^&]+)?/g)]
  .map((match) => match[0].trim());
if (
  storefrontPerformanceInvocations.length !== 1
  || storefrontPerformanceInvocations[0] !== 'node scripts/apply-storefront-performance-fix.cjs --built-only'
) {
  failures.push('production build may invoke apply-storefront-performance-fix.cjs exactly once and only with --built-only');
}
const storefrontPerformanceSource = fs.readFileSync(
  path.join(ROOT, 'scripts/apply-storefront-performance-fix.cjs'),
  'utf8',
);
if (
  !storefrontPerformanceSource.includes('if (!builtOnly)')
  || !storefrontPerformanceSource.includes('Refusing to run without --built-only')
) {
  failures.push('storefront performance postprocessor must refuse every invocation without --built-only');
}
const prerenderInvocations = [...buildCommand.matchAll(/node scripts\/prerender\.js(?:\s+[^&]+)?/g)]
  .map((match) => match[0].trim());
if (prerenderInvocations.length !== 1 || prerenderInvocations[0] !== 'node scripts/prerender.js') {
  failures.push('production build must invoke prerender.js exactly once without --write-source-manifest');
}

const removedExecutablePaths = [
  'build_boutique_csv.py',
  'build_csv.py',
  'docs/customizable-product-mapping.md',
  'scripts/analyze-kundan-images.mjs',
  'scripts/analyze-sherwani-images.mjs',
  'scripts/apply-approved-sherwani-sitemap-additions.cjs',
  'scripts/apply-commercial-product-ranking.cjs',
  'scripts/apply-commercial-catalog-recovery.cjs',
  'scripts/apply-commercial-catalog-recovery-hotfix.cjs',
  'scripts/apply-gsc-runtime-remediation.cjs',
  'scripts/apply-international-shipping-remediation.cjs',
  'scripts/apply-legacy-shipping-copy-cleanup.cjs',
  'scripts/apply-route-based-shipping-growth.cjs',
  'scripts/apply-route-shipping-final-cleanup.cjs',
  'scripts/apply-route-shipping-seo-fix.cjs',
  'scripts/apply-shipping-page-remediation.cjs',
  'scripts/apply-trust-source-of-truth.cjs',
  'scripts/build-shopify-csv-kundan.py',
  'scripts/build-shopify-csv-v2.py',
  'scripts/build-shopify-csv-v3.py',
  'scripts/build-shopify-csv-wedding-sarees.py',
  'scripts/build-shopify-csv.py',
  'scripts/bulk-write-shopify-seo.mjs',
  'scripts/fix-product-quality.mjs',
  'scripts/finalize-approved-seo.cjs',
  'scripts/finalize-owner-retired-products.cjs',
  'scripts/finalize-prerender-routes.cjs',
  'scripts/finalize-supplier-image-quarantine.cjs',
  'scripts/generate-sherwani-descriptions-v2.mjs',
  'scripts/generate-sherwani-descriptions.mjs',
  'scripts/generate-wedding-saree-descriptions.mjs',
  'scripts/normalize-legacy-catalog-copy.cjs',
  'scripts/normalize-trust-inputs.cjs',
  'scripts/remove-eager-hero-preload.cjs',
  'scripts/retry-wedding-saree-descriptions.mjs',
  'scripts/retry_failed.mjs',
  'scripts/template-fallback-wedding-sarees.py',
  'merchant-feed-color.cjs',
  'merchant-feed-size.cjs',
  'public/merchant-feed.xml',
  'public/sitemap.xml',
  'src/components/cart/EmailCaptureModal.tsx',
  'src/data/jewelryProducts.ts',
  'src/data/menswearProducts.ts',
  'src/data/sareeProducts.ts',
  'src/data/suitProducts.ts',
  'src/hooks/useInfiniteProducts.ts',
  'src/hooks/usePaginatedProducts.ts',
  'src/hooks/useScrapedProducts.ts',
  'src/lib/productDescriptionEnrichment.examples.ts',
  'src/lib/scrapedProducts.ts',
  'supabase/functions/sync-products/index.ts',
];

for (const relative of removedExecutablePaths) {
  if (fs.existsSync(path.join(ROOT, relative))) {
    failures.push(`${relative} must remain removed; it can recreate or publish non-Shopify catalog facts`);
  }
}

const retiredEdgeFunctions = [
  'abandoned-cart-reminder',
  'sync-to-shopify',
  'update-shopify-products',
  'generate-sitemap',
  'regenerate-sitemap',
  'cleanup-shopify-duplicates',
  'validate-images',
  'merchant-feed',
  'send-tracking-notification',
];

const prohibitedEdgeBehavior = [
  /createClient\s*\(/,
  /Deno\.env/,
  /fetch\s*\(/,
  /\.from\s*\(/,
  /\.(?:insert|upsert|update|delete)\s*\(/,
  /SHOPIFY_(?:ACCESS|ADMIN|STOREFRONT)/,
  /products\.json/,
  /productCreate/,
  /scraped_products/,
  /localProductsData/,
  /generateProductHandle/,
  /availableForSale/,
  /price_(?:usd|inr)/,
  /inventory_management/,
];

for (const endpoint of retiredEdgeFunctions) {
  const relative = `supabase/functions/${endpoint}/index.ts`;
  const absolute = path.join(ROOT, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`${relative} is missing its fail-closed retirement response`);
    continue;
  }

  const source = fs.readFileSync(absolute, 'utf8');
  for (const required of [
    "LEGACY_COMMERCE_ENDPOINT_RETIRED",
    `const ENDPOINT = '${endpoint}'`,
    'status: 410',
    "'Cache-Control': 'no-store'",
  ]) {
    if (!source.includes(required)) failures.push(`${relative} is missing ${required}`);
  }
  for (const pattern of prohibitedEdgeBehavior) {
    if (pattern.test(source)) failures.push(`${relative} contains executable legacy behavior matching ${pattern}`);
  }
}
const configPath = path.join(ROOT, 'supabase/config.toml');
const config = fs.readFileSync(configPath, 'utf8');
const vercelConfig = fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8');
const getOrderStanza = config.match(/\[functions\.get-order\]([\s\S]*?)(?=\n\[|$)/);
if (!getOrderStanza || !/verify_jwt\s*=\s*true/.test(getOrderStanza[1])) {
  failures.push('supabase/config.toml must require JWT for get-order');
}
if (vercelConfig.includes('jcyolouvxfxovzjyyrxu')) {
  failures.push('vercel.json still references the obsolete Supabase project jcyolouvxfxovzjyyrxu');
}
if (vercelConfig.includes("'unsafe-eval'")) {
  failures.push("vercel.json must not permit 'unsafe-eval' in the storefront CSP");
}
if (/\[functions\.sync-products\]/.test(config)) {
  failures.push('supabase/config.toml must not register the removed sync-products function');
}

const compatibilityPolicyValidator = fs.readFileSync(
  path.join(ROOT, 'scripts/validate-current-policy-copy.cjs'),
  'utf8',
);
if (!compatibilityPolicyValidator.includes("require('./validate-trust-source-of-truth.cjs')")) {
  failures.push('legacy policy validator must delegate to the current trust/policy source of truth');
}

const liveFeedValidator = fs.readFileSync(
  path.join(ROOT, 'scripts/validate-live-merchant-feed.cjs'),
  'utf8',
);
if (!liveFeedValidator.includes("path.join(PROJECT_ROOT, 'dist', 'merchant-feed.xml')")) {
  failures.push('live merchant-feed parity must compare against the fresh dist artifact');
}
if (liveFeedValidator.includes("path.join(PROJECT_ROOT, 'public', 'merchant-feed.xml')")) {
  failures.push('live merchant-feed parity still depends on the retired public feed snapshot');
}
if (packageJson.scripts?.['validate:merchant-feed:live'] !== 'node scripts/validate-live-merchant-feed.cjs') {
  failures.push('package.json is missing the explicit post-deploy merchant-feed parity command');
}
for (const endpoint of retiredEdgeFunctions) {
  const stanza = config.match(new RegExp(`\\[functions\\.${endpoint}\\]([\\s\\S]*?)(?=\\n\\[|$)`));
  if (!stanza) {
    failures.push(`supabase/config.toml is missing the retired ${endpoint} stanza`);
  } else if (!/verify_jwt\s*=\s*true/.test(stanza[1])) {
    failures.push(`supabase/config.toml must require JWT for retired function ${endpoint}`);
  }
}

const adminTools = fs.readFileSync(path.join(ROOT, 'src/components/account/AdminTools.tsx'), 'utf8');
for (const pattern of [
  /supabase\.functions\.invoke/,
  /handle(?:RegenerateSitemap|SyncToShopify|ScrapeProducts|CleanupDuplicates|ValidateImages)/,
  /sync-products|sync-to-shopify|regenerate-sitemap|cleanup-shopify-duplicates|validate-images|merchant-feed/,
]) {
  if (pattern.test(adminTools)) {
    failures.push(`src/components/account/AdminTools.tsx still exposes a retired catalog operation matching ${pattern}`);
  }
}

const sourceRoots = ['src', 'scripts'];
function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return /\.(?:ts|tsx|js|cjs|mjs)$/.test(entry.name) ? [absolute] : [];
  });
}

for (const absolute of sourceRoots.flatMap((relative) => walk(path.join(ROOT, relative)))) {
  const relative = path.relative(ROOT, absolute).replace(/\\/g, '/');
  if (relative === 'scripts/validate-legacy-commerce-retirement.cjs') continue;
  const source = fs.readFileSync(absolute, 'utf8');
  if (/functions\.invoke\s*\(\s*['"](?:sync-products|sync-to-shopify|update-shopify-products|generate-sitemap|regenerate-sitemap|cleanup-shopify-duplicates|validate-images|merchant-feed|abandoned-cart-reminder|send-tracking-notification)['"]/.test(source)) {
    failures.push(`${relative} invokes a retired legacy commerce edge function`);
  }
}

const getOrderSource = fs.readFileSync(path.join(ROOT, 'supabase/functions/get-order/index.ts'), 'utf8');
for (const required of [
  'req.method !== "POST"',
  'authResult.user.email',
  'authResult.user.email_confirmed_at',
  'authResult.user.email.trim().toLowerCase() !== normalizedEmail',
]) {
  if (!getOrderSource.includes(required)) failures.push(`supabase/functions/get-order/index.ts is missing authenticated order-ownership guard: ${required}`);
}
for (const pattern of [/send-tracking-notification/, /EdgeRuntime\.waitUntil/]) {
  if (pattern.test(getOrderSource)) failures.push(`supabase/functions/get-order/index.ts retains unsolicited tracking-notification behavior matching ${pattern}`);
}

const publicOrderConfirmation = fs.readFileSync(path.join(ROOT, 'src/pages/OrderConfirmation.tsx'), 'utf8');
for (const pattern of [
  /useSearchParams/,
  /searchParams\.get/,
  /surveyoptin/,
  /estimated_delivery_date/,
  /trackPurchase/,
]) {
  if (pattern.test(publicOrderConfirmation)) failures.push(`src/pages/OrderConfirmation.tsx trusts or transmits public URL order data matching ${pattern}`);
}

const footerSource = fs.readFileSync(path.join(ROOT, 'src/components/layout/Footer.tsx'), 'utf8');
for (const pattern of [/merchantwidget/i, /www\.gstatic\.com\/shopping\/merchant/i]) {
  if (pattern.test(footerSource)) failures.push(`src/components/layout/Footer.tsx loads an unverified Google Customer Reviews badge matching ${pattern}`);
}

const consultationMigration = fs.readFileSync(
  path.join(ROOT, 'supabase/migrations/20260902221500_secure_consultation_lead_access.sql'),
  'utf8',
);
for (const required of [
  'REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER',
  'FROM anon, authenticated',
  'GRANT ALL ON public.consultation_leads TO service_role',
]) {
  if (!consultationMigration.includes(required)) failures.push(`consultation lead migration is missing direct-table protection: ${required}`);
}
for (const pattern of [/CREATE POLICY\s+"Allow public consultation insert"/i, /GRANT INSERT[^;]*TO\s+anon/i]) {
  if (pattern.test(consultationMigration)) failures.push(`consultation lead migration restores a direct public write path matching ${pattern}`);
}

const consultationFunction = fs.readFileSync(path.join(ROOT, 'supabase/functions/submit-consultation/index.ts'), 'utf8');
for (const required of ['MAX_BODY_BYTES', 'validateConsultationData(body)', "console.log('Consultation lead created')"]) {
  if (!consultationFunction.includes(required)) failures.push(`submit-consultation is missing bounded, privacy-safe handling: ${required}`);
}
for (const pattern of [/leadId:\s*data\.id/, /Consultation lead created:\s*\$\{/]) {
  if (pattern.test(consultationFunction)) failures.push(`submit-consultation exposes or logs lead data matching ${pattern}`);
}

const imageProxy = fs.readFileSync(path.join(ROOT, 'supabase/functions/image-proxy/index.ts'), 'utf8');
for (const required of [
  "parsedUrl.protocol !== 'https:'",
  "redirect: 'manual'",
  'MAX_IMAGE_BYTES',
  'ALLOWED_IMAGE_TYPES',
]) {
  if (!imageProxy.includes(required)) failures.push(`image-proxy is missing SSRF/content protection: ${required}`);
}

for (const relative of ['scripts/generate-sitemap.cjs', 'src/lib/dynamicSitemap.ts']) {
  const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  if (!source.includes('fetchAllProducts')) {
    failures.push(`${relative} must obtain product URLs from Shopify`);
  }
  for (const pattern of [/scraped_products/, /localProductsData/, /generateProductHandle\s*\(/]) {
    if (pattern.test(source)) failures.push(`${relative} contains a non-Shopify product source matching ${pattern}`);
  }
}
const deploySitemap = fs.readFileSync(path.join(ROOT, 'scripts/generate-sitemap.cjs'), 'utf8');
if (/public(?:Dir|Path)|['"]\.\.\/public['"]/.test(deploySitemap)) {
  failures.push('scripts/generate-sitemap.cjs must write only fresh dist sitemap artifacts, never source snapshots in public/');
}
for (const required of [
  'SHOPIFY_STOREFRONT_URL',
  'APPROVED_INVENTORY_PATH',
  'missingApprovedProducts',
  'Approved sitemap product(s) are absent or no longer orderable/eligible in the current Shopify response',
]) {
  if (!deploySitemap.includes(required)) failures.push(`scripts/generate-sitemap.cjs is missing fail-closed Shopify/approval guard: ${required}`);
}

const executableGenerators = walk(ROOT).filter((absolute) => {
  const relative = path.relative(ROOT, absolute).replace(/\\/g, '/');
  if (relative.startsWith('node_modules/') || relative.startsWith('dist/')) return false;
  return /(?:build-shopify-csv|generate-(?:sherwani|wedding-saree)-descriptions|analyze-(?:kundan|sherwani)-images|fix-product-quality)/i.test(relative);
});
for (const absolute of executableGenerators) {
  failures.push(`${path.relative(ROOT, absolute)} reintroduces a retired inference/formula catalog generator`);
}

const staticFeed = fs.readFileSync(path.join(ROOT, 'scripts/generate-static-feed.cjs'), 'utf8');
const vercelFeed = fs.readFileSync(path.join(ROOT, 'api/merchant-feed.ts'), 'utf8');
const openAiFeed = fs.readFileSync(path.join(ROOT, 'scripts/generate-openai-search-feed.cjs'), 'utf8');
const submitEmail = fs.readFileSync(path.join(ROOT, 'supabase/functions/submit-email/index.ts'), 'utf8');
const growthReport = fs.readFileSync(path.join(ROOT, 'LUXEMIA_GROWTH_REPORT.md'), 'utf8');
const recoveryReport = fs.readFileSync(path.join(ROOT, 'SEO_RECOVERY_REPORT.md'), 'utf8');
for (const [relative, source] of [
  ['scripts/generate-static-feed.cjs', staticFeed],
  ['api/merchant-feed.ts', vercelFeed],
]) {
  for (const required of [
    'product.availableForSale !== true',
    'variant.availableForSale !== true',
    'SHOPIFY_STOREFRONT_TOKEN',
    'buildVerifiedProductCopy',
  ]) {
    if (!source.includes(required)) failures.push(`${relative} is missing strict Shopify evidence gate: ${required}`);
  }
  for (const pattern of [
    /og-image\.jpg/,
    /identifier_exists/,
    /<g:mpn>/,
    /getGender\s*\(/,
    /getWorkFromTags\s*\(/,
    /getMerchantGoogleProductCategory\s*\(/,
    /availableForSale\s*\?\s*['"]in_stock['"]\s*:\s*['"]out_of_stock['"]/,
    /currencyCode\s*\|\|\s*['"]USD['"]/,
    /condition[^\n]{0,80}\|\|\s*['"]new['"]/i,
    /<g:age_group>adult<\/g:age_group>/,
    /<g:size_type>regular<\/g:size_type>/,
    /<g:size_system>US<\/g:size_system>/,
  ]) {
    if (pattern.test(source)) failures.push(`${relative} contains forbidden feed inference/default matching ${pattern}`);
  }
}

for (const pattern of [
  /condition[^\n]{0,80}\|\|\s*['"]new['"]/i,
  /is_digital\s*:\s*false/,
  /accepts_returns\s*:/,
  /accepts_exchanges\s*:/,
  /availability:\s*['"]out_of_stock['"]/,
]) {
  if (pattern.test(openAiFeed)) failures.push(`scripts/generate-openai-search-feed.cjs contains unsupported assertion/default matching ${pattern}`);
}
if (!submitEmail.includes('type !== "newsletter"')) {
  failures.push('supabase/functions/submit-email/index.ts must reject every non-newsletter submission type');
}
for (const pattern of [
  /type\s*===\s*['"]cart['"]/,
  /['"]cart['"]\s*\]\s*\.includes\(type\)/,
  /abandoned_carts/,
  /cartItems|cartTotal|normalizeCartItems|MAX_CART_ITEMS/,
]) {
  if (pattern.test(submitEmail)) failures.push(`supabase/functions/submit-email/index.ts retains dormant abandoned-cart collection matching ${pattern}`);
}
for (const [relative, source] of [
  ['LUXEMIA_GROWTH_REPORT.md', growthReport],
  ['SEO_RECOVERY_REPORT.md', recoveryReport],
]) {
  for (const pattern of [
    /\*\s+\*\*Action\*\*:.*activate.*Fit Guarantee/i,
    /^### Month.*Free Stitching Tiers/im,
    /^### .*Severity.*Fit Guarantee/im,
    /DONE\s*&\s*DEPLOYED/i,
    /pushed files live/i,
    /Live on Main Branch/i,
    /Build Pipeline Check[^\n]*100% SUCCESS/i,
    /Recovery Initiated/i,
  ]) {
    if (pattern.test(source)) failures.push(`${relative} still instructs restoration of an unapproved commercial guarantee matching ${pattern}`);
  }
}

const { buildItem: buildStaticFeedItem } = require('./generate-static-feed.cjs');
const evidenceProduct = {
  id: 'gid://shopify/Product/123',
  title: 'Evidence-backed listing | Handcrafted Indian Bridal Luxury',
  description: 'Exact Shopify description.',
  handle: 'evidence-backed-listing',
  vendor: 'LuxeMia',
  productType: 'Listing type',
  tags: [],
  availableForSale: true,
  options: [{ name: 'Color', values: ['Blue'] }],
  images: { edges: [{ node: { url: 'https://cdn.shopify.com/s/files/1/evidence.png' } }] },
  variants: { edges: [] },
};
const evidenceVariant = {
  id: 'gid://shopify/ProductVariant/456',
  availableForSale: true,
  price: { amount: '10.00', currencyCode: 'USD' },
  barcode: null,
  selectedOptions: [{ name: 'Color', value: 'Blue' }],
  image: null,
};
const evidenceItem = buildStaticFeedItem(evidenceProduct, evidenceVariant);
if (!evidenceItem?.includes('<g:availability>in_stock</g:availability>')) {
  failures.push('scripts/generate-static-feed.cjs does not emit an explicitly available evidence fixture');
}
if (!evidenceItem?.includes('<g:title>Evidence-backed listing</g:title>')) {
  failures.push('scripts/generate-static-feed.cjs does not sanitize a stale product-title suffix');
}
if (!evidenceItem?.includes('<g:link>https://luxemia.shop/product/evidence-backed-listing?variant=456</g:link>')) {
  failures.push('scripts/generate-static-feed.cjs does not emit the exact variant landing URL');
}
if (evidenceItem?.includes('Exact Shopify description.')) {
  failures.push('scripts/generate-static-feed.cjs publishes unreviewed raw Shopify description prose');
}
for (const [label, product, variant] of [
  ['unavailable product', { ...evidenceProduct, availableForSale: false }, evidenceVariant],
  ['unavailable variant', evidenceProduct, { ...evidenceVariant, availableForSale: false }],
  ['missing vendor', { ...evidenceProduct, vendor: '' }, evidenceVariant],
  ['unverified vendor', { ...evidenceProduct, vendor: 'Evidence Supplier' }, evidenceVariant],
  ['missing image', { ...evidenceProduct, images: { edges: [] } }, evidenceVariant],
  ['invalid price', evidenceProduct, { ...evidenceVariant, price: { amount: '0', currencyCode: 'USD' } }],
]) {
  if (buildStaticFeedItem(product, variant) !== null) {
    failures.push(`scripts/generate-static-feed.cjs publishes a ${label} fixture`);
  }
}

const { convertMerchantXml } = require('./generate-openai-search-feed.cjs');
const openAiFixtureXml = `<rss><channel><item>
  <g:id>456</g:id><g:item_group_id>123</g:item_group_id>
  <g:title>Evidence-backed listing</g:title>
  <g:description>Evidence-safe description.</g:description>
  <g:link>https://luxemia.shop/product/evidence-backed-listing?variant=456</g:link>
  <g:image_link>https://cdn.shopify.com/s/files/1/evidence.jpg</g:image_link>
  <g:availability>in_stock</g:availability><g:price>10.00 USD</g:price>
  <g:brand>Evidence Brand</g:brand>
</item></channel></rss>`;
const [openAiFixture] = convertMerchantXml(openAiFixtureXml);
for (const unsupportedAssertion of ['condition', 'is_digital', 'accepts_returns', 'accepts_exchanges', 'return_policy']) {
  if (unsupportedAssertion in openAiFixture) {
    failures.push(`scripts/generate-openai-search-feed.cjs defaults unsupported ${unsupportedAssertion}`);
  }
}
if (openAiFixture.availability !== 'in_stock' || openAiFixture.price !== '10.00 USD') {
  failures.push('scripts/generate-openai-search-feed.cjs does not preserve evidenced availability and price');
}

if (failures.length > 0) {
  console.error('[legacy-commerce-retirement] Validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[legacy-commerce-retirement] OK — legacy generators and client entry points are removed; retained edge paths fail closed; deployment sitemap product URLs require Shopify plus the approved inventory.');
