export interface PreviewAnalyticsConfig {
  hostname: string;
  optIn: string;
  expiresAt: string;
}

// Deployment environment only: never infer approval from a request hostname,
// branch-name substring, alias, wildcard, or client-supplied environment value.
export function getPreviewAnalyticsConfig(
  env: Readonly<Record<string, string | undefined>>,
): PreviewAnalyticsConfig | null {
  if (env.VERCEL_ENV !== 'preview' || env.VERCEL_GIT_COMMIT_REF !== 'ga4-linker-real-link') return null;

  // VERCEL_URL is a bare deployment hostname, not a URL, port, or path.
  const hostname = env.VERCEL_URL;
  const label = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
  if (!hostname || hostname.length > 253 || !new RegExp(`^${label}(?:\\.${label})+$`, 'i').test(hostname)) return null;

  return {
    hostname: hostname.toLowerCase(),
    optIn: '2026-11-13',
    expiresAt: '2026-11-14T05:00:00Z',
  };
}

export function serializePreviewAnalyticsConfig(config: PreviewAnalyticsConfig | null): string {
  return JSON.stringify(config).replace(/</g, '\\u003c');
}

export function injectPreviewAnalyticsConfig(html: string, config: PreviewAnalyticsConfig | null): string {
  return html.replace(
    '/* luxemia-preview-analytics-config */ null',
    `/* luxemia-preview-analytics-config */ ${serializePreviewAnalyticsConfig(config)}`,
  );
}
