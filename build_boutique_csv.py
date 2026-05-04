import csv
import re

# ============ SCRAPED DATA ============
sarees = [
    {"name": "Lycra Mauve Festival Wear Sequins Work Readymade Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61108/Mauve-Lycra-Festival-Wear-Sequins-Work--Readymade-Saree-AQUA-66683(1).jpg"},
    {"name": "Lycra Blue Festival Wear Sequins Work Readymade Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61108/BluE-Lycra-Festival-Wear-Sequins-Work--Readymade-Saree-AQUA-66682(1).jpg"},
    {"name": "Lycra Brown Festival Wear Sequins Work Readymade Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61108/BROWN-Lycra-Festival-Wear-Sequins-Work--Readymade-Saree-AQUA-66681(1).jpg"},
    {"name": "Silk Blue Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Blue-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8309(1).jpg"},
    {"name": "Silk Beige Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Beige-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8308(1).jpg"},
    {"name": "Silk Yellow Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Yellow-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8307(1).jpg"},
    {"name": "Silk Pink Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Pink-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8306(1).jpg"},
    {"name": "Silk Multi Color Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Multi-Color-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8305(1).jpg"},
    {"name": "Silk Beige Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Beige-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8304(1).jpg"},
    {"name": "Silk Grey Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Grey-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8303(1).jpg"},
    {"name": "Silk Silver Grey Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Silver-Grey-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8302(1).jpg"},
    {"name": "Silk Multi Color Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61118/Multi-Color-Silk-Wedding-Wear-Embroidery-Work-Saree-SHAHI-POSHAK-8301(1).jpg"},
    {"name": "Silk Blend Rani Pink Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Rani-Pink-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1006(1).jpg"},
    {"name": "Silk Blend Navy Blue Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Navy-Blue-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1005(1).jpg"},
    {"name": "Silk Blend Red Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Red-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1004(1).jpg"},
    {"name": "Silk Blend Green Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Green-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1003(1).jpg"},
    {"name": "Silk Blend Orange Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Orange-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1002(1).jpg"},
    {"name": "Silk Blend Green Casual Wear Jari Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61120/Green-Silk-Blend-Casual-Wear-Jari-Work-Saree-Rajwada-1001(1).jpg"},
    {"name": "Silk Yellow Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Yellow-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5611(1).jpg"},
    {"name": "Silk Multi Color Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Multi-Color-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5610(1).jpg"},
    {"name": "Silk Yellow Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Yellow-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5609(1).jpg"},
    {"name": "Silk Rama Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Rama-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5608(1).jpg"},
    {"name": "Silk Rani Pink Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Rani-Pink-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5607(1).jpg"},
    {"name": "Silk Light Green Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Light-Green-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5606(1).jpg"},
    {"name": "Silk Purple Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Purple-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5605(1).jpg"},
    {"name": "Silk Multi Color Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Multi-Color-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5604(1).jpg"},
    {"name": "Silk Light Pink Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Light-Pink-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5603(1).jpg"},
    {"name": "Silk Orange Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Orange-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5602(1).jpg"},
    {"name": "Silk Navy Blue Wedding Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61121/Navy-Blue-Silk-Wedding-Wear-Embroidery-Work-Saree-KS--5601(1).jpg"},
    {"name": "Pure Silk Multi Color Occasional Wear Embroidery Work Saree", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61032/Multi-Color-Pure-Silk-Occasional-Wear-Embroidery-Work-Saree-4177-8714(1).jpg"},
]

suits = [
    {"name": "Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61157/Multi-Color-Crepe-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-ANIKA-10115(1).jpg"},
    {"name": "Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61157/Multi-Color-Crepe-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-ANIKA-10114(1).jpg"},
    {"name": "Crepe Silk Multi Color Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61157/Multi-Color-Crepe-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-ANIKA-10112(1).jpg"},
    {"name": "Chinon Silk Wine Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61156/Wine-Chinon-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-BARKHA-10040(1).jpg"},
    {"name": "Chinon Silk Lime Yellow Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61156/Lime-Yellow-Chinon-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-BARKHA-10039(1).jpg"},
    {"name": "Chinon Silk Rani Pink Party Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61156/Rani-Pink-Chinon-Silk-Party-Wear-Embroidery-Work-Readymade-Plazzo-Suit-BARKHA-10038(1).jpg"},
    {"name": "Shimmer Silk Light Green Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61099/Light-Green-Shimmer-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-NAZIA-COLOUR-7453-F(1).jpg"},
    {"name": "Shimmer Silk Pink Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61099/Pink-Shimmer-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-NAZIA-COLOUR-7453-E(1).jpg"},
    {"name": "Shimmer Silk Turquoise Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61099/Turquise--Shimmer-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-NAZIA-COLOUR-7453-D(1).jpg"},
    {"name": "Chinon Silk Orange Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61026/Orange-Chinon-Silk-Occasional-Wear-Embroidery-Work-Readymade-Paty-Wear-HOF-402(1).jpg"},
    {"name": "Chinon Silk Navy Blue Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61026/Navy-Blue-Chinon-Silk-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-HOF-401(1).jpg"},
    {"name": "Fendy Silk Maroon Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61029/Maroon-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-HOF-433(1).jpg"},
    {"name": "Fendy Silk Black Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61029/Black-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-HOF-432(1).jpg"},
    {"name": "Fendy Silk Navy Blue Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61029/Navy-Blue-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-HOF-431(1).jpg"},
    {"name": "Chinon Navy Blue Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61068/Navy-Blue-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-SARIKA-1904(1).jpg"},
    {"name": "Chinon Hot Pink Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61068/Hot-Pink-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-SARIKA-1903(1).jpg"},
    {"name": "Chinon Green Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61068/GREEN-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-SARIKA-1902(1).jpg"},
    {"name": "Chinon Violet Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61068/Violet-Chinon-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-SARIKA-1901(1).jpg"},
    {"name": "Georgette Pink Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61067/Pink-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-AMAIRA-1004(1).jpg"},
    {"name": "Georgette Wine Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61067/Wine-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-AMAIRA-1003(1).jpg"},
    {"name": "Georgette Green Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61067/GREEN-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-AMAIRA-1002(1).jpg"},
    {"name": "Georgette Purple Occasional Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61067/Purple-Georgette-Occasional-Wear-Embroidery-Work-Readymade-Plazzo-Suit-AMAIRA-1001(1).jpg"},
    {"name": "Fendy Silk Teal Blue Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/60992/Teal-Blue-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-Rose-950(1).jpg"},
    {"name": "Fendy Silk Rani Pink Festival Wear Embroidery Work Readymade Plazzo Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/60992/Rani-Pink-Fendy-Silk-Festival-Wear-Embroidery-Work-Readymade-Plazzo-Suit-Rose-949(1).jpg"},
    {"name": "Silk Black Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Black-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-261(1).jpg"},
    {"name": "Silk Light Pink Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Light-Pink-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-260(1).jpg"},
    {"name": "Silk Green Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Green-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-259(1).jpg"},
    {"name": "Silk Maroon Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Maroon-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-258(1).jpg"},
    {"name": "Silk Rani Pink Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Rani-Pink-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-257(1).jpg"},
    {"name": "Silk Purple Occasional Wear Mirror Work Readymade Patiyala Suit", "img": "https://kesimg.b-cdn.net/images/650/2026y/April/61009/Purple-Silk-Occasional-Wear-Mirror-Work-Readymade-Patiyala-Suit-HOF-256(1).jpg"},
]

sherwanis = [
    {"name": "Art Silk Grey Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Grey-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4032(1).jpg"},
    {"name": "Art Silk Purple Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Purple-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4031(1).jpg"},
    {"name": "Art Silk Off White Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Off-White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4030(1).jpg"},
    {"name": "Art Silk Light Pink Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Light-Pink-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4029(1).jpg"},
    {"name": "Art Silk White Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4028(1).jpg"},
    {"name": "Art Silk White Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4027(1).jpg"},
    {"name": "Banarasi Jacquard Black Wedding Wear Neck Work Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Black-Banarasi-Jacquard-Wedding-Wear-Neck-Work-Readymade-Groom-Sherwani-4026(1).jpg"},
    {"name": "Banarasi Jacquard Blue Wedding Wear Neck Work Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Blue-Banarasi-Jacquard-Wedding-Wear-Neck-Work-Readymade-Groom-Sherwani-4025(1).jpg"},
    {"name": "Banarasi Jacquard Maroon Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Maroon-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4024(1).jpg"},
    {"name": "Banarasi Jacquard Mustard Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Mustard-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4023(1).jpg"},
    {"name": "Banarasi Jacquard Peach Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Peach-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4022(1).jpg"},
    {"name": "Banarasi Jacquard Pink Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Pink-Banarasi-Jacquard-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4021(1).jpg"},
    {"name": "Embosed Velvet Navy Blue Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Navy-Blue-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4151(1).jpg"},
    {"name": "Embosed Velvet Magenta Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Magenta-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4150(1).jpg"},
    {"name": "Art Silk Navy Blue Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Navy-Blue-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4149(1).jpg"},
    {"name": "Embosed Velvet Black Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Black-Embosed-Velvet-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4148(1).jpg"},
    {"name": "Art Silk Wine Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Wine-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4147(1).jpg"},
    {"name": "Art Silk Black Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Black-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4146(1).jpg"},
    {"name": "Art Silk Teal Blue Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Teal-Blue-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4145(1).jpg"},
    {"name": "Art Silk Pista Green Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Pista-Green-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4144(1).jpg"},
    {"name": "Art Silk Beige Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Beige-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4143(1).jpg"},
    {"name": "Art Silk Light Pink Wedding Wear Embroidery Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58974/Light-Pink-Art-Silk-Wedding-Wear-Embroidery-Work-Readymade-Sherwani-4141(1).jpg"},
    {"name": "Art Silk Onion Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Onion-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4014(1).jpg"},
    {"name": "Art Silk Firozi Green Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Firozi-Green-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4013(1).jpg"},
    {"name": "Art Silk Onion Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Onion-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4012(1).jpg"},
    {"name": "Art Silk Beige Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Beige-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4011(1).jpg"},
    {"name": "Art Silk Cream Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Cream-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4010(1).jpg"},
    {"name": "Art Silk Light Pink Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Light-Pink-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4009(1).jpg"},
    {"name": "Art Silk Pista Green Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Pista-Green-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4008(1).jpg"},
    {"name": "Art Silk Off White Groom Wear Thread Work Readymade Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/58972/Off-White-Art-Silk-Groom-Wear-Thread-Work-Readymade-Sherwani-4007(1).jpg"},
]

# ============ HELPER FUNCTIONS ============

opening_lines = [
    "Because the right outfit can change the entire feeling of a day.",
    "Wear it once and it becomes a favourite. Wear it twice and it becomes yours.",
    "Not every outfit tells a story. This one does.",
    "There are pieces that fill a wardrobe — and then there are pieces that define one.",
    "Quiet confidence. Considered craftsmanship. One extraordinary outfit.",
    "Style is a form of self-expression. This piece speaks volumes.",
    "Elegance isn't loud. It's this.",
    "Some outfits are worn. This one is experienced.",
    "When the occasion calls for something unforgettable, this answers.",
    "Where heritage meets modern sophistication — this is that piece.",
]

styling_lines_saree = [
    "Drape it with confidence and let the fabric do the talking — pair with statement jhumkas for a look that commands the room.",
    "Style with a sleek bun and bold bindi for timeless Indian elegance, or let it flow loose for contemporary bridal glamour.",
    "This is the kind of piece that photographs beautifully and feels even better in person.",
    "Pair with delicate gold jhumkas and a sleek bun for timeless Indian elegance.",
    "Complete the look with kundan jewellery and embellished heels for a showstopping entrance.",
    "Style with minimal accessories to let the craftsmanship speak — or layer with heirloom jewellery for full festive drama.",
]

styling_lines_suit = [
    "Pair with a potli bag and statement earrings for a look that needs no filter.",
    "Style with delicate jhumkas and kolhapuri sandals for effortlessly elegant ethnic charm.",
    "This is the kind of piece that photographs beautifully and feels even better in person.",
    "Exclusively from our boutique collection — each piece quality-checked before it reaches you.",
    "Complete the look with a sleek clutch and embellished juttis for a polished festive ensemble.",
    "Style with minimal accessories to let the embroidery shine — or layer with bold jewellery for a dramatic evening look.",
]

styling_lines_sherwani = [
    "Pair with a matching stole and mojari for a timeless baraat look that turns heads.",
    "Style with a pocket square and brooch for a groom-ready ensemble that photographs like a dream.",
    "This is the kind of piece that makes an entrance — confident, refined, and unforgettable.",
    "Complete the look with a turban and statement cufflinks for a regal wedding-day appearance.",
    "Perfect as-is for the groom who lets craftsmanship speak louder than embellishment.",
    "Pair with traditional juttis and a silk stole for a look that honours heritage while feeling completely modern.",
]

def make_handle(name, idx):
    handle = name.lower()
    handle = re.sub(r'[^a-z0-9\s-]', '', handle)
    handle = re.sub(r'[\s]+', '-', handle)
    handle = re.sub(r'-+', '-', handle)
    handle = handle.strip('-')
    # Add index suffix to ensure uniqueness for duplicate names
    return f"{handle}-{idx}"

def extract_color(name):
    colors = ['Silver Grey', 'Multi Color', 'Light Pink', 'Light Green', 'Rani Pink', 'Hot Pink', 
              'Lime Yellow', 'Teal Blue', 'Firozi Green', 'Pista Green', 'Navy Blue', 'Off White',
              'Mauve', 'Blue', 'Brown', 'Beige', 'Yellow', 'Pink', 'Grey', 'Red', 'Green', 'Orange',
              'Purple', 'Violet', 'Wine', 'Maroon', 'Black', 'Cream', 'White', 'Onion', 'Rama',
              'Magenta', 'Peach', 'Mustard', 'Turquoise']
    for color in sorted(colors, key=len, reverse=True):
        if color.lower() in name.lower():
            return color
    return ''

def extract_fabric(name):
    fabrics = ['Embosed Velvet', 'Banarasi Jacquard', 'Pure Silk', 'Silk Blend', 'Crepe Silk',
               'Chinon Silk', 'Shimmer Silk', 'Fendy Silk', 'Art Silk', 'Chinon', 'Georgette',
               'Lycra', 'Silk']
    for fabric in sorted(fabrics, key=len, reverse=True):
        if fabric.lower() in name.lower():
            return fabric
    return ''

def extract_occasion(name):
    occasions = [('Wedding Wear', 'wedding celebrations'), ('Festival Wear', 'festive celebrations'),
                 ('Party Wear', 'celebrations and parties'), ('Casual Wear', 'everyday elegance'),
                 ('Occasional Wear', 'special occasions'), ('Groom Wear', 'groom celebrations')]
    for keyword, label in sorted(occasions, key=lambda x: len(x[0]), reverse=True):
        if keyword.lower() in name.lower():
            return keyword, label
    return 'Special Occasions', 'special occasions'

def extract_work(name):
    works = ['Hand Embroidery', 'Embroidery Work', 'Mirror Work', 'Sequins Work', 'Jari Work',
             'Neck Work', 'Thread Work']
    for work in sorted(works, key=len, reverse=True):
        if work.lower() in name.lower():
            return work
    return ''

def fabric_description(fabric):
    descs = {
        'Lycra': '<strong>Lycra.</strong> Fluid, figure-flattering, and effortlessly comfortable — lycra drapes like a dream and moves with you, making it the perfect canvas for sequin artistry.',
        'Silk': '<strong>Silk.</strong> Luxurious, luminous, and steeped in tradition — silk catches the light with every fold, creating a regal presence that transforms any occasion into something extraordinary.',
        'Pure Silk': '<strong>Pure Silk.</strong> The pinnacle of Indian textile luxury — pure silk offers unmatched lustre, a buttery-soft hand feel, and a weight that drapes with architectural precision. This is fabric that commands attention.',
        'Silk Blend': '<strong>Silk Blend.</strong> The best of both worlds — silk blend combines the natural sheen and elegance of silk with the practical durability of blended fibres, creating a fabric that looks luxurious and wears beautifully.',
        'Crepe Silk': '<strong>Crepe Silk.</strong> Modern, textured, and incredibly chic — crepe silk offers a matte-sheen finish that photographs exquisitely, with a fluid drape that flatters every silhouette.',
        'Chinon Silk': '<strong>Chinon Silk.</strong> Soft, flowy, and effortlessly elegant — chinon silk drapes beautifully against the body, catching light with a subtle sheen that makes every silhouette look intentional and refined.',
        'Chinon': '<strong>Chinon.</strong> Lightweight and gracefully fluid — chinon fabric floats rather than falls, creating an ethereal silhouette that moves beautifully and feels weightless against the skin.',
        'Shimmer Silk': '<strong>Shimmer Silk.</strong> Catching light from every angle — shimmer silk brings a modern glamour to traditional embroidery, creating a fabric that sparkles with every step.',
        'Fendy Silk': '<strong>Fendy Silk.</strong> Rich in texture and generous in drape — fendy silk offers a structured yet flowing silhouette that holds embroidery beautifully and creates a commanding presence.',
        'Georgette': '<strong>Georgette.</strong> Light, airy, and effortlessly graceful — georgette is the fabric of choice for those who value movement and comfort without compromising on style.',
        'Art Silk': '<strong>Art Silk.</strong> The intelligent alternative to pure silk — art silk delivers the same lustrous sheen and structured drape at a fraction of the weight, making it perfect for long celebrations.',
        'Banarasi Jacquard': '<strong>Banarasi Jacquard.</strong> Woven with centuries of Banarasi weaving heritage — the jacquard technique creates intricate patterns that are part of the fabric itself, not merely embroidered on top. This is textile artistry.',
        'Embosed Velvet': '<strong>Embosed Velvet.</strong> Rich, textured, and unapologetically luxurious — embosed velvet creates a three-dimensional pattern that catches light differently from every angle. Made for the groom who commands the room.',
    }
    for k, v in sorted(descs.items(), key=lambda x: len(x[0]), reverse=True):
        if k.lower() in fabric.lower() if fabric else '':
            return v
    return '<strong>Premium Fabric.</strong> Carefully selected for its drape, longevity, and the way it makes the wearer feel as good as she looks.'

def generate_boutique_description(name, product_type, idx):
    color = extract_color(name)
    fabric = extract_fabric(name)
    occasion_keyword, occasion_label = extract_occasion(name)
    work = extract_work(name)
    
    opening = opening_lines[idx % len(opening_lines)]
    
    if product_type == 'Saree':
        garment = 'saree'
        garment_type = 'Readymade Saree' if 'Readymade' in name else 'Saree'
        styling = styling_lines_saree[idx % len(styling_lines_saree)]
        includes = 'Saree with Blouse Piece'
        what_type = 'beautifully draped <strong>saree</strong>'
        occasion_text = occasion_label
        care = 'We recommend dry cleaning to preserve the embroidery and fabric quality. Store folded in a cool, dry place away from direct sunlight.'
    elif product_type == 'Suit':
        garment = 'salwar kameez'
        garment_type = 'Readymade Suit'
        styling = styling_lines_suit[idx % len(styling_lines_suit)]
        includes = 'Top, Bottom & Dupatta'
        what_type = 'beautifully crafted <strong>salwar kameez</strong>'
        occasion_text = occasion_label
        care = 'We recommend gentle hand-washing or dry cleaning to preserve the colour and texture. Store folded in a cool, dry place away from direct sunlight.'
    else:  # Sherwani
        garment = 'sherwani'
        garment_type = 'Readymade Sherwani Set'
        styling = styling_lines_sherwani[idx % len(styling_lines_sherwani)]
        includes = 'Sherwani, Inner Kurta & Bottom'
        what_type = 'meticulously crafted <strong>sherwani</strong>'
        occasion_text = occasion_label
        care = 'We recommend dry cleaning only to preserve the embroidery and fabric structure. Store on a hanger in a breathable garment bag.'
    
    desc = f'<p><em>{opening}</em></p>\n\n'
    desc += f'<h2>{name}</h2>\n\n'
    desc += f'<p>Meet the <strong>{name}</strong> — a {what_type} made for {occasion_text}. '
    
    if product_type == 'Saree':
        desc += f'Whether you\'re dressing for a wedding ceremony, a festive reception, or any celebration that calls for something extraordinary, this piece delivers the perfect balance of heritage, elegance, and contemporary style.</p>\n\n'
    elif product_type == 'Suit':
        desc += f'Whether you\'re dressing for festive gatherings, family celebrations, or any occasion that deserves something special, this piece delivers the perfect balance of heritage, elegance, and contemporary style.</p>\n\n'
    else:
        desc += f'Whether you\'re the groom, a groomsman, or a guest who refuses to blend in, this piece delivers the perfect balance of heritage, craftsmanship, and modern sophistication.</p>\n\n'
    
    desc += f'<h3>The Fabric</h3>\n<p>{fabric_description(fabric)}</p>\n\n'
    
    if work:
        work_desc = {
            'Sequins Work': 'Dazzling sequin artistry that catches the light with every movement — creating a showstopping sparkle effect.',
            'Embroidery Work': 'Intricate embroidery that transforms fabric into art — each stitch placed with precision to create patterns that captivate up close and from across the room.',
            'Hand Embroidery': 'Master artisans have hand-embroidered every motif — a time-intensive process that creates depth and texture machine embroidery simply cannot replicate.',
            'Jari Work': 'Traditional jari (zari) thread work that weaves metallic brilliance into the fabric — a technique passed down through generations of Indian artisans.',
            'Mirror Work': 'Reflective mirror work that adds dimension and sparkle — a Rajasthani craft tradition that transforms any outfit into a celebration of light.',
            'Neck Work': 'Focused craftsmanship at the neckline where it matters most — intricate detailing designed to frame the face and draw the eye.',
            'Thread Work': 'Delicate thread work that creates subtle texture and visual depth — refined craftsmanship that speaks quietly but powerfully.',
        }
        work_text = work_desc.get(work, 'Expert craftsmanship that elevates this piece beyond the ordinary.')
        desc += f'<h3>The Work</h3>\n<p><strong>{work}.</strong> {work_text}</p>\n\n'
    
    desc += f'<h3>Why You\'ll Love This Piece</h3>\n<ul>\n'
    if color:
        desc += f'  <li><strong>Colour:</strong> A carefully selected <strong>{color}</strong> tone — flattering across skin tones, stunning in photographs, and rich under both natural and indoor lighting.</li>\n'
    desc += f'  <li><strong>Fabric:</strong> {fabric} — chosen for its drape, longevity, and the way it makes the wearer feel as good as they look.</li>\n'
    desc += f'  <li><strong>Occasion:</strong> Crafted for {occasion_text} — equally beautiful at intimate family gatherings and grand celebrations.</li>\n'
    desc += f'  <li><strong>Silhouette:</strong> Designed to move with you, not restrict you — flattering across a wide range of body types.</li>\n'
    desc += f'  <li><strong>Provenance:</strong> Sourced from India\'s finest textile regions and curated by our boutique team for exceptional quality.</li>\n'
    desc += f'</ul>\n\n'
    
    desc += f'<h3>Styling Notes</h3>\n<p>{styling}</p>\n\n'
    
    desc += f'<h3>Common Questions</h3>\n'
    if product_type == 'Saree':
        desc += f'<details><summary><strong>What occasions is this saree suitable for?</strong></summary><p>This saree works beautifully for wedding ceremonies, festive gatherings, religious celebrations, reception events, and any occasion that calls for something extraordinary.</p></details>\n'
        desc += f'<details><summary><strong>Is the blouse included?</strong></summary><p>Yes, this saree comes with a matching blouse piece that can be stitched to your measurements.</p></details>\n'
    elif product_type == 'Suit':
        desc += f'<details><summary><strong>What occasions is this salwar suit suitable for?</strong></summary><p>This suit works beautifully for festive gatherings, family occasions, religious ceremonies, Eid, Diwali, cultural functions, and semi-formal events.</p></details>\n'
        desc += f'<details><summary><strong>Is this suit readymade?</strong></summary><p>Yes, this is a readymade stitched suit in Free Size, designed to fit comfortably from XS to L.</p></details>\n'
    else:
        desc += f'<details><summary><strong>What occasions is this sherwani suitable for?</strong></summary><p>This sherwani is perfect for wedding baraat, sangeet, reception, engagement, and any celebration where you want to make a statement.</p></details>\n'
        desc += f'<details><summary><strong>Is this sherwani readymade?</strong></summary><p>Yes, this is a readymade sherwani set including inner kurta and bottom — ready to wear, no tailoring needed.</p></details>\n'
    desc += f'<details><summary><strong>How do I care for this fabric?</strong></summary><p>{care}</p></details>\n\n'
    
    # SEO tags
    if product_type == 'Saree':
        tags_text = f'saree, {color.lower()} saree, {fabric.lower()} saree, buy saree online, Indian ethnic wear USA, boutique Indian fashion, {occasion_keyword.lower()} saree, designer saree, traditional Indian wear online, saree boutique'
    elif product_type == 'Suit':
        tags_text = f'salwar kameez, {color.lower()} salwar kameez, buy salwar kameez online, Indian ethnic wear USA, boutique Indian fashion, {occasion_keyword.lower()} suit, designer suit, traditional Indian wear online, salwar kameez boutique'
    else:
        tags_text = f'sherwani, {color.lower()} sherwani, buy sherwani online, groom wear, Indian menswear USA, boutique men\'s fashion, {occasion_keyword.lower()} sherwani, designer sherwani, wedding sherwani online, groom boutique'
    
    desc += f'<p><small>Tags: {tags_text}</small></p>'
    
    return desc

def generate_tags(name, product_type):
    tags = []
    color = extract_color(name)
    fabric = extract_fabric(name)
    occasion_keyword, _ = extract_occasion(name)
    work = extract_work(name)
    
    if color: tags.append(color)
    if fabric: tags.append(fabric)
    if occasion_keyword: tags.append(occasion_keyword)
    if work: tags.append(work)
    
    if product_type == 'Saree':
        tags.extend(['Saree', 'Sarees'])
    elif product_type == 'Suit':
        tags.extend(['Suit', 'Salwar Kameez', 'Designer Suit'])
    elif product_type == "Men's Indian Wear":
        tags.extend(['Sherwani', 'Menswear', 'Groom Wear', 'Indo-Western'])
    
    return ', '.join(tags)

# ============ BUILD CSV ============

rows = []
sku_counters = {'SAR': 0, 'SUT': 0, 'MIW': 0}

fieldnames = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags',
              'Published', 'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams',
              'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
              'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
              'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position',
              'Image Alt Text', 'Status']

