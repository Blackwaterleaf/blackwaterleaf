import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// Brand image URLs from S3
const IMG_HERO = "/manus-storage/hero-main_962b134d.png";
const IMG_WISSEN = "/manus-storage/wissen-pflege_9290790e.png";
const IMG_COMMUNITY = "/manus-storage/community-forum_5e681ef4.png";
const IMG_CHANNA = "/manus-storage/channa-tank_aeefb736.webp";
const IMG_PLANTS = "/manus-storage/plants-golden_070e92ad.png";
const IMG_LOGO = "/manus-storage/logo-circle_c176197b.png";

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "PFLANZEN", href: "/plants" },
  { label: "WISSEN & PFLEGE", href: "/knowledge" },
  { label: "COMMUNITY", href: "/feed" },
  { label: "KI-ASSISTENT", href: "/ai" },
];

const FEATURES = [
  {
    icon: "🌿",
    title: "PFLANZEN ENTDECKEN",
    desc: "Seltene Alocasien, Rhizome & Zimmerpflanzen",
  },
  {
    icon: "📖",
    title: "WISSEN ERWEITERN",
    desc: "Pflegeanleitungen aus eigener Erfahrung",
  },
  {
    icon: "🐟",
    title: "AQUARISTIK",
    desc: "Schwarzwasser-Biotope & Channa-Haltung",
  },
  {
    icon: "👥",
    title: "COMMUNITY",
    desc: "Erfahrungen teilen, gemeinsam wachsen",
  },
];

