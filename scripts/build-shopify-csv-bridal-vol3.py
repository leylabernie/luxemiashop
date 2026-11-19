#!/usr/bin/env python3
"""
LuxeMia Royal Bridal Silk Vol-3 — Master Catalog & Shopify CSV Generator
========================================================================
Generates:
  1. src/data/bridalVol3Catalog.json
     Structured source of truth for all 14 Royal Bridal Silk Vol-3 lehengas
     (10 active with 23 debranded high-resolution studio photos + 4 draft
     awaiting studio photography), exact USD = round((INR * 2) / 90, 2)
     pricing, Utsav Fashion-style standard (32-46) and Custom Fit sizing,
     product-specific size chart, and custom tailoring options.
  2. catalog-imports/luxemia-royal-bridal-silk-vol3-shopify.csv
     53-column Shopify Admin Product Import CSV ready for one-click upload
     at Shopify Admin -> Products -> Import.

Pricing formula (strict):
  USD = round((INR * 2) / 90, 2)
"""

from __future__ import annotations

import csv
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_OUT = ROOT / "src" / "data" / "bridalVol3Catalog.json"
CSV_OUT = ROOT / "catalog-imports" / "luxemia-royal-bridal-silk-vol3-shopify.csv"
IMAGE_DIR = ROOT / "public" / "images" / "bridal-vol3"
SITE_URL = "https://luxemia.shop"
COLLECTION_NAME = "Royal Bridal Silk Edit — Vol. 3"
PUBLISHED_AT = "2026-11-18T12:00:00Z"

SHOPIFY_COLUMNS = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Product Category",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Option2 Name",
    "Option2 Value",
    "Option3 Name",
    "Option3 Value",
    "Variant SKU",
    "Variant Grams",
    "Variant Inventory Tracker",
    "Variant Inventory Qty",
    "Variant Inventory Policy",
    "Variant Fulfillment Service",
    "Variant Price",
    "Variant Compare At Price",
    "Variant Requires Shipping",
    "Variant Taxable",
    "Variant Barcode",
    "Image Src",
    "Image Position",
    "Image Alt Text",
    "Gift Card",
    "SEO Title",
    "SEO Description",
    "Google Shopping / Google Product Category",
    "Google Shopping / Gender",
    "Google Shopping / Age Group",
    "Google Shopping / MPN",
    "Google Shopping / Condition",
    "Google Shopping / Custom Product",
    "Google Shopping / Custom Label 0",
    "Google Shopping / Custom Label 1",
    "Google Shopping / Custom Label 2",
    "Google Shopping / Custom Label 3",
    "Google Shopping / Custom Label 4",
    "Variant Image",
    "Variant Weight Unit",
    "Variant Tax Code",
    "Cost per item",
    "Included / United States",
    "Price / United States",
    "Compare At Price / United States",
    "Included / International",
    "Price / International",
    "Compare At Price / International",
    "Status",
]

SIZE_CHART = [
    {
        "size": "32",
        "alpha": "XS",
        "usRef": "0",
        "ukRef": "4",
        "bustIn": 32,
        "underbustIn": 27,
        "aboveWaistIn": 26,
        "lehengaWaistIn": 27,
        "hipIn": 35,
        "choliLengthIn": 14.0,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 3,
        "available": True,
        "fitType": "altered-standard",
        "fitNote": "Tailored down cleanly from the 38 in readymade base before dispatch (+3 business days).",
    },
    {
        "size": "34",
        "alpha": "S",
        "usRef": "2",
        "ukRef": "6",
        "bustIn": 34,
        "underbustIn": 29,
        "aboveWaistIn": 28,
        "lehengaWaistIn": 29,
        "hipIn": 37,
        "choliLengthIn": 14.5,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 4,
        "available": True,
        "fitType": "altered-standard",
        "fitNote": "Tailored down cleanly from the 38 in readymade base before dispatch (+3 business days).",
    },
    {
        "size": "36",
        "alpha": "M",
        "usRef": "4-6",
        "ukRef": "8-10",
        "bustIn": 36,
        "underbustIn": 31,
        "aboveWaistIn": 30,
        "lehengaWaistIn": 31,
        "hipIn": 39,
        "choliLengthIn": 14.5,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 5,
        "available": True,
        "fitType": "altered-standard",
        "fitNote": "Tailored cleanly from the 38 in readymade base before dispatch (+3 business days).",
    },
    {
        "size": "38",
        "alpha": "L",
        "usRef": "8",
        "ukRef": "12",
        "bustIn": 38,
        "underbustIn": 33,
        "aboveWaistIn": 32,
        "lehengaWaistIn": 38,
        "hipIn": 42,
        "choliLengthIn": 15.0,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 6,
        "available": True,
        "fitType": "readymade-base",
        "fitNote": "Supplied readymade standard fit (38 in bust & waist with inner margin up to 42 in; ships in 3-4 business days).",
    },
    {
        "size": "40",
        "alpha": "XL",
        "usRef": "10",
        "ukRef": "14",
        "bustIn": 40,
        "underbustIn": 35,
        "aboveWaistIn": 34,
        "lehengaWaistIn": 40,
        "hipIn": 44,
        "choliLengthIn": 15.0,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 5,
        "available": True,
        "fitType": "altered-standard",
        "fitNote": "Let out cleanly using the built-in 42 in seam allowance before dispatch (+3 business days).",
    },
    {
        "size": "42",
        "alpha": "2XL",
        "usRef": "12",
        "ukRef": "16",
        "bustIn": 42,
        "underbustIn": 37,
        "aboveWaistIn": 36,
        "lehengaWaistIn": 42,
        "hipIn": 46,
        "choliLengthIn": 15.5,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 4,
        "available": True,
        "fitType": "max-allowance",
        "fitNote": "Maximum verified readymade seam capacity (42 in bust & 42 in lehenga waist; +3 business days).",
    },
    {
        "size": "44",
        "alpha": "3XL",
        "usRef": "14",
        "ukRef": "18",
        "bustIn": 44,
        "underbustIn": 39,
        "aboveWaistIn": 38,
        "lehengaWaistIn": 44,
        "hipIn": 48,
        "choliLengthIn": 15.5,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 0,
        "available": False,
        "fitType": "enquiry-only",
        "fitNote": "Exceeds the 42 in readymade seam limit — contact LuxeMia before ordering for plus-size panel feasibility.",
    },
    {
        "size": "46",
        "alpha": "4XL",
        "usRef": "16",
        "ukRef": "20",
        "bustIn": 46,
        "underbustIn": 41,
        "aboveWaistIn": 40,
        "lehengaWaistIn": 46,
        "hipIn": 50,
        "choliLengthIn": 16.0,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 0,
        "available": False,
        "fitType": "enquiry-only",
        "fitNote": "Exceeds the 42 in readymade seam limit — contact LuxeMia before ordering for plus-size panel feasibility.",
    },
    {
        "size": "Custom Fit",
        "alpha": "MTM",
        "usRef": "Custom",
        "ukRef": "Custom",
        "bustIn": 42,
        "underbustIn": 37,
        "aboveWaistIn": 36,
        "lehengaWaistIn": 42,
        "hipIn": 46,
        "choliLengthIn": 15.0,
        "lehengaLengthIn": 43,
        "flareMeters": 4.5,
        "inventoryQty": 5,
        "available": True,
        "fitType": "custom-tailored",
        "fitNote": "Tailored to your exact bust (28-42 in), underbust, choli waist, lehenga waist (25-42 in), and skirt length (36-43 in) with customizable finishing preferences (+3 business days after measurements are confirmed).",
    },
]

