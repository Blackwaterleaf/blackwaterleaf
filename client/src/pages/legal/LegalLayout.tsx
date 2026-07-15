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
      style={{ background: "oklch(0.11 0.008 200)", color: "oklch(0.85 0.01 200)" }}
    >
      {/* Kopfzeile */}
      <header
        style={{
          background: "oklch(0.08 0.008 200)",
          borderBottom: "1px solid oklch(0.16 0.008 200)",
        }}
      >
        <div className="max-w-[900px] mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80"
          >
            <img src={IMG_LOGO} alt="BL" className="w-8 h-8 rounded-full" />
            <span className="font-brand text-sm tracking-widest" style={{ color: "oklch(0.65 0.05 160)" }}>
              BLACKWATERLEAF
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs transition-colors duration-200 hover:text-primary"
            style={{ color: "oklch(0.55 0.01 200)" }}
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </header>

      {/* Inhalt */}
      <main className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="font-brand text-3xl md:text-4xl mb-2" style={{ color: "oklch(0.95 0.01 200)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mb-8" style={{ color: "oklch(0.5 0.01 200)" }}>
            {subtitle}
          </p>
        )}
        <div className="legal-content space-y-6 leading-relaxed text-[15px]">{children}</div>

        {/* Querverlinkung */}
        <nav className="mt-14 pt-6 flex flex-wrap gap-5" style={{ borderTop: "1px solid oklch(0.16 0.009 200)" }}>
          <Link href="/impressum" className="text-xs hover:text-primary" style={{ color: "oklch(0.5 0.01 200)" }}>
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-xs hover:text-primary" style={{ color: "oklch(0.5 0.01 200)" }}>
            Datenschutz
          </Link>
          <Link href="/agb" className="text-xs hover:text-primary" style={{ color: "oklch(0.5 0.01 200)" }}>
            Nutzungsbedingungen
          </Link>
        </nav>
      </main>
    </div>
  );
}
