import { trpc } from "@/lib/trpc";
import { SeoEnhanced } from "@/components/SeoEnhanced";
import {
  Leaf,
  Fish,
  Bug,
  Sparkles,
  ArrowRight,
  Thermometer,
  Droplets,
  FlaskConical,
  Cloud,
  ShieldCheck,
  Heart,
  BookOpen,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ── Sensor-Daten (Demo – später via echtem Sensor-API) ── */
const SENSOR_DATA = [
  { icon: Thermometer, label: "Wasser",     value: "24.3 °C", color: "#2D9B6E" },
  { icon: Droplets,    label: "Luftfeuchte", value: "68 %",   color: "#2dd4bf" },
  { icon: FlaskConical,label: "pH-Wert",    value: "6.2 pH",  color: "#D4AF37" },
  { icon: Cloud,       label: "Außen",      value: "Leichter Regen", color: "rgba(255,255,255,0.6)" },
];

/* ── Kategorien-Grid (2×2 auf Mobile, 4-spaltig auf Desktop) ── */
const CATEGORY_CARDS = [
  {
    label: "Pflanzen World",
    sub: "Entdecken",
    icon: Leaf,
    href: "/plants",
    bg: "linear-gradient(160deg, rgba(45,155,110,0.35) 0%, rgba(7,10,8,0.95) 100%)",
    img: "/manus-storage/plants-golden_070e92ad.png",
    accent: "#2D9B6E",
  },
  {
    label: "Aquaristik",
    sub: "Entdecken",
    icon: Fish,
    href: "/aquariums",
    bg: "linear-gradient(160deg, rgba(45,212,191,0.25) 0%, rgba(7,10,8,0.95) 100%)",
    img: "/manus-storage/channa-tank_aeefb736.webp",
    accent: "#2dd4bf",
  },
  {
    label: "Terraristik",
    sub: "Entdecken",
    icon: Bug,
    href: "/aquariums",
    bg: "linear-gradient(160deg, rgba(45,107,63,0.35) 0%, rgba(7,10,8,0.95) 100%)",
    img: "/manus-storage/hero-jungle_a3fa6bfc.jpg",
    accent: "#2D9B6E",
  },
  {
    label: "KI-Assistent",
    sub: "Fragen & Helfen",
    icon: Sparkles,
    href: "/ai",
    bg: "linear-gradient(160deg, rgba(52,211,153,0.20) 0%, rgba(7,10,8,0.95) 100%)",
    img: "/manus-storage/hero-main_962b134d.png",
    accent: "#34D399",
  },
] as const;

/* ── Warum-Karten ── */
const WHY_CARDS = [
  { icon: ShieldCheck, title: "Werbefrei",           desc: "Kein Tracking, keine Werbung – nur Inhalte." },
  { icon: Heart,       title: "Mit Liebe zur Natur", desc: "Authentisch, bodenständig, fachlich fundiert." },
  { icon: BookOpen,    title: "Wissen statt Meinung", desc: "Kuratierte Guides aus verlässlichen Quellen." },
  { icon: Users,       title: "Community-getrieben", desc: "Gemeinsam wachsen statt allein gärtnern." },
] as const;

/* ── Parallax Hero Hook ── */
function useParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const y = window.scrollY * 0.35;
      ref.current.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return ref;
}

