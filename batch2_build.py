import json, re, html, urllib.request, csv, io

BASE = "https://lovable-project-zlh0w.myshopify.com"
UA = {"User-Agent": "LuxeMiaCatalogAudit/1.0"}

catalog = {p["handle"]: p for p in json.load(urllib.request.urlopen(urllib.request.Request(BASE + "/products.json?limit=250", headers=UA), timeout=30))["products"]}

def js(handle):
    req = urllib.request.Request(BASE + "/products/" + handle + ".js", headers=UA)
    return json.load(urllib.request.urlopen(req, timeout=30))

NOTE_A = "<em>Note: Refer to the size chart for fit. Custom measurement tailoring is available on request. Slight colour variation may occur due to screen settings.</em>"
NOTE_B = "<em>Note: Refer to the size chart for fit. Minor alterations are complimentary within 7 days of delivery; custom measurement tailoring is available on request. Slight colour variation may occur due to screen settings.</em>"

def details(fabric, work, includes, perfect):
    return ("<p><strong>Product Details:</strong></p><ul>"
            "<li><strong>Fabric:</strong> " + fabric + "</li>"
            "<li><strong>Work:</strong> " + work + "</li>"
            "<li><strong>Includes:</strong> " + includes + "</li>"
            "<li><strong>Perfect For:</strong> " + perfect + "</li></ul>")

D = {}

D["multi-net-lehenga-choli-0012"] = ("<p>The showpiece of the season. This multi-tonal net lehenga choli layers sheer net over rich embroidery, built for the celebration where every eye is on you. The voluminous silhouette moves beautifully through sangeet nights and stays comfortable long after.</p>"
 "<p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Net with a light, sheer layered feel.</li><li><strong>Work:</strong> All-over embroidery with multi-tone detailing.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Statement jhumkas, soft curls and metallic heels — let the lehenga do the rest.</p><p>" + NOTE_A + "</p>")

D["net-beige-festival-wear-embroidery-work-readymade-lehenga-choli-400935"] = ("<p>Understated beige, done the festive way. Delicate embroidery runs through this sheer net lehenga choli, giving you a reception look that photographs soft and wears light. Comes readymade — tailored, finished and ready for your event dates.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Net with a light, sheer layered feel.</li><li><strong>Work:</strong> Embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Gold jewellery and a soft updo keep this look timeless.</p><p>" + NOTE_B + "</p>")

D["net-beige-festival-wear-embroidery-work-readymade-lehenga-choli-400934"] = ("<p>Reception season calls for calm elegance, and this beige net lehenga choli answers. Embroidery over layered net catches light gently — refined, not loud — with a readymade fit that travels ready for your wedding dates.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Net with a light, sheer layered feel.</li><li><strong>Work:</strong> Embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Pearl drops and nude heels let the beige palette shine.</p><p>" + NOTE_B + "</p>")

D["silk-red-occasional-wear-embroidery-work-readymade-lehenga-choli-404608"] = ("<p>Classic red, tailored and event-ready. This silk lehenga choli carries all-over embroidery on a smooth, lustrous drape — the shade every wedding photograph wants, in a readymade fit sized to your measurements.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Gold jhumkas and red bangles — the classic pairing done right.</p><p>" + NOTE_B + "</p>")

D["silk-red-festival-wear-beads-work-lehenga-choli-403870"] = ("<p>Beadwork that catches every light in the room. This red silk lehenga choli is detailed with fine bead work across a smooth, lustrous drape — festive energy with a polished finish.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Bead work.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Keep jewellery minimal — the beadwork is the statement.</p><p>" + NOTE_A + "</p>")

D["silk-rani-pink-festival-wear-beads-work-lehenga-choli-403871"] = ("<p>Rani pink in full celebration mode. Bead work shimmers across this silk lehenga choli — a festive favorite for sangeet nights, delivered with options for unstitched, custom measurements or standard sizing.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Bead work.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Silver-toned jewellery cools the pink beautifully.</p><p>" + NOTE_A + "</p>")

D["silk-multicolor-festival-wear-mirror-work-lehenga-choli-401021"] = ("<p>Mirror work made for the dance floor. This multi-color silk lehenga choli throws light with every step — a sangeet-night statement in silk, sized your way.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Mirror work.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Simple bangles and a messy bun — the mirrors carry the look.</p><p>" + NOTE_A + "</p>")

D["silk-multicolor-festival-wear-mirror-work-lehenga-choli-401020"] = ("<p>A mirror-work lehenga that lights up every sangeet photo. Multi-color silk, hand-catching mirror detailing and a drape that moves with the music — celebration wear, exactly as it should feel.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Mirror work.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Pair with oxidised silver for contrast, gold for tradition.</p><p>" + NOTE_A + "</p>")

D["beige-fancy-work-art-silk-groom-sherwani-with-stole"] = ("<p>The groom's answer to understated luxury. This beige art silk sherwani carries elegant detailing with a polished finish, complete with pajama and stole — distinguished without trying too hard.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Art Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Crafted finish with elegant detailing.</li><li><strong>Includes:</strong> Sherwani with pajama and stole.</li><li><strong>Perfect For:</strong> Wedding ceremonies, sangeet nights and festive receptions.</li></ul>"
 "<p><strong>Styling Tip:</strong> Classic mojaris and a statement watch for a refined finish.</p><p><em>Note: Refer to the size chart for fit. Custom measurement tailoring is available. Slight colour variation may occur due to screen settings.</em></p>")

D["silk-red-occasional-wear-thread-work-lehenga-choli-404134"] = ("<p>Thread embroidery, done the traditional way. This red silk lehenga choli weaves fine thread work through a smooth, lustrous drape — festive depth without heaviness, in a color that owns every celebration.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Thread embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Gold temple jewellery completes the classic red look.</p><p>" + NOTE_A + "</p>")

