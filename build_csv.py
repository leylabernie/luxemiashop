#!/usr/bin/env python3
"""
Build Shopify CSV import file for LuxeMia shop.
Reads scraped product data from product_prices.json and generates
a 57-column Shopify CSV with correct pricing.

Pricing formula:
  USD selling price  = INR_selling_price × 2 ÷ 90  (rounded to .99)
  Compare-at price   = USD selling price × 1.43      (shows ~30% off)

Fixes applied (April 2026):
  - Per-product INR-based pricing instead of hardcoded fabric tiers
  - Compare-at prices populated (1.43x) for 30% off display
  - Unique handles: append source product ID to avoid duplicate collisions
  - 57-column Shopify CSV format matching latest import template
  - Discontinued products (status=UNAVAILABLE) are excluded
"""

import csv
import json
import math
import re

# ============ LOAD SCRAPED PRICES ============
with open('product_prices.json', 'r') as f:
    all_products = json.load(f)

# Separate by category based on URL/product data from build_csv.py original
SAREE_URLS = [
    "lycra-mauve-festival-wear-sequins-work-readymade-saree-394402",
    "lycra-blue-festival-wear-sequins-work-readymade-saree-394401",
    "lycra-brown-festival-wear-sequins-work-readymade-saree-394400",
    "silk-blue-wedding-wear-embroidery-work-saree-394443",
    "silk-beige-wedding-wear-embroidery-work-saree-394442",
    "silk-yellow-wedding-wear-embroidery-work-saree-394441",
    "silk-pink-wedding-wear-embroidery-work-saree-394440",
    "silk-multi-color-wedding-wear-embroidery-work-saree-394439",
    "silk-beige-wedding-wear-embroidery-work-saree-394438",
    "silk-grey-wedding-wear-embroidery-work-saree-394437",
    "silk-silver-grey-wedding-wear-embroidery-work-saree-394436",
    "silk-multi-color-wedding-wear-embroidery-work-saree-394435",
    "silk-blend-rani-pink-casual-wear-jari-work-saree-394452",
    "silk-blend-navy-blue-casual-wear-jari-work-saree-394451",
    "silk-blend-red-casual-wear-jari-work-saree-394450",
    "silk-blend-green-casual-wear-jari-work-saree-394449",
    "silk-blend-orange-casual-wear-jari-work-saree-394448",
    "silk-blend-green-casual-wear-jari-work-saree-394447",
    "silk-yellow-wedding-wear-embroidery-work-saree-394463",
    "silk-multi-color-wedding-wear-embroidery-work-saree-394462",
    "silk-yellow-wedding-wear-embroidery-work-saree-394461",
    "silk-rama-wedding-wear-embroidery-work-saree-394460",
    "silk-rani-pink-wedding-wear-embroidery-work-saree-394459",
    "silk-light-green-wedding-wear-embroidery-work-saree-394458",
    "silk-purple-wedding-wear-embroidery-work-saree-394457",
    "silk-multi-color-wedding-wear-embroidery-work-saree-394456",
    "silk-light-pink-wedding-wear-embroidery-work-saree-394455",
    "silk-orange-wedding-wear-embroidery-work-saree-394454",
    "silk-navy-blue-wedding-wear-embroidery-work-saree-394453",
    "pure-silk-multi-color-occasional-wear-embroidery-work-saree-394266",
]

