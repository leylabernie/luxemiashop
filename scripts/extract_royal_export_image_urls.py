from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

PRODUCTS = {
    "RE1585": "https://www.royalexport.in/product/gamthi-work-pure-cotton-navratri-lehenga-choli-1580",
    "RE4269": "https://www.royalexport.in/product/navratri-special-pink-color-pure-rayon-lehenga-cho-3688",
    "RE2361": "https://www.royalexport.in/product/traditonal-red-gamthi-work-cotton-navratri-wear-le-2326",
    "RE2672": "https://www.royalexport.in/product/digital-printed-lehenga-choli-with-kutchi-mirror-l-2634",
    "RE8030-Maroon": "https://www.royalexport.in/product/traditional-navratri-cotton-lehenga-choli-with-fla-9805",
    "RE12338-Blue": "https://www.royalexport.in/product/opulent-blue-designer-cora-cotton-lehenga-with-ban-18742",
    "RE1500": "https://www.royalexport.in/product/lime-and-white-pure-cotton-mirror-work-and-gota-pa-1490",
    "RE6364-Red": "https://www.royalexport.in/product/red-mirror-work-navratri-wear-lehenga-choli-with-d-6397",
    "RE4678": "https://www.royalexport.in/product/navratri-special-heavy-muslin-cotton-lehenga-choli-4079",
    "RE1142": "https://www.royalexport.in/product/navratri-special-butter-silk-printed-mirror-work-l-1137",
    "RE3478": "https://www.royalexport.in/product/soft-butter-silk-with-real-mirror-work-lehenga-cho-3425",
    "RE674": "https://www.royalexport.in/product/black-real-mirror-gota-patti-work-silk-lehenga-cho-667",
    "RE3317": "https://www.royalexport.in/product/bandhani-print-navratri-chaniya-choli-3267",
    "RE4044": "https://www.royalexport.in/product/soft-gaji-silk-printed-with-zari-border-lehenga-ch-3663",
    "RE10185-Black": "https://www.royalexport.in/product/remarkable-black-heavy-flare-cotton-lehenga-with-s-13785",
    "RE2165": "https://www.royalexport.in/product/black-maroon-reyon-printed-lehenga-choli-with-kodi-2130",
}

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.royalexport.in/navratri-lehnega-choli",
})

ATTRS = [
    "src", "data-src", "data-lazy-src", "data-original", "data-image",
    "data-zoom-image", "data-large_image", "data-large-image", "data-thumb",
    "srcset", "data-srcset",
]


def add_candidate(rows: list[dict], seen: set[str], base: str, raw: str, *, source: str, alt: str = "", classes: str = "", parent: str = ""):
    if not raw:
        return
    values = []
    if "," in raw and re.search(r"\s\d+[wx](?:,|$)", raw):
        values = [part.strip().split()[0] for part in raw.split(",")]
    else:
        values = [raw.strip()]
    for value in values:
        if not value or value.startswith("data:"):
            continue
        try:
            url = urljoin(base, value)
        except Exception:
            continue
        if url in seen:
            continue
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"}:
            continue
        low = url.lower()
        if not re.search(r"\.(?:jpe?g|png|webp|avif)(?:\?|$)", low):
            continue
        seen.add(url)
        rows.append({
            "url": url,
            "source": source,
            "alt": re.sub(r"\s+", " ", alt).strip(),
            "classes": classes,
            "parent": parent,
            "is_product_path": "/product/" in low,
            "is_product_img_path": "/product-img/" in low,
            "is_thumb": "/thumb/" in low or "thumb" in classes.lower(),
        })


output = []
for sku, page_url in PRODUCTS.items():
    response = session.get(page_url, timeout=60)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "lxml")
    rows: list[dict] = []
    seen: set[str] = set()

    for tag in soup.find_all("img"):
        alt = tag.get("alt") or tag.get("title") or ""
        classes = " ".join(tag.get("class") or [])
        parent = " ".join(tag.parent.get("class") or []) if tag.parent else ""
        for attr in ATTRS:
            raw = tag.get(attr)
            if raw:
                add_candidate(rows, seen, page_url, raw, source=f"img:{attr}", alt=alt, classes=classes, parent=parent)

    for tag in soup.find_all("a"):
        href = tag.get("href")
        if href:
            add_candidate(rows, seen, page_url, href, source="anchor", alt=tag.get("title") or tag.get_text(" ", strip=True), classes=" ".join(tag.get("class") or []), parent=" ".join(tag.parent.get("class") or []) if tag.parent else "")

    for meta_name in ["og:image", "og:image:secure_url", "twitter:image"]:
        for tag in soup.select(f'meta[property="{meta_name}"], meta[name="{meta_name}"]'):
            add_candidate(rows, seen, page_url, tag.get("content") or "", source=f"meta:{meta_name}")

    likely = [row for row in rows if row["is_product_img_path"]]
    output.append({
        "sku": sku,
        "source_url": page_url,
        "status": response.status_code,
        "all_candidates": rows,
        "likely_product_images": likely,
    })
    print(sku, response.status_code, len(rows), len(likely))

Path("royal-export-image-url-map.json").write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
