import { useAuth } from "@/_core/hooks/useAuth";
import { ObservatoryActionCluster, ObservatoryContextHeader, ObservatoryStateSurface, type ObservatoryAction, type ObservatoryTone } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { MapView } from "@/components/Map";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { imageErrorMessage, readImageAsBase64 } from "@/lib/files";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, Bot, Camera, Check, Fish, HelpCircle, Leaf, LibraryBig, List, Map as MapIcon, MapPin, MessageCircle, Plus, Save, ShieldCheck, Sprout } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useParams } from "wouter";

const REALMS = {
  botany: { api: "botany" as const, tone: "botany" as ObservatoryTone, eyebrow: "PFLANZEN · FACHBEREICH", title: "BOTANIK", subtitle: "Pflanzen, Beobachtungen und quellengebundenes Wissen.", image: REFERENCE_ASSETS.botany, icon: Leaf },
  aquarium: { api: "aquarium" as const, tone: "aquarium" as ObservatoryTone, eyebrow: "WASSER · FACHBEREICH", title: "AQUARISTIK", subtitle: "Becken, Werte, Beobachtungen und Artenwissen.", image: REFERENCE_ASSETS.aquarium, icon: Fish },
  terrarium: { api: "terrarium" as const, tone: "terrarium" as ObservatoryTone, eyebrow: "LEBENSRAUM · FACHBEREICH", title: "TERRARISTIK", subtitle: "Terrarien, Beobachtungen und fachliche Einordnung.", image: REFERENCE_ASSETS.terrarium, icon: Sprout },
};

function ObservationResponsePanel({ observationId }: { observationId: number }) {
  const auth = useAuth();
  const [content, setContent] = useState("");
  const responses = trpc.observations.responses.useQuery({ observationId }, { enabled: auth.isAuthenticated, retry: false });
  const respond = trpc.observations.respond.useMutation({ onSuccess: () => { setContent(""); void responses.refetch(); } });
  if (!auth.isAuthenticated) return <small className="observation-response-hint">ANMELDEN FÜR FACHLICHE ANTWORT</small>;
  return <div className="observation-response-panel"><div className="observation-response-summary"><MessageCircle size={13} />{responses.data?.length ?? 0} Antworten · <Check size={13} /> Bestätigen · <HelpCircle size={13} /> Frage</div><div className="observation-response-actions"><button type="button" title="Beobachtung bestätigen" aria-label="Beobachtung bestätigen" onClick={() => respond.mutate({ observationId, kind: "confirm", content: null })}><Check size={14} /></button><button type="button" title="Frage stellen" aria-label="Frage stellen" onClick={() => { const next = window.prompt("Deine Frage zur Beobachtung"); if (next?.trim()) respond.mutate({ observationId, kind: "question", content: next.trim() }); }}><HelpCircle size={14} /></button><input value={content} maxLength={160} onChange={event => setContent(event.target.value)} placeholder="Taxon-Vorschlag …" /><button type="button" title="Taxon-Vorschlag senden" aria-label="Taxon-Vorschlag senden" disabled={!content.trim() || respond.isPending} onClick={() => respond.mutate({ observationId, kind: "taxon_suggestion", proposedScientificName: content.trim(), content: null })}><MessageCircle size={14} /></button></div></div>;
}

