import csv
import re
import json

# ============ ALL SCRAPED DATA ============

sarees = [
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

suits = [
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

sherwanis = [
    {"name": "Art Silk Grey Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Grey-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4032(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-grey-wedding-wear-hand-embroidery-readymade-groom-sherwani-386005"},
    {"name": "Art Silk Purple Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Purple-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4031(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-purple-wedding-wear-hand-embroidery-readymade-groom-sherwani-386004"},
    {"name": "Art Silk Off White Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Off-White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4030(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-off-white-wedding-wear-hand-embroidery-readymade-groom-sherwani-386003"},
    {"name": "Art Silk Light Pink Wedding Wear Hand Embroidery Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Light-Pink-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4029(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-light-pink-wedding-wear-hand-embroidery-readymade-groom-sherwani-386002"},
    {"name": "Art Silk White Wedding Wear Hand Embroidery Readymade Groom Sherwani (4028)", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4028(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-white-wedding-wear-hand-embroidery-readymade-groom-sherwani-386001"},
    {"name": "Art Silk White Wedding Wear Hand Embroidery Readymade Groom Sherwani (4027)", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/White-Art-Silk-Wedding-Wear-Hand-Embroidery-Readymade-Groom-Sherwani-4027(1).jpg", "url": "https://wholesalesalwar.com/p/art-silk-white-wedding-wear-hand-embroidery-readymade-groom-sherwani-386000"},
    {"name": "Banarasi Jacquard Black Wedding Wear Neck Work Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Black-Banarasi-Jacquard-Wedding-Wear-Neck-Work-Readymade-Groom-Sherwani-4026(1).jpg", "url": "https://wholesalesalwar.com/p/banarasi-jacquard-black-wedding-wear-neck-work-readymade-groom-sherwani-385999"},
    {"name": "Banarasi Jacquard Blue Wedding Wear Neck Work Readymade Groom Sherwani", "img": "https://kesimg.b-cdn.net/images/650/2025y/October/59064/Blue-Banarasi-Jacquard-Wedding-Wear-Neck-Work-Readymade-Groom-Sherwani-4025(1).jpg", "url": "https://wholesalesalwar.com/p/banarasi-jacquard-blue-wedding-wear-neck-work-readymade-groom-sherwani-385998"},
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

def make_handle(name):
    """Convert product name to URL-friendly handle"""
    handle = name.lower()
    handle = re.sub(r'[^a-z0-9\s-]', '', handle)
    handle = re.sub(r'[\s]+', '-', handle)
    handle = re.sub(r'-+', '-', handle)
    handle = handle.strip('-')
    return handle

def extract_color(name):
    """Extract color from product name"""
    colors = ['Mauve', 'Blue', 'Brown', 'Beige', 'Yellow', 'Pink', 'Multi Color', 'Grey', 'Silver Grey', 
              'Rani Pink', 'Red', 'Green', 'Orange', 'Light Green', 'Purple', 'Light Pink', 'Rama',
              'Wine', 'Lime Yellow', 'Light Pink', 'Hot Pink', 'Violet', 'Teal Blue', 'Navy Blue',
              'Black', 'Maroon', 'Pista Green', 'Firozi Green', 'Onion', 'Cream', 'Off White', 'White',
              'Magenta', 'Peach', 'Mustard', 'Turquoise']
    for color in sorted(colors, key=len, reverse=True):
        if color.lower() in name.lower():
            return color
    return ''

def extract_fabric(name):
    """Extract fabric from product name"""
    fabrics = ['Lycra', 'Silk Blend', 'Pure Silk', 'Silk', 'Crepe Silk', 'Chinon Silk', 'Shimmer Silk',
               'Fendy Silk', 'Chinon', 'Georgette', 'Art Silk', 'Banarasi Jacquard', 'Embosed Velvet',
               'Organza Silk', 'Viscose Shimmer', 'Zari Organza Satin', 'Uppada Silk', 'Self Woven Jacquard Silk',
               'Soft Georgette', 'Two Tone Satin Silk', 'Lustraus Satin Silk']
    for fabric in sorted(fabrics, key=len, reverse=True):
        if fabric.lower() in name.lower():
            return fabric
    return ''

def extract_occasion(name):
    """Extract occasion from product name"""
    occasions = ['Wedding Wear', 'Festival Wear', 'Party Wear', 'Casual Wear', 'Occasional Wear', 'Groom Wear']
    for occasion in sorted(occasions, key=len, reverse=True):
        if occasion.lower() in name.lower():
            return occasion
    return ''

def extract_work(name):
    """Extract work type from product name"""
    works = ['Sequins Work', 'Embroidery Work', 'Jari Work', 'Hand Embroidery', 'Neck Work', 
             'Thread Work', 'Mirror Work']
    for work in sorted(works, key=len, reverse=True):
        if work.lower() in name.lower():
            return work
    return ''

def extract_garment_type(name):
    """Extract garment type from product name"""
    types = ['Readymade Plazzo Suit', 'Readymade Patiyala Suit', 'Readymade Saree', 
             'Readymade Groom Sherwani', 'Readymade Sherwani', 'Saree', 'Sherwani']
    for gt in sorted(types, key=len, reverse=True):
        if gt.lower() in name.lower():
            return gt
    return ''

def generate_description(name, product_type):
    """Generate product description HTML"""
    color = extract_color(name)
    fabric = extract_fabric(name)
    occasion = extract_occasion(name)
    work = extract_work(name)
    garment = extract_garment_type(name)
    
    desc = f'<p><strong>Fabric:</strong> {fabric}</p>'
    if work:
        desc += f'<p><strong>Work:</strong> {work}</p>'
    desc += f'<p><strong>Color:</strong> {color}</p>'
    
    if product_type == 'Saree':
        desc += '<p><strong>Includes:</strong> Saree with Blouse Piece</p>'
        desc += '<p><strong>Customization available:</strong> Blouse Stitching, Custom Sizing, Fall & Pico Finishing</p>'
    elif product_type == 'Suit':
        desc += '<p><strong>Type:</strong> Readymade Stitched Suit</p>'
        desc += '<p><strong>Sizing:</strong> Free Size (fits XS-L)</p>'
        desc += '<p><strong>Includes:</strong> Top, Bottom & Dupatta</p>'
    elif product_type == "Men's Indian Wear":
        desc += '<p><strong>Type:</strong> Readymade Sherwani Set</p>'
        desc += '<p><strong>Includes:</strong> Sherwani, Inner Kurta & Churidar/Bottom</p>'
        desc += '<p><strong>Sizing:</strong> Available in sizes 38-44</p>'
    
    if occasion:
        desc += f'<p><strong>Occasions:</strong> {occasion.replace(" Wear", "")}, Wedding, Festive</p>'
    else:
        desc += '<p><strong>Occasions:</strong> Wedding, Festive, Celebration</p>'
    
    desc += '<p><strong>Care:</strong> Dry clean only</p>'
    desc += '<p><strong>Delivery:</strong> 5-7 business days</p>'
    return desc

def generate_tags(name, product_type):
    """Generate tags from product name"""
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

# Build CSV rows
rows = []
sku_counters = {'SAR': 0, 'SUT': 0, 'MIW': 0}

# Process sarees
for i, p in enumerate(sarees, 1):
    handle = make_handle(p['name'])
    sku_counters['SAR'] += 1
    sku = f"LXM-SAR-{sku_counters['SAR']:03d}"
    color = extract_color(p['name'])
    fabric = extract_fabric(p['name'])
    
    # Determine price based on fabric
    if 'Pure Silk' in p['name']:
        price = '98.99'
    elif 'Lycra' in p['name']:
        price = '64.99'
    else:
        price = '78.99'
    
    desc = generate_description(p['name'], 'Saree')
    tags = generate_tags(p['name'], 'Saree')
    
    # Primary row with all data
    rows.append({
        'Handle': handle,
        'Title': p['name'],
        'Body (HTML)': desc,
        'Vendor': 'LuxeMia',
        'Product Category': 'Apparel & Accessories > Clothing',
        'Type': 'Saree',
        'Tags': tags,
        'Published': 'true',
        'Option1 Name': '',
        'Option1 Value': 'Free Size',
        'Variant SKU': sku,
        'Variant Grams': '250',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': '10',
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': price,
        'Variant Compare At Price': '',
        'Variant Requires Shipping': 'true',
        'Variant Taxable': 'true',
        'Image Src': p['img'],
        'Image Position': '1',
        'Image Alt Text': p['name'],
        'Status': 'active'
    })
    
    # Additional image rows (derive (2) and (3) images from CDN URL pattern)
    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        additional_img = f"{base_img}({img_pos}).jpg"
        rows.append({
            'Handle': handle,
            'Title': '', 'Body (HTML)': '', 'Vendor': '', 'Product Category': '', 'Type': '',
            'Tags': '', 'Published': '', 'Option1 Name': '', 'Option1 Value': '',
            'Variant SKU': '', 'Variant Grams': '', 'Variant Inventory Tracker': '',
            'Variant Inventory Qty': '', 'Variant Inventory Policy': '',
            'Variant Fulfillment Service': '', 'Variant Price': '',
            'Variant Compare At Price': '', 'Variant Requires Shipping': '',
            'Variant Taxable': '', 'Image Src': additional_img,
            'Image Position': str(img_pos + 1),
            'Image Alt Text': p['name'], 'Status': ''
        })

# Process suits
for i, p in enumerate(suits, 1):
    handle = make_handle(p['name'])
    sku_counters['SUT'] += 1
    sku = f"LXM-SUT-{sku_counters['SUT']:03d}"
    
    if 'Fendy Silk' in p['name'] or 'Chinon Silk' in p['name']:
        price = '84.99'
    elif 'Crepe Silk' in p['name'] or 'Shimmer Silk' in p['name']:
        price = '79.99'
    else:
        price = '74.99'
    
    desc = generate_description(p['name'], 'Suit')
    tags = generate_tags(p['name'], 'Suit')
    
    rows.append({
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
    })
    
    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        additional_img = f"{base_img}({img_pos}).jpg"
        rows.append({
            'Handle': handle, 'Title': '', 'Body (HTML)': '', 'Vendor': '',
            'Product Category': '', 'Type': '', 'Tags': '', 'Published': '',
            'Option1 Name': '', 'Option1 Value': '', 'Variant SKU': '',
            'Variant Grams': '', 'Variant Inventory Tracker': '',
            'Variant Inventory Qty': '', 'Variant Inventory Policy': '',
            'Variant Fulfillment Service': '', 'Variant Price': '',
            'Variant Compare At Price': '', 'Variant Requires Shipping': '',
            'Variant Taxable': '', 'Image Src': additional_img,
            'Image Position': str(img_pos + 1), 'Image Alt Text': p['name'], 'Status': ''
        })

# Process sherwanis
for i, p in enumerate(sherwanis, 1):
    handle = make_handle(p['name'])
    sku_counters['MIW'] += 1
    base_sku = f"LXM-MIW-{sku_counters['MIW']:03d}"
    
    if 'Embosed Velvet' in p['name']:
        price = '149.99'
    elif 'Banarasi Jacquard' in p['name']:
        price = '134.99'
    else:
        price = '124.86'
    
    desc = generate_description(p['name'], "Men's Indian Wear")
    tags = generate_tags(p['name'], "Men's Indian Wear")
    
    # Sherwanis have size variants - add first row with size 38
    rows.append({
        'Handle': handle, 'Title': p['name'], 'Body (HTML)': desc,
        'Vendor': 'LuxeMia', 'Product Category': 'Apparel & Accessories > Clothing',
        'Type': "Men's Indian Wear", 'Tags': tags, 'Published': 'true',
        'Option1 Name': 'Size', 'Option1 Value': '38',
        'Variant SKU': f"{base_sku}-38", 'Variant Grams': '350',
        'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': '5',
        'Variant Inventory Policy': 'deny', 'Variant Fulfillment Service': 'manual',
        'Variant Price': price, 'Variant Compare At Price': '',
        'Variant Requires Shipping': 'true', 'Variant Taxable': 'true',
        'Image Src': p['img'], 'Image Position': '1',
        'Image Alt Text': p['name'], 'Status': 'active'
    })
    
    # Additional size variants
    for size in [40, 42, 44]:
        rows.append({
            'Handle': handle, 'Title': '', 'Body (HTML)': '', 'Vendor': '',
            'Product Category': '', 'Type': '', 'Tags': '', 'Published': '',
            'Option1 Name': 'Size', 'Option1 Value': str(size),
            'Variant SKU': f"{base_sku}-{size}", 'Variant Grams': '350',
            'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': '5',
            'Variant Inventory Policy': 'deny', 'Variant Fulfillment Service': 'manual',
            'Variant Price': price, 'Variant Compare At Price': '',
            'Variant Requires Shipping': 'true', 'Variant Taxable': 'true',
            'Image Src': '', 'Image Position': '', 'Image Alt Text': '', 'Status': ''
        })
    
    # Additional image rows
    base_img = p['img'].replace('(1).jpg', '')
    for img_pos in [2, 3]:
        additional_img = f"{base_img}({img_pos}).jpg"
        rows.append({
            'Handle': handle, 'Title': '', 'Body (HTML)': '', 'Vendor': '',
            'Product Category': '', 'Type': '', 'Tags': '', 'Published': '',
            'Option1 Name': '', 'Option1 Value': '', 'Variant SKU': '',
            'Variant Grams': '', 'Variant Inventory Tracker': '',
            'Variant Inventory Qty': '', 'Variant Inventory Policy': '',
            'Variant Fulfillment Service': '', 'Variant Price': '',
            'Variant Compare At Price': '', 'Variant Requires Shipping': '',
            'Variant Taxable': '', 'Image Src': additional_img,
            'Image Position': str(img_pos + 1), 'Image Alt Text': p['name'], 'Status': ''
        })

# Write CSV
output_path = '/home/z/my-project/download/luxemia_shopify_import_with_images.csv'
fieldnames = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags',
              'Published', 'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams',
              'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
              'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
              'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position',
              'Image Alt Text', 'Status']

with open(output_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f"CSV written to {output_path}")
print(f"Total rows: {len(rows)}")
print(f"Unique products: 30 sarees + 30 suits + 30 sherwanis = 90 products")
print(f"  Saree SKUs: LXM-SAR-001 to LXM-SAR-030")
print(f"  Suit SKUs: LXM-SUT-001 to LXM-SUT-030")
print(f"  Sherwani SKUs: LXM-MIW-001 to LXM-MIW-030")

