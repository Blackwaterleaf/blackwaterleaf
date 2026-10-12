import { useAuth } from "@/_core/hooks/useAuth";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CalendarClock, Eye, Radio, ShieldCheck, UsersRound, UserRoundCheck } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";

type Track = "community" | "expert";
type StreamProvider = "" | "youtube" | "twitch" | "self_hosted";
type IngestReceipt = { path: string; key: string; keyVersion: number };

function labelFor(track: Track) {
  return track === "expert" ? "FACHVORTRÄGE" : "COMMUNITY LIVE";
}

export default function LiveHub() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [track, setTrack] = useState<Track>("community");
  const [createOpen, setCreateOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [ingest, setIngest] = useState<IngestReceipt | null>(null);
  const [form, setForm] = useState({ track: "community" as Track, title: "", description: "", presenterName: "", presenterCredential: "", realm: "", streamProvider: "" as StreamProvider, streamSource: "", startsAt: "", liveNow: false });
  const sessions = trpc.live.list.useQuery({ track }, { enabled: auth.isAuthenticated, retry: false, refetchInterval: auth.isAuthenticated ? 15_000 : false });
  const capabilities = trpc.live.capabilities.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const create = trpc.live.create.useMutation({
    onSuccess: async result => {
      await utils.live.list.invalidate();
      setIngest(result.ingest);
      setStatus(result.ingest ? "Live-Sitzung und einmaliger Einspielschlüssel erstellt. Kopiere ihn jetzt in OBS oder dein Stream Deck." : "Live-Sitzung gespeichert.");
      setCreateOpen(false);
    },
    onError: error => setStatus(error.message),
  });
  const canManage = auth.user?.role === "admin" || auth.user?.role === "moderator";
  const grouped = useMemo(() => ({
    live: sessions.data?.filter(item => item.status === "live") ?? [],
    scheduled: sessions.data?.filter(item => item.status === "scheduled") ?? [],
    ended: sessions.data?.filter(item => item.status === "ended") ?? [],
  }), [sessions.data]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const startsAt = form.liveNow ? new Date() : new Date(form.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      setStatus("Bitte einen gültigen Beginn angeben.");
      return;
    }
    if (form.streamProvider && form.streamProvider !== "self_hosted" && !form.streamSource.trim()) {
      setStatus("Bitte Video-ID, Kanalname oder Stream-URL angeben.");
      return;
    }
    create.mutate({
      track: form.track,
      title: form.title.trim(),
      description: form.description.trim(),
      realm: form.realm === "botany" || form.realm === "aquarium" || form.realm === "terrarium" ? form.realm : null,
      presenterName: form.presenterName.trim(),
      presenterCredential: form.track === "expert" ? form.presenterCredential.trim() || null : null,
      stream: form.streamProvider ? { provider: form.streamProvider, source: form.streamProvider === "self_hosted" ? "new-self-hosted-stream" : form.streamSource.trim() } : null,
      status: form.liveNow ? "live" : "scheduled",
      startsAt,
    });
  };

  if (!auth.isAuthenticated) {
    return <div className="observatory-route observatory-route--botany live-hub-page"><StatePanel code="LIVE_HUB/AUTH_REQUIRED" state="locked" title="LIVE-HUB IST GESCHÜTZT" body="Live-Sitzungen, Fachvorträge und der zugehörige Chat sind nur für angemeldete, aktive Konten verfügbar." action={<button type="button" className="primary-action" onClick={startLogin}>SICHER ANMELDEN</button>} /></div>;
  }

  return <div className="observatory-route observatory-route--botany live-hub-page">
    <Link href="/community" className="page-back-link">← ZUR COMMUNITY</Link>
    <ObservatoryContextHeader tone="botany" eyebrow="LIVE · NUR FÜR MITGLIEDER" title="ECHTE LIVE-SESSIONS." subtitle="Eigene IONOS-Übertragungen, YouTube Live und Twitch können direkt im Hub wiedergegeben werden. Ohne echte Quelle wird kein Video simuliert." icon={Radio} badge="ANGEMELDET" children={canManage ? <button type="button" className="primary-action" onClick={() => setCreateOpen(value => !value)}><CalendarClock size={16} />{createOpen ? "PLANER SCHLIESSEN" : "SITZUNG PLANEN"}</button> : undefined} />

    <section className="live-hub-track-switcher observatory-data-panel" aria-label="Live-Bereich wählen">
      <div><span className="eyebrow">ZWEI GETRENNTE FORMATE</span><h2>{labelFor(track)}</h2><p>{track === "community" ? "Offener, moderierter Austausch für angemeldete Mitglieder." : "Von aktivem Staff angelegte Vorträge. Berufs- und Qualifikationsangaben werden nicht durch das Publikum selbst behauptet."}</p></div>
      <div className="live-hub-track-switcher__actions"><button type="button" className={track === "community" ? "is-selected" : ""} onClick={() => setTrack("community")}><UsersRound size={16} />COMMUNITY</button><button type="button" className={track === "expert" ? "is-selected" : ""} onClick={() => setTrack("expert")}><UserRoundCheck size={16} />FACHVORTRÄGE</button></div>
    </section>

    {createOpen && canManage ? <form className="live-create-form observatory-data-panel" onSubmit={submit}>
      <div className="observatory-data-panel__heading"><div><span className="eyebrow">STAFF · VERIFIZIERTE PLANUNG</span><h2>SITZUNG ANLEGEN</h2></div><ShieldCheck size={19} /></div>
      <div className="form-grid"><label className="field"><span>Format</span><select value={form.track} onChange={event => setForm(current => ({ ...current, track: event.target.value as Track }))}><option value="community">Community Live</option><option value="expert">Fachvortrag</option></select></label><label className="field"><span>Bereich</span><select value={form.realm} onChange={event => setForm(current => ({ ...current, realm: event.target.value }))}><option value="">Ohne Bereich</option><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label></div>
      <label className="field"><span>Titel</span><input required minLength={3} maxLength={180} value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></label>
      <label className="field"><span>Beschreibung</span><textarea required minLength={10} maxLength={10000} rows={4} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} /></label>
      <div className="form-grid"><label className="field"><span>Moderator:in / Vortragende:r</span><input required minLength={2} maxLength={160} value={form.presenterName} onChange={event => setForm(current => ({ ...current, presenterName: event.target.value }))} /></label>{form.track === "expert" ? <label className="field"><span>Dokumentierte Qualifikation</span><input required minLength={2} maxLength={160} value={form.presenterCredential} onChange={event => setForm(current => ({ ...current, presenterCredential: event.target.value }))} /></label> : <span />}</div>
      <div className="live-create-form__stream"><label className="field"><span>Videoweg – optional</span><select value={form.streamProvider} onChange={event => setForm(current => ({ ...current, streamProvider: event.target.value as StreamProvider, streamSource: "" }))}><option value="">Noch nicht verbunden</option><option value="self_hosted">BLACKWATERLEAF / IONOS</option><option value="youtube">YouTube Live</option><option value="twitch">Twitch</option></select></label>{form.streamProvider === "self_hosted" ? <div className="live-create-form__self-hosted"><strong>Eigener Stream</strong><p>{capabilities.data?.enabled ? "Beim Speichern wird ein nur einmal sichtbarer Einspielschlüssel für OBS oder Stream Deck erzeugt." : "Der sichere IONOS-Medienserver ist noch nicht verbunden. Die Sitzung und ihr Schlüssel werden vorbereitet; Wiedergabe beginnt nach der IONOS-Inbetriebnahme."}</p></div> : form.streamProvider ? <label className="field"><span>{form.streamProvider === "youtube" ? "YouTube-Video-ID oder URL" : "Twitch-Kanalname oder URL"}</span><input required placeholder={form.streamProvider === "youtube" ? "dQw4w9WgXcQ oder https://youtu.be/…" : "kanalname oder https://twitch.tv/…"} value={form.streamSource} onChange={event => setForm(current => ({ ...current, streamSource: event.target.value }))} /><small>Nur YouTube und Twitch werden für die direkte Wiedergabe akzeptiert.</small></label> : null}</div>
      <label className="field"><span>Beginn</span><input required={!form.liveNow} disabled={form.liveNow} type="datetime-local" value={form.startsAt} onChange={event => setForm(current => ({ ...current, startsAt: event.target.value }))} /></label>
      <label className="consent-toggle"><span>Sitzung beginnt jetzt</span><input type="checkbox" checked={form.liveNow} onChange={event => setForm(current => ({ ...current, liveNow: event.target.checked }))} /></label>
      <button type="submit" className="primary-action" disabled={create.isPending}>{create.isPending ? "WIRD GESPEICHERT …" : "SITZUNG SICHER SPEICHERN"}</button>
    </form> : null}

    {ingest ? <section className="live-ingest-receipt observatory-data-panel" aria-live="assertive"><div><span className="eyebrow">CONTROL DECK · NUR EINMAL SICHTBAR</span><h2>OBS / STREAM DECK VERBINDEN</h2><p>Der Schlüssel wird nicht im Klartext gespeichert. Kopiere ihn jetzt und rotiere ihn nach Bedarf in der Sitzungsansicht.</p></div><dl>{capabilities.data?.ingestServer ? <><div><dt>OBS-Server (Custom)</dt><dd>{`${capabilities.data.ingestServer}/${ingest.path}?user=studio&pass=${ingest.key}`}</dd></div><div><dt>OBS-Stream-Key</dt><dd>leer lassen</dd></div></> : <><div><dt>Pfad</dt><dd>{ingest.path}</dd></div><div><dt>Einspielschlüssel</dt><dd>{ingest.key}</dd></div></>}</dl><button type="button" className="secondary-action" onClick={() => { const value = capabilities.data?.ingestServer ? `${capabilities.data.ingestServer}/${ingest.path}?user=studio&pass=${ingest.key}` : ingest.key; void navigator.clipboard?.writeText(value); setStatus(capabilities.data?.ingestServer ? "Vollständige OBS-Serveradresse in die Zwischenablage kopiert." : "Einspielschlüssel in die Zwischenablage kopiert."); }}>{capabilities.data?.ingestServer ? "OBS-ZIEL KOPIEREN" : "SCHLÜSSEL KOPIEREN"}</button></section> : null}

    {sessions.isLoading ? <StatePanel code="LIVE_HUB/LOAD" state="loading" title="LIVE-SESSIONS WERDEN GELADEN" body="Der geschützte Sitzungskalender wird abgerufen." /> : sessions.isError ? <StatePanel code="LIVE_HUB/ERROR" state="error" title="LIVE-HUB NICHT VERFÜGBAR" body="Bitte versuche es erneut." action={<button type="button" className="secondary-action" onClick={() => void sessions.refetch()}>ERNEUT LADEN</button>} /> : <div className="live-hub-groups"><LiveGroup label="JETZT LIVE" sessions={grouped.live} empty="Aktuell ist keine echte Übertragung gestartet." /><LiveGroup label="GEPLANT" sessions={grouped.scheduled} empty="Derzeit sind keine weiteren Sitzungen terminiert." /><LiveGroup label="ABGESCHLOSSEN" sessions={grouped.ended} empty="Noch keine abgeschlossenen Sitzungen in diesem Bereich." /></div>}
    {status ? <p className="form-status" role="status">{status}</p> : null}
  </div>;
}

