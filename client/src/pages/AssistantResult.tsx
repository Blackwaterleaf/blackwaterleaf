import { ObservatoryContextHeader, ObservatoryRoutePage, ObservatoryStateSurface } from "@/components/ObservatoryPrimitives";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, Clock3, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { PlantResultWorkspace } from "./Assistant";

export default function AssistantResult() {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("session") ?? "";
  }, []);
  const result = trpc.assistant.resultBySession.useQuery({ sessionId }, {
    enabled: auth.isAuthenticated && /^[a-f0-9]{64}$/i.test(sessionId),
    retry: false,
  });
  const subject = result.data?.subject ?? "plant";
  const isFish = subject === "fish";
  const backHref = isFish ? "/assistant#fish" : "/assistant#plant";

  if (auth.loading) {
    return <ObservatoryRoutePage tone="ai"><div className="assistant-result-route-loading" role="status"><span className="assistant-analysis-loading__orb"><Clock3 size={20} /></span><div><span className="eyebrow">[KONTO / SESSION]</span><h1>ZUGANG WIRD GEPRÜFT</h1><p>Der geschützte Ergebnisraum wird vorbereitet.</p></div></div></ObservatoryRoutePage>;
  }
  if (!auth.isAuthenticated) {
    return <ObservatoryRoutePage tone="ai"><ObservatoryStateSurface tone="ai" code="AI/LOGIN_REQUIRED" title="ANMELDUNG ERFORDERLICH" body="Der persönliche Ergebnisraum ist nur für angemeldete Konten verfügbar." action={<button type="button" className="primary-action" onClick={() => setLocation("/login")}>ZUM KONTO</button>} /></ObservatoryRoutePage>;
  }
  if (!sessionId || !/^[a-f0-9]{64}$/i.test(sessionId)) {
    return <ObservatoryRoutePage tone="ai"><ObservatoryStateSurface tone="ai" code="AI/RESULT_MISSING" title="ERGEBNIS NICHT GEFUNDEN" body="Diese Ergebnis-Session ist unvollständig. Starte eine neue Analyse." action={<Link className="primary-action" href="/assistant#plant">NEUE ANALYSE</Link>} /></ObservatoryRoutePage>;
  }
  if (result.isLoading) {
    return <ObservatoryRoutePage tone="ai"><div className="assistant-result-route-loading" role="status"><span className="assistant-analysis-loading__orb"><Clock3 size={20} /></span><div><span className="eyebrow">[KI / ERGEBNISRAUM]</span><h1>ERGEBNIS WIRD GELADEN</h1><p>Der geschützte Analysebereich wird vorbereitet.</p><ol><li className="is-active">Session prüfen</li><li>Ergebnis laden</li><li>Evidenz ordnen</li></ol></div></div></ObservatoryRoutePage>;
  }
  if (result.isError || !result.data) {
    return <ObservatoryRoutePage tone="ai"><ObservatoryStateSurface tone="ai" state="error" code="AI/RESULT_EXPIRED" title="ERGEBNIS NICHT MEHR VERFÜGBAR" body="Der geschützte Ergebnisraum ist abgelaufen oder gehört nicht zu diesem Konto. Starte bitte eine neue Analyse." action={<Link className="primary-action" href={backHref}>ZURÜCK ZUR KI</Link>} /></ObservatoryRoutePage>;
  }

  const data = result.data;
  return <ObservatoryRoutePage tone={isFish ? "aquarium" : "ai"} className="assistant-result-route">
    <ObservatoryContextHeader tone={isFish ? "aquarium" : "ai"} eyebrow="BLACKWATERLEAF · KI" title={isFish ? "FISCHBESTIMMUNG" : "PFLANZENBESTIMMUNG"} subtitle="Ein eigener Ergebnisraum für klare Einordnung, Evidenz und nächste Schritte." icon={isFish ? Camera : ShieldCheck} badge="GESCHÜTZTE SESSION">
      <Link className="secondary-action" href={backHref}><ArrowLeft size={15} />NEUE ANALYSE</Link>
    </ObservatoryContextHeader>
    <div className="assistant-result-route__notice"><ShieldCheck size={16} /><span>Die Bilddatei und der Prompt werden nicht gespeichert. Diese Ergebnis-Session bleibt 30 Minuten für dein Konto verfügbar.</span></div>
    <PlantResultWorkspace result={data.identification} answer={`${data.answer}\n\n_${data.disclaimer}_`} originalAnswer={data.originalAnswer} assistantUsageId={data.assistantUsageId} plantNetValidation={data.plantNetValidation} subject={data.subject} onNewAnalysis={() => setLocation(backHref)} onAddImage={() => setLocation(backHref)} />
  </ObservatoryRoutePage>;
}
