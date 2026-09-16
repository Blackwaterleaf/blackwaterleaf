import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export type AppLocale = "de" | "en";
export type UnitSystem = "metric" | "imperial";

const de = {
  "tabs.home": "Home",
  "tabs.explore": "Entdecken",
  "tabs.community": "Community",
  "tabs.assistant": "KI",
  "tabs.profile": "Profil",
  "common.offline": "OFFLINE",
  "common.notConnected": "NICHT VERBUNDEN",
  "common.loading": "VERBINDUNG WIRD GEPRÜFT",
  "common.error": "VERBINDUNGSFEHLER",
  "common.empty": "KEINE ECHTEN DATEN VORHANDEN",
  "common.open": "ÖFFNEN",
  "common.signIn": "SICHER ANMELDEN",
  "common.retry": "ERNEUT PRÜFEN",
  "common.language": "SPRACHE",
  "common.units": "EINHEITEN",
  "common.metric": "Metrisch",
  "common.imperial": "Imperial",
  "home.sensors.title": "MESSWERTE",
  "home.sensors.water": "WASSER",
  "home.sensors.air": "LUFT",
  "home.sensors.ph": "pH-WERT",
  "home.sensors.deviceTime": "GERÄTEZEIT",
  "home.sensors.note": "SENSOREN NICHT VERBUNDEN · LICHTSTIMMUNG FOLGT DEINER GERÄTEZEIT",
  "home.atmosphere.morning": "MORGENLICHT",
  "home.atmosphere.day": "TAGESLICHT",
  "home.atmosphere.evening": "ABENDLICHT",
  "home.atmosphere.night": "NACHTMODUS",
  "home.hero.eyebrow": "DEINE LEBENDE WELT",
  "home.hero.title": "NATUR IST KUNST.",
  "home.hero.body": "Beobachte, verbinde und gestalte deine BlackWaterLeaf-Welt in deinem Tempo.",
  "home.hero.action": "WELT ENTDECKEN",
  "home.feed.eyebrow": "BLACKWATERLEAF MOMENTE",
  "home.feed.title": "NATUR, DIE WEITERFLIESST.",
  "home.feed.pending": "VERBINDUNG AUSSTEHEND",
  "home.feed.emptyTitle": "ECHTE MOMENTE ERSCHEINEN HIER NACH DER KONTOVERKNÜPFUNG.",
  "home.feed.emptyBody": "Bis dahin zeigt BlackWaterLeaf bewusst keine erfundenen Beiträge, Personen oder Interaktionen.",
  "home.worlds.title": "DEINE BEREICHE",
  "home.worlds.meta": "IN BEWEGUNG",
  "home.truth.eyebrow": "EHRLICHE VERBINDUNG",
  "home.truth.title": "DEINE WELT WÄCHST MIT ECHTEN DATEN.",
  "home.truth.body": "Konto, Sensoren und Community werden erst nach einer echten Freigabe verbunden. Bis dahin bleiben Status und Inhalte transparent.",
  "world.botany.title": "BOTANIK",
  "world.botany.subtitle": "Pflegen & entdecken",
  "world.aquarium.title": "AQUARISTIK",
  "world.aquarium.subtitle": "Schwarzwasser erleben",
  "world.terrarium.title": "TERRARISTIK",
  "world.terrarium.subtitle": "Regenwald bewahren",
  "world.assistant.title": "KI-ASSISTENT",
  "world.assistant.subtitle": "Transparent gesperrt",
  "leaf.open": "BLATTKERN ÖFFNEN",
  "leaf.close": "BLATTKERN SCHLIESSEN",
  "leaf.photo": "Foto",
  "leaf.observe": "Beobachtung",
  "leaf.post": "Beitrag",
  "leaf.plant": "Pflanze",
  "leaf.aquarium": "Aquarium",
  "leaf.ask": "KI fragen",
  "explore.eyebrow": "DEINE WELTEN",
  "explore.title": "ENTDECKE DAS LEBEN.",
  "explore.body": "Vier intensive Naturbereiche, eine gemeinsame BlackWaterLeaf-Atmosphäre.",
  "community.eyebrow": "GEMEINSAM WACHSEN",
  "community.title": "COMMUNITY IN BEWEGUNG.",
  "community.emptyTitle": "NOCH KEINE FREIGEGEBENEN NATURMOMENTE.",
  "community.emptyBody": "Der Feed zeigt ausschließlich echte öffentliche Beiträge aktiver Konten. Es werden keine Personen, Likes oder Kommentare erfunden.",
  "assistant.eyebrow": "BLACKWATERLEAF KI",
  "assistant.title": "ECHTE KI-HILFE. KEINE SCHEINANTWORT.",
  "assistant.body": "Anbieter, Modell, Kosten und Datenschutz sind noch nicht freigegeben. Deshalb erzeugt dieser Bereich keine Antwort.",
  "assistant.rule": "KEINE FREIGABE · KEIN DATENABRUF · KEINE KI-ANTWORT",
  "profile.eyebrow": "DEIN KONTO",
  "profile.title": "IDENTITÄT BLEIBT VERIFIZIERT.",
  "profile.signedOut": "Melde dich sicher an, um Profil, private Beobachtungen und Freigaben serverseitig zu verwalten.",
  "profile.role": "ROLLE",
  "profile.status": "STATUS",
  "profile.privacy": "PROFILSICHTBARKEIT",
  "profile.logout": "ABMELDEN",
  "realm.eyebrow": "DEIN BEREICH",
  "realm.title": "ECHTE FUNKTIONEN, KLARER STATUS.",
  "realm.empty": "Noch keine privaten Beobachtungen in diesem Bereich.",
  "realm.signedOut": "Melde dich an, um deine privaten Beobachtungen sicher zu laden.",
  "knowledge.eyebrow": "WISSEN & EVIDENZ",
  "knowledge.title": "WISSEN BRAUCHT QUELLEN.",
  "knowledge.empty": "Noch keine veröffentlichten, quellenbelegten Wissenseinträge verfügbar.",
  "system.code": "SYSTEMSTATUS",
} as const;

