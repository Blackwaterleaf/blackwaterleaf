import { Building2, Mail, Phone, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { CONTACTS } from "@/lib/contact";

export default function Legal() {
  const [location] = useLocation();
  const isImprint = location === "/impressum";

  if (isImprint) {
    return (
      <main className="legal-page observatory-route observatory-route--botany">
        <section className="legal-page__hero observatory-data-panel">
          <Building2 size={24} />
          <span className="eyebrow">BLACKWATERLEAF · IMPRESSUM</span>
          <h1>Impressum</h1>
          <p>Anbieterinformationen und geschäftliche Kontaktmöglichkeit für BlackWaterLeaf.</p>
        </section>
        <section className="legal-page__grid">
          <article className="observatory-data-panel legal-card">
            <h2>Anbieter</h2>
            <p><strong>BlackWaterLeaf</strong></p>
            <address>BlackWaterLeaf<br />Bönninghardtstraße 94<br />46519 Bönninghardt<br />Deutschland</address>
            <p>BlackWaterLeaf Organisation of Loyalty</p>
            <p className="legal-card__hint">Bitte ergänze vor dem öffentlichen Regelbetrieb noch die rechtlich verbindliche Betreiberform, den vollständigen Namen der verantwortlichen Person und – falls vorhanden – Register- oder Umsatzsteuerangaben.</p>
          </article>
          <article className="observatory-data-panel legal-card">
            <h2>Kontakt</h2>
            <a href={CONTACTS.imprint.href}><Mail size={16} />{CONTACTS.imprint.email}</a>
            <a href={CONTACTS.imprint.phoneHref}><Phone size={16} />{CONTACTS.imprint.phone}</a>
            <a href={CONTACTS.business.href}><Mail size={16} />Geschäftlich: {CONTACTS.business.email}</a>
          </article>
        </section>
        <LegalBackLinks />
      </main>
    );
  }

  return (
    <main className="legal-page observatory-route observatory-route--botany">
      <section className="legal-page__hero observatory-data-panel">
        <ShieldCheck size={24} />
        <span className="eyebrow">BLACKWATERLEAF · DATENSCHUTZ</span>
        <h1>Datenschutz</h1>
        <p>Kontaktstelle für Datenschutzfragen, Auskunft, Berichtigung und Löschanfragen.</p>
      </section>
      <section className="legal-page__grid">
        <article className="observatory-data-panel legal-card">
          <h2>Datenschutzkontakt</h2>
          <p>Für Datenschutzanfragen erreichst du BlackWaterLeaf direkt unter:</p>
          <a href={CONTACTS.privacy.href}><Mail size={16} />{CONTACTS.privacy.email}</a>
          <a href={CONTACTS.privacy.phoneHref}><Phone size={16} />{CONTACTS.privacy.phone}</a>
        </article>
        <article className="observatory-data-panel legal-card">
          <h2>Deine Rechte</h2>
          <p>Bitte beschreibe dein Anliegen möglichst konkret. Anfragen zu Auskunft, Berichtigung, Löschung oder Widerruf werden geprüft und sicher bearbeitet.</p>
          <a href={CONTACTS.business.href}><Mail size={16} />Geschäftliche Fragen: {CONTACTS.business.email}</a>
        </article>
      </section>
      <LegalBackLinks />
    </main>
  );
}

function LegalBackLinks() {
  return <nav className="legal-page__links" aria-label="Rechtliche Seiten"><Link href="/">Zur Startseite</Link><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link></nav>;
}
