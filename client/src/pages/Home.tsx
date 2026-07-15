import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { getLoginUrl, APK_DOWNLOAD_URL } from "@/const";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  Leaf, Fish, Bot, Users, Play, ArrowRight,
  Shield, Heart, BookOpen,
  Zap, MessageSquare, Camera,
  Download, Smartphone, Monitor, CheckCircle2,
} from "lucide-react";

/* ── Brand images (already uploaded to S3) ── */
const IMG_HERO      = "/manus-storage/hero-main_962b134d.png";
const IMG_WISSEN    = "/manus-storage/wissen-pflege_9290790e.png";
const IMG_COMMUNITY = "/manus-storage/community-forum_5e681ef4.png";
const IMG_CHANNA    = "/manus-storage/channa-tank_aeefb736.webp";
const IMG_PLANTS    = "/manus-storage/plants-golden_070e92ad.png";
const IMG_LOGO      = "/manus-storage/logo-circle_c176197b.png";

/* ── Was dich in der Community erwartet (keine erfundenen Nutzer/Aktivitäten) ── */
const COMMUNITY_HIGHLIGHTS = [
  { icon: "L", title: "Setups teilen", text: "Zeig dein Aquascape oder deine Pflanzensammlung." },
  { icon: "F", title: "Fragen stellen", text: "Hol dir Rat zu Pflege, Technik und Problemen." },
  { icon: "W", title: "Wissen finden", text: "Fundierte Guides statt Halbwissen." },
  { icon: "K", title: "KI-Assistent", text: "Schnelle Antworten rund um die Uhr." },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const previewLanding = typeof window !== "undefined" && window.location.search.includes("__noauth=1");

  // Redirect logged-in users straight to the feed
  useEffect(() => {
    if (!previewLanding && !loading && isAuthenticated) {
      navigate("/feed");
    }
  }, [isAuthenticated, loading, navigate, previewLanding]);

  if (loading) return null;
  if (isAuthenticated && !previewLanding) return null;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.07 0.008 200)" }}>
      <Seo
        path="/"
        title="Aquaristik & Zimmerpflanzen Community"
        fullTitle={false}
        description="BlackwaterLeaf: Deutschsprachige Community für Aquaristik, Aquascaping und Zimmerpflanzen. Dokumentiere, lerne und tausche dich aus – mit KI-Unterstützung."
      />

      {/* ══════════════════════════════════════════════════════
          TOP NAV (standalone for landing page)
          ══════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "oklch(0.09 0.008 200 / 0.92)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          borderBottom: "1px solid oklch(0.20 0.008 200 / 0.5)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img
              src={IMG_LOGO}
              alt="BlackwaterLeaf"
              className="w-9 h-9 rounded-full"
              style={{ filter: "drop-shadow(0 0 8px oklch(0.52 0.14 148 / 0.5))" }}
            />
            <div className="hidden sm:block">
              <span className="font-brand text-base tracking-widest leading-none block" style={{ color: "oklch(0.95 0.005 200)" }}>
                BLACKWATER<span style={{ color: "oklch(0.52 0.14 148)" }}>LEAF</span>
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase block leading-none mt-0.5" style={{ color: "oklch(0.40 0.008 200)" }}>
                Community
              </span>
            </div>
          </div>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: "/discover", label: "Entdecken" },
              { href: "/knowledge", label: "Wissen" },
              { href: "/feed", label: "Community" },
              { href: "/ai", label: "KI Assistent" },
              { href: "#download", label: "App laden" },
            ].map((item) => {
              const isHash = item.href.startsWith("#");
              const cls = "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer block transition-all duration-200";
              const onEnter = (e: React.MouseEvent<HTMLElement>) => {
                (e.currentTarget as HTMLElement).style.color = "oklch(0.92 0.005 200)";
                (e.currentTarget as HTMLElement).style.background = "oklch(0.16 0.008 200)";
              };
              const onLeave = (e: React.MouseEvent<HTMLElement>) => {
                (e.currentTarget as HTMLElement).style.color = "oklch(0.68 0.008 200)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              };
              if (isHash) {
                return (
                  <a key={item.href} href={item.href} className={cls} style={{ color: "oklch(0.68 0.008 200)" }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
                    {item.label}
                  </a>
                );
              }
              return (
                <Link key={item.href} href={item.href}>
                  <span className={cls} style={{ color: "oklch(0.68 0.008 200)" }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <a href={getLoginUrl()} className="btn-primary text-sm">
                Anmelden
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={IMG_HERO}
            alt="BlackwaterLeaf"
            className="img-cover"
            style={{ filter: "brightness(0.45) saturate(1.2)" }}
          />
          {/* Left overlay for text readability */}
          <div className="absolute inset-0 img-overlay-left" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-48 img-overlay-bottom" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-24 pb-20 w-full">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <p
              className="text-xs tracking-[0.25em] uppercase mb-6 fade-in"
              style={{ color: "oklch(0.65 0.16 148)" }}
            >
              Für Pflanzenliebhaber. Für Aquarianer. Für Menschen, die mehr wollen.
            </p>

            {/* Main headline */}
            <h1 className="fade-in delay-100" style={{ marginBottom: "1rem" }}>
              <span
                className="font-brand block leading-none"
                style={{
                  fontSize: "clamp(3.5rem, 7vw, 6rem)",
                  color: "oklch(0.96 0.005 200)",
                  letterSpacing: "0.02em",
                }}
              >
                WISSEN.
              </span>
              <span
                className="font-brand block leading-none"
                style={{
                  fontSize: "clamp(3.5rem, 7vw, 6rem)",
                  color: "oklch(0.96 0.005 200)",
                  letterSpacing: "0.02em",
                }}
              >
                TEILEN.
              </span>
              <span
                className="font-brand block leading-none"
                style={{
                  fontSize: "clamp(3.5rem, 7vw, 6rem)",
                  color: "oklch(0.62 0.18 148)",
                  letterSpacing: "0.02em",
                }}
              >
                WACHSEN.
              </span>
            </h1>

            {/* Subtext */}
            <p
              className="text-base leading-relaxed mb-8 fade-in delay-200"
              style={{ color: "oklch(0.72 0.008 200)", maxWidth: "420px" }}
            >
              BlackwaterLeaf ist mehr als eine Community.<br />
              Es ist ein Ort für Wissen, Inspiration und echte Leidenschaft.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap fade-in delay-300">
              <Link href={isAuthenticated ? "/feed" : getLoginUrl()}>
                <span className="btn-primary cursor-pointer">
                  Community entdecken <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <a href="#download" className="btn-ghost flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.96 0.005 200 / 0.12)", border: "1px solid oklch(0.96 0.005 200 / 0.2)" }}
                >
                  <Download className="w-3.5 h-3.5" style={{ color: "oklch(0.96 0.005 200)" }} />
                </div>
                <span style={{ color: "oklch(0.80 0.005 200)" }}>App herunterladen</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
          ══════════════════════════════════════════════════════ */}
      <section style={{ background: "oklch(0.11 0.008 200)", borderTop: "1px solid oklch(0.21 0.008 200)", borderBottom: "1px solid oklch(0.21 0.008 200)" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Leaf,     value: "Botanik",   label: "Pflege & Inspiration" },
              { icon: Fish,     value: "Aquaristik", label: "Technik & Guides" },
              { icon: Zap,      value: "KI-Hilfe",   label: "Antworten rund um die Uhr" },
              { icon: Shield,   value: "Werbefrei",  label: "Deine Daten geschützt" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.52 0.14 148 / 0.12)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "oklch(0.62 0.16 148)" }} />
                  </div>
                  <div>
                    <p className="text-base font-bold leading-none" style={{ color: "oklch(0.95 0.005 200)" }}>
                      {stat.value}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.50 0.008 200)" }}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DOWNLOAD / APP SECTION
          ══════════════════════════════════════════════════════ */}
      <DownloadSection />

      {/* ══════════════════════════════════════════════════════
          FEATURE SECTIONS (4 große Blöcke wie im Mockup)
          ══════════════════════════════════════════════════════ */}

      {/* 1. PFLANZENWELT */}
      <FeatureSection
        image={IMG_PLANTS}
        icon={<Leaf className="w-6 h-6" style={{ color: "oklch(0.62 0.16 148)" }} />}
        title="PFLANZENWELT"
        description="Pflege, Tipps & Inspiration für Botanik und beeindruckende Setups."
        href="/plants"
        btnLabel="Mehr entdecken"
        imagePosition="right"
      />

      {/* 2. AQUARISTIK */}
      <FeatureSection
        image={IMG_CHANNA}
        icon={<Fish className="w-6 h-6" style={{ color: "oklch(0.62 0.16 148)" }} />}
        title="AQUARISTIK"
        description="Technik, Guides & Aquarienwelten für Anfänger und Profis."
        href="/aquariums"
        btnLabel="Mehr entdecken"
        imagePosition="right"
        dark
      />

      {/* 3. KI ASSISTENT */}
      <KISection />

      {/* 4. COMMUNITY */}
      <CommunitySection />

      {/* ══════════════════════════════════════════════════════
          TRUST FOOTER BAR
          ══════════════════════════════════════════════════════ */}
      <section style={{ background: "oklch(0.11 0.008 200)", borderTop: "1px solid oklch(0.21 0.008 200)" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Heart,   title: "Mit Liebe zur Natur",sub: "Nachhaltigkeit liegt uns am Herzen" },
              { icon: Shield,  title: "Sicher & Werbefrei", sub: "Deine Daten sind geschützt" },
              { icon: BookOpen,title: "Fundiertes Wissen",  sub: "Guides statt Halbwissen" },
              { icon: Users,   title: "Community-getrieben", sub: "Von Enthusiasten für Enthusiasten" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "oklch(0.52 0.14 148 / 0.10)", border: "1px solid oklch(0.52 0.14 148 / 0.20)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "oklch(0.62 0.16 148)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight" style={{ color: "oklch(0.88 0.005 200)" }}>
                      {item.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.48 0.008 200)" }}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "oklch(0.08 0.008 200)", borderTop: "1px solid oklch(0.16 0.008 200)" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={IMG_LOGO} alt="BL" className="w-7 h-7 rounded-full opacity-80" />
            <span className="font-brand text-sm tracking-widest" style={{ color: "oklch(0.45 0.008 200)" }}>
              BLACKWATERLEAF
            </span>
          </div>
          <p className="text-xs" style={{ color: "oklch(0.38 0.008 200)" }}>
            © 2025 BlackwaterLeaf · Natur. Wissen. Gemeinschaft.
          </p>
          <div className="flex items-center gap-4">
            <a href="/datenschutz" className="text-xs transition-colors duration-200 hover:text-primary" style={{ color: "oklch(0.40 0.008 200)" }}>
              Datenschutz
            </a>
            <a href="/impressum" className="text-xs transition-colors duration-200 hover:text-primary" style={{ color: "oklch(0.40 0.008 200)" }}>
              Impressum
            </a>
            <a href="/agb" className="text-xs transition-colors duration-200 hover:text-primary" style={{ color: "oklch(0.40 0.008 200)" }}>
              AGB
            </a>
            <a href="mailto:BlackwaterLeaf@gmail.com" className="text-xs transition-colors duration-200 hover:text-primary" style={{ color: "oklch(0.40 0.008 200)" }}>
              Kontakt
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Feature Section Component ── */
function FeatureSection({
  image, icon, title, description, href, btnLabel, imagePosition = "right", dark = false,
}: {
  image: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  btnLabel: string;
  imagePosition?: "left" | "right";
  dark?: boolean;
}) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: dark ? "oklch(0.08 0.008 200)" : "oklch(0.10 0.008 200)",
        borderBottom: "1px solid oklch(0.16 0.009 200)",
        minHeight: "420px",
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="img-cover"
          style={{ filter: "brightness(0.35) saturate(1.1)" }}
        />
        <div className="absolute inset-0 img-overlay-left" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-20">
        <div className="max-w-md">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
            style={{ background: "oklch(0.52 0.14 148 / 0.15)", border: "1px solid oklch(0.52 0.14 148 / 0.25)" }}
          >
            {icon}
          </div>

          {/* Title */}
          <h2
            className="font-brand mb-3 leading-none"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "oklch(0.96 0.005 200)",
              letterSpacing: "0.04em",
            }}
          >
            {title}
          </h2>

          {/* Description */}
          <p className="text-base leading-relaxed mb-8" style={{ color: "oklch(0.68 0.008 200)" }}>
            {description}
          </p>

          {/* CTA */}
          <Link href={href}>
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
              style={{
                background: "oklch(0.14 0.008 200)",
                border: "1px solid oklch(0.28 0.008 200)",
                color: "oklch(0.85 0.005 200)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "oklch(0.52 0.14 148 / 0.15)";
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.4)";
                (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.16 148)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "oklch(0.14 0.008 200)";
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.008 200)";
                (e.currentTarget as HTMLElement).style.color = "oklch(0.85 0.005 200)";
              }}
            >
              {btnLabel} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── KI Assistent Section ── */