export default function Discover() {
  const { data: hub } = trpc.discover.hub.useQuery(undefined, { staleTime: 60_000 });
  const parallaxRef = useParallax();

  const featuredAccount = (hub as any)?.featuredAccount ?? null;
  const accountOfDay = featuredAccount ?? ((hub as any)?.topMembers?.[0] ?? null);

  return (
    <div style={{ background: "#070A08", minHeight: "100vh" }}>
      <SeoEnhanced
        title="Entdecken"
        path="/discover"
        description="Entdecke Botanik, Aquarien, Wissen und Community auf BlackwaterLeaf."
        keywords={["Aquaristik", "Aquascaping", "Schwarzwasser", "Channa", "Botanik", "Community"]}
      />

      {/* ══════════════════════════════════════════════════════
          3.1 HERO – Großes Naturbild, min-height 40vh, Glassmorphism-Overlay, Parallax
          ══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ minHeight: "45vh" }}>
        {/* Parallax-Bild */}
        <div
          ref={parallaxRef}
          className="absolute inset-0 anim-parallax-img"
          style={{ top: "-10%", bottom: "-10%" }}
        >
          <img
            src="/manus-storage/hero-jungle_a3fa6bfc.jpg"
            alt="BlackwaterLeaf Natur"
            className="img-cover"
            style={{ filter: "brightness(0.5) saturate(1.3)" }}
          />
        </div>

        {/* Gradient-Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(7,10,8,0.3) 0%, rgba(7,10,8,0.6) 60%, #070A08 100%)",
          }}
        />

        {/* Hero-Content mit Glassmorphism-Overlay */}
        <div className="relative px-5 pt-10 pb-8">
          <motion.p
            className="text-xs font-semibold uppercase mb-4"
            style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.18em" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            BLACKWATERLEAF COMMUNITY
          </motion.p>

          <motion.h1
            className="font-brand leading-none mb-6"
            style={{ fontSize: "clamp(2.8rem, 11vw, 4rem)", letterSpacing: "0.02em" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span style={{ color: "rgba(255,255,255,0.96)" }}>WISSEN.</span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.96)" }}>TEILEN.</span>
            <br />
            <span style={{ color: "#D4AF37" }}>WACHSEN.</span>
          </motion.h1>

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/discover">
              <motion.button
                className="py-2.5 px-6 rounded-full font-semibold text-sm anim-breathe"
                style={{
                  background: "#2D9B6E",
                  color: "#fff",
                  letterSpacing: "0.06em",
                  boxShadow: "0 0 20px rgba(45,155,110,0.40)",
                  fontSize: "0.8rem",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ENTDECKEN
              </motion.button>
            </Link>
            <Link href="/feed">
              <motion.button
                className="py-2.5 px-6 rounded-full font-semibold text-sm"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.9)",
                  letterSpacing: "0.06em",
                  fontSize: "0.8rem",
                }}
                whileTap={{ scale: 0.95 }}
              >
                COMMUNITY
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          3.2 SENSOR-LEISTE – horizontal scrollbar, Glassmorphism-Badges
          ══════════════════════════════════════════════════════ */}
      <div
        className="flex gap-2.5 overflow-x-auto px-4 py-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SENSOR_DATA.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              className="sensor-badge flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} strokeWidth={1.8} />
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {s.value}
                </span>
                <span className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {s.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════
          3.3 KATEGORIEN-GRID – 2×2 auf Mobile, 4-spaltig auf Desktop
          Jede Karte: Großes Hintergrundbild + Glassmorphism-Overlay unten
          ══════════════════════════════════════════════════════ */}
      <div className="px-4 pb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORY_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <GlassCard
                  hoverable
                  className="relative overflow-hidden cursor-pointer"
                  style={{ minHeight: 130, padding: 0 } as React.CSSProperties}
                >
                  {/* Hintergrundbild */}
                  <div className="absolute inset-0">
                    <img
                      src={card.img}
                      alt={card.label}
                      className="img-cover"
                      style={{ filter: "brightness(0.45) saturate(1.2)" }}
                    />
                    <div className="absolute inset-0" style={{ background: card.bg }} />
                  </div>

                  {/* Glassmorphism-Overlay unten */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-3 py-3"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: card.accent }} strokeWidth={2} />
                      <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>
                        {card.label}
                      </span>
                    </div>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {card.sub}
                    </span>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          3.4 FEATURED POST / ACCOUNT DES TAGES
          ══════════════════════════════════════════════════════ */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "#D4AF37" }} />
          <span
            className="text-xs font-bold uppercase"
            style={{ color: "#D4AF37", letterSpacing: "0.14em" }}
          >
            ACCOUNT DES TAGES
          </span>
        </div>

        {accountOfDay ? (
          <Link href={`/profile/${accountOfDay.userId ?? accountOfDay.id ?? ""}`}>
            <GlassCard hoverable reflex className="p-4 cursor-pointer">
              <div className="flex items-center gap-4">
                {/* Avatar mit Gold-Ring */}
                <div
                  className="flex-shrink-0 rounded-full p-0.5"
                  style={{
                    background: "linear-gradient(135deg, #D4AF37, rgba(212,175,55,0.4))",
                  }}
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={accountOfDay.userAvatarUrl ?? accountOfDay.avatarUrl ?? undefined} />
                    <AvatarFallback
                      className="text-lg font-bold"
                      style={{ background: "rgba(45,155,110,0.20)", color: "#2D9B6E" }}
                    >
                      {(accountOfDay.userName ?? accountOfDay.name ?? "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base leading-tight truncate" style={{ color: "rgba(255,255,255,0.95)" }}>
                    {accountOfDay.userName ?? accountOfDay.name ?? "Unbekannt"}
                  </p>
                  {accountOfDay.bio && (
                    <p className="text-sm mt-0.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {accountOfDay.bio}
                    </p>
                  )}
                  <p className="text-sm font-semibold mt-2 flex items-center gap-1" style={{ color: "#2D9B6E" }}>
                    Profil ansehen <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>
        ) : (
          <GlassCard reflex className="p-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(45,155,110,0.15)",
                  border: "2px solid rgba(212,175,55,0.5)",
                }}
              >
                <span className="text-xl font-bold font-brand" style={{ color: "#2D9B6E" }}>K</span>
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: "rgba(255,255,255,0.95)" }}>KiemenKumpel</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Aquaristiker mit Herz &amp; Verstand</p>
                <p className="text-sm font-semibold mt-1.5 flex items-center gap-1" style={{ color: "#2D9B6E" }}>
                  Profil ansehen <ArrowRight className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* ── WARUM BLACKWATERLEAF (2×2 Grid) ── */}
      <div className="px-4 pb-8">
        <h2 className="font-brand text-xl mb-4" style={{ color: "rgba(255,255,255,0.95)", letterSpacing: "0.06em" }}>
          WARUM BLACKWATERLEAF?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {WHY_CARDS.map(({ icon: Icon, title, desc }, i) => (
            <GlassCard key={title} hoverable className="p-4">
              <Icon className="w-5 h-5 mb-2" style={{ color: "#2D9B6E" }} strokeWidth={1.8} />
              <p className="font-semibold text-sm mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
