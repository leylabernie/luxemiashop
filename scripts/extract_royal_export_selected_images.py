from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urljoin

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

output = []
for sku, page_url in PRODUCTS.items():
    response = session.get(page_url, timeout=60)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "lxml")
    images: list[str] = []

    for img in soup.find_all("img"):
        parent_classes = set(img.parent.get("class") or []) if img.parent else set()
        raw = img.get("src") or img.get("data-src") or img.get("data-zoom-image")
        if not raw:
            continue
        url = urljoin(page_url, raw)
        if "MagicZoom" in parent_classes and "/product/product-img/" in url and "/thumb/" not in url:
            images.append(url)

    for anchor in soup.find_all("a"):
        parent_classes = set(anchor.parent.get("class") or []) if anchor.parent else set()
        href = anchor.get("href")
        if not href:
            continue
        url = urljoin(page_url, href)
        if "selectors" in parent_classes and "/product/product-img/" in url and "/thumb/" not in url:
            images.append(url)

    images = list(dict.fromkeys(images))
    if len(images) < 3:
        raise RuntimeError(f"{sku}: expected at least 3 gallery images, found {len(images)}: {images}")
    output.append({"sku": sku, "source_url": page_url, "images": images[:6]})
    print(sku, len(images), images[:6])

Path("royal-export-selected-image-map.json").write_text(json.dumps(output, indent=2), encoding="utf-8")
