import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { ReferenceActionGrid, ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { imageErrorMessage, readImageAsBase64 } from "@/lib/files";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { Bot, BookOpen, Camera, Fish, Loader2, LockKeyhole, ScanSearch, Send, ShieldCheck, Sprout, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Streamdown } from "streamdown";
import { Link } from "wouter";

type AssistantTool = "chat" | "plant" | "aquarium";
const AI_MAINTENANCE = false;
function requestId() { return globalThis.crypto?.randomUUID?.() ?? `bwl-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
type PlantIdentification = { summary: string; confidence: "low" | "moderate" | "high"; needsMoreImages: boolean; requestedAdditionalImages: number; followUpQuestion: string; candidates: Array<{ commonName: string; scientificName: string; confidence: "low" | "moderate" | "high"; reason: string }>; observedFeatures: string[]; safetyNotes: string[]; verificationSteps: string[] };

function confidenceLabel(value: PlantIdentification["confidence"]) { return value === "high" ? "HOHE SICHERHEIT" : value === "moderate" ? "MITTLERE SICHERHEIT" : "NIEDRIGE SICHERHEIT"; }
function PlantResultCards({ result, plantNetValidation }: { result: PlantIdentification; plantNetValidation?: { exactMatch: boolean; sameGenus: boolean; topSpecies: string; topScore: number } | null }) {
  return <div className="assistant-result-cards">
    <section className="assistant-result-summary"><div><p className="eyebrow">VORLÄUFIGE EINORDNUNG</p><h3>{result.candidates[0]?.scientificName ?? "Noch keine belastbare Art"}</h3><span className={`assistant-confidence assistant-confidence--${result.confidence}`}><ShieldCheck size={14} />{confidenceLabel(result.confidence)}</span></div><p>{result.summary}</p></section>
    <div className="assistant-result-grid"><section className="assistant-result-card"><h4><Sprout size={16} />MÖGLICHE KANDIDATEN</h4>{result.candidates.length ? <ol>{result.candidates.map(candidate => <li key={`${candidate.scientificName}-${candidate.commonName}`}><span><strong>{candidate.commonName}</strong><small><em>{candidate.scientificName}</em> · {candidate.reason}</small></span><b>{candidate.confidence === "high" ? "HOCH" : candidate.confidence === "moderate" ? "MITTEL" : "NIEDRIG"}</b></li>)}</ol> : <p>Keine belastbare Kandidatenliste möglich.</p>}</section>
      <section className="assistant-result-card"><h4><ScanSearch size={16} />ERKENNBARE MERKMALE</h4><div className="assistant-feature-chips">{result.observedFeatures.length ? result.observedFeatures.map(feature => <span key={feature}>{feature}</span>) : <p>Keine ausreichenden Merkmale sicher erkennbar.</p>}</div></section>
      <section className="assistant-result-card assistant-result-card--images"><h4><Camera size={16} />WEITERE BILDER</h4><p>{result.needsMoreImages ? result.followUpQuestion || "Bitte fotografiere eine weitere relevante Einzelansicht." : "Für diese vorläufige Einordnung werden aktuell keine weiteren Bilder benötigt."}</p>{result.needsMoreImages ? <span className="assistant-result-hint">Gesamtansicht oder Blattunterseite</span> : null}</section>
      <section className="assistant-result-card assistant-result-card--verification"><h4><ShieldCheck size={16} />UNABHÄNGIGE PRÜFUNG</h4>{plantNetValidation ? <p>{plantNetValidation.exactMatch ? "Pl@ntNet bestätigt den wissenschaftlichen Namen." : plantNetValidation.sameGenus ? `Gattung bestätigt · ${plantNetValidation.topSpecies} (${plantNetValidation.topScore} %)` : `Abweichende Prüfung · ${plantNetValidation.topSpecies} (${plantNetValidation.topScore} %)`}</p> : <p>Für dieses Bild war keine zweite API-Prüfung verfügbar.</p>}</section></div>
    {result.safetyNotes.length ? <section className="assistant-result-note"><strong>SICHERHEITSHINWEISE</strong><p>{result.safetyNotes.join(" · ")}</p></section> : null}
  </div>;
}

function PlantCorrectionForm({ originalAnswer, assistantUsageId }: { originalAnswer: string; assistantUsageId: number }) {
  const [correctedName, setCorrectedName] = useState("");
  const [correctionNote, setCorrectionNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const correction = trpc.assistant.submitPlantCorrection.useMutation({ onSuccess: () => { setSubmitted(true); setError(null); }, onError: mutationError => setError(mutationError.message) });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!correctedName.trim() || correction.isPending || submitted) return;
    correction.mutate({ assistantUsageId, originalAnswer, correctedName: correctedName.trim(), correctionNote: correctionNote.trim() || undefined });
  };
  return <form className="assistant-correction" onSubmit={submit}>
    <p className="eyebrow">[KI-KORREKTUR / PRÜFUNG]</p>
    <h3>Liegt die KI hier falsch?</h3>
    <p>Trage deine bekannte Bestimmung ein. Die ursprüngliche KI-Antwort bleibt erhalten; deine Korrektur wird zur Prüfung an Admins und Moderatoren übergeben.</p>
    {submitted ? <p className="form-status" role="status">Korrektur gespeichert und zur Prüfung eingetragen.</p> : <>
      <label className="field"><span>RICHTIGE BEZEICHNUNG</span><input required maxLength={255} value={correctedName} onChange={event => setCorrectedName(event.target.value)} placeholder="Zum Beispiel: Monstera deliciosa" /></label>
      <label className="field"><span>KURZE BEGRÜNDUNG (OPTIONAL)</span><textarea maxLength={1_000} value={correctionNote} onChange={event => setCorrectionNote(event.target.value)} placeholder="Woran hast du die Pflanze erkannt?" /></label>
      <button className="secondary-action" type="submit" disabled={correction.isPending || !correctedName.trim()}>{correction.isPending ? <Loader2 size={15} className="spin" /> : <ShieldCheck size={15} />} KORREKTUR ZUR PRÜFUNG SPEICHERN</button>
      {error ? <p className="form-status" role="alert">{error}</p> : null}
    </>}
  </form>;
}

export default function Assistant() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const [tool, setTool] = useState<AssistantTool>("chat");
  const [selectedAction, setSelectedAction] = useState<AssistantTool | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [plantFiles, setPlantFiles] = useState<File[]>([]);
  const [plantPreviews, setPlantPreviews] = useState<string[]>([]);
  const [plantNote, setPlantNote] = useState("");
  const [plantAnswer, setPlantAnswer] = useState<string | null>(null);
  const [plantIdentification, setPlantIdentification] = useState<PlantIdentification | null>(null);
  const [plantNetValidation, setPlantNetValidation] = useState<{ exactMatch: boolean; sameGenus: boolean; topSpecies: string; topScore: number } | null>(null);
  const [plantOriginalAnswer, setPlantOriginalAnswer] = useState<string | null>(null);
  const [plantAssistantUsageId, setPlantAssistantUsageId] = useState<number | null>(null);
  const [plantNeedsMoreImages, setPlantNeedsMoreImages] = useState(false);
  const [plantRequestedImages, setPlantRequestedImages] = useState(0);
  const [selectedAquariumId, setSelectedAquariumId] = useState("");
  const [aquariumQuestion, setAquariumQuestion] = useState("");
  const [aquariumAnswer, setAquariumAnswer] = useState<string | null>(null);
  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);
  const aiConsent = Boolean(consentMap.get("ai_processing"));
  const available = platform.data?.aiAssistant === "available" && aiConsent;
  const aquariums = useMemo(() => (habitats.data ?? []).filter(item => item.kind === "aquarium"), [habitats.data]);

  useEffect(() => () => { plantPreviews.forEach(URL.revokeObjectURL); }, [plantPreviews]);
  useEffect(() => { if (!selectedAquariumId && aquariums[0]) setSelectedAquariumId(aquariums[0].id); }, [aquariums, selectedAquariumId]);

  const chat = trpc.assistant.chat.useMutation({
    onSuccess: async response => { setMessages(current => [...current, { role: "assistant", content: `${response.answer}\n\n_${response.disclaimer}_` }]); await utils.gamification.summary.invalidate(); },
    onError: mutationError => setError(mutationError.message),
  });
  const plantIdentify = trpc.assistant.plantIdentify.useMutation({
    onSuccess: async response => { setPlantOriginalAnswer(response.answer); setPlantAssistantUsageId(response.assistantUsageId); setPlantAnswer(`${response.answer}\n\n_${response.disclaimer}_`); setPlantIdentification(response.identification); setPlantNetValidation(response.plantNetValidation); setPlantNeedsMoreImages(response.needsMoreImages); setPlantRequestedImages(response.requestedAdditionalImages); await utils.gamification.summary.invalidate(); },
    onError: mutationError => setError(mutationError.message),
  });
  const aquariumAnalyze = trpc.assistant.aquariumAnalyze.useMutation({
    onSuccess: async response => { setAquariumAnswer(`${response.answer}\n\n_${response.disclaimer}_`); await utils.gamification.summary.invalidate(); },
    onError: mutationError => setError(mutationError.message),
  });

  const activate = (next: AssistantTool) => { setTool(next); setSelectedAction(next); setError(null); };
  const sendMessage = (message: string) => {
    if (!available || chat.isPending) return;
    setError(null);
    const history = messages.slice(-6).map(item => ({ role: item.role === "assistant" ? "assistant" as const : "user" as const, content: item.content }));
    setMessages(current => [...current, { role: "user", content: message }]);
    chat.mutate({ clientRequestId: requestId(), message, history });
  };
  const choosePlantImage = (file: File | undefined) => {
    if (!file) return;
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type) || file.size <= 0) { setError("Bitte wähle ein gültiges JPG-, PNG- oder WebP-Bild aus."); return; }
    if (plantFiles.length >= 3) return;
    setError(null); setPlantAnswer(null); setPlantIdentification(null); setPlantNetValidation(null); setPlantOriginalAnswer(null); setPlantAssistantUsageId(null); setPlantNeedsMoreImages(false); setPlantRequestedImages(0); setPlantFiles(current => [...current, file]); setPlantPreviews(current => [...current, URL.createObjectURL(file)]);
  };
  const resetPlantImages = () => { plantPreviews.forEach(URL.revokeObjectURL); setPlantFiles([]); setPlantPreviews([]); setPlantAnswer(null); setPlantIdentification(null); setPlantNetValidation(null); setPlantOriginalAnswer(null); setPlantAssistantUsageId(null); setPlantNeedsMoreImages(false); setPlantRequestedImages(0); };
  const identifyPlant = async () => {
    if (!available || !plantFiles[0] || plantIdentify.isPending) return;
    try { setError(null); const images = await Promise.all(plantFiles.map(file => readImageAsBase64(file, { forAnalysis: true }))); const [first, ...additionalImages] = images; plantIdentify.mutate({ clientRequestId: requestId(), imageBase64: first.base64, mimeType: first.mimeType as "image/jpeg" | "image/png" | "image/webp", additionalImages: additionalImages.map(image => ({ imageBase64: image.base64, mimeType: image.mimeType as "image/jpeg" | "image/png" | "image/webp" })), note: plantNote.trim() || undefined }); }
    catch (reason) { setError(imageErrorMessage(reason, locale)); }
  };
  const analyzeAquarium = () => {
    if (!available || !selectedAquariumId || aquariumAnalyze.isPending) return;
    setError(null); aquariumAnalyze.mutate({ clientRequestId: requestId(), habitatId: Number(selectedAquariumId), question: aquariumQuestion.trim() || undefined });
  };
  const statusCode = platform.isLoading ? "AI/CHECKING" : platform.isError ? "AI/STATUS_ERROR" : !auth.isAuthenticated ? "AUTH/REQUIRED" : platform.data?.aiReason === "pending_migration" ? "AI/STAGING_HOLD" : platform.data?.aiAssistant !== "available" ? "AI/POLICY_LOCK" : !aiConsent ? "AI/CONSENT_REQUIRED" : "AI/READY";
  const gate = !available ? <StatePanel code={statusCode} state={platform.isLoading ? "loading" : platform.isError ? "error" : "locked"} title={!auth.isAuthenticated ? t("profile.signedOut") : platform.data?.aiReason === "pending_migration" ? locale === "de" ? "KI-BEREICH GESPERRT" : "AI AREA LOCKED" : !aiConsent ? locale === "de" ? "FREIGABE ERFORDERLICH" : "CONSENT REQUIRED" : t("assistant.rule")} body={!auth.isAuthenticated ? "Melde dich an, damit Fragen, Bildanalyse und deine privaten Aquariumwerte geschützt bleiben." : platform.data?.aiReason === "pending_migration" ? "Der KI-Dienst ist technisch vorübergehend nicht erreichbar. Es werden keine Scheinantworten angezeigt." : !aiConsent ? "Aktiviere im Profil die sichere Verarbeitung von KI-Anfragen. Du kannst die Freigabe jederzeit widerrufen." : "Der KI-Dienst ist momentan nicht erreichbar. Es werden keine Scheinantworten angezeigt."} action={!auth.isAuthenticated ? <button className="primary-action" type="button" onClick={startLogin}><ShieldCheck size={16} />{t("common.signIn")}</button> : !aiConsent ? <Link href="/profile" className="primary-action"><LockKeyhole size={16} />{locale === "de" ? "ZUM PROFIL" : "OPEN PROFILE"}</Link> : undefined} /> : null;

  if (AI_MAINTENANCE) return <div className="reference-page reference-page--ai assistant-page">
    <ReferenceHero tone="ai" image={REFERENCE_ASSETS.ai} eyebrow="BLACKWATERLEAF KI" title="KI-ASSISTENT" subtitle="Der KI-Bereich wird gerade übersichtlicher und zuverlässiger eingerichtet." icon={Bot} badge="WARTUNG" />
    <ReferenceEmptyState tone="ai" code="KI / WARTUNG" title="KURZ PAUSIERT" body="Fragen, Pflanzenbestimmung und Aquarium-Analyse sind während der Überarbeitung vorübergehend nicht verfügbar. Deine privaten Daten bleiben geschützt und werden nicht verändert." />
  </div>;

  return (
    <div className="reference-page reference-page--ai assistant-page">
      <ReferenceHero tone="ai" image={REFERENCE_ASSETS.ai} eyebrow="BLACKWATERLEAF KI" title="KI-ASSISTENT" subtitle={locale === "de" ? "Echte KI-Hilfe. Keine Scheinantwort. Antworten machen Unsicherheit transparent." : "Real AI help. No pretend answers. Uncertainty stays transparent."} icon={Bot} badge="PRIVAT / OPTIONAL" />
      <ReferenceActionGrid tone="ai" activeTitle={selectedAction === "chat" ? "Frage stellen" : selectedAction === "plant" ? "Pflanze bestimmen" : selectedAction === "aquarium" ? "Aquarium verstehen" : undefined} inlinePanel={<div className="reference-inline-choice"><button type="button" className={tool === "chat" ? "active" : ""} onClick={() => activate("chat")}><Send size={15} />Frage stellen</button><button type="button" className={tool === "plant" ? "active" : ""} onClick={() => activate("plant")}><Sprout size={15} />Pflanze bestimmen</button><button type="button" className={tool === "aquarium" ? "active" : ""} onClick={() => activate("aquarium")}><Fish size={15} />Aquarium verstehen</button></div>} actions={[{ title: "Frage stellen", note: "Gespräch beginnen", icon: Send, image: REFERENCE_ASSETS.ai, onActivate: () => activate("chat") }, { title: "Pflanze bestimmen", note: "Eigenes Foto sicher prüfen", icon: ScanSearch, image: WORLD_ASSETS.botany, onActivate: () => activate("plant") }, { title: "Aquarium verstehen", note: "Dein Becken gezielt analysieren", icon: Fish, image: WORLD_ASSETS.aquarium, onActivate: () => activate("aquarium") }, { title: "Wissen & Quellen", note: "Quellenwissen öffnen", icon: BookOpen, image: WORLD_ASSETS.terrarium, href: "/knowledge" }]} />
      <section id="ai-workflow" className="glass-panel reference-after-actions assistant-workflow" aria-live="polite">
        <div className="assistant-workflow__tabs" role="tablist" aria-label="KI-Werkzeug auswählen"><button className={tool === "chat" ? "active" : ""} type="button" role="tab" aria-selected={tool === "chat"} onClick={() => setTool("chat")}><Send size={15} />Frage stellen</button><button className={tool === "plant" ? "active" : ""} type="button" role="tab" aria-selected={tool === "plant"} onClick={() => setTool("plant")}><Sprout size={15} />Pflanze bestimmen</button><button className={tool === "aquarium" ? "active" : ""} type="button" role="tab" aria-selected={tool === "aquarium"} onClick={() => setTool("aquarium")}><Fish size={15} />Aquarium verstehen</button></div>
        {gate ?? (tool === "chat" ? <div className="assistant-workflow__body"><div className="form-heading"><div><p className="eyebrow">[AI/READY]</p><h2>{locale === "de" ? "FRAGE DEINE WELT" : "ASK YOUR WORLD"}</h2></div><span className="system-chip">GPT-5 MINI</span></div><AIChatBox messages={messages} onSendMessage={sendMessage} isLoading={chat.isPending} height="520px" placeholder={locale === "de" ? "Schreibe eine naturbezogene Frage …" : "Write a nature-related question …"} emptyStateMessage={locale === "de" ? "Beschreibe eine Beobachtung oder stelle eine konkrete Frage." : "Describe an observation or ask a specific question."} suggestedPrompts={locale === "de" ? ["Wie dokumentiere ich eine neue Pflanzenbeobachtung?", "Worauf sollte ich beim Wasserwechsel achten?"] : ["How do I document a new plant observation?", "What should I note during a water change?"]} /></div> : tool === "plant" ? <div className="assistant-workflow__body"><div className="form-heading"><div><p className="eyebrow">[BILDPRÜFUNG / 1–3 EINZELBILDER]</p><h2>PFLANZE BESTIMMEN</h2></div><span className="system-chip">KEINE SPEICHERUNG</span></div><p className="assistant-workflow__intro">Starte mit einem Foto. Wenn diagnostische Merkmale fehlen, fragt die KI gezielt nach einem oder zwei weiteren Einzelbildern – niemals nach einem 4er-Raster.</p><div className="assistant-image-picker">{plantFiles.length ? <div className="assistant-image-sequence"><img src={plantPreviews[0]} alt="Erstes Pflanzenfoto" /><div className="assistant-image-sequence__meta"><strong>FOTO 1 · GESAMTANSICHT</strong><small>{plantFiles.length} von maximal 3 Einzelbildern</small></div><button type="button" className="icon-button" onClick={resetPlantImages} aria-label="Bilder entfernen"><X size={17} /></button></div> : <label><Camera size={28} /><strong>FOTO 1 AUSWÄHLEN</strong><small>JPG, PNG oder WebP · maximal 8 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choosePlantImage(event.target.files?.[0])} /></label>}</div>{plantFiles.length > 1 ? <div className="assistant-image-thumbnails" aria-label="Zusätzliche Einzelbilder">{plantPreviews.slice(1).map((preview, index) => <img key={preview} src={preview} alt={`Zusatzfoto ${index + 2}`} />)}</div> : null}{plantNeedsMoreImages && plantFiles.length < 3 ? <label className="secondary-action assistant-add-image"><Camera size={16} />{plantRequestedImages === 2 ? "ZWEI WEITERE EINZELBILDER HINZUFÜGEN" : "EIN WEITERES EINZELBILD HINZUFÜGEN"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choosePlantImage(event.target.files?.[0])} /></label> : null}<label className="field"><span>OPTIONALE BEOBACHTUNG</span><textarea value={plantNote} onChange={event => setPlantNote(event.target.value)} maxLength={500} placeholder="Zum Beispiel Standort, Blattunterseite oder Wuchsform …" /></label><button className="primary-action assistant-submit" type="button" disabled={!plantFiles.length || plantIdentify.isPending} onClick={identifyPlant}>{plantIdentify.isPending ? <Loader2 size={16} className="spin" /> : <ScanSearch size={16} />} {plantFiles.length > 1 ? "PFLANZE MIT BILDERN PRÜFEN" : "PFLANZE MIT KI ANALYSIEREN"}</button>{plantIdentify.isPending ? <div className="assistant-analysis-loading" role="status" aria-live="polite"><Loader2 size={18} className="spin" /><div><strong>KI / ANALYSE LÄUFT</strong><span>Bildmerkmale werden geprüft. Bitte diese Seite geöffnet lassen.</span></div></div> : null}{plantAnswer ? <><article className="assistant-result"><Streamdown>{plantAnswer}</Streamdown></article>{plantOriginalAnswer && plantAssistantUsageId ? <PlantCorrectionForm originalAnswer={plantOriginalAnswer} assistantUsageId={plantAssistantUsageId} /> : null}</> : null}</div> : <div className="assistant-workflow__body"><div className="form-heading"><div><p className="eyebrow">[PRIVAT / PROFIL]</p><h2>AQUARIUM VERSTEHEN</h2></div><span className="system-chip">EIGENE WERTE</span></div><p className="assistant-workflow__intro">Die Analyse verwendet ausschließlich das von dir ausgewählte private Aquarium und dessen gespeicherte Angaben. Fehlende Werte werden als Lücke benannt, nicht erfunden.</p>{habitats.isLoading ? <p className="form-status"><Loader2 size={14} className="spin" />Aquarien werden geladen …</p> : aquariums.length === 0 ? <div className="assistant-empty-link"><Fish size={25} /><strong>NOCH KEIN AQUARIUM ANGELEGT</strong><p>Lege zuerst im Aquaristik-Bereich dein Becken und seine Wasserwerte an.</p><Link href="/world/aquarium">AQUARIUM ANLEGEN</Link></div> : <><label className="field"><span>PRIVATES AQUARIUM</span><select value={selectedAquariumId} onChange={event => setSelectedAquariumId(event.target.value)}>{aquariums.map(aquarium => <option key={aquarium.id} value={aquarium.id}>{aquarium.name}</option>)}</select></label><label className="field"><span>DEINE FRAGE (OPTIONAL)</span><textarea value={aquariumQuestion} onChange={event => setAquariumQuestion(event.target.value)} maxLength={1_200} placeholder="Zum Beispiel: Welche Angaben sollte ich als Nächstes prüfen?" /></label><button className="primary-action assistant-submit" type="button" disabled={!selectedAquariumId || aquariumAnalyze.isPending} onClick={analyzeAquarium}>{aquariumAnalyze.isPending ? <Loader2 size={16} className="spin" /> : <Fish size={16} />} AQUARIUM MIT KI ANALYSIEREN</button>{aquariumAnswer ? <article className="assistant-result"><Streamdown>{aquariumAnswer}</Streamdown></article> : null}</>}</div>)}
        {error ? <p className="form-status" role="alert">{error}</p> : null}
        {available ? <p className="form-status">Bis zu 10 erfolgreiche KI-Anfragen pro Tag. Pro erfolgreicher Antwort werden einmalig 3 XP gutgeschrieben.</p> : null}
      </section>
      {!available ? <ReferenceEmptyState tone="ai" code="KI / TRANSPARENT" title={locale === "de" ? "KEINE SCHEINANTWORT" : "NO PRETEND ANSWER"} body={locale === "de" ? "Alle drei Funktionen sind implementiert. Sie werden erst nach Anmeldung, Freigabe und verfügbarem Dienst ausgeführt." : "All three functions are implemented. They run only after sign-in, consent and an available service."} /> : null}
    </div>
  );
}
