import { Seo } from "@/components/Seo";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Mail } from "lucide-react";

// Farb-Konstanten
const C = {
  bg: "#070A08",
  card: "rgba(13,17,14,0.90)",
  cardBorder: "1px solid rgba(45,107,63,0.30)",
  green: "#2D9B6E",
  greenLight: "#34D399",
  greenBg: "rgba(45,155,110,0.15)",
  gold: "#D4AF37",
  goldBg: "rgba(212,175,55,0.12)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.70)",
  textMuted: "rgba(255,255,255,0.45)",
};

const CATEGORIES = [
  { value: "aquaristik", label: "Aquaristik" },
  { value: "pflanzenwelt", label: "Pflanzenwelt" },
  { value: "zubehoer", label: "Zubehör" },
] as const;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  aquaristik: "Technik, Becken, Filter, Beleuchtung und Zubehör für dein Aquarium.",
  pflanzenwelt: "Seltene Pflanzen, Stecklinge, Erde und Pflanzenzubehör.",
  zubehoer: "Werkzeug, Deko, Substrate und Pflegeprodukte.",
};

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState<string>("aquaristik");
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Seo
        title="Marktplatz – Geprüfte Partner & Empfehlungen"
        path="/marketplace"
        description="BlackwaterLeaf Marktplatz: Geprüfte Partner aus Aquaristik und Botanik. Ehrliche Empfehlungen, transparent gekennzeichnet."
      />

      {/* HERO-BEREICH */}
      <div
        className="relative overflow-hidden px-4 pt-5 pb-10"
        style={{
          background: "linear-gradient(160deg, rgba(13,25,18,1) 0%, #070A08 100%)",
          minHeight: 280,
        }}
      >
        {/* Radial-Glow links */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 90% at 90% 30%, rgba(45,155,110,0.22) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(212,175,55,0.10) 0%, transparent 55%)",
          }}
        />
        {/* Horizontale Trennlinie unten */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(45,155,110,0.35), transparent)" }}
        />

        <p
          className="text-xs font-bold uppercase mb-4 relative flex items-center gap-2"
          style={{ color: C.greenLight, letterSpacing: "0.18em" }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: C.greenLight, boxShadow: `0 0 6px ${C.greenLight}` }}
          />
          MARKTPLATZ
        </p>

        <h1
          className="font-brand leading-none mb-5 relative"
          style={{
            fontSize: "clamp(2.6rem, 10vw, 3.8rem)",
            color: C.textPrimary,
            letterSpacing: "0.02em",
            lineHeight: 1.0,
          }}
        >
          GEPRÜFTE PARTNER.
          <br />
          <span style={{ color: C.gold }}>EHRLICHE</span>
          <br />
          EMPFEHLUNGEN.
        </h1>

        <p className="text-sm leading-relaxed relative" style={{ color: C.textSecondary, maxWidth: 380 }}>
          BlackwaterLeaf verkauft nichts selbst. Wir verbinden dich mit geprüften Partnerunternehmen aus Aquaristik und
          Botanik. Werbung kennzeichnen wir immer transparent.
        </p>
      </div>

      {/* TRANSPARENZ-HINWEIS */}
      <div className="px-4 pb-5">
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ background: C.card, border: C.cardBorder }}
        >
          <div
            className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold mt-0.5"
            style={{ background: C.goldBg, color: C.gold, border: `1px solid rgba(212,175,55,0.25)` }}
          >
            Transparenz
          </div>
          <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            Alle bezahlten Platzierungen werden mit „Anzeige" oder „Partner" gekennzeichnet. Fachliche Beratung ersetzt
            der Marktplatz nicht.
          </p>
        </div>
      </div>

      {/* KATEGORIE-FILTER */}
      <div className="px-4 pb-5">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                style={{
                  background: isActive ? "transparent" : "rgba(13,17,14,0.85)",
                  color: isActive ? C.greenLight : C.textSecondary,
                  border: isActive ? `2px solid ${C.greenLight}` : "2px solid rgba(45,107,63,0.35)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KATEGORIE-KARTE */}
      <div className="px-4 pb-5">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(13,17,14,0.90)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(45,107,63,0.30)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.50)",
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              height: 200,
              background: "linear-gradient(160deg, rgba(22,40,28,1) 0%, rgba(13,17,14,1) 100%)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 80% 50%, rgba(45,155,110,0.28) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(52,211,153,0.12) 0%, transparent 50%)",
              }}
            />
            {/* Shimmer-Linie */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(45,155,110,0.40), transparent)" }}
            />
            <div className="absolute top-3 left-3">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: "rgba(7,10,8,0.85)",
                  color: C.greenLight,
                  border: "1px solid rgba(45,155,110,0.35)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {CATEGORIES.find((c) => c.value === activeCategory)?.label}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h2 className="font-brand text-2xl mb-1.5" style={{ color: C.textPrimary, letterSpacing: "0.04em" }}>
              {CATEGORIES.find((c) => c.value === activeCategory)?.label?.toUpperCase()}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              {CATEGORY_DESCRIPTIONS[activeCategory]}
            </p>
          </div>
        </div>
      </div>

      {/* PARTNER-SEKTION */}
      <div className="px-4 pb-5">
        <p className="text-xs font-bold uppercase mb-3" style={{ color: C.greenLight, letterSpacing: "0.14em" }}>
          PARTNER
        </p>
        <h2 className="text-2xl font-bold mb-4" style={{ color: C.textPrimary }}>
          Geprüfte Anbieter
        </h2>

        {/* Leerer Zustand */}
        <div className="rounded-2xl p-5" style={{ background: C.card, border: C.cardBorder }}>
          <div className="flex items-start gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.greenLight }} />
            <div>
              <p className="font-bold text-base mb-1" style={{ color: C.textPrimary }}>
                Noch keine Partner freigeschaltet
              </p>
              <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                Wir schalten hier nur Unternehmen frei, die unsere Prüfung bestehen. Solange keine geprüften Partner
                gelistet sind, bleibt dieser Bereich leer – wir erfinden keine Anbieter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PARTNER WERDEN */}
      <div className="px-4 pb-5">
        <div
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(22,40,28,0.95) 0%, rgba(13,17,14,0.98) 100%)",
            border: "1px solid rgba(212,175,55,0.25)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(212,175,55,0.08)",
          }}
        >
          {/* Gold-Glow oben rechts */}
          <div
            className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
            style={{ background: "radial-gradient(circle at 80% 20%, rgba(212,175,55,0.15) 0%, transparent 65%)" }}
          />
          <p className="text-xs font-bold uppercase mb-2" style={{ color: C.gold, letterSpacing: "0.14em" }}>
            FÜR UNTERNEHMEN
          </p>
          <h3 className="font-brand text-2xl font-bold mb-3" style={{ color: C.textPrimary }}>
            Partner werden
          </h3>
          <p className="text-sm leading-relaxed mb-5" style={{ color: C.textSecondary }}>
            Du betreibst einen Shop oder eine Gärtnerei im Bereich Aquaristik oder Botanik? Bewirb dich als geprüfter
            Partner. Ablauf: Bewerbung → Prüfung → Freischaltung → Profilpflege → Produktverwaltung.
          </p>

          {!showContactForm ? (
            <button
              onClick={() => setShowContactForm(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
              style={{ background: C.greenLight, color: "#070A08" }}
            >
              Bewerbung anfragen
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                Schreib uns eine E-Mail mit deinem Unternehmensnamen und einer kurzen Beschreibung:
              </p>
              <a
                href="mailto:BlackwaterLeaf@gmail.com?subject=Partner-Bewerbung&body=Hallo BlackwaterLeaf-Team,%0A%0AIch möchte mich als Partner bewerben.%0A%0AUnternehmen:%0ABeschreibung:%0AWebsite:"
                className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                style={{
                  background: C.greenBg,
                  color: C.greenLight,
                  border: `1px solid rgba(45,155,110,0.40)`,
                  display: "inline-flex",
                }}
              >
                <Mail className="w-4 h-4" />
                BlackwaterLeaf@gmail.com
              </a>
              <button
                onClick={() => setShowContactForm(false)}
                className="block text-xs mt-2"
                style={{ color: C.textMuted }}
              >
                Abbrechen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER-HINWEIS */}
      <div className="px-4 pb-10">
        <p className="text-xs text-center leading-relaxed" style={{ color: C.textMuted }}>
          Der Marktplatz befindet sich im Aufbau. Funktionen wie Suche, KI-Empfehlungen und Produktkatalog folgen mit
          freigeschalteten Partnern.
        </p>
      </div>
    </div>
  );
}
