const SOURCES: Record<string, string> = {
  RE1585: "gamthi-work-pure-cotton-navratri-lehenga-choli-1580",
  RE4269: "navratri-special-pink-color-pure-rayon-lehenga-cho-3688",
  RE2361: "traditonal-red-gamthi-work-cotton-navratri-wear-le-2326",
  RE2672: "digital-printed-lehenga-choli-with-kutchi-mirror-l-2634",
  "RE8030-Maroon": "traditional-navratri-cotton-lehenga-choli-with-fla-9805",
  "RE12338-Blue": "opulent-blue-designer-cora-cotton-lehenga-with-ban-18742",
  RE1500: "lime-and-white-pure-cotton-mirror-work-and-gota-pa-1490",
  "RE6364-Red": "red-mirror-work-navratri-wear-lehenga-choli-with-d-6397",
  RE4678: "navratri-special-heavy-muslin-cotton-lehenga-choli-4079",
  RE1142: "navratri-special-butter-silk-printed-mirror-work-l-1137",
  RE3478: "soft-butter-silk-with-real-mirror-work-lehenga-cho-3425",
  RE674: "black-real-mirror-gota-patti-work-silk-lehenga-cho-667",
  RE3317: "bandhani-print-navratri-chaniya-choli-3267",
  RE4044: "soft-gaji-silk-printed-with-zari-border-lehenga-ch-3663",
  "RE10185-Black": "remarkable-black-heavy-flare-cotton-lehenga-with-s-13785",
  RE2165: "black-maroon-reyon-printed-lehenga-choli-with-kodi-2130",
};

const decode = (value: string) => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const clean = (value: string) => decode(value).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const collect = (html: string, pageUrl: string) => {
  const candidates: string[] = [];
  const seen = new Set<string>();
  const add = (raw?: string) => {
    if (!raw) return;
    const value = decode(raw.trim());
    try {
      const absolute = new URL(value, pageUrl).toString();
      if (!seen.has(absolute)) {
        seen.add(absolute);
        candidates.push(absolute);
      }
    } catch {
      // Ignore malformed image attributes.
    }
  };

  for (const tagMatch of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    for (const attr of ["src", "data-src", "data-lazy-src", "data-original", "data-zoom-image", "data-large_image", "data-large-image", "data-thumb"]) {
      const match = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
      if (match) add(match[1]);
    }
  }

  const gallery = candidates.filter((url) => url.includes("/product/product-img/"));
  const firstFull = gallery.findIndex((url) => !url.includes("/thumb/"));
  const productThumbs = (firstFull >= 0 ? gallery.slice(0, firstFull) : gallery.slice(0, 8))
    .filter((url) => url.includes("/thumb/"));
  const fullImages = productThumbs.map((url) => url.replace("/product-img/thumb/", "/product-img/"));
  if (firstFull >= 0 && gallery[firstFull]) fullImages.push(gallery[firstFull]);
  return [...new Set(fullImages)].slice(0, 10);
};

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  const requested = Array.isArray(req.query?.sku) ? req.query.sku[0] : req.query?.sku;
  const key = Object.keys(SOURCES).find((sku) => sku.toLowerCase() === String(requested || "").toLowerCase());
  if (!key) {
    res.status(404).json({ error: "Approved source SKU not found" });
    return;
  }

  const sourceUrl = `https://www.royalexport.in/product/${SOURCES[key]}`;
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        referer: "https://www.royalexport.in/navratri-lehnega-choli",
      },
      redirect: "follow",
    });
    const html = await response.text();
    const text = clean(html);
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const pageSku = text.match(/SKU\s*:\s*([A-Za-z0-9][A-Za-z0-9_-]{1,30})/i)?.[1] || key;
    const price = text.match(/(?:₹|Rs\.?\s*)?([0-9][0-9,]{2,})\s*\/\s*Pcs/i)?.[1]?.replace(/,/g, "") || null;
    res.status(response.ok ? 200 : response.status).json({
      sku: pageSku,
      sourceUrl,
      title: h1 ? clean(h1[1]) : "",
      priceInr: price ? Number(price) : null,
      inStock: /\bIn Stock\b/i.test(text),
      images: collect(html, sourceUrl),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
