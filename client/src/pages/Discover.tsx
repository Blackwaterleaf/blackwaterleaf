import { trpc } from "@/lib/trpc";
import { Seo } from "@/components/Seo";
import {
  Leaf,
  Droplets,
  Trophy,
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Farb-Konstanten (identisch mit Native App)
const C = {
  bg: "oklch(0.10 0.008 200)",
  card: "oklch(0.14 0.008 200)",
  cardBorder: "1px solid oklch(0.20 0.008 200)",
  green: "oklch(0.52 0.14 148)",
  greenLight: "oklch(0.65 0.16 148)",
  greenBg: "oklch(0.52 0.14 148 / 0.15)",
  textPrimary: "oklch(0.95 0.005 200)",
  textSecondary: "oklch(0.70 0.005 200)",
  textMuted: "oklch(0.48 0.008 200)",
};

// Kategorien-Buttons (1x4 Reihe wie in Native App)
const CATEGORIES = [
  { label: "Pflanzen", icon: Leaf, href: "/plants" },
  { label: "Aquarien", icon: Droplets, href: "/aquariums" },
  { label: "Ranking", icon: Trophy, href: "/ranking" },
  { label: "Suche", icon: Search, href: "/discover" },
] as const;

// Feature-Karten (identisch mit Native App)
const FEATURE_CARDS = [
  {
    label: "ENTDECKEN",
    title: "PFLANZENWELT",
    description: "Pflege, Tipps & Inspiration für gesunde Pflanzen und beeindruckende Setups.",
    cta: "Mehr entdecken",
    href: "/plants",
    gradient: "linear-gradient(160deg, oklch(0.18 0.06 148) 0%, oklch(0.11 0.010 200) 100%)",
    accentColor: "oklch(0.65 0.16 148)",
  },
  {
    label: "ENTDECKEN",
    title: "AQUARISTIK",
    description: "Technik, Guides & Aquarienwelten für Anfänger und Profis.",
    cta: "Mehr entdecken",
    href: "/aquariums",
    gradient: "linear-gradient(160deg, oklch(0.16 0.05 220) 0%, oklch(0.11 0.010 200) 100%)",
    accentColor: "oklch(0.65 0.16 148)",
  },
  {
    label: "SMART",
    title: "KI ASSISTENT",
    description: "Dein smarter Helfer für alle Fragen rund um Pflanzen & Aquaristik.",
    cta: "Assistent starten",
    href: "/ai",
    gradient: "linear-gradient(160deg, oklch(0.15 0.07 148) 0%, oklch(0.11 0.010 200) 100%)",
    accentColor: "oklch(0.65 0.16 148)",
  },
  {
    label: "GEMEINSAM",
    title: "COMMUNITY",
    description: "Teile dein Wissen, stelle Fragen und wachse gemeinsam mit Gleichgesinnten.",
    cta: "Zur Community",
    href: "/feed",
    gradient: "linear-gradient(160deg, oklch(0.17 0.05 148) 0%, oklch(0.11 0.010 200) 100%)",
    accentColor: "oklch(0.65 0.16 148)",
  },
] as const;

// Warum BlackwaterLeaf - 2x2 Grid
const WHY_CARDS = [
  { title: "Werbefrei", desc: "Kein Tracking, keine Werbung – nur Inhalte." },
  { title: "Mit Liebe zur Natur", desc: "Authentisch, bodenständig, fachlich fundiert." },
  { title: "Wissen statt Meinung", desc: "Kuratierte Guides aus verlässlichen Quellen." },
  { title: "Community-getrieben", desc: "Gemeinsam wachsen statt allein gärtnern." },
] as const;

export default function Discover() {
  const { data: hub } = trpc.discover.hub.useQuery(undefined, { staleTime: 60_000 });

  const featuredAccount = (hub as any)?.featuredAccount ?? null;
  const accountOfDay = featuredAccount ?? ((hub as any)?.topMembers?.[0] ?? null);

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Seo
        title="Entdecken - BlackwaterLeaf Community"
        path="/discover"
        description="Entdecke Pflanzen, Aquarien, Wissen und Community auf BlackwaterLeaf."
      />

      {/* HERO-BEREICH */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 420,
          background: "linear-gradient(180deg, oklch(0.08 0.015 148) 0%, oklch(0.10 0.008 200) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 120% 80% at 50% 10%, oklch(0.20 0.08 148 / 0.30) 0%, transparent 65%), radial-gradient(ellipse 70% 50% at 85% 70%, oklch(0.16 0.05 148 / 0.20) 0%, transparent 55%)",
          }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute"
            style={{
              top: -30, right: -40, width: 240, height: 240,
              background: "oklch(0.22 0.07 148 / 0.10)",
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              transform: "rotate(-15deg)",
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: 20, left: -50, width: 200, height: 200,
              background: "oklch(0.18 0.05 148 / 0.08)",
              borderRadius: "70% 30% 30% 70% / 70% 70% 30% 30%",
              transform: "rotate(20deg)",
            }}
          />
        </div>

        <div className="relative px-5 pt-6 pb-8">
          <p
            className="text-xs font-semibold uppercase mb-4"
            style={{ color: "oklch(0.62 0.10 148 / 0.90)", letterSpacing: "0.10em", lineHeight: 1.5 }}
          >
            FÜR PFLANZENLIEBHABER. FÜR AQUARIANER. FÜR MENSCHEN, DIE MEHR WOLLEN.
          </p>

          <div className="mb-5">
            <h1
              className="font-brand leading-none"
              style={{
                fontSize: "clamp(2.6rem, 10vw, 3.8rem)",
                letterSpacing: "0.02em",
                color: C.textPrimary,
                lineHeight: 1.05,
              }}
            >
              WISSEN.
              <br />
              TEILEN.
              <br />
              <span style={{ color: C.greenLight }}>WACHSEN.</span>
            </h1>
          </div>

          <p
            className="text-base leading-relaxed mb-7"
            style={{ color: "oklch(0.78 0.005 200)", maxWidth: 340 }}
          >
            BlackwaterLeaf ist mehr als eine Community. Es ist ein Ort für Wissen, Inspiration und echte Leidenschaft.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/feed">
              <button
                className="w-full py-4 rounded-full font-semibold text-base transition-all duration-150 active:scale-[0.97]"
                style={{ background: C.greenLight, color: "oklch(0.08 0.008 200)", fontSize: "1rem", letterSpacing: "0.01em" }}
              >
                Community entdecken
              </button>
            </Link>
            <Link href="/knowledge">
              <button
                className="w-full py-4 rounded-full font-semibold text-base transition-all duration-150 active:scale-[0.97]"
                style={{ background: "transparent", border: "2px solid oklch(0.65 0.16 148 / 0.55)", color: C.textPrimary, fontSize: "1rem", letterSpacing: "0.01em" }}
              >
                Wissen ansehen
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* KATEGORIEN-BUTTONS (1x4 Reihe) */}
      <div className="px-4 py-5">
        <div className="grid grid-cols-4 gap-2.5">
          {CATEGORIES.map(({ label, icon: Icon, href }) => (
            <Link key={label} href={href}>
              <div
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.95]"
                style={{ background: C.card, border: C.cardBorder }}
              >
                <Icon className="w-6 h-6" style={{ color: C.greenLight }} strokeWidth={1.8} />
                <span className="text-xs font-medium text-center" style={{ color: C.textSecondary }}>
                  {label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ACCOUNT DES TAGES */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase" style={{ color: C.greenLight, letterSpacing: "0.14em" }}>
            ACCOUNT DES TAGES
          </span>
          <Sparkles className="w-4 h-4" style={{ color: "oklch(0.78 0.16 78)" }} />
        </div>

        {accountOfDay ? (
          <Link href={`/profile/${accountOfDay.userId ?? accountOfDay.id ?? ""}`}>
            <div
              className="rounded-2xl p-4 cursor-pointer transition-all duration-150 active:scale-[0.98]"
              style={{ background: C.card, border: C.cardBorder }}
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 flex-shrink-0">
                  <AvatarImage src={accountOfDay.userAvatarUrl ?? accountOfDay.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xl font-bold" style={{ background: C.greenBg, color: C.greenLight }}>
                    {(accountOfDay.userName ?? accountOfDay.name ?? "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg leading-tight truncate" style={{ color: C.textPrimary }}>
                    {accountOfDay.userName ?? accountOfDay.name ?? "Mitglied"}
                  </p>
                  {(accountOfDay.bio ?? accountOfDay.description) && (
                    <p className="text-sm mt-0.5 line-clamp-2" style={{ color: C.textSecondary }}>
                      {accountOfDay.bio ?? accountOfDay.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-sm font-semibold" style={{ color: C.greenLight }}>Profil ansehen</span>
                    <ArrowRight className="w-4 h-4" style={{ color: C.greenLight }} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl p-4" style={{ background: C.card, border: C.cardBorder }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.greenBg }}>
                <span className="text-2xl font-bold" style={{ color: C.greenLight }}>?</span>
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: C.textPrimary }}>Noch kein Account des Tages</p>
                <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>Bald wird hier ein Community-Mitglied vorgestellt.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FEATURE-KARTEN */}
      <div className="px-4 pb-5 space-y-4">
        {FEATURE_CARDS.map((card) => (
          <Link key={card.title} href={card.href}>
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-150 active:scale-[0.98]"
              style={{ minHeight: 180, background: card.gradient, border: C.cardBorder }}
            >
              <div
                className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
                aria-hidden="true"
                style={{ background: "radial-gradient(ellipse 100% 100% at 100% 50%, oklch(0.25 0.08 148 / 0.18) 0%, transparent 70%)" }}
              />
              <div className="relative p-5">
                <p className="text-xs font-bold uppercase mb-2" style={{ color: card.accentColor, letterSpacing: "0.14em" }}>
                  {card.label}
                </p>
                <h2
                  className="font-brand leading-none mb-3"
                  style={{ fontSize: "clamp(1.8rem, 7vw, 2.4rem)", color: C.textPrimary, letterSpacing: "0.02em" }}
                >
                  {card.title}
                </h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: C.textSecondary, maxWidth: 260 }}>
                  {card.description}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold" style={{ color: C.textPrimary }}>{card.cta}</span>
                  <ArrowRight className="w-4 h-4" style={{ color: C.textPrimary }} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* WARUM BLACKWATERLEAF */}
      <div className="px-4 pb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: C.textPrimary }}>
          Warum BlackwaterLeaf
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {WHY_CARDS.map((item) => (
            <div key={item.title} className="rounded-2xl p-4" style={{ background: C.card, border: C.cardBorder }}>
              <p className="font-bold text-sm mb-1.5 leading-snug" style={{ color: C.greenLight }}>{item.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
