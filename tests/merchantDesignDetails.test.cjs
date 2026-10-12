const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const esbuild = require('esbuild');
const result = esbuild.buildSync({entryPoints: [path.join(__dirname, '../src/lib/merchantDesignDetails.ts')], bundle: true, platform: 'node', format: 'cjs', write: false});
const loaded = {exports: {}};
new Function('module', 'exports', result.outputFiles[0].text)(loaded, loaded.exports);
const {getTitleDesignDetails} = loaded.exports;

test('retains explicitly named decoration when structured work tags are absent', () => {
  assert.equal(getTitleDesignDetails('Red Georgette Bridal Lehenga with Heavy Gold Zari Embroidery'), 'Zari work; Embroidery');
  assert.equal(getTitleDesignDetails('Turquoise Lace Work Rayon Lehenga Choli'), 'Lace detailing');
  assert.equal(getTitleDesignDetails('Blue Cotton Mirror Work Lehenga Choli'), 'Mirror work');
});
test('does not invent decoration from garment type, fabric or occasion', () => {
  assert.equal(getTitleDesignDetails('Olive Green Banarasi Lehenga Choli with Dupatta'), '');
  assert.equal(getTitleDesignDetails('Silk Wedding Saree'), '');
  assert.equal(getTitleDesignDetails(''), '');
});
