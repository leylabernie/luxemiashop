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

MAP_PATH = Path("royal-export-selected-image-map.json")
OUT = Path("royal-export-artifact")

if not MAP_PATH.exists():
    raise FileNotFoundError(f"Missing selected image map: {MAP_PATH}")

products = json.loads(MAP_PATH.read_text(encoding="utf-8"))
if len(products) != 16:
    raise RuntimeError(f"Expected 16 approved products, found {len(products)}")

if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "images").mkdir(parents=True)

session = requests.Session()
retry = Retry(
    total=2,
    connect=2,
    read=2,
    backoff_factor=0.75,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"],
)
session.mount("https://", HTTPAdapter(max_retries=retry))
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
})

manifest: list[dict] = []
for product in products:
    sku = product["sku"]
    source_page = product["source_url"]
    image_urls = product.get("images", [])[:4]
    if len(image_urls) < 4:
        raise RuntimeError(f"{sku}: expected at least 4 selected images, found {len(image_urls)}")

    product_dir = OUT / "images" / sku
    product_dir.mkdir(parents=True)
    image_records = []

    for index, url in enumerate(image_urls, start=1):
        response = session.get(
            url,
            headers={
                "Referer": source_page,
                "Origin": "https://www.royalexport.in",
                "Sec-Fetch-Dest": "image",
                "Sec-Fetch-Mode": "no-cors",
                "Sec-Fetch-Site": "same-origin",
            },
            timeout=45,
        )
        response.raise_for_status()
        payload = response.content
        content_type = (response.headers.get("content-type") or "").lower()
        if len(payload) < 15_000:
            raise RuntimeError(f"{sku} image {index}: only {len(payload)} bytes from {url}")
        if not payload.startswith((b"\xff\xd8\xff", b"\x89PNG\r\n\x1a\n", b"RIFF")):
            excerpt = payload[:120].decode("utf-8", errors="replace")
            raise RuntimeError(f"{sku} image {index}: non-image response {content_type}: {excerpt!r}")

        with Image.open(io.BytesIO(payload)) as image:
            image.verify()
        with Image.open(io.BytesIO(payload)) as image:
            width, height = image.size
            image_format = (image.format or "JPEG").upper()
        if width < 500 or height < 500:
            raise RuntimeError(f"{sku} image {index}: dimensions {width}x{height} are below 500x500")

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
        print(f"Downloaded {sku} image {index}: {width}x{height}; {len(payload)} bytes")

    manifest.append({"sku": sku, "source_url": source_page, "images": image_records})

(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
(OUT / "README.md").write_text(
    "Temporary supplier-source image staging for the approved Royal Export Navratri listing build. Do not merge this directory into production.\n",
    encoding="utf-8",
)
print(f"Completed {len(manifest)} products and {sum(len(row['images']) for row in manifest)} verified images")
