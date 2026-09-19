import { addDays, format } from 'date-fns';
import type { ShopifyProduct } from '@/lib/shopify';

type ShopifyProductNode = ShopifyProduct['node'];

const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const nthWeekdayOfMonth = (year: number, month: number, weekday: number, occurrence: number): Date => {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (occurrence - 1) * 7);
};

const lastWeekdayOfMonth = (year: number, month: number, weekday: number): Date => {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month + 1, last.getDate() - offset);
};

const observedDate = (date: Date): Date => {
  const weekday = date.getDay();
  if (weekday === 6) return addDays(date, -1);
  if (weekday === 0) return addDays(date, 1);
  return date;
};

/** U.S. federal holidays observed by standard carriers and fulfillment teams. */
export function getObservedUsHolidayKeys(year: number): Set<string> {
  const fixed = [
    new Date(year, 0, 1),
    new Date(year, 5, 19),
    new Date(year, 6, 4),
    new Date(year, 10, 11),
    new Date(year, 11, 25),
  ];
  const movable = [
    nthWeekdayOfMonth(year, 0, 1, 3),
    nthWeekdayOfMonth(year, 1, 1, 3),
    lastWeekdayOfMonth(year, 4, 1),
    nthWeekdayOfMonth(year, 8, 1, 1),
    nthWeekdayOfMonth(year, 9, 1, 2),
    nthWeekdayOfMonth(year, 10, 4, 4),
  ];

  return new Set([...fixed, ...movable].map((holiday) => dateKey(observedDate(holiday))));
}

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

export function addUsBusinessDays(start: Date, amount: number): Date {
  if (amount <= 0) return start;

  const holidayKeys = new Set<string>();
  for (let year = start.getFullYear() - 1; year <= start.getFullYear() + 1; year += 1) {
    getObservedUsHolidayKeys(year).forEach((key) => holidayKeys.add(key));
  }

  let result = start;
  let remaining = amount;
  while (remaining > 0) {
    result = addDays(result, 1);
    if (!isWeekend(result) && !holidayKeys.has(dateKey(result))) remaining -= 1;
  }
  return result;
}

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

  const shipByDate = addUsBusinessDays(new Date(), shipsWithin);
  return `Ships by ${format(shipByDate, 'EEEE d MMMM')}`;
}
