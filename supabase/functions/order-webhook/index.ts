// Notification delivery is intentionally disabled. Source presence alone cannot
// prove that this function is deployed, registered as a Shopify webhook, or
// configured for an email provider. Reintroducing side effects requires
// topic-specific payload handling plus persistent X-Shopify-Webhook-Id dedupe.

const SHOPIFY_WEBHOOK_SECRET = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
const MAX_BODY_BYTES = 1024 * 1024;

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-webhook-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};

const SUPPORTED_TOPICS = new Set([
  'orders/create',
  'orders/paid',
  'orders/fulfilled',
  'orders/cancelled',
  'orders/updated',
  'fulfillments/create',
  'fulfillments/update',
]);

const jsonResponse = (payload: unknown, status: number): Response => new Response(
  JSON.stringify(payload),
  { status, headers: { ...responseHeaders, 'Content-Type': 'application/json' } },
);

async function readBoundedBody(req: Request): Promise<{ bytes?: Uint8Array; tooLarge: boolean }> {
  const declaredLength = req.headers.get('content-length');
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_BYTES) {
    return { tooLarge: true };
  }
  if (!req.body) return { bytes: new Uint8Array(), tooLarge: false };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return { tooLarge: true };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { bytes, tooLarge: false };
}

function decodeBase64(value: string): Uint8Array | null {
  try {
    const decoded = atob(value);
    return Uint8Array.from(decoded, character => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function verifyShopifyHmac(body: Uint8Array, header: string | null): Promise<boolean> {
  if (!header || !SHOPIFY_WEBHOOK_SECRET) return false;

  try {
    const provided = decodeBase64(header.trim());
    if (!provided) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(SHOPIFY_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const computed = new Uint8Array(await crypto.subtle.sign('HMAC', key, body));
    if (provided.byteLength !== computed.byteLength) return false;

    let difference = 0;
    for (let index = 0; index < computed.byteLength; index += 1) {
      difference |= provided[index] ^ computed[index];
    }
    return difference === 0;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: responseHeaders });
  }
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const bodyResult = await readBoundedBody(req);
  if (bodyResult.tooLarge) return jsonResponse({ error: 'Request body is too large' }, 413);

  const signatureIsValid = await verifyShopifyHmac(
    bodyResult.bytes || new Uint8Array(),
    req.headers.get('x-shopify-hmac-sha256'),
  );
  if (!signatureIsValid) return jsonResponse({ error: 'Invalid signature' }, 401);

  const topic = req.headers.get('x-shopify-topic') || '';
  if (!SUPPORTED_TOPICS.has(topic)) return jsonResponse({ error: 'Unsupported webhook topic' }, 400);

  // Acknowledge without parsing or logging the customer payload. Because this
  // handler has no external side effects, duplicate Shopify retries are safe.
  console.log('Signed Shopify webhook acknowledged; notifications are disabled');
  return jsonResponse({ success: true, notification: 'disabled' }, 200);
});