type TranslationKey = keyof typeof de;

const en: Record<TranslationKey, string> = {
  "tabs.home": "Home",
  "tabs.explore": "Explore",
  "tabs.community": "Community",
  "tabs.assistant": "AI",
  "tabs.profile": "Profile",
  "common.offline": "OFFLINE",
  "common.notConnected": "NOT CONNECTED",
  "common.loading": "CHECKING CONNECTION",
  "common.error": "CONNECTION ERROR",
  "common.empty": "NO REAL DATA AVAILABLE",
  "common.open": "OPEN",
  "common.signIn": "SIGN IN SECURELY",
  "common.retry": "CHECK AGAIN",
  "common.language": "LANGUAGE",
  "common.units": "UNITS",
  "common.metric": "Metric",
  "common.imperial": "Imperial",
  "home.sensors.title": "MEASUREMENTS",
  "home.sensors.water": "WATER",
  "home.sensors.air": "AIR",
  "home.sensors.ph": "pH VALUE",
  "home.sensors.deviceTime": "DEVICE TIME",
  "home.sensors.note": "SENSORS NOT CONNECTED · LIGHTING FOLLOWS YOUR DEVICE TIME",
  "home.atmosphere.morning": "MORNING LIGHT",
  "home.atmosphere.day": "DAYLIGHT",
  "home.atmosphere.evening": "EVENING LIGHT",
  "home.atmosphere.night": "NIGHT MODE",
  "home.hero.eyebrow": "YOUR LIVING WORLD",
  "home.hero.title": "NATURE IS ART.",
  "home.hero.body": "Observe, connect and shape your BlackWaterLeaf world at your own pace.",
  "home.hero.action": "EXPLORE YOUR WORLD",
  "home.feed.eyebrow": "BLACKWATERLEAF MOMENTS",
  "home.feed.title": "NATURE THAT KEEPS FLOWING.",
  "home.feed.pending": "CONNECTION PENDING",
  "home.feed.emptyTitle": "REAL MOMENTS APPEAR HERE AFTER YOUR ACCOUNT IS CONNECTED.",
  "home.feed.emptyBody": "Until then, BlackWaterLeaf deliberately shows no invented posts, people or interactions.",
  "home.worlds.title": "YOUR AREAS",
  "home.worlds.meta": "IN MOTION",
  "home.truth.eyebrow": "HONEST CONNECTION",
  "home.truth.title": "YOUR WORLD GROWS WITH REAL DATA.",
  "home.truth.body": "Account, sensors and community connect only after a real authorization. Until then, status and content remain transparent.",
  "world.botany.title": "BOTANY",
  "world.botany.subtitle": "Care & discover",
  "world.aquarium.title": "AQUATICS",
  "world.aquarium.subtitle": "Experience blackwater",
  "world.terrarium.title": "TERRARIUMS",
  "world.terrarium.subtitle": "Protect the rainforest",
  "world.assistant.title": "AI ASSISTANT",
  "world.assistant.subtitle": "Transparently locked",
  "leaf.open": "OPEN LEAF CORE",
  "leaf.close": "CLOSE LEAF CORE",
  "leaf.photo": "Photo",
  "leaf.observe": "Observation",
  "leaf.post": "Post",
  "leaf.plant": "Plant",
  "leaf.aquarium": "Aquarium",
  "leaf.ask": "Ask AI",
  "explore.eyebrow": "YOUR WORLDS",
  "explore.title": "DISCOVER LIFE.",
  "explore.body": "Four intense natural worlds, one shared BlackWaterLeaf atmosphere.",
  "community.eyebrow": "GROW TOGETHER",
  "community.title": "COMMUNITY IN MOTION.",
  "community.emptyTitle": "NO APPROVED NATURE MOMENTS YET.",
  "community.emptyBody": "The feed only shows real public posts from active accounts. No people, likes or comments are invented.",
  "assistant.eyebrow": "BLACKWATERLEAF AI",
  "assistant.title": "REAL AI HELP. NO PRETEND ANSWERS.",
  "assistant.body": "Provider, model, costs and data protection have not been approved. This area therefore generates no response.",
  "assistant.rule": "NO APPROVAL · NO DATA ACCESS · NO AI RESPONSE",
  "profile.eyebrow": "YOUR ACCOUNT",
  "profile.title": "IDENTITY STAYS VERIFIED.",
  "profile.signedOut": "Sign in securely to manage your profile, private observations and permissions on the server.",
  "profile.role": "ROLE",
  "profile.status": "STATUS",
  "profile.privacy": "PROFILE VISIBILITY",
  "profile.logout": "SIGN OUT",
  "realm.eyebrow": "YOUR AREA",
  "realm.title": "REAL FEATURES, CLEAR STATUS.",
  "realm.empty": "No private observations in this area yet.",
  "realm.signedOut": "Sign in to load your private observations securely.",
  "knowledge.eyebrow": "KNOWLEDGE & EVIDENCE",
  "knowledge.title": "KNOWLEDGE NEEDS SOURCES.",
  "knowledge.empty": "No published, source-backed knowledge entries are available yet.",
  "system.code": "SYSTEM STATUS",
};

