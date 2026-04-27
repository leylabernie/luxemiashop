import requests
from bs4 import BeautifulSoup

URL = "https://www.wholesalesalwar.com/retail/lehenga-choli"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}

response = requests.get(URL, headers=headers, timeout=30)
response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")

products = []

for card in soup.select(".product-layout, .product-thumb, .product-grid, .product-item"):
    name_el = card.select_one("h4 a, .name a, .product-name a, a[title]")
    price_el = card.select_one(".price, .product-price, .price-new, .special-price, .amount")

    name = name_el.get_text(" ", strip=True) if name_el else None
    price = price_el.get_text(" ", strip=True) if price_el else None

    if name and price:
        products.append((name, price))

if len(products) < 10:
    for link in soup.select("a[href*='lehenga'], a[href*='product']"):
        name = link.get("title") or link.get_text(" ", strip=True)
        if not name or len(name) < 3:
            continue

        container = link.find_parent()
        price = None
        if container:
            price_el = container.select_one(".price, .product-price, .price-new, .special-price, .amount")
            if price_el:
                price = price_el.get_text(" ", strip=True)

        if name and price and (name, price) not in products:
            products.append((name, price))
        if len(products) >= 10:
            break

for i, (name, price) in enumerate(products[:10], 1):
    print(f"{i}. {name} - {price}")

if not products:
    print("No products found.")
