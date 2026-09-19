#!/usr/bin/env node
/**
 * Analyze each Kundan jewelry image via VLM.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ZAI_MOD = require('/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk');
const ZAI = ZAI_MOD.default || ZAI_MOD;

const IMG_DIR = '/tmp/kundan-images';

const PROMPT = `You are an expert in Indian bridal jewelry, specifically Kundan and stone (uncut polki) pieces. Analyze this jewelry product image and extract structured data.

Respond ONLY with valid JSON (no markdown, no explanation). Schema:
{
  "jewelry_type": "necklace | earrings | necklace set | maang tikka | matha patti | choker | hath phool | ring | kaleera | bajuband | nose ring | necklace with earrings | full bridal set",
  "stone_type": "kundan | stone | uncut polki | mixed | meenakari | pearl | kundan with stone",
  "color_primary": "Main color of stones (e.g., 'Red', 'Green', 'Blue', 'Multicolor', 'Pearl White', 'Clear')",
  "color_secondary": "Secondary/accent color if any, else null",
  "metal_color": "gold | silver | rose gold | antique gold | mixed",
  "is_mockup": true if image shows jewelry worn by a model OR styled on a person, false if product-only on plain background,
  "style_notes": "One sentence describing distinctive features (length, layering, drop style, embellishment pattern)",
  "occasion": "wedding | bridal | festive | party | mehendi | sangeet | reception",
  "seo_title": "SEO-optimized product title, 50-60 chars. Format: '<Stone Type> <Jewelry Type> for <Occasion>' — do NOT include brand name. Example: 'Kundan Bridal Necklace Set for Wedding'"
}`;

async function analyzeOne(zai, filename) {
  const filePath = path.join(IMG_DIR, filename);
  const imageData = await readFile(filePath);
  const base64Image = imageData.toString('base64');
  const mimeType = 'image/jpeg';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64Image}` },
              },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      });
      let raw = response.choices?.[0]?.message?.content || '';
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(raw);
      return { filename, analysis: parsed };
    } catch (err) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
        continue;
      }
      return { filename, analysis: null, error: err.message };
    }
  }
}

async function main() {
  const zai = await ZAI.create();
  const files = (await readFile('/tmp/kundan-unique.txt', 'utf8')).trim().split('\n');
  console.log(`Analyzing ${files.length} unique images via VLM...\n`);

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    try {
      const result = await analyzeOne(zai, filename);
      if (result.analysis) {
        const a = result.analysis;
        console.log(`  ✓ [${i+1}/${files.length}] ${filename.slice(0, 12)}...: ${a.jewelry_type} | ${a.stone_type} | ${a.color_primary} | mockup=${a.is_mockup}`);
      } else {
        console.log(`  ✗ [${i+1}/${files.length}] ${filename.slice(0, 12)}...: ${result.error}`);
      }
      results.push(result);
      if (i < files.length - 1) await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.log(`  ✗ [${i+1}/${files.length}] ${filename.slice(0, 12)}...: ${err.message}`);
      results.push({ filename, analysis: null, error: err.message });
    }
  }

  await writeFile('/tmp/kundan-analysis.json', JSON.stringify(results, null, 2));
  console.log(`\nSaved analysis for ${results.length} images to /tmp/kundan-analysis.json`);
  const ok = results.filter(r => r.analysis).length;
  const failed = results.filter(r => !r.analysis).length;
  console.log(`  Success: ${ok} | Failed: ${failed}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