TAILORING_OPTIONS = {
    "frontNeckStyles": [
        {"id": "as-shown-sweetheart", "label": "Sweetheart (As Shown)", "note": "Preserves original embroidered neckline"},
        {"id": "round-neck", "label": "Classic Round Neck", "note": "Subject to embroidered panel review"},
        {"id": "deep-u-neck", "label": "Bridal U-Neck", "note": "Subject to embroidered panel review"},
        {"id": "v-neck", "label": "Regal V-Neck", "note": "Subject to embroidered panel review"},
        {"id": "square-neck", "label": "Square Neck", "note": "Subject to embroidered panel review"},
        {"id": "modest-high", "label": "Modest Higher Coverage", "note": "With matching silk insert"},
    ],
    "backNeckStyles": [
        {"id": "as-shown-keyhole-dori", "label": "Keyhole with Dori & Latkan (As Shown)"},
        {"id": "deep-round-dori", "label": "Deep Round Back with Dori"},
        {"id": "u-back-dori", "label": "Classic U-Back with Tassel Tie"},
        {"id": "square-back", "label": "Square Back"},
        {"id": "covered-modest-back", "label": "Modest Covered Back"},
    ],
    "sleeveStyles": [
        {"id": "elbow-as-shown", "label": "Elbow Sleeve with Pearl Fringe (As Shown)"},
        {"id": "half-sleeve", "label": "Half Sleeve (6-7 in)"},
        {"id": "short-cap", "label": "Short / Cap Sleeve (3-4 in)"},
        {"id": "sleeveless", "label": "Sleeveless (Straps Tucked)"},
        {"id": "three-quarter-request", "label": "3/4 Sleeve (Confirm Fabric)"},
    ],
    "choliLengths": [
        {"id": "regular-as-shown", "label": "Regular Bridal Choli (14.5-15 in, As Shown)"},
        {"id": "cropped-choli", "label": "Shorter Choli (13.5-14 in)"},
        {"id": "waist-grazing", "label": "Full Margin Length (15-15.5 in)"},
    ],
    "blousePadding": [
        {"id": "padded-lined", "label": "Padded Cups + Soft Cotton Lining (Included)"},
        {"id": "non-padded-lined", "label": "Non-Padded (Cups Removed) + Cotton Lining"},
    ],
    "skirtCancan": [
        {"id": "full-bridal-cancan", "label": "Full Bridal Cancan & Canvas (As Shown, Included)"},
        {"id": "medium-cancan", "label": "Medium Cancan Volume (Lighter Walk)"},
        {"id": "minimal-cancan", "label": "Soft Flare (Cancan Trimmed Down)"},
    ],
    "fitPreferences": [
        {"id": "regular-bridal", "label": "Sculpted Bridal Fit (+1 in ease)"},
        {"id": "comfort-fit", "label": "Comfort Fit (+1.5-2 in ease)"},
        {"id": "close-contour", "label": "Close Contour Fit (+0.5 in ease)"},
    ],
}

