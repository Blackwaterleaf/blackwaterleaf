import { Link } from "wouter";
import { ReactNode } from "react";

const IMG_LOGO = "/manus-storage/logo-circle_c176197b.png";

/**
 * Gemeinsames Layout für die Rechtsseiten (Impressum, Datenschutz, AGB).
 * Dunkles Markendesign, zurück-Link und einheitliche Typografie.
 */
export default function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#0D110E", color: "rgba(255,255,255,0.85)" }}
    >
      {/* Kopfzeile */}
      <header
        style={{
          background: "#070A08",
          borderBottom: "1px solid #161C19",
        }}
      >
        <div className="max-w-[900px] mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80"
          >
            <img src={IMG_LOGO} alt="BL" className="w-8 h-8 rounded-full" />
            <span className="font-brand text-sm tracking-widest" style={{ color: "#2D9B6E" }}>
              BLACKWATERLEAF
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs transition-colors duration-200 hover:text-primary"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </header>

      {/* Inhalt */}
      <main className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="font-brand text-3xl md:text-4xl mb-2" style={{ color: "rgba(255,255,255,0.95)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.50)" }}>
            {subtitle}
          </p>
        )}
        <div className="legal-content space-y-6 leading-relaxed text-[15px]">{children}</div>

        {/* Querverlinkung */}
        <nav className="mt-14 pt-6 flex flex-wrap gap-5" style={{ borderTop: "1px solid #161C19" }}>
          <Link href="/impressum" className="text-xs hover:text-primary" style={{ color: "rgba(255,255,255,0.50)" }}>
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-xs hover:text-primary" style={{ color: "rgba(255,255,255,0.50)" }}>
            Datenschutz
          </Link>
          <Link href="/agb" className="text-xs hover:text-primary" style={{ color: "rgba(255,255,255,0.50)" }}>
            Nutzungsbedingungen
          </Link>
        </nav>
      </main>
    </div>
  );
}
