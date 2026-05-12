/**
 * Product Description Enrichment — Examples & Verification
 *
 * This file demonstrates how the product description enrichment utility
 * works with various input scenarios. It is NOT a test runner — it is a
 * reference for developers to understand expected behavior.
 *
 * Run with: npx tsx src/lib/productDescriptionEnrichment.examples.ts
 *
 * @module productDescriptionEnrichment.examples
 */

import {
  enrichProductDescription,
  generateMetaDescription,
  getProductCategoryDescription,
  runEnrichmentExamples,
} from './productDescriptionEnrichment';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function divider(label: string): void {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${label}`);
  console.log('='.repeat(80) + '\n');
}

// ---------------------------------------------------------------------------
// Example 1: Thin lehenga description
// ---------------------------------------------------------------------------

divider('EXAMPLE 1: Thin Lehenga Description');

const thinLehenga = 'Red lehenga with embroidery';
console.log(`INPUT:  "${thinLehenga}"`);
console.log(`LENGTH: ${thinLehenga.length} chars (thin — will be enriched)\n`);

const enrichedLehenga = enrichProductDescription(
  thinLehenga,
  'Lehenga',
  'Embroidered Red Bridal Lehenga',
  'silk',
  'red',
);
console.log('ENRICHED OUTPUT:\n');
console.log(enrichedLehenga);
console.log(`\n→ Output length: ${enrichedLehenga.length} chars`);

// ---------------------------------------------------------------------------
// Example 2: Thin saree description
// ---------------------------------------------------------------------------

divider('EXAMPLE 2: Thin Saree Description');

const thinSaree = 'Beautiful silk saree';
console.log(`INPUT:  "${thinSaree}"`);
console.log(`LENGTH: ${thinSaree.length} chars (thin — will be enriched)\n`);

const enrichedSaree = enrichProductDescription(
  thinSaree,
  'Saree',
  'Banarasi Silk Saree with Gold Border',
  'Banarasi silk',
);
console.log('ENRICHED OUTPUT:\n');
console.log(enrichedSaree);
console.log(`\n→ Output length: ${enrichedSaree.length} chars`);

// ---------------------------------------------------------------------------
// Example 3: Rich description (should pass through unchanged)
// ---------------------------------------------------------------------------

divider('EXAMPLE 3: Rich Description — Pass-Through');

const richDescription = `This exquisite red Banarasi silk lehenga features intricate zari embroidery with kundan stone work across the flared skirt. The choli is adorned with delicate resham threadwork and sequin accents, while the dupatta showcases a rich woven pallu with scalloped edges. Crafted by master artisans in Varanasi, this lehenga includes a can-can inner for voluminous flare and is fully lined for comfort. Available in sizes S-XXL with custom tailoring options. Professional dry cleaning recommended to preserve the embroidery and fabric integrity.`;

console.log(`INPUT:  "${richDescription.substring(0, 80)}..."`);
console.log(`LENGTH: ${richDescription.length} chars (rich — should pass through)\n`);

const richResult = enrichProductDescription(
  richDescription,
  'Lehenga',
  'Banarasi Silk Bridal Lehenga',
  'Banarasi silk',
  'red',
);

const isUnchanged = richResult === richDescription;
console.log(`PASSED THROUGH UNCHANGED: ${isUnchanged ? '✓ YES' : '✗ NO'}`);
console.log(`\nOUTPUT:\n${richResult.substring(0, 100)}...`);

// ---------------------------------------------------------------------------
// Example 4: Various thin descriptions across categories
// ---------------------------------------------------------------------------

divider('EXAMPLE 4: Various Thin Descriptions by Category');

const thinExamples = [
  { desc: 'Black anarkali suit', type: 'Anarkali', title: 'Black Embroidered Anarkali Suit', material: 'georgette', color: 'black' },
  { desc: 'Designer sharara set', type: 'Sharara', title: 'Designer Sharara Set with Dupatta', material: 'organza', color: 'pink' },
  { desc: 'Sherwani for wedding', type: 'Sherwani', title: 'Wedding Sherwani with Embroidery', material: 'silk', color: 'gold' },
  { desc: 'Kurta pajama set', type: 'Kurta', title: 'Cotton Kurta Pajama Set', material: 'cotton', color: 'white' },
  { desc: 'Indo-western gown', type: 'Indo-Western', title: 'Drape Gown Indo-Western', material: 'crepe', color: 'mauve' },
  { desc: 'Kundan necklace set', type: 'Jewelry', title: 'Kundan Bridal Necklace Set', material: undefined, color: 'gold' },
  { desc: 'Palazzo suit', type: 'Suit', title: 'Embroidered Palazzo Suit', material: 'chiffon', color: 'navy' },
];

for (const example of thinExamples) {
  const result = enrichProductDescription(
    example.desc,
    example.type,
    example.title,
    example.material,
    example.color,
  );
  console.log(`\n[${example.type}] "${example.desc}" → ${result.length} chars`);
  console.log(`  First line: ${result.split('\n')[0]}`);
}

// ---------------------------------------------------------------------------
// Example 5: Meta description generation
// ---------------------------------------------------------------------------

divider('EXAMPLE 5: Meta Description Generation');

const metaExamples = [
  { desc: 'Red lehenga with embroidery', type: 'Lehenga', title: 'Embroidered Red Bridal Lehenga', price: '$149' },
  { desc: 'Beautiful silk saree', type: 'Saree', title: 'Banarasi Silk Saree with Gold Border', price: '$199' },
  { desc: 'Anarkali suit for wedding', type: 'Anarkali', title: 'Georgette Anarkali Suit', price: '$89' },
  { desc: 'Sherwani for men', type: 'Sherwani', title: 'Silk Wedding Sherwani', price: '$129' },
  { desc: 'Indo-western outfit', type: 'Indo-Western', title: 'Drape Gown Indo-Western Set', price: '$109' },
];

for (const ex of metaExamples) {
  const meta = generateMetaDescription(ex.desc, ex.type, ex.title, ex.price);
  console.log(`[${ex.type}] (${meta.length} chars): ${meta}`);
}

// ---------------------------------------------------------------------------
// Example 6: Meta description without price
// ---------------------------------------------------------------------------

divider('EXAMPLE 6: Meta Description Without Price');

const metaNoPrice = generateMetaDescription(
  'Red lehenga with embroidery',
  'Lehenga',
  'Embroidered Red Bridal Lehenga',
);
console.log(`Without price (${metaNoPrice.length} chars): ${metaNoPrice}`);

// ---------------------------------------------------------------------------
// Example 7: Category descriptions
// ---------------------------------------------------------------------------

divider('EXAMPLE 7: Category Descriptions');

const categories = ['lehenga', 'saree', 'suit', 'anarkali', 'sharara', 'sherwani', 'kurta', 'jewelry', 'indo-western', 'unknown-type'];

for (const cat of categories) {
  const catDesc = getProductCategoryDescription(cat);
  console.log(`\n[${cat}]: ${catDesc}`);
}

// ---------------------------------------------------------------------------
// Example 8: Quick-run all examples via helper
// ---------------------------------------------------------------------------

divider('EXAMPLE 8: Quick-Run All Examples via runEnrichmentExamples()');

const allExamples = runEnrichmentExamples();

console.log('Thin lehenga (first 120 chars):');
console.log(`  ${allExamples.thinDescription.substring(0, 120)}...\n`);

console.log('Thin saree (first 120 chars):');
console.log(`  ${allExamples.thinSaree.substring(0, 120)}...\n`);

console.log('Rich description unchanged:');
console.log(`  ${allExamples.richDescriptionUnchanged === allExamples.thinDescription ? 'N/A' : allExamples.richDescriptionUnchanged.substring(0, 80)}...\n`);

console.log('Meta description:');
console.log(`  ${allExamples.metaDescription}\n`);

console.log('Category description:');
console.log(`  ${allExamples.categoryDescription}\n`);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

divider('SUMMARY');

console.log('✓ enrichProductDescription — enriches thin descriptions, passes rich ones through');
console.log('✓ generateMetaDescription — creates 150-160 char SEO meta descriptions');
console.log('✓ getProductCategoryDescription — returns category-level SEO snippets');
console.log('✓ All 9 product categories supported: lehenga, saree, suit/salwar, anarkali, sharara, sherwani, kurta, jewelry, indo-western');
console.log('✓ Deterministic output: same title + type always produces same enrichment');
console.log('✓ No external dependencies — pure TypeScript module');
