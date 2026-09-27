import { Handshake, Mail } from "lucide-react";
import { CONTACTS } from "@/lib/contact";

export default function PartnerInquiryCard() {
  return (
    <section className="partner-inquiry-card observatory-data-panel" aria-labelledby="partner-inquiry-title">
      <div className="partner-inquiry-card__icon"><Handshake size={22} /></div>
      <div className="partner-inquiry-card__copy">
        <span className="eyebrow">PARTNER WERDEN</span>
        <h2 id="partner-inquiry-title">Mit BlackWaterLeaf zusammenarbeiten</h2>
        <p>Du möchtest Produkte, Fachwissen oder ein Projekt als Partner einbringen? Schreib uns direkt. Wir prüfen jede Anfrage persönlich.</p>
      </div>
      <a className="primary-action partner-inquiry-card__action" href={CONTACTS.partner.href}>
        <Mail size={16} /> Partneranfrage senden
      </a>
    </section>
  );
}