export function resolveLocale(stored: string | null, _browserLanguage: string): AppLocale {
  if (stored === "de" || stored === "en") return stored;
  return "de";
}

export function resolveAccountLocale(current: AppLocale, accountLocale: AppLocale | null | undefined): AppLocale {
  return accountLocale ?? current;
}

export function resolveUnitSystem(stored: string | null): UnitSystem {
  return stored === "imperial" ? "imperial" : "metric";
}

export function translate(locale: AppLocale, key: TranslationKey): string {
  return locale === "de" ? de[key] : en[key];
}

type HabitatKindI18n = "aquarium" | "plant" | "terrarium";
type HabitatFieldCopy = { label: string; hint?: string };
export type HabitatCopy = {
  sectionTitle: string;
  sectionMeta: string;
  intro: string;
  loading: string;
  empty: string;
  noValues: string;
  addHabitat: string;
  privateSetup: string;
  privateEdit: string;
  createTitle: string;
  editSuffix: string;
  cancel: string;
  save: string;
  update: string;
  saving: string;
  saved: string;
  updated: string;
  saveFailed: string;
  count: (value: number) => string;
  relativeHumidity: string;
  kinds: Record<HabitatKindI18n, { label: string; plural: string }>;
  fields: Record<HabitatKindI18n, Record<string, HabitatFieldCopy>>;
};

