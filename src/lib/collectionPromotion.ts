import emptyCatalogRoutes from '@/config/emptyCatalogRoutes.json';

/**
 * Keep intentionally empty collections out of shopping navigation.
 * Their routes, selection rules and noindex status remain unchanged.
 * Removing a restocked route from the shared empty-route list restores its links.
 */
export function canPromoteCollection(path?: string): boolean {
  return !path || !emptyCatalogRoutes.includes(path);
}
