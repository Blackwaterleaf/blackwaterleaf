import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { Home, Leaf, Search } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="reference-page reference-page--botany reference-not-found">
      <LiveSensorStrip compact />
      <ReferenceHero
        tone="botany"
        image={REFERENCE_ASSETS.botany}
        eyebrow="ROUTE / 404"
        title="DIESER PFAD ENDET HIER."
        subtitle="Die angefragte Seite existiert nicht oder wurde an einen anderen Ort verschoben. Deine privaten Daten bleiben unverändert."
        icon={Search}
        badge="NAVIGATION"
      />
      <ReferenceEmptyState
        tone="botany"
        state="error"
        code="ROUTE / 404"
        title="SEITE NICHT GEFUNDEN"
        body="Kehre zur Startseite zurück oder entdecke die vorhandenen Naturwelten. Es wurden keine Inhalte, Messwerte oder Konten ersetzt."
        action={<Link className="primary-action" href="/"><Home size={16} />ZUR STARTSEITE</Link>}
      />
      <section className="reference-recovery-grid" aria-label="Verfügbare Ziele">
        <Link href="/explore"><Leaf size={17} /><span><strong>ENTDECKEN</strong><small>Welten und Wissen öffnen</small></span></Link>
        <Link href="/community"><Search size={17} /><span><strong>COMMUNITY</strong><small>Freigegebene Momente ansehen</small></span></Link>
      </section>
    </div>
  );
}
