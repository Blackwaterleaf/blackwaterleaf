import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceActionGrid, ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { Bot, BookOpen, Fish, Leaf, LockKeyhole, ScanSearch, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

function requestId() { return globalThis.crypto?.randomUUID?.() ?? `bwl-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

export default function Assistant() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);
  const aiConsent = Boolean(consentMap.get("ai_processing"));
  const available = platform.data?.aiAssistant === "available" && aiConsent;
  const chat = trpc.assistant.chat.useMutation({ onSuccess: async response => { setMessages(current => [...current, { role: "assistant", content: `${response.answer}\n\n_${response.disclaimer}_` }]); await utils.gamification.summary.invalidate(); }, onError: mutationError => setError(mutationError.message) });
  const sendMessage = (message: string) => { if (!available || chat.isPending) return; setError(null); const history = messages.slice(-6).map(item => ({ role: item.role === "assistant" ? "assistant" as const : "user" as const, content: item.content })); setMessages(current => [...current, { role: "user", content: message }]); chat.mutate({ clientRequestId: requestId(), message, history }); };
  const statusCode = platform.isLoading ? "AI/CHECKING" : platform.isError ? "AI/STATUS_ERROR" : !auth.isAuthenticated ? "AUTH/REQUIRED" : platform.data?.aiReason === "pending_migration" ? "AI/STAGING_HOLD" : platform.data?.aiAssistant !== "available" ? "AI/POLICY_LOCK" : !aiConsent ? "AI/CONSENT_REQUIRED" : "AI/READY";

  return (
    <div className="reference-page reference-page--ai assistant-page">
      <LiveSensorStrip compact />
      <ReferenceHero tone="ai" image={REFERENCE_ASSETS.ai} eyebrow="BLACKWATERLEAF KI" title="KI-ASSISTENT" subtitle={locale === "de" ? "Echte KI-Hilfe. Keine Scheinantwort. Antworten machen Unsicherheit transparent." : "Real AI help. No pretend answers. Uncertainty stays transparent."} icon={Bot} badge="AUTH / OPTIONAL" />
      <ReferenceActionGrid tone="ai" actions={[
        { title: "Frage stellen", note: available ? "Chat öffnen" : "Freigabe zuerst prüfen", icon: Send, image: REFERENCE_ASSETS.ai, href: available ? "#ai-chat" : undefined },
        { title: "Pflanze bestimmen", note: "Bildbestimmung wird vorbereitet", icon: ScanSearch, image: WORLD_ASSETS.botany, unavailable: true },
        { title: "Aquarium verstehen", note: "Spezialanalyse wird vorbereitet", icon: Fish, image: WORLD_ASSETS.aquarium, unavailable: true },
        { title: "Wissen & Quellen", note: "Quellenwissen öffnen", icon: BookOpen, image: WORLD_ASSETS.terrarium, href: "/knowledge" },
      ]} />
      {available ? <section id="ai-chat" className="glass-panel reference-after-actions"><div className="form-heading"><div><p className="eyebrow">[AI/READY]</p><h2>{locale === "de" ? "FRAGE DEINE WELT" : "ASK YOUR WORLD"}</h2></div><span className="system-chip">GPT-5 MINI</span></div><AIChatBox messages={messages} onSendMessage={sendMessage} isLoading={chat.isPending} height="520px" placeholder={locale === "de" ? "Schreibe eine naturbezogene Frage …" : "Write a nature-related question …"} emptyStateMessage={locale === "de" ? "Beschreibe eine Beobachtung oder stelle eine konkrete Frage." : "Describe an observation or ask a specific question."} suggestedPrompts={locale === "de" ? ["Wie dokumentiere ich eine neue Pflanzenbeobachtung?", "Worauf sollte ich beim Wasserwechsel achten?"] : ["How do I document a new plant observation?", "What should I note during a water change?"]} />{error ? <p className="form-status" role="alert">{error}</p> : null}<p className="form-status">{locale === "de" ? "Bis zu 10 erfolgreiche KI-Anfragen pro Tag. Für eine erfolgreiche Antwort werden 3 XP einmalig gutgeschrieben." : "Up to 10 successful AI requests per day. A successful response earns 3 XP once."}</p></section> : <StatePanel code={statusCode} state={platform.isLoading ? "loading" : platform.isError ? "error" : "locked"} title={!auth.isAuthenticated ? t("profile.signedOut") : platform.data?.aiReason === "pending_migration" ? locale === "de" ? "STAGING-MIGRATION AUSSTEHEND" : "STAGING MIGRATION PENDING" : !aiConsent ? locale === "de" ? "FREIGABE ERFORDERLICH" : "CONSENT REQUIRED" : t("assistant.rule")} body={!auth.isAuthenticated ? t("home.truth.body") : platform.data?.aiReason === "pending_migration" ? locale === "de" ? "Der KI- und XP-Code ist geprüft, aber die Datenbankänderung wurde absichtlich noch nicht ausgeführt." : "The AI and XP code is reviewed, but the database change has deliberately not been run yet." : !aiConsent ? locale === "de" ? "Aktiviere im Profil die sichere Verarbeitung von KI-Anfragen. Du kannst die Freigabe jederzeit widerrufen." : "Enable secure processing of AI requests in your profile. You can withdraw consent at any time." : t("assistant.body")} action={!auth.isAuthenticated ? <button className="primary-action" type="button" onClick={startLogin}><ShieldCheck size={16} />{t("common.signIn")}</button> : !aiConsent ? <Link href="/profile" className="primary-action"><LockKeyhole size={16} />{locale === "de" ? "ZUM PROFIL" : "OPEN PROFILE"}</Link> : <button className="primary-action" type="button" disabled><LockKeyhole size={16} />{t("common.notConnected")}</button>} />}
      {!available ? <ReferenceEmptyState tone="ai" code="KI / TRANSPARENT" title={locale === "de" ? "KEINE SCHEINANTWORT" : "NO PRETEND ANSWER"} body={locale === "de" ? "Der Assistent bleibt sichtbar, erklärt aber klar, warum er noch keine Antwort geben darf." : "The assistant remains visible but clearly explains why it cannot answer yet."} /> : null}
    </div>
  );
}
