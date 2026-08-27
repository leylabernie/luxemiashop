#!/usr/bin/env python3

import json
from pathlib import Path

redirect_map = {
    "/collections/earrings": "/jewelry",
    "/collections/evening-gowns": "/collections",
    "/collections/frontpage": "/",
    "/collections/indo-western": "/indowestern",
    "/collections/jacket-sets": "/suits",
    "/collections/kurta-pajama-vest": "/menswear",
    "/collections/manthrakodi-sarees": "/sarees",
    "/collections/saree-gowns": "/sarees",
}

path = Path("vercel.json")
config = json.loads(path.read_text(encoding="utf-8"))
redirects = config.get("redirects")
if not isinstance(redirects, list):
    raise SystemExit("[empty-collection-redirects] vercel.json redirects array not found")

sources = set(redirect_map)
insert_at = next(
    (index for index, entry in enumerate(redirects) if entry.get("source") in sources),
    next(
        (index for index, entry in enumerate(redirects) if entry.get("source", "").startswith("/collections/")),
        0,
    ),
)

preserved = [entry for entry in redirects if entry.get("source") not in sources]
entries = [
    {"source": source, "destination": destination, "statusCode": 301}
    for source, destination in redirect_map.items()
]
config["redirects"] = preserved[:insert_at] + entries + preserved[insert_at:]
path.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

reloaded = json.loads(path.read_text(encoding="utf-8"))
for source, destination in redirect_map.items():
    matches = [entry for entry in reloaded["redirects"] if entry.get("source") == source]
    if len(matches) != 1:
        raise SystemExit(f"[empty-collection-redirects] Expected one {source} redirect; found {len(matches)}")
    entry = matches[0]
    if entry.get("destination") != destination or entry.get("statusCode") != 301:
        raise SystemExit(f"[empty-collection-redirects] Invalid route {source}: {entry}")

print(f"[empty-collection-redirects] {len(redirect_map)} Vercel 301 redirects written and verified")
