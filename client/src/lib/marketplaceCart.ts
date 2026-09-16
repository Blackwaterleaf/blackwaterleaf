import type { MarketplaceCartLine, MarketplaceProduct } from "./marketplacePresentation";

const STORAGE_KEY = "blackwaterleaf.marketplace.cart.v1";
const MAX_QUANTITY = 20;

function isStoredLine(value: unknown): value is MarketplaceCartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<MarketplaceCartLine>;
  return typeof line.id === "number"
    && Number.isInteger(line.id)
    && typeof line.partnerId === "number"
    && typeof line.partnerName === "string"
    && typeof line.title === "string"
    && typeof line.destinationUrl === "string"
    && typeof line.quantity === "number"
    && Number.isInteger(line.quantity)
    && line.quantity > 0
    && line.quantity <= MAX_QUANTITY;
}

export function readMarketplaceCart(): MarketplaceCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isStoredLine) : [];
  } catch {
    return [];
  }
}

export function writeMarketplaceCart(lines: MarketplaceCartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines.filter(isStoredLine)));
}

export function addMarketplaceProduct(lines: MarketplaceCartLine[], product: MarketplaceProduct): MarketplaceCartLine[] {
  const existing = lines.find(line => line.id === product.id);
  if (existing) return lines.map(line => line.id === product.id ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + 1) } : line);
  return [...lines, { ...product, quantity: 1 }];
}

export function setMarketplaceQuantity(lines: MarketplaceCartLine[], productId: number, quantity: number): MarketplaceCartLine[] {
  if (!Number.isInteger(quantity) || quantity <= 0) return lines.filter(line => line.id !== productId);
  return lines.map(line => line.id === productId ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) } : line);
}

export function removeMarketplaceProduct(lines: MarketplaceCartLine[], productId: number) {
  return lines.filter(line => line.id !== productId);
}
