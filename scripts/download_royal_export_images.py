from __future__ import annotations

import hashlib
import io
import json
import shutil
from pathlib import Path

import requests
from PIL import Image
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

PRODUCTS = {
    "RE1585": {
        "source": "https://www.royalexport.in/product/gamthi-work-pure-cotton-navratri-lehenga-choli-1580",
        "images": [
            "https://www.royalexport.in/product/product-img/gamthi-work-pure-cotton-navrat-1691060587.jpg",
            "https://www.royalexport.in/product/product-img/gamthi-work-pure-cotton-navrat1-1691060587.jpg",
            "https://www.royalexport.in/product/product-img/gamthi-work-pure-cotton-navrat2-1691060588.jpg",
            "https://www.royalexport.in/product/product-img/gamthi-work-pure-cotton-navrat3-1691060588.jpg",
        ],
    },
    "RE4269": {
        "source": "https://www.royalexport.in/product/navratri-special-pink-color-pure-rayon-lehenga-cho-3688",
        "images": [
            "https://www.royalexport.in/product/product-img/navratri-special-pink-color-p-1731406203.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-pink-color-p1-1731406203.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-pink-color-p2-1731406204.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-pink-color-p3-1731406204.jpg",
        ],
    },
    "RE2361": {
        "source": "https://www.royalexport.in/product/traditonal-red-gamthi-work-cotton-navratri-wear-le-2326",
        "images": [
            "https://www.royalexport.in/product/product-img/traditonal-red-gamthi-work-co-1692104882.jpg",
            "https://www.royalexport.in/product/product-img/traditonal-red-gamthi-work-co1-1692104882.jpg",
            "https://www.royalexport.in/product/product-img/traditonal-red-gamthi-work-co2-1692104883.jpg",
            "https://www.royalexport.in/product/product-img/traditonal-red-gamthi-work-co3-1692104883.jpg",
        ],
    },
    "RE2672": {
        "source": "https://www.royalexport.in/product/digital-printed-lehenga-choli-with-kutchi-mirror-l-2634",
        "images": [
            "https://www.royalexport.in/product/product-img/digital-printed-lehenga-choli-1697783333.jpg",
            "https://www.royalexport.in/product/product-img/digital-printed-lehenga-choli1-1697783333.jpg",
            "https://www.royalexport.in/product/product-img/digital-printed-lehenga-choli2-1697783334.jpg",
            "https://www.royalexport.in/product/product-img/digital-printed-lehenga-choli3-1697783334.jpg",
        ],
    },
    "RE8030-Maroon": {
        "source": "https://www.royalexport.in/product/traditional-navratri-cotton-lehenga-choli-with-fla-9805",
        "images": [
            "https://www.royalexport.in/product/product-img/traditional-navratri-cotton--1718707673.jpg",
            "https://www.royalexport.in/product/product-img/traditional-navratri-cotton-1-1718707673.jpg",
            "https://www.royalexport.in/product/product-img/traditional-navratri-cotton-2-1718707674.jpg",
            "https://www.royalexport.in/product/product-img/traditional-navratri-cotton-3-1718707674.jpg",
        ],
    },
    "RE12338-Blue": {
        "source": "https://www.royalexport.in/product/opulent-blue-designer-cora-cotton-lehenga-with-ban-18742",
        "images": [
            "https://www.royalexport.in/product/product-img/opulent-blue-designer-cora-co-1754409277.jpg",
            "https://www.royalexport.in/product/product-img/opulent-blue-designer-cora-co1-1754409277.jpg",
            "https://www.royalexport.in/product/product-img/opulent-blue-designer-cora-co2-1754409277.jpg",
            "https://www.royalexport.in/product/product-img/opulent-blue-designer-cora-co3-1754409278.jpg",
        ],
    },
    "RE1500": {
        "source": "https://www.royalexport.in/product/lime-and-white-pure-cotton-mirror-work-and-gota-pa-1490",
        "images": [
            "https://www.royalexport.in/product/product-img/lime-and-white-pure-cotton-mi-1691055761.jpg",
            "https://www.royalexport.in/product/product-img/lime-and-white-pure-cotton-mi1-1691055761.jpg",
            "https://www.royalexport.in/product/product-img/lime-and-white-pure-cotton-mi2-1691055762.jpg",
            "https://www.royalexport.in/product/product-img/lime-and-white-pure-cotton-mi3-1691055762.jpg",
        ],
    },
    "RE6364-Red": {
        "source": "https://www.royalexport.in/product/red-mirror-work-navratri-wear-lehenga-choli-with-d-6397",
        "images": [
            "https://www.royalexport.in/product/product-img/red-mirror-work-navratri-wea-1708347838.jpg",
            "https://www.royalexport.in/product/product-img/red-mirror-work-navratri-wea1-1708347838.jpg",
            "https://www.royalexport.in/product/product-img/red-mirror-work-navratri-wea2-1708347838.jpg",
            "https://www.royalexport.in/product/product-img/red-mirror-work-navratri-wea3-1708347839.jpg",
        ],
    },
    "RE4678": {
        "source": "https://www.royalexport.in/product/navratri-special-heavy-muslin-cotton-lehenga-choli-4079",
        "images": [
            "https://www.royalexport.in/product/product-img/navratri-special-heavy-musli-1736255049.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-heavy-musli1-1736255050.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-heavy-musli2-1736255050.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-heavy-musli3-1736255051.jpg",
        ],
    },
    "RE1142": {
        "source": "https://www.royalexport.in/product/navratri-special-butter-silk-printed-mirror-work-l-1137",
        "images": [
            "https://www.royalexport.in/product/product-img/navratri-special-butter-silk-1690357540.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-butter-silk1-1690357540.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-butter-silk2-1690357541.jpg",
            "https://www.royalexport.in/product/product-img/navratri-special-butter-silk3-1690357542.jpg",
        ],
    },
    "RE3478": {
        "source": "https://www.royalexport.in/product/soft-butter-silk-with-real-mirror-work-lehenga-cho-3425",
        "images": [
            "https://www.royalexport.in/product/product-img/soft-butter-silk-with-real-m-1717671097.jpg",
            "https://www.royalexport.in/product/product-img/soft-butter-silk-with-real-m1-1717671097.jpg",
            "https://www.royalexport.in/product/product-img/soft-butter-silk-with-real-m2-1717671097.jpg",
            "https://www.royalexport.in/product/product-img/soft-butter-silk-with-real-m3-1717671098.jpg",
        ],
    },
    "RE674": {
        "source": "https://www.royalexport.in/product/black-real-mirror-gota-patti-work-silk-lehenga-cho-667",
        "images": [
            "https://www.royalexport.in/product/product-img/black-real-mirror-gota-patti-1706272055.jpg",
            "https://www.royalexport.in/product/product-img/black-real-mirror-gota-patti1-1706272056.jpg",
            "https://www.royalexport.in/product/product-img/black-real-mirror-gota-patti2-1706272056.jpg",
            "https://www.royalexport.in/product/product-img/black-real-mirror-gota-patti3-1706272057.jpg",
        ],
    },
    "RE3317": {
        "source": "https://www.royalexport.in/product/bandhani-print-navratri-chaniya-choli-3267",
        "images": [
            "https://www.royalexport.in/product/product-img/bandhani-print-navratri-chan-1732788410.jpg",
            "https://www.royalexport.in/product/product-img/bandhani-print-navratri-chan1-1732788410.jpg",
            "https://www.royalexport.in/product/product-img/bandhani-print-navratri-chan2-1732788410.jpg",
            "https://www.royalexport.in/product/product-img/bandhani-print-navratri-chan3-1732788411.jpg",
        ],
    },
    "RE4044": {
        "source": "https://www.royalexport.in/product/soft-gaji-silk-printed-with-zari-border-lehenga-ch-3663",
        "images": [
            "https://www.royalexport.in/product/product-img/soft-gaji-silk-printed-with--1724417836.jpg",
            "https://www.royalexport.in/product/product-img/soft-gaji-silk-printed-with-1-1724417836.jpg",
            "https://www.royalexport.in/product/product-img/soft-gaji-silk-printed-with-2-1724417837.jpg",
            "https://www.royalexport.in/product/product-img/soft-gaji-silk-printed-with-3-1724417837.jpg",
        ],
    },
    "RE10185-Black": {
        "source": "https://www.royalexport.in/product/remarkable-black-heavy-flare-cotton-lehenga-with-s-13785",
        "images": [
            "https://www.royalexport.in/product/product-img/remarkable-black-heavy-flare-1728383665.jpg",
            "https://www.royalexport.in/product/product-img/remarkable-black-heavy-flare1-1728383666.jpg",
            "https://www.royalexport.in/product/product-img/remarkable-black-heavy-flare2-1728383667.jpg",
            "https://www.royalexport.in/product/product-img/remarkable-black-heavy-flare3-1728383667.jpg",
        ],
    },
    "RE2165": {
        "source": "https://www.royalexport.in/product/black-maroon-reyon-printed-lehenga-choli-with-kodi-2130",
        "images": [
            "https://www.royalexport.in/product/product-img/black-maroon-reyon-printed-l-1691675476.jpg",
            "https://www.royalexport.in/product/product-img/black-maroon-reyon-printed-l1-1691675476.jpg",
            "https://www.royalexport.in/product/product-img/black-maroon-reyon-printed-l2-1691675477.jpg",
            "https://www.royalexport.in/product/product-img/black-maroon-reyon-printed-l3-1691675477.jpg",
        ],
    },
}

