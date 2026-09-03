#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const failures = [];

function read(relative) {
  const absolute = path.join(ROOT, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`${relative} is missing`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function requireText(relative, snippets) {
  const source = read(relative);
  for (const snippet of snippets) {
    if (!source.includes(snippet)) failures.push(`${relative} missing required evidence: ${snippet}`);
  }
}

function requireAbsent(relative) {
  if (fs.existsSync(path.join(ROOT, relative))) {
    failures.push(`${relative} must remain retired because it exposed an unverified or simulated customer flow`);
  }
}

function forbid(relative, patterns) {
  const source = read(relative);
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match || match.index === undefined) continue;
    const line = source.slice(0, match.index).split('\n').length;
    failures.push(`${relative}:${line} contains blocked visible claim matching ${pattern}`);
  }
}

requireText('src/pages/Artisans.tsx', [
  'does not make a store-wide claim',
  'does not by itself verify where an item was made',
  'treat it as not supplied',
]);
forbid('src/pages/Artisans.tsx', [
  /textile regions we source from/i,
  /sourced from India['’]s best/i,
  /authentic designs (?:made|created) by/i,
]);

requireText('src/pages/Sustainability.tsx', [
  'does not currently publish a store-wide organic, fair-trade, carbon-neutral',
  'No universal recyclable, plastic-free, compostable or minimal-packaging claim is made.',
  'does not describe shipping as carbon neutral or emissions free',
]);
forbid('src/pages/Sustainability.tsx', [
  /responsible sourcing/i,
  /recyclable materials where possible/i,
  /choosing quality/i,
]);

requireText('src/hooks/useLookbookProducts.ts', [
  'Catalog tag matches',
  'does not add an occasion, fabric, comfort or included-piece claim',
  'not presented as a coordinated pair unless the exact listing says so',
]);
forbid('src/hooks/useLookbookProducts.ts', [
  /Eid Collection/i,
  /luxurious georgette/i,
  /Perfectly paired/i,
  /Season['’]s Best/i,
]);

requireText('src/pages/Press.tsx', [
  'Asset availability and response timing vary',
  'materials are not promised until confirmed in writing',
]);
forbid('src/pages/Press.tsx', [
  /LuxeMia will confirm/i,
]);

forbid('src/pages/Index.tsx', [
  /Curated for every celebration/i,
  /handpicked for/i,
  /(?:under|less than) 2 minutes/i,
]);
requireText('src/pages/Index.tsx', [
  'Photographs do not guarantee an exact color match',
  'Use two filters—Shopify product type and USD minimum price',
]);

forbid('src/components/seo/SEOFooterContent.tsx', [
  /perfect for every/i,
  /quality silk/i,
  /extensive collection/i,
  /dream (?:outfit|look)/i,
]);

requireText('src/components/product/SizeGuideModal.tsx', [
  'does not apply one universal chart',
  'selected listing',
]);
forbid('src/components/product/SizeGuideModal.tsx', [
  /run true to size/i,
  /typically have elastic/i,
  /Most suits come semi-stitched/i,
]);

requireText('src/config/categoryConfig.tsx', [
  'tracked shipping to seven supported countries',
  'six other supported countries',
]);
forbid('src/config/categoryConfig.tsx', [
  /all (?:items|styles)[^\n]{0,80}in stock/i,
  /Sizes listed by chest and length measurement/i,
  /U\.S\.-delivery only/i,
  /Premium \$\d/i,
]);
forbid('src/config/featuredCategoryProducts.ts', [/^\s*price\s*:/m]);
for (const relative of ['src/config/seoArchitecture.ts', 'src/config/seoArchitecture.json']) {
  forbid(relative, [
    /Bridal & Wedding Lehengas Online (?:in the )?USA/i,
    /Indian Wedding Sarees Online (?:in the )?(?:USA|U\.S\.)/i,
    /Indian Wedding Menswear & Sherwanis Online in the USA/i,
    /(?:Bridal Lehengas|Party-Wear Lehengas|Wedding Sarees|Designer Sarees|Sharara Suits|Gharara Suits|Anarkali Suits)[^"\n]{0,40}USA/i,
  ]);
}

forbid('src/components/layout/Header.tsx', [/CurrencySelector/]);
requireText('src/components/ui/ProductCard.tsx', [
  'formatCurrencyAmount(',
  'product.node.availableForSale === true',
  'edge.node.availableForSale === true',
]);
forbid('src/components/ui/ProductCard.tsx', [/currency:\s*['"]USD['"]/, /_currency/]);

requireText('src/components/search/ProductSearch.tsx', [
  'currencyCode: node.priceRange.minVariantPrice.currencyCode',
  "category: node.productType?.trim() || 'Product'",
  'fabric: node.metadata?.fabric?.trim() || null',
  'formatCurrencyAmount(product.price, product.currencyCode)',
]);
forbid('src/components/search/ProductSearch.tsx', [
  /currency:\s*['"]USD['"]/,
  /let category = ['"]Suits['"]/,
  /let fabric = ['"]Silk['"]/,
]);

requireText('src/components/home/TrendingNow.tsx', [
  'product.node.priceRange.minVariantPrice.currencyCode',
  'product.node.compareAtPriceRange.minVariantPrice.currencyCode',
]);
forbid('src/components/home/TrendingNow.tsx', [/currency:\s*['"]USD['"]/]);

requireText('src/components/cart/CartDrawer.tsx', [
  "const isUsdCart = currencyCode === 'USD'",
  'Destination, shipping rate, and any checkout currency conversion are confirmed at checkout.',
  "formatCurrencyAmount(FREE_SHIPPING_THRESHOLD - subtotal, 'USD')",
]);
forbid('src/components/cart/CartDrawer.tsx', [/currency:\s*['"]USD['"]/, /_currency/]);

requireText('src/components/collections/ProductGrid.tsx', [
  'No current products were returned for this view.',
]);
forbid('src/components/collections/ProductGrid.tsx', [
  /placeholderProducts/,
  /₹\d/,
  /Bestseller/,
]);

requireText('src/components/home/ShopByCategory.tsx', [
  'hasExplicitReadyToShipEvidence(product.node)',
  'product.node.availableForSale === true',
  "label: 'Ready to Ship'",
]);
forbid('src/components/home/ShopByCategory.tsx', [
  /products that are in stock and can ship quickly/i,
  /return `\$\{/,
]);

requireText('src/lib/serviceAddOns.ts', [
  'normalizeServiceOptionLabel',
  'checkoutOptionLabel',
]);
forbid('src/lib/serviceAddOns.ts', [
  /\bprice:\s*\d/,
  /checkoutOptionValue/,
  /\(\+\$\d/,
]);
requireText('src/components/product/ProductInfo.tsx', [
  'serviceVariant.price.amount',
  'selectedServicePrices.reduce',
  'the combined total is confirmed at Shopify checkout',
]);
forbid('src/components/product/ProductInfo.tsx', [/service\.price/, /serviceAddOnTotal/]);

requireText('src/components/product/CompleteTheLook.tsx', [
  'formatCurrencyAmount(',
  'no compatibility or styling match is implied',
  'product.node.availableForSale === true',
]);
forbid('src/components/product/CompleteTheLook.tsx', [/currency\s*\|\|\s*['"]USD['"]/]);
forbid('src/pages/OrderConfirmation.tsx', [
  /orderCurrency\s*\|\|\s*cartCurrency\s*\|\|\s*['"]USD['"]/,
  /Tracking details will be emailed after your order dispatches/i,
  /Your Shopify confirmation email is the source/i,
  /Check the confirmation sent by Shopify/i,
]);
requireText('src/pages/OrderConfirmation.tsx', [
  'Do not read order identifiers, customer email, totals, delivery dates',
  'must not be rendered, sent to Google Customer Reviews, or recorded as a',
  'This public page cannot verify an order.',
]);
forbid('scripts/prerender.js', [
  /confirmation details will be sent to the email used at checkout/i,
]);
forbid('src/pages/FAQ.tsx', [
  /an order confirmation is sent to the email address provided/i,
]);
requireText('src/hooks/useAnalytics.ts', [
  'the public OrderConfirmation route does not call this',
  'must supply verified order facts',
]);
forbid('src/hooks/useAnalytics.ts', [
  /purchase event is sent only from OrderConfirmation/i,
]);

requireText('src/pages/SemanticCommercePage.tsx', [
  'This page does not claim that Google Customer Reviews enrollment, survey eligibility or a seller rating is currently active.',
  'The public LuxeMia return page has no signed Shopify order context.',
  'If a required field is unavailable or cannot be verified, the survey must not render.',
  'A badge-script request by itself is not evidence that enrollment, survey eligibility or a seller rating is active.',
]);
forbid('src/pages/SemanticCommercePage.tsx', [
  /LuxeMia participates in Google Customer Reviews/i,
  /On an eligible order-confirmation page, the Google opt-in can receive/i,
  /U\.S\.-Based Online Customer Support/i,
  /U\.S\.-based online retail team/i,
]);

requireText('src/pages/Privacy.tsx', [
  'A badge-script request is not a claim that program enrollment, survey eligibility or a seller rating is currently active.',
  'The public LuxeMia return page does not trust order identifiers, email addresses, totals, countries or delivery dates supplied in its URL',
  'If a required value is unavailable or cannot be verified, the survey must not render.',
]);
forbid('src/pages/Privacy.tsx', [
  /LuxeMia uses Google Customer Reviews rather than/i,
  /Google Customer Reviews badge and survey-opt-in processing described below/i,
]);

requireText('src/lib/schema.ts', ["currenciesAccepted: 'USD'"]);
requireText('index.html', ['"currenciesAccepted": "USD"']);
forbid('src/lib/schema.ts', [/AUD,\s*CAD,\s*GBP,\s*MUR,\s*NZD,\s*USD/i]);
forbid('index.html', [/AUD,\s*CAD,\s*GBP,\s*MUR,\s*NZD,\s*USD/i]);

forbid('src/components/layout/Footer.tsx', [/Safe Payments/i, /SSL Secure Checkout/i]);
forbid('src/components/home/NewArrivalsBanner.tsx', [
  /Stocked styles for plans that cannot wait/i,
  /Garba-ready color, movement, and mirror work/i,
]);
forbid('src/components/home/ShopByOccasion.tsx', [/perfect squad/i, /dance-ready/i]);
forbid('src/pages/StyleQuiz.tsx', [
  /perfect Indian ethnic wear look/i,
  /personalised outfit recommendations/i,
  /versatile and comfortable/i,
]);

for (const relative of [
  'index.html',
  'src/components/layout/Header.tsx',
  'src/components/home/ServiceHighlights.tsx',
  'src/components/home/SustainabilityBanner.tsx',
  'src/components/home/CustomerStories.tsx',
  'src/components/product/DeliveryEstimate.tsx',
  'src/pages/OrderConfirmation.tsx',
  'src/pages/ProductDetail.tsx',
  'src/pages/FAQ.tsx',
  'src/pages/Shipping.tsx',
  'src/pages/NavratriOutfits.tsx',
  'src/pages/DiwaliOutfits.tsx',
  'src/pages/EidOutfits.tsx',
  'src/pages/HaldiOutfits.tsx',
  'src/pages/MehendiOutfits.tsx',
  'src/pages/WeddingGuestOutfits.tsx',
  'src/pages/nri/USA.tsx',
  'src/pages/nri/NRIGeneral.tsx',
  'src/config/categoryConfig.tsx',
  'src/data/blogPosts.ts',
  'src/lib/productDescriptionEnrichment.ts',
  'src/lib/schema.ts',
]) {
  forbid(relative, [
    /tracking (?:is|details will be) (?:provided|emailed|sent)[^\n]{0,80}after (?:dispatch|your order dispatches)/i,
    /tracking[^.\n]{0,80}after dispatch/i,
  ]);
}

for (const relative of [
  'index.html',
  'scripts/prerender.js',
  'src/lib/productDescriptionEnrichment.ts',
  'src/data/blogPosts.ts',
  'src/config/commercialLandingPages.tsx',
  'src/config/categoryConfig.tsx',
  'src/pages/WeddingGuestOutfits.tsx',
  'src/pages/MehendiOutfits.tsx',
  'src/pages/DiwaliOutfits.tsx',
  'src/pages/EidOutfits.tsx',
  'src/pages/HaldiOutfits.tsx',
  'src/pages/SemanticCommercePage.tsx',
  'src/pages/ProductDetail.tsx',
  'src/pages/NavratriOutfits.tsx',
  'src/pages/nri/USA.tsx',
  'src/pages/nri/NRIGeneral.tsx',
  'src/components/home/CustomerStories.tsx',
  'src/components/home/ServiceHighlights.tsx',
  'src/components/home/SustainabilityBanner.tsx',
  'src/components/layout/Header.tsx',
  'src/pages/FAQ.tsx',
  'src/pages/Shipping.tsx',
  'src/components/product/DeliveryEstimate.tsx',
  'src/components/product/ProductInfo.tsx',
]) {
  forbid(relative, [
    /\btracking(?: details| number)?\s+(?:is|are)\s+(?:emailed|sent|provided)\b/i,
    /\btracking\s+(?:is\s+)?emailed\b/i,
    /\btracking details are sent by email\b/i,
    /\ba tracking number is emailed\b/i,
    /\btracking email\b/i,
  ]);
}

requireAbsent('src/config/rakshaBandhanCampaign.ts');
requireAbsent('src/components/cart/EmailCaptureModal.tsx');
requireText('docs/SEO_INDEXATION_RECOVERY_2026-08-23.md', [
  'Historical implementation record.',
  'it is not evidence that the current branch,',
  'current release gates and live HTTP checks',
]);
forbid('index.html', [
  /Pinterest Domain Verification\s*-\s*deployed/i,
  /Bing Webmaster Tools:\s*verified/i,
]);
for (const relative of [
  'src/pages/WeddingPartyOrders.tsx',
  'src/pages/CustomizableOutfits.tsx',
  'supabase/functions/submit-consultation/index.ts',
]) {
  forbid(relative, [
    /(?:contact|respond to) you shortly/i,
    /(?:reply|response) within \d+ (?:hours?|business days?)/i,
    /(?:we|LuxeMia) will (?:review|confirm)/i,
  ]);
}

for (const relative of [
  'src/components/layout/Footer.tsx',
  'src/pages/NavratriOutfits.tsx',
  'src/pages/Indowestern.tsx',
  'src/pages/NewArrivals.tsx',
  'src/pages/BlogCategory.tsx',
  'src/pages/AuthorBio.tsx',
  'src/pages/NotFound.tsx',
]) {
  forbid(relative, [
    /check back soon/i,
    /coming up soon/i,
    /(?:styles|articles) (?:are being|we['’]re) work(?:ed|ing)/i,
    /arrive regularly/i,
    /we['’]ve logged/i,
    /we will fix/i,
  ]);
}

for (const relative of ['src/pages/FAQ.tsx', 'src/pages/Press.tsx']) {
  forbid(relative, [/(?:our )?(?:support|customer care) team/i, /get in touch with our team/i]);
}
for (const relative of [
  'src/pages/Index.tsx',
  'src/pages/CustomizableOutfits.tsx',
  'src/pages/WeddingPartyOrders.tsx',
  'src/pages/FAQ.tsx',
  'src/pages/Terms.tsx',
  'src/pages/SemanticCommercePage.tsx',
  'src/pages/Contact.tsx',
  'src/components/layout/Footer.tsx',
  'supabase/functions/submit-consultation/index.ts',
]) {
  forbid(relative, [
    /(?:online support|review) queue/i,
    /saved for review/i,
    /requests are reviewed through/i,
  ]);
}
requireText('src/components/home/NewVisitorPopup.tsx', [
  'First-Order Welcome Offer',
  'show the welcome code on this screen and subscribe this address',
  'Your subscription was not saved',
  'Shopify confirms final eligibility',
]);
forbid('src/components/home/NewVisitorPopup.tsx', [
  /Limited Time Welcome Offer/i,
  /Early access/i,
  /email the welcome code/i,
  /lead before attempting email delivery/i,
  /Code copied to clipboard/i,
]);
for (const relative of [
  'src/components/layout/Header.tsx',
  'src/components/cart/CartDrawer.tsx',
  'src/components/product/ProductInfo.tsx',
]) {
  forbid(relative, [
    /RAKSHA_BANDHAN_CAMPAIGN/,
    /72[- ]hour offer/i,
    /LUXE10[^\n]{0,100}\$150|\$150[^\n]{0,100}LUXE10/i,
  ]);
}

for (const relative of [
  'src/components/measurements/MeasurementForm.tsx',
  'src/components/SizeChartModal.tsx',
  'src/data/sizeChart.ts',
  'src/components/product/BottomStyleSelector.tsx',
  'src/components/product/SleeveStyleSelector.tsx',
  'src/components/product/NecklineSelector.tsx',
  'src/components/StitchingSizeSelector.tsx',
  'src/components/HowToMeasureModal.tsx',
]) {
  requireAbsent(relative);
}

for (const relative of [
  'index.html',
  'src/pages/BrandStory.tsx',
  'src/pages/Contact.tsx',
  'src/pages/Indowestern.tsx',
  'src/pages/InventoryBackedCollection.tsx',
  'src/pages/NavratriOutfits.tsx',
  'src/pages/Privacy.tsx',
  'src/pages/Shipping.tsx',
  'src/pages/Terms.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/product/ProductInfo.tsx',
  'src/config/categoryConfig.tsx',
  'src/config/commercialLandingPages.tsx',
  'src/config/shopifyCollectionConfig.ts',
]) {
  forbid(relative, [
    /(?:USA|U\.S\.|US)-based support/i,
    /\bOnline (?:in the )?USA\b/i,
    /\b(?:Outfits|Sarees|Lehengas|Suits) USA\b/i,
  ]);
}

for (const relative of [
  'src/pages/DiwaliOutfits.tsx',
  'src/pages/EidOutfits.tsx',
  'src/pages/HaldiOutfits.tsx',
  'src/pages/MehendiOutfits.tsx',
  'src/pages/WeddingGuestOutfits.tsx',
]) {
  requireText(relative, [
    'U.S. standard shipping is free at $199 and above and $14.99 below $199',
    'the other destinations use the rates and thresholds on the Shipping page',
  ]);
  forbid(relative, [/countries?[^\n]{0,180}\. Standard shipping is free at \$199/i]);
}

requireText('docs/shopify-google-customer-reviews-snippet.liquid', [
  'RETIRED — DO NOT INSTALL',
  'SKU is not evidence of a',
  'not be calculated from a universal offset',
]);
forbid('docs/shopify-google-customer-reviews-snippet.liquid', [
  /<script/i,
  /plus:\s*1209600/i,
  /line_item\.sku/i,
]);

requireText('docs/catalog-fulfillment-rule.md', [
  'Ready to Ship** appears only when',
  'Sale availability and the absence of a made-to-order label do not prove ready-to-ship status',
  'The release build fails closed',
]);
forbid('docs/catalog-fulfillment-rule.md', [
  /Every purchasable product is \*\*Ready to Ship\*\*/i,
]);

requireText('src/pages/CustomizableOutfits.tsx', [
  'final sale for change of mind',
  'covered-order-issue process',
]);
forbid('src/pages/CustomizableOutfits.tsx', [/\bAll orders are final sale\b/i]);
forbid('src/components/product/ProductInfo.tsx', [
  /(?:USA|U\.S\.|US)-Based Support/i,
  /Carefully packaged for transit/i,
]);
forbid('src/pages/ProductDetail.tsx', [
  /hasExplicitTailoringOffer/,
  /isStitchable=/,
]);
forbid('src/components/product/ProductTabs.tsx', [
  /A tailoring option is available for this listing/i,
  /its displayed price/i,
]);

for (const relative of ['LUXEMIA_GROWTH_REPORT.md', 'SEO_RECOVERY_REPORT.md']) {
  forbid(relative, [
    /uniquely positioned to dominate/i,
    /dramatically increases buyer comfort/i,
    /force Google to crawl/i,
    /guaranteed (?:traffic|revenue|ranking|index)/i,
    /Ananya Iyer|Meera Kapoor|Rajesh Sharma/,
  ]);
}

if (failures.length > 0) {
  console.error('[visible-claims] Validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[visible-claims] OK — visible catalog, fulfillment, currency, service, origin, and sustainability claims are evidence-gated.');