function KISection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "oklch(0.07 0.008 200)",
        borderBottom: "1px solid oklch(0.16 0.009 200)",
        minHeight: "420px",
      }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(oklch(0.52 0.14 148 / 0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
        style={{ background: "oklch(0.52 0.14 148)", filter: "blur(80px)" }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "oklch(0.52 0.14 148 / 0.15)", border: "1px solid oklch(0.52 0.14 148 / 0.25)" }}
            >
              <Bot className="w-5 h-5" style={{ color: "oklch(0.62 0.16 148)" }} />
            </div>
            <h2
              className="font-brand mb-3 leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "oklch(0.96 0.005 200)", letterSpacing: "0.04em" }}
            >
              KI ASSISTENT
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: "oklch(0.68 0.008 200)" }}>
              Dein smarter Helfer für alle Fragen rund um Botanik & Aquaristik.
            </p>
            <Link href="/ai">
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: "oklch(0.14 0.008 200)",
                  border: "1px solid oklch(0.28 0.008 200)",
                  color: "oklch(0.85 0.005 200)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "oklch(0.52 0.14 148 / 0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.4)";
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.16 148)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "oklch(0.14 0.008 200)";
                  (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.008 200)";
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.85 0.005 200)";
                }}
              >
                Assistent starten <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Right: mock chat UI */}
          <div
            className="bwl-glass p-5 rounded-2xl max-w-sm mx-auto w-full"
            style={{ border: "1px solid oklch(0.52 0.14 148 / 0.2)" }}
          >
            <p className="text-sm font-medium mb-4" style={{ color: "oklch(0.75 0.008 200)" }}>
              Frag mich alles über Botanik & Aquaristik.
            </p>
            <div className="space-y-2">
              {[
                { icon: Leaf,          label: "Pflanzenpflege" },
                { icon: Fish,          label: "Aquarium Probleme" },
                { icon: Zap,           label: "CO₂ & Düngung" },
                { icon: Camera,        label: "Beleuchtung" },
                { icon: MessageSquare, label: "und vieles mehr..." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 cursor-pointer"
                    style={{ background: "oklch(0.16 0.008 200)", border: "1px solid oklch(0.22 0.008 200)" }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.55 0.14 148)" }} />
                    <span className="text-sm" style={{ color: "oklch(0.75 0.008 200)" }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Download / App Section ── */
function DownloadSection() {
  const handleApk = () => {
    toast.success("Download startet … Öffne die Datei anschließend zum Installieren.");
  };
  return (
    <section
      id="download"
      className="relative overflow-hidden scroll-mt-20"
      style={{
        background: "oklch(0.10 0.008 200)",
        borderBottom: "1px solid oklch(0.16 0.009 200)",
      }}
    >
      {/* Subtle grid + glow */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(oklch(0.52 0.14 148 / 0.25) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div
        className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full opacity-10 pointer-events-none"
        style={{ background: "oklch(0.52 0.14 148)", filter: "blur(90px)" }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text + buttons */}
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "oklch(0.52 0.14 148 / 0.15)", border: "1px solid oklch(0.52 0.14 148 / 0.25)" }}
            >
              <Smartphone className="w-5 h-5" style={{ color: "oklch(0.62 0.16 148)" }} />
            </div>
            <h2
              className="font-brand mb-3 leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "oklch(0.96 0.005 200)", letterSpacing: "0.04em" }}
            >
              HOL DIR DIE APP
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: "oklch(0.68 0.008 200)", maxWidth: "460px" }}>
              BlackwaterLeaf für dein Smartphone: Community, Botanik & Aquarien
              verwalten, KI-Assistent und mehr – immer dabei.
            </p>

            {/* Feature ticks */}
            <div className="space-y-2 mb-8">
              {[
                "Kostenlos & werbefrei",
                "Fotos, Pflege-Tagebuch & KI-Bestimmung",
                "Direkt mit deinem Konto synchronisiert",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.62 0.16 148)" }} />
                  <span className="text-sm" style={{ color: "oklch(0.72 0.008 200)" }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Download buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={APK_DOWNLOAD_URL}
                onClick={handleApk}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl font-semibold cursor-pointer transition-all duration-200"
                style={{ background: "oklch(0.52 0.14 148)", color: "oklch(0.14 0.02 148)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.58 0.15 148)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.52 0.14 148)"; }}
              >
                <Download className="w-5 h-5" />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] uppercase tracking-wider opacity-80">Android · APK</span>
                  <span className="block text-sm">Jetzt herunterladen</span>
                </span>
              </a>

              <button
                onClick={() => toast.info("Google Play: bald verfügbar. Nutze so lange den direkten Download.")}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl font-medium cursor-pointer transition-all duration-200"
                style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.28 0.008 200)", color: "oklch(0.85 0.005 200)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.40 0.008 200)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.008 200)"; }}
              >
                <Play className="w-5 h-5" style={{ color: "oklch(0.62 0.16 148)" }} />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] uppercase tracking-wider opacity-70">Google Play</span>
                  <span className="block text-sm">Bald verfügbar</span>
                </span>
              </button>
            </div>

            {/* PC hint */}
            <div className="flex items-center gap-2 mt-6">
              <Monitor className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.50 0.008 200)" }} />
              <span className="text-xs" style={{ color: "oklch(0.55 0.008 200)" }}>
                Am PC? Du kannst BlackwaterLeaf auch direkt im Browser nutzen.
              </span>
            </div>
          </div>

          {/* Right: phone mock */}
          <div className="flex justify-center">
            <div
              className="relative rounded-[2.5rem] p-3"
              style={{ background: "oklch(0.07 0.008 200)", border: "1px solid oklch(0.24 0.008 200)", width: "260px", boxShadow: "0 30px 80px -20px oklch(0.52 0.14 148 / 0.35)" }}
            >
              <div className="rounded-[2rem] overflow-hidden" style={{ background: "oklch(0.07 0.008 200)", aspectRatio: "9 / 19" }}>
                <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
                  <img
                    src={IMG_LOGO}
                    alt="BlackwaterLeaf"
                    className="w-20 h-20 rounded-2xl"
                    style={{ filter: "drop-shadow(0 0 16px oklch(0.52 0.14 148 / 0.5))" }}
                  />
                  <span className="font-brand text-lg tracking-widest" style={{ color: "oklch(0.95 0.005 200)" }}>
                    BLACKWATER<span style={{ color: "oklch(0.62 0.16 148)" }}>LEAF</span>
                  </span>
                  <span className="text-xs" style={{ color: "oklch(0.55 0.008 200)" }}>
                    Deine Community für Botanik & Aquaristik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Community Section ── */
