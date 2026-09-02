#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ROUTE_GENERATOR = path.join(ROOT, 'scripts/generate-routes.cjs');
const PRERENDER = path.join(ROOT, 'scripts/prerender.js');

function updateFile(file, updater, label) {
  const before = fs.readFileSync(file, 'utf8');
  const after = updater(before);
  if (after === before) {
    console.log(`[prerender-routes] ${label} already aligned.`);
    return;
  }
  fs.writeFileSync(file, after, 'utf8');
  console.log(`[prerender-routes] ${label} updated.`);
}

updateFile(ROUTE_GENERATOR, (source) => {
  let output = source;
  if (!output.includes("  '/ready-to-ship',")) {
    output = output.replace("  '/shipping',", "  '/shipping',\n  '/ready-to-ship',");
  }
  // The empty Manthrakodi collection now redirects to the current saree catalog;
  // it must not remain a standalone zero-product prerender route.
  output = output.replace("  '/collections/manthrakodi-sarees',\n", '');
  // Remove the historical duplicate without changing route order.
  output = output.replace("  '/jewelry',\n  '/jewelry',", "  '/jewelry',");
  return output;
}, 'static route manifest');

const shippingBlock = `  {
    path: '/shipping',
    title: 'Shipping Policy & International Rates | LuxeMia',
    description: 'Review tracked shipping rates for seven countries, plus processing, carrier transit, customs, duties, tracking and event-date guidance.',
    h1: 'Shipping Policy & International Rates',
    content: \`
      <p>LuxeMia ships to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius. Processing time happens before carrier transit, and checkout shows the final available service and converted amount where supported.</p>
      <h2>Standard shipping rates</h2>
      <h3>United States</h3>
      <ul><li>$14.99 below $199</li><li>Free standard shipping at $199 and above</li></ul>
      <h3>Canada and the United Kingdom</h3>
      <ul><li>$24.99 below $299</li><li>Free standard shipping at $299 and above</li></ul>
      <h3>Australia and New Zealand</h3>
      <ul><li>$29.99 below $349</li><li>Free standard shipping at $349 and above</li></ul>
      <h3>South Africa</h3><p>$49.99 per order.</p>
      <h3>Mauritius</h3><p>$59.99 per order.</p>
      <h2>Processing and carrier transit</h2>
      <p>Processing is the time before dispatch. Carrier transit begins after the parcel is accepted by the carrier. Review the exact product page for published processing information and contact LuxeMia before ordering for a fixed event date.</p>
      <h2>Carriers, consolidation and express service</h2>
      <p>LuxeMia may route a parcel through DHL, FedEx, UPS, Aramex or another qualified service based on destination, weight, dimensions, customs requirements and cost. Multi-item orders may be consolidated. Express and split-shipment service require a confirmed quote before ordering.</p>
      <h2>Customs and duties</h2>
      <p>Orders outside the United States may incur duties, taxes, brokerage or carrier fees unless checkout or a written quote explicitly states that they are included.</p>
    \`,
  },
  {
    path: '/ready-to-ship',
    category: 'ready-to-ship',
    title: 'Ready-to-Ship Indian Ethnic Wear | LuxeMia',
    description: 'Shop LuxeMia ready-to-ship sarees, lehengas, suits, menswear and jewelry. Purchasable catalog items are ready to ship unless explicitly marked Made to Order.',
    h1: 'Ready-to-Ship Indian Ethnic Wear',
    content: \`
      <p>Every purchasable LuxeMia catalog item is Ready to Ship unless the product is explicitly marked Made to Order or Made to Measure. Ready to Ship means the listed non-custom selection is stocked for order handling and dispatch; it does not promise same-day dispatch or a fixed carrier-delivery date.</p>
      <h2>Stocked and custom selections are different</h2>
      <p>Some stocked products also offer Custom Size, Custom Stitching or Made-to-Measure selections. Standard stocked selections remain Ready to Ship, while a custom selection requires the additional processing stated on the product page.</p>
      <h2>Shipping rates and timing</h2>
      <p><a href="/shipping">View route-based rates</a> for the United States, Canada, United Kingdom, Australia, New Zealand, South Africa and Mauritius.</p>
    \`,
  },
  {
    path: '/pages/shipping-customs',
    title: 'International Shipping, Duties & Customs | LuxeMia',
    description: 'Review international shipping, duties, customs, brokerage and tracking guidance for all seven LuxeMia destination countries.',
    h1: 'International Shipping, Duties & Customs',
    content: \`
      <p>Tracked shipping is available to the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa and Mauritius.</p>
      <h2>Duties, taxes and brokerage</h2>
      <p>International orders may be assessed customs duties, import taxes, value-added tax, brokerage or carrier processing fees. These charges are the customer’s responsibility unless checkout or a written LuxeMia quote explicitly states that they are included.</p>
      <h2>Carrier routing</h2>
      <p>LuxeMia may compare qualified carriers and consolidation services by destination, parcel weight, dimensions, customs requirements and cost. A standard rate does not guarantee a particular carrier.</p>
      <h2>Processing and delivery</h2>
      <p>Processing time occurs before dispatch. Carrier transit begins after acceptance by the carrier. Delivery estimates are not guarantees unless LuxeMia confirms a guaranteed date in writing.</p>
      <h2>Questions?</h2>
      <p>Contact <a href="mailto:hello@luxemia.shop">hello@luxemia.shop</a> before ordering if a customs, timing or checkout detail is unclear, or review the <a href="/shipping">Shipping Policy</a>.</p>
    \`,
  },
`;

