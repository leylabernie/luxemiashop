/**
 * Shared middleware HTML helpers.
 *
 * Product HTML is deliberately generated only by the deployment prerender.
 * A live Shopify product absent from that manifest receives a temporary,
 * noindex deployment-pending response in middleware.ts instead of a second,
 * non-purchasable product renderer.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let cached404Html: string | null = null;

export async function return404(request: Request): Promise<Response> {
  if (!cached404Html) {
    try {
      const response = await fetch(new URL('/_prerender/404.html', request.url).toString());
      cached404Html = await response.text();
    } catch {
      cached404Html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<title>Page Not Found | LuxeMia</title>'
        + '<meta name="robots" content="noindex,nofollow"></head><body>'
        + '<h1>Page Not Found</h1><p>The page you are looking for could not be found.</p>'
        + '</body></html>';
    }
  }

  return new Response(cached404Html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
