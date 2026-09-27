import type { AppLocale } from "@/i18n";

export const SEO_LOCALES: readonly AppLocale[] = ["de", "en", "zh-CN", "es", "fr"];

export const HOME_SEO_TITLES: Record<AppLocale, string> = {
  de: "BlackWaterLeaf – Botanik, Aquaristik & Terraristik",
  en: "BlackWaterLeaf – Botany, Aquatics & Terrariums",
  "zh-CN": "BlackWaterLeaf – 植物、水族与生态缸自然观察平台",
  es: "BlackWaterLeaf – Botánica, Acuarios y Terrarios",
  fr: "BlackWaterLeaf – Botanique, Aquariums et Terrariums",
};

export const HOME_SEO_KEYWORDS = [
  "Botanik",
  "Aquaristik",
  "Terraristik",
  "Pflanzenpflege",
  "Naturbeobachtung",
] as const;

const SEO_COPY: Record<AppLocale, { description: string; keywords: string }> = {
  de: {
    description: "BlackWaterLeaf verbindet Botanik, Aquaristik, Terraristik, Naturbeobachtung und quellengebundenes Wissen.",
    keywords: "Botanik, Aquaristik, Terraristik, Pflanzenpflege, Naturbeobachtung",
  },
  en: {
    description: "BlackWaterLeaf connects botany, aquatics, terrariums, nature observations and source-backed knowledge.",
    keywords: "botany, aquatics, terrariums, plant care, nature observations",
  },
  "zh-CN": {
    description: "BlackWaterLeaf 连接植物学、水族、生态缸、自然观察与有来源依据的知识。",
    keywords: "植物学, 水族, 生态缸, 植物养护, 自然观察",
  },
  es: {
    description: "BlackWaterLeaf conecta botánica, acuarios, terrarios, observaciones de la naturaleza y conocimiento documentado.",
    keywords: "botánica, acuarios, terrarios, cuidado de plantas, observación de la naturaleza",
  },
  fr: {
    description: "BlackWaterLeaf relie botanique, aquariums, terrariums, observations de la nature et connaissances sourcées.",
    keywords: "botanique, aquariums, terrariums, entretien des plantes, observation de la nature",
  },
};

const PAGE_LABELS: Record<string, Record<AppLocale, string>> = {
  "/explore": { de: "Natur entdecken", en: "Explore nature", "zh-CN": "探索自然", es: "Explorar la naturaleza", fr: "Explorer la nature" },
  "/knowledge": { de: "Naturwissen", en: "Nature knowledge", "zh-CN": "自然知识", es: "Conocimiento natural", fr: "Connaissances naturalistes" },
  "/botanik": { de: "Botanik", en: "Botany", "zh-CN": "植物学", es: "Botánica", fr: "Botanique" },
  "/aquaristik": { de: "Aquaristik", en: "Aquatics", "zh-CN": "水族", es: "Acuarios", fr: "Aquariums" },
  "/terraristik": { de: "Terraristik", en: "Terrariums", "zh-CN": "生态缸", es: "Terrarios", fr: "Terrariums" },
  "/marketplace": { de: "Marktplatz", en: "Marketplace", "zh-CN": "市场", es: "Mercado", fr: "Marché" },
};

export function getSeoMeta(pathname: string, locale: AppLocale) {
  const path = pathname === "/wissen" ? "/knowledge" : pathname;
  const copy = SEO_COPY[locale];
  if (path === "/") return { title: HOME_SEO_TITLES[locale], description: copy.description, keywords: copy.keywords };
  const label = PAGE_LABELS[path]?.[locale] ?? (locale === "de" ? "Naturplattform" : locale === "en" ? "Nature platform" : locale === "zh-CN" ? "自然平台" : locale === "es" ? "Plataforma natural" : "Plateforme nature");
  return { title: `BlackWaterLeaf – ${label}`, description: copy.description, keywords: copy.keywords };
}

export const HOME_WORLD_IMAGE_ALTS = {
  de: {
    botany: "Regenwaldpflanzen und Wasserfall für die Botanik-Welt",
    aquarium: "Bepflanztes Süßwasseraquarium für die Aquaristik-Welt",
    terrarium: "Moosbedecktes Terrarium für die Terraristik-Welt",
    assistant: "Regenwaldmotiv für den BlackWaterLeaf KI-Assistenten",
  },
  en: {
    botany: "Rainforest plants and waterfall for the botany world",
    aquarium: "Planted freshwater aquarium for the aquatics world",
    terrarium: "Moss-covered terrarium for the terrarium world",
    assistant: "Rainforest image for the BlackWaterLeaf AI assistant",
  },
  "zh-CN": { botany: "植物世界中的热带雨林与瀑布", aquarium: "水族世界中的淡水水草缸", terrarium: "生态缸世界中的苔藓景观", assistant: "BlackWaterLeaf AI 助手的雨林图像" },
  es: { botany: "Plantas de selva y cascada para el mundo botánico", aquarium: "Acuario de agua dulce plantado para el mundo acuático", terrarium: "Terrario cubierto de musgo para el mundo de terrarios", assistant: "Imagen de selva para el asistente de IA de BlackWaterLeaf" },
  fr: { botany: "Plantes de forêt tropicale et cascade pour le monde botanique", aquarium: "Aquarium d'eau douce planté pour le monde aquatique", terrarium: "Terrarium couvert de mousse pour le monde des terrariums", assistant: "Image de forêt tropicale pour l'assistant IA BlackWaterLeaf" },
} as const;