const habitatDe: HabitatCopy = {
  sectionTitle: "Meine Anlagen & Werte",
  sectionMeta: "Privat · Aquarien, Pflanzen & Terrarien",
  intro: "Lege deine Anlagen strukturiert an. Diese Angaben bleiben nur in deinem Konto und erscheinen nicht in deinem öffentlichen Profil oder der Community.",
  loading: "Anlagen werden geladen …",
  empty: "Noch keine Anlage angelegt. Wähle oben einen Bereich aus.",
  noValues: "Noch keine Werte hinterlegt",
  addHabitat: "Anlage hinzufügen",
  privateSetup: "PRIVATE EINRICHTUNG",
  privateEdit: "PRIVATE BEARBEITUNG",
  createTitle: "anlegen",
  editSuffix: "bearbeiten",
  cancel: "Abbrechen",
  save: "ANLAGE PRIVAT SPEICHERN",
  update: "ANLAGE AKTUALISIEREN",
  saving: "SPEICHERE …",
  saved: "Anlage privat gespeichert.",
  updated: "Anlage aktualisiert.",
  saveFailed: "Anlage konnte nicht gespeichert werden.",
  count: value => `${value} angelegt`,
  relativeHumidity: "% LF",
  kinds: {
    aquarium: { label: "Aquarium", plural: "Aquarien" },
    plant: { label: "Pflanze", plural: "Pflanzen" },
    terrarium: { label: "Terrarium", plural: "Terrarien" },
  },
  fields: {
    aquarium: {
      name: { label: "Name des Aquariums" }, volumeLiters: { label: "Volumen", hint: "Liter" }, dimensions: { label: "Maße", hint: "L × B × H in cm" },
      temperatureC: { label: "Temperatur", hint: "°C" }, ph: { label: "pH" }, gh: { label: "GH", hint: "°dGH" }, kh: { label: "KH", hint: "°dKH" },
      nitriteMgL: { label: "Nitrit", hint: "mg/l" }, nitrateMgL: { label: "Nitrat", hint: "mg/l" }, conductivityUs: { label: "Leitwert", hint: "µS/cm" },
      occupants: { label: "Besatz", hint: "Tiere, Anzahl, Varianten" }, plants: { label: "Pflanzen", hint: "Arten oder Gruppen" }, equipment: { label: "Technik", hint: "Filter, Licht, Heizer, CO₂ …" }, notes: { label: "Notizen" },
    },
    plant: {
      name: { label: "Name der Pflanze" }, scientificName: { label: "Botanischer Name" }, quantity: { label: "Anzahl" }, location: { label: "Standort", hint: "z. B. Fenster Ost" },
      substrate: { label: "Substrat" }, potSizeCm: { label: "Topfgröße", hint: "cm" }, light: { label: "Licht", hint: "hell, indirekt …" }, watering: { label: "Gießen" },
      humidityPercent: { label: "Luftfeuchte", hint: "%" }, temperatureC: { label: "Temperatur", hint: "°C" }, fertilizer: { label: "Düngung" }, notes: { label: "Notizen" },
    },
    terrarium: {
      name: { label: "Name des Terrariums" }, volumeLiters: { label: "Volumen", hint: "Liter" }, dimensions: { label: "Maße", hint: "L × B × H in cm" },
      dayTemperatureC: { label: "Tagtemperatur", hint: "°C" }, nightTemperatureC: { label: "Nachttemperatur", hint: "°C" }, humidityPercent: { label: "Luftfeuchte", hint: "%" },
      occupants: { label: "Bewohner", hint: "Art, Anzahl, Geschlecht" }, plants: { label: "Pflanzen" }, substrate: { label: "Substrat" }, equipment: { label: "Technik", hint: "Licht, Beregnung, Heizung …" }, notes: { label: "Notizen" },
    },
  },
};

