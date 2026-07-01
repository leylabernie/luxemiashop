#!/usr/bin/env node
/**
 * Generate SEO + AI-search optimized Body HTML + SEO Title + SEO Description
 * for each wedding saree product via LLM.
 *
 * Input: /tmp/wedding-sarees-products.json
 * Output: /tmp/wedding-sarees-final.json
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ZAI_MOD = require('/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk');
const ZAI = ZAI_MOD.default || ZAI_MOD;

const products = JSON.parse(await readFile('/tmp/wedding-sarees-products.json', 'utf8'));

const SYSTEM_PROMPT = `You are an expert SEO + AI-search content writer for LuxeMia, a luxury Indian ethnic wear store shipping to USA, Canada, and Australia. Write Shopify product Body HTML for wedding sarees that ranks on Google, Bing, AND gets cited by AI search engines (ChatGPT, Perplexity, Google AI Overviews, Bing Copilot).

AI-SEARCH OPTIMIZATION RULES:
1. Open with a DIRECT ANSWER paragraph (2-3 sentences) that AI engines can extract verbatim. Format: "The <color> <fabric> saree with <work> is designed for <occasion>. <One specific reason to choose it.> <One specific detail about craftsmanship.>"
2. Use natural conversational phrases people actually type into ChatGPT/voice search ("What to wear to...", "Best saree for...", "How to drape...")
3. Include semantic variations of keywords (saree → sarees → sari → wedding saree → bridal saree)
4. Answer questions directly in the body

TRADITIONAL SEO RULES:
1. Mid-tail keywords in H3 headings
2. Long-tail keywords woven naturally
3. Include color + fabric + work + occasion + audience in first 100 words
4. Use <strong> on key phrases once each
5. Avoid keyword stuffing

STRUCTURE (use exactly these H3 sections in this order):
1. Opening direct-answer paragraph (no heading) — 2-3 sentences
2. <h3>Why Brides Choose <Color> <Fabric> Sarees</h3> — 2-3 sentence paragraph
3. <h3>What Makes This <Work> Saree Special</h3> — paragraph on craftsmanship
4. <h3>Perfect For These Occasions</h3> — <ul> with 3-4 occasion bullets
5. <h3>How to Style This <Color> Saree</h3> — paragraph with specific blouse / jewelry / accessory recommendations
6. <h3>Saree Sizing, Care & Shipping</h3> — <ul> with 3 bullets
7. <h3>Frequently Asked Questions</h3> — 3 Q&A pairs using natural questions
8. <h3>The LuxeMia Promise</h3> — 2-sentence closing

Length: 500-700 words. Use clean HTML: <p>, <h3>, <ul><li>, <strong>. No markdown. No CSS.

Return ONLY the HTML, no explanation, no markdown fences.`;

function buildUserPrompt(p) {
  return `Write the Body HTML for this wedding saree product:

PRODUCT ATTRIBUTES:
- Color: ${p.color || 'unspecified'}
- Fabric: ${p.fabric || 'unspecified'}
- Work: ${p.work || 'embroidery'}
- Occasion: Wedding (primary) — also suitable for ${p.occasion || 'party wear'}
- Readymade: ${p.is_readymade ? 'Yes (pre-stitched blouse included)' : 'No (unstitched blouse piece included)'}

COLLECTION & POSITIONING:
- Collection: Wedding Sarees (curated for brides and wedding guests)
- Vendor: LuxeMia (luxury Indian ethnic wear, based in Philadelphia, PA)
- Price: $${Math.round((p.price_inr * 2) / 90)} USD (compare at $${Math.round((p.mrp_inr * 2) / 90)})
- Target occasions: Wedding, Reception, Engagement, Mehendi, Wedding Guest
- Target audience: NRI brides and wedding guests in USA, Canada, Australia
- Shipping: Free over $350, 7-10 business days via DHL/USPS/UPS

Return ONLY the HTML.`;
}

async function generateDescription(zai, p) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(p) },
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

function generateSeoTitle(p) {
  // Format: "<Color> <Fabric> Wedding Saree with <Work>" — ≤60 chars
  const candidates = [
    `${p.color} ${p.fabric} Wedding Saree with ${p.work}`,
    `${p.color} ${p.fabric} Saree for Wedding`,
    `${p.color} ${p.fabric} Wedding Saree`,
    `${p.color} Wedding Saree with ${p.work}`,
  ];
  for (const c of candidates) {
    if (c.length <= 60) return c;
  }
  return candidates.sort((a, b) => a.length - b.length)[0];
}

function generateSeoDescription(p) {
  const usdPrice = Math.round((p.price_inr * 2) / 90);
  const candidates = [
    `Shop this ${p.color.toLowerCase()} ${p.fabric.toLowerCase()} wedding saree with ${p.work.toLowerCase()} for brides. Handcrafted. Free shipping USA, Canada, Australia.`,
    `${p.color} ${p.fabric} saree with ${p.work.toLowerCase()} for weddings — handcrafted for the modern bride. Free shipping over $350 to USA, Canada & Australia.`,
    `Buy ${p.color.toLowerCase()} ${p.fabric.toLowerCase()} wedding saree with ${p.work.toLowerCase()} online. Premium ethnic wear for brides. Free shipping to USA, Canada, Australia.`,
  ];
  for (const c of candidates) {
    if (c.length <= 155) return c;
  }
  return candidates[0].slice(0, 152).trimEnd() + '…';
}

async function main() {
  const zai = await ZAI.create();
  console.log(`Generating SEO content for ${products.length} wedding sarees...\n`);

  // Override occasion to "Wedding" since this is the Wedding Sarees collection
  for (const p of products) {
    p.primary_occasion = 'Wedding';
    p.seo_title = generateSeoTitle(p);
    p.seo_description = generateSeoDescription(p);
  }

  // Disambiguate duplicate SEO titles by appending color context
  const titleCounts = {};
  for (const p of products) {
    titleCounts[p.seo_title] = (titleCounts[p.seo_title] || 0) + 1;
  }
  const seen = {};
  for (const p of products) {
    if (titleCounts[p.seo_title] > 1) {
      seen[p.seo_title] = (seen[p.seo_title] || 0) + 1;
      if (seen[p.seo_title] > 1) {
        // Append fabric to disambiguate
        const candidate = `${p.color} ${p.fabric} Wedding Saree ${p.work}`;
        if (candidate.length <= 60) {
          p.seo_title = candidate;
        } else {
          p.seo_title = `${p.seo_title} ${p.sku || ''}`.trim();
        }
      }
    }
  }

  // Generate body HTML — 3 concurrent
  const BATCH = 3;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const promises = batch.map(async p => {
      try {
        const html = await generateDescription(zai, p);
        p.body_html = html;
        console.log(`  ✓ ${p.sku || 'N/A'}: ${p.seo_title}`);
      } catch (err) {
        p.body_html = '';
        console.log(`  ✗ ${p.sku || 'N/A'}: ${err.message}`);
      }
      return p;
    });
    await Promise.all(promises);
  }

  await writeFile('/tmp/wedding-sarees-final.json', JSON.stringify(products, null, 2));
  console.log(`\nSaved to /tmp/wedding-sarees-final.json`);
  console.log(`\n=== Final SEO titles ===`);
  for (const p of products) {
    console.log(`  ${p.sku || 'N/A'} (${p.seo_title.length} chars): ${p.seo_title}`);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
