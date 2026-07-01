#!/usr/bin/env node
/**
 * Retry script — regenerate body HTML for products that failed in the first pass.
 * Processes SEQUENTIALLY (no concurrency) with a 3-second delay between calls
 * to avoid hitting the 429 rate limit.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ZAI_MOD = require('/home/z/.bun/install/global/node_modules/z-ai-web-dev-sdk');
const ZAI = ZAI_MOD.default || ZAI_MOD;

const products = JSON.parse(await readFile('/tmp/wedding-sarees-final.json', 'utf8'));

// Same system prompt as the original script
const SYSTEM_PROMPT = `You are an expert SEO + AI-search content writer for LuxeMia, a luxury Indian ethnic wear store shipping to USA, Canada, and Australia. Write Shopify product Body HTML for wedding sarees that ranks on Google, Bing, AND gets cited by AI search engines (ChatGPT, Perplexity, Google AI Overviews, Bing Copilot).

AI-SEARCH OPTIMIZATION RULES:
1. Open with a DIRECT ANSWER paragraph (2-3 sentences) that AI engines can extract verbatim.
2. Use natural conversational phrases people actually type into ChatGPT/voice search.
3. Include semantic variations of keywords.
4. Answer questions directly in the body.

TRADITIONAL SEO RULES:
1. Mid-tail keywords in H3 headings.
2. Long-tail keywords woven naturally.
3. Include color + fabric + work + occasion + audience in first 100 words.
4. Use <strong> on key phrases once each.

STRUCTURE (use exactly these H3 sections in this order):
1. Opening direct-answer paragraph (no heading) — 2-3 sentences
2. <h3>Why Brides Choose <Color> <Fabric> Sarees</h3>
3. <h3>What Makes This <Work> Saree Special</h3>
4. <h3>Perfect For These Occasions</h3> — <ul> with 3-4 occasion bullets
5. <h3>How to Style This <Color> Saree</h3>
6. <h3>Saree Sizing, Care & Shipping</h3> — <ul> with 3 bullets
7. <h3>Frequently Asked Questions</h3> — 3 Q&A pairs
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
- Collection: Wedding Sarees
- Vendor: LuxeMia (luxury Indian ethnic wear, based in Philadelphia, PA)
- Price: $${Math.round((p.price_inr * 2) / 90)} USD (compare at $${Math.round((p.mrp_inr * 2) / 90)})
- Target occasions: Wedding, Reception, Engagement, Mehendi, Wedding Guest
- Target audience: NRI brides and wedding guests in USA, Canada, Australia
- Shipping: Free over $350, 7-10 business days via DHL/USPS/UPS

Return ONLY the HTML.`;
}

async function generateWithRetry(zai, p, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
      if (html.length > 100) return html;
      throw new Error('Response too short');
    } catch (err) {
      if (attempt < maxAttempts) {
        // Longer delay for rate limits — 5s, 10s, 20s, 40s
        const delay = 5000 * Math.pow(2, attempt - 1);
        console.log(`    attempt ${attempt} failed (${err.message.slice(0, 50)}), waiting ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  const zai = await ZAI.create();
  const failed = products.filter(p => !p.body_html || p.body_html.length < 100);
  console.log(`Retrying ${failed.length} failed products (sequential, 3s delay)...\n`);

  let success = 0;
  let stillFailed = 0;
  for (const p of failed) {
    try {
      const html = await generateWithRetry(zai, p);
      p.body_html = html;
      console.log(`  ✓ ${p.sku || 'N/A'}: ${p.seo_title}`);
      success++;
    } catch (err) {
      console.log(`  ✗ ${p.sku || 'N/A'}: ${err.message}`);
      stillFailed++;
    }
    // 3-second delay between calls
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`\nRetry complete: ${success} succeeded, ${stillFailed} still failed.`);
  await writeFile('/tmp/wedding-sarees-final.json', JSON.stringify(products, null, 2));
  console.log('Saved to /tmp/wedding-sarees-final.json');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
