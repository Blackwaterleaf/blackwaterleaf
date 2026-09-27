import { useState } from "react";
import { Bug, Check, Lightbulb, MessageSquareHeart, Send } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { StatePanel } from "@/components/StatePanel";

const kinds = [
  { value: "feedback" as const, label: "Feedback", icon: MessageSquareHeart },
  { value: "problem" as const, label: "Problem melden", icon: Bug },
  { value: "wish" as const, label: "Wunsch / Verbesserung", icon: Lightbulb },
];

export default function Feedback() {
  const auth = useAuth();
  const [kind, setKind] = useState<(typeof kinds)[number]["value"]>("feedback");
  const [message, setMessage] = useState("");
  const submit = trpc.feedback.submit.useMutation({ onSuccess: () => setMessage("") });
  const page = typeof window === "undefined" ? null : window.location.pathname;
  if (auth.loading) return <StatePanel code="FEEDBACK/LOADING" state="loading" title="FEEDBACK WIRD GELADEN" body="" />;
  if (!auth.isAuthenticated) return <StatePanel code="FEEDBACK/LOCKED" state="locked" title="ANMELDUNG ERFORDERLICH" body="Feedback, Probleme und Wünsche werden nur deinem geschützten Konto zugeordnet." action={<Link className="primary-action" href="/login">SICHER ANMELDEN</Link>} />;
  return <section className="feedback-page">
    <header className="feedback-page__hero observatory-data-panel">
      <span className="eyebrow">BLACKWATERLEAF · DIREKTER DRAHT</span>
      <h1>DEIN FEEDBACK ZÄHLT.</h1>
      <p>Schreib direkt an BlackWaterLeaf: ehrlich, konkret und ohne Umweg.</p>
    </header>
    <form className="feedback-form observatory-data-panel" onSubmit={event => { event.preventDefault(); if (message.trim()) submit.mutate({ kind, message: message.trim(), page }); }}>
      <div className="feedback-kind-grid" aria-label="Feedback-Art">
        {kinds.map(({ value, label, icon: Icon }) => <button key={value} type="button" className={kind === value ? "active" : ""} onClick={() => setKind(value)}><Icon size={17} /><span>{label}</span></button>)}
      </div>
      <label className="feedback-field"><span>DEINE NACHRICHT</span><textarea required minLength={3} maxLength={4000} value={message} onChange={event => setMessage(event.target.value)} placeholder="Was funktioniert nicht, was wünschst du dir oder was gefällt dir?" /><small>{message.length}/4000</small></label>
      <button className="primary-action" type="submit" disabled={submit.isPending || message.trim().length < 3}><Send size={15} />{submit.isPending ? "WIRD GESENDET …" : "NACHRICHT SENDEN"}</button>
      {submit.isSuccess ? <div className="feedback-success" role="status" aria-live="polite"><span className="feedback-success__icon" aria-hidden="true"><Check size={22} strokeWidth={3} /></span><span><strong>Nachricht angekommen.</strong><small>Danke — dein Feedback wurde sicher gespeichert.</small></span></div> : null}
      {submit.isError ? <p className="form-status" role="alert">Die Nachricht konnte nicht gespeichert werden. Bitte versuche es erneut.</p> : null}
    </form>
    <p className="feedback-page__privacy"><Link href="/profile/privacy">Datenschutz & Datenkontrolle</Link> · Deine Nachricht bleibt deinem Konto zugeordnet.</p>
  </section>;
}
