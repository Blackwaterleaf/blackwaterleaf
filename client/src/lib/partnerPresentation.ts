import type { AppLocale } from "@/i18n";

export type PublicPartnerProduct = {
  id: number;
  title: string;
  destinationUrl: string;
  priceLabel: string | null;
  imageUrl: string | null;
};

export type PublicPartnerCard = {
  displayName: string;
  partyType: "person" | "company";
  destinationUrl: string | null;
  disclosureLabel: string;
  products: PublicPartnerProduct[];
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

export function publicPartnerCardPresentation(partner: PublicPartnerCard, locale: AppLocale) {
  return {
    displayName: partner.displayName,
    disclosureLabel: partner.disclosureLabel,
    destinationUrl: partner.destinationUrl,
    partyLabel: partner.partyType === "company"
      ? (locale === "de" ? "Unternehmenspartner" : "Business partner")
      : (locale === "de" ? "Persönliche Empfehlung" : "Personal recommendation"),
    products: partnerProductPresentation(partner.products, locale),
  };
}
