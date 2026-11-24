import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITE_URL = 'https://luxemia.shop';
const SHOPIFY_STORE_DOMAIN = 'lovable-project-zlh0w.myshopify.com';
const SHOPIFY_API_VERSION = '2025-10';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const DEFAULT_STOREFRONT_TOKEN = 'ddde4eb4bfab3ea9c9c907f01a16ed6b';
const HIDDEN_BILLING_HANDLES = new Set([
  'luxemia-tailoring-saree-finishing-add-ons',
  'ws-art-silk-off-white-wedding-wear-thread-work-readymade-indo-western-sherwani-391809',
]);

export interface ShopifyFeedVariantNode {
  id: string;
  title: string;
  sku?: string | null;
  barcode?: string | null;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  image?: { url: string; altText?: string | null } | null;
  selectedOptions?: Array<{ name: string; value: string }>;
}

export interface ShopifyFeedProductNode {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  productType?: string | null;
  vendor?: string | null;
  availableForSale: boolean;
  tags?: string[];
  images?: { edges: Array<{ node: { url: string; altText?: string | null } }> };
  variants?: { edges: Array<{ node: ShopifyFeedVariantNode }> };
}

export interface GmcFeedRow {
  id: string;
  itemGroupId: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  availability: 'in_stock' | 'out_of_stock';
  price: string;
  salePrice?: string;
  googleProductCategory: string;
  productType: string;
  brand: string;
  condition: 'new';
  gender: 'female' | 'male' | 'unisex';
  ageGroup: 'adult' | 'kids';
  color: string;
  material: string;
  size: string;
  identifierExists: 'yes' | 'no';
  gtin?: string;
  mpn?: string;
  customLabel0: string;
  customLabel1: string;
  shipping: string;
}

