#!/usr/bin/env node
// RETIRED 2026-09-20.
//
// This was the September 2026 migration that restored the nine catalog-35757
// art-silk sherwanis from 410 retirement and re-added them to the approved
// sitemap inventory on every build.
//
// In the owner's 2026-09-20 bulk cleanup all pre-September-5 uploads were
// archived (these sherwanis among them), so restoring them on every build
// would un-gone archived products and re-add dead URLs to the sitemap.
// The restore is intentionally a no-op now. If these sherwanis ever return
// to the active catalog, remove this no-op and re-approve them properly.
console.log(
  '[approved-sherwani-sitemap] Migration retired - nine sherwani URLs remain archived per owner cleanup (2026-09-20).',
);
