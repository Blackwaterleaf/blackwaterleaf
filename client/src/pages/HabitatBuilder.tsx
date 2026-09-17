import { useAuth } from "@/_core/hooks/useAuth";
import { HabitatCanvas } from "@/components/HabitatCanvas";
import { ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { startLogin } from "@/const";
import { createBuilderPlacement, dimensionsFromHabitat, displayDimension, grossVolumeLiters, hasCompleteDimensions, MAX_BUILDER_PLACEMENTS, normalizeBuilderPlacement, parseDimension, type BuilderDimensions, type BuilderHabitatKind, type BuilderPlacement, type BuilderPlacementType } from "@/lib/habitatBuilder";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Box, Check, ClipboardCheck, CloudDownload, Fish, Leaf, Loader2, LockKeyhole, MapPin, Move3D, PackageCheck, Ruler, Save, ShieldCheck, SlidersHorizontal, Sprout, Trash2, Waves, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

type HabitatRecord = { id: string; kind: "aquarium" | "plant" | "terrarium"; name: string; details: Record<string, unknown>; updatedAt: string };
type PlanElement = { id: BuilderPlacementType; label: string; description: string; icon: typeof Fish; visualHint: string };
type LocalPlan = { id: string; habitat: BuilderHabitatKind; habitatName: string | null; dimensions: BuilderDimensions; placements: BuilderPlacement[]; createdAt: string };

const BUILDER_ASSETS = { aquarium: "/manus-storage/aquarium-photorealistic-reference_3c93f1e3.png", terrarium: "/manus-storage/terrarium-photorealistic-reference_bcb9db80.png" } as const;
const EMPTY_DIMENSIONS: BuilderDimensions = { lengthCm: null, widthCm: null, heightCm: null };
const STORAGE_KEY = "blackwaterleaf-habitat-builder-v2";

const ELEMENTS: Record<BuilderHabitatKind, PlanElement[]> = {
  aquarium: [
    { id: "hardscape", label: "Hardscape", description: "Stein- oder Wurzelzone als Raumkörper markieren.", icon: PackageCheck, visualHint: "Körper" },
    { id: "leaf-litter", label: "Laubschicht", description: "Biotopstruktur als Bodenzone einzeichnen.", icon: Leaf, visualHint: "Bodenzone" },
    { id: "plants", label: "Bepflanzung", description: "Pflanzgruppe als Platzhalter setzen.", icon: Sprout, visualHint: "Pflanzgruppe" },
    { id: "filter", label: "Filter & Strömung", description: "Technikposition und Wartungszugang markieren.", icon: Waves, visualHint: "Technik" },
  ],
  terrarium: [
    { id: "structure", label: "Kletterstruktur", description: "Ast- oder Felsstruktur als Raumkörper markieren.", icon: PackageCheck, visualHint: "Körper" },
    { id: "substrate", label: "Substrat & Drainage", description: "Boden- und Drainagezone einzeichnen.", icon: Leaf, visualHint: "Bodenzone" },
    { id: "plants", label: "Bepflanzung", description: "Pflanzgruppe als Platzhalter setzen.", icon: Sprout, visualHint: "Pflanzgruppe" },
    { id: "climate", label: "Klimatechnik", description: "Licht, Wärme oder Beregnung positionieren.", icon: Waves, visualHint: "Technik" },
  ],
};

function safeReadPlans(): LocalPlan[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 12) as LocalPlan[] : [];
  } catch { return []; }
}

function labelFor(kind: BuilderHabitatKind) { return kind === "aquarium" ? "Aquarium" : "Terrarium"; }
function numericDetail(details: Record<string, unknown>, field: string): string | null { const value = details[field]; return typeof value === "number" && Number.isFinite(value) ? String(value) : null; }