D["silk-rani-pink-occasional-wear-thread-work-lehenga-choli-404135"] = ("<p>Rani pink with the delicacy of fine thread work. This silk lehenga choli layers traditional thread embroidery over a lustrous drape — festive, feminine and made for long celebrations.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Thread embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Kundan earrings and soft waves — let the pink lead.</p><p>" + NOTE_A + "</p>")

D["silk-maroon-occasional-wear-thread-work-lehenga-choli-404136"] = ("<p>Maroon, the color of wedding season itself. Thread embroidery adds traditional texture to this silk lehenga choli — rich, warm and made for receptions that run late.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Thread embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Deep gold jewellery and a maroon bindi finish the look.</p><p>" + NOTE_A + "</p>")

D["silk-rani-pink-occasional-wear-thread-work-lehenga-choli-400931"] = ("<p>Rani pink with the delicacy of fine thread work — a silk lehenga choli that layers traditional thread embroidery over a lustrous drape. Festive, feminine and made for long celebrations.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Thread embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Kundan earrings and soft waves — let the pink lead.</p><p>" + NOTE_A + "</p>")

D["silk-multicolor-occasional-wear-embroidery-work-lehenga-choli-401019"] = ("<p>Every celebration has a multitasker — this is yours. Multi-color silk with all-over embroidery, an outfit that moves from pujas to receptions without missing a beat.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Mix gold and glass bangles for the festive-stack look.</p><p>" + NOTE_A + "</p>")

D["silk-maroon-occasional-wear-thread-work-lehenga-choli-400930"] = ("<p>Deep maroon thread work with a silk drape that means it. This lehenga choli brings traditional texture to receptions and pujas alike — warm, rich and ready for the season.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Thread embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Antique gold jewellery suits the maroon depth perfectly.</p><p>" + NOTE_A + "</p>")

D["silk-red-festival-wear-embroidery-work-lehenga-choli-404132"] = ("<p>The red lehenga choli every wedding wardrobe needs. Smooth silk, all-over embroidery and a festive drape that photographs exactly the way you hoped.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Gold kada bangles and a sleek bun — timeless.</p><p>" + NOTE_A + "</p>")

D["silk-red-festival-wear-beads-work-lehenga-choli-403872"] = ("<p>Red silk with bead work that glitters under every fixture. A festive lehenga choli with a polished finish — celebration-ready from the first sangeet to the last farewell.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Bead work.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> A red bindi and gold hoops — simple, striking, done.</p><p>" + NOTE_A + "</p>")

D["silk-rani-pink-festival-wear-embroidery-work-lehenga-choli-404133"] = ("<p>Rani pink embroidered silk — the shade festival photographs were made for. All-over embroidery on a lustrous drape, festive energy in every inch.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Gold jhumkas and glossy waves for the full festive picture.</p><p>" + NOTE_A + "</p>")

D["silk-rani-pink-festival-wear-beads-work-lehenga-choli-403873"] = ("<p>Rani pink silk with fine bead work and a drape that flows all evening. Festive shimmer, traditional color and a silhouette that keeps you comfortable from pheras to farewell.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Bead work.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Pearl-accented jewellery softens the pink beautifully.</p><p>" + NOTE_A + "</p>")

D["silk-maroon-wedding-wear-thread-work-lehenga-choli-403443"] = ("<p>Maroon silk with fine thread work — wedding-wear depth for the celebrations that matter most. Rich, traditional and easy to carry through every event on the calendar.</p>"
 " <p><strong>Product Details:</strong></p><ul><li><strong>Fabric:</strong> Silk with a smooth, lustrous drape.</li><li><strong>Work:</strong> Thread embroidery.</li><li><strong>Includes:</strong> Lehenga, choli and dupatta.</li><li><strong>Perfect For:</strong> Wedding receptions, sangeet nights and festive pujas.</li></ul>"
 "<p><strong>Styling Tip:</strong> Gold choker and matching bangles for the classic maroon look.</p><p>" + NOTE_A + "</p>")

items = []
for handle, body in D.items():
    p = catalog[handle]
    j = js(handle)
    options = [(o["name"], o["values"]) for o in j["options"]]
    items.append({"handle": handle, "title": p["title"], "tags": ", ".join(p.get("tags", [])), "body": body, "options": options})

out = io.StringIO()
w = csv.writer(out, quoting=csv.QUOTE_ALL, lineterminator="\r\n")
w.writerow(["Handle", "Title", "Body (HTML)", "Tags", "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value"])
for it in items:
    h = it["handle"]
    if len(it["options"]) == 1:
        oname, ovals = it["options"][0]
        w.writerow([h, it["title"], it["body"], it["tags"], oname, ovals[0]])
        for v in ovals[1:]:
            w.writerow([h, "", "", "", oname, v])
    elif len(it["options"]) == 2:
        n1, v1s = it["options"][0]
        n2, v2s = it["options"][1]
        first = True
        for v1 in v1s:
            for v2 in v2s:
                if first:
                    w.writerow([h, it["title"], it["body"], it["tags"], n1, v1, n2, v2])
                    first = False
                else:
                    w.writerow([h, "", "", "", n1, v1, n2, v2])
    else:
        w.writerow([h, it["title"], it["body"], it["tags"]])

open(r"C:/Users/bhami/Downloads/luxemia-batch2-import.csv", "w", encoding="utf-8", newline="").write(out.getvalue())
print("CSV written: C:/Users/bhami/Downloads/luxemia-batch2-import.csv")
print("products:", len(items), "| total rows:", out.getvalue().count("\r\n"))
