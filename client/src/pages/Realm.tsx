import { useAuth } from "@/_core/hooks/useAuth";
import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceActionGrid, ReferenceEmptyState, ReferenceHero, type ReferenceAction, type ReferenceTone } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { readImageAsBase64 } from "@/lib/files";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { BookOpen, Bot, Camera, Fish, Leaf, LibraryBig, Plus, Save, ShieldCheck, Sprout } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "wouter";

const REALMS = {
  botany: { api: "botany" as const, tone: "botany" as ReferenceTone, eyebrow: "PFLANZEN WORLD", title: "BOTANIK", subtitle: "Deine Pflanzensammlung.", image: REFERENCE_ASSETS.botany, icon: Leaf },
  aquarium: { api: "aquarium" as const, tone: "aquarium" as ReferenceTone, eyebrow: "AQUARISTIK", title: "AQUARISTIK", subtitle: "Becken, Wasserwerte, Unterwasserwelt.", image: REFERENCE_ASSETS.aquarium, icon: Fish },
  terrarium: { api: "terrarium" as const, tone: "terrarium" as ReferenceTone, eyebrow: "TERRARISTIK", title: "TERRARISTIK", subtitle: "Regenwald im Kleinen.", image: REFERENCE_ASSETS.terrarium, icon: Sprout },
};