def empty_row(handle):
    return {k: '' for k in fieldnames[:-1]} | {'Handle': handle, 'Status': ''}

# Process sarees
for i, p in enumerate(sarees):
    sku_counters['SAR'] += 1
    sku = f"LXM-SAR-{sku_counters['SAR']:03d}"
    handle = make_handle(p['name'], sku_counters['SAR'])
    desc = generate_boutique_description(p['name'], 'Saree', sku_counters['SAR'])
    tags = generate_tags(p['name'], 'Saree')
    
    if 'Pure Silk' in p['name']:
        price = '98.99'
    elif 'Lycra' in p['name']:
        price = '64.99'
    elif 'Silk Blend' in p['name']:
        price = '69.99'
    else:
        price = '78.99'
    
    row = {
        'Handle': handle, 'Title': p['name'], 'Body (HTML)': desc,
        'Vendor': 'LuxeMia', 'Product Category': 'Apparel & Accessories > Clothing',
        'Type': 'Saree', 'Tags': tags, 'Published': 'true',
        'Option1 Name': '', 'Option1 Value': 'Free Size',
        'Variant SKU': sku, 'Variant Grams': '250',
        'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': '10',
        'Variant Inventory Policy': 'deny', 'Variant Fulfillment Service': 'manual',
        'Variant Price': price, 'Variant Compare At Price': '',
        'Variant Requires Shipping': 'true', 'Variant Taxable': 'true',
        'Image Src': p['img'], 'Image Position': '1',
        'Image Alt Text': p['name'], 'Status': 'active'
    }
    rows.append(row)
    
    # Additional images
    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        r = empty_row(handle)
        r['Image Src'] = f"{base_img}({img_pos}).jpg"
        r['Image Position'] = str(img_pos + 1)
        r['Image Alt Text'] = p['name']
        rows.append(r)

