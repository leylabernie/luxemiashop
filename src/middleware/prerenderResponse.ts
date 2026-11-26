// A route manifest describes build output, not proof that the asset can still
// be served by the deployment. Probe the actual same-origin asset before using
// it so a missing file cannot become a crawler-only 404 (or a 200 SPA shell).
export async function readPrerender(request: Request, path: string, canonicalPath: string): Promise<Response | null> {
  const headers = new Headers();
  for (const name of ['cookie', 'x-vercel-protection-bypass']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(new URL(path, request.url), { headers, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const html = await response.text();
    const canonical = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
    if (canonical.length !== 1 || canonical[0] !== `https://luxemia.shop${canonicalPath}`
      || !html.includes('data-prerender-schema') || !/<main\b/i.test(html)) return null;
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'index, follow',
      },
    });
  } catch {
    return null;
  }
}
