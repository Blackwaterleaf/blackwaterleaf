import { trpc } from "@/lib/trpc";
import { SeoEnhanced } from "@/components/SeoEnhanced";
import {
  Leaf,
  Droplets,
  Trophy,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  BookOpen,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Design Tokens (Premium v2) ─────────────────────────────────
const C = {
  bg:           "#070A08",
  card:         "rgba(13, 17, 14, 0.85)",
  cardSolid:    "#0D110E",
  glassBorder:  "rgba(45, 107, 63, 0.30)",
  smaragd:      "#2D9B6E",
  smaragdHover: "#34C87A",
  mint:         "#34D399",
  gold:         "#D4AF37",
  secGreen:     "#2D6B3F",
  white:        "#FFFFFF",
  white70:      "rgba(255,255,255,0.70)",
  slate:        "#94A3B8",
  heroOverlay:  "linear-gradient(180deg, rgba(7,10,8,0.45) 0%, rgba(7,10,8,0.72) 60%, #070A08 100%)",
};

// ─── Kategorie-Buttons ───────────────────────────────────────────
const CATEGORIES = [
  { label: "Botanik",  icon: Leaf,    href: "/plants"   },
  { label: "Aquarien",  icon: Droplets, href: "/aquariums" },
  { label: "Ranking",   icon: Trophy,  href: "/ranking"  },
  { label: "Suche",     icon: Search,  href: "/discover" },
] as const;

// ─── Feature-Karten ─────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    label: "ENTDECKEN",
    title: "PFLANZENWELT",
    description: "Pflege, Tipps & Inspiration für gesunde Pflanzen und beeindruckende Setups.",
    cta: "Mehr entdecken",
    href: "/plants",
    imgGradient: "linear-gradient(160deg, rgba(45,155,110,0.25) 0%, rgba(7,10,8,0.95) 100%)",
  },
  {
    label: "ENTDECKEN",
    title: "AQUARISTIK",
    description: "Technik, Guides & Aquarienwelten für Anfänger und Profis.",
    cta: "Mehr entdecken",
    href: "/aquariums",
    imgGradient: "linear-gradient(160deg, rgba(45,107,63,0.30) 0%, rgba(7,10,8,0.95) 100%)",
  },
  {
    label: "SMART",
    title: "KI ASSISTENT",
    description: "Dein smarter Helfer für alle Fragen rund um Pflanzen & Aquaristik.",
    cta: "Assistent starten",
    href: "/ai",
    imgGradient: "linear-gradient(160deg, rgba(52,211,153,0.20) 0%, rgba(7,10,8,0.95) 100%)",
  },
  {
    label: "GEMEINSAM",
    title: "COMMUNITY",
    description: "Teile dein Wissen, stelle Fragen und wachse gemeinsam mit Gleichgesinnten.",
    cta: "Zur Community",
    href: "/feed",
    imgGradient: "linear-gradient(160deg, rgba(45,155,110,0.22) 0%, rgba(7,10,8,0.95) 100%)",
  },
] as const;

// ─── Warum-Karten ────────────────────────────────────────────────
const WHY_CARDS = [
  { icon: ShieldCheck, title: "Werbefrei",           desc: "Kein Tracking, keine Werbung – nur Inhalte." },
  { icon: Heart,       title: "Mit Liebe zur Natur", desc: "Authentisch, bodenständig, fachlich fundiert." },
  { icon: BookOpen,    title: "Wissen statt Meinung", desc: "Kuratierte Guides aus verlässlichen Quellen." },
  { icon: Users,       title: "Community-getrieben", desc: "Gemeinsam wachsen statt allein gärtnern." },
] as const;

