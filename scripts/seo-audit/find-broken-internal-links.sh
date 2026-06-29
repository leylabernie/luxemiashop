#!/usr/bin/env bash
# find-broken-internal-links.sh — Scan the codebase for hardcoded internal links
# and verify they resolve to live pages on luxemia.shop.
#
# Usage:
#   ./scripts/seo-audit/find-broken-internal-links.sh
#
# Output: list of internal links (href values) found in source code that
# return non-200 status when fetched from the live site. Use this to find
# stale internal links pointing to retired URLs (the #1 cause of 404s
# discovered by Googlebot).
#
# Requires: ripgrep (rg), curl, jq

set -euo pipefail

SITE="${SITE_URL:-https://luxemia.shop}"
USER_AGENT="${AUDIT_UA:-LuxeMia-Internal-Link-Audit/1.0}"

cd "$(dirname "$0")/../.."

echo "Scanning src/ and public/ for internal href values..."
echo "Site: $SITE"
echo ""

# Extract all href="/..." values from .tsx, .ts, .html, and .json files.
# Skip external URLs, mailto:, tel:, #, and data: URIs.
# Skip dynamic route params like :handle (those are React Router patterns).
links=$(rg --no-filename -oI \
  -e 'href="(/[^"#?]+)"' \
  -e 'href='"'"'(/[^"#?]+)'"'"'' \
  -e 'to="(/[^"#?]+)"' \
  -e 'to='"'"'(/[^"#?]+)'"'"'' \
  -g '*.{tsx,ts,html,json}' \
  src/ public/ index.html 2>/dev/null \
  | sed -E 's/.*["'"'"']([^"'"'"']+)["'"'"'].*/\1/' \
  | sort -u \
  | grep -v '/assets/' \
  | grep -v '/images/' \
  | grep -v '/og/' \
  | grep -v '/catalogs/' \
  | grep -v '/_prerender/' \
  | grep -v '/api/' \
  | grep -v '/:handle' \
  | grep -v '/:slug' \
  | grep -v '/:tag' \
  | grep -v '/:cat' \
  || echo "")

if [ -z "$links" ]; then
  echo "No internal links found in source. (Did you run from the repo root?)"
  exit 0
fi

link_count=$(echo "$links" | wc -l | tr -d ' ')
echo "Found $link_count unique internal links. Checking each against $SITE..."
echo ""

broken_count=0
checked=0

while IFS= read -r path; do
  [ -z "$path" ] && continue
  url="${SITE}${path}"
  # Use HEAD request, follow redirects, capture final status
  code=$(curl -sIL -A "$USER_AGENT" --max-time 5 -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  checked=$((checked + 1))
  if [ "$code" != "200" ]; then
    echo "  ⚠️  $code  $path"
    broken_count=$((broken_count + 1))
  fi
  if [ $((checked % 25)) -eq 0 ]; then
    echo "  ... checked $checked/$link_count ($broken_count broken so far)"
  fi
done <<< "$links"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Audit complete: $checked links checked, $broken_count broken."
if [ "$broken_count" -gt 0 ]; then
  echo ""
  echo "Next steps:"
  echo "  1. For each broken link above, search the codebase:"
  echo "       rg \"\$PATH\" src/ public/"
  echo "  2. Replace with the correct canonical URL, OR add a 301 redirect in vercel.json."
  echo "  3. For URLs with no replacement, add them to GONE_ROUTES in middleware.ts → 410 Gone."
  exit 1
fi
