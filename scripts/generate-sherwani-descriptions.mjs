#!/usr/bin/env node
/**
 * Generate rich Body HTML descriptions for each sherwani product via LLM,
 * using the VLM-extracted attributes (color, fabric, embroidery) as input.
 *
 * Output: /tmp/sherwani-final.json (combined: products + VLM analysis + LLM description)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ZAI_MOD = require('/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk');
const ZAI = ZAI_MOD.default || ZAI_MOD;

const analysis = JSON.parse(await readFile('/tmp/sherwani-analysis.json', 'utf8'));

const SYSTEM_PROMPT = `You are an expert SEO copywriter for LuxeMia, a luxury Indian ethnic wear store for menswear, shipping to USA, Canada, and Australia. Write Shopify product Body HTML for sherwanis that:

1. Opens with a compelling 2-3 sentence narrative paragraph (no marketing fluff like "stunning" or "exquisite" — be specific)
2. Has an "Why You'll Love This" section with 5 bullet points: fabric, color, embroidery, occasion, craftsmanship
3. Has a "Styling Suggestions" paragraph (2-3 sentences) with specific accessory / footwear / turban recommendations
4. Has an "FAQ" section with 3 Q&A pairs covering: sizing, care, delivery time
5. Closes with "The LuxeMia Promise" paragraph (2 sentences, mention hand-selected quality and worldwide shipping)

Use clean HTML: <p>, <h3>, <ul><li>, <strong>. No markdown. No CSS. Length: 400-600 words total.

Return ONLY the HTML, no explanation, no markdown fences.`;

function buildUserPrompt(item) {
  const a = item.analysis;
  return `Write the Body HTML for this sherwani product:

- Color: ${a.color_primary}${a.color_secondary ? ` (accent: ${a.color_secondary})` : ''}
- Fabric: ${a.fabric}
- Embroidery: ${a.embroidery}
- Style notes: ${a.style_notes || 'Classic sherwani silhouette'}
- Collection: Out Luk Vol 144 — Pure Heavy Armani Embroidery with Sequence Collection
- Vendor: LuxeMia
- Price range: $249-$349 USD (premium menswear)
- Target occasions: Wedding (groom, groomsmen, brother of groom), Reception, Engagement, Sangeet
- Target audience: NRI grooms and wedding party members in USA, Canada, Australia

Return ONLY the HTML.`;
}

async function generateDescription(zai, item) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(item) },
        ],
        thinking: { type: 'disabled' },
      });
      let html = completion.choices?.[0]?.message?.content || '';
      // Strip markdown fences if present
      html = html.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return html;
    } catch (err) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  const zai = await ZAI.create();
  console.log(`Generating descriptions for ${analysis.length} sherwanis...\n`);

  for (const item of analysis) {
    try {
      const html = await generateDescription(zai, item);
      item.body_html = html;
      item.seo_description = generateSeoDescription(item);
      console.log(`  ✓ ${item.sku}: ${item.analysis.seo_title}`);
    } catch (err) {
      item.body_html = '';
      item.seo_description = '';
      console.log(`  ✗ ${item.sku}: ${err.message}`);
    }
  }

  await writeFile('/tmp/sherwani-final.json', JSON.stringify(analysis, null, 2));
  console.log(`\nSaved to /tmp/sherwani-final.json`);
}

function generateSeoDescription(item) {
  const a = item.analysis;
  // Generate SEO meta description under 155 chars
  const base = `Shop this ${a.color_primary.toLowerCase()} ${a.fabric.toLowerCase()} sherwani with ${a.embroidery.toLowerCase().replace(' work', '')}. Perfect for weddings & receptions. Free shipping to USA, Canada, Australia.`;
  if (base.length <= 155) return base;
  // Trim if over
  return base.slice(0, 152).trimEnd() + '…';
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
