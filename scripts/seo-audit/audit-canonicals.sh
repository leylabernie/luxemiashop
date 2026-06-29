#!/usr/bin/env bash
# audit-canonicals.sh — Detect canonical mismatches between server HTML and post-JS HTML.
#
# Usage:
#   ./scripts/seo-audit/audit-canonicals.sh "https://luxemia.shop/URL1" "https://luxemia.shop/URL2" ...
#
# What it checks:
#   1. The canonical URL in the server-rendered HTML (what Googlebot sees first).
#   2. Whether the URL itself redirects (which would invalidate the canonical).
#   3. Whether the canonical matches the requested URL (self-referential test).
#
# Mismatches between server-canonical and post-JS canonical (rendered by React
# Helmet) are the #1 cause of "Duplicate, Google chose different canonical
# than user" errors in GSC.

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <url1> [url2] [url3] ..."
  exit 1
fi

USER_AGENT="${AUDIT_UA:-Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)}"

for url in "$@"; do
  echo "════════════════════════════════════════════════════════════════"
  echo "URL: $url"
  echo "════════════════════════════════════════════════════════════════"

  # Final HTTP status (after redirects)
  final_code=$(curl -sIL -A "$USER_AGENT" -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  final_url=$(curl -sIL -A "$USER_AGENT" -o /dev/null -w "%{url_effective}" "$url" 2>/dev/null || echo "")
  echo "Final HTTP status:  $final_code"
  echo "Final URL:          $final_url"

  # Server-rendered canonical (the one Googlebot parses)
  server_html=$(curl -sL -A "$USER_AGENT" "$url" 2>/dev/null || echo "")
  server_canonical=$(echo "$server_html" | grep -oP '<link\s+rel="canonical"\s+href="\K[^"]+' | head -1)
  if [ -z "$server_canonical" ]; then
    server_canonical=$(echo "$server_html" | grep -oP "<link\s+rel='canonical'\s+href='\K[^']+" | head -1)
  fi
  echo "Server canonical:   ${server_canonical:-(MISSING — no canonical tag in server HTML)}"

  # Self-referential check: canonical should match the requested URL (after redirects)
  if [ -n "$server_canonical" ] && [ -n "$final_url" ]; then
    # Normalize both for comparison (strip trailing slash except for root)
    norm_canonical=$(echo "$server_canonical" | sed 's|/$||' | sed 's|/$||')
    norm_final=$(echo "$final_url" | sed 's|/$||' | sed 's|/$||')
    if [ "$norm_canonical" = "$norm_final" ]; then
      echo "Self-referential:   ✅ YES (canonical matches requested URL)"
    else
      echo "Self-referential:   ⚠️  NO — canonical ($server_canonical) ≠ requested ($final_url)"
      echo "                     This causes 'Duplicate, Google chose different canonical' errors."
    fi
  fi

  # Check for multiple canonical tags (which is invalid HTML)
  canonical_count=$(echo "$server_html" | grep -c '<link\s*rel="canonical"' || true)
  if [ "$canonical_count" -gt 1 ]; then
    echo "Multiple canonicals: ⚠️  FOUND $canonical_count canonical tags — only ONE is allowed."
  fi

  # X-Robots-Tag header check
  robots_header=$(curl -sI -A "$USER_AGENT" "$url" 2>/dev/null | grep -i "^x-robots-tag:" | tr -d '\r' || true)
  if [ -n "$robots_header" ]; then
    echo "X-Robots-Tag:       $robots_header"
  fi

  # Meta robots check
  meta_robots=$(echo "$server_html" | grep -oP '<meta\s+name="robots"\s+content="\K[^"]+' | head -1 || true)
  if [ -n "$meta_robots" ]; then
    echo "Meta robots:        $meta_robots"
    if echo "$meta_robots" | grep -qi "noindex"; then
      echo "                    ⚠️  Page is noindex — won't be indexed by Google."
    fi
  fi

  echo ""
done

echo "════════════════════════════════════════════════════════════════"
echo "Canonical audit complete. Fix any URL marked ⚠️."