function newClientId() { return globalThis.crypto?.randomUUID?.() ?? `bwl-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

function actionsFor(realm: keyof typeof REALMS): ReferenceAction[] {
  if (realm === "botany") return [
    { title: "Meine Pflanzen", note: "Private Sammlung öffnen", icon: LibraryBig, image: WORLD_ASSETS.botany, href: "/profile#habitats" },
    { title: "Pflanze hinzufügen", note: "Anlage privat anlegen", icon: Plus, image: REFERENCE_ASSETS.botany, href: "/profile#habitats" },
    { title: "Pflanze bestimmen", note: "Bildbestimmung wird vorbereitet", icon: Leaf, image: REFERENCE_ASSETS.ai, unavailable: true },
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
  const realmKey = (params.realm in REALMS ? params.realm : "botany") as keyof typeof REALMS;
  const realm = REALMS[realmKey];
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const observations = trpc.observations.mine.useQuery({ realm: realm.api }, { enabled: auth.isAuthenticated, retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const createObservation = trpc.observations.create.useMutation();
  const updateObservation = trpc.observations.update.useMutation();
  const uploadImage = trpc.observations.uploadImage.useMutation();
  const [subject, setSubject] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [note, setNote] = useState("");
  const [metricKey, setMetricKey] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [metricUnit, setMetricUnit] = useState("");
  const [publish, setPublish] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);

  const submitObservation = async (event: FormEvent) => {
    event.preventDefault(); setStatus(null);
    try {
      if (publish && !consentMap.get("observation_publishing")) throw new Error("observation_publishing_consent_required");
      if (image && !consentMap.get("media_processing")) throw new Error("media_processing_consent_required");
      const raw = metricValue.trim();
      const value = raw !== "" && /^-?\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : raw;
      const metrics = metricKey.trim() && raw !== "" ? [{ key: metricKey.trim(), value, unit: metricUnit.trim() || undefined }] : [];
      const created = await createObservation.mutateAsync({ clientId: newClientId(), realm: realm.api, subject: subject.trim() || null, scientificName: scientificName.trim() || null, note: note.trim() || null, metrics, evidenceState: "unverified", visibility: "private" });
      const observationId = Number(created.id);
      if (image) await uploadImage.mutateAsync({ observationId, ...await readImageAsBase64(image) });
      if (publish) await updateObservation.mutateAsync({ id: observationId, expectedRevision: created.revision, visibility: "public" });
      setSubject(""); setScientificName(""); setNote(""); setMetricKey(""); setMetricValue(""); setMetricUnit(""); setPublish(false); setImage(null);
      await utils.observations.mine.invalidate({ realm: realm.api });
      setStatus(locale === "de" ? "Beobachtung sicher gespeichert." : "Observation saved securely.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "observation_save_failed"); }
  };

  return (
    <div className={`reference-page reference-page--${realm.tone}`}>
      <LiveSensorStrip compact />
      <ReferenceHero tone={realm.tone} image={realm.image} eyebrow={realm.eyebrow} title={realm.title} subtitle={realm.subtitle} icon={realm.icon} />
      <ReferenceActionGrid tone={realm.tone} actions={actionsFor(realmKey)} />
      {!auth.isAuthenticated ? <ReferenceEmptyState tone={realm.tone} code="AUTH / REQUIRED" title={t("realm.signedOut")} body={t("home.truth.body")} action={<button type="button" className="primary-action" onClick={startLogin}><ShieldCheck size={16} />{t("common.signIn")}</button>} /> : (
        <form id="capture" className="observation-form glass-panel reference-after-actions" onSubmit={submitObservation}>
          <div className="form-heading"><div><span className="eyebrow">[PRIVATE_CAPTURE]</span><h2>{locale === "de" ? "BEOBACHTUNG ERFASSEN" : "CAPTURE OBSERVATION"}</h2></div><span className="system-chip">V1</span></div>
          <p>{locale === "de" ? "Erfasse nur, was du selbst beobachtest. Der Eintrag bleibt standardmäßig privat und ungeprüft." : "Record only what you observe. The entry stays private and unverified by default."}</p>
          <div className="form-grid">
            <label className="field"><span>{locale === "de" ? "Bereich oder Objekt" : "Area or subject"}</span><input value={subject} maxLength={128} onChange={event => setSubject(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Wissenschaftlicher Name – optional" : "Scientific name – optional"}</span><input value={scientificName} maxLength={160} onChange={event => setScientificName(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Messwertbezeichnung – optional" : "Metric label – optional"}</span><input value={metricKey} maxLength={64} onChange={event => setMetricKey(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Messwert – 0 bleibt 0" : "Metric value – 0 stays 0"}</span><input value={metricValue} maxLength={64} onChange={event => setMetricValue(event.target.value)} /></label>
            <label className="field"><span>{locale === "de" ? "Einheit – optional" : "Unit – optional"}</span><input value={metricUnit} maxLength={32} onChange={event => setMetricUnit(event.target.value)} /></label>
            <label className="file-field"><Camera size={17} /><span>{image ? image.name : locale === "de" ? "Bild optional auswählen" : "Choose optional image"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] ?? null)} /></label>
          </div>
          <label className="field"><span>{locale === "de" ? "Deine Beobachtung" : "Your observation"}</span><textarea required rows={5} maxLength={2000} value={note} onChange={event => setNote(event.target.value)} /></label>
          <label className="consent-toggle publish-toggle"><span>{locale === "de" ? "Nach sicherem Speichern ausdrücklich öffentlich freigeben" : "Explicitly publish after secure saving"}</span><input type="checkbox" checked={publish} onChange={event => setPublish(event.target.checked)} /></label>
          <button type="submit" className="primary-action" disabled={createObservation.isPending || updateObservation.isPending || uploadImage.isPending}><Save size={16} />{createObservation.isPending ? t("common.loading") : locale === "de" ? "BEOBACHTUNG SPEICHERN" : "SAVE OBSERVATION"}</button>
          {status ? <p className="form-status" role="status">{status}</p> : null}
        </form>
      )}
      {auth.isAuthenticated && (observations.isLoading ? <StatePanel code="OBS/LOAD" state="loading" title={t("common.loading")} body={t("realm.empty")} /> : observations.isError ? <StatePanel code="OBS/ERROR" state="error" title={t("common.error")} body={t("realm.empty")} /> : !observations.data?.length ? <ReferenceEmptyState tone={realm.tone} code={`OBS / ${realm.api.toUpperCase()} / EMPTY`} title={t("realm.empty")} body={t("home.truth.body")} /> : <div className="observation-grid">{observations.data.map(item => <article key={item.id} className="observation-card glass-panel">{item.media[0] ? <img className="observation-media" src={item.media[0].accessUrl} alt="" /> : null}<span className="evidence-chip">{item.evidenceState}</span><h2>{item.subject ?? realm.title}</h2>{item.scientificName ? <em>{item.scientificName}</em> : null}{item.note ? <p>{item.note}</p> : null}{item.metrics.map(metric => <div key={metric.key} className="metric-row"><span>{metric.key}</span><strong>{String(metric.value)}{metric.unit ? ` ${metric.unit}` : ""}</strong></div>)}<small>{item.visibility} · {new Date(item.updatedAt).toLocaleString(locale)}</small></article>)}</div>)}
    </div>
  );
}
