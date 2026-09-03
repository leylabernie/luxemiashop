type ReadyToShipCatalogNode = {
  tags?: string[] | null;
  shipsWithin?: number | string | null;
  shipsWithinDays?: number | string | null;
  shipsWithinMetafield?: { value?: string | null } | null;
};

const READY_TO_SHIP_TAG = /^(?:(?:availability|fulfillment|shipping|status)\s*[:=]\s*)?ready[\s_-]*to[\s_-]*ship$/i;

function positiveShipsWithinDays(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.trunc(value) : null;
  }

  if (typeof value !== 'string' || !value.trim()) return null;
  const match = value.match(/\d+/);
  if (!match) return null;

  const days = Number.parseInt(match[0], 10);
  return Number.isFinite(days) && days > 0 ? days : null;
}
/**
 * Ready-to-ship is a positive catalog classification, not the absence of a
 * made-to-order marker. Accept only an explicit ready-to-ship tag or a
 * positive `custom.ships_within` value returned by Shopify.
 */
export function hasExplicitReadyToShipEvidence(node: ReadyToShipCatalogNode): boolean {
  if ((node.tags || []).some((tag) => READY_TO_SHIP_TAG.test(String(tag).trim()))) {
    return true;
  }

  return positiveShipsWithinDays(
    node.shipsWithinMetafield?.value ?? node.shipsWithinDays ?? node.shipsWithin,
  ) !== null;
}
