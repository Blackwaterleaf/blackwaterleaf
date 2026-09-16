import { useAuth } from "@/_core/hooks/useAuth";
import { HabitatCanvas } from "@/components/HabitatCanvas";
import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { startLogin } from "@/const";
import { displayDimension, dimensionsFromHabitat, grossVolumeLiters, hasCompleteDimensions, parseDimension, type BuilderDimensions, type BuilderHabitatKind } from "@/lib/habitatBuilder";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Box, Check, ClipboardCheck, CloudDownload, Fish, Leaf, Loader2, LockKeyhole, MapPin, PackageCheck, Ruler, Save, ShieldCheck, Sprout, Waves, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

type HabitatRecord = {
  id: string;
  kind: "aquarium" | "plant" | "terrarium";
  name: string;
  details: Record<string, unknown>;
  updatedAt: string;
};

type PlanElement = {
  id: string;
  label: string;
  description: string;
  icon: typeof Fish;
};

type LocalPlan = {
  id: string;
  habitat: BuilderHabitatKind;
  habitatName: string | null;
  dimensions: BuilderDimensions;
  elements: string[];
  createdAt: string;
};

const BUILDER_ASSETS = {
  aquarium: "/manus-storage/aquarium-photorealistic-reference_3c93f1e3.png",
  terrarium: "/manus-storage/terrarium-photorealistic-reference_bcb9db80.png",
} as const;

const ELEMENTS: Record<BuilderHabitatKind, PlanElement[]> = {
  aquarium: [
    { id: "hardscape", label: "Hardscape", description: "Strukturraum, Kippfestigkeit und Freiraum prüfen.", icon: PackageCheck },
    { id: "leaf-litter", label: "Laubschicht", description: "Als Biotopstruktur im Entwurf markieren.", icon: Leaf },
    { id: "plants", label: "Bepflanzung", description: "Nur nach Licht, Platz und Artprofil planen.", icon: Sprout },
    { id: "filter", label: "Filter & Strömung", description: "Wartungszugang und sichere Kabelführung vorsehen.", icon: Waves },
  ],
  terrarium: [
    { id: "structure", label: "Kletterstruktur", description: "Kippfestigkeit und sichere Befestigung prüfen.", icon: PackageCheck },
    { id: "substrate", label: "Substrat & Drainage", description: "Feuchte, Gewicht und Pflegezugang planen.", icon: Leaf },
    { id: "plants", label: "Bepflanzung", description: "Art, Licht- und Feuchtezone getrennt beachten.", icon: Sprout },
    { id: "climate", label: "Klimatechnik", description: "Licht, Wärme, Beregnung und Luftaustausch prüfen.", icon: Waves },
  ],
};

const EMPTY_DIMENSIONS: BuilderDimensions = { lengthCm: null, widthCm: null, heightCm: null };
const STORAGE_KEY = "blackwaterleaf-habitat-builder-v1";

function safeReadPlans(): LocalPlan[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 12) as LocalPlan[] : [];
  } catch {
    return [];
  }
}

function labelFor(kind: BuilderHabitatKind) {
  return kind === "aquarium" ? "Aquarium" : "Terrarium";
}

function numericDetail(details: Record<string, unknown>, field: string): string | null {
  const value = details[field];
  return typeof value === "number" && Number.isFinite(value) ? String(value) : null;
}

