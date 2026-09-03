const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store',
};

// In-memory cache for images (limited to avoid memory issues)
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const MAX_CACHE_SIZE = 20;
const MAX_CACHE_BYTES = 25 * 1024 * 1024;
const CACHE_TTL = 3600000; // 1 hour in ms
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const MAX_URL_LENGTH = 4096;

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms
const MAX_RATE_LIMIT_ENTRIES = 5000;

function getClientIdentifier(req: Request): string {
  const candidate = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')?.trim()
    || 'unknown';
  return candidate.slice(0, 128);
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      for (const [key, value] of rateLimitMap) {
        if (now > value.resetTime) rateLimitMap.delete(key);
      }
      if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
        const oldestKey = rateLimitMap.keys().next().value;
        if (oldestKey) rateLimitMap.delete(oldestKey);
      }
    }
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

// Clean up expired cache entries
function cleanupCache(incomingBytes = 0) {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      imageCache.delete(key);
    }
  }
  
  // Bound both item count and total bytes before accepting another image.
  const entries = [...imageCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  let totalBytes = entries.reduce((sum, [, value]) => sum + value.data.byteLength, 0);
  for (const [key, value] of entries) {
    if (imageCache.size < MAX_CACHE_SIZE && totalBytes + incomingBytes <= MAX_CACHE_BYTES) break;
    imageCache.delete(key);
    totalBytes -= value.data.byteLength;
  }
}

// Generate cache key from URL
function getCacheKey(url: URL): string {
  const canonical = new URL(url);
  canonical.hash = '';
  return canonical.toString();
}

// Allowed domains for image proxying
const ALLOWED_DOMAINS = [
  'kesimg.b-cdn.net',
  'cdn.shopify.com',
  'images.unsplash.com',
  'fashidwholesale.in',
];

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);

function parseAllowedImageUrl(value: string, base?: URL): URL | null {
  try {
    const parsedUrl = base ? new URL(value, base) : new URL(value);
    const isAllowedHost = ALLOWED_DOMAINS.some(domain =>
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
    if (
      parsedUrl.protocol !== 'https:'
      || parsedUrl.username
      || parsedUrl.password
      || (parsedUrl.port && parsedUrl.port !== '443')
      || !isAllowedHost
    ) return null;
    return parsedUrl;
  } catch {
    return null;
  }
}

async function fetchAllowedImage(startUrl: URL): Promise<Response> {
  let currentUrl = startUrl;
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'LuxeMia-Image-Proxy/1.0',
        'Accept': 'image/jpeg,image/png,image/gif,image/webp,image/avif',
      },
    });
    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get('location');
    const redirectUrl = location ? parseAllowedImageUrl(location, currentUrl) : null;
    if (!redirectUrl || redirectCount === MAX_REDIRECTS) {
      response.body?.cancel();
      throw new Error('Image redirect was not allowed');
    }
    response.body?.cancel();
    currentUrl = redirectUrl;
  }
  throw new Error('Too many image redirects');
}

async function readBoundedImage(response: Response): Promise<ArrayBuffer | null> {
  if (!response.body) return new ArrayBuffer(0);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_IMAGE_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return combined.buffer;
}

// Fix malformed URLs
function fixImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    let pathname = parsed.pathname;

    // Fix malformed URLs like (1(2).jpg -> (2).jpg.
    pathname = pathname.replace(/\(1\((\d+)\)\.jpg$/i, '($1).jpg');

    // Fix URLs ending with (N without .jpg, while preserving query parameters.
    if (!/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(pathname)) {
      pathname = /\(\d+$/.test(pathname) ? `${pathname}).jpg` : `${pathname}.jpg`;
    }

    parsed.pathname = pathname;
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  try {
    // Basic rate limiting by IP
    const clientIp = getClientIdentifier(req);
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      console.error('No URL provided');
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (imageUrl.length > MAX_URL_LENGTH) {
      return new Response(JSON.stringify({ error: 'Image URL is too long' }), {
        status: 414,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    // Fix malformed URLs
    const fixedUrl = fixImageUrl(imageUrl);

    const targetUrl = parseAllowedImageUrl(fixedUrl);
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Image URL is not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(targetUrl);
    const cached = imageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Image proxy cache hit');
      return new Response(cached.data, {
        headers: {
          ...corsHeaders,
          'Content-Type': cached.contentType,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'X-Cache': 'HIT',
        },
      });
    }

    console.log('Image proxy cache miss');

    // Fetch the image with browser-like headers to bypass hotlink protection
    const response = await fetchAllowedImage(targetUrl);

    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      response.body?.cancel();
      return new Response(JSON.stringify({ error: 'Unsupported image response' }), {
        status: 415,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }
    const declaredSize = Number(response.headers.get('content-length') || 0);
    if (Number.isFinite(declaredSize) && declaredSize > MAX_IMAGE_BYTES) {
      response.body?.cancel();
      return new Response(JSON.stringify({ error: 'Image is too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }
    const imageBuffer = await readBoundedImage(response);
    if (!imageBuffer) {
      return new Response(JSON.stringify({ error: 'Image is too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    console.log('Successfully fetched image, size:', imageBuffer.byteLength);

    // Store in cache (only if reasonably sized)
    if (imageBuffer.byteLength < MAX_IMAGE_BYTES) {
      cleanupCache(imageBuffer.byteLength);
      imageCache.set(cacheKey, {
        data: imageBuffer,
        contentType,
        timestamp: Date.now(),
      });
      console.log('Cached image, cache size:', imageCache.size);
    }

    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'X-Cache': 'MISS',
      },
    });
  } catch {
    console.error('Image proxy request failed');
    return new Response(JSON.stringify({ error: 'Unable to proxy image' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
