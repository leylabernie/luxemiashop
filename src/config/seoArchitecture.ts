// Keep this strict-JSON object aligned with seoArchitecture.json. The release
// validator parses the marked block and fails the build if either copy drifts.
// Runtime code intentionally avoids importing JSON because Vercel compiles
// middleware with NodeNext and then bundles it through a separate pipeline.
const architecture = /* seo-architecture-json:start */ {
  "routes": {
    "/": {
      "title": "LuxeMia Ethnic Wear | Indian Wedding Sarees & Bridal Lehengas USA",
      "description": "Shop authentic South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to the USA, Canada, UK and supported markets.",
      "h1": "LuxeMia Indian Wedding Sarees, Bridal Lehengas & Ethnic Wear"
    },
    "/lehengas": {
      "title": "Bridal & Wedding Lehengas Online USA | LuxeMia",
      "description": "Shop bridal and wedding-guest lehengas online. Compare fabric, included pieces, stitching, sizing, availability and processing details.",
      "h1": "Bridal & Wedding Lehengas Online in the USA"
    },
    "/sarees": {
      "title": "Buy Indian Wedding Sarees Online in the U.S. | LuxeMia",
      "description": "Shop Indian wedding, silk and festive sarees online in the U.S. Compare stated fabric, work, blouse details, availability and tracked shipping.",
      "h1": "Indian Wedding Sarees Online in the USA"
    },
    "/suits": {
      "title": "Salwar Kameez & Suits Online | Anarkali, Sharara | LuxeMia",
      "description": "Shop salwar kameez, Anarkali, sharara and palazzo suits. Compare fabric, included pieces, stitching, sizing, availability and processing details.",
      "h1": "Salwar Kameez & Indian Suits Online in the USA"
    },
    "/menswear": {
      "title": "Buy Sherwanis Online USA | Groom & Wedding | LuxeMia",
      "description": "Shop sherwanis, kurta pajama and Indo-Western menswear. Compare fabric, included pieces, sizes, availability and processing details.",
      "h1": "Indian Wedding Menswear & Sherwanis Online in the USA"
    },
    "/jewelry": {
      "title": "Kundan Bridal Jewelry & Wedding Sets | LuxeMia",
      "description": "Shop Kundan-style, polki-style and bridal necklace sets. Compare materials, finish, included pieces, measurements and availability.",
      "h1": "Indian Bridal Jewelry Sets & Wedding Necklaces"
    },
    "/collections/bridal-lehengas": {
      "title": "Bridal Lehengas USA | Indian Wedding Styles | LuxeMia",
      "description": "Shop bridal lehengas online in the USA. Compare current colors, stated fabric, embroidery, included choli and dupatta pieces, sizing and availability.",
      "h1": "Bridal Lehengas Online in the USA"
    },
    "/collections/party-wear-lehengas": {
      "title": "Party-Wear Lehengas USA | Festive Styles | LuxeMia",
      "description": "Shop party-wear lehengas online in the USA. Compare colors, stated fabric, embroidery, included pieces, sizing and availability for festive events.",
      "h1": "Party-Wear Lehengas Online in the USA"
    },
    "/collections/wedding-sarees": {
      "title": "Wedding Sarees USA | Indian Bridal Styles | LuxeMia",
      "description": "Shop wedding sarees online in the USA. Compare current bridal styles by stated fabric, work, blouse details, price and availability before ordering.",
      "h1": "Wedding Sarees Online in the USA"
    },
    "/collections/designer-sarees": {
      "title": "Designer Sarees USA | Embroidered Party Styles | LuxeMia",
      "description": "Shop designer sarees online in the USA. Compare colors, stated fabric, embellishment, blouse details, price and availability.",
      "h1": "Designer & Party-Wear Sarees Online in the USA"
    },
    "/collections/sharara-suits": {
      "title": "Sharara Suits USA | Wedding & Festive | LuxeMia",
      "description": "Shop sharara suits online in the USA. Compare colors, stated fabric, embroidery, included kurti, sharara and dupatta pieces, sizing and availability.",
      "h1": "Sharara Suits Online in the USA"
    },
    "/collections/gharara-suits": {
      "title": "Gharara Suits USA | Wedding & Festive | LuxeMia",
      "description": "Shop gharara suits online in the USA. Compare colors, stated fabric, embroidery, included pieces, sizes and availability for celebrations.",
      "h1": "Gharara Suits Online in the USA"
    },
    "/collections/anarkali-suits": {
      "title": "Anarkali Suits Online USA | Wedding & Party Wear | LuxeMia",
      "description": "Shop Anarkali suits online in the USA. Compare colors, stated fabric, embroidery, included dupatta and bottoms, size options and availability.",
      "h1": "Anarkali Suits Online in the USA"
    }
  },
  "subcategoryLandingPaths": {
    "lehengas": {
      "bridal": "/collections/bridal-lehengas",
      "wedding": "/collections/bridal-lehengas",
      "wedding-guest": "/collections/wedding-guest-outfits",
      "bridesmaid": "/collections/bridal-party-outfits",
      "mother-of-bride": "/collections/bridal-party-outfits",
      "reception": "/collections/party-wear-lehengas",
      "party-wear": "/collections/party-wear-lehengas",
      "engagement": "/collections/party-wear-lehengas",
      "sangeet": "/collections/party-wear-lehengas",
      "mehendi": "/collections/mehendi-outfits",
      "haldi": "/collections/haldi-outfits",
      "nri-wedding": "/collections/wedding-guest-outfits"
    },
    "sarees": {
      "bridal": "/collections/wedding-sarees",
      "wedding": "/collections/wedding-sarees",
      "wedding-guest": "/collections/wedding-guest-outfits",
      "bridesmaid": "/collections/bridal-party-outfits",
      "mother-of-bride": "/collections/bridal-party-outfits",
      "reception": "/collections/designer-sarees",
      "party-wear": "/collections/designer-sarees",
      "festive": "/collections/designer-sarees",
      "designer": "/collections/designer-sarees",
      "silk": "/collections/silk-sarees",
      "nri-wedding": "/collections/wedding-guest-outfits"
    },
    "suits": {
      "anarkali": "/collections/anarkali-suits",
      "sharara": "/collections/sharara-suits",
      "gharara": "/collections/gharara-suits",
      "wedding": "/collections/wedding-guest-outfits",
      "party-wear": "/collections/wedding-guest-outfits",
      "festive": "/collections/wedding-guest-outfits",
      "bridesmaid": "/collections/bridal-party-outfits",
      "mother-of-bride": "/collections/bridal-party-outfits",
      "nri-wedding": "/collections/wedding-guest-outfits"
    }
  }
} /* seo-architecture-json:end */;

export interface IndexableRouteSeo {
  title: string;
  description: string;
  h1: string;
}

export const INDEXABLE_ROUTE_SEO = architecture.routes as Record<string, IndexableRouteSeo>;

export function getIndexableRouteSeo(path: string): IndexableRouteSeo {
  const route = INDEXABLE_ROUTE_SEO[path];
  if (!route) throw new Error(`Missing shared SEO architecture for ${path}`);
  return route;
}

export function getDedicatedSubcategoryPath(category: string, subcategory: string): string | undefined {
  const categoryPaths = architecture.subcategoryLandingPaths as Record<string, Record<string, string>>;
  return categoryPaths[category]?.[subcategory];
}
