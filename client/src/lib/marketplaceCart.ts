import type { MarketplaceCartLine, MarketplaceProduct } from "./marketplacePresentation";

const STORAGE_KEY = "blackwaterleaf.marketplace.cart.v1";
const FAVORITES_STORAGE_KEY = "blackwaterleaf.marketplace.favorites.v1";
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

function isStoredFavorite(value: unknown): value is MarketplaceProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<MarketplaceProduct>;
  return typeof product.id === "number"
    && Number.isInteger(product.id)
    && typeof product.partnerId === "number"
    && typeof product.partnerName === "string"
    && typeof product.title === "string"
    && typeof product.destinationUrl === "string";
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

export function readMarketplaceFavorites(): MarketplaceProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isStoredFavorite) : [];
  } catch {
    return [];
  }
}

export function writeMarketplaceFavorites(products: MarketplaceProduct[]) {
  if (typeof window === "undefined") return;
  const unique = products.filter((product, index, entries) => isStoredFavorite(product) && entries.findIndex(entry => entry.id === product.id) === index);
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(unique));
}

export function toggleMarketplaceFavorite(products: MarketplaceProduct[], product: MarketplaceProduct): MarketplaceProduct[] {
  return products.some(favorite => favorite.id === product.id)
    ? products.filter(favorite => favorite.id !== product.id)
    : [...products, product];
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