const habitatEn: HabitatCopy = {
  sectionTitle: "My habitats & values",
  sectionMeta: "Private · aquariums, plants & terrariums",
  intro: "Create structured records for your habitats. These details remain in your account and never appear on your public profile or in the community.",
  loading: "Loading habitats …",
  empty: "No habitat has been created yet. Choose an area above.",
  noValues: "No values recorded yet",
  addHabitat: "Add habitat",
  privateSetup: "PRIVATE SETUP",
  privateEdit: "PRIVATE EDIT",
  createTitle: "create",
  editSuffix: "edit",
  cancel: "Cancel",
  save: "SAVE HABITAT PRIVATELY",
  update: "UPDATE HABITAT",
  saving: "SAVING …",
  saved: "Habitat saved privately.",
  updated: "Habitat updated.",
  saveFailed: "The habitat could not be saved.",
  count: value => `${value} created`,
  relativeHumidity: "% RH",
  kinds: {
    aquarium: { label: "Aquarium", plural: "Aquariums" },
    plant: { label: "Plant", plural: "Plants" },
    terrarium: { label: "Terrarium", plural: "Terrariums" },
  },
  fields: {
    aquarium: {
      name: { label: "Aquarium name" }, volumeLiters: { label: "Volume", hint: "litres" }, dimensions: { label: "Dimensions", hint: "L × W × H in cm" },
      temperatureC: { label: "Temperature", hint: "°C" }, ph: { label: "pH" }, gh: { label: "GH", hint: "°dGH" }, kh: { label: "KH", hint: "°dKH" },
      nitriteMgL: { label: "Nitrite", hint: "mg/l" }, nitrateMgL: { label: "Nitrate", hint: "mg/l" }, conductivityUs: { label: "Conductivity", hint: "µS/cm" },
      occupants: { label: "Occupants", hint: "animals, count, variants" }, plants: { label: "Plants", hint: "species or groups" }, equipment: { label: "Equipment", hint: "filter, lighting, heater, CO₂ …" }, notes: { label: "Notes" },
    },
    plant: {
      name: { label: "Plant name" }, scientificName: { label: "Botanical name" }, quantity: { label: "Quantity" }, location: { label: "Location", hint: "for example east-facing window" },
      substrate: { label: "Substrate" }, potSizeCm: { label: "Pot size", hint: "cm" }, light: { label: "Light", hint: "bright, indirect …" }, watering: { label: "Watering" },
      humidityPercent: { label: "Humidity", hint: "%" }, temperatureC: { label: "Temperature", hint: "°C" }, fertilizer: { label: "Fertiliser" }, notes: { label: "Notes" },
    },
    terrarium: {
      name: { label: "Terrarium name" }, volumeLiters: { label: "Volume", hint: "litres" }, dimensions: { label: "Dimensions", hint: "L × W × H in cm" },
      dayTemperatureC: { label: "Day temperature", hint: "°C" }, nightTemperatureC: { label: "Night temperature", hint: "°C" }, humidityPercent: { label: "Humidity", hint: "%" },
      occupants: { label: "Occupants", hint: "species, count, sex" }, plants: { label: "Plants" }, substrate: { label: "Substrate" }, equipment: { label: "Equipment", hint: "lighting, misting, heating …" }, notes: { label: "Notes" },
    },
  },
};

export function habitatText(locale: AppLocale): HabitatCopy {
  return locale === "de" ? habitatDe : habitatEn;
}

type I18nContextValue = {
  locale: AppLocale;
  unitSystem: UnitSystem;
  setLocale: (locale: AppLocale) => void;
  setUnitSystem: (unitSystem: UnitSystem) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): AppLocale {
  if (typeof window === "undefined") return "de";
  return resolveLocale(window.localStorage.getItem("blackwaterleaf.locale.v1"), window.navigator.language);
}

function detectUnits(): UnitSystem {
  if (typeof window === "undefined") return "metric";
  return resolveUnitSystem(window.localStorage.getItem("blackwaterleaf.unit-system.v1"));
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<AppLocale>(detectLocale);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(detectUnits);

  useEffect(() => {
    window.localStorage.setItem("blackwaterleaf.locale.v1", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem("blackwaterleaf.unit-system.v1", unitSystem);
  }, [unitSystem]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, unitSystem, setLocale, setUnitSystem, t: key => translate(locale, key) }),
    [locale, unitSystem],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
