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

export function resolveLocale(stored: string | null, browserLanguage: string): AppLocale {
  if (stored === "de" || stored === "en") return stored;
  return browserLanguage.toLowerCase().startsWith("de") ? "de" : "en";
}

export function resolveUnitSystem(stored: string | null): UnitSystem {
  return stored === "imperial" ? "imperial" : "metric";
}

export function translate(locale: AppLocale, key: TranslationKey): string {
  return locale === "de" ? de[key] : en[key];
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