export default function HabitatBuilder() {
  const auth = useAuth();
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const [kind, setKind] = useState<BuilderHabitatKind>("aquarium");
  const [selectedHabitatId, setSelectedHabitatId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<BuilderDimensions>(EMPTY_DIMENSIONS);
  const [elements, setElements] = useState<string[]>(ELEMENTS.aquarium.map(item => item.id));
  const [placementChecked, setPlacementChecked] = useState(false);
  const [plans, setPlans] = useState<LocalPlan[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const records = (habitats.data ?? []) as unknown as HabitatRecord[];
  const compatibleHabitat = useMemo(() => records.filter(record => record.kind === kind), [kind, records]);
  const selectedHabitat = compatibleHabitat.find(record => record.id === selectedHabitatId) ?? null;
  const volume = grossVolumeLiters(dimensions);
  const fullDimensions = hasCompleteDimensions(dimensions);
  const actionElements = ELEMENTS[kind];

  useEffect(() => {
    setPlans(safeReadPlans());
  }, []);

  const chooseType = (next: BuilderHabitatKind) => {
    setKind(next);
    setSelectedHabitatId(null);
    setDimensions(EMPTY_DIMENSIONS);
    setElements(ELEMENTS[next].map(item => item.id));
    setPlacementChecked(false);
    setNotice(null);
  };

  const chooseHabitat = (record: HabitatRecord) => {
    setSelectedHabitatId(record.id);
    setDimensions(dimensionsFromHabitat(record.details));
    setPlacementChecked(false);
    setNotice(`„${record.name}“ ist als private Grundlage gewählt.`);
  };

  const startManualPlan = () => {
    setSelectedHabitatId(null);
    setDimensions(EMPTY_DIMENSIONS);
    setPlacementChecked(false);
    setNotice("Neuer Entwurf: Maße werden nur in diesem Browser verwendet, bis du ihn exportierst.");
  };

  const setDimension = (field: keyof BuilderDimensions, value: string) => {
    setDimensions(current => ({ ...current, [field]: parseDimension(value) }));
  };

  const toggleElement = (id: string) => setElements(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

  const storePlan = () => {
    const plan: LocalPlan = {
      id: globalThis.crypto?.randomUUID?.() ?? `plan-${Date.now()}`,
      habitat: kind,
      habitatName: selectedHabitat?.name ?? null,
      dimensions,
      elements,
      createdAt: new Date().toISOString(),
    };
    const next = [plan, ...plans].slice(0, 12);
    setPlans(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setNotice("Entwurf auf diesem Gerät gespeichert.");
  };

  const exportPlan = () => {
    const payload = {
      version: "BlackWaterLeaf Habitat Builder · 1",
      createdAt: new Date().toISOString(),
      habitat: kind,
      privateHabitat: selectedHabitat ? { id: selectedHabitat.id, name: selectedHabitat.name } : null,
      dimensionsCm: dimensions,
      calculatedGrossVolumeLiters: kind === "aquarium" ? volume : null,
      selectedPlanningAreas: actionElements.filter(item => elements.includes(item.id)).map(item => ({ label: item.label, description: item.description })),
      placementCheckConfirmed: placementChecked,
      scope: "Planungsentwurf ohne Haltungs-, Diagnose-, Kauf-, Statik- oder Elektrofreigabe.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `blackwaterleaf-${kind}-entwurf.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Plan als JSON exportiert.");
  };

  if (!auth.isAuthenticated) {
    return <div className="reference-page reference-page--aquarium">
      <LiveSensorStrip compact />
      <ReferenceHero tone="aquarium" image={REFERENCE_ASSETS.aquarium} eyebrow="AQUARISTIK & TERRARISTIK" title="HABITAT PLANEN" subtitle="Dein Entwurf bleibt an dein sicheres Konto gebunden." icon={Ruler} />
      <ReferenceEmptyState tone="aquarium" code="AUTH / REQUIRED" title="DEIN ENTWURF BLEIBT PRIVAT" body="Melde dich an, um deine vorhandenen Aquarien oder Terrarien als Grundlage auszuwählen und Entwürfe lokal zu exportieren." action={<button type="button" className="primary-action" onClick={startLogin}><LockKeyhole size={16} />SICHER ANMELDEN</button>} />
    </div>;
  }

  if (habitats.isLoading) {
    return <div className="reference-page reference-page--aquarium"><LiveSensorStrip compact /><ReferenceHero tone="aquarium" image={REFERENCE_ASSETS.aquarium} eyebrow="AQUARISTIK & TERRARISTIK" title="HABITAT PLANEN" subtitle="Private Grundlagen werden geladen." icon={Ruler} /><section className="habitat-builder-loading"><Loader2 size={22} className="spin" />Private Anlagen werden geladen …</section></div>;
  }

  if (habitats.isError) {
    return <div className="reference-page reference-page--aquarium"><LiveSensorStrip compact /><ReferenceHero tone="aquarium" image={REFERENCE_ASSETS.aquarium} eyebrow="AQUARISTIK & TERRARISTIK" title="HABITAT PLANEN" subtitle="Der private Planungsbereich ist derzeit nicht verfügbar." icon={Ruler} /><ReferenceEmptyState tone="aquarium" state="error" code="HABITAT / ERROR" title="PRIVATE GRUNDLAGEN NICHT GELADEN" body="Bitte versuche es später erneut. Ohne deine privaten Anlagen wird kein Entwurf automatisch befüllt." /></div>;
  }

  return <div className={`reference-page reference-page--${kind} habitat-builder-page`}>
    <LiveSensorStrip compact />
    <ReferenceHero tone={kind} image={kind === "aquarium" ? REFERENCE_ASSETS.aquarium : REFERENCE_ASSETS.terrarium} eyebrow="AQUARISTIK & TERRARISTIK" title="HABITAT PLANEN" subtitle="Maßstab, Struktur und Sicherheitscheck – ohne Scheinfrei­gabe." icon={Ruler} badge="PRIVATER ENTWURF" />

    <section className="habitat-builder-intro glass-panel">
      <div><span className="eyebrow">[01 · GRUNDLAGE]</span><h2>Wähle deine Welt.</h2><p>Der Entwurf verwendet ausschließlich deine privaten Anlagen oder deine manuell eingegebenen Maße. Die fotorealistische Szene ist eine visuelle Referenz, keine Produkt- oder Artenbibliothek.</p></div>
      <div className="habitat-type-control" role="group" aria-label="Habitat-Typ wählen">
        <button type="button" className={kind === "aquarium" ? "active" : ""} onClick={() => chooseType("aquarium")}><Fish size={17} />Aquarium</button>
        <button type="button" className={kind === "terrarium" ? "active" : ""} onClick={() => chooseType("terrarium")}><Box size={17} />Terrarium</button>
      </div>
    </section>

    <section className="habitat-builder-source">
      <div className="habitat-builder-source__heading"><span className="eyebrow">[PRIVATE / AUSWAHL]</span><h2>Bestehende Anlage nutzen</h2></div>
      {compatibleHabitat.length ? <div className="habitat-source-grid">{compatibleHabitat.map(record => <button key={record.id} type="button" onClick={() => chooseHabitat(record)} className={`habitat-source-card ${selectedHabitatId === record.id ? "is-selected" : ""}`}><span>{kind === "aquarium" ? <Fish size={18} /> : <Box size={18} />}</span><strong>{record.name}</strong><small>{numericDetail(record.details, "volumeLiters") ? `${numericDetail(record.details, "volumeLiters")} L` : "Maße privat ergänzen"} · aktualisiert {new Date(record.updatedAt).toLocaleDateString("de-DE")}</small>{selectedHabitatId === record.id ? <Check size={17} /> : null}</button>)}</div> : <div className="habitat-builder-empty"><Fish size={19} /><p>Noch kein {labelFor(kind)} im Profil. Du kannst einen Maßentwurf beginnen oder zuerst eine Anlage anlegen.</p><Link className="secondary-action" href="/profile#habitats">Im Profil anlegen</Link></div>}
      <button type="button" className="habitat-manual-button" onClick={startManualPlan}><Ruler size={16} />Mit eigenen Maßen starten</button>
    </section>

    <section className="habitat-builder-stage glass-panel">
      <div className="habitat-canvas-shell" style={{ backgroundImage: `linear-gradient(180deg, rgba(1,9,6,.04), rgba(1,9,6,.82)), url(${BUILDER_ASSETS[kind]})` }}>
        <HabitatCanvas habitat={kind} dimensions={dimensions} referenceImage={BUILDER_ASSETS[kind]} />
        <div className="habitat-canvas-shell__status"><span><Ruler size={14} />INTERAKTIVE GLAS- & MASSANSICHT</span><span><ShieldCheck size={14} />PBR-ASSETS ERST NACH FREIGABE</span></div>
        <div className="habitat-canvas-shell__copy"><p>[FOTOREALISTISCHE REFERENZ · MASSSTAB]</p><h2>{kind === "aquarium" ? "Schwarzwasser-Habitat" : "Regenwald-Habitat"}</h2><span>Zum Prüfen drehen und zoomen. Bei schwacher Grafik bleibt die Referenzansicht nutzbar.</span></div>
      </div>
      <div className="habitat-measurements"><div><span className="eyebrow">[02 · INNENMASSE]</span><h2>Raum verständlich erfassen.</h2></div><div className="habitat-measurement-grid">{(["lengthCm", "widthCm", "heightCm"] as const).map((field, index) => <label key={field}><span>{["Länge", "Breite", "Höhe"][index]} · cm</span><input inputMode="decimal" value={displayDimension(dimensions[field])} placeholder="offen" onChange={event => setDimension(field, event.target.value)} /></label>)}</div><div className="habitat-calculated-value"><span>{kind === "aquarium" ? "BRUTTOVOLUMEN" : "INNENHÖHE"}</span><strong>{kind === "aquarium" ? (volume === null ? "—" : `${volume} L`) : (dimensions.heightCm === null ? "—" : `${dimensions.heightCm} cm`)}</strong><small>{selectedHabitat ? `Basis: ${selectedHabitat.name}` : "Manueller Entwurf"}</small></div></div>
    </section>

    <section className="habitat-builder-panels">
      <section className="habitat-elements"><div className="habitat-builder-source__heading"><span className="eyebrow">[03 · WAHLBEREICHE]</span><h2>Schicht für Schicht planen.</h2></div><div className="habitat-element-grid">{actionElements.map(item => { const Icon = item.icon; const active = elements.includes(item.id); return <button type="button" key={item.id} onClick={() => toggleElement(item.id)} className={`habitat-element ${active ? "is-selected" : ""}`}><span><Icon size={18} /></span><strong>{item.label}</strong><small>{item.description}</small><i>{active ? <Check size={14} /> : "+"}</i></button>; })}</div></section>
      <aside className="habitat-safety-gate"><span className="eyebrow">[SICHERHEITS-GATE]</span><h2>Grundlagen sichtbar machen.</h2><GateRow icon={Ruler} title="Innenmaße" ready={fullDimensions} copy={fullDimensions ? "Maße sind als Grundlage für den Entwurf erfasst." : "Vollständige Innenmaße fehlen noch."} /><GateRow icon={MapPin} title="Standort" ready={placementChecked} copy={placementChecked ? "Eine persönliche Vorprüfung wurde bestätigt." : "Tragfähigkeit, Strom, Wartungszugang und Sicherheit prüfen."} /><GateRow icon={PackageCheck} title="Struktur" ready={elements.length >= 3} copy={`${elements.length} Wahlbereiche sind im Entwurf markiert.`} /><label className="habitat-placement-check"><input type="checkbox" checked={placementChecked} onChange={event => setPlacementChecked(event.target.checked)} /><span>Ich prüfe Standort, sichere Kabelführung, Wartungszugang und – beim Terrarium – Entweichschutz vor dem Aufbau.</span></label><div className="habitat-safety-gate__notice"><AlertTriangle size={17} /><p>Der Builder erteilt keine Haltungs-, Gesundheits-, Kauf-, Statik- oder Elektrofreigabe.</p></div></aside>
    </section>

    <section className="habitat-builder-actions glass-panel"><div><span className="eyebrow">[04 · ENTWURF]</span><h2>Entwurf kontrolliert weitergeben.</h2><p>Lokale Varianten bleiben auf diesem Gerät. Der Export enthält nur die von dir gewählten Planungsdaten.</p></div><div><button type="button" className="secondary-action" onClick={storePlan}><Save size={16} />Lokal speichern</button><button type="button" className="primary-action" onClick={exportPlan}><CloudDownload size={16} />Plan exportieren</button></div>{notice ? <p className="form-status" role="status">{notice}</p> : null}</section>

    <section className="habitat-local-plans"><div className="habitat-builder-source__heading"><span className="eyebrow">[LOKAL / VARIANTEN]</span><h2>Deine gespeicherten Entwürfe</h2></div>{plans.length ? <div className="habitat-local-plan-grid">{plans.map(plan => <article key={plan.id}><span>{plan.habitat === "aquarium" ? <Fish size={17} /> : <Box size={17} />}</span><strong>{plan.habitatName ?? `${labelFor(plan.habitat)} · eigener Entwurf`}</strong><p>{plan.dimensions.lengthCm ?? "—"} × {plan.dimensions.widthCm ?? "—"} × {plan.dimensions.heightCm ?? "—"} cm · {plan.elements.length} Wahlbereiche</p><small>{new Date(plan.createdAt).toLocaleString("de-DE")}</small><button type="button" aria-label="Lokalen Entwurf entfernen" onClick={() => { const next = plans.filter(item => item.id !== plan.id); setPlans(next); window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }}><X size={15} /></button></article>)}</div> : <div className="habitat-builder-empty"><ClipboardCheck size={19} /><p>Auf diesem Gerät ist noch kein Entwurf gespeichert.</p></div>}</section>
  </div>;
}

function GateRow({ icon: Icon, title, ready, copy }: { icon: typeof Ruler; title: string; ready: boolean; copy: string }) {
  return <div className="habitat-gate-row"><span className={ready ? "is-ready" : ""}><Icon size={16} /></span><div><strong>{title}</strong><p>{copy}</p></div><i className={ready ? "is-ready" : ""}>{ready ? "erfasst" : "offen"}</i></div>;
}
