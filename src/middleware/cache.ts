/**
 * Cache Module
 *
 * Simple in-memory caching utilities for Edge runtime.
 */

const spaHtmlCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedSpaHtml(key: string = 'default'): string | null {
  const cached = spaHtmlCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setCachedSpaHtml(html: string, key: string = 'default'): void {
  spaHtmlCache.set(key, { data: html, timestamp: Date.now() });
}