function newClientId() { return globalThis.crypto?.randomUUID?.() ?? `bwl-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function hasVerifiedCatalogImage(item: { imageUrl?: string | null; imageSourceUrl?: string | null; imageLicense?: string | null; imageAttribution?: string | null; imageVerifiedAt?: Date | string | null }) {
  return Boolean(item.imageUrl && item.imageSourceUrl && item.imageLicense && item.imageAttribution && item.imageVerifiedAt);
}

function actionsFor(realm: keyof typeof REALMS): ObservatoryAction[] {
  if (realm === "botany") return [
    { title: "Meine Pflanzen", note: "Private Sammlung öffnen", icon: LibraryBig, image: WORLD_ASSETS.botany, href: "/profile#habitats" },
    { title: "Pflanze hinzufügen", note: "Anlage privat anlegen", icon: Plus, image: REFERENCE_ASSETS.botany, href: "/profile#habitats" },
    { title: "Pflanze bestimmen", note: "Foto sicher mit KI prüfen", icon: Leaf, image: REFERENCE_ASSETS.ai, href: "/assistant#plant" },
    { title: "Pflegewissen", note: "Quellenwissen öffnen", icon: BookOpen, image: WORLD_ASSETS.terrarium, href: "/knowledge" },
  ];
  if (realm === "aquarium") return [
    { title: "Meine Aquarien", note: "Becken privat verwalten", icon: Fish, image: WORLD_ASSETS.aquarium, href: "/profile#habitats" },
    { title: "Aquarium hinzufügen", note: "Neues Becken anlegen", icon: Plus, image: REFERENCE_ASSETS.aquarium, href: "/profile#habitats" },
    { title: "Wasserwerte", note: "Private Messwerte öffnen", icon: LibraryBig, image: REFERENCE_ASSETS.aquarium, href: "/profile#habitats" },
    { title: "KI zur Aquaristik", note: "Allgemeine Frage stellen", icon: Bot, image: REFERENCE_ASSETS.ai, href: "/assistant" },
  ];
  return [
    { title: "Terrarium fotografieren", note: "Foto sicher auswählen", icon: Camera, image: WORLD_ASSETS.terrarium, href: "/flow/foto?realm=terrarium" },
    { title: "Terrarium entdecken", note: "Naturwelten öffnen", icon: Sprout, image: REFERENCE_ASSETS.terrarium, href: "/explore" },
    { title: "Wissen", note: "Quellenwissen öffnen", icon: BookOpen, image: WORLD_ASSETS.botany, href: "/knowledge" },
    { title: "KI fragen", note: "Allgemeine Frage stellen", icon: Bot, image: REFERENCE_ASSETS.ai, href: "/assistant" },
  ];
}

export default function Realm() {
  const params = useParams<{ realm: string }>();
  const [location, setLocation] = useLocation();
  const directSegment = (typeof window !== "undefined" ? window.location.pathname : location).split("/").filter(Boolean)[0];
  const directRealm = ({ botanik: "botany", aquaristik: "aquarium", terraristik: "terrarium" } as Record<string, string>)[directSegment] ?? directSegment;
  const requestedRealm = directRealm in REALMS ? directRealm : params.realm;
  const realmKey = (requestedRealm in REALMS ? requestedRealm : "botany") as keyof typeof REALMS;
  const realm = REALMS[realmKey];
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const observations = trpc.observations.mine.useQuery({ realm: realm.api }, { enabled: auth.isAuthenticated, retry: false });
  const publicObservations = trpc.observations.publicFeed.useQuery({ realm: realm.api, limit: 12 }, { retry: false });
  const catalog = trpc.search.catalogByRealm.useQuery({ realm: realm.api, limit: 6 }, { retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const createObservation = trpc.observations.create.useMutation();
  const updateObservation = trpc.observations.update.useMutation();
  const uploadImage = trpc.observations.uploadImage.useMutation();
  const setConsent = trpc.profile.setConsent.useMutation();
  const plantIdentify = trpc.assistant.plantIdentify.useMutation();
  const [subject, setSubject] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [note, setNote] = useState("");
  const [metricKey, setMetricKey] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [metricUnit, setMetricUnit] = useState("");
  const [publish, setPublish] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);
  const [aiReviewRequested, setAiReviewRequested] = useState(false);
  const [observedAt, setObservedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [wildStatus, setWildStatus] = useState<"wild" | "cultivated" | "captive" | "unknown">("unknown");
  const [geoprivacy, setGeoprivacy] = useState<"private" | "obscured" | "public" | "embargoed">("private");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "ready" | "denied">("idle");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [dataView, setDataView] = useState<"map" | "list">("map");
  const [observationMapError, setObservationMapError] = useState<string | null>(null);
  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationStatus("denied"); return; }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(position => { setLatitude(position.coords.latitude); setLongitude(position.coords.longitude); setLocationStatus("ready"); }, () => setLocationStatus("denied"), { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 });
  };

  const submitObservation = async (event: FormEvent) => {
    event.preventDefault(); setStatus(null);
    try {
      if (publish && !consentMap.get("observation_publishing")) await setConsent.mutateAsync({ purpose: "observation_publishing", granted: true, policyVersion: "web-1.0.5" });
      if ((latitude !== null || longitude !== null) && !consentMap.get("location_processing")) await setConsent.mutateAsync({ purpose: "location_processing", granted: true, policyVersion: "web-1.0.5" });
      if (publish && geoprivacy !== "private" && (latitude === null || longitude === null)) throw new Error("public_generalized_coordinates_required");
      if (image && !consentMap.get("media_processing")) await setConsent.mutateAsync({ purpose: "media_processing", granted: true, policyVersion: "web-1.0.5" });
      if (aiReviewRequested && !consentMap.get("ai_processing")) await setConsent.mutateAsync({ purpose: "ai_processing", granted: true, policyVersion: "web-1.0.5" });
      const raw = metricValue.trim();
      const value = raw !== "" && /^-?\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : raw;
      const metrics = metricKey.trim() && raw !== "" ? [{ key: metricKey.trim(), value, unit: metricUnit.trim() || undefined }] : [];
      const encodedImage = image ? await readImageAsBase64(image) : null;
      const created = await createObservation.mutateAsync({ clientId: newClientId(), realm: realm.api, subject: subject.trim() || null, scientificName: scientificName.trim() || null, note: note.trim() || null, metrics, evidenceState: "unverified", userStatus: helpRequested ? "help_requested" : "saved", observedAt: observedAt ? new Date(observedAt).toISOString() : null, basisOfRecord: "human_observation", wildStatus, latitude, longitude, coordinateUncertaintyM: latitude !== null ? 500 : null, publicLatitude: publish && geoprivacy !== "private" ? (geoprivacy === "public" ? latitude : Number(latitude?.toFixed(1))) : null, publicLongitude: publish && geoprivacy !== "private" ? (geoprivacy === "public" ? longitude : Number(longitude?.toFixed(1))) : null, geoprivacy, embargoUntil: null, aiCandidates: [], aiModel: null, aiCatalogVersion: null, visibility: "private" });
      const observationId = Number(created.id);
      let revision = created.revision;
      if (encodedImage) await uploadImage.mutateAsync({ observationId, ...encodedImage });
      if (encodedImage && aiReviewRequested && realm.api === "botany") {
        const aiResult = await plantIdentify.mutateAsync({ clientRequestId: newClientId(), imageBase64: encodedImage.base64, mimeType: encodedImage.mimeType as "image/jpeg" | "image/png" | "image/webp", additionalImages: [], note: note.trim() || undefined });
        const aiCandidates = (aiResult.identification?.candidates ?? []).slice(0, 3).map(candidate => ({ scientificName: candidate.scientificName, taxonRank: null, confidenceBand: candidate.confidence === "moderate" ? "medium" as const : candidate.confidence, confidencePercent: null, reason: candidate.reason, source: "BlackWaterLeaf KI-Bildprüfung", sourceUrl: null }));
        const updated = await updateObservation.mutateAsync({ id: observationId, expectedRevision: revision, aiCandidates, aiModel: aiResult.model, aiCatalogVersion: "catalog-live" });
        revision = updated.revision;
      }
      if (publish) await updateObservation.mutateAsync({ id: observationId, expectedRevision: revision, visibility: "public", geoprivacy, publicLatitude: geoprivacy === "public" ? latitude : Number(latitude?.toFixed(1)), publicLongitude: geoprivacy === "public" ? longitude : Number(longitude?.toFixed(1)), userStatus: helpRequested ? "help_requested" : "saved" });
      setSubject(""); setScientificName(""); setNote(""); setMetricKey(""); setMetricValue(""); setMetricUnit(""); setPublish(false); setHelpRequested(false); setAiReviewRequested(false); setWildStatus("unknown"); setGeoprivacy("private"); setLatitude(null); setLongitude(null); setLocationStatus("idle"); setImage(null);
      await utils.observations.mine.invalidate({ realm: realm.api });
      setStatus(locale === "de" ? "Beobachtung sicher gespeichert." : "Observation saved securely.");
    } catch (error) { setStatus(imageErrorMessage(error, locale)); }
  };

  return (
    <div className={`observatory-route observatory-route--${realm.tone} realm-page`}>
      <ObservatoryContextHeader tone={realm.tone} image={realm.image} eyebrow={realm.eyebrow} title={realm.title} subtitle={realm.subtitle} icon={realm.icon} />
      <ObservatoryActionCluster tone={realm.tone} actions={actionsFor(realmKey).map(action => (action.title === "Pflanze hinzufügen" || action.title === "Aquarium hinzufügen" || action.title === "Terrarium fotografieren") ? { ...action, href: undefined, targetId: "capture", onActivate: () => setCaptureOpen(true) } : action)} />
      <section className={`realm-observation-surface realm-observation-surface--${realm.tone}`} aria-labelledby="realm-observation-heading">
        <div className="realm-observation-heading"><div><span className="eyebrow">KARTE &amp; LISTE · SYNCHRONISIERT</span><h2 id="realm-observation-heading">BEOBACHTEN. EINORDNEN. TEILEN.</h2></div><span className={`observatory-status observatory-status--${publicObservations.isError ? "error" : publicObservations.isLoading ? "loading" : "ready"}`}><i />{publicObservations.isError ? "NICHT VERFÜGBAR" : publicObservations.isLoading ? "SYNC …" : "BEREIT"}</span></div>
        <div className="realm-observation-toolbar"><div className="observatory-filter-pills" role="group" aria-label="Fachbereich auswählen">{([{ key: "botany", label: "Botanik" }, { key: "aquarium", label: "Aquaristik" }, { key: "terrarium", label: "Terraristik" }] as const).map(choice => <button type="button" key={choice.key} className={realmKey === choice.key ? "active" : ""} aria-pressed={realmKey === choice.key} onClick={() => setLocation(`/${choice.key === "botany" ? "botanik" : choice.key === "aquarium" ? "aquaristik" : "terraristik"}`)}>{choice.label}</button>)}</div><div className="observatory-view-toggle" role="group" aria-label="Ansicht"><button type="button" className={dataView === "map" ? "active" : ""} aria-pressed={dataView === "map"} onClick={() => setDataView("map")}><MapIcon size={15} /> Karte</button><button type="button" className={dataView === "list" ? "active" : ""} aria-pressed={dataView === "list"} onClick={() => setDataView("list")}><List size={15} /> Liste</button></div></div>
        <div className={`realm-observation-grid realm-observation-grid--${dataView}`}>
          <div className={`realm-map-panel ${publicObservations.isError || publicObservations.isLoading || !publicObservations.data?.length ? "realm-map-panel--state" : ""}`}>
            {publicObservations.isLoading ? <><MapPin size={30} /><strong>Beobachtungen werden synchronisiert</strong><small>Öffentliche Orte werden erst nach erfolgreicher Prüfung angezeigt.</small></> : publicObservations.isError ? <><MapPin size={30} /><strong>Karte derzeit nicht verfügbar</strong><small>Die öffentlichen Beobachtungen konnten nicht geladen werden.</small><button type="button" className="secondary-action" onClick={() => void publicObservations.refetch()}>ERNEUT VERSUCHEN</button></> : observationMapError ? <><MapPin size={30} /><strong>Kartenbasis derzeit nicht verfügbar</strong><small>{observationMapError}</small><button type="button" className="secondary-action" onClick={() => { setObservationMapError(null); void publicObservations.refetch(); }}>ERNEUT VERSUCHEN</button></> : <>
              <MapView
                className="realm-map-panel__map"
                initialCenter={{ lat: 20, lng: 10 }}
                initialZoom={2}
                onMapError={error => setObservationMapError(error.message)}
              />
              <div className="realm-map-panel__status"><MapPin size={18} /><strong>{publicObservations.data?.length ? `${publicObservations.data.length} freigegebene Beobachtungen` : "Keine Kartenpunkte freigegeben"}</strong><small>Geschützte Orte · genaue Positionen bleiben privat. Es werden ausschließlich explizit freigegebene, generalisierte Orte angezeigt.</small></div>
            </>}
          </div>
          <div className="realm-catalog-list"><div className="realm-catalog-list__heading"><span>BEOBACHTUNGEN · {realm.title}</span><a href="/explore"><span>KARTE &amp; LISTE</span><ArrowRight size={14} /></a></div>{publicObservations.isLoading ? <p className="realm-inline-state">Beobachtungen werden synchronisiert …</p> : publicObservations.isError ? <p className="realm-inline-state">Beobachtungen derzeit nicht erreichbar. Private Daten bleiben geschützt.</p> : publicObservations.data?.length ? publicObservations.data.slice(0, 4).map(item => <div className="realm-data-row" key={item.id}><span className="realm-data-row__icon">{realmKey === "aquarium" ? <Fish size={19} /> : realmKey === "terrarium" ? <Sprout size={19} /> : <Leaf size={19} />}</span><span><strong>{item.scientificName ?? item.subject ?? "Unbestimmte Beobachtung"}</strong><small>{item.evidenceState === "confirmed" ? "Wissenschaftlich geprüft" : "Nachweis wird geprüft"}</small><ObservationResponsePanel observationId={Number(item.id)} /></span></div>) : <p className="realm-inline-state">Noch keine öffentlichen Beobachtungen in diesem Bereich.</p>}</div>
        </div>
        <div className="realm-taxonomy-strip"><div className="realm-catalog-list__heading"><span>KATALOG · ARTEN</span><a href={`/catalog?realm=${realm.api}`}><span>MEHR ANZEIGEN</span><ArrowRight size={14} /></a></div><div className="realm-taxonomy-grid">{catalog.isLoading ? <p className="realm-inline-state">Katalog wird synchronisiert …</p> : catalog.isError ? <p className="realm-inline-state">Der Katalog ist derzeit nicht erreichbar. Bitte später erneut versuchen.</p> : catalog.data?.length ? catalog.data.slice(0, 4).map(item => <a className="realm-taxon-row" key={`${item.type}-${item.id}`} href={item.type === "aquarium" ? `/aquarium-fish/${item.id}` : `/plant/${item.id}`}>{hasVerifiedCatalogImage(item) ? <img src={item.imageUrl!} alt="" /> : <span className="realm-taxon-row__placeholder" aria-label="Bildnachweis offen">{item.type === "aquarium" ? <Fish size={20} /> : <Leaf size={20} />}</span>}<span><strong>{item.acceptedScientificName ?? item.scientificName}</strong><small>{hasVerifiedCatalogImage(item) ? item.family ?? "Katalogdaten" : "Bildnachweis offen"}</small></span><ArrowRight size={16} /></a>) : <p className="realm-inline-state">Für diesen Bereich sind noch keine veröffentlichten Katalogtaxa vorhanden.</p>}</div></div>
      </section>
      {auth.loading ? <StatePanel code="AUTH/LOAD" state="loading" title={t("common.loading")} body="Dein geschützter Bereich wird geprüft …" /> : !auth.isAuthenticated ? <ObservatoryStateSurface tone={realm.tone} code="AUTH / REQUIRED" title={t("realm.signedOut")} body={t("home.truth.body")} action={<button type="button" className="primary-action" onClick={startLogin}><ShieldCheck size={16} />{t("common.signIn")}</button>} /> : captureOpen ? (
        <form id="capture" className="observation-form observatory-form-panel" onSubmit={submitObservation}>
          <div className="form-heading"><div><span className="eyebrow">[PRIVATE_CAPTURE]</span><h2>{locale === "de" ? "BEOBACHTUNG ERFASSEN" : "CAPTURE OBSERVATION"}</h2></div><span className="system-chip">V1</span></div>
          <p>{locale === "de" ? "Erfasse nur, was du selbst beobachtest. Der Eintrag bleibt standardmäßig privat und ungeprüft." : "Record only what you observe. The entry stays private and unverified by default."}</p>
          <div className="form-grid">
            <label className="field"><span>{locale === "de" ? "Beobachtungszeit" : "Observation time"}</span><input type="datetime-local" value={observedAt} onChange={event => setObservedAt(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Kontext" : "Context"}</span><select value={wildStatus} onChange={event => setWildStatus(event.target.value as typeof wildStatus)}><option value="unknown">Unbekannt</option><option value="wild">Wildfund</option><option value="cultivated">Kultiviert</option><option value="captive">In Haltung</option></select></label>
            <label className="field"><span>{locale === "de" ? "Bereich oder Objekt" : "Area or subject"}</span><input value={subject} maxLength={128} onChange={event => setSubject(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Wissenschaftlicher Name – optional" : "Scientific name – optional"}</span><input value={scientificName} maxLength={160} onChange={event => setScientificName(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Messwertbezeichnung – optional" : "Metric label – optional"}</span><input value={metricKey} maxLength={64} onChange={event => setMetricKey(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Messwert – 0 bleibt 0" : "Metric value – 0 stays 0"}</span><input value={metricValue} maxLength={64} onChange={event => setMetricValue(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Einheit – optional" : "Unit – optional"}</span><input value={metricUnit} maxLength={32} onChange={event => setMetricUnit(event.target.value)} /></label>
            <label className="file-field"><Camera size={17} /><span>{image ? image.name : locale === "de" ? "Bild optional auswählen" : "Choose optional image"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] ?? null)} /></label>
          </div>
          <label className="field"><span>{locale === "de" ? "Deine Beobachtung" : "Your observation"}</span><textarea required rows={5} maxLength={2000} value={note} onChange={event => setNote(event.target.value)} /></label>
          <div className="form-grid">
            <label className="field"><span>ORTSSCHUTZ</span><select value={geoprivacy} onChange={event => setGeoprivacy(event.target.value as typeof geoprivacy)}><option value="private">Privat</option><option value="obscured">Vergröbert</option><option value="public">Öffentlicher Punkt</option></select></label>
            <div className="field"><span>STANDORT</span><button type="button" className="secondary-action" onClick={requestLocation}><MapIcon size={15} />{locationStatus === "ready" ? "STANDORT GESPEICHERT" : locationStatus === "requesting" ? "WIRD ERMITTELT …" : "STANDORT OPTIONAL"}</button></div>
          </div>
          <label className="consent-toggle publish-toggle"><span>{locale === "de" ? "Nach sicherem Speichern ausdrücklich öffentlich freigeben" : "Explicitly publish after secure saving"}</span><input type="checkbox" checked={publish} onChange={event => setPublish(event.target.checked)} /></label>
          <label className="consent-toggle publish-toggle"><span>{locale === "de" ? "Um fachliche Hilfe bitten" : "Ask the community for help"}</span><input type="checkbox" checked={helpRequested} onChange={event => setHelpRequested(event.target.checked)} /></label>
          {realm.api === "botany" && image ? <label className="consent-toggle publish-toggle"><span>KI-KANDIDATEN NACH SPEICHERN PRÜFEN</span><input type="checkbox" checked={aiReviewRequested} onChange={event => setAiReviewRequested(event.target.checked)} /></label> : null}
          <button type="submit" className="primary-action" disabled={createObservation.isPending || updateObservation.isPending || uploadImage.isPending}><Save size={16} />{createObservation.isPending ? t("common.loading") : locale === "de" ? "BEOBACHTUNG SPEICHERN" : "SAVE OBSERVATION"}</button>
          {status ? <p className="form-status" role="status">{status}</p> : null}
        </form>
      ) : <p className="observatory-capture-hint"><strong>BEREIT / PRIVAT</strong><span>Wähle eine Aktion, um eine Anlage oder Beobachtung direkt hier zu erfassen.</span></p>}
      {auth.isAuthenticated && (observations.isLoading ? <StatePanel code="OBS/LOAD" state="loading" title={t("common.loading")} body={t("realm.empty")} /> : observations.isError ? <StatePanel code="OBS/ERROR" state="error" title={t("common.error")} body={t("realm.empty")} /> : !observations.data?.length ? <p className="observatory-list-empty" data-state-code={`OBS / ${realm.api.toUpperCase()} / EMPTY`}>{t("realm.empty")}</p> : <div className="observation-grid">{observations.data.map(item => <article key={item.id} className="observation-card observatory-panel">{item.media[0] ? <img className="observation-media" src={item.media[0].accessUrl} alt="" /> : null}<span className="evidence-chip">{item.evidenceState}</span><span className="evidence-chip">{item.userStatus.replaceAll("_", " ")}</span><span className="evidence-chip">{item.geoprivacy}</span><h2>{item.subject ?? realm.title}</h2>{item.scientificName ? <em>{item.scientificName}</em> : null}{item.note ? <p>{item.note}</p> : null}{item.aiCandidates.length ? <div className="observation-candidates"><small>KI-KANDIDATEN · NICHT VERIFIZIERT</small>{item.aiCandidates.map(candidate => <span key={candidate.scientificName}>{candidate.scientificName}{candidate.confidenceBand ? ` · ${candidate.confidenceBand}` : ""}</span>)}</div> : null}{item.metrics.map(metric => <div key={metric.key} className="metric-row"><span>{metric.key}</span><strong>{String(metric.value)}{metric.unit ? ` ${metric.unit}` : ""}</strong></div>)}<small>{item.visibility} · {new Date(item.updatedAt).toLocaleString(locale)}</small></article>)}</div>)}
    </div>
  );
}
