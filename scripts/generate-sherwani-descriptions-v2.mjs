#!/usr/bin/env node
/**
 * Regenerate sherwani Body HTML with stronger SEO + AI-search optimization.
 *
 * Key changes from previous version:
 * - Adds direct-answer paragraph at the top (AI search engines extract these)
 * - Includes natural-language question phrases ("What to wear to...")
 * - Weaves mid-tail + long-tail keywords naturally into body
 * - Adds a "Perfect For" section listing occasions explicitly
 * - FAQ section uses question phrases people actually type into Google/Bing/ChatGPT
 * - Includes color + fabric + embroidery + occasion in opening sentence (semantic SEO)
 *
 * Output: /tmp/sherwani-final-v2.json (with occasion + new body_html + new seo fields)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ZAI_MOD = require('/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk');
const ZAI = ZAI_MOD.default || ZAI_MOD;

const analysis = JSON.parse(await readFile('/tmp/sherwani-final.json', 'utf8'));

// Assign occasion per product (based on color + fabric conventions)
const OCCASIONS = {
  '658070': ['Wedding', 'Reception'],         // Black
  '658071': ['Wedding', 'Reception'],         // Navy Blue
  '658077': ['Groom Wedding', 'Engagement'],  // Ivory Raw Silk Zardozi
  '658078': ['Reception', 'Sangeet'],         // Black (disambiguated)
  '658088': ['Engagement', 'Reception'],      // Grey
  '658089': ['Groom Wedding', 'Mehndi'],      // Ivory Raw Silk Resham
  '658091': ['Wedding', 'Sangeet'],           // Royal Blue
  '658063': ['Engagement', 'Reception'],      // Ivory Raw Silk Zardozi (disambiguated)
  '658067': ['Groom Wedding', 'Reception'],   // Ivory Brocade Zardozi
  '658068': ['Wedding', 'Reception'],         // Wine
  '658055': ['Groom Wedding', 'Haldi'],       // Ivory Raw Silk Resham (disambiguated)
};

const SYSTEM_PROMPT = `You are an expert SEO + AI-search content writer for LuxeMia, a luxury Indian ethnic wear store shipping to USA, Canada, and Australia. Write Shopify product Body HTML for sherwanis that ranks on Google, Bing, AND gets cited by AI search engines (ChatGPT, Perplexity, Google AI Overviews, Bing Copilot).

AI-SEARCH OPTIMIZATION RULES (different from traditional SEO):
1. Open with a DIRECT ANSWER paragraph (2-3 sentences) that AI engines can extract verbatim. Format: "The <color> <fabric> sherwani with <embroidery> is designed for <occasion>. <One specific reason to choose it.> <One specific detail about craftsmanship.>"
2. Use natural conversational phrases people actually type into ChatGPT/voice search ("What to wear to...", "Best sherwani for...", "How to style...")
3. Include semantic variations of keywords (sherwani → indo-persian coat → wedding sherwani → groom's outfit)
4. Answer questions directly in the body (don't make AI engines infer)

TRADITIONAL SEO RULES:
1. Mid-tail keywords in H3 headings (e.g., "Why Grooms Choose Ivory Raw Silk Sherwanis")
2. Long-tail keywords woven naturally ("ivory raw silk sherwani with zardozi for indian wedding")
3. Include color + fabric + embroidery + occasion + target audience in first 100 words
4. Use <strong> on key phrases (color, fabric, embroidery, occasion) once each
5. Avoid keyword stuffing — read naturally

STRUCTURE (use exactly these H3 sections in this order):
1. Opening direct-answer paragraph (no heading) — 2-3 sentences
2. <h3>Why Grooms Choose <Color> <Fabric> Sherwanis</h3> — 2-3 sentence paragraph with mid-tail keywords
3. <h3>What Makes This <Embroidery> Sherwani Special</h3> — paragraph on craftsmanship
4. <h3>Perfect For These Occasions</h3> — <ul> with 3-4 occasion bullets
5. <h3>How to Style This <Color> Sherwani</h3> — paragraph with specific accessory / footwear / turban / stole recommendations
6. <h3>Sherwani Sizing, Care & Shipping</h3> — <ul> with 3 bullets (sizing, care, shipping)
7. <h3>Frequently Asked Questions</h3> — 3 Q&A pairs using natural-language questions like "What size sherwani should I order from USA?" / "How do I care for raw silk sherwani with zardozi?" / "How long does shipping take to USA, Canada, Australia?"
8. <h3>The LuxeMia Promise</h3> — 2-sentence closing on hand-selected quality + worldwide shipping

Length: 500-700 words total. Use clean HTML: <p>, <h3>, <ul><li>, <strong>. No markdown. No CSS.

Return ONLY the HTML, no explanation, no markdown fences.`;

function buildUserPrompt(item) {
  const a = item.analysis;
  const occasions = item.occasions;
  return `Write the Body HTML for this sherwani product:

PRODUCT ATTRIBUTES (from VLM image analysis):
- Color: ${a.color_primary}${a.color_secondary ? ` (accent: ${a.color_secondary})` : ''}
- Fabric: ${a.fabric}
- Embroidery: ${a.embroidery}
- Style notes: ${a.style_notes || 'Classic sherwani silhouette with intricate detailing'}

COLLECTION & POSITIONING:
- Collection: Out Luk Vol 144 — Pure Heavy Armani Embroidery with Sequence Collection
- Vendor: LuxeMia (luxury Indian ethnic wear, based in Philadelphia, PA)
- Price: $310 USD (compare at $399)
- Target occasions: ${occasions.join(', ')}
- Target audience: NRI grooms and wedding party members in USA, Canada, Australia
- Shipping: Free over $350 (so this qualifies), 7-10 business days via DHL/USPS/UPS

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

function generateSeoTitle(item) {
  const a = item.analysis;
  const occasions = item.occasions;
  // Try formats and pick the one ≤60 chars:
  // Format 1: "<Color> <Fabric> Sherwani with <Embroidery> for <Occasion>"
  // Format 2: "<Color> <Fabric> Sherwani for <Occasion>"
  // Format 3: "<Color> <Fabric> Sherwani <Embroidery>"
  const occ1 = occasions[0];
  const candidates = [
    `${a.color_primary} ${a.fabric} Sherwani with ${a.embroidery} for ${occ1}`,
    `${a.color_primary} ${a.fabric} Sherwani for ${occ1} Groom`,
    `${a.color_primary} ${a.fabric} Sherwani with ${a.embroidery}`,
    `${a.color_primary} ${a.fabric} Sherwani for ${occ1}`,
  ];
  for (const c of candidates) {
    if (c.length <= 60) return c;
  }
  // Fallback: shortest candidate
  return candidates.sort((a, b) => a.length - b.length)[0];
}

function generateSeoDescription(item) {
  const a = item.analysis;
  const occ = item.occasions[0];
  // Mid-tail + long-tail keywords, ≤155 chars
  const candidates = [
    `Shop this ${a.color_primary.toLowerCase()} ${a.fabric.toLowerCase()} sherwani with ${a.embroidery.toLowerCase().replace(' work', '')} for ${occ.toLowerCase()}. Perfect for grooms. Free shipping USA, Canada, Australia.`,
    `${a.color_primary} ${a.fabric} sherwani with ${a.embroidery.toLowerCase()} for ${occ.toLowerCase()} — made for the modern groom. Free shipping over $350 to USA, Canada & Australia.`,
    `Buy ${a.color_primary.toLowerCase()} ${a.fabric.toLowerCase()} sherwani with ${a.embroidery.toLowerCase()} for ${occ.toLowerCase()} grooms. Premium menswear. Free shipping to USA, Canada, Australia.`,
  ];
  for (const c of candidates) {
    if (c.length <= 155) return c;
  }
  return candidates[0].slice(0, 152).trimEnd() + '…';
}

async function main() {
  const zai = await ZAI.create();
  console.log(`Regenerating ${analysis.length} sherwani descriptions with SEO + AI-search optimization...\n`);

  // Attach occasions to each product
  for (const item of analysis) {
    item.occasions = OCCASIONS[item.sku] || ['Wedding', 'Reception'];
    item.seo_title = generateSeoTitle(item);
    item.seo_description = generateSeoDescription(item);
  }

  // Disambiguate any remaining duplicate SEO titles by appending occasion #2
  const titleCounts = {};
  for (const item of analysis) {
    titleCounts[item.seo_title] = (titleCounts[item.seo_title] || 0) + 1;
  }
  const seen = {};
  for (const item of analysis) {
    if (titleCounts[item.seo_title] > 1) {
      seen[item.seo_title] = (seen[item.seo_title] || 0) + 1;
      if (seen[item.seo_title] > 1) {
        // Append 2nd occasion
        const occ2 = item.occasions[1] || 'Groom';
        const candidate = `${item.seo_title.replace(/ for .+$/, '')} for ${occ2}`;
        if (candidate.length <= 60) {
          item.seo_title = candidate;
        } else {
          item.seo_title = `${item.seo_title.split(' for ')[0]} ${item.sku}`;
        }
      }
    }
  }

  // Generate body HTML
  for (const item of analysis) {
    try {
      const html = await generateDescription(zai, item);
      item.body_html = html;
      console.log(`  ✓ ${item.sku}: ${item.seo_title}`);
    } catch (err) {
      item.body_html = '';
      console.log(`  ✗ ${item.sku}: ${err.message}`);
    }
  }

  await writeFile('/tmp/sherwani-final-v2.json', JSON.stringify(analysis, null, 2));
  console.log(`\nSaved to /tmp/sherwani-final-v2.json`);
  console.log(`\n=== Final SEO titles ===`);
  for (const item of analysis) {
    console.log(`  ${item.sku} (${item.seo_title.length} chars): ${item.seo_title}`);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
