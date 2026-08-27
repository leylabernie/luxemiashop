#!/usr/bin/env node

/**
 * Finalize the competitor-derived merchandising work using LuxeMia's verified
 * fulfillment rule:
 *
 * - every purchasable product is Ready to Ship unless Shopify identifies it as
 *   Made to Order / Made to Measure;
 * - a stocked product can also offer an optional custom-size or custom-stitching
 *   selection, and that selection takes additional processing time;
 * - processing and carrier transit are always stated separately.
 *
 * Older migration scripts run before this file. This finalizer deliberately
 * runs last, overwrites their retired five-day-only assumptions, and then
 * validates the exact source state used by Vite, prerendering, and release
 * checks. It is idempotent.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const changed = [];

const DESTINATIONS = 'the United States, Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius';
const PRODUCT_SHIPPING_ANSWER = `LuxeMia ships to ${DESTINATIONS}. U.S. standard shipping is $14.99 below $199 and free at $199 and above. Other destinations use route-based rates shown on the Shipping page and at checkout. Tracking is emailed after dispatch.`;
const PRODUCT_READY_DELIVERY_ANSWER = 'This product is Ready to Ship in its listed stocked selections. Ready to Ship describes stock availability; order processing and carrier transit are separate. Any Custom Size, Custom Stitching or Made-to-Measure selection takes additional processing time, and LuxeMia confirms timing before production.';
const READY_PAGE_DESCRIPTION = 'Shop LuxeMia ready-to-ship sarees, lehengas, suits, menswear and jewelry. Purchasable catalog items are ready to ship unless explicitly marked Made to Order.';
const READY_ROUTE_CONTENT = `  {
    path: '/ready-to-ship',
    category: 'ready-to-ship',
    title: 'Ready-to-Ship Indian Ethnic Wear | LuxeMia',
    description: '${READY_PAGE_DESCRIPTION}',
    h1: 'Ready-to-Ship Indian Ethnic Wear',
    content: \`
      <p>Every purchasable LuxeMia catalog item is Ready to Ship unless the product is explicitly marked Made to Order or Made to Measure. Ready to Ship means the listed non-custom selection is stocked for order handling and dispatch; it does not promise same-day dispatch or a fixed carrier-delivery date.</p>
      <h2>Stocked selections and custom selections</h2>
      <p>Some stocked products also offer a Custom Size, Custom Stitching or Made-to-Measure selection. Standard stocked selections remain Ready to Ship, while the custom selection requires additional processing. Fully custom products are shown separately as Made to Order.</p>
      <h2>Processing and carrier transit are separate</h2>
      <p>Order processing happens before dispatch. Carrier transit begins after the parcel is accepted by the carrier. Confirm the selected size, included pieces and any custom option before ordering for a fixed event date.</p>
      <h2>Shipping rates and timing</h2>
      <p><a href="/shipping">View route-based rates</a> for the United States, Canada, United Kingdom, Australia, New Zealand, South Africa and Mauritius.</p>
    \`,
  },
`;

function absolute(relative) {
  return path.join(ROOT, relative);
}

function read(relative) {
  return fs.readFileSync(absolute(relative), 'utf8');
}

function write(relative, content) {
  const file = absolute(relative);
  const before = fs.readFileSync(file, 'utf8');
  if (before === content) return;
  fs.writeFileSync(file, content, 'utf8');
  changed.push(relative);
}

function requireMatch(relative, source, expression, label) {
  if (!expression.test(source)) {
    throw new Error(`[competitor-merchandising] ${relative} missing ${label}`);
  }
}

function requireAbsent(relative, source, expression, label) {
  if (expression.test(source)) {
    throw new Error(`[competitor-merchandising] ${relative} still contains ${label}`);
  }
}

function patchReadyToShipPage() {
  const relative = 'src/pages/ReadyToShip.tsx';
  let source = read(relative);

  source = source
    .replace(
      /import \{ sortProducts \} from '@\/lib\/productFilters';\n(?!import \{ isMadeToOrderProduct)/,
      "import { sortProducts } from '@/lib/productFilters';\nimport { isMadeToOrderProduct } from '@/lib/customizableProducts';\n",
    )
    .replace(
      /const readyProducts = useMemo\(\s*\(\) => products\.filter\(\(product\) => \{[\s\S]*?processingDays <= 5;[\s\S]*?\}\),\s*\[products\],\s*\);/,
      `const readyProducts = useMemo(
    () => products.filter((product) => {
      if (isMadeToOrderProduct(product.node.handle, product.node.tags)) return false;
      if (product.node.availableForSale === false) return false;

      const variants = product.node.variants?.edges || [];
      return variants.length === 0 || variants.some((edge) => edge.node.availableForSale !== false);
    }),
    [products],
  );`,
    )
    .replace(
      /description="Shop LuxeMia outfits with a verified semi-stitched processing window of up to five business days\. Stitched and made-to-measure options take longer\."/,
      `description="${READY_PAGE_DESCRIPTION}"`,
    )
    .replace(/Verified shorter processing/g, 'Stocked catalog styles')
    .replace(
      /These products have a verified semi-stitched processing window of up to five business days\.[\s\S]*?Review the exact product option and contact LuxeMia before ordering for a fixed event date\./,
      'Every purchasable LuxeMia catalog item is Ready to Ship unless the product is explicitly marked Made to Order or Made to Measure. Ready to Ship means the listed non-custom selection is stocked for order handling and dispatch. Order processing and carrier transit are separate.',
    )
    .replace(/styles with verified shorter processing/g, 'ready-to-ship styles')
    .replace(
      /No products currently have a verified semi-stitched processing window of five business days or less\./g,
      'No currently available ready-to-ship products were returned.',
    );

  write(relative, source);
}

function patchProductDetail() {
  const relative = 'src/pages/ProductDetail.tsx';
  let source = read(relative);

  if (!source.includes('isMadeToOrderProduct,')) {
    source = source.replace(
      /import \{\n  applyCustomizableProductDetails,\n  getCustomizableProduct,\n\} from '@\/lib\/customizableProducts';/,
      `import {
  applyCustomizableProductDetails,
  getCustomizableProduct,
  isMadeToOrderProduct,
} from '@/lib/customizableProducts';`,
    );
  }

  if (!source.includes('const madeToOrderProduct = isMadeToOrderProduct')) {
    source = source.replace(
      '  const customizableProduct = getCustomizableProduct(product?.handle);\n',
      `  const customizableProduct = getCustomizableProduct(product?.handle);
  const madeToOrderProduct = isMadeToOrderProduct(product?.handle, product?.tags);
`,
    );
  }

  source = source
    .replace('const categoryUrl = customizableProduct', 'const categoryUrl = madeToOrderProduct')
    .replace('const categoryName = customizableProduct', 'const categoryName = madeToOrderProduct')
    .replace("    ? 'Customizable Indian Outfits'", "    ? 'Made-to-Order Indian Outfits'")
    .replace('const sizeAnswer = customizableProduct', 'const sizeAnswer = madeToOrderProduct')
    .replace(/isStitchable=\{!customizableProduct &&/g, 'isStitchable={!madeToOrderProduct &&');

  source = source.replace(
    /\{\n\s+question: `(?:Does LuxeMia ship the \$\{product\.title\} within the United States\?|Where does LuxeMia ship the \$\{product\.title\}\?)`,\n\s+answer: '[^']*',\n\s+\},/,
    `{
      question: \`Where does LuxeMia ship the \${product.title}?\`,
      answer: '${PRODUCT_SHIPPING_ANSWER}',
    },`,
  );

  source = source.replace(
    /(question: `What is the delivery time for the \$\{product\.title\}\?`,\n\s+answer: )customizableProduct/,
    '$1madeToOrderProduct',
  );
  source = source.replace(
    /:\s*'Delivery timing depends on the item and selected options\.[^']*'/,
    `: '${PRODUCT_READY_DELIVERY_ANSWER}'`,
  );

  write(relative, source);
}

function patchProductInfo() {
  const relative = 'src/components/product/ProductInfo.tsx';
  let source = read(relative);

  source = source.replace(
    "import { getCustomizableProduct } from '@/lib/customizableProducts';",
    "import { getCustomizableProduct, isMadeToOrderProduct } from '@/lib/customizableProducts';",
  );

  if (!source.includes('const madeToOrderProduct = isMadeToOrderProduct')) {
    source = source.replace(
      '  const customizableProduct = getCustomizableProduct(product.handle);\n',
      `  const customizableProduct = getCustomizableProduct(product.handle);
  const madeToOrderProduct = isMadeToOrderProduct(product.handle, product.tags);
`,
    );
  }

  source = source
    .replace('const isStitchable = !customizableProduct &&', 'const isStitchable = !madeToOrderProduct &&')
    .replace('const isMenswear = !customizableProduct &&', 'const isMenswear = !madeToOrderProduct &&')
    .replace('const showBottomStyleOption = !customizableProduct &&', 'const showBottomStyleOption = !madeToOrderProduct &&');

  if (!source.includes('const currentSelectionIsMadeToOrder =')) {
    source = source.replace(
      `  const isCustomSizeSelected = useMemo(() =>
    Object.entries(selectedOptions).some(([optionName, value]) =>
      isProductSizeOptionName(optionName)
      && /\\bcustom(?:\\s*size)?\\b/i.test(value.trim()),
    ),
  [selectedOptions]);
`,
      `  const isCustomSizeSelected = useMemo(() =>
    Object.entries(selectedOptions).some(([optionName, value]) =>
      isProductSizeOptionName(optionName)
      && /\\bcustom(?:\\s*size)?\\b/i.test(value.trim()),
    ),
  [selectedOptions]);
  const currentSelectionIsMadeToOrder = madeToOrderProduct || isCustomSizeSelected;
`,
    );
  }

  if (!source.includes('madeToOrderProduct && !customizableProduct')) {
    source = source.replace(
      `    if (isCustomSizeSelected) {
`,
      `    if (madeToOrderProduct && !customizableProduct) {
      customAttributes.push(
        { key: 'Made to Order', value: 'Yes — confirmation required' },
        { key: 'Measurements', value: 'Required after order' },
        { key: 'Timing Estimate', value: 'Approximately 4–5 weeks total; production and transit confirmed separately' },
      );
    }
    if (isCustomSizeSelected) {
`,
    );
  }

  if (!source.includes('isCustomSizeSelected && !madeToOrderProduct')) {
    source = source.replace(
      `    if (isStitchable && selectedStitchingType) {
`,
      `    if (isCustomSizeSelected && !madeToOrderProduct) {
      customAttributes.push({
        key: 'Timing Estimate',
        value: 'Approximately 4–5 weeks total for the custom selection; production and transit confirmed separately',
      });
    }
    if (isStitchable && selectedStitchingType) {
`,
    );
  }

  source = source
    .replace(
      /<DeliveryEstimate hasStitching=\{needsStitchingSize\} isMadeToOrder=\{Boolean\(customizableProduct\)\} \/>/g,
      '<DeliveryEstimate hasStitching={needsStitchingSize} isMadeToOrder={currentSelectionIsMadeToOrder} />',
    )
    .replace(/\{customizableProduct\n\s+\? 'Use approximately 4–5 weeks/g, "{currentSelectionIsMadeToOrder\n              ? 'Use approximately 4–5 weeks")
    .replace(/\{customizableProduct\n\s+\? 'Made to order from measurements/g, "{currentSelectionIsMadeToOrder\n              ? 'Made to order from measurements");

  write(relative, source);
}

function patchProductCard() {
  const relative = 'src/components/ui/ProductCard.tsx';
  let source = read(relative);

  source = source
    .replace(
      "import { isCustomizableProduct } from '@/lib/customizableProducts';",
      "import { isMadeToOrderProduct } from '@/lib/customizableProducts';",
    )
    .replace(
      '  const isVerifiedCustom = isCustomizableProduct(product.node.handle);',
      '  const isMadeToOrder = isMadeToOrderProduct(product.node.handle, product.node.tags);',
    )
    .replace(/\bisVerifiedCustom\b/g, 'isMadeToOrder')
    .replace('View custom color &amp; measurement details', 'View made-to-order details')
    .replace('                Custom color', '                Made to Order');

  const shippingBlock = `          {shipByLabel && (
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              {shipByLabel}
            </p>
          )}`;
  const availabilityBlock = `          <p className={\`text-xs font-medium \${isMadeToOrder ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}\`}>
            {isMadeToOrder ? 'Made to Order' : 'Ready to Ship'}
          </p>
          {shipByLabel && !isMadeToOrder && (
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              {shipByLabel}
            </p>
          )}`;

  if (source.includes(shippingBlock)) {
    source = source.replace(shippingBlock, availabilityBlock);
  }

  write(relative, source);
}

function patchProductHook() {
  const relative = 'src/hooks/useShopifyProducts.ts';
  let source = read(relative);

  source = source.replace(
    `import {
  applyCustomizableProductDetails,
  CUSTOMIZABLE_PRODUCT_HANDLES,
} from '@/lib/customizableProducts';`,
    `import {
  applyCustomizableProductDetails,
  isMadeToOrderProduct,
} from '@/lib/customizableProducts';`,
  );

  source = source
    .replace("const CACHE_VERSION = 'v12';", "const CACHE_VERSION = 'v13';")
    .replace(
      'return allowed.filter((product) => CUSTOMIZABLE_PRODUCT_HANDLES.has(product.node.handle));',
      'return allowed.filter((product) => isMadeToOrderProduct(product.node.handle, product.node.tags));',
    );

  write(relative, source);
}

function patchProductFilters() {
  const relative = 'src/lib/productFilters.ts';
  let source = read(relative);

  if (!source.includes("isMadeToOrderProduct } from '@/lib/customizableProducts'")) {
    source = source.replace(
      "import { isProductSizeOptionName } from '@/lib/productOptionNames';",
      "import { isProductSizeOptionName } from '@/lib/productOptionNames';\nimport { isMadeToOrderProduct } from '@/lib/customizableProducts';",
    );
  }
  source = source.replace("import { getProductShipsWithin } from '@/lib/shipBy';\n", '');

  source = source.replace(
    /          if \(valueLower\.includes\('ready'\)\) \{[\s\S]*?\n          \}\n\n          if \(valueLower\.includes\('available online'\)\)/,
    `          if (valueLower.includes('ready')) {
            const hasAvailable = variants.some(v => v.node.availableForSale !== false);
            return hasAvailable && !isMadeToOrderProduct(p.node.handle, p.node.tags);
          }

          if (valueLower.includes('available online'))`,
  );

  source = source.replace(
    /          if \(valueLower\.includes\('made to order'\) \|\| valueLower\.includes\('custom'\)\) \{[\s\S]*?\n          \}/,
    `          if (valueLower.includes('made to order') || valueLower.includes('custom')) {
            return isMadeToOrderProduct(p.node.handle, p.node.tags);
          }`,
  );

  source = source.replace(
    /    case 'fastest':[\s\S]*?      break;\n(?=    case 'price-asc':)/,
    '',
  );

  write(relative, source);
}

function patchListingSortAndLabels() {
  let relative = 'src/hooks/useListingFilters.ts';
  let source = read(relative);
  source = source.replace(
    "const SORT_OPTIONS = ['featured', 'newest', 'fastest', 'price-asc', 'price-desc'] as const;",
    "const SORT_OPTIONS = ['featured', 'newest', 'price-asc', 'price-desc'] as const;",
  );
  write(relative, source);

  relative = 'src/components/collections/CategoryListing.tsx';
  source = read(relative);
  source = source.replace("  { label: 'Faster Delivery', value: 'fastest' },\n", '');
  write(relative, source);

  relative = 'src/config/categoryConfig.tsx';
  source = read(relative)
    .split("Ready to Ship — up to 5 business days")
    .join('Ready to Ship');
  write(relative, source);
}

function patchDeliveryEstimate() {
  const relative = 'src/components/product/DeliveryEstimate.tsx';
  let source = read(relative);

  source = source
    .replace(
      'United States shipping only. Standard shipping is free at $150 and above and $12 below.',
      'Tracked shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above; other destinations use route-based rates.',
    )
    .replace(
      'Delivery timing depends on the item and selected options. Tracking details are emailed when the shipping label is created for dispatch.',
      'Ready-to-Ship selections are stocked for order handling and dispatch. Order processing and carrier transit are separate, and tracking is emailed after dispatch.',
    );

  write(relative, source);
}

function patchRuntimeShopifySanitizer() {
  const relative = 'src/lib/shopify.ts';
  let source = read(relative);

  source = source
    .split('U.S. standard shipping is $12 below $150 and free at $150 and above')
      .join('U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Standard shipping is free at $150 and above and $12 below $150')
      .join('Tracked shipping is available to seven countries; U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Free U.S. shipping at $150 and above. $12 flat below that. Tracking provided after dispatch.')
      .join('Tracked shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above. Tracking is provided after dispatch.')
    .split('Free U.S. shipping at $150 and above')
      .join('Tracked shipping to seven supported countries')
    .split('United States shipping only. Standard shipping is $12 below $150 and free at $150 and above')
      .join('Tracked shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('United States shipping only')
      .join('Tracked shipping to seven supported countries')
    .split('Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
      .join('Tracked shipping is available to seven countries; route-based rates are shown on the Shipping page and at checkout')
    .split('USA, Canada, and Australia')
      .join('the seven supported destination countries')
    .split('free shipping on orders over $350')
      .join('route-based shipping rates shown at checkout')
    .replace(
      /\.replace\(\/ready\[- \]to\[- \]ship\/gi, 'available online'\)/g,
      ".replace(/ready[- ]to[- ]ship/gi, 'Ready to Ship')",
    );

  write(relative, source);
}

function patchMerchantFeedSource() {
  const relative = 'scripts/generate-static-feed.cjs';
  let source = read(relative);

  source = source
    .split('Tracked U.S. delivery and free shipping on orders $150+')
      .join('Tracked shipping to seven countries; U.S. shipping is free at $199+')
    .split('Free U.S. shipping on orders $150+')
      .join('U.S. shipping is free at $199+')
    .split('Free U.S. shipping at $150 and above')
      .join('U.S. shipping is free at $199 and above')
    .split('Tracked U.S. delivery')
      .join('Tracked shipping to seven supported countries')
    .split('United States shipping only. Standard shipping is $12 below $150 and free at $150 and above')
      .join('Tracked shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
      .join('Tracked shipping is available to seven countries; route-based rates are shown on the Shipping page and at checkout')
    .split('USA, Canada, and Australia')
      .join('the seven supported destination countries')
    .split('free shipping on orders over $350')
      .join('route-based shipping rates shown at checkout');

  write(relative, source);
}

function patchPrerender() {
  const relative = 'scripts/prerender.js';
  let source = read(relative);

  if (!source.includes('const PRERENDER_MADE_TO_ORDER_TAGS')) {
    source = source.replace(
      `const CUSTOMIZABLE_PRODUCTS_BY_HANDLE = new Map(
  CUSTOMIZABLE_PRODUCTS.map((product) => [product.handle, product])
);
`,
      `const CUSTOMIZABLE_PRODUCTS_BY_HANDLE = new Map(
  CUSTOMIZABLE_PRODUCTS.map((product) => [product.handle, product])
);
const PRERENDER_MADE_TO_ORDER_TAGS = new Set([
  'made to order',
  'availability:made to order',
  'custom-made',
]);

function isMadeToOrderProduct(product) {
  if (!product) return false;
  if (CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(product.handle)) return true;
  return (product.tags || []).some((tag) =>
    PRERENDER_MADE_TO_ORDER_TAGS.has(String(tag).trim().toLowerCase())
  );
}
`,
    );
  }

  source = source
    .split('U.S. standard shipping is $12 below $150 and free at $150 and above')
      .join('U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Standard shipping is free at $150 and above and $12 below $150')
      .join('Tracked shipping is available to seven countries; U.S. standard shipping is $14.99 below $199 and free at $199 and above')
    .split('Free U.S. shipping at $150 and above. $12 flat below that. Tracking provided after dispatch.')
      .join('Tracked shipping is available to seven countries. U.S. standard shipping is $14.99 below $199 and free at $199 and above. Tracking is provided after dispatch.')
    .split('Free U.S. shipping at $150 and above')
      .join('Tracked shipping to seven supported countries')
    .split('Shipping is available to United States addresses only. Current U.S. rates and services are shown at checkout')
      .join('Tracked shipping is available to seven countries; route-based rates are shown on the Shipping page and at checkout')
    .split('United States shipping only')
      .join('Tracked shipping to seven supported countries')
    .split('United States addresses only')
      .join('the seven supported destination countries')
    .split('USA, Canada, and Australia')
      .join('the seven supported destination countries')
    .split('free shipping on orders over $350')
      .join('route-based shipping rates shown at checkout')
    .replace(
      /\.replace\(\/ready\[- \]to\[- \]ship\/gi, 'available online'\)/g,
      ".replace(/ready[- ]to[- ]ship/gi, 'Ready to Ship')",
    );

  source = source.replace(
    /  if \(category === 'ready-to-ship'\) \{[\s\S]*?\n  \}\n(?=  if \(category === 'customizable'\))/,
    `  if (category === 'ready-to-ship') {
    return allProducts
      .filter((product) => product.availableForSale !== false)
      .filter((product) => !isMadeToOrderProduct(product))
      .slice(0, MAX_COLLECTION_PRODUCTS);
  }
`,
  );

  source = source.replace(
    '.filter((product) => CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(product.handle))',
    '.filter((product) => isMadeToOrderProduct(product))',
  );

  source = source
    .replace(
      'const productCategory = CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(handle)',
      'const productCategory = isMadeToOrderProduct(live)',
    )
    .replace(
      'const productCategory = CUSTOMIZABLE_PRODUCTS_BY_HANDLE.has(p.handle)',
      'const productCategory = isMadeToOrderProduct(p)',
    )
    .replace(
      "? { label: 'Customizable Indian Outfits', link: '/collections/customizable-indian-outfits', schemaCategory: 'Apparel & Accessories > Clothing' }",
      "? { label: 'Made-to-Order Indian Outfits', link: '/collections/customizable-indian-outfits', schemaCategory: 'Apparel & Accessories > Clothing' }",
    );

  source = source.replace(
    /  \{\n    path: '\/ready-to-ship',[\s\S]*?\n  \},\n(?=  \{\n    path: '\/pages\/shipping-customs')/,
    READY_ROUTE_CONTENT,
  );

  source = source
    .split('Use the Ready to Ship filter only for listings explicitly tagged that way')
      .join('Use the Ready to Ship filter for stocked non-custom products')
    .split('The Ready to Ship availability filter requires an explicit catalog tag and an available variant.')
      .join('The Ready to Ship availability filter includes purchasable products unless Shopify identifies them as Made to Order or Made to Measure.');

  source = source.replace(
    /return `\$\{getCustomProductDescription\(matched\.title\)\} Checkout accepts [^`]*`;/,
    `return \`\${getCustomProductDescription(matched.title)} Tracked shipping is available to ${DESTINATIONS}. U.S. standard shipping is $14.99 below $199 and free at $199 and above; other destinations use route-based rates.\`;`,
  );

  write(relative, source);
}

function patchTrustSourceValidator() {
  const relative = 'scripts/validate-trust-source-of-truth.cjs';
  let source = read(relative);

  source = source.replace(
    /requireAll\('src\/pages\/ReadyToShip\.tsx', \[[\s\S]*?\]\);/,
    `requireAll('src/pages/ReadyToShip.tsx', [
  'isMadeToOrderProduct(product.node.handle, product.node.tags)',
  'Every purchasable LuxeMia catalog item is Ready to Ship',
  'Order processing and carrier transit are separate',
  'View route-based rates',
]);`,
  );

  if (!source.includes("requireAll('src/lib/productFilters.ts'")) {
    source = source.replace(
      "requireAll('src/lib/shopify.ts', [",
      `requireAll('src/lib/productFilters.ts', [
  'isMadeToOrderProduct(p.node.handle, p.node.tags)',
  "valueLower.includes('ready')",
]);
requireAll('src/hooks/useShopifyProducts.ts', [
  'isMadeToOrderProduct(product.node.handle, product.node.tags)',
  "const CACHE_VERSION = 'v13'",
]);
requireAll('src/lib/shopify.ts', [`,
    );
  }

  source = source
    .replace(
      "console.log('[trust-source] OK — metadata, route shipping, verified five-day Ready-to-Ship data, redirects and structured data use the final source of truth.');",
      "console.log('[trust-source] OK — metadata, route shipping, stocked Ready-to-Ship versus Made-to-Order classification, redirects and structured data use the final source of truth.');",
    );

  write(relative, source);
}

function patchBuiltTrustValidator() {
  const relative = 'scripts/validate-built-trust.cjs';
  let source = read(relative);

  source = source.replace(
    /requireAll\('ready-to-ship', ready, \[[\s\S]*?\]\);/,
    `requireAll('ready-to-ship', ready, [
  'Ready-to-Ship Indian Ethnic Wear',
  'Every purchasable LuxeMia catalog item is Ready to Ship',
  'Custom Size, Custom Stitching or Made-to-Measure selection',
  'Processing and carrier transit are separate',
  'View route-based rates',
]);`,
  );

  source = source.replace(
    /if \(readyProductLinks\.size !== 10\) \{\n  failures\.push\(`ready-to-ship must contain exactly 10 verified product links; found \$\{readyProductLinks\.size\}`\);\n\}/,
    `if (readyProductLinks.size < 40) {
  failures.push(\`ready-to-ship must contain at least 40 stocked product links; found \${readyProductLinks.size}\`);
}`,
  );

  source = source.replace(
    /console\.log\(`\[built-trust\] OK — \$\{allHtmlFiles\.length\} built HTML pages have aligned metadata, route-based shipping, 10 verified five-day Ready-to-Ship products and no false global return schema\.`\);/,
    "console.log(`[built-trust] OK — ${allHtmlFiles.length} built HTML pages have aligned metadata, route-based shipping, stocked Ready-to-Ship versus Made-to-Order classification and no false global return schema.`);",
  );

  write(relative, source);
}

function validateFinalState() {
  const ready = read('src/pages/ReadyToShip.tsx');
  requireMatch('src/pages/ReadyToShip.tsx', ready, /isMadeToOrderProduct\(product\.node\.handle, product\.node\.tags\)/, 'tag-aware Made-to-Order exclusion');
  requireMatch('src/pages/ReadyToShip.tsx', ready, /Every purchasable LuxeMia catalog item is Ready to Ship/, 'owner-approved Ready-to-Ship rule');
  requireAbsent('src/pages/ReadyToShip.tsx', ready, /processingDays\s*<=\s*5|verified semi-stitched processing window/i, 'retired five-day gate');

  const detail = read('src/pages/ProductDetail.tsx');
  requireMatch('src/pages/ProductDetail.tsx', detail, /const madeToOrderProduct = isMadeToOrderProduct/, 'Made-to-Order classification');
  requireMatch('src/pages/ProductDetail.tsx', detail, /Where does LuxeMia ship the \$\{product\.title\}\?/, 'international shipping FAQ');
  requireMatch('src/pages/ProductDetail.tsx', detail, /isStitchable=\{!madeToOrderProduct &&/, 'Made-to-Order tailoring boundary');

  const info = read('src/components/product/ProductInfo.tsx');
  requireMatch('src/components/product/ProductInfo.tsx', info, /const currentSelectionIsMadeToOrder = madeToOrderProduct \|\| isCustomSizeSelected/, 'selection-level Made-to-Order timing');
  requireMatch('src/components/product/ProductInfo.tsx', info, /isMadeToOrder=\{currentSelectionIsMadeToOrder\}/, 'delivery estimate classification');
  requireMatch('src/components/product/ProductInfo.tsx', info, /madeToOrderProduct && !customizableProduct/, 'generic Made-to-Order cart attributes');

  const card = read('src/components/ui/ProductCard.tsx');
  requireMatch('src/components/ui/ProductCard.tsx', card, /isMadeToOrderProduct\(product\.node\.handle, product\.node\.tags\)/, 'card fulfillment classification');
  requireMatch('src/components/ui/ProductCard.tsx', card, /Made to Order' : 'Ready to Ship'/, 'card availability label');
  requireAbsent('src/components/ui/ProductCard.tsx', card, /View custom color &amp; measurement details/, 'custom-color-only card label');

  const filters = read('src/lib/productFilters.ts');
  requireMatch('src/lib/productFilters.ts', filters, /!isMadeToOrderProduct\(p\.node\.handle, p\.node\.tags\)/, 'Ready-to-Ship filter');
  requireMatch('src/lib/productFilters.ts', filters, /return isMadeToOrderProduct\(p\.node\.handle, p\.node\.tags\)/, 'Made-to-Order filter');
  requireAbsent('src/lib/productFilters.ts', filters, /getProductShipsWithin|case 'fastest':/, 'retired faster-delivery logic');

  const listing = read('src/components/collections/CategoryListing.tsx');
  requireAbsent('src/components/collections/CategoryListing.tsx', listing, /Faster Delivery|value: 'fastest'/, 'retired faster-delivery sort');

  const hook = read('src/hooks/useShopifyProducts.ts');
  requireMatch('src/hooks/useShopifyProducts.ts', hook, /const CACHE_VERSION = 'v13'/, 'catalog cache invalidation');
  requireMatch('src/hooks/useShopifyProducts.ts', hook, /isMadeToOrderProduct\(product\.node\.handle, product\.node\.tags\)/, 'Made-to-Order collection filter');

  const prerender = read('scripts/prerender.js');
  requireMatch('scripts/prerender.js', prerender, /category === 'ready-to-ship'[\s\S]*?!isMadeToOrderProduct\(product\)/, 'prerender Ready-to-Ship filter');
  requireMatch('scripts/prerender.js', prerender, /Every purchasable LuxeMia catalog item is Ready to Ship/, 'prerender Ready-to-Ship copy');
  requireAbsent('scripts/prerender.js', prerender, /days >= 1 && days <= 5|semi-stitched option has a verified processing window/i, 'retired prerender five-day rule');

  const trustValidator = read('scripts/validate-trust-source-of-truth.cjs');
  requireMatch('scripts/validate-trust-source-of-truth.cjs', trustValidator, /stocked Ready-to-Ship versus Made-to-Order classification/, 'source validator fulfillment rule');

  const builtValidator = read('scripts/validate-built-trust.cjs');
  requireMatch('scripts/validate-built-trust.cjs', builtValidator, /at least 40 stocked product links/, 'built Ready-to-Ship coverage');
  requireAbsent('scripts/validate-built-trust.cjs', builtValidator, /exactly 10 verified product links|10 verified five-day/, 'retired built five-day assertion');

  for (const relative of ['src/lib/shopify.ts', 'scripts/prerender.js']) {
    const source = read(relative)
      .split('\n')
      .filter((line) => !line.includes('.replace(/'))
      .join('\n');
    for (const blocked of [
      /United States shipping only/i,
      /\$12[^\n]{0,80}\$150/i,
      /Free U\.S\. shipping at \$150/i,
      /free shipping on orders over \$350/i,
    ]) {
      requireAbsent(relative, source, blocked, `blocked runtime value ${blocked}`);
    }
  }
}

patchReadyToShipPage();
patchProductDetail();
patchProductInfo();
patchProductCard();
patchProductHook();
patchProductFilters();
patchListingSortAndLabels();
patchDeliveryEstimate();
patchRuntimeShopifySanitizer();
patchMerchantFeedSource();
patchPrerender();
patchTrustSourceValidator();
patchBuiltTrustValidator();
validateFinalState();

console.log(
  `[competitor-merchandising] OK — all purchasable non-custom products resolve as Ready to Ship; product-level and selection-level Made-to-Order timing, international shipping, catalog filters, product cards, prerendering and release validators are aligned${changed.length ? ` across ${changed.length} file(s)` : ''}.`,
);
