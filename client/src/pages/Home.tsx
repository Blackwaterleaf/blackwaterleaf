import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Bot, Compass, Droplets, Leaf, Sparkles, Users } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Leaf,
    title: "Pflanzen dokumentieren",
    description: "Lege detaillierte Profile für jede Pflanze an – mit Pflegeparametern, Fotos und einer chronologischen Timeline.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Droplets,
    title: "Aquarien verwalten",
    description: "Protokolliere Wasserwerte, Besatz und Ereignisse. Verfolge die Entwicklung deines Aquariums über Zeit.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Bot,
    title: "KI-Assistent",
    description: "Bestimme Pflanzen, diagnostiziere Probleme und erhalte individuelle Pflegeempfehlungen – rund um die Uhr.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Community",
    description: "Teile deine Fortschritte, entdecke Inspirationen und tausche dich mit Gleichgesinnten aus.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Compass,
    title: "Entdecken",
    description: "Durchsuche tausende Pflanzen- und Aquarienprofile. Finde Inspiration für dein nächstes Projekt.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Sparkles,
    title: "Wachstum verfolgen",
    description: "Foto-Timelines zeigen die Entwicklung deiner Pflanzen und Aquarien – von der ersten Pflanzung bis heute.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img src="/manus-storage/bl-emblem_76cd28a6.png" alt="BL" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-semibold text-base tracking-tight">BlackwaterLeaf</span>
          </div>
          <Button size="sm" asChild className="press-active">
            <a href={getLoginUrl()}>Jetzt starten</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3" />
            Das Betriebssystem für Pflanzen & Aquarien
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold leading-tight tracking-tight mb-6 animate-slide-up">
            Deine Sammlung.
            <br />
            <span className="gradient-text italic">Perfekt dokumentiert.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-slide-up stagger-1">
            BlackwaterLeaf vereint Community, Pflege-Tracking und KI-Unterstützung in einer eleganten Plattform für Aquaristik- und Pflanzenliebhaber.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up stagger-2">
            <Button size="lg" asChild className="press-active w-full sm:w-auto">
              <a href={getLoginUrl()}>
                Kostenlos starten
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
              <a href="#features">Mehr erfahren</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-semibold mb-3">Alles was du brauchst</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Von der ersten Pflanzung bis zur blühenden Community – BlackwaterLeaf begleitet dich auf jedem Schritt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`p-6 rounded-xl border border-border/50 bg-card hover-card animate-fade-in stagger-${Math.min(i + 1, 5)}`}
              >
                <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="relative rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-display font-semibold mb-3">Bereit loszulegen?</h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Tritt der Community bei und dokumentiere deine Sammlung mit KI-Unterstützung.
              </p>
              <Button size="lg" asChild className="press-active">
                <a href={getLoginUrl()}>Jetzt kostenlos registrieren</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="font-display font-medium text-foreground">BlackwaterLeaf</span>
          </div>
          <p>© 2024 BlackwaterLeaf. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