function CommunitySection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "oklch(0.10 0.008 200)",
        borderBottom: "1px solid oklch(0.16 0.009 200)",
        minHeight: "420px",
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={"/manus-storage/community-forum_5e681ef4.png"}
          alt="Community"
          className="img-cover"
          style={{ filter: "brightness(0.30) saturate(1.0)" }}
        />
        <div className="absolute inset-0 img-overlay-left" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "oklch(0.52 0.14 148 / 0.15)", border: "1px solid oklch(0.52 0.14 148 / 0.25)" }}
            >
              <Users className="w-5 h-5" style={{ color: "oklch(0.62 0.16 148)" }} />
            </div>
            <h2
              className="font-brand mb-3 leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "oklch(0.96 0.005 200)", letterSpacing: "0.04em" }}
            >
              COMMUNITY
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: "oklch(0.68 0.008 200)" }}>
              Teile dein Wissen, stelle Fragen und wachse gemeinsam mit Gleichgesinnten.
            </p>
            <Link href="/feed">
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: "oklch(0.14 0.008 200)",
                  border: "1px solid oklch(0.28 0.008 200)",
                  color: "oklch(0.85 0.005 200)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "oklch(0.52 0.14 148 / 0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.52 0.14 148 / 0.4)";
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.65 0.16 148)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "oklch(0.14 0.008 200)";
                  (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.28 0.008 200)";
                  (e.currentTarget as HTMLElement).style.color = "oklch(0.85 0.005 200)";
                }}
              >
                Zur Community <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Right: activity feed */}
          <div className="max-w-sm mx-auto w-full space-y-3">
            {COMMUNITY_HIGHLIGHTS.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "oklch(0.12 0.008 200 / 0.85)", border: "1px solid oklch(0.22 0.008 200 / 0.5)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: "oklch(0.52 0.14 148 / 0.2)", color: "oklch(0.65 0.16 148)" }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium" style={{ color: "oklch(0.85 0.005 200)" }}>
                    {item.title}
                  </span>
                  <span className="text-sm ml-1" style={{ color: "oklch(0.55 0.008 200)" }}>
                    {item.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
