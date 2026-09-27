import type { AppLocale } from "@/i18n";

export const SEO_LOCALES: readonly AppLocale[] = ["de", "en", "zh-CN", "es", "fr", "it", "pt-BR", "ja", "ko", "nl", "tr", "pl", "ar"];

export const HOME_SEO_TITLES: Record<AppLocale, string> = {
  de: "BlackWaterLeaf – Botanik, Aquaristik & Terraristik", en: "BlackWaterLeaf – Botany, Aquatics & Nature", "zh-CN": "BlackWaterLeaf – 植物、水族与生态缸自然观察平台", es: "BlackWaterLeaf – Botánica, Acuarios y Terrarios", fr: "BlackWaterLeaf – Botanique, Aquariums et Terrariums", it: "BlackWaterLeaf – Botanica, Acquari & Natura", "pt-BR": "BlackWaterLeaf – Botânica, Aquários e Terrários", ja: "BlackWaterLeaf – 植物・アクアリウム・自然観察", ko: "BlackWaterLeaf – 식물·수족관·자연관찰 플랫폼", nl: "BlackWaterLeaf – Plantkunde, Aquaria en Terrariums", tr: "BlackWaterLeaf – Botanik, Akvaryumlar ve Terraryumlar", pl: "BlackWaterLeaf – Botanika, Akwaria i Terraria", ar: "BlackWaterLeaf – علم النبات والأحواض ومراقبة الطبيعة",
};

export const HOME_SEO_KEYWORDS = ["Botanik", "Aquaristik", "Terraristik", "Pflanzenpflege", "Naturbeobachtung"] as const;

type SeoCopy = { description: string; keywords: string };
const SEO_COPY: Record<AppLocale, SeoCopy> = {
  de: { description: "BlackWaterLeaf verbindet Botanik, Aquaristik, Terraristik, Naturbeobachtung und quellengebundenes Wissen.", keywords: "Botanik, Aquaristik, Terraristik, Pflanzenpflege, Naturbeobachtung" },
  en: { description: "BlackWaterLeaf connects botany, aquatics, terrariums, nature observations and source-backed knowledge.", keywords: "botany, aquatics, terrariums, plant care, nature observations" },
  "zh-CN": { description: "BlackWaterLeaf 连接植物学、水族、生态缸、自然观察与有来源依据的知识。", keywords: "植物学, 水族, 生态缸, 植物养护, 自然观察" },
  es: { description: "BlackWaterLeaf conecta botánica, acuarios, terrarios, observaciones de la naturaleza y conocimiento documentado.", keywords: "botánica, acuarios, terrarios, cuidado de plantas, naturaleza" },
  fr: { description: "BlackWaterLeaf relie botanique, aquariums, terrariums, observations de la nature et connaissances sourcées.", keywords: "botanique, aquariums, terrariums, nature" },
  it: { description: "BlackWaterLeaf collega botanica, acquari, terrari, osservazioni della natura e conoscenza documentata.", keywords: "botanica, acquari, terrari, natura" },
  "pt-BR": { description: "BlackWaterLeaf conecta botânica, aquários, terrários, observação da natureza e conhecimento com fontes.", keywords: "botânica, aquários, terrários, natureza" },
  ja: { description: "BlackWaterLeaf は植物、水族館、テラリウム、自然観察と根拠ある知識をつなぎます。", keywords: "植物, 水族館, テラリウム, 自然観察" },
  ko: { description: "BlackWaterLeaf는 식물, 수족관, 테라리움, 자연 관찰과 근거 있는 지식을 연결합니다.", keywords: "식물, 수족관, 테라리움, 자연 관찰" },
  nl: { description: "BlackWaterLeaf verbindt plantkunde, aquaria, terrariums, natuurwaarnemingen en onderbouwde kennis.", keywords: "plantkunde, aquaria, terrariums, natuur" },
  tr: { description: "BlackWaterLeaf botanik, akvaryumlar, teraryumlar ve kaynaklı doğa bilgisini birleştirir.", keywords: "botanik, akvaryum, teraryum, doğa" },
  pl: { description: "BlackWaterLeaf łączy botanikę, akwarystykę, terraria, obserwacje przyrody i wiedzę ze źródłami.", keywords: "botanika, akwaria, terraria, przyroda" },
  ar: { description: "يربط BlackWaterLeaf بين علم النبات والأحواض والتيراريوم ومراقبة الطبيعة والمعرفة الموثقة.", keywords: "النباتات, الأحواض, التيراريوم, الطبيعة" },
};

