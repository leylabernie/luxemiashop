# LuxeMia Day-1 Operational Launch Pack

This operational pack translates your Phase 1 & Phase 2 launch checklist into **copy-paste-ready assets** aligned 100% with the live storefront (`luxemia.shop`), checkout (`checkout.luxemia.shop`), verified policy terms, and CPC model (`$0.85–$1.24/click` on `$30–$50/day`).

---

## Phase 1: Feed & Analytics Live Verification (Next 30 Minutes)

### 1. Google Merchant Center Feed Submission
- **Option A — Instant Upload**: Upload `luxemia-gmc-feed-optimized.csv` (`1,311` active in-stock variant rows, 19 columns, `<g:id>` continuity preserved).
- **Option B — Automated Scheduled Fetch** (`Products -> Feeds -> Add primary/supplemental source -> Scheduled fetch`):
  - **XML URL**: `https://luxemia.shop/api/gmc-feed?id_mode=merchant`
  - **CSV URL**: `https://luxemia.shop/api/gmc-feed?format=csv&id_mode=merchant`
  - **Fetch schedule**: Daily at `04:00 EST`
- **Verification**: Check **Products -> Needs attention** after processing completes (~15–20 min) and confirm titles follow `LuxeMia [Gender] [Occasion/Category] [Fabric] [Work] [Color] [Size]` with zero `.webp` or `404/410` landing-page errors.

### 2. Cross-Domain Checkout & Shopify Customer Events Pixel
Your storefront now decorates `checkout.luxemia.shop` links with `?_ga=...&_gl=...` both when `createCheckout()` runs **and** synchronously on click (`trackCheckoutClick`), and activates a **WhatsApp Sizing & Stitching Concierge** (`https://wa.me/12153419990`) inside the Cart Drawer for carts `> $200`.

To ensure `purchase` on `checkout.luxemia.shop` stitches back to the exact same GA4 / Google Ads click session, verify either the **Google & YouTube Shopify App** is active **or** paste this into **Shopify Admin -> Settings -> Customer events -> Add custom pixel** (if not already using the native app — do **not** run both on the same Measurement ID to avoid double-counting):

