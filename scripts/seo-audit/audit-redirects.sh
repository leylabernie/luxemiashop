#!/usr/bin/env bash
# audit-redirects.sh — Trace redirect chains for one or more URLs.
#
# Usage:
#   ./scripts/seo-audit/audit-redirects.sh "https://luxemia.shop/URL1" "https://luxemia.shop/URL2" ...
#
# Output: For each URL, prints every HTTP hop (status + Location header),
# the final URL, total hop count, and total time. Use this to detect:
#   - Redirect loops (A → B → A)
#   - Redirect chains (A → B → C → D — should be A → D)
#   - Soft-404s hiding behind redirects to /
#   - 308 vs 301 inconsistencies
#
# After running, fix any URL that has > 1 hop or lands on a 200 OK homepage
# from a non-homepage source URL (that's a soft-404-via-redirect).

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <url1> [url2] [url3] ..."
  echo ""
  echo "Example:"
  echo "  $0 https://luxemia.shop/nri/uk https://luxemia.shop/our-story"
  exit 1
fi

USER_AGENT="${AUDIT_UA:-Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)}"

for url in "$@"; do
  echo "════════════════════════════════════════════════════════════════"
  echo "Auditing: $url"
  echo "════════════════════════════════════════════════════════════════"

  # Final stats
  curl -sIL -A "$USER_AGENT" \
    --max-redirs 10 \
    -o /dev/null \
    -w "Hops:          %{num_redirects}\nFinal URL:     %{url_effective}\nFinal status:  %{http_code}\nTotal time:    %{time_total}s\n" \
    "$url" 2>/dev/null || echo "  (request failed)"

  echo ""
  echo "Redirect chain (status → Location header per hop):"
  curl -sIL -A "$USER_AGENT" --max-redirs 10 "$url" 2>/dev/null \
    | grep -iE "^(HTTP/|location:)" \
    | sed 's/^/  /' || echo "  (no headers — direct response or request failed)"

  # Soft-404-via-redirect check
  final_url=$(curl -sIL -A "$USER_AGENT" --max-redirs 10 -o /dev/null -w "%{url_effective}" "$url" 2>/dev/null || echo "")
  if [ -n "$final_url" ] && [ "$final_url" = "https://luxemia.shop/" ] && [ "$url" != "https://luxemia.shop/" ] && [ "$url" != "https://luxemia.shop" ]; then
    echo ""
    echo "  ⚠️  WARNING: Redirects to homepage — this is a SOFT-404 signal."
    echo "      Consider 410 Gone instead of 301 → /"
  fi

  echo ""
done

echo "════════════════════════════════════════════════════════════════"
echo "Audit complete. Fix any URL with > 1 hop or that lands on / from a non-/ source."