export default function HabitatBuilder() {
  const auth = useAuth();
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const [kind, setKind] = useState<BuilderHabitatKind>("aquarium");
  const [selectedHabitatId, setSelectedHabitatId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<BuilderDimensions>(EMPTY_DIMENSIONS);
  const [placements, setPlacements] = useState<BuilderPlacement[]>([]);
  const [placementTool, setPlacementTool] = useState<BuilderPlacementType | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [placementChecked, setPlacementChecked] = useState(false);
  const [plans, setPlans] = useState<LocalPlan[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const records = (habitats.data ?? []) as unknown as HabitatRecord[];
  const compatibleHabitat = useMemo(() => records.filter(record => record.kind === kind), [kind, records]);
  const selectedHabitat = compatibleHabitat.find(record => record.id === selectedHabitatId) ?? null;
  const selectedPlacement = placements.find(item => item.id === selectedPlacementId) ?? null;
  const volume = grossVolumeLiters(dimensions);
  const fullDimensions = hasCompleteDimensions(dimensions);
  const actionElements = ELEMENTS[kind];

  useEffect(() => { setPlans(safeReadPlans()); }, []);

  if (!auth.isAuthenticated) return <div className="reference-page reference-page--aquarium habitat-builder-page"><ReferenceHero tone="aquarium" image={REFERENCE_ASSETS.aquarium} eyebrow="AQUARISTIK & TERRARISTIK" title="HABITAT PLANEN" subtitle="Dein Entwurf bleibt an dein sicheres Konto gebunden." icon={Ruler} badge="PRIVATER ENTWURF" /><ReferenceEmptyState tone="aquarium" code="AUTH / REQUIRED" title="DEIN ENTWURF BLEIBT PRIVAT" body="Melde dich an, um deine vorhandenen Aquarien oder Terrarien als Grundlage auszuwählen und Entwürfe lokal zu exportieren." action={<button type="button" className="primary-action" onClick={startLogin}><LockKeyhole size={16} />SICHER ANMELDEN</button>} /></div>;

  const chooseType = (next: BuilderHabitatKind) => {
    setKind(next); setSelectedHabitatId(null); setDimensions(EMPTY_DIMENSIONS); setPlacements([]); setPlacementTool(null); setSelectedPlacementId(null); setPlacementChecked(false); setNotice(null);
  };
  const chooseHabitat = (record: HabitatRecord) => { setSelectedHabitatId(record.id); setDimensions(dimensionsFromHabitat(record.details)); setPlacements([]); setSelectedPlacementId(null); setPlacementChecked(false); setNotice(`„${record.name}“ ist als private Grundlage gewählt.`); };
  const startManualPlan = () => { setSelectedHabitatId(null); setDimensions(EMPTY_DIMENSIONS); setPlacements([]); setSelectedPlacementId(null); setPlacementChecked(false); setNotice("Neuer Entwurf: Maße und Objekte werden nur in diesem Browser verwendet, bis du ihn exportierst."); };
  const setDimension = (field: keyof BuilderDimensions, value: string) => setDimensions(current => ({ ...current, [field]: parseDimension(value) }));

  const activateTool = (tool: BuilderPlacementType) => {
    if (placements.length >= MAX_BUILDER_PLACEMENTS) { setNotice(`Maximal ${MAX_BUILDER_PLACEMENTS} Entwurfselemente pro Variante. Bitte entferne zuerst ein Element.`); return; }
    setPlacementTool(current => current === tool ? null : tool); setSelectedPlacementId(null);
    const label = actionElements.find(item => item.id === tool)?.label ?? "Element";
    setNotice(`${label} aktiv: Tippe oder klicke auf die Bodenfläche der Glasansicht, um es zu platzieren.`);
  };
  const placeElement = (xPct: number, zPct: number) => {
    if (!placementTool) return;
    if (placements.length >= MAX_BUILDER_PLACEMENTS) { setPlacementTool(null); setNotice(`Maximal ${MAX_BUILDER_PLACEMENTS} Entwurfselemente erreicht.`); return; }
    const placement = createBuilderPlacement(globalThis.crypto?.randomUUID?.() ?? `placement-${Date.now()}`, placementTool, xPct, zPct);
    setPlacements(current => [...current, placement]); setSelectedPlacementId(placement.id); setPlacementTool(null);
    setNotice(`${actionElements.find(item => item.id === placement.type)?.label ?? "Element"} wurde als Planungsplatzhalter eingefügt.`);
  };
  const updateSelectedPlacement = (patch: Partial<Pick<BuilderPlacement, "rotationDeg" | "scale" | "xPct" | "zPct">>) => {
    if (!selectedPlacementId) return;
    setPlacements(current => current.map(item => item.id === selectedPlacementId ? normalizeBuilderPlacement({ ...item, ...patch }) : item));
  };
  const removeSelectedPlacement = () => {
    if (!selectedPlacementId) return;
    setPlacements(current => current.filter(item => item.id !== selectedPlacementId)); setSelectedPlacementId(null); setNotice("Planungselement entfernt.");
  };

  const storePlan = () => {
    const plan: LocalPlan = { id: globalThis.crypto?.randomUUID?.() ?? `plan-${Date.now()}`, habitat: kind, habitatName: selectedHabitat?.name ?? null, dimensions, placements, createdAt: new Date().toISOString() };
    const next = [plan, ...plans].slice(0, 12); setPlans(next); window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setNotice("Entwurf auf diesem Gerät gespeichert.");
  };
  const exportPlan = () => {
    const payload = { version: "BlackWaterLeaf Habitat Builder · 2", createdAt: new Date().toISOString(), habitat: kind, privateHabitat: selectedHabitat ? { id: selectedHabitat.id, name: selectedHabitat.name } : null, dimensionsCm: dimensions, calculatedGrossVolumeLiters: kind === "aquarium" ? volume : null, placements: placements.map(item => ({ ...item, label: actionElements.find(element => element.id === item.type)?.label ?? item.type })), placementCheckConfirmed: placementChecked, scope: "Planungsentwurf ohne Haltungs-, Diagnose-, Kauf-, Statik- oder Elektrofreigabe." };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `blackwaterleaf-${kind}-entwurf.json`; anchor.click(); URL.revokeObjectURL(url); setNotice("Plan als JSON exportiert.");
  };


  return <div className={`reference-page reference-page--${kind} habitat-builder-page`}>
    <ReferenceHero tone={kind} image={kind === "aquarium" ? REFERENCE_ASSETS.aquarium : REFERENCE_ASSETS.terrarium} eyebrow="AQUARISTIK & TERRARISTIK" title="HABITAT PLANEN" subtitle="Objekte platzieren, räumlich prüfen und sicher exportieren." icon={Ruler} badge="PRIVATER ENTWURF" />
    <section className="habitat-builder-intro glass-panel"><div><span className="eyebrow">[01 · GRUNDLAGE]</span><h2>Wähle deine Welt.</h2><p>Der Entwurf verwendet ausschließlich deine privaten Anlagen oder manuelle Maße. Platzierte Körper sind bewusst abstrakte Planungsmarker, keine Arten-, Produkt- oder PBR-Bibliothek.</p></div><div className="habitat-type-control" role="group" aria-label="Habitat-Typ wählen"><button type="button" className={kind === "aquarium" ? "active" : ""} onClick={() => chooseType("aquarium")}><Fish size={17} />Aquarium</button><button type="button" className={kind === "terrarium" ? "active" : ""} onClick={() => chooseType("terrarium")}><Box size={17} />Terrarium</button></div></section>
    <section className="habitat-builder-source"><div className="habitat-builder-source__heading"><span className="eyebrow">[PRIVATE / AUSWAHL]</span><h2>Bestehende Anlage nutzen</h2></div>{compatibleHabitat.length ? <div className="habitat-source-grid">{compatibleHabitat.map(record => <button key={record.id} type="button" onClick={() => chooseHabitat(record)} className={`habitat-source-card ${selectedHabitatId === record.id ? "is-selected" : ""}`}><span>{kind === "aquarium" ? <Fish size={18} /> : <Box size={18} />}</span><strong>{record.name}</strong><small>{numericDetail(record.details, "volumeLiters") ? `${numericDetail(record.details, "volumeLiters")} L` : "Maße privat ergänzen"} · aktualisiert {new Date(record.updatedAt).toLocaleDateString("de-DE")}</small>{selectedHabitatId === record.id ? <Check size={17} /> : null}</button>)}</div> : <div className="habitat-builder-empty"><Fish size={19} /><p>Noch kein {labelFor(kind)} im Profil. Du kannst einen Maßentwurf beginnen oder zuerst eine Anlage anlegen.</p><Link className="secondary-action" href="/profile#habitats">Im Profil anlegen</Link></div>}<button type="button" className="habitat-manual-button" onClick={startManualPlan}><Ruler size={16} />Mit eigenen Maßen starten</button></section>
    <section className="habitat-builder-stage glass-panel"><div className={`habitat-canvas-shell ${placementTool ? "is-placement-mode" : ""}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(1,9,6,.04), rgba(1,9,6,.82)), url(${BUILDER_ASSETS[kind]})` }}><HabitatCanvas habitat={kind} dimensions={dimensions} referenceImage={BUILDER_ASSETS[kind]} placements={placements} selectedPlacementId={selectedPlacementId} placementTool={placementTool} onPlace={placeElement} onSelect={setSelectedPlacementId} /><div className="habitat-canvas-shell__status"><span><Move3D size={14} />{placementTool ? "PLATZIERMODUS · BODENFLÄCHE WÄHLEN" : "OBJEKT WÄHLEN · ANSICHT DREHEN"}</span><span><ShieldCheck size={14} />ABSTRAKTE PLANUNGSMARKER</span></div><div className="habitat-canvas-shell__copy"><p>[FOTOREALISTISCHE REFERENZ · PLANUNG]</p><h2>{kind === "aquarium" ? "Schwarzwasser-Habitat" : "Regenwald-Habitat"}</h2><span>{placements.length} von {MAX_BUILDER_PLACEMENTS} Entwurfselementen · {placementTool ? "Tippe oder klicke auf die Bodenfläche, um das aktive Werkzeug einzubauen." : "Wähle ein Objekt für Details oder aktiviere ein Werkzeug."}</span></div></div><div className="habitat-interaction-bar"><div><strong>{placementTool ? `${actionElements.find(item => item.id === placementTool)?.label ?? "Element"} ist aktiv` : "Ansicht & Auswahl aktiv"}</strong><span>{placementTool ? "Bodenfläche antippen/klicken oder zentriert einfügen." : "Drehen zum Prüfen; Marker anklicken zum Bearbeiten."}</span></div>{placementTool ? <><button type="button" className="habitat-place-center" onClick={() => placeElement(0, 0)}><Move3D size={15} />Zentriert einfügen</button><button type="button" className="habitat-cancel-tool" onClick={() => { setPlacementTool(null); setNotice("Platziermodus beendet. Die Ansicht kann wieder gedreht werden."); }}>Abbrechen</button></> : null}</div><div className="habitat-measurements"><div><span className="eyebrow">[02 · INNENMASSE]</span><h2>Raum verständlich erfassen.</h2></div><div className="habitat-measurement-grid">{(["lengthCm", "widthCm", "heightCm"] as const).map((field, index) => <label key={field}><span>{["Länge", "Breite", "Höhe"][index]} · cm</span><input inputMode="decimal" value={displayDimension(dimensions[field])} placeholder="offen" onChange={event => setDimension(field, event.target.value)} /></label>)}</div><div className="habitat-calculated-value"><span>{kind === "aquarium" ? "BRUTTOVOLUMEN" : "INNENHÖHE"}</span><strong>{kind === "aquarium" ? (volume === null ? "—" : `${volume} L`) : (dimensions.heightCm === null ? "—" : `${dimensions.heightCm} cm`)}</strong><small>{selectedHabitat ? `Basis: ${selectedHabitat.name}` : "Manueller Entwurf"}</small></div></div></section>
    <section className="habitat-builder-panels"><section className="habitat-elements"><div className="habitat-builder-source__heading"><span className="eyebrow">[03 · OBJEKTWERKZEUGE]</span><h2>Einbauen statt nur drehen.</h2></div><p className="habitat-workspace-note">Werkzeug auswählen, auf die Bodenfläche klicken und den Marker danach anklicken, um ihn zu bearbeiten.</p><div className="habitat-element-grid">{actionElements.map(item => { const Icon = item.icon; const active = placementTool === item.id; return <button type="button" key={item.id} onClick={() => activateTool(item.id)} className={`habitat-element ${active ? "is-selected" : ""}`}><span><Icon size={18} /></span><strong>{item.label}</strong><small>{item.description}</small><em>{item.visualHint}</em><i>{active ? <Check size={14} /> : "+"}</i></button>; })}</div></section><PlacementInspector placement={selectedPlacement} label={selectedPlacement ? actionElements.find(item => item.id === selectedPlacement.type)?.label ?? selectedPlacement.type : null} onChange={updateSelectedPlacement} onRemove={removeSelectedPlacement} /></section>
    <section className="habitat-safety-gate habitat-safety-gate--wide"><span className="eyebrow">[SICHERHEITS-GATE]</span><h2>Grundlagen sichtbar machen.</h2><GateRow icon={Ruler} title="Innenmaße" ready={fullDimensions} copy={fullDimensions ? "Maße sind als Grundlage für den Entwurf erfasst." : "Vollständige Innenmaße fehlen noch."} /><GateRow icon={MapPin} title="Standort" ready={placementChecked} copy={placementChecked ? "Eine persönliche Vorprüfung wurde bestätigt." : "Tragfähigkeit, Strom, Wartungszugang und Sicherheit prüfen."} /><GateRow icon={PackageCheck} title="Planungsmarker" ready={placements.length > 0} copy={placements.length ? `${placements.length} abstrakte Entwurfselemente platziert.` : "Noch kein Element platziert."} /><label className="habitat-placement-check"><input type="checkbox" checked={placementChecked} onChange={event => setPlacementChecked(event.target.checked)} /><span>Ich prüfe Standort, sichere Kabelführung, Wartungszugang und – beim Terrarium – Entweichschutz vor dem Aufbau.</span></label><div className="habitat-safety-gate__notice"><AlertTriangle size={17} /><p>Der Builder erteilt keine Haltungs-, Gesundheits-, Kauf-, Statik- oder Elektrofreigabe. Marker ersetzen keine reale Art-, Material- oder Aufbauprüfung.</p></div></section>
    <section className="habitat-builder-actions glass-panel"><div><span className="eyebrow">[04 · ENTWURF]</span><h2>Entwurf kontrolliert weitergeben.</h2><p>Lokale Varianten enthalten Maße, Objektpositionen und Marker-Einstellungen. Sie werden nicht automatisch veröffentlicht oder bestellt.</p></div><div><button type="button" className="secondary-action" onClick={storePlan}><Save size={16} />Lokal speichern</button><button type="button" className="primary-action" onClick={exportPlan}><CloudDownload size={16} />Plan exportieren</button></div>{notice ? <p className="form-status" role="status">{notice}</p> : null}</section>
    <section className="habitat-local-plans"><div className="habitat-builder-source__heading"><span className="eyebrow">[LOKAL / VARIANTEN]</span><h2>Deine gespeicherten Entwürfe</h2></div>{plans.length ? <div className="habitat-local-plan-grid">{plans.map(plan => <article key={plan.id}><span>{plan.habitat === "aquarium" ? <Fish size={17} /> : <Box size={17} />}</span><strong>{plan.habitatName ?? `${labelFor(plan.habitat)} · eigener Entwurf`}</strong><p>{plan.dimensions.lengthCm ?? "—"} × {plan.dimensions.widthCm ?? "—"} × {plan.dimensions.heightCm ?? "—"} cm · {plan.placements.length} Marker</p><small>{new Date(plan.createdAt).toLocaleString("de-DE")}</small><button type="button" aria-label="Lokalen Entwurf entfernen" onClick={() => { const next = plans.filter(item => item.id !== plan.id); setPlans(next); window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }}><X size={15} /></button></article>)}</div> : <div className="habitat-builder-empty"><ClipboardCheck size={19} /><p>Auf diesem Gerät ist noch kein Entwurf gespeichert.</p></div>}</section>
  </div>;
}

function PlacementInspector({ placement, label, onChange, onRemove }: { placement: BuilderPlacement | null; label: string | null; onChange: (patch: Partial<Pick<BuilderPlacement, "rotationDeg" | "scale" | "xPct" | "zPct">>) => void; onRemove: () => void }) {
  if (!placement) return <aside className="habitat-inspector"><span className="eyebrow">[OBJEKT / INSPEKTOR]</span><h2>Marker auswählen.</h2><p>Wähle ein platziertes Element in der Glasansicht, um Position, Drehung, Größe oder Entfernung zu bearbeiten.</p><div className="habitat-inspector__empty"><SlidersHorizontal size={19} />Kein Element ausgewählt</div></aside>;
  return <aside className="habitat-inspector"><span className="eyebrow">[OBJEKT / INSPEKTOR]</span><h2>{label}</h2><p>Abstrakter Planungsmarker – keine Produkt- oder Sicherheitsfreigabe.</p><div className="habitat-inspector-grid"><InspectorRange label="Links · rechts" value={placement.xPct} min={-92} max={92} unit="%" onChange={xPct => onChange({ xPct })} /><InspectorRange label="Vorne · hinten" value={placement.zPct} min={-92} max={92} unit="%" onChange={zPct => onChange({ zPct })} /><InspectorRange label="Drehung" value={placement.rotationDeg} min={-180} max={180} unit="°" onChange={rotationDeg => onChange({ rotationDeg })} /><InspectorRange label="Größe" value={placement.scale} min={.5} max={1.8} step={.1} unit="×" onChange={scale => onChange({ scale })} /></div><button type="button" className="habitat-delete-placement" onClick={onRemove}><Trash2 size={15} />Marker entfernen</button></aside>;
}
function InspectorRange({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (value: number) => void }) { return <label className="habitat-inspector-range"><span>{label}<strong>{value}{unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /></label>; }
function GateRow({ icon: Icon, title, ready, copy }: { icon: typeof Ruler; title: string; ready: boolean; copy: string }) { return <div className="habitat-gate-row"><span className={ready ? "is-ready" : ""}><Icon size={16} /></span><div><strong>{title}</strong><p>{copy}</p></div><i className={ready ? "is-ready" : ""}>{ready ? "erfasst" : "offen"}</i></div>; }