```javascript
// Shopify Customer Events Custom Pixel (use ONLY if not using the native Google & YouTube app)
const GA4_MEASUREMENT_ID = 'G-SZ4GD2L1F7'; // Replace if using a different production GA4 ID
const GOOGLE_ADS_ID = ''; // Optional: e.g. 'AW-123456789'
const GOOGLE_ADS_PURCHASE_LABEL = ''; // Optional: e.g. 'AbCdEfGhIjKlMnOp'

const script = document.createElement('script');
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', GA4_MEASUREMENT_ID, {
  send_page_view: false,
  linker: {
    accept_incoming: true,
    domains: ['luxemia.shop', 'www.luxemia.shop', 'checkout.luxemia.shop'],
  },
});
if (GOOGLE_ADS_ID) {
  gtag('config', GOOGLE_ADS_ID, { allow_enhanced_conversions: true });
}

analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data.checkout;
  const currency = checkout.currencyCode || 'USD';
  const totalValue = Number(checkout.totalPrice?.amount || 0);

  if (checkout.email) {
    gtag('set', 'user_data', {
      email: checkout.email,
      phone_number: checkout.phone || undefined,
      address: checkout.shippingAddress
        ? {
            first_name: checkout.shippingAddress.firstName || undefined,
            last_name: checkout.shippingAddress.lastName || undefined,
            city: checkout.shippingAddress.city || undefined,
            region: checkout.shippingAddress.provinceCode || undefined,
            postal_code: checkout.shippingAddress.zip || undefined,
            country: checkout.shippingAddress.countryCode || undefined,
          }
        : undefined,
    });
  }

  gtag('event', 'purchase', {
    transaction_id: checkout.order?.id || checkout.token,
    value: totalValue,
    tax: Number(checkout.totalTax?.amount || 0),
    shipping: Number(checkout.shippingLine?.price?.amount || 0),
    currency,
    items: (checkout.lineItems || []).map((line) => ({
      item_id: line.variant?.sku || line.variant?.id,
      item_name: line.title,
      item_variant: line.variant?.title,
      item_brand: 'LuxeMia',
      price: Number(line.variant?.price?.amount || 0),
      quantity: line.quantity,
    })),
  });

  if (GOOGLE_ADS_ID && GOOGLE_ADS_PURCHASE_LABEL) {
    gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_PURCHASE_LABEL}`,
      value: totalValue,
      currency,
      transaction_id: checkout.order?.id || checkout.token,
    });
  }
});
```

---

## Phase 2A: High-Intent Google Search Campaign ($30–$50/day · $0.85–$1.24 Max CPC)

### Campaign Settings
- **Campaign Name**: `LuxeMia | Search | NRI High-Intent Bottom-Funnel`
- **Networks**: Google Search **only** (*Uncheck* "Include Google Search Partners" and *Uncheck* "Include Google Display Network")
- **Locations**: United States, United Kingdom, Canada, Australia — set Location Option to **Presence: People in or regularly in your included locations** (critical so India-based browsing traffic does not consume NRI ad spend)
- **Daily Budget**: `$35.00–$50.00 USD/day`
- **Bidding**: Manual CPC (Enhanced CPC off initially) or Maximize Clicks with **Max CPC bid limit** set per ad group below (`$0.85–$1.24`)

### Ad Groups, Max CPC Caps, Final URLs & Keywords

| Ad Group | Max CPC Cap | Final URL | Exact & Phrase Keywords |
| --- | --- | --- | --- |
| **AG1 — Ready-to-Wear Sarees** | **$0.95** | `https://luxemia.shop/sarees` | `[buy ready to wear saree usa]`, `[readymade saree with stitched blouse usa]`, `[pre draped saree express shipping]`, `[ready to wear saree uk]`, `"ready to wear saree wedding guest"`, `"1 minute saree buy online usa"`, `"pre stitched saree usa"` |
| **AG2 — Sharara & Palazzo Suits** | **$0.85** | `https://luxemia.shop/suits` | `[buy sharara suit online usa]`, `[readymade sharara suit for sangeet]`, `[express delivery salwar suit uk]`, `[readymade palazzo suit usa]`, `"embroidered palazzo suit wedding guest"`, `"chinon sharara suit ready to ship"`, `"anarkali suit express delivery usa"` |
| **AG3 — Wedding & Sangeet Lehengas** | **$1.24** | `https://luxemia.shop/lehengas` | `[buy bridal lehenga online usa]`, `[express delivery lehenga uk]`, `[sangeet lehenga usa]`, `[readymade lehenga choli usa]`, `"wedding guest lehenga express shipping"`, `"custom stitched lehenga choli usa"`, `"bridesmaid lehenga online usa"` |
| **AG4 — Groom & Menswear Sherwanis** | **$0.92** | `https://luxemia.shop/menswear` | `[buy sherwani online usa]`, `[mens indian wedding outfit usa]`, `[readymade groom sherwani uk]`, `"silk kurta pajama with jacket usa"`, `"indo western sherwani online usa"` |

### Policy-Verified Responsive Search Ad (RSA) Copy
- **Headlines (30 chars max each)**:
  1. `LuxeMia Indian Wedding Wear`
  2. `5–7 Day US/UK/CA Delivery`
  3. `Ready-to-Wear Sarees & Suits`
  4. `Free US Shipping Over $150`
  5. `2" Seam Allowance Guarantee`
  6. `$20 Local Alteration Credit`
  7. `3-Point Quality Checked`
  8. `Philadelphia, PA Support`
  9. `No US Doorstep Import Fees`
  10. `Sangeet & Reception Lehengas`
  11. `First Order? Code FIRST10`
  12. `Tracked DHL & FedEx Transit`
- **Descriptions (90 chars max each)**:
  1. `Ready-to-Ship sarees, lehengas & suits deliver in 5–7 business days to US, UK & Canada.`
  2. `Custom-stitched tops include 2" internal seam margins + up to $20 Local Alteration Credit.`
  3. `Every garment passes our 3-Point Quality Check before dispatch. Free US shipping $150+.`
  4. `U.S. support desk in Philadelphia (+1-215-341-9990). Use FIRST10 for 10% off 1st order.`