const labels: Record<AppLocale, string> = { de: "Naturplattform", en: "Nature platform", "zh-CN": "自然平台", es: "Plataforma natural", fr: "Plateforme nature", it: "Piattaforma naturalistica", "pt-BR": "Plataforma natural", ja: "自然プラットフォーム", ko: "자연 플랫폼", nl: "Natuurplatform", tr: "Doğa platformu", pl: "Platforma przyrodnicza", ar: "منصة الطبيعة" };
const pageLabels: Record<string, Partial<Record<AppLocale, string>>> = {
  "/explore": { de: "Natur entdecken", en: "Explore nature", "zh-CN": "探索自然", es: "Explorar la naturaleza", fr: "Explorer la nature" },
  "/knowledge": { de: "Naturwissen", en: "Nature knowledge", "zh-CN": "自然知识", es: "Conocimiento natural", fr: "Connaissances naturalistes" },
  "/botanik": { de: "Botanik", en: "Botany", "zh-CN": "植物学", es: "Botánica", fr: "Botanique" },
  "/aquaristik": { de: "Aquaristik", en: "Aquatics", "zh-CN": "水族", es: "Acuarios", fr: "Aquariums" },
  "/terraristik": { de: "Terraristik", en: "Terrariums", "zh-CN": "生态缸", es: "Terrarios", fr: "Terrariums" },
  "/marketplace": { de: "Marktplatz", en: "Marketplace", "zh-CN": "市场", es: "Mercado", fr: "Marché" },
  "/support": { de: "Naturprojekt unterstützen", en: "Support the nature project" },
};

export function getSeoMeta(pathname: string, locale: AppLocale) {
  const path = pathname === "/wissen" ? "/knowledge" : pathname;
  const copy = SEO_COPY[locale];
  if (path === "/") return { title: HOME_SEO_TITLES[locale], description: copy.description, keywords: copy.keywords };
  return { title: `BlackWaterLeaf – ${pageLabels[path]?.[locale] ?? labels[locale]}`, description: copy.description, keywords: copy.keywords };
}

export const HOME_WORLD_IMAGE_ALTS: Record<AppLocale, { botany: string; aquarium: string; terrarium: string; assistant: string }> = {
  de: { botany: "Regenwaldpflanzen und Wasserfall für die Botanik-Welt", aquarium: "Bepflanztes Süßwasseraquarium für die Aquaristik-Welt", terrarium: "Moosbedecktes Terrarium für die Terraristik-Welt", assistant: "Regenwaldmotiv für den BlackWaterLeaf KI-Assistenten" },
  en: { botany: "Rainforest plants and waterfall for the botany world", aquarium: "Planted freshwater aquarium for the aquatics world", terrarium: "Moss-covered terrarium for the terrarium world", assistant: "Rainforest image for the BlackWaterLeaf AI assistant" },
  "zh-CN": { botany: "植物世界中的热带雨林与瀑布", aquarium: "水族世界中的淡水水草缸", terrarium: "生态缸世界中的苔藓景观", assistant: "BlackWaterLeaf AI 助手的雨林图像" },
  es: { botany: "Plantas de selva y cascada", aquarium: "Acuario de agua dulce plantado", terrarium: "Terrario cubierto de musgo", assistant: "Imagen de selva para el asistente IA" },
  fr: { botany: "Plantes de forêt tropicale", aquarium: "Aquarium d'eau douce planté", terrarium: "Terrarium couvert de mousse", assistant: "Image de forêt pour l'assistant IA" },
  it: { botany: "Piante della foresta tropicale", aquarium: "Acquario d'acqua dolce", terrarium: "Terrario con muschio", assistant: "Immagine per l'assistente IA" },
  "pt-BR": { botany: "Plantas da floresta tropical", aquarium: "Aquário de água doce", terrarium: "Terrário com musgo", assistant: "Imagem para o assistente IA" },
  ja: { botany: "熱帯雨林の植物", aquarium: "淡水水草水槽", terrarium: "苔のテラリウム", assistant: "AIアシスタントの森林画像" },
  ko: { botany: "열대 우림 식물", aquarium: "담수 수초 수족관", terrarium: "이끼 테라리움", assistant: "AI 어시스턴트 숲 이미지" },
  nl: { botany: "Planten uit het regenwoud", aquarium: "Beplant zoetwateraquarium", terrarium: "Terrarium met mos", assistant: "Bosafbeelding voor de AI-assistent" },
  tr: { botany: "Yağmur ormanı bitkileri", aquarium: "Tatlı su akvaryumu", terrarium: "Yosunlu teraryum", assistant: "Yapay zeka asistanı orman görseli" },
  pl: { botany: "Rośliny lasu deszczowego", aquarium: "Akwarium słodkowodne", terrarium: "Terrarium z mchem", assistant: "Leśny obraz dla asystenta AI" },
  ar: { botany: "نباتات الغابات المطيرة", aquarium: "حوض مياه عذبة مزروع", terrarium: "حوض نباتي مغطى بالطحالب", assistant: "صورة الغابة للمساعد الذكي" },
};
