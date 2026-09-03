#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const failures = [];

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const requireMatch = (relativePath, pattern, description) => {
  const source = read(relativePath);
  if (!pattern.test(source)) failures.push(`${relativePath}: missing ${description}`);
};

const sourceFiles = [];
const collectSourceFiles = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSourceFiles(absolutePath);
    else if (/\.(?:ts|tsx)$/.test(entry.name)) sourceFiles.push(absolutePath);
  }
};
collectSourceFiles(path.join(root, 'src'));

for (const absolutePath of sourceFiles) {
  const source = fs.readFileSync(absolutePath, 'utf8');
  const relativePath = path.relative(root, absolutePath);
  if (/availableForSale\s*!==\s*false/.test(source)) {
    failures.push(`${relativePath}: fail-open availableForSale !== false remains`);
  }
  if (/availability:\s*[^\n,?]+\.availableForSale\s*\?\s*['"]InStock['"]/.test(source)) {
    failures.push(`${relativePath}: schema InStock claim uses availability truthiness`);
  }
}

requireMatch(
  'src/lib/orderability.ts',
  /product\?\.availableForSale === true[\s\S]*node\.availableForSale === true/,
  'positive product-and-variant orderability evidence',
);
requireMatch(
  'src/lib/orderability.ts',
  /node\.id === variantId && node\.availableForSale === true/,
  'exact selected-variant orderability evidence',
);
requireMatch(
  'src/stores/cartStore.ts',
  /if \(!isVariantExplicitlyOrderable\(item\.product\.node, item\.variantId\)\)/,
  'central add-to-cart fail-closed guard',
);
requireMatch(
  'src/stores/cartStore.ts',
  /items\.some\(\(item\) => !isVariantExplicitlyOrderable\(item\.product\.node, item\.variantId\)\)/,
  'central checkout fail-closed guard',
);
requireMatch(
  'src/stores/cartStore.ts',
  /quantity > current\.quantity[\s\S]*!isVariantExplicitlyOrderable\(current\.product\.node, current\.variantId\)/,
  'cart quantity-increase fail-closed guard',
);
requireMatch(
  'src/components/ui/QuickViewModal.tsx',
  /selectedVariantIsOrderable = product\.node\.availableForSale === true[\s\S]*selectedVariant\?\.availableForSale === true/,
  'Quick View product-and-selected-variant guard',
);
requireMatch(
  'src/components/product/ProductInfo.tsx',
  /product\.availableForSale !== true[\s\S]*purchasableVariant\?\.node\.availableForSale !== true/,
  'product-page add-to-cart fail-closed guard',
);
requireMatch(
  'src/components/collections/CategoryListing.tsx',
  /product\.node\.availableForSale === true[\s\S]*edge\.node\.availableForSale === true/,
  'category product-and-variant inclusion evidence',
);
requireMatch(
  'src/pages/ShopifyCollection.tsx',
  /product\.node\.availableForSale === true[\s\S]*variant\.node\.availableForSale === true/,
  'Shopify collection product-and-variant inclusion evidence',
);
requireMatch(
  'src/hooks/useShopifyProducts.ts',
  /category === 'customizable'[\s\S]*isProductExplicitlyOrderable\(product\.node\)/,
  'customizable collection orderability evidence',
);
requireMatch(
  'src/components/product/CompleteTheLook.tsx',
  /product\.node\.availableForSale === true[\s\S]*variant\.node\.availableForSale === true/,
  'related-product recommendation orderability evidence',
);
requireMatch(
  'src/lib/commercialProductRanking.ts',
  /node\.availableForSale === true && variants\.length > 0/,
  'ranking availability score based on positive evidence',
);
requireMatch(
  'src/lib/commercialProductRanking.ts',
  /orderabilityTier: isExplicitlyOrderableProduct\(product\)/,
  'generic intent ranking orderability tier',
);
requireMatch(
  'src/lib/commercialProductRanking.ts',
  /candidate\.isOrderable && !currentBest\.isOrderable/,
  'commercial ranking orderable-first comparison',
);
requireMatch(
  'src/pages/ProductDetail.tsx',
  /product\?\.availableForSale === true[\s\S]*schemaVariant\?\.availableForSale === true/,
  'product schema availability based on positive product-and-selected-variant evidence',
);
requireMatch(
  'src/components/home/TrendingNow.tsx',
  /products\.filter\(\(\{ node \}\) => isProductExplicitlyOrderable\(node\)\)/,
  'orderable-only featured recommendation selection',
);

if (failures.length > 0) {
  console.error('Storefront orderability validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Storefront orderability validation passed (${sourceFiles.length} source files scanned).`);
