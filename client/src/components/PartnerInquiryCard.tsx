import { Handshake, Mail, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function PartnerInquiryCard() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const mine = trpc.partners.myInquiries.useQuery(undefined, { enabled: auth.isAuthenticated });
  const submit = trpc.partners.submitInquiry.useMutation({
    onSuccess: async result => {
      setMessage("");
      setNotice(result.message);
      await utils.notifications.feed.invalidate();
      await utils.notifications.unreadCount.invalidate();
      await utils.partners.myInquiries.invalidate();
    },
  });

  return (
    <section className="partner-inquiry-card observatory-data-panel" aria-labelledby="partner-inquiry-title">
      <div className="partner-inquiry-card__icon"><Handshake size={22} /></div>
      <div className="partner-inquiry-card__copy">
        <span className="eyebrow">PARTNER WERDEN</span>
        <h2 id="partner-inquiry-title">Mit BlackWaterLeaf zusammenarbeiten</h2>
        <p>Du möchtest Produkte, Fachwissen oder ein Projekt als Partner einbringen? Sende deine Anfrage direkt aus deinem Konto.</p>
      </div>
      {!auth.isAuthenticated ? (
        <button className="primary-action partner-inquiry-card__action" type="button" onClick={() => startLogin()}><Mail size={16} />Anmelden und anfragen</button>
      ) : (
        <form className="partner-inquiry-form" onSubmit={event => { event.preventDefault(); setNotice(null); submit.mutate({ message }); }}>
          <label className="field"><span>Deine Nachricht</span><textarea required minLength={3} maxLength={4000} value={message} onChange={event => setMessage(event.target.value)} placeholder="Womit möchtest du BlackWaterLeaf als Partner unterstützen?" /></label>
          <p className="partner-inquiry-form__privacy"><ShieldCheck size={14} /> Die Bestätigung erscheint direkt in deinem Benachrichtigungscenter.</p>
          <button className="primary-action partner-inquiry-card__action" type="submit" disabled={submit.isPending}><Send size={16} />{submit.isPending ? "WIRD GESENDET …" : "PARTNERANFRAGE SENDEN"}</button>
          {notice ? <p className="form-status" role="status">{notice}</p> : null}
          {submit.isError ? <p className="form-error" role="alert">Die Anfrage konnte nicht gespeichert werden. Bitte versuche es erneut.</p> : null}
        </form>
      )}
      {auth.isAuthenticated && mine.data?.length ? <div className="partner-inquiry-history" aria-label="Meine Partneranfragen">{mine.data.map(item => <article key={item.id}><strong>#{item.id} · {item.status}</strong><p>{item.message}</p>{item.responseMessage ? <small><b>Antwort:</b> {item.responseMessage}</small> : <small>Warten auf Antwort von BlackWaterLeaf.</small>}</article>)}</div> : null}
    </section>
  );
}
