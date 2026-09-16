import type { AppLocale } from "@/i18n";

export type PublicPartnerProduct = {
  id: number;
  title: string;
  destinationUrl: string;
  priceLabel: string | null;
};

export function partnerProductPresentation(products: PublicPartnerProduct[], locale: AppLocale) {
  if (products.length === 0) {
    return {
      kind: "empty" as const,
      message: locale === "de" ? "Noch keine freigegebenen Produkte." : "No approved products yet.",
    };
  }
  return { kind: "products" as const, products };
}
