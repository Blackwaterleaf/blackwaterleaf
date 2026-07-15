import { Seo } from "@/components/Seo";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Mail } from "lucide-react";

// Farb-Konstanten
const C = {
  bg: "oklch(0.10 0.008 200)",
  card: "oklch(0.14 0.008 200)",
  cardBorder: "1px solid oklch(0.21 0.008 200)",
  green: "oklch(0.52 0.14 148)",
  greenLight: "oklch(0.65 0.16 148)",
  greenBg: "oklch(0.52 0.14 148 / 0.15)",
  gold: "oklch(0.72 0.14 78)",
  goldBg: "oklch(0.72 0.14 78 / 0.12)",
  textPrimary: "oklch(0.95 0.005 200)",
  textSecondary: "oklch(0.70 0.005 200)",
  textMuted: "oklch(0.48 0.008 200)",
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
        className="relative overflow-hidden px-4 pt-5 pb-8"
        style={{
          background: "linear-gradient(160deg, oklch(0.12 0.015 148) 0%, oklch(0.10 0.008 200) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 80% 20%, oklch(0.18 0.06 148 / 0.20) 0%, transparent 60%)",
          }}
        />

        <p
          className="text-xs font-bold uppercase mb-3 relative"
          style={{ color: C.greenLight, letterSpacing: "0.14em" }}
        >
          MARKTPLATZ
        </p>

        <h1
          className="font-brand leading-none mb-4 relative"
          style={{
            fontSize: "clamp(2.2rem, 9vw, 3.2rem)",
            color: C.textPrimary,
            letterSpacing: "0.02em",
            lineHeight: 1.05,
          }}
        >
          GEPRÜFTE PARTNER.
          <br />
          EHRLICHE
          <br />
          EMPFEHLUNGEN.
        </h1>

        <p className="text-base leading-relaxed relative" style={{ color: C.textSecondary, maxWidth: 360 }}>
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
            style={{ background: C.goldBg, color: C.gold, border: `1px solid oklch(0.72 0.14 78 / 0.25)` }}
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
                  background: isActive ? "transparent" : "oklch(0.16 0.008 200)",
                  color: isActive ? C.greenLight : C.textSecondary,
                  border: isActive ? `2px solid ${C.greenLight}` : "2px solid oklch(0.22 0.008 200)",
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
          style={{ background: C.card, border: C.cardBorder }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              height: 200,
              background: "linear-gradient(160deg, oklch(0.16 0.05 148) 0%, oklch(0.11 0.010 200) 100%)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 80% 50%, oklch(0.22 0.07 148 / 0.25) 0%, transparent 60%)",
              }}
            />
            <div className="absolute top-3 left-3">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: "oklch(0.08 0.008 200 / 0.85)",
                  color: C.greenLight,
                  border: "1px solid oklch(0.52 0.14 148 / 0.30)",
                }}
              >
                {CATEGORIES.find((c) => c.value === activeCategory)?.label}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h2 className="font-brand text-2xl font-bold mb-1.5" style={{ color: C.textPrimary }}>
              {CATEGORIES.find((c) => c.value === activeCategory)?.label}
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
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(160deg, oklch(0.16 0.04 148) 0%, oklch(0.13 0.008 200) 100%)",
            border: C.cardBorder,
          }}
        >
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
              style={{ background: C.greenLight, color: "oklch(0.08 0.008 200)" }}
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
                  border: `1px solid oklch(0.52 0.14 148 / 0.40)`,
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
