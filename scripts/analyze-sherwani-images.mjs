#!/usr/bin/env node
/**
 * Analyze each sherwani product image via VLM and extract structured data:
 * - Color (primary + secondary)
 * - Fabric description
 * - Embroidery/work description
 * - Style notes
 * - SEO-friendly product title
 *
 * Output: /tmp/sherwani-analysis.json
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ZAI_MOD = require('/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk');
const ZAI = ZAI_MOD.default || ZAI_MOD;

const products = JSON.parse(await readFile('/tmp/sherwani-products.json', 'utf8'));

const PROMPT = `You are an expert in Indian ethnic menswear, specifically sherwanis. Analyze this sherwani product image and extract structured data.

Respond ONLY with valid JSON (no markdown, no explanation). Schema:
{
  "color_primary": "Main color (e.g., 'Maroon', 'Royal Blue', 'Black', 'Ivory', 'Emerald Green', 'Wine', 'Champagne', 'Grey')",
  "color_secondary": "Secondary/accent color if any, else null",
  "fabric": "Likely fabric (e.g., 'Armani Silk', 'Velvet', 'Brocade', 'Raw Silk', 'Georgette')",
  "embroidery": "Type of embroidery/work visible (e.g., 'Zardozi', 'Sequence Work', 'Resham Thread', 'Stone Setting', 'Aari')",
  "style_notes": "One sentence describing distinctive features (neckline, buttons, hem, dupatta if visible)",
  "seo_title": "SEO-optimized product title, 50-60 chars, format: '<Color> <Fabric> Sherwani with <Embroidery>' — do NOT include brand name"
}`;

async function analyzeOne(zai, product) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: product.image_url } },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      });
      let raw = response.choices?.[0]?.message?.content || '';
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(raw);
      return { ...product, analysis: parsed };
    } catch (err) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        continue;
      }
      return { ...product, analysis: null, error: err.message };
    }
  }
}

async function main() {
  const zai = await ZAI.create();
  console.log(`Analyzing ${products.length} sherwani images via VLM...\n`);

  const results = [];
  // Process in batches of 3 parallel
  const BATCH = 3;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const promises = batch.map(p =>
      analyzeOne(zai, p).then(r => {
        if (r.analysis) {
          console.log(`  ✓ ${p.sku}: ${r.analysis.seo_title}`);
        } else {
          console.log(`  ✗ ${p.sku}: ${r.error}`);
        }
        return r;
      })
    );
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  await writeFile('/tmp/sherwani-analysis.json', JSON.stringify(results, null, 2));
  console.log(`\nSaved analysis for ${results.length} products to /tmp/sherwani-analysis.json`);
  const ok = results.filter(r => r.analysis).length;
  const failed = results.filter(r => !r.analysis).length;
  console.log(`  Success: ${ok} | Failed: ${failed}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
