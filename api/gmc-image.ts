import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Hardened Merchant Center JPEG endpoint (/gmc-images/:file.jpg).
 *
 * Google Merchant Center flags image URLs whose pathname ends in `.webp` even
 * when Shopify CDN's `?format=jpg&width=1500` serves genuine JPEG bytes.
 * This endpoint strictly maps LuxeMia's own Shopify store `.webp` filenames to
 * immutable, CDN-cached `.jpg` URLs on https://luxemia.shop with zero open-proxy
 * exposure and zero repository binary bloat.
 */

const SHOPIFY_FILES_PREFIX = 'https://cdn.shopify.com/s/files/1/0746/4707/7035/files/';
const SAFE_BASENAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,200}$/;
const SAFE_VERSION_PATTERN = /^\d{1,15}$/;

export function buildUpstreamShopifyJpegUrl(rawFile: unknown, rawVersion: unknown): string | null {
  if (typeof rawFile !== 'string') return null;
  const trimmed = rawFile.replace(/\.jpg$/i, '').trim();
  if (!SAFE_BASENAME_PATTERN.test(trimmed) || trimmed.includes('..')) {
    return null;
  }

  const upstream = new URL(`${SHOPIFY_FILES_PREFIX}${encodeURIComponent(trimmed)}.webp`);
  if (typeof rawVersion === 'string' && SAFE_VERSION_PATTERN.test(rawVersion)) {
    upstream.searchParams.set('v', rawVersion);
  }
  upstream.searchParams.set('format', 'jpg');
  upstream.searchParams.set('width', '1500');
  return upstream.toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end('Method Not Allowed');
  }

  const fileParam = Array.isArray(req.query.file) ? req.query.file[0] : req.query.file;
  const versionParam = Array.isArray(req.query.v) ? req.query.v[0] : req.query.v;
  const upstreamUrl = buildUpstreamShopifyJpegUrl(fileParam, versionParam);

  if (!upstreamUrl) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).end('Invalid image identifier');
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        // Request strictly JPEG so Shopify CDN never negotiates WebP/AVIF.
        Accept: 'image/jpeg',
      },
    });

    if (!upstreamResponse.ok) {
      const status = upstreamResponse.status === 404 ? 404 : 502;
      res.setHeader('Cache-Control', status === 404 ? 'public, max-age=300, s-maxage=300' : 'no-store');
      return res.status(status).end(status === 404 ? 'Not Found' : 'Upstream image unavailable');
    }

    const bytes = Buffer.from(await upstreamResponse.arrayBuffer());
    const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (!isJpeg) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).end('Upstream did not return JPEG bytes');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', String(bytes.length));
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }
    return res.status(200).send(bytes);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).end('Image fetch failed');
  }
}