# Process suits
for i, p in enumerate(suits):
    sku_counters['SUT'] += 1
    sku = f"LXM-SUT-{sku_counters['SUT']:03d}"
    handle = make_handle(p['name'], sku_counters['SUT'])
    desc = generate_boutique_description(p['name'], 'Suit', sku_counters['SUT'])
    tags = generate_tags(p['name'], 'Suit')
    
    if 'Fendy Silk' in p['name']:
        price = '84.99'
    elif 'Crepe Silk' in p['name'] or 'Shimmer Silk' in p['name']:
        price = '79.99'
    else:
        price = '74.99'
    
    row = {
        'Handle': handle, 'Title': p['name'], 'Body (HTML)': desc,
        'Vendor': 'LuxeMia', 'Product Category': 'Apparel & Accessories > Clothing',
        'Type': 'Suit', 'Tags': tags, 'Published': 'true',
        'Option1 Name': '', 'Option1 Value': 'Free Size',
        'Variant SKU': sku, 'Variant Grams': '250',
        'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': '10',
        'Variant Inventory Policy': 'deny', 'Variant Fulfillment Service': 'manual',
        'Variant Price': price, 'Variant Compare At Price': '',
        'Variant Requires Shipping': 'true', 'Variant Taxable': 'true',
        'Image Src': p['img'], 'Image Position': '1',
        'Image Alt Text': p['name'], 'Status': 'active'
    }
    rows.append(row)
    
    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        r = empty_row(handle)
        r['Image Src'] = f"{base_img}({img_pos}).jpg"
        r['Image Position'] = str(img_pos + 1)
        r['Image Alt Text'] = p['name']
        rows.append(r)

