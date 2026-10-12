export const PRO_MONTHLY_PRICE_EUR = 9.99;
export const PRO_YEARLY_PRICE_EUR = 54.99;

export const DEFAULT_FREE_DAILY_IDENTIFICATIONS = 10;
export const DEFAULT_PRO_MONTHLY_IDENTIFICATIONS = 300;
export const DEFAULT_GLOBAL_DAILY_IDENTIFICATIONS = 100;

export const AI_CREDIT_PACKS = [
  { key: "plant_10", label: "10 KI-Bestimmungen", credits: 10, priceEur: 0.99 },
  { key: "plant_50", label: "50 KI-Bestimmungen", credits: 50, priceEur: 3.99 },
  { key: "plant_120", label: "120 KI-Bestimmungen", credits: 120, priceEur: 7.99 },
] as const;

export type AiCreditPackKey = (typeof AI_CREDIT_PACKS)[number]["key"];
export type ProFeatureKey = (typeof PRO_FEATURES)[number]["key"];
export type BillingPlan = "free" | "pro";
export type BillingState = { plan: BillingPlan; active: boolean; paymentReady: boolean; aiCredits: number; freeIdentificationsRemaining: number; monthlyIdentificationsRemaining: number };

export const PRO_FEATURES = [
  { key: "unlimited_habitats", label: "Unbegrenzte private Anlagen", description: "Pflanzen, Aquarien und Terrarien ohne Kontingent verwalten." },
  { key: "care_history", label: "Vollständige Pflegehistorie", description: "Verläufe, Messwerte, Bilder und Pflegezustände langfristig vergleichen." },
  { key: "advanced_charts", label: "Erweiterte Auswertungen", description: "Messwert-Charts, Trends und exportierbare Pflegeübersichten." },
  { key: "ai_allowance", label: "300 monatliche KI-Bestimmungen", description: "Ein festes, transparentes Monatskontingent für Pflanzenbestimmungen." },
  { key: "secure_export", label: "Export & Backup", description: "Eigene Daten strukturiert exportieren und geräteübergreifend sichern." },
  { key: "source_maps", label: "Erweiterte Herkunftskarten", description: "Quellen, Habitate und geschützte Standortkontexte vertieft auswerten." },
  { key: "ad_free", label: "Werbefreie Nutzung", description: "Das Observatory ohne Werbeunterbrechungen erleben." },
] as const;

export const FREE_FEATURES = [
  "Katalog und Basis-Suche",
  "Community und öffentliche Beobachtungen",
  "Basis-Karte mit geschützten Standorten",
  "Eine private Anlage",
  "10 kostenlose Pflanzenbestimmungen pro UTC-Tag",
  "Zusätzliche KI-Bestimmungen als Credit-Paket kaufbar",
] as const;