OUT = Path("royal-export-artifact")
if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "images").mkdir(parents=True)

session = requests.Session()
retry = Retry(
    total=5,
    connect=5,
    read=5,
    backoff_factor=1.2,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"],
)
session.mount("https://", HTTPAdapter(max_retries=retry))
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
})

manifest: list[dict] = []
for sku, product in PRODUCTS.items():
    product_dir = OUT / "images" / sku
    product_dir.mkdir(parents=True)
    image_records = []
    for index, url in enumerate(product["images"], start=1):
        response = session.get(url, headers={"Referer": product["source"]}, timeout=90)
        response.raise_for_status()
        payload = response.content
        if len(payload) < 15_000:
            raise RuntimeError(f"{sku} image {index} is too small: {len(payload)} bytes")
        with Image.open(io.BytesIO(payload)) as image:
            image.verify()
        with Image.open(io.BytesIO(payload)) as image:
            width, height = image.size
            image_format = (image.format or "JPEG").upper()
        if width < 500 or height < 500:
            raise RuntimeError(f"{sku} image {index} is too small: {width}x{height}")
        extension = {"JPEG": ".jpg", "JPG": ".jpg", "PNG": ".png", "WEBP": ".webp"}.get(image_format, ".jpg")
        filename = f"{index:02d}{extension}"
        path = product_dir / filename
        path.write_bytes(payload)
        image_records.append({
            "source_url": url,
            "path": f"images/{sku}/{filename}",
            "width": width,
            "height": height,
            "bytes": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        })
        print(f"Downloaded {sku} {index}: {width}x{height} {len(payload)} bytes")
    manifest.append({"sku": sku, "source_url": product["source"], "images": image_records})

(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
(OUT / "README.md").write_text(
    "Temporary supplier-source image staging for the approved Royal Export Navratri listing build. Do not merge this directory into production.\n",
    encoding="utf-8",
)
print(f"Completed {len(manifest)} products and {sum(len(row['images']) for row in manifest)} verified images")