# Process sherwanis
for i, p in enumerate(sherwanis):
    sku_counters['MIW'] += 1
    sku = f"LXM-MIW-{sku_counters['MIW']:03d}"
    handle = make_handle(p['name'], sku_counters['MIW'])
    desc = generate_boutique_description(p['name'], "Men's Indian Wear", sku_counters['MIW'])
    tags = generate_tags(p['name'], "Men's Indian Wear")
    
    if 'Embosed Velvet' in p['name']:
        price = '149.99'
    elif 'Banarasi Jacquard' in p['name']:
        price = '134.99'
    else:
        price = '124.86'
    
    # First variant with size 38 and primary image
    row = {
        'Handle': handle, 'Title': p['name'], 'Body (HTML)': desc,
        'Vendor': 'LuxeMia', 'Product Category': 'Apparel & Accessories > Clothing',
        'Type': "Men's Indian Wear", 'Tags': tags, 'Published': 'true',
        'Option1 Name': 'Size', 'Option1 Value': '38',
        'Variant SKU': f"{sku}-38", 'Variant Grams': '350',
        'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': '5',
        'Variant Inventory Policy': 'deny', 'Variant Fulfillment Service': 'manual',
        'Variant Price': price, 'Variant Compare At Price': '',
        'Variant Requires Shipping': 'true', 'Variant Taxable': 'true',
        'Image Src': p['img'], 'Image Position': '1',
        'Image Alt Text': p['name'], 'Status': 'active'
    }
    rows.append(row)
    
    # Additional size variants
    for size in [40, 42, 44]:
        r = empty_row(handle)
        r['Option1 Name'] = 'Size'
        r['Option1 Value'] = str(size)
        r['Variant SKU'] = f"{sku}-{size}"
        r['Variant Grams'] = '350'
        r['Variant Inventory Tracker'] = 'shopify'
        r['Variant Inventory Qty'] = '5'
        r['Variant Inventory Policy'] = 'deny'
        r['Variant Fulfillment Service'] = 'manual'
        r['Variant Price'] = price
        r['Variant Requires Shipping'] = 'true'
        r['Variant Taxable'] = 'true'
        rows.append(r)
    
    # Additional images
    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        r = empty_row(handle)
        r['Image Src'] = f"{base_img}({img_pos}).jpg"
        r['Image Position'] = str(img_pos + 1)
        r['Image Alt Text'] = p['name']
        rows.append(r)

# Write CSV
output_path = '/home/z/my-project/download/luxemia_shopify_import_with_images.csv'
with open(output_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

# Also copy to public
import shutil
shutil.copy(output_path, '/home/z/my-project/public/luxemia_shopify_import.csv')

print(f"CSV written to {output_path}")
print(f"Total rows: {len(rows)}")
print(f"Unique products: 90")
print(f"  Sarees: LXM-SAR-001 to LXM-SAR-030")
print(f"  Suits: LXM-SUT-001 to LXM-SUT-030")
print(f"  Sherwanis: LXM-MIW-001 to LXM-MIW-030")