function LiveGroup({ label, sessions, empty }: { label: string; sessions: Array<{ id: string; track: Track; title: string; description: string; realm: string | null; presenterName: string; presenterCredential: string | null; status: string; viewerCount: number; startsAt: string; stream: { provider: "youtube" | "twitch" | "self_hosted"; identifier: string; canonicalUrl: string } | null }>; empty: string }) {
  return <section className="live-hub-group"><div className="live-hub-group__heading"><span className="eyebrow">{label}</span><span>{sessions.length}</span></div>{sessions.length ? <div className="live-session-grid">{sessions.map(session => <Link key={session.id} href={`/live/${session.id}`} className={`live-session-card is-${session.status}`}><span className="live-session-card__status"><i />{session.status === "live" ? "LIVE" : session.status === "scheduled" ? "GEPLANT" : "BEENDET"}</span><span className="live-session-card__track">{labelFor(session.track)}</span><h2>{session.title}</h2><p>{session.description}</p><footer><span>{session.presenterName}{session.presenterCredential ? ` · ${session.presenterCredential}` : ""}</span>{session.status === "live" ? <span className="live-session-card__viewers"><Eye size={14} /> {session.viewerCount} ZUSCHAUENDE</span> : null}<time>{new Date(session.startsAt).toLocaleString("de-DE")}</time><ArrowRight size={16} /></footer></Link>)}</div> : <div className="live-hub-empty"><Radio size={18} /><p>{empty}</p></div>}</section>;
}
