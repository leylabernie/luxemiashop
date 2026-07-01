#!/usr/bin/env python3
"""
Generate body HTML via template for the 7 products that hit LLM rate limits.
Uses the same 8-section structure as the LLM-generated ones:
1. Direct-answer opening paragraph
2. Why Brides Choose <Color> <Fabric> Sarees
3. What Makes This <Work> Saree Special
4. Perfect For These Occasions
5. How to Style This <Color> Saree
6. Saree Sizing, Care & Shipping
7. Frequently Asked Questions
8. The LuxeMia Promise

Output: updates /tmp/wedding-sarees-final.json with body_html for the 7 failed products.
"""

import json
import re

with open('/tmp/wedding-sarees-final.json') as f:
    products = json.load(f)

# Color → styling recommendation
COLOR_STYLING = {
    'Cream': ('gold or antique gold kundan jewelry', 'a contrasting maroon or wine blouse for depth'),
    'Turquiose': ('silver or diamond jewelry for cool tones', 'a deep maroon or wine blouse to contrast'),
    'Purple': ('gold or pearl jewelry', 'a gold or zari border blouse for cohesion'),
    'Pink': ('kundan or pearl jewelry', 'a gold or contrasting green blouse'),
    'Yellow': ('gold temple jewelry', 'a contrasting red or green blouse'),
    'Wine': ('antique gold or pearl jewelry', 'a gold or cream blouse for contrast'),
}

# Fabric → care description
FABRIC_CARE = {
    'Tissue Silk': 'Dry clean only. Store in a cool, dry place wrapped in muslin cloth. Avoid direct sunlight and never iron directly on embroidery or zari work. Refold every 3-4 months to prevent creasing.',
    'Dola Silk': 'Dry clean only to preserve the sheen and embroidery. Store in a breathable garment bag away from direct sunlight. Iron on low heat on the reverse side over embroidered areas.',
    'Viscose Silk': 'Dry clean recommended. Store in a cool, dry place. Iron on medium heat on the reverse side. Avoid direct sunlight to prevent color fading.',
    'Pure Crepe Silk': 'Dry clean only. The delicate crepe texture requires gentle handling. Store flat or rolled to prevent stretching. Iron on low heat with a pressing cloth.',
}

# Work → craftsmanship description
WORK_CRAFT = {
    'Embroidery': 'intricate thread embroidery using fine resham and metallic threads, with each motif hand-stitched by skilled artisans',
    'Aari': 'traditional Aari hook needlework, a centuries-old Kashmiri technique where each chain-stitch is created by hand using a specialized hooked needle',
}