updateFile(PRERENDER, (source) => {
  let output = source;

  const routeBlockPattern = /  \{\n    path: '\/shipping',[\s\S]*?\n  \},\n  \{\n    path: '\/pages\/shipping-customs',[\s\S]*?\n  \},\n(?=  \{\n    path: '\/returns')/;
  if (!routeBlockPattern.test(output)) {
    throw new Error('[prerender-routes] Shipping/static route block was not found');
  }
  output = output.replace(routeBlockPattern, shippingBlock);

  if (!output.includes("if (category === 'ready-to-ship')")) {
    const categoryFunctionMarker = "function filterProductsForCategory(allProducts, category, newestFirst = false, maxProducts = MAX_COLLECTION_PRODUCTS) {\n";
    if (!output.includes(categoryFunctionMarker)) {
      throw new Error('[prerender-routes] Product category filter function was not found');
    }
    const readyFilter = `function filterProductsForCategory(allProducts, category, newestFirst = false, maxProducts = MAX_COLLECTION_PRODUCTS) {\n  if (category === 'ready-to-ship') {\n    return allProducts\n      .filter((product) => product.availableForSale !== false)\n      .filter((product) => !isMadeToOrderProduct(product))\n      .slice(0, maxProducts);\n  }\n`;
    output = output.replace(categoryFunctionMarker, readyFilter);
  }

  // Keep the build-time FAQ schema aligned with the live policies and rates.
  output = output
    .replace(
      "text: 'LuxeMia ships to United States addresses only. U.S. standard shipping is $12 below $150 and free at $150 and above.'",
      "text: 'LuxeMia ships to seven supported countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above; other destinations use route-based rates.'",
    )
    .replace(
      "text: 'All sales are final and exchanges are not accepted, subject to applicable law. Report shipping damage, a defective or incorrect item, or a missing item within 48 hours of delivery with clear photos and a continuous unboxing video.'",
      "text: 'Except where applicable law provides otherwise, LuxeMia does not accept voluntary change-of-mind returns or exchanges. Genuine damage, defect, incorrect-item or missing-item claims should be reported within 48 hours with supporting evidence.'",
    );

  return output;
}, 'prerender shipping and Ready-to-Ship pages');

for (const [file, required] of [
  [ROUTE_GENERATOR, ["'/ready-to-ship'", "'/shipping'", "'/pages/shipping-customs'"]],
  [PRERENDER, ["path: '/ready-to-ship'", "category === 'ready-to-ship'", '!isMadeToOrderProduct(product)', 'Purchasable catalog items are ready to ship', '$24.99', '$59.99']],
]) {
  const source = fs.readFileSync(file, 'utf8');
  for (const value of required) {
    if (!source.includes(value)) throw new Error(`[prerender-routes] ${file} missing ${value}`);
  }
}

console.log('[prerender-routes] Ready-to-Ship and seven-country shipping routes are aligned.');