# Original scraped data with images (from previous build_csv.py)
SAREES = [
    {"name": "Lycra Mauve Festival Wear Sequins Work Readymade Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61108/Mauve-Lycra-Festival-Wear-Sequins-Work--Readymade-Saree-AQUA-66683(1).jpg", "url": "https://wholesalesalwar.com/p/lycra-mauve-festival-wear-sequins-work-readymade-saree-394402"},
    {"name": "Lycra Blue Festival Wear Sequins Work Readymade Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61108/BluE-Lycra-Festival-Wear-Sequins-Work--Readymade-Saree-AQUA-66682(1).jpg", "url": "https://wholesalesalwar.com/p/lycra-blue-festival-wear-sequins-work-readymade-saree-394401"},
    {"name": "Lycra Brown Festival Wear Sequins Work Readymade Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61108/BROWN-Lycra-Festival-Wear-Sequins-Work--Readymade-Saree-AQUA-66681(1).jpg", "url": "https://wholesalesalwar.com/p/lycra-brown-festival-wear-sequins-work-readymade-saree-394400"},
    {"name": "Silk Blue Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Blue-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8309(1).jpg", "url": "https://wholesalesalwar.com/p/silk-blue-wedding-wear-embroidery-work-saree-394443"},
    {"name": "Silk Beige Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Beige-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8308(1).jpg", "url": "https://wholesalesalwar.com/p/silk-beige-wedding-wear-embroidery-work-saree-394442"},
    {"name": "Silk Yellow Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Yellow-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8307(1).jpg", "url": "https://wholesalesalwar.com/p/silk-yellow-wedding-wear-embroidery-work-saree-394441"},
    {"name": "Silk Pink Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Pink-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8306(1).jpg", "url": "https://wholesalesalwar.com/p/silk-pink-wedding-wear-embroidery-work-saree-394440"},
    {"name": "Silk Multi Color Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Multi-Color-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8305(1).jpg", "url": "https://wholesalesalwar.com/p/silk-multi-color-wedding-wear-embroidery-work-saree-394439"},
    {"name": "Silk Beige Wedding Wear Embroidery Work Saree (8304)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Beige-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8304(1).jpg", "url": "https://wholesalesalwar.com/p/silk-beige-wedding-wear-embroidery-work-saree-394438"},
    {"name": "Silk Grey Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Grey-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8303(1).jpg", "url": "https://wholesalesalwar.com/p/silk-grey-wedding-wear-embroidery-work-saree-394437"},
    {"name": "Silk Silver Grey Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Silver-Grey-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8302(1).jpg", "url": "https://wholesalesalwar.com/p/silk-silver-grey-wedding-wear-embroidery-work-saree-394436"},
    {"name": "Silk Multi Color Wedding Wear Embroidery Work Saree (8301)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Multi-Color-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8301(1).jpg", "url": "https://wholesalesalwar.com/p/silk-multi-color-wedding-wear-embroidery-work-saree-394435"},
    {"name": "Silk Blend Rani Pink Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Rani-Pink-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1006(1).jpg", "url": "https://wholesalesalwar.com/p/silk-blend-rani-pink-casual-wear-jari-work-saree-394452"},
    {"name": "Silk Blend Navy Blue Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Navy-Blue-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1005(1).jpg", "url": "https://wholesalesalwar.com/p/silk-blend-navy-blue-casual-wear-jari-work-saree-394451"},
    {"name": "Silk Blend Red Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Red-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1004(1).jpg", "url": "https://wholesalesalwar.com/p/silk-blend-red-casual-wear-jari-work-saree-394450"},
    {"name": "Silk Blend Green Casual Wear Jari Work Saree (1003)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Green-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1003(1).jpg", "url": "https://wholesalesalwar.com/p/silk-blend-green-casual-wear-jari-work-saree-394449"},
    {"name": "Silk Blend Orange Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Orange-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1002(1).jpg", "url": "https://wholesalesalwar.com/p/silk-blend-orange-casual-wear-jari-work-saree-394448"},
    {"name": "Silk Blend Green Casual Wear Jari Work Saree (1001)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Green-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1001(1).jpg", "url": "https://wholesalesalwar.com/p/silk-blend-green-casual-wear-jari-work-saree-394447"},
    {"name": "Silk Yellow Wedding Wear Embroidery Work Saree (5611)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Yellow-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5611(1).jpg", "url": "https://wholesalesalwar.com/p/silk-yellow-wedding-wear-embroidery-work-saree-394463"},
    {"name": "Silk Multi Color Wedding Wear Embroidery Work Saree (5610)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Multi-Color-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5610(1).jpg", "url": "https://wholesalesalwar.com/p/silk-multi-color-wedding-wear-embroidery-work-saree-394462"},
    {"name": "Silk Yellow Wedding Wear Embroidery Work Saree (5609)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Yellow-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5609(1).jpg", "url": "https://wholesalesalwar.com/p/silk-yellow-wedding-wear-embroidery-work-saree-394461"},
    {"name": "Silk Rama Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Rama-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5608(1).jpg", "url": "https://wholesalesalwar.com/p/silk-rama-wedding-wear-embroidery-work-saree-394460"},
    {"name": "Silk Rani Pink Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Rani-Pink-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5607(1).jpg", "url": "https://wholesalesalwar.com/p/silk-rani-pink-wedding-wear-embroidery-work-saree-394459"},
    {"name": "Silk Light Green Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Light-Green-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5606(1).jpg", "url": "https://wholesalesalwar.com/p/silk-light-green-wedding-wear-embroidery-work-saree-394458"},
    {"name": "Silk Purple Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Purple-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5605(1).jpg", "url": "https://wholesalesalwar.com/p/silk-purple-wedding-wear-embroidery-work-saree-394457"},
    {"name": "Silk Multi Color Wedding Wear Embroidery Work Saree (5604)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Multi-Color-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5604(1).jpg", "url": "https://wholesalesalwar.com/p/silk-multi-color-wedding-wear-embroidery-work-saree-394456"},
    {"name": "Silk Light Pink Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Light-Pink-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5603(1).jpg", "url": "https://wholesalesalwar.com/p/silk-light-pink-wedding-wear-embroidery-work-saree-394455"},
    {"name": "Silk Orange Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Orange-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5602(1).jpg", "url": "https://wholesalesalwar.com/p/silk-orange-wedding-wear-embroidery-work-saree-394454"},
    {"name": "Silk Navy Blue Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Navy-Blue-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5601(1).jpg", "url": "https://wholesalesalwar.com/p/silk-navy-blue-wedding-wear-embroidery-work-saree-394453"},
    {"name": "Pure Silk Multi Color Occasional Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61032/Multi-Color-Pure-Silk-Occasional-Wear-Embroidery-Work-Saree-4177-8714(1).jpg", "url": "https://wholesalesalwar.com/p/pure-silk-multi-color-occasional-wear-embroidery-work-saree-394266"},
]

