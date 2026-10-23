import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getVariantReferencePrice } from '../src/lib/variantReferencePrice.ts';

const money = amount => ({ amount, currencyCode: 'USD' });
const sizes = ['32', '34', '36', '38', '40', '42', '44', '46'];
const productFor = (handle, base, stitched, reference) => {
  const variants = [
    { title: 'Unstitched (Fabric Only) / Fabric Only', stitching: 'Unstitched (Fabric Only)', size: 'Fabric Only', price: base, reference },
    ...sizes.map(size => ({ title: `Standard Stitched / ${size}`, stitching: 'Standard Stitched', size, price: stitched })),
    { title: 'Custom Stitched / Custom Fit', stitching: 'Custom Stitched', size: 'Custom Fit', price: (Number(base) + 44).toFixed(2) },
  ];
  return {
    id: `gid://shopify/Product/${handle}`, handle, title: handle, productType: 'Lehenga Choli',
    description: '', tags: [], images: { edges: [] },
    priceRange: { minVariantPrice: money(base) },
    compareAtPriceRange: { minVariantPrice: money(reference), maxVariantPrice: money(reference) },
    options: [{ name: 'Stitching', values: ['Unstitched (Fabric Only)', 'Standard Stitched', 'Custom Stitched'] },
      { name: 'Size', values: ['Fabric Only', ...sizes, 'Custom Fit'] }],
    variants: { edges: variants.map((variant, index) => ({ node: {
      id: `gid://shopify/ProductVariant/${index + 100}`, title: variant.title,
      sku: `fixture-${index}`, availableForSale: true,
      price: money(variant.price), compareAtPrice: variant.reference ? money(variant.reference) : null,
      selectedOptions: [{ name: 'Stitching', value: variant.stitching }, { name: 'Size', value: variant.size }],
    } })) },
  };
};

const result = await build({
  entryPoints: [fileURLToPath(new URL('../src/components/product/ProductInfo.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', packages: 'external',
  external: ['react', 'react/jsx-runtime'],
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) }, define: { 'import.meta.env': '{}' },
  plugins: [{ name: 'reference-price-render-state', setup(builder) {
    builder.onResolve({ filter: /^(?:@\/stores\/(?:cartStore|wishlistStore)|@\/hooks\/useShopifyProduct|react-router-dom)$/ }, args => ({ path: args.path, namespace: 'render-state' }));
    builder.onLoad({ filter: /.*/, namespace: 'render-state' }, ({ path }) => ({ contents:
      path.endsWith('cartStore') ? 'export const useCartStore = select => select({ addItem() {}, openCart() {} });'
      : path.endsWith('wishlistStore') ? 'export const useWishlistStore = select => select({ toggleItem() {}, isInWishlist: () => false });'
      : path.endsWith('useShopifyProduct') ? 'export const useShopifyProduct = () => ({ product: null });'
      : 'import { createElement } from "react"; export const useSearchParams = () => [new URLSearchParams(globalThis.__referencePriceSearch)]; export const Link = ({to, children, ...props}) => createElement("a", {...props, href: to}, children);', loader: 'js' }));
  } }],
});
const module = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
const renderProduct = (product, id) => {
  globalThis.__referencePriceSearch = id ? `variant=${encodeURIComponent(id)}` : '';
  return renderToStaticMarkup(createElement(module.exports.ProductInfo, { product }));
};

test('all sixteen affected stitched offers render their unchanged price with no inherited discount', () => {
  for (const product of [
    productFor('green-organza-border-embroidered-lehenga-choli', '103.25', '132.25', '132.37'),
    productFor('coral-red-silk-printed-lehenga-choli', '139.08', '168.08', '178.32'),
  ]) {
    const before = JSON.stringify(product);
    for (const { node } of product.variants.edges.slice(1, 9)) {
      // Merchant links use the numeric tail, while some internal links use a GID.
      for (const id of [node.id, node.id.split('/').at(-1)]) {
        const html = renderProduct(product, id);
        assert.match(html, new RegExp(node.price.amount.replace('.', '\\.')));
        assert.doesNotMatch(html, /line-through|% off|You save/);
      }
    }
    assert.equal(JSON.stringify(product), before, 'catalog pricing is never mutated');
  }
});

test('the genuine unstitched discount survives separate selected-variant and default renders', () => {
  const product = productFor('green-organza-border-embroidered-lehenga-choli', '103.25', '132.25', '132.37');
  const [unstitched, stitched] = product.variants.edges.map(edge => edge.node);
  for (const id of [undefined, unstitched.id, stitched.id, unstitched.id, 'not-a-variant']) {
    const html = renderProduct(product, id);
    if (id === stitched.id) assert.doesNotMatch(html, /line-through|You save/);
    else {
      assert.match(html, /line-through/);
      assert.match(html, /132\.37/);
      assert.match(html, /103\.25/);
      assert.match(html, /22% off/);
    }
  }
});

test('missing, invalid, wrong-currency and optional-service reference prices are suppressed', () => {
  const variant = { price: money('100.00'), compareAtPrice: money('125.00') };
  assert.deepEqual(getVariantReferencePrice(variant), money('125.00'));
  assert.equal(getVariantReferencePrice(null), null);
  for (const compareAtPrice of [null, money('100'), money('99'), money('NaN'), money('Infinity'), { amount: '125', currencyCode: 'GBP' }]) {
    assert.equal(getVariantReferencePrice({ ...variant, compareAtPrice }), null);
  }
  assert.equal(getVariantReferencePrice(variant, money('110.00')), null);
  assert.equal(getVariantReferencePrice(variant, { amount: '100', currencyCode: 'GBP' }), null);
  assert.equal(getVariantReferencePrice({ ...variant, price: money('NaN') }), null);
  assert.equal(getVariantReferencePrice({ ...variant, price: money('0') }), null);
});

test('product metadata uses the selected variant price and only its valid reference price', () => {
  const source = readFileSync(new URL('../src/pages/ProductDetail.tsx', import.meta.url), 'utf8');
  assert.match(source, /node\.id === selectedVariantId/);
  assert.match(source, /variantSelection\?\.key === selectionKey \? variantSelection\.id : null/);
  assert.match(source, /key=\{`\$\{product\.id\}:\$\{selectionKey\}`\}/);
  assert.match(source, /node\.id === requestedVariantId \|\| node\.id\.endsWith/);
  assert.match(source, /const schemaReferencePrice = getVariantReferencePrice\(schemaVariant\)/);
  assert.match(source, /price: schemaVariant\?\.price\.amount/);
  assert.match(source, /originalPrice: schemaReferencePrice\?\.amount/);
  assert.match(source, /onSelectedVariantChange=\{handleSelectedVariantChange\}/);
  assert.doesNotMatch(source, /originalPrice: product\.compareAtPriceRange/);
});
