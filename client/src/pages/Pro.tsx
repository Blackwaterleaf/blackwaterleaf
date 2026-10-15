import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, CheckCircle2, Coins, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function Pro() {
  const auth = useAuth();
  const plans = trpc.billing.plans.useQuery();
  const membership = trpc.billing.me.useQuery(undefined, { enabled: auth.isAuthenticated });
  const history = trpc.billing.history.useQuery(undefined, { enabled: auth.isAuthenticated });
  const checkoutSuccess = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("checkout") === "success";
  const checkoutSessionId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("session_id") : null;
  const checkoutConfirmation = trpc.billing.checkoutConfirmation.useQuery({ sessionId: checkoutSessionId ?? "" }, { enabled: auth.isAuthenticated && checkoutSuccess && Boolean(checkoutSessionId), retry: 2, refetchOnWindowFocus: false });
  const checkout = trpc.billing.createCheckout.useMutation();
  const utils = trpc.useUtils();
  const [notice, setNotice] = useState<string | null>(null);
  const pro = plans.data?.pro;
  const credits = plans.data?.creditPacks ?? [];

  useEffect(() => {
    if (!checkoutConfirmation.data?.credited) return;
    void utils.billing.me.invalidate();
    void utils.billing.history.invalidate();
  }, [checkoutConfirmation.data?.credited, utils]);

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
  const accessLabel = membership.data?.accessSource === "admin" ? "ADMIN · VOLLZUGRIFF" : membership.data?.accessSource === "admin_grant" ? "ADMIN-FREIGABE · PRO AKTIV" : active ? "STRIPE · PRO AKTIV" : "FREE · KAUF ODER FREIGABE ERFORDERLICH";
  return <div className="observatory-route observatory-route--botany pro-page">
    <ObservatoryContextHeader tone="botany" eyebrow="BLACKWATERLEAF · PRO" title="MEHR PFLEGE. MEHR ÜBERBLICK." subtitle="Die Kern-Community bleibt frei. KI-Bestimmungen sind transparent begrenzt und können bei Bedarf als Credits ergänzt werden." icon={Sparkles} badge={active ? "PRO AKTIV" : "€9,99 / MONAT"} />
    <section className="pro-page__status observatory-data-panel">
      <div><span className="eyebrow">DEIN STATUS</span><h2>{active ? "PRO AKTIV" : "FREE · TRANSPARENT BEGRENZT"}</h2><p>{accessLabel} · {membership.data ? `${membership.data.freeIdentificationsRemaining} kostenlose Pflanzenbestimmungen heute · ${membership.data.aiCredits} KI-Credits verfügbar` : "Kontingent wird geladen …"}</p></div>
      <span className="system-chip"><LockKeyhole size={13} /> {membership.data?.paymentReady ? "Zahlung sicher verfügbar" : "Zahlung wird vorbereitet"}</span>
    </section>
    {checkoutSuccess && checkoutSessionId ? <section className={`pro-checkout-success observatory-data-panel ${checkoutConfirmation.isError ? "pro-checkout-success--error" : ""}`} role="status" aria-live="polite">
      <div className="pro-checkout-success__icon"><CheckCircle2 size={24} /></div>
      <div className="pro-checkout-success__copy">
        <span className="eyebrow">STRIPE · ZAHLUNG BESTÄTIGT</span>
        <h2>{checkoutConfirmation.data?.credited ? `${checkoutConfirmation.data.credits} Credits gutgeschrieben` : checkoutConfirmation.isError ? "Gutschrift konnte nicht geprüft werden" : "Credits werden gutgeschrieben …"}</h2>
        <p>{checkoutConfirmation.data?.credited ? `Deine ${checkoutConfirmation.data.credits} KI-Bestimmungen sind jetzt in deinem Konto verfügbar. Die Kaufhistorie wurde aktualisiert.` : checkoutConfirmation.isError ? "Bitte lade die Seite erneut oder prüfe deine Kaufhistorie. Es wurde nichts doppelt berechnet." : "Deine Zahlung ist bestätigt. Die sichere serverseitige Gutschrift wird gerade abgeschlossen."}</p>
      </div>
      {checkoutConfirmation.data?.credited ? <span className="system-chip">ERFOLGREICH</span> : null}
    </section> : null}
    {!active ? <section className="pro-page__welcome observatory-data-panel" aria-labelledby="pro-welcome-title"><div><span className="eyebrow">FÜR FREE-MITGLIEDER</span><h2 id="pro-welcome-title">Mehr Raum für deine Beobachtungen</h2><p>Free bleibt der Einstieg: Katalog, Community, Basis-Karten und <strong>10 KI-Bestimmungen pro Tag</strong> bleiben verfügbar. Pro ergänzt 300 Bestimmungen pro Monat, mehr private Anlagen, Pflegehistorie sowie Export und Backup.</p></div><a className="primary-action" href="#pro-plan">PRO-VORTEILE ANSEHEN <Sparkles size={15} /></a></section> : null}
    {!active ? <section className="pro-page__credit-panel observatory-data-panel">
      <div><span className="eyebrow">KI-BESTIMMUNGEN</span><h2>Credits nach Bedarf</h2><p>Das kostenlose Tageskontingent bleibt erhalten. Gekaufte Credits verfallen nicht und werden erst nach erfolgreicher Stripe-Zahlung gutgeschrieben.</p></div>
      <div className="pro-credit-grid">{credits.map(pack => <article className="pro-credit-card" key={pack.key}><Coins size={18} /><strong>{pack.credits}</strong><span>Bestimmungen</span><b>€{pack.priceEur.toFixed(2).replace(".", ",")}</b><button className="primary-action" type="button" disabled={checkout.isPending || membership.data?.paymentReady === false} onClick={() => void startCheckout("credits", pack.key)}>CREDITS KAUFEN</button></article>)}</div>
    </section> : <section className="pro-page__active-note observatory-data-panel" role="status"><span className="eyebrow">BLACKWATERLEAF · PRO</span><h2>DEIN PRO-ZUGANG IST AKTIV.</h2><p>Preise und Upgrade-Angebote sind für aktive Pro-Konten ausgeblendet. Deine monatlichen Bestimmungen, Anlagen, Pflegehistorie und Exportfunktionen bleiben freigeschaltet.</p></section>}
    <section className="pro-page__history observatory-data-panel">
      <div><span className="eyebrow">PRIVATE · KAUFHISTORIE</span><h2>DEINE CREDIT-KÄUFE</h2><p>Nur abgeschlossene Stripe-Zahlungen werden hier als Credits verbucht. Beträge werden aus dem jeweiligen Paket angezeigt; Kartendaten bleiben bei Stripe.</p></div>
      {!auth.isAuthenticated ? <p className="pro-page__history-empty">Melde dich an, um deine Kaufhistorie zu sehen.</p> : history.isLoading ? <p className="pro-page__history-empty">KAUFHISTORIE WIRD GELADEN …</p> : history.isError ? <p className="pro-page__history-empty">Die Kaufhistorie konnte gerade nicht geladen werden.</p> : history.data?.length ? <ul className="pro-purchase-history">{history.data.map(entry => { const pack = credits.find(item => item.key === entry.packKey); const completed = entry.status === "completed"; return <li className="pro-purchase-history__row" key={entry.id}><div><strong>{pack?.label ?? `${entry.credits} KI-Credits`}</strong><span>{entry.credits} KI-Bestimmungen · {pack ? `€${pack.priceEur.toFixed(2).replace(".", ",")}` : "Paketpreis"}</span></div><div className="pro-purchase-history__meta"><span className={`system-chip ${completed ? "" : "system-chip--pending"}`}>{completed ? "ABGESCHLOSSEN" : "AUSSTEHEND"}</span><time dateTime={new Date(entry.createdAt).toISOString()}>{new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(entry.createdAt))}</time></div></li>; })}</ul> : <p className="pro-page__history-empty">Noch keine Credit-Käufe. Dein kostenloses Tageskontingent bleibt aktiv.</p>}
    </section>
    <div className="pro-page__plans">
      <article className="pro-plan-card pro-plan-card--free"><span className="eyebrow">FÜR ALLE</span><h2>Free</h2><p>Entdecken, lernen und Teil der Community sein.</p><span className="system-chip">COMMUNITY BLEIBT KOSTENLOS</span><ul>{plans.data.free.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul></article>
      <article id="pro-plan" className="pro-plan-card pro-plan-card--pro"><span className="eyebrow">FÜR DEINE DATEN</span><h2>BlackWaterLeaf Pro</h2><p>Mehr Platz, mehr Verlauf und 300 KI-Bestimmungen pro Monat.</p><div className="pro-plan-card__price"><strong>€{pro.monthlyPriceEur.toFixed(2).replace(".", ",")}</strong><span>/ Monat<br />oder €{pro.yearlyPriceEur.toFixed(2).replace(".", ",")} / Jahr</span></div><ul>{pro.features.map(feature => <li key={feature.key}><Check size={15} /> <span><strong>{feature.label}</strong><small>{feature.description}</small></span></li>)}</ul><div className="pro-plan-actions"><button className="primary-action" type="button" disabled={checkout.isPending || membership.data?.paymentReady === false || active} onClick={() => void startCheckout("pro_monthly")}>{active ? "PRO AKTIV" : "MONATLICH STARTEN"}</button><button className="secondary-action" type="button" disabled={checkout.isPending || membership.data?.paymentReady === false || active} onClick={() => void startCheckout("pro_yearly")}>JÄHRLICH SPAREN</button></div></article>
      <article className="pro-plan-card pro-plan-card--later"><span className="eyebrow">SPÄTER</span><h2>Creator / Expert</h2><p>Für Fachvorträge, exklusive LIVE-Inhalte und professionelle Hosts.</p><ul>{plans.data.creator.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul><span className="system-chip">Wird mit LIVE freigeschaltet</span></article>
    </div>
    {notice ? <p className="pro-page__note" role="status">{notice}</p> : null}
    <p className="pro-page__note">Pro wird ausschließlich durch Stripe oder eine dokumentierte Host-Freigabe aktiviert. Dein Beitrag unterstützt den Betrieb der IONOS-KI, Server- und Speicherinfrastruktur. Admins besitzen automatisch alle Rechte; Kontingente, Credits, Zahlung und Gutschrift bleiben serverseitig nachvollziehbar.</p>
  </div>;
}
