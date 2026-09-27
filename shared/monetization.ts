export const PRO_MONTHLY_PRICE_EUR = 4.99;
export const PRO_YEARLY_PRICE_EUR = 39.99;

export const PRO_FEATURES = [
  { key: "unlimited_habitats", label: "Unbegrenzte private Anlagen", description: "Pflanzen, Aquarien und Terrarien ohne Kontingent verwalten." },
  { key: "care_history", label: "Vollständige Pflegehistorie", description: "Verläufe, Messwerte, Bilder und Pflegezustände langfristig vergleichen." },
  { key: "advanced_charts", label: "Erweiterte Auswertungen", description: "Messwert-Charts, Trends und exportierbare Pflegeübersichten." },
  { key: "ai_allowance", label: "Mehr KI-Bestimmungen", description: "Erhöhtes monatliches Kontingent für Bestimmung und Diagnose." },
  { key: "secure_export", label: "Export & Backup", description: "Eigene Daten strukturiert exportieren und geräteübergreifend sichern." },
  { key: "source_maps", label: "Erweiterte Herkunftskarten", description: "Quellen, Habitate und geschützte Standortkontexte vertieft auswerten." },
  { key: "ad_free", label: "Werbefreie Nutzung", description: "Das Observatory ohne Werbeunterbrechungen erleben." },
] as const;

export type ProFeatureKey = (typeof PRO_FEATURES)[number]["key"];
export type BillingPlan = "free" | "pro";
export type BillingState = { plan: BillingPlan; active: boolean; paymentReady: false };

export const FREE_FEATURES = [
  "Katalog und Basis-Suche",
  "Community und öffentliche Beobachtungen",
  "Basis-Karte mit geschützten Standorten",
  "Eine private Anlage",
  "Begrenzte KI-Bestimmungen",
] as const;
