import { ObservatoryContextHeader, ObservatoryRoutePage } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Beaker, CheckCircle2, Compass, LockKeyhole, MapPinned, RadioTower, Sparkles } from "lucide-react";
import { Link } from "wouter";

function realmLabel(realm: string | null) {
  return realm === "aquarium" ? "AQUARISTIK" : realm === "terrarium" ? "TERRARISTIK" : realm === "botany" ? "BOTANIK" : "ALLE BEREICHE";
}

export default function Missions() {
  const auth = useAuth();
  const published = trpc.challenges.listPublished.useQuery({}, { retry: false });
  const progress = trpc.challenges.myProgress.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const join = trpc.challenges.join.useMutation({ onSuccess: () => void progress.refetch() });
  const missions = published.data ?? [];
  const progressById = new Map((progress.data ?? []).map(item => [item.challengeId, item]));

  return <ObservatoryRoutePage tone="botany" className="missions-page">
    <ObservatoryContextHeader tone="botany" eyebrow="FELDMISSIONEN · ECHTE DATEN" title="BEOBACHTEN. DOKUMENTIEREN. LERNEN." subtitle="Zeitlich begrenzte Fachaufgaben verbinden Beobachtungen, Quellen und verantwortungsvolle Beiträge. Es werden nur serverseitig veröffentlichte Missionen angezeigt." icon={Compass} badge="P1 · AKTIV">
      <Link className="secondary-action" href="/explore#map"><MapPinned size={15} />KARTE ÖFFNEN</Link>
    </ObservatoryContextHeader>

    <section className="missions-truth observatory-data-panel" aria-label="Datenstatus">
      <div><span className="eyebrow">DATENSTATUS · TRANSPARENT</span><h2>KEINE ERFUNDENEN MESSWERTE</h2><p>Missionen zeigen nur gespeicherte Aufgaben, deinen echten Fortschritt und veröffentlichte Beobachtungen. Labor- und eDNA-Partnerschaften bleiben bis zur fachlichen Freigabe außerhalb des aktiven Produkts.</p></div>
      <div className="missions-truth__signals"><span><RadioTower size={16} />OBSERVATORY</span><span><Beaker size={16} />SIGNALSTATUS: {missions.length ? "BEREIT" : "KEINE AKTIVE MISSION"}</span></div>
    </section>

    {!auth.isAuthenticated ? <section className="missions-login observatory-data-panel"><LockKeyhole size={24} /><div><span className="eyebrow">MITGLIEDERBEREICH</span><h2>MISSIONEN ÖFFNEN</h2><p>Öffentliche Missionen kannst du ansehen. Melde dich an, um beizutreten und deinen persönlichen Fortschritt serverseitig zu speichern.</p></div><Link className="primary-action" href="/login">SICHER ANMELDEN<ArrowRight size={15} /></Link></section> : null}

    {published.isLoading ? <StatePanel code="MISSIONS/LOAD" state="loading" title="MISSIONEN WERDEN GELADEN" body="Veröffentlichte Fachaufgaben werden aus dem Serverkatalog synchronisiert …" /> : published.isError ? <StatePanel code="MISSIONS/ERROR" state="error" title="MISSIONEN NICHT VERFÜGBAR" body="Der Missionskatalog konnte nicht geladen werden." action={<button type="button" className="secondary-action" onClick={() => void published.refetch()}>ERNEUT VERSUCHEN</button>} /> : missions.length === 0 ? <StatePanel code="MISSIONS/EMPTY" title="NOCH KEINE AKTIVE MISSION" body="Es gibt derzeit keine veröffentlichte Mission mit offenem Zeitraum. Es werden keine Beispielaufgaben angezeigt." /> : <section className="missions-grid" aria-label="Veröffentlichte Feldmissionen">{missions.map(mission => {
      const mine = progressById.get(mission.id);
      return <article className={`mission-card observatory-data-panel mission-card--${mission.realm ?? "botany"}`} key={mission.id}>
        <div className="mission-card__top"><span className="eyebrow">{realmLabel(mission.realm)}</span><span className="mission-card__reward"><Sparkles size={14} />{mission.rewardPoints} PUNKTE</span></div>
        <h2>{mission.title}</h2><p>{mission.description}</p>
        <div className="mission-card__rule"><strong>AUFGABE</strong><span>{mission.ruleText}</span></div>
        <div className="mission-card__meta"><span>ENDET {new Date(mission.endsAt).toLocaleDateString("de-DE")}</span><span>{mine ? `${mine.progress}% · ${mine.status.toUpperCase()}` : "NOCH NICHT BEIGETRETEN"}</span></div>
        {auth.isAuthenticated ? <button type="button" className="primary-action" disabled={Boolean(mine) || join.isPending} onClick={() => join.mutate({ challengeId: mission.id })}>{mine ? <><CheckCircle2 size={15} />MISSION AKTIV</> : join.isPending ? "WIRD GESPEICHERT …" : <>MISSION BEITRETEN<ArrowRight size={15} /></>}</button> : <Link className="secondary-action" href="/login">ANMELDEN, UM BEIZUTRETEN<ArrowRight size={15} /></Link>}
      </article>;
    })}</section>}

    <section className="missions-next observatory-data-panel"><span className="eyebrow">SIGNAL-LABOR · P2 VORBEREITET</span><h2>MESSWERTE BLEIBEN QUELLENGEBUNDEN</h2><p>Das Signal-Labor wird erst aktiv, wenn ein Konto reale Messwerte aus einer eigenen Anlage oder einem autorisierten Gerät liefert. Bis dahin zeigt BlackWaterLeaf keinen simulierten pH-, Temperatur- oder DNA-Status.</p><div><Link className="secondary-action" href="/profile#habitats">EIGENE ANLAGEN</Link><Link className="secondary-action" href="/knowledge">QUELLENWISSEN</Link></div></section>
  </ObservatoryRoutePage>;
}