DESIGNS = [
    {
        "code": "166",
        "skuBase": "LM-BV3-166",
        "handle": "rani-pink-silk-royal-arch-zardosi-bridal-lehenga-double-dupatta",
        "title": "Rani Pink Silk Royal Arch Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Rani Pink",
        "colorTag": "pink",
        "swatchHex": "#B81D5C",
        "designFamily": "royal-arch-scalloped-lotus",
        "designFamilyTitle": "Royal Arch & Scalloped Lotus",
        "inrPrice": 19625,
        "status": "draft",
        "motifLead": (
            "Structured Mughal mihrab arches, scalloped lotus medallions, and dense antique-gold zardosi, "
            "cutdana, pearl, and multi-thread resham embroidery illuminate every kali of the jewel-toned rani pink bridal silk skirt."
        ),
        "dupattaNote": (
            "Paired with a heavy cutwork-bordered blush-rose soft net head veil and a richly embroidered "
            "coordinating rani pink viscose shoulder drape finished with pearl and floral edging."
        ),
        "occasionNote": "Hindu bridal pheras, royal wedding ceremonies, and grand reception entrances",
        "images": [],
    },
    {
        "code": "167",
        "skuBase": "LM-BV3-167",
        "handle": "crimson-red-silk-royal-arch-zardosi-bridal-lehenga-double-dupatta",
        "title": "Crimson Red Silk Royal Arch Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Crimson Red",
        "colorTag": "red",
        "swatchHex": "#9E1420",
        "designFamily": "royal-arch-scalloped-lotus",
        "designFamilyTitle": "Royal Arch & Scalloped Lotus",
        "inrPrice": 19625,
        "status": "active",
        "motifLead": (
            "Regal Mughal mihrab arches frame blooming lotus medallions across a sweeping 4.50-meter crimson red "
            "bridal silk skirt, densely hand-highlighted with antique-gold zardosi, cutdana, pearl beads, and warm ivory-peach resham threadwork."
        ),
        "dupattaNote": (
            "Styled as a complete four-piece double-dupatta bridal set with a soft peach-pink embroidered soft net head veil "
            "and a heavily bordered crimson viscose shoulder drape, accented with handcrafted three-tier beaded latkan tassels."
        ),
        "occasionNote": "traditional bridal pheras, mandap ceremonies, and grand wedding receptions",
        "images": [
            {
                "file": "luxemia-bv3-167-crimson-arch-1",
                "alt": "Crimson Red Silk Royal Arch Zardosi Bridal Lehenga Choli with Double Dupatta — full-length bridal view showing 4.50m flared skirt, sweetheart blouse, crimson shoulder drape, and soft net veil",
            },
            {
                "file": "luxemia-bv3-167-crimson-arch-2",
                "alt": "Crimson Red Silk Royal Arch Zardosi Bridal Lehenga Choli — close-up detail of sweetheart embroidered blouse, cutdana and pearl work, and scalloped net veil border",
            },
        ],
    },
    {
        "code": "168",
        "skuBase": "LM-BV3-168",
        "handle": "ruby-rose-silk-peacock-scallop-bridal-lehenga-double-dupatta",
        "title": "Ruby Rose Silk Peacock Scallop Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Ruby Rose",
        "colorTag": "pink",
        "swatchHex": "#A61C46",
        "designFamily": "peacock-scallop-mihrab",
        "designFamilyTitle": "Peacock Scallop & Mihrab",
        "inrPrice": 17625,
        "status": "draft",
        "motifLead": (
            "Concentric scalloped lotus bands crown tall peacock-and-mihrab embroidered panels in gold zardosi, "
            "cutdana, pearl, and tonal resham work across a full-flare bridal silk skirt."
        ),
        "dupattaNote": (
            "Completed with a scalloped cutwork soft net veil dupatta, a richly embroidered viscose drape dupatta, "
            "and multi-tier beaded bridal latkan tassels."
        ),
        "occasionNote": "wedding ceremonies, bridal pheras, and formal reception evenings",
        "images": [],
    },
    {
        "code": "169",
        "skuBase": "LM-BV3-169",
        "handle": "vermilion-red-silk-peacock-scallop-bridal-lehenga-double-dupatta",
        "title": "Vermilion Red Silk Peacock Scallop Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Vermilion Red",
        "colorTag": "red",
        "swatchHex": "#B31B1B",
        "designFamily": "peacock-scallop-mihrab",
        "designFamilyTitle": "Peacock Scallop & Mihrab",
        "inrPrice": 17625,
        "status": "active",
        "motifLead": (
            "Layered scalloped floral arches open into majestic peacock-and-mihrab heritage panels along a 4.50-meter "
            "vermilion red bridal silk lehenga, richly worked in antique zardosi, cutdana, pearls, beads, and multicolor resham embroidery."
        ),
        "dupattaNote": (
            "Includes both a blush-peach embroidered soft net head veil with scalloped cutwork trim and a bold vermilion "
            "viscose shoulder dupatta, paired with a sculpted keyhole-back choli featuring dori ties and cascading beaded latkans."
        ),
        "occasionNote": "bridal pheras, Anand Karaj, mandap ceremonies, and wedding receptions",
        "images": [
            {
                "file": "luxemia-bv3-169-vermilion-peacock-1",
                "alt": "Vermilion Red Silk Peacock Scallop Zardosi Bridal Lehenga Choli with Double Dupatta — front studio view showing scalloped kali embroidery, vermilion drape, and peach soft net veil",
            },
            {
                "file": "luxemia-bv3-169-vermilion-peacock-2",
                "alt": "Vermilion Red Silk Peacock Scallop Zardosi Bridal Lehenga Choli — back view showcasing embroidered keyhole blouse back with dori tie, elbow sleeves, and full flared peacock-border skirt",
            },
        ],
    },
    {
        "code": "170",
        "skuBase": "LM-BV3-170",
        "handle": "scarlet-red-silk-mughal-paisley-bridal-lehenga-double-dupatta",
        "title": "Scarlet Red Silk Mughal Paisley Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Scarlet Red",
        "colorTag": "red",
        "swatchHex": "#B81822",
        "designFamily": "mughal-paisley-geometric",
        "designFamilyTitle": "Mughal Paisley & Geometric Border",
        "inrPrice": 16055,
        "status": "active",
        "motifLead": (
            "Intricate Mughal jaali latticework transitions into dramatic mango-paisley cartouches and a broad geometric "
            "heritage border across a 4.50-meter scarlet red bridal silk lehenga, crafted with zardosi, cutdana, pearl, bead, and resham embroidery."
        ),
        "dupattaNote": (
            "Finished as a complete double-dupatta ensemble with a delicate blush-peach cutwork soft net bridal veil, "
            "a heavily embroidered scarlet viscose shoulder drape, and tiered golden-crimson latkan tassels."
        ),
        "occasionNote": "bridal ceremonies, traditional pheras, engagement galas, and formal receptions",
        "images": [
            {
                "file": "luxemia-bv3-170-scarlet-paisley-1",
                "alt": "Scarlet Red Silk Mughal Paisley Zardosi Bridal Lehenga Choli with Double Dupatta — full-length view displaying paisley-and-jaali silk skirt, embroidered blouse, and dual dupattas",
            },
            {
                "file": "luxemia-bv3-170-scarlet-paisley-2",
                "alt": "Scarlet Red Silk Mughal Paisley Zardosi Bridal Lehenga Choli — portrait close-up highlighting sweetheart blouse embroidery, pearl-fringed elbow sleeves, and scalloped veil",
            },
        ],
    },
    {
        "code": "171",
        "skuBase": "LM-BV3-171",
        "handle": "royal-fuchsia-silk-mughal-paisley-bridal-lehenga-double-dupatta",
        "title": "Royal Fuchsia Silk Mughal Paisley Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Royal Fuchsia",
        "colorTag": "pink",
        "swatchHex": "#B51763",
        "designFamily": "mughal-paisley-geometric",
        "designFamilyTitle": "Mughal Paisley & Geometric Border",
        "inrPrice": 16055,
        "status": "active",
        "motifLead": (
            "Luminous royal fuchsia bridal silk sets off antique-gold Mughal jaali trellises, oversized paisley medallions, "
            "and an architectural geometric hem illuminated with zardosi, cutdana, pearls, beads, and fine multi-thread resham embroidery."
        ),
        "dupattaNote": (
            "Comes with a soft powder-pink cutwork embroidered soft net head veil and a deep fuchsia viscose shoulder dupatta "
            "with broad zardosi border, completed with handcrafted dome latkans at the waist."
        ),
        "occasionNote": "daytime and evening bridal ceremonies, sangeet-to-reception transitions, and royal destination weddings",
        "images": [
            {
                "file": "luxemia-bv3-171-fuchsia-paisley-1",
                "alt": "Royal Fuchsia Silk Mughal Paisley Zardosi Bridal Lehenga Choli with Double Dupatta — full-length bridal view featuring 4.50m flared fuchsia silk skirt and dual embroidered dupattas",
            },
            {
                "file": "luxemia-bv3-171-fuchsia-paisley-2",
                "alt": "Royal Fuchsia Silk Mughal Paisley Zardosi Bridal Lehenga Choli — close-up of zardosi and cutdana sweetheart blouse, beaded sleeve fringe, and cutwork soft net veil",
            },
        ],
    },
    {
        "code": "172",
        "skuBase": "LM-BV3-172",
        "handle": "rani-magenta-silk-rajputana-palace-bridal-lehenga-double-dupatta",
        "title": "Rani Magenta Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Rani Magenta",
        "colorTag": "magenta",
        "swatchHex": "#A61458",
        "designFamily": "rajputana-palace-baraat",
        "designFamilyTitle": "Rajputana Palace & Heritage Motifs",
        "inrPrice": 18695,
        "status": "active",
        "motifLead": (
            "Storybook Rajputana courtyard arches, royal palms, and ceremonial baraat tapestry panels unfold across a grand "
            "4.50-meter rani magenta bridal silk skirt, meticulously embroidered with gold zardosi, cutdana, pearl beads, and pastel resham accents."
        ),
        "dupattaNote": (
            "Accompanied by two coordinated dupattas — a sheer blush-pink cutwork embroidered soft net bridal veil "
            "and a richly worked rani magenta viscose shoulder drape — plus clustered dome latkan tassels."
        ),
        "occasionNote": "palace and destination weddings, bridal pheras, and opulent wedding receptions",
        "images": [
            {
                "file": "luxemia-bv3-172-magenta-palace-1",
                "alt": "Rani Magenta Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta — full-length studio portrait showing architectural palace-and-palm embroidered silk skirt",
            },
            {
                "file": "luxemia-bv3-172-magenta-palace-2",
                "alt": "Rani Magenta Silk Rajputana Palace Zardosi Bridal Lehenga Choli — close-up of ornate bridal blouse, dual dupatta borders, and zardosi pearl embroidery",
            },
        ],
    },
    {
        "code": "173",
        "skuBase": "LM-BV3-173",
        "handle": "crimson-red-silk-rajputana-palace-bridal-lehenga-double-dupatta",
        "title": "Crimson Red Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Crimson Red",
        "colorTag": "red",
        "swatchHex": "#9B111E",
        "designFamily": "rajputana-palace-baraat",
        "designFamilyTitle": "Rajputana Palace & Heritage Motifs",
        "inrPrice": 18695,
        "status": "active",
        "motifLead": (
            "Heirloom Rajputana jharokha arches, courtyard palms, and ceremonial royal procession borders span every panel "
            "of this 4.50-meter crimson red bridal silk lehenga, hand-detailed with antique zardosi, cutdana, pearl, bead, and resham embroidery."
        ),
        "dupattaNote": (
            "Styled with a whisper-soft peach-rose cutwork soft net ghoonghat veil and a heavy crimson viscose shoulder drape "
            "featuring heritage border embroidery, finished with cascading pearl-fringed latkan tassels."
        ),
        "occasionNote": "traditional Hindu bridal ceremonies, royal mandap vows, and grand evening receptions",
        "images": [
            {
                "file": "luxemia-bv3-173-crimson-palace-1",
                "alt": "Crimson Red Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta — full-length bridal portrait showcasing heritage palace-and-palm skirt and double dupatta styling",
            },
            {
                "file": "luxemia-bv3-173-crimson-palace-2",
                "alt": "Crimson Red Silk Rajputana Palace Zardosi Bridal Lehenga Choli — close-up of sculpted sweetheart blouse, cutdana and pearl work, and dual embroidered dupatta borders",
            },
            {
                "file": "luxemia-bv3-173-crimson-palace-3",
                "alt": "Crimson Red Silk Rajputana Palace Zardosi Bridal Lehenga Choli — ceremonial bridal ghoonghat veil styling displaying scalloped soft net dupatta border and crimson drape",
            },
        ],
    },
    {
        "code": "174",
        "skuBase": "LM-BV3-174",
        "handle": "rani-pink-silk-heritage-jharokha-bridal-lehenga-double-dupatta",
        "title": "Rani Pink Silk Heritage Jharokha Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Rani Pink",
        "colorTag": "pink",
        "swatchHex": "#C2186A",
        "designFamily": "heritage-jharokha-chevron",
        "designFamilyTitle": "Heritage Bridal Jharokha & Chevron",
        "inrPrice": 19975,
        "status": "active",
        "motifLead": (
            "Our most intricately worked Vol. 3 silhouette: dense chevron-lattice kalis flow into grand architectural "
            "jharokha pavilions, floral urns, and scalloped cutwork borders across 4.50 meters of vibrant rani pink bridal silk in zardosi, cutdana, pearl, and resham embroidery."
        ),
        "dupattaNote": (
            "Presented as a complete four-piece couture bridal set with an embroidered blush-rose soft net head veil, "
            "a heavily embellished rani pink viscose shoulder drape with sage-and-gold accents, and multi-tier handcrafted latkans."
        ),
        "occasionNote": "luxury bridal ceremonies, palace destination weddings, and couture reception entrances",
        "images": [
            {
                "file": "luxemia-bv3-174-rani-jharokha-1",
                "alt": "Rani Pink Silk Heritage Jharokha Zardosi Bridal Lehenga Choli with Double Dupatta — full-length bridal view displaying chevron-and-jharokha embroidered 4.50m silk skirt",
            },
            {
                "file": "luxemia-bv3-174-rani-jharokha-2",
                "alt": "Rani Pink Silk Heritage Jharokha Zardosi Bridal Lehenga Choli — close-up detail of heavy zardosi choli, pearl-beaded sleeve trim, and scalloped soft net bridal veil",
            },
        ],
    },
    {
        "code": "175",
        "skuBase": "LM-BV3-175",
        "handle": "sindoori-red-silk-heritage-jharokha-bridal-lehenga-double-dupatta",
        "title": "Sindoori Red Silk Heritage Jharokha Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Sindoori Red",
        "colorTag": "red",
        "swatchHex": "#A8131E",
        "designFamily": "heritage-jharokha-chevron",
        "designFamilyTitle": "Heritage Bridal Jharokha & Chevron",
        "inrPrice": 19975,
        "status": "active",
        "motifLead": (
            "The flagship bridal piece of the Royal Bridal Silk Edit: sweeping chevron-jaali kalis descend into ornate "
            "jharokha arches, lotus medallions, and scalloped tapestry borders over 4.50 meters of rich sindoori red bridal silk encrusted with zardosi, cutdana, pearls, beads, and multi-thread resham."
        ),
        "dupattaNote": (
            "Complete four-piece trousseau styling includes a delicate peach-blush cutwork soft net bridal veil, "
            "a statement sindoori red embroidered viscose shoulder dupatta, and triple-tier pearl-fringed dome latkans."
        ),
        "occasionNote": "classic Hindu and Sikh bridal ceremonies, royal mandap vows, and grand wedding receptions",
        "images": [
            {
                "file": "luxemia-bv3-175-sindoori-jharokha-1",
                "alt": "Sindoori Red Silk Heritage Jharokha Zardosi Bridal Lehenga Choli with Double Dupatta — full-length bridal portrait showcasing 4.50m flared silk skirt and double dupatta drape",
            },
            {
                "file": "luxemia-bv3-175-sindoori-jharokha-2",
                "alt": "Sindoori Red Silk Heritage Jharokha Zardosi Bridal Lehenga Choli — close-up of sweetheart zardosi blouse, cutdana detailing, and scalloped peach soft net veil",
            },
            {
                "file": "luxemia-bv3-175-sindoori-jharokha-3",
                "alt": "Sindoori Red Silk Heritage Jharokha Zardosi Bridal Lehenga Choli — ceremonial veiled bridal pose showing intricate cutwork net dupatta border over sindoori silk lehenga",
            },
            {
                "file": "luxemia-bv3-175-sindoori-jharokha-4",
                "alt": "Sindoori Red Silk Heritage Jharokha Zardosi Bridal Lehenga Choli — editorial three-quarter view highlighting shoulder dupatta pallu, latkan tassels, and chevron kali embroidery",
            },
        ],
    },
    {
        "code": "176",
        "skuBase": "LM-BV3-176",
        "handle": "regal-maroon-silk-zardosi-cutwork-bridal-lehenga-double-dupatta",
        "title": "Regal Maroon Silk Zardosi Cutwork Bridal Lehenga Choli with Double Dupatta (Edition 176)",
        "color": "Maroon",
        "colorTag": "maroon",
        "swatchHex": "#6E1220",
        "designFamily": "royal-cutwork-edition-176",
        "designFamilyTitle": "Royal Cutwork Bridal Edition",
        "inrPrice": 19625,
        "status": "draft",
        "motifLead": (
            "Full-flare 4.50-meter bridal silk lehenga richly embellished with zardosi, cutdana, pearl, bead, "
            "and multi-thread embroidery finished with scalloped cutwork borders and attached bridal cancan."
        ),
        "dupattaNote": (
            "Includes a heavy embroidered cutwork soft net veil dupatta, a coordinating heavy embroidered viscose "
            "shoulder drape dupatta, and handcrafted bridal latkan tassels."
        ),
        "occasionNote": "bridal ceremonies, pheras, and formal wedding receptions",
        "images": [],
    },
    {
        "code": "177",
        "skuBase": "LM-BV3-177",
        "handle": "deep-wine-silk-zardosi-cutwork-bridal-lehenga-double-dupatta",
        "title": "Deep Wine Silk Zardosi Cutwork Bridal Lehenga Choli with Double Dupatta (Edition 177)",
        "color": "Wine",
        "colorTag": "wine",
        "swatchHex": "#611430",
        "designFamily": "royal-cutwork-edition-177",
        "designFamilyTitle": "Royal Cutwork Bridal Edition",
        "inrPrice": 19625,
        "status": "draft",
        "motifLead": (
            "Full-flare 4.50-meter bridal silk lehenga richly embellished with zardosi, cutdana, pearl, bead, "
            "and multi-thread embroidery finished with scalloped cutwork borders and attached bridal cancan."
        ),
        "dupattaNote": (
            "Includes a heavy embroidered cutwork soft net veil dupatta, a coordinating heavy embroidered viscose "
            "shoulder drape dupatta, and handcrafted bridal latkan tassels."
        ),
        "occasionNote": "bridal ceremonies, receptions, and grand wedding celebrations",
        "images": [],
    },
    {
        "code": "178",
        "skuBase": "LM-BV3-178",
        "handle": "marigold-saffron-silk-royal-arch-bridal-lehenga-double-dupatta",
        "title": "Marigold Saffron Silk Royal Arch Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Marigold Saffron",
        "colorTag": "orange",
        "swatchHex": "#C95B16",
        "designFamily": "royal-arch-scalloped-lotus",
        "designFamilyTitle": "Royal Arch & Scalloped Lotus",
        "inrPrice": 19625,
        "status": "active",
        "motifLead": (
            "Sunlit marigold-saffron bridal silk meets majestic Mughal mihrab arches, scalloped lotus medallions, "
            "and luminous gold zardosi, cutdana, pearl, and resham embroidery across a sweeping 4.50-meter cancan-backed skirt."
        ),
        "dupattaNote": (
            "Styled with a soft peach-gold cutwork embroidered soft net head veil, a richly bordered marigold-rust "
            "viscose shoulder drape, and tiered pearl-and-zari bridal latkan tassels."
        ),
        "occasionNote": "sunlit daytime pheras, heritage palace weddings, Anand Karaj, and festive bridal ceremonies",
        "images": [
            {
                "file": "luxemia-bv3-178-marigold-arch-1",
                "alt": "Marigold Saffron Silk Royal Arch Zardosi Bridal Lehenga Choli with Double Dupatta — full-length bridal view showing golden-saffron arch-embroidered silk skirt and dual dupattas",
            },
            {
                "file": "luxemia-bv3-178-marigold-arch-2",
                "alt": "Marigold Saffron Silk Royal Arch Zardosi Bridal Lehenga Choli — close-up of sweetheart embroidered silk blouse, pearl sleeve drops, and cutwork soft net veil",
            },
        ],
    },
    {
        "code": "179",
        "skuBase": "LM-BV3-179",
        "handle": "burnt-saffron-silk-rajputana-palace-bridal-lehenga-double-dupatta",
        "title": "Burnt Saffron Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta",
        "color": "Burnt Saffron",
        "colorTag": "orange",
        "swatchHex": "#B84718",
        "designFamily": "rajputana-palace-baraat",
        "designFamilyTitle": "Rajputana Palace & Heritage Motifs",
        "inrPrice": 18695,
        "status": "active",
        "motifLead": (
            "Warm burnt-saffron and rust-gold bridal silk showcases storybook Rajputana courtyard arches, royal palms, "
            "and ceremonial baraat border panels embroidered with antique zardosi, cutdana, pearl beads, and fine multicolor resham."
        ),
        "dupattaNote": (
            "Completed with two heirloom dupattas — a blush-peach scalloped cutwork soft net head veil and a deep "
            "burnt-saffron embroidered viscose shoulder drape — finished with clustered dome latkan tassels."
        ),
        "occasionNote": "royal fort and destination weddings, daytime bridal pheras, and autumn-winter wedding celebrations",
        "images": [
            {
                "file": "luxemia-bv3-179-terracotta-palace-1",
                "alt": "Burnt Saffron Silk Rajputana Palace Zardosi Bridal Lehenga Choli with Double Dupatta — full-length view showcasing palace-and-palm embroidered silk skirt and double dupatta set",
            },
            {
                "file": "luxemia-bv3-179-terracotta-palace-2",
                "alt": "Burnt Saffron Silk Rajputana Palace Zardosi Bridal Lehenga Choli — close-up detail of embroidered bridal choli, beaded elbow sleeves, and dual cutwork dupattas",
            },
        ],
    },
]


