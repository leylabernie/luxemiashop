"""Generate docs/audits/META_COPY_OPTIMIZATION_2026-09-18.csv

Compares the committed SEO architecture titles/descriptions (what production
serves) with proposed high-intent rewrites. Product rows carry live PDP titles
captured 2026-09-18 via Googlebot fetch and a reusable PDP copy pattern.

Run from repo root:  python scripts/generate-meta-copy-audit.py
"""
import csv
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'audits', 'META_COPY_OPTIMIZATION_2026-09-18.csv')

with open(os.path.join(ROOT, 'src', 'config', 'seoArchitecture.json'), encoding='utf-8') as f:
    routes = json.load(f).get('routes', {})

# Proposed high-intent rewrites keyed by route path:
# (proposed title, proposed meta description, primary keywords, secondary keywords)
proposed = {
    '/': (
        'Indian Ethnic Wear Online USA | Sarees, Lehengas & More | LuxeMia',
        'Shop bridal lehengas, wedding sarees and salwar suits online in the USA. '
        'Free US shipping over $150, custom stitching and a $30 fit guarantee.',
        'indian ethnic wear online usa; buy lehenga online usa',
        'bridal saree online; indian wedding outfits for women',
    ),
    '/collections/bridal-lehengas': (
        'Bridal Lehengas Online USA | Buy Wedding Lehenga | LuxeMia',
        'Buy bridal lehengas online in the USA with custom stitching. Compare embroidered '
        'wedding lehenga prices, fabrics and included dupatta. Free US shipping over $199.',
        'bridal lehenga online usa; buy wedding lehenga online',
        'indian bridal lehenga price; lehenga with dupatta',
    ),
    '/collections/wedding-sarees': (
        'Wedding Sarees Online USA | Reception & Guest | LuxeMia',
        'Shop wedding and reception sarees online in the USA. Silk, georgette and organza '
        'sarees with stitched blouse options, tracked shipping and easy size help.',
        'wedding saree online usa; reception saree online',
        'indian wedding guest saree; silk saree usa',
    ),
    '/collections/party-wear-lehengas': (
        'Party Wear Lehengas USA | Festive & Sangeet | LuxeMia',
        'Party wear lehengas for sangeet, haldi and festive nights — shipped across the USA. '
        'Compare sequin work, fabrics and prices. Free US shipping over $199.',
        'party wear lehenga usa; sangeet lehenga online',
        'festive lehenga choli; sequin lehenga online',
    ),
    '/collections/designer-sarees': (
        'Designer Sarees Online USA | Embroidered Styles | LuxeMia',
        'Designer sarees with embroidery and stonework, shipped USA-wide. Compare '
        'blouse-included styles, fabrics and current prices. Custom stitching available.',
        'designer saree online usa; embroidered saree online',
        'party wear saree usa; saree with stitched blouse',
    ),
    '/collections/anarkali-suits': (
        'Anarkali Suits Online USA | Wedding & Party Wear | LuxeMia',
        'Buy Anarkali suits online in the USA. Floor-length Anarkalis with dupatta and '
        'bottoms, custom stitching available. Free US shipping over $199.',
        'anarkali suit online usa; buy anarkali dress online',
        'floor length anarkali usa; anarkali with dupatta',
    ),
    '/collections/gharara-suits': (
        'Gharara Suit Sets Online USA | Wedding Wear | LuxeMia',
        'Gharara suit sets for weddings and nikah events, shipped across the USA. Compare '
        'embroidery, sizes and included pieces before you order.',
        'gharara suit online usa; gharara set for wedding',
        'pakistani style gharara usa; nikah outfit online',
    ),
    '/collections/sharara-suits': (
        'Sharara Suits Online USA | Wedding Sets | LuxeMia',
        'Shop sharara suits online for weddings, sangeet and festive events in the USA. '
        'Compare embroidered sets, sizes and included dupatta. Tracked US shipping.',
        'sharara suit online usa; sharara set wedding',
        'sangeet sharara; indian sharara dress usa',
    ),
    '/collections/wedding-guest-outfits': (
        'Indian Wedding Guest Outfits USA | Sarees & Lehengas | LuxeMia',
        'Not sure what to wear to an Indian wedding? Shop guest outfits by event — mehendi, '
        'sangeet, reception — shipped USA-wide with size guidance.',
        'indian wedding guest outfits usa; what to wear to indian wedding',
        'wedding guest lehenga; wedding guest saree usa',
    ),
    '/collections/navratri-outfits': (
        'Navratri Chaniya Choli USA | Garba & Dandiya | LuxeMia',
        'Navratri chaniya choli with mirror work for Garba and Dandiya nights in the USA. '
        'Compare fabrics, sizes and included dupatta. Order before the festive rush.',
        'navratri chaniya choli usa; garba dress online',
        'dandiya outfit usa; mirror work chaniya choli',
    ),
    '/lehengas': (
        'Lehengas Online USA | Bridal & Festive Lehenga Choli | LuxeMia',
        'Shop lehenga cholis online in the USA — bridal, party and festive styles with '
        'custom stitching and a $30 fit guarantee. Free US shipping over $199.',
        'lehenga online usa; lehenga choli online usa',
        'buy lehenga usa; custom lehenga stitching',
    ),
    '/sarees': (
        'Sarees Online USA | Wedding & Party Wear Sarees | LuxeMia',
        'Buy sarees online in the USA. Compare silk, georgette and organza sarees with '
        'blouse options, stitching choices and tracked shipping. Free shipping over $199.',
        'saree online usa; buy saree online usa',
        'indian saree usa; saree with blouse',
    ),
    '/suits': (
        'Salwar Kameez & Indian Suits Online USA | LuxeMia',
        'Shop salwar kameez, palazzo and Anarkali suits online in the USA. Compare fabrics, '
        'embroidery and stitching options. Free US shipping over $199.',
        'salwar kameez online usa; indian suits online',
        'palazzo suit usa; punjabi suit online usa',
    ),
    '/menswear': (
        'Menswear: Sherwanis & Kurta Pajama Online USA | LuxeMia',
        'Buy sherwanis, kurta pajama and Indo-western menswear online in the USA. Groom and '
        'wedding-party styles with size help and tracked shipping.',
        'sherwani online usa; kurta pajama online usa',
        'groom sherwani usa; indo western menswear',
    ),
    '/jewelry': (
        'Kundan & Polki Bridal Jewelry Online USA | LuxeMia',
        'Shop kundan-style and polki-style bridal jewelry sets online in the USA. Compare '
        'necklace sets, materials and included pieces. Tracked US shipping.',
        'kundan jewelry online usa; polki jewelry set usa',
        'indian bridal jewelry set usa',
    ),
}