SUITS = [
    {"name": "Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit (10115)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61157/Multi-Color-Crepe-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-ANIKA-10115(1).jpg", "url": "https://wholesalesalwar.com/p/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-394469"},
    {"name": "Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit (10114)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61157/Multi-Color-Crepe-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-ANIKA-10114(1).jpg", "url": "https://wholesalesalwar.com/p/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-394468"},
    {"name": "Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit (10112)", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61157/Multi-Color-Crepe-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-ANIKA-10112(1).jpg", "url": "https://wholesalesalwar.com/p/crepe-silk-multi-color-party-wear-embroidery-work-readymade-plazzo-suit-394467"},
    {"name": "Chinon Silk Wine Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61156/Wine-Chinon-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-BARKHA-10040(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-silk-wine-party-wear-embroidery-work-readymade-plazzo-suit-394466"},
    {"name": "Chinon Silk Lime Yellow Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61156/Lime-Yellow-Chinon-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-BARKHA-10039(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-silk-lime-yellow-party-wear-embroidery-work-readymade-plazzo-suit-394465"},
    {"name": "Chinon Silk Rani Pink Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61156/Rani-Pink-Chinon-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-BARKHA-10038(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-silk-rani-pink-party-wear-embroidery-work-readymade-plazzo-suit-394464"},
    {"name": "Shimmer Silk Light Green Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61099/Light-Green-Shimmer-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-NAZIA-COLOUR-7453-F(1).jpg", "url": "https://wholesalesalwar.com/p/shimmer-silk-light-green-festival-wear-embroidery-work-readymade-plazzo-suit"},
    {"name": "Shimmer Silk Pink Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61099/Pink-Shimmer-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-NAZIA-COLOUR-7453-E(1).jpg", "url": "https://wholesalesalwar.com/p/shimmer-silk-pink-festival-wear-embroidery-work-readymade-plazzo-suit"},
    {"name": "Shimmer Silk Turquoise Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61099/Turquise--Shimmer-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-NAZIA-COLOUR-7453-D(1).jpg", "url": "https://wholesalesalwar.com/p/shimmer-silk-turquise-festival-wear-embroidery-work-readymade-plazzo-suit"},
    {"name": "Chinon Silk Orange Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61026/Orange-Chinon-Silk-Occasional-Wear-Embroidery-Work-Readymade-Paty-Wear-HOF-402(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-silk-orange-occasional-wear-embroidery-work-readymade-paty-wear-394107"},
    {"name": "Chinon Silk Navy Blue Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61026/Navy-Blue-Chinon-Silk-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-HOF-401(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-silk-navy-blue-occasional-wear-embroidery-work-readymade-plazzo-suit-394106"},
    {"name": "Fendy Silk Maroon Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61029/Maroon-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-HOF-433(1).jpg", "url": "https://wholesalesalwar.com/p/fendy-silk-maroon-festival-wear-embroidery-work-readymade-plazzo-suit-394116"},
    {"name": "Fendy Silk Black Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61029/Black-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-HOF-432(1).jpg", "url": "https://wholesalesalwar.com/p/fendy-silk-black-festival-wear-embroidery-work-readymade-plazzo-suit-394115"},
    {"name": "Fendy Silk Navy Blue Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61029/Navy-Blue-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-HOF-431(1).jpg", "url": "https://wholesalesalwar.com/p/fendy-silk-navy-blue-festival-wear-embroidery-work-readymade-plazzo-suit-394114"},
    {"name": "Chinon Navy Blue Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61068/Navy-Blue-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-SARIKA-1904(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-navy-blue-occasional-wear-embroidery-work-readymade-plazzo-suit-394058"},
    {"name": "Chinon Hot Pink Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61068/Hot-Pink-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-SARIKA-1903(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-hot-pink-occasional-wear-embroidery-work-readymade-plazzo-suit-394057"},
    {"name": "Chinon Green Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61068/GREEN-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-SARIKA-1902(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-green-occasional-wear-embroidery-work-readymade-plazzo-suit-394056"},
    {"name": "Chinon Violet Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61068/Violet-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-SARIKA-1901(1).jpg", "url": "https://wholesalesalwar.com/p/chinon-violet-occasional-wear-embroidery-work-readymade-plazzo-suit-394055"},
    {"name": "Georgette Pink Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61067/Pink-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-AMAIRA-1004(1).jpg", "url": "https://wholesalesalwar.com/p/georgette-pink-occasional-wear-embroidery-work-readymade-plazzo-suit-394054"},
    {"name": "Georgette Wine Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61067/Wine-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-AMAIRA-1003(1).jpg", "url": "https://wholesalesalwar.com/p/georgette-wine-occasional-wear-embroidery-work-readymade-plazzo-suit-394053"},
    {"name": "Georgette Green Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61067/GREEN-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-AMAIRA-1002(1).jpg", "url": "https://wholesalesalwar.com/p/georgette-green-occasional-wear-embroidery-work-readymade-plazzo-suit-394052"},
    {"name": "Georgette Purple Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61067/Purple-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-AMAIRA-1001(1).jpg", "url": "https://wholesalesalwar.com/p/georgette-purple-occasional-wear-embroidery-work-readymade-plazzo-suit-394051"},
    {"name": "Fendy Silk Teal Blue Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/60992/Teal-Blue-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-Rose-950(1).jpg", "url": "https://wholesalesalwar.com/p/fendy-silk-teal-blue-festival-wear-embroidery-work-readymade-plazzo-suit-393964"},
    {"name": "Fendy Silk Rani Pink Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/60992/Rani-Pink-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-Rose-949(1).jpg", "url": "https://wholesalesalwar.com/p/fendy-silk-rani-pink-festival-wear-embroidery-work-readymade-plazzo-suit-393963"},
    {"name": "Silk Black Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Black-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-261(1).jpg", "url": "https://wholesalesalwar.com/p/silk-black-occasional-wear-mirror-work-readymade-patiyala-suit-394006"},
    {"name": "Silk Light Pink Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Light-Pink-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-260(1).jpg", "url": "https://wholesalesalwar.com/p/silk-light-pink-occasional-wear-mirror-work-readymade-patiyala-suit-394005"},
    {"name": "Silk Green Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Green-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-259(1).jpg", "url": "https://wholesalesalwar.com/p/silk-green-occasional-wear-mirror-work-readymade-patiyala-suit-394004"},
    {"name": "Silk Maroon Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Maroon-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-258(1).jpg", "url": "https://wholesalesalwar.com/p/silk-maroon-occasional-wear-mirror-work-readymade-patiyala-suit-394003"},
    {"name": "Silk Rani Pink Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Rani-Pink-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-257(1).jpg", "url": "https://wholesalesalwar.com/p/silk-rani-pink-occasional-wear-mirror-work-readymade-patiyala-suit-394002"},
    {"name": "Silk Purple Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Purple-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-256(1).jpg", "url": "https://wholesalesalwar.com/p/silk-purple-occasional-wear-mirror-work-readymade-patiyala-suit-394001"},
]

SHERWANIS = [
    {"name": "Art Silk Grey Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Grey-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4032(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-grey-wedding-wear-hand-embroidery-readymade-groom-sherwani-386005"},
    {"name": "Art Silk Purple Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Purple-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4031(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-purple-wedding-wear-hand-embroidery-readymade-groom-sherwani-386004"},
    {"name": "Art Silk Off White Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Off-White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4030(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-off-white-wedding-wear-hand-embroidery-readymade-groom-sherwani-386003"},
    {"name": "Art Silk Light Pink Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Light-Pink-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4029(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-light-pink-wedding-wear-hand-embroidery-readymade-groom-sherwani-386002"},
    {"name": "Art Silk White Wedding Wear Hand Embroidery Readymade Groom Sherwani (4028)", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4028(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-white-wedding-wear-hand-embroidery-readymade-groom-sherwani-386001"},
    {"name": "Art Silk White Wedding Wear Hand Embroidery Readymade Groom Sherwani (4027)", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4027(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-white-wedding-wear-hand-embroidery-readymade-groom-sherwani-386000"},
    {"name": "Banarasi Jacquard Black Wedding Wear Neck Work Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Black-Banarasi-Jacquard-Wedding-Wear-Neck-Work-Readymade-Groom-Sherwani-4026(1).jpg", "url": "https://wholesalesalwar.com/p/banarasi-jacquard-black-wedding-wear-neck-work-readymade-groom-sherwani-385999"},
    {"name": "Banarasi Jacquard Blue Wedding Wear Neck Work Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Blue-Banarasi-Jacquard-Wedding-Wear-Neck-Work-Readymade-Groom-Sherwani-4025(1).jpg", "url": "https://wholesalesalwar.com/p/banarasi-jacquard-blue-wedding-wear-hand-embroidery-readymade-groom-sherwani-385998"},
    {"name": "Banarasi Jacquard Maroon Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Maroon-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4024(1).jpg", "url": "https://wholesalesalwar.com/p/banarasi-jacquard-maroon-wedding-wear-hand-embroidery-readymade-groom-sherwani-385997"},
    {"name": "Banarasi Jacquard Mustard Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Mustard-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4023(1).jpg", "url": "https://wholesalesalwar.com/p/banarasi-jacquard-mustard-wedding-wear-hand-embroidery-readymade-groom-sherwani-385996"},
    {"name": "Banarasi Jacquard Peach Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Peach-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4022(1).jpg", "url": "https://wholesalesalwar.com/p/banarasi-jacquard-peach-wedding-wear-hand-embroidery-readymade-groom-sherwani-385995"},
    {"name": "Banarasi Jacquard Pink Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Pink-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4021(1).jpg", "url": "https://wholesalesalwar.com/p/banarasi-jacquard-pink-wedding-wear-hand-embroidery-readymade-groom-sherwani-385994"},
    {"name": "Embosed Velvet Navy Blue Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Navy-Blue-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4151(1).jpg", "url": "https://wholesalesalwar.com/p/embosed-velvet-navy-blue-wedding-wear-embroidery-work-readymade-sherwani-385513"},
    {"name": "Embosed Velvet Magenta Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Magenta-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4150(1).jpg", "url": "https://wholesalesalwar.com/p/embosed-velvet-magenta-wedding-wear-embroidery-work-readymade-sherwani-385512"},
    {"name": "Art Silk Navy Blue Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Navy-Blue-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4149(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-navy-blue-wedding-wear-embroidery-work-readymade-sherwani-385511"},
    {"name": "Embosed Velvet Black Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Black-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4148(1).jpg", "url": "https://wholesalesalwar.com/p/embosed-velvet-black-wedding-wear-embroidery-work-readymade-sherwani-385510"},
    {"name": "Art Silk Wine Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Wine-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4147(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-wine-wedding-wear-embroidery-work-readymade-sherwani-385509"},
    {"name": "Art Silk Black Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Black-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4146(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-black-wedding-wear-embroidery-work-readymade-sherwani-385508"},
    {"name": "Art Silk Teal Blue Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Teal-Blue-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4145(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-teal-blue-wedding-wear-embroidery-work-readymade-sherwani-385507"},
    {"name": "Art Silk Pista Green Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Pista-Green-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4144(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-pista-green-wedding-wear-embroidery-work-readymade-sherwani-385506"},
    {"name": "Art Silk Beige Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Beige-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4143(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-beige-wedding-wear-embroidery-work-readymade-sherwani-385505"},
    {"name": "Art Silk Light Pink Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Light-Pink-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4141(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-light-pink-wedding-wear-embroidery-work-readymade-sherwani-385503"},
    {"name": "Art Silk Onion Groom Wear Thread Work Readymade Sherwani (4014)", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Onion-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4014(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-onion-groom-wear-thread-work-readymade-sherwani-385488"},
    {"name": "Art Silk Firozi Green Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Firozi-Green-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4013(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-firozi-green-groom-wear-thread-work-readymade-sherwani-385487"},
    {"name": "Art Silk Onion Groom Wear Thread Work Readymade Sherwani (4012)", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Onion-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4012(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-onion-groom-wear-thread-work-readymade-sherwani-385486"},
    {"name": "Art Silk Beige Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Beige-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4011(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-beige-groom-wear-thread-work-readymade-sherwani-385485"},
    {"name": "Art Silk Cream Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Cream-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4010(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-cream-groom-wear-thread-work-readymade-sherwani-385484"},
    {"name": "Art Silk Light Pink Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Light-Pink-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4009(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-light-pink-groom-wear-thread-work-readymade-sherwani-385483"},
    {"name": "Art Silk Pista Green Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Pista-Green-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4008(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-pista-green-groom-wear-thread-work-readymade-sherwani-385482"},
    {"name": "Art Silk Off White Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Off-White-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4007(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-off-white-groom-wear-thread-work-readymade-sherwani-385481"},
]

# ============ HELPER FUNCTIONS ============

def make_handle(name, source_id=""):
    """Convert product name to URL-friendly handle, appending source ID for uniqueness."""
    handle = name.lower()
    # Remove parenthetical design numbers like (8304), (5611) - they're already in the name for display
    handle = re.sub(r'\s*\(\d+\)\s*', '', handle)
    handle = re.sub(r'[^a-z0-9\s-]', '', handle)
    handle = re.sub(r'[\s]+', '-', handle)
    handle = re.sub(r'-+', '-', handle)
    handle = handle.strip('-')
    # Append source ID for uniqueness to prevent duplicate handle collisions
    if source_id:
        handle = f"{handle}-{source_id}"
    return handle

def extract_source_id(url):
    """Extract product ID from wholesalesalwar URL."""
    match = re.search(r'-(\d+)$', url)
    if match:
        return match.group(1)
    return ""

def extract_color(name):
    """Extract color from product name."""
    colors = ['Mauve', 'Blue', 'Brown', 'Beige', 'Yellow', 'Pink', 'Multi Color', 'Grey', 'Silver Grey',
              'Rani Pink', 'Red', 'Green', 'Orange', 'Light Green', 'Purple', 'Light Pink', 'Rama',
              'Wine', 'Lime Yellow', 'Hot Pink', 'Violet', 'Teal Blue', 'Navy Blue',
              'Black', 'Maroon', 'Pista Green', 'Firozi Green', 'Onion', 'Cream', 'Off White', 'White',
              'Magenta', 'Peach', 'Mustard', 'Turquoise']
    for color in sorted(colors, key=len, reverse=True):
        if color.lower() in name.lower():
            return color
    return ''

def extract_fabric(name):
    """Extract fabric from product name."""
    fabrics = ['Lycra', 'Silk Blend', 'Pure Silk', 'Silk', 'Crepe Silk', 'Chinon Silk', 'Shimmer Silk',
               'Fendy Silk', 'Chinon', 'Georgette', 'Art Silk', 'Banarasi Jacquard', 'Embosed Velvet',
               'Organza Silk', 'Viscose Shimmer', 'Zari Organza Satin', 'Uppada Silk', 'Self Woven Jacquard Silk',
               'Soft Georgette', 'Two Tone Satin Silk', 'Lustraus Satin Silk']
    for fabric in sorted(fabrics, key=len, reverse=True):
        if fabric.lower() in name.lower():
            return fabric
    return ''

def extract_occasion(name):
    """Extract occasion from product name."""
    occasions = ['Wedding Wear', 'Festival Wear', 'Party Wear', 'Casual Wear', 'Occasional Wear', 'Groom Wear']
    for occasion in sorted(occasions, key=len, reverse=True):
        if occasion.lower() in name.lower():
            return occasion
    return ''

def extract_work(name):
    """Extract work type from product name."""
    works = ['Sequins Work', 'Embroidery Work', 'Jari Work', 'Hand Embroidery', 'Neck Work',
             'Thread Work', 'Mirror Work']
    for work in sorted(works, key=len, reverse=True):
        if work.lower() in name.lower():
            return work
    return ''

def extract_garment_type(name):
    """Extract garment type from product name."""
    types = ['Readymade Plazzo Suit', 'Readymade Patiyala Suit', 'Readymade Saree',
             'Readymade Groom Sherwani', 'Readymade Sherwani', 'Saree', 'Sherwani']
    for gt in sorted(types, key=len, reverse=True):
        if gt.lower() in name.lower():
            return gt
    return ''

def calc_usd_price(inr_price):
    """Calculate USD selling price: INR × 2 ÷ 90, rounded to .99"""
    raw = inr_price * 2 / 90
    # Round to nearest whole dollar then subtract 1 cent for .99 pricing
    rounded = math.floor(raw) + 0.99
    return round(rounded, 2)

def calc_compare_at(usd_price):
    """Calculate compare-at price: USD × 1.43 (shows ~30% off)"""
    return round(usd_price * 1.43, 2)

def generate_description(name, product_type):
    """Generate rich product description HTML matching the existing CSV format."""
    color = extract_color(name)
    fabric = extract_fabric(name)
    occasion = extract_occasion(name)
    work = extract_work(name)

    # Tagline variety
    taglines = [
        "Wear it once and it becomes a favourite. Wear it twice and it becomes yours.",
        "Not every outfit tells a story. This one does.",
        "There are pieces that fill a wardrobe - and then there are pieces that define one.",
        "Quiet confidence. Considered craftsmanship. One extraordinary outfit.",
        "Style is a form of self-expression. This piece speaks volumes.",
        "Elegance isn't loud. It's this.",
        "Some outfits are worn. This one is experienced.",
        "When the occasion calls for something unforgettable, this answers.",
        "Where heritage meets modern sophistication - this is that piece.",
        "Because the right outfit can change the entire feeling of a day.",
    ]

    tagline = taglines[hash(name) % len(taglines)]

    desc = f'<p><em>{tagline}</em></p>\n\n'
    desc += f'<h2>{name}</h2>\n\n'

    desc += f'<p>Meet the <strong>{name}</strong> - a beautifully crafted '
    if product_type == 'Saree':
        desc += '<strong>saree</strong> made for '
    elif product_type == 'Suit':
        desc += '<strong>suit</strong> made for '
    else:
        desc += '<strong>sherwani</strong> made for '

    if occasion:
        desc += f'{occasion.lower()} celebrations'
    else:
        desc += 'special celebrations'
    desc += '. Whether you\'re dressing for a wedding ceremony, a festive reception, or any celebration that calls for something extraordinary, this piece delivers the perfect balance of heritage, elegance, and contemporary style.</p>\n\n'

    desc += f'<h3>The Fabric</h3>\n'
    fabric_descs = {
        'Lycra': 'Fluid, figure-flattering, and effortlessly comfortable - lycra drapes like a dream and moves with you, making it the perfect canvas for artistic detail.',
        'Silk': 'Luxurious, luminous, and steeped in tradition - silk catches the light with every fold, creating a regal presence that transforms any occasion into something extraordinary.',
        'Pure Silk': 'The pinnacle of Indian textile artistry - pure silk offers an unmatched luminosity and drape that elevates every occasion into a celebration of craftsmanship.',
        'Silk Blend': 'A thoughtful blend of silk\'s natural lustre with modern practicality - silk blend offers the elegance of silk with enhanced durability and ease of wear.',
        'Crepe Silk': 'Delicate yet resilient, crepe silk offers a beautifully textured surface with a subtle sheen that catches light differently from every angle.',
        'Chinon Silk': 'Lightweight and luxuriously soft, chinon silk drapes with an effortless grace that makes it a favourite for celebration wear.',
        'Shimmer Silk': 'Woven with a subtle metallic thread, shimmer silk catches the light with every movement - creating an ethereal glow that makes every moment feel like a celebration.',
        'Fendy Silk': 'Rich and distinctive, fendy silk combines the elegance of traditional silk with a contemporary texture that stands out in any gathering.',
        'Chinon': 'Whisper-light and endlessly graceful, chinon fabric floats like a dream and creates silhouettes that are both timeless and contemporary.',
        'Georgette': 'Ethereal and effortlessly elegant, georgette drapes with a beautiful fluidity that moves gracefully with every step.',
        'Art Silk': 'Artisan-crafted artificial silk that mirrors the lustre and drape of pure silk at a more accessible price point, without compromising on visual impact.',
        'Banarasi Jacquard': 'Woven on traditional Banarasi looms, this jacquard fabric features intricate patterns that tell stories of generations of master weavers.',
        'Embosed Velvet': 'Opulent and deeply textured, embossed velvet creates a three-dimensional pattern that catches light and attention from across the room.',
    }
    if fabric in fabric_descs:
        desc += f'<p><strong>{fabric}.</strong> {fabric_descs[fabric]}</p>\n\n'
    else:
        desc += f'<p><strong>{fabric}.</strong> Chosen for its exceptional drape, longevity, and the way it makes the wearer feel as good as they look.</p>\n\n'

    if work:
        work_descs = {
            'Sequins Work': 'Dazzling sequin artistry that catches the light with every movement - creating a showstopping sparkle effect.',
            'Embroidery Work': 'Intricate embroidery that transforms fabric into art - each stitch placed with precision to create patterns that captivate up close and from across the room.',
            'Jari Work': 'Traditional jari (zari) threading that weaves metallic brilliance into the fabric - a technique perfected over centuries of Indian textile artistry.',
            'Hand Embroidery': 'Masterfully hand-embroidered by skilled artisans - each piece carries the unique touch of human craftsmanship that machine work simply cannot replicate.',
            'Neck Work': 'Concentrated artistry at the neckline - the focal point of any outfit, where the most intricate detailing creates a captivating first impression.',
            'Thread Work': 'Delicate thread artistry that creates subtle texture and dimension - a testament to the patience and skill of traditional Indian craftsmanship.',
            'Mirror Work': 'Traditional mirror work (shisha) that creates a captivating play of light - each mirror carefully embedded by hand to create patterns that dance with every movement.',
        }
        desc += f'<h3>The Work</h3>\n'
        desc += f'<p><strong>{work}.</strong> {work_descs.get(work, "Exquisite craftsmanship that elevates this piece beyond the ordinary.")}</p>\n\n'

    desc += f'<h3>Why You\'ll Love This Piece</h3>\n<ul>\n'
    desc += f'  <li><strong>Colour:</strong> A carefully selected <strong>{color}</strong> tone - flattering across skin tones, stunning in photographs, and rich under both natural and indoor lighting.</li>\n'
    desc += f'  <li><strong>Fabric:</strong> {fabric} - chosen for its drape, longevity, and the way it makes the wearer feel as good as they look.</li>\n'
    if occasion:
        desc += f'  <li><strong>Occasion:</strong> Crafted for {occasion.lower()} - equally beautiful at intimate family gatherings and grand celebrations.</li>\n'
    desc += f'  <li><strong>Silhouette:</strong> Designed to move with you, not restrict you - flattering across a wide range of body types.</li>\n'
    desc += f'  <li><strong>Provenance:</strong> Sourced from India\'s finest textile regions and curated by our boutique team for exceptional quality.</li>\n'
    desc += f'</ul>\n\n'

    desc += f'<h3>Styling Notes</h3>\n'
    styling_notes = [
        "Style with a sleek bun and bold bindi for timeless Indian elegance, or let it flow loose for contemporary bridal glamour.",
        "This is the kind of piece that photographs beautifully and feels even better in person.",
        "Pair with delicate gold jhumkas and a sleek bun for timeless Indian elegance.",
        "Complete the look with kundan jewellery and embellished heels for a showstopping entrance.",
        "Style with minimal accessories to let the craftsmanship speak - or layer with heirloom jewellery for full festive drama.",
        "Drape it with confidence and let the fabric do the talking - pair with statement jhumkas for a look that commands the room.",
    ]
    desc += f'<p>{styling_notes[hash(name) % len(styling_notes)]}</p>\n\n'

    desc += f'<h3>Common Questions</h3>\n'
    if product_type == 'Saree':
        desc += f'<p><strong>What occasions is this saree suitable for?</strong> This saree works beautifully for wedding ceremonies, festive gatherings, religious celebrations, reception events, and any occasion that calls for something extraordinary.</p>\n'
        desc += f'<p><strong>Is the blouse included?</strong> Yes, this saree comes with a matching blouse piece that can be stitched to your measurements.</p>\n'
    elif product_type == 'Suit':
        desc += f'<p><strong>What occasions is this suit suitable for?</strong> This suit works beautifully for festive celebrations, party events, casual gatherings, and any occasion that calls for effortless ethnic elegance.</p>\n'
        desc += f'<p><strong>Is this suit stitched?</strong> Yes, this is a readymade stitched suit in free size that fits XS to L comfortably.</p>\n'
    else:
        desc += f'<p><strong>What occasions is this sherwani suitable for?</strong> This sherwani is crafted for wedding ceremonies, reception events, and any celebration that calls for regal menswear.</p>\n'
        desc += f'<p><strong>What sizes are available?</strong> This sherwani is available in sizes 38-44. Please select your size when ordering.</p>\n'
    desc += f'<p><strong>How do I care for this fabric?</strong> We recommend dry cleaning to preserve the embroidery and fabric quality. Store folded in a cool, dry place away from direct sunlight.</p>\n\n'

    # Tags line
    tag_words = [color.lower(), fabric.lower(), 'saree' if product_type == 'Saree' else 'suit' if product_type == 'Suit' else 'sherwani']
    tag_line = ', '.join([t for t in tag_words if t])
    desc += f'<p><small>Tags: {tag_line}, buy online, Indian ethnic wear USA, boutique Indian fashion, designer, traditional Indian wear online</small></p>'

    return desc

def generate_tags(name, product_type):
    """Generate tags from product name."""
    tags = []
    color = extract_color(name)
    fabric = extract_fabric(name)
    occasion = extract_occasion(name)
    work = extract_work(name)

    if color: tags.append(color)
    if fabric: tags.append(fabric)
    if occasion: tags.append(occasion)
    if work: tags.append(work)

    if product_type == 'Saree':
        tags.extend(['Saree', 'Sarees'])
    elif product_type == 'Suit':
        tags.extend(['Suit', 'Salwar Kameez', 'Designer Suit'])
    elif product_type == "Men's Indian Wear":
        tags.extend(['Sherwani', 'Menswear', 'Groom Wear'])

    return ', '.join(tags)

def get_seo_description(name, product_type):
    """Generate SEO description (truncated for meta tag)."""
    color = extract_color(name)
    fabric = extract_fabric(name)
    occasion = extract_occasion(name)
    work = extract_work(name)
    desc = f"Shop the {name} at LuxeMia. "
    if fabric:
        desc += f"Crafted in premium {fabric}"
    if work:
        desc += f" with exquisite {work}"
    desc += f" in {color}. "
    if occasion:
        desc += f"Perfect for {occasion.lower()}. "
    desc += "Free shipping on orders over $150. Dry clean only."
    return desc[:320]  # SEO description limit

# ============ BUILD PRICE LOOKUP ============
# Create a lookup from URL suffix to scraped price data
price_lookup = {}
for p in all_products:
    url = p.get('url', '')
    # Extract the URL slug (last part of URL)
    slug = url.replace('https://wholesalesalwar.com/p/', '')
    price_lookup[slug] = p

# ============ BUILD CSV ROWS ============
rows = []
sku_counters = {'SAR': 0, 'SUT': 0, 'MIW': 0}

# Shopify 57-column CSV fieldnames
FIELDNAMES = [
    'Title', 'URL handle', 'Description', 'Vendor', 'Product category', 'Type', 'Tags',
    'Published on online store', 'Status', 'SKU', 'Barcode',
    'Option1 name', 'Option1 value', 'Option1 Linked To',
    'Option2 name', 'Option2 value', 'Option2 Linked To',
    'Option3 name', 'Option3 value', 'Option3 Linked To',
    'Price', 'Compare-at price', 'Cost per item', 'Charge tax', 'Tax code',
    'Unit price total measure', 'Unit price total measure unit',
    'Unit price base measure', 'Unit price base measure unit',
    'Inventory tracker', 'Inventory quantity', 'Continue selling when out of stock',
    'Weight value (grams)', 'Weight unit for display', 'Requires shipping', 'Fulfillment service',
    'Product image URL', 'Image position', 'Image alt text', 'Variant image URL',
    'Gift card', 'SEO title', 'SEO description',
    'Color (product.metafields.shopify.color-pattern)',
    'Google Shopping / Google product category', 'Google Shopping / Gender',
    'Google Shopping / Age group', 'Google Shopping / Manufacturer part number (MPN)',
    'Google Shopping / Ad group name', 'Google Shopping / Ads labels',
    'Google Shopping / Condition', 'Google Shopping / Custom product',
    'Google Shopping / Custom label 0', 'Google Shopping / Custom label 1',
    'Google Shopping / Custom label 2', 'Google Shopping / Custom label 3',
    'Google Shopping / Custom label 4'
]

def empty_row():
    """Return a dict with all fieldnames set to empty string."""
    return {k: '' for k in FIELDNAMES}

def lookup_price(url, name):
    """Look up the scraped price for a product by its URL."""
    slug = url.replace('https://wholesalesalwar.com/p/', '')
    if slug in price_lookup:
        p = price_lookup[slug]
        if p.get('status') == 'UNAVAILABLE' or p.get('price_inr') is None:
            return None
        return p
    # Try matching by name
    for p in all_products:
        if p.get('name', '').lower() == name.lower() and p.get('price_inr'):
            return p
    return None

# ---- Process Sarees ----
for i, p in enumerate(SAREES):
    source_id = extract_source_id(p['url'])
    handle = make_handle(p['name'], source_id)
    sku_counters['SAR'] += 1
    sku = f"LXM-SAR-{sku_counters['SAR']:03d}"
    color = extract_color(p['name'])

    price_data = lookup_price(p['url'], p['name'])
    if price_data is None:
        print(f"  WARNING: No price found for saree: {p['name']} ({p['url']})")
        continue

    usd_price = calc_usd_price(price_data['price_inr'])
    compare_at = calc_compare_at(usd_price)

    desc = generate_description(p['name'], 'Saree')
    tags = generate_tags(p['name'], 'Saree')
    seo_desc = get_seo_description(p['name'], 'Saree')

    # Primary row
    row = empty_row()
    row.update({
        'Title': p['name'],
        'URL handle': handle,
        'Description': desc,
        'Vendor': 'LuxemiaShop',
        'Product category': 'Apparel & Accessories > Clothing',
        'Type': 'Sarees',
        'Tags': tags,
        'Published on online store': 'TRUE',
        'Status': 'Active',
        'SKU': sku,
        'Option1 name': 'Color',
        'Option1 value': color,
        'Price': str(usd_price),
        'Compare-at price': str(compare_at),
        'Charge tax': 'TRUE',
        'Inventory tracker': 'shopify',
        'Inventory quantity': '50',
        'Continue selling when out of stock': 'DENY',
        'Requires shipping': 'TRUE',
        'Fulfillment service': 'manual',
        'Product image URL': p['img'],
        'Image position': '1',
        'Image alt text': p['name'],
        'Gift card': 'FALSE',
        'SEO title': p['name'],
        'SEO description': seo_desc,
        'Color (product.metafields.shopify.color-pattern)': color.lower(),
        'Google Shopping / Google product category': 'Apparel & Accessories > Clothing',
        'Google Shopping / Gender': 'Unisex',
        'Google Shopping / Age group': 'Adult',
        'Google Shopping / Condition': 'New',
        'Google Shopping / Custom product': 'FALSE',
    })
    rows.append(row)

    # Additional image rows
    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        img_row = empty_row()
        img_row['URL handle'] = handle
        img_row['Product image URL'] = f"{base_img}({img_pos}).jpg"
        img_row['Image position'] = str(img_pos)
        img_row['Image alt text'] = p['name']
        rows.append(img_row)

# ---- Process Suits ----
for i, p in enumerate(SUITS):
    source_id = extract_source_id(p['url'])
    handle = make_handle(p['name'], source_id)
    sku_counters['SUT'] += 1
    sku = f"LXM-SUT-{sku_counters['SUT']:03d}"
    color = extract_color(p['name'])

    price_data = lookup_price(p['url'], p['name'])
    if price_data is None:
        print(f"  WARNING: No price found for suit: {p['name']} ({p['url']})")
        continue

    usd_price = calc_usd_price(price_data['price_inr'])
    compare_at = calc_compare_at(usd_price)

    desc = generate_description(p['name'], 'Suit')
    tags = generate_tags(p['name'], 'Suit')
    seo_desc = get_seo_description(p['name'], 'Suit')

    row = empty_row()
    row.update({
        'Title': p['name'],
        'URL handle': handle,
        'Description': desc,
        'Vendor': 'LuxemiaShop',
        'Product category': 'Apparel & Accessories > Clothing',
        'Type': 'Sarees' if 'Suit' not in p['name'] else 'Salwar Kameez',
        'Tags': tags,
        'Published on online store': 'TRUE',
        'Status': 'Active',
        'SKU': sku,
        'Option1 name': 'Color',
        'Option1 value': color,
        'Price': str(usd_price),
        'Compare-at price': str(compare_at),
        'Charge tax': 'TRUE',
        'Inventory tracker': 'shopify',
        'Inventory quantity': '50',
        'Continue selling when out of stock': 'DENY',
        'Requires shipping': 'TRUE',
        'Fulfillment service': 'manual',
        'Product image URL': p['img'],
        'Image position': '1',
        'Image alt text': p['name'],
        'Gift card': 'FALSE',
        'SEO title': p['name'],
        'SEO description': seo_desc,
        'Color (product.metafields.shopify.color-pattern)': color.lower(),
        'Google Shopping / Google product category': 'Apparel & Accessories > Clothing',
        'Google Shopping / Gender': 'Unisex',
        'Google Shopping / Age group': 'Adult',
        'Google Shopping / Condition': 'New',
        'Google Shopping / Custom product': 'FALSE',
    })
    rows.append(row)

    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        img_row = empty_row()
        img_row['URL handle'] = handle
        img_row['Product image URL'] = f"{base_img}({img_pos}).jpg"
        img_row['Image position'] = str(img_pos)
        img_row['Image alt text'] = p['name']
        rows.append(img_row)

# ---- Process Sherwanis ----
for i, p in enumerate(SHERWANIS):
    source_id = extract_source_id(p['url'])
    handle = make_handle(p['name'], source_id)
    sku_counters['MIW'] += 1
    base_sku = f"LXM-MIW-{sku_counters['MIW']:03d}"
    color = extract_color(p['name'])

    price_data = lookup_price(p['url'], p['name'])
    if price_data is None:
        print(f"  WARNING: No price found for sherwani: {p['name']} ({p['url']}) - skipping (likely discontinued)")
        continue

    usd_price = calc_usd_price(price_data['price_inr'])
    compare_at = calc_compare_at(usd_price)

    desc = generate_description(p['name'], "Men's Indian Wear")
    tags = generate_tags(p['name'], "Men's Indian Wear")
    seo_desc = get_seo_description(p['name'], "Men's Indian Wear")

    # Sherwanis have size variants (38, 40, 42, 44)
    sizes = ['38', '40', '42', '44']
    for si, size in enumerate(sizes):
        row = empty_row()
        if si == 0:
            # First variant row has all the product info
            row.update({
                'Title': p['name'],
                'Description': desc,
                'Vendor': 'LuxemiaShop',
                'Product category': 'Apparel & Accessories > Clothing',
                'Type': "Men's Indian Wear",
                'Tags': tags,
                'Published on online store': 'TRUE',
                'Status': 'Active',
                'Option1 name': 'Size',
                'Option1 value': size,
                'Price': str(usd_price),
                'Compare-at price': str(compare_at),
                'Charge tax': 'TRUE',
                'Inventory tracker': 'shopify',
                'Inventory quantity': '5',
                'Continue selling when out of stock': 'DENY',
                'Weight value (grams)': '350',
                'Requires shipping': 'TRUE',
                'Fulfillment service': 'manual',
                'Product image URL': p['img'],
                'Image position': '1',
                'Image alt text': p['name'],
                'Gift card': 'FALSE',
                'SEO title': p['name'],
                'SEO description': seo_desc,
                'Color (product.metafields.shopify.color-pattern)': color.lower(),
                'Google Shopping / Google product category': 'Apparel & Accessories > Clothing',
                'Google Shopping / Gender': 'Male',
                'Google Shopping / Age group': 'Adult',
                'Google Shopping / Condition': 'New',
                'Google Shopping / Custom product': 'FALSE',
            })
        else:
            row.update({
                'Option1 name': 'Size',
                'Option1 value': size,
                'Price': str(usd_price),
                'Compare-at price': str(compare_at),
                'Charge tax': 'TRUE',
                'Inventory tracker': 'shopify',
                'Inventory quantity': '5',
                'Continue selling when out of stock': 'DENY',
                'Weight value (grams)': '350',
                'Requires shipping': 'TRUE',
                'Fulfillment service': 'manual',
                'Gift card': 'FALSE',
            })
        row['URL handle'] = handle
        row['SKU'] = f"{base_sku}-{size}"
        rows.append(row)

    # Additional image rows for sherwanis
    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        img_row = empty_row()
        img_row['URL handle'] = handle
        img_row['Product image URL'] = f"{base_img}({img_pos}).jpg"
        img_row['Image position'] = str(img_pos)
        img_row['Image alt text'] = p['name']
        rows.append(img_row)

# ============ WRITE CSV ============
output_path = 'public/luxemia_shopify_import.csv'
with open(output_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f"\n✅ Generated {output_path}")
print(f"   Total rows: {len(rows)}")
print(f"   Products: Sarees={sku_counters['SAR']}, Suits={sku_counters['SUT']}, Sherwanis={sku_counters['MIW']}")
print(f"   (1 discontinued sherwani excluded: Banarasi Jacquard Blue #385998)")