// ─── Glassmorphism-Karte ─────────────────────────────────────────
function GlassCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.card,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${C.glassBorder}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.50)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function Discover() {
  const { data: hub } = trpc.discover.hub.useQuery(undefined, { staleTime: 60_000 });

  const featuredAccount = (hub as any)?.featuredAccount ?? null;
  const accountOfDay = featuredAccount ?? ((hub as any)?.topMembers?.[0] ?? null);

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <SeoEnhanced
        title="Entdecken"
        path="/discover"
        description="Entdecke Botanik, Aquarien, Wissen und Community auf BlackwaterLeaf."
        keywords={["Aquaristik", "Aquascaping", "Schwarzwasser", "Channa", "Botanik", "Community", "Pflanzenbestimmung"]}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: 480 }}
      >
        {/* Dschungel-Hintergrundbild */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(/manus-storage/hero-jungle_a77cc07f.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Dunkles Overlay-Gradient */}
        <div
          className="absolute inset-0"
          style={{ background: C.heroOverlay }}
        />

        {/* Hero-Content */}
        <div className="relative px-5 pt-8 pb-10">
          {/* BLACKWATERLEAF COMMUNITY Label */}
          <p
            className="text-xs font-semibold uppercase mb-6"
            style={{
              color: "rgba(255,255,255,0.60)",
              letterSpacing: "0.18em",
            }}
          >
            BLACKWATERLEAF COMMUNITY
          </p>

          {/* Headline */}
          <div className="mb-6">
            <h1
              className="font-brand leading-none"
              style={{
                fontSize: "clamp(2.8rem, 11vw, 4rem)",
                letterSpacing: "0.02em",
                lineHeight: 1.05,
              }}
            >
              <span style={{ color: C.white }}>WISSEN.</span>
              <br />
              <span style={{ color: C.white }}>TEILEN.</span>
              <br />
              {/* WACHSEN. in reinem Gold #D4AF37 */}
              <span style={{ color: C.gold }}>
                WACHSEN.
              </span>
            </h1>
          </div>

          {/* CTA-Buttons – nebeneinander wie im Mockup */}
          <div className="flex gap-3 mt-6">
            <Link href="/discover">
              <button
                className="py-3 px-6 rounded-full font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                style={{
                  background: C.smaragd,
                  color: C.white,
                  letterSpacing: "0.06em",
                  boxShadow: `0 0 20px rgba(45,155,110,0.40)`,
                  fontSize: "0.8rem",
                }}
              >
                ENTDECKEN
              </button>
            </Link>
            <Link href="/feed">
              <button
                className="py-3 px-6 rounded-full font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                style={{
                  background: "rgba(13,17,14,0.55)",
                  backdropFilter: "blur(8px)",
                  border: `1.5px solid rgba(255,255,255,0.25)`,
                  color: C.white,
                  letterSpacing: "0.06em",
                  fontSize: "0.8rem",
                }}
              >
                COMMUNITY
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── KATEGORIEN (1×4 Glassmorphism-Karten) ────────────── */}
      <div className="px-4 py-5">
        <div className="grid grid-cols-4 gap-2.5">
          {CATEGORIES.map(({ label, icon: Icon, href }) => (
            <Link key={label} href={href}>
              <GlassCard className="flex flex-col items-center justify-center gap-2 py-4 cursor-pointer transition-all duration-150 active:scale-[0.95]">
                <Icon className="w-6 h-6" style={{ color: C.mint }} strokeWidth={1.8} />
                <span
                  className="text-xs font-medium text-center"
                  style={{ color: C.white70 }}
                >
                  {label}
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>

      {/* ── ACCOUNT DES TAGES ─────────────────────────────────── */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-bold uppercase"
            style={{ color: C.gold, letterSpacing: "0.14em" }}
          >
            ACCOUNT DES TAGES
          </span>
          <Sparkles className="w-4 h-4" style={{ color: C.gold }} />
        </div>

        {accountOfDay ? (
          <Link href={`/profile/${accountOfDay.userId ?? accountOfDay.id ?? ""}`}>
            <GlassCard className="p-4 cursor-pointer transition-all duration-150 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 flex-shrink-0">
                  <AvatarImage src={accountOfDay.userAvatarUrl ?? accountOfDay.avatarUrl ?? undefined} />
                  <AvatarFallback
                    className="text-xl font-bold"
                    style={{ background: "rgba(45,155,110,0.20)", color: C.mint }}
                  >
                    {(accountOfDay.userName ?? accountOfDay.name ?? "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg leading-tight truncate" style={{ color: C.white }}>
                    {accountOfDay.userName ?? accountOfDay.name ?? "Unbekannt"}
                  </p>
                  {accountOfDay.bio && (
                    <p className="text-sm mt-0.5 line-clamp-2" style={{ color: C.white70 }}>
                      {accountOfDay.bio}
                    </p>
                  )}
                  <p
                    className="text-sm font-semibold mt-2 flex items-center gap-1"
                    style={{ color: C.smaragd }}
                  >
                    Profil ansehen <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>
        ) : (
          <GlassCard className="p-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(45,155,110,0.15)" }}
              >
                <span className="text-2xl font-bold font-brand" style={{ color: C.mint }}>K</span>
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: C.white }}>KiemenKumpel</p>
                <p className="text-sm" style={{ color: C.white70 }}>Aquaristiker Mit Herz &amp; Verstand</p>
                <p className="text-sm font-semibold mt-1.5 flex items-center gap-1" style={{ color: C.smaragd }}>
                  Profil ansehen <ArrowRight className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* ── FEATURE-KARTEN ────────────────────────────────────── */}
      <div className="px-4 pb-5 flex flex-col gap-3">
        {FEATURE_CARDS.map((card) => (
          <Link key={card.title} href={card.href}>
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98]"
              style={{
                minHeight: 130,
                background: C.cardSolid,
                border: `1px solid ${C.glassBorder}`,
                boxShadow: "0 4px 24px rgba(0,0,0,0.50)",
              }}
            >
              {/* Gradient-Overlay */}
              <div
                className="absolute inset-0"
                style={{ background: card.imgGradient }}
              />
              <div className="relative p-5">
                <span
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: C.mint }}
                >
                  {card.label}
                </span>
                <h3
                  className="font-brand text-2xl leading-tight mb-1.5"
                  style={{ color: C.white, letterSpacing: "0.04em" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: C.white70 }}>
                  {card.description}
                </p>
                <span
                  className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: C.smaragd }}
                >
                  {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── WARUM BLACKWATERLEAF (2×2 Grid) ──────────────────── */}
      <div className="px-4 pb-8">
        <h2
          className="font-brand text-xl mb-4"
          style={{ color: C.white, letterSpacing: "0.06em" }}
        >
          WARUM BLACKWATERLEAF?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
            <GlassCard key={title} className="p-4">
              <Icon className="w-5 h-5 mb-2" style={{ color: C.mint }} strokeWidth={1.8} />
              <p className="font-semibold text-sm mb-1" style={{ color: C.white }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: C.slate }}>
                {desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