# Live PDP titles captured 2026-09-18 (Googlebot fetch of prerendered HTML).
# These are examples of the PDP pattern; the same rules apply catalog-wide.
pdp_examples = [
    (
        'https://luxemia.shop/product/3d-peacock-mirror-work-italian-silk-ready-made-blouse',
        'Peacock Mirror Work Italian Silk Ready-Made Blouse | LuxeMia',
        'Ready-made blouse in peacock mirror-work Italian silk — no tailor needed. '
        'Sizing help and tracked US shipping; free over $199.',
        'ready made saree blouse online; mirror work blouse usa',
    ),
    (
        'https://luxemia.shop/product/antique-gold-georgette-saree-with-embroidered-blouse-luxemia',
        'Antique Gold Georgette Saree with Blouse Fabric | LuxeMia',
        'Antique gold georgette saree with embroidered blouse fabric — wedding-ready. '
        'Custom stitching option, tracked US shipping, free over $199.',
        'georgette saree online usa; antique gold saree',
    ),
    (
        'https://luxemia.shop/product/antique-gold-zari-tissue-silk-saree',
        'Antique Gold Zari Tissue Silk Saree | LuxeMia',
        'Zari tissue silk saree in antique gold for weddings and receptions. Blouse options, '
        'size guidance and tracked US delivery. Free shipping over $199.',
        'zari tissue silk saree; tissue saree online usa',
    ),
    (
        'https://luxemia.shop/product/beige-fancy-work-art-silk-groom-sherwani-with-stole',
        'Beige Art Silk Groom Sherwani with Stole | LuxeMia',
        'Beige art silk sherwani with stole for grooms and wedding parties. Size help before '
        'you order and tracked US shipping. Free over $199.',
        'groom sherwani online usa; sherwani with stole',
    ),
    (
        'https://luxemia.shop/product/black-beaded-embroidered-silk-lehenga-choli-set',
        'Black Beaded Silk Lehenga Choli Set | LuxeMia',
        'Black beaded silk lehenga choli set for receptions and parties. Compare sizes and '
        'included pieces; custom stitching available. Free US shipping over $199.',
        'black lehenga choli online; beaded lehenga usa',
    ),
    (
        'https://luxemia.shop/product/black-butter-silk-real-mirror-gota-patti-navratri-lehenga-choli',
        'Black Butter Silk Mirror Gota Patti Navratri Lehenga | LuxeMia',
        'Butter silk Navratri lehenga with real mirror and gota patti work for Garba nights. '
        'Sizes with fit guarantee; tracked US shipping.',
        'navratri lehenga online usa; gota patti chaniya choli',
    ),
]

FIELDNAMES = [
    'Page URL', 'Page Type', 'Current Page Title', 'Current Meta Description',
    'Proposed Page Title', 'Proposed Meta Description', 'Primary Keyword(s)',
    'Secondary Keyword(s)', 'Notes',
]

rows = []
for path, (pt, pd, kw1, kw2) in proposed.items():
    r = routes.get(path, {})
    rows.append({
        'Page URL': 'https://luxemia.shop' + path,
        'Page Type': 'Collection/Category',
        'Current Page Title': r.get('title', ''),
        'Current Meta Description': r.get('description', ''),
        'Proposed Page Title': pt,
        'Proposed Meta Description': pd,
        'Primary Keyword(s)': kw1,
        'Secondary Keyword(s)': kw2,
        'Notes': 'Apply in src/config/seoArchitecture.json; verify in GSC after 30 days',
    })

for url, cur_title, pd, kw1 in pdp_examples:
    rows.append({
        'Page URL': url,
        'Page Type': 'Product (PDP)',
        'Current Page Title': cur_title,
        'Current Meta Description': '(stored in Shopify admin — product.seo)',
        'Proposed Page Title': cur_title,
        'Proposed Meta Description': pd,
        'Primary Keyword(s)': kw1,
        'Secondary Keyword(s)': 'varies by fabric/occasion',
        'Notes': 'PDP copy pattern — write via Shopify admin or scripts/bulk-write-shopify-seo.mjs',
    })

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=FIELDNAMES)
    w.writeheader()
    w.writerows(rows)

print(f'Wrote {OUT} with {len(rows)} rows')
