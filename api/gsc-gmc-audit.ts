const SITE = "https://luxemia.shop";

const decodeXml = (value: string) => value
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");

const tag = (xml: string, name: string): string => {
  const match = xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match?.[1] ? decodeXml(match[1].trim()) : "";
};

const unique = <T,>(values: T[]): T[] => [...new Set(values)];

const checkUrls = async (urls: string[], limit = 40) => {
  const selected = unique(urls).slice(0, limit);
  const results = await Promise.all(selected.map(async (url) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        headers: { "user-agent": "LuxeMia-GSC-GMC-Audit/2026-08-24" },
      });
      return {
        url,
        status: response.status,
        location: response.headers.get("location") || "",
        contentType: response.headers.get("content-type") || "",
      };
    } catch (error) {
      return { url, status: 0, location: "", contentType: "", error: String(error) };
    }
  }));
  return results;
};

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const [feedResponse, sitemapResponse, robotsResponse] = await Promise.all([
      fetch(`${SITE}/merchant-feed.xml?audit=${Date.now()}`, { cache: "no-store" }),
      fetch(`${SITE}/sitemap.xml?audit=${Date.now()}`, { cache: "no-store" }),
      fetch(`${SITE}/robots.txt?audit=${Date.now()}`, { cache: "no-store" }),
    ]);

    const [feedXml, sitemapXml, robots] = await Promise.all([
      feedResponse.text(), sitemapResponse.text(), robotsResponse.text(),
    ]);

    const itemXml = feedXml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    const items = itemXml.map((xml) => ({
      id: tag(xml, "g:id"),
      groupId: tag(xml, "g:item_group_id"),
      title: tag(xml, "g:title"),
      description: tag(xml, "g:description"),
      link: tag(xml, "g:link"),
      image: tag(xml, "g:image_link"),
      availability: tag(xml, "g:availability"),
      price: tag(xml, "g:price"),
      salePrice: tag(xml, "g:sale_price"),
      condition: tag(xml, "g:condition"),
      brand: tag(xml, "g:brand"),
      category: tag(xml, "g:google_product_category"),
      identifierExists: tag(xml, "g:identifier_exists"),
      gtin: tag(xml, "g:gtin"),
      mpn: tag(xml, "g:mpn"),
    }));

    const required = ["id", "title", "description", "link", "image", "availability", "price", "condition", "brand", "category"] as const;
    const missingRequired = items
      .map((item, index) => ({ index, id: item.id, missing: required.filter((key) => !item[key]) }))
      .filter((row) => row.missing.length > 0);

    const ids = items.map((item) => item.id).filter(Boolean);
    const duplicateIds = unique(ids.filter((id, index) => ids.indexOf(id) !== index));
    const malformedPrices = items.filter((item) => !/^\d+(?:\.\d{2})? [A-Z]{3}$/.test(item.price));
    const invalidSalePrices = items.filter((item) => {
      if (!item.salePrice) return false;
      const price = Number.parseFloat(item.price);
      const sale = Number.parseFloat(item.salePrice);
      return !Number.isFinite(price) || !Number.isFinite(sale) || sale >= price;
    });
    const invalidAvailability = items.filter((item) => !["in_stock", "out_of_stock", "preorder", "backorder"].includes(item.availability));
    const identifierConflicts = items.filter((item) => item.identifierExists === "no" && Boolean(item.gtin || item.mpn));

    const knownDraftHandles = [
      "pure-cotton-gamthi-work-navratri-lehenga-choli-set",
      "pink-pure-rayon-gamthi-gota-patti-navratri-lehenga-choli-set",
      "red-pure-cotton-gamthi-mirror-work-navratri-lehenga-choli-set",
      "blue-white-muslin-kutchi-mirror-digital-print-lehenga-choli-set",
      "maroon-pure-cotton-gamthi-mirror-navratri-lehenga-choli-set",
      "blue-cora-cotton-bandhej-gamthi-navratri-lehenga-top-set",
      "lime-white-pure-cotton-mirror-gota-patti-lehenga-choli-set",
      "red-pure-cotton-mirror-work-navratri-lehenga-set-with-purse",
      "muslin-cotton-real-mirror-work-navratri-lehenga-choli-set",
      "butter-silk-digital-print-mirror-work-navratri-lehenga-choli-set",
      "butter-silk-real-mirror-work-navratri-lehenga-choli-set",
      "black-butter-silk-real-mirror-gota-patti-navratri-lehenga-choli",
      "dola-silk-bandhani-ajrakh-navratri-chaniya-choli-set",
      "soft-gaji-silk-zari-border-navratri-lehenga-choli-set",
      "black-jam-cotton-8-meter-flare-navratri-lehenga-set",
      "black-maroon-rayon-kodi-lace-navratri-lehenga-choli-set",
      "__connector_schema_probe_do_not_save__",
    ];
    const draftLeakage = items.filter((item) => knownDraftHandles.some((handle) => item.link.includes(handle)));

    const sitemapUrls = [...sitemapXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
    const duplicateSitemapUrls = unique(sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index));
    const sitemapQueryUrls = sitemapUrls.filter((url) => url.includes("?"));
    const sitemapNonHttps = sitemapUrls.filter((url) => !url.startsWith("https://luxemia.shop/"));
    const sitemapProductUrls = sitemapUrls.filter((url) => url.includes("/product/"));

    const feedBaseProductLinks = unique(items.map((item) => item.link.split("?")[0]).filter((url) => url.includes("/product/")));
    const feedProductsMissingFromSitemap = feedBaseProductLinks.filter((url) => !sitemapUrls.includes(url));
    const sitemapProductsMissingFromFeed = sitemapProductUrls.filter((url) => !feedBaseProductLinks.includes(url));

    const sampledProductLinks = await checkUrls(feedBaseProductLinks.filter((_, index) => index % Math.max(1, Math.floor(feedBaseProductLinks.length / 40)) === 0), 40);
    const sampledImages = await checkUrls(unique(items.map((item) => item.image)).filter((_, index) => index % Math.max(1, Math.floor(items.length / 30)) === 0), 30);

    const productLinkFailures = sampledProductLinks.filter((row) => row.status !== 200);
    const imageFailures = sampledImages.filter((row) => row.status !== 200 || !row.contentType.toLowerCase().startsWith("image/"));

    const expectedRobots = {
      sitemapDeclared: /Sitemap:\s*https:\/\/luxemia\.shop\/sitemap\.xml/i.test(robots),
      allowsVariant: /Allow:\s*\/\*\?variant=\*/i.test(robots),
      blocksSearch: /Disallow:\s*\/search/i.test(robots),
      blocksCheckout: /Disallow:\s*\/checkout/i.test(robots),
      hasCleanParam: /Clean-param:/i.test(robots),
    };

    const passed =
      feedResponse.status === 200 &&
      sitemapResponse.status === 200 &&
      robotsResponse.status === 200 &&
      items.length > 0 &&
      missingRequired.length === 0 &&
      duplicateIds.length === 0 &&
      malformedPrices.length === 0 &&
      invalidSalePrices.length === 0 &&
      invalidAvailability.length === 0 &&
      identifierConflicts.length === 0 &&
      draftLeakage.length === 0 &&
      duplicateSitemapUrls.length === 0 &&
      sitemapQueryUrls.length === 0 &&
      sitemapNonHttps.length === 0 &&
      feedProductsMissingFromSitemap.length === 0 &&
      productLinkFailures.length === 0 &&
      imageFailures.length === 0 &&
      Object.values(expectedRobots).every(Boolean);

    return res.status(200).json({
      auditedAt: new Date().toISOString(),
      passed,
      endpoints: {
        feed: { status: feedResponse.status, contentType: feedResponse.headers.get("content-type"), bytes: feedXml.length },
        sitemap: { status: sitemapResponse.status, contentType: sitemapResponse.headers.get("content-type"), bytes: sitemapXml.length },
        robots: { status: robotsResponse.status, contentType: robotsResponse.headers.get("content-type"), bytes: robots.length },
      },
      merchantFeed: {
        itemCount: items.length,
        productGroupCount: unique(items.map((item) => item.groupId)).length,
        uniqueBaseProductLinks: feedBaseProductLinks.length,
        missingRequiredCount: missingRequired.length,
        missingRequired: missingRequired.slice(0, 25),
        duplicateIds,
        malformedPriceCount: malformedPrices.length,
        invalidSalePriceCount: invalidSalePrices.length,
        invalidAvailabilityCount: invalidAvailability.length,
        identifierConflictCount: identifierConflicts.length,
        draftLeakageCount: draftLeakage.length,
        draftLeakage: draftLeakage.map((item) => ({ id: item.id, title: item.title, link: item.link })),
        sampleProductLinkCount: sampledProductLinks.length,
        productLinkFailures,
        sampleImageCount: sampledImages.length,
        imageFailures,
      },
      sitemap: {
        urlCount: sitemapUrls.length,
        productUrlCount: sitemapProductUrls.length,
        duplicateUrlCount: duplicateSitemapUrls.length,
        queryUrlCount: sitemapQueryUrls.length,
        nonHttpsCount: sitemapNonHttps.length,
        feedProductsMissingFromSitemapCount: feedProductsMissingFromSitemap.length,
        feedProductsMissingFromSitemap: feedProductsMissingFromSitemap.slice(0, 50),
        sitemapProductsMissingFromFeedCount: sitemapProductsMissingFromFeed.length,
        sitemapProductsMissingFromFeed: sitemapProductsMissingFromFeed.slice(0, 50),
      },
      robots: expectedRobots,
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