def generate_body_html(p):
    color = p.get('color') or 'this beautiful'
    fabric = p.get('fabric') or 'silk'
    work = p.get('work') or 'embroidery'
    work_lower = work.lower()
    color_lower = color.lower()
    fabric_lower = fabric.lower()
    
    styling_jewelry, styling_blouse = COLOR_STYLING.get(color, ('gold jewelry', 'a matching or contrasting blouse'))
    care = FABRIC_CARE.get(fabric, 'Dry clean only. Store in a cool, dry place wrapped in muslin cloth.')
    craft = WORK_CRAFT.get(work, f'intricate {work_lower} hand-stitched by skilled artisans')
    
    usd_price = round((p['price_inr'] * 2) / 90)
    usd_mrp = round((p['mrp_inr'] * 2) / 90)
    
    readymade_note = 'This saree comes pre-stitched and ready to wear — perfect for NRI brides who want the elegance of a saree without the complexity of draping.' if p.get('is_readymade') else 'This saree comes with an unstitched blouse piece, allowing you to custom-tailor the blouse to your exact measurements for the perfect fit.'
    
    body = f"""<p>The {color_lower} {fabric_lower} saree with {work_lower} is designed for the modern NRI bride who wants to make a statement on her wedding day. {readymade_note} The {work_lower} work features {craft}, creating a regal silhouette that photographs beautifully.</p>

<h3>Why Brides Choose {color} {fabric} Sarees</h3>
<p>{color} {fabric_lower} sarees are a timeless choice for weddings because they combine the richness of traditional Indian textiles with a sophisticated, photogenic appeal. The {fabric_lower} fabric has a natural luster that catches the light beautifully, while the {color_lower} hue flatters a wide range of skin tones and pairs effortlessly with both gold and silver jewelry. Brides love {fabric_lower} sarees for their versatility — they're equally appropriate for the main wedding ceremony, the reception, or pre-wedding events like the mehendi and sangeet.</p>

<h3>What Makes This {work} Saree Special</h3>
<p>Each saree in this collection features {craft}. The {work_lower} work uses fine threads and traditional techniques passed down through generations of Indian artisans. Every motif is intentional — drawing from Mughal-era florals, paisley patterns, and geometric borders that have graced Indian wedding sarees for centuries. The result is a saree that feels both deeply traditional and refreshingly modern.</p>

<h3>Perfect For These Occasions</h3>
<ul>
<li><strong>Wedding ceremonies</strong> — The rich {color_lower} hue and intricate {work_lower} work make it ideal for the main wedding day</li>
<li><strong>Reception parties</strong> — Statement piece that photographs beautifully under evening lighting</li>
<li><strong>Engagement functions</strong> — Sophisticated choice for this intimate pre-wedding celebration</li>
<li><strong>Wedding guest attire</strong> — Stand out as a guest at any Indian wedding celebration</li>
</ul>

<h3>How to Style This {color} Saree</h3>
<p>Pair this {color_lower} {fabric_lower} saree with {styling_jewelry} to complete the bridal look. Style with {styling_blouse}. For footwear, choose embroidered mojaris or heels in gold or nude tones. Add a fresh flower gajra in your hair for traditional ceremonies, or opt for a maang tikka and jhoomar for a more regal reception look. A coordinating potli bag completes the ensemble.</p>

<h3>Saree Sizing, Care & Shipping</h3>
<ul>
<li><strong>Sizing:</strong> Saree length 5.5 meters + 0.8 meter blouse piece. Free Size — fits all body types with adjustable draping</li>
<li><strong>Care:</strong> {care}</li>
<li><strong>Shipping:</strong> Free DHL/USPS/UPS delivery to USA, Canada, and Australia within 7-10 business days</li>
</ul>

<h3>Frequently Asked Questions</h3>
<p><strong>What size saree should I order from USA?</strong> Our sarees come in a standard 5.5-meter length that suits all body types. The included blouse piece is unstitched, allowing your local tailor to custom-fit it to your measurements. For the best fit, provide your bust, waist, and shoulder measurements to your tailor.</p>
<p><strong>How do I care for a {fabric_lower} saree with {work_lower} work?</strong> {care} For the {work_lower} work, never iron directly — always use a pressing cloth or iron on the reverse side.</p>
<p><strong>How long does shipping take to USA, Canada, Australia?</strong> We offer express shipping via DHL/USPS/UPS with delivery in 7-10 business days to all three countries. Shipping is free on orders over $350, with a flat $25 rate for orders under $350.</p>

<h3>The LuxeMia Promise</h3>
<p>Every saree in our wedding collection is hand-selected for its exceptional quality, craftsmanship, and timeless appeal. We're proud to offer worldwide shipping directly from our Philadelphia headquarters to your doorstep — bringing authentic Indian bridal wear to NRI brides across USA, Canada, and Australia.</p>"""
    
    return body

# Generate body HTML for failed products
failed = [p for p in products if not p.get('body_html') or len(p.get('body_html', '')) < 100]
print(f"Generating template-based body HTML for {len(failed)} failed products...\n")

for p in failed:
    p['body_html'] = generate_body_html(p)
    p['body_html_template_generated'] = True
    print(f"  ✓ {p.get('sku') or 'N/A'}: {p.get('title', '?')[:55]}")

# Verify all 30 now have body HTML
ok = [p for p in products if p.get('body_html') and len(p['body_html']) > 100]
still_failed = [p for p in products if not p.get('body_html') or len(p['body_html']) < 100]
print(f"\nFinal state: {len(ok)} succeeded, {len(still_failed)} still failed")

with open('/tmp/wedding-sarees-final.json', 'w') as f:
    json.dump(products, f, indent=2)
print(f"Saved to /tmp/wedding-sarees-final.json")
