import { ArrowLeft, CheckCheck, Loader2, Mail, MessageCircle, Send, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";

export default function Messages() {
  const auth = useAuth();
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const params = useMemo(() => new URLSearchParams(location.split("?")[1] ?? ""), [location]);
  const requestedConversationId = Number(params.get("conversation"));
  const requestedRecipientId = Number(params.get("to"));
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(Number.isSafeInteger(requestedConversationId) && requestedConversationId > 0 ? requestedConversationId : null);
  const [draft, setDraft] = useState("");
  const conversations = trpc.messages.conversations.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false, staleTime: 10_000 });
  const recipient = trpc.profile.publicById.useQuery({ id: requestedRecipientId }, { enabled: auth.isAuthenticated && Number.isSafeInteger(requestedRecipientId) && requestedRecipientId > 0, retry: false });
  const selected = conversations.data?.find(item => Number(item.id) === selectedConversationId) ?? null;
  const thread = trpc.messages.messages.useQuery({ conversationId: selectedConversationId ?? 0, limit: 50 }, { enabled: auth.isAuthenticated && Boolean(selectedConversationId), retry: false });
  const hasIncomingMessages = Boolean(thread.data?.items.some(item => item.senderId !== String(auth.user?.id)));
  const markRead = trpc.messages.markRead.useMutation({ onSuccess: () => { void utils.messages.unreadCount.invalidate(); void conversations.refetch(); } });
  const start = trpc.messages.start.useMutation({ onSuccess: result => { setDraft(""); setSelectedConversationId(Number(result.conversationId)); setLocation(`/messages?conversation=${result.conversationId}`); void conversations.refetch(); void utils.messages.unreadCount.invalidate(); } });
  const send = trpc.messages.send.useMutation({ onSuccess: () => { setDraft(""); void thread.refetch(); void conversations.refetch(); void utils.messages.unreadCount.invalidate(); } });

  useEffect(() => {
    if (selectedConversationId || !conversations.data?.length) return;
    setSelectedConversationId(Number(conversations.data[0].id));
  }, [conversations.data, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId || !hasIncomingMessages) return;
    markRead.mutate({ conversationId: selectedConversationId });
  }, [auth.user?.id, hasIncomingMessages, selectedConversationId]);

  const submit = () => {
    const content = draft.trim();
    if (!content || start.isPending || send.isPending) return;
    if (selectedConversationId) send.mutate({ conversationId: selectedConversationId, content });
    else if (requestedRecipientId > 0) start.mutate({ recipientId: requestedRecipientId, content });
  };

  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany"><StatePanel code="MESSAGES/AUTH_REQUIRED" state="locked" title="POSTFACH FÜR MITGLIEDER" body="Private Nachrichten sind nur für angemeldete Nutzer verfügbar. Andere Personen sehen niemals deine Unterhaltungen." action={<button type="button" className="primary-action" onClick={startLogin}><ShieldCheck size={16} />SICHER ANMELDEN</button>} /></div>;

  return <div className="observatory-route observatory-route--botany messages-page">
    <ObservatoryContextHeader tone="botany" eyebrow="PRIVAT · POSTFACH" title="DEINE NACHRICHTEN." subtitle="Geschützte 1:1-Unterhaltungen mit aktiven BlackWaterLeaf-Mitgliedern. Blockierte Konten werden automatisch ausgeblendet." icon={Mail} badge="NUR FÜR DICH" />
    <div className="messages-workspace">
      <section className="messages-list observatory-data-panel" aria-label="Unterhaltungen">
        <div className="observatory-data-panel__heading"><span className="eyebrow">UNTERHALTUNGEN</span><span className="observatory-count">{conversations.data?.length ?? 0}</span></div>
        {conversations.isLoading ? <StatePanel code="MESSAGES/LOAD" state="loading" title="POSTFACH WIRD GELADEN" body="Deine Unterhaltungen werden geschützt abgerufen …" /> : conversations.isError ? <StatePanel code="MESSAGES/ERROR" state="error" title="POSTFACH NICHT VERFÜGBAR" body="Die Unterhaltungen konnten gerade nicht geladen werden." action={<button type="button" className="secondary-action" onClick={() => void conversations.refetch()}>ERNEUT VERSUCHEN</button>} /> : conversations.data?.length ? <div className="messages-conversation-list">{conversations.data.map(item => <button key={item.id} type="button" className={`messages-conversation ${Number(item.id) === selectedConversationId ? "is-selected" : ""}`} onClick={() => { setSelectedConversationId(Number(item.id)); setLocation(`/messages?conversation=${item.id}`); void markRead.mutateAsync({ conversationId: Number(item.id) }); }}><span className="messages-avatar"><UserRound size={17} /></span><span className="messages-conversation__copy"><strong>{item.member.name}</strong><small>{item.lastMessage?.content ?? "Noch keine Nachricht"}</small></span>{item.unreadCount ? <span className="messages-unread" aria-label={`${item.unreadCount} ungelesene Nachrichten`}>{item.unreadCount > 9 ? "9+" : item.unreadCount}</span> : null}</button>)}</div> : <StatePanel code="MESSAGES/EMPTY" state="empty" title="NOCH KEINE UNTERHALTUNG" body="Öffne ein öffentliches Profil und starte dort eine private Nachricht." action={<Link className="secondary-action" href="/search"><UserRound size={16} />MITGLIED SUCHEN</Link>} />}
      </section>
      <section className="messages-thread observatory-data-panel" aria-label="Nachrichtenverlauf">
        {selectedConversationId && selected ? <>
          <div className="messages-thread__header"><Link className="page-back-link" href="/messages"><ArrowLeft size={15} />POSTFACH</Link><div><strong>{selected.member.name}</strong><small>{selected.member.username ? `@${selected.member.username}` : "Aktives Mitglied"}</small></div></div>
          <div className="messages-thread__notice"><ShieldCheck size={15} />Privatbereich: Nur du und {selected.member.name} können diese Nachrichten sehen.</div>
          <div className="messages-thread__body">{thread.isLoading ? <StatePanel code="MESSAGES/THREAD_LOAD" state="loading" title="VERLAUF WIRD GELADEN" body="Nachrichten werden abgerufen …" /> : thread.isError ? <StatePanel code="MESSAGES/THREAD_ERROR" state="error" title="VERLAUF NICHT VERFÜGBAR" body="Dieser Verlauf ist gerade nicht erreichbar." /> : thread.data?.items.length ? thread.data.items.map(item => <div key={item.id} className={`message-bubble ${item.senderId === String(auth.user?.id) ? "message-bubble--own" : ""}`}><p>{item.content}</p><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("de-DE")}</time></div>) : <StatePanel code="MESSAGES/THREAD_EMPTY" state="empty" title="NOCH KEINE NACHRICHT" body="Schreibe eine respektvolle erste Nachricht." />}</div>
          <div className="messages-composer"><textarea value={draft} onChange={event => setDraft(event.target.value)} maxLength={2000} placeholder="Nachricht schreiben …" aria-label="Private Nachricht" /><button type="button" className="primary-action" disabled={!draft.trim() || send.isPending} onClick={submit}>{send.isPending ? <Loader2 size={16} className="action-spinner" /> : <Send size={16} />}SENDEN</button></div>
        </> : requestedRecipientId > 0 && recipient.data ? <>
          <div className="messages-thread__header"><Link className="page-back-link" href="/messages"><ArrowLeft size={15} />POSTFACH</Link><div><strong>{recipient.data.name ?? recipient.data.username ?? "BlackWaterLeaf-Nutzer"}</strong><small>Neue private Unterhaltung</small></div></div>
          <div className="messages-thread__notice"><MessageCircle size={15} />Deine erste Nachricht wird erst nach sicherer Authentifizierung und Empfängerprüfung versendet.</div>
          <div className="messages-thread__body"><StatePanel code="MESSAGES/NEW" state="empty" title="NEUE UNTERHALTUNG" body="Schreibe eine Nachricht. Es werden keine privaten Daten oder Standorte automatisch geteilt." /></div>
          <div className="messages-composer"><textarea value={draft} onChange={event => setDraft(event.target.value)} maxLength={2000} placeholder="Nachricht schreiben …" aria-label="Private Nachricht" /><button type="button" className="primary-action" disabled={!draft.trim() || start.isPending} onClick={submit}>{start.isPending ? <Loader2 size={16} className="action-spinner" /> : <Send size={16} />}SENDEN</button></div>
        </> : <StatePanel code="MESSAGES/SELECT" state="empty" title="UNTERHALTUNG AUSWÄHLEN" body="Wähle links eine Unterhaltung oder starte eine Nachricht über ein öffentliches Profil." />}
      </section>
    </div>
  </div>;
}
