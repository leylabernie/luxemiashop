// Newsletter-only routing. Do not change the shared Supabase client: account,
// wishlist, cart and other services still depend on its existing project.
export const NEWSLETTER_FUNCTION_URL =
  'https://jcyolouvxfxovzjyyrxu.supabase.co/functions/v1/submit-email';

export async function subscribeFooterNewsletter(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Email is required');

  const response = await fetch(NEWSLETTER_FUNCTION_URL, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, type: 'newsletter', source: 'footer' }),
  });
  const data: unknown = await response.json().catch(() => null);
  if (
    !response.ok || !data || typeof data !== 'object' ||
    !('success' in data) || data.success !== true ||
    ('error' in data && Boolean(data.error))
  ) {
    // An HTTP response alone cannot confirm a saved signup or email delivery.
    throw new Error('Newsletter signup could not be confirmed');
  }
}
