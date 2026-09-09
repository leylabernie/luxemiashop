"""Scrape first 10 product names and prices from wholesalesalwar lehenga-choli page."""

import requests
from bs4 import BeautifulSoup

URL = "https://www.wholesalesalwar.com/retail/lehenga-choli"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


def extract_products(html: str) -> list[tuple[str, str]]:
    soup = BeautifulSoup(html, "html.parser")
    products: list[tuple[str, str]] = []

    for card in soup.select(".product-layout, .product-thumb, .product-grid, .product-item"):
        name_el = card.select_one("h4 a, .name a, .product-name a, a[title]")
        price_el = card.select_one(".price, .product-price, .price-new, .special-price, .amount")

        name = name_el.get_text(" ", strip=True) if name_el else None
        price = price_el.get_text(" ", strip=True) if price_el else None

        if name and price and (name, price) not in products:
            products.append((name, price))
        if len(products) >= 10:
            return products

    for link in soup.select("a[href*='lehenga'], a[href*='product']"):
        name = link.get("title") or link.get_text(" ", strip=True)
        if not name or len(name) < 3:
            continue

        parent = link.parent
        price = None
        if parent:
            price_el = parent.select_one(".price, .product-price, .price-new, .special-price, .amount")
            if price_el:
                price = price_el.get_text(" ", strip=True)

        if name and price and (name, price) not in products:
            products.append((name, price))
        if len(products) >= 10:
            break

    return products


def main() -> None:
    response = requests.get(URL, headers=HEADERS, timeout=30)
    response.raise_for_status()

    products = extract_products(response.text)

    for i, (name, price) in enumerate(products[:10], 1):
        print(f"{i}. {name} - {price}")

    if not products:
        print("No products found.")


if __name__ == "__main__":
    main()