---

## Phase 2B: Complete 165-Term Master Negative Keyword List

Paste the entire block below into **Google Ads -> Tools -> Shared Library -> Exclusion lists -> Negative keyword lists -> `LuxeMia Master Negatives (165 Terms)`** and apply to all Search campaigns:

```text
free
cheap
cheapest
under 20
under 25
under 30
under 40
wholesale
wholesaler
wholesalers
bulk
lot
liquidation
clearance bin
discount code
promo code
coupon
coupons
voucher
second hand
secondhand
used
preowned
pre owned
thrift
thrifted
ebay
amazon
walmart
temu
shein
aliexpress
alibaba
indiamart
meesho
flipkart
myntra
ajio
poshmark
depop
mercari
vinted
facebook marketplace
craigslist
rent
rental
rentals
for rent
hire
on hire
borrow
flyrobe
preserve rental
glamourental
rent the runway
lending
diy
pattern
patterns
sewing pattern
blouse pattern
cutting
cutting and stitching
stitching tutorial
how to stitch
how to sew
how to make
how to drape
draping tutorial
draping step by step
saree draping video
pleating tutorial
youtube
video tutorial
pdf
drafting
measurements template
sewing machine
tailor near me
alterations near me
indian tailor near me
dry cleaner near me
stitching class
fashion designing course
embroidery tutorial
mehendi design
mehndi designs
henna design
hairstyle
makeup tutorial
bridal makeup
nail art
images
image
photo
photos
pic
pics
picture
pictures
hd wallpaper
wallpaper
drawing
sketch
illustration
clipart
vector
png
svg
psd
ai prompt
midjourney
pinterest
instagram reels
tiktok
celebrity photos
bollywood news
actress photos
alia bhatt
deepika padukone
kiara advani
katrina kaif
kareena kapoor
sabyasachi replica
manish malhotra copy
first copy
master copy
dupe
dupes
fake
knockoff
meaning
definition
what is
history of
origin of
wikipedia
essay
quotes
captions
manufacturer
manufacturers
supplier
suppliers
exporter
exporters
factory
mill
surat wholesale
chandni chowk wholesale
sadar bazar
textile market
reseller
dropship
dropshipping
b2b
private label
vendor registration
job
jobs
careers
hiring
internship
salary
vacancies
model audition
in india
price in rupees
inr
rs
under 1000
under 2000
under 5000
cash on delivery
cod
near me open now
store locator
```

---

## Phase 2C: 3-Part Automated Cart & Sizing Recovery Sequence (Klaviyo / Shopify Email)

Configure an **Abandoned Checkout / Added to Bag** flow with Smart Sending ON and exit condition **Placed Order >= 1 since starting flow**.

### Email 1 — Send `+1 Hour` After Abandonment (Sizing & Custom Fit Reassurance)
- **Subject Line**: `Questions on sizing or fit? Your LuxeMia selection is saved`
- **Preview Text**: `2-inch internal seam margins + live sizing help from our Philadelphia concierge.`
- **Body Copy**:
  > Hi `{{ first_name|default:'there' }}`,
  >
  > We saved the pieces in your LuxeMia bag so you don’t lose your size selection before your upcoming celebration:
  >
  > `[Insert Dynamic Cart Block -> Checkout URL]`
  >
  > **Shopping for Indian ethnic wear online should feel effortless:**
  > - **2-Inch Internal Seam Allowance:** Custom-stitched blouses, cholis, and suit tops include 2 inches (5 cm) of hidden let-out margin on both side seams where garment construction permits.
  > - **$20 Local Alteration Credit:** Need a minor local tailor tweak after delivery? Email your receipt within 14 days for up to $20 USD in store credit (`https://luxemia.shop/alterations`).
  > - **1-on-1 Sizing & Event-Date Check:** Reply directly to this email or message our Philadelphia concierge on WhatsApp at **https://wa.me/12153419990** with your bust, waist, hip, and event date — we’ll confirm your best fit option right away.
  >
  > [**Return to Your Saved Bag →**]({{ event.extra.checkout_url }})
  >
  > Warmly,  
  > **LuxeMia Client Concierge**  
  > Philadelphia, PA · +1-215-341-9990 · hello@luxemia.shop

