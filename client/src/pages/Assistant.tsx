import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceActionGrid, ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { readImageAsBase64 } from "@/lib/files";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { Bot, BookOpen, Camera, Fish, Leaf, Loader2, LockKeyhole, ScanSearch, Send, ShieldCheck, Sprout, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { Link } from "wouter";

type AssistantTool = "chat" | "plant" | "aquarium";
function requestId() { return globalThis.crypto?.randomUUID?.() ?? `bwl-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function scrollToTool(id: string) { window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }

export default function Assistant() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const [tool, setTool] = useState<AssistantTool>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [plantFile, setPlantFile] = useState<File | null>(null);
  const [plantPreview, setPlantPreview] = useState<string | null>(null);
  const [plantNote, setPlantNote] = useState("");
  const [plantAnswer, setPlantAnswer] = useState<string | null>(null);
  const [selectedAquariumId, setSelectedAquariumId] = useState("");
  const [aquariumQuestion, setAquariumQuestion] = useState("");
  const [aquariumAnswer, setAquariumAnswer] = useState<string | null>(null);
  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);
  const aiConsent = Boolean(consentMap.get("ai_processing"));
  const available = platform.data?.aiAssistant === "available" && aiConsent;
  const aquariums = useMemo(() => (habitats.data ?? []).filter(item => item.kind === "aquarium"), [habitats.data]);

  useEffect(() => () => { if (plantPreview) URL.revokeObjectURL(plantPreview); }, [plantPreview]);
  useEffect(() => { if (!selectedAquariumId && aquariums[0]) setSelectedAquariumId(aquariums[0].id); }, [aquariums, selectedAquariumId]);

  const chat = trpc.assistant.chat.useMutation({
    onSuccess: async response => { setMessages(current => [...current, { role: "assistant", content: `${response.answer}\n\n_${response.disclaimer}_` }]); await utils.gamification.summary.invalidate(); },
    onError: mutationError => setError(mutationError.message),
  });
  const plantIdentify = trpc.assistant.plantIdentify.useMutation({
    onSuccess: async response => { setPlantAnswer(`${response.answer}\n\n_${response.disclaimer}_`); await utils.gamification.summary.invalidate(); },
    onError: mutationError => setError(mutationError.message),
  });
  const aquariumAnalyze = trpc.assistant.aquariumAnalyze.useMutation({
    onSuccess: async response => { setAquariumAnswer(`${response.answer}\n\n_${response.disclaimer}_`); await utils.gamification.summary.invalidate(); },
    onError: mutationError => setError(mutationError.message),
  });

  const activate = (next: AssistantTool) => { setTool(next); setError(null); scrollToTool("ai-workflow"); };
  const sendMessage = (message: string) => {
    if (!available || chat.isPending) return;
    setError(null);
    const history = messages.slice(-6).map(item => ({ role: item.role === "assistant" ? "assistant" as const : "user" as const, content: item.content }));
    setMessages(current => [...current, { role: "user", content: message }]);
    chat.mutate({ clientRequestId: requestId(), message, history });
  };
  const choosePlantImage = (file: File | undefined) => {
    if (!file) return;
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type) || file.size <= 0 || file.size > 8 * 1024 * 1024) { setError("Bitte wähle ein JPG-, PNG- oder WebP-Bild bis 8 MB aus."); return; }
    setError(null); setPlantAnswer(null); setPlantFile(file);
    setPlantPreview(current => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(file); });
  };
  const identifyPlant = async () => {
    if (!available || !plantFile || plantIdentify.isPending) return;
    try { setError(null); const image = await readImageAsBase64(plantFile); plantIdentify.mutate({ clientRequestId: requestId(), imageBase64: image.base64, mimeType: image.mimeType as "image/jpeg" | "image/png" | "image/webp", note: plantNote.trim() || undefined }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Das Bild konnte nicht gelesen werden."); }
  };
  const analyzeAquarium = () => {
    if (!available || !selectedAquariumId || aquariumAnalyze.isPending) return;
    setError(null); aquariumAnalyze.mutate({ clientRequestId: requestId(), habitatId: Number(selectedAquariumId), question: aquariumQuestion.trim() || undefined });
  };
  const statusCode = platform.isLoading ? "AI/CHECKING" : platform.isError ? "AI/STATUS_ERROR" : !auth.isAuthenticated ? "AUTH/REQUIRED" : platform.data?.aiReason === "pending_migration" ? "AI/STAGING_HOLD" : platform.data?.aiAssistant !== "available" ? "AI/POLICY_LOCK" : !aiConsent ? "AI/CONSENT_REQUIRED" : "AI/READY";
  const gate = !available ? <StatePanel code={statusCode} state={platform.isLoading ? "loading" : platform.isError ? "error" : "locked"} title={!auth.isAuthenticated ? t("profile.signedOut") : platform.data?.aiReason === "pending_migration" ? locale === "de" ? "KI-BEREICH GESPERRT" : "AI AREA LOCKED" : !aiConsent ? locale === "de" ? "FREIGABE ERFORDERLICH" : "CONSENT REQUIRED" : t("assistant.rule")} body={!auth.isAuthenticated ? "Melde dich an, damit Fragen, Bildanalyse und deine privaten Aquariumwerte geschützt bleiben." : platform.data?.aiReason === "pending_migration" ? "Der KI-Dienst ist technisch vorübergehend nicht erreichbar. Es werden keine Scheinantworten angezeigt." : !aiConsent ? "Aktiviere im Profil die sichere Verarbeitung von KI-Anfragen. Du kannst die Freigabe jederzeit widerrufen." : "Der KI-Dienst ist momentan nicht erreichbar. Es werden keine Scheinantworten angezeigt."} action={!auth.isAuthenticated ? <button className="primary-action" type="button" onClick={startLogin}><ShieldCheck size={16} />{t("common.signIn")}</button> : !aiConsent ? <Link href="/profile" className="primary-action"><LockKeyhole size={16} />{locale === "de" ? "ZUM PROFIL" : "OPEN PROFILE"}</Link> : undefined} /> : null;

  return (
    <div className="reference-page reference-page--ai assistant-page">
      <LiveSensorStrip compact />
      <ReferenceHero tone="ai" image={REFERENCE_ASSETS.ai} eyebrow="BLACKWATERLEAF KI" title="KI-ASSISTENT" subtitle={locale === "de" ? "Echte KI-Hilfe. Keine Scheinantwort. Antworten machen Unsicherheit transparent." : "Real AI help. No pretend answers. Uncertainty stays transparent."} icon={Bot} badge="PRIVAT / OPTIONAL" />
      <ReferenceActionGrid tone="ai" actions={[
        { title: "Frage stellen", note: "Gespräch beginnen", icon: Send, image: REFERENCE_ASSETS.ai, onActivate: () => activate("chat") },
        { title: "Pflanze bestimmen", note: "Eigenes Foto sicher prüfen", icon: ScanSearch, image: WORLD_ASSETS.botany, onActivate: () => activate("plant") },
        { title: "Aquarium verstehen", note: "Dein Becken gezielt analysieren", icon: Fish, image: WORLD_ASSETS.aquarium, onActivate: () => activate("aquarium") },
        { title: "Wissen & Quellen", note: "Quellenwissen öffnen", icon: BookOpen, image: WORLD_ASSETS.terrarium, href: "/knowledge" },
      ]} />

      <section id="ai-workflow" className="glass-panel reference-after-actions assistant-workflow" aria-live="polite">
        <div className="assistant-workflow__tabs" role="tablist" aria-label="KI-Werkzeug auswählen">
          <button className={tool === "chat" ? "active" : ""} type="button" role="tab" aria-selected={tool === "chat"} onClick={() => setTool("chat")}><Send size={15} />Frage stellen</button>
          <button className={tool === "plant" ? "active" : ""} type="button" role="tab" aria-selected={tool === "plant"} onClick={() => setTool("plant")}><Sprout size={15} />Pflanze bestimmen</button>
          <button className={tool === "aquarium" ? "active" : ""} type="button" role="tab" aria-selected={tool === "aquarium"} onClick={() => setTool("aquarium")}><Fish size={15} />Aquarium verstehen</button>
        </div>

        {gate ?? (tool === "chat" ? <div className="assistant-workflow__body"><div className="form-heading"><div><p className="eyebrow">[AI/READY]</p><h2>{locale === "de" ? "FRAGE DEINE WELT" : "ASK YOUR WORLD"}</h2></div><span className="system-chip">GPT-5 MINI</span></div><AIChatBox messages={messages} onSendMessage={sendMessage} isLoading={chat.isPending} height="520px" placeholder={locale === "de" ? "Schreibe eine naturbezogene Frage …" : "Write a nature-related question …"} emptyStateMessage={locale === "de" ? "Beschreibe eine Beobachtung oder stelle eine konkrete Frage." : "Describe an observation or ask a specific question."} suggestedPrompts={locale === "de" ? ["Wie dokumentiere ich eine neue Pflanzenbeobachtung?", "Worauf sollte ich beim Wasserwechsel achten?"] : ["How do I document a new plant observation?", "What should I note during a water change?"]} /></div> : tool === "plant" ? <div className="assistant-workflow__body"><div className="form-heading"><div><p className="eyebrow">[BILD / EINMALIG]</p><h2>PFLANZE BESTIMMEN</h2></div><span className="system-chip">KEINE SPEICHERUNG</span></div><p className="assistant-workflow__intro">Lade ein eigenes Foto hoch. Die KI beschreibt mögliche Einordnungen und Merkmale, bestätigt aber keine Art als sicher.</p><div className="assistant-image-picker">{plantPreview ? <><img src={plantPreview} alt="Ausgewähltes Pflanzenfoto" /><button type="button" className="icon-button" onClick={() => { if (plantPreview) URL.revokeObjectURL(plantPreview); setPlantPreview(null); setPlantFile(null); setPlantAnswer(null); }} aria-label="Bild entfernen"><X size={17} /></button></> : <label><Camera size={28} /><strong>FOTO AUSWÄHLEN</strong><small>JPG, PNG oder WebP · maximal 8 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choosePlantImage(event.target.files?.[0])} /></label>}</div><label className="field"><span>OPTIONALE BEOBACHTUNG</span><textarea value={plantNote} onChange={event => setPlantNote(event.target.value)} maxLength={500} placeholder="Zum Beispiel Standort, Blattunterseite oder Wuchsform …" /></label><button className="primary-action assistant-submit" type="button" disabled={!plantFile || plantIdentify.isPending} onClick={identifyPlant}>{plantIdentify.isPending ? <Loader2 size={16} className="spin" /> : <ScanSearch size={16} />}PFLANZE MIT KI ANALYSIEREN</button>{plantAnswer ? <article className="assistant-result"><Streamdown>{plantAnswer}</Streamdown></article> : null}</div> : <div className="assistant-workflow__body"><div className="form-heading"><div><p className="eyebrow">[PRIVAT / PROFIL]</p><h2>AQUARIUM VERSTEHEN</h2></div><span className="system-chip">EIGENE WERTE</span></div><p className="assistant-workflow__intro">Die Analyse verwendet ausschließlich das von dir ausgewählte private Aquarium und dessen gespeicherte Angaben. Fehlende Werte werden als Lücke benannt, nicht erfunden.</p>{habitats.isLoading ? <p className="form-status"><Loader2 size={14} className="spin" />Aquarien werden geladen …</p> : aquariums.length === 0 ? <div className="assistant-empty-link"><Fish size={25} /><strong>NOCH KEIN AQUARIUM ANGELEGT</strong><p>Lege zuerst im Aquaristik-Bereich dein Becken und seine Wasserwerte an.</p><Link href="/world/aquarium">AQUARIUM ANLEGEN</Link></div> : <><label className="field"><span>PRIVATES AQUARIUM</span><select value={selectedAquariumId} onChange={event => setSelectedAquariumId(event.target.value)}>{aquariums.map(aquarium => <option key={aquarium.id} value={aquarium.id}>{aquarium.name}</option>)}</select></label><label className="field"><span>DEINE FRAGE (OPTIONAL)</span><textarea value={aquariumQuestion} onChange={event => setAquariumQuestion(event.target.value)} maxLength={1_200} placeholder="Zum Beispiel: Welche Angaben sollte ich als Nächstes prüfen?" /></label><button className="primary-action assistant-submit" type="button" disabled={!selectedAquariumId || aquariumAnalyze.isPending} onClick={analyzeAquarium}>{aquariumAnalyze.isPending ? <Loader2 size={16} className="spin" /> : <Fish size={16} />}AQUARIUM MIT KI ANALYSIEREN</button>{aquariumAnswer ? <article className="assistant-result"><Streamdown>{aquariumAnswer}</Streamdown></article> : null}</>}</div>)}
        {error ? <p className="form-status" role="alert">{error}</p> : null}
        {available ? <p className="form-status">Bis zu 10 erfolgreiche KI-Anfragen pro Tag. Pro erfolgreicher Antwort werden einmalig 3 XP gutgeschrieben.</p> : null}
      </section>
      {!available ? <ReferenceEmptyState tone="ai" code="KI / TRANSPARENT" title={locale === "de" ? "KEINE SCHEINANTWORT" : "NO PRETEND ANSWER"} body={locale === "de" ? "Alle drei Funktionen sind implementiert. Sie werden erst nach Anmeldung, Freigabe und verfügbarem Dienst ausgeführt." : "All three functions are implemented. They run only after sign-in, consent and an available service."} /> : null}
    </div>
  );
}
