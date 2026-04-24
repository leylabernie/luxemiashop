const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for images (limited to avoid memory issues)
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 3600000; // 1 hour in ms

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
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
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      imageCache.delete(key);
    }
  }
  
  // If still over limit, remove oldest entries
  if (imageCache.size > MAX_CACHE_SIZE) {
    const entries = [...imageCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => imageCache.delete(key));
  }
}

// Generate cache key from URL
function getCacheKey(url: string): string {
  return url.toLowerCase().trim();
}

// Allowed domains for image proxying
const ALLOWED_DOMAINS = [
  'kesimg.b-cdn.net',
  'cdn.shopify.com',
  'images.unsplash.com',
  'fashidwholesale.in',
];

// Fix malformed URLs
function fixImageUrl(url: string): string {
  let fixedUrl = url;
  
  // Fix URLs ending with (N without .jpg
  if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(fixedUrl)) {
    if (/\(\d+$/.test(fixedUrl)) {
      fixedUrl = fixedUrl + ').jpg';
    } else {
      fixedUrl = fixedUrl + '.jpg';
    }
  }
  
  // Fix malformed URLs like (1(2).jpg -> (2).jpg
  const malformedPattern = /\(1\((\d+)\)\.jpg$/i;
  if (malformedPattern.test(fixedUrl)) {
    fixedUrl = fixedUrl.replace(malformedPattern, '($1).jpg');
  }
  
  return fixedUrl;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Basic rate limiting by IP
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
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

    // Fix malformed URLs
    const fixedUrl = fixImageUrl(imageUrl);

    // Validate the URL is from allowed domains
    try {
      const parsedUrl = new URL(fixedUrl);
      const isAllowed = ALLOWED_DOMAINS.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
      );
      if (!isAllowed) {
        return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first
    const cacheKey = getCacheKey(fixedUrl);
    const cached = imageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Cache hit for:', fixedUrl);
      return new Response(cached.data, {
        headers: {
          ...corsHeaders,
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'X-Cache': 'HIT',
        },
      });
    }

    console.log('Cache miss, fetching:', fixedUrl);

    // Fetch the image with browser-like headers to bypass hotlink protection
    const response = await fetch(fixedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': new URL(fixedUrl).origin + '/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    console.log('Successfully fetched image, size:', imageBuffer.byteLength);

    // Store in cache (only if reasonably sized)
    if (imageBuffer.byteLength < 5 * 1024 * 1024) { // Max 5MB per image
      cleanupCache();
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
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
