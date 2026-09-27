import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, Coins, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Pro() {
  const auth = useAuth();
  const plans = trpc.billing.plans.useQuery();
  const membership = trpc.billing.me.useQuery(undefined, { enabled: auth.isAuthenticated });
  const checkout = trpc.billing.createCheckout.useMutation();
  const [notice, setNotice] = useState<string | null>(null);
  const pro = plans.data?.pro;
  const credits = plans.data?.creditPacks ?? [];

  const startCheckout = async (kind: "credits" | "pro_monthly" | "pro_yearly", packKey?: string) => {
    setNotice(null);
    try {
      const session = await checkout.mutateAsync({ kind, packKey });
      window.open(session.url, "_blank", "noopener,noreferrer");
      setNotice("Der sichere Stripe-Checkout wurde in einem neuen Tab geöffnet. Credits werden nach bestätigter Zahlung automatisch gutgeschrieben.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "checkout_failed";
      setNotice(message.includes("payments_not_configured") ? "Der Kauf ist vorbereitet, aber der Zahlungsanbieter muss noch in den Projekteinstellungen aktiviert werden." : "Der Checkout konnte nicht gestartet werden. Bitte später erneut versuchen.");
    }
  };

  if (!plans.data || !pro) return <div className="observatory-route observatory-route--botany"><p className="observatory-inline-state">PRO-ANGEBOT WIRD GELADEN …</p></div>;
  const active = membership.data?.active;
  return <div className="observatory-route observatory-route--botany pro-page">
    <ObservatoryContextHeader tone="botany" eyebrow="BLACKWATERLEAF · PRO" title="MEHR PFLEGE. MEHR ÜBERBLICK." subtitle="Die Kern-Community bleibt frei. KI-Bestimmungen sind transparent begrenzt und können bei Bedarf als Credits ergänzt werden." icon={Sparkles} badge="AB €4,99 / MONAT" />
    <section className="pro-page__status observatory-data-panel">
      <div><span className="eyebrow">DEIN STATUS</span><h2>{active ? "PRO AKTIV" : "FREE · TRANSPARENT BEGRENZT"}</h2><p>{membership.data ? `${membership.data.freeIdentificationsRemaining} kostenlose Pflanzenbestimmungen heute · ${membership.data.aiCredits} KI-Credits verfügbar` : "Kontingent wird geladen …"}</p></div>
      <span className="system-chip"><LockKeyhole size={13} /> {membership.data?.paymentReady ? "Zahlung sicher verfügbar" : "Zahlung wird vorbereitet"}</span>
    </section>
    <section className="pro-page__credit-panel observatory-data-panel">
      <div><span className="eyebrow">KI-BESTIMMUNGEN</span><h2>Credits nach Bedarf</h2><p>Das kostenlose Tageskontingent bleibt erhalten. Gekaufte Credits verfallen nicht und werden erst nach erfolgreicher Stripe-Zahlung gutgeschrieben.</p></div>
      <div className="pro-credit-grid">{credits.map(pack => <article className="pro-credit-card" key={pack.key}><Coins size={18} /><strong>{pack.credits}</strong><span>Bestimmungen</span><b>€{pack.priceEur.toFixed(2).replace(".", ",")}</b><button className="primary-action" type="button" disabled={checkout.isPending || membership.data?.paymentReady === false} onClick={() => void startCheckout("credits", pack.key)}>CREDITS KAUFEN</button></article>)}</div>
    </section>
    <div className="pro-page__plans">
      <article className="pro-plan-card pro-plan-card--free"><span className="eyebrow">FÜR ALLE</span><h2>Free</h2><p>Entdecken, lernen und Teil der Community sein.</p><span className="system-chip">COMMUNITY BLEIBT KOSTENLOS</span><ul>{plans.data.free.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul></article>
      <article className="pro-plan-card pro-plan-card--pro"><span className="eyebrow">FÜR DEINE DATEN</span><h2>BlackWaterLeaf Pro</h2><p>Mehr Platz, mehr Verlauf und 60 KI-Bestimmungen pro Monat.</p><div className="pro-plan-card__price"><strong>€{pro.monthlyPriceEur.toFixed(2).replace(".", ",")}</strong><span>/ Monat<br />oder €{pro.yearlyPriceEur.toFixed(2).replace(".", ",")} / Jahr</span></div><ul>{pro.features.map(feature => <li key={feature.key}><Check size={15} /> <span><strong>{feature.label}</strong><small>{feature.description}</small></span></li>)}</ul><div className="pro-plan-actions"><button className="primary-action" type="button" disabled={checkout.isPending || membership.data?.paymentReady === false || active} onClick={() => void startCheckout("pro_monthly")}>{active ? "PRO AKTIV" : "MONATLICH STARTEN"}</button><button className="secondary-action" type="button" disabled={checkout.isPending || membership.data?.paymentReady === false || active} onClick={() => void startCheckout("pro_yearly")}>JÄHRLICH SPAREN</button></div></article>
      <article className="pro-plan-card pro-plan-card--later"><span className="eyebrow">SPÄTER</span><h2>Creator / Expert</h2><p>Für Fachvorträge, exklusive LIVE-Inhalte und professionelle Hosts.</p><ul>{plans.data.creator.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul><span className="system-chip">Wird mit LIVE freigeschaltet</span></article>
    </div>
    {notice ? <p className="pro-page__note" role="status">{notice}</p> : null}
    <p className="pro-page__note">Keine Funktionen werden heimlich gesperrt. Kontingente, Credits, Zahlung und Gutschrift bleiben serverseitig nachvollziehbar.</p>
  </div>;
}
