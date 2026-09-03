// Keep this strict-JSON object aligned with seoArchitecture.json. The release
// validator parses the marked block and fails the build if either copy drifts.
// Runtime code intentionally avoids importing JSON because Vercel compiles
// middleware with NodeNext and then bundles it through a separate pipeline.
const architecture = /* seo-architecture-json:start */ {
  "routes": {
    "/": {
      "title": "Indian Wedding Sarees, Lehengas & Ethnic Wear | LuxeMia",
      "description": "Shop South Asian bridal wear, sarees, lehengas, suits and menswear with tracked shipping to seven supported countries.",
      "h1": "LuxeMia Indian Wedding Sarees, Bridal Lehengas & Ethnic Wear"
    },
    "/lehengas": {
      "title": "Bridal & Wedding Lehengas Online | LuxeMia",
      "description": "Browse bridal and wedding-guest lehengas. Verify fabric, included pieces, sizing, availability and processing. Tracked shipping serves seven countries.",
      "h1": "Bridal & Wedding Lehengas Online"
    },
    "/sarees": {
      "title": "Indian Wedding Sarees Online | LuxeMia",
      "description": "Browse current wedding, silk and festive sarees. Verify fabric, work, blouse details, availability and processing. Tracked shipping serves seven countries.",
      "h1": "Indian Wedding Sarees Online"
    },
    "/suits": {
      "title": "Salwar Kameez & Suits Online | Anarkali, Sharara | LuxeMia",
      "description": "Browse current salwar kameez, Anarkali, sharara and palazzo suits. Verify exact product details. Tracked shipping serves seven countries.",
      "h1": "Salwar Kameez & Indian Suits Online"
    },
    "/menswear": {
      "title": "Sherwanis & Indian Wedding Menswear | LuxeMia",
      "description": "Browse current sherwanis, kurta pajama and Indo-Western menswear. Verify included pieces, sizing and availability. Tracked shipping serves seven countries.",
      "h1": "Indian Wedding Menswear & Sherwanis Online"
    },
    "/jewelry": {
      "title": "Kundan Bridal Jewelry & Wedding Sets | LuxeMia",
      "description": "Shop Kundan-style, polki-style and bridal necklace sets. Compare materials, finish, included pieces, measurements and availability.",
      "h1": "Indian Bridal Jewelry Sets & Wedding Necklaces"
    },
    "/collections/bridal-lehengas": {
      "title": "Bridal Lehengas | Indian Wedding Styles | LuxeMia",
      "description": "Browse current bridal lehenga listings. Verify color, fabric, work, included pieces, sizing and availability. Tracked shipping serves seven countries.",
      "h1": "Bridal Lehengas Online"
    },
    "/collections/party-wear-lehengas": {
      "title": "Party-Wear Lehengas & Festive Styles | LuxeMia",
      "description": "Browse current party-wear lehenga listings. Verify color, fabric, work, included pieces, sizing and availability. Tracked shipping serves seven countries.",
      "h1": "Party-Wear Lehengas Online"
    },
    "/collections/wedding-sarees": {
      "title": "Wedding Sarees & Indian Bridal Styles | LuxeMia",
      "description": "Browse current wedding saree listings. Verify fabric, work, blouse details, price and availability. Tracked shipping serves seven countries.",
      "h1": "Wedding Sarees Online"
    },
    "/collections/banarasi-sarees": {
      "title": "Banarasi Sarees | Current Catalog Listings | LuxeMia",
      "description": "Browse current sarees with explicit Banarasi evidence. Verify fabric wording, work, blouse details, dimensions and availability before ordering.",
      "h1": "Banarasi Sarees Online"
    },
    "/collections/designer-sarees": {
      "title": "Designer & Party-Wear Sarees Online | LuxeMia",
      "description": "Browse current designer and party-wear sarees. Verify color, fabric, work, blouse details and availability. Tracked shipping serves seven countries.",
      "h1": "Designer & Party-Wear Sarees Online"
    },
    "/collections/sharara-suits": {
      "title": "Sharara Suits | Wedding & Festive Styles | LuxeMia",
      "description": "Browse current sharara suit listings. Verify fabric, work, included pieces, sizing and availability. Tracked shipping serves seven countries.",
      "h1": "Sharara Suits Online"
    },
    "/collections/gharara-suits": {
      "title": "Gharara Suits | Wedding & Festive Styles | LuxeMia",
      "description": "Browse current gharara suit listings. Verify fabric, work, included pieces, sizing and availability. Tracked shipping serves seven countries.",
      "h1": "Gharara Suits Online"
    },
    "/collections/anarkali-suits": {
      "title": "Anarkali Suits | Wedding & Party Wear | LuxeMia",
      "description": "Browse current Anarkali suit listings. Verify fabric, work, included pieces, sizing and availability. Tracked shipping serves seven countries.",
      "h1": "Anarkali Suits Online"
    },
    "/collections/palazzo-suits": {
      "title": "Palazzo Suits | Wedding & Festive Styles | LuxeMia",
      "description": "Browse current palazzo suit listings. Verify fabric, work, included pieces, sizing and availability. Tracked shipping serves seven countries.",
      "h1": "Palazzo Suits Online"
    },
    "/collections/sherwani-for-groom": {
      "title": "Groom Sherwanis | Indian Wedding Menswear | LuxeMia",
      "description": "Browse current groom sherwani listings. Verify fabric, work, included garments, measurements and availability. Tracked shipping serves seven countries.",
      "h1": "Groom Sherwanis Online"
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
      "banarasi": "/collections/banarasi-sarees",
      "nri-wedding": "/collections/wedding-guest-outfits"
    },
    "suits": {
      "anarkali": "/collections/anarkali-suits",
      "sharara": "/collections/sharara-suits",
      "gharara": "/collections/gharara-suits",
      "palazzo": "/collections/palazzo-suits",
      "wedding": "/collections/wedding-guest-outfits",
      "party-wear": "/collections/wedding-guest-outfits",
      "festive": "/collections/wedding-guest-outfits",
      "bridesmaid": "/collections/bridal-party-outfits",
      "mother-of-bride": "/collections/bridal-party-outfits",
      "nri-wedding": "/collections/wedding-guest-outfits"
    },
    "menswear": {
      "sherwani": "/collections/sherwani-for-groom",
      "groom-sherwani": "/collections/sherwani-for-groom"
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
