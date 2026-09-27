import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, LockKeyhole, Sparkles } from "lucide-react";

export default function Pro() {
  const auth = useAuth();
  const plans = trpc.billing.plans.useQuery();
  const membership = trpc.billing.me.useQuery(undefined, { enabled: auth.isAuthenticated });
  const pro = plans.data?.pro;
  if (!plans.data || !pro) return <div className="observatory-route observatory-route--botany"><p className="observatory-inline-state">PRO-ANGEBOT WIRD GELADEN …</p></div>;
  return <div className="observatory-route observatory-route--botany pro-page">
    <ObservatoryContextHeader tone="botany" eyebrow="BLACKWATERLEAF · PRO" title="MEHR PFLEGE. MEHR ÜBERBLICK." subtitle="Die Kern-Community bleibt frei. Pro finanziert die privaten Werkzeuge, KI-Auswertung und sichere Datenarbeit." icon={Sparkles} badge="AB €4,99 / MONAT" />
    <section className="pro-page__status observatory-data-panel"><div><span className="eyebrow">DEIN STATUS</span><h2>{membership.data?.active ? "PRO AKTIV" : "FREE · NOCH KEIN ABO"}</h2></div><span className="system-chip"><LockKeyhole size={13} /> Zahlung wird nach Anbieteranschluss aktiviert</span></section>
    <div className="pro-page__plans">
      <article className="pro-plan-card pro-plan-card--free"><span className="eyebrow">FÜR ALLE</span><h2>Free</h2><p>Entdecken, lernen und Teil der Community sein.</p><span className="system-chip">COMMUNITY BLEIBT KOSTENLOS</span><ul>{plans.data.free.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul></article>
      <article className="pro-plan-card pro-plan-card--pro"><span className="eyebrow">FÜR DEINE DATEN</span><h2>BlackWaterLeaf Pro</h2><p>Mehr Platz, mehr Verlauf und mehr Unterstützung für deine Anlagen.</p><div className="pro-plan-card__price"><strong>€{pro.monthlyPriceEur.toFixed(2).replace(".", ",")}</strong><span>/ Monat<br />oder €{pro.yearlyPriceEur.toFixed(2).replace(".", ",")} / Jahr</span></div><ul>{pro.features.map(feature => <li key={feature.key}><Check size={15} /> <span><strong>{feature.label}</strong><small>{feature.description}</small></span></li>)}</ul><button className="primary-action" type="button" disabled>PRO WIRD VORBEREITET</button></article>
      <article className="pro-plan-card pro-plan-card--later"><span className="eyebrow">SPÄTER</span><h2>Creator / Expert</h2><p>Für Fachvorträge, exklusive LIVE-Inhalte und professionelle Hosts.</p><ul>{plans.data.creator.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul><span className="system-chip">Wird mit LIVE freigeschaltet</span></article>
    </div>
    <p className="pro-page__note">Keine Funktionen werden heimlich gesperrt. Vor dem Start der Zahlung werden Anbieter, Kündigung, Belege und Datenschutz transparent ergänzt.</p>
  </div>;
}
