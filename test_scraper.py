"""Fetch and print the first 10 product names and prices from wholesalesalwar."""

from __future__ import annotations

import re
import urllib.error
import urllib.request

URL = "https://www.wholesalesalwar.com/retail/lehenga-choli"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", value)).strip()


def extract_products(html: str) -> list[tuple[str, str]]:
    products: list[tuple[str, str]] = []

    block_pattern = re.compile(
        r"<div[^>]+class=\"[^\"]*(?:product|item)[^\"]*\"[^>]*>(.*?)</div>",
        re.IGNORECASE | re.DOTALL,
    )
    name_pattern = re.compile(r"<a[^>]*>(.*?)</a>", re.IGNORECASE | re.DOTALL)
    price_pattern = re.compile(r"(₹\s*[\d,]+(?:\.\d{1,2})?)", re.IGNORECASE)

    for block in block_pattern.findall(html):
        name_match = name_pattern.search(block)
        price_match = price_pattern.search(block)
        if not name_match or not price_match:
            continue

        name = clean_text(name_match.group(1))
        price = clean_text(price_match.group(1))

        if name and price and (name, price) not in products:
            products.append((name, price))
        if len(products) >= 10:
            break

    return products


def main() -> int:
    try:
        html = fetch_html(URL)
    except urllib.error.URLError as exc:
        print(f"Request failed: {exc}")
        return 0
    except TimeoutError:
        print("Request timed out.")
        return 0

    products = extract_products(html)

    if not products:
        print("No products found.")
        return 0

    for i, (name, price) in enumerate(products[:10], start=1):
        print(f"{i}. {name} - {price}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
