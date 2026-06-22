import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Bot, Compass, Droplets, Leaf, Sparkles, Users, Trophy } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Leaf,
    title: "Pflanzen dokumentieren",
    description:
      "Lege detaillierte Profile für jede Pflanze an – mit Pflegeparametern, Fotos und einer chronologischen Timeline.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Droplets,
    title: "Aquarien verwalten",
    description:
      "Protokolliere Wasserwerte, Besatz und Ereignisse. Verfolge die Entwicklung deines Aquariums über Zeit.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Bot,
    title: "KI-Assistent",
    description:
      "Bestimme Pflanzen, diagnostiziere Probleme und erhalte individuelle Pflegeempfehlungen – rund um die Uhr.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Teile deine Fortschritte, entdecke Inspirationen und tausche dich mit Gleichgesinnten aus.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Compass,
    title: "Entdecken",
    description:
      "Durchsuche tausende Pflanzen- und Aquarienprofile. Finde Inspiration für dein nächstes Projekt.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "Sammle XP, steige im Level auf und verdiene Abzeichen. Tägliche Challenges halten dich motiviert.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/feed");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.07 0.008 240)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-foreground overflow-x-hidden"
      style={{ background: "oklch(0.07 0.008 240)" }}
    >
      {/* ── Navigation ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        style={{
          background: "oklch(0.08 0.009 240 / 0.92)",
          borderBottom: "1px solid oklch(0.18 0.010 240)",
        }}
      >
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <img
              src="/manus-storage/bl-emblem_76cd28a6.png"
              alt="BL"
              className="w-7 h-7 rounded-lg"
            />
            <span className="font-display font-semibold text-base tracking-tight gradient-text-gold">
              BlackwaterLeaf
            </span>
          </div>
          <Button size="sm" asChild className="press-active btn-glow">
            <a href={getLoginUrl()}>Jetzt starten</a>
          </Button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-36 pb-28 px-4 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(ellipse, oklch(0.68 0.16 152 / 0.15) 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-32 right-1/4 w-[500px] h-[400px] rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(ellipse, oklch(0.78 0.12 80 / 0.10) 0%, transparent 70%)" }}
          />
        </div>

        <div className="container relative text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 animate-fade-in"
            style={{
              background: "oklch(0.68 0.16 152 / 0.10)",
              border: "1px solid oklch(0.68 0.16 152 / 0.25)",
              color: "oklch(0.68 0.16 152)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            Das Betriebssystem für Pflanzen &amp; Aquarien
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold leading-tight tracking-tight mb-6 animate-slide-up">
            Deine Sammlung.
            <br />
            <span className="gradient-text-gold italic">Perfekt dokumentiert.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-slide-up stagger-1 leading-relaxed">
            BlackwaterLeaf vereint Community, Pflege-Tracking und KI-Unterstützung in einer
            eleganten Plattform für Aquaristik- und Pflanzenliebhaber.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up stagger-2">
            <Button size="lg" asChild className="press-active w-full sm:w-auto btn-glow">
              <a href={getLoginUrl()}>Kostenlos starten</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
              style={{
                background: "transparent",
                border: "1px solid oklch(0.30 0.010 240)",
                color: "oklch(0.92 0.008 80)",
              }}
            >
              <a href="#features">Mehr erfahren</a>
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-14 animate-fade-in stagger-3">
            {[
              { label: "Pflanzenarten", value: "500+" },
              { label: "Community", value: "Aktiv" },
              { label: "KI-gestützt", value: "24/7" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-display font-semibold gradient-text-gold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-semibold mb-3 gradient-text-gold">
              Alles was du brauchst
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Von der ersten Pflanzung bis zur blühenden Community – BlackwaterLeaf begleitet
              dich auf jedem Schritt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`card-premium p-6 rounded-xl animate-fade-in stagger-${Math.min(i + 1, 5)}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 px-4">
        <div className="container">
          <div
            className="relative rounded-2xl p-10 text-center overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.12 0.015 152 / 0.5), oklch(0.10 0.010 240))",
              border: "1px solid oklch(0.68 0.16 152 / 0.25)",
            }}
          >
            {/* Ambient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, oklch(0.68 0.16 152 / 0.08) 0%, transparent 60%)",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl font-display font-semibold mb-3 gradient-text-gold">
                Bereit loszulegen?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Tritt der Community bei und dokumentiere deine Sammlung mit KI-Unterstützung.
              </p>
              <Button size="lg" asChild className="press-active btn-glow">
                <a href={getLoginUrl()}>Jetzt kostenlos registrieren</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-8 px-4"
        style={{ borderTop: "1px solid oklch(0.18 0.010 240)" }}
      >
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="/manus-storage/bl-emblem_76cd28a6.png"
              alt="BL"
              className="w-5 h-5 rounded"
            />
            <span className="font-display font-medium text-foreground">BlackwaterLeaf</span>
          </div>
          <p>© 2025 BlackwaterLeaf. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