def usd_from_inr(inr: int) -> str:
    """Strict conversion formula: USD = (INR * 2) / 90 rounded half-up to cents."""
    val = (Decimal(inr) * Decimal(2)) / Decimal(90)
    return str(val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def cost_from_inr(inr: int) -> str:
    """Landed INR cost reference in USD at INR / 90."""
    val = Decimal(inr) / Decimal(90)
    return str(val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def compare_at_from_usd(usd_str: str) -> str:
    """Consistent 1.30x reference compare-at price."""
    val = Decimal(usd_str) * Decimal("1.30")
    return str(val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def build_body_html(item: dict, usd_price: str) -> str:
    return (
        f"<p>{item['motifLead']} {item['dupattaNote']} Crafted for {item['occasionNote']}.</p>\n"
        "<h3>Included 4-Piece Bridal Set</h3>\n"
        "<ul>\n"
        f"  <li><strong>Stitched Lehenga Skirt:</strong> {item['color']} Bridal Silk with 4.50 m (177 in) grand circular flare, "
        "43 in length, 38 in readymade waist (alterable from 27 in up to 42 in), attached structured cancan &amp; canvas lining, "
        "drawstring with side closure, and handcrafted multi-tier beaded latkan tassels.</li>\n"
        f"  <li><strong>Readymade Embroidered Blouse (Choli):</strong> Heavy-work {item['color']} Bridal Silk blouse lined in soft cotton "
        "with removable bust pads, scalloped sweetheart front neckline, keyhole dori back, and pearl-fringed elbow sleeves "
        "(38 in readymade bust; alterable from 32 in up to 42 in).</li>\n"
        "  <li><strong>Primary Veil Dupatta:</strong> Heavy embroidered Soft Net bridal dupatta with scalloped cutwork border and all-over motifs.</li>\n"
        f"  <li><strong>Secondary Shoulder Dupatta:</strong> Coordinating heavy embroidered {item['color']} Viscose drape dupatta with ornate zardosi border and pallu.</li>\n"
        "</ul>\n"
        "<h3>Standard &amp; Custom Made-to-Measure Sizing</h3>\n"
        "<ul>\n"
        "  <li><strong>Standard Sizes (32, 34, 36, 38, 40, 42):</strong> Size 38 is the supplied readymade fit; sizes 32, 34, 36, 40, and 42 are tailored professionally within the verified 42 in bust and waist seam capacity.</li>\n"
        "  <li><strong>Custom Fit (Made to Measure):</strong> Select <em>Custom Fit</em> to tailor bust (28–42 in), underbust, choli waist, lehenga waist (25–42 in), skirt length (36–43 in), blouse padding, and cancan volume — submit measurements on the product page or after ordering.</li>\n"
        "  <li><strong>Extended Sizes (44–46):</strong> Exceed the 42 in readymade seam allowance; contact LuxeMia before ordering to confirm custom panel feasibility.</li>\n"
        "</ul>\n"
        "<h3>Craftsmanship, Care &amp; Dispatch</h3>\n"
        "<ul>\n"
        "  <li><strong>Embroidery:</strong> Antique-gold zardosi, cutdana, pearl, bead, sequin, and multi-thread resham embroidery with scalloped cutwork border.</li>\n"
        "  <li><strong>Set Weight:</strong> Approx. 7.5 kg (complete 4-piece bridal ensemble with attached cancan and double dupatta).</li>\n"
        "  <li><strong>Garment Care:</strong> Professional dry clean only. Store folded in breathable muslin away from direct sunlight and moisture.</li>\n"
        "  <li><strong>Shipping &amp; Timing:</strong> Ships from India with tracked delivery to the United States (qualifies for free standard U.S. shipping at $150+; no tariffs or import fees collected at your doorstep for U.S. deliveries), Canada, the United Kingdom, Australia, New Zealand, South Africa, and Mauritius. Without alterations, estimated dispatch is within 3–4 business days; requested size alterations or custom finishing add 3 business days once after measurements are confirmed.</li>\n"
        "</ul>"
    )


def build_plain_description(item: dict) -> str:
    return (
        f"{item['motifLead']} {item['dupattaNote']} Crafted for {item['occasionNote']}. "
        f"Included 4-piece bridal set: fully stitched {item['color']} Bridal Silk lehenga skirt (4.50 m flare, 43 in length, "
        "38 in readymade waist alterable up to 42 in, attached standard cancan and canvas lining, handcrafted beaded latkan tassels), "
        f"readymade heavy embroidered {item['color']} Bridal Silk blouse (38 in readymade bust alterable from 32 in to 42 in, cotton lined with removable pads, "
        "sweetheart neckline, keyhole dori back, elbow sleeves), heavy embroidered cutwork Soft Net veil dupatta, and heavy embroidered Viscose shoulder drape dupatta. "
        "Embroidery: zardosi, cutdana, pearl, bead, and multi-thread resham work with scalloped cutwork border. Set weight approx. 7.5 kg. "
        "Available in standard sizes 32, 34, 36, 38, 40, and 42 plus Custom Fit made-to-measure tailoring (submit measurements at checkout or after ordering). "
        "Dry clean only. Ships from India; without alterations, estimated dispatch is within 3–4 business days, and requested alterations or custom finishing add 3 business days once after measurements are confirmed."
    )


def build_tags(item: dict) -> list[str]:
    return [
        "bridal-lehenga",
        "lehenga",
        "lehenga-choli",
        "silk-lehenga",
        "double-dupatta-lehenga",
        "wedding-lehenga",
        "zardosi-lehenga",
        "royal-bridal-vol-3",
        "utsav-tailoring",
        f"design-family:{item['designFamily']}",
        f"color:{item['colorTag']}",
        f"shade:{item['color'].lower().replace(' ', '-')}",
        "fabric:Bridal Silk",
        "material:Silk; Soft Net; Viscose",
        "work:Zardosi, Cutdana, Pearl, Bead, Multi-Thread & Cutwork Embroidery",
        "construction:Stitched",
        "tailoring:Standard sizes 32-42 and Custom Fit tailoring",
        "included:Stitched bridal silk lehenga with cancan; Readymade embroidered silk blouse; Embroidered soft net veil dupatta; Embroidered viscose drape dupatta",
        "occasion:Bridal",
        "occasion:Wedding",
        "occasion:Reception",
        "style:bridal",
        "style:traditional",
        "role:bride",
        "availability:ready-to-ship",
        "ships-within:3-4 business days",
        "new-arrival",
    ]


def build_seo_title(item: dict) -> str:
    base = f"{item['color']} Silk Bridal Lehenga Double Dupatta | LuxeMia"
    if len(base) <= 60:
        return base
    return f"{item['color']} Silk Bridal Lehenga Set | LuxeMia"[:60]


def build_seo_description(item: dict, usd_price: str) -> str:
    desc = (
        f"Shop {item['color']} Silk Zardosi Bridal Lehenga Choli (${usd_price}) with 4.5m flare, "
        "cancan, readymade blouse & double dupatta. Sizes 32–42 & Custom Fit."
    )
    return desc[:158]


def verify_no_supplier_leak(text: str, context: str) -> None:
    banned = [
        "tathastu",
        "anaara",
        "anara",
        "amrah",
        "kapdavilla",
        "wholetex",
        "kavyastyle",
        "surattextile",
        "am-17205",
        "aa-16",
        "aa-17",
        "aa-18",
        "worldwide",
        "100% authentic",
        "custom sizing: available on request",
    ]
    lower = text.lower()
    for term in banned:
        if term in lower:
            raise AssertionError(f"Forbidden term '{term}' found in {context}")


def main() -> None:
    CSV_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)

    catalog_items = []
    csv_rows = []

    for item in DESIGNS:
        usd_price = usd_from_inr(item["inrPrice"])
        compare_at = compare_at_from_usd(usd_price)
        cost_usd = cost_from_inr(item["inrPrice"])
        is_active = item["status"] == "active"

        # Verify every referenced image exists in both JPG and WebP
        images_out = []
        for idx, img in enumerate(item["images"], start=1):
            jpg_path = IMAGE_DIR / f"{img['file']}.jpg"
            webp_path = IMAGE_DIR / f"{img['file']}.webp"
            if not jpg_path.exists():
                raise FileNotFoundError(f"Missing JPG: {jpg_path}")
            if not webp_path.exists():
                raise FileNotFoundError(f"Missing WebP: {webp_path}")
            images_out.append(
                {
                    "position": idx,
                    "jpgPath": f"/images/bridal-vol3/{img['file']}.jpg",
                    "webpPath": f"/images/bridal-vol3/{img['file']}.webp",
                    "shopifySrc": f"{SITE_URL}/images/bridal-vol3/{img['file']}.jpg",
                    "alt": img["alt"],
                }
            )

        if is_active and not images_out:
            raise AssertionError(f"Active product {item['handle']} must have at least 1 verified image")

        body_html = build_body_html(item, usd_price)
        plain_desc = build_plain_description(item)
        tags = build_tags(item)
        seo_title = build_seo_title(item)
        seo_desc = build_seo_description(item, usd_price)

        for label, value in [
            ("handle", item["handle"]),
            ("title", item["title"]),
            ("bodyHtml", body_html),
            ("description", plain_desc),
            ("tags", ", ".join(tags)),
            ("seoTitle", seo_title),
            ("seoDescription", seo_desc),
        ]:
            verify_no_supplier_leak(value, f"{item['skuBase']}.{label}")

        variants_out = []
        for s in SIZE_CHART:
            size_slug = "CUSTOM" if s["size"] == "Custom Fit" else s["size"]
            sku = f"{item['skuBase']}-{size_slug}"
            qty = s["inventoryQty"] if is_active else 0
            variants_out.append(
                {
                    "sku": sku,
                    "size": s["size"],
                    "alpha": s["alpha"],
                    "usRef": s["usRef"],
                    "price": usd_price,
                    "compareAtPrice": compare_at,
                    "costUsd": cost_usd,
                    "grams": 7500,
                    "inventoryQty": qty,
                    "availableForSale": bool(is_active and s["available"] and qty > 0),
                    "fitType": s["fitType"],
                    "fitNote": s["fitNote"],
                }
            )

        catalog_items.append(
            {
                "editionCode": item["code"],
                "skuBase": item["skuBase"],
                "handle": item["handle"],
                "title": item["title"],
                "vendor": "LuxeMia",
                "productType": "Bridal Lehenga",
                "status": item["status"],
                "published": is_active,
                "publishedAt": PUBLISHED_AT,
                "color": item["color"],
                "colorTag": item["colorTag"],
                "swatchHex": item["swatchHex"],
                "designFamily": item["designFamily"],
                "designFamilyTitle": item["designFamilyTitle"],
                "inrPrice": item["inrPrice"],
                "priceUsd": usd_price,
                "compareAtPriceUsd": compare_at,
                "costUsd": cost_usd,
                "pricingFormula": f"({item['inrPrice']} * 2) / 90 = {usd_price}",
                "weightKg": 7.5,
                "weightGrams": 7500,
                "specs": {
                    "lehengaFabric": "Bridal Silk",
                    "blouseFabric": "Bridal Silk with Soft Cotton Lining",
                    "primaryDupatta": "Heavy Embroidered Soft Net with Scalloped Cutwork Border",
                    "secondaryDupatta": f"Heavy Embroidered {item['color']} Viscose Drape Dupatta",
                    "work": "Zardosi, Cutdana, Pearl, Bead, Sequin & Multi-Thread Resham Embroidery with Cutwork Border",
                    "flare": "4.50 meters (177 inches)",
                    "lehengaLength": "43 inches (customizable 36–43 inches)",
                    "readymadeWaist": "38 inches (alterable 27–42 inches)",
                    "readymadeBust": "38 inches (alterable 32–42 inches)",
                    "liningAndCancan": "Attached structured bridal cancan and canvas lining",
                    "finishing": "Handcrafted multi-tier beaded latkan tassels, drawstring & side closure, removable bust pads",
                    "includedPieces": "4-Piece Set: Stitched Bridal Silk Lehenga (with Cancan), Readymade Embroidered Silk Blouse, Embroidered Soft Net Veil Dupatta & Embroidered Viscose Shoulder Dupatta",
                    "care": "Professional dry clean only",
                    "shipsWithin": "3-4 business days",
                },
                "seoTitle": seo_title,
                "seoDescription": seo_desc,
                "description": plain_desc,
                "bodyHtml": body_html,
                "tags": tags,
                "images": images_out,
                "variants": variants_out,
            }
        )

        # Emit Shopify 53-column CSV rows
        num_rows = max(len(variants_out), len(images_out))
        primary_img_src = images_out[0]["shopifySrc"] if images_out else ""

        for row_idx in range(num_rows):
            row = {col: "" for col in SHOPIFY_COLUMNS}
            row["Handle"] = item["handle"]

            if row_idx == 0:
                row["Title"] = item["title"]
                row["Body (HTML)"] = body_html
                row["Vendor"] = "LuxeMia"
                row["Product Category"] = (
                    "Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing"
                )
                row["Type"] = "Bridal Lehenga"
                row["Tags"] = ", ".join(tags)
                row["Published"] = "true" if is_active else "false"
                row["Option1 Name"] = "Size"
                row["Gift Card"] = "false"
                row["SEO Title"] = seo_title
                row["SEO Description"] = seo_desc
                row["Google Shopping / Google Product Category"] = (
                    "Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing"
                )
                row["Google Shopping / Gender"] = "female"
                row["Google Shopping / Age Group"] = "adult"
                row["Google Shopping / MPN"] = item["skuBase"]
                row["Google Shopping / Condition"] = "new"
                row["Google Shopping / Custom Product"] = "false"
                row["Google Shopping / Custom Label 0"] = "Bridal Lehenga"
                row["Google Shopping / Custom Label 1"] = item["color"]
                row["Google Shopping / Custom Label 2"] = "Royal Bridal Silk Vol-3"
                row["Google Shopping / Custom Label 3"] = "Double Dupatta"
                row["Google Shopping / Custom Label 4"] = "Standard & Custom Fit"
                row["Included / United States"] = "true"
                row["Included / International"] = "true"
                row["Status"] = item["status"]

            if row_idx < len(variants_out):
                v = variants_out[row_idx]
                row["Option1 Value"] = v["size"]
                row["Variant SKU"] = v["sku"]
                row["Variant Grams"] = str(v["grams"])
                row["Variant Inventory Tracker"] = "shopify"
                row["Variant Inventory Qty"] = str(v["inventoryQty"])
                row["Variant Inventory Policy"] = "deny"
                row["Variant Fulfillment Service"] = "manual"
                row["Variant Price"] = v["price"]
                row["Variant Compare At Price"] = v["compareAtPrice"]
                row["Variant Requires Shipping"] = "true"
                row["Variant Taxable"] = "true"
                row["Variant Weight Unit"] = "kg"
                row["Cost per item"] = v["costUsd"]
                if primary_img_src:
                    row["Variant Image"] = primary_img_src

            if row_idx < len(images_out):
                img = images_out[row_idx]
                row["Image Src"] = img["shopifySrc"]
                row["Image Position"] = str(img["position"])
                row["Image Alt Text"] = img["alt"]

            csv_rows.append(row)

    # Curated homepage assignments: 4 completely distinct design families, 0 duplicates
    homepage_features = {
        "heroWeddingEdit": {
            "handle": "sindoori-red-silk-heritage-jharokha-bridal-lehenga-double-dupatta",
            "designFamily": "heritage-jharokha-chevron",
            "imageIndex": 0,
        },
        "heroLehengasSuits": {
            "handle": "marigold-saffron-silk-royal-arch-bridal-lehenga-double-dupatta",
            "designFamily": "royal-arch-scalloped-lotus",
            "imageIndex": 0,
        },
        "categoryLehengas": {
            "handle": "royal-fuchsia-silk-mughal-paisley-bridal-lehenga-double-dupatta",
            "designFamily": "mughal-paisley-geometric",
            "imageIndex": 0,
        },
        "promoBridalParty": {
            "handle": "rani-magenta-silk-rajputana-palace-bridal-lehenga-double-dupatta",
            "designFamily": "rajputana-palace-baraat",
            "imageIndex": 0,
        },
    }

    payload = {
        "collectionName": COLLECTION_NAME,
        "generatedAt": PUBLISHED_AT,
        "pricingRule": "USD = round((INR * 2) / 90, 2)",
        "totalDesigns": len(catalog_items),
        "activeDesigns": sum(1 for i in catalog_items if i["status"] == "active"),
        "draftDesigns": sum(1 for i in catalog_items if i["status"] == "draft"),
        "totalImages": sum(len(i["images"]) for i in catalog_items),
        "sizeChart": SIZE_CHART,
        "tailoringOptions": TAILORING_OPTIONS,
        "homepageFeatures": homepage_features,
        "products": catalog_items,
    }

    JSON_OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    with CSV_OUT.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=SHOPIFY_COLUMNS)
        writer.writeheader()
        writer.writerows(csv_rows)

    print(f"Wrote {JSON_OUT.relative_to(ROOT)} ({payload['activeDesigns']} active, {payload['draftDesigns']} draft, {payload['totalImages']} images)")
    print(f"Wrote {CSV_OUT.relative_to(ROOT)} ({len(csv_rows)} CSV rows across {len(SHOPIFY_COLUMNS)} Shopify columns)")
    for p in catalog_items:
        print(
            f"  {p['skuBase']} | {p['status']:6s} | INR {p['inrPrice']:6,d} -> USD ${p['priceUsd']} "
            f"(cmp ${p['compareAtPriceUsd']}) | {len(p['images'])} imgs | {p['color']:17s} | {p['handle']}"
        )


if __name__ == "__main__":
    main()
