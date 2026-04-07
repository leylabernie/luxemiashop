import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidShopifyVariantId(id: string): boolean {
  return id.startsWith('gid://shopify/ProductVariant/');
}
