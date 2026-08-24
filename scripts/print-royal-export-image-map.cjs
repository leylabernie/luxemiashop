const PRODUCTS = [
  ["RE1585", "gamthi-work-pure-cotton-navratri-lehenga-choli-1580"],
  ["RE4269", "navratri-special-pink-color-pure-rayon-lehenga-cho-3688"],
  ["RE2361", "traditonal-red-gamthi-work-cotton-navratri-wear-le-2326"],
  ["RE2672", "digital-printed-lehenga-choli-with-kutchi-mirror-l-2634"],
  ["RE8030-Maroon", "traditional-navratri-cotton-lehenga-choli-with-fla-9805"],
  ["RE12338-Blue", "opulent-blue-designer-cora-cotton-lehenga-with-ban-18742"],
  ["RE1500", "lime-and-white-pure-cotton-mirror-work-and-gota-pa-1490"],
  ["RE6364-Red", "red-mirror-work-navratri-wear-lehenga-choli-with-d-6397"],
  ["RE4678", "navratri-special-heavy-muslin-cotton-lehenga-choli-4079"],
  ["RE1142", "navratri-special-butter-silk-printed-mirror-work-l-1137"],
  ["RE3478", "soft-butter-silk-with-real-mirror-work-lehenga-cho-3425"],
  ["RE674", "black-real-mirror-gota-patti-work-silk-lehenga-cho-667"],
  ["RE3317", "bandhani-print-navratri-chaniya-choli-3267"],
  ["RE4044", "soft-gaji-silk-printed-with-zari-border-lehenga-ch-3663"],
  ["RE10185-Black", "remarkable-black-heavy-flare-cotton-lehenga-with-s-13785"],
  ["RE2165", "black-maroon-reyon-printed-lehenga-choli-with-kodi-2130"],
];

const decodeHtml = (value) => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");

const cleanText = (value) => decodeHtml(value)
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const collectGallery = (html, pageUrl) => {
  const rows = [];
  const seen = new Set();
  const add = (raw, attr) => {
    if (!raw) return;
    try {
      const absolute = new URL(decodeHtml(raw.trim()), pageUrl).toString();
      if (!seen.has(absolute) && absolute.includes("/product/product-img/")) {
        seen.add(absolute);
        rows.push({ url: absolute, attr });
      }
    } catch {
      // Ignore malformed attributes.
    }
  };

  for (const tagMatch of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    for (const attr of [
      "src", "data-src", "data-lazy-src", "data-original", "data-image",
      "data-zoom-image", "data-large_image", "data-large-image", "data-thumb",
    ]) {
      const match = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
      if (match) add(match[1], attr);
    }
  }

  const firstFullIndex = rows.findIndex((row) => !row.url.includes("/thumb/"));
  let thumbs = [];
  if (firstFullIndex > 0) {
    thumbs = rows.slice(0, firstFullIndex).filter((row) => row.url.includes("/thumb/"));
  } else {
    thumbs = rows.filter((row) => row.url.includes("/thumb/")).slice(0, 10);
  }

  const fullFromThumbs = thumbs.map((row) => row.url.replace("/product-img/thumb/", "/product-img/"));
  const explicitFull = firstFullIndex >= 0 ? rows[firstFullIndex].url : null;
  return [...new Set([...fullFromThumbs, ...(explicitFull ? [explicitFull] : [])])].slice(0, 10);
};

async function fetchOne([expectedSku, slug]) {
  const sourceUrl = `https://www.royalexport.in/product/${slug}`;
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
  const text = cleanText(html);
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const pageSku = text.match(/SKU\s*:\s*([A-Za-z0-9][A-Za-z0-9_-]{1,30})/i)?.[1] || expectedSku;
  const price = text.match(/(?:₹|Rs\.?\s*)?([0-9][0-9,]{2,})\s*\/\s*Pcs/i)?.[1]?.replace(/,/g, "") || null;
  return {
    expectedSku,
    pageSku,
    sourceUrl,
    status: response.status,
    title: h1 ? cleanText(h1[1]) : "",
    priceInr: price ? Number(price) : null,
    inStock: /\bIn Stock\b/i.test(text),
    images: collectGallery(html, sourceUrl),
  };
}

(async () => {
  const output = [];
  for (const product of PRODUCTS) {
    try {
      output.push(await fetchOne(product));
    } catch (error) {
      output.push({ expectedSku: product[0], sourceUrl: `https://www.royalexport.in/product/${product[1]}`, error: String(error) });
    }
  }
  console.log("ROYAL_EXPORT_IMAGE_MAP_START");
  console.log(JSON.stringify(output));
  console.log("ROYAL_EXPORT_IMAGE_MAP_END");
})().catch((error) => {
  console.error("ROYAL_EXPORT_IMAGE_MAP_FATAL", error);
  process.exitCode = 1;
});