const STOREFRONT_CATALOG_QUERY = `
  query GmcFeedProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          description
          productType
          vendor
          availableForSale
          tags
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                barcode
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Strips HTML tags and normalizes unverified superlative or legacy policy phrasing.
 */
export function sanitizeGmcText(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\b100%\s+authentic\b/gi, 'curated')
    .replace(/\bartisan[- ]made\b/gi, 'detailed')
    .replace(/\bhandcrafted\b/gi, 'detailed')
    .replace(/\bworldwide\b/gi, 'international')
    .replace(/\b(?:hassle[- ]free|free|\d+[- ]day)\s+returns?\b/gi, '48-hour photo-verified order protection')
    .replace(/\bcontinuous\s+unboxing(?:\/opening)?\s+video\b/gi, '2–3 clear photos')
    .replace(/\s+/g, ' ')
    .trim();
}

export function forceGmcSafeImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  const shopifyWebp = trimmed.match(
    /^https:\/\/cdn\.shopify\.com\/s\/files\/1\/0746\/4707\/7035\/files\/([A-Za-z0-9][A-Za-z0-9._-]{0,200})\.webp(?:\?(.*))?$/i,
  );
  if (shopifyWebp) {
    const [, name, query] = shopifyWebp;
    const version = query ? new URLSearchParams(query).get('v') : null;
    return `${SITE_URL}/gmc-images/${encodeURIComponent(name)}.jpg${
      version && /^\d{1,20}$/.test(version) ? `?v=${version}` : ''
    }`;
  }

  if (trimmed.includes('cdn.shopify.com') || trimmed.includes('myshopify.com')) {
    const cleaned = trimmed
      .replace(/[&?]width=\d+/g, '')
      .replace(/[&?]height=\d+/g, '')
      .replace(/[&?]crop=[^&]+/g, '')
      .replace(/[&?]quality=\d+/g, '')
      .replace(/[&?]format=\w+/g, '');
    const sep = cleaned.includes('?') ? '&' : '?';
    return `${cleaned}${sep}width=1500&quality=90&format=jpg`;
  }

  return trimmed;
}

function getTagValue(tags: string[], prefixes: string[]): string | undefined {
  for (const raw of tags) {
    const lower = raw.trim().toLowerCase();
    for (const prefix of prefixes) {
      if (lower.startsWith(prefix)) {
        const val = raw.slice(raw.indexOf(':') + 1).trim();
        if (val) return sanitizeGmcText(val);
      }
    }
  }
  return undefined;
}

function inferGenderLabel(product: ShopifyFeedProductNode): {
  titleGender: "Women's" | "Men's" | "Kids'";
  gmcGender: 'female' | 'male' | 'unisex';
  ageGroup: 'adult' | 'kids';
} {
  const haystack = `${product.productType || ''} ${product.title || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
  if (/\b(?:kids?|girls?|boys?)\b/.test(haystack)) {
    return { titleGender: "Kids'", gmcGender: 'unisex', ageGroup: 'kids' };
  }
  if (/\b(?:menswear|sherwani|men's|mens|groom|kurta\s+pajama|indo[- ]western\s+sherwani)\b/.test(haystack)) {
    return { titleGender: "Men's", gmcGender: 'male', ageGroup: 'adult' };
  }
  return { titleGender: "Women's", gmcGender: 'female', ageGroup: 'adult' };
}

function inferOccasionAndCategory(product: ShopifyFeedProductNode): {
  occasionCategory: string;
  googleProductCategory: string;
  productTypeLabel: string;
} {
  const haystack = `${product.productType || ''} ${product.title || ''} ${(product.tags || []).join(' ')}`.toLowerCase();

  let occasion = 'Wedding';
  if (haystack.includes('bridal')) occasion = 'Bridal';
  else if (haystack.includes('sangeet')) occasion = 'Sangeet';
  else if (haystack.includes('reception')) occasion = 'Reception';
  else if (haystack.includes('mehendi') || haystack.includes('mehndi')) occasion = 'Mehendi';
  else if (haystack.includes('haldi')) occasion = 'Haldi';
  else if (haystack.includes('diwali') || haystack.includes('eid') || haystack.includes('festive') || haystack.includes('navratri')) {
    occasion = 'Festive';
  } else if (haystack.includes('party')) {
    occasion = 'Party Wear';
  }

  if (/\b(?:jewelry|jewellery|necklace|earring|choker|bangle|tikka|kundan)\b/.test(haystack)) {
    const sub = haystack.includes('earring')
      ? 'Earrings'
      : haystack.includes('necklace') || haystack.includes('choker')
        ? 'Necklace Set'
        : 'Jewelry Set';
    return {
      occasionCategory: `${occasion} ${sub}`,
      googleProductCategory: '188',
      productTypeLabel: 'Jewelry',
    };
  }
  if (haystack.includes('lehenga')) {
    return {
      occasionCategory: `${occasion} Lehenga Choli`,
      googleProductCategory: '2271',
      productTypeLabel: 'Lehenga Choli',
    };
  }
  if (haystack.includes('saree') || haystack.includes('sari')) {
    return {
      occasionCategory: `${occasion} Saree`,
      googleProductCategory: '2271',
      productTypeLabel: 'Saree',
    };
  }
  if (haystack.includes('sherwani')) {
    return {
      occasionCategory: `${occasion} Sherwani`,
      googleProductCategory: '1594',
      productTypeLabel: 'Sherwani',
    };
  }
  if (haystack.includes('sharara')) {
    return {
      occasionCategory: `${occasion} Sharara Suit`,
      googleProductCategory: '1594',
      productTypeLabel: 'Sharara Suit',
    };
  }
  if (haystack.includes('gharara')) {
    return {
      occasionCategory: `${occasion} Gharara Suit`,
      googleProductCategory: '1594',
      productTypeLabel: 'Gharara Suit',
    };
  }
  if (haystack.includes('anarkali')) {
    return {
      occasionCategory: `${occasion} Anarkali Suit`,
      googleProductCategory: '2271',
      productTypeLabel: 'Anarkali Suit',
    };
  }
  if (haystack.includes('palazzo')) {
    return {
      occasionCategory: `${occasion} Palazzo Suit`,
      googleProductCategory: '1594',
      productTypeLabel: 'Palazzo Suit',
    };
  }
  if (haystack.includes('kurta')) {
    return {
      occasionCategory: `${occasion} Kurta Set`,
      googleProductCategory: '1594',
      productTypeLabel: 'Kurta Set',
    };
  }
  if (haystack.includes('blouse') && !haystack.includes('saree')) {
    return {
      occasionCategory: `${occasion} Saree Blouse`,
      googleProductCategory: '212',
      productTypeLabel: 'Blouse',
    };
  }
  return {
    occasionCategory: `${occasion} Salwar Kameez`,
    googleProductCategory: '1594',
    productTypeLabel: sanitizeGmcText(product.productType) || 'Salwar Kameez',
  };
}

const FABRIC_MATCHERS: Array<[RegExp, string]> = [
  [/\bbanarasi\s+silk\b/i, 'Banarasi Silk'],
  [/\bkanjivaram\s+silk\b/i, 'Kanjivaram Silk'],
  [/\btissue\s+silk\b/i, 'Tissue Silk'],
  [/\bdola\s+silk\b/i, 'Dola Silk'],
  [/\bvichitra\s+silk\b/i, 'Vichitra Silk'],
  [/\broman\s+silk\b/i, 'Roman Silk'],
  [/\bart\s+silk\b/i, 'Art Silk'],
  [/\bchinon\b|\bchinnon\b/i, 'Chinon'],
  [/\bgeorgette\b/i, 'Georgette'],
  [/\borganza\b/i, 'Organza'],
  [/\bchiffon\b/i, 'Chiffon'],
  [/\bvelvet\b/i, 'Velvet'],
  [/\bnet\b/i, 'Net'],
  [/\bcrepe\b/i, 'Crepe'],
  [/\bsatin\b/i, 'Satin'],
  [/\bjacquard\b/i, 'Jacquard'],
  [/\bbrocade\b/i, 'Brocade'],
  [/\bsilk\b/i, 'Silk'],
  [/\bcotton\b/i, 'Cotton'],
  [/\brass|gold[- ]plated|alloy\b/i, 'Gold-Tone'],
];

const WORK_MATCHERS: Array<[RegExp, string]> = [
  [/\bmirror\s*work\b|\bmirror\b/i, 'Mirror Work'],
  [/\bzari\s*work\b|\bzari\b/i, 'Zari Work'],
  [/\bsequins?\b/i, 'Sequin Work'],
  [/\bresham\b/i, 'Resham Embroidered'],
  [/\bgota\s*patti\b/i, 'Gota Patti'],
  [/\bkundan\b/i, 'Kundan'],
  [/\bpearl\b/i, 'Pearl'],
  [/\bstone\s*work\b/i, 'Stone Work'],
  [/\bbeads?\b/i, 'Beadwork'],
  [/\bthread\s*work\b/i, 'Thread Work'],
  [/\bdigital\s+print\b/i, 'Digital Print'],
  [/\bembroidery\b|\bembroidered\b/i, 'Embroidered'],
  [/\bwoven\b/i, 'Woven'],
  [/\bprinted\b/i, 'Printed'],
];

const COLOR_MATCHERS: Array<[RegExp, string]> = [
  [/\bemerald\s+green\b/i, 'Emerald Green'],
  [/\bmehndi\s+green\b|\bmehendi\s+green\b/i, 'Mehendi Green'],
  [/\bbottle\s+green\b/i, 'Bottle Green'],
  [/\bsage\s+green\b/i, 'Sage Green'],
  [/\bmint\s+green\b/i, 'Mint Green'],
  [/\blight\s+pink\b/i, 'Light Pink'],
  [/\bblush\s+pink\b/i, 'Blush Pink'],
  [/\brani\s+pink\b|\bhot\s+pink\b/i, 'Rani Pink'],
  [/\b dusty\s+pink\b|\brose\s+pink\b/i, 'Rose Pink'],
  [/\bcrimson\s+red\b/i, 'Crimson Red'],
  [/\bmaroon\b/i, 'Maroon'],
  [/\bwine\b|\bburgundy\b/i, 'Wine'],
  [/\broyal\s+blue\b/i, 'Royal Blue'],
  [/\bnavy\s+blue\b|\bnavy\b/i, 'Navy Blue'],
  [/\bteal\b/i, 'Teal'],
  [/\bmustard\s+yellow\b|\bmustard\b/i, 'Mustard Yellow'],
  [/\bhaldi\s+yellow\b|\byellow\b/i, 'Yellow'],
  [/\boff[- ]white\b|\bivory\b|\bcream\b/i, 'Ivory'],
  [/\blavender\b|\blilac\b/i, 'Lavender'],
  [/\bpurple\b|\bplum\b/i, 'Purple'],
  [/\bpeach\b|\bcoral\b/i, 'Peach'],
  [/\bgold\b|\bgolden\b/i, 'Gold'],
  [/\bsilver\b/i, 'Silver'],
  [/\bblack\b/i, 'Black'],
  [/\bwhite\b/i, 'White'],
  [/\bred\b/i, 'Red'],
  [/\bpink\b/i, 'Pink'],
  [/\bgreen\b/i, 'Green'],
  [/\bblue\b/i, 'Blue'],
  [/\borange\b|\brust\b/i, 'Rust Orange'],
];

function inferFabric(product: ShopifyFeedProductNode): string {
  const tags = product.tags || [];
  const tagFabric = getTagValue(tags, ['fabric:', 'material:']);
  if (tagFabric) return tagFabric.split(';')[0].trim();

  const haystack = `${product.title || ''} ${tags.join(' ')} ${product.description || ''}`;
  for (const [pattern, label] of FABRIC_MATCHERS) {
    if (pattern.test(haystack)) return label;
  }
  return 'Silk Blend';
}

function inferWork(product: ShopifyFeedProductNode): string {
  const tags = product.tags || [];
  const tagWork = getTagValue(tags, ['work:', 'embroidery:', 'embellishment:']);
  if (tagWork) return tagWork.split(';')[0].trim();

  const haystack = `${product.title || ''} ${tags.join(' ')} ${product.description || ''}`;
  for (const [pattern, label] of WORK_MATCHERS) {
    if (pattern.test(haystack)) return label;
  }
  return 'Festive Detail';
}

function inferColor(
  product: ShopifyFeedProductNode,
  variant: ShopifyFeedVariantNode,
): string {
  const optColor = variant.selectedOptions?.find((opt) =>
    ['color', 'colour', 'shade'].includes(opt.name.trim().toLowerCase()),
  )?.value;
  if (optColor && optColor.toLowerCase() !== 'default title') {
    return sanitizeGmcText(optColor);
  }

  const tagColor = getTagValue(product.tags || [], ['color:', 'colour:']);
  if (tagColor) return tagColor.split(';')[0].trim();

  const haystack = `${product.title || ''} ${(product.tags || []).join(' ')}`;
  for (const [pattern, label] of COLOR_MATCHERS) {
    if (pattern.test(haystack)) return label;
  }
  return 'Multicolor';
}

function inferSize(
  product: ShopifyFeedProductNode,
  variant: ShopifyFeedVariantNode,
): string {
  const optSize = variant.selectedOptions?.find((opt) =>
    /size/i.test(opt.name.trim()),
  )?.value;
  if (optSize && optSize.toLowerCase() !== 'default title') {
    return sanitizeGmcText(optSize);
  }
  if (variant.title && variant.title.toLowerCase() !== 'default title') {
    const clean = sanitizeGmcText(variant.title.split('/')[0].trim());
    if (clean && clean.length <= 24) return clean;
  }
  const haystack = `${product.productType || ''} ${product.title || ''}`.toLowerCase();
  if (haystack.includes('saree') || haystack.includes('jewelry') || haystack.includes('jewellery')) {
    return 'Free Size';
  }
  return 'One Size';
}

export interface GmcTitleParts {
  gender: string;
  occasionCategory: string;
  fabric?: string;
  work?: string;
  color?: string;
  size?: string;
}

/**
 * Builds GMC-optimized title strictly following:
 * `LuxeMia [Gender] [Occasion/Category] [Fabric] [Work/Detail] [Color] [Size]`
 */
export function buildGmcOptimizedTitle(parts: GmcTitleParts): string {
  const rawSegments = [
    'LuxeMia',
    parts.gender,
    parts.occasionCategory,
    parts.fabric || '',
    parts.work || '',
    parts.color || '',
    parts.size || '',
  ]
    .map((segment) => sanitizeGmcText(segment))
    .filter(Boolean);

  // Deduplicate exact consecutive or overlapping case-insensitive phrases while preserving formula order.
  const seenPhrases = new Set<string>();
  const dedupedSegments: string[] = [];
  for (const segment of rawSegments) {
    const key = segment.toLowerCase();
    if (seenPhrases.has(key)) continue;
    seenPhrases.add(key);
    dedupedSegments.push(segment);
  }

  const joined = dedupedSegments.join(' ').replace(/\s+/g, ' ').trim();
  return joined.length <= 150 ? joined : `${joined.slice(0, 147).trimEnd()}...`;
}

function extractNumericId(gid: string): string {
  const tail = gid.split('/').pop() || gid;
  return tail.trim();
}

export function buildGmcFeedRows(products: ShopifyFeedProductNode[]): GmcFeedRow[] {
  const rows: GmcFeedRow[] = [];

  for (const product of products) {
    if (!product || !product.handle) continue;
    if (HIDDEN_BILLING_HANDLES.has(product.handle)) continue;
    if (product.availableForSale === false) continue;

    const allVariants = (product.variants?.edges || []).map((edge) => edge.node);
    const activeVariants = allVariants.filter((variant) => variant.availableForSale !== false);
    if (activeVariants.length === 0) continue;

    const productImages = (product.images?.edges || [])
      .map((edge) => forceGmcSafeImageUrl(edge.node.url))
      .filter(Boolean);
    if (productImages.length === 0) continue;

    const { titleGender, gmcGender, ageGroup } = inferGenderLabel(product);
    const { occasionCategory, googleProductCategory, productTypeLabel } =
      inferOccasionAndCategory(product);
    const fabric = inferFabric(product);
    const work = inferWork(product);
    const itemGroupId =
      product.handle.length <= 50 ? product.handle : `p${extractNumericId(product.id)}`;
    const isMultiVariant = allVariants.length > 1;
    const isMadeToOrder = (product.tags || []).some((t) =>
      /^(?:made to order|availability:made to order|custom-made)$/i.test(t.trim()),
    );

    const baseDescription = sanitizeGmcText(product.description);
    const enrichedDescription = (
      baseDescription
        ? `${baseDescription} Verified with LuxeMia's 3-Point Quality Assurance Check prior to dispatch. Ready-to-Ship items deliver in 5-7 business days to US/UK/CA via DHL/FedEx; Custom Tailored selections deliver in 15-18 business days total.`
        : `LuxeMia ${titleGender} ${occasionCategory} in ${fabric} with ${work}. Verified with LuxeMia's 3-Point Quality Assurance Check prior to dispatch. Ready-to-Ship items deliver in 5-7 business days to US/UK/CA via DHL/FedEx; Custom Tailored selections deliver in 15-18 business days total.`
    ).slice(0, 4900);

    for (const variant of activeVariants) {
      const numericVariantId = extractNumericId(variant.id);
      const id = variant.sku?.trim() || `LUXEMIA-${numericVariantId}`;
      const color = inferColor(product, variant);
      const size = inferSize(product, variant);
      const title = buildGmcOptimizedTitle({
        gender: titleGender,
        occasionCategory,
        fabric,
        work,
        color,
        size,
      });

      const canonicalBase = `${SITE_URL}/product/${encodeURIComponent(product.handle)}`;
      const link = isMultiVariant && numericVariantId
        ? `${canonicalBase}?variant=${encodeURIComponent(numericVariantId)}`
        : canonicalBase;

      const primaryImage = variant.image?.url
        ? forceGmcSafeImageUrl(variant.image.url)
        : productImages[0];
      const additionalImages = productImages.filter((img) => img !== primaryImage).slice(0, 4);

      const amount = Number.parseFloat(variant.price?.amount || '0');
      if (!Number.isFinite(amount) || amount <= 0) continue;
      const currency = (variant.price?.currencyCode || 'USD').toUpperCase();
      const compareAt = variant.compareAtPrice?.amount
        ? Number.parseFloat(variant.compareAtPrice.amount)
        : NaN;
      const hasDiscount = Number.isFinite(compareAt) && compareAt > amount;
      const priceStr = `${(hasDiscount ? compareAt : amount).toFixed(2)} ${currency}`;
      const salePriceStr = hasDiscount ? `${amount.toFixed(2)} ${currency}` : undefined;

      const shippingRate = amount >= 150 ? '0.00' : '14.99';
      const shippingStr = `US::Standard:${shippingRate} USD`;
      const customLabel0 = isMadeToOrder ? 'Custom-Tailored' : 'Ready-to-Ship';
      const customLabel1 = amount >= 250 ? 'High-Margin-Bridal' : 'Festive-Core';
      const gtin = variant.barcode?.trim() || undefined;
      const mpn = !gtin && variant.sku?.trim() ? variant.sku.trim() : undefined;

      rows.push({
        id,
        itemGroupId,
        title,
        description: enrichedDescription,
        link,
        imageLink: primaryImage,
        additionalImageLinks: additionalImages,
        availability: 'in_stock',
        price: priceStr,
        salePrice: salePriceStr,
        googleProductCategory,
        productType: productTypeLabel,
        brand: 'LuxeMia',
        condition: 'new',
        gender: gmcGender,
        ageGroup,
        color,
        material: fabric,
        size,
        identifierExists: gtin ? 'yes' : 'no',
        gtin,
        mpn,
        customLabel0,
        customLabel1,
        shipping: shippingStr,
      });
    }
  }

  return rows;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function serializeGmcXml(rows: GmcFeedRow[]): string {
  const itemsXml = rows
    .map((row) => {
      const [shippingCountry, , shippingService, shippingPrice] = row.shipping.split(':');
      const additionalImgs = row.additionalImageLinks
        .map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join('\n');

      return [
        '    <item>',
        `      <g:id>${escapeXml(row.id)}</g:id>`,
        `      <g:item_group_id>${escapeXml(row.itemGroupId)}</g:item_group_id>`,
        `      <g:title>${escapeXml(row.title)}</g:title>`,
        `      <g:description>${escapeXml(row.description)}</g:description>`,
        `      <g:link>${escapeXml(row.link)}</g:link>`,
        `      <g:image_link>${escapeXml(row.imageLink)}</g:image_link>`,
        additionalImgs,
        `      <g:availability>${row.availability}</g:availability>`,
        `      <g:price>${escapeXml(row.price)}</g:price>`,
        row.salePrice ? `      <g:sale_price>${escapeXml(row.salePrice)}</g:sale_price>` : '',
        `      <g:google_product_category>${escapeXml(row.googleProductCategory)}</g:google_product_category>`,
        `      <g:product_type>${escapeXml(row.productType)}</g:product_type>`,
        `      <g:brand>${escapeXml(row.brand)}</g:brand>`,
        `      <g:condition>${row.condition}</g:condition>`,
        `      <g:gender>${row.gender}</g:gender>`,
        `      <g:age_group>${row.ageGroup}</g:age_group>`,
        `      <g:color>${escapeXml(row.color)}</g:color>`,
        `      <g:material>${escapeXml(row.material)}</g:material>`,
        `      <g:size>${escapeXml(row.size)}</g:size>`,
        `      <g:identifier_exists>${row.identifierExists}</g:identifier_exists>`,
        row.gtin ? `      <g:gtin>${escapeXml(row.gtin)}</g:gtin>` : '',
        row.mpn ? `      <g:mpn>${escapeXml(row.mpn)}</g:mpn>` : '',
        `      <g:custom_label_0>${escapeXml(row.customLabel0)}</g:custom_label_0>`,
        `      <g:custom_label_1>${escapeXml(row.customLabel1)}</g:custom_label_1>`,
        '      <g:shipping>',
        `        <g:country>${escapeXml(shippingCountry || 'US')}</g:country>`,
        `        <g:service>${escapeXml(shippingService || 'Standard')}</g:service>`,
        `        <g:price>${escapeXml(shippingPrice || '14.99 USD')}</g:price>`,
        '      </g:shipping>',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>LuxeMia — Google Merchant Center Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Active Indian wedding sarees, lehengas, salwar suits, menswear, and jewelry from LuxeMia.</description>
${itemsXml}
  </channel>
</rss>
`;
}

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const GMC_CSV_COLUMNS = [
  'id',
  'title',
  'description',
  'link',
  'image_link',
  'availability',
  'price',
  'google_product_category',
  'brand',
  'condition',
  'gender',
  'age_group',
  'color',
  'material',
  'size',
  'identifier_exists',
  'custom_label_0',
  'custom_label_1',
  'shipping',
] as const;

export function serializeGmcCsv(rows: GmcFeedRow[]): string {
  const header = GMC_CSV_COLUMNS.join(',');
  const lines = rows.map((row) =>
    [
      row.id,
      row.title,
      row.description,
      row.link,
      row.imageLink,
      row.availability,
      row.salePrice || row.price,
      row.googleProductCategory,
      row.brand,
      row.condition,
      row.gender,
      row.ageGroup,
      row.color,
      row.material,
      row.size,
      row.identifierExists,
      row.customLabel0,
      row.customLabel1,
      row.shipping,
    ]
      .map((cell) => escapeCsvCell(String(cell ?? '')))
      .join(','),
  );
  return [header, ...lines].join('\n') + '\n';
}

export async function fetchAllActiveShopifyProducts(
  fetchImpl: typeof fetch = fetch,
): Promise<ShopifyFeedProductNode[]> {
  const token =
    process.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    DEFAULT_STOREFRONT_TOKEN;

  const products: ShopifyFeedProductNode[] = [];
  let after: string | null = null;
  let pages = 0;

  while (pages < 20) {
    pages += 1;
    const response = await fetchImpl(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: STOREFRONT_CATALOG_QUERY,
        variables: { first: 100, after },
      }),
    });

    if (!response.ok) {
      throw new Error(`Shopify Storefront API returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: {
        products?: {
          pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
          edges?: Array<{ node: ShopifyFeedProductNode }>;
        };
      };
      errors?: Array<{ message?: string }>;
    };

    if (payload.errors?.length) {
      throw new Error(payload.errors.map((e) => e.message).join('; '));
    }

    const connection = payload.data?.products;
    for (const edge of connection?.edges || []) {
      if (edge?.node) products.push(edge.node);
    }

    if (!connection?.pageInfo?.hasNextPage || !connection.pageInfo.endCursor) {
      break;
    }
    after = connection.pageInfo.endCursor;
  }

  return products;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawFormat = Array.isArray(req.query?.format)
      ? req.query.format[0]
      : req.query?.format;
    const format = String(rawFormat || 'xml').trim().toLowerCase();

    const products = await fetchAllActiveShopifyProducts();
    const rows = buildGmcFeedRows(products);

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600');
    res.setHeader('X-Robots-Tag', 'noindex, follow');

    if (format === 'csv') {
      const csv = serializeGmcCsv(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="luxemia-gmc-feed.csv"');
      if (req.method === 'HEAD') return res.status(200).end();
      return res.status(200).send(csv);
    }

    const xml = serializeGmcXml(rows);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(xml);
  } catch (error) {
    console.error('[api/gmc-feed] Failed to generate feed:', error);
    return res.status(502).json({
      error: 'Failed to generate GMC feed from Shopify Storefront API',
    });
  }
}