const SECTIONS = [
  {
    img: IMG_WISSEN,
    tag: "WISSEN & PFLEGE",
    title: "Verstehen. Pflegen. Wachsen.",
    desc: "Praxisnahes Wissen rund um Alocasia, Zimmerpflanzen, Aquarienpflanzen, Rhizome und vieles mehr – aus unserer eigenen Sammlung.",
    href: "/knowledge",
    cta: "Zum Ratgeber",
    align: "left",
  },
  {
    img: IMG_COMMUNITY,
    tag: "COMMUNITY FORUM",
    title: "Plants. People. Passion.",
    desc: "Wissen teilen. Erfahrungen austauschen. Gemeinsam wachsen. Eine Community für alle Pflanzen- und Aquaristik-Begeisterten.",
    href: "/feed",
    cta: "Community beitreten",
    align: "right",
  },
  {
    img: IMG_CHANNA,
    tag: "AQUARISTIK",
    title: "Schwarzwasser & Channa",
    desc: "Tauche ein in die faszinierende Welt der Schwarzwasser-Biotope und Schlangenkopffische. Authentisch. Leidenschaftlich.",
    href: "/knowledge?category=Channa",
    cta: "Mehr erfahren",
    align: "left",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.08 0.012 60)" }}
    >
      {/* ── TOP NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.06 0.012 60 / 0.95), transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/">
          <img src={IMG_LOGO} alt="BlackwaterLeaf" className="h-10 w-10" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-brand tracking-widest transition-colors duration-200"
              style={{ color: "oklch(0.75 0.010 85)" }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color =
                  "oklch(0.72 0.14 75)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color =
                  "oklch(0.75 0.010 85)";
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/feed"
              className="px-4 py-2 rounded text-xs font-brand tracking-widest transition-all duration-200"
              style={{
                background: "oklch(0.55 0.14 140)",
                color: "oklch(0.96 0.005 85)",
              }}
            >
              ZUR APP
            </Link>
          ) : (
            <a
              href={getLoginUrl()}
              className="px-4 py-2 rounded text-xs font-brand tracking-widest transition-all duration-200"
              style={{
                background: "oklch(0.55 0.14 140)",
                color: "oklch(0.96 0.005 85)",
              }}
            >
              ANMELDEN
            </a>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={IMG_HERO}
          alt="BlackwaterLeaf Hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.06 0.012 60 / 0.65) 0%, oklch(0.06 0.012 60 / 0.35) 40%, oklch(0.06 0.012 60 / 0.85) 100%)",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Logo */}
          <img
            src={IMG_LOGO}
            alt="BlackwaterLeaf Logo"
            className="w-20 h-20 mx-auto mb-6 animate-fade-in"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.72 0.14 75 / 0.4))" }}
          />

          {/* Brand name */}
          <div className="animate-slide-up stagger-1">
            <h1
              className="font-brand text-6xl md:text-8xl lg:text-9xl leading-none mb-2"
              style={{ color: "oklch(0.95 0.010 88)" }}
            >
              BLACKWATER
            </h1>
            <h1
              className="font-brand text-6xl md:text-8xl lg:text-9xl leading-none mb-4"
              style={{
                color: "oklch(0.72 0.14 75)",
                textShadow: "0 0 40px oklch(0.72 0.14 75 / 0.5)",
              }}
            >
              LEAF
            </h1>
          </div>

          {/* Tagline */}
          <div
            className="flex items-center justify-center gap-3 mb-4 animate-slide-up stagger-2"
          >
            <div className="divider-gold w-16" />
            <p
              className="text-xs font-brand tracking-[0.3em]"
              style={{ color: "oklch(0.72 0.14 75)" }}
            >
              NATUR. WISSEN. GEMEINSCHAFT.
            </p>
            <div className="divider-gold w-16" />
          </div>

          {/* Subtitle */}
          <p
            className="text-base md:text-lg max-w-xl mx-auto mb-8 animate-slide-up stagger-3"
            style={{ color: "oklch(0.82 0.010 85)" }}
          >
            Deine Plattform für Aquaristik, Botanik und die Liebe zu Pflanzen.
            Wir teilen Wissen aus unserer Sammlung von über 130 Alocasien,
            Rhizomen und Jungpflanzen.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-4">
            <Link
              href="/plants"
              className="flex items-center gap-2 px-8 py-3 rounded font-brand tracking-widest text-sm transition-all duration-200 btn-glow-gold"
              style={{
                background: "oklch(0.55 0.14 140)",
                color: "oklch(0.96 0.005 85)",
              }}
            >
              🌿 PFLANZEN ENTDECKEN
            </Link>
            <Link
              href="/feed"
              className="flex items-center gap-2 px-8 py-3 rounded font-brand tracking-widest text-sm transition-all duration-200"
              style={{
                border: "1px solid oklch(0.72 0.14 75 / 0.6)",
                color: "oklch(0.72 0.14 75)",
                background: "transparent",
              }}
            >
              👥 COMMUNITY BEITRETEN
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in stagger-5"
          style={{ color: "oklch(0.72 0.14 75 / 0.7)" }}
        >
          <span className="text-xs font-brand tracking-widest">SCROLL</span>
          <div
            className="w-px h-8"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.72 0.14 75 / 0.7), transparent)",
            }}
          />
        </div>
      </section>

      {/* ── FEATURE ICONS ROW ── */}
      <section
        className="py-12 px-6"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.08 0.012 60), oklch(0.10 0.014 62))",
          borderBottom: "1px solid oklch(0.22 0.014 60)",
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`text-center animate-slide-up stagger-${i + 1}`}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div
                className="font-brand text-xs tracking-widest mb-1"
                style={{ color: "oklch(0.72 0.14 75)" }}
              >
                {f.title}
              </div>
              <p
                className="text-xs"
                style={{ color: "oklch(0.55 0.012 70)" }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTENT SECTIONS ── */}
      {SECTIONS.map((section, idx) => (
        <section
          key={section.tag}
          className="relative overflow-hidden"
          style={{ minHeight: "480px" }}
        >
          {/* Background image */}
          <img
            src={section.img}
            alt={section.tag}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center" }}
          />
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                section.align === "left"
                  ? "linear-gradient(to right, oklch(0.06 0.012 60 / 0.92) 0%, oklch(0.06 0.012 60 / 0.92) 40%, oklch(0.06 0.012 60 / 0.55) 70%, transparent 100%)"
                  : "linear-gradient(to left, oklch(0.06 0.012 60 / 0.92) 0%, oklch(0.06 0.012 60 / 0.92) 40%, oklch(0.06 0.012 60 / 0.55) 70%, transparent 100%)",
            }}
          />

          {/* Content */}
          <div
            className={`relative z-10 flex items-center h-full min-h-[480px] px-8 md:px-16 ${
              section.align === "right" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-md">
              {/* Tag */}
              <div
                className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-brand tracking-widest"
                style={{
                  background: "oklch(0.55 0.14 140 / 0.2)",
                  border: "1px solid oklch(0.55 0.14 140 / 0.4)",
                  color: "oklch(0.65 0.16 145)",
                }}
              >
                {section.tag}
              </div>

              {/* Title */}
              <h2
                className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight"
                style={{ color: "oklch(0.95 0.010 88)" }}
              >
                {section.title}
              </h2>

              {/* Divider */}
              <div className="divider-gold w-20 mb-4" />

              {/* Description */}
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "oklch(0.75 0.010 80)" }}
              >
                {section.desc}
              </p>

              {/* CTA */}
              <Link
                href={section.href}
                className="inline-flex items-center gap-2 px-6 py-3 rounded font-brand tracking-widest text-xs transition-all duration-200"
                style={{
                  background: idx === 0 ? "oklch(0.55 0.14 140)" : "transparent",
                  border:
                    idx === 0
                      ? "none"
                      : "1px solid oklch(0.72 0.14 75 / 0.6)",
                  color:
                    idx === 0
                      ? "oklch(0.96 0.005 85)"
                      : "oklch(0.72 0.14 75)",
                }}
              >
                {section.cta} →
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* ── PLANTS PHOTO SECTION ── */}
      <section className="relative overflow-hidden" style={{ height: "400px" }}>
        <img
          src={IMG_PLANTS}
          alt="Pflanzen"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: "oklch(0.06 0.012 60 / 0.70)",
          }}
        >
          <div className="text-center px-6">
            <p
              className="font-brand text-xs tracking-[0.4em] mb-3"
              style={{ color: "oklch(0.72 0.14 75)" }}
            >
              NATURE IN FLOW
            </p>
            <h2
              className="font-display text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "oklch(0.95 0.010 88)" }}
            >
              Jede Pflanze erzählt eine Geschichte.
            </h2>
            <Link
              href={user ? "/plants" : "/feed"}
              className="inline-flex items-center gap-2 px-8 py-3 rounded font-brand tracking-widest text-sm transition-all duration-200 btn-glow"
              style={{
                background: "oklch(0.55 0.14 140)",
                color: "oklch(0.96 0.005 85)",
              }}
            >
              SAMMLUNG ENTDECKEN
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-12 px-6 text-center"
        style={{
          background: "oklch(0.06 0.012 58)",
          borderTop: "1px solid oklch(0.18 0.014 60)",
        }}
      >
        <img
          src={IMG_LOGO}
          alt="BlackwaterLeaf"
          className="w-12 h-12 mx-auto mb-4 opacity-70"
        />
        <p
          className="font-brand text-xs tracking-[0.3em] mb-2"
          style={{ color: "oklch(0.72 0.14 75)" }}
        >
          BLACKWATERLEAF
        </p>
        <p
          className="text-xs mb-6"
          style={{ color: "oklch(0.42 0.010 70)" }}
        >
          NATUR. WISSEN. GEMEINSCHAFT.
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-brand tracking-widest transition-colors duration-200"
              style={{ color: "oklch(0.45 0.010 70)" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <p
          className="text-xs mt-8"
          style={{ color: "oklch(0.35 0.008 70)" }}
        >
          © 2025 BlackwaterLeaf · Nature in Flow
        </p>
      </footer>
    </div>
  );
}
