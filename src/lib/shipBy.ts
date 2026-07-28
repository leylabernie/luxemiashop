import { addBusinessDays, format } from 'date-fns';
import type { ShopifyProduct } from '@/lib/shopify';

type ShopifyProductNode = ShopifyProduct['node'];

export function getProductShipsWithin(product?: ShopifyProductNode | null): number | null {
  if (!product) return null;
  const raw = product.shipsWithinMetafield?.value ?? product.shipsWithin ?? null;
  if (raw === null || raw === undefined || raw === '') return null;

  const days = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(days) || days < 1) return null;
  return days;
}

export function getShipByLabel(product?: ShopifyProductNode | null): string | null {
  const shipsWithin = getProductShipsWithin(product);
  if (!shipsWithin) return null;

  // TODO(owner): holiday calendar
  const shipByDate = addBusinessDays(new Date(), shipsWithin);
  return `Ships by ${format(shipByDate, 'EEEE d MMMM')}`;
}
