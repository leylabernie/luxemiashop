# Pinterest Kit — Corrected Scheduler + Board Architecture

Generated 2026-11-25 from the live catalog. Replaces the owner's
`luxemia-pinterest-scheduler.xlsx`, whose five filled pins pointed at four product handles that do not
exist and used the non-canonical `/products/` path.

| File | Contents |
|---|---|
| `luxemia-pinterest-scheduler-corrected.csv` | 29 pins — 7 / 7 / 5 / 5 / 5 across the five boards, matching the sheet's own weekly pin goals. PIN-001…PIN-005 keep the original slots and categories. |
| `luxemia-pinterest-boards-corrected.csv` | 5 boards with keyword clusters, ≤500-char descriptions, and a note recording exactly what was corrected. |

Columns match the original sheet (extra verification columns are appended on the right), so each CSV pastes
straight into the matching worksheet.

## Using it

1. Create the five boards from `luxemia-pinterest-boards-corrected.csv`.
2. Pin 2–3 rows per day from the scheduler CSV: title, description, `Image URL`, `Destination URL`.
   Pinterest's recommended ratio is 2:3 — the Shopify CDN image URLs take `width` / `height` / `crop` params; render one crop first to confirm the framing.
3. Re-check any row marked `Draft — verify PDP before scheduling`; rows whose handle appears in the
   reversible retirement draft carry an explicit WARNING in `Notes / Callouts`.

## Pinterest account side (no deploy needed)

- **Domain claim**: `index.html` already publishes the `p:domain_verify` meta tag, so claiming
  `luxemia.shop` is a paste-and-confirm step in Pinterest → Settings → Claimed accounts.
- **Product pins at scale**: point Pinterest's catalog import at `https://luxemia.shop/merchant-feed.xml`
  (Google Shopping RSS, regenerated and validated on every build; also served at `/feed.xml`,
  `/shopping-feed.xml`, `/products.xml`, `/google-shopping.xml` and `/api/merchant-feed`).
- **Rich pins**: the validator reads the `og:type=product` and price/availability meta that
  `src/components/seo/SEOHead.tsx` already emits on every PDP.

## Regenerating

```bash
npm run build                                 # refresh public/merchant-feed.xml if the catalog changed
node scripts/generate-pinterest-scheduler.cjs # rewrite both CSVs
npm test                                      # tests/pinterestScheduler.test.cjs guards the output
```

The generator only schedules products that are in stock, in `public/merchant-feed.xml`, present in
`scripts/approved-sitemap-inventory.json`, absent from `src/lib/goneRoutes.ts` (410s), and carrying at
least two catalog images. Pin copy comes from `src/lib/pinterestPinCopy.cjs` — the same module the PDP
share buttons use — so scheduled pins and on-page sharing can never disagree.

Copy rules and the full audit: `docs/growth/ZERO-BUDGET-PLAYBOOK-VERIFIED-2026-11-25.md`.
