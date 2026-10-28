const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');
const root = path.resolve(__dirname, '..');

test('merchandising build rewrite preserves approved alteration copy and is idempotent', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'luxemia-alteration-rewrite-'));
  try {
    for (const directory of ['src', 'scripts']) fs.cpSync(path.join(root, directory), path.join(fixture, directory), { recursive: true });
    const read = relative => fs.readFileSync(path.join(fixture, relative), 'utf8');
    // Simulate obsolete copy restored by earlier build migrations. The finalizer
    // must repair it, not merely pass when given already-correct source.
    const readyPath = path.join(fixture, 'src/pages/ReadyToShip.tsx');
    fs.writeFileSync(readyPath, read('src/pages/ReadyToShip.tsx').replace(/Items are supplied semi-stitched or ready stitched[^<\n]*/, 'Every purchasable LuxeMia catalog item is Ready to Ship unless explicitly made to order.'));
    const cardPath = path.join(fixture, 'src/components/ui/ProductCard.tsx');
    fs.writeFileSync(cardPath, read('src/components/ui/ProductCard.tsx').replace("Fit confirmation required' : 'Available to order'", "Made to Order' : 'Ready to Ship'"));

    const surfaces = ['src/pages/ReadyToShip.tsx', 'src/pages/ProductDetail.tsx', 'src/components/product/ProductInfo.tsx', 'src/components/product/DeliveryEstimate.tsx', 'src/components/ui/ProductCard.tsx', 'scripts/prerender.js', 'scripts/validate-trust-source-of-truth.cjs', 'scripts/validate-built-trust.cjs'];
    let first;
    for (let pass = 0; pass < 2; pass++) {
      execFileSync(process.execPath, ['scripts/finalize-competitor-merchandising.cjs'], { cwd: fixture, stdio: 'pipe' });
      for (const relative of ['src/pages/ReadyToShip.tsx', 'scripts/prerender.js']) {
        const source = read(relative);
        assert.match(source, /Items are supplied semi-stitched or ready stitched/);
        assert.match(source, /12–18 business days total/);
        assert.match(source, /15–21 business days total/);
        assert.doesNotMatch(source, /Every purchasable LuxeMia catalog item is Ready to Ship|Fully custom products are shown separately as Made to Order/);
      }
      assert.match(read('src/components/product/ProductInfo.tsx'), /alterationShippingTimingNotice\(shipsWithinDays\)/);
      assert.match(read('src/components/product/DeliveryEstimate.tsx'), /alterationShippingTimingNotice\(shipsWithinDays\)/);
      assert.match(read('src/pages/ProductDetail.tsx'), /productShippingTimingNotice\(productShipsWithinDays\)/);
      assert.match(read('src/components/ui/ProductCard.tsx'), /Fit confirmation required' : 'Available to order'/);
      for (const relative of ['scripts/validate-trust-source-of-truth.cjs', 'scripts/validate-built-trust.cjs']) {
        assert.match(read(relative), /Items are supplied semi-stitched or ready stitched/);
        assert.doesNotMatch(read(relative), /Every purchasable LuxeMia catalog item is Ready to Ship/);
      }
      const current = Object.fromEntries(surfaces.map(relative => [relative, read(relative)]));
      if (first) assert.deepEqual(current, first, 'rewriter must not drift after repeated builds');
      first = current;
    }
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
});