---

### Email 2 — Send `+20 Hours` After Abandonment (Delivery Timeline & 3-Point QA Trust)
- **Subject Line**: `Planning for an upcoming wedding date? Here is your delivery window`
- **Preview Text**: `5–7 business day US/UK/CA Ready-to-Ship transit via DHL/FedEx + 3-Point Quality Check.`
- **Body Copy**:
  > Hi `{{ first_name|default:'there' }}`,
  >
  > Still deciding on your outfit? When you’re dressing for a wedding, sangeet, reception, or family celebration, predictable timing and fabric quality matter most.
  >
  > **How LuxeMia protects your order before it leaves our studio:**
  > 1. **3-Point Quality Assurance Check:** Every outfit passes (1) a fabric & embroidery inspection, (2) a physical tape-measurement check against your ordered size, and (3) moisture-barrier protective packaging.
  > 2. **Clear DHL / FedEx Delivery Windows:**
  >    - **Ready-to-Ship selections:** Arrive in **5–7 business days** to the US, UK & Canada (`$14.99` US standard shipping, **FREE at $150+**; no US doorstep import fees).
  >    - **Custom Tailored & alteration selections:** Arrive in **15–18 business days total** after measurements are confirmed.
  > 3. **48-Hour Photo-Verified Order Protection:** In the rare event an item arrives damaged, defective, or materially off from published specs, simply email 2–3 clear photos within 48 hours of delivery — no unboxing video required (`https://luxemia.shop/returns`).
  >
  > `[Insert Dynamic Cart Block -> Checkout URL]`
  >
  > [**Complete Your Order Securely →**]({{ event.extra.checkout_url }})
  >
  > Need us to verify arrival before a specific event weekend? Message us on WhatsApp: **https://wa.me/12153419990**

---

### Email 3 — Send `+48 Hours` After Abandonment (First-Order `FIRST10` Welcome Privilege)
- **Subject Line**: `10% off your first LuxeMia order (Code: FIRST10)`
- **Preview Text**: `Your saved pieces + 10% welcome privilege before stock moves.`
- **Body Copy**:
  > Hi `{{ first_name|default:'there' }}`,
  >
  > Many of our embroidered sarees, lehengas, and sharara sets are stocked in small size runs. Before we release reserved inventory, if this is your **first LuxeMia order**, you can enter code **`FIRST10`** at checkout for **10% off**:
  >
  > - **Welcome Code:** `FIRST10` *(one use per customer, entered at checkout; U.S. free standard shipping at $150+ applies after discounts)*
  > - **Backed by:** 3-Point Pre-Dispatch QA · 2" Custom Seam Allowance · Up to $20 Local Alteration Credit
  >
  > `[Insert Dynamic Cart Block -> Checkout URL]`
  >
  > [**Apply FIRST10 at Checkout →**]({{ event.extra.checkout_url }})
  >
  > Have a last-minute question on blouse stitching, lining, or sizing? Call or WhatsApp us at **+1-215-341-9990** (`https://wa.me/12153419990`).
  >
  > Warmly,  
  > **LuxeMia Client Concierge**

---

## Phase 2D: High-Value Cart (`> $200`) WhatsApp Concierge Trigger (Live in Code)
- **Status**: **Active on `luxemia.shop`** inside `src/components/cart/CartDrawer.tsx`.
- **Behavior**: Whenever a shopper’s bag subtotal exceeds **$200 USD**, a dedicated **Sizing & Stitching Concierge** WhatsApp bar (`data-testid="whatsapp-cart-concierge"`) automatically appears directly below **Proceed to Secure Checkout**, pre-filling `https://wa.me/12153419990` with the exact outfits, selected sizes/stitching variants, quantities, and bag subtotal for real-time conversion support.
