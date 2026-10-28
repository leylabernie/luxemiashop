import { redactMeasurementAttributes } from './measurementRequest';
import type { CartItem } from '@/stores/cartStore';
import { parseMetaCheckout, type MetaRequest } from './metaCheckout';

export type ConfiguredMetaLine = Pick<CartItem, 'variantId' | 'variantTitle' | 'quantity' | 'price' | 'customAttributes'> & { handle: string };
export type MetaSavedSelection = { contentId: string; handle: string; variantId: string; timingConfirmed?: boolean; configured?: ConfiguredMetaLine[] };
export type MetaContext = { version: 1; expires: number; request: MetaRequest; selections: MetaSavedSelection[] };
const PREFIX = 'luxemia-meta-intent:';
const TOKEN = /^[a-f0-9-]{36}$/;
export function readMetaContext(token: string | null): MetaContext | null {
  if (!token || !TOKEN.test(token)) return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + token);
    if (!raw || raw.length > 200000) return null;
    const context = JSON.parse(raw) as MetaContext;
    if (context.version !== 1 || !Number.isFinite(context.expires) || !Array.isArray(context.request?.lines) || !Array.isArray(context.selections)) return null;
    if (context.expires < Date.now()) { sessionStorage.removeItem(PREFIX + token); return null; }
    if (context.selections.length !== context.request.lines.length || context.selections.some(item => !item || typeof item.contentId !== 'string' || typeof item.handle !== 'string' || typeof item.variantId !== 'string' || (item.configured !== undefined && (!Array.isArray(item.configured) || !item.configured.length || item.configured.length > 10)))) return null;
    parseMetaCheckout(new URLSearchParams({ products: context.request.lines.map(line => `${line.contentId}:${line.quantity}`).join(','), ...(context.request.coupon !== null ? { coupon: context.request.coupon } : {}) }).toString());
    return context;
  } catch { return null; }
}
export function saveMetaContext(token: string | null, request: MetaRequest, selections: MetaSavedSelection[]): string {
  const id = token && TOKEN.test(token) ? token : crypto.randomUUID();
  const existing = token ? readMetaContext(token) : null;
  if (token && !existing) throw new Error('Your shopping session expired. Reopen your Meta shopping link.');
  sessionStorage.setItem(PREFIX + id, JSON.stringify({ version: 1, expires: existing?.expires ?? Date.now() + 2 * 60 * 60 * 1000, request, selections: selections.map(selection => ({ ...selection, configured: selection.configured?.map(line => ({ ...line, customAttributes: redactMeasurementAttributes(line.customAttributes) })) })) }));
  return id;
}
export function metaReturnPath(token: string): string {
  if (!TOKEN.test(token)) throw new Error('Invalid shopping session.');
  return `/meta-checkout?context=${encodeURIComponent(token)}`;
}
export function saveMetaConfiguration(token: string, contentId: string, handle: string, items: CartItem[]): string {
  const context = readMetaContext(token);
  if (!context || !context.request.lines.some(line => line.contentId === contentId)) throw new Error('Your shopping session expired. Return to your Meta shopping link before continuing.');
  if (!items.length || items[0].product.node.handle !== handle || context.selections.find(item => item.contentId === contentId)?.handle !== handle) throw new Error('Product configuration did not match your shopping selection.');
  if (items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || item.quantity !== items[0].quantity)) throw new Error('Choose a quantity between 1 and 99. Your previous shopping selection is unchanged.');
  const configured = items.map(item => ({ variantId: item.variantId, variantTitle: item.variantTitle, quantity: item.quantity, price: item.price, customAttributes: item.customAttributes, handle: item.product.node.handle }));
  context.selections = context.selections.map(selection => selection.contentId === contentId ? { ...selection, variantId: items[0].variantId, configured } : selection);
  context.request.lines = context.request.lines.map(line => line.contentId === contentId ? { ...line, quantity: items[0].quantity } : line);
  saveMetaContext(token, context.request, context.selections);
  return metaReturnPath(token);
}

export function clearMetaContext(token: string): void { if (TOKEN.test(token)) sessionStorage.removeItem(PREFIX + token); }

/** Restores only validated, non-personal shopping intent after hosted-checkout Back. */
export function metaRequestPath(request: MetaRequest): string {
  const params = new URLSearchParams({ products: request.lines.map(line => `${line.contentId}:${line.quantity}`).join(','), ...(request.coupon !== null ? { coupon: request.coupon } : {}) });
  parseMetaCheckout(params.toString());
  return `/meta-checkout?${params}`;
}
export function completeMetaHandoff(token: string, request: MetaRequest, url: string): void {
  window.history.replaceState(null, '', metaRequestPath(request));
  // If navigation throws, keep personal configuration so retry remains possible.
  try { window.location.assign(url); }
  catch (error) { window.history.replaceState(null, '', metaReturnPath(token)); throw error; }
  clearMetaContext(token);
}
