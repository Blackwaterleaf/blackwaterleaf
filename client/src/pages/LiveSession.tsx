import { useAuth } from "@/_core/hooks/useAuth";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { liveStreamEmbedSrc } from "@shared/live-stream-embed";
import { ArrowLeft, ExternalLink, MessageCircle, Radio, Send, ShieldCheck, UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useRoute } from "wouter";

function providerLabel(provider: "youtube" | "twitch") {
  return provider === "youtube" ? "YOUTUBE LIVE" : "TWITCH";
}

export default function LiveSession() {
  const [, params] = useRoute("/live/:id");
  const id = Number(params?.id);
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const session = trpc.live.byId.useQuery({ id }, { enabled: auth.isAuthenticated && Number.isSafeInteger(id) && id > 0, retry: false, refetchInterval: auth.isAuthenticated ? 15_000 : false });
  const messages = trpc.live.messages.useQuery({ sessionId: id, limit: 100 }, { enabled: auth.isAuthenticated && session.isSuccess, retry: false, refetchInterval: auth.isAuthenticated && session.data?.status === "live" ? 6_000 : false });
  const send = trpc.live.sendMessage.useMutation({ onSuccess: async () => { setContent(""); await messages.refetch(); }, onError: error => setStatus(error.message) });
  const update = trpc.live.update.useMutation({ onSuccess: async () => { await Promise.all([session.refetch(), utils.live.list.invalidate()]); }, onError: error => setStatus(error.message) });
  const canManage = auth.user?.role === "admin" || auth.user?.role === "moderator";
  const submit = (event: FormEvent) => { event.preventDefault(); const value = content.trim(); if (value) send.mutate({ sessionId: id, content: value }); };

  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany live-session-page"><StatePanel code="LIVE_SESSION/AUTH_REQUIRED" state="locked" title="ANMELDUNG ERFORDERLICH" body="Live-Sitzungen und der Chat sind nur für angemeldete, aktive Konten sichtbar." action={<button type="button" className="primary-action" onClick={startLogin}>SICHER ANMELDEN</button>} /></div>;
  if (session.isLoading) return <div className="observatory-route observatory-route--botany live-session-page"><StatePanel code="LIVE_SESSION/LOAD" state="loading" title="LIVE-SITZUNG WIRD GELADEN" body="Der geschützte Sitzungsdatensatz wird abgerufen." /></div>;
  if (session.isError || !session.data) return <div className="observatory-route observatory-route--botany live-session-page"><StatePanel code="LIVE_SESSION/UNAVAILABLE" state="empty" title="SITZUNG NICHT VERFÜGBAR" body="Sie wurde entfernt oder der Host ist in deiner Blockliste." action={<Link href="/live" className="secondary-action">ZUM LIVE-HUB</Link>} /></div>;

  const item = session.data;
  const embedSrc = item.stream ? liveStreamEmbedSrc(item.stream, window.location.hostname) : null;
  const showPlayer = item.status === "live" && item.stream && embedSrc;

  return <div className="observatory-route observatory-route--botany live-session-page">
    <Link href="/live" className="page-back-link"><ArrowLeft size={16} />ZUM LIVE-HUB</Link>
    <ObservatoryContextHeader tone="botany" eyebrow={item.track === "expert" ? "FACHVORTRAG · STAFF-ANGELEGT" : "COMMUNITY LIVE · MODERIERT"} title={item.title} subtitle={item.description} icon={Radio} badge={item.status === "live" ? "LIVE" : item.status === "scheduled" ? "GEPLANT" : "BEENDET"} children={canManage ? <><button type="button" className="secondary-action" disabled={update.isPending || item.status === "live"} onClick={() => update.mutate({ id, status: "live" })}>LIVE STARTEN</button><button type="button" className="secondary-action" disabled={update.isPending || item.status === "ended"} onClick={() => update.mutate({ id, status: "ended", endsAt: new Date() })}>BEENDEN</button></> : undefined} />
    <section className="live-session-layout">
      <article className="live-session-stage observatory-data-panel">
        <div className="live-session-stage__top"><span className={`live-session-stage__status is-${item.status}`}><i />{item.status === "live" ? "LIVE-ÜBERTRAGUNG" : item.status === "scheduled" ? "BEGINN GEPLANT" : "ÜBERTRAGUNG BEENDET"}</span><span>{new Date(item.startsAt).toLocaleString("de-DE")}</span></div>
        {showPlayer ? <div className="live-session-player"><iframe title={`${item.title} – ${providerLabel(item.stream.provider)}`} src={embedSrc} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><div className="live-session-player__meta"><span className="system-chip">{providerLabel(item.stream.provider)} · DIREKT IM HUB</span><a href={item.stream.canonicalUrl} target="_blank" rel="noopener noreferrer">BEIM ANBIETER ÖFFNEN <ExternalLink size={14} /></a></div></div> : item.stream && item.status === "live" ? <div className="live-session-stage__source"><Radio size={30} /><div><strong>PLAYER KANN NICHT INITIALISIERT WERDEN</strong><p>Die geprüfte Anbieterquelle bleibt verfügbar, konnte für diese Domain aber nicht als Direktplayer erstellt werden.</p><a className="primary-action" href={item.stream.canonicalUrl} target="_blank" rel="noopener noreferrer">BEIM ANBIETER ÖFFNEN <ExternalLink size={15} /></a></div></div> : <div className="live-session-stage__unavailable"><Radio size={28} /><h2>{item.status === "live" ? "STREAMQUELLE NOCH NICHT VERBUNDEN" : item.status === "scheduled" ? "ÜBERTRAGUNG BEGINNT ZUM ANGEZEIGTEN TERMIN" : "KEINE AKTIVE ÜBERTRAGUNG"}</h2><p>Es wird kein Videobild simuliert. Verantwortlicher Staff kann eine YouTube-Live- oder Twitch-Quelle hinterlegen, die dann direkt hier abgespielt wird.</p></div>}
        <footer><span><UsersRound size={15} /> {item.presenterName}</span>{item.presenterCredential ? <span><ShieldCheck size={15} /> {item.presenterCredential}</span> : <span>Community-Host</span>}</footer>
      </article>
      <aside className="live-session-chat observatory-data-panel"><div className="live-session-chat__heading"><div><span className="eyebrow">MEMBER-CHAT</span><h2><MessageCircle size={18} />DISKUSSION</h2></div><span className={item.status === "live" ? "is-live" : ""}>{item.status === "live" ? "AKTIV" : "GESCHLOSSEN"}</span></div><p className="live-session-chat__notice"><ShieldCheck size={14} /> Nur angemeldete Konten. Maximal sechs Nachrichten pro Minute; blockierte Konten werden ausgeblendet.</p>{messages.isLoading ? <p className="observatory-inline-state">Chat wird geladen …</p> : messages.isError ? <p className="form-status" role="alert">Chat ist gerade nicht verfügbar.</p> : <div className="live-session-chat__messages" aria-live="polite">{messages.data?.length ? messages.data.map(message => <article key={message.id}><strong>{message.authorName ?? message.authorUsername ?? "Konto"}</strong><small>{new Date(message.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</small><p>{message.content}</p></article>) : <p className="observatory-inline-state">Noch keine Nachricht in dieser Sitzung.</p>}</div>}<form className="live-session-chat__form" onSubmit={submit}><textarea required disabled={item.status !== "live" || send.isPending} maxLength={2000} rows={3} value={content} onChange={event => setContent(event.target.value)} placeholder={item.status === "live" ? "Sachliche Nachricht schreiben …" : "Der Chat ist nur während einer Live-Sitzung offen."} /><button type="submit" className="primary-action" disabled={item.status !== "live" || send.isPending}><Send size={15} />{send.isPending ? "SENDET …" : "SENDEN"}</button></form></aside>
    </section>
    {status ? <p className="form-status" role="status">{status}</p> : null}
  </div>;
}
