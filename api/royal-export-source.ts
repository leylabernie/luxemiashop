const ALLOWED_SLUGS = new Set([
  "gamthi-work-pure-cotton-navratri-lehenga-choli-1580",
  "navratri-special-pink-color-pure-rayon-lehenga-cho-3688",
  "traditonal-red-gamthi-work-cotton-navratri-wear-le-2326",
  "digital-printed-lehenga-choli-with-kutchi-mirror-l-2634",
  "traditional-navratri-cotton-lehenga-choli-with-fla-9805",
  "opulent-blue-designer-cora-cotton-lehenga-with-ban-18742",
  "lime-and-white-pure-cotton-mirror-work-and-gota-pa-1490",
  "red-mirror-work-navratri-wear-lehenga-choli-with-d-6397",
  "navratri-special-heavy-muslin-cotton-lehenga-choli-4079",
  "navratri-special-butter-silk-printed-mirror-work-l-1137",
  "soft-butter-silk-with-real-mirror-work-lehenga-cho-3425",
  "black-real-mirror-gota-patti-work-silk-lehenga-cho-667",
  "bandhani-print-navratri-chaniya-choli-3267",
  "soft-gaji-silk-printed-with-zari-border-lehenga-ch-3663",
  "remarkable-black-heavy-flare-cotton-lehenga-with-s-13785",
  "black-maroon-reyon-printed-lehenga-choli-with-kodi-2130",
]);

const decodeHtml = (value: string) => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

const cleanText = (value: string) => decodeHtml(value)
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const isAllowedPage = (raw: string) => {
  const parsed = new URL(raw);
  const hostname = parsed.hostname.replace(/^www\./, "");
  const slug = parsed.pathname.replace(/\/$/, "").split("/").pop() || "";
  return hostname === "royalexport.in" && parsed.pathname.startsWith("/product/") && ALLOWED_SLUGS.has(slug);
};

const collectImages = (html: string, pageUrl: string) => {
  const rows: { url: string; origin: string }[] = [];
  const seen = new Set<string>();
  const add = (raw: string, origin: string) => {
    let value = decodeHtml(raw.trim()).replace(/^['"]|['"]$/g, "");
    if (!value || value.startsWith("data:")) return;
    if (value.includes(",") && /\s\d+[wx](?:,|$)/.test(value)) {
      for (const part of value.split(",")) add(part.trim().split(/\s+/)[0], `${origin}:srcset`);
      return;
    }
    try {
      const absolute = new URL(value, pageUrl).toString();
      const lower = absolute.toLowerCase();
      const blocked = [
        "logo", "favicon", "icon", "payment", "whatsapp", "facebook", "instagram",
        "youtube", "twitter", "placeholder", "loader", "size-chart", "size_chart",
        "review", "avatar", "flag", "sprite", "footer-left", "footer-right",
      ];
      if (blocked.some((token) => lower.includes(token)) || seen.has(absolute)) return;
      seen.add(absolute);
      rows.push({ url: absolute, origin });
    } catch {
      // Ignore malformed source attributes.
    }
  };

  for (const match of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) {
    add(match[1], "meta");
  }
  for (const match of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*>/gi)) {
    add(match[1], "meta");
  }
  for (const tag of html.matchAll(/<img\b[^>]*>/gi)) {
    const imageTag = tag[0];
    for (const attr of ["src", "data-src", "data-lazy-src", "data-original", "data-image", "data-zoom-image", "data-large_image", "data-large-image", "data-thumb", "srcset", "data-srcset"]) {
      const match = imageTag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
      if (match) add(match[1], `img:${attr}`);
    }
  }
  for (const match of html.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+?\.(?:jpe?g|png|webp|avif)(?:\?[^"'<>\\\s]*)?/gi)) {
    add(match[0].replace(/\\\//g, "/"), "raw-html");
  }
  return rows;
};

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawUrl = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  if (!rawUrl || typeof rawUrl !== "string") {
    res.status(400).json({ error: "A source product URL is required" });
    return;
  }

  try {
    if (!isAllowedPage(rawUrl)) {
      res.status(403).json({ error: "Source URL is not in the approved product allowlist" });
      return;
    }

    const response = await fetch(rawUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        referer: "https://www.royalexport.in/navratri-lehnega-choli",
      },
      redirect: "follow",
    });
    const html = await response.text();
    const text = cleanText(html);
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const title = h1 ? cleanText(h1[1]) : "";
    const sku = text.match(/SKU\s*:\s*([A-Za-z0-9][A-Za-z0-9_-]{1,30})/i)?.[1] || "";
    const price = text.match(/(?:₹|Rs\.?\s*)?([0-9][0-9,]{2,})\s*\/\s*Pcs/i)?.[1]?.replace(/,/g, "") || null;

    res.status(response.ok ? 200 : response.status).json({
      fetchedAt: new Date().toISOString(),
      sourceUrl: rawUrl,
      upstreamStatus: response.status,
      title,
      sku,
      priceInr: price ? Number(price) : null,
      inStock: /\bIn Stock\b/i.test(text),
      images: collectImages(html, rawUrl),
      text,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
